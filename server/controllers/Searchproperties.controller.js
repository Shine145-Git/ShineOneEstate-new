const Sector = require("../models/Sector.model");
const RentalProperty = require("../models/Rentalproperty.model");
const SaleProperty = require("../models/SaleProperty.model");
const SearchHistory = require("../models/SearchHistory.model");
const UserPreferencesARIA = require("../models/UserPreferencesARIA.model");

// Search for properties by address or area and save search history if user is logged in
exports.searchProperties = async (req, res) => {
  try {
    const { query, type } = req.query;
    const userId = req.user?._id;

    if (!query) return res.status(400).json({ message: "Search query is required" });

    if (userId) {
      const lastEntry = await SearchHistory.findOne({ user: userId }).sort({ createdAt: -1 });
      if (!lastEntry || lastEntry.query !== query) {
        await SearchHistory.create({ user: userId, query });
      }
    }

    // --- ADVANCED NORMALIZATION ---
    let normalizedQuery = query
      .toLowerCase()
      .replace(/\b(sec|sector|s)\b/gi, "sector")
      .replace(/\b(blk|block)\b/gi, "block")
      .replace(/\b(rd|road)\b/gi, "road")
      .replace(/\b(st|street)\b/gi, "street")
      .replace(/\b(ave|avenue)\b/gi, "avenue")
      .replace(/\b(flat|apt|apartment)\b/gi, "apartment")
      .replace(/\b(villa|house|bungalow)\b/gi, "villa")
      .trim();

    // --- DETECT SECTOR NUMBER ---
    const sectorMatch = normalizedQuery.match(/sector\s*-?\s*(\d+)/i);
    const bhkMatch = normalizedQuery.match(/(\d+)\s*bhk/i);
    const priceMatch = normalizedQuery.match(/(\d+\.?\d*)\s*(k|l|cr|crore|lakh)?/i);

    const fullQueryRegex = new RegExp(normalizedQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    let mainResults = [];
    let nearbyResults = [];

    // --- MAIN RENTAL SEARCH ---
    const rentalMain = await RentalProperty.find({
      $and: [
        { isActive: true },
        {
          $or: [
            { address: fullQueryRegex },
            { localAmenities: fullQueryRegex },
            { propertyType: fullQueryRegex },
            { neighborhoodVibe: fullQueryRegex },
            { "totalArea.configuration": fullQueryRegex },
          ],
        },
      ],
    }).populate("owner", "name email");

    // --- MAIN SALE SEARCH ---
    let saleOrConditions = [
      { title: fullQueryRegex },
      { description: fullQueryRegex },
      { location: fullQueryRegex },
      { propertyType: fullQueryRegex },
      { "totalArea.configuration": fullQueryRegex },
    ];

    // Handle numeric query types (BHK / Price / Area)
    if (bhkMatch) {
      const bhkNum = parseInt(bhkMatch[1]);
      saleOrConditions.push({ bedrooms: bhkNum });
      // Also search for configuration field matching e.g. "3 BHK"
      saleOrConditions.push({ "totalArea.configuration": { $regex: bhkMatch[0], $options: "i" } });
    }

    const numQuery = parseFloat(priceMatch?.[1]);
    const priceUnit = priceMatch?.[2]?.toLowerCase();

    if (!isNaN(numQuery)) {
      let priceValue = numQuery;
      if (priceUnit === "k") priceValue *= 1000;
      else if (priceUnit === "l" || priceUnit === "lakh") priceValue *= 100000;
      else if (priceUnit === "cr" || priceUnit === "crore") priceValue *= 10000000;

      saleOrConditions.push({ price: { $gte: priceValue * 0.8, $lte: priceValue * 1.2 } });
      saleOrConditions.push({ area: { $gte: numQuery * 0.8, $lte: numQuery * 1.2 } });
    }

    const saleMain = await SaleProperty.find({
      $and: [
        { isActive: true },
        { $or: saleOrConditions },
      ],
    })
      .populate({ path: "ownerId", select: "name email", strictPopulate: false });

    if (type === "rent") mainResults = rentalMain;
    else if (type === "sale") mainResults = saleMain;
    else mainResults = [...rentalMain, ...saleMain];

    // --- STRICT SECTOR/AREA MATCH LOGIC ---
    if (sectorMatch && sectorMatch[1]) {
      // Only return results for the matched sector/area
      const sectorNum = parseInt(sectorMatch[1]);
      const sectorRegex = new RegExp(`sector\\s*-?\\s*${sectorNum}\\b`, "i");

      let rentalSector = [];
      let saleSector = [];
      if (type === "rent" || !type) {
        rentalSector = await RentalProperty.find({
          $and: [
            { isActive: true },
            {
              $or: [
                { address: sectorRegex },
                { localAmenities: sectorRegex },
              ],
            },
          ],
        }).populate("owner", "name email");
      }
      if (type === "sale" || !type) {
        saleSector = await SaleProperty.find({
          $and: [
            { isActive: true },
            {
              $or: [
                { location: sectorRegex },
              ],
            },
          ],
        }).populate({ path: "ownerId", select: "name email", strictPopulate: false });
      }
      allResults = type === "rent"
        ? rentalSector
        : type === "sale"
        ? saleSector
        : [...rentalSector, ...saleSector];
    }

    // If not a strict sector/area query, allow main + nearby as before
    const allResultsFinal = [...(typeof allResults !== "undefined" ? allResults : mainResults), ...nearbyResults];

    // --- Fetch and apply user preferences if available ---
    if (req.user?._id) {
      const userPreferences = await UserPreferencesARIA.findOne({ email: req.user.email });

      if (userPreferences) {
        const prefs = userPreferences.preferences || {};

        const calcMatch = (propertyDoc) => {
          const property = propertyDoc.toObject ? propertyDoc.toObject() : propertyDoc;

          // Define weights
          const weights = {
            location: 0.25,
            budget: 0.25,
            size: 0.20,
            propertyType: 0.10,
            furnishing: 0.10,
            amenities: 0.10,
          };

          let totalWeight = 0;
          let weightedScore = 0;


          const { location, budget, size, furnishing, propertyType, amenities } = prefs;

          // Helper for fuzzy match (simple includes on lowercase strings)
          const fuzzyMatch = (source, target) => {
            if (!source || !target) return false;
            const src = source.toLowerCase();
            const tgt = target.toLowerCase();
            return src.includes(tgt) || tgt.includes(src);
          };

          if (location && (property.address || property.location)) {
            totalWeight += weights.location;
            const propLoc = `${property.address || property.location}`.toLowerCase();
            const exactMatch = propLoc === location.toLowerCase();
            const partialMatch = propLoc.includes(location.toLowerCase());
            const fuzzy = fuzzyMatch(propLoc, location);
            let locScore = 0;
            if (exactMatch) locScore = 1;
            else if (partialMatch) locScore = 0.75;
            else if (fuzzy) locScore = 0.5;

            weightedScore += locScore * weights.location;

          }

          if (budget && property.price) {
            totalWeight += weights.budget;
            const budgetNum = parseFloat(budget);
            const priceNum = parseFloat(property.price);
            const exactMatch = priceNum >= budgetNum * 0.95 && priceNum <= budgetNum * 1.05;
            const closeMatch = priceNum >= budgetNum * 0.8 && priceNum <= budgetNum * 1.2;
            let budgetScore = 0;
            if (exactMatch) budgetScore = 1;
            else if (closeMatch) budgetScore = 0.75;

            weightedScore += budgetScore * weights.budget;

          }

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

          if (Array.isArray(amenities) && property.amenities?.length) {
            totalWeight += weights.amenities;
            const matchCount = property.amenities.filter(a =>
              amenities.some(p => {
                const aLower = a.toLowerCase();
                const pLower = p.toLowerCase();
                return aLower.includes(pLower) || pLower.includes(aLower);
              })
            ).length;
            const amenitiesScore = matchCount > 0 ? matchCount / amenities.length : 0;

            weightedScore += amenitiesScore * weights.amenities;

          }

          const matchPercentage = totalWeight > 0 ? Math.round((weightedScore / totalWeight) * 100) : 0;
          return { ...property, matchPercentage };
        };

        const resultsWithMatch = allResultsFinal.map(calcMatch);
        return res.status(200).json(resultsWithMatch);
      }
    }

    res.status(200).json(allResultsFinal);
  } catch (error) {
    res.status(500).json({ message: "Server error while searching properties", error: error.message });
  }
};

// ===============================
// 🔹 SEARCH AREA SUGGESTIONS
// ===============================
exports.getSectorSuggestions = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: "Query is required" });

    // Match sector names containing user query (case-insensitive)
    const regex = new RegExp(query.trim(), "i");
    const sectors = await Sector.find({ name: regex }).limit(10);

    if (sectors.length === 0) {
      return res.status(200).json({ sectors: [] });
    }

    res.status(200).json({ sectors });
  } catch (error) {
    res.status(500).json({ message: "Server error fetching sector suggestions" });
  }
};

// // ===============================
// // 🔹 SEARCH PROPERTIES BY SECTOR
// // ===============================
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

// Get search history for the logged-in user
exports.getSearchHistory = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

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
exports.searchPropertiesonLocation = async (req, res) => {
  try {
    const { queryFields } = req.body; // array of location fields
    const userId = req.user?._id;

    if (
      !queryFields ||
      !Array.isArray(queryFields) ||
      queryFields.length === 0
    ) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Save user search query if logged in, but avoid duplicate consecutive entries
    if (userId) {
      const lastEntry = await SearchHistory.findOne({ user: userId }).sort({ createdAt: -1 });
      const currentQuery = queryFields.join(", ");
      if (!lastEntry || lastEntry.query !== currentQuery) {
        await SearchHistory.create({
          user: userId,
          query: currentQuery,
        });
      }
    }

    // Build OR conditions for address, localAmenities, and propertyType
    const orConditions = queryFields.flatMap((field) => {
      const regex = new RegExp(field, "i"); // simpler regex for whole field
      return [
        { address: regex },
        { localAmenities: regex },
        { propertyType: regex },
      ];
    });

    const results = await RentalProperty.find({
      $and: [
        { isActive: true },
        { $or: orConditions }
      ]
    }).populate(
      "owner",
      "name email"
    );

    // Return results (empty array if none found)
    res.status(200).json(results || []);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error while searching properties" });
  }
};
exports.getUserDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch last 5 searches
    const history = await SearchHistory.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    let recommended = [];

    if (history.length > 0) {
      // Take latest search query
      const lastQuery = history[0].query;

      // Split query into smaller searchable parts by spaces instead of commas
      const queryParts = lastQuery
        .split(/\s+/)
        .map((part) => part.trim())
        .filter(Boolean);

      // Build regex for each sub-part
      const regexArray = queryParts.map((word) => new RegExp(word, "i"));

      // Match against multiple fields for any sub-part
      const orConditions = regexArray.flatMap((r) => [
        { address: r },
        { localAmenities: r },
        { neighborhoodVibe: r },
      ]);

      recommended = await RentalProperty.find({
        $and: [
          { isActive: true },
          { $or: orConditions }
        ]
      })
        .limit(10)
        .populate("owner", "name email");
    }


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
