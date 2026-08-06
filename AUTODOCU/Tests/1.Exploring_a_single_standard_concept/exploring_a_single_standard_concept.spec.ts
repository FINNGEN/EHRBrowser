import { test } from '@playwright/test';
import { highlight, clearHighlights, shot } from '../playwright/_helpers';

const SECTION = '1.Exploring_a_single_standard_concept'; // must equal the folder name

test('exploring a single standard concept', async ({ page }) => {
  await page.goto('/'); // baseURL from config

  // ## Searching for a concept
  const search = page.getByRole('textbox', { name: 'Search concept' });
  await search.click();
  await search.fill('Asthma');
  const result = page.getByText('AsthmaSNOMED', { exact: true });
  await result.waitFor({ state: 'visible' });
  await result.hover();
  await highlight(page, result); // `highlight` the 'AsthmaSNOMED' concept in the list
  await shot(page, SECTION, '01-searching-for-a-concept'); // `take-screenshot`
  await clearHighlights(page);
  await result.click();
  // wait for the concept page to load
  await page.waitForURL('**/317009');
  await page.getByText('Asthma195967001SNOMED').first().waitFor({ state: 'visible' });
  await page.waitForLoadState('networkidle');

  // ## The concept view
  await shot(page, SECTION, '02-the-concept-view'); // `take-screenshot`

  // ### Hierarchy view
  // 3 options for the hierarchy view: List, Concept Set, Hierarchy
  const listSelector = page.locator('div.toggle-itm', { hasText: 'List' }).first();
  await highlight(page, listSelector); // `highlight` the 'List' selector in the left area
  await shot(page, SECTION, '03-hierarchy-view'); // `take-screenshot`
  await clearHighlights(page);

  // ### Time view
  // the time plot on the right, including the legend with the colored concepts
  const timePlot = page.locator('#graph-group');
  await timePlot.waitFor({ state: 'visible' });
  await highlight(page, timePlot); // `highlight` the plot including the legend
  await shot(page, SECTION, '04-time-view'); // `take-screenshot`
  await clearHighlights(page);
});
