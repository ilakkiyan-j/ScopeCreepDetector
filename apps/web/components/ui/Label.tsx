'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export function Label({
  className,
  children,
  htmlFor,
}: {
  className?: string;
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        'text-sm font-medium text-card-foreground/90',
        className
      )}
    >
      {children}
    </label>
  );
}