/**
 * Currency helpers shared by backend services.
 * Never render a currency symbol in service output — use formatMoney.
 * A currency code identifies the currency; it never performs FX conversion.
 */
import { Currency } from './index';

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

/** Format a numeric amount using its currency's native locale conventions. */
export function formatMoney(amount: number, currency: Currency): string {
  const locale = LOCALE_BY_CURRENCY[currency] ?? 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
