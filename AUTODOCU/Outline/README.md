# Name

EHRBrowser

# Description

EHR Browser connects to an OMOP-CDM instance and lets you browse the vocabulary graph and visualize how a concept is constructed and used over time. Given a concept, it shows its descendant hierarchy, optional non-standard mappings, and record counts over time broken down by sex and age.

# Index

Name the index section as 'Use cases'
Show the subsections as a list with the subsection name ':' and a brief description.

eg
```
## Use cases
- Explore a single standard code: How to search for a concept, navigate the Tree and List views, and interpret the Record Counts charts.
```

# Run

Lauch the docker image with command 

```
docker run --rm -p 8563:8563  ehr_browser
```

Navegate to 

http://localhost:8563/

Window size: 1280 × 800