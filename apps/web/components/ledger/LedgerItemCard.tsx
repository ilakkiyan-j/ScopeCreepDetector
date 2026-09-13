'use client';

import React, { useState } from 'react';
import { Badge, Button } from '@/components/ui';
import { ConfirmDialog } from '@/components/ui';
import { Check, Eye, EyeOff, ShieldQuestion, X } from 'lucide-react';
import { formatMoney } from '@/lib/currency';
import type { Currency, LedgerItem } from '@scope-creep-ledger/shared';

export function EvidencePanel({ item, currency }: { item: LedgerItem; currency: Currency }) {
  return (
    <div className="mt-3 rounded-lg border border-border bg-muted/40 p-4 animate-fade-up">
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

export function LedgerItemCard({
  item,
  currency,
  onVerify,
  onReject,
}: {
  item: LedgerItem;
  currency: Currency;
  onVerify: (itemId: string) => void;
  onReject: (itemId: string) => void;
}) {
  const [showEvidence, setShowEvidence] = useState(false);
  const [confirmingReject, setConfirmingReject] = useState(false);
  const needsReview = item.verificationStatus === 'review_required';

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-semibold text-foreground">
          &ldquo;{item.originalMessage.length > 90 ? item.originalMessage.slice(0, 90) + '…' : item.originalMessage}&rdquo;
        </p>
        <div className="ml-auto flex items-center gap-2">
          {needsReview && <ShieldQuestion className="h-4 w-4 text-warning" aria-label="Needs review" />}
          <StatusBadge status={item.verificationStatus} />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>Requested by <strong className="text-foreground">{item.requester}</strong></span>
        <span>{item.timestamp}</span>
        <span>
          {item.estimatedHours} hrs · <strong className="text-success">{formatMoney(item.estimatedCost, currency)}</strong>
        </span>
        <span>Confidence {(item.confidence * 100).toFixed(0)}%</span>
      </div>

      <p className="mt-3 text-sm text-muted-foreground">{item.reason}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
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

      {showEvidence && <EvidencePanel item={item} currency={currency} />}

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