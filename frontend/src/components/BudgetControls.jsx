import LoadingSpinner from "./LoadingSpinner";
import {
  getBudgetPlaceholder,
  getCurrencyPrefix,
  SUPPORTED_CURRENCIES,
} from "../utils/currency";

function BudgetControls({
  budget,
  setBudget,
  currency,
  setCurrency,
  query,
  setQuery,
  onRecommend,
  recommendLoading,
  locationLoading,
}) {
  return (
    <div className="rounded-[1.75rem] border border-stone-200 bg-stone-50 p-4 shadow-sm sm:p-5">
      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:gap-5">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-stone-500 sm:text-sm">
            Your Budget
          </span>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-semibold text-stone-400">
                {getCurrencyPrefix(currency)}
              </span>
              <input
                type="number"
                min="1"
                placeholder={getBudgetPlaceholder(currency)}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full rounded-2xl border border-stone-200 bg-white py-3 pl-14 pr-4 text-base font-medium text-stone-900 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
              />
            </div>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
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
              Getting location...
            </>
          ) : recommendLoading ? (
            <>
              <LoadingSpinner />
              Thinking...
            </>
          ) : (
            "Recommend for me"
          )}
        </button>
      </div>

      <label className="mt-4 block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-stone-500 sm:text-sm">
          What are you craving?{" "}
          <span className="font-normal normal-case text-stone-400">(optional)</span>
        </span>
        <textarea
          rows={2}
          placeholder="e.g. I want something spicy and filling, maybe Vietnamese food..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full resize-none rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
        />
      </label>

      <p className="mt-3 text-xs font-medium text-stone-500">
        Choose the currency first, then enter your budget. GPS will be used automatically.
      </p>
    </div>
  );
}

export default BudgetControls;
