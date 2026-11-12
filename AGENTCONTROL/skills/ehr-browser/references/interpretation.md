# Interpreting EHR Browser data

The definitions below come from ROMOPAPI (`FINNGEN/ROMOPAPI`, `R/*.R` docs). State numbers with their definition, and point out caveats.

## OMOP basics

- A **concept** is a code in a vocabulary (SNOMED, ICD10, ICD9fi, ICPC, ATC, ...). **Standard** concepts (mostly SNOMED for
  conditions) form the hierarchy; **source** codes (e.g. ICD10 used in Finnish registers) map to them.
- **Descendants view**: the selected standard concept and its children in the hierarchy.
- **Mappings view**: the source codes that map to those concepts (e.g. ICD10 J45 maps to SNOMED Asthma).
  In FinnGen most events are recorded with source codes, so the two views can give very different counts for the "same" condition.
- Tree `levels`: `0` root, `-1` parents of the root, `n-n` n levels below the root, `Mapped from` / `Maps to` mappings.

## Measures

| Measure | Definition |
|---|---|
| Record counts | Number of events (rows). One person can contribute many. `record_counts` = the code itself; `descendant_record_counts` = the code plus all its descendants. |
| Person counts | Exact number of distinct persons (not an estimate). |
| Prevalence, year Y | `person_counts` / `observed_persons_counts`: persons with ≥1 matching record in Y, divided by persons under observation in Y (their observation period overlaps Y). The page plots it as a **proportion** (0.0012 = 0.12 %). |
| Incidence, year Y | Persons whose **first-ever** matching record (over all history, ignoring filters) is in Y, divided by the same denominator. The year range filter never changes which year counts as "first". |
| Age decile | floor((Y − year of birth) / 10): age in that year (0 = 0-9 years). |
| Lab values | Histogram of measured values per unit; values outside median ± 7·MAD go to the underflow/overflow bins. Units are never mixed. |

The page usually sends one token per concept shown, e.g. `317009S` (the code alone), or a token ending in `D` (code plus
descendants) when a concept stands for its whole subtree. Always check the request URL to know exactly what each series counts.

## Caveats you must mention when relevant

- **Register start years.** The FinnGen registers start at different times: CANC 1953, REIMB 1964, INPAT/OPER_IN/OPER_OUT/DEATH 1969,
  PURCH 1995, OUTPAT 1998, PRIM_OUT 2011 (these are the dashed lines in the app's plots; `getVisitTypeNames` gives only the
  register names, not years). A jump at those years is a **coverage effect**, not a change in disease. **Incidence** is inflated just after a register starts, because people who
  already had the condition get their first-ever record then (left truncation).
- **Coding changes.** Finland moved from ICD-9 (ICD9fi) to ICD-10 in 1996: ICD-9-only codes stop and ICD-10-only codes start
  there, and a 1995-1997 discontinuity is expected. A code-only (`S`) series of one vocabulary can look like it starts or ends there.
- **Visit type filter narrows the numerator only.** With a visit-type filter, prevalence and incidence = persons with the
  concept *in that register* / *all* observed persons, not a rate within the register.
- **Recent years are incomplete** (registry lag); the denominator also drops in the last years. Don't read the final drop as a real decline.
- **Small counts are exact and unsuppressed.** Fine to use inside the sandbox; never copy them outside.
- **Tree counts vs person-level endpoints.** The tree's `record_counts`/`person_counts` come from the code-counts tables;
  prevalence, incidence, overlap and filter bars come from a separate person-level table. If they disagree by orders of
  magnitude (e.g. 190k persons in the tree vs a few thousand in the filter bars), say so explicitly, don't mix them in one
  calculation, trust the **shape** of prevalence/incidence over time rather than their absolute level, and ask the user which database is loaded (`getAPIInfo`): a test or partial database is the likely cause.
- **The black "Total Descendant Counts" line** in the record-counts plot is computed from unfiltered data: it ignores the
  sex, age and visit-type filters, so it doesn't drop when a filter is switched off. That's expected, not a bug.
- Counts in different views (Descendants vs Mappings, `S` vs `SD`) answer different questions; say which one you used.

## Useful analyses

- Each child's share of the parent's `descendant_record_counts` (which children drive the counts).
- Prevalence or incidence per 1,000 or per 100,000 over time, with the register start years marked.
- Year-over-year change, ignoring years at register starts and the last incomplete years.
- Sex or age differences: re-call the endpoint with `sexStratum` / `ageStratum`.
- Two concepts compared: put both tokens in `conceptIds`.
