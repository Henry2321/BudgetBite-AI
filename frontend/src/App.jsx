import { useState } from "react";
import axios from "axios";

import BudgetControls from "./components/BudgetControls";
import RecommendationPanel from "./components/RecommendationPanel";
import { USD_TO_VND_RATE, formatCurrency } from "./utils/currency";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  const [budget, setBudget] = useState("");
  const [currency, setCurrency] = useState("VND");
  const [query, setQuery] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationSource, setRecommendationSource] = useState(null);
  const [recommendationModel, setRecommendationModel] = useState(null);
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState("");

  const hasBudgetValue =
    budget && !Number.isNaN(Number(budget)) && Number(budget) > 0;

  const handleCurrencyChange = (nextCurrency) => {
    setCurrency(nextCurrency);
    setBudget("");
    setQuery("");
    setRecommendations([]);
    setRecommendationSource(null);
    setRecommendationModel(null);
    setError("");
  };

  const getLocation = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Trình duyệt không hỗ trợ GPS."));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () =>
          reject(
            new Error("Không lấy được vị trí. Vui lòng cho phép truy cập GPS."),
          ),
      );
    });

  const handleRecommend = async () => {
    const numericBudget = Number(budget);

    if (!budget || Number.isNaN(numericBudget) || numericBudget <= 0) {
      setError("Please enter a valid budget greater than 0.");
      return;
    }

    setError("");
    setLocationLoading(true);

    let location;
    try {
      location = await getLocation();
    } catch (gpsError) {
      setError(gpsError.message);
      setLocationLoading(false);
      return;
    }

    setLocationLoading(false);
    setRecommendLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/restaurants`, {
        budget: numericBudget,
        currency,
        query,
        lat: location.lat,
        lng: location.lng,
      });

      setRecommendations(response.data.suggestions || []);
      setRecommendationSource(response.data.source || null);
      setRecommendationModel(response.data.model || null);
    } catch (fetchError) {
      setError(
        fetchError.response?.data?.message ||
          "Unable to generate recommendations right now.",
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
              <span className="inline-flex w-fit rounded-full bg-amber-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-900 sm:text-sm">
                Budget-friendly food finder
              </span>

              <div className="space-y-4">
                <h1 className="max-w-2xl text-3xl font-extrabold tracking-tight text-stone-900 sm:text-5xl">
                  BudgetBite AI helps you eat well without overspending.
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-stone-600 sm:text-lg">
                  Enter your budget, describe what you're craving, and let AI
                  find real nearby restaurants that fit.
                </p>
              </div>

              <BudgetControls
                budget={budget}
                setBudget={setBudget}
                currency={currency}
                setCurrency={handleCurrencyChange}
                query={query}
                setQuery={setQuery}
                onRecommend={handleRecommend}
                recommendLoading={recommendLoading || locationLoading}
                locationLoading={locationLoading}
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
                  Quick Snapshot
                </p>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4 transition hover:bg-white/15">
                    <p className="text-sm text-stone-300">Currency</p>
                    <p className="mt-2 text-2xl font-bold">{currency}</p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4 transition hover:bg-white/15">
                    <p className="text-sm text-stone-300">Budget Entered</p>
                    <p className="mt-2 text-2xl font-bold">
                      {hasBudgetValue
                        ? formatCurrency(Number(budget), currency)
                        : "--"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4 transition hover:bg-white/15">
                    <p className="text-sm text-stone-300">Suggestions Found</p>
                    <p className="mt-2 text-2xl font-bold">
                      {recommendations.length}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4 transition hover:bg-white/15">
                    <p className="text-sm text-stone-300">AI Source</p>
                    <p className="mt-2 text-lg font-bold">
                      {recommendationSource === "openai"
                        ? recommendationModel || "OpenAI"
                        : recommendationSource === "fallback"
                          ? "Demo fallback"
                          : "--"}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-stone-200">
                    Tip: enter your budget, describe what you want, then click{" "}
                    <span className="font-semibold">Recommend for me</span>. GPS
                    will be used to find real nearby restaurants.
                  </p>

                  <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-stone-200">
                    Demo exchange rate:{" "}
                    <span className="font-semibold">
                      1 USD = {USD_TO_VND_RATE.toLocaleString("en-US")} VND
                    </span>
                  </p>

                  {recommendationSource === "fallback" ? (
                    <p className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
                      OPENAI_API_KEY is missing or the API request failed,
                      showing fallback recommendations.
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
        />
      </div>
    </div>
  );
}

export default App;
