'use client';

import React from 'react';
import { MessagesSquare } from 'lucide-react';
import { useProjectWorkspace } from '@/components/project/ProjectWorkspace';
import { LedgerItemCard } from '@/components/ledger/LedgerItemCard';
import { EmptyState } from '@/components/ui';
import { PageHeader } from '@/components/PageHeader';

export default function ConversationsPage() {
  const { project, ledgerItems, verifyItem, rejectItem } = useProjectWorkspace();
  if (!project) return null;

  const items = [...(ledgerItems ?? [])].sort((a, b) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Conversations"
        description="Every flagged message with the evidence to prove it."
      />
      <p className="text-sm text-muted-foreground">
        Every message below was flagged as a <strong className="text-foreground">new ask</strong>{' '}
        against your baseline scope. Expand the evidence panel on any item to see the exact words
        from the original conversation.
      </p>
      {items.length === 0 ? (
        <EmptyState
          icon={<MessagesSquare className="h-6 w-6" />}
          title="No scope-creep messages found"
          description="Messages matching your baseline scope are not shown here. Only out-of-scope requests get flagged."
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <LedgerItemCard
              key={item.id}
              item={item}
              currency={project.currency}
              onVerify={verifyItem}
              onReject={rejectItem}
            />
          ))}
        </div>
      )}
    </div>
  );
}