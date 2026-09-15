/**
 * currency-convert.ts
 *
 * Static indicative FX rates for displaying consolidated financial totals
 * in the user's preferred currency. USD is the base (1.0).
 *
 * IMPORTANT: These are indicative/static rates for display purposes only.
 * They are NOT used in any billing, invoicing, or persistence logic.
 * All actual project costs are stored and calculated in their original currency.
 */

import { Currency } from '@scope-creep-ledger/shared';

/** Indicative FX rates relative to USD (USD = 1). Updated manually. */
const FX_RATES_TO_USD: Record<Currency, number> = {
  USD: 1.0,
  INR: 84.0,
  EUR: 0.92,
  GBP: 0.79,
  AUD: 1.53,
  CAD: 1.36,
  SGD: 1.34,
  AED: 3.67,
  JPY: 149.0,
};

/**
 * Convert an amount from one currency to another using static indicative rates.
 * Returns the converted amount rounded to 2 decimal places.
 */
export function convertToPreferred(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): number {
  if (fromCurrency === toCurrency) return amount;
  const fromRate = FX_RATES_TO_USD[fromCurrency] ?? 1;
  const toRate = FX_RATES_TO_USD[toCurrency] ?? 1;
  // Convert to USD first, then to target currency
  const inUsd = amount / fromRate;
  return Math.round(inUsd * toRate * 100) / 100;
}

/**
 * Convert a map of { currency → amount } entries into a single consolidated
 * total in the user's preferred currency.
 */
export function consolidateCurrencies(
  costByCurrency: Partial<Record<Currency, number>>,
  preferredCurrency: Currency
): number {
  let total = 0;
  for (const [currency, amount] of Object.entries(costByCurrency)) {
    if (typeof amount === 'number' && amount > 0) {
      total += convertToPreferred(amount, currency as Currency, preferredCurrency);
    }
  }
  return Math.round(total * 100) / 100;
}
