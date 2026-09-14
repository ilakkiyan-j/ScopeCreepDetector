'use client';

import React, { useState } from 'react';
import { Badge, Button } from '@/components/ui';
import { ConfirmDialog } from '@/components/ui';
import { Check, Eye, EyeOff, Info, ShieldQuestion, X } from 'lucide-react';
import { formatMoney } from '@/lib/currency';
import { cn } from '@/lib/utils';
import type { Currency, LedgerItem } from '@scope-creep-ledger/shared';

export function EvidencePanel({ item, currency }: { item: LedgerItem; currency: Currency }) {
  return (
    <div className="mt-3 rounded-lg border border-dashed border-border bg-muted/40 p-4 animate-fade-up">
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div className="sm:col-span-2">
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Original message
          </dt>
          <dd className="mt-1 rounded-md border border-border bg-card p-3 font-mono text-xs leading-relaxed text-foreground">
            {item.originalMessage}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Timestamp</dt>
          <dd className="mt-1 text-foreground">{item.timestamp}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Requested by</dt>
          <dd className="mt-1 text-foreground">{item.requester}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Why it&rsquo;s outside scope
          </dt>
          <dd className="mt-1 text-foreground">{item.reason}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Estimated effort</dt>
          <dd className="mt-1 font-semibold text-foreground">
            {item.estimatedHours} hrs · {formatMoney(item.estimatedCost, currency)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">AI confidence</dt>
          <dd className="mt-1 text-foreground">{(item.confidence * 100).toFixed(0)}%</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Verification status
          </dt>
          <dd className="mt-1">
            <StatusBadge status={item.verificationStatus} />
          </dd>
        </div>
      </dl>
    </div>
  );
}

export function StatusBadge({ status }: { status: LedgerItem['verificationStatus'] }) {
  const map = {
    verified: { label: 'Verified', variant: 'success' as const },
    review_required: { label: 'Needs Review', variant: 'warning' as const },
    rejected: { label: 'Rejected', variant: 'secondary' as const },
  };
  const cfg = map[status];
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

const receiptTone: Record<LedgerItem['verificationStatus'], { rail: string; sub: string; value: string }> = {
  verified: { rail: 'border-l-success/50', sub: 'Verified value', value: 'text-success' },
  review_required: { rail: 'border-l-warning/60', sub: 'Pending approval', value: 'text-foreground' },
  rejected: { rail: 'border-l-muted-foreground/30', sub: 'Excluded from totals', value: 'text-muted-foreground' },
};

export function LedgerItemCard({
  item,
  currency,
  serial,
  onVerify,
  onReject,
}: {
  item: LedgerItem;
  currency: Currency;
  /** Receipt sequence number, e.g. the index within the project ledger. */
  serial?: number;
  onVerify: (itemId: string) => void;
  onReject: (itemId: string) => void;
}) {
  const [showEvidence, setShowEvidence] = useState(false);
  const [confirmingReject, setConfirmingReject] = useState(false);
  const needsReview = item.verificationStatus === 'review_required';
  const tone = receiptTone[item.verificationStatus];
  const confidence = Math.round(item.confidence * 100);

  const quote =
    item.originalMessage.length > 120 ? item.originalMessage.slice(0, 120) + '…' : item.originalMessage;

  return (
    <div
      className={cn(
        'rounded-xl border border-border border-l-[3px] bg-card shadow-sm transition-shadow hover:shadow-card-hover',
        tone.rail
      )}
    >
      <div className="flex items-start gap-3 p-5 pb-3">
        {typeof serial === 'number' && (
          <span className="mt-0.5 font-mono text-[11px] font-medium leading-5 text-muted-foreground">
            #{String(serial + 1).padStart(2, '0')}
          </span>
        )}
        <p className="min-w-0 flex-1 text-sm font-semibold leading-5 text-foreground">
          &ldquo;{quote}&rdquo;
        </p>
        <div className="flex shrink-0 items-center gap-2">
          {needsReview && <ShieldQuestion className="h-4 w-4 text-warning" aria-label="Needs review" />}
          <StatusBadge status={item.verificationStatus} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-5 pb-1 pt-1 text-xs text-muted-foreground">
        <span>
          Requested by <strong className="font-semibold text-foreground">{item.requester}</strong>
        </span>
        <span>{item.timestamp}</span>
        <span className="ml-auto inline-flex items-center gap-2">
          <span className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
            <span
              className="block h-full rounded-full bg-brand-accent"
              style={{ width: `${confidence}%` }}
            />
          </span>
          <span className="tabular-nums">
            {confidence}% confidence
          </span>
        </span>
      </div>

      <p className="flex items-start gap-1.5 px-5 pt-3 text-sm text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-info" />
        {item.reason}
      </p>

      <div className="mt-4 border-t border-dashed border-border bg-muted/30 px-5 py-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-md border border-border bg-card px-2 py-1 font-mono text-xs font-semibold text-foreground">
              {item.estimatedHours} hrs
            </span>
            estimated {needsReview ? 'if approved' : 'additional effort'}
          </p>
          <div className="text-right">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{tone.sub}</p>
            <p className={cn('text-2xl font-bold tracking-tight tabular-nums', tone.value)}>
              {formatMoney(item.estimatedCost, currency)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 p-5 pt-4">
        <Button variant="ghost" size="sm" onClick={() => setShowEvidence((s) => !s)}>
          {showEvidence ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showEvidence ? 'Hide' : 'View'} evidence
        </Button>

        {needsReview && (
          <>
            <Button variant="success" size="sm" onClick={() => onVerify(item.id)}>
              <Check className="h-4 w-4" /> Verify
            </Button>
            <Button variant="outline" size="sm" onClick={() => setConfirmingReject(true)}>
              <X className="h-4 w-4" /> Reject
            </Button>
          </>
        )}
      </div>

      {showEvidence && <div className="px-5 pb-5"><EvidencePanel item={item} currency={currency} /></div>}

      <ConfirmDialog
        open={confirmingReject}
        onClose={() => setConfirmingReject(false)}
        onConfirm={() => {
          setConfirmingReject(false);
          onReject(item.id);
        }}
        title="Reject scope item?"
        description="This item will be removed from the ledger totals. You can still see it in the project history."
        confirmLabel="Reject item"
        danger
      />
    </div>
  );
}