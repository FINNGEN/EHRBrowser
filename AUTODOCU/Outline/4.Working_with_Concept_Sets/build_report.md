# Build report — `4.Working_with_Concept_Sets`

Advisory notes from the last `autodocu build` (first build of this section). Generated — overwritten only when this section is rebuilt; it comments **only** on this section's `README.md`.

**The section built cleanly:** the spec ran against the live app (starting from Asthma **SNOMED** id `317009`) and all **10 screenshots** were captured from a passing run. Every quantitative claim in the Outline was verified true against the app (see below). The label/typo findings previously listed here have since been corrected in the Outline (wrong highlight tab, `number 2` → `number 1`, concept-name casing, the collapsed-search-box and expand/compress phrasing, and the prose typos), so future runs read cleanly.

## Keywords

- **No fuzzy keyword matches.** `take-screenshot` and `highlight` are spelled correctly everywhere they appear.

## Verified against the app (no contradictions)

- Adding **Allergic asthma** (a descendant of **Asthma**) leaves the **Total Descendant Counts** unchanged at **481,732** — confirmed (`03`).
- Excluding **Allergic asthma** drives its **DRC** to **0** and drops the set total to **402,284** — i.e. the total loses exactly that branch — confirmed (`04`).
- The excluded branch (**Allergic asthma** + **IgE-mediated allergic asthma**) is greyed in both the **Hierarchy** (`05`) and **List** (`06`) views.
- Adding **Chronic obstructive pulmonary disease** introduces a second, separate tree; **Max Level** 1 collapses each tree to its main **Concept** for a side-by-side time comparison (`08`, `09`).

## Structure (your call)

- **The `# Sections` body has no `##`/`###` headings** — it is a single flat bullet list, so there is no heading hierarchy to mirror. To keep the rendered page readable, short descriptive `##` headings were introduced (Starting from a single Concept → Adding → Excluding → Hierarchy/List → Adding a third Concept → Max Level → Person Counts). If you want a fixed, deterministic structure across future runs, add the headings you want directly to the Outline.

## Result

- Playwright: **1/1 spec passed**. **10/10 screenshots** captured at `1280 × 800`. This is a new section; with `Documentation/` absent before the build, all captures were adopted as fresh baselines.
- No `# Run` field was defaulted; the direct navigation target (`/317009`) was taken from the Outline. The notes above are cosmetic/advisory, not blocking.
