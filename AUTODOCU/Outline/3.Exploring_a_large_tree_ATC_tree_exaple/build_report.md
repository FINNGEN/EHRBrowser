# Build report — `3.Exploring_a_large_tree_ATC_tree_exaple`

Advisory notes from the last `autodocu build` (full rebuild of this section on 2026-11-17, after merging `development`). Generated — overwritten only when this section is rebuilt; it comments **only** on this section's `README.md`. Your Outline input was **not** modified.

**Result:** spec passed; **7 screenshots** captured.

## Keywords

- No misspelled keywords, but "`highlight` the "Hierarchy" tab, and the expand/compress icon" has no `take-screenshot`, so the highlight would never be visible. A screenshot was taken anyway (05). Suggest adding `take-screenshot`.

## Labels that no longer match the app

- "Max Level" / "Classes" are now **Level** / **Class** under **FILTERS** — rename in the steps and in the headings "Using 'Max Level' pruning tool" / "Using 'Classes' pruning tool".
- "overflows the back 'Root DRC'" — the black line is labelled **Total Descendant Counts**.
- "each pair has an arrow that points down to the same children" — the tree draws converging **lines**, not arrows.

## Ambiguous / inaccurate

- "Click on the "Ingredient"" — clicking the label text closes the dropdown without selecting; only the circle next to it selects. Suggest "click the circle next to "Ingredient"".
- After expanding, the expand icon turns into the compress icon, so the compress icon was highlighted. Suggest "highlight the expand/compress icon after expanding".
- "the RxNorm tree extends 5 more levels down and includes over 100 nodes" — the List stops at **Level 5**, i.e. 3 levels below the ATC level 5 children; "over 100" was not verified and is not stated in the docs.
- "Hence if we select both classes, "Ingredient" and "ATC 5th"." — unfinished sentence.
- "wait, it may take some time to load" — no condition given; the spec waits for "Total Descendant Counts:" (up to 5 min). It loaded in seconds in this run.
- The Hierarchy screenshot shows the tree squeezed into one thin row that does fit horizontally; "does not fit in the display" was reworded to "cannot be read at this size".

## Typos

- "exaple" (folder name and Name) → "example". Fixing it means renaming the folder in all three trees.
