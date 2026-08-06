import { Page, Locator } from '@playwright/test';
import * as path from 'path';

// Where `shot` writes. Normally Documentation/ (two levels up from this file).
// run_test.sh sets AUTODOCU_SHOT_ROOT to a temp folder so it can diff the fresh
// captures against the committed images before deciding to replace them.
const DOC_ROOT = process.env.AUTODOCU_SHOT_ROOT
  ? path.resolve(process.env.AUTODOCU_SHOT_ROOT)
  : path.resolve(__dirname, '..', '..', 'Documentation');

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
