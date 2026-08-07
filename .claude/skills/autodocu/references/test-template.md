# Playwright test template & helpers

Concrete skeletons for the files autodocu generates. Adapt locators to the app; keep the helpers verbatim.

## Layout

`AUTODOCU/Tests` stays clean — per-section spec folders + the `run_test.sh`
runner and its `.env` + one `Scripts/` folder holding all the machinery + `README.md`:

```
AUTODOCU/Tests/
  README.md
  run_test.sh                          # generic one-command runner (diffs screenshots + writes report)
  .env                                 # tunable harness settings (sourced by run_test.sh)
  Scripts/                             # the machinery the runner drives
    compare_report.mjs                 #   pixel-diff + writes test_report.md (generic, Node)
    app_control.sh                     #   app start/stop + URL (app-specific; build generates it)
    playwright/                        #   self-contained npm project — run Playwright from here
      package.json  package-lock.json
      playwright.config.ts  _helpers.ts  .gitignore
      node_modules/  .pw-artifacts/      # (gitignored)
  <n.section_slug>/<slug>.spec.ts      # imports '../Scripts/playwright/_helpers'
```

`init` lays down `Scripts/playwright/{package.json, playwright.config.ts, _helpers.ts, .gitignore}`, `Scripts/compare_report.mjs`, `Scripts/app_control.sh` (placeholder), `run_test.sh`, `.env`, and `Tests/README.md` from the template; `build` fills in the config's `baseURL`/`viewport`, generates `Scripts/app_control.sh`, and generates the per-section specs.

**Module resolution:** the specs live two levels *above* `Scripts/playwright/node_modules`, so Node's normal walk can't find `@playwright/test`. The `Scripts/playwright/package.json` `test` script sets `NODE_PATH="$PWD/node_modules"` to fix that — so run tests with **`npm test`** from inside `Scripts/playwright/` (or prefix `NODE_PATH="$PWD/node_modules" npx playwright test`).

## `AUTODOCU/Tests/Scripts/playwright/package.json`

The isolated npm project. Its only dependency is `@playwright/test`, so installing it never touches the app's root manifests.

```json
{
  "name": "autodocu-tests",
  "version": "1.0.0",
  "private": true,
  "description": "Isolated Playwright workspace for AUTODOCU.",
  "scripts": {
    "test": "NODE_PATH=\"$PWD/node_modules\" playwright test",
    "install-browsers": "playwright install chromium"
  },
  "devDependencies": {
    "@playwright/test": "^1.62.1"
  }
}
```

Install once (from inside the folder — this creates `AUTODOCU/Tests/Scripts/playwright/node_modules` only):

```bash
cd AUTODOCU/Tests/Scripts/playwright && npm install && npm run install-browsers
```

## `AUTODOCU/Tests/Scripts/playwright/playwright.config.ts`

`baseURL` and `viewport` come from the Outline `# Run` section. `testDir` is `../..` (the Tests folder, two levels up), so it finds `<section>/*.spec.ts`. `outputDir` is scratch only — real screenshots are written by explicit path into the Documentation tree.

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '../..',
  testIgnore: ['**/node_modules/**', '**/.pw-artifacts/**', '**/.playwright-cli/**'],
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

## Shared helpers — `AUTODOCU/Tests/Scripts/playwright/_helpers.ts`

```ts
import { Page, Locator } from '@playwright/test';
import * as path from 'path';

// _helpers.ts lives in AUTODOCU/Tests/Scripts/playwright, so Documentation is three levels up.
// (run_test.sh sets AUTODOCU_SHOT_ROOT to redirect captures to a temp dir for diffing.)
const DOC_ROOT = process.env.AUTODOCU_SHOT_ROOT
  ? path.resolve(process.env.AUTODOCU_SHOT_ROOT)
  : path.resolve(__dirname, '..', '..', '..', 'Documentation');

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

One `test` per section folder. Note the helper import path `../Scripts/playwright/_helpers`. Walk the Outline `# Sections` steps top to bottom; the screenshot name = heading slug + running index so Phase 3 can locate each image under its heading.

```ts
import { test } from '@playwright/test';
import { highlight, clearHighlights, shot } from '../Scripts/playwright/_helpers';

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

Always run from inside the workspace so all scratch stays there:

```bash
# app must be up first (build launches it per the Run section, then stops it after)
cd AUTODOCU/Tests/Scripts/playwright
npm test -- 1.exploring_a_single_standard_concept   # a single section
npm test                                             # all sections
```

`npm test` sets `NODE_PATH` and needs no `--config` flag (the config is in the current dir).

## Resolving locators

When a locator in the Outline is described in words (e.g. "the List selector in the left area"), attach `playwright-cli` to the running app and inspect the snapshot to find the real selector, then bake it into the spec. Run it **from inside `AUTODOCU/Tests/Scripts/playwright`** so its `.playwright-cli/` dumps stay inside the (gitignored) workspace:

```bash
cd AUTODOCU/Tests/Scripts/playwright
playwright-cli open http://localhost:8563/
playwright-cli find "List"
playwright-cli snapshot
```

Refs like `e14` from a snapshot are snapshot-specific — resolve them to a stable locator (role/text, or a real `id`/class you read with `playwright-cli eval`) before baking into the spec.
