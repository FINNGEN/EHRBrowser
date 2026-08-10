import { test, expect, Page, Locator } from '@playwright/test';
import { highlight, clearHighlights, shot } from '../Scripts/playwright/_helpers';

const SECTION = '1.Exploring_a_single_standard_concept'; // must equal the folder name

// Concept ids discovered against the live app (Asthma SNOMED tree):
const ASTHMA = '317009';          // root: Asthma (SNOMED)
const ALLERGIC = '4191479';       // Allergic asthma
const INTRINSIC = '4145497';      // Intrinsic asthma

// The shared `highlight` helper draws a CSS outline, which renders cleanly on
// HTML elements but not on the SVG glyphs used inside the hierarchy tree. For
// SVG targets (the small grey mapping circles) we drop a red overlay box over
// the element's bounding rect instead, and clear it before the next capture.
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

test('exploring a single standard concept', async ({ page }) => {
  // This walkthrough captures 17 screenshots, each preceded by an animation
  // settle wait, so it needs well above the 30s default.
  test.setTimeout(240000);
  await page.goto('/'); // baseURL from config
  await page.waitForLoadState('networkidle');

  // ## Searching for a concept
  // Use the 'Search concept' field to search for 'Asthma'.
  const search = page.getByRole('textbox', { name: 'Search concept' });
  await search.waitFor({ state: 'visible' });

  // Hover over the 'Asthma SNOMED' result (rendered as "AsthmaSNOMED").
  const asthmaSnomed = page.getByText('AsthmaSNOMED', { exact: true });
  // On a cold start the vocabulary index can still be loading, so the first
  // keystroke query may return nothing. Retry typing until the result appears.
  await expect(async () => {
    await search.fill('');
    await search.pressSequentially('Asthma', { delay: 30 });
    await expect(asthmaSnomed).toBeVisible({ timeout: 3000 });
  }).toPass({ timeout: 30000 });

  await asthmaSnomed.hover();
  await highlight(page, asthmaSnomed);
  await shot(page, SECTION, '01-searching-for-a-concept');
  await clearHighlights(page);

  // Click the concept and wait for the concept page to load.
  await asthmaSnomed.click();
  await page.waitForURL(`**/${ASTHMA}`);
  await page.waitForLoadState('networkidle');
  // Both panels must be present: the left view toggle + Concept Set panel, and
  // the right plot group.
  await page.locator('#view-toggle').waitFor({ state: 'visible' });
  await page.locator('#set-toggle').waitFor({ state: 'visible' });
  await page.locator('#graph-group').waitFor({ state: 'visible' });
  await page.locator('#set-items').waitFor({ state: 'visible' });

  // ## Overlall view
  await shot(page, SECTION, '02-overall-view');

  // ### Hierarchy pannel (left pannel)

  // #### Concept Set
  // The 'Concept Set' view is the default; highlight its selector.
  await highlight(page, page.locator('#set-toggle'));
  await shot(page, SECTION, '03-hierarchy-panel-concept-set');
  await clearHighlights(page);

  // #### Hierarchy tree
  // Switch to the 'Hierarchy' (tree) view and highlight its selector.
  await page.locator('#tree-toggle').click();
  await page.locator(`#tree-node-${ASTHMA}`).waitFor({ state: 'visible' });
  await highlight(page, page.locator('#tree-toggle'));
  await shot(page, SECTION, '04-hierarchy-panel-hierarchy-tree');
  await clearHighlights(page);

  // Hover over the "Allergic asthma" node to drop down its info card. The tree
  // hover handler waits ~600ms before showing the tooltip, so pause after.
  const allergicNode = page.locator(`#tree-node-${ALLERGIC}`);
  await allergicNode.scrollIntoViewIfNeeded().catch(() => {});
  await allergicNode.hover({ force: true });
  await page.waitForTimeout(1200);
  await shot(page, SECTION, '05-hierarchy-tree-hover');
  await page.mouse.move(5, 5);
  await page.waitForTimeout(300);

  // Highlight the small grey mapping circles on the left of "Intrinsic asthma".
  const intrinsicMapBtn = page.locator(`#mappings-btn-${INTRINSIC}`);
  await boxHighlight(page, intrinsicMapBtn);
  await shot(page, SECTION, '06-hierarchy-tree-mapping-toggle');
  await clearBoxes(page);

  // Click the grey circles to open the non-standard concepts mapped to it.
  await intrinsicMapBtn.click({ force: true });
  await page.waitForTimeout(800);
  await shot(page, SECTION, '07-hierarchy-tree-mappings-open');
  // Close the mappings again (not documented) so the shared mapRoot state does
  // not leave this concept pre-expanded in the List view below.
  await intrinsicMapBtn.click({ force: true });
  await page.waitForTimeout(600);

  // #### List
  // Switch to the 'List' view and highlight its selector.
  await page.locator('#list-toggle').click();
  await page.locator(`#list-item-${ASTHMA}`).waitFor({ state: 'visible' });
  await highlight(page, page.locator('#list-toggle'));
  await shot(page, SECTION, '08-hierarchy-panel-list');
  await clearHighlights(page);

  // Click the (i) icon on "Allergic asthma" to drop down the concept's info.
  await page.locator(`#info-icon-${ALLERGIC}`).click();
  await page.waitForTimeout(700);
  await shot(page, SECTION, '09-list-info-dropdown');

  // Click the down arrow on the left of "Intrinsic asthma" to expand its
  // mapped (non-standard) source codes.
  const intrinsicCaret = page.locator(`#list-caret-down-${INTRINSIC}`);
  await intrinsicCaret.scrollIntoViewIfNeeded().catch(() => {});
  await intrinsicCaret.click();
  await page.waitForTimeout(1200);
  await shot(page, SECTION, '10-list-mappings-open');
  // Close it again (not documented).
  await page.locator(`#list-caret-up-${INTRINSIC}`).click().catch(() => {});
  await page.waitForTimeout(600);

  // ### Counts pannel (right pannel)
  // Highlight the whole plot group (chart + coloured-concept legend).
  await highlight(page, page.locator('#graph-group'));
  await shot(page, SECTION, '11-counts-panel-time-plot');
  await clearHighlights(page);

  // Hover over the dark-red root Asthma layer (the bottom, largest stacked
  // area) to highlight the concept and drop down its tooltip. Hovering the
  // path's bbox centre misses the fill, so aim a real mouse move deep into the
  // filled lower-right region of the plot.
  const plotBox = await page.locator('#graph-container').boundingBox();
  if (plotBox) {
    const hx = plotBox.x + plotBox.width * 0.72;
    const hy = plotBox.y + plotBox.height * 0.82;
    await page.mouse.move(plotBox.x + plotBox.width * 0.4, plotBox.y + plotBox.height * 0.3);
    await page.mouse.move(hx, hy);
    await page.mouse.move(hx, hy); // second move ensures a mouseover transition
  }
  await page.waitForTimeout(1000);
  await shot(page, SECTION, '12-counts-panel-hover');
  await page.mouse.move(5, 5);
  await page.waitForTimeout(300);

  // Highlight one of the stratifying filter boxes (Sex / Age / Visit Type).
  await highlight(page, page.locator('#gender-container'));
  await shot(page, SECTION, '13-counts-panel-filters');
  await clearHighlights(page);

  // Click "Female" and the "50-59" age band to filter the time plot.
  await page.locator('#gender-labels').getByText('Female', { exact: true }).click();
  await page.locator('#age-labels').getByText('50-59', { exact: true }).click();
  await page.waitForTimeout(800);
  await shot(page, SECTION, '14-counts-panel-filtered');

  // ### Concept Control (top bar)
  // Clear the Sex/Age filters applied above so the top-bar screenshots show the
  // full, unfiltered view (this reset is not part of the documented steps).
  await page.locator('#reset-gender').click().catch(() => {});
  await page.locator('#reset-age').click().catch(() => {});
  await page.waitForTimeout(800);

  // Highlight the whole upper bar.
  await highlight(page, page.locator('#header'));
  await shot(page, SECTION, '15-concept-control-bar');
  await clearHighlights(page);

  // Click 'Mappings' to open the mapped codes across the whole tree/list.
  await page.locator('#mappings-toggle').click();
  await page.waitForTimeout(1200);
  await highlight(page, page.locator('#mappings-toggle'));
  await shot(page, SECTION, '16-concept-control-mappings');
  await clearHighlights(page);

  // Switch back to 'Descendants', then to 'Person Counts'. This rescales the
  // time plot to person counts; confirm the toggle became active (it can be
  // missed while the previous switch is still animating), retrying if needed.
  await page.locator('#descendants-toggle').click();
  await page.waitForTimeout(1000);
  await expect(async () => {
    await page.locator('#person-toggle').click();
    await expect(page.locator('#person-toggle')).toHaveCSS('font-weight', '500', { timeout: 2000 });
  }).toPass({ timeout: 20000 });
  await page.waitForTimeout(1000);
  await highlight(page, page.locator('#person-toggle'));
  await shot(page, SECTION, '17-concept-control-person-counts');
  await clearHighlights(page);
});
