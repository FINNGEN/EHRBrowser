# Playwright test template & helpers

Concrete skeletons for the files autodocu generates. Adapt locators to the app; keep the helpers verbatim.

## `AUTODOCU/playwright.config.ts`

`baseURL` and `viewport` come from the Outline `# Run` section. `outputDir` is scratch only — real screenshots are written by explicit path into the Documentation tree.

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './Tests',
  outputDir: './.pw-artifacts',
  fullyParallel: false,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:8563/',   // <-- from Outline # Run
    viewport: { width: 1280, height: 800 }, // <-- window size from # Run (default 1280x800)
    headless: true,
  },
});
```

## Shared helpers — `AUTODOCU/Tests/_helpers.ts`

```ts
import { Page, Locator } from '@playwright/test';
import * as path from 'path';

const DOC_ROOT = path.resolve(__dirname, '..', 'Documentation');

// Draw a red box around an element (the `highlight` keyword).
// Override style via the `style` arg when the Outline's
// "Documentation instruction" section asks for something else.
export async function highlight(
  page: Page,
  target: Locator,
  style = 'outline: 3px solid red; outline-offset: 2px;',
) {
  await target.scrollIntoViewIfNeeded();
  await target.evaluate((el, s) => {
    (el as HTMLElement).setAttribute('data-autodocu-hl', '1');
    (el as HTMLElement).style.cssText += ';' + s;
  }, style);
}

export async function clearHighlights(page: Page) {
  await page.evaluate(() => {
    document.querySelectorAll('[data-autodocu-hl]').forEach((el) => {
      (el as HTMLElement).style.outline = '';
      el.removeAttribute('data-autodocu-hl');
    });
  });
}

// Capture a screenshot (the `take-screenshot` keyword) into
// Documentation/<section>/screenshots/<name>.png
export async function shot(page: Page, section: string, name: string) {
  const file = path.join(DOC_ROOT, section, 'screenshots', `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
}
```

> Prefer the CSS-outline highlight above (survives the screenshot cleanly). If the Outline asks for an overlay box instead of an outline, inject an absolutely-positioned `div` over the element's bounding rect in `highlight`.

## Per-section spec — `AUTODOCU/Tests/<section>/<slug>.spec.ts`

One `test` per section folder. Walk the Outline `# Sections` steps top to bottom; the screenshot name = heading slug + running index so Phase 3 can locate each image under its heading.

```ts
import { test } from '@playwright/test';
import { highlight, clearHighlights, shot } from '../_helpers';

const SECTION = '1.exploring_a_single_standard_concept'; // must equal the folder name

test('exploring a single standard concept', async ({ page }) => {
  await page.goto('/');                       // baseURL from config

  // ## Searching for a concept
  await page.getByPlaceholder('Search concept').fill('Asthma');
  const item = page.getByText('Asthma', { exact: false }).first();
  await item.hover();
  await highlight(page, item);                // `highlight`
  await shot(page, SECTION, '01-searching-for-a-concept'); // `take-screenshot`
  await clearHighlights(page);
  await item.click();
  await page.waitForLoadState('networkidle');

  // ## The concept view
  await shot(page, SECTION, '02-the-concept-view');

  // ### Hierarchy view
  const listSelector = page.getByRole('button', { name: 'List' });
  await highlight(page, listSelector);
  await shot(page, SECTION, '03-hierarchy-view');
  await clearHighlights(page);

  // ### Time view
  const timePlot = page.locator('#time-plot');   // resolve the real selector against the live app
  await highlight(page, timePlot);
  await shot(page, SECTION, '04-time-view');
  await clearHighlights(page);
});
```

## Running

```bash
# app must be up first (Phase 2 launches it per the Run section, then stops it after)
PLAYWRIGHT_HTML_OPEN=never npx playwright test 1.exploring_a_single_standard_concept \
  --config=AUTODOCU/playwright.config.ts
```

## Resolving locators

When a locator in the Outline is described in words (e.g. "the List selector in the left area"), attach `playwright-cli` to the running app and inspect the snapshot to find the real selector, then bake it into the spec:

```bash
playwright-cli open http://localhost:8563/
playwright-cli find "List"
playwright-cli snapshot --depth=6
```
