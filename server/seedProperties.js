

const mongoose = require("mongoose");
const RentalProperty = require("./models/Rentalproperty.model");
const SaleProperty = require("./models/SaleProperty.model");

const seedProperties = async () => {
  await mongoose.connect("mongodb+srv://WeCode_Users:WeCode234@wecode.9w3wipp.mongodb.net/Neo-Urban?retryWrites=true&w=majority&appName=Neo-Urban");

  await RentalProperty.deleteMany({});
  await SaleProperty.deleteMany({});

  const properties = [
    // 🏠 SECTOR VARIATIONS
    {
      address: "Luxury Apartment, Sector-45 Gurgaon",
      Sector: "Sector-45",
      totalArea: { configuration: "2 BHK" },
    },
    {
      address: "Modern Flat, sector 45 Gurugram",
      Sector: "sector 45",
      totalArea: { configuration: "3 BHK" },
    },
    {
      address: "Highrise Towers, Sec-45",
      Sector: "Sec-45",
      totalArea: { configuration: "4 BHK" },
    },
    {
      address: "Urban Residency, SEC45",
      Sector: "SEC45",
      totalArea: { configuration: "1 BHK" },
    },
    {
      address: "Green Homes, s 45",
      Sector: "s 45",
      totalArea: { configuration: "2 BHK" },
    },
    {
      address: "Harmony Heights, Sector45",
      Sector: "Sector45",
      totalArea: { configuration: "3 BHK" },
    },

    // 🧱 WRONG SECTOR EDGE CASES
    {
      address: "Skyline Residency, Sector-451",
      Sector: "Sector-451",
      totalArea: { configuration: "2 BHK" },
    },
    {
      address: "Orchid Villas, Sector-46",
      Sector: "Sector-46",
      totalArea: { configuration: "4 BHK" },
    },

    // 🛏️ BHK VARIATIONS
    {
      address: "Luxury Villa, Sector-45",
      Sector: "Sector-45",
      totalArea: { configuration: "2bhk" },
    },
    {
      address: "Affordable Flat, Sector-45",
      Sector: "Sector-45",
      totalArea: { configuration: "2 bhk" },
    },
    {
      address: "Palm Residency, Sector-45",
      Sector: "Sector-45",
      totalArea: { configuration: "2-BHK" },
    },
    {
      address: "Dream Heights, Sector-45",
      Sector: "Sector-45",
      totalArea: { configuration: "2 BHK Apartment" },
    },

    // 🏙️ COMBINED PHRASES
    {
      address: "2bhk in sector 45 Gurgaon",
      Sector: "Sector-45",
      totalArea: { configuration: "2 BHK" },
    },
    {
      address: "3bhk sector-45 near Huda City",
      Sector: "Sector-45",
      totalArea: { configuration: "3 BHK" },
    },
    {
      address: "1bhk sec 45 gurgaon",
      Sector: "Sec-45",
      totalArea: { configuration: "1 BHK" },
    },
    {
      address: "4bhk in sector45 gurugram",
      Sector: "Sector45",
      totalArea: { configuration: "4 BHK" },
    },

    // 🧩 NUMERIC ONLY
    {
      address: "Budget Homes, 45 Gurgaon",
      Sector: "Sector-45",
      totalArea: { configuration: "2 BHK" },
    },
    {
      address: "Penthouse in 46 Gurugram",
      Sector: "Sector-46",
      totalArea: { configuration: "5 BHK" },
    },

    // 🧠 TEXTUAL EDGE CASES
    {
      address: "Beautiful 2BHK near sector-45 metro",
      Sector: "Sector-45",
      totalArea: { configuration: "2 BHK" },
      description: "Close to Sector-45 Metro Station",
    },
    {
      address: "2 BHK apartment Sector-45, good view",
      Sector: "Sector-45",
      totalArea: { configuration: "2 BHK" },
      description: "Great location near park in Sector 45",
    },
  ];

  await RentalProperty.insertMany(properties);

  // Add title and price for SaleProperty documents only
  const saleProperties = properties.map((p, i) => ({
    ...p,
    title: `Sample Sale Property ${i + 1}`,
    price: Math.floor(Math.random() * 9000000) + 1000000, // random 1M–10M
  }));
  await SaleProperty.insertMany(saleProperties);

  console.log("✅ Seed data inserted successfully.");
  process.exit();
};

seedProperties();