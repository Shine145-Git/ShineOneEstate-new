const express = require("express");
const router = express.Router();

const multer = require("multer");
const excelUpload = multer({ storage: multer.memoryStorage() });

const upload = require("../middleware/multer");
const { verifyToken } = require("../middleware/auth");

// Controllers
const { requestOtp, verifyOtp } = require("../controllers/login.controller");
const { userDetails, saveUserDetails, getUserDetails } = require("../controllers/userdetails.controller");
const { logoutUser } = require("../controllers/logout.controller");


const {
  createRentalProperty,
  getAllProperties,
  bulkUploadProperties,
  getMyProperties,
} = require("../controllers/Rentalproperty.controller.js");
const { getUserDashboard, searchProperties, getSearchHistory, searchPropertiesonLocation } = require("../controllers/Searchproperties.controller");
const { getPendingPayments, updatePaymentStatus, getApprovedPayments } = require("../controllers/admin.controller");
const { predictPrice } = require("../controllers/aimodel.controller");
const { distributeReward, checkEligibility } = require("../controllers/rewards.controller");
const { createPayment, getPaymentsForUser } = require("../controllers/payment.controller");
const { requestCallback, getCallbackRequests } = require("../controllers/Customersupport.js");
const { getChatResponse, getInitialQuestions } = require("../controllers/ChatBot.controller.js");
const { createSaleProperty, getSaleProperties } = require("../controllers/Saleproperty.controller");
const {getRentalPropertyById , getSalePropertyById} = require("../controllers/Viewproperties.controller");
const { saveAiResponses, getAiResponses } = require("../controllers/AiAssistant.controller.js");

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

// Property routes

router.post("/api/properties/bulk-upload", verifyToken, excelUpload.single("file"), bulkUploadProperties);
router.post("/api/properties/bulk-upload-csv", verifyToken, excelUpload.single("file"), bulkUploadProperties);
router.get("/api/properties", verifyToken, getAllProperties);
router.get("/api/properties/my", verifyToken, getMyProperties);
router.get("/api/getRentalproperties/:id", getRentalPropertyById);


// Search routes
router.get("/api/search-properties",verifyToken, searchProperties);
router.get("/api/search-history", verifyToken, getSearchHistory);
router.post("/api/search-properties-on-location", verifyToken, searchPropertiesonLocation);

// Payment routes
router.post("/api/payment", verifyToken, createPayment);
router.get("/api/payment", verifyToken, getPaymentsForUser);

// Admin routes
router.get("/api/admin/pending-payments", verifyToken, checkAdminEmail, getPendingPayments);
router.post("/api/admin/update-payment-status", verifyToken, checkAdminEmail, updatePaymentStatus);
router.get("/api/admin/approved-payments", verifyToken, checkAdminEmail, getApprovedPayments);
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

module.exports = router;
