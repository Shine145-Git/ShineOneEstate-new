const mongoose = require('mongoose');
require('dotenv').config();

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    mobileNumber: {
      type: String,
      
    },
    otp: {
      type: String, // you can also use Number if you prefer
    },
    otpExpiry: {
      type: Date, // when OTP should expire
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["renter", "owner", "admin"],
      default: "renter",
    },
    accessToken: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
    Rewards: {
      type: String,
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },

  },
  { timestamps: true }
);

const jwt = require("jsonwebtoken");

// 🔑 Generate Access Token
userSchema.methods.getAccessToken = function () {
  return jwt.sign(
    { id: this._id, email: this.email, name: this.name },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_SECRET_EXPIRE }
  );
};

// 🔑 Generate Refresh Token
userSchema.methods.getRefreshToken = function () {
  return jwt.sign(
    { id: this._id, email: this.email, name: this.name },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_SECRET_EXPIRE }
  );
};

module.exports = mongoose.model("User", userSchema);
