const mongoose = require("mongoose");
const dotenv = require("dotenv");
const RentalProperty = require("./models/Rentalproperty.model");

dotenv.config();

const MONGO_URI =
  "mongodb+srv://WeCode_Users:WeCode234@wecode.9w3wipp.mongodb.net/Neo-Urban?retryWrites=true&w=majority&appName=Neo-Urban";

const propertyTypes = ["house", "apartment", "condo", "townhouse", "villa"];
const sectors = ["Sector 1", "Sector 2", "Sector 3", "Sector 4", "Sector 5"];
const vibes = ["Quiet and green", "Lively area", "Family-friendly", "Modern urban feel"];
const amenities = ["Gym", "Park", "Mall", "Metro Station", "Hospital", "School", "Supermarket"];
const communityFeatures = ["Swimming Pool", "Clubhouse", "Security", "Play Area", "Garden"];
const parkingOptions = ["Covered", "Street", "Open", "Basement"];
const furnishing = ["Fully Furnished", "Semi-Furnished", "Unfurnished"];

// 👉 Add your User ID here
const ownerId = new mongoose.Types.ObjectId("68e8e7d03c0f762663ec6d1f");

const generateRandomProperty = (i) => {
  const bedrooms = Math.floor(Math.random() * 4) + 1; // 1–4 BHK
  const bathrooms = Math.floor(Math.random() * 3) + 1;
  const sqft = 800 + Math.floor(Math.random() * 2000);
  const monthlyRent = 8000 + Math.floor(Math.random() * 45000);

  return {
    address: `Plot ${i + 1}, ${sectors[Math.floor(Math.random() * sectors.length)]}, Gurugram`,
    Sector: sectors[Math.floor(Math.random() * sectors.length)],
    propertyType: propertyTypes[Math.floor(Math.random() * propertyTypes.length)],
    purpose: "rent",
    bedrooms,
    bathrooms,
    totalArea: {
      sqft,
      configuration: `${bedrooms} BHK`,
    },
    layoutFeatures: "Spacious layout with good ventilation",
    appliances: ["Fridge", "Washing Machine", "Microwave"].slice(0, Math.floor(Math.random() * 3) + 1),
    conditionAge: "Less than 5 years",
    renovations: "Recently painted",
    parking: parkingOptions[Math.floor(Math.random() * parkingOptions.length)],
    outdoorSpace: "Balcony",
    monthlyRent,
    leaseTerm: "11 months",
    securityDeposit: "2 months rent",
    otherFees: "Maintenance extra",
    utilities: ["Water", "Electricity"],
    tenantRequirements: "Family or working professionals preferred",
    moveInDate: new Date(),
    neighborhoodVibe: vibes[Math.floor(Math.random() * vibes.length)],
    transportation: "Near Metro & Bus Stop",
    localAmenities: amenities[Math.floor(Math.random() * amenities.length)],
    communityFeatures: communityFeatures.sort(() => 0.5 - Math.random()).slice(0, 3),
    petPolicy: "Pets allowed",
    smokingPolicy: "No smoking inside property",
    maintenance: "Handled by owner",
    insurance: "Optional",
    images: [
      "https://images.unsplash.com/photo-1560184897-47a0d0f8e0c7",
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
    ],
    isActive: true,
    owner: ownerId, // ✅ Assign your user here
  };
};

const seedRentalProperties = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected");

    await RentalProperty.deleteMany({});
    console.log("🧹 Cleared existing rental properties");

    const properties = Array.from({ length: 80 }, (_, i) => generateRandomProperty(i));
    await RentalProperty.insertMany(properties);

    console.log(`🎉 Successfully inserted ${properties.length} rental properties`);
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error seeding properties:", error);
    mongoose.connection.close();
  }
};

seedRentalProperties();