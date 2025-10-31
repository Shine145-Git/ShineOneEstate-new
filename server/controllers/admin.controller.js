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
    const activeUsersPropertiesSale = await SaleProperty.distinct('owner', { createdAt: { $gte: last30Days } });
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

      // Properties posted (both Rental and Sale)
      const rentalProperties = await RentalProperty.find({ owner: userId });
      const saleProperties = await SaleProperty.find({ owner: userId });
      const allProperties = [...rentalProperties, ...saleProperties];

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



module.exports = { getPendingPayments, updatePaymentStatus, getApprovedPayments, getAdminOverview, getAllUsersDetailed , getCallbackRequests};
