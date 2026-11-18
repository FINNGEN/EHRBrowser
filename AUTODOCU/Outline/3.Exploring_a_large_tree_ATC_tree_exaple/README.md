# Name

Exploring a large tree, ATC tree example

# Description

At times, a selected concept may have a large number of descendants across many descending levels. This is specially the case when exploring the ATC tree. 
The OMOP Vocabularies utilise the ATC as a classification vocabulary. This means that the ATC concepts are used to group the more detailed RxNorm and RxNorm-Extension drug vocabularies. 
Hence, a level 4 ATC code will have as descendants its level 5 ATC codes, but also all RxNorm codes under each level 5 ATC with their respective trees. 
Cases like this result in trees, lists, and time plots with hundreds of codes which are hard to interpret. To solve this situation the EHRBrowser includes some filters to prune the tree and simplify the visualizations. Here we show an example with level 4 ATC code C10AA 'HMG CoA reductase inhibitors'.

# Sections


## Loading ATC code C10AA 'HMG CoA reductase inhibitors'

- Navigate directly to  http://localhost:8563/21601855, wait, it may take some time to load.
- Click on the 'Hierarchy' tab, `take-screenshot`.
- Describe how this concept has hundreds of descendants, making the tree so large that it does not fit in the display. Also the time plot has so many elements and colors that it is hard to distinguish anything. 
- Click on the 'List', `take-screenshot`.
- Describe how the list is easier to follow as we can see the direct ATC level 5 children, but the RxNorm tree extends 5 more levels down and includes over 100 nodes.
- `highlight` in one box including both the "Max Level" and "Classes",  `take-screenshot`.
- Describe these tools help to prune the tree. 
  - "Max Level" allows to cut the tree at a maximum level
  - whereas "Classes" allows to remove some nodes by concept class. 


### Using 'Max Level' pruning tool

- Click on the "Max Level" dropdown, click the number 2, wait.
- Click again on the "Max Level" dropdown, `highlight` number 2, `take-screenshot`.
- Describe how now the list has been cut to show only the immediate level 5 ATC children, how the time plot now shows all the DRC for these children. This way the plot has only 7 areas for these drug groups. Now drug utilization over time for these groups are more interpretable. 

- Click on the "Hierarchy" tab, click on the expand/compress icon to enlarge the tree. 
- `highlight` the "Hierarchy" tab, and the expand/compress icon
- Describe how now the tree is also fitting the window. 

### Using 'Classes' pruning tool

- Click on the "Classes" dropdown, `take-screenshot`. 
- Describe how the "Classes" dropdown shows all the Concept Classes in the tree. In the OMOP vocabulary, there are different ways to group the high granularity drug concepts. For example, the "Ingredient" class groups drugs with the same Ingredient, similarly to how ATC level 5 does. Hence if we select both classes, "Ingredient" and "ATC 5th". 
- Click on the "Ingredient", wait, Click on the "Classes" dropdown again, `highlight` "Ingredient", `take-screenshot`. 
- Describe how now both groupings are included in the tree, and we can see how both the RxNorm "Ingredient" and "ATC 5th" are in the second level of the tree, and each pair has an arrow that points down to the same children. This means that the DRC for each come from the same children. For this reason the area time plot overflows the back 'Root DRC'. This is a sign that the tree is a graph and children are shared. 
- To avoid this situation is why we keep "Ingredient" and "Clinical Drug Comp" deactivated by default. 
