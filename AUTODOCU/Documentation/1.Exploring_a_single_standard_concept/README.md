# Exploring a single Standard Concept

**EHRBrowser** lets you load any **Standard** **Concept** from the **OMOP-CDM** vocabulary and explore its descendant hierarchy, how the counts break down by sex, age and visit type, and how they evolve over time. This chapter walks through loading **Asthma** (**SNOMED**) as a worked example, from the initial search all the way to switching the whole view between record and person counts.

## Searching for a concept

![Searching for Asthma and highlighting the SNOMED result](screenshots/01-searching-for-a-concept.png)

Every session starts from the **Search concept** field. Typing `Asthma` returns each matching code across the vocabularies — the **SNOMED**, **ICD**, **ICPC** and other versions of Asthma appear side by side, each labelled with its vocabulary. Hovering a result previews it; selecting the **Asthma** **SNOMED** entry (highlighted above) loads it as the current **Concept** and opens its page.

## Overall view

![The full concept page for Asthma](screenshots/02-overall-view.png)

Once a **Concept** is loaded the page is split into three areas:

- **Concept Control (top bar)** — changes the current **Concept** or switches settings that affect the whole page, such as showing mapped concepts or switching between record and person counts.
- **Hierarchy view (left panel)** — shows how the counts are distributed across the **Concept** hierarchy, through three interchangeable views.
- **Counts stratified view (right panel)** — shows how the counts are distributed across sex, age, visit type and time.

The three sections below describe each area in turn.

### Hierarchy panel (left panel)

The left panel offers three ways to look at the same **Concept** and its descendants, chosen with the selector at the top: **Concept Set**, **Hierarchy** and **List**.

#### Concept Set

![The Concept Set view selected](screenshots/03-hierarchy-panel-concept-set.png)

**EHRBrowser** is built around displaying **Concept Sets**, so even when you are working with a single **Concept** it is shown as a **Concept Set** containing that one **Concept** together with all of its descendants. The **Concept Set** view lists the selected **Concept** and its **DRC** (Descendant Record Counts) — the number of records for the **Concept** and everything beneath it in the hierarchy.

#### Hierarchy tree

![The Hierarchy tree view](screenshots/04-hierarchy-panel-hierarchy-tree.png)

The **Hierarchy** view draws the vocabulary as a tree. The selected **Concept** sits on the second level; the levels above it are its parents and the levels below are its descendants. Each node shows its **RC** (Record Counts) — drawn as a circle whose size is proportional to the count — with the **DRC** (Descendant Record Counts) beneath it. **RC** is the number of times the **Concept** itself appears in the database; **DRC** is the number of times the **Concept** and all of its descendants appear.

![Hovering a node reveals its info card](screenshots/05-hierarchy-tree-hover.png)

Hovering over a node — here **Allergic asthma** — drops down an information card and highlights that **Concept** in the time plot on the right. Clicking the magnifying glass in the card reselects that **Concept** as the main one, so the tree doubles as a way to navigate the vocabulary.

![The grey mapping circles on a standard concept](screenshots/06-hierarchy-tree-mapping-toggle.png)

A **Standard** **Concept** typically carries small grey circles on the **left** of its node — highlighted above on **Intrinsic asthma**.

![The non-standard codes mapped into the concept](screenshots/07-hierarchy-tree-mappings-open.png)

Clicking those grey circles reveals the non-standard codes that map **to** that **Standard** **Concept**. Clicking the small cross closes them again.

#### List

![The List view](screenshots/08-hierarchy-panel-list.png)

The tree can grow large and its nodes hard to read, so the **List** view compacts the same descendants into a flat list grouped by tree level, each row showing its **RC** (Record Counts) and **DRC** (Descendant Record Counts).

![The concept info dropdown in the List](screenshots/09-list-info-dropdown.png)

As in the tree, clicking the information (i) icon on a row — here **Allergic asthma** — drops down that **Concept's** details.

![The mapped source codes expanded in the List](screenshots/10-list-mappings-open.png)

And, like the grey circles in the tree, the arrow on the left of a row expands the non-standard codes mapped to that **Concept**, shown under **Mapped from** — here for **Intrinsic asthma**.

### Counts panel (right panel)

![The time plot with its coloured-concept legend](screenshots/11-counts-panel-time-plot.png)

The right panel visualises the counts over time. The main chart is a stacked area plot of the **RC** (Record Counts) for the selected **Concept** and all of its descendants across the years, with a legend naming each coloured **Concept**. The black line along the top traces the **DRC** (Descendant Record Counts) of the selected **Concept**.

![Hovering an area in the time plot](screenshots/12-counts-panel-hover.png)

Hovering over an area highlights that **Concept** and drops down more information about it — here the large bottom layer, the root **Asthma** **Concept**.

![The Sex, Age and Visit Type stratifying filters](screenshots/13-counts-panel-filters.png)

Above the plot sit the **Sex**, **Age** and **Visit Type** panels. Each shows how the record counts are distributed across that dimension, and each also acts as a filter when clicked.

![The time plot filtered to Female, 50–59](screenshots/14-counts-panel-filtered.png)

Selecting **Female** and the **50–59** age band restricts the time plot to the record counts occurring in women aged 50 to 59.

### Concept Control (top bar)

![The Concept Control top bar](screenshots/15-concept-control-bar.png)

The top bar controls the whole view below it. It holds the application icon, the search field, the **Descendants** / **Mappings** switch, the **Record Counts** / **Person Counts** switch and the feedback button. Searching for another **Concept** here updates the entire view to that new **Concept**.

![Mappings opened across the whole tree and list](screenshots/16-concept-control-mappings.png)

Earlier we opened the mapped codes for a single **Concept**. Clicking **Mappings** in the top bar instead opens the mapped codes for every **Concept** in the tree and list at once.

![Switching to Person Counts](screenshots/17-concept-control-person-counts.png)

Switching back to **Descendants** and then to **Person Counts** displays **PC** (Person Counts) and **DPC** (Descendant Person Counts) instead of **RC** and **DRC**. This rescales the time plot to person counts and relabels the **Hierarchy** tree nodes; the **List** counts and the **Sex** / **Age** / **Visit Type** filters remain record-based.
