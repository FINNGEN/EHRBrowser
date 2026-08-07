# Build report

Advisory notes on how to make the Outline clearer for future builds. Nothing in `Outline/` was modified — these are suggestions only.

## `Outline/README.md`

- **Missing browser window size.** The `# Run` section gives the command and URL but no viewport size. Defaulted to `1280x800`. Consider stating it explicitly, e.g. `Window size: 1280x800`.
- **`# Run` has no explicit port field.** The port (`8563`) was inferred from the `docker run -p 8563:8563` command and the URL. That inference is safe here, but stating the port on its own line would remove the guesswork.
- **Typos in the run instructions (cosmetic).** `"Lauch the docker image"` → "Launch", and `"Navegate to"` → "Navigate to". These don't affect the build.

## `Outline/1.Exploring_a_single_standard_concept/README.md`

### Fuzzy-matched keywords (accepted, but worth correcting)

- Line: `Hover over 'Astma SNOMED', `higlight` the 'Astma SNOMED' concept in the list` — `higlight` was read as **`highlight`**.
- Line: ``highligth` the 'List' selector` — `highligth` was read as **`highlight`**.
- Line: ``highligth` the plot in the left side` — `highligth` was read as **`highlight`**.

### Wrong / ambiguous labels

- **Concept name `'Astma SNOMED'` does not match the app.** The real suggestion is **`AsthmaSNOMED`** (displayed as "Asthma" + vocabulary "SNOMED"), standard concept `Id: 317009`, `Code: 195967001`. `'Astma'` is missing the `h`. Suggested fix: quote it as `Asthma (SNOMED)` or `AsthmaSNOMED`.

### Contradictory location

- **"Time view" plot said to be on the "left side".** The step ``highligth` the plot in the left side including the legend with the colored concepts` places the plot on the left, but the record-counts-over-time plot **and** its colored-concept legend are in the **right** area (element `#graph-group`, inside `#graph-section-container`). The left area holds the descendant list/hierarchy instead. The screenshot (`04-time-view.png`) highlights the actual right-side plot. Suggested fix: change "in the left side" to "in the right area".

### Minor prose typos (do not affect the build, but appear in step text)

- `"Descrive"` → "Describe" (appears twice), `"swithc"` → "switch", `"diffeent"` → "different", `"hierarachy"` → "hierarchy", `"acrost"` → "across", `"breafly"` → "briefly". These are inside describe-the-area notes, so they only guided prose, not locators.

## Summary

The single section built cleanly and all four screenshots were captured from a passing test run against the live app. The only substantive issue was the **"left side" vs. right-area** contradiction for the time plot; everything else was spelling that was matched loosely.
