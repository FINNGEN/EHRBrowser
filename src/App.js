import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Navigate, Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import finngen from './img/finngen_logo_dark.svg'
import CryptoJS from "crypto-js";
import Header from './components/header'
import Visualization from './components/visualization'
import { faX } from '@fortawesome/free-solid-svg-icons'
import * as d3 from "d3";
import po from './po.js';
import { UMAP } from 'umap-js';

function App() {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8564';
  // const API_BASE_URL = 'http://127.0.0.1:8564'
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
  const [graphFilter, setGraphFilter] = useState({gender:-1,age:[-1],source:[-1]})
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
  const [initialPrune, setInitialPrune] = useState(false)
  const [apiInfo, setApiInfo] = useState()
  const [visible,setVisible] = useState(false)
  const [removedClasses,setRemovedClasses] = useState([])
  const [hovered,setHovered] = useState([])
  const [colorList,setColorList] = useState([])
  const [fullClassList,setFullClassList] = useState([])
  const [searchOnly, setSearchOnly] = useState(true)
  const [searchIsLoaded, setSearchIsLoaded] = useState()
  const [version, setVersion] = useState()
  const [allVocabularies, setAllVocabularies] = useState([])
  const [searchFilter, setSearchFilter] = useState([])
  const [rootArray,setRootArray] = useState()
  const [dataArray, setDataArray] = useState([])
  const [isConceptSet,setIsConceptSet] = useState(true)
  const [rootLabels, setRootLabels] = useState([])
  const [refresh,setRefresh] = useState(false)
  const [centers, setCenters] = useState()
  const [inclusions, setInclusions] = useState([])
  const [expression, setExpression] = useState([])
  const [edges, setEdges] = useState([])
  const [maxDistance, setMaxDistance] = useState()
  const [subspaces, setSubspaces] = useState()
  const [visitTypeNames, setVisitTypeNames] = useState()
  const fetchedRef = useRef(false)
  const [annotations,setAnnotations] = useState([{key:'PURCH',year:1995},{key:'REIMB',year:1964},{key:'PRIM_OUT',year:2011},{key:'INPAT',year:1969},{key:'OUTPAT',year:1998},{key:'CANC',year:1953},{key:'DEATH',year:1969},{key:'OPER_IN',year:1969},{key:'OPER_OUT',year:1969},{key:'BIRTH',year:1953}])
  const [categories, setCategories] = useState([{key:'Longitudinal',codes:['PURCH','CANC','REIMB','DEATH','OUTPAT']},{key:'Registry',codes:['PRIM_OUT']},{key:'Drug',codes:['PRESCRIPTION_DELIVERY','PRESCRIPTION_DELIVERY_VACCINATION']}])
  const conceptNames = useMemo(() => selectedConcepts.map(d => d.name).filter((e,n,l) => l.indexOf(e) === n),[selectedConcepts])
  const allCounts = useMemo(() => 
    {
      const counts = selectedConcepts.filter(d => !d.leaf).map(d => d.data.code_counts).flat()
      const descendantCounts = selectedConcepts.filter(d => d.leaf).map(d => ({name:d.name,counts:d.data.descendant_code_counts}))
      const allCounts = [...counts,...descendantCounts.map(d => d.counts).flat()]
      return {counts:counts,descendantCounts:descendantCounts,all:allCounts}
    }
  ,[selectedConcepts])
  const maxLevel = useMemo(() => nodes ? d3.max(nodes.map(d => d.distance)) : null,[nodes])
  const fullTreeMax = useMemo(() => fullTree.nodes ? d3.max(fullTree.nodes.map(d => d.distance)) : null,[fullTree.nodes])
  // filter -1?
  const allClasses = useMemo(() => fullTree.nodes ? fullTree.nodes.map(d => d.class).filter((e,n,l) => l.indexOf(e) === n).filter(d => d !== undefined) : null,[fullTree.nodes,levelFilter])
  const years = useMemo(() => extent ? Array.from({ length: extent[1] - extent[0] + 1 }, (_, i) => extent[0] + i) : null,[extent])
  // let timer = null

  const loadNews = async () => {
    const res = await fetch('/NEWS.md')
    const text = await res.text()
    const firstLine = text.split('\n')[0]
    const index = firstLine.indexOf('v')
    const version = index !== -1 ? firstLine.slice(index) : ""
    setVersion(version)
  }

  const filteredCounts = useMemo(() => {
    const countsObj = allCounts
    if (graphFilter.gender !== -1 || graphFilter.age.length > 1 || graphFilter.source.length > 1) {
      let counts = countsObj.counts
      // .filter(e => graphFilter.gender !== -1 && graphFilter.age.length > 1 && graphFilter.source.length > 1 ? e.gender_concept_id === graphFilter.gender && graphFilter.age.includes(e.age_decile) && graphFilter.source.includes(e.visit_group_concept_id) : graphFilter.gender !== -1 ? e.gender_concept_id === graphFilter.gender : graphFilter.age.includes(e.age_decile))
      if (graphFilter.gender !== -1) counts = counts.filter(e => e.gender_concept_id === graphFilter.gender)
      if (graphFilter.age.length > 1) counts = counts.filter(e => graphFilter.age.includes(e.age_decile))
      if (graphFilter.source.length > 1) counts = counts.filter(e => graphFilter.source.includes(e.visit_group_concept_id))
      let dCounts = []
      countsObj.descendantCounts.forEach(obj => {
        let counts = obj.counts
        if (graphFilter.gender !== -1) counts = counts.filter(e => e.gender_concept_id === graphFilter.gender)
        if (graphFilter.age.length > 1) counts = counts.filter(e => graphFilter.age.includes(e.age_decile))
        if (graphFilter.source.length > 1) counts = counts.filter(e => graphFilter.source.includes(e.visit_group_concept_id))
        dCounts.push(counts)
      })
      const descendantCounts = countsObj.descendantCounts.map((obj,i) => ({...obj,counts:dCounts[i]}))
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

  const sourceData = useMemo(() => {
    if (visitTypeNames) {
      let sourceSums = []
      visitTypeNames.forEach(obj => selectedConcepts.forEach(d => sourceSums.push({id: obj.visitGroupConceptId,sum: d.leaf ? getCounts(d.data.descendant_code_counts.filter(e => (e.calendar_year >= extent[0] && e.calendar_year <= extent[1])).filter(e => e.visit_group_concept_id === obj.visitGroupConceptId),'node_record_counts') : getCounts(d.data.code_counts.filter(e => (e.calendar_year >= extent[0] && e.calendar_year <= extent[1])).filter(e => e.visit_group_concept_id === obj.visitGroupConceptId),'node_record_counts')})))
      const sourceDataVar = categories.map(obj => ({key:obj.key,codes:visitTypeNames.filter(d => obj.codes.includes(d.conceptCode)).map(d => ({id:d.visitGroupConceptId,code:d.conceptCode,name:d.conceptName,sum:d3.sum(sourceSums.filter(s => s.id === d.visitGroupConceptId).map(s => s.sum))}))}))
      return sourceDataVar  
    }
  },[filteredCounts,extent,visitTypeNames])

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

  function getAllDescendants(relationships, rootId, descendants) {
    const immediateChildren = relationships
      .filter(r => r.parent_concept_id === rootId && r.child_concept_id !== rootId)
      .map(r => r.child_concept_id);

    for (const child of immediateChildren) {
      if (!descendants.includes(child)) { 
        descendants.push(child)
        getAllDescendants(relationships, child, descendants)
      }
    }
    return descendants
  }

  function linearEmbedding(profiles,ids = Array.from({length:profiles.length},(_,n)=>n), cells = 12, iterations = profiles.length*profiles[0].length, learningRate = 0.1, seed=42) { 
      
    cells = profiles.length * 2 //we want every two sets to have a union between them (resolution can increase interpolating the two)
    
    const intersectionSize = (a,b) => a.filter((e,n)=>e===1&&b[n]===1).length
    const unionSize = (a,b) => a.filter((e,n)=>e===1||b[n]===1).length
    const jaccardDistance = (a,b) => 1-intersectionSize(a,b)/unionSize(a,b)
    const U = (a,b) => a.map((e,n)=>e = b[n]===1?1:e) 
    //randU is a seeded random union operation that creates a pseudounion between two sets (i.e. something that tends to have a low jaccard distance to the union)
    const seededRandom = (n,seed,bias=2) => Math.sin(n * seed) > 0.2 || n%bias===0 //biased towards true
    const randU = (a,b,bias) => a.map((e,n,l)=>e = b[n]===1?seededRandom(n,10,bias)?e:1:e) 
    const interpolation = (a,b,bias) => a.map((e,n)=>e = b[n]===e ? e : (seededRandom(n,10,bias)?b[n]:e)) 
    

    let neurons = Array.from({ length: cells }, (_, N) => ({
        position: N,
        weights: [...Array(profiles[0].length).fill(0)].map((_, n) => 
            seededRandom(n,10*N) > 0.5 ? 0 : 1  
        ),
        bmus: [],
        bmusID: [],
        ref: []
    }));
      //console.log("N",JSON.parse(JSON.stringify(neurons.map(n=>n.weights))))
            
    // Helper function to update weights
    
    const updateWeights = (neuron, profile, intensity) => {
        const bias = iterations - Math.ceil(intensity*100)+1
        neuron.weights = interpolation(neuron.weights,profile,bias)
        // for (let i = 0; i < neuron.weights.length; i++) {
        //     //neuron.weights[i] += rate * (profile[i] - neuron.weights[i]);
        //     const w = neuron.weights[i] + rate * (profile[i] - neuron.weights[i]);
        //     if(w > 0) {
        //         neuron.weights[i] = w
        //     }else{
        //         neuron.weights[i] = 0
        //     }
        // }
    };

    //TODO –> smoother learning spike (more neighbors)
    //TODO –> EITHER nested subspace sorting – OR add interpolated neurons if neighbor has one
    //?CONSIDER A GENERATOR FUNCTION THAT YIELDS AND IS TIED INDIRECTLY TO A LIST
    for (let t = 0; t < iterations; t++) {
        const rate = learningRate * (1 - t / iterations); // Decaying learning rate

        profiles.forEach(profile => {
            // Step 1: Find the Best Matching Unit (BMU)
            let bmuIndex = 0;
            let w = Infinity;
            
            neurons.forEach((neuron, index) => {
                const dist = jaccardDistance(neuron.weights, profile);
                if (dist < w) {
                    w = dist;
                    bmuIndex = index;
                }
            });
            

            // Step 2: Update weights of the BMU and its neighbors
            
            for (let i = 0; i < cells; i++) {
                // Calculate neighborhood influence
                const distance =Math.abs(bmuIndex - i)
                const influence = Math.exp(-distance / (2 * (1 - t / iterations)));
                
                // Update weights
                updateWeights(neurons[i], profile, rate * influence);
            }
        });
    }

    profiles.forEach((profile, n) => {
        
        let bmuIndex = 0;
        let w = Infinity;

        neurons.forEach((neuron, index) => {
            const dist = jaccardDistance(neuron.weights, profile);
            if (dist < w) {
                w = dist;
                bmuIndex = index;
            }
        });
        
        
        neurons[bmuIndex].bmus.push(profile);
        neurons[bmuIndex].bmusID.push(ids[n]);  // Usa ids[n] invece di n
        neurons[bmuIndex].ref.push(ids[n]);     // Questo è ridondante ora
        
    });


    // Return SOM object
    return { 
        neurons , 
        getNeuron : function(id){ return this.neurons.find(neuron=>neuron.bmusID.includes(id)).position} ,
        // toHue : d3.scaleLinear([0,cells],[0,360])
    };
            

  }

  const topDown = (layers,f,sorted=false) => {
    for (let i = layers.length-1; i > 0; i--) {
        f(layers[i], 'down',sorted)
    }  
  }

  const propagate = (layers,start,f,sorted=false) => {
    const below = layers.slice(0, start).reverse()
    const above = layers.slice(start + 1)
    below.forEach(l => f(l,'up',sorted))
    above.forEach(l => f(l,'down',sorted))
  }

  const bottomUp = (layers,f,sorted=false) => {
    for (let i = 1; i <= layers.length-1; i++) {
        f(layers[i], 'down',sorted)
    }
  }

  function spreadAroundCentroid(nodes,centroid,w) {
    const adjustment = nodes.length % 2 !== 0 ? 0 : w/2
    const median = Math.floor(nodes.length/2) 
    const spreadPositions = nodes.map((n,i) => ({node:n,x:i >= median ? centroid+((i-median)*w)+adjustment : centroid-((median-i)*w)+adjustment}))
    return spreadPositions
  }

  // function spreadAroundCentroidTree(nodes,widths,sum,centroid) {
  //   let acc = centroid - (sum/2)
  //   const spreadPositions = []
  //   nodes.forEach(node => {
  //     const x = acc + (widths[node]/2)
  //     spreadPositions.push({node:node,x:x})
  //     acc += widths[node]
  //   })
  //   return spreadPositions
  // }
  
  const barycenterSort = (sets, ids) => {
    const order = [...ids];
    
    const supersetCount = i => ids.filter(j => j !== i && po.isSubset(sets[ids.indexOf(i)], sets[ids.indexOf(j)])).length;
    const toMove = [...ids].sort((a, b) => supersetCount(b) - supersetCount(a));

    for (const node of toMove) {
        const nodeVec = sets[ids.indexOf(node)];
        const supersets = order.filter(j => j !== node && po.isSubset(nodeVec, sets[ids.indexOf(j)]));
        if (supersets.length === 0) continue;

        const positions = supersets.map(s => order.indexOf(s));
        const mid = Math.round(positions.reduce((a, b) => a + b, 0) / positions.length);

        order.splice(order.indexOf(node), 1);
        order.splice(mid, 0, node);
    }

    return order;
  }

  function isTree(poset,nodes,edges,suprema) {
    const supremaChildren = suprema.map(s => poset.getLower(s)).flat().filter((e,n,l) => l.indexOf(e) === n)
    const ignoreSuprema = suprema.length > 1 && supremaChildren.length === 1
    return edges.length === nodes.length - 1 && (suprema.length === 1 || ignoreSuprema)
  }

  function linearLayout(poset,edges,nodes,width) {
    const unit_w = width

    function filterLayers(poset,descendants) {
      return poset.layers.map(layer => layer.filter(l => descendants.includes(l)))
    }
    function sortLayersByX(layers) {
      return layers.map(layer => layer.sort((a,b) => poset.featureOf(a,'x') - poset.featureOf(b,'x')))
    }
    // function getWidth(poset,descendants) {
    //   const max = d3.max(filterLayers(poset,descendants).map(layer => layer.length))
    //   return max === 0 ? unit_w : max * unit_w
    // }
    const setX = (e,direction,sorted) => {
      let idealPositions = []
      let sortedPositions = []
      let shiftToEnd = []
      function shiftPositionsByGroup(group,sortedPositions,w) {
        const ref = group[0]
        const prevGroup = sortedPositions[sortedPositions.length-1]
        const prev = prevGroup[prevGroup.length-1]
        if (ref.x < prev.x || ref.x-prev.x < w) {
          const shifted = group.map((d,i) => ({node:d.node,x:prev.x+w+(w*i)}))
          sortedPositions = [...sortedPositions,shifted]
        } else sortedPositions = [...sortedPositions,group] 
        return sortedPositions
      }
      e.forEach(node => {
        let x
        const refs = direction === 'up' ? poset.getUpper(node) : poset.getLower(node)
        // const refs = direction === 'up' ? poset.getUpper(node).filter(n => poset.layers.findIndex(l => l.includes(n)) === poset.layers.findIndex(l => l.includes(node)) + 1) : poset.getLower(node).filter(n => poset.layers.findIndex(l => l.includes(n)) === poset.layers.findIndex(l => l.includes(node)) - 1)
        const values = poset.featureOf(refs, "x").filter(v => v !== undefined)
        const sum = d3.sum(values)
        if (values.length !== 0) x = sum === 0 ? 0 : sum / values.length
        if (x == null) {
          // if (poset.featureOf(node,'x') == null) shiftToEnd.push(node)
          if (poset.featureOf(node,'x') == null) x = 0
          else x = poset.featureOf(node,'x')
        }
        if (x !== null) idealPositions.push({node:node,x:x})
      })

      const groups = new Map()
      for (const obj of idealPositions) {
        if (!groups.has(obj.x)) groups.set(obj.x, [])
        groups.get(obj.x).push(obj)
      }
      let groupedByPosition = Array.from(groups.values())

      if (!sorted) groupedByPosition = groupedByPosition.sort((a,b) => a[0].x - b[0].x)

      groupedByPosition.forEach(groupArray => {
        let group
        let nodes = groupArray.map(d => d.node)
        let value = groupArray[0].x
        if (groupArray.length > 1) {
          group = spreadAroundCentroid(nodes,value,unit_w)
          if (sortedPositions.length === 0) sortedPositions.push(group)
          else sortedPositions = shiftPositionsByGroup(group,sortedPositions,unit_w)  
        } else {
          group = nodes.map(n => ({node:n,x:value}))
          if (sortedPositions.length === 0) sortedPositions.push(group)
          else sortedPositions = shiftPositionsByGroup(group,sortedPositions,unit_w)
        }
      })
      if (shiftToEnd.length > 0) {
        const max = d3.max(sortedPositions.flat().map(d => d.x))
        shiftToEnd.forEach((node,i) => poset.featureOf(node,'x',max+unit_w+(unit_w*i)))
      }
      sortedPositions.flat().forEach(d => poset.featureOf(d.node,'x',d.x))
    }

    const tree = isTree(poset,nodes,edges.filter(e => nodes.includes(e[0]) && nodes.includes(e[1])),poset.analytics.suprema.filter(n => nodes.includes(n)))
    const layers = filterLayers(poset,nodes)

    if (layers.length === 0) return

    if (layers.length === 1) {
      let acc = 0
      nodes.forEach(id => {
        const x = acc + unit_w/2
        poset.featureOf(id,"x",x)
        acc += unit_w
      })
    }

    else {
      let L = layers.length - 1
      let bbIds = layers[layers.length-1]
      if (!tree) {
        const bb = layers.map((l,n)=>({n:n, l:l, deg:l.length === 0 ? 0 : l.map(node=>poset.featureOf(node,"node_degree")).reduce((acc,el)=>acc+el)})).sort((a,b)=>b.deg-a.deg)[0]
        const midPoint = Math.trunc((layers.length-1)/2)
        L = bb.n > midPoint ? bb.n : midPoint  

        const i = poset.layers.findIndex(l => layers[L].some(id => l.includes(id)))
        const scores = tree || layers[L+1].length > 1 ? po.boundScores(poset,i) : po.dominanceScores(poset,i) 
        const {ids,subspaces} = po.findSubspaces(scores)
        const idsFiltered = [], subspacesFiltered = []

        ids.forEach((arr,i) => {
          if (arr.some(id => nodes.includes(id))) {
            idsFiltered.push(arr)
            subspacesFiltered.push(subspaces[i])
          }
        })

        bbIds = subspacesFiltered.map((ssp,n)=>{
            const LE = linearEmbedding(ssp,idsFiltered[n])
            if(ssp.length>1){
                const sets = LE.neurons.flatMap(neu=>neu.bmus)
                const sspids = LE.neurons.flatMap(neu=>neu.bmusID)
                return barycenterSort(sets, sspids)
            }
            return LE.neurons.flatMap(neu=>neu.bmusID)
        }).flat().filter(id => nodes.includes(id))
      }

      let acc = 0
      bbIds.forEach(id => {
        const x = acc + unit_w/2
        poset.featureOf(id,"x",x)
        acc += unit_w
        // const descendants = poset.getDownset(id)
        // const width = getWidth(poset,descendants)
        // const x = acc + (width/2)
        // poset.featureOf(id,"x",x)
        // acc += width  
      })
      propagate(layers,L,setX)
      const sortedLayers = sortLayersByX(layers)
      bottomUp(sortedLayers,setX,true)
    }
  }

  function spaceSubspaces(poset,subspaces,width) {
    const unit_w = width
    subspaces.forEach((nodes,index) => {
      if (index > 0 && subspaces[index-1].length > 0) {
          const prevMax = d3.max(poset.featureOf(subspaces[index-1],'x'))
          const thisMin = d3.min(poset.featureOf(nodes,'x'))  
          const ideal = prevMax + (unit_w*2)
          if (thisMin !== ideal) {
            const adjustment = ideal - thisMin
            nodes.forEach(node => poset.featureOf(node,'x',poset.featureOf(node,'x') + adjustment))
          }  
        }  
    }) 
  }

  function getInclusions(roots,nodes,id,eList,dFilter,descendants) {
    // both selected
    if (eList.includes(id) && !dFilter.includes(id)) {
        // const rootStillIncluded = descendants.filter(d => roots.includes(d) && !eList.includes(d))
        // return rootStillIncluded
        return []
    }
    else {
        // descendants unselected
        if (dFilter.includes(id)) {
            let stillIncluded = roots.filter(r => r !== id && (nodes.find(n => n.name === r).distance < nodes.find(n => n.name === id).distance) && (!eList.includes(r) && !dFilter.includes(r))).map(r => nodes.find(n => n.name === r).descendants.filter(d => d !== r).filter(d => classFilter.includes('All') ? d : classFilter.includes(nodes.find(n => n.name === d).class))).flat().filter(d => descendants.includes(d))
            const rootStillIncluded = descendants.filter(d => roots.includes(d) && !eList.includes(d))
            stillIncluded = [...stillIncluded,...rootStillIncluded]
            // exclude unselected
            if (!eList.includes(id)) {
                return stillIncluded.includes(id) ? stillIncluded : [...stillIncluded,id]
            } else {
                return stillIncluded.filter(d => d !== id)
            }
        // descendants selected
        } else {
          let stillExcluded = roots.filter(r => r !== id && (nodes.find(n => n.name === r).distance < nodes.find(n => n.name === id).distance) && (eList.includes(r) && !dFilter.includes(r))).map(r => nodes.find(n => n.name === r).descendants.filter(d => d !== r).filter(d => classFilter.includes('All') ? d : classFilter.includes(nodes.find(n => n.name === d).class))).flat().filter(d => descendants.includes(d))
          const rootExclusions = descendants.filter(d => roots.includes(d) && eList.includes(d))
          const rootDescendantExclusions = rootExclusions.filter(r => !dFilter.includes(r)).map(r => nodes.find(n => n.name === r).descendants.filter(d => d !== r).filter(d => classFilter.includes('All') ? d : classFilter.includes(nodes.find(n => n.name === d).class))).flat()
          stillExcluded = [...stillExcluded,...rootExclusions,...rootDescendantExclusions]
          return descendants.filter(d => !stillExcluded.includes(d))
        }
    }
  }
  
  // *** optimize this ***
  function createInitialStates(data,filterClass,filterLevel,filteredClassList) {
    console.log('run',data)
    // set nodes 
    const subsumesData = data.concept_relationships.filter(d => d.levels !== "Mapped from" && d.levels !== "Maps to")
    const mappingData = data.concept_relationships.filter(d => d.levels === "Mapped from" || d.levels === "Maps to")
    // what is this doing? 
    let nodeData = Array.from(
      subsumesData
      .reduce((map, obj) => {
        const existing = map.get(obj.child_concept_id)
        if (!existing || (parseInt(obj.levels.split('-')[0]) > parseInt(existing.levels.split('-')[0]))) {
          map.set(obj.child_concept_id, obj)
        }
        return map
      }, new Map())
      .values()
    )
    // poset
    let colors = {}
    let distances = {}
    let fullEdges = data.concept_relationships
      .filter(d => d.levels !== "Mapped from" && d.levels !== "Maps to")
      .map(d => d.levels === "-1" ? ({...d,parent_concept_id: d.child_concept_id,child_concept_id: d.parent_concept_id}) : d)
      .map(d => ([d.parent_concept_id.toString(),d.child_concept_id.toString()]))
    if (fullEdges.length > 1) fullEdges = fullEdges.filter(d => d[0] !== d[1])
    const {matrix,nodes} = po.domFromEdges(fullEdges)

    const fullPoset = po.createPoset(matrix,nodes)
    fullPoset.enrich()
      .setLayers()
      .color(80,25,90)
      .feature("lower_bound",(node)=>fullPoset.getLower(node))
      .feature("upper_bound",(node)=>fullPoset.getUpper(node))
      .feature("node_degree",(node,f)=>f.lower_bound.length+f.upper_bound.length)

    const subspaces = po.findSubspaces(po.dominanceScores(fullPoset,fullPoset.layers.length-1))
    subspaces.nodes = subspaces.ids.map(ids => [...ids.map(id => fullPoset.getDownset(id)).flat(),...ids].filter((e,n,l) => l.indexOf(e) === n))
    subspaces.nodes.forEach(nodes => linearLayout(fullPoset,fullEdges,nodes,150))
    spaceSubspaces(fullPoset,subspaces.nodes,150)

    // linearLayout(poset,edges,150)
    // *** consider case if there are no edges and just a single node (missing nodes function from vis) ***
    const layers = [...fullPoset.layers].reverse()
    const depthScale = d3.scaleLinear(d3.extent(layers.map((l,i)=>i)), [20,70])
    fullPoset.elements.forEach(name => {
        distances[name] = layers.findIndex(i => i.includes(name))
        colors[name] = `hsl(${fullPoset.featureOf(name,'pTheta')},${fullPoset.featureOf(name,'pAlpha')*100}%,${depthScale(distances[name])}%)`
    })
    
        nodeData = nodeData.map(e=>({
        'name': e.child_concept_id, 
        'levels': e.levels,
        'relationship': e.levels,
        'class': e.concept_class_id,
        // 'color': generateColor(e.child_concept_id),
        'distance': distances[e.child_concept_id], 
        'color': colors[e.child_concept_id] ? colors[e.child_concept_id] : generateColor(e.child_concept_id),
        'x': fullPoset.elements.includes(e.child_concept_id.toString()) ? fullPoset.featureOf(e.child_concept_id,"x") ? fullPoset.featureOf(e.child_concept_id,"x") : 0 : 0,
        'leaf': !subsumesData.map(d => d.parent_concept_id).includes(e.child_concept_id) ? true : false,
        'parents': fullPoset.getUpper(e.child_concept_id.toString()).map(d => parseInt(d)),
        'children': fullPoset.getLower(e.child_concept_id.toString()).map(d => parseInt(d)),
        // 'descendants': poset.getDownset(e.child_concept_id.toString()).map(d => parseInt(d)),
        // 'parents': rootArray.includes(e.child_concept_id) ? subsumesData.filter(d => d.parent_concept_id === e.child_concept_id).filter(d => d.levels === '-1').map(d => d.child_concept_id).concat(subsumesData.filter(d => d.child_concept_id === e.child_concept_id).map(d => d.parent_concept_id).filter(p => parseInt(e.levels.split('-')[0]) > parseInt(subsumesData.filter(n => n.child_concept_id === p)[0].levels.split('-')[0])).flat()) : e.levels === "-1" ? [] : subsumesData.filter(d => d.child_concept_id === e.child_concept_id).map(d => d.parent_concept_id).filter(p => parseInt(e.levels.split('-')[0]) > parseInt(subsumesData.filter(n => n.child_concept_id === p)[0].levels.split('-')[0])),
        // 'children': e.levels === "-1" ? subsumesData.filter(d => d.child_concept_id === e.child_concept_id).map(d => d.parent_concept_id) : subsumesData.filter(d => d.parent_concept_id === e.child_concept_id && d.child_concept_id !== e.child_concept_id).map(d => d.child_concept_id),
        'connections': [],
        'total_counts': getCounts(data.stratified_code_counts.filter(d => d.concept_id === e.child_concept_id),'node_record_counts'),
        'descendants': [...getAllDescendants(subsumesData,e.child_concept_id,[]),e.child_concept_id],
        'data': {code_counts: data.stratified_code_counts.filter(d => d.concept_id === e.child_concept_id), concept: data.concepts.filter(d => d.concept_id === e.child_concept_id)[0]}
    })) 
    // set max distance
    const maxD = d3.max(nodeData.map(d => d.distance))
    setMaxDistance(maxD)
    // set root line 
    let rootDescendants = []
    rootArray.forEach(root => rootDescendants.push(...nodeData.find(n => n.name === root).descendants))
    rootDescendants = rootDescendants.filter((e,n,l) => l.indexOf(e) === n).filter(d => data.concepts.filter(c => c.concept_id === d)[0].record_counts !== 0)
    const rootData = data.stratified_code_counts.filter(e => rootDescendants.includes(e.concept_id))
    const rootExtentData = d3.extent(rootData.map(d => d.calendar_year))
    let rootLineData = d3.flatRollup(
      rootData,
      v => d3.sum(v, d => d.node_record_counts),
      d => d.calendar_year
    )
    rootLineData.sort((a, b) => a[0] - b[0])
    setRootExtent(rootExtentData)
    setRootLine(rootLineData) 
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
    // // update color, position, and distance
    // nodeData = nodeData.map(d => ({...d,distance:distances[d.name], color: colors[d.name] ? colors[d.name] : d.color,x:poset.featureOf(d.name,"x") ? poset.featureOf(d.name,"x") : 0}))
    // set selections
    const inclusionList = rootArray.map(r => getInclusions(rootArray,nodeData,r,excludeList,descendantsFilter,nodeData.find(n => n.name === r).descendants)).flat()
      .filter(i => nodeData.find(n => n.name === i).levels !== '-1')
      .filter(i => nodeData.find(n => n.name === i).total_counts !== 0)
    // const inclusionList = nodeData.filter(n => n.levels !== '-1').filter(n => n.total_counts !== 0).map(n => n.name)
    setInclusions(inclusionList)
    nodeData = nodeData.map(e=>({...e,descendant_code_counts: data.stratified_code_counts.filter(d => e.descendants.includes(d.concept_id)),leaf:e.descendants.filter(d => d !== e.name).length > 0 && e.leaf ? true : false}))
    const selectedNodes = nodeData
      .filter(d => !d.leaf ? inclusionList.includes(d.name) : d)
      .map(d => ({name: d.name, leaf: d.leaf, descendants: d.descendants, distance: d.distance, data: {...d.data,descendant_code_counts:d.descendant_code_counts}}))
    selectedNodes.sort((a,b) => d3.ascending(a.distance, b.distance))
    setSelectedConcepts(selectedNodes)
    nodeData = nodeData.map(d => ({...d,included_descendants:d.descendants.filter(e => inclusionList.includes(e)),descendant_counts:getCounts(d.descendant_code_counts,'node_record_counts')}))
      .map(node => ({
        ...node,
        mappings: mappingData.filter(d => d.parent_concept_id === node.name).map(e=>({
          'name': e.child_concept_id,
          'direction': e.levels === "Mapped from" ? -1 : 1,
          'distance': node.distance,
          'source': node,
          'color': node.color,
          // 'color': colors[e.child_concept_id] ? colors[e.child_concept_id] : generateColor(e.child_concept_id),
          'total_counts': getCounts(data.stratified_code_counts.filter(d => d.concept_id === e.child_concept_id),'node_record_counts'),
          'descendant_counts': data.concepts.find(c => c.concept_id === e.child_concept_id).descendant_record_counts,
          'data': {code_counts: data.stratified_code_counts.filter(d => d.concept_id === e.child_concept_id),concept: data.concepts.filter(d => d.concept_id === e.child_concept_id)[0]}
          })).sort((a, b) => b.total_counts - a.total_counts)
      }))
    nodeData.forEach(node => {node.mappings.forEach(map => colors[map.name] = map.color)})
    setColorList(colors)
    // set links
    const nodeNames = nodeData.map(d => d.name)
    const linkData = subsumesData.filter(d => d.parent_concept_id !== d.child_concept_id).map(d=>({...d, source: d.levels === "-1" ? nodeData[nodeNames.indexOf(d.child_concept_id)] : nodeData[nodeNames.indexOf(d.parent_concept_id)], target: d.levels === "-1" ? nodeData[nodeNames.indexOf(d.parent_concept_id)] : nodeData[nodeNames.indexOf(d.child_concept_id)]}))
    // set extent
    let extentData = d3.extent(selectedNodes.map(d => d.data.code_counts).flat().map(d => d.calendar_year))
    if (!extentData[0] || !extentData[1]) extentData = rootExtentData
    setExtent(extentData) 
    // set states
    setEdges(edges)
    setPoset(fullPoset)
    setSubspaces(subspaces.nodes)
    setPruned(false)
    setFullTree({relationships:subsumesData,layers:layers,nodes:nodeData,links:linkData,selected:selectedNodes,mappings:mappingData.map(d => d.child_concept_id),edges:fullEdges,poset:fullPoset,maxDistance:maxD})
    if (!filterClass && !filterLevel) {
      // setCenters(centerArray)
      setNodes(nodeData)
      setLinks(linkData)
    } 
    if (filterClass) setClassFilter(filteredClassList)
    if (filterLevel) setLevelFilter(2)
    setLoading(false)
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

  // on page load
  useEffect(()=>{
    console.log('start app')
    const params = new URLSearchParams(window.location.search)
    setLoaded(true)
    loadNews()
    fetch(`${API_BASE_URL}/getVisitTypeNames`)
      .then(res=> res.json())
      .then(data=>{
        console.log('visit type names',data)
        setVisitTypeNames(data)
      })
    fetch(`${API_BASE_URL}/getAPIInfo`)
      .then(res=> res.json())
      .then(data=>{
        setApiInfo(data)
      })
    fetch(`${API_BASE_URL}/getListOfConcepts`)
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
    setLoading(true)
    if (!root) {
      setRootData([])
      setRootLabels([])
      setIsConceptSet(false)
      setSearchOnly(true)
    } else {
      // setLoading(true)
      fetchedRef.current = true
      setSearchOnly(false)
      setLevelFilter()
      setClassFilter(['All'])
      // const timer = setTimeout(() => {
      //     setLoading(true)
      // }, 300)
      const array = root.split(',').map(Number)
      // if (array.length > 1) setIsConceptSet(true)
      // else setIsConceptSet(false)
      setRootArray(array)
      if (expression.length > 0) {
        setDescendantsFilter(expression.filter(e => !e.descendants).map(e => e.name))
        setExcludeList(expression.filter(e => e.exclude).map(e => e.name))
      }
      Promise.all(
        array.map(r =>
          fetch(`${API_BASE_URL}/getCodeCounts?conceptId=${r}`)
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
        // setLoading(false)
        // clearTimeout(timer)
      })
      .catch(err => {
        console.error("Fetch failed:", err.message)
        // setLoading(true)
        d3.select('#error-message').style('display','block')
        d3.select('#loading-animation').style('visibility','hidden')
        // clearTimeout(timer)
      })  
    }
  },[root])

  // on data load
  useEffect(()=>{
    if (dataArray && dataArray.length > 0) {
      let combinedData = dataArray[0]
      if (dataArray.length > 1) {
        let toRemove = []
        rootArray.forEach((root,i) => dataArray.forEach((data,index) => {
          // not its own data
          if (i !== index) {
            // is included in child_concept_id not as -1 parent
            const filteredRelationships = data.concept_relationships.filter(c => c.levels !== 'Mapped from' && c.levels !== "Maps to" && c.levels !== "-1" && c.levels !== '0')
            if (filteredRelationships.map(d => d.child_concept_id).includes(root)) {
              // add its -1 parents to this array and add its root index to remove list
              const parentRelationships = dataArray[i].concept_relationships.filter(c => c.levels === '-1' && !rootArray.includes(c.child_concept_id))
              const parentConcepts = dataArray[i].concepts.filter(c => parentRelationships.map(d => d.child_concept_id).includes(c.concept_id))
              dataArray[index].concept_relationships.push(...parentRelationships)
              dataArray[index].concepts.push(...parentConcepts)
              toRemove.push(i)
            }
          }
        }))
        let filteredData = dataArray
        if (toRemove.length > 0) filteredData = dataArray.filter((data,i) => !toRemove.includes(i))
        combinedData.concept_relationships = filteredData.map(d => d.concept_relationships).flat()
        combinedData.concepts = filteredData.map(d => d.concepts).flat().filter((e, i, a) => a.findIndex(x => deepEqual(x, e)) === i)
        combinedData.stratified_code_counts = filteredData.map(d => d.stratified_code_counts).flat()
      } 
      setRootData(combinedData)
      setSidebarRoot({name:rootArray,data:combinedData}) 
      setRootLabels(rootArray.map(root => ({id:root,name:combinedData.concepts.find(e=>e.concept_id === root).concept_name,code:combinedData.concepts.find(e=>e.concept_id === root).concept_code,vocabulary:combinedData.concepts.find(e=>e.concept_id === root).vocabulary_id})))
      if (d3.select('#suggestions-container').style('visibility') === 'hidden') setRefresh(true)
      setView('Set')
      // if (rootArray.length > 1) setView('Set')
      // else setView('Tree')
      d3.select("#graph-section").style('width', "60vw")
      d3.select('#expand').style('display', 'block') 
      d3.select('#compress').style('display', 'none') 
      setGraphFilter({gender:-1,age:[-1],source:[-1]})
      let filterClass = false
      let classList = combinedData.concept_relationships.filter(d => d.levels !== "Mapped from" && d.levels !== "Maps to").map(d => d.concept_class_id).filter((e,n,l) => l.indexOf(e) === n).filter(d => d !== undefined)
      const thisClass = combinedData.concepts.filter(d => rootArray.includes(d.concept_id)).map(d => d.concept_class_id).filter((e,n,l) => l.indexOf(e) === n).filter(d => d !== undefined)
      let filteredClassList = []
      setFullClassList(classList)
      if ((!thisClass.includes('Ingredient') && !thisClass.includes('Clinical Drug Comp')) && (classList.includes('Ingredient') || classList.includes('Clinical Drug Comp'))) {
        filteredClassList = classList.filter(d => d !== 'Ingredient' && d !== 'Clinical Drug Comp') 
        setRemovedClasses(classList.filter(d => d === "Ingredient" || d === 'Clinical Drug Comp'))
        filterClass = true
        // setClassFilter(filteredClassList) 
      } 
      // else setClassFilter(['All'])
      setTreeSelections(['descendants'])
      setOpenFilters(true)
      setHovered([])
      // setMapRoot([])
      setNodes([])
      setLinks([])
      setVisible(false)
      let filterLevel = false
      if (combinedData.concepts.length > 900) {
        filterLevel = true
        // setLevelFilter(2)
      } 
      const initialPrune = filterLevel || filterClass ? true : false
      setInitialPrune(initialPrune)
      createInitialStates(combinedData,filterClass,filterLevel,filteredClassList)  
    }
  },[dataArray])

  // search bar labels
  useEffect(() => {
    d3.select('#search-root-container').selectAll('.search-root').data(rootLabels, d => d.name)
      .join(enter => {
          const div = enter.append('div')
            .classed('search-root',true)
            .style('margin-left', (d,i) => (rootLabels.length <= 2 || i == 0) ? '0px' : '-116px')
            .style('z-index', (d, i) => i == 0 ? 10 : 10 - i)
          const pContainer = div.append('div')
            .classed('search-p-container',true)
            .style("filter", "drop-shadow(0px 3px 5px rgba(0,0,0,0.4))")
            .style('width', (d,i) => (rootLabels.length <= 2 || i == 0) ? 'auto' : '100px')
            // .style('border', (d,i) => rootLabels.length > 2 ? '1px solid #342458' : 'none')
            .style('background-color',color.mediumpurple)
            .style('height','26px')
            .style('border-radius','20px')
            .style('padding-right','14px')
            .style('padding-left','14px')
            .style('display','flex')
            .style('align-items','center')
            .style('justify-content','center')
            .style("cursor","text")
            .on('click',(e,d) => {
              setRefresh(false)
              document.getElementById('searchConcept').focus()
            })
          pContainer.append('p')
            .classed('search-root-name',true)
            .style('padding-bottom','2px')
            .html((d,i) => (rootLabels.length <= 2 || i == 0) ? d.name.length > 20 ? d.name.substring(0, 20) + '...' : d.name : '')
          pContainer.append('p')
            .classed('search-root-code',true)
            .html((d,i) => (rootLabels.length <= 2 || i == 0) ? d.code : '')
            // .style('margin-top','1px')
            .style('margin-left','4px')
            .style('font-size','10px')
            .style('font-weight',700)
            .style('color','white')
          pContainer.append('p')
            .classed('search-root-vocab',true)
            .html((d,i) => (rootLabels.length <= 2 || i == 0) ? d.vocabulary : '')
            // .style('margin-top','1px')
            .style('margin-left','4px')
            .style('font-size','10px')
            .style('font-weight',400)
            .style('color','ffffff80')
          div.append('i')
            .classed('search-x fa-solid fa-x fa-xs',true)
            .style('pointer-events','all')
            .style("display", rootLabels.length <= 2 ? 'block' : 'none')
            .style('color','white')
            .style('padding-left','4px')
            .style('margin-right','2px')
            .style('cursor','pointer')
            .on('click',(e,d) => {
              const array = root.split(',').map(Number)
              const arrayToString = array.filter(root => root !== d.id).join(",")
              navigate(`/${arrayToString}`)
            })
      },update => {
        update
          .style('margin-left', (d,i) => (rootLabels.length <= 2 || i == 0) ? '0px' : '-116px')
          .style('z-index', (d, i) => i == 0 ? 10 : 10 - i)
        update.select('.search-p-container')
          .style('width', (d,i) => (rootLabels.length <= 2 || i == 0) ? 'auto' : '100px')
          // .style('border', (d,i) => rootLabels.length > 2 ? '1px solid #342458' : 'none')
        update.select('.search-root-name')
          .html((d,i) => (rootLabels.length <= 2 || i == 0) ? d.name.length > 20 ? d.name.substring(0, 20) + '...' : d.name : '')
        update.select('.search-root-code')
          .html((d,i) => (rootLabels.length <= 2 || i == 0) ? d.code : '')
        update.select('.search-root-vocab')
          .html((d,i) => (rootLabels.length <= 2 || i == 0) ? d.vocabulary : '')
        update.select('.search-x')
          .style("display", rootLabels.length <= 2 ? 'block' : 'none')
          .on('click',(e,d) => {
            const array = root.split(',').map(Number)
            const arrayToString = array.filter(root => root !== d.id).join(",")
            navigate(`/${arrayToString}`)
          })
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
        // reset = {reset}
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
        setExpression = {setExpression}
        setLoading = {setLoading}
        loading = {loading}
        API_BASE_URL = {API_BASE_URL}
      />
      {(searchIsLoaded && searchOnly) && <div className = "loading">
        <img style = {{width:60,opacity: 0.2}} src={finngen} alt="Finngen logo"/>
      </div>}
      {(!searchIsLoaded || initialPrune || loading) && <div className = "loading" style={{ fontSize: '20px' }}>
        <div style = {{display: 'none',fontSize:16}} id = "error-message">Concept not found</div>
        <div id = "loading-animation" class="lds-grid" style = {{visibility: 'visible'}}><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
      </div>}
      <div id = "content" style={{ visibility: loading || initialPrune ? 'hidden' : 'visible',opacity: loading || initialPrune ? 0 : 1 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/" replace />} />
          <Route path="/:urlCode" element={
            <Visualization
              color = {color}
              // setRoot = {setRoot}
              generateColor = {generateColor}
              getCounts = {getCounts}
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
              sourceData = {sourceData}
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
              annotations = {annotations}
              centers = {centers}
              setCenters = {setCenters}
              inclusions = {inclusions}
              setInclusions = {setInclusions}
              getAllDescendants = {getAllDescendants}
              linearLayout = {linearLayout}
              // linearLayoutTree = {linearLayoutTree}
              getInclusions = {getInclusions}
              edges = {edges}
              setEdges = {setEdges}
              maxDistance = {maxDistance}
              setMaxDistance = {setMaxDistance}
              subspaces = {subspaces}
              spaceSubspaces = {spaceSubspaces}
              visitTypeNames = {visitTypeNames}
            />      
          } />
        </Routes>
      </div>  
    </div> : null
  )
}

export default App;
