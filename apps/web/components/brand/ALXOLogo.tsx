import React from 'react';
import { cn } from '@/lib/utils';
import { ALXOGlyph } from './ALXOGlyph';

/**
 * Official ALXO brand lockup:
 * Prominent A glyph + text-3xl lowercase 'alxo™' in Outfit geometric sans-serif.
 */
export function ALXOLogo({
  size = 44,
  className,
  showWordmark = true,
}: {
  size?: number;
  className?: string;
  showWordmark?: boolean;
  showSlogan?: boolean;
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5 select-none', className)}>
      <ALXOGlyph size={size} />
      {showWordmark && (
        <span className="inline-flex items-baseline text-foreground font-['Outfit',var(--font-inter),sans-serif]">
          <span className="text-3xl font-bold tracking-[-0.04em] lowercase leading-none text-foreground">
            alxo
          </span>
          <sup className="text-xs font-semibold text-foreground/75 tracking-normal ml-0.5 relative -top-2.5 select-none">
            ™
          </sup>
        </span>
      )}
    </span>
  );
}