'use client';

import React from 'react';
import { Dialog } from './Dialog';
import { Button } from './Button';

export function ConfirmDialog({
  open,
  onConfirm,
  onClose,
  title,
  description,
  confirmLabel = 'Confirm',
  danger,
  loading,
}: {
  open: boolean;
  onConfirm: () => void;
  onClose: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
}) {
  const id = React.useId();
  return (
    <Dialog open={open} onClose={onClose} labelledBy={id} width="max-w-sm">
      <div className="p-6">
        <h2 id={id} className="text-base font-semibold">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            size="sm"
            onClick={() => {
              onConfirm();
            }}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}