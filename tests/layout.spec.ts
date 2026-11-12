import { test, expect } from '@playwright/test';
import { isNarrow } from './helpers';

test.describe('responsive layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('declares a mobile viewport meta tag', async ({ page }) => {
    const content = await page.locator('meta[name=viewport]').getAttribute('content');
    expect(content).toContain('width=device-width');
    expect(content).toContain('initial-scale=1');
  });

  test('page does not scroll horizontally', async ({ page }) => {
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('menu button shows only on narrow screens', async ({ page }) => {
    const toggle = page.getByRole('button', { name: 'Toggle menu' });
    if (isNarrow(page)) {
      await expect(toggle).toBeVisible();
      await expect(page.getByRole('link', { name: 'Active' })).toBeHidden();
    } else {
      await expect(toggle).toBeHidden();
      for (const name of ['All', 'Active', 'Done']) {
        await expect(page.getByRole('link', { name })).toBeVisible();
      }
    }
  });

  test('visible controls are at least 44x44 CSS px', async ({ page }) => {
    // Add one task so the per-task buttons are measured too.
    await page.getByLabel('New task').fill('Measure me');
    await page.getByRole('button', { name: 'Add' }).click();

    const controls = page.locator('button:visible, input[type=text]:visible, nav a:visible');
    const count = await controls.count();
    expect(count).toBeGreaterThan(3);

    const tooSmall: string[] = [];
    for (let i = 0; i < count; i++) {
      const box = await controls.nth(i).boundingBox();
      const label = (await controls.nth(i).getAttribute('aria-label')) ?? (await controls.nth(i).innerText());
      if (box && (box.width < 44 || box.height < 44)) {
        tooSmall.push(`${label.trim() || 'control'} (${Math.round(box.width)}x${Math.round(box.height)})`);
      }
    }
    expect(tooSmall, `controls under 44px: ${tooSmall.join(', ')}`).toEqual([]);
  });

  test('text input uses 16px font so iOS does not zoom on focus', async ({ page }) => {
    const size = await page.getByLabel('New task').evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(size).toBeGreaterThanOrEqual(16);
  });
});
