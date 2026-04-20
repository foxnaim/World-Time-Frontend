/**
 * Thin wrapper around Next's `unstable_cache` that enforces a consistent
 * key namespace and a sane default `revalidate`. Use this for anything
 * that wants to memoize a server-side computation across requests — DB
 * lookups, fanned-out fetches, expensive derivations.
 *
 * Keys are always namespaced with `worktime:<app>:` so they can't collide
 * with other apps sharing the same Redis instance, and with the cache
 * handler's own `worktime:next:` prefix they become fully qualified.
 */

import 'server-only';

import { unstable_cache } from 'next/cache';

/** Namespace every cache key with the app name so we don't collide. */
const NS = 'worktime:web';

/** Default revalidate in seconds — tune individual callers as needed. */
const DEFAULT_REVALIDATE = 60;

export type SCacheOptions = {
  /** Seconds before the entry is treated as stale. */
  revalidate?: number;
  /** Tags for `revalidateTag()` invalidation. */
  tags?: string[];
};

/**
 * Memoize `fn` under `[NS, ...keyParts]` with ISR-style revalidation.
 *
 * The returned function is a fresh wrapper each call site — that's how
 * `unstable_cache` wants it: one wrapper per logical cache entry, keyed
 * by its `keyParts`, not by closure identity.
 */
export function sCache<TArgs extends unknown[], TResult>(
  keyParts: string[],
  fn: (...args: TArgs) => Promise<TResult>,
  options: SCacheOptions = {},
): (...args: TArgs) => Promise<TResult> {
  const { revalidate = DEFAULT_REVALIDATE, tags } = options;
  return unstable_cache(fn, [NS, ...keyParts], {
    revalidate,
    ...(tags && tags.length > 0 ? { tags } : {}),
  });
}
