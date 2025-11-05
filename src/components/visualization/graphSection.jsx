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
    const conceptHover = props.conceptHover
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
    const maxGender = props.maxGender
    const getConceptInfo = props.getConceptInfo
    const zoomed = props.zoomed
    const setZoomed = props.setZoomed
    const graphContainerRef = useRef()
    const margin = 20
    let hoverLabelCircle = false
    let brushing = false
    let zooming = false
    let x1,x2
    let hoverTimeout = null
    let currentTarget = null

    // DRAWING
    // draw line chart
    function drawGraph(groups, rollup, scaleX, scaleY) {
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
                    // .style('fill', d => {
                    //     if (!getConceptInfo(d.key).standard_concept) {
                    //         let t = textures.lines()
                    //             .size(3)
                    //             .strokeWidth(1.5)
                    //             .stroke(generateColor(d.key))  
                    //         d3.select('#tree').call(t)
                    //         return t.url()  
                    //     } 
                    //     else return generateColor(d.key)
                    // })
                    .style("fill", d => generateColor(d.key))
                    .style("transition", "0.5s all")
                    .transition()
                    .attr("d", d3.area()
                        .x((d,i) => scaleX(d.data.year))
                        .y0(d => scaleY(d[0]))
                        .y1(d => scaleY(d[1]))
                    )
                geometry.append("path")
                    .classed("area-path-background", true)
                    .attr("cursor", "pointer")
                    .attr("id", d => "area-background-" + d.key)
                    .on('click', (e,d) => navigate(`/${d.key}`))
                    .on("mouseover", (e,d) => {
                        let element = selectedConcepts.filter(c => c.name === d.key)[0]
                        clearTimeout(hoverTimeout)
                        currentTarget = d.key
                        hoverTimeout = setTimeout(() => {
                            if (currentTarget === d.key) {
                                conceptHover(d.key, "enter")  
                                tooltipHover(element, "enter", e, 'graph')  
                            }
                        }, 400) 
                    })
                    .on("mouseout", (e,d) => {
                        let element = selectedConcepts.filter(c => c.name === d.key)[0]
                        clearTimeout(hoverTimeout)
                        hoverTimeout = null
                        currentTarget = null
                        conceptHover(d.key, "leave") 
                        tooltipHover(element, "leave", e, 'graph')    
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
                    .attr("d", d3.area()
                        .x((d,i) => scaleX(d.data.year))
                        .y0(d => scaleY(d[0]))
                        .y1(d => scaleY(d[1]))
                    )
                update.select('.area-path-background')
                    .on('click', (e,d) => navigate(`/${d.key}`))
                    .on("mouseover", (e,d) => {
                        let element = selectedConcepts.filter(c => c.name === d.key)[0]
                        clearTimeout(hoverTimeout)
                        currentTarget = d.key
                        hoverTimeout = setTimeout(() => {
                            if (currentTarget === d.key) {
                                conceptHover(d.key, "enter")  
                                tooltipHover(element, "enter", e, 'graph')  
                            }
                        }, 400) 
                    })
                    .on("mouseout", (e,d) => {
                        let element = selectedConcepts.filter(c => c.name === d.key)[0]
                        clearTimeout(hoverTimeout)
                        hoverTimeout = null
                        currentTarget = null
                        conceptHover(d.key, "leave") 
                        tooltipHover(element, "leave", e, 'graph')    
                    })
                    .transition()
                    .attr("d", d3.area()
                        .x((d,i) => scaleX(d.data.year))
                        .y0(d => scaleY(d[0]))
                        .y1(d => scaleY(d[1]))
                    )
            },exit => exit.remove())
        }
        // draw labels
        function updateLabels(groups) {
            d3.select('#graph-labels').selectAll('.labels').data(groups, d => d[0])
                .join(enter => {
                    const labels = enter.append('div')  
                        .classed('labels', true) 
                        .attr('id', d => 'label-' + d[0])
                        .style("cursor", "pointer")
                        .style('background-color', d => d[0] === sidebarRoot.name ? color.lightpurple : 'none')
                        .style('border-radius', '20px')
                        .style('margin-right', '2px')
                        .on('click', (e,d) => {
                            if (!hoverLabelCircle) navigate(`/${d[0]}`)
                        })
                        .on("mouseover", (e,d) => {
                            clearTimeout(hoverTimeout)
                            currentTarget = d[0]
                            hoverTimeout = setTimeout(() => {
                                if (currentTarget === d[0]) {
                                    conceptHover(d[0], "enter")  
                                }
                            }, 400) 
                        })
                        .on("mouseout", (e,d) => {
                            clearTimeout(hoverTimeout)
                            hoverTimeout = null
                            currentTarget = null
                            conceptHover(d[0], "leave")  
                        })
                    labels.append("div")
                        .classed('label-circle', true)
                        .attr("id", d => "label-circle-" + d[0])
                        .style('background', d => {
                            if (!d[1][0].data.concept.standard_concept) {
                                let colorVar = generateColor(d[0])
                                return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, "+ colorVar + " 0.5px," + colorVar + " 2px)"
                            } else {return "none"}    
                        })
                        .style("background-color", d => {
                            if (d[1][0].data.concept.standard_concept) {
                                return generateColor(d[0])
                            } else {return "none"}
                        }) 
                        .on('mouseover', function(e,d) {
                            if (selectedConcepts.length > 1) {
                                tooltipHover(d[1][0], "leave", e, 'graph') 
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
                                        let colorVar = generateColor(d[0])
                                        return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, "+ colorVar + " 0.5px," + colorVar + " 2px)"
                                    } else {return "none"}    
                                })
                                .style("background-color", d => {
                                    if (d[1][0].data.concept.standard_concept) {
                                        return generateColor(d[0])
                                    } else {return "none"}
                                }) 
                            }
                        })
                        .on('click', function(e,d) {
                            if (selectedConcepts.length > 1) {
                                let filteredConcepts = selectedConcepts.filter(e => e.name !== d.key)
                                setSelectedConcepts(filteredConcepts)   
                                conceptHover(d[0], "leave") 
                                tooltipHover(d[1][0], "leave", e, 'graph') 
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
                        .style("font-weight", d => d[0] === sidebarRoot.name ? 700 : 400)
                        .html(d => d[1][0].data.concept.concept_name)
                    text.append('tspan')
                        .classed('label-code',true)
                        .attr("id", d => "label-vocab-" + d[0])
                        .style('color', color.text)
                        .style('font-weight',700)
                        .style('font-size', '10px')
                        .html(d => d[1][0].data.concept.concept_code)    
                    text.append('tspan')
                        .classed('label-vocab', true)
                        .attr("id", d => "label-vocab-" + d[0])
                        .style('color', color.textlight)
                        .style('font-size', '10px')
                        .html(d => d[1][0].data.concept.vocabulary_id)
                }, update => {
                    const labels = update
                        .style('background-color', d => d[0] === sidebarRoot.name ? color.lightpurple : 'white')
                        .on('click', (e,d) => {
                            if (!hoverLabelCircle) navigate(`/${d[0]}`)
                        })
                        .on("mouseover", (e,d) => {
                            clearTimeout(hoverTimeout)
                            currentTarget = d[0]
                            hoverTimeout = setTimeout(() => {
                                if (currentTarget === d[0]) {
                                    conceptHover(d[0], "enter")  
                                }
                            }, 400) 
                        })
                        .on("mouseout", (e,d) => {
                            clearTimeout(hoverTimeout)
                            hoverTimeout = null
                            currentTarget = null
                            conceptHover(d[0], "leave")  
                        })
                    labels.select('.label-circle')
                        .style('background', d => {
                            if (!d[1][0].data.concept.standard_concept) {
                                let colorVar = generateColor(d[0])
                                return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, "+ colorVar + " 0.5px," + colorVar + " 2px)"
                            } else {return "none"}    
                        })
                        .style("background-color", d => {
                            if (d[1][0].data.concept.standard_concept) {
                                return generateColor(d[0])
                            } else {return "none"}
                        }) 
                        .on('mouseover', function(e,d) {
                            if (selectedConcepts.length > 1) {
                                tooltipHover(d[1][0], "leave", e, 'graph') 
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
                                        let colorVar = generateColor(d[0])
                                        return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, "+ colorVar + " 0.5px," + colorVar + " 2px)"
                                    } else {return "none"}    
                                })
                                .style("background-color", d => {
                                    if (d[1][0].data.concept.standard_concept) {
                                        return generateColor(d[0])
                                    } else {return "none"}
                                }) 
                            }
                        })
                        .on('click', function(e,d) {
                            if (selectedConcepts.length > 1) {
                                let filteredConcepts = selectedConcepts.filter(e => e.name !== d.key)
                                setSelectedConcepts(filteredConcepts)   
                                conceptHover(d[0], "leave") 
                                tooltipHover(d[1][0], "leave", e, 'graph') 
                            }   
                        })
                    labels.select('.label-text')
                        .html(d => d[1][0].data.concept.concept_name)
                        .style("font-weight", d => d[0] === sidebarRoot.name ? 700 : 400)
                    labels.select('.label-vocab')
                        .html(d => d[1][0].data.concept.vocabulary_id)
                },exit => exit.remove())    
        }
        // draw root descendant count line
        function updateRootLine() {
            d3.select("#graph-line").selectAll('.lines').data(rootLine, d => d[0])
                .join(enter => {
                    const geometry = enter.append('g')  
                        .classed('lines', true) 
                        .attr("clip-path", "url(#clip)")
                        .raise()
                    geometry.append("path")
                        .classed("line-path", true)
                        .attr("cursor", "pointer")
                        .attr("id", d => "line-" + sidebarRoot.name)
                        .attr("stroke-width", 3)
                        .style("stroke", 'black')
                        .style("fill", "none")
                        .style("transition", "0.5s all")
                        // .style("stroke-dasharray", d => {
                        //     if (sidebarRoot.data.concepts.filter(c => c.concept_id === sidebarRoot.name)[0].standard_concept) {return 'none'} 
                        //     else {return '5px 3px'}
                        // })
                        .transition()
                        .attr("d", function(d) {
                            return d3.line()
                                .x(d => scaleX(d[1]))
                                .y(d => scaleY(+d[2]))
                                (d[1])
                            })
                    geometry.append("path")
                        .classed("line-path-background", true)
                        .attr("cursor", "pointer")
                        .attr("id", d => "line-background-" + sidebarRoot.name)
                        .attr("stroke-width", 8)
                        .style("stroke", "transparent")
                        .style("fill", "none")
                        .style("transition", "0.5s all")
                        .transition()
                        .attr("d", function(d) {
                            return d3.line()
                                .x(d => scaleX(d[1]))
                                .y(d => scaleY(+d[2]))
                                (d[1])
                            })
                }, update => {
                    update.select('.line-path')
                        .transition()
                        .attr("d", function(d) {
                            return d3.line()
                                .x(d => scaleX(d[1]))
                                .y(d => scaleY(+d[2]))
                                (d[1])
                        })
                    update.select('.line-path-background')
                        .transition()
                        .attr("d", function(d) {
                            return d3.line()
                                .x(d => scaleX(d[1]))
                                .y(d => scaleY(+d[2]))
                                (d[1])
                        })
                },exit => exit.remove())    
        }
        const stackedData = d3.stack()
            .keys(conceptNames)
            (rollup)  
        updateStack(stackedData) 
        updateLabels(groups)    
        updateRootLine()
        d3.select("#graph-viz").raise()
    }
    // FUNCTIONS
    const resetZoom = (e) => {
        if (e) {
            e.preventDefault()
            e.stopPropagation()    
        }
        if (d3.select("#zoomUI").nodes().length === 0) {
            let extent = d3.extent(selectedConcepts.map(d => d.data.code_counts).flat().map(d => d.calendar_year))
            if (!extent[0] || !extent[1]) extent = d3.extent(rootLine.get(sidebarRoot.name).map(arr => arr[1]))
            setExtent(extent)
            d3.select("#zoomUI").remove()
            zooming = false
            setZoomed(false)
        }
    }
    // get graph
    function getGraph(groups, rollup, width, height, ticks) {
        // x and y scales
        let maxRollup = d3.max(rollup, obj => Object.entries(obj).reduce((sum, [key, val]) => key !== 'year' ? sum + val : sum, 0))
        let maxRootLine = rootLine.get(sidebarRoot.name) ? Math.max(...rootLine.get(sidebarRoot.name).map(arr => arr[2])) : 0
        let maxY = rollup.length > 0 ? maxRollup > maxRootLine ? maxRollup : maxRootLine : maxRootLine
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
            .call(d3.axisBottom(scaleX).tickSize(-height).ticks(ticks.two).tickFormat(d3.format("d")).tickSizeOuter(0))
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
        drawGraph(groups, rollup, scaleX, scaleY)
    }
    // hover filter
    function filterHover(id,mode) {
        if (mode === 'enter') {
            if (id === 8507 || id === 8532) {
                if (graphFilter.gender !== id) {
                    d3.select('#btn-'+id).style('color', color.text).style('font-weight', 700)
                }
                    d3.select('#arc-'+id).attr('fill', color.text)
                    d3.select('#gender-text-'+id).style('fill',color.text)
            }
            else {
                if (!graphFilter.age.includes(id)) {
                    d3.select('#btn-'+id).style('color', color.text).style('font-weight', 700)
                }
                    d3.select('#bar-'+id).style('background-color', color.text)
                    d3.select('#age-p-'+id).style('color',color.text)   
            }
        } else {
            d3.select('#btn-'+id).style('font-weight', graphFilter.age.includes(id) || graphFilter.gender === id ? 700 : 400).style('color', graphFilter.age.includes(id) || graphFilter.gender === id ? 'white' : color.textlight)
            d3.select('#bar-'+id).style('background-color', graphFilter.age.includes(id) || graphFilter.gender === id ? color.text : color.grey)  
            d3.select('#arc-'+id).attr("fill", d => graphFilter.gender === id ? color.text : id === maxGender ? '#bac2ca' : color.grey)
            d3.select('#age-p-'+id).style('color', d => graphFilter.age.includes(id) ? color.text : color.textlight)
            d3.select('#gender-text-'+id).style('fill', d => graphFilter.gender === id ? color.text : color.textlight)
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
            setGraphFilter({gender:graphFilter.gender,age:ages})
            // filterCounts(selectedConcepts, {gender:graphFilter.gender,age:ages})    
        } else {
            if (graphFilter.gender !== id) {
                setGraphFilter({gender:id,age:graphFilter.age})
                // filterCounts(selectedConcepts, {gender:id,age:graphFilter.age})     
            } else {
                setGraphFilter({gender:-1,age:graphFilter.age})
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
                setGraphFilter({gender:graphFilter.gender,age:ages})
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
        if (genderData.length > 0 && ageData.length > 0) {
            //gender
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
            d3.select("#gender-svg").selectAll(".arc").data(pieData, d => d.data.id)
            .join(enter => {
                const container = enter.append('g')
                    .classed('arc',true)  
                container.append('path')
                    .classed('arc-path',true)
                    .attr('id', d => 'arc-'+d.data.id)
                    .attr("d", d => d.endAngle === d.startAngle ? null : arcGenerator(d))
                    .attr("fill", d => graphFilter.gender === d.data.id ? color.text : d.data.id === maxGender ? '#bac2ca' : color.grey)
                    .style("stroke", d => d.data.sum === 0 ? 'none' : color.background)
                    .style('stroke-width',2)
                    .style("cursor", "pointer")
                    .on("mouseover", (e,d) => filterHover(d.data.id, "enter"))
                    .on("mouseout", (e,d) => filterHover(d.data.id, "leave"))
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
                    .on("mouseover", (e,d) => filterHover(d.data.id, "enter"))
                    .on("mouseout", (e,d) => filterHover(d.data.id, "leave"))
                    .transition()
                    .attr("d", d => d.endAngle === d.startAngle ? null : arcGenerator(d))
                    .attr("fill", d => graphFilter.gender === d.data.id ? color.text : d.data.id === maxGender ? '#bac2ca' : color.grey)
                    .style("stroke", d => d.data.sum === 0 ? 'none' : color.background)
                update.select('.arc-text')
                    .text(d => d.data.sum === 0 ? '' : d.data.sum)
                    .attr("x", d => d.data.id === genders[0] ? -radius/2 : radius/2) 
                    .attr("y", radius/2 - 5) 
                    .attr("text-anchor", d => d.data.id === genders[0] ? "end" : "start") 
                    .style("fill", d => graphFilter.gender === d.data.id ? color.text : color.textlight)
            })
            //age
            const scaleHeight = d3.scaleLinear().domain([0,d3.extent(ageData.map(d => d.sum))[1]]).range([0,60])
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
                    .on('mouseover', (e,d) => filterHover(d.id, 'enter'))
                    .on('mouseout', (e,d) => filterHover(d.id, 'leave'))
                    .on('click', (e,d) => filterSelect(d.id, 'age'))
                    .style('width', '34px')
                    .style('cursor','pointer')
                    .style('height', d => d.sum === 0 ? '0px' : scaleHeight(d.sum) + 'px')
                    .style('background-color', d => graphFilter.age.includes(d.id) ? color.text : color.grey)
                    .style('border-top', '1px solid var(--background)')
                    .style('border-bottom', '1px solid var(--background)')
                    .style('border-left', d => {
                        if (!graphFilter.age.includes(d.id-1) || d.id === 0) return '1px solid var(--background)'
                        else if (scaleHeight(d.sum) >= scaleHeight(ageData.filter(a => a.id === (d.id-1))[0].sum)) return '1px solid var(--background)'
                        else return 'none'
                    })
                    .style('border-right', d => {
                        if (!graphFilter.age.includes(d.id+1) || d.id === 9) return '1px solid var(--background)'
                        else if (scaleHeight(d.sum) > scaleHeight(ageData.filter(a => a.id === (d.id+1))[0].sum)) return '1px solid var(--background)'
                        else return 'none'
                    })
            },update => {
                update.select('.age-p').style('color', d => graphFilter.age.includes(d.id) ? color.text : color.textlight).html(d => d.sum === 0 ? '' : d.sum)
                update.select('.age-rect')
                    .on('mouseover', (e,d) => filterHover(d.id, 'enter'))
                    .on('mouseout', (e,d) => filterHover(d.id, 'leave'))
                    .on('click', (e,d) => filterSelect(d.id, 'age'))
                    .transition()    
                    .style('height', d => d.sum === 0 ? '0px' : scaleHeight(d.sum) + 'px')
                    .style('background-color', d => graphFilter.age.includes(d.id) ? color.text : color.grey)
                    .style('border-left', d => {
                        if (!graphFilter.age.includes(d.id-1) || d.id === 0) return '1px solid var(--background)'
                        else if (scaleHeight(d.sum) >= scaleHeight(ageData.filter(a => a.id === (d.id-1))[0].sum)) return '1px solid var(--background)'
                        else return 'none'
                    })
                    .style('border-right', d => {
                        if (!graphFilter.age.includes(d.id+1) || d.id === 9) return '1px solid var(--background)'
                        else if (scaleHeight(d.sum) > scaleHeight(ageData.filter(a => a.id === (d.id+1))[0].sum)) return '1px solid var(--background)'
                        else return 'none'
                    })
            })    
        }
    },[genderData,ageData])

    useEffect(() => {
        const updateGraph = () => {
            if (graphContainerRef.current && extent) {
                const containerWidth = graphContainerRef.current.offsetWidth * 0.9 
                if (containerWidth < window.innerWidth*0.5) d3.select('#graph-filters').style('display','none')
                else d3.select('#graph-filters').style('display','flex')
                const containerHeight = graphContainerRef.current.offsetHeight * 0.9 
                graphContainerRef.current.style.height = `${containerHeight}px`
                const width = containerWidth + (margin * 2)
                const height = containerHeight + (margin * 2)
                const ticks1 = ((extent[1]-extent[0])/(Math.round((extent[1]-extent[0])/10)))*Math.round((extent[1]-extent[0])/10)
                const rollup = stackData
                const groups = d3.group(selectedConcepts, d => d.name)
                const ticks2 = width < 400 ? Math.round(width/60) : ticks1 < 10 || !ticks1 ? Math.round(extent[1]-extent[0]) : 10
                const ticks = {one:ticks1,two:ticks2}
                let maxHeightSubheader = document.getElementById('graph-section').clientHeight*0.09
                document.getElementById("graph-labels").style.maxHeight = `${maxHeightSubheader}px`
                d3.select("#graph")
                    .attr("width", '94%')
                    .attr("height", '94%')
                    .attr("viewBox", `${-margin} ${0} ${width} ${height}`)
                    .attr("preserveAspectRatio", "xMidYMid meet")
                    .append("g")
                    .attr("transform", `translate(${margin}, ${margin})`)
                d3.select("#clip rect")
                    .attr("width", width)
                    .attr("height", height)
                if (rootLine) getGraph(groups, rollup, width, height, ticks)  
            }
        }  
        const resizeObserver = new ResizeObserver(() => {
            requestAnimationFrame(updateGraph)
        })
        if (graphContainerRef.current) {
            resizeObserver.observe(graphContainerRef.current)
        }   
        updateGraph() 
        return () => {
            if (graphContainerRef.current) {
                resizeObserver.unobserve(graphContainerRef.current)
            }
        }
    }, [stackData, rootLine, extent, openFilters])

    return (
        <div id = "graph-section">
            <div id = "data-tooltip">
                <div style = {{fontSize:'10px',paddingBottom:1}} id = "data-year"></div>
                <div style = {{fontSize:'10px'}}>
                    <span style = {{fontWeight:'bold',fontSize:'12px'}} id = "data-value"></span> 
                    <span id = "counts"></span>
                </div>
            </div>
            <div style = {{width:'100%',height:'100%',display:'flex',flexDirection:'column'}}>
                <div id = "graph-selections">
                    <div style = {{display:'flex',alignItems:'center'}}>
                        <div style = {{paddingRight:5}}><h2 style = {{marginBottom:3}}>Record Counts</h2></div>
                        <p style = {{display: extent ? 'block' : 'none',fontSize:12,marginBottom:3}}>{extent ? extent[0] + "-" + extent[1] : null}</p>    
                    </div>
                    <div id = "graph-filters" style = {{display:'flex',marginBottom:3,alignItems:'flex-end'}}>
                        <div className = "graph-selection" id = "gender-container" style = {{marginRight:15}}>
                            <p style = {{margin:0,paddingBottom:3,paddingRight:0}}>Sex</p>
                            <div className = "filter-container">
                                <div className = "filter-viz" style = {{marginBottom:5}} id = "gender-viz">
                                    <svg style = {{zIndex:0}} id = "gender-svg"></svg>
                                </div>
                                <div className = "toggle-container" style = {{zIndex:500,width: 110}}>
                                    <div className = "toggle" id = "btn-8507" onMouseOver = {() => filterHover(8507,'enter')} onMouseOut = {() => filterHover(8507,'leave')} onClick = {() => filterSelect(8507,'gender')} style = {{fontSize:10,padding: 3, fontWeight: graphFilter.gender === 8507 ? 700 : 400, border: '1px solid var(--background)', borderRight: '1px solid var(--background)', color: graphFilter.gender === 8507 ? 'white' : color.textlight, backgroundColor: graphFilter.gender === 8507 ? color.text : color.grey, borderTopLeftRadius:20,borderBottomLeftRadius:20}}>Male</div>
                                    <div className = "toggle" id = "btn-8532" onMouseOver = {() => filterHover(8532,'enter')} onMouseOut = {() => filterHover(8532,'leave')} onClick = {() => filterSelect(8532,'gender')} style = {{fontSize:10,padding: 3, fontWeight: graphFilter.gender === 8532 ? 700 : 400, border: '1px solid var(--background)', borderLeft: 'none', color: graphFilter.gender === 8532 ? 'white' : color.textlight, backgroundColor: graphFilter.gender === 8532 ? color.text : color.grey, borderTopRightRadius:20,borderBottomRightRadius:20}}>Female</div>
                                </div>
                            </div>
                            <FontAwesomeIcon style = {{display: graphFilter.gender !== -1 ? 'block' : 'none'}} className = "reset-dropdown fa-2xs" id = "reset-gender" icon={faX} 
                                onClick = {() => {
                                    setGraphFilter({gender:-1,age:graphFilter.age})
                                }}
                            />
                        </div>
                        <div className = "graph-selection" id = "age-container" style = {{marginRight:10}}>
                            <p style = {{margin:0,paddingBottom:3,paddingRight:5}}>Age</p>
                            <div className = "filter-container" id = "age-filter" onMouseDown = {(e) => ageBrush(e,'down')} onMouseUp = {(e) => ageBrush(e,'up')} onMouseMove = {(e) => ageBrush(e,'move')} style = {{cursor:'pointer'}}>
                                <div className = "filter-viz" style = {{marginBottom:5}} id = "age-viz"></div>
                                <div className = "toggle-container" style = {{width: 360}}>
                                    <div onMouseOver = {() => filterHover(0,'enter')} onMouseLeave = {() => filterHover(0,'leave')} onClick = {() => filterSelect(0,'age')} className = "toggle" id = "btn-0" style = {{fontWeight: graphFilter.age.includes(0) ? 700 : 400,color:graphFilter.age.includes(0) ? 'white' : color.textlight,backgroundColor:graphFilter.age.includes(0) ? color.text : color.grey,borderTop:'1px solid var(--background)',borderBottom:'1px solid var(--background)',borderLeft:'1px solid var(--background)',borderRight:'1px solid var(--background)',borderTopLeftRadius:20,borderBottomLeftRadius:20}}>0-9</div>
                                    <div onMouseOver = {() => filterHover(1,'enter')} onMouseLeave = {() => filterHover(1,'leave')} onClick = {() => filterSelect(1,'age')} className = "toggle" id = "btn-1" style = {{fontWeight: graphFilter.age.includes(1) ? 700 : 400,color:graphFilter.age.includes(1) ? 'white' : color.textlight,borderLeft:graphFilter.age.includes(1) && !graphFilter.age.includes(0) ? '1px solid var(--background)' : 'none',backgroundColor:graphFilter.age.includes(1) ? color.text : color.grey,borderTop:'1px solid var(--background)',borderBottom:'1px solid var(--background)',borderRight:'1px solid var(--background)'}}>10-19</div>
                                    <div onMouseOver = {() => filterHover(2,'enter')} onMouseLeave = {() => filterHover(2,'leave')} onClick = {() => filterSelect(2,'age')} className = "toggle" id = "btn-2" style = {{fontWeight: graphFilter.age.includes(2) ? 700 : 400,color:graphFilter.age.includes(2) ? 'white' : color.textlight,borderLeft:graphFilter.age.includes(2) && !graphFilter.age.includes(1) ? '1px solid var(--background)' : 'none',backgroundColor:graphFilter.age.includes(2) ? color.text : color.grey,borderTop:'1px solid var(--background)',borderBottom:'1px solid var(--background)',borderRight:'1px solid var(--background)'}}>20-29</div>
                                    <div onMouseOver = {() => filterHover(3,'enter')} onMouseLeave = {() => filterHover(3,'leave')} onClick = {() => filterSelect(3,'age')} className = "toggle" id = "btn-3" style = {{fontWeight: graphFilter.age.includes(3) ? 700 : 400,color:graphFilter.age.includes(3) ? 'white' : color.textlight,borderLeft:graphFilter.age.includes(3) && !graphFilter.age.includes(2) ? '1px solid var(--background)' : 'none',backgroundColor:graphFilter.age.includes(3) ? color.text : color.grey,borderTop:'1px solid var(--background)',borderBottom:'1px solid var(--background)',borderRight:'1px solid var(--background)'}}>30-39</div>
                                    <div onMouseOver = {() => filterHover(4,'enter')} onMouseLeave = {() => filterHover(4,'leave')} onClick = {() => filterSelect(4,'age')} className = "toggle" id = "btn-4" style = {{fontWeight: graphFilter.age.includes(4) ? 700 : 400,color:graphFilter.age.includes(4) ? 'white' : color.textlight,borderLeft:graphFilter.age.includes(4) && !graphFilter.age.includes(3) ? '1px solid var(--background)' : 'none',backgroundColor:graphFilter.age.includes(4) ? color.text : color.grey,borderTop:'1px solid var(--background)',borderBottom:'1px solid var(--background)',borderRight:'1px solid var(--background)'}}>40-49</div>
                                    <div onMouseOver = {() => filterHover(5,'enter')} onMouseLeave = {() => filterHover(5,'leave')} onClick = {() => filterSelect(5,'age')} className = "toggle" id = "btn-5" style = {{fontWeight: graphFilter.age.includes(5) ? 700 : 400,color:graphFilter.age.includes(5) ? 'white' : color.textlight,borderLeft:graphFilter.age.includes(5) && !graphFilter.age.includes(4) ? '1px solid var(--background)' : 'none',backgroundColor:graphFilter.age.includes(5) ? color.text : color.grey,borderTop:'1px solid var(--background)',borderBottom:'1px solid var(--background)',borderRight:'1px solid var(--background)'}}>50-59</div>
                                    <div onMouseOver = {() => filterHover(6,'enter')} onMouseLeave = {() => filterHover(6,'leave')} onClick = {() => filterSelect(6,'age')} className = "toggle" id = "btn-6" style = {{fontWeight: graphFilter.age.includes(6) ? 700 : 400,color:graphFilter.age.includes(6) ? 'white' : color.textlight,borderLeft:graphFilter.age.includes(6) && !graphFilter.age.includes(5) ? '1px solid var(--background)' : 'none',backgroundColor:graphFilter.age.includes(6) ? color.text : color.grey,borderTop:'1px solid var(--background)',borderBottom:'1px solid var(--background)',borderRight:'1px solid var(--background)'}}>60-69</div>
                                    <div onMouseOver = {() => filterHover(7,'enter')} onMouseLeave = {() => filterHover(7,'leave')} onClick = {() => filterSelect(7,'age')} className = "toggle" id = "btn-7" style = {{fontWeight: graphFilter.age.includes(7) ? 700 : 400,color:graphFilter.age.includes(7) ? 'white' : color.textlight,borderLeft:graphFilter.age.includes(7) && !graphFilter.age.includes(6) ? '1px solid var(--background)' : 'none',backgroundColor:graphFilter.age.includes(7) ? color.text : color.grey,borderTop:'1px solid var(--background)',borderBottom:'1px solid var(--background)',borderRight:'1px solid var(--background)'}}>70-79</div>
                                    <div onMouseOver = {() => filterHover(8,'enter')} onMouseLeave = {() => filterHover(8,'leave')} onClick = {() => filterSelect(8,'age')} className = "toggle" id = "btn-8" style = {{fontWeight: graphFilter.age.includes(8) ? 700 : 400,color:graphFilter.age.includes(8) ? 'white' : color.textlight,borderLeft:graphFilter.age.includes(8) && !graphFilter.age.includes(7) ? '1px solid var(--background)' : 'none',backgroundColor:graphFilter.age.includes(8) ? color.text : color.grey,borderTop:'1px solid var(--background)',borderBottom:'1px solid var(--background)',borderRight:'1px solid var(--background)'}}>80-89</div>
                                    <div onMouseOver = {() => filterHover(9,'enter')} onMouseLeave = {() => filterHover(9,'leave')} onClick = {() => filterSelect(9,'age')} className = "toggle" id = "btn-9" style = {{fontWeight: graphFilter.age.includes(9) ? 700 : 400,color:graphFilter.age.includes(9) ? 'white' : color.textlight,borderLeft:graphFilter.age.includes(9) && !graphFilter.age.includes(8) ? '1px solid var(--background)' : 'none',backgroundColor:graphFilter.age.includes(9) ? color.text : color.grey,borderTop:'1px solid var(--background)',borderBottom:'1px solid var(--background)',borderRight:'1px solid var(--background)',borderTopRightRadius:20,borderBottomRightRadius:20}}>90-99</div>
                                </div>
                            </div>
                            <FontAwesomeIcon style = {{left:6,display: graphFilter.age.length > 1 ? 'block' : 'none'}} className = "reset-dropdown fa-2xs" id = "reset-age" icon={faX} 
                                onClick = {() => {
                                    setGraphFilter({gender:graphFilter.gender,age:[-1]})
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
                    <div ref={graphContainerRef} id = "graph-container" style = {{position: 'relative'}}>
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