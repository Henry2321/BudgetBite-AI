import { useEffect, useState } from "react";
import axios from "axios";

import BudgetControls from "./components/BudgetControls";
import LanguageToggle from "./components/LanguageToggle";
import RecommendationPanel from "./components/RecommendationPanel";
import { USD_TO_VND_RATE, formatCurrency } from "./utils/currency";
import { translations } from "./utils/translations";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function getInitialLanguage() {
  if (typeof window === "undefined") {
    return "en";
  }

  const savedLanguage = window.localStorage.getItem("budgetbite-language");

  if (savedLanguage === "vi" || savedLanguage === "en") {
    return savedLanguage;
  }

  return window.navigator.language.toLowerCase().startsWith("vi") ? "vi" : "en";
}

function App() {
  const [language, setLanguage] = useState(getInitialLanguage);
  const [budget, setBudget] = useState("");
  const [currency, setCurrency] = useState("VND");
  const [query, setQuery] = useState("");
  const [mealTime, setMealTime] = useState("");
  const [people, setPeople] = useState(1);
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationSource, setRecommendationSource] = useState(null);
  const [recommendationModel, setRecommendationModel] = useState(null);
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [error, setError] = useState("");

  const copy = translations[language];
  const hasBudgetValue =
    budget && !Number.isNaN(Number(budget)) && Number(budget) > 0;

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("budgetbite-language", language);
    }

    document.documentElement.lang = language;
  }, [language]);

  const handleCurrencyChange = (nextCurrency) => {
    setCurrency(nextCurrency);
    setBudget("");
    setQuery("");
    setMealTime("");
    setPeople(1);
    setRecommendations([]);
    setRecommendationSource(null);
    setRecommendationModel(null);
    setUserLocation(null);
    setError("");
  };

  const handleLanguageToggle = () => {
    setLanguage((currentLanguage) => (currentLanguage === "en" ? "vi" : "en"));
    setRecommendations([]);
    setRecommendationSource(null);
    setRecommendationModel(null);
    setError("");
  };

  const getLocation = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error(copy.gpsUnsupported));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) =>
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }),
        () => reject(new Error(copy.gpsDenied))
      );
    });

  const handleRecommend = async () => {
    const numericBudget = Number(budget);

    if (!budget || Number.isNaN(numericBudget) || numericBudget <= 0) {
      setError(copy.invalidBudget);
      return;
    }

    setError("");
    setLocationLoading(true);

    let location;

    try {
      location = await getLocation();
      setUserLocation(location);
    } catch (gpsError) {
      setError(gpsError.message);
      setLocationLoading(false);
      return;
    }

    setLocationLoading(false);
    setRecommendLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/recommend`, {
        budget: numericBudget,
        currency,
        language,
        query,
        mealTime,
        people: Number(people) || 1,
        lat: location.lat,
        lng: location.lng,
      });

      setRecommendations(response.data.suggestions || []);
      setRecommendationSource(response.data.source || null);
      setRecommendationModel(response.data.model || null);
    } catch (fetchError) {
      setError(
        fetchError.response?.data?.message || copy.recommendationError
      );
    } finally {
      setRecommendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.22),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.18),_transparent_22%),linear-gradient(180deg,_#1c1917_0%,_#292524_52%,_#0c0a09_100%)] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 sm:gap-8">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/90 shadow-soft backdrop-blur">
          <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10 lg:p-10">
            <div className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="inline-flex w-fit rounded-full bg-amber-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-900 sm:text-sm">
                  {copy.badge}
                </span>
                <LanguageToggle
                  language={language}
                  onToggle={handleLanguageToggle}
                  label={copy.switchLanguageLabel}
                />
              </div>

              <div className="space-y-4">
                <h1 className="max-w-2xl text-3xl font-extrabold tracking-tight text-stone-900 sm:text-5xl">
                  {copy.heroTitle}
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-stone-600 sm:text-lg">
                  {copy.heroDescription}
                </p>
              </div>

              <BudgetControls
                budget={budget}
                setBudget={setBudget}
                currency={currency}
                setCurrency={handleCurrencyChange}
                query={query}
                setQuery={setQuery}
                mealTime={mealTime}
                setMealTime={setMealTime}
                people={people}
                setPeople={setPeople}
                onRecommend={handleRecommend}
                recommendLoading={recommendLoading || locationLoading}
                locationLoading={locationLoading}
                language={language}
                copy={copy}
              />

              {error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 shadow-sm">
                  {error}
                </div>
              ) : null}
            </div>

            <div className="rounded-[1.75rem] bg-stone-900 p-5 text-white shadow-soft sm:p-6">
              <div className="space-y-5">
                <p className="text-sm uppercase tracking-[0.3em] text-amber-300">
                  {copy.quickSnapshot}
                </p>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4 transition hover:bg-white/15">
                    <p className="text-sm text-stone-300">{copy.currencyLabel}</p>
                    <p className="mt-2 text-2xl font-bold">{currency}</p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4 transition hover:bg-white/15">
                    <p className="text-sm text-stone-300">{copy.budgetEntered}</p>
                    <p className="mt-2 text-2xl font-bold">
                      {hasBudgetValue
                        ? formatCurrency(Number(budget), currency)
                        : "--"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4 transition hover:bg-white/15">
                    <p className="text-sm text-stone-300">{copy.suggestionsFound}</p>
                    <p className="mt-2 text-2xl font-bold">
                      {recommendations.length}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4 transition hover:bg-white/15">
                    <p className="text-sm text-stone-300">{copy.aiSource}</p>
                    <p className="mt-2 text-lg font-bold">
                      {recommendationSource === "openai"
                        ? recommendationModel || "OpenAI"
                        : recommendationSource === "fallback"
                          ? copy.demoFallback
                          : "--"}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-stone-200">
                    {copy.tip}
                  </p>

                  <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-stone-200">
                    {copy.exchangeRate(
                      USD_TO_VND_RATE.toLocaleString("en-US")
                    )}
                  </p>

                  {recommendationSource === "fallback" ? (
                    <p className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
                      {copy.fallbackNotice}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>

        <RecommendationPanel
          recommendations={recommendations}
          loading={recommendLoading || locationLoading}
          locationLoading={locationLoading}
          currency={currency}
          source={recommendationSource}
          model={recommendationModel}
          userLat={userLocation?.lat}
          userLng={userLocation?.lng}
          language={language}
          copy={copy}
        />
      </div>
    </div>
  );
}

export default App;
