// Controller for managing Sale Properties: creation, retrieval, and status toggling.
// Handles image uploads via Cloudinary, sector normalization, and property activation state.

const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const SaleProperty = require('../models/SaleProperty.model.js');
const Sector = require('../models/Sector.model.js');


// ================================
// Create a new Sale Property
// ================================
const createSaleProperty = async (req, res) => {
  try {
    // Destructure request body and extract owner ID
    const {
      title,
      description,
      price,
      bedrooms,
      bathrooms,
      location,
      Sector: sectorRaw,
      "totalArea.sqft": totalAreaSqft,
      "totalArea.configuration": totalAreaConfiguration
    } = req.body;

    const ownerId = req.user?._id || req.user?.id;

    // Step 1: Validate required fields
    if (!title || !price) {
      return res.status(400).json({ message: "Title and Price are required." });
    }

    // Step 2: Handle image uploads or accept image URLs
    let images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "sale-properties",
          });
          images.push(result.secure_url);
        } catch (uploadError) {
          console.error("❌ Cloudinary upload error:", uploadError);
        }
      }
    } else if (req.body.images && Array.isArray(req.body.images)) {
      images = req.body.images;
    }

    // Step 3: Normalize sector input and ensure sector exists in DB
    let normalizedSector = null;
    if (sectorRaw && typeof sectorRaw === "string") {
      const formattedSector = sectorRaw
        .trim()
        .replace(/[^a-zA-Z0-9]/g, " ")
        .replace(/\s+/g, " ")
        .toLowerCase();

      const match = formattedSector.match(/sector\s*(\d+)/);
      if (match) {
        normalizedSector = `Sector-${match[1]}`;
      } else if (/^\d+$/.test(formattedSector)) {
        normalizedSector = `Sector-${formattedSector}`;
      } else if (formattedSector.startsWith("sec")) {
        const num = formattedSector.replace("sec", "").trim();
        normalizedSector = `Sector-${num}`;
      } else {
        normalizedSector =
          formattedSector.charAt(0).toUpperCase() + formattedSector.slice(1);
      }

      // Check if sector exists; create if not
      const existingSector = await Sector.findOne({ name: normalizedSector });
      if (!existingSector) {
        await Sector.create({ name: normalizedSector });
      }
    }

    // Step 4: Normalize totalArea configuration (e.g., "2 BHK", "3 BHK")
    let normalizedConfig;
    if (typeof totalAreaConfiguration === "string" && totalAreaConfiguration.trim()) {
      const numMatch = totalAreaConfiguration.trim().match(/(\d+)/);
      if (numMatch) {
        normalizedConfig = `${numMatch[1]} BHK`;
      } else {
        normalizedConfig = totalAreaConfiguration.trim().toUpperCase();
      }
    }

    const totalArea = {
      sqft: totalAreaSqft ? Number(totalAreaSqft) : undefined,
      configuration: normalizedConfig || undefined,
    };

    // Step 5: Create new SaleProperty document with default isActive = true
    const newProperty = new SaleProperty({
      title,
      description,
      price,
      totalArea,
      bedrooms,
      bathrooms,
      location,
      images,
      ownerId,
      Sector: normalizedSector,
      isActive: true,
    });

    // Step 6: Save property and respond
    const savedProperty = await newProperty.save();
    res.status(201).json(savedProperty);

  } catch (error) {
    res.status(500).json({ message: "Failed to create property", error: error.message });
  }
};


// ================================
// Get all active Sale Properties
// ================================
const getSaleProperties = async (req, res) => {
  try {
    // Step 1: Fetch properties where isActive is true
    const properties = await SaleProperty.find({ isActive: true });
    // Step 2: Respond with retrieved properties
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve properties' });
  }
};


// ================================
// Toggle the isActive status of a Sale Property
// ================================
const toggleSalePropertyStatus = async (req, res) => {
  try {
    // Destructure property ID from request parameters
    const { id } = req.params;

    // Step 1: Find property by ID
    const property = await SaleProperty.findById(id);
    if (!property) return res.status(404).json({ message: "Property not found" });

    // Step 2: Toggle isActive flag
    property.isActive = !property.isActive;

    // Step 3: Save updated property
    await property.save();

    // Step 4: Respond with success message and updated property
    res.status(200).json({ message: `Property ${property.isActive ? 'activated' : 'deactivated'} successfully`, property });

  } catch (error) {
    res.status(500).json({ message: "Failed to toggle property status", error: error.message });
  }
};


module.exports = {
  createSaleProperty,
  getSaleProperties,
  toggleSalePropertyStatus,
};
