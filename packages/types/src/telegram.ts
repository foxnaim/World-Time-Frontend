import { z } from 'zod';

/**
 * Payload parsed from a Telegram bot deep-link:
 *   https://t.me/<bot>?start=qr_<QR_TOKEN>
 *   https://t.me/<bot>?start=inv_<INVITE_TOKEN>
 * Exactly one of `qrToken` / `inviteToken` is set per interaction.
 */
export const BotContextPayloadSchema = z
  .object({
    qrToken: z.string().min(1).optional(),
    inviteToken: z.string().min(1).optional(),
  })
  .refine((d) => Boolean(d.qrToken) !== Boolean(d.inviteToken), {
    message: 'exactly one of qrToken or inviteToken must be set',
  });
export type BotContextPayload = z.infer<typeof BotContextPayloadSchema>;

/** Matches Telegram's `User` object returned from Bot API / Mini App initData. */
export const TelegramUserSchema = z.object({
  id: z.coerce.bigint(),
  is_bot: z.boolean().optional(),
  first_name: z.string(),
  last_name: z.string().optional(),
  username: z.string().optional(),
  language_code: z.string().optional(),
  is_premium: z.boolean().optional(),
  added_to_attachment_menu: z.boolean().optional(),
  allows_write_to_pm: z.boolean().optional(),
  photo_url: z.string().url().optional(),
});
export type TelegramUser = z.infer<typeof TelegramUserSchema>;
