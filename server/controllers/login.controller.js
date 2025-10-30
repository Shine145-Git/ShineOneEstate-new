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
    await user.save();

    // Development mode: skip sending email, just log OTP
    if (process.env.NODE_ENV === 'development') {
      return res.status(200).json({ message: "OTP sent successfully (DEV mode)", otp }); // optional: send otp in response for dev testing
    }

    // Production mode: send via Brevo
    const emailParams = {
      to: email,
      subject: "Your OTP Code for ggnRentalDeals",
      text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
      html: `<p><strong>Your OTP code:</strong> ${otp}</p><p>This code will expire in 5 minutes.</p>`
    };

    try {
      await sendEmail(emailParams);
      return res.status(200).json({ message: "OTP sent successfully" });
    } catch (emailError) {
      return res.status(500).json({ message: "Failed to send OTP email", error: emailError.message });
    }
  } catch (error) {
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
      secure: true,
      sameSite: "None",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "Login successful",
      user: { email: user.email, role: user.role, name: user.name, mobileNumber: user.mobileNumber },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};