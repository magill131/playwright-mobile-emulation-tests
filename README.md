# Playwright Mobile Emulation Tests

Responsive and mobile-behaviour tests for a small sample web app (**TaskBoard**), run against four device profiles with Playwright and TypeScript:

| Project | Device profile | Layout it exercises |
|---|---|---|
| `iphone-13` | iPhone 13 (390x664, DPR 3, touch) | narrow, hamburger menu |
| `pixel-7` | Pixel 7 (412x839, DPR 2.625, touch) | narrow, hamburger menu |
| `ipad-mini` | iPad Mini (768x1024, touch) | wide, inline links |
| `desktop-chrome` | Desktop Chrome (1280x720, mouse) | wide, inline links |

The app lives in `app/` and is served by a dependency-free Node server, so the suite needs no external site and runs the same offline and in CI.

## What is tested (18 test cases x 4 projects = 72 runs)

- **Emulation sanity** - viewport width, pixel ratio, user agent and touch support match the device. If these fail, nothing else can be trusted.
- **Responsive layout** - viewport meta tag, no horizontal scroll, hamburger menu only below the 640px breakpoint, every visible control at least 44x44 CSS px, 16px input font (stops iOS zooming on focus).
- **Navigation** - hamburger opens and closes with correct `aria-expanded`, choosing a filter closes it; inline links filter the list on wide screens.
- **Task flow** - add, empty and duplicate validation, complete, undo, delete, persistence across reload, long text wraps without breaking the layout.
- **Orientation** - rotating a phone to landscape crosses the breakpoint and swaps the hamburger for inline links without losing state; rotating back restores it.

Tests that only make sense at one width skip themselves on the other, so the 72 runs report as 62 passed and 10 skipped by design.

## Results

Local run, with the system Chrome (Chromium) standing in for every device: **62 passed, 10 skipped, 0 failed** (typecheck clean).

I also broke the app five ways to confirm the suite can fail. Each bug was caught:

| Deliberate bug | Caught by |
|---|---|
| Removed the viewport meta tag | emulation, meta-tag, menu and orientation tests |
| Shrunk task buttons to 30px | 44px tap-target test (all 4 projects) |
| Forced the page 900px wide | horizontal-scroll test |
| Menu stays open after choosing a filter | navigation filter test |
| Removed the duplicate-task check | duplicate-task test |

**WebKit:** the first GitHub Actions run executed the iPhone and iPad projects on real WebKit. Everything passed except one assertion: `navigator.maxTouchPoints` is 0 on WebKit even with touch enabled, so that check now runs on Chromium only. Touch on WebKit is still proven by the tap-based tests.

**This is emulation, not real devices.** It checks layout, touch input and breakpoints. It does not cover real iOS Safari or Android Chrome quirks, native gestures or hardware. Real-device coverage would need Appium or a device cloud.

## Run it

```bash
npm ci
npx playwright install chromium webkit
npm test
npx playwright show-report
```

Without Playwright's browser downloads, point at an installed Chrome instead (every project then runs on that Chromium):

```bash
LOCAL_CHROME=/usr/bin/google-chrome npm run test:local
```

## Layout

```
app/                 sample app (index.html) and static server
tests/               specs and helpers
playwright.config.ts device projects and web server
.github/workflows/   CI (typecheck, install browsers, run, upload report)
```
