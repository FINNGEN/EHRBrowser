import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import GraphSection from './visualization/graphSection';
import SideBar from './visualization/sideBar'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { faX } from '@fortawesome/free-solid-svg-icons'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import openedEye from '../img/opened-eye.svg'
import openedEyeWhite from '../img/opened-eye-white.svg'
import closedEye from '../img/closed-eye.svg'
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
    const relationship = props.relationship
    const setRelationship = props.setRelationship
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
    // const centers = props.centers
    // const setCenters = props.setCenters
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
    const nWidth = props.nWidth
    const countType = props.countType
    const setCountType = props.setCountType
    const moveSlider = props.moveSlider
    const getMidX = props.getMidX
    const showConfirmation = props.showConfirmation
    const setShowConfirmation = props.setShowConfirmation
    const [showRootLine, setShowRootLine] = useState(true)
    const [zoomed, setZoomed] = useState(false)
    const [biDirectional, setBiDirectional] = useState()
    const [graphSectionWidth, setGraphSectionWidth] = useState('60vw')
    const edges = props.edges
    const setEdges = props.setEdges
    const updateConcepts = props.updateConcepts
    const updateWidth = props.updateWidth
    const hoverTimeout = useRef(null)
    const hideTimeout = useRef(null)
    const hideTimer = useRef(null)

    // tooltip
    function tooltipHover(d, mode, event) {
        let concept_info = d.data.concept
        if (mode === "enter") {
            clearHideTimer()
            setVisible(true)
            setShowConfirmation(false)
            d3.select("#tooltip")
                .style('left', function() {
                    const w = document.getElementById('tooltip').clientWidth
                    if (event.x + w > window.innerWidth) return (event.x - w + 'px')
                    else return (event.x + 'px')    
                })
                .style('top', function() {
                    const h = document.getElementById('tooltip').clientHeight
                    if (event.y + h > window.innerHeight) return (event.y - h + 'px')  
                    else return (event.y + 'px')
                })
            
            d3.select('#tooltip-search')
                .style('display', () => sidebarRoot.name.includes(d.name) ? 'none' : 'inline-block') 
                .on('mouseover', (e,i) => {
                    const el = e.currentTarget
                    el.__hoverTimeout__ = setTimeout(() => {
                        showActionLabel('Select concept','enter',e)
                    }, 1200)
                })
                .on('mouseout', (e,i) => {
                    clearTimeout(e.currentTarget.__hoverTimeout__)
                    showActionLabel('','leave',e)
                })
                .on('click', (e,i) => {
                    clearTimeout(e.currentTarget.__hoverTimeout__)
                    showActionLabel('','leave')
                    showConfirmationPopup(d, 'enter', e, true)
                })
            d3.select('#tooltip-eye-closed')
                .style('display', () => !conceptNames.includes(d.name) && (d.total_counts !== 0 || d.leaf) ? 'inline-block' : 'none')
                .on('mouseover', (e,i) => {
                    const el = e.currentTarget
                    el.__hoverTimeout__ = setTimeout(() => {
                        showActionLabel('Show concept','enter',e)
                    }, 1200)
                }) 
                .on('mouseout', (e,i) => {
                    clearTimeout(e.currentTarget.__hoverTimeout__)
                    showActionLabel('','leave',e)
                })
                .on('click', () => {
                    const newInclusions = [...inclusions,d.name]
                    updateConcepts(newInclusions,nodes,[d],[])
                    setVisible(false)
                })     
            d3.select('#tooltip-eye-opened')
                .style('display', () => conceptNames.includes(d.name) ? 'inline-block' : 'none')
                .on('mouseover', (e,i) => {
                    const el = e.currentTarget
                    el.__hoverTimeout__ = setTimeout(() => {
                        showActionLabel('Hide concept','enter',e)
                    }, 1200)
                }) 
                .on('mouseout', (e,i) => {
                    clearTimeout(e.currentTarget.__hoverTimeout__)
                    showActionLabel('','leave',e)
                })
                .on('click', () => {
                    const newInclusions = inclusions.filter(e => e !== d.name)
                    updateConcepts(newInclusions,nodes,[],[d])
                    setVisible(false)
                }) 
            
            d3.select('#tooltip-counts').style('opacity', () => d.leaf ? 0.2 : 1)
            d3.select('#tooltip-desc-counts').style('opacity', () => d.leaf ? 1 : 0.2)
            d3.select('#tooltip-counts-num').html(concept_info.record_counts)
            d3.select('#tooltip-counts-label').html(() => countType === 'record' ? ' RC' : ' PC')
            d3.select('#tooltip-desc-counts-num').html(concept_info.descendant_record_counts)
            d3.select('#tooltip-desc-counts-label').html(() => countType === 'record' ? ' DRC' : ' DPC')
            
            d3.select("#tooltip-title").html(concept_info.concept_name)

            d3.select("#tooltip-id").html(d.name)
            d3.select("#tooltip-code").html(concept_info.concept_code)
            d3.select("#tooltip-type").html(concept_info.standard_concept ? "Standard" : "Non Standard")
            d3.select("#tooltip-vocabulary").html(concept_info.vocabulary_id)
            d3.select("#tooltip-domain").html(concept_info.domain_id)
            d3.select("#tooltip-class").html(concept_info.concept_class_id)
        } else scheduleHide()
    }

    function showConfirmationPopup(d, mode, event = null, fromTooltip = false) {
        if (mode === 'enter') {
            if (!fromTooltip) clearHideTimer()
            setShowConfirmation(true)
            d3.select('#confirmation-btn')
                .on('click', (e,i) => {
                    setShowConfirmation(false)
                    setLoading(true)
                    navigate(`/${d.name}`)
                })
            d3.select('#confirmation-popup')
                .style('left', function() {
                    const w = document.getElementById('confirmation-popup').clientWidth
                    if (event.x + w > window.innerWidth) return (event.x - w - 5 + 'px')
                    else return (event.x + 20 + 'px')    
                })
                .style('top', function() {
                    const h = document.getElementById('confirmation-popup').clientHeight
                    if (event.y - h < 0) return (event.y + 10 + 'px')  
                    else return (event.y + 'px')
                })
            d3.select('#confirmation-name').html(d.data.concept.concept_name)
        } else scheduleHide()
    }

    function showActionLabel(label,mode,event) {
        if (mode === 'enter') {
            d3.select('#action-label')
                .html(label)
                .style('left', function() {
                    const w = document.getElementById('action-label').clientWidth
                    if (event.x + w > window.innerWidth) return (event.x - w - 5 + 'px')
                    else return (event.x + 2 + 'px')    
                })
                .style('top', function() {
                    const h = 22
                    if (event.y - h < 0) return (event.y + 10 + 'px')    
                    else return (event.y - h + 'px')
                })
                .transition().style('opacity',1)
        }
        else d3.select('#action-label').transition().style('opacity',0)
    }

    function getConceptInfo(id) {
        return sidebarRoot.data.concepts.filter(d => d.concept_id === id)[0]
    }

    function formatThousands(num) {
        return Number(num).toLocaleString('de-DE')
    }

    // tooltip interaction
    function clearHideTimer() {
        if (hideTimer.current) {
            clearTimeout(hideTimer.current)
            hideTimer.current = null
        }
    }

    const scheduleHide = () => {
        clearHideTimer()
        hideTimer.current = setTimeout(() => { 
            setShowConfirmation(false)
            setVisible(false)
        }, 800)    
    }

    // close popup
    document.addEventListener('click', (e) => {
        if (document.getElementById('tooltip')) {
            if (visible) {
                if (document.getElementById('confirmation-popup')) {
                    const popupContainer = document.getElementById('confirmation-popup')
                    const tooltipSearch = document.getElementById('tooltip-search')
                    if (!popupContainer.contains(e.target) && !tooltipSearch.contains(e.target)) setShowConfirmation(false)
                } 
                const tooltipContainer = document.getElementById('tooltip') 
                if (!tooltipContainer.contains(e.target)) setVisible(false)
            }
        }
    })
    
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
            const nodeNames = filteredNodes.map(d => d.name)
            const stringNames = nodeNames.map(n => n.toString())

            // new posets
            let positions = {}
            let newPosetArray = []

            subspaces.forEach(fullPos => {
                const names = fullPos.elements.filter(e => stringNames.includes(e))
                let newEdges = fullTree.edges.filter(d => names.includes(d[0]) && names.includes(d[1]))
                if (newEdges.length > 1) newEdges = newEdges.filter(d => d[0] !== d[1])
                if (newEdges.length === 0) newEdges = stringNames.map(n => [n,n])
                const includedInEdges = newEdges.flat().filter((e,n,l) => l.indexOf(e) === n)
                if (names.length > includedInEdges.length) {
                    const missingNodes = names.filter(n => !includedInEdges.includes(n))
                    const missingEdges = missingNodes.map(n => [n,n])
                    newEdges = [...newEdges,...missingEdges]
                }
                const {matrix,nodes} = po.domFromEdges(newEdges)
                const newPos = po.createPoset(matrix,nodes)
                newPos.enrich()
                    .setLayers()
                    .feature("node_degree",(node)=>fullPos.featureOf(node,'node_degree'))
                    .print()
                const nodeWidth = mapRoot.filter(r => newPos.elements.includes(r.toString())).length > 0 ? nWidth*2 : nWidth
                linearLayout(newPos,newEdges,nodeWidth,fullPos)  
                newPos.elements.forEach(e => positions[e] = newPos.featureOf(e,'x'))
                newPosetArray.push(newPos)
            })
            spaceSubspaces(newPosetArray,mapRoot.length > 0 ? nWidth*2 : nWidth)
            newPosetArray.forEach(pos => pos.elements.forEach(e => positions[e] = pos.featureOf(e,'x')))

            // set updates nodes etc
            const nodeDistances = filteredNodes.map(d => fullTree.nodes.find(n => n.name === d.name).distance).filter((e,n,l) => l.indexOf(e) === n).sort((a,b)=>a-b)
            // *** maxD should be by tree not for all nodes ***
            const maxD = nodeDistances[nodeDistances.length-1]
            setMaxDistance(maxD)
            filteredNodes = filteredNodes
                .map(e => ({
                    ...e,
                    leaf: (e.distance === maxD && !filteredLinks.map(d => d.source).map(d => d.name).includes(e.name)) && e.levels !== '-1' ? true : false,
                    parents: fullTree.nodes.find(n => n.name === e.name).parents.filter(d => classFilter.includes('All') ? d : classFilter.includes(fullTree.nodes.find(n => n.name === d).class)),
                    children: fullTree.nodes.find(n => n.name === e.name).children.filter(d => classFilter.includes('All') ? d : classFilter.includes(fullTree.nodes.find(n => n.name === d).class)),
                    descendants: fullTree.nodes.find(n => n.name === e.name).descendants.filter(d => classFilter.includes('All') ? d : classFilter.includes(fullTree.nodes.find(n => n.name === d).class)),
                    x: positions[e.name] 
                }))
            // inclusions
            const newInclusions = sidebarRoot.name.map(r => filteredNodes.map(n => n.name).includes(r) ? getInclusions(sidebarRoot.name,fullTree.nodes,r,excludeList,descendantsFilter,filteredNodes.find(n => n.name === r).descendants) : getInclusions(sidebarRoot.name,fullTree.nodes,r,excludeList,descendantsFilter,fullTree.nodes.find(n => n.name === r).descendants.filter(d => classFilter.includes('All') ? d : classFilter.includes(fullTree.nodes.find(n => n.name === d).class)))).flat().filter((e,n,l) => l.indexOf(e) === n)
                .filter(i => fullTree.nodes.find(n => n.name === i).levels !== '-1' && fullTree.nodes.find(n => n.name === i).levels)
                .map(i => relationship.includes('mappings') ? fullTree.nodes.find(n => n.name === i).mappings.map(m => m.name) : i).flat()   
                .filter(i => {
                    if (relationship.includes('mappings')) {
                        if (countType === 'record') return fullTree.mappings.find(n => n.name === i).total_counts !== 0
                        else return fullTree.mappings.find(n => n.name === i).person_counts !== 0
                    } else {
                        if (countType === 'record') return fullTree.nodes.find(n => n.name === i).total_counts !== 0
                        else return fullTree.nodes.find(n => n.name === i).person_counts  !== 0   
                    }
                })
            filteredNodes = filteredNodes
                .map(e => ({
                    ...e,
                    included_descendants: [...e.descendants.filter(d => newInclusions.includes(d)),...e.descendants.map(d => fullTree.nodes.find(n => n.name === d).mappings.map(m => m.name)).flat().filter(d => newInclusions.includes(d))]
                }))
                .map(e => ({
                    ...e,
                    descendant_code_counts:sidebarRoot.data.stratified_code_counts.filter(c => e.included_descendants.includes(c.concept_id)),
                    descendant_person_counts: d3.sum(fullTree.nodes.filter(n => e.included_descendants.includes(n.name)).map(n => n.person_counts)),
                    leaf: e.included_descendants.filter(d => d !== e.name && !e.mappings.map(m => m.name).includes(d)).length > 0 && e.leaf ? true : false}
                ))
            // filter connections 
            let filteredConnections = crossConnections
                .filter(c => !filteredNodes.map(d => d.name).includes(c.child))
                .filter(c => classFilter.includes('All') ? c : classFilter.includes(fullTree.nodes.find(n => n.name === c.child).class))
                .map(d => ({
                    ...d,
                    parents:d.parents.filter(p => filteredNodes.map(d => d.name).includes(p)).filter(p => filteredNodes.filter(d => d.name === p)[0]?.leaf)
                }))
            filteredConnections = filteredConnections.filter(d => d.parents.length > 1)
            const updatedSelections = filteredNodes
                .filter(d => !d.leaf ? newInclusions.includes(d.name) : d)
                .map(d => ({
                    name: d.name, 
                    leaf: d.leaf, 
                    descendants: d.descendants, 
                    distance: d.distance, 
                    data: !d.leaf ? d.data : {...d.data,descendant_code_counts:d.descendant_code_counts}
                })) 
            const mapSelections = filteredNodes.map(d => d.mappings).flat()
                .filter(d => newInclusions.includes(d.name) && !filteredNodes.find(n => n.name === d.source.name).leaf)
                .map(d => ({
                    name: d.name, 
                    leaf: false, 
                    distance: d.distance, 
                    data: d.data
                }))
            const filteredSelected = [...updatedSelections,...mapSelections]
            filteredSelected.sort((a,b) => d3.ascending(a.distance, b.distance))
            setSelectedConcepts(filteredSelected)
            setInclusions(newInclusions)
            if (relationship.includes('mappings')) setMapRoot(filteredNodes.filter(n => n.mappings.length > 0).map(n => n.name))
            // update nodes and links
            filteredNodes = filteredNodes
                .map(d => ({
                    ...d,
                    descendant_counts: getCounts(d.descendant_code_counts,'node_record_counts')
                }))
                .map(d => ({...d,
                    mappings:d.mappings.map(m => ({...m,source:d}))
                }))
            filteredNodes = filteredNodes.map(d => ({
                ...d,
                connections:filteredConnections.filter(c => c.parents.includes(d.name)).map(e => ({...e,source:d.name,x:d.x,mid:getMidX(e.parents,filteredNodes)}))
            }))
            filteredLinks = filteredLinks.map(d => ({
                ...d,
                source:filteredNodes[nodeNames.indexOf(d.source.name)],
                target:filteredNodes[nodeNames.indexOf(d.target.name)]
            }))
            // pruned
            let isPruned = false
            filteredNodes.filter(d => d.leaf).forEach(d => d.children.length > 0 ? isPruned = true : null)
            // set states
            setEdges(edges)
            setPoset(newPosetArray)
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
            <div className = "toolTip dropShadow" id = "tooltip" style = {{opacity: visible ? 1 : 0, pointerEvents: visible ? 'all' : 'none'}} 
                onMouseEnter={() => {clearHideTimer()}}
                onMouseLeave={() => {setVisible(false)}}
            >
                <div id = "tooltip-header">
                    <div id = "tooltip-btn-container">
                        <FontAwesomeIcon className = 'fa fa-search iconLg marginRight' id = "tooltip-search" icon={faSearch} alt = "select-concept" />
                        <img className = "icon eye" id = "tooltip-eye-closed" src={closedEye} alt="show concept"/>
                        <img className = "icon eye" style = {{opacity:1}} id = "tooltip-eye-opened" src={openedEye} alt="hide concept"/>
                    </div>
                    <div className = 'flex'>
                        <p className = 'marginRight' id = "tooltip-counts"><span id = "tooltip-counts-num" className='num'></span><span id = 'tooltip-counts-label'></span></p>
                        <p className = 'marginRight' style = {{opacity:0.2}}>|</p>
                        <p id = "tooltip-desc-counts"><span id = "tooltip-desc-counts-num" className='num'></span><span id = 'tooltip-desc-counts-label'></span></p>  
                    </div> 
                </div>
                <div className = "selectedText" id = "tooltip-title"></div>
                <div id = 'tooltip-info-container'>
                    <div className='info-col' style = {{marginRight:20}}>
                        <p className = "selectedText infoRow">Id:<span id = "tooltip-id" className='infoContent num'></span></p>
                        <p className = "selectedText infoRow">Code:<span id = "tooltip-code" className='infoContent num'></span></p>
                        <p className = "selectedText infoRow">Type:<span id = "tooltip-type" className='infoContent'></span></p>
                    </div>
                    <div className='info-col'>
                        <p className = "selectedText infoRow">Vocabulary:<span id = "tooltip-vocabulary" className='infoContent'></span></p>
                        <p className = "selectedText infoRow">Domain:<span id = "tooltip-domain" className='infoContent'></span></p>
                        <p className = "selectedText infoRow">Class:<span id = "tooltip-class" className='infoContent'></span></p>    
                    </div>
                </div>
            </div>  
            <div className = 'actionLabel dropShadow' id = "action-label"></div> 
            <div id = "confirmation-popup" className = 'toolTip dropShadow' style = {{opacity: showConfirmation ? 1 : 0, pointerEvents: showConfirmation ? 'all' : 'none'}}
                onMouseEnter={() => {clearHideTimer()}}
                onMouseLeave={() => {setShowConfirmation(false)}}
            >
                <div style = {{paddingBottom:6}}>Select<span className='selectedText' id = "confirmation-name" style = {{marginLeft:4}}></span></div>
                <div className = 'btn greyBtn' id = "confirmation-btn">Confirm</div>  
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
                relationship = {relationship}
                setRelationship = {setRelationship}
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
                // centers = {centers}
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
                nWidth = {nWidth}
                moveSlider = {moveSlider}
                updateWidth = {updateWidth}
                showConfirmation = {showConfirmation}
                showConfirmationPopup = {showConfirmationPopup}
                showActionLabel = {showActionLabel}
                formatThousands = {formatThousands}
                setShowConfirmation = {setShowConfirmation}
                countType = {countType}
                setVisible = {setVisible}
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
                relationship = {relationship}
                showRootLine = {showRootLine}
                setShowRootLine = {setShowRootLine}
                countType = {countType}
                setCountType = {setCountType}
                moveSlider = {moveSlider}
            />  
        </div> : null
    )
}

export default Visualization;