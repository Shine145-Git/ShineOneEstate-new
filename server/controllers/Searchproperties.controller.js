const Property = require("../models/Rentalproperty.model");
const SearchHistory = require("../models/SearchHistory.model");

// Search for properties by address or area and save search history if user is logged in
exports.searchProperties = async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user?._id;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Save search history if user logged in
    if (userId) {
      await SearchHistory.create({ user: userId, query });
    }

    // Split query into individual parts (by space or comma)
    const parts = query
      .split(/[, ]+/)
      .map((p) => p.trim())
      .filter(Boolean);

    // Separate numeric and text parts
    const numbers = parts.filter((p) => !isNaN(p));
    const texts = parts.filter((p) => isNaN(p));

    // Regex for text parts (address search)
    const regexArray = texts.map((word) => new RegExp(word, "i"));

    // Build OR conditions for text fields
    const textFields = [
      "address",
      "propertyType",
      "purpose",
      "layoutFeatures",
      "appliances",
      "conditionAge",
      "renovations",
      "parking",
      "outdoorSpace",
      "neighborhoodVibe",
      "transportation",
      "localAmenities",
      "communityFeatures",
      "petPolicy",
      "smokingPolicy",
      "maintenance",
      "insurance",
    ];

    const orConditionsText = regexArray.flatMap((r) =>
      textFields.map((field) => ({ [field]: r }))
    );

    // Build OR conditions for numeric fields
    const orConditionsNumbers = numbers.flatMap((num) => [
      { bedrooms: Number(num) },
      { bathrooms: Number(num) },
      { totalArea: { $gte: Number(num) - 100, $lte: Number(num) + 100 } }, // ±100 sqft range
      { monthlyRent: { $gte: Number(num) - 2000, $lte: Number(num) + 2000 } }, // ±₹2000 range
    ]);

    const orConditions = [...orConditionsText, ...orConditionsNumbers];

    const results = await Property.find({ $or: orConditions }).populate(
      "owner",
      "name email"
    );

    if (!results.length) {
      return res.status(404).json({ message: "No properties found" });
    }

    res.status(200).json(results);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error while searching properties" });
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

    // Save user search query if logged in
    if (userId) {
      await SearchHistory.create({
        user: userId,
        query: queryFields.join(", "),
      });
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

    const results = await Property.find({ $or: orConditions }).populate(
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

      // Split query into smaller searchable parts
      const queryParts = lastQuery
        .split(",")
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

      recommended = await Property.find({ $or: orConditions })
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
