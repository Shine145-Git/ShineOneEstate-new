// ===============================
// 🔸 IMPORTS & MODEL CONSTANTS
// ===============================
const Sector = require("../models/Sector.model");
const RentalProperty = require("../models/Rentalproperty.model");
const SaleProperty = require("../models/SaleProperty.model");
const SearchHistory = require("../models/SearchHistory.model");
const UserPreferencesARIA = require("../models/UserPreferencesARIA.model");

// ===============================
// 🛠️ Helper Utilities (internal-only, no API contract change)
// ===============================
const getPagination = (req) => {
  const rawLimit = Number(req.query.limit);
  const rawPage = Number(req.query.page);
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? rawLimit : 20;
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const skip = (page - 1) * limit;
  return { limit, page, skip };
};

const normalizeUserQuery = (raw) => {
  if (!raw || typeof raw !== 'string') return '';
  let q = raw
    .toLowerCase()
    .replace(/\b(sec|sector|s)\b/gi, 'sector')
    .replace(/\b(blk|block)\b/gi, 'block')
    .replace(/\b(rd|road)\b/gi, 'road')
    .replace(/\b(st|street)\b/gi, 'street')
    .trim();

  const sectorMatch = q.match(/sector\s*-?\s*(\d+)/i);
  if (sectorMatch) {
    q = q.replace(/sector\s*-?\s*\d+/i, `Sector-${sectorMatch[1]}`);
  } else if (/^\d+$/.test(q)) {
    q = `Sector-${q}`;
  }

  const bhkMatch = q.match(/(\d+)\s*[-]?\s*bhk/i);
  if (bhkMatch) {
    q = q.replace(/(\d+)\s*[-]?\s*bhk/i, `${bhkMatch[1]} BHK`);
  }

  const combinedMatch = q.match(/(\d+)\s*bhk.*sector\s*-?\s*(\d+)/i);
  if (combinedMatch) {
    q = `${combinedMatch[1]} BHK in Sector-${combinedMatch[2]}`;
  } else {
    const looseSectorMatch = q.match(/\bsector\s*-?\s*(\d+)\b/i);
    if (looseSectorMatch) {
      q = q.replace(/\bsector\s*-?\s*\d+\b/i, `Sector-${looseSectorMatch[1]}`);
    }
  }
  return q;
};

const buildFilterObject = ({ normalizedQuery, normalizedType, extras = {} }) => {
  const filter = { isActive: true };

  // Optional type enforcement (removed for price-exact match refactor)

  if (normalizedQuery) {
    const sectorMatch = normalizedQuery.match(/sector\s*-?\s*(\d+)/i);
    const bhkMatch = normalizedQuery.match(/(\d+)\s*BHK/i);
    const sectorNum = sectorMatch ? sectorMatch[1] : null;
    const bhkNum = bhkMatch ? bhkMatch[1] : null;

    const bhkRegex = bhkNum ? new RegExp(`${bhkNum}\\s*BHK`, 'i') : null;
    const sectorRegex = sectorNum ? new RegExp(`\\bsector\\s*-?\\s*${sectorNum}\\b(?!\\d)`, 'i') : null;
    const fullQueryRegex = new RegExp(normalizedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const gurgaonRegex = /(gurgaon|gurugram)/i;

    const orConditions = [];
    if (bhkRegex) orConditions.push({ 'totalArea.configuration': bhkRegex });

    // Always allow a direct match on Sector with the raw text of the query.
    // This ensures inputs like "dlf" or misspellings like "sehore" can still
    // match the Sector field even when no explicit sector number or "BHK" is present.
    orConditions.push({ Sector: fullQueryRegex });

    orConditions.push({ address: fullQueryRegex });
    orConditions.push({ description: fullQueryRegex });
    orConditions.push({ address: gurgaonRegex });
    orConditions.push({ description: gurgaonRegex });

    if (sectorRegex && bhkRegex) {
      filter.$and = [{ Sector: sectorRegex }, { $or: orConditions }];
    } else if (sectorRegex) {
      filter.$and = [{ Sector: sectorRegex }];
    } else if (bhkRegex) {
      filter.$or = orConditions;
    } else {
      filter.$or = orConditions;
    }
  }

  // Optional *non-mandatory* extra filters (do not break API)
  const { minPrice, maxPrice, bedrooms, bathrooms, minArea, maxArea, price } = extras;
  const rangeClauses = [];
  if (price) {
    const eq = Number(price);
    const eqStr = String(price);
    rangeClauses.push({
      $or: [
        { monthlyRent: eq },
        { price: eq },
        { monthlyRent: eqStr },
        { price: eqStr },
      ],
    });
  } else if (minPrice || maxPrice) {
    // Match either monthlyRent or price depending on doc
    const priceOr = [];
    const priceCond = {};
    if (minPrice) priceCond.$gte = Number(minPrice);
    if (maxPrice) priceCond.$lte = Number(maxPrice);
    priceOr.push({ monthlyRent: priceCond });
    priceOr.push({ price: priceCond });
    rangeClauses.push({ $or: priceOr });
  }
  if (minArea || maxArea) {
    const areaCond = {};
    if (minArea) areaCond.$gte = Number(minArea);
    if (maxArea) areaCond.$lte = Number(maxArea);
    rangeClauses.push({ $or: [{ area: areaCond }, { 'totalArea.sqft': areaCond }] });
  }
  if (bedrooms) rangeClauses.push({ bedrooms: Number(bedrooms) });
  if (bathrooms) rangeClauses.push({ bathrooms: Number(bathrooms) });

  if (rangeClauses.length) {
    if (filter.$and) filter.$and = [...filter.$and, ...rangeClauses];
    else filter.$and = rangeClauses;
  }

  return filter;
};

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
    const hasQuery = typeof query === 'string' && query.trim().length > 0;
    const normalizedType = type ? String(type).trim().toLowerCase() : '';
    const { limit: parsedLimit, skip } = getPagination(req);
    const userId = req.user?._id;
    // Fast path: if query is missing/blank but type is present, return top N of that type
    if (!hasQuery && normalizedType) {
      try {
        if (normalizedType === 'rent') {
          const rentals = await RentalProperty.find({ isActive: true })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parsedLimit)
            .populate('owner', 'name email')
            .lean();
          const withType = rentals.map((p) => ({ ...p, type: 'rent', defaultpropertytype: 'rental' }));
          return res.status(200).json(withType);
        }
        if (normalizedType === 'sale') {
          const sales = await SaleProperty.find({ isActive: true })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parsedLimit)
            .populate({ path: 'ownerId', select: 'name email', strictPopulate: false })
            .lean();
          const withType = sales.map((p) => ({ ...p, type: 'sale', defaultpropertytype: 'sale' }));
          return res.status(200).json(withType);
        }
        return res.status(400).json({ message: "Invalid type. Use 'rent' or 'sale'." });
      } catch (e) {
        return res.status(500).json({ message: 'Server error while fetching top properties', error: e.message });
      }
    }

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
    const rawQuery = hasQuery ? query : '';
    const normalizedQuery = normalizeUserQuery(rawQuery);

    const filter = buildFilterObject({
      normalizedQuery,
      normalizedType,
      extras: {
        minPrice: req.query.minPrice,
        maxPrice: req.query.maxPrice,
        bedrooms: req.query.bedrooms,
        bathrooms: req.query.bathrooms,
        minArea: req.query.minArea,
        maxArea: req.query.maxArea,
        price: req.query.price,
      },
    });

    // ---------- MAIN SEARCH LOGIC ----------
    let rentalMain = [];
    let saleMain = [];

    if (normalizedType === 'rent') {
      rentalMain = await RentalProperty.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit)
        .populate('owner', 'name email')
        .lean();
    } else if (normalizedType === 'sale') {
      saleMain = await SaleProperty.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit)
        .populate({ path: 'ownerId', select: 'name email', strictPopulate: false })
        .lean();
    } else {
      // No explicit type => search both
      rentalMain = await RentalProperty.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit)
        .populate('owner', 'name email')
        .lean();
      saleMain = await SaleProperty.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit)
        .populate({ path: 'ownerId', select: 'name email', strictPopulate: false })
        .lean();
    }

    let mainResults = [];
    if (normalizedType === 'rent') {
      mainResults = rentalMain.map((p) => ({ ...p, type: 'rent', defaultpropertytype: 'rental' }));
    } else if (normalizedType === 'sale') {
      mainResults = saleMain.map((p) => ({ ...p, type: 'sale', defaultpropertytype: 'sale' }));
    } else {
      const rentalsWithType = rentalMain.map((p) => ({ ...p, type: 'rent', defaultpropertytype: 'rental' }));
      const salesWithType = saleMain.map((p) => ({ ...p, type: 'sale', defaultpropertytype: 'sale' }));
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
    // console.log("🔍 Location-based search query fields:", queryFields);

    const userId = req.user?._id;
    // Add pagination parameters (global pagination applied after merging models)
    const { limit: parsedLimit, skip } = getPagination(req);

    if (!queryFields || !Array.isArray(queryFields) || queryFields.length === 0) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // ----- Save user search history (no duplicates) -----
    if (userId) {
      const currentQuery = queryFields.join(", ");
      const exists = await SearchHistory.findOne({ user: userId, query: currentQuery });
      if (!exists) {
        await SearchHistory.create({ user: userId, query: currentQuery, type: "location" });
      }
    }

    // ----- Build OR search conditions (dedupe & robust field coverage) -----
    const uniqueFields = [...new Set(queryFields.filter(Boolean))];
    const orConditions = uniqueFields.flatMap((field) => {
      const regex = new RegExp(String(field).trim(), "i");
      return [
        { Sector: regex },
        { address: regex },
        { city: regex },
        { state: regex },
        { locality: regex },
        // Optional fallbacks if your schema includes them
        { district: regex },
        { county: regex },
        { area: regex },
      ];
    });

    const baseFilter = { $and: [{ isActive: true }, { $or: orConditions }] };

    // ----- Query both models (pull extra to allow global slice) -----
    // We over-fetch then apply a global skip/limit post-merge for correct cross-model pagination.
    const overFetch = parsedLimit * 2 + skip; // try to ensure we have enough to slice globally

    const [rentalMatches, saleMatches] = await Promise.all([
      RentalProperty.find(baseFilter)
        .sort({ createdAt: -1 })
        .limit(overFetch)
        .populate("owner", "name email")
        .lean(),
      SaleProperty.find(baseFilter)
        .sort({ createdAt: -1 })
        .limit(overFetch)
        .populate({ path: "ownerId", select: "name email", strictPopulate: false })
        .lean(),
    ]);

    // Annotate with type and normalize defaultpropertytype
    const rentalsWithType = rentalMatches.map((p) => ({
      ...p,
      type: "rent",
      defaultpropertytype: "rental",
    }));
    const salesWithType = saleMatches.map((p) => ({
      ...p,
      type: "sale",
      defaultpropertytype: "sale",
    }));

    // Merge and sort by createdAt desc
    const merged = [...rentalsWithType, ...salesWithType].sort((a, b) => {
      const da = new Date(a.createdAt || 0).getTime();
      const db = new Date(b.createdAt || 0).getTime();
      return db - da;
    });

    // Apply global pagination
    const pageSlice = merged.slice(skip, skip + parsedLimit);

    // console.log("🔍 Location-based combined results count (pre-slice, post-merge):", merged.length);
    // console.log("🔍 Location-based returned page size:", pageSlice.length, "page:", Math.floor(skip / parsedLimit) + 1);

    // ----- Return results (array to keep API backward-compatible) -----
    return res.status(200).json(pageSlice);
  } catch (error) {
    console.error("❌ Location-based search error:", error);
    return res.status(500).json({ message: "Server error while searching properties" });
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
