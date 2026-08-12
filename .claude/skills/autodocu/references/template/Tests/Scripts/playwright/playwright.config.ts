import { defineConfig } from '@playwright/test';

// This config lives in AUTODOCU/Tests/Scripts/playwright, its own npm project.
// Run tests from this folder: `cd AUTODOCU/Tests/Scripts/playwright && npm test`.
// The specs live two levels up, in AUTODOCU/Tests/<section>/, so testDir is '../..'.
//
// `build` overwrites `baseURL` and `viewport` below from the Outline `# Run`
// section — the values here are placeholders.
export default defineConfig({
  testDir: '../..',
  // Only pick up the per-section *.spec.ts files; never descend into this
  // playwright/ folder's deps or scratch.
  testIgnore: ['**/node_modules/**', '**/.pw-artifacts/**', '**/.playwright-cli/**'],
  outputDir: './.pw-artifacts', // scratch — gitignored (see .gitignore)
  fullyParallel: false,
  // One worker: run every section's spec serially. The harness drives a single
  // app instance whose backend may be single-threaded (and slow under emulation),
  // so parallel workers just contend for it and blow per-test timeouts. Serial is
  // also more deterministic for screenshot capture, which is the whole point here.
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:PORT/', // <-- set by build from Outline # Run
    viewport: { width: 1280, height: 800 }, // <-- set by build from # Run (default 1280x800)
    headless: true,
  },
});
