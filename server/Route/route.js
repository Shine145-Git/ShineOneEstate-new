const express = require("express");
const router = express.Router();

const multer = require("multer");
const excelUpload = multer({ storage: multer.memoryStorage() });

const upload = require("../middleware/multer");
const { verifyToken } = require("../middleware/auth");

// Controllers
const { requestOtp, verifyOtp } = require("../controllers/login.controller");
const { userDetails, saveUserDetails, getUserDetails, getMyProperties, updateProperty, deleteProperty } = require("../controllers/userdetails.controller");
const { logoutUser } = require("../controllers/logout.controller");
const { saveUserPreferencesRENTALARIA , saveUserPreferencesSALEARIA } = require("../controllers/userPreferencesARIA.controller.js");

const {
  createRentalProperty,
  getAllProperties,
  bulkUploadProperties,
} = require("../controllers/Rentalproperty.controller.js");
const { getUserDashboard, searchProperties,getSectorSuggestions, getSearchHistory, searchPropertiesonLocation } = require("../controllers/Searchproperties.controller");
const { getPendingPayments, updatePaymentStatus, getApprovedPayments , getAdminOverview , getAllUsersDetailed , getCallbackRequests } = require("../controllers/admin.controller");
const { predictPrice } = require("../controllers/aimodel.controller");
const { distributeReward, checkEligibility } = require("../controllers/rewards.controller");
const { createPayment, getPaymentsForUser } = require("../controllers/payment.controller");
const { requestCallback } = require("../controllers/Customersupport.js");
const { getChatResponse, getInitialQuestions } = require("../controllers/ChatBot.controller.js");
const { createSaleProperty, getSaleProperties } = require("../controllers/Saleproperty.controller");
const {getRentalPropertyById , getSalePropertyById} = require("../controllers/Viewproperties.controller");
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



// Auth routes

router.post("/login/request-otp", requestOtp);
router.post("/login/verify-otp", verifyOtp);
router.get("/auth/me", verifyToken, userDetails);
router.post("/auth/logout", verifyToken, logoutUser);

// User routes

router.post("/api/user/save-details", verifyToken, saveUserDetails);
router.get("/api/user/details", verifyToken, getUserDetails);
router.get("/api/user/dashboard", verifyToken, getUserDashboard);

router.get("/api/properties/my", verifyToken, getMyProperties);
router.put("/api/user/update-property/:id", verifyToken, updateProperty);
router.delete("/api/user/delete-property/:id", verifyToken, deleteProperty);

// Property routes

router.post("/api/properties/bulk-upload", verifyToken, excelUpload.single("file"), bulkUploadProperties);
router.post("/api/properties/bulk-upload-csv", verifyToken, excelUpload.single("file"), bulkUploadProperties);
router.get("/api/properties",  getAllProperties);
// router.get("/api/properties/my", verifyToken, getMyProperties);
router.get("/api/getRentalproperties/:id", getRentalPropertyById);


// Search routes
router.get("/api/search-properties",verifyToken, searchProperties);
router.get("/api/search-history", verifyToken, getSearchHistory);
router.post("/api/search-properties-on-location", verifyToken, searchPropertiesonLocation);
router.get("/api/get-sector-suggestions", verifyToken, getSectorSuggestions);

// Payment routes
router.post("/api/payment", verifyToken, createPayment);
router.get("/api/payment", verifyToken, getPaymentsForUser);

// Admin routes
router.get("/admin/ping", (req, res) => {
  res.status(200).json({ message: "Admin route is working!" });
});
router.get("/api/admin/pending-payments", verifyToken, checkAdminEmail, getPendingPayments);
router.post("/api/admin/update-payment-status", verifyToken, checkAdminEmail, updatePaymentStatus);
router.get("/api/admin/approved-payments", verifyToken, checkAdminEmail, getApprovedPayments);
router.get('/api/admin/overview', verifyToken, checkAdminEmail, getAdminOverview);
router.get('/admin/usermanagement', verifyToken, checkAdminEmail, getAllUsersDetailed);
router.get("/api/get-callback-requests", verifyToken, checkAdminEmail, getCallbackRequests);



// AI routes
router.post("/api/predict-price", verifyToken, predictPrice);

// Rewards routes
router.post("/api/distribute-reward", verifyToken, distributeReward);
router.get("/api/check-eligibility", verifyToken, checkEligibility);

// Customer support routes
router.post("/api/request-callback", verifyToken, requestCallback);


// Property enquiry routes
const { createEnquiry, getEnquiries } = require("../controllers/Enquiry.controller.js");
router.post("/api/enquiry", verifyToken, createEnquiry);
router.get("/api/enquiry", verifyToken, checkAdminEmail, getEnquiries);

// Chat routes
router.post("/api/chatbot", getChatResponse);
router.get("/api/chatbot/initial-questions", getInitialQuestions);

// Sale property routes
router.get("/api/getSaleproperties/:id", getSalePropertyById);
router.post("/api/addsaleproperties", verifyToken, upload.array("images", 8), createSaleProperty);
router.post("/api/addrentproperties", verifyToken, upload.array("images", 8), createRentalProperty);


// New AI response routes
router.post("/api/ai/save", verifyToken, saveAiResponses);
router.get("/api/ai/get", verifyToken, getAiResponses);

// Property analytics routes
router.post("/api/property-analysis/addView", verifyToken, addView);
router.post("/api/property-analysis/addSave", verifyToken, addSave);
// router.post("/api/property-analysis/addEnquiry", verifyToken, addEnquiry);
router.post("/api/property-analysis/addEngagementTime", verifyToken, addEngagementTime);
router.post("/api/property-analysis/addRating", verifyToken, addRating);
router.get("/api/property-analysis/:id", verifyToken, getMetrics);
router.get("/api/property-analysis/:id/conversion", verifyToken, getLeadConversion);
router.get("/api/property-analysis/saved-properties", verifyToken, getSavedProperties);
router.get("/api/property-analytics/user-metrics", verifyToken, getUserPropertyMetrics);

// User Preferences (ARIA Assistant)

router.post("/api/user/preferences-RENT-aria", verifyToken, saveUserPreferencesRENTALARIA);
router.post("/api/user/preferences-SALE-aria", verifyToken, saveUserPreferencesSALEARIA);

module.exports = router;
