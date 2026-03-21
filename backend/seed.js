const mongoose = require("mongoose");

const Restaurant = require("./models/Restaurant");
const restaurants = require("./data/restaurants");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/budgetbite_ai";

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    await Restaurant.deleteMany({});
    await Restaurant.insertMany(restaurants);

    console.log(`Seeded ${restaurants.length} restaurants`);
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
}

seedDatabase();
