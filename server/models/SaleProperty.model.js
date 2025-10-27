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
  area: {
    type: Number
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
  Sector: { type: String },
  images: [String],
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