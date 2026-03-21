const OpenAI = require("openai");
const axios = require("axios");
const {
  formatCurrencyAmount,
  normalizeCurrency,
  convertToUsd,
} = require("../utils/currency");

const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const FOURSQUARE_API_KEY = process.env.FOURSQUARE_API_KEY;

let openaiClient = null;

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  return openaiClient;
}

async function searchFoursquarePlaces({ lat, lng, query, budgetUsd }) {
  if (
    !FOURSQUARE_API_KEY ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    !Number.isFinite(budgetUsd)
  ) {
    return [];
  }

  const priceRange =
    budgetUsd <= 10
      ? { min: 1, max: 1 }
      : budgetUsd <= 25
        ? { min: 1, max: 2 }
        : budgetUsd <= 50
          ? { min: 2, max: 3 }
          : { min: 3, max: 4 };

  const response = await axios.get("https://api.foursquare.com/v3/places/search", {
    headers: {
      Authorization: FOURSQUARE_API_KEY,
      Accept: "application/json",
    },
    params: {
      query: String(query || "restaurant").trim() || "restaurant",
      ll: `${lat},${lng}`,
      radius: 2000,
      limit: 12,
      categories: "13000",
      min_price: priceRange.min,
      max_price: priceRange.max,
      sort: "distance",
      fields: "fsq_id,name,location,rating,price,categories,distance",
    },
  });

  return (response.data.results || []).map((place) => ({
    fsq_id: place.fsq_id,
    name: place.name,
    address:
      place.location?.formatted_address ||
      [place.location?.address, place.location?.locality, place.location?.region]
        .filter(Boolean)
        .join(", "),
    rating: place.rating ? Number((place.rating / 2).toFixed(1)) : null,
    price_level: place.price || null,
    category: place.categories?.[0]?.name || "Restaurant",
    distance_m: place.distance || null,
  }));
}

function buildFallbackSuggestions({ places, budget, currency }) {
  return places.slice(0, 6).map((place) => ({
    restaurant: place.name,
    category: place.category,
    address: place.address,
    rating: place.rating,
    distance_m: place.distance_m,
    meal_name: `${place.category} Special`,
    estimated_price: budget,
    currency,
    explanation: `${place.name} is a nearby ${place.category.toLowerCase()} that fits your budget of ${formatCurrencyAmount(
      budget,
      currency
    )}.`,
  }));
}

async function generateOpenAiSuggestions({ places, budget, currency, query }) {
  const openai = getOpenAIClient();

  if (!openai) {
    return null;
  }

  const candidates = places.map((place) => ({
    name: place.name,
    category: place.category,
    address: place.address,
    rating: place.rating,
    distance_m: place.distance_m,
  }));

  const response = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are BudgetBite AI, a practical food recommendation assistant. Use only the restaurants provided. Return exactly 6 suggestions as JSON: { suggestions: [ { restaurant, category, meal_name, estimated_price, explanation } ] }. Keep explanations short, concrete, and budget-aware. Prioritize suggestions that best match the user's food description. Do not invent restaurant names outside the list.",
      },
      {
        role: "user",
        content: `Budget: ${formatCurrencyAmount(
          budget,
          currency
        )}\nCurrency: ${currency}${query ? `\nUser request: ${query}` : ""}\nNearby restaurants:\n${JSON.stringify(
          candidates,
          null,
          2
        )}`,
      },
    ],
  });

  return JSON.parse(response.choices[0].message.content);
}

function mergeAiWithPlaces({ aiSuggestions, places, budget, currency }) {
  const placeMap = new Map(places.map((place) => [place.name.toLowerCase(), place]));

  return (Array.isArray(aiSuggestions) ? aiSuggestions : [])
    .map((item) => {
      const place = placeMap.get(String(item.restaurant || "").trim().toLowerCase());

      if (!place) {
        return null;
      }

      return {
        restaurant: place.name,
        category: item.category || place.category,
        address: place.address,
        rating: place.rating,
        distance_m: place.distance_m,
        meal_name: item.meal_name || `${place.category} Special`,
        estimated_price: Number(item.estimated_price) || budget,
        currency,
        explanation:
          item.explanation || `${place.name} is a great fit for your budget.`,
      };
    })
    .filter(Boolean);
}

async function buildRecommendationResponse({ lat, lng, budget, currency, query }) {
  const normalizedCurrency = normalizeCurrency(currency);
  const budgetUsd = convertToUsd(budget, normalizedCurrency);

  let places = [];

  try {
    places = await searchFoursquarePlaces({ lat, lng, query, budgetUsd });
  } catch (error) {
    console.error("Foursquare error:", error.message);
  }

  const fallbackSuggestions = buildFallbackSuggestions({
    places,
    budget,
    currency: normalizedCurrency,
  });

  if (places.length === 0) {
    return {
      source: "fallback",
      model: null,
      suggestions: fallbackSuggestions,
    };
  }

  try {
    const aiPayload = await generateOpenAiSuggestions({
      places,
      budget,
      currency: normalizedCurrency,
      query,
    });

    if (!aiPayload) {
      return {
        source: "fallback",
        model: null,
        suggestions: fallbackSuggestions,
      };
    }

    const aiSuggestions = mergeAiWithPlaces({
      aiSuggestions: aiPayload.suggestions,
      places,
      budget,
      currency: normalizedCurrency,
    });

    const merged =
      aiSuggestions.length >= 6
        ? aiSuggestions.slice(0, 6)
        : [
            ...aiSuggestions,
            ...fallbackSuggestions.filter(
              (fallback) =>
                !aiSuggestions.find(
                  (suggestion) => suggestion.restaurant === fallback.restaurant
                )
            ),
          ].slice(0, 6);

    return {
      source: "openai",
      model: OPENAI_MODEL,
      suggestions: merged,
    };
  } catch (error) {
    console.error("OpenAI recommendation error:", error.message);

    return {
      source: "fallback",
      model: null,
      suggestions: fallbackSuggestions,
    };
  }
}

module.exports = {
  buildRecommendationResponse,
  searchFoursquarePlaces,
};
