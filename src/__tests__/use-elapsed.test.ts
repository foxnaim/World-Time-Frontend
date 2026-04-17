import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useElapsed } from '@/hooks/use-elapsed';

describe('useElapsed', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('increments elapsed seconds as time passes', () => {
    const start = new Date('2026-04-17T12:00:00Z');
    vi.setSystemTime(start);

    const startedAt = start.toISOString();
    const { result } = renderHook(() => useElapsed(startedAt));

    expect(result.current).toBe(0);

    act(() => {
      vi.setSystemTime(new Date(start.getTime() + 3_000));
      vi.advanceTimersByTime(3_000);
    });

    expect(result.current).toBeGreaterThanOrEqual(3);

    act(() => {
      vi.setSystemTime(new Date(start.getTime() + 10_000));
      vi.advanceTimersByTime(10_000);
    });

    expect(result.current).toBeGreaterThanOrEqual(10);
  });

  it('returns 0 when startedAt is null', () => {
    const { result } = renderHook(() => useElapsed(null));
    expect(result.current).toBe(0);
  });
});
