'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export function DropdownMenu({
  trigger,
  children,
  align = 'right',
  side = 'bottom',
}: {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  side?: 'top' | 'bottom';
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const menuId = React.useId();

  React.useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  // Ensure trigger is focusable by cloning with a stable ref.
  const triggerWithProps = React.isValidElement<{
    onClick?: React.MouseEventHandler;
    'aria-haspopup'?: true;
    'aria-expanded'?: boolean;
    'aria-controls'?: string;
    ref?: React.Ref<HTMLButtonElement>;
  }>(trigger)
    ? React.cloneElement(trigger, {
        onClick: (e: React.MouseEvent) => {
          if (trigger.props.onClick) trigger.props.onClick(e);
          setOpen((o) => !o);
        },
        'aria-haspopup': true,
        'aria-expanded': open,
        'aria-controls': menuId,
        ref: triggerRef,
      })
    : trigger;

  return (
    <div ref={ref} className="relative inline-flex w-full">
      {triggerWithProps}
      {open && (
        <div
          id={menuId}
          role="menu"
          className={cn(
            'absolute z-50 min-w-[12rem] rounded-xl border border-border/80 bg-popover/95 backdrop-blur-md p-1.5 text-popover-foreground shadow-2xl animate-fade-in',
            side === 'top' ? 'bottom-full mb-2' : 'top-full mt-1',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownMenuItem({
  icon,
  onSelect,
  danger,
  children,
  label,
}: {
  icon?: React.ReactNode;
  onSelect?: () => void;
  danger?: boolean;
  children: React.ReactNode;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      aria-label={label}
      onClick={() => onSelect?.()}
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        danger
          ? 'text-danger hover:bg-danger/10'
          : 'text-popover-foreground hover:bg-muted'
      )}
    >
      {icon}
      {children}
    </button>
  );
}