'use client';

import * as React from 'react';
import { cn } from '@worktime/ui';

export interface StatTileProps {
  label: string;
  value: React.ReactNode;
  suffix?: string;
  hint?: string;
  loading?: boolean;
  className?: string;
}

/**
 * Super-admin KPI tile. Deliberately flat and mono: stone on stone, large
 * serif numeric. Differs from the editorial `KpiCard` used in the company
 * dashboard — no deltas, no cards, no pastel accents. This is an operator
 * tool and should look like one.
 */
export function StatTile({
  label,
  value,
  suffix,
  hint,
  loading,
  className,
}: StatTileProps) {
  return (
    <div
      className={cn(
        'border border-stone-300/70 bg-stone-100 p-6 md:p-7',
        'flex flex-col justify-between min-h-[160px]',
        className,
      )}
    >
      <div className="text-[10px] uppercase tracking-[0.28em] text-stone-500">
        {label}
      </div>
      <div className="mt-5 flex items-baseline gap-2">
        {loading ? (
          <span className="inline-block h-12 w-24 rounded bg-stone-200 animate-pulse" />
        ) : (
          <>
            <span
              className="text-5xl md:text-6xl text-stone-800 leading-none tracking-tight tabular-nums"
              style={{ fontFamily: 'Fraunces, serif', fontWeight: 400 }}
            >
              {value}
            </span>
            {suffix && (
              <span className="text-xs uppercase tracking-[0.24em] text-stone-500">
                {suffix}
              </span>
            )}
          </>
        )}
      </div>
      {hint && (
        <div className="mt-6 text-[11px] uppercase tracking-[0.22em] text-stone-400">
          {hint}
        </div>
      )}
    </div>
  );
}

export default StatTile;
