    import React, { useEffect, useState } from 'react';
    import '@fortawesome/fontawesome-free/css/all.min.css';
    import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
    import { faCaretLeft } from '@fortawesome/free-solid-svg-icons'
    import { faCaretRight } from '@fortawesome/free-solid-svg-icons'
    import { faExpand } from '@fortawesome/free-solid-svg-icons'
    import { faCompress } from '@fortawesome/free-solid-svg-icons'
    import { faPlus } from '@fortawesome/free-solid-svg-icons'
    import { faCheck } from '@fortawesome/free-solid-svg-icons'
    import { faCaretDown } from '@fortawesome/free-solid-svg-icons'
    import { faCaretUp } from '@fortawesome/free-solid-svg-icons'
    import { faX } from '@fortawesome/free-solid-svg-icons'
    import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
    import * as d3 from "d3";
    import textures from 'textures';

    function SideBar (props) {
        const color = props.color
        const selectedConcepts = props.selectedConcepts
        const setSelectedConcepts = props.setSelectedConcepts
        const sidebarRoot = props.sidebarRoot
        const setSidebarRoot = props.setSidebarRoot  
        const mapRoot = props.mapRoot
        const setMapRoot = props.setMapRoot
        const getCounts = props.getCounts
        const tooltipHover = props.tooltipHover
        const conceptHover = props.conceptHover
        const addConcepts = props.addConcepts
        const conceptNames = props.conceptNames
        const view = props.view
        const setView = props.setView
        const getData = props.getData
        // const getValidity = props.getValidity
        const nodes = props.nodes
        const links = props.links
        const list = props.list
        const treeSelections = props.treeSelections
        const setTreeSelections = props.setTreeSelections
        const levelFilter = props.levelFilter
        const setLevelFilter = props.setLevelFilter
        const maxLevel = props.maxLevel
        const fullTreeMax = props.fullTreeMax
        const allClasses = props.allClasses
        const classFilter = props.classFilter
        const setClassFilter = props.setClassFilter
        const filteredConnections = props.filteredConnections
        const pruned = props.pruned
        const [graphSectionWidth, setGraphSectionWidth] = useState()
        const [zoomCompleted, setZoomCompleted] = useState(false)
        const margin = 10

        // TREE AND LIST FUNCTIONS        
        function getPosition(node, axis, cx, cy, name, nodes) {
            let center = 0
            axis === 'x' ? center = cx : center = cy
            if (name === sidebarRoot.name || name === undefined) {
                return center
            } else {
                let generation = []
                axis === 'x' ? generation = nodes.filter(n => n.distance === node.distance) : generation = nodes.filter(n => n.name === node.name)[0].mappings.sort((a,b) => b.total_counts - a.total_counts)
                let index = generation.map(node => node.name).indexOf(name) 
                let gap = 0
                if (axis === 'x') {
                    let includesMappings = generation.map(node => node.mappings).flat().length > 0
                    let widen = treeSelections.includes('mappings') && includesMappings ? 150*generation.length : 0
                    gap = (d3.select("#tree").node().getBoundingClientRect().width + widen)/(generation.length) 
                    if (widen !== 0 && gap < 250) gap = 250
                    if (widen === 0 && gap < 80) gap = 80
                }
                else if (axis === 'y') {
                    if (!treeSelections.includes('mappings') && mapRoot !== node.name) gap = 20
                    else gap = 80
                } else {
                    gap = (d3.select("#tree").node().getBoundingClientRect().height/generation.length)/15 + 5
                }
                let adjustment = generation.length % 2 !== 0 ? 0 : gap/2
                let median = Math.floor(generation.length/2) 
                let position = 0
                // if (axis === 'x' && node.parents.length === 1 && nodes.filter(d => d.name === node.parents[0])[0].children.length === 1 && node.levels !== '-1' && node.levels !== '0' && node.levels.split('-')[0] !== '1') {
                //     let parent = nodes.filter(d => d.name === node.parents[0])[0]
                //     position = getPosition(parent, 'x', cx, cy, parent.name, nodes)  
                // }
                if (index >= median) position = center + ((index - median) * gap) + adjustment
                else position = center - ((median - index) * gap) + adjustment
                return position
            }  
        }   
        function hoverNode(d, mode) {
            if (mode === "enter") {
                if (!conceptNames.includes(d.name)) {
                    if (!nodes.map(e => e.name).includes(d.name)) {
                        d3.select('#map-tree-circle-' + d.name).attr('stroke',d.color).attr('fill',d.color)
                        d3.select('#map-tree-text-'+d.name).attr('fill','black')
                        d3.select('#map-vocabulary-'+d.name).attr('fill',color.textlight)
                        d3.select('#map-alt-text-'+d.name).attr('fill',color.text)
                    }
                    else {
                        d3.select('#tree-circle-' + d.name).attr('stroke',d.color).attr('fill',d.color)
                        d3.select('#tree-text-'+d.name).attr('fill','black')
                        d3.select('#node-vocabulary-'+d.name).attr('fill',color.textlight)
                        d3.select('#alt-text-'+d.name).attr('fill',color.text)
                    }
                }
                if (!nodes.map(e => e.name).includes(d.name)) {
                    d3.select("#map-total-counts-" + d.name).transition('circleText').attr('visibility', 'hidden')
                    d3.select("#map-button-symbol-" + d.name).transition('circleText').attr('visibility', 'visibile')
                } else {
                    d3.select("#total-counts-" + d.name).transition('circleText').attr('visibility', 'hidden')
                    d3.select("#button-symbol-" + d.name).transition('circleText').attr('visibility', 'visibile')    
                }
            } else {
                if (!conceptNames.includes(d.name)) {
                    if (!nodes.map(e => e.name).includes(d.name)) {
                        d3.select('#map-tree-circle-' + d.name).attr('stroke',color.textlightest).attr('fill','white')
                        d3.select('#map-tree-text-'+d.name).attr('fill',color.textlight)
                        d3.select('#map-vocabulary-'+d.name).attr('fill',color.textlightest)
                        d3.select('#map-alt-text-'+d.name).attr('fill',color.textlight)
                    }
                    else {
                        d3.select('#tree-circle-' + d.name).attr('stroke',color.textlightest).attr('fill','white')
                        d3.select('#tree-text-'+d.name).attr('fill',color.textlight)
                        d3.select('#node-vocabulary-'+d.name).attr('fill',color.textlightest)
                        d3.select('#alt-text-'+d.name).attr('fill',color.textlight)
                    }
                }
                if (!nodes.map(e => e.name).includes(d.name)) {
                    d3.select("#map-total-counts-" + d.name).transition('circleText').attr('visibility', 'visible')
                    d3.select("#map-button-symbol-" + d.name).transition('circleText').attr('visibility', 'hidden') 
                } else {
                    d3.select("#total-counts-" + d.name).transition('circleText').attr('visibility', 'visible')
                    d3.select("#button-symbol-" + d.name).transition('circleText').attr('visibility', 'hidden')    
                }
            }    
        }
        function zoomed(e) {
            const {x,y,k} = e.transform
            d3.select("#tree-graphics").attr("transform", "translate(" + x + "," + y + ")" + " scale(" + k + ")");
        }
        function zoomToFit(padding = 10) {
            const svgNode = d3.select('#tree').node()
            const gNode = d3.select('#tree-graphics').node()
            const svgWidth = svgNode.getBoundingClientRect().width + padding*2
            const svgHeight = svgNode.getBoundingClientRect().height + padding*2
            const bbox = gNode.getBBox()
            const width = bbox.width
            const height = !pruned ? bbox.height : bbox.height + 40
            const x = bbox.x
            const y = bbox.y
            if (width === 0 || height === 0) return
            const scale = Math.min(
                (svgWidth - padding) / width,
                (svgHeight - padding) / height
            )
            const translateX = (svgWidth - width * scale) / 2 - x * scale 
            const translateY = (svgHeight - height * scale) / 2 - y * scale + padding 
            d3.select('#tree-graphics').transition().attr("transform", `translate(${translateX},${translateY}) scale(${scale})`)
        }
        // DRAWING
        // tree
        function drawTree() {
            console.log('nodes',nodes,'links',links)
            // get extent of total counts
            let sums = []
            nodes.forEach(node => {
                sums.push(Math.sqrt(node.total_counts))
                node.mappings.forEach(map => sums.push(Math.sqrt(map.total_counts)))
            })
            const extent = d3.extent(sums)
            const scaleRadius = d3.scaleLinear().domain([0, extent[1]]).range(extent[1] === 0 ? [4,4] : [8, 24])
            // get dimensions
            let width = d3.select("#tree").node().getBoundingClientRect().width + margin*2
            let maxLevel = d3.max(nodes.map(d => d.distance))
            let svgHeight = d3.select("#tree").node().getBoundingClientRect().height
            let maxMappings = Math.max(...nodes.map(d => d.mappings).map(mappings => mappings.length))
            let num = (svgHeight/(maxLevel+1) - 12) < 150 ? 150 : (svgHeight/(maxLevel+1) - 12)
            let length = maxLevel + 1
            let genHeight = Array.from({length}, (_, i) => i * num)
            if (treeSelections.includes('mappings')) {
                genHeight = genHeight.map((h,i) => {
                    if (i === 0) return 0
                    else {
                        // let max = Math.max(...nodes.filter(d => d.distance === i).map(d => d.mappings).map(mappings => mappings.length))
                        if ((maxMappings*80)/1.7 > num) return (maxMappings*80)/1.7
                        else return num
                    }
                })
                // console.log('1',genHeight)
                let sum = 0
                genHeight = genHeight.map((h,i) => sum += h)
                // console.log('2',genHeight)
            }
            let cx = width/2 + margin
            let cy = 50
            const arrowSize = 14
            const curveY = d3.link(d3.curveBumpY)
            const curveX = d3.link(d3.curveBumpX)
            const svg = d3.select('#tree')
            let defs = svg.append("defs")
            let linearGradient = defs.append("linearGradient")
                .attr("id", "myGradient") 
                .attr("gradientUnits", "objectBoundingBox")
                .attr("x1", "0%")
                .attr("y1", "0%")
                .attr("x2", "0%")
                .attr("y2", "100%")
            linearGradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", color.darkbackground)
                .attr("stop-opacity", 1)
            linearGradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", color.darkbackground)
                .attr("stop-opacity", 0.2)
            // get midpoint between nodes
            function getMidXAndMaxY(ids) {
                const boxes = ids
                    .map(id => document.getElementById('alt-group-'+id))
                    .filter(el => el)
                    .map(el => el.getBoundingClientRect())
                if (boxes.length === 0) return null
                const minX = Math.min(...boxes.map(b => b.left))
                const maxX = Math.max(...boxes.map(b => b.right))
                const midX = (minX + maxX) / 2
                const maxY = Math.max(...boxes.map(b => b.bottom))
                return { midX, maxY }
            }
            // get subsumes label positioning
            const getLabel = d => {
                let labelPosition = {x: 0, y: 0}
                    labelPosition.x = d.data.concept.standard_concept ? getPosition(d, 'x', cx, cy, d.name, nodes) : getPosition(d, 'x', cx, cy, d.name, nodes) ;
                    labelPosition.y = d.total_counts > 0 ? cy + (genHeight[d.distance]) - scaleRadius(Math.sqrt(d.total_counts)) - 7 : cy + (genHeight[d.distance]) - scaleRadius(Math.sqrt(d.total_counts)) - 9; 
                return labelPosition 
            }
            // get map node positioning 
            const getMap = d => {
                let mapPosition = {x: 0, y: 0}
                if (treeSelections.includes('mappings') || mapRoot === d.source.name) {
                    mapPosition.x = getPosition(d.source, 'x', cx, cy, d.source.name, nodes) + d.direction*125
                } else {
                    mapPosition.x = getPosition(d.source, 'x', cx, cy, d.source.name, nodes) + d.direction*(scaleRadius(Math.sqrt(d.source.total_counts)) + 20)
                }
                mapPosition.y = d.total_counts > 0 ? getPosition(d.source, 'y', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes) - scaleRadius(Math.sqrt(d.total_counts)) - 7 : getPosition(d.source, 'y', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes) - scaleRadius(Math.sqrt(d.total_counts)) - 9
                return mapPosition
            }
            function getX(d) {return getMap(d).x}
            function getY(d) {return getPosition(d.source, 'y', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes) + scaleRadius(Math.sqrt(d.total_counts)) + 11}
            // DRAW LINKS
            function updateLinks() {
                d3.select('#links').selectAll('.tree-link').data(links, d => d.source.name+d.target.name)
                    .join(enter => {
                        const geometry = enter.append('g')  
                            .classed('tree-link', true) 
                        const line = geometry.append('g')
                            .classed('tree-line', true)
                            .attr('id', d => 'tree-line-' + d.source.name+d.target.name)
                            .attr('fill', 'none')
                            .attr('stroke', d => conceptNames.includes(d.source.name) && conceptNames.includes(d.target.name) ? 'black' : color.darkbackground)
                            .attr('stroke-width', 1)
                            line.append('path')
                                .classed('line-path',true)
                                .attr("d", d => {
                                    let sourceX = getPosition(d.source, 'x', cx, cy, d.source.name, nodes)
                                    let sourceY = cy + (genHeight[d.source.distance]) + scaleRadius(Math.sqrt(d.source.total_counts)) + 13
                                    let targetX = getPosition(d.target, 'x', cx, cy, d.target.name, nodes)
                                    let targetY = cy + (genHeight[d.target.distance]) - scaleRadius(Math.sqrt(d.target.total_counts)) - 33
                                    return curveY({source: [sourceX, sourceY], target: [targetX, targetY]})
                                })
                            line.append('path')
                                .classed('tree-arrow', true)
                                .attr('fill', d => conceptNames.includes(d.source.name) && conceptNames.includes(d.target.name) ? 'black' : color.darkbackground)
                                .attr("d", d3.symbol().type(d3.symbolTriangle).size(arrowSize))
                                .attr("transform", d => {
                                    let x = getPosition(d.target, 'x', cx, cy, d.target.name, nodes)
                                    let y = d.target.total_counts !== 0 ? cy + (genHeight[d.target.distance]) - scaleRadius(Math.sqrt(d.target.total_counts)) - 33 : cy + (genHeight[d.target.distance]) - scaleRadius(Math.sqrt(d.target.total_counts)) - 35
                                    return "translate(" + x + "," + y + ")rotate(" + 180 + ")"
                                }) 
                        return geometry 
                    }, update => {
                            update.select('.tree-line')
                                .attr('stroke', d => conceptNames.includes(d.source.name) && conceptNames.includes(d.target.name) ? 'black' : color.darkbackground)
                            update.select('.line-path')
                                .attr("d", d => {
                                    let sourceX = getPosition(d.source, 'x', cx, cy, d.source.name, nodes)
                                    let sourceY = cy + (genHeight[d.source.distance]) + scaleRadius(Math.sqrt(d.source.total_counts)) + 13
                                    let targetX = getPosition(d.target, 'x', cx, cy, d.target.name, nodes)
                                    let targetY = cy + (genHeight[d.target.distance]) - scaleRadius(Math.sqrt(d.target.total_counts)) - 33
                                    return curveY({source: [sourceX, sourceY], target: [targetX, targetY]})
                                })
                            update.select('.tree-arrow')
                                .transition()
                                .duration(500)
                                .attr('fill', d => conceptNames.includes(d.source.name) && conceptNames.includes(d.target.name) ? 'black' : color.darkbackground)
                                .attr("d", d3.symbol().type(d3.symbolTriangle).size(arrowSize))
                                .attr("transform", d => {
                                    let x = getPosition(d.target, 'x', cx, cy, d.target.name, nodes)
                                    let y = d.target.total_counts !== 0 ? cy + (genHeight[d.target.distance]) - scaleRadius(Math.sqrt(d.target.total_counts)) - 33 : cy + (genHeight[d.target.distance]) - scaleRadius(Math.sqrt(d.target.total_counts)) - 35
                                    return "translate(" + x + "," + y + ")rotate(" + 180 + ")"
                                })    
                    },exit => exit.remove())
            }
            // DRAW NODES
            function updateNodes() {
                console.log('connections',filteredConnections)
                d3.select('#nodes').selectAll('.tree-node').data(nodes, d => d.name)
                    .join(enter => {
                        const geometry = enter.append('g')
                            .classed('tree-node', true)
                            .attr('id', d => 'tree-node-'+d.name)
                        geometry.selectAll(".map-node").data(d => d.mappings, d => d.name+d.source.name)
                        //Mappings
                        .join(enter => {
                            const mapNode = enter.append('g')
                                .classed('map-node', true)
                                .attr('id', d => 'map-node-'+d.name)
                            const mapLine = mapNode.append('g')
                                .classed('map-link',true)
                                .attr('fill','none')
                                .attr('stroke-width', 0.5)
                                .attr('stroke', d => conceptNames.includes(d.name) ? 'black' : treeSelections.includes('mappings') || mapRoot === d.source.name ? color.textlight : color.textlightest)
                            mapLine.append('path')
                                .classed('map-line', true)
                                .style('stroke-dasharray', '5px 2px')
                                .attr("d", d => {
                                    let sourceX = getMap(d).x
                                    let sourceY = treeSelections.includes('mappings') || mapRoot === d.source.name ? getPosition(d.source, 'y', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes) : getPosition(d.source, 'z', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes)
                                    let targetX = getPosition(d.source, 'x', cx, cy, d.source.name, nodes) 
                                    let targetY = cy + (genHeight[d.distance])
                                    return curveX({source: [sourceX, sourceY], target: [targetX, targetY]})}
                                )
                            mapLine.append('path')
                                .classed('map-tree-arrow', true)
                                .attr('id', d => 'map-arrow-'+d.name)
                                .style('display', d => treeSelections.includes('mappings') || mapRoot === d.source.name ? 'block' : 'none')
                                .attr('fill', d => conceptNames.includes(d.name) ? 'black' : color.textlight)
                                .attr("d", d3.symbol().type(d3.symbolTriangle).size(arrowSize))
                                .attr("transform", d => {
                                    let x = d.direction === -1 ? getPosition(d.source, 'x', cx, cy, d.source.name, nodes) - scaleRadius(Math.sqrt(d.source.total_counts)) - 6 : getMap(d).x - scaleRadius(Math.sqrt(d.total_counts)) - 6
                                    let y = d.direction === -1 ? cy + (genHeight[d.distance]) : getPosition(d.source, 'y', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes)
                                    return "translate(" + x + "," + y + ")rotate(" + 90 + ")"
                                }) 
                            mapNode.append('circle')
                                .classed('map-tree-circle-background',true)
                                .style('fill', 'white')
                                .attr('stroke', 'white')
                                .style('pointer-events', "none")
                                .attr('r', d => treeSelections.includes('mappings') || mapRoot === d.source.name ? scaleRadius(Math.sqrt(d.total_counts)) + 2 : 10)
                                .attr('cx', d => getMap(d).x)
                                .attr('cy', d => treeSelections.includes('mappings') || mapRoot === d.source.name ? getPosition(d.source, 'y', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes) : getPosition(d.source, 'z', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes))
                            mapNode.append('circle')
                                .classed('map-tree-circle', true)
                                .attr('id', d => 'map-tree-circle-' + d.name)
                                .attr('r', d => treeSelections.includes('mappings') || mapRoot === d.source.name ? scaleRadius(Math.sqrt(d.total_counts)) + 2 : 10)
                                .style('fill', d => {
                                    if (conceptNames.includes(d.name)) {
                                        if (d.direction === 1) return d.color
                                        else {
                                            let t = textures.lines()
                                            .size(3)
                                            .strokeWidth(1.5)
                                            .stroke(d.color)  
                                            d3.select('#tree').call(t)
                                            return t.url()  
                                        }
                                    } else return 'white'
                                })
                                .attr('stroke', d => conceptNames.includes(d.name) ? d.color : treeSelections.includes('mappings') || mapRoot === d.source.name ? d.total_counts === 0 ? 'none' : color.textlightest : color.background)
                                .style('cursor', "pointer")
                                .attr('cx', d => getMap(d).x)
                                .attr('cy', d => treeSelections.includes('mappings') || mapRoot === d.source.name ? getPosition(d.source, 'y', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes) : getPosition(d.source, 'z', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes))
                                .style('pointer-events', d => d.total_counts === 0 || !treeSelections.includes('mappings') ? 'none' : 'all')
                                .on('mouseover', (e,d) => hoverNode(d, 'enter'))
                                .on('mouseout', (e,d) => hoverNode(d, 'leave'))
                                .on('click', (e,d) => {
                                    if (d.total_counts !== 0) {
                                        if (conceptNames.includes(d.name)) {
                                            let filteredConcepts = selectedConcepts.filter(e => e.name !== d.name)
                                            setSelectedConcepts(filteredConcepts)   
                                            conceptHover(d.name, "leave") 
                                        } else if (!conceptNames.includes(d.name)){
                                            addConcepts([d])
                                        }     
                                    }
                                })
                            mapNode.append('text')
                                .classed('map-total-counts', true)
                                .attr('id', d => 'map-total-counts-' + d.name)
                                .text(d => d.total_counts)
                                .attr('fill', d => d.total_counts === 0 ? color.text : conceptNames.includes(d.name) ? 'white' : color.text)
                                .style('opacity', d => treeSelections.includes('mappings') || mapRoot === d.source.name ? 1 : 0)
                                .style('font-size', '8px')
                                .style('font-weight', '700')
                                .style('pointer-events', 'none')
                                .attr('text-anchor', 'middle')
                                .attr('x', d => getMap(d).x)
                                .attr('y', d => treeSelections.includes('mappings') || mapRoot === d.source.name ? getPosition(d.source, 'y', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes) + 3 : getPosition(d.source, 'z', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes) + 3)
                            const buttonSymbol = mapNode.append('g')
                                .classed('map-button-symbol', true)
                                .attr('id', d => 'map-button-symbol-' + d.name)
                                .attr('visibility', 'hidden')
                                .attr('stroke', d => conceptNames.includes(d.name) ? 'white' : color.text)
                                .attr('stroke-width', 1.5)
                                .attr('stroke-linecap', 'round')
                                .style('pointer-events', 'none')
                                .style('transition', '0.5s opacity')
                            buttonSymbol.append('line')
                                .classed('map-button-line-1', true)
                                .attr('x1', d => getMap(d).x - 2.5)
                                .attr('y1', d => {
                                    if (conceptNames.includes(d.name)) {
                                        return getPosition(d.source, 'y', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes) - 2.5      
                                    } else {
                                        return getPosition(d.source, 'y', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes)     
                                    }
                                })
                                .attr('x2', d => getMap(d).x + 2.5)
                                .attr('y2', d => {
                                    if (conceptNames.includes(d.name)) {
                                        return getPosition(d.source, 'y', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes) + 2.5      
                                    } else {
                                        return getPosition(d.source, 'y', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes)     
                                    }
                                })
                            buttonSymbol.append('line')
                                .classed('map-button-line-2', true)
                                .attr('x1', d => conceptNames.includes(d.name) ? getMap(d).x + 2.5 : getMap(d).x)
                                .attr('y1', d => getPosition(d.source, 'y', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes) - 2.5)
                                .attr('x2', d => conceptNames.includes(d.name) ? getMap(d).x - 2.5 : getMap(d).x)
                                .attr('y2', d => getPosition(d.source, 'y', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes) + 2.5)
                            const altCounts = mapNode.append('g')
                                .classed('map-alt-counts',true)
                                .style('display', d => treeSelections.includes('mappings') || mapRoot === d.source.name ? 'block' : 'none')
                            altCounts.append('text')
                                .classed('map-alt-text', true)
                                .attr('id', d => 'map-alt-text-' + d.name)
                                .attr('text-anchor', 'middle')
                                .attr('x', d => getX(d))
                                .attr('y', d => getY(d))
                                .style('font-size', '8px')
                                .text(d => d.descendant_counts + ' DRC')
                                .attr('fill', d => conceptNames.includes(d.name) ? color.text : color.textlight)
                            const mapLabel = mapNode.append('g')
                                .classed('map-label', true)
                                .style('cursor', 'pointer')
                                .style('display', d => treeSelections.includes('mappings') || mapRoot === d.source.name ? 'block' : 'none')
                                .on('mouseover', (e,d) => {
                                    tooltipHover(d, 'enter', e, 'sidebar')
                                    conceptHover(d.name, "enter") 
                                    d3.select('#map-label-rect-'+d.name).attr('fill', color.lightpurple)
                                    d3.select('#map-tree-text-'+d.name).style('font-weight',700)
                                    d3.select('#map-vocabulary-' + d.name).attr('y', getMap(d).y + 3)
                                })
                                .on('mouseout', (e,d) => {
                                    tooltipHover(d, 'leave', e, 'sidebar')
                                    conceptHover(d.name, "leave") 
                                    d3.select('#map-label-rect-'+d.name).attr('fill', 'rgba(255, 255, 255, 0.7)')
                                    d3.select('#map-tree-text-'+d.name).style('font-weight',400)
                                    d3.select('#map-vocabulary-' + d.name).attr('y', getMap(d).y + 1)
                                })
                                .on('click', async (e,d) => {
                                    const data = await getData(d.name)
                                    setSidebarRoot({name:d.name,data:data})
                                    tooltipHover(d, 'leave', e, 'sidebar')
                                    conceptHover(d.name, "leave") 
                                })
                            mapLabel.append('text')
                                .classed('map-tree-text', true)
                                .attr('id', d => 'map-tree-text-' + d.name)
                                .attr('text-anchor', 'middle')
                                .text(d => {
                                    let concept_info = d.data.concept 
                                    let maxWidth = 20
                                    let text = concept_info.concept_name || concept_info.concept_id.toString()
                                    return text.substring(0, maxWidth) + (text.length > maxWidth ? ' ...' : '')
                                })
                                .style('font-size','10px')
                                .attr('fill', d => conceptNames.includes(d.name) ? 'black' : color.textlight)
                                .attr('x', d => getMap(d).x)
                                .attr('y', d => getMap(d).y - 10)
                            mapLabel.append('rect')
                                .classed('map-label-rect', true)
                                .attr('id', d => 'map-label-rect-' + d.name)
                                .attr('width', d => d3.select("#map-tree-text-" + d.name).node().getBBox().width + 14)
                                .attr('height', 17)
                                .attr('x', d => getMap(d).x - (d3.select("#map-tree-text-" + d.name).node().getBBox().width + 14)/2)
                                .attr('y', d => getMap(d).y - 22)
                                .attr('fill','rgba(255, 255, 255, 0.7)')
                                .attr("rx", 10)
                                .attr("ry", 10)
                                .lower()
                            mapNode.append('text')
                                .classed('map-vocabulary', true)
                                .attr('id', d => 'map-vocabulary-' + d.name)
                                .attr('text-anchor', 'middle')
                                .style('display', d => treeSelections.includes('mappings') || mapRoot === d.source.name ? 'block' : 'none')
                                .style('font-size', '8px')
                                .attr('fill', d => conceptNames.includes(d.name) ? color.textlight: color.textlightest)
                                .attr('x', d => getMap(d).x)
                                .attr('y', d => getMap(d).y + 1)
                                .text(d => d.data.concept.vocabulary_id)
                            mapNode.lower()
                            mapLabel.raise()
                        }, update => {
                            update.select('.map-link')
                                .attr('stroke', d => conceptNames.includes(d.name) ? 'black' : treeSelections.includes('mappings') || mapRoot === d.source.name ? color.textlight : color.textlightest)
                            update.select('.map-line')
                                .transition(2000)
                                .attr("d", d => {
                                    let sourceX = getMap(d).x
                                    let sourceY = treeSelections.includes('mappings') || mapRoot === d.source.name ? getPosition(d.source, 'y', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes) : getPosition(d.source, 'z', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes)
                                    let targetX = getPosition(d.source, 'x', cx, cy, d.source.name, nodes) 
                                    let targetY = cy + (genHeight[d.distance])
                                    return curveX({source: [sourceX, sourceY], target: [targetX, targetY]})}
                                )
                                // .on("end", () => {
                                //     console.log('map root',mapRoot)
                                //     zoomToFit()
                                // })
                            update.select('.map-tree-arrow')
                                .style('display', d => treeSelections.includes('mappings') || mapRoot === d.source.name ? 'block' : 'none')
                                .attr('fill', d => conceptNames.includes(d.name) && conceptNames.includes(d.source.name) ? 'black' : color.textlight)
                                .attr("d", d3.symbol().type(d3.symbolTriangle).size(arrowSize))
                                .attr("transform", d => {
                                    let x = d.direction === -1 ? getPosition(d.source, 'x', cx, cy, d.source.name, nodes) - scaleRadius(Math.sqrt(d.source.total_counts)) - 6 : getMap(d).x - scaleRadius(Math.sqrt(d.total_counts)) - 6
                                    let y = d.direction === -1 ? cy + (genHeight[d.distance]) : getPosition(d.source, 'y', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes)
                                    return "translate(" + x + "," + y + ")rotate(" + 90 + ")"
                                }) 
                            update.select('.map-tree-circle-background')
                                .attr('r', d => treeSelections.includes('mappings') || mapRoot === d.source.name ? scaleRadius(Math.sqrt(d.total_counts)) + 2 : 10)
                                .attr('cx', d => getMap(d).x)
                                .attr('cy', d => treeSelections.includes('mappings') || mapRoot === d.source.name ? getPosition(d.source, 'y', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes) : getPosition(d.source, 'z', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes))
                            update.select('.map-tree-circle')
                                .on('mouseover', (e,d) => hoverNode(d, 'enter'))
                                .on('mouseout', (e,d) => hoverNode(d, 'leave'))
                                .on('click', (e,d) => {
                                    if (d.total_counts !== 0) {
                                        if (conceptNames.includes(d.name)) {
                                            let filteredConcepts = selectedConcepts.filter(e => e.name !== d.name)
                                            setSelectedConcepts(filteredConcepts)   
                                            conceptHover(d.name, "leave") 
                                        } else if (!conceptNames.includes(d.name)){
                                            addConcepts([d])
                                        }     
                                    }
                                })
                                .attr('r', d => treeSelections.includes('mappings') || mapRoot === d.source.name ? scaleRadius(Math.sqrt(d.total_counts)) + 2 : 10)
                                .style('fill', d => {
                                    if (conceptNames.includes(d.name)) {
                                        if (d.direction === 1) return d.color
                                        else {
                                            let t = textures.lines()
                                            .size(3)
                                            .strokeWidth(1.5)
                                            .stroke(d.color)  
                                            d3.select('#tree').call(t)
                                            return t.url()  
                                        }
                                    } else return 'white'
                                })
                                .attr('stroke', d => conceptNames.includes(d.name) ? d.color : treeSelections.includes('mappings') || mapRoot === d.source.name ? d.total_counts === 0 ? 'none' : color.textlightest : color.background)
                                .transition(2000)
                                .attr('cx', d => getMap(d).x)
                                .attr('cy', d => treeSelections.includes('mappings') || mapRoot === d.source.name ? getPosition(d.source, 'y', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes) : getPosition(d.source, 'z', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes))
                                .style('pointer-events', d => d.total_counts === 0 || !treeSelections.includes('mappings') ? 'none' : 'all')
                            update.select('.map-total-counts')
                                .text(d => d.total_counts)
                                .style('opacity', d => treeSelections.includes('mappings') || mapRoot === d.source.name ? 1 : 0)
                                .attr('fill', d => d.total_counts === 0 ? color.text : conceptNames.includes(d.name) ? 'white' : color.text)
                                .attr('x', d => getMap(d).x)
                                .attr('y', d => treeSelections.includes('mappings') || mapRoot === d.source.name ? getPosition(d.source, 'y', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes) + 3 : getPosition(d.source, 'z', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes) + 3)
                            update.select('.map-button-symbol')
                                .attr('stroke', d => conceptNames.includes(d.name) ? 'white' : color.text)
                            update.select('.map-button-line-1')
                                .attr('x1', d => getMap(d).x - 2.5)
                                .attr('y1', d => {
                                    if (conceptNames.includes(d.name)) {
                                        return getPosition(d.source, 'y', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes) - 2.5      
                                    } else {
                                        return getPosition(d.source, 'y', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes)     
                                    }
                                })
                                .attr('x2', d => getMap(d).x + 2.5)
                                .attr('y2', d => {
                                    if (conceptNames.includes(d.name)) {
                                        return getPosition(d.source, 'y', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes) + 2.5      
                                    } else {
                                        return getPosition(d.source, 'y', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes)     
                                    }
                                })
                            update.select('.map-button-line-2')
                                .attr('x1', d => conceptNames.includes(d.name) ? getMap(d).x + 2.5 : getMap(d).x)
                                .attr('y1', d => getPosition(d.source, 'y', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes) - 2.5)
                                .attr('x2', d => conceptNames.includes(d.name) ? getMap(d).x - 2.5 : getMap(d).x)
                                .attr('y2', d => getPosition(d.source, 'y', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes) + 2.5)
                            update.select('.map-alt-counts')
                                .style('display', d => treeSelections.includes('mappings') || mapRoot === d.source.name ? 'block' : 'none')
                            update.select('.map-alt-text')
                                .attr('x', d => getX(d))
                                .attr('y', d => getY(d))
                                .text(d => d.descendant_counts + ' DRC')
                                .attr('fill', d => conceptNames.includes(d.name) ? color.text : color.textlight)
                            update.select('.map-label')
                                .style('display', d => treeSelections.includes('mappings') || mapRoot === d.source.name ? 'block' : 'none')
                                .on('mouseover', (e,d) => {
                                    tooltipHover(d, 'enter', e, 'sidebar')
                                    conceptHover(d.name, "enter") 
                                    d3.select('#map-label-rect-'+d.name).attr('fill', color.lightpurple)
                                    d3.select('#map-tree-text-'+d.name).style('font-weight',700)
                                    d3.select('#map-vocabulary-' + d.name).attr('y', getMap(d).y + 3)
                                })
                                .on('mouseout', (e,d) => {
                                    tooltipHover(d, 'leave', e, 'sidebar')
                                    conceptHover(d.name, "leave") 
                                    d3.select('#map-label-rect-'+d.name).attr('fill', 'rgba(255, 255, 255, 0.7)')
                                    d3.select('#map-tree-text-'+d.name).style('font-weight',400)
                                    d3.select('#map-vocabulary-' + d.name).attr('y', getMap(d).y + 1)
                                })
                                .on('click', async (e,d) => {
                                    const data = await getData(d.name)
                                    setSidebarRoot({name:d.name,data:data})
                                    tooltipHover(d, 'leave', e, 'sidebar')
                                    conceptHover(d.name, "leave") 
                                })
                            update.select('.map-tree-text')
                                .text(d => {
                                    let concept_info = d.data.concept 
                                    let maxWidth = 20
                                    let text = concept_info.concept_name || concept_info.concept_id.toString()
                                    return text.substring(0, maxWidth) + (text.length > maxWidth ? ' ...' : '')
                                })
                                .attr('fill', d => conceptNames.includes(d.name) ? 'black' : color.textlight)
                                .attr('x', d => getMap(d).x)
                                .attr('y', d => getMap(d).y - 10)
                            update.select('.map-label-rect')
                                .attr('width', d => d3.select("#map-tree-text-" + d.name).node().getBBox().width + 14)
                                .attr('x', d => getMap(d).x - (d3.select("#map-tree-text-" + d.name).node().getBBox().width + 14)/2)
                                .attr('y', d => getMap(d).y - 22)
                            update.select('.map-vocabulary')
                                .style('display', d => treeSelections.includes('mappings') || mapRoot === d.source.name ? 'block' : 'none')
                                .attr('fill', d => conceptNames.includes(d.name) ? color.textlight : color.textlightest)
                                .attr('x', d => getMap(d).x)
                                .attr('y', d => getMap(d).y + 1)
                                .text(d => d.data.concept.vocabulary_id)
                        },exit => exit.remove())
                        //Subsumes node
                        const node = geometry.append('g')
                            .classed('subsumes-node', true)
                        node.append('circle')
                            .classed('tree-circle-background', true)
                            .style('opacity', 1)
                            .attr('id', d => 'tree-circle-background-' + d.name)
                            .attr('r', d => scaleRadius(Math.sqrt(d.total_counts)) + 2)
                            .attr('fill', 'white')
                            .attr('stroke', 'white')
                            .attr('cx', d => getPosition(d, 'x', cx, cy, d.name, nodes))
                            .attr('cy', d => cy + (genHeight[d.distance]))
                        node.append('circle')
                            .on('mouseover', (e,d) => hoverNode(d, 'enter'))
                            .on('mouseout', (e,d) => hoverNode(d, 'leave'))
                            .on('click', (e,d) => {
                                if (d.total_counts !== 0) {
                                    if (conceptNames.includes(d.name)) {
                                        let filteredConcepts = selectedConcepts.filter(e => e.name !== d.name)
                                        console.log('filtered concepts', filteredConcepts)
                                        setSelectedConcepts(filteredConcepts)   
                                        conceptHover(d.name, "leave") 
                                    } else if (!conceptNames.includes(d.name)){
                                        addConcepts([d])
                                    }     
                                }
                            })
                            .classed('tree-circle', true)
                            .attr('id', d => 'tree-circle-' + d.name)
                            .attr('r', d => scaleRadius(Math.sqrt(d.total_counts)) + 2)
                            .attr('stroke', d => d.total_counts === 0 ? 'none' : !conceptNames.includes(d.name) ? color.textlightest : d.color)
                            .attr('fill', d => {
                                if (d.total_counts === 0) return 'white'
                                else {
                                    if (!d.data.concept.standard_concept && conceptNames.includes(d.name)) {
                                        let t = textures.lines()
                                            .size(3)
                                            .strokeWidth(1.5)
                                            .stroke(d.color)  
                                        d3.select('#tree').call(t)
                                        return t.url()  
                                    } 
                                    else if (d.data.concept.standard_concept && conceptNames.includes(d.name)) {
                                        return d.color
                                    } else {return 'white'}    
                                }
                            })
                            .style('cursor', "pointer")
                            .attr('cx', d => getPosition(d, 'x', cx, cy, d.name, nodes))
                            .attr('cy', d => cy + (genHeight[d.distance]))
                            .attr('pointer-events', d => d.total_counts === 0 ? "none" : "all")
                        node.append('text')
                            .classed('total-counts', true)
                            .attr('id', d => 'total-counts-' + d.name)
                            .text(d => d.total_counts)
                            .attr('fill', d => d.total_counts === 0 ? color.text : conceptNames.includes(d.name) ? 'white' : color.text)
                            .attr('visibility', "visible")
                            .style('font-size', d => d.total_counts === 0 ? '10px' : '8px')
                            .style('font-weight', '700')
                            .style('pointer-events', 'none')
                            .attr('text-anchor', 'middle')
                            .attr('x', d => getPosition(d, 'x', cx, cy, d.name, nodes))
                            .attr('y', d => cy + (genHeight[d.distance]) + 3)
                        const buttonSymbol = node.append('g')
                            .classed('button-symbol', true)
                            .attr('id', d => 'button-symbol-' + d.name)
                            .attr('visibility', 'hidden')
                            .attr('stroke', 'white')
                            .attr('stroke-width', 1.5)
                            .attr('stroke-linecap', 'round')
                            .style('pointer-events', 'none')
                            .style('transition', '0.5s opacity')
                        buttonSymbol.append('line')
                            .classed('button-line-1', true)
                            .attr('x1', d => getPosition(d, 'x', cx, cy, d.name, nodes) - 2.5)
                            .attr('y1', d => {
                                if (conceptNames.includes(d.name)) {
                                    return cy + (genHeight[d.distance]) - 2.5      
                                } else {
                                    return cy + (genHeight[d.distance])     
                                }
                            })
                            .attr('x2', d => getPosition(d, 'x', cx, cy, d.name, nodes) + 2.5)
                            .attr('y2', d => {
                                if (conceptNames.includes(d.name)) {
                                    return cy + (genHeight[d.distance]) + 2.5      
                                } else {
                                    return cy + (genHeight[d.distance])     
                                }
                            })
                        buttonSymbol.append('line')
                            .classed('button-line-2', true)
                            .attr('x1', d => conceptNames.includes(d.name) ? getPosition(d, 'x', cx, cy, d.name, nodes) + 2.5 : getPosition(d, 'x', cx, cy, d.name, nodes))
                            .attr('y1', d => cy + (genHeight[d.distance]) - 2.5)
                            .attr('x2', d => conceptNames.includes(d.name) ? getPosition(d, 'x', cx, cy, d.name, nodes) - 2.5 : getPosition(d, 'x', cx, cy, d.name, nodes))
                            .attr('y2', d => cy + (genHeight[d.distance]) + 2.5)
                        const altCounts = geometry.append('g')
                            .classed('alt-group',true)
                            .attr('id', d => 'alt-group-'+d.name)
                            .style('margin-top','10px')
                        altCounts.append('text')
                            .classed('alt-text',true)
                            .attr('id', d => 'alt-text-'+d.name)
                            .attr('text-anchor', 'middle')
                            .attr('fill', d => d.name === sidebarRoot.name && !d.leaf ? color.text : d.leaf && conceptNames.includes(d.name) && d.total_counts !== d.descendant_counts  ? 'white' : conceptNames.includes(d.name) ? color.text : color.textlight)
                            .attr('x', d => getPosition(d, 'x', cx, cy, d.name, nodes))
                            .attr('y', d => cy + (genHeight[d.distance]) + scaleRadius(Math.sqrt(d.total_counts)) + 13)
                            .style('font-size', '8px')
                            .text(d => d.descendant_counts + ' DRC')
                            .raise()
                        altCounts.append('rect')
                            .classed('alt-rect',true)
                            .attr('id', d => 'alt-rect-'+d.name)
                            .attr('fill', d => d.leaf && conceptNames.includes(d.name) && d.total_counts !== d.descendant_counts  ? d.color : 'none')
                            .attr('stroke', d => d.name === sidebarRoot.name ? 'black' : 'none')
                            .attr('stroke-dasharray', d => d.name === sidebarRoot.name ? '3 3' : 'none')
                            .attr("height",12)
                            .attr('width',d => d3.select('#alt-text-'+d.name).node().getBBox().width + 6)
                            .attr('x', d => getPosition(d, 'x', cx, cy, d.name, nodes) - (d3.select('#alt-text-'+d.name).node().getBBox().width + 6)/2)
                            .attr('y', d => cy + (genHeight[d.distance]) + scaleRadius(Math.sqrt(d.total_counts)) + 4)
                            .attr("rx", 6)
                            .attr("ry", 6)
                            .lower()
                        const label = geometry.append('g')
                            .classed('label', true)
                            .style('pointer-events','all')
                            .on('mouseover', (e,d) => {
                                conceptHover(d.name, "enter")   
                                tooltipHover(d, "enter", e, 'sidebar') 
                                setMapRoot(d.name)
                                if (d.name !== sidebarRoot.name) d3.select('#node-vocabulary-' + d.name).transition().attr('y', getLabel(d).y + 3)   
                            })
                            .on('mouseout', (e,d) => {
                                if (zoomCompleted) {
                                    setMapRoot()
                                }
                                conceptHover(d.name, "leave")  
                                tooltipHover(d, "leave", e, 'sidebar')   
                                d3.select('#node-vocabulary-' + d.name).transition().attr('y', () => d.name === sidebarRoot.name ? getLabel(d).y + 3 : getLabel(d).y + 1) 
                            })
                            .on('click', async (e,d) => {
                                const data = await getData(d.name)
                                setSidebarRoot({name:d.name,data:data})  
                                tooltipHover(d, 'leave', e, 'sidebar')
                                conceptHover(d.name, "leave") 
                            })
                            .style('cursor', 'pointer')
                        label.append('text')
                            .classed('tree-text', true)
                            .attr('text-anchor', 'middle')
                            .attr('id', d => 'tree-text-' + d.name)
                            .text(d => {
                                let genLength = 0
                                let maxWidth = 0
                                let concept_info = d.data.concept
                                nodes.forEach(n => n.distance === d.distance ? genLength++ : null)
                                let text = concept_info.concept_name || concept_info.concept_id.toString()
                                if (treeSelections.includes('mappings') && d.mappings?.length > 0) {
                                    maxWidth = 20
                                }
                                else {
                                    if (genLength === 1) maxWidth = Math.round(width/6)
                                    else maxWidth = Math.round((width/genLength)/6) < 12 ? 12 : Math.round((width/genLength)/6)
                                }  
                                return text.substring(0, maxWidth) + (text.length > maxWidth ? ' ...' : '')
                            })
                            .attr('fill', d => conceptNames.includes(d.name) ? 'black' : color.textlight)
                            .attr('font-weight', d => d.name === sidebarRoot.name ? 700 : 400)
                            .attr('font-size','10px')
                            .attr('x', d => getLabel(d).x)
                            .attr('y', d => getLabel(d).y - 10)
                        label.append('rect')
                            .classed('label-rect', true)
                            .attr('id', d => 'label-rect-' + d.name)
                            .attr('width', d => d3.select("#tree-text-" + d.name).node().getBBox().width + 14)
                            .attr('height', 17)
                            .attr('x', d => getLabel(d).x - (d3.select("#tree-text-" + d.name).node().getBBox().width + 14)/2)
                            .attr('y', d => getLabel(d).y - 22)
                            .attr('fill', d => d.name === sidebarRoot.name ? color.lightpurple : 'white')
                            .attr("rx", 10)
                            .attr("ry", 10)
                            .attr('fill-opacity', d => d.name === sidebarRoot.name ? 1 : 0.7)
                            .lower()
                        node.append('text')
                            .classed('node-vocabulary', true)
                            .attr('id', d => 'node-vocabulary-' + d.name)
                            .attr('text-anchor', 'middle')
                            .attr('fill', d => conceptNames.includes(d.name) ? color.textlight : color.textlightest)
                            .style('font-size','8px')
                            .text(d => d.data.concept.vocabulary_id)
                            .attr('x', d => getLabel(d).x)
                            .attr('y', d => d.name === sidebarRoot.name ? getLabel(d).y + 3 : getLabel(d).y + 1)
                        const pruneLine = node.append('g')
                            .classed('prune-group', true)
                            .attr('id', d => 'prune-group-' + d.name)
                            .style('display', d => pruned && d.leaf && d.children.length > 0 && !d.children.every(child => d.connections.map(d => d.child).includes(child)) ? 'block' : 'none')
                            pruneLine.append('line')
                                .classed('prune-line',true)
                                .attr('fill', 'none')
                                .attr("stroke", "url(#myGradient)")
                                .attr('stroke-width', 1)
                                .attr('x1',d => getPosition(d, 'x', cx, cy, d.name, nodes))
                                .attr('y1',d => cy + (genHeight[d.distance]) + scaleRadius(Math.sqrt(d.total_counts)) + 15)
                                .attr('x2',d => getPosition(d, 'x', cx, cy, d.name, nodes) + 0.1)
                                .attr('y2',d => cy + (genHeight[d.distance]) + scaleRadius(Math.sqrt(d.total_counts)) + 60)
                            pruneLine.append('path')
                                .classed('prune-arrow', true)
                                .attr('fill', color.darkbackground)
                                .attr("d", d3.symbol().type(d3.symbolTriangle).size(arrowSize))
                                .attr("transform", d => {
                                    let x = getPosition(d, 'x', cx, cy, d.name, nodes)
                                    let y = cy + (genHeight[d.distance]) + scaleRadius(Math.sqrt(d.total_counts)) + 60
                                    return "translate(" + x + "," + y + ")rotate(" + 180 + ")"
                                }) 
                        node.selectAll(".prune-curve").data(d => d.connections, d => d.child)
                        .join(enter => {
                            const curve = enter.append('g')
                                .classed('prune-curve',true)
                            curve.append('path')
                                .classed('prune-curve-line',true)
                                .attr('fill', 'none')
                                .attr("stroke", "url(#myGradient)")
                                .attr('stroke-width', 1)
                                .style('display', pruned ? 'block' : 'none')
                                .attr("d", d => {
                                    let sourceNode = nodes.filter(e => e.name === d.source)[0]
                                    let coordinates = getMidXAndMaxY(d.parents.map(p => p.id))
                                    let x1 = getPosition(sourceNode, 'x', cx, cy, d.source, nodes)
                                    let y1 = cy + (genHeight[sourceNode.distance]) + scaleRadius(Math.sqrt(sourceNode.total_counts)) + 15
                                    let x2 = coordinates.midX
                                    let y2 = coordinates.maxY + 50
                                    return curveY({source: [x1, y1], target: [x2, y2]})
                                })
                            curve.append('path')
                                .classed('prune-curve-arrow', true)
                                .attr('fill', color.darkbackground)
                                .attr("d", d3.symbol().type(d3.symbolTriangle).size(arrowSize))
                                .attr("transform", d => {
                                    let x = getMidXAndMaxY(d.parents.map(p => p.id)).midX
                                    let y = getMidXAndMaxY(d.parents.map(p => p.id)).maxY + 50
                                    return "translate(" + x + "," + y + ")rotate(" + 180 + ")"
                                }) 
                        },update => {
                            update.select('.prune-curve-line')
                                .style('display', pruned ? 'block' : 'none')
                                .attr("d", d => {
                                    let sourceNode = nodes.filter(e => e.name === d.source)[0]
                                    let coordinates = getMidXAndMaxY(d.parents.map(p => p.id))
                                    let x1 = getPosition(sourceNode, 'x', cx, cy, d.source, nodes)
                                    let y1 = cy + (genHeight[sourceNode.distance]) + scaleRadius(Math.sqrt(sourceNode.total_counts)) + 15
                                    let x2 = coordinates.midX
                                    let y2 = coordinates.maxY + 50
                                    return curveY({source: [x1, y1], target: [x2, y2]})
                                })
                            update.select('.prune-curve-arrow')
                                .attr("transform", d => {
                                    let x = getMidXAndMaxY(d.parents.map(p => p.id)).midX
                                    let y = getMidXAndMaxY(d.parents.map(p => p.id)).maxY + 50
                                    return "translate(" + x + "," + y + ")rotate(" + 180 + ")"
                                })    
                        })
                        node.lower()
                        label.raise()
                        d3.selectAll('.map-node').lower()
                        return geometry 
                    }, update => {
                        update.selectAll(".map-node").data(d => d.mappings, d => d.name+d.source.name)
                        //Mappings
                        .join(enter => {
                            const mapNode = enter.append('g')
                                .classed('map-node', true)
                                .attr('id', d => 'map-node-'+d.name)
                            const mapLine = mapNode.append('g')
                                .classed('map-link',true)
                                .attr('fill','none')
                                .attr('stroke-width', 0.5)
                                .attr('stroke', d => conceptNames.includes(d.name) ? 'black' : treeSelections.includes('mappings') || mapRoot === d.source.name ? color.textlight : color.textlightest)
                            mapLine.append('path')
                                .classed('map-line', true)
                                .style('stroke-dasharray', '5px 2px')
                                .attr("d", d => {
                                    let sourceX = getMap(d).x
                                    let sourceY = treeSelections.includes('mappings') || mapRoot === d.source.name ? getPosition(d.source, 'y', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes) : getPosition(d.source, 'z', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes)
                                    let targetX = getPosition(d.source, 'x', cx, cy, d.source.name, nodes) 
                                    let targetY = cy + (genHeight[d.distance])
                                    return curveX({source: [sourceX, sourceY], target: [targetX, targetY]})}
                                )
                            mapLine.append('path')
                                .classed('map-tree-arrow', true)
                                .attr('id', d => 'map-arrow-'+d.name)
                                .style('display', d => treeSelections.includes('mappings') || mapRoot === d.source.name ? 'block' : 'none')
                                .attr('fill', d => conceptNames.includes(d.name) ? 'black' : color.textlight)
                                .attr("d", d3.symbol().type(d3.symbolTriangle).size(arrowSize))
                                .attr("transform", d => {
                                    let x = d.direction === -1 ? getPosition(d.source, 'x', cx, cy, d.source.name, nodes) - scaleRadius(Math.sqrt(d.source.total_counts)) - 6 : getMap(d).x - scaleRadius(Math.sqrt(d.total_counts)) - 6
                                    let y = d.direction === -1 ? cy + (genHeight[d.distance]) : getPosition(d.source, 'y', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes)
                                    return "translate(" + x + "," + y + ")rotate(" + 90 + ")"
                                }) 
                            mapNode.append('circle')
                                .classed('map-tree-circle-background',true)
                                .style('fill', 'white')
                                .attr('stroke', 'white')
                                .style('pointer-events', "none")
                                .attr('r', d => treeSelections.includes('mappings') || mapRoot === d.source.name ? scaleRadius(Math.sqrt(d.total_counts)) + 2 : 10)
                                .attr('cx', d => getMap(d).x)
                                .attr('cy', d => treeSelections.includes('mappings') || mapRoot === d.source.name ? getPosition(d.source, 'y', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes) : getPosition(d.source, 'z', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes))
                            mapNode.append('circle')
                                .classed('map-tree-circle', true)
                                .attr('id', d => 'map-tree-circle-' + d.name)
                                .attr('r', d => treeSelections.includes('mappings') || mapRoot === d.source.name ? scaleRadius(Math.sqrt(d.total_counts)) + 2 : 10)
                                .style('fill', d => {
                                    if (conceptNames.includes(d.name)) {
                                        if (d.direction === 1) return d.color
                                        else {
                                            let t = textures.lines()
                                            .size(3)
                                            .strokeWidth(1.5)
                                            .stroke(d.color)  
                                            d3.select('#tree').call(t)
                                            return t.url()  
                                        }
                                    } else return 'white'
                                })
                                .attr('stroke', d => conceptNames.includes(d.name) ? d.color : treeSelections.includes('mappings') || mapRoot === d.source.name ? d.total_counts === 0 ? 'none' : color.textlightest : color.background)
                                .style('cursor', "pointer")
                                .attr('cx', d => getMap(d).x)
                                .attr('cy', d => treeSelections.includes('mappings') || mapRoot === d.source.name ? getPosition(d.source, 'y', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes) : getPosition(d.source, 'z', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes))
                                .style('pointer-events', d => d.total_counts === 0 || !treeSelections.includes('mappings') ? 'none' : 'all')
                                .on('mouseover', (e,d) => hoverNode(d, 'enter'))
                                .on('mouseout', (e,d) => hoverNode(d, 'leave'))
                                .on('click', (e,d) => {
                                    if (d.total_counts !== 0) {
                                        if (conceptNames.includes(d.name)) {
                                            let filteredConcepts = selectedConcepts.filter(e => e.name !== d.name)
                                            setSelectedConcepts(filteredConcepts)   
                                            conceptHover(d.name, "leave") 
                                        } else if (!conceptNames.includes(d.name)){
                                            addConcepts([d])
                                        }     
                                    }
                                })
                            mapNode.append('text')
                                .classed('map-total-counts', true)
                                .attr('id', d => 'map-total-counts-' + d.name)
                                .text(d => d.total_counts)
                                .attr('fill', d => d.total_counts === 0 ? color.text : conceptNames.includes(d.name) ? 'white' : color.text)
                                .style('opacity', d => treeSelections.includes('mappings') || mapRoot === d.source.name ? 1 : 0)
                                .style('font-size', '8px')
                                .style('font-weight', '700')
                                .style('pointer-events', 'none')
                                .attr('text-anchor', 'middle')
                                .attr('x', d => getMap(d).x)
                                .attr('y', d => treeSelections.includes('mappings') || mapRoot === d.source.name ? getPosition(d.source, 'y', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes) + 3 : getPosition(d.source, 'z', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes) + 3)
                            const buttonSymbol = mapNode.append('g')
                                .classed('map-button-symbol', true)
                                .attr('id', d => 'map-button-symbol-' + d.name)
                                .attr('visibility', 'hidden')
                                .attr('stroke', d => conceptNames.includes(d.name) ? 'white' : color.text)
                                .attr('stroke-width', 1.5)
                                .attr('stroke-linecap', 'round')
                                .style('pointer-events', 'none')
                                .style('transition', '0.5s opacity')
                            buttonSymbol.append('line')
                                .classed('map-button-line-1', true)
                                .attr('x1', d => getMap(d).x - 2.5)
                                .attr('y1', d => {
                                    if (conceptNames.includes(d.name)) {
                                        return getPosition(d.source, 'y', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes) - 2.5      
                                    } else {
                                        return getPosition(d.source, 'y', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes)     
                                    }
                                })
                                .attr('x2', d => getMap(d).x + 2.5)
                                .attr('y2', d => {
                                    if (conceptNames.includes(d.name)) {
                                        return getPosition(d.source, 'y', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes) + 2.5      
                                    } else {
                                        return getPosition(d.source, 'y', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes)     
                                    }
                                })
                            buttonSymbol.append('line')
                                .classed('map-button-line-2', true)
                                .attr('x1', d => conceptNames.includes(d.name) ? getMap(d).x + 2.5 : getMap(d).x)
                                .attr('y1', d => getPosition(d.source, 'y', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes) - 2.5)
                                .attr('x2', d => conceptNames.includes(d.name) ? getMap(d).x - 2.5 : getMap(d).x)
                                .attr('y2', d => getPosition(d.source, 'y', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes) + 2.5)
                            const altCounts = mapNode.append('g')
                                .classed('map-alt-counts',true)
                                .style('display', d => treeSelections.includes('mappings') || mapRoot === d.source.name ? 'block' : 'none')
                            altCounts.append('text')
                                .classed('map-alt-text', true)
                                .attr('id', d => 'map-alt-text-' + d.name)
                                .attr('text-anchor', 'middle')
                                .attr('x', d => getX(d))
                                .attr('y', d => getY(d))
                                .style('font-size', '8px')
                                .text(d => d.descendant_counts + ' DRC')
                                .attr('fill', d => conceptNames.includes(d.name) ? color.text : color.textlight)
                            const mapLabel = mapNode.append('g')
                                .classed('map-label', true)
                                .style('cursor', 'pointer')
                                .style('display', d => treeSelections.includes('mappings') || mapRoot === d.source.name ? 'block' : 'none')
                                .on('mouseover', (e,d) => {
                                    tooltipHover(d, 'enter', e, 'sidebar')
                                    conceptHover(d.name, "enter") 
                                    d3.select('#map-label-rect-'+d.name).attr('fill', color.lightpurple)
                                    d3.select('#map-tree-text-'+d.name).style('font-weight',700)
                                    d3.select('#map-vocabulary-' + d.name).attr('y', getMap(d).y + 3)
                                })
                                .on('mouseout', (e,d) => {
                                    tooltipHover(d, 'leave', e, 'sidebar')
                                    conceptHover(d.name, "leave") 
                                    d3.select('#map-label-rect-'+d.name).attr('fill', 'rgba(255, 255, 255, 0.7)')
                                    d3.select('#map-tree-text-'+d.name).style('font-weight',400)
                                    d3.select('#map-vocabulary-' + d.name).attr('y', getMap(d).y + 1)
                                })
                                .on('click', async (e,d) => {
                                    const data = await getData(d.name)
                                    setSidebarRoot({name:d.name,data:data})
                                    tooltipHover(d, 'leave', e, 'sidebar')
                                    conceptHover(d.name, "leave") 
                                })
                            mapLabel.append('text')
                                .classed('map-tree-text', true)
                                .attr('id', d => 'map-tree-text-' + d.name)
                                .attr('text-anchor', 'middle')
                                .text(d => {
                                    let concept_info = d.data.concept 
                                    let maxWidth = 20
                                    let text = concept_info.concept_name || concept_info.concept_id.toString()
                                    return text.substring(0, maxWidth) + (text.length > maxWidth ? ' ...' : '')
                                })
                                .style('font-size','10px')
                                .attr('fill', d => conceptNames.includes(d.name) ? 'black' : color.textlight)
                                .attr('x', d => getMap(d).x)
                                .attr('y', d => getMap(d).y - 10)
                            mapLabel.append('rect')
                                .classed('map-label-rect', true)
                                .attr('id', d => 'map-label-rect-' + d.name)
                                .attr('width', d => d3.select("#map-tree-text-" + d.name).node().getBBox().width + 14)
                                .attr('height', 17)
                                .attr('x', d => getMap(d).x - (d3.select("#map-tree-text-" + d.name).node().getBBox().width + 14)/2)
                                .attr('y', d => getMap(d).y - 22)
                                .attr('fill','rgba(255, 255, 255, 0.7)')
                                .attr("rx", 10)
                                .attr("ry", 10)
                                .lower()
                            mapNode.append('text')
                                .classed('map-vocabulary', true)
                                .attr('id', d => 'map-vocabulary-' + d.name)
                                .attr('text-anchor', 'middle')
                                .style('display', d => treeSelections.includes('mappings') || mapRoot === d.source.name ? 'block' : 'none')
                                .style('font-size', '8px')
                                .attr('fill', d => conceptNames.includes(d.name) ? color.textlight: color.textlightest)
                                .attr('x', d => getMap(d).x)
                                .attr('y', d => getMap(d).y + 1)
                                .text(d => d.data.concept.vocabulary_id)
                            mapNode.lower()
                            mapLabel.raise()
                        }, update => {
                            update.select('.map-link')
                                .attr('stroke', d => conceptNames.includes(d.name) ? 'black' : treeSelections.includes('mappings') || mapRoot === d.source.name ? color.textlight : color.textlightest)
                            update.select('.map-line')
                                .transition(2000)
                                .attr("d", d => {
                                    let sourceX = getMap(d).x
                                    let sourceY = treeSelections.includes('mappings') || mapRoot === d.source.name ? getPosition(d.source, 'y', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes) : getPosition(d.source, 'z', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes)
                                    let targetX = getPosition(d.source, 'x', cx, cy, d.source.name, nodes) 
                                    let targetY = cy + (genHeight[d.distance])
                                    return curveX({source: [sourceX, sourceY], target: [targetX, targetY]})}
                                )
                                // .on("end", () => {
                                //     console.log('map root',mapRoot)
                                //     zoomToFit()
                                // })
                            update.select('.map-tree-arrow')
                                .style('display', d => treeSelections.includes('mappings') || mapRoot === d.source.name ? 'block' : 'none')
                                .attr('fill', d => conceptNames.includes(d.name) && conceptNames.includes(d.source.name) ? 'black' : color.textlight)
                                .attr("d", d3.symbol().type(d3.symbolTriangle).size(arrowSize))
                                .attr("transform", d => {
                                    let x = d.direction === -1 ? getPosition(d.source, 'x', cx, cy, d.source.name, nodes) - scaleRadius(Math.sqrt(d.source.total_counts)) - 6 : getMap(d).x - scaleRadius(Math.sqrt(d.total_counts)) - 6
                                    let y = d.direction === -1 ? cy + (genHeight[d.distance]) : getPosition(d.source, 'y', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes)
                                    return "translate(" + x + "," + y + ")rotate(" + 90 + ")"
                                }) 
                            update.select('.map-tree-circle-background')
                                .attr('r', d => treeSelections.includes('mappings') || mapRoot === d.source.name ? scaleRadius(Math.sqrt(d.total_counts)) + 2 : 10)
                                .attr('cx', d => getMap(d).x)
                                .attr('cy', d => treeSelections.includes('mappings') || mapRoot === d.source.name ? getPosition(d.source, 'y', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes) : getPosition(d.source, 'z', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes))
                            update.select('.map-tree-circle')
                                .on('mouseover', (e,d) => hoverNode(d, 'enter'))
                                .on('mouseout', (e,d) => hoverNode(d, 'leave'))
                                .on('click', (e,d) => {
                                    if (d.total_counts !== 0) {
                                        if (conceptNames.includes(d.name)) {
                                            let filteredConcepts = selectedConcepts.filter(e => e.name !== d.name)
                                            setSelectedConcepts(filteredConcepts)   
                                            conceptHover(d.name, "leave") 
                                        } else if (!conceptNames.includes(d.name)){
                                            addConcepts([d])
                                        }     
                                    }
                                })
                                .attr('r', d => treeSelections.includes('mappings') || mapRoot === d.source.name ? scaleRadius(Math.sqrt(d.total_counts)) + 2 : 10)
                                .style('fill', d => {
                                    if (conceptNames.includes(d.name)) {
                                        if (d.direction === 1) return d.color
                                        else {
                                            let t = textures.lines()
                                            .size(3)
                                            .strokeWidth(1.5)
                                            .stroke(d.color)  
                                            d3.select('#tree').call(t)
                                            return t.url()  
                                        }
                                    } else return 'white'
                                })
                                .attr('stroke', d => conceptNames.includes(d.name) ? d.color : treeSelections.includes('mappings') || mapRoot === d.source.name ? d.total_counts === 0 ? 'none' : color.textlightest : color.background)
                                .transition(2000)
                                .attr('cx', d => getMap(d).x)
                                .attr('cy', d => treeSelections.includes('mappings') || mapRoot === d.source.name ? getPosition(d.source, 'y', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes) : getPosition(d.source, 'z', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes))
                                .style('pointer-events', d => d.total_counts === 0 || !treeSelections.includes('mappings') ? 'none' : 'all')
                            update.select('.map-total-counts')
                                .text(d => d.total_counts)
                                .style('opacity', d => treeSelections.includes('mappings') || mapRoot === d.source.name ? 1 : 0)
                                .attr('fill', d => d.total_counts === 0 ? color.text : conceptNames.includes(d.name) ? 'white' : color.text)
                                .attr('x', d => getMap(d).x)
                                .attr('y', d => treeSelections.includes('mappings') || mapRoot === d.source.name ? getPosition(d.source, 'y', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes) + 3 : getPosition(d.source, 'z', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes) + 3)
                            update.select('.map-button-symbol')
                                .attr('stroke', d => conceptNames.includes(d.name) ? 'white' : color.text)
                            update.select('.map-button-line-1')
                                .attr('x1', d => getMap(d).x - 2.5)
                                .attr('y1', d => {
                                    if (conceptNames.includes(d.name)) {
                                        return getPosition(d.source, 'y', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes) - 2.5      
                                    } else {
                                        return getPosition(d.source, 'y', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes)     
                                    }
                                })
                                .attr('x2', d => getMap(d).x + 2.5)
                                .attr('y2', d => {
                                    if (conceptNames.includes(d.name)) {
                                        return getPosition(d.source, 'y', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes) + 2.5      
                                    } else {
                                        return getPosition(d.source, 'y', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes)     
                                    }
                                })
                            update.select('.map-button-line-2')
                                .attr('x1', d => conceptNames.includes(d.name) ? getMap(d).x + 2.5 : getMap(d).x)
                                .attr('y1', d => getPosition(d.source, 'y', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes) - 2.5)
                                .attr('x2', d => conceptNames.includes(d.name) ? getMap(d).x - 2.5 : getMap(d).x)
                                .attr('y2', d => getPosition(d.source, 'y', getPosition(d.source, 'x', cx, cy, d.source.name, nodes), cy + (genHeight[d.distance]), d.name, nodes) + 2.5)
                            update.select('.map-alt-counts')
                                .style('display', d => treeSelections.includes('mappings') || mapRoot === d.source.name ? 'block' : 'none')
                            update.select('.map-alt-text')
                                .attr('x', d => getX(d))
                                .attr('y', d => getY(d))
                                .text(d => d.descendant_counts + ' DRC')
                                .attr('fill', d => conceptNames.includes(d.name) ? color.text : color.textlight)
                            update.select('.map-label')
                                .style('display', d => treeSelections.includes('mappings') || mapRoot === d.source.name ? 'block' : 'none')
                                .on('mouseover', (e,d) => {
                                    tooltipHover(d, 'enter', e, 'sidebar')
                                    conceptHover(d.name, "enter") 
                                    d3.select('#map-label-rect-'+d.name).attr('fill', color.lightpurple)
                                    d3.select('#map-tree-text-'+d.name).style('font-weight',700)
                                    d3.select('#map-vocabulary-' + d.name).attr('y', getMap(d).y + 3)
                                })
                                .on('mouseout', (e,d) => {
                                    tooltipHover(d, 'leave', e, 'sidebar')
                                    conceptHover(d.name, "leave") 
                                    d3.select('#map-label-rect-'+d.name).attr('fill', 'rgba(255, 255, 255, 0.7)')
                                    d3.select('#map-tree-text-'+d.name).style('font-weight',400)
                                    d3.select('#map-vocabulary-' + d.name).attr('y', getMap(d).y + 1)
                                })
                                .on('click', async (e,d) => {
                                    const data = await getData(d.name)
                                    setSidebarRoot({name:d.name,data:data})
                                    tooltipHover(d, 'leave', e, 'sidebar')
                                    conceptHover(d.name, "leave") 
                                })
                            update.select('.map-tree-text')
                                .text(d => {
                                    let concept_info = d.data.concept 
                                    let maxWidth = 20
                                    let text = concept_info.concept_name || concept_info.concept_id.toString()
                                    return text.substring(0, maxWidth) + (text.length > maxWidth ? ' ...' : '')
                                })
                                .attr('fill', d => conceptNames.includes(d.name) ? 'black' : color.textlight)
                                .attr('x', d => getMap(d).x)
                                .attr('y', d => getMap(d).y - 10)
                            update.select('.map-label-rect')
                                .attr('width', d => d3.select("#map-tree-text-" + d.name).node().getBBox().width + 14)
                                .attr('x', d => getMap(d).x - (d3.select("#map-tree-text-" + d.name).node().getBBox().width + 14)/2)
                                .attr('y', d => getMap(d).y - 22)
                            update.select('.map-vocabulary')
                                .style('display', d => treeSelections.includes('mappings') || mapRoot === d.source.name ? 'block' : 'none')
                                .attr('fill', d => conceptNames.includes(d.name) ? color.textlight : color.textlightest)
                                .attr('x', d => getMap(d).x)
                                .attr('y', d => getMap(d).y + 1)
                                .text(d => d.data.concept.vocabulary_id)
                        },exit => exit.remove())
                        //Subsumes node
                        update.select('.tree-circle-background') 
                            .transition()
                            .attr('r', d => scaleRadius(Math.sqrt(d.total_counts)) + 2)
                            .attr('cx', d => getPosition(d, 'x', cx, cy, d.name, nodes))
                            .attr('cy', d => cy + (genHeight[d.distance]))
                        update.select('.tree-circle')
                            .on('mouseover', (e,d) => hoverNode(d, 'enter'))
                            .on('mouseout', (e,d) => hoverNode(d, 'leave'))
                            .on('click', (e,d) => {
                                if (d.total_counts !== 0) {
                                    if (conceptNames.includes(d.name)) {
                                        let filteredConcepts = selectedConcepts.filter(e => e.name !== d.name)
                                        console.log('filtered concepts', filteredConcepts)
                                        setSelectedConcepts(filteredConcepts)   
                                        conceptHover(d.name, "leave") 
                                    } else if (!conceptNames.includes(d.name)){
                                        addConcepts([d])
                                    }     
                                }
                            })
                            .attr('r', d => scaleRadius(Math.sqrt(d.total_counts)) + 2)
                            .attr('stroke', d => d.total_counts === 0 ? 'none' : !conceptNames.includes(d.name) ? color.textlightest : d.color)
                            .attr('fill', d => {
                                if (d.total_counts === 0) return 'white'
                                else {
                                    if (!d.data.concept.standard_concept && conceptNames.includes(d.name)) {
                                        let t = textures.lines()
                                            .size(3)
                                            .strokeWidth(1.5)
                                            .stroke(d.color)  
                                        d3.select('#tree').call(t)
                                        return t.url()  
                                    } 
                                    else if (d.data.concept.standard_concept && conceptNames.includes(d.name)) {
                                        return d.color
                                    } else {return 'white'}    
                                }
                            })
                            .attr('pointer-events', d => d.total_counts === 0 ? "none" : "all")
                            .transition('nodePosition')
                            .duration(500)
                            .attr('cx', d => getPosition(d, 'x', cx, cy, d.name, nodes))
                            .attr('cy', d => cy + (genHeight[d.distance]))
                        update.select('.total-counts')
                            .text(d => d.total_counts)
                            .style('font-size', d => d.total_counts === 0 ? '10px' : '8px')
                            .attr('fill', d => d.total_counts === 0 ? color.text : conceptNames.includes(d.name) ? 'white' : color.text)
                            .attr('x', d => getPosition(d, 'x', cx, cy, d.name, nodes))
                            .attr('y', d => cy + (genHeight[d.distance]) + 3)
                        update.select('.button-line-1')
                            .attr('x1', d => getPosition(d, 'x', cx, cy, d.name, nodes) - 2.5)
                            .attr('y1', d => {
                                if (conceptNames.includes(d.name)) {
                                    return cy + (genHeight[d.distance]) - 2.5      
                                } else {
                                    return cy + (genHeight[d.distance])     
                                }  
                            })
                            .attr('x2', d => getPosition(d, 'x', cx, cy, d.name, nodes) + 2.5)
                            .attr('y2', d => {
                                if (conceptNames.includes(d.name)) {
                                    return cy + (genHeight[d.distance]) + 2.5      
                                } else {
                                    return cy + (genHeight[d.distance])     
                                }    
                            })
                        update.select('.button-line-2')
                            .attr('x1', d => conceptNames.includes(d.name) ? getPosition(d, 'x', cx, cy, d.name, nodes) + 2.5 : getPosition(d, 'x', cx, cy, d.name, nodes))
                            .attr('y1', d => cy + (genHeight[d.distance]) - 2.5)
                            .attr('x2', d => conceptNames.includes(d.name) ? getPosition(d, 'x', cx, cy, d.name, nodes) - 2.5 : getPosition(d, 'x', cx, cy, d.name, nodes))
                            .attr('y2', d => cy + (genHeight[d.distance]) + 2.5)
                        update.select('.alt-text')
                            .attr('fill', d => d.name === sidebarRoot.name && !d.leaf ? color.text : d.leaf && conceptNames.includes(d.name) && d.total_counts !== d.descendant_counts ? 'white' : conceptNames.includes(d.name) ? color.text : color.textlight)
                            .attr('x', d => getPosition(d, 'x', cx, cy, d.name, nodes))
                            .attr('y', d => cy + (genHeight[d.distance]) + scaleRadius(Math.sqrt(d.total_counts)) + 13)
                            .text(d => d.descendant_counts + ' DRC')
                        update.select('.alt-rect')
                            .attr('fill', d => d.leaf && conceptNames.includes(d.name) && d.total_counts !== d.descendant_counts  ? d.color : 'none')
                            .attr('stroke', d => d.name === sidebarRoot.name ? 'black' : 'none')
                            .attr('stroke-dasharray', d => d.name === sidebarRoot.name ? '3 3' : 'none')
                            .attr('width',d => d3.select('#alt-text-'+d.name).node().getBBox().width + 6)
                            .attr('x', d => getPosition(d, 'x', cx, cy, d.name, nodes) - (d3.select('#alt-text-'+d.name).node().getBBox().width + 6)/2)
                            .attr('y', d => cy + (genHeight[d.distance]) + scaleRadius(Math.sqrt(d.total_counts)) + 4)
                        update.select('.label')
                            .on('mouseover', (e,d) => {
                                conceptHover(d.name, "enter")   
                                tooltipHover(d, "enter", e, 'sidebar') 
                                setMapRoot(d.name)
                                if (d.name !== sidebarRoot.name) d3.select('#node-vocabulary-' + d.name).transition().attr('y', getLabel(d).y + 3)   
                            })
                            .on('mouseout', (e,d) => {
                                if (zoomCompleted) setMapRoot()
                                conceptHover(d.name, "leave")  
                                tooltipHover(d, "leave", e, 'sidebar')   
                                d3.select('#node-vocabulary-' + d.name).transition().attr('y', () => d.name === sidebarRoot.name ? getLabel(d).y + 3 : getLabel(d).y + 1) 
                            })
                            .on('click', async (e,d) => {
                                const data = await getData(d.name)
                                setSidebarRoot({name:d.name,data:data})  
                                tooltipHover(d, 'leave', e, 'sidebar')
                                conceptHover(d.name, "leave") 
                            })
                        update.select('.tree-text')
                            .text(d => {
                                let genLength = 0
                                let maxWidth = 0
                                let concept_info = d.data.concept
                                nodes.forEach(n => n.distance === d.distance ? genLength++ : null)
                                let text = concept_info.concept_name || concept_info.concept_id.toString()
                                if (treeSelections.includes('mappings') && d.mappings?.length > 0) {
                                    maxWidth = 20
                                }
                                else {
                                    if (genLength === 1) maxWidth = Math.round(width/6)
                                    else maxWidth = Math.round((width/genLength)/6) < 12 ? 12 : Math.round((width/genLength)/6)
                                }  
                                return text.substring(0, maxWidth) + (text.length > maxWidth ? ' ...' : '')
                            })
                            .attr('font-weight', d => d.name === sidebarRoot.name ? 700 : 400)
                            .attr('fill', d => conceptNames.includes(d.name) ? 'black' : color.textlight)
                            .attr('x', d => getLabel(d).x)
                            .attr('y', d => getLabel(d).y - 10)
                        update.select('.label-rect')
                            .attr('width', d => d3.select('#tree-text-'+d.name).node().getBBox().width + 14)
                            .attr('x', d => getLabel(d).x - (d3.select("#tree-text-" + d.name).node().getBBox().width + 14)/2)
                            .attr('y', d => getLabel(d).y - 22)
                            .attr('fill', d => d.name === sidebarRoot.name ? color.lightpurple : 'white')
                            .attr('fill-opacity', d => d.name === sidebarRoot.name ? 1 : 0.7);
                        update.select('.node-vocabulary')
                            .attr('fill', d => conceptNames.includes(d.name) ? color.textlight : color.textlightest)
                            .text(d => d.data.concept.vocabulary_id)
                            .attr('x', d => getLabel(d).x)
                            .attr('y', d => d.name === sidebarRoot.name ? getLabel(d).y + 3 : getLabel(d).y + 1)
                        update.select('.prune-group')
                            .style('display', d => pruned && d.leaf && d.children.length > 0 && !d.children.every(child => d.connections.map(d => d.child).includes(child)) ? 'block' : 'none')
                        update.select('.prune-line')
                            .attr('x1',d => getPosition(d, 'x', cx, cy, d.name, nodes))
                            .attr('y1',d => cy + (genHeight[d.distance]) + scaleRadius(Math.sqrt(d.total_counts)) + 15)
                            .attr('x2',d => getPosition(d, 'x', cx, cy, d.name, nodes) + 0.1)
                            .attr('y2',d => cy + (genHeight[d.distance]) + scaleRadius(Math.sqrt(d.total_counts)) + 60)
                        update.select('.prune-arrow')
                            .attr("transform", d => {
                                let x = getPosition(d, 'x', cx, cy, d.name, nodes)
                                let y = cy + (genHeight[d.distance]) + scaleRadius(Math.sqrt(d.total_counts)) + 60
                                return "translate(" + x + "," + y + ")rotate(" + 180 + ")"
                            }) 
                        update.selectAll(".prune-curve").data(d => d.connections, d => d.child)
                        .join(enter => {
                            const curve = enter.append('g')
                                .classed('prune-curve',true)
                            curve.append('path')
                                .classed('prune-curve-line',true)
                                .attr('fill', 'none')
                                .attr("stroke", "url(#myGradient)")
                                .attr('stroke-width', 1)
                                .style('display', pruned ? 'block' : 'none')
                                .attr("d", d => {
                                    let sourceNode = nodes.filter(e => e.name === d.source)[0]
                                    let coordinates = getMidXAndMaxY(d.parents.map(p => p.id))
                                    let x1 = getPosition(sourceNode, 'x', cx, cy, d.source, nodes)
                                    let y1 = cy + (genHeight[sourceNode.distance]) + scaleRadius(Math.sqrt(sourceNode.total_counts)) + 15
                                    let x2 = coordinates.midX
                                    let y2 = coordinates.maxY + 50
                                    return curveY({source: [x1, y1], target: [x2, y2]})
                                })
                            curve.append('path')
                                .classed('prune-curve-arrow', true)
                                .attr('fill', color.darkbackground)
                                .attr("d", d3.symbol().type(d3.symbolTriangle).size(arrowSize))
                                .attr("transform", d => {
                                    let x = getMidXAndMaxY(d.parents.map(p => p.id)).midX
                                    let y = getMidXAndMaxY(d.parents.map(p => p.id)).maxY + 50
                                    return "translate(" + x + "," + y + ")rotate(" + 180 + ")"
                                }) 
                        },update => {
                            update.select('.prune-curve-line')
                                .style('display', pruned ? 'block' : 'none')
                                .attr("d", d => {
                                    let sourceNode = nodes.filter(e => e.name === d.source)[0]
                                    let coordinates = getMidXAndMaxY(d.parents.map(p => p.id))
                                    let x1 = getPosition(sourceNode, 'x', cx, cy, d.source, nodes)
                                    let y1 = cy + (genHeight[sourceNode.distance]) + scaleRadius(Math.sqrt(sourceNode.total_counts)) + 15
                                    let x2 = coordinates.midX
                                    let y2 = coordinates.maxY + 50
                                    return curveY({source: [x1, y1], target: [x2, y2]})
                                })
                            update.select('.prune-curve-arrow')
                                .attr("transform", d => {
                                    let x = getMidXAndMaxY(d.parents.map(p => p.id)).midX
                                    let y = getMidXAndMaxY(d.parents.map(p => p.id)).maxY + 50
                                    return "translate(" + x + "," + y + ")rotate(" + 180 + ")"
                                })    
                        })
                    },exit => exit.remove())
            }
            updateLinks()
            updateNodes()
        }
        // list
        function drawList() {
            let sums = []
            list.forEach(node => {
                sums.push(node.total_counts)
                sums.push(node.descendant_counts)
                node.mappings.forEach(map => {
                    sums.push(map.total_counts)
                    sums.push(map.descendant_counts)
                })
            })
            const extent = d3.extent(sums)
            const scaleWidth = d3.scaleLinear().domain([0, extent[1]]).range(extent[1] === 0 ? [0,0] : [0, 80])
            let parentsArray = list.filter(d => d.relationship === "-1")
            let rootArray = list.filter(d => d.relationship === "0")
            let childrenArray = list.filter(d => d.relationship.includes('-') && d.relationship !== "-1").sort((x,y) => {
                const [a1, a2] = x.relationship.split('-').map(Number)
                const [b1, b2] = y.relationship.split('-').map(Number)
                return a1 - b1 || a2 - b2
                })
            let childrenGroups = childrenArray.reduce((acc, obj) => {
                const groupKey = obj.relationship.split('-')[0]
                if (!acc[groupKey]) acc[groupKey] = []
                acc[groupKey].push(obj)
                return acc
            }, {})
            let sectionData = [
                {section:'PARENTS',nodes:parentsArray},
                {section:'ROOT',nodes:rootArray},
                
            ]
            let childrenSections = Object.entries(childrenGroups).map(([key, nodes]) => ({
                section: key,   
                nodes: nodes    
            }))
            sectionData = [...sectionData,...childrenSections]
            sectionData = sectionData.filter(d => d.nodes.length > 0) 
            console.log('list',sectionData)
            d3.select('#list-container').selectAll('.list-section').data(sectionData, d => d.section)
            .join(enter => {
                const section = enter.append('div')  
                    .classed('list-section',true)
                    .style('padding-bottom', d => d.section === 'PARENTS' || d.section === 'ROOT' ? '5px' : '0px')
                const title = section.append('div')    
                    .classed('section-title',true)
                    .style('background-color', d => d.section === 'ROOT' ? color.purple : 'white')
                    .style('border-radius', '16px 16px 0px 0px')
                    .style('height', d => d.section === 'ROOT' ? '26px' : '20px')
                title.append('i')
                    .classed('section-arrow fa-solid fa-arrow-up fa-xs',true)
                    .style('display', d => d.section === 'ROOT' ? 'none' : 'block')
                    .style('transform', d => d.section !== 'PARENTS' ? 'rotate('+180+'deg)' : 'none')
                    .style('transform-origin', 'center')
                title.append('p')
                    .classed('level-number',true)
                    .style('display', d => d.section !== 'PARENTS' && d.section !== 'ROOT' ? 'block' : 'none')
                    .html(d => d.section)
                    .style('font-size','10px')
                    .style('font-weight', 700)
                    .style('margin-left', '2px')
                    .style('margin-right', '4px')
                title.append('p')
                    .classed('section-name',true)
                    .style('margin', '0px')
                    .style('padding-left', d => d.section === 'ROOT' ? '13px' : '2px')
                    .style('color', d => d.section === 'ROOT' ? 'white' : color.text)
                    .style('display', d => d.section === 'PARENTS' || d.section === 'ROOT' || d.section === '1' ? 'block' : 'none')
                    .style('font-size','10px')
                    .style('font-weight', 700)
                    .html(d => d.section === '1' ? 'CHILDREN' : d.section)
                // CONCEPT LIST
                section.selectAll(".list-item-container").data(d => d.nodes, d => d.name)
                .join(enter => {
                    const itemContainer = enter.append('div')
                        .classed('list-item-container',true)
                    const item = itemContainer.append('div')
                        .classed('list-item',true)
                        .attr('id', d => 'list-item-'+d.name)
                        .style('margin-bottom', '4px')
                        .style('background-color', d => d.name !== sidebarRoot.name ? conceptNames.includes(d.name) ? color.lightbackground : 'transparent' : color.lightpurple)
                        .style('border', d => conceptNames.includes(d.name) ? d.name === sidebarRoot.name ? '1px solid var(--lightpurple)' : '1px solid var(--lightbackground)' : '1px solid var(--background)')
                        .style('border-radius', d => d.name !== sidebarRoot.name ? '20px' : '0px 0px 16px 16px')
                    const titleSection = item.append('div')
                        .classed('title-section',true)
                    const title = titleSection.append('div')
                        .classed('item-title',true)
                        .attr('id', d => 'item-title-' + d.name)
                    const circle = title.append('div')
                        .classed('title-circle',true)
                        .attr('id', d => 'title-circle-'+d.name)
                        .style('flex-shrink',0)
                        .style('width', '14px')
                        .style('height', '14px')
                        .style('cursor','pointer')
                        .style('pointer-events', d => d.total_counts === 0 ? 'none' : 'all')
                        .style('background', d => {
                            if (!conceptNames.includes(d.name)) return "none"
                            else {
                                if (!d.data.concept.standard_concept) {return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, "+ d.color + " 0.5px," + d.color + " 2px)"} 
                                else {return "none"}    
                            }    
                        })
                        .style("background-color", d => {
                            if (!conceptNames.includes(d.name)) return "transparent"
                            else {
                                if (d.data.concept.standard_concept) {return d.color} 
                                else {return "transparent"}
                            }
                        }) 
                        .style('border', d => d.total_counts === 0 ? '1px solid var(--textlightest)' : conceptNames.includes(d.name) ? `1px solid ${d.color}` : '1px solid var(--textlight)')
                        .style('border-radius', '50%')
                        .style('margin-right', '5px')
                        .on('click', (e,d) => {
                            d3.select('#x-'+d.name).transition().style('opacity',0).style('display','none')
                            if (d.total_counts !== 0) {
                                if (conceptNames.includes(d.name)) {
                                    let filteredConcepts = selectedConcepts.filter(e => e.name !== d.name)
                                    setSelectedConcepts(filteredConcepts)   
                                } else if (!conceptNames.includes(d.name)){
                                    addConcepts([d])
                                }     
                            }    
                        })
                        .on('mouseover', (e,d) => {
                            if (!conceptNames.includes(d.name)) {
                                d3.select('#plus-'+d.name).transition().style('color', 'white')
                                d3.select('#title-circle-'+d.name).transition().style('background-color', d => d.color).style('border',`1px solid ${d.color}`) 
                                d3.select('#title-name-'+d.name).transition().style('color','black')   
                                d3.select('#title-vocab-'+d.name).transition().style('color',color.textlight) 
                                d3.select('#counts1-text-'+d.name).transition().style('color',color.text) 
                                d3.select('#counts1-rect-'+d.name).transition().style('background-color',d.color) 
                            } else d3.select('#x-'+d.name).transition().style('opacity',1).style('display','block') 
                        })
                        .on('mouseout', (e,d) => {
                            if (!conceptNames.includes(d.name)) {
                                d3.select('#plus-'+d.name).transition().style('color', color.text)
                                d3.select('#title-circle-'+d.name).transition().style('background-color', 'transparent').style('border','1px solid var(--textlight)')
                                d3.select('#title-name-'+d.name).transition().style('color',color.textlight) 
                                d3.select('#title-vocab-'+d.name).transition().style('color',color.textlightest)  
                                d3.select('#counts1-text-'+d.name).transition().style('color',color.textlight) 
                                d3.select('#counts1-rect-'+d.name).transition().style('background-color',color.textlightest)   
                            } else d3.select('#x-'+d.name).transition().style('opacity',0).style('display','none')
                        })
                    circle.append('i')
                        .classed('list-plus fa-solid fa-plus fa-2xs',true)
                        .attr('id',d => 'plus-'+d.name)
                        .style('color', color.text)
                        .style('pointer-events','none')
                        .style('padding-bottom','1px')
                        .style('display', d => !conceptNames.includes(d.name) && d.total_counts !== 0 ? 'block' : 'none')
                    circle.append('i')
                        .classed('list-x fa-solid fa-x fa-2xs',true)
                        .style('color', 'white')
                        .attr('id',d => 'x-'+d.name)
                        .style('opacity', 0)
                        .style('display', 'none')
                        .style('padding-bottom','1px')
                        .style('pointer-events','none')
                    const titleP = title.append('p')
                    titleP.append('span')
                        .classed('title-name',true)
                        .attr('id', d => 'title-name-'+d.name)
                        .style("font-weight", d => d.name == sidebarRoot.name ? 700 : 400)
                        .style('color', d => conceptNames.includes(d.name) ? 'black' : color.textlight)
                        .html(d => d.data.concept.concept_name)
                        .style('padding-right', '4px')
                        .style('cursor','pointer')
                        .on('click', async (e,d) => {
                            const data = await getData(d.name)
                            setSidebarRoot({name:d.name,data:data})  
                            conceptHover(d.name, "leave") 
                        })
                        .on('mouseover', (e,d) => {
                            d3.select('#list-item-'+d.name).style('background-color',color.lightpurple).style('border','1px solid var(--lightpurple)')
                            d3.select('#title-name-'+d.name).style('font-weight',700)
                            if (!conceptNames.includes(d.name) && d.total_counts !== 0) {
                                d3.select('#plus-'+d.name).transition().style('color', 'white')
                                d3.select('#title-circle-'+d.name).transition().style('background-color', d => d.color).style('border',`1px solid ${d.color}`)  
                                d3.select('#title-name-'+d.name).transition().style('color','black') 
                                d3.select('#title-vocab-'+d.name).transition().style('color',color.textlight) 
                                d3.select('#counts1-text-'+d.name).transition().style('color',color.text) 
                                d3.select('#counts1-rect-'+d.name).transition().style('background-color',d.color)     
                            }
                            conceptHover(d.name, "enter")
                        })
                        .on('mouseout', (e,d) => {
                            if (d.name !== sidebarRoot.name) {
                                d3.select('#list-item-'+d.name).style('background-color', d => conceptNames.includes(d.name) ? color.lightbackground : 'transparent').style('border', d => conceptNames.includes(d.name) ? '1px solid var(--lightbackground)' : '1px solid var(--background)')
                                d3.select('#title-name-'+d.name).style('font-weight',400)
                                if (!conceptNames.includes(d.name) && d.total_counts !== 0) {
                                    d3.select('#plus-'+d.name).transition().style('color', color.text)
                                    d3.select('#title-circle-'+d.name).transition().style('background-color', 'transparent').style('border','1px solid var(--textlight)')
                                    d3.select('#title-name-'+d.name).transition().style('color',color.textlight) 
                                    d3.select('#title-vocab-'+d.name).transition().style('color',color.textlightest)  
                                    d3.select('#counts1-text-'+d.name).transition().style('color',color.textlight) 
                                    d3.select('#counts1-rect-'+d.name).transition().style('background-color',color.textlightest) 
                                }
                            }    
                            conceptHover(d.name, "leave")
                        })
                    titleP.append('span')
                        .classed('title-vocab',true)
                        .attr('id', d => 'title-vocab-'+d.name)
                        .style('font-size', '10px')
                        .style('color', d => conceptNames.includes(d.name) ? color.textlight : color.textlightest)
                        .html(d => d.data.concept.vocabulary_id)
                        .style('margin-right','5px')
                    titleP.append('span')
                        .classed('title-level',true)
                        .attr('id', d => 'title-level-'+d.name)
                        .style('font-size', '10px')
                        .style('font-weight',700)
                        .style('color', d => conceptNames.includes(d.name) ? color.text : color.textlight)
                        .style('margin-right', '12px')
                        .html(d => d.levels)    
                    title.append('i')
                        .classed('info-icon fa-solid fa-circle-info',true)  
                        .attr('id', d => 'info-icon-'+d.name)  
                        .style('color', color.text)
                        .style('opacity', 0.2)
                        .style('cursor','pointer')
                        .style('margin-right','2px')
                        .on('mouseover', (e,d) => d3.select('#info-icon-'+d.name).style('opacity',1))
                        .on('mouseout', (e,d) => {
                            if (d3.select('#info-container-'+d.name).style('display') === 'none') d3.select('#info-icon-'+d.name).style('opacity',0.2)
                        })
                        .on('click', (e,d) => {
                            if (d3.select('#info-container-'+d.name).style('display') === 'flex') {
                                d3.select('#info-icon-'+d.name).style('opacity',0.2)
                                d3.select('#info-container-'+d.name).transition().style('height','0px').style('display','none')
                                d3.select('#info-col1-'+d.name).transition().style('opacity',0)
                                d3.select('#info-col2-'+d.name).transition().style('opacity',0)
                            } else {
                                d3.select('#info-icon-'+d.name).style('opacity',1)
                                d3.select('#info-container-'+d.name).transition().style('height','50px').style('display','flex')
                                d3.select('#info-col1-'+d.name).transition().style('opacity',1)
                                d3.select('#info-col2-'+d.name).transition().style('opacity',1)    
                            }
                            
                        })
                    title.append('i')
                        .classed('title-caret-down fa-solid fa-lg fa-caret-down',true)
                        .attr('id', d => 'caret-down-'+d.name)
                        .style('color', color.text)
                        .style('display', d => !treeSelections.includes('mappings') ? d.mappings.length > 0 ? 'block' : 'none' : 'none')
                        .style('cursor','pointer')
                        .style('opacity', 0.2)
                        .style('margin-right','5px')
                        .on('click', (e,d) => {
                            if (d3.select('#caret-down-'+d.name).style('display') === 'block') {
                                d3.select('#caret-down-'+d.name).style('display','none')  
                                d3.select('#caret-up-'+d.name).style('display','block') 
                                d3.select('#mappings-container-'+d.name).transition().style('height','auto').style('display','flex')
                            }
                        })
                        .on('mouseover', (e,d) => d3.select('#caret-down-'+d.name).style('opacity',1))
                        .on('mouseout', (e,d) => d3.select('#caret-down-'+d.name).style('opacity',0.2))
                    title.append('i')
                        .classed('title-caret-up fa-solid fa-lg fa-caret-up',true)
                        .attr('id', d => 'caret-up-'+d.name)
                        .style('color', color.text)
                        .style('display', d => treeSelections.includes('mappings') && d.mappings.length > 0 ? 'block' : 'none')
                        .style('cursor','pointer')
                        .style('margin-right','5px')
                        // .style('padding-top','4px')
                        .on('click', (e,d) => {
                            if (d3.select('#caret-up-'+d.name).style('display') === 'block') {
                                d3.select('#caret-up-'+d.name).style('display','none')  
                                d3.select('#caret-down-'+d.name).style('display','block') 
                                d3.select('#mappings-container-'+d.name).transition().style('height','0px').style('display','none')
                            }
                        })
                    const countsContainer = titleSection.append('div')
                        .classed('list-counts-container',true)
                        .attr('id', d => 'counts-container-'+d.name)
                    const counts1 = countsContainer.append('div')
                        .classed('list-counts',true)
                    counts1.append('p')
                        .classed('counts1-text',true)
                        .attr('id', d => 'counts1-text-'+d.name)
                        .style('color', d => conceptNames.includes(d.name) ? d.total_counts > 0 ? color.text : color.textlight : color.textlight)
                        .html(d => d.total_counts + ' RC')
                    counts1.append('div')
                        .classed('counts1-rect',true)
                        .attr('id', d => 'counts1-rect-'+d.name)
                        .style('height', '8px')
                        .style('width', d => scaleWidth(d.total_counts) + 'px')
                        .style('background-color', d => conceptNames.includes(d.name) ? d.color : color.textlightest)
                        .style('margin-left', '5px')
                        .style('border-radius', '20px')
                    const counts2 = countsContainer.append('div')
                        .classed('list-counts',true)
                    counts2.append('p')
                        .classed('counts2-text',true)
                        .style('color', color.textlight)
                        .html(d => d.descendant_counts + ' DRC')
                    counts2.append('div')
                        .classed('counts2-rect',true)
                        .style('height', '8px')
                        .style('width', d => scaleWidth(d.descendant_counts) + 'px')
                        .style('background-color', color.textlightest)
                        .style('margin-left', '5px')
                        .style('border-radius', '20px')
                    const infoContainer = item.append('div')
                        .classed('info-container',true)
                        .attr('id', d => 'info-container-'+d.name)
                    const infoCol1 = infoContainer.append('div')
                        .classed('info-col',true)
                        .attr('id', d => 'info-col1-'+d.name)
                    infoCol1.append('p')
                        .html('Id')
                        .style("font-weight", 700)
                        .append('span')
                        .html(d => d.name)
                        .style('margin-left','8px')
                        .style('font-weight', 400)
                    infoCol1.append('p')
                        .html('Code')
                        .style("font-weight", 700)
                        .append('span')
                        .html(d => d.data.concept.concept_code)
                        .style('margin-left','8px')
                        .style('font-weight', 400)
                    infoCol1.append('p')
                        .html('Type')
                        .style("font-weight", 700)
                        .append('span')
                        .html(d => d.data.concept.standard_concept ? "Standard" : "Non standard")
                        .style('margin-left','8px')
                        .style('font-weight', 400)
                        .style('padding', '1px 5px 1px 5px')
                        .style('border', d => d.data.concept.standard_concept ? '1px solid black' : '1px dashed black')
                        .style('border-radius', '10px')
                    const infoCol2 = infoContainer.append('div')
                        .classed('info-col',true)
                        .attr('id', d => 'info-col2-'+d.name)
                        .style('margin-left', '20px')
                    infoCol2.append('p')
                        .html('Domain')
                        .style("font-weight", 700)
                        .append('span')
                        .html(d => d.data.concept.domain_id)
                        .style('margin-left','8px')
                        .style('font-weight', 400)
                    infoCol2.append('p')
                        .html('Class')
                        .style("font-weight", 700)
                        .append('span')
                        .html(d => d.data.concept.concept_class_id)
                        .style('margin-left','8px')
                        .style('font-weight', 400)
                    // infoCol2.append('p')
                    //     .html('Validity')
                    //     .style("font-weight", 700)
                    //     .append('span')
                    //     .html(d => getValidity(d.data.concept.valid_end_date))
                    //     .style('margin-left','8px')
                    //     .style('font-weight', 400)
                    const mappingsContainer = itemContainer.append('div')
                        .classed('mappings-container',true)
                        .attr('id', d => 'mappings-container-'+d.name)
                        .style('height', d => treeSelections.includes('mappings') && d.mappings.length > 0 ? 'auto' : '0px')
                        .style('display', d => treeSelections.includes('mappings') && d.mappings.length > 0 ? 'flex' : 'none')
                    mappingsContainer.append('p')
                        .classed('mappings-type',true)
                        .style('margin',0)
                        .style('font-size','10px')
                        .style('margin-bottom','4px')
                        .style('margin-left','4px')
                        .html(d => d.data.concept.standard_concept ? 'MAPPED FROM' : 'MAPS TO')
                    // MAPPINGS
                    mappingsContainer.selectAll(".map-list-item-container").data(d => d.mappings, d => d.name)
                    .join(enter => {
                        const mapItemContainer = enter.append('div')
                            .classed('map-list-item-container',true)
                        const mapItem = mapItemContainer.append('div')
                            .classed('map-list-item',true)
                            .attr('id', d => 'list-item-'+d.name)
                            .style('margin-bottom', '4px')
                            .style('background-color', d => d.name !== sidebarRoot.name ? conceptNames.includes(d.name) ? color.lightbackground : 'transparent' : color.lightpurple)
                            .style('border', d => conceptNames.includes(d.name) ? d.name === sidebarRoot.name ? '1px solid var(--lightpurple)' : '1px solid var(--lightbackground)' : '1px solid var(--background)')
                            .style('border-radius', d => d.name !== sidebarRoot.name ? '20px' : '0px 0px 16px 16px')
                        const mapTitleSection = mapItem.append('div')
                            .classed('map-title-section',true)
                        const mapTitle = mapTitleSection.append('div')
                            .classed('map-item-title',true)
                            .attr('id', d => 'item-title-' + d.name)
                        const mapCircle = mapTitle.append('div')
                            .classed('map-title-circle',true)
                            .attr('id', d => 'title-circle-'+d.name)
                            .style('flex-shrink',0)
                            .style('width', '14px')
                            .style('height', '14px')
                            .style('pointer-events', d => d.total_counts === 0 ? 'none' : 'all')
                            .style('border', d => d.total_counts === 0 ? '1px solid var(--textlightest)' : conceptNames.includes(d.name) ? `1px solid ${d.color}` : '1px solid var(--textlight)')
                            .style('cursor','pointer')
                            .style('background', d => {
                                if (!conceptNames.includes(d.name)) return "none"
                                else {
                                    if (!d.data.concept.standard_concept) {return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, "+ d.color + " 0.5px," + d.color + " 2px)"} 
                                    else {return "none"}    
                                }    
                            })
                            .style("background-color", d => {
                                if (!conceptNames.includes(d.name)) return "transparent"
                                else {
                                    if (d.data.concept.standard_concept) {return d.color} 
                                    else {return "transparent"}
                                }
                            }) 
                            .style('border-radius', '50%')
                            .style('margin-right', '5px')
                            .on('click', (e,d) => {
                                d3.select('#x-'+d.name).transition().style('opacity',0).style('display','none')
                                if (d.total_counts !== 0) {
                                    if (conceptNames.includes(d.name)) {
                                        let filteredConcepts = selectedConcepts.filter(e => e.name !== d.name)
                                        setSelectedConcepts(filteredConcepts)   
                                    } else if (!conceptNames.includes(d.name)){
                                        addConcepts([d])
                                    }     
                                }    
                            })
                            .on('mouseover', (e,d) => {
                                if (!conceptNames.includes(d.name)) {
                                    d3.select('#plus-'+d.name).transition().style('color', 'white')
                                    d3.select('#title-circle-'+d.name).transition().style('background-color', d => d.color).style('border',`1px solid ${d.color}`) 
                                    d3.select('#title-name-'+d.name).transition().style('color','black')   
                                    d3.select('#title-vocab-'+d.name).transition().style('color',color.textlight) 
                                    d3.select('#counts1-text-'+d.name).transition().style('color',color.text) 
                                    d3.select('#counts1-rect-'+d.name).transition().style('background-color',d.color) 
                                } else d3.select('#x-'+d.name).transition().style('opacity',1).style('display','block')
                            })
                            .on('mouseout', (e,d) => {
                                if (!conceptNames.includes(d.name)) {
                                    d3.select('#plus-'+d.name).transition().style('color', color.text)
                                    d3.select('#title-circle-'+d.name).transition().style('background-color', 'transparent').style('border','1px solid var(--textlight)')
                                    d3.select('#title-name-'+d.name).transition().style('color',color.textlight) 
                                    d3.select('#title-vocab-'+d.name).transition().style('color',color.textlightest)  
                                    d3.select('#counts1-text-'+d.name).transition().style('color',color.textlight) 
                                    d3.select('#counts1-rect-'+d.name).transition().style('background-color',color.textlightest)   
                                } else d3.select('#x-'+d.name).transition().style('opacity',0).style('display','none')
                            })
                        mapCircle.append('i')
                            .classed('map-list-plus fa-solid fa-plus fa-2xs',true)
                            .attr('id',d => 'plus-'+d.name)
                            .style('color', color.text)
                            .style('pointer-events','none')
                            .style('padding-bottom','1px')
                            .style('display', d => !conceptNames.includes(d.name) && d.total_counts !== 0 ? 'block' : 'none')
                        mapCircle.append('i')
                            .classed('map-list-x fa-solid fa-x fa-2xs',true)
                            .style('color', 'white')
                            .attr('id',d => 'x-'+d.name)
                            .style('opacity', 0)
                            .style('display', 'none')
                            .style('padding-bottom','1px')
                            .style('pointer-events','none')
                        const mapTitleP = mapTitle.append('p')
                        mapTitleP.append('span')
                            .classed('map-title-name',true)
                            .attr('id', d => 'title-name-'+d.name)
                            .style("font-weight", d => d.name == sidebarRoot.name ? 700 : 400)
                            .style('color', d => conceptNames.includes(d.name) ? 'black' : color.textlight)
                            .html(d => d.data.concept.concept_name || d.data.concept.concept_id)
                            .style('padding-right', '4px')
                            .style('cursor','pointer')
                            .on('click', async (e,d) => {
                                const data = await getData(d.name)
                                setSidebarRoot({name:d.name,data:data})  
                                conceptHover(d.name, "leave") 
                            })
                            .on('mouseover', (e,d) => {
                                d3.select('#list-item-'+d.name).style('background-color',color.lightpurple).style('border','1px solid var(--lightpurple)')
                                d3.select('#title-name-'+d.name).style('font-weight',700)
                                if (!conceptNames.includes(d.name) && d.total_counts !== 0) {
                                    d3.select('#plus-'+d.name).transition().style('color', 'white')
                                    d3.select('#title-circle-'+d.name).transition().style('background-color', d => d.color).style('border',`1px solid ${d.color}`)  
                                    d3.select('#title-name-'+d.name).transition().style('color','black') 
                                    d3.select('#title-vocab-'+d.name).transition().style('color',color.textlight) 
                                    d3.select('#counts1-text-'+d.name).transition().style('color',color.text) 
                                    d3.select('#counts1-rect-'+d.name).transition().style('background-color',d.color)     
                                }
                                conceptHover(d.name, "enter")
                            })
                            .on('mouseout', (e,d) => {
                                if (d.name !== sidebarRoot.name) {
                                    d3.select('#list-item-'+d.name).style('background-color', d => conceptNames.includes(d.name) ? color.lightbackground : 'transparent').style('border', d => conceptNames.includes(d.name) ? '1px solid var(--lightbackground)' : '1px solid var(--background)')
                                    d3.select('#title-name-'+d.name).style('font-weight',400)
                                    if (!conceptNames.includes(d.name) && d.total_counts !== 0) {
                                        d3.select('#plus-'+d.name).transition().style('color', color.text)
                                        d3.select('#title-circle-'+d.name).transition().style('background-color', 'transparent').style('border','1px solid var(--textlight)')
                                        d3.select('#title-name-'+d.name).transition().style('color',color.textlight) 
                                        d3.select('#title-vocab-'+d.name).transition().style('color',color.textlightest)  
                                        d3.select('#counts1-text-'+d.name).transition().style('color',color.textlight) 
                                        d3.select('#counts1-rect-'+d.name).transition().style('background-color',color.textlightest) 
                                    }
                                }    
                                conceptHover(d.name, "leave")
                            })
                        mapTitleP.append('span')
                            .classed('map-title-vocab',true)
                            .attr('id', d => 'title-vocab-'+d.name)
                            .style('font-size', '10px')
                            .style('color', d => conceptNames.includes(d.name) ? color.textlight : color.textlightest)
                            .html(d => d.data.concept.vocabulary_id)
                            .style('margin-right', '12px') 
                        mapTitle.append('i')
                            .classed('map-info-icon fa-solid fa-circle-info',true)  
                            .attr('id', d => 'info-icon-'+d.name)  
                            .style('color', color.text)
                            .style('opacity', 0.2)
                            .style('cursor','pointer')
                            .style('margin-right','5px')
                            .on('mouseover', (e,d) => d3.select('#info-icon-'+d.name).style('opacity',1))
                            .on('mouseout', (e,d) => {
                                if (d3.select('#info-container-'+d.name).style('display') === 'none') d3.select('#info-icon-'+d.name).style('opacity',0.2)
                            })
                            .on('click', (e,d) => {
                                if (d3.select('#info-container-'+d.name).style('display') === 'flex') {
                                    d3.select('#info-icon-'+d.name).style('opacity',0.2)
                                    d3.select('#info-container-'+d.name).transition().style('height','0px').style('display','none')
                                    d3.select('#info-col1-'+d.name).transition().style('opacity',0)
                                    d3.select('#info-col2-'+d.name).transition().style('opacity',0)
                                } else {
                                    d3.select('#info-icon-'+d.name).style('opacity',1)
                                    d3.select('#info-container-'+d.name).transition().style('height','50px').style('display','flex')
                                    d3.select('#info-col1-'+d.name).transition().style('opacity',1)
                                    d3.select('#info-col2-'+d.name).transition().style('opacity',1)    
                                }
                                
                            })
                        const mapCountsContainer = mapTitleSection.append('div')
                            .classed('map-list-counts-container',true)
                            .attr('id', d => 'counts-container-'+d.name)
                        const mapCounts1 = mapCountsContainer.append('div')
                            .classed('map-list-counts',true)
                        mapCounts1.append('p')
                            .classed('map-counts1-text',true)
                            .attr('id', d => 'counts1-text-'+d.name)
                            .style('color', d => conceptNames.includes(d.name) ? d.total_counts > 0 ? color.text : color.textlight : color.textlight)
                            .html(d => d.total_counts + ' RC')
                        mapCounts1.append('div')
                            .classed('map-counts1-rect',true)
                            .attr('id', d => 'counts1-rect-'+d.name)
                            .style('height', '8px')
                            .style('width', d => scaleWidth(d.total_counts) + 'px')
                            .style('background-color', d => conceptNames.includes(d.name) ? d.color : color.textlightest)
                            .style('margin-left', '5px')
                            .style('border-radius', '20px')
                        const mapCounts2 = mapCountsContainer.append('div')
                            .classed('map-list-counts',true)
                        mapCounts2.append('p')
                            .classed('map-counts2-text',true)
                            .style('color', color.textlight)
                            .html(d => d.descendant_counts + ' DRC')
                        mapCounts2.append('div')
                            .classed('map-counts2-rect',true)
                            .style('height', '8px')
                            .style('width', d => scaleWidth(d.descendant_counts) + 'px')
                            .style('background-color', color.textlightest)
                            .style('margin-left', '5px')
                            .style('border-radius', '20px')
                        const mapInfoContainer = mapItem.append('div')
                            .classed('map-info-container',true)
                            .attr('id', d => 'info-container-'+d.name)
                        const mapInfoCol1 = mapInfoContainer.append('div')
                            .classed('map-info-col',true)
                            .attr('id', d => 'info-col1-'+d.name)
                        mapInfoCol1.append('p')
                            .html('Id')
                            .style("font-weight", 700)
                            .append('span')
                            .html(d => d.name)
                            .style('margin-left','8px')
                            .style('font-weight', 400)
                        mapInfoCol1.append('p')
                            .html('Code')
                            .style("font-weight", 700)
                            .append('span')
                            .html(d => d.data.concept.concept_code)
                            .style('margin-left','8px')
                            .style('font-weight', 400)
                        mapInfoCol1.append('p')
                            .html('Type')
                            .style("font-weight", 700)
                            .append('span')
                            .html(d => d.data.concept.standard_concept ? "Standard" : "Non standard")
                            .style('margin-left','8px')
                            .style('font-weight', 400)
                            .style('padding', '2px 5px 2px 5px')
                            .style('border', d => d.data.concept.standard_concept ? '1px solid black' : '1px dashed black')
                            .style('border-radius', '10px')
                        const mapInfoCol2 = mapInfoContainer.append('div')
                            .classed('map-info-col',true)
                            .attr('id', d => 'info-col2-'+d.name)
                            .style('margin-left', '20px')
                        mapInfoCol2.append('p')
                            .html('Domain')
                            .style("font-weight", 700)
                            .append('span')
                            .html(d => d.data.concept.domain_id)
                            .style('margin-left','8px')
                            .style('font-weight', 400)
                        mapInfoCol2.append('p')
                            .html('Class')
                            .style("font-weight", 700)
                            .append('span')
                            .html(d => d.data.concept.concept_class_id)
                            .style('margin-left','8px')
                            .style('font-weight', 400)
                        // mapInfoCol2.append('p')
                        //     .html('Validity')
                        //     .style("font-weight", 700)
                        //     .append('span')
                        //     .html(d => getValidity(d.data.concept.valid_end_date))
                        //     .style('margin-left','8px')
                        //     .style('font-weight', 400)    
                    }, update => {
                        update.select('.map-list-item')
                            .style('background-color', d => d.name !== sidebarRoot.name ? conceptNames.includes(d.name) ? color.lightbackground : 'transparent' : color.lightpurple)
                            .style('border', d => conceptNames.includes(d.name) ? d.name === sidebarRoot.name ? '1px solid var(--lightpurple)' : '1px solid var(--lightbackground)' : '1px solid var(--background)')
                            .style('border-radius', d => d.name !== sidebarRoot.name ? '20px' : '0px 0px 16px 16px')
                        update.select('.map-title-circle')
                            .style('background', d => {
                                if (!conceptNames.includes(d.name)) return "none"
                                else {
                                    if (!d.data.concept.standard_concept) {return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, "+ d.color + " 0.5px," + d.color + " 2px)"} 
                                    else {return "none"}    
                                }    
                            })
                            .style("background-color", d => {
                                if (!conceptNames.includes(d.name)) return "transparent"
                                else {
                                    if (d.data.concept.standard_concept) {return d.color} 
                                    else {return "transparent"}
                                }
                            }) 
                            .style('pointer-events', d => d.total_counts === 0 ? 'none' : 'all')
                            .style('border', d => d.total_counts === 0 ? '1px solid var(--textlightest)' : conceptNames.includes(d.name) ? `1px solid ${d.color}` : '1px solid var(--textlight)')
                            .on('click', (e,d) => {
                                d3.select('#x-'+d.name).transition().style('opacity',0).style('display','none')
                                if (d.total_counts !== 0) {
                                    if (conceptNames.includes(d.name)) {
                                        let filteredConcepts = selectedConcepts.filter(e => e.name !== d.name)
                                        setSelectedConcepts(filteredConcepts)   
                                    } else if (!conceptNames.includes(d.name)){
                                        addConcepts([d])
                                    }     
                                }    
                            })
                            .on('mouseover', (e,d) => {
                                if (!conceptNames.includes(d.name)) {
                                    d3.select('#plus-'+d.name).transition().style('color', 'white')
                                    d3.select('#title-circle-'+d.name).transition().style('background-color', d => d.color).style('border',`1px solid ${d.color}`) 
                                    d3.select('#title-name-'+d.name).transition().style('color','black')   
                                    d3.select('#title-vocab-'+d.name).transition().style('color',color.textlight) 
                                    d3.select('#counts1-text-'+d.name).transition().style('color',color.text) 
                                    d3.select('#counts1-rect-'+d.name).transition().style('background-color',d.color) 
                                } else  d3.select('#x-'+d.name).transition().style('opacity',1).style('display','block')
                            })
                            .on('mouseout', (e,d) => {
                                if (!conceptNames.includes(d.name)) {
                                    d3.select('#plus-'+d.name).transition().style('color', color.text)
                                    d3.select('#title-circle-'+d.name).transition().style('background-color', 'transparent').style('border','1px solid var(--textlight)')
                                    d3.select('#title-name-'+d.name).transition().style('color',color.textlight) 
                                    d3.select('#title-vocab-'+d.name).transition().style('color',color.textlightest)  
                                    d3.select('#counts1-text-'+d.name).transition().style('color',color.textlight) 
                                    d3.select('#counts1-rect-'+d.name).transition().style('background-color',color.textlightest)   
                                } else d3.select('#x-'+d.name).transition().style('opacity',0).style('display','none')
                            })
                        update.select('.map-list-plus')
                            .style('display', d => !conceptNames.includes(d.name) && d.total_counts !== 0 ? 'block' : 'none')
                        update.select('.map-title-name')
                            .style("font-weight", d => d.name == sidebarRoot.name ? 700 : 400)
                            .style('color', d => conceptNames.includes(d.name) ? 'black' : color.textlight)
                            .html(d => d.data.concept.concept_name)
                            .on('click', async (e,d) => {
                                const data = await getData(d.name)
                                setSidebarRoot({name:d.name,data:data})  
                                conceptHover(d.name, "leave") 
                            })
                            .on('mouseover', (e,d) => {
                                d3.select('#list-item-'+d.name).style('background-color',color.lightpurple).style('border','1px solid var(--lightpurple)')
                                d3.select('#title-name-'+d.name).style('font-weight',700)
                                if (!conceptNames.includes(d.name) && d.total_counts !== 0) {
                                    d3.select('#plus-'+d.name).transition().style('color', 'white')
                                    d3.select('#title-circle-'+d.name).transition().style('background-color', d => d.color).style('border',`1px solid ${d.color}`)  
                                    d3.select('#title-name-'+d.name).transition().style('color','black') 
                                    d3.select('#title-vocab-'+d.name).transition().style('color',color.textlight) 
                                    d3.select('#counts1-text-'+d.name).transition().style('color',color.text) 
                                    d3.select('#counts1-rect-'+d.name).transition().style('background-color',d.color)     
                                }
                                conceptHover(d.name, "enter")
                            })
                            .on('mouseout', (e,d) => {
                                if (d.name !== sidebarRoot.name) {
                                    d3.select('#list-item-'+d.name).style('background-color', d => conceptNames.includes(d.name) ? color.lightbackground : 'transparent').style('border', d => conceptNames.includes(d.name) ? '1px solid var(--lightbackground)' : '1px solid var(--background)')
                                    d3.select('#title-name-'+d.name).style('font-weight',400)
                                    if (!conceptNames.includes(d.name) && d.total_counts !== 0) {
                                        d3.select('#plus-'+d.name).transition().style('color', color.text)
                                        d3.select('#title-circle-'+d.name).transition().style('background-color', 'transparent').style('border','1px solid var(--textlight)')
                                        d3.select('#title-name-'+d.name).transition().style('color',color.textlight) 
                                        d3.select('#title-vocab-'+d.name).transition().style('color',color.textlightest)  
                                        d3.select('#counts1-text-'+d.name).transition().style('color',color.textlight) 
                                        d3.select('#counts1-rect-'+d.name).transition().style('background-color',color.textlightest) 
                                    }
                                }    
                                conceptHover(d.name, "leave")
                            })
                        update.select('.map-title-vocab')
                            .style('color', d => conceptNames.includes(d.name) ? color.textlight : color.textlightest)
                            .html(d => d.data.concept.vocabulary_id) 
                        update.select('.map-info-icon')
                            .on('mouseover', (e,d) => d3.select('#info-icon-'+d.name).style('opacity',1))
                            .on('mouseout', (e,d) => {
                                if (d3.select('#info-container-'+d.name).style('display') === 'none') d3.select('#info-icon-'+d.name).style('opacity',0.2)
                            })
                            .on('click', (e,d) => {
                                if (d3.select('#info-container-'+d.name).style('display') === 'flex') {
                                    d3.select('#info-icon-'+d.name).style('opacity',0.2)
                                    d3.select('#info-container-'+d.name).transition().style('height','0px').style('display','none')
                                    d3.select('#info-col1-'+d.name).transition().style('opacity',0)
                                    d3.select('#info-col2-'+d.name).transition().style('opacity',0)
                                } else {
                                    d3.select('#info-icon-'+d.name).style('opacity',1)
                                    d3.select('#info-container-'+d.name).transition().style('height','50px').style('display','flex')
                                    d3.select('#info-col1-'+d.name).transition().style('opacity',1)
                                    d3.select('#info-col2-'+d.name).transition().style('opacity',1)    
                                }
                                
                            })
                        update.select('.map-counts1-text')
                            .style('color', d => conceptNames.includes(d.name) ? d.total_counts > 0 ? color.text : color.textlight : color.textlight)
                            .html(d => d.total_counts + ' RC')
                        update.select('.map-counts1-rect')
                            .transition()
                            .style('width', d => scaleWidth(d.total_counts) + 'px')
                            .style('background-color', d => conceptNames.includes(d.name) ? d.color : color.textlightest)
                        update.select('.map-counts2-text')
                            .html(d => d.descendant_counts + ' DRC')
                        update.select('.map-counts2-rect')
                            .transition()
                            .style('width', d => scaleWidth(d.descendant_counts) + 'px')    
                    })
                }, update => {
                    update.select('.list-item')
                        .style('background-color', d => d.name !== sidebarRoot.name ? conceptNames.includes(d.name) ? color.lightbackground : 'transparent' : color.lightpurple)
                        .style('border', d => conceptNames.includes(d.name) ? d.name === sidebarRoot.name ? '1px solid var(--lightpurple)' : '1px solid var(--lightbackground)' : '1px solid var(--background)')
                        .style('border-radius', d => d.name !== sidebarRoot.name ? '20px' : '0px 0px 16px 16px')
                    update.select('.title-circle')
                        .style('background', d => {
                            if (!conceptNames.includes(d.name)) return "none"
                            else {
                                if (!d.data.concept.standard_concept) {return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, "+ d.color + " 0.5px," + d.color + " 2px)"} 
                                else {return "none"}    
                            }    
                        })
                        .style("background-color", d => {
                            if (!conceptNames.includes(d.name)) return "transparent"
                            else {
                                if (d.data.concept.standard_concept) {return d.color} 
                                else {return "transparent"}
                            }
                        }) 
                        .style('pointer-events', d => d.total_counts === 0 ? 'none' : 'all')
                        .style('border', d => d.total_counts === 0 ? '1px solid var(--textlightest)' : conceptNames.includes(d.name) ? `1px solid ${d.color}` : '1px solid var(--textlight)')
                        .on('click', (e,d) => {
                            d3.select('#x-'+d.name).transition().style('opacity',0).style('display','none')
                            if (d.total_counts !== 0) {
                                if (conceptNames.includes(d.name)) {
                                    let filteredConcepts = selectedConcepts.filter(e => e.name !== d.name)
                                    setSelectedConcepts(filteredConcepts)   
                                } else if (!conceptNames.includes(d.name)){
                                    addConcepts([d])
                                }     
                            }    
                        })
                        .on('mouseover', (e,d) => {
                            if (!conceptNames.includes(d.name)) {
                                d3.select('#plus-'+d.name).transition().style('color', 'white')
                                d3.select('#title-circle-'+d.name).transition().style('background-color', d => d.color).style('border',`1px solid ${d.color}`) 
                                d3.select('#title-name-'+d.name).transition().style('color','black')   
                                d3.select('#title-vocab-'+d.name).transition().style('color',color.textlight) 
                                d3.select('#counts1-text-'+d.name).transition().style('color',color.text) 
                                d3.select('#counts1-rect-'+d.name).transition().style('background-color',d.color) 
                            } else d3.select('#x-'+d.name).transition().style('opacity',1).style('display','block')
                        })
                        .on('mouseout', (e,d) => {
                            if (!conceptNames.includes(d.name)) {
                                d3.select('#plus-'+d.name).transition().style('color', color.text)
                                d3.select('#title-circle-'+d.name).transition().style('background-color', 'transparent').style('border','1px solid var(--textlight)')
                                d3.select('#title-name-'+d.name).transition().style('color',color.textlight) 
                                d3.select('#title-vocab-'+d.name).transition().style('color',color.textlightest)  
                                d3.select('#counts1-text-'+d.name).transition().style('color',color.textlight) 
                                d3.select('#counts1-rect-'+d.name).transition().style('background-color',color.textlightest)   
                            } else d3.select('#x-'+d.name).transition().style('opacity',0).style('display','none')
                        })
                    update.select('.list-plus')
                        .style('display', d => !conceptNames.includes(d.name) && d.total_counts !== 0 ? 'block' : 'none')
                    update.select('.title-name')
                        .style("font-weight", d => d.name == sidebarRoot.name ? 700 : 400)
                        .style('color', d => conceptNames.includes(d.name) ? 'black' : color.textlight)
                        .html(d => d.data.concept.concept_name || d.data.concept.concept_id)
                        .on('click', async (e,d) => {
                            const data = await getData(d.name)
                            setSidebarRoot({name:d.name,data:data})  
                            conceptHover(d.name, "leave") 
                        })
                        .on('mouseover', (e,d) => {
                            d3.select('#list-item-'+d.name).style('background-color',color.lightpurple).style('border','1px solid var(--lightpurple)')
                            d3.select('#title-name-'+d.name).style('font-weight',700)
                            if (!conceptNames.includes(d.name) && d.total_counts !== 0) {
                                d3.select('#plus-'+d.name).transition().style('color', 'white')
                                d3.select('#title-circle-'+d.name).transition().style('background-color', d => d.color).style('border',`1px solid ${d.color}`)  
                                d3.select('#title-name-'+d.name).transition().style('color','black') 
                                d3.select('#title-vocab-'+d.name).transition().style('color',color.textlight) 
                                d3.select('#counts1-text-'+d.name).transition().style('color',color.text) 
                                d3.select('#counts1-rect-'+d.name).transition().style('background-color',d.color)     
                            }
                            conceptHover(d.name, "enter")
                        })
                        .on('mouseout', (e,d) => {
                            if (d.name !== sidebarRoot.name) {
                                d3.select('#list-item-'+d.name).style('background-color', d => conceptNames.includes(d.name) ? color.lightbackground : 'transparent').style('border', d => conceptNames.includes(d.name) ? '1px solid var(--lightbackground)' : '1px solid var(--background)')
                                d3.select('#title-name-'+d.name).style('font-weight',400)
                                if (!conceptNames.includes(d.name) && d.total_counts !== 0) {
                                    d3.select('#plus-'+d.name).transition().style('color', color.text)
                                    d3.select('#title-circle-'+d.name).transition().style('background-color', 'transparent').style('border','1px solid var(--textlight)')
                                    d3.select('#title-name-'+d.name).transition().style('color',color.textlight) 
                                    d3.select('#title-vocab-'+d.name).transition().style('color',color.textlightest)  
                                    d3.select('#counts1-text-'+d.name).transition().style('color',color.textlight) 
                                    d3.select('#counts1-rect-'+d.name).transition().style('background-color',color.textlightest) 
                                }
                            }    
                            conceptHover(d.name, "leave")
                        })
                    update.select('.title-vocab')
                        .style('color', d => conceptNames.includes(d.name) ? color.textlight : color.textlightest)
                        .html(d => d.data.concept.vocabulary_id)
                    update.select('.title-level')
                        .style('color', d => conceptNames.includes(d.name) ? color.text : color.textlight)
                        .html(d => d.levels)  
                    update.select('.info-icon')
                        .on('mouseover', (e,d) => d3.select('#info-icon-'+d.name).style('opacity',1))
                        .on('mouseout', (e,d) => {
                            if (d3.select('#info-container-'+d.name).style('display') === 'none') d3.select('#info-icon-'+d.name).style('opacity',0.2)
                        })
                        .on('click', (e,d) => {
                            if (d3.select('#info-container-'+d.name).style('display') === 'flex') {
                                d3.select('#info-icon-'+d.name).style('opacity',0.2)
                                d3.select('#info-container-'+d.name).transition().style('height','0px').style('display','none')
                                d3.select('#info-col1-'+d.name).transition().style('opacity',0)
                                d3.select('#info-col2-'+d.name).transition().style('opacity',0)
                            } else {
                                d3.select('#info-icon-'+d.name).style('opacity',1)
                                d3.select('#info-container-'+d.name).transition().style('height','50px').style('display','flex')
                                d3.select('#info-col1-'+d.name).transition().style('opacity',1)
                                d3.select('#info-col2-'+d.name).transition().style('opacity',1)    
                            }
                            
                        })
                    update.select('.title-caret-down')
                        .style('display', d => !treeSelections.includes('mappings') ? d.mappings.length > 0 ? 'block' : 'none' : 'none')
                        .on('click', (e,d) => {
                            if (d3.select('#caret-down-'+d.name).style('display') === 'block') {
                                d3.select('#caret-down-'+d.name).style('display','none')  
                                d3.select('#caret-up-'+d.name).style('display','block') 
                                d3.select('#mappings-container-'+d.name).transition().style('height','auto').style('display','flex')
                            }
                        })
                        .on('mouseover', (e,d) => d3.select('#caret-down-'+d.name).style('opacity',1))
                        .on('mouseout', (e,d) => d3.select('#caret-down-'+d.name).style('opacity',0.2))
                    update.select('.title-caret-up')
                        .style('display', d => treeSelections.includes('mappings') && d.mappings.length > 0 ? 'block' : 'none')
                        .on('click', (e,d) => {
                            if (d3.select('#caret-up-'+d.name).style('display') === 'block') {
                                d3.select('#caret-up-'+d.name).style('display','none')  
                                d3.select('#caret-down-'+d.name).style('display','block') 
                                d3.select('#mappings-container-'+d.name).transition().style('height','0px').style('display','none')
                            }
                        })
                    update.select('.counts1-text')
                        .style('color', d => conceptNames.includes(d.name) ? d.total_counts > 0 ? color.text : color.textlight : color.textlight)
                        .html(d => d.total_counts + ' RC')
                    update.select('.counts1-rect')
                        .transition()
                        .style('width', d => scaleWidth(d.total_counts) + 'px')
                        .style('background-color', d => conceptNames.includes(d.name) ? d.color : color.textlightest)
                    update.select('.counts2-text')
                        .html(d => d.descendant_counts + ' DRC')
                    update.select('.counts2-rect')
                        .transition()
                        .style('width', d => scaleWidth(d.descendant_counts) + 'px')
                    update.select(".mappings-container")
                        .style('height', d => treeSelections.includes('mappings') && d.mappings.length > 0 ? 'auto' : '0px')
                        .style('display', d => treeSelections.includes('mappings') && d.mappings.length > 0 ? 'flex' : 'none')
                    // MAPPINGS
                    update.select('.mappings-container').selectAll(".map-list-item-container").data(d => d.mappings, d => d.name)
                    .join(enter => {
                        const mapItemContainer = enter.append('div')
                            .classed('map-list-item-container',true)
                        const mapItem = mapItemContainer.append('div')
                            .classed('map-list-item',true)
                            .attr('id', d => 'list-item-'+d.name)
                            .style('margin-bottom', '4px')
                            .style('background-color', d => d.name !== sidebarRoot.name ? conceptNames.includes(d.name) ? color.lightbackground : 'transparent' : color.lightpurple)
                            .style('border', d => conceptNames.includes(d.name) ? d.name === sidebarRoot.name ? '1px solid var(--lightpurple)' : '1px solid var(--lightbackground)' : '1px solid var(--background)')
                            .style('border-radius', d => d.name !== sidebarRoot.name ? '20px' : '0px 0px 16px 16px')
                        const mapTitleSection = mapItem.append('div')
                            .classed('map-title-section',true)
                        const mapTitle = mapTitleSection.append('div')
                            .classed('map-item-title',true)
                            .attr('id', d => 'item-title-' + d.name)
                        const mapCircle = mapTitle.append('div')
                            .classed('map-title-circle',true)
                            .attr('id', d => 'title-circle-'+d.name)
                            .style('flex-shrink',0)
                            .style('width', '14px')
                            .style('height', '14px')
                            .style('pointer-events', d => d.total_counts === 0 ? 'none' : 'all')
                            .style('border', d => d.total_counts === 0 ? '1px solid var(--textlightest)' : conceptNames.includes(d.name) ? `1px solid ${d.color}` : '1px solid var(--textlight)')
                            .style('cursor','pointer')
                            .style('background', d => {
                                if (!conceptNames.includes(d.name)) return "none"
                                else {
                                    if (!d.data.concept.standard_concept) {return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, "+ d.color + " 0.5px," + d.color + " 2px)"} 
                                    else {return "none"}    
                                }    
                            })
                            .style("background-color", d => {
                                if (!conceptNames.includes(d.name)) return "transparent"
                                else {
                                    if (d.data.concept.standard_concept) {return d.color} 
                                    else {return "transparent"}
                                }
                            }) 
                            .style('border-radius', '50%')
                            .style('margin-right', '5px')
                            .on('click', (e,d) => {
                                d3.select('#x-'+d.name).transition().style('opacity',0).style('display','none')
                                if (d.total_counts !== 0) {
                                    if (conceptNames.includes(d.name)) {
                                        let filteredConcepts = selectedConcepts.filter(e => e.name !== d.name)
                                        setSelectedConcepts(filteredConcepts)   
                                    } else if (!conceptNames.includes(d.name)){
                                        addConcepts([d])
                                    }     
                                }    
                            })
                            .on('mouseover', (e,d) => {
                                if (!conceptNames.includes(d.name)) {
                                    d3.select('#plus-'+d.name).transition().style('color', 'white')
                                    d3.select('#title-circle-'+d.name).transition().style('background-color', d => d.color).style('border',`1px solid ${d.color}`) 
                                    d3.select('#title-name-'+d.name).transition().style('color','black')   
                                    d3.select('#title-vocab-'+d.name).transition().style('color',color.textlight) 
                                    d3.select('#counts1-text-'+d.name).transition().style('color',color.text) 
                                    d3.select('#counts1-rect-'+d.name).transition().style('background-color',d.color) 
                                } else d3.select('#x-'+d.name).transition().style('opacity',1).style('display','block')
                            })
                            .on('mouseout', (e,d) => {
                                if (!conceptNames.includes(d.name)) {
                                    d3.select('#plus-'+d.name).transition().style('color', color.text)
                                    d3.select('#title-circle-'+d.name).transition().style('background-color', 'transparent').style('border','1px solid var(--textlight)')
                                    d3.select('#title-name-'+d.name).transition().style('color',color.textlight) 
                                    d3.select('#title-vocab-'+d.name).transition().style('color',color.textlightest)  
                                    d3.select('#counts1-text-'+d.name).transition().style('color',color.textlight) 
                                    d3.select('#counts1-rect-'+d.name).transition().style('background-color',color.textlightest)   
                                } else d3.select('#x-'+d.name).transition().style('opacity',0).style('display','none')
                            })
                        mapCircle.append('i')
                            .classed('map-list-plus fa-solid fa-plus fa-2xs',true)
                            .attr('id',d => 'plus-'+d.name)
                            .style('color', color.text)
                            .style('pointer-events','none')
                            .style('padding-bottom','1px')
                            .style('display', d => !conceptNames.includes(d.name) && d.total_counts !== 0 ? 'block' : 'none')
                        mapCircle.append('i')
                            .classed('map-list-x fa-solid fa-x fa-2xs',true)
                            .style('color', 'white')
                            .attr('id',d => 'x-'+d.name)
                            .style('opacity', 0)
                            .style('display', 'none')
                            .style('padding-bottom','1px')
                            .style('pointer-events','none')
                        const mapTitleP = mapTitle.append('p')
                        mapTitleP.append('span')
                            .classed('map-title-name',true)
                            .attr('id', d => 'title-name-'+d.name)
                            .style("font-weight", d => d.name == sidebarRoot.name ? 700 : 400)
                            .style('color', d => conceptNames.includes(d.name) ? 'black' : color.textlight)
                            .html(d => d.data.concept.concept_name || d.data.concept.concept_id)
                            .style('padding-right', '4px')
                            .style('cursor','pointer')
                            .on('click', async (e,d) => {
                                const data = await getData(d.name)
                                setSidebarRoot({name:d.name,data:data})  
                                conceptHover(d.name, "leave") 
                            })
                            .on('mouseover', (e,d) => {
                                d3.select('#list-item-'+d.name).style('background-color',color.lightpurple).style('border','1px solid var(--lightpurple)')
                                d3.select('#title-name-'+d.name).style('font-weight',700)
                                if (!conceptNames.includes(d.name) && d.total_counts !== 0) {
                                    d3.select('#plus-'+d.name).transition().style('color', 'white')
                                    d3.select('#title-circle-'+d.name).transition().style('background-color', d => d.color).style('border',`1px solid ${d.color}`)  
                                    d3.select('#title-name-'+d.name).transition().style('color','black') 
                                    d3.select('#title-vocab-'+d.name).transition().style('color',color.textlight) 
                                    d3.select('#counts1-text-'+d.name).transition().style('color',color.text) 
                                    d3.select('#counts1-rect-'+d.name).transition().style('background-color',d.color)     
                                }
                                conceptHover(d.name, "enter")
                            })
                            .on('mouseout', (e,d) => {
                                if (d.name !== sidebarRoot.name) {
                                    d3.select('#list-item-'+d.name).style('background-color', d => conceptNames.includes(d.name) ? color.lightbackground : 'transparent').style('border', d => conceptNames.includes(d.name) ? '1px solid var(--lightbackground)' : '1px solid var(--background)')
                                    d3.select('#title-name-'+d.name).style('font-weight',400)
                                    if (!conceptNames.includes(d.name) && d.total_counts !== 0) {
                                        d3.select('#plus-'+d.name).transition().style('color', color.text)
                                        d3.select('#title-circle-'+d.name).transition().style('background-color', 'transparent').style('border','1px solid var(--textlight)')
                                        d3.select('#title-name-'+d.name).transition().style('color',color.textlight) 
                                        d3.select('#title-vocab-'+d.name).transition().style('color',color.textlightest)  
                                        d3.select('#counts1-text-'+d.name).transition().style('color',color.textlight) 
                                        d3.select('#counts1-rect-'+d.name).transition().style('background-color',color.textlightest) 
                                    }
                                }    
                                conceptHover(d.name, "leave")
                            })
                        mapTitleP.append('span')
                            .classed('map-title-vocab',true)
                            .attr('id', d => 'title-vocab-'+d.name)
                            .style('font-size', '10px')
                            .style('color', d => conceptNames.includes(d.name) ? color.textlight : color.textlightest)
                            .html(d => d.data.concept.vocabulary_id)
                            .style('margin-right', '12px') 
                        mapTitle.append('i')
                            .classed('map-info-icon fa-solid fa-circle-info',true)  
                            .attr('id', d => 'info-icon-'+d.name)  
                            .style('color', color.text)
                            .style('opacity', 0.2)
                            .style('cursor','pointer')
                            .style('margin-right','5px')
                            .on('mouseover', (e,d) => d3.select('#info-icon-'+d.name).style('opacity',1))
                            .on('mouseout', (e,d) => {
                                if (d3.select('#info-container-'+d.name).style('display') === 'none') d3.select('#info-icon-'+d.name).style('opacity',0.2)
                            })
                            .on('click', (e,d) => {
                                if (d3.select('#info-container-'+d.name).style('display') === 'flex') {
                                    d3.select('#info-icon-'+d.name).style('opacity',0.2)
                                    d3.select('#info-container-'+d.name).transition().style('height','0px').style('display','none')
                                    d3.select('#info-col1-'+d.name).transition().style('opacity',0)
                                    d3.select('#info-col2-'+d.name).transition().style('opacity',0)
                                } else {
                                    d3.select('#info-icon-'+d.name).style('opacity',1)
                                    d3.select('#info-container-'+d.name).transition().style('height','50px').style('display','flex')
                                    d3.select('#info-col1-'+d.name).transition().style('opacity',1)
                                    d3.select('#info-col2-'+d.name).transition().style('opacity',1)    
                                }
                                
                            })
                        const mapCountsContainer = mapTitleSection.append('div')
                            .classed('map-list-counts-container',true)
                            .attr('id', d => 'counts-container-'+d.name)
                        const mapCounts1 = mapCountsContainer.append('div')
                            .classed('map-list-counts',true)
                        mapCounts1.append('p')
                            .classed('map-counts1-text',true)
                            .attr('id', d => 'counts1-text-'+d.name)
                            .style('color', d => conceptNames.includes(d.name) ? d.total_counts > 0 ? color.text : color.textlight : color.textlight)
                            .html(d => d.total_counts + ' RC')
                        mapCounts1.append('div')
                            .classed('map-counts1-rect',true)
                            .attr('id', d => 'counts1-rect-'+d.name)
                            .style('height', '8px')
                            .style('width', d => scaleWidth(d.total_counts) + 'px')
                            .style('background-color', d => conceptNames.includes(d.name) ? d.color : color.textlightest)
                            .style('margin-left', '5px')
                            .style('border-radius', '20px')
                        const mapCounts2 = mapCountsContainer.append('div')
                            .classed('map-list-counts',true)
                        mapCounts2.append('p')
                            .classed('map-counts2-text',true)
                            .style('color', color.textlight)
                            .html(d => d.descendant_counts + ' DRC')
                        mapCounts2.append('div')
                            .classed('map-counts2-rect',true)
                            .style('height', '8px')
                            .style('width', d => scaleWidth(d.descendant_counts) + 'px')
                            .style('background-color', color.textlightest)
                            .style('margin-left', '5px')
                            .style('border-radius', '20px')
                        const mapInfoContainer = mapItem.append('div')
                            .classed('map-info-container',true)
                            .attr('id', d => 'info-container-'+d.name)
                        const mapInfoCol1 = mapInfoContainer.append('div')
                            .classed('map-info-col',true)
                            .attr('id', d => 'info-col1-'+d.name)
                        mapInfoCol1.append('p')
                            .html('Id')
                            .style("font-weight", 700)
                            .append('span')
                            .html(d => d.name)
                            .style('margin-left','8px')
                            .style('font-weight', 400)
                        mapInfoCol1.append('p')
                            .html('Code')
                            .style("font-weight", 700)
                            .append('span')
                            .html(d => d.data.concept.concept_code)
                            .style('margin-left','8px')
                            .style('font-weight', 400)
                        mapInfoCol1.append('p')
                            .html('Type')
                            .style("font-weight", 700)
                            .append('span')
                            .html(d => d.data.concept.standard_concept ? "Standard" : "Non standard")
                            .style('margin-left','8px')
                            .style('font-weight', 400)
                            .style('padding', '2px 5px 2px 5px')
                            .style('border', d => d.data.concept.standard_concept ? '1px solid black' : '1px dashed black')
                            .style('border-radius', '10px')
                        const mapInfoCol2 = mapInfoContainer.append('div')
                            .classed('map-info-col',true)
                            .attr('id', d => 'info-col2-'+d.name)
                            .style('margin-left', '20px')
                        mapInfoCol2.append('p')
                            .html('Domain')
                            .style("font-weight", 700)
                            .append('span')
                            .html(d => d.data.concept.domain_id)
                            .style('margin-left','8px')
                            .style('font-weight', 400)
                        mapInfoCol2.append('p')
                            .html('Class')
                            .style("font-weight", 700)
                            .append('span')
                            .html(d => d.data.concept.concept_class_id)
                            .style('margin-left','8px')
                            .style('font-weight', 400)
                        // mapInfoCol2.append('p')
                        //     .html('Validity')
                        //     .style("font-weight", 700)
                        //     .append('span')
                        //     .html(d => getValidity(d.data.concept.valid_end_date))
                        //     .style('margin-left','8px')
                        //     .style('font-weight', 400)    
                    }, update => {
                        update.select('.map-list-item')
                            .style('background-color', d => d.name !== sidebarRoot.name ? conceptNames.includes(d.name) ? color.lightbackground : 'transparent' : color.lightpurple)
                            .style('border', d => conceptNames.includes(d.name) ? d.name === sidebarRoot.name ? '1px solid var(--lightpurple)' : '1px solid var(--lightbackground)' : '1px solid var(--background)')
                            .style('border-radius', d => d.name !== sidebarRoot.name ? '20px' : '0px 0px 16px 16px')
                        update.select('.map-title-circle')
                            .style('background', d => {
                                if (!conceptNames.includes(d.name)) return "none"
                                else {
                                    if (!d.data.concept.standard_concept) {return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, "+ d.color + " 0.5px," + d.color + " 2px)"} 
                                    else {return "none"}    
                                }    
                            })
                            .style("background-color", d => {
                                if (!conceptNames.includes(d.name)) return "transparent"
                                else {
                                    if (d.data.concept.standard_concept) {return d.color} 
                                    else {return "transparent"}
                                }
                            }) 
                            .style('pointer-events', d => d.total_counts === 0 ? 'none' : 'all')
                            .style('border', d => d.total_counts === 0 ? '1px solid var(--textlightest)' : conceptNames.includes(d.name) ? `1px solid ${d.color}` : '1px solid var(--textlight)')
                            .on('click', (e,d) => {
                                d3.select('#x-'+d.name).transition().style('opacity',0).style('display','none')
                                if (d.total_counts !== 0) {
                                    if (conceptNames.includes(d.name)) {
                                        let filteredConcepts = selectedConcepts.filter(e => e.name !== d.name)
                                        setSelectedConcepts(filteredConcepts)   
                                    } else if (!conceptNames.includes(d.name)){
                                        addConcepts([d])
                                    }     
                                }    
                            })
                            .on('mouseover', (e,d) => {
                                if (!conceptNames.includes(d.name)) {
                                    d3.select('#plus-'+d.name).transition().style('color', 'white')
                                    d3.select('#title-circle-'+d.name).transition().style('background-color', d => d.color).style('border',`1px solid ${d.color}`) 
                                    d3.select('#title-name-'+d.name).transition().style('color','black')   
                                    d3.select('#title-vocab-'+d.name).transition().style('color',color.textlight) 
                                    d3.select('#counts1-text-'+d.name).transition().style('color',color.text) 
                                    d3.select('#counts1-rect-'+d.name).transition().style('background-color',d.color) 
                                } else d3.select('#x-'+d.name).transition().style('opacity',1).style('display','block')
                            })
                            .on('mouseout', (e,d) => {
                                if (!conceptNames.includes(d.name)) {
                                    d3.select('#plus-'+d.name).transition().style('color', color.text)
                                    d3.select('#title-circle-'+d.name).transition().style('background-color', 'transparent').style('border','1px solid var(--textlight)')
                                    d3.select('#title-name-'+d.name).transition().style('color',color.textlight) 
                                    d3.select('#title-vocab-'+d.name).transition().style('color',color.textlightest)  
                                    d3.select('#counts1-text-'+d.name).transition().style('color',color.textlight) 
                                    d3.select('#counts1-rect-'+d.name).transition().style('background-color',color.textlightest)   
                                } else d3.select('#x-'+d.name).transition().style('opacity',0).style('display','none')
                            })
                        update.select('.map-list-plus')
                            .style('display', d => !conceptNames.includes(d.name) && d.total_counts !== 0 ? 'block' : 'none')
                        update.select('.map-title-name')
                            .style("font-weight", d => d.name == sidebarRoot.name ? 700 : 400)
                            .style('color', d => conceptNames.includes(d.name) ? 'black' : color.textlight)
                            .html(d => d.data.concept.concept_name)
                            .on('click', async (e,d) => {
                                const data = await getData(d.name)
                                setSidebarRoot({name:d.name,data:data})  
                                conceptHover(d.name, "leave") 
                            })
                            .on('mouseover', (e,d) => {
                                d3.select('#list-item-'+d.name).style('background-color',color.lightpurple).style('border','1px solid var(--lightpurple)')
                                d3.select('#title-name-'+d.name).style('font-weight',700)
                                if (!conceptNames.includes(d.name) && d.total_counts !== 0) {
                                    d3.select('#plus-'+d.name).transition().style('color', 'white')
                                    d3.select('#title-circle-'+d.name).transition().style('background-color', d => d.color).style('border',`1px solid ${d.color}`)  
                                    d3.select('#title-name-'+d.name).transition().style('color','black') 
                                    d3.select('#title-vocab-'+d.name).transition().style('color',color.textlight) 
                                    d3.select('#counts1-text-'+d.name).transition().style('color',color.text) 
                                    d3.select('#counts1-rect-'+d.name).transition().style('background-color',d.color)     
                                }
                                conceptHover(d.name, "enter")
                            })
                            .on('mouseout', (e,d) => {
                                if (d.name !== sidebarRoot.name) {
                                    d3.select('#list-item-'+d.name).style('background-color', d => conceptNames.includes(d.name) ? color.lightbackground : 'transparent').style('border', d => conceptNames.includes(d.name) ? '1px solid var(--lightbackground)' : '1px solid var(--background)')
                                    d3.select('#title-name-'+d.name).style('font-weight',400)
                                    if (!conceptNames.includes(d.name) && d.total_counts !== 0) {
                                        d3.select('#plus-'+d.name).transition().style('color', color.text)
                                        d3.select('#title-circle-'+d.name).transition().style('background-color', 'transparent').style('border','1px solid var(--textlight)')
                                        d3.select('#title-name-'+d.name).transition().style('color',color.textlight) 
                                        d3.select('#title-vocab-'+d.name).transition().style('color',color.textlightest)  
                                        d3.select('#counts1-text-'+d.name).transition().style('color',color.textlight) 
                                        d3.select('#counts1-rect-'+d.name).transition().style('background-color',color.textlightest) 
                                    }
                                }    
                                conceptHover(d.name, "leave")
                            })
                        update.select('.map-title-vocab')
                            .style('color', d => conceptNames.includes(d.name) ? color.textlight : color.textlightest)
                            .html(d => d.data.concept.vocabulary_id) 
                        update.select('.map-info-icon')
                            .on('mouseover', (e,d) => d3.select('#info-icon-'+d.name).style('opacity',1))
                            .on('mouseout', (e,d) => {
                                if (d3.select('#info-container-'+d.name).style('display') === 'none') d3.select('#info-icon-'+d.name).style('opacity',0.2)
                            })
                            .on('click', (e,d) => {
                                if (d3.select('#info-container-'+d.name).style('display') === 'flex') {
                                    d3.select('#info-icon-'+d.name).style('opacity',0.2)
                                    d3.select('#info-container-'+d.name).transition().style('height','0px').style('display','none')
                                    d3.select('#info-col1-'+d.name).transition().style('opacity',0)
                                    d3.select('#info-col2-'+d.name).transition().style('opacity',0)
                                } else {
                                    d3.select('#info-icon-'+d.name).style('opacity',1)
                                    d3.select('#info-container-'+d.name).transition().style('height','50px').style('display','flex')
                                    d3.select('#info-col1-'+d.name).transition().style('opacity',1)
                                    d3.select('#info-col2-'+d.name).transition().style('opacity',1)    
                                }
                                
                            })
                        update.select('.map-counts1-text')
                            .style('color', d => conceptNames.includes(d.name) ? d.total_counts > 0 ? color.text : color.textlight : color.textlight)
                            .html(d => d.total_counts + ' RC')
                        update.select('.map-counts1-rect')
                            .transition()
                            .style('width', d => scaleWidth(d.total_counts) + 'px')
                            .style('background-color', d => conceptNames.includes(d.name) ? d.color : color.textlightest)
                        update.select('.map-counts2-text')
                            .html(d => d.descendant_counts + ' DRC')
                        update.select('.map-counts2-rect')
                            .transition()
                            .style('width', d => scaleWidth(d.descendant_counts) + 'px')    
                    })
                })
            },update => {
                // CONCEPT LIST
                update.selectAll(".list-item-container").data(d => d.nodes, d => d.name)
                .join(enter => {
                    const itemContainer = enter.append('div')
                        .classed('list-item-container',true)
                    const item = itemContainer.append('div')
                        .classed('list-item',true)
                        .attr('id', d => 'list-item-'+d.name)
                        .style('margin-bottom', '4px')
                        .style('background-color', d => d.name !== sidebarRoot.name ? conceptNames.includes(d.name) ? color.lightbackground : 'transparent' : color.lightpurple)
                        .style('border', d => conceptNames.includes(d.name) ? d.name === sidebarRoot.name ? '1px solid var(--lightpurple)' : '1px solid var(--lightbackground)' : '1px solid var(--background)')
                        .style('border-radius', d => d.name !== sidebarRoot.name ? '20px' : '0px 0px 16px 16px')
                    const titleSection = item.append('div')
                        .classed('title-section',true)
                    const title = titleSection.append('div')
                        .classed('item-title',true)
                        .attr('id', d => 'item-title-' + d.name)
                    const circle = title.append('div')
                        .classed('title-circle',true)
                        .attr('id', d => 'title-circle-'+d.name)
                        .style('flex-shrink',0)
                        .style('width', '14px')
                        .style('height', '14px')
                        .style('cursor','pointer')
                        .style('pointer-events', d => d.total_counts === 0 ? 'none' : 'all')
                        .style('background', d => {
                            if (!conceptNames.includes(d.name)) return "none"
                            else {
                                if (!d.data.concept.standard_concept) {return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, "+ d.color + " 0.5px," + d.color + " 2px)"} 
                                else {return "none"}    
                            }    
                        })
                        .style("background-color", d => {
                            if (!conceptNames.includes(d.name)) return "transparent"
                            else {
                                if (d.data.concept.standard_concept) {return d.color} 
                                else {return "transparent"}
                            }
                        }) 
                        .style('border', d => d.total_counts === 0 ? '1px solid var(--textlightest)' : conceptNames.includes(d.name) ? `1px solid ${d.color}` : '1px solid var(--textlight)')
                        .style('border-radius', '50%')
                        .style('margin-right', '5px')
                        .on('click', (e,d) => {
                            d3.select('#x-'+d.name).transition().style('opacity',0).style('display','none')
                            if (d.total_counts !== 0) {
                                if (conceptNames.includes(d.name)) {
                                    let filteredConcepts = selectedConcepts.filter(e => e.name !== d.name)
                                    setSelectedConcepts(filteredConcepts)   
                                } else if (!conceptNames.includes(d.name)){
                                    addConcepts([d])
                                }     
                            }    
                        })
                        .on('mouseover', (e,d) => {
                            if (!conceptNames.includes(d.name)) {
                                d3.select('#plus-'+d.name).transition().style('color', 'white')
                                d3.select('#title-circle-'+d.name).transition().style('background-color', d => d.color).style('border',`1px solid ${d.color}`) 
                                d3.select('#title-name-'+d.name).transition().style('color','black')   
                                d3.select('#title-vocab-'+d.name).transition().style('color',color.textlight) 
                                d3.select('#counts1-text-'+d.name).transition().style('color',color.text) 
                                d3.select('#counts1-rect-'+d.name).transition().style('background-color',d.color) 
                            } else d3.select('#x-'+d.name).transition().style('opacity',1).style('display','block') 
                        })
                        .on('mouseout', (e,d) => {
                            if (!conceptNames.includes(d.name)) {
                                d3.select('#plus-'+d.name).transition().style('color', color.text)
                                d3.select('#title-circle-'+d.name).transition().style('background-color', 'transparent').style('border','1px solid var(--textlight)')
                                d3.select('#title-name-'+d.name).transition().style('color',color.textlight) 
                                d3.select('#title-vocab-'+d.name).transition().style('color',color.textlightest)  
                                d3.select('#counts1-text-'+d.name).transition().style('color',color.textlight) 
                                d3.select('#counts1-rect-'+d.name).transition().style('background-color',color.textlightest)   
                            } else d3.select('#x-'+d.name).transition().style('opacity',0).style('display','none')
                        })
                    circle.append('i')
                        .classed('list-plus fa-solid fa-plus fa-2xs',true)
                        .attr('id',d => 'plus-'+d.name)
                        .style('color', color.text)
                        .style('pointer-events','none')
                        .style('padding-bottom','1px')
                        .style('display', d => !conceptNames.includes(d.name) && d.total_counts !== 0 ? 'block' : 'none')
                    circle.append('i')
                        .classed('list-x fa-solid fa-x fa-2xs',true)
                        .style('color', 'white')
                        .attr('id',d => 'x-'+d.name)
                        .style('opacity', 0)
                        .style('display', 'none')
                        .style('padding-bottom','1px')
                        .style('pointer-events','none')
                    const titleP = title.append('p')
                    titleP.append('span')
                        .classed('title-name',true)
                        .attr('id', d => 'title-name-'+d.name)
                        .style("font-weight", d => d.name == sidebarRoot.name ? 700 : 400)
                        .style('color', d => conceptNames.includes(d.name) ? 'black' : color.textlight)
                        .html(d => d.data.concept.concept_name)
                        .style('padding-right', '4px')
                        .style('cursor','pointer')
                        .on('click', async (e,d) => {
                            const data = await getData(d.name)
                            setSidebarRoot({name:d.name,data:data})  
                            conceptHover(d.name, "leave") 
                        })
                        .on('mouseover', (e,d) => {
                            d3.select('#list-item-'+d.name).style('background-color',color.lightpurple).style('border','1px solid var(--lightpurple)')
                            d3.select('#title-name-'+d.name).style('font-weight',700)
                            if (!conceptNames.includes(d.name) && d.total_counts !== 0) {
                                d3.select('#plus-'+d.name).transition().style('color', 'white')
                                d3.select('#title-circle-'+d.name).transition().style('background-color', d => d.color).style('border',`1px solid ${d.color}`)  
                                d3.select('#title-name-'+d.name).transition().style('color','black') 
                                d3.select('#title-vocab-'+d.name).transition().style('color',color.textlight) 
                                d3.select('#counts1-text-'+d.name).transition().style('color',color.text) 
                                d3.select('#counts1-rect-'+d.name).transition().style('background-color',d.color)     
                            }
                            conceptHover(d.name, "enter")
                        })
                        .on('mouseout', (e,d) => {
                            if (d.name !== sidebarRoot.name) {
                                d3.select('#list-item-'+d.name).style('background-color', d => conceptNames.includes(d.name) ? color.lightbackground : 'transparent').style('border', d => conceptNames.includes(d.name) ? '1px solid var(--lightbackground)' : '1px solid var(--background)')
                                d3.select('#title-name-'+d.name).style('font-weight',400)
                                if (!conceptNames.includes(d.name) && d.total_counts !== 0) {
                                    d3.select('#plus-'+d.name).transition().style('color', color.text)
                                    d3.select('#title-circle-'+d.name).transition().style('background-color', 'transparent').style('border','1px solid var(--textlight)')
                                    d3.select('#title-name-'+d.name).transition().style('color',color.textlight) 
                                    d3.select('#title-vocab-'+d.name).transition().style('color',color.textlightest)  
                                    d3.select('#counts1-text-'+d.name).transition().style('color',color.textlight) 
                                    d3.select('#counts1-rect-'+d.name).transition().style('background-color',color.textlightest) 
                                }
                            }    
                            conceptHover(d.name, "leave")
                        })
                    titleP.append('span')
                        .classed('title-vocab',true)
                        .attr('id', d => 'title-vocab-'+d.name)
                        .style('font-size', '10px')
                        .style('color', d => conceptNames.includes(d.name) ? color.textlight : color.textlightest)
                        .html(d => d.data.concept.vocabulary_id)
                        .style('margin-right','5px')
                    titleP.append('span')
                        .classed('title-level',true)
                        .attr('id', d => 'title-level-'+d.name)
                        .style('font-size', '10px')
                        .style('font-weight',700)
                        .style('color', d => conceptNames.includes(d.name) ? color.text : color.textlight)
                        .style('margin-right', '12px')
                        .html(d => d.levels)    
                    title.append('i')
                        .classed('info-icon fa-solid fa-circle-info',true)  
                        .attr('id', d => 'info-icon-'+d.name)  
                        .style('color', color.text)
                        .style('opacity', 0.2)
                        .style('cursor','pointer')
                        .style('margin-right','2px')
                        .on('mouseover', (e,d) => d3.select('#info-icon-'+d.name).style('opacity',1))
                        .on('mouseout', (e,d) => {
                            if (d3.select('#info-container-'+d.name).style('display') === 'none') d3.select('#info-icon-'+d.name).style('opacity',0.2)
                        })
                        .on('click', (e,d) => {
                            if (d3.select('#info-container-'+d.name).style('display') === 'flex') {
                                d3.select('#info-icon-'+d.name).style('opacity',0.2)
                                d3.select('#info-container-'+d.name).transition().style('height','0px').style('display','none')
                                d3.select('#info-col1-'+d.name).transition().style('opacity',0)
                                d3.select('#info-col2-'+d.name).transition().style('opacity',0)
                            } else {
                                d3.select('#info-icon-'+d.name).style('opacity',1)
                                d3.select('#info-container-'+d.name).transition().style('height','50px').style('display','flex')
                                d3.select('#info-col1-'+d.name).transition().style('opacity',1)
                                d3.select('#info-col2-'+d.name).transition().style('opacity',1)    
                            }
                            
                        })
                    title.append('i')
                        .classed('title-caret-down fa-solid fa-lg fa-caret-down',true)
                        .attr('id', d => 'caret-down-'+d.name)
                        .style('color', color.text)
                        .style('display', d => !treeSelections.includes('mappings') ? d.mappings.length > 0 ? 'block' : 'none' : 'none')
                        .style('cursor','pointer')
                        .style('opacity', 0.2)
                        .style('margin-right','5px')
                        .on('click', (e,d) => {
                            if (d3.select('#caret-down-'+d.name).style('display') === 'block') {
                                d3.select('#caret-down-'+d.name).style('display','none')  
                                d3.select('#caret-up-'+d.name).style('display','block') 
                                d3.select('#mappings-container-'+d.name).transition().style('height','auto').style('display','flex')
                            }
                        })
                        .on('mouseover', (e,d) => d3.select('#caret-down-'+d.name).style('opacity',1))
                        .on('mouseout', (e,d) => d3.select('#caret-down-'+d.name).style('opacity',0.2))
                    title.append('i')
                        .classed('title-caret-up fa-solid fa-lg fa-caret-up',true)
                        .attr('id', d => 'caret-up-'+d.name)
                        .style('color', color.text)
                        .style('display', d => treeSelections.includes('mappings') && d.mappings.length > 0 ? 'block' : 'none')
                        .style('cursor','pointer')
                        .style('margin-right','5px')
                        // .style('padding-top','4px')
                        .on('click', (e,d) => {
                            if (d3.select('#caret-up-'+d.name).style('display') === 'block') {
                                d3.select('#caret-up-'+d.name).style('display','none')  
                                d3.select('#caret-down-'+d.name).style('display','block') 
                                d3.select('#mappings-container-'+d.name).transition().style('height','0px').style('display','none')
                            }
                        })
                    const countsContainer = titleSection.append('div')
                        .classed('list-counts-container',true)
                        .attr('id', d => 'counts-container-'+d.name)
                    const counts1 = countsContainer.append('div')
                        .classed('list-counts',true)
                    counts1.append('p')
                        .classed('counts1-text',true)
                        .attr('id', d => 'counts1-text-'+d.name)
                        .style('color', d => conceptNames.includes(d.name) ? d.total_counts > 0 ? color.text : color.textlight : color.textlight)
                        .html(d => d.total_counts + ' RC')
                    counts1.append('div')
                        .classed('counts1-rect',true)
                        .attr('id', d => 'counts1-rect-'+d.name)
                        .style('height', '8px')
                        .style('width', d => scaleWidth(d.total_counts) + 'px')
                        .style('background-color', d => conceptNames.includes(d.name) ? d.color : color.textlightest)
                        .style('margin-left', '5px')
                        .style('border-radius', '20px')
                    const counts2 = countsContainer.append('div')
                        .classed('list-counts',true)
                    counts2.append('p')
                        .classed('counts2-text',true)
                        .style('color', color.textlight)
                        .html(d => d.descendant_counts + ' DRC')
                    counts2.append('div')
                        .classed('counts2-rect',true)
                        .style('height', '8px')
                        .style('width', d => scaleWidth(d.descendant_counts) + 'px')
                        .style('background-color', color.textlightest)
                        .style('margin-left', '5px')
                        .style('border-radius', '20px')
                    const infoContainer = item.append('div')
                        .classed('info-container',true)
                        .attr('id', d => 'info-container-'+d.name)
                    const infoCol1 = infoContainer.append('div')
                        .classed('info-col',true)
                        .attr('id', d => 'info-col1-'+d.name)
                    infoCol1.append('p')
                        .html('Id')
                        .style("font-weight", 700)
                        .append('span')
                        .html(d => d.name)
                        .style('margin-left','8px')
                        .style('font-weight', 400)
                    infoCol1.append('p')
                        .html('Code')
                        .style("font-weight", 700)
                        .append('span')
                        .html(d => d.data.concept.concept_code)
                        .style('margin-left','8px')
                        .style('font-weight', 400)
                    infoCol1.append('p')
                        .html('Type')
                        .style("font-weight", 700)
                        .append('span')
                        .html(d => d.data.concept.standard_concept ? "Standard" : "Non standard")
                        .style('margin-left','8px')
                        .style('font-weight', 400)
                        .style('padding', '1px 5px 1px 5px')
                        .style('border', d => d.data.concept.standard_concept ? '1px solid black' : '1px dashed black')
                        .style('border-radius', '10px')
                    const infoCol2 = infoContainer.append('div')
                        .classed('info-col',true)
                        .attr('id', d => 'info-col2-'+d.name)
                        .style('margin-left', '20px')
                    infoCol2.append('p')
                        .html('Domain')
                        .style("font-weight", 700)
                        .append('span')
                        .html(d => d.data.concept.domain_id)
                        .style('margin-left','8px')
                        .style('font-weight', 400)
                    infoCol2.append('p')
                        .html('Class')
                        .style("font-weight", 700)
                        .append('span')
                        .html(d => d.data.concept.concept_class_id)
                        .style('margin-left','8px')
                        .style('font-weight', 400)
                    // infoCol2.append('p')
                    //     .html('Validity')
                    //     .style("font-weight", 700)
                    //     .append('span')
                    //     .html(d => getValidity(d.data.concept.valid_end_date))
                    //     .style('margin-left','8px')
                    //     .style('font-weight', 400)
                    const mappingsContainer = itemContainer.append('div')
                        .classed('mappings-container',true)
                        .attr('id', d => 'mappings-container-'+d.name)
                        .style('height', d => treeSelections.includes('mappings') && d.mappings.length > 0 ? 'auto' : '0px')
                        .style('display', d => treeSelections.includes('mappings') && d.mappings.length > 0 ? 'flex' : 'none')
                    mappingsContainer.append('p')
                        .classed('mappings-type',true)
                        .style('margin',0)
                        .style('font-size','10px')
                        .style('margin-bottom','4px')
                        .style('margin-left','4px')
                        .html(d => d.data.concept.standard_concept ? 'MAPPED FROM' : 'MAPS TO')
                    // MAPPINGS
                    mappingsContainer.selectAll(".map-list-item-container").data(d => d.mappings, d => d.name)
                    .join(enter => {
                        const mapItemContainer = enter.append('div')
                            .classed('map-list-item-container',true)
                        const mapItem = mapItemContainer.append('div')
                            .classed('map-list-item',true)
                            .attr('id', d => 'list-item-'+d.name)
                            .style('margin-bottom', '4px')
                            .style('background-color', d => d.name !== sidebarRoot.name ? conceptNames.includes(d.name) ? color.lightbackground : 'transparent' : color.lightpurple)
                            .style('border', d => conceptNames.includes(d.name) ? d.name === sidebarRoot.name ? '1px solid var(--lightpurple)' : '1px solid var(--lightbackground)' : '1px solid var(--background)')
                            .style('border-radius', d => d.name !== sidebarRoot.name ? '20px' : '0px 0px 16px 16px')
                        const mapTitleSection = mapItem.append('div')
                            .classed('map-title-section',true)
                        const mapTitle = mapTitleSection.append('div')
                            .classed('map-item-title',true)
                            .attr('id', d => 'item-title-' + d.name)
                        const mapCircle = mapTitle.append('div')
                            .classed('map-title-circle',true)
                            .attr('id', d => 'title-circle-'+d.name)
                            .style('flex-shrink',0)
                            .style('width', '14px')
                            .style('height', '14px')
                            .style('pointer-events', d => d.total_counts === 0 ? 'none' : 'all')
                            .style('border', d => d.total_counts === 0 ? '1px solid var(--textlightest)' : conceptNames.includes(d.name) ? `1px solid ${d.color}` : '1px solid var(--textlight)')
                            .style('cursor','pointer')
                            .style('background', d => {
                                if (!conceptNames.includes(d.name)) return "none"
                                else {
                                    if (!d.data.concept.standard_concept) {return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, "+ d.color + " 0.5px," + d.color + " 2px)"} 
                                    else {return "none"}    
                                }    
                            })
                            .style("background-color", d => {
                                if (!conceptNames.includes(d.name)) return "transparent"
                                else {
                                    if (d.data.concept.standard_concept) {return d.color} 
                                    else {return "transparent"}
                                }
                            }) 
                            .style('border-radius', '50%')
                            .style('margin-right', '5px')
                            .on('click', (e,d) => {
                                d3.select('#x-'+d.name).transition().style('opacity',0).style('display','none')
                                if (d.total_counts !== 0) {
                                    if (conceptNames.includes(d.name)) {
                                        let filteredConcepts = selectedConcepts.filter(e => e.name !== d.name)
                                        setSelectedConcepts(filteredConcepts)   
                                    } else if (!conceptNames.includes(d.name)){
                                        addConcepts([d])
                                    }     
                                }    
                            })
                            .on('mouseover', (e,d) => {
                                if (!conceptNames.includes(d.name)) {
                                    d3.select('#plus-'+d.name).transition().style('color', 'white')
                                    d3.select('#title-circle-'+d.name).transition().style('background-color', d => d.color).style('border',`1px solid ${d.color}`) 
                                    d3.select('#title-name-'+d.name).transition().style('color','black')   
                                    d3.select('#title-vocab-'+d.name).transition().style('color',color.textlight) 
                                    d3.select('#counts1-text-'+d.name).transition().style('color',color.text) 
                                    d3.select('#counts1-rect-'+d.name).transition().style('background-color',d.color) 
                                } else d3.select('#x-'+d.name).transition().style('opacity',1).style('display','block')
                            })
                            .on('mouseout', (e,d) => {
                                if (!conceptNames.includes(d.name)) {
                                    d3.select('#plus-'+d.name).transition().style('color', color.text)
                                    d3.select('#title-circle-'+d.name).transition().style('background-color', 'transparent').style('border','1px solid var(--textlight)')
                                    d3.select('#title-name-'+d.name).transition().style('color',color.textlight) 
                                    d3.select('#title-vocab-'+d.name).transition().style('color',color.textlightest)  
                                    d3.select('#counts1-text-'+d.name).transition().style('color',color.textlight) 
                                    d3.select('#counts1-rect-'+d.name).transition().style('background-color',color.textlightest)   
                                } else d3.select('#x-'+d.name).transition().style('opacity',0).style('display','none')
                            })
                        mapCircle.append('i')
                            .classed('map-list-plus fa-solid fa-plus fa-2xs',true)
                            .attr('id',d => 'plus-'+d.name)
                            .style('color', color.text)
                            .style('pointer-events','none')
                            .style('padding-bottom','1px')
                            .style('display', d => !conceptNames.includes(d.name) && d.total_counts !== 0 ? 'block' : 'none')
                        mapCircle.append('i')
                            .classed('map-list-x fa-solid fa-x fa-2xs',true)
                            .style('color', 'white')
                            .attr('id',d => 'x-'+d.name)
                            .style('opacity', 0)
                            .style('display', 'none')
                            .style('padding-bottom','1px')
                            .style('pointer-events','none')
                        const mapTitleP = mapTitle.append('p')
                        mapTitleP.append('span')
                            .classed('map-title-name',true)
                            .attr('id', d => 'title-name-'+d.name)
                            .style("font-weight", d => d.name == sidebarRoot.name ? 700 : 400)
                            .style('color', d => conceptNames.includes(d.name) ? 'black' : color.textlight)
                            .html(d => d.data.concept.concept_name || d.data.concept.concept_id)
                            .style('padding-right', '4px')
                            .style('cursor','pointer')
                            .on('click', async (e,d) => {
                                const data = await getData(d.name)
                                setSidebarRoot({name:d.name,data:data})  
                                conceptHover(d.name, "leave") 
                            })
                            .on('mouseover', (e,d) => {
                                d3.select('#list-item-'+d.name).style('background-color',color.lightpurple).style('border','1px solid var(--lightpurple)')
                                d3.select('#title-name-'+d.name).style('font-weight',700)
                                if (!conceptNames.includes(d.name) && d.total_counts !== 0) {
                                    d3.select('#plus-'+d.name).transition().style('color', 'white')
                                    d3.select('#title-circle-'+d.name).transition().style('background-color', d => d.color).style('border',`1px solid ${d.color}`)  
                                    d3.select('#title-name-'+d.name).transition().style('color','black') 
                                    d3.select('#title-vocab-'+d.name).transition().style('color',color.textlight) 
                                    d3.select('#counts1-text-'+d.name).transition().style('color',color.text) 
                                    d3.select('#counts1-rect-'+d.name).transition().style('background-color',d.color)     
                                }
                                conceptHover(d.name, "enter")
                            })
                            .on('mouseout', (e,d) => {
                                if (d.name !== sidebarRoot.name) {
                                    d3.select('#list-item-'+d.name).style('background-color', d => conceptNames.includes(d.name) ? color.lightbackground : 'transparent').style('border', d => conceptNames.includes(d.name) ? '1px solid var(--lightbackground)' : '1px solid var(--background)')
                                    d3.select('#title-name-'+d.name).style('font-weight',400)
                                    if (!conceptNames.includes(d.name) && d.total_counts !== 0) {
                                        d3.select('#plus-'+d.name).transition().style('color', color.text)
                                        d3.select('#title-circle-'+d.name).transition().style('background-color', 'transparent').style('border','1px solid var(--textlight)')
                                        d3.select('#title-name-'+d.name).transition().style('color',color.textlight) 
                                        d3.select('#title-vocab-'+d.name).transition().style('color',color.textlightest)  
                                        d3.select('#counts1-text-'+d.name).transition().style('color',color.textlight) 
                                        d3.select('#counts1-rect-'+d.name).transition().style('background-color',color.textlightest) 
                                    }
                                }    
                                conceptHover(d.name, "leave")
                            })
                        mapTitleP.append('span')
                            .classed('map-title-vocab',true)
                            .attr('id', d => 'title-vocab-'+d.name)
                            .style('font-size', '10px')
                            .style('color', d => conceptNames.includes(d.name) ? color.textlight : color.textlightest)
                            .html(d => d.data.concept.vocabulary_id)
                            .style('margin-right', '12px') 
                        mapTitle.append('i')
                            .classed('map-info-icon fa-solid fa-circle-info',true)  
                            .attr('id', d => 'info-icon-'+d.name)  
                            .style('color', color.text)
                            .style('opacity', 0.2)
                            .style('cursor','pointer')
                            .style('margin-right','5px')
                            .on('mouseover', (e,d) => d3.select('#info-icon-'+d.name).style('opacity',1))
                            .on('mouseout', (e,d) => {
                                if (d3.select('#info-container-'+d.name).style('display') === 'none') d3.select('#info-icon-'+d.name).style('opacity',0.2)
                            })
                            .on('click', (e,d) => {
                                if (d3.select('#info-container-'+d.name).style('display') === 'flex') {
                                    d3.select('#info-icon-'+d.name).style('opacity',0.2)
                                    d3.select('#info-container-'+d.name).transition().style('height','0px').style('display','none')
                                    d3.select('#info-col1-'+d.name).transition().style('opacity',0)
                                    d3.select('#info-col2-'+d.name).transition().style('opacity',0)
                                } else {
                                    d3.select('#info-icon-'+d.name).style('opacity',1)
                                    d3.select('#info-container-'+d.name).transition().style('height','50px').style('display','flex')
                                    d3.select('#info-col1-'+d.name).transition().style('opacity',1)
                                    d3.select('#info-col2-'+d.name).transition().style('opacity',1)    
                                }
                                
                            })
                        const mapCountsContainer = mapTitleSection.append('div')
                            .classed('map-list-counts-container',true)
                            .attr('id', d => 'counts-container-'+d.name)
                        const mapCounts1 = mapCountsContainer.append('div')
                            .classed('map-list-counts',true)
                        mapCounts1.append('p')
                            .classed('map-counts1-text',true)
                            .attr('id', d => 'counts1-text-'+d.name)
                            .style('color', d => conceptNames.includes(d.name) ? d.total_counts > 0 ? color.text : color.textlight : color.textlight)
                            .html(d => d.total_counts + ' RC')
                        mapCounts1.append('div')
                            .classed('map-counts1-rect',true)
                            .attr('id', d => 'counts1-rect-'+d.name)
                            .style('height', '8px')
                            .style('width', d => scaleWidth(d.total_counts) + 'px')
                            .style('background-color', d => conceptNames.includes(d.name) ? d.color : color.textlightest)
                            .style('margin-left', '5px')
                            .style('border-radius', '20px')
                        const mapCounts2 = mapCountsContainer.append('div')
                            .classed('map-list-counts',true)
                        mapCounts2.append('p')
                            .classed('map-counts2-text',true)
                            .style('color', color.textlight)
                            .html(d => d.descendant_counts + ' DRC')
                        mapCounts2.append('div')
                            .classed('map-counts2-rect',true)
                            .style('height', '8px')
                            .style('width', d => scaleWidth(d.descendant_counts) + 'px')
                            .style('background-color', color.textlightest)
                            .style('margin-left', '5px')
                            .style('border-radius', '20px')
                        const mapInfoContainer = mapItem.append('div')
                            .classed('map-info-container',true)
                            .attr('id', d => 'info-container-'+d.name)
                        const mapInfoCol1 = mapInfoContainer.append('div')
                            .classed('map-info-col',true)
                            .attr('id', d => 'info-col1-'+d.name)
                        mapInfoCol1.append('p')
                            .html('Id')
                            .style("font-weight", 700)
                            .append('span')
                            .html(d => d.name)
                            .style('margin-left','8px')
                            .style('font-weight', 400)
                        mapInfoCol1.append('p')
                            .html('Code')
                            .style("font-weight", 700)
                            .append('span')
                            .html(d => d.data.concept.concept_code)
                            .style('margin-left','8px')
                            .style('font-weight', 400)
                        mapInfoCol1.append('p')
                            .html('Type')
                            .style("font-weight", 700)
                            .append('span')
                            .html(d => d.data.concept.standard_concept ? "Standard" : "Non standard")
                            .style('margin-left','8px')
                            .style('font-weight', 400)
                            .style('padding', '2px 5px 2px 5px')
                            .style('border', d => d.data.concept.standard_concept ? '1px solid black' : '1px dashed black')
                            .style('border-radius', '10px')
                        const mapInfoCol2 = mapInfoContainer.append('div')
                            .classed('map-info-col',true)
                            .attr('id', d => 'info-col2-'+d.name)
                            .style('margin-left', '20px')
                        mapInfoCol2.append('p')
                            .html('Domain')
                            .style("font-weight", 700)
                            .append('span')
                            .html(d => d.data.concept.domain_id)
                            .style('margin-left','8px')
                            .style('font-weight', 400)
                        mapInfoCol2.append('p')
                            .html('Class')
                            .style("font-weight", 700)
                            .append('span')
                            .html(d => d.data.concept.concept_class_id)
                            .style('margin-left','8px')
                            .style('font-weight', 400)
                        // mapInfoCol2.append('p')
                        //     .html('Validity')
                        //     .style("font-weight", 700)
                        //     .append('span')
                        //     .html(d => getValidity(d.data.concept.valid_end_date))
                        //     .style('margin-left','8px')
                        //     .style('font-weight', 400)    
                    }, update => {
                        update.select('.map-list-item')
                            .style('background-color', d => d.name !== sidebarRoot.name ? conceptNames.includes(d.name) ? color.lightbackground : 'transparent' : color.lightpurple)
                            .style('border', d => conceptNames.includes(d.name) ? d.name === sidebarRoot.name ? '1px solid var(--lightpurple)' : '1px solid var(--lightbackground)' : '1px solid var(--background)')
                            .style('border-radius', d => d.name !== sidebarRoot.name ? '20px' : '0px 0px 16px 16px')
                        update.select('.map-title-circle')
                            .style('background', d => {
                                if (!conceptNames.includes(d.name)) return "none"
                                else {
                                    if (!d.data.concept.standard_concept) {return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, "+ d.color + " 0.5px," + d.color + " 2px)"} 
                                    else {return "none"}    
                                }    
                            })
                            .style("background-color", d => {
                                if (!conceptNames.includes(d.name)) return "transparent"
                                else {
                                    if (d.data.concept.standard_concept) {return d.color} 
                                    else {return "transparent"}
                                }
                            }) 
                            .style('pointer-events', d => d.total_counts === 0 ? 'none' : 'all')
                            .style('border', d => d.total_counts === 0 ? '1px solid var(--textlightest)' : conceptNames.includes(d.name) ? `1px solid ${d.color}` : '1px solid var(--textlight)')
                            .on('click', (e,d) => {
                                d3.select('#x-'+d.name).transition().style('opacity',0).style('display','none')
                                if (d.total_counts !== 0) {
                                    if (conceptNames.includes(d.name)) {
                                        let filteredConcepts = selectedConcepts.filter(e => e.name !== d.name)
                                        setSelectedConcepts(filteredConcepts)   
                                    } else if (!conceptNames.includes(d.name)){
                                        addConcepts([d])
                                    }     
                                }    
                            })
                            .on('mouseover', (e,d) => {
                                if (!conceptNames.includes(d.name)) {
                                    d3.select('#plus-'+d.name).transition().style('color', 'white')
                                    d3.select('#title-circle-'+d.name).transition().style('background-color', d => d.color).style('border',`1px solid ${d.color}`) 
                                    d3.select('#title-name-'+d.name).transition().style('color','black')   
                                    d3.select('#title-vocab-'+d.name).transition().style('color',color.textlight) 
                                    d3.select('#counts1-text-'+d.name).transition().style('color',color.text) 
                                    d3.select('#counts1-rect-'+d.name).transition().style('background-color',d.color) 
                                } else  d3.select('#x-'+d.name).transition().style('opacity',1).style('display','block')
                            })
                            .on('mouseout', (e,d) => {
                                if (!conceptNames.includes(d.name)) {
                                    d3.select('#plus-'+d.name).transition().style('color', color.text)
                                    d3.select('#title-circle-'+d.name).transition().style('background-color', 'transparent').style('border','1px solid var(--textlight)')
                                    d3.select('#title-name-'+d.name).transition().style('color',color.textlight) 
                                    d3.select('#title-vocab-'+d.name).transition().style('color',color.textlightest)  
                                    d3.select('#counts1-text-'+d.name).transition().style('color',color.textlight) 
                                    d3.select('#counts1-rect-'+d.name).transition().style('background-color',color.textlightest)   
                                } else d3.select('#x-'+d.name).transition().style('opacity',0).style('display','none')
                            })
                        update.select('.map-list-plus')
                            .style('display', d => !conceptNames.includes(d.name) && d.total_counts !== 0 ? 'block' : 'none')
                        update.select('.map-title-name')
                            .style("font-weight", d => d.name == sidebarRoot.name ? 700 : 400)
                            .style('color', d => conceptNames.includes(d.name) ? 'black' : color.textlight)
                            .html(d => d.data.concept.concept_name)
                            .on('click', async (e,d) => {
                                const data = await getData(d.name)
                                setSidebarRoot({name:d.name,data:data})  
                                conceptHover(d.name, "leave") 
                            })
                            .on('mouseover', (e,d) => {
                                d3.select('#list-item-'+d.name).style('background-color',color.lightpurple).style('border','1px solid var(--lightpurple)')
                                d3.select('#title-name-'+d.name).style('font-weight',700)
                                if (!conceptNames.includes(d.name) && d.total_counts !== 0) {
                                    d3.select('#plus-'+d.name).transition().style('color', 'white')
                                    d3.select('#title-circle-'+d.name).transition().style('background-color', d => d.color).style('border',`1px solid ${d.color}`)  
                                    d3.select('#title-name-'+d.name).transition().style('color','black') 
                                    d3.select('#title-vocab-'+d.name).transition().style('color',color.textlight) 
                                    d3.select('#counts1-text-'+d.name).transition().style('color',color.text) 
                                    d3.select('#counts1-rect-'+d.name).transition().style('background-color',d.color)     
                                }
                                conceptHover(d.name, "enter")
                            })
                            .on('mouseout', (e,d) => {
                                if (d.name !== sidebarRoot.name) {
                                    d3.select('#list-item-'+d.name).style('background-color', d => conceptNames.includes(d.name) ? color.lightbackground : 'transparent').style('border', d => conceptNames.includes(d.name) ? '1px solid var(--lightbackground)' : '1px solid var(--background)')
                                    d3.select('#title-name-'+d.name).style('font-weight',400)
                                    if (!conceptNames.includes(d.name) && d.total_counts !== 0) {
                                        d3.select('#plus-'+d.name).transition().style('color', color.text)
                                        d3.select('#title-circle-'+d.name).transition().style('background-color', 'transparent').style('border','1px solid var(--textlight)')
                                        d3.select('#title-name-'+d.name).transition().style('color',color.textlight) 
                                        d3.select('#title-vocab-'+d.name).transition().style('color',color.textlightest)  
                                        d3.select('#counts1-text-'+d.name).transition().style('color',color.textlight) 
                                        d3.select('#counts1-rect-'+d.name).transition().style('background-color',color.textlightest) 
                                    }
                                }    
                                conceptHover(d.name, "leave")
                            })
                        update.select('.map-title-vocab')
                            .style('color', d => conceptNames.includes(d.name) ? color.textlight : color.textlightest)
                            .html(d => d.data.concept.vocabulary_id) 
                        update.select('.map-info-icon')
                            .on('mouseover', (e,d) => d3.select('#info-icon-'+d.name).style('opacity',1))
                            .on('mouseout', (e,d) => {
                                if (d3.select('#info-container-'+d.name).style('display') === 'none') d3.select('#info-icon-'+d.name).style('opacity',0.2)
                            })
                            .on('click', (e,d) => {
                                if (d3.select('#info-container-'+d.name).style('display') === 'flex') {
                                    d3.select('#info-icon-'+d.name).style('opacity',0.2)
                                    d3.select('#info-container-'+d.name).transition().style('height','0px').style('display','none')
                                    d3.select('#info-col1-'+d.name).transition().style('opacity',0)
                                    d3.select('#info-col2-'+d.name).transition().style('opacity',0)
                                } else {
                                    d3.select('#info-icon-'+d.name).style('opacity',1)
                                    d3.select('#info-container-'+d.name).transition().style('height','50px').style('display','flex')
                                    d3.select('#info-col1-'+d.name).transition().style('opacity',1)
                                    d3.select('#info-col2-'+d.name).transition().style('opacity',1)    
                                }
                                
                            })
                        update.select('.map-counts1-text')
                            .style('color', d => conceptNames.includes(d.name) ? d.total_counts > 0 ? color.text : color.textlight : color.textlight)
                            .html(d => d.total_counts + ' RC')
                        update.select('.map-counts1-rect')
                            .transition()
                            .style('width', d => scaleWidth(d.total_counts) + 'px')
                            .style('background-color', d => conceptNames.includes(d.name) ? d.color : color.textlightest)
                        update.select('.map-counts2-text')
                            .html(d => d.descendant_counts + ' DRC')
                        update.select('.map-counts2-rect')
                            .transition()
                            .style('width', d => scaleWidth(d.descendant_counts) + 'px')    
                    })
                }, update => {
                    update.select('.list-item')
                        .style('background-color', d => d.name !== sidebarRoot.name ? conceptNames.includes(d.name) ? color.lightbackground : 'transparent' : color.lightpurple)
                        .style('border', d => conceptNames.includes(d.name) ? d.name === sidebarRoot.name ? '1px solid var(--lightpurple)' : '1px solid var(--lightbackground)' : '1px solid var(--background)')
                        .style('border-radius', d => d.name !== sidebarRoot.name ? '20px' : '0px 0px 16px 16px')
                    update.select('.title-circle')
                        .style('background', d => {
                            if (!conceptNames.includes(d.name)) return "none"
                            else {
                                if (!d.data.concept.standard_concept) {return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, "+ d.color + " 0.5px," + d.color + " 2px)"} 
                                else {return "none"}    
                            }    
                        })
                        .style("background-color", d => {
                            if (!conceptNames.includes(d.name)) return "transparent"
                            else {
                                if (d.data.concept.standard_concept) {return d.color} 
                                else {return "transparent"}
                            }
                        }) 
                        .style('pointer-events', d => d.total_counts === 0 ? 'none' : 'all')
                        .style('border', d => d.total_counts === 0 ? '1px solid var(--textlightest)' : conceptNames.includes(d.name) ? `1px solid ${d.color}` : '1px solid var(--textlight)')
                        .on('click', (e,d) => {
                            d3.select('#x-'+d.name).transition().style('opacity',0).style('display','none')
                            if (d.total_counts !== 0) {
                                if (conceptNames.includes(d.name)) {
                                    let filteredConcepts = selectedConcepts.filter(e => e.name !== d.name)
                                    setSelectedConcepts(filteredConcepts)   
                                } else if (!conceptNames.includes(d.name)){
                                    addConcepts([d])
                                }     
                            }    
                        })
                        .on('mouseover', (e,d) => {
                            if (!conceptNames.includes(d.name)) {
                                d3.select('#plus-'+d.name).transition().style('color', 'white')
                                d3.select('#title-circle-'+d.name).transition().style('background-color', d => d.color).style('border',`1px solid ${d.color}`) 
                                d3.select('#title-name-'+d.name).transition().style('color','black')   
                                d3.select('#title-vocab-'+d.name).transition().style('color',color.textlight) 
                                d3.select('#counts1-text-'+d.name).transition().style('color',color.text) 
                                d3.select('#counts1-rect-'+d.name).transition().style('background-color',d.color) 
                            } else d3.select('#x-'+d.name).transition().style('opacity',1).style('display','block')
                        })
                        .on('mouseout', (e,d) => {
                            if (!conceptNames.includes(d.name)) {
                                d3.select('#plus-'+d.name).transition().style('color', color.text)
                                d3.select('#title-circle-'+d.name).transition().style('background-color', 'transparent').style('border','1px solid var(--textlight)')
                                d3.select('#title-name-'+d.name).transition().style('color',color.textlight) 
                                d3.select('#title-vocab-'+d.name).transition().style('color',color.textlightest)  
                                d3.select('#counts1-text-'+d.name).transition().style('color',color.textlight) 
                                d3.select('#counts1-rect-'+d.name).transition().style('background-color',color.textlightest)   
                            } else d3.select('#x-'+d.name).transition().style('opacity',0).style('display','none')
                        })
                    update.select('.list-plus')
                        .style('display', d => !conceptNames.includes(d.name) && d.total_counts !== 0 ? 'block' : 'none')
                    update.select('.title-name')
                        .style("font-weight", d => d.name == sidebarRoot.name ? 700 : 400)
                        .style('color', d => conceptNames.includes(d.name) ? 'black' : color.textlight)
                        .html(d => d.data.concept.concept_name || d.data.concept.concept_id)
                        .on('click', async (e,d) => {
                            const data = await getData(d.name)
                            setSidebarRoot({name:d.name,data:data})  
                            conceptHover(d.name, "leave") 
                        })
                        .on('mouseover', (e,d) => {
                            d3.select('#list-item-'+d.name).style('background-color',color.lightpurple).style('border','1px solid var(--lightpurple)')
                            d3.select('#title-name-'+d.name).style('font-weight',700)
                            if (!conceptNames.includes(d.name) && d.total_counts !== 0) {
                                d3.select('#plus-'+d.name).transition().style('color', 'white')
                                d3.select('#title-circle-'+d.name).transition().style('background-color', d => d.color).style('border',`1px solid ${d.color}`)  
                                d3.select('#title-name-'+d.name).transition().style('color','black') 
                                d3.select('#title-vocab-'+d.name).transition().style('color',color.textlight) 
                                d3.select('#counts1-text-'+d.name).transition().style('color',color.text) 
                                d3.select('#counts1-rect-'+d.name).transition().style('background-color',d.color)     
                            }
                            conceptHover(d.name, "enter")
                        })
                        .on('mouseout', (e,d) => {
                            if (d.name !== sidebarRoot.name) {
                                d3.select('#list-item-'+d.name).style('background-color', d => conceptNames.includes(d.name) ? color.lightbackground : 'transparent').style('border', d => conceptNames.includes(d.name) ? '1px solid var(--lightbackground)' : '1px solid var(--background)')
                                d3.select('#title-name-'+d.name).style('font-weight',400)
                                if (!conceptNames.includes(d.name) && d.total_counts !== 0) {
                                    d3.select('#plus-'+d.name).transition().style('color', color.text)
                                    d3.select('#title-circle-'+d.name).transition().style('background-color', 'transparent').style('border','1px solid var(--textlight)')
                                    d3.select('#title-name-'+d.name).transition().style('color',color.textlight) 
                                    d3.select('#title-vocab-'+d.name).transition().style('color',color.textlightest)  
                                    d3.select('#counts1-text-'+d.name).transition().style('color',color.textlight) 
                                    d3.select('#counts1-rect-'+d.name).transition().style('background-color',color.textlightest) 
                                }
                            }    
                            conceptHover(d.name, "leave")
                        })
                    update.select('.title-vocab')
                        .style('color', d => conceptNames.includes(d.name) ? color.textlight : color.textlightest)
                        .html(d => d.data.concept.vocabulary_id)
                    update.select('.title-level')
                        .style('color', d => conceptNames.includes(d.name) ? color.text : color.textlight)
                        .html(d => d.levels)  
                    update.select('.info-icon')
                        .on('mouseover', (e,d) => d3.select('#info-icon-'+d.name).style('opacity',1))
                        .on('mouseout', (e,d) => {
                            if (d3.select('#info-container-'+d.name).style('display') === 'none') d3.select('#info-icon-'+d.name).style('opacity',0.2)
                        })
                        .on('click', (e,d) => {
                            if (d3.select('#info-container-'+d.name).style('display') === 'flex') {
                                d3.select('#info-icon-'+d.name).style('opacity',0.2)
                                d3.select('#info-container-'+d.name).transition().style('height','0px').style('display','none')
                                d3.select('#info-col1-'+d.name).transition().style('opacity',0)
                                d3.select('#info-col2-'+d.name).transition().style('opacity',0)
                            } else {
                                d3.select('#info-icon-'+d.name).style('opacity',1)
                                d3.select('#info-container-'+d.name).transition().style('height','50px').style('display','flex')
                                d3.select('#info-col1-'+d.name).transition().style('opacity',1)
                                d3.select('#info-col2-'+d.name).transition().style('opacity',1)    
                            }
                            
                        })
                    update.select('.title-caret-down')
                        .style('display', d => !treeSelections.includes('mappings') ? d.mappings.length > 0 ? 'block' : 'none' : 'none')
                        .on('click', (e,d) => {
                            if (d3.select('#caret-down-'+d.name).style('display') === 'block') {
                                d3.select('#caret-down-'+d.name).style('display','none')  
                                d3.select('#caret-up-'+d.name).style('display','block') 
                                d3.select('#mappings-container-'+d.name).transition().style('height','auto').style('display','flex')
                            }
                        })
                        .on('mouseover', (e,d) => d3.select('#caret-down-'+d.name).style('opacity',1))
                        .on('mouseout', (e,d) => d3.select('#caret-down-'+d.name).style('opacity',0.2))
                    update.select('.title-caret-up')
                        .style('display', d => treeSelections.includes('mappings') && d.mappings.length > 0 ? 'block' : 'none')
                        .on('click', (e,d) => {
                            if (d3.select('#caret-up-'+d.name).style('display') === 'block') {
                                d3.select('#caret-up-'+d.name).style('display','none')  
                                d3.select('#caret-down-'+d.name).style('display','block') 
                                d3.select('#mappings-container-'+d.name).transition().style('height','0px').style('display','none')
                            }
                        })
                    update.select('.counts1-text')
                        .style('color', d => conceptNames.includes(d.name) ? d.total_counts > 0 ? color.text : color.textlight : color.textlight)
                        .html(d => d.total_counts + ' RC')
                    update.select('.counts1-rect')
                        .transition()
                        .style('width', d => scaleWidth(d.total_counts) + 'px')
                        .style('background-color', d => conceptNames.includes(d.name) ? d.color : color.textlightest)
                    update.select('.counts2-text')
                        .html(d => d.descendant_counts + ' DRC')
                    update.select('.counts2-rect')
                        .transition()
                        .style('width', d => scaleWidth(d.descendant_counts) + 'px')
                    update.select(".mappings-container")
                        .style('height', d => treeSelections.includes('mappings') && d.mappings.length > 0 ? 'auto' : '0px')
                        .style('display', d => treeSelections.includes('mappings') && d.mappings.length > 0 ? 'flex' : 'none')
                    // MAPPINGS
                    update.select('.mappings-container').selectAll(".map-list-item-container").data(d => d.mappings, d => d.name)
                    .join(enter => {
                        const mapItemContainer = enter.append('div')
                            .classed('map-list-item-container',true)
                        const mapItem = mapItemContainer.append('div')
                            .classed('map-list-item',true)
                            .attr('id', d => 'list-item-'+d.name)
                            .style('margin-bottom', '4px')
                            .style('background-color', d => d.name !== sidebarRoot.name ? conceptNames.includes(d.name) ? color.lightbackground : 'transparent' : color.lightpurple)
                            .style('border', d => conceptNames.includes(d.name) ? d.name === sidebarRoot.name ? '1px solid var(--lightpurple)' : '1px solid var(--lightbackground)' : '1px solid var(--background)')
                            .style('border-radius', d => d.name !== sidebarRoot.name ? '20px' : '0px 0px 16px 16px')
                        const mapTitleSection = mapItem.append('div')
                            .classed('map-title-section',true)
                        const mapTitle = mapTitleSection.append('div')
                            .classed('map-item-title',true)
                            .attr('id', d => 'item-title-' + d.name)
                        const mapCircle = mapTitle.append('div')
                            .classed('map-title-circle',true)
                            .attr('id', d => 'title-circle-'+d.name)
                            .style('flex-shrink',0)
                            .style('width', '14px')
                            .style('height', '14px')
                            .style('pointer-events', d => d.total_counts === 0 ? 'none' : 'all')
                            .style('border', d => d.total_counts === 0 ? '1px solid var(--textlightest)' : conceptNames.includes(d.name) ? `1px solid ${d.color}` : '1px solid var(--textlight)')
                            .style('cursor','pointer')
                            .style('background', d => {
                                if (!conceptNames.includes(d.name)) return "none"
                                else {
                                    if (!d.data.concept.standard_concept) {return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, "+ d.color + " 0.5px," + d.color + " 2px)"} 
                                    else {return "none"}    
                                }    
                            })
                            .style("background-color", d => {
                                if (!conceptNames.includes(d.name)) return "transparent"
                                else {
                                    if (d.data.concept.standard_concept) {return d.color} 
                                    else {return "transparent"}
                                }
                            }) 
                            .style('border-radius', '50%')
                            .style('margin-right', '5px')
                            .on('click', (e,d) => {
                                d3.select('#x-'+d.name).transition().style('opacity',0).style('display','none')
                                if (d.total_counts !== 0) {
                                    if (conceptNames.includes(d.name)) {
                                        let filteredConcepts = selectedConcepts.filter(e => e.name !== d.name)
                                        setSelectedConcepts(filteredConcepts)   
                                    } else if (!conceptNames.includes(d.name)){
                                        addConcepts([d])
                                    }     
                                }    
                            })
                            .on('mouseover', (e,d) => {
                                if (!conceptNames.includes(d.name)) {
                                    d3.select('#plus-'+d.name).transition().style('color', 'white')
                                    d3.select('#title-circle-'+d.name).transition().style('background-color', d => d.color).style('border',`1px solid ${d.color}`) 
                                    d3.select('#title-name-'+d.name).transition().style('color','black')   
                                    d3.select('#title-vocab-'+d.name).transition().style('color',color.textlight) 
                                    d3.select('#counts1-text-'+d.name).transition().style('color',color.text) 
                                    d3.select('#counts1-rect-'+d.name).transition().style('background-color',d.color) 
                                } else d3.select('#x-'+d.name).transition().style('opacity',1).style('display','block')
                            })
                            .on('mouseout', (e,d) => {
                                if (!conceptNames.includes(d.name)) {
                                    d3.select('#plus-'+d.name).transition().style('color', color.text)
                                    d3.select('#title-circle-'+d.name).transition().style('background-color', 'transparent').style('border','1px solid var(--textlight)')
                                    d3.select('#title-name-'+d.name).transition().style('color',color.textlight) 
                                    d3.select('#title-vocab-'+d.name).transition().style('color',color.textlightest)  
                                    d3.select('#counts1-text-'+d.name).transition().style('color',color.textlight) 
                                    d3.select('#counts1-rect-'+d.name).transition().style('background-color',color.textlightest)   
                                } else d3.select('#x-'+d.name).transition().style('opacity',0).style('display','none')
                            })
                        mapCircle.append('i')
                            .classed('map-list-plus fa-solid fa-plus fa-2xs',true)
                            .attr('id',d => 'plus-'+d.name)
                            .style('color', color.text)
                            .style('pointer-events','none')
                            .style('padding-bottom','1px')
                            .style('display', d => !conceptNames.includes(d.name) && d.total_counts !== 0 ? 'block' : 'none')
                        mapCircle.append('i')
                            .classed('map-list-x fa-solid fa-x fa-2xs',true)
                            .style('color', 'white')
                            .attr('id',d => 'x-'+d.name)
                            .style('opacity', 0)
                            .style('display', 'none')
                            .style('padding-bottom','1px')
                            .style('pointer-events','none')
                        const mapTitleP = mapTitle.append('p')
                        mapTitleP.append('span')
                            .classed('map-title-name',true)
                            .attr('id', d => 'title-name-'+d.name)
                            .style("font-weight", d => d.name == sidebarRoot.name ? 700 : 400)
                            .style('color', d => conceptNames.includes(d.name) ? 'black' : color.textlight)
                            .html(d => d.data.concept.concept_name || d.data.concept.concept_id)
                            .style('padding-right', '4px')
                            .style('cursor','pointer')
                            .on('click', async (e,d) => {
                                const data = await getData(d.name)
                                setSidebarRoot({name:d.name,data:data})  
                                conceptHover(d.name, "leave") 
                            })
                            .on('mouseover', (e,d) => {
                                d3.select('#list-item-'+d.name).style('background-color',color.lightpurple).style('border','1px solid var(--lightpurple)')
                                d3.select('#title-name-'+d.name).style('font-weight',700)
                                if (!conceptNames.includes(d.name) && d.total_counts !== 0) {
                                    d3.select('#plus-'+d.name).transition().style('color', 'white')
                                    d3.select('#title-circle-'+d.name).transition().style('background-color', d => d.color).style('border',`1px solid ${d.color}`)  
                                    d3.select('#title-name-'+d.name).transition().style('color','black') 
                                    d3.select('#title-vocab-'+d.name).transition().style('color',color.textlight) 
                                    d3.select('#counts1-text-'+d.name).transition().style('color',color.text) 
                                    d3.select('#counts1-rect-'+d.name).transition().style('background-color',d.color)     
                                }
                                conceptHover(d.name, "enter")
                            })
                            .on('mouseout', (e,d) => {
                                if (d.name !== sidebarRoot.name) {
                                    d3.select('#list-item-'+d.name).style('background-color', d => conceptNames.includes(d.name) ? color.lightbackground : 'transparent').style('border', d => conceptNames.includes(d.name) ? '1px solid var(--lightbackground)' : '1px solid var(--background)')
                                    d3.select('#title-name-'+d.name).style('font-weight',400)
                                    if (!conceptNames.includes(d.name) && d.total_counts !== 0) {
                                        d3.select('#plus-'+d.name).transition().style('color', color.text)
                                        d3.select('#title-circle-'+d.name).transition().style('background-color', 'transparent').style('border','1px solid var(--textlight)')
                                        d3.select('#title-name-'+d.name).transition().style('color',color.textlight) 
                                        d3.select('#title-vocab-'+d.name).transition().style('color',color.textlightest)  
                                        d3.select('#counts1-text-'+d.name).transition().style('color',color.textlight) 
                                        d3.select('#counts1-rect-'+d.name).transition().style('background-color',color.textlightest) 
                                    }
                                }    
                                conceptHover(d.name, "leave")
                            })
                        mapTitleP.append('span')
                            .classed('map-title-vocab',true)
                            .attr('id', d => 'title-vocab-'+d.name)
                            .style('font-size', '10px')
                            .style('color', d => conceptNames.includes(d.name) ? color.textlight : color.textlightest)
                            .html(d => d.data.concept.vocabulary_id)
                            .style('margin-right', '12px') 
                        mapTitle.append('i')
                            .classed('map-info-icon fa-solid fa-circle-info',true)  
                            .attr('id', d => 'info-icon-'+d.name)  
                            .style('color', color.text)
                            .style('opacity', 0.2)
                            .style('cursor','pointer')
                            .style('margin-right','5px')
                            .on('mouseover', (e,d) => d3.select('#info-icon-'+d.name).style('opacity',1))
                            .on('mouseout', (e,d) => {
                                if (d3.select('#info-container-'+d.name).style('display') === 'none') d3.select('#info-icon-'+d.name).style('opacity',0.2)
                            })
                            .on('click', (e,d) => {
                                if (d3.select('#info-container-'+d.name).style('display') === 'flex') {
                                    d3.select('#info-icon-'+d.name).style('opacity',0.2)
                                    d3.select('#info-container-'+d.name).transition().style('height','0px').style('display','none')
                                    d3.select('#info-col1-'+d.name).transition().style('opacity',0)
                                    d3.select('#info-col2-'+d.name).transition().style('opacity',0)
                                } else {
                                    d3.select('#info-icon-'+d.name).style('opacity',1)
                                    d3.select('#info-container-'+d.name).transition().style('height','50px').style('display','flex')
                                    d3.select('#info-col1-'+d.name).transition().style('opacity',1)
                                    d3.select('#info-col2-'+d.name).transition().style('opacity',1)    
                                }
                                
                            })
                        const mapCountsContainer = mapTitleSection.append('div')
                            .classed('map-list-counts-container',true)
                            .attr('id', d => 'counts-container-'+d.name)
                        const mapCounts1 = mapCountsContainer.append('div')
                            .classed('map-list-counts',true)
                        mapCounts1.append('p')
                            .classed('map-counts1-text',true)
                            .attr('id', d => 'counts1-text-'+d.name)
                            .style('color', d => conceptNames.includes(d.name) ? d.total_counts > 0 ? color.text : color.textlight : color.textlight)
                            .html(d => d.total_counts + ' RC')
                        mapCounts1.append('div')
                            .classed('map-counts1-rect',true)
                            .attr('id', d => 'counts1-rect-'+d.name)
                            .style('height', '8px')
                            .style('width', d => scaleWidth(d.total_counts) + 'px')
                            .style('background-color', d => conceptNames.includes(d.name) ? d.color : color.textlightest)
                            .style('margin-left', '5px')
                            .style('border-radius', '20px')
                        const mapCounts2 = mapCountsContainer.append('div')
                            .classed('map-list-counts',true)
                        mapCounts2.append('p')
                            .classed('map-counts2-text',true)
                            .style('color', color.textlight)
                            .html(d => d.descendant_counts + ' DRC')
                        mapCounts2.append('div')
                            .classed('map-counts2-rect',true)
                            .style('height', '8px')
                            .style('width', d => scaleWidth(d.descendant_counts) + 'px')
                            .style('background-color', color.textlightest)
                            .style('margin-left', '5px')
                            .style('border-radius', '20px')
                        const mapInfoContainer = mapItem.append('div')
                            .classed('map-info-container',true)
                            .attr('id', d => 'info-container-'+d.name)
                        const mapInfoCol1 = mapInfoContainer.append('div')
                            .classed('map-info-col',true)
                            .attr('id', d => 'info-col1-'+d.name)
                        mapInfoCol1.append('p')
                            .html('Id')
                            .style("font-weight", 700)
                            .append('span')
                            .html(d => d.name)
                            .style('margin-left','8px')
                            .style('font-weight', 400)
                        mapInfoCol1.append('p')
                            .html('Code')
                            .style("font-weight", 700)
                            .append('span')
                            .html(d => d.data.concept.concept_code)
                            .style('margin-left','8px')
                            .style('font-weight', 400)
                        mapInfoCol1.append('p')
                            .html('Type')
                            .style("font-weight", 700)
                            .append('span')
                            .html(d => d.data.concept.standard_concept ? "Standard" : "Non standard")
                            .style('margin-left','8px')
                            .style('font-weight', 400)
                            .style('padding', '2px 5px 2px 5px')
                            .style('border', d => d.data.concept.standard_concept ? '1px solid black' : '1px dashed black')
                            .style('border-radius', '10px')
                        const mapInfoCol2 = mapInfoContainer.append('div')
                            .classed('map-info-col',true)
                            .attr('id', d => 'info-col2-'+d.name)
                            .style('margin-left', '20px')
                        mapInfoCol2.append('p')
                            .html('Domain')
                            .style("font-weight", 700)
                            .append('span')
                            .html(d => d.data.concept.domain_id)
                            .style('margin-left','8px')
                            .style('font-weight', 400)
                        mapInfoCol2.append('p')
                            .html('Class')
                            .style("font-weight", 700)
                            .append('span')
                            .html(d => d.data.concept.concept_class_id)
                            .style('margin-left','8px')
                            .style('font-weight', 400)
                        // mapInfoCol2.append('p')
                        //     .html('Validity')
                        //     .style("font-weight", 700)
                        //     .append('span')
                        //     .html(d => getValidity(d.data.concept.valid_end_date))
                        //     .style('margin-left','8px')
                        //     .style('font-weight', 400)    
                    }, update => {
                        update.select('.map-list-item')
                            .style('background-color', d => d.name !== sidebarRoot.name ? conceptNames.includes(d.name) ? color.lightbackground : 'transparent' : color.lightpurple)
                            .style('border', d => conceptNames.includes(d.name) ? d.name === sidebarRoot.name ? '1px solid var(--lightpurple)' : '1px solid var(--lightbackground)' : '1px solid var(--background)')
                            .style('border-radius', d => d.name !== sidebarRoot.name ? '20px' : '0px 0px 16px 16px')
                        update.select('.map-title-circle')
                            .style('background', d => {
                                if (!conceptNames.includes(d.name)) return "none"
                                else {
                                    if (!d.data.concept.standard_concept) {return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, "+ d.color + " 0.5px," + d.color + " 2px)"} 
                                    else {return "none"}    
                                }    
                            })
                            .style("background-color", d => {
                                if (!conceptNames.includes(d.name)) return "transparent"
                                else {
                                    if (d.data.concept.standard_concept) {return d.color} 
                                    else {return "transparent"}
                                }
                            }) 
                            .style('pointer-events', d => d.total_counts === 0 ? 'none' : 'all')
                            .style('border', d => d.total_counts === 0 ? '1px solid var(--textlightest)' : conceptNames.includes(d.name) ? `1px solid ${d.color}` : '1px solid var(--textlight)')
                            .on('click', (e,d) => {
                                d3.select('#x-'+d.name).transition().style('opacity',0).style('display','none')
                                if (d.total_counts !== 0) {
                                    if (conceptNames.includes(d.name)) {
                                        let filteredConcepts = selectedConcepts.filter(e => e.name !== d.name)
                                        setSelectedConcepts(filteredConcepts)   
                                    } else if (!conceptNames.includes(d.name)){
                                        addConcepts([d])
                                    }     
                                }    
                            })
                            .on('mouseover', (e,d) => {
                                if (!conceptNames.includes(d.name)) {
                                    d3.select('#plus-'+d.name).transition().style('color', 'white')
                                    d3.select('#title-circle-'+d.name).transition().style('background-color', d => d.color).style('border',`1px solid ${d.color}`) 
                                    d3.select('#title-name-'+d.name).transition().style('color','black')   
                                    d3.select('#title-vocab-'+d.name).transition().style('color',color.textlight) 
                                    d3.select('#counts1-text-'+d.name).transition().style('color',color.text) 
                                    d3.select('#counts1-rect-'+d.name).transition().style('background-color',d.color) 
                                } else d3.select('#x-'+d.name).transition().style('opacity',1).style('display','block')
                            })
                            .on('mouseout', (e,d) => {
                                if (!conceptNames.includes(d.name)) {
                                    d3.select('#plus-'+d.name).transition().style('color', color.text)
                                    d3.select('#title-circle-'+d.name).transition().style('background-color', 'transparent').style('border','1px solid var(--textlight)')
                                    d3.select('#title-name-'+d.name).transition().style('color',color.textlight) 
                                    d3.select('#title-vocab-'+d.name).transition().style('color',color.textlightest)  
                                    d3.select('#counts1-text-'+d.name).transition().style('color',color.textlight) 
                                    d3.select('#counts1-rect-'+d.name).transition().style('background-color',color.textlightest)   
                                } else d3.select('#x-'+d.name).transition().style('opacity',0).style('display','none')
                            })
                        update.select('.map-list-plus')
                            .style('display', d => !conceptNames.includes(d.name) && d.total_counts !== 0 ? 'block' : 'none')
                        update.select('.map-title-name')
                            .style("font-weight", d => d.name == sidebarRoot.name ? 700 : 400)
                            .style('color', d => conceptNames.includes(d.name) ? 'black' : color.textlight)
                            .html(d => d.data.concept.concept_name)
                            .on('click', async (e,d) => {
                                const data = await getData(d.name)
                                setSidebarRoot({name:d.name,data:data})  
                                conceptHover(d.name, "leave") 
                            })
                            .on('mouseover', (e,d) => {
                                d3.select('#list-item-'+d.name).style('background-color',color.lightpurple).style('border','1px solid var(--lightpurple)')
                                d3.select('#title-name-'+d.name).style('font-weight',700)
                                if (!conceptNames.includes(d.name) && d.total_counts !== 0) {
                                    d3.select('#plus-'+d.name).transition().style('color', 'white')
                                    d3.select('#title-circle-'+d.name).transition().style('background-color', d => d.color).style('border',`1px solid ${d.color}`)  
                                    d3.select('#title-name-'+d.name).transition().style('color','black') 
                                    d3.select('#title-vocab-'+d.name).transition().style('color',color.textlight) 
                                    d3.select('#counts1-text-'+d.name).transition().style('color',color.text) 
                                    d3.select('#counts1-rect-'+d.name).transition().style('background-color',d.color)     
                                }
                                conceptHover(d.name, "enter")
                            })
                            .on('mouseout', (e,d) => {
                                if (d.name !== sidebarRoot.name) {
                                    d3.select('#list-item-'+d.name).style('background-color', d => conceptNames.includes(d.name) ? color.lightbackground : 'transparent').style('border', d => conceptNames.includes(d.name) ? '1px solid var(--lightbackground)' : '1px solid var(--background)')
                                    d3.select('#title-name-'+d.name).style('font-weight',400)
                                    if (!conceptNames.includes(d.name) && d.total_counts !== 0) {
                                        d3.select('#plus-'+d.name).transition().style('color', color.text)
                                        d3.select('#title-circle-'+d.name).transition().style('background-color', 'transparent').style('border','1px solid var(--textlight)')
                                        d3.select('#title-name-'+d.name).transition().style('color',color.textlight) 
                                        d3.select('#title-vocab-'+d.name).transition().style('color',color.textlightest)  
                                        d3.select('#counts1-text-'+d.name).transition().style('color',color.textlight) 
                                        d3.select('#counts1-rect-'+d.name).transition().style('background-color',color.textlightest) 
                                    }
                                }    
                                conceptHover(d.name, "leave")
                            })
                        update.select('.map-title-vocab')
                            .style('color', d => conceptNames.includes(d.name) ? color.textlight : color.textlightest)
                            .html(d => d.data.concept.vocabulary_id) 
                        update.select('.map-info-icon')
                            .on('mouseover', (e,d) => d3.select('#info-icon-'+d.name).style('opacity',1))
                            .on('mouseout', (e,d) => {
                                if (d3.select('#info-container-'+d.name).style('display') === 'none') d3.select('#info-icon-'+d.name).style('opacity',0.2)
                            })
                            .on('click', (e,d) => {
                                if (d3.select('#info-container-'+d.name).style('display') === 'flex') {
                                    d3.select('#info-icon-'+d.name).style('opacity',0.2)
                                    d3.select('#info-container-'+d.name).transition().style('height','0px').style('display','none')
                                    d3.select('#info-col1-'+d.name).transition().style('opacity',0)
                                    d3.select('#info-col2-'+d.name).transition().style('opacity',0)
                                } else {
                                    d3.select('#info-icon-'+d.name).style('opacity',1)
                                    d3.select('#info-container-'+d.name).transition().style('height','50px').style('display','flex')
                                    d3.select('#info-col1-'+d.name).transition().style('opacity',1)
                                    d3.select('#info-col2-'+d.name).transition().style('opacity',1)    
                                }
                                
                            })
                        update.select('.map-counts1-text')
                            .style('color', d => conceptNames.includes(d.name) ? d.total_counts > 0 ? color.text : color.textlight : color.textlight)
                            .html(d => d.total_counts + ' RC')
                        update.select('.map-counts1-rect')
                            .transition()
                            .style('width', d => scaleWidth(d.total_counts) + 'px')
                            .style('background-color', d => conceptNames.includes(d.name) ? d.color : color.textlightest)
                        update.select('.map-counts2-text')
                            .html(d => d.descendant_counts + ' DRC')
                        update.select('.map-counts2-rect')
                            .transition()
                            .style('width', d => scaleWidth(d.descendant_counts) + 'px')    
                    })
                })
                update 
                    .style('padding-bottom', d => d.section === 'PARENTS' || d.section === 'ROOT' ? '5px' : '0px')
                update.select('.section-title')
                    .style('height', d => d.section === 'ROOT' ? '28px' : '20px')
                    .style('background-color', d => d.section === 'ROOT' ? color.purple : 'white')
                update.select('.section-arrow')
                    .style('display', d => d.section === 'ROOT' ? 'none' : 'block')
                    .style('transform', d => d.section !== 'PARENTS' ? 'rotate('+180+'deg)' : 'none')
                update.select('.level-number')
                    .style('display', d => d.section !== 'PARENTS' && d.section !== 'ROOT' ? 'block' : 'none')
                    .html(d => d.section)
                update.select('.section-name')
                    .style('padding-left', d => d.section === 'ROOT' ? '13px' : '5px')
                    .style('color', d => d.section === 'ROOT' ? 'white' : color.text)
                    .style('display', d => d.section === 'PARENTS' || d.section === 'ROOT' || d.section === '1' ? 'block' : 'none')
                    .html(d => d.section === '1' ? 'CHILDREN' : d.section)
            })
        }
        // expand and collapse tree
        function handleExpand() {
            if (d3.select('#expand').style('display') === 'block') {
                d3.select("#graph-section").style('width', "40vw")
                d3.select('#expand').style('display', 'none') 
                d3.select('#compress').style('display', 'block') 
                setGraphSectionWidth('40vw')
            } else {
                d3.select("#graph-section").style('width', "60vw")
                d3.select('#expand').style('display', 'block')  
                d3.select('#compress').style('display', 'none') 
                setGraphSectionWidth('60vw')  
            }
        }
        // close filters
        document.addEventListener('click', (e) => {
            if (document.getElementById('level-dropdown')) {
                const levelContainer = document.getElementById('level-dropdown')
                if (!levelContainer.contains(e.target)) {
                    d3.select('#open-levels-btn').style('display', 'block')
                    d3.select('#close-levels-btn').style('display', 'none')  
                    d3.select('#levels-dropdown').style('visibility','hidden') 
                } 
            }
            if (document.getElementById('class-dropdown')) {
                const classContainer = document.getElementById('class-dropdown')
                if (!classContainer.contains(e.target)) {
                    d3.select('#open-classes-btn').style('display', 'block')
                    d3.select('#close-classes-btn').style('display', 'none') 
                    d3.select('#classes-dropdown').style('visibility','hidden')  
                } 
            } 
        })
        // drag behavior
        useEffect(() => {
            const graph = document.getElementById('graph-section')
            const dragBar = document.getElementById('drag-bar')
            if (!graph || !dragBar) return
            let isDragging = false
            dragBar.style.cursor = 'ew-resize'
            dragBar.addEventListener('mousedown', (e) => {
                isDragging = true
                document.body.style.cursor = 'ew-resize'
            })
            document.addEventListener("mousemove", (e) => {
                if (!isDragging) return;
                const newWidth = window.innerWidth - e.clientX;
                graph.style.width = `${Math.max(window.innerWidth*0.4, Math.min(newWidth, window.innerWidth*0.6))}px`;
            });
            let resizeTimeout;
            document.addEventListener('mouseup', (e) => {
                if (isDragging) {
                    const newWidth = window.innerWidth - e.clientX;
                    clearTimeout(resizeTimeout);
                    resizeTimeout = setTimeout(() => {
                        setGraphSectionWidth(Math.max(window.innerWidth*0.4, Math.min(newWidth, window.innerWidth*0.6)));
                    }, 200); 
                    isDragging = false;
                    document.body.style.cursor = 'default';
                }
            })    
        },[])
        // dropdowns
        useEffect(()=>{
            if (nodes.length > 0) {
                const levels = Array.from({length: fullTreeMax + 1}, (_, i) => i)
                d3.select('#levels-dropdown').selectAll('.level').data(levels, d => d)
                .join(enter => {
                    enter.append('p')
                        .classed('level',true)
                        .attr('id', d => 'level-'+d)
                        .style('font-weight', d => maxLevel === d ? 700 : 400)
                        .style('cursor','pointer')
                        .style('width','100%')
                        .style('text-align','center')
                        .style('color', d => maxLevel === d ? color.text : color.textlight)
                        .on('mouseover', (e,d) => d3.select('#level-'+d).style('color', color.text).style('font-weight',700))
                        .on('mouseout', (e,d) => d3.select('#level-'+d).style('color', d => maxLevel === d ? color.text : color.textlight).style('font-weight',() => maxLevel === d ? 700 : 400))
                        .on('click',(e,d) => {
                            setLevelFilter(d)
                            d3.select('#open-levels-btn').style('display', 'block')
                            d3.select('#close-levels-btn').style('display', 'none')  
                            d3.select('#levels-dropdown').style('visibility','hidden')  
                        })
                        .html(d => d)
                },update =>{
                    update
                        .style('font-weight', d => maxLevel === d ? 700 : 400)
                        .style('color', d => maxLevel === d ? color.text : color.textlight)
                        .on('mouseover', (e,d) => d3.select('#level-'+d).style('color', color.text).style('font-weight',700))
                        .on('mouseout', (e,d) => d3.select('#level-'+d).style('color', d => maxLevel === d ? color.text : color.textlight).style('font-weight',() => maxLevel === d ? 700 : 400))
                        .on('click',(e,d) => {
                            setLevelFilter(d)
                            d3.select('#open-levels-btn').style('display', 'block')
                            d3.select('#close-levels-btn').style('display', 'none')  
                            d3.select('#levels-dropdown').style('visibility','hidden')  
                        })
                        .html(d => d)
                })
                d3.select('#classes-dropdown').selectAll('.class').data(allClasses, d => d)
                .join(enter => {
                    const container = enter.append('div')
                        .classed('class',true)   
                    const checkBox = container.append('div') 
                        .classed('check-box',true)
                        .style('cursor','pointer')
                        .attr('id', d => 'check-box-'+d.replace(/\s+/g, ""))
                        .style('background-color', d => classFilter.includes(d) && classFilter.length > 0 ? color.text : 'transparent')
                        .style('border', d => classFilter.includes(d) && classFilter.length > 0 ? '1px solid var(--text)' : '1px solid var(--textlightest)')
                        .on('click', (e,d) => {
                            if (!classFilter.includes(d)) setClassFilter(prev => [...prev, d])
                            else {
                                let newFilter = classFilter.filter(c => c !== d)  
                                setClassFilter(newFilter)
                                if (newFilter.length === 0) {
                                    d3.select('#open-classes-btn').style('display', 'block')
                                    d3.select('#close-classes-btn').style('display', 'none') 
                                    d3.select('#classes-dropdown').style('visibility','hidden')    
                                }
                            }
                        })
                    checkBox.append('i')
                        .classed('check-mark fa-solid fa-check fa-xs',true)
                        .style('color','white')
                        .style('display', d => classFilter.includes(d) && classFilter.length > 0 ? 'block' : 'none')
                    container.append('p')
                        .classed('class-p',true)
                        .attr('id', d => 'class-'+d.replace(/\s+/g, ""))
                        .style('font-weight', d => classFilter.includes(d) && classFilter.length > 0 ? 700 : 400)
                        .style('width','100%')
                        .style('color', d => classFilter.includes(d) && classFilter.length > 0 ? color.text : color.textlight)
                        .html(d => d)
                },update =>{
                    update.select('.check-box')
                        .style('background-color', d => classFilter.includes(d) && classFilter.length > 0 ? color.text : 'transparent')
                        .style('border', d => classFilter.includes(d) && classFilter.length > 0 ? '1px solid var(--text)' : '1px solid var(--textlightest)')
                        .on('click', (e,d) => {
                            if (!classFilter.includes(d)) setClassFilter(prev => [...prev, d])
                            else {
                                let newFilter = classFilter.filter(c => c !== d)  
                                setClassFilter(newFilter)
                                if (newFilter.length === 0) {
                                    d3.select('#open-classes-btn').style('display', 'block')
                                    d3.select('#close-classes-btn').style('display', 'none') 
                                    d3.select('#classes-dropdown').style('visibility','hidden')    
                                }
                            }
                        })
                    update.select('.check-mark')
                        .style('display', d => classFilter.includes(d) && classFilter.length > 0 ? 'block' : 'none')
                    update.select('.class-p')
                        .style('font-weight', d => classFilter.includes(d) && classFilter.length > 0 ? 700 : 400)
                        .style('color', d => classFilter.includes(d) && classFilter.length > 0 ? color.text : color.textlight)
                        .html(d => d)
                })
                let classSelections = classFilter
                if (classFilter.length === 0) classSelections = ['All']
                d3.select('#class-selections').selectAll('.class-selection').data(classSelections, d => d)
                .join(enter => {
                    enter.append('p')
                        .classed('class-selection',true)
                        .html(d => d)
                })
            }
        },[maxLevel,classFilter])
        // call draw functions
        useEffect(()=>{
            if (nodes) {
                if (view === 'Tree') {
                    let width = d3.select("#tree-container").node().getBoundingClientRect().width + margin*2;
                    let height = d3.select("#tree-container").node().getBoundingClientRect().height + margin*2;
                    d3.select("#tree")
                        .attr('width', '100%')
                        .attr('height', '100%')
                        .attr('viewBox', `${margin} ${margin} ${width} ${height}`)
                        .call(d3.zoom().on("start",()=>d3.select("#tree").style("pointer-events", "none")).on("zoom", zoomed)).on("end",()=>d3.select("#tree").style("pointer-events", "all"))
                    d3.select('#tree-container').style('display','block')
                    d3.select('#list-container').style('display','none')
                    drawTree()
                    if (mapRoot) {
                        setZoomCompleted(false)
                        setTimeout(() => {
                            zoomToFit() 
                            setZoomCompleted(true)
                        },400)   
                    } else setTimeout(() => zoomToFit(),400)
                }
                else {
                    d3.select('#list-container').style('display','block')
                    d3.select('#tree-container').style('display','none')
                    drawList()
                }    
            }
        },[nodes,list,conceptNames,mapRoot,graphSectionWidth,view,treeSelections,mapRoot,zoomCompleted])

        return (
            <div id = "sidebar">
                <div id = "drag-bar"></div>
                <div id = "sidebar-heading">
                    <div id = "view-selections">
                        <div id = "view-tree" className="view-btn">
                            <div className = "view-title" style = {{zIndex: 3000,fontWeight: view === 'Tree' ? 700 : 400, color: view === 'Tree' ? color.slate : color.mediumslate}} onClick={() => setView('Tree')}>Tree</div>
                            <div className = "selection-bar" style = {{opacity: view === 'Tree' ? 1 : 0}}></div>
                        </div>
                        <div id = "view-list" className="view-btn">
                            <div className = "view-title" style = {{zIndex: 3000,fontWeight: view === 'List' ? 700 : 400, color: view === 'List' ? color.slate : color.mediumslate}} onClick={() => setView('List')}>List</div>
                            <div className = "selection-bar" style = {{opacity: view === 'List' ? 1 : 0}}></div>
                        </div>
                    </div> 
                    <div id = "concept-selections">
                        <div id = "selection-container">
                            <div className = "concept-selection-btn" id = "add-descendants" style = {{backgroundColor:treeSelections.includes('descendants') ? color.text : 'transparent',color:treeSelections.includes('descendants') ? 'white' : color.text,fontWeight:treeSelections.includes('descendants') ? 700 : 400}} 
                                onMouseOver={() => d3.select('#add-descendants').style('font-weight', 700)}
                                onMouseOut={() => d3.select('#add-descendants').style('font-weight', () => !treeSelections.includes('descendants') ? 400 : 700)}
                                onClick = {() => {
                                    if (!treeSelections.includes('descendants')) {
                                        d3.select('#add-descendants').style('background-color', color.text).style('color','white').style('font-weight',700)
                                        let newConcepts = list.filter(d => d.levels !== '-1')
                                        newConcepts = newConcepts.filter(d => !d.leaf ? d.total_counts !== 0 : d).map(d => {return {name:d.name,data:d.data}})
                                        setSelectedConcepts(newConcepts)
                                        setTreeSelections(['descendants'])
                                    } else {
                                        d3.select('#add-descendants').style('background-color', 'transparent').style('color',color.text).style('font-weight',400)
                                        // let descendantNames = list.map(d => d.name)
                                        // let filteredConcepts = selectedConcepts.filter(e => !descendantNames.includes(e.name))
                                        setSelectedConcepts([]) 
                                        // let newSelections = treeSelections.filter(s => s !== 'descendants')  
                                        setTreeSelections([])
                                    }
                                    
                                }}>
                                Descendants
                            </div>
                            <div className = "concept-selection-btn" id = "add-mappings" style = {{backgroundColor:treeSelections.includes('mappings') ? color.text : 'transparent',color:treeSelections.includes('mappings') ? 'white' : color.text,fontWeight:treeSelections.includes('mappings') ? 700 : 400}}
                                onMouseOver={() => d3.select('#add-mappings').style('font-weight', 700)}
                                onMouseOut={() => d3.select('#add-mappings').style('font-weight', () => !treeSelections.includes('mappings') ? 400 : 700)}
                                onClick = {() => {
                                    let mappings = list.filter(d => d.relationship !== 'Parent').flatMap(d => d.mappings)
                                    if (!treeSelections.includes('mappings')) {
                                        d3.select('#add-mappings').style('background-color', color.text).style('color','white').style('font-weight',700)
                                        let newConcepts = mappings
                                        newConcepts = newConcepts.filter(d => !d.leaf ? d.total_counts !== 0 : d).map(d => {return {name:d.name,data:d.data}})
                                        setSelectedConcepts(newConcepts)
                                        setTreeSelections(['mappings'])
                                    } else {
                                        d3.select('#add-mappings').style('background-color', 'transparent').style('color',color.text).style('font-weight',400)
                                        // let mapNames = mappings.map(d => d.name)
                                        // let filteredConcepts = selectedConcepts.filter(e => !mapNames.includes(e.name))
                                        setSelectedConcepts([])   
                                        // let newSelections = treeSelections.filter(s => s !== 'mappings')  
                                        setTreeSelections([])
                                    }
                                }}>
                                Mappings
                            </div>  
                        </div>
                        <div className = "concept-selection-btn" id = "remove-all" style = {{width: 100,border:'none'}}
                                onMouseOver={() => d3.select('#remove-all').style('font-weight', 700)}
                                onMouseOut={() => d3.select('#remove-all').style('font-weight', 400)}
                                onClick = {() => {
                                    d3.select('#add-mappings').style('background-color', 'transparent').style('color',color.text).style('font-weight',400)
                                    d3.select('#add-descendants').style('background-color', 'transparent').style('color',color.text).style('font-weight',400)
                                    setSelectedConcepts([])   
                                    setTreeSelections([])
                                }}>
                                Remove all
                        </div> 
                    </div>
                    <div id = "filter-container">
                        {/* <p style = {{fontSize:10,fontWeight:700,paddingRight:5,paddingTop:3.5,margin:0}}>FILTERS |</p> */}
                        <div className="dropdown-container" id = "level-dropdown">
                            <div className = "concept-selection-btn" style = {{width:'auto',border:'none',alignItems:'flex-start'}}>
                                <p style = {{paddingRight:4}}>Max level:</p>
                                <div className = "dropdown-header" id = "levels-header"
                                    onMouseOver={() => d3.select('#open-levels-btn').style('opacity', 1)}
                                    onMouseOut={() => d3.select('#open-levels-btn').style('opacity', 0.3)}
                                    onClick = {() => {
                                        if (d3.select('#open-levels-btn').style('display') === 'block') {
                                            d3.select('#open-levels-btn').style('display', 'none')
                                            d3.select('#close-levels-btn').style('display', 'block') 
                                            d3.select('#levels-dropdown').style('visibility','visible')
                                        } else {
                                            d3.select('#open-levels-btn').style('display', 'block')
                                            d3.select('#close-levels-btn').style('display', 'none')  
                                            d3.select('#levels-dropdown').style('visibility','hidden')
                                        }
                                    }}
                                >
                                    <p id = "max-level" style = {{marginTop:1,fontWeight:700,padding:'1px 5px 1px 3px'}}>{maxLevel}</p>
                                    <FontAwesomeIcon className = "dropBtn fa-lg" id = 'open-levels-btn' icon={faCaretDown} style = {{display:'block',opacity: 0.3,padding:'1px 3px 1px 5px'}}/>
                                    <FontAwesomeIcon className = "dropBtn fa-lg" id = 'close-levels-btn' icon={faCaretUp} style = {{display:'none',opacity: 1,padding:'2px 3px 1px 5px'}}/>     
                                </div>
                            </div>   
                            <div className = "selections-dropdown-content" id = "levels-dropdown" style = {{right:10}}></div>  
                             <FontAwesomeIcon style = {{display: levelFilter ? 'block' : 'none'}} className = "reset-filter fa-xs" id = "reset-level" icon={faX} 
                                onClick = {() => {
                                    setLevelFilter()
                                    d3.select('#open-levels-btn').style('display', 'block')
                                    d3.select('#close-levels-btn').style('display', 'none') 
                                    d3.select('#levels-dropdown').style('visibility','hidden')
                                }}
                            />
                        </div> 
                        <div className="dropdown-container" id = "class-dropdown">
                            <div className = "concept-selection-btn" style = {{width:'auto',border:'none',alignItems:'flex-start'}}>
                                <p style = {{paddingRight:4,marginLeft:levelFilter ? 10 : 0}}>Classes:</p>
                                <div className = "dropdown-header" id = "classes-header"
                                    onMouseOver={() => d3.select('#open-classes-btn').style('opacity', 1)}
                                    onMouseOut={() => d3.select('#open-classes-btn').style('opacity', 0.3)}
                                    onClick = {() => {
                                        if (d3.select('#open-classes-btn').style('display') === 'block') {
                                            d3.select('#open-classes-btn').style('display', 'none')
                                            d3.select('#close-classes-btn').style('display', 'block') 
                                            d3.select('#classes-dropdown').style('visibility','visible')
                                        } else {
                                            d3.select('#open-classes-btn').style('display', 'block')
                                            d3.select('#close-classes-btn').style('display', 'none')  
                                            d3.select('#classes-dropdown').style('visibility','hidden')
                                        }
                                    }}
                                >
                                    <div id = "class-selections"></div>
                                    <FontAwesomeIcon className = "dropBtn fa-lg" id = 'open-classes-btn' icon={faCaretDown} style = {{display:'block',opacity: 0.3,padding:'1px 3px 1px 5px'}}/>
                                    <FontAwesomeIcon className = "dropBtn fa-lg" id = 'close-classes-btn' icon={faCaretUp} style = {{display:'none',opacity: 1,padding:'2px 3px 1px 5px'}}/>     
                                </div>
                            </div>   
                            <div className = "selections-dropdown-content" id = "classes-dropdown" style = {{right:-15,alignItems:'flex-start'}}></div>  
                            <FontAwesomeIcon style = {{display: classFilter.length > 0 ? 'block' : 'none'}} className = "reset-filter fa-xs" id = "reset-class" icon={faX} 
                                onClick = {() => {
                                    setClassFilter([])
                                    d3.select('#open-classes-btn').style('display', 'block')
                                    d3.select('#close-classes-btn').style('display', 'none') 
                                    d3.select('#classes-dropdown').style('visibility','hidden')
                                }}
                            />
                        </div>    
                    </div>
                </div>
                <div className = "box-shadow" id = "sidebar-content">
                    <FontAwesomeIcon style = {{display:'block'}} icon={faExpand} id = "expand" className = "fa-thin fa-lg expand-compress" onClick={handleExpand} />
                    <FontAwesomeIcon style = {{display:'none'}} icon={faCompress} id = "compress" className = "fa-thin fa-lg expand-compress" onClick={handleExpand} /> 
                    <div id = "tree-container" style = {{display: view === 'Tree' ? 'block' : 'none'}}>  
                        <svg id = "tree">
                            <g id = "tree-graphics">
                                <g id = "key"></g>
                                <g id = "links"></g>
                                <g id = "nodes"></g>    
                            </g>
                        </svg>    
                    </div>
                    <div id = "list-container" style = {{display: view === 'List' ? 'block' : 'none'}}></div>
                </div>
            </div>     
        )
    }

    export default SideBar;