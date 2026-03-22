const express = require("express");
const { normalizeCurrency } = require("../utils/currency");
const { buildRecommendationResponse } = require("../services/recommendationService");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { budget, lat, lng, query, mealTime, people, language } = req.body;
    const currency = normalizeCurrency(req.body.currency);
    const parsedBudget = Number(budget);
    const parsedLat = lat === undefined ? NaN : Number(lat);
    const parsedLng = lng === undefined ? NaN : Number(lng);

    if (budget === undefined || Number.isNaN(parsedBudget) || parsedBudget <= 0) {
      return res.status(400).json({ message: "Budget is required and must be a valid number greater than 0" });
    }

    if (lat === undefined || lng === undefined || Number.isNaN(parsedLat) || Number.isNaN(parsedLng)) {
      return res.status(400).json({ message: "Location (lat, lng) is required" });
    }

    const result = await buildRecommendationResponse({
      lat: parsedLat,
      lng: parsedLng,
      budget: parsedBudget,
      currency,
      query: typeof query === "string" ? query.trim() : "",
      mealTime: typeof mealTime === "string" ? mealTime.trim() : "",
      people: Math.max(1, parseInt(people) || 1),
      language: currency === "VND" ? "vi" : "en",
      language: language === "vi" ? "vi" : "en",
    });

    return res.json({
      budget: parsedBudget,
      currency,
      source: result.source,
      model: result.model,
      suggestions: result.suggestions,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to generate recommendations", error: error.message });
  }
});

module.exports = router;
