    import React, { useEffect, useState } from 'react';
    import { useNavigate } from 'react-router-dom';
    import '@fortawesome/fontawesome-free/css/all.min.css';
    import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
    import openedEye from '../../img/opened-eye.svg'
    import closedEye from '../../img/closed-eye.svg'
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
    import po from '../../po.js';
    import textures from 'textures';
import { hover } from '@testing-library/user-event/dist/hover.js';

    function SideBar (props) {
        const navigate = useNavigate()
        const color = props.color
        const selectedConcepts = props.selectedConcepts
        const setSelectedConcepts = props.setSelectedConcepts
        const sidebarRoot = props.sidebarRoot
        const mapRoot = props.mapRoot
        const setMapRoot = props.setMapRoot
        const tooltipHover = props.tooltipHover
        // const conceptHover = props.conceptHover
        const updateConcepts = props.updateConcepts
        const conceptNames = props.conceptNames
        const view = props.view
        const setView = props.setView
        // const getValidity = props.getValidity
        const nodes = props.nodes
        const links = props.links
        const list = props.list
        const relationship = props.relationship
        const setRelationship = props.setRelationship
        const levelFilter = props.levelFilter
        const setLevelFilter = props.setLevelFilter
        const maxLevel = props.maxLevel
        const fullTreeMax = props.fullTreeMax
        const allClasses = props.allClasses
        const classFilter = props.classFilter
        const setClassFilter = props.setClassFilter
        const pruned = props.pruned
        const poset = props.poset 
        const setPoset = props.setPoset
        const getConceptInfo = props.getConceptInfo
        const setNodes = props.setNodes
        const setLinks = props.setLinks
        const fullTree = props.fullTree
        const biDirectional = props.biDirectional
        const drawingComplete = props.drawingComplete
        const setDrawingComplete = props.setDrawingComplete
        const initialPrune = props.initialPrune
        const setInitialPrune = props.setInitialPrune
        const hovered = props.hovered
        const setHovered = props.setHovered
        const removedClasses = props.removedClasses
        const setRemovedClasses = props.setRemovedClasses
        const graphSectionWidth = props.graphSectionWidth
        const setGraphSectionWidth = props.setGraphSectionWidth
        const fullClassList = props.fullClassList
        const descendantsFilter = props.descendantsFilter
        const setDescendantsFilter = props.setDescendantsFilter
        const excludeList = props.excludeList
        const setExcludeList = props.setExcludeList
        // const centers = props.centers
        const inclusions = props.inclusions
        const setInclusions = props.setInclusions
        const getInclusions = props.getInclusions
        const getCounts = props.getCounts
        const setPruned = props.setPruned
        const edges = props.edges
        const linearLayout = props.linearLayout
        const setLoading = props.setLoading
        const getMidX = props.getMidX
        const subspaces = props.subspaces
        const spaceSubspaces = props.spaceSubspaces
        const nWidth = props.nWidth
        const moveSlider = props.moveSlider
        const updateWidth = props.updateWidth
        const showConfirmation = props.showConfirmation
        const showConfirmationPopup = props.showConfirmationPopup
        const showActionLabel = props.showActionLabel
        const formatThousands = props.formatThousands
        const clearHideTimer = props.clearHideTimer
        const setShowConfirmation = props.setShowConfirmation
        const margin = 10
        let hoverTimeout = null
        let currentTarget = null

        // TREE AND LIST FUNCTIONS        
        function getYPosition(source, axis, cy, node) {
            const mappings = nodes.filter(n => n.name === source.name)[0].mappings
            const direction = mappings.filter(d => d.name === node.name)[0].direction
            const generation = mappings.filter(d => d.direction === direction).sort((a,b) => b.total_counts - a.total_counts)
            const index = generation.map(d => d.name).indexOf(node.name) 
            let gap = 0
            if (axis === 'y') gap = !mapRoot.includes(source.name) ? 20 : 105
            else gap = (d3.select("#tree").node().getBoundingClientRect().height/generation.length)/15 + 5
            const adjustment = generation.length % 2 !== 0 ? 0 : gap/2
            const median = Math.floor(generation.length/2) 
            let position = 0
            if (index >= median) position = cy + ((index - median) * gap) + adjustment
            else position = cy - ((median - index) * gap) + adjustment
            return position
        }   
        function hoverNode(d, mode) {
            if (mode === "enter") {
                if (!conceptNames.includes(d.name)) {
                    if (!nodes.map(e => e.name).includes(d.name)) {
                        d3.select('#map-tree-circle-' + d.name).attr('stroke',d.color).style('fill',d.color)
                        d3.select('#map-tree-text-'+d.name).attr('fill',color.text)
                        d3.select('#map-vocabulary-'+d.name).attr('fill',color.textlight)
                        // d3.select('#map-alt-text-'+d.name).attr('fill',color.text)
                    }
                    else {
                        d3.select('#tree-circle-' + d.name).attr('stroke',d.color).attr('fill',d.color)
                        d3.select('#tree-text-'+d.name).attr('fill',color.text)
                        d3.select('#node-vocabulary-'+d.name).attr('fill',color.textlight)
                        // d3.select('#alt-text-'+d.name).attr('fill',color.text)
                        d3.select("#button-symbol-"+d.name).attr('stroke','white')
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
                        d3.select('#map-tree-circle-' + d.name).attr('stroke',color.textlightest).style('fill','white')
                        d3.select('#map-tree-text-'+d.name).attr('fill',color.textlight)
                        d3.select('#map-vocabulary-'+d.name).attr('fill',color.textlightest)
                        // d3.select('#map-alt-text-'+d.name).attr('fill',color.textlight)
                    }
                    else {
                        d3.select('#tree-circle-' + d.name).attr('stroke',color.textlightest).attr('fill','white')
                        d3.select('#tree-text-'+d.name).attr('fill',color.textlight)
                        d3.select('#node-vocabulary-'+d.name).attr('fill',color.textlightest)
                        // d3.select('#alt-text-'+d.name).attr('fill',()=>sidebarRoot.name.includes(d.name) ? color.text : color.textlight)
                        d3.select("#button-symbol-"+d.name).attr('stroke', () => (d.leaf && d.children.length > 0 && d.descendant_counts !== d.total_counts) ? color.text : 'white')
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
        function zoomToFit(padding = 20) {
            const svgNode = d3.select('#tree').node()
            const gNode = d3.select('#tree-graphics').node()
            const svgWidth = svgNode.getBoundingClientRect().width + padding*2
            const svgHeight = svgNode.getBoundingClientRect().height + padding*2
            const bbox = gNode.getBBox()
            const width = bbox.width
            const height = bbox.height
            const x = bbox.x
            const y = bbox.y
            if (width === 0 || height === 0) return
            let scale = Math.min((svgWidth - padding) / width,(svgHeight - padding) / height)
            if (nodes.length === 1) scale = scale / 2
            const translateX = (svgWidth - width * scale) / 2 - x * scale 
            const translateY = (svgHeight - height * scale) / 2 - y * scale 
            d3.select('#tree-graphics').transition().attr("transform", `translate(${translateX},${translateY}) scale(${scale})`)
        }
        function setExcludeInclude(type,id) {
            let eList = excludeList
            let dFilter = descendantsFilter
            if (type === 'descendants') {
                // clicked
                if (descendantsFilter.includes(id)) {
                    dFilter = descendantsFilter.filter(e => e !== id)
                    setDescendantsFilter(dFilter)
                }
                // unclicked
                else {
                    dFilter = [...descendantsFilter,id]
                    setDescendantsFilter(dFilter)
                }
            } else {
                // unclicked
                if (excludeList.includes(id)) {
                    eList = excludeList.filter(e => e !== id)
                    setExcludeList(eList)
                }
                // clicked
                else {
                    eList = [...excludeList,id]
                    setExcludeList(eList)
                }
            }
            const newInclusions = sidebarRoot.name.map(r => nodes.map(n => n.name).includes(r) ? getInclusions(sidebarRoot.name,fullTree.nodes,r,eList,dFilter,nodes.find(n => n.name === r).descendants) : getInclusions(sidebarRoot.name,fullTree.nodes,r,eList,dFilter,fullTree.nodes.find(n => n.name === r).descendants.filter(d => classFilter.includes('All') ? d : classFilter.includes(fullTree.nodes.find(n => n.name === d).class)))).flat().filter((e,n,l) => l.indexOf(e) === n)
                .filter(i => fullTree.nodes.find(n => n.name === i).levels !== '-1')
                .map(i => relationship === 'mappings' ? fullTree.nodes.find(n => n.name === i).mappings.map(m => m.name) : i).flat()   
                .filter(i => sidebarRoot.data.concepts.find(c => c.concept_id === i).record_counts !== 0)
            updateConcepts(newInclusions,nodes,[],[])
        }
                        
        // DRAWING
        // concept set
        function drawSet() {
            const conceptSetData = sidebarRoot.name.map(root => ({id:root,descendant_counts:nodes.find(n => n.name === root) ? nodes.find(n => n.name === root).descendant_counts : getCounts(sidebarRoot.data.stratified_code_counts.filter(c => fullTree.nodes.find(n => n.name === root).descendants.filter(d => inclusions.includes(d)).includes(c.concept_id)  || fullTree.nodes.find(n => n.name === root).descendants.map(d => fullTree.nodes.find(n => n.name === d).mappings.map(m => m.name)).flat().filter(d => inclusions.includes(d)).includes(c.concept_id)),'node_record_counts'),concept:sidebarRoot.data.concepts.find(d => d.concept_id === root),descendants:descendantsFilter.includes(root) ? false : true,exclude:excludeList.includes(root) ? true : false}))
            d3.select('#set-container').selectAll('.set-item').data(conceptSetData, d => d.id)
            .join(enter => {
                const container = enter.append('div')
                    .classed('set-item',true)
                    .attr('id', d => 'set-item-'+d.id)
                const title = container.append('div')
                    .classed('set-title',true)
                    .style('display','flex')
                    .style('align-items','center')
                    .style('justify-content','flex-start')
                    .style('flex-grow',1)
                    .style('max-width','calc(100% - 260px)')
                    // .style('width','calc(100% - 300px)')
                    .style('margin-right','5px')
                    .style('cursor','pointer')
                    .on('mouseover',(e,d)=>d3.select('#set-x-'+d.id).style("display",'block').transition(100).style('opacity',1).style('margin-right','4px'))
                    .on('mouseout',(e,d)=>d3.select('#set-x-'+d.id).style("display",'none').transition(100).style('opacity',1).style('margin-right','0px'))
                    .on('click',(e,d) => {
                        const array = sidebarRoot.name.filter(root => root !== d.id)
                        if (array.length === 0) navigate(`/`) 
                        else {
                            const arrayToString = sidebarRoot.name.filter(root => root !== d.id).join(",")
                            navigate(`/${arrayToString}`)    
                        }
                    })
                title.append('i')
                    .classed('set-x fa-solid fa-x fa-xs',true)
                    .attr('id', d => 'set-x-'+d.id)
                    .style('margin-right','0px')
                    .style('margin-bottom','1px')
                    .style('display','none')
                    .style('opacity',1)
                    // .on('click',(e,d) => {
                    //     const arrayToString = sidebarRoot.name.filter(root => root !== d.id).join(",")
                    //     navigate(`/${arrayToString}`)
                    // })
                const p = title.append('p')
                    .html(d => d.concept.concept_name)
                    .style('font-weight',700)
                    .style('color', color.text)
                    .style('padding-right', '4px')
                p.append('span')
                    .html(d => d.concept.concept_code)
                    .style('color',color.text)
                    .style('font-weight',700)
                    .style('font-size','10px')
                    .style('margin-left', '5px')
                    .style('margin-right', '5px')
                p.append('span')
                    .html(d => d.concept.vocabulary_id)
                    .style('color',color.textlight)
                    .style('font-weight',400)
                    .style('font-size','10px')
                    .style('margin-right', '5px')    
                const selections = container.append('div')
                    .style('width','170px')
                    .style('margin-right','10px')
                    .style('display','flex')
                    .style('align-items','center')
                    .style('justify-content','space-between')
                const descendants = selections.append('div')
                    .style('display','flex')
                    .style('align-items','center')
                    .style('justify-content','flex-start')
                descendants.append('p')
                    .classed('descendants-p',true)
                    .html('Descendants')
                    .style('margin-right','5px')
                    .style('color', d => d.descendants ? color.text : color.textlight)
                const descendantsBox = descendants.append('div')
                    .classed('descendants-box',true)
                    .style('display','flex')
                    .style('align-items','center')
                    .style('justify-content','center')
                    .style("width",'15px')  
                    .style('height','15px')  
                    .style('cursor','pointer')
                    .style('background-color', d => d.descendants ? color.text : 'transparent')
                    .style('border', d => d.descendants ? '1px solid var(--text)' : '1px solid var(--textlightest)')
                    .on('click', (e,d) => {
                        setExcludeInclude('descendants',d.id)
                    })
                descendantsBox.append('i')
                    .classed('descendants-check fa-solid fa-check fa-xs',true)
                    .style('color','white')
                    .style('padding-bottom','1px')
                    .style('display', d => d.descendants ? 'block' : 'none')
                const exclude = selections.append('div')
                    .style('display','flex')
                    .style('align-items','center')
                    .style('justify-content','flex-start')
                exclude.append('p')
                    .classed('exclude-p',true)
                    .html('Exclude')
                    .style('margin-right','5px')
                    .style('color', d => d.exclude ? color.text : color.textlight)
                const excludeBox = exclude.append('div')
                    .classed('exclude-box',true)
                    .style('display','flex')
                    .style('align-items','center')
                    .style('justify-content','center')
                    .style("width",'15px')  
                    .style('height','15px')  
                    .style("cursor","pointer")
                    .style('background-color', d => d.exclude ? color.text : 'transparent')
                    .style('border', d => d.exclude ? '1px solid var(--text)' : '1px solid var(--textlightest)')
                    .on('click', (e,d) => {
                        setExcludeInclude('exclude',d.id)
                    })
                excludeBox.append('i')
                    .classed('exclude-check fa-solid fa-check fa-xs',true)
                    .style('color','white')
                    .style('padding-bottom','1px')
                    .style('display', d => d.exclude ? 'block' : 'none')
                container.append('div')
                    .classed('set-counts',true)
                    .style('width','50px')
                    .style('margin-left','20px')
                    .style('font-size','10px')
                    .style('text-align','right')
                    .html(d => d.descendant_counts)
            },update => {
                update.select('.set-title')
                    .on('click',(e,d) => {
                        const array = sidebarRoot.name.filter(root => root !== d.id)
                        if (array.length === 0) navigate(`/`) 
                        else {
                            const arrayToString = sidebarRoot.name.filter(root => root !== d.id).join(",")
                            navigate(`/${arrayToString}`)    
                        }
                    })
                update.select('.descendants-p')
                    .style('color', d => d.descendants ? color.text : color.textlight)
                update.select('.descendants-box')
                    .style('background-color', d => d.descendants ? color.text : 'transparent')
                    .style('border', d => d.descendants ? '1px solid var(--text)' : '1px solid var(--textlightest)')
                    .on('click', (e,d) => {
                        setExcludeInclude('descendants',d.id)
                    })
                update.select('.descendants-check')
                    .style('display', d => d.descendants ? 'block' : 'none')
                update.select('.exclude-p')
                    .style('color', d => d.exclude ? color.text : color.textlight)
                update.select('.exclude-box')
                    .style('background-color', d => d.exclude ? color.text : 'transparent')
                    .style('border', d => d.exclude ? '1px solid var(--text)' : '1px solid var(--textlightest)')
                    .on('click', (e,d) => {
                        setExcludeInclude('exclude',d.id)
                    })
                update.select('.exclude-check')
                    .style('display', d => d.exclude ? 'block' : 'none')
                update.select('.set-counts')
                   .html(d => d.descendant_counts)
            })
        }
        // tree
        function drawTree() {
            console.log('nodes',nodes,'links',links,'selected',selectedConcepts)
            // get extent of total counts
            let sums = []
            nodes.forEach(node => {
                sums.push(Math.sqrt(node.total_counts))
                node.mappings.forEach(map => sums.push(Math.sqrt(map.total_counts)))
            })
            const extent = d3.extent(sums)
            const scaleRadius = d3.scaleLinear().domain([0, extent[1]]).range(extent[1] === 0 ? [4,4] : [12, 30])
            // get dimensions
            let genHeight
            let num
            let width = d3.select("#tree").node().getBoundingClientRect().width + margin*2
            let nodeHeight = 60
            let maxLevel = d3.max(nodes.map(d => d.distance))
            if (maxLevel === 0) {
                num = 200
                genHeight = [num]
            }
            else {
                let svgHeight = d3.select("#tree").node().getBoundingClientRect().height
                num = (svgHeight/maxLevel - 12) < 200 ? 200 : (svgHeight/maxLevel - 12)
                let length = maxLevel + 1
                genHeight = Array.from({length}, (_, i) => i * num)
                let bufferedHeights = []
                let maxArray = Array.from({length}, (_, i) => 0)
                if (mapRoot.length > 0) {
                    genHeight.forEach((h,i) => {
                        if (i === 0) bufferedHeights.push(0)
                        else {
                            let generation = nodes.filter(d => d.distance === i)
                            let prevGeneration = nodes.filter(d => d.distance === i - 1)
                            let thisIncludesMappings = mapRoot.some(element => generation.map(d => d.name).includes(element))
                            let prevIncludesMappings = mapRoot.some(element => prevGeneration.map(d => d.name).includes(element))
                            let prevMax = maxArray[i-1]
                            if (thisIncludesMappings) {
                                let thisMax = Math.max(...generation.filter(d => mapRoot.includes(d.name)).map(d => d.mappings).map(mappings => mappings.length))*nodeHeight 
                                maxArray[i] = thisMax
                                if (prevIncludesMappings) thisMax + prevMax > num ? bufferedHeights.push(bufferedHeights[i-1] + thisMax + prevMax) : bufferedHeights.push(bufferedHeights[i-1] + num)
                                else thisMax > num ? bufferedHeights.push(bufferedHeights[i-1] + thisMax) : bufferedHeights.push(bufferedHeights[i-1] + num)
                            }
                            else if (prevIncludesMappings) prevMax > num ? bufferedHeights.push(bufferedHeights[i-1] + prevMax) : bufferedHeights.push(bufferedHeights[i-1] + num)
                            else bufferedHeights.push(bufferedHeights[i-1] + num)
                        }
                    })    
                    genHeight = bufferedHeights
                }
            }
            
            let cx = width/2 + margin
            let cy = 50
            const arrowSize = 20
            const curveY = d3.link(d3.curveBumpY)
            const curveX = d3.link(d3.curveBumpX)
            const customCurve = d3.line()
                .x(d => d.x)
                .y(d => d.y)
                .curve(d3.curveBasis)
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
                .attr("stop-color", color.textmedium)
                .attr("stop-opacity", 0.6)
            linearGradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", color.textmedium)
                .attr("stop-opacity", 0.2)
            // get subsumes label positioning
            const getLabel = d => {
                let labelPosition = {x: 0, y: 0}
                    labelPosition.x = d.data.concept.standard_concept ? d.x : d.x ;
                    labelPosition.y = d.total_counts > 0 ? cy + (genHeight[d.distance]) - scaleRadius(Math.sqrt(d.total_counts)) - 7 : cy + (genHeight[d.distance]) - scaleRadius(Math.sqrt(d.total_counts)) - 9; 
                return labelPosition 
            }
            // get map node positioning 
            const getMap = d => {
                let mapPosition = {x: 0, y: 0}
                if (mapRoot.includes(d.source.name)) {
                    mapPosition.x = d.source.x + d.direction*120
                } else {
                    mapPosition.x = d.source.x + d.direction*(scaleRadius(Math.sqrt(d.source.total_counts)) + 20)
                }
                mapPosition.y = d.total_counts > 0 ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) - scaleRadius(Math.sqrt(d.total_counts)) - 7 : getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) - scaleRadius(Math.sqrt(d.total_counts)) - 9
                return mapPosition
            }
            function getX(d) {return getMap(d).x}
            function getY(d) {return getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) + scaleRadius(Math.sqrt(d.total_counts)) + 11}
            // DRAW LINKS
            function updateLinks() {
                d3.select('#links').selectAll('.tree-link').data(links, d => d.source.name+d.target.name)
                    .join(enter => {
                        const geometry = enter.append('g')  
                            .classed('tree-link', true) 
                        const line = geometry.append('g')
                            .classed('tree-line', true)
                            .attr('id', d => 'tree-line-' + d.source.name+d.target.name)
                            .style('opacity', d => hovered.includes(d.source.name) && hovered.includes(d.target.name) ? 1 : hovered.length > 0 ? 0.2 : 1)
                            line.append('path')
                                .classed('line-path',true)
                                .style('cursor','pointer')
                                .attr('fill','none')
                                .attr('stroke', d => (inclusions.includes(d.source.name) || d.source.mappings.map(m => m.name).some(m => inclusions.includes(m))) && (inclusions.includes(d.target.name) || d.target.mappings.map(m => m.name).some(m => inclusions.includes(m))) ? color.textmedium : color.textlightest)
                                .attr('stroke-width', 1.5)
                                .attr("d", d => {
                                    let sourceX = d.source.x
                                    let sourceY = d.source.distance > d.target.distance ? cy + (genHeight[d.source.distance]) - scaleRadius(Math.sqrt(d.source.total_counts)) - 43 : cy + (genHeight[d.source.distance]) + scaleRadius(Math.sqrt(d.source.total_counts)) + 18
                                    let targetX = d.target.x
                                    let targetY = d.source.distance >= d.target.distance ? cy + (genHeight[d.target.distance]) + scaleRadius(Math.sqrt(d.target.total_counts)) + 23 : cy + (genHeight[d.target.distance]) - scaleRadius(Math.sqrt(d.target.total_counts)) - 43
                                    if (d.source.distance === d.target.distance) {
                                        const points =  [
                                            { x: sourceX, y: sourceY },
                                            { x: sourceX, y: sourceY + 24 },   
                                            { x: (sourceX + targetX)/2, y: sourceY + 60 },
                                            { x: targetX, y: targetY + 24 },    
                                            { x: targetX, y: targetY }
                                        ]
                                        return customCurve(points)
                                    }
                                    else return curveY({source: [sourceX, sourceY], target: [targetX, targetY]})
                                })
                                // .on('mouseover', (e,d) => setHovered([d.source.name,d.target.name]))
                                // .on('mouseout', (e,d) => setHovered([]))
                            line.append('path')
                                .classed('line-background',true)
                                .style('cursor','pointer')
                                .attr('fill','none')
                                .attr('stroke','transparent')
                                .attr('stroke-width',5)
                                .attr("d", d => {
                                    let sourceX = d.source.x
                                    let sourceY = d.source.distance > d.target.distance ? cy + (genHeight[d.source.distance]) - scaleRadius(Math.sqrt(d.source.total_counts)) - 43 : cy + (genHeight[d.source.distance]) + scaleRadius(Math.sqrt(d.source.total_counts)) + 18
                                    let targetX = d.target.x
                                    let targetY = d.source.distance >= d.target.distance ? cy + (genHeight[d.target.distance]) + scaleRadius(Math.sqrt(d.target.total_counts)) + 23 : cy + (genHeight[d.target.distance]) - scaleRadius(Math.sqrt(d.target.total_counts)) - 43
                                    if (d.source.distance === d.target.distance) {
                                        const points =  [
                                            { x: sourceX, y: sourceY },
                                            { x: sourceX, y: sourceY + 24 },   
                                            { x: (sourceX + targetX)/2, y: sourceY + 60 },
                                            { x: targetX, y: targetY + 24 },    
                                            { x: targetX, y: targetY }
                                        ]
                                        return customCurve(points)
                                    }
                                    else return curveY({source: [sourceX, sourceY], target: [targetX, targetY]})
                                })
                                .on('mouseover', (e,d) => setHovered([d.source.name,d.target.name]))
                                .on('mouseout', (e,d) => setHovered([]))
                            line.append('path')
                                .classed('tree-arrow', true)
                                .attr('fill', d => (inclusions.includes(d.source.name) || d.source.mappings.map(m => m.name).some(m => inclusions.includes(m))) && (inclusions.includes(d.target.name) || d.target.mappings.map(m => m.name).some(m => inclusions.includes(m))) ? color.textmedium : color.textlightest)
                                .attr("d", d3.symbol().type(d3.symbolTriangle).size(arrowSize))
                                .attr("transform", d => {
                                    let x = d.target.x
                                    let y = d.source.distance >= d.target.distance ? d.target.total_counts !== 0 ? cy + (genHeight[d.target.distance]) + scaleRadius(Math.sqrt(d.target.total_counts)) + 23 : cy + (genHeight[d.target.distance]) + scaleRadius(Math.sqrt(d.target.total_counts)) + 25 : d.target.total_counts !== 0 ? cy + (genHeight[d.target.distance]) - scaleRadius(Math.sqrt(d.target.total_counts)) - 43 : cy + (genHeight[d.target.distance]) - scaleRadius(Math.sqrt(d.target.total_counts)) - 45
                                    return d.source.distance >= d.target.distance ? "translate(" + x + "," + y + ")" : "translate(" + x + "," + y + ")rotate(" + 180 + ")"
                                }) 
                        return geometry 
                    }, update => {
                            update.select('.tree-line')
                                .transition()
                                .style('opacity', d => hovered.includes(d.source.name) && hovered.includes(d.target.name) ? 1 : hovered.length > 0 ? 0.2 : 1)
                            update.select('.line-background')
                                .attr("d", d => {
                                    let sourceX = d.source.x
                                    let sourceY = d.source.distance > d.target.distance ? cy + (genHeight[d.source.distance]) - scaleRadius(Math.sqrt(d.source.total_counts)) - 43 : cy + (genHeight[d.source.distance]) + scaleRadius(Math.sqrt(d.source.total_counts)) + 18
                                    let targetX = d.target.x
                                    let targetY = d.source.distance >= d.target.distance ? cy + (genHeight[d.target.distance]) + scaleRadius(Math.sqrt(d.target.total_counts)) + 23 : cy + (genHeight[d.target.distance]) - scaleRadius(Math.sqrt(d.target.total_counts)) - 43
                                    if (d.source.distance === d.target.distance) {
                                        const points =  [
                                            { x: sourceX, y: sourceY },
                                            { x: sourceX, y: sourceY + 24 },   
                                            { x: (sourceX + targetX)/2, y: sourceY + 60 },
                                            { x: targetX, y: targetY + 24 },    
                                            { x: targetX, y: targetY }
                                        ]
                                        return customCurve(points)
                                    }
                                    else return curveY({source: [sourceX, sourceY], target: [targetX, targetY]})
                                })
                                .on('mouseover', (e,d) => setHovered([d.source.name,d.target.name]))
                                .on('mouseout', (e,d) => setHovered([]))
                            update.select('.line-path')
                                .attr('stroke', d => (inclusions.includes(d.source.name) || d.source.mappings.map(m => m.name).some(m => inclusions.includes(m))) && (inclusions.includes(d.target.name) || d.target.mappings.map(m => m.name).some(m => inclusions.includes(m))) ? color.textmedium : color.textlightest)
                                .attr("d", d => {
                                    let sourceX = d.source.x
                                    let sourceY = d.source.distance > d.target.distance ? cy + (genHeight[d.source.distance]) - scaleRadius(Math.sqrt(d.source.total_counts)) - 43 : cy + (genHeight[d.source.distance]) + scaleRadius(Math.sqrt(d.source.total_counts)) + 18
                                    let targetX = d.target.x
                                    let targetY = d.source.distance >= d.target.distance ? cy + (genHeight[d.target.distance]) + scaleRadius(Math.sqrt(d.target.total_counts)) + 23 : cy + (genHeight[d.target.distance]) - scaleRadius(Math.sqrt(d.target.total_counts)) - 43
                                    if (d.source.distance === d.target.distance) {
                                        const points =  [
                                            { x: sourceX, y: sourceY },
                                            { x: sourceX, y: sourceY + 24 },   
                                            { x: (sourceX + targetX)/2, y: sourceY + 60 },
                                            { x: targetX, y: targetY + 24 },    
                                            { x: targetX, y: targetY }
                                        ]
                                        return customCurve(points)
                                    }
                                    else return curveY({source: [sourceX, sourceY], target: [targetX, targetY]})
                                })
                                // .on('mouseover', (e,d) => setHovered([d.source.name,d.target.name]))
                                // .on('mouseout', (e,d) => setHovered([]))
                            update.select('.tree-arrow')
                                .transition()
                                .duration(500)
                                .attr('fill', d => (inclusions.includes(d.source.name) || d.source.mappings.map(m => m.name).some(m => inclusions.includes(m))) && (inclusions.includes(d.target.name) || d.target.mappings.map(m => m.name).some(m => inclusions.includes(m))) ? color.textmedium : color.textlightest)
                                .attr("d", d3.symbol().type(d3.symbolTriangle).size(arrowSize))
                                .attr("transform", d => {
                                    let x = d.target.x
                                    let y = d.source.distance >= d.target.distance ? d.target.total_counts !== 0 ? cy + (genHeight[d.target.distance]) + scaleRadius(Math.sqrt(d.target.total_counts)) + 23 : cy + (genHeight[d.target.distance]) + scaleRadius(Math.sqrt(d.target.total_counts)) + 25 : d.target.total_counts !== 0 ? cy + (genHeight[d.target.distance]) - scaleRadius(Math.sqrt(d.target.total_counts)) - 43 : cy + (genHeight[d.target.distance]) - scaleRadius(Math.sqrt(d.target.total_counts)) - 45
                                    return d.source.distance >= d.target.distance ? "translate(" + x + "," + y + ")" : "translate(" + x + "," + y + ")rotate(" + 180 + ")"
                                })    
                    },exit => exit.remove())
            }
            // DRAW NODES
            function updateNodes() {
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
                                .style('cursor','pointer')
                                .attr('id', d => 'map-node-'+d.name)
                                .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                                // .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : (d.source.parents.some(parent => descendantsFilter.includes(parent)) || excludeList.includes(d.source.name)) && !conceptNames.includes(d.name) ? 0.5 : 1)
                            const mapLine = mapNode.append('g')
                                .classed('map-link',true)
                                .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                                // .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : (d.source.parents.some(parent => descendantsFilter.includes(parent)) || excludeList.includes(d.source.name)) && !conceptNames.includes(d.name) ? 0.5 : 1)
                            mapLine.append('path')
                                .classed('map-line', true)
                                .attr('fill','none')
                                .attr('stroke-width', d => conceptNames.includes(d.name) && mapRoot.includes(d.source.name) ? 2 : 1.5)
                                .attr('stroke', d => inclusions.includes(d.name) ? color.textmedium : mapRoot.includes(d.source.name) ? color.textlightest : color.textlightest)
                                .attr('stroke-dasharray', d => mapRoot.includes(d.source.name) ? '4 2' : 'none')
                                .attr("d", d => {
                                    let sourceX = getMap(d).x 
                                    let sourceY = mapRoot.includes(d.source.name) ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) : getYPosition(d.source, 'z', cy + (genHeight[d.distance]), d)
                                    let targetX = mapRoot.includes(d.source.name) ? d.direction === -1 ? d.source.x - scaleRadius(Math.sqrt(d.source.total_counts)) - 14 : d.source.x + scaleRadius(Math.sqrt(d.source.total_counts)) + 14 : d.source.x
                                    let targetY = cy + (genHeight[d.distance])
                                    return curveX({source: [sourceX, sourceY], target: [targetX, targetY]})}
                                )
                            mapLine.append('path')
                                .classed('map-tree-arrow', true)
                                .attr('id', d => 'map-arrow-'+d.name)
                                .style('display', d => mapRoot.includes(d.source.name) ? 'block' : 'none')
                                .attr('fill', d => d.source.mappings?.map(d => d.name).some(name => inclusions.includes(name)) ? color.textmedium : color.textlightest)
                                .attr("d", d3.symbol().type(d3.symbolTriangle).size(arrowSize))
                                .attr("transform", d => {
                                    let x = d.direction === -1 ? d.source.x - scaleRadius(Math.sqrt(d.source.total_counts)) - 16 : getMap(d).x - scaleRadius(Math.sqrt(d.total_counts)) - 6
                                    let y = d.direction === -1 ? cy + (genHeight[d.distance]) : getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d)
                                    return "translate(" + x + "," + y + ")rotate(" + 90 + ")"
                                }) 
                            mapNode.append('circle')
                                .classed('map-tree-circle-background',true)
                                .style('fill', 'white')
                                .attr('stroke', 'white')
                                .style('pointer-events', "none")
                                .attr('r', d => mapRoot.includes(d.source.name) ? scaleRadius(Math.sqrt(d.total_counts)) + 2 : 10)
                                .attr('cx', d => getMap(d).x)
                                .attr('cy', d => mapRoot.includes(d.source.name) ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) : getYPosition(d.source, 'z', cy + (genHeight[d.distance]), d))
                            mapNode.append('circle')
                                .classed('map-tree-circle', true)
                                .attr('id', d => 'map-tree-circle-' + d.name)
                                .attr('r', d => mapRoot.includes(d.source.name) ? scaleRadius(Math.sqrt(d.total_counts)) + 2 : 10)
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
                                .attr('stroke', d => conceptNames.includes(d.name) || inclusions.includes(d.name) ? d.color : mapRoot.includes(d.source.name) ? d.total_counts === 0 ? 'none' : color.textlightest : color.textlightest)
                                .attr('stroke-width', d => mapRoot.includes(d.source.name) ? 1.5 : 1.25)
                                .style('cursor', "pointer")
                                .attr('cx', d => getMap(d).x)
                                .attr('cy', d => mapRoot.includes(d.source.name) ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) : getYPosition(d.source, 'z', cy + (genHeight[d.distance]), d))
                                // .style('pointer-events', 'all')
                                .style('pointer-events', d => d.source.leaf && mapRoot.includes(d.source.name) ? 'none' : 'all')
                                .on('mouseover', (e,d) => {
                                    if (mapRoot.includes(d.source.name)) hoverNode(d, 'enter')
                                })
                                .on('mouseout', (e,d) => { 
                                    if (mapRoot.includes(d.source.name)) hoverNode(d, 'leave')
                                })
                                .on('click', (e,d) => {
                                    if (!mapRoot.includes(d.source.name)) {
                                        setMapRoot([...mapRoot,d.source.name])
                                        updateWidth([...mapRoot,d.source.name])
                                    }
                                    else {
                                        if (d.total_counts !== 0) {
                                            if (conceptNames.includes(d.name)) {
                                                const newInclusions = inclusions.filter(e => e !== d.name)
                                                updateConcepts(newInclusions,nodes,[],[d])
                                            } else if (!conceptNames.includes(d.name)){
                                                const newInclusions = [...inclusions,d.name]
                                                updateConcepts(newInclusions,nodes,[d],[])
                                            }     
                                        }
                                    }
                                })
                            mapNode.append('text')
                                .classed('map-total-counts', true)
                                .attr('id', d => 'map-total-counts-' + d.name)
                                .text(d => d.total_counts)
                                .attr('fill', d => conceptNames.includes(d.name) ? 'white' : inclusions.includes(d.name) ? color.text : color.textlight)
                                .style('opacity', d => mapRoot.includes(d.source.name) ? 1 : 0)
                                .style('font-size', '8px')
                                .style('font-weight', '700')
                                .style('pointer-events', 'none')
                                .attr('text-anchor', 'middle')
                                .attr('x', d => getMap(d).x)
                                .attr('y', d => mapRoot.includes(d.source.name) ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) + 3 : getYPosition(d.source, 'z', cy + (genHeight[d.distance]), d) + 3)
                            const buttonSymbol = mapNode.append('g')
                                .classed('map-button-symbol', true)
                                .attr('id', d => 'map-button-symbol-' + d.name)
                                .attr('visibility', 'hidden')
                                .attr('stroke', 'white')
                                .attr('stroke-width', 1.5)
                                .attr('stroke-linecap', 'round')
                                .style('pointer-events', 'none')
                                .style('transition', '0.5s opacity')
                            buttonSymbol.append('line')
                                .classed('map-button-line-1', true)
                                .attr('x1', d => getMap(d).x - 2.5)
                                .attr('y1', d => {
                                    if (conceptNames.includes(d.name)) {
                                        return getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) - 2.5      
                                    } else {
                                        return getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d)     
                                    }
                                })
                                .attr('x2', d => getMap(d).x + 2.5)
                                .attr('y2', d => {
                                    if (conceptNames.includes(d.name)) {
                                        return getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) + 2.5      
                                    } else {
                                        return getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d)     
                                    }
                                })
                            buttonSymbol.append('line')
                                .classed('map-button-line-2', true)
                                .attr('x1', d => conceptNames.includes(d.name) ? getMap(d).x + 2.5 : getMap(d).x)
                                .attr('y1', d => getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) - 2.5)
                                .attr('x2', d => conceptNames.includes(d.name) ? getMap(d).x - 2.5 : getMap(d).x)
                                .attr('y2', d => getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) + 2.5)
                            const altCounts = mapNode.append('g')
                                .classed('map-alt-counts',true)
                                .style('display', d => mapRoot.includes(d.source.name) ? 'block' : 'none')
                            altCounts.append('text')
                                .classed('map-alt-text', true)
                                .attr('id', d => 'map-alt-text-' + d.name)
                                .attr('text-anchor', 'middle')
                                .attr('x', d => getX(d))
                                .attr('y', d => getY(d))
                                .style('font-size', '8px')
                                .text(d => d.descendant_counts + ' DRC')
                                .attr('fill', d => d.descendant_counts === 0 ? color.textlight : color.text)
                            const mapLabel = mapNode.append('g')
                                .classed('map-label', true)
                                .style('cursor', 'pointer')
                                .style('pointer-events','all')
                                .style('display', d => mapRoot.includes(d.source.name) ? 'block' : 'none')
                                .on('mouseover', function (e,d) {
                                    d3.select('#map-label-rect-'+d.name).attr('fill', color.lightpurple)
                                    d3.select('#map-tree-text-'+d.name).attr('fill', color.text).style('font-weight',700)
                                    const el = this
                                    el.__hoverTimeout__ = setTimeout(() => {
                                        setHovered([d.name])
                                        tooltipHover(d, "enter", e)      
                                    },400)
                                })
                                .on('mouseout', function (e,d) {
                                    const el = this
                                    clearTimeout(el.__hoverTimeout__)
                                    setHovered([])
                                    tooltipHover(d, 'leave', e)
                                    d3.select('#map-label-rect-'+d.name).attr('fill', 'rgba(255, 255, 255, 0.7)')
                                    d3.select('#map-tree-text-'+d.name).attr('fill', d => conceptNames.includes(d.name) ? color.text : color.textlight).style('font-weight',400)
                                })
                                .on('click',(e,d) => {
                                    navigate(`/${d.name}`)
                                    tooltipHover(d, 'leave', e)
                                })
                            mapLabel.append('text')
                                .classed('map-tree-text', true)
                                .attr('id', d => 'map-tree-text-' + d.name)
                                .attr('text-anchor', 'middle')
                                .text(d => {
                                    let concept_info = d.data.concept 
                                    let maxWidth = 18
                                    let text = concept_info.concept_name || concept_info.concept_id.toString()
                                    return text.substring(0, maxWidth) + (text.length > maxWidth ? '...' : '')
                                })
                                .style('font-size','10px')
                                .attr('fill', d => conceptNames.includes(d.name) || hovered.includes(d.name) ? color.text : color.textlight)
                                .attr('x', d => getMap(d).x)
                                .attr('y', d => getMap(d).y - 20)
                            mapLabel.append('rect')
                                .classed('map-label-rect', true)
                                .attr('id', d => 'map-label-rect-' + d.name)
                                .attr('width', d => d3.select("#map-tree-text-" + d.name).node().getBBox().width + 14)
                                .attr('height', 16)
                                .attr('x', d => getMap(d).x - (d3.select("#map-tree-text-" + d.name).node().getBBox().width + 14)/2)
                                .attr('y', d => getMap(d).y - 31)
                                .attr('fill','rgba(255, 255, 255, 0.7)')
                                .attr("rx", 8)
                                .attr("ry", 8)
                                .lower()
                            mapNode.append('text')
                                .classed('map-code', true)
                                .attr('id', d => 'map-code-' + d.name)
                                .attr('text-anchor', 'middle')
                                .style('display', d => mapRoot.includes(d.source.name) ? 'block' : 'none')
                                .style('font-size', '8px')
                                .style('font-weight',700)
                                .attr('fill', d => conceptNames.includes(d.name) ? color.text: color.textlight)
                                .attr('x', d => getMap(d).x)
                                .attr('y', d => getMap(d).y - 7)
                                .text(d => d.data.concept.concept_code)
                            mapNode.append('text')
                                .classed('map-vocabulary', true)
                                .attr('id', d => 'map-vocabulary-' + d.name)
                                .attr('text-anchor', 'middle')
                                .style('display', d => mapRoot.includes(d.source.name) ? 'block' : 'none')
                                .style('font-size', '8px')
                                .attr('fill', d => conceptNames.includes(d.name) ? color.textlight: color.textlightest)
                                .attr('x', d => getMap(d).x)
                                .attr('y', d => getMap(d).y + 2)
                                .text(d => d.data.concept.vocabulary_id)
                            mapNode.lower()
                            mapLabel.raise()
                        }, update => {
                            update
                                .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                                // .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : (d.source.parents.some(parent => descendantsFilter.includes(parent)) || excludeList.includes(d.source.name)) && !conceptNames.includes(d.name) ? 0.5 : 1)
                            update.select('.map-link')
                                .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                                // .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : (d.source.parents.some(parent => descendantsFilter.includes(parent)) || excludeList.includes(d.source.name)) && !conceptNames.includes(d.name) ? 0.5 : 1)
                            update.select('.map-line')
                                .attr('stroke-width', d => conceptNames.includes(d.name) && mapRoot.includes(d.source.name) ? 2 : 1.5)
                                .attr('stroke-dasharray', d => mapRoot.includes(d.source.name) ? '4 2' : 'none')
                                .attr('stroke', d => inclusions.includes(d.name) ? color.textmedium : mapRoot.includes(d.source.name) ? color.textlightest : color.textlightest)
                                .transition(2000)
                                .attr("d", d => {
                                    let sourceX = getMap(d).x
                                    let sourceY = mapRoot.includes(d.source.name) ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) : getYPosition(d.source, 'z', cy + (genHeight[d.distance]), d)
                                    let targetX = mapRoot.includes(d.source.name) ? d.direction === -1 ? d.source.x - scaleRadius(Math.sqrt(d.source.total_counts)) - 14 : d.source.x + scaleRadius(Math.sqrt(d.source.total_counts)) + 14 : d.source.x
                                    let targetY = cy + (genHeight[d.distance])
                                    return curveX({source: [sourceX, sourceY], target: [targetX, targetY]})}
                                )
                            update.select('.map-tree-arrow')
                                .style('display', d => mapRoot.includes(d.source.name) ? 'block' : 'none')
                                .attr('fill', d => d.source.mappings?.map(d => d.name).some(name => inclusions.includes(name)) ? color.textmedium : color.textlightest)
                                .attr("d", d3.symbol().type(d3.symbolTriangle).size(arrowSize))
                                .attr("transform", d => {
                                    let x = d.direction === -1 ? d.source.x - scaleRadius(Math.sqrt(d.source.total_counts)) - 16 : getMap(d).x - scaleRadius(Math.sqrt(d.total_counts)) - 6
                                    let y = d.direction === -1 ? cy + (genHeight[d.distance]) : getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d)
                                    return "translate(" + x + "," + y + ")rotate(" + 90 + ")"
                                }) 
                            update.select('.map-tree-circle-background')
                                .attr('r', d => mapRoot.includes(d.source.name) ? scaleRadius(Math.sqrt(d.total_counts)) + 2 : 10)
                                .attr('cx', d => getMap(d).x)
                                .attr('cy', d => mapRoot.includes(d.source.name) ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) : getYPosition(d.source, 'z', cy + (genHeight[d.distance]), d))
                            update.select('.map-tree-circle')
                                .on('mouseover', (e,d) => {
                                    if (mapRoot.includes(d.source.name)) hoverNode(d, 'enter')
                                })
                                .on('mouseout', (e,d) => { 
                                    if (mapRoot.includes(d.source.name)) hoverNode(d, 'leave')
                                })
                                .on('click', (e,d) => {
                                    if (!mapRoot.includes(d.source.name)) {
                                        setMapRoot([...mapRoot,d.source.name])
                                        updateWidth([...mapRoot,d.source.name])
                                    }
                                    else {
                                        if (d.total_counts !== 0) {
                                            if (conceptNames.includes(d.name)) {
                                                const newInclusions = inclusions.filter(e => e !== d.name)
                                                updateConcepts(newInclusions,nodes,[],[d])
                                            } else if (!conceptNames.includes(d.name)){
                                                const newInclusions = [...inclusions,d.name]
                                                updateConcepts(newInclusions,nodes,[d],[])
                                            }     
                                        }
                                    }
                                })
                                .attr('r', d => mapRoot.includes(d.source.name) ? scaleRadius(Math.sqrt(d.total_counts)) + 2 : 10)
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
                                .style('pointer-events', d => d.source.leaf && mapRoot.includes(d.source.name) ? 'none' : 'all')
                                .attr('stroke', d => conceptNames.includes(d.name) || inclusions.includes(d.name) ? d.color : mapRoot.includes(d.source.name) ? d.total_counts === 0 ? 'none' : color.textlightest : color.textlightest)
                                .attr('stroke-width', d => mapRoot.includes(d.source.name) ? 1.5 : 1.25)
                                .transition(2000)
                                .attr('cx', d => getMap(d).x)
                                .attr('cy', d => mapRoot.includes(d.source.name) ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) : getYPosition(d.source, 'z', cy + (genHeight[d.distance]), d))
                                // .style('pointer-events', d => d.total_counts === 0 || relationship !== 'mappings' ? 'none' : 'all')
                            update.select('.map-total-counts')
                                .text(d => d.total_counts)
                                .style('opacity', d => mapRoot.includes(d.source.name) ? 1 : 0)
                                .attr('fill', d => conceptNames.includes(d.name) ? 'white' : inclusions.includes(d.name) ? color.text : color.textlight)
                                .attr('x', d => getMap(d).x)
                                .attr('y', d => mapRoot.includes(d.source.name) ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) + 3 : getYPosition(d.source, 'z', cy + (genHeight[d.distance]), d) + 3)
                            update.select('.map-button-line-1')
                                .attr('x1', d => getMap(d).x - 2.5)
                                .attr('y1', d => {
                                    if (conceptNames.includes(d.name)) {
                                        return getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) - 2.5      
                                    } else {
                                        return getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d)     
                                    }
                                })
                                .attr('x2', d => getMap(d).x + 2.5)
                                .attr('y2', d => {
                                    if (conceptNames.includes(d.name)) {
                                        return getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) + 2.5      
                                    } else {
                                        return getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d)     
                                    }
                                })
                            update.select('.map-button-line-2')
                                .attr('x1', d => conceptNames.includes(d.name) ? getMap(d).x + 2.5 : getMap(d).x)
                                .attr('y1', d => getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) - 2.5)
                                .attr('x2', d => conceptNames.includes(d.name) ? getMap(d).x - 2.5 : getMap(d).x)
                                .attr('y2', d => getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) + 2.5)
                            update.select('.map-alt-counts')
                                .style('display', d => mapRoot.includes(d.source.name) ? 'block' : 'none')
                            update.select('.map-alt-text')
                                .attr('x', d => getX(d))
                                .attr('y', d => getY(d))
                                .text(d => d.descendant_counts + ' DRC')
                                .attr('fill', d => d.descendant_counts === 0 ? color.textlight : color.text)
                            update.select('.map-label')
                                .style('display', d => mapRoot.includes(d.source.name) ? 'block' : 'none')
                                .on('mouseover', function (e,d) {
                                    d3.select('#map-label-rect-'+d.name).attr('fill', color.lightpurple)
                                    d3.select('#map-tree-text-'+d.name).attr('fill', color.text).style('font-weight',700)
                                    const el = this
                                    el.__hoverTimeout__ = setTimeout(() => {
                                        setHovered([d.name])
                                        tooltipHover(d, "enter", e)      
                                    },400)
                                })
                                .on('mouseout', function (e,d) {
                                    const el = this
                                    clearTimeout(el.__hoverTimeout__)
                                    setHovered([])
                                    tooltipHover(d, 'leave', e)
                                    d3.select('#map-label-rect-'+d.name).attr('fill', 'rgba(255, 255, 255, 0.7)')
                                    d3.select('#map-tree-text-'+d.name).attr('fill', d => conceptNames.includes(d.name) ? color.text : color.textlight).style('font-weight',400)
                                })
                                .on('click', (e,d) => {
                                    navigate(`/${d.name}`)
                                    tooltipHover(d, 'leave', e)
                                })
                            update.select('.map-tree-text')
                                .text(d => {
                                    let concept_info = d.data.concept 
                                    let maxWidth = 18
                                    let text = concept_info.concept_name || concept_info.concept_id.toString()
                                    return text.substring(0, maxWidth) + (text.length > maxWidth ? '...' : '')
                                })
                                .attr('fill', d => conceptNames.includes(d.name) || hovered.includes(d.name) ? color.text : color.textlight)
                                .attr('x', d => getMap(d).x)
                                .attr('y', d => getMap(d).y - 20)
                            update.select('.map-label-rect')
                                .attr('width', d => d3.select("#map-tree-text-" + d.name).node().getBBox().width + 14)
                                .attr('x', d => getMap(d).x - (d3.select("#map-tree-text-" + d.name).node().getBBox().width + 14)/2)
                                .attr('y', d => getMap(d).y - 31)
                            update.select('.map-code')
                                .style('display', d => mapRoot.includes(d.source.name) ? 'block' : 'none')
                                .attr('fill', d => conceptNames.includes(d.name) ? color.text: color.textlight)
                                .attr('x', d => getMap(d).x)
                                .attr('y', d => getMap(d).y - 7)
                                .text(d => d.data.concept.concept_code)
                            update.select('.map-vocabulary')
                                .style('display', d => mapRoot.includes(d.source.name) ? 'block' : 'none')
                                .attr('fill', d => conceptNames.includes(d.name) ? color.textlight : color.textlightest)
                                .attr('x', d => getMap(d).x)
                                .attr('y', d => getMap(d).y + 2)
                                .text(d => d.data.concept.vocabulary_id)
                        },exit => exit.remove())
                        //Subsumes node
                        const nodeContainer = geometry.append('g')  
                        const node = nodeContainer.append('g')  
                            .classed('subsumes-node', true)
                            .attr('id', d => 'subsumes-node-'+d.name)
                            .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : d.levels === '-1' ? 0.8 : 1)
                            // .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : d.levels === '-1' || (!sidebarRoot.name.includes(d.name) && d.parents.some(parent => descendantsFilter.includes(parent))) || (sidebarRoot.name.includes(d.name) && excludeList.includes(d.name)) ? 0.5 : 1)
                        node.append('circle')
                            .classed('tree-circle-background', true)
                            .style('opacity', 1)
                            .attr('id', d => 'tree-circle-background-' + d.name)
                            .attr('r', d => scaleRadius(Math.sqrt(d.total_counts)) + 2)
                            .attr('fill', 'white')
                            .attr('stroke', 'white')
                            .attr('cx', d => d.x)
                            .attr('cy', d => cy + (genHeight[d.distance]))
                        node.append('circle')
                            .on('mouseover', (e,d) => hoverNode(d, 'enter'))
                            .on('mouseout', (e,d) => hoverNode(d, 'leave'))
                            .on('click', (e,d) => {
                                if (d.total_counts !== 0) {
                                    if (conceptNames.includes(d.name)) {
                                        const newInclusions = inclusions.filter(e => e !== d.name)
                                        updateConcepts(newInclusions,nodes,[],[d])
                                    } else if (!conceptNames.includes(d.name)){
                                        const newInclusions = [...inclusions,d.name]
                                        updateConcepts(newInclusions,nodes,[d],[])
                                    }     
                                }
                            })
                            .classed('tree-circle', true)
                            .attr('id', d => 'tree-circle-' + d.name)
                            .attr('r', d => scaleRadius(Math.sqrt(d.total_counts)) + 2)
                            .attr('stroke-width',1.5)
                            .attr('stroke', d => d.total_counts === 0 ? 'none' : conceptNames.includes(d.name) && inclusions.includes(d.name) ? d.color : color.textlightest)
                            .attr('fill', d => {
                                if (d.total_counts === 0 || (d.leaf && d.descendant_counts !== d.total_counts)) return 'white'
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
                            .attr('cx', d => d.x)
                            .attr('cy', d => cy + (genHeight[d.distance]))
                            .attr('pointer-events', d => d.total_counts === 0 || d.levels === "-1" || d.leaf ? "none" : "all")
                        node.append('text')
                            .classed('total-counts', true)
                            .attr('id', d => 'total-counts-' + d.name)
                            .text(d => d.total_counts)
                            .attr('fill', d => d.leaf ? !excludeList.includes(d.name) && inclusions.includes(d.name) ? color.text : color.textlight : d.total_counts === 0 || !conceptNames.includes(d.name) ? color.textlight : 'white')
                            .attr('visibility', "visible")
                            .style('font-size', d => d.total_counts === 0 ? '10px' : '8px')
                            .style('font-weight', '700')
                            .style('pointer-events', 'none')
                            .attr('text-anchor', 'middle')
                            .attr('x', d => d.x)
                            .attr('y', d => cy + (genHeight[d.distance]) + 3)
                        const descendantsBtn = geometry.append('g')
                            .classed('root-btn-group',true)
                            .style('display', d => sidebarRoot.name.includes(d.name) ? 'block' : 'none')
                            .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                            .attr('transform', d => {
                                const xVar = d.total_counts === 0 ? 20 : 10
                                if (d.data.concept.standard_concept) return `translate(${d.x + scaleRadius(Math.sqrt(d.total_counts)) + xVar}, 0)`
                                else return `translate(${d.x - scaleRadius(Math.sqrt(d.total_counts)) - xVar}, 0)`
                                }   
                            )
                        const includeDescendants = descendantsBtn.append('g')
                            .classed("root-btn-descendants",true)
                            .style('pointer-events', 'all')
                            .style('cursor','pointer')
                            .attr('text-anchor', d => d.data.concept.standard_concept ? 'start' : 'end')
                            .on('click', (e,d) => {
                                setExcludeInclude('descendants',d.name)
                            })
                        includeDescendants.append('text')
                            .classed("root-btn-text-descendants",true)
                            .text('Descendants')
                            // .text(d => descendantsFilter.includes(d.name) ? 'Excluded' : 'Included')
                            .style('font-weight', d => descendantsFilter.includes(d.name) ? '400' : '700')
                            .attr('x', d => d.data.concept.standard_concept ? 16 : -16)
                            .attr('y', d => cy + (genHeight[d.distance]) + 11)
                        includeDescendants.append('rect')
                            .classed('root-btn-box-descendants',true)
                            .attr('width',13)
                            .attr('height',13)
                            .attr('stroke', d => descendantsFilter.includes(d.name) ? color.textlight : color.text)
                            .attr('x', d => d.data.concept.standard_concept ? -2 : -11)
                            .attr('y', d => cy + (genHeight[d.distance]))
                            .attr('fill', d => descendantsFilter.includes(d.name) ? 'none' : color.text)
                        includeDescendants.append('text')
                            .classed('root-btn-check-descendants',true)
                            .text('\uf00c')
                            .attr('font-family', '"Font Awesome 6 Free"')
                            .attr('font-weight', '900') 
                            .attr('font-size', 10)
                            .attr('fill', d => descendantsFilter.includes(d.name) ? 'none' : 'white')
                            .attr('x', d => d.data.concept.standard_concept ? 0 : 0)
                            .attr('y', d => cy + (genHeight[d.distance]) + 10)
                        const excludeDescendants = descendantsBtn.append('g')
                            .classed("root-btn-exclude",true)
                            .style('pointer-events', 'all')
                            .style('cursor','pointer')
                            .attr('text-anchor', d => d.data.concept.standard_concept ? 'start' : 'end')
                            .on('click', (e,d) => {
                                setExcludeInclude('exclude',d.name)
                            })
                        excludeDescendants.append('text')
                            .classed("root-btn-text-exclude",true)
                            .text('Exclude')
                            // .text(d => descendantsFilter.includes(d.name) ? 'Excluded' : 'Included')
                            .style('font-weight', d => excludeList.includes(d.name) ? '700' : '400')
                            .attr('x', d => d.data.concept.standard_concept ? 16 : -16)
                            .attr('y', d => cy + (genHeight[d.distance]) - 7)
                        excludeDescendants.append('rect')
                            .classed('root-btn-box-exclude',true)
                            .attr('width',13)
                            .attr('height',13)
                            .attr('stroke', d => excludeList.includes(d.name) ? color.text : color.textlight)
                            .attr('x', d => d.data.concept.standard_concept ? -2 : -11)
                            .attr('y', d => cy + (genHeight[d.distance]) - 18)
                            .attr('fill', d => excludeList.includes(d.name) ? color.text : 'none')
                        excludeDescendants.append('text')
                            .classed('root-btn-check-exclude',true)
                            .text('\uf00c')
                            .attr('font-family', '"Font Awesome 6 Free"')
                            .attr('font-weight', '900') 
                            .attr('font-size', 10)
                            .attr('fill', d => excludeList.includes(d.name) ? 'white' : 'none')
                            .attr('x', d => d.data.concept.standard_concept ? 0 : 0)
                            .attr('y', d => cy + (genHeight[d.distance]) - 8)
                        const closeMappings = node.append('g')
                            .classed('close-mappings', true)
                            .attr('id', d => 'close-mappings-' + d.name)
                            .attr('stroke', color.text)
                            .attr('stroke-width', 1.5)
                            .style('cursor','pointer')
                            .style('pointer-events', 'all')
                            .style('display', d => mapRoot.includes(d.name) ? 'block' : 'none')
                            .on('click',(e,d) => {
                                let filteredRoots = mapRoot.filter(e => e !== d.name)
                                setMapRoot(filteredRoots)
                                updateWidth(filteredRoots)
                            })
                        closeMappings.append('line')
                            .classed('close-mappings-line-1', true)
                            .attr('x1', d => !d.data.concept.standard_concept ? d.x + scaleRadius(Math.sqrt(d.total_counts)) + 11 : d.x - scaleRadius(Math.sqrt(d.total_counts)) - 11)
                            .attr('y1', d => cy + (genHeight[d.distance]) - 3)
                            .attr('x2', d => !d.data.concept.standard_concept ? d.x + scaleRadius(Math.sqrt(d.total_counts)) + 5 : d.x - scaleRadius(Math.sqrt(d.total_counts)) - 5)
                            .attr('y2', d => cy + (genHeight[d.distance]) + 3)
                        closeMappings.append('line')
                            .classed('close-mappings-line-2', true)
                            .attr('x1', d => !d.data.concept.standard_concept ? d.x + scaleRadius(Math.sqrt(d.total_counts)) + 5 : d.x - scaleRadius(Math.sqrt(d.total_counts)) - 5)
                            .attr('y1', d => cy + (genHeight[d.distance]) - 3)
                            .attr('x2', d => !d.data.concept.standard_concept ? d.x + scaleRadius(Math.sqrt(d.total_counts)) + 11 : d.x - scaleRadius(Math.sqrt(d.total_counts)) - 11)
                            .attr('y2', d => cy + (genHeight[d.distance]) + 3)
                        const buttonSymbol = node.append('g')
                            .classed('button-symbol', true)
                            .attr('id', d => 'button-symbol-' + d.name)
                            .attr('visibility', 'hidden')
                            // .attr('stroke','white')
                            .attr('stroke', d => (d.leaf && d.children.length > 0 && d.descendant_counts !== d.total_counts) ? color.text : 'white')
                            .attr('stroke-width', 1.5)
                            .attr('stroke-linecap', 'round')
                            .style('pointer-events', 'none')
                            .style('transition', '0.5s opacity')
                        buttonSymbol.append('line')
                            .classed('button-line-1', true)
                            .attr('x1', d => d.x - 2.5)
                            .attr('y1', d => {
                                if (conceptNames.includes(d.name)) {
                                    return cy + (genHeight[d.distance]) - 2.5      
                                } else {
                                    return cy + (genHeight[d.distance])     
                                }
                            })
                            .attr('x2', d => d.x + 2.5)
                            .attr('y2', d => {
                                if (conceptNames.includes(d.name)) {
                                    return cy + (genHeight[d.distance]) + 2.5      
                                } else {
                                    return cy + (genHeight[d.distance])     
                                }
                            })
                        buttonSymbol.append('line')
                            .classed('button-line-2', true)
                            .attr('x1', d => conceptNames.includes(d.name) ? d.x + 2.5 : d.x)
                            .attr('y1', d => cy + (genHeight[d.distance]) - 2.5)
                            .attr('x2', d => conceptNames.includes(d.name) ? d.x - 2.5 : d.x)
                            .attr('y2', d => cy + (genHeight[d.distance]) + 2.5)
                        const altCounts = geometry.append('g')
                            .classed('alt-group',true)
                            .attr('id', d => 'alt-group-'+d.name)
                            .style('margin-top','10px')
                            .style('pointer-events','all')
                            .style('cursor', d => [...d.included_descendants,...d.descendants].filter((e,n,l) => l.indexOf(e) === n).length > 1 && !d.leaf ? 'pointer' : 'auto')
                            .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : d.levels === '-1' ? 0.5 : 1)
                            .on('mouseover',(e,d) => {
                                const descendants = [...d.included_descendants,...d.descendants].filter((e,n,l) => l.indexOf(e) === n)
                                if (descendants.length > 1 && !d.leaf) setHovered(descendants)                      
                            })
                            .on('mouseout',(e,d) => setHovered([]))
                        altCounts.append('text')
                            .classed('alt-text',true)
                            .attr('id', d => 'alt-text-'+d.name)
                            .attr('text-anchor', 'middle')
                            .attr('fill', d => d.leaf ? 'white' : d.descendant_counts === 0 ? color.textlight : color.text)
                            .attr('x', d => d.x)
                            .attr('y', d => cy + (genHeight[d.distance]) + scaleRadius(Math.sqrt(d.total_counts)) + 13)
                            .style('font-size', '8px')
                            .style('font-weight', d => d.leaf ? 700 : 400)
                            .text(d => d.descendant_counts + ' DRC')
                            .raise()
                        altCounts.append('rect')
                            .classed('alt-rect',true)
                            .attr('id', d => 'alt-rect-'+d.name)
                            .attr('fill', d => d.leaf ? d.color : 'none')
                            // .attr('stroke', d => sidebarRoot.name.includes(d.name) ? color.text : 'none')
                            .attr('stroke-width',1.25)
                            // .attr('stroke-dasharray', d => !d.data.concept.standard_concept ? '3 3' : 'none')
                            .attr("height",12)
                            .attr('width',d => d3.select('#alt-text-'+d.name).node().getBBox().width + 6)
                            .attr('x', d => d.x - (d3.select('#alt-text-'+d.name).node().getBBox().width + 6)/2)
                            .attr('y', d => cy + (genHeight[d.distance]) + scaleRadius(Math.sqrt(d.total_counts)) + 4)
                            .attr("rx", 6)
                            .attr("ry", 6)
                            .lower()
                        const label = geometry.append('g')
                            .classed('label', true)
                            .style('pointer-events','all')
                            // .on('mouseover', function (e,d) {
                            //     if (d.levels === '-1') {
                            //         d3.select('#subsumes-node-'+d.name).style('opacity',1)
                            //         d3.select('#tree-text-'+d.name).style('opacity',1)
                            //         d3.select('#alt-group-'+d.name).style('opacity',1)
                            //     }
                            //     d3.select('#tree-text-'+d.name).attr('fill', color.text).attr('font-weight', 700)
                            //     d3.select('#label-rect-'+d.name).attr('fill-opacity',1).attr('fill', color.lightpurple)
                            //     const el = this
                            //     el.__hoverTimeout__ = setTimeout(() => {
                            //         if (d.levels !== "-1") setHovered([d.name])
                            //         tooltipHover(d, "enter", e)  
                            //     }, 400)
                            // })
                            // .on('mouseout', function (e,d) {
                            //     const el = this
                            //     clearTimeout(el.__hoverTimeout__)
                            //     if (d.levels === '-1') {
                            //         d3.select('#subsumes-node-'+d.name).style('opacity',0.5)
                            //         d3.select('#tree-text-'+d.name).style('opacity',0.5)
                            //         d3.select('#alt-group-'+d.name).style('opacity',0.5)
                            //     }
                            //     d3.select('#tree-text-'+d.name).attr('fill', d => conceptNames.includes(d.name) || sidebarRoot.name.includes(d.name) ? color.text : color.textlight).attr('font-weight', d => sidebarRoot.name.includes(d.name) ? 700 : 400)
                            //     d3.select('#label-rect-'+d.name).attr('fill-opacity', d => sidebarRoot.name.includes(d.name) ? 1 : 0.7).attr('fill', d => sidebarRoot.name.includes(d.name) ? color.lightpurple : 'white')
                            //     if (d.levels !== "-1") setHovered([])
                            //     tooltipHover(d, "leave", e)   
                            // })
                            .on('click', (e,d) => {
                                tooltipHover(d, 'leave', e)
                                setLoading(true)
                                navigate(`/${d.name}`) 
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
                                if ((relationship === 'mappings' && d.mappings?.length > 0) || mapRoot.includes(d.name)) {
                                    maxWidth = 18
                                }
                                else {
                                    if (genLength === 1) maxWidth = Math.round(width/6)
                                    else maxWidth = 23
                                    // else maxWidth = Math.round((width/genLength)/11) < 12 ? 12 : Math.round((width/genLength)/11)
                                }  
                                return text.substring(0, maxWidth) + (text.length > maxWidth ? '...' : '')
                            })
                            .attr('fill', d => conceptNames.includes(d.name) || sidebarRoot.name.includes(d.name) || (hovered.length === 1 && hovered.includes(d.name)) ? color.text : color.textlight)
                            .attr('font-weight', d => sidebarRoot.name.includes(d.name) || (hovered.length === 1 && hovered.includes(d.name)) ? 700 : 400)
                            .attr('font-size','10px')
                            .attr('x', d => getLabel(d).x)
                            .attr('y', d => getLabel(d).y - 20)
                            .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : d.levels === '-1' ? 0.5 : 1)
                        label.append('rect')
                            .classed('label-rect', true)
                            .attr('id', d => 'label-rect-' + d.name)
                            .attr('width', d => d3.select("#tree-text-" + d.name).node().getBBox().width + 14)
                            .attr('height', 16)
                            .attr('x', d => getLabel(d).x - (d3.select("#tree-text-" + d.name).node().getBBox().width + 14)/2)
                            .attr('y', d => getLabel(d).y - 31)
                            .attr('fill', d => sidebarRoot.name.includes(d.name) || (hovered.length === 1 && hovered.includes(d.name)) ? color.lightpurple : 'white')
                            .attr("rx", 8)
                            .attr("ry", 8)
                            .attr('fill-opacity', d => sidebarRoot.name.includes(d.name) || (hovered.length === 1 && hovered.includes(d.name)) ? 1 : 0.7)
                            .lower()
                        node.append('text')
                            .classed('node-code', true)
                            .attr('id', d => 'node-code-' + d.name)
                            .attr('text-anchor', 'middle')
                            .attr('fill', d => conceptNames.includes(d.name) ? color.text : color.textlight)
                            .style('font-size','8px')
                            .style('font-weight',700)
                            .text(d => d.data.concept.concept_code)
                            .attr('x', d => getLabel(d).x)
                            .attr('y', d => getLabel(d).y - 7)
                        node.append('text')
                            .classed('node-vocabulary', true)
                            .attr('id', d => 'node-vocabulary-' + d.name)
                            .attr('text-anchor', 'middle')
                            .attr('fill', d => conceptNames.includes(d.name) ? color.textlight : color.textlightest)
                            .style('font-size','8px')
                            .text(d => d.data.concept.vocabulary_id)
                            .attr('x', d => getLabel(d).x)
                            .attr('y', d => getLabel(d).y + 2)
                        const pruneLine = node.append('g')
                            .classed('prune-group', true)
                            .attr('id', d => 'prune-group-' + d.name)
                            .style('display', d => pruned && d.leaf && !d.children?.every(child => d.connections.map(d => d.child).includes(child)) ? 'block' : 'none')
                            .style('opacity', d => hovered.length === 1 && hovered.includes(d.name) ? 1 : hovered.length > 0 ? 0.2 : 1)
                        pruneLine.append('line')
                            .classed('prune-line',true)
                            .attr('fill', 'none')
                            .attr("stroke", "url(#myGradient)")
                            .attr('stroke-width', 1.5)
                            .attr('x1',d => d.x)
                            .attr('y1',d => cy + (genHeight[d.distance]) + scaleRadius(Math.sqrt(d.total_counts)) + 18)
                            .attr('x2',d => d.x + 0.1)
                            .attr('y2',d => cy + (genHeight[d.distance]) + (num - 20))
                        pruneLine.append('path')
                            .classed('prune-arrow', true)
                            .attr('fill', color.darkbackground)
                            .attr("d", d3.symbol().type(d3.symbolTriangle).size(arrowSize))
                            .attr("transform", d => {
                                let x = d.x
                                let y = cy + (genHeight[d.distance]) + (num - 20)
                                return "translate(" + x + "," + y + ")rotate(" + 180 + ")"
                            }) 
                        node.selectAll(".prune-curve").data(d => d.connections)
                        .join(enter => {
                            const curve = enter.append('g')
                                .classed('prune-curve',true)
                                .style('opacity', d => d.parents === hovered ? 1 : hovered.length > 0 ? 0.2 : 1)
                            curve.append('path')
                                .classed('prune-curve-line',true)
                                .attr('fill', 'none')
                                .attr("stroke", "url(#myGradient)")
                                .attr('stroke-width', 1.5)
                                .style('display', pruned ? 'block' : 'none')
                                .attr("d", d => {
                                    let sourceNode = nodes.filter(e => e.name === d.source)[0]
                                    // // let coordinates = getMidXAndMaxY(d.parents)
                                    // let x1 = sourceNode.x
                                    let x1 = d.x
                                    let y1 = cy + (genHeight[sourceNode.distance]) + scaleRadius(Math.sqrt(sourceNode.total_counts)) + 18
                                    let x2 = d.mid
                                    let y2 = cy + (genHeight[sourceNode.distance]) + (num - 20)
                                    return curveY({source: [x1, y1], target: [x2, y2]})
                                })
                                // .on('mouseover',(e,d) => setHovered(d.parents))
                                // .on('mouseout',(e,d) => setHovered([]))
                            curve.append('path')
                                .classed('prune-curve-background',true)
                                .attr('fill', 'none')
                                .attr("stroke", "transparent")
                                .attr('stroke-width', 5)
                                .style('cursor','pointer')
                                .style('display', pruned ? 'block' : 'none')
                                .attr("d", d => {
                                    let sourceNode = nodes.filter(e => e.name === d.source)[0]
                                    // // let coordinates = getMidXAndMaxY(d.parents)
                                    // let x1 = sourceNode.x
                                    let x1 = d.x
                                    let y1 = cy + (genHeight[sourceNode.distance]) + scaleRadius(Math.sqrt(sourceNode.total_counts)) + 18
                                    let x2 = d.mid
                                    let y2 = cy + (genHeight[sourceNode.distance]) + (num - 20)
                                    return curveY({source: [x1, y1], target: [x2, y2]})
                                })
                                .on('mouseover',(e,d) => setHovered(d.parents))
                                .on('mouseout',(e,d) => setHovered([]))
                            curve.append('path')
                                .classed('prune-curve-arrow', true)
                                .attr('fill', color.darkbackground)
                                .attr("d", d3.symbol().type(d3.symbolTriangle).size(arrowSize))
                                .attr("transform", d => {
                                    let x = d.mid
                                    let y = cy + (genHeight[nodes.filter(e => e.name === d.source)[0].distance]) + (num - 20)
                                    return "translate(" + x + "," + y + ")rotate(" + 180 + ")"
                                }) 
                        },update => {
                            update 
                                .style('opacity', d => d.parents === hovered ? 1 : hovered.length > 0 ? 0.2 : 1)
                            update.select('.prune-curve-line')
                                .style('display', pruned ? 'block' : 'none')
                                .attr("d", d => {
                                    let sourceNode = nodes.filter(e => e.name === d.source)[0]
                                    // // let coordinates = getMidXAndMaxY(d.parents)
                                    // let x1 = sourceNode.x
                                    let x1 = d.x
                                    let y1 = cy + (genHeight[sourceNode.distance]) + scaleRadius(Math.sqrt(sourceNode.total_counts)) + 18
                                    let x2 = d.mid
                                    let y2 = cy + (genHeight[sourceNode.distance]) + (num - 20)
                                    return curveY({source: [x1, y1], target: [x2, y2]})
                                })
                                // .on('mouseover',(e,d) => setHovered(d.parents))
                                // .on('mouseout',(e,d) => setHovered([]))
                            update.select(".prune-curve-background")
                                .style('display', pruned ? 'block' : 'none')
                                .attr("d", d => {
                                    let sourceNode = nodes.filter(e => e.name === d.source)[0]
                                    // // let coordinates = getMidXAndMaxY(d.parents)
                                    // let x1 = sourceNode.x
                                    let x1 = d.x
                                    let y1 = cy + (genHeight[sourceNode.distance]) + scaleRadius(Math.sqrt(sourceNode.total_counts)) + 18
                                    let x2 = d.mid
                                    let y2 = cy + (genHeight[sourceNode.distance]) + (num - 20)
                                    return curveY({source: [x1, y1], target: [x2, y2]})
                                })
                                .on('mouseover',(e,d) => setHovered(d.parents))
                                .on('mouseout',(e,d) => setHovered([]))
                            update.select('.prune-curve-arrow')
                                .attr("transform", d => {
                                    let x = d.mid
                                    let y = cy + (genHeight[nodes.filter(e => e.name === d.source)[0].distance]) + (num - 20)
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
                                .style('cursor','pointer')
                                .attr('id', d => 'map-node-'+d.name)
                                .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                                // .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : (d.source.parents.some(parent => descendantsFilter.includes(parent)) || excludeList.includes(d.source.name)) && !conceptNames.includes(d.name) ? 0.5 : 1)
                            const mapLine = mapNode.append('g')
                                .classed('map-link',true)
                                .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                                // .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : (d.source.parents.some(parent => descendantsFilter.includes(parent)) || excludeList.includes(d.source.name)) && !conceptNames.includes(d.name) ? 0.5 : 1)
                            mapLine.append('path')
                                .classed('map-line', true)
                                .attr('fill','none')
                                .attr('stroke-width', d => conceptNames.includes(d.name) && mapRoot.includes(d.source.name) ? 2 : 1.5)
                                .attr('stroke', d => inclusions.includes(d.name) ? color.textmedium : mapRoot.includes(d.source.name) ? color.textlightest : color.textlightest)
                                .attr('stroke-dasharray', d => mapRoot.includes(d.source.name) ? '4 2' : 'none')
                                .attr("d", d => {
                                    let sourceX = getMap(d).x 
                                    let sourceY = mapRoot.includes(d.source.name) ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) : getYPosition(d.source, 'z', cy + (genHeight[d.distance]), d)
                                    let targetX = mapRoot.includes(d.source.name) ? d.direction === -1 ? d.source.x - scaleRadius(Math.sqrt(d.source.total_counts)) - 14 : d.source.x + scaleRadius(Math.sqrt(d.source.total_counts)) + 14 : d.source.x
                                    let targetY = cy + (genHeight[d.distance])
                                    return curveX({source: [sourceX, sourceY], target: [targetX, targetY]})}
                                )
                            mapLine.append('path')
                                .classed('map-tree-arrow', true)
                                .attr('id', d => 'map-arrow-'+d.name)
                                .style('display', d => mapRoot.includes(d.source.name) ? 'block' : 'none')
                                .attr('fill', d => d.source.mappings?.map(d => d.name).some(name => inclusions.includes(name)) ? color.textmedium : color.textlightest)
                                .attr("d", d3.symbol().type(d3.symbolTriangle).size(arrowSize))
                                .attr("transform", d => {
                                    let x = d.direction === -1 ? d.source.x - scaleRadius(Math.sqrt(d.source.total_counts)) - 16 : getMap(d).x - scaleRadius(Math.sqrt(d.total_counts)) - 6
                                    let y = d.direction === -1 ? cy + (genHeight[d.distance]) : getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d)
                                    return "translate(" + x + "," + y + ")rotate(" + 90 + ")"
                                }) 
                            mapNode.append('circle')
                                .classed('map-tree-circle-background',true)
                                .style('fill', 'white')
                                .attr('stroke', 'white')
                                .style('pointer-events', "none")
                                .attr('r', d => mapRoot.includes(d.source.name) ? scaleRadius(Math.sqrt(d.total_counts)) + 2 : 10)
                                .attr('cx', d => getMap(d).x)
                                .attr('cy', d => mapRoot.includes(d.source.name) ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) : getYPosition(d.source, 'z', cy + (genHeight[d.distance]), d))
                            mapNode.append('circle')
                                .classed('map-tree-circle', true)
                                .attr('id', d => 'map-tree-circle-' + d.name)
                                .attr('r', d => mapRoot.includes(d.source.name) ? scaleRadius(Math.sqrt(d.total_counts)) + 2 : 10)
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
                                .attr('stroke', d => conceptNames.includes(d.name) || inclusions.includes(d.name) ? d.color : mapRoot.includes(d.source.name) ? d.total_counts === 0 ? 'none' : color.textlightest : color.textlightest)
                                .attr('stroke-width', d => mapRoot.includes(d.source.name) ? 1.5 : 1.25)
                                .style('cursor', "pointer")
                                .attr('cx', d => getMap(d).x)
                                .attr('cy', d => mapRoot.includes(d.source.name) ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) : getYPosition(d.source, 'z', cy + (genHeight[d.distance]), d))
                                // .style('pointer-events', 'all')
                                .style('pointer-events', d => d.source.leaf && mapRoot.includes(d.source.name) ? 'none' : 'all')
                                .on('mouseover', (e,d) => {
                                    if (mapRoot.includes(d.source.name)) hoverNode(d, 'enter')
                                })
                                .on('mouseout', (e,d) => { 
                                    if (mapRoot.includes(d.source.name)) hoverNode(d, 'leave')
                                })
                                .on('click', (e,d) => {
                                    if (!mapRoot.includes(d.source.name)) {
                                        setMapRoot([...mapRoot,d.source.name])
                                        updateWidth([...mapRoot,d.source.name])
                                    }
                                    else {
                                        if (d.total_counts !== 0) {
                                            if (conceptNames.includes(d.name)) {
                                                const newInclusions = inclusions.filter(e => e !== d.name)
                                                updateConcepts(newInclusions,nodes,[],[d])
                                            } else if (!conceptNames.includes(d.name)){
                                                const newInclusions = [...inclusions,d.name]
                                                updateConcepts(newInclusions,nodes,[d],[])
                                            }     
                                        }
                                    }
                                })
                            mapNode.append('text')
                                .classed('map-total-counts', true)
                                .attr('id', d => 'map-total-counts-' + d.name)
                                .text(d => d.total_counts)
                                .attr('fill', d => conceptNames.includes(d.name) ? 'white' : inclusions.includes(d.name) ? color.text : color.textlight)
                                .style('opacity', d => mapRoot.includes(d.source.name) ? 1 : 0)
                                .style('font-size', '8px')
                                .style('font-weight', '700')
                                .style('pointer-events', 'none')
                                .attr('text-anchor', 'middle')
                                .attr('x', d => getMap(d).x)
                                .attr('y', d => mapRoot.includes(d.source.name) ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) + 3 : getYPosition(d.source, 'z', cy + (genHeight[d.distance]), d) + 3)
                            const buttonSymbol = mapNode.append('g')
                                .classed('map-button-symbol', true)
                                .attr('id', d => 'map-button-symbol-' + d.name)
                                .attr('visibility', 'hidden')
                                .attr('stroke', 'white')
                                .attr('stroke-width', 1.5)
                                .attr('stroke-linecap', 'round')
                                .style('pointer-events', 'none')
                                .style('transition', '0.5s opacity')
                            buttonSymbol.append('line')
                                .classed('map-button-line-1', true)
                                .attr('x1', d => getMap(d).x - 2.5)
                                .attr('y1', d => {
                                    if (conceptNames.includes(d.name)) {
                                        return getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) - 2.5      
                                    } else {
                                        return getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d)     
                                    }
                                })
                                .attr('x2', d => getMap(d).x + 2.5)
                                .attr('y2', d => {
                                    if (conceptNames.includes(d.name)) {
                                        return getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) + 2.5      
                                    } else {
                                        return getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d)     
                                    }
                                })
                            buttonSymbol.append('line')
                                .classed('map-button-line-2', true)
                                .attr('x1', d => conceptNames.includes(d.name) ? getMap(d).x + 2.5 : getMap(d).x)
                                .attr('y1', d => getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) - 2.5)
                                .attr('x2', d => conceptNames.includes(d.name) ? getMap(d).x - 2.5 : getMap(d).x)
                                .attr('y2', d => getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) + 2.5)
                            const altCounts = mapNode.append('g')
                                .classed('map-alt-counts',true)
                                .style('display', d => mapRoot.includes(d.source.name) ? 'block' : 'none')
                            altCounts.append('text')
                                .classed('map-alt-text', true)
                                .attr('id', d => 'map-alt-text-' + d.name)
                                .attr('text-anchor', 'middle')
                                .attr('x', d => getX(d))
                                .attr('y', d => getY(d))
                                .style('font-size', '8px')
                                .text(d => d.descendant_counts + ' DRC')
                                .attr('fill', d => d.descendant_counts === 0 ? color.textlight : color.text)
                            const mapLabel = mapNode.append('g')
                                .classed('map-label', true)
                                .style('cursor', 'pointer')
                                .style('pointer-events','all')
                                .style('display', d => mapRoot.includes(d.source.name) ? 'block' : 'none')
                                .on('mouseover', function (e,d) {
                                    d3.select('#map-label-rect-'+d.name).attr('fill', color.lightpurple)
                                    d3.select('#map-tree-text-'+d.name).attr('fill', color.text).style('font-weight',700)
                                    const el = this
                                    el.__hoverTimeout__ = setTimeout(() => {
                                        setHovered([d.name])
                                        tooltipHover(d, "enter", e)      
                                    },400)
                                })
                                .on('mouseout', function (e,d) {
                                    const el = this
                                    clearTimeout(el.__hoverTimeout__)
                                    setHovered([])
                                    tooltipHover(d, 'leave', e)
                                    d3.select('#map-label-rect-'+d.name).attr('fill', 'rgba(255, 255, 255, 0.7)')
                                    d3.select('#map-tree-text-'+d.name).attr('fill', d => conceptNames.includes(d.name) ? color.text : color.textlight).style('font-weight',400)
                                })
                                .on('click',(e,d) => {
                                    navigate(`/${d.name}`)
                                    tooltipHover(d, 'leave', e)
                                })
                            mapLabel.append('text')
                                .classed('map-tree-text', true)
                                .attr('id', d => 'map-tree-text-' + d.name)
                                .attr('text-anchor', 'middle')
                                .text(d => {
                                    let concept_info = d.data.concept 
                                    let maxWidth = 18
                                    let text = concept_info.concept_name || concept_info.concept_id.toString()
                                    return text.substring(0, maxWidth) + (text.length > maxWidth ? '...' : '')
                                })
                                .style('font-size','10px')
                                .attr('fill', d => conceptNames.includes(d.name) || hovered.includes(d.name) ? color.text : color.textlight)
                                .attr('x', d => getMap(d).x)
                                .attr('y', d => getMap(d).y - 20)
                            mapLabel.append('rect')
                                .classed('map-label-rect', true)
                                .attr('id', d => 'map-label-rect-' + d.name)
                                .attr('width', d => d3.select("#map-tree-text-" + d.name).node().getBBox().width + 14)
                                .attr('height', 16)
                                .attr('x', d => getMap(d).x - (d3.select("#map-tree-text-" + d.name).node().getBBox().width + 14)/2)
                                .attr('y', d => getMap(d).y - 31)
                                .attr('fill','rgba(255, 255, 255, 0.7)')
                                .attr("rx", 8)
                                .attr("ry", 8)
                                .lower()
                            mapNode.append('text')
                                .classed('map-code', true)
                                .attr('id', d => 'map-code-' + d.name)
                                .attr('text-anchor', 'middle')
                                .style('display', d => mapRoot.includes(d.source.name) ? 'block' : 'none')
                                .style('font-size', '8px')
                                .style('font-weight',700)
                                .attr('fill', d => conceptNames.includes(d.name) ? color.text: color.textlight)
                                .attr('x', d => getMap(d).x)
                                .attr('y', d => getMap(d).y - 7)
                                .text(d => d.data.concept.concept_code)
                            mapNode.append('text')
                                .classed('map-vocabulary', true)
                                .attr('id', d => 'map-vocabulary-' + d.name)
                                .attr('text-anchor', 'middle')
                                .style('display', d => mapRoot.includes(d.source.name) ? 'block' : 'none')
                                .style('font-size', '8px')
                                .attr('fill', d => conceptNames.includes(d.name) ? color.textlight: color.textlightest)
                                .attr('x', d => getMap(d).x)
                                .attr('y', d => getMap(d).y + 2)
                                .text(d => d.data.concept.vocabulary_id)
                            mapNode.lower()
                            mapLabel.raise()
                        }, update => {
                            update
                                .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                                // .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : (d.source.parents.some(parent => descendantsFilter.includes(parent)) || excludeList.includes(d.source.name)) && !conceptNames.includes(d.name) ? 0.5 : 1)
                            update.select('.map-link')
                                .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                                // .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : (d.source.parents.some(parent => descendantsFilter.includes(parent)) || excludeList.includes(d.source.name)) && !conceptNames.includes(d.name) ? 0.5 : 1)
                            update.select('.map-line')
                                .attr('stroke-width', d => conceptNames.includes(d.name) && mapRoot.includes(d.source.name) ? 2 : 1.5)
                                .attr('stroke-dasharray', d => mapRoot.includes(d.source.name) ? '4 2' : 'none')
                                .attr('stroke', d => inclusions.includes(d.name) ? color.textmedium : mapRoot.includes(d.source.name) ? color.textlightest : color.textlightest)
                                .transition(2000)
                                .attr("d", d => {
                                    let sourceX = getMap(d).x
                                    let sourceY = mapRoot.includes(d.source.name) ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) : getYPosition(d.source, 'z', cy + (genHeight[d.distance]), d)
                                    let targetX = mapRoot.includes(d.source.name) ? d.direction === -1 ? d.source.x - scaleRadius(Math.sqrt(d.source.total_counts)) - 14 : d.source.x + scaleRadius(Math.sqrt(d.source.total_counts)) + 14 : d.source.x
                                    let targetY = cy + (genHeight[d.distance])
                                    return curveX({source: [sourceX, sourceY], target: [targetX, targetY]})}
                                )
                            update.select('.map-tree-arrow')
                                .style('display', d => mapRoot.includes(d.source.name) ? 'block' : 'none')
                                .attr('fill', d => d.source.mappings?.map(d => d.name).some(name => inclusions.includes(name)) ? color.textmedium : color.textlightest)
                                .attr("d", d3.symbol().type(d3.symbolTriangle).size(arrowSize))
                                .attr("transform", d => {
                                    let x = d.direction === -1 ? d.source.x - scaleRadius(Math.sqrt(d.source.total_counts)) - 16 : getMap(d).x - scaleRadius(Math.sqrt(d.total_counts)) - 6
                                    let y = d.direction === -1 ? cy + (genHeight[d.distance]) : getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d)
                                    return "translate(" + x + "," + y + ")rotate(" + 90 + ")"
                                }) 
                            update.select('.map-tree-circle-background')
                                .attr('r', d => mapRoot.includes(d.source.name) ? scaleRadius(Math.sqrt(d.total_counts)) + 2 : 10)
                                .attr('cx', d => getMap(d).x)
                                .attr('cy', d => mapRoot.includes(d.source.name) ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) : getYPosition(d.source, 'z', cy + (genHeight[d.distance]), d))
                            update.select('.map-tree-circle')
                                .on('mouseover', (e,d) => {
                                    if (mapRoot.includes(d.source.name)) hoverNode(d, 'enter')
                                })
                                .on('mouseout', (e,d) => { 
                                    if (mapRoot.includes(d.source.name)) hoverNode(d, 'leave')
                                })
                                .on('click', (e,d) => {
                                    if (!mapRoot.includes(d.source.name)) {
                                        setMapRoot([...mapRoot,d.source.name])
                                        updateWidth([...mapRoot,d.source.name])
                                    }
                                    else {
                                        if (d.total_counts !== 0) {
                                            if (conceptNames.includes(d.name)) {
                                                const newInclusions = inclusions.filter(e => e !== d.name)
                                                updateConcepts(newInclusions,nodes,[],[d])
                                            } else if (!conceptNames.includes(d.name)){
                                                const newInclusions = [...inclusions,d.name]
                                                updateConcepts(newInclusions,nodes,[d],[])
                                            }     
                                        }
                                    }
                                })
                                .attr('r', d => mapRoot.includes(d.source.name) ? scaleRadius(Math.sqrt(d.total_counts)) + 2 : 10)
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
                                .style('pointer-events', d => d.source.leaf && mapRoot.includes(d.source.name) ? 'none' : 'all')
                                .attr('stroke', d => conceptNames.includes(d.name) || inclusions.includes(d.name) ? d.color : mapRoot.includes(d.source.name) ? d.total_counts === 0 ? 'none' : color.textlightest : color.textlightest)
                                .attr('stroke-width', d => mapRoot.includes(d.source.name) ? 1.5 : 1.25)
                                .transition(2000)
                                .attr('cx', d => getMap(d).x)
                                .attr('cy', d => mapRoot.includes(d.source.name) ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) : getYPosition(d.source, 'z', cy + (genHeight[d.distance]), d))
                                // .style('pointer-events', d => d.total_counts === 0 || relationship !== 'mappings' ? 'none' : 'all')
                            update.select('.map-total-counts')
                                .text(d => d.total_counts)
                                .style('opacity', d => mapRoot.includes(d.source.name) ? 1 : 0)
                                .attr('fill', d => conceptNames.includes(d.name) ? 'white' : inclusions.includes(d.name) ? color.text : color.textlight)
                                .attr('x', d => getMap(d).x)
                                .attr('y', d => mapRoot.includes(d.source.name) ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) + 3 : getYPosition(d.source, 'z', cy + (genHeight[d.distance]), d) + 3)
                            update.select('.map-button-line-1')
                                .attr('x1', d => getMap(d).x - 2.5)
                                .attr('y1', d => {
                                    if (conceptNames.includes(d.name)) {
                                        return getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) - 2.5      
                                    } else {
                                        return getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d)     
                                    }
                                })
                                .attr('x2', d => getMap(d).x + 2.5)
                                .attr('y2', d => {
                                    if (conceptNames.includes(d.name)) {
                                        return getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) + 2.5      
                                    } else {
                                        return getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d)     
                                    }
                                })
                            update.select('.map-button-line-2')
                                .attr('x1', d => conceptNames.includes(d.name) ? getMap(d).x + 2.5 : getMap(d).x)
                                .attr('y1', d => getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) - 2.5)
                                .attr('x2', d => conceptNames.includes(d.name) ? getMap(d).x - 2.5 : getMap(d).x)
                                .attr('y2', d => getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) + 2.5)
                            update.select('.map-alt-counts')
                                .style('display', d => mapRoot.includes(d.source.name) ? 'block' : 'none')
                            update.select('.map-alt-text')
                                .attr('x', d => getX(d))
                                .attr('y', d => getY(d))
                                .text(d => d.descendant_counts + ' DRC')
                                .attr('fill', d => d.descendant_counts === 0 ? color.textlight : color.text)
                            update.select('.map-label')
                                .style('display', d => mapRoot.includes(d.source.name) ? 'block' : 'none')
                                .on('mouseover', function (e,d) {
                                    d3.select('#map-label-rect-'+d.name).attr('fill', color.lightpurple)
                                    d3.select('#map-tree-text-'+d.name).attr('fill', color.text).style('font-weight',700)
                                    const el = this
                                    el.__hoverTimeout__ = setTimeout(() => {
                                        setHovered([d.name])
                                        tooltipHover(d, "enter", e)      
                                    },400)
                                })
                                .on('mouseout', function (e,d) {
                                    const el = this
                                    clearTimeout(el.__hoverTimeout__)
                                    setHovered([])
                                    tooltipHover(d, 'leave', e)
                                    d3.select('#map-label-rect-'+d.name).attr('fill', 'rgba(255, 255, 255, 0.7)')
                                    d3.select('#map-tree-text-'+d.name).attr('fill', d => conceptNames.includes(d.name) ? color.text : color.textlight).style('font-weight',400)
                                })
                                .on('click', (e,d) => {
                                    navigate(`/${d.name}`)
                                    tooltipHover(d, 'leave', e)
                                })
                            update.select('.map-tree-text')
                                .text(d => {
                                    let concept_info = d.data.concept 
                                    let maxWidth = 18
                                    let text = concept_info.concept_name || concept_info.concept_id.toString()
                                    return text.substring(0, maxWidth) + (text.length > maxWidth ? '...' : '')
                                })
                                .attr('fill', d => conceptNames.includes(d.name) || hovered.includes(d.name) ? color.text : color.textlight)
                                .attr('x', d => getMap(d).x)
                                .attr('y', d => getMap(d).y - 20)
                            update.select('.map-label-rect')
                                .attr('width', d => d3.select("#map-tree-text-" + d.name).node().getBBox().width + 14)
                                .attr('x', d => getMap(d).x - (d3.select("#map-tree-text-" + d.name).node().getBBox().width + 14)/2)
                                .attr('y', d => getMap(d).y - 31)
                            update.select('.map-code')
                                .style('display', d => mapRoot.includes(d.source.name) ? 'block' : 'none')
                                .attr('fill', d => conceptNames.includes(d.name) ? color.text: color.textlight)
                                .attr('x', d => getMap(d).x)
                                .attr('y', d => getMap(d).y - 7)
                                .text(d => d.data.concept.concept_code)
                            update.select('.map-vocabulary')
                                .style('display', d => mapRoot.includes(d.source.name) ? 'block' : 'none')
                                .attr('fill', d => conceptNames.includes(d.name) ? color.textlight : color.textlightest)
                                .attr('x', d => getMap(d).x)
                                .attr('y', d => getMap(d).y + 2)
                                .text(d => d.data.concept.vocabulary_id)
                        },exit => exit.remove())
                        //Subsumes node
                        update.select('.subsumes-node')
                            .transition()
                            .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : d.levels === '-1' ? 0.8 : 1)
                            // .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : d.levels === '-1' || (!sidebarRoot.name.includes(d.name) && d.parents.some(parent => descendantsFilter.includes(parent))) || (sidebarRoot.name.includes(d.name) && excludeList.includes(d.name)) ? 0.5 : 1)
                        update.select('.tree-circle-background') 
                            .transition()
                            .attr('r', d => scaleRadius(Math.sqrt(d.total_counts)) + 2)
                            .attr('cx', d => d.x)
                            .attr('cy', d => cy + (genHeight[d.distance]))
                        update.select('.tree-circle')
                            .on('mouseover', (e,d) => hoverNode(d, 'enter'))
                            .on('mouseout', (e,d) => hoverNode(d, 'leave'))
                            .on('click', (e,d) => {
                                if (d.total_counts !== 0) {
                                    if (conceptNames.includes(d.name)) {
                                        const newInclusions = inclusions.filter(e => e !== d.name)
                                        updateConcepts(newInclusions,nodes,[],[d])
                                    } else if (!conceptNames.includes(d.name)){
                                        const newInclusions = [...inclusions,d.name]
                                        updateConcepts(newInclusions,nodes,[d],[])
                                    }     
                                }
                            })
                            .attr('r', d => scaleRadius(Math.sqrt(d.total_counts)) + 2)
                            .attr('stroke', d => d.total_counts === 0 ? 'none' : conceptNames.includes(d.name) && inclusions.includes(d.name) ? d.color : color.textlightest)
                            .attr('fill', d => {
                                if (d.total_counts === 0 || (d.leaf && d.descendant_counts !== d.total_counts)) return 'white'
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
                            .attr('pointer-events', d => d.total_counts === 0 || d.levels === "-1" || d.leaf ? "none" : "all")
                            .transition('nodePosition')
                            .duration(500)
                            .attr('cx', d => d.x)
                            .attr('cy', d => cy + (genHeight[d.distance]))
                        update.select('.total-counts')
                            .text(d => d.total_counts)
                            .style('font-size', d => d.total_counts === 0 ? '10px' : '8px')
                            .attr('fill', d => d.leaf ? !excludeList.includes(d.name) && inclusions.includes(d.name) ? color.text : color.textlight : d.total_counts === 0 || !conceptNames.includes(d.name) ? color.textlight : 'white')
                            .attr('x', d => d.x)
                            .attr('y', d => cy + (genHeight[d.distance]) + 3)
                        update.select('.close-mappings')
                            .style('display', d => mapRoot.includes(d.name) ? 'block' : 'none')
                            .on('click',(e,d) => {
                                let filteredRoots = mapRoot.filter(e => e !== d.name)
                                setMapRoot(filteredRoots)
                                updateWidth(filteredRoots)
                            })
                        update.select('.close-mappings-line-1')
                            .attr('x1', d => !d.data.concept.standard_concept ? d.x + scaleRadius(Math.sqrt(d.total_counts)) + 11 : d.x - scaleRadius(Math.sqrt(d.total_counts)) - 11)
                            .attr('y1', d => cy + (genHeight[d.distance]) - 3)
                            .attr('x2', d => !d.data.concept.standard_concept ? d.x + scaleRadius(Math.sqrt(d.total_counts)) + 5 : d.x - scaleRadius(Math.sqrt(d.total_counts)) - 5)
                            .attr('y2', d => cy + (genHeight[d.distance]) + 3)
                        update.select('.close-mappings-line-2')
                            .attr('x1', d => !d.data.concept.standard_concept ? d.x + scaleRadius(Math.sqrt(d.total_counts)) + 5 : d.x - scaleRadius(Math.sqrt(d.total_counts)) - 5)
                            .attr('y1', d => cy + (genHeight[d.distance]) - 3)
                            .attr('x2', d => !d.data.concept.standard_concept ? d.x + scaleRadius(Math.sqrt(d.total_counts)) + 11 : d.x - scaleRadius(Math.sqrt(d.total_counts)) - 11)
                            .attr('y2', d => cy + (genHeight[d.distance]) + 3)
                        update.select('.button-symbol')
                            .attr('stroke', d => (d.leaf && d.children.length > 0 && d.descendant_counts !== d.total_counts) ? color.text : 'white')
                        update.select('.button-line-1')
                            .attr('x1', d => d.x - 2.5)
                            .attr('y1', d => {
                                if (conceptNames.includes(d.name)) {
                                    return cy + (genHeight[d.distance]) - 2.5      
                                } else {
                                    return cy + (genHeight[d.distance])     
                                }  
                            })
                            .attr('x2', d => d.x + 2.5)
                            .attr('y2', d => {
                                if (conceptNames.includes(d.name)) {
                                    return cy + (genHeight[d.distance]) + 2.5      
                                } else {
                                    return cy + (genHeight[d.distance])     
                                }    
                            })
                        update.select('.button-line-2')
                            .attr('x1', d => conceptNames.includes(d.name) ? d.x + 2.5 : d.x)
                            .attr('y1', d => cy + (genHeight[d.distance]) - 2.5)
                            .attr('x2', d => conceptNames.includes(d.name) ? d.x - 2.5 : d.x)
                            .attr('y2', d => cy + (genHeight[d.distance]) + 2.5)
                        update.select('.alt-group')
                            .on('mouseover',(e,d) => {
                                const descendants = [...d.included_descendants,...d.descendants].filter((e,n,l) => l.indexOf(e) === n)
                                if (!d.leaf && descendants.length > 1) setHovered(descendants)    
                                if (descendants.length === 1) setHovered([descendants[0],descendants[0]])            
                            })
                            .on('mouseout',(e,d) => setHovered([]))
                            .style('cursor', 'pointer')
                            .transition()
                            .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : d.levels === '-1' ? 0.5 : 1)
                        update.select('.alt-text')
                            .attr('fill', d => d.leaf ? 'white' : d.descendant_counts === 0 ? color.textlight : color.text)
                            .attr('x', d => d.x)
                            .attr('y', d => cy + (genHeight[d.distance]) + scaleRadius(Math.sqrt(d.total_counts)) + 13)
                            .style('font-weight', d => d.leaf ? 700 : 400)
                            .text(d => d.descendant_counts + ' DRC')
                        update.select('.alt-rect')
                            .attr('fill', d => d.leaf ? d.color : 'none')
                            // .attr('stroke', d => sidebarRoot.name.includes(d.name) ? color.text : 'none')
                            // .attr('stroke-dasharray', d => !d.data.concept.standard_concept ? '3 3' : 'none')
                            .attr('width',d => d3.select('#alt-text-'+d.name).node().getBBox().width + 6)
                            .attr('x', d => d.x - (d3.select('#alt-text-'+d.name).node().getBBox().width + 6)/2)
                            .attr('y', d => cy + (genHeight[d.distance]) + scaleRadius(Math.sqrt(d.total_counts)) + 4)
                        update.select('.label')
                            // .on('mouseover', function (e,d) {
                            //     if (d.levels === '-1') {
                            //         d3.select('#subsumes-node-'+d.name).style('opacity',1)
                            //         d3.select('#tree-text-'+d.name).style('opacity',1)
                            //         d3.select('#alt-group-'+d.name).style('opacity',1)
                            //     }
                            //     d3.select('#tree-text-'+d.name).attr('fill', color.text).attr('font-weight', 700)
                            //     d3.select('#label-rect-'+d.name).attr('fill-opacity',1).attr('fill', color.lightpurple)
                            //     const el = this
                            //     el.__hoverTimeout__ = setTimeout(() => {
                            //         if (d.levels !== "-1") setHovered([d.name])
                            //         tooltipHover(d, "enter", e)  
                            //     }, 400)
                            // })
                            // .on('mouseout', function (e,d) {
                            //     const el = this
                            //     clearTimeout(el.__hoverTimeout__)
                            //     if (d.levels === '-1') {
                            //         d3.select('#subsumes-node-'+d.name).style('opacity',0.5)
                            //         d3.select('#tree-text-'+d.name).style('opacity',0.5)
                            //         d3.select('#alt-group-'+d.name).style('opacity',0.5)
                            //     }
                            //     d3.select('#tree-text-'+d.name).attr('fill', d => conceptNames.includes(d.name) || sidebarRoot.name.includes(d.name) ? color.text : color.textlight).attr('font-weight', d => sidebarRoot.name.includes(d.name) ? 700 : 400)
                            //     d3.select('#label-rect-'+d.name).attr('fill-opacity', d => sidebarRoot.name.includes(d.name) ? 1 : 0.7).attr('fill', d => sidebarRoot.name.includes(d.name) ? color.lightpurple : 'white')
                            //     if (d.levels !== "-1") setHovered([])
                            //     tooltipHover(d, "leave", e)   
                            // })
                            .on('click', (e,d) => {
                                tooltipHover(d, 'leave', e)
                                setLoading(true)
                                navigate(`/${d.name}`)
                            })
                        update.select('.tree-text')
                            .text(d => {
                                let genLength = 0
                                let maxWidth = 0
                                let concept_info = d.data.concept
                                nodes.forEach(n => n.distance === d.distance ? genLength++ : null)
                                let text = concept_info.concept_name || concept_info.concept_id.toString()
                                if ((relationship === 'mappings' && d.mappings?.length > 0) || mapRoot.includes(d.name)) {
                                    maxWidth = 18
                                }
                                else {
                                    if (genLength === 1) maxWidth = Math.round(width/6)
                                    else maxWidth = 23
                                    // else maxWidth = Math.round((width/genLength)/12) < 12 ? 12 : Math.round((width/genLength)/12)
                                }  
                                return text.substring(0, maxWidth) + (text.length > maxWidth ? '...' : '')
                            })
                            .attr('font-weight', d => sidebarRoot.name.includes(d.name) || (hovered.length === 1 && hovered.includes(d.name)) ? 700 : 400)
                            .attr('fill', d => conceptNames.includes(d.name) || sidebarRoot.name.includes(d.name) || (hovered.length === 1 && hovered.includes(d.name)) ? color.text : color.textlight)
                            .attr('x', d => getLabel(d).x)
                            .attr('y', d => getLabel(d).y - 20)
                            .transition()
                            .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : d.levels === '-1' ? 0.5 : 1)
                        update.select('.label-rect')
                            .attr('width', d => d3.select('#tree-text-'+d.name).node().getBBox().width + 14)
                            .attr('x', d => getLabel(d).x - (d3.select("#tree-text-" + d.name).node().getBBox().width + 14)/2)
                            .attr('y', d => getLabel(d).y - 31)
                            .attr('fill', d => sidebarRoot.name.includes(d.name) || (hovered.length === 1 && hovered.includes(d.name)) ? color.lightpurple : 'white')
                            .attr('fill-opacity', d => sidebarRoot.name.includes(d.name) || (hovered.length === 1 && hovered.includes(d.name)) ? 1 : 0.7)
                        update.select('.node-code')
                            .attr('fill', d => conceptNames.includes(d.name) ? color.text : color.textlight)
                            .text(d => d.data.concept.concept_code)
                            .attr('x', d => getLabel(d).x)
                            .attr('y', d => getLabel(d).y - 7)
                        update.select('.node-vocabulary')
                            .attr('fill', d => conceptNames.includes(d.name) ? color.textlight : color.textlightest)
                            .text(d => d.data.concept.vocabulary_id)
                            .attr('x', d => getLabel(d).x)
                            .attr('y', d => getLabel(d).y + 2)
                        update.select('.root-btn-group')
                            .style('display', d => sidebarRoot.name.includes(d.name) ? 'block' : 'none')
                            // .attr('text-anchor', d => d.data.concept.standard_concept ? 'start' : 'end')
                            .attr('transform', d => {
                                const xVar = d.total_counts === 0 ? 20 : 10
                                if (d.data.concept.standard_concept) return `translate(${d.x + scaleRadius(Math.sqrt(d.total_counts)) + xVar}, 0)`
                                else return `translate(${d.x - scaleRadius(Math.sqrt(d.total_counts)) - xVar}, 0)`
                                }   
                            )
                            .transition()
                            .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                        update.select('.root-btn-descendants')
                            .attr('text-anchor', d => d.data.concept.standard_concept ? 'start' : 'end')
                            .on('click', (e,d) => {
                                setExcludeInclude('descendants',d.name)
                            })
                        update.select('.root-btn-exclude')
                            .attr('text-anchor', d => d.data.concept.standard_concept ? 'start' : 'end')
                            .on('click', (e,d) => {
                                setExcludeInclude('exclude',d.name)
                            })
                        update.select('.root-btn-text-descendants')
                            // .text(d => descendantsFilter.includes(d.name) ? 'Excluded' : 'Included')
                            .style('font-weight', d => descendantsFilter.includes(d.name) ? '400' : '700')
                            .attr('x', d => d.data.concept.standard_concept ? 16 : -16)
                            .attr('y', d => cy + (genHeight[d.distance]) + 11)
                        update.select('.root-btn-box-descendants')
                            .attr('stroke', d => descendantsFilter.includes(d.name) ? color.textlight : color.text)
                            .attr('x', d => d.data.concept.standard_concept ? -2 : -11)
                            .attr('y', d => cy + (genHeight[d.distance]))
                            .attr('fill', d => descendantsFilter.includes(d.name) ? 'none' : color.text)
                        update.select('.root-btn-check-descendants')
                            .attr('fill', d => descendantsFilter.includes(d.name) ? 'none' : 'white')
                            .attr('x', d => d.data.concept.standard_concept ? 0 : 0)
                            .attr('y', d => cy + (genHeight[d.distance]) + 10)
                        update.select('.root-btn-text-exclude')
                            // .text(d => descendantsFilter.includes(d.name) ? 'Excluded' : 'Included')
                            .style('font-weight', d => excludeList.includes(d.name) ? '700' : '400')
                            .attr('x', d => d.data.concept.standard_concept ? 16 : -16)
                            .attr('y', d => cy + (genHeight[d.distance]) - 7)
                        update.select('.root-btn-box-exclude')
                            .attr('stroke', d => excludeList.includes(d.name) ? color.text : color.textlight)
                            .attr('x', d => d.data.concept.standard_concept ? -2 : -11)
                            .attr('y', d => cy + (genHeight[d.distance]) - 18)
                            .attr('fill', d => excludeList.includes(d.name) ? color.text : 'none')
                        update.select('.root-btn-check-exclude')
                            .attr('fill', d => excludeList.includes(d.name) ? 'white' : 'none')
                            .attr('x', d => d.data.concept.standard_concept ? 0 : 0)
                            .attr('y', d => cy + (genHeight[d.distance]) - 8)
                        update.select('.prune-group')
                            .style('display', d => pruned && d.leaf && d.children.length > 0 && !d.children?.every(child => d.connections.map(d => d.child).includes(child)) ? 'block' : 'none')
                            .style('opacity', d => hovered.length === 1 && hovered.includes(d.name) ? 1 : hovered.length > 0 ? 0.2 : 1)
                        update.select('.prune-line')
                            .attr('x1',d => d.x)
                            .attr('y1',d => cy + (genHeight[d.distance]) + scaleRadius(Math.sqrt(d.total_counts)) + 18)
                            .attr('x2',d => d.x + 0.1)
                            .attr('y2',d => cy + (genHeight[d.distance]) + (num - 20))
                        update.select('.prune-arrow')
                            .attr("transform", d => {
                                let x = d.x
                                let y = cy + (genHeight[d.distance]) + (num - 20)
                                return "translate(" + x + "," + y + ")rotate(" + 180 + ")"
                            }) 
                        update.selectAll(".prune-curve").data(d => d.connections)
                        .join(enter => {
                            const curve = enter.append('g')
                                .classed('prune-curve',true)
                                .style('opacity', d => d.parents === hovered ? 1 : hovered.length > 0 ? 0.2 : 1)
                            curve.append('path')
                                .classed('prune-curve-line',true)
                                .attr('fill', 'none')
                                .attr("stroke", "url(#myGradient)")
                                .attr('stroke-width', 1.5)
                                .style('display', pruned ? 'block' : 'none')
                                .attr("d", d => {
                                    let sourceNode = nodes.filter(e => e.name === d.source)[0]
                                    // // let coordinates = getMidXAndMaxY(d.parents)
                                    // let x1 = sourceNode.x
                                    let x1 = d.x
                                    let y1 = cy + (genHeight[sourceNode.distance]) + scaleRadius(Math.sqrt(sourceNode.total_counts)) + 18
                                    let x2 = d.mid
                                    let y2 = cy + (genHeight[sourceNode.distance]) + (num - 20)
                                    return curveY({source: [x1, y1], target: [x2, y2]})
                                })
                                // .on('mouseover',(e,d) => setHovered(d.parents))
                                // .on('mouseout',(e,d) => setHovered([]))
                            curve.append('path')
                                .classed('prune-curve-background',true)
                                .attr('fill', 'none')
                                .attr("stroke", "transparent")
                                .attr('stroke-width', 5)
                                .style('cursor','pointer')
                                .style('display', pruned ? 'block' : 'none')
                                .attr("d", d => {
                                    let sourceNode = nodes.filter(e => e.name === d.source)[0]
                                    // // let coordinates = getMidXAndMaxY(d.parents)
                                    // let x1 = sourceNode.x
                                    let x1 = d.x
                                    let y1 = cy + (genHeight[sourceNode.distance]) + scaleRadius(Math.sqrt(sourceNode.total_counts)) + 18
                                    let x2 = d.mid
                                    let y2 = cy + (genHeight[sourceNode.distance]) + (num - 20)
                                    return curveY({source: [x1, y1], target: [x2, y2]})
                                })
                                .on('mouseover',(e,d) => setHovered(d.parents))
                                .on('mouseout',(e,d) => setHovered([]))
                            curve.append('path')
                                .classed('prune-curve-arrow', true)
                                .attr('fill', color.darkbackground)
                                .attr("d", d3.symbol().type(d3.symbolTriangle).size(arrowSize))
                                .attr("transform", d => {
                                    let x = d.mid
                                    let y = cy + (genHeight[nodes.filter(e => e.name === d.source)[0].distance]) + (num - 20)
                                    return "translate(" + x + "," + y + ")rotate(" + 180 + ")"
                                }) 
                        },update => {
                            update 
                                .style('opacity', d => d.parents === hovered ? 1 : hovered.length > 0 ? 0.2 : 1)
                            update.select('.prune-curve-line')
                                .style('display', pruned ? 'block' : 'none')
                                .attr("d", d => {
                                    let sourceNode = nodes.filter(e => e.name === d.source)[0]
                                    // // let coordinates = getMidXAndMaxY(d.parents)
                                    // let x1 = sourceNode.x
                                    let x1 = d.x
                                    let y1 = cy + (genHeight[sourceNode.distance]) + scaleRadius(Math.sqrt(sourceNode.total_counts)) + 18
                                    let x2 = d.mid
                                    let y2 = cy + (genHeight[sourceNode.distance]) + (num - 20)
                                    return curveY({source: [x1, y1], target: [x2, y2]})
                                })
                                // .on('mouseover',(e,d) => setHovered(d.parents))
                                // .on('mouseout',(e,d) => setHovered([]))
                            update.select(".prune-curve-background")
                                .style('display', pruned ? 'block' : 'none')
                                .attr("d", d => {
                                    let sourceNode = nodes.filter(e => e.name === d.source)[0]
                                    // // let coordinates = getMidXAndMaxY(d.parents)
                                    // let x1 = sourceNode.x
                                    let x1 = d.x
                                    let y1 = cy + (genHeight[sourceNode.distance]) + scaleRadius(Math.sqrt(sourceNode.total_counts)) + 18
                                    let x2 = d.mid
                                    let y2 = cy + (genHeight[sourceNode.distance]) + (num - 20)
                                    return curveY({source: [x1, y1], target: [x2, y2]})
                                })
                                .on('mouseover',(e,d) => setHovered(d.parents))
                                .on('mouseout',(e,d) => setHovered([]))
                            update.select('.prune-curve-arrow')
                                .attr("transform", d => {
                                    let x = d.mid
                                    let y = cy + (genHeight[nodes.filter(e => e.name === d.source)[0].distance]) + (num - 20)
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
            nodes.filter(n => n.levels !== '-1').forEach(node => {
                sums.push(node.total_counts)
                sums.push(node.descendant_counts)
                node.mappings.forEach(map => {
                    sums.push(map.total_counts)
                    sums.push(map.descendant_counts)
                })
            })
            const extent = d3.extent(sums)
            // **** this should not be dynamic ***
            const scaleWidth = d3.scaleLinear().domain([0, extent[1]]).range(extent[1] === 0 ? [0,0] : [0, 70])
            let parentsArray = nodes.filter(d => d.relationship === "-1")
            let rootArray = nodes.filter(d => d.relationship === "0")
            let childrenArray = nodes.filter(d => d.relationship.includes('-') && d.relationship !== "-1").sort((x,y) => {
                const [a1, a2] = x.relationship.split('-').map(Number)
                const [b1, b2] = y.relationship.split('-').map(Number)
                return a1 - b1 || a2 - b2
                })
            let childrenGroups = childrenArray.reduce((acc, obj) => {
                const groupKey = parseInt(obj.relationship.split('-')[0]) + 1
                if (!acc[groupKey]) acc[groupKey] = []
                acc[groupKey].push(obj)
                return acc
            }, {})
            let sectionData = [
                {section:'Parents',nodes:parentsArray},
                {section:'Root',nodes:rootArray},
            ]
            let childrenSections = Object.entries(childrenGroups).map(([key, nodes]) => ({
                section: 'Level ' + key,   
                nodes: nodes    
            }))
            sectionData = [...sectionData,...childrenSections]
            sectionData = sectionData.filter(d => d.nodes.length > 0) 
            // console.log('list',sectionData)
            d3.select('#list-container').selectAll('.list-section').data(sectionData, d => d.section)
            .join(enter => {
                const section = enter.append('div')  
                    .classed('list-section',true)
                const title = section.append('div')    
                    .classed('list-section-title',true)
                    .style('opacity', d => hovered.length > 0 ? 0.2 : 1)
                    .style('border-bottom','1px solid color-mix(in srgb, #b2b2b2, white 70%)')
                title.append('i')
                    .classed('list-section-arrow fa-solid fa-arrow-up',true)
                    .style('transform', d => d.section === 'Root' ? 'rotate('+90+'deg)' : d.section !== 'Parents' ? 'rotate('+180+'deg)' : 'none')
                    .style('transform-origin', 'center')
                    .style('font-size','10px')
                title.append('p')
                    .classed('list-level-number selectedText',true)
                    .html(d => d.section === 'Root' ? 'Level 1' : d.section)
                // CONCEPT LIST
                section.selectAll(".list-item-container").data(d => d.nodes, d => d.name)
                .join(enter => {
                    const itemContainer = enter.append('div')
                        .classed('list-item-container',true)
                        .style('border-bottom', d => d.levels === '-1' ? '0.5px solid #d6d6d6' : '0.5px solid #e0e0e0')
                    const item = itemContainer.append('div')
                        .classed('list-item',true)
                        .attr('id', d => 'list-item-'+d.name)
                        .style('background-color', d => d.levels === '-1' ? '#f0f0f0' : 'white')
                        .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                    const titleSection = item.append('div')
                        .classed('list-title-section',true)
                    const conceptCard = titleSection.append('div')
                        .classed('list-card',true)
                        .attr('id', d => 'list-card-'+d.name)
                        .style('display','flex')
                        .style('flex-direction','column')
                        .style('box-shadow', d => conceptNames.includes(d.name) || d.leaf ? '0 0 0 1px rgba(0, 0, 0, 0.02),0 2px 10px rgba(0, 0, 0, 0.15)' : 'none')
                        .style('background-color', d => d.levels === '-1' ? 'none' : conceptNames.includes(d.name) || d.leaf ? 'white' : '#ebebeb')
                        .style('border', d => sidebarRoot.name.includes(d.name) ? '1px solid #6a23d6' : 'none')
                    const title = conceptCard.append('div')
                        .classed('list-item-title',true)
                    const title1 = title.append('div')
                        .style('display','flex')
                        .style('align-items','center')
                    title1.append('div')
                        .classed('list-title-circle',true)
                        .classed('list-circle-dash', d => d.total_counts === 0 && !d.leaf ? true : false)
                        .classed('list-circle', d => d.total_counts === 0 && !d.leaf ? false : true)
                        .classed('btn', d => conceptNames.includes(d.name) || d.leaf ? true : false)
                        .style("pointer-events", d => conceptNames.includes(d.name) || d.leaf ? 'all' : 'none')
                        .style('background', d => {
                            if (d.total_counts === 0 && !d.leaf) return "none"
                            if (conceptNames.includes(d.name) || d.leaf) {
                                if (!d.data.concept.standard_concept) {return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, "+ d.color + " 0.5px," + d.color + " 2px)"} 
                                else {return "none"}
                            }
                            else {
                                if (!d.data.concept.standard_concept) return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, #d6d6d6 0.5px, #d6d6d6 2px)"  
                                else {return "none"}

                            }      
                        })
                        .style("background-color", d => {
                            if (d.total_counts === 0 && !d.leaf) return "transparent"
                            if (conceptNames.includes(d.name) || d.leaf) {
                                if (d.data.concept.standard_concept) {return d.color} 
                                else {return "transparent"}
                            }
                            else return '#d6d6d6'
                        }) 
                        .style('border', d => d.total_counts === 0 && !d.leaf ? '1px solid #b2b2b2' : conceptNames.includes(d.name) || d.leaf ? `1px solid ${d.color}` : '1px solid #d6d6d6')
                        .style('display',d => d.levels === '-1' ? 'none' : 'block')
                        .on('mouseover',(e,d) => setHovered([d.name]))
                        .on('mouseout', (e,d) => setHovered([]))
                    const titleRight = title1.append('div')
                        .classed('list-title-right btn',true)
                        .style('display','flex')
                        .style('align-items','center')
                        .on('mouseover',(e,d) => {
                            d3.select('#list-icons-'+d.name).transition(1000).style('max-width','36px').style('opacity',1)
                        })
                        .on('mouseout', (e,d) => {
                            if (!showConfirmation) d3.select('#list-icons-'+d.name).transition(1000).style('max-width','0px').style('opacity',0)
                        })
                    const icons = titleRight.append('div')
                        .classed('list-icons',true)
                        .attr('id',d => 'list-icons-'+d.name)
                        .style('display','flex')
                        .style('max-width', '0px')
                        .style('opacity', 0)
                    icons.append('img')
                        .classed('list-eye icon marginRight eye',true)
                        .attr('id', d => 'list-eye-'+d.name)
                        .attr("src", d => conceptNames.includes(d.name) || d.leaf ? openedEye : closedEye)
                        .style('opacity', d => conceptNames.includes(d.name) || d.leaf ? 1 : 0.2)
                        .style('display', d => (d.total_counts === 0 && !d.leaf) || d.levels === '-1' ? 'none' : 'inline-block')
                        .on('mouseover', (e, d) => {
                            if (!conceptNames.includes(d.name) && !d.leaf) d3.select('#list-eye-'+d.name).transition().style('opacity',1)
                            const el = e.currentTarget
                            el.__hoverTimeout__ = setTimeout(() => {
                                showActionLabel(
                                    conceptNames.includes(d.name) || d.leaf
                                        ? 'Hide concept'
                                        : 'Show concept',
                                    'enter',
                                    e
                                )
                            }, 1200)
                        })
                        .on('mouseout', (e,d) => {
                            if (!conceptNames.includes(d.name) && !d.leaf) d3.select('#list-eye-'+d.name).transition().style('opacity',0.2)
                            clearTimeout(e.currentTarget.__hoverTimeout__)
                            showActionLabel('','leave',e)
                        })
                        .on('click',(e,d) => {
                            clearTimeout(e.currentTarget.__hoverTimeout__)
                            showActionLabel('','leave')
                            if (d.total_counts !== 0) {
                                if (conceptNames.includes(d.name)) {
                                    const newInclusions = inclusions.filter(e => e !== d.name)
                                    updateConcepts(newInclusions,nodes,[],[d])
                                } else if (!conceptNames.includes(d.name)){
                                    const newInclusions = [...inclusions,d.name]
                                    updateConcepts(newInclusions,nodes,[d],[])
                                }     
                            } 
                        })
                    icons.append('i')
                        .classed('list-search fa fa-search iconLg marginRight',true)
                        .attr('id', d => 'list-search-'+d.name)
                        .style('transform','scaleX(-1)')
                        .style('display', d => sidebarRoot.name.includes(d.name) ? 'none' : 'inline-block')
                        .on('mouseover', (e, d) => {
                            const el = e.currentTarget
                            el.__hoverTimeout__ = setTimeout(() => {
                                showActionLabel('Select concept','enter',e)
                            }, 1200)
                        })
                        .on('mouseout', (e,d) => {
                            clearTimeout(e.currentTarget.__hoverTimeout__)
                            showActionLabel('','leave',e)
                        })
                        .on('click', (e,d) => {
                            clearTimeout(e.currentTarget.__hoverTimeout__)
                            showActionLabel('','leave')
                            showConfirmationPopup(d, 'enter', e)
                        })
                    const titleP = titleRight.append('p')
                        .classed('list-title-p btn',true)
                        .style('opacity', d => conceptNames.includes(d.name) || d.leaf ? 1 : 0.6)
                        .on('mouseover', (e, d) => {
                            const el = e.currentTarget
                            el.__hoverTimeout__ = setTimeout(() => {
                                showActionLabel('Select concept','enter',e)
                            }, 1200)
                        })
                        .on('mouseout', (e,d) => {
                            clearTimeout(e.currentTarget.__hoverTimeout__)
                            showActionLabel('','leave',e)
                        })
                        .on('click', (e,d) => {
                            clearTimeout(e.currentTarget.__hoverTimeout__)
                            showActionLabel('','leave')
                            if (!sidebarRoot.name.includes(d.name)) showConfirmationPopup(d, 'enter', e)
                        })
                    titleP.append('span')
                        .classed('title-name selectedText marginRight',true)
                        .html(d => d.data.concept.concept_name)
                    titleP.append('span')
                        .classed('title-code marginRight num',true)
                        .style('font-weight',500)
                        .html(d => d.data.concept.concept_code ? d.data.concept.concept_code : d.data.concept.concept_id)
                    titleP.append('span')
                        .classed('title-vocab marginRight',true)
                        .html(d => d.data.concept.vocabulary_id)   
                    title.append('i')
                        .classed('info-icon fa-solid fa-circle-info icon',true)  
                        .attr('id', d => 'info-icon-'+d.name)  
                        .style('opacity', 0.2)
                        .style('display', d => d.levels === '-1' || !d.levels ? 'none' : 'block')
                        .on('mouseover',(e,d) => d3.select('#info-icon-'+d.name).transition().style('opacity',1))
                        .on('mouseout', (e,d) => {if(d3.select('#info-container-'+d.name).style('height') !== '45px') d3.select('#info-icon-'+d.name).transition().style('opacity',0.2)})
                        .on('click', (e,d) => {
                            if (d3.select('#info-container-'+d.name).style('height') === '45px') {
                                d3.select('#info-icon-'+d.name).transition().style('opacity',0.2)
                                d3.select('#info-container-'+d.name).transition().style('opacity',0).style('height','0px').style('padding-top','0px').style('margin','0px 0px 0px 22px')
                                d3.select('#list-card-'+d.name).transition().style('border-radius','20px')
                            } else {
                                d3.select('#info-icon-'+d.name).transition().style('opacity',1)
                                d3.select('#info-container-'+d.name).transition().style('opacity',1).style('height','45px').style('padding-top','4px').style('margin','4px 4px 4px 22px')
                                d3.select('#list-card-'+d.name).transition().style('border-radius','12px')
                            }
                        })
                    const infoContainer = conceptCard.append('div')
                        .classed('info-container',true)
                        .attr('id', d => 'info-container-'+d.name)
                        .style('display', d => d.levels === '-1' || !d.levels ? 'none' : 'flex')
                        .style('border-top', d => conceptNames.includes(d.name) || d.leaf ? '1px solid color-mix(in srgb, #36126d, white 90%)' : '1px solid color-mix(in srgb, #36126d, white 78%)')
                    const infoCol1 = infoContainer.append('div')
                        .classed('info-col',true)
                    infoCol1.append('p')
                        .classed('selectedText infoRow',true)
                        .html('Id:')
                        .append('span')
                        .classed('infoContent num',true)
                        .html(d => d.name)
                    infoCol1.append('p')
                        .classed('selectedText infoRow',true)
                        .html('Code:')
                        .append('span')
                        .classed('infoContent num',true)
                        .html(d => d.data.concept.concept_code)
                    infoCol1.append('p')
                        .classed('selectedText infoRow',true)
                        .html('Type:')
                        .append('span')
                        .classed('infoContent',true)
                        .html(d => d.data.concept.standard_concept ? "Standard" : "Non standard")
                    const infoCol2 = infoContainer.append('div')
                        .classed('info-col',true)
                        .attr('id', d => 'info-col2-'+d.name)
                        .style('margin-left', '20px')
                    infoCol2.append('p')
                        .classed('selectedText infoRow',true)
                        .html('Domain:')
                        .append('span')
                        .classed('infoContent',true)
                        .html(d => d.data.concept.domain_id)
                    infoCol2.append('p')
                        .classed('selectedText infoRow',true)
                        .html('Class:')
                        .append('span')
                        .classed('infoContent',true)
                        .html(d => d.data.concept.concept_class_id)

                    const dataSection = titleSection.append('div')
                        .style('display', d => d.levels === '-1' ? 'none' : 'flex')
                        .style('align-items','center')
                        .style('justify-content','flex-start')
                        .style('width','flex-grow',1)
                    const countsSection = dataSection.append('div')
                        .style('display','flex')
                        .style('flex-direction','column')
                        .style('height','100%')
                        .style('justify-content','space-between')

                    const countsRC = countsSection.append('div')
                        .classed('list-counts',true)
                    countsRC.append('p')
                        .classed('counts-RC-p list-counts-p num',true)
                        .style('color', d => conceptNames.includes(d.name) && !d.leaf ? '#36126d' : '#808080')
                        .style('font-weight', d => conceptNames.includes(d.name) && !d.leaf ? 500 : 400)
                        .html(d => formatThousands(d.total_counts))
                    countsRC.append('p')
                        .classed('counts-RC-label list-counts-label',true)
                        .style('color', d => conceptNames.includes(d.name) && !d.leaf ? '#36126d' : '#808080')
                        .style('font-weight', d => conceptNames.includes(d.name) && !d.leaf ? 500 : 400)
                        .html('RC')
                    const countsBarRC = countsRC.append('div')
                        .classed('list-counts-bar-container',true)
                    countsBarRC.append('div')
                        .classed('counts-RC-bar list-counts-bar',true)
                        .style('width', d => scaleWidth(d.total_counts) + 'px')
                        .style('background-color', d => conceptNames.includes(d.name) && !d.leaf ? d.color : '#e0e0e0')
                    
                    const countsDRC = countsSection.append('div')
                        .classed('list-counts',true)
                    countsDRC.append('p')
                        .classed('counts-DRC-P list-counts-p num',true)
                        .style('text-align','left')
                        .style('color', d => conceptNames.includes(d.name) && d.leaf ? '#36126d' : '#808080')
                        .style('font-weight', d => conceptNames.includes(d.name) && d.leaf ? 500 : 400)
                        .html(d => formatThousands(d.descendant_counts))
                    countsDRC.append('p')
                        .classed('counts-DRC-label list-counts-label',true)
                        .style('color', d => conceptNames.includes(d.name) && d.leaf ? '#36126d' : '#808080')
                        .style('font-weight', d => conceptNames.includes(d.name) && d.leaf ? 500 : 400)
                        .html('DRC')
                    const countsBarDRC = countsDRC.append('div')
                        .classed('list-counts-bar-container',true)
                    countsBarDRC.append('div')
                        .classed('counts-DRC-bar list-counts-bar',true)
                        .style('width', d => scaleWidth(d.descendant_counts) + 'px')
                        .style('background-color', d => conceptNames.includes(d.name) && d.leaf ? d.color : '#e0e0e0')

                    const openMappings = dataSection.append('div')
                        .classed('list-open-mappings',true)
                        .style('display','flex')
                        .style('align-items','center')
                    openMappings.append('p')
                        .classed('selectedText marginRight',true)
                        .html(d => '(' + d.mappings.length + ')')  
                        .style('opacity',d => d.mappings.length === 0 ? 0.3 : 1)
                    openMappings.append('i')
                        .classed('list-caret-down fa-solid fa-caret-down iconLg',true)
                        .attr('id', d => 'list-caret-down-'+d.name)
                        .style('display', d => d.mappings.length > 0 ? mapRoot.includes(d.name) || d.mappings.map(m => m.name).some(map => hovered.includes(map)) ? 'none' : 'block' : 'none')
                        .on('click',(e,d) => {
                            setMapRoot([...mapRoot,d.name])
                            d3.select('#mappings-container-'+d.name).classed('hide-after', false).transition(2000).style('opacity',1).style('max-height',d.mappings.length * 100 + 'px')
                            d3.select('#mappings-title-'+d.name).transition(2000).style('opacity',1).style('max-height','10px')
                            d3.selectAll(".map-list-item-"+d.name).transition(2000).style('max-height','100px').style('visibility','visible')
                            d3.select('#list-caret-down-'+d.name).style('display','none')
                            d3.select('#list-caret-up-'+d.name).style('display','block')
                        })
                    openMappings.append('i')
                        .classed('list-caret-up fa-solid fa-caret-up iconLg',true)
                        .attr('id', d => 'list-caret-up-'+d.name)
                        .style('opacity',1)
                        .style('display', d => mapRoot.includes(d.name) || d.mappings.map(m => m.name).some(map => hovered.includes(map)) ? 'block' : 'none')
                        .on('click',(e,d) => {
                            const newMap = mapRoot.filter(name => name !== d.name)
                            setMapRoot(newMap)
                            d3.select('#mappings-container-'+d.name).classed('hide-after', true).transition(2000).style('opacity',0).style('max-height','0px')
                            d3.select('#mappings-title-'+d.name).transition(2000).style('opacity',0).style('max-height','0px')
                            d3.selectAll(".map-list-item-"+d.name).transition(2000).style('max-height','0px').style('visibility','hidden')
                            d3.select('#list-caret-down-'+d.name).style('display','block')
                            d3.select('#list-caret-up-'+d.name).style('display','none')
                        })
                    const mappingsContainer = itemContainer.append('div')
                        .classed('mappings-container',true)
                        .classed('hide-after', d => mapRoot.includes(d.name) ? false : true)
                        .classed('fade-after', () => hovered.length > 0 ? true : false)
                        .attr('id', d => 'mappings-container-'+d.name)
                        .style('max-height', d => mapRoot.includes(d.name) || d.mappings.map(m => m.name).some(map => hovered.includes(map)) ? d.mappings.length * 100 + 'px' : '0px')
                        .style('opacity', d => mapRoot.includes(d.name) || d.mappings.map(m => m.name).some(map => hovered.includes(map)) ? 1 : 0)
                        .style('display', d => d.levels === '-1' || d.mappings.length === 0 ? 'none' : 'flex')
                        .style('border-left', () => hovered.length > 0 ? '1px dashed #36126d20' : '1px dashed #36126d80')
                    mappingsContainer.append('p')
                        .classed('mappings-title selectedText',true)
                        .attr('id', d => 'mappings-title-'+d.name)
                        .html(d => d.data.concept.standard_concept ? 'Mapped from' : 'Maps to')
                        .style('max-height', d => mapRoot.includes(d.name) || d.mappings.map(m => m.name).some(map => hovered.includes(map)) ? '10px' : '0px')
                        .style('opacity', d => mapRoot.includes(d.name) ? hovered.length > 0 ? 0.2 : 1 : 0)
                    // MAPPINGS
                    mappingsContainer.selectAll(".map-list-item-container").data(d => d.mappings, d => d.name)
                    .join(enter => {
                        const mapItemContainer = enter.append('div')
                            .classed('map-list-item-container',true)
                            .each(function(d) {this.classList.add(`map-list-item-${d.source.name}`)})
                            .style('max-height', d => mapRoot.includes(d.source.name) ? '100px' : '0px')
                            .style('visibility', d => mapRoot.includes(d.source.name) ? 'visible' : 'hidden')
                        const mapItem = mapItemContainer.append('div')
                            .classed('map-list-item',true)
                            .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                        const mapTitleSection = mapItem.append('div')
                            .classed('list-title-section',true)
                        const mapConceptCard = mapTitleSection.append('div')
                            .classed('map-list-card',true)
                            .attr('id', d => 'list-card-'+d.name+d.source.name)
                            .style('display','flex')
                            .style('flex-direction','column')
                            .style('box-shadow', d => conceptNames.includes(d.name) ? '0 0 0 1px rgba(0, 0, 0, 0.02),0 2px 10px rgba(0, 0, 0, 0.15)' : 'none')
                            .style('background-color', d => conceptNames.includes(d.name) ? 'white' : '#ebebeb')
                        const mapTitle = mapConceptCard.append('div')
                            .classed('list-item-title',true)
                        const mapTitle1 = mapTitle.append('div')
                            .style('display','flex')
                            .style('align-items','center')
                        mapTitle1.append('div')
                            .classed('map-list-title-circle',true)
                            .classed('list-circle-dash', d => d.total_counts === 0 ? true : false)
                            .classed('list-circle', d => d.total_counts === 0 ? false : true)
                            .classed('btn', d => conceptNames.includes(d.name) ? true : false)
                            .style('pointer-events', d => conceptNames.includes(d.name) ? 'all' : 'none')
                            .style('background', d => {
                                if (d.total_counts === 0) return "none"
                                if (conceptNames.includes(d.name)) {
                                    if (!d.data.concept.standard_concept) {return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, "+ d.color + " 0.5px," + d.color + " 2px)"} 
                                    else {return "none"}
                                }
                                else {
                                    if (!d.data.concept.standard_concept) return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, #d6d6d6 0.5px, #d6d6d6 2px)"    
                                    else {return "none"}

                                }  
                            })
                            .style("background-color", d => {
                                if (d.total_counts === 0) return "transparent"
                                if (conceptNames.includes(d.name)) {
                                    if (d.data.concept.standard_concept) {return d.color} 
                                    else {return "transparent"}
                                }
                                else return '#d6d6d6'
                            }) 
                            .style('border', d => d.total_counts === 0 ? '1px solid #b2b2b2' : conceptNames.includes(d.name) ? `1px solid ${d.color}` : '1px solid #d6d6d6')
                            .on('mouseover',(e,d) => setHovered([d.name]))
                            .on('mouseout', (e,d) => setHovered([]))
                        const mapTitleRight = mapTitle1.append('div')
                            .classed('map-list-title-right btn',true)
                            .style('display','flex')
                            .style('align-items','center')
                            .on('mouseover',(e,d) => {
                                d3.select('#list-icons-'+d.name).transition(1000).style('max-width','36px').style('opacity',1)
                            })
                            .on('mouseout', (e,d) => {
                                
                                if (!showConfirmation) d3.select('#list-icons-'+d.name).transition(1000).style('max-width','0px').style('opacity',0)
                            })
                        const mapIcons = mapTitleRight.append('div')
                            .classed('map-list-icons',true)
                            .attr('id',d => 'list-icons-'+d.name)
                            .style('display','flex')
                            .style('max-width', '0px')
                            .style('opacity', 0)
                        mapIcons.append('img')
                            .classed('map-list-eye icon marginRight eye',true)
                            .attr('id', d => 'list-eye-'+d.name)
                            .attr("src", d => conceptNames.includes(d.name) ? openedEye : closedEye)
                            .style('opacity', d => conceptNames.includes(d.name) ? 1 : 0.3)
                            .style('display', d => d.total_counts === 0 ? 'none' : 'inline-block')
                            .on('mouseover', (e, d) => {
                                if (!conceptNames.includes(d.name)) d3.select('#list-eye-'+d.name).transition().style('opacity',1)
                                const el = e.currentTarget
                                el.__hoverTimeout__ = setTimeout(() => {
                                    showActionLabel(
                                        conceptNames.includes(d.name) 
                                            ? 'Hide concept'
                                            : 'Show concept',
                                        'enter',
                                        e
                                    )
                                }, 1200)
                            })
                            .on('mouseout', (e,d) => {
                                if (!conceptNames.includes(d.name)) d3.select('#list-eye-'+d.name).transition().style('opacity',0.2)
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave',e)
                            })
                            .on('click',(e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave')
                                if (d.total_counts !== 0) {
                                    if (conceptNames.includes(d.name)) {
                                        // if (!nodes.find(n => n.name === d.source.name).mappings.map(m => m.name).filter(map => map !== d.name).some(map => conceptNames.includes(map))) {
                                        //     const newMap = mapRoot.filter(name => name !== d.source.name)
                                        //     setMapRoot(newMap)
                                        // }
                                        const newInclusions = inclusions.filter(e => e !== d.name)
                                        updateConcepts(newInclusions,nodes,[],[d])
                                    } else if (!conceptNames.includes(d.name)){
                                        // if (!mapRoot.includes(d.source.name)) setMapRoot([...mapRoot,d.source.name])
                                        const newInclusions = [...inclusions,d.name]
                                        updateConcepts(newInclusions,nodes,[d],[])
                                    }     
                                } 
                            })
                        mapIcons.append('i')
                            .classed('map-list-search fa fa-search iconLg marginRight',true)
                            .attr('id', d => 'list-search-'+d.name)
                            .style('transform','scaleX(-1)')
                            .on('mouseover', (e, d) => {
                                const el = e.currentTarget
                                el.__hoverTimeout__ = setTimeout(() => {
                                    showActionLabel('Select concept','enter',e)
                                }, 1200)
                            })
                            .on('mouseout', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave',e)
                            })
                            .on('click', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave')
                                showConfirmationPopup(d, 'enter', e)
                            })
                        const mapTitleP = mapTitleRight.append('p')
                            .classed('map-list-title-p btn',true)
                            .style('opacity', d => conceptNames.includes(d.name) ? 1 : 0.6)
                            .on('mouseover', (e, d) => {
                                const el = e.currentTarget
                                el.__hoverTimeout__ = setTimeout(() => {
                                    showActionLabel('Select concept','enter',e)
                                }, 1200)
                            })
                            .on('mouseout', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave',e)
                            })
                            .on('click', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave')
                                if (!sidebarRoot.name.includes(d.name)) showConfirmationPopup(d, 'enter', e)
                            })
                        mapTitleP.append('span')
                            .classed('title-name selectedText marginRight',true)
                            .html(d => d.data.concept.concept_name)
                        mapTitleP.append('span')
                            .classed('title-code marginRight num',true)
                            .style('font-weight',500)
                            .html(d => d.data.concept.concept_code ? d.data.concept.concept_code : d.data.concept.concept_id)
                        mapTitleP.append('span')
                            .classed('title-vocab marginRight',true)
                            .html(d => d.data.concept.vocabulary_id)   
                        mapTitle.append('i')
                            .classed('map-info-icon fa-solid fa-circle-info icon',true)  
                            .attr('id', d => 'info-icon-'+d.name+d.source.name)  
                            .style('opacity', 0.2)
                            .on('mouseover',(e,d) => d3.select('#info-icon-'+d.name+d.source.name).transition().style('opacity',1))
                            .on('mouseout', (e,d) => {if(d3.select('#info-container-'+d.name+d.source.name).style('height') !== '45px') d3.select('#info-icon-'+d.name+d.source.name).transition().style('opacity',0.2)})
                            .on('click', (e,d) => {
                                if (d3.select('#info-container-'+d.name+d.source.name).style('height') === '45px') {
                                    d3.select('#info-icon-'+d.name+d.source.name).transition().style('opacity',0.2)
                                    d3.select('#info-container-'+d.name+d.source.name).transition().style('opacity',0).style('height','0px').style('padding-top','0px').style('margin','0px 0px 0px 22px')
                                    d3.select('#list-card-'+d.name+d.source.name).transition().style('border-radius','20px')
                                } else {
                                    d3.select('#info-icon-'+d.name+d.source.name).transition().style('opacity',1)
                                    d3.select('#info-container-'+d.name+d.source.name).transition().style('opacity',1).style('height','45px').style('padding-top','4px').style('margin','4px 4px 4px 22px')
                                    d3.select('#list-card-'+d.name+d.source.name).transition().style('border-radius','12px')
                                }
                            })
                        const mapInfoContainer = mapConceptCard.append('div')
                            .classed('map-info-container',true)
                            .attr('id', d => 'info-container-'+d.name+d.source.name)
                            .style('border-top', d => conceptNames.includes(d.name) ? '1px solid color-mix(in srgb, #36126d, white 90%)' : '1px solid color-mix(in srgb, #36126d, white 78%)')
                        const mapInfoCol1 = mapInfoContainer.append('div')
                            .classed('info-col',true)
                        mapInfoCol1.append('p')
                            .classed('selectedText infoRow',true)
                            .html('Id:')
                            .append('span')
                            .classed('infoContent num',true)
                            .html(d => d.name)
                        mapInfoCol1.append('p')
                            .classed('selectedText infoRow',true)
                            .html('Code:')
                            .append('span')
                            .classed('infoContent num',true)
                            .html(d => d.data.concept.concept_code)
                        mapInfoCol1.append('p')
                            .classed('selectedText infoRow',true)
                            .html('Type:')
                            .append('span')
                            .classed('infoContent',true)
                            .html(d => d.data.concept.standard_concept ? "Standard" : "Non standard")
                        const mapInfoCol2 = mapInfoContainer.append('div')
                            .classed('info-col',true)
                            .attr('id', d => 'info-col2-'+d.name)
                            .style('margin-left', '20px')
                        mapInfoCol2.append('p')
                            .classed('selectedText infoRow',true)
                            .html('Domain:')
                            .append('span')
                            .classed('infoContent',true)
                            .html(d => d.data.concept.domain_id)
                        mapInfoCol2.append('p')
                            .classed('selectedText infoRow',true)
                            .html('Class:')
                            .append('span')
                            .classed('infoContent',true)
                            .html(d => d.data.concept.concept_class_id)

                        const mapDataSection = mapTitleSection.append('div')
                            .style('display','flex')
                            .style('align-items','center')
                            .style('justify-content','flex-start')
                            .style('width','flex-grow',1)
                        const mapCountsSection = mapDataSection.append('div')
                            .style('display','flex')
                            .style('flex-direction','column')
                            .style('height','100%')
                            .style('justify-content','space-between')

                        const mapCountsRC = mapCountsSection.append('div')
                            .classed('list-counts',true)
                        mapCountsRC.append('p')
                            .classed('map-counts-RC-p list-counts-p num',true)
                            .style('color', d => conceptNames.includes(d.name) ? '#36126d' : '#808080')
                            .style('font-weight', d => conceptNames.includes(d.name) ? 500 : 400)
                            .html(d => formatThousands(d.total_counts))
                        mapCountsRC.append('p')
                            .classed('map-counts-RC-label list-counts-label',true)
                            .style('color', d => conceptNames.includes(d.name) ? '#36126d' : '#808080')
                            .style('font-weight', d => conceptNames.includes(d.name) ? 500 : 400)
                            .html('RC')
                        const mapCountsBarRC = mapCountsRC.append('div')
                            .classed('list-counts-bar-container',true)
                        mapCountsBarRC.append('div')
                            .classed('map-counts-RC-bar list-counts-bar',true)
                            .style('width', d => scaleWidth(d.total_counts) + 'px')
                            .style('background-color', d => conceptNames.includes(d.name) ? d.color : '#e0e0e0')
                        
                        const mapCountsDRC = mapCountsSection.append('div')
                            .classed('list-counts',true)
                        mapCountsDRC.append('p')
                            .classed('map-counts-DRC-P list-counts-p num',true)
                            .style('text-align','left')
                            .style('color', d => conceptNames.includes(d.name) ? '#36126d' : '#808080')
                            .style('font-weight', d => conceptNames.includes(d.name) ? 500 : 400)
                            .html(d => formatThousands(d.descendant_counts))
                        mapCountsDRC.append('p')
                            .classed('map-counts-DRC-label list-counts-label',true)
                            .style('color', d => conceptNames.includes(d.name) ? '#36126d' : '#808080')
                            .style('font-weight', d => conceptNames.includes(d.name) ? 500 : 400)
                            .html('DRC')
                        const mapCountsBarDRC = mapCountsDRC.append('div')
                            .classed('list-counts-bar-container',true)
                        mapCountsBarDRC.append('div')
                            .classed('map-counts-DRC-bar list-counts-bar',true)
                            .style('width', d => scaleWidth(d.descendant_counts) + 'px')
                            .style('background-color', d => conceptNames.includes(d.name) ? d.color : '#e0e0e0')   
                        
                        mapDataSection.append('div')
                            .classed('list-open-mappings',true)
                    
                    },update => {
                        update
                            .transition()
                            .style('max-height', d => mapRoot.includes(d.source.name) || (nodes.find(n => n.name === d.source.name).mappings.map(m => m.name).some(map => conceptNames.includes(map))) ? '100px' : '0px')
                            .style('visibility', d => mapRoot.includes(d.source.name) || (nodes.find(n => n.name === d.source.name).mappings.map(m => m.name).some(map => conceptNames.includes(map))) ? 'visible' : 'hidden')
                        update.select('.map-list-item')
                            .transition()
                            .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                        update.select('.map-list-card')
                            .style('box-shadow', d => conceptNames.includes(d.name) ? '0 0 0 1px rgba(0, 0, 0, 0.02),0 2px 10px rgba(0, 0, 0, 0.15)' : 'none')
                            .style('background-color', d => d.levels === '-1' ? 'none' : conceptNames.includes(d.name) ? 'white' : '#ebebeb')
                        update.select('.map-list-title-circle')
                            .classed('list-circle-dash', d => d.total_counts === 0 ? true : false)
                            .classed('list-circle', d => d.total_counts === 0 ? false : true)
                            .classed('btn', d => conceptNames.includes(d.name) ? true : false)
                            .style('pointer-events', d => conceptNames.includes(d.name) ? 'all' : 'none')
                            .style('background', d => {
                                if (d.total_counts === 0) return "none"
                                if (conceptNames.includes(d.name)) {
                                    if (!d.data.concept.standard_concept) {return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, "+ d.color + " 0.5px," + d.color + " 2px)"} 
                                    else {return "none"}
                                }
                                else {
                                    if (!d.data.concept.standard_concept) return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, #d6d6d6 0.5px, #d6d6d6 2px)"  
                                    else {return "none"}

                                }      
                            })
                            .style("background-color", d => {
                                if (d.total_counts === 0) return "transparent"
                                if (conceptNames.includes(d.name)) {
                                    if (d.data.concept.standard_concept) {return d.color} 
                                    else {return "transparent"}
                                }
                                else return '#d6d6d6'
                            }) 
                            .style('border', d => d.total_counts === 0 ? '1px solid #b2b2b2' : conceptNames.includes(d.name) ? `1px solid ${d.color}` : '1px solid #d6d6d6')
                            .on('mouseover',(e,d) => setHovered([d.name]))
                            .on('mouseout', (e,d) => setHovered([]))
                        update.select('.map-list-title-right')
                            .on('mouseover',(e,d) => {
                                    d3.select('#list-icons-'+d.name).transition(1000).style('max-width','36px').style('opacity',1)
                            })
                            .on('mouseout', (e,d) => {
                                
                                if (!showConfirmation) d3.select('#list-icons-'+d.name).transition(1000).style('max-width','0px').style('opacity',0)
                            })
                        update.select('.map-list-eye')
                            .attr("src", d => conceptNames.includes(d.name) ? openedEye : closedEye)
                            .style('opacity', d => conceptNames.includes(d.name) ? 1 : 0.3)
                            .style('display', d => d.total_counts === 0 ? 'none' : 'inline-block')
                            .on('mouseover', (e, d) => {
                                if (!conceptNames.includes(d.name)) d3.select('#list-eye-'+d.name).transition().style('opacity',1)
                                const el = e.currentTarget
                                el.__hoverTimeout__ = setTimeout(() => {
                                    showActionLabel(
                                        conceptNames.includes(d.name) 
                                            ? 'Hide concept'
                                            : 'Show concept',
                                        'enter',
                                        e
                                    )
                                }, 1200)
                            })
                            .on('mouseout', (e,d) => {
                                if (!conceptNames.includes(d.name)) d3.select('#list-eye-'+d.name).transition().style('opacity',0.2)
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave',e)
                            })
                            .on('click',(e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave')
                                if (d.total_counts !== 0) {
                                    if (conceptNames.includes(d.name)) {
                                        // if (!nodes.find(n => n.name === d.source.name).mappings.map(m => m.name).filter(map => map !== d.name).some(map => conceptNames.includes(map))) {
                                        //     const newMap = mapRoot.filter(name => name !== d.source.name)
                                        //     setMapRoot(newMap)
                                        // }
                                        const newInclusions = inclusions.filter(e => e !== d.name)
                                        updateConcepts(newInclusions,nodes,[],[d])
                                    } else if (!conceptNames.includes(d.name)){
                                        // if (!mapRoot.includes(d.source.name)) setMapRoot([...mapRoot,d.source.name])
                                        const newInclusions = [...inclusions,d.name]
                                        updateConcepts(newInclusions,nodes,[d],[])
                                    }     
                                } 
                            })
                        update.select('.map-list-search')
                            .on('mouseover', (e, d) => {
                                const el = e.currentTarget
                                el.__hoverTimeout__ = setTimeout(() => {
                                    showActionLabel('Select concept','enter',e)
                                }, 1200)
                            })
                            .on('mouseout', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave',e)
                            })
                            .on('click', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave')
                                showConfirmationPopup(d, 'enter', e)
                            })
                        update.select('.map-list-title-p')
                            .on('mouseover', (e, d) => {
                                const el = e.currentTarget
                                el.__hoverTimeout__ = setTimeout(() => {
                                    showActionLabel('Select concept','enter',e)
                                }, 1200)
                            })
                            .on('mouseout', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave',e)
                            })
                            .on('click', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave')
                                if (!sidebarRoot.name.includes(d.name)) showConfirmationPopup(d, 'enter', e)
                            })
                            .transition()
                            .style('opacity', d => conceptNames.includes(d.name) ? 1 : 0.6)
                        update.select('.map-info-icon')
                            .on('mouseover',(e,d) => d3.select('#info-icon-'+d.name+d.source.name).transition().style('opacity',1))
                            .on('mouseout', (e,d) => {if(d3.select('#info-container-'+d.name+d.source.name).style('height') !== '45px') d3.select('#info-icon-'+d.name+d.source.name).transition().style('opacity',0.2)})
                            .on('click', (e,d) => {
                                if (d3.select('#info-container-'+d.name+d.source.name).style('height') === '45px') {
                                    d3.select('#info-icon-'+d.name+d.source.name).transition().style('opacity',0.2)
                                    d3.select('#info-container-'+d.name+d.source.name).transition().style('opacity',0).style('height','0px').style('padding-top','0px').style('margin','0px 0px 0px 22px')
                                    d3.select('#list-card-'+d.name+d.source.name).transition().style('border-radius','20px')
                                } else {
                                    d3.select('#info-icon-'+d.name+d.source.name).transition().style('opacity',1)
                                    d3.select('#info-container-'+d.name+d.source.name).transition().style('opacity',1).style('height','45px').style('padding-top','4px').style('margin','4px 4px 4px 22px')
                                    d3.select('#list-card-'+d.name+d.source.name).transition().style('border-radius','12px')
                                }
                            })
                        update.select('.map-info-container')
                            .style('border-top', d => conceptNames.includes(d.name) ? '1px solid color-mix(in srgb, #36126d, white 90%)' : '1px solid color-mix(in srgb, #36126d, white 78%)')
                        update.select('.map-counts-RC-p')
                            .style('color', d => conceptNames.includes(d.name) ? '#36126d' : '#808080')
                            .style('font-weight', d => conceptNames.includes(d.name) ? 500 : 400)
                            .html(d => formatThousands(d.total_counts))
                        update.select('.map-counts-RC-label')
                            .style('color', d => conceptNames.includes(d.name) ? '#36126d' : '#808080')
                            .style('font-weight', d => conceptNames.includes(d.name) ? 500 : 400)
                        update.select('.map-counts-RC-bar')
                            .transition()
                            .style('width', d => scaleWidth(d.total_counts) + 'px')
                            .style('background-color', d => conceptNames.includes(d.name) ? d.color : '#e0e0e0')
                        update.select('.map-counts-DRC-p')
                            .style('color', d => conceptNames.includes(d.name) ? '#36126d' : '#808080')
                            .style('font-weight', d => conceptNames.includes(d.name) ? 500 : 400)
                            .html(d => formatThousands(d.descendant_counts))
                        update.select('.map-counts-DRC-label')
                            .style('color', d => conceptNames.includes(d.name) ? '#36126d' : '#808080')
                            .style('font-weight', d => conceptNames.includes(d.name) ? 500 : 400)
                        update.select('.map-counts-DRC-bar')
                            .transition()
                            .style('width', d => scaleWidth(d.descendant_counts) + 'px')
                            .style('background-color', d => conceptNames.includes(d.name) ? d.color : '#e0e0e0')
                    })
                },update => {
                    update.select('.list-item')
                        .style('background-color', d => d.levels === '-1' ? '#f0f0f0' : 'white')
                        .transition()
                        .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                    update.select('.list-card')
                        .style('box-shadow', d => conceptNames.includes(d.name) || d.leaf ? '0 0 0 1px rgba(0, 0, 0, 0.02),0 2px 10px rgba(0, 0, 0, 0.15)' : 'none')
                        .style('background-color', d => d.levels === '-1' ? 'none' : conceptNames.includes(d.name) || d.leaf ? 'white' : '#ebebeb')
                    update.select('.list-title-circle')
                        .classed('list-circle-dash', d => d.total_counts === 0 && !d.leaf ? true : false)
                        .classed('list-circle', d => d.total_counts === 0 && !d.leaf ? false : true)
                        .classed('btn', d => conceptNames.includes(d.name) || d.leaf ? true : false)
                        .style("pointer-events", d => conceptNames.includes(d.name) || d.leaf ? 'all' : 'none')
                        .style('background', d => {
                            if (d.total_counts === 0 && !d.leaf) return "none"
                            if (conceptNames.includes(d.name) || d.leaf) {
                                if (!d.data.concept.standard_concept) {return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, "+ d.color + " 0.5px," + d.color + " 2px)"} 
                                else {return "none"}
                            }
                            else {
                                if (!d.data.concept.standard_concept) return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, #d6d6d6 0.5px, #d6d6d6 2px)"  
                                else {return "none"}

                            }      
                        })
                        .style("background-color", d => {
                            if (d.total_counts === 0 && !d.leaf) return "transparent"
                            if (conceptNames.includes(d.name) || d.leaf) {
                                if (d.data.concept.standard_concept) {return d.color} 
                                else {return "transparent"}
                            }
                            else return '#d6d6d6'
                        }) 
                        .style('border', d => d.total_counts === 0 && !d.leaf ? '1px solid #b2b2b2' : conceptNames.includes(d.name) || d.leaf ? `1px solid ${d.color}` : '1px solid #d6d6d6')
                        .on('mouseover',(e,d) => setHovered([d.name]))
                        .on('mouseout', (e,d) => setHovered([]))
                    update.select('.list-title-right')
                        .on('mouseover',(e,d) => {
                                d3.select('#list-icons-'+d.name).transition(1000).style('max-width','36px').style('opacity',1)
                        })
                        .on('mouseout', (e,d) => {
                            
                            if (!showConfirmation) d3.select('#list-icons-'+d.name).transition(1000).style('max-width','0px').style('opacity',0)
                        })
                    update.select('.list-eye')
                        .attr("src", d => conceptNames.includes(d.name) || d.leaf ? openedEye : closedEye)
                        .style('opacity', d => conceptNames.includes(d.name) || d.leaf ? 1 : 0.2)
                        .style('display', d => (d.total_counts === 0 && !d.leaf) || d.levels === '-1' ? 'none' : 'inline-block')
                        .on('mouseover', (e, d) => {
                            if (!conceptNames.includes(d.name) && !d.leaf) d3.select('#list-eye-'+d.name).transition().style('opacity',1)
                            const el = e.currentTarget
                            el.__hoverTimeout__ = setTimeout(() => {
                                showActionLabel(
                                    conceptNames.includes(d.name) || d.leaf
                                        ? 'Hide concept'
                                        : 'Show concept',
                                    'enter',
                                    e
                                )
                            }, 1200)
                        })
                        .on('mouseout', (e,d) => {
                            if (!conceptNames.includes(d.name) && !d.leaf) d3.select('#list-eye-'+d.name).transition().style('opacity',0.2)
                            clearTimeout(e.currentTarget.__hoverTimeout__)
                            showActionLabel('','leave',e)
                        })
                        .on('click',(e,d) => {
                            clearTimeout(e.currentTarget.__hoverTimeout__)
                            showActionLabel('','leave')
                            if (d.total_counts !== 0) {
                                if (conceptNames.includes(d.name)) {
                                    const newInclusions = inclusions.filter(e => e !== d.name)
                                    updateConcepts(newInclusions,nodes,[],[d])
                                } else if (!conceptNames.includes(d.name)){
                                    const newInclusions = [...inclusions,d.name]
                                    updateConcepts(newInclusions,nodes,[d],[])
                                }     
                            } 
                        })
                    update.select('.list-search')
                        .on('mouseover', (e, d) => {
                            const el = e.currentTarget
                            el.__hoverTimeout__ = setTimeout(() => {
                                showActionLabel('Select concept','enter',e)
                            }, 1200)
                        })
                        .on('mouseout', (e,d) => {
                            clearTimeout(e.currentTarget.__hoverTimeout__)
                            showActionLabel('','leave',e)
                        })
                        .on('click', (e,d) => {
                            clearTimeout(e.currentTarget.__hoverTimeout__)
                            showActionLabel('','leave')
                            showConfirmationPopup(d, 'enter', e)
                        })
                    update.select('.list-title-p')
                        .on('mouseover', (e, d) => {
                            const el = e.currentTarget
                            el.__hoverTimeout__ = setTimeout(() => {
                                showActionLabel('Select concept','enter',e)
                            }, 1200)
                        })
                        .on('mouseout', (e,d) => {
                            clearTimeout(e.currentTarget.__hoverTimeout__)
                            showActionLabel('','leave',e)
                        })
                        .on('click', (e,d) => {
                            clearTimeout(e.currentTarget.__hoverTimeout__)
                            showActionLabel('','leave')
                            if (!sidebarRoot.name.includes(d.name)) showConfirmationPopup(d, 'enter', e)
                        })
                        .transition()
                        .style('opacity', d => conceptNames.includes(d.name) || d.leaf ? 1 : 0.6)
                    update.select('.info-icon')
                        .style('display', d => d.levels === '-1' || !d.levels ? 'none' : 'block')
                        .on('mouseover',(e,d) => d3.select('#info-icon-'+d.name).transition().style('opacity',1))
                        .on('mouseout', (e,d) => {if(d3.select('#info-container-'+d.name).style('height') !== '45px') d3.select('#info-icon-'+d.name).transition().style('opacity',0.2)})
                        .on('click', (e,d) => {
                            if (d3.select('#info-container-'+d.name).style('height') === '45px') {
                                d3.select('#info-icon-'+d.name).transition().style('opacity',0.2)
                                d3.select('#info-container-'+d.name).transition().style('opacity',0).style('height','0px').style('padding-top','0px').style('margin','0px 0px 0px 22px')
                                d3.select('#list-card-'+d.name).transition().style('border-radius','20px')
                            } else {
                                d3.select('#info-icon-'+d.name).transition().style('opacity',1)
                                d3.select('#info-container-'+d.name).transition().style('opacity',1).style('height','45px').style('padding-top','4px').style('margin','4px 4px 4px 22px')
                                d3.select('#list-card-'+d.name).transition().style('border-radius','12px')
                            }
                        })
                    update.select('.info-container')
                        .style('border-top', d => conceptNames.includes(d.name) || d.leaf ? '1px solid color-mix(in srgb, #36126d, white 90%)' : '1px solid color-mix(in srgb, #36126d, white 78%)')
                    update.select('.counts-RC-p')
                        .style('color', d => conceptNames.includes(d.name) && !d.leaf ? '#36126d' : '#808080')
                        .style('font-weight', d => conceptNames.includes(d.name) && !d.leaf ? 500 : 400)
                        .html(d => formatThousands(d.total_counts))
                    update.select('.counts-RC-label')
                        .style('color', d => conceptNames.includes(d.name) && !d.leaf ? '#36126d' : '#808080')
                        .style('font-weight', d => conceptNames.includes(d.name) && !d.leaf ? 500 : 400)
                    update.select('.counts-RC-bar')
                        .transition()
                        .style('width', d => scaleWidth(d.total_counts) + 'px')
                        .style('background-color', d => conceptNames.includes(d.name) && !d.leaf ? d.color : '#e0e0e0')
                    update.select('.counts-DRC-p')
                        .style('color', d => conceptNames.includes(d.name) && d.leaf ? '#36126d' : '#808080')
                        .style('font-weight', d => conceptNames.includes(d.name) && d.leaf ? 500 : 400)
                        .html(d => formatThousands(d.descendant_counts))
                    update.select('.counts-DRC-label')
                        .style('color', d => conceptNames.includes(d.name) && d.leaf ? '#36126d' : '#808080')
                        .style('font-weight', d => conceptNames.includes(d.name) && d.leaf ? 500 : 400)
                    update.select('.counts-DRC-bar')
                        .transition()
                        .style('width', d => scaleWidth(d.descendant_counts) + 'px')
                        .style('background-color', d => conceptNames.includes(d.name) && d.leaf ? d.color : '#e0e0e0')
                    update.select('.list-caret-down')
                        .style('display', d => d.mappings.length > 0 ? mapRoot.includes(d.name) || d.mappings.map(m => m.name).some(map => hovered.includes(map)) ? 'none' : 'block' : 'none')
                        .on('click',(e,d) => {
                            setMapRoot([...mapRoot,d.name])
                            d3.select('#mappings-container-'+d.name).classed('hide-after', false).transition(2000).style('opacity',1).style('max-height',d.mappings.length * 100 + 'px')
                            d3.select('#mappings-title-'+d.name).transition(2000).style('opacity',1).style('max-height','10px')
                            d3.selectAll(".map-list-item-"+d.name).transition(2000).style('max-height','100px').style('visibility','visible')
                            d3.select('#list-caret-down-'+d.name).style('display','none')
                            d3.select('#list-caret-up-'+d.name).style('display','block')
                        })
                    update.select('.list-caret-up')
                        .style('display', d => mapRoot.includes(d.name) || d.mappings.map(m => m.name).some(map => hovered.includes(map)) ? 'block' : 'none')
                        .on('click',(e,d) => {
                            const newMap = mapRoot.filter(name => name !== d.name)
                            setMapRoot(newMap)
                            d3.select('#mappings-container-'+d.name).classed('hide-after', true).transition(2000).style('opacity',0).style('max-height','0px')
                            d3.select('#mappings-title-'+d.name).transition(2000).style('opacity',0).style('max-height','0px')
                            d3.selectAll(".map-list-item-"+d.name).transition(2000).style('max-height','0px').style('visibility','hidden')
                            d3.select('#list-caret-down-'+d.name).style('display','block')
                            d3.select('#list-caret-up-'+d.name).style('display','none')
                        })
                    update.select('.mappings-container')
                        .classed('hide-after', d => mapRoot.includes(d.name) ? false : true)
                        .classed('fade-after', () => hovered.length > 0 ? true : false)
                        .transition()
                        .style('max-height', d => mapRoot.includes(d.name) || d.mappings.map(m => m.name).some(map => hovered.includes(map)) ? d.mappings.length * 100 + 'px' : '0px')
                        .style('opacity', d => mapRoot.includes(d.name) || d.mappings.map(m => m.name).some(map => hovered.includes(map)) ? 1 : 0)
                        .style('border-left', () => hovered.length > 0 ? '1px dashed #36126d20' : '1px dashed #36126d80')
                    update.select('.mappings-title')
                        .transition()
                        .style('max-height', d => mapRoot.includes(d.name) || d.mappings.map(m => m.name).some(map => hovered.includes(map)) ? '10px' : '0px')
                        .style('opacity', d => mapRoot.includes(d.name) ? hovered.length > 0 ? 0.2 : 1 : 0)
                    // MAPPINGS
                    update.selectAll(".map-list-item-container").data(d => d.mappings, d => d.name)
                    .join(enter => {
                        const mapItemContainer = enter.append('div')
                            .classed('map-list-item-container',true)
                            .each(function(d) {this.classList.add(`map-list-item-${d.source.name}`)})
                            .style('max-height', d => mapRoot.includes(d.source.name) ? '100px' : '0px')
                            .style('visibility', d => mapRoot.includes(d.source.name) ? 'visible' : 'hidden')
                        const mapItem = mapItemContainer.append('div')
                            .classed('map-list-item',true)
                            .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                        const mapTitleSection = mapItem.append('div')
                            .classed('list-title-section',true)
                        const mapConceptCard = mapTitleSection.append('div')
                            .classed('map-list-card',true)
                            .attr('id', d => 'list-card-'+d.name+d.source.name)
                            .style('display','flex')
                            .style('flex-direction','column')
                            .style('box-shadow', d => conceptNames.includes(d.name) ? '0 0 0 1px rgba(0, 0, 0, 0.02),0 2px 10px rgba(0, 0, 0, 0.15)' : 'none')
                            .style('background-color', d => conceptNames.includes(d.name) ? 'white' : '#ebebeb')
                        const mapTitle = mapConceptCard.append('div')
                            .classed('list-item-title',true)
                        const mapTitle1 = mapTitle.append('div')
                            .style('display','flex')
                            .style('align-items','center')
                        mapTitle1.append('div')
                            .classed('map-list-title-circle',true)
                            .classed('list-circle-dash', d => d.total_counts === 0 ? true : false)
                            .classed('list-circle', d => d.total_counts === 0 ? false : true)
                            .classed('btn', d => conceptNames.includes(d.name) ? true : false)
                            .style('pointer-events', d => conceptNames.includes(d.name) ? 'all' : 'none')
                            .style('background', d => {
                                if (d.total_counts === 0) return "none"
                                if (conceptNames.includes(d.name)) {
                                    if (!d.data.concept.standard_concept) {return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, "+ d.color + " 0.5px," + d.color + " 2px)"} 
                                    else {return "none"}
                                }
                                else {
                                    if (!d.data.concept.standard_concept) return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, #d6d6d6 0.5px, #d6d6d6 2px)"    
                                    else {return "none"}

                                }  
                            })
                            .style("background-color", d => {
                                if (d.total_counts === 0) return "transparent"
                                if (conceptNames.includes(d.name)) {
                                    if (d.data.concept.standard_concept) {return d.color} 
                                    else {return "transparent"}
                                }
                                else return '#d6d6d6'
                            }) 
                            .style('border', d => d.total_counts === 0 ? '1px solid #b2b2b2' : conceptNames.includes(d.name) ? `1px solid ${d.color}` : '1px solid #d6d6d6')
                            .on('mouseover',(e,d) => setHovered([d.name]))
                            .on('mouseout', (e,d) => setHovered([]))
                        const mapTitleRight = mapTitle1.append('div')
                            .classed('map-list-title-right btn',true)
                            .style('display','flex')
                            .style('align-items','center')
                            .on('mouseover',(e,d) => {
                                d3.select('#list-icons-'+d.name).transition(1000).style('max-width','36px').style('opacity',1)
                            })
                            .on('mouseout', (e,d) => {
                                
                                if (!showConfirmation) d3.select('#list-icons-'+d.name).transition(1000).style('max-width','0px').style('opacity',0)
                            })
                        const mapIcons = mapTitleRight.append('div')
                            .classed('map-list-icons',true)
                            .attr('id',d => 'list-icons-'+d.name)
                            .style('display','flex')
                            .style('max-width', '0px')
                            .style('opacity', 0)
                        mapIcons.append('img')
                            .classed('map-list-eye icon marginRight eye',true)
                            .attr('id', d => 'list-eye-'+d.name)
                            .attr("src", d => conceptNames.includes(d.name) ? openedEye : closedEye)
                            .style('opacity', d => conceptNames.includes(d.name) ? 1 : 0.3)
                            .style('display', d => d.total_counts === 0 ? 'none' : 'inline-block')
                            .on('mouseover', (e, d) => {
                                if (!conceptNames.includes(d.name)) d3.select('#list-eye-'+d.name).transition().style('opacity',1)
                                const el = e.currentTarget
                                el.__hoverTimeout__ = setTimeout(() => {
                                    showActionLabel(
                                        conceptNames.includes(d.name) 
                                            ? 'Hide concept'
                                            : 'Show concept',
                                        'enter',
                                        e
                                    )
                                }, 1200)
                            })
                            .on('mouseout', (e,d) => {
                                if (!conceptNames.includes(d.name)) d3.select('#list-eye-'+d.name).transition().style('opacity',0.2)
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave',e)
                            })
                            .on('click',(e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave')
                                if (d.total_counts !== 0) {
                                    if (conceptNames.includes(d.name)) {
                                        // if (!nodes.find(n => n.name === d.source.name).mappings.map(m => m.name).filter(map => map !== d.name).some(map => conceptNames.includes(map))) {
                                        //     const newMap = mapRoot.filter(name => name !== d.source.name)
                                        //     setMapRoot(newMap)
                                        // }
                                        const newInclusions = inclusions.filter(e => e !== d.name)
                                        updateConcepts(newInclusions,nodes,[],[d])
                                    } else if (!conceptNames.includes(d.name)){
                                        // if (!mapRoot.includes(d.source.name)) setMapRoot([...mapRoot,d.source.name])
                                        const newInclusions = [...inclusions,d.name]
                                        updateConcepts(newInclusions,nodes,[d],[])
                                    }     
                                } 
                            })
                        mapIcons.append('i')
                            .classed('map-list-search fa fa-search iconLg marginRight',true)
                            .attr('id', d => 'list-search-'+d.name)
                            .style('transform','scaleX(-1)')
                            .on('mouseover', (e, d) => {
                                const el = e.currentTarget
                                el.__hoverTimeout__ = setTimeout(() => {
                                    showActionLabel('Select concept','enter',e)
                                }, 1200)
                            })
                            .on('mouseout', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave',e)
                            })
                            .on('click', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave')
                                showConfirmationPopup(d, 'enter', e)
                            })
                        const mapTitleP = mapTitleRight.append('p')
                            .classed('map-list-title-p btn',true)
                            .style('opacity', d => conceptNames.includes(d.name) ? 1 : 0.6)
                            .on('mouseover', (e, d) => {
                                const el = e.currentTarget
                                el.__hoverTimeout__ = setTimeout(() => {
                                    showActionLabel('Select concept','enter',e)
                                }, 1200)
                            })
                            .on('mouseout', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave',e)
                            })
                            .on('click', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave')
                                if (!sidebarRoot.name.includes(d.name)) showConfirmationPopup(d, 'enter', e)
                            })
                        mapTitleP.append('span')
                            .classed('title-name selectedText marginRight',true)
                            .html(d => d.data.concept.concept_name)
                        mapTitleP.append('span')
                            .classed('title-code marginRight num',true)
                            .style('font-weight',500)
                            .html(d => d.data.concept.concept_code ? d.data.concept.concept_code : d.data.concept.concept_id)
                        mapTitleP.append('span')
                            .classed('title-vocab marginRight',true)
                            .html(d => d.data.concept.vocabulary_id)   
                        mapTitle.append('i')
                            .classed('map-info-icon fa-solid fa-circle-info icon',true)  
                            .attr('id', d => 'info-icon-'+d.name+d.source.name)  
                            .style('opacity', 0.2)
                            .on('mouseover',(e,d) => d3.select('#info-icon-'+d.name+d.source.name).transition().style('opacity',1))
                            .on('mouseout', (e,d) => {if(d3.select('#info-container-'+d.name+d.source.name).style('height') !== '45px') d3.select('#info-icon-'+d.name+d.source.name).transition().style('opacity',0.2)})
                            .on('click', (e,d) => {
                                if (d3.select('#info-container-'+d.name+d.source.name).style('height') === '45px') {
                                    d3.select('#info-icon-'+d.name+d.source.name).transition().style('opacity',0.2)
                                    d3.select('#info-container-'+d.name+d.source.name).transition().style('opacity',0).style('height','0px').style('padding-top','0px').style('margin','0px 0px 0px 22px')
                                    d3.select('#list-card-'+d.name+d.source.name).transition().style('border-radius','20px')
                                } else {
                                    d3.select('#info-icon-'+d.name+d.source.name).transition().style('opacity',1)
                                    d3.select('#info-container-'+d.name+d.source.name).transition().style('opacity',1).style('height','45px').style('padding-top','4px').style('margin','4px 4px 4px 22px')
                                    d3.select('#list-card-'+d.name+d.source.name).transition().style('border-radius','12px')
                                }
                            })
                        const mapInfoContainer = mapConceptCard.append('div')
                            .classed('map-info-container',true)
                            .attr('id', d => 'info-container-'+d.name+d.source.name)
                            .style('border-top', d => conceptNames.includes(d.name) ? '1px solid color-mix(in srgb, #36126d, white 90%)' : '1px solid color-mix(in srgb, #36126d, white 78%)')
                        const mapInfoCol1 = mapInfoContainer.append('div')
                            .classed('info-col',true)
                        mapInfoCol1.append('p')
                            .classed('selectedText infoRow',true)
                            .html('Id:')
                            .append('span')
                            .classed('infoContent num',true)
                            .html(d => d.name)
                        mapInfoCol1.append('p')
                            .classed('selectedText infoRow',true)
                            .html('Code:')
                            .append('span')
                            .classed('infoContent num',true)
                            .html(d => d.data.concept.concept_code)
                        mapInfoCol1.append('p')
                            .classed('selectedText infoRow',true)
                            .html('Type:')
                            .append('span')
                            .classed('infoContent',true)
                            .html(d => d.data.concept.standard_concept ? "Standard" : "Non standard")
                        const mapInfoCol2 = mapInfoContainer.append('div')
                            .classed('info-col',true)
                            .attr('id', d => 'info-col2-'+d.name)
                            .style('margin-left', '20px')
                        mapInfoCol2.append('p')
                            .classed('selectedText infoRow',true)
                            .html('Domain:')
                            .append('span')
                            .classed('infoContent',true)
                            .html(d => d.data.concept.domain_id)
                        mapInfoCol2.append('p')
                            .classed('selectedText infoRow',true)
                            .html('Class:')
                            .append('span')
                            .classed('infoContent',true)
                            .html(d => d.data.concept.concept_class_id)

                        const mapDataSection = mapTitleSection.append('div')
                            .style('display','flex')
                            .style('align-items','center')
                            .style('justify-content','flex-start')
                            .style('width','flex-grow',1)
                        const mapCountsSection = mapDataSection.append('div')
                            .style('display','flex')
                            .style('flex-direction','column')
                            .style('height','100%')
                            .style('justify-content','space-between')

                        const mapCountsRC = mapCountsSection.append('div')
                            .classed('list-counts',true)
                        mapCountsRC.append('p')
                            .classed('map-counts-RC-p list-counts-p num',true)
                            .style('color', d => conceptNames.includes(d.name) ? '#36126d' : '#808080')
                            .style('font-weight', d => conceptNames.includes(d.name) ? 500 : 400)
                            .html(d => formatThousands(d.total_counts))
                        mapCountsRC.append('p')
                            .classed('map-counts-RC-label list-counts-label',true)
                            .style('color', d => conceptNames.includes(d.name) ? '#36126d' : '#808080')
                            .style('font-weight', d => conceptNames.includes(d.name) ? 500 : 400)
                            .html('RC')
                        const mapCountsBarRC = mapCountsRC.append('div')
                            .classed('list-counts-bar-container',true)
                        mapCountsBarRC.append('div')
                            .classed('map-counts-RC-bar list-counts-bar',true)
                            .style('width', d => scaleWidth(d.total_counts) + 'px')
                            .style('background-color', d => conceptNames.includes(d.name) ? d.color : '#e0e0e0')
                        
                        const mapCountsDRC = mapCountsSection.append('div')
                            .classed('list-counts',true)
                        mapCountsDRC.append('p')
                            .classed('map-counts-DRC-P list-counts-p num',true)
                            .style('text-align','left')
                            .style('color', d => conceptNames.includes(d.name) ? '#36126d' : '#808080')
                            .style('font-weight', d => conceptNames.includes(d.name) ? 500 : 400)
                            .html(d => formatThousands(d.descendant_counts))
                        mapCountsDRC.append('p')
                            .classed('map-counts-DRC-label list-counts-label',true)
                            .style('color', d => conceptNames.includes(d.name) ? '#36126d' : '#808080')
                            .style('font-weight', d => conceptNames.includes(d.name) ? 500 : 400)
                            .html('DRC')
                        const mapCountsBarDRC = mapCountsDRC.append('div')
                            .classed('list-counts-bar-container',true)
                        mapCountsBarDRC.append('div')
                            .classed('map-counts-DRC-bar list-counts-bar',true)
                            .style('width', d => scaleWidth(d.descendant_counts) + 'px')
                            .style('background-color', d => conceptNames.includes(d.name) ? d.color : '#e0e0e0')   
                        
                        mapDataSection.append('div')
                            .classed('list-open-mappings',true)
                    
                    },update => {
                        update
                            .transition()
                            .style('max-height', d => mapRoot.includes(d.source.name) || (nodes.find(n => n.name === d.source.name).mappings.map(m => m.name).some(map => conceptNames.includes(map))) ? '100px' : '0px')
                            .style('visibility', d => mapRoot.includes(d.source.name) || (nodes.find(n => n.name === d.source.name).mappings.map(m => m.name).some(map => conceptNames.includes(map))) ? 'visible' : 'hidden')
                        update.select('.map-list-item')
                            .transition()
                            .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                        update.select('.map-list-card')
                            .style('box-shadow', d => conceptNames.includes(d.name) ? '0 0 0 1px rgba(0, 0, 0, 0.02),0 2px 10px rgba(0, 0, 0, 0.15)' : 'none')
                            .style('background-color', d => d.levels === '-1' ? 'none' : conceptNames.includes(d.name) ? 'white' : '#ebebeb')
                        update.select('.map-list-title-circle')
                            .classed('list-circle-dash', d => d.total_counts === 0 ? true : false)
                            .classed('list-circle', d => d.total_counts === 0 ? false : true)
                            .classed('btn', d => conceptNames.includes(d.name) ? true : false)
                            .style('pointer-events', d => conceptNames.includes(d.name) ? 'all' : 'none')
                            .style('background', d => {
                                if (d.total_counts === 0) return "none"
                                if (conceptNames.includes(d.name)) {
                                    if (!d.data.concept.standard_concept) {return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, "+ d.color + " 0.5px," + d.color + " 2px)"} 
                                    else {return "none"}
                                }
                                else {
                                    if (!d.data.concept.standard_concept) return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, #d6d6d6 0.5px, #d6d6d6 2px)"  
                                    else {return "none"}

                                }      
                            })
                            .style("background-color", d => {
                                if (d.total_counts === 0) return "transparent"
                                if (conceptNames.includes(d.name)) {
                                    if (d.data.concept.standard_concept) {return d.color} 
                                    else {return "transparent"}
                                }
                                else return '#d6d6d6'
                            }) 
                            .style('border', d => d.total_counts === 0 ? '1px solid #b2b2b2' : conceptNames.includes(d.name) ? `1px solid ${d.color}` : '1px solid #d6d6d6')
                            .on('mouseover',(e,d) => setHovered([d.name]))
                            .on('mouseout', (e,d) => setHovered([]))
                        update.select('.map-list-title-right')
                            .on('mouseover',(e,d) => {
                                    d3.select('#list-icons-'+d.name).transition(1000).style('max-width','36px').style('opacity',1)
                            })
                            .on('mouseout', (e,d) => {
                                
                                if (!showConfirmation) d3.select('#list-icons-'+d.name).transition(1000).style('max-width','0px').style('opacity',0)
                            })
                        update.select('.map-list-eye')
                            .attr("src", d => conceptNames.includes(d.name) ? openedEye : closedEye)
                            .style('opacity', d => conceptNames.includes(d.name) ? 1 : 0.3)
                            .style('display', d => d.total_counts === 0 ? 'none' : 'inline-block')
                            .on('mouseover', (e, d) => {
                                if (!conceptNames.includes(d.name)) d3.select('#list-eye-'+d.name).transition().style('opacity',1)
                                const el = e.currentTarget
                                el.__hoverTimeout__ = setTimeout(() => {
                                    showActionLabel(
                                        conceptNames.includes(d.name) 
                                            ? 'Hide concept'
                                            : 'Show concept',
                                        'enter',
                                        e
                                    )
                                }, 1200)
                            })
                            .on('mouseout', (e,d) => {
                                if (!conceptNames.includes(d.name)) d3.select('#list-eye-'+d.name).transition().style('opacity',0.2)
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave',e)
                            })
                            .on('click',(e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave')
                                if (d.total_counts !== 0) {
                                    if (conceptNames.includes(d.name)) {
                                        // if (!nodes.find(n => n.name === d.source.name).mappings.map(m => m.name).filter(map => map !== d.name).some(map => conceptNames.includes(map))) {
                                        //     const newMap = mapRoot.filter(name => name !== d.source.name)
                                        //     setMapRoot(newMap)
                                        // }
                                        const newInclusions = inclusions.filter(e => e !== d.name)
                                        updateConcepts(newInclusions,nodes,[],[d])
                                    } else if (!conceptNames.includes(d.name)){
                                        // if (!mapRoot.includes(d.source.name)) setMapRoot([...mapRoot,d.source.name])
                                        const newInclusions = [...inclusions,d.name]
                                        updateConcepts(newInclusions,nodes,[d],[])
                                    }     
                                } 
                            })
                        update.select('.map-list-search')
                            .on('mouseover', (e, d) => {
                                const el = e.currentTarget
                                el.__hoverTimeout__ = setTimeout(() => {
                                    showActionLabel('Select concept','enter',e)
                                }, 1200)
                            })
                            .on('mouseout', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave',e)
                            })
                            .on('click', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave')
                                showConfirmationPopup(d, 'enter', e)
                            })
                        update.select('.map-list-title-p')
                            .on('mouseover', (e, d) => {
                                const el = e.currentTarget
                                el.__hoverTimeout__ = setTimeout(() => {
                                    showActionLabel('Select concept','enter',e)
                                }, 1200)
                            })
                            .on('mouseout', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave',e)
                            })
                            .on('click', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave')
                                if (!sidebarRoot.name.includes(d.name)) showConfirmationPopup(d, 'enter', e)
                            })
                            .transition()
                            .style('opacity', d => conceptNames.includes(d.name) ? 1 : 0.6)
                        update.select('.map-info-icon')
                            .on('mouseover',(e,d) => d3.select('#info-icon-'+d.name+d.source.name).transition().style('opacity',1))
                            .on('mouseout', (e,d) => {if(d3.select('#info-container-'+d.name+d.source.name).style('height') !== '45px') d3.select('#info-icon-'+d.name+d.source.name).transition().style('opacity',0.2)})
                            .on('click', (e,d) => {
                                if (d3.select('#info-container-'+d.name+d.source.name).style('height') === '45px') {
                                    d3.select('#info-icon-'+d.name+d.source.name).transition().style('opacity',0.2)
                                    d3.select('#info-container-'+d.name+d.source.name).transition().style('opacity',0).style('height','0px').style('padding-top','0px').style('margin','0px 0px 0px 22px')
                                    d3.select('#list-card-'+d.name+d.source.name).transition().style('border-radius','20px')
                                } else {
                                    d3.select('#info-icon-'+d.name+d.source.name).transition().style('opacity',1)
                                    d3.select('#info-container-'+d.name+d.source.name).transition().style('opacity',1).style('height','45px').style('padding-top','4px').style('margin','4px 4px 4px 22px')
                                    d3.select('#list-card-'+d.name+d.source.name).transition().style('border-radius','12px')
                                }
                            })
                        update.select('.map-info-container')
                            .style('border-top', d => conceptNames.includes(d.name) ? '1px solid color-mix(in srgb, #36126d, white 90%)' : '1px solid color-mix(in srgb, #36126d, white 78%)')
                        update.select('.map-counts-RC-p')
                            .style('color', d => conceptNames.includes(d.name) ? '#36126d' : '#808080')
                            .style('font-weight', d => conceptNames.includes(d.name) ? 500 : 400)
                            .html(d => formatThousands(d.total_counts))
                        update.select('.map-counts-RC-label')
                            .style('color', d => conceptNames.includes(d.name) ? '#36126d' : '#808080')
                            .style('font-weight', d => conceptNames.includes(d.name) ? 500 : 400)
                        update.select('.map-counts-RC-bar')
                            .transition()
                            .style('width', d => scaleWidth(d.total_counts) + 'px')
                            .style('background-color', d => conceptNames.includes(d.name) ? d.color : '#e0e0e0')
                        update.select('.map-counts-DRC-p')
                            .style('color', d => conceptNames.includes(d.name) ? '#36126d' : '#808080')
                            .style('font-weight', d => conceptNames.includes(d.name) ? 500 : 400)
                            .html(d => formatThousands(d.descendant_counts))
                        update.select('.map-counts-DRC-label')
                            .style('color', d => conceptNames.includes(d.name) ? '#36126d' : '#808080')
                            .style('font-weight', d => conceptNames.includes(d.name) ? 500 : 400)
                        update.select('.map-counts-DRC-bar')
                            .transition()
                            .style('width', d => scaleWidth(d.descendant_counts) + 'px')
                            .style('background-color', d => conceptNames.includes(d.name) ? d.color : '#e0e0e0')
                    })
                })
            },update => {
                // CONCEPT LIST
                update.selectAll(".list-item-container").data(d => d.nodes, d => d.name)
                .join(enter => {
                    const itemContainer = enter.append('div')
                        .classed('list-item-container',true)
                        .style('border-bottom', d => d.levels === '-1' ? '0.5px solid #d6d6d6' : '0.5px solid #e0e0e0')
                    const item = itemContainer.append('div')
                        .classed('list-item',true)
                        .attr('id', d => 'list-item-'+d.name)
                        .style('background-color', d => d.levels === '-1' ? '#f0f0f0' : 'white')
                        .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                    const titleSection = item.append('div')
                        .classed('list-title-section',true)
                    const conceptCard = titleSection.append('div')
                        .classed('list-card',true)
                        .attr('id', d => 'list-card-'+d.name)
                        .style('display','flex')
                        .style('flex-direction','column')
                        .style('box-shadow', d => conceptNames.includes(d.name) || d.leaf ? '0 0 0 1px rgba(0, 0, 0, 0.02),0 2px 10px rgba(0, 0, 0, 0.15)' : 'none')
                        .style('background-color', d => d.levels === '-1' ? 'none' : conceptNames.includes(d.name) || d.leaf ? 'white' : '#ebebeb')
                        .style('border', d => sidebarRoot.name.includes(d.name) ? '1px solid #6a23d6' : 'none')
                    const title = conceptCard.append('div')
                        .classed('list-item-title',true)
                    const title1 = title.append('div')
                        .style('display','flex')
                        .style('align-items','center')
                    title1.append('div')
                        .classed('list-title-circle',true)
                        .classed('list-circle-dash', d => d.total_counts === 0 && !d.leaf ? true : false)
                        .classed('list-circle', d => d.total_counts === 0 && !d.leaf ? false : true)
                        .classed('btn', d => conceptNames.includes(d.name) || d.leaf ? true : false)
                        .style("pointer-events", d => conceptNames.includes(d.name) || d.leaf ? 'all' : 'none')
                        .style('background', d => {
                            if (d.total_counts === 0 && !d.leaf) return "none"
                            if (conceptNames.includes(d.name) || d.leaf) {
                                if (!d.data.concept.standard_concept) {return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, "+ d.color + " 0.5px," + d.color + " 2px)"} 
                                else {return "none"}
                            }
                            else {
                                if (!d.data.concept.standard_concept) return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, #d6d6d6 0.5px, #d6d6d6 2px)"  
                                else {return "none"}

                            }      
                        })
                        .style("background-color", d => {
                            if (d.total_counts === 0 && !d.leaf) return "transparent"
                            if (conceptNames.includes(d.name) || d.leaf) {
                                if (d.data.concept.standard_concept) {return d.color} 
                                else {return "transparent"}
                            }
                            else return '#d6d6d6'
                        }) 
                        .style('border', d => d.total_counts === 0 && !d.leaf ? '1px solid #b2b2b2' : conceptNames.includes(d.name) || d.leaf ? `1px solid ${d.color}` : '1px solid #d6d6d6')
                        .style('display',d => d.levels === '-1' ? 'none' : 'block')
                        .on('mouseover',(e,d) => setHovered([d.name]))
                        .on('mouseout', (e,d) => setHovered([]))
                    const titleRight = title1.append('div')
                        .classed('list-title-right btn',true)
                        .style('display','flex')
                        .style('align-items','center')
                        .on('mouseover',(e,d) => {
                            d3.select('#list-icons-'+d.name).transition(1000).style('max-width','36px').style('opacity',1)
                        })
                        .on('mouseout', (e,d) => {
                            if (!showConfirmation) d3.select('#list-icons-'+d.name).transition(1000).style('max-width','0px').style('opacity',0)
                        })
                    const icons = titleRight.append('div')
                        .classed('list-icons',true)
                        .attr('id',d => 'list-icons-'+d.name)
                        .style('display','flex')
                        .style('max-width', '0px')
                        .style('opacity', 0)
                    icons.append('img')
                        .classed('list-eye icon marginRight eye',true)
                        .attr('id', d => 'list-eye-'+d.name)
                        .attr("src", d => conceptNames.includes(d.name) || d.leaf ? openedEye : closedEye)
                        .style('opacity', d => conceptNames.includes(d.name) || d.leaf ? 1 : 0.2)
                        .style('display', d => (d.total_counts === 0 && !d.leaf) || d.levels === '-1' ? 'none' : 'inline-block')
                        .on('mouseover', (e, d) => {
                            if (!conceptNames.includes(d.name) && !d.leaf) d3.select('#list-eye-'+d.name).transition().style('opacity',1)
                            const el = e.currentTarget
                            el.__hoverTimeout__ = setTimeout(() => {
                                showActionLabel(
                                    conceptNames.includes(d.name) || d.leaf
                                        ? 'Hide concept'
                                        : 'Show concept',
                                    'enter',
                                    e
                                )
                            }, 1200)
                        })
                        .on('mouseout', (e,d) => {
                            if (!conceptNames.includes(d.name) && !d.leaf) d3.select('#list-eye-'+d.name).transition().style('opacity',0.2)
                            clearTimeout(e.currentTarget.__hoverTimeout__)
                            showActionLabel('','leave',e)
                        })
                        .on('click',(e,d) => {
                            clearTimeout(e.currentTarget.__hoverTimeout__)
                            showActionLabel('','leave')
                            if (d.total_counts !== 0) {
                                if (conceptNames.includes(d.name)) {
                                    const newInclusions = inclusions.filter(e => e !== d.name)
                                    updateConcepts(newInclusions,nodes,[],[d])
                                } else if (!conceptNames.includes(d.name)){
                                    const newInclusions = [...inclusions,d.name]
                                    updateConcepts(newInclusions,nodes,[d],[])
                                }     
                            } 
                        })
                    icons.append('i')
                        .classed('list-search fa fa-search iconLg marginRight',true)
                        .attr('id', d => 'list-search-'+d.name)
                        .style('transform','scaleX(-1)')
                        .style('display', d => sidebarRoot.name.includes(d.name) ? 'none' : 'inline-block')
                        .on('mouseover', (e, d) => {
                            const el = e.currentTarget
                            el.__hoverTimeout__ = setTimeout(() => {
                                showActionLabel('Select concept','enter',e)
                            }, 1200)
                        })
                        .on('mouseout', (e,d) => {
                            clearTimeout(e.currentTarget.__hoverTimeout__)
                            showActionLabel('','leave',e)
                        })
                        .on('click', (e,d) => {
                            clearTimeout(e.currentTarget.__hoverTimeout__)
                            showActionLabel('','leave')
                            showConfirmationPopup(d, 'enter', e)
                        })
                    const titleP = titleRight.append('p')
                        .classed('list-title-p btn',true)
                        .style('opacity', d => conceptNames.includes(d.name) || d.leaf ? 1 : 0.6)
                        .on('mouseover', (e, d) => {
                            const el = e.currentTarget
                            el.__hoverTimeout__ = setTimeout(() => {
                                showActionLabel('Select concept','enter',e)
                            }, 1200)
                        })
                        .on('mouseout', (e,d) => {
                            clearTimeout(e.currentTarget.__hoverTimeout__)
                            showActionLabel('','leave',e)
                        })
                        .on('click', (e,d) => {
                            clearTimeout(e.currentTarget.__hoverTimeout__)
                            showActionLabel('','leave')
                            if (!sidebarRoot.name.includes(d.name)) showConfirmationPopup(d, 'enter', e)
                        })
                    titleP.append('span')
                        .classed('title-name selectedText marginRight',true)
                        .html(d => d.data.concept.concept_name)
                    titleP.append('span')
                        .classed('title-code marginRight num',true)
                        .style('font-weight',500)
                        .html(d => d.data.concept.concept_code ? d.data.concept.concept_code : d.data.concept.concept_id)
                    titleP.append('span')
                        .classed('title-vocab marginRight',true)
                        .html(d => d.data.concept.vocabulary_id)   
                    title.append('i')
                        .classed('info-icon fa-solid fa-circle-info icon',true)  
                        .attr('id', d => 'info-icon-'+d.name)  
                        .style('opacity', 0.2)
                        .style('display', d => d.levels === '-1' || !d.levels ? 'none' : 'block')
                        .on('mouseover',(e,d) => d3.select('#info-icon-'+d.name).transition().style('opacity',1))
                        .on('mouseout', (e,d) => {if(d3.select('#info-container-'+d.name).style('height') !== '45px') d3.select('#info-icon-'+d.name).transition().style('opacity',0.2)})
                        .on('click', (e,d) => {
                            if (d3.select('#info-container-'+d.name).style('height') === '45px') {
                                d3.select('#info-icon-'+d.name).transition().style('opacity',0.2)
                                d3.select('#info-container-'+d.name).transition().style('opacity',0).style('height','0px').style('padding-top','0px').style('margin','0px 0px 0px 22px')
                                d3.select('#list-card-'+d.name).transition().style('border-radius','20px')
                            } else {
                                d3.select('#info-icon-'+d.name).transition().style('opacity',1)
                                d3.select('#info-container-'+d.name).transition().style('opacity',1).style('height','45px').style('padding-top','4px').style('margin','4px 4px 4px 22px')
                                d3.select('#list-card-'+d.name).transition().style('border-radius','12px')
                            }
                        })
                    const infoContainer = conceptCard.append('div')
                        .classed('info-container',true)
                        .attr('id', d => 'info-container-'+d.name)
                        .style('display', d => d.levels === '-1' || !d.levels ? 'none' : 'flex')
                        .style('border-top', d => conceptNames.includes(d.name) || d.leaf ? '1px solid color-mix(in srgb, #36126d, white 90%)' : '1px solid color-mix(in srgb, #36126d, white 78%)')
                    const infoCol1 = infoContainer.append('div')
                        .classed('info-col',true)
                    infoCol1.append('p')
                        .classed('selectedText infoRow',true)
                        .html('Id:')
                        .append('span')
                        .classed('infoContent num',true)
                        .html(d => d.name)
                    infoCol1.append('p')
                        .classed('selectedText infoRow',true)
                        .html('Code:')
                        .append('span')
                        .classed('infoContent num',true)
                        .html(d => d.data.concept.concept_code)
                    infoCol1.append('p')
                        .classed('selectedText infoRow',true)
                        .html('Type:')
                        .append('span')
                        .classed('infoContent',true)
                        .html(d => d.data.concept.standard_concept ? "Standard" : "Non standard")
                    const infoCol2 = infoContainer.append('div')
                        .classed('info-col',true)
                        .attr('id', d => 'info-col2-'+d.name)
                        .style('margin-left', '20px')
                    infoCol2.append('p')
                        .classed('selectedText infoRow',true)
                        .html('Domain:')
                        .append('span')
                        .classed('infoContent',true)
                        .html(d => d.data.concept.domain_id)
                    infoCol2.append('p')
                        .classed('selectedText infoRow',true)
                        .html('Class:')
                        .append('span')
                        .classed('infoContent',true)
                        .html(d => d.data.concept.concept_class_id)

                    const dataSection = titleSection.append('div')
                        .style('display', d => d.levels === '-1' ? 'none' : 'flex')
                        .style('align-items','center')
                        .style('justify-content','flex-start')
                        .style('width','flex-grow',1)
                    const countsSection = dataSection.append('div')
                        .style('display','flex')
                        .style('flex-direction','column')
                        .style('height','100%')
                        .style('justify-content','space-between')

                    const countsRC = countsSection.append('div')
                        .classed('list-counts',true)
                    countsRC.append('p')
                        .classed('counts-RC-p list-counts-p num',true)
                        .style('color', d => conceptNames.includes(d.name) && !d.leaf ? '#36126d' : '#808080')
                        .style('font-weight', d => conceptNames.includes(d.name) && !d.leaf ? 500 : 400)
                        .html(d => formatThousands(d.total_counts))
                    countsRC.append('p')
                        .classed('counts-RC-label list-counts-label',true)
                        .style('color', d => conceptNames.includes(d.name) && !d.leaf ? '#36126d' : '#808080')
                        .style('font-weight', d => conceptNames.includes(d.name) && !d.leaf ? 500 : 400)
                        .html('RC')
                    const countsBarRC = countsRC.append('div')
                        .classed('list-counts-bar-container',true)
                    countsBarRC.append('div')
                        .classed('counts-RC-bar list-counts-bar',true)
                        .style('width', d => scaleWidth(d.total_counts) + 'px')
                        .style('background-color', d => conceptNames.includes(d.name) && !d.leaf ? d.color : '#e0e0e0')
                    
                    const countsDRC = countsSection.append('div')
                        .classed('list-counts',true)
                    countsDRC.append('p')
                        .classed('counts-DRC-P list-counts-p num',true)
                        .style('text-align','left')
                        .style('color', d => conceptNames.includes(d.name) && d.leaf ? '#36126d' : '#808080')
                        .style('font-weight', d => conceptNames.includes(d.name) && d.leaf ? 500 : 400)
                        .html(d => formatThousands(d.descendant_counts))
                    countsDRC.append('p')
                        .classed('counts-DRC-label list-counts-label',true)
                        .style('color', d => conceptNames.includes(d.name) && d.leaf ? '#36126d' : '#808080')
                        .style('font-weight', d => conceptNames.includes(d.name) && d.leaf ? 500 : 400)
                        .html('DRC')
                    const countsBarDRC = countsDRC.append('div')
                        .classed('list-counts-bar-container',true)
                    countsBarDRC.append('div')
                        .classed('counts-DRC-bar list-counts-bar',true)
                        .style('width', d => scaleWidth(d.descendant_counts) + 'px')
                        .style('background-color', d => conceptNames.includes(d.name) && d.leaf ? d.color : '#e0e0e0')

                    const openMappings = dataSection.append('div')
                        .classed('list-open-mappings',true)
                        .style('display','flex')
                        .style('align-items','center')
                    openMappings.append('p')
                        .classed('selectedText marginRight',true)
                        .html(d => '(' + d.mappings.length + ')')  
                        .style('opacity',d => d.mappings.length === 0 ? 0.3 : 1)
                    openMappings.append('i')
                        .classed('list-caret-down fa-solid fa-caret-down iconLg',true)
                        .attr('id', d => 'list-caret-down-'+d.name)
                        .style('display', d => d.mappings.length > 0 ? mapRoot.includes(d.name) || d.mappings.map(m => m.name).some(map => hovered.includes(map)) ? 'none' : 'block' : 'none')
                        .on('click',(e,d) => {
                            setMapRoot([...mapRoot,d.name])
                            d3.select('#mappings-container-'+d.name).classed('hide-after', false).transition(2000).style('opacity',1).style('max-height',d.mappings.length * 100 + 'px')
                            d3.select('#mappings-title-'+d.name).transition(2000).style('opacity',1).style('max-height','10px')
                            d3.selectAll(".map-list-item-"+d.name).transition(2000).style('max-height','100px').style('visibility','visible')
                            d3.select('#list-caret-down-'+d.name).style('display','none')
                            d3.select('#list-caret-up-'+d.name).style('display','block')
                        })
                    openMappings.append('i')
                        .classed('list-caret-up fa-solid fa-caret-up iconLg',true)
                        .attr('id', d => 'list-caret-up-'+d.name)
                        .style('opacity',1)
                        .style('display', d => mapRoot.includes(d.name) || d.mappings.map(m => m.name).some(map => hovered.includes(map)) ? 'block' : 'none')
                        .on('click',(e,d) => {
                            const newMap = mapRoot.filter(name => name !== d.name)
                            setMapRoot(newMap)
                            d3.select('#mappings-container-'+d.name).classed('hide-after', true).transition(2000).style('opacity',0).style('max-height','0px')
                            d3.select('#mappings-title-'+d.name).transition(2000).style('opacity',0).style('max-height','0px')
                            d3.selectAll(".map-list-item-"+d.name).transition(2000).style('max-height','0px').style('visibility','hidden')
                            d3.select('#list-caret-down-'+d.name).style('display','block')
                            d3.select('#list-caret-up-'+d.name).style('display','none')
                        })
                    const mappingsContainer = itemContainer.append('div')
                        .classed('mappings-container',true)
                        .classed('hide-after', d => mapRoot.includes(d.name) ? false : true)
                        .classed('fade-after', () => hovered.length > 0 ? true : false)
                        .attr('id', d => 'mappings-container-'+d.name)
                        .style('max-height', d => mapRoot.includes(d.name) || d.mappings.map(m => m.name).some(map => hovered.includes(map)) ? d.mappings.length * 100 + 'px' : '0px')
                        .style('opacity', d => mapRoot.includes(d.name) || d.mappings.map(m => m.name).some(map => hovered.includes(map)) ? 1 : 0)
                        .style('display', d => d.levels === '-1' || d.mappings.length === 0 ? 'none' : 'flex')
                        .style('border-left', () => hovered.length > 0 ? '1px dashed #36126d20' : '1px dashed #36126d80')
                    mappingsContainer.append('p')
                        .classed('mappings-title selectedText',true)
                        .attr('id', d => 'mappings-title-'+d.name)
                        .html(d => d.data.concept.standard_concept ? 'Mapped from' : 'Maps to')
                        .style('max-height', d => mapRoot.includes(d.name) || d.mappings.map(m => m.name).some(map => hovered.includes(map)) ? '10px' : '0px')
                        .style('opacity', d => mapRoot.includes(d.name) ? hovered.length > 0 ? 0.2 : 1 : 0)
                    // MAPPINGS
                    mappingsContainer.selectAll(".map-list-item-container").data(d => d.mappings, d => d.name)
                    .join(enter => {
                        const mapItemContainer = enter.append('div')
                            .classed('map-list-item-container',true)
                            .each(function(d) {this.classList.add(`map-list-item-${d.source.name}`)})
                            .style('max-height', d => mapRoot.includes(d.source.name) ? '100px' : '0px')
                            .style('visibility', d => mapRoot.includes(d.source.name) ? 'visible' : 'hidden')
                        const mapItem = mapItemContainer.append('div')
                            .classed('map-list-item',true)
                            .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                        const mapTitleSection = mapItem.append('div')
                            .classed('list-title-section',true)
                        const mapConceptCard = mapTitleSection.append('div')
                            .classed('map-list-card',true)
                            .attr('id', d => 'list-card-'+d.name+d.source.name)
                            .style('display','flex')
                            .style('flex-direction','column')
                            .style('box-shadow', d => conceptNames.includes(d.name) ? '0 0 0 1px rgba(0, 0, 0, 0.02),0 2px 10px rgba(0, 0, 0, 0.15)' : 'none')
                            .style('background-color', d => conceptNames.includes(d.name) ? 'white' : '#ebebeb')
                        const mapTitle = mapConceptCard.append('div')
                            .classed('list-item-title',true)
                        const mapTitle1 = mapTitle.append('div')
                            .style('display','flex')
                            .style('align-items','center')
                        mapTitle1.append('div')
                            .classed('map-list-title-circle',true)
                            .classed('list-circle-dash', d => d.total_counts === 0 ? true : false)
                            .classed('list-circle', d => d.total_counts === 0 ? false : true)
                            .classed('btn', d => conceptNames.includes(d.name) ? true : false)
                            .style('pointer-events', d => conceptNames.includes(d.name) ? 'all' : 'none')
                            .style('background', d => {
                                if (d.total_counts === 0) return "none"
                                if (conceptNames.includes(d.name)) {
                                    if (!d.data.concept.standard_concept) {return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, "+ d.color + " 0.5px," + d.color + " 2px)"} 
                                    else {return "none"}
                                }
                                else {
                                    if (!d.data.concept.standard_concept) return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, #d6d6d6 0.5px, #d6d6d6 2px)"    
                                    else {return "none"}

                                }  
                            })
                            .style("background-color", d => {
                                if (d.total_counts === 0) return "transparent"
                                if (conceptNames.includes(d.name)) {
                                    if (d.data.concept.standard_concept) {return d.color} 
                                    else {return "transparent"}
                                }
                                else return '#d6d6d6'
                            }) 
                            .style('border', d => d.total_counts === 0 ? '1px solid #b2b2b2' : conceptNames.includes(d.name) ? `1px solid ${d.color}` : '1px solid #d6d6d6')
                            .on('mouseover',(e,d) => setHovered([d.name]))
                            .on('mouseout', (e,d) => setHovered([]))
                        const mapTitleRight = mapTitle1.append('div')
                            .classed('map-list-title-right btn',true)
                            .style('display','flex')
                            .style('align-items','center')
                            .on('mouseover',(e,d) => {
                                d3.select('#list-icons-'+d.name).transition(1000).style('max-width','36px').style('opacity',1)
                            })
                            .on('mouseout', (e,d) => {
                                
                                if (!showConfirmation) d3.select('#list-icons-'+d.name).transition(1000).style('max-width','0px').style('opacity',0)
                            })
                        const mapIcons = mapTitleRight.append('div')
                            .classed('map-list-icons',true)
                            .attr('id',d => 'list-icons-'+d.name)
                            .style('display','flex')
                            .style('max-width', '0px')
                            .style('opacity', 0)
                        mapIcons.append('img')
                            .classed('map-list-eye icon marginRight eye',true)
                            .attr('id', d => 'list-eye-'+d.name)
                            .attr("src", d => conceptNames.includes(d.name) ? openedEye : closedEye)
                            .style('opacity', d => conceptNames.includes(d.name) ? 1 : 0.3)
                            .style('display', d => d.total_counts === 0 ? 'none' : 'inline-block')
                            .on('mouseover', (e, d) => {
                                if (!conceptNames.includes(d.name)) d3.select('#list-eye-'+d.name).transition().style('opacity',1)
                                const el = e.currentTarget
                                el.__hoverTimeout__ = setTimeout(() => {
                                    showActionLabel(
                                        conceptNames.includes(d.name) 
                                            ? 'Hide concept'
                                            : 'Show concept',
                                        'enter',
                                        e
                                    )
                                }, 1200)
                            })
                            .on('mouseout', (e,d) => {
                                if (!conceptNames.includes(d.name)) d3.select('#list-eye-'+d.name).transition().style('opacity',0.2)
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave',e)
                            })
                            .on('click',(e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave')
                                if (d.total_counts !== 0) {
                                    if (conceptNames.includes(d.name)) {
                                        // if (!nodes.find(n => n.name === d.source.name).mappings.map(m => m.name).filter(map => map !== d.name).some(map => conceptNames.includes(map))) {
                                        //     const newMap = mapRoot.filter(name => name !== d.source.name)
                                        //     setMapRoot(newMap)
                                        // }
                                        const newInclusions = inclusions.filter(e => e !== d.name)
                                        updateConcepts(newInclusions,nodes,[],[d])
                                    } else if (!conceptNames.includes(d.name)){
                                        // if (!mapRoot.includes(d.source.name)) setMapRoot([...mapRoot,d.source.name])
                                        const newInclusions = [...inclusions,d.name]
                                        updateConcepts(newInclusions,nodes,[d],[])
                                    }     
                                } 
                            })
                        mapIcons.append('i')
                            .classed('map-list-search fa fa-search iconLg marginRight',true)
                            .attr('id', d => 'list-search-'+d.name)
                            .style('transform','scaleX(-1)')
                            .on('mouseover', (e, d) => {
                                const el = e.currentTarget
                                el.__hoverTimeout__ = setTimeout(() => {
                                    showActionLabel('Select concept','enter',e)
                                }, 1200)
                            })
                            .on('mouseout', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave',e)
                            })
                            .on('click', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave')
                                showConfirmationPopup(d, 'enter', e)
                            })
                        const mapTitleP = mapTitleRight.append('p')
                            .classed('map-list-title-p btn',true)
                            .style('opacity', d => conceptNames.includes(d.name) ? 1 : 0.6)
                            .on('mouseover', (e, d) => {
                                const el = e.currentTarget
                                el.__hoverTimeout__ = setTimeout(() => {
                                    showActionLabel('Select concept','enter',e)
                                }, 1200)
                            })
                            .on('mouseout', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave',e)
                            })
                            .on('click', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave')
                                if (!sidebarRoot.name.includes(d.name)) showConfirmationPopup(d, 'enter', e)
                            })
                        mapTitleP.append('span')
                            .classed('title-name selectedText marginRight',true)
                            .html(d => d.data.concept.concept_name)
                        mapTitleP.append('span')
                            .classed('title-code marginRight num',true)
                            .style('font-weight',500)
                            .html(d => d.data.concept.concept_code ? d.data.concept.concept_code : d.data.concept.concept_id)
                        mapTitleP.append('span')
                            .classed('title-vocab marginRight',true)
                            .html(d => d.data.concept.vocabulary_id)   
                        mapTitle.append('i')
                            .classed('map-info-icon fa-solid fa-circle-info icon',true)  
                            .attr('id', d => 'info-icon-'+d.name+d.source.name)  
                            .style('opacity', 0.2)
                            .on('mouseover',(e,d) => d3.select('#info-icon-'+d.name+d.source.name).transition().style('opacity',1))
                            .on('mouseout', (e,d) => {if(d3.select('#info-container-'+d.name+d.source.name).style('height') !== '45px') d3.select('#info-icon-'+d.name+d.source.name).transition().style('opacity',0.2)})
                            .on('click', (e,d) => {
                                if (d3.select('#info-container-'+d.name+d.source.name).style('height') === '45px') {
                                    d3.select('#info-icon-'+d.name+d.source.name).transition().style('opacity',0.2)
                                    d3.select('#info-container-'+d.name+d.source.name).transition().style('opacity',0).style('height','0px').style('padding-top','0px').style('margin','0px 0px 0px 22px')
                                    d3.select('#list-card-'+d.name+d.source.name).transition().style('border-radius','20px')
                                } else {
                                    d3.select('#info-icon-'+d.name+d.source.name).transition().style('opacity',1)
                                    d3.select('#info-container-'+d.name+d.source.name).transition().style('opacity',1).style('height','45px').style('padding-top','4px').style('margin','4px 4px 4px 22px')
                                    d3.select('#list-card-'+d.name+d.source.name).transition().style('border-radius','12px')
                                }
                            })
                        const mapInfoContainer = mapConceptCard.append('div')
                            .classed('map-info-container',true)
                            .attr('id', d => 'info-container-'+d.name+d.source.name)
                            .style('border-top', d => conceptNames.includes(d.name) ? '1px solid color-mix(in srgb, #36126d, white 90%)' : '1px solid color-mix(in srgb, #36126d, white 78%)')
                        const mapInfoCol1 = mapInfoContainer.append('div')
                            .classed('info-col',true)
                        mapInfoCol1.append('p')
                            .classed('selectedText infoRow',true)
                            .html('Id:')
                            .append('span')
                            .classed('infoContent num',true)
                            .html(d => d.name)
                        mapInfoCol1.append('p')
                            .classed('selectedText infoRow',true)
                            .html('Code:')
                            .append('span')
                            .classed('infoContent num',true)
                            .html(d => d.data.concept.concept_code)
                        mapInfoCol1.append('p')
                            .classed('selectedText infoRow',true)
                            .html('Type:')
                            .append('span')
                            .classed('infoContent',true)
                            .html(d => d.data.concept.standard_concept ? "Standard" : "Non standard")
                        const mapInfoCol2 = mapInfoContainer.append('div')
                            .classed('info-col',true)
                            .attr('id', d => 'info-col2-'+d.name)
                            .style('margin-left', '20px')
                        mapInfoCol2.append('p')
                            .classed('selectedText infoRow',true)
                            .html('Domain:')
                            .append('span')
                            .classed('infoContent',true)
                            .html(d => d.data.concept.domain_id)
                        mapInfoCol2.append('p')
                            .classed('selectedText infoRow',true)
                            .html('Class:')
                            .append('span')
                            .classed('infoContent',true)
                            .html(d => d.data.concept.concept_class_id)

                        const mapDataSection = mapTitleSection.append('div')
                            .style('display','flex')
                            .style('align-items','center')
                            .style('justify-content','flex-start')
                            .style('width','flex-grow',1)
                        const mapCountsSection = mapDataSection.append('div')
                            .style('display','flex')
                            .style('flex-direction','column')
                            .style('height','100%')
                            .style('justify-content','space-between')

                        const mapCountsRC = mapCountsSection.append('div')
                            .classed('list-counts',true)
                        mapCountsRC.append('p')
                            .classed('map-counts-RC-p list-counts-p num',true)
                            .style('color', d => conceptNames.includes(d.name) ? '#36126d' : '#808080')
                            .style('font-weight', d => conceptNames.includes(d.name) ? 500 : 400)
                            .html(d => formatThousands(d.total_counts))
                        mapCountsRC.append('p')
                            .classed('map-counts-RC-label list-counts-label',true)
                            .style('color', d => conceptNames.includes(d.name) ? '#36126d' : '#808080')
                            .style('font-weight', d => conceptNames.includes(d.name) ? 500 : 400)
                            .html('RC')
                        const mapCountsBarRC = mapCountsRC.append('div')
                            .classed('list-counts-bar-container',true)
                        mapCountsBarRC.append('div')
                            .classed('map-counts-RC-bar list-counts-bar',true)
                            .style('width', d => scaleWidth(d.total_counts) + 'px')
                            .style('background-color', d => conceptNames.includes(d.name) ? d.color : '#e0e0e0')
                        
                        const mapCountsDRC = mapCountsSection.append('div')
                            .classed('list-counts',true)
                        mapCountsDRC.append('p')
                            .classed('map-counts-DRC-P list-counts-p num',true)
                            .style('text-align','left')
                            .style('color', d => conceptNames.includes(d.name) ? '#36126d' : '#808080')
                            .style('font-weight', d => conceptNames.includes(d.name) ? 500 : 400)
                            .html(d => formatThousands(d.descendant_counts))
                        mapCountsDRC.append('p')
                            .classed('map-counts-DRC-label list-counts-label',true)
                            .style('color', d => conceptNames.includes(d.name) ? '#36126d' : '#808080')
                            .style('font-weight', d => conceptNames.includes(d.name) ? 500 : 400)
                            .html('DRC')
                        const mapCountsBarDRC = mapCountsDRC.append('div')
                            .classed('list-counts-bar-container',true)
                        mapCountsBarDRC.append('div')
                            .classed('map-counts-DRC-bar list-counts-bar',true)
                            .style('width', d => scaleWidth(d.descendant_counts) + 'px')
                            .style('background-color', d => conceptNames.includes(d.name) ? d.color : '#e0e0e0')   
                        
                        mapDataSection.append('div')
                            .classed('list-open-mappings',true)
                    
                    },update => {
                        update
                            .transition()
                            .style('max-height', d => mapRoot.includes(d.source.name) || (nodes.find(n => n.name === d.source.name).mappings.map(m => m.name).some(map => conceptNames.includes(map))) ? '100px' : '0px')
                            .style('visibility', d => mapRoot.includes(d.source.name) || (nodes.find(n => n.name === d.source.name).mappings.map(m => m.name).some(map => conceptNames.includes(map))) ? 'visible' : 'hidden')
                        update.select('.map-list-item')
                            .transition()
                            .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                        update.select('.map-list-card')
                            .style('box-shadow', d => conceptNames.includes(d.name) ? '0 0 0 1px rgba(0, 0, 0, 0.02),0 2px 10px rgba(0, 0, 0, 0.15)' : 'none')
                            .style('background-color', d => d.levels === '-1' ? 'none' : conceptNames.includes(d.name) ? 'white' : '#ebebeb')
                        update.select('.map-list-title-circle')
                            .classed('list-circle-dash', d => d.total_counts === 0 ? true : false)
                            .classed('list-circle', d => d.total_counts === 0 ? false : true)
                            .classed('btn', d => conceptNames.includes(d.name) ? true : false)
                            .style('pointer-events', d => conceptNames.includes(d.name) ? 'all' : 'none')
                            .style('background', d => {
                                if (d.total_counts === 0) return "none"
                                if (conceptNames.includes(d.name)) {
                                    if (!d.data.concept.standard_concept) {return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, "+ d.color + " 0.5px," + d.color + " 2px)"} 
                                    else {return "none"}
                                }
                                else {
                                    if (!d.data.concept.standard_concept) return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, #d6d6d6 0.5px, #d6d6d6 2px)"  
                                    else {return "none"}

                                }      
                            })
                            .style("background-color", d => {
                                if (d.total_counts === 0) return "transparent"
                                if (conceptNames.includes(d.name)) {
                                    if (d.data.concept.standard_concept) {return d.color} 
                                    else {return "transparent"}
                                }
                                else return '#d6d6d6'
                            }) 
                            .style('border', d => d.total_counts === 0 ? '1px solid #b2b2b2' : conceptNames.includes(d.name) ? `1px solid ${d.color}` : '1px solid #d6d6d6')
                            .on('mouseover',(e,d) => setHovered([d.name]))
                            .on('mouseout', (e,d) => setHovered([]))
                        update.select('.map-list-title-right')
                            .on('mouseover',(e,d) => {
                                    d3.select('#list-icons-'+d.name).transition(1000).style('max-width','36px').style('opacity',1)
                            })
                            .on('mouseout', (e,d) => {
                                
                                if (!showConfirmation) d3.select('#list-icons-'+d.name).transition(1000).style('max-width','0px').style('opacity',0)
                            })
                        update.select('.map-list-eye')
                            .attr("src", d => conceptNames.includes(d.name) ? openedEye : closedEye)
                            .style('opacity', d => conceptNames.includes(d.name) ? 1 : 0.3)
                            .style('display', d => d.total_counts === 0 ? 'none' : 'inline-block')
                            .on('mouseover', (e, d) => {
                                if (!conceptNames.includes(d.name)) d3.select('#list-eye-'+d.name).transition().style('opacity',1)
                                const el = e.currentTarget
                                el.__hoverTimeout__ = setTimeout(() => {
                                    showActionLabel(
                                        conceptNames.includes(d.name) 
                                            ? 'Hide concept'
                                            : 'Show concept',
                                        'enter',
                                        e
                                    )
                                }, 1200)
                            })
                            .on('mouseout', (e,d) => {
                                if (!conceptNames.includes(d.name)) d3.select('#list-eye-'+d.name).transition().style('opacity',0.2)
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave',e)
                            })
                            .on('click',(e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave')
                                if (d.total_counts !== 0) {
                                    if (conceptNames.includes(d.name)) {
                                        // if (!nodes.find(n => n.name === d.source.name).mappings.map(m => m.name).filter(map => map !== d.name).some(map => conceptNames.includes(map))) {
                                        //     const newMap = mapRoot.filter(name => name !== d.source.name)
                                        //     setMapRoot(newMap)
                                        // }
                                        const newInclusions = inclusions.filter(e => e !== d.name)
                                        updateConcepts(newInclusions,nodes,[],[d])
                                    } else if (!conceptNames.includes(d.name)){
                                        // if (!mapRoot.includes(d.source.name)) setMapRoot([...mapRoot,d.source.name])
                                        const newInclusions = [...inclusions,d.name]
                                        updateConcepts(newInclusions,nodes,[d],[])
                                    }     
                                } 
                            })
                        update.select('.map-list-search')
                            .on('mouseover', (e, d) => {
                                const el = e.currentTarget
                                el.__hoverTimeout__ = setTimeout(() => {
                                    showActionLabel('Select concept','enter',e)
                                }, 1200)
                            })
                            .on('mouseout', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave',e)
                            })
                            .on('click', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave')
                                showConfirmationPopup(d, 'enter', e)
                            })
                        update.select('.map-list-title-p')
                            .on('mouseover', (e, d) => {
                                const el = e.currentTarget
                                el.__hoverTimeout__ = setTimeout(() => {
                                    showActionLabel('Select concept','enter',e)
                                }, 1200)
                            })
                            .on('mouseout', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave',e)
                            })
                            .on('click', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave')
                                if (!sidebarRoot.name.includes(d.name)) showConfirmationPopup(d, 'enter', e)
                            })
                            .transition()
                            .style('opacity', d => conceptNames.includes(d.name) ? 1 : 0.6)
                        update.select('.map-info-icon')
                            .on('mouseover',(e,d) => d3.select('#info-icon-'+d.name+d.source.name).transition().style('opacity',1))
                            .on('mouseout', (e,d) => {if(d3.select('#info-container-'+d.name+d.source.name).style('height') !== '45px') d3.select('#info-icon-'+d.name+d.source.name).transition().style('opacity',0.2)})
                            .on('click', (e,d) => {
                                if (d3.select('#info-container-'+d.name+d.source.name).style('height') === '45px') {
                                    d3.select('#info-icon-'+d.name+d.source.name).transition().style('opacity',0.2)
                                    d3.select('#info-container-'+d.name+d.source.name).transition().style('opacity',0).style('height','0px').style('padding-top','0px').style('margin','0px 0px 0px 22px')
                                    d3.select('#list-card-'+d.name+d.source.name).transition().style('border-radius','20px')
                                } else {
                                    d3.select('#info-icon-'+d.name+d.source.name).transition().style('opacity',1)
                                    d3.select('#info-container-'+d.name+d.source.name).transition().style('opacity',1).style('height','45px').style('padding-top','4px').style('margin','4px 4px 4px 22px')
                                    d3.select('#list-card-'+d.name+d.source.name).transition().style('border-radius','12px')
                                }
                            })
                        update.select('.map-info-container')
                            .style('border-top', d => conceptNames.includes(d.name) ? '1px solid color-mix(in srgb, #36126d, white 90%)' : '1px solid color-mix(in srgb, #36126d, white 78%)')
                        update.select('.map-counts-RC-p')
                            .style('color', d => conceptNames.includes(d.name) ? '#36126d' : '#808080')
                            .style('font-weight', d => conceptNames.includes(d.name) ? 500 : 400)
                            .html(d => formatThousands(d.total_counts))
                        update.select('.map-counts-RC-label')
                            .style('color', d => conceptNames.includes(d.name) ? '#36126d' : '#808080')
                            .style('font-weight', d => conceptNames.includes(d.name) ? 500 : 400)
                        update.select('.map-counts-RC-bar')
                            .transition()
                            .style('width', d => scaleWidth(d.total_counts) + 'px')
                            .style('background-color', d => conceptNames.includes(d.name) ? d.color : '#e0e0e0')
                        update.select('.map-counts-DRC-p')
                            .style('color', d => conceptNames.includes(d.name) ? '#36126d' : '#808080')
                            .style('font-weight', d => conceptNames.includes(d.name) ? 500 : 400)
                            .html(d => formatThousands(d.descendant_counts))
                        update.select('.map-counts-DRC-label')
                            .style('color', d => conceptNames.includes(d.name) ? '#36126d' : '#808080')
                            .style('font-weight', d => conceptNames.includes(d.name) ? 500 : 400)
                        update.select('.map-counts-DRC-bar')
                            .transition()
                            .style('width', d => scaleWidth(d.descendant_counts) + 'px')
                            .style('background-color', d => conceptNames.includes(d.name) ? d.color : '#e0e0e0')
                    })
                },update => {
                    update.select('.list-item')
                        .style('background-color', d => d.levels === '-1' ? '#f0f0f0' : 'white')
                        .transition()
                        .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                    update.select('.list-card')
                        .style('box-shadow', d => conceptNames.includes(d.name) || d.leaf ? '0 0 0 1px rgba(0, 0, 0, 0.02),0 2px 10px rgba(0, 0, 0, 0.15)' : 'none')
                        .style('background-color', d => d.levels === '-1' ? 'none' : conceptNames.includes(d.name) || d.leaf ? 'white' : '#ebebeb')
                    update.select('.list-title-circle')
                        .classed('list-circle-dash', d => d.total_counts === 0 && !d.leaf ? true : false)
                        .classed('list-circle', d => d.total_counts === 0 && !d.leaf ? false : true)
                        .classed('btn', d => conceptNames.includes(d.name) || d.leaf ? true : false)
                        .style("pointer-events", d => conceptNames.includes(d.name) || d.leaf ? 'all' : 'none')
                        .style('background', d => {
                            if (d.total_counts === 0 && !d.leaf) return "none"
                            if (conceptNames.includes(d.name) || d.leaf) {
                                if (!d.data.concept.standard_concept) {return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, "+ d.color + " 0.5px," + d.color + " 2px)"} 
                                else {return "none"}
                            }
                            else {
                                if (!d.data.concept.standard_concept) return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, #d6d6d6 0.5px, #d6d6d6 2px)"  
                                else {return "none"}

                            }      
                        })
                        .style("background-color", d => {
                            if (d.total_counts === 0 && !d.leaf) return "transparent"
                            if (conceptNames.includes(d.name) || d.leaf) {
                                if (d.data.concept.standard_concept) {return d.color} 
                                else {return "transparent"}
                            }
                            else return '#d6d6d6'
                        }) 
                        .style('border', d => d.total_counts === 0 && !d.leaf ? '1px solid #b2b2b2' : conceptNames.includes(d.name) || d.leaf ? `1px solid ${d.color}` : '1px solid #d6d6d6')
                        .on('mouseover',(e,d) => setHovered([d.name]))
                        .on('mouseout', (e,d) => setHovered([]))
                    update.select('.list-title-right')
                        .on('mouseover',(e,d) => {
                                d3.select('#list-icons-'+d.name).transition(1000).style('max-width','36px').style('opacity',1)
                        })
                        .on('mouseout', (e,d) => {
                            
                            if (!showConfirmation) d3.select('#list-icons-'+d.name).transition(1000).style('max-width','0px').style('opacity',0)
                        })
                    update.select('.list-eye')
                        .attr("src", d => conceptNames.includes(d.name) || d.leaf ? openedEye : closedEye)
                        .style('opacity', d => conceptNames.includes(d.name) || d.leaf ? 1 : 0.2)
                        .style('display', d => (d.total_counts === 0 && !d.leaf) || d.levels === '-1' ? 'none' : 'inline-block')
                        .on('mouseover', (e, d) => {
                            if (!conceptNames.includes(d.name) && !d.leaf) d3.select('#list-eye-'+d.name).transition().style('opacity',1)
                            const el = e.currentTarget
                            el.__hoverTimeout__ = setTimeout(() => {
                                showActionLabel(
                                    conceptNames.includes(d.name) || d.leaf
                                        ? 'Hide concept'
                                        : 'Show concept',
                                    'enter',
                                    e
                                )
                            }, 1200)
                        })
                        .on('mouseout', (e,d) => {
                            if (!conceptNames.includes(d.name) && !d.leaf) d3.select('#list-eye-'+d.name).transition().style('opacity',0.2)
                            clearTimeout(e.currentTarget.__hoverTimeout__)
                            showActionLabel('','leave',e)
                        })
                        .on('click',(e,d) => {
                            clearTimeout(e.currentTarget.__hoverTimeout__)
                            showActionLabel('','leave')
                            if (d.total_counts !== 0) {
                                if (conceptNames.includes(d.name)) {
                                    const newInclusions = inclusions.filter(e => e !== d.name)
                                    updateConcepts(newInclusions,nodes,[],[d])
                                } else if (!conceptNames.includes(d.name)){
                                    const newInclusions = [...inclusions,d.name]
                                    updateConcepts(newInclusions,nodes,[d],[])
                                }     
                            } 
                        })
                    update.select('.list-search')
                        .on('mouseover', (e, d) => {
                            const el = e.currentTarget
                            el.__hoverTimeout__ = setTimeout(() => {
                                showActionLabel('Select concept','enter',e)
                            }, 1200)
                        })
                        .on('mouseout', (e,d) => {
                            clearTimeout(e.currentTarget.__hoverTimeout__)
                            showActionLabel('','leave',e)
                        })
                        .on('click', (e,d) => {
                            clearTimeout(e.currentTarget.__hoverTimeout__)
                            showActionLabel('','leave')
                            showConfirmationPopup(d, 'enter', e)
                        })
                    update.select('.list-title-p')
                        .on('mouseover', (e, d) => {
                            const el = e.currentTarget
                            el.__hoverTimeout__ = setTimeout(() => {
                                showActionLabel('Select concept','enter',e)
                            }, 1200)
                        })
                        .on('mouseout', (e,d) => {
                            clearTimeout(e.currentTarget.__hoverTimeout__)
                            showActionLabel('','leave',e)
                        })
                        .on('click', (e,d) => {
                            clearTimeout(e.currentTarget.__hoverTimeout__)
                            showActionLabel('','leave')
                            if (!sidebarRoot.name.includes(d.name)) showConfirmationPopup(d, 'enter', e)
                        })
                        .transition()
                        .style('opacity', d => conceptNames.includes(d.name) || d.leaf ? 1 : 0.6)
                    update.select('.info-icon')
                        .style('display', d => d.levels === '-1' || !d.levels ? 'none' : 'block')
                        .on('mouseover',(e,d) => d3.select('#info-icon-'+d.name).transition().style('opacity',1))
                        .on('mouseout', (e,d) => {if(d3.select('#info-container-'+d.name).style('height') !== '45px') d3.select('#info-icon-'+d.name).transition().style('opacity',0.2)})
                        .on('click', (e,d) => {
                            if (d3.select('#info-container-'+d.name).style('height') === '45px') {
                                d3.select('#info-icon-'+d.name).transition().style('opacity',0.2)
                                d3.select('#info-container-'+d.name).transition().style('opacity',0).style('height','0px').style('padding-top','0px').style('margin','0px 0px 0px 22px')
                                d3.select('#list-card-'+d.name).transition().style('border-radius','20px')
                            } else {
                                d3.select('#info-icon-'+d.name).transition().style('opacity',1)
                                d3.select('#info-container-'+d.name).transition().style('opacity',1).style('height','45px').style('padding-top','4px').style('margin','4px 4px 4px 22px')
                                d3.select('#list-card-'+d.name).transition().style('border-radius','12px')
                            }
                        })
                    update.select('.info-container')
                        .style('border-top', d => conceptNames.includes(d.name) || d.leaf ? '1px solid color-mix(in srgb, #36126d, white 90%)' : '1px solid color-mix(in srgb, #36126d, white 78%)')
                    update.select('.counts-RC-p')
                        .style('color', d => conceptNames.includes(d.name) && !d.leaf ? '#36126d' : '#808080')
                        .style('font-weight', d => conceptNames.includes(d.name) && !d.leaf ? 500 : 400)
                        .html(d => formatThousands(d.total_counts))
                    update.select('.counts-RC-label')
                        .style('color', d => conceptNames.includes(d.name) && !d.leaf ? '#36126d' : '#808080')
                        .style('font-weight', d => conceptNames.includes(d.name) && !d.leaf ? 500 : 400)
                    update.select('.counts-RC-bar')
                        .transition()
                        .style('width', d => scaleWidth(d.total_counts) + 'px')
                        .style('background-color', d => conceptNames.includes(d.name) && !d.leaf ? d.color : '#e0e0e0')
                    update.select('.counts-DRC-p')
                        .style('color', d => conceptNames.includes(d.name) && d.leaf ? '#36126d' : '#808080')
                        .style('font-weight', d => conceptNames.includes(d.name) && d.leaf ? 500 : 400)
                        .html(d => formatThousands(d.descendant_counts))
                    update.select('.counts-DRC-label')
                        .style('color', d => conceptNames.includes(d.name) && d.leaf ? '#36126d' : '#808080')
                        .style('font-weight', d => conceptNames.includes(d.name) && d.leaf ? 500 : 400)
                    update.select('.counts-DRC-bar')
                        .transition()
                        .style('width', d => scaleWidth(d.descendant_counts) + 'px')
                        .style('background-color', d => conceptNames.includes(d.name) && d.leaf ? d.color : '#e0e0e0')
                    update.select('.list-caret-down')
                        .style('display', d => d.mappings.length > 0 ? mapRoot.includes(d.name) || d.mappings.map(m => m.name).some(map => hovered.includes(map)) ? 'none' : 'block' : 'none')
                        .on('click',(e,d) => {
                            setMapRoot([...mapRoot,d.name])
                            d3.select('#mappings-container-'+d.name).classed('hide-after', false).transition(2000).style('opacity',1).style('max-height',d.mappings.length * 100 + 'px')
                            d3.select('#mappings-title-'+d.name).transition(2000).style('opacity',1).style('max-height','10px')
                            d3.selectAll(".map-list-item-"+d.name).transition(2000).style('max-height','100px').style('visibility','visible')
                            d3.select('#list-caret-down-'+d.name).style('display','none')
                            d3.select('#list-caret-up-'+d.name).style('display','block')
                        })
                    update.select('.list-caret-up')
                        .style('display', d => mapRoot.includes(d.name) || d.mappings.map(m => m.name).some(map => hovered.includes(map)) ? 'block' : 'none')
                        .on('click',(e,d) => {
                            const newMap = mapRoot.filter(name => name !== d.name)
                            setMapRoot(newMap)
                            d3.select('#mappings-container-'+d.name).classed('hide-after', true).transition(2000).style('opacity',0).style('max-height','0px')
                            d3.select('#mappings-title-'+d.name).transition(2000).style('opacity',0).style('max-height','0px')
                            d3.selectAll(".map-list-item-"+d.name).transition(2000).style('max-height','0px').style('visibility','hidden')
                            d3.select('#list-caret-down-'+d.name).style('display','block')
                            d3.select('#list-caret-up-'+d.name).style('display','none')
                        })
                    update.select('.mappings-container')
                        .classed('hide-after', d => mapRoot.includes(d.name) ? false : true)
                        .classed('fade-after', () => hovered.length > 0 ? true : false)
                        .transition()
                        .style('max-height', d => mapRoot.includes(d.name) || d.mappings.map(m => m.name).some(map => hovered.includes(map)) ? d.mappings.length * 100 + 'px' : '0px')
                        .style('opacity', d => mapRoot.includes(d.name) || d.mappings.map(m => m.name).some(map => hovered.includes(map)) ? 1 : 0)
                        .style('border-left', () => hovered.length > 0 ? '1px dashed #36126d20' : '1px dashed #36126d80')
                    update.select('.mappings-title')
                        .transition()
                        .style('max-height', d => mapRoot.includes(d.name) || d.mappings.map(m => m.name).some(map => hovered.includes(map)) ? '10px' : '0px')
                        .style('opacity', d => mapRoot.includes(d.name) ? hovered.length > 0 ? 0.2 : 1 : 0)
                    // MAPPINGS
                    update.selectAll(".map-list-item-container").data(d => d.mappings, d => d.name)
                    .join(enter => {
                        const mapItemContainer = enter.append('div')
                            .classed('map-list-item-container',true)
                            .each(function(d) {this.classList.add(`map-list-item-${d.source.name}`)})
                            .style('max-height', d => mapRoot.includes(d.source.name) ? '100px' : '0px')
                            .style('visibility', d => mapRoot.includes(d.source.name) ? 'visible' : 'hidden')
                        const mapItem = mapItemContainer.append('div')
                            .classed('map-list-item',true)
                            .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                        const mapTitleSection = mapItem.append('div')
                            .classed('list-title-section',true)
                        const mapConceptCard = mapTitleSection.append('div')
                            .classed('map-list-card',true)
                            .attr('id', d => 'list-card-'+d.name+d.source.name)
                            .style('display','flex')
                            .style('flex-direction','column')
                            .style('box-shadow', d => conceptNames.includes(d.name) ? '0 0 0 1px rgba(0, 0, 0, 0.02),0 2px 10px rgba(0, 0, 0, 0.15)' : 'none')
                            .style('background-color', d => conceptNames.includes(d.name) ? 'white' : '#ebebeb')
                        const mapTitle = mapConceptCard.append('div')
                            .classed('list-item-title',true)
                        const mapTitle1 = mapTitle.append('div')
                            .style('display','flex')
                            .style('align-items','center')
                        mapTitle1.append('div')
                            .classed('map-list-title-circle',true)
                            .classed('list-circle-dash', d => d.total_counts === 0 ? true : false)
                            .classed('list-circle', d => d.total_counts === 0 ? false : true)
                            .classed('btn', d => conceptNames.includes(d.name) ? true : false)
                            .style('pointer-events', d => conceptNames.includes(d.name) ? 'all' : 'none')
                            .style('background', d => {
                                if (d.total_counts === 0) return "none"
                                if (conceptNames.includes(d.name)) {
                                    if (!d.data.concept.standard_concept) {return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, "+ d.color + " 0.5px," + d.color + " 2px)"} 
                                    else {return "none"}
                                }
                                else {
                                    if (!d.data.concept.standard_concept) return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, #d6d6d6 0.5px, #d6d6d6 2px)"    
                                    else {return "none"}

                                }  
                            })
                            .style("background-color", d => {
                                if (d.total_counts === 0) return "transparent"
                                if (conceptNames.includes(d.name)) {
                                    if (d.data.concept.standard_concept) {return d.color} 
                                    else {return "transparent"}
                                }
                                else return '#d6d6d6'
                            }) 
                            .style('border', d => d.total_counts === 0 ? '1px solid #b2b2b2' : conceptNames.includes(d.name) ? `1px solid ${d.color}` : '1px solid #d6d6d6')
                            .on('mouseover',(e,d) => setHovered([d.name]))
                            .on('mouseout', (e,d) => setHovered([]))
                        const mapTitleRight = mapTitle1.append('div')
                            .classed('map-list-title-right btn',true)
                            .style('display','flex')
                            .style('align-items','center')
                            .on('mouseover',(e,d) => {
                                d3.select('#list-icons-'+d.name).transition(1000).style('max-width','36px').style('opacity',1)
                            })
                            .on('mouseout', (e,d) => {
                                
                                if (!showConfirmation) d3.select('#list-icons-'+d.name).transition(1000).style('max-width','0px').style('opacity',0)
                            })
                        const mapIcons = mapTitleRight.append('div')
                            .classed('map-list-icons',true)
                            .attr('id',d => 'list-icons-'+d.name)
                            .style('display','flex')
                            .style('max-width', '0px')
                            .style('opacity', 0)
                        mapIcons.append('img')
                            .classed('map-list-eye icon marginRight eye',true)
                            .attr('id', d => 'list-eye-'+d.name)
                            .attr("src", d => conceptNames.includes(d.name) ? openedEye : closedEye)
                            .style('opacity', d => conceptNames.includes(d.name) ? 1 : 0.3)
                            .style('display', d => d.total_counts === 0 ? 'none' : 'inline-block')
                            .on('mouseover', (e, d) => {
                                if (!conceptNames.includes(d.name)) d3.select('#list-eye-'+d.name).transition().style('opacity',1)
                                const el = e.currentTarget
                                el.__hoverTimeout__ = setTimeout(() => {
                                    showActionLabel(
                                        conceptNames.includes(d.name) 
                                            ? 'Hide concept'
                                            : 'Show concept',
                                        'enter',
                                        e
                                    )
                                }, 1200)
                            })
                            .on('mouseout', (e,d) => {
                                if (!conceptNames.includes(d.name)) d3.select('#list-eye-'+d.name).transition().style('opacity',0.2)
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave',e)
                            })
                            .on('click',(e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave')
                                if (d.total_counts !== 0) {
                                    if (conceptNames.includes(d.name)) {
                                        // if (!nodes.find(n => n.name === d.source.name).mappings.map(m => m.name).filter(map => map !== d.name).some(map => conceptNames.includes(map))) {
                                        //     const newMap = mapRoot.filter(name => name !== d.source.name)
                                        //     setMapRoot(newMap)
                                        // }
                                        const newInclusions = inclusions.filter(e => e !== d.name)
                                        updateConcepts(newInclusions,nodes,[],[d])
                                    } else if (!conceptNames.includes(d.name)){
                                        // if (!mapRoot.includes(d.source.name)) setMapRoot([...mapRoot,d.source.name])
                                        const newInclusions = [...inclusions,d.name]
                                        updateConcepts(newInclusions,nodes,[d],[])
                                    }     
                                } 
                            })
                        mapIcons.append('i')
                            .classed('map-list-search fa fa-search iconLg marginRight',true)
                            .attr('id', d => 'list-search-'+d.name)
                            .style('transform','scaleX(-1)')
                            .on('mouseover', (e, d) => {
                                const el = e.currentTarget
                                el.__hoverTimeout__ = setTimeout(() => {
                                    showActionLabel('Select concept','enter',e)
                                }, 1200)
                            })
                            .on('mouseout', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave',e)
                            })
                            .on('click', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave')
                                showConfirmationPopup(d, 'enter', e)
                            })
                        const mapTitleP = mapTitleRight.append('p')
                            .classed('map-list-title-p btn',true)
                            .style('opacity', d => conceptNames.includes(d.name) ? 1 : 0.6)
                            .on('mouseover', (e, d) => {
                                const el = e.currentTarget
                                el.__hoverTimeout__ = setTimeout(() => {
                                    showActionLabel('Select concept','enter',e)
                                }, 1200)
                            })
                            .on('mouseout', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave',e)
                            })
                            .on('click', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave')
                                if (!sidebarRoot.name.includes(d.name)) showConfirmationPopup(d, 'enter', e)
                            })
                        mapTitleP.append('span')
                            .classed('title-name selectedText marginRight',true)
                            .html(d => d.data.concept.concept_name)
                        mapTitleP.append('span')
                            .classed('title-code marginRight num',true)
                            .style('font-weight',500)
                            .html(d => d.data.concept.concept_code ? d.data.concept.concept_code : d.data.concept.concept_id)
                        mapTitleP.append('span')
                            .classed('title-vocab marginRight',true)
                            .html(d => d.data.concept.vocabulary_id)   
                        mapTitle.append('i')
                            .classed('map-info-icon fa-solid fa-circle-info icon',true)  
                            .attr('id', d => 'info-icon-'+d.name+d.source.name)  
                            .style('opacity', 0.2)
                            .on('mouseover',(e,d) => d3.select('#info-icon-'+d.name+d.source.name).transition().style('opacity',1))
                            .on('mouseout', (e,d) => {if(d3.select('#info-container-'+d.name+d.source.name).style('height') !== '45px') d3.select('#info-icon-'+d.name+d.source.name).transition().style('opacity',0.2)})
                            .on('click', (e,d) => {
                                if (d3.select('#info-container-'+d.name+d.source.name).style('height') === '45px') {
                                    d3.select('#info-icon-'+d.name+d.source.name).transition().style('opacity',0.2)
                                    d3.select('#info-container-'+d.name+d.source.name).transition().style('opacity',0).style('height','0px').style('padding-top','0px').style('margin','0px 0px 0px 22px')
                                    d3.select('#list-card-'+d.name+d.source.name).transition().style('border-radius','20px')
                                } else {
                                    d3.select('#info-icon-'+d.name+d.source.name).transition().style('opacity',1)
                                    d3.select('#info-container-'+d.name+d.source.name).transition().style('opacity',1).style('height','45px').style('padding-top','4px').style('margin','4px 4px 4px 22px')
                                    d3.select('#list-card-'+d.name+d.source.name).transition().style('border-radius','12px')
                                }
                            })
                        const mapInfoContainer = mapConceptCard.append('div')
                            .classed('map-info-container',true)
                            .attr('id', d => 'info-container-'+d.name+d.source.name)
                            .style('border-top', d => conceptNames.includes(d.name) ? '1px solid color-mix(in srgb, #36126d, white 90%)' : '1px solid color-mix(in srgb, #36126d, white 78%)')
                        const mapInfoCol1 = mapInfoContainer.append('div')
                            .classed('info-col',true)
                        mapInfoCol1.append('p')
                            .classed('selectedText infoRow',true)
                            .html('Id:')
                            .append('span')
                            .classed('infoContent num',true)
                            .html(d => d.name)
                        mapInfoCol1.append('p')
                            .classed('selectedText infoRow',true)
                            .html('Code:')
                            .append('span')
                            .classed('infoContent num',true)
                            .html(d => d.data.concept.concept_code)
                        mapInfoCol1.append('p')
                            .classed('selectedText infoRow',true)
                            .html('Type:')
                            .append('span')
                            .classed('infoContent',true)
                            .html(d => d.data.concept.standard_concept ? "Standard" : "Non standard")
                        const mapInfoCol2 = mapInfoContainer.append('div')
                            .classed('info-col',true)
                            .attr('id', d => 'info-col2-'+d.name)
                            .style('margin-left', '20px')
                        mapInfoCol2.append('p')
                            .classed('selectedText infoRow',true)
                            .html('Domain:')
                            .append('span')
                            .classed('infoContent',true)
                            .html(d => d.data.concept.domain_id)
                        mapInfoCol2.append('p')
                            .classed('selectedText infoRow',true)
                            .html('Class:')
                            .append('span')
                            .classed('infoContent',true)
                            .html(d => d.data.concept.concept_class_id)

                        const mapDataSection = mapTitleSection.append('div')
                            .style('display','flex')
                            .style('align-items','center')
                            .style('justify-content','flex-start')
                            .style('width','flex-grow',1)
                        const mapCountsSection = mapDataSection.append('div')
                            .style('display','flex')
                            .style('flex-direction','column')
                            .style('height','100%')
                            .style('justify-content','space-between')

                        const mapCountsRC = mapCountsSection.append('div')
                            .classed('list-counts',true)
                        mapCountsRC.append('p')
                            .classed('map-counts-RC-p list-counts-p num',true)
                            .style('color', d => conceptNames.includes(d.name) ? '#36126d' : '#808080')
                            .style('font-weight', d => conceptNames.includes(d.name) ? 500 : 400)
                            .html(d => formatThousands(d.total_counts))
                        mapCountsRC.append('p')
                            .classed('map-counts-RC-label list-counts-label',true)
                            .style('color', d => conceptNames.includes(d.name) ? '#36126d' : '#808080')
                            .style('font-weight', d => conceptNames.includes(d.name) ? 500 : 400)
                            .html('RC')
                        const mapCountsBarRC = mapCountsRC.append('div')
                            .classed('list-counts-bar-container',true)
                        mapCountsBarRC.append('div')
                            .classed('map-counts-RC-bar list-counts-bar',true)
                            .style('width', d => scaleWidth(d.total_counts) + 'px')
                            .style('background-color', d => conceptNames.includes(d.name) ? d.color : '#e0e0e0')
                        
                        const mapCountsDRC = mapCountsSection.append('div')
                            .classed('list-counts',true)
                        mapCountsDRC.append('p')
                            .classed('map-counts-DRC-P list-counts-p num',true)
                            .style('text-align','left')
                            .style('color', d => conceptNames.includes(d.name) ? '#36126d' : '#808080')
                            .style('font-weight', d => conceptNames.includes(d.name) ? 500 : 400)
                            .html(d => formatThousands(d.descendant_counts))
                        mapCountsDRC.append('p')
                            .classed('map-counts-DRC-label list-counts-label',true)
                            .style('color', d => conceptNames.includes(d.name) ? '#36126d' : '#808080')
                            .style('font-weight', d => conceptNames.includes(d.name) ? 500 : 400)
                            .html('DRC')
                        const mapCountsBarDRC = mapCountsDRC.append('div')
                            .classed('list-counts-bar-container',true)
                        mapCountsBarDRC.append('div')
                            .classed('map-counts-DRC-bar list-counts-bar',true)
                            .style('width', d => scaleWidth(d.descendant_counts) + 'px')
                            .style('background-color', d => conceptNames.includes(d.name) ? d.color : '#e0e0e0')   
                        
                        mapDataSection.append('div')
                            .classed('list-open-mappings',true)
                    
                    },update => {
                        update
                            .transition()
                            .style('max-height', d => mapRoot.includes(d.source.name) || (nodes.find(n => n.name === d.source.name).mappings.map(m => m.name).some(map => conceptNames.includes(map))) ? '100px' : '0px')
                            .style('visibility', d => mapRoot.includes(d.source.name) || (nodes.find(n => n.name === d.source.name).mappings.map(m => m.name).some(map => conceptNames.includes(map))) ? 'visible' : 'hidden')
                        update.select('.map-list-item')
                            .transition()
                            .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                        update.select('.map-list-card')
                            .style('box-shadow', d => conceptNames.includes(d.name) ? '0 0 0 1px rgba(0, 0, 0, 0.02),0 2px 10px rgba(0, 0, 0, 0.15)' : 'none')
                            .style('background-color', d => d.levels === '-1' ? 'none' : conceptNames.includes(d.name) ? 'white' : '#ebebeb')
                        update.select('.map-list-title-circle')
                            .classed('list-circle-dash', d => d.total_counts === 0 ? true : false)
                            .classed('list-circle', d => d.total_counts === 0 ? false : true)
                            .classed('btn', d => conceptNames.includes(d.name) ? true : false)
                            .style('pointer-events', d => conceptNames.includes(d.name) ? 'all' : 'none')
                            .style('background', d => {
                                if (d.total_counts === 0) return "none"
                                if (conceptNames.includes(d.name)) {
                                    if (!d.data.concept.standard_concept) {return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, "+ d.color + " 0.5px," + d.color + " 2px)"} 
                                    else {return "none"}
                                }
                                else {
                                    if (!d.data.concept.standard_concept) return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, #d6d6d6 0.5px, #d6d6d6 2px)"  
                                    else {return "none"}

                                }      
                            })
                            .style("background-color", d => {
                                if (d.total_counts === 0) return "transparent"
                                if (conceptNames.includes(d.name)) {
                                    if (d.data.concept.standard_concept) {return d.color} 
                                    else {return "transparent"}
                                }
                                else return '#d6d6d6'
                            }) 
                            .style('border', d => d.total_counts === 0 ? '1px solid #b2b2b2' : conceptNames.includes(d.name) ? `1px solid ${d.color}` : '1px solid #d6d6d6')
                            .on('mouseover',(e,d) => setHovered([d.name]))
                            .on('mouseout', (e,d) => setHovered([]))
                        update.select('.map-list-title-right')
                            .on('mouseover',(e,d) => {
                                    d3.select('#list-icons-'+d.name).transition(1000).style('max-width','36px').style('opacity',1)
                            })
                            .on('mouseout', (e,d) => {
                                
                                if (!showConfirmation) d3.select('#list-icons-'+d.name).transition(1000).style('max-width','0px').style('opacity',0)
                            })
                        update.select('.map-list-eye')
                            .attr("src", d => conceptNames.includes(d.name) ? openedEye : closedEye)
                            .style('opacity', d => conceptNames.includes(d.name) ? 1 : 0.3)
                            .style('display', d => d.total_counts === 0 ? 'none' : 'inline-block')
                            .on('mouseover', (e, d) => {
                                if (!conceptNames.includes(d.name)) d3.select('#list-eye-'+d.name).transition().style('opacity',1)
                                const el = e.currentTarget
                                el.__hoverTimeout__ = setTimeout(() => {
                                    showActionLabel(
                                        conceptNames.includes(d.name) 
                                            ? 'Hide concept'
                                            : 'Show concept',
                                        'enter',
                                        e
                                    )
                                }, 1200)
                            })
                            .on('mouseout', (e,d) => {
                                if (!conceptNames.includes(d.name)) d3.select('#list-eye-'+d.name).transition().style('opacity',0.2)
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave',e)
                            })
                            .on('click',(e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave')
                                if (d.total_counts !== 0) {
                                    if (conceptNames.includes(d.name)) {
                                        // if (!nodes.find(n => n.name === d.source.name).mappings.map(m => m.name).filter(map => map !== d.name).some(map => conceptNames.includes(map))) {
                                        //     const newMap = mapRoot.filter(name => name !== d.source.name)
                                        //     setMapRoot(newMap)
                                        // }
                                        const newInclusions = inclusions.filter(e => e !== d.name)
                                        updateConcepts(newInclusions,nodes,[],[d])
                                    } else if (!conceptNames.includes(d.name)){
                                        // if (!mapRoot.includes(d.source.name)) setMapRoot([...mapRoot,d.source.name])
                                        const newInclusions = [...inclusions,d.name]
                                        updateConcepts(newInclusions,nodes,[d],[])
                                    }     
                                } 
                            })
                        update.select('.map-list-search')
                            .on('mouseover', (e, d) => {
                                const el = e.currentTarget
                                el.__hoverTimeout__ = setTimeout(() => {
                                    showActionLabel('Select concept','enter',e)
                                }, 1200)
                            })
                            .on('mouseout', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave',e)
                            })
                            .on('click', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave')
                                showConfirmationPopup(d, 'enter', e)
                            })
                        update.select('.map-list-title-p')
                            .on('mouseover', (e, d) => {
                                const el = e.currentTarget
                                el.__hoverTimeout__ = setTimeout(() => {
                                    showActionLabel('Select concept','enter',e)
                                }, 1200)
                            })
                            .on('mouseout', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave',e)
                            })
                            .on('click', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave')
                                if (!sidebarRoot.name.includes(d.name)) showConfirmationPopup(d, 'enter', e)
                            })
                            .transition()
                            .style('opacity', d => conceptNames.includes(d.name) ? 1 : 0.6)
                        update.select('.map-info-icon')
                            .on('mouseover',(e,d) => d3.select('#info-icon-'+d.name+d.source.name).transition().style('opacity',1))
                            .on('mouseout', (e,d) => {if(d3.select('#info-container-'+d.name+d.source.name).style('height') !== '45px') d3.select('#info-icon-'+d.name+d.source.name).transition().style('opacity',0.2)})
                            .on('click', (e,d) => {
                                if (d3.select('#info-container-'+d.name+d.source.name).style('height') === '45px') {
                                    d3.select('#info-icon-'+d.name+d.source.name).transition().style('opacity',0.2)
                                    d3.select('#info-container-'+d.name+d.source.name).transition().style('opacity',0).style('height','0px').style('padding-top','0px').style('margin','0px 0px 0px 22px')
                                    d3.select('#list-card-'+d.name+d.source.name).transition().style('border-radius','20px')
                                } else {
                                    d3.select('#info-icon-'+d.name+d.source.name).transition().style('opacity',1)
                                    d3.select('#info-container-'+d.name+d.source.name).transition().style('opacity',1).style('height','45px').style('padding-top','4px').style('margin','4px 4px 4px 22px')
                                    d3.select('#list-card-'+d.name+d.source.name).transition().style('border-radius','12px')
                                }
                            })
                        update.select('.map-info-container')
                            .style('border-top', d => conceptNames.includes(d.name) ? '1px solid color-mix(in srgb, #36126d, white 90%)' : '1px solid color-mix(in srgb, #36126d, white 78%)')
                        update.select('.map-counts-RC-p')
                            .style('color', d => conceptNames.includes(d.name) ? '#36126d' : '#808080')
                            .style('font-weight', d => conceptNames.includes(d.name) ? 500 : 400)
                            .html(d => formatThousands(d.total_counts))
                        update.select('.map-counts-RC-label')
                            .style('color', d => conceptNames.includes(d.name) ? '#36126d' : '#808080')
                            .style('font-weight', d => conceptNames.includes(d.name) ? 500 : 400)
                        update.select('.map-counts-RC-bar')
                            .transition()
                            .style('width', d => scaleWidth(d.total_counts) + 'px')
                            .style('background-color', d => conceptNames.includes(d.name) ? d.color : '#e0e0e0')
                        update.select('.map-counts-DRC-p')
                            .style('color', d => conceptNames.includes(d.name) ? '#36126d' : '#808080')
                            .style('font-weight', d => conceptNames.includes(d.name) ? 500 : 400)
                            .html(d => formatThousands(d.descendant_counts))
                        update.select('.map-counts-DRC-label')
                            .style('color', d => conceptNames.includes(d.name) ? '#36126d' : '#808080')
                            .style('font-weight', d => conceptNames.includes(d.name) ? 500 : 400)
                        update.select('.map-counts-DRC-bar')
                            .transition()
                            .style('width', d => scaleWidth(d.descendant_counts) + 'px')
                            .style('background-color', d => conceptNames.includes(d.name) ? d.color : '#e0e0e0')
                    })
                })
                update.select('.list-section-title')
                    .transition()
                    .style('opacity', d => hovered.length > 0 ? 0.2 : 1)
                update.select('.list-section-arrow')
                    .style('transform', d => d.section === 'Root' ? 'rotate('+90+'deg)' : d.section !== 'Parents' ? 'rotate('+180+'deg)' : 'none')
                update.select('.list-level-number')
                    .html(d => d.section === 'Root' ? 'Level 1' : d.section)
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

        // filter dropdowns 
        useEffect(()=>{
            if (nodes.length > 0) {
                // levels
                const levels = Array.from({ length: fullTreeMax }, (_, i) => i + 1)
                d3.select('#dropdown-levels').selectAll('.level').data(levels, d => d)
                    .join(enter => {
                        enter.append('p')
                            .classed('level btn',true)
                            .attr('id', d => 'level-'+d)
                            .style('font-weight', d => maxLevel === d ? 500 : 400)
                            .style('width','100%')
                            .style('text-align','center')
                            .style('color', d => maxLevel === d  ? '#36126d' : '#b2b2b2')
                            .on('mouseover', (e,d) => d3.select('#level-'+d).style('color', '#36126d').style('font-weight',500))
                            .on('mouseout', (e,d) => d3.select('#level-'+d).style('color', d => maxLevel === d ? '#36126d' : '#b2b2b2').style('font-weight',() => maxLevel === d ? 500 : 400))
                            .on('click',(e,d) => {
                                if (levelFilter !== d) {
                                    if (initialPrune) setInitialPrune(false)
                                    setLevelFilter(d)
                                    d3.select('#open-levels').style('display', 'block')
                                    d3.select('#close-levels').style('display', 'none')  
                                    d3.select('#dropdown-levels').style('visibility','hidden') 
                                    d3.select('#header-levels').classed('filterActive', d < fullTreeMax ? true : false)
                                } 
                            })
                            .html(d => d)
                    },update =>{
                        update
                            .style('font-weight', d => maxLevel === d ? 500 : 400)
                            .style('color', d => maxLevel === d  ? '#36126d' : '#b2b2b2')
                            .on('mouseover', (e,d) => d3.select('#level-'+d).style('color', '#36126d').style('font-weight',500))
                            .on('mouseout', (e,d) => d3.select('#level-'+d).style('color', d => maxLevel === d ? '#36126d' : '#b2b2b2').style('font-weight',() => maxLevel === d ? 500 : 400))
                            .on('click',(e,d) => {
                                if (levelFilter !== d) {
                                    if (initialPrune) setInitialPrune(false)
                                    setLevelFilter(d)
                                    d3.select('#open-levels').style('display', 'block')
                                    d3.select('#close-levels').style('display', 'none')  
                                    d3.select('#dropdown-levels').style('visibility','hidden') 
                                    d3.select('#header-levels').classed('filterActive', d < fullTreeMax ? true : false)  
                                } 
                            })
                            .html(d => d)
                    })

                // classes
                document.getElementById("header-classes").style.maxWidth = document.getElementById("sidebar-filters").clientWidth - document.getElementById('levels-container').clientWidth - document.getElementById('classes-label-container').clientWidth - 50 + 'px'
                d3.select('#dropdown-classes').selectAll('.class').data(fullClassList, d => d)
                    .join(enter => {
                        const container = enter.append('div')
                            .classed('class flex',true)  
                            .style('opacity', d => allClasses.includes(d) ? 1 : 0.2) 
                        container.append('div') 
                            .classed('class-check-box checkBox',true)
                            .attr('id', d => 'check-box-'+d.replace(/\s+/g, ""))
                            .style('background-color', d => classFilter.includes(d) || classFilter.includes('All') ? '#36125d' : 'transparent')
                            .style('border', d => classFilter.includes(d) || classFilter.includes('All') ? '1px solid #36125d' : '1px solid #d6d6d6')
                            .on('click', (e,d) => {
                                let newFilter = []
                                if (classFilter.includes('All')) {
                                    if (allClasses.length > 1) {
                                        newFilter = allClasses.filter(c => c !== d)
                                        let newRemoved = removedClasses
                                        newRemoved.push(d)
                                        setRemovedClasses(newRemoved)
                                        setClassFilter(newFilter)
                                    } 
                                }
                                else if (!classFilter.includes(d)) {
                                    newFilter = [...classFilter,d]
                                    const newRemoved = removedClasses.filter(c => c !== d)
                                    setRemovedClasses(newRemoved)
                                    setClassFilter(newFilter)
                                }
                                else {
                                    if (classFilter.length > 1) {
                                        newFilter = classFilter.filter(c => c !== d)  
                                        let newRemoved = removedClasses
                                        newRemoved.push(d)
                                        setRemovedClasses(newRemoved)
                                        setClassFilter(newFilter)
                                        if (newFilter.length === 0) {
                                            d3.select('#open-classes').style('display', 'block')
                                            d3.select('#close-classes').style('display', 'none') 
                                            d3.select('#dropdown-classes').style('visibility','hidden')    
                                        }    
                                    } 
                                }
                            })
                        container.append('p')
                            .classed('class-p',true)
                            .attr('id', d => 'class-'+d.replace(/\s+/g, ""))
                            .style('font-weight', d => classFilter.includes(d) || classFilter.includes('All') ? 500 : 400)
                            .style('color', d => classFilter.includes(d) || classFilter.includes('All') ? '#36125d' : '#b2b2b2')
                            .html(d => d)
                    },update =>{
                        update 
                            .style('opacity', d => allClasses.includes(d) ? 1 : 0.2) 
                        update.select('.class-check-box')
                            .style('background-color', d => classFilter.includes(d) || classFilter.includes('All') ? '#36125d' : 'transparent')
                            .style('border', d => classFilter.includes(d) || classFilter.includes('All') ? '1px solid #36125d' : '1px solid #d6d6d6')
                            .on('click', (e,d) => {
                                let newFilter = []
                                if (classFilter.includes('All')) {
                                    if (allClasses.length > 1) {
                                        newFilter = allClasses.filter(c => c !== d)
                                        let newRemoved = removedClasses
                                        newRemoved.push(d)
                                        setRemovedClasses(newRemoved)
                                        setClassFilter(newFilter)
                                    } 
                                }
                                else if (!classFilter.includes(d)) {
                                    newFilter = [...classFilter,d]
                                    const newRemoved = removedClasses.filter(c => c !== d)
                                    setRemovedClasses(newRemoved)
                                    setClassFilter(newFilter)
                                }
                                else {
                                    if (classFilter.length > 1) {
                                        newFilter = classFilter.filter(c => c !== d)  
                                        let newRemoved = removedClasses
                                        newRemoved.push(d)
                                        setRemovedClasses(newRemoved)
                                        setClassFilter(newFilter)
                                        if (newFilter.length === 0) {
                                            d3.select('#open-classes').style('display', 'block')
                                            d3.select('#close-classes').style('display', 'none') 
                                            d3.select('#dropdown-classes').style('visibility','hidden')    
                                        }    
                                    } 
                                }
                            })
                        update.select('.class-p')
                            .style('font-weight', d => classFilter.includes(d) || classFilter.includes('All') ? 500 : 400)
                            .style('color', d => classFilter.includes(d) || classFilter.includes('All') ? '#36125d' : '#b2b2b2')
                            .html(d => d)
                    })
                let classSelections = classFilter
                if (fullClassList.every(c => classSelections.includes(c))) classSelections = ['All']
                d3.select('#header-classes').classed('dropdownHeader-flexPadding',!classSelections.includes('All') ? true : false)
                const selections = d3.select('#class-selections')
                    .selectAll('.class-selection')
                    .data(classSelections, d => d)
                const merged = selections.join(
                    enter => {
                        const div = enter.append('div')
                            .classed('class-selection flex',true)
                            .classed('dropdownTitleEl', () => !classSelections.includes('All') ? true : false)
                            .classed('filterActive', () => !classSelections.includes('All') ? true : false)
                            .style('pointer-events', () => !classSelections.includes('All') ? 'all' : 'none')
                        div.append('p')
                            .html(d => d)
                        div.append('i')
                            .classed('fa-solid fa-x icon',true)
                            .style('display', () => !classSelections.includes('All') ? 'block' : 'none')
                        return div
                    },
                    update => update,
                    exit => exit.remove()
                )
                merged
                    .on('click', (e, d) => {
                        let classes = classFilter.filter(c => c !== d) 
                        if (classes.length === 0) classes = ['All']
                        let newRemoved = removedClasses
                        newRemoved.push(d)
                        setRemovedClasses(newRemoved)
                        setClassFilter(classes)
                        // if (newFilter.length === 0) {
                        //     d3.select('#open-classes').style('display', 'block')
                        //     d3.select('#close-classes').style('display', 'none') 
                        //     d3.select('#dropdown-classes').style('visibility','hidden')    
                        // }    
                    })
                document.getElementById("header-classes").style.minWidth =  document.getElementById('dropdown-classes').clientWidth - 12 + 'px'
            }
        },[maxLevel,classFilter,allClasses,graphSectionWidth])

        // call draw functions
        useEffect(()=>{
            if (nodes && nodes.length > 0) {
                if (view === 'tree') {
                    let width = d3.select("#tree-container").node().getBoundingClientRect().width + margin*2;
                    let height = d3.select("#tree-container").node().getBoundingClientRect().height + margin*2;
                    d3.select("#tree")
                        .attr('width', '100%')
                        .attr('height', '100%')
                        .attr('viewBox', `${margin} ${margin} ${width} ${height}`)
                        .call(d3.zoom().on("start",()=>d3.select("#tree-graphics").style("pointer-events", "none")).on("zoom", zoomed)).on("end",()=>d3.select("#tree-graphics").style("pointer-events", "all"))
                    d3.select('#tree-container').style('display','block')
                    d3.select('#set-container').style('display','none')
                    d3.select('#list-container').style('display','none')
                    drawTree()
                }
                if (view === 'list') {
                    d3.select('#list-container').style('display','block')
                    d3.select('#set-container').style('display','none')
                    d3.select('#tree-container').style('display','none')
                    drawList()    
                }
                if (view === 'set') {
                    d3.select('#set-container').style('display','block')
                    d3.select('#tree-container').style('display','none')
                    d3.select('#list-container').style('display','none')
                    drawSet()     
                }    
            }
        },[nodes,conceptNames,view,hovered,mapRoot])
        //,conceptNames.length < 50 ? hovered : null

        // reset zoom 
        useEffect(()=>{
            setTimeout(() => {
                zoomToFit()
            }, 500)
        },[nodes,relationship,graphSectionWidth])

        useEffect(() => {
            const sum = getCounts(sidebarRoot.data.stratified_code_counts.filter(c => inclusions.includes(c.concept_id)),'node_record_counts')
            d3.select('#set-total-counts').html(sum)      
        },[inclusions])

        return (
            <div id = "sidebar">
                <div id = "drag-bar"></div>
                <div id = "confirmation-popup" className = 'toolTip dropShadow' style = {{opacity: showConfirmation ? 1 : 0, pointerEvents: showConfirmation ? 'all' : 'none'}}
                    onMouseEnter={() => {clearHideTimer()}}
                    onMouseLeave={() => {setShowConfirmation(false)}}>
                    <div className = 'selectedText' style = {{paddingBottom:6}}>Select concept</div>
                    <div className = 'btn greyBtn' id = "confirmation-btn">Confirm</div>  
                </div>
                <div className = "selectionsContainer">
                    <div className = "filters" id = "sidebar-filters">
                        <div className="filterContainer" id = 'levels-container'>
                            <p className = 'filterLabel' style = {{fontWeight: levelFilter < fullTreeMax ? 500 : 400}}>Max Level</p>
                            <FontAwesomeIcon style = {{display: levelFilter < fullTreeMax ? 'block' : 'none'}} className = "resetFilter fa-solid icon" id = "reset-levels" icon={faX} 
                                onClick = {() => {
                                    setLevelFilter(fullTreeMax)
                                    d3.select('#open-levels').style('display', 'block')
                                    d3.select('#close-levels').style('display', 'none') 
                                    d3.select('#dropdown-levels').style('visibility','hidden')
                                    d3.select('#header-levels').classed('filterActive', false) 
                                }}
                            />
                            <div className = 'dropdownContainer'>
                                <div className = "dropdownHeader btn filterMargin" id = "header-levels" style = {{overflow:'hidden'}}
                                    onClick = {() => {
                                        if (d3.select('#open-levels').style('display') === 'block') {
                                            d3.select('#open-levels').style('display', 'none')
                                            d3.select('#close-levels').style('display', 'block') 
                                            d3.select('#dropdown-levels').style('visibility','visible')
                                        } else {
                                            d3.select('#open-levels').style('display', 'block')
                                            d3.select('#close-levels').style('display', 'none')  
                                            d3.select('#dropdown-levels').style('visibility','hidden')
                                        }
                                    }}>
                                    <p className = 'dropdownTitle'>{maxLevel}</p>
                                    <FontAwesomeIcon className = "dropBtn icon" id = 'open-levels' icon={faCaretDown} style = {{display:'block'}}/>
                                    <FontAwesomeIcon className = "dropBtn icon" id = 'close-levels' icon={faCaretUp} style = {{display:'none'}}/>     
                                </div>   
                                <div className = "dropdownContent dropShadow" id = "dropdown-levels" style = {{width:12}}></div> 
                            </div>
                                
                        </div>
                        <div className="filterContainer" id = 'classes-container' style = {{borderRight:'none'}}>
                            <div className='flex' id = 'classes-label-container'>
                                <p className = 'filterLabel' style = {{fontWeight: classFilter && (classFilter.includes('All') || fullClassList.every(c => classFilter.includes(c))) ? 400 : 500}}>Classes</p>
                                <FontAwesomeIcon style = {{display: classFilter && (classFilter.includes('All') || fullClassList.every(c => classFilter.includes(c))) ? 'none' : 'block'}} className = "resetFilter fa-solid icon" id = "reset-classes" icon={faX} 
                                    onClick = {() => {
                                        setClassFilter(fullClassList)
                                        d3.select('#open-classes').style('display', 'block')
                                        d3.select('#close-classes').style('display', 'none') 
                                        d3.select('#dropdown-classes').style('visibility','hidden')
                                        d3.select('#header-classes').classed('filterActive', false) 
                                    }}
                                />    
                            </div>
                            <div className = 'dropdownContainer'>
                                <div className = "dropdownHeader btn filterMargin" id = "header-classes" 
                                    onClick = {() => {
                                        if (d3.select('#open-classes').style('display') === 'block') {
                                            d3.select('#open-classes').style('display', 'none')
                                            d3.select('#close-classes').style('display', 'block') 
                                            d3.select('#dropdown-classes').style('visibility','visible')
                                        } else {
                                            d3.select('#open-classes').style('display', 'block')
                                            d3.select('#close-classes').style('display', 'none')  
                                            d3.select('#dropdown-classes').style('visibility','hidden')
                                        }
                                    }}>
                                    <div className = "dropdownTitle dropdownTitleScrollable" id = 'class-selections'></div>
                                    <FontAwesomeIcon className = "dropBtn icon" id = 'open-classes' icon={faCaretDown} style = {{display:'block'}}/>
                                    <FontAwesomeIcon className = "dropBtn icon" id = 'close-classes' icon={faCaretUp} style = {{display:'none'}}/>     
                                </div>   
                                <div className = "dropdownContent dropShadow" id = "dropdown-classes"></div> 
                            </div>   
                        </div>
                    </div>           
                </div>
                <div id = "sidebar-content">
                    <div className='flex margin' style = {{width:'calc(100% - 0.75em - 0.75em)',justifyContent:'space-between'}}>
                        <div className = 'toggle' id = "view-toggle">
                            <div className = 'mainBtn slider' id='slider-view' style = {{left:5}}>''</div>

                            <div className = 'btn toggle-itm' id = "list-toggle" onClick={() => {setView('list');moveSlider(0,100,'view')}} style = {{fontWeight:view === 'list' ? 500 : 400,color:view === 'list' ? '#6a23d6' : '#b2b2b2'}}>List</div>
                            <div className = 'btn toggle-itm' id = "set-toggle" onClick={() => {setView('set');moveSlider(1,100,'view')}} style = {{fontWeight:view === 'set' ? 500 : 400,color:view === 'set' ? '#6a23d6' : '#b2b2b2'}}>Concept Set</div>
                            <div className = 'btn toggle-itm' id = "tree-toggle" onClick={() => {setView('tree');moveSlider(2,100,'view')}} style = {{fontWeight:view === 'tree' ? 500 : 400,color:view === 'tree' ? '#6a23d6' : '#b2b2b2'}}>Hierarchy</div>
                        </div> 
                        <div>
                            <FontAwesomeIcon style = {{display:'block'}} icon={faExpand} id = "expand" className = "fa-thin icon expand-compress" onClick={handleExpand} />
                            <FontAwesomeIcon style = {{display:'none'}} icon={faCompress} id = "compress" className = "fa-thin icon expand-compress" onClick={handleExpand} /> 
                        </div>  
                    </div>
                    
                    <div className = 'sidebarContainer' id = "list-container" style = {{display: view === 'List' ? 'block' : 'none'}}></div>
                    <div className = 'sidebarContainer margin' id = "set-container" style = {{display: view === 'Set' ? 'block' : 'none'}}>
                        <div id = "set-header">
                            <p style = {{marginLeft:13}}>CONCEPT</p>
                            <p style = {{position:'absolute',right:212}}>SELECTIONS</p>
                            <p style = {{marginRight:10}}>COUNTS</p>
                        </div>
                    </div>
                    <div id = "set-total" style = {{display: view === 'Set' ? 'flex' : 'none'}}>
                        <p style = {{fontWeight:500,marginLeft:20}}>Total counts</p>
                        <p id = "set-total-counts" style = {{marginRight:20}}></p>
                    </div>
                    <div id = "tree-container" style = {{display: view === 'Tree' ? 'block' : 'none'}}>  
                        <svg id = "tree">
                            <g id = "tree-graphics">
                                <g id = "key"></g>
                                <g id = "links"></g>
                                <g id = "nodes"></g>    
                            </g>
                        </svg>    
                    </div>
                </div>
            </div>     
        )
    }

    export default SideBar;