'use client';

import * as React from 'react';
import { cn } from '@worktime/ui';

export interface CodeInputProps {
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  autoFocus?: boolean;
  disabled?: boolean;
  error?: boolean;
  /** Message announced to assistive tech when the group is in error state. */
  errorMessage?: string;
  className?: string;
  'aria-label'?: string;
  /**
   * Prefix for each input's `id` attribute so external <label htmlFor>
   * references match. Boxes get id={`${idPrefix}-${index}`}. Defaults to "otp".
   */
  idPrefix?: string;
}

export const CodeInput: React.FC<CodeInputProps> = ({
  length = 6,
  value,
  onChange,
  onComplete,
  autoFocus = true,
  disabled = false,
  error = false,
  errorMessage,
  className,
  'aria-label': ariaLabel = 'Код подтверждения',
  idPrefix = 'otp',
}) => {
  const errorId = React.useId();
  const [internal, setInternal] = React.useState<string[]>(() =>
    Array.from({ length }).map((_, i) => value?.[i] ?? ''),
  );
  const refs = React.useRef<Array<HTMLInputElement | null>>([]);

  // Sync external value
  React.useEffect(() => {
    if (typeof value === 'string') {
      const next = Array.from({ length }).map((_, i) => value[i] ?? '');
      setInternal(next);
    }
  }, [value, length]);

  React.useEffect(() => {
    if (autoFocus && refs.current[0]) {
      refs.current[0].focus();
    }
  }, [autoFocus]);

  const commit = (next: string[]) => {
    setInternal(next);
    const joined = next.join('');
    onChange?.(joined);
    if (joined.length === length && next.every((c) => c !== '')) {
      onComplete?.(joined);
    }
  };

  const handleChange =
    (idx: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, '');
      if (!raw) {
        const next = [...internal];
        next[idx] = '';
        commit(next);
        return;
      }
      // If user pasted multiple digits into one box, distribute
      if (raw.length > 1) {
        const chars = raw.split('').slice(0, length - idx);
        const next = [...internal];
        chars.forEach((c, i) => {
          next[idx + i] = c;
        });
        commit(next);
        const target = Math.min(idx + chars.length, length - 1);
        refs.current[target]?.focus();
        return;
      }
      const next = [...internal];
      next[idx] = raw;
      commit(next);
      if (idx < length - 1) {
        refs.current[idx + 1]?.focus();
      }
    };

  const handleKeyDown =
    (idx: number) => (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        if (internal[idx]) {
          const next = [...internal];
          next[idx] = '';
          commit(next);
          return;
        }
        if (idx > 0) {
          refs.current[idx - 1]?.focus();
          const next = [...internal];
          next[idx - 1] = '';
          commit(next);
        }
      } else if (e.key === 'ArrowLeft' && idx > 0) {
        refs.current[idx - 1]?.focus();
      } else if (e.key === 'ArrowRight' && idx < length - 1) {
        refs.current[idx + 1]?.focus();
      }
    };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '');
    if (!pasted) return;
    e.preventDefault();
    const chars = pasted.split('').slice(0, length);
    const next = Array.from({ length }).map((_, i) => chars[i] ?? '');
    commit(next);
    const target = Math.min(chars.length, length - 1);
    refs.current[target]?.focus();
  };

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div
        role="group"
        aria-label={ariaLabel}
        aria-invalid={error || undefined}
        aria-describedby={error && errorMessage ? errorId : undefined}
        className="flex items-center justify-center gap-2 md:gap-3"
      >
        {internal.map((char, idx) => (
          <input
            key={idx}
            id={`${idPrefix}-${idx}`}
            ref={(el) => {
              refs.current[idx] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={1}
            value={char}
            disabled={disabled}
            onChange={handleChange(idx)}
            onKeyDown={handleKeyDown(idx)}
            onPaste={handlePaste}
            aria-label={`Цифра ${idx + 1} из ${length}`}
            aria-invalid={error || undefined}
            className={cn(
              'h-14 w-11 md:h-16 md:w-12',
              'bg-cream/50 backdrop-blur-sm',
              'rounded-lg',
              'border',
              error ? 'border-red' : 'border-stone/30',
              'text-center text-2xl md:text-3xl font-medium text-stone',
              'font-mono tabular-nums tracking-tight',
              'transition-colors duration-200',
              'focus:outline-none focus:border-coral focus:ring-2 focus:ring-coral/30',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          />
        ))}
      </div>
      <div
        id={errorId}
        role="alert"
        aria-live="polite"
        aria-atomic="true"
        className={cn(
          'min-h-[1.25rem] text-xs text-red',
          !error || !errorMessage ? 'sr-only' : '',
        )}
      >
        {error && errorMessage ? errorMessage : ''}
      </div>
    </div>
  );
};

CodeInput.displayName = 'CodeInput';
