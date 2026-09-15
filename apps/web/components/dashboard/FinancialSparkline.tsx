'use client';

import React, { useRef, useEffect } from 'react';
import { Currency } from '@scope-creep-ledger/shared';
import { formatMoney } from '@/lib/currency';
import { convertToPreferred } from '@/lib/currency-convert';

interface DataPoint {
  label: string;
  originalValue: number;   // baseline scope value
  creepValue: number;      // detected additional work
  currency: Currency;
}

interface FinancialSparklineProps {
  /** Per-project breakdown of financials */
  dataPoints: DataPoint[];
  /** User's preferred currency for consolidated display */
  preferredCurrency: Currency;
  className?: string;
}

function buildSparklinePath(values: number[], width: number, height: number, padding = 16): string {
  if (values.length < 2) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const xs = values.map((_, i) => padding + (i / (values.length - 1)) * (width - padding * 2));
  const ys = values.map((v) => height - padding - ((v - min) / range) * (height - padding * 2));

  // Smooth bezier curve
  let path = `M ${xs[0]},${ys[0]}`;
  for (let i = 1; i < xs.length; i++) {
    const cpx = (xs[i - 1] + xs[i]) / 2;
    path += ` C ${cpx},${ys[i - 1]} ${cpx},${ys[i]} ${xs[i]},${ys[i]}`;
  }
  return path;
}

export function FinancialSparkline({ dataPoints, preferredCurrency, className = '' }: FinancialSparklineProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const gradientId = React.useId();

  // Consolidate all values into preferred currency
  const consolidated = dataPoints.map((dp) => ({
    label: dp.label,
    original: convertToPreferred(dp.originalValue, dp.currency, preferredCurrency),
    total: convertToPreferred(dp.originalValue + dp.creepValue, dp.currency, preferredCurrency),
    creep: convertToPreferred(dp.creepValue, dp.currency, preferredCurrency),
  }));

  const totalOriginal = consolidated.reduce((s, d) => s + d.original, 0);
  const totalCreep = consolidated.reduce((s, d) => s + d.creep, 0);
  const totalPotential = totalOriginal + totalCreep;

  // Build sparkline from cumulative totals
  const sparkValues = consolidated.map((d) => d.total);

  // Animate the SVG path on mount
  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;
    // Trigger animation on next frame
    requestAnimationFrame(() => {
      path.style.transition = 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
      path.style.strokeDashoffset = '0';
    });
  }, [dataPoints]);

  const W = 320;
  const H = 100;
  const pathD = buildSparklinePath(sparkValues, W, H);

  // Peak value position for the tooltip tag
  const peakIdx = sparkValues.indexOf(Math.max(...sparkValues));
  const peakX = 16 + (peakIdx / Math.max(sparkValues.length - 1, 1)) * (W - 32);
  const peakPct = sparkValues.length >= 2
    ? (H - 16 - ((sparkValues[peakIdx] - Math.min(...sparkValues)) / (Math.max(...sparkValues) - Math.min(...sparkValues) || 1)) * (H - 32))
    : H / 2;

  if (dataPoints.length === 0) {
    return (
      <div className={`flex items-center justify-center h-24 text-xs text-muted-foreground ${className}`}>
        No financial data yet
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* SVG Sparkline Chart */}
      <div className="relative w-full overflow-hidden rounded-lg bg-muted/30 border border-border/40">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-24"
          aria-label="Financial impact trend chart"
          role="img"
        >
          <defs>
            <linearGradient id={`${gradientId}-fill`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(var(--success))" stopOpacity="0.25" />
              <stop offset="100%" stopColor="rgb(var(--success))" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Gradient fill under the curve */}
          {pathD && (
            <path
              d={`${pathD} L ${W - 16},${H - 16} L 16,${H - 16} Z`}
              fill={`url(#${gradientId}-fill)`}
            />
          )}

          {/* Main sparkline path — animated */}
          {pathD && (
            <path
              ref={pathRef}
              d={pathD}
              fill="none"
              stroke="rgb(var(--success))"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ willChange: 'stroke-dashoffset' }}
            />
          )}

          {/* Peak value tag */}
          {sparkValues.length > 1 && (
            <g transform={`translate(${Math.min(peakX, W - 80)}, ${Math.max(peakPct - 20, 4)})`}>
              <rect x="0" y="0" width="72" height="18" rx="4" fill="rgb(var(--success))" opacity="0.9" />
              <text x="6" y="12" fontSize="9" fill="rgb(var(--success-foreground))" fontWeight="600" fontFamily="var(--font-inter)">
                +{formatMoney(totalCreep, preferredCurrency)}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-0.5">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Original Value</p>
          <p className="text-sm font-bold text-foreground tabular-nums">
            {formatMoney(totalOriginal, preferredCurrency)}
          </p>
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] font-medium text-success uppercase tracking-wide">Detected Creep</p>
          <p className="text-sm font-bold text-success tabular-nums">
            +{formatMoney(totalCreep, preferredCurrency)}
          </p>
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Total Potential</p>
          <p className="text-sm font-bold text-foreground tabular-nums">
            {formatMoney(totalPotential, preferredCurrency)}
          </p>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground/70 text-right">
        Indicative rates · Converted to {preferredCurrency}
      </p>
    </div>
  );
}
