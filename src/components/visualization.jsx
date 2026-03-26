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
    const sendFeedback = props.sendFeedback
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
    const buffers = props.buffers
    const setBuffers = props.setBuffers
    const inclusions = props.inclusions
    const setInclusions = props.setInclusions
    const [zoomed, setZoomed] = useState(false)
    const [biDirectional, setBiDirectional] = useState()
    const [text,setText] = useState('')
    const [graphSectionWidth, setGraphSectionWidth] = useState('60vw')
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
                        navigate(`/${d.name}`)
                        setHovered()
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
        const newNodes = nodeList.map(e => ({...e,descendant_counts:getCounts(sidebarRoot.data.stratified_code_counts.filter(c => e.descendants.filter(d => inclusionList.includes(d)).includes(c.concept_id)),'node_record_counts'),leaf:e.descendants.filter(d => d !== e.name).some(item => inclusionList.includes(item)) && ((e.distance === levelFilter+1 || !links.map(d => d.source).map(d => d.name).includes(e.name)) && e.levels !== '-1')? true : false}))
        const updatedSelections = !treeSelections.includes('mappings') ? 
            newNodes
                .filter(d => !d.leaf ? inclusionList.includes(d.name) : d)
                .map(d => ({name: d.name, leaf: d.leaf, descendants: d.descendants, distance: d.distance, data: {...d.data,descendant_code_counts:sidebarRoot.data.stratified_code_counts.filter(c => d.descendants.filter(d => inclusionList.includes(d)).includes(c.concept_id))}})) : 
            newNodes.filter(d => inclusionList.includes(d.name)).map(d => d.mappings).flat()
                .filter(d => d.total_counts !== 0)
                .map(d => ({name: d.name, leaf: false, distance: d.distance, data: d.data}))
        let newSelections = updatedSelections
        if (toAdd.length > 0) {
            toAdd = toAdd.map(d => d.source ? ({name: d.name, leaf: false, distance: d.distance, data: d.data}) : ({name: d.name, leaf: d.leaf, descendants: d.descendants, distance: d.distance, data: {...d.data,descendant_code_counts:sidebarRoot.data.stratified_code_counts.filter(c => d.descendants.filter(d => inclusionList.includes(d)).includes(c.concept_id))}}))
            newSelections = [...updatedSelections.filter(d => !toAdd.map(e => e.name).includes(d.name)),...toAdd]
        }
        else if (toRemove.length > 0) {
            newSelections = updatedSelections.filter(d => !toRemove.map(e => e.name).includes(d.name))
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

    const handleChange = (e) => {setText(e.target.value)}

    function getInclusions(id,eList,dFilter,descendants,nodeList) {
        // both selected
        if (eList.includes(id) && !dFilter.includes(id)) {
            const rootStillIncluded = descendants.filter(d => sidebarRoot.name.includes(d) && !eList.includes(d))
            return rootStillIncluded
        }
        else {
            // descendants unselected
            if (dFilter.includes(id)) {
                let stillIncluded = sidebarRoot.name.filter(r => r !== id && nodeList.map(n => n.name).includes(r) && (fullTree.nodes.find(n => n.name === r).distance < fullTree.nodes.find(n => n.name === id).distance) && (!eList.includes(r) && !dFilter.includes(r))).map(r => fullTree.nodes.find(n => n.name === r).descendants).flat().filter(d => descendants.includes(d))
                const rootStillIncluded = descendants.filter(d => sidebarRoot.name.includes(d) && !eList.includes(d))
                stillIncluded = [...stillIncluded,...rootStillIncluded]
                // exclude unselected
                if (!eList.includes(id)) {
                    return stillIncluded.includes(id) ? stillIncluded : [...stillIncluded,id]
                } else {
                    return stillIncluded.filter(d => d !== id)
                }
            // descendants selected
            } else {
                let stillExcluded = sidebarRoot.name.filter(r => r !== id && nodeList.map(n => n.name).includes(r) && (fullTree.nodes.find(n => n.name === r).distance < fullTree.nodes.find(n => n.name === id).distance) && ((eList.includes(r) && !dFilter.includes(r)) || dFilter.includes(r))).map(r => fullTree.nodes.find(n => n.name === r).descendants).flat().filter(d => descendants.includes(d) && d !== id)
                const rootExclusions = descendants.filter(d => sidebarRoot.name.includes(d) && eList.includes(d))
                const rootDescendantExclusions = rootExclusions.filter(r => !dFilter.includes(r)).map(r => fullTree.nodes.find(n => n.name === r).descendants.filter(d => d !== r).filter(d => classFilter.includes('All') ? d : classFilter.includes(fullTree.nodes.find(n => n.name === d).class))).flat()
                stillExcluded = [...stillExcluded,...rootExclusions,...rootDescendantExclusions]
                return descendants.filter(d => !stillExcluded.includes(d))
            }
        }
    }
    
    // filter tree data
    useEffect(()=>{
        if (sidebarRoot && !initialPrune) {
            // filter nodes and links
            let filteredNodes = fullTree.nodes
                .filter(d => levelFilter === undefined || d.distance <= levelFilter+1)
                .filter(d => classFilter.includes('All') ? d : d.class ? classFilter.includes(d.class) : d)
            let filteredLinks = fullTree.links
                .filter(d => filteredNodes.map(d => d.name).includes(d.source.name) && filteredNodes.map(d => d.name).includes(d.target.name))
            filteredNodes = filteredNodes
                .map(e => ({
                    ...e,
                    leaf: (e.distance === levelFilter+1 || !filteredLinks.map(d => d.source).map(d => d.name).includes(e.name)) && e.levels !== '-1' ? true : false,
                    parents: e.parents.filter(p => filteredNodes.map(d => d.name).includes(p)),
                    descendants: fullTree.nodes.find(n => n.name === e.name).descendants.filter(d => classFilter.includes('All') ? d : classFilter.includes(fullTree.nodes.find(n => n.name === d).class)),
                    children: e.levels === "-1" ? fullTree.links.filter(d => d.target.name === e.name).map(d => d.source.name) : fullTree.links.filter(d => d.source.name === e.name && d.target.name !== e.name).map(d => d.target.name)
                }))
            // let newInclusions = sidebarRoot.name.map(r => filteredNodes.map(n => n.name).includes(r) ? getInclusions(r,excludeList,descendantsFilter,filteredNodes.find(n => n.name === r).descendants,filteredNodes) : getInclusions(r,excludeList,descendantsFilter,fullTree.nodes.find(n => n.name === r).descendants.filter(d => classFilter.includes('All') ? d : classFilter.includes(fullTree.nodes.find(n => n.name === d).class)),filteredNodes)).flat().filter((e,n,l) => l.indexOf(e) === n)
            //     .filter(d => fullTree.nodes.find(n => n.name === d).total_counts !== 0)
            let newInclusions = inclusions.filter(d => classFilter.includes('All') ? d : fullTree.nodes.find(n => n.name === d).class ? classFilter.includes(fullTree.nodes.find(n => n.name === d).class) : d)
            // if (treeSelections.includes('mappings')) newInclusions = newInclusions.map(d => fullTree.nodes.find(n => n.name === d).mappings.map(m => m.name)).flat()
            // filter connections 
            let filteredConnections = crossConnections
                .filter(c => !filteredNodes.map(d => d.name).includes(c.child) && newInclusions.includes(c.child))
                .filter(c => fullTree.nodes.find(n => n.name === c.child).total_counts !== 0)
                .filter(c => classFilter.includes('All') || classFilter == fullClassList ? c : classFilter.includes(fullTree.nodes.filter(d => d.name === c.child)[0].class))
                .map(d => ({...d,parents:d.parents.filter(p => filteredNodes.map(d => d.name).includes(p)).filter(p => filteredNodes.filter(d => d.name === p)[0]?.leaf)}))
            filteredConnections = filteredConnections.filter(d => d.parents.length > 1)
            filteredNodes = filteredNodes
                .map(e => ({...e,descendant_counts:getCounts(sidebarRoot.data.stratified_code_counts.filter(c => e.descendants.filter(d => newInclusions.includes(d)).includes(c.concept_id)),'node_record_counts'),leaf:e.descendants.filter(d => d !== e.name).some(item => newInclusions.includes(item)) && e.leaf ? true : false,connections: filteredConnections.filter(c => c.parents.includes(e.name)).map(d => ({...d,source:e.name}))}))
            const filteredSelected = !treeSelections.includes('mappings') ? 
                filteredNodes
                    .filter(d => !d.leaf ? newInclusions.includes(d.name) : d)
                    .map(d => ({name: d.name, leaf: d.leaf, descendants: d.descendants, distance: d.distance, data: {...d.data,descendant_code_counts:sidebarRoot.data.stratified_code_counts.filter(c => d.descendants.filter(d => newInclusions.includes(d)).includes(c.concept_id))}})) : 
                filteredNodes.filter(d => newInclusions.includes(d.name)).map(d => d.mappings).flat()
                    .filter(d => d.total_counts !== 0)
                    .map(d => ({name: d.name, leaf: false, distance: d.distance, data: d.data}))
            filteredSelected.sort((a,b) => d3.ascending(a.distance, b.distance))
            setSelectedConcepts(filteredSelected)
            setInclusions(newInclusions)
            // updated poset
            let positions = {}
            const nodeNames = filteredNodes.map(d => d.name)
            const trees = fullTree.trees
            const width = d3.select("#tree").node().getBoundingClientRect().width
            const mappingDirections = filteredNodes.map(d => d.mappings).flat().map(d => d.direction)
            const biDirectionalMapping = mappingDirections.includes(1) && mappingDirections.includes(-1)
            setBiDirectional(biDirectionalMapping)
            const nodeWidth = biDirectional ? 160 : 140
            let bufferArray = [0]
            // iterate through trees
            trees.forEach((tree,index) => {
                const allElements = [...new Set(tree.map(d => ([d.parent_concept_id,d.child_concept_id])).flat())]
                const elements = allElements.filter(e => nodeNames.includes(e))
                let layers = poset[index].layers
                layers = layers.map(layer => layer.filter(e => elements.includes(parseInt(e))))
                // *** set based on width of biggest layer
                const maxLength = d3.max(layers, d => d.length)
                const maxIndex = layers.findIndex(a => a.length === maxLength)
                const multiplier = 1.2 + Math.min(maxLength * 0.01, 1)
                const thisWidth = layers[maxIndex].some(e => mapRoot.includes(parseInt(e))) ? (maxLength/2)*(nodeWidth*multiplier) : (maxLength/2)*nodeWidth
                bufferArray.push(thisWidth)
                let buffer = index === 0 ? buffers[index] : buffers[index] + thisWidth 
                layers.forEach((layer,i) => {
                    const layerInt = layer.map(d => parseInt(d))
                    const mapArrays = filteredNodes.filter(d => mapRoot.includes(d.name)).map(d => d.mappings)
                    const multiBiDirectional = mapArrays.map(array => array.map(d => d.direction)).filter(arr => arr.includes(1) && arr.includes(-1)).length >= 2
                    const nodeWidth = mapRoot.some(element => layerInt.includes(element)) ? multiBiDirectional ? 320 : 240 : biDirectional ? 160 : 140
                    const center = (width/poset.length)/2 + (width)*index + buffer
                    if (i === 0) {
                        let unit = (width/poset.length)/layer.length
                        let adjustment = layer.length % 2 !== 0 ? 0 : nodeWidth/2
                        let median = Math.floor(layer.length/2) 
                        layer.forEach((node,i) => positions[parseInt(node)] = unit >= nodeWidth ? unit*i + unit/2 + (width)*index + buffer : i >= median ? center + ((i - median) * nodeWidth) + adjustment : center - ((median - i) * nodeWidth) + adjustment)
                    } else {
                        let missingParent = false
                        layer.forEach(node => filteredNodes.find(n => n.name === parseInt(node)).parents.length === 0 ? missingParent = true : null)
                        let xPositions = []
                        let unit = (width/poset.length)/layer.length
                        let adjustment = layer.length % 2 !== 0 ? 0 : nodeWidth/2
                        let median = Math.floor(layer.length/2) 
                        if (missingParent) xPositions = fullTree.nodes.filter(d => layer.includes(d.name.toString())).map(d => ({id:d.name.toString(),x:d.x}))
                        else layer.forEach(node => xPositions.push({id:node,x:d3.sum(filteredNodes.find(n => n.name === parseInt(node)).parents.map(parent => positions[parent]))/filteredNodes.find(n => n.name === parseInt(node)).parents.length})) 
                        xPositions.sort((a, b) => d3.ascending(a.x, b.x))
                        let minDistance = d3.min(d3.pairs(xPositions, (a, b) => b.x - a.x))
                        if ((minDistance < nodeWidth && layer.length > 1) || missingParent) {
                            layer.forEach(node => positions[parseInt(node)] = unit >= nodeWidth ? unit*xPositions.findIndex(d => d.id === node) + unit/2 + (width)*index + buffer : xPositions.findIndex(d => d.id === node) >= median ? center + ((xPositions.findIndex(d => d.id === node) - median) * nodeWidth) + adjustment : center - ((median - xPositions.findIndex(d => d.id === node)) * nodeWidth) + adjustment)
                        } else layer.forEach(node => positions[parseInt(node)] = xPositions.find(d => d.id === node)?.x)
                    }
                })
            })
            setBuffers(bufferArray)
            // update nodes and links
            filteredNodes = filteredNodes
                .map(d => ({...d,x:positions[d.name] ? positions[d.name] : d.x}))
                .map(e => ({...e,mappings: e.mappings.map(map => ({...map,distance: e.distance,source: e}))}))
            filteredLinks = filteredLinks.map(d => ({...d,source:filteredNodes[nodeNames.indexOf(d.source.name)],target:filteredNodes[nodeNames.indexOf(d.target.name)]}))
            // pruned
            let isPruned = false
            filteredNodes.filter(d => d.leaf).forEach(d => d.children.length > 0 ? isPruned = true : null)
            // set states
            setPruned(isPruned)
            setNodes(filteredNodes)
            setLinks(filteredLinks)  
        }    
    }, [levelFilter,classFilter])

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
            <div id="overlay">
                <div id="popup">
                    <FontAwesomeIcon className = 'fa-lg' id = "close-feedback" icon={faX} 
                        onClick={() => {
                            d3.select('#overlay').style('display','none')
                            document.getElementById('feedback').value = ''
                        }}
                    />
                    <h2 id = "popup-title">Send Feedback</h2>
                    <h2 id = "feedback-sent" style = {{display:'none'}}>Feedback sent!</h2>
                    <textarea id="feedback" placeholder="Write your feedback..." onChange={handleChange}></textarea>
                    <button id="send-feedback" style = {{border: text.length > 0 ? '1px solid var(--textlight)' : 'none'}}
                        onClick={ async () => {
                            const text = document.getElementById('feedback').value.trim()
                            if (!text) return
                            try {
                                await sendFeedback(text)
                                d3.select('#feedback').style('display','none')
                                d3.select('#send-feedback').style('display','none')
                                d3.select('#close-feedback').style('display','none')
                                d3.select('#popup-title').style('display','none')
                                d3.select('#feedback-sent').style('display','block')
                                setTimeout(() => {
                                    d3.select('#overlay').style('display','none')
                                    document.getElementById('feedback').value = ''
                                }, 1000)
                            } catch (err) {
                                console.error(err)
                            } 
                        }}
                    >Send</button>  
                </div>
            </div>
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
                buffers = {buffers}
                inclusions = {inclusions}
                setInclusions = {setInclusions}
                getInclusions = {getInclusions}
                getCounts = {getCounts}
                setPruned = {setPruned}
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
                maxGender = {maxGender}
                getConceptInfo = {getConceptInfo}
                zoomed = {zoomed}
                setZoomed = {setZoomed}
                hovered = {hovered}
                setHovered = {setHovered}
                graphSectionWidth = {graphSectionWidth}
                colorList = {colorList}
                annotations = {annotations}
            />  
        </div> : null
    )
}

export default Visualization;