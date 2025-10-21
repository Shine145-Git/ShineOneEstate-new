const mongoose = require("mongoose");
const Property = require("./models/Rentalproperty.model"); // Adjust path if needed
const { faker } = require("@faker-js/faker");

const MONGO_URI =
  "mongodb+srv://WeCode_Users:WeCode234@wecode.9w3wipp.mongodb.net/Neo-Urban?retryWrites=true&w=majority&appName=Neo-Urban";

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected to faker"))
  .catch((err) => console.error("MongoDB connection error:", err));

const ownerId = "68e104d4e16e48ae90748a3c"; // Replace with a valid owner _id from your DB

const generateSampleProperties = (count = 100) => {
  const properties = [];
  for (let i = 0; i < count; i++) {
    properties.push({
      address: faker.helpers.arrayElement([
        "Dwarka",
        "Rohini",
        "Pitampura",
        "Janakpuri",
        "Vasant Kunj",
        "Saket",
        "Greater Kailash",
        "Lajpat Nagar",
        "Mayur Vihar",
        "Nehru Place",
      ]),
      propertyType: faker.helpers.arrayElement([
        "Apartment",
        "Villa",
        "Condo",
        "Studio",
      ]),
      bedrooms: faker.number.int({ min: 1, max: 5 }),
      bathrooms: faker.number.int({ min: 1, max: 3 }),
      appliances: faker.helpers
        .shuffle(["Fridge", "Washer", "Dryer", "Microwave"])
        .slice(0, 2),
      renovations: faker.lorem.sentence(),
      parking: faker.helpers.arrayElement(["Garage", "Street", "None"]),
      leaseTerm: faker.helpers.arrayElement([
        "6 months",
        "12 months",
        "24 months",
      ]),
      otherFees: faker.lorem.sentence(),
      utilities: faker.helpers
        .shuffle(["Electricity", "Water", "Gas"])
        .slice(0, 2),
      moveInDate: faker.date.future(),
      transportation: faker.lorem.word(),
      communityFeatures: faker.helpers
        .shuffle(["Pool", "Gym", "Playground"])
        .slice(0, 2),
      petPolicy: faker.helpers.arrayElement(["Allowed", "Not Allowed"]),
      smokingPolicy: faker.helpers.arrayElement(["Allowed", "Not Allowed"]),
      maintenance: faker.lorem.sentence(),
      insurance: faker.lorem.sentence(),
      images: [],
      owner: ownerId,
    });
  }
  return properties;
};

const seed = async () => {
  try {
    const sampleProperties = generateSampleProperties(100);
    await Property.insertMany(sampleProperties);
    console.log("100 sample properties added!");
    mongoose.disconnect();
  } catch (err) {
    console.error("Error seeding properties:", err);
  }
};

seed();
