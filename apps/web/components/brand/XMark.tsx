import { cn } from '@/lib/utils';

/**
 * XMark — abstract X motif: a request crossing the original agreement.
 * A soft ghost X in the foreground color, with a thinner electric-accent X on
 * top for depth.
 *
 * Use SPARINGLY. Reserved for brand moments: the landing hero backdrop, the
 * sign-in backdrop. Never inside the workspace UI.
 */
export function XMark({
  size = 480,
  className,
  strokeWidth = 2,
}: {
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      strokeLinecap="round"
      className={cn('shrink-0', className)}
    >
      <path
        d="M18 18 82 82"
        className="stroke-current opacity-50"
        strokeWidth={strokeWidth * 1.6}
      />
      <path
        d="M82 18 18 82"
        className="stroke-current opacity-50"
        strokeWidth={strokeWidth * 1.6}
      />
      <path
        d="M32 32 68 68"
        className="[stroke:rgb(var(--brand-accent)_/_0.7)]"
        strokeWidth={strokeWidth}
      />
      <path
        d="M68 32 32 68"
        className="[stroke:rgb(var(--brand-accent)_/_0.7)]"
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}