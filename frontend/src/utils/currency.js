export const USD_TO_VND_RATE = 25000;
export const SUPPORTED_CURRENCIES = ["VND", "USD"];

export function normalizeCurrency(value) {
  if (value === "USD" || value === "VND") {
    return value;
  }

  return "VND";
}

export function formatCurrency(amount, currency) {
  const normalizedCurrency = normalizeCurrency(currency);
  const locale = normalizedCurrency === "VND" ? "vi-VN" : "en-US";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: normalizedCurrency,
    maximumFractionDigits: normalizedCurrency === "VND" ? 0 : 2,
  }).format(Number(amount || 0));
}

export function getCurrencyPrefix(currency) {
  return normalizeCurrency(currency) === "VND" ? "VND" : "$";
}
