import React from 'react';
import { cn } from '@/lib/utils';
import { ALXOGlyph } from './ALXOGlyph';

/**
 * Official ALXO brand lockup matching reference design:
 * High-resolution A glyph + lowercase 'alxo™' in Outfit geometric sans-serif.
 * Slogan removed per design spec.
 */
export function ALXOLogo({
  size = 38,
  className,
  showWordmark = true,
}: {
  size?: number;
  className?: string;
  showWordmark?: boolean;
  /** Retained for backwards compatibility */
  showSlogan?: boolean;
}) {
  return (
    <span className={cn('inline-flex items-center gap-2 select-none', className)}>
      <ALXOGlyph size={size} />
      {showWordmark && (
        <span className="inline-flex items-baseline text-foreground font-['Outfit',var(--font-inter),sans-serif]">
          <span className="text-2xl font-bold tracking-[-0.04em] lowercase leading-none text-foreground">
            alxo
          </span>
          <sup className="text-[10px] font-semibold text-foreground/75 tracking-normal ml-0.5 relative -top-2 select-none">
            ™
          </sup>
        </span>
      )}
    </span>
  );
}