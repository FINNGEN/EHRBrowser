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
    const relationship = props.relationship
    const showRootLine = props.showRootLine
    const setShowRootLine = props.setShowRootLine
    const countType = props.countType
    const setCountType = props.setCountType
    const moveSlider = props.moveSlider
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
                        if (!getConceptInfo(d.key).standard_concept || (relationship === 'mappings' && selectedConcepts.find(c => c.name === d.key).leaf)) {
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
                        },600) 
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
                        if (!getConceptInfo(d.key).standard_concept || (relationship === 'mappings' && selectedConcepts.find(c => c.name === d.key).leaf)) {
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
                        },600) 
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
        d3.select("#graph").select(".axis-grid")
            .call(yAxisGrid)
        // axis lines
        d3.select("#graph").select(".x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(scaleX).tickSize(-height).ticks(ticks.two).tickFormat(d3.format("d")).tickSizeOuter(0).tickPadding(8))
        d3.select("#graph").select(".y")
            .call(d3.axisLeft(scaleY).ticks(5).tickSizeOuter(0))
        d3.select("#graph").select(".axis-base")
            .call(d3.axisTop(scaleX).tickFormat('').tickSize(-height).tickSizeOuter(0))
        const rightBorder = d3.select("#graph")
            .selectAll(".right-border")
            .data([null])
        rightBorder.join("rect")
            .attr("class", "right-border")
            .attr("x", width)
            .attr("y", 0)
            .attr("width", 0.75)
            .attr("height", height)
            .attr("fill", "#B8B8B8")
            .raise()
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
            if (!d3.select('#btn-' + id).classed('filterActive')) d3.select('#btn-'+id).classed('filterHover',true)
            if (type !== 'source') {
                if (!d3.select('#geometry-' + id).classed('filterActive')) d3.select('#geometry-'+id).classed('filterHover',true)
                d3.select('#viz-label-'+id).classed('labelHover',true)
            }
        } else {
            d3.select('#btn-'+id).classed('filterHover', false)
            if (type !== 'source') {
                d3.select('#geometry-'+id).classed('filterHover', false)    
                d3.select('#viz-label-'+id).classed('labelHover', false)  
            }
        }
    }
    // select filter
    function filterSelect(id,type) {
        if (type === 'age') {
            let ages = graphFilter.age
            if (!ages.includes(id)) ages.push(id)
            else {ages = ages.filter(age => age !== id)}
            setGraphFilter(prev => ({
                ...prev,
                age: ages
            })); 
        } 
        if (type === 'source') {
            let sources = graphFilter.source
            const allSources = sourceData.map(obj => obj.codes).flat().filter(s => s.sum > 0).map(s => s.id)
            if (!sources.includes(id) && !graphFilter.source.includes(-1)) sources.push(id)
            else {
                if (graphFilter.source.includes(-1)) sources = allSources.filter(source => source !== id)
                else sources = sources.filter(source => source !== id)
            }
            if (allSources.every(id => sources.includes(id))) sources = [-1]
            setGraphFilter(prev => ({
                ...prev,
                source: sources
            }));    
        }
        if (type === 'gender') {
            if (graphFilter.gender !== id) setGraphFilter(prev => ({
                ...prev,
                gender: id
            })); 
            else setGraphFilter(prev => ({
                ...prev,
                gender: -1
            }));   
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
                setGraphFilter(prev => ({
                    ...prev,
                    age: ages
                })); 
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
                        d3.select('#btn-'+i).classed('filterActive',true)
                        d3.select('#geometry-'+i).classed('filterActive',true)   
                        d3.select('#viz-label-'+i).classed('labelHover',true) 
                    } else {
                        d3.select('#btn-'+i).classed('filterActive',false)
                        d3.select('#geometry-'+i).classed('filterActive',false)
                        d3.select('#viz-label-'+i).classed('labelHover',false) 
                    }
                }
            }
        }
    }
    // filter tooltip
    function filterTooltip(d,mode,event) {
        if (mode === 'enter') {
            d3.select('#filter-name').html(d.code)
            d3.select('#filter-value').html(abbreviateNumber(d.sum))
            d3.select('#filter-tooltip')
                .style('left', function() {
                    const w = document.getElementById('filter-tooltip').clientWidth
                    if (event.x + w > window.innerWidth) return (event.x - w - 5 + 'px')
                    else return (event.x + 10 + 'px')    
                })
                .style('top', function() {
                    const h = document.getElementById('filter-tooltip').clientHeight
                    if (event.y - h < 0) return (event.y + 10 + 'px')    
                    else return (event.y - h + 'px')
                })
                .transition()
                .style('opacity',1)
                
        } else d3.select('#filter-tooltip').transition().style('opacity',0)
    }
    function abbreviateNumber(num) {
        const abs = Math.abs(num)
        if (abs >= 1e9) {
            return (num / 1e9).toFixed(1).replace(/\.0$/, '') + 'B'
        }
        if (abs >= 1e6) {
            return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'M'
        }
        if (abs >= 1e3) {
            return (num / 1e3).toFixed(1).replace(/\.0$/, '') + 'K'
        }
        return String(num)
    }

    // close source dropdown
    document.addEventListener('click', (e) => {
        if (document.getElementById('dropdown-sources')) {
            const sourceContainer = document.getElementById('source-collapsed')
            if (!sourceContainer.contains(e.target)) {
                d3.select('#open-sources').style('display', 'block')
                d3.select('#close-sources').style('display', 'none')  
                d3.select('#dropdown-sources').style('visibility','hidden') 
            } 
        }
    })

    // filters viz
    useEffect(() => {
        if (sourceData) {
            if (genderData.length > 0 && ageData.length > 0 && sourceData.length > 0) {
                // gender
                const genders = [8507,8532]
                const width = 40
                const height = 40
                const piMargin = 5
                const radius = Math.min(width, height) 
                d3.select("#gender-svg")
                    .attr("width", width)
                    .attr("height", height)
                    .append('g')
                    .attr("transform", `translate(${width/2}, ${height/2 - piMargin}) rotate(180)`) 
                const pieData = d3.pie().value(d => d.sum).sort(null)(genderData)
                const arcGenerator = d3.arc()
                    .innerRadius(0)
                    .outerRadius(radius)
                d3.select('#gender-labels').selectAll('.gender').data(genderData, d => d.id)
                    .join(enter => {
                        enter.append('div')
                            .classed('gender btn flex filterBtn',true)
                            .classed('filterActive', (d) => graphFilter.gender === d.id ? true : false)
                            .classed('edgeLeft', (d,i) => i === 0 ? true : false)
                            .classed('edgeRight', (d,i) => i !== 0 ? true : false)
                            .attr('id',d => 'btn-'+d.id)
                            .style('width','38px')
                            .html(d => d.id === 8507 ? 'Male' : 'Female')
                            .on('mouseover',(e,d) => filterHover(d.id,'enter','gender'))
                            .on('mouseout',(e,d) => filterHover(d.id,'leave','gender'))
                            .on('click',(e,d) => filterSelect(d.id,'gender'))
                    },update => {
                        update  
                            .classed('filterActive', (d) => graphFilter.gender === d.id ? true : false)
                            .on('mouseover',(e,d) => filterHover(d.id,'enter','gender'))
                            .on('mouseout',(e,d) => filterHover(d.id,'leave','gender'))
                            .on('click',(e,d) => filterSelect(d.id,'gender'))
                    })
                d3.select("#gender-svg").selectAll(".arc").data(pieData, d => d.data.id)
                    .join(enter => {
                        const container = enter.append('g')
                            .classed('arc',true)  
                        container.append('path')
                            .classed('arc-path btn viz',true)
                            .classed('filterActive', (d) => graphFilter.gender === d.data.id ? true : false)
                            .attr('id', d => 'geometry-'+d.data.id)
                            .attr("d", d => d.endAngle === d.startAngle ? null : arcGenerator(d))
                            .on("mouseover", (e,d) => filterHover(d.data.id, "enter",'gender'))
                            .on("mouseout", (e,d) => filterHover(d.data.id, "leave",'gender'))
                            .on("click", (e,d) => filterSelect(d.data.id, "gender"))
                            .attr("transform", `translate(${width/2}, ${height/2}) scale(0.5) rotate(180)`)
                            .style('fill', d => d.data.id === maxGender ? '#d5d5d5' : '#e0e0e0')
                        container.append('text')
                            .classed('arc-text vizLabel num',true)
                            .attr('id', d => 'viz-label-'+d.data.id)
                            .text(d => d.data.sum === 0 ? '' : abbreviateNumber(d.data.sum))
                            .attr("x", d => d.data.id === genders[0] ? -radius/2 : radius/2) 
                            .attr("y", radius/2 + piMargin) 
                            .attr('font-weight', d => graphFilter.gender === d.data.id ? 500 : 400)
                            .attr("text-anchor", d => d.data.id === genders[0] ? "end" : "start") 
                            .style('fill', d => graphFilter.gender === d.data.id ? '#36126d' : d.data.id === maxGender ? 'color-mix(in srgb, #808080, white 30%)' : 'color-mix(in srgb, #808080, white 50%)')
                            .attr("transform", `translate(${width/2}, ${height/2 - piMargin})`)
                    },update=>{
                        update.select('.arc-path')
                            .classed('filterActive', (d) => graphFilter.gender === d.data.id ? true : false)
                            .on("mouseover", (e,d) => filterHover(d.data.id, "enter",'gender'))
                            .on("mouseout", (e,d) => filterHover(d.data.id, "leave",'gender'))
                            .on("click", (e,d) => filterSelect(d.data.id, "gender"))
                            .transition()
                            .attr("d", d => d.endAngle === d.startAngle ? null : arcGenerator(d))
                            .style('fill', d => d.data.id === maxGender ? '#d5d5d5' : '#e0e0e0')
                        update.select('.arc-text')
                            .text(d => d.data.sum === 0 ? '' : abbreviateNumber(d.data.sum))
                            .attr("x", d => d.data.id === genders[0] ? -radius/2 : radius/2) 
                            .attr("y", radius/2 + piMargin) 
                            .attr("text-anchor", d => d.data.id === genders[0] ? "end" : "start") 
                            .attr('font-weight', d => graphFilter.gender === d.data.id ? 500 : 400)
                            .style('fill', d => graphFilter.gender === d.data.id ? '#36126d' : d.data.id === maxGender ? 'color-mix(in srgb, #808080, white 30%)' : 'color-mix(in srgb, #808080, white 50%)')
                    })
                // age
                const ageExtent = d3.extent(ageData.map(d => d.sum))
                const scaleHeight = d3.scaleLinear().domain([0,ageExtent[1]]).range([0,30])
                d3.select('#age-labels').selectAll('.age').data(ageData, d => d.id)
                    .join(enter => {
                        enter.append('div')
                            .classed('age btn flex filterBtn num',true)
                            .classed('filterActive', (d) => graphFilter.age.includes(d.id) ? true : false)
                            .classed('edgeLeft', (d,i) => i === 0 ? true : false)
                            .classed('edgeRight', (d,i) => i === ageData.length -1 ? true : false)
                            .attr('id',d => 'btn-'+d.id)
                            .html(d => d.id*10+'-'+(d.id*10+9))
                            .style('width','32px')                    
                            .on('mouseover',(e,d) => filterHover(d.id,'enter','age'))
                            .on('mouseout',(e,d) => filterHover(d.id,'leave','age'))
                            .on('click',(e,d) => filterSelect(d.id,'age'))
                    },update => {
                        update  
                            .classed('filterActive', (d) => graphFilter.age.includes(d.id) ? true : false)
                            .on('mouseover',(e,d) => filterHover(d.id,'enter','age'))
                            .on('mouseout',(e,d) => filterHover(d.id,'leave','age'))
                            .on('click',(e,d) => filterSelect(d.id,'age'))
                    })
                d3.select('#age-viz').selectAll('.age-geometry').data(ageData, d => d.id)
                    .join(enter => {
                        const container = enter.append('div')
                            .classed('age-geometry',true)
                            .style('display','flex')
                            .style('flex-direction','column')
                        container.append('p')
                            .classed('age-p vizLabel num',true)
                            .classed('labelHover', d => graphFilter.age.includes(d.id) ? true : false)
                            .attr('id',d=>'viz-label-'+d.id)
                            .style('color', d => graphFilter.age.includes(d.id) ? '#36126d' : ageExtent.includes(d.sum) ? 'color-mix(in srgb, #808080, white 30%)' : 'color-mix(in srgb, #808080, white 70%)')
                            .html(d => d.sum === 0 ? '' : abbreviateNumber(d.sum))
                        container.append('div')
                            .classed('age-rect btn viz',true)
                            .classed('filterActive',(d) => graphFilter.age.includes(d.id) ? true : false)
                            .attr('id', d => 'geometry-'+d.id)
                            .style('width', '38px')
                            .style('height', d => d.sum === 0 ? '0px' : scaleHeight(d.sum) + 'px')
                            .on('mouseover', (e,d) => filterHover(d.id, 'enter','age'))
                            .on('mouseout', (e,d) => filterHover(d.id, 'leave','age'))
                            .on('click', (e,d) => filterSelect(d.id, 'age'))
                    },update => {
                        update.select('.age-p')
                            .classed('labelHover', d => graphFilter.age.includes(d.id) ? true : false)
                            .style('color', d => graphFilter.age.includes(d.id) ? '#36126d' : ageExtent.includes(d.sum) ? 'color-mix(in srgb, #808080, white 30%)' : 'color-mix(in srgb, #808080, white 70%)')
                            .html(d => d.sum === 0 ? '' : abbreviateNumber(d.sum))
                        update.select('.age-rect')
                            .classed('filterActive',(d) => graphFilter.age.includes(d.id) ? true : false)
                            .on('mouseover', (e,d) => filterHover(d.id, 'enter','age'))
                            .on('mouseout', (e,d) => filterHover(d.id, 'leave','age'))
                            .on('click', (e,d) => filterSelect(d.id, 'age'))
                            .transition()    
                            .style('height', d => d.sum === 0 ? '0px' : scaleHeight(d.sum) + 'px')
                    })   
                // source viz
                const sourceWidth = document.getElementById("graph-filters").clientWidth - document.getElementById('gender-container').clientWidth - document.getElementById('age-container').clientWidth - 70
                document.getElementById("header-sources").style.maxWidth =  sourceWidth + 40 + 'px'
                const allSources = sourceData.map(d => d.codes).flat()
                const filteredSources = sourceData.map(obj => ({...obj,codes:obj.codes.filter(c => c.sum !== 0)})).filter(obj => obj.codes.length > 0)
                const categorySums = filteredSources.map(obj => d3.sum(obj.codes.map(c => c.sum)))
                const scaleWidth = d3.scaleLinear().domain([0,d3.extent(categorySums)[1]]).range([1,sourceWidth])
                d3.select('#dropdown-sources').selectAll('.source-section').data(filteredSources, d => d.key)
                    .join(enter => {
                        const category = enter.append('div')
                            .classed('source-section',true)
                            .style('width','100%')
                        const title = category.append('div')
                            .classed('flex',true)
                        title.append('p')
                            .html(d => d.key == 'Long.' ? 'Longitudinal' : d.key)
                        // title.append('p')
                        //     .classed('dropdown-category-btn',true)
                        //     .style('font-size','10px')
                        //     .style('cursor','pointer')
                        //     .style('color', color.textlightest)
                        //     .style('display', d => d3.sum(d.codes.map(c => c.sum)) === 0 ? 'none' : 'block')
                        //     .html(d => d.codes.filter(c => c.sum > 0).map(c => c.id).every(id => graphFilter.source.includes(id)) || graphFilter.source.includes(-1) ? 'Remove all' : 'Add all')
                        //     .on('click',(e,d) => {
                        //         let sources = graphFilter.source
                        //         const ids = d.codes.filter(c => c.sum > 0).map(c => c.id)
                        //         if (ids.every(id => graphFilter.source.includes(id))) {
                        //             sources = sources.filter(source => !ids.includes(source))
                        //         }
                        //         else {
                        //             if (graphFilter.source.includes(-1)) sources = allSources.filter(s => s.sum > 0).map(s => s.id).filter(id => !ids.includes(id))
                        //             else sources = [...graphFilter.source,...ids].filter((e,n,l) => l.indexOf(e) === n)
                        //         }
                        //         // if (sources.length === 0) sources = [-1]
                        //         setGraphFilter({gender:graphFilter.gender,age:graphFilter.age,source:sources})
                        //     })
                        category.selectAll(".source").data(d => d.codes, d => d.key)
                            .join(enter => {
                                const container = enter.append('div')
                                    .classed('source flex',true)  
                                    .style('opacity', d => d.sum > 0 ? 1 : 0.2) 
                                    .style('pointer-events', d => d.sum > 0 ? 'all' : 'none')
                                container.append('div') 
                                    .classed('source-check-box checkBox',true)
                                    .attr('id', d => 'check-box-'+d.id)
                                    .style('background-color', d => graphFilter.source.includes(d.id) || (graphFilter.source.includes(-1) && d.sum > 0) ? '#36125d' : 'transparent')
                                    .style('border', d => graphFilter.source.includes(d.id) || (graphFilter.source.includes(-1) && d.sum > 0)? '1px solid #36125d' : '1px solid #cccccc')
                                    .on('click', (e,d) => {
                                        e.stopPropagation()
                                        filterSelect(d.id,'source')
                                    })
                                container.append('p')
                                    .classed('source-p btn',true)
                                    .attr('id', d => 'source-'+d.id)
                                    .style('font-weight', d => graphFilter.source.includes(d.id) || (graphFilter.source.includes(-1) && d.sum > 0)? 500 : 400)
                                    .style('color', d => graphFilter.source.includes(d.id) || (graphFilter.source.includes(-1) && d.sum > 0)? '#36125d' : '#808080')
                                    .html(d => d.code)    
                            },update => {
                                update 
                                    .style('opacity', d => d.sum > 0 ? 1 : 0.2) 
                                    .style('pointer-events', d => d.sum > 0 ? 'all' : 'none')
                                update.select('.source-check-box')
                                    .style('background-color', d => graphFilter.source.includes(d.id) || (graphFilter.source.includes(-1) && d.sum > 0) ? '#36125d' : 'transparent')
                                    .style('border', d => graphFilter.source.includes(d.id) || (graphFilter.source.includes(-1) && d.sum > 0)? '1px solid #36125d' : '1px solid #cccccc')
                                    .on('click', (e,d) => {
                                        e.stopPropagation()
                                        filterSelect(d.id,'source')
                                    })
                                update.select('.source-p')
                                    .style('font-weight', d => graphFilter.source.includes(d.id) || (graphFilter.source.includes(-1) && d.sum > 0)? 500 : 400)
                                    .style('color', d => graphFilter.source.includes(d.id) || (graphFilter.source.includes(-1) && d.sum > 0)? '#36125d' : '#808080')
                                    .html(d => d.code)
                            })      
                    },update => {
                        // update.selectAll('.dropdown-source-section-title')
                        //     .style('opacity', d => d3.sum(d.codes.map(c => c.sum)) === 0 ? 0.3 : 1)
                        //     .style('color', d => d.codes.filter(c => c.sum > 0).map(c => c.id).every(id => graphFilter.source.includes(id)) || graphFilter.source.includes(-1) ? color.text : color.textlight)
                        // update.selectAll('.dropdown-category-btn')
                        //     .style('display', d => d3.sum(d.codes.map(c => c.sum)) === 0 ? 'none' : 'block')
                        //     .html(d => d.codes.filter(c => c.sum > 0).map(c => c.id).every(id => graphFilter.source.includes(id)) || graphFilter.source.includes(-1) ? 'Remove all' : 'Add all')
                        //     .on('click',(e,d) => {
                        //         let sources = graphFilter.source
                        //         const ids = d.codes.filter(c => c.sum > 0).map(c => c.id)
                        //         if (ids.every(id => graphFilter.source.includes(id))) {
                        //             sources = sources.filter(source => !ids.includes(source))
                        //         }
                        //         else {
                        //             if (graphFilter.source.includes(-1)) sources = allSources.filter(s => s.sum > 0).map(s => s.id).filter(id => !ids.includes(id))
                        //             else sources = [...graphFilter.source,...ids].filter((e,n,l) => l.indexOf(e) === n)
                        //         }
                        //         setGraphFilter({gender:graphFilter.gender,age:graphFilter.age,source:sources})
                        //     })
                        update.selectAll(".source").data(d => d.codes, d => d.key)
                            .join(enter => {
                                const container = enter.append('div')
                                    .classed('source flex',true)  
                                    .style('opacity', d => d.sum > 0 ? 1 : 0.2) 
                                    .style('pointer-events', d => d.sum > 0 ? 'all' : 'none')
                                container.append('div') 
                                    .classed('source-check-box checkBox',true)
                                    .attr('id', d => 'check-box-'+d.id)
                                    .style('background-color', d => graphFilter.source.includes(d.id) || (graphFilter.source.includes(-1) && d.sum > 0) ? '#36125d' : 'transparent')
                                    .style('border', d => graphFilter.source.includes(d.id) || (graphFilter.source.includes(-1) && d.sum > 0)? '1px solid #36125d' : '1px solid #cccccc')
                                    .on('click', (e,d) => {
                                        e.stopPropagation()
                                        filterSelect(d.id,'source')
                                    })
                                container.append('p')
                                    .classed('source-p btn',true)
                                    .attr('id', d => 'source-'+d.id)
                                    .style('font-weight', d => graphFilter.source.includes(d.id) || (graphFilter.source.includes(-1) && d.sum > 0)? 500 : 400)
                                    .style('color', d => graphFilter.source.includes(d.id) || (graphFilter.source.includes(-1) && d.sum > 0)? '#36125d' : '#808080')
                                    .html(d => d.code)    
                            },update => {
                                update 
                                    .style('opacity', d => d.sum > 0 ? 1 : 0.2) 
                                    .style('pointer-events', d => d.sum > 0 ? 'all' : 'none')
                                update.select('.source-check-box')
                                    .style('background-color', d => graphFilter.source.includes(d.id) || (graphFilter.source.includes(-1) && d.sum > 0) ? '#36125d' : 'transparent')
                                    .style('border', d => graphFilter.source.includes(d.id) || (graphFilter.source.includes(-1) && d.sum > 0)? '1px solid #36125d' : '1px solid #cccccc')
                                    .on('click', (e,d) => {
                                        e.stopPropagation()
                                        filterSelect(d.id,'source')
                                    })
                                update.select('.source-p')
                                    .style('font-weight', d => graphFilter.source.includes(d.id) || (graphFilter.source.includes(-1) && d.sum > 0)? 500 : 400)
                                    .style('color', d => graphFilter.source.includes(d.id) || (graphFilter.source.includes(-1) && d.sum > 0)? '#36125d' : '#808080')
                                    .html(d => d.code)
                            })      
                    })
                d3.select('#source-viz').selectAll('.category').data(filteredSources, d => d.key)
                    .join(enter => {
                        const category = enter.append('div')
                            .classed('category',true)
                            .style('margin','1px 0px 1px 0px')
                        const label = category.append('div')
                            .classed('flex',true)
                            .style("order",1)
                        label.append('p')
                            .classed('category-p btn',true)
                            .html(d => d.key)
                            .style('position','relative')
                            .style('padding','0px 3px 0px 5px')
                            .style('margin',0)
                            .style('font-weight', d => d.codes.map(c => c.id).every(id => graphFilter.source.includes(id)) ? 500 : 400)
                        label.append('div')
                            .classed('add-all checkBox',true)
                            .style('border', d => d.codes.map(c => c.id).every(id => graphFilter.source.includes(id)) ? '1px solid #36125d' : '1px solid #cccccc')
                            .style('background-color', d => d.codes.map(c => c.id).every(id => graphFilter.source.includes(id)) ? '#36125d' : 'transparent')
                            .on('click',(e,d) => {
                                let sources = graphFilter.source
                                const ids = d.codes.map(c => c.id)
                                if (ids.every(id => graphFilter.source.includes(id))) {
                                    sources = sources.filter(source => !ids.includes(source))
                                    if (sources.length === 0) sources = [-1]
                                }
                                else {
                                    if (graphFilter.source.includes(-1)) sources = ids
                                    else sources = [...graphFilter.source,...ids].filter((e,n,l) => l.indexOf(e) === n)
                                }
                                setGraphFilter(prev => ({
                                    ...prev,
                                    source: sources
                                })); 
                            })
                        // checkBox.append('i')
                        //     .classed('add-all-check fa-solid fa-check fa-2xs',true)
                        //     .style('color','white')
                        //     .style("pointer-events",'none')
                        //     .style('display', d => d.codes.map(c => c.id).every(id => graphFilter.source.includes(id)) ? 'block' : 'none')
                        category.selectAll(".source-geometry").data(d => d.codes, d => d.key)
                            .join(enter => {
                                enter.append('div')
                                    .classed('source-geometry viz flex btn',true)
                                    .classed('filterActive', d => graphFilter.source.includes(d.id) ? true : false)
                                    .attr('id',d => 'btn-'+d.id)
                                    .html(d => {
                                        const max = scaleWidth(d.sum) / 5
                                        return max === 0 ? '' : d.code.length > max ? d.code.substring(0,max) : d.code
                                    })
                                    .style('width',d => scaleWidth(d.sum) + 'px') 
                                    .style('height','18px')
                                    .style('font-size','8px')
                                    .on('mouseover',(e,d) => {
                                        filterTooltip(d,'enter',e)
                                        filterHover(d.id,'enter','source')
                                    })
                                    .on('mouseout',(e,d) => {
                                        filterTooltip(d,'leave',e)
                                        filterHover(d.id,'leave','source')
                                    })
                                    .on('click',(e,d) => {
                                        let sources = graphFilter.source
                                        if (!sources.includes(d.id)) {
                                            if (graphFilter.source.includes(-1)) sources = [d.id]
                                            else sources.push(d.id)
                                        } else sources = sources.filter(source => source !== d.id)
                                        if (sources.length === 0) sources = [-1]
                                        setGraphFilter(prev => ({
                                            ...prev,
                                            source: sources
                                        }));     
                                    })
                            },update => {
                                update  
                                    .classed('filterActive', d => graphFilter.source.includes(d.id) ? true : false)
                                    .html(d => {
                                        const max = scaleWidth(d.sum) / 5
                                        return max === 0 ? '' : d.code.length > max ? d.code.substring(0,max) : d.code
                                    })
                                    .style('width',d => scaleWidth(d.sum) + 'px') 
                                    .on('mouseover',(e,d) => {
                                        filterTooltip(d,'enter',e)
                                        filterHover(d.id,'enter','source')
                                    })
                                    .on('mouseout',(e,d) => {
                                        filterTooltip(d,'leave',e)
                                        filterHover(d.id,'leave','source')
                                    })
                                    .on('click',(e,d) => {
                                        let sources = graphFilter.source
                                        if (!sources.includes(d.id)) {
                                            if (graphFilter.source.includes(-1)) sources = [d.id]
                                            else sources.push(d.id)
                                        } else sources = sources.filter(source => source !== d.id)
                                        if (sources.length === 0) sources = [-1]
                                        setGraphFilter(prev => ({
                                            ...prev,
                                            source: sources
                                        }));      
                                    })
                            })   
                    },update => {
                        update.selectAll('.category-p')
                            .style('font-weight', d => d.codes.map(c => c.id).every(id => graphFilter.source.includes(id)) ? 500 : 400)
                        update.selectAll('.add-all')
                            .style('border', d => d.codes.map(c => c.id).every(id => graphFilter.source.includes(id)) ? '1px solid #36125d' : '1px solid #cccccc')
                            .style('background-color', d => d.codes.map(c => c.id).every(id => graphFilter.source.includes(id)) ? '#36125d' : 'transparent')
                            .on('click',(e,d) => {
                                let sources = graphFilter.source
                                const ids = d.codes.map(c => c.id)
                                if (ids.every(id => graphFilter.source.includes(id))) {
                                    sources = sources.filter(source => !ids.includes(source))
                                    if (sources.length === 0) sources = [-1]
                                }
                                else {
                                    if (graphFilter.source.includes(-1)) sources = ids
                                    else sources = [...graphFilter.source,...ids].filter((e,n,l) => l.indexOf(e) === n)
                                }
                                setGraphFilter(prev => ({
                                    ...prev,
                                    source: sources
                                })); 
                            })
                        // update.selectAll('.add-all-check')
                        //     .style('display', d => d.codes.map(c => c.id).every(id => graphFilter.source.includes(id)) ? 'block' : 'none')
                        update.selectAll(".source-geometry").data(d => d.codes, d => d.key)
                            .join(enter => {
                                enter.append('div')
                                    .classed('source-geometry viz flex btn',true)
                                    .classed('filterActive', d => graphFilter.source.includes(d.id) ? true : false)
                                    .attr('id',d => 'btn-'+d.id)
                                    .html(d => {
                                        const max = scaleWidth(d.sum) / 5
                                        return max === 0 ? '' : d.code.length > max ? d.code.substring(0,max) : d.code
                                    })
                                    .style('width',d => scaleWidth(d.sum) + 'px') 
                                    .style('height','18px')
                                    .style('font-size','8px')
                                    .on('mouseover',(e,d) => {
                                        filterTooltip(d,'enter',e)
                                        filterHover(d.id,'enter','source')
                                    })
                                    .on('mouseout',(e,d) => {
                                        filterTooltip(d,'leave',e)
                                        filterHover(d.id,'leave','source')
                                    })
                                    .on('click',(e,d) => {
                                        let sources = graphFilter.source
                                        if (!sources.includes(d.id)) {
                                            if (graphFilter.source.includes(-1)) sources = [d.id]
                                            else sources.push(d.id)
                                        } else sources = sources.filter(source => source !== d.id)
                                        if (sources.length === 0) sources = [-1]
                                        setGraphFilter(prev => ({
                                            ...prev,
                                            source: sources
                                        }));     
                                    })
                            },update => {
                                update  
                                    .classed('filterActive', d => graphFilter.source.includes(d.id) ? true : false)
                                    .html(d => {
                                        const max = scaleWidth(d.sum) / 5
                                        return max === 0 ? '' : d.code.length > max ? d.code.substring(0,max) : d.code
                                    })
                                    .style('width',d => scaleWidth(d.sum) + 'px') 
                                    .on('mouseover',(e,d) => {
                                        filterTooltip(d,'enter',e)
                                        filterHover(d.id,'enter','source')
                                    })
                                    .on('mouseout',(e,d) => {
                                        filterTooltip(d,'leave',e)
                                        filterHover(d.id,'leave','source')
                                    })
                                    .on('click',(e,d) => {
                                        let sources = graphFilter.source
                                        if (!sources.includes(d.id)) {
                                            if (graphFilter.source.includes(-1)) sources = [d.id]
                                            else sources.push(d.id)
                                        } else sources = sources.filter(source => source !== d.id)
                                        if (sources.length === 0) sources = [-1]
                                        setGraphFilter(prev => ({
                                            ...prev,
                                            source: sources
                                        }));     
                                    })
                            }) 
                    })
                const sourceSelections = !graphFilter.source.includes(-1) && !allSources.filter(s => s.sum > 0).map(s => s.id).every(id => graphFilter.source.includes(id)) ? graphFilter.source.map(id => allSources.find(d => d.id === id).code) : ['All']
                d3.select('#header-sources').classed('dropdownHeader-flexPadding',!sourceSelections.includes('All') ? true : false)
                const selections = d3.select('#source-selections')
                    .selectAll('.source-selection')
                    .data(sourceSelections, d => d)
                const merged = selections.join(
                    enter => {
                        const div = enter.append('div')
                            .classed('source-selection flex',true)
                            .classed('dropdownTitleEl', () => !sourceSelections.includes('All') ? true : false)
                            .classed('filterActive', () => !sourceSelections.includes('All') ? true : false)
                            .style('pointer-events', () => !sourceSelections.includes('All') ? 'all' : 'none')
                        div.append('p')
                            .html(d => d)
                        div.append('i')
                            .classed('fa-solid fa-x icon',true)
                            .style('display', () => !sourceSelections.includes('All') ? 'block' : 'none')
                        return div
                    },
                    update => update,
                    exit => exit.remove()
                )
                merged
                    .on('click', (e, d) => {
                        const id = allSources.find(s => s.code === d).id
                        let sources = graphFilter.source.filter(s => s !== id)
                        if (sources.length === 0) sources = [-1]
                        setGraphFilter(prev => ({
                            ...prev,
                            source: sources
                        }))
                    })
                document.getElementById("header-sources").style.minWidth =  document.getElementById('dropdown-sources').clientWidth - 12 + 'px'
            }
        }
    },[genderData,ageData,sourceData,graphSectionWidth])

    // update graph
    useEffect(() => {
        if (graphContainerRef.current && extent) {
            d3.select('#graph').append("defs")
            const fullHeight = document.getElementById('graph-section-container').clientHeight 
            // const headerHeight = document.getElementById('graph-controls').clientHeight
            const filterHeight = document.getElementById('graph-filters').clientHeight
            const containerWidth = document.getElementById('graph-section').clientWidth
            if (containerWidth < window.innerWidth*0.4 || graphSectionWidth === '40vw') d3.select('#graph-filters').style('display','none')
            else d3.select('#graph-filters').style('display','flex')
            document.getElementById("graph-group").style.height = fullHeight - filterHeight + 'px'
            const containerHeight = document.getElementById('graph-group').clientHeight*0.8
            const width = containerWidth + (margin * 2)
            const height = containerHeight + (margin * 2)
            const ticks1 = ((extent[1]-extent[0])/(Math.round((extent[1]-extent[0])/10)))*Math.round((extent[1]-extent[0])/10)
            const ticks2 = width < 400 ? Math.round(width/60) : ticks1 < 10 || !ticks1 ? Math.round(extent[1]-extent[0]) : 10
            const ticks = {one:ticks1,two:ticks2}
            document.getElementById("graph-container").style.height = containerHeight + 'px'
            document.getElementById("graph-labels").style.maxHeight = document.getElementById('graph-group').clientHeight*0.15 - margin + 'px'
            d3.select("#graph")
                .attr("width", '94%')
                .attr("height", '100%')
                .attr("viewBox", `${-margin*3} ${-margin/2} ${width} ${height}`)
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
                        .classed('labels btn marginRight', true) 
                        .attr('id', d => 'label-' + d[0])
                        .style('background-color','white')
                        .style('box-shadow','0 0 0 1px rgba(0, 0, 0, 0.02),0 2px 10px rgba(0, 0, 0, 0.1)')
                        .style('border', d => sidebarRoot.name.includes(d[0]) ? '1px solid #6a23d6' : 'none')
                        .style('border-radius', '20px')
                        .on('click', (e,d) => {
                            navigate(`/${d[0]}`)
                        })
                        .on("mouseover", function (e,d) {
                            const el = this
                            el.__hoverTimeout__ = setTimeout(() => {setHovered([d[0]])},200)
                        })
                        .on("mouseout", function (e,d) {
                            const el = this
                            clearTimeout(el.__hoverTimeout__)
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
                    const text = labels.append("div")
                        .style('margin-bottom','1px')
                    text.append('tspan')
                        .classed('label-text selectedText marginRight', true)
                        .attr("id", d => "label-text-" + d[0])
                        .html(d => d[1][0].data.concept.concept_name)
                    text.append('tspan')
                        .classed('label-code marginRight num',true)
                        .attr("id", d => "label-vocab-" + d[0])
                        .style('font-weight',500)
                        .html(d => d[1][0].data.concept.concept_code)   
                    text.append('tspan')
                        .classed('label-vocab', true)
                        .attr("id", d => "label-vocab-" + d[0])
                        .html(d => d[1][0].data.concept.vocabulary_id)
                }, update => {
                    const labels = update
                        .style('border', d => sidebarRoot.name.includes(d[0]) ? '1px solid #6a23d6' : 'none')
                        .on('click', (e,d) => {
                            navigate(`/${d[0]}`)
                        })
                        .on("mouseover", function (e,d) {
                            const el = this
                            el.__hoverTimeout__ = setTimeout(() => {setHovered([d[0]])},200)
                        })
                        .on("mouseout", function (e,d) {
                            const el = this
                            clearTimeout(el.__hoverTimeout__)
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
                    labels.select('.label-text')
                        .html(d => d[1][0].data.concept.concept_name)
                    labels.select('.label-vocab')
                        .html(d => d[1][0].data.concept.vocabulary_id)
                },exit => exit.remove())    
        }
        updateLabels(groups)
    },[selectedConcepts,conceptNames.length < 50 ? hovered : null])

    return (
        <div id = "graph-section">
            <div id = "filter-tooltip" className = 'toolTip dropShadow'>
                <div style = {{paddingBottom:2,fontWeight:500}} id = "filter-name"></div>
                <div id = "filter-value"></div>    
            </div>
            <div id = "graph-section-container">
                <div className = "selectionsContainer removeLeftShadow">
                    <div className = 'filters' id = "graph-filters">
                        <div className = "filterContainerVert" id = "gender-container">
                            <div className = 'flex' style = {{marginBottom:2}}>
                                <p className = 'filterLabel' style = {{fontWeight: graphFilter.gender !== -1 ? 500 : 400,opacity: graphFilter.gender !== -1 ? 1 : 0.7}}>Sex</p>
                                <FontAwesomeIcon style = {{display: graphFilter.gender !== -1 ? 'block' : 'none'}} className = "resetFilter fa-solid icon" id = "reset-gender" icon={faX} 
                                    onClick = {() => {
                                        setGraphFilter(prev => ({
                                            ...prev,
                                            gender: -1
                                    }));}}
                                />    
                            </div>
                            <div className = "filterFlex">
                                <div className = "filter-viz" id = "gender-viz"><svg id = "gender-svg"></svg></div>
                                <div className = "flex" id = "gender-labels" style = {{marginTop:2}} ></div>
                            </div>
                        </div>

                        <div className = "filterContainerVert" id = "age-container">
                            <div className = 'flex' style = {{marginBottom:2}}>
                                <p className = 'filterLabel' style = {{fontWeight: graphFilter.age.length > 1 ? 500 : 400,opacity:graphFilter.age.length > 1 ? 1 : 0.7}}>Age</p>
                                <FontAwesomeIcon style = {{display: graphFilter.age.length > 1 ? 'block' : 'none'}} className = "resetFilter fa-solid icon" id = "reset-age" icon={faX} 
                                    onClick = {() => {
                                        setGraphFilter(prev => ({
                                            ...prev,
                                            age: [-1]
                                        }));
                                    }}
                                />    
                            </div>
                            <div className = "filterFlex btn" id = "age-filter" onMouseDown = {(e) => ageBrush(e,'down')} onMouseUp = {(e) => ageBrush(e,'up')} onMouseMove = {(e) => ageBrush(e,'move')}>
                                <div className = "filter-viz" id = "age-viz"></div>
                                <div className = "flex" id = "age-labels" style = {{marginTop:2}}></div>
                            </div>
                        </div> 

                        <div className = "filterContainerVert" id = "source-container" style = {{borderRight:'none'}}>
                            <div className = 'flex' style = {{marginBottom:2}}>
                                <p className = 'filterLabel' style = {{fontWeight: !graphFilter.source.includes(-1) ? 500 : 400,opacity:!graphFilter.source.includes(-1) ? 1 : 0.7}}>Visit Type</p>
                                <FontAwesomeIcon style = {{display: !graphFilter.source.includes(-1) ? 'block' : 'none'}} className = "resetFilter fa-solid icon" id = "reset-source" icon={faX} 
                                    onClick = {() => {
                                        setGraphFilter(prev => ({
                                            ...prev,
                                            source: [-1]
                                        }));
                                    }}
                                />    
                            </div>
                            <div className = "filterFlex" style = {{alignItems:'flex-start'}}>
                                <div className = "filter-viz filterFlex" id = "source-viz" style = {{alignItems:'flex-start',alignSelf:'flex-end'}}></div>
                                <div className = 'dropdownContainer' id = "source-collapsed" style = {{visibility:'hidden',height:0}}>
                                    <div className = "dropdownHeader btn" id = "header-sources" 
                                        onClick = {() => {
                                            if (d3.select('#open-sources').style('display') === 'block') {
                                                d3.select('#open-sources').style('display', 'none')
                                                d3.select('#close-sources').style('display', 'block') 
                                                d3.select('#dropdown-sources').style('visibility','visible')
                                            } else {
                                                d3.select('#open-sources').style('display', 'block')
                                                d3.select('#close-sources').style('display', 'none')  
                                                d3.select('#dropdown-sources').style('visibility','hidden')
                                            }
                                        }}>
                                        <div className = "dropdownTitle dropdownTitleScrollable" id = 'source-selections'></div>
                                        <FontAwesomeIcon className = "dropBtn icon" id = 'open-sources' icon={faCaretDown} style = {{display:'block'}}/>
                                        <FontAwesomeIcon className = "dropBtn icon" id = 'close-sources' icon={faCaretUp} style = {{display:'none'}}/>     
                                    </div>   
                                    <div className = "dropdownContent dropShadow" id = "dropdown-sources" style = {{left:2}}></div> 
                                </div>
                            </div>
                        </div> 

                        <div className = 'flex btn' id = 'open-btn' style = {{display:'none',position:'absolute',right:'0.75em',top:60}} 
                            onClick = {() => {
                                d3.selectAll('.filter-viz').style('display', 'flex')
                                d3.select('#source-collapsed').style('visibility','hidden').style("height",0)
                                d3.select('#open-btn').style('display', 'none')
                                d3.select('#close-btn').style('display', 'flex')
                                setOpenFilters(true)
                            }}>
                            <p className = "textBtn" style = {{paddingRight:8}}>Expand filters</p>
                            <FontAwesomeIcon className = "iconLg" icon={faCaretDown} style = {{marginBottom:2}}/>    
                        </div>
                        <div className = 'flex btn selectedText' id = 'close-btn' style = {{display:'flex',position:'absolute',right:'0.75em',top:60}} 
                            onClick = {() => {
                                d3.selectAll('.filter-viz').style('display', 'none')
                                d3.select('#source-collapsed').style('visibility','visible').style('height','auto')
                                d3.select('#open-btn').style('display', 'flex')
                                d3.select('#close-btn').style('display', 'none')
                                setOpenFilters(false)
                            }}>
                            <p style = {{paddingRight:8}}>Collapse filters</p>
                            <FontAwesomeIcon className = "iconLg" icon={faCaretUp} style = {{marginTop:2,opacity:1}}/>   
                        </div>
                    </div>     
                </div>
                <div id = "graph-group" style = {{position:'relative'}}>
                    <div id = "graph-subheader">
                        <div className = "margin" id = "graph-labels"></div>  
                    </div> 
                    <div ref={graphContainerRef} id = "graph-container" style = {{position:'relative'}}>
                        <div id = "rootline-btn" style = {{backgroundColor: showRootLine ? color.text : 'transparent',color: showRootLine ? 'white' : color.text,fontWeight: showRootLine ? 700 : 400, border: showRootLine ? '1px solid var(--text)' : '1px solid var(--textlightest)'}} onClick = {() => setShowRootLine(!showRootLine)}>Root DRC</div>
                        <div id = "reset-zoom" style = {{display: zoomed ? 'block' : 'none'}} onClick = {() => resetZoom()}>Reset</div>
                        <svg style = {{display:'block'}} id = "graph">
                            <g className = "brush"></g>
                            <g className = "x-grid"></g>
                            <g className = "axis-grid"></g>
                            <g className = "x axis axis-grid num"></g>
                            <g className = "y axis num"></g>
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