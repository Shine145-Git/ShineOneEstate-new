const mongoose = require('mongoose');

const SalePropertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  price: {
    type: Number,
    required: true
  },
totalArea: {
      sqft: { type: Number }, // Numeric area, e.g., 1200
      configuration: { type: String }, // e.g., "3 BHK"
    },
  bedrooms: {
    type: Number
  },
  bathrooms: {
    type: Number
  },
  location: {
    type: String
  },
  Sector: { type: String , required: true},
  images: [String],
  // Cloudinary metadata (sticky account + stable folder)
  cloudinaryAccountIndex: { type: Number, default: null },
  cloudinaryFolder: { type: String },
  defaultpropertytype: { type: String, default: "sale", immutable: true },
  ownernumber: { type: String },
  isActive: { type: Boolean, default: true },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const SaleProperty = mongoose.model('SaleProperty', SalePropertySchema);

module.exports = SaleProperty;