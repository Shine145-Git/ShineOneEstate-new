const SaleProperty = require('../models/SaleProperty.model.js');
const Sector = require('../models/Sector.model.js');

const createSaleProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      totalAreaSqft,
      totalAreaConfiguration,
      bedrooms,
      bathrooms,
      location,
      Sector: sectorRaw
    } = req.body;

    const ownerId = req.user?._id || req.user?.id;

    if (!title || !price) {
      return res.status(400).json({ message: "Title and Price are required." });
    }

    const images = req.files ? req.files.map(file => file.path) : req.body.images || [];

    // Normalize Sector name like "Sector-9"
    let normalizedSector = null;
    if (sectorRaw && typeof sectorRaw === "string") {
      const cleaned = sectorRaw.trim().toLowerCase();
      const match = cleaned.match(/(\d+)/);
      if (match) {
        normalizedSector = `Sector-${match[1]}`;
      } else {
        normalizedSector = cleaned.replace(/\b\w/g, c => c.toUpperCase());
      }

      // Add sector to Sector model if not exists
      await Sector.findOneAndUpdate(
        { name: normalizedSector },
        { name: normalizedSector },
        { upsert: true, new: true }
      );
    }

    // Handle totalArea with both sqft and configuration
    const totalArea = {
      sqft: totalAreaSqft ? Number(totalAreaSqft) : 0,
      configuration: totalAreaConfiguration?.trim() || "",
    };

    const newProperty = new SaleProperty({
      title,
      description,
      price,
      totalArea,
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
    console.error("❌ Error creating sale property:", error);
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
