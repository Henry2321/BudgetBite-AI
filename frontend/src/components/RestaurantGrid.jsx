import LoadingSpinner from "./LoadingSpinner";
import RestaurantCard from "./RestaurantCard";

function RestaurantGrid({
  restaurants,
  loading,
  hasSearched,
  recommendedRestaurants,
  currency,
  copy,
}) {
  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
            {copy.restaurantsLabel}
          </p>
          <h2 className="mt-2 text-3xl font-bold text-white">
            {copy.restaurantsTitle}
          </h2>
        </div>
        {recommendedRestaurants.length > 0 ? (
          <span className="inline-flex w-fit rounded-full border border-amber-300/25 bg-amber-300/10 px-4 py-2 text-sm font-semibold text-amber-100">
            {copy.highlightedPicks}
          </span>
        ) : null}
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-3 rounded-[1.75rem] border border-white/10 bg-white/10 p-6 text-center text-white backdrop-blur">
          <LoadingSpinner />
          <span>{copy.loadingRestaurants}</span>
        </div>
      ) : null}

      {!loading && restaurants.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {restaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant._id || restaurant.name}
              restaurant={restaurant}
              isRecommended={recommendedRestaurants.includes(restaurant.name)}
              currency={currency}
              copy={copy}
            />
          ))}
        </div>
      ) : null}

      {!loading && restaurants.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed border-white/20 bg-white/5 p-6 text-center text-stone-200">
          {hasSearched
            ? copy.noRestaurantsFound
            : copy.enterBudgetPrompt}
        </div>
      ) : null}
    </section>
  );
}

export default RestaurantGrid;
