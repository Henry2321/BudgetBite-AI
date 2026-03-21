const OpenAI = require("openai");
const axios = require("axios");
const { formatCurrencyAmount, normalizeCurrency } = require("../utils/currency");

const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

let openaiClient = null;

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

async function getAreaName({ lat, lng }) {
  try {
    const response = await axios.get("https://nominatim.openstreetmap.org/reverse", {
      params: { lat, lon: lng, format: "json" },
      headers: { "User-Agent": "BudgetBiteAI/1.0" },
    });
    const addr = response.data.address || {};
    return [addr.suburb, addr.city || addr.town || addr.village]
      .filter(Boolean)
      .join(", ") || "khu vực của bạn";
  } catch {
    return "khu vực của bạn";
  }
}

async function generateOpenAiSuggestions({ area, lat, lng, budget, currency, query }) {
  const openai = getOpenAIClient();
  if (!openai) return null;

  const userLocation = `${area} (coordinates: ${lat}, ${lng})`;
  const userRequest = query
    ? `Món muốn ăn: ${query}. Ngân sách: ${formatCurrencyAmount(budget, currency)}.`
    : `Gợi ý món ăn ngon phù hợp ngân sách ${formatCurrencyAmount(budget, currency)}.`;

  const systemPrompt = `You are a local culinary expert with deep knowledge of restaurants, food stalls, and city maps. Your task is to recommend dining locations based on the user's location, preferences, and budget.

⛔ STRICT RULES (NEVER VIOLATE):
1. ZERO HALLUCINATION: Only recommend REAL, currently operating restaurants and eateries.
2. CORRECT DISH FOR THE RESTAURANT: The meal_name MUST be a signature dish or a verified menu item at the recommended restaurant. (e.g., Do not recommend "Pho" at "KFC").
3. FALLBACK TO CHAINS IF UNSURE: If the user's area is too remote or you lack 100% accurate data for local spots, recommend well-known chain restaurants that definitely serve the desired food to ensure accuracy.
4. ACTUAL ADDRESSES: You must provide a specific street address (Street name, District, City). Do not just write "Near you" or "Nearby".

🎯 REQUIRED OUTPUT FORMAT:
Return a valid JSON object: { "suggestions": [ ...array of 6 items... ] }
Each item must have exactly these fields:
- restaurant: string (exact restaurant name)
- meal_name: string (specific dish actually on their menu)
- category: string (e.g. Noodles, Western, Dessert)
- estimated_price: number (within budget, in ${currency})
- address: string (specific street address)
- rating: number (e.g. 4.5)
- distance_m: number (estimated meters from user location)
- explanation: string (short engaging reason in Vietnamese)`;

  const response = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `User's current location: ${userLocation}\nUser's request: ${userRequest}`,
      },
    ],
  });

  return JSON.parse(response.choices[0].message.content);
}

function buildFallbackSuggestions({ area, budget, currency }) {
  const items = [
    { restaurant: "Quán Cơm Bình Dân", category: "Vietnamese", meal_name: "Cơm sườn bì chả", address: area, rating: 4.0, distance_m: 500 },
    { restaurant: "Bún Bò Huế Dì Ba", category: "Vietnamese", meal_name: "Bún bò Huế", address: area, rating: 4.2, distance_m: 700 },
    { restaurant: "Phở Gia Truyền", category: "Vietnamese", meal_name: "Phở bò tái nạm", address: area, rating: 4.3, distance_m: 900 },
    { restaurant: "Bánh Mì Huynh Hoa", category: "Street Food", meal_name: "Bánh mì đặc biệt", address: area, rating: 4.5, distance_m: 1200 },
    { restaurant: "Cơm Tấm Thuận Kiều", category: "Vietnamese", meal_name: "Cơm tấm sườn nướng", address: area, rating: 4.1, distance_m: 1500 },
    { restaurant: "Bún Thịt Nướng Cô Năm", category: "Vietnamese", meal_name: "Bún thịt nướng", address: area, rating: 4.0, distance_m: 1800 },
  ];

  return items.map((item) => ({
    ...item,
    estimated_price: budget,
    currency,
    explanation: `Món phổ biến tại ${area} phù hợp ngân sách ${formatCurrencyAmount(budget, currency)}.`,
  }));
}

async function buildRecommendationResponse({ lat, lng, budget, currency, query }) {
  const normalizedCurrency = normalizeCurrency(currency);
  const area = await getAreaName({ lat, lng });

  try {
    const aiPayload = await generateOpenAiSuggestions({
      area, lat, lng, budget, currency: normalizedCurrency, query,
    });

    if (!aiPayload || !Array.isArray(aiPayload.suggestions)) {
      return { source: "fallback", model: null, suggestions: buildFallbackSuggestions({ area, budget, currency: normalizedCurrency }) };
    }

    const suggestions = aiPayload.suggestions.slice(0, 6).map((item) => ({
      restaurant: item.restaurant || "",
      category: item.category || "Restaurant",
      meal_name: item.meal_name || "",
      estimated_price: Number(item.estimated_price) || budget,
      currency: normalizedCurrency,
      address: item.address || area,
      rating: item.rating ? Number(item.rating) : null,
      distance_m: item.distance_m ? Number(item.distance_m) : null,
      explanation: item.explanation || "",
    }));

    return { source: "openai", model: OPENAI_MODEL, suggestions };
  } catch (error) {
    console.error("OpenAI recommendation error:", error.message);
    return { source: "fallback", model: null, suggestions: buildFallbackSuggestions({ area, budget, currency: normalizedCurrency }) };
  }
}

module.exports = { buildRecommendationResponse };
