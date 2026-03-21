import { useState } from "react";
import axios from "axios";

import BudgetControls from "./components/BudgetControls";
import RecommendationPanel from "./components/RecommendationPanel";
import RestaurantGrid from "./components/RestaurantGrid";
import { USD_TO_VND_RATE, formatCurrency } from "./utils/currency";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  const [budget, setBudget] = useState("");
  const [currency, setCurrency] = useState("VND");
  const [restaurants, setRestaurants] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [restaurantLoading, setRestaurantLoading] = useState(false);
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [hasSearchedRestaurants, setHasSearchedRestaurants] = useState(false);
  const [error, setError] = useState("");

  const recommendedRestaurants = recommendations.map((item) => item.restaurant);
  const hasBudgetValue = budget && !Number.isNaN(Number(budget)) && Number(budget) > 0;

  const parseBudget = () => {
    const numericBudget = Number(budget);

    if (!budget || Number.isNaN(numericBudget) || numericBudget <= 0) {
      setError("Please enter a valid budget greater than 0.");
      return null;
    }

    return numericBudget;
  };

  const handleCurrencyChange = (nextCurrency) => {
    setCurrency(nextCurrency);
    setBudget("");
    setRestaurants([]);
    setRecommendations([]);
    setHasSearchedRestaurants(false);
    setError("");
  };

  const handleFindFood = async () => {
    const numericBudget = parseBudget();

    if (!numericBudget) {
      return;
    }

    setRestaurantLoading(true);
    setHasSearchedRestaurants(true);
    setError("");

    try {
      const response = await axios.get(`${API_BASE_URL}/api/restaurants`, {
        params: {
          budget: numericBudget,
          currency,
        },
      });

      setRestaurants(response.data);

      if (response.data.length === 0) {
        setError("No restaurants matched this budget. Try a higher amount.");
      }
    } catch (fetchError) {
      setError(
        fetchError.response?.data?.message ||
          "Unable to fetch restaurants right now."
      );
    } finally {
      setRestaurantLoading(false);
    }
  };

  const handleRecommend = async () => {
    const numericBudget = parseBudget();

    if (!numericBudget) {
      return;
    }

    setRecommendLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API_BASE_URL}/api/recommend`, {
        budget: numericBudget,
        currency,
      });

      setRecommendations(response.data.suggestions || []);
    } catch (fetchError) {
      setError(
        fetchError.response?.data?.message ||
          "Unable to generate recommendations right now."
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
                  Switch between VND and USD, enter your budget, and let the app
                  find restaurants plus meal recommendations in the same
                  currency.
                </p>
              </div>

              <BudgetControls
                budget={budget}
                setBudget={setBudget}
                currency={currency}
                setCurrency={handleCurrencyChange}
                onFindFood={handleFindFood}
                onRecommend={handleRecommend}
                restaurantLoading={restaurantLoading}
                recommendLoading={recommendLoading}
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

                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4 transition hover:bg-white/15">
                    <p className="text-sm text-stone-300">Currency</p>
                    <p className="mt-2 text-2xl font-bold">{currency}</p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4 transition hover:bg-white/15">
                    <p className="text-sm text-stone-300">Budget Entered</p>
                    <p className="mt-2 text-2xl font-bold">
                      {hasBudgetValue ? formatCurrency(Number(budget), currency) : "--"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4 transition hover:bg-white/15">
                    <p className="text-sm text-stone-300">Restaurants Found</p>
                    <p className="mt-2 text-2xl font-bold">
                      {restaurants.length}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-stone-200">
                    Tip: click <span className="font-semibold">Find Food</span>{" "}
                    to load matching restaurants, then{" "}
                    <span className="font-semibold">Recommend for me</span> for
                    three quick meal ideas.
                  </p>

                  <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-stone-200">
                    Demo exchange rate: <span className="font-semibold">1 USD = {USD_TO_VND_RATE.toLocaleString("en-US")} VND</span>
                  </p>

                  {recommendedRestaurants.length > 0 ? (
                    <p className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
                      Recommended restaurant cards are highlighted below for a
                      faster live demo walkthrough.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>

        <RecommendationPanel
          recommendations={recommendations}
          loading={recommendLoading}
          currency={currency}
        />

        <RestaurantGrid
          restaurants={restaurants}
          loading={restaurantLoading}
          hasSearched={hasSearchedRestaurants}
          recommendedRestaurants={recommendedRestaurants}
          currency={currency}
        />
      </div>
    </div>
  );
}

export default App;
