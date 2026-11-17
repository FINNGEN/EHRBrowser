# Build report — `5.Exploring_a_measurement_concept`

Advisory notes from the last `autodocu build` (first build of this section, 2026-11-17). Generated — overwritten only when this section is rebuilt; it comments **only** on this section's `README.md`. Your Outline input was **not** modified.

**Result:** spec passed; **3 screenshots** captured.

## Keywords

- No fuzzy keyword matches.

## Notes

- The button is labelled **Lab Values** in the app (element id `measurement-toggle`), not "Measurement". If it is renamed, update the Outline and rebuild.
- "Describe that the Sex, Age and Visit Type filters … filter the histogram" — there is no screenshot of a filtered histogram, so the doc states it without showing it. Add a filter click + `take-screenshot` if it should be shown.
- The histogram has a tall bar at the right end of the scale (around 155 mg/L). It may be a bin collecting all higher values, but this was not confirmed, so the doc only mentions that it is there. Consider describing it in the Outline.

## App issues seen while building (not Outline issues)

- With the extra **Lab Values** button the top bar overflows: the Descendants/Mappings switch covers "Paste Concept Set" (visible in all screenshots).
- In the Lab Values view, the Hierarchy tree node labels switch to PC/DPC (Person Counts / Descendant Person Counts) although the histogram counts records.
