'use client';

import * as React from 'react';
import { Card, cn } from '@tact/ui';

export interface KpiCardProps {
  eyebrow: string;
  value: React.ReactNode;
  suffix?: string;
  delta?: number | null;
  /**
   * If true, lower values are better (e.g. lateness). Inverts color semantic.
   */
  invertSemantic?: boolean;
  caption?: string;
  className?: string;
  loading?: boolean;
}

function formatDelta(d: number) {
  const abs = Math.abs(d);
  const sign = d > 0 ? '+' : d < 0 ? '−' : '±';
  return `${sign}${abs.toFixed(abs < 10 ? 1 : 0)}`;
}

export function KpiCard({
  eyebrow,
  value,
  suffix,
  delta = null,
  invertSemantic = false,
  caption,
  className,
  loading,
}: KpiCardProps) {
  let deltaColor = 'text-[#8E8D8A]';
  let deltaArrow = '→';
  if (typeof delta === 'number' && delta !== 0) {
    const rising = delta > 0;
    // "good" = rising, unless inverted (where lower is better)
    const good = invertSemantic ? !rising : rising;
    deltaColor = good ? 'text-[#E98074]' : 'text-[#E85A4F]';
    deltaArrow = rising ? '↑' : '↓';
  }

  return (
    <Card className={cn('flex flex-col justify-between min-h-[180px] p-6 md:p-7', className)}>
      <div className="text-[10px] uppercase tracking-[0.28em] text-[#8E8D8A]/80">{eyebrow}</div>
      <div className="mt-5 flex items-baseline gap-2">
        {loading ? (
          <span className="inline-block h-12 w-24 rounded-md bg-[#D8C3A5]/40 animate-pulse" />
        ) : (
          <>
            <span
              className="text-5xl md:text-6xl text-[#8E8D8A] leading-none tracking-tight"
              style={{ fontFamily: 'Fraunces, serif', fontWeight: 400 }}
            >
              {value}
            </span>
            {suffix && (
              <span className="text-xs uppercase tracking-[0.24em] text-[#8E8D8A]/70">
                {suffix}
              </span>
            )}
          </>
        )}
      </div>
      <div className="mt-6 flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-[0.22em] text-[#8E8D8A]/60">
          {caption ?? 'за месяц'}
        </span>
        {typeof delta === 'number' && (
          <span className={cn('text-[11px] uppercase tracking-[0.22em]', deltaColor)}>
            {deltaArrow} {formatDelta(delta)}
          </span>
        )}
      </div>
    </Card>
  );
}

export default KpiCard;
