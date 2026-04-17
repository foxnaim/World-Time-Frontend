/**
 * Server-side auth helpers for RSC / Route Handlers.
 *
 * `getServerUser()` reads the `wt_access` cookie via `next/headers`, verifies
 * the JWT via `verifyAccessToken`, and returns a `{ id, telegramId }` payload
 * or `null`. The result is memoized per-request via React's `cache()` so
 * multiple consumers in the same request share one verification pass.
 *
 * Do NOT import this from client components or from `middleware.ts`
 * (middleware has its own path — see `src/middleware.ts`).
 */

import { cache } from 'react';
import { cookies } from 'next/headers';
import { verifyAccessToken, type VerifiedUser } from '@/lib/jwt-verify';

export const ACCESS_COOKIE = 'wt_access';

export const getServerUser = cache(async (): Promise<VerifiedUser | null> => {
  // Next 15: `cookies()` is async.
  const store = await cookies();
  const token = store.get(ACCESS_COOKIE)?.value ?? null;
  return verifyAccessToken(token);
});

/** Convenience — throws if unauthenticated. Prefer `getServerUser()` when
 * you want to render a fallback UI instead. */
export async function requireServerUser(): Promise<VerifiedUser> {
  const user = await getServerUser();
  if (!user) {
    throw new Error('Unauthenticated');
  }
  return user;
}
