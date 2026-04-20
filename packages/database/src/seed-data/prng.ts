/**
 * Deterministic seeded PRNG utilities.
 *
 * Everything the seed script randomises should go through these helpers so that
 * running `pnpm db:seed` twice in a row produces byte-for-byte identical rows.
 * No `Date.now()`, no `Math.random()` — just pure functions of an integer seed.
 */

/**
 * FNV-1a 32-bit string hash. Used to turn a human-readable label (e.g. a demo
 * user's name) into a stable 32-bit seed without needing a crypto dependency.
 */
export function hashString(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  // Force unsigned 32-bit.
  return h >>> 0;
}

/**
 * Derive a deterministic BigInt "telegram id" from an arbitrary label. We mix
 * two FNV passes so the resulting number comfortably exceeds 10 digits (real
 * Telegram ids are 9-10+ digits) and never collides with the small integer
 * space used elsewhere in tests.
 */
export function hashBigIntId(label: string, base: bigint = 1_000_000_000n): bigint {
  const hi = BigInt(hashString(label));
  const lo = BigInt(hashString(`${label}::lo`));
  // Compose into a ~19-digit BigInt, clamped to stay inside Postgres BIGINT range.
  const composed = base + hi * 1000n + (lo % 1000n);
  return composed;
}

/**
 * mulberry32 PRNG. Fast, tiny, good enough for fake check-ins and time
 * entries. Returns a function that yields floats in [0, 1).
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type RNG = () => number;

/** Convenience: seed a PRNG from a string label. */
export function rngFromString(label: string): RNG {
  return mulberry32(hashString(label));
}

/** Random float in [min, max). */
export function randFloat(rng: RNG, min: number, max: number): number {
  return min + rng() * (max - min);
}

/** Random integer in [min, max] inclusive. */
export function randInt(rng: RNG, min: number, max: number): number {
  return Math.floor(randFloat(rng, min, max + 1));
}

/** Return true with probability `p`. */
export function chance(rng: RNG, p: number): boolean {
  return rng() < p;
}

/** Pick one element from a non-empty array. */
export function pick<T>(rng: RNG, arr: readonly T[]): T {
  if (arr.length === 0) throw new Error('pick(): empty array');
  return arr[Math.floor(rng() * arr.length)]!;
}
