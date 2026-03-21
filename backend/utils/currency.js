require("dotenv").config();
const USD_TO_VND_RATE = 25000;
const DEFAULT_CURRENCY = "USD";
const SUPPORTED_CURRENCIES = ["USD", "VND"];

function normalizeCurrency(value) {
  const currency = String(value || DEFAULT_CURRENCY).toUpperCase();

  if (!SUPPORTED_CURRENCIES.includes(currency)) {
    return DEFAULT_CURRENCY;
  }

  return currency;
}

function roundUsd(amount) {
  return Math.round(amount * 100) / 100;
}

function convertToUsd(amount, currency) {
  const normalizedCurrency = normalizeCurrency(currency);

  if (normalizedCurrency === "VND") {
    return roundUsd(amount / USD_TO_VND_RATE);
  }

  return roundUsd(amount);
}

function convertFromUsd(amount, currency) {
  const normalizedCurrency = normalizeCurrency(currency);

  if (normalizedCurrency === "VND") {
    return Math.round(amount * USD_TO_VND_RATE);
  }

  return roundUsd(amount);
}

function formatCurrencyAmount(amount, currency) {
  const normalizedCurrency = normalizeCurrency(currency);
  const locale = normalizedCurrency === "VND" ? "vi-VN" : "en-US";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: normalizedCurrency,
    maximumFractionDigits: normalizedCurrency === "VND" ? 0 : 2,
  }).format(amount);
}

module.exports = {
  DEFAULT_CURRENCY,
  SUPPORTED_CURRENCIES,
  USD_TO_VND_RATE,
  convertFromUsd,
  convertToUsd,
  formatCurrencyAmount,
  normalizeCurrency,
};
