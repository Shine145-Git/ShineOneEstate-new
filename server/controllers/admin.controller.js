const Payment = require('../models/Payment.model');
const mongoose = require('mongoose');
const RentalProperty = mongoose.models.RentalProperty || require('../models/RentalProperty.model');
const SaleProperty = mongoose.models.SaleProperty || require('../models/SaleProperty.model');
const User = require('../models/user.model');
const UserPreferencesARIA = require('../models/UserPreferencesARIA.model');
const SearchHistory = require('../models/SearchHistory.model');
const PropertyAnalysis = require('../models/PropertyAnalysis.model');
const Reward = require('../models/Rewards.model');
const CustomerSupport = require('../models/CustomerSupport.model');
const ServiceRequest = require('../models/serviceRequests.model');



// Toggle ACTIVE / INACTIVE for Rental or Sale property
const toggleActiveStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Try to find in RentalProperty first, then SaleProperty
    let property = await RentalProperty.findById(id) || await SaleProperty.findById(id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    const propertyType = property.defaultpropertytype;

    property.isActive = !property.isActive;
    await property.save();

    res.status(200).json({
      message: `Property (${propertyType}) ${property.isActive ? "activated" : "deactivated"} successfully.`,
      property,
    });
  } catch (error) {
    console.error("Error toggling active status:", error);
    res.status(500).json({ message: "Error toggling property active status", error: error.message });
  }
};

// Toggle REVIEWED / NOT REVIEWED for Rental or Sale property (using PropertyReviewStatus model)
const PropertyReviewStatus = require('../models/propertyReviewStatus.model');
const toggleReviewStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Detect property type automatically
    const rentalProp = await RentalProperty.findById(id);
    const saleProp = rentalProp ? null : await SaleProperty.findById(id);
    const property = rentalProp || saleProp;
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    const propertyType = property.defaultpropertytype;

    // Check if a review record exists for this property
    let reviewRecord = await PropertyReviewStatus.findOne({ propertyId: id });

    if (!reviewRecord) {
      // Create new review record if not exists
      reviewRecord = new PropertyReviewStatus({
        propertyId: id,
        propertyType: propertyType,
        isReviewed: true,
        reviewedAt: new Date(),
        reviewedBy: req.user?.email || "admin"
      });
      await reviewRecord.save();

      return res.status(201).json({
        message: `Property (${propertyType}) marked as reviewed.`,
        reviewRecord
      });
    }

    // Toggle review state
    reviewRecord.isReviewed = !reviewRecord.isReviewed;
    reviewRecord.reviewedAt = reviewRecord.isReviewed ? new Date() : null;
    reviewRecord.reviewedBy = req.user?.email || "admin";
    await reviewRecord.save();

    res.status(200).json({
      message: `Property (${propertyType}) marked as ${reviewRecord.isReviewed ? "reviewed" : "not reviewed"}.`,
      reviewRecord
    });
  } catch (error) {
    console.error("Error toggling review status:", error);
    res.status(500).json({ message: "Error toggling property review status", error: error.message });
  }
};



const getCallbackRequests = async (req, res) => {
  try {
    const {
      status,
      dateRange,
      sortBy = "createdAt",
      order = "desc",
      search,
      limit = 50,
      page = 1
    } = req.query;

    const filter = {};

    // Filter by status (e.g., pending, resolved, in-progress)
    if (status) {
      filter.status = status;
    }

    // Filter by date range
    if (dateRange) {
      const [start, end] = dateRange.split(",");
      filter.createdAt = {
        $gte: new Date(start),
        $lte: end ? new Date(end) : new Date()
      };
    }

    // Search across name, phone, and email fields
    if (search) {
      filter.$or = [
        { name: new RegExp(search, "i") },
        { phone: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
        { issue: new RegExp(search, "i") }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await CustomerSupport.countDocuments(filter);

    // Fetch records
    const requests = await CustomerSupport.find(filter)
      .sort({ [sortBy]: order === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Analytics
    const totalRequests = await CustomerSupport.countDocuments();
    const pendingCount = await CustomerSupport.countDocuments({ status: "pending" });
    const resolvedCount = await CustomerSupport.countDocuments({ status: "resolved" });
    const inProgressCount = await CustomerSupport.countDocuments({ status: "in-progress" });

    // Group by date for activity trends
    const trendData = await CustomerSupport.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);

    res.status(200).json({
      metadata: {
        total,
        totalRequests,
        pendingCount,
        resolvedCount,
        inProgressCount,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        trendData
      },
      data: requests
    });
  } catch (error) {
    console.error("Error fetching callback requests:", error);
    res.status(500).json({
      message: "Server error while fetching callback requests",
      error: error.message
    });
  }
};


const getPendingPayments = async (req, res) => {
  try {
    const pendingPayments = await Payment.find({ status: 'pending' }).populate('resident');

    // Dynamically populate property based on propertyModel field
    const populatedPayments = await Promise.all(
      pendingPayments.map(async (payment) => {
        let property;
        if (payment.propertyModel === 'RentalProperty') {
          property = await RentalProperty.findById(payment.property);
        } else if (payment.propertyModel === 'SaleProperty') {
          property = await SaleProperty.findById(payment.property);
        }
        return {
          ...payment.toObject(),
          property,
        };
      })
    );

    res.status(200).json(populatedPayments);
  } catch (error) {
    console.error('Error fetching pending payments:', error);
    res.status(500).json({ message: 'Error fetching pending payments', error: error.message });
  }
};


const updatePaymentStatus = async (req, res) => {
  const { paymentId, status } = req.body;
  try {
    const payment = await Payment.findByIdAndUpdate(paymentId, { status }, { new: true });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Error updating payment status', error });
  }
};


const getApprovedPayments = async (req, res) => {
  try {
    const approvedPayments = await Payment.find({ status: 'approved' }).populate('resident');

    const populatedPayments = await Promise.all(
      approvedPayments.map(async (payment) => {
        let property;
        if (payment.propertyModel === 'RentalProperty') {
          property = await RentalProperty.findById(payment.property);
        } else if (payment.propertyModel === 'SaleProperty') {
          property = await SaleProperty.findById(payment.property);
        }
        return {
          ...payment.toObject(),
          property,
        };
      })
    );

    res.status(200).json(populatedPayments);
  } catch (error) {
    console.error('Error fetching approved payments:', error);
    res.status(500).json({ message: 'Error fetching approved payments', error: error.message });
  }
};





const getAdminOverview = async (req, res) => {
  try {
    // Property counts (only active)
    const [rentalCount, saleCount] = await Promise.all([
      RentalProperty.countDocuments({ isActive: true }),
      SaleProperty.countDocuments({ isActive: true })
    ]);
    const totalProperties = rentalCount + saleCount;

    // User counts
    const [totalUsers, renters, owners, admins] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'renter' }),
      User.countDocuments({ role: 'owner' }),
      User.countDocuments({ role: 'admin' })
    ]);

    // Payment stats + approved payments
    const payments = await Payment.find({}).populate('resident');
    const pendingPayments = payments.filter(p => p.status === 'pending').length;
    const completedPayments = payments.filter(p => p.status === 'completed').length;
    const approvedPayments = payments.filter(p => p.status === 'approved');
    const totalRevenue = payments
      .filter(p => p.status === 'completed' || p.status === 'approved')
      .reduce((sum, p) => sum + p.amount, 0);

    // Populate approved payments with property info (from RentalProperty or SaleProperty)
    const populatedApprovedPayments = await Promise.all(
      approvedPayments.map(async (payment) => {
        let property = await RentalProperty.findById(payment.property);
        if (!property) {
          property = await SaleProperty.findById(payment.property);
        }
        return { ...payment.toObject(), property };
      })
    );

    // Preferences and searches
    const [totalPreferences, totalSearches] = await Promise.all([
      UserPreferencesARIA.countDocuments(),
      SearchHistory.countDocuments()
    ]);

    // Fetch distinct user emails from UserPreferencesARIA (AI Assistant users)
    const aiUsers = await UserPreferencesARIA.distinct('email');

    // Recent activity (only active properties)
    const [recentUsers, recentRentalProperties, recentSaleProperties, recentPayments] = await Promise.all([
      User.find().sort({ createdAt: -1 }).limit(5),
      RentalProperty.find({ isActive: true }).sort({ createdAt: -1 }).limit(2),
      SaleProperty.find({ isActive: true }).sort({ createdAt: -1 }).limit(1),
      Payment.find().populate('resident').sort({ paymentDate: -1 }).limit(5)
    ]);
    const recentProperties = [...recentRentalProperties, ...recentSaleProperties];

    // Map users
    const recentUserActivities = recentUsers.map(user => ({
      type: "user",
      user: user.email || "Unknown User",
      action: "New User Registered",
      location: "-",
      time: user.createdAt
    }));

    // Map properties
    const recentPropertyActivities = recentProperties.map(property => ({
      type: "property",
      user: "Admin",
      action: "New Property Added",
      location: `${property.propertyType || 'Property'} in ${property.Sector || property.address || 'Unknown'}`,
      time: property.createdAt
    }));

    // Map payments
    const recentPaymentActivities = recentPayments.map(payment => ({
      type: "payment",
      user: payment.resident?.email || "Unknown User",
      action: "Payment Made",
      location: `₹${payment.amount}`,
      time: payment.paymentDate
    }));

    // Combine and sort
    const recentActivity = [
      ...recentUserActivities,
      ...recentPropertyActivities,
      ...recentPaymentActivities
    ].sort((a, b) => new Date(b.time) - new Date(a.time));

    // --- Search Statistics ---
    const searchAggregation = await SearchHistory.aggregate([
      { $group: { _id: "$query", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 15 }
    ]);
    const topSearches = searchAggregation.map(s => ({
      query: s._id,
      count: s.count
    }));
    const totalSearchesCount = await SearchHistory.countDocuments();

    // Most searched locations (assuming 'location' field exists in SearchHistory)
    const mostSearchedLocationsAgg = await SearchHistory.aggregate([
      { $match: { location: { $exists: true, $ne: null } } },
      { $group: { _id: "$location", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    const mostSearchedLocations = mostSearchedLocationsAgg.map(loc => ({
      location: loc._id,
      count: loc.count
    }));

    // Average searches per user
    const uniqueSearchUsersCount = await SearchHistory.distinct('user').then(users => users.length || 1);
    const avgSearchesPerUser = totalSearchesCount / uniqueSearchUsersCount;

    // --- Average Property Rating ---
    // Calculate average rating from PropertyAnalysis.ratings.rating
    const avgRatingAgg = await PropertyAnalysis.aggregate([
      { $unwind: "$ratings" },
      { $match: { "ratings.rating": { $exists: true, $ne: null } } },
      { $group: { _id: null, avgRating: { $avg: "$ratings.rating" } } }
    ]);
    const averagePropertyRating = avgRatingAgg.length > 0 ? avgRatingAgg[0].avgRating : 0;

    // --- Property statistics ---
    // Use PropertyAnalysis for engagement stats (only active properties)
    const rentalPropertyIds = await RentalProperty.find({ isActive: true }, '_id').then(docs => docs.map(d => d._id));
    const salePropertyIds = await SaleProperty.find({ isActive: true }, '_id').then(docs => docs.map(d => d._id));
    // Rental stats
    const rentalStatsAgg = await PropertyAnalysis.aggregate([
      { $match: { property: { $in: rentalPropertyIds } } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: { $cond: [{ $isArray: "$views" }, { $size: "$views" }, 0] } },
          totalSaves: { $sum: { $cond: [{ $isArray: "$saves" }, { $size: "$saves" }, 0] } },
          avgEngagementTime: { $avg: "$engagementTime" },
          count: { $sum: 1 }
        }
      }
    ]);
    // Sale stats
    const saleStatsAgg = await PropertyAnalysis.aggregate([
      { $match: { property: { $in: salePropertyIds } } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: { $cond: [{ $isArray: "$views" }, { $size: "$views" }, 0] } },
          totalSaves: { $sum: { $cond: [{ $isArray: "$saves" }, { $size: "$saves" }, 0] } },
          avgEngagementTime: { $avg: "$engagementTime" },
          count: { $sum: 1 }
        }
      }
    ]);
    const rentalStatsData = rentalStatsAgg[0] || { totalViews: 0, totalSaves: 0, avgEngagementTime: 0, count: 0 };
    const saleStatsData = saleStatsAgg[0] || { totalViews: 0, totalSaves: 0, avgEngagementTime: 0, count: 0 };

    // Most viewed/saved/rated properties (top 3 each for Rental and Sale) using PropertyAnalysis
    // Get property IDs sorted by engagement
    const getTopProperties = async (propertyIds, field, limit = 3) => {
      const agg = await PropertyAnalysis.aggregate([
        { $match: { property: { $in: propertyIds } } },
        {
          $project: {
            property: 1,
            count: {
              $cond: [
                { $isArray: `$${field}` },
                { $size: `$${field}` },
                0
              ]
            }
          }
        },
        { $sort: { count: -1 } },
        { $limit: limit }
      ]);
      // Populate property details (ensure only active properties)
      return Promise.all(
        agg.map(async entry => {
          let property = await RentalProperty.findOne({ _id: entry.property, isActive: true });
          if (!property) property = await SaleProperty.findOne({ _id: entry.property, isActive: true });
          return { property, [field + 'Count']: entry.count };
        })
      );
    };
    const topViewedRental = await getTopProperties(rentalPropertyIds, 'views', 3);
    const topSavedRental = await getTopProperties(rentalPropertyIds, 'saves', 3);
    const topRatedRental = await PropertyAnalysis.aggregate([
      { $match: { property: { $in: rentalPropertyIds } } },
      { $unwind: "$ratings" },
      { $group: { _id: "$property", avgRating: { $avg: "$ratings.rating" } } },
      { $sort: { avgRating: -1 } },
      { $limit: 3 }
    ]).then(async arr => Promise.all(arr.map(async entry => {
      let property = await RentalProperty.findOne({ _id: entry._id, isActive: true });
      if (!property) property = await SaleProperty.findOne({ _id: entry._id, isActive: true });
      return { property, avgRating: entry.avgRating };
    })));
    const topViewedSale = await getTopProperties(salePropertyIds, 'views', 3);
    const topSavedSale = await getTopProperties(salePropertyIds, 'saves', 3);
    const topRatedSale = await PropertyAnalysis.aggregate([
      { $match: { property: { $in: salePropertyIds } } },
      { $unwind: "$ratings" },
      { $group: { _id: "$property", avgRating: { $avg: "$ratings.rating" } } },
      { $sort: { avgRating: -1 } },
      { $limit: 3 }
    ]).then(async arr => Promise.all(arr.map(async entry => {
      let property = await RentalProperty.findOne({ _id: entry._id, isActive: true });
      if (!property) property = await SaleProperty.findOne({ _id: entry._id, isActive: true });
      return { property, avgRating: entry.avgRating };
    })));

    // --- User statistics ---
    // User growth over time (monthly for past 12 months)
    const now = new Date();
    const pastYear = new Date(now.getFullYear() - 1, now.getMonth() + 1, 1);
    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: pastYear } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    // Format userGrowth to array of { year, month, count }
    const userGrowthFormatted = userGrowth.map(item => ({
      year: item._id.year,
      month: item._id.month,
      count: item.count
    }));

    // AI assistant usage breakdown by role
    const aiUsersDetails = await User.aggregate([
      { $match: { email: { $in: aiUsers } } },
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 }
        }
      }
    ]);
    const aiUsageByRole = {};
    aiUsersDetails.forEach(item => {
      aiUsageByRole[item._id] = item.count;
    });

    // Rewards distributed - use Reward model
    const totalRewardsDistributed = await Reward.countDocuments();

    // Active users (users with payment or search or property activity in last 30 days)
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    const activeUsersPayments = await Payment.distinct('resident', { paymentDate: { $gte: last30Days } });
    const activeUsersSearches = await SearchHistory.distinct('user', { createdAt: { $gte: last30Days } });
const activeUsersProperties = await RentalProperty.distinct('owner', { createdAt: { $gte: last30Days } });
const activeUsersPropertiesSale = await SaleProperty.distinct('ownerId', { createdAt: { $gte: last30Days } }); // <- use ownerId for sale
    const activeUsersSet = new Set([...activeUsersPayments, ...activeUsersSearches, ...activeUsersProperties, ...activeUsersPropertiesSale]);
    const activeUsersCount = activeUsersSet.size;
    const inactiveUsersCount = totalUsers - activeUsersCount;

    // --- Financial metrics ---
    // Revenue by payment method
    const revenueByMethodAgg = await Payment.aggregate([
      { $match: { status: { $in: ['completed', 'approved'] } } },
      {
        $group: {
          _id: "$paymentMethod",
          totalAmount: { $sum: "$amount" },
          avgAmount: { $avg: "$amount" },
          count: { $sum: 1 }
        }
      }
    ]);
    const revenueByMethod = {};
    revenueByMethodAgg.forEach(item => {
      revenueByMethod[item._id || 'Unknown'] = {
        totalAmount: item.totalAmount,
        avgAmount: item.avgAmount,
        count: item.count
      };
    });

    // Average transaction amount overall
    const avgTransactionAmount = payments.length > 0 ? payments.reduce((acc, p) => acc + p.amount, 0) / payments.length : 0;

    // Revenue totals by status
    const totalRevenuePending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
    const totalRevenueCompleted = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
    const totalRevenueApproved = payments.filter(p => p.status === 'approved').reduce((sum, p) => sum + p.amount, 0);

    // --- Engagement metrics ---
    // Aggregate engagement from PropertyAnalysis: views/saves as array lengths
    const engagementAgg = await PropertyAnalysis.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: { $cond: [{ $isArray: "$views" }, { $size: "$views" }, 0] } },
          totalSaves: { $sum: { $cond: [{ $isArray: "$saves" }, { $size: "$saves" }, 0] } },
          totalRatings: { $sum: { $cond: [{ $isArray: "$ratings" }, { $size: "$ratings" }, 0] } },
          avgEngagementTime: { $avg: "$engagementTime" }
        }
      }
    ]);
    const engagementData = engagementAgg[0] || { totalViews: 0, totalSaves: 0, totalRatings: 0, avgEngagementTime: 0 };

    // --- Reward metrics ---
    // Use Reward model for rewards
    const totalRewards = await Reward.countDocuments();
    const unclaimedRewards = await Reward.countDocuments({ claimed: { $ne: true } });
    const recentRewards = await Reward.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('user message createdAt');

    // --- Prepare charts data ---
    const charts = {
      userGrowth: userGrowthFormatted,
      aiUsageByRole,
      propertyStats: {
        rental: rentalStatsData,
        sale: saleStatsData,
        topViewedRental,
        topSavedRental,
        topRatedRental,
        topViewedSale,
        topSavedSale,
        topRatedSale
      },
      revenueByMethod,
      engagement: engagementData,
      rewards: {
        totalRewards,
        unclaimedRewards,
        recentRewards
      },
      searchInsights: {
        topSearches,
        mostSearchedLocations,
        avgSearchesPerUser
      }
    };

    // Append to response
    res.status(200).json({
      summary: {
        totalUsers,
        renters,
        owners,
        admins,
        totalProperties,
        rentalCount,
        saleCount,
        pendingPayments,
        approvedPayments: approvedPayments.length,
        approvedPaymentsThisMonth: approvedPayments.filter(p =>
          new Date(p.paymentDate).getMonth() === new Date().getMonth()
        ).length,
        completedPayments,
        totalRevenue,
        totalPreferences,
        totalSearches,
        totalSearchesCount,
        averagePropertyRating,
        aiUsersCount: aiUsers.length,
        activeUsersCount,
        inactiveUsersCount,
        totalRewardsDistributed,
        totalRevenuePending,
        totalRevenueCompleted,
        totalRevenueApproved,
        avgTransactionAmount
      },
      charts,
      recentActivity,
      approvedPayments: populatedApprovedPayments,
      insights: {
        userGrowth: userGrowthFormatted,
        aiUsageByRole,
        propertyStats: {
          rental: rentalStatsData,
          sale: saleStatsData
        },
        revenueByMethod,
        engagement: engagementData,
        rewards: {
          totalRewards,
          unclaimedRewards,
          recentRewards
        },
        searchInsights: {
          topSearches,
          mostSearchedLocations,
          avgSearchesPerUser
        }
      }
    });
  } catch (error) {
    console.error("Error fetching admin overview:", error);
    res.status(500).json({ message: "Error fetching admin overview", error: error.message });
  }
};

const getAllUsersDetailed = async (req, res) => {
  try {
    const users = await User.find();

    const detailedUsers = await Promise.all(users.map(async (user) => {
      const userId = user._id;

      // AI Assistant usage
      const aiUsage = await UserPreferencesARIA.findOne({ email: user.email });

      // Rewards info (count and latest message)
      const rewards = await PropertyAnalysis.find({ user: userId, rewardMessage: { $exists: true, $ne: null } })
        .sort({ createdAt: -1 });
      const rewardsCount = rewards.length;
      const latestRewardMessage = rewardsCount > 0 ? rewards[0].rewardMessage : null;

      // Search history (queries and timestamps)
      const searches = await SearchHistory.find({ user: userId }).sort({ createdAt: -1 });

      // Payments made (populate property info)
      const payments = await Payment.find({ resident: userId });
      const paymentsWithProperty = await Promise.all(payments.map(async (payment) => {
        let property = null;
        if (payment.propertyModel === 'RentalProperty') {
          property = await RentalProperty.findById(payment.property);
        } else if (payment.propertyModel === 'SaleProperty') {
          property = await SaleProperty.findById(payment.property);
        }
        return {
          ...payment.toObject(),
          property
        };
      }));

      // Properties posted (both Rental and Sale) — merged and sorted by createdAt (newest first)
      const rentalProperties = await RentalProperty.find({ owner: userId }).lean();
      const saleProperties = await SaleProperty.find({ ownerId: userId }).lean();
      const allProperties = [...rentalProperties, ...saleProperties].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      // Engagement stats from PropertyAnalysis for properties posted by user
      const propertyIds = allProperties.map(p => p._id);
      const analyses = await PropertyAnalysis.find({ property: { $in: propertyIds } });

      // Count total engagement stats
      const totalViews = analyses.reduce(
        (acc, a) => acc + (Array.isArray(a.views) ? a.views.length : 0),
        0
      );
      const totalSaves = analyses.reduce(
        (acc, a) => acc + (Array.isArray(a.saves) ? a.saves.length : 0),
        0
      );
      const ratingsCount = analyses.reduce(
        (acc, a) => acc + (Array.isArray(a.ratings) ? a.ratings.length : 0),
        0
      );

      // Keep raw engagement arrays for detailed inspection
      const allViews = analyses.flatMap(a => a.views || []);
      const allSaves = analyses.flatMap(a => a.saves || []);
      const allRatings = analyses.flatMap(a => a.ratings || []);

      // Average rating given by the user (from PropertyAnalysis where user is rater)
      const userRatingsAgg = await PropertyAnalysis.aggregate([
        { $match: { user: userId, ratingGiven: { $exists: true, $ne: null } } },
        { $group: { _id: null, avgRatingGiven: { $avg: "$ratingGiven" } } }
      ]);
      const avgRatingGiven = userRatingsAgg[0]?.avgRatingGiven || null;

      return {
        email: user.email,
        role: user.role,
        mobileNumber: user.mobileNumber,
        registeredAt: user.createdAt,
        aiAssistantUsage: aiUsage || null,
        rewards: {
          count: rewardsCount,
          latestMessage: latestRewardMessage
        },
        searchHistory: searches.map(s => ({ query: s.query, timestamp: s.createdAt })),
        payments: paymentsWithProperty,
        propertiesPosted: allProperties,
        engagementStats: {
          totalViews,
          totalSaves,
          ratingsCount,
          detailed: {
            views: allViews,
            saves: allSaves,
            ratings: allRatings
          }
        },
        averageRatingGiven: avgRatingGiven
      };
    }));

    res.status(200).json({ users: detailedUsers });
  } catch (error) {
    console.error("Error fetching detailed user info:", error);
    res.status(500).json({ message: "Error fetching detailed user info", error: error.message });
  }
};




// Get user rewards status: active/inactive counts and rewards list for a userId
const getUserRewardsStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const rewards = await Reward.find({ userId }).select("message isActive distributedAt");

    const activeCount = rewards.filter(r => r.isActive).length;
    const inactiveCount = rewards.filter(r => !r.isActive).length;

    res.status(200).json({
      activeCount,
      inactiveCount,
      rewards
    });
  } catch (error) {
    console.error("Error fetching user reward status:", error);
    res.status(500).json({ message: "Error fetching user reward status", error: error.message });
  }
};

// Update a user's role (only admins can perform this)
const updateUserRole = async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ message: "Email and role are required" });
    }

    // Verify the requester is admin
    const requestingUser = await User.findById(req.user.id);
    if (!requestingUser || requestingUser.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized: Only admins can update roles" });
    }

    // Update target user's role
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { role },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: `User role updated successfully to ${role}`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ message: "Error updating user role", error: error.message });
  }
};
const getAllProperties = async (req, res) => {
  try {
    const { limit } = req.query;
    // Fetch all properties
    const rentalProperties = await RentalProperty.find().populate("owner", "name email");
    const saleProperties = await SaleProperty.find().populate("ownerId", "name email");

    const rentalLimit = limit && !isNaN(Number(limit)) ? Number(limit) : rentalProperties.length;
    const saleLimit = limit && !isNaN(Number(limit)) ? Number(limit) : saleProperties.length;
    const limitedRental = rentalProperties.slice(0, rentalLimit);
    const limitedSale = saleProperties.slice(0, saleLimit);

    // Fetch review statuses
    const reviewStatuses = await PropertyReviewStatus.find();

    // Merge review statuses into property data
    let allProperties = [
      ...limitedRental.map((prop) => {
        const review = reviewStatuses.find(
          (r) => r.propertyId.toString() === prop._id.toString()
        );
        return {
          ...prop.toObject(),
          defaultpropertytype: "rental",
          isReviewed: review ? review.isReviewed : false,
        };
      }),
      ...limitedSale.map((prop) => {
        const review = reviewStatuses.find(
          (r) => r.propertyId.toString() === prop._id.toString()
        );
        return {
          ...prop.toObject(),
          defaultpropertytype: "sale",
          isReviewed: review ? review.isReviewed : false,
        };
      }),
    ];

    const numericLimit = limit && !isNaN(Number(limit)) ? Number(limit) : null;
    if (numericLimit) {
      // Shuffle and take only the requested number of properties
      allProperties = allProperties
        .sort(() => 0.5 - Math.random()) // randomize order
        .slice(0, numericLimit);
    }

    res.status(200).json(allProperties);
  } catch (error) {
    console.error("Error fetching all properties:", error);
    res.status(500).json({
      message: "Server error while fetching all properties",
      error: error.message,
    });
  }
};
// Admin can update any service request details (including status)

const updateServiceRequestDetails = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Unauthorized: Please log in.' });
    }

    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid request ID' });
    }

    // Only admin can update request details
    const isAdmin = req.user.role === 'admin' || req.user.isAdmin === true;
    if (!isAdmin) {
      return res.status(403).json({ message: 'Only admin can update request details' });
    }

    // Load current doc first (to compare changes + enforce renter/owner rule)
    const current = await ServiceRequest.findById(id);
    if (!current) return res.status(404).json({ message: 'Service request not found' });

    const {
      // core editable fields
      userRole,
      propertyType,
      propertyId,
      address,
      serviceType,
      contactNumber,
      preferredDate,
      notes,
      status,
      // optional: allow admin to reassign the ticket
      createdBy, // ObjectId (optional)
    } = req.body || {};
    // console.log("Incoming update payload:", req.body);

    // Build update operator
    const update = { $set: {}, $unset: {} };
    const changedFields = [];

    // (optional) reassign createdBy
    if (createdBy !== undefined) {
      if (!mongoose.isValidObjectId(createdBy)) {
        return res.status(400).json({ message: 'Invalid createdBy id' });
      }
      update.$set.createdBy = createdBy;
      changedFields.push('createdBy');
    }

    // Validate userRole
    let effectiveRole = current.userRole;
    if (userRole !== undefined) {
      const allowedRoles = ['owner', 'renter'];
      if (!allowedRoles.includes(userRole)) {
        return res.status(400).json({ message: "Invalid userRole. Allowed: 'owner', 'renter'" });
      }
      update.$set.userRole = userRole;
      effectiveRole = userRole;
      changedFields.push('userRole');
    }

    // Validate serviceType
    if (serviceType !== undefined) {
      const allowedServices = ServiceRequest.schema.path('serviceType').enumValues;
      if (!allowedServices.includes(serviceType)) {
        return res.status(400).json({ message: `Invalid serviceType. Allowed: ${allowedServices.join(', ')}` });
      }
      update.$set.serviceType = serviceType;
      changedFields.push('serviceType');
    }

    // Validate status
    let statusChanged = false;
    if (status !== undefined) {
      const allowedStatuses = ServiceRequest.schema.path('status').enumValues;
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: `Invalid status. Allowed: ${allowedStatuses.join(', ')}` });
      }
      if (current.status !== status) statusChanged = true;
      update.$set.status = status;
      changedFields.push('status');
    }

    // Normalize phone
    if (contactNumber !== undefined) {
      const normalizedPhone = String(contactNumber).replace(/\s|\-/g, '');
      update.$set.contactNumber = normalizedPhone;
      changedFields.push('contactNumber');
    }

    if (preferredDate !== undefined) {
      update.$set.preferredDate = preferredDate ? new Date(preferredDate) : null;
      changedFields.push('preferredDate');
    }

    if (notes !== undefined) {
      update.$set.notes = notes;
      changedFields.push('notes');
    }

    if (address !== undefined) {
      update.$set.address = address;
      changedFields.push('address');
    }

    // Property linkage rules based on role
    if (effectiveRole === 'owner') {
      if (propertyType !== undefined) {
        const allowedTypes = ['RentalProperty', 'SaleProperty'];
        if (!allowedTypes.includes(propertyType)) {
          return res.status(400).json({ message: "Invalid propertyType. Allowed: 'RentalProperty', 'SaleProperty'" });
        }
        update.$set.propertyType = propertyType;
        changedFields.push('propertyType');
      }
      if (propertyId !== undefined) {
        if (!mongoose.isValidObjectId(propertyId)) {
          return res.status(400).json({ message: 'Invalid propertyId' });
        }
        update.$set.propertyId = propertyId;
        changedFields.push('propertyId');
      }

      // If owner request ends up without propertyId, ensure address exists
      const finalPropId = (propertyId !== undefined) ? propertyId : current.propertyId;
      const finalAddr = (address !== undefined) ? address : current.address;
      if (!finalPropId && !finalAddr) {
        return res.status(400).json({ message: 'Either propertyId or address is required for owner requests.' });
      }
    } else {
      // renter: must have address; clear property link
      if (address === undefined && !current.address) {
        return res.status(400).json({ message: 'address is required for renter requests' });
      }
      update.$unset.propertyId = '';
      update.$unset.propertyType = '';
    }

    // Add audit trail / timeline entry
    // We maintain a "timeline" array (if present) with status changes & a condensed edit note.
    if (statusChanged) {
      update.$push = update.$push || {};
      update.$push.timeline = {
        status,
        date: new Date(),
        description: `Status updated to "${status}" by admin`,
      };
    } else if (changedFields.length > 0) {
      update.$push = update.$push || {};
      update.$push.timeline = {
        status: current.status,
        date: new Date(),
        description: `Fields updated by admin: ${changedFields.join(', ')}`,
      };
    }

    if (Object.keys(update.$unset).length === 0) delete update.$unset;

    // console.log("MongoDB update object:", JSON.stringify(update, null, 2));
    // Execute update
    const updatedDoc = await ServiceRequest.findByIdAndUpdate(
      id,
      update,
      { new: true, runValidators: true }
    )
      .populate({ path: 'createdBy', select: 'name email mobileNumber' })
      .populate({
        path: 'propertyId',
        select: 'title address Sector location defaultpropertytype images',
        strictPopulate: false,
      })
      .lean();

    return res.status(200).json({
      message: 'Request updated successfully',
      request: updatedDoc,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Server error while updating request details',
      error: error.message,
    });
  }
};

module.exports = {
  getPendingPayments,
  updatePaymentStatus,
  getApprovedPayments,
  getAdminOverview,
  getAllUsersDetailed,
  getCallbackRequests,
  getUserRewardsStatus,
  toggleActiveStatus,
  toggleReviewStatus,
  updateUserRole,
  getAllProperties,
  updateServiceRequestDetails
};
