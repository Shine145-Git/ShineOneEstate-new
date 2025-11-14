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

    // Toggle active flag
    property.isActive = !property.isActive;
    // Clear the "isPostedNew" flag when an admin toggles active state so that
    // approving a property will also remove the 'newly posted' pending state.
    // When deactivating, also clear isPostedNew to avoid it being treated as 'pending'.
    property.isPostedNew = false;

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
    // Parse and normalize query params for pagination, filtering, and sorting
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
    const skip = (page - 1) * limit;

    const { status, dateRange, sortBy = 'createdAt', order = 'desc', search } = req.query;

    const filter = {};

    // Filter by status (e.g., pending, resolved, in-progress)
    if (status) filter.status = status;

    // Filter by date range
    if (dateRange) {
      const [start, end] = dateRange.split(',');
      filter.createdAt = {
        $gte: new Date(start),
        $lte: end ? new Date(end) : new Date()
      };
    }

    // Search across name, phone, email and issue
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { issue: new RegExp(search, 'i') }
      ];
    }

    // Total matching documents for pagination
    const totalMatched = await CustomerSupport.countDocuments(filter);

    // Fetch paginated records with sorting
    const sortOrder = order === 'asc' ? 1 : -1;
    const requests = await CustomerSupport.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    // Analytics (global counts)
    const totalRequests = await CustomerSupport.countDocuments();
    const pendingCount = await CustomerSupport.countDocuments({ status: 'pending' });
    const resolvedCount = await CustomerSupport.countDocuments({ status: 'resolved' });
    const inProgressCount = await CustomerSupport.countDocuments({ status: 'in-progress' });

    // Group by date for activity trends (limited to matched filter range for relevance)
    const trendMatch = filter.createdAt ? { createdAt: filter.createdAt } : {};
    const trendPipeline = [
      { $match: trendMatch },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ];
    const trendData = await CustomerSupport.aggregate(trendPipeline);

    res.status(200).json({
      metadata: {
        total: totalMatched,
        totalRequests,
        pendingCount,
        resolvedCount,
        inProgressCount,
        page,
        limit,
        totalPages: Math.ceil(totalMatched / limit),
        sortBy,
        order
      },
      data: requests,
      trendData
    });
  } catch (error) {
    console.error('Error fetching callback requests:', error);
    res.status(500).json({
      message: 'Server error while fetching callback requests',
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
    // Query params for paginated heavy lists
    const approvedPage = Math.max(1, parseInt(req.query.approvedPage, 10) || 1);
    const recentPage = Math.max(1, parseInt(req.query.recentPage, 10) || 1);
    const pageSize = Math.max(1, parseInt(req.query.limit, 10) || 10);
    const approvedSkip = (approvedPage - 1) * pageSize;
    const recentSkip = (recentPage - 1) * pageSize;
    const topLimit = Math.max(3, parseInt(req.query.topLimit, 10) || 3);

    // Short in-process cache for expensive aggregations (5 minutes)
    const CACHE_TTL = 1000 * 60 * 5;
    if (!global.__adminOverviewCache) global.__adminOverviewCache = { ts: 0, payload: null };
    const nowTs = Date.now();
    const useCache = global.__adminOverviewCache.ts && (nowTs - global.__adminOverviewCache.ts) < CACHE_TTL && !req.query.forceRefresh;

    // Helper: batch fetch properties by ids from both collections and return a map
    const fetchPropertiesByIds = async (ids = []) => {
      if (!ids.length) return new Map();
      const [rentalProps, saleProps] = await Promise.all([
        RentalProperty.find({ _id: { $in: ids } }).lean().select('_id title address Sector owner ownerId createdAt isActive ownerType'),
        SaleProperty.find({ _id: { $in: ids } }).lean().select('_id title address Sector ownerId createdAt isActive ownerType')
      ]);
      const map = new Map();
      rentalProps.forEach(p => map.set(p._id.toString(), { ...p, defaultpropertytype: 'rental' }));
      saleProps.forEach(p => map.set(p._id.toString(), { ...p, defaultpropertytype: 'sale' }));
      return map;
    };

    // If cache exists, return cached summary/charts but refresh paginated lists (approvedPayments, recentActivity, top lists optional)
    if (useCache) {
      const cached = global.__adminOverviewCache.payload;

      // Fetch paginated approved payments (lightweight fields) and recent activity concurrently
      const [approvedPaymentsRaw, recentUsers, recentRentalProperties, recentSaleProperties, recentPayments] = await Promise.all([
        Payment.find({ status: 'approved' }).sort({ paymentDate: -1 }).skip(approvedSkip).limit(pageSize).populate('resident', 'email').lean(),
        User.find().sort({ createdAt: -1 }).skip(recentSkip).limit(pageSize).select('email createdAt').lean(),
        RentalProperty.find({ isActive: true }).sort({ createdAt: -1 }).limit(pageSize).select('propertyType Sector address createdAt').lean(),
        SaleProperty.find({ isActive: true }).sort({ createdAt: -1 }).limit(pageSize).select('propertyType Sector address createdAt').lean(),
        Payment.find().sort({ paymentDate: -1 }).skip(recentSkip).limit(pageSize).select('amount resident paymentDate').populate('resident', 'email').lean()
      ]);

      // Attach properties to approved payments in batch to avoid per-item queries
      const approvedPropertyIds = approvedPaymentsRaw.map(p => p.property).filter(Boolean).map(String);
      const approvedPropsMap = await fetchPropertiesByIds(approvedPropertyIds);
      const approvedPayments = approvedPaymentsRaw.map(p => ({ ...p, property: approvedPropsMap.get(String(p.property)) || null }));

      // Build recentActivity (merge and sort small arrays)
      const recentProperties = [...(recentRentalProperties || []), ...(recentSaleProperties || [])].slice(0, pageSize);
      const recentUserActivities = (recentUsers || []).map(u => ({ type: 'user', user: u.email || 'Unknown User', action: 'New User Registered', location: '-', time: u.createdAt }));
      const recentPropertyActivities = recentProperties.map(p => ({ type: 'property', user: 'Admin', action: 'New Property Added', location: `${p.propertyType || 'Property'} in ${p.Sector || p.address || 'Unknown'}`, time: p.createdAt }));
      const recentPaymentActivities = (recentPayments || []).map(p => ({ type: 'payment', user: p.resident?.email || 'Unknown User', action: 'Payment Made', location: `₹${p.amount}`, time: p.paymentDate }));
      const recentActivity = [ ...recentUserActivities, ...recentPropertyActivities, ...recentPaymentActivities ].sort((a,b) => new Date(b.time) - new Date(a.time)).slice(0, pageSize);

      return res.status(200).json({
        summary: cached.summary,
        charts: cached.charts,
        recentActivity,
        approvedPayments,
        metadata: { approvedPage, recentPage, pageSize },
        cached: true
      });
    }

    // No cache: compute summary + charts. Run many aggregations in parallel where possible.
    const [
      rentalCount,
      saleCount,
      totalUsers,
      renters,
      owners,
      admins,
      totalPreferences,
      totalSearches,
      paymentAgg,
      totalRevenueAgg,
      searchAggregation,
      mostSearchedLocationsAgg,
      avgRatingAgg,
      engagementAgg,
      userGrowthAgg
    ] = await Promise.all([
      RentalProperty.countDocuments({ isActive: true }),
      SaleProperty.countDocuments({ isActive: true }),
      User.countDocuments(),
      User.countDocuments({ role: 'renter' }),
      User.countDocuments({ role: 'owner' }),
      User.countDocuments({ role: 'admin' }),
      UserPreferencesARIA.countDocuments(),
      SearchHistory.countDocuments(),
      // payment aggregation by status
      Payment.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } }
      ]),
      // total revenue for completed/approved
      Payment.aggregate([
        { $match: { status: { $in: ['completed', 'approved'] } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      // top searches
      SearchHistory.aggregate([{ $group: { _id: '$query', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 15 }]),
      // most searched locations
      SearchHistory.aggregate([{ $match: { location: { $exists: true, $ne: null } } }, { $group: { _id: '$location', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 10 }]),
      // average rating
      PropertyAnalysis.aggregate([{ $unwind: '$ratings' }, { $match: { 'ratings.rating': { $exists: true, $ne: null } } }, { $group: { _id: null, avgRating: { $avg: '$ratings.rating' } } }]),
      // engagement aggregates across all properties
      PropertyAnalysis.aggregate([{ $group: { _id: null, totalViews: { $sum: { $cond: [{ $isArray: '$views' }, { $size: '$views' }, 0] } }, totalSaves: { $sum: { $cond: [{ $isArray: '$saves' }, { $size: '$saves' }, 0] } }, totalRatings: { $sum: { $cond: [{ $isArray: '$ratings' }, { $size: '$ratings' }, 0] } } } }]),
      // user growth last 12 months
      User.aggregate([{ $match: { createdAt: { $gte: new Date(new Date().getFullYear() - 1, new Date().getMonth(), 1) } } }, { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } }, { $sort: { '_id.year': 1, '_id.month': 1 } }])
    ]);

    const totalProperties = rentalCount + saleCount;

    // process paymentAgg into map
    const paymentSummary = (paymentAgg || []).reduce((acc, cur) => { acc[cur._id] = { count: cur.count, totalAmount: cur.totalAmount }; return acc; }, {});
    const totalRevenue = (totalRevenueAgg && totalRevenueAgg[0] && totalRevenueAgg[0].total) || 0;

    // derive avgTransactionAmount from paymentAgg (defensive)
    const totalPaymentsCount = (paymentAgg || []).reduce((s, c) => s + (c.count || 0), 0);
    const totalPaymentsAmount = (paymentAgg || []).reduce((s, c) => s + (c.totalAmount || 0), 0);
    const avgTransactionAmount = totalPaymentsCount ? (totalPaymentsAmount / totalPaymentsCount) : 0;

    // process searches
    const topSearches = (searchAggregation || []).map(s => ({ query: s._id, count: s.count }));
    const mostSearchedLocations = (mostSearchedLocationsAgg || []).map(l => ({ location: l._id, count: l.count }));

    // Average searches per user (defensive: avoid division by zero)
    const uniqueSearchUsers = await SearchHistory.distinct('user');
    const uniqueSearchUsersCount = (Array.isArray(uniqueSearchUsers) && uniqueSearchUsers.length) ? uniqueSearchUsers.length : 1;
    const avgSearchesPerUser = totalSearches ? (totalSearches / uniqueSearchUsersCount) : 0;

    const averagePropertyRating = (avgRatingAgg && avgRatingAgg[0] && avgRatingAgg[0].avgRating) || 0;
    const engagementData = (engagementAgg && engagementAgg[0]) || { totalViews: 0, totalSaves: 0, totalRatings: 0 };
    const userGrowthFormatted = (userGrowthAgg || []).map(item => ({ year: item._id.year, month: item._id.month, count: item.count }));

    // AI users count (distinct emails) - efficient distinct
    const aiUsers = await UserPreferencesARIA.distinct('email');

    // Rewards totals
    const totalRewardsDistributed = await Reward.countDocuments();
    const unclaimedRewards = await Reward.countDocuments({ claimed: { $ne: true } });
    const recentRewards = await Reward.find().sort({ createdAt: -1 }).limit(5).select('user message createdAt').lean();

    // Active users in last 30 days - use distinct on each collection then unify
    const last30Days = new Date(); last30Days.setDate(last30Days.getDate() - 30);
    const [activeUsersPayments, activeUsersSearches, activeUsersProperties, activeUsersPropertiesSale] = await Promise.all([
      Payment.distinct('resident', { paymentDate: { $gte: last30Days } }),
      SearchHistory.distinct('user', { createdAt: { $gte: last30Days } }),
      RentalProperty.distinct('owner', { createdAt: { $gte: last30Days } }),
      SaleProperty.distinct('ownerId', { createdAt: { $gte: last30Days } })
    ]);
    const activeUsersSet = new Set([...(activeUsersPayments || []), ...(activeUsersSearches || []), ...(activeUsersProperties || []), ...(activeUsersPropertiesSale || [])]);
    const activeUsersCount = activeUsersSet.size;
    const inactiveUsersCount = totalUsers - activeUsersCount;

    // --- Lightweight property engagement stats for rental and sale (avoid heavy lookups)
    // Fetch active property ids (only _id) for rental and sale
    const [rentalPropertyIds, salePropertyIds] = await Promise.all([
      RentalProperty.find({ isActive: true }).select('_id').lean().then(docs => docs.map(d => d._id)),
      SaleProperty.find({ isActive: true }).select('_id').lean().then(docs => docs.map(d => d._id))
    ]);

    // Aggregations to compute simple engagement metrics per type
    const [rentalStatsAgg, saleStatsAgg] = await Promise.all([
      rentalPropertyIds.length ? PropertyAnalysis.aggregate([
        { $match: { property: { $in: rentalPropertyIds } } },
        { $group: {
          _id: null,
          totalViews: { $sum: { $cond: [ { $isArray: '$views' }, { $size: '$views' }, 0 ] } },
          totalSaves: { $sum: { $cond: [ { $isArray: '$saves' }, { $size: '$saves' }, 0 ] } },
          avgEngagementTime: { $avg: '$engagementTime' },
          count: { $sum: 1 }
        } }
      ]) : Promise.resolve([]),
      salePropertyIds.length ? PropertyAnalysis.aggregate([
        { $match: { property: { $in: salePropertyIds } } },
        { $group: {
          _id: null,
          totalViews: { $sum: { $cond: [ { $isArray: '$views' }, { $size: '$views' }, 0 ] } },
          totalSaves: { $sum: { $cond: [ { $isArray: '$saves' }, { $size: '$saves' }, 0 ] } },
          avgEngagementTime: { $avg: '$engagementTime' },
          count: { $sum: 1 }
        } }
      ]) : Promise.resolve([])
    ]);

    const rentalStatsData = (rentalStatsAgg && rentalStatsAgg[0]) ? rentalStatsAgg[0] : { totalViews: 0, totalSaves: 0, avgEngagementTime: 0, count: 0 };
    const saleStatsData = (saleStatsAgg && saleStatsAgg[0]) ? saleStatsAgg[0] : { totalViews: 0, totalSaves: 0, avgEngagementTime: 0, count: 0 };

    // --- Top properties by views/saves/ratings (limit topLimit) ---
    const topPropsAgg = await Promise.all([
      // top by views
      PropertyAnalysis.aggregate([{ $project: { property: 1, viewsCount: { $cond: [{ $isArray: '$views' }, { $size: '$views' }, 0] } } }, { $sort: { viewsCount: -1 } }, { $limit: topLimit }]),
      // top by saves
      PropertyAnalysis.aggregate([{ $project: { property: 1, savesCount: { $cond: [{ $isArray: '$saves' }, { $size: '$saves' }, 0] } } }, { $sort: { savesCount: -1 } }, { $limit: topLimit }]),
      // top by avg rating
      PropertyAnalysis.aggregate([{ $unwind: '$ratings' }, { $group: { _id: '$property', avgRating: { $avg: '$ratings.rating' } } }, { $sort: { avgRating: -1 } }, { $limit: topLimit }])
    ]);

    const topViewedIds = (topPropsAgg[0] || []).map(a => String(a.property || a._id));
    const topSavedIds = (topPropsAgg[1] || []).map(a => String(a.property || a._id));
    const topRatedIds = (topPropsAgg[2] || []).map(a => String(a._id));

    const uniqueTopIds = Array.from(new Set([...topViewedIds, ...topSavedIds, ...topRatedIds]));
    const topPropsMap = await fetchPropertiesByIds(uniqueTopIds);

    const topViewed = (topPropsAgg[0] || []).map(a => ({ property: topPropsMap.get(String(a.property)) || null, viewsCount: a.viewsCount }));
    const topSaved = (topPropsAgg[1] || []).map(a => ({ property: topPropsMap.get(String(a.property)) || null, savesCount: a.savesCount }));
    const topRated = (topPropsAgg[2] || []).map(a => ({ property: topPropsMap.get(String(a._id)) || null, avgRating: a.avgRating }));

    // --- Recent activity and approved payments (paginated small sets) ---
    const [recentUsersPag, recentRentalPropsPag, recentSalePropsPag, recentPaymentsPag] = await Promise.all([
      User.find().sort({ createdAt: -1 }).skip(recentSkip).limit(pageSize).select('email createdAt').lean(),
      RentalProperty.find({ isActive: true }).sort({ createdAt: -1 }).limit(pageSize).select('propertyType Sector address createdAt').lean(),
      SaleProperty.find({ isActive: true }).sort({ createdAt: -1 }).limit(pageSize).select('propertyType Sector address createdAt').lean(),
      Payment.find().sort({ paymentDate: -1 }).skip(recentSkip).limit(pageSize).select('amount resident paymentDate').populate('resident', 'email').lean()
    ]);

    const recentProperties = [...recentRentalPropsPag, ...recentSalePropsPag].slice(0, pageSize);
    const recentUserActivities = (recentUsersPag || []).map(u => ({ type: 'user', user: u.email || 'Unknown User', action: 'New User Registered', location: '-', time: u.createdAt }));
    const recentPropertyActivities = recentProperties.map(p => ({ type: 'property', user: 'Admin', action: 'New Property Added', location: `${p.propertyType || 'Property'} in ${p.Sector || p.address || 'Unknown'}`, time: p.createdAt }));
    const recentPaymentActivities = (recentPaymentsPag || []).map(p => ({ type: 'payment', user: p.resident?.email || 'Unknown User', action: 'Payment Made', location: `₹${p.amount}`, time: p.paymentDate }));
    const recentActivity = [ ...recentUserActivities, ...recentPropertyActivities, ...recentPaymentActivities ].sort((a,b) => new Date(b.time) - new Date(a.time)).slice(0, pageSize);

    // Approved payments paginated
    const approvedPaymentsRaw = await Payment.find({ status: 'approved' }).sort({ paymentDate: -1 }).skip(approvedSkip).limit(pageSize).populate('resident', 'email').lean();
    const approvedPropertyIds = approvedPaymentsRaw.map(p => p.property).filter(Boolean).map(String);
    const approvedPropsMapFinal = await fetchPropertiesByIds(approvedPropertyIds);
    const approvedPayments = approvedPaymentsRaw.map(p => ({ ...p, property: approvedPropsMapFinal.get(String(p.property)) || null }));

    // Build charts object (small)
    const charts = {
      userGrowth: userGrowthFormatted,
      aiUsageByRole: {},
      propertyStats: { rental: rentalStatsData, sale: saleStatsData, topViewed, topSaved, topRated },
      revenueByMethod: (paymentSummary || {}),
      engagement: engagementData,
      rewards: { totalRewards: totalRewardsDistributed, unclaimedRewards, recentRewards },
      searchInsights: { topSearches, mostSearchedLocations, avgSearchesPerUser }
    };

    // Summary object
    const summary = {
      totalUsers,
      renters,
      owners,
      admins,
      totalProperties,
      rentalCount,
      saleCount,
      pendingPayments: paymentSummary['pending']?.count || 0,
      approvedPayments: paymentSummary['approved']?.count || 0,
      approvedPaymentsThisMonth: (await Payment.countDocuments({ status: 'approved', paymentDate: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } })) || 0,
      completedPayments: paymentSummary['completed']?.count || 0,
      totalRevenue,
      totalPreferences,
      totalSearches,
      totalSearchesCount: totalSearches,
      averagePropertyRating,
      aiUsersCount: aiUsers.length,
      activeUsersCount,
      inactiveUsersCount,
      totalRewardsDistributed,
      totalRevenuePending: paymentSummary['pending']?.totalAmount || 0,
      totalRevenueCompleted: paymentSummary['completed']?.totalAmount || 0,
      totalRevenueApproved: paymentSummary['approved']?.totalAmount || 0,
      avgTransactionAmount: avgTransactionAmount
    };

    // Cache heavy payload (summary + charts) for short period
    global.__adminOverviewCache = { ts: nowTs, payload: { summary, charts } };

    return res.status(200).json({
      summary,
      charts,
      recentActivity,
      approvedPayments,
      metadata: { approvedPage, recentPage, pageSize, topLimit },
      cached: false
    });
  } catch (error) {
    console.error('Error fetching admin overview (optimized):', error);
    res.status(500).json({ message: 'Error fetching admin overview', error: error.message });
  }
};

const getAllUsersDetailed = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;
    const totalUsers = await User.countDocuments();
    const users = await User.find().skip(skip).limit(limit);

    const detailedUsers = await Promise.all(users.map(async (user) => {
      const userId = user._id;

      // AI Assistant usage: fetch ALL preference documents for this user (rental + sale)
      const rawAiUsageDocs = await UserPreferencesARIA.find({ email: user.email }).lean();

      // Normalize into a single object expected by frontend: { rentalPreferences: {...}, salePreferences: {...} }
      let aiUsage = null;
      if (Array.isArray(rawAiUsageDocs) && rawAiUsageDocs.length > 0) {
        const combined = { rentalPreferences: {}, salePreferences: {} };
        rawAiUsageDocs.forEach(doc => {
          const type = (doc.assistantType || '').toString().toLowerCase();
          if (type === 'rental') combined.rentalPreferences = doc.preferences || {};
          else if (type === 'sale') combined.salePreferences = doc.preferences || {};
          else combined[type] = doc.preferences || {};
        });
        aiUsage = combined;
      } else {
        aiUsage = null;
      }

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

    res.status(200).json({
      page,
      limit,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      users: detailedUsers
    });
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
    // Pagination params (default to page=1, limit=10)
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
    const skip = (page - 1) * limit;

    // Fetch rental and sale properties (only required fields for admin listing)
    const [rentalProperties, saleProperties, reviewStatuses] = await Promise.all([
      RentalProperty.find().populate('owner', 'name email').lean(),
      SaleProperty.find().populate('ownerId', 'name email').lean(),
      PropertyReviewStatus.find().lean()
    ]);

    // Merge and normalize properties with review info and a unified owner field
    let allProperties = [
      ...rentalProperties.map((prop) => {
        const review = reviewStatuses.find(r => r.propertyId.toString() === prop._id.toString());
        return {
          ...prop,
          owner: prop.owner || null,
          defaultpropertytype: 'rental',
          isReviewed: review ? review.isReviewed : false,
          createdAt: prop.createdAt || null
        };
      }),
      ...saleProperties.map((prop) => {
        const review = reviewStatuses.find(r => r.propertyId.toString() === prop._id.toString());
        return {
          ...prop,
          owner: prop.ownerId || null,
          defaultpropertytype: 'sale',
          isReviewed: review ? review.isReviewed : false,
          createdAt: prop.createdAt || null
        };
      })
    ];

    // Sort by createdAt descending (newest first)
    allProperties.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = allProperties.length;
    const totalPages = Math.ceil(total / limit);

    // Paginate the merged array
    const paginated = allProperties.slice(skip, skip + limit);

    res.status(200).json({
      page,
      limit,
      total,
      totalPages,
      properties: paginated
    });
  } catch (error) {
    console.error('Error fetching all properties:', error);
    res.status(500).json({
      message: 'Server error while fetching all properties',
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
