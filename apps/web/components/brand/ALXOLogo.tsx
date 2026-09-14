import { cn } from '@/lib/utils';
import { ALXOGlyph } from './ALXOGlyph';

/**
 * Full ALXO lockup: the glyph mark + wordmark. Used in nav bars, footers, and
 * onboarding (never inside the workspace shell, which keeps a glyph-only mark).
 */
export function ALXOLogo({
  size = 32,
  className,
  showWordmark = true,
}: {
  size?: number;
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <ALXOGlyph size={size} />
      {showWordmark && (
        <span className="text-sm font-semibold tracking-[0.18em] text-foreground">
          ALXO
        </span>
      )}
    </span>
  );
}