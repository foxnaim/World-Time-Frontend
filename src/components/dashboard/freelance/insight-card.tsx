'use client';

import * as React from 'react';
import { Card, Dial, cn } from '@tact/ui';
import { RateScale } from './rate-scale';

export interface InsightCardProps {
  insight: string;
  /** Real hourly rate in ₽/hour. Used to position the dial/scale indicator. */
  rate?: number | null;
  className?: string;
}

/**
 * Editorial insight card with a coral left stripe, Fraunces heading,
 * and a small Dial indicator showing where the user's rate sits on the
 * market scale.
 */
export const InsightCard: React.FC<InsightCardProps> = ({ insight, rate, className }) => {
  const progress = rate != null ? Math.max(0, Math.min(1, rate / 5000)) : 0;

  return (
    <Card className={cn('relative overflow-hidden p-0', 'border-stone/20', className)}>
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-coral" aria-hidden />
      <div className="flex flex-col gap-6 p-6 pl-8 md:flex-row md:items-center md:p-8 md:pl-10">
        <div className="flex-1">
          <span className="text-[10px] uppercase tracking-[0.28em] text-stone/70">
            Инсайт месяца
          </span>
          <h3
            className="mt-2 text-2xl font-medium tracking-editorial text-stone md:text-3xl"
            style={{ fontFamily: 'Fraunces, serif' }}
          >
            {rate != null ? `${Math.round(rate)} ₽/час` : 'Пока нет данных'}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-stone/90 md:text-base">{insight}</p>
          {rate != null && (
            <div className="mt-5">
              <RateScale rate={rate} />
            </div>
          )}
        </div>
        <div className="hidden shrink-0 md:block">
          <Dial
            size={180}
            progress={progress}
            ticks={48}
            indicatorColor="coral"
            label={rate != null ? String(Math.round(rate)) : '—'}
            sublabel="₽/ЧАС"
          />
        </div>
      </div>
    </Card>
  );
};

InsightCard.displayName = 'InsightCard';
