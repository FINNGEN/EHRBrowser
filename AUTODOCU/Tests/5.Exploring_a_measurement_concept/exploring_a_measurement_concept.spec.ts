import { test, expect, Page } from '@playwright/test';
import { highlight, clearHighlights, shot } from '../Scripts/playwright/_helpers';

const SECTION = '5.Exploring_a_measurement_concept';

// Keep the mouse off the charts so no hover tooltip leaks into a screenshot.
async function parkMouse(page: Page) {
  await page.mouse.move(256, 790);
}

test('Exploring a measurement Concept', async ({ page }) => {
  test.setTimeout(300_000);

  // ## Loading a measurement concept
  await page.goto('/40652733');
  await expect(page.getByText('Total Descendant Counts:')).toBeVisible({ timeout: 180_000 });
  await expect(page.locator('#measurement-toggle')).toBeVisible({ timeout: 60_000 });
  // The Sex / Age / Visit type charts load after the time plot.
  await expect(page.getByText('Female', { exact: true })).toBeVisible({ timeout: 120_000 });

  await page.locator('#tree-toggle').click();
  await page.waitForTimeout(3000);
  await parkMouse(page);
  await shot(page, SECTION, '01-loading-a-measurement-concept');

  // ## Lab Values view
  await highlight(page, page.locator('#measurement-toggle'));
  await shot(page, SECTION, '02-lab-values-button');
  await clearHighlights(page);

  // The plot redraws as a histogram with "Measured value (<unit>)" on the x axis.
  await page.locator('#measurement-toggle').click();
  await page.locator('svg text').filter({ hasText: /^Measured value/ }).first()
    .waitFor({ state: 'visible', timeout: 120_000 });
  await page.waitForTimeout(3000);
  await highlight(page, page.locator('#graph-group'), 'outline: 3px solid red; outline-offset: -3px;');
  await parkMouse(page);
  await shot(page, SECTION, '03-lab-values-plot');
  await clearHighlights(page);
});
