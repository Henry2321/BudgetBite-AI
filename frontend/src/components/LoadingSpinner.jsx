function LoadingSpinner({ tone = "light" }) {
  const borderTone =
    tone === "dark"
      ? "border-stone-900/30 border-t-stone-900"
      : "border-white/30 border-t-white";

  return (
    <span
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 ${borderTone}`}
      aria-hidden="true"
    />
  );
}

export default LoadingSpinner;
