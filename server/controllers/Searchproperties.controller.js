// ===============================
// 🔸 IMPORTS & MODEL CONSTANTS
// ===============================
const Sector = require("../models/Sector.model");
const RentalProperty = require("../models/Rentalproperty.model");
const SaleProperty = require("../models/SaleProperty.model");
const SearchHistory = require("../models/SearchHistory.model");
const UserPreferencesARIA = require("../models/UserPreferencesARIA.model");

// ===============================
// 🔹 SEARCH PROPERTIES
// ===============================
/**
 * Search for properties by address or area and save search history if user is logged in
 * - Constants grouped at top
 * - Normalization and extraction
 * - Main search logic
 * - User preferences scoring
 */
exports.searchProperties = async (req, res) => {
  try {
    // ---------- CONSTANTS & PARAMS ----------
    const { query, type } = req.query;
    const userId = req.user?._id;
    if (!query)
      return res.status(400).json({ message: "Search query is required" });

    // ---------- SAVE SEARCH HISTORY ----------
    if (userId) {
      const lastEntry = await SearchHistory.findOne({ user: userId }).sort({
        createdAt: -1,
      });
      if (!lastEntry || lastEntry.query !== query) {
        await SearchHistory.create({ user: userId, query });
      }
    }

    // ---------- QUERY NORMALIZATION ----------
    // Advanced normalization (case-insensitive, consistent sector, etc.)
    let normalizedQuery = query
      .toLowerCase()
      .replace(/\b(sec|sector|s)\b/gi, "sector")
      .replace(/\b(blk|block)\b/gi, "block")
      .replace(/\b(rd|road)\b/gi, "road")
      .replace(/\b(st|street)\b/gi, "street")
      .trim();

    // Normalize "Sector-<number>" format
    const sectorMatch = normalizedQuery.match(/sector\s*-?\s*(\d+)/i);
    if (sectorMatch) {
      normalizedQuery = normalizedQuery.replace(
        /sector\s*-?\s*\d+/i,
        `Sector-${sectorMatch[1]}`
      );
    } else if (/^\d+$/.test(normalizedQuery.trim())) {
      normalizedQuery = `Sector-${normalizedQuery.trim()}`;
    }

    // Normalize BHK configuration (e.g. "2bhk" → "2 BHK")
    const bhkMatch = normalizedQuery.match(/(\d+)\s*[-]?\s*bhk/i);
    if (bhkMatch) {
      normalizedQuery = normalizedQuery.replace(
        /(\d+)\s*[-]?\s*bhk/i,
        `${bhkMatch[1]} BHK`
      );
    }

    // Handle combined queries like "2bhk in sec 46" → "2 BHK in Sector-46"
    const combinedMatch = normalizedQuery.match(/(\d+)\s*bhk.*sector\s*-?\s*(\d+)/i);
    if (combinedMatch) {
      normalizedQuery = `${combinedMatch[1]} BHK in Sector-${combinedMatch[2]}`;
    } else {
      // Fallback: handle cases like "sec 45" or "sector45"
      const looseSectorMatch = normalizedQuery.match(/\bsector\s*-?\s*(\d+)\b/i);
      if (looseSectorMatch) {
        normalizedQuery = normalizedQuery.replace(
          /\bsector\s*-?\s*\d+\b/i,
          `Sector-${looseSectorMatch[1]}`
        );
      }
    }


    // Recalculate matches after full normalization
    const finalSectorMatch = normalizedQuery.match(/sector\s*-?\s*(\d+)/i);
    const finalBhkMatch = normalizedQuery.match(/(\d+)\s*BHK/i);

    const sectorNum = finalSectorMatch ? finalSectorMatch[1] : null;
    const bhkNum = finalBhkMatch ? finalBhkMatch[1] : null;

    // Build regexes safely
    const bhkRegex = bhkNum ? new RegExp(`${bhkNum}\\s*BHK`, "i") : null;
    // Stricter regex for sector matching (e.g., Sector-45 matches only 45, not 451)
    const sectorRegex = sectorNum
      ? new RegExp(`\\bsector\\s*-?\\s*${sectorNum}\\b(?!\\d)`, "i")
      : null;

    // Full query regex for phrase match
    const fullQueryRegex = new RegExp(
      normalizedQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "i"
    );


    // Only exact sector and bhk-based matches will be fetched; avoids partials like 451 for 45
    // Combine all possible matching conditions intelligently based on detected query type
    const orConditions = [];
    if (bhkRegex) orConditions.push({ "totalArea.configuration": bhkRegex });
    orConditions.push({ address: fullQueryRegex });
    orConditions.push({ description: fullQueryRegex });
    // Add special handling for Gurgaon/Gurugram equivalence
    const gurgaonRegex = /(gurgaon|gurugram)/i;
    orConditions.push({ address: gurgaonRegex });
    orConditions.push({ description: gurgaonRegex });

    let filter = { isActive: true };

    // If both sector and bhk are present → require sector AND (bhk/text)
    if (sectorRegex && bhkRegex) {
      filter.$and = [{ Sector: sectorRegex }, { $or: orConditions }];
    }
    // If only sector → just sector
    else if (sectorRegex) {
      filter.$and = [{ Sector: sectorRegex }];
    }
    // If only bhk → only bhk/text
    else if (bhkRegex) {
      filter.$or = orConditions;
    }
    // If neither → default to text search
    else {
      filter.$or = orConditions;
    }



    // ---------- MAIN SEARCH LOGIC ----------
    const rentalMain = await RentalProperty.find(filter).populate("owner", "name email");
    const saleMain = await SaleProperty.find(filter).populate({
      path: "ownerId",
      select: "name email",
      strictPopulate: false,
    });

    let mainResults = [];
    const normalizedType = type?.trim().toLowerCase();

    if (normalizedType === "rent") {
      mainResults = rentalMain.map((p) => ({ ...p.toObject(), type: "rent" }));
    } else if (normalizedType === "sale") {
      mainResults = saleMain.map((p) => ({ ...p.toObject(), type: "sale" }));
    } else {
      const rentalsWithType = rentalMain.map((p) => ({ ...p.toObject(), type: "rent" }));
      const salesWithType = saleMain.map((p) => ({ ...p.toObject(), type: "sale" }));
      mainResults = [...rentalsWithType, ...salesWithType];
    }

    // For compatibility with the rest of the code
    let allResults;
    let nearbyResults = [];
    const allResultsFinal = [
      ...(typeof allResults !== "undefined" ? allResults : mainResults),
      ...nearbyResults,
    ];

    // ---------- USER PREFERENCES MATCHING ----------
    if (req.user?._id) {
      const userPreferences = await UserPreferencesARIA.findOne({
        email: req.user.email,
      });
      if (userPreferences) {
        const prefs = userPreferences.preferences || {};
        // Scoring function for property match
        const calcMatch = (propertyDoc) => {
          const property = propertyDoc.toObject
            ? propertyDoc.toObject()
            : propertyDoc;
          // Weights for each preference
          const weights = {
            location: 0.25,
            budget: 0.25,
            size: 0.2,
            propertyType: 0.1,
            furnishing: 0.1,
            amenities: 0.1,
          };
          let totalWeight = 0;
          let weightedScore = 0;
          const {
            location,
            budget,
            size,
            furnishing,
            propertyType,
            amenities,
          } = prefs;
          // Fuzzy match helper
          const fuzzyMatch = (source, target) => {
            if (!source || !target) return false;
            const src = source.toLowerCase();
            const tgt = target.toLowerCase();
            return src.includes(tgt) || tgt.includes(src);
          };
          // Location
          if (location && (property.address || property.location)) {
            totalWeight += weights.location;
            const propLoc = `${
              property.address || property.location
            }`.toLowerCase();
            const exactMatch = propLoc === location.toLowerCase();
            const partialMatch = propLoc.includes(location.toLowerCase());
            const fuzzy = fuzzyMatch(propLoc, location);
            let locScore = 0;
            if (exactMatch) locScore = 1;
            else if (partialMatch) locScore = 0.75;
            else if (fuzzy) locScore = 0.5;
            weightedScore += locScore * weights.location;
          }
          // Budget
          if (budget && property.price) {
            totalWeight += weights.budget;
            const budgetNum = parseFloat(budget);
            const priceNum = parseFloat(property.price);
            const exactMatch =
              priceNum >= budgetNum * 0.95 && priceNum <= budgetNum * 1.05;
            const closeMatch =
              priceNum >= budgetNum * 0.8 && priceNum <= budgetNum * 1.2;
            let budgetScore = 0;
            if (exactMatch) budgetScore = 1;
            else if (closeMatch) budgetScore = 0.75;
            weightedScore += budgetScore * weights.budget;
          }
          // Size
          if (size && property.totalArea?.configuration) {
            totalWeight += weights.size;
            const propSize = property.totalArea.configuration.toLowerCase();
            const exactMatch = propSize === size.toLowerCase();
            const partialMatch = propSize.includes(size.toLowerCase());
            const fuzzy = fuzzyMatch(propSize, size);
            let sizeScore = 0;
            if (exactMatch) sizeScore = 1;
            else if (partialMatch) sizeScore = 0.75;
            else if (fuzzy) sizeScore = 0.5;
            weightedScore += sizeScore * weights.size;
          }
          // Property Type
          if (propertyType && property.propertyType) {
            totalWeight += weights.propertyType;
            const propType = property.propertyType.toLowerCase();
            const exactMatch = propType === propertyType.toLowerCase();
            const partialMatch = propType.includes(propertyType.toLowerCase());
            const fuzzy = fuzzyMatch(propType, propertyType);
            let typeScore = 0;
            if (exactMatch) typeScore = 1;
            else if (partialMatch) typeScore = 0.75;
            else if (fuzzy) typeScore = 0.5;
            weightedScore += typeScore * weights.propertyType;
          }
          // Furnishing
          if (furnishing && property.furnishing) {
            totalWeight += weights.furnishing;
            const propFurn = property.furnishing.toLowerCase();
            const exactMatch = propFurn === furnishing.toLowerCase();
            const partialMatch = propFurn.includes(furnishing.toLowerCase());
            const fuzzy = fuzzyMatch(propFurn, furnishing);
            let furnScore = 0;
            if (exactMatch) furnScore = 1;
            else if (partialMatch) furnScore = 0.75;
            else if (fuzzy) furnScore = 0.5;
            weightedScore += furnScore * weights.furnishing;
          }
          // Amenities
          if (Array.isArray(amenities) && property.amenities?.length) {
            totalWeight += weights.amenities;
            const matchCount = property.amenities.filter((a) =>
              amenities.some((p) => {
                const aLower = a.toLowerCase();
                const pLower = p.toLowerCase();
                return aLower.includes(pLower) || pLower.includes(aLower);
              })
            ).length;
            const amenitiesScore =
              matchCount > 0 ? matchCount / amenities.length : 0;
            weightedScore += amenitiesScore * weights.amenities;
          }
          // Final match %
          const matchPercentage =
            totalWeight > 0
              ? Math.round((weightedScore / totalWeight) * 100)
              : 0;
          return { ...property, matchPercentage };
        };
        // Attach match % to results
        const resultsWithMatch = allResultsFinal.map(calcMatch);
        return res.status(200).json(resultsWithMatch);
      }
    }
    // ---------- DEFAULT RETURN ----------
    res.status(200).json(allResultsFinal);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Server error while searching properties",
        error: error.message,
      });
  }
};

// ===============================
// 🔹 SEARCH AREA SUGGESTIONS
// ===============================
/**
 * Suggest sector/area names matching the user query
 */
exports.getSectorSuggestions = async (req, res) => {
  try {
    // ----- Extract query -----
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: "Query is required" });
    // ----- Find sectors by name -----
    const regex = new RegExp(query.trim(), "i");
    const sectors = await Sector.find({ name: regex }).limit(10);
    if (sectors.length === 0) {
      return res.status(200).json({ sectors: [] });
    }
    res.status(200).json({ sectors });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error fetching sector suggestions" });
  }
};

// ===============================
// 🔹 (COMMENTED OUT) SEARCH PROPERTIES BY SECTOR
// ===============================
// exports.getPropertiesBySector = async (req, res) => {
//   try {
//     const { sector } = req.params;
//     if (!sector) return res.status(400).json({ message: "Sector name is required" });
//     const regex = new RegExp(sector.trim(), "i");
//     const rentalProperties = await RentalProperty.find({ Sector: regex })
//       .populate("owner", "name email");
//     const saleProperties = await SaleProperty.find({ Sector: regex })
//       .populate({ path: "ownerId", select: "name email", strictPopulate: false });
//     const combined = [...rentalProperties, ...saleProperties];
//     res.status(200).json({ properties: combined });
//   } catch (error) {
//     res.status(500).json({ message: "Server error fetching properties by sector" });
//   }
// };

// ===============================
// 🔹 SEARCH HISTORY FOR USER
// ===============================
/**
 * Get search history for the logged-in user
 */
exports.getSearchHistory = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    // Fetch all search history, most recent first
    const history = await SearchHistory.find({ user: userId }).sort({
      createdAt: -1,
    });
    res.status(200).json({ history });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error while fetching search history" });
  }
};

// ===============================
// 🔹 SEARCH PROPERTIES BY LOCATION FIELDS
// ===============================
/**
 * Search properties by array of location fields (Sector, localAmenities, propertyType)
 */
exports.searchPropertiesonLocation = async (req, res) => {
  try {
    // ----- Extract query fields -----
    const { queryFields } = req.body; // array of location fields
    const userId = req.user?._id;
    if (
      !queryFields ||
      !Array.isArray(queryFields) ||
      queryFields.length === 0
    ) {
      return res.status(400).json({ message: "Search query is required" });
    }
    // ----- Save user search history -----
    if (userId) {
      const lastEntry = await SearchHistory.findOne({ user: userId }).sort({
        createdAt: -1,
      });
      const currentQuery = queryFields.join(", ");
      if (!lastEntry || lastEntry.query !== currentQuery) {
        await SearchHistory.create({
          user: userId,
          query: currentQuery,
        });
      }
    }
    // ----- Build OR search conditions -----
    const orConditions = queryFields.flatMap((field) => {
      const regex = new RegExp(field, "i");
      return [
        { Sector: regex },
        { localAmenities: regex },
        { propertyType: regex },
      ];
    });
    // ----- Query Rental Properties -----
    const results = await RentalProperty.find({
      $and: [{ isActive: true }, { $or: orConditions }],
    }).populate("owner", "name email");
    // ----- Return results -----
    res.status(200).json(results || []);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error while searching properties" });
  }
};

// ===============================
// 🔹 USER DASHBOARD (RECENT SEARCHES & RECOMMENDED)
// ===============================
/**
 * Get dashboard for user: recent search history and recommended properties
 */
exports.getUserDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    // ----- Fetch last 5 searches -----
    const history = await SearchHistory.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5);
    let recommended = [];
    if (history.length > 0) {
      // Take latest search query
      const lastQuery = history[0].query;
      // Split query into smaller searchable parts by spaces
      const queryParts = lastQuery
        .split(/\s+/)
        .map((part) => part.trim())
        .filter(Boolean);
      // Build regex for each sub-part
      const regexArray = queryParts.map((word) => new RegExp(word, "i"));
      // Match against multiple fields for any sub-part
      const orConditions = regexArray.flatMap((r) => [
        { Sector: r },
        { localAmenities: r },
        { neighborhoodVibe: r },
      ]);
      // Query recommended rental properties
      const rentalRecommended = await RentalProperty.find({
        $and: [{ isActive: true }, { $or: orConditions }],
      })
        .limit(10)
        .populate("owner", "name email");

      // Query recommended sale properties
      const saleRecommended = await SaleProperty.find({
        $and: [{ isActive: true }, { $or: orConditions }],
      })
        .limit(10)
        .populate({ path: "ownerId", select: "name email", strictPopulate: false });

      // Mark type and normalize owners
      const rentalWithType = rentalRecommended.map((p) => ({
        ...p.toObject(),
        type: "rent",
      }));
      const saleWithType = saleRecommended.map((p) => ({
        ...p.toObject(),
        type: "sale",
      }));

      // Combine both rental and sale recommendations
      recommended = [...rentalWithType, ...saleWithType];
    }
    // ----- Return dashboard -----
    res.status(200).json({
      recentSearches: history,
      recommendedProperties: recommended,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while fetching dashboard",
      error: error.message,
    });
  }
};
