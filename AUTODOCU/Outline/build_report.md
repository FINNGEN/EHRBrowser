# Build report — root `Outline/README.md`

Advisory notes from the last `autodocu build` (full rebuild of all four sections on 2026-11-17, after merging `development`; the root Outline is re-read on every build). This file is generated (refreshed every build) and comments **only** on the root `Outline/README.md` — Name, Description, Index, Run and Documentation instruction. Your Outline input was **not** modified.

**The root Outline is clean and complete.** All `# Run` fields were present, the `# Index` rules were unambiguous, and the `# Documentation instruction` was applied throughout.

## `# Run`

- All fields present — run command (`docker run --rm -p 8563:8563 ehr_browser`), URL (`http://localhost:8563/`), port `8563`, window size `1280 × 800`. `Scripts/app_control.sh` matches.
- **Note (environment, not the Outline):** the `ehr_browser` image used was built from commit `b39f090` (`development` plus the agent-control hooks). The specs use element ids rather than the agent-control ARIA labels, so they also work on an image built from `development`.

## `# Index`

- Clear. Rendered as a **Use cases** list linking each section. The large-tree entry now names the **Level** and **Class** filters (renamed in the app from "Max Level" / "Classes").

## `# Documentation instruction`

- Applied everywhere: British English; **EHRBrowser**, **OMOP-CDM**, **Concept**, **Concept Set** bolded; acronyms expanded — e.g. **RC** (Record Counts), **DRC** (Descendant Record Counts), **PC** (Person Counts), **DPC** (Descendant Person Counts).

## Result

- All four sections rebuilt; each spec passed. Screenshots: section 1 — 16, section 2 — 4, section 3 — 7, section 4 — 10.
- Section 1 has one step skipped because of an app bug (List (i) icon); see its report.

Per-section notes live next to each section's input, in `Outline/<section>/build_report.md`.
