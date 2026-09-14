import * as React from 'react';
import { cn } from '@/lib/utils';

type Tone = 'default' | 'success' | 'warning' | 'info' | 'danger';

const toneClasses: Record<Tone, { value: string; chip: string }> = {
  default: { value: 'text-foreground', chip: 'bg-muted text-muted-foreground' },
  success: { value: 'text-success', chip: 'bg-success/10 text-success' },
  warning: { value: 'text-warning', chip: 'bg-warning/10 text-warning' },
  info: { value: 'text-info', chip: 'bg-info/10 text-info' },
  danger: { value: 'text-danger', chip: 'bg-danger/10 text-danger' },
};

export function MetricCard({
  label,
  value,
  hint,
  icon,
  tone = 'default',
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: React.ReactNode;
  tone?: Tone;
}) {
  const cfg = toneClasses[tone];
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-brand-gradient opacity-70"
      />
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        {icon && (
          <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-md', cfg.chip)}>
            {icon}
          </span>
        )}
      </div>
      <p className={cn('mt-3 text-2xl font-bold tracking-tight tabular-nums', cfg.value)}>{value}</p>
      {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}