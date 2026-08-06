---
name: autodocu
description: Generate automatic visual documentation for ANY web app from an AUTODOCU/Outline spec. Use when the user asks to "build the docs", "run autodocu", "generate documentation", or "autodocument the app". Reads the Outline, writes and runs Playwright tests to capture annotated screenshots, then writes Markdown documentation pages.
allowed-tools: Bash(docker:*), Bash(npx:*), Bash(npm:*), Bash(playwright-cli:*), Bash(curl:*), Bash(mkdir:*), Bash(ls:*), Bash(find:*), Read, Write, Edit, Glob
---

# autodocu

Turn a human-written **Outline** into runnable **Tests** and rendered **Documentation** for any web app. The app under test is arbitrary — this skill is app-agnostic and reads everything it needs from `AUTODOCU/Outline`.

## The AUTODOCU folder

Lives at the repo root. Three sibling trees that **share the same subfolder skeleton**:

```
AUTODOCU/
  Outline/         # INPUT — hand-written by the user
  Tests/           # GENERATED — Playwright .spec.ts files
  Documentation/   # GENERATED — Markdown pages + screenshots
  playwright.config.ts   # GENERATED — created/updated by this skill
```

Every documentation chapter is a subfolder that appears in **all three** trees with the **identical name**. Folder naming convention: `number.section_in_snake_case` (e.g. `1.exploring_a_single_standard_concept`). The number sets the order; the snake_case part is the slug.

- **`Outline/`** holds the instructions. You only read from it.
- **`Tests/<section>/`** holds the `.spec.ts` you generate for that section.
- **`Documentation/<section>/`** holds the rendered `README.md` for that section and its `screenshots/` folder.

## Outline file formats

### `Outline/README.md` (root, app-level)

Markdown `#` sections:

- **`# Name`** — the app's name.
- **`# Description`** — prose describing the app.
- **`# Index`** — instructions for building the index on the Documentation root page (what to call it, whether it's a list/table, what each entry shows).
- **`# Run`** — how to launch the app: the run command, the URL to navigate to, the port, and the **browser window size** to use (viewport). If no size is stated, default to `1280x800`.
- **`# Documentation instruction`** — *(optional)* global guidance on tone, language, and rendering conventions — including how to draw highlights if you want something other than the default red box. These instructions override defaults everywhere.

### `Outline/<section>/README.md` (per chapter)

- **`# Name`** — the chapter/step name.
- **`# Description`** — overall description of this documentation chapter.
- **`# Sections`** — the body. Uses `##`, `###`, … headings that define the **exact heading hierarchy** the rendered doc page must mirror. Under each heading is a bullet list of **steps**: navigation actions, described areas, and the two keywords below.

### Keywords inside steps

- **`highlight`** — draw a **red box** around the named area of the app. If `# Documentation instruction` specifies a different style, use that instead.
- **`take-screenshot`** — capture a screenshot at this point. Screenshots are saved into that section's `Documentation/<section>/screenshots/` folder.

A step may contain both (e.g. "`highlight` the List selector and `take-screenshot`"), and steps without keywords are just navigation or describe-the-area notes that inform the prose you write later.

## Workflow

Run these phases in order. Process **one section folder at a time**, fully (tests → screenshots → doc page), before moving to the next. `references/test-template.md` has the exact spec-file skeleton and the `highlight`/`shot` helpers — read it before generating tests.

### Phase 0 — Read the Outline

1. Read `AUTODOCU/Outline/README.md`. Extract Name, Description, Index rules, Run command + URL + viewport, and Documentation instruction (if present).
2. `Glob` `AUTODOCU/Outline/*/README.md` to list section folders. Sort by leading number.
3. For each, create the matching `AUTODOCU/Tests/<section>/` and `AUTODOCU/Documentation/<section>/screenshots/` folders (identical names).

### Phase 1 — Scaffold Playwright

Create/refresh `AUTODOCU/playwright.config.ts` (see `references/test-template.md`), setting:
- `use.baseURL` = the URL from the Run section.
- `use.viewport` = the window size from the Run section (default `1280x800`).
- `testDir` = `./Tests`, `outputDir` = a scratch dir (NOT the Documentation tree — screenshots are written explicitly by path, not by Playwright's artifact machinery).

If Playwright isn't installed, install it: `npm install -D @playwright/test && npx playwright install chromium`.

### Phase 2 — Generate + run tests → screenshots (per section)

For each section, in order:

1. **Translate the `# Sections` steps into a `.spec.ts`** at `AUTODOCU/Tests/<section>/<slug>.spec.ts`:
   - One `test(...)` per section, mirroring the Outline. Walk the steps top to bottom.
   - Navigation steps → `page` actions (`getByText`, `getByRole`, `click`, `fill`, `waitForLoadState`, etc.). Prefer role/text locators; use the app's real labels quoted in the Outline.
   - `highlight <area>` → call the `highlight(page, locator)` helper (red box overlay), applying any custom style from Documentation instruction.
   - `take-screenshot` → call `shot(page, section, name)` which writes to `AUTODOCU/Documentation/<section>/screenshots/`. Name screenshots deterministically by their `##`/`###` heading slug + a running index, e.g. `01-searching-for-a-concept.png`, so the doc-writing phase can find them.
   - After each screenshot, call the helper that removes the highlight so it doesn't bleed into later shots.
2. **Launch the app** per the Run section: run the command in the background, then poll the URL with `curl` until it responds (or a sensible timeout).
3. **Run the tests** for this section: `PLAYWRIGHT_HTML_OPEN=never npx playwright test <section> --config=AUTODOCU/playwright.config.ts`.
4. **Verify** the expected `.png` files landed in `Documentation/<section>/screenshots/`. If a locator failed, fix the spec (use `playwright-cli` interactively against the running app to find the right selector — see the playwright-cli skill) and re-run.
5. **Stop the app**: tear down whatever the Run command started (e.g. `docker stop` the container, or kill the background process). The skill launches and stops the app automatically.

Do not hand-fabricate screenshots — they must come from a passing test run against the live app.

### Phase 3 — Render documentation (per section)

Once a section's screenshots exist, write `AUTODOCU/Documentation/<section>/README.md`:

1. Start with the section **Name** as the top `#` heading, then its **Description**.
2. Reproduce the **exact `##`/`###` heading hierarchy** from the Outline `# Sections`.
3. Under each heading, embed the screenshot(s) captured there with a relative path (`![...](screenshots/01-....png)`), and write the prose the steps asked for — turn every "describe the …" instruction into clear explanatory text about that area/picture.
4. Follow the global **Documentation instruction** for tone and language throughout. Never invent UI that isn't in the screenshots.

### Phase 4 — Root index

Write `AUTODOCU/Documentation/README.md`:
- `#` Name and Description from the Outline root.
- Build the index exactly as the `# Index` section dictates (e.g. a heading "Use cases" followed by a list of `**<section name>**: <brief description>`), linking each entry to its section page (`./<section>/README.md`).

## Rules

- **App-agnostic**: never hardcode anything about a specific app — read the Run command, URL, and viewport from `Outline/README.md`. This skill must work for any web app that has an AUTODOCU/Outline.
- **Names stay identical** across the three trees. Create Tests/Documentation folders to exactly match the Outline folder names.
- **Screenshots are the source of truth** for the docs — generate them by running tests, then describe only what they show.
- **Idempotent**: re-running regenerates Tests and Documentation; overwrite generated files, never touch `Outline/`.
- If a section's Outline is ambiguous (a locator you can't resolve, a missing Run command), stop and ask rather than guessing selectors.
