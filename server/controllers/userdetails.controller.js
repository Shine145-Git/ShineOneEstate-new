/**
 * Controller: User Details
 * Description: Handles user-related operations including fetching, updating user details,
 *              managing user properties (rental and sale), and property updates/deletions.
 */

const cloudinary = require("cloudinary").v2;
const User = require('../models/user.model');
const RentalProperty = require('../models/Rentalproperty.model');
const SaleProperty = require('../models/SaleProperty.model');

// ===============================
// 🔹 GET USER DETAILS (From req.user)
// ===============================
exports.getUserDetails = async (req, res) => {
  try {
    // Validate user authentication
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Prepare user details response
    const userDetails = {
      name: req.user.name || "",
      email: req.user.email,
      role: req.user.role,
      createdAt: req.user.createdAt,
    };

    // Send user details to frontend
    return res.status(200).json({ user: userDetails });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// 🔹 GET USER DETAILS (Alternative method)
// ===============================
exports.userDetails = async (req, res) => {
  try {
    // Validate user authentication
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Send user details directly
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

// ===============================
// 🔹 SAVE OR UPDATE USER DETAILS
// ===============================
exports.saveUserDetails = async (req, res) => {
  try {
    // Validate user authentication
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const userId = req.user._id;
    const updateData = {};

    // Collect Personal Information
    if (req.body.fullName !== undefined) updateData.fullName = req.body.fullName;
    if (req.body.dateOfBirth !== undefined) updateData.dateOfBirth = req.body.dateOfBirth;
    if (req.body.gender !== undefined) updateData.gender = req.body.gender;

    // Collect Contact Information
    if (req.body.email !== undefined) updateData.email = req.body.email;
    if (req.body.mobileNumber !== undefined) updateData.mobileNumber = req.body.mobileNumber;
    if (req.body.alternateContact !== undefined) updateData.alternateContact = req.body.alternateContact;
    if (req.body.address !== undefined) updateData.address = req.body.address;

    // Collect User Preferences
    if (req.body.propertyTypePreference !== undefined) updateData.propertyTypePreference = req.body.propertyTypePreference;
    if (req.body.budgetMin !== undefined) updateData.budgetMin = req.body.budgetMin;
    if (req.body.budgetMax !== undefined) updateData.budgetMax = req.body.budgetMax;
    if (req.body.preferredLocations !== undefined) updateData.preferredLocations = req.body.preferredLocations;
    if (req.body.bedrooms !== undefined) updateData.bedrooms = req.body.bedrooms;
    if (req.body.bathrooms !== undefined) updateData.bathrooms = req.body.bathrooms;
    if (req.body.furnishingPreference !== undefined) updateData.furnishingPreference = req.body.furnishingPreference;
    if (req.body.transactionType !== undefined) updateData.transactionType = req.body.transactionType;

    // Collect Professional / Financial Info
    if (req.body.occupation !== undefined) updateData.occupation = req.body.occupation;
    if (req.body.monthlyIncome !== undefined) updateData.monthlyIncome = req.body.monthlyIncome;
    if (req.body.bankPaymentInfo !== undefined) updateData.bankPaymentInfo = req.body.bankPaymentInfo;

    // Collect Verification / Security Info
    if (req.body.governmentID !== undefined) updateData.governmentID = req.body.governmentID;
    if (req.body.kycDocuments !== undefined) updateData.kycDocuments = req.body.kycDocuments;
    if (req.body.consentNotifications !== undefined) updateData.consentNotifications = req.body.consentNotifications;

    // Update user in database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    // Handle user not found
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send success response with updated user
    res.status(200).json({
      message: "User details updated successfully",
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// 🔹 GET USER DETAILS FROM DATABASE
// ===============================
exports.getUserDetailsFromDB = async (req, res) => {
  try {
    // Validate user authentication
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const userId = req.user._id;

    // Fetch user from database selecting specific fields
    const user = await User.findById(userId).select('name email role createdAt');

    // Handle user not found
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send user details from database
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

// ===============================
// 🔹 GET USER'S PROPERTIES (Rental and Sale)
// ===============================
exports.getMyProperties = async (req, res) => {
  try {
    // Validate user authentication
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized: User not logged in" });
    }

    const userId = req.user._id;

    // Fetch rental and sale properties concurrently
    const [rentalProperties, saleProperties] = await Promise.all([
      RentalProperty.find({ owner: userId }).sort({ createdAt: -1 }).lean(),
      SaleProperty.find({ ownerId: userId }).sort({ createdAt: -1 }).lean(),
    ]);

    // Combine and tag properties by category
    const allProperties = [
      ...rentalProperties.map((p) => ({ ...p, propertyCategory: "rental" })),
      ...saleProperties.map((p) => ({ ...p, propertyCategory: "sale" })),
    ];

    // Sort combined properties by creation date descending
    allProperties.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Send response with counts and properties
    res.status(200).json({
      total: allProperties.length,
      rentalCount: rentalProperties.length,
      saleCount: saleProperties.length,
      properties: allProperties,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while fetching user's properties",
      error: error.message,
    });
  }
};

// ===============================
// 🔹 UPDATE PROPERTY (Rental or Sale)
// ===============================
// @desc Update a property (rental or sale)
// @route PUT /api/user/update-property/:id
// @access Private (owner only)
const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate user authentication
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized: User not logged in" });
    }

    // Rebuild totalArea object if dotted fields exist (common in FormData)
    if (req.body["totalArea.sqft"] || req.body["totalArea.configuration"]) {
      req.body.totalArea = {
        sqft: req.body["totalArea.sqft"] ? Number(req.body["totalArea.sqft"]) : undefined,
        configuration: req.body["totalArea.configuration"] || "",
      };
      delete req.body["totalArea.sqft"];
      delete req.body["totalArea.configuration"];
    }

    // Normalize configuration for SaleProperty (always "X BHK" format)
    if (req.body.totalArea?.configuration) {
      const numMatch = req.body.totalArea.configuration.toString().match(/(\d+)/);
      if (numMatch) {
        req.body.totalArea.configuration = `${numMatch[1]} BHK`;
      } else {
        req.body.totalArea.configuration = req.body.totalArea.configuration.toString().trim().toUpperCase();
      }
    }

    // Upload new images to Cloudinary and append URLs (no deletion)
    let imageUrls = [];

    try {
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          try {
            const result = await cloudinary.uploader.upload(file.path, {
              folder: "properties",
            });
            imageUrls.push(result.secure_url);
          } catch (uploadError) {
            // Upload error suppressed
          }
        }
      }

      if (imageUrls.length > 0) {
        // Fetch current property (rental or sale) to retain existing images
        let existingProperty = null;
        try {
          existingProperty = (await RentalProperty.findById(id)) || (await SaleProperty.findById(id));
        } catch (fetchErr) {
          // Fetch error suppressed
        }

        if (existingProperty && existingProperty.images) {
          req.body.images = [...existingProperty.images, ...imageUrls];
        } else {
          req.body.images = imageUrls;
        }
      }
    } catch (err) {
      // Image handling error suppressed
    }

    const updateData = { ...req.body };

    // Normalize totalArea.configuration (e.g., 2 BHK, 3 BHK)
    if (updateData.totalArea && updateData.totalArea.configuration) {
      let rawConfig = updateData.totalArea.configuration.trim().toLowerCase();
      const bhkMatch = rawConfig.match(/(\d+)\s*bhk/);
      const normalizedConfig = bhkMatch ? `${bhkMatch[1]} BHK` : rawConfig.toUpperCase();
      updateData.totalArea.configuration = normalizedConfig;
    }

    // Normalize Sector field (handles various formats)
    if (updateData.Sector) {
      const formattedSector = updateData.Sector
        .trim()
        .replace(/[^a-zA-Z0-9]/g, " ")
        .replace(/\s+/g, " ")
        .toLowerCase();

      let cleanSector = null;

      const match = formattedSector.match(/sector\s*(\d+)/);
      if (match) {
        cleanSector = `Sector-${match[1]}`;
      } else if (/^\d+$/.test(formattedSector)) {
        cleanSector = `Sector-${formattedSector}`;
      } else {
        const firstNum = formattedSector.match(/\d+/);
        if (firstNum) {
          cleanSector = `Sector-${firstNum[0]}`;
        } else if (formattedSector.startsWith("sec")) {
          const num = formattedSector.replace("sec", "").trim();
          cleanSector = num ? `Sector-${num}` : "Sector-Unknown";
        } else {
          cleanSector = formattedSector.charAt(0).toUpperCase() + formattedSector.slice(1);
        }
      }

      updateData.Sector = cleanSector;
    }

    // Try updating rental property first
    let updatedProperty = await RentalProperty.findOneAndUpdate(
      { _id: id, owner: req.user._id },
      updateData,
      { new: true }
    );

    // If not found, try updating sale property
    if (!updatedProperty) {
      // Rebuild totalArea object again if dotted fields exist (for sale property)
      if (req.body["totalArea.sqft"] || req.body["totalArea.configuration"]) {
        req.body.totalArea = {
          sqft: req.body["totalArea.sqft"] ? Number(req.body["totalArea.sqft"]) : undefined,
          configuration: req.body["totalArea.configuration"] || "",
        };
        delete req.body["totalArea.sqft"];
        delete req.body["totalArea.configuration"];
      }

      // Normalize configuration again
      if (req.body.totalArea?.configuration) {
        const numMatch = req.body.totalArea.configuration.toString().match(/(\d+)/);
        req.body.totalArea.configuration = numMatch
          ? `${numMatch[1]} BHK`
          : req.body.totalArea.configuration.toString().trim().toUpperCase();
      }

      const updateDataSale = { ...req.body };

      updatedProperty = await SaleProperty.findOneAndUpdate(
        { _id: id, ownerId: req.user._id },
        updateDataSale,
        { new: true }
      );
    }

    // Handle property not found or unauthorized
    if (!updatedProperty) {
      return res.status(404).json({ message: "Property not found or unauthorized" });
    }

    // Send success response with updated property
    res.status(200).json({
      message: "Property updated successfully",
      property: updatedProperty,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error while updating property", error: error.message });
  }
};

// ===============================
// 🔹 DELETE (TOGGLE) PROPERTY ACTIVE STATUS (Rental or Sale)
// ===============================
// @desc Toggle a property's isActive status (rental or sale)
// @route DELETE /api/user/delete-property/:id
// @access Private (owner only)
const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate user authentication
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized: User not logged in" });
    }

    // Try finding rental property first
    let property = await RentalProperty.findOne({ _id: id, owner: req.user._id });

    // If not found, try sale property
    if (!property) {
      property = await SaleProperty.findOne({ _id: id, ownerId: req.user._id });
    }

    // Handle property not found or unauthorized
    if (!property) {
      return res.status(404).json({ message: "Property not found or unauthorized" });
    }

    // Toggle isActive status
    property.isActive = !property.isActive;
    await property.save();

    // Send response with updated status
    res.status(200).json({
      message: `Property is now ${property.isActive ? "active" : "inactive"}`,
      property,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while toggling property status",
      error: error.message,
    });
  }
};

exports.updateProperty = updateProperty;
exports.deleteProperty = deleteProperty;