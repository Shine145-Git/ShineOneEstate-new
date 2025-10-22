const User = require("../models/user.model");
const sendEmail = require("../utils/sendEmail"); // Import the sendEmail module
const jwt = require("jsonwebtoken");

// Generate a random 6-digit OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Request OTP
exports.requestOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, role: "renter" });
    }

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000; // valid for 5 minutes
    console.log(`Generated OTP for ${email}: ${otp}`); // Log OTP for debugging
    await user.save();

    // try {
    //   await sendEmail(email, "Your OTP Code", `Your OTP code is ${otp}. It will expire in 5 minutes.`);
    //   console.log("OTP email sent successfully to:", email);
    // } catch (emailError) {
    //   console.error(`Failed to send OTP email to ${email}:`, emailError);
    //   return res.status(500).json({ message: "Failed to send OTP email" });
    // }

    return res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp, mobileNumber } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    try {
      if (user.otp !== otp || user.otpExpiry < Date.now()) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }
    } catch (otpCheckError) {
      console.error("Error during OTP verification:", otpCheckError);
      return res.status(500).json({ message: "Server error during OTP verification" });
    }

    if (mobileNumber) {
      user.mobileNumber = mobileNumber;
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;

    const accessToken = user.getAccessToken();
    const refreshToken = user.getRefreshToken();
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "Login successful",
      user: { email: user.email, role: user.role, name: user.name, mobileNumber: user.mobileNumber },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};