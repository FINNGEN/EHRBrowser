    import React, { useEffect, useState } from 'react';
    import { useNavigate } from 'react-router-dom';
    import '@fortawesome/fontawesome-free/css/all.min.css';
    import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
    import openedEye from '../../img/opened-eye.svg'
    import openedEyeWhite from '../../img/opened-eye-white.svg'
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
        const setShowConfirmation = props.setShowConfirmation
        const countType = props.countType
        const setVisible = props.setVisible
        const margin = 10
        let hoverTimeout = null
        let currentTarget = null

        // TREE AND LIST FUNCTIONS        
        function getYPosition(source, axis, cy, node) {
            const mappings = nodes.filter(n => n.name === source.name)[0].mappings
            const direction = mappings.filter(d => d.name === node.name)[0].direction
            const generation = countType === 'record' ? mappings.filter(d => d.direction === direction).sort((a,b) => b.total_counts - a.total_counts) : mappings.filter(d => d.direction === direction).sort((a,b) => b.person_counts - a.person_counts)
            const index = generation.map(d => d.name).indexOf(node.name) 
            let gap = 0
            gap = !mapRoot.includes(source.name) ? 10 : 150
            // else gap = (d3.select("#tree").node().getBoundingClientRect().height/generation.length)/15 + 5
            const adjustment = generation.length % 2 !== 0 ? 0 : gap/2
            const median = Math.floor(generation.length/2) 
            let position = 0
            if (index >= median) position = cy + ((index - median) * gap) + adjustment
            else position = cy - ((median - index) * gap) + adjustment
            return position
        }   
        function hoverMappings(d,mode) {
            if (mode === 'enter') {
                d3.select('#mappings-btn-'+d.name).transition().style('opacity',1)
                if (!mapRoot.includes(d.name)) d3.selectAll('.map-circle-'+d.name).transition().attr("transform", "translate(-2, 0)")
            } else {
                d3.select('#mappings-btn-'+d.name).transition().style('opacity',0.3) 
                d3.selectAll('.map-circle-'+d.name).transition().attr("transform", "translate(0, 0)")
            }
        }
        function zoomed(e) {
            const {x,y,k} = e.transform
            d3.select("#tree-graphics").attr("transform", "translate(" + x + "," + y + ")" + " scale(" + k + ")");
        }
        function zoomToFit(padding = 20) {
            const svgNode = d3.select('#tree-container').node()
            const gNode = d3.select('#tree-graphics').node()
            const svgWidth = window.innerWidth * ((100-parseInt(graphSectionWidth))/100) + padding*2
            // const svgWidth = svgNode.getBoundingClientRect().width + padding*2
            const svgHeight = svgNode.getBoundingClientRect().height - padding
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
            const allNodes = [...fullTree.nodes,...fullTree.mappings]
            // MAKE THIS A STATE, FIND BETTER WAY -> MOVE TO FILTERING, HAVE IT BE IN DESCENDANT_COUNTS
            const conceptSetData = sidebarRoot.name.map(root => ({name:root,color:nodes.find(n => n.name === root).color,leaf:nodes.find(n => n.name === root) ? nodes.find(n => n.name === root).leaf : false, descendant_person_counts:d3.sum([...fullTree.nodes.filter(n => fullTree.nodes.find(n => n.name === root).descendants.includes(n.name)),...fullTree.mappings.filter(m => fullTree.nodes.find(n => n.name === root).descendants.includes(m.source.name))].filter(node => inclusions.includes(node.name)).map(node => node.person_counts)),  descendant_counts: d3.sum([...fullTree.nodes.filter(n => fullTree.nodes.find(n => n.name === root).descendants.includes(n.name)),...fullTree.mappings.filter(m => fullTree.nodes.find(n => n.name === root).descendants.includes(m.source.name))].filter(node => inclusions.includes(node.name)).map(node => node.total_counts)),concept:sidebarRoot.data.concepts.find(d => d.concept_id === root),descendants:descendantsFilter.includes(root) ? false : true,exclude:excludeList.includes(root) ? true : false}))
            d3.select('#set-items').selectAll('.set-item').data(conceptSetData, d => d.name)
            .join(enter => {
                const container = enter.append('div')
                    .classed('set-item',true)
                    .attr('id', d => 'set-item-'+d.name)
                const conceptSection = container.append('div')
                    .classed('set-concept flex btn',true)
                    .style('flex-grow',1)
                    .on('mouseover',(e,d) => {
                        d3.select('#set-trash-'+d.name).transition(1000).style('max-width','15px').style('opacity',1).style('margin-right','4px')
                    })
                    .on('mouseout', (e,d) => {
                        d3.select('#set-trash-' + d.name).transition(1000).style('max-width', '0px').style('opacity', 0).style('margin-right', '0px')
                    })
                conceptSection.append('i')
                    .classed('set-trash fa-solid fa-trash btn',true)
                    .attr('id', d => 'set-trash-'+d.name)
                    .style('max-width','0px')
                    .style("font-size",'12px')
                    .style('opacity',0)
                    .style('margin-right','0px')
                    .on('mouseover',(e,d) => {
                        d3.select('#set-trash-'+d.name).transition(1000).style('max-width','15px').style('opacity',1).style('margin-right','4px')
                        const el = e.currentTarget
                        el.__hoverTimeout__ = setTimeout(() => {
                            showActionLabel('Remove concept','enter',e)
                        }, 1200)
                    })
                    .on("mouseout", (e,d) => {
                        clearTimeout(e.currentTarget.__hoverTimeout__)
                        showActionLabel('','leave',e)
                        d3.select('#set-trash-' + d.name).transition(1000).style('max-width', '0px').style('opacity', 0).style('margin-right', '0px')
                    })
                    .on('click',(e,d) => {
                        showActionLabel('','leave',e)
                        const arrayToString = sidebarRoot.name.filter(root => root !== d.name).join(",")
                        navigate(`/${arrayToString}`)
                    })
                const conceptCard = conceptSection.append('div')
                    .classed('set-card concept-card',true)
                    .attr('id', d => 'set-card-'+d.name)
                    .style('display','flex')
                    .style('flex-direction','column')
                    .style('box-shadow', d => conceptNames.includes(d.name) || d.leaf ? '0 0 0 1px rgba(0, 0, 0, 0.02),0 2px 10px rgba(0, 0, 0, 0.15)' : 'none')
                    .style('background-color', d => d.levels === '-1' ? 'none' : conceptNames.includes(d.name) || d.leaf ? 'white' : '#ebebeb')
                    .style('border', '1px solid #6a23d6')
                    .style('margin-right','20px')
                const title = conceptCard.append('div')
                    .classed('set-item-title',true)
                const title1 = title.append('div')
                    .style('display','flex')
                    .style('align-items','center')
                title1.append('div')
                    .classed('set-circle',true)
                    .classed('list-circle-dash', d => d.concept.record_counts === 0 && !d.leaf ? true : false)
                    .classed('list-circle', d => d.concept.record_counts === 0 && !d.leaf ? false : true)
                    .classed('btn', d => conceptNames.includes(d.name) || d.leaf ? true : false)
                    .style("pointer-events", d => conceptNames.includes(d.name) || d.leaf ? 'all' : 'none')
                    .style('background', d => {
                        if (d.concept.record_counts === 0 && !d.leaf) return "none"
                        if (conceptNames.includes(d.name) || d.leaf) {
                            if (!d.concept.standard_concept) {return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, "+ d.color + " 0.5px," + d.color + " 2px)"} 
                            else {return "none"}
                        }
                        else {
                            if (!d.concept.standard_concept) return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, #d6d6d6 0.5px, #d6d6d6 2px)"  
                            else {return "none"}

                        }      
                    })
                    .style("background-color", d => {
                        if (d.concept.record_counts === 0 && !d.leaf) return "transparent"
                        if (conceptNames.includes(d.name) || d.leaf) {
                            if (d.concept.standard_concept) {return d.color} 
                            else {return "transparent"}
                        }
                        else return '#d6d6d6'
                    }) 
                    .style('border', d => d.concept.record_counts === 0 && !d.leaf ? '1px solid #b2b2b2' : conceptNames.includes(d.name) || d.leaf ? `1px solid ${d.color}` : '1px solid #d6d6d6')
                    .on('mouseover',(e,d) => setHovered([d.name]))
                    .on('mouseout', (e,d) => setHovered([]))
                const titleRight = title1.append('div')
                    .classed('list-title-right btn',true)
                    .style('display','flex')
                    .style('align-items','center')
                    .style('z-index','1000')
                const titleP = titleRight.append('p')
                    .classed('set-title-p',true)
                    .style('opacity', d => conceptNames.includes(d.name) || d.leaf ? 1 : 0.6)
                titleP.append('span')
                    .classed('set-name selectedText marginRight',true)
                    .html(d => d.concept.concept_name)
                titleP.append('span')
                    .classed('set-code marginRight num',true)
                    .style('font-weight',500)
                    .html(d => d.concept.concept_code)
                titleP.append('span')
                    .classed('set-vocab marginRight',true)
                    .html(d => d.concept.vocabulary_id)   
                title.append('i')
                    .classed('set-info-icon fa-solid fa-circle-info icon',true)  
                    .attr('id', d => 'set-info-icon-'+d.name)  
                    .style('opacity', 0.2)
                    .on('mouseover',(e,d) => d3.select('#set-info-icon-'+d.name).transition().style('opacity',1))
                    .on('mouseout', (e,d) => {if(d3.select('#set-info-container-'+d.name).style('height') !== '45px') d3.select('#set-info-icon-'+d.name).transition().style('opacity',0.2)})
                    .on('click', (e,d) => {
                        if (d3.select('#set-info-container-'+d.name).style('height') === '45px') {
                            d3.select('#set-info-icon-'+d.name).transition().style('opacity',0.2)
                            d3.select('#set-info-container-'+d.name).transition().style('opacity',0).style('height','0px').style('padding-top','0px').style('margin','0px 0px 0px 22px')
                            d3.select('#set-card-'+d.name).transition().style('border-radius','20px')
                        } else {
                            d3.select('#set-info-icon-'+d.name).transition().style('opacity',1)
                            d3.select('#set-info-container-'+d.name).transition().style('opacity',1).style('height','45px').style('padding-top','4px').style('margin','4px 4px 4px 22px')
                            d3.select('#set-card-'+d.name).transition().style('border-radius','12px')
                        }
                    })
                const infoContainer = conceptCard.append('div')
                    .classed('set-info-container',true)
                    .attr('id', d => 'set-info-container-'+d.name)
                    .style('border-top', d => conceptNames.includes(d.name) || d.leaf ? '1px solid color-mix(in srgb, #36126d, white 90%)' : '1px solid color-mix(in srgb, #36126d, white 78%)')
                const infoCol1 = infoContainer.append('div')
                    .classed('info-col',true)
                infoCol1.append('p')
                    .classed('selectedText infoRow',true)
                    .html('Id:')
                    .append('span')
                    .classed('infoContent num',true)
                    .html(d => d.concept.concept_id)
                infoCol1.append('p')
                    .classed('selectedText infoRow',true)
                    .html('Code:')
                    .append('span')
                    .classed('infoContent num',true)
                    .html(d => d.concept.concept_code)
                infoCol1.append('p')
                    .classed('selectedText infoRow',true)
                    .html('Type:')
                    .append('span')
                    .classed('infoContent',true)
                    .html(d => d.concept.standard_concept ? "Standard" : "Non standard")
                const infoCol2 = infoContainer.append('div')
                    .classed('info-col',true)
                    .style('margin-left', '20px')
                infoCol2.append('p')
                    .classed('selectedText infoRow',true)
                    .html('Domain:')
                    .append('span')
                    .classed('infoContent',true)
                    .html(d => d.concept.domain_id)
                infoCol2.append('p')
                    .classed('selectedText infoRow',true)
                    .html('Class:')
                    .append('span')
                    .classed('infoContent',true)
                    .html(d => d.concept.concept_class_id)
                  
                const selections = container.append('div')
                    .classed('set-expression-container flex',true)

                const descendants = selections.append('div')
                    .classed('flex',true)
                    .style('justify-content','flex-start')
                    .style('margin-right','10px')
                const descendantsBox = descendants.append('div')
                    .classed('descendants-box checkMarkBox marginRight',true)
                    .style('border', d => d.descendants ? '1px solid #808080' : '1px solid #e0e0e0')
                    .on('click', (e,d) => setExcludeInclude('descendants',d.name))
                descendantsBox.append('i')
                    .classed('descendants-check fa-solid fa-check',true)
                    .style('display', d => d.descendants ? 'block' : 'none')    
                descendants.append('p')
                    .classed('descendants-p',true)
                    .classed('selectedText', d => d.descendants ? true : false)
                    .html('Descendants')
                
                const exclude = selections.append('div')
                    .classed('flex',true)
                    .style('justify-content','flex-start')
                const excludeBox = exclude.append('div')
                    .classed('exclude-box checkMarkBox marginRight',true)
                    .style('border', d => d.exclude ? '1px solid #808080' : '1px solid #e0e0e0')
                    .on('click', (e,d) => setExcludeInclude('exclude',d.name))
                excludeBox.append('i')
                    .classed('exclude-check fa-solid fa-check',true)
                    .style('display', d => d.exclude ? 'block' : 'none')    
                exclude.append('p')
                    .classed('exclude-p',true)
                    .classed('selectedText', d => d.exclude ? true : false)
                    .html('Exclude')

                container.append('div')
                    .classed('set-counts num',true)
                    .html(d => countType === 'record' ? d.descendant_counts : d.descendant_person_counts)
            },update => {
                update.select('.set-concept')
                    .on('mouseover',(e,d) => {
                        d3.select('#set-trash-'+d.name).transition(1000).style('max-width','15px').style('opacity',1).style('margin-right','4px')
                    })
                    .on('mouseout', (e,d) => {
                        d3.select('#set-trash-' + d.name).transition(1000).style('max-width', '0px').style('opacity', 0).style('margin-right', '0px')
                    })
                update.select('.set-trash')
                    .on('mouseover',(e,d) => {
                        d3.select('#set-trash-'+d.name).transition(1000).style('max-width','15px').style('opacity',1).style('margin-right','4px')
                        const el = e.currentTarget
                        el.__hoverTimeout__ = setTimeout(() => {
                            showActionLabel('Remove concept','enter',e)
                        }, 1200)
                    })
                    .on("mouseout", (e,d) => {
                        clearTimeout(e.currentTarget.__hoverTimeout__)
                        showActionLabel('','leave',e)
                        d3.select('#set-trash-' + d.name).transition(1000).style('max-width', '0px').style('opacity', 0).style('margin-right', '0px')
                    })
                    .on('click',(e,d) => {
                        showActionLabel('','leave',e)
                        const arrayToString = sidebarRoot.name.filter(root => root !== d.name).join(",")
                        navigate(`/${arrayToString}`)
                    })
                update.select('.set-card')
                    .style('box-shadow', d => conceptNames.includes(d.name) || d.leaf ? '0 0 0 1px rgba(0, 0, 0, 0.02),0 2px 10px rgba(0, 0, 0, 0.15)' : 'none')
                    .style('background-color', d => d.levels === '-1' ? 'none' : conceptNames.includes(d.name) || d.leaf ? 'white' : '#ebebeb')
                update.select('.set-circle')
                    .classed('list-circle-dash', d => d.concept.record_counts === 0 && !d.leaf ? true : false)
                    .classed('list-circle', d => d.concept.record_counts === 0 && !d.leaf ? false : true)
                    .classed('btn', d => conceptNames.includes(d.name) || d.leaf ? true : false)
                    .style("pointer-events", d => conceptNames.includes(d.name) || d.leaf ? 'all' : 'none')
                    .style('background', d => {
                        if (d.concept.record_counts === 0 && !d.leaf) return "none"
                        if (conceptNames.includes(d.name) || d.leaf) {
                            if (!d.concept.standard_concept) {return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, "+ d.color + " 0.5px," + d.color + " 2px)"} 
                            else {return "none"}
                        }
                        else {
                            if (!d.concept.standard_concept) return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, #d6d6d6 0.5px, #d6d6d6 2px)"  
                            else {return "none"}

                        }      
                    })
                    .style("background-color", d => {
                        if (d.concept.record_counts === 0 && !d.leaf) return "transparent"
                        if (conceptNames.includes(d.name) || d.leaf) {
                            if (d.concept.standard_concept) {return d.color} 
                            else {return "transparent"}
                        }
                        else return '#d6d6d6'
                    }) 
                    .style('border', d => d.concept.record_counts === 0 && !d.leaf ? '1px solid #b2b2b2' : conceptNames.includes(d.name) || d.leaf ? `1px solid ${d.color}` : '1px solid #d6d6d6')
                    .on('mouseover',(e,d) => setHovered([d.name]))
                    .on('mouseout', (e,d) => setHovered([]))
                update.select('.set-title-p')
                    .style('opacity', d => conceptNames.includes(d.name) || d.leaf ? 1 : 0.6)
                update.select('.set-info-icon')
                    .on('mouseover',(e,d) => d3.select('#set-info-icon-'+d.name).transition().style('opacity',1))
                    .on('mouseout', (e,d) => {if(d3.select('#set-info-container-'+d.name).style('height') !== '45px') d3.select('#set-info-icon-'+d.name).transition().style('opacity',0.2)})
                    .on('click', (e,d) => {
                        if (d3.select('#set-info-container-'+d.name).style('height') === '45px') {
                            d3.select('#set-info-icon-'+d.name).transition().style('opacity',0.2)
                            d3.select('#set-info-container-'+d.name).transition().style('opacity',0).style('height','0px').style('padding-top','0px').style('margin','0px 0px 0px 22px')
                            d3.select('#set-card-'+d.name).transition().style('border-radius','20px')
                        } else {
                            d3.select('#set-info-icon-'+d.name).transition().style('opacity',1)
                            d3.select('#set-info-container-'+d.name).transition().style('opacity',1).style('height','45px').style('padding-top','4px').style('margin','4px 4px 4px 22px')
                            d3.select('#set-card-'+d.name).transition().style('border-radius','12px')
                        }
                    })
                update.select('.set-info-container')
                    .style('border-top', d => conceptNames.includes(d.name) || d.leaf ? '1px solid color-mix(in srgb, #36126d, white 90%)' : '1px solid color-mix(in srgb, #36126d, white 78%)')
                update.select('.descendants-box')
                    .style('border', d => d.descendants ? '1px solid #808080' : '1px solid #e0e0e0')
                    .on('click', (e,d) => setExcludeInclude('descendants',d.name))
                update.select('.descendants-check')
                    .style('display', d => d.descendants ? 'block' : 'none') 
                update.select('.descendants-p')
                    .classed('selectedText', d => d.descendants ? true : false)
                update.select('.exclude-box')
                    .style('border', d => d.exclude ? '1px solid #808080' : '1px solid #e0e0e0')
                    .on('click', (e,d) => setExcludeInclude('exclude',d.name))
                update.select('.exclude-check')
                    .style('display', d => d.exclude ? 'block' : 'none') 
                update.select('.exclude-p')
                    .classed('selectedText', d => d.exclude ? true : false)
                update.select('.set-counts')
                    .html(d => countType === 'record' ? d.descendant_counts : d.descendant_person_counts)
            })
        }
        // tree
        function drawTree() {
            console.log('nodes',nodes,'links',links,'selected',selectedConcepts)
            // get extent of total counts
            let sums = []
            nodes.forEach(node => {
                countType === 'record' ? sums.push(Math.sqrt(node.total_counts)) : sums.push(Math.sqrt(node.person_counts))
                node.mappings.forEach(map => countType === 'record' ? sums.push(Math.sqrt(map.total_counts)) : sums.push(Math.sqrt(map.person_counts)))
            })
            const extent = d3.extent(sums)
            const scaleRadius = d3.scaleLinear().domain([0, extent[1]]).range(extent[1] === 0 ? [4,4] : [18, 42])
            // get dimensions
            let genHeight
            let num
            let width = d3.select("#tree").node().getBoundingClientRect().width + margin*2
            let nodeHeight = 90
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
            let cy = 50
            const arrowSize = 44
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
                .attr("stop-color", '#c2c2c2')
                .attr("stop-opacity", 1)
            linearGradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", '#c2c2c2')
                .attr("stop-opacity", 0.2)
            // get subsumes label positioning
            const getLabel = d => {
                let labelPosition = {x: 0, y: 0}
                    labelPosition.x = d.data.concept.standard_concept ? d.x : d.x ;
                    if (countType === 'record') labelPosition.y = d.levels === '-1' ? cy + (genHeight[d.distance]) + 30 : d.total_counts > 0 ? cy + (genHeight[d.distance]) - scaleRadius(Math.sqrt(d.total_counts)) - 7 : cy + (genHeight[d.distance]) - scaleRadius(Math.sqrt(d.total_counts)) - 9; 
                    else labelPosition.y = d.levels === '-1' ? cy + (genHeight[d.distance]) + 30 : d.person_counts > 0 ? cy + (genHeight[d.distance]) - scaleRadius(Math.sqrt(d.person_counts)) - 7 : cy + (genHeight[d.distance]) - scaleRadius(Math.sqrt(d.person_counts)) - 9;
                return labelPosition 
            }
            // get map node positioning 
            const getMap = d => {
                let mapPosition = {x: 0, y: 0}
                if (mapRoot.includes(d.source.name)) {
                    mapPosition.x = d.source.x + d.direction*200
                } else {
                    if (countType === 'record') mapPosition.x = d.source.x + d.direction*(scaleRadius(Math.sqrt(d.source.total_counts)) + 28)
                    else mapPosition.x = d.source.x + d.direction*(scaleRadius(Math.sqrt(d.source.person_counts)) + 28)
                }
                if (countType === 'record') mapPosition.y = d.total_counts > 0 ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) - scaleRadius(Math.sqrt(d.total_counts)) - 7 : getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) - scaleRadius(Math.sqrt(d.total_counts)) - 9
                else mapPosition.y = d.person_counts > 0 ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) - scaleRadius(Math.sqrt(d.person_counts)) - 7 : getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) - scaleRadius(Math.sqrt(d.person_counts)) - 9
                return mapPosition
            }
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
                                .classed('line-path btn',true)
                                .attr('fill','none')
                                .attr('stroke', d => (inclusions.includes(d.source.name) || d.source.mappings.map(m => m.name).some(m => inclusions.includes(m))) && (inclusions.includes(d.target.name) || d.target.mappings.map(m => m.name).some(m => inclusions.includes(m))) ? '#c2c2c2' : '#e0e0e0')
                                .attr('stroke-width', 1.5)
                                .attr("d", d => {
                                    let sourceY, targetY
                                    let sourceX = d.source.x
                                    let targetX = d.target.x
                                    if (countType === 'record') {
                                        sourceY = d.source.distance > d.target.distance ? cy + (genHeight[d.source.distance]) - scaleRadius(Math.sqrt(d.source.total_counts)) - 48 : cy + (genHeight[d.source.distance]) + scaleRadius(Math.sqrt(d.source.total_counts)) + 18
                                        targetY = d.source.distance >= d.target.distance ? cy + (genHeight[d.target.distance]) + scaleRadius(Math.sqrt(d.target.total_counts)) + 18 : cy + (genHeight[d.target.distance]) - scaleRadius(Math.sqrt(d.target.total_counts)) - 48
                                    } else {
                                        sourceY = d.source.distance > d.target.distance ? cy + (genHeight[d.source.distance]) - scaleRadius(Math.sqrt(d.source.person_counts)) - 48 : cy + (genHeight[d.source.distance]) + scaleRadius(Math.sqrt(d.source.person_counts)) + 18
                                        targetY = d.source.distance >= d.target.distance ? cy + (genHeight[d.target.distance]) + scaleRadius(Math.sqrt(d.target.person_counts)) + 18 : cy + (genHeight[d.target.distance]) - scaleRadius(Math.sqrt(d.target.person_counts)) - 48
                                    }
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
                            line.append('path')
                                .classed('line-background btn',true)
                                .attr('fill','none')
                                .attr('stroke','transparent')
                                .attr('stroke-width',5)
                                .attr("d", d => {
                                    let sourceY, targetY
                                    let sourceX = d.source.x
                                    let targetX = d.target.x
                                    if (countType === 'record') {
                                        sourceY = d.source.distance > d.target.distance ? cy + (genHeight[d.source.distance]) - scaleRadius(Math.sqrt(d.source.total_counts)) - 48 : cy + (genHeight[d.source.distance]) + scaleRadius(Math.sqrt(d.source.total_counts)) + 18
                                        targetY = d.source.distance >= d.target.distance ? cy + (genHeight[d.target.distance]) + scaleRadius(Math.sqrt(d.target.total_counts)) + 18 : cy + (genHeight[d.target.distance]) - scaleRadius(Math.sqrt(d.target.total_counts)) - 48
                                    } else {
                                        sourceY = d.source.distance > d.target.distance ? cy + (genHeight[d.source.distance]) - scaleRadius(Math.sqrt(d.source.person_counts)) - 48 : cy + (genHeight[d.source.distance]) + scaleRadius(Math.sqrt(d.source.person_counts)) + 18
                                        targetY = d.source.distance >= d.target.distance ? cy + (genHeight[d.target.distance]) + scaleRadius(Math.sqrt(d.target.person_counts)) + 18 : cy + (genHeight[d.target.distance]) - scaleRadius(Math.sqrt(d.target.person_counts)) - 48
                                    }
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
                                .attr('fill', d => (inclusions.includes(d.source.name) || d.source.mappings.map(m => m.name).some(m => inclusions.includes(m))) && (inclusions.includes(d.target.name) || d.target.mappings.map(m => m.name).some(m => inclusions.includes(m))) ? '#c2c2c2' : '#e0e0e0')
                                .attr("d", d3.symbol().type(d3.symbolTriangle).size(arrowSize))
                                .attr("transform", d => {
                                    let x = d.target.x
                                    let y
                                    if (countType === 'record') y = d.source.distance >= d.target.distance ? d.target.total_counts !== 0 ? cy + (genHeight[d.target.distance]) + scaleRadius(Math.sqrt(d.target.total_counts)) + 18 : cy + (genHeight[d.target.distance]) + scaleRadius(Math.sqrt(d.target.total_counts)) + 25 : d.target.total_counts !== 0 ? cy + (genHeight[d.target.distance]) - scaleRadius(Math.sqrt(d.target.total_counts)) - 48 : cy + (genHeight[d.target.distance]) - scaleRadius(Math.sqrt(d.target.total_counts)) - 50
                                    else y = d.source.distance >= d.target.distance ? d.target.person_counts !== 0 ? cy + (genHeight[d.target.distance]) + scaleRadius(Math.sqrt(d.target.person_counts)) + 18 : cy + (genHeight[d.target.distance]) + scaleRadius(Math.sqrt(d.target.person_counts)) + 25 : d.target.person_counts !== 0 ? cy + (genHeight[d.target.distance]) - scaleRadius(Math.sqrt(d.target.person_counts)) - 48 : cy + (genHeight[d.target.distance]) - scaleRadius(Math.sqrt(d.target.person_counts)) - 50
                                    return d.source.distance >= d.target.distance ? "translate(" + x + "," + y + ")" : "translate(" + x + "," + y + ")rotate(" + 180 + ")"
                                }) 
                        return geometry 
                    }, update => {
                            update.select('.tree-line')
                                .transition()
                                .style('opacity', d => hovered.includes(d.source.name) && hovered.includes(d.target.name) ? 1 : hovered.length > 0 ? 0.2 : 1)
                            update.select('.line-background')
                                .attr("d", d => {
                                    let sourceY, targetY
                                    let sourceX = d.source.x
                                    let targetX = d.target.x
                                    if (countType === 'record') {
                                        sourceY = d.source.distance > d.target.distance ? cy + (genHeight[d.source.distance]) - scaleRadius(Math.sqrt(d.source.total_counts)) - 48 : cy + (genHeight[d.source.distance]) + scaleRadius(Math.sqrt(d.source.total_counts)) + 18
                                        targetY = d.source.distance >= d.target.distance ? cy + (genHeight[d.target.distance]) + scaleRadius(Math.sqrt(d.target.total_counts)) + 18 : cy + (genHeight[d.target.distance]) - scaleRadius(Math.sqrt(d.target.total_counts)) - 48
                                    } else {
                                        sourceY = d.source.distance > d.target.distance ? cy + (genHeight[d.source.distance]) - scaleRadius(Math.sqrt(d.source.person_counts)) - 48 : cy + (genHeight[d.source.distance]) + scaleRadius(Math.sqrt(d.source.person_counts)) + 18
                                        targetY = d.source.distance >= d.target.distance ? cy + (genHeight[d.target.distance]) + scaleRadius(Math.sqrt(d.target.person_counts)) + 18 : cy + (genHeight[d.target.distance]) - scaleRadius(Math.sqrt(d.target.person_counts)) - 48
                                    }
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
                                .attr('stroke', d => (inclusions.includes(d.source.name) || d.source.mappings.map(m => m.name).some(m => inclusions.includes(m))) && (inclusions.includes(d.target.name) || d.target.mappings.map(m => m.name).some(m => inclusions.includes(m))) ? '#c2c2c2' : '#e0e0e0')
                                .attr("d", d => {
                                    let sourceY, targetY
                                    let sourceX = d.source.x
                                    let targetX = d.target.x
                                    if (countType === 'record') {
                                        sourceY = d.source.distance > d.target.distance ? cy + (genHeight[d.source.distance]) - scaleRadius(Math.sqrt(d.source.total_counts)) - 48 : cy + (genHeight[d.source.distance]) + scaleRadius(Math.sqrt(d.source.total_counts)) + 18
                                        targetY = d.source.distance >= d.target.distance ? cy + (genHeight[d.target.distance]) + scaleRadius(Math.sqrt(d.target.total_counts)) + 18 : cy + (genHeight[d.target.distance]) - scaleRadius(Math.sqrt(d.target.total_counts)) - 48
                                    } else {
                                        sourceY = d.source.distance > d.target.distance ? cy + (genHeight[d.source.distance]) - scaleRadius(Math.sqrt(d.source.person_counts)) - 48 : cy + (genHeight[d.source.distance]) + scaleRadius(Math.sqrt(d.source.person_counts)) + 18
                                        targetY = d.source.distance >= d.target.distance ? cy + (genHeight[d.target.distance]) + scaleRadius(Math.sqrt(d.target.person_counts)) + 18 : cy + (genHeight[d.target.distance]) - scaleRadius(Math.sqrt(d.target.person_counts)) - 48
                                    }
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
                            update.select('.tree-arrow')
                                .transition()
                                .duration(500)
                                .attr('fill', d => (inclusions.includes(d.source.name) || d.source.mappings.map(m => m.name).some(m => inclusions.includes(m))) && (inclusions.includes(d.target.name) || d.target.mappings.map(m => m.name).some(m => inclusions.includes(m))) ? '#c2c2c2' : '#e0e0e0')
                                .attr("d", d3.symbol().type(d3.symbolTriangle).size(arrowSize))
                                .attr("transform", d => {
                                    let x = d.target.x
                                    let y
                                    if (countType === 'record') y = d.source.distance >= d.target.distance ? d.target.total_counts !== 0 ? cy + (genHeight[d.target.distance]) + scaleRadius(Math.sqrt(d.target.total_counts)) + 18 : cy + (genHeight[d.target.distance]) + scaleRadius(Math.sqrt(d.target.total_counts)) + 25 : d.target.total_counts !== 0 ? cy + (genHeight[d.target.distance]) - scaleRadius(Math.sqrt(d.target.total_counts)) - 48 : cy + (genHeight[d.target.distance]) - scaleRadius(Math.sqrt(d.target.total_counts)) - 50
                                    else y = d.source.distance >= d.target.distance ? d.target.person_counts !== 0 ? cy + (genHeight[d.target.distance]) + scaleRadius(Math.sqrt(d.target.person_counts)) + 18 : cy + (genHeight[d.target.distance]) + scaleRadius(Math.sqrt(d.target.person_counts)) + 25 : d.target.person_counts !== 0 ? cy + (genHeight[d.target.distance]) - scaleRadius(Math.sqrt(d.target.person_counts)) - 48 : cy + (genHeight[d.target.distance]) - scaleRadius(Math.sqrt(d.target.person_counts)) - 50
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
                            const geometry = enter.append('g')
                                .classed('map-node',true)
                            const mapNode = geometry.append('g')
                                .classed('map-node-main btn', true)
                                .attr('id', d => 'map-node-'+d.name)
                                .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                            const mapLine = mapNode.append('g')
                                .classed('map-link',true)
                                .style('display', d => mapRoot.includes(d.source.name) ? 'block' : 'none')
                                .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                                .lower()
                            mapLine.append('path')
                                .classed('map-line', true)
                                .attr('fill','none')
                                .attr('stroke-width', 1.5)
                                .attr('stroke-dasharray', '4 2')
                                .attr('stroke', d => conceptNames.includes(d.name) ? '#c2c2c2' : '#e0e0e0')
                                .attr("d", d => {
                                    let sourceX = getMap(d).x 
                                    let sourceY = mapRoot.includes(d.source.name) ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) : cy + (genHeight[d.distance])
                                    let targetY = cy + (genHeight[d.distance])
                                    let targetX
                                    if (countType === 'record') targetX = mapRoot.includes(d.source.name) ? d.direction === -1 ? d.source.x - scaleRadius(Math.sqrt(d.source.total_counts)) - 24 : d.source.x + scaleRadius(Math.sqrt(d.source.total_counts)) + 24 : getMap(d).x 
                                    else targetX = mapRoot.includes(d.source.name) ? d.direction === -1 ? d.source.x - scaleRadius(Math.sqrt(d.source.person_counts)) - 24 : d.source.x + scaleRadius(Math.sqrt(d.source.person_counts)) + 24 : getMap(d).x 
                                    return curveX({source: [sourceX, sourceY], target: [targetX, targetY]})}
                                )
                                .lower()
                            mapLine.append('path')
                                .classed('map-tree-arrow', true)
                                .attr('id', d => 'map-arrow-'+d.name)
                                .attr('fill', d => d.source.mappings?.map(d => d.name).some(name => conceptNames.includes(name)) ? '#c2c2c2' : '#e0e0e0')
                                .attr("d", d3.symbol().type(d3.symbolTriangle).size(arrowSize))
                                .attr("transform", d => {
                                    let x 
                                    if (countType === 'record') x = d.direction === -1 ? d.source.x - scaleRadius(Math.sqrt(d.source.total_counts)) - 26 : getMap(d).x - scaleRadius(Math.sqrt(d.total_counts)) - 16
                                    else x = d.direction === -1 ? d.source.x - scaleRadius(Math.sqrt(d.source.person_counts)) - 26 : getMap(d).x - scaleRadius(Math.sqrt(d.person_counts)) - 16
                                    let y = d.direction === -1 ? cy + (genHeight[d.distance]) : getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d)
                                    return "translate(" + x + "," + y + ")rotate(" + 90 + ")"
                                }) 
                            mapNode.append('circle')
                                .classed('map-tree-circle-background', true)
                                .attr('r', d => !mapRoot.includes(d.source.name) ? 0 : countType === 'record' ? scaleRadius(Math.sqrt(d.total_counts)) + 2 : scaleRadius(Math.sqrt(d.person_counts)) + 2)
                                .attr('cx', d => getMap(d).x)
                                .attr('cy', d => mapRoot.includes(d.source.name) ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) : getYPosition(d.source, 'z', cy + (genHeight[d.distance]), d))
                            mapNode.append('circle')
                                .attr('class', d => `map-tree-circle btn map-circle-${d.source.name}`)
                                .attr('id', d => 'tree-circle-' + d.name)
                                .attr('r', d => mapRoot.includes(d.source.name) ? scaleRadius(Math.sqrt(d.total_counts)) : 12)
                                .style('fill', d => {
                                    if ((countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) && mapRoot.includes(d.source.name)) return 'white'
                                    else {
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
                                        } else {
                                            if (mapRoot.includes(d.source.name)) return '#f2f2f5'
                                            else return '#ebebeb'
                                        }    
                                    }
                                })
                                .attr('stroke', d => mapRoot.includes(d.source.name) ? conceptNames.includes(d.name) ? d.color : (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) ? 'none' : '#ebebeb' : 'white')
                                .attr('stroke-width', 1.5)
                                .attr('cx', d => getMap(d).x)
                                .attr('cy', d => mapRoot.includes(d.source.name) ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) : getYPosition(d.source, 'z', cy + (genHeight[d.distance]), d))
                                .on('mouseover',(e,d) => {
                                    e.stopPropagation()
                                    hoverMappings(d.source,'enter')
                                    setVisible(false)
                                })
                                .on('mouseout',(e,d) => {hoverMappings(d.source,'leave');setVisible(false)})
                                .on('click',(e,d) => {
                                    if (!mapRoot.includes(d.source.name)) {
                                        setMapRoot([...mapRoot,d.source.name])
                                        updateWidth([...mapRoot,d.source.name])    
                                    } else {
                                        setMapRoot([...mapRoot,d.source.name])
                                        updateWidth([...mapRoot,d.source.name])
                                    }
                                    
                                })
                                .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                                .style('pointer-events', d => mapRoot.includes(d.source.name) ? 'none' : 'all')
                                .raise()
                            const mapGroup = mapNode.append('g')
                                .classed('map-group',true)
                                .style('display', d => mapRoot.includes(d.source.name) ? 'block' : 'none')
                                .raise()
                            const mapCounts = mapGroup.append('g')
                                .attr('id', d => 'node-label-'+d.name)
                                .style('opacity',1)
                            mapCounts.append('text')
                                .classed('map-total-counts num', true)
                                .attr('id', d => 'total-counts-' + d.name)
                                .text(d => countType === 'record' ? formatThousands(d.total_counts) : formatThousands(d.person_counts))
                                .attr('fill', d => conceptNames.includes(d.name) ? 'white' : '#36126d')
                                .style('font-size', '9px')
                                .attr('x', d => getMap(d).x)
                                .attr('y', d => getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) - 1)
                            mapCounts.append('text')
                                .classed('map-total-counts-label', true)
                                .style('font-size', '9px')
                                .text(() => countType === 'record' ? 'RC' : 'PC')
                                .attr('fill', d => conceptNames.includes(d.name) ? 'white' : '#36126d')
                                .attr('x', d => getMap(d).x - 6)
                                .attr('y', d => getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) + 9)
                            const mapDrc = mapGroup.append('g')
                                .classed('map-drc-group',true)
                                .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                            const mapDrcText = mapDrc.append('text')
                                .classed('map-drc-text',true)
                                .attr('id', d => 'drc-text-'+d.name)
                                .attr('fill', '#36126d')
                                .attr('opacity', 0.6)
                                .attr('x', d => getMap(d).x)
                                .attr('y', d => countType === 'record' ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) + scaleRadius(Math.sqrt(d.total_counts)) + 18 : getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) + scaleRadius(Math.sqrt(d.person_counts)) + 18)
                            mapDrcText.append('tspan')
                                .classed('map-drc-num num',true)
                                .text(d => countType === 'record' ? formatThousands(d.descendant_counts) : formatThousands(d.descendant_person_counts))
                                .raise()
                            mapDrcText.append('tspan')
                                .classed('map-drc-label-tree',true)
                                .text(() => countType === 'record' ? ' DRC' : ' DPC')
                            mapDrc.append('rect')
                                .classed('map-drc-rect',true)
                                .attr('height',16)
                                .attr("rx", 8)
                                .attr("ry", 8)
                                .attr('fill', d => d.descendant_counts === 0 ? 'transparent' : '#f2f2f5')
                                .attr('width',d => d3.select('#drc-text-'+d.name).node().getBBox().width + 10)
                                .attr('x', d => getMap(d).x - (d3.select('#drc-text-'+d.name).node().getBBox().width + 10)/2)
                                .attr('y', d => countType === 'record' ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) + scaleRadius(Math.sqrt(d.total_counts)) + 7 : getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) + scaleRadius(Math.sqrt(d.person_counts)) + 7)
                                .lower()
                            const mapLabel = mapGroup.append('g')
                                .classed('map-label btn', true)
                                .on('mouseover', (e, d) => {
                                    if (!sidebarRoot.name.includes(d.name)) {
                                        const el = e.currentTarget
                                        el.__hoverTimeout__ = setTimeout(() => {
                                            showActionLabel('Select concept','enter',e)
                                        }, 1200)    
                                    }
                                })
                                .on('mouseout', (e,d) => {
                                    clearTimeout(e.currentTarget.__hoverTimeout__)
                                    showActionLabel('','leave',e)
                                    showConfirmationPopup(d,'leave')
                                })
                                .on('click', (e,d) => {
                                    clearTimeout(e.currentTarget.__hoverTimeout__)
                                    showActionLabel('','leave')
                                    if (!sidebarRoot.name.includes(d.name)) {
                                        setVisible(false)
                                        showConfirmationPopup(d, 'enter', e)
                                    }
                                })
                            const mapText = mapLabel.append('g')
                                .attr('id', d => 'label-text-' + d.name)
                            mapText.append('text')
                                .classed('map-label-name',true)
                                .attr('text-anchor', 'middle')
                                .attr('font-weight', 500)
                                .attr('fill', '#36126d')
                                .text(d => {
                                    let concept_info = d.data.concept
                                    let text = concept_info.concept_name || concept_info.concept_id.toString()
                                    let maxWidth = 26
                                    return text.substring(0, maxWidth) + (text.length > maxWidth ? '...' : '    ') 
                                })
                                .attr('x', d => getMap(d).x)
                                .attr('y', d => getMap(d).y - 21)
                                .style('opacity', d => conceptNames.includes(d.name) ? 1 : 0.6)
                            const mapLine2 = mapText.append('text')
                                .classed('map-label-line2',true)
                                .attr('text-anchor', 'middle')
                                .attr('fill', '#4c4c4c')
                                .style('opacity', d => conceptNames.includes(d.name) ? 1 : 0.6)
                                .attr('x', d => getMap(d).x)
                                .attr('y', d => getMap(d).y - 7)
                            mapLine2.append('tspan')
                                .classed('map-label-code num',true)
                                .text(d => d.data.concept.concept_code + '  ')
                                .attr('font-weight', 500)
                            mapLine2.append('tspan')
                                .classed('map-label-vocabulary', true)
                                .text(d => d.data.concept.vocabulary_id)
                            mapLabel.append('rect')
                                .classed('map-label-rect', true)
                                .attr('id', d => 'label-rect-' + d.name)
                                .attr('width', d => d3.select("#label-text-" + d.name).node().getBBox().width + 16)
                                .attr('height', 36)
                                .attr("rx", 8)
                                .attr("ry", 8)
                                .attr('x', d => getMap(d).x - (d3.select("#label-text-" + d.name).node().getBBox().width + 16)/2)
                                .attr('y', d => getMap(d).y - 35)
                                .attr('fill', d => conceptNames.includes(d.name) ? 'white' : '#f5f5f5')
                                .style("filter", d => conceptNames.includes(d.name) ? "drop-shadow(0px 0px 4px rgba(0, 0, 0, 0.16))" : 'none')
                                .attr('stroke-width',1)
                                .attr('stroke', d => sidebarRoot.name.includes(d.name) ? '#6a23d6' : 'transparent')
                                .lower()
                            geometry.append('rect')
                                .classed('map-rect btn',true)
                                .style('display', d => mapRoot.includes(d.source.name) ? 'block' : 'none')
                                .style('pointer-events','all')
                                .attr('fill','transparent')
                                .attr('width',120)
                                .attr('x', d => getMap(d).x - 60)
                                .attr('y', d => countType === 'record' ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) - (120 + scaleRadius(Math.sqrt(d.total_counts)))/2 : getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) - (120 + scaleRadius(Math.sqrt(d.person_counts)))/2)
                                .attr('height', d => countType === 'record' ? 100 + scaleRadius(Math.sqrt(d.total_counts)) : 100 + scaleRadius(Math.sqrt(d.person_counts)))
                                .on('mouseover', function (e,d) {
                                    const el = this
                                    el.__hoverTimeout__ = setTimeout(() => {
                                        if (conceptNames.includes(d.name)) setHovered([d.name])
                                        if (d.levels !== '-1') tooltipHover(d, "enter", e)  
                                    }, 600)    
                                })
                                .on('mouseout', function (e,d) {
                                    const el = this
                                    clearTimeout(el.__hoverTimeout__)
                                    setHovered([])
                                    tooltipHover(d, "leave", e)   
                                })
                                .raise()
                        }, update => {
                            update.select('.map-node-main')
                                .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                            update.select('.map-link')
                                .style('display', d => mapRoot.includes(d.source.name) ? 'block' : 'none')
                                .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                            update.select('.map-line')
                                .attr('stroke', d => conceptNames.includes(d.name) ? '#c2c2c2' : '#e0e0e0')
                                .attr("d", d => {
                                    let sourceX = getMap(d).x 
                                    let sourceY = mapRoot.includes(d.source.name) ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) : cy + (genHeight[d.distance])
                                    let targetY = cy + (genHeight[d.distance])
                                    let targetX
                                    if (countType === 'record') targetX = mapRoot.includes(d.source.name) ? d.direction === -1 ? d.source.x - scaleRadius(Math.sqrt(d.source.total_counts)) - 24 : d.source.x + scaleRadius(Math.sqrt(d.source.total_counts)) + 24 : getMap(d).x 
                                    else targetX = mapRoot.includes(d.source.name) ? d.direction === -1 ? d.source.x - scaleRadius(Math.sqrt(d.source.person_counts)) - 24 : d.source.x + scaleRadius(Math.sqrt(d.source.person_counts)) + 24 : getMap(d).x 
                                    return curveX({source: [sourceX, sourceY], target: [targetX, targetY]})}
                                )
                            update.select('.map-tree-arrow')
                                .attr('fill', d => d.source.mappings?.map(d => d.name).some(name => conceptNames.includes(name)) ? '#c2c2c2' : '#e0e0e0')
                                .attr("d", d3.symbol().type(d3.symbolTriangle).size(arrowSize))
                                .attr("transform", d => {
                                    let x 
                                    if (countType === 'record') x = d.direction === -1 ? d.source.x - scaleRadius(Math.sqrt(d.source.total_counts)) - 26 : getMap(d).x - scaleRadius(Math.sqrt(d.total_counts)) - 16
                                    else x = d.direction === -1 ? d.source.x - scaleRadius(Math.sqrt(d.source.person_counts)) - 26 : getMap(d).x - scaleRadius(Math.sqrt(d.person_counts)) - 16
                                    let y = d.direction === -1 ? cy + (genHeight[d.distance]) : getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d)
                                    return "translate(" + x + "," + y + ")rotate(" + 90 + ")"
                                })  
                            update.select('.map-rect')
                                .style('display', d => mapRoot.includes(d.source.name) ? 'block' : 'none')
                                .attr('x', d => getMap(d).x - 60)
                                .attr('y', d => countType === 'record' ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) - (120 + scaleRadius(Math.sqrt(d.total_counts)))/2 : getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) - (120 + scaleRadius(Math.sqrt(d.person_counts)))/2)
                                .attr('height', d => countType === 'record' ? 100 + scaleRadius(Math.sqrt(d.total_counts)) : 100 + scaleRadius(Math.sqrt(d.person_counts)))
                                .on('mouseover', function (e,d) {
                                    const el = this
                                    el.__hoverTimeout__ = setTimeout(() => {
                                        if (conceptNames.includes(d.name)) setHovered([d.name])
                                        if (d.levels !== '-1') tooltipHover(d, "enter", e)  
                                    }, 600)    
                                })
                                .on('mouseout', function (e,d) {
                                    const el = this
                                    clearTimeout(el.__hoverTimeout__)
                                    setHovered([])
                                    tooltipHover(d, "leave", e)   
                                })
                            update.select('.map-tree-circle-background')
                                .attr('r', d => !mapRoot.includes(d.source.name) ? 0 : countType === 'record' ? scaleRadius(Math.sqrt(d.total_counts)) + 2 : scaleRadius(Math.sqrt(d.person_counts)) + 2)
                                .attr('cx', d => getMap(d).x)
                                .attr('cy', d => mapRoot.includes(d.source.name) ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) : getYPosition(d.source, 'z', cy + (genHeight[d.distance]), d))
                            update.select('.map-tree-circle')
                                .attr('r', d => mapRoot.includes(d.source.name) ? scaleRadius(Math.sqrt(d.total_counts)) : 12)
                                .style('fill', d => {
                                    if ((countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) && mapRoot.includes(d.source.name)) return 'white'
                                    else {
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
                                        } else {
                                            if (mapRoot.includes(d.source.name)) return '#f2f2f5'
                                            else return '#ebebeb'
                                        }    
                                    }
                                })
                                .attr('stroke', d => mapRoot.includes(d.source.name) ? conceptNames.includes(d.name) ? d.color : (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) ? 'none' : '#ebebeb' : 'white')
                                .attr('cx', d => getMap(d).x)
                                .attr('cy', d => mapRoot.includes(d.source.name) ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) : getYPosition(d.source, 'z', cy + (genHeight[d.distance]), d))
                                .on('mouseover',(e,d) => {
                                    e.stopPropagation()
                                    hoverMappings(d.source,'enter')
                                    setVisible(false)
                                })
                                .on('mouseout',(e,d) => {hoverMappings(d.source,'leave');setVisible(false)})
                                .on('click',(e,d) => {
                                    if (!mapRoot.includes(d.source.name)) {
                                        setMapRoot([...mapRoot,d.source.name])
                                        updateWidth([...mapRoot,d.source.name])    
                                    } else {
                                        setMapRoot([...mapRoot,d.source.name])
                                        updateWidth([...mapRoot,d.source.name])
                                    }
                                    
                                })
                                .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                                .style('pointer-events', d => mapRoot.includes(d.source.name) ? 'none' : 'all')
                            update.select('.map-group')
                                .style('display', d => mapRoot.includes(d.source.name) ? 'block' : 'none')
                            update.select('.map-total-counts')
                                .text(d => countType === 'record' ? formatThousands(d.total_counts) : formatThousands(d.person_counts))
                                .attr('fill', d => conceptNames.includes(d.name) ? 'white' : '#36126d')
                                .attr('x', d => getMap(d).x)
                                .attr('y', d => getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) - 1)
                            update.select('.map-total-counts-label')
                                .text(() => countType === 'record' ? 'RC' : 'PC')
                                .attr('fill', d => conceptNames.includes(d.name) ? 'white' : '#36126d')
                                .attr('x', d => getMap(d).x - 6)
                                .attr('y', d => getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) + 9)
                            update.select('.map-drc-group')
                                .classed('map-drc-group',true)
                                .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                            update.select('.map-drc-text')
                                .attr('x', d => getMap(d).x)
                                .attr('y', d => countType === 'record' ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) + scaleRadius(Math.sqrt(d.total_counts)) + 18 : getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) + scaleRadius(Math.sqrt(d.person_counts)) + 18)
                            update.select('.map-drc-num')
                                .text(d => countType === 'record' ? formatThousands(d.descendant_counts) : formatThousands(d.descendant_person_counts))
                            update.select('.map-drc-label-tree')
                                .text(() => countType === 'record' ? ' DRC' : ' DPC')
                            update.select('.map-drc-rect')
                                .attr('fill', d => d.descendant_counts === 0 ? 'transparent' : '#f2f2f5')
                                .attr('width',d => d3.select('#drc-text-'+d.name).node().getBBox().width + 10)
                                .attr('x', d => getMap(d).x - (d3.select('#drc-text-'+d.name).node().getBBox().width + 10)/2)
                                .attr('y', d => countType === 'record' ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) + scaleRadius(Math.sqrt(d.total_counts)) + 7 : getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) + scaleRadius(Math.sqrt(d.person_counts)) + 7)
                            update.select('.map-label')
                                .on('mouseover', (e, d) => {
                                    if (!sidebarRoot.name.includes(d.name)) {
                                        const el = e.currentTarget
                                        el.__hoverTimeout__ = setTimeout(() => {
                                            showActionLabel('Select concept','enter',e)
                                        }, 1200)    
                                    }
                                })
                                .on('mouseout', (e,d) => {
                                    clearTimeout(e.currentTarget.__hoverTimeout__)
                                    showActionLabel('','leave',e)
                                    showConfirmationPopup(d,'leave')
                                })
                                .on('click', (e,d) => {
                                    clearTimeout(e.currentTarget.__hoverTimeout__)
                                    showActionLabel('','leave')
                                    if (!sidebarRoot.name.includes(d.name)) {
                                        setVisible(false)
                                        showConfirmationPopup(d, 'enter', e)
                                    }
                                })
                            update.select('.map-label-name')
                                .text(d => {
                                    let concept_info = d.data.concept
                                    let text = concept_info.concept_name || concept_info.concept_id.toString()
                                    let maxWidth = 26
                                    return text.substring(0, maxWidth) + (text.length > maxWidth ? '...' : '    ') 
                                })
                                .attr('x', d => getMap(d).x)
                                .attr('y', d => getMap(d).y - 21)
                                .style('opacity', d => conceptNames.includes(d.name) ? 1 : 0.6)
                            update.select('.map-label-line2')
                                .style('opacity', d => conceptNames.includes(d.name) ? 1 : 0.6)
                                .attr('x', d => getMap(d).x)
                                .attr('y', d => getMap(d).y - 7)
                            update.select('.map-label-rect')
                                .attr('width', d => d3.select("#label-text-" + d.name).node().getBBox().width + 16)
                                .attr('x', d => getMap(d).x - (d3.select("#label-text-" + d.name).node().getBBox().width + 16)/2)
                                .attr('y', d => getMap(d).y - 35)
                                .attr('fill', d => conceptNames.includes(d.name) ? 'white' : '#f5f5f5')
                                .style("filter", d => conceptNames.includes(d.name) ? "drop-shadow(0px 0px 4px rgba(0, 0, 0, 0.16))" : 'none')
                                .attr('stroke', d => sidebarRoot.name.includes(d.name) ? '#6a23d6' : 'transparent')
                        },exit => exit.remove())
                        //Subsumes node
                        const nodeContainer = geometry.append('g')  
                        const node = nodeContainer.append('g')  
                            .classed('subsumes-node', true)
                            .attr('id', d => 'subsumes-node-'+d.name)
                            .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                            .lower()
                        nodeContainer.append('rect')
                            .classed('node-rect btn',true)
                            .style('display', d => d.levels === '-1' ? 'none' : 'block')
                            .attr('fill','transparent')
                            .attr('x', d => d.x - 60)
                            .attr('y', d => countType === 'record' ? cy + (genHeight[d.distance]) - (120 + scaleRadius(Math.sqrt(d.total_counts)))/2 : cy + (genHeight[d.distance]) - (120 + scaleRadius(Math.sqrt(d.person_counts)))/2)
                            .attr('width',120)
                            .attr('height', d => countType === 'record' ? 100 + scaleRadius(Math.sqrt(d.total_counts)) : 100 + scaleRadius(Math.sqrt(d.person_counts)))
                            .on('mouseover', function (e,d) {
                                const el = this
                                el.__hoverTimeout__ = setTimeout(() => {
                                    if (conceptNames.includes(d.name)) setHovered([d.name])
                                    if (d.levels !== '-1') tooltipHover(d, "enter", e)  
                                }, 600)    
                            })
                            .on('mouseout', function (e,d) {
                                const el = this
                                clearTimeout(el.__hoverTimeout__)
                                setHovered([])
                                tooltipHover(d, "leave", e)   
                            })
                            .raise()
                        const nodeGroup = node.append('g')
                            .classed('node-group',true)
                            .style('display', d => d.levels === '-1' ? 'none' : 'block')
                        nodeGroup.append('circle')
                            .classed('tree-circle-background', true)
                            .attr('r', d => countType === 'record' ? scaleRadius(Math.sqrt(d.total_counts)) + 2 : scaleRadius(Math.sqrt(d.person_counts)) + 2)
                            .attr('cx', d => d.x)
                            .attr('cy', d => cy + (genHeight[d.distance]))
                        nodeGroup.append('circle')
                            .classed('tree-circle btn', true)
                            .attr('id', d => 'tree-circle-' + d.name)
                            .attr('r', d => countType === 'record' ? scaleRadius(Math.sqrt(d.total_counts)) : scaleRadius(Math.sqrt(d.person_counts)))
                            .attr('stroke-width',1.5)
                            .attr('stroke', d => (countType === 'record' && (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0)) || (countType === 'person' && d.person_counts === 0) ? 'none' : conceptNames.includes(d.name) && inclusions.includes(d.name) ? d.color : '#ebebeb')
                            .attr('fill', d => {
                                if ((countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) || (d.leaf && d.descendant_counts !== d.total_counts)) return 'white'
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
                                    } else {return '#f2f2f5'}    
                                }
                            })
                            .attr('cx', d => d.x)
                            .attr('cy', d => cy + (genHeight[d.distance]))
                            .attr('pointer-events', d => (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) || d.levels === "-1" || d.leaf ? "none" : "all")
                        const nodeLabel = nodeGroup.append('g')
                            .attr('id', d => 'node-label-'+d.name)
                            .style('opacity',1)
                        nodeLabel.append('text')
                            .classed('total-counts num', true)
                            .attr('id', d => 'total-counts-' + d.name)
                            .text(d => countType === 'record' ? formatThousands(d.total_counts) : formatThousands(d.person_counts))
                            .attr('fill', d => conceptNames.includes(d.name) && inclusions.includes(d.name) && !d.leaf ? 'white' : '#36126d')
                            .style('font-size', '9px')
                            .attr('x', d => d.x)
                            .attr('y', d => cy + (genHeight[d.distance]) - 1)
                        nodeLabel.append('text')
                            .classed('total-counts-label', true)
                            .style('font-size', '9px')
                            .text(() => countType === 'record' ? 'RC' : 'PC')
                            .attr('fill', d => conceptNames.includes(d.name) && inclusions.includes(d.name) && !d.leaf ? 'white' : '#36126d')
                            .attr('x', d => d.x - 6)
                            .attr('y', d => cy + (genHeight[d.distance]) + 9)
                        const setExpression = geometry.append('g')
                            .classed('set-expression',true)
                            .style('display', d => sidebarRoot.name.includes(d.name) ? 'block' : 'none')
                            .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                            .attr('transform', d => {
                                const xVar = (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) ? 35 : 20
                                if (d.data.concept.standard_concept) return countType === 'record' ? `translate(${d.x + scaleRadius(Math.sqrt(d.total_counts)) + xVar}, 0)` : `translate(${d.x + scaleRadius(Math.sqrt(d.person_counts)) + xVar}, 0)`
                                else return countType === 'record' ? `translate(${d.x - scaleRadius(Math.sqrt(d.total_counts)) - xVar}, 0)` : `translate(${d.x - scaleRadius(Math.sqrt(d.person_counts)) - xVar}, 0)`
                            })
                        setExpression.append('rect')
                            .classed('set-expression-rect',true)
                            .attr('x', -10)
                            .attr('y', d => cy + (genHeight[d.distance]) - 24)
                            .attr("filter", "drop-shadow(0px 0px 4px rgba(0, 0, 0, 0.1))")
                            .attr('width',97)
                            .attr('height',48)
                            .attr('rx',6)
                            .attr('ry',6)
                            .attr('fill','white')
                            .lower()
                        const descendantsBtn = setExpression.append('g')
                            .classed("tree-descendants-btn btn",true)
                            .style('pointer-events', 'all')
                            .attr('text-anchor', d => d.data.concept.standard_concept ? 'start' : 'end')
                            .on('click', (e,d) => {
                                setExcludeInclude('descendants',d.name)
                            })
                        descendantsBtn.append('rect')
                            .classed('tree-descendants-box',true)
                            .attr('width',14)
                            .attr('height',14)
                            .attr('rx',2)
                            .attr('ry',2)
                            .attr('fill', 'none')
                            .attr('stroke', d => descendantsFilter.includes(d.name) ? '#e0e0e0' : '#989898')
                            .attr('x', d => d.data.concept.standard_concept ? -2 : -11)
                            .attr('y', d => cy + (genHeight[d.distance]) + 2)
                        descendantsBtn.append('text')
                            .classed('tree-descendants-check fa-solid',true)
                            .text('\uf00c')
                            .style('opacity',0.5)
                            .attr('font-size', 10)
                            .attr('fill', d => descendantsFilter.includes(d.name) ? 'none' : '#36126d')
                            .attr('x', 0.5)
                            .attr('y', d => cy + (genHeight[d.distance]) + 12)
                        descendantsBtn.append('text')
                            .classed("tree-descendants-text",true)
                            .text('Descendants')
                            .style('opacity', 0.7)
                            .attr('fill', d => descendantsFilter.includes(d.name) ? '#4c4c4c' : '#36126d')
                            .attr('font-weight', d => descendantsFilter.includes(d.name) ? 400 : 500)
                            .attr('x', d => d.data.concept.standard_concept ? 16 : -16)
                            .attr('y', d => cy + (genHeight[d.distance]) + 12.7)
                        const excludeBtn = setExpression.append('g')
                            .classed("tree-exclude-btn btn",true)
                            .style('pointer-events', 'all')
                            .attr('text-anchor', d => d.data.concept.standard_concept ? 'start' : 'end')
                            .on('click', (e,d) => {
                                setExcludeInclude('exclude',d.name)
                            })
                        excludeBtn.append('rect')
                            .classed('tree-exclude-box',true)
                            .attr('width',14)
                            .attr('height',14)
                            .attr('rx',2)
                            .attr('ry',2)
                            .attr('fill', 'none')
                            .attr('stroke', d => !excludeList.includes(d.name) ? '#e0e0e0' : '#989898')
                            .attr('x', d => d.data.concept.standard_concept ? -2 : -11)
                            .attr('y', d => cy + (genHeight[d.distance]) - 16)
                        excludeBtn.append('text')
                            .classed('tree-exclude-check fa-solid',true)
                            .text('\uf00c')
                            .style('opacity',0.5)
                            .attr('font-size', 10)
                            .attr('fill', d => excludeList.includes(d.name) ? '#36126d' : 'none')
                            .attr('x', 0.5)
                            .attr('y', d => cy + (genHeight[d.distance]) - 6)
                        excludeBtn.append('text')
                            .classed("tree-exclude-text",true)
                            .text('Exclude')
                            .style('opacity', 0.7)
                            .attr('fill', d => !excludeList.includes(d.name) ? '#4c4c4c' : '#36126d')
                            .attr('font-weight', d => !excludeList.includes(d.name) ? 400 : 500)
                            .attr('x', d => d.data.concept.standard_concept ? 16 : -16)
                            .attr('y', d => cy + (genHeight[d.distance]) - 5)    
                        // setExpression.append('text')
                        //     .classed('tree-expression-opened btn fa-solid',true)
                        //     .text("\uf0da")
                        //     .style('fill','#b2b2b2')
                        //     .style('opacity',0.5)
                        //     .style('font-size','13px')
                        //     .attr('x', 74)
                        //     .attr('y', d => cy + (genHeight[d.distance]) - 10)
                        //     .on('mouseover',function(e,d) {d3.select(this).transition().style('opacity',1)})
                        //     .on('mouseover',function(e,d) {d3.select(this).transition().style('opacity',0.5)})
                        geometry.append('text')
                            .classed('mappings-btn  mappingBtn fa-solid', true)
                            .attr('id', d => 'mappings-btn-' + d.name)
                            .text(d => mapRoot.includes(d.name) && d.mappings.length > 0 ? "\uf00d" : "\uf0da")
                            .style('font-size', d => mapRoot.includes(d.name) && d.mappings.length > 0 ? '14px' : '15px')
                            .style('display', d => d.mappings.length > 0 ? 'block' : 'none')
                            .style('opacity', d => hovered.length > 0 ? 0.1 : 0.3)
                            .on('mouseover',(e,d) => {
                                e.stopPropagation()
                                hoverMappings(d,'enter')
                                setVisible(false)
                            })
                            .on('mouseout',(e,d) => {hoverMappings(d,'leave');setVisible(false)})
                            .on('click',(e,d) => {
                                if (mapRoot.includes(d.name)) {
                                    let filteredRoots = mapRoot.filter(e => e !== d.name)
                                    setMapRoot(filteredRoots)
                                    updateWidth(filteredRoots)    
                                } else {
                                    setMapRoot([...mapRoot,d.name])
                                    updateWidth([...mapRoot,d.name])
                                }
                                
                            })
                            .attr('x', d => {
                                if (!d.data.concept.standard_concept) return countType === 'record' ? d.x + scaleRadius(Math.sqrt(d.total_counts)) + 15 : d.x + scaleRadius(Math.sqrt(d.person_counts)) + 15 
                                else return countType === 'record' ? d.x - scaleRadius(Math.sqrt(d.total_counts)) - 15 : d.x - scaleRadius(Math.sqrt(d.person_counts)) - 15
                            })
                            .attr('y', d => cy + (genHeight[d.distance]) + 5.5)
                            .raise()
                        const drc = nodeContainer.append('g')
                            .classed('drc-group btn',true)
                            .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                            .on('mouseover',(e,d) => {
                                e.stopPropagation()
                                setVisible(false)
                                const descendants = [...d.included_descendants,...d.descendants].filter((e,n,l) => l.indexOf(e) === n)
                                if (descendants.length > 1 && !d.leaf) setHovered(descendants)                      
                            })
                            .on('mouseout',(e,d) => {setHovered([]);setVisible(false)})
                            .style('display', d => d.levels === '-1' ? 'none' : 'block')
                        const drcText = drc.append('text')
                            .classed('drc-text',true)
                            .attr('id', d => 'drc-text-'+d.name)
                            .attr('fill', d => d.leaf ? 'white' : '#36126d')
                            .attr('opacity', d => d.leaf ? 1 : 0.6)
                            .attr('x', d => d.x)
                            .attr('y', d => countType === 'record' ? cy + (genHeight[d.distance]) + scaleRadius(Math.sqrt(d.total_counts)) + 18 : cy + (genHeight[d.distance]) + scaleRadius(Math.sqrt(d.person_counts)) + 18)
                        drcText.append('tspan')
                            .classed('drc-num num',true)
                            .text(d => countType === 'record' ? formatThousands(d.descendant_counts) : formatThousands(d.descendant_person_counts))
                            .raise()
                        drcText.append('tspan')
                            .classed('drc-label-tree',true)
                            .text(() => countType === 'record' ? ' DRC' : ' DPC')
                        drc.append('rect')
                            .classed('drc-rect',true)
                            .attr('height',16)
                            .attr("rx", 8)
                            .attr("ry", 8)
                            .attr('fill', d => d.leaf ? d.color : d.descendant_counts === 0 || d.descendant_counts === d.total_counts ? 'transparent' : '#f2f2f5')
                            .attr('width',d => d3.select('#drc-text-'+d.name).node().getBBox().width + 10)
                            .attr('x', d => d.x - (d3.select('#drc-text-'+d.name).node().getBBox().width + 10)/2)
                            .attr('y', d => countType === 'record' ? cy + (genHeight[d.distance]) + scaleRadius(Math.sqrt(d.total_counts)) + 7 : cy + (genHeight[d.distance]) + scaleRadius(Math.sqrt(d.person_counts)) + 7)
                            .lower()
                        const label = node.append('g')
                            .classed('label btn', true)
                            .on('mouseover', (e, d) => {
                                if (!sidebarRoot.name.includes(d.name)) {
                                    const el = e.currentTarget
                                    el.__hoverTimeout__ = setTimeout(() => {
                                        showActionLabel('Select concept','enter',e)
                                    }, 1200)    
                                }
                            })
                            .on('mouseout', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave',e)
                                showConfirmationPopup(d,'leave')
                            })
                            .on('click', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave')
                                if (!sidebarRoot.name.includes(d.name)) {
                                    setVisible(false)
                                    showConfirmationPopup(d, 'enter', e)
                                }
                            })
                        const text = label.append('g')
                            .attr('id', d => 'label-text-' + d.name)
                        text.append('text')
                            .classed('label-name',true)
                            .attr('text-anchor', 'middle')
                            .attr('font-weight', 500)
                            .attr('fill', '#36126d')
                            .text(d => {
                                let genLength = 0
                                let maxWidth = 0
                                let concept_info = d.data.concept
                                nodes.forEach(n => n.distance === d.distance ? genLength++ : null)
                                let text = concept_info.concept_name || concept_info.concept_id.toString()
                                if ((relationship === 'mappings' && d.mappings?.length > 0) || mapRoot.includes(d.name)) maxWidth = 21
                                else {
                                    if (genLength === 1) maxWidth = Math.round(width/6)
                                    else maxWidth = 26
                                }  
                                return text.substring(0, maxWidth) + (text.length > maxWidth ? '...' : '    ') 
                            })
                            .attr('x', d => getLabel(d).x)
                            .attr('y', d => getLabel(d).y - 21)
                            .style('opacity', d => conceptNames.includes(d.name) ? 1 : 0.6)
                        const line2 = text.append('text')
                            .classed('label-line2',true)
                            .attr('text-anchor', 'middle')
                            .attr('fill', '#4c4c4c')
                            .style('opacity', d => conceptNames.includes(d.name) ? 1 : 0.6)
                            .attr('x', d => getLabel(d).x)
                            .attr('y', d => getLabel(d).y - 7)
                        line2.append('tspan')
                            .classed('label-code num',true)
                            .text(d => d.data.concept.concept_code + '  ')
                            .attr('font-weight', 500)
                        line2.append('tspan')
                            .classed('label-vocabulary', true)
                            .text(d => d.data.concept.vocabulary_id)
                        label.append('rect')
                            .classed('label-rect', true)
                            .attr('id', d => 'label-rect-' + d.name)
                            .attr('width', d => d3.select("#label-text-" + d.name).node().getBBox().width + 16)
                            .attr('height', 36)
                            .attr("rx", 8)
                            .attr("ry", 8)
                            .attr('x', d => getLabel(d).x - (d3.select("#label-text-" + d.name).node().getBBox().width + 16)/2)
                            .attr('y', d => getLabel(d).y - 35)
                            .attr('fill', d => conceptNames.includes(d.name) ? 'white' : '#f5f5f5')
                            .style("filter", d => conceptNames.includes(d.name) ? "drop-shadow(0px 0px 4px rgba(0, 0, 0, 0.16))" : 'none')
                            .attr('stroke-width',1)
                            .attr('stroke', d => sidebarRoot.name.includes(d.name) ? '#6a23d6' : 'transparent')
                            .lower()
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
                            .attr('y1',d => countType === 'record' ? cy + (genHeight[d.distance]) + scaleRadius(Math.sqrt(d.total_counts)) + 18 : cy + (genHeight[d.distance]) + scaleRadius(Math.sqrt(d.person_counts)) + 18)
                            .attr('x2',d => d.x + 0.1)
                            .attr('y2',d => cy + (genHeight[d.distance]) + (num - 20))
                        pruneLine.append('path')
                            .classed('prune-arrow', true)
                            .attr('fill', '#e0e0e0')
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
                                    let x1 = d.x
                                    let y1 = countType === 'record' ? cy + (genHeight[sourceNode.distance]) + scaleRadius(Math.sqrt(sourceNode.total_counts)) + 18 : cy + (genHeight[sourceNode.distance]) + scaleRadius(Math.sqrt(sourceNode.person_counts)) + 18
                                    let x2 = d.mid
                                    let y2 = cy + (genHeight[sourceNode.distance]) + (num - 20)
                                    return curveY({source: [x1, y1], target: [x2, y2]})
                                })
                            curve.append('path')
                                .classed('prune-curve-background btn',true)
                                .attr('fill', 'none')
                                .attr("stroke", "transparent")
                                .attr('stroke-width', 5)
                                .style('display', pruned ? 'block' : 'none')
                                .attr("d", d => {
                                    let sourceNode = nodes.filter(e => e.name === d.source)[0]
                                    let x1 = d.x
                                    let y1 = countType === 'record' ? cy + (genHeight[sourceNode.distance]) + scaleRadius(Math.sqrt(sourceNode.total_counts)) + 18 : cy + (genHeight[sourceNode.distance]) + scaleRadius(Math.sqrt(sourceNode.person_counts)) + 18
                                    let x2 = d.mid
                                    let y2 = cy + (genHeight[sourceNode.distance]) + (num - 20)
                                    return curveY({source: [x1, y1], target: [x2, y2]})
                                })
                                .on('mouseover',(e,d) => setHovered(d.parents))
                                .on('mouseout',(e,d) => setHovered([]))
                            curve.append('path')
                                .classed('prune-curve-arrow', true)
                                .attr('fill', '#e0e0e0')
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
                                    let x1 = d.x
                                    let y1 = countType === 'record' ? cy + (genHeight[sourceNode.distance]) + scaleRadius(Math.sqrt(sourceNode.total_counts)) + 18 : cy + (genHeight[sourceNode.distance]) + scaleRadius(Math.sqrt(sourceNode.person_counts)) + 18
                                    let x2 = d.mid
                                    let y2 = cy + (genHeight[sourceNode.distance]) + (num - 20)
                                    return curveY({source: [x1, y1], target: [x2, y2]})
                                })
                            update.select(".prune-curve-background")
                                .style('display', pruned ? 'block' : 'none')
                                .attr("d", d => {
                                    let sourceNode = nodes.filter(e => e.name === d.source)[0]
                                    let x1 = d.x
                                    let y1 = countType === 'record' ? cy + (genHeight[sourceNode.distance]) + scaleRadius(Math.sqrt(sourceNode.total_counts)) + 18 : cy + (genHeight[sourceNode.distance]) + scaleRadius(Math.sqrt(sourceNode.person_counts)) + 18
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
                        d3.selectAll('.subsumes-nodes').lower()
                        d3.selectAll('.map-node').raise()
                        d3.selectAll('.prune-curve').lower()
                        return geometry 
                    }, update => {
                        update.selectAll(".map-node").data(d => d.mappings, d => d.name+d.source.name)
                        //Mappings
                        .join(enter => {
                            const geometry = enter.append('g')
                                .classed('map-node',true)
                            const mapNode = geometry.append('g')
                                .classed('map-node-main btn', true)
                                .attr('id', d => 'map-node-'+d.name)
                                .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                            const mapLine = mapNode.append('g')
                                .classed('map-link',true)
                                .style('display', d => mapRoot.includes(d.source.name) ? 'block' : 'none')
                                .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                                .lower()
                            mapLine.append('path')
                                .classed('map-line', true)
                                .attr('fill','none')
                                .attr('stroke-width', 1.5)
                                .attr('stroke-dasharray', '4 2')
                                .attr('stroke', d => conceptNames.includes(d.name) ? '#c2c2c2' : '#e0e0e0')
                                .attr("d", d => {
                                    let sourceX = getMap(d).x 
                                    let sourceY = mapRoot.includes(d.source.name) ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) : cy + (genHeight[d.distance])
                                    let targetY = cy + (genHeight[d.distance])
                                    let targetX
                                    if (countType === 'record') targetX = mapRoot.includes(d.source.name) ? d.direction === -1 ? d.source.x - scaleRadius(Math.sqrt(d.source.total_counts)) - 24 : d.source.x + scaleRadius(Math.sqrt(d.source.total_counts)) + 24 : getMap(d).x 
                                    else targetX = mapRoot.includes(d.source.name) ? d.direction === -1 ? d.source.x - scaleRadius(Math.sqrt(d.source.person_counts)) - 24 : d.source.x + scaleRadius(Math.sqrt(d.source.person_counts)) + 24 : getMap(d).x 
                                    return curveX({source: [sourceX, sourceY], target: [targetX, targetY]})}
                                )
                                .lower()
                            mapLine.append('path')
                                .classed('map-tree-arrow', true)
                                .attr('id', d => 'map-arrow-'+d.name)
                                .attr('fill', d => d.source.mappings?.map(d => d.name).some(name => conceptNames.includes(name)) ? '#c2c2c2' : '#e0e0e0')
                                .attr("d", d3.symbol().type(d3.symbolTriangle).size(arrowSize))
                                .attr("transform", d => {
                                    let x 
                                    if (countType === 'record') x = d.direction === -1 ? d.source.x - scaleRadius(Math.sqrt(d.source.total_counts)) - 26 : getMap(d).x - scaleRadius(Math.sqrt(d.total_counts)) - 16
                                    else x = d.direction === -1 ? d.source.x - scaleRadius(Math.sqrt(d.source.person_counts)) - 26 : getMap(d).x - scaleRadius(Math.sqrt(d.person_counts)) - 16
                                    let y = d.direction === -1 ? cy + (genHeight[d.distance]) : getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d)
                                    return "translate(" + x + "," + y + ")rotate(" + 90 + ")"
                                }) 
                            mapNode.append('circle')
                                .classed('map-tree-circle-background', true)
                                .attr('r', d => !mapRoot.includes(d.source.name) ? 0 : countType === 'record' ? scaleRadius(Math.sqrt(d.total_counts)) + 2 : scaleRadius(Math.sqrt(d.person_counts)) + 2)
                                .attr('cx', d => getMap(d).x)
                                .attr('cy', d => mapRoot.includes(d.source.name) ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) : getYPosition(d.source, 'z', cy + (genHeight[d.distance]), d))
                            mapNode.append('circle')
                                .attr('class', d => `map-tree-circle btn map-circle-${d.source.name}`)
                                .attr('id', d => 'tree-circle-' + d.name)
                                .attr('r', d => mapRoot.includes(d.source.name) ? scaleRadius(Math.sqrt(d.total_counts)) : 12)
                                .style('fill', d => {
                                    if ((countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) && mapRoot.includes(d.source.name)) return 'white'
                                    else {
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
                                        } else {
                                            if (mapRoot.includes(d.source.name)) return '#f2f2f5'
                                            else return '#ebebeb'
                                        }    
                                    }
                                })
                                .attr('stroke', d => mapRoot.includes(d.source.name) ? conceptNames.includes(d.name) ? d.color : (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) ? 'none' : '#ebebeb' : 'white')
                                .attr('stroke-width', 1.5)
                                .attr('cx', d => getMap(d).x)
                                .attr('cy', d => mapRoot.includes(d.source.name) ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) : getYPosition(d.source, 'z', cy + (genHeight[d.distance]), d))
                                .on('mouseover',(e,d) => {
                                    e.stopPropagation()
                                    hoverMappings(d.source,'enter')
                                    setVisible(false)
                                })
                                .on('mouseout',(e,d) => {hoverMappings(d.source,'leave');setVisible(false)})
                                .on('click',(e,d) => {
                                    if (!mapRoot.includes(d.source.name)) {
                                        setMapRoot([...mapRoot,d.source.name])
                                        updateWidth([...mapRoot,d.source.name])    
                                    } else {
                                        setMapRoot([...mapRoot,d.source.name])
                                        updateWidth([...mapRoot,d.source.name])
                                    }
                                    
                                })
                                .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                                .style('pointer-events', d => mapRoot.includes(d.source.name) ? 'none' : 'all')
                                .raise()
                            const mapGroup = mapNode.append('g')
                                .classed('map-group',true)
                                .style('display', d => mapRoot.includes(d.source.name) ? 'block' : 'none')
                                .raise()
                            const mapCounts = mapGroup.append('g')
                                .attr('id', d => 'node-label-'+d.name)
                                .style('opacity',1)
                            mapCounts.append('text')
                                .classed('map-total-counts num', true)
                                .attr('id', d => 'total-counts-' + d.name)
                                .text(d => countType === 'record' ? formatThousands(d.total_counts) : formatThousands(d.person_counts))
                                .attr('fill', d => conceptNames.includes(d.name) ? 'white' : '#36126d')
                                .style('font-size', '9px')
                                .attr('x', d => getMap(d).x)
                                .attr('y', d => getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) - 1)
                            mapCounts.append('text')
                                .classed('map-total-counts-label', true)
                                .style('font-size', '9px')
                                .text(() => countType === 'record' ? 'RC' : 'PC')
                                .attr('fill', d => conceptNames.includes(d.name) ? 'white' : '#36126d')
                                .attr('x', d => getMap(d).x - 6)
                                .attr('y', d => getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) + 9)
                            const mapDrc = mapGroup.append('g')
                                .classed('map-drc-group',true)
                                .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                            const mapDrcText = mapDrc.append('text')
                                .classed('map-drc-text',true)
                                .attr('id', d => 'drc-text-'+d.name)
                                .attr('fill', '#36126d')
                                .attr('opacity', 0.6)
                                .attr('x', d => getMap(d).x)
                                .attr('y', d => countType === 'record' ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) + scaleRadius(Math.sqrt(d.total_counts)) + 18 : getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) + scaleRadius(Math.sqrt(d.person_counts)) + 18)
                            mapDrcText.append('tspan')
                                .classed('map-drc-num num',true)
                                .text(d => countType === 'record' ? formatThousands(d.descendant_counts) : formatThousands(d.descendant_person_counts))
                                .raise()
                            mapDrcText.append('tspan')
                                .classed('map-drc-label-tree',true)
                                .text(() => countType === 'record' ? ' DRC' : ' DPC')
                            mapDrc.append('rect')
                                .classed('map-drc-rect',true)
                                .attr('height',16)
                                .attr("rx", 8)
                                .attr("ry", 8)
                                .attr('fill', d => d.descendant_counts === 0 ? 'transparent' : '#f2f2f5')
                                .attr('width',d => d3.select('#drc-text-'+d.name).node().getBBox().width + 10)
                                .attr('x', d => getMap(d).x - (d3.select('#drc-text-'+d.name).node().getBBox().width + 10)/2)
                                .attr('y', d => countType === 'record' ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) + scaleRadius(Math.sqrt(d.total_counts)) + 7 : getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) + scaleRadius(Math.sqrt(d.person_counts)) + 7)
                                .lower()
                            const mapLabel = mapGroup.append('g')
                                .classed('map-label btn', true)
                                .on('mouseover', (e, d) => {
                                    if (!sidebarRoot.name.includes(d.name)) {
                                        const el = e.currentTarget
                                        el.__hoverTimeout__ = setTimeout(() => {
                                            showActionLabel('Select concept','enter',e)
                                        }, 1200)    
                                    }
                                })
                                .on('mouseout', (e,d) => {
                                    clearTimeout(e.currentTarget.__hoverTimeout__)
                                    showActionLabel('','leave',e)
                                    showConfirmationPopup(d,'leave')
                                })
                                .on('click', (e,d) => {
                                    clearTimeout(e.currentTarget.__hoverTimeout__)
                                    showActionLabel('','leave')
                                    if (!sidebarRoot.name.includes(d.name)) {
                                        setVisible(false)
                                        showConfirmationPopup(d, 'enter', e)
                                    }
                                })
                            const mapText = mapLabel.append('g')
                                .attr('id', d => 'label-text-' + d.name)
                            mapText.append('text')
                                .classed('map-label-name',true)
                                .attr('text-anchor', 'middle')
                                .attr('font-weight', 500)
                                .attr('fill', '#36126d')
                                .text(d => {
                                    let concept_info = d.data.concept
                                    let text = concept_info.concept_name || concept_info.concept_id.toString()
                                    let maxWidth = 26
                                    return text.substring(0, maxWidth) + (text.length > maxWidth ? '...' : '    ') 
                                })
                                .attr('x', d => getMap(d).x)
                                .attr('y', d => getMap(d).y - 21)
                                .style('opacity', d => conceptNames.includes(d.name) ? 1 : 0.6)
                            const mapLine2 = mapText.append('text')
                                .classed('map-label-line2',true)
                                .attr('text-anchor', 'middle')
                                .attr('fill', '#4c4c4c')
                                .style('opacity', d => conceptNames.includes(d.name) ? 1 : 0.6)
                                .attr('x', d => getMap(d).x)
                                .attr('y', d => getMap(d).y - 7)
                            mapLine2.append('tspan')
                                .classed('map-label-code num',true)
                                .text(d => d.data.concept.concept_code + '  ')
                                .attr('font-weight', 500)
                            mapLine2.append('tspan')
                                .classed('map-label-vocabulary', true)
                                .text(d => d.data.concept.vocabulary_id)
                            mapLabel.append('rect')
                                .classed('map-label-rect', true)
                                .attr('id', d => 'label-rect-' + d.name)
                                .attr('width', d => d3.select("#label-text-" + d.name).node().getBBox().width + 16)
                                .attr('height', 36)
                                .attr("rx", 8)
                                .attr("ry", 8)
                                .attr('x', d => getMap(d).x - (d3.select("#label-text-" + d.name).node().getBBox().width + 16)/2)
                                .attr('y', d => getMap(d).y - 35)
                                .attr('fill', d => conceptNames.includes(d.name) ? 'white' : '#f5f5f5')
                                .style("filter", d => conceptNames.includes(d.name) ? "drop-shadow(0px 0px 4px rgba(0, 0, 0, 0.16))" : 'none')
                                .attr('stroke-width',1)
                                .attr('stroke', d => sidebarRoot.name.includes(d.name) ? '#6a23d6' : 'transparent')
                                .lower()
                            geometry.append('rect')
                                .classed('map-rect btn',true)
                                .style('display', d => mapRoot.includes(d.source.name) ? 'block' : 'none')
                                .style('pointer-events','all')
                                .attr('fill','transparent')
                                .attr('width',120)
                                .attr('x', d => getMap(d).x - 60)
                                .attr('y', d => countType === 'record' ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) - (120 + scaleRadius(Math.sqrt(d.total_counts)))/2 : getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) - (120 + scaleRadius(Math.sqrt(d.person_counts)))/2)
                                .attr('height', d => countType === 'record' ? 100 + scaleRadius(Math.sqrt(d.total_counts)) : 100 + scaleRadius(Math.sqrt(d.person_counts)))
                                .on('mouseover', function (e,d) {
                                    const el = this
                                    el.__hoverTimeout__ = setTimeout(() => {
                                        if (conceptNames.includes(d.name)) setHovered([d.name])
                                        if (d.levels !== '-1') tooltipHover(d, "enter", e)  
                                    }, 600)    
                                })
                                .on('mouseout', function (e,d) {
                                    const el = this
                                    clearTimeout(el.__hoverTimeout__)
                                    setHovered([])
                                    tooltipHover(d, "leave", e)   
                                })
                                .raise()
                        }, update => {
                            update.select('.map-node-main')
                                .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                            update.select('.map-link')
                                .style('display', d => mapRoot.includes(d.source.name) ? 'block' : 'none')
                                .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                            update.select('.map-line')
                                .attr('stroke', d => conceptNames.includes(d.name) ? '#c2c2c2' : '#e0e0e0')
                                .attr("d", d => {
                                    let sourceX = getMap(d).x 
                                    let sourceY = mapRoot.includes(d.source.name) ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) : cy + (genHeight[d.distance])
                                    let targetY = cy + (genHeight[d.distance])
                                    let targetX
                                    if (countType === 'record') targetX = mapRoot.includes(d.source.name) ? d.direction === -1 ? d.source.x - scaleRadius(Math.sqrt(d.source.total_counts)) - 24 : d.source.x + scaleRadius(Math.sqrt(d.source.total_counts)) + 24 : getMap(d).x 
                                    else targetX = mapRoot.includes(d.source.name) ? d.direction === -1 ? d.source.x - scaleRadius(Math.sqrt(d.source.person_counts)) - 24 : d.source.x + scaleRadius(Math.sqrt(d.source.person_counts)) + 24 : getMap(d).x 
                                    return curveX({source: [sourceX, sourceY], target: [targetX, targetY]})}
                                )
                            update.select('.map-tree-arrow')
                                .attr('fill', d => d.source.mappings?.map(d => d.name).some(name => conceptNames.includes(name)) ? '#c2c2c2' : '#e0e0e0')
                                .attr("d", d3.symbol().type(d3.symbolTriangle).size(arrowSize))
                                .attr("transform", d => {
                                    let x 
                                    if (countType === 'record') x = d.direction === -1 ? d.source.x - scaleRadius(Math.sqrt(d.source.total_counts)) - 26 : getMap(d).x - scaleRadius(Math.sqrt(d.total_counts)) - 16
                                    else x = d.direction === -1 ? d.source.x - scaleRadius(Math.sqrt(d.source.person_counts)) - 26 : getMap(d).x - scaleRadius(Math.sqrt(d.person_counts)) - 16
                                    let y = d.direction === -1 ? cy + (genHeight[d.distance]) : getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d)
                                    return "translate(" + x + "," + y + ")rotate(" + 90 + ")"
                                })  
                            update.select('.map-rect')
                                .style('display', d => mapRoot.includes(d.source.name) ? 'block' : 'none')
                                .attr('x', d => getMap(d).x - 60)
                                .attr('y', d => countType === 'record' ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) - (120 + scaleRadius(Math.sqrt(d.total_counts)))/2 : getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) - (120 + scaleRadius(Math.sqrt(d.person_counts)))/2)
                                .attr('height', d => countType === 'record' ? 100 + scaleRadius(Math.sqrt(d.total_counts)) : 100 + scaleRadius(Math.sqrt(d.person_counts)))
                                .on('mouseover', function (e,d) {
                                    const el = this
                                    el.__hoverTimeout__ = setTimeout(() => {
                                        if (conceptNames.includes(d.name)) setHovered([d.name])
                                        if (d.levels !== '-1') tooltipHover(d, "enter", e)  
                                    }, 600)    
                                })
                                .on('mouseout', function (e,d) {
                                    const el = this
                                    clearTimeout(el.__hoverTimeout__)
                                    setHovered([])
                                    tooltipHover(d, "leave", e)   
                                })
                            update.select('.map-tree-circle-background')
                                .attr('r', d => !mapRoot.includes(d.source.name) ? 0 : countType === 'record' ? scaleRadius(Math.sqrt(d.total_counts)) + 2 : scaleRadius(Math.sqrt(d.person_counts)) + 2)
                                .attr('cx', d => getMap(d).x)
                                .attr('cy', d => mapRoot.includes(d.source.name) ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) : getYPosition(d.source, 'z', cy + (genHeight[d.distance]), d))
                            update.select('.map-tree-circle')
                                .attr('r', d => mapRoot.includes(d.source.name) ? scaleRadius(Math.sqrt(d.total_counts)) : 12)
                                .style('fill', d => {
                                    if ((countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) && mapRoot.includes(d.source.name)) return 'white'
                                    else {
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
                                        } else {
                                            if (mapRoot.includes(d.source.name)) return '#f2f2f5'
                                            else return '#ebebeb'
                                        }    
                                    }
                                })
                                .attr('stroke', d => mapRoot.includes(d.source.name) ? conceptNames.includes(d.name) ? d.color : (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) ? 'none' : '#ebebeb' : 'white')
                                .attr('cx', d => getMap(d).x)
                                .attr('cy', d => mapRoot.includes(d.source.name) ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) : getYPosition(d.source, 'z', cy + (genHeight[d.distance]), d))
                                .on('mouseover',(e,d) => {
                                    e.stopPropagation()
                                    hoverMappings(d.source,'enter')
                                    setVisible(false)
                                })
                                .on('mouseout',(e,d) => {hoverMappings(d.source,'leave');setVisible(false)})
                                .on('click',(e,d) => {
                                    if (!mapRoot.includes(d.source.name)) {
                                        setMapRoot([...mapRoot,d.source.name])
                                        updateWidth([...mapRoot,d.source.name])    
                                    } else {
                                        setMapRoot([...mapRoot,d.source.name])
                                        updateWidth([...mapRoot,d.source.name])
                                    }
                                    
                                })
                                .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                                .style('pointer-events', d => mapRoot.includes(d.source.name) ? 'none' : 'all')
                            update.select('.map-group')
                                .style('display', d => mapRoot.includes(d.source.name) ? 'block' : 'none')
                            update.select('.map-total-counts')
                                .text(d => countType === 'record' ? formatThousands(d.total_counts) : formatThousands(d.person_counts))
                                .attr('fill', d => conceptNames.includes(d.name) ? 'white' : '#36126d')
                                .attr('x', d => getMap(d).x)
                                .attr('y', d => getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) - 1)
                            update.select('.map-total-counts-label')
                                .text(() => countType === 'record' ? 'RC' : 'PC')
                                .attr('fill', d => conceptNames.includes(d.name) ? 'white' : '#36126d')
                                .attr('x', d => getMap(d).x - 6)
                                .attr('y', d => getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) + 9)
                            update.select('.map-drc-group')
                                .classed('map-drc-group',true)
                                .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                            update.select('.map-drc-text')
                                .attr('x', d => getMap(d).x)
                                .attr('y', d => countType === 'record' ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) + scaleRadius(Math.sqrt(d.total_counts)) + 18 : getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) + scaleRadius(Math.sqrt(d.person_counts)) + 18)
                            update.select('.map-drc-num')
                                .text(d => countType === 'record' ? formatThousands(d.descendant_counts) : formatThousands(d.descendant_person_counts))
                            update.select('.map-drc-label-tree')
                                .text(() => countType === 'record' ? ' DRC' : ' DPC')
                            update.select('.map-drc-rect')
                                .attr('fill', d => d.descendant_counts === 0 ? 'transparent' : '#f2f2f5')
                                .attr('width',d => d3.select('#drc-text-'+d.name).node().getBBox().width + 10)
                                .attr('x', d => getMap(d).x - (d3.select('#drc-text-'+d.name).node().getBBox().width + 10)/2)
                                .attr('y', d => countType === 'record' ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) + scaleRadius(Math.sqrt(d.total_counts)) + 7 : getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) + scaleRadius(Math.sqrt(d.person_counts)) + 7)
                            update.select('.map-label')
                                .on('mouseover', (e, d) => {
                                    if (!sidebarRoot.name.includes(d.name)) {
                                        const el = e.currentTarget
                                        el.__hoverTimeout__ = setTimeout(() => {
                                            showActionLabel('Select concept','enter',e)
                                        }, 1200)    
                                    }
                                })
                                .on('mouseout', (e,d) => {
                                    clearTimeout(e.currentTarget.__hoverTimeout__)
                                    showActionLabel('','leave',e)
                                    showConfirmationPopup(d,'leave')
                                })
                                .on('click', (e,d) => {
                                    clearTimeout(e.currentTarget.__hoverTimeout__)
                                    showActionLabel('','leave')
                                    if (!sidebarRoot.name.includes(d.name)) {
                                        setVisible(false)
                                        showConfirmationPopup(d, 'enter', e)
                                    }
                                })
                            update.select('.map-label-name')
                                .text(d => {
                                    let concept_info = d.data.concept
                                    let text = concept_info.concept_name || concept_info.concept_id.toString()
                                    let maxWidth = 26
                                    return text.substring(0, maxWidth) + (text.length > maxWidth ? '...' : '    ') 
                                })
                                .attr('x', d => getMap(d).x)
                                .attr('y', d => getMap(d).y - 21)
                                .style('opacity', d => conceptNames.includes(d.name) ? 1 : 0.6)
                            update.select('.map-label-line2')
                                .style('opacity', d => conceptNames.includes(d.name) ? 1 : 0.6)
                                .attr('x', d => getMap(d).x)
                                .attr('y', d => getMap(d).y - 7)
                            update.select('.map-label-rect')
                                .attr('width', d => d3.select("#label-text-" + d.name).node().getBBox().width + 16)
                                .attr('x', d => getMap(d).x - (d3.select("#label-text-" + d.name).node().getBBox().width + 16)/2)
                                .attr('y', d => getMap(d).y - 35)
                                .attr('fill', d => conceptNames.includes(d.name) ? 'white' : '#f5f5f5')
                                .style("filter", d => conceptNames.includes(d.name) ? "drop-shadow(0px 0px 4px rgba(0, 0, 0, 0.16))" : 'none')
                                .attr('stroke', d => sidebarRoot.name.includes(d.name) ? '#6a23d6' : 'transparent')
                        },exit => exit.remove())
                        //Subsumes node
                        update.select('.subsumes-node')
                            .transition()
                            .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                        update.select('.node-rect')
                            .style('display', d => d.levels === '-1' ? 'none' : 'block')
                            .attr('x', d => d.x - 60)
                            .attr('y', d => countType === 'record' ? cy + (genHeight[d.distance]) - (120 + scaleRadius(Math.sqrt(d.total_counts)))/2 : cy + (genHeight[d.distance]) - (120 + scaleRadius(Math.sqrt(d.person_counts)))/2)
                            .attr('height', d => countType === 'record' ? 100 + scaleRadius(Math.sqrt(d.total_counts)) : 100 + scaleRadius(Math.sqrt(d.person_counts)))
                            .on('mouseover', function (e,d) {
                                const el = this
                                el.__hoverTimeout__ = setTimeout(() => {
                                    if (conceptNames.includes(d.name)) setHovered([d.name])
                                    if (d.levels !== '-1') tooltipHover(d, "enter", e)  
                                }, 600)    
                            })
                            .on('mouseout', function (e,d) {
                                const el = this
                                clearTimeout(el.__hoverTimeout__)
                                setHovered([])
                                tooltipHover(d, "leave", e)   
                            })
                        update.select('.node-group')
                            .style('display', d => d.levels === '-1' ? 'none' : 'block')
                        update.select('.tree-circle-background')
                            .attr('r', d => countType === 'record' ? scaleRadius(Math.sqrt(d.total_counts)) + 2 : scaleRadius(Math.sqrt(d.person_counts)) + 2)
                            .attr('cx', d => d.x)
                            .attr('cy', d => cy + (genHeight[d.distance]))
                        update.select('.tree-circle')
                            .classed('tree-circle btn', true)
                            .attr('r', d => countType === 'record' ? scaleRadius(Math.sqrt(d.total_counts)) : scaleRadius(Math.sqrt(d.person_counts)))
                            .attr('stroke', d => (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) ? 'none' : conceptNames.includes(d.name) && inclusions.includes(d.name) ? d.color : '#ebebeb')
                            .attr('fill', d => {
                                if ((countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) || (d.leaf && d.descendant_counts !== d.total_counts)) return 'white'
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
                                    } else {return '#f2f2f5'}    
                                }
                            })
                            .attr('cx', d => d.x)
                            .attr('cy', d => cy + (genHeight[d.distance]))
                            .attr('pointer-events', d => (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) || d.levels === "-1" || d.leaf ? "none" : "all")
                        update.select('.total-counts')
                            .classed('total-counts num', true)
                            .text(d => countType === 'record' ? formatThousands(d.total_counts) : formatThousands(d.person_counts))
                            .attr('fill', d => conceptNames.includes(d.name) && inclusions.includes(d.name) && !d.leaf ? 'white' : '#36126d')
                            .attr('x', d => d.x)
                            .attr('y', d => cy + (genHeight[d.distance]) - 1)
                        update.select('.total-counts-label')
                            .text(() => countType === 'record' ? 'RC' : 'PC')
                            .attr('fill', d => conceptNames.includes(d.name) && inclusions.includes(d.name) && !d.leaf ? 'white' : '#36126d')
                            .attr('x', d => d.x - 6)
                            .attr('y', d => cy + (genHeight[d.distance]) + 9)
                        update.select('.set-expression')
                            .style('display', d => sidebarRoot.name.includes(d.name) ? 'block' : 'none')
                            .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                            .attr('transform', d => {
                                const xVar = (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) ? 35 : 20
                                if (d.data.concept.standard_concept) return countType === 'record' ? `translate(${d.x + scaleRadius(Math.sqrt(d.total_counts)) + xVar}, 0)` : `translate(${d.x + scaleRadius(Math.sqrt(d.person_counts)) + xVar}, 0)`
                                else return countType === 'record' ? `translate(${d.x - scaleRadius(Math.sqrt(d.total_counts)) - xVar}, 0)` : `translate(${d.x - scaleRadius(Math.sqrt(d.person_counts)) - xVar}, 0)`
                            })
                        update.select('.set-expression-rect')
                            .attr('y', d => cy + (genHeight[d.distance]) - 24)
                        update.select('.tree-descendants-btn')
                            .attr('text-anchor', d => d.data.concept.standard_concept ? 'start' : 'end')
                            .on('click', (e,d) => {
                                setExcludeInclude('descendants',d.name)
                            })
                        update.select('.tree-descendants-box')
                            .attr('stroke', d => descendantsFilter.includes(d.name) ? '#e0e0e0' : '#989898')
                            .attr('x', d => d.data.concept.standard_concept ? -2 : -11)
                            .attr('y', d => cy + (genHeight[d.distance]) + 2)
                        update.select('.tree-descendants-check')
                            .attr('fill', d => descendantsFilter.includes(d.name) ? 'none' : '#36126d')
                            .attr('y', d => cy + (genHeight[d.distance]) + 12)
                        update.select('.tree-descendants-text')
                            .attr('fill', d => descendantsFilter.includes(d.name) ? '#4c4c4c' : '#36126d')
                            .attr('font-weight', d => descendantsFilter.includes(d.name) ? 400 : 500)
                            .attr('x', d => d.data.concept.standard_concept ? 16 : -16)
                            .attr('y', d => cy + (genHeight[d.distance]) + 12.7)
                        update.select('.tree-exclude-btn')
                            .attr('text-anchor', d => d.data.concept.standard_concept ? 'start' : 'end')
                            .on('click', (e,d) => {
                                setExcludeInclude('exclude',d.name)
                            })
                        update.select('.tree-exclude-box')
                            .attr('stroke', d => !excludeList.includes(d.name) ? '#e0e0e0' : '#989898')
                            .attr('x', d => d.data.concept.standard_concept ? -2 : -11)
                            .attr('y', d => cy + (genHeight[d.distance]) - 16)
                        update.select('.tree-exclude-check')
                            .attr('fill', d => excludeList.includes(d.name) ? '#36126d' : 'none')
                            .attr('y', d => cy + (genHeight[d.distance]) - 6)
                        update.select('.tree-exclude-text')
                            .attr('fill', d => !excludeList.includes(d.name) ? '#4c4c4c' : '#36126d')
                            .attr('font-weight', d => !excludeList.includes(d.name) ? 400 : 500)
                            .attr('x', d => d.data.concept.standard_concept ? 16 : -16)
                            .attr('y', d => cy + (genHeight[d.distance]) - 5)
                        update.select('.mappings-btn')
                            .text(d => mapRoot.includes(d.name) && d.mappings.length > 0 ? "\uf00d" : "\uf0da")
                            .style('display', d => d.mappings.length > 0 ? 'block' : 'none')
                            .style('opacity', d => hovered.length > 0 ? 0.1 : 0.3)
                            .style('font-size', d => mapRoot.includes(d.name) && d.mappings.length > 0 ? '14px' : '15px')
                            .on('mouseover',(e,d) => {
                                e.stopPropagation()
                                hoverMappings(d,'enter')
                                setVisible(false)
                            })
                            .on('mouseout',(e,d) => {hoverMappings(d,'leave');setVisible(false)})
                            .on('click',(e,d) => {
                                if (mapRoot.includes(d.name)) {
                                    let filteredRoots = mapRoot.filter(e => e !== d.name)
                                    setMapRoot(filteredRoots)
                                    updateWidth(filteredRoots)    
                                } else {
                                    setMapRoot([...mapRoot,d.name])
                                    updateWidth([...mapRoot,d.name])
                                }
                                
                            })
                            .attr('x', d => {
                                if (!d.data.concept.standard_concept) return countType === 'record' ? d.x + scaleRadius(Math.sqrt(d.total_counts)) + 15 : d.x + scaleRadius(Math.sqrt(d.person_counts)) + 15 
                                else return countType === 'record' ? d.x - scaleRadius(Math.sqrt(d.total_counts)) - 15 : d.x - scaleRadius(Math.sqrt(d.person_counts)) - 15
                            })
                            .attr('y', d => cy + (genHeight[d.distance]) + 5.5)
                        update.select('.drc-group')
                            .on('mouseover',(e,d) => {
                                e.stopPropagation()
                                setVisible(false)
                                const descendants = [...d.included_descendants,...d.descendants].filter((e,n,l) => l.indexOf(e) === n)
                                if (descendants.length > 1 && !d.leaf) setHovered(descendants)                      
                            })
                            .on('mouseout',(e,d) => {setHovered([]);setVisible(false)})
                            .style('display', d => d.levels === '-1' ? 'none' : 'block')
                            .transition()
                            .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                        update.select('.drc-text')
                            .attr('fill', d => d.leaf ? 'white' : '#36126d')
                            .transition()
                            .attr('opacity', d => d.leaf ? 1 : 0.6)
                            .attr('x', d => d.x)
                            .attr('y', d => countType === 'record' ? cy + (genHeight[d.distance]) + scaleRadius(Math.sqrt(d.total_counts)) + 18 : cy + (genHeight[d.distance]) + scaleRadius(Math.sqrt(d.person_counts)) + 18)
                        update.select('.drc-num')
                            .text(d => countType === 'record' ? formatThousands(d.descendant_counts) : formatThousands(d.descendant_person_counts))
                        update.select('.drc-label-tree')
                            .text(() => countType === 'record' ? ' DRC' : ' DPC')
                        update.select('.drc-rect')
                            .attr('fill', d => d.leaf ? d.color : d.descendant_counts === 0 || d.descendant_counts === d.total_counts ? 'transparent' : '#f2f2f5')
                            .attr('width',d => d3.select('#drc-text-'+d.name).node().getBBox().width + 10)
                            .attr('x', d => d.x - (d3.select('#drc-text-'+d.name).node().getBBox().width + 10)/2)
                            .attr('y', d => countType === 'record' ? cy + (genHeight[d.distance]) + scaleRadius(Math.sqrt(d.total_counts)) + 7 : cy + (genHeight[d.distance]) + scaleRadius(Math.sqrt(d.person_counts)) + 7)
                        update.select('.label')
                            .on('mouseover', (e, d) => {
                                if (!sidebarRoot.name.includes(d.name)) {
                                    const el = e.currentTarget
                                    el.__hoverTimeout__ = setTimeout(() => {
                                        showActionLabel('Select concept','enter',e)
                                    }, 1200)    
                                }
                            })
                            .on('mouseout', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave',e)
                                showConfirmationPopup(d,'leave')
                            })
                            .on('click', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave')
                                if (!sidebarRoot.name.includes(d.name)) {
                                    setVisible(false)
                                    showConfirmationPopup(d, 'enter', e)
                                }
                            })
                            .transition()
                            .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                        update.select('.label-name')
                            .text(d => {
                                let genLength = 0
                                let maxWidth = 0
                                let concept_info = d.data.concept
                                nodes.forEach(n => n.distance === d.distance ? genLength++ : null)
                                let text = concept_info.concept_name || concept_info.concept_id.toString()
                                if ((relationship === 'mappings' && d.mappings?.length > 0) || mapRoot.includes(d.name)) maxWidth = 21
                                else {
                                    if (genLength === 1) maxWidth = Math.round(width/6)
                                    else maxWidth = 26
                                }  
                                return text.substring(0, maxWidth) + (text.length > maxWidth ? '...' : '    ') 
                            })
                            .attr('x', d => getLabel(d).x)
                            .attr('y', d => getLabel(d).y - 21)
                            .style('opacity', d => conceptNames.includes(d.name) ? 1 : 0.6)
                        update.select('.label-line2')
                            .style('opacity', d => conceptNames.includes(d.name) ? 1 : 0.6)
                            .attr('x', d => getLabel(d).x)
                            .attr('y', d => getLabel(d).y - 7)
                        update.select('.label-rect')
                            .attr('width', d => d3.select("#label-text-" + d.name).node().getBBox().width + 16)
                            .attr('x', d => getLabel(d).x - (d3.select("#label-text-" + d.name).node().getBBox().width + 16)/2)
                            .attr('y', d => getLabel(d).y - 35)
                            .attr('fill', d => conceptNames.includes(d.name) ? 'white' : '#f5f5f5')
                            .style("filter", d => conceptNames.includes(d.name) ? "drop-shadow(0px 0px 4px rgba(0, 0, 0, 0.16))" : 'none')
                            .attr('stroke', d => sidebarRoot.name.includes(d.name) ? '#6a23d6' : 'transparent')
                        update.select('.prune-group')
                            .style('display', d => pruned && d.leaf && !d.children?.every(child => d.connections.map(d => d.child).includes(child)) ? 'block' : 'none')
                            .style('opacity', d => hovered.length === 1 && hovered.includes(d.name) ? 1 : hovered.length > 0 ? 0.2 : 1)
                        update.select('.prune-line')
                            .attr('x1',d => d.x)
                            .attr('y1',d => countType === 'record' ? cy + (genHeight[d.distance]) + scaleRadius(Math.sqrt(d.total_counts)) + 18 : cy + (genHeight[d.distance]) + scaleRadius(Math.sqrt(d.person_counts)) + 18)
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
                                    let x1 = d.x
                                    let y1 = countType === 'record' ? cy + (genHeight[sourceNode.distance]) + scaleRadius(Math.sqrt(sourceNode.total_counts)) + 18 : cy + (genHeight[sourceNode.distance]) + scaleRadius(Math.sqrt(sourceNode.person_counts)) + 18
                                    let x2 = d.mid
                                    let y2 = cy + (genHeight[sourceNode.distance]) + (num - 20)
                                    return curveY({source: [x1, y1], target: [x2, y2]})
                                })
                            curve.append('path')
                                .classed('prune-curve-background btn',true)
                                .attr('fill', 'none')
                                .attr("stroke", "transparent")
                                .attr('stroke-width', 5)
                                .style('display', pruned ? 'block' : 'none')
                                .attr("d", d => {
                                    let sourceNode = nodes.filter(e => e.name === d.source)[0]
                                    let x1 = d.x
                                    let y1 = countType === 'record' ? cy + (genHeight[sourceNode.distance]) + scaleRadius(Math.sqrt(sourceNode.total_counts)) + 18 : cy + (genHeight[sourceNode.distance]) + scaleRadius(Math.sqrt(sourceNode.person_counts)) + 18
                                    let x2 = d.mid
                                    let y2 = cy + (genHeight[sourceNode.distance]) + (num - 20)
                                    return curveY({source: [x1, y1], target: [x2, y2]})
                                })
                                .on('mouseover',(e,d) => setHovered(d.parents))
                                .on('mouseout',(e,d) => setHovered([]))
                            curve.append('path')
                                .classed('prune-curve-arrow', true)
                                .attr('fill', '#e0e0e0')
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
                                    let x1 = d.x
                                    let y1 = countType === 'record' ? cy + (genHeight[sourceNode.distance]) + scaleRadius(Math.sqrt(sourceNode.total_counts)) + 18 : cy + (genHeight[sourceNode.distance]) + scaleRadius(Math.sqrt(sourceNode.person_counts)) + 18
                                    let x2 = d.mid
                                    let y2 = cy + (genHeight[sourceNode.distance]) + (num - 20)
                                    return curveY({source: [x1, y1], target: [x2, y2]})
                                })
                            update.select(".prune-curve-background")
                                .style('display', pruned ? 'block' : 'none')
                                .attr("d", d => {
                                    let sourceNode = nodes.filter(e => e.name === d.source)[0]
                                    let x1 = d.x
                                    let y1 = countType === 'record' ? cy + (genHeight[sourceNode.distance]) + scaleRadius(Math.sqrt(sourceNode.total_counts)) + 18 : cy + (genHeight[sourceNode.distance]) + scaleRadius(Math.sqrt(sourceNode.person_counts)) + 18
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
                        d3.selectAll('.subsumes-nodes').lower()
                        d3.selectAll('.map-node').raise()
                        d3.selectAll('.prune-curve').lower()
                    },exit => exit.remove())
            }
            updateLinks()
            updateNodes()
        }
        // list
        function drawList() {
            let sums = []
            nodes.filter(n => n.levels !== '-1').forEach(node => {
                if (countType === 'record') {
                    sums.push(node.total_counts)
                    sums.push(node.descendant_counts)    
                } else {
                    sums.push(node.person_counts)
                    sums.push(node.descendant_person_counts)    
                }
                
                node.mappings.forEach(map => {
                    if (countType === 'record') {
                        sums.push(map.total_counts)
                        sums.push(map.descendant_counts)    
                    } else {
                        sums.push(map.person_counts)
                        sums.push(map.descendant_person_counts)    
                    }
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
                        .style('border-bottom', d => d.levels === '-1' ? '0.5px solid #d3d3d3' : '0.5px solid #e0e0e0')
                    const item = itemContainer.append('div')
                        .classed('list-item',true)
                        .attr('id', d => 'list-item-'+d.name)
                        .style('background-color', d => d.levels === '-1' ? '#f7f7f7' : 'white')
                        .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                    const titleSection = item.append('div')
                        .classed('list-title-section',true)
                    const conceptCard = titleSection.append('div')
                        .classed('list-card concept-card',true)
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
                        .classed('list-circle-dash', d => (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) && !d.leaf ? true : false)
                        .classed('list-circle', d => (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) && !d.leaf ? false : true)
                        .classed('btn', d => conceptNames.includes(d.name) || d.leaf ? true : false)
                        .style("pointer-events", d => conceptNames.includes(d.name) || d.leaf ? 'all' : 'none')
                        .style('background', d => {
                            if ((countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) && !d.leaf) return "none"
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
                            if ((countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) && !d.leaf) return "transparent"
                            if (conceptNames.includes(d.name) || d.leaf) {
                                if (d.data.concept.standard_concept) {return d.color} 
                                else {return "transparent"}
                            }
                            else return '#d6d6d6'
                        }) 
                        .style('border', d => (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) && !d.leaf ? '1px solid #b2b2b2' : conceptNames.includes(d.name) || d.leaf ? `1px solid ${d.color}` : '1px solid #d6d6d6')
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
                    titleRight.append('img')
                        .classed('list-closed-eye icon marginRight eye',true)
                        .attr('id', d => 'list-closed-eye-'+d.name)
                        .attr("src", closedEye)
                        .style('opacity', 0.3)  
                        .style('display', d => !conceptNames.includes(d.name) && (d.total_counts > 0 || d.leaf) && d.levels !== '-1' ? 'inline-block' : 'none')
                        .on('mouseover', (e, d) => {
                            d3.select('#list-closed-eye-'+d.name).transition().style('opacity',1)
                            const el = e.currentTarget
                            el.__hoverTimeout__ = setTimeout(() => {
                                showActionLabel('Show concept','enter',e)
                            }, 1200)
                        }) 
                        .on('mouseout', (e,d) => {
                            d3.select('#list-closed-eye-'+d.name).transition().style('opacity',0.3)
                            clearTimeout(e.currentTarget.__hoverTimeout__)
                            showActionLabel('','leave',e)
                        })
                        .on('click',(e,d) => {
                            clearTimeout(e.currentTarget.__hoverTimeout__)
                            showActionLabel('','leave')
                            const newInclusions = [...inclusions,d.name]
                            updateConcepts(newInclusions,nodes,[d],[])
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
                        .attr("src", openedEye)
                        .style('opacity', 1)
                        .style('display', d => ((countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) && !d.leaf) || d.levels === '-1' ? 'none' : !conceptNames.includes(d.name) ? 'none' : 'inline-block')
                        .on('mouseover', (e, d) => {
                            const el = e.currentTarget
                            el.__hoverTimeout__ = setTimeout(() => {
                                showActionLabel('Hide concept','enter',e)
                            }, 1200)
                        })
                        .on('mouseout', (e,d) => {
                            clearTimeout(e.currentTarget.__hoverTimeout__)
                            showActionLabel('','leave',e)
                        })
                        .on('click',(e,d) => {
                            clearTimeout(e.currentTarget.__hoverTimeout__)
                            showActionLabel('','leave')
                            const newInclusions = inclusions.filter(e => e !== d.name)
                            updateConcepts(newInclusions,nodes,[],[d])
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
                            showConfirmationPopup(d, 'leave', e)
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
                            if (!sidebarRoot.name.includes(d.name)) {
                                const el = e.currentTarget
                                el.__hoverTimeout__ = setTimeout(() => {
                                    showActionLabel('Select concept','enter',e)
                                }, 1200)    
                            }
                        })
                        .on('mouseout', (e,d) => {
                            clearTimeout(e.currentTarget.__hoverTimeout__)
                            showActionLabel('','leave',e)
                            showConfirmationPopup(d,'leave')
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
                        .html(d => countType === 'record' ? formatThousands(d.total_counts) : formatThousands(d.person_counts))
                    countsRC.append('p')
                        .classed('counts-RC-label list-counts-label',true)
                        .style('color', d => conceptNames.includes(d.name) && !d.leaf ? '#36126d' : '#808080')
                        .style('font-weight', d => conceptNames.includes(d.name) && !d.leaf ? 500 : 400)
                        .html(() => countType === 'record' ? 'RC' : 'PC')
                    const countsBarRC = countsRC.append('div')
                        .classed('list-counts-bar-container',true)
                    countsBarRC.append('div')
                        .classed('counts-RC-bar list-counts-bar',true)
                        .style('width', d => countType === 'record' ? scaleWidth(d.total_counts) + 'px' : scaleWidth(d.person_counts) + 'px')
                        .style('background-color', d => conceptNames.includes(d.name) && !d.leaf ? d.color : '#e0e0e0')
                    
                    const countsDRC = countsSection.append('div')
                        .classed('list-counts',true)
                    countsDRC.append('p')
                        .classed('counts-DRC-p list-counts-p num',true)
                        .style('text-align','left')
                        .style('color', d => conceptNames.includes(d.name) && d.leaf ? '#36126d' : '#808080')
                        .style('font-weight', d => conceptNames.includes(d.name) && d.leaf ? 500 : 400)
                        .html(d => countType === 'record' ? formatThousands(d.descendant_counts) : formatThousands(d.descendant_person_counts))
                    countsDRC.append('p')
                        .classed('counts-DRC-label list-counts-label',true)
                        .style('color', d => conceptNames.includes(d.name) && d.leaf ? '#36126d' : '#808080')
                        .style('font-weight', d => conceptNames.includes(d.name) && d.leaf ? 500 : 400)
                        .html(() => countType === 'record' ? 'DRC' : 'DPC')
                    const countsBarDRC = countsDRC.append('div')
                        .classed('list-counts-bar-container',true)
                    countsBarDRC.append('div')
                        .classed('counts-DRC-bar list-counts-bar',true)
                        .style('width', d => countType === 'record' ? scaleWidth(d.descendant_counts) + 'px' : scaleWidth(d.descendant_person_counts) + 'px')
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
                            .classed('map-list-card concept-card',true)
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
                            .classed('list-circle-dash', d => (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) ? true : false)
                            .classed('list-circle', d => (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) ? false : true)
                            .classed('btn', d => conceptNames.includes(d.name) ? true : false)
                            .style('pointer-events', d => conceptNames.includes(d.name) ? 'all' : 'none')
                            .style('background', d => {
                                if ((countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0)) return "none"
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
                                if ((countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0)) return "transparent"
                                if (conceptNames.includes(d.name)) {
                                    if (d.data.concept.standard_concept) {return d.color} 
                                    else {return "transparent"}
                                }
                                else return '#d6d6d6'
                            }) 
                            .style('border', d => (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) ? '1px solid #b2b2b2' : conceptNames.includes(d.name) ? `1px solid ${d.color}` : '1px solid #d6d6d6')
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
                            mapTitleRight.append('img')
                                .classed('map-list-closed-eye icon marginRight eye',true)
                                .attr('id', d => 'list-closed-eye-'+d.name)
                                .attr("src", closedEye)
                                .style('opacity', 0.3)  
                                .style('display', d => !conceptNames.includes(d.name) && d.total_counts > 0 ? 'inline-block' : 'none')
                                .on('mouseover', (e, d) => {
                                    d3.select('#list-closed-eye-'+d.name).transition().style('opacity',1)
                                    const el = e.currentTarget
                                    el.__hoverTimeout__ = setTimeout(() => {
                                        showActionLabel('Show concept','enter',e)
                                    }, 1200)
                                }) 
                                .on('mouseout', (e,d) => {
                                    d3.select('#list-closed-eye-'+d.name).transition().style('opacity',0.3)
                                    clearTimeout(e.currentTarget.__hoverTimeout__)
                                    showActionLabel('','leave',e)
                                })
                                .on('click',(e,d) => {
                                    clearTimeout(e.currentTarget.__hoverTimeout__)
                                    showActionLabel('','leave')
                                    const newInclusions = [...inclusions,d.name]
                                    updateConcepts(newInclusions,nodes,[d],[])
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
                            .attr("src", openedEye)
                            .style('opacity', 1)
                            .style('display', d => (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) || !conceptNames.includes(d.name) ? 'none' : 'inline-block')
                            .on('mouseover', (e, d) => {
                                const el = e.currentTarget
                                el.__hoverTimeout__ = setTimeout(() => {
                                    showActionLabel('Hide concept','enter',e)
                                }, 1200)
                            })
                            .on('mouseout', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave',e)
                            })
                            .on('click',(e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave')
                                const newInclusions = inclusions.filter(e => e !== d.name)
                                updateConcepts(newInclusions,nodes,[],[d])
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
                                showConfirmationPopup(d, 'leave', e)
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
                                if (!sidebarRoot.name.includes(d.name)) {
                                    const el = e.currentTarget
                                    el.__hoverTimeout__ = setTimeout(() => {
                                        showActionLabel('Select concept','enter',e)
                                    }, 1200)    
                                }
                            })
                            .on('mouseout', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave',e)
                                showConfirmationPopup(d,'leave')
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
                            .html(d => countType === 'record' ? formatThousands(d.total_counts) : formatThousands(d.person_counts))
                        mapCountsRC.append('p')
                            .classed('map-counts-RC-label list-counts-label',true)
                            .style('color', d => conceptNames.includes(d.name) ? '#36126d' : '#808080')
                            .style('font-weight', d => conceptNames.includes(d.name) ? 500 : 400)
                            .html(() => countType === 'record' ? 'RC' : 'PC')
                        const mapCountsBarRC = mapCountsRC.append('div')
                            .classed('list-counts-bar-container',true)
                        mapCountsBarRC.append('div')
                            .classed('map-counts-RC-bar list-counts-bar',true)
                            .style('width', d => countType === 'record' ? scaleWidth(d.total_counts) + 'px' : scaleWidth(d.person_counts) + 'px' )
                            .style('background-color', d => conceptNames.includes(d.name) ? d.color : '#e0e0e0')
                        
                        const mapCountsDRC = mapCountsSection.append('div')
                            .classed('list-counts',true)
                        mapCountsDRC.append('p')
                            .classed('map-counts-DRC-p list-counts-p num',true)
                            .style('text-align','left')
                            .style('color', '#808080')
                            .style('font-weight', 400)
                            .html(d => countType === 'record' ? formatThousands(d.descendant_counts) : formatThousands(d.descendant_person_counts))
                        mapCountsDRC.append('p')
                            .classed('map-counts-DRC-label list-counts-label',true)
                            .style('color', '#808080')
                            .style('font-weight', 400)
                            .html(() => countType === 'record' ? 'DRC' : 'DPC')
                        const mapCountsBarDRC = mapCountsDRC.append('div')
                            .classed('list-counts-bar-container',true)
                        mapCountsBarDRC.append('div')
                            .classed('map-counts-DRC-bar list-counts-bar',true)
                            .style('width', d => countType === 'record' ? scaleWidth(d.descendant_counts) + 'px' : scaleWidth(d.descendant_person_counts) + 'px')
                            .style('background-color', '#e0e0e0')   
                        
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
                            .classed('list-circle-dash', d => (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) ? true : false)
                            .classed('list-circle', d => (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) ? false : true)
                            .classed('btn', d => conceptNames.includes(d.name) ? true : false)
                            .style('pointer-events', d => conceptNames.includes(d.name) ? 'all' : 'none')
                            .style('background', d => {
                                if ((countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0)) return "none"
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
                                if ((countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0)) return "transparent"
                                if (conceptNames.includes(d.name)) {
                                    if (d.data.concept.standard_concept) {return d.color} 
                                    else {return "transparent"}
                                }
                                else return '#d6d6d6'
                            }) 
                            .style('border', d => (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) ? '1px solid #b2b2b2' : conceptNames.includes(d.name) ? `1px solid ${d.color}` : '1px solid #d6d6d6')
                            .on('mouseover',(e,d) => setHovered([d.name]))
                            .on('mouseout', (e,d) => setHovered([]))
                        update.select('.map-list-title-right')
                            .on('mouseover',(e,d) => {
                                    d3.select('#list-icons-'+d.name).transition(1000).style('max-width','36px').style('opacity',1)
                            })
                            .on('mouseout', (e,d) => {
                                
                                if (!showConfirmation) d3.select('#list-icons-'+d.name).transition(1000).style('max-width','0px').style('opacity',0)
                            })
                        update.select('.map-list-closed-eye')
                            .style('display', d => !conceptNames.includes(d.name) && d.total_counts > 0 ? 'inline-block' : 'none')
                            .on('mouseover', (e, d) => {
                                d3.select('#list-closed-eye-'+d.name).transition().style('opacity',1)
                                const el = e.currentTarget
                                el.__hoverTimeout__ = setTimeout(() => {
                                    showActionLabel('Show concept','enter',e)
                                }, 1200)
                            }) 
                            .on('mouseout', (e,d) => {
                                d3.select('#list-closed-eye-'+d.name).transition().style('opacity',0.3)
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave',e)
                            })
                            .on('click',(e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave')
                                const newInclusions = [...inclusions,d.name]
                                updateConcepts(newInclusions,nodes,[d],[])
                            })
                        update.select('.map-list-eye')
                            .style('display', d => (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) || !conceptNames.includes(d.name) ? 'none' : 'inline-block')
                            .on('mouseover', (e, d) => {
                                const el = e.currentTarget
                                el.__hoverTimeout__ = setTimeout(() => {
                                    showActionLabel('Hide concept','enter',e)
                                }, 1200)
                            })
                            .on('mouseout', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave',e)
                            })
                            .on('click',(e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave')
                                const newInclusions = inclusions.filter(e => e !== d.name)
                                updateConcepts(newInclusions,nodes,[],[d])
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
                                showConfirmationPopup(d, 'leave', e)
                            })
                            .on('click', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave')
                                showConfirmationPopup(d, 'enter', e)
                            })
                        update.select('.map-list-title-p')
                            .on('mouseover', (e, d) => {
                                if (!sidebarRoot.name.includes(d.name)) {
                                    const el = e.currentTarget
                                    el.__hoverTimeout__ = setTimeout(() => {
                                        showActionLabel('Select concept','enter',e)
                                    }, 1200)    
                                }
                            })
                            .on('mouseout', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave',e)
                                showConfirmationPopup(d,'leave')
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
                            .html(d => countType === 'record' ? formatThousands(d.total_counts) : formatThousands(d.person_counts))
                        update.select('.map-counts-RC-label')
                            .style('color', d => conceptNames.includes(d.name) ? '#36126d' : '#808080')
                            .style('font-weight', d => conceptNames.includes(d.name) ? 500 : 400)
                            .html(() => countType === 'record' ? 'RC' : 'PC')
                        update.select('.map-counts-RC-bar')
                            .transition()
                            .style('width', d => countType === 'record' ? scaleWidth(d.total_counts) + 'px' : scaleWidth(d.person_counts) + 'px')
                            .style('background-color', d => conceptNames.includes(d.name) ? d.color : '#e0e0e0')
                        update.select('.map-counts-DRC-p')
                            .html(d => countType === 'record' ? formatThousands(d.descendant_counts) : formatThousands(d.descendant_person_counts))
                        update.select('.map-counts-DRC-label')
                            .html(() => countType === 'record' ? 'DRC' : 'DPC')
                        update.select('.map-counts-DRC-bar')
                            .transition()
                            .style('width', d => countType === 'record' ? scaleWidth(d.descendant_counts) + 'px' : scaleWidth(d.descendant_person_counts) + 'px')
                    })
                },update => {
                    update.select('.list-item')
                        .style('background-color', d => d.levels === '-1' ? '#f7f7f7' : 'white')
                        .transition()
                        .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                    update.select('.list-card')
                        .style('box-shadow', d => conceptNames.includes(d.name) || d.leaf ? '0 0 0 1px rgba(0, 0, 0, 0.02),0 2px 10px rgba(0, 0, 0, 0.15)' : 'none')
                        .style('background-color', d => d.levels === '-1' ? 'none' : conceptNames.includes(d.name) || d.leaf ? 'white' : '#ebebeb')
                    update.select('.list-title-circle')
                        .classed('list-circle-dash', d => (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) && !d.leaf ? true : false)
                        .classed('list-circle', d => (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) && !d.leaf ? false : true)
                        .classed('btn', d => conceptNames.includes(d.name) || d.leaf ? true : false)
                        .style("pointer-events", d => conceptNames.includes(d.name) || d.leaf ? 'all' : 'none')
                        .style('background', d => {
                            if ((countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) && !d.leaf) return "none"
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
                            if ((countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) && !d.leaf) return "transparent"
                            if (conceptNames.includes(d.name) || d.leaf) {
                                if (d.data.concept.standard_concept) {return d.color} 
                                else {return "transparent"}
                            }
                            else return '#d6d6d6'
                        }) 
                        .style('border', d => (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) && !d.leaf ? '1px solid #b2b2b2' : conceptNames.includes(d.name) || d.leaf ? `1px solid ${d.color}` : '1px solid #d6d6d6')
                        .on('mouseover',(e,d) => setHovered([d.name]))
                        .on('mouseout', (e,d) => setHovered([]))
                    update.select('.list-title-right')
                        .on('mouseover',(e,d) => {
                                d3.select('#list-icons-'+d.name).transition(1000).style('max-width','36px').style('opacity',1)
                        })
                        .on('mouseout', (e,d) => {
                            
                            if (!showConfirmation) d3.select('#list-icons-'+d.name).transition(1000).style('max-width','0px').style('opacity',0)
                        })
                    update.select('.list-closed-eye')
                        .style('display', d => !conceptNames.includes(d.name) && (d.total_counts > 0 || d.leaf) && d.levels !== '-1' ? 'inline-block' : 'none')
                        .on('mouseover', (e, d) => {
                            d3.select('#list-closed-eye-'+d.name).transition().style('opacity',1)
                            const el = e.currentTarget
                            el.__hoverTimeout__ = setTimeout(() => {
                                showActionLabel('Show concept','enter',e)
                            }, 1200)
                        }) 
                        .on('mouseout', (e,d) => {
                            d3.select('#list-closed-eye-'+d.name).transition().style('opacity',0.3)
                            clearTimeout(e.currentTarget.__hoverTimeout__)
                            showActionLabel('','leave',e)
                        })
                    update.select('.list-eye')
                        .style('display', d => ((countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) && !d.leaf) || d.levels === '-1' ? 'none' : !conceptNames.includes(d.name) ? 'none' : 'inline-block')
                        .on('mouseover', (e, d) => {
                            const el = e.currentTarget
                            el.__hoverTimeout__ = setTimeout(() => {
                                showActionLabel('Hide concept','enter',e)
                            }, 1200)
                        })
                        .on('mouseout', (e,d) => {
                            clearTimeout(e.currentTarget.__hoverTimeout__)
                            showActionLabel('','leave',e)
                        })
                        .on('click',(e,d) => {
                            clearTimeout(e.currentTarget.__hoverTimeout__)
                            showActionLabel('','leave')
                            const newInclusions = inclusions.filter(e => e !== d.name)
                            updateConcepts(newInclusions,nodes,[],[d])
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
                            showConfirmationPopup(d, 'leave', e)
                        })
                        .on('click', (e,d) => {
                            clearTimeout(e.currentTarget.__hoverTimeout__)
                            showActionLabel('','leave')
                            showConfirmationPopup(d, 'enter', e)
                        })
                    update.select('.list-title-p')
                        .on('mouseover', (e, d) => {
                            if (!sidebarRoot.name.includes(d.name)) {
                                const el = e.currentTarget
                                el.__hoverTimeout__ = setTimeout(() => {
                                    showActionLabel('Select concept','enter',e)
                                }, 1200)    
                            }
                        })
                        .on('mouseout', (e,d) => {
                            clearTimeout(e.currentTarget.__hoverTimeout__)
                            showActionLabel('','leave',e)
                            showConfirmationPopup(d,'leave')
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
                        .html(d => countType === 'record' ? formatThousands(d.total_counts) : formatThousands(d.person_counts))
                    update.select('.counts-RC-label')
                        .style('color', d => conceptNames.includes(d.name) && !d.leaf ? '#36126d' : '#808080')
                        .style('font-weight', d => conceptNames.includes(d.name) && !d.leaf ? 500 : 400)
                        .html(() => countType === 'record' ? 'RC' : 'PC')
                    update.select('.counts-RC-bar')
                        .transition()
                        .style('width', d => countType === 'record' ? scaleWidth(d.total_counts) + 'px' : scaleWidth(d.person_counts) + 'px' )
                        .style('background-color', d => conceptNames.includes(d.name) && !d.leaf ? d.color : '#e0e0e0')
                    update.select('.counts-DRC-p')
                        .style('color', d => conceptNames.includes(d.name) && d.leaf ? '#36126d' : '#808080')
                        .style('font-weight', d => conceptNames.includes(d.name) && d.leaf ? 500 : 400)
                        .html(d => countType === 'record' ? formatThousands(d.descendant_counts) : formatThousands(d.descendant_person_counts))
                    update.select('.counts-DRC-label')
                        .style('color', d => conceptNames.includes(d.name) && d.leaf ? '#36126d' : '#808080')
                        .style('font-weight', d => conceptNames.includes(d.name) && d.leaf ? 500 : 400)
                        .html(() => countType === 'record' ? 'DRC' : 'DPC')
                    update.select('.counts-DRC-bar')
                        .transition()
                        .style('width', d => countType === 'record' ? scaleWidth(d.descendant_counts) + 'px' : scaleWidth(d.descendant_person_counts) + 'px' )
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
                            .classed('map-list-card concept-card',true)
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
                            .classed('list-circle-dash', d => (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) ? true : false)
                            .classed('list-circle', d => (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) ? false : true)
                            .classed('btn', d => conceptNames.includes(d.name) ? true : false)
                            .style('pointer-events', d => conceptNames.includes(d.name) ? 'all' : 'none')
                            .style('background', d => {
                                if ((countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0)) return "none"
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
                                if ((countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0)) return "transparent"
                                if (conceptNames.includes(d.name)) {
                                    if (d.data.concept.standard_concept) {return d.color} 
                                    else {return "transparent"}
                                }
                                else return '#d6d6d6'
                            }) 
                            .style('border', d => (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) ? '1px solid #b2b2b2' : conceptNames.includes(d.name) ? `1px solid ${d.color}` : '1px solid #d6d6d6')
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
                            mapTitleRight.append('img')
                                .classed('map-list-closed-eye icon marginRight eye',true)
                                .attr('id', d => 'list-closed-eye-'+d.name)
                                .attr("src", closedEye)
                                .style('opacity', 0.3)  
                                .style('display', d => !conceptNames.includes(d.name) && d.total_counts > 0 ? 'inline-block' : 'none')
                                .on('mouseover', (e, d) => {
                                    d3.select('#list-closed-eye-'+d.name).transition().style('opacity',1)
                                    const el = e.currentTarget
                                    el.__hoverTimeout__ = setTimeout(() => {
                                        showActionLabel('Show concept','enter',e)
                                    }, 1200)
                                }) 
                                .on('mouseout', (e,d) => {
                                    d3.select('#list-closed-eye-'+d.name).transition().style('opacity',0.3)
                                    clearTimeout(e.currentTarget.__hoverTimeout__)
                                    showActionLabel('','leave',e)
                                })
                                .on('click',(e,d) => {
                                    clearTimeout(e.currentTarget.__hoverTimeout__)
                                    showActionLabel('','leave')
                                    const newInclusions = [...inclusions,d.name]
                                    updateConcepts(newInclusions,nodes,[d],[])
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
                            .attr("src", openedEye)
                            .style('opacity', 1)
                            .style('display', d => (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) || !conceptNames.includes(d.name) ? 'none' : 'inline-block')
                            .on('mouseover', (e, d) => {
                                const el = e.currentTarget
                                el.__hoverTimeout__ = setTimeout(() => {
                                    showActionLabel('Hide concept','enter',e)
                                }, 1200)
                            })
                            .on('mouseout', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave',e)
                            })
                            .on('click',(e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave')
                                const newInclusions = inclusions.filter(e => e !== d.name)
                                updateConcepts(newInclusions,nodes,[],[d])
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
                                showConfirmationPopup(d, 'leave', e)
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
                                if (!sidebarRoot.name.includes(d.name)) {
                                    const el = e.currentTarget
                                    el.__hoverTimeout__ = setTimeout(() => {
                                        showActionLabel('Select concept','enter',e)
                                    }, 1200)    
                                }
                            })
                            .on('mouseout', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave',e)
                                showConfirmationPopup(d,'leave')
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
                            .html(d => countType === 'record' ? formatThousands(d.total_counts) : formatThousands(d.person_counts))
                        mapCountsRC.append('p')
                            .classed('map-counts-RC-label list-counts-label',true)
                            .style('color', d => conceptNames.includes(d.name) ? '#36126d' : '#808080')
                            .style('font-weight', d => conceptNames.includes(d.name) ? 500 : 400)
                            .html(() => countType === 'record' ? 'RC' : 'PC')
                        const mapCountsBarRC = mapCountsRC.append('div')
                            .classed('list-counts-bar-container',true)
                        mapCountsBarRC.append('div')
                            .classed('map-counts-RC-bar list-counts-bar',true)
                            .style('width', d => countType === 'record' ? scaleWidth(d.total_counts) + 'px' : scaleWidth(d.person_counts) + 'px' )
                            .style('background-color', d => conceptNames.includes(d.name) ? d.color : '#e0e0e0')
                        
                        const mapCountsDRC = mapCountsSection.append('div')
                            .classed('list-counts',true)
                        mapCountsDRC.append('p')
                            .classed('map-counts-DRC-p list-counts-p num',true)
                            .style('text-align','left')
                            .style('color', '#808080')
                            .style('font-weight', 400)
                            .html(d => countType === 'record' ? formatThousands(d.descendant_counts) : formatThousands(d.descendant_person_counts))
                        mapCountsDRC.append('p')
                            .classed('map-counts-DRC-label list-counts-label',true)
                            .style('color', '#808080')
                            .style('font-weight', 400)
                            .html(() => countType === 'record' ? 'DRC' : 'DPC')
                        const mapCountsBarDRC = mapCountsDRC.append('div')
                            .classed('list-counts-bar-container',true)
                        mapCountsBarDRC.append('div')
                            .classed('map-counts-DRC-bar list-counts-bar',true)
                            .style('width', d => countType === 'record' ? scaleWidth(d.descendant_counts) + 'px' : scaleWidth(d.descendant_person_counts) + 'px')
                            .style('background-color', '#e0e0e0')   
                        
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
                            .classed('list-circle-dash', d => (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) ? true : false)
                            .classed('list-circle', d => (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) ? false : true)
                            .classed('btn', d => conceptNames.includes(d.name) ? true : false)
                            .style('pointer-events', d => conceptNames.includes(d.name) ? 'all' : 'none')
                            .style('background', d => {
                                if ((countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0)) return "none"
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
                                if ((countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0)) return "transparent"
                                if (conceptNames.includes(d.name)) {
                                    if (d.data.concept.standard_concept) {return d.color} 
                                    else {return "transparent"}
                                }
                                else return '#d6d6d6'
                            }) 
                            .style('border', d => (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) ? '1px solid #b2b2b2' : conceptNames.includes(d.name) ? `1px solid ${d.color}` : '1px solid #d6d6d6')
                            .on('mouseover',(e,d) => setHovered([d.name]))
                            .on('mouseout', (e,d) => setHovered([]))
                        update.select('.map-list-title-right')
                            .on('mouseover',(e,d) => {
                                    d3.select('#list-icons-'+d.name).transition(1000).style('max-width','36px').style('opacity',1)
                            })
                            .on('mouseout', (e,d) => {
                                
                                if (!showConfirmation) d3.select('#list-icons-'+d.name).transition(1000).style('max-width','0px').style('opacity',0)
                            })
                        update.select('.map-list-closed-eye')
                            .style('display', d => !conceptNames.includes(d.name) && d.total_counts > 0 ? 'inline-block' : 'none')
                            .on('mouseover', (e, d) => {
                                d3.select('#list-closed-eye-'+d.name).transition().style('opacity',1)
                                const el = e.currentTarget
                                el.__hoverTimeout__ = setTimeout(() => {
                                    showActionLabel('Show concept','enter',e)
                                }, 1200)
                            }) 
                            .on('mouseout', (e,d) => {
                                d3.select('#list-closed-eye-'+d.name).transition().style('opacity',0.3)
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave',e)
                            })
                            .on('click',(e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave')
                                const newInclusions = [...inclusions,d.name]
                                updateConcepts(newInclusions,nodes,[d],[])
                            })
                        update.select('.map-list-eye')
                            .style('display', d => (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) || !conceptNames.includes(d.name) ? 'none' : 'inline-block')
                            .on('mouseover', (e, d) => {
                                const el = e.currentTarget
                                el.__hoverTimeout__ = setTimeout(() => {
                                    showActionLabel('Hide concept','enter',e)
                                }, 1200)
                            })
                            .on('mouseout', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave',e)
                            })
                            .on('click',(e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave')
                                const newInclusions = inclusions.filter(e => e !== d.name)
                                updateConcepts(newInclusions,nodes,[],[d])
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
                                showConfirmationPopup(d, 'leave', e)
                            })
                            .on('click', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave')
                                showConfirmationPopup(d, 'enter', e)
                            })
                        update.select('.map-list-title-p')
                            .on('mouseover', (e, d) => {
                                if (!sidebarRoot.name.includes(d.name)) {
                                    const el = e.currentTarget
                                    el.__hoverTimeout__ = setTimeout(() => {
                                        showActionLabel('Select concept','enter',e)
                                    }, 1200)    
                                }
                            })
                            .on('mouseout', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave',e)
                                showConfirmationPopup(d,'leave')
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
                            .html(d => countType === 'record' ? formatThousands(d.total_counts) : formatThousands(d.person_counts))
                        update.select('.map-counts-RC-label')
                            .style('color', d => conceptNames.includes(d.name) ? '#36126d' : '#808080')
                            .style('font-weight', d => conceptNames.includes(d.name) ? 500 : 400)
                            .html(() => countType === 'record' ? 'RC' : 'PC')
                        update.select('.map-counts-RC-bar')
                            .transition()
                            .style('width', d => countType === 'record' ? scaleWidth(d.total_counts) + 'px' : scaleWidth(d.person_counts) + 'px')
                            .style('background-color', d => conceptNames.includes(d.name) ? d.color : '#e0e0e0')
                        update.select('.map-counts-DRC-p')
                            .html(d => countType === 'record' ? formatThousands(d.descendant_counts) : formatThousands(d.descendant_person_counts))
                        update.select('.map-counts-DRC-label')
                            .html(() => countType === 'record' ? 'DRC' : 'DPC')
                        update.select('.map-counts-DRC-bar')
                            .transition()
                            .style('width', d => countType === 'record' ? scaleWidth(d.descendant_counts) + 'px' : scaleWidth(d.descendant_person_counts) + 'px')
                    })
                })
            },update => {
                // CONCEPT LIST
                update.selectAll(".list-item-container").data(d => d.nodes, d => d.name)
                .join(enter => {
                    const itemContainer = enter.append('div')
                        .classed('list-item-container',true)
                        .style('border-bottom', d => d.levels === '-1' ? '0.5px solid #d3d3d3' : '0.5px solid #e0e0e0')
                    const item = itemContainer.append('div')
                        .classed('list-item',true)
                        .attr('id', d => 'list-item-'+d.name)
                        .style('background-color', d => d.levels === '-1' ? '#f7f7f7' : 'white')
                        .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                    const titleSection = item.append('div')
                        .classed('list-title-section',true)
                    const conceptCard = titleSection.append('div')
                        .classed('list-card concept-card',true)
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
                        .classed('list-circle-dash', d => (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) && !d.leaf ? true : false)
                        .classed('list-circle', d => (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) && !d.leaf ? false : true)
                        .classed('btn', d => conceptNames.includes(d.name) || d.leaf ? true : false)
                        .style("pointer-events", d => conceptNames.includes(d.name) || d.leaf ? 'all' : 'none')
                        .style('background', d => {
                            if ((countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) && !d.leaf) return "none"
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
                            if ((countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) && !d.leaf) return "transparent"
                            if (conceptNames.includes(d.name) || d.leaf) {
                                if (d.data.concept.standard_concept) {return d.color} 
                                else {return "transparent"}
                            }
                            else return '#d6d6d6'
                        }) 
                        .style('border', d => (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) && !d.leaf ? '1px solid #b2b2b2' : conceptNames.includes(d.name) || d.leaf ? `1px solid ${d.color}` : '1px solid #d6d6d6')
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
                    titleRight.append('img')
                        .classed('list-closed-eye icon marginRight eye',true)
                        .attr('id', d => 'list-closed-eye-'+d.name)
                        .attr("src", closedEye)
                        .style('opacity', 0.3)  
                        .style('display', d => !conceptNames.includes(d.name) && (d.total_counts > 0 || d.leaf) && d.levels !== '-1' ? 'inline-block' : 'none')
                        .on('mouseover', (e, d) => {
                            d3.select('#list-closed-eye-'+d.name).transition().style('opacity',1)
                            const el = e.currentTarget
                            el.__hoverTimeout__ = setTimeout(() => {
                                showActionLabel('Show concept','enter',e)
                            }, 1200)
                        }) 
                        .on('mouseout', (e,d) => {
                            d3.select('#list-closed-eye-'+d.name).transition().style('opacity',0.3)
                            clearTimeout(e.currentTarget.__hoverTimeout__)
                            showActionLabel('','leave',e)
                        })
                        .on('click',(e,d) => {
                            clearTimeout(e.currentTarget.__hoverTimeout__)
                            showActionLabel('','leave')
                            const newInclusions = [...inclusions,d.name]
                            updateConcepts(newInclusions,nodes,[d],[])
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
                        .attr("src", openedEye)
                        .style('opacity', 1)
                        .style('display', d => ((countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) && !d.leaf) || d.levels === '-1' ? 'none' : !conceptNames.includes(d.name) ? 'none' : 'inline-block')
                        .on('mouseover', (e, d) => {
                            const el = e.currentTarget
                            el.__hoverTimeout__ = setTimeout(() => {
                                showActionLabel('Hide concept','enter',e)
                            }, 1200)
                        })
                        .on('mouseout', (e,d) => {
                            clearTimeout(e.currentTarget.__hoverTimeout__)
                            showActionLabel('','leave',e)
                        })
                        .on('click',(e,d) => {
                            clearTimeout(e.currentTarget.__hoverTimeout__)
                            showActionLabel('','leave')
                            const newInclusions = inclusions.filter(e => e !== d.name)
                            updateConcepts(newInclusions,nodes,[],[d])
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
                            showConfirmationPopup(d, 'leave', e)
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
                            if (!sidebarRoot.name.includes(d.name)) {
                                const el = e.currentTarget
                                el.__hoverTimeout__ = setTimeout(() => {
                                    showActionLabel('Select concept','enter',e)
                                }, 1200)    
                            }
                        })
                        .on('mouseout', (e,d) => {
                            clearTimeout(e.currentTarget.__hoverTimeout__)
                            showActionLabel('','leave',e)
                            showConfirmationPopup(d,'leave')
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
                        .html(d => countType === 'record' ? formatThousands(d.total_counts) : formatThousands(d.person_counts))
                    countsRC.append('p')
                        .classed('counts-RC-label list-counts-label',true)
                        .style('color', d => conceptNames.includes(d.name) && !d.leaf ? '#36126d' : '#808080')
                        .style('font-weight', d => conceptNames.includes(d.name) && !d.leaf ? 500 : 400)
                        .html(() => countType === 'record' ? 'RC' : 'PC')
                    const countsBarRC = countsRC.append('div')
                        .classed('list-counts-bar-container',true)
                    countsBarRC.append('div')
                        .classed('counts-RC-bar list-counts-bar',true)
                        .style('width', d => countType === 'record' ? scaleWidth(d.total_counts) + 'px' : scaleWidth(d.person_counts) + 'px')
                        .style('background-color', d => conceptNames.includes(d.name) && !d.leaf ? d.color : '#e0e0e0')
                    
                    const countsDRC = countsSection.append('div')
                        .classed('list-counts',true)
                    countsDRC.append('p')
                        .classed('counts-DRC-p list-counts-p num',true)
                        .style('text-align','left')
                        .style('color', d => conceptNames.includes(d.name) && d.leaf ? '#36126d' : '#808080')
                        .style('font-weight', d => conceptNames.includes(d.name) && d.leaf ? 500 : 400)
                        .html(d => countType === 'record' ? formatThousands(d.descendant_counts) : formatThousands(d.descendant_person_counts))
                    countsDRC.append('p')
                        .classed('counts-DRC-label list-counts-label',true)
                        .style('color', d => conceptNames.includes(d.name) && d.leaf ? '#36126d' : '#808080')
                        .style('font-weight', d => conceptNames.includes(d.name) && d.leaf ? 500 : 400)
                        .html(() => countType === 'record' ? 'DRC' : 'DPC')
                    const countsBarDRC = countsDRC.append('div')
                        .classed('list-counts-bar-container',true)
                    countsBarDRC.append('div')
                        .classed('counts-DRC-bar list-counts-bar',true)
                        .style('width', d => countType === 'record' ? scaleWidth(d.descendant_counts) + 'px' : scaleWidth(d.descendant_person_counts) + 'px')
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
                            .classed('map-list-card concept-card',true)
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
                            .classed('list-circle-dash', d => (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) ? true : false)
                            .classed('list-circle', d => (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) ? false : true)
                            .classed('btn', d => conceptNames.includes(d.name) ? true : false)
                            .style('pointer-events', d => conceptNames.includes(d.name) ? 'all' : 'none')
                            .style('background', d => {
                                if ((countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0)) return "none"
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
                                if ((countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0)) return "transparent"
                                if (conceptNames.includes(d.name)) {
                                    if (d.data.concept.standard_concept) {return d.color} 
                                    else {return "transparent"}
                                }
                                else return '#d6d6d6'
                            }) 
                            .style('border', d => (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) ? '1px solid #b2b2b2' : conceptNames.includes(d.name) ? `1px solid ${d.color}` : '1px solid #d6d6d6')
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
                            mapTitleRight.append('img')
                                .classed('map-list-closed-eye icon marginRight eye',true)
                                .attr('id', d => 'list-closed-eye-'+d.name)
                                .attr("src", closedEye)
                                .style('opacity', 0.3)  
                                .style('display', d => !conceptNames.includes(d.name) && d.total_counts > 0 ? 'inline-block' : 'none')
                                .on('mouseover', (e, d) => {
                                    d3.select('#list-closed-eye-'+d.name).transition().style('opacity',1)
                                    const el = e.currentTarget
                                    el.__hoverTimeout__ = setTimeout(() => {
                                        showActionLabel('Show concept','enter',e)
                                    }, 1200)
                                }) 
                                .on('mouseout', (e,d) => {
                                    d3.select('#list-closed-eye-'+d.name).transition().style('opacity',0.3)
                                    clearTimeout(e.currentTarget.__hoverTimeout__)
                                    showActionLabel('','leave',e)
                                })
                                .on('click',(e,d) => {
                                    clearTimeout(e.currentTarget.__hoverTimeout__)
                                    showActionLabel('','leave')
                                    const newInclusions = [...inclusions,d.name]
                                    updateConcepts(newInclusions,nodes,[d],[])
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
                            .attr("src", openedEye)
                            .style('opacity', 1)
                            .style('display', d => (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) || !conceptNames.includes(d.name) ? 'none' : 'inline-block')
                            .on('mouseover', (e, d) => {
                                const el = e.currentTarget
                                el.__hoverTimeout__ = setTimeout(() => {
                                    showActionLabel('Hide concept','enter',e)
                                }, 1200)
                            })
                            .on('mouseout', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave',e)
                            })
                            .on('click',(e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave')
                                const newInclusions = inclusions.filter(e => e !== d.name)
                                updateConcepts(newInclusions,nodes,[],[d])
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
                                showConfirmationPopup(d, 'leave', e)
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
                                if (!sidebarRoot.name.includes(d.name)) {
                                    const el = e.currentTarget
                                    el.__hoverTimeout__ = setTimeout(() => {
                                        showActionLabel('Select concept','enter',e)
                                    }, 1200)    
                                }
                            })
                            .on('mouseout', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave',e)
                                showConfirmationPopup(d,'leave')
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
                            .html(d => countType === 'record' ? formatThousands(d.total_counts) : formatThousands(d.person_counts))
                        mapCountsRC.append('p')
                            .classed('map-counts-RC-label list-counts-label',true)
                            .style('color', d => conceptNames.includes(d.name) ? '#36126d' : '#808080')
                            .style('font-weight', d => conceptNames.includes(d.name) ? 500 : 400)
                            .html(() => countType === 'record' ? 'RC' : 'PC')
                        const mapCountsBarRC = mapCountsRC.append('div')
                            .classed('list-counts-bar-container',true)
                        mapCountsBarRC.append('div')
                            .classed('map-counts-RC-bar list-counts-bar',true)
                            .style('width', d => countType === 'record' ? scaleWidth(d.total_counts) + 'px' : scaleWidth(d.person_counts) + 'px' )
                            .style('background-color', d => conceptNames.includes(d.name) ? d.color : '#e0e0e0')
                        
                        const mapCountsDRC = mapCountsSection.append('div')
                            .classed('list-counts',true)
                        mapCountsDRC.append('p')
                            .classed('map-counts-DRC-p list-counts-p num',true)
                            .style('text-align','left')
                            .style('color', '#808080')
                            .style('font-weight', 400)
                            .html(d => countType === 'record' ? formatThousands(d.descendant_counts) : formatThousands(d.descendant_person_counts))
                        mapCountsDRC.append('p')
                            .classed('map-counts-DRC-label list-counts-label',true)
                            .style('color', '#808080')
                            .style('font-weight', 400)
                            .html(() => countType === 'record' ? 'DRC' : 'DPC')
                        const mapCountsBarDRC = mapCountsDRC.append('div')
                            .classed('list-counts-bar-container',true)
                        mapCountsBarDRC.append('div')
                            .classed('map-counts-DRC-bar list-counts-bar',true)
                            .style('width', d => countType === 'record' ? scaleWidth(d.descendant_counts) + 'px' : scaleWidth(d.descendant_person_counts) + 'px')
                            .style('background-color', '#e0e0e0')   
                        
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
                            .classed('list-circle-dash', d => (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) ? true : false)
                            .classed('list-circle', d => (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) ? false : true)
                            .classed('btn', d => conceptNames.includes(d.name) ? true : false)
                            .style('pointer-events', d => conceptNames.includes(d.name) ? 'all' : 'none')
                            .style('background', d => {
                                if ((countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0)) return "none"
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
                                if ((countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0)) return "transparent"
                                if (conceptNames.includes(d.name)) {
                                    if (d.data.concept.standard_concept) {return d.color} 
                                    else {return "transparent"}
                                }
                                else return '#d6d6d6'
                            }) 
                            .style('border', d => (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) ? '1px solid #b2b2b2' : conceptNames.includes(d.name) ? `1px solid ${d.color}` : '1px solid #d6d6d6')
                            .on('mouseover',(e,d) => setHovered([d.name]))
                            .on('mouseout', (e,d) => setHovered([]))
                        update.select('.map-list-title-right')
                            .on('mouseover',(e,d) => {
                                    d3.select('#list-icons-'+d.name).transition(1000).style('max-width','36px').style('opacity',1)
                            })
                            .on('mouseout', (e,d) => {
                                
                                if (!showConfirmation) d3.select('#list-icons-'+d.name).transition(1000).style('max-width','0px').style('opacity',0)
                            })
                        update.select('.map-list-closed-eye')
                            .style('display', d => !conceptNames.includes(d.name) && d.total_counts > 0 ? 'inline-block' : 'none')
                            .on('mouseover', (e, d) => {
                                d3.select('#list-closed-eye-'+d.name).transition().style('opacity',1)
                                const el = e.currentTarget
                                el.__hoverTimeout__ = setTimeout(() => {
                                    showActionLabel('Show concept','enter',e)
                                }, 1200)
                            }) 
                            .on('mouseout', (e,d) => {
                                d3.select('#list-closed-eye-'+d.name).transition().style('opacity',0.3)
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave',e)
                            })
                            .on('click',(e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave')
                                const newInclusions = [...inclusions,d.name]
                                updateConcepts(newInclusions,nodes,[d],[])
                            })
                        update.select('.map-list-eye')
                            .style('display', d => (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) || !conceptNames.includes(d.name) ? 'none' : 'inline-block')
                            .on('mouseover', (e, d) => {
                                const el = e.currentTarget
                                el.__hoverTimeout__ = setTimeout(() => {
                                    showActionLabel('Hide concept','enter',e)
                                }, 1200)
                            })
                            .on('mouseout', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave',e)
                            })
                            .on('click',(e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave')
                                const newInclusions = inclusions.filter(e => e !== d.name)
                                updateConcepts(newInclusions,nodes,[],[d])
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
                                showConfirmationPopup(d, 'leave', e)
                            })
                            .on('click', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave')
                                showConfirmationPopup(d, 'enter', e)
                            })
                        update.select('.map-list-title-p')
                            .on('mouseover', (e, d) => {
                                if (!sidebarRoot.name.includes(d.name)) {
                                    const el = e.currentTarget
                                    el.__hoverTimeout__ = setTimeout(() => {
                                        showActionLabel('Select concept','enter',e)
                                    }, 1200)    
                                }
                            })
                            .on('mouseout', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave',e)
                                showConfirmationPopup(d,'leave')
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
                            .html(d => countType === 'record' ? formatThousands(d.total_counts) : formatThousands(d.person_counts))
                        update.select('.map-counts-RC-label')
                            .style('color', d => conceptNames.includes(d.name) ? '#36126d' : '#808080')
                            .style('font-weight', d => conceptNames.includes(d.name) ? 500 : 400)
                            .html(() => countType === 'record' ? 'RC' : 'PC')
                        update.select('.map-counts-RC-bar')
                            .transition()
                            .style('width', d => countType === 'record' ? scaleWidth(d.total_counts) + 'px' : scaleWidth(d.person_counts) + 'px')
                            .style('background-color', d => conceptNames.includes(d.name) ? d.color : '#e0e0e0')
                        update.select('.map-counts-DRC-p')
                            .html(d => countType === 'record' ? formatThousands(d.descendant_counts) : formatThousands(d.descendant_person_counts))
                        update.select('.map-counts-DRC-label')
                            .html(() => countType === 'record' ? 'DRC' : 'DPC')
                        update.select('.map-counts-DRC-bar')
                            .transition()
                            .style('width', d => countType === 'record' ? scaleWidth(d.descendant_counts) + 'px' : scaleWidth(d.descendant_person_counts) + 'px')
                    })
                },update => {
                    update.select('.list-item')
                        .style('background-color', d => d.levels === '-1' ? '#f7f7f7' : 'white')
                        .transition()
                        .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                    update.select('.list-card')
                        .style('box-shadow', d => conceptNames.includes(d.name) || d.leaf ? '0 0 0 1px rgba(0, 0, 0, 0.02),0 2px 10px rgba(0, 0, 0, 0.15)' : 'none')
                        .style('background-color', d => d.levels === '-1' ? 'none' : conceptNames.includes(d.name) || d.leaf ? 'white' : '#ebebeb')
                    update.select('.list-title-circle')
                        .classed('list-circle-dash', d => (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) && !d.leaf ? true : false)
                        .classed('list-circle', d => (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) && !d.leaf ? false : true)
                        .classed('btn', d => conceptNames.includes(d.name) || d.leaf ? true : false)
                        .style("pointer-events", d => conceptNames.includes(d.name) || d.leaf ? 'all' : 'none')
                        .style('background', d => {
                            if ((countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) && !d.leaf) return "none"
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
                            if ((countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) && !d.leaf) return "transparent"
                            if (conceptNames.includes(d.name) || d.leaf) {
                                if (d.data.concept.standard_concept) {return d.color} 
                                else {return "transparent"}
                            }
                            else return '#d6d6d6'
                        }) 
                        .style('border', d => (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) && !d.leaf ? '1px solid #b2b2b2' : conceptNames.includes(d.name) || d.leaf ? `1px solid ${d.color}` : '1px solid #d6d6d6')
                        .on('mouseover',(e,d) => setHovered([d.name]))
                        .on('mouseout', (e,d) => setHovered([]))
                    update.select('.list-title-right')
                        .on('mouseover',(e,d) => {
                                d3.select('#list-icons-'+d.name).transition(1000).style('max-width','36px').style('opacity',1)
                        })
                        .on('mouseout', (e,d) => {
                            
                            if (!showConfirmation) d3.select('#list-icons-'+d.name).transition(1000).style('max-width','0px').style('opacity',0)
                        })
                    update.select('.list-closed-eye')
                        .style('display', d => !conceptNames.includes(d.name) && (d.total_counts > 0 || d.leaf) && d.levels !== '-1' ? 'inline-block' : 'none')
                        .on('mouseover', (e, d) => {
                            d3.select('#list-closed-eye-'+d.name).transition().style('opacity',1)
                            const el = e.currentTarget
                            el.__hoverTimeout__ = setTimeout(() => {
                                showActionLabel('Show concept','enter',e)
                            }, 1200)
                        }) 
                        .on('mouseout', (e,d) => {
                            d3.select('#list-closed-eye-'+d.name).transition().style('opacity',0.3)
                            clearTimeout(e.currentTarget.__hoverTimeout__)
                            showActionLabel('','leave',e)
                        })
                    update.select('.list-eye')
                        .style('display', d => ((countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) && !d.leaf) || d.levels === '-1' ? 'none' : !conceptNames.includes(d.name) ? 'none' : 'inline-block')
                        .on('mouseover', (e, d) => {
                            const el = e.currentTarget
                            el.__hoverTimeout__ = setTimeout(() => {
                                showActionLabel('Hide concept','enter',e)
                            }, 1200)
                        })
                        .on('mouseout', (e,d) => {
                            clearTimeout(e.currentTarget.__hoverTimeout__)
                            showActionLabel('','leave',e)
                        })
                        .on('click',(e,d) => {
                            clearTimeout(e.currentTarget.__hoverTimeout__)
                            showActionLabel('','leave')
                            const newInclusions = inclusions.filter(e => e !== d.name)
                            updateConcepts(newInclusions,nodes,[],[d])
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
                            showConfirmationPopup(d, 'leave', e)
                        })
                        .on('click', (e,d) => {
                            clearTimeout(e.currentTarget.__hoverTimeout__)
                            showActionLabel('','leave')
                            showConfirmationPopup(d, 'enter', e)
                        })
                    update.select('.list-title-p')
                        .on('mouseover', (e, d) => {
                            if (!sidebarRoot.name.includes(d.name)) {
                                const el = e.currentTarget
                                el.__hoverTimeout__ = setTimeout(() => {
                                    showActionLabel('Select concept','enter',e)
                                }, 1200)    
                            }
                        })
                        .on('mouseout', (e,d) => {
                            clearTimeout(e.currentTarget.__hoverTimeout__)
                            showActionLabel('','leave',e)
                            showConfirmationPopup(d,'leave')
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
                        .html(d => countType === 'record' ? formatThousands(d.total_counts) : formatThousands(d.person_counts))
                    update.select('.counts-RC-label')
                        .style('color', d => conceptNames.includes(d.name) && !d.leaf ? '#36126d' : '#808080')
                        .style('font-weight', d => conceptNames.includes(d.name) && !d.leaf ? 500 : 400)
                        .html(() => countType === 'record' ? 'RC' : 'PC')
                    update.select('.counts-RC-bar')
                        .transition()
                        .style('width', d => countType === 'record' ? scaleWidth(d.total_counts) + 'px' : scaleWidth(d.person_counts) + 'px' )
                        .style('background-color', d => conceptNames.includes(d.name) && !d.leaf ? d.color : '#e0e0e0')
                    update.select('.counts-DRC-p')
                        .style('color', d => conceptNames.includes(d.name) && d.leaf ? '#36126d' : '#808080')
                        .style('font-weight', d => conceptNames.includes(d.name) && d.leaf ? 500 : 400)
                        .html(d => countType === 'record' ? formatThousands(d.descendant_counts) : formatThousands(d.descendant_person_counts))
                    update.select('.counts-DRC-label')
                        .style('color', d => conceptNames.includes(d.name) && d.leaf ? '#36126d' : '#808080')
                        .style('font-weight', d => conceptNames.includes(d.name) && d.leaf ? 500 : 400)
                        .html(() => countType === 'record' ? 'DRC' : 'DPC')
                    update.select('.counts-DRC-bar')
                        .transition()
                        .style('width', d => countType === 'record' ? scaleWidth(d.descendant_counts) + 'px' : scaleWidth(d.descendant_person_counts) + 'px' )
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
                            .classed('map-list-card concept-card',true)
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
                            .classed('list-circle-dash', d => (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) ? true : false)
                            .classed('list-circle', d => (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) ? false : true)
                            .classed('btn', d => conceptNames.includes(d.name) ? true : false)
                            .style('pointer-events', d => conceptNames.includes(d.name) ? 'all' : 'none')
                            .style('background', d => {
                                if ((countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0)) return "none"
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
                                if ((countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0)) return "transparent"
                                if (conceptNames.includes(d.name)) {
                                    if (d.data.concept.standard_concept) {return d.color} 
                                    else {return "transparent"}
                                }
                                else return '#d6d6d6'
                            }) 
                            .style('border', d => (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) ? '1px solid #b2b2b2' : conceptNames.includes(d.name) ? `1px solid ${d.color}` : '1px solid #d6d6d6')
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
                            mapTitleRight.append('img')
                                .classed('map-list-closed-eye icon marginRight eye',true)
                                .attr('id', d => 'list-closed-eye-'+d.name)
                                .attr("src", closedEye)
                                .style('opacity', 0.3)  
                                .style('display', d => !conceptNames.includes(d.name) && d.total_counts > 0 ? 'inline-block' : 'none')
                                .on('mouseover', (e, d) => {
                                    d3.select('#list-closed-eye-'+d.name).transition().style('opacity',1)
                                    const el = e.currentTarget
                                    el.__hoverTimeout__ = setTimeout(() => {
                                        showActionLabel('Show concept','enter',e)
                                    }, 1200)
                                }) 
                                .on('mouseout', (e,d) => {
                                    d3.select('#list-closed-eye-'+d.name).transition().style('opacity',0.3)
                                    clearTimeout(e.currentTarget.__hoverTimeout__)
                                    showActionLabel('','leave',e)
                                })
                                .on('click',(e,d) => {
                                    clearTimeout(e.currentTarget.__hoverTimeout__)
                                    showActionLabel('','leave')
                                    const newInclusions = [...inclusions,d.name]
                                    updateConcepts(newInclusions,nodes,[d],[])
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
                            .attr("src", openedEye)
                            .style('opacity', 1)
                            .style('display', d => (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) || !conceptNames.includes(d.name) ? 'none' : 'inline-block')
                            .on('mouseover', (e, d) => {
                                const el = e.currentTarget
                                el.__hoverTimeout__ = setTimeout(() => {
                                    showActionLabel('Hide concept','enter',e)
                                }, 1200)
                            })
                            .on('mouseout', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave',e)
                            })
                            .on('click',(e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave')
                                const newInclusions = inclusions.filter(e => e !== d.name)
                                updateConcepts(newInclusions,nodes,[],[d])
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
                                showConfirmationPopup(d, 'leave', e)
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
                                if (!sidebarRoot.name.includes(d.name)) {
                                    const el = e.currentTarget
                                    el.__hoverTimeout__ = setTimeout(() => {
                                        showActionLabel('Select concept','enter',e)
                                    }, 1200)    
                                }
                            })
                            .on('mouseout', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave',e)
                                showConfirmationPopup(d,'leave')
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
                            .html(d => countType === 'record' ? formatThousands(d.total_counts) : formatThousands(d.person_counts))
                        mapCountsRC.append('p')
                            .classed('map-counts-RC-label list-counts-label',true)
                            .style('color', d => conceptNames.includes(d.name) ? '#36126d' : '#808080')
                            .style('font-weight', d => conceptNames.includes(d.name) ? 500 : 400)
                            .html(() => countType === 'record' ? 'RC' : 'PC')
                        const mapCountsBarRC = mapCountsRC.append('div')
                            .classed('list-counts-bar-container',true)
                        mapCountsBarRC.append('div')
                            .classed('map-counts-RC-bar list-counts-bar',true)
                            .style('width', d => countType === 'record' ? scaleWidth(d.total_counts) + 'px' : scaleWidth(d.person_counts) + 'px' )
                            .style('background-color', d => conceptNames.includes(d.name) ? d.color : '#e0e0e0')
                        
                        const mapCountsDRC = mapCountsSection.append('div')
                            .classed('list-counts',true)
                        mapCountsDRC.append('p')
                            .classed('map-counts-DRC-p list-counts-p num',true)
                            .style('text-align','left')
                            .style('color', '#808080')
                            .style('font-weight', 400)
                            .html(d => countType === 'record' ? formatThousands(d.descendant_counts) : formatThousands(d.descendant_person_counts))
                        mapCountsDRC.append('p')
                            .classed('map-counts-DRC-label list-counts-label',true)
                            .style('color', '#808080')
                            .style('font-weight', 400)
                            .html(() => countType === 'record' ? 'DRC' : 'DPC')
                        const mapCountsBarDRC = mapCountsDRC.append('div')
                            .classed('list-counts-bar-container',true)
                        mapCountsBarDRC.append('div')
                            .classed('map-counts-DRC-bar list-counts-bar',true)
                            .style('width', d => countType === 'record' ? scaleWidth(d.descendant_counts) + 'px' : scaleWidth(d.descendant_person_counts) + 'px')
                            .style('background-color', '#e0e0e0')   
                        
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
                            .classed('list-circle-dash', d => (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) ? true : false)
                            .classed('list-circle', d => (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) ? false : true)
                            .classed('btn', d => conceptNames.includes(d.name) ? true : false)
                            .style('pointer-events', d => conceptNames.includes(d.name) ? 'all' : 'none')
                            .style('background', d => {
                                if ((countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0)) return "none"
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
                                if ((countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0)) return "transparent"
                                if (conceptNames.includes(d.name)) {
                                    if (d.data.concept.standard_concept) {return d.color} 
                                    else {return "transparent"}
                                }
                                else return '#d6d6d6'
                            }) 
                            .style('border', d => (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) ? '1px solid #b2b2b2' : conceptNames.includes(d.name) ? `1px solid ${d.color}` : '1px solid #d6d6d6')
                            .on('mouseover',(e,d) => setHovered([d.name]))
                            .on('mouseout', (e,d) => setHovered([]))
                        update.select('.map-list-title-right')
                            .on('mouseover',(e,d) => {
                                    d3.select('#list-icons-'+d.name).transition(1000).style('max-width','36px').style('opacity',1)
                            })
                            .on('mouseout', (e,d) => {
                                
                                if (!showConfirmation) d3.select('#list-icons-'+d.name).transition(1000).style('max-width','0px').style('opacity',0)
                            })
                        update.select('.map-list-closed-eye')
                            .style('display', d => !conceptNames.includes(d.name) && d.total_counts > 0 ? 'inline-block' : 'none')
                            .on('mouseover', (e, d) => {
                                d3.select('#list-closed-eye-'+d.name).transition().style('opacity',1)
                                const el = e.currentTarget
                                el.__hoverTimeout__ = setTimeout(() => {
                                    showActionLabel('Show concept','enter',e)
                                }, 1200)
                            }) 
                            .on('mouseout', (e,d) => {
                                d3.select('#list-closed-eye-'+d.name).transition().style('opacity',0.3)
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave',e)
                            })
                            .on('click',(e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave')
                                const newInclusions = [...inclusions,d.name]
                                updateConcepts(newInclusions,nodes,[d],[])
                            })
                        update.select('.map-list-eye')
                            .style('display', d => (countType === 'record' && d.total_counts === 0) || (countType === 'person' && d.person_counts === 0) || !conceptNames.includes(d.name) ? 'none' : 'inline-block')
                            .on('mouseover', (e, d) => {
                                const el = e.currentTarget
                                el.__hoverTimeout__ = setTimeout(() => {
                                    showActionLabel('Hide concept','enter',e)
                                }, 1200)
                            })
                            .on('mouseout', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave',e)
                            })
                            .on('click',(e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave')
                                const newInclusions = inclusions.filter(e => e !== d.name)
                                updateConcepts(newInclusions,nodes,[],[d])
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
                                showConfirmationPopup(d, 'leave', e)
                            })
                            .on('click', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave')
                                showConfirmationPopup(d, 'enter', e)
                            })
                        update.select('.map-list-title-p')
                            .on('mouseover', (e, d) => {
                                if (!sidebarRoot.name.includes(d.name)) {
                                    const el = e.currentTarget
                                    el.__hoverTimeout__ = setTimeout(() => {
                                        showActionLabel('Select concept','enter',e)
                                    }, 1200)    
                                }
                            })
                            .on('mouseout', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave',e)
                                showConfirmationPopup(d,'leave')
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
                            .html(d => countType === 'record' ? formatThousands(d.total_counts) : formatThousands(d.person_counts))
                        update.select('.map-counts-RC-label')
                            .style('color', d => conceptNames.includes(d.name) ? '#36126d' : '#808080')
                            .style('font-weight', d => conceptNames.includes(d.name) ? 500 : 400)
                            .html(() => countType === 'record' ? 'RC' : 'PC')
                        update.select('.map-counts-RC-bar')
                            .transition()
                            .style('width', d => countType === 'record' ? scaleWidth(d.total_counts) + 'px' : scaleWidth(d.person_counts) + 'px')
                            .style('background-color', d => conceptNames.includes(d.name) ? d.color : '#e0e0e0')
                        update.select('.map-counts-DRC-p')
                            .html(d => countType === 'record' ? formatThousands(d.descendant_counts) : formatThousands(d.descendant_person_counts))
                        update.select('.map-counts-DRC-label')
                            .html(() => countType === 'record' ? 'DRC' : 'DPC')
                        update.select('.map-counts-DRC-bar')
                            .transition()
                            .style('width', d => countType === 'record' ? scaleWidth(d.descendant_counts) + 'px' : scaleWidth(d.descendant_person_counts) + 'px')
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
            if (document.getElementById('header-levels')) {
                const levelContainer = document.getElementById('header-levels')
                if (!levelContainer.contains(e.target)) {
                    d3.select('#open-levels').style('display', 'block')
                    d3.select('#close-levels').style('display', 'none')  
                    d3.select('#dropdown-levels').style('visibility','hidden') 
                } 
            }
            if (document.getElementById('header-classes')) {
                const classContainer = document.getElementById('header-classes')
                if (!classContainer.contains(e.target)) {
                    d3.select('#open-classes').style('display', 'block')
                    d3.select('#close-classes').style('display', 'none') 
                    d3.select('#dropdown-classes').style('visibility','hidden')  
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
                if (fullClassList.every(c => classSelections.includes(c)) && fullClassList.length > 1) classSelections = ['All']
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
                            .style('pointer-events', () => !classSelections.includes('All') && fullClassList.length > 1 ? 'all' : 'none')
                        div.append('p')
                            .html(d => d)
                        div.append('i')
                            .classed('fa-solid fa-x icon',true)
                            .style('display', () => !classSelections.includes('All') && fullClassList.length > 1 ? 'block' : 'none')
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
                    })
                document.getElementById("header-classes").style.minWidth =  document.getElementById('dropdown-classes').clientWidth - 12 + 'px'
            }
        },[maxLevel,classFilter,allClasses,graphSectionWidth])

        // call draw functions
        useEffect(()=>{
            if (nodes && nodes.length > 0) {
                if (view === 'tree') {
                    d3.select('#tree-container').style('display','block')
                    d3.select('#set-container').style('display','none')
                    d3.select('#list-container').style('display','none')
                    let width = d3.select("#tree-container").node().getBoundingClientRect().width + margin*2;
                    let height = d3.select("#tree-container").node().getBoundingClientRect().height + margin*2;
                    d3.select("#tree")
                        .attr('width', '100%')
                        .attr('height', '100%')
                        .attr('viewBox', `${margin} ${margin} ${width} ${height}`)
                        .call(d3.zoom().on("start",()=>d3.select("#tree-graphics").style("pointer-events", "none")).on("zoom", zoomed)).on("end",()=>d3.select("#tree-graphics").style("pointer-events", "all"))
                    drawTree()
                }
                if (view === 'list') {
                    d3.select('#list-container').style('display','block')
                    d3.select('#set-container').style('display','none')
                    d3.select('#tree-container').style('display','none')
                    drawList()    
                }
                if (view === 'set') {
                    d3.select('#set-container').style('display','flex')
                    d3.select('#tree-container').style('display','none')
                    d3.select('#list-container').style('display','none')
                    drawSet()     
                }    
            }
        },[nodes,conceptNames,view,mapRoot,countType,graphSectionWidth,conceptNames.length < 50 ? hovered : null])

        useEffect(() => {
            setTimeout(() => {
                zoomToFit()
            }, 400) 
        },[countType,mapRoot,view,graphSectionWidth])

        useEffect(() => {
            if (fullTree.nodes && fullTree.mappings) {
                const allNodes = [...fullTree.nodes,...fullTree.mappings]
                const sum = countType === 'record' ? d3.sum(allNodes.filter(n => inclusions.includes(n.name)).map(n => n.total_counts)) : d3.sum(allNodes.filter(n => inclusions.includes(n.name)).map(n => n.person_counts))
                d3.select('#set-total-counts').html(sum)    
            }      
        },[inclusions,countType])

        useEffect(() => {
            setShowConfirmation(false)
            setVisible(false)
        },[view])

        return (
            <div id = "sidebar">
                <div id = "drag-bar"></div>
                <div className = "selectionsContainer removeRightShadow">
                    <div className = "filters" id = "sidebar-filters">
                        <div className="filterContainer" id = 'levels-container'>
                            <p className = 'filterLabel' style = {{fontWeight: levelFilter < fullTreeMax ? 500 : 400,opacity: levelFilter < fullTreeMax ? 1 : 0.7}}>Max Level</p>
                            <FontAwesomeIcon style = {{display: levelFilter < fullTreeMax ? 'block' : 'none',marginTop:1}} className = "resetFilter fa-solid icon" id = "reset-levels" icon={faX} 
                                onClick = {() => {
                                    setLevelFilter(fullTreeMax)
                                    d3.select('#open-levels').style('display', 'block')
                                    d3.select('#close-levels').style('display', 'none') 
                                    d3.select('#dropdown-levels').style('visibility','hidden')
                                    d3.select('#header-levels').classed('filterActive', false) 
                                }}
                            />
                            <div className = 'dropdownContainer'>
                                <div className = "dropdownHeader btn filterMargin" id = "header-levels" style = {{border: levelFilter < fullTreeMax ? 'none' : '1px solid #e0e0e0',overflow:'hidden'}}
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
                                <p className = 'filterLabel' style = {{fontWeight: classFilter && fullClassList.length > 1 && (classFilter.includes('All') || fullClassList.every(c => classFilter.includes(c))) ? 400 : 500,opacity: classFilter && classFilter && fullClassList.length > 1 && (classFilter.includes('All') || fullClassList.every(c => classFilter.includes(c))) ? 1 : 0.7}}>Classes</p>
                                <FontAwesomeIcon style = {{marginTop:1,display: classFilter && (classFilter.includes('All') || fullClassList.every(c => classFilter.includes(c))) ? 'none' : 'block'}} className = "resetFilter fa-solid icon" id = "reset-classes" icon={faX} 
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
                            
                            <div className = 'btn toggle-itm' id = "set-toggle" onClick={() => {setView('set');moveSlider(0,100,'view')}} style = {{fontWeight:view === 'set' ? 500 : 400,color:view === 'set' ? '#6a23d6' : '#999999'}}>Concept Set</div>
                            <div className = 'btn toggle-itm' id = "list-toggle" onClick={() => {setView('list');moveSlider(1,100,'view')}} style = {{fontWeight:view === 'list' ? 500 : 400,color:view === 'list' ? '#6a23d6' : '#999999'}}>List</div>
                            <div className = 'btn toggle-itm' id = "tree-toggle" onClick={() => {setView('tree');moveSlider(2,100,'view')}} style = {{fontWeight:view === 'tree' ? 500 : 400,color:view === 'tree' ? '#6a23d6' : '#999999'}}>Hierarchy</div>
                        </div> 
                        <div>
                            <FontAwesomeIcon style = {{display:'block'}} icon={faExpand} id = "expand" className = "fa-thin icon expand-compress" onClick={handleExpand} />
                            <FontAwesomeIcon style = {{display:'none'}} icon={faCompress} id = "compress" className = "fa-thin icon expand-compress" onClick={handleExpand} /> 
                        </div>  
                    </div>
                    <div className = 'sidebarContainer' id = "set-container" style = {{display: view === 'Set' ? 'flex' : 'none'}}>
                        <div id = "set-header">
                            <p className = "selectedText" style = {{marginLeft:'2px'}}>Concept</p>
                            <div className = "flex" style = {{position:'absolute',right:'calc(172px + 0.75em)'}}>
                                <p className = "selectedText marginRight">Expression</p> 
                                <div className = "questionMark flex selectedText btn">?</div>   
                            </div>
                            <p className = "selectedText" >{countType === 'record' ? 'DRC' : 'DPC'}</p>
                        </div>
                        <div id = "set-items"></div>
                        <div id = "set-total">
                            <p className = "selectedText">Total Descendant Counts:<span className = "num" id = "set-total-counts"  style = {{marginLeft:20}}></span></p>
                        </div>
                    </div>
                    <div className = 'sidebarContainer' id = "list-container" style = {{display: view === 'List' ? 'block' : 'none'}}></div>
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