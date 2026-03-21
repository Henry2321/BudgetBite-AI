import LoadingSpinner from "./LoadingSpinner";
import { formatCurrency } from "../utils/currency";

function RecommendationPanel({ recommendations, loading, currency }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-300">
            AI Picks
          </p>
          <h2 className="mt-2 text-3xl font-bold text-white">
            Recommendations for your next meal
          </h2>
        </div>
      </div>

      {loading ? (
        <div className="mt-6 flex items-center gap-3 rounded-[1.5rem] bg-white/10 p-5 text-stone-100">
          <LoadingSpinner />
          <span>Building your recommendations...</span>
        </div>
      ) : null}

      {!loading && recommendations.length > 0 ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {recommendations.map((item, index) => (
            <article
              key={`${item.restaurant}-${item.meal_name}-${index}`}
              className="rounded-[1.5rem] border border-amber-200 bg-[linear-gradient(180deg,_#fff9ec_0%,_#ffffff_60%)] p-5 text-stone-900 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_70px_-40px_rgba(245,158,11,0.7)]"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-stone-900 px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-white">
                  Pick {index + 1}
                </span>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
                  {formatCurrency(item.estimated_price, currency)}
                </span>
              </div>
              <h3 className="mt-4 text-2xl font-bold">{item.meal_name}</h3>
              <p className="mt-2 text-sm font-medium text-stone-500">
                {item.restaurant} | {item.category}
              </p>
              <p className="mt-4 text-sm leading-6 text-stone-600">
                {item.explanation}
              </p>
            </article>
          ))}
        </div>
      ) : null}

      {!loading && recommendations.length === 0 ? (
        <div className="mt-6 rounded-[1.5rem] border border-dashed border-white/20 bg-white/5 p-5 text-stone-200">
          Click Recommend for me to get three quick meal ideas.
        </div>
      ) : null}
    </section>
  );
}

export default RecommendationPanel;
