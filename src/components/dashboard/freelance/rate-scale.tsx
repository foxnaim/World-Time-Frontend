'use client';

import * as React from 'react';
import { cn } from '@tact/ui';

export interface RateScaleProps {
  /** Real hourly rate in ₽/hour. */
  rate: number;
  className?: string;
}

const STOPS = [0, 500, 1500, 3000, 5000];
const MAX = 6000;

/**
 * Horizontal tick ruler showing the user's real hourly rate against
 * market scale labels (0, 500, 1500, 3000, 5000+ ₽/час).
 */
export const RateScale: React.FC<RateScaleProps> = ({ rate, className }) => {
  const clamped = Math.max(0, Math.min(rate, MAX));
  const percent = (clamped / MAX) * 100;

  return (
    <div className={cn('w-full select-none', className)}>
      <div className="relative h-10">
        <div
          className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-stone/30"
          aria-hidden
        />
        {STOPS.map((value) => {
          const left = Math.min((value / MAX) * 100, 100);
          return (
            <div
              key={value}
              className="absolute top-1/2 h-3 w-px -translate-y-1/2 bg-stone/50"
              style={{ left: `${left}%` }}
              aria-hidden
            />
          );
        })}
        <div
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${percent}%` }}
          aria-label={`Ваша ставка: ${Math.round(rate)} ₽/час`}
        >
          <div className="h-4 w-4 rounded-full border border-coral bg-coral shadow-[0_0_0_4px_rgba(233,128,116,0.18)]" />
        </div>
      </div>
      <div className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.22em] text-stone/70">
        {STOPS.map((value, i) => (
          <span key={value} className={i === STOPS.length - 1 ? '' : ''}>
            {value === 5000 ? '5000+' : value} ₽
          </span>
        ))}
      </div>
    </div>
  );
};

RateScale.displayName = 'RateScale';
