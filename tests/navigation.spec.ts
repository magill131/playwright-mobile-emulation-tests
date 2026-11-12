import { test, expect } from '@playwright/test';
import { addTask, isNarrow, press } from './helpers';

test.describe('navigation menu', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('narrow: menu starts closed, opens and closes with the button', async ({ page, hasTouch }) => {
    test.skip(!isNarrow(page), 'hamburger menu only exists on narrow screens');
    const toggle = page.getByRole('button', { name: 'Toggle menu' });
    const nav = page.getByRole('navigation', { name: 'Main' });

    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(nav).toBeHidden();

    await press(toggle, hasTouch);
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(nav).toBeVisible();

    await press(toggle, hasTouch);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(nav).toBeHidden();
  });

  test('narrow: choosing a filter closes the menu and filters the list', async ({ page, hasTouch }) => {
    test.skip(!isNarrow(page), 'hamburger menu only exists on narrow screens');
    await addTask(page, 'Open item', hasTouch);
    await addTask(page, 'Finished item', hasTouch);
    await press(page.getByRole('button', { name: 'Complete Finished item' }), hasTouch);

    await press(page.getByRole('button', { name: 'Toggle menu' }), hasTouch);
    await press(page.getByRole('link', { name: 'Done' }), hasTouch);

    await expect(page.getByRole('navigation', { name: 'Main' })).toBeHidden();
    await expect(page.locator('#tasks li')).toHaveCount(1);
    await expect(page.locator('#tasks li .label')).toHaveText('Finished item');
  });

  test('wide: links are always visible and filter the list', async ({ page, hasTouch }) => {
    test.skip(isNarrow(page), 'inline navigation only exists on wide screens');
    await addTask(page, 'Open item', hasTouch);
    await addTask(page, 'Finished item', hasTouch);
    await press(page.getByRole('button', { name: 'Complete Finished item' }), hasTouch);

    await press(page.getByRole('link', { name: 'Active' }), hasTouch);
    await expect(page.locator('#tasks li .label')).toHaveText(['Open item']);

    await press(page.getByRole('link', { name: 'All' }), hasTouch);
    await expect(page.locator('#tasks li')).toHaveCount(2);
  });
});
