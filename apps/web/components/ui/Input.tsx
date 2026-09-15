'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          'flex h-10 w-full rounded-xl border border-border/80 bg-card/60 px-3.5 py-2 text-sm text-foreground',
          'placeholder:text-muted-foreground/60 shadow-xs transition-all duration-150',
          'hover:border-border hover:bg-card/80',
          'focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:bg-card',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/30',
          invalid && 'border-danger focus-visible:border-danger focus-visible:ring-danger/20',
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';