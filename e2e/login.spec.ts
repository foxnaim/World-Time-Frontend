import { expect, test } from '@playwright/test';

test.describe('Login code flow', () => {
  test('submit is disabled until 6 digits; posts to /auth/telegram/bot-login', async ({
    page,
  }) => {
    let botLoginCalled = false;
    let botLoginPayload: unknown = null;

    // Intercept the bot-login endpoint so we can assert the request
    // without a live backend.
    await page.route('**/auth/telegram/bot-login', async (route) => {
      botLoginCalled = true;
      try {
        botLoginPayload = route.request().postDataJSON();
      } catch {
        botLoginPayload = route.request().postData();
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          access: 'fake.jwt.token',
          refresh: 'fake.refresh.token',
        }),
      });
    });

    // Stub any other API calls to keep the page deterministic.
    await page.route('**/api/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      });
    });

    await page.goto('/login');

    const group = page.getByRole('group').first();
    await expect(group).toBeVisible();

    const boxes = group.getByRole('textbox');
    await expect(boxes).toHaveCount(6);

    const submit = page
      .getByRole('button', { name: /sign in|log ?in|enter|submit|continue/i })
      .first();
    await expect(submit).toBeVisible();
    await expect(submit).toBeDisabled();

    // Type the 6-digit code (all zeros).
    await boxes.first().focus();
    await page.keyboard.type('000000');

    for (let i = 0; i < 6; i++) {
      await expect(boxes.nth(i)).toHaveValue('0');
    }

    // Now that all 6 digits are filled, submit should be enabled.
    await expect(submit).toBeEnabled();

    await submit.click();

    // Expect the login request to have been dispatched.
    await expect
      .poll(() => botLoginCalled, { timeout: 5_000 })
      .toBe(true);

    // Payload should carry the code the user typed.
    if (typeof botLoginPayload === 'object' && botLoginPayload !== null) {
      const asObj = botLoginPayload as Record<string, unknown>;
      const code = (asObj.code ?? asObj.otp ?? asObj.token) as
        | string
        | undefined;
      if (code !== undefined) {
        expect(String(code)).toBe('000000');
      }
    } else if (typeof botLoginPayload === 'string') {
      expect(botLoginPayload).toContain('000000');
    }
  });
});
