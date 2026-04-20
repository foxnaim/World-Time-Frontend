/**
 * Typed fetch wrapper for the Work Tact API.
 *
 * - Base URL from NEXT_PUBLIC_API_URL (fallback: '/api').
 * - Auto-attaches Bearer token from `wt_access` cookie (client-side).
 * - Parses JSON responses; throws ApiError on non-2xx.
 */

import {
  readAccessToken,
  readRefreshToken,
  writeAccessToken,
  writeRefreshToken,
} from '@/lib/auth-cookie';

export class ApiError extends Error {
  public readonly status: number;
  public readonly data: unknown;
  public readonly url: string;

  constructor(message: string, status: number, url: string, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.url = url;
    this.data = data;
  }
}

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

interface RequestOptions extends Omit<RequestInit, 'body' | 'method'> {
  body?: unknown;
  /** Override token (e.g. from server components reading cookies). */
  token?: string | null;
  /** Disable auth header entirely. */
  noAuth?: boolean;
  /** Query params appended to the URL. */
  query?: Record<string, string | number | boolean | null | undefined>;
}

function getBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL;
  if (fromEnv && fromEnv.length > 0) return fromEnv.replace(/\/$/, '');
  return '/api';
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const base = getBaseUrl();
  let p = path.startsWith('/') ? path : `/${path}`;
  // Strip a leading `/api` from the path if the base URL already ends
  // with `/api` — otherwise callers that write `/api/time-entries/active`
  // collide with a base like `http://host/api` producing `/api/api/...`.
  // Safe no-op when base is just `/api` and path starts with `/api/` —
  // we drop the duplicate.
  if (base.replace(/^https?:\/\/[^/]+/, '').replace(/\/$/, '') === '/api') {
    if (p === '/api' || p.startsWith('/api/')) {
      p = p.slice(4) || '/';
    }
  }
  const url = `${base}${p}`;
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    params.append(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

/**
 * Dedupe concurrent refreshes. If ten SWR calls fire simultaneously and all
 * 401 because the access token just expired, we want one network refresh,
 * not ten — otherwise the backend may rotate refresh tokens past us and
 * invalidate the session.
 */
let refreshInFlight: Promise<string | null> | null = null;

async function tryClientRefresh(): Promise<string | null> {
  if (typeof document === 'undefined') return null;
  if (refreshInFlight) return refreshInFlight;

  const refreshToken = readRefreshToken();
  if (!refreshToken) return null;

  refreshInFlight = (async () => {
    try {
      const url = buildUrl('/auth/refresh');
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ refreshToken }),
        credentials: 'include',
      });
      if (!res.ok) return null;
      const pair = (await res.json()) as {
        accessToken?: string;
        refreshToken?: string;
        expiresIn?: number;
      };
      if (!pair.accessToken) return null;
      writeAccessToken(pair.accessToken, pair.expiresIn ?? 60 * 60);
      if (pair.refreshToken) writeRefreshToken(pair.refreshToken);
      return pair.accessToken;
    } catch {
      return null;
    } finally {
      // Release the dedupe slot after the current microtask so peers see the
      // resolved token, then start fresh on the next 401.
      queueMicrotask(() => {
        refreshInFlight = null;
      });
    }
  })();

  return refreshInFlight;
}

async function request<T>(
  method: HttpMethod,
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, token, noAuth, query, headers, ...init } = options;
  const url = buildUrl(path, query);

  const buildHeaders = (accessToken: string | null): Headers => {
    const h = new Headers(headers);
    h.set('Accept', 'application/json');
    if (body !== undefined && !(body instanceof FormData)) {
      h.set('Content-Type', 'application/json');
    }
    if (!noAuth && accessToken) h.set('Authorization', `Bearer ${accessToken}`);
    return h;
  };

  let access = token ?? (typeof document !== 'undefined' ? readAccessToken() : null);

  let payload: BodyInit | undefined;
  if (body !== undefined) {
    payload = body instanceof FormData ? body : JSON.stringify(body);
  }

  let res = await fetch(url, {
    ...init,
    method,
    headers: buildHeaders(access),
    body: payload,
    credentials: init.credentials ?? 'include',
  });

  // One-shot refresh on 401 for authenticated requests. Skip if the caller
  // supplied an explicit token (they own the auth lifecycle) or disabled
  // auth, and skip the refresh endpoint itself to avoid recursion.
  if (
    res.status === 401 &&
    !noAuth &&
    !token &&
    !path.includes('/auth/refresh') &&
    !path.includes('/auth/logout')
  ) {
    const newAccess = await tryClientRefresh();
    if (newAccess) {
      access = newAccess;
      res = await fetch(url, {
        ...init,
        method,
        headers: buildHeaders(access),
        body: payload,
        credentials: init.credentials ?? 'include',
      });
    }
  }

  const contentType = res.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const data: unknown = isJson
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null);

  if (!res.ok) {
    let extracted: string | null = null;
    if (
      isJson &&
      data &&
      typeof data === 'object' &&
      'message' in data &&
      typeof (data as { message: unknown }).message === 'string'
    ) {
      extracted = (data as { message: string }).message;
    }
    const message = extracted ?? (res.statusText || `Request failed with status ${res.status}`);
    throw new ApiError(message, res.status, url, data);
  }

  return data as T;
}

export const api = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'body'>) =>
    request<T>('GET', path, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('POST', path, { ...options, body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PATCH', path, { ...options, body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PUT', path, { ...options, body }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>('DELETE', path, options),
};

export type Api = typeof api;
