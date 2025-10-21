const express = require("express");
const router = express.Router();
const { requestOtp, verifyOtp } = require("../controllers/login.controller");
const {
  userDetails,
  saveUserDetails,
  getUserDetails,
} = require("../controllers/userdetails.controller");
const { verifyToken } = require("../middleware/auth");
const { logoutUser } = require("../controllers/logout.controller");
const { savePreferences } = require("../controllers/AiUser.controller");
const {
  createProperty,
  getAllProperties,
  getPropertyById,
  bulkUploadProperties,
  getMyProperties,
} = require("../controllers/Rentalproperty.controller.js");
const multer = require("multer");
const excelUpload = multer({ storage: multer.memoryStorage() });
const upload = require("../middleware/multer");
const {
  getUserDashboard,
} = require("../controllers/Searchproperties.controller.js");
const {
  getPendingPayments,
  updatePaymentStatus,
  getApprovedPayments,
} = require("../controllers/admin.controller");
const {
  searchProperties,
  getSearchHistory,
  searchPropertiesonLocation,
} = require("../controllers/Searchproperties.controller");
const { predictPrice } = require("../controllers/aimodel.controller");
const {
  distributeReward,
  checkEligibility,
} = require("../controllers/rewards.controller");
const {
  createPayment,
  getPaymentsForUser,
} = require("../controllers/payment.controller");
const {
  requestCallback,
  getCallbackRequests,
} = require("../controllers/Customersupport.js");
const { getChatResponse } = require("../controllers/ChatBot.controller.js");
const {
  createSaleProperty,
  getSaleProperties,
} = require("../controllers/Saleproperty.controller.js");

const checkAdminEmail = (req, res, next) => {
  const adminEmails = ["tanushchawla16@gmail.com", "superuser@example.com"];
  if (!req.user || !adminEmails.includes(req.user.email)) {
    return res.status(403).json({ message: "Access denied: Admins only" });
  }
  next();
};

router.post("/login/request-otp", requestOtp);
router.post("/login/verify-otp", verifyOtp);
router.get("/auth/me", verifyToken, userDetails);
router.post("/auth/logout", verifyToken, logoutUser);
router.post("/save-preferences", savePreferences);
router.post(
  "/api/properties",
  verifyToken,
  upload.array("images", 8),
  createProperty
);
router.post(
  "/api/properties/bulk-upload",
  verifyToken,
  excelUpload.single("file"),
  bulkUploadProperties
);
router.post(
  "/api/properties/bulk-upload-csv",
  verifyToken,
  excelUpload.single("file"),
  bulkUploadProperties
);
router.get("/api/properties", verifyToken, getAllProperties);
router.get("/api/properties/my", verifyToken, getMyProperties);
router.get("/api/user/dashboard", verifyToken, getUserDashboard);
router.get("/api/search-properties",  searchProperties);
router.get("/api/search-history", verifyToken, getSearchHistory);
router.post(
  "/api/search-properties-on-location",
  verifyToken,
  searchPropertiesonLocation
);
router.get("/api/properties/:id",  getPropertyById);
router.post("/api/payment", verifyToken, createPayment);
router.get("/api/payment", verifyToken, getPaymentsForUser);
router.get(
  "/api/admin/pending-payments",
  verifyToken,
  checkAdminEmail,
  getPendingPayments
);
router.post(
  "/api/admin/update-payment-status",
  verifyToken,
  checkAdminEmail,
  updatePaymentStatus
);
router.get(
  "/api/admin/approved-payments",
  verifyToken,
  checkAdminEmail,
  getApprovedPayments
);
router.post("/api/user/save-details", verifyToken, saveUserDetails);
router.get("/api/user/details", verifyToken, getUserDetails);
router.post("/api/predict-price", verifyToken, predictPrice);
router.post("/api/distribute-reward", verifyToken, distributeReward);
router.get("/api/check-eligibility", verifyToken, checkEligibility);
router.post("/api/request-callback", verifyToken, requestCallback);
router.get(
  "/api/get-callback-requests",
  verifyToken,
  checkAdminEmail,
  getCallbackRequests
);
router.post("/api/chat", getChatResponse);
router.get("/api/sale-properties",verifyToken, getSaleProperties);
router.post("/api/sale-properties", verifyToken,upload.array("images", 8), createSaleProperty);

module.exports = router;
