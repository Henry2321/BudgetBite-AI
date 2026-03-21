import { formatCurrency } from "../utils/currency";

function RestaurantCard({ restaurant, isRecommended, currency }) {
  return (
    <article
      className={`group overflow-hidden rounded-[1.75rem] border bg-white shadow-soft transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_70px_-36px_rgba(0,0,0,0.55)] ${
        isRecommended
          ? "border-amber-300 ring-2 ring-amber-200/70"
          : "border-white/10"
      }`}
    >
      <div className="relative">
        <img
          src={restaurant.image_url}
          alt={restaurant.name}
          className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
          {isRecommended ? (
            <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-stone-900 shadow-md">
              Recommended
            </span>
          ) : (
            <span className="rounded-full bg-black/55 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              {restaurant.category}
            </span>
          )}
          <span className="rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-emerald-700 shadow-sm">
            {restaurant.rating}/5
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-stone-950/60 to-transparent" />
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-stone-900">
            {restaurant.name}
          </h3>
          <p className="text-sm text-stone-500">{restaurant.location}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-800">
            {restaurant.category}
          </span>
          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">
            {formatCurrency(restaurant.price_min, currency)} -{" "}
            {formatCurrency(restaurant.price_max, currency)}
          </span>
          {isRecommended ? (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              Top match
            </span>
          ) : null}
        </div>

        <div className="flex items-center justify-between border-t border-stone-100 pt-4 text-sm">
          <p className="font-medium text-stone-500">Great for quick demo picks</p>
          <p className="font-semibold text-stone-900">
            From {formatCurrency(restaurant.price_min, currency)}
          </p>
        </div>
      </div>
    </article>
  );
}

export default RestaurantCard;
