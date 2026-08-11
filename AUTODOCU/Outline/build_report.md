# Build report — root `Outline/README.md`

Advisory notes from the last `autodocu build` (this run built section `4.Working_with_Concept_Sets`; the root Outline is re-read on every build). This file is generated (refreshed every build) and comments **only** on the root `Outline/README.md` — Name, Description, Index, Run and Documentation instruction. Your Outline input was **not** modified.

**The root Outline is clean and complete.** All `# Run` fields were present, the `# Index` rules were unambiguous, and the `# Documentation instruction` was applied throughout. Nothing had to be defaulted or guessed.

## `# Run`

- All fields present — run command (`docker run --rm -p 8563:8563 ehr_browser`), URL (`http://localhost:8563/`), port `8563`, and window size `1280 × 800`. `Scripts/app_control.sh` was generated to match; the tests ran at `1280 × 800`.
- **Note (environment, not the Outline):** during this build the port `8563` was already served by a pre-existing container that the harness did **not** launch. `run_test.sh` still ran correctly against it (its own `start_app` logged a harmless "port is already allocated" and its `stop_app` left the pre-existing container untouched). No action needed.

## `# Index`

- Clear. Rendered as a **Use cases** list, one `**<name>**: <description>` bullet per section linking to its page, with descriptions kept to a similar broad scope — exactly as specified. The index now lists all four sections, with **Working with Concept Sets** appended for this build.

## `# Documentation instruction`

- Applied everywhere: British English; **EHRBrowser**, **OMOP-CDM**, **Concept**, **Concept Set** bolded and upper-cased; acronyms expanded on first use — e.g. **RC** (Record Counts), **DRC** (Descendant Record Counts), **PC** (Person Counts), **DPC** (Descendant Person Counts).

## Result

- This run built only `4.Working_with_Concept_Sets`: Playwright **1/1 spec passed**, **10/10** screenshots captured at `1280 × 800` and adopted as fresh baselines (the section had no prior `Documentation/`). The other sections were left untouched.

Per-section notes live next to each section's input, in `Outline/<section>/build_report.md`.
