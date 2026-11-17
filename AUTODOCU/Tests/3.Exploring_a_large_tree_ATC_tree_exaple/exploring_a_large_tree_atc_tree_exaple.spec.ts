import { test, expect, Page } from '@playwright/test';
import { highlight, clearHighlights, shot } from '../Scripts/playwright/_helpers';

const SECTION = '3.Exploring_a_large_tree_ATC_tree_exaple';

// Draw one red box around the union of several elements (the Outline asks for
// "one box including both" the Level and Class filters). The overlay carries
// data-autodocu-hl so it is easy to find; removeUnionBoxes() deletes it.
async function highlightUnion(page: Page, selectors: string[]) {
  await page.evaluate((sels) => {
    const rects = sels.map((s) => document.querySelector(s)!.getBoundingClientRect());
    const left = Math.min(...rects.map((r) => r.left));
    const top = Math.min(...rects.map((r) => r.top));
    const right = Math.max(...rects.map((r) => r.right));
    const bottom = Math.max(...rects.map((r) => r.bottom));
    const box = document.createElement('div');
    box.setAttribute('data-autodocu-union', '1');
    Object.assign(box.style, {
      position: 'fixed',
      left: `${left - 2}px`,
      top: `${top - 2}px`,
      width: `${right - left + 4}px`,
      height: `${bottom - top + 4}px`,
      outline: '3px solid red',
      pointerEvents: 'none',
      zIndex: '10000',
    });
    document.body.appendChild(box);
  }, selectors);
}

async function removeUnionBoxes(page: Page) {
  await page.evaluate(() =>
    document.querySelectorAll('[data-autodocu-union]').forEach((el) => el.remove()),
  );
}

test('Exploring a large tree, ATC tree example', async ({ page }) => {
  test.setTimeout(600_000);

  // ## Loading ATC code C10AA 'HMG CoA reductase inhibitors'
  // Navigate directly to the concept; the large tree may take a while to load.
  await page.goto('/21601855');
  await expect(page.getByText('Total Descendant Counts:')).toBeVisible({ timeout: 300_000 });
  await expect(page.locator('#header-levels')).toBeVisible({ timeout: 300_000 });

  // Hierarchy tab
  await page.locator('#tree-toggle').click();
  await page.waitForTimeout(3000);
  await shot(page, SECTION, '01-loading-atc-code-c10aa-hierarchy');

  // List tab
  await page.locator('#list-toggle').click();
  await expect(page.getByText('Level 5', { exact: true })).toBeVisible({ timeout: 60_000 });
  await shot(page, SECTION, '02-loading-atc-code-c10aa-list');

  // One box around both the Level and Class pruning filters
  await highlightUnion(page, ['#levels-container', '#classes-container']);
  await shot(page, SECTION, '03-loading-atc-code-c10aa-pruning-filters');
  await removeUnionBoxes(page);

  // ### Using 'Max Level' pruning tool
  await page.locator('#header-levels').click();
  await page.locator('#level-2').click();
  await expect(page.locator('#header-levels .dropdownTitle')).toHaveText('2');
  await expect(page.getByText('Level 3', { exact: true })).toHaveCount(0, { timeout: 60_000 });
  await page.waitForTimeout(3000);
  await page.locator('#header-levels').click();
  await expect(page.locator('#level-2')).toBeVisible();
  await highlight(page, page.locator('#level-2'));
  await shot(page, SECTION, '04-using-max-level-pruning-tool-level-2');
  await clearHighlights(page);
  await page.locator('#header-levels').click(); // close the dropdown

  // Hierarchy tab + expand/compress icon to enlarge the tree
  await page.locator('#tree-toggle').click();
  await page.waitForTimeout(2000);
  await page.locator('#expand').click();
  await expect(page.locator('#compress')).toBeVisible();
  await page.waitForTimeout(2000);
  await highlight(page, page.locator('#tree-toggle'));
  await highlight(page, page.locator('#compress'));
  await shot(page, SECTION, '05-using-max-level-pruning-tool-expanded-tree');
  await clearHighlights(page);

  // ### Using 'Classes' pruning tool
  await page.locator('#open-classes').click();
  await expect(page.locator('#class-Ingredient')).toBeVisible();
  await shot(page, SECTION, '06-using-classes-pruning-tool-dropdown');

  // Add "Ingredient" to the selected classes
  await page.locator('#check-box-Ingredient').click();
  await expect(page.locator('#class-selections')).toContainText('Ingredient', { timeout: 60_000 });
  await page.waitForTimeout(5000);
  await page.locator('#open-classes').click();
  await expect(page.locator('#class-Ingredient')).toBeVisible();
  await highlight(page, page.locator('#class-Ingredient'));
  await shot(page, SECTION, '07-using-classes-pruning-tool-ingredient');
  await clearHighlights(page);
});
