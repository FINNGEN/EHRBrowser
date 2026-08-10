# Build report — `3.Exploring_a_large_tree_ATC_tree_exaple`

Advisory notes from the last `autodocu build` (first build of this section). Generated — overwritten only when this section is rebuilt; it comments **only** on this section's `README.md`. Your Outline input was **not** modified.

**The section built cleanly:** the spec ran against the live app (ATC code **C10AA**, id `21601855`) and all **7 screenshots** were captured from a passing run. Every documented claim about the pruning tools was verified true. All findings below are cosmetic or advisory — none blocked the build.

## Keywords

- **No fuzzy keyword matches.** `highlight` and `take-screenshot` are spelled correctly everywhere they appear.
- **One `highlight` step had no `take-screenshot` — a capture was added.** Under *Using 'Max Level' pruning tool*: `"`highlight` the 'Hierarchy' tab, and the 'icon expand-compress'"` is followed only by a describe-note, with no `take-screenshot`. A highlight with no capture produces nothing for the doc, so a screenshot was **added** there (`05-hierarchy-expanded`). Add the keyword explicitly to that step if you want it captured on purpose.

## Ambiguous / loose labels (all resolved against the app)

- **Heading typo `"prunning"` → "pruning".** Both section headings read `### Using 'Max Level' prunning tool` / `### Using 'Class' prunning tool`. The nesting was mirrored exactly; the visible heading text was corrected to "pruning" on the rendered page.
- **Control-name casing drifts.** The Outline mixes `'Max Level'` / `'Max level'` and `'Classes'` / `'Class'`. The app labels are **Max Level** and **Classes**; both were matched to the real controls (`#open-levels` / `#dropdown-levels` with `#level-2`, and `#open-classes` / `#dropdown-classes` with the `Ingredient` checkbox). Consider settling on one spelling each.
- **`"icon expand-compress"` is described in words.** It is a single toggle that shows an *expand* icon (`#expand`) and, once clicked, a *compress* icon (`#compress`). Resolved to those; screenshot `05` highlights the compress icon (the one shown after enlarging).

## Verified against the app (no contradictions)

- Setting **Max Level** to `2` cuts the list/tree to the seven immediate level-5 **ATC** children, and the time plot collapses to seven areas — confirmed (`04`).
- Enlarging via the expand/compress icon makes the pruned tree fit the window — confirmed (`05`).
- The **Class** dropdown lists every concept class, with **Ingredient** and **Clinical Drug Comp** deactivated by default (shown greyed-out) — confirmed (`06`).
- Adding **Ingredient** so both it and **ATC 5th** are active makes the stacked areas overflow the black **Root DRC** line, the signal that children are shared (the hierarchy is a graph) — confirmed (`07`).

## Naming (unresolved — your call)

- Folder / name: the folder slug is `3.Exploring_a_large_tree_ATC_tree_exaple` — **`"exaple"` → "example"**. Renaming the folder is your call (the name must stay identical across the `Outline` / `Tests` / `Documentation` trees), so it was **not** changed. All prose typos previously flagged here have since been fixed in the Outline.

## Result

- Heading hierarchy mirrored exactly: `## Loading ATC code C10AA 'HMG CoA reductase inhibitors'` → `### Using 'Max Level' pruning tool`, `### Using 'Class' pruning tool`.
- Playwright: **1/1 spec passed**. **7/7 screenshots** captured at `1280 × 800`. This is a new section; with `Documentation/` removed before the build, all captures were adopted as fresh baselines.
- No `# Run` field was defaulted; the direct navigation target (`/21601855`) was taken from the Outline. The notes above are cosmetic/advisory, not blocking.
