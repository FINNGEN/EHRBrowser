import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faLessThanEqual } from '@fortawesome/free-solid-svg-icons'
import { faCaretDown } from '@fortawesome/free-solid-svg-icons'
import { faCaretUp } from '@fortawesome/free-solid-svg-icons'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { faX } from '@fortawesome/free-solid-svg-icons'
import openedEye from '../../img/opened-eye.svg'
import closedEye from '../../img/closed-eye.svg'
import rootLineIcon from '../../img/root-line.svg'
import YearFilter from '../yearFilter'
import * as d3 from "d3";
import textures from 'textures';

function GraphSection (props) {
    const navigate = useNavigate()
    const color = props.color
    const selectedConcepts = props.selectedConcepts
    const setSelectedConcepts = props.setSelectedConcepts
    const rootConcepts = props.rootConcepts
    const tooltipHover = props.tooltipHover
    const graphFilter = props.graphFilter
    const setGraphFilter = props.setGraphFilter
    // const conceptHover = props.conceptHover
    const extent = props.extent
    const setExtent = props.setExtent
    const openFilters = props.openFilters
    const setOpenFilters = props.setOpenFilters
    const stackData = props.stackData
    const inclusions = props.inclusions
    const generateColor = props.generateColor
    const rootLine = props.rootLine
    // const setRoot = props.setRoot
    // const filterData.age = props.filterData.age
    // const filterData.gender = props.filterData.gender
    // const filterData.source = props.filterData.source
    const filterData = props.filterData
    const maxGender = props.maxGender
    const getConceptInfo = props.getConceptInfo
    const zoomed = props.zoomed
    const setZoomed = props.setZoomed
    const hovered = props.hovered
    const setHovered = props.setHovered
    const graphSectionWidth = props.graphSectionWidth
    const colorList = props.colorList
    const annotations = props.annotations
    const relationship = props.relationship
    const showRootLine = props.showRootLine
    const setShowRootLine = props.setShowRootLine
    const showConfirmationPopup = props.showConfirmationPopup
    const showActionLabel = props.showActionLabel
    const countType = props.countType
    const setCountType = props.setCountType
    const moveSlider = props.moveSlider
    const fullTree = props.fullTree
    // const personData = props.personData
    const formatThousands = props.formatThousands
    const rootExtent = props.rootExtent
    const yearSelection = props.yearSelection
    const setYearSelection = props.setYearSelection
    const personFilterData = props.personFilterData
    const allNodesMap = props.allNodesMap
    const upsetZoomedOut = props.upsetZoomedOut
    const setUpsetZoomedOut = props.setUpsetZoomedOut
    const setLoading = props.setLoading
    const nodes = props.nodes
    const graphLoading = props.graphLoading
    // const prevalenceData = props.prevalenceData
    // const incidenceData = props.incidenceData
    const personData = props.personData
    const personVizType = props.personVizType
    const setPersonVizType = props.setPersonVizType
    const measurementData = props.measurementData
    const showConfirmation = props.showConfirmation
    const isLeaf = props.isLeaf
    const updateConcepts = props.updateConcepts
    const getNewInclusions = props.getNewInclusions
    const showTooltipPreview = props.showTooltipPreview
    const scheduleHide = props.scheduleHide
    const prevalenceData = props.prevalenceData
    const incidenceData = props.incidenceData
    const resetRef = props.resetRef
    const graphContainerRef = useRef()
    const upsetContainerRef = useRef()
    const upsetWrapperRef = useRef(null)     
    const upsetScrollRef = useRef(null)      
    const upsetNaturalSizeRef = useRef(null) 
    const [upsetOverflowing, setUpsetOverflowing] = useState(false)
    const [showLeftHint, setShowLeftHint] = useState(false)
    const [showRightHint, setShowRightHint] = useState(false)
    const margin = 20
    let hoverLabelCircle = false
    let brushing = false
    let zooming = false
    let x1,x2
    let hoverTimeout = null
    let currentTarget = null
    const hoveredPointKey = useRef(null)

    // DRAWING

    function createLinePattern(key, color) {
        const patternId = `pattern-${key}`
        const defs = d3.select('#graph').select("defs")
        const existing = defs.select(`#${CSS.escape(patternId)}`)
        if (!existing.empty()) return `url(#${patternId})`
        const size = 4
        const patt = defs.append("pattern")
            .attr("id", patternId)
            .attr("patternUnits", "userSpaceOnUse")
            .attr("width", size)
            .attr("height", size)
        patt.append("path")
            .attr("d", `M0,${size} L${size},0 M-${size/2},${size/2} L${size/2},-${size/2}`)
            .attr("stroke", color)
            .attr("stroke-width", 1.5)
            .attr("fill", "none")
        patt.append("path")
            .attr("d", `M0,${size*2} L${size*2},-0 M-${size},${size} L${size},-${size}`)
            .attr("stroke", color)
            .attr("stroke-width", 1.5)
            .attr("fill", "none")
        return `url(#${patternId})`
    }
    function drawUpset() {
        if (!Array.isArray(personData) || personData.length === 0) return
        d3.select('#sets-layer').selectAll('*').remove()
        d3.select('#upsets-layer').selectAll('*').remove()
        d3.select('#types-layer').selectAll('*').remove()
        d3.select('#y-axis-layer').selectAll('*').remove()

        const sortedData = [...personData].sort((a, b) => {
            const aSize = a.group.split('-').length
            const bSize = b.group.split('-').length
            if (aSize === 1 && bSize > 1) return -1
            if (aSize > 1 && bSize === 1) return 1
            return b.person_counts - a.person_counts
        }).slice(0, 40)

        const sortedIndexMap = new Map(sortedData.map((d, i) => [d.group, i]))
        const upsets = sortedData.map(d => [d.group, d.person_counts])
        const concepts = sortedData.flatMap(d => d.group.split('-')).filter((e, n, l) => l.indexOf(e) === n)

        const setTotals = concepts.map(concept => {
            const individual = sortedData
                .filter(d => d.group === concept)
                .reduce((sum, d) => sum + d.person_counts, 0)
            const intersection = sortedData
                .filter(d => d.group !== concept && d.group.split('-').includes(concept))
                .reduce((sum, d) => sum + d.person_counts, 0)
            const code = getConceptInfo(parseInt(concept.replace(/\D/g, ""))).concept_code
            const name = parseInt(concept.replace(/\D/g, ""))
            const node = fullTree.allNodes.find(n => n.name === name)
            return { concept, name, code, node, individual, intersection, total: individual + intersection }
        })
        const maxSetTotal = d3.max(setTotals, d => d.total)

        
        const setWidth = 140
        const setGap = 5
        const yAxisGap = 0
        const columnWidth = 30
        const columnGap = 10

        function measureTextWidth(text, fontSize = 10) {
            const svg = d3.select('body').append('svg').attr('width', 0).attr('height', 0)
            const textEl = svg.append('text').style('font-size', `${fontSize}px`).text(text)
            const width = textEl.node().getBBox().width
            svg.remove()
            return width
        }
        const codes = concepts.map(concept => getConceptInfo(parseInt(concept.replace(/\D/g, ""))).concept_code)
        const labelWidth = d3.max(codes.map(c => measureTextWidth(c))) + 10

        const margin = {
            top: 40, right: 40, bottom: 50,
            left: setWidth + labelWidth + setGap * 2 + yAxisGap
        }

        const idealBarHeight = 260
        const idealRowHeight = 30
        const MIN_BAR_HEIGHT = 80
        const MIN_ROW_HEIGHT = 12

        const container = upsetContainerRef.current
        const containerHeight = container ? container.clientHeight : 0

        let barHeight = idealBarHeight
        let matrixRowHeight = idealRowHeight

        if (containerHeight > 0) {
            const idealMatrixHeight = concepts.length * idealRowHeight
            const idealTotalHeight = margin.top + idealBarHeight + idealMatrixHeight + margin.bottom

            if (idealTotalHeight > containerHeight) {
                const availableHeight = Math.max(containerHeight - margin.top - margin.bottom, 0)
                const heightScale = availableHeight / (idealBarHeight + idealMatrixHeight)

                barHeight = Math.max(idealBarHeight * heightScale, MIN_BAR_HEIGHT)
                matrixRowHeight = Math.max(idealRowHeight * heightScale, MIN_ROW_HEIGHT)
            }
        }

        const matrixHeight = concepts.length * matrixRowHeight
        const totalHeight = margin.top + barHeight + matrixHeight + margin.bottom
        const leftPanelWidth = margin.left

        const totalColumnWidth = upsets.length * columnWidth + (upsets.length - 1) * columnGap
        const rightContentWidth = yAxisGap + totalColumnWidth + margin.right

        d3.select('#upset-left-svg').attr('width', leftPanelWidth).attr('height', totalHeight)
        d3.select('#upset-right-svg').attr('width', rightContentWidth).attr('height', totalHeight)

        const setXScale = d3.scaleLinear().domain([0, maxSetTotal]).range([0, setWidth])
        const setYScale = d3.scaleBand().domain(concepts).range([0, matrixHeight]).padding(0.2)

        const xScale = d3.scaleBand()
            .domain(d3.range(upsets.length))
            .range([yAxisGap, totalColumnWidth])
            .padding(0)

        const maxValue = d3.max(upsets, d => d[1])
        const yScale = d3.scaleLinear().domain([0, maxValue]).range([barHeight, 0])

        d3.select('#sets-layer')
            .attr('transform', `translate(${setGap + yAxisGap},${margin.top + barHeight})`)

        d3.select('#upsets-layer').attr('transform', `translate(0,${margin.top})`)
        d3.select('#types-layer').attr('transform', `translate(0,${margin.top + barHeight})`)

        const setSegments = setTotals.flatMap(d => {
            const individualWidth = setXScale(d.individual)
            const totalWidth = setXScale(d.total)
            return [
                {
                    concept: d.concept,
                    node: d.node,
                    type: 'individual',
                    x: setWidth - individualWidth,
                    width: individualWidth,
                    counts: d.individual 
                },
                {
                    concept: d.concept,
                    type: 'intersection',
                    x: setWidth - totalWidth,
                    width: totalWidth - individualWidth,
                    counts: d.total - d.individual
                }
            ]
        })

        d3.select('#sets-layer').selectAll('.set-bar')
            .data(setSegments, d => `${d.concept}-${d.type}`)
            .join('rect')
            .classed('set-bar btn', true)
            .attr('x', d => d.x)
            .attr('y', d => setYScale(d.concept))
            .attr('width', d => Math.max(d.width, 0))
            .attr('height', setYScale.bandwidth())
            .attr('stroke-width',1)
            .attr('stroke', d => d.type === 'individual' ? d.node.color : '#c9c9d5')
            .attr('fill', d => d.type === 'individual' ? d.node.color : 'white')
            .on('mouseover',(e,d)=>{
                if (d.type === 'individual') showUpsetTooltip('enter',e,d.counts,'Individual counts') 
                else showUpsetTooltip('enter',e,d.counts,'Intersection counts') 
            })
            .on('mouseout',(e,d)=>{
                showUpsetTooltip('leave')
            })

        d3.select('#sets-layer').selectAll('.set-label')
            .data(setTotals, d => d.concept)
            .join('text')
            .classed('set-label num btn', true)
            .attr('x', setWidth + labelWidth)
            .attr('y', d => setYScale(d.concept) + setYScale.bandwidth() / 2)
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'middle')
            .attr('font-weight',500)
            .attr('fill','#565867')
            .text(d => d.code)
            .on('mouseover',(e,d)=>{
                setHovered([d.name])
                tooltipHover(d.node,'enter',e)
            })
            .on('mouseout',(e,d)=>{
                setHovered([])
                tooltipHover(d.node,'leave')
            })


        d3.select('#upsets-layer').selectAll('.grid-line')
            .data(yScale.ticks(5).filter(d => d > 0))
            .join('line')
            .classed('grid-line', true)
            .attr('x1', 0)
            .attr('x2', rightContentWidth)
            .attr('y1', d => yScale(d))
            .attr('y2', d => yScale(d))
            .attr('stroke', '#eeeef2')
            .attr('stroke-width', 1)

        function highlightUpset(activeGroup) {
            const activeConcepts = activeGroup ? activeGroup.split('-') : []
            d3.selectAll('.upsets')
                .transition()
                .style('opacity', d => !activeGroup ? 1 : d[0] === activeGroup ? 1 : 0.2)
            d3.selectAll('.matrix-dot')
                .transition()
                .style('opacity', d => {
                    if (!activeGroup) return d.active ? 1 : 0.1
                    if (d.group !== activeGroup) return 0.2
                    return d.active ? 1 : 0.1
                })
            d3.selectAll('.intersection-line')
                .transition()
                .style('opacity', d => !activeGroup ? 0.5 : d.group === activeGroup ? 0.5 : 0.1)
            d3.selectAll('.set-bar')
                .transition()
                .style('opacity', d => !activeGroup ? 1 : activeConcepts.includes(d.concept) ? 1 : 0.2)
            d3.selectAll('.set-label')
                .transition()
                .style('opacity', d => !activeGroup ? 1 : activeConcepts.includes(d.concept) ? 1 : 0.2)
        }

        const upsets_g = d3.select('#upsets-layer').selectAll('.upsets')
            .data(upsets, d => d[0])
            .join(enter => {
                const g = enter.append('g')
                    .classed('upsets', true)
                g.append('rect')
                    .classed('upset-hitbox btn', true)
                    .attr('fill', 'transparent')
                    .style('pointer-events', 'all')
                g.append('rect')
                    .classed('upset-bar', true)
                    .style('pointer-events', 'none')
                g.append('text')
                    .classed('upset-count num', true)
                    .attr('text-anchor', 'middle')
                    .style('font-size', '8px')
                    .style('fill','#36126d')
                    .style('pointer-events', 'none')
                return g
            })

        upsets_g.select('.upset-hitbox')
            .attr('x', d => xScale(sortedIndexMap.get(d[0])))
            .attr('y', d => yScale(d[1]) - 16)
            .attr('width', columnWidth)
            .attr('height', d => (barHeight - yScale(d[1])) + 16)
            .on('mouseover',(e,d)=>{
                highlightUpset(d[0])
                const el = e.currentTarget
                el.__hoverTimeout__ = setTimeout(() => {
                    setHovered(d[0].split('-').map(s => Number(s.replace(/[^0-9]/g, ''))))
                }, 600)
            })
            .on('mouseout',(e,d)=>{
                clearTimeout(e.currentTarget.__hoverTimeout__)
                setHovered([])
                highlightUpset(null)
            })

        upsets_g.select('.upset-bar')
            .attr('x', d => xScale(sortedIndexMap.get(d[0])))
            .attr('y', d => yScale(d[1]))
            .attr('width', columnWidth)
            .attr('height', d => barHeight - yScale(d[1]))
            .attr('stroke', d => !d[0].includes('-') ? colorList[parseInt(d[0].replace(/\D/g, ""))] : '#c9c9d5')
            .attr('stroke-width',1)
            .attr('fill', d => !d[0].includes('-') ? colorList[parseInt(d[0].replace(/\D/g, ""))] : 'white')

        upsets_g.select('.upset-count')
            .attr('x', d => xScale(sortedIndexMap.get(d[0])) + columnWidth / 2)
            .attr('y', d => yScale(d[1]) - 8)
            .text(d => abbreviateNumber(d[1]))


        const matrixData = sortedData.flatMap(d =>
            concepts.map(concept => ({ group: d.group, concept, active: d.group.split('-').includes(concept) }))
        )

        d3.select('#types-layer').selectAll('.matrix-dot')
            .data(matrixData, d => `${d.group}-${d.concept}`)
            .join('circle')
            .classed('matrix-dot', true)
            .attr('cx', d => xScale(sortedIndexMap.get(d.group)) + columnWidth / 2)
            .attr('cy', d => setYScale(d.concept) + setYScale.bandwidth() / 2)
            .attr('r', 6)
            .attr('fill', d => colorList[parseInt(d.concept.replace(/\D/g, ""))])
            .attr('opacity', d => d.active ? 1 : 0.15)

        const intersectionLines = sortedData
            .filter(d => d.group.split('-').length > 1)
            .map(d => {
                const c = d.group.split('-')
                const ys = c.map(concept => setYScale(concept) + setYScale.bandwidth() / 2)
                return {
                    group: d.group,
                    y1: d3.min(ys),
                    y2: d3.max(ys)
                }
            })

        d3.select('#types-layer').selectAll('.intersection-line')
            .data(intersectionLines, d => d.group)
            .join('line')
            .classed('intersection-line', true)
            .attr('x1', d => xScale(sortedIndexMap.get(d.group)) + columnWidth / 2)
            .attr('x2', d => xScale(sortedIndexMap.get(d.group)) + columnWidth / 2)
            .attr('y1', d => d.y1)
            .attr('y2', d => d.y2)
            .attr('stroke', '#36126d')
            .attr('stroke-width',1.5)
            .attr('opacity', 0.5)

        upsetNaturalSizeRef.current = {
            leftWidth: leftPanelWidth,
            rightWidth: rightContentWidth,
            totalWidth: leftPanelWidth + rightContentWidth,
            height: totalHeight
        }

        layoutUpset()
    }
    function layoutUpset() {
        const container = upsetContainerRef.current
        const wrapper = upsetWrapperRef.current
        const scrollPanel = upsetScrollRef.current
        const natural = upsetNaturalSizeRef.current
        if (!container || !wrapper || !scrollPanel || !natural) return

        const containerWidth = container.clientWidth
        const containerHeight = container.clientHeight 

        const overflowing = natural.totalWidth > containerWidth
        setUpsetOverflowing(overflowing)

        wrapper.style.transformOrigin = '0 0'

        if (upsetZoomedOut) {
            const scale = Math.min(
                containerWidth / natural.totalWidth,
                containerHeight / natural.height,
                1
            )
            const scaledWidth = natural.totalWidth * scale
            const scaledHeight = natural.height * scale 
            const translateX = Math.max((containerWidth - scaledWidth) / 2, 0)
            const translateY = Math.max((containerHeight - scaledHeight) / 2, 0)

            wrapper.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`
            scrollPanel.style.overflowX = 'hidden'
            scrollPanel.style.width = `${natural.rightWidth}px`
            scrollPanel.scrollLeft = 0
        } else {
            wrapper.style.transform = 'translate(0px, 0px) scale(1)'
            const availableRightWidth = Math.max(containerWidth - natural.leftWidth, 0)
            scrollPanel.style.overflowX = overflowing ? 'scroll' : 'hidden'
            scrollPanel.style.width = `${availableRightWidth}px`
        }

        updateUpsetScrollHints()
    }
    function updateUpsetScrollHints() {
        const scrollPanel = upsetScrollRef.current
        if (!scrollPanel || upsetZoomedOut) {
            setShowLeftHint(false)
            setShowRightHint(false)
            return
        }
        const { scrollLeft, scrollWidth, clientWidth } = scrollPanel
        setShowLeftHint(scrollLeft > 2)
        setShowRightHint(scrollLeft + clientWidth < scrollWidth - 2)
    }
    function drawTimePlot(data, scaleX, scaleY) {
        const svg = d3.select('#graph')
        const height = scaleY.range()[0]
        const [minYear, maxYear] = scaleX.domain()

        // the stacked-area layers aren't used in this mode
        d3.select('#graph-stack').selectAll('*').remove()
        d3.select('#graph-line').selectAll('*').remove()

        // layer for the time plot (created once)
        let layer = svg.select('#graph-plot')
        if (layer.empty()) layer = svg.append('g').attr('id', 'graph-plot')

        // tagged_concept_id like '312950S' -> 312950, same parsing used in drawUpset
        const points = data
            .filter(d => d.calendar_year >= minYear && d.calendar_year <= maxYear && d.observed_persons_counts > 0)
            .map(d => {
                const id = parseInt(String(d.tagged_concept_id).replace(/\D/g, ''))
                return {
                    key: `${d.tagged_concept_id}-${d.calendar_year}`,
                    id,
                    year: d.calendar_year,
                    value: d.person_counts / d.observed_persons_counts,
                    person_counts: d.person_counts,
                    observed: d.observed_persons_counts
                }
            })
        const years = [...new Set(points.map(p => p.year))]

        // one vertical line per year, from the baseline up to that year's highest dot
        // one vertical line per year, from that year's lowest dot to its highest dot
        const yearRange = Array.from(
            d3.rollup(
                points,
                v => ({ min: d3.min(v, p => p.value), max: d3.max(v, p => p.value) }),
                p => p.year
            ),
            ([year, r]) => ({ year, min: r.min, max: r.max })
        )

        const lineLayer = layer.selectAll('g.plot-lines').data([null]).join('g').attr('class', 'plot-lines')
        lineLayer.selectAll('line.year-line')
            .data(yearRange, d => d.year)
            .join(
                enter => enter.append('line')
                    .classed('year-line', true)
                    .attr('stroke', '#c9c9d5')
                    .attr('stroke-width', 1)
                    .attr('x1', d => scaleX(d.year))
                    .attr('x2', d => scaleX(d.year))
                    .attr('y1', height)
                    .attr('y2', height)
                    .call(sel => sel.transition().duration(500).ease(d3.easeCubicOut)
                        .attr('y1', d => scaleY(d.max))
                        .attr('y2', d => scaleY(d.min))),
                update => update
                    .call(sel => sel.transition().duration(500)
                        .attr('x1', d => scaleX(d.year))
                        .attr('x2', d => scaleX(d.year))
                        .attr('y1', d => scaleY(d.max))
                        .attr('y2', d => scaleY(d.min))),
                exit => exit.remove()
            )

        // connector line for one concept, drawn beneath the dots
        const connector = d3.line()
            .x(p => scaleX(p.year))
            .y(p => scaleY(p.value))

        function showConnector(id, activePoint) {
            const pts = points
                .filter(p => p.id === id)
                .sort((a, b) => a.year - b.year);

            // Connecting line (unchanged)
            layer.selectAll('path.plot-connector')
                .data(pts.length > 1 ? [pts] : [])
                .join(enter => enter.insert('path', 'g.plot-dots')
                    .attr('class', 'plot-connector')
                    .attr('fill', 'none')
                    .attr('stroke-width', 1.5)
                    .style('pointer-events', 'none'))
                .attr('stroke', colorList[id])
                .attr('opacity', 0.8)
                .attr('d', connector);

            // Value label only for the hovered point
            const labelPts = activePoint ? [activePoint] : [];

            const labels = layer.selectAll('g.plot-value-labels')
                .data([labelPts])
                .join('g')
                .attr('class', 'plot-value-labels num')
                .style('pointer-events', 'none');

            labels.selectAll('text')
                .data(labelPts, d => d.key)
                .join('text')
                .attr('x', d => scaleX(d.year))
                .attr('y', d => scaleY(d.value) - 9)
                .attr('text-anchor', 'middle')
                .attr('fill', '#565867')
                .text(d => d.value.toFixed(6));
        }

        function hideConnector() {
            layer.selectAll('path.plot-connector').remove();
            layer.selectAll('g.plot-value-labels').remove();
        }

        const hitLayer = layer.selectAll('g.plot-hit').data([null]).join('g').attr('class', 'plot-hit')
        const dotLayer = layer.selectAll('g.plot-dots').data([null]).join('g').attr('class', 'plot-dots')

        // visible dots: purely visual, no mouse events
        dotLayer.selectAll('circle.plot-dot')
            .data(points, d => d.key)
            .join(
                enter => enter.append('circle')
                    .classed('plot-dot', true)
                    .attr('r', 4)
                    .attr('cx', d => scaleX(d.year))
                    .attr('cy', height)
                    .attr('stroke', 'white')
                    .attr('stroke-width', 1)
                    .style('pointer-events', 'none')
                    .attr('fill', d => hovered.length > 0 && !hovered.includes(d.id) ? d3.interpolateRgb(colorList[d.id], '#fff')(0.8) : colorList[d.id])
                    .call(sel => sel.transition().duration(500).ease(d3.easeCubicOut)
                        .attr('cy', d => scaleY(d.value))),
                update => update
                    .call(sel => sel.transition().duration(500)
                        .attr('cx', d => scaleX(d.year))
                        .attr('cy', d => scaleY(d.value)))
                    .call(sel => sel.transition('fill').duration(200)
                        .attr('fill', d => hovered.length > 0 && !hovered.includes(d.id) ? d3.interpolateRgb(colorList[d.id], '#fff')(0.8) : colorList[d.id]),
                exit => exit.remove()
            ))

        // hit circles: larger, transparent, and they carry the mouse events
        hitLayer.selectAll('circle.plot-hit-dot')
            .data(points, d => d.key)
            .join(
                enter => enter.append('circle')
                    .classed('plot-hit-dot btn', true)
                    .attr('r', 10)
                    .attr('cx', d => scaleX(d.year))
                    .attr('cy', height)
                    .attr('fill', 'transparent')
                    .style('pointer-events', 'all')
                    .call(sel => sel.transition().duration(500).ease(d3.easeCubicOut)
                        .attr('cy', d => scaleY(d.value))),
                update => update
                    .call(sel => sel.transition().duration(500)
                        .attr('cx', d => scaleX(d.year))
                        .attr('cy', d => scaleY(d.value))),
                exit => exit.remove()
            )
            .on('mouseover', (e, d) => {
                const node = allNodesMap.get(d.id);
                const el = e.currentTarget;

                clearTimeout(el.hoverStateTimeout);

                el.hoverStateTimeout = setTimeout(() => {
                    hoveredPointKey.current = d.key;
                    setHovered([d.id]);
                    showConnector(d.id, d);

                    if (node) {
                        showTooltipPreview(node, e);
                    }
                }, 600);
            })
            .on('mouseout', (e, d) => {
                clearTimeout(e.currentTarget.hoverStateTimeout);

                hoveredPointKey.current = null;
                setHovered([]);
                hideConnector();

                scheduleHide();
            })

        if (hovered.length === 1) {
            const active = points.find(p => p.key === hoveredPointKey.current && p.id === hovered[0])
            showConnector(hovered[0], active)
        }
        else hideConnector()
    }
    function drawGraph(rollup, scaleX, scaleY) {
        d3.select('#graph-plot').remove()
        const selectedConceptMap = new Map(selectedConcepts.map(c => [c.name, c]))
        function highestPoint(d) {
            return d[1].reduce((best, p) => {
                return scaleY(+p[2]) < scaleY(+best[2]) ? p : best
            })
        }
        // draw stacked area
        function updateStack(stackedData) {
            d3.select("#graph-stack").selectAll('.areas').interrupt()
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
                    .attr('fill', d => {
                        if (getConceptInfo(d.key)) {
                            if (!getConceptInfo(d.key).standard_concept || (relationship === 'mappings' && selectedConceptMap.get(d.key).leaf)) {
                                const url = createLinePattern(d.key, colorList[d.key])
                                return url 
                            } else return colorList[d.key]    
                        } else return colorList[d.key] 
                    })
                    .style("transition", "0.5s all")
                    .transition()
                    .duration(500)
                    .ease(d3.easeCubicOut)
                    .attr("d", d3.area()
                        .x((d,i) => scaleX(d.data.year))
                        .y0(d => scaleY(d[0]))
                        .y1(d => scaleY(d[1]))
                    )
                    .attr('opacity', d => hovered.length > 0 && !hovered.includes(d.key) ? 0.2 : 1)
                geometry.append("path")
                    .classed("area-path-background", true)
                    .attr("cursor", "pointer")
                    .attr("id", d => "area-background-" + d.key)
                    .on("mouseover", function (e,d) {
                        const node = allNodesMap.get(d.key)
                        const el = e.currentTarget
                        el.hoverStateTimeout = setTimeout(() => {
                            setHovered([d.key])
                            tooltipHover(node,'enter',e)
                        }, 600)
                    })
                    .on("mouseout", function (e,d) {
                        const node = allNodesMap.get(d.key)
                        const el = e.currentTarget
                        clearTimeout(el.hoverStateTimeout)
                        setHovered([])
                        tooltipHover(node, "leave", e)    
                    })
                    .style("fill", "transparent")
                    .style("transition", "0.5s all")
                    .transition()
                    .duration(500)
                    .ease(d3.easeCubicOut)
                    .attr("d", d3.area()
                        .x((d,i) => scaleX(d.data.year))
                        .y0(d => scaleY(d[0]))
                        .y1(d => scaleY(d[1]))
                    )
            },update => {
                update.select('.area-path')
                    .attr("d", d3.area()
                        .x((d,i) => scaleX(d.data.year))
                        .y0(d => scaleY(0))
                        .y1(d => scaleY(0))
                    )
                    .transition()
                    .attr('opacity', d => hovered.length > 0 && !hovered.includes(d.key) ? 0.2 : 1)
                    .attr("d", d3.area()
                        .x((d,i) => scaleX(d.data.year))
                        .y0(d => scaleY(d[0]))
                        .y1(d => scaleY(d[1]))
                    )
                    .attr('fill', d => {
                        if (getConceptInfo(d.key)) {
                            if (!getConceptInfo(d.key).standard_concept || (relationship === 'mappings' && selectedConceptMap.get(d.key).leaf)) {
                                const url = createLinePattern(d.key, colorList[d.key])
                                return url 
                            } else return colorList[d.key]    
                        } else return colorList[d.key] 
                    })
                update.select('.area-path-background')
                    .on("mouseover", function (e,d) {
                        const node = allNodesMap.get(d.key)
                        const el = e.currentTarget
                        el.hoverStateTimeout = setTimeout(() => {
                            setHovered([d.key])
                            tooltipHover(node,'enter',e)
                        }, 600)
                    })
                    .on("mouseout", function (e,d) {
                        const node = allNodesMap.get(d.key)
                        const el = e.currentTarget
                        clearTimeout(el.hoverStateTimeout)
                        setHovered([])
                        tooltipHover(node, "leave", e)    
                    })
                    .attr("d", d3.area()
                        .x((d,i) => scaleX(d.data.year))
                        .y0(d => scaleY(0))
                        .y1(d => scaleY(0))
                    )
                    .transition()
                    .attr("d", d3.area()
                        .x((d,i) => scaleX(d.data.year))
                        .y0(d => scaleY(d[0]))
                        .y1(d => scaleY(d[1]))
                    )
            },exit => exit.remove())
        }
        // draw root descendant count line
        function updateRootLine() {
            const line = d3.line()
                .x(d => scaleX(d[0]))
                .y(d => scaleY(d[1]))
            const container = d3.select("#graph-line")
                .selectAll(".lines")
                .data([rootLine])
            const containerEnter = container.enter()
                .append("g")
                .classed("lines", true)
                .attr("clip-path", "url(#clip)")
                .raise()
            containerEnter.append("path")
                .classed("line-path", true)
                .attr("cursor", "pointer")
                .attr("stroke-width", 3)
                .style("stroke", "black")
                .style("fill", "none")
            containerEnter.append("path")
                .classed("line-path-background", true)
                .attr("cursor", "pointer")
                .attr("stroke-width", 8)
                .style("stroke", "transparent")
                .style("fill", "none")
            container.merge(containerEnter)
                .select(".line-path")
                .transition()
                .attr("d", line)
            container.merge(containerEnter)
                .select(".line-path-background")
                .transition()
                .attr("d", line)
            container.exit().remove()
        }
        // const stackedData = d3.stack()
        //     .keys(selectedConcepts.map(c => c.name))
        //     (rollup)  
        const stackedData = d3.stack()
            .keys(selectedConcepts.map(c => c.name))
            .value((d, key) => d[key] ?? 0)
            (rollup)
        updateStack(stackedData)  
        if (showRootLine) updateRootLine()
        else d3.select('#graph-line').selectAll('.lines').remove()
        d3.select("#graph-viz").raise()
    }
    function drawHistogram(data, scaleX, scaleY, concepts) {
        const graph = d3.select("#histogram .chart-content");

        graph.selectAll(".histogram-bars, .histogram-hover-labels").remove();

        const buckets = scaleX.domain();
        const bucketTotals = new Map();

        const groupedData = buckets.map(bucket => {
            const row = { bucket };

            concepts.forEach(concept => {
                row[concept] = d3.sum(
                    data.filter(d =>
                        d.measured_value_bucket === bucket &&
                        d.tagged_conceptid === concept
                    ),
                    d => +d.n_events
                );
            });

            bucketTotals.set(bucket, row);
            return row;
        });

        const stackedData = d3.stack()
            .keys(concepts)(groupedData);

        const bars = graph.append("g")
            .attr("class", "histogram-bars");

        let activeBucket = null;

        // All stacked segments, including their exact values.
        const segments = stackedData.flatMap(series =>
            series.map(d => ({
                bucket: d.data.bucket,
                concept: series.key,
                id: parseInt(series.key.replace(/\D/g, "")),
                value: d.data[series.key],
                y0: d[0],
                y1: d[1]
            }))
        );

        const rects = bars.selectAll("rect.histogram-segment")
            .data(segments, d => `${d.bucket}-${d.concept}`)
            .join("rect")
            .attr("class", "histogram-segment btn")
            .attr("data-bucket", d => d.bucket)
            .attr("x", d => scaleX(d.bucket))
            .attr("y", d => scaleY(d.y1))
            .attr("width", scaleX.bandwidth())
            .attr("height", d =>
                Math.max(0, scaleY(d.y0) - scaleY(d.y1))
            )
            .attr("fill", d => colorList[d.id])
            .attr("stroke", "none")
            .attr("opacity", d =>
                hovered.length > 0 && !hovered.includes(d.id) ? 0.2 : 1
            );

        function updateHighlight() {
            rects
                .attr("opacity", d => {
                    if (activeBucket !== null) {
                        return d.bucket === activeBucket ? 1 : 0.2;
                    }

                    return hovered.length > 0 && !hovered.includes(d.id)
                        ? 0.2
                        : 1;
                })
                .attr("stroke", d =>
                    activeBucket !== null && d.bucket === activeBucket
                        ? "white"
                        : "none"
                )
                .attr("stroke-width", 0.75);
        }

        // Draw exact-value labels, separated with a force simulation.
        function showBucketLabels(bucket) {
            graph.selectAll(".histogram-hover-labels").remove();

            const bucketSegments = segments.filter(d => d.bucket === bucket);

            if (!bucketSegments.length) return;

            const labelWidth = 60; // Approximate maximum label width
            const gap = 5;

            const barX = scaleX(bucket);
            const barWidth = scaleX.bandwidth();
            const plotWidth = +graph.node().getBoundingClientRect().width;

            // If there's insufficient room on the right, put labels on the left
            const placeLeft = barX + barWidth + gap + labelWidth > plotWidth;

            const labels = bucketSegments.map(d => ({
                ...d,
                targetY: (scaleY(d.y0) + scaleY(d.y1)) / 2,
                x: placeLeft
                    ? barX - gap
                    : barX + barWidth + gap,
                y: (scaleY(d.y0) + scaleY(d.y1)) / 2,
                placeLeft
            }));

            const labelLayer = graph.append("g")
                .attr("class", "histogram-hover-labels num")
                .style("pointer-events", "none");

            const labelGroups = labelLayer.selectAll("g.value-label")
                .data(labels)
                .join("g")
                .attr("class", "value-label");

            // Connector from each segment's center to its label.
            labelGroups.append("line")
                .attr("stroke", d => colorList[d.id])
                .attr("stroke-width", 1)
                .attr("opacity", 0.9);

            labelGroups.append("text")
                .text(d => d.value)
                .attr("font-size", 11)
                .attr("dominant-baseline", "middle")
                .attr("fill", "currentColor")
                .attr("stroke", "none");

            // Use the actual rendered text width to place labels beyond the bar.
            labelGroups.each(function(d) {
                d.labelWidth = this.querySelector("text").getComputedTextLength();
            });

            const yRange = scaleY.range();
            const labelHeight = 13;
            const halfLabel = labelHeight / 2;

            // Keep labels within the plot's vertical range.
            const minY = Math.min(...yRange) + halfLabel;
            const maxY = Math.max(...yRange) - halfLabel;

            labels.forEach(d => {
                d.targetY = Math.max(minY, Math.min(maxY, d.targetY));
                d.y = d.targetY;
            });

            const simulation = d3.forceSimulation(labels)
                .force("y", d3.forceY(d => d.targetY).strength(0.9))
                .force("x", d3.forceX(d => d.x).strength(0.8))
                .force("collide", d3.forceCollide(labelHeight))
                .stop();

            // Run synchronously so labels are separated before being drawn.
            for (let i = 0; i < 120; i++) simulation.tick();

            labels.forEach(d => {
                d.y = Math.max(minY, Math.min(maxY, d.y));
            });

            labelGroups
                .attr("transform", d => `translate(${d.x},${d.y})`);

            labelGroups.select("line")
                .attr("x1", d => scaleX(bucket) - d.x + scaleX.bandwidth())
                .attr("y1", d => d.targetY - d.y)
                .attr("x2", -3)
                .attr("y2", 0);

            labelGroups.select("text")
                .attr("x", d => d.placeLeft ? 0 : 0)
                .attr("y", 0)
                .attr("text-anchor", d => d.placeLeft ? "end" : "start");
        }

        rects
            .on("mouseover", (e, d) => {
                activeBucket = d.bucket;
                updateHighlight();
                showBucketLabels(d.bucket);

                // Preserve your existing concept-hover behavior.
                const node = allNodesMap.get(d.id);
                const el = e.currentTarget;

                clearTimeout(el.hoverStateTimeout);

                el.hoverStateTimeout = setTimeout(() => {
                    setHovered([d.id]);

                    if (node) {
                        showTooltipPreview(node, e);
                    }
                }, 600);
            })
            .on("mouseout", (e, d) => {
                clearTimeout(e.currentTarget.hoverStateTimeout);

                // Don't clear the bucket when moving between segments
                // that belong to the same bucket.
                const related = e.relatedTarget;
                const nextRect = related?.closest?.("rect.histogram-segment");

                if (nextRect && nextRect.dataset.bucket === String(d.bucket)) {
                    return;
                }

                activeBucket = null;
                graph.selectAll(".histogram-hover-labels").remove();
                updateHighlight();

                setHovered([]);
                scheduleHide();
            });

        updateHighlight();
    }
    function drawHistogramRuler(scaleX, innerWidth, innerHeight) {
        const chart = d3.select("#histogram .chart-content")
        const buckets = scaleX.domain()
        const step = scaleX.step()
        const bw = scaleX.bandwidth()
        const firstCenter = scaleX(buckets[0]) + bw / 2

        const ruler = chart.selectAll(".hist-ruler")
            .data([null])
            .join("g")
            .attr("class", "hist-ruler")
            .style("display", "none")
            .style("pointer-events", "none")

        ruler.selectAll(".hist-ruler-band")
            .data([null])
            .join("rect")
            .attr("class", "hist-ruler-band")
            .attr("y", 0)
            .attr("height", innerHeight)
            .attr("width", bw)
            .attr("fill", "none")
            .attr("opacity", 0.15)

        ruler.selectAll(".hist-ruler-line")
            .data([null])
            .join("line")
            .attr("class", "hist-ruler-line")
            .attr("y1", 0)
            .attr("y2", innerHeight)
            .attr("stroke", "#a0a0b6")
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "3,3")

        ruler.selectAll(".hist-ruler-label")
            .data([null])
            .join("text")
            .attr("class", "hist-ruler-label")
            .attr("y", -8)
            .attr("text-anchor", "middle")
            .attr("font-size", "11px")
            .attr("fill", "#565867")

        const hide = () => ruler.style("display", "none")

        chart
            .on("mousemove.ruler", function (e) {
                const [x, y] = d3.pointer(e, this)
                if (x < 0 || x > innerWidth || y < 0 || y > innerHeight) return hide()

                const i = Math.max(0, Math.min(buckets.length - 1, Math.round((x - firstCenter) / step)))
                const cx = scaleX(buckets[i]) + bw / 2

                ruler.style("display", null)
                ruler.select(".hist-ruler-band").attr("x", cx - bw / 2)
                ruler.select(".hist-ruler-line").attr("x1", cx).attr("x2", cx)

                const label = ruler.select(".hist-ruler-label").text(buckets[i])
                const labelWidth = label.node().getComputedTextLength()
                const labelX = Math.max(labelWidth / 2, Math.min(innerWidth - labelWidth / 2, cx))
                label.attr("x", labelX)
            })
            .on("mouseleave.ruler", hide)

        ruler.raise()
    }
    // show upset tooltip
    function showUpsetTooltip(mode,event=null,value=null,name=null) {
        if (mode === 'enter') {
            d3.select('#upset-value').html(value)
            d3.select('#upset-name').html(name)
            d3.select("#upset-tooltip")
                .style('left', function() {
                    const gap = 5
                    const w = document.getElementById('upset-tooltip').clientWidth
                    if (event.x + w > window.innerWidth) return (event.x - w - gap + 'px')
                    else return (event.x + gap + 'px')    
                })
                .style('top', function() {
                    const gap = 5
                    const h = document.getElementById('upset-tooltip').clientHeight
                    if (event.y + h > window.innerHeight) return (event.y - h - gap + 'px')  
                    else return (event.y + gap + 'px')
                })
                .transition().style('opacity',1)
        } else {
            d3.select("#upset-tooltip").transition().style('opacity',0)     
        }
    }
    // show annotation tooltip
    function showAnnotationTooltip(mode,event=null,value=null,name=null) {
        if (mode === 'enter') {
            const html = 'Start of ' + name.map(e => e.key).join("<br/>")
            d3.select('#annotation-value').html(value)
            d3.select('#annotation-name').html(html)
            d3.select("#annotation-tooltip")
                .style('left', function() {
                    const gap = 5
                    const w = document.getElementById('annotation-tooltip').clientWidth
                    if (event.x + w > window.innerWidth) return (event.x - w - gap + 'px')
                    else return (event.x + gap + 'px')    
                })
                .style('top', function() {
                    const gap = 5
                    const h = document.getElementById('annotation-tooltip').clientHeight
                    if (event.y + h > window.innerHeight) return (event.y - h - gap + 'px')  
                    else return (event.y + gap + 'px')
                })
                .transition().style('opacity',1)
        } else {
            d3.select("#annotation-tooltip").transition().style('opacity',0)     
        }
    }
    // draw annotations
    function drawAnnotations(scaleX,height) {
        const filteredAnnotations = annotations.filter(a => a.year >= extent[0] && a.year <= extent[1])
        const grouped = d3.group(filteredAnnotations, d => d.year)
        const spreadAnnotations = []
        grouped.forEach((values, year) => {
            const count = values.length;
            const spacing = 5
            values.forEach((d, i) => {
                const offsetIndex = i - (count - 1) / 2
                spreadAnnotations.push({
                ...d,
                offsetX: offsetIndex * spacing
                })
            })
        })
        const annotation = d3.select('#graph')
            .selectAll(".annotation")
            .data(spreadAnnotations, d => d.year)
        const annotationEnter = annotation.enter()
            .append("g")
            .attr("class", "annotation")
        annotationEnter.append("line")
        annotationEnter.append("circle")
        const annotationMerge = annotationEnter.merge(annotation)
        annotationMerge.select("line")
            .attr('x1', d => scaleX(d.year))
            .attr('x2', d => scaleX(d.year))
            .attr('y1', 0)
            .attr('y2', height - 5)
            .attr('stroke','#a0a0b6')
            .attr('stroke-width',1)
            .attr("stroke-dasharray", "3,3")
        annotationMerge.select("circle")
            .classed('btn',true)
            .attr("cx", d => scaleX(d.year) + d.offsetX)
            .attr("cy", height)
            .attr("r", 5)
            .attr("fill", 'white')
            .style("filter", "drop-shadow(0px 0px 4px rgba(0, 0, 0, 0.16))")
            .on("mouseover", function(event, d) {
                const eventsThatYear = grouped.get(d.year)
                showAnnotationTooltip('enter',event,d.year,eventsThatYear)
            })
            .on("mouseout", function() {showAnnotationTooltip('leave')})
        annotation.exit().remove()
    }
    // FUNCTIONS
    const resetZoom = (e) => {
        if (e) {
            e.preventDefault()
            e.stopPropagation()    
        }
        if (d3.select("#zoomUI").nodes().length === 0) {
            let extent = d3.extent(selectedConcepts.map(d => d.data.code_counts).flat().map(d => d.calendar_year))
            if (!extent[0] || !extent[1]) extent = d3.extent(rootLine, d => d[0])
            setExtent(extent)
            setYearSelection(null)
            d3.select("#zoomUI").remove()
            zooming = false
            setZoomed(false)
        }
    }
    function updateRuler(x, scaleX, extent, height) {
        const year = Math.round(scaleX.invert(x))
        const clampedYear = Math.max(extent[0], Math.min(extent[1], year))
        const snappedX = scaleX(clampedYear)

        const rulerSel = d3.select("#graph").select(".hover-ruler")
        rulerSel.style("display", null)
            .attr("transform", `translate(${snappedX},0)`)
        rulerSel.select(".ruler-label").text(clampedYear)
    }
    function hideRuler() {
        d3.select("#graph").select(".hover-ruler").style("display", "none")
    }
    const parseBucket = b => {
        const toks = String(b).match(/[-+]?(?:inf(?:inity)?|\d+(?:\.\d+)?(?:e[+-]?\d+)?)/gi) || []
        const nums = toks.map(t => /inf/i.test(t) ? (t.startsWith('-') ? -Infinity : Infinity) : Number(t))
        return nums.length >= 2 ? { lo: nums[0], hi: nums[1] } : { lo: NaN, hi: NaN }
    }
    function drawAxes(scaleX, scaleY, width, height, ticks, xAxisType = "year") {
        const graph = xAxisType === 'year' ? d3.select("#graph") : d3.select("#histogram .chart-content")

        const yAxisGrid = d3.axisLeft(scaleY)
            .tickSize(-width)
            .tickFormat("")
            .ticks(5)
            .tickSizeOuter(0);

        graph.select(".axis-grid").call(yAxisGrid);

        let xAxis;

        if (xAxisType === "year") {
            xAxis = d3.axisBottom(scaleX)
                .tickSize(5)
                .ticks(ticks.two)
                .tickFormat(d3.format("d"))
                .tickSizeOuter(0)
                .tickPadding(8);
        } else {
            const bw = scaleX.bandwidth()
            const raw = scaleX.domain().map(b => ({ ...parseBucket(b), x: scaleX(b) }))

            const w = d3.median(raw.filter(p => Number.isFinite(p.lo) && Number.isFinite(p.hi)), p => p.hi - p.lo)

            const parsed = raw
                .map(p => ({
                    ...p,
                    lo: Number.isFinite(p.lo) ? p.lo : p.hi - w,   // open lower bucket
                    hi: Number.isFinite(p.hi) ? p.hi : p.lo + w    // open upper bucket
                }))
                .filter(p => Number.isFinite(p.lo) && Number.isFinite(p.hi))
                .sort((a, b) => a.lo - b.lo)

            const bounds = raw.flatMap(p => [p.lo, p.hi]).filter(Number.isFinite)
            const tMin = d3.min(bounds)
            const tMax = d3.max(bounds)

            if (parsed.length < 2 || !Number.isFinite(w)) {
                xAxis = d3.axisBottom(scaleX).tickSize(5).tickSizeOuter(0).tickPadding(8)
            } else {
                const first = parsed[0]
                const last = parsed[parsed.length - 1]

                const points = [
                    [first.lo, first.x],
                    ...parsed.map(p => [(p.lo + p.hi) / 2, p.x + bw / 2]),
                    [last.hi, last.x + bw]
                ]
                const valueScale = d3.scaleLinear()
                    .domain(points.map(p => p[0]))
                    .range(points.map(p => p[1]))

                xAxis = d3.axisBottom(valueScale)
                    .tickValues(d3.ticks(tMin, tMax, 10))
                    .tickFormat(d3.format("~g"))
                    .tickSize(5)
                    .tickSizeOuter(0)
                    .tickPadding(8)
            }
        }

        graph.select(".x")
            .attr("transform", `translate(0,${height})`)
            .call(xAxis);

        graph.select(".y")
            .call(d3.axisLeft(scaleY).ticks(5).tickSizeOuter(0));
    }
    function drawAxisLabels(innerWidth, innerHeight, chartMargin, xLabel, yLabel, xAxisType = 'year') {
        const chart = xAxisType === 'year' ? d3.select("#graph") : d3.select("#histogram .chart-content")

        chart.selectAll(".x-axis-label")
            .data([xLabel])
            .join("text")
            .attr("class", "x-axis-label selectedText")
            .attr("x", innerWidth / 2)
            .attr("y", xAxisType === 'year' ? innerHeight + chartMargin.bottom - 15 : innerHeight + chartMargin.bottom - 25)
            .attr("text-anchor", "middle")
            .attr("fill", "currentColor")
            .style("font-size", "10px")
            .text(d => d)

        chart.selectAll(".y-axis-label")
            .data([yLabel])
            .join("text")
            .attr("class", "y-axis-label selectedText")
            .attr("transform", "rotate(-90)")
            .attr("x", -innerHeight / 2)
            .attr("y", xAxisType === 'year' ? -chartMargin.left - 5 : -chartMargin.left + 20)
            .attr("text-anchor", "middle")
            .attr("fill", "currentColor")
            .style("font-size", "10px")
            .text(d => d)
    }
    // get graph 
    function getGraph(rollup, width, height, ticks, type) {
        let maxY
        if (type === 'graph') {
            // x and y scales
            let maxRollup = d3.max(rollup, obj => Object.entries(obj).reduce((sum, [key, val]) => key !== 'year' ? sum + val : sum, 0))
            let maxRootLine = d3.max(rootLine, d => d[1])
            maxY = rollup.length > 0 ? showRootLine ? maxRollup > maxRootLine ? maxRollup : maxRootLine : maxRollup : maxRootLine
        } 
        if (type === 'plot') {
            const values = rollup.map(d => d.person_counts / d.observed_persons_counts)
            maxY = d3.max(values)
        }
        let scaleX = d3.scaleLinear().domain(extent).range([0, width])
        let scaleY = d3.scaleLinear().domain([0, maxY*1.05]).range([height, 0])
        drawAxes(scaleX, scaleY, width, height, ticks)
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
        let rulerFrameId = null
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
                    if (x1 < x2) {setYearSelection([Math.round(scaleX.invert(x1)), Math.round(scaleX.invert(x2))])}
                    else {setYearSelection([Math.round(scaleX.invert(x2)), Math.round(scaleX.invert(x1))])} 
                    setZoomed(true)   
                }
                d3.select("#zoomUI").remove()
                zooming = false
            })
            .on("mousemove.zoom", handleMouseMove)
            .on("mousemove.ruler", (e) => {
                if (zooming) { hideRuler(); return }
                if (rulerFrameId) cancelAnimationFrame(rulerFrameId)
                rulerFrameId = requestAnimationFrame(() => {
                    const [x] = d3.pointer(e, d3.select('#graph').node())
                    updateRuler(x, scaleX, extent, height)
                })
            })
            .on("mouseleave.ruler", hideRuler)
            .on("dblclick", resetZoom)
        drawAnnotations(scaleX,height)
        if (type === 'graph') drawGraph(rollup, scaleX, scaleY)
        if (type === 'plot') drawTimePlot(rollup, scaleX, scaleY)

        const ruler = d3.select("#graph").selectAll(".hover-ruler").data([null])
        const rulerEnter = ruler.join("g")
            .attr("class", "hover-ruler")
            .style("display", "none")
            .style("pointer-events", "none")

        rulerEnter.selectAll(".ruler-line").data([null]).join("line")
            .attr("class", "ruler-line")
            .attr("y1", 0)
            .attr("y2", height)
            .attr("stroke", "#a0a0b6")
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "3,3")

        rulerEnter.selectAll(".ruler-label").data([null]).join("text")
            .attr("class", "ruler-label")
            .attr("y", -8)
            .attr("text-anchor", "middle")
            .attr("font-size", "11px")
            .attr("fill", "#565867")

        d3.select("#graph").select(".hover-ruler").raise()
    }
    // hover filter
    function filterHover(id,mode,type) {
        if (mode === 'enter') {
            if (type === 'age' || type === 'gender') {
                if (d3.select('#geometry-' + id).classed('vizActive')) {
                    d3.select('#geometry-' + id).classed('vizHoverInactive',true)
                    d3.select('#geometry-' + id).classed('vizHoverActive',false)
                    d3.select('#btn-' + id).classed('filterHoverInactive',true)
                    d3.select('#btn-' + id).classed('filterHoverActive',false)
                }  else {
                    d3.select('#geometry-' + id).classed('vizHoverInactive',false)
                    d3.select('#geometry-' + id).classed('vizHoverActive',true)   
                    d3.select('#btn-' + id).classed('filterHoverInactive',false)
                    d3.select('#btn-' + id).classed('filterHoverActive',true) 
                }
            } else {
                if (d3.select('#geometry-' + id).classed('vizActive')) {
                    d3.select('#geometry-' + id).classed('vizHoverInactive',true)
                    d3.select('#geometry-' + id).classed('vizHoverActive',false)
                } else {
                    d3.select('#geometry-' + id).classed('vizHoverInactive',false)
                    d3.select('#geometry-' + id).classed('vizHoverActive',true)   
                } 
            }
        } else {
            if (type === 'age' || type === 'gender') {
                d3.select('#geometry-' + id).classed('vizHoverInactive',false)
                d3.select('#geometry-' + id).classed('vizHoverActive',false)
                d3.select('#btn-' + id).classed('filterHoverInactive',false)
                d3.select('#btn-' + id).classed('filterHoverActive',false)
            } else {
                d3.select('#geometry-' + id).classed('vizHoverInactive',false)
                d3.select('#geometry-' + id).classed('vizHoverActive',false)    
            }
        }
    }
    // select filter
    function filterSelect(id,type) {
        let all = []
        let filtered = []
        let curr = graphFilter[type]
        if (type === 'age') all = filterData.age.map(d => d.id)
        if (type === 'source') all = filterData.source.map(obj => obj.codes).flat().filter(s => s.sum > 0).map(s => s.id)
        if (type === 'gender') all = filterData.gender.map(d => d.id)
        if (curr.includes(-1)) filtered = all.filter(d => d !== id)  
        else {
            if (!curr.includes(id)) {
                filtered = [...curr,id]
                if (filtered.length === all.length) filtered = [-1]
            } else filtered = curr.filter(d => d !== id)
        }
        if (filtered.length === 0) return 
        else {
            if (type === 'age') setGraphFilter(prev => ({...prev,age: filtered}))
            if (type === 'source') setGraphFilter(prev => ({...prev,source: filtered}))
            if (type === 'gender') setGraphFilter(prev => ({...prev,gender: filtered}))    
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
            ages = graphFilter.age.includes(-1) ? filterData.age.map(d => d.id) : ages
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
                    if (!ages.includes(i)) {
                        ages = [...ages,i]
                        if (ages.length === filterData.age.length) ages = [-1]
                    }
                    else ages = ages.filter(age => age !== i)
                }
                setGraphFilter(prev => ({...prev,age: ages}))
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
                    if (!graphFilter.age.includes(i) && !graphFilter.age.includes(-1)) {
                        d3.select('#btn-'+i)
                            .classed('filterHoverInactive',false)
                            .classed('filterHoverActive',false)
                            .classed('filterActiveDrag', true)
                            .classed('filterActiveRight', true)
                            .classed('filterInactiveDrag', false)
                            .classed('filterInactiveRight', false)
                        d3.select('#geometry-' + i)
                            .classed('vizHoverInactive',false)
                            .classed('vizHoverActive',false) 
                            .classed('vizActive',true) 
                            .classed('vizInactive',false)
                        // d3.select('#viz-label-'+i).classed('labelActive',true) 
                    } else {
                        d3.select('#btn-'+i)
                            .classed('filterHoverInactive',false)
                            .classed('filterHoverActive',false)
                            .classed('filterActiveDrag',false)
                            .classed('filterActiveRight', false)
                            .classed('filterInactiveDrag', true)
                            .classed('filterInactiveRight', true)
                        d3.select('#geometry-' + i)
                            .classed('vizHoverInactive',false)
                            .classed('vizHoverActive',false)    
                            .classed('vizActive',false)
                            .classed('vizInactive',true)
                        // d3.select('#viz-label-'+i).classed('labelActive',false) 
                    }
                }
            }
        }
    }
    // filter tooltip
    function filterTooltip(d,mode,event) {
        if (mode === 'enter') {
            d3.select('#filter-name').html(d.code)
            d3.select('#filter-value').html(abbreviateNumber(d.sum))
            d3.select('#filter-tooltip')
                .style('left', function() {
                    const gap = 5
                    const w = document.getElementById('filter-tooltip').clientWidth
                    if (event.x + w > window.innerWidth) return (event.x - w - gap + 'px')
                    else return (event.x + gap + 'px')    
                })
                .style('top', function() {
                    const gap = 5
                    const h = document.getElementById('filter-tooltip').clientHeight
                    if (event.y + h > window.innerHeight) return (event.y - h - gap + 'px')  
                    else return (event.y + gap + 'px')
                })
                .transition().style('opacity',1)
        } else d3.select('#filter-tooltip').transition().style('opacity',0)
    }
    function abbreviateNumber(num) {
        const abs = Math.abs(num)
        if (abs >= 1e9) {
            return (num / 1e9).toFixed(1).replace(/\.0$/, '') + 'B'
        }
        if (abs >= 1e6) {
            return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'M'
        }
        if (abs >= 1e3) {
            return (num / 1e3).toFixed(1).replace(/\.0$/, '') + 'K'
        }
        return String(num)
    }
    function addAllSourceCategory(all,d) {
        let sources = graphFilter.source
        const categoryIds = d.codes.map(c => c.id)
        if (graphFilter.source.includes(-1)) {
            sources = all.filter(source => !categoryIds.includes(source))
            if (sources.length === 0) sources = graphFilter.source
        }
        else if (categoryIds.every(id => graphFilter.source.includes(id))) {
            sources = sources.filter(source => !categoryIds.includes(source))
            if (sources.length === 0) sources = graphFilter.source
        }
        else sources = [...graphFilter.source,...categoryIds].filter((e,n,l) => l.indexOf(e) === n)
        setGraphFilter(prev => ({...prev,source: sources}))
    }

    useEffect(() => {
        function handleClickOutside(e) {
            if (document.getElementById('dropdown-sources')) {
                const sourceContainer = document.getElementById('source-collapsed')
                if (sourceContainer && !sourceContainer.contains(e.target)) {
                    d3.select('#open-sources').style('display', 'block')
                    d3.select('#close-sources').style('display', 'none')
                    d3.select('#dropdown-sources').style('visibility', 'hidden')
                }
            }
        }
        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    }, [])

    // DRAW FILTERS
    useEffect(() => {
        if (filterData.gender && filterData.source && filterData.age) {
            if (filterData.gender.length > 0 && filterData.age.length > 0 && filterData.source.length > 0) {
                // reset 
                const reset = resetRef.current
                resetRef.current = false   
                if (reset) {
                    d3.selectAll('#age-viz .age-rect').interrupt().style('height', '0px')
                    d3.selectAll('#source-viz .source-geometry').interrupt().style('width', '0px')
                    // d3.selectAll('#gender-svg .arc-text, #age-viz .age-p').interrupt().style('opacity', 0)
                }
                // gender
                const genders = [8507,8532]
                const width = 40
                const height = 40
                const piMargin = 6
                const radius = Math.min(width, height) 
                d3.select("#gender-svg")
                    .attr("width", width)
                    .attr("height", height)
                    .append('g')
                    .attr("transform", `translate(${width/2}, ${height/2 - piMargin}) rotate(180)`) 
                const pieData = d3.pie().value(d => d.sum).sort(null)(filterData.gender)
                const arcGenerator = d3.arc()
                    .innerRadius(0)
                    .outerRadius(radius)
                d3.select('#gender-labels').selectAll('.gender').data(filterData.gender, d => d.id)
                    .join(enter => {
                        enter.append('div')
                            .classed('gender btn flex filterBtn',true)
                            .classed('filterInactive', (d) => !graphFilter.gender.includes(d.id) && !graphFilter.gender.includes(-1) ? true : false)
                            .classed('filterActive', (d) => graphFilter.gender.includes(d.id) || graphFilter.gender.includes(-1) ? true : false)
                            .classed('edgeLeft', (d,i) => i === 0 ? true : false)
                            .classed('edgeRight', (d,i) => i !== 0 ? true : false)
                            .attr('id',d => 'btn-'+d.id)
                            .style('width','38px')
                            .html(d => d.id === 8507 ? 'Male' : 'Female')
                            .on('mouseover',(e,d) => filterHover(d.id,'enter','gender'))
                            .on('mouseout',(e,d) => filterHover(d.id,'leave','gender'))
                            .on('click',(e,d) => filterSelect(d.id,'gender'))
                    },update => {
                        update  
                            .classed('filterInactive', (d) => !graphFilter.gender.includes(d.id) && !graphFilter.gender.includes(-1) ? true : false)
                            .classed('filterActive', (d) => graphFilter.gender.includes(d.id) || graphFilter.gender.includes(-1) ? true : false)
                            .on('mouseover',(e,d) => filterHover(d.id,'enter','gender'))
                            .on('mouseout',(e,d) => filterHover(d.id,'leave','gender'))
                            .on('click',(e,d) => filterSelect(d.id,'gender'))
                    })
                d3.select("#gender-svg").selectAll(".arc").data(pieData, d => d.data.id)
                    .join(enter => {
                        const container = enter.append('g')
                            .classed('arc',true)  
                        container.append('path')
                            .classed('arc-path btn viz',true)
                            .classed('vizInactive', (d) => !graphFilter.gender.includes(d.data.id) && !graphFilter.gender.includes(-1) ? true : false)
                            .classed('vizActive', (d) => graphFilter.gender.includes(d.data.id) || graphFilter.gender.includes(-1) ? true : false)
                            .attr('id', d => 'geometry-'+d.data.id)
                            .attr("d", d => d.endAngle === d.startAngle ? null : arcGenerator(d))
                            .on("mouseover", (e,d) => filterHover(d.data.id, "enter",'gender'))
                            .on("mouseout", (e,d) => filterHover(d.data.id, "leave",'gender'))
                            .on("click", (e,d) => filterSelect(d.data.id, "gender"))
                            .attr("transform", `translate(${width/2}, ${height/2}) scale(0.5) rotate(180)`)
                            // .style('fill', d => graphFilter.gender.includes(-1) && d.data.id === maxGender ? '#c9c9d5' : 'color-mix(in srgb, #c9c9d5, white 20%)')
                        container.append('text')
                            .classed('arc-text vizLabel num',true)
                            // .classed('labelActive', (d) => graphFilter.gender.includes(d.data.id) || graphFilter.gender.includes(-1) ? true : false)
                            .attr('id', d => 'viz-label-'+d.data.id)
                            .text(d => d.data.sum === 0 ? '' : abbreviateNumber(d.data.sum))
                            .attr("x", d => d.data.id === genders[0] ? -radius/2 : radius/2) 
                            .attr("y", radius/2 + piMargin) 
                            .attr("text-anchor", d => d.data.id === genders[0] ? "end" : "start") 
                            .style('font-weight', d => graphFilter.gender.includes(d.data.id) || graphFilter.gender.includes(-1) ? 500 : 400)
                            .style('fill', d => graphFilter.gender.includes(-1) || graphFilter.gender.includes(d.data.id) ? d.data.id === maxGender ? '#36126d' : 'color-mix(in srgb, #36126d, white 40%)' : '#9597a6')
                            .attr("transform", `translate(${width/2}, ${height/2 - piMargin})`)
                    },update=>{
                        update.select('.arc-path')
                            .classed('vizInactive', (d) => !graphFilter.gender.includes(d.data.id) && !graphFilter.gender.includes(-1) ? true : false)
                            .classed('vizActive', (d) => graphFilter.gender.includes(d.data.id) || graphFilter.gender.includes(-1) ? true : false)
                            .on("mouseover", (e,d) => filterHover(d.data.id, "enter",'gender'))
                            .on("mouseout", (e,d) => filterHover(d.data.id, "leave",'gender'))
                            .on("click", (e,d) => filterSelect(d.data.id, "gender"))
                            .transition()
                            .attr("d", d => d.endAngle === d.startAngle ? null : arcGenerator(d))
                            // .style('fill', d => graphFilter.gender.includes(-1) && d.data.id === maxGender ? '#c9c9d5' : 'color-mix(in srgb, #c9c9d5, white 20%)')
                        update.select('.arc-text')
                            // .classed('labelActive', (d) => graphFilter.gender.includes(d.data.id) || graphFilter.gender.includes(-1) ? true : false)
                            .text(d => d.data.sum === 0 ? '' : abbreviateNumber(d.data.sum))
                            .attr("x", d => d.data.id === genders[0] ? -radius/2 : radius/2) 
                            .attr("y", radius/2 + piMargin) 
                            .attr("text-anchor", d => d.data.id === genders[0] ? "end" : "start") 
                            .style('font-weight', d => graphFilter.gender.includes(d.data.id) || graphFilter.gender.includes(-1) ? 500 : 400)
                            .style('fill', d => graphFilter.gender.includes(-1) || graphFilter.gender.includes(d.data.id) ? d.data.id === maxGender ? '#36126d' : 'color-mix(in srgb, #36126d, white 40%)' : '#9597a6')
                    })
                // age
                const ageExtent = d3.extent(filterData.age.map(d => d.sum))
                const scaleHeight = d3.scaleLinear().domain([0,ageExtent[1]]).range([0,30])
                d3.select('#age-labels').selectAll('.age').data(filterData.age, d => d.id)
                    .join(enter => {
                        enter.append('div')
                            .classed('age btn flex filterBtn num',true)
                            .classed('filterInactiveDrag', (d,i) => !graphFilter.age.includes(d.id) && !graphFilter.age.includes(-1) ? true : false)
                            .classed('filterActiveDrag', (d,i) => graphFilter.age.includes(d.id) || graphFilter.age.includes(-1) ? true : false)
                            .classed('filterInactiveRight', (d,i) => (!graphFilter.age.includes(d.id) && !graphFilter.age.includes(-1)) && (i === filterData.age.length - 1 || graphFilter.age.includes(i+1)) ? true : false)
                            .classed('filterActiveRight',(d,i) => (graphFilter.age.includes(-1) && i === filterData.age.length - 1) || (graphFilter.age.includes(d.id) && (i === filterData.age.length - 1 || !graphFilter.age.includes(i+1))) ? true : false)
                            .classed('edgeRight', (d,i) => i === filterData.age.length - 1 ? true : false)
                            .classed('edgeLeft', (d,i) => i === 0 ? true : false)
                            .attr('id',d => 'btn-'+d.id)
                            .html(d => d.id*10+'-'+(d.id*10+9))
                            .style('width','36px')  
                            .style('font-size','8px')                  
                            .on('mouseover',(e,d) => filterHover(d.id,'enter','age'))
                            .on('mouseout',(e,d) => filterHover(d.id,'leave','age'))
                            .on('click',(e,d) => filterSelect(d.id,'age'))
                    },update => {
                        update  
                            .classed('filterInactiveDrag', (d,i) => !graphFilter.age.includes(d.id) && !graphFilter.age.includes(-1) ? true : false)
                            .classed('filterActiveDrag', (d,i) => graphFilter.age.includes(d.id) || graphFilter.age.includes(-1) ? true : false)
                            .classed('filterInactiveRight', (d,i) => (!graphFilter.age.includes(d.id) && !graphFilter.age.includes(-1)) && (i === filterData.age.length - 1 || graphFilter.age.includes(i+1)) ? true : false)
                            .classed('filterActiveRight',(d,i) => (graphFilter.age.includes(-1) && i === filterData.age.length - 1) || (graphFilter.age.includes(d.id) && (i === filterData.age.length - 1 || !graphFilter.age.includes(i+1))) ? true : false)
                            .classed('edgeRight', (d,i) => i === filterData.age.length - 1 ? true : false)
                            .classed('edgeLeft', (d,i) => i === 0 ? true : false)
                            .on('mouseover',(e,d) => filterHover(d.id,'enter','age'))
                            .on('mouseout',(e,d) => filterHover(d.id,'leave','age'))
                            .on('click',(e,d) => filterSelect(d.id,'age'))
                    },exit => exit.remove())
                d3.select('#age-viz').selectAll('.age-geometry').data(filterData.age, d => d.id)
                    .join(enter => {
                        const container = enter.append('div')
                            .classed('age-geometry',true)
                            .style('display','flex')
                            .style('flex-direction','column')
                        container.append('p')
                            .classed('age-p vizLabel num',true)
                            // .classed('labelActive', d => graphFilter.age.includes(d.id) || graphFilter.age.includes(-1) ? true : false)
                            .attr('id',d=>'viz-label-'+d.id)
                            .style('font-weight', d => graphFilter.age.includes(d.id) || graphFilter.age.includes(-1) ? 500 : 400)
                            .style('color', d => graphFilter.age.includes(-1) || graphFilter.age.includes(d.id) ? ageExtent.includes(d.sum) ? '#36126d' : 'color-mix(in srgb, #36126d, white 40%)' : ageExtent.includes(d.sum) ? '#9597a6' : 'color-mix(in srgb, #9597a6, white 40%)')
                            .html(d => d.sum === 0 ? '' : abbreviateNumber(d.sum))
                        container.append('div')
                            .classed('age-rect btn viz',true)
                            .classed('vizInactive',(d) => !graphFilter.age.includes(d.id) && !graphFilter.age.includes(-1) ? true : false)
                            .classed('vizActive',(d) => graphFilter.age.includes(d.id) || graphFilter.age.includes(-1) ? true : false)
                            .attr('id', d => 'geometry-'+d.id)
                            .style('width', '42px')
                            .style('height', d => d.sum === 0 ? '0px' : scaleHeight(d.sum) + 'px')
                            .on('mouseover', (e,d) => filterHover(d.id, 'enter','age'))
                            .on('mouseout', (e,d) => filterHover(d.id, 'leave','age'))
                            .on('click', (e,d) => filterSelect(d.id, 'age'))
                    },update => {
                        update.select('.age-p')
                            // .classed('labelActive', d => graphFilter.age.includes(d.id) || graphFilter.age.includes(-1) ? true : false)
                            .style('font-weight', d => graphFilter.age.includes(d.id) || graphFilter.age.includes(-1) ? 500 : 400)
                            .style('color', d => graphFilter.age.includes(-1) || graphFilter.age.includes(d.id) ? ageExtent.includes(d.sum) ? '#36126d' : 'color-mix(in srgb, #36126d, white 40%)' : ageExtent.includes(d.sum) ? '#9597a6' : 'color-mix(in srgb, #9597a6, white 40%)')
                            .html(d => d.sum === 0 ? '' : abbreviateNumber(d.sum))
                        update.select('.age-rect')
                            .classed('vizInactive',(d) => !graphFilter.age.includes(d.id) && !graphFilter.age.includes(-1) ? true : false)
                            .classed('vizActive',(d) => graphFilter.age.includes(d.id) || graphFilter.age.includes(-1) ? true : false)
                            .on('mouseover', (e,d) => filterHover(d.id, 'enter','age'))
                            .on('mouseout', (e,d) => filterHover(d.id, 'leave','age'))
                            .on('click', (e,d) => filterSelect(d.id, 'age'))
                            .transition()    
                            .style('height', d => d.sum === 0 ? '0px' : scaleHeight(d.sum) + 'px')
                    })   
                // source viz
                const allSources = filterData.source.map(d => d.codes).flat()
                const subtract = filterData.age.length < 11 ? 40 : 60
                const add = filterData.age.length < 11 ? 40 : 30
                const sourceWidth = document.getElementById("graph-filters").clientWidth - document.getElementById('gender-container').clientWidth - document.getElementById('age-container').clientWidth - (5*allSources.length) - subtract
                const maxWidth = sourceWidth + add
                document.getElementById("header-sources").style.maxWidth =  maxWidth + 'px'
                const filteredSources = filterData.source.map(obj => ({...obj,codes:obj.codes.filter(c => c.sum !== 0)})).filter(obj => obj.codes.length > 0)
                const allFiltered = filteredSources.map(d => d.codes).flat().map(d => d.id)
                const categorySums = filteredSources.map(obj => d3.sum(obj.codes.map(c => c.sum)))
                const scaleWidth = d3.scaleLinear().domain([0,d3.extent(categorySums)[1]]).range([5,sourceWidth])
                d3.select('#dropdown-sources').selectAll('.source-section').data(filteredSources, d => d.key)
                    .join(enter => {
                        const category = enter.append('div')
                            .classed('source-section',true)
                            .style('width','100%')
                        const title = category.append('div')
                            .classed('flex',true)
                        title.append('p')
                            .classed('category-dropdown-p',true)
                            .style('padding-right','5px')
                            .html(d => d.key == 'Long.' ? 'Longitudinal' : d.key === 'Reg.' ? 'Registry' : d.key)
                            .style('font-weight', d => d.codes.map(c => c.id).every(id => graphFilter.source.includes(id)) || graphFilter.source.includes(-1) ? 500 : 400)
                        const checkBox = title.append('div')
                            .classed('category-check-box checkMarkBox marginRight btn',true)
                            .style('width','10px')
                            .style('height','10px')
                            .style('border', d => d.codes.map(c => c.id).every(id => graphFilter.source.includes(id)) || graphFilter.source.includes(-1) ? '1px solid #9597a6' : '1px solid #e8e8e8')
                            .on('click',(e,d) => {addAllSourceCategory(allFiltered,d)})
                        checkBox.append('i')
                            .classed('category-check-mark fa-solid fa-check',true)
                            .style('font-size','8px')
                            .style('display', d => d.codes.map(c => c.id).every(id => graphFilter.source.includes(id)) || graphFilter.source.includes(-1) ? 'block' : 'none')
                        category.selectAll(".source").data(d => d.codes, d => d.key)
                            .join(enter => {
                                const container = enter.append('div')
                                    .classed('source flex',true)  
                                    .style('opacity', d => d.sum > 0 ? 1 : 0.2) 
                                    .style('pointer-events', d => d.sum > 0 ? 'all' : 'none')
                                container.append('div') 
                                    .classed('source-check-box checkBox',true)
                                    .attr('id', d => 'check-box-'+d.id)
                                    .style('background-color', d => graphFilter.source.includes(d.id) || (graphFilter.source.includes(-1) && d.sum > 0) ? '#36125d' : 'transparent')
                                    .style('border', d => graphFilter.source.includes(d.id) || (graphFilter.source.includes(-1) && d.sum > 0)? '1px solid #36125d' : '1px solid #cccccc')
                                    .on('click', (e,d) => {
                                        e.stopPropagation()
                                        filterSelect(d.id,'source')
                                    })
                                container.append('p')
                                    .classed('source-p btn',true)
                                    .attr('id', d => 'source-'+d.id)
                                    .style('font-weight', d => graphFilter.source.includes(d.id) || (graphFilter.source.includes(-1) && d.sum > 0)? 500 : 400)
                                    .style('color', d => graphFilter.source.includes(d.id) || (graphFilter.source.includes(-1) && d.sum > 0)? '#36125d' : '#9597a6')
                                    .html(d => d.code)    
                            },update => {
                                update 
                                    .style('opacity', d => d.sum > 0 ? 1 : 0.2) 
                                    .style('pointer-events', d => d.sum > 0 ? 'all' : 'none')
                                update.select('.source-check-box')
                                    .style('background-color', d => graphFilter.source.includes(d.id) || (graphFilter.source.includes(-1) && d.sum > 0) ? '#36125d' : 'transparent')
                                    .style('border', d => graphFilter.source.includes(d.id) || (graphFilter.source.includes(-1) && d.sum > 0)? '1px solid #36125d' : '1px solid #cccccc')
                                    .on('click', (e,d) => {
                                        e.stopPropagation()
                                        filterSelect(d.id,'source')
                                    })
                                update.select('.source-p')
                                    .style('font-weight', d => graphFilter.source.includes(d.id) || (graphFilter.source.includes(-1) && d.sum > 0)? 500 : 400)
                                    .style('color', d => graphFilter.source.includes(d.id) || (graphFilter.source.includes(-1) && d.sum > 0)? '#36125d' : '#9597a6')
                                    .html(d => d.code)
                            })      
                    },update => {
                        update.selectAll('.category-dropdown-p')
                            .style('font-weight', d => d.codes.map(c => c.id).every(id => graphFilter.source.includes(id)) || graphFilter.source.includes(-1) ? 500 : 400)
                        update.selectAll('.category-check-box')
                            .style('border', d => d.codes.map(c => c.id).every(id => graphFilter.source.includes(id)) || graphFilter.source.includes(-1) ? '1px solid #9597a6' : '1px solid #e8e8e8')
                            .on('click',(e,d) => {addAllSourceCategory(allFiltered,d)})
                        update.selectAll('.category-check-mark')
                            .style('display', d => d.codes.map(c => c.id).every(id => graphFilter.source.includes(id)) || graphFilter.source.includes(-1) ? 'block' : 'none')
                        update.selectAll(".source").data(d => d.codes, d => d.key)
                            .join(enter => {
                                const container = enter.append('div')
                                    .classed('source flex',true)  
                                    .style('opacity', d => d.sum > 0 ? 1 : 0.2) 
                                    .style('pointer-events', d => d.sum > 0 ? 'all' : 'none')
                                container.append('div') 
                                    .classed('source-check-box checkBox',true)
                                    .attr('id', d => 'check-box-'+d.id)
                                    .style('background-color', d => graphFilter.source.includes(d.id) || (graphFilter.source.includes(-1) && d.sum > 0) ? '#36125d' : 'transparent')
                                    .style('border', d => graphFilter.source.includes(d.id) || (graphFilter.source.includes(-1) && d.sum > 0)? '1px solid #36125d' : '1px solid #cccccc')
                                    .on('click', (e,d) => {
                                        e.stopPropagation()
                                        filterSelect(d.id,'source')
                                    })
                                container.append('p')
                                    .classed('source-p btn',true)
                                    .attr('id', d => 'source-'+d.id)
                                    .style('font-weight', d => graphFilter.source.includes(d.id) || (graphFilter.source.includes(-1) && d.sum > 0)? 500 : 400)
                                    .style('color', d => graphFilter.source.includes(d.id) || (graphFilter.source.includes(-1) && d.sum > 0)? '#36125d' : '#9597a6')
                                    .html(d => d.code)    
                            },update => {
                                update 
                                    .style('opacity', d => d.sum > 0 ? 1 : 0.2) 
                                    .style('pointer-events', d => d.sum > 0 ? 'all' : 'none')
                                update.select('.source-check-box')
                                    .style('background-color', d => graphFilter.source.includes(d.id) || (graphFilter.source.includes(-1) && d.sum > 0) ? '#36125d' : 'transparent')
                                    .style('border', d => graphFilter.source.includes(d.id) || (graphFilter.source.includes(-1) && d.sum > 0)? '1px solid #36125d' : '1px solid #cccccc')
                                    .on('click', (e,d) => {
                                        e.stopPropagation()
                                        filterSelect(d.id,'source')
                                    })
                                update.select('.source-p')
                                    .style('font-weight', d => graphFilter.source.includes(d.id) || (graphFilter.source.includes(-1) && d.sum > 0)? 500 : 400)
                                    .style('color', d => graphFilter.source.includes(d.id) || (graphFilter.source.includes(-1) && d.sum > 0)? '#36125d' : '#9597a6')
                                    .html(d => d.code)
                            })      
                    })
                d3.select('#source-viz').selectAll('.category').data(filteredSources, d => d.key)
                    .join(enter => {
                        const category = enter.append('div')
                            .classed('category',true)
                            .style('margin','1px 0px 1px 0px')
                        const label = category.append('div')
                            .classed('category-flex flex btn',true)
                            .style("order",0)
                            .on('click',(e,d) => {addAllSourceCategory(allFiltered,d)})
                        label.append('p')
                            .classed('category-p',true)
                            .html(d => d.key)
                            .style('position','relative')
                            .style('padding-right','5px')
                            .style('margin',0)
                            .style('width','25px')
                            .style('font-weight', d => d.codes.map(c => c.id).every(id => graphFilter.source.includes(id)) || graphFilter.source.includes(-1) ? 500 : 400)
                            .on('mouseover', (e,d) => {
                                const el = e.currentTarget
                                el.__hoverTimeout__ = setTimeout(() => {
                                    if (d.key === 'Long.') showActionLabel('Longitudinal','enter',e)
                                    if (d.key === 'Reg.') showActionLabel('Registry','enter',e)
                                }, 1200) 
                            })
                            .on('mouseout', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave',e)
                            })
                        const checkBox = label.append('div')
                            .classed('source-check-box checkMarkBox marginRight btn',true)
                            .style('width','10px')
                            .style('height','10px')
                            .style('border', d => d.codes.map(c => c.id).every(id => graphFilter.source.includes(id)) || graphFilter.source.includes(-1) ? '1px solid #9597a6' : '1px solid #e8e8e8')
                        checkBox.append('i')
                            .classed('source-check-mark fa-solid fa-check',true)
                            .style('font-size','8px')
                            .style('display', d => d.codes.map(c => c.id).every(id => graphFilter.source.includes(id)) || graphFilter.source.includes(-1) ? 'block' : 'none')
                        category.selectAll(".source-geometry").data(d => d.codes, d => d.id)
                            .join(enter => {
                                enter.append('div')
                                    .classed('source-geometry viz flex btn',true)
                                    .classed('vizInactive', d => !graphFilter.source.includes(d.id) && !graphFilter.source.includes(-1) ? true : false)
                                    .classed('vizActive', d => graphFilter.source.includes(d.id) || graphFilter.source.includes(-1) ? true : false)
                                    .attr('id',d => 'geometry-'+d.id)
                                    .html(d => {
                                        const max = scaleWidth(d.sum) / 6
                                        return max < 2 ? '' : d.code.length > max ? d.code.substring(0,max) : d.code
                                    })
                                    .style('width',d => scaleWidth(d.sum) + 'px') 
                                    .style('height','18px')
                                    .style('font-size','8px')
                                    .on('mouseover',(e,d) => {
                                        filterTooltip(d,'enter',e)
                                        filterHover(d.id,'enter','source')
                                    })
                                    .on('mouseout',(e,d) => {
                                        filterTooltip(d,'leave',e)
                                        filterHover(d.id,'leave','source')
                                    })
                                    .on('click',(e,d)=>filterSelect(d.id,'source'))
                            },update => {
                                update  
                                    .classed('vizInactive', d => !graphFilter.source.includes(d.id) && !graphFilter.source.includes(-1) ? true : false)
                                    .classed('vizActive', d => graphFilter.source.includes(d.id) || graphFilter.source.includes(-1) ? true : false)
                                    .html(d => {
                                        const max = scaleWidth(d.sum) / 6
                                        return max < 2 ? '' : d.code.length > max ? d.code.substring(0,max) : d.code
                                    })
                                    .on('mouseover',(e,d) => {
                                        filterTooltip(d,'enter',e)
                                        filterHover(d.id,'enter','source')
                                    })
                                    .on('mouseout',(e,d) => {
                                        filterTooltip(d,'leave',e)
                                        filterHover(d.id,'leave','source')
                                    })
                                    .on('click',(e,d)=>filterSelect(d.id,'source'))
                                    .transition()
                                    .style('width',d => scaleWidth(d.sum) + 'px') 
                            })   
                    },update => {
                        update.selectAll('.category-flex')
                            .on('click',(e,d) => {addAllSourceCategory(allFiltered,d)})
                        update.selectAll('.category-p')
                            .style('font-weight', d => d.codes.map(c => c.id).every(id => graphFilter.source.includes(id)) || graphFilter.source.includes(-1) ? 500 : 400)
                            .on('mouseover', (e,d) => {
                                const el = e.currentTarget
                                el.__hoverTimeout__ = setTimeout(() => {
                                    if (d.key === 'Long.') showActionLabel('Longitudinal','enter',e)
                                    if (d.key === 'Reg.') showActionLabel('Registry','enter',e)
                                }, 1200) 
                            })
                            .on('mouseout', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave',e)
                            })
                        update.selectAll('.source-check-box')
                            .style('border', d => d.codes.map(c => c.id).every(id => graphFilter.source.includes(id)) || graphFilter.source.includes(-1) ? '1px solid #9597a6' : '1px solid #e8e8e8')
                        update.selectAll('.source-check-mark')
                            .style('display', d => d.codes.map(c => c.id).every(id => graphFilter.source.includes(id)) || graphFilter.source.includes(-1) ? 'block' : 'none')
                        update.selectAll(".source-geometry").data(d => d.codes, d => d.id)
                            .join(enter => {
                                enter.append('div')
                                    .classed('source-geometry viz flex btn',true)
                                    .classed('vizInactive', d => !graphFilter.source.includes(d.id) && !graphFilter.source.includes(-1) ? true : false)
                                    .classed('vizActive', d => graphFilter.source.includes(d.id) || graphFilter.source.includes(-1) ? true : false)
                                    .attr('id',d => 'geometry-'+d.id)
                                    .html(d => {
                                        const max = scaleWidth(d.sum) / 6
                                        return max < 2 ? '' : d.code.length > max ? d.code.substring(0,max) : d.code
                                    })
                                    .style('width',d => scaleWidth(d.sum) + 'px') 
                                    .style('height','18px')
                                    .style('font-size','8px')
                                    .on('mouseover',(e,d) => {
                                        filterTooltip(d,'enter',e)
                                        filterHover(d.id,'enter','source')
                                    })
                                    .on('mouseout',(e,d) => {
                                        filterTooltip(d,'leave',e)
                                        filterHover(d.id,'leave','source')
                                    })
                                    .on('click',(e,d)=>filterSelect(d.id,'source'))
                            },update => {
                                update  
                                    .classed('vizInactive', d => !graphFilter.source.includes(d.id) && !graphFilter.source.includes(-1) ? true : false)
                                    .classed('vizActive', d => graphFilter.source.includes(d.id) || graphFilter.source.includes(-1) ? true : false)
                                    .html(d => {
                                        const max = scaleWidth(d.sum) / 6
                                        return max < 2 ? '' : d.code.length > max ? d.code.substring(0,max) : d.code
                                    })
                                    .on('mouseover',(e,d) => {
                                        filterTooltip(d,'enter',e)
                                        filterHover(d.id,'enter','source')
                                    })
                                    .on('mouseout',(e,d) => {
                                        filterTooltip(d,'leave',e)
                                        filterHover(d.id,'leave','source')
                                    })
                                    .on('click',(e,d)=>filterSelect(d.id,'source'))
                                    .transition()
                                    .style('width',d => scaleWidth(d.sum) + 'px') 
                            }) 
                    })
                const sourceSelections = !graphFilter.source.includes(-1) && !allSources.filter(s => s.sum > 0).map(s => s.id).every(id => graphFilter.source.includes(id)) ? graphFilter.source.map(id => allSources.find(d => d.id === id).code) : ['All']
                d3.select('#header-sources').classed('dropdownHeader-flexPadding',!sourceSelections.includes('All') ? true : false)
                const selections = d3.select('#source-selections')
                    .selectAll('.source-selection')
                    .data(sourceSelections, d => d)
                const merged = selections.join(
                    enter => {
                        const div = enter.append('div')
                            .classed('source-selection flex',true)
                            .classed('dropdownTitleEl', () => !sourceSelections.includes('All') ? true : false)
                            .classed('filterActive', () => !sourceSelections.includes('All') ? true : false)
                            .style('pointer-events', () => !sourceSelections.includes('All') ? 'all' : 'none')
                        div.append('p')
                            .html(d => d)
                        div.append('i')
                            .classed('fa-solid fa-x icon',true)
                            .style('display', () => !sourceSelections.includes('All') ? 'block' : 'none')
                        return div
                    },
                    update => update,
                    exit => exit.remove()
                )
                merged
                    .on('click', (e, d) => {
                        const id = allSources.find(s => s.code === d).id
                        let sources = graphFilter.source.filter(s => s !== id)
                        if (sources.length === 0) sources = [-1]
                        setGraphFilter(prev => ({...prev,source: sources}))
                    })
                const minWidth = document.getElementById('dropdown-sources').clientWidth - 12
                document.getElementById("header-sources").style.minWidth = minWidth > maxWidth ? maxWidth + 'px' : minWidth  + 'px'
            } 
        }
    },[filterData,graphSectionWidth])

    // RECORD COUNTS
    useEffect(() => {
        if (graphContainerRef.current && upsetContainerRef.current && extent) {
            const fullHeight = document.getElementById('graph-section-container').clientHeight 
            const filterHeight = 150 + margin
            const containerWidth = document.getElementById('graph-section').clientWidth
            if (containerWidth < window.innerWidth*0.4 || graphSectionWidth === '40vw') d3.select('#graph-filters').style('display','none')
            else d3.select('#graph-filters').style('display','flex')
            if (countType === 'record') {
                const chartMargin = { top: 20, right: 0, bottom: 60, left: 50 }
                document.getElementById("graph-group").style.height = fullHeight - filterHeight - margin + 'px'
                const containerHeight = document.getElementById('graph-group').clientHeight - (document.getElementById('graph-group').clientHeight * 0.15 - margin) - (margin*2)
                document.getElementById("graph-labels").style.maxHeight = document.getElementById('graph-group').clientHeight * 0.15 - margin + 'px'
                document.getElementById("graph-container").style.height = document.getElementById("graph-group").clientHeight - filterHeight - margin + 'px'

                const outerWidth = containerWidth - margin * 2
                const outerHeight = containerHeight
                const innerWidth = outerWidth - chartMargin.left - chartMargin.right
                const innerHeight = outerHeight - chartMargin.top - chartMargin.bottom

                d3.select("#graph")
                    .attr("width", outerWidth)
                    .attr("height", outerHeight)
                    .attr("viewBox", `${-chartMargin.left} ${-chartMargin.top} ${outerWidth} ${outerHeight}`)

                d3.select("#clip rect")
                    .attr("width", innerWidth)
                    .attr("height", innerHeight)

                // graph ticks
                const ticks1 = ((extent[1]-extent[0])/(Math.round((extent[1]-extent[0])/10)))*Math.round((extent[1]-extent[0])/10)
                const ticks2 = innerWidth < 400 ? Math.round(innerWidth/60) : ticks1 < 10 || !ticks1 ? Math.round(extent[1]-extent[0]) : 10
                const ticks = { one: ticks1, two: ticks2 }

                getGraph(stackData, innerWidth, innerHeight, ticks, 'graph')
                drawAxisLabels(innerWidth, innerHeight, chartMargin, "Year", "Record counts")
            } 
        }
    }, [countType,extent,stackData,graphSectionWidth,openFilters,showRootLine])

    // PERSON COUNTS
    useEffect(() => {
        if (countType === 'person') {
            if (personData.length > 0) {
                const fullHeight = document.getElementById('graph-section-container').clientHeight 
                const filterHeight = document.getElementById('graph-filters').clientHeight + document.getElementById('year-filter').clientHeight + (margin*2)
                const containerWidth = document.getElementById('graph-section').clientWidth
                document.getElementById("upset-container").style.height = fullHeight - filterHeight - margin + 'px'
                document.getElementById("upset-container").style.width = containerWidth - (margin*2) + 'px'
                drawUpset()    
            } else {
                d3.select('#sets-layer').selectAll('*').remove()
                d3.select('#upsets-layer').selectAll('*').remove()
                d3.select('#types-layer').selectAll('*').remove()
                d3.select('#y-axis-layer').selectAll('*').remove()    
            }    
        }
    }, [personData,graphSectionWidth,openFilters,extent])

    // PREVALENCE / INCIDENCE 
    useEffect(() => {
        if (countType === 'prevalence' || countType === 'incidence') {
            const chartMargin = { top: 20, right: 0, bottom: 60, left: 50 }
            const fullHeight = document.getElementById('graph-section-container').clientHeight
            const filterHeight = 150 + margin
            const containerWidth = document.getElementById('graph-section').clientWidth
            if (containerWidth < window.innerWidth * 0.4 || graphSectionWidth === '40vw') d3.select('#graph-filters').style('display', 'none')
            else d3.select('#graph-filters').style('display', 'flex')
            document.getElementById("graph-group").style.height = fullHeight - filterHeight - margin + 'px'
            const containerHeight = document.getElementById('graph-group').clientHeight - (document.getElementById('graph-group').clientHeight * 0.15 - margin) - (margin*2)
            document.getElementById("graph-labels").style.maxHeight = document.getElementById('graph-group').clientHeight * 0.15 - margin + 'px'
            document.getElementById("graph-container").style.height = document.getElementById("graph-group").clientHeight - filterHeight - margin + 'px'

            const outerWidth = containerWidth - margin * 2
            const outerHeight = containerHeight
            const innerWidth = outerWidth - chartMargin.left - chartMargin.right
            const innerHeight = outerHeight - chartMargin.top - chartMargin.bottom

            d3.select("#graph")
                .attr("width", outerWidth)
                .attr("height", outerHeight)
                .attr("viewBox", `${-chartMargin.left} ${-chartMargin.top} ${outerWidth} ${outerHeight}`)

            d3.select("#clip rect")
                .attr("width", innerWidth)
                .attr("height", innerHeight)

            // graph ticks
            const ticks1 = ((extent[1] - extent[0]) / (Math.round((extent[1] - extent[0]) / 10))) * Math.round((extent[1] - extent[0]) / 10)
            const ticks2 = innerWidth < 400 ? Math.round(innerWidth / 60) : ticks1 < 10 || !ticks1 ? Math.round(extent[1] - extent[0]) : 10
            const ticks = { one: ticks1, two: ticks2 }

            // draw graph
            const yLabel = countType === 'prevalence' ? 'Prevalence' : 'Incidence'
            const plotData = countType === 'prevalence' ? prevalenceData : incidenceData

            getGraph(plotData, innerWidth, innerHeight, ticks, 'plot')
            drawAxisLabels(innerWidth, innerHeight, chartMargin, "Year", yLabel)
        }
    }, [prevalenceData,incidenceData,graphSectionWidth,openFilters,extent,hovered])

    // LAB VALUES
    useEffect(()=>{
        if (countType === 'measurement' && measurementData.length > 0) {
            const fullHeight = document.getElementById('graph-section-container').clientHeight 
            const filterHeight = 150 
            const containerWidth = document.getElementById('graph-section').clientWidth + margin
            document.getElementById("histogram-container").style.height = fullHeight - filterHeight - margin + 'px'
            document.getElementById("histogram-container").style.width = containerWidth - (margin*2) + 'px'

            const chartMargin = {
                top: 20,
                right: 0,
                bottom: 70,
                left: 70
            }
            const outerWidth = containerWidth - margin * 2
            const outerHeight = fullHeight - filterHeight - margin
            const innerWidth = outerWidth - chartMargin.left - chartMargin.right
            const innerHeight = outerHeight - chartMargin.top - chartMargin.bottom

            const svg = d3.select("#histogram")
                .attr("width", outerWidth)
                .attr("height", outerHeight)
                .attr("viewBox", `0 0 ${outerWidth} ${outerHeight}`)

            const chart = svg.selectAll(".chart-content")
                .data([null])
                .join("g")
                .attr("class", "chart-content")
                .attr(
                    "transform",
                    `translate(${chartMargin.left}, ${chartMargin.top})`
                )

            chart.selectAll(".axis-grid")
                .data([null])
                .join("g")
                .attr("class", "axis-grid")

            chart.selectAll(".x")
                .data([null])
                .join("g")
                .attr("class", "x axis-grid num bucket-label")

            chart.selectAll(".y")
                .data([null])
                .join("g")
                .attr("class", "y axis num")

            const filteredData = measurementData.filter(d => +d.n_events > 0)

            const key = b => { const { lo } = parseBucket(b); return Number.isNaN(lo) ? Infinity : lo }
            const buckets = Array.from(new Set(filteredData.map(d => d.measured_value_bucket)))
                .sort((a, b) => { const ka = key(a), kb = key(b); return ka < kb ? -1 : ka > kb ? 1 : 0 })

            const concepts = Array.from(new Set(filteredData.map(d => d.tagged_conceptid)))

            const scaleX = d3.scaleBand()
                .domain(buckets)
                .range([0, innerWidth])
                .padding(0.15)

            const bucketTotals = d3.rollup(
                filteredData,
                v => d3.sum(v, d => +d.n_events),
                d => d.measured_value_bucket
            )

            const maxY = d3.max(
                buckets,
                bucket => bucketTotals.get(bucket) || 0
            ) || 0  

            const scaleY = d3.scaleLinear()
                .domain([0, maxY * 1.05 || 1])
                .range([innerHeight, 0])
                .nice()

            console.log(filteredData[0])
            const unit = filteredData[0]?.unit ?? ""

            drawAxes(scaleX, scaleY, innerWidth, innerHeight, null, "bucket");
            drawHistogram(filteredData, scaleX, scaleY, concepts); 
            drawHistogramRuler(scaleX, innerWidth, innerHeight); 
            drawAxisLabels(innerWidth,innerHeight,chartMargin,unit ? `Measured value (${unit})` : "Measured value","Record counts",'bucket')
        }
    },[measurementData,graphSectionWidth,openFilters,extent])

    useEffect(() => {
        layoutUpset()
    }, [upsetZoomedOut])

    useEffect(() => {
        window.addEventListener('resize', drawUpset) 
        return () => window.removeEventListener('resize', drawUpset)
    }, [])

    // LABELS
    useEffect(()=> {
        const groups = d3.group(selectedConcepts, d => d.name)
        function getNode(name) {return nodes.find(n => n.name === name)}

        // cross-fade code/vocab and icons; no size changes
        function setActionsVisible(el, show) {
            const label = d3.select(el)
            label.select('.label-meta').transition().duration(200)
                .style('opacity', show ? 0 : 1)
            label.select('.label-icons').transition().duration(200)
                .style('opacity', show ? 1 : 0)
            // hidden icons shouldn't catch clicks
            label.select('.label-icons').style('pointer-events', show ? 'auto' : 'none')
        }

        // label-level events, shared by enter and update
        function bindLabelEvents(sel) {
            sel.on('mouseenter', (e, d) => {
                    const el = e.currentTarget
                    setActionsVisible(el, true)
                    el.hoverStateTimeout = setTimeout(() => setHovered([d[0]]), 600)
                })
                .on('mouseleave', (e, d) => {
                    const el = e.currentTarget
                    clearTimeout(el.hoverStateTimeout)
                    if (!showConfirmation) setActionsVisible(el, false)
                    setHovered([])
                })
                // .on('click', (e, d) => {
                //     if (rootConcepts.includes(d[0])) return
                //     showActionLabel('', 'leave')
                //     showConfirmationPopup(d[0], 'enter', e)
                // })
        }

        // icon visibility and click handlers, same rules as the list
        function bindActions(labels) {
            labels.each(function (d) {
                const name = d[0]
                const node = getNode(name)
                const label = d3.select(this)

                label.select('.label-closed-eye')
                    .style('display', node && !inclusions.includes(name) && (node.record_counts !== 0 || isLeaf(node)) && !node.leaf && node.levels !== '-1' ? 'inline-block' : 'none')
                    .on('mouseover', e => {
                        d3.select(e.currentTarget).transition().style('opacity', 1)
                        const el = e.currentTarget
                        el.__hoverTimeout__ = setTimeout(() => showActionLabel('Show concept', 'enter', e), 1200)
                    })
                    .on('mouseout', e => {
                        d3.select(e.currentTarget).transition().style('opacity', 0.3)
                        clearTimeout(e.currentTarget.__hoverTimeout__)
                        showActionLabel('', 'leave', e)
                    })
                    .on('click', e => {
                        e.stopPropagation()
                        clearTimeout(e.currentTarget.__hoverTimeout__)
                        showActionLabel('', 'leave')
                        updateConcepts(getNewInclusions(node, 'show'))
                    })

                label.select('.label-eye')
                    .style('display', !node ? 'none'
                        : (((countType === 'record' && node.record_counts === 0) || (countType === 'person' && node.person_counts === 0)) && !node.leaf) || node.levels === '-1' ? 'none'
                        : !inclusions.includes(name) && !node.leaf ? 'none' : 'inline-block')
                    .on('mouseover', e => {
                        const el = e.currentTarget
                        el.__hoverTimeout__ = setTimeout(() => showActionLabel('Hide concept', 'enter', e), 1200)
                    })
                    .on('mouseout', e => {
                        clearTimeout(e.currentTarget.__hoverTimeout__)
                        showActionLabel('', 'leave', e)
                    })
                    .on('click', e => {
                        e.stopPropagation()
                        clearTimeout(e.currentTarget.__hoverTimeout__)
                        showActionLabel('', 'leave')
                        updateConcepts(getNewInclusions(node, 'hide'))
                    })

                label.select('.label-search')
                    .style('display', rootConcepts.includes(name) ? 'none' : 'inline-block')
                    .on('mouseover', e => {
                        const el = e.currentTarget
                        el.__hoverTimeout__ = setTimeout(() => showActionLabel('Select concept', 'enter', e), 1200)
                    })
                    .on('mouseout', e => {
                        clearTimeout(e.currentTarget.__hoverTimeout__)
                        showActionLabel('', 'leave', e)
                        showConfirmationPopup(name, 'leave', e)
                    })
                    .on('click', e => {
                        e.stopPropagation()
                        clearTimeout(e.currentTarget.__hoverTimeout__)
                        showActionLabel('', 'leave')
                        showConfirmationPopup(name, 'enter', e)
                    })
            })
        }

        function updateLabels(groups) {
            d3.select('#graph-labels').selectAll('.labels').data(groups, d => d[0])
                .join(enter => {
                    const labels = enter.append('div')  
                        .classed('labels btn marginRight', true) 
                        .attr('id', d => 'label-' + d[0])
                        .style('background-color','white')
                        .style('box-shadow','0 0 0 1px rgba(0, 0, 0, 0.02),0 2px 10px rgba(0, 0, 0, 0.1)')
                        .style('border', d => rootConcepts.includes(d[0]) ? '1px solid #7728ED' : 'none')
                        .style('border-radius', '20px')
                        .style('transition','0.5s opacity')
                        .style('opacity', d => hovered.length > 0 && !hovered.includes(d[0]) ? 0.2 : 1)
                    labels.append("div")
                        .classed('label-circle', true)
                        .attr("id", d => "label-circle-" + d[0])
                        .style('background', d => {
                            if (!getConceptInfo(d[0]).standard_concept) {
                                let colorVar = colorList[d[0]]
                                return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, "+ colorVar + " 0.5px," + colorVar + " 2px)"
                            } else {return "none"}    
                        })
                        .style("background-color", d => {
                            if (getConceptInfo(d[0]).standard_concept) {
                                return colorList[d[0]]
                            } else {return "none"}
                        }) 
                    bindLabelEvents(labels)
                    const text = labels.append('div')
                        .style('display', 'flex')
                        .style('align-items', 'center')
                        .style('margin-bottom', '1px')
                    text.append('tspan')
                        .classed('label-text selectedText marginRight', true)
                        .attr('id', d => 'label-text-' + d[0])
                        .html(d => getConceptInfo(d[0]).concept_name)

                    // code/vocab and icons share one grid cell
                    const swap = text.append('span')
                        .classed('label-swap', true)
                        .style('display', 'inline-grid')
                        .style('align-items', 'center')

                    const meta = swap.append('span')
                        .classed('label-meta', true)
                        .style('grid-area', '1 / 1')
                        .style('white-space', 'nowrap')
                    meta.append('tspan')
                        .classed('label-code marginRight num', true)
                        .attr('id', d => 'label-code-' + d[0])
                        .style('font-weight', 500)
                        .html(d => getConceptInfo(d[0]).concept_code)
                    meta.append('tspan')
                        .classed('label-vocab', true)
                        .attr('id', d => 'label-vocab-' + d[0])
                        .html(d => getConceptInfo(d[0]).vocabulary_id)

                    const icons = swap.append('span')
                        .classed('label-icons', true)
                        .style('grid-area', '1 / 1')
                        .style('display', 'flex')
                        .style('align-items', 'center')
                        .style('opacity', 0)
                        .style('pointer-events', 'none')
                        .style("z-index",500)
                    icons.append('img')
                        .classed('label-eye icon marginRight eye', true)
                        .attr('src', openedEye)
                        .style('margin-left','6px')
                    icons.append('i')
                        .classed('label-search fa fa-search iconLg marginRight', true)
                        .style('transform', 'scaleX(-1)')

                    // the closed eye stays outside the swap, always faintly visible
                    const right = labels.append('div')
                        .classed('label-right', true)
                        .style('display', 'flex')
                        .style('align-items', 'center')
                    right.append('img')
                        .classed('label-closed-eye icon marginRight eye', true)
                        .attr('src', closedEye)
                        .style('opacity', 0.3)

                    bindActions(labels)
                }, update => {
                    update
                        .style('border', d => rootConcepts.includes(d[0]) ? '1px solid #7728ED' : 'none')
                        .style('opacity', d => hovered.length > 0 && !hovered.includes(d[0]) ? 0.2 : 1)
                    bindLabelEvents(update)
                    bindActions(update)
                },exit => exit.remove())    
        }
        updateLabels(groups)
    },[selectedConcepts,hovered])

    useEffect(() => {
        const FADE = 0.8 
        const fade = c => d3.interpolateRgb(c, '#fff')(FADE)
        const fade2 = c => d3.interpolateRgb(c, '#fff')(0.5)
        const dim = id => hovered.length > 0 && !hovered.includes(id)

        d3.selectAll('.area-path')
            .attr('fill', d => dim(d.key) ? fade(colorList[d.key]) : colorList[d.key])

        // d3.selectAll('.plot-dot')
        //     .attr('fill', d => dim(d.id) ? fade(colorList[d.id]) : colorList[d.id])

        d3.selectAll('.year-line')
            .attr('stroke', hovered.length > 0 ? fade2('#c9c9d5') : '#c9c9d5')

        d3.selectAll('.concept-stack')
            .attr('fill', d => {
                const id = parseInt(d.key.replace(/\D/g, ''))
                return dim(id) ? fade(colorList[id]) : colorList[id]
            })
    }, [hovered])

    // scroll to label
    useEffect(() => {
        if (hovered.length !== 1) return
        const container = document.getElementById('graph-labels')
        const label = document.getElementById('label-' + hovered[0])
        if (!container || !label) return

        const PAD = 8 // breathing room so the shadow isn't clipped

        const c = container.getBoundingClientRect()
        const l = label.getBoundingClientRect()

        // visible area, excluding borders and scrollbars
        const visibleTop = c.top + container.clientTop
        const visibleBottom = visibleTop + container.clientHeight

        if (l.top - PAD < visibleTop) {
            container.scrollTo({
                top: container.scrollTop - (visibleTop - (l.top - PAD)),
                behavior: 'smooth'
            })
        } else if (l.bottom + PAD > visibleBottom) {
            container.scrollTo({
                top: container.scrollTop + ((l.bottom + PAD) - visibleBottom),
                behavior: 'smooth'
            })
        }
    }, [hovered])

    useEffect(() => {
        if (d3.select('#graph').select('defs').empty()) {
            const defs = d3.select('#graph').append('defs')
            defs.append('svg:clipPath')
                .attr('id', 'clip')
                .append('svg:rect')
                .attr('x', 0)
                .attr('y', 0)
        }
    }, [])

    return (
        <div id = "graph-section">
            <div id = "filter-tooltip" style = {{borderRadius: '4px'}} className = 'toolTip dropShadow'>
                <div style = {{paddingBottom:2}} id = "filter-name"></div>
                <div className = 'num' id = "filter-value"></div>    
            </div>
            <div id = 'annotation-tooltip' style = {{borderRadius: '4px'}} className = 'toolTip dropShadow'>
                <p id = "annotation-name"></p>
                <p className = "selectedText num" style = {{paddingTop:2}} id = 'annotation-value'></p>   
            </div>
            <div id = 'upset-tooltip' style = {{borderRadius: '4px'}} className = 'toolTip dropShadow'>
                <p id = "upset-name"></p>
                <p className = "selectedText num" style = {{paddingTop:2}} id = 'upset-value'></p>   
            </div>
            <div id = "graph-section-container">
                <div className = "selectionsContainer removeLeftShadow">
                    <div id = "year-filter">
                        <div className = {`btn flex ${yearSelection ? "filterActive" : ""}`} onMouseEnter = {()=>d3.select('#reset-year').style('color','#9597a6')} onMouseLeave = {()=>d3.select('#reset-year').style('color','#c9c9d5')} style = {{padding: '4px 8px 4px 8px',borderRadius: '4px',marginBottom:4}} onClick = {() => resetZoom()}>
                            <p className = 'filterLabel'>Time range</p>
                            <FontAwesomeIcon style = {{display: yearSelection ? 'block' : 'none'}} className = "resetFilter fa-solid icon" id = "reset-year" icon={faX} />
                        </div>
                        {rootExtent && document.getElementById('graph-section-container') && (
                            <YearFilter
                                minYear={rootExtent[0]}
                                maxYear={rootExtent[1]}
                                yearSelection={yearSelection}
                                setYearSelection={setYearSelection}
                                width={document.getElementById('graph-section-container').clientWidth - 120}
                                resetZoom = {resetZoom}
                            />
                        )}    
                    </div>
                    <div className = 'filters' id = "graph-filters">
                        <div className = "filterContainerVert" id = "gender-container" style = {{display: filterData.gender ? filterData.gender.length === 0 ? 'none' : 'flex' : 'none'}}>
                            <div className = {`btn flex ${!graphFilter.gender.includes(-1) ? "filterActive" : ""}`} onMouseEnter = {()=>d3.select('#reset-gender').style('color','#9597a6')} onMouseLeave = {()=>d3.select('#reset-gender').style('color','#c9c9d5')} style = {{padding: '4px 8px 4px 8px',borderRadius: '4px',marginBottom:4}}  
                                onClick = {() => {
                                    setGraphFilter(prev => ({
                                        ...prev,
                                        gender: [-1]
                                }));}}
                            >
                                <p className = 'filterLabel'>Sex</p>
                                <FontAwesomeIcon style = {{display: !graphFilter.gender.includes(-1) ? 'block' : 'none'}} className = "resetFilter fa-solid icon" id = "reset-gender" icon={faX} />    
                            </div>
                            <div className = "filterFlex">
                                <div className = "filter-viz" id = "gender-viz"><svg id = "gender-svg"></svg></div>
                                <div className = "flex" id = "gender-labels" style = {{marginTop:2}} ></div>
                            </div>
                        </div>

                        <div className = "filterContainerVert" id = "age-container" style = {{display: filterData.age ? filterData.age.length === 0 ? 'none' : 'flex' : 'none'}}>
                            <div className = {`btn flex ${!graphFilter.age.includes(-1) ? "filterActive" : ""}`} onMouseEnter = {()=>d3.select('#reset-age').style('color','#9597a6')} onMouseLeave = {()=>d3.select('#reset-age').style('color','#c9c9d5')} style = {{padding: '4px 8px 4px 8px',borderRadius: '4px',marginBottom:4}}  
                                onClick = {() => {
                                    setGraphFilter(prev => ({
                                        ...prev,
                                        age: [-1]
                                }));}}
                            >
                                <p className = 'filterLabel'>Age</p>
                                <FontAwesomeIcon style = {{display: !graphFilter.age.includes(-1) ? 'block' : 'none'}} className = "resetFilter fa-solid icon" id = "reset-age" icon={faX} />    
                            </div>
                            <div className = "filterFlex btn" id = "age-filter" onMouseDown = {(e) => ageBrush(e,'down')} onMouseUp = {(e) => ageBrush(e,'up')} onMouseMove = {(e) => ageBrush(e,'move')}>
                                <div className = "filter-viz" id = "age-viz"></div>
                                <div className = "flex" id = "age-labels" style = {{marginTop:2}}></div>
                            </div>
                        </div> 

                        <div className = "filterContainerVert" id = "source-container" style = {{display: filterData.source ? filterData.source.length === 0 ? 'none' : 'flex' : 'none',borderRight:'none'}}>
                            <div className = {`btn flex ${!graphFilter.source.includes(-1) ? "filterActive" : ""}`} onMouseEnter = {()=>d3.select('#reset-source').style('color','#9597a6')} onMouseLeave = {()=>d3.select('#reset-source').style('color','#c9c9d5')} style = {{padding: '4px 8px 4px 8px',borderRadius: '4px',marginBottom:4}}  
                                onClick = {() => {
                                    setGraphFilter(prev => ({
                                        ...prev,
                                        source: [-1]
                                }));}}
                            >
                                <p className = 'filterLabel'>Visit type</p>
                                <FontAwesomeIcon style = {{display: !graphFilter.source.includes(-1) ? 'block' : 'none'}} className = "resetFilter fa-solid icon" id = "reset-source" icon={faX} />    
                            </div>
                            <div className = "filterFlex" style = {{alignItems:'flex-start'}}>
                                <div className = "filter-viz filterFlex" id = "source-viz" style = {{alignItems:'flex-start'}}></div>
                                <div className = 'dropdownContainer' id = "source-collapsed" style = {{visibility:'hidden',height:0}}>
                                    <div className = "dropdownHeader btn" id = "header-sources" 
                                        onClick = {() => {
                                            if (d3.select('#open-sources').style('display') === 'block') {
                                                d3.select('#open-sources').style('display', 'none')
                                                d3.select('#close-sources').style('display', 'block') 
                                                d3.select('#dropdown-sources').style('visibility','visible')
                                            } else {
                                                d3.select('#open-sources').style('display', 'block')
                                                d3.select('#close-sources').style('display', 'none')  
                                                d3.select('#dropdown-sources').style('visibility','hidden')
                                            }
                                        }}>
                                        <div className = "dropdownTitle dropdownTitleScrollable" id = 'source-selections'></div>
                                        <FontAwesomeIcon className = "dropBtn icon" id = 'open-sources' icon={faCaretDown} style = {{display:'block'}}/>
                                        <FontAwesomeIcon className = "dropBtn icon" id = 'close-sources' icon={faCaretUp} style = {{display:'none'}}/>     
                                    </div>   
                                    <div className = "dropdownContent dropShadow" id = "dropdown-sources" style = {{left:2}}></div> 
                                </div>
                            </div>
                        </div> 

                        <div className = 'flex btn' id = 'open-btn' style = {{display:'none',position:'absolute',right:'0.75em',top:108}} 
                            onClick = {() => {
                                d3.selectAll('.filter-viz').style('display', 'flex')
                                d3.select('#source-collapsed').style('visibility','hidden').style("height",0)
                                d3.select('#open-btn').style('display', 'none')
                                d3.select('#close-btn').style('display', 'flex')
                                setOpenFilters(true)
                            }}>
                            <p className = "textBtn" style = {{paddingRight:8}}>Expand filters</p>
                            <FontAwesomeIcon className = "iconLg" icon={faCaretDown} style = {{marginBottom:2}}/>    
                        </div>
                        <div className = 'flex btn' id = 'close-btn' style = {{display:'flex',position:'absolute',right:'0.75em',top:108}} 
                            onClick = {() => {
                                d3.selectAll('.filter-viz').style('display', 'none')
                                d3.select('#source-collapsed').style('visibility','visible').style('height','auto')
                                d3.select('#open-btn').style('display', 'flex')
                                d3.select('#close-btn').style('display', 'none')
                                setOpenFilters(false)
                            }}>
                            <p className = 'textBtn' style = {{paddingRight:8}}>Collapse filters</p>
                            <FontAwesomeIcon className = "iconLg" icon={faCaretUp} style = {{marginTop:2,opacity:1}}/>   
                        </div>
                    </div>     
                </div>
                <div className = 'flex' id = 'graphContainer' style = {{position: 'relative',flexDirection:'column'}}>
                    {/* <div className = 'toggle toggleSm' id = "viz-toggle" style = {{marginTop: '1em',display: countType === 'person' ? 'flex' : 'none'}}>
                        <div className = 'mainBtn slider' id='slider-viz'>''</div>
                        <div className = 'btn toggle-itm' id = 'upset-toggle' onClick={() => {setPersonVizType('upset');moveSlider(0,100,'viz') }} style = {{fontWeight:personVizType === 'upset' ? 500 : 400,color:personVizType === 'upset' ? '#36126d' : '#9597a6'}}>Intersections</div>
                        <div className = 'btn toggle-itm' id = 'prevalence-toggle' onClick={() => {setPersonVizType('prevalence');moveSlider(1,100,'viz') }} style = {{fontWeight:personVizType === 'prevalence' ? 500 : 400,color:personVizType === 'prevalence' ? '#36126d' : '#9597a6'}}>Prevalence</div>
                        <div className = 'btn toggle-itm' id = 'incidence-toggle' onClick={() => {setPersonVizType('incidence');moveSlider(2,100,'viz') }} style = {{fontWeight:personVizType === 'incidence' ? 500 : 400,color:personVizType === 'incidence' ? '#36126d' : '#9597a6'}}>Incidence</div>
                    </div>   */}
                    {(graphLoading) && 
                        <div id = 'graph-loading-container'>
                        <div className = "graphLoading">
                            <div id = "loading-animation" class="lds-grid" style = {{visibility: 'visible'}}><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
                            <p id = "graph-loading-text">{'Loading graph'}</p>
                        </div>
                    </div>}    
                    <div id = "graph-group" style = {{display: !graphLoading ? 'block' : 'none',position:'relative'}}>
                        <div id = "graph-subheader"><div className = "margin" id = "graph-labels"></div></div> 
                        <div id = "graph-container" ref={graphContainerRef} style = {{display: countType === 'record' || countType === 'prevalence' || countType === 'incidence' ? 'block' : 'none',position:'relative'}}>
                            <div className = 'flex' id = "rootline-container">
                                <div className = {`btn flex ${yearSelection ? "filterActive" : "selectedText"}`} onMouseEnter = {()=>d3.select('#reset-year-graph').style('color','#9597a6')} onMouseLeave = {()=>d3.select('#reset-year-graph').style('color','#c9c9d5')} style = {{padding: '4px 8px 4px 8px',borderRadius: '4px',marginBottom:4}} onClick = {() => resetZoom()}>
                                    <p className = 'filterLabel'>{extent && extent[0]+'-'+extent[1]}</p>
                                    <FontAwesomeIcon style = {{display: yearSelection ? 'block' : 'none'}} className = "resetFilter fa-solid icon" id = "reset-year-graph" icon={faX} />
                                </div>
                                <div className='flex' style = {{display: countType === 'record' ? 'flex' : 'none'}}>
                                    <div className = 'flex btn' style = {{pointerEvents:showRootLine ? 'all' : 'none'}} onMouseEnter={() => {setHovered(['rootline'])}} onMouseLeave={() => {setHovered([])}}>
                                        <img className = 'marginRightLg' id = "rootline-icon" style = {{opacity:showRootLine ? 1 : 0.3}} src={rootLineIcon} alt="root descendants line icon"/>
                                        <p className={`marginRight ${showRootLine ? 'selectedText' : ''}`} style = {{color:showRootLine ? '#36126d' : '#9597a6'}}>Total Descendant Counts</p>    
                                    </div>
                                    <label className="rootline-switch">
                                        <input
                                            type="checkbox"
                                            checked={showRootLine}
                                            onChange={() => setShowRootLine(prev => !prev)}
                                        />
                                        <span className="rootline-slider"></span>
                                    </label>
                                </div> 
                            </div>
                            <svg id = "graph">
                                <g className = "brush"></g>
                                <g className = "x-grid"></g>
                                <g className = "axis-grid"></g>
                                <g className = "x axis axis-grid num"></g>
                                <g className = "y axis num"></g>
                                <g className = "axis-base"></g>
                                <g id = "graph-stack"></g>
                                <g id = "graph-line"></g>
                                <circle id = "focus"></circle>
                            </svg>
                        </div> 
                        <div id="upset-container" ref={upsetContainerRef} style={{ display: countType === 'person' && !graphLoading ? 'block' : 'none', position: 'relative', overflow: 'hidden', width: '100%', height: '100%' }}>
                            {((upsetOverflowing || upsetZoomedOut) && (countType === 'person')) && (
                                <div className='btn greyBtn' 
                                    style = {{zIndex:2000,position:'absolute',top: 0, left: 0,marginTop:'1em'}}
                                    onClick={() => setUpsetZoomedOut(prev => !prev)}>
                                    {upsetZoomedOut ? 'Reset zoom' : 'Zoom to fit'}
                                </div>
                            )}  
                            <div
                                id="upset-plot-wrapper"
                                ref={upsetWrapperRef}
                                style={{ display: 'flex', alignItems: 'flex-start', transformOrigin: 'top left' }}
                            >
                                <div id="upset-left-panel" style={{ flex: '0 0 auto' }}>
                                    <svg id="upset-left-svg">
                                        <g id="upset-left-content">
                                            {/* <g id="y-axis-layer"></g> */}
                                            <g id="sets-layer"></g>
                                        </g>
                                    </svg>
                                </div>

                                <div
                                    id="upset-right-panel"
                                    ref={upsetScrollRef}
                                    onScroll={updateUpsetScrollHints}
                                    style={{ flex: '0 0 auto', overflowY: 'hidden' }}
                                >
                                    <svg id="upset-right-svg">
                                        <g id="upset-right-content">
                                            <g id="upsets-layer"></g>
                                            <g id="types-layer"></g>
                                        </g>
                                    </svg>
                                </div>
                            </div>

                            {/* scroll affordance */}
                            <div
                                style={{
                                    display: showRightHint ? 'block' : 'none',
                                    position: 'absolute', top: 0, right: 0, bottom: 0, width: 32,
                                    background: 'linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.95))',
                                    pointerEvents: 'none'
                                }}
                            />
                            <div
                                style={{
                                    display: showLeftHint ? 'block' : 'none',
                                    position: 'absolute', top: 0,
                                    left: upsetNaturalSizeRef.current?.leftWidth ?? 0,
                                    bottom: 0, width: 32,
                                    background: 'linear-gradient(to left, rgba(255,255,255,0), rgba(255,255,255,0.95))',
                                    pointerEvents: 'none'
                                }}
                            />
                        </div>   
                        <div id="histogram-container" style={{ display: countType === 'measurement' && !graphLoading ? 'block' : 'none', position: 'relative', overflow: 'visible', width: '100%', height: '100%' }}>
                            <svg id="histogram"></svg>
                        </div> 
                    </div> 
                </div>
            </div>  
        </div>    
    )
}

export default GraphSection;