import { defineConfig, devices } from '@playwright/test';

// Local runs in a sandbox without Playwright's browser downloads can set
// LOCAL_CHROME=/path/to/chrome. Every project then runs on that Chromium build
// with the same device viewport, touch, scale factor and user agent.
// In CI (no LOCAL_CHROME) iPhone and iPad projects run on real WebKit.
const localChrome = process.env.LOCAL_CHROME;

function device(name: keyof typeof devices) {
  const d = { ...devices[name] };
  if (localChrome) {
    return {
      ...d,
      browserName: 'chromium' as const,
      defaultBrowserType: 'chromium' as const,
      launchOptions: { executablePath: localChrome, args: ['--no-sandbox'] },
    };
  }
  return d;
}

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'node app/server.js',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'iphone-13', use: device('iPhone 13') },
    { name: 'pixel-7', use: device('Pixel 7') },
    { name: 'ipad-mini', use: device('iPad Mini') },
    {
      name: 'desktop-chrome',
      use: localChrome
        ? { ...devices['Desktop Chrome'], launchOptions: { executablePath: localChrome, args: ['--no-sandbox'] } }
        : { ...devices['Desktop Chrome'] },
    },
  ],
});
