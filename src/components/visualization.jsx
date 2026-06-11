import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import GraphSection from './visualization/graphSection';
import SideBar from './visualization/sideBar'
import graphIconWhite from '../img/graph-icon-white.svg'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
 import { faX } from '@fortawesome/free-solid-svg-icons'
import rootIcon from '../img/root-icon.svg'
import * as d3 from "d3";
import po from '../po.js';

function Visualization (props) {
    const navigate = useNavigate()
    const color = props.color
    // const setRoot = props.setRoot
    const generateColor = props.generateColor
    const getCounts = props.getCounts
    // const getValidity = props.getValidity
    const selectedConcepts = props.selectedConcepts
    const setSelectedConcepts = props.setSelectedConcepts
    const sidebarRoot = props.sidebarRoot
    const setSidebarRoot = props.setSidebarRoot
    const graphFilter = props.graphFilter
    const setGraphFilter = props.setGraphFilter
    const extent = props.extent
    const setExtent = props.setExtent
    const setRootData = props.setRootData
    const stackData = props.stackData
    const conceptNames = props.conceptNames
    const view = props.view
    const setView = props.setView
    const mapRoot = props.mapRoot
    const setMapRoot = props.setMapRoot
    const nodes = props.nodes
    const links = props.links
    const setNodes = props.setNodes
    const setLinks = props.setLinks
    const list = props.list
    const rootLine = props.rootLine
    const treeSelections = props.treeSelections
    const setTreeSelections = props.setTreeSelections
    const levelFilter = props.levelFilter
    const setLevelFilter = props.setLevelFilter
    const maxLevel = props.maxLevel
    const fullTreeMax = props.fullTreeMax
    const allClasses = props.allClasses
    const classFilter = props.classFilter
    const setClassFilter = props.setClassFilter
    const ageData = props.ageData
    const genderData = props.genderData
    const maxGender = props.maxGender
    // const getConceptInfo = props.getConceptInfo
    const openFilters = props.openFilters
    const setOpenFilters = props.setOpenFilters
    const pruned = props.pruned
    const setPruned = props.setPruned
    const setLoading = props.setLoading
    const poset = props.poset
    const setPoset = props.setPoset
    const fullTree = props.fullTree
    const crossConnections = props.crossConnections
    const rootExtent = props.rootExtent
    const filteredCounts = props.filteredCounts
    const drawingComplete = props.drawingComplete
    const setDrawingComplete = props.setDrawingComplete
    const initialPrune = props.initialPrune
    const setInitialPrune = props.setInitialPrune
    const visible = props.visible
    const setVisible = props.setVisible
    const removedClasses = props.removedClasses
    const setRemovedClasses = props.setRemovedClasses
    const hovered = props.hovered
    const setHovered = props.setHovered
    const colorList = props.colorList
    const fullClassList = props.fullClassList
    const descendantsFilter = props.descendantsFilter
    const setDescendantsFilter = props.setDescendantsFilter
    const excludeList = props.excludeList
    const setExcludeList = props.setExcludeList
    const annotations = props.annotations
    const centers = props.centers
    const setCenters = props.setCenters
    const inclusions = props.inclusions
    const setInclusions = props.setInclusions
    const getAllDescendants = props.getAllDescendants
    const linearLayout = props.linearLayout
    // const linearLayoutTree = props.linearLayoutTree
    const getInclusions = props.getInclusions
    const maxDistance = props.maxDistance
    const setMaxDistance = props.setMaxDistance
    const subspaces = props.subspaces
    const spaceSubspaces = props.spaceSubspaces
    const sourceData = props.sourceData
    const [showRootLine, setShowRootLine] = useState(true)
    const [zoomed, setZoomed] = useState(false)
    const [biDirectional, setBiDirectional] = useState()
    const [graphSectionWidth, setGraphSectionWidth] = useState('60vw')
    const edges = props.edges
    const setEdges = props.setEdges
    const hoverTimeout = useRef(null)
    const hideTimeout = useRef(null)

    // tooltip
    function tooltipHover(d, mode, event) {
        let concept_info = d.data.concept
        if (mode === "enter") {
            showTooltip()
            d3.select("#tooltip")
                .style('left', function() {
                    if (event.x + 270 > window.innerWidth) {
                        return (event.x - 270 + 'px')
                    }   
                    else return (event.x + 10 + 'px')    
                })
                .style('top', function() {
                    if (event.y + 150 > window.innerHeight) return (event.y - 110 + 'px')    
                    else return (event.y + 10 + 'px')
                })
            d3.select('#tooltip-root')  
                .style('display', () => sidebarRoot.name.includes(d.name) ? 'none' : 'block') 
                .on('mouseover', () => d3.select('#tooltip-root').style('opacity',1))
                .on('mouseout', () => d3.select('#tooltip-root').style('opacity',0.5))
                .on('click', () => {
                    if (!sidebarRoot.name.includes(d.name)) { 
                        setLoading(true) 
                        navigate(`/${d.name}`)
                        setHovered([])
                        setVisible(false) 
                    }
                })   
            d3.select('#tooltip-RC').html(concept_info.record_counts + ' RC')
            // .style('font-weight', () => !d.leaf || sidebarRoot.name.includes(d.name) ? 700 : 400)
            d3.select('#tooltip-DRC').html(concept_info.descendant_record_counts + ' DRC')
            // .style('font-weight', () => d.leaf || sidebarRoot.name.includes(d.name) ? 700 : 400)
            d3.select('#counts-btn-circle')
                .style('display', (concept_info.record_counts === 0 && !d.leaf) || d.levels === "-1" ? 'none' : 'flex')
                .on('mouseover', () => {
                    if (!conceptNames.includes(d.name)) {
                        d3.select("#tooltip-plus").style('color', 'white')
                        d3.select('#counts-btn-circle').style('border', '1px solid '+colorList[d.name]).style('background-color', () => colorList[d.name])
                    }
                    else {
                        d3.select("#tooltip-x").style('display', 'block').style('opacity',1)
                        d3.select("#graph-icon-white").style('display', 'none').style('opacity',0) 
                    }    
                })
                .on('mouseout', () => {
                    d3.select("#tooltip-x").style('display', 'none').style('opacity',0) 
                    d3.select("#graph-icon-white").style('display', () => conceptNames.includes(d.name) ? 'block' : 'none').style('opacity', () => conceptNames.includes(d.name) ? 1 : 0)
                    d3.select('#tooltip-plus').style('color',color.text).style('display', () => conceptNames.includes(d.name) ? 'none' : 'block').style('opacity', () => conceptNames.includes(d.name) ? 0 : 1)
                    d3.select('#counts-btn-circle').style('background-color', () => conceptNames.includes(d.name) ? colorList[d.name] : 'transparent').style('border', () => conceptNames.includes(d.name) ? '1px solid '+colorList[d.name] : '1px solid var(--textlight)')
                })
                .on('click', () => {
                    if (d.total_counts !== 0 || d.leaf) {
                        if (conceptNames.includes(d.name)) {
                            const newInclusions = inclusions.filter(e => e !== d.name)
                            updateConcepts(newInclusions,nodes,[],[d])
                        } else if (!conceptNames.includes(d.name)){
                            const newInclusions = [...inclusions,d.name]
                            updateConcepts(newInclusions,nodes,[d],[])
                        }     
                    }
                    setVisible(false)
                })
                .style('background-color', () => conceptNames.includes(d.name) ? colorList[d.name] : 'transparent')
                .style('border', () => conceptNames.includes(d.name) ? '1px solid '+colorList[d.name] : '1px solid var(--textlight)')
            d3.select("#graph-icon-white")
                .style('display', () => conceptNames.includes(d.name) ? 'block' : 'none')
                .style('opacity', () => conceptNames.includes(d.name) ? 1 : 0)
            d3.select("#tooltip-plus")
                .style('display', () => conceptNames.includes(d.name) ? 'none' : 'block')
                .style('opacity', () => conceptNames.includes(d.name) ? 0 : 1)
            d3.select("#tooltip-title")
                .html(concept_info.concept_name)
                .style('display', 'block')
            d3.select("#tooltip-content").select("#tooltip-id")
                .selectAll("span")
                .html(d.name)
            d3.select("#tooltip-content").select("#tooltip-code")
                .selectAll("span")
                .html(concept_info.concept_code)
            d3.select("#tooltip-content").select("#tooltip-type")
                .selectAll("span")
                .html(concept_info.standard_concept ? "Standard" : "Non standard")
            d3.select("#concept-type-tooltip")
                .style("border-style", () => concept_info.standard_concept ? 'solid' : 'dashed')
                .style("color", 'black')
            d3.select("#tooltip-content").select("#tooltip-vocabulary")
                .selectAll("span")
                .html(concept_info.vocabulary_id)
            d3.select("#tooltip-content").select("#tooltip-domain")
                .selectAll("span")
                .html(concept_info.domain_id)
            d3.select("#tooltip-content").select("#tooltip-class")
                .selectAll("span")
                .html(concept_info.concept_class_id)
            // d3.select("#tooltip-content").select("#tooltip-validity")
            //     .selectAll("p")
            //     .html(() => {
            //         let validEndDate = concept_info.valid_end_date
            //         return getValidity(validEndDate)
            //     })
        } else {
            if (hoverTimeout.current) clearTimeout(hoverTimeout.current)
            hideTooltip()
        }
    }
    // add concepts to graph 
    function updateConcepts(inclusionList,nodeList,toAdd,toRemove) {
        let newNodes = nodeList
            .map(e => ({
                ...e,
                included_descendants: [...e.descendants.filter(d => inclusionList.includes(d)),...e.descendants.map(d => fullTree.nodes.find(n => n.name === d).mappings.map(m => m.name)).flat().filter(d => inclusionList.includes(d))]
            }))
            .map(e => ({
                ...e,
                descendant_code_counts:sidebarRoot.data.stratified_code_counts.filter(c => e.included_descendants.includes(c.concept_id)),
                // *** use a maxDistance variable instead of levelFilter? ***
                leaf: e.included_descendants.filter(d => d !== e.name  && !e.mappings.map(m => m.name).includes(d)).length > 0 && ((e.distance === maxDistance && !links.map(d => d.source).map(d => d.name).includes(e.name)) && e.levels !== '-1') ? true : false}
            ))
            .map(e => ({...e,descendant_counts:getCounts(e.descendant_code_counts,'node_record_counts')}))
        let newConnections = crossConnections
            .filter(c => inclusionList.includes(c.child) || fullTree.nodes.find(n => n.name === c.child).mappings.map(m => m.name).some(item => inclusionList.includes(item)))
            .map(d => ({...d,parents:d.parents.filter(p => newNodes.map(d => d.name).includes(p)).filter(p => newNodes.filter(d => d.name === p)[0]?.leaf)}))
        newConnections = newConnections.filter(d => d.parents.length > 1)
        newNodes = newNodes.map(e => ({...e,connections: newConnections.filter(c => c.parents.includes(e.name)).map(d => ({...d,source:e.name}))}))
        const updatedSelections = newNodes
            .filter(d => !d.leaf ? inclusionList.includes(d.name) : d)
            .map(d => ({name: d.name, leaf: d.leaf, descendants: d.descendants, distance: d.distance, data: !d.leaf ? d.data : {...d.data,descendant_code_counts:d.descendant_code_counts}})) 
        const mapSelections = newNodes.map(d => d.mappings).flat()
            .filter(d => inclusionList.includes(d.name) && !newNodes.find(n => n.name === d.source.name).leaf)
            .map(d => ({name: d.name, leaf: false, distance: d.distance, data: d.data}))
        let newSelections = [...updatedSelections,...mapSelections]
        if (toAdd.length > 0) {
            toAdd = toAdd.map(d => d.source ? ({name: d.name, leaf: false, distance: d.distance, data: d.data}) : ({name: d.name, leaf: d.leaf, descendants: d.descendants, distance: d.distance, data: d.data}))
            newSelections = [...newSelections.filter(d => !toAdd.map(e => e.name).includes(d.name)),...toAdd]
        }
        if (toRemove.length > 0) {
            newSelections = newSelections.filter(d => !toRemove.map(e => e.name).includes(d.name))
        } 
        newSelections.sort((a,b) => d3.ascending(a.distance, b.distance))
        let isPruned = false
        newNodes.filter(d => d.leaf).forEach(d => d.children.length > 0 ? isPruned = true : null)
        setPruned(isPruned)
        setSelectedConcepts(newSelections)
        setInclusions(inclusionList)
        setNodes(newNodes)
    }
    function getConceptInfo(id) {
        return sidebarRoot.data.concepts.filter(d => d.concept_id === id)[0]
    }
    // tooltip interaction
    const showTooltip = () => {
        if (hideTimeout.current) clearTimeout(hideTimeout.current)
        hoverTimeout.current = setTimeout(() => { 
            setVisible(true)
        }, 400)    
    }
    const hideTooltip = () => {
        hideTimeout.current = setTimeout(() => {  
            setVisible(false)
        }, 200)
    }

    // get midpoint between nodes
    function getMidX(ids,nodeList) {
        let xPositions = []
        ids.forEach(id => xPositions.push(nodeList.filter(d => d.name === id)[0].x))
        const midX = d3.sum(xPositions)/xPositions.length
        return midX
    }
    
    // filter tree data
    // *** optimize this *** 
    useEffect(()=>{
        if (fullTree.nodes) {
            // filter nodes and links
            let filteredNodes = fullTree.nodes
                .filter(d => levelFilter === undefined || d.distance <= levelFilter)
                .filter(d => classFilter.includes('All') ? d : d.class ? classFilter.includes(d.class) : d)
            let filteredLinks = fullTree.links
                .filter(d => filteredNodes.map(d => d.name).includes(d.source.name) && filteredNodes.map(d => d.name).includes(d.target.name))
            // updated poset
            const nodeNames = filteredNodes.map(d => d.name)
            const nodeDistances = filteredNodes.map(d => fullTree.nodes.find(n => n.name === d.name).distance).filter((e,n,l) => l.indexOf(e) === n).sort((a,b)=>a-b)
            const maxD = nodeDistances[nodeDistances.length-1]
            setMaxDistance(maxD)
            let newPoset
            let newEdges

            newEdges = fullTree.edges.filter(d => nodeNames.map(n => n.toString()).includes(d[0]) && nodeNames.map(n => n.toString()).includes(d[1]))
            if (newEdges.length > 1) newEdges = newEdges.filter(d => d[0] !== d[1])
            if (newEdges.length === 0) newEdges = nodeNames.map(n => [n.toString(),n.toString()])
            const newElements = newEdges.flat().filter((e,n,l) => l.indexOf(e) === n)
            // dangling nodes
            let missing = false
            if (nodeNames.length > newElements.length) {
                missing = true
                const missingNodes = nodeNames.map(n => n.toString()).filter(n => !newElements.includes(n))
                const missingEdges = missingNodes.map(n => [n,n])
                newEdges = [...newEdges,...missingEdges]
            }
            const {matrix,nodes} = po.domFromEdges(newEdges)
            newPoset = po.createPoset(matrix,nodes)
            newPoset.enrich()
                .setLayers()
                .feature("node_degree",(node)=>fullTree.poset.featureOf(node,'node_degree'))
            const nWidth = mapRoot.length > 0 ? 300 : 150
            
            const filteredSubspaces = subspaces.map(nodes => nodes.filter(n => newPoset.elements.includes(n)))
            filteredSubspaces.filter(nodes => nodes.length > 0).forEach(nodes => missing ? linearLayout(newPoset,newEdges,nodes,nWidth,fullTree.poset) : linearLayout(newPoset,newEdges,nodes,nWidth))
            spaceSubspaces(newPoset,filteredSubspaces,nWidth)

            filteredNodes = filteredNodes
                .map(e => ({
                    ...e,
                    leaf: (e.distance === maxD && !filteredLinks.map(d => d.source).map(d => d.name).includes(e.name)) && e.levels !== '-1' ? true : false,
                    parents: fullTree.nodes.find(n => n.name === e.name).parents.filter(d => classFilter.includes('All') ? d : classFilter.includes(fullTree.nodes.find(n => n.name === d).class)),
                    children: fullTree.nodes.find(n => n.name === e.name).children.filter(d => classFilter.includes('All') ? d : classFilter.includes(fullTree.nodes.find(n => n.name === d).class)),
                    // *** go back to other way of getting descendants ***
                    descendants: fullTree.nodes.find(n => n.name === e.name).descendants.filter(d => classFilter.includes('All') ? d : classFilter.includes(fullTree.nodes.find(n => n.name === d).class))
                }))
            
            const newInclusions = sidebarRoot.name.map(r => filteredNodes.map(n => n.name).includes(r) ? getInclusions(sidebarRoot.name,fullTree.nodes,r,excludeList,descendantsFilter,filteredNodes.find(n => n.name === r).descendants) : getInclusions(sidebarRoot.name,fullTree.nodes,r,excludeList,descendantsFilter,fullTree.nodes.find(n => n.name === r).descendants.filter(d => classFilter.includes('All') ? d : classFilter.includes(fullTree.nodes.find(n => n.name === d).class)))).flat().filter((e,n,l) => l.indexOf(e) === n)
                .filter(i => fullTree.nodes.find(n => n.name === i).levels !== '-1')
                .map(i => treeSelections.includes('mappings') ? fullTree.nodes.find(n => n.name === i).mappings.map(m => m.name) : i).flat()   
                .filter(i => sidebarRoot.data.concepts.find(c => c.concept_id === i).record_counts !== 0)
            filteredNodes = filteredNodes
                .map(e => ({
                    ...e,
                    included_descendants: [...e.descendants.filter(d => newInclusions.includes(d)),...e.descendants.map(d => fullTree.nodes.find(n => n.name === d).mappings.map(m => m.name)).flat().filter(d => newInclusions.includes(d))]
                }))
                .map(e => ({
                    ...e,
                    descendant_code_counts:sidebarRoot.data.stratified_code_counts.filter(c => e.included_descendants.includes(c.concept_id)),
                    leaf: e.included_descendants.filter(d => d !== e.name && !e.mappings.map(m => m.name).includes(d)).length > 0 && e.leaf ? true : false}
                ))
            // filter connections 
            let filteredConnections = crossConnections
                .filter(c => !filteredNodes.map(d => d.name).includes(c.child))
                .filter(c => classFilter.includes('All') ? c : classFilter.includes(fullTree.nodes.find(n => n.name === c.child).class))
                // .filter(c => newInclusions.includes(c.child) || fullTree.nodes.find(n => n.name === c.child).mappings.map(m => m.name).some(item => newInclusions.includes(item)))
                .map(d => ({...d,parents:d.parents.filter(p => filteredNodes.map(d => d.name).includes(p)).filter(p => filteredNodes.filter(d => d.name === p)[0]?.leaf)}))
            filteredConnections = filteredConnections.filter(d => d.parents.length > 1)
            // filteredNodes = filteredNodes.map(e => ({...e,connections: filteredConnections.filter(c => c.parents.includes(e.name)).map(d => ({...d,source:e.name}))}))
            const updatedSelections = filteredNodes
                .filter(d => !d.leaf ? newInclusions.includes(d.name) : d)
                .map(d => ({name: d.name, leaf: d.leaf, descendants: d.descendants, distance: d.distance, data: !d.leaf ? d.data : {...d.data,descendant_code_counts:d.descendant_code_counts}})) 
            const mapSelections = filteredNodes.map(d => d.mappings).flat()
                .filter(d => newInclusions.includes(d.name) && !filteredNodes.find(n => n.name === d.source.name).leaf)
                .map(d => ({name: d.name, leaf: false, distance: d.distance, data: d.data}))
            const filteredSelected = [...updatedSelections,...mapSelections]
            filteredSelected.sort((a,b) => d3.ascending(a.distance, b.distance))
            setSelectedConcepts(filteredSelected)
            setInclusions(newInclusions)
            if (treeSelections.includes('mappings')) setMapRoot(filteredNodes.filter(n => n.mappings.length > 0).map(n => n.name))
            // update nodes and links
            filteredNodes = filteredNodes
                .map(d => ({...d,descendant_counts:getCounts(d.descendant_code_counts,'node_record_counts'),x:newPoset.elements.includes(d.name.toString()) ? newPoset.featureOf(d.name,"x") : d.x}))
                .map(d => ({...d,mappings:d.mappings.map(m => ({...m,source:d}))}))
            filteredNodes = filteredNodes.map(d => ({...d,connections:filteredConnections.filter(c => c.parents.includes(d.name)).map(e => ({...e,source:d.name,x:d.x,mid:getMidX(e.parents,filteredNodes)}))}))
            filteredLinks = filteredLinks.map(d => ({...d,source:filteredNodes[nodeNames.indexOf(d.source.name)],target:filteredNodes[nodeNames.indexOf(d.target.name)]}))
            // pruned
            let isPruned = false
            filteredNodes.filter(d => d.leaf).forEach(d => d.children.length > 0 ? isPruned = true : null)
            // set states
            setEdges(edges)
            setPoset(newPoset)
            setPruned(isPruned)
            setNodes(filteredNodes)
            setLinks(filteredLinks)  
            if (initialPrune) {
                setTimeout(() => {
                    setInitialPrune(false)
                }, 1000)    
            }
        }    
    }, [classFilter,levelFilter])

    // update extent
    useEffect(()=>{
        if (sidebarRoot && rootExtent) {
            let extent = rootExtent
            let selectedExtent = d3.extent(filteredCounts.all.map(d => d.calendar_year)) 
            if (!selectedExtent[0] || !selectedExtent[1]) setExtent(extent)
            else {
                if (selectedExtent[0] <= rootExtent[0]) extent[0] = selectedExtent[0] 
                else extent[0] = rootExtent[0]
                if (selectedExtent[1] >= rootExtent[1]) extent[1] = selectedExtent[1] 
                else extent[1] = rootExtent[1]
                setExtent(extent) 
            } 
        }   
    },[filteredCounts])

    return ( sidebarRoot !== undefined ? 
        <div id = "visualization-container">
            <div className = "box-shadow" id = "tooltip" style = {{opacity: visible ? 1 : 0, pointerEvents: visible ? 'all' : 'none'}} 
            onMouseEnter={() => {showTooltip()}}
            onMouseLeave={() => {hideTooltip()}}>
                <div id = "tooltip-header">
                    <div id = "tooltip-btn-container">
                        <div className = "tooltip-btn" id = 'tooltip-root' style = {{opacity: 0.5}}><img style = {{width:18}} src={rootIcon} alt="root icon"/></div>
                        <div className = "tooltip-btn" id = "counts-btn-circle">
                            <FontAwesomeIcon style = {{opacity:0,display:'none',color:'var(--text)'}} className = 'tooltip-icon fa-solid fa-plus fa-sm' id = "tooltip-plus" icon={faPlus} />
                            <FontAwesomeIcon style = {{opacity:0,display:'none',color:'white'}} className = 'tooltip-icon fa-solid fa-x fa-xs' id = "tooltip-x" icon={faX} />
                            <img style = {{paddingBottom:1,width:10,opacity:1,display:'block'}} className = 'tooltip-icon' id = "graph-icon-white" src={graphIconWhite} alt="graph icon"/>
                        </div>
                    </div>
                    <div style = {{display:'flex',margin:0}}>
                        <p style = {{fontWeight:700}} id = "tooltip-RC"></p>
                        <p style = {{marginRight:2,marginLeft:2,opacity:0.5}}>|</p>
                        <p style = {{fontWeight:700}} id = "tooltip-DRC"></p>   
                    </div> 
                </div>
                <div id = "tooltip-title"></div>
                <div id = "tooltip-content">
                    <div className='tooltip-content-col'>
                        <p className = "tooltip-content-row" id = "tooltip-id">Id<span></span></p>
                        <p className = "tooltip-content-row" id = "tooltip-code">Code<span></span></p>
                        <p className = "tooltip-content-row" id = "tooltip-type">Type<span className = "concept-type" id = "concept-type-tooltip"></span></p>
                    </div>
                    <div className='tooltip-content-col'>
                        <p className = "tooltip-content-row" id = "tooltip-vocabulary">Vocabulary<span></span></p>
                        <p className = "tooltip-content-row" id = "tooltip-domain">Domain<span></span></p>
                        <p className = "tooltip-content-row" id = "tooltip-class">Class<span></span></p>    
                    </div>
                </div>
            </div>    
            <SideBar
                color = {color}
                selectedConcepts = {selectedConcepts}
                setSelectedConcepts = {setSelectedConcepts}
                sidebarRoot = {sidebarRoot} 
                mapRoot = {mapRoot}
                setMapRoot = {setMapRoot}
                tooltipHover = {tooltipHover}
                // conceptHover = {conceptHover}
                updateConcepts = {updateConcepts}
                conceptNames = {conceptNames}
                view = {view}
                setView = {setView}
                // getValidity = {getValidity}
                nodes = {nodes}
                links = {links}
                list = {list}
                treeSelections = {treeSelections}
                setTreeSelections = {setTreeSelections}
                levelFilter = {levelFilter}
                setLevelFilter = {setLevelFilter}
                maxLevel = {maxLevel}
                fullTreeMax = {fullTreeMax}
                allClasses = {allClasses}
                classFilter = {classFilter}
                setClassFilter = {setClassFilter}
                pruned = {pruned}
                poset = {poset}
                setPoset = {setPoset}
                getConceptInfo = {getConceptInfo}
                setNodes = {setNodes}
                setLinks = {setLinks}
                fullTree = {fullTree}
                biDirectional = {biDirectional}
                drawingComplete = {drawingComplete}
                setDrawingComplete = {setDrawingComplete}
                initialPrune = {initialPrune}
                setInitialPrune = {setInitialPrune}
                hovered = {hovered}
                setHovered = {setHovered}
                removedClasses = {removedClasses}
                setRemovedClasses = {setRemovedClasses}
                graphSectionWidth = {graphSectionWidth}
                setGraphSectionWidth = {setGraphSectionWidth}
                fullClassList = {fullClassList}
                descendantsFilter = {descendantsFilter}
                setDescendantsFilter = {setDescendantsFilter}
                excludeList = {excludeList}
                setExcludeList = {setExcludeList}
                centers = {centers}
                inclusions = {inclusions}
                setInclusions = {setInclusions}
                getInclusions = {getInclusions}
                getCounts = {getCounts}
                setPruned = {setPruned}
                edges = {edges}
                linearLayout = {linearLayout}
                setLoading = {setLoading}
                getMidX = {getMidX}
                maxDistance = {maxDistance}
                subspaces = {subspaces}
                spaceSubspaces = {spaceSubspaces}
            ></SideBar> 
            <GraphSection
                color = {color}
                selectedConcepts = {selectedConcepts}
                setSelectedConcepts = {setSelectedConcepts}
                sidebarRoot = {sidebarRoot}
                tooltipHover = {tooltipHover}
                graphFilter = {graphFilter}
                setGraphFilter = {setGraphFilter}
                // conceptHover = {conceptHover}
                extent = {extent}
                setExtent = {setExtent}
                openFilters = {openFilters}
                setOpenFilters = {setOpenFilters}
                stackData = {stackData}
                conceptNames = {conceptNames}
                generateColor = {generateColor}
                rootLine = {rootLine}
                // setRoot = {setRoot}
                ageData = {ageData}
                genderData = {genderData}
                sourceData = {sourceData}
                maxGender = {maxGender}
                getConceptInfo = {getConceptInfo}
                zoomed = {zoomed}
                setZoomed = {setZoomed}
                hovered = {hovered}
                setHovered = {setHovered}
                graphSectionWidth = {graphSectionWidth}
                colorList = {colorList}
                annotations = {annotations}
                treeSelections = {treeSelections}
                showRootLine = {showRootLine}
                setShowRootLine = {setShowRootLine}
            />  
        </div> : null
    )
}

export default Visualization;