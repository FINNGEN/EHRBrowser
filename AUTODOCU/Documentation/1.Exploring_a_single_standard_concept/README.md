# Exploring a single Standard Concept

The EHR Browser lets you load any standard concept from the vocabulary and immediately see its descendants, their record counts over time, and how the counts break down by sex and age. This section walks through loading **Asthma (SNOMED)** as an example.

## Searching for a concept

![Searching for "Asthma" with the AsthmaSNOMED suggestion highlighted](screenshots/01-searching-for-a-concept.png)

Type into the **Search concept** field at the top of the page to look up a concept by name. Here we search for the string `Asthma`, and the browser drops down a list of matching concepts as you type.

Each suggestion shows the concept's name, its source vocabulary (ICPC, ICD9fi, ICD10, SNOMED, …), and its `Code` and `Id`. The entry highlighted in red is **Asthma / SNOMED** (`Code: 195967001`, `Id: 317009`) — the standard SNOMED concept we want. The `+ Concept set` control on each row lets you add that concept to a set, but to open the concept itself, click its row. Doing so loads the concept page shown next.

## The concept view

![The full concept view for Asthma (SNOMED)](screenshots/02-the-concept-view.png)

Once a concept is loaded, the page is organized into three areas:

- **Top area** — the page-wide controls. From here you can change the current concept (via the search field), switch between **Descendants** and **Mappings** to show the concept's descendant hierarchy or its non-standard mapped concepts, and toggle between **Record Counts** and **Person Counts** so every count on the page reflects either the number of records or the number of distinct persons.
- **Left area** — the concept's descendant hierarchy. Each descendant is listed with its record count (`RC`) and descendant record count (`DRC`), grouped by level, so you can see how the counts are distributed across the hierarchy.
- **Right area** — the count distributions for the current concept broken down by **Sex**, **Age**, **Visit Type**, and over **Time**.

### Hierarchy view

The left area offers three ways to view the descendants, selectable from the toggle at the top:

- **List** — a flat, level-by-level list of the descendant concepts with their counts.
- **Concept Set** — the descendants presented as an editable concept set.
- **Hierarchy** — the descendants drawn as a graph of the vocabulary hierarchy.

![The "List" selector highlighted in the left area](screenshots/03-hierarchy-view.png)

The **List** selector, highlighted above, is the default view — it shows the parents of the concept followed by each level of descendants (Level 1, Level 2, …), each row carrying its `RC` and `DRC` values.

### Time view

![The record-counts-over-time plot and its colored-concept legend highlighted](screenshots/04-time-view.png)

The plot highlighted above shows how the counts accumulate over time. The **legend** at the top pairs each concept with a color — Asthma, Allergic asthma, Mixed asthma, Intrinsic asthma, IgE-mediated allergic asthma, and Acute severe refractory exacerbation of asthma — and the stacked area chart below plots those colored concepts across the years (roughly 1990 through 2020), so you can read at a glance when each descendant contributes to the totals.
