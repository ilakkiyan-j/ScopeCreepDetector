import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Avatar({
  name,
  className,
  square,
}: {
  name?: string | null;
  className?: string;
  square?: boolean;
}) {
  const initials = name
    ?.split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || '?';

  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex h-9 w-9 select-none items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground',
        square && 'rounded-lg',
        className
      )}
    >
      {initials === '?' ? <User className="h-4 w-4" /> : initials}
    </span>
  );
}