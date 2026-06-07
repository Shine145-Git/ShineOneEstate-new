const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const SiteContent = require("./schema"); // adjust if path different

dotenv.config({ path: "./.env" });

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Error:", err));

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
  origin: true,
  methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
}));

app.use(express.json());

const upload = multer({ dest: "uploads/" });

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});


/* ================= ROUTES & CONTROLLERS ================= */

app.get("/ping", async (req, res) => {
  return res.status(200).send("working");
});

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

    // 🔥 SAVE TO MONGODB
    const folderLower = (req.body.folder || "general").toLowerCase();

    let site = await SiteContent.findOne();
    if (!site) {
      site = new SiteContent({ sectors: [] });
    }

    let sectorIndex = site.sectors.findIndex(
      s => s.name.toLowerCase() === folderLower
    );

    let sector;

    if (sectorIndex === -1) {
      site.sectors.push({
        name: folderLower,
        displayName: folderLower.toUpperCase(),
        media: [],
      });
      sector = site.sectors[site.sectors.length - 1]; // ✅ proper reference
    } else {
      sector = site.sectors[sectorIndex];
    }

    response.forEach(file => {
      sector.media.push({
        url: file.url,
        public_id: file.public_id,
        source: "cloud",
        type: file.resource_type === "video" ? "video" : "image"
      });
    });

    site.markModified("sectors"); // ✅ ensure mongoose tracks nested change

    await site.save();

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

    const site = await SiteContent.findOne();

    if (!site) {
      return res.json({ success: true, resources: [] });
    }

    const sector = site.sectors.find(s => s.name.toLowerCase() === folder);

    if (!sector) {
      return res.json({ success: true, resources: [] });
    }

    return res.json({
      success: true,
      resources: sector.media
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
const PORT = process.env.PORT || 1000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
