import React, { useEffect, useState, useMemo } from 'react';
import { Navigate, Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import CryptoJS from "crypto-js";
import Header from './components/header'
import Visualization from './components/visualization'
import * as d3 from "d3";
import po from './po.js';
import { UMAP } from 'umap-js';

function App() {
  const color = {
    darkpurple: '#170540',
    mediumpurple: '#765ab6',
    purple: '#a790e2',
    lightpurple: '#e3def1',
    background: '#EBECED',
    lightbackground: '#EBECED90',
    darkbackground: '#c9d0d670',
    text: '#21295C',
    textmedium: '#717185',
    textlight: '#191a1c85',
    textlightest: '#c0c0c9',
    grey: '#c2cad1',
    greylight: '#ccd3d8',
    blue: '#4A0EE0'
  }
  const { urlCode } = useParams()
  const location = useLocation()
  const root = location.pathname.slice(1)
  const [loaded,setLoaded] = useState(false)
  const [selectedConcepts,setSelectedConcepts] = useState([])
  const [sidebarRoot,setSidebarRoot] = useState()
  const [graphFilter, setGraphFilter] = useState({gender:-1,age:[-1]})
  const [extent,setExtent] = useState()
  const [rootData,setRootData] = useState([])
  const [mapRoot,setMapRoot] = useState([])
  const [conceptList, setConceptList] = useState([])
  const [nodes, setNodes] = useState([])
  const [links, setLinks] = useState([])
  const [list, setList] = useState([])
  const [view, setView] = useState('Tree')
  const [filteredList, setFilteredList] = useState()
  const [rootLine, setRootLine] = useState()
  const [listIndexes, setListIndexes] = useState()
  const [treeSelections, setTreeSelections] = useState(['descendants'])
  const [openFilters,setOpenFilters] = useState(true)
  const [levelFilter, setLevelFilter] = useState()
  const [classFilter, setClassFilter] = useState(['All'])
  const [pruned, setPruned] = useState(false)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [poset, setPoset] = useState()
  const [subsumesData, setsubsumesData] = useState()
  const [fullTree, setFullTree] = useState({})
  const [rootExtent, setRootExtent] = useState()
  const [crossConnections, setCrossConnections] = useState()
  const [drawingComplete, setDrawingComplete] = useState(true)
  const [initialPrune, setInitialPrune] = useState(true)
  const [apiInfo, setApiInfo] = useState()
  const [visible,setVisible] = useState(false)
  const [removedClasses,setRemovedClasses] = useState([])
  const [hovered,setHovered] = useState()
  const [colorList,setColorList] = useState([])
  const conceptNames = useMemo(() => selectedConcepts.map(d => d.name).filter((e,n,l) => l.indexOf(e) === n),[selectedConcepts])
  const allCounts = useMemo(() => selectedConcepts.map(d => d.data.code_counts).flat(),[selectedConcepts])
  const maxLevel = useMemo(() => d3.max(nodes.filter(d => d.levels !== '-1').map(d => parseInt(d.levels.split('-')[0]))),[nodes])
  const fullTreeMax = useMemo(() => sidebarRoot ? d3.max(sidebarRoot.data.concept_relationships.filter(d => d.levels !== "Mapped from" && d.levels !== "Maps to" && d.levels !== "-1").map(d => parseInt(d.levels.split('-')[0]))) : null,[sidebarRoot])
  const allClasses = useMemo(() => sidebarRoot ? sidebarRoot.data.concept_relationships.filter(d => d.levels !== "Mapped from" && d.levels !== "Maps to").filter(d => levelFilter === undefined || (d.levels === '-1' || parseInt(d.levels.split('-')[0]) <= levelFilter)).map(d => d.concept_class_id).filter((e,n,l) => l.indexOf(e) === n).filter(d => d !== undefined) : null,[sidebarRoot,levelFilter])
  const years = useMemo(() => extent ? Array.from({ length: extent[1] - extent[0] + 1 }, (_, i) => extent[0] + i) : null,[extent])
  // let timer = null

  async function sendFeedback(text) {
    const response = await fetch('http://127.0.0.1:8585/sendFeedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ feedback: text }) 
    })
    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    return response.json().catch(() => ({}))
  }

  // update root line
  useEffect(()=>{
    if (sidebarRoot) {
      let rootData = []
      if (graphFilter.gender !== -1 || graphFilter.age.length > 1) {
          rootData = sidebarRoot.data.stratified_code_counts
              .filter(e => e.concept_id === sidebarRoot.name)
              .filter(e => graphFilter.gender !== -1 && graphFilter.age.length > 1 ? e.gender_concept_id === graphFilter.gender && graphFilter.age.includes(e.age_decile) : graphFilter.gender !== -1 ? e.gender_concept_id === graphFilter.gender : graphFilter.age.includes(e.age_decile))
      } else rootData = sidebarRoot.data.stratified_code_counts.filter(e => e.concept_id === sidebarRoot.name)
      let rootLineData = d3.flatRollup(
        rootData,
        v => {return d3.sum(v, vv => vv['node_descendant_record_counts'])},
        d => d.concept_id,
        d => d.calendar_year
      )
      rootLineData.sort((a, b) => a[1] - b[1])
      rootLineData = d3.group(rootLineData, d => d[0])
      rootLineData.forEach(e => e.unshift([e[0][0], e[0][1] - 1, 0]))
      setRootLine(rootLineData)  
    }
  },[graphFilter])

  const filteredCounts = useMemo(() => {
    if (graphFilter.gender !== -1 || graphFilter.age.length > 1) {
      let filtered = allCounts.filter(e => graphFilter.gender !== -1 && graphFilter.age.length > 1 ? e.gender_concept_id === graphFilter.gender && graphFilter.age.includes(e.age_decile) : graphFilter.gender !== -1 ? e.gender_concept_id === graphFilter.gender : graphFilter.age.includes(e.age_decile))
      return filtered
    } else {return allCounts}
  },[allCounts,graphFilter])

  const stackData = useMemo(() => {
    if (!filteredCounts || filteredCounts.length === 0) return []
    else {
      const rollupMap = new Map()
      for (const row of filteredCounts) {
        const year = row.calendar_year
        const id = row.concept_id
        const key = `${year}__${id}`
        const current = rollupMap.get(key) ?? 0
        const value = selectedConcepts.filter(d => d.name === id)[0].leaf ? row['node_descendant_record_counts'] : row['node_record_counts']
        rollupMap.set(key, current + value)
      }
      const yearConceptMap = new Map()
      for (const [key, value] of rollupMap.entries()) {
        const [year, id] = key.split('__')
        const y = +year
        if (!yearConceptMap.has(y)) yearConceptMap.set(y, {})
        yearConceptMap.get(y)[id] = value
      }
      const conceptNames = selectedConcepts.map(d => d.name)
      const allYears = new Set([...years, ...yearConceptMap.keys()])
      const finalData = Array.from(allYears).map(year => {
        const row = yearConceptMap.get(year) || {}
        const filled = {}
        for (const name of conceptNames) {
          filled[name] = row[name] ?? 0
        }
        return { ...filled, year }
      })
      return finalData.sort((a, b) => a.year - b.year)  
    }
  },[filteredCounts])

  // filter selected concepts for duplicate ids?
  const genderData = useMemo(() => {
    let genderDataVar = []
    const genders = [8507,8532]
    let sums = []
    genders.forEach(g => selectedConcepts.forEach(d => sums.push({id: g, sum: d.leaf ? getCounts(d.data.code_counts.filter(e => (e.calendar_year >= extent[0] && e.calendar_year <= extent[1])).filter(e => e.gender_concept_id === g),'node_descendant_record_counts') : getCounts(d.data.code_counts.filter(e => (e.calendar_year >= extent[0] && e.calendar_year <= extent[1])).filter(e => e.gender_concept_id === g),'node_record_counts')})))
    genders.forEach(g => genderDataVar.push({id:g, sum:d3.sum(sums.filter(d => d.id === g).map(d => d.sum))}))
    return genderDataVar
  },[filteredCounts,extent])
  const ageData = useMemo(() => {
    let ageDataVar = []
    const ages = [0,1,2,3,4,5,6,7,8,9]
    let ageSums = []
    ages.forEach(a => selectedConcepts.forEach(d => ageSums.push({id: a, sum: d.leaf ? getCounts(d.data.code_counts.filter(e => (e.calendar_year >= extent[0] && e.calendar_year <= extent[1])).filter(e => e.age_decile === a),'node_descendant_record_counts') : getCounts(d.data.code_counts.filter(e => (e.calendar_year >= extent[0] && e.calendar_year <= extent[1])).filter(e => e.age_decile === a),'node_record_counts')})))
    ages.forEach(a => ageDataVar.push({id:a, sum: d3.sum(ageSums.filter(d => d.id === a).map(d => d.sum))}))
    return ageDataVar
  },[filteredCounts,extent])

  const maxGender = useMemo(() => {return genderData.reduce((max, obj) => obj.sum > max.sum ? obj : max).id},[genderData])

  function generateColor(id) {
    const hash = CryptoJS.MD5(id.toString()).toString()
    const hashSubstr = hash.substring(0, 6)
    const hexColor = '#' + hashSubstr
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
        if (result) {
            const r = parseInt(result[1], 16)
            const g = parseInt(result[2], 16)
            const b = parseInt(result[3], 16)
            return `rgb(${r}, ${g}, ${b})`
        }
        return null
    }
    return hexToRgb(hexColor)
  }
  function getCounts(data,col) {
    let sum = 0;
    data.forEach(d => sum += d[col])
    return sum
  }
  function reset() {
    d3.select("#graph-section").style('width', "60vw")
    d3.select('#expand').style('display', 'block') 
    d3.select('#compress').style('display', 'none') 
    setGraphFilter({gender:-1,age:[-1]})
    setClassFilter(rootData.concept_relationships.filter(d => d.levels !== "Mapped from" && d.levels !== "Maps to").map(d => d.concept_class_id).filter((e,n,l) => l.indexOf(e) === n).filter(d => d !== undefined))
    setSidebarRoot({name:root,data:rootData}) 
    setView('Tree')
    setTreeSelections(['descendants'])
    setLevelFilter()
    setOpenFilters(true)
    setMapRoot([])
  }
  function createInitialStates(root,data,prune,filterClass) {
    // set descendant count line
    const rootData = data.stratified_code_counts.filter(e => e.concept_id === parseInt(root))
    const rootExtentData = d3.extent(rootData.map(d => d.calendar_year))
    let rootLineData = d3.flatRollup(
        rootData,
        v => {return d3.sum(v, vv => vv['node_descendant_record_counts'])},
        d => d.concept_id,
        d => d.calendar_year
    )
    rootLineData.sort((a, b) => a[1] - b[1])
    rootLineData = d3.group(rootLineData, d => d[0])
    rootLineData.forEach(e => e.unshift([e[0][0], e[0][1] - 1, 0]))
    setRootExtent(rootExtentData)
    setRootLine(rootLineData)
    // set nodes 
    const subsumesData = data.concept_relationships.filter(d => d.levels !== "Mapped from" && d.levels !== "Maps to")
      // .filter(d => !prune || (d.levels === '-1' || parseInt(d.levels.split('-')[0]) <= 2))
    const mappingData = data.concept_relationships.filter(d => d.levels === "Mapped from" || d.levels === "Maps to")
    let nodeData = subsumesData.map(({parent_concept_id, ...rest }) => rest).filter((obj, index, self) => index === self.findIndex(o => o.child_concept_id === obj.child_concept_id))
      .map(e=>({
          'name': e.child_concept_id, 
          'distance': subsumesData.map(d => d.levels).includes('-1') ? e.levels === "-1" ? 0 : parseInt(e.levels.split('-')[0]) + 1 : parseInt(e.levels.split('-')[0]), 
          'levels': e.levels,
          'relationship': e.levels,
          'class': e.concept_class_id,
          'color': generateColor(e.child_concept_id),
          'leaf': !subsumesData.map(d => d.parent_concept_id).includes(e.child_concept_id) ? true : false,
          'parents': e.child_concept_id === parseInt(root) ? subsumesData.filter(d => d.levels === "-1").map(d => d.child_concept_id) : e.levels === "-1" ? [] : subsumesData.filter(d => d.child_concept_id === e.child_concept_id).map(d => d.parent_concept_id).filter(p => parseInt(e.levels.split('-')[0]) > parseInt(subsumesData.filter(n => n.child_concept_id === p)[0].levels.split('-')[0])),
          'children': e.levels === "-1" ? [parseInt(root)] : subsumesData.filter(d => d.parent_concept_id === e.child_concept_id && d.child_concept_id !== e.child_concept_id).map(d => d.child_concept_id),
          'connections': [],
          'total_counts': data.concepts.filter(d => d.concept_id === e.child_concept_id)[0].record_counts || 0,
          'descendant_counts': data.concepts.filter(d => d.concept_id === e.child_concept_id)[0].descendant_record_counts || 0,
          'data': {code_counts: data.stratified_code_counts.filter(d => d.concept_id === e.child_concept_id), concept: data.concepts.filter(d => d.concept_id === e.child_concept_id)[0]}
      })) 
    // set selected
    const selectedNodes = nodeData
      .filter(d => d.levels !== '-1')
      .filter(d => !d.leaf ? d.total_counts !== 0 : d.descendant_counts !== 0)
      .map(d => ({name: d.name, leaf: d.leaf, distance: d.distance, data: d.data}))
    selectedNodes.sort((a,b) => d3.ascending(a.distance, b.distance))
    setSelectedConcepts(selectedNodes)
    // set extent
    let extentData = d3.extent(selectedNodes.map(d => d.data.code_counts).flat().map(d => d.calendar_year))
    if (!extentData[0] || !extentData[1]) extentData = rootExtentData
    setExtent(extentData)
    // set cross connections 
    const allNodes = subsumesData
      .filter(d => d.parent_concept_id !== d.child_concept_id)
      .map(d => d.levels === "-1" ? ({...d, parent_concept_id: d.child_concept_id, child_concept_id: d.parent_concept_id}) : d)
    const allChildren = allNodes
      .map(d => d.child_concept_id)
      .filter((e,n,l) => l.indexOf(e) === n)
    let connections = []
    allChildren.forEach(child => allNodes.filter(d => d.child_concept_id === child).length > 1 ? connections.push({child:child,parents:allNodes.filter(d => d.child_concept_id === child).map(d => d.parent_concept_id)}) : null)
    setCrossConnections(connections)
    // set poset
    const edges = subsumesData
      .filter(d => subsumesData.length === 1 && d.parent_concept_id === d.child_concept_id ? d : d.parent_concept_id !== d.child_concept_id)
      .map(d => d.levels === "-1" ? ({...d,parent_concept_id: d.child_concept_id,child_concept_id: d.parent_concept_id}) : d)
      .map(d => ([d.child_concept_id.toString(),d.parent_concept_id.toString()]))
    const {matrix,nodes} = po.domFromEdges(edges)
    const poset = po.createPoset(matrix,nodes)
    poset
      .enrich()
      .feature("depth",node => nodeData.filter(d => d.name === parseInt(node))[0].distance)
      .setSubstructure("depth","depth")
      .setLayers()
      .feature("parents",node => nodeData.filter(d => d.name === parseInt(node))[0].parents)
      // .climber(function(_,h,d) {
      //   const layer = poset.layers[h]
      //   // console.log('layer correct',layer)
      //   const center = width/2
      //   if (h === 0) {
      //     let unit = width/layer.length
      //     let adjustment = layer.length % 2 !== 0 ? 0 : nodeWidth/2
      //     let median = Math.floor(layer.length/2) 
      //     poset.layers[h].forEach((node,i) => poset.features[node].x = unit >= nodeWidth ? unit*i + unit/2 : i >= median ? center + ((i - median) * nodeWidth) + adjustment : center - ((median - i) * nodeWidth) + adjustment)
      //   } else {
      //     let xPositions = []
      //     let unit = width/layer.length
      //     let adjustment = layer.length % 2 !== 0 ? 0 : nodeWidth/2
      //     let median = Math.floor(layer.length/2) 
      //     poset.layers[h].forEach(node => xPositions.push({id:node,x:d3.sum(poset.features[node].parents.map(parent => poset.features[parent].x))/poset.features[node].parents.length}))
      //     xPositions.sort((a, b) => d3.ascending(a.x, b.x))
      //     let minDistance = d3.min(d3.pairs(xPositions, (a, b) => b.x - a.x))
      //     if (minDistance < nodeWidth && layer.length > 1) {
      //         poset.layers[h].forEach(node => poset.features[node].x = unit >= nodeWidth ? unit*xPositions.findIndex(d => d.id === node) + unit/2 : xPositions.findIndex(d => d.id === node) >= median ? center + ((xPositions.findIndex(d => d.id === node) - median) * nodeWidth) + adjustment : center - ((median - xPositions.findIndex(d => d.id === node)) * nodeWidth) + adjustment)
      //     } else poset.layers[h].forEach(node => poset.features[node].x = xPositions.find(d => d.id === node)?.x)
      //   }
      // })
      .print('poset')
    // set x
    const width = window.innerWidth*0.4
    const nodeWidth = mappingData.map(d => d.levels).includes('Maps to') && mappingData.map(d => d.levels).includes('Mapped from') ? 120 : 100
    const layers = poset.analytics.substructures.depth
    layers.forEach((layer,i) => {
      const center = width/2
      if (i === 0) {
        let unit = width/layer.length
        let adjustment = layer.length % 2 !== 0 ? 0 : nodeWidth/2
        let median = Math.floor(layer.length/2) 
        layer.forEach((node,i) => poset.features[node].x = unit >= nodeWidth ? unit*i + unit/2 : i >= median ? center + ((i - median) * nodeWidth) + adjustment : center - ((median - i) * nodeWidth) + adjustment)
      } else {
        let xPositions = []
        let unit = width/layer.length
        let adjustment = layer.length % 2 !== 0 ? 0 : nodeWidth/2
        let median = Math.floor(layer.length/2) 
        layer.forEach(node => xPositions.push({id:node,x:d3.sum(poset.features[node].parents.map(parent => poset.features[parent].x))/poset.features[node].parents.length}))
        xPositions.sort((a, b) => d3.ascending(a.x, b.x))
        let minDistance = d3.min(d3.pairs(xPositions, (a, b) => b.x - a.x))
        if (minDistance < nodeWidth && layer.length > 1) {
          layer.forEach(node => poset.features[node].x = unit >= nodeWidth ? unit*xPositions.findIndex(d => d.id === node) + unit/2 : xPositions.findIndex(d => d.id === node) >= median ? center + ((xPositions.findIndex(d => d.id === node) - median) * nodeWidth) + adjustment : center - ((median - xPositions.findIndex(d => d.id === node)) * nodeWidth) + adjustment)
        } else layer.forEach(node => poset.features[node].x = xPositions.find(d => d.id === node)?.x)
      }
    })
    // set color
    let colorPoset
    if (filterClass) {
      const edges = subsumesData
        .filter(d => d.concept_class_id !== 'Ingredient' && d.concept_class_id !== "Clinical Drug Comp")
        .filter(d => subsumesData.length === 1 && d.parent_concept_id === d.child_concept_id ? d : d.parent_concept_id !== d.child_concept_id)
        .map(d => d.levels === "-1" ? ({...d,parent_concept_id: d.child_concept_id,child_concept_id: d.parent_concept_id}) : d)
        .map(d => ([d.child_concept_id.toString(),d.parent_concept_id.toString()]))
      const {matrix,nodes} = po.domFromEdges(edges)
      colorPoset = po.createPoset(matrix,nodes)
    } else colorPoset = po.createPoset(matrix,nodes)
    colorPoset.enrich()
      .color(80,25,90)
    // update nodes
    const depthScale = d3.scaleLinear(d3.extent(nodeData.map(d => d.distance)), [5,80])
    nodeData = nodeData
      .map(d => ({...d,color:colorPoset.features[d.name] ? `hsl(${colorPoset.features[d.name].pTheta},${colorPoset.features[d.name].pAlpha*100}%,${depthScale(d.distance)}%)` : generateColor(d.name),x:poset.features[d.name].x}))
      .map(node => ({
          ...node,
          mappings: mappingData.filter(d => d.parent_concept_id === node.name).map(e=>({
              'name': e.child_concept_id,
              'direction': e.levels === "Mapped from" ? -1 : 1,
              'distance': node.distance,
              'source': node,
              'color': generateColor(e.child_concept_id),
              'total_counts': data.concepts.filter(d => d.concept_id === e.child_concept_id)[0].record_counts || 0,
              'descendant_counts': data.concepts.filter(d => d.concept_id === e.child_concept_id)[0].descendant_record_counts || 0,
              'data': {code_counts: data.stratified_code_counts.filter(d => d.concept_id === e.child_concept_id),concept: data.concepts.filter(d => d.concept_id === e.child_concept_id)[0]}
              })).sort((a, b) => b.total_counts - a.total_counts)
      }))
    // set color list
    const colors = {}
    nodeData.forEach(node => colors[node.name] = node.color)
    setColorList(colors)
    // set links
    const nodeNames = nodeData.map(d => d.name)
    const linkData = subsumesData.filter(d => d.parent_concept_id !== d.child_concept_id).map(d=>({source: d.levels === "-1" ? nodeData[nodeNames.indexOf(d.child_concept_id)] : nodeData[nodeNames.indexOf(d.parent_concept_id)], target: d.levels === "-1" ? nodeData[nodeNames.indexOf(d.parent_concept_id)] : nodeData[nodeNames.indexOf(d.child_concept_id)]}))
    // set states
    setPoset(poset)
    setPruned(false)
    setFullTree({nodes:nodeData,links:linkData,selected:selectedNodes,mappings:mappingData.map(d => d.child_concept_id)})
    if (!prune) {
      setNodes(nodeData)
      setLinks(linkData)
    } 
  }

  // on page load
  useEffect(()=>{
    console.log('run app')
    const params = new URLSearchParams(window.location.search)
    setLoaded(true)
    fetch(`http://127.0.0.1:8585/getAPIInfo`)
      .then(res=> res.json())
      .then(data=>{
        setApiInfo(data)
      })
    fetch(`http://127.0.0.1:8585/getListOfConcepts`)
      .then(res=> res.json())
      .then(data=>{
        setConceptList(data)
        setFilteredList(data)
      })
  }, [])

  // on root load
  useEffect(()=>{
    if (root) {
        // setDrawingComplete(true)
        // d3.select('#overlayBlock').style('pointer-events','all')
        const timer = setTimeout(() => {
            setLoading(true)
        }, 300)
        fetch(`http://127.0.0.1:8585/getCodeCounts?conceptId=${root}`)
            .then(res=> res.json())
            .then(data=>{
                console.log('root', root)
                console.log('data', data)
                if (!data.error) {
                    setRootData(data)
                    setSidebarRoot({name:parseInt(root),data:data}) 
                    setView('Tree') 
                    d3.select("#graph-section").style('width', "60vw")
                    d3.select('#expand').style('display', 'block') 
                    d3.select('#compress').style('display', 'none') 
                    setGraphFilter({gender:-1,age:[-1]})
                    let filterClass = false
                    let classList = data.concepts.map(d => d.concept_class_id).filter((e,n,l) => l.indexOf(e) === n).filter(d => d !== undefined)
                    if (classList.includes('Ingredient') || classList.includes('Clinical Drug Comp')) {
                      classList = classList.filter(d => d !== 'Ingredient' && d !== 'Clinical Drug Comp') 
                      filterClass = true
                      setClassFilter(classList) 
                    } else setClassFilter(['All'])
                    setTreeSelections(['descendants'])
                    setOpenFilters(true)
                    setHovered()
                    setMapRoot([])
                    setNodes([])
                    setLinks([])
                    setVisible(false)
                    let filterLevel = false
                    if (data.concepts.length > 900) {
                      filterLevel = true
                      setLevelFilter(2)
                    } else setLevelFilter()
                    const prune = filterLevel || filterClass ? true : false
                    setInitialPrune(!prune)
                    createInitialStates(root,data,prune,filterClass) 
                    setLoading(false)
                    clearTimeout(timer) 

                } else {
                    setLoading(true)
                    d3.select('#error-message').style('display','block')
                    d3.select('#loading-animation').style('visibility','hidden')
                    clearTimeout(timer) 
                }
            })
      }
  },[root])

  return ( loaded ?
    <div className = "App">
      {/* <div id = "overlayBlock"></div> */}
      <Header
        root = {root}
        rootData = {rootData}
        getCounts = {getCounts}
        // setRoot = {setRoot}
        reset = {reset}
        conceptList = {conceptList}
        filteredList = {filteredList}
        setFilteredList = {setFilteredList}
        listIndexes = {listIndexes}
        apiInfo = {apiInfo}
      /> 
      {loading && <div id = "loading" style={{ fontSize: '20px' }}>
        <div style = {{display: 'none',fontSize:16}} id = "error-message">Concept not found</div>
        <div id = "loading-animation" class="lds-grid" style = {{visibility: 'visible'}}><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
      </div>}
      <div id = "content" style={{ visibility: loading ? 'hidden' : 'visible',opacity: loading ? 0 : 1 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/" replace />} />
          <Route path="/:urlCode" element={
            <Visualization
              color = {color}
              root = {root}
              // setRoot = {setRoot}
              generateColor = {generateColor}
              // getValidity = {getValidity}
              selectedConcepts = {selectedConcepts}
              setSelectedConcepts = {setSelectedConcepts}
              sidebarRoot = {sidebarRoot}
              setSidebarRoot = {setSidebarRoot}
              graphFilter = {graphFilter}
              setGraphFilter = {setGraphFilter}
              extent = {extent}
              setExtent = {setExtent}
              rootData = {rootData}
              setRootData = {setRootData}
              stackData = {stackData}
              conceptNames = {conceptNames}
              view = {view}
              setView = {setView}
              mapRoot = {mapRoot}
              setMapRoot = {setMapRoot}
              nodes = {nodes}
              links = {links}
              setNodes = {setNodes}
              setLinks = {setLinks}
              list = {list}
              rootLine = {rootLine}
              setRootLine = {setRootLine}
              treeSelections = {treeSelections}
              setTreeSelections = {setTreeSelections}
              levelFilter = {levelFilter}
              setLevelFilter = {setLevelFilter}
              maxLevel = {maxLevel}
              fullTreeMax = {fullTreeMax}
              allClasses = {allClasses}
              classFilter = {classFilter}
              setClassFilter = {setClassFilter}
              openFilters = {openFilters}
              setOpenFilters = {setOpenFilters}
              pruned = {pruned}
              setPruned = {setPruned}
              ageData = {ageData}
              genderData = {genderData}
              maxGender = {maxGender}
              // getConceptInfo = {getConceptInfo}
              setLoading = {setLoading}
              poset = {poset}
              setPoset = {setPoset}
              subsumesData = {subsumesData}
              setsubsumesData = {setsubsumesData}
              fullTree = {fullTree}
              crossConnections = {crossConnections}
              rootExtent = {rootExtent}
              filteredCounts = {filteredCounts}
              drawingComplete = {drawingComplete}
              setDrawingComplete = {setDrawingComplete}
              sendFeedback = {sendFeedback}
              initialPrune = {initialPrune}
              setInitialPrune = {setInitialPrune}
              visible = {visible}
              setVisible = {setVisible}
              removedClasses = {removedClasses}
              setRemovedClasses = {setRemovedClasses}
              hovered = {hovered}
              setHovered = {setHovered}
              colorList = {colorList}
            />      
          } />
        </Routes>
      </div>  
    </div> : null
  )
}

export default App;
