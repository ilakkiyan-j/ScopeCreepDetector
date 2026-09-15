import React from 'react';
import { cn } from '@/lib/utils';

/**
 * ALXO brand mark: renders the high-quality gradient 'A' glyph.
 */
export function ALXOGlyph({
  size = 44,
  className,
}: {
  /** Render size in px. Default is 44px for prominent brand presence. */
  size?: number;
  className?: string;
  variant?: 'gradient' | 'flat';
}) {
  return (
    <span
      aria-hidden="true"
      className={cn('inline-flex shrink-0 items-center justify-center overflow-hidden select-none', className)}
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/alxo_logo.png"
        alt="ALXO Logo"
        width={size * 2}
        height={size * 2}
        className="w-full h-full object-contain filter contrast-[1.05] brightness-[1.02] drop-shadow-md transition-transform duration-200 hover:scale-105"
      />
    </span>
  );
}