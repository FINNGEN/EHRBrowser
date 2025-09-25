import React, { useEffect, useState, useMemo } from 'react';
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
    lightpurple: '#e8e4f3',
    background: '#eaeaec',
    lightbackground: '#EAEAEC90',
    darkbackground: '#e0e0e4',
    text: '#253B59',
    textlight: '#213c5c85',
    textlightest: '#213c5c65',
    grey: '#d4d9df',
  }
  const [root,setRoot] = useState()
  const [loaded,setLoaded] = useState(false)
  const [selectedConcepts,setSelectedConcepts] = useState([])
  const [sidebarRoot,setSidebarRoot] = useState()
  const [graphFilter, setGraphFilter] = useState({gender:-1,age:[-1]})
  const [extent,setExtent] = useState()
  const [rootData,setRootData] = useState([])
  const [mapRoot,setMapRoot] = useState()
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
  const [classFilter, setClassFilter] = useState([])

  // fetch data
  async function getData(id) {
    console.log('get',id)
    const res = await fetch(`http://127.0.0.1:8585/getCodeCounts?conceptId=${id}`)
    const data = await res.json()
    console.log('data',data)
    setOpenFilters(true)
    return data
  }

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

  const conceptNames = useMemo(() => selectedConcepts.map(d => d.name),[selectedConcepts])
  const allCounts = useMemo(() => selectedConcepts.map(d => d.data.code_counts).flat(),[selectedConcepts])
  const maxLevel = useMemo(() => d3.max(nodes.filter(d => d.levels !== '-1').map(d => parseInt(d.levels.split('-')[0]))),[nodes])
  const fullTreeMax = useMemo(() => sidebarRoot ? d3.max(sidebarRoot.data.concept_relationships.filter(d => d.levels !== "Mapped from" && d.levels !== "Maps to" && d.levels !== "-1").map(d => parseInt(d.levels.split('-')[0]))) : null,[sidebarRoot])
  const allClasses = useMemo(() => sidebarRoot ? sidebarRoot.data.concept_relationships.filter(d => d.levels !== "Mapped from" && d.levels !== "Maps to").map(d => d.concept_class_id).filter((e,n,l) => l.indexOf(e) === n) : null,[sidebarRoot])
  const years = useMemo(() => extent ? Array.from({ length: extent[1] - extent[0] + 1 }, (_, i) => extent[0] + i) : null,[extent])

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

  function getCounts(data,col) {
    let sum = 0;
    data.forEach(d => sum += d[col])
    return sum
  }
  function getConceptInfo(id) {
    return sidebarRoot.data.concepts.filter(d => d.concept_id === id)[0]
  }
  function reset() {
    d3.select("#graph-section").style('width', "60vw")
    d3.select('#expand').style('display', 'block') 
    d3.select('#compress').style('display', 'none') 
    setGraphFilter({gender:-1,age:[-1]})
    setSidebarRoot({name:root,data:rootData}) 
    setView('Tree')
    setTreeSelections(['descendants'])
    setLevelFilter()
    setClassFilter([])
    setOpenFilters(true)
  }

  // on load
  useEffect(()=>{
    console.log('run app')
    const params = new URLSearchParams(window.location.search)
    const conceptId = params.get('conceptIds')
    setLoaded(true)
    setRoot(conceptId ? parseInt(conceptId) : null)
    fetch(`http://127.0.0.1:8585/getListOfConcepts`)
      .then(res=> res.json())
      .then(data=>{
        console.log('list of concepts',data)
          // let sortedData = data.sort((a,b) => a.concept_name.toLowerCase().localeCompare(b.concept_name.toLowerCase()))
          // let sortedNames = data.sort((a,b) => a.concept_name.toLowerCase().localeCompare(b.concept_name.toLowerCase()))
          // let sortedIds = data.sort((a,b) => parseInt(a.concept_id.toString().slice(0, 2), 10) - parseInt(b.concept_id.toString().slice(0, 2), 10))
          // // let sortedCodes = data.sort((a,b) => parseInt(a.concept_code.toString()[0]) - parseInt(b.concept_code.toString()[0]))
          // let indexObj = {}
          // let idIndexObj = {}
          // const seen = new Set()
          // sortedData.forEach((item, index) => {
          //   const firstLetter = item.concept_name[0].toLowerCase()
          //   if (!seen.has(firstLetter)) {
          //     indexObj[firstLetter] = index
          //     seen.add(firstLetter)
          //   }
          // })
          // sortedIds.forEach((item, index) => {
          //   const firstNumber = parseInt(item.concept_id.toString().slice(0, 2), 10)
          //   if (!seen.has(firstNumber)) {
          //     idIndexObj[firstNumber] = index
          //     seen.add(firstNumber)
          //   }
          // })
          // setListIndexes(indexObj)
          // setConceptList(sortedData)
          // setFilteredList(sortedData)
          setConceptList(data)
          setFilteredList(data)
      })
  }, [])

  // set sidebar states
  useEffect(()=>{
    if (sidebarRoot) {
      let rootLineData = d3.flatRollup(
        sidebarRoot.data.stratified_code_counts.filter(e => e.concept_id === sidebarRoot.name),
        v => {return d3.sum(v, vv => vv['node_descendant_record_counts'])},
        d => d.concept_id,
        d => d.calendar_year
      )
      rootLineData.sort((a, b) => a[1] - b[1])
      rootLineData = d3.group(rootLineData, d => d[0])
      rootLineData.forEach(e => e.unshift([e[0][0], e[0][1] - 1, 0]))
      setRootLine(rootLineData)
      setMapRoot('')
      const allNodes = sidebarRoot.data.concept_relationships.filter(d => d.levels !== "Mapped from" && d.levels !== "Maps to").filter(d => levelFilter === undefined || (d.levels === '-1' || parseInt(d.levels.split('-')[0]) <= levelFilter)).filter(d => !classFilter.length>0 || classFilter.includes(getConceptInfo(d.child_concept_id).concept_class_id))
      let selected = allNodes.filter(d => d.levels !== '-1' && getConceptInfo(d.child_concept_id).record_counts !== 0).map(d => d.child_concept_id).filter((e,n,l) => l.indexOf(e) === n)
      const mappings = sidebarRoot.data.concept_relationships.filter(d => d.levels === "Mapped from" || d.levels === "Maps to")
      const nodeList = allNodes.map(d => d.child_concept_id).filter((e,n,l) => l.indexOf(e) === n)
      selected = selected.map(d => ({name:d, leaf: !allNodes.map(d => d.parent_concept_id).includes(d) &&  allNodes.filter(d => d.child_concept_id === d)[0]?.levels !== "-1"? true : false, data: {code_counts: sidebarRoot.data.stratified_code_counts.filter(e => e.concept_id === d), concept: getConceptInfo(d)}}))
      setSelectedConcepts(selected)
      setExtent(d3.extent(selected.map(d => d.data.code_counts).flat().map(d => d.calendar_year)))
      // set nodes and links
      let listArray = nodeList.map(e=>({
          'name': e, 
          'distance': allNodes.map(d => d.levels).includes('-1') ? allNodes.filter(d => d.child_concept_id === e)[0].levels === "-1" ? 0 : parseInt(allNodes.filter(d => d.child_concept_id === e)[0].levels.split('-')[0]) + 1 : parseInt(allNodes.filter(d => d.child_concept_id === e)[0].levels.split('-')[0]), 
          'levels': allNodes.filter(d => d.child_concept_id === e)[0].levels,
          'class': allNodes.filter(d => d.child_concept_id === e)[0].concept_class_id,
          'color': generateColor(e),
          'leaf': !allNodes.map(d => d.parent_concept_id).includes(e) &&  allNodes.filter(d => d.child_concept_id === e)[0].levels !== "-1"? true : false,
          'total_counts': getConceptInfo(e).record_counts || 0,
          'descendant_counts': getConceptInfo(e).descendant_record_counts || 0,
          'data': {code_counts: sidebarRoot.data.stratified_code_counts.filter(d => d.concept_id === e), concept: getConceptInfo(e)},
          'relationship': allNodes.filter(d => d.child_concept_id === e)[0].levels
          })) 
      listArray = listArray.map(node => ({
          ...node,
          mappings: mappings.filter(d => d.parent_concept_id === node.name && getConceptInfo(d.child_concept_id).concept_name).map(e=>({
              'name': e.child_concept_id,
              'direction': e.levels === "Mapped from" ? -1 : 1,
              'distance': node.distance,
              'source': node,
              'color': generateColor(e.child_concept_id),
              'total_counts': getConceptInfo(e.child_concept_id).record_counts || 0,
              'descendant_counts': getConceptInfo(e.child_concept_id).descendant_record_counts || 0,
              'data': {code_counts: sidebarRoot.data.stratified_code_counts.filter(d => d.concept_id === e.child_concept_id),concept: getConceptInfo(e.child_concept_id)}
              })).sort((a, b) => b.total_counts - a.total_counts)
      }))
      let nodesArray = listArray.filter(d => d.relationship.includes("-") ||  d.relationship === '0')
      let linksArray = allNodes.filter(d => (d.levels.includes("-") || d.levels === '0') && d.parent_concept_id !== d.child_concept_id).filter(d => !classFilter.length>0 || (classFilter.includes(getConceptInfo(d.parent_concept_id).concept_class_id) && classFilter.includes(getConceptInfo(d.child_concept_id).concept_class_id))).map(d=>({source: d.levels === "-1" ? listArray[nodeList.indexOf(d.child_concept_id)] : listArray[nodeList.indexOf(d.parent_concept_id)], target: d.levels === "-1" ? listArray[nodeList.indexOf(d.parent_concept_id)] : listArray[nodeList.indexOf(d.child_concept_id)], relationship: d.levels}))
      // const edges = allNodes.map(d => {
      //   if (d.levels === "-1") {
      //       return {
      //         ...d,
      //         parent_concept_id: d.child_concept_id,
      //         child_concept_id: d.parent_concept_id
      //       }
      //     }
      //     return d
      //   })
      // const matrix = po.domFromEdges(edges,'child_concept_id','parent_concept_id')
      // const edgesMap = edges.map(d => ([d.child_concept_id,d.parent_concept_id]))
      // const labels = edgesMap.flat().filter((e,n,l) => l.indexOf(e) === n)
      // const poset = po.createPoset(matrix,labels)
      // poset.enrich()
      // poset.setLayers()
      // console.log('poset',poset)
      // const embeddingData = poset.analytics.suprema.map(infimum=>poset.elements.indexOf(infimum)).map(infimumRow=>poset.getDomMatrix()[infimumRow])
      // const umap = new UMAP({
      //     nComponents: 2,
      //     nEpochs: 400,
      //     nNeighbors: embeddingData.length - 1,
      // });
      // const embeddings = umap.fit(embeddingData)
      // console.log('embeddings',embeddings)
      // poset.analytics.suprema.map((supremum,n) => poset.features[supremum]["x"] = embeddings[n][0]) 
      // var f = (layer,h)=> h > 0 && layer.map(node=>poset.features[node]["x"] = poset.getCovering(node).map(parent=>poset.features[parent].x).reduce((acc,el)=>acc+el)/poset.getCovering(node).length)
      // poset.climber(poset,f)
      // console.log('poset',poset)
      setList(listArray)
      setNodes(nodesArray)
      setLinks(linksArray)   
    }    
  }, [sidebarRoot,levelFilter,classFilter])

  return ( loaded ?
    <div className = "App">
      <Header
        root = {root}
        rootData = {rootData}
        getCounts = {getCounts}
        setRoot = {setRoot}
        reset = {reset}
        conceptList = {conceptList}
        filteredList = {filteredList}
        setFilteredList = {setFilteredList}
        listIndexes = {listIndexes}
      /> 
      <div id = "content">
        <Visualization
          color = {color}
          root = {root}
          getData = {getData}
          generateColor = {generateColor}
          getCounts = {getCounts}
          // getValidity = {getValidity}
          reset = {reset}
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
        />  
      </div>  
    </div> : null
  )
}

export default App;
