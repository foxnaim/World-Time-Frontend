import { z } from 'zod';

/**
 * Public environment variables — available on the client.
 * Parsed once at import time; throws in dev if misconfigured.
 */
const publicSchema = z.object({
  NEXT_PUBLIC_API_URL: z
    .string()
    .url()
    .optional()
    .default('http://localhost:4000'),
  NEXT_PUBLIC_BOT_USERNAME: z
    .string()
    .min(1)
    .optional()
    .default('worktime_bot'),
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url()
    .optional()
    .default('http://localhost:3000'),
  // Optional default locale — read by the i18n helpers when no cookie or
  // Accept-Language match is present. Kept as a loose string so the i18n
  // module can validate it against the actual `LOCALES` tuple; that way
  // adding a locale here doesn't require touching this schema.
  NEXT_PUBLIC_DEFAULT_LOCALE: z.string().min(2).optional(),
});

const parsed = publicSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_BOT_USERNAME: process.env.NEXT_PUBLIC_BOT_USERNAME,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_DEFAULT_LOCALE: process.env.NEXT_PUBLIC_DEFAULT_LOCALE,
});

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error(
    '[WorkTime] Invalid public env vars:',
    parsed.error.flatten().fieldErrors,
  );
  throw new Error('Invalid public environment variables');
}

export const env = parsed.data;
export type PublicEnv = typeof env;
