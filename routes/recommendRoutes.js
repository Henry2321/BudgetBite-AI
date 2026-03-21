const express = require("express");
const Restaurant = require("../models/Restaurant");
const {
  convertFromUsd,
  convertToUsd,
  formatCurrencyAmount,
  normalizeCurrency,
} = require("../utils/currency");

const router = express.Router();

const mealByCategory = {
  Vietnamese: ["Pho Bo", "Com Tam", "Bun Thit Nuong"],
  "Street Food": ["Banh Mi Special", "Spring Roll Combo", "Sticky Rice Pack"],
  Japanese: ["Salmon Sushi Set", "Chicken Katsu Bowl", "Teriyaki Bento"],
  Italian: ["Spaghetti Bolognese", "Pesto Pasta", "Creamy Mushroom Penne"],
  "Fast Food": ["Cheese Burger Meal", "Crispy Chicken Burger", "Double Beef Combo"],
  Healthy: ["Chicken Salad Bowl", "Avocado Grain Bowl", "Tofu Veggie Bowl"],
  Indian: ["Butter Chicken Rice", "Paneer Curry Bowl", "Chicken Biryani"],
  Mexican: ["Beef Taco Set", "Chicken Burrito", "Loaded Nachos"],
  Chinese: ["Shrimp Dumpling Basket", "BBQ Pork Bun Set", "Fried Rice Combo"],
};

router.post("/", async (req, res) => {
  try {
    const { budget } = req.body;
    const currency = normalizeCurrency(req.body.currency);
    const parsedBudget = Number(budget);

    if (budget === undefined || Number.isNaN(parsedBudget)) {
      return res.status(400).json({
        message: "Budget is required and must be a valid number",
      });
    }

    const budgetInUsd = convertToUsd(parsedBudget, currency);

    const restaurants = await Restaurant.find({
      price_min: { $lte: budgetInUsd },
    })
      .sort({ rating: -1 })
      .limit(6);

    if (restaurants.length === 0) {
      return res.status(404).json({
        message: "No restaurants found for this budget",
      });
    }

    const suggestions = restaurants.slice(0, 3).map((restaurant, index) => {
      const meals =
        mealByCategory[restaurant.category] || [
          "Chef Special Meal",
          "House Combo",
          "Budget Friendly Plate",
        ];
      const mealName = meals[index % meals.length];
      const estimatedPriceUsd = Math.min(
        budgetInUsd,
        Math.round((restaurant.price_min + restaurant.price_max) / 2)
      );
      const estimatedPrice = convertFromUsd(estimatedPriceUsd, currency);

      return {
        restaurant: restaurant.name,
        category: restaurant.category,
        meal_name: mealName,
        estimated_price: estimatedPrice,
        currency,
        explanation: `${mealName} from ${restaurant.name} fits a budget of ${formatCurrencyAmount(
          parsedBudget,
          currency
        )} and is backed by a ${restaurant.rating} rating.`,
      };
    });

    return res.json({
      budget: parsedBudget,
      currency,
      suggestions,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to generate recommendations",
      error: error.message,
    });
  }
});

module.exports = router;
