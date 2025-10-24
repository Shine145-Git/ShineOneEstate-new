const Property = require("../models/Rentalproperty.model.js");
const SaleProperty = require("../models/SaleProperty.model.js");

// Fetch RentalProperty by ID
const getRentalPropertyById = async (req, res) => {
  try {
    const propertyId = req.params.id;
    const property = await Property.findById(propertyId).populate("owner", "name email");

    if (!property) {
      return res.status(404).json({ message: "Rental property not found" });
    }

    res.status(200).json(property);
  } catch (error) {
    res.status(500).json({
      message: "Server error while fetching rental property",
      error: error.message,
    });
  }
};

// Fetch SaleProperty by ID
const getSalePropertyById = async (req, res) => {
  try {
    const propertyId = req.params.id;
    const property = await SaleProperty.findById(propertyId).populate("ownerId", "name email");

    if (!property) {
      return res.status(404).json({ message: "Sale property not found" });
    }

    res.status(200).json(property);
  } catch (error) {
    res.status(500).json({
      message: "Server error while fetching sale property",
      error: error.message,
    });
  }
};

module.exports = {
  getRentalPropertyById,
  getSalePropertyById,
};