import { test, expect } from '@playwright/test';
import { addTask, isNarrow } from './helpers';

// Rotating a phone to landscape crosses the 640px breakpoint, so the layout
// should switch from the hamburger menu to inline links without breaking.
test.describe('orientation change', () => {
  test('phone portrait -> landscape swaps hamburger for inline links', async ({ page, hasTouch }, testInfo) => {
    test.skip(!['iphone-13', 'pixel-7'].includes(testInfo.project.name), 'phones only');

    await page.goto('/');
    await addTask(page, 'Survives rotation', hasTouch);
    expect(isNarrow(page)).toBe(true);
    await expect(page.getByRole('button', { name: 'Toggle menu' })).toBeVisible();

    const { width, height } = page.viewportSize()!;
    await page.setViewportSize({ width: height, height: width });

    expect(isNarrow(page)).toBe(false);
    await expect(page.getByRole('button', { name: 'Toggle menu' })).toBeHidden();
    await expect(page.getByRole('link', { name: 'Done' })).toBeVisible();
    await expect(page.locator('#tasks li .label')).toHaveText(['Survives rotation']);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('landscape -> portrait brings the hamburger back', async ({ page }, testInfo) => {
    test.skip(!['iphone-13', 'pixel-7'].includes(testInfo.project.name), 'phones only');

    await page.goto('/');
    const { width, height } = page.viewportSize()!;
    await page.setViewportSize({ width: height, height: width });
    await expect(page.getByRole('button', { name: 'Toggle menu' })).toBeHidden();

    await page.setViewportSize({ width, height });
    await expect(page.getByRole('button', { name: 'Toggle menu' })).toBeVisible();
  });
});
