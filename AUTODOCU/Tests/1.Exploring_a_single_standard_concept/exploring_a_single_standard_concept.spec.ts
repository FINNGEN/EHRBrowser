import { test, expect } from '@playwright/test';
import { highlight, clearHighlights, shot } from '../Scripts/playwright/_helpers';

const SECTION = '1.Exploring_a_single_standard_concept'; // must equal the folder name

test('exploring a single standard concept', async ({ page }) => {
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

  // Highlight the result in the list and take a screenshot.
  await asthmaSnomed.hover();
  await highlight(page, asthmaSnomed);
  await shot(page, SECTION, '01-searching-for-a-concept');
  await clearHighlights(page);

  // Click the concept and wait for the concept page to load.
  await asthmaSnomed.click();
  await page.waitForURL('**/317009');
  await page.waitForLoadState('networkidle');
  // Wait for both panels of the concept view to render before capturing:
  // the left List toggle, and the right plot with its legend populated.
  await page.locator('#list-toggle').waitFor({ state: 'visible' });
  await page.locator('#graph-group').waitFor({ state: 'visible' });
  await page.locator('#label-317009').first().waitFor({ state: 'visible' });

  // ## The concept view
  await shot(page, SECTION, '02-the-concept-view');

  // ### Hierarchy view
  // Highlight the 'List' selector in the left area and take a screenshot.
  const listSelector = page.locator('#list-toggle');
  await highlight(page, listSelector);
  await shot(page, SECTION, '03-hierarchy-view');
  await clearHighlights(page);

  // ### Time view
  // Highlight the Record Counts plot (chart + colored-concept legend) on the
  // right of the page and take a screenshot.
  const timePlot = page.locator('#graph-group');
  await highlight(page, timePlot);
  await shot(page, SECTION, '04-time-view');
  await clearHighlights(page);
});
