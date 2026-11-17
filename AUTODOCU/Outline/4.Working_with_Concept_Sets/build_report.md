# Build report — `4.Working_with_Concept_Sets`

Advisory notes from the last `autodocu build` (full rebuild of this section on 2026-11-17, after merging `development`). Generated — overwritten only when this section is rebuilt; it comments **only** on this section's `README.md`. Your Outline input was **not** modified.

**Result:** spec passed; **10 screenshots** captured. DRC figures checked: adding Allergic asthma keeps the total at 481,732; excluding it drops the total to 402,284 (481,732 − 79,448) and Allergic asthma's DRC to 0.

## Keywords

- No fuzzy keyword matches.

## Missing steps

- After "`highlight` the SNOMED "Allergic asthma" 4191479, `take-screenshot`" there is a bare `take-screenshot` with no step that adds the concept. The spec clicks the **+ Concept set** control on the search result. Suggest adding "Click '+ Concept set' next to Allergic asthma".
- Same for COPD: no step adds it before "Click on the 'Hierarchy'". Suggest adding the same click.

## Labels that no longer match the app

- "after the "Clear Set" box type the string …" — concepts are now added with the **+ Concept set** control next to each search result.
- "Click on Max level and set level 1" — the dropdown is **Level**, under FILTERS.
- "Chronic Obstructive ..." 255573 — the app shows "Chronic obstructive pulmonary disease" (SNOMED 13645005).
- "'Descendants' [v] box" — suggest "the 'Descendants' checkbox is ticked".
- "Ige-.." — suggest "IgE-mediated allergic asthma".

## Behaviour that differs from the Outline

- "if we chose the person counts this will switch to the number of persons counts … over time" — the app now replaces the time plot with a persons-per-**Concept** bar chart; with Level 1 it shows only **Asthma (8.7K)** and COPD is missing. Possibly an app bug or a data gap — confirm intended behaviour and update the wording.

## Structure

- `# Sections` has no `##` headings, so the doc is one flat page. Suggest headings like "Adding a Concept", "Excluding a Concept", "Adding a second tree", "Simplifying the view".

## App issues seen while building (not Outline issues)

- The expanded search bar overlaps "Send Feedback" and "Record Counts" and blocks clicks on Person Counts; the spec collapses the search with `#searchBtn` after each add.
- Once, during manual exploration only, the page went blank with `Cannot read properties of undefined (reading 'descendants')` after adding COPD from the List view and switching to Hierarchy. Not reproduced in spec runs.
- The exclude state is not kept in the URL.
