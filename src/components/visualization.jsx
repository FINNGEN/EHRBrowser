import React, { useEffect, useState, useRef } from 'react';
import GraphSection from './visualization/graphSection';
import SideBar from './visualization/sideBar'
import graphIconBlack from '../img/graph-icon-black.svg'
import graphIconWhite from '../img/graph-icon-white.svg'
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
    // const lineData = props.lineData
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
    const [visible,setVisible] = useState(false)
    const [openFilters,setOpenFilters] = useState(true)
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
                    if (event.x + 250 > window.innerWidth) {
                        return (event.x - 200 + 'px')   
                    } else {
                        return (event.x + 15 + 'px')    
                    } 
                })
                .style('top', function() {
                    //use trackNodes variable to base it off tree position
                    if (event.y + 250 > window.innerHeight) {
                        return (event.y - 240 + 'px')    
                    } else {
                        return (event.y + 10 + 'px')
                    } 
                })
            d3.select('#root-btn-circle')
                .style('border', () => d.name === sidebarRoot.name ? '1px solid var(--mediumslate)' : '1px solid transparent')     
                .style('background-color', () => d.name === sidebarRoot.name ? 'var(--lightestpurple)' : 'transparent') 
                .on('mouseover', () => {
                    if (d.name !== sidebarRoot.name) {
                        // setMapRoot(d.name)
                        d3.select('#root-btn-circle').style('border', '1px solid var(--mediumslate)').style('background-color', 'var(--lightestpurple)')
                    }
                })
                .on('mouseout', () => {
                    // if (d.name !== sidebarRoot.name || mapRoot !== sidebarRoot.name) setMapRoot(sidebarRoot.name)
                    d3.select('#root-btn-circle')
                        .style('border', () => d.name === sidebarRoot.name ? '1px solid var(--mediumslate)' : '1px solid transparent')     
                        .style('background-color', () => d.name === sidebarRoot.name ? 'var(--lightestpurple)' : 'transparent')     
                })
                .on('click', async () => {
                    if (d.name !== sidebarRoot.name) {  
                        const data = await getData(d.name)
                        setSidebarRoot({name:d.name,data:data})  
                        setVisible(false) 
                    }
                })   
            d3.select('#tooltip-RC').html(getCounts(d.data.code_counts, 'event_counts') + ' RC')
            d3.select('#tooltip-DRC').html(getCounts(d.data.code_counts, 'descendant_event_counts') + ' DRC')
            d3.select('#tooltip-PC').html(getCounts(d.data.code_counts, 'person_counts') + ' PC')
            d3.select('#tooltip-DPC').html(getCounts(d.data.code_counts, 'descendant_person_counts') + ' DPC')
            d3.select('#counts-btn-circle')
                .on('mouseover', () => {
                    if (!conceptNames.includes(d.name)) {
                        d3.select("#graph-icon-black").style('display', 'none')
                        d3.select("#graph-icon-white").style('display', 'block')
                        d3.select('#counts-btn-circle').style('border', 'none').style('background-color', () => generateColor(d.name))
                    }
                    else {
                        if (selectedConcepts.length > 1) {
                            d3.select("#graph-icon-black").style('display', 'block')
                            d3.select("#graph-icon-white").style('display', 'none')
                            d3.select('#counts-btn-circle').style('background-color', 'transparent').style('border', '1px solid var(--lightergrey)')   
                        } 
                    }    
                })
                .on('mouseout', () => {
                    d3.select("#graph-icon-black").style('display', () => conceptNames.includes(d.name) ? 'none' : 'block')
                    d3.select("#graph-icon-white").style('display', () => conceptNames.includes(d.name) ? 'block' : 'none')
                    d3.select('#counts-btn-circle').style('background-color', () => conceptNames.includes(d.name) ? generateColor(d.name) : 'transparent').style('border', () => conceptNames.includes(d.name) ? 'none' : '1px solid var(--lightergrey)')
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
                .style('border', () => conceptNames.includes(d.name) ? 'none' : '1px solid var(--lightergrey)')
            d3.select("#graph-icon-black")
                .style('display', () => conceptNames.includes(d.name) ? 'none' : 'block')
            d3.select("#graph-icon-white")
                .style('display', () => conceptNames.includes(d.name) ? 'block' : 'none')
            d3.select("#tooltip-title")
                .html(concept_info.concept_name)
                .style('display', 'block')
            d3.select("#tooltip-content").select("#tooltip-id")
                .selectAll("p")
                .html(d.name)
            d3.select("#tooltip-content").select("#tooltip-code")
                .selectAll("p")
                .html(concept_info.concept_code)
            d3.select("#tooltip-content").select("#tooltip-type")
                .selectAll("p")
                .html(concept_info.standard_concept ? "Standard" : "Non standard")
            d3.select("#concept-type-tooltip")
                .style("border-style", () => concept_info.standard_concept ? 'solid' : 'dashed')
                .style("color", 'black')
            d3.select("#tooltip-content").select("#tooltip-vocabulary")
                .selectAll("p")
                .html(concept_info.vocabulary_id)
            d3.select("#tooltip-content").select("#tooltip-domain")
                .selectAll("p")
                .html(concept_info.domain_id)
            d3.select("#tooltip-content").select("#tooltip-class")
                .selectAll("p")
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
        newConcepts = newConcepts.filter(d => d.total_counts !== 0).map(d => {return {name:d.name,data:d.data}})
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
                    setExtent(d3.extent([1953,2022]))
                    setGraphFilter({gender:-1,age:[-1]})
                    setRootData(data)
                    setSidebarRoot({name:parseInt(root),data:data}) 
                    setView('Tree') 
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
                        <div className = "tooltip-btn" id = "root-btn-circle">
                            <img src={rootIcon} alt="root icon"/>
                        </div>
                        <div className = "tooltip-btn" id = "counts-btn-circle">
                            <img id = "graph-icon-black" src={graphIconBlack} alt="graph icon"/>
                            <img id = "graph-icon-white" src={graphIconWhite} alt="graph icon"/>
                        </div>
                    </div>
                </div>
                <div id = "tooltip-title"></div>
                <div style = {{display:'flex',justifyContent:'space-between'}}>
                    <p id = "tooltip-RC"></p>
                    <p>|</p>
                    <p id = "tooltip-DRC"></p>
                    <p>|</p>
                    <p id = "tooltip-PC"></p>
                    <p>|</p>
                    <p id = "tooltip-DPC"></p>     
                </div> 
                <div id = "tooltip-content">
                    <div className = "tooltip-content-row" id = "tooltip-id"><h4>Id</h4><p></p></div>
                    <div className = "tooltip-content-row" id = "tooltip-code"><h4>Code</h4><p></p></div>
                    <div className = "tooltip-content-row" id = "tooltip-type"><h4>Type</h4><p className = "concept-type" id = "concept-type-tooltip"></p></div>
                    <div className = "tooltip-content-row" id = "tooltip-vocabulary"><h4>Vocabulary</h4><p></p></div>
                    <div className = "tooltip-content-row" id = "tooltip-domain"><h4>Domain</h4><p></p></div>
                    <div className = "tooltip-content-row" id = "tooltip-class"><h4>Class</h4><p></p></div>
                    {/* <div className = "tooltip-content-row" id = "tooltip-validity"><h4>Validity</h4><p></p></div> */}
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
                // lineData = {lineData}
                conceptNames = {conceptNames}
                generateColor = {generateColor}
                rootLine = {rootLine}
            />  
        </div> : null
    )
}

export default Visualization;