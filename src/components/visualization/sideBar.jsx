    import React, { useEffect, useState, useRef } from 'react';
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
    import { createPortal } from 'react-dom'
    import rootLineIcon from '../../img/root-line.svg'
    import * as d3 from "d3";
    import po from '../../po.js';
    import textures from 'textures';
    import chroma from 'chroma-js';
    import { hover } from '@testing-library/user-event/dist/hover.js';

    function SideBar (props) {
        const navigate = useNavigate()
        const rootConcepts = props.rootConcepts
        const mapRoot = props.mapRoot
        const setMapRoot = props.setMapRoot
        const tooltipHover = props.tooltipHover
        // const conceptHover = props.conceptHover
        const updateConcepts = props.updateConcepts
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
        const getConceptInfo = props.getConceptInfo
        // const centers = props.centers
        const inclusions = props.inclusions
        const setInclusions = props.setInclusions
        const getInclusions = props.getInclusions
        // const getCounts = props.getCounts
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
        const showRootLine = props.showRootLine
        const maxPersonLevel = props.maxPersonLevel
        const fullTreeNodeMap = props.fullTreeNodeMap
        const isLeaf = props.isLeaf
        const getNewInclusions = props.getNewInclusions
        const zoomedNodes = props.zoomedNodes
        const zoomedLinks = props.zoomedLinks
        const setZoomedNodes = props.setZoomedNodes
        const setZoomedLinks = props.setZoomedLinks
        const focused = props.focused
        const setFocused = props.setFocused
        const zoomClosed = props.zoomClosed
        const setZoomClosed = props.setZoomClosed
        const margin = 10
        let hoverTimeout = null
        let currentTarget = null
        const zoomRef = useRef(null)
        const neighborhoodRef = useRef([])
        const fitScaleRef = useRef(1)      
        const treeZoomedRef = useRef(false) 
        const fittingRef = useRef(false)   
        const minimapLockedRef = useRef(false)
        const MINIMAP_MAX_K = 0.3
        const FIT_TOLERANCE = 1.02 
        const lockScaleRef = useRef(1)
        const pendingMapZoomRef = useRef(null)
        const [expandedTop, setExpandedTop] = useState([])
        const [topList, setTopList] = useState(null)     
        const [topQuery, setTopQuery] = useState('')
        const skipNextFitRef = useRef(false)

        // TREE AND LIST FUNCTIONS  
        function getContrastColor(nodeColor) {
            const whiteContrast = chroma.contrast(nodeColor, '#ffffff')
            const blackContrast = chroma.contrast(nodeColor, '#36126d')
            return whiteContrast >= blackContrast ? '#ffffff' : '#36126d'
        }     
        
        function hoverMappings(d,mode) {
            if (mode === 'enter') {
                d3.select('#mappings-btn-'+d.name).transition().style('opacity',1)
                if (!mapRoot.includes(d.name)) d.data.concept.standard_concept ? d3.selectAll('.map-circle-'+d.name).transition().attr("transform", "translate(-2, 0)") : d3.selectAll('.map-circle-'+d.name).transition().attr("transform", "translate(2, 0)")
            } else {
                d3.select('#mappings-btn-'+d.name).transition().style('opacity',0.3) 
                d3.selectAll('.map-circle-'+d.name).transition().attr("transform", "translate(0, 0)")
            }
        }

        function overrideNodeHover(e) {
            const treeNode = e.currentTarget.closest('.tree-node')
            if (treeNode) clearTimeout(treeNode.__hoverTimeout__)
        }

        const TOP_COLLAPSE_AT = 10     
        const TOP_MAX_CIRCLES = 5
        const TOP_CIRCLE_GAP = 15
        const TOP_SPACING = 200

        function spread(len, center, i, gap) {  
            const adj = len % 2 !== 0 ? 0 : gap / 2
            const median = Math.floor(len / 2)
            return i >= median ? center + (i - median) * gap + adj : center - (median - i) * gap + adj
        }

        const topCountText = n => `${n} parent concept${n === 1 ? '' : 's'}`

        function openTopList(e) {
            setTopQuery('')
            setTopList({ x: e.clientX, y: e.clientY })
        }

        function layoutTopLevel() {
            const top = nodes.filter(n => n.levels === '-1')
            const collapsedMode = top.length > TOP_COLLAPSE_AT
            d3.select('#top-list-btn').style('display', collapsedMode ? 'block' : 'none')
            if (!collapsedMode) return [nodes, links]

            const cx = (d3.min(top, n => n.x) + d3.max(top, n => n.x)) / 2
            const expanded = top.filter(n => expandedTop.includes(n.name)).sort((a, b) => a.x - b.x)
            const rest = top.filter(n => !expandedTop.includes(n.name)).sort((a, b) => a.x - b.x)
            const slots = Math.min(TOP_MAX_CIRCLES, rest.length)
            const offset = slots > 0 ? 1 : 0                     
            const rowX = i => spread(expanded.length + offset, cx, i, TOP_SPACING)

            const derived = new Map()   
            const remap = new Map()    

            if (slots > 0) {
                const clusterX = rowX(0)
                const groups = Array.from({ length: slots }, () => [])
                rest.forEach((n, i) => groups[Math.floor(i * slots / rest.length)].push(n))
                groups.forEach((group, s) => {
                    const rep = group[0]
                    const x = spread(slots, clusterX, s, TOP_CIRCLE_GAP)
                    const anchor = s === Math.floor(slots / 2)
                    derived.set(rep.name, {
                        ...rep, x, collapsed: x || 0.001, mappings: [],
                        collapsedCount: anchor ? rest.length : 0,  
                        collapsedCenter: clusterX                  
                    })
                    group.forEach(n => remap.set(n.name, rep.name))
                })
            }
            expanded.forEach((n, i) => {
                const dn = { ...n, x: rowX(i + offset), collapsed: null }
                dn.mappings = n.mappings.map(m => ({ ...m, source: dn }))
                derived.set(n.name, dn)
            })

            const dNodes = nodes
                .filter(n => n.levels !== '-1' || derived.has(n.name))
                .map(n => derived.get(n.name) || n)

            const byName = new Map(nodes.map(n => [n.name, n]))
            const pick = name => derived.get(name) || byName.get(name)
            const seen = new Set()
            const dLinks = []
            links.forEach(l => {
                const s = remap.get(l.source.name) ?? l.source.name
                const t = remap.get(l.target.name) ?? l.target.name
                const key = s + '>' + t
                if (seen.has(key) || !pick(s) || !pick(t)) return
                seen.add(key)
                dLinks.push({ ...l, source: pick(s), target: pick(t) })
            })
            return [dNodes, dLinks]
        }

        function setZoomedState(on) {
            if (on === treeZoomedRef.current) return
            treeZoomedRef.current = on
            if (on) {
                // close the minimap and its collapsed tab, drop any pending hide/hover state
                clearTimeout(hideTimerRef.current)
                d3.select('#minimap-container').style('display', 'none')
                d3.select('#minimap-tab').style('display', 'none')
                setZoomedNodes([])
                setZoomedLinks([])
                setFocused(null)
            } else if (miniCollapsedRef.current) {
                // back at fit: restore the tab if the user had collapsed the minimap themselves
                d3.select('#minimap-tab').style('display', 'flex').style('opacity', 1)
            }
        }

        function syncZoomState(k, userInitiated = false) {
            const fit = fitScaleRef.current
            const nearFit = k <= fit * FIT_TOLERANCE

           const UNLOCK_FACTOR = 0.65
            if (userInitiated && minimapLockedRef.current &&
                (nearFit || k < lockScaleRef.current * UNLOCK_FACTOR)) {
                minimapLockedRef.current = false
            }

            // button: any zoom-in, plus right after a minimap zoom
            d3.select('#zoom-to-fit').style('display', !nearFit || minimapLockedRef.current ? 'block' : 'none')

            // minimap: locked, or zoomed in far enough that it isn't needed
            const tooClose = k > Math.max(MINIMAP_MAX_K, fit * 1.5)
            setZoomedState(minimapLockedRef.current || tooClose)
        }

        const GUIDE_LEVELS = new Set(['1-1'])   
        function applyLabelScale(k) {
            const LABEL_FULL = 0.5
            const LABEL_MAX_K = 4
            const LABEL_HIDE = 0.14
            const GUIDE_FULL = 0.5    
            const GUIDE_MAX_K = 40   

            const isGuide = d => d && GUIDE_LEVELS.has(d.levels) && !d.collapsed
            const labelK = Math.min(LABEL_MAX_K, Math.max(1, LABEL_FULL / k))
            const guideK = k < LABEL_HIDE ? Math.min(GUIDE_MAX_K, Math.max(1, GUIDE_FULL / k)) : labelK

            d3.selectAll('.label')
                .attr('visibility', d => k < LABEL_HIDE && !isGuide(d) ? 'hidden' : 'visible')
                .style('transform-box', 'fill-box')
                .style('transform-origin', '50% 100%')
                .attr('transform', d => {
                    const s = isGuide(d) ? guideK : labelK
                    return s > 1 ? `scale(${s})` : null
                })

            d3.selectAll('.map-label')
                .attr('visibility', k < LABEL_HIDE ? 'hidden' : 'visible')
                .style('transform-box', 'fill-box')
                .style('transform-origin', '50% 100%')
                .attr('transform', labelK > 1 ? `scale(${labelK})` : null)
        }
        function zoomed(e) {
            const {x,y,k} = e.transform
            d3.select("#tree-graphics").attr("transform", "translate(" + x + "," + y + ")" + " scale(" + k + ")");
            if (e.sourceEvent) d3.select('#neighborhood-outline').remove()
            d3.selectAll('.line-path').attr('stroke-width',1.5 + (1.2/k))
            const THRESHOLD = 0.16
            const BOOST = 1.1
            const scale = Math.min(6 * BOOST, BOOST * Math.sqrt(THRESHOLD / k)) 
            applyLabelScale(k)
            if (k < THRESHOLD) {
                d3.selectAll('.map-drc-group').attr('visibility','hidden')
                d3.selectAll('.drc-group').attr('visibility','hidden')
                d3.selectAll('.node-group')
                    .style('transform-box', 'fill-box')
                    .style('transform-origin', 'center')
                    .attr('transform', `scale(${scale})`)
                if (relationship === 'mappings') {
                    d3.selectAll('.map-tree-circle')
                        .style('transform-box', 'fill-box')
                        .style('transform-origin', 'center')
                        .attr('transform', `scale(${scale})`)    
                }
            } else {
                d3.selectAll('.map-drc-group').attr('visibility','visible')
                d3.selectAll('.drc-group').attr('visibility','visible')
                d3.selectAll('.node-group')
                    .attr('transform', null)
                    .style('transform-box', null)
                    .style('transform-origin', null)   
                d3.selectAll('.map-tree-circle')
                    .attr('transform', null)
                    .style('transform-box', null)
                    .style('transform-origin', null) 
            }
            if (!fittingRef.current) syncZoomState(k, !!e.sourceEvent)
        }
        function zoomToFit(geometry, padding = 20) {
            minimapLockedRef.current = false
            d3.select('#neighborhood-outline').remove()
            d3.select('#zoom-to-fit').style('display','none')
            const svgNode = d3.select('#tree-container').node()
            const gNode = geometry.node().parentElement

            // actual container dimensions — no padding baked in here
            const svgWidth = window.innerWidth * ((100 - parseInt(graphSectionWidth)) / 100)
            const svgHeight = svgNode.getBoundingClientRect().height

            const bbox = gNode.getBBox()
            const { width, height, x, y } = bbox
            if (width === 0 || height === 0) return

            // subtract padding on both sides (top+bottom, left+right) exactly once
            let scale = Math.min(
                (svgWidth - padding * 2) / width,
                (svgHeight - padding * 6) / height
            )
            if (nodes.length === 1) scale = scale / 2

            // center within the REAL container dimensions
            const translateX = (svgWidth - width * scale) / 2 - x * scale
            const translateY = (svgHeight - height * scale) / 2 - y * scale - padding*2

            const pendingName = pendingMapZoomRef.current
            if (pendingName !== null) {
                pendingMapZoomRef.current = null

                fitScaleRef.current = scale
                zoomRef.current.scaleExtent([scale, 4])

                const node = nodes.find(n => n.name === pendingName)
                if (node) {
                    neighborhoodRef.current = [node]
                    const target = getNeighborhoodBounds()
                    if (target) {
                        minimapLockedRef.current = true   
                        setZoomedState(true)
                        zoomToRect(target)
                        return                            
                    }
                }
            }

            if (skipNextFitRef.current) {
                const anchor = skipNextFitRef.current
                skipNextFitRef.current = false
                fitScaleRef.current = scale
                const svg = d3.select('#tree')
                let t = d3.zoomTransform(svg.node())
                if (anchor && anchor.name !== undefined) {
                    const el = document.getElementById('tree-circle-' + anchor.name)
                    if (el) {
                        const now = el.getBoundingClientRect()
                        const inv = document.getElementById('tree').getScreenCTM().inverse()
                        const a = new DOMPoint(anchor.screen.left, anchor.screen.top).matrixTransform(inv)
                        const b = new DOMPoint(now.left, now.top).matrixTransform(inv)
                        t = d3.zoomIdentity.translate(t.x + (a.x - b.x), t.y + (a.y - b.y)).scale(t.k)
                    }
                }
                const k = Math.max(t.k, scale)
                zoomRef.current.scaleExtent([scale, 4])
                fittingRef.current = true
                svg.call(zoomRef.current.transform, d3.zoomIdentity.translate(t.x, t.y).scale(k))
                fittingRef.current = false
                zoomed({ transform: d3.zoomTransform(svg.node()) })
                return
            }

            d3.select('#tree-graphics').transition()
                .attr("transform", `translate(${translateX},${translateY}) scale(${scale})`)
            d3.selectAll('.line-path').attr('stroke-width',1.5 + (1.2/scale))
            const THRESHOLD = 0.16
            const BOOST = 1.1
            const k = Math.min(6 * BOOST, BOOST * Math.sqrt(THRESHOLD / scale)) 
            applyLabelScale(scale)
            if (scale < THRESHOLD) {
                d3.selectAll('.map-drc-group').attr('visibility','hidden')
                d3.selectAll('.drc-group').attr('visibility','hidden')
                d3.selectAll('.node-group')
                    .style('transform-box', 'fill-box')
                    .style('transform-origin', 'center')
                    .attr('transform', `scale(${k})`)
                if (relationship === 'mappings') {
                    d3.selectAll('.map-tree-circle')
                        .style('transform-box', 'fill-box')
                        .style('transform-origin', 'center')
                        .attr('transform', `scale(${k})`)    
                }
            } else {
                d3.selectAll('.map-drc-group').attr('visibility','visible')
                d3.selectAll('.drc-group').attr('visibility','visible')
                d3.selectAll('.node-group')
                    .attr('transform', null)
                    .style('transform-box', null)
                    .style('transform-origin', null)   
                d3.selectAll('.map-tree-circle')
                    .attr('transform', null)
                    .style('transform-box', null)
                    .style('transform-origin', null) 
            }
            const MAX_ZOOM = 4
            fitScaleRef.current = scale
            fittingRef.current = true
            zoomRef.current.scaleExtent([scale, MAX_ZOOM])
            const t = d3.zoomIdentity.translate(translateX, translateY).scale(scale)
            d3.select('#tree').transition().duration(750)
                .call(zoomRef.current.transform, t)
                .on('end interrupt', () => {
                    fittingRef.current = false
                    syncZoomState(d3.zoomTransform(d3.select('#tree').node()).k)
                })
        }
        // bounding box of the neighborhood nodes, in #tree-graphics coordinates
        function getNeighborhoodBounds(pad = 24) {
            const nodes = neighborhoodRef.current
            const gNode = document.getElementById('tree-graphics')
            if (!nodes || nodes.length === 0 || !gNode) return null

            const names = new Set(nodes.map(n => n.name))
            const toG = gNode.getCTM().inverse()
            const VISIBLE = '.tree-circle, .label-rect, .drc-rect, .map-tree-circle, .map-label-rect, .map-drc-rect'

            let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
            d3.selectAll('.tree-node')
                .filter(d => names.has(d.name))
                .each(function () {
                    this.querySelectorAll(VISIBLE).forEach(el => {
                        const ctm = el.getCTM()
                        if (!ctm) return
                        let b
                        try { b = el.getBBox() } catch { return }
                        if (b.width === 0 && b.height === 0) return

                        const m = toG.multiply(ctm)
                        ;[[b.x, b.y], [b.x + b.width, b.y], [b.x, b.y + b.height], [b.x + b.width, b.y + b.height]]
                            .forEach(([px, py]) => {
                                const p = new DOMPoint(px, py).matrixTransform(m)
                                x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x)
                                y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y)
                            })
                    })
                })

            if (!isFinite(x0) || x1 <= x0 || y1 <= y0) return null
            return { x: x0 - pad, y: y0 - pad, width: x1 - x0 + pad * 2, height: y1 - y0 + pad * 2 }
        }

        // the part of #tree that is really on screen, in the svg's own (viewBox) coordinates
        function getVisibleRegion() {
            const svgEl = document.getElementById('tree')
            const cont = document.getElementById('tree-container').getBoundingClientRect()
            const s = svgEl.getBoundingClientRect()

            // intersect the svg, its container and the window (client pixels)
            const left = Math.max(cont.left, s.left, 0)
            const top = Math.max(cont.top, s.top, 0)
            const right = Math.min(cont.right, s.right, window.innerWidth)
            const bottom = Math.min(cont.bottom, s.bottom, window.innerHeight)

            // client pixels -> svg user space (this accounts for the viewBox and any letterboxing)
            const inv = svgEl.getScreenCTM().inverse()
            const a = new DOMPoint(left, top).matrixTransform(inv)
            const b = new DOMPoint(right, bottom).matrixTransform(inv)
            return { x: a.x, y: a.y, width: b.x - a.x, height: b.y - a.y }
        }

        function zoomToRect(r, padding = 10, duration = 750, insets = {}) {
            const gNode = document.getElementById('tree-graphics')
            const svg = d3.select('#tree')
            if (!gNode || !zoomRef.current) return

            const { top = 0, right = 0, bottom = 0, left = 0 } = insets
            const v = getVisibleRegion()
            const region = {
                x: v.x + left,
                y: v.y + top,
                width: v.width - left - right,
                height: v.height - top - bottom
            }

            const MAX_SCALE = 3
            const scale = Math.min(
                MAX_SCALE,
                (region.width - padding * 2) / r.width,
                (region.height - padding * 2) / r.height
            )
            lockScaleRef.current = scale
            const tx = region.x + region.width / 2 - (r.x + r.width / 2) * scale
            const ty = region.y + region.height / 2 - (r.y + r.height / 2) * scale
            // sync d3.zoom with the transform currently on #tree-graphics
            // const m = gNode.transform.baseVal.consolidate()?.matrix
            // if (m) svg.call(zoomRef.current.transform, d3.zoomIdentity.translate(m.e, m.f).scale(m.a)
            // svg.transition().duration(duration)
            //     .call(zoomRef.current.transform, d3.zoomIdentity.translate(tx, ty).scale(scale))
            // d3.select('#zoom-to-fit').style('display','block')
            const m = gNode.transform.baseVal.consolidate()?.matrix
            if (m) {
                fittingRef.current = true
                svg.call(zoomRef.current.transform, d3.zoomIdentity.translate(m.e, m.f).scale(m.a))
                fittingRef.current = false
            }
            svg.transition().duration(duration)
                .call(zoomRef.current.transform, d3.zoomIdentity.translate(tx, ty).scale(scale))
            setTimeout(() => {
                d3.select('#neighborhood-outline').transition().style('opacity',0)
                setHovered([])
            }, 1000)
        }

        function zoomToNeighborhood() {
            cancelMinimapHide()
            const target = getNeighborhoodBounds()
            const gNode = document.getElementById('tree-graphics')
            const miniEl = document.getElementById('minimap-container')
            if (!target || !gNode || !miniEl) return

            d3.select('#neighborhood-outline').remove()
            minimapLockedRef.current = true
            setZoomedState(true)

            // the minimap card's on-screen box, converted into #tree-graphics coordinates
            const mm = miniEl.getBoundingClientRect()
            const inv = gNode.getScreenCTM().inverse()
            const p0 = new DOMPoint(mm.left, mm.top).matrixTransform(inv)
            const p1 = new DOMPoint(mm.right, mm.bottom).matrixTransform(inv)
            const k0 = (p1.x - p0.x) / mm.width   // screen px -> graphics units

            // start as a copy of the minimap card...
            const outline = d3.select(gNode).append('rect')
                .attr('id', 'neighborhood-outline')
                .attr('x', p0.x).attr('y', p0.y)
                .attr('width', p1.x - p0.x).attr('height', p1.y - p0.y)
                .attr('rx', 6 * k0)
                .attr('fill', 'white').attr('fill-opacity', 1)
                .attr('stroke', '#e8e8e8').attr('stroke-width', 1)
                .style('vector-effect', 'non-scaling-stroke')   // constant line width at any zoom
                .style('pointer-events', 'none')

            setHovered(zoomedNodes.map(n => n.name))

            // ...the real minimap fades out underneath it
            d3.select(miniEl).transition().duration(200).style('opacity', 0)
                .on('end', function () { d3.select(this).style('display', 'none') })

            // ...then the card grows into an outline around the nodes, and the tree zooms to it
            outline.transition().duration(600).ease(d3.easeCubicInOut)
                .attr('x', target.x).attr('y', target.y)
                .attr('width', target.width).attr('height', target.height)
                .attr('rx', 10)
                .attr('fill-opacity', 0)
                .attr('stroke', '#ddd4f7').attr('stroke-width', 1.5)
                .on('end', () => zoomToRect(target))
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
            const newInclusions = rootConcepts.map(r => nodes.map(n => n.name).includes(r) ? getInclusions(rootConcepts,fullTreeNodeMap,r,eList,dFilter,nodes.find(n => n.name === r).descendants) : getInclusions(rootConcepts,fullTreeNodeMap,r,eList,dFilter,fullTree.nodes.find(n => n.name === r).descendants.filter(d => classFilter.includes('All') ? d : classFilter.includes(fullTree.nodes.find(n => n.name === d).class)))).flat().filter((e,n,l) => l.indexOf(e) === n)
                .filter(i => fullTree.nodes.find(n => n.name === i).levels !== '-1')
                .map(i => relationship === 'mappings' ? fullTree.nodes.find(n => n.name === i).mappings.map(m => m.name) : i).flat()   
                .filter(i => {
                    if (relationship.includes('mappings')) {
                        if (countType === 'record' || countType === 'measurement') return fullTree.mappings.find(n => n.name === i).record_counts !== 0
                        else return fullTree.mappings.find(n => n.name === i).person_counts !== 0
                    } else {
                        if (countType === 'record' || countType === 'measurement') return fullTree.nodes.find(n => n.name === i).record_counts !== 0
                        else return fullTree.nodes.find(n => n.name === i).person_counts  !== 0   
                    }
                })
            updateConcepts(newInclusions)
        }
                        
        // DRAWING
        // concept set
        function drawSet() {
            const conceptSetData = rootConcepts.map(root => ({name:root,color:fullTree.nodes.find(n => n.name === root).color,leaf:nodes.find(n => n.name === root) ? nodes.find(n => n.name === root).leaf : false, descendant_person_counts:nodes.find(n => n.name === root) ? nodes.find(n => n.name === root).descendant_person_counts : d3.sum(fullTree.allNodes.filter(node => !node.source ? fullTree.nodes.find(n => n.name === 4191479).descendants.includes(node.name) : (node.source && fullTree.nodes.find(n => n.name === 4191479).descendants.includes(node.source.name))).filter(node => inclusions.includes(node.name)).map(node => node.person_counts)),  descendant_record_counts: nodes.find(n => n.name === root) ? nodes.find(n => n.name === root).descendant_record_counts : d3.sum(fullTree.allNodes.filter(node => !node.source ? fullTree.nodes.find(n => n.name === 4191479).descendants.includes(node.name) : (node.source && fullTree.nodes.find(n => n.name === 4191479).descendants.includes(node.source.name))).filter(node => inclusions.includes(node.name)).map(node => node.record_counts)),concept:fullTree.nodes.find(n => n.name === root).data.concept,descendants:descendantsFilter.includes(root) ? false : true,exclude:excludeList.includes(root) ? true : false}))
            d3.select('#set-items').selectAll('.set-item').data(conceptSetData, d => d.name)
            .join(enter => {
                const container = enter.append('div')
                    .classed('set-item',true)
                    .attr('id', d => 'set-item-'+d.name)
                const conceptSection = container.append('div')
                    .classed('set-concept flex',true)
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
                        const arrayToString = rootConcepts.filter(root => root !== d.name).join(",")
                        navigate(`/${arrayToString}`)
                    })
                const conceptCard = conceptSection.append('div')
                    .classed('set-card concept-card',true)
                    .attr('id', d => 'set-card-'+d.name)
                    .style('display','flex')
                    .style('flex-direction','column')
                    .style('box-shadow', d => inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? '0 0 0 1px rgba(0, 0, 0, 0.02),0 2px 10px rgba(0, 0, 0, 0.15)' : 'none')
                    .style('background-color', d => d.levels === '-1' ? 'none' : inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? 'white' : '#f2f2f4')
                    .style('border', '1px solid #7728ED')
                    .style('margin-right','20px')
                const title = conceptCard.append('div')
                    .classed('set-item-title btn',true)
                const title1 = title.append('div')
                    .style('display','flex')
                    .style('align-items','center')
                title1.append('div')
                    .classed('set-circle',true)
                    .classed('list-circle-dash', d => d.concept.record_counts === 0 && !d.leaf ? true : false)
                    .classed('list-circle', d => d.concept.record_counts === 0 && !d.leaf ? false : true)
                    .classed('btn', d => inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? true : false)
                    .style("pointer-events", d => inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? 'all' : 'none')
                    .style('background', d => {
                        if (d.concept.record_counts === 0 && !d.leaf) return "none"
                        if (inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings')) {
                            if (!d.concept.standard_concept) {return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, "+ d.color + " 0.5px," + d.color + " 2px)"} 
                            else {return "none"}
                        }
                        else {
                            if (!d.concept.standard_concept) return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, #d2d2d9 0.5px, #d2d2d9 2px)"  
                            else {return "none"}

                        }      
                    })
                    .style("background-color", d => {
                        if (d.concept.record_counts === 0 && !d.leaf) return "transparent"
                        if (inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings')) {
                            if (d.concept.standard_concept) {return d.color} 
                            else {return "transparent"}
                        }
                        else return '#d2d2d9'
                    }) 
                    .style('border', d => d.concept.record_counts === 0 && !d.leaf ? '1px solid #b3b3bf' : inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? `1px solid ${d.color}` : '1px solid #d2d2d9')
                    .on('mouseover',(e,d) => setHovered([d.name]))
                    .on('mouseout', (e,d) => setHovered([]))
                const titleRight = title1.append('div')
                    .classed('list-title-right btn',true)
                    .style('display','flex')
                    .style('align-items','center')
                    .style('z-index','1000')
                const titleP = titleRight.append('p')
                    .classed('set-title-p',true)
                    .style('opacity', d => inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? 1 : 0.6)
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
                    // .style('opacity', 0.2)
                    .on('mouseover',(e,d) => {e.stopPropagation();d3.select('#set-trash-' + d.name).transition(1000).style('max-width', '0px').style('opacity', 0).style('margin-right', '0px');d3.select('#set-info-icon-'+d.name).transition().style('color','#9597a6')})
                    .on('mouseout', (e,d) => {if(d3.select('#set-info-container-'+d.name).style('height') !== '45px') d3.select('#set-info-icon-'+d.name).transition().style('color','#c9c9d5')})
                    .on('click', (e,d) => {
                        if (d3.select('#set-info-container-'+d.name).style('height') === '45px') {
                            d3.select('#set-info-icon-'+d.name).transition().style('color','#c9c9d5')
                            d3.select('#set-info-container-'+d.name).transition().style('opacity',0).style('height','0px').style('padding-top','0px').style('margin','0px 0px 0px 22px')
                            d3.select('#set-card-'+d.name).transition().style('border-radius','20px')
                        } else {
                            d3.select('#set-info-icon-'+d.name).transition().style('color','#9597a6')
                            d3.select('#set-info-container-'+d.name).transition().style('opacity',1).style('height','45px').style('padding-top','4px').style('margin','4px 4px 4px 22px')
                            d3.select('#set-card-'+d.name).transition().style('border-radius','12px')
                        }
                    })
                const infoContainer = conceptCard.append('div')
                    .classed('set-info-container',true)
                    .attr('id', d => 'set-info-container-'+d.name)
                    .style('border-top', d => inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? '1px solid #e7e7eb' : '1px solid color-mix(in srgb, #36126d, white 85%)')
                    .on('mouseover',(e,d) => {e.stopPropagation();d3.select('#set-trash-' + d.name).transition(1000).style('max-width', '0px').style('opacity', 0).style('margin-right', '0px')})
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

                const exclude = selections.append('div')
                    .classed('flex',true)
                    .style('justify-content','flex-start')
                    .style('margin-right','10px')
                const excludeBox = exclude.append('div')
                    .classed('exclude-box checkMarkBox marginRight',true)
                    .style('border', d => d.exclude ? '1px solid #9597a6' : '1px solid #e8e8e8')
                    .on('click', (e,d) => setExcludeInclude('exclude',d.name))
                excludeBox.append('i')
                    .classed('exclude-check fa-solid fa-check',true)
                    .style('display', d => d.exclude ? 'block' : 'none')    
                exclude.append('p')
                    .classed('exclude-p',true)
                    .classed('selectedText', d => d.exclude ? true : false)
                    .html('Exclude')

                const descendants = selections.append('div')
                    .classed('flex',true)
                    .style('justify-content','flex-start')
                    .style('margin-right','10px')
                const descendantsBox = descendants.append('div')
                    .classed('descendants-box checkMarkBox marginRight',true)
                    .style('border', d => d.descendants ? '1px solid #9597a6' : '1px solid #e8e8e8')
                    .on('click', (e,d) => setExcludeInclude('descendants',d.name))
                descendantsBox.append('i')
                    .classed('descendants-check fa-solid fa-check',true)
                    .style('display', d => d.descendants ? 'block' : 'none')    
                descendants.append('p')
                    .classed('descendants-p',true)
                    .classed('selectedText', d => d.descendants ? true : false)
                    .html('Descendants')

                container.append('div')
                    .classed('set-counts num selectedText',true)
                    .html(d => countType === 'record' || countType === 'measurement' ? d.descendant_record_counts : d.descendant_person_counts)
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
                        const arrayToString = rootConcepts.filter(root => root !== d.name).join(",")
                        navigate(`/${arrayToString}`)
                    })
                update.select('.set-card')
                    .style('box-shadow', d => inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? '0 0 0 1px rgba(0, 0, 0, 0.02),0 2px 10px rgba(0, 0, 0, 0.15)' : 'none')
                    .style('background-color', d => d.levels === '-1' ? 'none' : inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? 'white' : '#f2f2f4')
                update.select('.set-circle')
                    .classed('list-circle-dash', d => d.concept.record_counts === 0 && !d.leaf ? true : false)
                    .classed('list-circle', d => d.concept.record_counts === 0 && !d.leaf ? false : true)
                    .classed('btn', d => inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? true : false)
                    .style("pointer-events", d => inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? 'all' : 'none')
                    .style('background', d => {
                        if (d.concept.record_counts === 0 && !d.leaf) return "none"
                        if (inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings')) {
                            if (!d.concept.standard_concept) {return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, "+ d.color + " 0.5px," + d.color + " 2px)"} 
                            else {return "none"}
                        }
                        else {
                            if (!d.concept.standard_concept) return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, #d2d2d9 0.5px, #d2d2d9 2px)"  
                            else {return "none"}

                        }      
                    })
                    .style("background-color", d => {
                        if (d.concept.record_counts === 0 && !d.leaf) return "transparent"
                        if (inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings')) {
                            if (d.concept.standard_concept) {return d.color} 
                            else {return "transparent"}
                        }
                        else return '#d2d2d9'
                    }) 
                    .style('border', d => d.concept.record_counts === 0 && !d.leaf ? '1px solid #b3b3bf' : inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? `1px solid ${d.color}` : '1px solid #d2d2d9')
                    .on('mouseover',(e,d) => setHovered([d.name]))
                    .on('mouseout', (e,d) => setHovered([]))
                update.select('.set-title-p')
                    .style('opacity', d => inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? 1 : 0.6)
                update.select('.set-info-icon')
                    .on('mouseover',(e,d) => {e.stopPropagation();d3.select('#set-trash-' + d.name).transition(1000).style('max-width', '0px').style('opacity', 0).style('margin-right', '0px');d3.select('#set-info-icon-'+d.name).transition().style('color','#9597a6')})
                    .on('mouseout', (e,d) => {if(d3.select('#set-info-container-'+d.name).style('height') !== '45px') d3.select('#set-info-icon-'+d.name).transition().style('color','#c9c9d5')})
                    .on('click', (e,d) => {
                        if (d3.select('#set-info-container-'+d.name).style('height') === '45px') {
                            d3.select('#set-info-icon-'+d.name).transition().style('color','#c9c9d5')
                            d3.select('#set-info-container-'+d.name).transition().style('opacity',0).style('height','0px').style('padding-top','0px').style('margin','0px 0px 0px 22px')
                            d3.select('#set-card-'+d.name).transition().style('border-radius','20px')
                        } else {
                            d3.select('#set-info-icon-'+d.name).transition().style('color','#9597a6')
                            d3.select('#set-info-container-'+d.name).transition().style('opacity',1).style('height','45px').style('padding-top','4px').style('margin','4px 4px 4px 22px')
                            d3.select('#set-card-'+d.name).transition().style('border-radius','12px')
                        }
                    })
                update.select('.set-info-container')
                    .on('mouseover',(e,d) => {e.stopPropagation();d3.select('#set-trash-' + d.name).transition(1000).style('max-width', '0px').style('opacity', 0).style('margin-right', '0px')})
                    .style('border-top', d => inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? '1px solid #e7e7eb' : '1px solid color-mix(in srgb, #36126d, white 85%)')
                update.select('.exclude-box')
                    .style('border', d => d.exclude ? '1px solid #9597a6' : '1px solid #e8e8e8')
                    .on('click', (e,d) => setExcludeInclude('exclude',d.name))
                update.select('.exclude-check')
                    .style('display', d => d.exclude ? 'block' : 'none') 
                update.select('.exclude-p')
                    .classed('selectedText', d => d.exclude ? true : false)
                update.select('.descendants-box')
                    .style('border', d => d.descendants ? '1px solid #9597a6' : '1px solid #e8e8e8')
                    .on('click', (e,d) => setExcludeInclude('descendants',d.name))
                update.select('.descendants-check')
                    .style('display', d => d.descendants ? 'block' : 'none') 
                update.select('.descendants-p')
                    .classed('selectedText', d => d.descendants ? true : false)
                
                update.select('.set-counts')
                    .html(d => countType === 'record' || countType === 'measurement' ? d.descendant_record_counts : d.descendant_person_counts)
            })
        }
        // tree
        function drawTree(nodes,links) {
            // get extent of total counts
            let sums = []
            nodes.forEach(node => {
                countType === 'record' || countType === 'measurement' ? sums.push(Math.sqrt(node.record_counts)) : sums.push(Math.sqrt(node.person_counts))
                node.mappings.forEach(map => countType === 'record' || countType === 'measurement' ? sums.push(Math.sqrt(map.record_counts)) : sums.push(Math.sqrt(map.person_counts)))
            })
            const nodeExtent = d3.extent(sums)
            const scaleRadius = d3.scaleLinear().domain([0, nodeExtent[1]]).range(nodeExtent[1] === 0 ? [4,4] : [18, 42])
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
                    labelPosition.x = d.collapsed ? d.collapsed : d.x 
                    if (countType === 'record' || countType === 'measurement') labelPosition.y = d.levels === '-1' ? cy + (genHeight[d.distance]) + 30 : d.record_counts > 0 ? cy + (genHeight[d.distance]) - scaleRadius(Math.sqrt(d.record_counts)) - 7 : cy + (genHeight[d.distance]) - scaleRadius(Math.sqrt(d.record_counts)) - 9; 
                    else labelPosition.y = d.levels === '-1' ? cy + (genHeight[d.distance]) + 30 : d.person_counts > 0 ? cy + (genHeight[d.distance]) - scaleRadius(Math.sqrt(d.person_counts)) - 7 : cy + (genHeight[d.distance]) - scaleRadius(Math.sqrt(d.person_counts)) - 9;
                return labelPosition 
            }
            // get map node positioning 
            const getMap = d => {
                let mapPosition = {x: 0, y: 0}
                if (mapRoot.includes(d.source.name)) {
                    mapPosition.x = d.source.x + d.direction*200
                } else {
                    if (countType === 'record' || countType === 'measurement') mapPosition.x = d.source.x + d.direction*(scaleRadius(Math.sqrt(d.source.record_counts)) + 28)
                    else mapPosition.x = d.source.x + d.direction*(scaleRadius(Math.sqrt(d.source.person_counts)) + 28)
                }
                if (countType === 'record' || countType === 'measurement') mapPosition.y = d.record_counts > 0 ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) - scaleRadius(Math.sqrt(d.record_counts)) - 7 : getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) - scaleRadius(Math.sqrt(d.record_counts)) - 9
                else mapPosition.y = d.person_counts > 0 ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) - scaleRadius(Math.sqrt(d.person_counts)) - 7 : getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) - scaleRadius(Math.sqrt(d.person_counts)) - 9
                return mapPosition
            }

            const MAX_COLLAPSED = 5
            const CIRCLE_GAP = 10
            const bindMappings = node => {
                const key = countType === 'record' || countType === 'measurement' ? 'record_counts' : 'person_counts'
                d3.group(node.mappings, m => m.direction).forEach(group => {
                    const sorted = [...group].sort((a, b) => b[key] - a[key])
                    sorted.forEach((m, i) => {
                        m._idx = i
                        m._count = sorted.length   
                        m._siblings = sorted
                    })
                })
                return node.mappings
            }
            const isMapVisible = d => mapRoot.includes(d.source.name) || d._idx < MAX_COLLAPSED
            const isCountAnchor = d =>
                !mapRoot.includes(d.source.name) && d._siblings.length > 5 && d._idx === Math.min(d._count, MAX_COLLAPSED) - 1
            const countText = d => '+' + (d._count - 5) + ((d._count - 5) === 1 ? ' mapping' : ' mappings')
            const countY = d => getYPosition(d.source, 'y', cy + genHeight[d.distance], d) + 24

            function getYPosition(source, axis, cy, node) {
                const mappings = nodes.filter(n => n.name === source.name)[0].mappings
                const direction = mappings.filter(d => d.name === node.name)[0].direction
                const generation = countType === 'record'
                    ? mappings.filter(d => d.direction === direction).sort((a,b) => b.record_counts - a.record_counts)
                    : mappings.filter(d => d.direction === direction).sort((a,b) => b.person_counts - a.person_counts)
                const index = generation.map(d => d.name).indexOf(node.name)

                const collapsed = !mapRoot.includes(source.name)
                const n = collapsed ? Math.min(generation.length, MAX_COLLAPSED) : generation.length
                const gap = collapsed ? CIRCLE_GAP : 150

                const adjustment = n % 2 !== 0 ? 0 : gap / 2
                const median = Math.floor(n / 2)
                return index >= median
                    ? cy + ((index - median) * gap) + adjustment
                    : cy - ((median - index) * gap) + adjustment
            }

            const MAP_HIT_PAD = 8

            const measure = (sel, extra) => {
                const node = d3.select(sel).node()
                if (!node) return 0
                try { return node.getBBox().width + extra } catch { return 0 }
            }

            const mapHitBox = d => {
                const r = scaleRadius(Math.sqrt(countType === 'record' || countType === 'measurement' ? d.record_counts : d.person_counts))
                const cx = getMap(d).x
                const cyc = getYPosition(d.source, 'y', cy + genHeight[d.distance], d)
                const labelW = measure('#label-text-' + d.name, 16)
                const drcW = measure('#drc-text-' + d.name, 10)
                const halfW = Math.max(labelW, drcW, r * 2, 40) / 2 + MAP_HIT_PAD
                const top = getMap(d).y - 35 - MAP_HIT_PAD   // top of the label rect
                const bottom = cyc + r + 23 + MAP_HIT_PAD    // bottom of the count pill
                return { x: cx - halfW, y: top, width: halfW * 2, height: bottom - top }
            }

            const bindMapHover = sel => sel
                .on('mouseenter', function (e, d) {
                    if (!mapRoot.includes(d.source.name)) return
                    overrideNodeHover(e)                      
                    clearTimeout(this.__hoverTimeout__)
                    this.__hoverTimeout__ = setTimeout(() => {
                        if (inclusions.includes(d.name)) setHovered([d.name])
                        if (d.levels !== '-1') tooltipHover(d, 'enter', e)
                    }, 600)
                })
                .on('mouseleave', function (e, d) {
                    clearTimeout(this.__hoverTimeout__)
                    if (!mapRoot.includes(d.source.name)) return
                    setHovered([])
                    tooltipHover(d, 'leave', e)
                })

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
                                .attr('stroke', d => (inclusions.includes(d.source.name) || d.source.mappings.map(m => m.name).some(m => inclusions.includes(m))) && (inclusions.includes(d.target.name) || d.target.mappings.map(m => m.name).some(m => inclusions.includes(m))) ? '#c2c2c2' : '#e8e8e8')
                                .attr('stroke-width', 1.5)
                                .attr("d", d => {
                                    let sourceY, targetY
                                    let sourceX = d.source.collapsed ? d.source.collapsed : d.source.x
                                    let targetX = d.target.collapsed ? d.target.collapsed : d.target.x
                                    if (countType === 'record' || countType === 'measurement') {
                                        sourceY = d.source.distance > d.target.distance ? cy + (genHeight[d.source.distance]) - scaleRadius(Math.sqrt(d.source.record_counts)) - 48 : cy + (genHeight[d.source.distance]) + scaleRadius(Math.sqrt(d.source.record_counts)) + 18
                                        targetY = d.source.distance >= d.target.distance ? cy + (genHeight[d.target.distance]) + scaleRadius(Math.sqrt(d.target.record_counts)) + 18 : cy + (genHeight[d.target.distance]) - scaleRadius(Math.sqrt(d.target.record_counts)) - 48
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
                                    let sourceX = d.source.collapsed ? d.source.collapsed : d.source.x
                                    let targetX = d.target.collapsed ? d.target.collapsed : d.target.x
                                    if (countType === 'record' || countType === 'measurement') {
                                        sourceY = d.source.distance > d.target.distance ? cy + (genHeight[d.source.distance]) - scaleRadius(Math.sqrt(d.source.record_counts)) - 48 : cy + (genHeight[d.source.distance]) + scaleRadius(Math.sqrt(d.source.record_counts)) + 18
                                        targetY = d.source.distance >= d.target.distance ? cy + (genHeight[d.target.distance]) + scaleRadius(Math.sqrt(d.target.record_counts)) + 18 : cy + (genHeight[d.target.distance]) - scaleRadius(Math.sqrt(d.target.record_counts)) - 48
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
                                .attr('fill', d => (inclusions.includes(d.source.name) || d.source.mappings.map(m => m.name).some(m => inclusions.includes(m))) && (inclusions.includes(d.target.name) || d.target.mappings.map(m => m.name).some(m => inclusions.includes(m))) ? '#c2c2c2' : '#e8e8e8')
                                .attr("d", d3.symbol().type(d3.symbolTriangle).size(arrowSize))
                                .attr("transform", d => {
                                    let x = d.target.collapsed ? d.target.collapsed : d.target.x
                                    let y
                                    if (countType === 'record' || countType === 'measurement') y = d.source.distance >= d.target.distance ? d.target.record_counts !== 0 ? cy + (genHeight[d.target.distance]) + scaleRadius(Math.sqrt(d.target.record_counts)) + 18 : cy + (genHeight[d.target.distance]) + scaleRadius(Math.sqrt(d.target.record_counts)) + 25 : d.target.record_counts !== 0 ? cy + (genHeight[d.target.distance]) - scaleRadius(Math.sqrt(d.target.record_counts)) - 48 : cy + (genHeight[d.target.distance]) - scaleRadius(Math.sqrt(d.target.record_counts)) - 50
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
                                    let sourceX = d.source.collapsed ? d.source.collapsed : d.source.x
                                    let targetX = d.target.collapsed ? d.target.collapsed : d.target.x
                                    if (countType === 'record' || countType === 'measurement') {
                                        sourceY = d.source.distance > d.target.distance ? cy + (genHeight[d.source.distance]) - scaleRadius(Math.sqrt(d.source.record_counts)) - 48 : cy + (genHeight[d.source.distance]) + scaleRadius(Math.sqrt(d.source.record_counts)) + 18
                                        targetY = d.source.distance >= d.target.distance ? cy + (genHeight[d.target.distance]) + scaleRadius(Math.sqrt(d.target.record_counts)) + 18 : cy + (genHeight[d.target.distance]) - scaleRadius(Math.sqrt(d.target.record_counts)) - 48
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
                                .attr('stroke', d => (inclusions.includes(d.source.name) || d.source.mappings.map(m => m.name).some(m => inclusions.includes(m))) && (inclusions.includes(d.target.name) || d.target.mappings.map(m => m.name).some(m => inclusions.includes(m))) ? '#c2c2c2' : '#e8e8e8')
                                .attr("d", d => {
                                    let sourceY, targetY
                                    let sourceX = d.source.collapsed ? d.source.collapsed : d.source.x
                                    let targetX = d.target.collapsed ? d.target.collapsed : d.target.x
                                    if (countType === 'record' || countType === 'measurement') {
                                        sourceY = d.source.distance > d.target.distance ? cy + (genHeight[d.source.distance]) - scaleRadius(Math.sqrt(d.source.record_counts)) - 48 : cy + (genHeight[d.source.distance]) + scaleRadius(Math.sqrt(d.source.record_counts)) + 18
                                        targetY = d.source.distance >= d.target.distance ? cy + (genHeight[d.target.distance]) + scaleRadius(Math.sqrt(d.target.record_counts)) + 18 : cy + (genHeight[d.target.distance]) - scaleRadius(Math.sqrt(d.target.record_counts)) - 48
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
                                .attr('fill', d => (inclusions.includes(d.source.name) || d.source.mappings.map(m => m.name).some(m => inclusions.includes(m))) && (inclusions.includes(d.target.name) || d.target.mappings.map(m => m.name).some(m => inclusions.includes(m))) ? '#c2c2c2' : '#e8e8e8')
                                .attr("d", d3.symbol().type(d3.symbolTriangle).size(arrowSize))
                                .attr("transform", d => {
                                    let x = d.target.collapsed ? d.target.collapsed : d.target.x
                                    let y
                                    if (countType === 'record' || countType === 'measurement') y = d.source.distance >= d.target.distance ? d.target.record_counts !== 0 ? cy + (genHeight[d.target.distance]) + scaleRadius(Math.sqrt(d.target.record_counts)) + 18 : cy + (genHeight[d.target.distance]) + scaleRadius(Math.sqrt(d.target.record_counts)) + 25 : d.target.record_counts !== 0 ? cy + (genHeight[d.target.distance]) - scaleRadius(Math.sqrt(d.target.record_counts)) - 48 : cy + (genHeight[d.target.distance]) - scaleRadius(Math.sqrt(d.target.record_counts)) - 50
                                    else y = d.source.distance >= d.target.distance ? d.target.person_counts !== 0 ? cy + (genHeight[d.target.distance]) + scaleRadius(Math.sqrt(d.target.person_counts)) + 18 : cy + (genHeight[d.target.distance]) + scaleRadius(Math.sqrt(d.target.person_counts)) + 25 : d.target.person_counts !== 0 ? cy + (genHeight[d.target.distance]) - scaleRadius(Math.sqrt(d.target.person_counts)) - 48 : cy + (genHeight[d.target.distance]) - scaleRadius(Math.sqrt(d.target.person_counts)) - 50
                                    return d.source.distance >= d.target.distance ? "translate(" + x + "," + y + ")" : "translate(" + x + "," + y + ")rotate(" + 180 + ")"
                                })    
                    },exit => exit.remove())
            }

            // FOCUS RECT
            const OUTER_PAD = 20  
            function layoutFocusRects(sel) {
                const items = []

                // Measure each node's content (rect hidden so it doesn't count toward its own bbox)
                sel.each(function (d) {
                    const rect = d3.select(this).select('.focus-rect')
                    rect.style('display', 'none')
                    const b = this.getBBox()
                    if (d.levels === '-1' || (b.width === 0 && b.height === 0)) return // stays hidden
                    rect.style('display', null)
                    items.push({ d, rect, x0: b.x, x1: b.x + b.width, y0: b.y, y1: b.y + b.height })
                })

                // Group by layer
                const rows = d3.group(items, i => i.d.distance)

                // Vertical extent of each layer, ordered top to bottom
                const bands = [...rows].map(([dist, row]) => ({
                    dist,
                    row,
                    top: d3.min(row, i => i.y0),
                    bottom: d3.max(row, i => i.y1)
                })).sort((a, b) => a.top - b.top)

                bands.forEach((band, bi) => {
                    const prevBand = bands[bi - 1]
                    const nextBand = bands[bi + 1]

                    // Split the space between layers at the midpoint (never cut into own content)
                    const y0 = prevBand ? Math.min(band.top, (prevBand.bottom + band.top) / 2) : band.top - OUTER_PAD
                    const y1 = nextBand ? Math.max(band.bottom, (band.bottom + nextBand.top) / 2) : band.bottom + OUTER_PAD

                    // Split the space between neighbours in the layer at the midpoint
                    const row = band.row.sort((a, b) => a.x0 - b.x0)
                    row.forEach((it, i) => {
                        const prev = row[i - 1], next = row[i + 1]
                        const x0 = prev ? Math.min(it.x0, (prev.x1 + it.x0) / 2) : it.x0 - OUTER_PAD
                        const x1 = next ? Math.max(it.x1, (it.x1 + next.x0) / 2) : it.x1 + OUTER_PAD

                        it.rect
                            .attr('x', x0)
                            .attr('y', y0)
                            .attr('width', x1 - x0)
                            .attr('height', y1 - y0)
                    })
                })
            }
            function bindTreeNodeHover(sel) {
                sel.on('mouseenter', function (e, d) {
                    const el = this
                    el.__hoverTimeout__ = setTimeout(() => {
                        if (treeZoomedRef.current || d.collapsed) return
                        cancelMinimapHide()
                        if (relationship === 'mappings') {
                            setZoomedNodes([d, ...d.mappings])
                        } else {
                            const neighborhood = [d.name, ...d.parents, ...d.children]
                            setZoomedNodes(nodes.filter(n => neighborhood.includes(n.name)))
                            setZoomedLinks(links.filter(l => neighborhood.includes(l.source.name) && neighborhood.includes(l.target.name)))
                        }
                        setFocused(d.name)
                    }, 1200)
                })
                .on('mouseleave', function () {
                    clearTimeout(this.__hoverTimeout__)
                    scheduleMinimapHide()     // was: clear all three states immediately
                })
            }
            
            // DRAW NODES
            function updateNodes() {
                d3.select('#nodes').selectAll('.tree-node').data(nodes, d => d.name)
                    .join(enter => {
                        const geometry = enter.append('g')
                            .classed('tree-node', true)
                            .attr('id', d => 'tree-node-'+d.name)
                        geometry.selectAll(".map-node").data(d => bindMappings(d), d => d.name + d.source.name)
                        //Mappings
                        .join(enter => {
                            const geometry = enter.append('g')
                                .classed('map-node',true)
                                .style('display', d => isMapVisible(d) ? null : 'none')
                            const mapNode = geometry.append('g')
                                .classed('map-node-main btn', true)
                                .attr('id', d => 'map-node-'+d.name)
                                .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.4 : 1)
                            const mapLine = mapNode.append('g')
                                .classed('map-link',true)
                                .style('display', d => mapRoot.includes(d.source.name) ? 'block' : 'none')
                                .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.4 : 1)
                                .lower()
                            mapLine.append('path')
                                .classed('map-line', true)
                                .attr('fill','none')
                                .attr('stroke-width', 1.5)
                                .attr('stroke-dasharray', '4 2')
                                .attr('stroke', d => inclusions.includes(d.name) ? '#c2c2c2' : '#e8e8e8')
                                .attr("d", d => {
                                    let sourceX = getMap(d).x 
                                    let sourceY = mapRoot.includes(d.source.name) ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) : cy + (genHeight[d.distance])
                                    let targetY = cy + (genHeight[d.distance])
                                    let targetX
                                    if (countType === 'record' || countType === 'measurement') targetX = mapRoot.includes(d.source.name) ? d.direction === -1 ? d.source.x - scaleRadius(Math.sqrt(d.source.record_counts)) - 24 : d.source.x + scaleRadius(Math.sqrt(d.source.record_counts)) + 24 : getMap(d).x 
                                    else targetX = mapRoot.includes(d.source.name) ? d.direction === -1 ? d.source.x - scaleRadius(Math.sqrt(d.source.person_counts)) - 24 : d.source.x + scaleRadius(Math.sqrt(d.source.person_counts)) + 24 : getMap(d).x 
                                    return curveX({source: [sourceX, sourceY], target: [targetX, targetY]})}
                                )
                                .lower()
                            mapLine.append('path')
                                .classed('map-tree-arrow', true)
                                .attr('id', d => 'map-arrow-'+d.name)
                                .attr('fill', d => d._siblings.some(m => inclusions.includes(m.name)) ? '#c2c2c2' : '#e8e8e8')
                                .attr("d", d3.symbol().type(d3.symbolTriangle).size(arrowSize))
                                .attr("transform", d => {
                                    let x 
                                    if (countType === 'record' || countType === 'measurement') x = d.direction === -1 ? d.source.x - scaleRadius(Math.sqrt(d.source.record_counts)) - 26 : getMap(d).x - scaleRadius(Math.sqrt(d.record_counts)) - 5
                                    else x = d.direction === -1 ? d.source.x - scaleRadius(Math.sqrt(d.source.person_counts)) - 26 : getMap(d).x - scaleRadius(Math.sqrt(d.person_counts)) - 5
                                    let y = d.direction === -1 ? cy + (genHeight[d.distance]) : getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d)
                                    return "translate(" + x + "," + y + ")rotate(" + 90 + ")"
                                }) 
                            mapNode.append('circle')
                                .classed('map-tree-circle-background', true)
                                .attr('r', d => !mapRoot.includes(d.source.name) ? 0 : countType === 'record' || countType === 'measurement' ? scaleRadius(Math.sqrt(d.record_counts)) + 2 : scaleRadius(Math.sqrt(d.person_counts)) + 2)
                                .attr('cx', d => getMap(d).x)
                                .attr('cy', d => mapRoot.includes(d.source.name) ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) : getYPosition(d.source, 'z', cy + (genHeight[d.distance]), d))
                            mapNode.append('circle')
                                .attr('class', d => `map-tree-circle btn map-circle-${d.source.name}`)
                                .attr('id', d => 'tree-circle-' + d.name)
                                .attr('r', d => !mapRoot.includes(d.source.name) ? 12 : countType === 'record' || countType === 'measurement' ? scaleRadius(Math.sqrt(d.record_counts)) : scaleRadius(Math.sqrt(d.person_counts)))
                                .style('fill', d => {
                                    if ((countType === 'record' && (d.record_counts === 0 || (d.source.leaf && relationship === 'mappings' && countType !== 'person'))) || (countType === 'person' && (d.person_counts === 0 && relationship === 'mappings' && countType !== 'person'))) return 'white'
                                    // if ((countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0) && mapRoot.includes(d.source.name)) return 'white'
                                    else {
                                        if (inclusions.includes(d.name)) {
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
                                            if (mapRoot.includes(d.source.name)) return '#f3f3f5'
                                            else return '#e6e6ea'
                                        }    
                                    }
                                })
                                .attr('stroke', d => mapRoot.includes(d.source.name) ? inclusions.includes(d.name) ? d.source.leaf ? d.source.color : d.color : (countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0) ? 'none' : '#dfdfe0' : d.source.leaf && relationship === 'mappings' && countType !== 'person' ? d.source.color : 'white')
                                .attr('stroke-width', 1.5)
                                .attr('cx', d => getMap(d).x)
                                .attr('cy', d => mapRoot.includes(d.source.name) ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) : getYPosition(d.source, 'z', cy + (genHeight[d.distance]), d))
                                .on('mouseover',(e,d) => {
                                    e.stopPropagation()
                                    overrideNodeHover(e)
                                    hoverMappings(d.source,'enter')
                                    setVisible(false)
                                })
                                .on('mouseout',(e,d) => {hoverMappings(d.source,'leave');setVisible(false)})
                                .on('click',(e,d) => {
                                    if (!mapRoot.includes(d.source.name)) {
                                        pendingMapZoomRef.current = d.name
                                        setMapRoot([...mapRoot,d.source.name])
                                        updateWidth([...mapRoot,d.source.name])    
                                    } 
                                    // else {
                                    //     setMapRoot([...mapRoot,d.source.name])
                                    //     updateWidth([...mapRoot,d.source.name])
                                    // }
                                    
                                })
                                .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                                .style('pointer-events', d => mapRoot.includes(d.source.name) ? 'none' : 'all')
                                .raise()
                            mapNode.append('text')
                                .classed('map-count-label num', true)
                                .attr('text-anchor', 'middle')
                                .attr('fill', '#36126d')
                                .style('font-size', '9px')
                                .style('opacity', 0.6)
                                .style('pointer-events', 'none')
                                .style('display', d => isCountAnchor(d) ? 'block' : 'none')
                                .text(countText)
                                .attr('x', d => getMap(d).x)
                                .attr('y', countY)
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
                                .text(d => countType === 'record' || countType === 'measurement' ? formatThousands(d.record_counts) : formatThousands(d.person_counts))
                                .attr('fill', d => inclusions.includes(d.name) ? d.source.leaf && relationship === 'mappings' && countType !== 'person' ? '#36126d' : getContrastColor(d.color) : '#36126d')
                                .style('font-size', '9px')
                                .attr('x', d => getMap(d).x)
                                .attr('y', d => getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) - 1)
                            mapCounts.append('text')
                                .classed('map-total-counts-label', true)
                                .style('font-size', '9px')
                                .text(() => countType === 'record' || countType === 'measurement' ? 'RC' : 'PC')
                                .attr('fill', d => inclusions.includes(d.name) ? d.source.leaf && relationship === 'mappings' && countType !== 'person' ? '#36126d' : getContrastColor(d.color) : '#36126d')
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
                                .attr('y', d => countType === 'record' || countType === 'measurement' ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) + scaleRadius(Math.sqrt(d.record_counts)) + 18 : getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) + scaleRadius(Math.sqrt(d.person_counts)) + 18)
                            mapDrcText.append('tspan')
                                .classed('map-drc-num num',true)
                                .text(d => countType === 'record' || countType === 'measurement' ? formatThousands(d.descendant_record_counts) : formatThousands(d.descendant_person_counts))
                                .raise()
                            mapDrcText.append('tspan')
                                .classed('map-drc-label-tree',true)
                                .text(() => countType === 'record' || countType === 'measurement' ? ' DRC' : ' DPC')
                            mapDrc.append('rect')
                                .classed('map-drc-rect',true)
                                .attr('height',16)
                                .attr("rx", 8)
                                .attr("ry", 8)
                                .attr('fill', d => countType === 'record' || countType === 'measurement' ? d.descendant_record_counts === 0 || d.descendant_record_counts === d.record_counts  ? 'transparent' : '#f3f3f5' : d.descendant_person_counts === 0 || d.descendant_person_counts === d.person_counts  ? 'transparent' : '#f3f3f5')
                                .attr('width',d => d3.select('#drc-text-'+d.name).node().getBBox().width + 10)
                                .attr('x', d => getMap(d).x - (d3.select('#drc-text-'+d.name).node().getBBox().width + 10)/2)
                                .attr('y', d => countType === 'record' || countType === 'measurement' ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) + scaleRadius(Math.sqrt(d.record_counts)) + 7 : getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) + scaleRadius(Math.sqrt(d.person_counts)) + 7)
                                .lower()
                            const mapLabel = mapGroup.append('g')
                                .classed('map-label btn', true)
                                .on('mouseover', function (e,d) {
                                    overrideNodeHover(e)
                                    const el = this
                                    el.__hoverTimeout__ = setTimeout(() => {
                                        if (inclusions.includes(d.name)) setHovered([d.name])
                                        if (d.levels !== '-1') tooltipHover(d, "enter", e)  
                                    }, 600)    
                                })
                                .on('mouseout', function (e,d) {
                                    const el = this
                                    clearTimeout(el.__hoverTimeout__)
                                    setHovered([])
                                    tooltipHover(d, "leave", e)   
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
                                .style('opacity', d => inclusions.includes(d.name) ? 1 : 0.6)
                            const mapLine2 = mapText.append('text')
                                .classed('map-label-line2',true)
                                .attr('text-anchor', 'middle')
                                .attr('fill', '#4c4c4c')
                                .style('opacity', d => inclusions.includes(d.name) ? 1 : 0.6)
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
                                .attr('fill', d => inclusions.includes(d.name) ? 'white' : '#f2f2f4')
                                .style("filter", d => inclusions.includes(d.name) ? "drop-shadow(0px 0px 4px rgba(0, 0, 0, 0.16))" : 'none')
                                .attr('stroke-width',1)
                                .attr('stroke', d => rootConcepts.includes(d.name) ? '#7728ED' : 'transparent')
                                .lower()
                            geometry.append('rect')
                                .classed('map-rect btn', true)
                                .style('display', d => mapRoot.includes(d.source.name) ? 'block' : 'none')
                                .style('pointer-events', 'all')
                                .attr('fill', 'transparent')
                                .each(function (d) {
                                    const b = mapHitBox(d)
                                    d3.select(this).attr('x', b.x).attr('y', b.y).attr('width', b.width).attr('height', b.height)
                                })
                                .raise()                                       
                            bindMapHover(geometry)
                        }, update => {
                            update
                                .style('display', d => isMapVisible(d) ? null : 'none')
                            update.select('.map-node-main')
                                .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.4 : 1)
                            update.select('.map-link')
                                .style('display', d => mapRoot.includes(d.source.name) ? 'block' : 'none')
                                .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.4 : 1)
                            update.select('.map-line')
                                .attr('stroke', d => inclusions.includes(d.name) ? '#c2c2c2' : '#e8e8e8')
                                .attr("d", d => {
                                    let sourceX = getMap(d).x 
                                    let sourceY = mapRoot.includes(d.source.name) ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) : cy + (genHeight[d.distance])
                                    let targetY = cy + (genHeight[d.distance])
                                    let targetX
                                    if (countType === 'record' || countType === 'measurement') targetX = mapRoot.includes(d.source.name) ? d.direction === -1 ? d.source.x - scaleRadius(Math.sqrt(d.source.record_counts)) - 24 : d.source.x + scaleRadius(Math.sqrt(d.source.record_counts)) + 24 : getMap(d).x 
                                    else targetX = mapRoot.includes(d.source.name) ? d.direction === -1 ? d.source.x - scaleRadius(Math.sqrt(d.source.person_counts)) - 24 : d.source.x + scaleRadius(Math.sqrt(d.source.person_counts)) + 24 : getMap(d).x 
                                    return curveX({source: [sourceX, sourceY], target: [targetX, targetY]})}
                                )
                            update.select('.map-tree-arrow')
                                .attr('fill', d => d._siblings.some(m => inclusions.includes(m.name)) ? '#c2c2c2' : '#e8e8e8')
                                .attr("d", d3.symbol().type(d3.symbolTriangle).size(arrowSize))
                                .attr("transform", d => {
                                    let x 
                                    if (countType === 'record' || countType === 'measurement') x = d.direction === -1 ? d.source.x - scaleRadius(Math.sqrt(d.source.record_counts)) - 26 : getMap(d).x - scaleRadius(Math.sqrt(d.record_counts)) - 5
                                    else x = d.direction === -1 ? d.source.x - scaleRadius(Math.sqrt(d.source.person_counts)) - 26 : getMap(d).x - scaleRadius(Math.sqrt(d.person_counts)) - 5
                                    let y = d.direction === -1 ? cy + (genHeight[d.distance]) : getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d)
                                    return "translate(" + x + "," + y + ")rotate(" + 90 + ")"
                                })  
                            update.select('.map-rect')
                                .style('display', d => mapRoot.includes(d.source.name) ? 'block' : 'none')
                                .each(function (d) {
                                    const b = mapHitBox(d)
                                    d3.select(this).attr('x', b.x).attr('y', b.y).attr('width', b.width).attr('height', b.height)
                                })
                            bindMapHover(update)
                            update.select('.map-tree-circle-background')
                                .attr('r', d => !mapRoot.includes(d.source.name) ? 0 : countType === 'record' || countType === 'measurement' ? scaleRadius(Math.sqrt(d.record_counts)) + 2 : scaleRadius(Math.sqrt(d.person_counts)) + 2)
                                .attr('cx', d => getMap(d).x)
                                .attr('cy', d => mapRoot.includes(d.source.name) ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) : getYPosition(d.source, 'z', cy + (genHeight[d.distance]), d))
                            update.select('.map-tree-circle')
                                .attr('r', d => !mapRoot.includes(d.source.name) ? 12 : countType === 'record' || countType === 'measurement' ? scaleRadius(Math.sqrt(d.record_counts)) : scaleRadius(Math.sqrt(d.person_counts)))
                                .style('fill', d => {
                                    if ((countType === 'record' && (d.record_counts === 0 || (d.source.leaf && relationship === 'mappings' && countType !== 'person'))) || (countType === 'person' && (d.person_counts === 0 && relationship === 'mappings' && countType !== 'person'))) return 'white'
                                    // if ((countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0) && mapRoot.includes(d.source.name)) return 'white'
                                    else {
                                        if (inclusions.includes(d.name)) {
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
                                            if (mapRoot.includes(d.source.name)) return '#f3f3f5'
                                            else return '#e6e6ea'
                                        }    
                                    }
                                })
                                .attr('stroke', d => mapRoot.includes(d.source.name) ? inclusions.includes(d.name) ? d.source.leaf ? d.source.color : d.color : (countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0) ? 'none' : '#dfdfe0' : d.source.leaf && relationship === 'mappings' && countType !== 'person' ? d.source.color : 'white')
                                .attr('cx', d => getMap(d).x)
                                .attr('cy', d => mapRoot.includes(d.source.name) ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) : getYPosition(d.source, 'z', cy + (genHeight[d.distance]), d))
                                .on('mouseover',(e,d) => {
                                    e.stopPropagation()
                                    overrideNodeHover(e)
                                    hoverMappings(d.source,'enter')
                                    setVisible(false)
                                })
                                .on('mouseout',(e,d) => {hoverMappings(d.source,'leave');setVisible(false)})
                                .on('click',(e,d) => {
                                    if (!mapRoot.includes(d.source.name)) {
                                        pendingMapZoomRef.current = d.name
                                        setMapRoot([...mapRoot,d.source.name])
                                        updateWidth([...mapRoot,d.source.name])    
                                    } 
                                    // else {
                                    //     setMapRoot([...mapRoot,d.source.name])
                                    //     updateWidth([...mapRoot,d.source.name])
                                    // }
                                    
                                })
                                .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                                .style('pointer-events', d => mapRoot.includes(d.source.name) ? 'none' : 'all')
                            update.select('.map-count-label')
                                .style('display', d => isCountAnchor(d) ? 'block' : 'none')
                                .text(countText)
                                .attr('x', d => getMap(d).x)
                                .attr('y', countY)
                            update.select('.map-group')
                                .style('display', d => mapRoot.includes(d.source.name) ? 'block' : 'none')
                            update.select('.map-total-counts')
                                .text(d => countType === 'record' || countType === 'measurement' ? formatThousands(d.record_counts) : formatThousands(d.person_counts))
                                .attr('fill', d => inclusions.includes(d.name) ? d.source.leaf && relationship === 'mappings' && countType !== 'person' ? '#36126d' : getContrastColor(d.color) : '#36126d')
                                .attr('x', d => getMap(d).x)
                                .attr('y', d => getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) - 1)
                            update.select('.map-total-counts-label')
                                .text(() => countType === 'record' || countType === 'measurement' ? 'RC' : 'PC')
                                .attr('fill', d => inclusions.includes(d.name) ? d.source.leaf && relationship === 'mappings' && countType !== 'person' ? '#36126d' : getContrastColor(d.color) : '#36126d')
                                .attr('x', d => getMap(d).x - 6)
                                .attr('y', d => getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) + 9)
                            update.select('.map-drc-group')
                                .classed('map-drc-group',true)
                                .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                            update.select('.map-drc-text')
                                .attr('x', d => getMap(d).x)
                                .attr('y', d => countType === 'record' || countType === 'measurement' ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) + scaleRadius(Math.sqrt(d.record_counts)) + 18 : getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) + scaleRadius(Math.sqrt(d.person_counts)) + 18)
                            update.select('.map-drc-num')
                                .text(d => countType === 'record' || countType === 'measurement' ? formatThousands(d.descendant_record_counts) : formatThousands(d.descendant_person_counts))
                            update.select('.map-drc-label-tree')
                                .text(() => countType === 'record' || countType === 'measurement' ? ' DRC' : ' DPC')
                            update.select('.map-drc-rect')
                                .attr('fill', d => countType === 'record' || countType === 'measurement' ? d.descendant_record_counts === 0 || d.descendant_record_counts === d.record_counts  ? 'transparent' : '#f3f3f5' : d.descendant_person_counts === 0 || d.descendant_person_counts === d.person_counts  ? 'transparent' : '#f3f3f5')
                                .attr('width',d => d3.select('#drc-text-'+d.name).node().getBBox().width + 10)
                                .attr('x', d => getMap(d).x - (d3.select('#drc-text-'+d.name).node().getBBox().width + 10)/2)
                                .attr('y', d => countType === 'record' || countType === 'measurement' ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) + scaleRadius(Math.sqrt(d.record_counts)) + 7 : getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) + scaleRadius(Math.sqrt(d.person_counts)) + 7)
                            update.select('.map-label')
                                .on('mouseover', function (e,d) {
                                    overrideNodeHover(e)
                                    const el = this
                                    el.__hoverTimeout__ = setTimeout(() => {
                                        if (inclusions.includes(d.name)) setHovered([d.name])
                                        if (d.levels !== '-1') tooltipHover(d, "enter", e)  
                                    }, 600)    
                                })
                                .on('mouseout', function (e,d) {
                                    const el = this
                                    clearTimeout(el.__hoverTimeout__)
                                    setHovered([])
                                    tooltipHover(d, "leave", e)   
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
                                .style('opacity', d => inclusions.includes(d.name) ? 1 : 0.6)
                            update.select('.map-label-line2')
                                .style('opacity', d => inclusions.includes(d.name) ? 1 : 0.6)
                                .attr('x', d => getMap(d).x)
                                .attr('y', d => getMap(d).y - 7)
                            update.select('.map-label-rect')
                                .attr('width', d => d3.select("#label-text-" + d.name).node().getBBox().width + 16)
                                .attr('x', d => getMap(d).x - (d3.select("#label-text-" + d.name).node().getBBox().width + 16)/2)
                                .attr('y', d => getMap(d).y - 35)
                                .attr('fill', d => inclusions.includes(d.name) ? 'white' : '#f2f2f4')
                                .style("filter", d => inclusions.includes(d.name) ? "drop-shadow(0px 0px 4px rgba(0, 0, 0, 0.16))" : 'none')
                                .attr('stroke', d => rootConcepts.includes(d.name) ? '#7728ED' : 'transparent')
                        },exit => exit.remove())
                        //Subsumes node
                        const nodeContainer = geometry.append('g')  
                        const node = nodeContainer.append('g')  
                            .classed('subsumes-node', true)
                            .attr('id', d => 'subsumes-node-'+d.name)
                            .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.4 : 1)
                            .lower()
                        nodeContainer.append('rect')
                            .classed('node-rect btn',true)
                            .style('display', d => d.levels === '-1' ? 'none' : 'block')
                            .attr('fill','transparent')
                            .attr('x', d => d.x - 60)
                            .attr('y', d => countType === 'record' || countType === 'measurement' ? cy + (genHeight[d.distance]) - (120 + scaleRadius(Math.sqrt(d.record_counts)))/2 : cy + (genHeight[d.distance]) - (120 + scaleRadius(Math.sqrt(d.person_counts)))/2)
                            .attr('width',200)
                            .attr('height', d => countType === 'record' || countType === 'measurement' ? 100 + scaleRadius(Math.sqrt(d.record_counts)) : 100 + scaleRadius(Math.sqrt(d.person_counts)))
                            .on('mouseover', function (e,d) {
                                const el = this
                                el.__hoverTimeout__ = setTimeout(() => {
                                    // if (inclusions.includes(d.name) || (countType === 'record' && d.leaf) || (countType === 'person' && d.leaf && relationship !== 'mappings')) setHovered([d.name])
                                    setHovered([d.name])
                                    // const neighborhood = [d.name,...d.parents,...d.children]
                                    // const neighborhoodNodes = nodes.filter(n => neighborhood.includes(n.name))
                                    // const neighborhoodLinks = links.filter(l => neighborhood.includes(l.source.name) && neighborhood.includes(l.target.name))
                                    // setZoomedNodes(neighborhoodNodes)
                                    // setZoomedLinks(neighborhoodLinks)
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
                            .attr('r', d => countType === 'record' || countType === 'measurement' ? scaleRadius(Math.sqrt(d.record_counts)) + 2 : scaleRadius(Math.sqrt(d.person_counts)) + 2)
                            .attr('cx', d => d.x)
                            .attr('cy', d => cy + (genHeight[d.distance]))
                        nodeGroup.append('circle')
                            .classed('tree-circle btn', true)
                            .attr('id', d => 'tree-circle-' + d.name)
                            .attr('r', d => countType === 'record' || countType === 'measurement' ? scaleRadius(Math.sqrt(d.record_counts)) : scaleRadius(Math.sqrt(d.person_counts)))
                            .attr('stroke-width',1.5)
                            .attr('stroke', d => (countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0) ? 'none' : inclusions.includes(d.name) ? d.color : '#dfdfe0')
                            .attr('fill', d => {
                                if ((countType === 'record' && d.record_counts === 0) || (d.leaf && relationship !== 'mappings') || (countType === 'person' && d.person_counts === 0)) return 'white'
                                else {
                                    if (!d.data.concept.standard_concept && inclusions.includes(d.name)) {
                                        let t = textures.lines()
                                            .size(3)
                                            .strokeWidth(1.5)
                                            .stroke(d.color)  
                                        d3.select('#tree').call(t)
                                        return t.url()  
                                    } 
                                    else if (d.data.concept.standard_concept && inclusions.includes(d.name)) {
                                        return d.color
                                    } else {return '#f3f3f5'}    
                                }
                            })
                            .attr('cx', d => d.x)
                            .attr('cy', d => cy + (genHeight[d.distance]))
                            .attr('pointer-events', d => (countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0) || d.levels === "-1" || d.leaf ? "none" : "all")
                        const nodeLabel = nodeGroup.append('g')
                            .attr('id', d => 'node-label-'+d.name)
                            .style('opacity',1)
                        nodeLabel.append('text')
                            .classed('total-counts num', true)
                            .attr('id', d => 'total-counts-' + d.name)
                            .text(d => countType === 'record' || countType === 'measurement' ? formatThousands(d.record_counts) : formatThousands(d.person_counts))
                            .attr('fill', d => inclusions.includes(d.name) && !d.leaf ? getContrastColor(d.color) : '#36126d')
                            .style('font-size', '9px')
                            .attr('x', d => d.x)
                            .attr('y', d => cy + (genHeight[d.distance]) - 1)
                        nodeLabel.append('text')
                            .classed('total-counts-label', true)
                            .style('font-size', '9px')
                            .text(() => countType === 'record' || countType === 'measurement' ? 'RC' : 'PC')
                            .attr('fill', d => inclusions.includes(d.name) && !d.leaf ? getContrastColor(d.color) : '#36126d')
                            .attr('x', d => d.x - 6)
                            .attr('y', d => cy + (genHeight[d.distance]) + 9)
                        const setExpression = geometry.append('g')
                            .classed('set-expression',true)
                            .style('display', d => rootConcepts.includes(d.name) ? 'block' : 'none')
                            .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                            .attr('transform', d => {
                                const xVar = (countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0) ? 28 : 13
                                if (d.data.concept.standard_concept) return countType === 'record' || countType === 'measurement' ? `translate(${d.x + scaleRadius(Math.sqrt(d.record_counts)) + xVar}, 0)` : `translate(${d.x + scaleRadius(Math.sqrt(d.person_counts)) + xVar}, 0)`
                                else return countType === 'record' || countType === 'measurement' ? `translate(${d.x - scaleRadius(Math.sqrt(d.record_counts)) - xVar}, 0)` : `translate(${d.x - scaleRadius(Math.sqrt(d.person_counts)) - xVar}, 0)`
                            })
                        // setExpression.append('rect')
                        //     .classed('set-expression-rect',true)
                        //     .attr('x', -10)
                        //     .attr('y', d => cy + (genHeight[d.distance]) - 24)
                        //     .attr("filter", "drop-shadow(0px 0px 4px rgba(0, 0, 0, 0.1))")
                        //     .attr('width',97)
                        //     .attr('height',48)
                        //     .attr('rx',6)
                        //     .attr('ry',6)
                        //     .attr('fill','white')
                        //     .lower()
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
                            .attr('stroke', d => descendantsFilter.includes(d.name) ? '#e8e8e8' : '#989898')
                            .attr('x', d => d.data.concept.standard_concept ? -2 : -11)
                            .attr('y', d => cy + (genHeight[d.distance]) + 2)
                        descendantsBtn.append('text')
                            .classed('tree-descendants-check fa-solid',true)
                            .text('\uf00c')
                            .style('opacity',0.6)
                            .attr('font-size', 10)
                            .attr('fill', d => descendantsFilter.includes(d.name) ? 'none' : '#36126d')
                            .attr('x', 0.5)
                            .attr('y', d => cy + (genHeight[d.distance]) + 12)
                        descendantsBtn.append('text')
                            .classed("tree-descendants-text",true)
                            .text('Descendants')
                            .style('opacity', 0.8)
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
                            .attr('stroke', d => !excludeList.includes(d.name) ? '#e8e8e8' : '#989898')
                            .attr('x', d => d.data.concept.standard_concept ? -2 : -11)
                            .attr('y', d => cy + (genHeight[d.distance]) - 16)
                        excludeBtn.append('text')
                            .classed('tree-exclude-check fa-solid',true)
                            .text('\uf00c')
                            .style('opacity',0.6)
                            .attr('font-size', 10)
                            .attr('fill', d => excludeList.includes(d.name) ? '#36126d' : 'none')
                            .attr('x', 0.5)
                            .attr('y', d => cy + (genHeight[d.distance]) - 6)
                        excludeBtn.append('text')
                            .classed("tree-exclude-text",true)
                            .text('Exclude')
                            .style('opacity', 0.8)
                            .attr('fill', d => !excludeList.includes(d.name) ? '#4c4c4c' : '#36126d')
                            .attr('font-weight', d => !excludeList.includes(d.name) ? 400 : 500)
                            .attr('x', d => d.data.concept.standard_concept ? 16 : -16)
                            .attr('y', d => cy + (genHeight[d.distance]) - 5)    
                        const mappingsBtnGroup = geometry.append('g')
                            .classed('mappings-btn-group', true)
                            .style('display', d => d.mappings.length > 0 ? 'block' : 'none')
                        mappingsBtnGroup.append('rect')
                            .classed('mappings-btn-rect btn', true)
                            .attr('x', d => {
                                if (d.data.concept.standard_concept) return countType === 'record' || countType === 'measurement' ? d.x - scaleRadius(Math.sqrt(d.record_counts)) - 15 : d.x - scaleRadius(Math.sqrt(d.person_counts)) - 15 
                                else return countType === 'record' || countType === 'measurement' ? d.x + scaleRadius(Math.sqrt(d.record_counts)) + 8 : d.x + scaleRadius(Math.sqrt(d.person_counts)) + 8
                            })
                            .attr('y', d => cy + (genHeight[d.distance]) - 20)
                            .attr('width',12)
                            .attr('height',40)
                            .attr('fill','transparent')
                            .style('pointer-events','all')
                            .on('mouseover',(e,d) => {
                                e.stopPropagation()
                                overrideNodeHover(e)
                                hoverMappings(d,'enter')
                                setVisible(false)
                                const el = e.currentTarget
                                el.__hoverTimeout__ = setTimeout(() => {
                                    !mapRoot.includes(d.name) ? showActionLabel('Open mappings','enter',e) : showActionLabel('Close mappings','enter',e)
                                }, 1200)
                            })
                            .on('mouseout',(e,d) => {
                                e.stopPropagation()
                                hoverMappings(d,'leave')
                                setVisible(false)
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave',e)
                            })
                            .on('click',(e,d) => {
                                e.stopPropagation()
                                if (mapRoot.includes(d.name)) {
                                    pendingMapZoomRef.current = null
                                    const el = document.getElementById('tree-circle-' + d.name)
                                    skipNextFitRef.current = el
                                        ? { name: d.name, screen: el.getBoundingClientRect() }
                                        : true
                                    let filteredRoots = mapRoot.filter(e => e !== d.name)
                                    setMapRoot(filteredRoots)
                                    updateWidth(filteredRoots)    
                                } else {
                                    pendingMapZoomRef.current = d.name
                                    setMapRoot([...mapRoot,d.name])
                                    updateWidth([...mapRoot,d.name])
                                }
                            })
                        mappingsBtnGroup.append('text')
                            .classed('mappings-btn mappingBtn fa-solid', true)
                            .attr('id', d => 'mappings-btn-' + d.name)
                            .text(d => mapRoot.includes(d.name) && d.mappings.length > 0 ? "\uf00d" : d.data.concept.standard_concept ? "\uf0da" : "\uf0d9")
                            .style('font-size', d => mapRoot.includes(d.name) && d.mappings.length > 0 ? '14px' : '15px')
                            .style('opacity', d => hovered.length > 0 ? 0.1 : 0.3)
                            .style('pointer-events','none')
                            .attr('x', d => {
                                if (d.data.concept.standard_concept) return countType === 'record' || countType === 'measurement' ? d.x - scaleRadius(Math.sqrt(d.record_counts)) - 15 : d.x - scaleRadius(Math.sqrt(d.person_counts)) - 15 
                                else return countType === 'record' || countType === 'measurement' ? d.x + scaleRadius(Math.sqrt(d.record_counts)) + 8 : d.x + scaleRadius(Math.sqrt(d.person_counts)) + 8
                            })
                            .attr('y', d => cy + (genHeight[d.distance]) + 5.5)
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
                            .attr('fill', d => ((d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings')) ? 'white' : '#36126d')
                            .attr('opacity', d => ((d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings')) ? 1 : 0.6)
                            .attr('x', d => d.x)
                            .attr('y', d => countType === 'record' || countType === 'measurement' ? cy + (genHeight[d.distance]) + scaleRadius(Math.sqrt(d.record_counts)) + 18 : cy + (genHeight[d.distance]) + scaleRadius(Math.sqrt(d.person_counts)) + 18)
                        drcText.append('tspan')
                            .classed('drc-num num',true)
                            .text(d => countType === 'record' || countType === 'measurement' ? formatThousands(d.descendant_record_counts) : formatThousands(d.descendant_person_counts))
                            .raise()
                        drcText.append('tspan')
                            .classed('drc-label-tree',true)
                            .text(() => countType === 'record' || countType === 'measurement' ? ' DRC' : ' DPC')
                        drc.append('rect')
                            .classed('drc-rect',true)
                            .attr('height',16)
                            .attr("rx", 8)
                            .attr("ry", 8)
                            .attr('fill', d => ((d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings')) ? d.color : countType === 'record' || countType === 'measurement' ? d.descendant_record_counts === 0 || d.descendant_record_counts === d.record_counts ? 'transparent' : '#f3f3f5' : d.descendant_person_counts === 0 || d.descendant_person_counts === d.person_counts ? 'transparent' : '#f3f3f5')
                            .attr('width',d => d3.select('#drc-text-'+d.name).node().getBBox().width + 10)
                            .attr('x', d => d.x - (d3.select('#drc-text-'+d.name).node().getBBox().width + 10)/2)
                            .attr('y', d => countType === 'record' || countType === 'measurement' ? cy + (genHeight[d.distance]) + scaleRadius(Math.sqrt(d.record_counts)) + 7 : cy + (genHeight[d.distance]) + scaleRadius(Math.sqrt(d.person_counts)) + 7)
                            .lower()
                        const label = node.append('g')
                            .classed('label btn', true)
                            // .on('mouseover', (e, d) => {
                            //     if (!rootConcepts.includes(d.name)) {
                            //         const el = e.currentTarget
                            //         el.__hoverTimeout__ = setTimeout(() => {
                            //             showActionLabel('Select concept','enter',e)
                            //         }, 1200)    
                            //     }
                            // })
                            .on('mouseover', (e, d) => {
                                const el = e.currentTarget
                                if (d.collapsed) {
                                    el.__hoverTimeout__ = setTimeout(() => showActionLabel('Choose top-level concepts','enter',e), 1200)
                                    return
                                }
                                if (!rootConcepts.includes(d.name)) {
                                    el.__hoverTimeout__ = setTimeout(() => showActionLabel('Select concept','enter',e), 1200)
                                }
                            })
                            .on('mouseout', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave',e)
                                showConfirmationPopup(d,'leave')
                            })
                            .on('click', (e, d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave')
                                if (d.collapsed) { openTopList(e); return }
                                if (!rootConcepts.includes(d.name)) {
                                    setVisible(false)
                                    showConfirmationPopup(d, 'enter', e)
                                }
                            })
                            // .on('click', (e,d) => {
                            //     clearTimeout(e.currentTarget.__hoverTimeout__)
                            //     showActionLabel('','leave')
                            //     if (!rootConcepts.includes(d.name)) {
                            //         setVisible(false)
                            //         showConfirmationPopup(d, 'enter', e)
                            //     }
                            // })
                        const text = label.append('g')
                            .classed('label-text-container',true)
                            .attr('id', d => 'label-text-' + d.name)
                            .style('display', d => d.collapsed ? 'none' : 'block')
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
                            .style('opacity', d => inclusions.includes(d.name) || (countType === 'record' && d.leaf) || (countType === 'person' && d.leaf && relationship !== 'mappings') ? 1 : 0.6)
                        const line2 = text.append('text')
                            .classed('label-line2',true)
                            .attr('text-anchor', 'middle')
                            .attr('fill', '#4c4c4c')
                            .style('opacity', d => inclusions.includes(d.name) || (countType === 'record' && d.leaf) || (countType === 'person' && d.leaf && relationship !== 'mappings') ? 1 : 0.6)
                            .attr('x', d => getLabel(d).x)
                            .attr('y', d => getLabel(d).y - 7)
                            .style('display',d => d.data.concept.concept_code ? 'block' : 'none')
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
                            .attr('width', d => d.collapsed ? 24 : d3.select("#label-text-" + d.name).node().getBBox().width + 16)
                            .attr('height', d => d.collapsed ? 24 : d.data.concept.concept_code ? 36 : 21)
                            .attr("rx", d => d.collapsed ? 24 : 8)
                            .attr("ry", d => d.collapsed ? 24 : 8)
                            .attr('x', d => d.collapsed ? getLabel(d).x - 12 : getLabel(d).x - (d3.select("#label-text-" + d.name).node().getBBox().width + 16)/2)
                            .attr('y', d => getLabel(d).y - 35)
                            .attr('fill', d => inclusions.includes(d.name) || (countType === 'record' && d.leaf) || (countType === 'person' && d.leaf && relationship !== 'mappings') ? 'white' : '#f2f2f4')
                            .style("filter", d => inclusions.includes(d.name) || (countType === 'record' && d.leaf) || (countType === 'person' && d.leaf && relationship !== 'mappings') ? "drop-shadow(0px 0px 4px rgba(0, 0, 0, 0.16))" : 'none')
                            .attr('stroke-width',1)
                            .attr('stroke', d => d.collapsed ? 'white' : rootConcepts.includes(d.name) ? '#7728ED' : 'transparent')
                            .lower()
                        label.append('text')
                            .classed('top-count-label num', true)
                            .attr('text-anchor', 'middle')
                            .attr('fill', '#36126d')
                            .style('font-size', '9px')
                            .style('opacity', 0.6)
                            .style('pointer-events', 'none')
                            .style('display', d => d.collapsedCount ? 'block' : 'none')
                            .text(d => d.collapsedCount ? topCountText(d.collapsedCount) : '')
                            .attr('x', d => d.collapsedCenter)
                            .attr('y', d => getLabel(d).y - 43)
                        const pruneLine = node.append('g')
                            .classed('prune-group', true)
                            .attr('id', d => 'prune-group-' + d.name)
                            .style('display', d => pruned && d.pruned && !d.children?.every(child => d.connections.map(d => d.child).includes(child)) ? 'block' : 'none')
                            .style('opacity', d => hovered.length === 1 && hovered.includes(d.name) ? 1 : hovered.length > 0 ? 0.2 : 1)
                        pruneLine.append('line')
                            .classed('prune-line',true)
                            .attr('fill', 'none')
                            .attr("stroke", "url(#myGradient)")
                            .attr('stroke-width', 1.5)
                            .attr('x1',d => d.x)
                            .attr('y1',d => countType === 'record' || countType === 'measurement' ? cy + (genHeight[d.distance]) + scaleRadius(Math.sqrt(d.record_counts)) + 18 : cy + (genHeight[d.distance]) + scaleRadius(Math.sqrt(d.person_counts)) + 18)
                            .attr('x2',d => d.x + 0.1)
                            .attr('y2',d => cy + (genHeight[d.distance]) + (num - 20))
                        pruneLine.append('path')
                            .classed('prune-arrow', true)
                            .attr('fill', '#e8e8e8')
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
                                .style('display', countType === 'record' || (countType === 'person' && relationship === 'descendants') ? 'block' : 'none')
                            curve.append('path')
                                .classed('prune-curve-line',true)
                                .attr('fill', 'none')
                                .attr("stroke", "url(#myGradient)")
                                .attr('stroke-width', 1.5)
                                .style('display', pruned ? 'block' : 'none')
                                .attr("d", d => {
                                    let sourceNode = nodes.filter(e => e.name === d.source)[0]
                                    let x1 = d.x
                                    let y1 = countType === 'record' || countType === 'measurement' ? cy + (genHeight[sourceNode.distance]) + scaleRadius(Math.sqrt(sourceNode.record_counts)) + 18 : cy + (genHeight[sourceNode.distance]) + scaleRadius(Math.sqrt(sourceNode.person_counts)) + 18
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
                                    let y1 = countType === 'record' || countType === 'measurement' ? cy + (genHeight[sourceNode.distance]) + scaleRadius(Math.sqrt(sourceNode.record_counts)) + 18 : cy + (genHeight[sourceNode.distance]) + scaleRadius(Math.sqrt(sourceNode.person_counts)) + 18
                                    let x2 = d.mid
                                    let y2 = cy + (genHeight[sourceNode.distance]) + (num - 20)
                                    return curveY({source: [x1, y1], target: [x2, y2]})
                                })
                                .on('mouseover',(e,d) => setHovered(d.parents))
                                .on('mouseout',(e,d) => setHovered([]))
                            curve.append('path')
                                .classed('prune-curve-arrow', true)
                                .attr('fill', '#e8e8e8')
                                .attr("d", d3.symbol().type(d3.symbolTriangle).size(arrowSize))
                                .attr("transform", d => {
                                    let x = d.mid
                                    let y = cy + (genHeight[nodes.filter(e => e.name === d.source)[0].distance]) + (num - 20)
                                    return "translate(" + x + "," + y + ")rotate(" + 180 + ")"
                                }) 
                        },update => {
                            update 
                                .style('opacity', d => d.parents === hovered ? 1 : hovered.length > 0 ? 0.2 : 1)
                                .style('display', countType === 'record' || (countType === 'person' && relationship === 'descendants') ? 'block' : 'none')
                            update.select('.prune-curve-line')
                                .style('display', pruned ? 'block' : 'none')
                                .attr("d", d => {
                                    let sourceNode = nodes.filter(e => e.name === d.source)[0]
                                    let x1 = d.x
                                    let y1 = countType === 'record' || countType === 'measurement' ? cy + (genHeight[sourceNode.distance]) + scaleRadius(Math.sqrt(sourceNode.record_counts)) + 18 : cy + (genHeight[sourceNode.distance]) + scaleRadius(Math.sqrt(sourceNode.person_counts)) + 18
                                    let x2 = d.mid
                                    let y2 = cy + (genHeight[sourceNode.distance]) + (num - 20)
                                    return curveY({source: [x1, y1], target: [x2, y2]})
                                })
                            update.select(".prune-curve-background")
                                .style('display', pruned ? 'block' : 'none')
                                .attr("d", d => {
                                    let sourceNode = nodes.filter(e => e.name === d.source)[0]
                                    let x1 = d.x
                                    let y1 = countType === 'record' || countType === 'measurement' ? cy + (genHeight[sourceNode.distance]) + scaleRadius(Math.sqrt(sourceNode.record_counts)) + 18 : cy + (genHeight[sourceNode.distance]) + scaleRadius(Math.sqrt(sourceNode.person_counts)) + 18
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
                        geometry.append('rect')
                            .classed('focus-rect', true)
                            .attr('fill', d =>  d.color)
                            .style('pointer-events', 'all')
                            .lower()
                        geometry.append('rect')
                            .classed('focus-rect', true)
                            .attr('fill', 'transparent')
                            .style('pointer-events', 'all')
                            .lower()
                        bindTreeNodeHover(geometry)
                        // d3.selectAll('.subsumes-nodes').lower()
                        // d3.selectAll('.map-node').raise()
                        mappingsBtnGroup.raise()
                        d3.selectAll('.prune-curve').lower()
                        return geometry 
                    }, update => {
                        update.selectAll(".map-node").data(d => bindMappings(d), d => d.name + d.source.name)
                        //Mappings
                        .join(enter => {
                            const geometry = enter.append('g')
                                .classed('map-node',true)
                                .style('display', d => isMapVisible(d) ? null : 'none')
                            const mapNode = geometry.append('g')
                                .classed('map-node-main btn', true)
                                .attr('id', d => 'map-node-'+d.name)
                                .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.4 : 1)
                            const mapLine = mapNode.append('g')
                                .classed('map-link',true)
                                .style('display', d => mapRoot.includes(d.source.name) ? 'block' : 'none')
                                .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.4 : 1)
                                .lower()
                            mapLine.append('path')
                                .classed('map-line', true)
                                .attr('fill','none')
                                .attr('stroke-width', 1.5)
                                .attr('stroke-dasharray', '4 2')
                                .attr('stroke', d => inclusions.includes(d.name) ? '#c2c2c2' : '#e8e8e8')
                                .attr("d", d => {
                                    let sourceX = getMap(d).x 
                                    let sourceY = mapRoot.includes(d.source.name) ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) : cy + (genHeight[d.distance])
                                    let targetY = cy + (genHeight[d.distance])
                                    let targetX
                                    if (countType === 'record' || countType === 'measurement') targetX = mapRoot.includes(d.source.name) ? d.direction === -1 ? d.source.x - scaleRadius(Math.sqrt(d.source.record_counts)) - 24 : d.source.x + scaleRadius(Math.sqrt(d.source.record_counts)) + 24 : getMap(d).x 
                                    else targetX = mapRoot.includes(d.source.name) ? d.direction === -1 ? d.source.x - scaleRadius(Math.sqrt(d.source.person_counts)) - 24 : d.source.x + scaleRadius(Math.sqrt(d.source.person_counts)) + 24 : getMap(d).x 
                                    return curveX({source: [sourceX, sourceY], target: [targetX, targetY]})}
                                )
                                .lower()
                            mapLine.append('path')
                                .classed('map-tree-arrow', true)
                                .attr('id', d => 'map-arrow-'+d.name)
                                .attr('fill', d => d._siblings.some(m => inclusions.includes(m.name)) ? '#c2c2c2' : '#e8e8e8')
                                .attr("d", d3.symbol().type(d3.symbolTriangle).size(arrowSize))
                                .attr("transform", d => {
                                    let x 
                                    if (countType === 'record' || countType === 'measurement') x = d.direction === -1 ? d.source.x - scaleRadius(Math.sqrt(d.source.record_counts)) - 26 : getMap(d).x - scaleRadius(Math.sqrt(d.record_counts)) - 5
                                    else x = d.direction === -1 ? d.source.x - scaleRadius(Math.sqrt(d.source.person_counts)) - 26 : getMap(d).x - scaleRadius(Math.sqrt(d.person_counts)) - 5
                                    let y = d.direction === -1 ? cy + (genHeight[d.distance]) : getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d)
                                    return "translate(" + x + "," + y + ")rotate(" + 90 + ")"
                                }) 
                            mapNode.append('circle')
                                .classed('map-tree-circle-background', true)
                                .attr('r', d => !mapRoot.includes(d.source.name) ? 0 : countType === 'record' || countType === 'measurement' ? scaleRadius(Math.sqrt(d.record_counts)) + 2 : scaleRadius(Math.sqrt(d.person_counts)) + 2)
                                .attr('cx', d => getMap(d).x)
                                .attr('cy', d => mapRoot.includes(d.source.name) ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) : getYPosition(d.source, 'z', cy + (genHeight[d.distance]), d))
                            mapNode.append('circle')
                                .attr('class', d => `map-tree-circle btn map-circle-${d.source.name}`)
                                .attr('id', d => 'tree-circle-' + d.name)
                                .attr('r', d => !mapRoot.includes(d.source.name) ? 12 : countType === 'record' || countType === 'measurement' ? scaleRadius(Math.sqrt(d.record_counts)) : scaleRadius(Math.sqrt(d.person_counts)))
                                .style('fill', d => {
                                    if ((countType === 'record' && (d.record_counts === 0 || (d.source.leaf && relationship === 'mappings' && countType !== 'person'))) || (countType === 'person' && (d.person_counts === 0 && relationship === 'mappings' && countType !== 'person'))) return 'white'
                                    // if ((countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0) && mapRoot.includes(d.source.name)) return 'white'
                                    else {
                                        if (inclusions.includes(d.name)) {
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
                                            if (mapRoot.includes(d.source.name)) return '#f3f3f5'
                                            else return '#e6e6ea'
                                        }    
                                    }
                                })
                                .attr('stroke', d => mapRoot.includes(d.source.name) ? inclusions.includes(d.name) ? d.source.leaf ? d.source.color : d.color : (countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0) ? 'none' : '#dfdfe0' : d.source.leaf && relationship === 'mappings' && countType !== 'person' ? d.source.color : 'white')
                                .attr('stroke-width', 1.5)
                                .attr('cx', d => getMap(d).x)
                                .attr('cy', d => mapRoot.includes(d.source.name) ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) : getYPosition(d.source, 'z', cy + (genHeight[d.distance]), d))
                                .on('mouseover',(e,d) => {
                                    e.stopPropagation()
                                    overrideNodeHover(e)
                                    hoverMappings(d.source,'enter')
                                    setVisible(false)
                                })
                                .on('mouseout',(e,d) => {hoverMappings(d.source,'leave');setVisible(false)})
                                .on('click',(e,d) => {
                                    if (!mapRoot.includes(d.source.name)) {
                                        pendingMapZoomRef.current = d.name
                                        setMapRoot([...mapRoot,d.source.name])
                                        updateWidth([...mapRoot,d.source.name])    
                                    } 
                                    // else {
                                    //     setMapRoot([...mapRoot,d.source.name])
                                    //     updateWidth([...mapRoot,d.source.name])
                                    // }
                                    
                                })
                                .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                                .style('pointer-events', d => mapRoot.includes(d.source.name) ? 'none' : 'all')
                                .raise()
                            mapNode.append('text')
                                .classed('map-count-label num', true)
                                .attr('text-anchor', 'middle')
                                .attr('fill', '#36126d')
                                .style('font-size', '9px')
                                .style('opacity', 0.6)
                                .style('pointer-events', 'none')
                                .style('display', d => isCountAnchor(d) ? 'block' : 'none')
                                .text(countText)
                                .attr('x', d => getMap(d).x)
                                .attr('y', countY)
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
                                .text(d => countType === 'record' || countType === 'measurement' ? formatThousands(d.record_counts) : formatThousands(d.person_counts))
                                .attr('fill', d => inclusions.includes(d.name) ? d.source.leaf && relationship === 'mappings' && countType !== 'person' ? '#36126d' : getContrastColor(d.color) : '#36126d')
                                .style('font-size', '9px')
                                .attr('x', d => getMap(d).x)
                                .attr('y', d => getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) - 1)
                            mapCounts.append('text')
                                .classed('map-total-counts-label', true)
                                .style('font-size', '9px')
                                .text(() => countType === 'record' || countType === 'measurement' ? 'RC' : 'PC')
                                .attr('fill', d => inclusions.includes(d.name) ? d.source.leaf && relationship === 'mappings' && countType !== 'person' ? '#36126d' : getContrastColor(d.color) : '#36126d')
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
                                .attr('y', d => countType === 'record' || countType === 'measurement' ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) + scaleRadius(Math.sqrt(d.record_counts)) + 18 : getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) + scaleRadius(Math.sqrt(d.person_counts)) + 18)
                            mapDrcText.append('tspan')
                                .classed('map-drc-num num',true)
                                .text(d => countType === 'record' || countType === 'measurement' ? formatThousands(d.descendant_record_counts) : formatThousands(d.descendant_person_counts))
                                .raise()
                            mapDrcText.append('tspan')
                                .classed('map-drc-label-tree',true)
                                .text(() => countType === 'record' || countType === 'measurement' ? ' DRC' : ' DPC')
                            mapDrc.append('rect')
                                .classed('map-drc-rect',true)
                                .attr('height',16)
                                .attr("rx", 8)
                                .attr("ry", 8)
                                .attr('fill', d => countType === 'record' || countType === 'measurement' ? d.descendant_record_counts === 0 || d.descendant_record_counts === d.record_counts  ? 'transparent' : '#f3f3f5' : d.descendant_person_counts === 0 || d.descendant_person_counts === d.person_counts  ? 'transparent' : '#f3f3f5')
                                .attr('width',d => d3.select('#drc-text-'+d.name).node().getBBox().width + 10)
                                .attr('x', d => getMap(d).x - (d3.select('#drc-text-'+d.name).node().getBBox().width + 10)/2)
                                .attr('y', d => countType === 'record' || countType === 'measurement' ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) + scaleRadius(Math.sqrt(d.record_counts)) + 7 : getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) + scaleRadius(Math.sqrt(d.person_counts)) + 7)
                                .lower()
                            const mapLabel = mapGroup.append('g')
                                .classed('map-label btn', true)
                                .on('mouseover', function (e,d) {
                                    overrideNodeHover(e)
                                    const el = this
                                    el.__hoverTimeout__ = setTimeout(() => {
                                        if (inclusions.includes(d.name)) setHovered([d.name])
                                        if (d.levels !== '-1') tooltipHover(d, "enter", e)  
                                    }, 600)    
                                })
                                .on('mouseout', function (e,d) {
                                    const el = this
                                    clearTimeout(el.__hoverTimeout__)
                                    setHovered([])
                                    tooltipHover(d, "leave", e)   
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
                                .style('opacity', d => inclusions.includes(d.name) ? 1 : 0.6)
                            const mapLine2 = mapText.append('text')
                                .classed('map-label-line2',true)
                                .attr('text-anchor', 'middle')
                                .attr('fill', '#4c4c4c')
                                .style('opacity', d => inclusions.includes(d.name) ? 1 : 0.6)
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
                                .attr('fill', d => inclusions.includes(d.name) ? 'white' : '#f2f2f4')
                                .style("filter", d => inclusions.includes(d.name) ? "drop-shadow(0px 0px 4px rgba(0, 0, 0, 0.16))" : 'none')
                                .attr('stroke-width',1)
                                .attr('stroke', d => rootConcepts.includes(d.name) ? '#7728ED' : 'transparent')
                                .lower()
                            geometry.append('rect')
                                .classed('map-rect btn', true)
                                .style('display', d => mapRoot.includes(d.source.name) ? 'block' : 'none')
                                .style('pointer-events', 'all')
                                .attr('fill', 'transparent')
                                .each(function (d) {
                                    const b = mapHitBox(d)
                                    d3.select(this).attr('x', b.x).attr('y', b.y).attr('width', b.width).attr('height', b.height)
                                })
                                .raise()                                       
                            bindMapHover(geometry)
                        }, update => {
                            update
                                .style('display', d => isMapVisible(d) ? null : 'none')
                            update.select('.map-node-main')
                                .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.4 : 1)
                            update.select('.map-link')
                                .style('display', d => mapRoot.includes(d.source.name) ? 'block' : 'none')
                                .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.4 : 1)
                            update.select('.map-line')
                                .attr('stroke', d => inclusions.includes(d.name) ? '#c2c2c2' : '#e8e8e8')
                                .attr("d", d => {
                                    let sourceX = getMap(d).x 
                                    let sourceY = mapRoot.includes(d.source.name) ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) : cy + (genHeight[d.distance])
                                    let targetY = cy + (genHeight[d.distance])
                                    let targetX
                                    if (countType === 'record' || countType === 'measurement') targetX = mapRoot.includes(d.source.name) ? d.direction === -1 ? d.source.x - scaleRadius(Math.sqrt(d.source.record_counts)) - 24 : d.source.x + scaleRadius(Math.sqrt(d.source.record_counts)) + 24 : getMap(d).x 
                                    else targetX = mapRoot.includes(d.source.name) ? d.direction === -1 ? d.source.x - scaleRadius(Math.sqrt(d.source.person_counts)) - 24 : d.source.x + scaleRadius(Math.sqrt(d.source.person_counts)) + 24 : getMap(d).x 
                                    return curveX({source: [sourceX, sourceY], target: [targetX, targetY]})}
                                )
                            update.select('.map-tree-arrow')
                                .attr('fill', d => d._siblings.some(m => inclusions.includes(m.name)) ? '#c2c2c2' : '#e8e8e8')
                                .attr("d", d3.symbol().type(d3.symbolTriangle).size(arrowSize))
                                .attr("transform", d => {
                                    let x 
                                    if (countType === 'record' || countType === 'measurement') x = d.direction === -1 ? d.source.x - scaleRadius(Math.sqrt(d.source.record_counts)) - 26 : getMap(d).x - scaleRadius(Math.sqrt(d.record_counts)) - 5
                                    else x = d.direction === -1 ? d.source.x - scaleRadius(Math.sqrt(d.source.person_counts)) - 26 : getMap(d).x - scaleRadius(Math.sqrt(d.person_counts)) - 5
                                    let y = d.direction === -1 ? cy + (genHeight[d.distance]) : getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d)
                                    return "translate(" + x + "," + y + ")rotate(" + 90 + ")"
                                })  
                            update.select('.map-rect')
                                .style('display', d => mapRoot.includes(d.source.name) ? 'block' : 'none')
                                .each(function (d) {
                                    const b = mapHitBox(d)
                                    d3.select(this).attr('x', b.x).attr('y', b.y).attr('width', b.width).attr('height', b.height)
                                })
                            bindMapHover(update)
                            update.select('.map-tree-circle-background')
                                .attr('r', d => !mapRoot.includes(d.source.name) ? 0 : countType === 'record' || countType === 'measurement' ? scaleRadius(Math.sqrt(d.record_counts)) + 2 : scaleRadius(Math.sqrt(d.person_counts)) + 2)
                                .attr('cx', d => getMap(d).x)
                                .attr('cy', d => mapRoot.includes(d.source.name) ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) : getYPosition(d.source, 'z', cy + (genHeight[d.distance]), d))
                            update.select('.map-tree-circle')
                                .attr('r', d => !mapRoot.includes(d.source.name) ? 12 : countType === 'record' || countType === 'measurement' ? scaleRadius(Math.sqrt(d.record_counts)) : scaleRadius(Math.sqrt(d.person_counts)))
                                .style('fill', d => {
                                    if ((countType === 'record' && (d.record_counts === 0 || (d.source.leaf && relationship === 'mappings' && countType !== 'person'))) || (countType === 'person' && (d.person_counts === 0 && relationship === 'mappings' && countType !== 'person'))) return 'white'
                                    // if ((countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0) && mapRoot.includes(d.source.name)) return 'white'
                                    else {
                                        if (inclusions.includes(d.name)) {
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
                                            if (mapRoot.includes(d.source.name)) return '#f3f3f5'
                                            else return '#e6e6ea'
                                        }    
                                    }
                                })
                                .attr('stroke', d => mapRoot.includes(d.source.name) ? inclusions.includes(d.name) ? d.source.leaf ? d.source.color : d.color : (countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0) ? 'none' : '#dfdfe0' : d.source.leaf && relationship === 'mappings' && countType !== 'person' ? d.source.color : 'white')
                                .attr('cx', d => getMap(d).x)
                                .attr('cy', d => mapRoot.includes(d.source.name) ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) : getYPosition(d.source, 'z', cy + (genHeight[d.distance]), d))
                                .on('mouseover',(e,d) => {
                                    e.stopPropagation()
                                    overrideNodeHover(e)
                                    hoverMappings(d.source,'enter')
                                    setVisible(false)
                                })
                                .on('mouseout',(e,d) => {hoverMappings(d.source,'leave');setVisible(false)})
                                .on('click',(e,d) => {
                                    if (!mapRoot.includes(d.source.name)) {
                                        pendingMapZoomRef.current = d.name
                                        setMapRoot([...mapRoot,d.source.name])
                                        updateWidth([...mapRoot,d.source.name])    
                                    } 
                                    // else {
                                    //     setMapRoot([...mapRoot,d.source.name])
                                    //     updateWidth([...mapRoot,d.source.name])
                                    // }
                                    
                                })
                                .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                                .style('pointer-events', d => mapRoot.includes(d.source.name) ? 'none' : 'all')
                            update.select('.map-count-label')
                                .style('display', d => isCountAnchor(d) ? 'block' : 'none')
                                .text(countText)
                                .attr('x', d => getMap(d).x)
                                .attr('y', countY)
                            update.select('.map-group')
                                .style('display', d => mapRoot.includes(d.source.name) ? 'block' : 'none')
                            update.select('.map-total-counts')
                                .text(d => countType === 'record' || countType === 'measurement' ? formatThousands(d.record_counts) : formatThousands(d.person_counts))
                                .attr('fill', d => inclusions.includes(d.name) ? d.source.leaf && relationship === 'mappings' && countType !== 'person' ? '#36126d' : getContrastColor(d.color) : '#36126d')
                                .attr('x', d => getMap(d).x)
                                .attr('y', d => getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) - 1)
                            update.select('.map-total-counts-label')
                                .text(() => countType === 'record' || countType === 'measurement' ? 'RC' : 'PC')
                                .attr('fill', d => inclusions.includes(d.name) ? d.source.leaf && relationship === 'mappings' && countType !== 'person' ? '#36126d' : getContrastColor(d.color) : '#36126d')
                                .attr('x', d => getMap(d).x - 6)
                                .attr('y', d => getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) + 9)
                            update.select('.map-drc-group')
                                .classed('map-drc-group',true)
                                .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                            update.select('.map-drc-text')
                                .attr('x', d => getMap(d).x)
                                .attr('y', d => countType === 'record' || countType === 'measurement' ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) + scaleRadius(Math.sqrt(d.record_counts)) + 18 : getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) + scaleRadius(Math.sqrt(d.person_counts)) + 18)
                            update.select('.map-drc-num')
                                .text(d => countType === 'record' || countType === 'measurement' ? formatThousands(d.descendant_record_counts) : formatThousands(d.descendant_person_counts))
                            update.select('.map-drc-label-tree')
                                .text(() => countType === 'record' || countType === 'measurement' ? ' DRC' : ' DPC')
                            update.select('.map-drc-rect')
                                .attr('fill', d => countType === 'record' || countType === 'measurement' ? d.descendant_record_counts === 0 || d.descendant_record_counts === d.record_counts  ? 'transparent' : '#f3f3f5' : d.descendant_person_counts === 0 || d.descendant_person_counts === d.person_counts  ? 'transparent' : '#f3f3f5')
                                .attr('width',d => d3.select('#drc-text-'+d.name).node().getBBox().width + 10)
                                .attr('x', d => getMap(d).x - (d3.select('#drc-text-'+d.name).node().getBBox().width + 10)/2)
                                .attr('y', d => countType === 'record' || countType === 'measurement' ? getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) + scaleRadius(Math.sqrt(d.record_counts)) + 7 : getYPosition(d.source, 'y', cy + (genHeight[d.distance]), d) + scaleRadius(Math.sqrt(d.person_counts)) + 7)
                            update.select('.map-label')
                                .on('mouseover', function (e,d) {
                                    overrideNodeHover(e)
                                    const el = this
                                    el.__hoverTimeout__ = setTimeout(() => {
                                        if (inclusions.includes(d.name)) setHovered([d.name])
                                        if (d.levels !== '-1') tooltipHover(d, "enter", e)  
                                    }, 600)    
                                })
                                .on('mouseout', function (e,d) {
                                    const el = this
                                    clearTimeout(el.__hoverTimeout__)
                                    setHovered([])
                                    tooltipHover(d, "leave", e)   
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
                                .style('opacity', d => inclusions.includes(d.name) ? 1 : 0.6)
                            update.select('.map-label-line2')
                                .style('opacity', d => inclusions.includes(d.name) ? 1 : 0.6)
                                .attr('x', d => getMap(d).x)
                                .attr('y', d => getMap(d).y - 7)
                            update.select('.map-label-rect')
                                .attr('width', d => d3.select("#label-text-" + d.name).node().getBBox().width + 16)
                                .attr('x', d => getMap(d).x - (d3.select("#label-text-" + d.name).node().getBBox().width + 16)/2)
                                .attr('y', d => getMap(d).y - 35)
                                .attr('fill', d => inclusions.includes(d.name) ? 'white' : '#f2f2f4')
                                .style("filter", d => inclusions.includes(d.name) ? "drop-shadow(0px 0px 4px rgba(0, 0, 0, 0.16))" : 'none')
                                .attr('stroke', d => rootConcepts.includes(d.name) ? '#7728ED' : 'transparent')
                        },exit => exit.remove())
                        //Subsumes node
                        update.select('.subsumes-node')
                            .transition()
                            .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.4 : 1)
                        update.select('.node-rect')
                            .style('display', d => d.levels === '-1' ? 'none' : 'block')
                            .attr('x', d => d.x - 60)
                            .attr('y', d => countType === 'record' || countType === 'measurement' ? cy + (genHeight[d.distance]) - (120 + scaleRadius(Math.sqrt(d.record_counts)))/2 : cy + (genHeight[d.distance]) - (120 + scaleRadius(Math.sqrt(d.person_counts)))/2)
                            .attr('height', d => countType === 'record' || countType === 'measurement' ? 100 + scaleRadius(Math.sqrt(d.record_counts)) : 100 + scaleRadius(Math.sqrt(d.person_counts)))
                            .on('mouseover', function (e,d) {
                                const el = this
                                el.__hoverTimeout__ = setTimeout(() => {
                                    // if (inclusions.includes(d.name) || (countType === 'record' && d.leaf) || (countType === 'person' && d.leaf && relationship !== 'mappings')) setHovered([d.name])
                                    setHovered([d.name])
                                    // const neighborhood = [d.name,...d.parents,...d.children]
                                    // const neighborhoodNodes = nodes.filter(n => neighborhood.includes(n.name))
                                    // const neighborhoodLinks = links.filter(l => neighborhood.includes(l.source.name) && neighborhood.includes(l.target.name))
                                    // setZoomedNodes(neighborhoodNodes)
                                    // setZoomedLinks(neighborhoodLinks)
                                    if (d.levels !== '-1') tooltipHover(d, "enter", e)  
                                }, 600)    
                            })
                            .on('mouseout', function (e,d) {
                                const el = this
                                clearTimeout(el.__hoverTimeout__)
                                setHovered([])
                                // setZoomedNodes([])
                                // setZoomedLinks([])
                                tooltipHover(d, "leave", e)   
                            })
                        update.select('.node-group')
                            .style('display', d => d.levels === '-1' ? 'none' : 'block')
                        update.select('.tree-circle-background')
                            .attr('r', d => countType === 'record' || countType === 'measurement' ? scaleRadius(Math.sqrt(d.record_counts)) + 2 : scaleRadius(Math.sqrt(d.person_counts)) + 2)
                            .attr('cx', d => d.x)
                            .attr('cy', d => cy + (genHeight[d.distance]))
                        update.select('.tree-circle')
                            .classed('tree-circle btn', true)
                            .attr('r', d => countType === 'record' || countType === 'measurement' ? scaleRadius(Math.sqrt(d.record_counts)) : scaleRadius(Math.sqrt(d.person_counts)))
                            .attr('stroke', d => (countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0) ? 'none' : inclusions.includes(d.name) ? d.color : '#dfdfe0')
                            .attr('fill', d => {
                                if ((countType === 'record' && d.record_counts === 0) || (d.leaf && relationship !== 'mappings') || (countType === 'person' && d.person_counts === 0)) return 'white'
                                else {
                                    if (!d.data.concept.standard_concept && inclusions.includes(d.name)) {
                                        let t = textures.lines()
                                            .size(3)
                                            .strokeWidth(1.5)
                                            .stroke(d.color)  
                                        d3.select('#tree').call(t)
                                        return t.url()  
                                    } 
                                    else if (d.data.concept.standard_concept && inclusions.includes(d.name)) {
                                        return d.color
                                    } else {return '#f3f3f5'}    
                                }
                            })
                            .attr('cx', d => d.x)
                            .attr('cy', d => cy + (genHeight[d.distance]))
                            .attr('pointer-events', d => (countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0) || d.levels === "-1" || d.leaf ? "none" : "all")
                        update.select('.total-counts')
                            .classed('total-counts num', true)
                            .text(d => countType === 'record' || countType === 'measurement' ? formatThousands(d.record_counts) : formatThousands(d.person_counts))
                            .attr('fill', d => inclusions.includes(d.name) && !d.leaf ? getContrastColor(d.color) : '#36126d')
                            .attr('x', d => d.x)
                            .attr('y', d => cy + (genHeight[d.distance]) - 1)
                        update.select('.total-counts-label')
                            .text(() => countType === 'record' || countType === 'measurement' ? 'RC' : 'PC')
                            .attr('fill', d => inclusions.includes(d.name) && !d.leaf ? getContrastColor(d.color) : '#36126d')
                            .attr('x', d => d.x - 6)
                            .attr('y', d => cy + (genHeight[d.distance]) + 9)
                        update.select('.set-expression')
                            .style('display', d => rootConcepts.includes(d.name) ? 'block' : 'none')
                            .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                            .attr('transform', d => {
                                const xVar = (countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0) ? 28 : 13
                                if (d.data.concept.standard_concept) return countType === 'record' || countType === 'measurement' ? `translate(${d.x + scaleRadius(Math.sqrt(d.record_counts)) + xVar}, 0)` : `translate(${d.x + scaleRadius(Math.sqrt(d.person_counts)) + xVar}, 0)`
                                else return countType === 'record' || countType === 'measurement' ? `translate(${d.x - scaleRadius(Math.sqrt(d.record_counts)) - xVar}, 0)` : `translate(${d.x - scaleRadius(Math.sqrt(d.person_counts)) - xVar}, 0)`
                            })
                        // update.select('.set-expression-rect')
                        //     .attr('y', d => cy + (genHeight[d.distance]) - 24)
                        update.select('.tree-descendants-btn')
                            .attr('text-anchor', d => d.data.concept.standard_concept ? 'start' : 'end')
                            .on('click', (e,d) => {
                                setExcludeInclude('descendants',d.name)
                            })
                        update.select('.tree-descendants-box')
                            .attr('stroke', d => descendantsFilter.includes(d.name) ? '#e8e8e8' : '#989898')
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
                            .attr('stroke', d => !excludeList.includes(d.name) ? '#e8e8e8' : '#989898')
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
                        const mappingsBtnGroup = update.select('.mappings-btn-group')
                            .style('display', d => d.mappings.length > 0 ? 'block' : 'none')
                        mappingsBtnGroup.select('.mappings-btn-rect')
                            .attr('x', d => {
                                if (d.data.concept.standard_concept) return countType === 'record' || countType === 'measurement' ? d.x - scaleRadius(Math.sqrt(d.record_counts)) - 15 : d.x - scaleRadius(Math.sqrt(d.person_counts)) - 15 
                                else return countType === 'record' || countType === 'measurement' ? d.x + scaleRadius(Math.sqrt(d.record_counts)) + 8 : d.x + scaleRadius(Math.sqrt(d.person_counts)) + 8
                            })
                            .attr('y', d => cy + (genHeight[d.distance]) - 20)
                            .style('pointer-events','all')
                            .on('mouseover',(e,d) => {
                                e.stopPropagation()
                                overrideNodeHover(e)
                                hoverMappings(d,'enter')
                                setVisible(false)
                                const el = e.currentTarget
                                el.__hoverTimeout__ = setTimeout(() => {
                                    !mapRoot.includes(d.name) ? showActionLabel('Open mappings','enter',e) : showActionLabel('Close mappings','enter',e)
                                }, 1200)
                            })
                            .on('mouseout',(e,d) => {
                                e.stopPropagation()
                                hoverMappings(d,'leave')
                                setVisible(false)
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave',e)
                            })
                            .on('click',(e,d) => {
                                e.stopPropagation()
                                if (mapRoot.includes(d.name)) {
                                    pendingMapZoomRef.current = null
                                    const el = document.getElementById('tree-circle-' + d.name)
                                    skipNextFitRef.current = el
                                        ? { name: d.name, screen: el.getBoundingClientRect() }
                                        : true
                                    let filteredRoots = mapRoot.filter(e => e !== d.name)
                                    setMapRoot(filteredRoots)
                                    updateWidth(filteredRoots)    
                                } else {
                                    pendingMapZoomRef.current = d.name
                                    setMapRoot([...mapRoot,d.name])
                                    updateWidth([...mapRoot,d.name])
                                }
                            })
                        mappingsBtnGroup.select('.mappings-btn')
                            .text(d => mapRoot.includes(d.name) && d.mappings.length > 0 ? "\uf00d" : d.data.concept.standard_concept ? "\uf0da" : "\uf0d9")
                            .style('display','block')
                            .style('opacity', d => hovered.length > 0 ? 0.1 : 0.3)
                            .style('font-size', d => mapRoot.includes(d.name) && d.mappings.length > 0 ? '14px' : '15px')
                            .attr('x', d => {
                                if (d.data.concept.standard_concept) return countType === 'record' || countType === 'measurement' ? d.x - scaleRadius(Math.sqrt(d.record_counts)) - 15 : d.x - scaleRadius(Math.sqrt(d.person_counts)) - 15 
                                else return countType === 'record' || countType === 'measurement' ? d.x + scaleRadius(Math.sqrt(d.record_counts)) + 8 : d.x + scaleRadius(Math.sqrt(d.person_counts)) + 8
                            })
                            .attr('y', d => cy + (genHeight[d.distance]) + 5.5)
                        mappingsBtnGroup.raise()
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
                            .attr('fill', d => ((d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings')) ? 'white' : '#36126d')
                            // .transition()
                            .attr('opacity', d => ((d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings')) ? 1 : 0.6)
                            .attr('x', d => d.x)
                            .attr('y', d => countType === 'record' || countType === 'measurement' ? cy + (genHeight[d.distance]) + scaleRadius(Math.sqrt(d.record_counts)) + 18 : cy + (genHeight[d.distance]) + scaleRadius(Math.sqrt(d.person_counts)) + 18)
                        update.select('.drc-num')
                            .text(d => countType === 'record' || countType === 'measurement' ? formatThousands(d.descendant_record_counts) : formatThousands(d.descendant_person_counts))
                        update.select('.drc-label-tree')
                            .text(() => countType === 'record' || countType === 'measurement' ? ' DRC' : ' DPC')
                        update.select('.drc-rect')
                            .attr('fill', d => ((d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings')) ? d.color : countType === 'record' || countType === 'measurement' ? d.descendant_record_counts === 0 || d.descendant_record_counts === d.record_counts ? 'transparent' : '#f3f3f5' : d.descendant_person_counts === 0 || d.descendant_person_counts === d.person_counts ? 'transparent' : '#f3f3f5')
                            .attr('width',d => d3.select('#drc-text-'+d.name).node().getBBox().width + 10)
                            .attr('x', d => d.x - (d3.select('#drc-text-'+d.name).node().getBBox().width + 10)/2)
                            .attr('y', d => countType === 'record' || countType === 'measurement' ? cy + (genHeight[d.distance]) + scaleRadius(Math.sqrt(d.record_counts)) + 7 : cy + (genHeight[d.distance]) + scaleRadius(Math.sqrt(d.person_counts)) + 7)
                        update.select('.label')
                        .on('mouseover', (e, d) => {
                                const el = e.currentTarget
                                if (d.collapsed) {
                                    el.__hoverTimeout__ = setTimeout(() => showActionLabel('Choose top-level concepts','enter',e), 1200)
                                    return
                                }
                                if (!rootConcepts.includes(d.name)) {
                                    el.__hoverTimeout__ = setTimeout(() => showActionLabel('Select concept','enter',e), 1200)
                                }
                            })
                            .on('mouseout', (e,d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave',e)
                                showConfirmationPopup(d,'leave')
                            })
                            .on('click', (e, d) => {
                                clearTimeout(e.currentTarget.__hoverTimeout__)
                                showActionLabel('','leave')
                                if (d.collapsed) { openTopList(e); return }
                                if (!rootConcepts.includes(d.name)) {
                                    setVisible(false)
                                    showConfirmationPopup(d, 'enter', e)
                                }
                            })
                            // .on('mouseover', (e, d) => {
                            //     if (!rootConcepts.includes(d.name)) {
                            //         const el = e.currentTarget
                            //         el.__hoverTimeout__ = setTimeout(() => {
                            //             showActionLabel('Select concept','enter',e)
                            //         }, 1200)    
                            //     }
                            // })
                            // .on('mouseout', (e,d) => {
                            //     clearTimeout(e.currentTarget.__hoverTimeout__)
                            //     showActionLabel('','leave',e)
                            //     showConfirmationPopup(d,'leave')
                            // })
                            // .on('click', (e,d) => {
                            //     clearTimeout(e.currentTarget.__hoverTimeout__)
                            //     showActionLabel('','leave')
                            //     if (!rootConcepts.includes(d.name)) {
                            //         setVisible(false)
                            //         showConfirmationPopup(d, 'enter', e)
                            //     }
                            // })
                            .transition()
                            .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                        update.select('.label-text-container')
                            .style('display', d => d.collapsed ? 'none' : 'block')
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
                            .style('opacity', d => inclusions.includes(d.name) || (countType === 'record' && d.leaf) || (countType === 'person' && d.leaf && relationship !== 'mappings') ? 1 : 0.6)
                        update.select('.label-line2')
                            .style('opacity', d => inclusions.includes(d.name) || (countType === 'record' && d.leaf) || (countType === 'person' && d.leaf && relationship !== 'mappings') ? 1 : 0.6)
                            .attr('x', d => getLabel(d).x)
                            .attr('y', d => getLabel(d).y - 7)
                        update.select('.label-rect')
                            .attr('width', d => d.collapsed ? 24 : d3.select("#label-text-" + d.name).node().getBBox().width + 16)
                            .attr('height', d => d.collapsed ? 24 : d.data.concept.concept_code ? 36 : 21)
                            .attr("rx", d => d.collapsed ? 24 : 8)
                            .attr("ry", d => d.collapsed ? 24 : 8)
                            .attr('x', d => d.collapsed ? getLabel(d).x - 12 : getLabel(d).x - (d3.select("#label-text-" + d.name).node().getBBox().width + 16)/2)
                            .attr('y', d => getLabel(d).y - 35)
                            .attr('fill', d => inclusions.includes(d.name) || (countType === 'record' && d.leaf) || (countType === 'person' && d.leaf && relationship !== 'mappings') ? 'white' : '#f2f2f4')
                            .style("filter", d => inclusions.includes(d.name) || (countType === 'record' && d.leaf) || (countType === 'person' && d.leaf && relationship !== 'mappings') ? "drop-shadow(0px 0px 4px rgba(0, 0, 0, 0.16))" : 'none')
                            .attr('stroke', d => d.collapsed ? 'white' : rootConcepts.includes(d.name) ? '#7728ED' : 'transparent')
                        update.select('.top-count-label')
                            .style('display', d => d.collapsedCount ? 'block' : 'none')
                            .text(d => d.collapsedCount ? topCountText(d.collapsedCount) : '')
                            .attr('x', d => d.collapsedCenter)
                            .attr('y', d => getLabel(d).y - 43)
                        update.select('.prune-group')
                            .style('display', d => pruned && d.pruned && !d.children?.every(child => d.connections.map(d => d.child).includes(child)) ? 'block' : 'none')
                            .style('opacity', d => hovered.length === 1 && hovered.includes(d.name) ? 1 : hovered.length > 0 ? 0.2 : 1)
                        update.select('.prune-line')
                            .attr('x1',d => d.x)
                            .attr('y1',d => countType === 'record' || countType === 'measurement' ? cy + (genHeight[d.distance]) + scaleRadius(Math.sqrt(d.record_counts)) + 18 : cy + (genHeight[d.distance]) + scaleRadius(Math.sqrt(d.person_counts)) + 18)
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
                                .style('display', countType === 'record' || (countType === 'person' && relationship === 'descendants') ? 'block' : 'none')
                            curve.append('path')
                                .classed('prune-curve-line',true)
                                .attr('fill', 'none')
                                .attr("stroke", "url(#myGradient)")
                                .attr('stroke-width', 1.5)
                                .style('display', pruned ? 'block' : 'none')
                                .attr("d", d => {
                                    let sourceNode = nodes.filter(e => e.name === d.source)[0]
                                    let x1 = d.x
                                    let y1 = countType === 'record' || countType === 'measurement' ? cy + (genHeight[sourceNode.distance]) + scaleRadius(Math.sqrt(sourceNode.record_counts)) + 18 : cy + (genHeight[sourceNode.distance]) + scaleRadius(Math.sqrt(sourceNode.person_counts)) + 18
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
                                    let y1 = countType === 'record' || countType === 'measurement' ? cy + (genHeight[sourceNode.distance]) + scaleRadius(Math.sqrt(sourceNode.record_counts)) + 18 : cy + (genHeight[sourceNode.distance]) + scaleRadius(Math.sqrt(sourceNode.person_counts)) + 18
                                    let x2 = d.mid
                                    let y2 = cy + (genHeight[sourceNode.distance]) + (num - 20)
                                    return curveY({source: [x1, y1], target: [x2, y2]})
                                })
                                .on('mouseover',(e,d) => setHovered(d.parents))
                                .on('mouseout',(e,d) => setHovered([]))
                            curve.append('path')
                                .classed('prune-curve-arrow', true)
                                .attr('fill', '#e8e8e8')
                                .attr("d", d3.symbol().type(d3.symbolTriangle).size(arrowSize))
                                .attr("transform", d => {
                                    let x = d.mid
                                    let y = cy + (genHeight[nodes.filter(e => e.name === d.source)[0].distance]) + (num - 20)
                                    return "translate(" + x + "," + y + ")rotate(" + 180 + ")"
                                }) 
                        },update => {
                            update 
                                .style('opacity', d => d.parents === hovered ? 1 : hovered.length > 0 ? 0.2 : 1)
                                .style('display', countType === 'record' || (countType === 'person' && relationship === 'descendants') ? 'block' : 'none')
                            update.select('.prune-curve-line')
                                .style('display', pruned ? 'block' : 'none')
                                .attr("d", d => {
                                    let sourceNode = nodes.filter(e => e.name === d.source)[0]
                                    let x1 = d.x
                                    let y1 = countType === 'record' || countType === 'measurement' ? cy + (genHeight[sourceNode.distance]) + scaleRadius(Math.sqrt(sourceNode.record_counts)) + 18 : cy + (genHeight[sourceNode.distance]) + scaleRadius(Math.sqrt(sourceNode.person_counts)) + 18
                                    let x2 = d.mid
                                    let y2 = cy + (genHeight[sourceNode.distance]) + (num - 20)
                                    return curveY({source: [x1, y1], target: [x2, y2]})
                                })
                            update.select(".prune-curve-background")
                                .style('display', pruned ? 'block' : 'none')
                                .attr("d", d => {
                                    let sourceNode = nodes.filter(e => e.name === d.source)[0]
                                    let x1 = d.x
                                    let y1 = countType === 'record' || countType === 'measurement' ? cy + (genHeight[sourceNode.distance]) + scaleRadius(Math.sqrt(sourceNode.record_counts)) + 18 : cy + (genHeight[sourceNode.distance]) + scaleRadius(Math.sqrt(sourceNode.person_counts)) + 18
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
                        bindTreeNodeHover(update)
                        // d3.selectAll('.subsumes-nodes').lower()
                        // d3.selectAll('.map-node').raise()
                        d3.selectAll('.prune-curve').lower()
                        return update
                    }, exit => exit.remove())
                        .call(layoutFocusRects)
                        .call(sel => requestAnimationFrame(() => zoomToFit(sel)))
            }
            updateLinks()
            updateNodes()
        }
        // minimap
        function drawZoomedNeighborhood(neighborhoodNodes, neighborhoodLinks, hoveredName) {
            // get extent of total counts
            let sums = []
            neighborhoodNodes.forEach(node => {
                countType === 'record' || countType === 'measurement' ? sums.push(Math.sqrt(node.record_counts)) : sums.push(Math.sqrt(node.person_counts))
            })
            const nodeExtent = d3.extent(sums)
            const scaleRadius = d3.scaleLinear().domain([0, nodeExtent[1]]).range(nodeExtent[1] === 0 ? [4,4] : [8, 20])

            const container = d3.select("#minimap").node()
            if (!container) return
            const width = container.getBoundingClientRect().width
            const height = container.getBoundingClientRect().height

            const hoveredNode = neighborhoodNodes.find(n => n.name === hoveredName)
            if (!hoveredNode) return

            // const genSpacing = 70   // fixed vertical distance between generations
            // const xSpacing = 90     // fixed horizontal distance between siblings in a generation

            // // assign fixed-spacing local x per generation, preserving relative order from the main tree's d.x
            // const byGeneration = d3.group(neighborhoodNodes, d => d.distance)
            // const localX = new Map()
            // byGeneration.forEach((genNodes) => {
            //     const sorted = [...genNodes].sort((a, b) => a.x - b.x)
            //     const n = sorted.length
            //     sorted.forEach((node, i) => {
            //         localX.set(node.name, (i - (n - 1) / 2) * xSpacing) // centered around 0
            //     })
            // })

            // const getX = d => localX.get(d.name)
            // const getY = d => (d.distance - hoveredNode.distance) * genSpacing

            d3.select('#minimap-nodes').selectAll('.mini-node').remove()

            const isMappings = relationship === 'mappings'
            const genSpacing = 70
            const xSpacing = 90
            const mapSpacing = 80   
            const mapOffset = 160    
            const localX = new Map()
            const localY = new Map()
            let mapNodes = []
            let side = 0

            if (isMappings) {
                side = hoveredNode.data.concept.standard_concept ? -1 : 1
                mapNodes = neighborhoodNodes.filter(n => n !== hoveredNode)
                localX.set(hoveredNode.name, 0)
                localY.set(hoveredNode.name, 0)
                mapNodes.forEach((m, i) => {
                    localX.set(m.name, side * mapOffset)
                    localY.set(m.name, (i - (mapNodes.length - 1) / 2) * mapSpacing)  
                })
            } else {
                const byGeneration = d3.group(neighborhoodNodes, d => d.distance)
                byGeneration.forEach((genNodes) => {
                    const sorted = [...genNodes].sort((a, b) => a.x - b.x)
                    const n = sorted.length
                    sorted.forEach((node, i) => {
                        localX.set(node.name, (i - (n - 1) / 2) * xSpacing)
                    })
                })
            }

            const getX = d => localX.get(d.name)
            const getY = d => isMappings ? localY.get(d.name) : (d.distance - hoveredNode.distance) * genSpacing

            // links
            // d3.select("#minimap-links").selectAll('.mini-link')
            //     .data(neighborhoodLinks, d => d.source.name + d.target.name)
            //     .join(
            //         enter => enter.append('line')
            //             .classed('mini-link', true)
            //             .attr('stroke', d => (inclusions.includes(d.source.name) || d.source.mappings.map(m => m.name).some(m => inclusions.includes(m))) && (inclusions.includes(d.target.name) || d.target.mappings.map(m => m.name).some(m => inclusions.includes(m))) ? '#c2c2c2' : '#e8e8e8')
            //             .attr('stroke-width', 1)
            //             .attr('x1', d => getX(d.source))
            //             .attr('y1', d => getY(d.source))
            //             .attr('x2', d => getX(d.target))
            //             .attr('y2', d => countType === 'record' || countType === 'measurement' ? getY(d.target) - scaleRadius(Math.sqrt(d.target.record_counts)) - 20 : getY(d.target) - scaleRadius(Math.sqrt(d.target.person_counts)) - 20),
            //         update => update
            //             .attr('stroke', d => (inclusions.includes(d.source.name) || d.source.mappings.map(m => m.name).some(m => inclusions.includes(m))) && (inclusions.includes(d.target.name) || d.target.mappings.map(m => m.name).some(m => inclusions.includes(m))) ? '#c2c2c2' : '#e8e8e8')
            //             .attr('x1', d => getX(d.source))
            //             .attr('y1', d => getY(d.source))
            //             .attr('x2', d => getX(d.target))
            //             .attr('y2', d => countType === 'record' || countType === 'measurement' ? getY(d.target) - scaleRadius(Math.sqrt(d.target.record_counts)) - 20 : getY(d.target) - scaleRadius(Math.sqrt(d.target.person_counts)) - 20),
            //         exit => exit.remove()
            //     )
            const linkLayer = d3.select('#minimap-links')

            if (isMappings) {
                linkLayer.selectAll('.mini-link').remove()

                const rOf = d => scaleRadius(Math.sqrt(countType === 'record' || countType === 'measurement' ? d.record_counts : d.person_counts))
                const linkGen = d3.link(d3.curveBumpX)
                const miniMapLinks = mapNodes.map(m => ({ source: m, target: hoveredNode }))
                const ends = d => ({
                    sx: getX(d.source) - side * rOf(d.source),        // mapping edge facing the focused node
                    sy: getY(d.source),
                    tx: getX(d.target) + side * (rOf(d.target) + 4),  // focused node edge facing the mappings
                    ty: getY(d.target)
                })
                const stroke = d => inclusions.includes(d.source.name) ? '#c2c2c2' : '#e8e8e8'

                linkLayer.selectAll('.mini-map-link')
                    .data(miniMapLinks, d => d.source.name)
                    .join(enter => enter.append('path')
                        .classed('mini-map-link', true)
                        .attr('fill', 'none')
                        .attr('stroke-width', 1)
                        .attr('stroke-dasharray', '4 2'))
                    .attr('stroke', stroke)
                    .attr('d', d => { const e = ends(d); return linkGen({ source: [e.sx, e.sy], target: [e.tx, e.ty] }) })

                linkLayer.selectAll('.mini-map-arrow')
                    .data(miniMapLinks, d => d.source.name)
                    .join(enter => enter.append('path')
                        .classed('mini-map-arrow', true)
                        .attr('d', d3.symbol().type(d3.symbolTriangle).size(20)))
                    .attr('fill', stroke)
                    .attr('transform', d => {
                        const e = ends(d)
                        // the triangle points up by default: rotate it to face the focused node
                        return `translate(${e.tx + side * 3},${e.ty})rotate(${side === -1 ? 90 : -90})`
                    })
            } else {
                linkLayer.selectAll('.mini-map-link, .mini-map-arrow').remove()

                linkLayer.selectAll('.mini-link')
                    .data(neighborhoodLinks, d => d.source.name + d.target.name)
                    .join(
                        enter => enter.append('line')
                            .classed('mini-link', true)
                            .attr('stroke', d => (inclusions.includes(d.source.name) || d.source.mappings.map(m => m.name).some(m => inclusions.includes(m))) && (inclusions.includes(d.target.name) || d.target.mappings.map(m => m.name).some(m => inclusions.includes(m))) ? '#c2c2c2' : '#e8e8e8')
                            .attr('stroke-width', 1)
                            .attr('x1', d => getX(d.source))
                            .attr('y1', d => getY(d.source))
                            .attr('x2', d => getX(d.target))
                            .attr('y2', d => countType === 'record' || countType === 'measurement' ? getY(d.target) - scaleRadius(Math.sqrt(d.target.record_counts)) - 20 : getY(d.target) - scaleRadius(Math.sqrt(d.target.person_counts)) - 20),
                        update => update
                            .attr('stroke', d => (inclusions.includes(d.source.name) || d.source.mappings.map(m => m.name).some(m => inclusions.includes(m))) && (inclusions.includes(d.target.name) || d.target.mappings.map(m => m.name).some(m => inclusions.includes(m))) ? '#c2c2c2' : '#e8e8e8')
                            .attr('x1', d => getX(d.source))
                            .attr('y1', d => getY(d.source))
                            .attr('x2', d => getX(d.target))
                            .attr('y2', d => countType === 'record' || countType === 'measurement' ? getY(d.target) - scaleRadius(Math.sqrt(d.target.record_counts)) - 20 : getY(d.target) - scaleRadius(Math.sqrt(d.target.person_counts)) - 20),
                        exit => exit.remove()
                    )
            }

            // nodes
            const nodeGroups = d3.select("#minimap-nodes").selectAll('.mini-node')
                .data(neighborhoodNodes, d => d.name)
                .join(
                    enter => {
                        const g = enter.append('g').classed('mini-node', true)
                        g.append('circle')
                            .classed('mini-circle', true)
                            .attr('id', d => 'mini-circle-' + d.name)
                            .attr('r', d => countType === 'record' || countType === 'measurement' ? scaleRadius(Math.sqrt(d.record_counts)) : scaleRadius(Math.sqrt(d.person_counts)))
                            .attr('stroke-width', 1.5)
                            .attr('stroke', d => (countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0) ? 'none' : inclusions.includes(d.name) ? d.color : '#f3f3f5')
                            .attr('fill', d => {
                                if ((countType === 'record' && d.record_counts === 0) || (d.leaf && relationship !== 'mappings') || (countType === 'person' && d.person_counts === 0)) return 'white'
                                else {
                                    if (!d.data.concept.standard_concept && inclusions.includes(d.name)) {
                                        let t = textures.lines().size(3).strokeWidth(1.5).stroke(d.color)
                                        d3.select('#tree').call(t)
                                        return t.url()
                                    }
                                    else if (d.data.concept.standard_concept && inclusions.includes(d.name)) return d.color
                                    else return '#f3f3f5'
                                }
                            })
                        const miniCounts = g.append('g')
                            .attr('id', d => 'mini-counts-' + d.name)
                            .style('opacity', 1)
                        miniCounts.append('text')
                            .classed('mini-total-counts num', true)
                            .attr('text-anchor', 'middle')
                            .text(d => countType === 'record' || countType === 'measurement' ? formatThousands(d.record_counts) : formatThousands(d.person_counts))
                            .attr('fill', d => inclusions.includes(d.name) && !d.leaf ? getContrastColor(d.color) : '#36126d')
                            .style('font-size', '5px')
                            .attr('dy', 0)
                        miniCounts.append('text')
                            .classed('mini-total-counts-label', true)
                            .style('font-size', '5px')
                            .attr('text-anchor', 'middle')
                            .text(() => countType === 'record' || countType === 'measurement' ? 'RC' : 'PC')
                            .attr('fill', d => inclusions.includes(d.name) && !d.leaf ? getContrastColor(d.color) : '#36126d')
                            .attr('dy', 5)
                        const miniLabel = g.append('g').classed('mini-label', true)
                        const miniText = miniLabel.append('g').attr('id', d => 'mini-label-text-' + d.name)
                        miniText.append('text')
                            .classed('mini-label-name', true)
                            .attr('text-anchor', 'middle')
                            .attr('font-weight', 500)
                            .attr('fill', '#36126d')
                            .style('font-size', '6px')
                            .text(d => {
                                let concept_info = d.data.concept
                                let text = concept_info.concept_name || concept_info.concept_id.toString()
                                let maxWidth = 20
                                return text.substring(0, maxWidth) + (text.length > maxWidth ? '...' : '    ')
                            })
                            .attr('dy', d => countType === 'record' || countType === 'measurement' ? -scaleRadius(Math.sqrt(d.record_counts)) - 14 : -scaleRadius(Math.sqrt(d.person_counts)) - 14)
                            .style('opacity', d => inclusions.includes(d.name) || (countType === 'record' && d.leaf) || (countType === 'person' && d.leaf && relationship !== 'mappings') ? 1 : 0.6)
                        const miniLine2 = miniText.append('text')
                            .classed('mini-label-line2', true)
                            .attr('text-anchor', 'middle')
                            .attr('fill', '#4c4c4c')
                            .style('opacity', d => inclusions.includes(d.name) || (countType === 'record' && d.leaf) || (countType === 'person' && d.leaf && relationship !== 'mappings') ? 1 : 0.6)
                            .attr('dy', d => countType === 'record' || countType === 'measurement' ? -scaleRadius(Math.sqrt(d.record_counts)) - 6 : -scaleRadius(Math.sqrt(d.person_counts)) - 6)
                            .style('display', d => d.data.concept.concept_code ? 'block' : 'none')
                            .style('font-size', '6px')
                        miniLine2.append('tspan')
                            .classed('mini-label-code num', true)
                            .text(d => d.data.concept.concept_code + '  ')
                            .attr('font-weight', 500)
                        miniLine2.append('tspan')
                            .classed('mini-label-vocabulary', true)
                            .text(d => d.data.concept.vocabulary_id)
                        miniLabel.append('rect')
                            .classed('mini-label-rect', true)
                            .attr('id', d => 'mini-label-rect-' + d.name)
                            .attr('width', d => d3.select("#mini-label-text-" + d.name).node().getBBox().width + 10)
                            .attr('height', d => d.data.concept.concept_code ? 20 : 5)
                            .attr("rx", 6)
                            .attr("ry", 6)
                            .attr('x', d => -(d3.select("#mini-label-text-" + d.name).node().getBBox().width + 10) / 2)
                            .attr('y', d => countType === 'record' || countType === 'measurement' ? (d.data.concept.concept_code ? -scaleRadius(Math.sqrt(d.record_counts)) - 22 : -scaleRadius(Math.sqrt(d.record_counts)) - 7) : (d.data.concept.concept_code ? -scaleRadius(Math.sqrt(d.person_counts)) - 22 : -scaleRadius(Math.sqrt(d.person_counts)) - 7))
                            .attr('fill', d => inclusions.includes(d.name) || (countType === 'record' && d.leaf) || (countType === 'person' && d.leaf && relationship !== 'mappings') ? 'white' : '#f2f2f4')
                            .style("filter", d => inclusions.includes(d.name) || (countType === 'record' && d.leaf) || (countType === 'person' && d.leaf && relationship !== 'mappings') ? "drop-shadow(0px 0px 4px rgba(0, 0, 0, 0.16))" : 'none')
                            .attr('stroke-width', 1)
                            .attr('stroke', d => rootConcepts.includes(d.name) ? '#7728ED' : 'transparent')
                            .lower()
                        return g
                    },
                    update => update,
                    exit => exit.remove()
                )

            nodeGroups.attr('transform', d => `translate(${getX(d)},${getY(d)})`)

            // fit the whole laid-out group into the minimap's frame, same principle as zoomToFit
            requestAnimationFrame(() => fitMinimap(width, height))
        }
        function fitMinimap(width, height, padding = 5) {
            const innerNode = d3.select("#minimap-inner").node()
            if (!innerNode) return
            const bbox = innerNode.getBBox()
            const { width: bw, height: bh, x, y } = bbox
            if (bw === 0 || bh === 0) return

            // never scale up past 1 — only shrink when content overflows the frame
            const scale = Math.min(1, (width - padding * 2) / bw, (height - padding * 2) / bh)

            const cx = x + bw / 2
            const cy = y + bh / 2
            const translateX = width / 2 - cx * scale
            const translateY = height / 2 - cy * scale

            d3.select("#minimap-inner")
                .attr('transform', `translate(${translateX},${translateY}) scale(${scale})`)
        }
        // list
        function drawList() {
            let sums = []
            nodes.filter(n => n.levels !== '-1').forEach(node => {
                if (countType === 'record' || countType === 'measurement') {
                    sums.push(node.record_counts)
                    sums.push(node.descendant_record_counts)    
                } else {
                    sums.push(node.person_counts)
                    sums.push(node.descendant_person_counts)    
                }
                
                node.mappings.forEach(map => {
                    if (countType === 'record' || countType === 'measurement') {
                        sums.push(map.record_counts)
                        sums.push(map.descendant_record_counts)    
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
                    .style('border-bottom','1px solid color-mix(in srgb, #b3b3bf, white 70%)')
                title.append('i')
                    .classed('list-section-arrow fa-solid fa-arrow-up',true)
                    .style('transform', d => d.section === 'Root' ? 'rotate('+90+'deg)' : d.section !== 'Parents' ? 'rotate('+180+'deg)' : 'none')
                    .style('transform-origin', 'center')
                    .style('font-size','10px')
                title.append('p')
                    .classed('list-level-number selectedText',true)
                    .html(d => d.section === 'Root' ? 'Level 1' : d.section)
                title.append('i')
                    .classed('parents-caret-down fa-solid fa-caret-down iconLg',true)
                    .attr('id', d => 'parents-caret-down-'+d.name)
                    .style('display', d => d.section === 'Parents' && nodes.filter(n => n.levels === '-1').length > 10 ? 'block' : 'none')
                    .style("margin-left",'6px')
                    .on('click',(e,d) => {
                        d3.selectAll(".list-item-container"+'-1').transition(2000).style('height','auto').style('display','block')
                        d3.select('#parents-caret-down-'+d.name).style('display','none')
                        d3.select('#parents-caret-up-'+d.name).style('display','block')
                    })
                title.append('i')
                    .classed('parents-caret-up fa-solid fa-caret-up iconLg',true)
                    .attr('id', d => 'parents-caret-up-'+d.name)
                    .style('opacity',1)
                    .style("margin-left",'6px')
                    .style('display', 'none')
                    .on('click',(e,d) => {
                        d3.selectAll(".list-item-container"+'-1').transition(2000).style('height','0px').style('display','none')
                        d3.select('#parents-caret-down-'+d.name).style('display','block')
                        d3.select('#parents-caret-up-'+d.name).style('display','none')
                    })
                // CONCEPT LIST
                section.selectAll(".list-item-container").data(d => d.nodes, d => d.name)
                .join(enter => {
                    const itemContainer = enter.append('div')
                        .classed('list-item-container',true)
                        .each(function(d) {this.classList.add(`list-item-container${d.levels}`)})
                        .style('border-bottom', d => d.levels === '-1' ? '0.5px solid #d3d3d3' : '0.5px solid #e8e8e8')
                        .style('display', d => d.levels === '-1' && d.collapsed ? 'none' : 'block')
                        .style('height', d => d.levels === '-1' && d.collapsed ? '0px' : 'auto')
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
                        .style('box-shadow', d => inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? '0 0 0 1px rgba(0, 0, 0, 0.02),0 2px 10px rgba(0, 0, 0, 0.15)' : 'none')
                        .style('background-color', d => d.levels === '-1' ? 'none' : inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? 'white' : '#f2f2f4')
                        .style('border', d => rootConcepts.includes(d.name) ? '1px solid #7728ED' : 'none')
                    const title = conceptCard.append('div')
                        .classed('list-item-title',true)
                    const title1 = title.append('div')
                        .style('display','flex')
                        .style('align-items','center')
                    title1.append('div')
                        .classed('list-title-circle',true)
                        .classed('list-circle-dash', d => ((countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0)) && (!d.leaf || (d.leaf && countType === 'person' && relationship === 'mappings')) ? true : false)
                        .classed('list-circle', d => ((countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0)) && (!d.leaf || (d.leaf && countType === 'person' && relationship === 'mappings')) ? false : true)
                        .classed('btn', d => inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? true : false)
                        .style("pointer-events", d => inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? 'all' : 'none')
                        .style('background', d => {
                            if (((countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0)) || (d.leaf && (countType === 'record' || (countType === 'person' && relationship === 'descendants')))) return "none"
                            else if (inclusions.includes(d.name)) {
                                if (!d.data.concept.standard_concept) {return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, "+ d.color + " 0.5px," + d.color + " 2px)"} 
                                else {return "none"}
                            }
                            else {
                                if (!d.data.concept.standard_concept) return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, #d2d2d9 0.5px, #d2d2d9 2px)"  
                                else {return "none"}

                            }      
                        })
                        .style("background-color", d => {
                            if (((countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0)) || (d.leaf && (countType === 'record' || (countType === 'person' && relationship === 'descendants')))) return "transparent"
                            else if (inclusions.includes(d.name)) {
                                if (d.data.concept.standard_concept) {return d.color} 
                                else {return "transparent"}
                            }
                            else return '#d2d2d9'
                        }) 
                        .style('border', d => d.leaf ? countType === 'record' || (countType === 'person' && relationship === 'descendants') ? `1.5px solid ${d.color}` : '1px solid #d2d2d9' : inclusions.includes(d.name) ? `1px solid ${d.color}` : '1px solid #d2d2d9')
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
                        .style('display', d => !inclusions.includes(d.name) && (d.record_counts !== 0 || isLeaf(d)) && !d.leaf && d.levels !== '-1' ? 'inline-block' : 'none')
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
                            updateConcepts(getNewInclusions(d,'show'))
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
                        .style('display', d => (((countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0)) && !d.leaf) || d.levels === '-1' ? 'none' : !inclusions.includes(d.name) && !d.leaf ? 'none' : 'inline-block')
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
                            updateConcepts(getNewInclusions(d,'hide'))
                        })
                    icons.append('i')
                        .classed('list-search fa fa-search iconLg marginRight',true)
                        .attr('id', d => 'list-search-'+d.name)
                        .style('transform','scaleX(-1)')
                        .style('display', d => rootConcepts.includes(d.name) ? 'none' : 'inline-block')
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
                        .style('opacity', d => inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? 1 : 0.6)
                        .on('mouseover', (e, d) => {
                            if (!rootConcepts.includes(d.name)) {
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
                            if (!rootConcepts.includes(d.name)) showConfirmationPopup(d, 'enter', e)
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
                        .style('color', '#c9c9d5')
                        .style('display', d => d.levels === '-1' || !d.levels ? 'none' : 'block')
                        .on('mouseover',(e,d) => d3.select('#info-icon-'+d.name).transition().style('color','#9597a6'))
                        .on('mouseout', (e,d) => {if(d3.select('#info-container-'+d.name).style('height') !== '45px') d3.select('#info-icon-'+d.name).transition().style('color','#c9c9d5')})
                        .on('click', (e,d) => {
                            if (d3.select('#info-container'+d.name).style('height') === '45px') {
                                d3.select('#info-icon-'+d.name).transition().style('color','#c9c9d5')
                                d3.select('#info-container-'+d.name).transition().style('opacity',0).style('height','0px').style('padding-top','0px').style('margin','0px 0px 0px 22px')
                                d3.select('#list-card-'+d.name).transition().style('border-radius','20px')
                            } else {
                                d3.select('#info-icon-'+d.name).transition().style('color','#9597a6')
                                d3.select('#info-container-'+d.name).transition().style('opacity',1).style('height','45px').style('padding-top','4px').style('margin','4px 4px 4px 22px')
                                d3.select('#list-card-'+d.name).transition().style('border-radius','12px')
                            }
                        })
                    const infoContainer = conceptCard.append('div')
                        .classed('info-container',true)
                        .attr('id', d => 'info-container-'+d.name)
                        .style('display', d => d.levels === '-1' || !d.levels ? 'none' : 'flex')
                        .style('border-top', d => inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? '1px solid #e7e7eb' : '1px solid color-mix(in srgb, #36126d, white 85%)')
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
                        .style('color', d => inclusions.includes(d.name) && !d.leaf ? '#36126d' : '#9597a6')
                        .style('font-weight', d => inclusions.includes(d.name) && !d.leaf ? 500 : 400)
                        .html(d => countType === 'record' || countType === 'measurement' ? formatThousands(d.record_counts) : formatThousands(d.person_counts))
                    countsRC.append('p')
                        .classed('counts-RC-label list-counts-label',true)
                        .style('color', d => inclusions.includes(d.name) && !d.leaf ? '#36126d' : '#9597a6')
                        .style('font-weight', d => inclusions.includes(d.name) && !d.leaf ? 500 : 400)
                        .html(() => countType === 'record' || countType === 'measurement' ? 'RC' : 'PC')
                    const countsBarRC = countsRC.append('div')
                        .classed('list-counts-bar-container',true)
                    countsBarRC.append('div')
                        .classed('counts-RC-bar list-counts-bar',true)
                        .style('width', d => countType === 'record' || countType === 'measurement' ? scaleWidth(d.record_counts) + 'px' : scaleWidth(d.person_counts) + 'px')
                        .style('background-color', d => inclusions.includes(d.name) && !d.leaf ? d.color : '#e8e8e8')
                    
                    const countsDRC = countsSection.append('div')
                        .classed('list-counts',true)
                    countsDRC.append('p')
                        .classed('counts-DRC-p list-counts-p num',true)
                        .style('text-align','left')
                        .style('color', d => inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? '#36126d' : '#9597a6')
                        .style('font-weight', d => inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? 500 : 400)
                        .html(d => countType === 'record' || countType === 'measurement' ? formatThousands(d.descendant_record_counts) : formatThousands(d.descendant_person_counts))
                    countsDRC.append('p')
                        .classed('counts-DRC-label list-counts-label',true)
                        .style('color', d => inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? '#36126d' : '#9597a6')
                        .style('font-weight', d => inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? 500 : 400)
                        .html(() => countType === 'record' || countType === 'measurement' ? 'DRC' : 'DPC')
                    const countsBarDRC = countsDRC.append('div')
                        .classed('list-counts-bar-container',true)
                    countsBarDRC.append('div')
                        .classed('counts-DRC-bar list-counts-bar',true)
                        .style('width', d => countType === 'record' || countType === 'measurement' ? scaleWidth(d.descendant_record_counts) + 'px' : scaleWidth(d.descendant_person_counts) + 'px')
                        .style('background-color', d => inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? d.color : '#e8e8e8')

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
                        .style('border-left', () => hovered.length > 0 ? '1px dashed #36126d20' : '1px dashed #36126d')
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
                            .style('box-shadow', d => inclusions.includes(d.name) ? '0 0 0 1px rgba(0, 0, 0, 0.02),0 2px 10px rgba(0, 0, 0, 0.15)' : 'none')
                            .style('background-color', d => inclusions.includes(d.name) ? 'white' : '#f2f2f4')
                        const mapTitle = mapConceptCard.append('div')
                            .classed('list-item-title',true)
                        const mapTitle1 = mapTitle.append('div')
                            .style('display','flex')
                            .style('align-items','center')
                        mapTitle1.append('div')
                            .classed('map-list-title-circle',true)
                            .classed('list-circle-dash', d => (countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0) ? true : false)
                            .classed('list-circle', d => (countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0) ? false : true)
                            .classed('btn', d => inclusions.includes(d.name) ? true : false)
                            .style('pointer-events', d => inclusions.includes(d.name) ? 'all' : 'none')
                            .style('background', d => {
                                if ((countType === 'record' && (d.record_counts === 0 || (d.source.leaf && relationship === 'mappings' && countType !== 'person'))) || (countType === 'person' && (d.person_counts === 0 && relationship === 'mappings' && countType !== 'person'))) return 'none'
                                else if (inclusions.includes(d.name)) {
                                    if (!d.data.concept.standard_concept) {return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, "+ d.color + " 0.5px," + d.color + " 2px)"} 
                                    else {return "none"}
                                }
                                else {
                                    if (!d.data.concept.standard_concept) return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, #d2d2d9 0.5px, #d2d2d9 2px)"    
                                    else {return "none"}

                                }  
                            })
                            .style("background-color", d => {
                                if ((countType === 'record' && (d.record_counts === 0 || (d.source.leaf && relationship === 'mappings' && countType !== 'person'))) || (countType === 'person' && (d.person_counts === 0 && relationship === 'mappings' && countType !== 'person'))) return 'transparent'
                                else if (inclusions.includes(d.name)) {
                                    if (d.data.concept.standard_concept) {return d.color} 
                                    else {return "transparent"}
                                }
                                else return '#d2d2d9'
                            }) 
                            .style('border', d => inclusions.includes(d.name) ? d.source.leaf ? `1px solid ${d.source.color}` : `1px solid ${d.color}` : (countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0) ? '1px solid #d2d2d9' : d.source.leaf && relationship === 'mappings' && countType !== 'person' ? `1px solid ${d.source.color}` : '1px solid #d2d2d9')
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
                                .style('display', d => !inclusions.includes(d.name) && d.record_counts > 0 ? 'inline-block' : 'none')
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
                                   updateConcepts(newInclusions)
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
                            .style('display', d => (countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0) || !inclusions.includes(d.name) ? 'none' : 'inline-block')
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
                               updateConcepts(newInclusions)
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
                            .style('opacity', d => inclusions.includes(d.name) ? 1 : 0.6)
                            .on('mouseover', (e, d) => {
                                if (!rootConcepts.includes(d.name)) {
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
                                if (!rootConcepts.includes(d.name)) showConfirmationPopup(d, 'enter', e)
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
                            // .style('opacity', 0.2)
                            .on('mouseover',(e,d) => d3.select('#info-icon-'+d.name+d.source.name).transition().style('color','#9597a6'))
                            .on('mouseout', (e,d) => {if(d3.select('#info-container-'+d.name+d.source.name).style('height') !== '45px') d3.select('#info-icon-'+d.name+d.source.name).transition().style('color','#c9c9d5')})
                            .on('click', (e,d) => {
                                if (d3.select('#info-container-'+d.name+d.source.name).style('height') === '45px') {
                                    d3.select('#info-icon-'+d.name+d.source.name).transition().style('color','#c9c9d5')
                                    d3.select('#info-container-'+d.name+d.source.name).transition().style('opacity',0).style('height','0px').style('padding-top','0px').style('margin','0px 0px 0px 22px')
                                    d3.select('#list-card-'+d.name+d.source.name).transition().style('border-radius','20px')
                                } else {
                                    d3.select('#info-icon-'+d.name+d.source.name).transition().style('color','#9597a6')
                                    d3.select('#info-container-'+d.name+d.source.name).transition().style('opacity',1).style('height','45px').style('padding-top','4px').style('margin','4px 4px 4px 22px')
                                    d3.select('#list-card-'+d.name+d.source.name).transition().style('border-radius','12px')
                                }
                            })
                        const mapInfoContainer = mapConceptCard.append('div')
                            .classed('map-info-container',true)
                            .attr('id', d => 'info-container-'+d.name+d.source.name)
                            .style('border-top', d => inclusions.includes(d.name) ? '1px solid #e7e7eb' : '1px solid color-mix(in srgb, #36126d, white 85%)')
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
                            .style('color', d => inclusions.includes(d.name) ? '#36126d' : '#9597a6')
                            .style('font-weight', d => inclusions.includes(d.name) ? 500 : 400)
                            .html(d => countType === 'record' || countType === 'measurement' ? formatThousands(d.record_counts) : formatThousands(d.person_counts))
                        mapCountsRC.append('p')
                            .classed('map-counts-RC-label list-counts-label',true)
                            .style('color', d => inclusions.includes(d.name) ? '#36126d' : '#9597a6')
                            .style('font-weight', d => inclusions.includes(d.name) ? 500 : 400)
                            .html(() => countType === 'record' || countType === 'measurement' ? 'RC' : 'PC')
                        const mapCountsBarRC = mapCountsRC.append('div')
                            .classed('list-counts-bar-container',true)
                        mapCountsBarRC.append('div')
                            .classed('map-counts-RC-bar list-counts-bar',true)
                            .style('width', d => countType === 'record' || countType === 'measurement' ? scaleWidth(d.record_counts) + 'px' : scaleWidth(d.person_counts) + 'px' )
                            .style('background-color', d => inclusions.includes(d.name) ? d.source.leaf && (relationship === 'mappings' && countType === 'record') ? d.source.color : d.color : '#e8e8e8')
                        
                        const mapCountsDRC = mapCountsSection.append('div')
                            .classed('list-counts',true)
                        mapCountsDRC.append('p')
                            .classed('map-counts-DRC-p list-counts-p num',true)
                            .style('text-align','left')
                            .style('color', '#9597a6')
                            .style('font-weight', 400)
                            .html(d => countType === 'record' || countType === 'measurement' ? formatThousands(d.descendant_record_counts) : formatThousands(d.descendant_person_counts))
                        mapCountsDRC.append('p')
                            .classed('map-counts-DRC-label list-counts-label',true)
                            .style('color', '#9597a6')
                            .style('font-weight', 400)
                            .html(() => countType === 'record' || countType === 'measurement' ? 'DRC' : 'DPC')
                        const mapCountsBarDRC = mapCountsDRC.append('div')
                            .classed('list-counts-bar-container',true)
                        mapCountsBarDRC.append('div')
                            .classed('map-counts-DRC-bar list-counts-bar',true)
                            .style('width', d => countType === 'record' || countType === 'measurement' ? scaleWidth(d.descendant_record_counts) + 'px' : scaleWidth(d.descendant_person_counts) + 'px')
                            .style('background-color', '#e8e8e8')   
                        
                        mapDataSection.append('div')
                            .classed('list-open-mappings',true)
                    
                    },update => {
                        update
                            .transition()
                            .style('max-height', d => mapRoot.includes(d.source.name) || (nodes.find(n => n.name === d.source.name).mappings.map(m => m.name).some(map => inclusions.includes(map))) ? '100px' : '0px')
                            .style('visibility', d => mapRoot.includes(d.source.name) || (nodes.find(n => n.name === d.source.name).mappings.map(m => m.name).some(map => inclusions.includes(map))) ? 'visible' : 'hidden')
                        update.select('.map-list-item')
                            .transition()
                            .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                        update.select('.map-list-card')
                            .style('box-shadow', d => inclusions.includes(d.name) ? '0 0 0 1px rgba(0, 0, 0, 0.02),0 2px 10px rgba(0, 0, 0, 0.15)' : 'none')
                            .style('background-color', d => d.levels === '-1' ? 'none' : inclusions.includes(d.name) ? 'white' : '#f2f2f4')
                        update.select('.map-list-title-circle')
                            .classed('list-circle-dash', d => (countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0) ? true : false)
                            .classed('list-circle', d => (countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0) ? false : true)
                            .classed('btn', d => inclusions.includes(d.name) ? true : false)
                            .style('pointer-events', d => inclusions.includes(d.name) ? 'all' : 'none')
                            .style('background', d => {
                                if ((countType === 'record' && (d.record_counts === 0 || (d.source.leaf && relationship === 'mappings' && countType !== 'person'))) || (countType === 'person' && (d.person_counts === 0 && relationship === 'mappings' && countType !== 'person'))) return 'none'
                                else if (inclusions.includes(d.name)) {
                                    if (!d.data.concept.standard_concept) {return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, "+ d.color + " 0.5px," + d.color + " 2px)"} 
                                    else {return "none"}
                                }
                                else {
                                    if (!d.data.concept.standard_concept) return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, #d2d2d9 0.5px, #d2d2d9 2px)"    
                                    else {return "none"}

                                }  
                            })
                            .style("background-color", d => {
                                if ((countType === 'record' && (d.record_counts === 0 || (d.source.leaf && relationship === 'mappings' && countType !== 'person'))) || (countType === 'person' && (d.person_counts === 0 && relationship === 'mappings' && countType !== 'person'))) return 'transparent'
                                else if (inclusions.includes(d.name)) {
                                    if (d.data.concept.standard_concept) {return d.color} 
                                    else {return "transparent"}
                                }
                                else return '#d2d2d9'
                            }) 
                            .style('border', d => inclusions.includes(d.name) ? d.source.leaf ? `1px solid ${d.source.color}` : `1px solid ${d.color}` : (countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0) ? '1px solid #d2d2d9' : d.source.leaf && relationship === 'mappings' && countType !== 'person' ? `1px solid ${d.source.color}` : '1px solid #d2d2d9')
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
                            .style('display', d => !inclusions.includes(d.name) && d.record_counts > 0 ? 'inline-block' : 'none')
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
                               updateConcepts(newInclusions)
                            })
                        update.select('.map-list-eye')
                            .style('display', d => (countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0) || !inclusions.includes(d.name) ? 'none' : 'inline-block')
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
                                updateConcepts(newInclusions)
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
                                if (!rootConcepts.includes(d.name)) {
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
                                if (!rootConcepts.includes(d.name)) showConfirmationPopup(d, 'enter', e)
                            })
                            .transition()
                            .style('opacity', d => inclusions.includes(d.name) ? 1 : 0.6)
                        update.select('.map-info-icon')
                            .on('mouseover',(e,d) => d3.select('#info-icon-'+d.name+d.source.name).transition().style('color','#9597a6'))
                            .on('mouseout', (e,d) => {if(d3.select('#info-container-'+d.name+d.source.name).style('height') !== '45px') d3.select('#info-icon-'+d.name+d.source.name).transition().style('color','#c9c9d5')})
                            .on('click', (e,d) => {
                                if (d3.select('#info-container-'+d.name+d.source.name).style('height') === '45px') {
                                    d3.select('#info-icon-'+d.name+d.source.name).transition().style('color','#c9c9d5')
                                    d3.select('#info-container-'+d.name+d.source.name).transition().style('opacity',0).style('height','0px').style('padding-top','0px').style('margin','0px 0px 0px 22px')
                                    d3.select('#list-card-'+d.name+d.source.name).transition().style('border-radius','20px')
                                } else {
                                    d3.select('#info-icon-'+d.name+d.source.name).transition().style('color','#9597a6')
                                    d3.select('#info-container-'+d.name+d.source.name).transition().style('opacity',1).style('height','45px').style('padding-top','4px').style('margin','4px 4px 4px 22px')
                                    d3.select('#list-card-'+d.name+d.source.name).transition().style('border-radius','12px')
                                }
                            })
                        update.select('.map-info-container')
                            .style('border-top', d => inclusions.includes(d.name) ? '1px solid #e7e7eb' : '1px solid color-mix(in srgb, #36126d, white 85%)')
                        update.select('.map-counts-RC-p')
                            .style('color', d => inclusions.includes(d.name) ? '#36126d' : '#9597a6')
                            .style('font-weight', d => inclusions.includes(d.name) ? 500 : 400)
                            .html(d => countType === 'record' || countType === 'measurement' ? formatThousands(d.record_counts) : formatThousands(d.person_counts))
                        update.select('.map-counts-RC-label')
                            .style('color', d => inclusions.includes(d.name) ? '#36126d' : '#9597a6')
                            .style('font-weight', d => inclusions.includes(d.name) ? 500 : 400)
                            .html(() => countType === 'record' || countType === 'measurement' ? 'RC' : 'PC')
                        update.select('.map-counts-RC-bar')
                            .transition()
                            .style('width', d => countType === 'record' || countType === 'measurement' ? scaleWidth(d.record_counts) + 'px' : scaleWidth(d.person_counts) + 'px')
                            .style('background-color', d => inclusions.includes(d.name) ? d.source.leaf && (relationship === 'mappings' && countType === 'record') ? d.source.color : d.color : '#e8e8e8')
                        update.select('.map-counts-DRC-p')
                            .html(d => countType === 'record' || countType === 'measurement' ? formatThousands(d.descendant_record_counts) : formatThousands(d.descendant_person_counts))
                        update.select('.map-counts-DRC-label')
                            .html(() => countType === 'record' || countType === 'measurement' ? 'DRC' : 'DPC')
                        update.select('.map-counts-DRC-bar')
                            .transition()
                            .style('width', d => countType === 'record' || countType === 'measurement' ? scaleWidth(d.descendant_record_counts) + 'px' : scaleWidth(d.descendant_person_counts) + 'px')
                    })
                },update => {
                    update.select('.list-item')
                        .style('background-color', d => d.levels === '-1' ? '#f7f7f7' : 'white')
                        .transition()
                        .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                    update.select('.list-card')
                        .style('box-shadow', d => inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? '0 0 0 1px rgba(0, 0, 0, 0.02),0 2px 10px rgba(0, 0, 0, 0.15)' : 'none')
                        .style('background-color', d => d.levels === '-1' ? 'none' : inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? 'white' : '#f2f2f4')
                    update.select('.list-title-circle')
                        .classed('list-circle-dash', d => ((countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0)) && (!d.leaf || (d.leaf && countType === 'person' && relationship === 'mappings')) ? true : false)
                        .classed('list-circle', d => ((countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0)) && (!d.leaf || (d.leaf && countType === 'person' && relationship === 'mappings')) ? false : true)
                        .classed('btn', d => inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? true : false)
                        .style("pointer-events", d => inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? 'all' : 'none')
                        .style('background', d => {
                            if (((countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0)) || (d.leaf && (countType === 'record' || (countType === 'person' && relationship === 'descendants')))) return "none"
                            else if (inclusions.includes(d.name)) {
                                if (!d.data.concept.standard_concept) {return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, "+ d.color + " 0.5px," + d.color + " 2px)"} 
                                else {return "none"}
                            }
                            else {
                                if (!d.data.concept.standard_concept) return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, #d2d2d9 0.5px, #d2d2d9 2px)"  
                                else {return "none"}

                            }      
                        })
                        .style("background-color", d => {
                            if (((countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0)) || (d.leaf && (countType === 'record' || (countType === 'person' && relationship === 'descendants')))) return "transparent"
                            else if (inclusions.includes(d.name)) {
                                if (d.data.concept.standard_concept) {return d.color} 
                                else {return "transparent"}
                            }
                            else return '#d2d2d9'
                        }) 
                        .style('border', d => d.leaf ? countType === 'record' || (countType === 'person' && relationship === 'descendants') ? `1.5px solid ${d.color}` : '1px solid #d2d2d9' : inclusions.includes(d.name) ? `1px solid ${d.color}` : '1px solid #d2d2d9')
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
                        .style('display', d => !inclusions.includes(d.name) && (d.record_counts !== 0 || isLeaf(d)) && !d.leaf && d.levels !== '-1' ? 'inline-block' : 'none')
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
                            updateConcepts(getNewInclusions(d,'show'))
                        })
                    update.select('.list-eye')
                        .style('display', d => (((countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0)) && !d.leaf) || d.levels === '-1' ? 'none' : !inclusions.includes(d.name) && !d.leaf ? 'none' : 'inline-block')
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
                            updateConcepts(getNewInclusions(d,'hide'))
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
                            if (!rootConcepts.includes(d.name)) {
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
                            if (!rootConcepts.includes(d.name)) showConfirmationPopup(d, 'enter', e)
                        })
                        .transition()
                        .style('opacity', d => inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? 1 : 0.6)
                    update.select('.info-icon')
                        .style('display', d => d.levels === '-1' || !d.levels ? 'none' : 'block')
                        .on('mouseover',(e,d) => d3.select('#info-icon-'+d.name).transition().style('color','#9597a6'))
                        .on('mouseout', (e,d) => {if(d3.select('#info-container-'+d.name).style('height') !== '45px') d3.select('#info-icon-'+d.name).transition().style('color','#c9c9d5')})
                        .on('click', (e,d) => {
                            if (d3.select('#info-container-'+d.name).style('height') === '45px') {
                                d3.select('#info-icon-'+d.name).transition().style('color','#c9c9d5')
                                d3.select('#info-container-'+d.name).transition().style('opacity',0).style('height','0px').style('padding-top','0px').style('margin','0px 0px 0px 22px')
                                d3.select('#list-card-'+d.name).transition().style('border-radius','20px')
                            } else {
                                d3.select('#info-icon-'+d.name).transition().style('color','#9597a6')
                                d3.select('#info-container-'+d.name).transition().style('opacity',1).style('height','45px').style('padding-top','4px').style('margin','4px 4px 4px 22px')
                                d3.select('#list-card-'+d.name).transition().style('border-radius','12px')
                            }
                        })
                    update.select('.info-container')
                        .style('border-top', d => inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? '1px solid #e7e7eb' : '1px solid color-mix(in srgb, #36126d, white 85%)')
                    update.select('.counts-RC-p')
                        .style('color', d => inclusions.includes(d.name) && !d.leaf ? '#36126d' : '#9597a6')
                        .style('font-weight', d => inclusions.includes(d.name) && !d.leaf ? 500 : 400)
                        .html(d => countType === 'record' || countType === 'measurement' ? formatThousands(d.record_counts) : formatThousands(d.person_counts))
                    update.select('.counts-RC-label')
                        .style('color', d => inclusions.includes(d.name) && !d.leaf ? '#36126d' : '#9597a6')
                        .style('font-weight', d => inclusions.includes(d.name) && !d.leaf ? 500 : 400)
                        .html(() => countType === 'record' || countType === 'measurement' ? 'RC' : 'PC')
                    update.select('.counts-RC-bar')
                        .transition()
                        .style('width', d => countType === 'record' || countType === 'measurement' ? scaleWidth(d.record_counts) + 'px' : scaleWidth(d.person_counts) + 'px' )
                        .style('background-color', d => inclusions.includes(d.name) && !d.leaf ? d.color : '#e8e8e8')
                    update.select('.counts-DRC-p')
                        .style('color', d => inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? '#36126d' : '#9597a6')
                        .style('font-weight', d => inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? 500 : 400)
                        .html(d => countType === 'record' || countType === 'measurement' ? formatThousands(d.descendant_record_counts) : formatThousands(d.descendant_person_counts))
                    update.select('.counts-DRC-label')
                        .style('color', d => inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? '#36126d' : '#9597a6')
                        .style('font-weight', d => inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? 500 : 400)
                        .html(() => countType === 'record' || countType === 'measurement' ? 'DRC' : 'DPC')
                    update.select('.counts-DRC-bar')
                        .transition()
                        .style('width', d => countType === 'record' || countType === 'measurement' ? scaleWidth(d.descendant_record_counts) + 'px' : scaleWidth(d.descendant_person_counts) + 'px' )
                        .style('background-color', d => inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? d.color : '#e8e8e8')
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
                        .style('border-left', () => hovered.length > 0 ? '1px dashed #36126d20' : '1px dashed #36126d')
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
                            .style('box-shadow', d => inclusions.includes(d.name) ? '0 0 0 1px rgba(0, 0, 0, 0.02),0 2px 10px rgba(0, 0, 0, 0.15)' : 'none')
                            .style('background-color', d => inclusions.includes(d.name) ? 'white' : '#f2f2f4')
                        const mapTitle = mapConceptCard.append('div')
                            .classed('list-item-title',true)
                        const mapTitle1 = mapTitle.append('div')
                            .style('display','flex')
                            .style('align-items','center')
                        mapTitle1.append('div')
                            .classed('map-list-title-circle',true)
                            .classed('list-circle-dash', d => (countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0) ? true : false)
                            .classed('list-circle', d => (countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0) ? false : true)
                            .classed('btn', d => inclusions.includes(d.name) ? true : false)
                            .style('pointer-events', d => inclusions.includes(d.name) ? 'all' : 'none')
                            .style('background', d => {
                                if ((countType === 'record' && (d.record_counts === 0 || (d.source.leaf && relationship === 'mappings' && countType !== 'person'))) || (countType === 'person' && (d.person_counts === 0 && relationship === 'mappings' && countType !== 'person'))) return 'none'
                                else if (inclusions.includes(d.name)) {
                                    if (!d.data.concept.standard_concept) {return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, "+ d.color + " 0.5px," + d.color + " 2px)"} 
                                    else {return "none"}
                                }
                                else {
                                    if (!d.data.concept.standard_concept) return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, #d2d2d9 0.5px, #d2d2d9 2px)"    
                                    else {return "none"}

                                }  
                            })
                            .style("background-color", d => {
                                if ((countType === 'record' && (d.record_counts === 0 || (d.source.leaf && relationship === 'mappings' && countType !== 'person'))) || (countType === 'person' && (d.person_counts === 0 && relationship === 'mappings' && countType !== 'person'))) return 'transparent'
                                else if (inclusions.includes(d.name)) {
                                    if (d.data.concept.standard_concept) {return d.color} 
                                    else {return "transparent"}
                                }
                                else return '#d2d2d9'
                            }) 
                            .style('border', d => inclusions.includes(d.name) ? d.source.leaf ? `1px solid ${d.source.color}` : `1px solid ${d.color}` : (countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0) ? '1px solid #d2d2d9' : d.source.leaf && relationship === 'mappings' && countType !== 'person' ? `1px solid ${d.source.color}` : '1px solid #d2d2d9')
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
                                .style('display', d => !inclusions.includes(d.name) && d.record_counts > 0 ? 'inline-block' : 'none')
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
                                   updateConcepts(newInclusions)
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
                            .style('display', d => (countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0) || !inclusions.includes(d.name) ? 'none' : 'inline-block')
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
                               updateConcepts(newInclusions)
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
                            .style('opacity', d => inclusions.includes(d.name) ? 1 : 0.6)
                            .on('mouseover', (e, d) => {
                                if (!rootConcepts.includes(d.name)) {
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
                                if (!rootConcepts.includes(d.name)) showConfirmationPopup(d, 'enter', e)
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
                            .on('mouseover',(e,d) => d3.select('#info-icon-'+d.name+d.source.name).transition().style('color','#9597a6'))
                            .on('mouseout', (e,d) => {if(d3.select('#info-container-'+d.name+d.source.name).style('height') !== '45px') d3.select('#info-icon-'+d.name+d.source.name).transition().style('color','#c9c9d5')})
                            .on('click', (e,d) => {
                                if (d3.select('#info-container-'+d.name+d.source.name).style('height') === '45px') {
                                    d3.select('#info-icon-'+d.name+d.source.name).transition().style('color','#c9c9d5')
                                    d3.select('#info-container-'+d.name+d.source.name).transition().style('opacity',0).style('height','0px').style('padding-top','0px').style('margin','0px 0px 0px 22px')
                                    d3.select('#list-card-'+d.name+d.source.name).transition().style('border-radius','20px')
                                } else {
                                    d3.select('#info-icon-'+d.name+d.source.name).transition().style('color','#9597a6')
                                    d3.select('#info-container-'+d.name+d.source.name).transition().style('opacity',1).style('height','45px').style('padding-top','4px').style('margin','4px 4px 4px 22px')
                                    d3.select('#list-card-'+d.name+d.source.name).transition().style('border-radius','12px')
                                }
                            })
                        const mapInfoContainer = mapConceptCard.append('div')
                            .classed('map-info-container',true)
                            .attr('id', d => 'info-container-'+d.name+d.source.name)
                            .style('border-top', d => inclusions.includes(d.name) ? '1px solid #e7e7eb' : '1px solid color-mix(in srgb, #36126d, white 85%)')
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
                            .style('color', d => inclusions.includes(d.name) ? '#36126d' : '#9597a6')
                            .style('font-weight', d => inclusions.includes(d.name) ? 500 : 400)
                            .html(d => countType === 'record' || countType === 'measurement' ? formatThousands(d.record_counts) : formatThousands(d.person_counts))
                        mapCountsRC.append('p')
                            .classed('map-counts-RC-label list-counts-label',true)
                            .style('color', d => inclusions.includes(d.name) ? '#36126d' : '#9597a6')
                            .style('font-weight', d => inclusions.includes(d.name) ? 500 : 400)
                            .html(() => countType === 'record' || countType === 'measurement' ? 'RC' : 'PC')
                        const mapCountsBarRC = mapCountsRC.append('div')
                            .classed('list-counts-bar-container',true)
                        mapCountsBarRC.append('div')
                            .classed('map-counts-RC-bar list-counts-bar',true)
                            .style('width', d => countType === 'record' || countType === 'measurement' ? scaleWidth(d.record_counts) + 'px' : scaleWidth(d.person_counts) + 'px' )
                            .style('background-color', d => inclusions.includes(d.name) ? d.source.leaf && (relationship === 'mappings' && countType === 'record') ? d.source.color : d.color : '#e8e8e8')
                        
                        const mapCountsDRC = mapCountsSection.append('div')
                            .classed('list-counts',true)
                        mapCountsDRC.append('p')
                            .classed('map-counts-DRC-p list-counts-p num',true)
                            .style('text-align','left')
                            .style('color', '#9597a6')
                            .style('font-weight', 400)
                            .html(d => countType === 'record' || countType === 'measurement' ? formatThousands(d.descendant_record_counts) : formatThousands(d.descendant_person_counts))
                        mapCountsDRC.append('p')
                            .classed('map-counts-DRC-label list-counts-label',true)
                            .style('color', '#9597a6')
                            .style('font-weight', 400)
                            .html(() => countType === 'record' || countType === 'measurement' ? 'DRC' : 'DPC')
                        const mapCountsBarDRC = mapCountsDRC.append('div')
                            .classed('list-counts-bar-container',true)
                        mapCountsBarDRC.append('div')
                            .classed('map-counts-DRC-bar list-counts-bar',true)
                            .style('width', d => countType === 'record' || countType === 'measurement' ? scaleWidth(d.descendant_record_counts) + 'px' : scaleWidth(d.descendant_person_counts) + 'px')
                            .style('background-color', '#e8e8e8')   
                        
                        mapDataSection.append('div')
                            .classed('list-open-mappings',true)
                    
                    },update => {
                        update
                            .transition()
                            .style('max-height', d => mapRoot.includes(d.source.name) || (nodes.find(n => n.name === d.source.name).mappings.map(m => m.name).some(map => inclusions.includes(map))) ? '100px' : '0px')
                            .style('visibility', d => mapRoot.includes(d.source.name) || (nodes.find(n => n.name === d.source.name).mappings.map(m => m.name).some(map => inclusions.includes(map))) ? 'visible' : 'hidden')
                        update.select('.map-list-item')
                            .transition()
                            .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                        update.select('.map-list-card')
                            .style('box-shadow', d => inclusions.includes(d.name) ? '0 0 0 1px rgba(0, 0, 0, 0.02),0 2px 10px rgba(0, 0, 0, 0.15)' : 'none')
                            .style('background-color', d => d.levels === '-1' ? 'none' : inclusions.includes(d.name) ? 'white' : '#f2f2f4')
                        update.select('.map-list-title-circle')
                            .classed('list-circle-dash', d => (countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0) ? true : false)
                            .classed('list-circle', d => (countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0) ? false : true)
                            .classed('btn', d => inclusions.includes(d.name) ? true : false)
                            .style('pointer-events', d => inclusions.includes(d.name) ? 'all' : 'none')
                            .style('background', d => {
                                if ((countType === 'record' && (d.record_counts === 0 || (d.source.leaf && relationship === 'mappings' && countType !== 'person'))) || (countType === 'person' && (d.person_counts === 0 && relationship === 'mappings' && countType !== 'person'))) return 'none'
                                else if (inclusions.includes(d.name)) {
                                    if (!d.data.concept.standard_concept) {return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, "+ d.color + " 0.5px," + d.color + " 2px)"} 
                                    else {return "none"}
                                }
                                else {
                                    if (!d.data.concept.standard_concept) return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, #d2d2d9 0.5px, #d2d2d9 2px)"    
                                    else {return "none"}

                                }  
                            })
                            .style("background-color", d => {
                                if ((countType === 'record' && (d.record_counts === 0 || (d.source.leaf && relationship === 'mappings' && countType !== 'person'))) || (countType === 'person' && (d.person_counts === 0 && relationship === 'mappings' && countType !== 'person'))) return 'transparent'
                                else if (inclusions.includes(d.name)) {
                                    if (d.data.concept.standard_concept) {return d.color} 
                                    else {return "transparent"}
                                }
                                else return '#d2d2d9'
                            }) 
                            .style('border', d => inclusions.includes(d.name) ? d.source.leaf ? `1px solid ${d.source.color}` : `1px solid ${d.color}` : (countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0) ? '1px solid #d2d2d9' : d.source.leaf && relationship === 'mappings' && countType !== 'person' ? `1px solid ${d.source.color}` : '1px solid #d2d2d9')
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
                            .style('display', d => !inclusions.includes(d.name) && d.record_counts > 0 ? 'inline-block' : 'none')
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
                               updateConcepts(newInclusions)
                            })
                        update.select('.map-list-eye')
                            .style('display', d => (countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0) || !inclusions.includes(d.name) ? 'none' : 'inline-block')
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
                                updateConcepts(newInclusions)
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
                                if (!rootConcepts.includes(d.name)) {
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
                                if (!rootConcepts.includes(d.name)) showConfirmationPopup(d, 'enter', e)
                            })
                            .transition()
                            .style('opacity', d => inclusions.includes(d.name) ? 1 : 0.6)
                        update.select('.map-info-icon')
                            .on('mouseover',(e,d) => d3.select('#info-icon-'+d.name+d.source.name).transition().style('color','#9597a6'))
                            .on('mouseout', (e,d) => {if(d3.select('#info-container-'+d.name+d.source.name).style('height') !== '45px') d3.select('#info-icon-'+d.name+d.source.name).transition().style('color','#c9c9d5')})
                            .on('click', (e,d) => {
                                if (d3.select('#info-container-'+d.name+d.source.name).style('height') === '45px') {
                                    d3.select('#info-icon-'+d.name+d.source.name).transition().style('color','#c9c9d5')
                                    d3.select('#info-container-'+d.name+d.source.name).transition().style('opacity',0).style('height','0px').style('padding-top','0px').style('margin','0px 0px 0px 22px')
                                    d3.select('#list-card-'+d.name+d.source.name).transition().style('border-radius','20px')
                                } else {
                                    d3.select('#info-icon-'+d.name+d.source.name).transition().style('color','#9597a6')
                                    d3.select('#info-container-'+d.name+d.source.name).transition().style('opacity',1).style('height','45px').style('padding-top','4px').style('margin','4px 4px 4px 22px')
                                    d3.select('#list-card-'+d.name+d.source.name).transition().style('border-radius','12px')
                                }
                            })
                        update.select('.map-info-container')
                            .style('border-top', d => inclusions.includes(d.name) ? '1px solid #e7e7eb' : '1px solid color-mix(in srgb, #36126d, white 85%)')
                        update.select('.map-counts-RC-p')
                            .style('color', d => inclusions.includes(d.name) ? '#36126d' : '#9597a6')
                            .style('font-weight', d => inclusions.includes(d.name) ? 500 : 400)
                            .html(d => countType === 'record' || countType === 'measurement' ? formatThousands(d.record_counts) : formatThousands(d.person_counts))
                        update.select('.map-counts-RC-label')
                            .style('color', d => inclusions.includes(d.name) ? '#36126d' : '#9597a6')
                            .style('font-weight', d => inclusions.includes(d.name) ? 500 : 400)
                            .html(() => countType === 'record' || countType === 'measurement' ? 'RC' : 'PC')
                        update.select('.map-counts-RC-bar')
                            .transition()
                            .style('width', d => countType === 'record' || countType === 'measurement' ? scaleWidth(d.record_counts) + 'px' : scaleWidth(d.person_counts) + 'px')
                            .style('background-color', d => inclusions.includes(d.name) ? d.source.leaf && (relationship === 'mappings' && countType === 'record') ? d.source.color : d.color : '#e8e8e8')
                        update.select('.map-counts-DRC-p')
                            .html(d => countType === 'record' || countType === 'measurement' ? formatThousands(d.descendant_record_counts) : formatThousands(d.descendant_person_counts))
                        update.select('.map-counts-DRC-label')
                            .html(() => countType === 'record' || countType === 'measurement' ? 'DRC' : 'DPC')
                        update.select('.map-counts-DRC-bar')
                            .transition()
                            .style('width', d => countType === 'record' || countType === 'measurement' ? scaleWidth(d.descendant_record_counts) + 'px' : scaleWidth(d.descendant_person_counts) + 'px')
                    })
                })
            },update => {
                // CONCEPT LIST
                update.selectAll(".list-item-container").data(d => d.nodes, d => d.name)
                .join(enter => {
                    const itemContainer = enter.append('div')
                        .classed('list-item-container',true)
                        .each(function(d) {this.classList.add(`list-item-container${d.levels}`)})
                        .style('border-bottom', d => d.levels === '-1' ? '0.5px solid #d3d3d3' : '0.5px solid #e8e8e8')
                        .style('display', d => d.levels === '-1' && d.collapsed ? 'none' : 'block')
                        .style('height', d => d.levels === '-1' && d.collapsed ? '0px' : 'auto')
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
                        .style('box-shadow', d => inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? '0 0 0 1px rgba(0, 0, 0, 0.02),0 2px 10px rgba(0, 0, 0, 0.15)' : 'none')
                        .style('background-color', d => d.levels === '-1' ? 'none' : inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? 'white' : '#f2f2f4')
                        .style('border', d => rootConcepts.includes(d.name) ? '1px solid #7728ED' : 'none')
                    const title = conceptCard.append('div')
                        .classed('list-item-title',true)
                    const title1 = title.append('div')
                        .style('display','flex')
                        .style('align-items','center')
                    title1.append('div')
                        .classed('list-title-circle',true)
                        .classed('list-circle-dash', d => ((countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0)) && (!d.leaf || (d.leaf && countType === 'person' && relationship === 'mappings')) ? true : false)
                        .classed('list-circle', d => ((countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0)) && (!d.leaf || (d.leaf && countType === 'person' && relationship === 'mappings')) ? false : true)
                        .classed('btn', d => inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? true : false)
                        .style("pointer-events", d => inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? 'all' : 'none')
                        .style('background', d => {
                            if (((countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0)) || (d.leaf && (countType === 'record' || (countType === 'person' && relationship === 'descendants')))) return "none"
                            else if (inclusions.includes(d.name)) {
                                if (!d.data.concept.standard_concept) {return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, "+ d.color + " 0.5px," + d.color + " 2px)"} 
                                else {return "none"}
                            }
                            else {
                                if (!d.data.concept.standard_concept) return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, #d2d2d9 0.5px, #d2d2d9 2px)"  
                                else {return "none"}

                            }      
                        })
                        .style("background-color", d => {
                            if (((countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0)) || (d.leaf && (countType === 'record' || (countType === 'person' && relationship === 'descendants')))) return "transparent"
                            else if (inclusions.includes(d.name)) {
                                if (d.data.concept.standard_concept) {return d.color} 
                                else {return "transparent"}
                            }
                            else return '#d2d2d9'
                        }) 
                        .style('border', d => d.leaf ? countType === 'record' || (countType === 'person' && relationship === 'descendants') ? `1.5px solid ${d.color}` : '1px solid #d2d2d9' : inclusions.includes(d.name) ? `1px solid ${d.color}` : '1px solid #d2d2d9')
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
                        .style('display', d => !inclusions.includes(d.name) && (d.record_counts !== 0 || isLeaf(d)) && !d.leaf && d.levels !== '-1' ? 'inline-block' : 'none')
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
                            updateConcepts(getNewInclusions(d,'show'))
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
                        .style('display', d => (((countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0)) && !d.leaf) || d.levels === '-1' ? 'none' : !inclusions.includes(d.name) && !d.leaf ? 'none' : 'inline-block')
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
                            updateConcepts(getNewInclusions(d,'hide'))
                        })
                    icons.append('i')
                        .classed('list-search fa fa-search iconLg marginRight',true)
                        .attr('id', d => 'list-search-'+d.name)
                        .style('transform','scaleX(-1)')
                        .style('display', d => rootConcepts.includes(d.name) ? 'none' : 'inline-block')
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
                        .style('opacity', d => inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? 1 : 0.6)
                        .on('mouseover', (e, d) => {
                            if (!rootConcepts.includes(d.name)) {
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
                            if (!rootConcepts.includes(d.name)) showConfirmationPopup(d, 'enter', e)
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
                        .style('color', '#c9c9d5')
                        .style('display', d => d.levels === '-1' || !d.levels ? 'none' : 'block')
                        .on('mouseover',(e,d) => d3.select('#info-icon-'+d.name).transition().style('color','#9597a6'))
                        .on('mouseout', (e,d) => {if(d3.select('#info-container-'+d.name).style('height') !== '45px') d3.select('#info-icon-'+d.name).transition().style('color','#c9c9d5')})
                        .on('click', (e,d) => {
                            if (d3.select('#info-container'+d.name).style('height') === '45px') {
                                d3.select('#info-icon-'+d.name).transition().style('color','#c9c9d5')
                                d3.select('#info-container-'+d.name).transition().style('opacity',0).style('height','0px').style('padding-top','0px').style('margin','0px 0px 0px 22px')
                                d3.select('#list-card-'+d.name).transition().style('border-radius','20px')
                            } else {
                                d3.select('#info-icon-'+d.name).transition().style('color','#9597a6')
                                d3.select('#info-container-'+d.name).transition().style('opacity',1).style('height','45px').style('padding-top','4px').style('margin','4px 4px 4px 22px')
                                d3.select('#list-card-'+d.name).transition().style('border-radius','12px')
                            }
                        })
                    const infoContainer = conceptCard.append('div')
                        .classed('info-container',true)
                        .attr('id', d => 'info-container-'+d.name)
                        .style('display', d => d.levels === '-1' || !d.levels ? 'none' : 'flex')
                        .style('border-top', d => inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? '1px solid #e7e7eb' : '1px solid color-mix(in srgb, #36126d, white 85%)')
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
                        .style('color', d => inclusions.includes(d.name) && !d.leaf ? '#36126d' : '#9597a6')
                        .style('font-weight', d => inclusions.includes(d.name) && !d.leaf ? 500 : 400)
                        .html(d => countType === 'record' || countType === 'measurement' ? formatThousands(d.record_counts) : formatThousands(d.person_counts))
                    countsRC.append('p')
                        .classed('counts-RC-label list-counts-label',true)
                        .style('color', d => inclusions.includes(d.name) && !d.leaf ? '#36126d' : '#9597a6')
                        .style('font-weight', d => inclusions.includes(d.name) && !d.leaf ? 500 : 400)
                        .html(() => countType === 'record' || countType === 'measurement' ? 'RC' : 'PC')
                    const countsBarRC = countsRC.append('div')
                        .classed('list-counts-bar-container',true)
                    countsBarRC.append('div')
                        .classed('counts-RC-bar list-counts-bar',true)
                        .style('width', d => countType === 'record' || countType === 'measurement' ? scaleWidth(d.record_counts) + 'px' : scaleWidth(d.person_counts) + 'px')
                        .style('background-color', d => inclusions.includes(d.name) && !d.leaf ? d.color : '#e8e8e8')
                    
                    const countsDRC = countsSection.append('div')
                        .classed('list-counts',true)
                    countsDRC.append('p')
                        .classed('counts-DRC-p list-counts-p num',true)
                        .style('text-align','left')
                        .style('color', d => inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? '#36126d' : '#9597a6')
                        .style('font-weight', d => inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? 500 : 400)
                        .html(d => countType === 'record' || countType === 'measurement' ? formatThousands(d.descendant_record_counts) : formatThousands(d.descendant_person_counts))
                    countsDRC.append('p')
                        .classed('counts-DRC-label list-counts-label',true)
                        .style('color', d => inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? '#36126d' : '#9597a6')
                        .style('font-weight', d => inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? 500 : 400)
                        .html(() => countType === 'record' || countType === 'measurement' ? 'DRC' : 'DPC')
                    const countsBarDRC = countsDRC.append('div')
                        .classed('list-counts-bar-container',true)
                    countsBarDRC.append('div')
                        .classed('counts-DRC-bar list-counts-bar',true)
                        .style('width', d => countType === 'record' || countType === 'measurement' ? scaleWidth(d.descendant_record_counts) + 'px' : scaleWidth(d.descendant_person_counts) + 'px')
                        .style('background-color', d => inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? d.color : '#e8e8e8')

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
                        .style('border-left', () => hovered.length > 0 ? '1px dashed #36126d20' : '1px dashed #36126d')
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
                            .style('box-shadow', d => inclusions.includes(d.name) ? '0 0 0 1px rgba(0, 0, 0, 0.02),0 2px 10px rgba(0, 0, 0, 0.15)' : 'none')
                            .style('background-color', d => inclusions.includes(d.name) ? 'white' : '#f2f2f4')
                        const mapTitle = mapConceptCard.append('div')
                            .classed('list-item-title',true)
                        const mapTitle1 = mapTitle.append('div')
                            .style('display','flex')
                            .style('align-items','center')
                        mapTitle1.append('div')
                            .classed('map-list-title-circle',true)
                            .classed('list-circle-dash', d => (countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0) ? true : false)
                            .classed('list-circle', d => (countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0) ? false : true)
                            .classed('btn', d => inclusions.includes(d.name) ? true : false)
                            .style('pointer-events', d => inclusions.includes(d.name) ? 'all' : 'none')
                            .style('background', d => {
                                if ((countType === 'record' && (d.record_counts === 0 || (d.source.leaf && relationship === 'mappings' && countType !== 'person'))) || (countType === 'person' && (d.person_counts === 0 && relationship === 'mappings' && countType !== 'person'))) return 'none'
                                else if (inclusions.includes(d.name)) {
                                    if (!d.data.concept.standard_concept) {return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, "+ d.color + " 0.5px," + d.color + " 2px)"} 
                                    else {return "none"}
                                }
                                else {
                                    if (!d.data.concept.standard_concept) return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, #d2d2d9 0.5px, #d2d2d9 2px)"    
                                    else {return "none"}

                                }  
                            })
                            .style("background-color", d => {
                                if ((countType === 'record' && (d.record_counts === 0 || (d.source.leaf && relationship === 'mappings' && countType !== 'person'))) || (countType === 'person' && (d.person_counts === 0 && relationship === 'mappings' && countType !== 'person'))) return 'transparent'
                                else if (inclusions.includes(d.name)) {
                                    if (d.data.concept.standard_concept) {return d.color} 
                                    else {return "transparent"}
                                }
                                else return '#d2d2d9'
                            }) 
                            .style('border', d => inclusions.includes(d.name) ? d.source.leaf ? `1px solid ${d.source.color}` : `1px solid ${d.color}` : (countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0) ? '1px solid #d2d2d9' : d.source.leaf && relationship === 'mappings' && countType !== 'person' ? `1px solid ${d.source.color}` : '1px solid #d2d2d9')
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
                                .style('display', d => !inclusions.includes(d.name) && d.record_counts > 0 ? 'inline-block' : 'none')
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
                                   updateConcepts(newInclusions)
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
                            .style('display', d => (countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0) || !inclusions.includes(d.name) ? 'none' : 'inline-block')
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
                               updateConcepts(newInclusions)
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
                            .style('opacity', d => inclusions.includes(d.name) ? 1 : 0.6)
                            .on('mouseover', (e, d) => {
                                if (!rootConcepts.includes(d.name)) {
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
                                if (!rootConcepts.includes(d.name)) showConfirmationPopup(d, 'enter', e)
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
                            // .style('opacity', 0.2)
                            .on('mouseover',(e,d) => d3.select('#info-icon-'+d.name+d.source.name).transition().style('color','#9597a6'))
                            .on('mouseout', (e,d) => {if(d3.select('#info-container-'+d.name+d.source.name).style('height') !== '45px') d3.select('#info-icon-'+d.name+d.source.name).transition().style('color','#c9c9d5')})
                            .on('click', (e,d) => {
                                if (d3.select('#info-container-'+d.name+d.source.name).style('height') === '45px') {
                                    d3.select('#info-icon-'+d.name+d.source.name).transition().style('color','#c9c9d5')
                                    d3.select('#info-container-'+d.name+d.source.name).transition().style('opacity',0).style('height','0px').style('padding-top','0px').style('margin','0px 0px 0px 22px')
                                    d3.select('#list-card-'+d.name+d.source.name).transition().style('border-radius','20px')
                                } else {
                                    d3.select('#info-icon-'+d.name+d.source.name).transition().style('color','#9597a6')
                                    d3.select('#info-container-'+d.name+d.source.name).transition().style('opacity',1).style('height','45px').style('padding-top','4px').style('margin','4px 4px 4px 22px')
                                    d3.select('#list-card-'+d.name+d.source.name).transition().style('border-radius','12px')
                                }
                            })
                        const mapInfoContainer = mapConceptCard.append('div')
                            .classed('map-info-container',true)
                            .attr('id', d => 'info-container-'+d.name+d.source.name)
                            .style('border-top', d => inclusions.includes(d.name) ? '1px solid #e7e7eb' : '1px solid color-mix(in srgb, #36126d, white 85%)')
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
                            .style('color', d => inclusions.includes(d.name) ? '#36126d' : '#9597a6')
                            .style('font-weight', d => inclusions.includes(d.name) ? 500 : 400)
                            .html(d => countType === 'record' || countType === 'measurement' ? formatThousands(d.record_counts) : formatThousands(d.person_counts))
                        mapCountsRC.append('p')
                            .classed('map-counts-RC-label list-counts-label',true)
                            .style('color', d => inclusions.includes(d.name) ? '#36126d' : '#9597a6')
                            .style('font-weight', d => inclusions.includes(d.name) ? 500 : 400)
                            .html(() => countType === 'record' || countType === 'measurement' ? 'RC' : 'PC')
                        const mapCountsBarRC = mapCountsRC.append('div')
                            .classed('list-counts-bar-container',true)
                        mapCountsBarRC.append('div')
                            .classed('map-counts-RC-bar list-counts-bar',true)
                            .style('width', d => countType === 'record' || countType === 'measurement' ? scaleWidth(d.record_counts) + 'px' : scaleWidth(d.person_counts) + 'px' )
                            .style('background-color', d => inclusions.includes(d.name) ? d.source.leaf && (relationship === 'mappings' && countType === 'record') ? d.source.color : d.color : '#e8e8e8')
                        
                        const mapCountsDRC = mapCountsSection.append('div')
                            .classed('list-counts',true)
                        mapCountsDRC.append('p')
                            .classed('map-counts-DRC-p list-counts-p num',true)
                            .style('text-align','left')
                            .style('color', '#9597a6')
                            .style('font-weight', 400)
                            .html(d => countType === 'record' || countType === 'measurement' ? formatThousands(d.descendant_record_counts) : formatThousands(d.descendant_person_counts))
                        mapCountsDRC.append('p')
                            .classed('map-counts-DRC-label list-counts-label',true)
                            .style('color', '#9597a6')
                            .style('font-weight', 400)
                            .html(() => countType === 'record' || countType === 'measurement' ? 'DRC' : 'DPC')
                        const mapCountsBarDRC = mapCountsDRC.append('div')
                            .classed('list-counts-bar-container',true)
                        mapCountsBarDRC.append('div')
                            .classed('map-counts-DRC-bar list-counts-bar',true)
                            .style('width', d => countType === 'record' || countType === 'measurement' ? scaleWidth(d.descendant_record_counts) + 'px' : scaleWidth(d.descendant_person_counts) + 'px')
                            .style('background-color', '#e8e8e8')   
                        
                        mapDataSection.append('div')
                            .classed('list-open-mappings',true)
                    
                    },update => {
                        update
                            .transition()
                            .style('max-height', d => mapRoot.includes(d.source.name) || (nodes.find(n => n.name === d.source.name).mappings.map(m => m.name).some(map => inclusions.includes(map))) ? '100px' : '0px')
                            .style('visibility', d => mapRoot.includes(d.source.name) || (nodes.find(n => n.name === d.source.name).mappings.map(m => m.name).some(map => inclusions.includes(map))) ? 'visible' : 'hidden')
                        update.select('.map-list-item')
                            .transition()
                            .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                        update.select('.map-list-card')
                            .style('box-shadow', d => inclusions.includes(d.name) ? '0 0 0 1px rgba(0, 0, 0, 0.02),0 2px 10px rgba(0, 0, 0, 0.15)' : 'none')
                            .style('background-color', d => d.levels === '-1' ? 'none' : inclusions.includes(d.name) ? 'white' : '#f2f2f4')
                        update.select('.map-list-title-circle')
                            .classed('list-circle-dash', d => (countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0) ? true : false)
                            .classed('list-circle', d => (countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0) ? false : true)
                            .classed('btn', d => inclusions.includes(d.name) ? true : false)
                            .style('pointer-events', d => inclusions.includes(d.name) ? 'all' : 'none')
                            .style('background', d => {
                                if ((countType === 'record' && (d.record_counts === 0 || (d.source.leaf && relationship === 'mappings' && countType !== 'person'))) || (countType === 'person' && (d.person_counts === 0 && relationship === 'mappings' && countType !== 'person'))) return 'none'
                                else if (inclusions.includes(d.name)) {
                                    if (!d.data.concept.standard_concept) {return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, "+ d.color + " 0.5px," + d.color + " 2px)"} 
                                    else {return "none"}
                                }
                                else {
                                    if (!d.data.concept.standard_concept) return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, #d2d2d9 0.5px, #d2d2d9 2px)"    
                                    else {return "none"}

                                }  
                            })
                            .style("background-color", d => {
                                if ((countType === 'record' && (d.record_counts === 0 || (d.source.leaf && relationship === 'mappings' && countType !== 'person'))) || (countType === 'person' && (d.person_counts === 0 && relationship === 'mappings' && countType !== 'person'))) return 'transparent'
                                else if (inclusions.includes(d.name)) {
                                    if (d.data.concept.standard_concept) {return d.color} 
                                    else {return "transparent"}
                                }
                                else return '#d2d2d9'
                            }) 
                            .style('border', d => inclusions.includes(d.name) ? d.source.leaf ? `1px solid ${d.source.color}` : `1px solid ${d.color}` : (countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0) ? '1px solid #d2d2d9' : d.source.leaf && relationship === 'mappings' && countType !== 'person' ? `1px solid ${d.source.color}` : '1px solid #d2d2d9')
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
                            .style('display', d => !inclusions.includes(d.name) && d.record_counts > 0 ? 'inline-block' : 'none')
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
                               updateConcepts(newInclusions)
                            })
                        update.select('.map-list-eye')
                            .style('display', d => (countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0) || !inclusions.includes(d.name) ? 'none' : 'inline-block')
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
                                updateConcepts(newInclusions)
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
                                if (!rootConcepts.includes(d.name)) {
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
                                if (!rootConcepts.includes(d.name)) showConfirmationPopup(d, 'enter', e)
                            })
                            .transition()
                            .style('opacity', d => inclusions.includes(d.name) ? 1 : 0.6)
                        update.select('.map-info-icon')
                            .on('mouseover',(e,d) => d3.select('#info-icon-'+d.name+d.source.name).transition().style('color','#9597a6'))
                            .on('mouseout', (e,d) => {if(d3.select('#info-container-'+d.name+d.source.name).style('height') !== '45px') d3.select('#info-icon-'+d.name+d.source.name).transition().style('color','#c9c9d5')})
                            .on('click', (e,d) => {
                                if (d3.select('#info-container-'+d.name+d.source.name).style('height') === '45px') {
                                    d3.select('#info-icon-'+d.name+d.source.name).transition().style('color','#c9c9d5')
                                    d3.select('#info-container-'+d.name+d.source.name).transition().style('opacity',0).style('height','0px').style('padding-top','0px').style('margin','0px 0px 0px 22px')
                                    d3.select('#list-card-'+d.name+d.source.name).transition().style('border-radius','20px')
                                } else {
                                    d3.select('#info-icon-'+d.name+d.source.name).transition().style('color','#9597a6')
                                    d3.select('#info-container-'+d.name+d.source.name).transition().style('opacity',1).style('height','45px').style('padding-top','4px').style('margin','4px 4px 4px 22px')
                                    d3.select('#list-card-'+d.name+d.source.name).transition().style('border-radius','12px')
                                }
                            })
                        update.select('.map-info-container')
                            .style('border-top', d => inclusions.includes(d.name) ? '1px solid #e7e7eb' : '1px solid color-mix(in srgb, #36126d, white 85%)')
                        update.select('.map-counts-RC-p')
                            .style('color', d => inclusions.includes(d.name) ? '#36126d' : '#9597a6')
                            .style('font-weight', d => inclusions.includes(d.name) ? 500 : 400)
                            .html(d => countType === 'record' || countType === 'measurement' ? formatThousands(d.record_counts) : formatThousands(d.person_counts))
                        update.select('.map-counts-RC-label')
                            .style('color', d => inclusions.includes(d.name) ? '#36126d' : '#9597a6')
                            .style('font-weight', d => inclusions.includes(d.name) ? 500 : 400)
                            .html(() => countType === 'record' || countType === 'measurement' ? 'RC' : 'PC')
                        update.select('.map-counts-RC-bar')
                            .transition()
                            .style('width', d => countType === 'record' || countType === 'measurement' ? scaleWidth(d.record_counts) + 'px' : scaleWidth(d.person_counts) + 'px')
                            .style('background-color', d => inclusions.includes(d.name) ? d.source.leaf && (relationship === 'mappings' && countType === 'record') ? d.source.color : d.color : '#e8e8e8')
                        update.select('.map-counts-DRC-p')
                            .html(d => countType === 'record' || countType === 'measurement' ? formatThousands(d.descendant_record_counts) : formatThousands(d.descendant_person_counts))
                        update.select('.map-counts-DRC-label')
                            .html(() => countType === 'record' || countType === 'measurement' ? 'DRC' : 'DPC')
                        update.select('.map-counts-DRC-bar')
                            .transition()
                            .style('width', d => countType === 'record' || countType === 'measurement' ? scaleWidth(d.descendant_record_counts) + 'px' : scaleWidth(d.descendant_person_counts) + 'px')
                    })
                },update => {
                    update.select('.list-item')
                        .style('background-color', d => d.levels === '-1' ? '#f7f7f7' : 'white')
                        .transition()
                        .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                    update.select('.list-card')
                        .style('box-shadow', d => inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? '0 0 0 1px rgba(0, 0, 0, 0.02),0 2px 10px rgba(0, 0, 0, 0.15)' : 'none')
                        .style('background-color', d => d.levels === '-1' ? 'none' : inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? 'white' : '#f2f2f4')
                    update.select('.list-title-circle')
                        .classed('list-circle-dash', d => ((countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0)) && (!d.leaf || (d.leaf && countType === 'person' && relationship === 'mappings')) ? true : false)
                        .classed('list-circle', d => ((countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0)) && (!d.leaf || (d.leaf && countType === 'person' && relationship === 'mappings')) ? false : true)
                        .classed('btn', d => inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? true : false)
                        .style("pointer-events", d => inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? 'all' : 'none')
                        .style('background', d => {
                            if (((countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0)) || (d.leaf && (countType === 'record' || (countType === 'person' && relationship === 'descendants')))) return "none"
                            else if (inclusions.includes(d.name)) {
                                if (!d.data.concept.standard_concept) {return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, "+ d.color + " 0.5px," + d.color + " 2px)"} 
                                else {return "none"}
                            }
                            else {
                                if (!d.data.concept.standard_concept) return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, #d2d2d9 0.5px, #d2d2d9 2px)"  
                                else {return "none"}

                            }      
                        })
                        .style("background-color", d => {
                            if (((countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0)) || (d.leaf && (countType === 'record' || (countType === 'person' && relationship === 'descendants')))) return "transparent"
                            else if (inclusions.includes(d.name)) {
                                if (d.data.concept.standard_concept) {return d.color} 
                                else {return "transparent"}
                            }
                            else return '#d2d2d9'
                        }) 
                        .style('border', d => d.leaf ? countType === 'record' || (countType === 'person' && relationship === 'descendants') ? `1.5px solid ${d.color}` : '1px solid #d2d2d9' : inclusions.includes(d.name) ? `1px solid ${d.color}` : '1px solid #d2d2d9')
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
                        .style('display', d => !inclusions.includes(d.name) && (d.record_counts !== 0 || isLeaf(d)) && !d.leaf && d.levels !== '-1' ? 'inline-block' : 'none')
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
                            updateConcepts(getNewInclusions(d,'show'))
                        })
                    update.select('.list-eye')
                        .style('display', d => (((countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0)) && !d.leaf) || d.levels === '-1' ? 'none' : !inclusions.includes(d.name) && !d.leaf ? 'none' : 'inline-block')
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
                            updateConcepts(getNewInclusions(d,'hide'))
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
                            if (!rootConcepts.includes(d.name)) {
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
                            if (!rootConcepts.includes(d.name)) showConfirmationPopup(d, 'enter', e)
                        })
                        .transition()
                        .style('opacity', d => inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? 1 : 0.6)
                    update.select('.info-icon')
                        .style('display', d => d.levels === '-1' || !d.levels ? 'none' : 'block')
                        .on('mouseover',(e,d) => d3.select('#info-icon-'+d.name).transition().style('color','#9597a6'))
                        .on('mouseout', (e,d) => {if(d3.select('#info-container-'+d.name).style('height') !== '45px') d3.select('#info-icon-'+d.name).transition().style('color','#c9c9d5')})
                        .on('click', (e,d) => {
                            if (d3.select('#info-container-'+d.name).style('height') === '45px') {
                                d3.select('#info-icon-'+d.name).transition().style('color','#c9c9d5')
                                d3.select('#info-container-'+d.name).transition().style('opacity',0).style('height','0px').style('padding-top','0px').style('margin','0px 0px 0px 22px')
                                d3.select('#list-card-'+d.name).transition().style('border-radius','20px')
                            } else {
                                d3.select('#info-icon-'+d.name).transition().style('color','#9597a6')
                                d3.select('#info-container-'+d.name).transition().style('opacity',1).style('height','45px').style('padding-top','4px').style('margin','4px 4px 4px 22px')
                                d3.select('#list-card-'+d.name).transition().style('border-radius','12px')
                            }
                        })
                    update.select('.info-container')
                        .style('border-top', d => inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? '1px solid #e7e7eb' : '1px solid color-mix(in srgb, #36126d, white 85%)')
                    update.select('.counts-RC-p')
                        .style('color', d => inclusions.includes(d.name) && !d.leaf ? '#36126d' : '#9597a6')
                        .style('font-weight', d => inclusions.includes(d.name) && !d.leaf ? 500 : 400)
                        .html(d => countType === 'record' || countType === 'measurement' ? formatThousands(d.record_counts) : formatThousands(d.person_counts))
                    update.select('.counts-RC-label')
                        .style('color', d => inclusions.includes(d.name) && !d.leaf ? '#36126d' : '#9597a6')
                        .style('font-weight', d => inclusions.includes(d.name) && !d.leaf ? 500 : 400)
                        .html(() => countType === 'record' || countType === 'measurement' ? 'RC' : 'PC')
                    update.select('.counts-RC-bar')
                        .transition()
                        .style('width', d => countType === 'record' || countType === 'measurement' ? scaleWidth(d.record_counts) + 'px' : scaleWidth(d.person_counts) + 'px' )
                        .style('background-color', d => inclusions.includes(d.name) && !d.leaf ? d.color : '#e8e8e8')
                    update.select('.counts-DRC-p')
                        .style('color', d => inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? '#36126d' : '#9597a6')
                        .style('font-weight', d => inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? 500 : 400)
                        .html(d => countType === 'record' || countType === 'measurement' ? formatThousands(d.descendant_record_counts) : formatThousands(d.descendant_person_counts))
                    update.select('.counts-DRC-label')
                        .style('color', d => inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? '#36126d' : '#9597a6')
                        .style('font-weight', d => inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? 500 : 400)
                        .html(() => countType === 'record' || countType === 'measurement' ? 'DRC' : 'DPC')
                    update.select('.counts-DRC-bar')
                        .transition()
                        .style('width', d => countType === 'record' || countType === 'measurement' ? scaleWidth(d.descendant_record_counts) + 'px' : scaleWidth(d.descendant_person_counts) + 'px' )
                        .style('background-color', d => inclusions.includes(d.name) || (d.leaf && countType === 'record') || (d.leaf && countType === 'person' && relationship !== 'mappings') ? d.color : '#e8e8e8')
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
                        .style('border-left', () => hovered.length > 0 ? '1px dashed #36126d20' : '1px dashed #36126d')
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
                            .style('box-shadow', d => inclusions.includes(d.name) ? '0 0 0 1px rgba(0, 0, 0, 0.02),0 2px 10px rgba(0, 0, 0, 0.15)' : 'none')
                            .style('background-color', d => inclusions.includes(d.name) ? 'white' : '#f2f2f4')
                        const mapTitle = mapConceptCard.append('div')
                            .classed('list-item-title',true)
                        const mapTitle1 = mapTitle.append('div')
                            .style('display','flex')
                            .style('align-items','center')
                        mapTitle1.append('div')
                            .classed('map-list-title-circle',true)
                            .classed('list-circle-dash', d => (countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0) ? true : false)
                            .classed('list-circle', d => (countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0) ? false : true)
                            .classed('btn', d => inclusions.includes(d.name) ? true : false)
                            .style('pointer-events', d => inclusions.includes(d.name) ? 'all' : 'none')
                            .style('background', d => {
                                if ((countType === 'record' && (d.record_counts === 0 || (d.source.leaf && relationship === 'mappings' && countType !== 'person'))) || (countType === 'person' && (d.person_counts === 0 && relationship === 'mappings' && countType !== 'person'))) return 'none'
                                else if (inclusions.includes(d.name)) {
                                    if (!d.data.concept.standard_concept) {return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, "+ d.color + " 0.5px," + d.color + " 2px)"} 
                                    else {return "none"}
                                }
                                else {
                                    if (!d.data.concept.standard_concept) return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, #d2d2d9 0.5px, #d2d2d9 2px)"    
                                    else {return "none"}

                                }  
                            })
                            .style("background-color", d => {
                                if ((countType === 'record' && (d.record_counts === 0 || (d.source.leaf && relationship === 'mappings' && countType !== 'person'))) || (countType === 'person' && (d.person_counts === 0 && relationship === 'mappings' && countType !== 'person'))) return 'transparent'
                                else if (inclusions.includes(d.name)) {
                                    if (d.data.concept.standard_concept) {return d.color} 
                                    else {return "transparent"}
                                }
                                else return '#d2d2d9'
                            }) 
                            .style('border', d => inclusions.includes(d.name) ? d.source.leaf ? `1px solid ${d.source.color}` : `1px solid ${d.color}` : (countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0) ? '1px solid #d2d2d9' : d.source.leaf && relationship === 'mappings' && countType !== 'person' ? `1px solid ${d.source.color}` : '1px solid #d2d2d9')
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
                                .style('display', d => !inclusions.includes(d.name) && d.record_counts > 0 ? 'inline-block' : 'none')
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
                                   updateConcepts(newInclusions)
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
                            .style('display', d => (countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0) || !inclusions.includes(d.name) ? 'none' : 'inline-block')
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
                               updateConcepts(newInclusions)
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
                            .style('opacity', d => inclusions.includes(d.name) ? 1 : 0.6)
                            .on('mouseover', (e, d) => {
                                if (!rootConcepts.includes(d.name)) {
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
                                if (!rootConcepts.includes(d.name)) showConfirmationPopup(d, 'enter', e)
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
                            .on('mouseover',(e,d) => d3.select('#info-icon-'+d.name+d.source.name).transition().style('color','#9597a6'))
                            .on('mouseout', (e,d) => {if(d3.select('#info-container-'+d.name+d.source.name).style('height') !== '45px') d3.select('#info-icon-'+d.name+d.source.name).transition().style('color','#c9c9d5')})
                            .on('click', (e,d) => {
                                if (d3.select('#info-container-'+d.name+d.source.name).style('height') === '45px') {
                                    d3.select('#info-icon-'+d.name+d.source.name).transition().style('color','#c9c9d5')
                                    d3.select('#info-container-'+d.name+d.source.name).transition().style('opacity',0).style('height','0px').style('padding-top','0px').style('margin','0px 0px 0px 22px')
                                    d3.select('#list-card-'+d.name+d.source.name).transition().style('border-radius','20px')
                                } else {
                                    d3.select('#info-icon-'+d.name+d.source.name).transition().style('color','#9597a6')
                                    d3.select('#info-container-'+d.name+d.source.name).transition().style('opacity',1).style('height','45px').style('padding-top','4px').style('margin','4px 4px 4px 22px')
                                    d3.select('#list-card-'+d.name+d.source.name).transition().style('border-radius','12px')
                                }
                            })
                        const mapInfoContainer = mapConceptCard.append('div')
                            .classed('map-info-container',true)
                            .attr('id', d => 'info-container-'+d.name+d.source.name)
                            .style('border-top', d => inclusions.includes(d.name) ? '1px solid #e7e7eb' : '1px solid color-mix(in srgb, #36126d, white 85%)')
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
                            .style('color', d => inclusions.includes(d.name) ? '#36126d' : '#9597a6')
                            .style('font-weight', d => inclusions.includes(d.name) ? 500 : 400)
                            .html(d => countType === 'record' || countType === 'measurement' ? formatThousands(d.record_counts) : formatThousands(d.person_counts))
                        mapCountsRC.append('p')
                            .classed('map-counts-RC-label list-counts-label',true)
                            .style('color', d => inclusions.includes(d.name) ? '#36126d' : '#9597a6')
                            .style('font-weight', d => inclusions.includes(d.name) ? 500 : 400)
                            .html(() => countType === 'record' || countType === 'measurement' ? 'RC' : 'PC')
                        const mapCountsBarRC = mapCountsRC.append('div')
                            .classed('list-counts-bar-container',true)
                        mapCountsBarRC.append('div')
                            .classed('map-counts-RC-bar list-counts-bar',true)
                            .style('width', d => countType === 'record' || countType === 'measurement' ? scaleWidth(d.record_counts) + 'px' : scaleWidth(d.person_counts) + 'px' )
                            .style('background-color', d => inclusions.includes(d.name) ? d.source.leaf && (relationship === 'mappings' && countType === 'record') ? d.source.color : d.color : '#e8e8e8')
                        
                        const mapCountsDRC = mapCountsSection.append('div')
                            .classed('list-counts',true)
                        mapCountsDRC.append('p')
                            .classed('map-counts-DRC-p list-counts-p num',true)
                            .style('text-align','left')
                            .style('color', '#9597a6')
                            .style('font-weight', 400)
                            .html(d => countType === 'record' || countType === 'measurement' ? formatThousands(d.descendant_record_counts) : formatThousands(d.descendant_person_counts))
                        mapCountsDRC.append('p')
                            .classed('map-counts-DRC-label list-counts-label',true)
                            .style('color', '#9597a6')
                            .style('font-weight', 400)
                            .html(() => countType === 'record' || countType === 'measurement' ? 'DRC' : 'DPC')
                        const mapCountsBarDRC = mapCountsDRC.append('div')
                            .classed('list-counts-bar-container',true)
                        mapCountsBarDRC.append('div')
                            .classed('map-counts-DRC-bar list-counts-bar',true)
                            .style('width', d => countType === 'record' || countType === 'measurement' ? scaleWidth(d.descendant_record_counts) + 'px' : scaleWidth(d.descendant_person_counts) + 'px')
                            .style('background-color', '#e8e8e8')   
                        
                        mapDataSection.append('div')
                            .classed('list-open-mappings',true)
                    
                    },update => {
                        update
                            .transition()
                            .style('max-height', d => mapRoot.includes(d.source.name) || (nodes.find(n => n.name === d.source.name).mappings.map(m => m.name).some(map => inclusions.includes(map))) ? '100px' : '0px')
                            .style('visibility', d => mapRoot.includes(d.source.name) || (nodes.find(n => n.name === d.source.name).mappings.map(m => m.name).some(map => inclusions.includes(map))) ? 'visible' : 'hidden')
                        update.select('.map-list-item')
                            .transition()
                            .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
                        update.select('.map-list-card')
                            .style('box-shadow', d => inclusions.includes(d.name) ? '0 0 0 1px rgba(0, 0, 0, 0.02),0 2px 10px rgba(0, 0, 0, 0.15)' : 'none')
                            .style('background-color', d => d.levels === '-1' ? 'none' : inclusions.includes(d.name) ? 'white' : '#f2f2f4')
                        update.select('.map-list-title-circle')
                            .classed('list-circle-dash', d => (countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0) ? true : false)
                            .classed('list-circle', d => (countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0) ? false : true)
                            .classed('btn', d => inclusions.includes(d.name) ? true : false)
                            .style('pointer-events', d => inclusions.includes(d.name) ? 'all' : 'none')
                            .style('background', d => {
                                if ((countType === 'record' && (d.record_counts === 0 || (d.source.leaf && relationship === 'mappings' && countType !== 'person'))) || (countType === 'person' && (d.person_counts === 0 && relationship === 'mappings' && countType !== 'person'))) return 'none'
                                else if (inclusions.includes(d.name)) {
                                    if (!d.data.concept.standard_concept) {return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, "+ d.color + " 0.5px," + d.color + " 2px)"} 
                                    else {return "none"}
                                }
                                else {
                                    if (!d.data.concept.standard_concept) return "repeating-linear-gradient(-45deg, transparent, transparent 0.5px, #d2d2d9 0.5px, #d2d2d9 2px)"    
                                    else {return "none"}

                                }  
                            })
                            .style("background-color", d => {
                                if ((countType === 'record' && (d.record_counts === 0 || (d.source.leaf && relationship === 'mappings' && countType !== 'person'))) || (countType === 'person' && (d.person_counts === 0 && relationship === 'mappings' && countType !== 'person'))) return 'transparent'
                                else if (inclusions.includes(d.name)) {
                                    if (d.data.concept.standard_concept) {return d.color} 
                                    else {return "transparent"}
                                }
                                else return '#d2d2d9'
                            }) 
                            .style('border', d => inclusions.includes(d.name) ? d.source.leaf ? `1px solid ${d.source.color}` : `1px solid ${d.color}` : (countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0) ? '1px solid #d2d2d9' : d.source.leaf && relationship === 'mappings' && countType !== 'person' ? `1px solid ${d.source.color}` : '1px solid #d2d2d9')
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
                            .style('display', d => !inclusions.includes(d.name) && d.record_counts > 0 ? 'inline-block' : 'none')
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
                               updateConcepts(newInclusions)
                            })
                        update.select('.map-list-eye')
                            .style('display', d => (countType === 'record' && d.record_counts === 0) || (countType === 'person' && d.person_counts === 0) || !inclusions.includes(d.name) ? 'none' : 'inline-block')
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
                                updateConcepts(newInclusions)
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
                                if (!rootConcepts.includes(d.name)) {
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
                                if (!rootConcepts.includes(d.name)) showConfirmationPopup(d, 'enter', e)
                            })
                            .transition()
                            .style('opacity', d => inclusions.includes(d.name) ? 1 : 0.6)
                        update.select('.map-info-icon')
                            .on('mouseover',(e,d) => d3.select('#info-icon-'+d.name+d.source.name).transition().style('color','#9597a6'))
                            .on('mouseout', (e,d) => {if(d3.select('#info-container-'+d.name+d.source.name).style('height') !== '45px') d3.select('#info-icon-'+d.name+d.source.name).transition().style('color','#c9c9d5')})
                            .on('click', (e,d) => {
                                if (d3.select('#info-container-'+d.name+d.source.name).style('height') === '45px') {
                                    d3.select('#info-icon-'+d.name+d.source.name).transition().style('color','#c9c9d5')
                                    d3.select('#info-container-'+d.name+d.source.name).transition().style('opacity',0).style('height','0px').style('padding-top','0px').style('margin','0px 0px 0px 22px')
                                    d3.select('#list-card-'+d.name+d.source.name).transition().style('border-radius','20px')
                                } else {
                                    d3.select('#info-icon-'+d.name+d.source.name).transition().style('color','#9597a6')
                                    d3.select('#info-container-'+d.name+d.source.name).transition().style('opacity',1).style('height','45px').style('padding-top','4px').style('margin','4px 4px 4px 22px')
                                    d3.select('#list-card-'+d.name+d.source.name).transition().style('border-radius','12px')
                                }
                            })
                        update.select('.map-info-container')
                            .style('border-top', d => inclusions.includes(d.name) ? '1px solid #e7e7eb' : '1px solid color-mix(in srgb, #36126d, white 85%)')
                        update.select('.map-counts-RC-p')
                            .style('color', d => inclusions.includes(d.name) ? '#36126d' : '#9597a6')
                            .style('font-weight', d => inclusions.includes(d.name) ? 500 : 400)
                            .html(d => countType === 'record' || countType === 'measurement' ? formatThousands(d.record_counts) : formatThousands(d.person_counts))
                        update.select('.map-counts-RC-label')
                            .style('color', d => inclusions.includes(d.name) ? '#36126d' : '#9597a6')
                            .style('font-weight', d => inclusions.includes(d.name) ? 500 : 400)
                            .html(() => countType === 'record' || countType === 'measurement' ? 'RC' : 'PC')
                        update.select('.map-counts-RC-bar')
                            .transition()
                            .style('width', d => countType === 'record' || countType === 'measurement' ? scaleWidth(d.record_counts) + 'px' : scaleWidth(d.person_counts) + 'px')
                            .style('background-color', d => inclusions.includes(d.name) ? d.source.leaf && (relationship === 'mappings' && countType === 'record') ? d.source.color : d.color : '#e8e8e8')
                        update.select('.map-counts-DRC-p')
                            .html(d => countType === 'record' || countType === 'measurement' ? formatThousands(d.descendant_record_counts) : formatThousands(d.descendant_person_counts))
                        update.select('.map-counts-DRC-label')
                            .html(() => countType === 'record' || countType === 'measurement' ? 'DRC' : 'DPC')
                        update.select('.map-counts-DRC-bar')
                            .transition()
                            .style('width', d => countType === 'record' || countType === 'measurement' ? scaleWidth(d.descendant_record_counts) + 'px' : scaleWidth(d.descendant_person_counts) + 'px')
                    })
                })
                update.select('.list-section-title')
                    .transition()
                    .style('opacity', d => hovered.length > 0 ? 0.2 : 1)
                update.select('.list-section-arrow')
                    .style('transform', d => d.section === 'Root' ? 'rotate('+90+'deg)' : d.section !== 'Parents' ? 'rotate('+180+'deg)' : 'none')
                update.select('.list-level-number')
                    .html(d => d.section === 'Root' ? 'Level 1' : d.section)
                update.select('.parents-caret-down')
                    .style('display', d => d.section === 'Parents' && nodes.filter(n => n.levels === '-1').length > 10 ? 'block' : 'none')
                    .on('click',(e,d) => {
                        d3.selectAll(".list-item-container"+'-1').transition(2000).style('height','auto').style('max-height','100px').style('display','block')
                        d3.select('#parents-caret-down-'+d.name).style('display','none')
                        d3.select('#parents-caret-up-'+d.name).style('display','block')
                    })
                update.select('.parents-caret-up')
                    .on('click',(e,d) => {
                        d3.selectAll(".list-item-container"+'-1').transition(2000).style('height','0px').style('max-height','0px').style('display','none')
                        d3.select('#parents-caret-down-'+d.name).style('display','block')
                        d3.select('#parents-caret-up-'+d.name).style('display','none')
                    })
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
        // hovering
        function updateHoverOpacity() {
            // TREE VIEW
            d3.selectAll('.tree-line')
                .transition()
                .style('opacity', d => hovered.includes(d.source.name) && hovered.includes(d.target.name) ? 1 : hovered.length > 0 ? 0.4 : 1)
            d3.selectAll('.map-node-main')
                .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.4 : 1)
            d3.selectAll('.map-link')
                .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.4 : 1)
            d3.selectAll('.map-tree-circle')
                .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.4 : 1)
            d3.selectAll('.map-drc-group')
                .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.4 : 1)
            d3.selectAll('.subsumes-node')
                .transition()
                .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.4 : 1)
            d3.selectAll('.set-expression')
                .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.4 : 1)
            d3.selectAll('.mappings-btn')
                .style('opacity', () => hovered.length > 0 ? 0.1 : 0.3)
            d3.selectAll('.drc-group')
                .transition()
                .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.4 : 1)
            d3.selectAll('.label')
                .transition()
                .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.4 : 1)
            d3.selectAll('.prune-group')
                .style('opacity', d => hovered.length === 1 && hovered.includes(d.name) ? 1 : hovered.length > 0 ? 0.4 : 1)
            d3.selectAll('.prune-curve')
                .style('opacity', d => d.parents === hovered ? 1 : hovered.length > 0 ? 0.4 : 1)

            // LIST VIEW
            d3.selectAll('.list-section-title')
                .transition()
                .style('opacity', () => hovered.length > 0 ? 0.2 : 1)
            d3.selectAll('.list-item')
                .transition()
                .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
            d3.selectAll('.map-list-item')
                .transition()
                .style('opacity', d => hovered.length > 0 && !hovered.includes(d.name) ? 0.2 : 1)
            d3.selectAll('.mappings-container')
                .classed('is-hovered', hovered.length > 0)
                .style('border-left', () => hovered.length > 0 ? '1px dashed #36126d20' : '1px dashed #36126d')
            d3.selectAll('.mappings-title')
                .style('opacity', d => mapRoot.includes(d.name) ? hovered.length > 0 ? 0.2 : 1 : 0)
        }
        useEffect(() => {
            if (nodes && nodes.length > 0) updateHoverOpacity()
        },[hovered])

        // scroll to list element
        useEffect(() => {
            if (hovered.length !== 1) return
            const container = document.getElementById('list-container')
            const label = document.getElementById('list-item-' + hovered[0])
            if (!container || !label) return

            const PAD = 28 // breathing room so the shadow isn't clipped

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

        // close filters
        useEffect(() => {
            function handleClickOutside(e) {
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
            }
            document.addEventListener('click', handleClickOutside)
            return () => document.removeEventListener('click', handleClickOutside)
        }, [])

        function showSetExpressionPopup(mode) {
            if (mode === 'enter') {
                const event = document.getElementById('expression-question-mark').getBoundingClientRect()
                d3.select('#set-expression-popup')
                    .transition()
                    .style('opacity',1)
                    .style('left', function() {
                        const w = document.getElementById('set-expression-popup').clientWidth
                        if (event.x + w > window.innerWidth) return (event.x - w - 5 + 'px')
                        else return (event.x + 20 + 'px')    
                    })
                    .style('top', function() {
                        const h = document.getElementById('set-expression-popup').clientHeight
                        if ((event.y-event.height-20) - h < 0) return ((event.y-event.height-20) + 10 + 'px')  
                        else return ((event.y-event.height-20) + 'px')
                    })
            } else d3.select('#set-expression-popup').transition().style('opacity',0)
        }

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
                            .style('opacity', d => countType === 'person' && maxPersonLevel ? d > maxPersonLevel ? 0.5 : 1 : 1)
                            .style('pointer-events', d => countType === 'person' && maxPersonLevel ? d > maxPersonLevel ? 'none' : 'all' : 'all')
                            .style('font-weight', d => maxLevel === d ? 500 : 400)
                            .style('width','100%')
                            .style('text-align','center')
                            .style('color', d => maxLevel === d  ? '#36126d' : '#9597a6')
                            .on('mouseover', (e,d) => d3.select('#level-'+d).style('color', '#36126d').style('font-weight',500))
                            .on('mouseout', (e,d) => d3.select('#level-'+d).style('color', d => maxLevel === d ? '#36126d' : '#9597a6').style('font-weight',() => maxLevel === d ? 500 : 400))
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
                            .style('opacity', d => countType === 'person' && maxPersonLevel ? d > maxPersonLevel ? 0.5 : 1 : 1)
                            .style('pointer-events', d => countType === 'person' && maxPersonLevel ? d > maxPersonLevel ? 'none' : 'all' : 'all')
                            .style('color', d => maxLevel === d  ? '#36126d' : '#9597a6')
                            .on('mouseover', (e,d) => d3.select('#level-'+d).style('color', '#36126d').style('font-weight',500))
                            .on('mouseout', (e,d) => d3.select('#level-'+d).style('color', d => maxLevel === d ? '#36126d' : '#9597a6').style('font-weight',() => maxLevel === d ? 500 : 400))
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
                document.getElementById("header-classes").style.maxWidth =  document.getElementById("sidebar-filters").clientWidth - document.getElementById('levels-container').clientWidth - document.getElementById('classes-label-container').clientWidth - document.getElementById("filter-title").clientWidth - 40 + 'px'
                d3.select('#dropdown-classes').selectAll('.class').data(fullClassList, d => d)
                    .join(enter => {
                        const container = enter.append('div')
                            .classed('class flex',true)  
                            .style('opacity', d => allClasses.includes(d) ? 1 : 0.2) 
                        container.append('div') 
                            .classed('class-check-box checkBox',true)
                            .attr('id', d => 'check-box-'+d.replace(/\s+/g, ""))
                            .style('background-color', d => classFilter.includes(d) || classFilter.includes('All') ? '#36125d' : 'transparent')
                            .style('border', d => classFilter.includes(d) || classFilter.includes('All') ? '1px solid #36125d' : '1px solid #d2d2d9')
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
                            .style('color', d => classFilter.includes(d) || classFilter.includes('All') ? '#36125d' : '#b3b3bf')
                            .html(d => d)
                    },update =>{
                        update 
                            .style('opacity', d => allClasses.includes(d) ? 1 : 0.2) 
                        update.select('.class-check-box')
                            .style('background-color', d => classFilter.includes(d) || classFilter.includes('All') ? '#36125d' : 'transparent')
                            .style('border', d => classFilter.includes(d) || classFilter.includes('All') ? '1px solid #36125d' : '1px solid #d2d2d9')
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
                            .style('color', d => classFilter.includes(d) || classFilter.includes('All') ? '#36125d' : '#b3b3bf')
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

        // CALL FUNCTIONS
        useEffect(()=>{
            if (nodes && nodes.length > 0) {
                console.log('nodes',nodes)
                if (view === 'tree') {
                    const zoom = d3.zoom()
                        .scaleExtent([0.01, 4])
                        .on('start', () => d3.select('#tree-graphics').style('pointer-events', 'none'))
                        .on('zoom', zoomed)
                        .on('end', () => d3.select('#tree-graphics').style('pointer-events', 'all'))
                    zoomRef.current = zoom
                    d3.select('#tree-container').style('display','block')
                    d3.select('#set-container').style('display','none')
                    d3.select('#list-container').style('display','none')
                    let width = d3.select("#tree-container").node().getBoundingClientRect().width + margin*2;
                    let height = d3.select("#tree-container").node().getBoundingClientRect().height + margin*2;
                    d3.select("#tree")
                        .attr('width', '100%')
                        .attr('height', '100%')
                        .attr('viewBox', `${margin} ${margin} ${width} ${height}`)
                        .call(zoom)
                        // .call(d3.zoom().on("start",()=>d3.select("#tree-graphics").style("pointer-events", "none")).on("zoom", zoomed)).on("end",()=>d3.select("#tree-graphics").style("pointer-events", "all"))
                    d3.select('#neighborhood-outline').remove()
                    // drawTree()
                    drawTree(...layoutTopLevel())
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
        },[nodes,inclusions,view,mapRoot,countType,graphSectionWidth,expandedTop])

        useEffect(() => { setExpandedTop([]); setTopList(null) }, [rootConcepts])

        useEffect(() => {
            if (!topList) return
            const h = e => { if (e.key === 'Escape') setTopList(null) }
            window.addEventListener('keydown', h)
            return () => window.removeEventListener('keydown', h)
        }, [topList])

        // MINIMAP
        const hideTimerRef = useRef(null)
        const HIDE_DELAY = 800   
        const miniCollapsedRef = useRef(false)   
        const lastMiniRef = useRef(null)         
        useEffect(() => { lastMiniRef.current = null }, [nodes])
        function cancelMinimapHide() {clearTimeout(hideTimerRef.current)}
        function scheduleMinimapHide(delay = HIDE_DELAY) {
            if (dragRef.current) return
            clearTimeout(hideTimerRef.current)
            // nothing to hide if the minimap isn't showing
            const mini = document.getElementById('minimap-container')
            if (!mini || mini.style.display === 'none') return
            hideTimerRef.current = setTimeout(() => {
                if (pointerOverMinimap()) return     
                setZoomedNodes([])
                setZoomedLinks([])
                setFocused(null)
            }, delay)
        }
        // don't fire after unmount
        useEffect(() => () => clearTimeout(hideTimerRef.current), [])
        const miniPosRef = useRef(null) 
        const dragRef = useRef(null)
        const pointerRef = useRef({ x: -1, y: -1 })
        useEffect(() => {
            const onMove = e => { pointerRef.current = { x: e.clientX, y: e.clientY } }
            window.addEventListener('pointermove', onMove, { passive: true })
            return () => window.removeEventListener('pointermove', onMove)
        }, [])
        function pointerOverMinimap() {
            const el = document.getElementById('minimap-container')
            if (!el || el.style.display === 'none') return false
            const r = el.getBoundingClientRect()
            const { x, y } = pointerRef.current
            return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom
        }
        // default spot: top right of the tree area, like before
        function defaultMiniPos(el) {
            const box = document.getElementById('tree-container').getBoundingClientRect()
            return { x: box.right - el.offsetWidth - 16, y: box.top + 16 }
        }
        // keep the whole card inside the window
        function clampMiniPos(p, el) {
            const M = 8
            return {
                x: Math.min(window.innerWidth - el.offsetWidth - M, Math.max(M, p.x)),
                y: Math.min(window.innerHeight - el.offsetHeight - M, Math.max(M, p.y))
            }
        }
        function applyMiniPos(p) {d3.select('#minimap-container').style('left', p.x + 'px').style('top', p.y + 'px')}
        function startMinimapDrag(e) {
            if (e.button !== 0 || e.target.closest('.minimap-zoom, .minimap-collapse')) return
            const el = e.currentTarget
            cancelMinimapHide()
            el.setPointerCapture(e.pointerId)
            el.style.cursor = 'grabbing'
            const r = el.getBoundingClientRect()
            dragRef.current = { px: e.clientX, py: e.clientY, ox: r.left, oy: r.top }
        }
        function moveMinimapDrag(e) {
            const d = dragRef.current
            if (!d) return
            const p = clampMiniPos({ x: d.ox + e.clientX - d.px, y: d.oy + e.clientY - d.py }, e.currentTarget)
            miniPosRef.current = p
            applyMiniPos(p)
        }
        function endMinimapDrag(e) {
            if (!dragRef.current) return
            dragRef.current = null
            const el = e.currentTarget
            el.releasePointerCapture?.(e.pointerId)
            el.style.cursor = 'grab'
            if (!el.matches(':hover')) scheduleMinimapHide()
        }
        function collapseMinimap() {
            const el = document.getElementById('minimap-container')
            const tab = document.getElementById('minimap-tab')
            if (!el || !tab) return
            cancelMinimapHide()
            miniCollapsedRef.current = true

            // reveal the tab (invisible for now) so we know where to shrink to
            d3.select(tab).interrupt().style('display', 'flex').style('opacity', 0)
            const t = tab.getBoundingClientRect()
            const c = el.getBoundingClientRect()
            const sx = t.width / c.width, sy = t.height / c.height
            const ox = t.left + t.width / 2 - c.left      // transform origin = tab centre, in card px
            const oy = t.top + t.height / 2 - c.top

            d3.select(el).interrupt()
                .style('transform-origin', `${ox}px ${oy}px`)
                .transition().duration(250).ease(d3.easeCubicInOut)
                .styleTween('transform', () => d3.interpolateString('scale(1, 1)', `scale(${sx}, ${sy})`))
                .style('opacity', 0)
                .on('end', function () {
                    d3.select(this).style('display', 'none').style('transform', 'none').style('opacity', 1)
                })

            d3.select(tab).transition().delay(150).duration(150).style('opacity', 1)
        }
        function expandMinimap() {
            const el = document.getElementById('minimap-container')
            const tab = document.getElementById('minimap-tab')
            if (!el || !tab) return
            miniCollapsedRef.current = false

            const t = tab.getBoundingClientRect()
            d3.select(tab).interrupt().style('display', 'none')

            const last = lastMiniRef.current
            if (!last) return              // nothing hovered yet: the next hover shows the card as usual

            // show the card at full size and draw it, so the minimap measures its real size
            d3.select(el).interrupt().style('display', 'block').style('opacity', 1).style('transform', 'none')
            applyMiniPos(clampMiniPos(miniPosRef.current || defaultMiniPos(el), el))
            neighborhoodRef.current = last.zNodes
            drawZoomedNeighborhood(last.zNodes, last.zLinks, last.focused)

            // squash it onto the tab, then grow it back out
            const c = el.getBoundingClientRect()
            const sx = t.width / c.width, sy = t.height / c.height
            d3.select(el)
                .style('transform-origin', `${t.left + t.width / 2 - c.left}px ${t.top + t.height / 2 - c.top}px`)
                .style('transform', `scale(${sx}, ${sy})`)
                .style('opacity', 0)
                .transition().duration(250).ease(d3.easeCubicOut)
                .styleTween('transform', () => d3.interpolateString(`scale(${sx}, ${sy})`, 'scale(1, 1)'))
                .style('opacity', 1)
                .on('end', function () { d3.select(this).style('transform', 'none') })
        }
        // call minimap
        useEffect(() => {
            if (view === 'tree' && focused && zoomedNodes.length > 0 && nodes.length > 10) {
                let zNodes,zLinks
                if (!zoomClosed) expandMinimap()
                if (relationship === 'descendants') {
                    let positions = {}
                    const {matrix,nodes} = po.domFromEdges(zoomedLinks.map(l => ([l.source.name.toString(),l.target.name.toString()])))
                    const pos = po.createPoset(matrix,nodes)
                    const hoveredNode = zoomedNodes.find(n => n.name === focused)
                    pos.enrich()
                        .setLayers()
                        .feature("lower_bound",(node)=> node === focused ? hoveredNode.children : hoveredNode.children.includes(parseInt(node)) ? [] : focused)
                        .feature("upper_bound",(node)=> node === focused ? hoveredNode.parents : hoveredNode.parents.includes(parseInt(node)) ? [] : focused)
                        .feature("node_degree",(node,f)=>f.lower_bound.length+f.upper_bound.length)
                    linearLayout(pos,edges,nWidth)
                    pos.elements.forEach(e => positions[e] = pos.featureOf(e,'x'))
                    zNodes = zoomedNodes.map(n => ({...n,distance:pos.layers.findIndex(layer => layer.includes(n.name.toString())),x:positions[n.name.toString()]}))
                    zLinks = zoomedLinks.map(l => ({source:zNodes.find(n => n.name === l.source.name),target:zNodes.find(n => n.name === l.target.name)}))    
                } else {
                    zNodes = zoomedNodes
                    zLinks = []
                }
                neighborhoodRef.current = zNodes
                lastMiniRef.current = { zNodes, zLinks, focused }
                if (miniCollapsedRef.current) return    
                const mini = d3.select('#minimap-container').interrupt()
                    .style('display', 'block').style('opacity', 1).style('transform', 'none').node()
                applyMiniPos(clampMiniPos(miniPosRef.current || defaultMiniPos(mini), mini))
                if (pointerOverMinimap()) cancelMinimapHide()
                d3.select('#minimap-container').interrupt().style('display', 'block').style('opacity', 1)
                neighborhoodRef.current = zNodes
                drawZoomedNeighborhood(zNodes, zLinks, focused)
            } else {
                d3.select('#minimap-container').style('display', 'none')
            }
        }, [zoomedNodes, focused, view])

        useEffect(() => {
            if (fullTree.nodes && fullTree.mappings) {
                const sum = countType === 'record' || countType === 'measurement' ? d3.sum(fullTree.allNodes.filter(n => inclusions.includes(n.name)).map(n => n.record_counts)) : d3.sum(fullTree.allNodes.filter(n => inclusions.includes(n.name)).map(n => n.person_counts))
                d3.select('#set-total-counts').html(sum)    
            }      
        },[inclusions,countType])

        useEffect(() => {
            setShowConfirmation(false)
            setVisible(false)
        },[view])

        const q = topQuery.trim().toLowerCase()
        const topLabel = n => n.data.concept.concept_name || String(n.data.concept.concept_id)
        const hasName = n => !!n.data.concept.concept_name
        const topAll = topList
            ? nodes.filter(n => n.levels === '-1')
                .sort((a, b) => {
                    if (hasName(a) !== hasName(b)) return hasName(a) ? -1 : 1   // named nodes first
                    if (hasName(a)) return topLabel(a).localeCompare(topLabel(b))
                    return Number(a.data.concept.concept_id) - Number(b.data.concept.concept_id)
                })
            : []
        const topShown = q ? topAll.filter(n => {
            const c = n.data.concept
            return [c.concept_name, c.concept_code, c.concept_id, c.vocabulary_id]
                .filter(v => v !== undefined && v !== null && v !== '')
                .join(' ').toLowerCase().includes(q)
        }) : topAll

        const allAdded = topShown.length > 0 && topShown.every(n => expandedTop.includes(n.name))
        const addAllTop = () => setExpandedTop(prev => [...new Set([...prev, ...topShown.map(n => n.name)])])

        const toggleTop = name => setExpandedTop(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name])

        return (
            <div id = "sidebar">
                <div id = "drag-bar"></div>
                <div id = "set-expression-popup" className = 'toolTip dropShadow flex' style = {{flexDirection:'column',width:'220px',pointerEvents:'none'}}>
                    <div className = 'flex' style = {{alignItems:'flex-start',marginBottom:4}}><div className = 'selectedText' style = {{color:'#7728ED',width:'80px',flexShrink:0}}>Exclude:</div><div>Removes this concept from the set.</div></div>
                    <div className = 'flex' style = {{alignItems:'flex-start'}}><div className = 'selectedText' style = {{color:'#7728ED',width:'80px',flexShrink:0}}>Descendants:</div><div>Includes all concepts below this one in the hierarchy. Paired with Exclude, it removes this concept and its descendants.</div></div>
                </div>
                <div id = "sidebar-content">
                    <div className='flex margin' style = {{width:'calc(100% - 2em)',justifyContent:'space-between'}}>
                        <div className = 'toggle' id = "view-toggle">
                            <div className = 'mainBtn slider' id='slider-view' style = {{left:5}}>''</div>
                            
                            <div className = 'btn toggle-itm' id = "set-toggle" onClick={() => {setView('set');moveSlider(0,100,'view')}} style = {{fontWeight:view === 'set' ? 500 : 400,color:view === 'set' ? '#36126d' : '#9597a6'}}>Concept Set</div>
                            <div className = 'btn toggle-itm' id = "list-toggle" onClick={() => {setView('list');moveSlider(1,100,'view')}} style = {{fontWeight:view === 'list' ? 500 : 400,color:view === 'list' ? '#36126d' : '#9597a6'}}>List</div>
                            <div className = 'btn toggle-itm' id = "tree-toggle" onClick={() => {setView('tree');moveSlider(2,100,'view')}} style = {{fontWeight:view === 'tree' ? 500 : 400,color:view === 'tree' ? '#36126d' : '#9597a6'}}>Hierarchy</div>
                        </div> 
                        <div>
                            <FontAwesomeIcon style = {{display:'block'}} icon={faExpand} id = "expand" className = "fa-thin icon expand-compress" onClick={handleExpand} />
                            <FontAwesomeIcon style = {{display:'none'}} icon={faCompress} id = "compress" className = "fa-thin icon expand-compress" onClick={handleExpand} /> 
                        </div>  
                    </div>
                    <div className = "selectionsContainer removeRightShadow">
                        <div className = "filters" id = "sidebar-filters" style = {{borderTop:'1px solid #d3d3dd'}}>
                            <p id = "filter-title" className='selectedText' style = {{paddingLeft:'1.5em',paddingRight:'1em',fontSize:'11px'}}>FILTERS</p>
                            <div className="filterContainer" id = 'levels-container' style = {{borderRight:'none'}}>
                                {/* <div className = {`btn flex ${levelFilter < fullTreeMax ? "greyBtn" : ""}`} onMouseEnter = {()=>d3.select('#reset-levels').style('opacity',1)} onMouseLeave = {()=>d3.select('#reset-levels').style('opacity',0.3)} style = {{padding: '3px 5px 3px 5px',borderRadius: '4px'}}  */}
                                <div className = 'btn flex' onMouseEnter = {()=>d3.select('#reset-levels').style('color','#9597a6')} onMouseLeave = {()=>d3.select('#reset-levels').style('color','#c9c9d5')} 
                                    onClick = {() => {
                                        setLevelFilter(fullTreeMax)
                                        d3.select('#open-levels').style('display', 'block')
                                        d3.select('#close-levels').style('display', 'none') 
                                        d3.select('#dropdown-levels').style('visibility','hidden')
                                        d3.select('#header-levels').classed('filterActive', false) 
                                    }}
                                >
                                    {/* <p className = 'filterLabel' style = {{fontWeight: levelFilter < fullTreeMax ? 500 : 400,opacity: levelFilter < fullTreeMax ? 1 : 0.7}}>{levelFilter < fullTreeMax ? 'Clear Level' : 'Level'}</p> */}
                                    <p className = 'filterLabel'>Level</p>
                                    <FontAwesomeIcon style = {{display: levelFilter < fullTreeMax ? 'block' : 'none',marginTop:1}} className = "resetFilter fa-solid icon" id = "reset-levels" icon={faX} />
                                </div>
                                <div className = 'dropdownContainer'>
                                    <div className = "dropdownHeader btn filterMargin" id = "header-levels" style = {{border: levelFilter < fullTreeMax ? '1px solid #ddd4f7' : '1px solid #ecedf0',overflow:'hidden'}}
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
                                    <div className = "dropdownContent dropShadow" id = "dropdown-levels" style = {{width:22}}></div> 
                                </div>
                                    
                            </div>
                            <div className="filterContainer" id = 'classes-container' style = {{borderRight:'none'}}>
                                {/* <div id = 'classes-label-container' className = {`btn flex ${classFilter && fullClassList.length > 1 && !(classFilter.includes('All') || fullClassList.every(c => classFilter.includes(c))) ? "greyBtn" : ""}`} onMouseEnter = {()=>d3.select('#reset-classes').style('opacity',1)} onMouseLeave = {()=>d3.select('#reset-classes').style('opacity',0.3)} style = {{padding: '3px 5px 3px 5px',borderRadius: '4px'}}  */}
                                <div id = 'classes-label-container' className = 'btn flex' onMouseEnter = {()=>d3.select('#reset-classes').style('color','#9597a6')} onMouseLeave = {()=>d3.select('#reset-classes').style('color','#c9c9d5')}     
                                    onClick = {() => {
                                            setClassFilter(fullClassList)
                                            d3.select('#open-classes').style('display', 'block')
                                            d3.select('#close-classes').style('display', 'none') 
                                            d3.select('#dropdown-classes').style('visibility','hidden')
                                            d3.select('#header-classes').classed('filterActive', false) 
                                    }}
                                >
                                    {/* <p className = 'filterLabel' style = {{fontWeight: classFilter && fullClassList.length > 1 && !(classFilter.includes('All') || fullClassList.every(c => classFilter.includes(c))) ? 500 : 400, opacity: classFilter && fullClassList.length > 1 && !(classFilter.includes('All') || fullClassList.every(c => classFilter.includes(c))) ? 1 : 0.7}}>{classFilter && fullClassList.length > 1 && !(classFilter.includes('All') || fullClassList.every(c => classFilter.includes(c))) ? 'Clear Classes' : 'Classes'}</p> */}
                                    <p className = 'filterLabel'>Class</p>
                                    <FontAwesomeIcon style = {{marginTop:1,display: classFilter && (classFilter.includes('All') || fullClassList.every(c => classFilter.includes(c))) ? 'none' : 'block'}} className = "resetFilter fa-solid icon" id = "reset-classes" icon={faX} />    
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
                    <div className = 'sidebarContainer' id = "set-container" style = {{display: view === 'Set' ? 'flex' : 'none'}}>
                        <div id = "set-header">
                            <p className = "selectedText" style = {{marginLeft:'2px'}}>Concept</p>
                            <div className = "flex" style = {{position:'absolute',right:'calc(167px + 1em)'}}>
                                <p className = "selectedText" style = {{marginRight:6}}>Expression</p> 
                                <div className = "questionMark flex selectedText btn" id = 'expression-question-mark' onMouseEnter={() => showSetExpressionPopup('enter')} onMouseLeave={() => showSetExpressionPopup('leave')}>?</div>   
                            </div>
                            <p className = "selectedText" >{countType === 'record' || countType === 'measurement' ? 'DRC' : 'DPC'}</p>
                        </div>
                        <div id = "set-items"></div>
                        <div id = "set-total">
                            <div className = 'flex btn' style = {{pointerEvents:showRootLine ? 'all' : 'none'}} onMouseEnter={() => {setHovered(['rootline'])}} onMouseLeave={() => {setHovered([])}}>
                                <img className = 'marginRightLg' id = "rootline-icon" src={rootLineIcon} alt="root descendants line icon"/>
                                <p className = "selectedText">Total Descendant Counts:<span className = "num" id = "set-total-counts"  style = {{marginLeft:10}}></span></p>    
                            </div>
                        </div>
                    </div>
                    <div className = 'sidebarContainer' id = "list-container" style = {{display: view === 'List' ? 'block' : 'none'}}></div>
                    <div id = "tree-container" style = {{display: view === 'Tree' ? 'block' : 'none'}}>  
                        <button className = "btn greyBtn" id = 'zoom-to-fit' onClick={() => zoomToFit(d3.select('#nodes'))} style = {{zIndex:5000,position: 'absolute',display: 'none',marginTop:'0.75em',marginLeft:'0.75em'}}>Zoom to fit</button>
                        <button className="btn greyBtn" id="top-list-btn" onClick={openTopList}
                            style={{ zIndex: 5000, position: 'absolute', display: 'none', bottom: '0.75em', left: '0.75em' }}>
                            Parent concepts
                        </button>
                        <svg id = "tree">
                            <g id = "tree-graphics">
                                <g id = "key"></g>
                                <g id = "links"></g>
                                <g id = "nodes"></g>    
                            </g>
                        </svg>  
                        <div id="minimap-tab" title="Show zoom window" onClick={() => {expandMinimap();setZoomClosed(false)}} style={{ display: 'none' }}>
                            <FontAwesomeIcon icon={faCaretLeft} />
                        </div>
                        {topList && createPortal(
                            <>
                                <div onClick={() => setTopList(null)} style={{ position: 'fixed', inset: 0, zIndex: 1999 }} />
                                <div id="top-list-popup" className="dropShadow" style={{
                                    position: 'fixed', zIndex: 2000, width: 320, maxHeight: 420,
                                    left: Math.min(window.innerWidth - 336, Math.max(8, topList.x - 160)),
                                    top: Math.min(window.innerHeight - 436, Math.max(8, topList.y + 12)),
                                    display: 'flex', flexDirection: 'column', background: 'white',
                                    border: '1px solid #e8e8e8', borderRadius: 8, overflow: 'hidden'
                                }}>
                                    <div style={{ padding: '10px 12px', borderBottom: '1px solid #e8e8e8' }}>
                                        <div className="flex" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
                                            <p className="selectedText">Parent concepts ({topAll.length})</p>
                                            <div className="flex" style={{ gap: 12 }}>
                                                {!allAdded && (
                                                    <p className="btn" style={{ color: '#36126d', fontWeight: 500 }} onClick={addAllTop}>
                                                        Add all{q ? ` (${topShown.length})` : ''}
                                                    </p>
                                                )}
                                                {expandedTop.length > 0 && (
                                                    <p className="btn" style={{ color: '#9597a6' }} onClick={() => setExpandedTop([])}>Clear</p>
                                                )}
                                            </div>
                                        </div>
                                        <input value={topQuery} onChange={e => setTopQuery(e.target.value)} placeholder="Search name, code or id"
                                            autoFocus style={{ width: '100%', boxSizing: 'border-box' }} />
                                    </div>
                                    <div style={{ overflowY: 'auto' }}>
                                        {topShown.slice(0, 200).map(n => {
                                            const on = expandedTop.includes(n.name)
                                            const c = n.data.concept
                                            return (
                                                <div key={n.name} className="btn flex" onClick={() => toggleTop(n.name)}
                                                    style={{ padding: '6px 12px', justifyContent: 'flex-start', gap: 8, background: on ? '#f3effd' : 'white' }}>
                                                    <div style={{ width: 10, height: 10, flexShrink: 0, borderRadius: '50%',
                                                        border: '1px solid ' + (on ? '#36125d' : '#cccccc'), background: on ? '#36125d' : 'transparent' }} />
                                                    <p style={{ textAlign: 'left' }}>
                                                        <span className="selectedText marginRight">{c.concept_name || c.concept_id}</span>
                                                        {c.concept_name && c.concept_code && <span className="num marginRight" style={{ fontWeight: 500 }}>{c.concept_code}</span>}
                                                        {c.vocabulary_id && <span>{c.vocabulary_id}</span>}
                                                    </p>
                                                </div>
                                            )
                                        })}
                                        {topShown.length > 200 && <p style={{ padding: 10, color: '#9597a6' }}>Showing 200 of {topShown.length}. Search to narrow.</p>}
                                        {topShown.length === 0 && <p style={{ padding: 10, color: '#9597a6' }}>No matches</p>}
                                    </div>
                                </div>
                            </>,
                            document.body
                        )}
                        {createPortal(
                            <div id="minimap-container"
                                onMouseEnter={cancelMinimapHide}
                                onMouseLeave={() => scheduleMinimapHide(400)}
                                onPointerDown={startMinimapDrag}
                                onPointerMove={moveMinimapDrag}
                                onPointerUp={endMinimapDrag}
                                onPointerCancel={endMinimapDrag}
                                onDoubleClick={e => {
                                    if (e.target.closest('.minimap-zoom, .minimap-collapse')) return
                                    miniPosRef.current = null   
                                    applyMiniPos(clampMiniPos(defaultMiniPos(e.currentTarget), e.currentTarget))
                                }}
                                style={{
                                    position: 'fixed',
                                    zIndex: 900,
                                    width: 300,
                                    height: 210,
                                    background: 'white',
                                    border: '1px solid #e8e8e8',
                                    borderRadius: 6,
                                    boxShadow: '0px 0px 8px rgba(0,0,0,0.1)',
                                    display: 'none',
                                    cursor: 'grab',
                                    touchAction: 'none',
                                    userSelect: 'none',
                                    overflow: 'hidden',
                                }}>
                                <svg id="minimap" width="100%" height="100%">
                                    <defs>
                                        <clipPath id="minimap-clip">
                                            <rect id="minimap-clip-rect" x="0" y="0" width="100%" height="100%" />
                                        </clipPath>
                                    </defs>
                                    <g id="minimap-clip-group" clipPath="url(#minimap-clip)">
                                        <g id="minimap-inner">
                                            <g id="minimap-links"></g>
                                            <g id="minimap-nodes"></g>
                                        </g>
                                    </g>
                                </svg>
                                <button className="minimap-zoom btn greyBtn" onClick={zoomToNeighborhood}>Zoom</button>
                                <button className="minimap-collapse btn" title="Collapse" onClick={() => {collapseMinimap();setZoomClosed(true)}}>
                                    <FontAwesomeIcon icon={faCaretRight} />
                                </button>
                            </div>,
                            document.body
                        )}  
                    </div>
                </div>
            </div>     
        )
    }

    export default SideBar;