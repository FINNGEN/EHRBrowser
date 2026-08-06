---
name: autodocu
description: Generate automatic visual documentation for ANY web app from an AUTODOCU/Outline spec. Two commands - `init` scaffolds the AUTODOCU folder from a template; `build [section]` reads the Outline, writes and runs Playwright tests to capture annotated screenshots, then writes Markdown documentation pages. Use when the user asks to "init autodocu", "build the docs", "run autodocu", "generate documentation", or "autodocument the app".
allowed-tools: Bash(docker:*), Bash(npx:*), Bash(npm:*), Bash(playwright-cli:*), Bash(curl:*), Bash(mkdir:*), Bash(cp:*), Bash(ls:*), Bash(find:*), Read, Write, Edit, Glob
---

# autodocu

Turn a human-written **Outline** into runnable **Tests** and rendered **Documentation** for any web app. The app under test is arbitrary — this skill is app-agnostic and reads everything it needs from `AUTODOCU/Outline`.

The skill has two commands:

- **`init`** — scaffold a fresh `AUTODOCU/` folder from the template (folder structure + placeholder Outline + the isolated Tests workspace). Run once, before the user fills in the Outline.
- **`build [section]`** — read the Outline and generate the tests + documentation. With no argument it builds every section; with a section name it builds only that one.

Decide which command applies from what the user asked. If they say "init" / "set up autodocu" / "scaffold", run **init**. If they say "build" / "generate the docs" / "autodocument", run **build** (and pass the section if they named one).

## The AUTODOCU folder

Lives at the repo root. Three sibling trees that **share the same subfolder skeleton**:

```
AUTODOCU/
  Outline/         # INPUT — hand-written by the user
  Tests/           # GENERATED — per-section specs + a playwright/ workspace (see below)
  Documentation/   # GENERATED — Markdown pages + screenshots
```

Every documentation chapter is a subfolder that appears in **all three** trees with the **identical name**. Folder naming convention: `number.section_in_snake_case` (e.g. `1.exploring_a_single_standard_concept`). The number sets the order; the snake_case part is the slug.

- **`Outline/`** holds the instructions. You only read from it.
- **`Tests/<section>/`** holds the `.spec.ts` you generate for that section.
- **`Documentation/<section>/`** holds the rendered `README.md` for that section and its `screenshots/` folder.

## Layout of `AUTODOCU/Tests` and its `playwright/` workspace

`Tests/` is kept clean — it contains **only** the per-section spec folders, one
`playwright/` folder holding all the infrastructure, and `README.md`:

```
AUTODOCU/Tests/
  README.md
  playwright/                     # the self-contained npm workspace (ALL infra)
    package.json                  # only dependency: @playwright/test
    package-lock.json
    playwright.config.ts          # testDir: '..'  (specs are one level up)
    _helpers.ts                   # highlight / clearHighlights / shot
    .gitignore                    # ignores node_modules, .pw-artifacts, .playwright-cli, ...
    node_modules/                 # (ignored)
    .pw-artifacts/                # (ignored) Playwright outputDir scratch
  <n.section_slug>/
    <slug>.spec.ts                # imports from '../playwright/_helpers'
```

**Critical rule: nothing autodocu does may touch the main app.** Playwright is never added to the app's root `package.json` / `package-lock.json`, and no Playwright scratch is ever written outside `AUTODOCU/Tests/playwright`.

Key facts that make this work:

- The npm project root is **`AUTODOCU/Tests/playwright`** — its own `package.json`, `node_modules`, `package-lock.json`.
- `playwright.config.ts` uses `testDir: '..'` so it discovers `AUTODOCU/Tests/<section>/*.spec.ts`, and `outputDir: './.pw-artifacts'` so scratch stays inside `playwright/`.
- Because the specs sit one level **above** `node_modules`, Node can't find `@playwright/test` by the normal walk. The `playwright/package.json` `test` script sets `NODE_PATH="$PWD/node_modules"` to fix this — so **run tests with `npm test`** (or, if calling the binary directly, prefix `NODE_PATH="$PWD/node_modules" npx playwright test`).
- **Always run npm/Playwright/`playwright-cli` from inside `AUTODOCU/Tests/playwright`.** Running from there keeps every artifact — `node_modules/`, `.pw-artifacts/`, the `playwright-cli` tool's `.playwright-cli/` dumps — inside `playwright/`, where `playwright/.gitignore` ignores them.
- Committed sources: `Tests/README.md`, each `Tests/<section>/<slug>.spec.ts`, and under `Tests/playwright/`: `package.json`, `package-lock.json`, `playwright.config.ts`, `_helpers.ts`, `.gitignore`. Everything else is ignored.

`Tests/README.md` documents this layout for humans — the template ships it.

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

---

# Command: `init`

Scaffold a fresh `AUTODOCU/` from the template so the user has a structure to fill in.

The template lives at `references/template/` next to this SKILL.md. Its tree:

```
references/template/
  Outline/
    README.md                       # placeholders: "Replace with the app name", etc.
    1.Section_template_1/README.md  # example section with the keyword steps
    2.Section_template_2/README.md  # second example section
  Tests/
    README.md                       # explains the Tests layout + playwright/ workspace
    playwright/
      package.json                  # the isolated npm project (test script sets NODE_PATH)
      playwright.config.ts          # baseURL/viewport are placeholders build fills in
      _helpers.ts                   # highlight / clearHighlights / shot
      .gitignore                    # ignores node_modules, .pw-artifacts, etc.
```

Steps:

1. **Refuse to clobber.** If `AUTODOCU/Outline/` already exists, stop and tell the user — `init` is for first-time scaffolding and must never overwrite hand-written Outline content. (Re-scaffolding a single missing infra file is fine; overwriting an Outline is not.)
2. **Copy the template.** `cp -R references/template/. AUTODOCU/` — this copies the dotfiles (`.gitignore`) too. This creates `AUTODOCU/Outline` and `AUTODOCU/Tests`.
3. Do **not** create `AUTODOCU/Documentation` yet — `build` creates it per section.
4. Tell the user what to do next: edit `AUTODOCU/Outline/README.md` (fill in Name/Description/Index/Run) and the section folders (rename `1.Section_template_1` → `number.your_section`, write the `# Sections` steps), then run **build**.

Do not install dependencies or run anything during `init` — it is pure scaffolding.

---

# Command: `build [section]`

Read the Outline and produce tests + documentation. Process **one section folder at a time**, fully (tests → screenshots → doc page), before moving to the next. If a `section` argument is given, build **only** that section (still refresh the config and, at the end, the root index). `references/test-template.md` has the exact spec-file skeleton and the `highlight`/`shot` helpers — read it before generating tests.

### Phase 0 — Read the Outline

1. Read `AUTODOCU/Outline/README.md`. Extract Name, Description, Index rules, Run command + URL + port + viewport, and Documentation instruction (if present).
2. `Glob` `AUTODOCU/Outline/*/README.md` to list section folders. Sort by leading number. If a `section` argument was given, keep only that folder (error if it doesn't exist).
3. For each section to build, create the matching `AUTODOCU/Tests/<section>/` and `AUTODOCU/Documentation/<section>/screenshots/` folders (identical names).

### Phase 1 — Ensure the isolated Tests workspace

Everything here happens inside `AUTODOCU/Tests/playwright` — never the repo root.

1. If `AUTODOCU/Tests/playwright/package.json` is missing (e.g. the user never ran `init`), copy the Tests template into place: `cp -R references/template/Tests/. AUTODOCU/Tests/`.
2. Update `AUTODOCU/Tests/playwright/playwright.config.ts`: set `use.baseURL` from the Run URL/port and `use.viewport` from the Run window size (default `1280x800`). Leave `testDir` (`..`), `testIgnore`, and `outputDir` as the template has them.
3. Install into the isolated project if needed:
   ```bash
   cd AUTODOCU/Tests/playwright && npm install && npm run install-browsers
   ```
   `npm install` here writes only `AUTODOCU/Tests/playwright/node_modules` + `.../playwright/package-lock.json`. It must never modify the app's root manifests.

### Phase 2 — Generate + run tests → screenshots (per section)

For each section, in order:

1. **Translate the `# Sections` steps into a `.spec.ts`** at `AUTODOCU/Tests/<section>/<slug>.spec.ts`:
   - One `test(...)` per section, mirroring the Outline. Walk the steps top to bottom.
   - Import the helpers from `'../playwright/_helpers'` (the specs sit beside the `playwright/` folder).
   - Navigation steps → `page` actions (`getByText`, `getByRole`, `click`, `fill`, `waitForLoadState`, etc.). Prefer role/text locators; use the app's real labels quoted in the Outline.
   - `highlight <area>` → call the `highlight(page, locator)` helper (red box overlay), applying any custom style from Documentation instruction.
   - `take-screenshot` → call `shot(page, section, name)` which writes to `AUTODOCU/Documentation/<section>/screenshots/`. Name screenshots deterministically by their `##`/`###` heading slug + a running index, e.g. `01-searching-for-a-concept.png`, so the doc-writing phase can find them.
   - After each screenshot, call `clearHighlights(page)` so a highlight doesn't bleed into later shots.
   - `SECTION` in the spec must equal the folder name exactly.
2. **Launch the app** per the Run section: run the command in the background, then poll the URL with `curl` until it responds (or a sensible timeout).
3. **Run the tests** for this section, **from inside the workspace**:
   ```bash
   cd AUTODOCU/Tests/playwright && npm test -- <section>
   ```
   (`npm test` sets `NODE_PATH` so the specs one level up resolve `@playwright/test`; no `--config` needed — the config is in the current dir.)
4. **Verify** the expected `.png` files landed in `Documentation/<section>/screenshots/`. If a locator failed, fix the spec and re-run. To resolve a locator described in words, run `playwright-cli` **from inside `AUTODOCU/Tests/playwright`** against the running app so its `.playwright-cli/` dumps stay inside the workspace (see the playwright-cli skill and `references/test-template.md`).
5. **Stop the app**: tear down whatever the Run command started (e.g. `docker stop` the container, or kill the background process). The skill launches and stops the app automatically.

Do not hand-fabricate screenshots — they must come from a passing test run against the live app.

### Phase 3 — Render documentation (per section)

Once a section's screenshots exist, write `AUTODOCU/Documentation/<section>/README.md`:

1. Start with the section **Name** as the top `#` heading, then its **Description**.
2. Reproduce the **exact `##`/`###` heading hierarchy** from the Outline `# Sections`.
3. Under each heading, embed the screenshot(s) captured there with a relative path (`![...](screenshots/01-....png)`), and write the prose the steps asked for — turn every "describe the …" instruction into clear explanatory text about that area/picture.
4. Follow the global **Documentation instruction** for tone and language throughout. Never invent UI that isn't in the screenshots.

### Phase 4 — Root index

Write `AUTODOCU/Documentation/README.md` (always refresh it, even for a single-section build):
- `#` Name and Description from the Outline root.
- Build the index exactly as the `# Index` section dictates (e.g. a heading "Use cases" followed by a list of `**<section name>**: <brief description>`), linking each entry to its section page (`./<section>/README.md`).

## Rules

- **App-agnostic**: never hardcode anything about a specific app — read the Run command, URL, port, and viewport from `Outline/README.md`. This skill must work for any web app that has an AUTODOCU/Outline.
- **Isolation**: Playwright and all its scratch stay inside `AUTODOCU/Tests/playwright`. Never add Playwright to the app's root `package.json`; never run `npm`/`npx`/`playwright-cli` from the repo root for autodocu work — always `cd AUTODOCU/Tests/playwright` first, and run tests via `npm test` (which sets `NODE_PATH`).
- **Names stay identical** across the three trees. Create Tests/Documentation folders to exactly match the Outline folder names.
- **Screenshots are the source of truth** for the docs — generate them by running tests, then describe only what they show.
- **Idempotent**: re-running `build` regenerates Tests specs and Documentation; overwrite generated files, never touch `Outline/`. `init` refuses to overwrite an existing Outline.
- If a section's Outline is ambiguous (a locator you can't resolve, a missing Run command), stop and ask rather than guessing selectors.
