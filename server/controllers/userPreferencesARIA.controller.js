const UserPreferencesARIA = require("../models/UserPreferencesARIA.model");

exports.saveUserPreferencesRENTALARIA = async (req, res) => {
  try {
   const { email, assistantType, preferences } = req.body;
   const { location, budget, size, furnishing, propertyType, amenities } = preferences || {};

   if (!email || !assistantType) {
      return res.status(400).json({ success: false, message: "Email and assistantType are required." });
    }

   // Convert null values to empty strings explicitly
   const safePreferences = {
     location: location == null ? "" : location,
     budget: budget == null ? "" : budget,
     size: size == null ? "" : size,
     furnishing: furnishing == null ? "" : furnishing,
     propertyType: propertyType == null ? "" : propertyType,
     amenities: amenities == null ? "" : amenities,
   };

   const existingPreference = await UserPreferencesARIA.findOne({ email, assistantType });

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

    console.log("✅ Preferences saved");
    return res.status(201).json({ success: true, message: "Preferences saved successfully" });
  } catch (error) {
    console.error("❌ Error saving preferences:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.saveUserPreferencesSALEARIA = async (req, res) => {
  try {
   const { email, assistantType, preferences } = req.body;
   const { location, budget, propertyType, size, purpose, amenities } = preferences || {};

   if (!email || !assistantType) {
      return res.status(400).json({ success: false, message: "Email and assistantType are required." });
    }

   // Convert null values to empty strings explicitly
   const safePreferences = {
     location: location == null ? "" : location,
     budget: budget == null ? "" : budget,
     propertyType: propertyType == null ? "" : propertyType,
     size: size == null ? "" : size,
     purpose: purpose == null ? "" : purpose,
     amenities: amenities == null ? "" : amenities,
   };

   const existingPreference = await UserPreferencesARIA.findOne({ email, assistantType });

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

    console.log("✅ Preferences saved");
    return res.status(201).json({ success: true, message: "SALE Preferences saved successfully" });
  } catch (error) {
    console.error("❌ Error saving preferences:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};
