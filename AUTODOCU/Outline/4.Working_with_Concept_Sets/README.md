# Name

Working with Concept Sets

# Description

In addition to looking at a single Concept, EHRBrowser allows you to build and explore Concept Sets. A Concept Set is a mechanism to create groups of Concepts without needing to list all the codes in a group. Instead, a Concept Set uses the codes hierarchy to include all codes in trees or remove specific codes from a tree branch. See more about Concept Sets here https://ohdsi.github.io/TheBookOfOhdsi/Cohorts.html#conceptSets.
This section shows how to build a concept set for a combined Asthma without allergic asthma and Chronic Obstructive Pulmonary Disease.


# Sections

- Navigate to http://localhost:8563/317009 `take-screenshot`.
- Mention, that we start with the Asthma concept described in section 1. Unlike in Atlas, a concept added to the concept set is by default added with all the descendants. 'Descendants' [v] box is marked, meaning that the Concept Set includes the Asthma code and all the descendants.
- Click on the search icon to open the search box, and after the "Clear Set" box type the string "Aller", `highlight` the SNOMED "Allergic asthma" 4191479, `take-screenshot`.
- Describe how we can add new concepts by searching behind the "Clear Set", which will clear the set if clicked.
- `take-screenshot`
- Now the allergic asthma has been included. As the allergic asthma snomed is a children of the Asthma snomed, there is not change in the total number of descendant counts in the concept set.
- Click on the 'Exclude box' for Allergic asthma, `highlight` the 'Exclude box', `take-screenshot`.
- Describe how clicking to exclude the allergic asthma, this will exclude the allergic asthma and all the descendants, we can see allergic asthma DRC to be 0 and the total concept set DRC to have lost that same amount.
- Click on the 'Hierarchy', `highlight` 'Hierarchy'  `take-screenshot`.
- If we click on Hierarchy to the tree we visually see how Allergic asthma and Ige-.. have now been greyed out meaning that are not included in the Concept Set anymore.
- Click on the 'List', `highlight` 'List'  `take-screenshot`.
- Describe similarly happens in List
- Click on the search icon to open the search box, and after the "Clear Set" box type the string "Chronic obs", `highlight` the SNOMED "Chronic Obstructive ..." 255573, `take-screenshot`
- Click on the 'Hierarchy', click on the expand/compress icon (top-right of the panel) to expand the tree, `take-screenshot`.
- Describe how a new tree appears with the third concept.
- We can use the pruning tools described in section 3 to simplify the plot.
- Click on Max level and set level 1, wait, Click again on the "Max Level" dropdown, `highlight` number 1, `take-screenshot`.
- Describe how for example selecting level 1 will display only the descendant counts for the main concepts and we can compare on the time plot the progression of these 2 concepts over time hand by hand.
- Click the 'Person Counts', `highlight` 'Person Counts', `take-screenshot`.
- Describe, similarly if we chose the person counts this will switch to the number of persons counts getting each of these diagnoses over time
