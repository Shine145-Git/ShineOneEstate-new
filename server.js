const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

dotenv.config({ path: "./.env" });

console.log("ENV CHECK:");
console.log("CLOUD_NAME:", process.env.CLOUD_NAME);
console.log("API_KEY:", process.env.API_KEY);
console.log("API_SECRET:", process.env.API_SECRET);

const app = express();
app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.url}`);
  next();
});
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));
app.use(express.json());
app.use("/local", express.static(path.join(__dirname, "src", "data")));

const upload = multer({ dest: "uploads/" });

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});


/* ================= ROUTES & CONTROLLERS ================= */

// Upload single file (image/video)
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    console.log("UPLOAD (single) body:", req.body);
    console.log("UPLOAD (single) file:", req.file && { path: req.file.path, originalname: req.file.originalname });

    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }

    const folder = req.body.folder || "general";

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: `ShineOne/${folder}`,
      resource_type: "auto",
    });

    console.log("CLOUDINARY UPLOAD RESULT (single):", { public_id: result.public_id, resource_type: result.resource_type });

    res.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      resource_type: result.resource_type,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Upload multiple files
app.post("/upload-multiple", upload.array("files", 10), async (req, res) => {
  try {
    console.log("UPLOAD (multiple) body:", req.body);
    console.log("UPLOAD (multiple) files count:", req.files && req.files.length);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: "No files uploaded" });
    }

    if (req.files) {
      req.files.forEach((f, i) => {
        console.log(`FILE[${i}]`, { path: f.path, originalname: f.originalname });
      });
    }

    const folder = req.body.folder || "general";

    const uploads = await Promise.all(
      req.files.map((file) =>
        cloudinary.uploader.upload(file.path, {
          folder: `ShineOne/${folder}`,
          resource_type: "auto",
        })
      )
    );

    console.log("CLOUDINARY UPLOAD RESULT (multiple):", uploads.map(u => ({ public_id: u.public_id, resource_type: u.resource_type })));

    const response = uploads.map((item) => ({
      url: item.secure_url,
      public_id: item.public_id,
      resource_type: item.resource_type,
    }));

    res.json({ success: true, files: response });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get media by folder
app.get("/media/:folder", async (req, res) => {
  try {
    const folder = decodeURIComponent(req.params.folder).toLowerCase();
    console.log("MEDIA REQUEST folder:", folder);

    // 🔵 CLOUDINARY FILES
    const cloudResult = await cloudinary.api.resources({
      type: "upload",
      prefix: `ShineOne/${folder}`,
      max_results: 100,
    });

    const cloudResources = cloudResult.resources || [];

    const taggedCloudResources = cloudResources.map((item) => ({
      ...item,
      source: "cloud",
    }));

    // 🟢 LOCAL FILES (case-insensitive match)
    const basePath = path.join(__dirname, "src", "data");
    let localResources = [];

    if (fs.existsSync(basePath)) {
      const folders = fs.readdirSync(basePath);

      const matchedFolder = folders.find(
        (f) => f.toLowerCase() === folder
      );

      if (matchedFolder) {
        const fullPath = path.join(basePath, matchedFolder);
        const files = fs.readdirSync(fullPath);

        localResources = files.map((file) => ({
          public_id: `local/${matchedFolder}/${file}`,
          resource_type: file.match(/\.(mp4|mov|webm)$/i)
            ? "video"
            : "image",
          secure_url: `http://localhost:1000/local/${matchedFolder}/${file}`,
          format: file.split(".").pop(),
          source: "local",
        }));
      }
    }

    console.log("LOCAL FILES:", localResources.length);
    console.log("CLOUD FILES:", cloudResources.length);

    return res.json({
      success: true,
      resources: [...taggedCloudResources, ...localResources],
    });

  } catch (err) {
    console.error("MEDIA ERROR:", err.message);

    return res.json({
      success: true,
      resources: [],
    });
  }
});

// Delete media
app.delete("/delete/:public_id", async (req, res) => {
  try {
    const publicId = decodeURIComponent(req.params.public_id);
    const source = req.query.source;

    console.log("DELETE REQUEST:", publicId, "SOURCE:", source);

    if (source === "local") {
      const parts = publicId.split("/");
      const folder = parts[1];
      const fileName = parts.slice(2).join("/");

      const filePath = path.join(__dirname, "src", "data", folder, fileName);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return res.json({ success: true, message: "Local file deleted" });
      } else {
        return res.status(404).json({ success: false, error: "File not found" });
      }
    }

    // Default: cloud delete
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "auto",
    });

    return res.json({ success: true, result });

  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Health check
app.get("/", (req, res) => {
  res.send("API running...");
});

app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);
  res.status(500).json({ success: false, error: err.message || "Server error" });
});

// Start server
app.listen(1000, () => {
  console.log("Server running on port 1000");
});