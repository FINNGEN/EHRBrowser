# Build report

Advisory notes from the last `autodocu build` (section `1.Exploring_a_single_standard_concept`). This file is generated (overwritten every build); your Outline input was **not** modified by the build itself.

The section was substantially expanded since the previous build (17 steps / screenshots across four panels). Every step ran against the live app and all 17 screenshots were captured from a passing run — but several descriptions in the Outline disagree with what the app actually does, and a few headings/labels contain typos. Details below; nothing blocked the build.

## `Outline/1.Exploring_a_single_standard_concept/README.md`

- **Person Counts is overstated.** The step says switching to *Person Counts* shows PC/DPC `"in the list, hierarchy, time plot and filters"`. In the app only the **time plot** rescales to person counts and the **Hierarchy tree** node labels switch to PC/DPC. The **List** count labels stay `RC` / `DRC` (hardcoded) and its numbers stay record-based; the **Sex / Age / Visit Type** filters stay record-based; and the plot's y-axis title stays "Record Counts". The doc describes the plot rescaling to **PC** (Person Counts) / **DPC** (Descendant Person Counts) and avoids claiming the list and filters relabel. Consider narrowing the wording, or switch the left panel to **Hierarchy** for this step so the PC/DPC labels are actually visible.
