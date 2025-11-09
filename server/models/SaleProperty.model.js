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
  // 360° panoramic scenes for this property
    panoramas: [
      {
        title: { type: String, required: true, trim: true, maxlength: 120 }, // e.g., "Living Room"
        url: { type: String, required: true, trim: true }, // Cloudinary secure_url
        yaw: { type: Number, default: 0 },
        pitch: { type: Number, default: 0 },
        notes: { type: String, trim: true, maxlength: 500 },
      },
    ],
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