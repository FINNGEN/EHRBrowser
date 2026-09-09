import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faLessThanEqual } from '@fortawesome/free-solid-svg-icons'
import { faCaretDown } from '@fortawesome/free-solid-svg-icons'
import { faCaretUp } from '@fortawesome/free-solid-svg-icons'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { faX } from '@fortawesome/free-solid-svg-icons'
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
    const ageData = props.ageData
    const genderData = props.genderData
    const sourceData = props.sourceData
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
    const upsetData = props.upsetData
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
    const graphContainerRef = useRef()
    const upsetContainerRef = useRef()
    const upsetWrapperRef = useRef(null)     // the flex row holding both panels
    const upsetScrollRef = useRef(null)      // the right, scrollable panel
    const upsetNaturalSizeRef = useRef(null) // natural (unscaled) plot dimensions
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

    // DRAWING
    // function createLinePattern(key, color) {
    //     const patternId = `pattern-${key}`
    //     const defs = d3.select('#graph').select("defs")
    //     const size = 4
    //     const patt = defs.append("pattern")
    //         .attr("id", patternId)
    //         .attr("patternUnits", "userSpaceOnUse")
    //         .attr("width", size)
    //         .attr("height", size)
    //     patt.append("path")
    //         .attr("d", `
    //             M0,${size} L${size},0
    //             M-${size/2},${size/2} L${size/2},-${size/2}
    //         `)
    //         .attr("stroke", color)
    //         .attr("stroke-width", 1.5)
    //         .attr("fill", "none")
    //     patt.append("path")
    //         .attr("d", `
    //             M0,${size*2} L${size*2},-0
    //             M-${size},${size} L${size},-${size}
    //         `)
    //         .attr("stroke", color)
    //         .attr("stroke-width", 1.5)
    //         .attr("fill", "none")
    //     return `url(#${patternId})`
    // }
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
    // function drawUpset() {

    //     d3.select('#sets-layer').selectAll('*').remove()
    //     d3.select('#upsets-layer').selectAll('*').remove()
    //     d3.select('#types-layer').selectAll('*').remove()
    //     const container = d3.select('#upset-container').node()

    //     const width = container.clientWidth
    //     const height = container.clientHeight

    //     // // 4:3 plot that fills the width
    //     // let plotWidth = width
    //     // let plotHeight = width * 3 / 4

    //     // // If that is too tall, scale the entire plot down
    //     // if (plotHeight > height) {
    //     //     plotHeight = height
    //     //     plotWidth = height * 4 / 3
    //     // }

    //     // // Center it
    //     // const plotLeft = (width - plotWidth) / 2
    //     // const plotTop = (height - plotHeight) / 2

    //     // // Scale relative to the original width
    //     // const plotScale = plotWidth / width

    //     const sortedData = [...upsetData].sort((a, b) => {
    //         const aSize = a.group.split('-').length
    //         const bSize = b.group.split('-').length

    //         // Single concepts first
    //         if (aSize === 1 && bSize > 1) return -1
    //         if (aSize > 1 && bSize === 1) return 1

    //         // Everything else sorted by descending count
    //         return b.person_counts - a.person_counts
    //     }).slice(0, 40)

    //     const sortedIndexMap = new Map(sortedData.map((d, i) => [d.group, i]))


    //     const upsets = sortedData.map(d => [
    //         d.group,
    //         d.person_counts
    //     ])

    //     const types = sortedData.map(d =>
    //         d.group.split('-')
    //     )

    //     const concepts = types
    //         .flat()
    //         .filter((e, n, l) => l.indexOf(e) === n)

    //     const setTotals = concepts.map(concept => ({
    //         concept,
    //         total: sortedData
    //             .filter(d => d.group.split('-').includes(concept))
    //             .reduce((sum, d) => sum + d.person_counts, 0)
    //     }))


    //     const maxSetTotal = d3.max(
    //         setTotals,
    //         d => d.total
    //     )

    //     const setWidth = 140
    //     const setGap = 25
    //     const yAxisGap = 15
    //     const labelWidth = d3.max(concepts.map(c => c.length)) * 5 + 15

    //     const margin = {
    //         top: 40,
    //         right: 40,
    //         bottom: 50,
    //         left: setWidth + labelWidth + setGap * 2 + yAxisGap
    //     }

    //     // const matrixRowHeight = 30
    //     // const matrixHeight = concepts.length * matrixRowHeight
    //     // const barHeight = height - matrixHeight - margin.top - margin.bottom

    //     // const matrixRowHeight = 30
    //     // const matrixHeight = concepts.length * matrixRowHeight

    //     // const barHeight =
    //     //     plotHeight -
    //     //     matrixHeight -
    //     //     margin.top -
    //     //     margin.bottom

    //     const targetPlotHeight = width * 3 / 4

    //     const matrixRowHeight = 30
    //     const matrixHeight = concepts.length * matrixRowHeight

    //     const barHeight = Math.max(
    //         100,
    //         targetPlotHeight -
    //             matrixHeight -
    //             margin.top -
    //             margin.bottom
    //     )

    //     d3.select('#upset-svg')
    //         .attr('width', width)
    //         .attr('height', height)

    //     // Drawing bars
    //     const setXScale = d3.scaleLinear()
    //         .domain([0, maxSetTotal])
    //         .range([0, setWidth])

    //     // Drawing axis
    //     const setXAxisScale = d3.scaleLinear()
    //         .domain([maxSetTotal, 0])
    //         .range([0, setWidth])

    //     const setXAxis = d3.axisBottom(setXAxisScale)
    //         .ticks(4)
    //         .tickFormat(d3.format(','))

    //     const setYScale = d3.scaleBand()
    //         .domain(concepts)
    //         .range([0, matrixHeight])
    //         .padding(0.2)


    //     d3.select('#upsets-layer')
    //         .attr(
    //             'transform',
    //             `translate(${margin.left},${margin.top})`
    //         )

    //     d3.select('#types-layer')
    //         .attr(
    //             'transform',
    //             `translate(${margin.left},${margin.top + barHeight})`
    //         )

    //     d3.select('#sets-layer')
    //         .attr(
    //             'transform',
    //             `translate(
    //                 ${margin.left - setWidth - labelWidth - setGap},
    //                 ${margin.top + barHeight}
    //             )`
    //         )

    //     d3.select('#sets-layer')
    //         .selectAll('.set-bar')
    //         .data(setTotals, d => d.concept)
    //         .join('rect')
    //         .classed('set-bar', true)
    //         .attr('x', d => setWidth - setXScale(d.total))
    //         .attr(
    //             'y',
    //             d => setYScale(d.concept)
    //         )
    //         .attr(
    //             'width',
    //             d => setXScale(d.total)
    //         )
    //         .attr(
    //             'height',
    //             setYScale.bandwidth()
    //         )
    //         .attr('fill', d => colorList[parseInt(d.concept.replace(/\D/g, ""))])

    //     d3.select('#sets-layer')
    //         .selectAll('.set-label')
    //         .data(setTotals, d => d.concept)
    //         .join('text')
    //         .classed('set-label num', true)
    //         .attr('x', setWidth + labelWidth)
    //         .attr(
    //             'y',
    //             d => setYScale(d.concept) +
    //                 setYScale.bandwidth() / 2
    //         )
    //         .attr('text-anchor', 'end')
    //         .attr('dominant-baseline', 'middle')
    //         .text(d => d.concept)

    //     d3.select('#sets-layer')
    //         .selectAll('.set-x-axis')
    //         .data([null])
    //         .join('g')
    //         .classed('set-x-axis num', true)
    //         .attr(
    //             'transform',
    //             `translate(0,${matrixHeight + 5})`
    //         )
    //         .call(setXAxis)

    //     /*
    //     * X scale
    //     */
    //     const columnWidth = 30
    //     const columnGap = 10

    //     const totalColumnWidth =
    //         upsets.length * columnWidth +
    //         (upsets.length - 1) * columnGap

    //     const xScale = d3.scaleBand()
    //         .domain(d3.range(upsets.length))
    //         .range([yAxisGap, totalColumnWidth])
    //         .padding(0)


    //     /*
    //     * Y scale for bars
    //     */
    //     const maxValue = d3.max(upsets, d => d[1])

    //     const yScale = d3.scaleLinear()
    //         .domain([0, maxValue])
    //         .range([barHeight, 0])

    //     const yAxis = d3.axisLeft(yScale)
    //         .ticks(5)
    //         .tickFormat(d3.format(','))


    //     /*
    //     * Bars
    //     */

    //     d3.select('#upsets-layer')
    //         .selectAll('.y-axis')
    //         .data([null])
    //         .join('g')
    //         .classed('y-axis num', true)
    //         .call(yAxis)

    //     d3.select('#upsets-layer')
    //         .selectAll('.upset-count')
    //         .data(sortedData, d => d.group)
    //         .join('text')
    //         .classed('upset-count num', true)
    //         .attr('x', (d, i) =>
    //             xScale(i) + columnWidth / 2
    //         )
    //         .attr('y', d =>
    //             yScale(d.person_counts) - 8
    //         )
    //         .attr('text-anchor', 'middle')
    //         .text(d => abbreviateNumber(d.person_counts))
    //         .style('font-size','8px')

    //     const upsets_g = d3.select('#upsets-layer')
    //         .selectAll('.upsets')
    //         .data(upsets, d => d[0])
    //         .join('g')
    //         .classed('upsets', true)


    //    upsets_g.selectAll('rect')
    //         .data(d => [d])
    //         .join('rect')
    //         .attr('x', (d, i, nodes) => {
    //             const parent = d3.select(nodes[i].parentNode).datum()
    //             return xScale(upsets.indexOf(parent))
    //         })
    //         .attr('y', d => yScale(d[1]))
    //         .attr('width', columnWidth)
    //         .attr('height', d => barHeight - yScale(d[1]))
    //         .attr('fill', d => !d[0].includes('-') ? colorList[parseInt(d[0].replace(/\D/g, ""))] : '#b2b2b2')



    //     const matrixData = sortedData.flatMap(d =>
    //         concepts.map(concept => ({
    //             group: d.group,
    //             concept,
    //             active: d.group.split('-').includes(concept)
    //         }))
    //     )

    //     d3.select('#types-layer')
    //         .selectAll('.matrix-dot')
    //         .data(
    //             matrixData,
    //             d => `${d.group}-${d.concept}`
    //         )
    //         .join('circle')
    //         .classed('matrix-dot', true)
    //         .attr(
    //             'cx',
    //             d => {
    //                 const index = sortedIndexMap.get(d.group)

    //                 return xScale(index) +
    //                     columnWidth / 2
    //             }
    //         )
    //         .attr(
    //             'cy',
    //             d =>
    //                 setYScale(d.concept) +
    //                 setYScale.bandwidth() / 2
    //         )
    //         .attr('r', 6)
    //         .attr('fill', d => colorList[parseInt(d.concept.replace(/\D/g, ""))])
    //         .attr(
    //             'opacity',
    //             d => d.active ? 1 : 0.15
    //         )
        
    //     const intersectionLines = sortedData
    //         .filter(d => d.group.split('-').length > 1)
    //         .map(d => {
    //             const activeConcepts = d.group.split('-')

    //             return {
    //                 group: d.group,
    //                 y1:
    //                     setYScale(activeConcepts[0]) +
    //                     setYScale.bandwidth() / 2,
    //                 y2:
    //                     setYScale(activeConcepts[activeConcepts.length - 1]) +
    //                     setYScale.bandwidth() / 2
    //             }
    //         })

    //     d3.select('#types-layer')
    //         .selectAll('.intersection-line')
    //         .data(
    //             intersectionLines,
    //             d => d.group
    //         )
    //         .join('line')
    //         .classed('intersection-line', true)
    //         .attr('x1', d => {

    //             return xScale(sortedIndexMap.get(d.group)) +
    //                 columnWidth / 2
    //         })
    //         .attr('x2', d => {

    //             return xScale(sortedIndexMap.get(d.group)) +
    //                 columnWidth / 2
    //         })
    //         .attr('y1', d => d.y1)
    //         .attr('y2', d => d.y2)
    //         .attr('stroke', 'black')
    //         .attr('stroke-width', 2)
    //         .attr('opacity', 0.5)

    //     const content = d3.select('#upset-content').node()
    //     const bbox = content.getBBox()

    //     const availableWidth = width
    //     const availableHeight = height

    //     // Scale so the entire actual plot fits in the container
    //     const scaleX = availableWidth / bbox.width
    //     const scaleY = availableHeight / bbox.height

    //     const contentScale = Math.min(scaleX, scaleY, 1)

    //     // Actual scaled dimensions
    //     const scaledWidth = bbox.width * contentScale
    //     const scaledHeight = bbox.height * contentScale

    //     // Center the entire plot
    //     const translateX = (width - scaledWidth) / 2 - bbox.x * contentScale
    //     const translateY = (height - scaledHeight) / 2 - bbox.y * contentScale

    //     d3.select('#upset-content')
    //         .attr(
    //             'transform',
    //             `translate(${translateX},${translateY}) scale(${contentScale})`
    //         )

    //     // const bbox = d3.select('#upset-content')
    //     //     .node()
    //     //     .getBBox()

    //     // const contentScale = width / bbox.width

    //     // d3.select('#upset-content')
    //     //     .attr(
    //     //         'transform',
    //     //         `translate(${(width - bbox.width * contentScale) / 2},${plotTop}) scale(${contentScale})`
    //     //     )

    //     // const bbox = d3.select('#upset-content')
    //     //     .node()
    //     //     .getBBox()

    //     // const contentScale = Math.min(
    //     //     1,
    //     //     width / bbox.width
    //     // )

    //     // d3.select('#upset-content')
    //     //     .attr(
    //     //         'transform',
    //     //         `scale(${contentScale})`
    //     //     )
    // }
    // draw line chart
    
    // function drawUpset() {
    //     d3.select('#sets-layer').selectAll('*').remove()
    //     d3.select('#upsets-layer').selectAll('*').remove()
    //     d3.select('#types-layer').selectAll('*').remove()
    //     d3.select('#y-axis-layer').selectAll('*').remove()

    //     const sortedData = [...upsetData].sort((a, b) => {
    //         const aSize = a.group.split('-').length
    //         const bSize = b.group.split('-').length
    //         if (aSize === 1 && bSize > 1) return -1
    //         if (aSize > 1 && bSize === 1) return 1
    //         return b.person_counts - a.person_counts
    //     }).slice(0, 40)

    //     const sortedIndexMap = new Map(sortedData.map((d, i) => [d.group, i]))
    //     const upsets = sortedData.map(d => [d.group, d.person_counts])
    //     const concepts = sortedData.flatMap(d => d.group.split('-')).filter((e, n, l) => l.indexOf(e) === n)

    //     const setTotals = concepts.map(concept => ({
    //         concept,
    //         total: sortedData
    //             .filter(d => d.group.split('-').includes(concept))
    //             .reduce((sum, d) => sum + d.person_counts, 0)
    //     }))
    //     const maxSetTotal = d3.max(setTotals, d => d.total)

    //     // ---- fixed, legible geometry (no longer derived from container width) ----
    //     const setWidth = 140
    //     const setGap = 25
    //     const yAxisGap = 15
    //     const labelWidth = d3.max(concepts.map(c => c.length)) * 5 + 15
    //     const matrixRowHeight = 30
    //     const columnWidth = 30
    //     const columnGap = 10
    //     const barHeight = 260

    //     const margin = {
    //         top: 40, right: 40, bottom: 50,
    //         left: setWidth + labelWidth + setGap * 2 + yAxisGap
    //     }
    //     const matrixHeight = concepts.length * matrixRowHeight
    //     const totalHeight = margin.top + barHeight + matrixHeight + margin.bottom
    //     const leftPanelWidth = margin.left

    //     const totalColumnWidth = upsets.length * columnWidth + (upsets.length - 1) * columnGap
    //     const rightContentWidth = yAxisGap + totalColumnWidth + margin.right

    //     d3.select('#upset-left-svg').attr('width', leftPanelWidth).attr('height', totalHeight)
    //     d3.select('#upset-right-svg').attr('width', rightContentWidth).attr('height', totalHeight)

    //     // ---- scales ----
    //     const setXScale = d3.scaleLinear().domain([0, maxSetTotal]).range([0, setWidth])
    //     const setXAxisScale = d3.scaleLinear().domain([maxSetTotal, 0]).range([0, setWidth])
    //     const setXAxis = d3.axisBottom(setXAxisScale).ticks(4).tickFormat(d3.format(','))
    //     const setYScale = d3.scaleBand().domain(concepts).range([0, matrixHeight]).padding(0.2)

    //     const xScale = d3.scaleBand()
    //         .domain(d3.range(upsets.length))
    //         .range([yAxisGap, totalColumnWidth])
    //         .padding(0)

    //     const maxValue = d3.max(upsets, d => d[1])
    //     const yScale = d3.scaleLinear().domain([0, maxValue]).range([barHeight, 0])
    //     const yAxis = d3.axisLeft(yScale).ticks(5).tickFormat(d3.format(','))

    //     // ---- position layers ----
    //     // y-axis sits at the right edge of the left panel, ticks extend leftward
    //     d3.select('#y-axis-layer')
    //         .attr('transform', `translate(${leftPanelWidth},${margin.top})`)
    //         .classed('y-axis num', true)
    //         .call(yAxis)

    //     d3.select('#sets-layer')
    //         .attr('transform', `translate(${setGap + yAxisGap},${margin.top + barHeight})`)

    //     d3.select('#upsets-layer').attr('transform', `translate(0,${margin.top})`)
    //     d3.select('#types-layer').attr('transform', `translate(0,${margin.top + barHeight})`)

    //     // ---- set totals (left panel) ----
    //     d3.select('#sets-layer').selectAll('.set-bar')
    //         .data(setTotals, d => d.concept)
    //         .join('rect')
    //         .classed('set-bar', true)
    //         .attr('x', d => setWidth - setXScale(d.total))
    //         .attr('y', d => setYScale(d.concept))
    //         .attr('width', d => setXScale(d.total))
    //         .attr('height', setYScale.bandwidth())
    //         .attr('fill', d => colorList[parseInt(d.concept.replace(/\D/g, ""))])

    //     d3.select('#sets-layer').selectAll('.set-label')
    //         .data(setTotals, d => d.concept)
    //         .join('text')
    //         .classed('set-label num', true)
    //         .attr('x', setWidth + labelWidth)
    //         .attr('y', d => setYScale(d.concept) + setYScale.bandwidth() / 2)
    //         .attr('text-anchor', 'end')
    //         .attr('dominant-baseline', 'middle')
    //         .text(d => d.concept)

    //     d3.select('#sets-layer').selectAll('.set-x-axis')
    //         .data([null])
    //         .join('g')
    //         .classed('set-x-axis num', true)
    //         .attr('transform', `translate(0,${matrixHeight + 5})`)
    //         .call(setXAxis)

    //     // ---- upset bars (right panel) ----
    //     d3.select('#upsets-layer').selectAll('.upset-count')
    //         .data(sortedData, d => d.group)
    //         .join('text')
    //         .classed('upset-count num', true)
    //         .attr('x', (d, i) => xScale(i) + columnWidth / 2)
    //         .attr('y', d => yScale(d.person_counts) - 8)
    //         .attr('text-anchor', 'middle')
    //         .text(d => abbreviateNumber(d.person_counts))
    //         .style('font-size', '8px')

    //     const upsets_g = d3.select('#upsets-layer').selectAll('.upsets')
    //         .data(upsets, d => d[0])
    //         .join('g')
    //         .classed('upsets', true)

    //     upsets_g.selectAll('rect')
    //         .data(d => [d])
    //         .join('rect')
    //         .attr('x', (d, i, nodes) => xScale(upsets.indexOf(d3.select(nodes[i].parentNode).datum())))
    //         .attr('y', d => yScale(d[1]))
    //         .attr('width', columnWidth)
    //         .attr('height', d => barHeight - yScale(d[1]))
    //         .attr('fill', d => !d[0].includes('-') ? colorList[parseInt(d[0].replace(/\D/g, ""))] : '#b2b2b2')

    //     // ---- matrix (right panel) ----
    //     const matrixData = sortedData.flatMap(d =>
    //         concepts.map(concept => ({ group: d.group, concept, active: d.group.split('-').includes(concept) }))
    //     )

    //     d3.select('#types-layer').selectAll('.matrix-dot')
    //         .data(matrixData, d => `${d.group}-${d.concept}`)
    //         .join('circle')
    //         .classed('matrix-dot', true)
    //         .attr('cx', d => xScale(sortedIndexMap.get(d.group)) + columnWidth / 2)
    //         .attr('cy', d => setYScale(d.concept) + setYScale.bandwidth() / 2)
    //         .attr('r', 6)
    //         .attr('fill', d => colorList[parseInt(d.concept.replace(/\D/g, ""))])
    //         .attr('opacity', d => d.active ? 1 : 0.15)

    //     const intersectionLines = sortedData
    //         .filter(d => d.group.split('-').length > 1)
    //         .map(d => {
    //             const c = d.group.split('-')
    //             return {
    //                 group: d.group,
    //                 y1: setYScale(c[0]) + setYScale.bandwidth() / 2,
    //                 y2: setYScale(c[c.length - 1]) + setYScale.bandwidth() / 2
    //             }
    //         })

    //     d3.select('#types-layer').selectAll('.intersection-line')
    //         .data(intersectionLines, d => d.group)
    //         .join('line')
    //         .classed('intersection-line', true)
    //         .attr('x1', d => xScale(sortedIndexMap.get(d.group)) + columnWidth / 2)
    //         .attr('x2', d => xScale(sortedIndexMap.get(d.group)) + columnWidth / 2)
    //         .attr('y1', d => d.y1)
    //         .attr('y2', d => d.y2)
    //         .attr('stroke', 'black')
    //         .attr('stroke-width', 2)
    //         .attr('opacity', 0.5)

    //     upsetNaturalSizeRef.current = {
    //         leftWidth: leftPanelWidth,
    //         rightWidth: rightContentWidth,
    //         totalWidth: leftPanelWidth + rightContentWidth,
    //         height: totalHeight
    //     }

    //     layoutUpset()
    // }

    function drawUpset() {
        if (!Array.isArray(upsetData) || upsetData.length === 0) return
        d3.select('#sets-layer').selectAll('*').remove()
        d3.select('#upsets-layer').selectAll('*').remove()
        d3.select('#types-layer').selectAll('*').remove()
        d3.select('#y-axis-layer').selectAll('*').remove()

        const sortedData = [...upsetData].sort((a, b) => {
            const aSize = a.group.split('-').length
            const bSize = b.group.split('-').length
            if (aSize === 1 && bSize > 1) return -1
            if (aSize > 1 && bSize === 1) return 1
            return b.person_counts - a.person_counts
        }).slice(0, 40)

        const sortedIndexMap = new Map(sortedData.map((d, i) => [d.group, i]))
        const upsets = sortedData.map(d => [d.group, d.person_counts])
        const concepts = sortedData.flatMap(d => d.group.split('-')).filter((e, n, l) => l.indexOf(e) === n)

        // ---- set totals, split into individual vs. intersection counts ----
        const setTotals = concepts.map(concept => {
            const individual = sortedData
                .filter(d => d.group === concept)
                .reduce((sum, d) => sum + d.person_counts, 0)
            const intersection = sortedData
                .filter(d => d.group !== concept && d.group.split('-').includes(concept))
                .reduce((sum, d) => sum + d.person_counts, 0)
            const code = getConceptInfo(parseInt(concept.replace(/\D/g, ""))).concept_code
            const name = parseInt(concept.replace(/\D/g, ""))
            const node = nodes.find(n => n.name === name)
            return { concept, name, code, node, individual, intersection, total: individual + intersection }
        })
        const maxSetTotal = d3.max(setTotals, d => d.total)

        console.log('setTotals', setTotals)
        
        // ---- fixed, legible WIDTH geometry ----
        const setWidth = 140
        const setGap = 5
        const yAxisGap = 0
        const labelWidth = d3.max(concepts.map(c => c.length)) * 5 + 15
        const columnWidth = 30
        const columnGap = 10

        const margin = {
            top: 40, right: 40, bottom: 50,
            left: setWidth + labelWidth + setGap * 2 + yAxisGap
        }

        // ---- HEIGHT geometry: adapt to container so nothing is ever cut off ----
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

        // ---- scales ----
        const setXScale = d3.scaleLinear().domain([0, maxSetTotal]).range([0, setWidth])
        const setYScale = d3.scaleBand().domain(concepts).range([0, matrixHeight]).padding(0.2)

        const xScale = d3.scaleBand()
            .domain(d3.range(upsets.length))
            .range([yAxisGap, totalColumnWidth])
            .padding(0)

        const maxValue = d3.max(upsets, d => d[1])
        const yScale = d3.scaleLinear().domain([0, maxValue]).range([barHeight, 0])

        // ---- position layers ----
        d3.select('#sets-layer')
            .attr('transform', `translate(${setGap + yAxisGap},${margin.top + barHeight})`)

        d3.select('#upsets-layer').attr('transform', `translate(0,${margin.top})`)
        d3.select('#types-layer').attr('transform', `translate(0,${margin.top + barHeight})`)

        // ---- set totals (left panel): individual + intersection segments ----
        const setSegments = setTotals.flatMap(d => {
            const individualWidth = setXScale(d.individual)
            const totalWidth = setXScale(d.total)
            return [
                {
                    concept: d.concept,
                    node: d.node,
                    type: 'individual',
                    x: setWidth - individualWidth,
                    width: individualWidth
                },
                {
                    concept: d.concept,
                    type: 'intersection',
                    x: setWidth - totalWidth,
                    width: totalWidth - individualWidth
                }
            ]
        })

        d3.select('#sets-layer').selectAll('.set-bar')
            .data(setSegments, d => `${d.concept}-${d.type}`)
            .join('rect')
            .classed('set-bar', true)
            .attr('x', d => d.x)
            .attr('y', d => setYScale(d.concept))
            .attr('width', d => Math.max(d.width, 0))
            .attr('height', setYScale.bandwidth())
            .attr('stroke-width',1)
            .attr('stroke', d => d.type === 'individual' ? d.node.color : '#c9c9d5')
            .attr('fill', d => d.type === 'individual' ? d.node.color : 'white')
            .on('mouseover',(e,d)=>{d.type === 'individual' ? showActionLabel('Individual counts', 'enter', e) : showActionLabel('Intersection counts', 'enter', e)})
            .on('mouseout',(e,d)=>{showActionLabel('', 'leave', e)})

        d3.select('#sets-layer').selectAll('.set-label')
            .data(setTotals, d => d.concept)
            .join('text')
            .classed('set-label num btn', true)
            .attr('x', setWidth + labelWidth)
            .attr('y', d => setYScale(d.concept) + setYScale.bandwidth() / 2)
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'middle')
            .text(d => d.code)
            .on('mouseover',(e,d)=>{
                setHovered([d.name])
                tooltipHover(d.node,'enter',e)
            })
            .on('mouseout',(e,d)=>{
                setHovered([])
                tooltipHover(d.node,'leave')
            })

        // ---- faint grey gridlines instead of a y-axis, drawn behind the bars ----
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

        // ---- upset bars (right panel) ----
        d3.select('#upsets-layer').selectAll('.upset-count')
            .data(sortedData, d => d.group)
            .join('text')
            .classed('upset-count num', true)
            .attr('x', (d, i) => xScale(i) + columnWidth / 2)
            .attr('y', d => yScale(d.person_counts) - 8)
            .attr('text-anchor', 'middle')
            .text(d => abbreviateNumber(d.person_counts))
            .style('font-size', '8px')

        const upsets_g = d3.select('#upsets-layer').selectAll('.upsets')
            .data(upsets, d => d[0])
            .join('g')
            .classed('upsets', true)

        upsets_g.selectAll('rect')
            .data(d => [d])
            .join('rect')
            .attr('x', (d, i, nodes) => xScale(upsets.indexOf(d3.select(nodes[i].parentNode).datum())))
            .attr('y', d => yScale(d[1]))
            .attr('width', columnWidth)
            .attr('height', d => barHeight - yScale(d[1]))
            .attr('stroke', d => !d[0].includes('-') ? colorList[parseInt(d[0].replace(/\D/g, ""))] : '#c9c9d5')
            .attr('stroke-width',1)
            .attr('fill', d => !d[0].includes('-') ? colorList[parseInt(d[0].replace(/\D/g, ""))] : 'white')

        // ---- matrix (right panel) ----
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
                return {
                    group: d.group,
                    y1: setYScale(c[0]) + setYScale.bandwidth() / 2,
                    y2: setYScale(c[c.length - 1]) + setYScale.bandwidth() / 2
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
            .attr('stroke', 'black')
            .attr('stroke-width', 2)
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

        if (upsetZoomedOut) {
            const scale = Math.min(
                containerWidth / natural.totalWidth,
                containerHeight / natural.height,
                1
            )
            wrapper.style.transform = `scale(${scale})`
            scrollPanel.style.overflowX = 'hidden'
            scrollPanel.style.width = `${natural.rightWidth}px`
            scrollPanel.scrollLeft = 0
        } else {
            wrapper.style.transform = 'scale(1)'
            const availableRightWidth = Math.max(containerWidth - natural.leftWidth, 0)
            // 'scroll' (not 'auto') so the track renders immediately, before any interaction
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

    function drawGraph(rollup, scaleX, scaleY) {
        const selectedConceptMap = new Map(selectedConcepts.map(c => [c.name, c]))
        function highestPoint(d) {
            return d[1].reduce((best, p) => {
                return scaleY(+p[2]) < scaleY(+best[2]) ? p : best
            })
        }
        // draw stacked area
        function updateStack(stackedData) {
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
                        if (!getConceptInfo(d.key).standard_concept || (relationship === 'mappings' && selectedConceptMap.get(d.key).leaf)) {
                            const url = createLinePattern(d.key, colorList[d.key])
                            return url 
                        } else return colorList[d.key]
                    })
                    .style("transition", "0.5s all")
                    .transition()
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
                    .attr("d", d3.area()
                        .x((d,i) => scaleX(d.data.year))
                        .y0(d => scaleY(d[0]))
                        .y1(d => scaleY(d[1]))
                    )
            },update => {
                update.select('.area-path')
                    .transition()
                    .attr('opacity', d => hovered.length > 0 && !hovered.includes(d.key) ? 0.2 : 1)
                    .attr("d", d3.area()
                        .x((d,i) => scaleX(d.data.year))
                        .y0(d => scaleY(d[0]))
                        .y1(d => scaleY(d[1]))
                    )
                    .attr('fill', d => {
                        if (!getConceptInfo(d.key).standard_concept || (relationship === 'mappings' && selectedConceptMap.get(d.key).leaf)) {
                            const url = createLinePattern(d.key, colorList[d.key])
                            return url 
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
                    .transition()
                    .attr("d", d3.area()
                        .x((d,i) => scaleX(d.data.year))
                        .y0(d => scaleY(d[0]))
                        .y1(d => scaleY(d[1]))
                    )
            },exit => exit.remove())
        }
        // draw root descendant count line *** add label ***
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
        const stackedData = d3.stack()
            .keys(selectedConcepts.map(c => c.name))
            (rollup)  
        updateStack(stackedData)  
        if (showRootLine) updateRootLine()
        else d3.select('#graph-line').selectAll('.lines').remove()
        d3.select("#graph-viz").raise()
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
            .attr('stroke','#36126d')
            .attr('stroke-width',1)
            .style("stroke-dasharray", ("5, 5"))
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
    // get graph (this doesn't always need to be re-drawn)
    function getGraph(rollup, width, height, ticks) {
        // x and y scales
        let maxRollup = d3.max(rollup, obj => Object.entries(obj).reduce((sum, [key, val]) => key !== 'year' ? sum + val : sum, 0))
        let maxRootLine = d3.max(rootLine, d => d[1])
        let maxY = rollup.length > 0 ? showRootLine ? maxRollup > maxRootLine ? maxRollup : maxRootLine : maxRollup : maxRootLine
        let scaleX = d3.scaleLinear().domain(extent).range([0, width])
        let scaleY = d3.scaleLinear().domain([0, maxY*1.05]).range([height, 0])
        // grid lines
        const xAxisGrid = d3.axisBottom(scaleX).tickSize(-height).tickFormat('').ticks(ticks.one).tickSizeOuter(0)
        const yAxisGrid = d3.axisLeft(scaleY).tickSize(-width).tickFormat('').ticks(5).tickSizeOuter(0)
        d3.select("#graph").select(".x-grid")
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxisGrid)
        d3.select("#graph").select(".axis-grid")
            .call(yAxisGrid)
        // axis lines
        d3.select("#graph").select(".x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(scaleX).tickSize(-height).ticks(ticks.two).tickFormat(d3.format("d")).tickSizeOuter(0).tickPadding(8))
        d3.select("#graph").select(".y")
            .call(d3.axisLeft(scaleY).ticks(5).tickSizeOuter(0))
        d3.select("#graph").select(".axis-base")
            .call(d3.axisTop(scaleX).tickFormat('').tickSize(-height).tickSizeOuter(0))
        const rightBorder = d3.select("#graph")
            .selectAll(".right-border")
            .data([null])
        rightBorder.join("rect")
            .attr("class", "right-border")
            .attr("x", width)
            .attr("y", 0)
            .attr("width", 0.75)
            .attr("height", height)
            .attr("fill", "#B8B8B8")
            .raise()
        // clip path
        // d3.select("#graph").append("defs").append("svg:clipPath")
        //     .attr("id", "clip")
        //     .append("svg:rect")
        //     .attr("width", width)
        //     .attr("height", height)
        //     .attr("x", 0)
        //     .attr("y", 0)
        //     .raise()
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
            .on("mousemove", handleMouseMove)
            .on("dblclick", resetZoom)
        drawAnnotations(scaleX,height)
        drawGraph(rollup, scaleX, scaleY)
    }
    // hover filter
    function filterHover(id,mode,type) {
        if (mode === 'enter') {
            if (type === 'source') d3.select('#btn-'+id).classed('vizHover',true)
            else {
                d3.select('#btn-'+id).classed('filterHover',true)
                d3.select('#geometry-'+id).classed('vizHover',true)
                d3.select('#viz-label-'+id).classed('labelHover',true)
            }
        } else {
            if (type === 'source') if (d3.select('#btn-' + id).classed('vizHover')) d3.select('#btn-'+id).classed('vizHover', false)
            if (type !== 'source') {
                if (d3.select('#btn-' + id).classed('filterHover')) d3.select('#btn-'+id).classed('filterHover', false)
                if (d3.select('#geometry-' + id).classed('vizHover')) d3.select('#geometry-'+id).classed('vizHover', false)    
                if (d3.select('#viz-label-' + id).classed('labelHover'))d3.select('#viz-label-'+id).classed('labelHover', false)  
            }
        }
    }
    // select filter
    function filterSelect(id,type) {
        if (type === 'age') {
            let ages = graphFilter.age
            if (!ages.includes(id)) ages.push(id)
            else {ages = ages.filter(age => age !== id)}
            setGraphFilter(prev => ({
                ...prev,
                age: ages
            })); 
        } 
        if (type === 'source') {
            let sources = graphFilter.source
            const allSources = sourceData.map(obj => obj.codes).flat().filter(s => s.sum > 0).map(s => s.id)
            if (!sources.includes(id) && !graphFilter.source.includes(-1)) sources.push(id)
            else {
                if (graphFilter.source.includes(-1)) sources = allSources.filter(source => source !== id)
                else sources = sources.filter(source => source !== id)
            }
            if (allSources.every(id => sources.includes(id))) sources = [-1]
            setGraphFilter(prev => ({
                ...prev,
                source: sources
            }));    
        }
        if (type === 'gender') {
            if (graphFilter.gender !== id) setGraphFilter(prev => ({
                ...prev,
                gender: id
            })); 
            else setGraphFilter(prev => ({
                ...prev,
                gender: -1
            }));   
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
                    if (!ages.includes(i)) ages.push(i)
                    else ages = ages.filter(age => age !== i)
                }
                setGraphFilter(prev => ({
                    ...prev,
                    age: ages
                })); 
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
                    if (!graphFilter.age.includes(i)) {
                        d3.select('#btn-'+i)
                            .classed('filterActiveDrag', true)
                            .classed('filterActiveRight', true)
                        // if (i !== 0) d3.select('#btn-'+i-1).classed('filterActiveRight', false)
                        d3.select('#geometry-'+i).classed('vizActive',true)   
                        d3.select('#viz-label-'+i).classed('labelHover',true) 
                    } else {
                        d3.select('#btn-'+i)
                            .classed('filterActiveDrag',false)
                            .classed('filterActiveRight', false)
                        d3.select('#geometry-'+i).classed('vizActive',false)
                        d3.select('#viz-label-'+i).classed('labelHover',false) 
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

    // close source dropdown
    // document.addEventListener('click', (e) => {
    //     if (document.getElementById('dropdown-sources')) {
    //         const sourceContainer = document.getElementById('source-collapsed')
    //         if (!sourceContainer.contains(e.target)) {
    //             d3.select('#open-sources').style('display', 'block')
    //             d3.select('#close-sources').style('display', 'none')  
    //             d3.select('#dropdown-sources').style('visibility','hidden') 
    //         } 
    //     }
    // })
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

    // filters viz
    useEffect(() => {
        if (genderData && sourceData && ageData) {
            if (genderData.length > 0 && ageData.length > 0 && sourceData.length > 0) {
                // gender
                const genders = [8507,8532]
                const width = 40
                const height = 40
                const piMargin = 5
                const radius = Math.min(width, height) 
                d3.select("#gender-svg")
                    .attr("width", width)
                    .attr("height", height)
                    .append('g')
                    .attr("transform", `translate(${width/2}, ${height/2 - piMargin}) rotate(180)`) 
                const pieData = d3.pie().value(d => d.sum).sort(null)(genderData)
                const arcGenerator = d3.arc()
                    .innerRadius(0)
                    .outerRadius(radius)
                d3.select('#gender-labels').selectAll('.gender').data(genderData, d => d.id)
                    .join(enter => {
                        enter.append('div')
                            .classed('gender btn flex filterBtn',true)
                            .classed('filterActive', (d) => graphFilter.gender === d.id ? true : false)
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
                            .classed('filterActive', (d) => graphFilter.gender === d.id ? true : false)
                            .on('mouseover',(e,d) => filterHover(d.id,'enter','gender'))
                            .on('mouseout',(e,d) => filterHover(d.id,'leave','gender'))
                            .on('click',(e,d) => filterSelect(d.id,'gender'))
                    })
                console.log('pie data',pieData)
                d3.select("#gender-svg").selectAll(".arc").data(pieData, d => d.data.id)
                    .join(enter => {
                        const container = enter.append('g')
                            .classed('arc',true)  
                        container.append('path')
                            .classed('arc-path btn viz',true)
                            .classed('vizActive', (d) => graphFilter.gender === d.data.id ? true : false)
                            .attr('id', d => 'geometry-'+d.data.id)
                            .attr("d", d => d.endAngle === d.startAngle ? null : arcGenerator(d))
                            .on("mouseover", (e,d) => filterHover(d.data.id, "enter",'gender'))
                            .on("mouseout", (e,d) => filterHover(d.data.id, "leave",'gender'))
                            .on("click", (e,d) => filterSelect(d.data.id, "gender"))
                            .attr("transform", `translate(${width/2}, ${height/2}) scale(0.5) rotate(180)`)
                            .style('fill', d => d.data.id === maxGender ? '#e4e4e4' : '#e8e8e8')
                        container.append('text')
                            .classed('arc-text vizLabel num',true)
                            .attr('id', d => 'viz-label-'+d.data.id)
                            .text(d => d.data.sum === 0 ? '' : abbreviateNumber(d.data.sum))
                            .attr("x", d => d.data.id === genders[0] ? -radius/2 : radius/2) 
                            .attr("y", radius/2 + piMargin) 
                            .attr('font-weight', d => graphFilter.gender === d.data.id ? 500 : 400)
                            .attr("text-anchor", d => d.data.id === genders[0] ? "end" : "start") 
                            .style('fill', d => graphFilter.gender === d.data.id ? '#36126d' : d.data.id === maxGender ? 'color-mix(in srgb, #808080, white 30%)' : 'color-mix(in srgb, #808080, white 50%)')
                            .attr("transform", `translate(${width/2}, ${height/2 - piMargin})`)
                    },update=>{
                        update.select('.arc-path')
                            .classed('vizActive', (d) => graphFilter.gender === d.data.id ? true : false)
                            .on("mouseover", (e,d) => filterHover(d.data.id, "enter",'gender'))
                            .on("mouseout", (e,d) => filterHover(d.data.id, "leave",'gender'))
                            .on("click", (e,d) => filterSelect(d.data.id, "gender"))
                            .transition()
                            .attr("d", d => d.endAngle === d.startAngle ? null : arcGenerator(d))
                            .style('fill', d => d.data.id === maxGender ? '#e4e4e4' : '#e8e8e8')
                        update.select('.arc-text')
                            .text(d => d.data.sum === 0 ? '' : abbreviateNumber(d.data.sum))
                            .attr("x", d => d.data.id === genders[0] ? -radius/2 : radius/2) 
                            .attr("y", radius/2 + piMargin) 
                            .attr("text-anchor", d => d.data.id === genders[0] ? "end" : "start") 
                            .attr('font-weight', d => graphFilter.gender === d.data.id ? 500 : 400)
                            .style('fill', d => graphFilter.gender === d.data.id ? '#36126d' : d.data.id === maxGender ? 'color-mix(in srgb, #808080, white 30%)' : 'color-mix(in srgb, #808080, white 50%)')
                    })
                // age
                const ageExtent = d3.extent(ageData.map(d => d.sum))
                const scaleHeight = d3.scaleLinear().domain([0,ageExtent[1]]).range([0,30])
                d3.select('#age-labels').selectAll('.age').data(ageData, d => d.id)
                    .join(enter => {
                        enter.append('div')
                            .classed('age btn flex filterBtn num',true)
                            .classed('filterActiveDrag', (d,i) => graphFilter.age.includes(d.id) ? true : false)
                            .classed('filterActiveRight',(d,i) => graphFilter.age.includes(d.id) && (i === ageData.length - 1 || !graphFilter.age.includes(i+1)) ? true : false)
                            .classed('edgeLeft', (d,i) => i === 0 ? true : false)
                            .classed('edgeRight', (d,i) => i === ageData.length - 1 ? true : false)
                            .attr('id',d => 'btn-'+d.id)
                            .html(d => d.id*10+'-'+(d.id*10+9))
                            .style('width','36px')  
                            .style('font-size','8px')                  
                            .on('mouseover',(e,d) => filterHover(d.id,'enter','age'))
                            .on('mouseout',(e,d) => filterHover(d.id,'leave','age'))
                            .on('click',(e,d) => filterSelect(d.id,'age'))
                    },update => {
                        update  
                            .classed('filterActiveDrag', (d,i) => graphFilter.age.includes(d.id) ? true : false)
                            .classed('filterActiveRight',(d,i) => graphFilter.age.includes(d.id) && (i === ageData.length - 1 || !graphFilter.age.includes(i+1)) ? true : false)
                            .classed('edgeLeft', (d,i) => i === 0 ? true : false)
                            .classed('edgeRight', (d,i) => i === ageData.length -1 ? true : false)
                            .on('mouseover',(e,d) => filterHover(d.id,'enter','age'))
                            .on('mouseout',(e,d) => filterHover(d.id,'leave','age'))
                            .on('click',(e,d) => filterSelect(d.id,'age'))
                    },exit => exit.remove())
                d3.select('#age-viz').selectAll('.age-geometry').data(ageData, d => d.id)
                    .join(enter => {
                        const container = enter.append('div')
                            .classed('age-geometry',true)
                            .style('display','flex')
                            .style('flex-direction','column')
                        container.append('p')
                            .classed('age-p vizLabel num',true)
                            .classed('labelHover', d => graphFilter.age.includes(d.id) ? true : false)
                            .attr('id',d=>'viz-label-'+d.id)
                            .style('color', d => graphFilter.age.includes(d.id) ? '#36126d' : ageExtent.includes(d.sum) ? 'color-mix(in srgb, #808080, white 30%)' : 'color-mix(in srgb, #808080, white 70%)')
                            .html(d => d.sum === 0 ? '' : abbreviateNumber(d.sum))
                        container.append('div')
                            .classed('age-rect btn viz',true)
                            .classed('vizActive',(d) => graphFilter.age.includes(d.id) ? true : false)
                            .attr('id', d => 'geometry-'+d.id)
                            .style('width', '42px')
                            .style('height', d => d.sum === 0 ? '0px' : scaleHeight(d.sum) + 'px')
                            .on('mouseover', (e,d) => filterHover(d.id, 'enter','age'))
                            .on('mouseout', (e,d) => filterHover(d.id, 'leave','age'))
                            .on('click', (e,d) => filterSelect(d.id, 'age'))
                    },update => {
                        update.select('.age-p')
                            .classed('labelHover', d => graphFilter.age.includes(d.id) ? true : false)
                            .style('color', d => graphFilter.age.includes(d.id) ? '#36126d' : ageExtent.includes(d.sum) ? 'color-mix(in srgb, #808080, white 30%)' : 'color-mix(in srgb, #808080, white 70%)')
                            .html(d => d.sum === 0 ? '' : abbreviateNumber(d.sum))
                        update.select('.age-rect')
                            .classed('vizActive',(d) => graphFilter.age.includes(d.id) ? true : false)
                            .on('mouseover', (e,d) => filterHover(d.id, 'enter','age'))
                            .on('mouseout', (e,d) => filterHover(d.id, 'leave','age'))
                            .on('click', (e,d) => filterSelect(d.id, 'age'))
                            .transition()    
                            .style('height', d => d.sum === 0 ? '0px' : scaleHeight(d.sum) + 'px')
                    })   
                // source viz
                const sourceWidth = document.getElementById("graph-filters").clientWidth - document.getElementById('gender-container').clientWidth - document.getElementById('age-container').clientWidth - 70
                document.getElementById("header-sources").style.maxWidth =  sourceWidth + 40 + 'px'
                const allSources = sourceData.map(d => d.codes).flat()
                const filteredSources = sourceData.map(obj => ({...obj,codes:obj.codes.filter(c => c.sum !== 0)})).filter(obj => obj.codes.length > 0)
                const categorySums = filteredSources.map(obj => d3.sum(obj.codes.map(c => c.sum)))
                const scaleWidth = d3.scaleLinear().domain([0,d3.extent(categorySums)[1]]).range([1,sourceWidth])
                d3.select('#dropdown-sources').selectAll('.source-section').data(filteredSources, d => d.key)
                    .join(enter => {
                        const category = enter.append('div')
                            .classed('source-section',true)
                            .style('width','100%')
                        const title = category.append('div')
                            .classed('flex',true)
                        title.append('p')
                            .html(d => d.key == 'Long.' ? 'Longitudinal' : d.key)
                        // title.append('p')
                        //     .classed('dropdown-category-btn',true)
                        //     .style('font-size','10px')
                        //     .style('cursor','pointer')
                        //     .style('color', color.textlightest)
                        //     .style('display', d => d3.sum(d.codes.map(c => c.sum)) === 0 ? 'none' : 'block')
                        //     .html(d => d.codes.filter(c => c.sum > 0).map(c => c.id).every(id => graphFilter.source.includes(id)) || graphFilter.source.includes(-1) ? 'Remove all' : 'Add all')
                        //     .on('click',(e,d) => {
                        //         let sources = graphFilter.source
                        //         const ids = d.codes.filter(c => c.sum > 0).map(c => c.id)
                        //         if (ids.every(id => graphFilter.source.includes(id))) {
                        //             sources = sources.filter(source => !ids.includes(source))
                        //         }
                        //         else {
                        //             if (graphFilter.source.includes(-1)) sources = allSources.filter(s => s.sum > 0).map(s => s.id).filter(id => !ids.includes(id))
                        //             else sources = [...graphFilter.source,...ids].filter((e,n,l) => l.indexOf(e) === n)
                        //         }
                        //         // if (sources.length === 0) sources = [-1]
                        //         setGraphFilter({gender:graphFilter.gender,age:graphFilter.age,source:sources})
                        //     })
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
                                    .style('color', d => graphFilter.source.includes(d.id) || (graphFilter.source.includes(-1) && d.sum > 0)? '#36125d' : '#808080')
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
                                    .style('color', d => graphFilter.source.includes(d.id) || (graphFilter.source.includes(-1) && d.sum > 0)? '#36125d' : '#808080')
                                    .html(d => d.code)
                            })      
                    },update => {
                        // update.selectAll('.dropdown-source-section-title')
                        //     .style('opacity', d => d3.sum(d.codes.map(c => c.sum)) === 0 ? 0.3 : 1)
                        //     .style('color', d => d.codes.filter(c => c.sum > 0).map(c => c.id).every(id => graphFilter.source.includes(id)) || graphFilter.source.includes(-1) ? color.text : color.textlight)
                        // update.selectAll('.dropdown-category-btn')
                        //     .style('display', d => d3.sum(d.codes.map(c => c.sum)) === 0 ? 'none' : 'block')
                        //     .html(d => d.codes.filter(c => c.sum > 0).map(c => c.id).every(id => graphFilter.source.includes(id)) || graphFilter.source.includes(-1) ? 'Remove all' : 'Add all')
                        //     .on('click',(e,d) => {
                        //         let sources = graphFilter.source
                        //         const ids = d.codes.filter(c => c.sum > 0).map(c => c.id)
                        //         if (ids.every(id => graphFilter.source.includes(id))) {
                        //             sources = sources.filter(source => !ids.includes(source))
                        //         }
                        //         else {
                        //             if (graphFilter.source.includes(-1)) sources = allSources.filter(s => s.sum > 0).map(s => s.id).filter(id => !ids.includes(id))
                        //             else sources = [...graphFilter.source,...ids].filter((e,n,l) => l.indexOf(e) === n)
                        //         }
                        //         setGraphFilter({gender:graphFilter.gender,age:graphFilter.age,source:sources})
                        //     })
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
                                    .style('color', d => graphFilter.source.includes(d.id) || (graphFilter.source.includes(-1) && d.sum > 0)? '#36125d' : '#808080')
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
                                    .style('color', d => graphFilter.source.includes(d.id) || (graphFilter.source.includes(-1) && d.sum > 0)? '#36125d' : '#808080')
                                    .html(d => d.code)
                            })      
                    })
                d3.select('#source-viz').selectAll('.category').data(filteredSources, d => d.key)
                    .join(enter => {
                        const category = enter.append('div')
                            .classed('category',true)
                            .style('margin','1px 0px 1px 0px')
                        const label = category.append('div')
                            .classed('flex',true)
                            .style("order",1)
                        label.append('p')
                            .classed('category-p btn',true)
                            .html(d => d.key)
                            .style('position','relative')
                            .style('padding','0px 3px 0px 5px')
                            .style('margin',0)
                            .style('font-weight', d => d.codes.map(c => c.id).every(id => graphFilter.source.includes(id)) ? 500 : 400)
                        const checkBox = label.append('div')
                            .classed('source-check-box checkMarkBox marginRight',true)
                            .style('width','12px')
                            .style('height','12px')
                            .style('border', d => d.codes.map(c => c.id).every(id => graphFilter.source.includes(id)) ? '1px solid #808080' : '1px solid #dadada')
                            .on('click',(e,d) => {
                                let sources = graphFilter.source
                                const ids = d.codes.map(c => c.id)
                                if (ids.every(id => graphFilter.source.includes(id))) {
                                    sources = sources.filter(source => !ids.includes(source))
                                    if (sources.length === 0) sources = [-1]
                                }
                                else {
                                    if (graphFilter.source.includes(-1)) sources = ids
                                    else sources = [...graphFilter.source,...ids].filter((e,n,l) => l.indexOf(e) === n)
                                }
                                setGraphFilter(prev => ({
                                    ...prev,
                                    source: sources
                                })); 
                            })
                        checkBox.append('i')
                            .classed('source-check-mark fa-solid fa-check',true)
                            .style('font-size','8px')
                            .style('display', d => d.codes.map(c => c.id).every(id => graphFilter.source.includes(id)) ? 'block' : 'none')
                        category.selectAll(".source-geometry").data(d => d.codes, d => d.key)
                            .join(enter => {
                                enter.append('div')
                                    .classed('source-geometry viz flex btn',true)
                                    .classed('vizActive', d => graphFilter.source.includes(d.id) ? true : false)
                                    .attr('id',d => 'btn-'+d.id)
                                    .html(d => {
                                        const max = scaleWidth(d.sum) / 5
                                        return max === 0 ? '' : d.code.length > max ? d.code.substring(0,max) : d.code
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
                                    .on('click',(e,d) => {
                                        let sources = graphFilter.source
                                        if (!sources.includes(d.id)) {
                                            if (graphFilter.source.includes(-1)) sources = [d.id]
                                            else sources.push(d.id)
                                        } else sources = sources.filter(source => source !== d.id)
                                        if (sources.length === 0) sources = [-1]
                                        setGraphFilter(prev => ({
                                            ...prev,
                                            source: sources
                                        }));     
                                    })
                            },update => {
                                update  
                                    .classed('vizActive', d => graphFilter.source.includes(d.id) ? true : false)
                                    .html(d => {
                                        const max = scaleWidth(d.sum) / 5
                                        return max === 0 ? '' : d.code.length > max ? d.code.substring(0,max) : d.code
                                    })
                                    .style('width',d => scaleWidth(d.sum) + 'px') 
                                    .on('mouseover',(e,d) => {
                                        filterTooltip(d,'enter',e)
                                        filterHover(d.id,'enter','source')
                                    })
                                    .on('mouseout',(e,d) => {
                                        filterTooltip(d,'leave',e)
                                        filterHover(d.id,'leave','source')
                                    })
                                    .on('click',(e,d) => {
                                        let sources = graphFilter.source
                                        if (!sources.includes(d.id)) {
                                            if (graphFilter.source.includes(-1)) sources = [d.id]
                                            else sources.push(d.id)
                                        } else sources = sources.filter(source => source !== d.id)
                                        if (sources.length === 0) sources = [-1]
                                        setGraphFilter(prev => ({
                                            ...prev,
                                            source: sources
                                        }));      
                                    })
                            })   
                    },update => {
                        update.selectAll('.category-p')
                            .style('font-weight', d => d.codes.map(c => c.id).every(id => graphFilter.source.includes(id)) ? 500 : 400)
                        update.selectAll('.source-check-box')
                            .style('border', d => d.codes.map(c => c.id).every(id => graphFilter.source.includes(id)) ? '1px solid #808080' : '1px solid #dadada')
                            .on('click',(e,d) => {
                                let sources = graphFilter.source
                                const ids = d.codes.map(c => c.id)
                                if (ids.every(id => graphFilter.source.includes(id))) {
                                    sources = sources.filter(source => !ids.includes(source))
                                    if (sources.length === 0) sources = [-1]
                                }
                                else {
                                    if (graphFilter.source.includes(-1)) sources = ids
                                    else sources = [...graphFilter.source,...ids].filter((e,n,l) => l.indexOf(e) === n)
                                }
                                setGraphFilter(prev => ({
                                    ...prev,
                                    source: sources
                                })); 
                            })
                        update.selectAll('.source-check-mark')
                            .style('display', d => d.codes.map(c => c.id).every(id => graphFilter.source.includes(id)) ? 'block' : 'none')
                        update.selectAll(".source-geometry").data(d => d.codes, d => d.key)
                            .join(enter => {
                                enter.append('div')
                                    .classed('source-geometry viz flex btn',true)
                                    .classed('vizActive', d => graphFilter.source.includes(d.id) ? true : false)
                                    .attr('id',d => 'btn-'+d.id)
                                    .html(d => {
                                        const max = scaleWidth(d.sum) / 5
                                        return max === 0 ? '' : d.code.length > max ? d.code.substring(0,max) : d.code
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
                                    .on('click',(e,d) => {
                                        let sources = graphFilter.source
                                        if (!sources.includes(d.id)) {
                                            if (graphFilter.source.includes(-1)) sources = [d.id]
                                            else sources.push(d.id)
                                        } else sources = sources.filter(source => source !== d.id)
                                        if (sources.length === 0) sources = [-1]
                                        setGraphFilter(prev => ({
                                            ...prev,
                                            source: sources
                                        }));     
                                    })
                            },update => {
                                update  
                                    .classed('vizActive', d => graphFilter.source.includes(d.id) ? true : false)
                                    .html(d => {
                                        const max = scaleWidth(d.sum) / 5
                                        return max === 0 ? '' : d.code.length > max ? d.code.substring(0,max) : d.code
                                    })
                                    .style('width',d => scaleWidth(d.sum) + 'px') 
                                    .on('mouseover',(e,d) => {
                                        filterTooltip(d,'enter',e)
                                        filterHover(d.id,'enter','source')
                                    })
                                    .on('mouseout',(e,d) => {
                                        filterTooltip(d,'leave',e)
                                        filterHover(d.id,'leave','source')
                                    })
                                    .on('click',(e,d) => {
                                        let sources = graphFilter.source
                                        if (!sources.includes(d.id)) {
                                            if (graphFilter.source.includes(-1)) sources = [d.id]
                                            else sources.push(d.id)
                                        } else sources = sources.filter(source => source !== d.id)
                                        if (sources.length === 0) sources = [-1]
                                        setGraphFilter(prev => ({
                                            ...prev,
                                            source: sources
                                        }));     
                                    })
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
                        setGraphFilter(prev => ({
                            ...prev,
                            source: sources
                        }))
                    })
                document.getElementById("header-sources").style.minWidth =  document.getElementById('dropdown-sources').clientWidth - 12 + 'px'
            } 
            // else {
            //     setLoading(true)
            // }
        }
    },[genderData,ageData,sourceData,graphSectionWidth])

    // update graph
    // CALL THIS LESS
    useEffect(() => {
        if (graphContainerRef.current && upsetContainerRef.current && extent) {
            console.log('draw graph')
            if (countType === 'record') {
                d3.select('#graph-group').style('display', 'block')
                d3.select('#upset-container').style('display', 'none')
            } else {
                d3.select('#upset-container').style('display', 'block')
                d3.select('#graph-group').style('display', 'none')
            }
            // calculate size (only for graph section width change?)
            const fullHeight = document.getElementById('graph-section-container').clientHeight 
            const filterHeight = document.getElementById('graph-filters').clientHeight + document.getElementById('year-filter').clientHeight
            const containerWidth = document.getElementById('graph-section').clientWidth
            if (containerWidth < window.innerWidth*0.4 || graphSectionWidth === '40vw') d3.select('#graph-filters').style('display','none')
            else d3.select('#graph-filters').style('display','flex')
            // record counts
            if (countType === 'record') {
                document.getElementById("graph-group").style.height = fullHeight - filterHeight - margin + 'px'
                const containerHeight = document.getElementById('graph-group').clientHeight*0.78
                document.getElementById("graph-labels").style.maxHeight = document.getElementById('graph-group').clientHeight*0.15 - margin + 'px'
                const width = containerWidth + (margin * 2)
                const height = containerHeight + (margin * 2)
                document.getElementById("graph-container").style.height = containerHeight + 'px'
                d3.select("#graph")
                    .attr("width", '94%')
                    .attr("height", '94%')
                    .attr("viewBox", `${-margin*3} ${margin/2} ${width} ${height}`)
                    .attr("preserveAspectRatio", "xMidYMid meet")
                d3.select("#clip rect")
                    .attr("width", width)
                    .attr("height", height)
                    .attr("viewBox", `${-margin*3} ${0} ${width} ${height}`)
                    .attr("preserveAspectRatio", "xMidYMid meet")
                    .append("g")
                    .attr("transform", `translate(${margin}, ${margin})`)
                d3.select("#clip rect")
                    .attr("width", width)
                    .attr("height", height)
                // graph ticks
                const ticks1 = ((extent[1]-extent[0])/(Math.round((extent[1]-extent[0])/10)))*Math.round((extent[1]-extent[0])/10)
                const ticks2 = width < 400 ? Math.round(width/60) : ticks1 < 10 || !ticks1 ? Math.round(extent[1]-extent[0]) : 10
                const ticks = {one:ticks1,two:ticks2}
                // draw graph
                getGraph(stackData, width, height, ticks)     
            } 
            // else if (countType === 'person' && upsetData) {
            //     // person counts
            //     document.getElementById("upset-container").style.height = fullHeight - filterHeight - margin + 'px'
            //     document.getElementById("upset-container").style.width = containerWidth - (margin*2) + 'px'
            //     if (upsetData.length > 0) {
            //         d3.select('#upset-container').style('display','block')
            //         drawUpset()
            //     }  
            //     else d3.select('#upset-container').style('display','none')
            // }
        }
    }, [countType,extent,stackData,graphSectionWidth,openFilters,showRootLine])

    useEffect(() => {
        // if (countType === 'record') {
        //     d3.select('#graph-group').style('display', 'block')
        //     d3.select('#upset-container').style('display', 'none')
        // } else {
        //     d3.select('#upset-container').style('display', 'block')
        //     d3.select('#graph-group').style('display', 'none')
        // }
        if (countType === 'person' && upsetData.length > 0) {
            const fullHeight = document.getElementById('graph-section-container').clientHeight 
            const filterHeight = document.getElementById('graph-filters').clientHeight + document.getElementById('year-filter').clientHeight
            const containerWidth = document.getElementById('graph-section').clientWidth
            document.getElementById("upset-container").style.height = fullHeight - filterHeight - margin + 'px'
            document.getElementById("upset-container").style.width = containerWidth - (margin*2) + 'px'
            drawUpset()
        }
    }, [upsetData, graphSectionWidth,openFilters])

    useEffect(() => {
        layoutUpset()
    }, [upsetZoomedOut])

    useEffect(() => {
        window.addEventListener('resize', drawUpset) // was layoutUpset
        return () => window.removeEventListener('resize', drawUpset)
    }, [])

    // update labels
    useEffect(()=> {
        const groups = d3.group(selectedConcepts, d => d.name)
        function updateLabels(groups) {
            d3.select('#graph-labels').selectAll('.labels').data(groups, d => d[0])
                .join(enter => {
                    const labels = enter.append('div')  
                        .classed('labels btn marginRight', true) 
                        .attr('id', d => 'label-' + d[0])
                        .style('background-color','white')
                        .style('box-shadow','0 0 0 1px rgba(0, 0, 0, 0.02),0 2px 10px rgba(0, 0, 0, 0.1)')
                        .style('border', d => rootConcepts.includes(d[0]) ? '1px solid #6a23d6' : 'none')
                        .style('border-radius', '20px')
                        .on('mouseover', (e, d) => {
                            const el = e.currentTarget
                            if (!rootConcepts.includes(d[0])) {
                                el.hoverLabelTimeout = setTimeout(() => {
                                    showActionLabel('Select concept', 'enter', e)
                                }, 1200)    
                            }
                            el.hoverStateTimeout = setTimeout(() => {
                                setHovered([d[0]])
                            }, 600)
                        })
                        .on('mouseout', (e, d) => {
                            const el = e.currentTarget
                            clearTimeout(el.hoverLabelTimeout)
                            clearTimeout(el.hoverStateTimeout)
                            if (!rootConcepts.includes(d[0])) showActionLabel('', 'leave', e)
                            setHovered([])
                        })
                        .on('click', (e,d) => {
                            const el = e.currentTarget
                            clearTimeout(el.hoverLabelTimeout)
                            clearTimeout(el.hoverStateTimeout)
                            if (!rootConcepts.includes(d[0])) {
                                showActionLabel('','leave')
                                showConfirmationPopup(d[0], 'enter', e)    
                            }
                        })
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
                    const text = labels.append("div")
                        .style('margin-bottom','1px')
                    text.append('tspan')
                        .classed('label-text selectedText marginRight', true)
                        .attr("id", d => "label-text-" + d[0])
                        .html(d => getConceptInfo(d[0]).concept_name)
                    text.append('tspan')
                        .classed('label-code marginRight num',true)
                        .attr("id", d => "label-vocab-" + d[0])
                        .style('font-weight',500)
                        .html(d => getConceptInfo(d[0]).concept_code)   
                    text.append('tspan')
                        .classed('label-vocab', true)
                        .attr("id", d => "label-vocab-" + d[0])
                        .html(d => getConceptInfo(d[0]).vocabulary_id)
                }, update => {
                    update
                        .style('border', d => rootConcepts.includes(d[0]) ? '1px solid #6a23d6' : 'none')
                        .on('mouseover', (e, d) => {
                            const el = e.currentTarget
                            if (!rootConcepts.includes(d[0])) {
                                el.hoverLabelTimeout = setTimeout(() => {
                                    showActionLabel('Select concept', 'enter', e)
                                }, 1200)    
                            }
                            el.hoverStateTimeout = setTimeout(() => {
                                setHovered([d[0]])
                            }, 600)
                        })
                        .on('mouseout', (e, d) => {
                            const el = e.currentTarget
                            clearTimeout(el.hoverLabelTimeout)
                            clearTimeout(el.hoverStateTimeout)
                            if (!rootConcepts.includes(d[0])) showActionLabel('', 'leave', e)
                            setHovered([])
                        })
                        .on('click', (e,d) => {
                            const el = e.currentTarget
                            clearTimeout(el.hoverLabelTimeout)
                            clearTimeout(el.hoverStateTimeout)
                            if (!rootConcepts.includes(d[0])) {
                                showActionLabel('','leave')
                                showConfirmationPopup(d[0], 'enter', e)    
                            }
                        })
                        .style('opacity', d => hovered.length > 0 && !hovered.includes(d[0]) ? 0.2 : 1)
                },exit => exit.remove())    
        }
        updateLabels(groups)
    },[selectedConcepts,selectedConcepts.length < 50 ? hovered : null])

    // cheap opacity-only update on hover — no redraw
    useEffect(() => {
        d3.selectAll('.area-path')
            .attr('opacity', d => hovered.length > 0 && !hovered.includes(d.key) ? 0.2 : 1)
    }, [hovered])

    // one-time setup, not tied to redraw deps
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
            <div id = "filter-tooltip" className = 'toolTip dropShadow'>
                <div className = 'selectedText' style = {{paddingBottom:1}} id = "filter-name"></div>
                <div className = 'num' id = "filter-value"></div>    
            </div>
            <div id = 'annotation-tooltip' className = 'toolTip dropShadow'>
                <p className = "selectedText num" style = {{paddingBottom:1}} id = 'annotation-value'></p>
                <p id = "annotation-name"></p>
            </div>
            <div id = "graph-section-container">
                <div className = "selectionsContainer removeLeftShadow">
                    <div id = "year-filter">
                        <div className = {`btn flex ${yearSelection ? "filterActive" : ""}`} onMouseEnter = {()=>d3.select('#reset-year').style('color','#9597a6')} onMouseLeave = {()=>d3.select('#reset-year').style('color','#c9c9d5')} style = {{padding: '4px 8px 4px 8px',borderRadius: '4px',marginBottom:4}} onClick = {() => resetZoom()}>
                            {/* <p className = 'filterLabel' style = {{fontWeight: yearSelection ? 500 : 400,opacity: yearSelection ? 1 : 0.7}}>{graphFilter.gender !== -1 ? 'Clear Time Range' : 'Time Range'}</p> */}
                            <p className = 'filterLabel'>Time range</p>
                            <FontAwesomeIcon style = {{display: yearSelection ? 'block' : 'none'}} className = "resetFilter fa-solid icon" id = "reset-year" icon={faX} />
                        </div>
                        {rootExtent && (
                            <YearFilter
                                minYear={rootExtent[0]}
                                maxYear={rootExtent[1]}
                                yearSelection={yearSelection}
                                setYearSelection={setYearSelection}
                                width={document.getElementById('graph-section-container').clientWidth - 120}
                            />
                        )}    
                    </div>
                    <div className = 'filters' id = "graph-filters">
                        <div className = "filterContainerVert" id = "gender-container">
                            <div className = {`btn flex ${graphFilter.gender !== -1 ? "filterActive" : ""}`} onMouseEnter = {()=>d3.select('#reset-gender').style('color','#9597a6')} onMouseLeave = {()=>d3.select('#reset-gender').style('color','#c9c9d5')} style = {{padding: '4px 8px 4px 8px',borderRadius: '4px',marginBottom:4}}  
                                onClick = {() => {
                                    setGraphFilter(prev => ({
                                        ...prev,
                                        gender: -1
                                }));}}
                            >
                                <p className = 'filterLabel'>Sex</p>
                                <FontAwesomeIcon style = {{display: graphFilter.gender !== -1 ? 'block' : 'none'}} className = "resetFilter fa-solid icon" id = "reset-gender" icon={faX} />    
                            </div>
                            <div className = "filterFlex">
                                <div className = "filter-viz" id = "gender-viz"><svg id = "gender-svg"></svg></div>
                                <div className = "flex" id = "gender-labels" style = {{marginTop:2}} ></div>
                            </div>
                        </div>

                        <div className = "filterContainerVert" id = "age-container">
                            <div className = {`btn flex ${graphFilter.age.length > 1 ? "filterActive" : ""}`} onMouseEnter = {()=>d3.select('#reset-age').style('color','#9597a6')} onMouseLeave = {()=>d3.select('#reset-age').style('color','#c9c9d5')} style = {{padding: '4px 8px 4px 8px',borderRadius: '4px',marginBottom:4}}  
                                onClick = {() => {
                                    setGraphFilter(prev => ({
                                        ...prev,
                                        age: [-1]
                                }));}}
                            >
                                <p className = 'filterLabel'>Age</p>
                                <FontAwesomeIcon style = {{display: graphFilter.age.length > 1 ? 'block' : 'none'}} className = "resetFilter fa-solid icon" id = "reset-age" icon={faX} />    
                            </div>
                            <div className = "filterFlex btn" id = "age-filter" onMouseDown = {(e) => ageBrush(e,'down')} onMouseUp = {(e) => ageBrush(e,'up')} onMouseMove = {(e) => ageBrush(e,'move')}>
                                <div className = "filter-viz" id = "age-viz"></div>
                                <div className = "flex" id = "age-labels" style = {{marginTop:2}}></div>
                            </div>
                        </div> 

                        <div className = "filterContainerVert" id = "source-container" style = {{borderRight:'none'}}>
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
                                <div className = "filter-viz filterFlex" id = "source-viz" style = {{alignItems:'flex-start',alignSelf:'flex-end'}}></div>
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
                <div id = "graph-group" style = {{display: 'block',position:'relative'}}>
                    <div id = "graph-subheader"><div className = "margin" id = "graph-labels"></div></div> 
                    <div ref={graphContainerRef} id = "graph-container" style = {{position:'relative'}}>
                        <div className = 'selectedText' id = "y-label">Record Counts</div>
                        <div className = 'flex' id = "rootline-container">
                            <div className='flex'>
                                <div className = 'selectedText' id = "x-label" style = {{justifySelf:'flex-start'}}>{extent && extent[0]+'-'+extent[1]}</div> 
                                <div className = 'greyBtn btn' id = "reset-zoom" style = {{display: zoomed ? 'block' : 'none'}} onClick = {() => resetZoom()}>Reset zoom</div>   
                            </div>
                            <div className='flex'>
                                <div className = 'flex btn' style = {{pointerEvents:showRootLine ? 'all' : 'none'}} onMouseEnter={() => {setHovered(['rootline'])}} onMouseLeave={() => {setHovered([])}}>
                                    <img className = 'marginRight' id = "rootline-icon" style = {{opacity:showRootLine ? 1 : 0.3}} src={rootLineIcon} alt="root descendants line icon"/>
                                    <p className={`marginRight ${showRootLine ? 'selectedText' : ''}`} style = {{opacity:showRootLine ? 1 : 0.5}}>Total Descendant Counts</p>    
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
                </div> 

                {/* <div ref={upsetContainerRef} id = "upset-container" style = {{display: 'none',position: 'relative'}}>
                    <svg id = 'upset-svg'>
                        <g id = 'upset-content'>
                            <g id = 'sets-layer'></g>
                            <g id = 'upsets-layer'></g>
                            <g id = 'types-layer'></g>    
                        </g>
                    </svg>
                    <button onClick={() => setUpsetZoomedOut(prev => !prev)}>
                        {upsetZoomedOut ? 'Reset zoom' : 'Zoom to fit'}
                    </button>
                </div>       */}
                <div
                    ref={upsetContainerRef}
                    id="upset-container"
                    style={{ display: 'none', position: 'relative', overflow: 'hidden', width: '100%', height: '100%' }}
                >
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

                    {(upsetOverflowing || upsetZoomedOut) && (
                        <div className='btn greyBtn'
                            style={{ position: 'absolute', top: 0, left: '1em' }}
                            onClick={() => setUpsetZoomedOut(prev => !prev)}
                        >
                            {upsetZoomedOut ? 'Reset zoom' : 'Zoom to fit'}
                        </div>
                    )}
                </div>
            </div>  
        </div>    
    )
}

export default GraphSection;