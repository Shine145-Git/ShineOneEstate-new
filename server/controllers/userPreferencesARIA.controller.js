const UserPreferencesARIA = require("../models/UserPreferencesARIA.model");

exports.saveUserPreferencesRENTALARIA = async (req, res) => {
  try {
    console.log("📩 Received user preference data:", req.body);

   const { email, assistantType, preferences } = req.body;
   const { location, budget, size, furnishing, propertyType, amenities } = preferences || {};

   console.log("🔍 Destructured preferences:");
   console.log("  location:", location);
   console.log("  budget:", budget);
   console.log("  size:", size);
   console.log("  furnishing:", furnishing);
   console.log("  propertyType:", propertyType);
   console.log("  amenities:", amenities);

   if (!email || !assistantType) {
      console.warn("⚠️ Missing required fields: email or assistantType", { email, assistantType });
      return res.status(400).json({ success: false, message: "Email and assistantType are required." });
    }

   if (
     location == null ||
     budget == null ||
     size == null ||
     furnishing == null ||
     propertyType == null ||
     amenities == null
   ) {
     console.warn("⚠️ One or more preference fields are missing or null", {
       location,
       budget,
       size,
       furnishing,
       propertyType,
       amenities,
     });
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
     console.log("♻️ Updated existing preference for:", email);
   } else {
     const newPreference = new UserPreferencesARIA({
       email,
       assistantType,
       preferences: safePreferences
     });
     console.log("🧱 Constructed preference document to save:", newPreference);
     await newPreference.save();
     console.log("🆕 Created new preference for:", email);
   }

    console.log("✅ User preferences saved successfully to DB for:", email);

    return res.status(201).json({ success: true, message: "Preferences saved successfully" });
  } catch (error) {
    console.error("❌ Error saving user preferences:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.saveUserPreferencesSALEARIA = async (req, res) => {
  try {
    console.log("📩 Received SALE user preference data:", req.body);

   const { email, assistantType, preferences } = req.body;
   const { location, budget, propertyType, size, purpose, amenities } = preferences || {};

   console.log("🔍 Destructured SALE preferences:");
   console.log("  location:", location);
   console.log("  budget:", budget);
   console.log("  propertyType:", propertyType);
   console.log("  size:", size);
   console.log("  purpose:", purpose);
   console.log("  amenities:", amenities);

   if (!email || !assistantType) {
      console.warn("⚠️ Missing required fields for SALE: email or assistantType", { email, assistantType });
      return res.status(400).json({ success: false, message: "Email and assistantType are required." });
    }

   if (
     location == null ||
     budget == null ||
     propertyType == null ||
     size == null ||
     purpose == null ||
     amenities == null
   ) {
     console.warn("⚠️ One or more SALE preference fields are missing or null", {
       location,
       budget,
       propertyType,
       size,
       purpose,
       amenities,
     });
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
     console.log("♻️ Updated existing SALE preference for:", email);
   } else {
     const newPreference = new UserPreferencesARIA({
       email,
       assistantType,
       preferences: safePreferences
     });
     console.log("🧱 Constructed SALE preference document to save:", newPreference);
     await newPreference.save();
     console.log("🆕 Created new SALE preference for:", email);
   }

    console.log("✅ SALE user preferences saved successfully to DB for:", email);

    return res.status(201).json({ success: true, message: "SALE Preferences saved successfully" });
  } catch (error) {
    console.error("❌ Error saving SALE user preferences:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
