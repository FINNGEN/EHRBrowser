import { test, Page } from '@playwright/test';
import { highlight, clearHighlights, shot } from '../Scripts/playwright/_helpers';

const SECTION = '3.Exploring_a_large_tree_ATC_tree_exaple'; // must equal the folder name

// Concept id from the Outline: ATC level-4 code C10AA 'HMG CoA reductase
// inhibitors', navigated to directly at /21601855.
const C10AA = '21601855';

// The Max Level and Classes filters live in a dropdown each: an #open-<name>
// control toggles a #dropdown-<name> panel. Selecting an option can close the
// panel, so this reopens it only if it is not already visible.
async function ensureDropdownOpen(page: Page, dropdownSel: string, openSel: string) {
  const dd = page.locator(dropdownSel);
  if (!(await dd.isVisible().catch(() => false))) {
    await page.locator(openSel).click();
  }
  await dd.waitFor({ state: 'visible' });
  await page.waitForTimeout(400);
}

test('exploring a large tree (ATC tree example)', async ({ page }) => {
  // The ATC C10AA tree has hundreds of descendants and is slow to load and
  // re-layout, so this walkthrough needs well above the 30s default.
  test.setTimeout(360000);

  // ## Loading ATC code C10AA 'HMG CoA reductase inhibitors'
  // Navigate directly to the concept; the large tree can take a while to load.
  await page.goto(`/${C10AA}`, { waitUntil: 'networkidle', timeout: 180000 });
  await page.locator('#view-toggle').waitFor({ state: 'visible' });
  await page.locator('#tree-toggle').waitFor({ state: 'visible' });
  await page.locator('#list-toggle').waitFor({ state: 'visible' });
  await page.waitForTimeout(1500);

  // Click the 'Hierarchy' (tree) tab and capture the oversized tree + busy plot.
  await page.locator('#tree-toggle').click();
  await page.locator(`#tree-node-${C10AA}`).waitFor({ state: 'visible' });
  await page.waitForTimeout(1500);
  await shot(page, SECTION, '01-hierarchy-large-tree');

  // Click the 'List' tab: the same descendants compacted into a list.
  await page.locator('#list-toggle').click();
  await page.locator('#list-container').waitFor({ state: 'visible' });
  await page.waitForTimeout(1500);
  await shot(page, SECTION, '02-list-view');

  // Highlight, in one box, both the 'Max Level' and 'Classes' pruning tools.
  // #sidebar-filters wraps exactly #levels-container + #classes-container.
  await highlight(page, page.locator('#sidebar-filters'));
  await shot(page, SECTION, '03-pruning-tools');
  await clearHighlights(page);

  // ### Using 'Max Level' prunning tool
  // Open the 'Max level' dropdown and click level 2, then wait for the re-layout.
  await ensureDropdownOpen(page, '#dropdown-levels', '#open-levels');
  await page.locator('#level-2').click();
  await page.waitForTimeout(2500);
  // Reopen the dropdown and highlight the selected level 2 for the screenshot.
  await ensureDropdownOpen(page, '#dropdown-levels', '#open-levels');
  await highlight(page, page.locator('#level-2'));
  await shot(page, SECTION, '04-max-level-2');
  await clearHighlights(page);
  // Close the dropdown again so it does not cover the tree below.
  if (await page.locator('#dropdown-levels').isVisible().catch(() => false)) {
    await page.locator('#close-levels').click().catch(() => {});
    await page.waitForTimeout(400);
  }

  // Switch to the 'Hierarchy' tab and click the expand/compress icon to enlarge
  // the (now pruned) tree so it fits the window.
  await page.locator('#tree-toggle').click();
  await page.locator(`#tree-node-${C10AA}`).waitFor({ state: 'visible' });
  await page.waitForTimeout(1500);
  await page.locator('#expand').click();
  await page.waitForTimeout(2000);
  // After expanding, the compress icon is the one now shown; highlight the
  // 'Hierarchy' tab and that icon together.
  await highlight(page, page.locator('#tree-toggle'));
  await highlight(page, page.locator('#compress'));
  await shot(page, SECTION, '05-hierarchy-expanded');
  await clearHighlights(page);
  // Restore the normal (compressed) layout before the next steps.
  await page.locator('#compress').click().catch(() => {});
  await page.waitForTimeout(1000);

  // ### Using 'Class' prunning tool
  // Open the 'Class' dropdown to show every Concept Class present in the tree.
  await ensureDropdownOpen(page, '#dropdown-classes', '#open-classes');
  await shot(page, SECTION, '06-class-dropdown');

  // Click 'Ingredient' to add that grouping, wait for the re-layout, then
  // reopen the dropdown and highlight 'Ingredient' for the screenshot.
  await page.locator('#check-box-Ingredient').click();
  await page.waitForTimeout(2500);
  await ensureDropdownOpen(page, '#dropdown-classes', '#open-classes');
  await highlight(page, page.locator('#class-Ingredient'));
  await shot(page, SECTION, '07-class-ingredient-added');
  await clearHighlights(page);
});
