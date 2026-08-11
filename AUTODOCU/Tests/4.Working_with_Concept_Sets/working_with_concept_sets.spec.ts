import { test, expect, Page } from '@playwright/test';
import { highlight, clearHighlights, shot } from '../Scripts/playwright/_helpers';

const SECTION = '4.Working_with_Concept_Sets'; // must equal the folder name

// Concept ids discovered against the live app:
const ASTHMA = '317009';    // Asthma (SNOMED) — the starting concept
const ALLERGIC = '4191479'; // Allergic asthma (SNOMED), code 389145006
const COPD = '255573';      // Chronic obstructive pulmonary disease (SNOMED)

// The concept-set search box is collapsed until the magnifier (#searchBtn)
// expands it; then #searchConcept accepts typing and #suggestion-<id> rows
// appear. Type behind the "Clear Set" box and click the wanted suggestion.
async function addBySearch(page: Page, query: string, conceptId: string) {
  await page.locator('#searchBtn').click();
  await page.waitForTimeout(500);
  const box = page.locator('#searchConcept');
  const suggestion = page.locator(`#suggestion-${conceptId}`);
  // On a cold vocabulary index the first keystrokes may return nothing; retry.
  await expect(async () => {
    await box.fill('');
    await box.pressSequentially(query, { delay: 40 });
    await expect(suggestion).toBeVisible({ timeout: 3000 });
  }).toPass({ timeout: 30000 });
  return suggestion;
}

// The Max Level dropdown: #open-levels toggles #dropdown-levels; picking an
// option can close it, so reopen only when it is not already visible.
async function ensureLevelsOpen(page: Page) {
  const dd = page.locator('#dropdown-levels');
  if (!(await dd.isVisible().catch(() => false))) {
    await page.locator('#open-levels').click();
  }
  await dd.waitFor({ state: 'visible' });
  await page.waitForTimeout(400);
}

test('working with concept sets', async ({ page }) => {
  // Ten screenshots, each after an animation-settle wait, so well above 30s.
  test.setTimeout(300000);

  // Start from the Asthma concept (as in section 1). It loads as a Concept Set
  // holding Asthma with its 'Descendants' box marked.
  await page.goto(`/${ASTHMA}`, { waitUntil: 'networkidle', timeout: 120000 });
  await page.locator('#set-items').waitFor({ state: 'visible' });
  await page.locator(`#set-item-${ASTHMA}`).waitFor({ state: 'visible' });
  await page.waitForTimeout(1200);
  await shot(page, SECTION, '01-concept-set-asthma');

  // Search behind the "Clear Set" box for "Aller" and highlight the SNOMED
  // "Allergic asthma" suggestion.
  const allergicSuggestion = await addBySearch(page, 'Aller', ALLERGIC);
  await highlight(page, allergicSuggestion);
  await shot(page, SECTION, '02-search-allergic-asthma');
  await clearHighlights(page);

  // Click the suggestion to add it. Allergic asthma is a child of Asthma, so the
  // total descendant count is unchanged.
  await allergicSuggestion.click();
  await page.locator(`#set-item-${ALLERGIC}`).waitFor({ state: 'visible' });
  await page.waitForTimeout(1200);
  await shot(page, SECTION, '03-allergic-asthma-added');

  // Exclude Allergic asthma: its DRC drops to 0 and the set total loses that
  // amount. Highlight the 'Exclude' box for that concept.
  const excludeBox = page.locator(`#set-item-${ALLERGIC} .exclude-box`);
  await excludeBox.click();
  await page.waitForTimeout(1200);
  await highlight(page, excludeBox);
  await shot(page, SECTION, '04-allergic-asthma-excluded');
  await clearHighlights(page);

  // Hierarchy view: the excluded Allergic asthma (and its IgE-mediated child)
  // are greyed out — no longer part of the set.
  await page.locator('#tree-toggle').click();
  await page.locator(`#tree-node-${ASTHMA}`).waitFor({ state: 'visible' });
  await page.waitForTimeout(1500);
  await highlight(page, page.locator('#tree-toggle'));
  await shot(page, SECTION, '05-hierarchy-excluded-greyed');
  await clearHighlights(page);

  // List view: the same exclusion shows as greyed rows.
  await page.locator('#list-toggle').click();
  await page.locator('#list-container').waitFor({ state: 'visible' });
  await page.waitForTimeout(1200);
  await highlight(page, page.locator('#list-toggle'));
  await shot(page, SECTION, '06-list-excluded-greyed');
  await clearHighlights(page);

  // Back to the Concept Set view, search "Chronic obs" and highlight the SNOMED
  // "Chronic obstructive pulmonary disease" suggestion.
  await page.locator('#set-toggle').click();
  await page.waitForTimeout(800);
  const copdSuggestion = await addBySearch(page, 'Chronic obs', COPD);
  await highlight(page, copdSuggestion);
  await shot(page, SECTION, '07-search-chronic-obstructive');
  await clearHighlights(page);

  // Add COPD (a third, separate concept), then view the Hierarchy and enlarge it
  // with the expand icon so the new tree is visible.
  await copdSuggestion.click();
  await page.locator(`#set-item-${COPD}`).waitFor({ state: 'visible' });
  await page.waitForTimeout(1000);
  await page.locator('#tree-toggle').click();
  await page.locator(`#tree-node-${COPD}`).waitFor({ state: 'visible' });
  await page.waitForTimeout(1500);
  await page.locator('#expand').click();
  await page.waitForTimeout(2000);
  await shot(page, SECTION, '08-hierarchy-three-concepts');

  // Prune with the 'Max Level' tool (as in section 3): set level 1 so only the
  // main concepts' descendant counts show, side by side over time.
  await ensureLevelsOpen(page);
  await page.locator('#level-1').click();
  await page.waitForTimeout(2500);
  await ensureLevelsOpen(page);
  await highlight(page, page.locator('#level-1'));
  await shot(page, SECTION, '09-max-level-1');
  await clearHighlights(page);
  if (await page.locator('#dropdown-levels').isVisible().catch(() => false)) {
    await page.locator('#close-levels').click().catch(() => {});
    await page.waitForTimeout(400);
  }

  // Switch to 'Person Counts': the plot rescales to the number of persons
  // getting each diagnosis over time. Retry the toggle in case a prior
  // animation swallows the click.
  await expect(async () => {
    await page.locator('#person-toggle').click();
    await expect(page.locator('#person-toggle')).toHaveCSS('font-weight', '500', { timeout: 2000 });
  }).toPass({ timeout: 20000 });
  await page.waitForTimeout(1500);
  await highlight(page, page.locator('#person-toggle'));
  await shot(page, SECTION, '10-person-counts');
  await clearHighlights(page);
});
