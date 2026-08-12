# AUTODOCU test report

Sections show the Playwright test result; the screenshot rows below each
show whether the newly captured image stayed within 1% of the committed one
(over threshold = the image changed = FAIL). By default a changed image is **kept**
and its before/after is saved below for review; `./run_test.sh --accept-changes`
adopts the new captures as the baseline for future runs.

The Time column shows each section's Playwright run time; the Total row sums them.

| Test name | Result | Time |
|-----------|--------|------|
| **1.Exploring_a_single_standard_concept** | PASS | 31.4s |
| 01-searching-for-a-concept | PASS |  |
| 02-overall-view | PASS |  |
| 03-hierarchy-panel-concept-set | PASS |  |
| 04-hierarchy-panel-hierarchy-tree | PASS |  |
| 05-hierarchy-tree-hover | PASS |  |
| 06-hierarchy-tree-mapping-toggle | PASS |  |
| 07-hierarchy-tree-mappings-open | PASS |  |
| 08-hierarchy-panel-list | PASS |  |
| 09-list-info-dropdown | PASS |  |
| 10-list-mappings-open | PASS |  |
| 11-counts-panel-time-plot | PASS |  |
| 12-counts-panel-hover | PASS |  |
| 13-counts-panel-filters | PASS |  |
| 14-counts-panel-filtered | PASS |  |
| 15-concept-control-bar | PASS |  |
| 16-concept-control-mappings | PASS |  |
| 17-concept-control-person-counts | PASS |  |
| **2.Exploring_a_single_non-standard_concept** | PASS | 7.9s |
| 01-searching-for-a-concept | PASS |  |
| 02-hierarchy-tree | PASS |  |
| 03-hierarchy-tree-mappings-open | PASS |  |
| 04-list | PASS |  |
| **3.Exploring_a_large_tree_ATC_tree_exaple** | FAIL | 6.0m |
| 01-hierarchy-large-tree | FAIL |  |
| 02-list-view | FAIL |  |
| 03-pruning-tools | FAIL |  |
| 04-max-level-2 | FAIL |  |
| 05-hierarchy-expanded | FAIL |  |
| 06-class-dropdown | FAIL |  |
| 07-class-ingredient-added | FAIL |  |
| **4.Working_with_Concept_Sets** | PASS | 29.7s |
| 01-concept-set-asthma | PASS |  |
| 02-search-allergic-asthma | PASS |  |
| 03-allergic-asthma-added | PASS |  |
| 04-allergic-asthma-excluded | PASS |  |
| 05-hierarchy-excluded-greyed | PASS |  |
| 06-list-excluded-greyed | PASS |  |
| 07-search-chronic-obstructive | PASS |  |
| 08-hierarchy-three-concepts | PASS |  |
| 09-max-level-1 | PASS |  |
| 10-person-counts | PASS |  |
| **Total** | 34/42 | 7.2m |
