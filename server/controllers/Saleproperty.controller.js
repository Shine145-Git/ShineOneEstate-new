const SaleProperty = require('../models/SaleProperty.model.js');
const Sector = require('../models/Sector.model.js');

const createSaleProperty = async (req, res) => {
  try {
    const { title, description, price, area, bedrooms, bathrooms, location, Sector: sectorRaw } = req.body;
    const ownerId = req.user?._id || req.user?.id;

    if (!title || !price) {
      return res.status(400).json({ message: "Title and Price are required." });
    }

    const images = req.files ? req.files.map(file => file.path) : req.body.images || [];

    // Normalize Sector (if provided) and add to Sector model
    let normalizedSector = sectorRaw;
    if (sectorRaw && typeof sectorRaw === 'string') {
      normalizedSector = sectorRaw.trim().toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
      // Add sector to Sector model if not exists
      await Sector.findOneAndUpdate(
        { name: normalizedSector },
        { name: normalizedSector },
        { upsert: true, new: true }
      );
    }

    const newProperty = new SaleProperty({
      title,
      description,
      price,
      area,
      bedrooms,
      bathrooms,
      location,
      images,
      ownerId,
      Sector: normalizedSector,
    });

    const savedProperty = await newProperty.save();
    res.status(201).json(savedProperty);
  } catch (error) {
    res.status(500).json({ message: "Failed to create property", error: error.message });
  }
};

const getSaleProperties = async (req, res) => {
  try {
    const properties = await SaleProperty.find();
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve properties' });
  }
};

module.exports = {
  createSaleProperty,
  getSaleProperties
};
