import { test as base, type BrowserContext, type Page } from '@playwright/test';

/**
 * A fake (but structurally valid) JWT used only for E2E tests. It is NEVER
 * verified by a real backend in these tests — outbound auth calls are stubbed
 * with `page.route` in the consumers.
 *
 * Header:  { "alg": "HS256", "typ": "JWT" }
 * Payload: { "sub": "e2e-user", "role": "owner", "exp": 9999999999 }
 * Signature: "e2e-signature" (not a real HMAC).
 */
export const FAKE_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
  '.eyJzdWIiOiJlMmUtdXNlciIsInJvbGUiOiJvd25lciIsImV4cCI6OTk5OTk5OTk5OX0' +
  '.ZTJlLXNpZ25hdHVyZQ';

export const WT_ACCESS_COOKIE_NAME = 'wt_access';

/**
 * Install the wt_access cookie on the given context for the given base URL.
 * Exposed separately so tests can reuse it when they build their own context.
 */
export async function setAuthCookie(
  context: BrowserContext,
  baseURL: string,
  token: string = FAKE_JWT,
): Promise<void> {
  const url = new URL(baseURL);
  await context.addCookies([
    {
      name: WT_ACCESS_COOKIE_NAME,
      value: token,
      domain: url.hostname,
      path: '/',
      httpOnly: false,
      secure: url.protocol === 'https:',
      sameSite: 'Lax',
      expires: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    },
  ]);
}

type AuthFixtures = {
  authedPage: Page;
};

/**
 * Playwright test fixture that pre-authenticates the page by installing a
 * `wt_access` cookie carrying a fake JWT. Use like:
 *
 *   import { test, expect } from './fixtures/auth';
 *   test('protected route', async ({ authedPage }) => { ... });
 */
export const test = base.extend<AuthFixtures>({
  authedPage: async ({ context, baseURL }, use) => {
    const effectiveBaseURL = baseURL ?? 'http://localhost:3000';
    await setAuthCookie(context, effectiveBaseURL, FAKE_JWT);
    const page = await context.newPage();
    await use(page);
    await page.close();
  },
});

export const expect = base.expect;
