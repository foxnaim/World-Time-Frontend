'use client';

import * as React from 'react';
import { cn } from '@tact/ui';

export type RankingEntry = {
  employeeId: string;
  name: string;
  score: number; // 0..100
  lateCount?: number;
  position?: string;
};

export interface RankingListProps {
  items: RankingEntry[];
  max?: number;
  className?: string;
}

function medalColor(i: number) {
  if (i === 0) return '#E98074'; // coral
  if (i === 1) return '#E85A4F'; // red
  if (i === 2) return '#D8C3A5'; // sand
  return '#8E8D8A'; // stone
}

export function RankingList({ items, max = 5, className }: RankingListProps) {
  const top = items.slice(0, max);
  if (top.length === 0) {
    return (
      <div className={cn('py-8 text-center', className)}>
        <div className="text-3xl text-[#8E8D8A]/70" style={{ fontFamily: 'Fraunces, serif' }}>
          Пусто
        </div>
        <div className="mt-1 text-[11px] uppercase tracking-[0.22em] text-[#8E8D8A]/50">
          Данные появятся, когда сотрудники отметятся
        </div>
      </div>
    );
  }
  const bestScore = Math.max(...top.map((t) => t.score), 100);
  return (
    <ol className={cn('flex flex-col', className)}>
      {top.map((e, i) => {
        const pct = Math.max(0, Math.min(100, (e.score / bestScore) * 100));
        return (
          <li
            key={e.employeeId}
            className={cn(
              'grid grid-cols-[auto_1fr_auto] items-center gap-5 py-4',
              i !== top.length - 1 && 'border-b border-[#8E8D8A]/15',
            )}
          >
            <span
              className="text-3xl md:text-4xl tabular-nums leading-none"
              style={{
                fontFamily: 'Fraunces, serif',
                color: medalColor(i),
                fontWeight: 400,
              }}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="min-w-0">
              <div
                className="text-base tracking-tight text-[#8E8D8A] truncate"
                style={{ fontFamily: 'Fraunces, serif' }}
              >
                {e.name}
              </div>
              <div className="mt-1.5 h-[2px] bg-[#8E8D8A]/15 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${pct}%`,
                    background: medalColor(i),
                    opacity: 0.8,
                  }}
                />
              </div>
              {e.position && (
                <div className="mt-1 text-[10px] uppercase tracking-[0.24em] text-[#8E8D8A]/50">
                  {e.position}
                </div>
              )}
            </div>
            <span
              className="text-xl tabular-nums text-[#8E8D8A]"
              style={{ fontFamily: 'Fraunces, serif' }}
            >
              {e.score.toFixed(0)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export default RankingList;
