import LoadingSpinner from "./LoadingSpinner";
import { getCurrencyPrefix, SUPPORTED_CURRENCIES } from "../utils/currency";

function BudgetControls({
  budget,
  setBudget,
  currency,
  setCurrency,
  query,
  setQuery,
  mealTime,
  setMealTime,
  people,
  setPeople,
  onRecommend,
  recommendLoading,
  locationLoading,
  language,
  copy,
}) {
  const perPersonBudget =
    people > 1 && Number(budget) > 0
      ? copy.perPersonSummary(
          people,
          getCurrencyPrefix(currency),
          Math.floor(Number(budget || 0) / Number(people || 1)).toLocaleString(
            language === "vi" ? "vi-VN" : "en-US"
          )
        )
      : "";

  const mealTimeOptions = [
    { value: "", label: copy.mealOptions.all },
    { value: "breakfast", label: copy.mealOptions.breakfast },
    { value: "lunch", label: copy.mealOptions.lunch },
    { value: "dinner", label: copy.mealOptions.dinner },
    { value: "dessert", label: copy.mealOptions.dessert },
    { value: "drinks", label: copy.mealOptions.drinks },
  ];

  return (
    <div className="rounded-[1.75rem] border border-stone-200 bg-stone-50 p-4 shadow-sm sm:p-5">
      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:gap-5">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-stone-500 sm:text-sm">
            {copy.totalBudget}
            {perPersonBudget ? ` ${perPersonBudget}` : ""}
          </span>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_80px_auto]">
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-semibold text-stone-400">
                {getCurrencyPrefix(currency)}
              </span>
              <input
                type="number"
                min="1"
                placeholder={copy.budgetPlaceholder[currency]}
                value={budget}
                onChange={(event) => setBudget(event.target.value)}
                className="w-full rounded-2xl border border-stone-200 bg-white py-3 pl-14 pr-4 text-base font-medium text-stone-900 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                spellCheck="false"
              />
            </div>

            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-semibold text-stone-400">
                {copy.peopleIcon}
              </span>
              <input
                type="number"
                min="1"
                max="99"
                placeholder="1"
                value={people}
                onChange={(event) => setPeople(event.target.value)}
                className="w-full rounded-2xl border border-stone-200 bg-white py-3 pl-10 pr-2 text-base font-medium text-stone-900 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
              />
            </div>

            <select
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
              className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-900 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
            >
              {SUPPORTED_CURRENCIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </label>

        <button
          type="button"
          onClick={onRecommend}
          disabled={recommendLoading}
          className="self-end inline-flex items-center justify-center gap-2 rounded-2xl bg-stone-900 px-5 py-3 text-sm font-bold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-stone-800 hover:shadow-md disabled:cursor-not-allowed disabled:bg-stone-500 disabled:hover:translate-y-0"
        >
          {locationLoading ? (
            <>
              <LoadingSpinner />
              {copy.gettingLocation}
            </>
          ) : recommendLoading ? (
            <>
              <LoadingSpinner />
              {copy.thinking}
            </>
          ) : (
            copy.recommendButton
          )}
        </button>
      </div>

      <label className="mt-4 block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-stone-500 sm:text-sm">
          {copy.mealTimeLabel}
        </span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
          {mealTimeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setMealTime(option.value)}
              className={`rounded-2xl border px-3 py-2 text-sm font-semibold transition ${
                mealTime === option.value
                  ? "border-amber-400 bg-amber-400 text-stone-900"
                  : "border-stone-200 bg-white text-stone-600 hover:border-amber-300 hover:bg-amber-50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </label>

      <label className="mt-4 block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-stone-500 sm:text-sm">
          {copy.cravingLabel}{" "}
          <span className="font-normal normal-case text-stone-400">
            ({copy.optional})
          </span>
        </span>
        <textarea
          rows={2}
          placeholder={copy.cravingPlaceholder}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          spellCheck="false"
          className="w-full resize-none rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
        />
      </label>

      <p className="mt-3 text-xs font-medium text-stone-500">{copy.helper}</p>
    </div>
  );
}

export default BudgetControls;
