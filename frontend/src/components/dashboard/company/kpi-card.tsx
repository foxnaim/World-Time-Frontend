'use client';

import * as React from 'react';
import { Card, cn } from '@tact/ui';

export interface KpiCardSubMetric {
  /** Short label shown after the dot+value */
  label: string;
  value: number;
  /** CSS color string for the status dot */
  dotColor?: string;
}

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
  /** Optional sub-metric shown below the main value (e.g. currently present count) */
  subMetric?: KpiCardSubMetric;
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
  subMetric,
}: KpiCardProps) {
  let deltaColor = 'text-[#3d3b38]';
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
      <div className="text-[10px] uppercase tracking-[0.28em] text-[#3d3b38]">{eyebrow}</div>
      <div className="mt-5 flex items-baseline gap-2">
        {loading ? (
          <span className="inline-block h-12 w-24 rounded-md bg-[#D8C3A5]/40 animate-pulse" />
        ) : (
          <>
            <span
              className="text-5xl md:text-6xl text-[#3d3b38] leading-none tracking-tight"
              style={{ fontFamily: 'Fraunces, serif', fontWeight: 400 }}
            >
              {value}
            </span>
            {suffix && (
              <span className="text-xs uppercase tracking-[0.24em] text-[#6b6966]">
                {suffix}
              </span>
            )}
          </>
        )}
      </div>
      {subMetric && !loading && (
        <div className="mt-3 inline-flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: subMetric.dotColor ?? '#4CAF50' }}
            aria-hidden="true"
          />
          <span className="text-[11px] uppercase tracking-[0.22em] text-[#3d3b38]">
            {subMetric.value} {subMetric.label}
          </span>
        </div>
      )}
      <div className="mt-6 flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-[0.22em] text-[#6b6966]">
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
