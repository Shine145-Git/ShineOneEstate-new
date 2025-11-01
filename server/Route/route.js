const express = require("express");
const router = express.Router();

const multer = require("multer");
const excelUpload = multer({ storage: multer.memoryStorage() });

const upload = require("../middleware/multer");
const { verifyToken, verifyTokenOptional } = require("../middleware/auth");

// Controllers
const { requestOtp, verifyOtp } = require("../controllers/login.controller");
const { userDetails, saveUserDetails, getUserDetails, getMyProperties, updateProperty, deleteProperty } = require("../controllers/userdetails.controller");
const { logoutUser } = require("../controllers/logout.controller");
const { saveUserPreferencesRENTALARIA , saveUserPreferencesSALEARIA } = require("../controllers/userPreferencesARIA.controller.js");

const {
  createRentalProperty,
  getAllRentalProperties,
  
} = require("../controllers/Rentalproperty.controller.js");
const { getUserDashboard, searchProperties,getSectorSuggestions, getSearchHistory, searchPropertiesonLocation } = require("../controllers/Searchproperties.controller");
const { getPendingPayments, updatePaymentStatus, getApprovedPayments , getAdminOverview , getAllUsersDetailed , getCallbackRequests } = require("../controllers/admin.controller");
const { predictPrice } = require("../controllers/aimodel.controller");
const { distributeReward, checkEligibility } = require("../controllers/rewards.controller");
const { createPayment, getPaymentsForUser } = require("../controllers/payment.controller");
const { requestCallback } = require("../controllers/Customersupport.js");
const { getChatResponse, getInitialQuestions } = require("../controllers/ChatBot.controller.js");
const { createSaleProperty, getSaleProperties } = require("../controllers/Saleproperty.controller");
const {getRentalPropertyById , getSalePropertyById , getPropertyById , getAllProperties} = require("../controllers/Viewproperties.controller");
const { saveAiResponses, getAiResponses } = require("../controllers/AiAssistant.controller.js");
const { addView, addSave, addEngagementTime, addRating, getMetrics, getLeadConversion, getSavedProperties , getUserPropertyMetrics } = require("../controllers/PropertyAnalysis.controller.js");

// Helper middleware to restrict access to admins only
const checkAdminEmail = (req, res, next) => {
  const adminEmails = ["tanushchawla16@gmail.com", "bharatchawla2002@yahoo.com"];
  if (!req.user || !adminEmails.includes(req.user.email)) {
    return res.status(403).json({ message: "Access denied: Admins only" });
  }
  next();
};

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
router.put("/api/user/update-property/:id", verifyToken, upload.array("images" , 8), updateProperty);
router.delete("/api/user/delete-property/:id", verifyToken, deleteProperty);

// ================== PROPERTY ROUTES ==================
router.get("/api/properties",  verifyTokenOptional, getAllProperties);
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
router.post("/api/addsaleproperties", verifyToken, upload.array("images", 8), createSaleProperty);
router.post("/api/addrentproperties", verifyToken, upload.array("images", 8), createRentalProperty);

// ================== PROPERTY ANALYTICS ROUTES ==================
router.post("/api/property-analysis/addView", verifyToken, addView);
router.post("/api/property-analysis/addSave", verifyToken, addSave);
// router.post("/api/property-analysis/addEnquiry", verifyToken, addEnquiry);
router.post("/api/property-analysis/addEngagementTime", verifyToken, addEngagementTime);
router.post("/api/property-analysis/addRating", verifyToken, addRating);
router.get("/api/property-analysis/:id", verifyToken, getMetrics);
router.get("/api/property-analysis/:id/conversion", verifyToken, getLeadConversion);
router.get("/api/property-analysis/saved-properties", verifyToken, getSavedProperties);
router.get("/api/property-analytics/user-metrics", verifyToken, getUserPropertyMetrics);

// ================== USER PREFERENCES (ARIA ASSISTANT) ==================
router.post("/api/user/preferences-RENT-aria", verifyToken, saveUserPreferencesRENTALARIA);
router.post("/api/user/preferences-SALE-aria", verifyToken, saveUserPreferencesSALEARIA);

module.exports = router;
