import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faLessThanEqual } from '@fortawesome/free-solid-svg-icons'
import { faCaretDown } from '@fortawesome/free-solid-svg-icons'
import { faCaretUp } from '@fortawesome/free-solid-svg-icons'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { faX } from '@fortawesome/free-solid-svg-icons'
import * as d3 from "d3";
import textures from 'textures';

function GraphSection (props) {
    const navigate = useNavigate()
    const color = props.color
    const selectedConcepts = props.selectedConcepts
    const setSelectedConcepts = props.setSelectedConcepts
    const sidebarRoot = props.sidebarRoot
    const tooltipHover = props.tooltipHover
    const graphFilter = props.graphFilter
    const setGraphFilter = props.setGraphFilter
    // const conceptHover = props.conceptHover
    const extent = props.extent
    const setExtent = props.setExtent
    const openFilters = props.openFilters
    const setOpenFilters = props.setOpenFilters
    const stackData = props.stackData
    const conceptNames = props.conceptNames
    const generateColor = props.generateColor
    const rootLine = props.rootLine
    // const setRoot = props.setRoot
    const ageData = props.ageData
    const genderData = props.genderData
    const sourceData = props.sourceData
    const maxGender = props.maxGender
    const getConceptInfo = props.getConceptInfo
    const zoomed = props.zoomed
    const setZoomed = props.setZoomed
    const hovered = props.hovered
    const setHovered = props.setHovered
    const graphSectionWidth = props.graphSectionWidth
    const colorList = props.colorList
    const annotations = props.annotations
    const treeSelections = props.treeSelections
    const showRootLine = props.showRootLine
    const setShowRootLine = props.setShowRootLine
    const graphContainerRef = useRef()
    const margin = 20
    let hoverLabelCircle = false
    let brushing = false
    let zooming = false
    let x1,x2
    let hoverTimeout = null
    let currentTarget = null

    // DRAWING
    function createLinePattern(key, color) {
        const patternId = `pattern-${key}`
        const defs = d3.select('#graph').select("defs")
        const size = 4
        const patt = defs.append("pattern")
            .attr("id", patternId)
            .attr("patternUnits", "userSpaceOnUse")
            .attr("width", size)
            .attr("height", size)
        patt.append("path")
            .attr("d", `
                M0,${size} L${size},0
                M-${size/2},${size/2} L${size/2},-${size/2}
            `)
            .attr("stroke", color)
            .attr("stroke-width", 1.5)
            .attr("fill", "none")
        patt.append("path")
            .attr("d", `
                M0,${size*2} L${size*2},-0
                M-${size},${size} L${size},-${size}
            `)
            .attr("stroke", color)
            .attr("stroke-width", 1.5)
            .attr("fill", "none")
        return `url(#${patternId})`
    }
    // draw line chart
    function drawGraph(rollup, scaleX, scaleY) {
        function highestPoint(d) {
            return d[1].reduce((best, p) => {
                return scaleY(+p[2]) < scaleY(+best[2]) ? p : best
            })
        }
        // draw stacked area
        function updateStack(stackedData) {
            d3.select("#graph-stack").selectAll('.areas').data(stackedData, d => d.key)
            .join(enter => {
                const geometry = enter.append('g')
                    .classed('areas',true)
                    .attr("clip-path", "url(#clip)")
                    .lower()
                geometry.append("path")
                    .classed("area-path", true)
                    .attr("cursor", "pointer")
                    .attr("id", d => "area-" + d.key)
                    .attr("stroke-width", 1)
                    .attr('stroke','white')
                    .attr('fill', d => {
                        if (!getConceptInfo(d.key).standard_concept || (treeSelections.includes('mappings') && selectedConcepts.find(c => c.name === d.key).leaf)) {
                            const url = createLinePattern(d.key, colorList[d.key])
                            return url 
                        } else return colorList[d.key]
                    })
                    .style("transition", "0.5s all")
                    .transition()
                    .attr("d", d3.area()
                        .x((d,i) => scaleX(d.data.year))
                        .y0(d => scaleY(d[0]))
                        .y1(d => scaleY(d[1]))
                    )
                    .attr('opacity', d => hovered.length > 0 && !hovered.includes(d.key) ? 0.2 : 1)
                geometry.append("path")
                    .classed("area-path-background", true)
                    .attr("cursor", "pointer")
                    .attr("id", d => "area-background-" + d.key)
                    .on('click', (e,d) => navigate(`/${d.key}`))
                    .on("mouseover", function (e,d) {
                        let element = selectedConcepts.filter(c => c.name === d.key)[0]
                        const el = this
                        el.__hoverTimeout__ = setTimeout(() => {
                            setHovered([d.key])
                            tooltipHover(element, "enter", e) 
                        },400) 
                    })
                    .on("mouseout", function (e,d) {
                        const el = this
                        clearTimeout(el.__hoverTimeout__)
                        let element = selectedConcepts.filter(c => c.name === d.key)[0]
                        setHovered([])
                        tooltipHover(element, "leave", e)    
                    })
                    .style("fill", "transparent")
                    .style("transition", "0.5s all")
                    .transition()
                    .attr("d", d3.area()
                        .x((d,i) => scaleX(d.data.year))
                        .y0(d => scaleY(d[0]))
                        .y1(d => scaleY(d[1]))
                    )
            },update => {
                update.select('.area-path')
                    .transition()
                    .attr('opacity', d => hovered.length > 0 && !hovered.includes(d.key) ? 0.2 : 1)
                    .attr("d", d3.area()
                        .x((d,i) => scaleX(d.data.year))
                        .y0(d => scaleY(d[0]))
                        .y1(d => scaleY(d[1]))
                    )
                    .attr('fill', d => {
                        if (!getConceptInfo(d.key).standard_concept || (treeSelections.includes('mappings') && selectedConcepts.find(c => c.name === d.key).leaf)) {
                            const url = createLinePattern(d.key, colorList[d.key])
                            return url 
                        } else return colorList[d.key]
                    })
                update.select('.area-path-background')
                    .on('click', (e,d) => navigate(`/${d.key}`))
                    .on("mouseover", function (e,d) {
                        let element = selectedConcepts.filter(c => c.name === d.key)[0]
                        const el = this
                        el.__hoverTimeout__ = setTimeout(() => {
                            setHovered([d.key])
                            tooltipHover(element, "enter", e) 
                        },400) 
                    })
                    .on("mouseout", function (e,d) {
                        const el = this
                        clearTimeout(el.__hoverTimeout__)
                        let element = selectedConcepts.filter(c => c.name === d.key)[0]
                        setHovered([])
                        tooltipHover(element, "leave", e)    
                    })
                    .transition()
                    .attr("d", d3.area()
                        .x((d,i) => scaleX(d.data.year))
                        .y0(d => scaleY(d[0]))
                        .y1(d => scaleY(d[1]))
                    )
            },exit => exit.remove())
        }
        // draw root descendant count line *** add label ***
        function updateRootLine() {
            const line = d3.line()
                .x(d => scaleX(d[0]))
                .y(d => scaleY(d[1]))
            const container = d3.select("#graph-line")
                .selectAll(".lines")
                .data([rootLine])
            const containerEnter = container.enter()
                .append("g")
                .classed("lines", true)
                .attr("clip-path", "url(#clip)")
                .raise()
            containerEnter.append("path")
                .classed("line-path", true)
                .attr("cursor", "pointer")
                .attr("stroke-width", 3)
                .style("stroke", "black")
                .style("fill", "none")
            containerEnter.append("path")
                .classed("line-path-background", true)
                .attr("cursor", "pointer")
                .attr("stroke-width", 8)
                .style("stroke", "transparent")
                .style("fill", "none")
            container.merge(containerEnter)
                .select(".line-path")
                .transition()
                .attr("d", line)
            container.merge(containerEnter)
                .select(".line-path-background")
                .transition()
                .attr("d", line)
            container.exit().remove()
        }
        const stackedData = d3.stack()
            .keys(conceptNames)
            (rollup)  
        updateStack(stackedData)  
        if (showRootLine) updateRootLine()
        else d3.select('#graph-line').selectAll('.lines').remove()
        d3.select("#graph-viz").raise()
    }
    // draw annotations
    function drawAnnotations(scaleX,height) {
        // const tooltip = d3.select("body")
        //     .append("div")
        //     .style("position", "absolute")
        //     .style("background", "white")
        //     .style("padding", "6px 10px")
        //     .style("filter", "drop-shadow(0px 3px 5px rgba(0,0,0,0.2))")
        //     .style("border-radius", "12px")
        //     .style("font-size", "12px")
        //     .style("display", "none")
        const tooltip = d3.select("body")
        .selectAll(".tooltip")
        .data([null])
        .join("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "white")
        .style("padding", "6px 10px")
        .style("filter", "drop-shadow(0px 3px 5px rgba(0,0,0,0.2))")
        .style("border-radius", "12px")
        .style("font-size", "12px")
        .style("display", "none")
        const filteredAnnotations = annotations.filter(a => a.year >= extent[0] && a.year <= extent[1])
        const grouped = d3.group(filteredAnnotations, d => d.year)
        const spreadAnnotations = []
        grouped.forEach((values, year) => {
            const count = values.length;
            const spacing = 5
            values.forEach((d, i) => {
                const offsetIndex = i - (count - 1) / 2
                spreadAnnotations.push({
                ...d,
                offsetX: offsetIndex * spacing
                })
            })
        })
        const triangle = d3.symbol()
            .type(d3.symbolTriangle)
            .size(80)
        const annotation = d3.select('#graph')
            .selectAll(".annotation")
            .data(spreadAnnotations, d => d.year)
        const annotationEnter = annotation.enter()
            .append("g")
            .attr("class", "annotation")
        annotationEnter.append("line")
        annotationEnter.append("circle")
        const annotationMerge = annotationEnter.merge(annotation)
        annotationMerge.select("line")
            .attr('x1', d => scaleX(d.year))
            .attr('x2', d => scaleX(d.year))
            .attr('y1', 0)
            .attr('y2', height - 5)
            .attr('stroke',color.textmedium)
            .attr('stroke-width',1)
            .style("stroke-dasharray", ("5, 5"))
        annotationMerge.select("circle")
            .attr("cx", d => scaleX(d.year) + d.offsetX)
            .attr("cy", height)
            .attr("r", 5)
            .attr("fill", 'white')
            .style("filter", "drop-shadow(0px 3px 3px rgba(0,0,0,0.3))")
            .style('cursor','pointer')
            .on("mouseover", function(event, d) {
                const eventsThatYear = grouped.get(d.year)
                const html = `
                <strong>${d.year}</strong><br/>Start of 
                ${eventsThatYear.map(e => e.key).join("<br/>")}
                `
                tooltip.style("display", "block").html(html)
            })
            .on("mousemove", function(event) {
                tooltip.style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 20) + "px")
            })
            .on("mouseout", function() {
                tooltip.style("display", "none")
            })
        annotation.exit().remove()
    }
    // FUNCTIONS
    const resetZoom = (e) => {
        if (e) {
            e.preventDefault()
            e.stopPropagation()    
        }
        if (d3.select("#zoomUI").nodes().length === 0) {
            let extent = d3.extent(selectedConcepts.map(d => d.data.code_counts).flat().map(d => d.calendar_year))
            if (!extent[0] || !extent[1]) extent = d3.extent(rootLine, d => d[0])
            setExtent(extent)
            d3.select("#zoomUI").remove()
            zooming = false
            setZoomed(false)
        }
    }
    // get graph
    function getGraph(rollup, width, height, ticks) {
        // x and y scales
        let maxRollup = d3.max(rollup, obj => Object.entries(obj).reduce((sum, [key, val]) => key !== 'year' ? sum + val : sum, 0))
        let maxRootLine = d3.max(rootLine, d => d[1])
        let maxY = rollup.length > 0 ? showRootLine ? maxRollup > maxRootLine ? maxRollup : maxRootLine : maxRollup : maxRootLine
        let scaleX = d3.scaleLinear().domain(extent).range([0, width])
        let scaleY = d3.scaleLinear().domain([0, maxY*1.05]).range([height, 0])
        // grid lines
        const xAxisGrid = d3.axisBottom(scaleX).tickSize(-height).tickFormat('').ticks(ticks.one).tickSizeOuter(0)
        const yAxisGrid = d3.axisLeft(scaleY).tickSize(-width).tickFormat('').ticks(5).tickSizeOuter(0)
        d3.select("#graph").select(".x-grid")
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxisGrid)
            // .lower()
        d3.select("#graph").select(".axis-grid")
            .call(yAxisGrid)
            // .lower()
        // axis lines
        d3.select("#graph").select(".x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(scaleX).tickSize(-height).ticks(ticks.two).tickFormat(d3.format("d")).tickSizeOuter(0).tickPadding(8))
            // .lower()
        d3.select("#graph").select(".y")
            .call(d3.axisLeft(scaleY).ticks(5).tickSizeOuter(0))
            // .lower()
        // base lines
        d3.select("#graph").select(".axis-base")
            .call(d3.axisLeft(scaleY).tickFormat('').tickSize(-width).tickSizeOuter(0))
            // .lower()
        d3.select("#graph").select(".axis-base")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(scaleX).tickFormat('').tickSize(-height).tickSizeOuter(0))
            // .lower()
        // clip path
        d3.select("#graph").append("defs").append("svg:clipPath")
            .attr("id", "clip")
            .append("svg:rect")
            .attr("width", width)
            .attr("height", height)
            .attr("x", 0)
            .attr("y", 0)
            .raise()
        let animationFrameId = null
        const handleMouseMove = (e) => {
            if (!zooming) return
            if (animationFrameId) cancelAnimationFrame(animationFrameId)
            animationFrameId = requestAnimationFrame(() => {
                const [x] = d3.pointer(e, d3.select('#graph').node())
                x2 = x;
                if (x2 < x1) {
                d3.select("#zoomUI").attr("x", x2).attr("width", (x1 - x2))
                } else {
                d3.select("#zoomUI").attr("x", x1).attr("width", (x2 - x1))
                }
            })
        }
        //zoom
        let x1,x2
        d3.select('#graph')
            .on("mousedown",function(e){
                const [x] = d3.pointer(e, this)
                zooming = true
                x1 = x
                d3.select(this).append("rect")
                .attr("id","zoomUI")
                .style("pointer-events","none")
                    .attr("height",height)
                    .attr("width",1)
                    .attr("x",x1)
            })
            .on("mouseup",(e)=>{
                if ((x1 && x2) && (Math.round(scaleX.invert(x1)) !== Math.round(scaleX.invert(x2)))) {
                    if (x1 < x2) {setExtent([Math.round(scaleX.invert(x1)), Math.round(scaleX.invert(x2))])}
                    else {setExtent([Math.round(scaleX.invert(x2)), Math.round(scaleX.invert(x1))])} 
                    setZoomed(true)   
                }
                d3.select("#zoomUI").remove()
                zooming = false
            })
            .on("mousemove", handleMouseMove)
            .on("dblclick", resetZoom)
        drawAnnotations(scaleX,height)
        drawGraph(rollup, scaleX, scaleY)
    }
    // hover filter
    function filterHover(id,mode,type) {
        if (mode === 'enter') {
            if (type === 'gender') {
                if (graphFilter.gender !== id) d3.select('#btn-'+id).style('font-weight', 700)
                d3.select('#arc-'+id).attr('fill', color.text)
                d3.select('#gender-text-'+id).style('fill',color.text)
            }
            if (type === 'age') {
                if (!graphFilter.age.includes(id)) d3.select('#btn-'+id).style('font-weight', 700)
                d3.select('#bar-'+id).style('background-color', color.text)
                d3.select('#age-p-'+id).style('color',color.text)    
            }
            else {
                // if (!graphFilter.source.includes(id)) d3.select('#btn-'+id).style('font-weight', 700)
                d3.select('#bar-'+id).style('background-color', color.text)
                d3.select('#source-p-'+id).style('color',color.text)       
            }
        } else {
            d3.select('#btn-'+id).style('font-weight', graphFilter.age.includes(id) || graphFilter.gender === id ? 700 : 400)
            d3.select('#bar-'+id).style('background-color', graphFilter.age.includes(id) || graphFilter.gender === id || graphFilter.source.includes(id) ? color.text : '#b1bbc4')  
            d3.select('#arc-'+id).attr("fill", () => graphFilter.gender === id ? color.text : id === maxGender ? '#b1bbc4' : color.grey)
            d3.select('#age-p-'+id).style('color', () => graphFilter.age.includes(id) ? color.text : color.textlight)
            d3.select('#source-p-'+id).style('color', () => graphFilter.source.includes(id) ? color.text : color.textlight)
            d3.select('#gender-text-'+id).style('fill', () => graphFilter.gender === id ? color.text : color.textlight)
        }
    }
    // select filter
    function filterSelect(id,type) {
        if (!openFilters) {
            d3.selectAll('.filter-viz').style('display', 'none')
            d3.select('#open-btn').style('display', 'block')
            d3.select('#close-btn').style('display', 'none')    
        }
        if (type === 'age') {
            let ages = graphFilter.age
            if (!ages.includes(id)) {
                ages.push(id)
            } else {ages = ages.filter(age => age !== id)}
            setGraphFilter({gender:graphFilter.gender,age:ages,source:[-1]})
            // filterCounts(selectedConcepts, {gender:graphFilter.gender,age:ages})    
        } 
        if (type === 'source') {
            let sources = graphFilter.source
            if (!sources.includes(id)) {
                sources.push(id)
            } else {sources = sources.filter(source => source !== id)}
            setGraphFilter({gender:graphFilter.gender,age:graphFilter.age,source:sources})    
        }
        else {
            if (graphFilter.gender !== id) {
                setGraphFilter({gender:id,age:graphFilter.age,source:graphFilter.source})
                // filterCounts(selectedConcepts, {gender:id,age:graphFilter.age})     
            } else {
                setGraphFilter({gender:-1,age:graphFilter.age,source:graphFilter.source})
                // filterCounts(selectedConcepts, {gender:-1,age:graphFilter.age})    
            }
        }
        
    }
    // age filter brushing
    function ageBrush(e,mode) {
        const scaleX = d3.scaleLinear().domain([d3.select('#age-filter').node().getBoundingClientRect().x, d3.select('#age-filter').node().getBoundingClientRect().x + d3.select('#age-filter').node().getBoundingClientRect().width]).range([0,380])
        if (mode === 'down') {
            brushing = true
            x1 = e.clientX
        }
        if (mode === 'up') {
            let startAge,endAge
            let ages = graphFilter.age
            if (x1 !== x2) {
                if (x1 < x2) {
                    startAge = Math.trunc(scaleX(x1)/38)
                    endAge = Math.trunc(scaleX(x2)/38)        
                }
                else {
                    startAge = Math.trunc(scaleX(x2)/38)
                    endAge = Math.trunc(scaleX(x1)/38) 
                }
                for (let i = startAge; i <= endAge; i++) {
                    if (!ages.includes(i)) ages.push(i)
                    else ages = ages.filter(age => age !== i)
                }
                setGraphFilter({gender:graphFilter.gender,age:ages,source:graphFilter.source})
                // filterCounts(selectedConcepts, {gender:graphFilter.gender,age:ages}) 
            }
            brushing = false
        } else {
            if (brushing) {
                let startAge,endAge
                x2 = e.clientX
                if (x1 < x2) {
                    startAge = Math.trunc(scaleX(x1)/38)
                    endAge = Math.trunc(scaleX(x2)/38)        
                }
                else {
                    startAge = Math.trunc(scaleX(x2)/38)
                    endAge = Math.trunc(scaleX(x1)/38) 
                }
                for (let i = startAge; i <= endAge; i++) {
                    if (!graphFilter.age.includes(i)) {
                        d3.select('#bar-'+i).style('background-color', color.text)
                        d3.select('#btn-'+i).style('color', color.text).style('font-weight', 700)    
                    } else {d3.select('#bar-'+i).style('background-color', color.grey)}
                }
            }
        }
    }

    // filters viz
    useEffect(() => {
        if (sourceData) {
            if (genderData.length > 0 && ageData.length > 0 && sourceData.length > 0) {
                // gender
                const genders = [8507,8532]
                const width = 110
                const height = 110
                const radius = Math.min(width, height) / 2
                d3.select("#gender-svg")
                    .attr("width", width)
                    .attr("height", height)
                    .append('g')
                    .attr("transform", `translate(${width/2}, ${height/2 - 12}) scale(0.5) rotate(180)`) 
                const pieData = d3.pie().value(d => d.sum).sort(null)(genderData)
                const arcGenerator = d3.arc()
                    .innerRadius(0)
                    .outerRadius(radius)
                d3.select('#gender-labels').selectAll('.toggle').data(genderData, d => d.id)
                    .join(enter => {
                        enter.append('div')
                            .classed('toggle',true)
                            .attr('id',d => 'btn-'+d.id)
                            .style('font-size','10px')
                            .style('padding','3px')
                            .html(d => d.id === 8507 ? 'Male' : 'Female')
                            .style('margin-right', (d,i) => i === 0 ? '0.5px' : '0px')
                            .style('margin-left', (d,i) => i === 0 ? '0px' : '0.5px')
                            .style('border-radius', (d,i) => i === 0 ? '20px 0px 0px 20px' : '0px 20px 20px 0px')
                            .style('font-weight',d => graphFilter.gender === d.id ? 700 : 400)
                            .style('color', d => graphFilter.gender === d.id ? 'white' : color.text)
                            .style('background-color', d => graphFilter.gender === d.id ? color.text : color.greylight)
                            .on('mouseover',(e,d) => filterHover(d.id,'enter','gender'))
                            .on('mouseout',(e,d) => filterHover(d.id,'leave','gender'))
                            .on('click',(e,d) => filterSelect(d.id,'gender'))
                    },update => {
                        update  
                            .style('font-weight',d => graphFilter.gender === d.id ? 700 : 400)
                            .style('color', d => graphFilter.gender === d.id ? 'white' : color.text)
                            .style('background-color', d => graphFilter.gender === d.id ? color.text : color.greylight)
                            .on('mouseover',(e,d) => filterHover(d.id,'enter','gender'))
                            .on('mouseout',(e,d) => filterHover(d.id,'leave','gender'))
                            .on('click',(e,d) => filterSelect(d.id,'gender'))
                    })
                d3.select("#gender-svg").selectAll(".arc").data(pieData, d => d.data.id)
                    .join(enter => {
                        const container = enter.append('g')
                            .classed('arc',true)  
                        container.append('path')
                            .classed('arc-path',true)
                            .attr('id', d => 'arc-'+d.data.id)
                            .attr("d", d => d.endAngle === d.startAngle ? null : arcGenerator(d))
                            .attr("fill", d => graphFilter.gender === d.data.id ? color.text : d.data.id === maxGender ? '#b1bbc4' : color.grey)
                            .style("stroke", d => d.data.sum === 0 ? 'none' : color.background)
                            .style('stroke-width',2)
                            .style("cursor", "pointer")
                            .on("mouseover", (e,d) => filterHover(d.data.id, "enter",'gender'))
                            .on("mouseout", (e,d) => filterHover(d.data.id, "leave",'gender'))
                            .on("click", (e,d) => filterSelect(d.data.id, "gender"))
                            .attr("transform", `translate(${width/2}, ${height/2 - 12}) scale(0.5) rotate(180)`)
                        container.append('text')
                            .classed('arc-text',true)
                            .attr('id', d => 'gender-text-'+d.data.id)
                            .text(d => d.data.sum === 0 ? '' : d.data.sum)
                            .attr("x", d => d.data.id === genders[0] ? -radius/2 : radius/2) 
                            .attr("y", radius/2 - 5) 
                            .attr("text-anchor", d => d.data.id === genders[0] ? "end" : "start") 
                            .style("font-size", "8px")
                            .style("fill", d => graphFilter.gender === d.data.id ? color.text : color.textlight)
                            .attr("transform", `translate(${width/2}, ${height/2 - 12})`)
                    },update=>{
                        update.select('.arc-path')
                            .on("mouseover", (e,d) => filterHover(d.data.id, "enter",'gender'))
                            .on("mouseout", (e,d) => filterHover(d.data.id, "leave",'gender'))
                            .transition()
                            .attr("d", d => d.endAngle === d.startAngle ? null : arcGenerator(d))
                            .attr("fill", d => graphFilter.gender === d.data.id ? color.text : d.data.id === maxGender ? '#b1bbc4' : color.grey)
                            .style("stroke", d => d.data.sum === 0 ? 'none' : color.background)
                        update.select('.arc-text')
                            .text(d => d.data.sum === 0 ? '' : d.data.sum)
                            .attr("x", d => d.data.id === genders[0] ? -radius/2 : radius/2) 
                            .attr("y", radius/2 - 5) 
                            .attr("text-anchor", d => d.data.id === genders[0] ? "end" : "start") 
                            .style("fill", d => graphFilter.gender === d.data.id ? color.text : color.textlight)
                    })
                // age
                const scaleHeight = d3.scaleLinear().domain([0,d3.extent(ageData.map(d => d.sum))[1]]).range([0,30])
                d3.select('#age-labels').selectAll('.toggle').data(ageData, d => d.id)
                    .join(enter => {
                        enter.append('div')
                            .classed('toggle',true)
                            .attr('id',d => 'btn-'+d.id)
                            .html(d => d.id*10+'-'+(d.id*10+9))
                            .style('margin', (d,i) => '0px 0.5px 0px 0.5px') 
                            .style('width','32px') 
                            .style('border-radius', (d,i) => i === 0 ? '20px 0px 0px 20px' : i === ageData.length -1  ?'0px 20px 20px 0px' : '0px 0px 0px 0px')                    
                            .style('font-weight',d => graphFilter.age.includes(d.id) ? 700 : 400)
                            .style('color', d => graphFilter.age.includes(d.id) ? 'white' : color.text)
                            .style('background-color', d => graphFilter.age.includes(d.id) ? color.text : color.greylight)
                            .on('mouseover',(e,d) => filterHover(d.id,'enter','age'))
                            .on('mouseout',(e,d) => filterHover(d.id,'leave','age'))
                            .on('click',(e,d) => filterSelect(d.id,'age'))
                    },update => {
                        update  
                            .style('font-weight',d => graphFilter.age.includes(d.id) ? 700 : 400)
                            .style('color', d => graphFilter.age.includes(d.id) ? 'white' : color.text)
                            .style('background-color', d => graphFilter.age.includes(d.id) ? color.text : color.greylight)
                            .on('mouseover',(e,d) => filterHover(d.id,'enter','age'))
                            .on('mouseout',(e,d) => filterHover(d.id,'leave','age'))
                            .on('click',(e,d) => filterSelect(d.id,'age'))
                    })
                d3.select('#age-viz').selectAll('.age-bar').data(ageData, d => d.id)
                    .join(enter => {
                        const container = enter.append('div')
                            .classed('age-bar',true)
                            .style('display','flex')
                            .style('flex-direction','column')
                        container.append('p').classed('age-p',true).attr('id',d=>'age-p-'+d.id).style('margin',0).style('padding-bottom','2px').style('font-size','8px').style('text-align','center').style('color', d => graphFilter.age.includes(d.id) ? color.text : color.textlight).html(d => d.sum === 0 ? '' : d.sum)
                        container.append('div')
                            .classed('age-rect',true)
                            .attr('id', d => 'bar-'+d.id)
                            .on('mouseover', (e,d) => filterHover(d.id, 'enter','age'))
                            .on('mouseout', (e,d) => filterHover(d.id, 'leave','age'))
                            .on('click', (e,d) => filterSelect(d.id, 'age'))
                            .style('width', '36px')
                            .style('cursor','pointer')
                            .style('height', d => d.sum === 0 ? '0px' : scaleHeight(d.sum) + 'px')
                            .style('background-color', d => graphFilter.age.includes(d.id) ? color.text : '#b1bbc4')
                            .style('border-top', '1px solid var(--background)')
                            .style('border-bottom', '1px solid var(--background)')
                            .style('margin-left','1px')
                    },update => {
                        update.select('.age-p').style('color', d => graphFilter.age.includes(d.id) ? color.text : color.textlight).html(d => d.sum === 0 ? '' : d.sum)
                        update.select('.age-rect')
                            .on('mouseover', (e,d) => filterHover(d.id, 'enter','age'))
                            .on('mouseout', (e,d) => filterHover(d.id, 'leave','age'))
                            .on('click', (e,d) => filterSelect(d.id, 'age'))
                            .transition()    
                            .style('height', d => d.sum === 0 ? '0px' : scaleHeight(d.sum) + 'px')
                            .style('background-color', d => graphFilter.age.includes(d.id) ? color.text : '#b1bbc4')
                    })   
                // source  
                const scaleHeightSource = d3.scaleLinear().domain([0,d3.extent(sourceData.map(d => d.sum))[1]]).range([0,30])
                d3.select('#source-labels').selectAll('.toggle').data(sourceData, d => d.id)
                    .join(enter => {
                        enter.append('div')
                            .classed('toggle',true)
                            .attr('id',d => 'btn-'+d.id)
                            .html(d => d.code.length > 5 ? d.code.substring(0, 5) : d.code)
                            .style('margin', (d,i) => '0px 0.5px 0px 0.5px') 
                            .style('font-weight','6px')
                            .style('width','32px') 
                            // .style('border-radius', (d,i) => i === 0 ? '20px 0px 0px 20px' : i === ageData.length -1  ?'0px 20px 20px 0px' : '0px 0px 0px 0px')                    
                            .style('font-weight',d => graphFilter.source.includes(d.id) ? 700 : 400)
                            .style('color', d => graphFilter.source.includes(d.id) ? 'white' : color.text)
                            .style('background-color', d => graphFilter.source.includes(d.id) ? color.text : color.greylight)
                            .on('mouseover',(e,d) => filterHover(d.id,'enter','source'))
                            .on('mouseout',(e,d) => filterHover(d.id,'leave','source'))
                            .on('click',(e,d) => filterSelect(d.id,'source'))
                    },update => {
                        update  
                            .style('font-weight',d => graphFilter.source.includes(d.id) ? 700 : 400)
                            .style('color', d => graphFilter.source.includes(d.id) ? 'white' : color.text)
                            .style('background-color', d => graphFilter.source.includes(d.id) ? color.text : color.greylight)
                            .on('mouseover',(e,d) => filterHover(d.id,'enter','source'))
                            .on('mouseout',(e,d) => filterHover(d.id,'leave','source'))
                            .on('click',(e,d) => filterSelect(d.id,'source'))
                    })
                d3.select('#source-viz').selectAll('.source-bar').data(sourceData, d => d.id)
                    .join(enter => {
                        const container = enter.append('div')
                            .classed('source-bar',true)
                            .style('display','flex')
                            .style('flex-direction','column')
                        container.append('p').classed('source-p',true).attr('id',d=>'source-p-'+d.code).style('margin',0).style('padding-bottom','2px').style('font-size','8px').style('text-align','center').style('color', d => graphFilter.source.includes(d.id) ? color.text : color.textlight).html(d => d.sum === 0 ? '' : d.sum)
                        container.append('div')
                            .classed('source-rect',true)
                            .attr('id', d => 'bar-'+d.id)
                            .on('mouseover', (e,d) => filterHover(d.id, 'enter','source'))
                            .on('mouseout', (e,d) => filterHover(d.id, 'leave','source'))
                            .on('click', (e,d) => filterSelect(d.id, 'source'))
                            .style('width', '36px')
                            .style('margin-left','1px')
                            .style('cursor','pointer')
                            .style('height', d => d.sum === 0 ? '0px' : scaleHeightSource(d.sum) + 'px')
                            .style('background-color', d => graphFilter.source.includes(d.id) ? color.text : '#b1bbc4')
                            .style('border-top', '1px solid var(--background)')
                            .style('border-bottom', '1px solid var(--background)')
                    },update => {
                        update.select('.source-p').style('color', d => graphFilter.source.includes(d.id) ? color.text : color.textlight).html(d => d.sum === 0 ? '' : d.sum)
                        update.select('.source-rect')
                            .on('mouseover', (e,d) => filterHover(d.id, 'enter','source'))
                            .on('mouseout', (e,d) => filterHover(d.id, 'leave','source'))
                            .on('click', (e,d) => filterSelect(d.id, 'source'))
                            .transition()    
                            .style('height', d => d.sum === 0 ? '0px' : scaleHeightSource(d.sum) + 'px')
                            .style('background-color', d => graphFilter.source.includes(d.id) ? color.text : '#b1bbc4')
                    })  
            }
        }
    },[genderData,ageData,sourceData])

    // update graph
    useEffect(() => {
        if (graphContainerRef.current && extent) {
            d3.select('#graph').append("defs")
            const containerWidth = document.getElementById('graph-section').clientWidth
            if (containerWidth < window.innerWidth*0.4 || graphSectionWidth === '40vw') d3.select('#graph-filters').style('display','none')
            else d3.select('#graph-filters').style('display','flex')
            const containerHeight = document.getElementById('graph-group').clientHeight*0.7
            const width = containerWidth + (margin * 2)
            const height = containerHeight + (margin * 2)
            const ticks1 = ((extent[1]-extent[0])/(Math.round((extent[1]-extent[0])/10)))*Math.round((extent[1]-extent[0])/10)
            const ticks2 = width < 400 ? Math.round(width/60) : ticks1 < 10 || !ticks1 ? Math.round(extent[1]-extent[0]) : 10
            const ticks = {one:ticks1,two:ticks2}
            document.getElementById("graph-container").style.height = containerHeight + 'px'
            // document.getElementById("graph-labels").style.maxHeight = document.getElementById('graph-group').clientHeight*0.15 - margin + 'px'
            d3.select("#graph")
                .attr("width", '95%')
                .attr("height", '100%')
                .attr("viewBox", `${-margin*2} ${0} ${width} ${height}`)
                .attr("preserveAspectRatio", "xMidYMid meet")
                .append("g")
                .attr("transform", `translate(${margin}, ${margin})`)
            d3.select("#clip rect")
                .attr("width", width)
                .attr("height", height)
            if (rootLine) getGraph(stackData, width, height, ticks)  
        }
    }, [stackData, rootLine, extent, graphSectionWidth, openFilters, showRootLine, conceptNames.length < 50 ? hovered : null])

    // update labels
    useEffect(()=> {
        const groups = d3.group(selectedConcepts, d => d.name)
        function updateLabels(groups) {
            d3.select('#graph-labels').selectAll('.labels').data(groups, d => d[0])
                .join(enter => {
                    const labels = enter.append('div')  
                        .classed('labels', true) 
                        .attr('id', d => 'label-' + d[0])
                        .style("cursor", "pointer")
                        .style('background-color', d => sidebarRoot.name.includes(d[0]) || hovered.includes(d[0]) ? color.lightpurple : 'none')
                        .style('border-radius', '20px')
                        .style('margin-right', '2px')
                        .on('click', (e,d) => {
                            if (!hoverLabelCircle) navigate(`/${d[0]}`)
                        })
                        .on("mouseover", function (e,d) {
                            const el = this
                            el.__hoverTimeout__ = setTimeout(() => {
                                d3.select("#label-text-" + d[0]).style('font-weight',700)
                                d3.select('#label-' + d[0]).style('background-color', color.lightpurple)
                                setHovered([d[0]])
                            },200)
                        })
                        .on("mouseout", function (e,d) {
                            const el = this
                            clearTimeout(el.__hoverTimeout__)
                            d3.select("#label-text-" + d[0]).style("font-weight", d => sidebarRoot.name.includes(d[0]) ? 700 : 400)
                            d3.select('#label-' + d[0]).style('background-color', d => sidebarRoot.name.includes(d[0]) ? color.lightpurple : 'none')
                            setHovered([])
                        })
                        .style('transition','0.5s opacity')
                        .style('opacity', d => hovered.length > 0 && !hovered.includes(d[0]) ? 0.2 : 1)
                    labels.append("div")
                        .classed('label-circle', true)
                        .attr("id", d => "label-circle-" + d[0])
                        .style('background', d => {
                            if (!d[1][0].data.concept.standard_concept) {
                                let colorVar = colorList[d[0]]
                                return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, "+ colorVar + " 0.5px," + colorVar + " 2px)"
                            } else {return "none"}    
                        })
                        .style("background-color", d => {
                            if (d[1][0].data.concept.standard_concept) {
                                return colorList[d[0]]
                            } else {return "none"}
                        }) 
                        .on('mouseover', function(e,d) {
                            if (selectedConcepts.length > 1) {
                                tooltipHover(d[1][0], "leave", e) 
                                hoverLabelCircle = true
                                d3.select('#label-circle-' + d[0]).transition().style('background-color', 'none').style('background','none') 
                                d3.select('#x-'+d[0]).transition().style('opacity',1)
                            }
                        })
                        .on('mouseout', function(e,d) {
                            hoverLabelCircle = false
                            if (selectedConcepts.length > 1) {
                                d3.select('#x-'+d[0]).transition().style('opacity',0)
                                d3.select('#label-circle-' + d[0]).transition()
                                .style('background', d => {
                                    if (!d[1][0].data.concept.standard_concept) {
                                        let colorVar = colorList[d[0]]
                                        return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, "+ colorVar + " 0.5px," + colorVar + " 2px)"
                                    } else {return "none"}    
                                })
                                .style("background-color", d => {
                                    if (d[1][0].data.concept.standard_concept) {
                                        return colorList[d[0]]
                                    } else {return "none"}
                                }) 
                            }
                        })
                        .on('click', function(e,d) {
                            if (selectedConcepts.length > 1) {
                                let filteredConcepts = selectedConcepts.filter(e => e.name !== d.key)
                                setSelectedConcepts(filteredConcepts) 
                                setHovered([])  
                                tooltipHover(d[1][0], "leave", e) 
                            }   
                        })
                        .append('i')
                            .classed('fa-solid fa-x fa-xs',true)
                            .attr('id',d => 'x-'+d[0])
                            .style('color',color.text)
                            .style('opacity', 0)
                            .style('pointer-events','none')
                    const text = labels.append("div")
                        .style("cursor", "pointer")
                    text.append('tspan')
                        .classed('label-text', true)
                        .attr("id", d => "label-text-" + d[0])
                        .style("font-weight", d => sidebarRoot.name.includes(d[0]) || hovered.includes(d[0]) ? 700 : 400)
                        .html(d => d[1][0].data.concept.concept_name)
                        .style('pointer-events','none')
                    text.append('tspan')
                        .classed('label-code',true)
                        .attr("id", d => "label-vocab-" + d[0])
                        .style('color', color.text)
                        .style('font-weight',700)
                        .style('font-size', '10px')
                        .html(d => d[1][0].data.concept.concept_code)   
                        .style('pointer-events','none') 
                    text.append('tspan')
                        .classed('label-vocab', true)
                        .attr("id", d => "label-vocab-" + d[0])
                        .style('color', color.textlight)
                        .style('font-size', '10px')
                        .html(d => d[1][0].data.concept.vocabulary_id)
                        .style('pointer-events','none')
                }, update => {
                    const labels = update
                        .style('background-color', d => sidebarRoot.name.includes(d[0]) || hovered.includes(d[0]) ? color.lightpurple : 'white')
                        .on('click', (e,d) => {
                            if (!hoverLabelCircle) navigate(`/${d[0]}`)
                        })
                        .on("mouseover", function (e,d) {
                            const el = this
                            el.__hoverTimeout__ = setTimeout(() => {
                                d3.select("#label-text-" + d[0]).style('font-weight',700)
                                d3.select('#label-' + d[0]).style('background-color', color.lightpurple)
                                setHovered([d[0]])
                            },200)
                        })
                        .on("mouseout", function (e,d) {
                            const el = this
                            clearTimeout(el.__hoverTimeout__)
                            d3.select("#label-text-" + d[0]).style("font-weight", d => sidebarRoot.name.includes(d[0]) ? 700 : 400)
                            d3.select('#label-' + d[0]).style('background-color', d => sidebarRoot.name.includes(d[0]) ? color.lightpurple : 'none')
                            setHovered([])
                        })
                        .style('opacity', d => hovered.length > 0 && !hovered.includes(d[0]) ? 0.2 : 1)
                    labels.select('.label-circle')
                        .style('background', d => {
                            if (!d[1][0].data.concept.standard_concept) {
                                let colorVar = colorList[d[0]]
                                return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, "+ colorVar + " 0.5px," + colorVar + " 2px)"
                            } else {return "none"}    
                        })
                        .style("background-color", d => {
                            if (d[1][0].data.concept.standard_concept) {
                                return colorList[d[0]]
                            } else {return "none"}
                        }) 
                        .on('mouseover', function(e,d) {
                            if (selectedConcepts.length > 1) {
                                tooltipHover(d[1][0], "leave", e) 
                                hoverLabelCircle = true
                                d3.select('#label-circle-' + d[0]).transition().style('background-color', 'none').style('background','none')
                                d3.select('#x-'+d[0]).transition().style('opacity',1)
                            }
                        })
                        .on('mouseout', function(e,d) {
                            hoverLabelCircle = false
                            if (selectedConcepts.length > 1) {
                                d3.select('#x-'+d[0]).transition().style('opacity',0)
                                d3.select('#label-circle-' + d[0]).transition()
                                .style('background', d => {
                                    if (!d[1][0].data.concept.standard_concept) {
                                        let colorVar = colorList[d[0]]
                                        return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, "+ colorVar + " 0.5px," + colorVar + " 2px)"
                                    } else {return "none"}    
                                })
                                .style("background-color", d => {
                                    if (d[1][0].data.concept.standard_concept) {
                                        return colorList[d[0]]
                                    } else {return "none"}
                                }) 
                            }
                        })
                        .on('click', function(e,d) {
                            if (selectedConcepts.length > 1) {
                                let filteredConcepts = selectedConcepts.filter(e => e.name !== d.key)
                                setSelectedConcepts(filteredConcepts)   
                                setHovered([])
                                tooltipHover(d[1][0], "leave", e) 
                            }   
                        })
                    labels.select('.label-text')
                        .html(d => d[1][0].data.concept.concept_name)
                        .style("font-weight", d => sidebarRoot.name.includes(d[0]) || hovered.includes(d[0]) ? 700 : 400)
                    labels.select('.label-vocab')
                        .html(d => d[1][0].data.concept.vocabulary_id)
                },exit => exit.remove())    
        }
        updateLabels(groups)
    },[selectedConcepts,conceptNames.length < 50 ? hovered : null])

    return (
        <div id = "graph-section">
            <div id = "data-tooltip">
                <div style = {{fontSize:'10px',paddingBottom:1}} id = "data-year"></div>
                <div style = {{fontSize:'10px'}}>
                    <span style = {{fontWeight:'bold',fontSize:'12px'}} id = "data-value"></span> 
                    <span id = "counts"></span>
                </div>
            </div>
            {/* <div style = {{display:'flex',alignItems:'center',flexWrap:'wrap',marginRight:'1em',marginBottom:5}}>
                        <div style = {{paddingRight:8,margin:0}}><h2 style = {{margin:0}}>Record Counts</h2></div>
                        <p style = {{display: extent ? 'block' : 'none',fontSize:12,margin:0,marginTop:2}}>{extent ? extent[0] + "-" + extent[1] : null}</p>    
                    </div> */}
            <div id = "graph-section-container">
                <div id = "graph-selections">
                    <div id = "graph-filters" style = {{display:'flex',flexWrap:'wrap',marginBottom:3,alignItems:'flex-end'}}>
                        <div className = "graph-selection" id = "gender-container" style = {{marginRight:'1em'}}>
                            <p style = {{fontWeight: graphFilter.gender !== -1 ? 700 : 400,margin:0,paddingBottom:3,paddingRight:openFilters ? 0 : 5}}>Sex</p>
                            <div className = "filter-container">
                                <div className = "filter-viz" style = {{marginBottom:5}} id = "gender-viz">
                                    <svg style = {{zIndex:0}} id = "gender-svg"></svg>
                                </div>
                                <div className = "toggle-container" id = "gender-labels" style = {{zIndex:500,width: 110}}></div>
                            </div>
                            <FontAwesomeIcon style = {{display: graphFilter.gender !== -1 ? 'block' : 'none', paddingLeft: openFilters ? 0 : 5, paddingBottom:1}} className = "reset-dropdown fa-2xs" id = "reset-gender" icon={faX} 
                                onClick = {() => {
                                    setGraphFilter({gender:-1,age:graphFilter.age,source:graphFilter.source})
                                }}
                            />
                        </div>
                        <div className = "graph-selection" id = "age-container" style = {{marginRight:'1em'}}>
                            <p style = {{fontWeight: graphFilter.age.length > 1 ? 700 : 400, margin:0,paddingBottom:3,paddingRight:5}}>Age</p>
                            <div className = "filter-container" id = "age-filter" onMouseDown = {(e) => ageBrush(e,'down')} onMouseUp = {(e) => ageBrush(e,'up')} onMouseMove = {(e) => ageBrush(e,'move')} style = {{cursor:'pointer'}}>
                                <div className = "filter-viz" style = {{marginBottom:2}} id = "age-viz"></div>
                                <div className = "toggle-container" id = "age-labels"></div>
                            </div>
                            <FontAwesomeIcon style = {{left:5,display: graphFilter.age.length > 1 ? 'block' : 'none',paddingBottom:1}} className = "reset-dropdown fa-2xs" id = "reset-age" icon={faX} 
                                onClick = {() => {
                                    setGraphFilter({gender:graphFilter.gender,age:[-1],source:graphFilter.source})
                                }}
                            />
                        </div> 
                        <div className = "graph-selection" id = "source-container" style = {{marginRight:'1em',marginBottom:5}}>
                            <p style = {{fontWeight: graphFilter.source.length > 1 ? 700 : 400, margin:0,paddingBottom:3,paddingRight:5}}>Visit Type</p>
                            <div className = "filter-container" id = "source-filter" style = {{cursor:'pointer'}}>
                                <div className = "filter-viz" style = {{marginBottom:2}} id = "source-viz"></div>
                                <div className = "toggle-container" id = "source-labels"></div>
                            </div>
                            <FontAwesomeIcon style = {{left:5,display: graphFilter.source.length > 1 ? 'block' : 'none',paddingBottom:1}} className = "reset-dropdown fa-2xs" id = "reset-source" icon={faX} 
                                onClick = {() => {
                                    setGraphFilter({gender:graphFilter.gender,age:graphFilter.age,source:[-1]})
                                }}
                            />
                        </div>    
                        <FontAwesomeIcon className = "dropBtn fa-lg" id = 'open-btn' icon={faCaretDown} style = {{display:'none',opacity: 0.3}}
                        onMouseOver={() => d3.select('#open-btn').style('opacity', 1)}
                        onMouseOut={() => d3.select('#open-btn').style('opacity', 0.3)}
                        onClick = {() => {
                            d3.selectAll('.filter-viz').style('display', 'flex')
                            d3.select('#open-btn').style('display', 'none')
                            d3.select('#close-btn').style('display', 'block')
                            setOpenFilters(true)
                        }}
                        />
                        <FontAwesomeIcon className = "dropBtn fa-lg" id = 'close-btn' icon={faCaretUp} style = {{display:'block',opacity: 1}}
                        onClick = {() => {
                            d3.selectAll('.filter-viz').style('display', 'none')
                            d3.select('#open-btn').style('display', 'block')
                            d3.select('#close-btn').style('display', 'none')
                            setOpenFilters(false)
                        }}
                        />   
                    </div>
                   
                </div>   
                <div className = "box-shadow" id = "graph-group" style = {{position:'relative'}}>
                    <div id = "graph-subheader">
                        <div id = "graph-labels"></div>  
                    </div> 
                    <div ref={graphContainerRef} id = "graph-container" style = {{position:'relative'}}>
                        <div id = "rootline-btn" style = {{backgroundColor: showRootLine ? color.text : 'transparent',color: showRootLine ? 'white' : color.text,fontWeight: showRootLine ? 700 : 400, border: showRootLine ? '1px solid var(--text)' : '1px solid var(--textlightest)'}} onClick = {() => setShowRootLine(!showRootLine)}>Root DRC</div>
                        <div id = "reset-zoom" style = {{display: zoomed ? 'block' : 'none'}} onClick = {() => resetZoom()}>Reset</div>
                        <svg style = {{display:'block'}} id = "graph">
                            <g className = "brush"></g>
                            <g className = "x-grid"></g>
                            <g className = "axis-grid"></g>
                            <g className = "x axis axis-grid"></g>
                            <g className = "y axis"></g>
                            <g className = "axis-base"></g>
                            <g id = "graph-stack"></g>
                            <g id = "graph-line"></g>
                            <circle id = "focus"></circle>
                        </svg>
                    </div>  
                    <div id = "y-label">Record Counts</div>
                </div>       
            </div>  
        </div>    
    )
}

export default GraphSection;