import { expect, test } from '@playwright/test';

test.describe('Landing page', () => {
  test('shows WORKTIME serif hero heading and navigation', async ({ page }) => {
    await page.goto('/');

    // Hero section is the first section on the page.
    const hero = page.locator('section').first();
    await expect(hero).toBeVisible();

    // Serif "WORKTIME" heading should be prominently visible.
    const heading = page
      .getByRole('heading', { name: /WORKTIME/i })
      .first();
    await expect(heading).toBeVisible();

    // The heading (or a parent) should use the serif font family.
    // We assert the token class or font-family matches editorial serif.
    const fontFamily = await heading.evaluate((el) =>
      getComputedStyle(el).fontFamily,
    );
    expect(fontFamily).toMatch(/serif/i);

    // Top-level navigation should expose at least one link.
    const nav = page.getByRole('navigation').first();
    await expect(nav).toBeVisible();
    const navLinks = nav.getByRole('link');
    expect(await navLinks.count()).toBeGreaterThan(0);

    // Scrolling should reveal additional sections (framer-motion reveal).
    const sections = page.locator('section');
    const initialCount = await sections.count();
    expect(initialCount).toBeGreaterThan(0);

    // Scroll to bottom and wait for reveal animations to settle.
    await page.evaluate(() =>
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' as ScrollBehavior }),
    );
    // Give reveal transitions a beat to complete.
    await page.waitForTimeout(600);

    // After scrolling, the last section should be visible in the viewport.
    const lastSection = sections.last();
    await expect(lastSection).toBeVisible();
  });
});
