import { test, expect } from '@playwright/test';
import { addTask, press } from './helpers';

test.describe('task flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('adds a task and updates the counter', async ({ page, hasTouch }) => {
    await expect(page.locator('#count')).toHaveText('0 tasks, 0 open');
    await addTask(page, 'Write release notes', hasTouch);
    await expect(page.locator('#tasks li .label')).toHaveText(['Write release notes']);
    await expect(page.locator('#count')).toHaveText('1 task, 1 open');
    await expect(page.getByLabel('New task')).toHaveValue('');
  });

  test('rejects an empty task', async ({ page, hasTouch }) => {
    await addTask(page, '   ', hasTouch);
    await expect(page.getByRole('alert')).toHaveText('Task cannot be empty');
    await expect(page.locator('#tasks li')).toHaveCount(0);
  });

  test('rejects a duplicate task regardless of case', async ({ page, hasTouch }) => {
    await addTask(page, 'Buy milk', hasTouch);
    await addTask(page, 'BUY MILK', hasTouch);
    await expect(page.getByRole('alert')).toHaveText('Task already exists');
    await expect(page.locator('#tasks li')).toHaveCount(1);
  });

  test('completes, undoes and deletes a task', async ({ page, hasTouch }) => {
    await addTask(page, 'Pack bag', hasTouch);

    await press(page.getByRole('button', { name: 'Complete Pack bag' }), hasTouch);
    await expect(page.locator('#tasks li')).toHaveClass(/done/);
    await expect(page.locator('#count')).toHaveText('1 task, 0 open');

    await press(page.getByRole('button', { name: 'Undo Pack bag' }), hasTouch);
    await expect(page.locator('#tasks li')).not.toHaveClass(/done/);

    await press(page.getByRole('button', { name: 'Delete Pack bag' }), hasTouch);
    await expect(page.locator('#tasks li')).toHaveCount(0);
  });

  test('tasks survive a reload', async ({ page, hasTouch }) => {
    await addTask(page, 'Persist me', hasTouch);
    await page.reload();
    await expect(page.locator('#tasks li .label')).toHaveText(['Persist me']);
  });

  test('a very long task wraps instead of causing horizontal scroll', async ({ page, hasTouch }) => {
    await addTask(page, 'x'.repeat(80), hasTouch);
    await expect(page.locator('#tasks li')).toHaveCount(1);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    // Delete button must still be on screen.
    const box = await page.getByRole('button', { name: /^Delete x+/ }).boundingBox();
    const width = page.viewportSize()!.width;
    expect(box!.x + box!.width).toBeLessThanOrEqual(width);
  });
});
