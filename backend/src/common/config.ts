import { z } from 'zod';

const isProd = process.env.NODE_ENV === 'production';

// Secrets that must be present (non-empty) when running in production.
// If NODE_ENV === 'production' and any of these are missing from the raw
// config, we hard-fail before schema parsing so a misconfigured env can
// never silently fall through to dev placeholder secrets.
const REQUIRED_IN_PROD = [
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'QR_HMAC_SECRET',
  'TELEGRAM_BOT_TOKEN',
  'DATABASE_URL',
  'REDIS_URL',
  'WEB_URL',
] as const;

// Accept empty strings from .env.example placeholders in dev; require in prod.
const devOrProdString = (minLen: number) =>
  isProd ? z.string().min(minLen) : z.string().optional().default('');

const devOrProdUrl = () => (isProd ? z.string().url() : z.string().min(1));

// SENTRY_DSN: accept empty/unset OR a valid URL. Never fail dev on this.
const optionalUrl = z
  .string()
  .optional()
  .transform((v) => (v && v.trim().length > 0 ? v : undefined))
  .pipe(z.string().url().optional());

export const appConfigSchema = z.object({
  DATABASE_URL: devOrProdUrl(),
  REDIS_URL: devOrProdUrl(),
  TELEGRAM_BOT_TOKEN: devOrProdString(1),
  // TODO: when switching to webhook mode, change this to z.string().min(1) and
  // wire it into TelegrafModule via the `secretToken` option so that Telegram's
  // X-Telegram-Bot-Api-Secret-Token header is validated on every inbound update.
  TELEGRAM_WEBHOOK_SECRET: z.string().optional(),
  JWT_SECRET: devOrProdString(16),
  JWT_ACCESS_SECRET: z.string().optional(),
  JWT_REFRESH_SECRET: devOrProdString(16),
  QR_HMAC_SECRET: devOrProdString(16),
  API_PORT: z.coerce.number().int().positive().default(4000),
  WEB_URL: devOrProdUrl(),
  GOOGLE_SERVICE_ACCOUNT_JSON: z.string().optional(),
  GOOGLE_OAUTH_CLIENT_ID: z.string().optional(),
  GOOGLE_OAUTH_CLIENT_SECRET: z.string().optional(),
  GOOGLE_OAUTH_REDIRECT_URI: z.string().optional(),
  APP_URL: z.string().optional(),
  SENTRY_DSN: optionalUrl,
  METRICS_TOKEN: z.string().optional(),
  DISPLAY_KEYS: z.string().optional().default('{}'),
});

export type AppConfig = z.infer<typeof appConfigSchema>;

function findMissingProdSecrets(config: Record<string, unknown>): string[] {
  return REQUIRED_IN_PROD.filter((key) => {
    const v = config[key];
    return typeof v !== 'string' || v.trim().length === 0;
  });
}

export function validate(config: Record<string, unknown>): AppConfig {
  // Hard fail in production if any required secret is missing from the raw
  // config. This runs BEFORE schema parsing so the error is clear and
  // actionable, and it protects against NODE_ENV=development being set in
  // a real production environment (CI misconfig, container default, etc.).
  if (process.env.NODE_ENV === 'production') {
    const missing = findMissingProdSecrets(config);
    if (missing.length > 0) {
      throw new Error(
        `Missing required env in production: ${missing.join(', ')}`,
      );
    }
  }

  const parsed = appConfigSchema.safeParse(config);
  if (!parsed.success) {
    // In prod, surface any missing/empty required secrets together with a
    // friendlier message before falling back to the generic zod issue list.
    if (process.env.NODE_ENV === 'production') {
      const missingFromIssues = Array.from(
        new Set(
          parsed.error.issues
            .filter((i) => i.path.length > 0)
            .map((i) => String(i.path[0]))
            .filter((k) => (REQUIRED_IN_PROD as readonly string[]).includes(k)),
        ),
      );
      if (missingFromIssues.length > 0) {
        throw new Error(
          `Missing required env in production: ${missingFromIssues.join(', ')}`,
        );
      }
    }
    const issues = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`Invalid environment configuration: ${issues}`);
  }

  const data = parsed.data;

  // Dev-only fallbacks so backend can boot without real secrets.
  if (!isProd) {
    if (!data.JWT_SECRET) data.JWT_SECRET = 'dev-jwt-secret-change-me-please-32b';
    if (!data.JWT_ACCESS_SECRET) data.JWT_ACCESS_SECRET = data.JWT_SECRET;
    if (!data.JWT_REFRESH_SECRET) data.JWT_REFRESH_SECRET = 'dev-jwt-refresh-change-me-please-32b';
    if (!data.QR_HMAC_SECRET) data.QR_HMAC_SECRET = 'dev-qr-hmac-change-me-please-32b-ok';
    if (!data.TELEGRAM_BOT_TOKEN) data.TELEGRAM_BOT_TOKEN = '';
    if (!data.DATABASE_URL)
      data.DATABASE_URL = 'postgres://worktime:worktime@localhost:5432/worktime';
    if (!data.REDIS_URL) data.REDIS_URL = 'redis://localhost:6379';
    if (!data.WEB_URL) data.WEB_URL = 'http://localhost:3000';
  }

  return data;
}
