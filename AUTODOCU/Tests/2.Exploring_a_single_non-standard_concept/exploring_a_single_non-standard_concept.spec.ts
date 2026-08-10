import { test, expect, Page, Locator } from '@playwright/test';
import { highlight, clearHighlights, shot } from '../Scripts/playwright/_helpers';

const SECTION = '2.Exploring_a_single_non-standard_concept'; // must equal the folder name

// Concept ids discovered against the live app (Asthma ICD10 tree):
const ASTHMA_ICD10 = '45596282'; // main concept: Asthma (ICD10, code J45) — Non standard
const ASTHMA_SNOMED = '317009';  // standard concept J45 maps to (Asthma, SNOMED)

// The shared `highlight` helper draws a CSS outline, which renders cleanly on
// HTML elements but not on the SVG glyphs used inside the hierarchy tree. For
// SVG targets (the grey mapping circles) we drop a red overlay box over the
// element's bounding rect instead, and clear it before the next capture.
async function boxHighlight(page: Page, target: Locator) {
  await target.scrollIntoViewIfNeeded().catch(() => {});
  const box = await target.boundingBox();
  if (!box) return;
  await page.evaluate(({ x, y, w, h }) => {
    const d = document.createElement('div');
    d.className = 'autodocu-box';
    Object.assign(d.style, {
      position: 'fixed',
      left: x - 5 + 'px',
      top: y - 5 + 'px',
      width: w + 10 + 'px',
      height: h + 10 + 'px',
      border: '3px solid red',
      borderRadius: '50%',
      zIndex: '99999',
      pointerEvents: 'none',
    });
    document.body.appendChild(d);
  }, { x: box.x, y: box.y, w: box.width, h: box.height });
}
async function clearBoxes(page: Page) {
  await page.evaluate(() => document.querySelectorAll('.autodocu-box').forEach((e) => e.remove()));
}

test('exploring a single non-standard concept', async ({ page }) => {
  // Five screenshots, each preceded by an animation-settle wait.
  test.setTimeout(300000);
  await page.goto('/'); // baseURL from config
  await page.waitForLoadState('networkidle');

  // ## Searching for a concept
  // Use the 'Search concept' field to search for 'Asthma'.
  const search = page.getByRole('textbox', { name: 'Search concept' });
  await search.waitFor({ state: 'visible' });

  // Hover over the non-standard 'Asthma ICD10' result (rendered as "AsthmaICD10").
  const asthmaIcd10 = page.getByText('AsthmaICD10', { exact: true });
  // On a cold start the vocabulary index can still be loading, so the first
  // keystroke query may return nothing. Retry typing until the result appears.
  await expect(async () => {
    await search.fill('');
    await search.pressSequentially('Asthma', { delay: 30 });
    await expect(asthmaIcd10).toBeVisible({ timeout: 3000 });
  }).toPass({ timeout: 30000 });

  await asthmaIcd10.hover();
  await highlight(page, asthmaIcd10);
  await shot(page, SECTION, '01-searching-for-a-concept');
  await clearHighlights(page);

  // Click the concept and wait for the concept page to load.
  await asthmaIcd10.click();
  await page.waitForURL(`**/${ASTHMA_ICD10}`);
  await page.waitForLoadState('networkidle');
  await page.locator('#view-toggle').waitFor({ state: 'visible' });
  await page.locator('#set-toggle').waitFor({ state: 'visible' });
  await page.locator('#graph-group').waitFor({ state: 'visible' });

  // ### Hierarchy tree
  // Switch to the 'Hierarchy' (tree) view and highlight its selector. The main
  // J45 node carries its grey mapping circle on the RIGHT side (for standard
  // concepts, as in section 1, it sits on the left).
  await page.locator('#tree-toggle').click();
  await page.locator(`#tree-node-${ASTHMA_ICD10}`).waitFor({ state: 'visible' });
  await highlight(page, page.locator('#tree-toggle'));
  await shot(page, SECTION, '02-hierarchy-tree');
  await clearHighlights(page);

  // Click the grey mapping circle on the right of the J45 node to expand the
  // STANDARD concepts it maps to (they appear as #map-node-<standardId>).
  const icd10MapBtn = page.locator(`#mappings-btn-${ASTHMA_ICD10}`);
  await icd10MapBtn.click({ force: true });
  // The mapped-standard node id repeats under other branches that also map to
  // it, so scope to the mapping just opened under the main J45 node.
  const mappedStandard = page.locator(`#tree-node-${ASTHMA_ICD10} #map-node-${ASTHMA_SNOMED}`);
  await mappedStandard.waitFor({ state: 'visible' });
  await page.waitForTimeout(800);
  // Draw attention to the just-revealed standard mapping node.
  await boxHighlight(page, mappedStandard);
  await shot(page, SECTION, '03-hierarchy-tree-mappings-open');
  await clearBoxes(page);

  // #### List
  // Switch to the 'List' view and highlight its selector.
  await page.locator('#list-toggle').click();
  await page.locator(`#list-item-${ASTHMA_ICD10}`).waitFor({ state: 'visible' });
  await highlight(page, page.locator('#list-toggle'));
  await shot(page, SECTION, '04-list');
  await clearHighlights(page);
});
