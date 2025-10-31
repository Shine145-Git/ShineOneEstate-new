// @desc Get all properties owned by the logged-in user
// @route GET /api/properties/my
// @access Private (owner only)
const SearchHistory = require("../models/SearchHistory.model.js");
const RentalProperty = require("../models/Rentalproperty.model.js");
const Sector = require("../models/Sector.model.js");


const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const excelStorage = multer.memoryStorage();
const excelUpload = multer({ storage: excelStorage });
const xlsx = require("xlsx");





// Configure Cloudinary (ensure your credentials are set in environment variables)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// @desc Create a new property
// @route POST /api/properties
// @access Private (owner only)
const createRentalProperty = async (req, res) => {
  try {
    const ownerId = req.user?._id || req.user?.id;
    if (!ownerId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Owner ID not found" });
    }

    // Upload files to Cloudinary and collect URLs
    let images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "properties",
        });
        images.push(result.secure_url);
      }
    }

    const propertyData = { ...req.body, owner: ownerId, images };

// 🏠 Handle totalArea as an object with sqft and configuration
if (req.body.totalAreaSqft || req.body.totalAreaConfiguration) {
  propertyData.totalArea = {
    sqft: Number(req.body.totalAreaSqft) || 0,
    configuration: req.body.totalAreaConfiguration?.trim() || "",
  };
}

    // 🧩 Extract sector name (e.g., "Sector-9" or "Sector 9") from full string
    if (propertyData.Sector) {
      const sectorRegex = /(sector[-\s]*\d+)/i;
      const match = propertyData.Sector.match(sectorRegex);
      const cleanSector =
        match && match[1]
          ? match[1].replace(/\s+/g, "").replace(/-?(\d+)/, "-$1").toUpperCase()
          : propertyData.Sector.trim();

      // Save or update in Sector collection
      const existingSector = await Sector.findOne({
        name: { $regex: new RegExp(`^${cleanSector}$`, "i") },
      });
      if (!existingSector) {
        await Sector.create({ name: cleanSector });
      }
    }

    const Rentalproperty = new RentalProperty(propertyData);
    const savedProperty = await Rentalproperty.save();

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

// @desc Get all properties with populated owner details
// @route GET /api/properties
// @access Public
const getAllProperties = async (req, res) => {
  try {
    const properties = await RentalProperty.find().populate("owner", "name email");
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({
      message: "Server error while fetching properties",
      error: error.message,
    });
  }
};

// @desc Get a property by ID with populated owner details
// @route GET /api/properties/:id
// @access Public


// @desc Get personalized dashboard for a logged-in user
// @route GET /api/user/dashboard
// @access Private


module.exports = {
  createRentalProperty,
  getAllProperties,
  

};
