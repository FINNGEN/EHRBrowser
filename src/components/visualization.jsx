import React, { useEffect, useState, useRef } from 'react';
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
    const color = props.color
    const root = props.root
    const getData = props.getData
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
    const [visible,setVisible] = useState(false)
    const openFilters = props.openFilters
    const setOpenFilters = props.setOpenFilters
    const filteredConnections = props.filteredConnections
    const pruned = props.pruned
    const hoverTimeout = useRef(null)
    const hideTimeout = useRef(null)

    // tooltip
    function tooltipHover(d, mode, event, component) {
        let concept_info = d.data.concept
        if (mode === "enter") {
            showTooltip()
            conceptHover(d.name, 'enter', component, sidebarRoot.name)
            d3.select("#tooltip")
                .style('left', function() {
                    //use trackNodes variable to base it off tree position
                    if (event.x + 150 > window.innerWidth) {
                        return (event.x - 110 + 'px')   
                    } else {
                        return (event.x + 10 + 'px')    
                    } 
                })
                .style('top', function() {
                    //use trackNodes variable to base it off tree position
                    if (event.y + 150 > window.innerHeight) {
                        return (event.y - 110 + 'px')    
                    } else {
                        return (event.y + 10 + 'px')
                    } 
                })
            d3.select('#tooltip-root')  
                .style('display', () => d.name === sidebarRoot.name ? 'none' : 'block') 
                .on('click', async () => {
                    if (d.name !== sidebarRoot.name) {  
                        const data = await getData(d.name)
                        setSidebarRoot({name:d.name,data:data})  
                        setVisible(false) 
                    }
                })   
            d3.select('#tooltip-RC').html(d.total_counts + ' RC')
            d3.select('#tooltip-DRC').html(d.descendant_counts + ' DRC')
            d3.select('#counts-btn-circle')
                .style('display', d.total_counts === 0 ? 'none' : 'flex')
                .on('mouseover', () => {
                    if (!conceptNames.includes(d.name)) {
                        d3.select("#tooltip-plus").style('color', 'white')
                        d3.select('#counts-btn-circle').style('border', '1px solid '+generateColor(d.name)).style('background-color', () => generateColor(d.name))
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
                    d3.select('#counts-btn-circle').style('background-color', () => conceptNames.includes(d.name) ? generateColor(d.name) : 'transparent').style('border', () => conceptNames.includes(d.name) ? '1px solid '+generateColor(d.name) : '1px solid var(--textlight)')
                })
                .on('click', () => {
                    if (d.total_counts !== 0) {
                        if (conceptNames.includes(d.name) && selectedConcepts.length > 1) {
                            let filteredConcepts = selectedConcepts.filter(e => e.name !== d.name)
                            setSelectedConcepts(filteredConcepts)   
                        } else if (!conceptNames.includes(d.name)){
                            addConcepts([d])
                        }     
                    }
                    setVisible(false)
                })
                .style('background-color', () => conceptNames.includes(d.name) ? generateColor(d.name) : 'transparent')
                .style('border', () => conceptNames.includes(d.name) ? '1px solid '+generateColor(d.name) : '1px solid var(--textlight)')
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
    // hover on concept
    function conceptHover(id, mode) {
        if (mode === "enter") {
            if (!nodes.map(d => d.name).includes(id)) {
                d3.selectAll('.map-node').transition('allOpacities').style('opacity', 0.15)
                d3.select('#map-node-'+id).transition('allOpacities').style('opacity', 1)
                d3.selectAll('.subsumes-node').filter(function () {return !this.classList.contains('tree-circle-background')}).transition('allOpacities').style('opacity', 0.15)
                d3.selectAll('.label').transition('allOpacities').style('opacity', 0.15)
                d3.selectAll('.alt-text').transition('allOpacities').style('opacity', 0.15)
                d3.selectAll('.map-link').transition('allOpacities').style('opacity', 0.15)
            } else {
                d3.selectAll('.tree-node').filter(function () {return !this.classList.contains('tree-circle-background')}).transition('allOpacities').style('opacity', 0.15)
                d3.select('#tree-node-'+id).transition('allOpacities').style('opacity', 1)
                d3.select("#tree-text-" + id).transition('allOpacities').attr("font-weight", 700).style('opacity', 1)
                d3.select("#label-rect-" + id).transition('allOpacities').attr('fill', color.lightpurple).attr('fill-opacity',1)    
            }
            d3.selectAll('.area-path').transition('allOpacities').attr("opacity", 0.15)
            d3.selectAll('.small-multiples').transition('allOpacities').attr("opacity", 0.15)
            d3.select('#sm-'+id).transition('allOpacities').attr("opacity", 1)
            d3.selectAll(".labels").transition('allOpacities').style("opacity", 0.15)
            d3.select('#area-' + id).transition('allOpacities').attr("opacity", 1).attr("stroke-width", 2.5) 
            d3.select("#label-" + id).transition('allOpacities').style("opacity", 1).style('background-color', color.lightpurple)
            d3.select("#label-text-" + id).transition('allOpacities').style("font-weight", 700)
            d3.selectAll(".tree-link").transition('allOpacities').attr("opacity", 0.15) 
        } else {
            if (!nodes.map(d => d.name).includes(id)) {
                d3.selectAll('.subsumes-node').transition('allOpacities').style('opacity', 1)
                d3.selectAll('.label').transition('allOpacities').style('opacity', 1)
                d3.selectAll('.alt-text').transition('allOpacities').style('opacity', 1)
                d3.selectAll('.map-node').transition('allOpacities').style('opacity', 1)
                d3.selectAll('.map-link').transition('allOpacities').style('opacity', 1)
            } else {
                d3.selectAll(".label-rect").transition('allOpacities').attr('fill', d => d.name === sidebarRoot.name ? color.lightpurple : 'none').attr('fill-opacity', d => d.name === sidebarRoot.name ? 1 : 0.7)
                d3.select("#tree-text-" + id).transition('allOpacities').attr("font-weight", id === sidebarRoot.name ? 700 : null).style('opacity', 1)
                d3.selectAll('.tree-node').transition('allOpacities').style('opacity', 1)  
            }
            d3.selectAll('.small-multiples').transition('allOpacities').attr("opacity", 1)
            d3.selectAll('.area-path').transition('allOpacities').attr("opacity", 1).attr("stroke-width", 2)
            d3.select("#label-text-" + id).transition('allOpacities').style("font-weight", id === sidebarRoot.name ? 700 : 400)
            d3.selectAll(".tree-link").transition('allOpacities').attr("opacity", 1)  
            d3.selectAll(".labels").transition('allOpacities').style("opacity", 1).style('background-color', d => d[0] === sidebarRoot.name ? color.lightpurple : 'transparent') 
        }    
    }
    // add concepts to graph 
    function addConcepts(newConcepts) {
        newConcepts = newConcepts.filter(d => !d.leaf ? d.total_counts !== 0 : d).map(d => {return {name:d.name,leaf:d.leaf,data:d.data}})
        let updatedConcepts = [...selectedConcepts,...newConcepts]
        setSelectedConcepts(updatedConcepts)
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

    useEffect(()=>{
        if (root) {
            fetch(`http://127.0.0.1:8585/getCodeCounts?conceptId=${root}`)
                .then(res=> res.json())
                .then(data=>{
                    console.log('root', root)
                    console.log('data', data)
                    setGraphFilter({gender:-1,age:[-1]})
                    setRootData(data)
                    setClassFilter(data.concept_relationships.filter(d => d.levels !== "Mapped from" && d.levels !== "Maps to").map(d => d.concept_class_id).filter((e,n,l) => l.indexOf(e) === n).filter(d => d !== undefined))
                    setSidebarRoot({name:parseInt(root),data:data}) 
                    setView('Tree') 
                    d3.select("#graph-section").style('width', "60vw")
                    d3.select('#expand').style('display', 'block') 
                    d3.select('#compress').style('display', 'none') 
                    setTreeSelections(['descendants'])
                    setLevelFilter()
                    setOpenFilters(true)
                    setMapRoot([])
                })
        }
    },[root])

    return ( sidebarRoot !== undefined ? 
        <div id = "visualization-container">
            <div className = "box-shadow" id = "tooltip" style = {{opacity: visible ? 1 : 0, pointerEvents: visible ? 'all' : 'none'}} 
            onMouseEnter={() => {showTooltip()}}
            onMouseLeave={() => {hideTooltip()}}>
                <div id = "tooltip-header">
                    <div id = "tooltip-btn-container">
                        <div className = "tooltip-btn" id = 'tooltip-root'><img style = {{width:15}} src={rootIcon} alt="root icon"/></div>
                        <div className = "tooltip-btn" id = "counts-btn-circle">
                            <FontAwesomeIcon style = {{opacity:0,display:'none',color:'var(--text)'}} className = 'tooltip-icon fa-solid fa-plus fa-sm' id = "tooltip-plus" icon={faPlus} />
                            <FontAwesomeIcon style = {{opacity:0,display:'none',color:'white'}} className = 'tooltip-icon fa-solid fa-x fa-sm' id = "tooltip-x" icon={faX} />
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
                setSidebarRoot = {setSidebarRoot}   
                mapRoot = {mapRoot}
                setMapRoot = {setMapRoot}
                getCounts = {getCounts}
                tooltipHover = {tooltipHover}
                conceptHover = {conceptHover}
                addConcepts = {addConcepts}
                conceptNames = {conceptNames}
                view = {view}
                setView = {setView}
                getData = {getData}
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
                filteredConnections = {filteredConnections}
                pruned = {pruned}
            ></SideBar> 
            <GraphSection
                color = {color}
                selectedConcepts = {selectedConcepts}
                setSelectedConcepts = {setSelectedConcepts}
                setSidebarRoot = {setSidebarRoot}
                sidebarRoot = {sidebarRoot}
                tooltipHover = {tooltipHover}
                graphFilter = {graphFilter}
                setGraphFilter = {setGraphFilter}
                conceptHover = {conceptHover}
                getData = {getData}
                getCounts = {getCounts}
                extent = {extent}
                setExtent = {setExtent}
                openFilters = {openFilters}
                setOpenFilters = {setOpenFilters}
                stackData = {stackData}
                conceptNames = {conceptNames}
                generateColor = {generateColor}
                rootLine = {rootLine}
            />  
        </div> : null
    )
}

export default Visualization;