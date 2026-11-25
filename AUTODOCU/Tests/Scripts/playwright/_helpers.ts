import { Page, Locator } from '@playwright/test';
import * as path from 'path';

// Where `shot` writes. Normally Documentation/ (three levels up from this file:
// Tests/Scripts/playwright -> Tests/Scripts -> Tests -> AUTODOCU).
// run_test.sh sets AUTODOCU_SHOT_ROOT to a temp folder so it can diff the fresh
// captures against the committed images before deciding to replace them.
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

// Wait until the viewport stops changing, so a screenshot is never taken while
// something is still animating.
//
// WHY THIS EXISTS: charts in this kind of app fade/grow in (an opacity or path
// transition). If you screenshot before the animation settles, the fill renders
// at a partial opacity — and because the *timing* of the capture varies run to
// run, two visually-identical runs disagree over the whole filled area by a
// small-but-real amount (e.g. ~20/255 across ~8% of the frame). No pixel-delta
// tolerance can absorb that without also going blind to genuine changes; the
// only real fix is to capture a settled frame. So we poll: grab the viewport,
// wait `interval`, grab again, and consider the page stable once two
// consecutive frames are byte-identical (Chromium's PNG encoding is
// deterministic for identical pixels). Bounded by `timeout` so a page with a
// perpetual animation (spinner, blinking element) still proceeds.
export async function waitForStable(
  page: Page,
  { interval = 250, timeout = 8000, settleFrames = 2 } = {},
) {
  const deadline = Date.now() + timeout;
  let prev = await page.screenshot({ fullPage: false });
  let stable = 1; // the first frame counts as one stable observation
  while (Date.now() < deadline) {
    await page.waitForTimeout(interval);
    const cur = await page.screenshot({ fullPage: false });
    if (cur.equals(prev)) {
      if (++stable >= settleFrames) return;
    } else {
      stable = 1;
    }
    prev = cur;
  }
}

// Capture a screenshot (the `take-screenshot` keyword) into
// Documentation/<section>/screenshots/<name>.png. Waits for the page to stop
// animating first so captures are reproducible run to run (see waitForStable).
export async function shot(page: Page, section: string, name: string) {
  await waitForStable(page);
  const file = path.join(DOC_ROOT, section, 'screenshots', `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
}

// Count type control in the header. On a narrow header (expanded search with
// < 500px to spare) the toggle (#counts-toggle) is hidden and a dropdown
// (#counts-dropdown, opened via #header-counts) is shown instead.
// Scoped to #counts-toggle because the graph has its own #prevalence-toggle.
export type CountType = 'record' | 'person' | 'prevalence' | 'incidence' | 'measurement';

// The visible control for a count type: its toggle button, or the dropdown header.
export async function countTypeControl(page: Page, value: CountType): Promise<Locator> {
  const toggle = page.locator(`#counts-toggle #${value}-toggle`);
  return (await toggle.isVisible()) ? toggle : page.locator('#header-counts');
}

// Lab Values is available (shown either as a toggle button or a dropdown option).
export function labValuesOption(page: Page): Locator {
  return page.locator('#counts-toggle #measurement-toggle:visible, #counts-dropdown #measurement-option');
}

// Switch the count type and return the control to highlight afterwards.
export async function selectCountType(page: Page, value: CountType): Promise<Locator> {
  const toggle = page.locator(`#counts-toggle #${value}-toggle`);
  if (await toggle.isVisible()) {
    await toggle.click();
    return toggle;
  }
  await page.locator('#header-counts').click();
  await page.locator(`#counts-dropdown #${value}-option`).click();
  return page.locator('#header-counts');
}
