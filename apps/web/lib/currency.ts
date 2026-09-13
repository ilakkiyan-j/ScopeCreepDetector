/**
 * Currency helpers — single source of monetary formatting.
 *
 * Rule: never render a currency symbol in component code. Use formatMoney.
 * A currency code identifies the currency; it never performs FX conversion.
 */
import type { Currency } from '@scope-creep-ledger/shared';

export const CURRENCIES: {
  code: Currency;
  label: string;
}[] = [
  { code: 'INR', label: 'Indian Rupee' },
  { code: 'USD', label: 'US Dollar' },
  { code: 'EUR', label: 'Euro' },
  { code: 'GBP', label: 'British Pound' },
  { code: 'AUD', label: 'Australian Dollar' },
  { code: 'CAD', label: 'Canadian Dollar' },
  { code: 'SGD', label: 'Singapore Dollar' },
  { code: 'AED', label: 'UAE Dirham' },
  { code: 'JPY', label: 'Japanese Yen' },
];

export const DEFAULT_CURRENCY: Currency = 'INR';

const LOCALE_BY_CURRENCY: Record<Currency, string> = {
  INR: 'en-IN',
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  AUD: 'en-AU',
  CAD: 'en-CA',
  SGD: 'en-SG',
  AED: 'en-AE',
  JPY: 'ja-JP',
};

export function isCurrency(value: string): value is Currency {
  return CURRENCIES.some((c) => c.code === value);
}

/**
 * Format a numeric amount using its currency's native locale conventions.
 * Example: formatMoney(690, 'USD') -> "$690.00", formatMoney(482000, 'INR') -> "₹4,82,000.00"
 * Financial display always shows two decimals for consistency across ledgers.
 */
export function formatMoney(amount: number, currency: Currency): string {
  const locale = LOCALE_BY_CURRENCY[currency] ?? 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Compact currency formatting for metric cards / KPI tiles. */
export function formatMoneyCompact(amount: number, currency: Currency): string {
  const locale = LOCALE_BY_CURRENCY[currency] ?? 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount);
}

/** Format an hourly rate, e.g. "₹60.00/hr" */
export function formatRate(rate: number, currency: Currency): string {
  const locale = LOCALE_BY_CURRENCY[currency] ?? 'en-US';
  return (
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(rate) + '/hr'
  );
}