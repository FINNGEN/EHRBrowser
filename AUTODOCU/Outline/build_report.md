# Build report

Advisory notes from the last `autodocu build`. This file is generated (overwritten every build); your Outline input was not modified by the build itself.

The Outline is now essentially clean — the keyword typos, wrong concept label, and the left/right contradiction flagged in the previous build have all been fixed, and the window size is now `1280 × 800`. The build ran without needing to guess any locator or default any `# Run` field.

## `Outline/README.md`

- **Clean for build purposes.** Two harmless prose typos remain in the `# Run` section and do not affect anything: `"Lauch the docker image"` → "Launch", and `"Navegate to"` → "Navigate to". (The run command also has a double space — `8563  ehr_browser` — which the shell ignores.) Fix only if you want the prose tidy.

## `Outline/1.Exploring_a_single_standard_concept/README.md`

- **Clean.** All keywords now spelled `highlight` / `take-screenshot`; the concept label reads `Asthma SNOMED` (matches the app's `AsthmaSNOMED` result, id `317009`); and the Time-view step correctly says the plot is on the **right side**. The `## Searching for a concept` → `## The concept view` → `### Hierarchy view` → `### Time view` heading hierarchy was mirrored exactly in the rendered doc, and all four `take-screenshot` steps produced real captures from a passing test run against the live app.

## Result

- Playwright: **1/1 spec passed**. Screenshot diffs: **4/4** (all captured fresh as new `1280 × 800` baselines). See `Tests/test_report.md`.
