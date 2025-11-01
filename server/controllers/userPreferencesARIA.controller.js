// Controller for managing user preferences related to ARIA rental and sale assistant types.
// Provides functions to save user preferences by handling requests, validating input,
// sanitizing data, checking for existing records, and updating or creating new entries.

const UserPreferencesARIA = require("../models/UserPreferencesARIA.model");


// ==============================
// Save User Preferences for RENTAL ARIA
// ==============================
exports.saveUserPreferencesRENTALARIA = async (req, res) => {
  try {
    // Destructure constants from request body
    const { email, assistantType, preferences } = req.body;
    const { location, budget, size, furnishing, propertyType, amenities } = preferences || {};

    // Validate required input fields
    if (!email || !assistantType) {
      return res.status(400).json({ success: false, message: "Email and assistantType are required." });
    }

    // Sanitize preferences by converting null or undefined to empty strings
    const safePreferences = {
      location: location == null ? "" : location,
      budget: budget == null ? "" : budget,
      size: size == null ? "" : size,
      furnishing: furnishing == null ? "" : furnishing,
      propertyType: propertyType == null ? "" : propertyType,
      amenities: amenities == null ? "" : amenities,
    };

    // Check if a preference record already exists for the given email and assistantType
    const existingPreference = await UserPreferencesARIA.findOne({ email, assistantType });

    // Update existing preference or create a new one
    if (existingPreference) {
      await UserPreferencesARIA.findOneAndUpdate(
        { email, assistantType },
        { preferences: safePreferences },
        { new: true }
      );
    } else {
      const newPreference = new UserPreferencesARIA({
        email,
        assistantType,
        preferences: safePreferences
      });
      await newPreference.save();
    }

    // Respond with success message
    console.log("✅ Preferences saved");
    return res.status(201).json({ success: true, message: "Preferences saved successfully" });
  } catch (error) {
    // Handle errors and respond with error message
    console.error("❌ Error saving preferences:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};


// ==============================
// Save User Preferences for SALE ARIA
// ==============================
exports.saveUserPreferencesSALEARIA = async (req, res) => {
  try {
    // Destructure constants from request body
    const { email, assistantType, preferences } = req.body;
    const { location, budget, propertyType, size, purpose, amenities } = preferences || {};

    // Validate required input fields
    if (!email || !assistantType) {
      return res.status(400).json({ success: false, message: "Email and assistantType are required." });
    }

    // Sanitize preferences by converting null or undefined to empty strings
    const safePreferences = {
      location: location == null ? "" : location,
      budget: budget == null ? "" : budget,
      propertyType: propertyType == null ? "" : propertyType,
      size: size == null ? "" : size,
      purpose: purpose == null ? "" : purpose,
      amenities: amenities == null ? "" : amenities,
    };

    // Check if a preference record already exists for the given email and assistantType
    const existingPreference = await UserPreferencesARIA.findOne({ email, assistantType });

    // Update existing preference or create a new one
    if (existingPreference) {
      await UserPreferencesARIA.findOneAndUpdate(
        { email, assistantType },
        { preferences: safePreferences },
        { new: true }
      );
    } else {
      const newPreference = new UserPreferencesARIA({
        email,
        assistantType,
        preferences: safePreferences
      });
      await newPreference.save();
    }

    // Respond with success message
    console.log("✅ Preferences saved");
    return res.status(201).json({ success: true, message: "SALE Preferences saved successfully" });
  } catch (error) {
    // Handle errors and respond with error message
    console.error("❌ Error saving preferences:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};
