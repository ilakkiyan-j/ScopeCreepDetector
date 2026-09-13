'use client';

import React from 'react';
import { CURRENCIES } from '@/lib/currency';
import { Input, Select, Label } from '@/components/ui';
import type { Currency } from '@scope-creep-ledger/shared';

export function RateInput({
  rate,
  onRateChange,
  currency,
  onCurrencyChange,
  rateLabel = 'Hourly Rate',
}: {
  rate: number;
  onRateChange: (value: number) => void;
  currency: Currency;
  onCurrencyChange: (value: Currency) => void;
  rateLabel?: string;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="space-y-1.5">
        <Label htmlFor="hourly-rate">{rateLabel}</Label>
        <div className="relative">
          <Input
            id="hourly-rate"
            type="number"
            min="1"
            step="0.5"
            required
            inputMode="decimal"
            placeholder="60.00"
            value={Number.isFinite(rate) && rate !== 0 ? rate : ''}
            onChange={(e) => onRateChange(Number(e.target.value))}
            className="pr-12"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {currency}
          </span>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="rate-currency">Rate Currency</Label>
        <Select
          id="rate-currency"
          value={currency}
          onChange={(e) => onCurrencyChange(e.target.value as Currency)}
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code} — {c.label}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}