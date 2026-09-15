import React from 'react';
import { cn } from '@/lib/utils';
import { ALXOGlyph } from './ALXOGlyph';

/**
 * Full ALXO brand lockup: glyph mark + wordmark + slogan:
 * CATCH THE “ONE MORE THING.”
 */
export function ALXOLogo({
  size = 32,
  className,
  showWordmark = true,
  showSlogan = true,
}: {
  size?: number;
  className?: string;
  showWordmark?: boolean;
  showSlogan?: boolean;
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <ALXOGlyph size={size} />
      {showWordmark && (
        <span className="flex flex-col justify-center">
          <span className="text-sm font-extrabold tracking-[0.16em] text-foreground leading-tight">
            ALXO
          </span>
          {showSlogan && (
            <span className="text-[9px] font-bold tracking-[0.1em] text-brand-accent uppercase leading-none mt-0.5 whitespace-nowrap">
              CATCH THE “ONE MORE THING.”
            </span>
          )}
        </span>
      )}
    </span>
  );
}