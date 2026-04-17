'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Returns live elapsed seconds between `startedAt` (ISO string) and now.
 * Updates via requestAnimationFrame at ~100ms cadence to avoid needless
 * renders while keeping HH:MM:SS display fresh.
 *
 * Returns 0 if startedAt is null/undefined/invalid.
 */
export function useElapsed(startedAt: string | null | undefined): number {
  const [seconds, setSeconds] = useState<number>(() => computeElapsed(startedAt));
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);

  useEffect(() => {
    if (!startedAt) {
      setSeconds(0);
      return;
    }

    const startMs = new Date(startedAt).getTime();
    if (Number.isNaN(startMs)) {
      setSeconds(0);
      return;
    }

    const tick = (ts: number) => {
      if (ts - lastTickRef.current >= 100) {
        lastTickRef.current = ts;
        const now = Date.now();
        const next = Math.max(0, Math.floor((now - startMs) / 1000));
        setSeconds((prev) => (prev === next ? prev : next));
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    setSeconds(computeElapsed(startedAt));
    lastTickRef.current = 0;
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [startedAt]);

  return seconds;
}

function computeElapsed(startedAt: string | null | undefined): number {
  if (!startedAt) return 0;
  const startMs = new Date(startedAt).getTime();
  if (Number.isNaN(startMs)) return 0;
  return Math.max(0, Math.floor((Date.now() - startMs) / 1000));
}

/**
 * Formats seconds as HH:MM:SS with zero-padded segments.
 */
export function formatElapsed(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${pad(hh)}:${pad(mm)}:${pad(ss)}`;
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}
