'use client';

import * as React from 'react';

type SlotProps = React.HTMLAttributes<HTMLElement> & {
  children?: React.ReactNode;
};

/**
 * Minimal Slot — renders its child while merging the consumer's props and
 * className onto it. Used to compose buttons/focusables (e.g. <Button asChild>).
 */
export function Slot({ children, className, ...props }: SlotProps) {
  if (React.isValidElement(children)) {
    const child = children as React.ReactElement<SlotProps>;
    return React.cloneElement(child, {
      className: [className, child.props.className].filter(Boolean).join(' '),
      ...props,
    });
  }
  return null;
}