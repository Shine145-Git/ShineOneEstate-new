// Controller for handling Enquiry-related operations:
// - Creating new enquiries linked to rental or sale properties
// - Retrieving all enquiries in a denormalized format

// Import models
const Enquiry = require("../models/EnquirySchema.model.js");
const RentalProperty = require("../models/Rentalproperty.model.js");
const SaleProperty = require("../models/SaleProperty.model.js");
const User = require("../models/user.model.js");


// ------------------------------
// Create a new Enquiry
// ------------------------------
const createEnquiry = async (req, res) => {
  const { propertyId, message } = req.body;
  const user = req.user;
  // console.log("🟢 Enquiry Request Body:", req.body);
  // console.log("👤 Authenticated User:", req.user);

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

    console.log("✅ Enquiry Saved Successfully:");
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
    // Pagination params
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    // 1) Count total enquiries for pagination metadata
    const totalEnquiries = await Enquiry.countDocuments();
    if (totalEnquiries === 0) {
      return res.status(200).json({ success: true, page, limit, totalEnquiries, totalPages: 0, enquiries: [] });
    }

    // 2) Fetch paginated enquiries (most recent first)
    const enquiries = await Enquiry.find().sort({ createdAt: -1 }).skip(skip).limit(limit);

    // 3) Collect property IDs by type from the current page
    const rentalIds = [];
    const saleIds = [];
    for (const e of enquiries) {
      if (!e.propertyId) continue;
      if (e.propertyType === 'rental') rentalIds.push(e.propertyId);
      else if (e.propertyType === 'sale') saleIds.push(e.propertyId);
    }

    // 4) Fetch property documents in two batched queries
    const [rentalProps, saleProps] = await Promise.all([
      rentalIds.length ? RentalProperty.find({ _id: { $in: rentalIds } }).lean() : Promise.resolve([]),
      saleIds.length ? SaleProperty.find({ _id: { $in: saleIds } }).lean() : Promise.resolve([]),
    ]);

    // 5) Map properties by id for O(1) lookup
    const rentalMap = new Map(rentalProps.map(p => [p._id.toString(), p]));
    const saleMap = new Map(saleProps.map(p => [p._id.toString(), p]));

    // 6) Collect all unique owner ids from properties
    const ownerIdSet = new Set();
    for (const p of rentalProps) if (p && p.owner) ownerIdSet.add(p.owner.toString());
    for (const p of saleProps) if (p && (p.ownerId || p.owner)) ownerIdSet.add((p.ownerId || p.owner).toString());

    // 7) Fetch owners in a single query (if any)
    let ownerMap = new Map();
    if (ownerIdSet.size) {
      const owners = await User.find({ _id: { $in: [...ownerIdSet] } }).select('_id name email mobileNumber').lean();
      ownerMap = new Map(owners.map(o => [o._id.toString(), o]));
    }

    // 8) Build enriched enquiries array by mapping properties & owners back to enquiries
    const enriched = enquiries.map(enq => {
      const pid = enq.propertyId ? enq.propertyId.toString() : null;
      const prop = enq.propertyType === 'rental' ? rentalMap.get(pid) : saleMap.get(pid);
      const ownerId = prop ? (prop.owner || prop.ownerId || null) : null;
      const owner = ownerId ? ownerMap.get(ownerId.toString()) : null;

      return {
        ...enq.toObject(),
        property: prop || null,
        owner: owner || null,
      };
    });

    // 9) Return enriched results with pagination metadata
    return res.status(200).json({
      success: true,
      page,
      limit,
      totalEnquiries,
      totalPages: Math.ceil(totalEnquiries / limit),
      enquiries: enriched
    });
  } catch (err) {
    console.error('❌ Fetching Enquiries Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch enquiries' });
  }
};
const deleteEnquiry = async (req, res) => {
  try {
    const { enquiryId } = req.params;

    if (!enquiryId) {
      return res.status(400).json({ success: false, message: "Enquiry ID is required" });
    }

    const deleted = await Enquiry.findByIdAndDelete(enquiryId);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Enquiry not found" });
    }

    return res.status(200).json({ success: true, message: "Enquiry deleted successfully" });
  } catch (err) {
    console.error("❌ Delete Enquiry Error:", err);
    return res.status(500).json({ success: false, message: "Failed to delete enquiry", error: err.message });
  }
};


module.exports = { createEnquiry, getEnquiries , deleteEnquiry };