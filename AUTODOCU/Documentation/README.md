# EHRBrowser

**EHRBrowser** connects to an **OMOP-CDM** instance and lets you browse the vocabulary graph and visualise how a single **Concept** or a **Concept Set** is constructed and used over time.

In **OMOP-CDM** terminology, a **Concept** is any medical code found in the vocabulary — a code for a diagnosis, laboratory test, procedure, drug, or any other clinical entity present in the data. A **Concept Set** is a group of **Concepts**.

Given a single **Concept** or **Concept Set**, **EHRBrowser** can visualise:
- Its descendant hierarchy tree
- Non-standard mappings tree
- Record counts or person counts over time, stratified by sex, age and visit type

## Use cases

- [Explore a single Standard Concept](./1.Exploring_a_single_standard_concept/README.md): How to search for a **Concept**, navigate the **Concept Set**, **Hierarchy** and **List** views, and read the stratified record- and person-count charts.
- [Explore a single non-Standard Concept](./2.Exploring_a_single_non-standard_concept/README.md): How to load a non-standard code and see where it differs from a standard one, mainly in how the **Hierarchy** tree and **List** show its mapping to the equivalent **Standard** **Concept**.
- [Explore a large tree (ATC example)](./3.Exploring_a_large_tree_ATC_tree_exaple/README.md): How to work with a **Concept** that has hundreds of descendants, using the **Max Level** and **Classes** filters to prune the tree into an interpretable visualisation.
