import { test, expect, Page } from '@playwright/test';
import { highlight, clearHighlights, shot } from '../Scripts/playwright/_helpers';

const SECTION = '4.Working_with_Concept_Sets';

// Suggestion rows sit inside a scrolling dropdown, so draw the box inside the
// element's edge (negative offset) to keep it from being clipped.
const INNER_BOX = 'outline: 3px solid red; outline-offset: -3px;';

// The backend can be slow (amd64 image under emulation, shared with other runs).
async function settle(page: Page, ms = 4000) {
  await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {});
  await page.waitForTimeout(ms);
}

// Open the header search (if collapsed) and type a query.
async function search(page: Page, text: string) {
  const box = page.locator('#searchConcept');
  if (!(await box.isVisible())) await page.locator('#searchBtn').click();
  await box.click();
  await box.fill('');
  await box.pressSequentially(text, { delay: 50 });
  await settle(page, 2000);
}

// Close the suggestions dropdown by clicking a neutral label in the left panel,
// then collapse the search bar (expanded, it overlaps the header buttons).
async function closeSearch(page: Page) {
  await page.getByText('FILTERS', { exact: true }).click();
  await page.waitForTimeout(500);
  await page.locator('#searchBtn').click();
  await page.waitForTimeout(1000);
}

test('Working with Concept Sets', async ({ page }) => {
  test.setTimeout(600_000);

  // Start from the Asthma (SNOMED) concept set.
  await page.goto('/317009');
  await expect(page.locator('#set-item-317009')).toBeVisible({ timeout: 180_000 });
  await settle(page);
  await shot(page, SECTION, '01-asthma-concept-set');

  // Search "Aller" next to the "Clear Set" box and highlight Allergic asthma (SNOMED).
  await search(page, 'Aller');
  const allergic = page.locator('#suggestion-4191479');
  await expect(allergic).toBeVisible({ timeout: 60_000 });
  await highlight(page, allergic, INNER_BOX);
  await shot(page, SECTION, '02-search-allergic-asthma');
  await clearHighlights(page);

  // Add it with the "+ Concept set" control.
  await page.locator('#cs-btn-container-4191479').click();
  await expect(page.locator('#set-item-4191479')).toBeVisible({ timeout: 120_000 });
  await settle(page);
  await closeSearch(page);
  await settle(page, 2000);
  await shot(page, SECTION, '03-allergic-asthma-added');

  // Exclude Allergic asthma.
  const exclude = page.locator('#set-item-4191479 .exclude-box');
  await exclude.click();
  await settle(page, 6000);
  await highlight(page, exclude);
  await shot(page, SECTION, '04-exclude-allergic-asthma');
  await clearHighlights(page);

  // Hierarchy view.
  await page.locator('#tree-toggle').click();
  await settle(page, 5000);
  await highlight(page, page.locator('#tree-toggle'));
  await shot(page, SECTION, '05-hierarchy-excluded');
  await clearHighlights(page);

  // List view.
  await page.locator('#list-toggle').click();
  await settle(page, 4000);
  await highlight(page, page.locator('#list-toggle'));
  await shot(page, SECTION, '06-list-excluded');
  await clearHighlights(page);

  // Search "Chronic obs" and highlight Chronic obstructive pulmonary disease (SNOMED).
  await search(page, 'Chronic obs');
  const copd = page.locator('#suggestion-255573');
  await expect(copd).toBeVisible({ timeout: 60_000 });
  await highlight(page, copd, INNER_BOX);
  await shot(page, SECTION, '07-search-copd');
  await clearHighlights(page);

  // Add COPD, switch to Hierarchy and expand the panel.
  await page.locator('#cs-btn-container-255573').click();
  await settle(page, 8000);
  await closeSearch(page);
  await page.locator('#tree-toggle').click();
  await settle(page, 5000);
  await expect(page.locator('#tree-toggle')).toBeVisible();
  await page.locator('#expand').click();
  await settle(page, 4000);
  await shot(page, SECTION, '08-hierarchy-expanded');

  // Level filter: set to 1, then reopen the dropdown to show the selection.
  await page.locator('#header-levels').click();
  await page.locator('#level-1').click();
  await settle(page, 6000);
  await page.locator('#header-levels').click();
  await page.waitForTimeout(800);
  await highlight(page, page.locator('#level-1'));
  await shot(page, SECTION, '09-level-1');
  await clearHighlights(page);
  await page.locator('#header-levels').click();

  // Person Counts.
  await page.locator('#person-toggle').click();
  await settle(page, 8000);
  await highlight(page, page.locator('#person-toggle'));
  await shot(page, SECTION, '10-person-counts');
  await clearHighlights(page);

  // Prevalence, then Incidence. Wait for the y-axis label to switch so the
  // dot plot has redrawn before capturing.
  for (const [measure, name] of [['Prevalence', '11-prevalence'], ['Incidence', '12-incidence']]) {
    const toggle = page.locator(`#${measure.toLowerCase()}-toggle:visible`).first();
    await toggle.click();
    await page.locator('#graph text', { hasText: measure }).first().waitFor({ timeout: 120000 });
    await settle(page, 8000);
    await highlight(page, toggle);
    await shot(page, SECTION, name);
    await clearHighlights(page);
  }
});
