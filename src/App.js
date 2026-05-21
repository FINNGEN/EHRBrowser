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
  const fetchedRef = useRef(false)
  const [annotations,setAnnotations] = useState([{key:'PURCH',year:1995},{key:'REIMB',year:1964},{key:'PRIM_OUT',year:2011},{key:'INPAT',year:1969},{key:'OUTPAT',year:1998},{key:'CANC',year:1953},{key:'DEATH',year:1969},{key:'OPER_IN',year:1969},{key:'OPER_OUT',year:1969},{key:'BIRTH',year:1953}])
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
    const response = await fetch(`${API_BASE_URL}/sendFeedback`, {
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

  // *** get rid of this?
  function reset() {
    d3.select("#graph-section").style('width', "60vw")
    d3.select('#expand').style('display', 'block') 
    d3.select('#compress').style('display', 'none') 
    setGraphFilter({gender:-1,age:[-1]})
    setClassFilter(rootData.concept_relationships.filter(d => d.levels !== "Mapped from" && d.levels !== "Maps to").map(d => d.concept_class_id).filter((e,n,l) => l.indexOf(e) === n).filter(d => d !== undefined))
    setSidebarRoot({name:rootArray,data:rootData}) 
    setView('Set')
    // if (rootArray.length > 1) setView('Set')
    // else setView('Tree')
    setTreeSelections(['descendants'])
    setLevelFilter()
    setOpenFilters(true)
    setMapRoot([])
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
            let minDist = Infinity;
            
            neurons.forEach((neuron, index) => {
                const dist = jaccardDistance(neuron.weights, profile);
                if (dist < minDist) {
                    minDist = dist;
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
        let minDist = Infinity;

        neurons.forEach((neuron, index) => {
            const dist = jaccardDistance(neuron.weights, profile);
            if (dist < minDist) {
                minDist = dist;
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

  function linearLayout1(poset,nWidth) {
    // const barycenterSort = (sets, ids) => {
    //   const order = [...ids]
    //   const supersetCount = i => ids.filter(j => j !== i && po.isSubset(sets[ids.indexOf(i)], sets[ids.indexOf(j)])).length
    //   const toMove = [...ids].sort((a, b) => supersetCount(b) - supersetCount(a))
    //   for (const node of toMove) {
    //       const nodeVec = sets[ids.indexOf(node)]
    //       const supersets = order.filter(j => j !== node && po.isSubset(nodeVec, sets[ids.indexOf(j)]))
    //       if (supersets.length === 0) continue
    //       const positions = supersets.map(s => order.indexOf(s))
    //       const mid = Math.round(positions.reduce((a, b) => a + b, 0) / positions.length)
    //       order.splice(order.indexOf(node), 1)
    //       order.splice(mid, 0, node)
    //   }
    //   return order
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
    const countNonZeros = (subspace) => subspace.length > 1
          ? subspace.reduce((l1,l2)=>l1.map((v,n)=>v+l2[n])).filter(e=>e!==0).length
          : subspace[0].filter(e=>e!==0).length
    function spreadOverlap(nodes,w,center) {
      let nodeWidth
      const layerIndex = poset.layers.findIndex(i => i.includes(nodes[0]))
      if (layerIndex === poset.layers.length-1) nodeWidth = nWidth
      else nodeWidth = w/nodes.length
      let adjustment = nodes.length % 2 !== 0 ? 0 : nodeWidth/2
      let median = Math.floor(nodes.length/2) 
      const childrenArray = nodes.map(node => poset.getLower(node))
      const uniqueChildren = childrenArray.flat().filter((e,n,l) => l.indexOf(e) === n)
      const numChildren = childrenArray.map(array => array.length)
      // at least one node with all children -> spread evenly
      if (d3.max(numChildren) === uniqueChildren.length) {
        nodes.forEach(node => poset.features[node].x = nodes.findIndex(d => d === node) >= median ? center + ((nodes.findIndex(d => d === node) - median) * nodeWidth) + adjustment : center - ((median - nodes.findIndex(d => d === node)) * nodeWidth) + adjustment)
        nodes.forEach(node => poset.features[node].width = w/nodes.length)  
      } else {
        // spread based on counts ratio 
        const counts = nodes.map(node => poset.getLower(node).filter(child => poset.layers.findIndex(i => i.includes(child)) === layerIndex-1).length > 0 ? poset.getDownset(node) : [node]).map(array => array.length)
        const ratios = counts.map(count => count / d3.sum(counts))
        const widths = getWidths(ratios,w)
        const centroids = getCentroids(center-(w/2),widths)
        nodes.forEach((id,i) => {
          poset.features[id].x = centroids[i]
          poset.features[id].width = widths[i]
        })
      }  
    }
    const getWidths = (ratios,totalWidth) => ratios.map(ratio => ratio * totalWidth)
    const getCentroids = (acc,widths) => {
      return widths.map(w => {
        const center = acc + (w / 2)
        acc += w
        return center  
      })
    }
    const setPositions = (ids,widths,centroids) => {
      ids.forEach((array,i) => {
          if (array.length > 1) spreadOverlap(array,widths[i],centroids[i])
          else {
            array.forEach(id => {
              poset.features[id].x = centroids[i]
              poset.features[id].width = widths[i]
            })    
          }
        })
    }
    let prevSubsets
    for (let L = poset.layers.length-1; L >= 0; L--) {
      const {ids,subspaces} = po.findSubspaces(po.dominanceScores(poset,L))
      // re-order ids with linearEmbedding and barycenterSort
      let idArray = ids
      // for (let i = 0; i < subspaces.length; i++) {
      //   const LE = linearEmbedding(subspaces[i],ids[i])
      //   const sets = LE.neurons.flatMap(neu=>neu.bmus)
      //   const sspids = LE.neurons.flatMap(neu=>neu.bmusID)
      //   console.log('ordered',barycenterSort(sets, sspids))
      //   idArray[i] = barycenterSort(sets, sspids)
      // }
      // console.log('check',ids,idArray)
      // first layer
      if (L === poset.layers.length-1) {
        // set positioning for first layer
        const counts = subspaces.map(ssp=>countNonZeros(ssp))
        const widths = counts.map(count => count === 0 ? nWidth : count * nWidth)
        const centroids = getCentroids(0,widths)
        setPositions(idArray,widths,centroids)
      } else {
        // group subspaces by shared parents based on previous layer's subspaces
        const data = idArray.map((array,i) => ({ids:array,subspaces:subspaces[i],parents:array.map(id => poset.getUpper(id)).flat().filter((e,n,l) => l.indexOf(e) === n).filter(p => poset.layers.findIndex(i => i.includes(p)) === L+1)}))
        let clusters = prevSubsets.map(idList => ([...idList,...data.filter(d => idList.some(id => d.parents.includes(id)))]))
        clusters = clusters.map(inner => inner.filter(item => typeof item === "object" && !Array.isArray(item))).filter(inner => inner.length > 0)
        // set positioning for each group
        clusters.forEach(cluster => {
          const parents = cluster.map(c => c.parents).flat().filter((e,n,l) => l.indexOf(e) === n)
          const counts = cluster.map(c => c.subspaces).map(ssp=>countNonZeros(ssp)).map(c => c === 0 ? 1 : c)
          const ratios = counts.map(count => count / d3.sum(counts))
          const widths = getWidths(ratios,d3.sum(parents.map(p => poset.features[p].width)))
          const firstParent = parents.sort((a,b) => poset.features[a].x - poset.features[b].x)[0]
          const startX = poset.features[firstParent].x - (poset.features[firstParent].width/2)
          let centroids
          if (widths.length === 1) centroids = [d3.sum(parents.map(p => poset.features[p].x))/parents.length]
          else centroids = getCentroids(startX,widths)
          setPositions(cluster.map(c => c.ids),widths,centroids)
        })
      }
      prevSubsets = idArray
    }
  }
  function linearLayout2(poset, nWidth) {
    const allNodes = poset.elements
    const exp = 0.6
    const offset = 2

    const countNonZeros = (subspace) => subspace.length > 1
      ? subspace.reduce((l1,l2)=>l1.map((v,n)=>v+l2[n])).filter(e=>e!==0).length
      : subspace[0].filter(e=>e!==0).length

    // ---------------------------
    // 🔧 GLOBAL PRECOMPUTATION
    // ---------------------------
    const layerIndex = new Map()
    poset.layers.forEach((layer, i) => {
      for (const node of layer) layerIndex.set(node, i)
    })

    const lowerCache = new Map()
    const upperCache = new Map()
    const downsetCache = new Map()

    for (const node of allNodes) {
      lowerCache.set(node, poset.getLower(node))
      upperCache.set(node, poset.getUpper(node))
      downsetCache.set(node, poset.getDownset(node))
    }

    // ---------------------------
    // ⚡ BARYCENTER SORT
    // ---------------------------
    const barycenterSort = (ids, sets) => {
      const order = [...ids]
      const supersetCount = i => ids.filter(j => j !== i && po.isSubset(sets[ids.indexOf(i)], sets[ids.indexOf(j)])).length
      const toMove = [...ids].sort((a, b) => supersetCount(b) - supersetCount(a))
      for (const node of toMove) {
          const nodeVec = sets[ids.indexOf(node)]
          const supersets = order.filter(j => j !== node && po.isSubset(nodeVec, sets[ids.indexOf(j)]))
          if (supersets.length === 0) continue
          const positions = supersets.map(s => order.indexOf(s))
          const mid = Math.round(positions.reduce((a, b) => a + b, 0) / positions.length)
          order.splice(order.indexOf(node), 1)
          order.splice(mid, 0, node)
      }
      return order
    }

    // ---------------------------
    // ⚡ CLUSTERING
    // ---------------------------
    function buildClusters(prevSubsets, data) {
      const parentToCluster = new Map()

      prevSubsets.forEach((group, i) => {
        for (const id of group) {
          parentToCluster.set(id, i)
        }
      })

      const clusters = Array.from({ length: prevSubsets.length }, () => [])

      for (const item of data) {
        for (const p of item.parents) {
          const idx = parentToCluster.get(p)
          if (idx !== undefined) {
            clusters[idx].push(item)
            break
          }
        }
      }

      return clusters.filter(c => c.length > 0)
    }

    // ---------------------------
    // ⚡ SPREAD OVERLAP
    // ---------------------------
    function spreadOverlap(nodes, totalWidth, center) {
      const n = nodes.length
      if (!n) return

      const layer = layerIndex.get(nodes[0])
      const isLast = layer === poset.layers.length - 1

      const nodeWidth = isLast ? nWidth : totalWidth / n
      const half = Math.floor(n / 2)
      const offsetFix = n % 2 === 0 ? nodeWidth / 2 : 0

      const childrenArray = new Array(n)
      const childCounts = new Array(n)

      for (let i = 0; i < n; i++) {
        const children = lowerCache.get(nodes[i]) || []
        childrenArray[i] = children
        childCounts[i] = children.length
      }

      const uniqueChildren = new Set()
      for (const arr of childrenArray) {
        for (const c of arr) uniqueChildren.add(c)
      }

      const maxChildren = Math.max(...childCounts)

      // Even spread
      if (maxChildren === uniqueChildren.size) {
        for (let i = 0; i < n; i++) {
          const offset = (i - half) * nodeWidth + offsetFix
          poset.features[nodes[i]].x = center + offset
          poset.features[nodes[i]].width = totalWidth / n
        }
        return
      }

      // Proportional spread
      const counts = new Array(n)
      // let total = 0

      for (let i = 0; i < n; i++) {
        const node = nodes[i]

        const hasLower = (lowerCache.get(node) || []).some(
          c => layerIndex.get(c) === layer - 1
        )

        const arr = hasLower
          ? downsetCache.get(node) || [node]
          : [node]

        counts[i] = arr.length || 1
        // total += counts[i]
      }

      const adjustedCounts = counts.map(c => Math.pow(c + offset, exp) - Math.pow(offset, exp))
      const total = adjustedCounts.reduce((a,b)=>a+b,0)

      let acc = center - totalWidth / 2

      for (let i = 0; i < n; i++) {
        const w = (adjustedCounts[i] / total) * totalWidth
        const x = acc + w / 2

        poset.features[nodes[i]].x = x
        poset.features[nodes[i]].width = w

        acc += w
      }
    }

    // ---------------------------
    // MAIN LOOP
    // ---------------------------
    let prevSubsets

    for (let L = poset.layers.length - 1; L >= 0; L--) {

      const { ids, subspaces } = po.findSubspaces(
        po.dominanceScores(poset, L)
      )

      const idArray = []

      // Sort each subspace
      for (let i = 0; i < subspaces.length; i++) {
        const LE = linearEmbedding(subspaces[i], ids[i])
        const sets = LE.neurons.flatMap(neu => neu.bmus)
        const sspids = LE.neurons.flatMap(neu => neu.bmusID)

        idArray[i] = barycenterSort(sspids, sets)
      }

      // First layer
      if (L === poset.layers.length - 1) {
        const widths = subspaces.map(ssp=>countNonZeros(ssp)).map(count => count === 0 ? nWidth : count * nWidth)

        let acc = 0
        for (let i = 0; i < idArray.length; i++) {
          const width = widths[i]
          const center = acc + (width / 2)

          const nodes = idArray[i]
          if (nodes.length > 1) {
            spreadOverlap(nodes, width, center)
          } else {
            poset.features[nodes[0]].x = center
            poset.features[nodes[0]].width = width
          }

          acc += width
        }

      } else {
        const data = idArray.map((array, i) => {
          const parentsSet = new Set()

          for (const id of array) {
            const parents = upperCache.get(id) || []
            for (const p of parents) {
              if (layerIndex.get(p) === L + 1) {
                parentsSet.add(p)
              }
            }
          }

          return {
            ids: array,
            subspaces: subspaces[i],
            parents: [...parentsSet]
          }
        })

        const clusters = buildClusters(prevSubsets, data)

        for (const cluster of clusters) {
          const parentSet = new Set()
          for (const c of cluster) {
            for (const p of c.parents) parentSet.add(p)
          }

          const parents = [...parentSet]

          let totalWidth = 0
          for (const p of parents) {
            totalWidth += poset.features[p].width
          }

          let startX = Infinity
          for (const p of parents) {
            const x = poset.features[p].x
            const w = poset.features[p].width
            startX = Math.min(startX, x - w / 2)
          }

          // ---- compute counts using your function ----
          const counts = new Array(cluster.length)

          for (let i = 0; i < cluster.length; i++) {
            let count = countNonZeros(cluster[i].subspaces)
            if (count === 0) count = 1

            counts[i] = count
          }

          const adjustedCounts = counts.map(c => Math.pow(c + offset, exp) - Math.pow(offset, exp))
          const totalCount = adjustedCounts.reduce((a,b)=>a+b,0)

          // ---- compute widths ----
          const widths = new Array(cluster.length)
          for (let i = 0; i < cluster.length; i++) {
            widths[i] = (adjustedCounts[i] / totalCount) * totalWidth
          }

          // ---- assign positions ----
          let acc = startX

          for (let i = 0; i < cluster.length; i++) {
            const c = cluster[i]
            const width = widths[i]
            let center
            if (cluster.length === 1) center = d3.sum(parents.map(p => poset.features[p].x))/parents.length
            else center = acc + width / 2
            const nodes = c.ids

            if (nodes.length > 1) {
              spreadOverlap(nodes, width, center)
            } else {
              const node = nodes[0]
              poset.features[node].x = center
              poset.features[node].width = width
            }

            acc += width
          }
        }
      }

      prevSubsets = idArray
    }
  }

  function linearLayout(poset,width) {
    const countNonZeros = (subspace) => subspace.length > 1
        ? subspace.reduce((l1,l2)=>l1.map((v,n)=>v+l2[n])).filter(e=>e!==0).length
        : subspace[0].filter(e=>e!==0).length

    const bb = poset.layers.map((l,n)=>({n:n, l:l, deg:l.map(node=>poset.featureOf(node,"node_degree")).reduce((acc,el)=>acc+el)})).sort((a,b)=>b.deg-a.deg)[0]
    const L = bb.n

    const trees = po.findSubspaces(po.dominanceScores(poset,poset.layers.length-1))
    // trees.counts = trees.subspaces.map(ssp=>countNonZeros(ssp))
    trees.descendants = trees.ids.map(group => group.map(id => poset.getDownset(id)).flat().filter((e,n,l) => l.indexOf(e) === n))
    trees.counts = trees.descendants.map(d => d3.max(poset.layers.map(layer => layer.filter(l => d.includes(l))).map(l => l.length)))

    const {ids,subspaces} = po.findSubspaces(po.dominanceScores(poset,L))
    // const counts = subspaces.map(ssp=>countNonZeros(ssp))
    
    //TODO: not using the useless zeroes would be nice
    // const unit_h = height / poset.layers.length
    // const unit_w = width / subspaces.flat().length
    const unit_w = width

    const bbIds = subspaces.map((ssp,n)=>{
        const LE = linearEmbedding(ssp,ids[n])
        // console.log(LE)
        if(ssp.length>1){
            const sets = LE.neurons.flatMap(neu=>neu.bmus)
            const sspids = LE.neurons.flatMap(neu=>neu.bmusID)
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
            return barycenterSort(sets, sspids);
        }
        return LE.neurons.flatMap(neu=>neu.bmusID)
    }).flat()

    const groupedByTree = trees.ids.map((ids,i) => ({counts:trees.counts[i],bbIds:bbIds.filter(i => ids.some(id => poset.getUpset(i).includes(id)))}))
    groupedByTree.forEach(group => {
      let acc = 0
      group.bbIds.forEach((id,n)=>{
        const x = acc + unit_w/2
        poset.featureOf(id,"x",x)
        acc += unit_w
      })
      // acc += group.counts*unit_w + unit_w
    })

    const propagate = (start,f) =>{
      const below = poset.layers.slice(0, start).reverse()
      const above = poset.layers.slice(start + 1)
      below.forEach(l => f(l,poset.layers.findIndex(i => i === l),'up'))
      above.forEach(l => f(l,poset.layers.findIndex(i => i === l),'down'))
    }

    const setX = (e,n,direction) => {
      let idealPositions,sortedPositions,emptyNodes

      function spreadAroundCentroid(nodes,centroid,w) {
        const adjustment = nodes.length % 2 !== 0 ? 0 : w/2
        const median = Math.floor(nodes.length/2) 
        const sorted = nodes
          .map((n,i) => ({ node: n, x: i >= median ? centroid+((i-median)*w)+adjustment : centroid-((median-i)*w)+adjustment}))
          .sort((a, b) => a.x - b.x);
        sorted.forEach(d => {
          idealPositions.set(d.node, d.x)
          poset.featureOf(d.node, "x", d.x)
        });
        if (sortedPositions.length > 0) shiftByGroup(sorted,w) 
        else sortedPositions = [sorted]
      }
      function shiftByGroup(group,minDist) {
        const ref = group[0]
        const prevGroup = sortedPositions[sortedPositions.length-1]
        const prev = prevGroup[prevGroup.length-1]

        if (ref.x < prev.x || ref.x-prev.x < minDist) {
          const shifted = group.map((d,i) => ({node:d.node,x:prev.x+minDist+(minDist*i)}))
          shifted.forEach(d => {
            idealPositions.set(d.node, d.x)
            sortedPositions = [...sortedPositions,shifted]
            poset.featureOf(d.node, "x", d.x)
          });
        } else sortedPositions = [...sortedPositions,group]
      }
      function resolveCollisions(nodes, minDist) {
        let sorted = nodes
          .filter(n => !emptyNodes.includes(n))
          .map(n => ({ node: n, x: idealPositions.get(n) }))
          .sort((a, b) => a.x - b.x);
        const empties = emptyNodes.map((n,i)=> ({node:n,x:sorted[sorted.length-1].x+(minDist*i)}))
        sorted = [...sorted,...empties]

        // --- forward pass (push right)
        for (let i = 1; i < sorted.length; i++) {
          const prev = sorted[i - 1];
          const curr = sorted[i];
          if (curr.x < prev.x + minDist) {
            curr.x = prev.x + minDist;
          }
        }

        // --- backward pass (push left)
        for (let i = sorted.length - 2; i >= 0; i--) {
          const curr = sorted[i];
          const next = sorted[i + 1];
          if (curr.x > next.x - minDist) {
            curr.x = next.x - minDist;
          }
        }

        // --- recenter to original centroid
        const originalCenter =
          nodes.map(n => idealPositions.get(n)).reduce((a, b) => a + b, 0) / nodes.length;

        const newCenter =
          sorted.map(d => d.x).reduce((a, b) => a + b, 0) / sorted.length;

        const shift = originalCenter - newCenter;

        // --- apply corrected positions
        sorted.forEach(d => {
          const corrected = d.x + shift;
          idealPositions.set(d.node, corrected);
          poset.featureOf(d.node, "x", corrected);
        });
      }

      const groupedByTree = trees.descendants.map((d,i) => e.filter(l => d.includes(l) || trees.ids[i].includes(l)))
      groupedByTree.forEach((layer,index) => {
        idealPositions = new Map();
        sortedPositions = []
        emptyNodes = []
        layer.forEach((node,i) => {
          let x
          const refs = direction === 'up' ? poset.getUpper(node) : poset.getLower(node);
          const values = poset.featureOf(refs, "x").filter(v => v !== undefined);
          if (values.length) {
            x = values.reduce((a, b) => a + b, 0) / values.length;
          }
          if (!x) {
            if (poset.featureOf(node,'x') == null) {
              x = 0
              emptyNodes.push(node)
            } else x = poset.featureOf(node,'x')
          }
          idealPositions.set(node, x);
        });
        const grouped = new Map();
        for (const [key, value] of idealPositions) {
            if (!grouped.has(value)) {
                grouped.set(value, []);
            }
            grouped.get(value).push(key);
        }
        const sortedGroups = new Map(
          [...grouped.entries()].sort((a, b) => a[0] - b[0])
        );
        for (const [value, keys] of sortedGroups) {
            if (keys.length > 1) spreadAroundCentroid(keys,value,unit_w)
            else {
              poset.featureOf(keys[0], "x", value)
              const group = keys.map(id => ({node:id,x:value}))
              if (sortedPositions.length > 0) shiftByGroup(group,unit_w)
              else sortedPositions = [group]
            }
        }
        resolveCollisions(layer,unit_w)
      })
    }

    const topDown = () => {
      for (let i = poset.layers.length-1; i > 0; i--) {
          setX(poset.layers[i], i, 'down');
      }  
    }
    const bottomUp = () => {
      for (let i = 0; i < poset.layers.length-1; i++) {
          setX(poset.layers[i], i, 'up');
      }
    }

    const iterations = 3
    for (let i = 0; i < iterations; i++) {
      propagate(L,setX)
      topDown()
    }
    // *** shift each tree based on max x of previous tree ***

    let descendantsByTree = trees.descendants.map((descendants,i) => ({descendants:[...descendants,...trees.ids[i]],max:d3.max(poset.featureOf([...descendants,...trees.ids[i]], "x"))}))
    console.log(descendantsByTree)
    descendantsByTree.forEach((obj,i) => {
      if (i !== 0) {
        const max = descendantsByTree[i-1].max + (unit_w*3)
        obj.descendants.forEach(d => poset.featureOf(d,'x',poset.featureOf(d,'x') + max))
        descendantsByTree = descendantsByTree.map(obj => ({...obj,max:d3.max(poset.featureOf(obj.descendants, "x"))}))
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
  
  function createInitialStates(data,trees,filterClass,filterLevel,filteredClassList) {
    console.log('run',data)
    // set nodes 
    const subsumesData = data.concept_relationships.filter(d => d.levels !== "Mapped from" && d.levels !== "Maps to")
    const mappingData = data.concept_relationships.filter(d => d.levels === "Mapped from" || d.levels === "Maps to")
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
    nodeData = nodeData.map(e=>({
        'name': e.child_concept_id, 
        'distance': subsumesData.map(d => d.levels).includes('-1') ? e.levels === "-1" ? 0 : parseInt(e.levels.split('-')[0]) + 1 : parseInt(e.levels.split('-')[0]), 
        'levels': e.levels,
        'relationship': e.levels,
        'class': e.concept_class_id,
        'color': generateColor(e.child_concept_id),
        'leaf': !subsumesData.map(d => d.parent_concept_id).includes(e.child_concept_id) ? true : false,
        'parents': rootArray.includes(e.child_concept_id) ? subsumesData.filter(d => d.parent_concept_id === e.child_concept_id).filter(d => d.levels === '-1').map(d => d.child_concept_id).concat(subsumesData.filter(d => d.child_concept_id === e.child_concept_id).map(d => d.parent_concept_id).filter(p => parseInt(e.levels.split('-')[0]) > parseInt(subsumesData.filter(n => n.child_concept_id === p)[0].levels.split('-')[0])).flat()) : e.levels === "-1" ? [] : subsumesData.filter(d => d.child_concept_id === e.child_concept_id).map(d => d.parent_concept_id).filter(p => parseInt(e.levels.split('-')[0]) > parseInt(subsumesData.filter(n => n.child_concept_id === p)[0].levels.split('-')[0])),
        'children': e.levels === "-1" ? subsumesData.filter(d => d.child_concept_id === e.child_concept_id).map(d => d.parent_concept_id) : subsumesData.filter(d => d.parent_concept_id === e.child_concept_id && d.child_concept_id !== e.child_concept_id).map(d => d.child_concept_id),
        'connections': [],
        'total_counts': getCounts(data.stratified_code_counts.filter(d => d.concept_id === e.child_concept_id),'node_record_counts'),
        'descendants': [...getAllDescendants(subsumesData,e.child_concept_id,[]),e.child_concept_id],
        'data': {code_counts: data.stratified_code_counts.filter(d => d.concept_id === e.child_concept_id), concept: data.concepts.filter(d => d.concept_id === e.child_concept_id)[0]}
    })) 
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
    // posets
    // const posetArray = []
    // const width = window.innerWidth*0.4
    // const nodeWidth = mappingData.map(d => d.levels).includes('Maps to') && mappingData.map(d => d.levels).includes('Mapped from') ? 160 : 140
    // const spacingUnit = nodeWidth + 40
    const depthScale = d3.scaleLinear(d3.extent(nodeData.map(d => d.distance)), [20,70])
    let colors = {}
    // let positions = {}
    let distances = {}
    // let centerArray = []
    // iterate through trees
    // trees.forEach((tree,index) => {
    //   const edges = tree
    //     .filter(d => d.levels !== "Mapped from" && d.levels !== "Maps to")
    //     .filter(d => subsumesData.length === 1 && d.parent_concept_id === d.child_concept_id ? d : d.parent_concept_id !== d.child_concept_id)
    //     // .filter(d => d.levels !== "-1")
    //     .map(d => d.levels === "-1" ? ({...d,parent_concept_id: d.child_concept_id,child_concept_id: d.parent_concept_id}) : d)
    //     .map(d => ([d.parent_concept_id.toString(),d.child_concept_id.toString()]))
    //   const {matrix,nodes} = po.domFromEdges(edges)
    //   const poset = po.createPoset(matrix,nodes)
    //   poset
    //     .enrich()
    //     .feature("depth",node => nodeData.filter(d => d.name === parseInt(node))[0].distance)
    //     .setSubstructure("depth","depth")
    //     .setLayers()
    //     .feature("parents",node => nodeData.filter(d => d.name === parseInt(node))[0].parents)
    //   // set x
    //   // const layers = poset.analytics.substructures.depth
    //   const layers = poset.layers.reverse()
    //   // const classes = tree.map(d => d.concept_class_id)
    //   // const maxLevel = d3.max(tree.filter(d => d.levels !== '-1' && d.levels !== "Mapped from" && d.levels !== "Maps to").map(d => parseInt(d.levels.split('-')[0]) + 1))
    //   // *** set based on width of biggest layer
    //   // if ((!filterClass && !filterLevel) || (filterClass && (!classes.includes('Ingredient') && !classes.includes('Clinical Drug Comp'))) || (filterLevel && maxLevel <= 3)) {  
    //   if (!filterClass && !filterLevel) {
    //     const thisWidth = d3.max(layers, d => d.length)*spacingUnit
    //     centerArray.push(thisWidth)
    //     let center = d3.sum(centerArray) - thisWidth/2
    //     // layers = layers.reverse()
    //     layers.forEach((layer,i) => {
    //       // const center = (width/trees.length)/2 + (width)*index + buffer
    //       if (i === 0) {
    //         // let unit = (width/trees.length)/layer.length
    //         let adjustment = layer.length % 2 !== 0 ? 0 : nodeWidth/2
    //         let median = Math.floor(layer.length/2) 
    //         layer.forEach((node,i) => poset.features[node].x = i >= median ? center + ((i - median) * nodeWidth) + adjustment : center - ((median - i) * nodeWidth) + adjustment)
    //         // layer.forEach((node,i) => poset.features[node].x = unit >= nodeWidth ? unit*i + unit/2 + (width)*index + buffer : i >= median ? center + ((i - median) * nodeWidth) + adjustment : center - ((median - i) * nodeWidth) + adjustment)
    //       } else {
    //         let xPositions = []
    //         // let unit = (width/trees.length)/layer.length
    //         let adjustment = layer.length % 2 !== 0 ? 0 : nodeWidth/2
    //         let median = Math.floor(layer.length/2) 
    //         layer.forEach(node => {
    //           xPositions.push({id:node,x: d3.sum(poset.features[node].parents.map(parent => poset.features[parent].x))/poset.features[node].parents.length})})
    //         xPositions.sort((a, b) => d3.ascending(a.x, b.x))
    //         let minDistance = d3.min(d3.pairs(xPositions, (a, b) => b.x - a.x))
    //         if (minDistance < nodeWidth && layer.length > 1) {
    //           layer.forEach(node => poset.features[node].x = xPositions.findIndex(d => d.id === node) >= median ? center + ((xPositions.findIndex(d => d.id === node) - median) * nodeWidth) + adjustment : center - ((median - xPositions.findIndex(d => d.id === node)) * nodeWidth) + adjustment)
    //           // layer.forEach(node => poset.features[node].x = unit >= nodeWidth ? unit*xPositions.findIndex(d => d.id === node) + unit/2 + (width)*index + buffer : xPositions.findIndex(d => d.id === node) >= median ? center + ((xPositions.findIndex(d => d.id === node) - median) * nodeWidth) + adjustment : center - ((median - xPositions.findIndex(d => d.id === node)) * nodeWidth) + adjustment)
    //         } else layer.forEach(node => poset.features[node].x = xPositions.find(d => d.id === node)?.x)
    //       }
    //     })
    //     // set distance and positions list
    //     poset.elements.forEach(name => {
    //       // colors[name] = `hsl(${colorPoset.features[name].pTheta},${colorPoset.features[name].pAlpha*100}%,${depthScale(poset.features[name].depth)}%)` 
    //       positions[name] = poset.features[name].x
    //       distances[name] = layers.findIndex(i => i.includes(name))
    //     })    
    //   } 
    //   else {
    //     // const thisWidth = (d3.max(layers, d => d.length)/2)*nodeWidth
    //     // centerArray.push(thisWidth)
    //     // set distance and positions list
    //     poset.elements.forEach(name => {
    //       // colors[name] = `hsl(${colorPoset.features[name].pTheta},${colorPoset.features[name].pAlpha*100}%,${depthScale(poset.features[name].depth)}%)` 
    //       // positions[name] = 0
    //       distances[name] = layers.findIndex(i => i.includes(name))
    //     })
    //   }
    //   posetArray.push(poset)
    // })
    // set color
    const combinedEdges = trees.flat()
    let edges = combinedEdges 
      .filter(d => d.levels !== "Mapped from" && d.levels !== "Maps to")
      .map(d => d.levels === "-1" ? ({...d,parent_concept_id: d.child_concept_id,child_concept_id: d.parent_concept_id}) : d)
      .map(d => ([d.parent_concept_id.toString(),d.child_concept_id.toString()]))
    if (edges.length > 1) edges = edges.filter(d => d[0] !== d[1])
      // console.log('edges',edges)
    const {matrix,nodes} = po.domFromEdges(edges)
    const poset = po.createPoset(matrix,nodes)
    poset.enrich()
      .setLayers()
      .color(80,25,90)
      .feature("lower_bound",(node)=>poset.getLower(node))
      .feature("upper_bound",(node)=>poset.getUpper(node))
      .feature("node_degree",(node,f)=>f.lower_bound.length+f.upper_bound.length)
    if (!filterClass && !filterLevel) linearLayout(poset,150) 
    const layers = poset.layers.reverse()
    poset.elements.forEach(name => {
        distances[name] = layers.findIndex(i => i.includes(name))
        colors[name] = `hsl(${poset.features[name].pTheta},${poset.features[name].pAlpha*100}%,${depthScale(poset.layers.findIndex(i => i.includes(name)))}%)`})
    // update color, position, and distance
    nodeData = nodeData.map(d => ({...d,distance:distances[d.name], color: colors[d.name] ? colors[d.name] : d.color,x:poset.featureOf(d.name,"x") ? poset.featureOf(d.name,"x") : 0}))
    setColorList(colors)
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
          'color': colors[e.child_concept_id] ? colors[e.child_concept_id] : generateColor(e.child_concept_id),
          'total_counts': getCounts(data.stratified_code_counts.filter(d => d.concept_id === e.child_concept_id),'node_record_counts'),
          'descendant_counts': data.concepts.find(c => c.concept_id === e.child_concept_id).descendant_record_counts,
          'data': {code_counts: data.stratified_code_counts.filter(d => d.concept_id === e.child_concept_id),concept: data.concepts.filter(d => d.concept_id === e.child_concept_id)[0]}
          })).sort((a, b) => b.total_counts - a.total_counts)
      }))
    nodeData.forEach(node => {node.mappings.forEach(map => colors[map.name] = map.color)})
    // set links
    const nodeNames = nodeData.map(d => d.name)
    const linkData = subsumesData.filter(d => d.parent_concept_id !== d.child_concept_id).map(d=>({...d, source: d.levels === "-1" ? nodeData[nodeNames.indexOf(d.child_concept_id)] : nodeData[nodeNames.indexOf(d.parent_concept_id)], target: d.levels === "-1" ? nodeData[nodeNames.indexOf(d.parent_concept_id)] : nodeData[nodeNames.indexOf(d.child_concept_id)]}))
    // set extent
    let extentData = d3.extent(selectedNodes.map(d => d.data.code_counts).flat().map(d => d.calendar_year))
    if (!extentData[0] || !extentData[1]) extentData = rootExtentData
    setExtent(extentData) 
    // set states
    setEdges(edges)
    setPoset(poset)
    setPruned(false)
    setFullTree({relationships:subsumesData,trees:trees,nodes:nodeData,links:linkData,selected:selectedNodes,mappings:mappingData.map(d => d.child_concept_id),edges:edges})
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
      // setLoading(false)
    }
  },[conceptList])

  // on root load
  useEffect(()=>{
    if (!root) {
      setRootData([])
      setRootLabels([])
      setIsConceptSet(false)
      setSearchOnly(true)
    } else {
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
      let trees = [dataArray[0].concept_relationships]
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
        trees = filteredData.map(d => d.concept_relationships)
        combinedData.concept_relationships = trees.flat()
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
      setGraphFilter({gender:-1,age:[-1]})
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
      createInitialStates(combinedData,trees,filterClass,filterLevel,filteredClassList)  
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
        setExpression = {setExpression}
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
              annotations = {annotations}
              centers = {centers}
              setCenters = {setCenters}
              inclusions = {inclusions}
              setInclusions = {setInclusions}
              getAllDescendants = {getAllDescendants}
              linearLayout = {linearLayout}
              getInclusions = {getInclusions}
              edges = {edges}
              setEdges = {setEdges}
            />      
          } />
        </Routes>
      </div>  
    </div> : null
  )
}

export default App;
