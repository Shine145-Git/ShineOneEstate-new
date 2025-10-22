const mongoose = require("mongoose");

const EnquirySchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, required: true }, // reference
  propertyType: { type: String, enum: ["rental", "sale"], required: true }, // track which model
  propertyAddress: { type: String, required: true }, // store essential info
  propertyPrice: { type: Number, required: true },   // store essential info
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userEmail: { type: String, required: true },
  userMobile: { type: String, required: true },
  message: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Enquiry", EnquirySchema);