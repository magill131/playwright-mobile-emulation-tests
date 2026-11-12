import { Locator, Page } from '@playwright/test';

export const MOBILE_BREAKPOINT = 640; // matches @media (max-width: 640px) in app/index.html

export function isNarrow(page: Page): boolean {
  const size = page.viewportSize();
  return !!size && size.width <= MOBILE_BREAKPOINT;
}

/** Tap on touch devices, click on desktop. */
export async function press(locator: Locator, hasTouch: boolean): Promise<void> {
  if (hasTouch) {
    await locator.tap();
  } else {
    await locator.click();
  }
}

export async function addTask(page: Page, text: string, hasTouch: boolean): Promise<void> {
  await page.getByLabel('New task').fill(text);
  await press(page.getByRole('button', { name: 'Add' }), hasTouch);
}
