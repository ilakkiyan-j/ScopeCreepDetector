import { cn } from '@/lib/utils';

/**
 * ALXO brand mark: the X where a requested change crosses the original
 * agreement. The forward stroke is the surface color; the rising stroke is the
 * electric brand accent. Renders a rounded gradient tile with the X, so it can
 * sit anywhere the old icon-badge did.
 */
export function ALXOGlyph({
  size = 32,
  className,
  variant = 'gradient',
}: {
  /** Render size in px (square tile). */
  size?: number;
  className?: string;
  /** `gradient` = ink→cyan tile (brand), `flat` = primary token tile. */
  variant?: 'gradient' | 'flat';
}) {
  const radius = Math.round(size * 0.285);
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center justify-center font-sans',
        variant === 'gradient'
          ? 'bg-brand-gradient text-primary-foreground'
          : 'bg-primary text-primary-foreground',
        className
      )}
      style={{ width: size, height: size, borderRadius: radius }}
    >
      <svg
        viewBox="0 0 24 24"
        width={size * 0.58}
        height={size * 0.58}
        fill="none"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M7 7 17 17" className="stroke-current" strokeWidth={2.6} />
        <path
          d="M17 7 7 17"
          className="[stroke:rgb(var(--brand-accent))]"
          strokeWidth={2.6}
        />
      </svg>
    </span>
  );
}