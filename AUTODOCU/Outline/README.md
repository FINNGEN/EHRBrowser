# Name

EHRBrowser

# Description

**EHRBrowser** connects to an **OMOP-CDM** instance and lets you browse the vocabulary graph and visualize how a single **Concept** or a **Concept Set** is constructed and used over time.

In OMOP-CDM terminology, a **Concept** is any medical code found in the vocabulary — this can be a code for a diagnosis, laboratory test, procedure, drug, or any other clinical entity present in the data. A **Concept Set** is a group of **Concepts**.

Given a single **Concept** or **Concept Set**, EHRBrowser can visualise:
- Its descendant hierarchy tree
- Non-standard mappings tree
- Record counts or person counts over time, stratified by sex, age, and visit type

# Index

Name the index section as 'Use cases'
Show the subsections as a list with the subsection name ':' and a brief description. This brief description should be a broad explanation of the use case and not contain deep detaisl of the section. Keep the all the descriptions on similar tone and scope for all the points.

eg
```
## Use cases
- Explore a single standard code: How to search for a concept, navigate the Tree and List views, and interpret the Record Counts charts.
```

# Run

Launch the docker image with command

```
docker run --rm -p 8563:8563 ehr_browser
```

Navigate to

http://localhost:8563/

Window size: 1280 × 800


# Documentation instruction

- Use British English
- Highlight the following key words in the documentation as **bold** and start them with upper case: **EHRBrowser**, **OMOP-CDM**, **Concept**, **Concept Set**
- Always expand the acronyms in the pictures in parentheses: eg **DRC** (Descendant Record Counts)