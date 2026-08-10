# Build report — `2.Exploring_a_single_non-standard_concept`

Advisory notes from the last `autodocu build` of this section. Generated (overwritten only when this section is rebuilt); it comments **only** on this section's `README.md`. Your Outline input was **not** modified.

The section built cleanly: the spec ran against the live app and all **4 screenshots** were captured from a passing run. Every documented claim about the non-standard behaviour was verified true (see Result). A few small things are worth tidying, none of them blocked the build.

## Keywords

- **No fuzzy keyword matches.** `highlight` and `take-screenshot` are spelled correctly everywhere they appear — nothing had to be loosely matched.

## Ambiguous / loose labels

- **`"Hover over 'Asthma ICD'"` is ambiguous.** Searching `Asthma` returns several ICD variants side by side — `AsthmaICPC`, `AsthmaICD9fi`, **`AsthmaICD10`**, `AsthmaSNOMED`, … . `'Asthma ICD'` alone matches more than one. The next step names `'Asthma ICD10'`, so that is what was targeted: the **ICD10** concept, code **J45**, id `45596282`. Consider writing `'Asthma ICD10'` in both steps.
- **Rendered label has no space.** The app concatenates name + vocabulary, so the result reads `AsthmaICD10` (not `Asthma ICD10`). Matched anyway; just noting the on-screen text.

## Verified against the app (no contradictions)

Everything the Outline claims about the non-standard differences is correct and is documented as-is:

- Grey mapping circle **on the right** of each **Hierarchy** tree node (for a non-standard concept) — confirmed.
- Clicking that circle **expands the standard concept it maps to** (SNOMED Asthma, id `317009`) — confirmed.
- The **List** row arrow reveals the **"Maps to"** standard concept — confirmed.

## List "Maps to" — described, not screenshotted

- **The List section requests one `take-screenshot`** (`04-list`, the List selector highlighted), and that is the only List capture. The following describe-step talks about the left-hand arrow expanding the `"Maps to"` standard concept; that behaviour is described in prose on the rendered page (the arrow is visible in `04-list`) rather than given its own screenshot, since a dedicated capture of the expanded row was judged unhelpful. Add an explicit `take-screenshot` to that describe-step if you ever do want it captured.

## Typos (prose only — non-blocking)

These are in `# Description` and the describe-notes, so they don't affect the build, but the intended text was corrected in the rendered page:

- `# Description`: **`"OMOP-CDP"` → "OMOP-CDM"** (worth fixing — it names the data model); `"understant"` → "understand".
- Describe-notes: `"Descrive"` (×5) → "Describe"; `"similart"` → "similar"; `"non-standar"` / `"conceps"` → "non-standard" / "concepts"; `"expans"` → "expands"; `"standar concepts"` → "standard concepts"; `"aswell"` → "as well"; `"smae"` → "same".

## Handling of the "same as section 1" notes

- The steps `"add link to section 1"` and `"the rest of the tool behaves the same way as section 1"` were honoured: the rendered page links back to `../1.Exploring_a_single_standard_concept/README.md` and defers the counts / person-counts / filter walkthrough to it rather than repeating it.

## Result

- Heading hierarchy mirrored exactly: `## Searching for a concept` → `### Hierarchy panel (left panel)` → `#### Hierarchy tree`, `#### List`.
- Playwright: **1/1 spec passed**. **4/4 screenshots** captured at `1280 × 800` into `Documentation/2.Exploring_a_single_non-standard_concept/screenshots/`. This is a new section, so there was no prior committed baseline to diff against — the captures are the initial baseline.
- No locator had to be guessed and no `# Run` field defaulted; the notes above are cosmetic, not blocking.
