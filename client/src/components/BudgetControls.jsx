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
  onFindFood,
  onRecommend,
  restaurantLoading,
  recommendLoading,
}) {
  return (
    <div className="rounded-[1.75rem] border border-stone-200 bg-stone-50 p-4 shadow-sm sm:p-5">
      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:gap-5 lg:grid-cols-[1fr_auto_auto]">
        <label className="block md:col-span-2 lg:col-span-1">
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
              onChange={(event) => setBudget(event.target.value)}
              className="w-full rounded-2xl border border-stone-200 bg-white py-3 pl-14 pr-4 text-base font-medium text-stone-900 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
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
          onClick={onFindFood}
          disabled={restaurantLoading}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-400 px-5 py-3 text-sm font-bold text-stone-900 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-md disabled:cursor-not-allowed disabled:bg-amber-200 disabled:hover:translate-y-0"
        >
          {restaurantLoading ? (
            <>
              <LoadingSpinner tone="dark" />
              Loading
            </>
          ) : (
            "Find Food"
          )}
        </button>

        <button
          type="button"
          onClick={onRecommend}
          disabled={recommendLoading}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-stone-900 px-5 py-3 text-sm font-bold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-stone-800 hover:shadow-md disabled:cursor-not-allowed disabled:bg-stone-500 disabled:hover:translate-y-0"
        >
          {recommendLoading ? (
            <>
              <LoadingSpinner />
              Thinking
            </>
          ) : (
            "Recommend for me"
          )}
        </button>
      </div>
      <p className="mt-3 text-xs font-medium text-stone-500">
        Choose the currency first, then enter your budget in the same unit.
      </p>
    </div>
  );
}

export default BudgetControls;
