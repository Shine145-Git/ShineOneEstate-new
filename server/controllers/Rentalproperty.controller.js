// ==========================================
// Rental Property Controller
// Handles creation, retrieval, and management of rental properties,
// including normalization of data and integration with Cloudinary.
// ==========================================

// ==============================
// Imports
// ==============================
const SearchHistory = require("../models/SearchHistory.model.js");
const RentalProperty = require("../models/Rentalproperty.model.js");
const Sector = require("../models/Sector.model.js");

const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const xlsx = require("xlsx");

// Multer setup for Excel file uploads (if needed)
const excelStorage = multer.memoryStorage();
const excelUpload = multer({ storage: excelStorage });

// ==============================
// Cloudinary Configuration
// ==============================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ==============================
// 🔹 createRentalProperty
// ==============================
const createRentalProperty = async (req, res) => {
  try {
    // ------------------------------
    // Extract owner ID from authenticated user
    // ------------------------------
    const ownerId = req.user?._id || req.user?.id;
    if (!ownerId) {
      return res.status(401).json({ message: "Unauthorized: Owner ID not found" });
    }

    // ------------------------------
    // Initialize images array for uploaded files
    // ------------------------------
    let images = [];

    // ------------------------------
    // Upload images to Cloudinary if files exist
    // ------------------------------
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "properties",
        });
        images.push(result.secure_url);
      }
    }

    // ------------------------------
    // Prepare property data with owner and images
    // ------------------------------
    const propertyData = { ...req.body, owner: ownerId, images };

    // ------------------------------
    // Normalize totalArea object with sqft and configuration
    // Handles dotted keys and multiple input variants
    // ------------------------------
    propertyData.totalArea = {
      sqft:
        Number(req.body.totalAreaSqft) ||
        Number(req.body.totalArea?.sqft) ||
        Number(req.body["totalArea.sqft"]) ||
        0,
      configuration:
        req.body.totalAreaConfiguration?.trim() ||
        req.body.totalArea?.configuration?.trim() ||
        req.body["totalArea.configuration"]?.trim() ||
        "",
    };

    // ------------------------------
    // Normalize configuration string (e.g., "3 BHK", "2bhk", etc.)
    // ------------------------------
    if (propertyData.totalArea.configuration) {
      let rawConfig = propertyData.totalArea.configuration.trim().toLowerCase();

      // Match variants like "3bhk", "3 bhk", etc.
      const bhkMatch = rawConfig.match(/(\d+)\s*bhk/);
      const normalizedConfig = bhkMatch ? `${bhkMatch[1]} BHK` : rawConfig.toUpperCase();

      propertyData.totalArea.configuration = normalizedConfig;
      // console.log("✅ Normalized Configuration ->", normalizedConfig);
    }

    // ------------------------------
    // Normalize Sector field (handles variants like "sect 46", "sector46", "sec-46", "46", etc.)
    // ------------------------------
    if (propertyData.Sector) {
      const formattedSector = propertyData.Sector
        .trim()
        .replace(/[^a-zA-Z0-9]/g, " ")
        .replace(/\s+/g, " ")
        .toLowerCase();

      let cleanSector = null;

      const match = formattedSector.match(/sector\s*(\d+)/);
      if (match) {
        cleanSector = `Sector-${match[1]}`;
      } else if (/^\d+$/.test(formattedSector)) {
        cleanSector = `Sector-${formattedSector}`;
      } else {
        const firstNum = formattedSector.match(/\d+/);
        if (firstNum) {
          cleanSector = `Sector-${firstNum[0]}`;
        } else if (formattedSector.startsWith("sec")) {
          const num = formattedSector.replace("sec", "").trim();
          cleanSector = num ? `Sector-${num}` : "Sector-Unknown";
        } else {
          cleanSector =
            formattedSector.charAt(0).toUpperCase() + formattedSector.slice(1);
        }
      }

      console.log("✅ Normalized Sector ->", cleanSector);

      // ------------------------------
      // Save or update Sector collection with configurations
      // ------------------------------
      const existingSector = await Sector.findOne({
        name: { $regex: new RegExp(`^${cleanSector}$`, "i") },
      });

      if (existingSector) {
        if (propertyData.totalArea?.configuration) {
          const configValue = propertyData.totalArea.configuration.trim().toUpperCase();
          if (!existingSector.configurations?.includes(configValue)) {
            existingSector.configurations = existingSector.configurations || [];
            existingSector.configurations.push(configValue);
            await existingSector.save();
          }
        }
      } else {
        const newSector = new Sector({
          name: cleanSector,
          configurations: propertyData.totalArea?.configuration
            ? [propertyData.totalArea.configuration.trim().toUpperCase()]
            : [],
        });
        await newSector.save();
      }

      propertyData.Sector = cleanSector; // ensure normalized value is saved
    }

    // ------------------------------
    // Create new RentalProperty document and save
    // ------------------------------
    const Rentalproperty = new RentalProperty(propertyData);
    const savedProperty = await Rentalproperty.save();

    // ------------------------------
    // Respond with success and saved property
    // ------------------------------
    res.status(201).json({
      message: "Property created successfully",
      property: savedProperty,
    });

  } catch (error) {
    console.error("❌ Property creation error:", error);
    res.status(500).json({
      message: "Server error while creating property",
      error: error.message,
    });
  }
};

// ==============================
// 🔹 getAllProperties
// ==============================
const getAllRentalProperties = async (req, res) => {
  try {
    // ------------------------------
    // Fetch all properties with populated owner details (name, email)
    // ------------------------------
    const properties = await RentalProperty.find().populate("owner", "name email");

    // ------------------------------
    // Respond with properties array
    // ------------------------------
    res.status(200).json(properties);

  } catch (error) {
    res.status(500).json({
      message: "Server error while fetching properties",
      error: error.message,
    });
  }
};

// ==============================
// Module Exports
// ==============================
module.exports = {
  createRentalProperty,
  getAllRentalProperties,
};
