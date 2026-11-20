import { test, expect as baseExpect, Page, Locator } from '@playwright/test';
import { highlight, clearHighlights, shot, selectCountType } from '../Scripts/playwright/_helpers';

// The app can be slow (single backend, emulated); allow generous waits.
const expect = baseExpect.configure({ timeout: 30_000 });

const SECTION = '1.Exploring_a_single_standard_concept'; // must equal the folder name

// Concept ids used in this walkthrough (OMOP concept_id).
const ASTHMA = '317009';
const ALLERGIC_ASTHMA = '4191479';
const INTRINSIC_ASTHMA = '4145497';

// SVG elements can't show a CSS outline, and some targets are several elements
// at once, so this draws a fixed red box over the union of the targets' rects.
async function boxAround(page: Page, targets: Locator[], pad = 4) {
  const rects = [];
  for (const t of targets) {
    for (const el of await t.all()) {
      const b = await el.boundingBox();
      if (b) rects.push(b);
    }
  }
  const x1 = Math.min(...rects.map((r) => r.x)) - pad;
  const y1 = Math.min(...rects.map((r) => r.y)) - pad;
  const x2 = Math.max(...rects.map((r) => r.x + r.width)) + pad;
  const y2 = Math.max(...rects.map((r) => r.y + r.height)) + pad;
  await page.evaluate(([x, y, w, h]) => {
    const d = document.createElement('div');
    d.className = 'autodocu-box';
    d.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:${w}px;height:${h}px;` +
      'border:3px solid red;box-sizing:border-box;pointer-events:none;z-index:99999;';
    document.body.appendChild(d);
  }, [x1, y1, x2 - x1, y2 - y1]);
}

async function clearAll(page: Page) {
  await clearHighlights(page);
  await page.evaluate(() => document.querySelectorAll('.autodocu-box').forEach((e) => e.remove()));
}

// Move the real mouse onto an element's centre (d3 hover handlers need genuine
// mouseover events; we first park the mouse elsewhere so the move registers).
async function mouseTo(page: Page, target: Locator) {
  const b = await target.boundingBox();
  if (!b) throw new Error('target not visible');
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 5 });
}

async function parkMouse(page: Page) {
  await page.mouse.move(256, 790);
}

// The small mapping toggle next to a tree node's grey circles.
const mappingsBtn = (page: Page, id: string) =>
  page.locator(`#mappings-btn-${id}`).locator('xpath=preceding-sibling::*[1]');

test('exploring a single standard concept', async ({ page }) => {
  test.setTimeout(300_000);
  page.setDefaultTimeout(60_000);

  await page.goto('/');

  // ## Searching for a concept
  const search = page.getByPlaceholder('Search by concept code, id, or name');
  await expect(search).toBeVisible({ timeout: 120_000 });
  await page.waitForLoadState('networkidle');
  await search.click();
  await search.pressSequentially('Asthma', { delay: 100 });
  const item = page.locator('p', { hasText: new RegExp(`Id:\\s*${ASTHMA}$`) }).locator('..');
  await expect(item).toBeVisible({ timeout: 60_000 });
  await item.hover();
  await highlight(page, item);
  await shot(page, SECTION, '01-searching-for-a-concept');
  await clearAll(page);
  await item.click();
  await expect(page.locator(`#area-${ASTHMA}`)).toBeAttached({ timeout: 120_000 });
  await parkMouse(page);

  // ## Overall view
  await shot(page, SECTION, '02-overall-view');

  // #### Concept Set
  await highlight(page, page.locator('#set-toggle'));
  await shot(page, SECTION, '03-concept-set');
  await clearAll(page);

  // #### Hierarchy tree
  await page.locator('#tree-toggle').click();
  await expect(page.locator(`#tree-circle-${ALLERGIC_ASTHMA}`)).toBeVisible();
  await highlight(page, page.locator('#tree-toggle'));
  await parkMouse(page);
  await shot(page, SECTION, '04-hierarchy-tree');
  await clearAll(page);

  await mouseTo(page, page.locator(`#tree-circle-${ALLERGIC_ASTHMA}`));
  await expect(page.locator('#tooltip')).toBeVisible();
  await page.waitForTimeout(1500);
  await shot(page, SECTION, '05-hierarchy-tree-hover');
  await parkMouse(page);
  await page.waitForTimeout(1000);

  await boxAround(page, [page.locator(`.map-circle-${INTRINSIC_ASTHMA}`), mappingsBtn(page, INTRINSIC_ASTHMA)]);
  await shot(page, SECTION, '06-hierarchy-tree-mapping-circles');
  await clearAll(page);

  await mouseTo(page, mappingsBtn(page, INTRINSIC_ASTHMA));
  await page.mouse.down();
  await page.mouse.up();
  await expect(page.locator('#label-rect-45557625')).toBeVisible();
  await parkMouse(page);
  await shot(page, SECTION, '07-hierarchy-tree-mappings-open');
  // Close the mapped codes again (not part of the narrative).
  await mouseTo(page, mappingsBtn(page, INTRINSIC_ASTHMA));
  await page.mouse.down();
  await page.mouse.up();
  await parkMouse(page);
  await page.waitForTimeout(1500);

  // #### List
  await page.locator('#list-toggle').click();
  await expect(page.locator(`#list-item-${INTRINSIC_ASTHMA}`)).toBeVisible();
  await highlight(page, page.locator('#list-toggle'));
  await shot(page, SECTION, '08-list');
  await clearAll(page);

  // The Outline's next step clicks the (i) icon of "Allergic asthma" in the
  // List. In the current app build that icon throws a TypeError in the console
  // and nothing opens (src/components/visualization/sideBar.jsx selects
  // '#info-container' + id, missing the '-'), so that screenshot is skipped.

  await page.locator(`#list-caret-down-${INTRINSIC_ASTHMA}`).click();
  await expect(page.locator(`#mappings-title-${INTRINSIC_ASTHMA}`)).toBeVisible();
  await parkMouse(page);
  await shot(page, SECTION, '09-list-mappings');
  // Close the mapped codes again (not part of the narrative).
  await page.locator(`#list-caret-up-${INTRINSIC_ASTHMA}`).click();
  await parkMouse(page);
  await page.waitForTimeout(1000);

  // ### Counts panel (right panel)
  await highlight(page, page.locator('#graph-group'), 'outline: 3px solid red; outline-offset: -3px;');
  await shot(page, SECTION, '10-counts-panel');
  await clearAll(page);

  // Hover the large bottom layer of the stack (Asthma itself).
  const area = await page.locator(`#area-${ASTHMA}`).boundingBox();
  await page.mouse.move(area!.x + area!.width * 0.75, area!.y + area!.height * 0.75, { steps: 5 });
  await page.waitForTimeout(3000);
  await shot(page, SECTION, '11-counts-panel-hover');
  await parkMouse(page);
  await page.waitForTimeout(1000);

  await highlight(page, page.locator('#graph-filters'), 'outline: 3px solid red; outline-offset: -3px;');
  await shot(page, SECTION, '12-counts-panel-filters');
  await clearAll(page);

  // The filters start with everything selected and a click toggles the clicked
  // value off. So "only Female, 50-59, PRIM_OUT" means switching off every
  // other value: Male, the other age bands, and the other visit types.
  const toggles = [
    page.locator('#btn-8507'), // Male
    ...[0, 1, 2, 3, 4, 6, 7, 8, 9].map((i) => page.locator(`#age-labels #btn-${i}`)),
    page.locator('#source-viz .source-geometry', { hasText: /^OUTPAT$/ }),
    page.locator('#source-viz .source-geometry', { hasText: /^RE$/ }),
  ];
  for (const t of toggles) {
    await t.click();
    await page.waitForTimeout(700);
  }
  await page.waitForTimeout(2000);
  await parkMouse(page);
  await shot(page, SECTION, '13-counts-panel-filtered');
  // Undo the filters (not part of the narrative).
  for (const t of [...toggles].reverse()) {
    await t.click();
    await page.waitForTimeout(700);
  }
  await page.waitForTimeout(2000);
  await parkMouse(page);

  // ### Concept Control (top bar)
  await highlight(page, page.locator('#header'), 'outline: 3px solid red; outline-offset: -3px;');
  await shot(page, SECTION, '14-concept-control');
  await clearAll(page);

  await page.locator('#mappings-toggle').click();
  await page.waitForTimeout(3000);
  await highlight(page, page.locator('#mappings-toggle'));
  await parkMouse(page);
  await shot(page, SECTION, '15-concept-control-mappings');
  await clearAll(page);

  await page.locator('#descendants-toggle').click();
  await page.waitForTimeout(3000);
  const personControl = await selectCountType(page, 'person');
  await page.waitForTimeout(3000);
  await highlight(page, personControl);
  await parkMouse(page);
  await shot(page, SECTION, '16-concept-control-person-counts');
  await clearAll(page);

  // Prevalence / Incidence: the plot redraws with the measure as its y-axis label.
  for (const [value, label, name] of [
    ['prevalence', 'Prevalence', '17-concept-control-prevalence'],
    ['incidence', 'Incidence', '18-concept-control-incidence'],
  ] as const) {
    const control = await selectCountType(page, value);
    await page.locator('svg text').filter({ hasText: new RegExp(`^${label}$`) }).first()
      .waitFor({ state: 'visible', timeout: 120_000 });
    await page.waitForTimeout(3000);
    await highlight(page, control);
    await parkMouse(page);
    await shot(page, SECTION, name);
    await clearAll(page);
  }
});
