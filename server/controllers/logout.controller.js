const User = require("../models/user.model");

const logoutUser = async (req, res) => {
  try {
    // Clear cookies
    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("refreshToken", { path: "/" });

    // Clear OTP and refresh token in DB if stored
    if (req.user) {
      req.user.otp = undefined;
      req.user.refreshToken = undefined; // Clear refresh token in DB
      await req.user.save();
    }

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { logoutUser };