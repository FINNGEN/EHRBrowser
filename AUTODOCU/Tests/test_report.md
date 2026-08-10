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
| **2.Exploring_a_single_non-standard_concept** | PASS |
| 01-searching-for-a-concept | PASS |
| 02-hierarchy-tree | PASS |
| 03-hierarchy-tree-mappings-open | PASS |
| 04-list | PASS |
| **3.Exploring_a_large_tree_ATC_tree_exaple** | PASS |
| 01-hierarchy-large-tree | PASS |
| 02-list-view | PASS |
| 03-pruning-tools | PASS |
| 04-max-level-2 | PASS |
| 05-hierarchy-expanded | PASS |
| 06-class-dropdown | PASS |
| 07-class-ingredient-added | PASS |
| **Total** | 31/31 |
