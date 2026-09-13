'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export function Tooltip({
  content,
  children,
  side = 'top',
}: {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
}) {
  const [show, setShow] = React.useState(false);
  const id = React.useId();

  const sideClasses = {
    top: 'bottom-full mb-1.5 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-1.5 left-1/2 -translate-x-1/2',
    left: 'right-full mr-1.5 top-1/2 -translate-y-1/2',
    right: 'left-full ml-1.5 top-1/2 -translate-y-1/2',
  };

  const child = React.isValidElement<{
    onFocus?: React.FocusEventHandler;
    onBlur?: React.FocusEventHandler;
    onMouseEnter?: React.MouseEventHandler;
    onMouseLeave?: React.MouseEventHandler;
    'aria-describedby'?: string;
  }>(children)
    ? React.cloneElement(children, {
        onFocus: (e: React.FocusEvent) => {
          children.props.onFocus?.(e);
          setShow(true);
        },
        onBlur: (e: React.FocusEvent) => {
          children.props.onBlur?.(e);
          setShow(false);
        },
        onMouseEnter: (e: React.MouseEvent) => {
          children.props.onMouseEnter?.(e);
          setShow(true);
        },
        onMouseLeave: (e: React.MouseEvent) => {
          children.props.onMouseLeave?.(e);
          setShow(false);
        },
        'aria-describedby': show ? id : undefined,
      })
    : children;

  return (
    <span className="relative inline-flex">
      {child}
      {show && (
        <span
          id={id}
          role="tooltip"
          className={cn(
            'pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-popover px-2 py-1 text-xs text-popover-foreground shadow-card border border-border',
            sideClasses[side]
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}