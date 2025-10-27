const RentalProperty = require("../models/Rentalproperty.model");
const SaleProperty = require("../models/SaleProperty.model");
const SearchHistory = require("../models/SearchHistory.model");

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
      $or: [
        { address: fullQueryRegex },
        { localAmenities: fullQueryRegex },
        { propertyType: fullQueryRegex },
        { neighborhoodVibe: fullQueryRegex },
      ],
    }).populate("owner", "name email");

    // --- MAIN SALE SEARCH ---
    let saleOrConditions = [
      { title: fullQueryRegex },
      { description: fullQueryRegex },
      { location: fullQueryRegex },
      { propertyType: fullQueryRegex },
    ];

    // Handle numeric query types (BHK / Price / Area)
    if (bhkMatch) {
      const bhkNum = parseInt(bhkMatch[1]);
      saleOrConditions.push({ bedrooms: bhkNum });
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

    const saleMain = await SaleProperty.find({ $or: saleOrConditions })
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
          $or: [
            { address: sectorRegex },
            { localAmenities: sectorRegex },
          ],
        }).populate("owner", "name email");
      }
      if (type === "sale" || !type) {
        saleSector = await SaleProperty.find({
          $or: [
            { location: sectorRegex },
          ],
        }).populate({ path: "ownerId", select: "name email", strictPopulate: false });
      }
      const allResults = type === "rent"
        ? rentalSector
        : type === "sale"
        ? saleSector
        : [...rentalSector, ...saleSector];
      return res.status(200).json(allResults);
    }

    // If not a strict sector/area query, allow main + nearby as before
    const allResults = [...mainResults, ...nearbyResults];
    res.status(200).json(allResults);
  } catch (error) {
    console.error("Enhanced search error:", error);
    res.status(500).json({ message: "Server error while searching properties", error: error.message });
  }
};

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

    const results = await RentalProperty.find({ $or: orConditions }).populate(
      "owner",
      "name email"
    );
    // console.log("Location-based search query:", queryFields);

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

      recommended = await RentalProperty.find({ $or: orConditions })
        .limit(10)
        .populate("owner", "name email");
    }

    // console.log("History:", history);
    console.log("Recommended:", recommended);

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
