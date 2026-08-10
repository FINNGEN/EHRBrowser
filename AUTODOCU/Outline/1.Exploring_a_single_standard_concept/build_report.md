# Build report — `1.Exploring_a_single_standard_concept`

Advisory notes from the last `autodocu build` (full rebuild of this section). Generated — overwritten only when this section is rebuilt; it comments **only** on this section's `README.md`. Your Outline input was **not** modified.

**This section's Outline is substantively clean.** Every previously-flagged mismatch has been addressed in the Outline: the heading spellings (`Overall view`, `Hierarchy panel (left panel)`, `Counts panel (right panel)`) are correct, the *Person Counts* step is now scoped accurately (only the time plot rescales and the **Hierarchy** tree relabels; the **List** and the **Sex / Age / Visit Type** filters stay record-based), the List "down arrow" step correctly describes the *Mapped from* non-standard codes, and the plot-hover step names the **Asthma** area rather than a colour. All **17 steps / screenshots** ran against the live app from a passing spec.

## Keywords

- **No fuzzy keyword matches.** `highlight` and `take-screenshot` are spelled correctly everywhere they appear.

## Verified against the app (no contradictions)

- Grey mapping circles sit on the **left** of a **Standard** **Concept's** tree node and reveal the non-standard codes that map into it — confirmed (`06`/`07`).
- The **List** row arrow expands the same *Mapped from* codes — confirmed (`10`).
- Switching to **Person Counts** rescales the time plot and relabels the tree nodes only — confirmed and documented as such (`17`).

## Result

- Heading hierarchy mirrored exactly: `## Searching for a concept`, `## Overall view` → `### Hierarchy panel (left panel)` (`#### Concept Set`, `#### Hierarchy tree`, `#### List`), `### Counts panel (right panel)`, `### Concept Control (top bar)`.
- Playwright: **1/1 spec passed**. **17/17 screenshots** captured at `1280 × 800`. The whole `Documentation/` tree was removed before this build, so these were adopted as fresh baselines.
- No locator had to be guessed and no `# Run` field defaulted; the notes above are cosmetic, not blocking.
