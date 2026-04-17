import { expect, test } from '@playwright/test';

test.describe('Office QR page', () => {
  test('mock QR renders, live clock shows HH:MM, Dial countdown present', async ({
    page,
  }) => {
    await page.route('**/api/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, org: 'demo-company' }),
      });
    });

    await page.goto('/office/demo-company/qr?key=test');

    // Mock QR SVG should be rendered (either aria-labelled QR or a grid svg).
    const qrSvg = page
      .locator(
        'svg[aria-label*="QR" i], svg[role="img"][aria-label*="QR" i], [data-testid*="qr" i] svg, [data-testid*="qr" i]',
      )
      .first();
    await expect(qrSvg).toBeVisible();

    // The mock QR should have a grid of cells (rects / modules).
    const cells = page.locator(
      'svg rect, [data-testid*="qr-cell" i], [data-testid*="qr" i] rect',
    );
    expect(await cells.count()).toBeGreaterThan(4);

    // Live clock shows HH:MM.
    const clock = page
      .locator(
        '[data-testid*="clock" i], [aria-label*="clock" i], [aria-label*="time" i]',
      )
      .first();
    await expect(clock).toBeVisible();
    await expect(clock).toHaveText(/\b\d{2}:\d{2}\b/);

    // Dial countdown present.
    const dial = page
      .locator(
        '[data-testid*="dial" i], [aria-label*="dial" i], [data-testid*="countdown" i], [aria-label*="countdown" i]',
      )
      .first();
    await expect(dial).toBeVisible();
  });
});
