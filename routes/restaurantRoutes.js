const express = require("express");
const Restaurant = require("../models/Restaurant");
const {
  convertFromUsd,
  convertToUsd,
  normalizeCurrency,
} = require("../utils/currency");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { budget } = req.query;
    const currency = normalizeCurrency(req.query.currency);
    const filter = {};

    if (budget !== undefined) {
      const parsedBudget = Number(budget);

      if (Number.isNaN(parsedBudget)) {
        return res.status(400).json({
          message: "Budget must be a valid number",
        });
      }

      filter.price_min = { $lte: convertToUsd(parsedBudget, currency) };
    }

    const restaurants = await Restaurant.find(filter)
      .sort({ rating: -1 })
      .lean();

    const formattedRestaurants = restaurants.map((restaurant) => ({
      ...restaurant,
      currency,
      price_min: convertFromUsd(restaurant.price_min, currency),
      price_max: convertFromUsd(restaurant.price_max, currency),
    }));

    return res.json(formattedRestaurants);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch restaurants",
      error: error.message,
    });
  }
});

module.exports = router;
