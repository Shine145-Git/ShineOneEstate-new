// @desc Get all properties owned by the logged-in user
// @route GET /api/properties/my
// @access Private (owner only)
const SearchHistory = require("../models/SearchHistory.model.js");
const RentalProperty = require("../models/Rentalproperty.model.js");


const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const excelStorage = multer.memoryStorage();
const excelUpload = multer({ storage: excelStorage });
const xlsx = require("xlsx");
const getMyProperties = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized: User not logged in" });
    }
    const myProperties = await Property.find({ owner: req.user._id });
    res.status(200).json(myProperties);
  } catch (error) {
    res.status(500).json({
      message: "Server error while fetching user's properties",
      error: error.message,
    });
  }
};


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
    const Rentalproperty = new RentalProperty(propertyData);
    const savedProperty = await Rentalproperty.save();

    res.status(201).json({
      message: "Property created successfully",
      property: savedProperty,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while creating property",
      error: error.message,
    });
  }
};

// @desc Bulk upload properties from Excel file
// @route POST /api/properties/bulk-upload
// @access Private (owner only)
const bulkUploadProperties = async (req, res) => {
  try {
    const ownerId = req.user?._id || req.user?.id;
    if (!ownerId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Owner ID not found" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const propertiesData = xlsx.utils.sheet_to_json(worksheet);

    if (!propertiesData.length) {
      return res.status(400).json({ message: "Excel file is empty" });
    }

    // Add owner to each property data
    const propertiesToInsert = propertiesData.map((data) => ({
      ...data,
      owner: ownerId,
    }));

    const insertedProperties = await RentalProperty.insertMany(propertiesToInsert);

    res.status(201).json({
      message: "Bulk properties uploaded successfully",
      count: insertedProperties.length,
      properties: insertedProperties,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while bulk uploading properties",
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
  bulkUploadProperties,
  getMyProperties,
};
