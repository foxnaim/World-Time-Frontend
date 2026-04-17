import { describe, it, expect } from 'vitest';
import { formatElapsed } from '@/hooks/use-elapsed';

describe('formatElapsed', () => {
  it('formats 3725 seconds as "01:02:05"', () => {
    expect(formatElapsed(3725)).toBe('01:02:05');
  });

  it('formats 0 seconds as "00:00:00"', () => {
    expect(formatElapsed(0)).toBe('00:00:00');
  });

  it('pads single-digit values with zeros', () => {
    expect(formatElapsed(65)).toBe('00:01:05');
  });

  it('clamps negative values to 00:00:00', () => {
    expect(formatElapsed(-42)).toBe('00:00:00');
  });
});
