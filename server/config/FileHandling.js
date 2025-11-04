const cloudinary = require("cloudinary").v2;
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.Cloudinary_name,
  api_key: process.env.Cloudinary_api_key,
  api_secret: process.env.Cloudinary_api_secret,
});

const uploadoncloudinary = async (path, sector) => {
  try {
    if (!path) return null;

    // Sanitize sector to make it folder-safe
    const safeSector = sector
      ? sector.replace(/[^a-zA-Z0-9-_]/g, "_").substring(0, 50)
      : "properties";

    // Upload file on Cloudinary with folder option using sector
    const result = await cloudinary.uploader.upload(path, {
      resource_type: "auto",
      folder: `properties/${safeSector}`, // ✅ folder named by sector
    });

    // console.log("✅ File uploaded successfully:", result.secure_url);
    return result;
  } catch (error) {
    console.error("❌ Cloudinary upload failed:", error);
    throw error;
  } finally {
    // Delete temp file after upload attempt
    fs.unlinkSync(path);
  }
};

module.exports = { uploadoncloudinary };