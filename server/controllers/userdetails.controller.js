const User = require('../models/user.model');

// Send user details to frontend
exports.getUserDetails = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Send selected user fields
    const userDetails = {
      name: req.user.name || "",
      email: req.user.email,
      role: req.user.role,
      createdAt: req.user.createdAt,
    };

    return res.status(200).json({ user: userDetails });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Alternative function to get user details
exports.userDetails = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Return user details
    res.status(200).json({
      name: req.user.name || "",
      email: req.user.email,
      role: req.user.role,
      createdAt: req.user.createdAt,
    });
  } catch (err) {
    console.error("Error fetching user details:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Save or update user details in the database
exports.saveUserDetails = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const userId = req.user._id;
    const updateData = {};

    // Personal Information
    if (req.body.fullName !== undefined) updateData.fullName = req.body.fullName;
    if (req.body.dateOfBirth !== undefined) updateData.dateOfBirth = req.body.dateOfBirth;
    if (req.body.gender !== undefined) updateData.gender = req.body.gender;

    // Contact Information
    if (req.body.email !== undefined) updateData.email = req.body.email;
    if (req.body.mobileNumber !== undefined) updateData.mobileNumber = req.body.mobileNumber;
    if (req.body.alternateContact !== undefined) updateData.alternateContact = req.body.alternateContact;
    if (req.body.address !== undefined) updateData.address = req.body.address;

    // User Preferences
    if (req.body.propertyTypePreference !== undefined) updateData.propertyTypePreference = req.body.propertyTypePreference;
    if (req.body.budgetMin !== undefined) updateData.budgetMin = req.body.budgetMin;
    if (req.body.budgetMax !== undefined) updateData.budgetMax = req.body.budgetMax;
    if (req.body.preferredLocations !== undefined) updateData.preferredLocations = req.body.preferredLocations;
    if (req.body.bedrooms !== undefined) updateData.bedrooms = req.body.bedrooms;
    if (req.body.bathrooms !== undefined) updateData.bathrooms = req.body.bathrooms;
    if (req.body.furnishingPreference !== undefined) updateData.furnishingPreference = req.body.furnishingPreference;
    if (req.body.transactionType !== undefined) updateData.transactionType = req.body.transactionType;

    // Professional / Financial Info
    if (req.body.occupation !== undefined) updateData.occupation = req.body.occupation;
    if (req.body.monthlyIncome !== undefined) updateData.monthlyIncome = req.body.monthlyIncome;
    if (req.body.bankPaymentInfo !== undefined) updateData.bankPaymentInfo = req.body.bankPaymentInfo;

    // Verification / Security
    if (req.body.governmentID !== undefined) updateData.governmentID = req.body.governmentID;
    if (req.body.kycDocuments !== undefined) updateData.kycDocuments = req.body.kycDocuments;
    if (req.body.consentNotifications !== undefined) updateData.consentNotifications = req.body.consentNotifications;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User details updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Error saving user details:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Fetch user details from database by user ID
exports.getUserDetailsFromDB = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const userId = req.user._id;
    const user = await User.findById(userId).select('name email role createdAt');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      user: {
        name: user.name || "",
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Error fetching user details from DB:", error);
    res.status(500).json({ message: "Server error" });
  }
};