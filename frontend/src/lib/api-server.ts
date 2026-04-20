/**
 * Server-only fetch helpers for talking to the backend API from RSCs,
 * route handlers, and server actions.
 *
 * These are distinct from `api.ts` (which is client-safe) because they:
 *   - read the bearer token from `cookies()` (only works on the server),
 *   - forward it as `Authorization: Bearer <token>`,
 *   - use Next's `next: { revalidate, tags }` fetch options so responses
 *     participate in ISR and `revalidateTag()` invalidation.
 */

import 'server-only';

import { cookies } from 'next/headers';

const API_BASE = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

/** Cookie name that holds the session JWT. Keep in sync with auth-cookie.ts. */
const AUTH_COOKIE = 'worktime_session';

export type GetServerJSONOptions = {
  /** Seconds of ISR caching. Omit or set to 0 for no cache. */
  revalidate?: number;
  /** Tags for `revalidateTag()` invalidation. */
  tags?: string[];
  /** Extra headers to merge onto the request. */
  headers?: Record<string, string>;
};

export class ServerFetchError extends Error {
  readonly status: number;
  readonly body: string;
  constructor(status: number, body: string, message?: string) {
    super(message ?? `server fetch failed: ${status}`);
    this.name = 'ServerFetchError';
    this.status = status;
    this.body = body;
  }
}

function joinUrl(base: string, path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const left = base.endsWith('/') ? base.slice(0, -1) : base;
  const right = path.startsWith('/') ? path : `/${path}`;
  return left + right;
}

async function readBearer(): Promise<string | null> {
  // `cookies()` is async in Next 15.
  const jar = await cookies();
  const token = jar.get(AUTH_COOKIE)?.value;
  return token ?? null;
}

/**
 * GET `path` as JSON. Response is cached per Next's fetch-cache rules:
 *   - `revalidate: N` → ISR, refreshed at most every N seconds,
 *   - `tags: [...]` → invalidatable via `revalidateTag()`,
 *   - both omitted → no cache (treated as dynamic).
 */
export async function getServerJSON<T>(
  path: string,
  options: GetServerJSONOptions = {},
): Promise<T> {
  const { revalidate, tags, headers: extraHeaders } = options;

  const token = await readBearer();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  };

  // Build the `next` options only when at least one field is set —
  // passing an empty object changes fetch semantics in Next.
  const nextOpts: { revalidate?: number; tags?: string[] } = {};
  if (typeof revalidate === 'number') nextOpts.revalidate = revalidate;
  if (tags && tags.length > 0) nextOpts.tags = tags;

  const res = await fetch(joinUrl(API_BASE, path), {
    method: 'GET',
    headers,
    ...(Object.keys(nextOpts).length > 0
      ? { next: nextOpts }
      : // Explicitly opt out of caching when the caller didn't ask for it —
        // avoids accidentally serving stale auth-scoped data.
        { cache: 'no-store' }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new ServerFetchError(res.status, body);
  }

  return (await res.json()) as T;
}
