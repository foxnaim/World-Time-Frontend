import { z } from 'zod';

/**
 * Payload sent from the Telegram WebApp / Mini App containing the signed
 * `initData` string that the backend validates via HMAC.
 */
export const TelegramVerifyRequestSchema = z.object({
  initData: z.string().min(1, 'initData is required'),
});
export type TelegramVerifyRequest = z.infer<typeof TelegramVerifyRequestSchema>;

/**
 * JWT pair returned after successful authentication. `expiresIn` is seconds
 * until the access token expires.
 */
export const AuthTokenPairSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  expiresIn: z.number().int().positive(),
});
export type AuthTokenPair = z.infer<typeof AuthTokenPairSchema>;

export const RefreshRequestSchema = z.object({
  refreshToken: z.string().min(1),
});
export type RefreshRequest = z.infer<typeof RefreshRequestSchema>;
