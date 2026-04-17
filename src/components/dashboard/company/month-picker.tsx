'use client';

import * as React from 'react';
import { cn } from '@worktime/ui';

export interface MonthPickerProps {
  value: string; // YYYY-MM
  onChange: (v: string) => void;
  count?: number;
  className?: string;
}

function buildMonths(count: number) {
  const now = new Date();
  const out: { value: string; short: string; long: string }[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const short = d.toLocaleDateString('ru-RU', { month: 'short' });
    const long = d.toLocaleDateString('ru-RU', {
      month: 'long',
      year: 'numeric',
    });
    out.push({ value, short, long });
  }
  return out;
}

export function MonthPicker({
  value,
  onChange,
  count = 6,
  className,
}: MonthPickerProps) {
  const months = React.useMemo(() => buildMonths(count), [count]);
  const listRef = React.useRef<HTMLDivElement>(null);

  const idx = months.findIndex((m) => m.value === value);

  const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const delta = e.key === 'ArrowLeft' ? -1 : 1;
      const next = Math.max(0, Math.min(months.length - 1, idx + delta));
      onChange(months[next].value);
      const btn = listRef.current?.querySelectorAll('button')[next] as
        | HTMLButtonElement
        | undefined;
      btn?.focus();
    }
  };

  return (
    <div
      ref={listRef}
      onKeyDown={onKey}
      role="tablist"
      aria-label="Выбор месяца"
      className={cn(
        'inline-flex items-center gap-0 border border-[#8E8D8A]/25 rounded-full p-1 bg-[#EAE7DC]',
        className,
      )}
    >
      {months.map((m) => {
        const active = m.value === value;
        return (
          <button
            key={m.value}
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(m.value)}
            className={cn(
              'px-3 md:px-4 h-8 rounded-full text-[11px] uppercase tracking-[0.22em] transition-colors',
              active
                ? 'bg-[#E98074] text-[#EAE7DC]'
                : 'text-[#8E8D8A] hover:text-[#E98074]',
            )}
            title={m.long}
          >
            <span className="capitalize">{m.short}</span>
          </button>
        );
      })}
    </div>
  );
}

export default MonthPicker;
