import React, { useEffect, useState, useMemo } from 'react';
import { Navigate, Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import finngen from './img/finngen_logo_dark.svg'
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
    darkbackground: '#c9d0d690',
    text: '#170540',
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
  const [view, setView] = useState('')
  const [filteredList, setFilteredList] = useState()
  const [rootLine, setRootLine] = useState()
  const [listIndexes, setListIndexes] = useState()
  const [treeSelections, setTreeSelections] = useState(['descendants'])
  const [openFilters,setOpenFilters] = useState(true)
  const [levelFilter, setLevelFilter] = useState()
  const [classFilter, setClassFilter] = useState(['All'])
  const [descendantsFilter, setDescendantsFilter] = useState([])
  const [excludeList, setExcludeList] = useState([])
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
  const [fullClassList,setFullClassList] = useState([])
  const [searchOnly, setSearchOnly] = useState(true)
  const [searchIsLoaded, setSearchIsLoaded] = useState()
  const [version, setVersion] = useState()
  const [allVocabularies, setAllVocabularies] = useState([])
  const [searchFilter, setSearchFilter] = useState([])
  const [rootArray,setRootArray] = useState()
  const [dataArray, setDataArray] = useState([])
  const [isConceptSet,setIsConceptSet] = useState(false)
  const [rootLabels, setRootLabels] = useState([])
  const [refresh,setRefresh] = useState(false)
  const conceptNames = useMemo(() => selectedConcepts.map(d => d.name).filter((e,n,l) => l.indexOf(e) === n),[selectedConcepts])
  const allCounts = useMemo(() => 
    {
      const counts = selectedConcepts.filter(d => !d.leaf).map(d => d.data.code_counts).flat()
      const descendantCounts = selectedConcepts.filter(d => d.leaf).map(d => ({name:d.name,counts:d.data.descendant_code_counts}))
      const allCounts = [...counts,...descendantCounts.map(d => d.counts).flat()]
      return {counts:counts,descendantCounts:descendantCounts,all:allCounts}
    }
  ,[selectedConcepts])
  const maxLevel = useMemo(() => d3.max(nodes.filter(d => d.levels !== '-1').map(d => parseInt(d.levels.split('-')[0]))),[nodes])
  const fullTreeMax = useMemo(() => sidebarRoot ? d3.max(sidebarRoot.data.concept_relationships.filter(d => d.levels !== "Mapped from" && d.levels !== "Maps to" && d.levels !== "-1").map(d => parseInt(d.levels.split('-')[0]))) : null,[sidebarRoot])
  const allClasses = useMemo(() => sidebarRoot ? sidebarRoot.data.concept_relationships.filter(d => d.levels !== "Mapped from" && d.levels !== "Maps to").filter(d => levelFilter === undefined || (d.levels === '-1' || parseInt(d.levels.split('-')[0]) <= levelFilter)).map(d => d.concept_class_id).filter((e,n,l) => l.indexOf(e) === n).filter(d => d !== undefined) : null,[sidebarRoot,levelFilter])
  const years = useMemo(() => extent ? Array.from({ length: extent[1] - extent[0] + 1 }, (_, i) => extent[0] + i) : null,[extent])
  // let timer = null

  async function sendFeedback(text) {
    const response = await fetch('http://127.0.0.1:8564/sendFeedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ feedback: text }) 
    })
    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    return response.json().catch(() => ({}))
  }
  const loadNews = async () => {
    const res = await fetch('/NEWS.md')
    const text = await res.text()
    const firstLine = text.split('\n')[0]
    const index = firstLine.indexOf('v')
    const version = index !== -1 ? firstLine.slice(index) : ""
    setVersion(version)
  }

  // update root line *** fix this ***
  // useEffect(()=>{
  //   if (sidebarRoot) {
  //     let rootData = []
  //     if (graphFilter.gender !== -1 || graphFilter.age.length > 1) {
  //         rootData = sidebarRoot.data.stratified_code_counts
  //             .filter(e => sidebarRoot.name.includes(e.concept_id))
  //             .filter(e => graphFilter.gender !== -1 && graphFilter.age.length > 1 ? e.gender_concept_id === graphFilter.gender && graphFilter.age.includes(e.age_decile) : graphFilter.gender !== -1 ? e.gender_concept_id === graphFilter.gender : graphFilter.age.includes(e.age_decile))
  //     } else rootData = sidebarRoot.data.stratified_code_counts.filter(e => sidebarRoot.name.includes(e.concept_id))
  //     let rootLineData = d3.flatRollup(
  //       rootData,
  //       v => {return d3.sum(v, vv => vv['node_descendant_record_counts'])},
  //       d => d.concept_id,
  //       d => d.calendar_year
  //     )
  //     rootLineData.sort((a, b) => a[1] - b[1])
  //     rootLineData = d3.group(rootLineData, d => d[0])
  //     rootLineData.forEach(e => e.unshift([e[0][0], e[0][1] - 1, 0]))
  //     setRootLine(rootLineData)  
  //   }
  // },[graphFilter])

  const filteredCounts = useMemo(() => {
    const countsObj = allCounts
    if (graphFilter.gender !== -1 || graphFilter.age.length > 1) {
      const counts = countsObj.counts.filter(e => graphFilter.gender !== -1 && graphFilter.age.length > 1 ? e.gender_concept_id === graphFilter.gender && graphFilter.age.includes(e.age_decile) : graphFilter.gender !== -1 ? e.gender_concept_id === graphFilter.gender : graphFilter.age.includes(e.age_decile))
      const descendantCounts = countsObj.descendantCounts.map(obj => ({...obj,counts:obj.counts.filter(e => graphFilter.gender !== -1 && graphFilter.age.length > 1 ? e.gender_concept_id === graphFilter.gender && graphFilter.age.includes(e.age_decile) : graphFilter.gender !== -1 ? e.gender_concept_id === graphFilter.gender : graphFilter.age.includes(e.age_decile))}))
      const allCounts = [...counts,...descendantCounts.map(d => d.counts).flat()]
      return {counts:counts,descendantCounts:descendantCounts,all:allCounts}
    } else {return allCounts}
  },[allCounts,graphFilter])

  const stackData = useMemo(() => {
    if (!filteredCounts || filteredCounts.all.length === 0) return []
    else {
      const rollupA = new Map()
      for (const row of filteredCounts.counts) {
        const year = row.calendar_year
        const id = row.concept_id
        const key = `${year}__${id}`
        const current = rollupA.get(key) ?? 0
        const value = row['node_record_counts']
        rollupA.set(key, current + value)
      }
      const rollupB = new Map()
      for (const item of filteredCounts.descendantCounts) {
        const id = item.name
        for (const row of item.counts) {
          const year = row.calendar_year
          const value = row.node_record_counts
          const key = `${year}__${id}`
          const current = rollupB.get(key) ?? 0
          rollupB.set(key, current + value)
        }
      }
      const rollupMap = new Map([...rollupA, ...rollupB])
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
  },[filteredCounts,classFilter])

  const genderData = useMemo(() => {
    let genderDataVar = []
    const genders = [8507,8532]
    let sums = []
    genders.forEach(g => selectedConcepts.forEach(d => sums.push({id: g, sum: d.leaf ? getCounts(d.data.descendant_code_counts.filter(e => (e.calendar_year >= extent[0] && e.calendar_year <= extent[1])).filter(e => e.gender_concept_id === g),'node_record_counts') : getCounts(d.data.code_counts.filter(e => (e.calendar_year >= extent[0] && e.calendar_year <= extent[1])).filter(e => e.gender_concept_id === g),'node_record_counts')})))
    genders.forEach(g => genderDataVar.push({id:g, sum:d3.sum(sums.filter(d => d.id === g).map(d => d.sum))}))
    return genderDataVar
  },[filteredCounts,extent])
  const ageData = useMemo(() => {
    let ageDataVar = []
    const ages = [0,1,2,3,4,5,6,7,8,9]
    let ageSums = []
    ages.forEach(a => selectedConcepts.forEach(d => ageSums.push({id: a, sum: d.leaf ? getCounts(d.data.descendant_code_counts.filter(e => (e.calendar_year >= extent[0] && e.calendar_year <= extent[1])).filter(e => e.age_decile === a),'node_record_counts') : getCounts(d.data.code_counts.filter(e => (e.calendar_year >= extent[0] && e.calendar_year <= extent[1])).filter(e => e.age_decile === a),'node_record_counts')})))
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
    setSidebarRoot({name:rootArray,data:rootData}) 
    if (rootArray.length > 1) setView('Set')
    else setView('Tree')
    setTreeSelections(['descendants'])
    setLevelFilter()
    setOpenFilters(true)
    setMapRoot([])
  }
  function getAllDescendants(data, rootParentId) {
    const graph = new Map()
    for (const {
      parent_concept_id,
      child_concept_id,
      levels
    } of data) {
      if (levels === "Mapped from" || levels === "Maps to" || levels === "-1") continue
      if (!graph.has(parent_concept_id)) graph.set(parent_concept_id, [])
      graph.get(parent_concept_id).push(child_concept_id)
    }
    const result = new Set()
    const visited = new Set()
    function dfs(parentId) {
      if (visited.has(parentId)) return
      visited.add(parentId)
      const children = graph.get(parentId) || []
      for (const childId of children) {
        if (!result.has(childId)) {
          result.add(childId)
          dfs(childId)
        }
      }
    }
    dfs(rootParentId)
    return Array.from(result)
  }

  function createInitialStates(data,trees,prune,filterClass) {
    // set descendant count line
    // const rootData = data.stratified_code_counts.filter(e => e.concept_id === parseInt(root))
    let rootDescendants = []
    rootArray.forEach(root => rootDescendants.push(...getAllDescendants(data.concept_relationships,root)))
    rootDescendants = rootDescendants.filter((e,n,l) => l.indexOf(e) === n).filter(d => data.concepts.filter(c => c.concept_id === d)[0].record_counts !== 0)
    const rootData = data.stratified_code_counts.filter(e => rootDescendants.includes(e.concept_id))
    const rootExtentData = d3.extent(rootData.map(d => d.calendar_year))
    let rootLineData = d3.flatRollup(
      rootData,
      v => d3.sum(v, d => d.node_record_counts),
      d => d.calendar_year
    )
    rootLineData.sort((a, b) => a[0] - b[0])
    // rootLineData = d3.group(rootLineData, d => d[0])
    // rootLineData.forEach(e => e.unshift([e[0][0], e[0][1] - 1, 0]))
    setRootExtent(rootExtentData)
    setRootLine(rootLineData)
    // set nodes 
    const relationships = Array.from(
      trees
        .flat()
        .reduce((map, e) => {
          const key = `${e.parent_concept_id}|${e.child_concept_id}`
          const existing = map.get(key)
          if (!existing || parseInt(e.levels.split('-')[0]) > parseInt(existing.levels.split('-')[0])) {
            map.set(key, e)
          }
          return map
        }, new Map())
        .values()
    )
    const subsumesData = relationships.filter(d => d.levels !== "Mapped from" && d.levels !== "Maps to")
      // .filter(d => !prune || (d.levels === '-1' || parseInt(d.levels.split('-')[0]) <= 2))
    const mappingData = relationships.filter(d => d.levels === "Mapped from" || d.levels === "Maps to")
    let nodeData = Array.from(
      subsumesData
      // .map(({ parent_concept_id, ...rest }) => rest)
      .reduce((map, obj) => {
        const existing = map.get(obj.child_concept_id)
        if (!existing || ((obj.levels === '-1' || existing.levels === '-1' && rootArray.includes(obj.child_concept_id)) ? parseInt(obj.levels) > parseInt(existing.levels) : parseInt(obj.levels.split('-')[0]) > parseInt(existing.levels.split('-')[0]))) {
          map.set(obj.child_concept_id, obj)
        }
        return map
      }, new Map())
      .values()
    )
    // .filter((obj, index, self) => index === self.findIndex(o => o.child_concept_id === obj.child_concept_id))
    nodeData = nodeData.map(e=>({
          'name': e.child_concept_id, 
          'distance': nodeData.map(d => d.levels).includes('-1') ? e.levels === "-1" ? 0 : parseInt(e.levels.split('-')[0]) + 1 : parseInt(e.levels.split('-')[0]), 
          'levels': e.levels,
          'relationship': e.levels,
          'class': e.concept_class_id,
          'color': generateColor(e.child_concept_id),
          'leaf': !subsumesData.map(d => d.parent_concept_id).includes(e.child_concept_id) ? true : false,
          'parents': rootArray.includes(e.child_concept_id) ? subsumesData.filter(d => d.parent_concept_id === e.child_concept_id).filter(d => d.levels === '-1' && !rootArray.includes(d.child_concept_id)).map(d => d.child_concept_id) : e.levels === "-1" ? [] : subsumesData.filter(d => d.child_concept_id === e.child_concept_id).map(d => d.parent_concept_id).filter(p => parseInt(e.levels.split('-')[0]) > parseInt(nodeData.filter(n => n.child_concept_id === p)[0].levels.split('-')[0])),
          'children': e.levels === "-1" ? subsumesData.filter(d => d.child_concept_id === e.child_concept_id).map(d => d.parent_concept_id) : subsumesData.filter(d => d.parent_concept_id === e.child_concept_id && d.child_concept_id !== e.child_concept_id).map(d => d.child_concept_id),
          'connections': [],
          'total_counts': data.concepts.filter(d => d.concept_id === e.child_concept_id)[0].record_counts || 0,
          'descendants': getAllDescendants(data.concept_relationships,e.child_concept_id).length > 0 ? getAllDescendants(data.concept_relationships,e.child_concept_id) : [e.child_concept_id],
          'descendant_counts': data.concepts.filter(d => d.concept_id === e.child_concept_id)[0].descendant_record_counts || 0,
          'data': {code_counts: data.stratified_code_counts.filter(d => d.concept_id === e.child_concept_id), concept: data.concepts.filter(d => d.concept_id === e.child_concept_id)[0]}
      })) 
    // set selected
    const selectedNodes = nodeData
      .filter(d => d.levels !== '-1')
      .filter(d => !d.leaf ? d.total_counts !== 0 : d.descendant_counts !== 0)
      .map(d => ({name: d.name, leaf: d.leaf, descendants: d.descendants, distance: d.distance, data: {...d.data,descendant_code_counts:data.stratified_code_counts.filter(c => d.descendants.includes(c.concept_id))}}))
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
    connections = connections.filter(d => d.parents.length > 1)
    setCrossConnections(connections)
    // posets
    const posetArray = []
    const width = window.innerWidth*0.4
    const nodeWidth = mappingData.map(d => d.levels).includes('Maps to') && mappingData.map(d => d.levels).includes('Mapped from') ? 160 : 140
    const depthScale = d3.scaleLinear(d3.extent(nodeData.map(d => d.distance)), [5,80])
    let colors = {}
    let positions = {}
    let distances = {}
    // iterate through trees
    trees.forEach((tree,index) => {
      const edges = tree
        .filter(d => d.levels !== "Mapped from" && d.levels !== "Maps to")
        .filter(d => subsumesData.length === 1 && d.parent_concept_id === d.child_concept_id ? d : d.parent_concept_id !== d.child_concept_id)
        // .filter(d => d.levels !== "-1")
        .map(d => d.levels === "-1" ? ({...d,parent_concept_id: d.child_concept_id,child_concept_id: d.parent_concept_id}) : d)
        .map(d => ([d.parent_concept_id.toString(),d.child_concept_id.toString()]))
      const {matrix,nodes} = po.domFromEdges(edges)
      const poset = po.createPoset(matrix,nodes)
      poset
        .enrich()
        .feature("depth",node => nodeData.filter(d => d.name === parseInt(node))[0].distance)
        .setSubstructure("depth","depth")
        .setLayers()
        .feature("parents",node => nodeData.filter(d => d.name === parseInt(node))[0].parents)
        .print()
      // set x
      // const layers = poset.analytics.substructures.depth
      const layers = poset.layers.reverse()
      // layers = layers.reverse()
      layers.forEach((layer,i) => {
        const center = (width/trees.length)/2 + (width)*index
        if (i === 0) {
          let unit = (width/trees.length)/layer.length
          let adjustment = layer.length % 2 !== 0 ? 0 : nodeWidth/2
          let median = Math.floor(layer.length/2) 
          layer.forEach((node,i) => poset.features[node].x = unit >= nodeWidth ? unit*i + unit/2 + (width)*index : i >= median ? center + ((i - median) * nodeWidth) + adjustment : center - ((median - i) * nodeWidth) + adjustment)
        } else {
          let xPositions = []
          let unit = (width/trees.length)/layer.length
          let adjustment = layer.length % 2 !== 0 ? 0 : nodeWidth/2
          let median = Math.floor(layer.length/2) 
          layer.forEach(node => {
            xPositions.push({id:node,x: d3.sum(poset.features[node].parents.map(parent => poset.features[parent].x))/poset.features[node].parents.length})})
          xPositions.sort((a, b) => d3.ascending(a.x, b.x))
          let minDistance = d3.min(d3.pairs(xPositions, (a, b) => b.x - a.x))
          if (minDistance < nodeWidth && layer.length > 1) {
            layer.forEach(node => poset.features[node].x = unit >= nodeWidth ? unit*xPositions.findIndex(d => d.id === node) + unit/2 + (width)*index : xPositions.findIndex(d => d.id === node) >= median ? center + ((xPositions.findIndex(d => d.id === node) - median) * nodeWidth) + adjustment : center - ((median - xPositions.findIndex(d => d.id === node)) * nodeWidth) + adjustment)
          } else layer.forEach(node => poset.features[node].x = xPositions.find(d => d.id === node)?.x)
        }
      })
      // set color
      let colorPoset
      if (filterClass) {
        const edges = tree
          .filter(d => d.levels !== "Mapped from" && d.levels !== "Maps to")
          .filter(d => d.concept_class_id !== 'Ingredient' && d.concept_class_id !== "Clinical Drug Comp")
          .filter(d => subsumesData.length === 1 && d.parent_concept_id === d.child_concept_id ? d : d.parent_concept_id !== d.child_concept_id)
          .map(d => d.levels === "-1" ? ({...d,parent_concept_id: d.child_concept_id,child_concept_id: d.parent_concept_id}) : d)
          .map(d => ([d.parent_concept_id.toString(),d.child_concept_id.toString()]))
        const {matrix,nodes} = po.domFromEdges(edges)
        colorPoset = po.createPoset(matrix,nodes)
      } else colorPoset = po.createPoset(matrix,nodes)
      colorPoset.enrich()
        .color(80,25,90)
      // set color and positions list
      poset.elements.forEach(name => {
        colors[name] = `hsl(${colorPoset.features[name].pTheta},${colorPoset.features[name].pAlpha*100}%,${depthScale(poset.features[name].depth)}%)` 
        positions[name] = poset.features[name].x
        distances[name] = layers.findIndex(i => i.includes(name))
      })
      posetArray.push(poset)
    })
    nodeData = nodeData
      .map(d => ({...d,distance: distances[d.name], color: colors[d.name] ? colors[d.name] : d.color,x:positions[d.name]}))
      // .map(d => ({...d,color: colors[d.name] ? colors[d.name] : d.color,x:positions[d.name]}))
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
    nodeData.forEach(node => {
      node.mappings.forEach(map => colors[map.name] = map.color)
    })
    setColorList(colors)
    // set links
    const nodeNames = nodeData.map(d => d.name)
    const linkData = subsumesData.filter(d => d.parent_concept_id !== d.child_concept_id).map(d=>({...d, source: d.levels === "-1" ? nodeData[nodeNames.indexOf(d.child_concept_id)] : nodeData[nodeNames.indexOf(d.parent_concept_id)], target: d.levels === "-1" ? nodeData[nodeNames.indexOf(d.parent_concept_id)] : nodeData[nodeNames.indexOf(d.child_concept_id)]}))
    // set states
    setPoset(posetArray)
    setPruned(false)
    setFullTree({trees:trees,nodes:nodeData,links:linkData,selected:selectedNodes,mappings:mappingData.map(d => d.child_concept_id)})
    if (!prune) {
      setNodes(nodeData)
      setLinks(linkData)
    } 
  }

  function deepEqual(a, b) {
    if (a === b) return true
    if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
      return false
    }
    const keysA = Object.keys(a)
    const keysB = Object.keys(b)
    if (keysA.length !== keysB.length) return false
    return keysA.every(key =>
      keysB.includes(key) && deepEqual(a[key], b[key])
    )
  }

  // *** improve this ***
  function getTrees(arrays) {
    const result = []
    const isValidLevel = level => level !== 'Mapped from' && level !== 'Maps to'
    for (const arr of arrays) {
      const validChildIds = new Set(arr.filter(o => isValidLevel(o.levels)).map(o => o.child_concept_id))
      let merged = false
      for (const group of result) {
        const hasOverlap = [...validChildIds].some(id =>group.validChildIds.has(id))
        if (hasOverlap) {
          group.items.push(...arr)
          for (const obj of arr) {
            if (isValidLevel(obj.levels)) group.validChildIds.add(obj.child_concept_id)
          }
          merged = true
          break
        }
      }
      if (!merged) result.push({items: [...arr],validChildIds})
    }
    const trees = result.map(group => group.items)  
    return trees
  }

  // on page load
  useEffect(()=>{
    // console.log('run app')
    const params = new URLSearchParams(window.location.search)
    setLoaded(true)
    loadNews()
    fetch(`http://127.0.0.1:8564/getAPIInfo`)
      .then(res=> res.json())
      .then(data=>{
        setApiInfo(data)
      })
    fetch(`http://127.0.0.1:8564/getListOfConcepts`)
      .then(res=> res.json())
      .then(data=>{
        // console.log("concept list",data)
        const vocabList = data.map(d => d.vocabulary_id).filter((e,n,l) => l.indexOf(e) === n).filter(d => d !== undefined)
        setConceptList(data)
        setFilteredList(data)
        setAllVocabularies(vocabList)
        setLoading(true)
        // setTimeout(() => {
        //   setSearchIsLoaded(true)
        //   setLoading(false)
        // },3000)
      })
  }, [])

  // on concept list load
  useEffect(()=>{
    if (conceptList.length > 0) {
      setSearchIsLoaded(true)
      setLoading(false)
    }
  },[conceptList])

  // on root load
  useEffect(()=>{
    if (root) {
        setLoading(false)
        setSearchOnly(false)
        const timer = setTimeout(() => {
            setLoading(true)
        }, 300)
        const array = root.split(',').map(Number)
        if (array.length > 1 && !isConceptSet) setIsConceptSet(true)
        setRootArray(array)
        Promise.all(
          array.map(r =>
            fetch(`http://127.0.0.1:8564/getCodeCounts?conceptId=${r}`)
              .then(res => {
                if (!res.ok) {
                  throw new Error(`HTTP ${res.status} for conceptId ${r}`)
                }
                return res.json()
              })
          )
        )
        .then(data => {
          setDataArray(data)
          setLoading(false)
          clearTimeout(timer)
        })
        .catch(err => {
          console.error("Fetch failed:", err.message)
          setLoading(true)
          d3.select('#error-message').style('display','block')
          d3.select('#loading-animation').style('visibility','hidden')
          clearTimeout(timer)
        })
      }
  },[root])

  // on data load
  useEffect(()=>{
    if (dataArray.length > 0) {
      let trees = [dataArray[0].concept_relationships]
      let combinedData = dataArray[0]
      if (dataArray.length > 1) {
          const arrays = dataArray.map(d => d.concept_relationships)
          trees = getTrees(arrays)
          combinedData.concept_relationships = dataArray.map(d => d.concept_relationships).flat().filter((e, i, a) => a.findIndex(x => deepEqual(x, e)) === i)
          combinedData.concepts = dataArray.map(d => d.concepts).flat().filter((e, i, a) => a.findIndex(x => deepEqual(x, e)) === i)
          // *** filter duplicate counts ***
          combinedData.stratified_code_counts = dataArray.map(d => d.stratified_code_counts).flat()
      } 
      setRootData(combinedData)
      setSidebarRoot({name:rootArray,data:combinedData}) 
      setRootLabels(rootArray.map(root => ({name:combinedData.concepts.find(e=>e.concept_id === root).concept_name,code:combinedData.concepts.find(e=>e.concept_id === root).concept_code,vocabulary:combinedData.concepts.find(e=>e.concept_id === root).vocabulary_id})))
      if (d3.select('#suggestions-container').style('visibility') === 'hidden') setRefresh(true)
      if (rootArray.length > 1) setView('Set')
      else setView('Tree')
      d3.select("#graph-section").style('width', "60vw")
      d3.select('#expand').style('display', 'block') 
      d3.select('#compress').style('display', 'none') 
      setGraphFilter({gender:-1,age:[-1]})
      let filterClass = false
      let classList = combinedData.concept_relationships.filter(d => d.levels !== "Mapped from" && d.levels !== "Maps to").map(d => d.concept_class_id).filter((e,n,l) => l.indexOf(e) === n).filter(d => d !== undefined)
      const thisClass = combinedData.concepts.filter(d => rootArray.includes(d.concept_id)).map(d => d.concept_class_id).filter((e,n,l) => l.indexOf(e) === n).filter(d => d !== undefined)
      setFullClassList(classList)
      if ((!thisClass.includes('Ingredient') && !thisClass.includes('Clinical Drug Comp')) && (classList.includes('Ingredient') || classList.includes('Clinical Drug Comp'))) {
        const filteredClassList = classList.filter(d => d !== 'Ingredient' && d !== 'Clinical Drug Comp') 
        setRemovedClasses(classList.filter(d => d === "Ingredient" || d === 'Clinical Drug Comp'))
        filterClass = true
        setClassFilter(filteredClassList) 
      } else setClassFilter(['All'])
      setTreeSelections(['descendants'])
      setOpenFilters(true)
      setHovered()
      // setMapRoot([])
      setNodes([])
      setLinks([])
      setVisible(false)
      let filterLevel = false
      if (combinedData.concepts.length > 900) {
        filterLevel = true
        setLevelFilter(2)
      } else setLevelFilter()
      const prune = filterLevel || filterClass ? true : false
      setInitialPrune(!prune)
      createInitialStates(combinedData,trees,prune,filterClass)  
    }
  },[dataArray])

  useEffect(() => {
    d3.select('#search-root-container').selectAll('.search-root').data(rootLabels, d => d.name)
      .join(enter => {
          const div = enter.append('div')
              .classed('search-root',true)
          const p = div.append('p')
              .classed('search-root-name',true)
              .html(d => d.name.length > 20 ? d.name.substring(0, 20) + '...' : d.name)
          p.append('span')
            .classed('search-root-code',true)
              .html(d => d.code)
              .style('margin-left','4px')
              .style('font-size','10px')
              .style('font-weight',700)
              .style('color','white')
          p.append('span')
            .classed('search-root-vocab',true)
              .html(d => d.vocabulary)
              .style('margin-left','4px')
              .style('font-size','10px')
              .style('font-weight',400)
              .style('color','ffffff80')
      })
  }, [rootLabels])

  return ( loaded ?
    <div className = "App">
      {/* <div id = "overlayBlock"></div> */}
      <Header
        color = {color}
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
        searchIsLoaded = {searchIsLoaded}
        version = {version}
        allVocabularies = {allVocabularies}
        searchFilter = {searchFilter}
        setSearchFilter = {setSearchFilter}
        isConceptSet = {isConceptSet}
        setIsConceptSet = {setIsConceptSet}
        refresh = {refresh}
        setRefresh = {setRefresh}
      />
      {(searchIsLoaded && searchOnly) && <div className = "loading">
        <img style = {{width:60,opacity: 0.2}} src={finngen} alt="Finngen logo"/>
      </div>}
      {loading && <div className = "loading" style={{ fontSize: '20px' }}>
        <div style = {{display: 'none',fontSize:16}} id = "error-message">Concept not found</div>
        <div id = "loading-animation" class="lds-grid" style = {{visibility: 'visible'}}><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
      </div>}
      <div id = "content" style={{ visibility: loading ? 'hidden' : 'visible',opacity: loading ? 0 : 1 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/" replace />} />
          <Route path="/:urlCode" element={
            <Visualization
              color = {color}
              // setRoot = {setRoot}
              generateColor = {generateColor}
              getTrees = {getTrees}
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
              fullClassList = {fullClassList}
              descendantsFilter = {descendantsFilter}
              setDescendantsFilter = {setDescendantsFilter}
              excludeList = {excludeList}
              setExcludeList = {setExcludeList}
            />      
          } />
        </Routes>
      </div>  
    </div> : null
  )
}

export default App;
