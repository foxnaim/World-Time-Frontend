/**
 * Edge middleware: cryptographic gate for protected routes.
 *
 * Protected path groups:
 *   - /dashboard, /dashboard/*
 *   - /admin, /admin/*
 *
 * Exempt:
 *   - /office/*          (office terminal — separate device-pairing auth)
 *   - /api/auth/*        (login/refresh/logout endpoints)
 *   - /_next/*, static   (excluded via `matcher` below)
 *
 * Security:
 *   - We do NOT trust cookie presence. Every protected request
 *     cryptographically verifies the `wt_access` JWT via
 *     `verifyAccessToken` (HS256, `jose`, edge-compatible).
 *   - On verification failure we attempt a one-shot refresh against
 *     `/api/auth/refresh`, forwarding the `wt_refresh` cookie. On success
 *     we rewrite the access cookie via `Set-Cookie` on the response and
 *     let the request continue. On failure we redirect to /login?next=.
 *
 * Configuration:
 *   - `JWT_PUBLIC_SECRET` MUST match the backend's `JWT_SECRET`. For HS256
 *     this is a shared symmetric secret. Rotate via environment in
 *     production; a mismatch will cause every protected request to fall
 *     through to a refresh attempt and then a /login redirect.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt-verify';

const ACCESS_COOKIE = 'wt_access';
const REFRESH_COOKIE = 'wt_refresh';

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/admin',
  '/freelance',
  '/company',
  '/onboarding',
  '/profile',
] as const;

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * Apply security headers to every response produced by this middleware.
 *
 * These *supplement* the static headers declared in `next.config.ts`
 * (Next.js applies those to all routes). We set them here too so that
 * responses synthesized by the middleware itself — redirects, the
 * rewritten "refresh succeeded" response — carry the same baseline.
 *
 * Kept intentionally narrow: the full CSP / HSTS / Permissions-Policy set
 * lives in next.config.ts. Here we only set headers that matter on
 * redirects and short-lived auth responses.
 */
function applySecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set('X-Frame-Options', 'SAMEORIGIN');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return res;
}

function redirectToLogin(req: NextRequest): NextResponse {
  const { pathname, search } = req.nextUrl;
  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.search = '';
  url.searchParams.set('next', pathname + (search || ''));
  return applySecurityHeaders(NextResponse.redirect(url));
}

interface RefreshResult {
  accessToken: string;
  /** Raw Set-Cookie header(s) returned by the refresh endpoint, if any —
   *  we forward these verbatim so the backend controls cookie flags. */
  setCookies: string[];
  /** Fallback maxAge for the access cookie if we synthesize one. */
  maxAgeSec: number;
}

/**
 * Attempt a refresh using the `wt_refresh` cookie. Returns `null` on any
 * failure. The refresh endpoint is expected to either:
 *   - Return JSON `{ accessToken, expiresIn? }` (we set the cookie), OR
 *   - Set cookies directly via `Set-Cookie` headers on the response.
 */
async function tryRefresh(req: NextRequest): Promise<RefreshResult | null> {
  const refresh = req.cookies.get(REFRESH_COOKIE)?.value;
  if (!refresh) return null;

  const refreshUrl = new URL('/api/auth/refresh', req.nextUrl.origin);
  try {
    const res = await fetch(refreshUrl.toString(), {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: `${REFRESH_COOKIE}=${refresh}`,
      },
      body: JSON.stringify({}),
      // Don't let the edge runtime cache this.
      cache: 'no-store',
      redirect: 'manual',
    });
    if (!res.ok) return null;

    // Collect any Set-Cookie headers the backend already attached.
    const setCookies: string[] = [];
    // `getSetCookie` is available in modern edge/Node fetch responses.
    const g = (res.headers as unknown as { getSetCookie?: () => string[] }).getSetCookie;
    if (typeof g === 'function') {
      setCookies.push(...g.call(res.headers));
    } else {
      const raw = res.headers.get('set-cookie');
      if (raw) setCookies.push(raw);
    }

    let accessToken = '';
    let maxAgeSec = 60 * 60;
    try {
      const body = (await res.json()) as {
        accessToken?: string;
        access_token?: string;
        token?: string;
        expiresIn?: number;
        expires_in?: number;
      };
      accessToken = body.accessToken || body.access_token || body.token || '';
      const exp = body.expiresIn ?? body.expires_in;
      if (typeof exp === 'number' && exp > 0) maxAgeSec = exp;
    } catch {
      // body may be empty if the endpoint relies purely on Set-Cookie.
    }

    if (!accessToken && setCookies.length === 0) return null;
    return { accessToken, setCookies, maxAgeSec };
  } catch {
    return null;
  }
}

function applyRefreshCookies(res: NextResponse, r: RefreshResult): void {
  // Forward any Set-Cookie the backend already produced (preserves flags).
  for (const sc of r.setCookies) {
    res.headers.append('set-cookie', sc);
  }
  // If the backend returned only a JSON body, synthesize the access cookie.
  if (r.accessToken && r.setCookies.length === 0) {
    res.cookies.set({
      name: ACCESS_COOKIE,
      value: r.accessToken,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: r.maxAgeSec,
    });
  }
}

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  if (!isProtectedPath(pathname)) {
    return applySecurityHeaders(NextResponse.next());
  }

  const token = req.cookies.get(ACCESS_COOKIE)?.value;
  const user = await verifyAccessToken(token);
  if (user) return applySecurityHeaders(NextResponse.next());

  // Access token missing / expired / invalid — try a refresh.
  const refreshed = await tryRefresh(req);
  if (refreshed) {
    // Verify the new token before trusting it.
    const verified = refreshed.accessToken ? await verifyAccessToken(refreshed.accessToken) : null;

    // If we got a cookie directly from backend (no JSON body), we can't
    // verify without reparsing the Set-Cookie — trust the backend in that
    // narrow case since the cookie came over the server-to-server hop.
    const trustBackendSetCookie = !refreshed.accessToken && refreshed.setCookies.length > 0;

    if (verified || trustBackendSetCookie) {
      const res = NextResponse.next();
      applyRefreshCookies(res, refreshed);
      return applySecurityHeaders(res);
    }
  }

  return redirectToLogin(req);
}

export const config = {
  /*
   * Run on all routes EXCEPT:
   *   - /api/*           (API routes, incl. /api/auth/*)
   *   - /_next/static    (Next static files)
   *   - /_next/image     (Next image optimization)
   *   - /office/*        (office terminal — separate auth)
   *   - /favicon.ico and common static assets
   *
   * The middleware function itself narrows to protected paths.
   */
  matcher: [
    '/((?!api|_next/static|_next/image|office|favicon.ico|logo.svg|robots.txt|sitemap.xml).*)',
  ],
};
