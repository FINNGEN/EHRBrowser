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
| 02-overall-view | PASS |
| 03-hierarchy-panel-concept-set | PASS |
| 04-hierarchy-panel-hierarchy-tree | PASS |
| 05-hierarchy-tree-hover | PASS |
| 06-hierarchy-tree-mapping-toggle | PASS |
| 07-hierarchy-tree-mappings-open | PASS |
| 08-hierarchy-panel-list | PASS |
| 09-list-info-dropdown | PASS |
| 10-list-mappings-open | PASS |
| 11-counts-panel-time-plot | PASS |
| 12-counts-panel-hover | PASS |
| 13-counts-panel-filters | PASS |
| 14-counts-panel-filtered | PASS |
| 15-concept-control-bar | PASS |
| 16-concept-control-mappings | PASS |
| 17-concept-control-person-counts | PASS |
| **Total** | 18/18 |
