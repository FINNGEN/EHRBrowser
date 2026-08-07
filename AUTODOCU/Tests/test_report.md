# AUTODOCU test report

Sections show the Playwright test result; the screenshot rows below each
show whether the newly captured image stayed within 1% of the committed one
(over threshold = the image changed = FAIL). By default a changed image is **kept**
and its before/after is saved below for review; `./run_test.sh --accept-changes`
adopts the new captures as the baseline for future runs.

| Test name | Result |
|-----------|--------|
| **1.Exploring_a_single_standard_concept** | PASS |
| 01-searching-for-a-concept | PASS |
| 02-the-concept-view | PASS |
| 03-hierarchy-view | PASS |
| 04-time-view | PASS |
| **Total** | 5/5 |
