'use client';

import { useEffect, useState } from 'react';

const MONTHS_RU = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
];

const WEEKDAYS_RU = [
  'воскресенье',
  'понедельник',
  'вторник',
  'среда',
  'четверг',
  'пятница',
  'суббота',
];

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function formatTime(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatDate(date: Date): string {
  const weekday = WEEKDAYS_RU[date.getDay()];
  const day = date.getDate();
  const month = MONTHS_RU[date.getMonth()];
  return `${weekday}, ${day} ${month}`;
}

export interface ClockProps {
  className?: string;
}

/**
 * Big Fraunces HH:MM clock with a small-caps date line beneath.
 * Hydration-safe: we render a stable placeholder on the server, then
 * swap to the real time on the client to avoid mismatch warnings.
 */
export function Clock({ className }: ClockProps) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const timeLabel = now ? formatTime(now) : '--:--';
  const dateLabel = now ? formatDate(now) : '\u00A0';

  return (
    <div className={className} aria-live="off">
      <div
        className="text-right text-5xl md:text-6xl leading-none tabular-nums text-[#2a2927]"
        style={{
          fontFamily: 'var(--font-fraunces), Georgia, serif',
          fontWeight: 500,
          letterSpacing: '-0.02em',
          fontVariationSettings: "'opsz' 120",
        }}
      >
        {timeLabel}
      </div>
      <div className="mt-2 text-right text-[10px] uppercase tracking-[0.28em] text-stone/80">
        {dateLabel}
      </div>
    </div>
  );
}
