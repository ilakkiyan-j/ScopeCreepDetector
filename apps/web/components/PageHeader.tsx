import * as React from 'react';

export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-6 flex animate-fade-up flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${className ?? ''}`}>
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        <span aria-hidden="true" className="mt-2 block h-0.5 w-10 rounded-full bg-brand-gradient" />
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}