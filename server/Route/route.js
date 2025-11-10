// ================== SERVICE REQUEST ROUTES ==================
const { createServiceRequest, getServiceRequests, updateServiceRequestStatus } = require("../controllers/Services.controller");

;
const express = require("express");
const router = express.Router();
const User = require("../models/user.model.js");

const multer = require("multer");
const excelUpload = multer({ storage: multer.memoryStorage() });

const upload = require("../middleware/multer");
const { verifyToken, verifyTokenOptional } = require("../middleware/auth");

// Controllers
const { requestOtp, verifyOtp } = require("../controllers/login.controller");
const { userDetails, saveUserDetails, getUserDetails, getMyProperties, updateProperty, deleteProperty } = require("../controllers/userdetails.controller");
const { logoutUser } = require("../controllers/logout.controller");
const { saveUserPreferencesARIA } = require("../controllers/userPreferencesARIA.controller.js");

const {
  createRentalProperty,
  getAllRentalProperties,
  
} = require("../controllers/Rentalproperty.controller.js");
const { getUserDashboard, searchProperties,getSectorSuggestions, getSearchHistory, searchPropertiesonLocation } = require("../controllers/Searchproperties.controller");
const { getPendingPayments, updatePaymentStatus, getApprovedPayments , getAdminOverview , getAllUsersDetailed , getCallbackRequests , getUserRewardsStatus, toggleActiveStatus, toggleReviewStatus, updateUserRole , getAllProperties , updateServiceRequestDetails } = require("../controllers/admin.controller");
const { predictPrice } = require("../controllers/aimodel.controller");
const { distributeReward, checkEligibility } = require("../controllers/rewards.controller");
const { createPayment, getPaymentsForUser } = require("../controllers/payment.controller");
const { requestCallback } = require("../controllers/Customersupport.js");
const { getChatResponse, getInitialQuestions } = require("../controllers/ChatBot.controller.js");
const { createSaleProperty, getSaleProperties } = require("../controllers/Saleproperty.controller");
const {getRentalPropertyById , getSalePropertyById , getPropertyById , getAllActiveProperties} = require("../controllers/Viewproperties.controller");
const { saveAiResponses, getAiResponses } = require("../controllers/AiAssistant.controller.js");
const { addView, addSave, addEngagementTime, addRating, getMetrics, getLeadConversion, getSavedProperties , getUserPropertyMetrics } = require("../controllers/PropertyAnalysis.controller.js");
const { getLocationIQApiKey } = require("../controllers/mapintegration.js");
const {getAccountsUsage , getBrevoUsage , getLocationIQUsage} = require("../controllers/admin.Accountsusage.js");
const { getNews } = require("../controllers/news.controller");

// Helper middleware to restrict access to admins only
const checkAdminEmail = async (req, res, next) => {
  try {
    // Ensure the user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: No user data found" });
    }

    // Fetch the user from the database
    const user = await User.findById(req.user.id);

    // Check if user exists and has admin role
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    // Attach user to request for further usage
    req.user = user;
    next();
  } catch (error) {
    console.error("Error in checkAdminEmail middleware:", error);
    res.status(500).json({ message: "Server error verifying admin access" });
  }
};
router.get("/api/users", verifyToken, checkAdminEmail, async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter).select("email role");
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error fetching users" });
  }
});

// ================== AUTH ROUTES ==================
router.post("/login/request-otp", requestOtp);
router.post("/login/verify-otp", verifyOtp);
router.get("/auth/me", verifyToken, userDetails);
router.post("/auth/logout", verifyToken, logoutUser);

// ================== USER ROUTES ==================
router.post("/api/user/save-details", verifyToken, saveUserDetails);
router.get("/api/user/details", verifyToken, getUserDetails);
router.get("/api/user/dashboard", verifyToken, getUserDashboard);
router.get("/api/properties/my", verifyToken, getMyProperties);
router.put(
  "/api/user/update-property/:id",
  verifyToken,
  upload.fields([
    { name: "images", maxCount: 8 },
    { name: "panoFiles", maxCount: 6 },
  ]),
  updateProperty
);
router.delete("/api/user/delete-property/:id", verifyToken, deleteProperty);

// ================== PROPERTY ROUTES ==================
router.get("/api/activeproperties", verifyTokenOptional, getAllActiveProperties);
router.get("/api/getRentalproperties/:id", verifyTokenOptional, getRentalPropertyById);
router.get("/api/properties/:id", verifyToken, getPropertyById);

// ================== SEARCH ROUTES ==================
router.get("/api/search-properties", verifyTokenOptional, searchProperties);
router.get("/api/search-history", verifyToken, getSearchHistory);
router.post("/api/search-properties-on-location", verifyToken, searchPropertiesonLocation);
router.get("/api/get-sector-suggestions", verifyToken, getSectorSuggestions);

// ================== PAYMENT ROUTES ==================
router.post("/api/payment", verifyToken, createPayment);
router.get("/api/payment", verifyToken, getPaymentsForUser);

// ================== ADMIN ROUTES ==================
router.get("/admin/ping", (req, res) => {
  res.status(200).json({ message: "Admin route is working!" });
});
router.get("/api/admin/pending-payments", verifyToken, checkAdminEmail, getPendingPayments);
router.post("/api/admin/update-payment-status", verifyToken, checkAdminEmail, updatePaymentStatus);
router.get("/api/admin/approved-payments", verifyToken, checkAdminEmail, getApprovedPayments);
router.get('/api/admin/overview', verifyToken, checkAdminEmail, getAdminOverview);
router.get('/admin/usermanagement', verifyToken, checkAdminEmail, getAllUsersDetailed);
router.get("/api/get-callback-requests", verifyToken, checkAdminEmail, getCallbackRequests);
// New admin route for fetching reward status per user
router.get("/api/admin/rewards/:userId", verifyToken, checkAdminEmail, getUserRewardsStatus);

router.patch("/api/admin/update-role", verifyToken, checkAdminEmail, updateUserRole);
router.get("/api/properties", verifyToken, checkAdminEmail, getAllProperties);
router.get('/api/admin/cloudinary/usage',  getAccountsUsage);
router.get('/api/admin/brevo/usage', getBrevoUsage);
router.get('/api/admin/locationiq/usage', getLocationIQUsage);
// Admin updates status of any request
router.patch("/api/admin/services/:id/status", verifyToken, checkAdminEmail, updateServiceRequestDetails)

// ================== PROPERTY STATUS ROUTES (ADMIN) ==================
router.patch("/api/admin/property/:id/toggle-active", verifyToken, checkAdminEmail, toggleActiveStatus);
router.patch("/api/admin/property/:id/toggle-review", verifyToken, checkAdminEmail, toggleReviewStatus);


// ================== AI ROUTES ==================
router.post("/api/predict-price", verifyToken, predictPrice);

// ================== REWARDS ROUTES ==================
router.post("/api/distribute-reward", verifyToken, distributeReward);
router.get("/api/check-eligibility", verifyToken, checkEligibility);

// ================== CUSTOMER SUPPORT ROUTES ==================
router.post("/api/request-callback", verifyToken, requestCallback);

// ================== ENQUIRY ROUTES ==================
const { createEnquiry, getEnquiries } = require("../controllers/Enquiry.controller.js");
router.post("/api/enquiry", verifyToken, createEnquiry);
router.get("/api/enquiry", verifyToken, checkAdminEmail, getEnquiries);

// ================== CHATBOT ROUTES ==================
router.post("/api/chatbot", getChatResponse);
router.get("/api/chatbot/initial-questions", getInitialQuestions);

// ================== SALE & RENTAL PROPERTY ROUTES ==================
router.get("/api/getSaleproperties/:id", verifyTokenOptional, getSalePropertyById);
router.post(
  "/api/addsaleproperties",
  verifyToken,
  upload.fields([
    { name: "images", maxCount: 8 },
    { name: "panoFiles", maxCount: 6 },
  ]),
  createSaleProperty
);
router.post(
  "/api/addrentproperties",
  verifyToken,
  upload.fields([
    { name: "images", maxCount: 8 },
    { name: "panoFiles", maxCount: 6 },
  ]),
  createRentalProperty
);

// ================== MAP INTEGRATION ROUTES ==================
router.get("/api/locationqapi", getLocationIQApiKey);

// ================== PROPERTY ANALYTICS ROUTES ==================
router.post("/api/property-analysis/addView", verifyToken, addView);
router.post("/api/property-analysis/addSave", verifyToken, addSave);
// router.post("/api/property-analysis/addEnquiry", verifyToken, addEnquiry);
router.post("/api/property-analysis/addEngagementTime", verifyToken, addEngagementTime);
router.post("/api/property-analysis/addRating", verifyToken, addRating);
router.get("/api/property-analysis/:id", verifyToken, getMetrics);
router.get("/api/property-analysis/:id/conversion", verifyToken, getLeadConversion);
router.get("/api/propertyAanalysis/savedProperties", verifyToken, getSavedProperties);
router.get("/api/property-analytics/user-metrics", verifyToken, getUserPropertyMetrics);

// ================== USER PREFERENCES (ARIA ASSISTANT) ==================
router.post("/api/user/preferences-RENT-aria", verifyToken, (req, res) => {
  req.body.assistantType = "rental";
  saveUserPreferencesARIA(req, res);
})

router.post("/api/user/preferences-SALE-aria", verifyToken, (req, res) => {
  req.body.assistantType = "sale";
  saveUserPreferencesARIA(req, res);
});

// ================== Services API ==================
// Create a new service request (owner or renter)
router.post("/api/createservices", verifyToken, createServiceRequest);

// Fetch service requests with pagination (admin can view all, user sees only their own)
router.get("/api/services", verifyToken, getServiceRequests);

// User updates status of their own request
router.patch("/api/services/:id/status", verifyToken, updateServiceRequestStatus);


// ================== News API ==================
router.get('/api/news', getNews);






module.exports = router;
