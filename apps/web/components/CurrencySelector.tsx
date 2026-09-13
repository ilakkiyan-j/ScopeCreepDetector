'use client';

import React from 'react';
import { CURRENCIES } from '@/lib/currency';
import { Select, Label } from '@/components/ui';
import type { Currency } from '@scope-creep-ledger/shared';

export function CurrencySelector({
  value,
  onChange,
  label = 'Currency',
  name,
}: {
  value: Currency;
  onChange: (value: Currency) => void;
  label?: string;
  name?: string;
}) {
  const inputId = name ?? 'currency';
  return (
    <div className="space-y-1.5">
      <Label htmlFor={inputId}>{label}</Label>
      <Select
        id={inputId}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value as Currency)}
      >
        {CURRENCIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.code} — {c.label}
          </option>
        ))}
      </Select>
    </div>
  );
}