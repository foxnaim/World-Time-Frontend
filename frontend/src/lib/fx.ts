import useSWR from 'swr';
import { fetcher } from './fetcher';
import { CURRENCY_META, type Currency } from './currency';

/**
 * Live FX rates from `/api/billing/fx`.
 *
 * The backend refreshes these once a day from the Russian CBR, so we're
 * fine hitting SWR with `revalidateOnFocus: false` and a long
 * dedupe interval — rates don't change mid-session.
 */

export type RatesPayload = {
  base: 'RUB';
  rates: Record<string, number>;
  updatedAt: string;
};

export function useFxRates(): RatesPayload | null {
  const { data } = useSWR<RatesPayload>('/api/billing/fx', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60 * 60 * 1000,
  });
  return data ?? null;
}

/** Convert an RUB amount to a target currency using rates (fallback: return RUB amount). */
export function convertFromRub(
  amountRub: number,
  target: Currency,
  rates: RatesPayload | null,
): number {
  if (target === 'RUB') return amountRub;
  const rate = rates?.rates?.[target];
  if (typeof rate !== 'number' || rate <= 0) return amountRub;
  return amountRub * rate;
}

/**
 * Format a RUB-base amount into the target currency, using live rates.
 * Falls back to a plain RUB formatting when rates haven't loaded yet —
 * better than rendering a stale/wrong number.
 */
export function formatFromRub(
  amountRub: number,
  target: Currency,
  rates: RatesPayload | null,
): string {
  const value = convertFromRub(amountRub, target, rates);
  try {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: target,
      maximumFractionDigits:
        target === 'USD' || target === 'EUR' ? 2 : 0,
    }).format(value);
  } catch {
    return `${Math.round(value)} ${CURRENCY_META[target].symbol}`;
  }
}
