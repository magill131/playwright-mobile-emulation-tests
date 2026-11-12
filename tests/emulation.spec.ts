import { test, expect } from '@playwright/test';

// Sanity checks that each project really is the device it claims to be.
// If these fail, every other result in the suite is suspect.
test.describe('device emulation', () => {
  test('viewport, pixel ratio and user agent match the project', async ({ page }, testInfo) => {
    await page.goto('/');
    const info = await page.evaluate(() => ({
      width: window.innerWidth,
      dpr: window.devicePixelRatio,
      ua: navigator.userAgent,
    }));

    const expected = testInfo.project.use;
    expect(info.width).toBe(expected.viewport!.width);
    expect(info.dpr).toBe(expected.deviceScaleFactor);

    const name = testInfo.project.name;
    if (name === 'iphone-13') expect(info.ua).toContain('iPhone');
    if (name === 'pixel-7') expect(info.ua).toContain('Android');
    if (name === 'ipad-mini') expect(info.ua).toMatch(/iPad|Macintosh/);
    if (name === 'desktop-chrome') expect(info.ua).not.toMatch(/Mobile/);
  });

  test('touch is enabled only on touch devices', async ({ page, hasTouch, browserName }, testInfo) => {
    await page.goto('/');
    const points = await page.evaluate(() => navigator.maxTouchPoints);
    if (testInfo.project.name === 'desktop-chrome') {
      expect(hasTouch).toBe(false);
      expect(points).toBe(0);
    } else {
      expect(hasTouch).toBe(true);
      // WebKit reports maxTouchPoints as 0 even with touch enabled (found by the
      // first CI run), so only Chromium can be checked this way. Real touch input
      // on WebKit is covered by the tap-based tests in navigation and tasks specs.
      if (browserName === 'chromium') {
        expect(points).toBeGreaterThan(0);
      }
    }
  });
});
