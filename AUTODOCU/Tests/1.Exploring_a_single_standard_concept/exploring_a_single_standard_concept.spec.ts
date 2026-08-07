import { test, expect } from '@playwright/test';
import { highlight, clearHighlights, shot } from '../Scripts/playwright/_helpers';

const SECTION = '1.Exploring_a_single_standard_concept'; // must equal the folder name

test('exploring a single standard concept', async ({ page }) => {
  await page.goto('/'); // baseURL from config
  // The app loads its vocabulary asynchronously; wait until it settles so the
  // search field's input handler is wired up before we type.
  await page.waitForLoadState('networkidle');
  const search = page.locator('#searchConcept');
  await search.waitFor({ state: 'visible' });

  // ## Searching for a concept
  // Use the 'Search concept' field to search for the 'Asthma' string.
  await search.click();
  await search.pressSequentially('Asthma', { delay: 60 });

  // Hover over the 'AsthmaSNOMED' concept in the suggestion list, highlight it,
  // and take a screenshot. (Outline calls it 'Astma SNOMED'; the real label is
  // 'AsthmaSNOMED', standard concept id 317009.)
  const asthmaSnomed = page.locator('#suggestion-317009');
  await asthmaSnomed.waitFor({ state: 'visible' });
  await asthmaSnomed.hover();
  await highlight(page, asthmaSnomed);
  await shot(page, SECTION, '01-searching-for-a-concept');
  await clearHighlights(page);

  // Click 'AsthmaSNOMED' and wait for the concept page to load.
  await asthmaSnomed.click();
  await page.waitForURL('**/317009');
  await page.locator('#graph-group').waitFor({ state: 'visible' });
  await page.locator('#view-toggle').waitFor({ state: 'visible' });
  await page.waitForLoadState('networkidle');

  // ## The concept view
  await shot(page, SECTION, '02-the-concept-view');

  // ### Hierarchy view
  // Highlight the 'List' selector in the left (sidebar) area and take a screenshot.
  const listSelector = page.locator('#list-toggle');
  await highlight(page, listSelector);
  await shot(page, SECTION, '03-hierarchy-view');
  await clearHighlights(page);

  // ### Time view
  // Highlight the record-counts-over-time plot together with its colored-concept
  // legend and take a screenshot. #graph-group wraps both the legend
  // (#graph-labels) and the time-series chart (#graph-container).
  const timePlot = page.locator('#graph-group');
  await highlight(page, timePlot);
  await shot(page, SECTION, '04-time-view');
  await clearHighlights(page);
});
