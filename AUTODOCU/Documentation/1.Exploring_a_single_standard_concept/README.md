# Exploring a single Standard Concept

The EHR Browser lets you load any standard concept from the vocabulary and immediately see its descendants, their record counts over time, and how the counts break down by sex and age. This section walks through loading **Asthma (SNOMED)** as an example.

## Searching for a concept

Type a search string into the **Search concept** field at the top of the page. As you type, the browser lists every matching concept across the available vocabularies — here searching for *Asthma* returns matches in ICPC, ICD9fi, ICD10 and SNOMED. Each row shows the concept name, its vocabulary, its source **Code**, and its concept **Id**, along with a **Concept set** button for adding it to a set.

To load the standard SNOMED concept, hover over **Asthma — SNOMED** (Code `195967001`, Id `317009`, highlighted below) and click it.

![Searching for the Asthma SNOMED concept](screenshots/01-searching-for-a-concept.png)

## The concept view

Clicking the concept opens its full view, which is organized into three areas:

![The Asthma concept view](screenshots/02-the-concept-view.png)

- **Top bar** — controls that affect the whole page. From here you can change the current concept (the search icon and **Paste Concept Set**), toggle between **Descendants** and **Mappings** to switch between the standard descendant hierarchy and non-standard mapped source concepts, and toggle between **Record Counts** and **Person Counts** to change what the counts measure.
- **Left area** — the concept hierarchy. Each descendant is listed with its record-count distribution across the hierarchy, its RC/DRC values, a small inline bar, and the number of children.
- **Right area** — the count distributions broken down across **Sex** (a Male/Female pie), **Age** (a histogram over 10-year age bands), **Visit Type**, and **Time** (a stacked area chart of counts by year).

### Hierarchy view

The left area offers three ways to view the concept's relatives, selected with the toggle at the top:

- **List** — a flat list of the concept and its descendants, grouped by hierarchy level (Parents, Level 1, Level 2, …), each row showing its counts.
- **Concept Set** — the concepts currently collected into a set.
- **Hierarchy** — the concepts arranged as their graph hierarchy.

The **List** selector is highlighted below.

![The List selector in the hierarchy view](screenshots/03-hierarchy-view.png)

### Time view

The time chart plots the selected concepts' **Record Counts** over the years (roughly 1990–2020 here) as a stacked area chart, so you can see both the overall trend and how each descendant contributes. Above it, the legend lists the colored concepts included in the plot — Asthma, Allergic asthma, Mixed asthma, Intrinsic asthma, IgE-mediated allergic asthma, and Acute severe refractory exacerbation of asthma — each color matching its band in the chart. The chart and its legend are highlighted below.

![The time chart with its concept legend](screenshots/04-time-view.png)
