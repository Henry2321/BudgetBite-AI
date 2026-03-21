const express = require("express");
const Restaurant = require("../models/Restaurant");
const {
  convertFromUsd,
  convertToUsd,
  formatCurrencyAmount,
  normalizeCurrency,
} = require("../utils/currency");
const {
  buildRecommendationResponse,
} = require("../services/recommendationService");

const router = express.Router();

const mealByCategory = {
  Vietnamese: ["Pho Bo", "Com Tam", "Bun Thit Nuong"],
  "Street Food": ["Banh Mi Special", "Spring Roll Combo", "Sticky Rice Pack"],
  Japanese: ["Salmon Sushi Set", "Chicken Katsu Bowl", "Teriyaki Bento"],
  Italian: ["Spaghetti Bolognese", "Pesto Pasta", "Creamy Mushroom Penne"],
  "Fast Food": [
    "Cheese Burger Meal",
    "Crispy Chicken Burger",
    "Double Beef Combo",
  ],
  Healthy: ["Chicken Salad Bowl", "Avocado Grain Bowl", "Tofu Veggie Bowl"],
  Indian: ["Butter Chicken Rice", "Paneer Curry Bowl", "Chicken Biryani"],
  Mexican: ["Beef Taco Set", "Chicken Burrito", "Loaded Nachos"],
  Chinese: ["Shrimp Dumpling Basket", "BBQ Pork Bun Set", "Fried Rice Combo"],
};

function buildDatabaseSuggestions({ restaurants, budget, currency }) {
  return restaurants.slice(0, 3).map((restaurant, index) => {
    const meals = mealByCategory[restaurant.category] || [
      "Chef Special Meal",
      "House Combo",
      "Budget Friendly Plate",
    ];
    const mealName = meals[index % meals.length];
    const estimatedPrice = Math.min(
      budget,
      convertFromUsd(
        Math.round((restaurant.price_min + restaurant.price_max) / 2),
        currency,
      ),
    );

    return {
      restaurant: restaurant.name,
      category: restaurant.category,
      meal_name: mealName,
      estimated_price: estimatedPrice,
      currency,
      explanation: `${mealName} from ${restaurant.name} fits a budget of ${formatCurrencyAmount(
        budget,
        currency,
      )} and is backed by a ${restaurant.rating} rating.`,
    };
  });
}

router.post("/", async (req, res) => {
  try {
    const { budget, lat, lng, query } = req.body;
    const currency = normalizeCurrency(req.body.currency);
    const parsedBudget = Number(budget);
    const parsedLat = lat === undefined ? NaN : Number(lat);
    const parsedLng = lng === undefined ? NaN : Number(lng);

    if (
      budget === undefined ||
      Number.isNaN(parsedBudget) ||
      parsedBudget <= 0
    ) {
      return res.status(400).json({
        message: "Budget is required and must be a valid number greater than 0",
      });
    }

    const hasCoordinates = !Number.isNaN(parsedLat) && !Number.isNaN(parsedLng);

    if (hasCoordinates) {
      const result = await buildRecommendationResponse({
        lat: parsedLat,
        lng: parsedLng,
        budget: parsedBudget,
        currency,
        query: typeof query === "string" ? query.trim() : "",
      });

      console.log("lat:", parsedLat, "lng:", parsedLng);
      console.log("hasCoordinates:", hasCoordinates);
      if (result.suggestions.length > 0) {
        return res.json({
          budget: parsedBudget,
          currency,
          source: result.source,
          model: result.model,
          suggestions: result.suggestions,
        });
      }
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

    return res.json({
      budget: parsedBudget,
      currency,
      source: "database",
      model: null,
      suggestions: buildDatabaseSuggestions({
        restaurants,
        budget: parsedBudget,
        currency,
      }),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to generate recommendations",
      error: error.message,
    });
  }
});

module.exports = router;
