'use client';

import * as React from 'react';
import { cn } from '@tact/ui';

export interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  suffix?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  placeholder?: string;
  'aria-label'?: string;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
  suffix,
  disabled = false,
  id,
  className,
  placeholder,
  'aria-label': ariaLabel,
}) => {
  const reactId = React.useId();
  const fieldId = id ?? reactId;

  const clamp = (n: number) => {
    let next = n;
    if (typeof min === 'number') next = Math.max(min, next);
    if (typeof max === 'number') next = Math.min(max, next);
    return next;
  };

  const decrement = () => {
    if (disabled) return;
    onChange(clamp((Number.isFinite(value) ? value : 0) - step));
  };
  const increment = () => {
    if (disabled) return;
    onChange(clamp((Number.isFinite(value) ? value : 0) + step));
  };

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label
          htmlFor={fieldId}
          className="text-[10px] uppercase tracking-[0.22em] text-stone"
        >
          {label}
        </label>
      )}
      <div className="flex items-center gap-2 border-b border-stone/40 focus-within:border-coral transition-colors duration-200">
        <button
          type="button"
          onClick={decrement}
          disabled={disabled || (typeof min === 'number' && value <= min)}
          className="h-10 w-8 flex items-center justify-center text-stone hover:text-coral disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Уменьшить"
          tabIndex={-1}
        >
          <span className="text-lg leading-none">−</span>
        </button>
        <input
          id={fieldId}
          type="number"
          inputMode="decimal"
          value={Number.isFinite(value) ? value : ''}
          onChange={(e) => {
            const n = parseFloat(e.target.value);
            if (Number.isFinite(n)) onChange(clamp(n));
            else onChange(0);
          }}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          placeholder={placeholder}
          aria-label={ariaLabel ?? label}
          className={cn(
            'flex-1 h-10 text-center',
            'bg-transparent border-0 px-0 py-2',
            'text-stone placeholder:text-stone/40',
            'font-mono tabular-nums',
            'focus:outline-none focus:ring-0',
            'rounded-none',
            '[appearance:textfield]',
            '[&::-webkit-outer-spin-button]:appearance-none',
            '[&::-webkit-inner-spin-button]:appearance-none',
          )}
        />
        {suffix && (
          <span className="text-xs uppercase tracking-[0.18em] text-stone/60 pb-2">
            {suffix}
          </span>
        )}
        <button
          type="button"
          onClick={increment}
          disabled={disabled || (typeof max === 'number' && value >= max)}
          className="h-10 w-8 flex items-center justify-center text-stone hover:text-coral disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Увеличить"
          tabIndex={-1}
        >
          <span className="text-lg leading-none">+</span>
        </button>
      </div>
    </div>
  );
};

NumberInput.displayName = 'NumberInput';
