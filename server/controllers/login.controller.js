const User = require("../models/user.model");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

// Generate a random 6-digit OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Setup mail transporter (use environment variables in production)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter configuration with detailed logs
(async () => {
  try {
    console.log("Verifying SMTP transporter...");
    console.log("EMAIL_USER:", process.env.EMAIL_USER);
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("Transporter options:", transporter.options);
    await transporter.verify();
    console.log("SMTP transporter verified successfully.");
  } catch (verifyError) {
    console.error("Failed to verify SMTP transporter:", verifyError);
  }
})();

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

    console.log("SMTP transporter config:", transporter.options);
    console.log("Sending OTP email to:", email);

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
      });
      console.log("OTP email sent successfully to:", email);
    } catch (emailError) {
      console.error(`Failed to send OTP email to ${email}:`, emailError);
    }

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