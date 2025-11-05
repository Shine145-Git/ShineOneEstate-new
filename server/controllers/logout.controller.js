// Controller: Handles user logout functionality by clearing authentication cookies and removing sensitive tokens from the database.

// ========================
// Import Dependencies
// ========================
const User = require("../models/user.model");

// ========================
// Controller Functions
// ========================

const logoutUser = async (req, res) => {
  try {
    // Destructure user from request object
    const { user } = req;

    // Step 1: Clear authentication cookies from client
res.clearCookie("accessToken", { path: "/", httpOnly: true, secure: true, sameSite: "none" });
res.clearCookie("refreshToken", { path: "/", httpOnly: true, secure: true, sameSite: "none" });

    // Step 2: If user is authenticated, clear OTP and refresh token stored in database
    if (user) {
      user.otp = undefined;
      user.refreshToken = undefined; // Clear refresh token in DB
      await user.save(); // Persist changes to database
    }

    // Step 3: Respond with success message after logout
    return res.status(200).json({ message: "Logged out successfully" });

  } catch (err) {
    // Handle unexpected errors during logout process
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ========================
// Module Exports
// ========================

module.exports = { logoutUser };