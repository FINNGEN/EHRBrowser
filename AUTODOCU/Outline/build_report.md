# Build report

Advisory notes from the last `autodocu build` (section `1.Exploring_a_single_standard_concept`). This file is generated (overwritten every build); your Outline input was **not** modified by the build itself.

The section was substantially expanded since the previous build (17 steps / screenshots across four panels). Every step ran against the live app and all 17 screenshots were captured from a passing run — but several descriptions in the Outline disagree with what the app actually does, and a few headings/labels contain typos. Details below; nothing blocked the build.

## `Outline/README.md`

- **`# Documentation instruction` — typos in the instruction itself.** `"Use Britih English"` → "British"; `"Hihglight the following key workds"` → "Highlight … key words"; `"star them with high case"` → presumably "start them with upper case"; `"expand the acronims … in parentesis"` → "acronyms … parentheses". The intent was clear and was applied (British English, bold **EHRBrowser** / **OMOP-CDM** / **Concept** / **Concept Set**, acronyms expanded on first use), but the instruction text is worth tidying.
- **`# Run` — harmless prose typos remain** (do not affect the build): `"Lauch the docker image"` → "Launch"; `"Navegate to"` → "Navigate to"; and a double space in the run command (`8563  ehr_browser`, ignored by the shell). All required `# Run` fields were present — command, URL, port `8563`, window size `1280 × 800` — nothing had to be defaulted.

## `Outline/1.Exploring_a_single_standard_concept/README.md`

- **Heading typos — rendered corrected, please confirm.** The `# Sections` headings read `## Overlall view` (→ "Overall view"), `### Hierarchy pannel (left pannel)` and `### Counts pannel (right pannel)` (→ "panel"). The heading *structure/nesting* was mirrored exactly, but the visible text was corrected in the rendered doc for a polished result. If you prefer the headings verbatim, fix them in the Outline.
- **Concept-name typo:** `"Intrisic asthma"` (steps under Hierarchy tree and List) → the app label is **"Intrinsic asthma"** (id `4145497`). Documented under the correct name. Also `"magnifiginglass"` (Hierarchy-tree step) → "magnifying glass".
- **Two `highlight` steps have no `take-screenshot`.** Under *Counts panel* → `"highlight the filter on the top of the plot in one box (Sex, Age, Visit Type)"`, and under *Concept Control* → `"highlight the full upper bar of the page …"`. A highlight with no capture produces nothing for the doc, so a `take-screenshot` was **added** to each (screenshots `13-counts-panel-filters` and `15-concept-control-bar`). Add the keyword explicitly if you want these captured on purpose.
- **List "down arrow" description is wrong.** The step says `"clicking the down arrow opens the descendant codes"`. In the app the **List already shows every descendant grouped by tree level**; the down arrow (with the `(N)` count) actually expands the **non-standard codes mapped to that concept** (shown under *Mapped from* — e.g. ICD10 / ICD9fi for Intrinsic asthma), i.e. the same behaviour as the tree's grey mapping circles. The screenshot (`10-list-mappings-open`) shows the mapped codes, and the prose describes them accurately rather than as "descendants".
- **Person Counts is overstated.** The step says switching to *Person Counts* shows PC/DPC `"in the list, hierarchy, time plot and filters"`. In the app only the **time plot** rescales to person counts and the **Hierarchy tree** node labels switch to PC/DPC. The **List** count labels stay `RC` / `DRC` (hardcoded) and its numbers stay record-based; the **Sex / Age / Visit Type** filters stay record-based; and the plot's y-axis title stays "Record Counts". The doc describes the plot rescaling to **PC** (Person Counts) / **DPC** (Descendant Person Counts) and avoids claiming the list and filters relabel. Consider narrowing the wording, or switch the left panel to **Hierarchy** for this step so the PC/DPC labels are actually visible.
- **"Red area" is colour-dependent.** The *Counts panel* step says to hover "the red area". Which concept is red depends on the colour assignment; here the root **Asthma** layer happens to be dark red, so the build hovered the root area (the tooltip in `12-counts-panel-hover` confirms it is Asthma, id `317009`). Referring to a concept by name rather than colour would be more robust.

## Result

- Playwright: **1/1 spec passed**. Screenshot diffs: **17/17 passed** (all `1280 × 800`, 0.00 % change), total **18/18** rows. See `Tests/test_report.md`.
- No locator had to be guessed and no `# Run` field had to be defaulted; the mismatches above are descriptive, not blocking.
