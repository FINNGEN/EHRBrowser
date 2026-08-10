# Name

Exploring a single Standard Concept

# Description

The EHR Browser lets you load any standard concept from the vocabulary and explore its descendants, their record/person counts over time, and how the counts break down by sex, age, and visit type. This section walks through loading **Asthma (SNOMED)** as an example.

# Sections

## Searching for a concept

- Use the 'Search concept' field to search for 'Asthma' string. 
- Hover over 'Asthma SNOMED', `highlight` the 'Asthma SNOMED' concept in the list, `take-screenshot` 
- Click 'Asthma SNOMED', wait for the page to load

## Overall view

- `take-screenshot` 
- Describe the different sections of the concept page. 
  - "Concept Control (top bar)": is for changing the current concept or switch views that affect the whole page, showing mapped concepts or switch between record and person counts. 
  - "Hierarchy view (left panel)" The left area shows different counts distributions across hierarchy. 
  - "Counts stratified view (right panel)" The right view shows the counts distributions across Sex, Age, Visit Type, and Time. 

### Hierarchy panel (left panel)

- Describe briefly the 3 options for hierarchy view: Concept Set, List, Hierarchy

#### Concept Set

-  `highlight` the 'Concept Set' selector in the left area and `take-screenshot`
- Descrive the Concept Set option: Mention that the tools is aimed as displaying Concept Sets, hence when working with a single Concept it is showed as a Concept Set with a single concept with all the decendants. We can see here the selected concept and the DRC (Descendant Record Counts).

#### Hierarchy tree

- Click and `highlight` the 'Hierarchy' selector in the left area and `take-screenshot`
- Descrive the Hierarchy tree: The selected concept appears in the second level of the tree, the upper levels shows the parents of the main concept, the lower levels the descendants. Each node shows the RC (Record Counts) with ball proportional to this number and DRC (Descendant Record Counts) under it. RC means the number of times the concept appears in the database and DRC the number that the concept and all it's descendants appear in the database. 
- Hover over concept "Allergic asthma", `take-screenshot`. 
- Descrive, Hovering over a concept will drop down furhter information, and will highlight the concept in the time plot. Clicking on the magnifying glass in the dropdown will select that concept as the main concept to show, hence the tree can be used to navigate the tree 
- `highlight` small grey circles on the left side of 'Intrinsic asthma' `take-screenshot`
- Descrive, standard concepts have typically small grey circles on the left side. By clicking onthese will show the non-standard concepts that mapt to that standard code.
- Click the small grey circles on the left side of 'Intrinsic asthma' `take-screenshot`.
- Descrive the image, mention that clicking on the small x will close them back. 

#### List

- Click and `highlight` the 'list' selector in the left area and `take-screenshot`.
- Descrive the image, mention that often the tree view can bee to big and nodes hard to see, the list view compapt them in a list of dencendants group by tree level, with the RC and DRC. 
- Click the (i) icon in "Allergic asthma", `take-screenshot`. 
- Descrive that, like in the tree view, clicking the (i) icon will dropdown the conded's info
- Click the down arrow in the left of 'Intrinsic asthma' `take-screenshot`.
- Descrive that, like the grey circles in the tree view, clicking the down arrow expands the non-standard codes mapped to that concept (shown under 'Mapped from'). 
- Click the again the arrow in the left of 'Intrinsic asthma' to close back the mapped codes list (do not mention this)


### Counts panel (right panel)

- `highlight` plot in the right side including the legend with the colored concepts, `take-screenshot`.
- Descrive the time plot: This shows an stack plot of all the record counts for the selected code and all the descendants over time. 
- The black line of top shows the DRC for the selected concept. 
- Hover over the 'Asthma' area (the large bottom layer of the stack), wait few second, `take-screenshot`
- Descrive that hovering over an area will highligt the concept and dropdown more info. 
- `highlight` the filter on the top of the plot in one box (Sex, Age, Visit Type), `take-screenshot`
- Descrive that these plots how the distribution of reocrd counts for the Sex, Age, Visit Type, but also they serv as filters when clicked. 
- Click in "Female" and click in "50-59", `take-screenshot`
- Descrive that now the time plot only show the recor counts occurrin in Females on the age range of 50-59 years. 

### Concept Control (top bar)

-  `highlight` the full upper bar of the page with the icon, seach, Descendans/Mappings, Recod Counts/Person Counts, Feedback, `take-screenshot`
- Descrive, this area serves to control the rest of the lower view. Searching an other concept will updateThe view to the new concept. 
- Click 'Mappings', `highlight` 'Mappings', `take-screenshot`. 
- Descrive, before we show how Mapped codes can be show per one concept, but clicking this will open the mapping codes on all the concepts in the tree and list. 
- Click 'Descendants', Click 'Person Counts', `highlight` 'Person Counts', `take-screenshot`. 
- Descrive that switching to 'Person Counts' will switch the whole view to display PC and DPC instead of RC and DRC, we can see that inThe list, hierachny, time plot and filters. 
