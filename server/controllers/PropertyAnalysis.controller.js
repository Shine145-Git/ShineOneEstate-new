const PropertyAnalysis = require('../models/PropertyAnalysis.model');
const Enquiry = require('../models/EnquirySchema.model');
const Payment = require('../models/Payment.model');
const mongoose = require('mongoose');
const RentalProperty = require("../models/Rentalproperty.model");
const SaleProperty = require("../models/SaleProperty.model");

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

    // Try to find or create metrics
    let metrics = await PropertyAnalysis.findOne({ property: propertyId })
      .populate('views.user', 'name email')
      .populate('saves.user', 'name email')
      .populate('engagementTime.user', 'name email')
      .populate('ratings.user', 'name email');

    // Auto-create empty metrics if missing
    if (!metrics) {
      metrics = new PropertyAnalysis({ property: propertyId, views: [], saves: [], engagementTime: [], ratings: [] });
      await metrics.save();
    }

    res.status(200).json(metrics);
  } catch (err) {
    res.status(500).json({ error: "Server error fetching metrics" });
  }
};
const getSavedProperties = async (req, res) => {
  try {
    const userId = req.user?._id || req.cookies?.userId;
    if (!userId) {
      return res.status(400).json({ error: "User not authenticated" });
    }

    const savedDocs = await PropertyAnalysis.find({ 'saves.user': userId })
      .populate('property')
      .populate('saves.user', 'name email');

    const saved = savedDocs.filter(item => item.property && item.property.isActive);

    if (!saved || saved.length === 0) {
      return res.status(404).json({ message: "No saved properties found" });
    }

    res.status(200).json(saved);
  } catch (err) {
    res.status(500).json({ error: "Server error while fetching saved properties" });
  }
};
const getUserPropertyMetrics = async (req, res) => {
  try {
    const userId = req.user?._id || req.cookies?.userId;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const rentalProps = await RentalProperty.find({
      owner: userId,
       // ✅ only fetch active rental properties
    }).select("_id");

    const saleProps = await SaleProperty.find({
      owner: userId,
       // ✅ only fetch active sale properties
    }).select("_id");

    const allUserPropertyIds = [
      ...rentalProps.map(p => p._id),
      ...saleProps.map(p => p._id)
    ];

    if (allUserPropertyIds.length === 0) {
      return res.status(404).json({ message: "No properties found for this user" });
    }

    let analytics = await PropertyAnalysis.find({ property: { $in: allUserPropertyIds } });

    // Filter out analytics with invalid or null/undefined property
    analytics = analytics.filter(a => a.property && mongoose.Types.ObjectId.isValid(a.property));

    if (analytics.length === 0) {
      return res.status(200).json({
        totalProperties: 0,
        totalViews: 0,
        totalSaves: 0,
        totalRatings: 0,
        avgRating: 0,
        avgEngagement: 0,
      });
    }

    const analyzedPropertyIds = analytics.map(a => a.property.toString());

    const totalViews = analytics.reduce((sum, a) => sum + (a.views?.length || 0), 0);
    const totalSaves = analytics.reduce((sum, a) => sum + (a.saves?.length || 0), 0);
    const totalRatings = analytics.reduce((sum, a) => sum + (a.ratings?.length || 0), 0);

    const avgRating =
      totalRatings > 0
        ? (
            analytics.reduce((sum, a) => {
              const total = a.ratings?.reduce((acc, r) => acc + (r.rating || 0), 0) || 0;
              return sum + total;
            }, 0) / totalRatings
          ).toFixed(1)
        : 0;

    const avgEngagement =
      analytics.reduce((sum, a) => {
        const totalSeconds = a.engagementTime?.reduce((acc, e) => acc + (e.seconds || 0), 0) || 0;
        const count = a.engagementTime?.length || 0;
        return sum + (count > 0 ? totalSeconds / count : 0);
      }, 0) / analytics.length;

    res.status(200).json({
      totalProperties: analyzedPropertyIds.length,
      totalViews,
      totalSaves,
      totalRatings,
      avgRating,
      avgEngagement: Math.round(avgEngagement),
    });
  } catch (err) {
    res.status(500).json({ error: "Server error fetching user property metrics" });
  }
};

module.exports = {
  addView,
  addSave,
  getLeadConversion,
  addEngagementTime,
  addRating,
  getMetrics,
  getSavedProperties,
  getUserPropertyMetrics
};
