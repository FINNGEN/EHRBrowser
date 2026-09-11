import { useEffect, useRef } from "react";
import * as d3 from "d3";

function YearFilter({ minYear, maxYear, yearSelection, setYearSelection, width = 600 }) {
  const svgRef = useRef();
  const chartRef = useRef(null); // persistent accessors: {x, updateVisuals, clearVisuals, selectionRef}
  const setYearSelectionRef = useRef(setYearSelection);
  setYearSelectionRef.current = setYearSelection;

  const height = 30;
  const lineY = 15;
  const handleRadius = 6;

  useEffect(() => {
    if (
      minYear == null || maxYear == null ||
      !Number.isFinite(minYear) || !Number.isFinite(maxYear) ||
      maxYear <= minYear
    ) {
      return;
    }

    const margin = { top: -5, right: 20, bottom: 10, left: 10 };
    const innerWidth = width - margin.left - margin.right;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    const x = d3.scaleLinear().domain([minYear, maxYear]).range([0, innerWidth]).clamp(true);
    const years = d3.range(minYear, maxYear + 1);

    // segmented base line — one short <line> per year, with a small gap between segments
    g.append("g")
      .attr("class", "segments")
      .selectAll(".segment")
      .data(years.slice(0, -1))
      .join("line")
      .classed("segment", true)
      .attr("x1", d => x(d) + 1)
      .attr("x2", d => x(d + 1) - 1)
      .attr("y1", lineY)
      .attr("y2", lineY)
      .attr("stroke", "#e8e8e8")
      .attr("stroke-width", 2)
      .attr("stroke-linecap", "round");

    // tick marks at each year boundary
    g.append("g")
      .attr("class", "ticks")
      .selectAll(".tick-mark")
      .data(years)
      .join("line")
      .classed("tick-mark", true)
      .attr("x1", d => x(d))
      .attr("x2", d => x(d))
      .attr("y1", lineY - 4)
      .attr("y2", lineY + 4)
      .attr("stroke", "#e8e8e8")
      .attr("stroke-width", 1);

    // sparse year labels so they don't collide at small widths
    const maxLabels = Math.max(2, Math.floor(innerWidth / 50));
    const labelStep = Math.max(1, Math.ceil((maxYear - minYear) / maxLabels));
    g.append("g")
      .attr("class", "labels")
      .selectAll(".year-label")
      .data(years.filter(y => (y - minYear) % labelStep === 0))
      .join("text")
      .classed("year-label num", true)
      .attr("x", d => x(d))
      .attr("y", lineY + 18)
      .attr("text-anchor", "middle")
      .attr("font-size", 10)
      .attr("fill", "#9597a6")
      .text(d => d);

    // selection highlight — hidden until there's a selection
    const highlight = g.append("rect")
      .attr("class", "selection-highlight")
      .attr("y", lineY - 5)
      .attr("height", 10)
      .attr("rx", 3)
      .attr("fill", "#c9c9d5")
      // .attr("opacity", 1)
      .style("display", "none")
      .style("pointer-events", "none");

    // transparent hit area — starts a brand-new selection on click/drag
    const hitArea = g.append("rect")
      .attr("class", "hit-area")
      .attr("x", 0)
      .attr("y", lineY - 10)
      .attr("width", innerWidth)
      .attr("height", 20)
      .attr("fill", "transparent")
      .style("cursor", "pointer");

    // draggable handles for resizing an existing selection — appended last so they sit on top
    const handleGroup = g.append("g").attr("class", "handles");
    const startHandle = handleGroup.append("circle")
      .attr("class", "handle handle-start")
      .attr("r", handleRadius)
      .attr("cy", lineY)
      .attr("fill", "white")
      .attr("stroke", "#c9c9d5")
      .attr("stroke-width", 2)
      .style("cursor", "ew-resize")
      .style("display", "none");
    const endHandle = handleGroup.append("circle")
      .attr("class", "handle handle-end")
      .attr("r", handleRadius)
      .attr("cy", lineY)
      .attr("fill", "white")
      .attr("stroke", "#c9c9d5")
      .attr("stroke-width", 2)
      .style("cursor", "ew-resize")
      .style("display", "none");

    const clampSegment = (year) => Math.max(minYear, Math.min(maxYear - 1, year));
    const clampBoundary = (year) => Math.max(minYear, Math.min(maxYear, year));

    function updateVisuals(lo, hi) {
      highlight
        .style("display", null)
        .attr("x", x(lo))
        .attr("width", Math.max(0, x(hi) - x(lo)));
      startHandle.style("display", null).attr("cx", x(lo));
      endHandle.style("display", null).attr("cx", x(hi));
    }
    function clearVisuals() {
      highlight.style("display", "none");
      startHandle.style("display", "none");
      endHandle.style("display", "none");
    }

    const selectionRef = { current: yearSelection || null };

    // drag-to-select on the base line — snaps to whole-year segments
    let dragState = null;
    hitArea.call(
      d3.drag()
        .on("start", (event) => {
          const [mx] = d3.pointer(event, g.node());
          const seg = clampSegment(Math.floor(x.invert(mx)));
          dragState = { anchor: seg, current: seg };
          updateVisuals(seg, seg + 1);
        })
        .on("drag", (event) => {
          if (!dragState) return;
          const [mx] = d3.pointer(event, g.node());
          dragState.current = clampSegment(Math.floor(x.invert(mx)));
          const lo = Math.min(dragState.anchor, dragState.current);
          const hi = Math.max(dragState.anchor, dragState.current) + 1;
          updateVisuals(lo, hi);
        })
        .on("end", () => {
          if (!dragState) return;
          const lo = Math.min(dragState.anchor, dragState.current);
          const hi = Math.max(dragState.anchor, dragState.current) + 1;
          dragState = null;
          selectionRef.current = [lo, hi];
          setYearSelectionRef.current([lo, hi]);
        })
    );

    // drag an existing handle to resize the selection, boundary-snapped
    function attachHandleDrag(handle, which) {
      handle.call(
        d3.drag().on("drag", (event) => {
          if (!selectionRef.current) return;
          const [mx] = d3.pointer(event, g.node());
          const year = clampBoundary(Math.round(x.invert(mx)));
          let [lo, hi] = selectionRef.current;
          if (which === "start") lo = Math.min(year, hi - 1);
          else hi = Math.max(year, lo + 1);
          selectionRef.current = [lo, hi];
          updateVisuals(lo, hi);
        }).on("end", () => {
          if (selectionRef.current) setYearSelectionRef.current(selectionRef.current);
        })
      );
    }
    attachHandleDrag(startHandle, "start");
    attachHandleDrag(endHandle, "end");

    if (selectionRef.current) updateVisuals(selectionRef.current[0], selectionRef.current[1]);

    chartRef.current = { updateVisuals, clearVisuals, selectionRef };

    return () => {
      svg.selectAll("*").remove();
      chartRef.current = null;
    };
  }, [minYear, maxYear, width]);

  useEffect(() => {
    const c = chartRef.current;
    if (!c) return;
    if (yearSelection) {
      c.selectionRef.current = yearSelection;
      c.updateVisuals(yearSelection[0], yearSelection[1]);
    } else {
      c.selectionRef.current = null;
      c.clearVisuals();
    }
  }, [yearSelection]);

  return <svg ref={svgRef} width={width} height={height} />;
}

export default YearFilter;