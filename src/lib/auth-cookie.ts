/**
 * Client-side cookie helpers for the WorkTime access/refresh tokens.
 *
 * Server code should read cookies via `next/headers`. These helpers are a
 * fallback for client components that need to attach a Bearer token.
 */

export const ACCESS_COOKIE = 'wt_access';
export const REFRESH_COOKIE = 'wt_refresh';

export type CookieOptions = {
  maxAge?: number; // seconds
  path?: string;
  sameSite?: 'strict' | 'lax' | 'none';
  secure?: boolean;
};

const DEFAULT_OPTS: Required<Pick<CookieOptions, 'path' | 'sameSite' | 'secure'>> = {
  path: '/',
  sameSite: 'lax',
  secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
};

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${encodeURIComponent(name)}=`));
  if (!match) return null;
  const [, ...rest] = match.split('=');
  try {
    return decodeURIComponent(rest.join('='));
  } catch {
    return null;
  }
}

function writeCookie(name: string, value: string, options: CookieOptions = {}): void {
  if (typeof document === 'undefined') return;
  const opts = { ...DEFAULT_OPTS, ...options };
  const parts: string[] = [
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
    `Path=${opts.path}`,
    `SameSite=${opts.sameSite[0].toUpperCase()}${opts.sameSite.slice(1)}`,
  ];
  if (typeof opts.maxAge === 'number') parts.push(`Max-Age=${opts.maxAge}`);
  if (opts.secure) parts.push('Secure');
  document.cookie = parts.join('; ');
}

function deleteCookie(name: string, path = '/'): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${encodeURIComponent(name)}=; Path=${path}; Max-Age=0`;
}

export function readAccessToken(): string | null {
  return readCookie(ACCESS_COOKIE);
}

export function readRefreshToken(): string | null {
  return readCookie(REFRESH_COOKIE);
}

export function writeAccessToken(token: string, maxAgeSec = 60 * 60): void {
  writeCookie(ACCESS_COOKIE, token, { maxAge: maxAgeSec });
}

export function writeRefreshToken(token: string, maxAgeSec = 60 * 60 * 24 * 30): void {
  writeCookie(REFRESH_COOKIE, token, { maxAge: maxAgeSec });
}

export function clearAuthCookies(): void {
  deleteCookie(ACCESS_COOKIE);
  deleteCookie(REFRESH_COOKIE);
}

export interface AuthTokenPair {
  accessToken: string;
  refreshToken: string;
  /** Access token lifetime in seconds (optional, defaults to 1h). */
  expiresIn?: number;
}

/**
 * Write both access + refresh tokens from an /auth response payload.
 * Mirrors the backend contract defined in `@worktime/types`.
 */
export function setAuthCookies(pair: AuthTokenPair): void {
  writeAccessToken(pair.accessToken, pair.expiresIn ?? 60 * 60);
  writeRefreshToken(pair.refreshToken);
}

/** Back-compat alias used by AuthGuard and legacy callers. */
export function readAuthCookie(): string | null {
  return readAccessToken();
}
