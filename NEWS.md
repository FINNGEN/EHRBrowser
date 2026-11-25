# EHR Browser v2.0.1

- Fixed the FinnGen logo not loading in the Linux/Docker build (file name case)
- Fixed zoom issues in the graph
- Fixed tree and search issues: search results now ranked by exact code, id or name match first, and stale requests are cancelled when concepts are added quickly
- Fixed the "Concept not found" message staying on screen after loading another concept
- Level and graph filters, and graph labels, can be collapsed
- New tree legend, stack order toggle and dynamic tree spacing
- Upset plot is interactive
- Count type buttons become a dropdown on narrow windows
- Agent cursor: shows what an AI agent is clicking, with a caption (`AGENTCONTROL/`)

# EHR Browser v2.0.0

## Concept Sets
- Build Concept Sets from several concepts: add concepts from the search results, include or exclude them, with or without their descendants
- Concept Set view showing the Concept Set expression and the DRC per concept
- Paste a Concept Set (JSON) to load it directly

## Counts and plots
- New count measures in the top bar: Person Counts, Prevalence and Incidence, in addition to Record Counts
- Person Counts view with an upset plot of persons per concept and per combination of concepts
- New Lab Values view for measurement concepts, showing a stacked histogram of the measured values
- New filters: Time range slider and Visit type (grouped as Long./Other), alongside Sex and Age
- Total Descendant Counts line can be switched on and off
- Loading indicator while plots are loading

## Hierarchy and list
- New tree layout algorithm with dynamic tree sizing
- Level and Class filters to prune large trees
- Search improvements

## Documentation and tooling
- New user documentation in `AUTODOCU/Documentation`, generated with screenshots from automated tests (`AUTODOCU/Tests/run_test.sh`), covering standard, non-standard, large-tree, Concept Set and measurement use cases
- Agent control: read-only `window.ehrAgent` hooks, ARIA labels and an `ehr-browser` skill so AI agents can drive the browser (`AGENTCONTROL/`)
- Commit id shown in the app info

## Backend and deployment
- Counts tables include visit type
- Quieter API logs while counts tables are rebuilding
- Updated sandbox deployment scripts and docs
- Many bug fixes and speed improvements

# EHR Browser v1.0.1

- Fixed the search (App was loading before the backend was ready, hence it was no conepts in search)
- Graph and list view are not in sync
- For drugs the 'Ingredient' and 'Clinical Drug Comp' concept classes are not shown in the graph/list by default.
- Other speed and stability improvements

# EHR Browser v0.99.0
Initial release of the EHR Browser.
- Only tested in Finngen's OMOP-CDM.

# Brief
The EHR Browser is a web tool that show how a medical code is place in the vocabulary graph and how it is used over time stratified by gender and age.