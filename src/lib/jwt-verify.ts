/**
 * Edge-compatible JWT verification using `jose`.
 *
 * The shared secret `JWT_PUBLIC_SECRET` MUST match the backend's `JWT_SECRET`
 * used to sign access tokens (HS256). In production, rotate via environment.
 *
 * Contract:
 *   - verifyAccessToken(token) resolves to { id, telegramId } on a valid,
 *     unexpired HS256 token whose payload contains those claims.
 *   - On any failure (bad signature, expired, malformed, missing claims,
 *     misconfigured secret) it resolves to `null` — never throws.
 *
 * This module is intentionally edge-runtime safe. It imports only `jose`
 * and uses Web Crypto primitives, so it can be called from
 * `src/middleware.ts` as well as RSC / Node runtimes.
 */

import { jwtVerify, type JWTPayload } from 'jose';

export interface VerifiedUser {
  id: string;
  telegramId: string;
}

let cachedSecretKey: Uint8Array | null = null;
let cachedSecretSource: string | null = null;

function getSecretKey(): Uint8Array | null {
  const secret = process.env.JWT_PUBLIC_SECRET;
  if (!secret || secret.length === 0) return null;
  if (cachedSecretKey && cachedSecretSource === secret) return cachedSecretKey;
  cachedSecretKey = new TextEncoder().encode(secret);
  cachedSecretSource = secret;
  return cachedSecretKey;
}

function extractUser(payload: JWTPayload): VerifiedUser | null {
  // Accept either `id` or `sub` for the user id; accept `telegramId` or
  // `telegram_id` (backend historically used both spellings).
  const rawId =
    (typeof payload.id === 'string' && payload.id) ||
    (typeof payload.sub === 'string' && payload.sub) ||
    null;
  const rawTg =
    (typeof (payload as Record<string, unknown>).telegramId === 'string' &&
      (payload as Record<string, string>).telegramId) ||
    (typeof (payload as Record<string, unknown>).telegram_id === 'string' &&
      (payload as Record<string, string>).telegram_id) ||
    (typeof (payload as Record<string, unknown>).telegramId === 'number' &&
      String((payload as Record<string, number>).telegramId)) ||
    (typeof (payload as Record<string, unknown>).telegram_id === 'number' &&
      String((payload as Record<string, number>).telegram_id)) ||
    null;

  if (!rawId || !rawTg) return null;
  return { id: rawId, telegramId: rawTg };
}

/**
 * Verify an HS256 access token.
 *
 * @returns { id, telegramId } if the token is cryptographically valid and
 * unexpired, otherwise `null`. Never throws.
 */
export async function verifyAccessToken(
  token: string | null | undefined,
): Promise<VerifiedUser | null> {
  if (!token || typeof token !== 'string') return null;
  const key = getSecretKey();
  if (!key) return null;

  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });
    return extractUser(payload);
  } catch {
    return null;
  }
}
