const OpenAI = require("openai");
const axios = require("axios");
const { formatCurrencyAmount, normalizeCurrency } = require("../utils/currency");

const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

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

function normalizeLanguage(value) {
  return value === "vi" ? "vi" : "en";
}

function getCopy(language) {
  if (language === "vi") {
    return {
      yourArea: "khu vực của bạn",
      mealTimeMap: {
        breakfast:
          "bữa sáng (các món ăn sáng như phở, bánh mì, xôi, cháo, hủ tiếu...)",
        lunch: "bữa trưa (các món cơm, bún, mì, phở...)",
        dinner: "bữa tối (các món nhậu, lẩu, cơm tối, đồ nướng...)",
        dessert: "tráng miệng (chè, kem, bánh ngọt, trái cây...)",
        drinks:
          "đồ uống (chỉ gợi ý cà phê, trà, sinh tố, nước ép, trà sữa, matcha latte và các thức uống tương tự)",
      },
      systemPrompt: (mealTimeText) =>
        `You are a food recommendation assistant. Suggest 6 meal ideas based on the user's request and budget.
Return JSON: { "suggestions": [ ...6 items... ] }
Each item must have exactly:
- meal_name: string (specific dish name in Vietnamese)
- restaurant_type: string (type of place in Vietnamese, e.g. "Quán bún bò", "Tiệm bánh mì")
- category: string
- explanation: string (1 short sentence in Vietnamese explaining why this is a good pick)
Do NOT include estimated_price or address/location fields.
${mealTimeText ? `Only suggest ideas appropriate for ${mealTimeText}.` : ""}`,
      userPrompt: ({ area, budget, currency, query, mealTimeText }) =>
        `Khu vực: ${area}\nNgân sách: ${formatCurrencyAmount(
          budget,
          currency
        )}\n${mealTimeText ? `Bữa ăn: ${mealTimeText}\n` : ""}${
          query
            ? `Người dùng muốn: ${query}`
            : "Gợi ý món ăn ngon phù hợp ngân sách"
        }`,
      fallbackItems: [
        {
          meal_name: "Cơm sườn bì chả",
          restaurant_type: "Quán cơm bình dân",
          category: "Vietnamese",
        },
        {
          meal_name: "Bún bò Huế",
          restaurant_type: "Quán bún bò",
          category: "Vietnamese",
        },
        {
          meal_name: "Phở bò tái nạm",
          restaurant_type: "Quán phở",
          category: "Vietnamese",
        },
        {
          meal_name: "Bánh mì đặc biệt",
          restaurant_type: "Tiệm bánh mì",
          category: "Street Food",
        },
        {
          meal_name: "Cơm tấm sườn nướng",
          restaurant_type: "Quán cơm tấm",
          category: "Vietnamese",
        },
        {
          meal_name: "Bún thịt nướng",
          restaurant_type: "Quán bún thịt nướng",
          category: "Vietnamese",
        },
      ],
      fallbackExplanation: (budget, currency, area) =>
        `Món phổ biến phù hợp ngân sách ${formatCurrencyAmount(
          budget,
          currency
        )} tại ${area}.`,
    };
  }

  return {
    yourArea: "your area",
    mealTimeMap: {
      breakfast:
        "breakfast (morning dishes like pho, banh mi, sticky rice, porridge, hu tieu)",
      lunch: "lunch (rice, noodles, vermicelli, pho and similar meals)",
      dinner: "dinner (grilled dishes, hotpot, evening meals, savory plates)",
      dessert: "dessert (sweet soups, ice cream, cakes, fruit)",
      drinks:
        "drinks (only beverages like coffee, tea, juice, smoothies, milk tea, matcha latte)",
    },
    systemPrompt: (mealTimeText) =>
      `You are a food recommendation assistant. Suggest 6 meal ideas based on the user's request and budget.
Return JSON: { "suggestions": [ ...6 items... ] }
Each item must have exactly:
- meal_name: string
- restaurant_type: string
- category: string
- explanation: string (1 short sentence in English explaining why this is a good pick)
Do NOT include estimated_price or address/location fields.
${mealTimeText ? `Only suggest ideas appropriate for ${mealTimeText}.` : ""}`,
    userPrompt: ({ area, budget, currency, query, mealTimeText }) =>
      `Area: ${area}\nBudget: ${formatCurrencyAmount(
        budget,
        currency
      )}\n${mealTimeText ? `Meal time: ${mealTimeText}\n` : ""}${
        query
          ? `User wants: ${query}`
          : "Suggest tasty meal ideas that fit the budget"
      }`,
    fallbackItems: [
      {
        meal_name: "Grilled pork rice",
        restaurant_type: "Local rice spot",
        category: "Vietnamese",
      },
      {
        meal_name: "Hue beef noodle soup",
        restaurant_type: "Beef noodle shop",
        category: "Vietnamese",
      },
      {
        meal_name: "Rare beef pho",
        restaurant_type: "Pho shop",
        category: "Vietnamese",
      },
      {
        meal_name: "Special banh mi",
        restaurant_type: "Banh mi stall",
        category: "Street Food",
      },
      {
        meal_name: "Broken rice with grilled pork",
        restaurant_type: "Com tam spot",
        category: "Vietnamese",
      },
      {
        meal_name: "Grilled pork vermicelli",
        restaurant_type: "Vermicelli shop",
        category: "Vietnamese",
      },
    ],
    fallbackExplanation: (budget, currency, area) =>
      `A popular option that fits a budget of ${formatCurrencyAmount(
        budget,
        currency
      )} around ${area}.`,
  };
}

async function getAreaName({ lat, lng, language }) {
  const copy = getCopy(language);

  try {
    const response = await axios.get(
      "https://nominatim.openstreetmap.org/reverse",
      {
        params: { lat, lon: lng, format: "json" },
        headers: { "User-Agent": "BudgetBiteAI/1.0" },
      }
    );
    const address = response.data.address || {};

    return (
      [address.suburb, address.city_district, address.city || address.town || address.village]
        .filter(Boolean)
        .join(", ") || copy.yourArea
    );
  } catch {
    return copy.yourArea;
  }
}

async function generateOpenAiSuggestions({
  area,
  budget,
  currency,
  query,
  mealTime,
  language,
}) {
  const openai = getOpenAIClient();

  if (!openai) {
    return null;
  }

  const copy = getCopy(language);
  const mealTimeText =
    mealTime && copy.mealTimeMap[mealTime] ? copy.mealTimeMap[mealTime] : "";

  const response = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: copy.systemPrompt(mealTimeText),
      },
      {
        role: "user",
        content: copy.userPrompt({
          area,
          budget,
          currency,
          query,
          mealTimeText,
        }),
      },
    ],
  });

  return JSON.parse(response.choices[0].message.content);
}

function buildGoogleMapsUrl({ mealName, area, lat, lng }) {
  const searchQuery = `${mealName} ${area}`;

  if (lat && lng) {
    return `https://www.google.com/maps/search/${encodeURIComponent(
      searchQuery
    )}/@${lat},${lng},15z`;
  }

  return `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`;
}

function buildFallbackSuggestions({ area, budget, currency, people, language }) {
  const copy = getCopy(language);

  return copy.fallbackItems.map((item) => ({
    ...item,
    estimated_price: budget,
    total_price: budget * people,
    people,
    currency,
    explanation: copy.fallbackExplanation(budget, currency, area),
    area,
    maps_url: buildGoogleMapsUrl({
      mealName: item.meal_name,
      area,
    }),
  }));
}

async function buildRecommendationResponse({
  lat,
  lng,
  budget,
  currency,
  query,
  mealTime,
  people,
  language,
}) {
  const normalizedCurrency = normalizeCurrency(currency);
  const normalizedLanguage = normalizeLanguage(language);
  const area = await getAreaName({
    lat,
    lng,
    language: normalizedLanguage,
  });
  const parsedPeople = Math.max(1, people || 1);
  const budgetPerPerson = Math.floor(budget / parsedPeople);

  try {
    const aiPayload = await generateOpenAiSuggestions({
      area,
      budget: budgetPerPerson,
      currency: normalizedCurrency,
      query,
      mealTime,
      language: normalizedLanguage,
    });

    if (!aiPayload || !Array.isArray(aiPayload.suggestions)) {
      return {
        source: "fallback",
        model: null,
        suggestions: buildFallbackSuggestions({
          area,
          budget: budgetPerPerson,
          currency: normalizedCurrency,
          people: parsedPeople,
          language: normalizedLanguage,
        }),
      };
    }

    const suggestions = aiPayload.suggestions.slice(0, 6).map((item) => ({
      meal_name: item.meal_name || "",
      restaurant_type: item.restaurant_type || "",
      category: item.category || "Restaurant",
      estimated_price: budgetPerPerson,
      total_price: budgetPerPerson * parsedPeople,
      people: parsedPeople,
      currency: normalizedCurrency,
      explanation: item.explanation || "",
      area,
      maps_url: buildGoogleMapsUrl({
        mealName: item.meal_name,
        area,
        lat,
        lng,
      }),
    }));

    return { source: "openai", model: OPENAI_MODEL, suggestions };
  } catch (error) {
    console.error("OpenAI recommendation error:", error.message);

    return {
      source: "fallback",
      model: null,
      suggestions: buildFallbackSuggestions({
        area,
        budget: budgetPerPerson,
        currency: normalizedCurrency,
        people: parsedPeople,
        language: normalizedLanguage,
      }),
    };
  }
}

module.exports = { buildRecommendationResponse };
