const Enquiry = require("../models/EnquirySchema.model.js");
const RentalProperty = require("../models/Rentalproperty.model.js");
const SaleProperty = require("../models/SaleProperty.model.js");

const createEnquiry = async (req, res) => {
  try {
    const { propertyId, message } = req.body;
    const user = req.user;

    if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });

    // Fetch property from rental first, then sale
    let property = await RentalProperty.findById(propertyId);
    let propertyType = "rental";

    if (!property) {
      property = await SaleProperty.findById(propertyId);
      propertyType = "sale";
    }

    if (!property) return res.status(404).json({ success: false, message: "Property not found" });

    // Save enquiry with denormalized info
    const enquiry = new Enquiry({
      propertyId: property._id,
      propertyType,
      propertyAddress: property.address || property.title,
      propertyPrice: property.monthlyRent || property.price,
      userId: user._id,
      userEmail: user.email,
      userMobile: user.mobileNumber,
      message: message || "",
    });

    await enquiry.save();
    return res.status(201).json({ success: true, enquiry });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to create enquiry" });
  }
};

const getEnquiries = async (req, res) => {
  try {
    // Return denormalized data only, no population
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, enquiries });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch enquiries" });
  }
};

module.exports = { createEnquiry, getEnquiries };