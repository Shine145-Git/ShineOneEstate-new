// Controller for managing user preferences related to ARIA rental and sale assistant types.
// Provides functions to save user preferences by handling requests, validating input,
// sanitizing data, checking for existing records, and updating or creating new entries.

const UserPreferencesARIA = require("../models/UserPreferencesARIA.model");

// ==============================
// Save or Update User Preferences (Rental / Sale)
// ==============================
exports.saveUserPreferencesARIA = async (req, res) => {
  try {
    const { email, assistantType, preferences } = req.body;

    // Validate required fields
    if (!email || !assistantType) {
      return res.status(400).json({ success: false, message: "Email and assistantType are required." });
    }

    // Sanitize preferences safely
    const safePreferences = {};
    Object.keys(preferences || {}).forEach((key) => {
      safePreferences[key] = preferences[key] == null ? "" : preferences[key];
    });

    // Check if a preference record exists for this email + assistantType
    const existingPreference = await UserPreferencesARIA.findOne({ email, assistantType });

    if (existingPreference) {
      // ✅ Overwrite the preferences for this assistant type completely
      existingPreference.preferences = safePreferences; // overwrite completely
      await existingPreference.save();

      return res.status(200).json({
        success: true,
        message: `${assistantType.toUpperCase()} preferences updated successfully`,
        updated: true,
      });
    }

    // ✅ Otherwise create a new record for that assistant type
    const newPreference = new UserPreferencesARIA({
      email,
      assistantType,
      preferences: safePreferences,
    });

    await newPreference.save();

    return res.status(201).json({
      success: true,
      message: `${assistantType.toUpperCase()} preferences saved successfully`,
      created: true,
    });
  } catch (error) {
    console.error("❌ Error saving user preferences:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};
