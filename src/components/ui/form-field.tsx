'use client';

import * as React from 'react';
import { cn } from '@tact/ui';

export interface FormFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id' | 'prefix'> {
  label: string;
  hint?: string;
  error?: string;
  id?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  (
    { label, hint, error, id, className, prefix, suffix, ...props },
    ref,
  ) => {
    const reactId = React.useId();
    const fieldId = id ?? reactId;
    const describedBy = error
      ? `${fieldId}-error`
      : hint
        ? `${fieldId}-hint`
        : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={fieldId}
          className="text-[10px] uppercase tracking-[0.22em] text-stone"
        >
          {label}
        </label>
        <div
          className={cn(
            'flex items-center gap-2 border-b transition-colors duration-200',
            error ? 'border-red' : 'border-stone/40 focus-within:border-coral',
          )}
        >
          {prefix && (
            <span className="text-stone/60 text-sm pb-2">{prefix}</span>
          )}
          <input
            id={fieldId}
            ref={ref}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            className={cn(
              'flex-1 h-10',
              'bg-transparent',
              'border-0 px-0 py-2',
              'text-stone placeholder:text-stone/40',
              'focus:outline-none focus:ring-0',
              'rounded-none',
              className,
            )}
            {...props}
          />
          {suffix && (
            <span className="text-stone/60 text-sm pb-2">{suffix}</span>
          )}
        </div>
        {error ? (
          <p
            id={`${fieldId}-error`}
            className="text-xs text-red mt-0.5"
            role="alert"
          >
            {error}
          </p>
        ) : hint ? (
          <p
            id={`${fieldId}-hint`}
            className="text-xs text-stone/60 mt-0.5"
          >
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);

FormField.displayName = 'FormField';
