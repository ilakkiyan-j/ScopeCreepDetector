'use client';

import React from 'react';
import { Moon, Sun, Palette } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { CurrencySelector } from '@/components/CurrencySelector';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge } from '@/components/ui';
import type { Currency } from '@scope-creep-ledger/shared';

export default function PreferencesPage() {
  const { user, isDarkMode, toggleTheme, updateCurrency } = useAuth();
  if (!user) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" /> Theme
          </CardTitle>
          <CardDescription>Pick a palette that matches your setup.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {(['light', 'dark'] as const).map((mode) => {
              const active = (isDarkMode && mode === 'dark') || (!isDarkMode && mode === 'light');
              return (
                <button
                  key={mode}
                  onClick={() => {
                    if ((isDarkMode && mode === 'light') || (!isDarkMode && mode === 'dark')) toggleTheme();
                  }}
                  className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${
                    active
                      ? 'border-primary bg-primary/5 text-foreground'
                      : 'border-border bg-card text-muted-foreground hover:border-ring/60'
                  }`}
                >
                  {mode === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  {active && <Badge variant="success">Active</Badge>}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferred Currency</CardTitle>
          <CardDescription>
            Your dashboard Financial Sparkline consolidates all project values into this currency using
            indicative FX rates. New projects also default to this currency.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CurrencySelector
            value={(user.defaultCurrency ?? 'INR') as Currency}
            onChange={(v) => updateCurrency(v)}
            label="Preferred currency"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Original project currencies are always preserved. Dashboard totals and Financial Sparkline use
            indicative FX rates for a consolidated overview — not for billing or invoicing.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}