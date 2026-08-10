# Exploring a single Standard Concept

The **EHRBrowser** lets you load any standard **Concept** from the vocabulary and explore its descendants, their record/person counts over time, and how those counts break down by sex, age, and visit type. This section walks through loading **Asthma** (SNOMED) as an example.

## Searching for a concept

Use the **Search concept** field in the top bar to type a search string — here, `Asthma`. As you type, a list of matching concepts drops down. Each suggestion shows the **Concept** name, its vocabulary, code, and identifier.

![Searching for the Asthma concept](screenshots/01-searching-for-a-concept.png)

Click the **Asthma** (SNOMED) suggestion to load it. The page then opens on the concept view for that **Concept**.

## Overall view

Once a **Concept** is loaded, the page is split into three areas.

![The overall concept view](screenshots/02-overall-view.png)

- **Concept Control (top bar)** — changes the current **Concept** and switches views that affect the whole page: showing mapped concepts, or switching between record and person counts.
- **Hierarchy panel (left panel)** — shows the different count distributions across the hierarchy.
- **Counts panel (right panel)** — shows the count distributions across sex, age, visit type, and time.

### Hierarchy panel (left panel)

The left panel offers three ways of looking at the hierarchy, chosen with the selector at the top: **Concept Set**, **List**, and **Hierarchy**.

#### Concept Set

![The Concept Set view](screenshots/03-hierarchy-panel-concept-set.png)

The **EHRBrowser** is built around displaying **Concept Sets**, so even when you are working with a single **Concept** it is presented as a **Concept Set** containing that one **Concept** together with all of its descendants. This view lists the selected **Concept** and its **DRC** (Descendant Record Counts).

#### Hierarchy tree

Selecting **Hierarchy** shows the descendants as a tree.

![The Hierarchy tree view](screenshots/04-hierarchy-panel-hierarchy-tree.png)

The selected **Concept** appears on the second level of the tree; the levels above it show the parents of the main **Concept**, and the levels below show its descendants. Each node shows its **RC** (Record Counts) — drawn as a circle whose size is proportional to the count — with the **DRC** (Descendant Record Counts) beneath it. **RC** (Record Counts) is the number of times the **Concept** itself appears in the database, while **DRC** (Descendant Record Counts) is the number of times the **Concept** together with all of its descendants appears.

![Hovering over a concept in the tree](screenshots/05-hierarchy-tree-hover.png)

Hovering over a **Concept** drops down further information and highlights that **Concept** in the time plot on the right. Clicking the magnifying glass in the drop-down selects that **Concept** as the main **Concept**, so the tree can be used to navigate the vocabulary.

![The mapping circles on a standard concept](screenshots/06-hierarchy-tree-mapping-toggle.png)

Standard **Concepts** typically carry small grey circles on their left-hand side. Clicking these reveals the non-standard **Concepts** that map to that standard code.

![Non-standard mapped concepts expanded in the tree](screenshots/07-hierarchy-tree-mappings-open.png)

The mapped, non-standard **Concepts** are drawn next to their standard **Concept**. Clicking the small **x** closes them again.

#### List

Selecting **List** shows the same descendants as a compact list.

![The List view](screenshots/08-hierarchy-panel-list.png)

The tree can grow large and its nodes can become hard to read; the **List** view compacts the descendants into a list grouped by tree level, each row showing its **RC** (Record Counts) and **DRC** (Descendant Record Counts).

![The concept info drop-down in the list](screenshots/09-list-info-dropdown.png)

As in the tree view, clicking the **(i)** icon on a row drops down the **Concept's** information (identifier, code, domain, class, and so on).

![Mapped codes expanded in the list](screenshots/10-list-mappings-open.png)

As in the tree view, clicking the down arrow on the left of a row expands the non-standard codes mapped to that **Concept** (shown under *Mapped from*), each with its own **RC** (Record Counts) and **DRC** (Descendant Record Counts).

### Counts panel (right panel)

![The time plot](screenshots/11-counts-panel-time-plot.png)

The time plot shows a stacked-area chart of the record counts for the selected **Concept** and all of its descendants over time. The black line across the top shows the **DRC** (Descendant Record Counts) for the selected **Concept**. The legend above the chart lists the coloured **Concepts** in the stack.

![Hovering over an area of the time plot](screenshots/12-counts-panel-hover.png)

Hovering over a coloured area highlights that **Concept** and drops down more information about it.

![The stratifying filter boxes](screenshots/13-counts-panel-filters.png)

Above the plot sit the **Sex**, **Age**, and **Visit Type** boxes. These show the distribution of record counts across each of those dimensions, and they double as filters when clicked.

![The time plot filtered to Female, ages 50–59](screenshots/14-counts-panel-filtered.png)

Here **Female** and the **50–59** age band have been selected, so the time plot now shows only the record counts occurring in females aged 50 to 59.

### Concept Control (top bar)

![The Concept Control top bar](screenshots/15-concept-control-bar.png)

The top bar controls the rest of the view below it. It holds the app icon, the **Search concept** field, the **Descendants / Mappings** switch, the **Record Counts / Person Counts** switch, and the feedback link. Searching for another **Concept** updates the whole view to that new **Concept**.

![Mappings opened across the whole view](screenshots/16-concept-control-mappings.png)

Earlier we saw how the mapped codes can be opened for a single **Concept**. Clicking **Mappings** instead opens the mapped codes for every **Concept** in the tree and list at once.

![Switching to Person Counts](screenshots/17-concept-control-person-counts.png)

Switching from **Descendants** back and then to **Person Counts** changes the counts shown from records to persons: the time plot rescales to person counts, so the filled areas now represent **PC** (Person Counts) and **DPC** (Descendant Person Counts) rather than **RC** (Record Counts) and **DRC** (Descendant Record Counts).
