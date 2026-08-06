import { defineConfig } from '@playwright/test';

// This config lives in AUTODOCU/Tests/playwright, its own npm project.
// Run tests from this folder: `cd AUTODOCU/Tests/playwright && npx playwright test`.
// The specs live one level up, in AUTODOCU/Tests/<section>/, so testDir is '..'.
export default defineConfig({
  testDir: '..',
  // Only pick up the per-section *.spec.ts files; never descend into this
  // playwright/ folder's deps or scratch.
  testIgnore: ['**/node_modules/**', '**/.pw-artifacts/**', '**/.playwright-cli/**'],
  outputDir: './.pw-artifacts', // scratch — gitignored (see .gitignore)
  fullyParallel: false,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:8563/', // <-- from Outline # Run
    viewport: { width: 1280, height: 800 }, // <-- window size from # Run (default 1280x800)
    headless: true,
  },
});
