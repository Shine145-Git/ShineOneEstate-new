// Model For renting the Property
const mongoose = require("mongoose");

const RentalpropertySchema = new mongoose.Schema(
  {
    // Section 1: Property Basics & Specifications
    address: { type: String },
    Sector: { type: String },
    propertyType: {
      type: String,
      enum: ["house", "apartment", "condo", "townhouse", "villa"],
    },
    purpose: { type: String },
    bedrooms: { type: Number },
    bathrooms: { type: Number },
    totalArea: {
      sqft: { type: Number }, // Numeric area, e.g., 1200
      configuration: { type: String }, // e.g., "3 BHK"
    },
    layoutFeatures: { type: String },
    appliances: [{ type: String }],
    conditionAge: { type: String },
    renovations: { type: String },
    parking: { type: String },
    outdoorSpace: { type: String },

    // Section 2: Financial & Lease Terms
    monthlyRent: { type: Number },
    leaseTerm: { type: String },
    securityDeposit: { type: String },
    otherFees: { type: String },
    utilities: [{ type: String }],
    tenantRequirements: { type: String },
    moveInDate: { type: Date },

    // Section 3: Location & Amenities
    neighborhoodVibe: { type: String },
    transportation: { type: String },
    localAmenities: { type: String },
    communityFeatures: [{ type: String }],

    // Section 4: Policies & Logistics
    petPolicy: { type: String },
    smokingPolicy: { type: String },
    maintenance: { type: String },
    insurance: { type: String },

    // Image upload
    images: [{ type: String }],

    // Ownership info
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const RentalProperty = mongoose.model("RentalProperty", RentalpropertySchema);

module.exports = RentalProperty;
