const User = require('../models/user.model');
const RentalProperty = require('../models/Rentalproperty.model');
const SaleProperty = require('../models/SaleProperty.model');

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
    res.status(500).json({ message: "Server error" });
  }
};
exports.getMyProperties = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized: User not logged in" });
    }

    const userId = req.user._id;

    // Fetch both rental and sale properties
    const [rentalProperties, saleProperties] = await Promise.all([
      RentalProperty.find({ owner: userId }).sort({ createdAt: -1 }).lean(),
      SaleProperty.find({ owner: userId }).sort({ createdAt: -1 }).lean(),
    ]);

    const allProperties = [
      ...rentalProperties.map((p) => ({ ...p, propertyCategory: "rental" })),
      ...saleProperties.map((p) => ({ ...p, propertyCategory: "sale" })),
    ];

    allProperties.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      total: allProperties.length,
      rentalCount: rentalProperties.length,
      saleCount: saleProperties.length,
      properties: allProperties,
    });
  } catch (error) {
    console.error("Error fetching user's properties:", error);
    res.status(500).json({
      message: "Server error while fetching user's properties",
      error: error.message,
    });
  }
};

// @desc Update a property (rental or sale)
// @route PUT /api/properties/:id
// @access Private (owner only)
const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const { propertyCategory } = req.body; // 'rental' or 'sale'

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized: User not logged in" });
    }

    let updatedProperty;
    if (propertyCategory === "rental") {
      updatedProperty = await RentalProperty.findOneAndUpdate(
        { _id: id, owner: req.user._id },
        req.body,
        { new: true }
      );
    } else if (propertyCategory === "sale") {
      updatedProperty = await SaleProperty.findOneAndUpdate(
        { _id: id, owner: req.user._id },
        req.body,
        { new: true }
      );
    } else {
      return res.status(400).json({ message: "Invalid property category" });
    }

    if (!updatedProperty) {
      return res.status(404).json({ message: "Property not found or unauthorized" });
    }

    res.status(200).json({
      message: "Property updated successfully",
      property: updatedProperty,
    });
  } catch (error) {
    console.error("Error updating property:", error);
    res.status(500).json({ message: "Server error while updating property", error: error.message });
  }
};

// @desc Delete a property (rental or sale)
// @route DELETE /api/properties/:id
// @access Private (owner only)
const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const { category } = req.query; // 'rental' or 'sale'

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized: User not logged in" });
    }

    let deletedProperty;
    if (category === "rental") {
      deletedProperty = await RentalProperty.findOneAndDelete({ _id: id, owner: req.user._id });
    } else if (category === "sale") {
      deletedProperty = await SaleProperty.findOneAndDelete({ _id: id, owner: req.user._id });
    } else {
      return res.status(400).json({ message: "Invalid property category" });
    }

    if (!deletedProperty) {
      return res.status(404).json({ message: "Property not found or unauthorized" });
    }

    res.status(200).json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error("Error deleting property:", error);
    res.status(500).json({ message: "Server error while deleting property", error: error.message });
  }
};

exports.updateProperty = updateProperty;
exports.deleteProperty = deleteProperty;