import React from 'react';
import { cn } from '@/lib/utils';

/**
 * ALXO brand mark: renders the official ALXO gradient logo mark.
 */
export function ALXOGlyph({
  size = 32,
  className,
}: {
  /** Render size in px (square tile). */
  size?: number;
  className?: string;
  /** `gradient` | `flat` for backward compatibility */
  variant?: 'gradient' | 'flat';
}) {
  return (
    <span
      aria-hidden="true"
      className={cn('inline-flex shrink-0 items-center justify-center overflow-hidden', className)}
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/alxo_logo.png"
        alt="ALXO Logo"
        width={size}
        height={size}
        className="w-full h-full object-contain filter drop-shadow-sm"
      />
    </span>
  );
}