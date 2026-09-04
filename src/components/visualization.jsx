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
    // const getCounts = props.getCounts
    // const getValidity = props.getValidity
    const selectedConcepts = props.selectedConcepts
    const setSelectedConcepts = props.setSelectedConcepts
    const rootConcepts = props.rootConcepts
    const graphFilter = props.graphFilter
    const setGraphFilter = props.setGraphFilter
    const extent = props.extent
    const setExtent = props.setExtent
    const stackData = props.stackData
    // const inclusions = props.inclusions
    const view = props.view
    const setView = props.setView
    const mapRoot = props.mapRoot
    const setMapRoot = props.setMapRoot
    const nodes = props.nodes
    const links = props.links
    const setNodes = props.setNodes
    const setLinks = props.setLinks
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
    // const maxDistance = props.maxDistance
    // const setMaxDistance = props.setMaxDistance
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
    const getConceptInfo = props.getConceptInfo
    const setRootLine = props.setRootLine
    const setRootExtent = props.setRootExtent
    const [showRootLine, setShowRootLine] = useState(true)
    const [zoomed, setZoomed] = useState(false)
    const [biDirectional, setBiDirectional] = useState()
    const [graphSectionWidth, setGraphSectionWidth] = useState('60vw')
    const [upsetZoomedOut, setUpsetZoomedOut] = useState(false)
    const edges = props.edges
    const setEdges = props.setEdges
    const updateConcepts = props.updateConcepts
    const updateWidth = props.updateWidth
    const upsetData = props.upsetData
    const maxPersonLevel = props.maxPersonLevel
    const yearSelection = props.yearSelection
    const setYearSelection = props.setYearSelection
    const personFilterData = props.personFilterData
    const allNodesMap = props.allNodesMap
    const hideTimer = useRef(null)
    const popupTimeout = useRef(null)

    // tooltip
    function tooltipHover(d, mode, event) {
        let concept_info = d.data.concept
        if (mode === "enter") {
            clearHideTimer()
            setVisible(true)
            d3.select("#tooltip")
                .style('left', function() {
                    const gap = 5
                    const w = document.getElementById('tooltip').clientWidth
                    if (event.x + w > window.innerWidth) return (event.x - w - gap + 'px')
                    else return (event.x + gap + 'px')    
                })
                .style('top', function() {
                    const gap = 5
                    const h = document.getElementById('tooltip').clientHeight
                    if (event.y + h > window.innerHeight) return (event.y - h - gap + 'px')  
                    else return (event.y + gap + 'px')
                })
            
            d3.select('#tooltip-search')
                .style('display', () => rootConcepts.includes(d.name) ? 'none' : 'inline-block') 
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
                    showConfirmationPopup(d, 'enter', e)
                })
            d3.select('#tooltip-eye-closed')
                .style('display', () => !inclusions.includes(d.name) && (d.record_counts !== 0 || d.leaf) ? 'inline-block' : 'none')
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
                    updateConcepts(newInclusions)
                    setVisible(false)
                })     
            d3.select('#tooltip-eye-opened')
                .style('display', () => inclusions.includes(d.name) ? 'inline-block' : 'none')
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
                    // updateConcepts(newInclusions,[],[d])
                    updateConcepts(newInclusions)
                    setVisible(false)
                }) 
            
            d3.select('#tooltip-counts').style('opacity', () => d.leaf ? 0.2 : 1)
            d3.select('#tooltip-desc-counts').style('opacity', () => d.leaf ? 1 : 0.2)
            d3.select('#tooltip-counts-num').html(countType === 'record' ? d.record_counts : d.person_counts)
            d3.select('#tooltip-counts-label').html(() => countType === 'record' ? ' RC' : ' PC')
            d3.select('#tooltip-desc-counts-num').html(countType === 'record' ? d.descendant_record_counts : d.descendant_person_counts)
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

    function showConfirmationPopup(d, mode, event = null) {
        if (mode === 'enter') {
            setShowConfirmation(true)
            clearTimeout(popupTimeout.current)
            popupTimeout.current = setTimeout(() => {
                setShowConfirmation(false)
            }, 1400)
            d3.select('#confirmation-btn')
                .on('click', (e,i) => {
                    setShowConfirmation(false)
                    setLoading(true)
                    if (!d.name) navigate(`/${d}`)
                    else navigate(`/${d.name}`)
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
            if (!d.data) d3.select('#confirmation-name').html(nodes.find(n => n.name === d).data.concept.concept_name)
            else d3.select('#confirmation-name').html(d.data.concept.concept_name)
        } 
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
            setVisible(false)
        }, 800)    
    }

    return ( rootConcepts ? 
        <div id = "visualization-container">
            <div className = "toolTip dropShadow" id = "tooltip" style = {{opacity: visible ? 1 : 0, pointerEvents: visible ? 'all' : 'none'}} 
                onMouseEnter={() => {clearHideTimer()}}
                onMouseLeave={() => {setVisible(false)}}
            >
                <div id = "tooltip-header">
                    <div id = "tooltip-btn-container">
                        <img className = "icon eye" id = "tooltip-eye-closed" src={closedEye} alt="show concept"/>
                        <img className = "icon eye" style = {{opacity:1}} id = "tooltip-eye-opened" src={openedEye} alt="hide concept"/>
                        <FontAwesomeIcon className = 'fa fa-search iconLg' id = "tooltip-search" icon={faSearch} alt = "select-concept" />   
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
                onMouseEnter={() => {clearTimeout(popupTimeout.current)}}
                onMouseLeave={() => {setShowConfirmation(false)}}
            >
                <div style = {{paddingBottom:6}}>Select<span className='selectedText' id = "confirmation-name" style = {{marginLeft:4}}></span></div>
                <div className = 'btn greyBtn' id = "confirmation-btn">Confirm</div>  
            </div> 
            <SideBar
                rootConcepts = {rootConcepts} 
                mapRoot = {mapRoot}
                setMapRoot = {setMapRoot}
                tooltipHover = {tooltipHover}
                // conceptHover = {conceptHover}
                updateConcepts = {updateConcepts}
                view = {view}
                setView = {setView}
                // getValidity = {getValidity}
                nodes = {nodes}
                links = {links}
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
                // getCounts = {getCounts}
                setPruned = {setPruned}
                edges = {edges}
                linearLayout = {linearLayout}
                setLoading = {setLoading}
                getMidX = {getMidX}
                // maxDistance = {maxDistance}
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
                showRootLine = {showRootLine}
                maxPersonLevel = {maxPersonLevel}
            ></SideBar> 
            <GraphSection
                color = {color}
                selectedConcepts = {selectedConcepts}
                setSelectedConcepts = {setSelectedConcepts}
                rootConcepts = {rootConcepts} 
                tooltipHover = {tooltipHover}
                graphFilter = {graphFilter}
                setGraphFilter = {setGraphFilter}
                // conceptHover = {conceptHover}
                extent = {extent}
                setExtent = {setExtent}
                yearSelection = {yearSelection}
                setYearSelection = {setYearSelection}
                openFilters = {openFilters}
                setOpenFilters = {setOpenFilters}
                stackData = {stackData}
                inclusions = {inclusions}
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
                showConfirmationPopup = {showConfirmationPopup}
                showActionLabel = {showActionLabel}
                fullTree = {fullTree}
                upsetData = {upsetData}
                formatThousands = {formatThousands}
                rootExtent = {rootExtent}
                personFilterData = {personFilterData}
                allNodesMap = {allNodesMap}
                upsetZoomedOut = {upsetZoomedOut}
                setUpsetZoomedOut = {setUpsetZoomedOut}
            ></GraphSection>
        </div> : null
    )
}

export default Visualization;