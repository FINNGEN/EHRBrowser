import { useEffect, useRef } from "react";
import * as d3 from "d3";

function YearFilter({ minYear, maxYear, yearSelection, setYearSelection, width = 600 }) {
  const svgRef = useRef();
  const brushRef = useRef();
  // keep the latest setter in a ref so it's never a effect dependency
  const setYearSelectionRef = useRef(setYearSelection);
  setYearSelectionRef.current = setYearSelection;

  const height = 50;

  useEffect(() => {
    if (minYear == null || maxYear == null || !Number.isFinite(minYear) || !Number.isFinite(maxYear)) {
      return; // guard against NaN domain — nothing to draw yet
    }

    const margin = { top: 10, right: 20, bottom: 10, left: 20 };
    const innerWidth = width - margin.left - margin.right;
    const brushHeight = 20;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain([minYear, maxYear]).range([0, innerWidth]);

    g.append("rect")
      .attr("width", innerWidth)
      .attr("height", brushHeight)
      .attr("rx", 3)
      .attr("fill", "#e0e0e0");

    g.append("g")
      .attr("transform", `translate(0,${brushHeight})`)
      .call(
        d3.axisBottom(x)
          .ticks(Math.min(10, maxYear - minYear + 1))
          .tickFormat(d3.format("d"))
      );

    const brush = d3.brushX()
      .extent([[0, 0], [innerWidth, brushHeight]])
      .on("end", (event) => {
        if (!event.sourceEvent) return; // ignore programmatic .move() from React sync
        if (!event.selection) {
          setYearSelectionRef.current(null);
          return;
        }
        const [x0, x1] = event.selection;
        const year0 = Math.round(x.invert(x0));
        const year1 = Math.round(x.invert(x1));
        setYearSelectionRef.current([year0, year1]);
      });

    const brushGroup = g.append("g").attr("class", "brush").call(brush);

    brushGroup.select(".selection").attr("fill", "#5b5b5b");
    brushGroup.selectAll(".handle").attr("fill", "#8c8c8c");

    brushRef.current = { brush, brushGroup, x };

    return () => {
      // clean teardown so a rebuild never fights an in-flight drag
      brushGroup.on(".brush", null);
      svg.selectAll("*").remove();
      brushRef.current = null;
    };
  }, [minYear, maxYear, width]); // <- no setYearSelection here

  useEffect(() => {
    if (!brushRef.current) return;
    const { brush, brushGroup, x } = brushRef.current;

    if (yearSelection) {
      brushGroup.call(brush.move, yearSelection.map((year) => x(year)));
    } else {
      brushGroup.call(brush.clear);
    }
  }, [yearSelection]);

  return <svg ref={svgRef} width={width} height={height} />;
}

export default YearFilter;