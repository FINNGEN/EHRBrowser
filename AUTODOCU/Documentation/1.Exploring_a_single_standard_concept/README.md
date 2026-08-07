# Exploring a single Standard Concept

The EHR Browser lets you load any standard concept from the vocabulary and immediately see its descendants, their record counts over time, and how the counts break down by sex and age. This section walks through loading **Asthma (SNOMED)** as an example.

## Searching for a concept

Type into the **Search concept** field at the top of the page to look up a concept by name. Here we search for `Asthma`, and the browser opens a live list of matching concepts. Each row shows the concept name, its vocabulary (ICPC, ICD9fi, ICD10, SNOMED, …), and — underneath — its source `Code` and OMOP `Id`. The **Concept set** control on the right of each row lets you add that concept to a set.

To load the standard SNOMED concept, pick the **Asthma · SNOMED** entry (code `195967001`, id `317009`), highlighted below.

![Searching for the Asthma SNOMED concept](screenshots/01-searching-for-a-concept.png)

## The concept view

Clicking the concept opens its dedicated page, laid out in three areas.

![The Asthma concept view](screenshots/02-the-concept-view.png)

- **Top bar** — controls that affect the whole page. The **Descendants / Mappings** toggle switches between the concept's descendant hierarchy and its non-standard mappings, and the **Record Counts / Person Counts** toggle switches the metric shown everywhere on the page between event records and distinct persons.
- **Left area** — the concept and its descendants, with a count distribution for each. Every card shows the concept name, code and vocabulary alongside its **RC** (Record Counts) and **DRC** (Descendant Record Counts) values and a small inline bar, grouped by hierarchy **Level** (Level 1, Level 2, Level 3, Level 4, …) beneath the **Parents** row.
- **Right area** — the same counts broken down along several dimensions: **Sex** (a Male/Female split), **Age** (a histogram across 0–9 … 90–99 bands), **Visit Type**, and **Time** (the record-count trend, described below).

### Hierarchy view

The left area can present the descendants three different ways, chosen with the selector at the top of that panel:

- **List** — a flat, level-by-level list of every descendant concept (the default, shown here).
- **Concept Set** — the descendants as an editable concept set.
- **Hierarchy** — the descendants drawn as a graph of parent/child relationships.

The **List** option is highlighted below.

![The hierarchy view selector, List highlighted](screenshots/03-hierarchy-view.png)

### Time view

The plot on the right of the page shows how the counts accrue over time. It is a stacked area chart of **Record Counts** by year (here spanning roughly 1990–2020), with each descendant concept drawn in its own colour. The **legend** above the chart names those colored concepts — Asthma, Allergic asthma, Mixed asthma, Intrinsic asthma, IgE-mediated allergic asthma, Acute severe refractory exacerbation of asthma — so each band in the stack can be traced back to a specific concept.

![The Record Counts over time plot with its concept legend](screenshots/04-time-view.png)
