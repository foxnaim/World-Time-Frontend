import { expect, test } from '@playwright/test';

test.describe('Dashboard auth guard', () => {
  test('redirects to /login?next=... when wt_access cookie is missing', async ({
    browser,
  }) => {
    // Fresh, cookieless context to guarantee the guard fires.
    const context = await browser.newContext();
    const page = await context.newPage();

    // Stub session/bootstrap API calls so the guard sees "unauthenticated".
    await page.route('**/api/**', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false, error: 'unauthenticated' }),
      });
    });

    const target = '/dashboard/company/demo';
    const response = await page.goto(target, { waitUntil: 'load' });
    expect(response).not.toBeNull();

    await page.waitForURL(/\/login(\?.*)?$/, { timeout: 10_000 });

    const finalUrl = new URL(page.url());
    expect(finalUrl.pathname).toBe('/login');

    const next = finalUrl.searchParams.get('next');
    expect(next).not.toBeNull();
    // ?next=... should point back at the dashboard path we tried to visit.
    expect(next!).toContain('/dashboard/company/demo');

    await context.close();
  });
});
