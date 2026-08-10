# EHRBrowser

**EHRBrowser** connects to an **OMOP-CDM** instance and lets you browse the vocabulary graph and visualise how a single **Concept** or a **Concept Set** is constructed and used over time.

In **OMOP-CDM** terminology, a **Concept** is any medical code found in the vocabulary — a code for a diagnosis, laboratory test, procedure, drug, or any other clinical entity present in the data. A **Concept Set** is a group of **Concepts**.

Given a single **Concept** or **Concept Set**, **EHRBrowser** can visualise:

- Its descendant hierarchy tree
- Its non-standard mappings tree
- Record counts or person counts over time, stratified by sex, age, and visit type

## Overview and use cases

- [**Exploring a single Standard Concept**](./1.Exploring_a_single_standard_concept/README.md): How to search for a **Concept**, read the **Concept Set**, **Hierarchy** tree, and **List** views of its descendants and mappings, and interpret the record/person count charts stratified by sex, age, and visit type.
- [**Exploring a single non-Standard Concept**](./2.Exploring_a_single_non-standard_concept/README.md): How loading a non-standard **Concept** (**ICD10** Asthma, J45) differs from a standard one — the grey mapping circle moves to the right of each **Hierarchy** tree node, and both the tree and **List** reveal the **Standard** concepts the code **Maps to**.
