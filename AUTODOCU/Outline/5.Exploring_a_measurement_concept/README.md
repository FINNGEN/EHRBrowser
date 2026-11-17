# Name

Exploring a measurement Concept

# Description

Measurement concepts, such as laboratory tests, can be explored in the EHR Browser like any other concept: the hierarchy, list, record counts, person counts, prevalence and incidence work exactly as described in section 1. In addition, measurement concepts have an extra 'Lab Values' view, placed after 'Incidence' in the top bar, which shows the distribution of the measured values. This section uses the LOINC group 'C reactive protein|Mass Concentration|Moment in time|Blood, Serum or Plasma' (LG6213-7, id 40652733) as an example. It has 2 children: 'C reactive protein [Mass/volume] in Serum or Plasma' and 'C reactive protein [Mass/volume] in Capillary blood'.

# Sections

## Loading a measurement concept

- Navigate directly to http://localhost:8563/40652733, wait for the page to load.
- Click on the 'Hierarchy' tab, `take-screenshot`.
- Describe that the page looks the same as for any other concept (link to section 1): the tree shows the selected concept with its 2 children, and the time plot stacks the record counts of the 2 children over time.
- Describe that the selected concept has 0 RC (Record Counts) because it is a grouping concept; all the records come from its 2 children.

## Lab Values view

- `highlight` the 'Lab Values' button in the top bar, `take-screenshot`.
- Describe that measurement concepts show an extra 'Lab Values' button after 'Incidence'. It only appears when the selected concept is a measurement.
- Click 'Lab Values', `highlight` the plot on the right side including the legend with the colored concepts, `take-screenshot`.
- Describe the Lab Values plot: a stacked histogram of the measured values (x axis, with the unit, here mg/L) against the number of records (y axis). Each child concept is a colour in the stack, so we can compare the value distributions of the 2 sub-measurements, here 'in Serum or Plasma' and 'in Capillary blood'.
- Describe that the Sex, Age and Visit Type filters work in the same way as in section 1 and filter the histogram.
