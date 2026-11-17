import { test, expect } from '@playwright/test';
import { highlight, clearHighlights, shot } from '../Scripts/playwright/_helpers';

const SECTION = '2.Exploring_a_single_non-standard_concept';

// ICD10 'Asthma' J45 (non-standard) and the SNOMED 'Asthma' it maps to.
const J45_ID = '45596282';

test('Exploring a single non-Standard Concept', async ({ page }) => {
  test.setTimeout(300_000);

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // ## Searching for a concept
  const search = page.getByPlaceholder('Search by concept code, id, or name');
  const suggestion = page.locator(`#suggestion-${J45_ID}`);
  // The suggestions only appear once the app is ready to search; retype until they show.
  await expect(async () => {
    await search.fill('');
    await search.pressSequentially('Asthma', { delay: 50 });
    await expect(suggestion).toBeVisible({ timeout: 15_000 });
  }).toPass({ timeout: 120_000 });
  await suggestion.locator('.name-container').hover();
  await highlight(page, suggestion);
  await shot(page, SECTION, '01-searching-for-a-concept');
  await clearHighlights(page);

  await suggestion.locator('.name-container').click();
  await expect(page.locator('#tree-toggle')).toBeVisible({ timeout: 120_000 });
  await expect(page.locator('.set-item').first()).toBeVisible({ timeout: 120_000 });

  // ### Hierarchy panel (left panel) > #### Hierarchy tree
  await page.locator('#tree-toggle').click();
  const mapCircle = page.locator(`circle.map-circle-${J45_ID}`);
  await expect(mapCircle).toBeVisible({ timeout: 120_000 });
  await highlight(page, page.locator('#tree-toggle'));
  await shot(page, SECTION, '02-hierarchy-tree');
  await clearHighlights(page);

  // The node's label rect sits on top of the grey circle, so a pointer click
  // is intercepted; dispatch the click straight to the circle instead.
  await mapCircle.dispatchEvent('click');
  await expect(page.locator(`#tree-node-${J45_ID} #label-rect-317009`)).toBeVisible({ timeout: 60_000 });
  await shot(page, SECTION, '03-hierarchy-tree-maps-to');

  // #### List
  await page.locator('#list-toggle').click();
  await expect(page.locator(`#mappings-title-${J45_ID}`)).toBeVisible({ timeout: 60_000 });
  await highlight(page, page.locator('#list-toggle'));
  await shot(page, SECTION, '04-list');
  await clearHighlights(page);
});
