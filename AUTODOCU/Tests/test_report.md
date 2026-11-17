# AUTODOCU test report

Sections show the Playwright test result; the screenshot rows below each
show whether the newly captured image stayed within 1% of the committed one
(over threshold = the image changed = FAIL). By default a changed image is **kept**
and its before/after is saved below for review; `./run_test.sh --accept-changes`
adopts the new captures as the baseline for future runs.

The Time column shows each section's Playwright run time; the Total row sums them.

| Test name | Result | Time |
|-----------|--------|------|
| **1.Exploring_a_single_standard_concept** | PASS | 1.1m |
| 01-searching-for-a-concept | PASS |  |
| 02-overall-view | PASS |  |
| 03-concept-set | PASS |  |
| 04-hierarchy-tree | PASS |  |
| 05-hierarchy-tree-hover | PASS |  |
| 06-hierarchy-tree-mapping-circles | PASS |  |
| 07-hierarchy-tree-mappings-open | PASS |  |
| 08-list | PASS |  |
| 09-list-mappings | PASS |  |
| 10-counts-panel | PASS |  |
| 11-counts-panel-hover | PASS |  |
| 12-counts-panel-filters | PASS |  |
| 13-counts-panel-filtered | PASS |  |
| 14-concept-control | PASS |  |
| 15-concept-control-mappings | PASS |  |
| 16-concept-control-person-counts | PASS |  |
| 17-concept-control-prevalence | PASS |  |
| 18-concept-control-incidence | PASS |  |
| **2.Exploring_a_single_non-standard_concept** | PASS | 7.8s |
| 01-searching-for-a-concept | PASS |  |
| 02-hierarchy-tree | PASS |  |
| 03-hierarchy-tree-maps-to | PASS |  |
| 04-list | PASS |  |
| **3.Exploring_a_large_tree_ATC_tree_exaple** | PASS | 28.7s |
| 01-loading-atc-code-c10aa-hierarchy | PASS |  |
| 02-loading-atc-code-c10aa-list | PASS |  |
| 03-loading-atc-code-c10aa-pruning-filters | PASS |  |
| 04-using-max-level-pruning-tool-level-2 | PASS |  |
| 05-using-max-level-pruning-tool-expanded-tree | PASS |  |
| 06-using-classes-pruning-tool-dropdown | PASS |  |
| 07-using-classes-pruning-tool-ingredient | PASS |  |
| **4.Working_with_Concept_Sets** | PASS | 1.5m |
| 01-asthma-concept-set | PASS |  |
| 02-search-allergic-asthma | PASS |  |
| 03-allergic-asthma-added | PASS |  |
| 04-exclude-allergic-asthma | PASS |  |
| 05-hierarchy-excluded | PASS |  |
| 06-list-excluded | PASS |  |
| 07-search-copd | PASS |  |
| 08-hierarchy-expanded | PASS |  |
| 09-level-1 | PASS |  |
| 10-person-counts | PASS |  |
| 11-prevalence | PASS |  |
| 12-incidence | PASS |  |
| **Total** | 45/45 | 3.2m |
