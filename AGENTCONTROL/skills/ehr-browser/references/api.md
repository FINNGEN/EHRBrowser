# ROMOPAPI endpoints (used by EHR Browser)

Base URL: `$EHR_URL/api/`. The full machine-readable spec is at `$EHR_URL/api/openapi.json`
(UI: `$EHR_URL/api/__docs__/`); read it for exact parameters. This file adds the meaning.
Results are memoised in the R process, so repeated calls are cheap. Counts are exact; there is no small-count suppression.

## `conceptIds` grammar (person-count endpoints)

Comma-separated tokens `<conceptId><S|M><D?>`:
- `S`: match the `concept_id` column; `M`: match the `maps_to_concept_id` column. In practice: use `S` for standard
  concepts (SNOMED, ...) and `M` for source codes (ICD10, ICD9fi, ICPC, ...); the wrong letter returns 0 persons.
- Trailing `D`: expand to the concept **and all its descendants** instead of the code alone.
- Each token is its own series in the result, e.g. `317009SD,45596282M`.

Common optional filters: `yearsRange=start,end`, `sexStratum=<gender_concept_id,...>` (8507 male, 8532 female),
`ageStratum=<age_decile,...>` (0 = 0-9 years, 1 = 10-19, ...), `visitStratum=<visit_group_concept_id,...>`
(see `getVisitTypeNames`; the FinnGen ids, set in `romopapi/runOmopApi.R`, are below).

| visit_group_concept_id | Code | visit_group_concept_id | Code |
|---|---|---|---|
| 2002330246 | INPAT | 2002330245 | KANTA |
| 2002330247 | OPER_IN | 2002330106 | BIOBANK |
| 2002330248 | OPER_OUT | 2002330186 | KIDNEY |
| 2002330249 | OUTPAT | 2002330119 | VISION |
| 2002330250 | PRIM_OUT | 2002330105 | BIRTH_MOTHER |
| 2002330102 | REIMB | 2002330251 | PRESCRIPTION |
| 2002330104 | DEATH | 2002330252 | DELIVERY |
| 2002330101 | PURCH | 2002330253 | PRESCRIPTION_DELIVERY |
| 2002330103 | CANC | 2002330254 / 2002330255 | DELIVERY_KELA / PRESCRIPTION_DELIVERY_KELA |

The easiest way to get a valid query is to copy the URL the page used (`playwright-cli -s=ehr requests`) and edit it.

## Endpoints

| Endpoint | Parameters | Returns |
|---|---|---|
| `getListOfConcepts` | none | All concepts with counts: the search index |
| `getConceptRelationships` | `conceptId` | `concept_relationships` (`parent_concept_id`, `child_concept_id`, `levels`, `concept_class_id`) and `concepts` (`concept_id`, `concept_name`, `domain_id`, `vocabulary_id`, `concept_class_id`, `standard_concept`, `concept_code`, `record_counts`, `descendant_record_counts`, `person_counts`, `descendant_person_counts`) |
| `getCodeCountsStratified` | `conceptId` | Per concept in the tree x `calendar_year` x `gender_concept_id` x `age_decile` x `visit_group_concept_id`: `node_record_counts`, `node_descendant_record_counts` |
| `getPersonCountsPrevalence` | `conceptIds`, filters | Per token x year: `tagged_concept_id`, `calendar_year`, `person_counts`, `observed_persons_counts` |
| `getPersonCountsIncidence` | `conceptIds`, filters | Same columns; `person_counts` counts first-ever occurrences only |
| `getPersonCountsUpset` | `conceptIds`, filters | Exclusive overlap regions: `group` (tokens joined by `-`), `person_counts` |
| `getPersonCountsFilters` | `conceptIds`, filters | `filter` (sex/age/visit/year), `stratum`, `person_counts`, `selected`; each dimension computed with the other three filters applied |
| `getPersonCountsIncidenceFilters` | `conceptIds`, filters | Same, counting each person once at first occurrence |
| `getMeasurementValueHistogram` | `conceptIds`, filters, `nBins` | Per token x unit: `measured_value_bucket`, `unit`, `n_events` (range median ± 7·MAD plus underflow/overflow bins) |
| `getVisitTypeNames` | none | `visit_group_concept_id`, `concept_code` (e.g. INPAT, PURCH), `concept_name` |
| `getAPIInfo` | none | API and database info |
| `report` | `conceptId` | HTML report with plots for one concept |

## Example

```bash
# prevalence of SNOMED asthma including descendants, women only, 2000-2023
curl -s "$EHR_URL/api/getPersonCountsPrevalence?conceptIds=317009SD&yearsRange=2000,2023&sexStratum=8532"
```
