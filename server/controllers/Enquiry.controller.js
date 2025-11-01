// Controller for handling Enquiry-related operations:
// - Creating new enquiries linked to rental or sale properties
// - Retrieving all enquiries in a denormalized format

// Import models
const Enquiry = require("../models/EnquirySchema.model.js");
const RentalProperty = require("../models/Rentalproperty.model.js");
const SaleProperty = require("../models/SaleProperty.model.js");


// ------------------------------
// Create a new Enquiry
// ------------------------------
const createEnquiry = async (req, res) => {
  const { propertyId, message } = req.body;
  const user = req.user;
  console.log("🟢 Enquiry Request Body:", req.body);
  console.log("👤 Authenticated User:", req.user);

  try {
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    let property = await RentalProperty.findById(propertyId);
    let propertyType = "rental";

    if (!property) {
      property = await SaleProperty.findById(propertyId);
      propertyType = "sale";
    }

    // console.log("🏠 Property Found:", property ? true : false, "| Type:", propertyType);

    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    const enquiryData = {
      propertyId: property._id,
      propertyType,
      propertyAddress: property.address || property.title || "N/A",
      propertyPrice: property.monthlyRent || property.price || 0,
      userId: user._id,
      userEmail: user.email,
      userMobile: user.mobileNumber || "N/A",
      message: message || "",
    };

    // console.log("🧾 Enquiry Payload Before Save:", enquiryData);

    const enquiry = new Enquiry(enquiryData);
    await enquiry.save();

    console.log("✅ Enquiry Saved Successfully:", enquiry._id);
    return res.status(201).json({ success: true, enquiry });

  } catch (err) {
    console.error("❌ Enquiry Creation Error:", err.message, err);
    return res.status(500).json({
      success: false,
      message: "Failed to create enquiry",
      error: err.message
    });
  }
};


// ------------------------------
// Retrieve all Enquiries
// ------------------------------
const getEnquiries = async (req, res) => {
  try {
    // Step 1: Fetch all enquiries sorted by creation date descending
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });

    // Step 2: Send success response with enquiries data
    return res.status(200).json({ success: true, enquiries });
  } catch (err) {
    // Handle any unexpected errors
    return res.status(500).json({ success: false, message: "Failed to fetch enquiries" });
  }
};


module.exports = { createEnquiry, getEnquiries };