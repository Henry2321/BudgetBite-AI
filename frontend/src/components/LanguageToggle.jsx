function LanguageToggle({ language, onToggle, label }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex items-center justify-center rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-bold text-stone-900 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-50 hover:shadow-md"
      aria-label={language === "en" ? "Switch to Vietnamese" : "Switch to English"}
    >
      {label}
    </button>
  );
}

export default LanguageToggle;
