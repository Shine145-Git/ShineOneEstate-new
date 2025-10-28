const PropertyAnalysis = require('../models/PropertyAnalysis.model');
const Enquiry = require('../models/EnquirySchema.model');
const Payment = require('../models/Payment.model');
const mongoose = require('mongoose');

// Add a view
const addView = async (req, res) => {
  try {
    const { propertyId } = req.body;
    const userId = req.user?._id || null;
    const metrics = await PropertyAnalysis.findOneAndUpdate(
      { property: propertyId },
      { $push: { views: { user: userId } } },
      { upsert: true, new: true }
    );
    res.status(200).json(metrics);
  } catch (err) {
    res.status(500).json({ error: 'Error adding view' });
  }
};

// Add a save
const addSave = async (req, res) => {
  try {
    const { propertyId } = req.body;
    const userId = req.user._id;
    const metrics = await PropertyAnalysis.findOneAndUpdate(
      { property: propertyId },
      { $push: { saves: { user: userId } } },
      { upsert: true, new: true }
    );
    res.status(200).json(metrics);
  } catch (err) {
    res.status(500).json({ error: 'Error adding save' });
  }
};

// Get lead conversion rate
const getLeadConversion = async (req, res) => {
  try {
    const propertyId = req.params.id;

    const totalLeads = await Enquiry.countDocuments({ property: propertyId });
    const completedPayments = await Payment.countDocuments({ property: propertyId, status: 'completed' });

    const conversionRate = totalLeads > 0 ? (completedPayments / totalLeads) * 100 : 0;

    res.status(200).json({
      totalLeads,
      completedPayments,
      conversionRate: Number(conversionRate.toFixed(1))
    });
  } catch (err) {
    res.status(500).json({ error: 'Error calculating lead conversion' });
  }
};

// Add engagement time
const addEngagementTime = async (req, res) => {
  try {
    const { propertyId, seconds } = req.body;
    const userId = req.user._id;
    const metrics = await PropertyAnalysis.findOneAndUpdate(
      { property: propertyId },
      { $push: { engagementTime: { user: userId, seconds } } },
      { upsert: true, new: true }
    );
    res.status(200).json(metrics);
  } catch (err) {
    res.status(500).json({ error: 'Error adding engagement time' });
  }
};

// Add a rating
const addRating = async (req, res) => {
  try {
    const { propertyId, rating, comment } = req.body;
    const userId = req.user._id;
    const metrics = await PropertyAnalysis.findOneAndUpdate(
      { property: propertyId },
      { $push: { ratings: { user: userId, rating, comment } } },
      { upsert: true, new: true }
    );
    res.status(200).json(metrics);
  } catch (err) {
    res.status(500).json({ error: 'Error adding rating' });
  }
};

const getMetrics = async (req, res) => {
  try {
    const propertyId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({ error: "Invalid property ID" });
    }

    const metrics = await PropertyAnalysis.findOne({ property: propertyId })
      .populate('views.user', 'name email')
      .populate('saves.user', 'name email')
      // Removed populate for payments.user because it does not exist in schema
      .populate('engagementTime.user', 'name email')
      .populate('ratings.user', 'name email');

    if (!metrics) return res.status(404).json({ error: "Metrics not found" });

    res.status(200).json(metrics);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching metrics' });
  }
};

const getSavedProperties = async (req, res) => {
  try {
    console.log("📩 getSavedProperties triggered");
    console.log("👤 req.user:", req.user);
    console.log("🍪 req.cookies:", req.cookies);

    const userId = req.user?._id || req.cookies?.userId;
    if (!userId) {
      console.warn("⚠️ Missing user ID → returning 400");
      return res.status(400).json({ error: "User not authenticated" });
    }

    const saved = await PropertyAnalysis.find({ 'saves.user': userId })
      .populate('property')
      .populate('saves.user', 'name email');

    console.log(`🔍 Found ${saved.length} saved properties for user ${userId}`);

    if (!saved || saved.length === 0) {
      return res.status(404).json({ message: "No saved properties found" });
    }

    res.status(200).json(saved);
  } catch (err) {
    console.error("❌ Error fetching saved properties:", err);
    res.status(500).json({ error: "Server error while fetching saved properties" });
  }
};
module.exports = {
  addView,
  addSave,
  getLeadConversion,
  addEngagementTime,
  addRating,
  getMetrics,
  getSavedProperties
};
