# Build report — `1.Exploring_a_single_standard_concept`

Advisory notes from the last `autodocu build` (full rebuild of this section on 2026-11-17, after merging `development`). Generated — overwritten only when this section is rebuilt; it comments **only** on this section's `README.md`. Your Outline input was **not** modified.

**Result:** spec passed; **16 screenshots** captured. One step could not be built because of an app bug (below).

## Blocked by an app bug

- "Click the (i) icon in "Allergic asthma", `take-screenshot`" — in the List view, clicking (i) throws `TypeError: Cannot read properties of null (reading 'style')` and nothing opens. Cause: `src/components/visualization/sideBar.jsx:3335` selects `'#info-container'+d.name` (missing `-`). The step was skipped (commented in the spec) and is not documented. Fix the app, then rebuild.

## Keywords

- No fuzzy keyword matches.

## Instructions that no longer match the app

- "Click the down arrow in the left of 'Intrinsic asthma'" — in the List the arrow is on the **right** of the row, next to the mappings count "(3)". Suggest: "the arrow on the right of 'Intrinsic asthma'".
- "Click in "Female", click in "50-59", click in "PRIM_OUT"" — all filter values start selected and a click **deselects** that value. To show Female / 50–59 / PRIM_OUT the spec deselects Male, the other nine age bands, OUTPAT and RE. Suggest: "filter to only Female, 50-59 and PRIM_OUT (click the other values to deselect them)".
- "switching to 'Person Counts' … the List counts and the Sex/Age/Visit Type filters stay record-based" — out of date. In Person Counts the right panel replaces the time plot with a persons-per-**Concept** (and per combination) chart; the List shows PC/DPC and the filter charts count persons. Suggest rewriting this step.
- "The black line of top shows the DRC" — it is labelled **Total Descendant Counts**, has an on/off switch, and stays unfiltered when Sex/Age/Visit type filters are applied.
- "the full upper bar … with the icon, seach, Descendans/Mappings, Recod Counts/Person Counts, Feedback" — the bar also has **Paste Concept Set**, **Prevalence** and **Incidence**.
- New UI not mentioned in the Outline: **Level** / **Class** filters in the Hierarchy panel, the **Time range** slider, and the **Long.** / **Other** visit-type groups. The doc mentions them briefly; consider adding steps.

## Typos

- "seach", "Descendans", "Recod", "aimed as displaying", "it's descendants", "conded's info", "highligt", "reocrd", "plots how", "Click the again".
