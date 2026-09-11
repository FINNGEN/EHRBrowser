import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Navigate, Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';
import finngen from './img/finnGen_logo.svg'
import CryptoJS from "crypto-js";
import Header from './components/header'
import Visualization from './components/visualization'
import { faX } from '@fortawesome/free-solid-svg-icons'
import * as d3 from "d3";
import po from './po.js';
import { HLL_COUNT } from './mergeHll.js';
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
  const [rootConcepts,setRootConcepts] = useState()
  const [graphFilter, setGraphFilter] = useState({gender:-1,age:[-1],source:[-1]})
  const [extent,setExtent] = useState()
  const [mapRoot,setMapRoot] = useState([])
  const [conceptList, setConceptList] = useState([])
  const [nodes, setNodes] = useState([])
  const [links, setLinks] = useState([])
  const [view, setView] = useState('set')
  const [rootLine, setRootLine] = useState()
  const [rootExtent, setRootExtent] = useState()
  const [listIndexes, setListIndexes] = useState()
  const [relationship, setRelationship] = useState('descendants')
  const [openFilters,setOpenFilters] = useState(true)
  const [levelFilter, setLevelFilter] = useState()
  const [classFilter, setClassFilter] = useState(['All'])
  const [descendantsFilter, setDescendantsFilter] = useState([])
  const [excludeList, setExcludeList] = useState([])
  const [pruned, setPruned] = useState(false)
  // const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [poset, setPoset] = useState()
  const [subsumesData, setsubsumesData] = useState()
  const [fullTree, setFullTree] = useState({})
  const [crossConnections, setCrossConnections] = useState()
  const [drawingComplete, setDrawingComplete] = useState(true)
  const [initialPrune, setInitialPrune] = useState(false)
  const [apiInfo, setApiInfo] = useState()
  const [visible,setVisible] = useState(false)
  const [removedClasses,setRemovedClasses] = useState([])
  const [hovered,setHovered] = useState([])
  const [colorList,setColorList] = useState([])
  const [fullClassList,setFullClassList] = useState([])
  const [version, setVersion] = useState()
  const [allVocabularies, setAllVocabularies] = useState([])
  const [searchFilter, setSearchFilter] = useState([])
  const [refresh,setRefresh] = useState(false)
  const [inclusions, setInclusions] = useState([])
  const [expression, setExpression] = useState([])
  const [edges, setEdges] = useState([])
  // const [maxDistance, setMaxDistance] = useState()
  const [subspaces, setSubspaces] = useState()
  const [visitTypeNames, setVisitTypeNames] = useState()
  const [countType,setCountType] = useState('record')
  const [stackData, setStackData] = useState([])
  const [expandedSearch, setExpandedSearch] = useState(true)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [searchIndex, setSearchIndex] = useState(null)
  const [treeDataArray,setTreeDataArray] = useState()
  const [treeData,setTreeData] = useState()
  const [countsDataArray,setCountsDataArray] = useState()
  const [countsData,setCountsData] = useState()
  const [filteredCounts,setFilteredCounts] = useState()
  const [upsetData,setUpsetData] = useState()
  const [personFilterData,setPersonFilterData] = useState()
  const [graphLoading,setGraphLoading] = useState(false)
  const fetchedRef = useRef(false)
  const [nWidth,setNWidth] = useState(200)
  const personMax = 25
  const [yearSelection, setYearSelection] = useState(null)
  const [maxPersonLevel,setMaxPersonLevel] = useState()
  const [annotations,setAnnotations] = useState([{key:'PURCH',year:1995},{key:'REIM',year:1964},{key:'PRIM_OUT',year:2011},{key:'INPAT',year:1969},{key:'OUTPAT',year:1998},{key:'CANC',year:1953},{key:'DEATH',year:1969},{key:'OPER_IN',year:1969},{key:'OPER_OUT',year:1969},{key:'BIRTH_MOTHER',year:1953}])
  const [categories, setCategories] = useState([
    {key:'Long.',codes:['INPAT','OPER_IN','OPER_OUT','OUTPAT','PRIM_OUT','REIM','DEATH','PURCH','CANC']},
    {key:'Reg.',codes:['KANTA','BIOBANK','KIDNEY','VISION','BIRTH_MOTHER']},
    {key:'Drug',codes:['PRESCRIPTION','DELIVERY','PRESCRIPTION_DELIVERY','DELIVERY_KELA','PRESCRIPTION_DELIVERY_KELA']}
  ])

  const maxLevel = useMemo(() => nodes ? d3.max(nodes.map(d => d.distance)) : null,[nodes])
  const fullTreeMax = useMemo(() => fullTree.nodes ? d3.max(fullTree.nodes.map(d => d.distance)) : null,[fullTree.nodes])
  const allClasses = useMemo(() => fullTree.nodes ? fullTree.nodes.map(d => d.class).filter((e,n,l) => l.indexOf(e) === n).filter(d => d !== undefined) : null,[fullTree.nodes,levelFilter])
  const years = useMemo(() => extent ? Array.from({ length: extent[1] - extent[0] + 1 }, (_, i) => extent[0] + i) : null,[extent])

  const fullTreeNodeMap = useMemo(() => {
    const map = new Map()
    if (fullTree.nodes) fullTree.nodes.forEach(n => map.set(n.name, n))
    return map
  }, [fullTree.nodes])

  const allNodesMap = useMemo(() => {
    const map = new Map()
    if (fullTree.allNodes) fullTree.allNodes.forEach(n => map.set(n.name, n))
    return map
  }, [fullTree.allNodes])
  
  const loadNews = async () => {
    const res = await fetch('/NEWS.md')
    const text = await res.text()
    const firstLine = text.split('\n')[0]
    const index = firstLine.indexOf('v')
    const version = index !== -1 ? firstLine.slice(index) : ""
    setVersion(version)
  }

  const normalizeVisitTypeName = (row) => {
    const rawVisitGroupConceptId = row.visitGroupConceptId ?? row.visit_group_concept_id ?? row.visitgroupconceptid ?? row.concept_id ?? row.conceptId ?? row.conceptid
    const visitGroupConceptId = rawVisitGroupConceptId == null ? undefined : Number(rawVisitGroupConceptId)
    const conceptName = row.conceptName ?? row.concept_name ?? row.conceptname ?? row.name
    const conceptCodeRaw = row.conceptCode ?? row.concept_code ?? row.conceptcode ?? conceptName ?? (visitGroupConceptId != null ? String(visitGroupConceptId) : undefined)
    const conceptCode = typeof conceptCodeRaw === 'string' ? conceptCodeRaw.toUpperCase() : conceptCodeRaw
    return {
      ...row,
      visitGroupConceptId,
      conceptCode,
      conceptName
    }
  }

  const getVisitGroupConceptId = (row) => {
    const rawId = row.visit_group_concept_id ?? row.visitGroupConceptId ?? row.visit_source_group_concept_id ?? row.visitSourceGroupConceptId ?? row.concept_id ?? row.conceptId
    return rawId == null ? undefined : Number(rawId)
  }

  // set filtered counts and extent when selections change
  useEffect(() => {
    // all counts data
    const counts = selectedConcepts.filter(d => !d.leaf).map(d => d.data.code_counts).flat()
    const descendantCounts = selectedConcepts.filter(d => d.leaf).map(d => ({name:d.name,counts:d.data.descendant_code_counts}))
    const allCounts = [...counts,...descendantCounts.map(d => d.counts).flat()]
    const countsObj =  {counts:counts,descendantCounts:descendantCounts,all:allCounts} 

    // apply graph filters if active
    let filtered = {}
    if (graphFilter.gender !== -1 || graphFilter.age.length > 1 || !graphFilter.source.includes(-1)) {
      let counts = countsObj.counts
      if (graphFilter.gender !== -1) counts = counts.filter(e => e.gender_concept_id === graphFilter.gender)
      if (graphFilter.age.length > 1) counts = counts.filter(e => graphFilter.age.includes(e.age_decile))
      if (!graphFilter.source.includes(-1)) counts = counts.filter(e => graphFilter.source.includes(getVisitGroupConceptId(e)))
      let dCounts = []
      countsObj.descendantCounts.forEach(obj => {
        let counts = obj.counts
        if (graphFilter.gender !== -1) counts = counts.filter(e => e.gender_concept_id === graphFilter.gender)
        if (graphFilter.age.length > 1) counts = counts.filter(e => graphFilter.age.includes(e.age_decile))
        if (!graphFilter.source.includes(-1)) counts = counts.filter(e => graphFilter.source.includes(getVisitGroupConceptId(e)))
        dCounts.push(counts)
      })
      const descendantCounts = countsObj.descendantCounts.map((obj,i) => ({...obj,counts:dCounts[i]}))
      const allCounts = [...counts,...descendantCounts.map(d => d.counts).flat()]
      filtered = {counts:counts,descendantCounts:descendantCounts,all:allCounts}
    } else {filtered = countsObj} 

    // extent
    let extent1 = []
    let extent2 = rootExtent
    let selectedExtent = d3.extent(filtered.all.map(d => d.calendar_year)) 
    if (!selectedExtent[0] || !selectedExtent[1]) setExtent(extent2)
    else {
        if (selectedExtent[0] <= extent2[0]) extent1[0] = selectedExtent[0] 
        else extent1[0] = extent2[0]
        if (selectedExtent[1] >= extent2[1]) extent1[1] = selectedExtent[1] 
        else extent1[1] = extent2[1]
        setExtent(extent1) 
    }
    setFilteredCounts(filtered)
  },[selectedConcepts,graphFilter])

  // make stack data 
  // SHOULD EXTENT TRIGGER THIS INSTEAD OF HAVING YEARS MEMO? 
  function getStack() {
    if (!filteredCounts || filteredCounts.all.length === 0) return []

    const rollupA = new Map()
    for (const row of filteredCounts.counts) {
      const year = row.calendar_year
      const id = row.concept_id
      const key = `${year}__${id}`
      const current = rollupA.get(key) ?? 0
      const value = row.node_record_counts ?? 0
      rollupA.set(key, current + value)
    }

    const rollupB = new Map()
    for (const item of filteredCounts.descendantCounts) {
      const id = item.name
      for (const row of item.counts) {
        const year = row.calendar_year
        const key = `${year}__${id}`
        const current = rollupB.get(key) ?? 0
        const value = row.node_record_counts ?? 0
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
  useEffect(() => {setStackData(getStack())}, [filteredCounts])

  // get data for graph filters
  const genderData = useMemo(() => {
    console.log('make filters',filteredCounts,personFilterData,extent,countType)
    if (extent && filteredCounts.all.length > 0) {
      if (countType === 'record') {
        let genderDataVar = []
        const genders = [8507,8532]
        let sums = []
        genders.forEach(g => selectedConcepts.forEach(d => sums.push({id: g, sum: d.leaf ? getCounts(d.data.descendant_code_counts.filter(e => (e.calendar_year >= extent[0] && e.calendar_year <= extent[1])).filter(e => e.gender_concept_id === g),'node_record_counts') : getCounts(d.data.code_counts.filter(e => (e.calendar_year >= extent[0] && e.calendar_year <= extent[1])).filter(e => e.gender_concept_id === g),'node_record_counts')})))
        genders.forEach(g => genderDataVar.push({id:g, sum:d3.sum(sums.filter(d => d.id === g).map(d => d.sum))}))
        return genderDataVar   
      } 
      else if (countType === 'person' && personFilterData) {
         if (personFilterData.length > 0) {
          return personFilterData.filter(f => f.filter === 'sex').map(f => ({id:f.stratum,sum:f.person_counts})) 
         }
      }
    }
  },[filteredCounts,personFilterData,extent,countType])

  const ageData = useMemo(() => {
    if (extent) {
      if (countType === 'record') {
        let ageDataVar = []
        const ages = [0,1,2,3,4,5,6,7,8,9]
        let ageSums = []
        ages.forEach(a => selectedConcepts.forEach(d => ageSums.push({id: a, sum: d.leaf ? getCounts(d.data.descendant_code_counts.filter(e => (e.calendar_year >= extent[0] && e.calendar_year <= extent[1])).filter(e => e.age_decile === a),'node_record_counts') : getCounts(d.data.code_counts.filter(e => (e.calendar_year >= extent[0] && e.calendar_year <= extent[1])).filter(e => e.age_decile === a),'node_record_counts')})))
        ages.forEach(a => ageDataVar.push({id:a, sum: d3.sum(ageSums.filter(d => d.id === a).map(d => d.sum))}))
        return ageDataVar   
      } 
      else if (countType === 'person' && personFilterData) {
        if (personFilterData.length > 0) {
          return personFilterData.filter(f => f.filter === 'age').map(f => ({id:f.stratum,sum:f.person_counts}))
        }
      }
    }
  },[filteredCounts,personFilterData,extent,countType])

  const sourceData = useMemo(() => {
    if (visitTypeNames && extent) {
      if (countType === 'record') {
        let sourceSums = []
        visitTypeNames.forEach(obj => selectedConcepts.forEach(d => sourceSums.push({id: obj.visitGroupConceptId,sum: d.leaf ? getCounts(d.data.descendant_code_counts.filter(e => (e.calendar_year >= extent[0] && e.calendar_year <= extent[1])).filter(e => getVisitGroupConceptId(e) === obj.visitGroupConceptId),'node_record_counts') : getCounts(d.data.code_counts.filter(e => (e.calendar_year >= extent[0] && e.calendar_year <= extent[1])).filter(e => getVisitGroupConceptId(e) === obj.visitGroupConceptId),'node_record_counts')})))
        const sourceDataVar = categories.map(obj => ({key:obj.key,codes:visitTypeNames.filter(d => obj.codes.includes(d.conceptCode)).map(d => ({id:d.visitGroupConceptId,code:d.conceptCode,name:d.conceptName,sum:d3.sum(sourceSums.filter(s => s.id === d.visitGroupConceptId).map(s => s.sum))}))}))
        const categorizedCodes = new Set(categories.map(obj => obj.codes).flat())
        const otherCodes = visitTypeNames
          .filter(d => !categorizedCodes.has(d.conceptCode))
          .map(d => ({id:d.visitGroupConceptId,code:d.conceptCode,name:d.conceptName,sum:d3.sum(sourceSums.filter(s => s.id === d.visitGroupConceptId).map(s => s.sum))}))
        if (otherCodes.length > 0) sourceDataVar.push({key:'Other',codes:otherCodes})
        const sorted = sourceDataVar.map(obj => ({...obj,codes:obj.codes.sort((a,b) => a.sum - b.sum)}))
        return sorted  
      } 
      else if (countType === 'person' && personFilterData) {
        if (personFilterData.length > 0) {
          const filterList = personFilterData.filter(f => f.filter === 'visit').map(f => ({id:f.stratum,code:visitTypeNames.find(n => n.visit_group_concept_id === f.stratum).concept_code,name:visitTypeNames.find(n => n.visit_group_concept_id === f.stratum).concept_name,sum:f.person_counts}))
          const byCategory = categories.map(obj => ({...obj,codes:filterList.filter(f => obj.codes.includes(f.code))}))
            .filter(obj => obj.codes.length > 0)
          const categorizedCodes = new Set(categories.map(obj => obj.codes).flat())
          const otherCodes = filterList.filter(f => !categorizedCodes.has(f.code))
          if (otherCodes.length > 0) byCategory.push({key:'Other',codes:otherCodes})
          const sorted = byCategory.map(obj => ({...obj,codes:obj.codes.sort((a,b) => a.sum - b.sum)}))
          return sorted  
        }
      }
    }
  },[filteredCounts,personFilterData,extent,countType])

  const maxGender = useMemo(() => {if (genderData) return genderData.reduce((max, obj) => obj.sum > max.sum ? obj : max).id},[genderData])

  // tree positioning
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
  const propagate = (layers,start,f,sorted=false) => {
    const above = layers.slice(0, start).reverse()
    const below = layers.slice(start + 1)
    below.forEach(l => f(l,layers.indexOf(l),'up',sorted))
    above.forEach(l => f(l,layers.indexOf(l),'down',sorted))
  }
  const bottomUp = (layers,f,sorted=false) => {
    for (let i = layers.length-2; i >= 0; i--) {
        f(layers[i],i,'down',sorted)
    }
}
  function spreadAroundCentroid(nodes,centroid,w) {
    const adjustment = nodes.length % 2 !== 0 ? 0 : w/2
    const median = Math.floor(nodes.length/2) 
    const spreadPositions = nodes.map((n,i) => ({node:n,x:i >= median ? centroid+((i-median)*w)+adjustment : centroid-((median-i)*w)+adjustment}))
    return spreadPositions
  }
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
  function linearLayout(poset,edges,width,unFilteredPoset=null) {
    const unit_w = width
    let bbIds = []
    const nodes = poset.elements 
    const layers = unFilteredPoset ? unFilteredPoset.layers.map(layer => layer.filter(e => nodes.includes(e))).filter(layer => layer.length > 0) : poset.layers
    const tree = isTree(poset,nodes,edges,poset.analytics.suprema)

    function sortLayersByX(layers) {
      return layers.map(layer => layer.sort((a,b) => poset.featureOf(a,'x') - poset.featureOf(b,'x')))
    }
    function getCenter(ids) {
      return (Math.min(...poset.featureOf(ids,'x')) + Math.max(...poset.featureOf(ids,'x'))) / 2
    }

    const setX = (e,l,direction,sorted=false) => {
      if (e) {
        let idealPositions = []
        let sortedPositions = []
        let shiftToEnd = []
        const lowerLayer = e.map(n => poset.getLower(n).filter(d => d !== n)).flat()
        const upperLayer = e.map(n => poset.getUpper(n).filter(d => d !== n)).flat().filter((e,n,l) => l.indexOf(e) === n)

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
          const refs = direction === 'up' ? poset.getUpper(node).filter(n => n !== node) : poset.getLower(node).filter(n => n !== node)
          const values = poset.featureOf(refs, "x").filter(v => v !== undefined)
          const sum = d3.sum(values)
          if (values.length !== 0) x = sum === 0 ? 0 : sum / values.length
          if (x == null) {
            if (poset.featureOf(node,'x') == null || !sorted) x = 0
            else  x = poset.featureOf(node,'x')
          }
          if (x !== null) {
            // full dangling layer with nothing below and max one shared parent above, spread around center of lowest layer
            if (sorted && lowerLayer.length === 0 && upperLayer.length <= 1) {
              x = getCenter(layers[0])
              idealPositions.push({node:node,x:x}) 
            }
            // dangling node in layer
            else if (sorted && poset.getLower(node).filter(n => n !== node).length === 0 && poset.getUpper(node).filter(n => n !== node).length === 0) shiftToEnd.push(node)
            else idealPositions.push({node:node,x:x}) 
          }
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
        const min = d3.min(sortedPositions.flat().map(d => d.x))
        shiftToEnd.forEach((node,i) => poset.featureOf(node,'x',min - unit_w - (i*unit_w)))
        sortedPositions.flat().forEach(d => poset.featureOf(d.node,'x',d.x))  
      }
    }

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
      let L = 0
      bbIds = layers[L]
      if (!tree) {

        // **** GET BB **** //
        // L = po.getBarycenter(poset)
        const bb = layers.map((l,n)=>({n:n, l:l, deg:l.length === 0 ? 0 : l.map(node=>poset.featureOf(node,"node_degree")).reduce((acc,el)=>acc+el)})).sort((a,b)=>b.deg-a.deg)[0]
        const midPoint = Math.trunc((layers.length-1)/2)
        L = bb.n > midPoint ? bb.n : midPoint 

        const i = unFilteredPoset ? unFilteredPoset.layers.findIndex(l => layers[L].some(id => l.includes(id))) : L
        const pos = unFilteredPoset ? unFilteredPoset : poset
        const scores = tree ? po.boundScores(pos,i) : po.dominanceScores(pos,i) 
        const {ids,subspaces} = po.findSubspaces(scores)
        bbIds = subspaces.map((ssp,n)=>{
            const LE = linearEmbedding(ssp,ids[n])
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
      })

      propagate(layers,L,setX)
      let sortedLayers = sortLayersByX(layers)
      bottomUp(sortedLayers,setX,true)
    }
  }
  function spaceSubspaces(posets,width) {
    const unit_w = width
    posets.forEach((pos,index) => {
      if (index > 0 && posets[index-1].elements.length > 0) {
          const prevMax = d3.max(posets[index-1].featureOf(posets[index-1].elements,'x'))
          const thisMin = d3.min(pos.featureOf(pos.elements,'x'))  
          const ideal = prevMax + (unit_w*2)
          if (thisMin !== ideal) {
            const adjustment = ideal - thisMin
            pos.elements.forEach(node => pos.featureOf(node,'x',pos.featureOf(node,'x') + adjustment))
          }  
        }  
    }) 
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

  function moveSlider(index,w,id) {
      const buffer = id === 'view' ? 1 : 0
      d3.select('#slider-'+id).style('transform',`translateX(${index * (w+buffer)}%)`)
  }

  function getCounts(data,col) {
    // if (col === 'node_hll_person_counts') {
    //   async function getPersonCounts() {
    //     const sketches = data
    //       .filter(d => d[col])
    //       .map(d => d[col])

    //     return sketches.length > 0 ? await runMerge(sketches) : 0
    //   }
    //   return getPersonCounts()
    // } 
    // else {
      let sum = 0;
      data.forEach(d => sum += d[col])
      return sum  
    // }
  }

  function getAllDescendants(relationships, rootId, descendants) {
    const immediateChildren = relationships
      .filter(r => r.parent_concept_id === rootId && r.child_concept_id !== rootId)
      .filter(r => r.levels !== '-1')
      .map(r => r.child_concept_id)

    for (const child of immediateChildren) {
      if (!descendants.includes(child)) { 
        descendants.push(child)
        getAllDescendants(relationships, child, descendants)
      }
    }
    return descendants
  }

  function getConceptInfo(id) {return treeData.concepts.find(n => n.concept_id === id)}

  // function getInclusions(roots,nodes,id,eList,dFilter,descendants) {
  //   // both selected
  //   if (eList.includes(id) && !dFilter.includes(id)) return []
  //   else {
  //       // descendants unselected
  //       if (dFilter.includes(id)) {
  //           let stillIncluded = roots.filter(r => r !== id && (nodes.find(n => n.name === r).distance < nodes.find(n => n.name === id).distance) && (!eList.includes(r) && !dFilter.includes(r))).map(r => nodes.find(n => n.name === r).descendants.filter(d => d !== r).filter(d => classFilter.includes('All') ? d : classFilter.includes(nodes.find(n => n.name === d).class))).flat().filter(d => descendants.includes(d))
  //           const rootStillIncluded = descendants.filter(d => roots.includes(d) && !eList.includes(d))
  //           stillIncluded = [...stillIncluded,...rootStillIncluded]
  //           // exclude unselected
  //           if (!eList.includes(id)) {
  //               return stillIncluded.includes(id) ? stillIncluded : [...stillIncluded,id]
  //           } else {
  //               return stillIncluded.filter(d => d !== id)
  //           }
  //       // descendants selected
  //       } else {
  //         console.log('nodes',nodes)
  //         let stillExcluded = roots.filter(r => r !== id && (nodes.find(n => n.name === r).distance < nodes.find(n => n.name === id).distance) && (eList.includes(r) && !dFilter.includes(r))).map(r => nodes.find(n => n.name === r).descendants.filter(d => d !== r).filter(d => classFilter.includes('All') ? d : classFilter.includes(nodes.find(n => n.name === d).class))).flat().filter(d => descendants.includes(d))
  //         const rootExclusions = descendants.filter(d => roots.includes(d) && eList.includes(d))
  //         const rootDescendantExclusions = rootExclusions.filter(r => !dFilter.includes(r)).map(r => nodes.find(n => n.name === r).descendants.filter(d => d !== r).filter(d => classFilter.includes('All') ? d : classFilter.includes(nodes.find(n => n.name === d).class))).flat()
  //         stillExcluded = [...stillExcluded,...rootExclusions,...rootDescendantExclusions]
  //         return descendants.filter(d => !stillExcluded.includes(d))
  //       }
  //   }
  // }
  function getInclusions(roots, nodeMap, id, eList, dFilter, descendants) {
    const eSet = eList instanceof Set ? eList : new Set(eList)
    const dSet = dFilter instanceof Set ? dFilter : new Set(dFilter)
    const descSet = new Set(descendants)
    // const nodeMap = new Map(nodes.map(n => [n, n]))

    if (eSet.has(id) && !dSet.has(id)) return []

    const idNode = nodeMap.get(id)

    if (dSet.has(id)) {
      let stillIncluded = roots
        .filter(r => r !== id && nodeMap.get(r).distance < idNode.distance && !eSet.has(r) && !dSet.has(r))
        .flatMap(r => nodeMap.get(r).descendants
          .filter(d => d !== r)
          .filter(d => classFilter.includes('All') ? true : classFilter.includes(nodeMap.get(d).class))
        )
        .filter(d => descSet.has(d))
      const rootStillIncluded = descendants.filter(d => roots.includes(d) && !eSet.has(d))
      stillIncluded = [...stillIncluded, ...rootStillIncluded]
      if (!eSet.has(id)) {
        return stillIncluded.includes(id) ? stillIncluded : [...stillIncluded, id]
      }
      return stillIncluded.filter(d => d !== id)
    } else {
      let stillExcluded = roots
        .filter(r => r !== id && nodeMap.get(r).distance < idNode.distance && eSet.has(r) && !dSet.has(r))
        .flatMap(r => nodeMap.get(r).descendants
          .filter(d => d !== r)
          .filter(d => classFilter.includes('All') ? true : classFilter.includes(nodeMap.get(d).class))
        )
        .filter(d => descSet.has(d))
      const rootExclusions = descendants.filter(d => roots.includes(d) && eSet.has(d))
      const rootDescendantExclusions = rootExclusions
        .filter(r => !dSet.has(r))
        .flatMap(r => nodeMap.get(r).descendants
          .filter(d => d !== r)
          .filter(d => classFilter.includes('All') ? true : classFilter.includes(nodeMap.get(d).class))
        )
      const stillExcludedSet = new Set([...stillExcluded, ...rootExclusions, ...rootDescendantExclusions])
      return descendants.filter(d => !stillExcludedSet.has(d))
    }
  }

  // UPDATE FOR PERSON COUNTS 
  function updateInclusions(relationship, countType, updateWidth = false) {
    let newInclusions = []
    let mappings = []

    if (relationship === 'descendants') {
      const nodeNameSet = new Set(nodes.map(n => n.name))
      newInclusions = [...new Set(
        rootConcepts.flatMap(r =>
          nodeNameSet.has(r)
            ? getInclusions(rootConcepts, fullTreeNodeMap, r, excludeList, descendantsFilter, nodes.find(n => n.name === r).descendants)
            : getInclusions(rootConcepts, fullTreeNodeMap, r, excludeList, descendantsFilter,
                fullTreeNodeMap.get(r).descendants.filter(d => classFilter.includes('All') ? true : classFilter.includes(fullTreeNodeMap.get(d).class)))
        )
      )].filter(i => countType === 'record' ? fullTreeNodeMap.get(i).record_counts !== 0 : fullTreeNodeMap.get(i).person_counts !== 0)
      setMapRoot([])
    } else {
      const nodeNameSet = new Set(nodes.map(n => n.name))
      newInclusions = [...new Set(
        rootConcepts.flatMap(r =>
          nodeNameSet.has(r)
            ? getInclusions(rootConcepts, fullTreeNodeMap, r, excludeList, descendantsFilter, nodes.find(n => n.name === r).descendants)
            : getInclusions(rootConcepts, fullTreeNodeMap, r, excludeList, descendantsFilter,
                fullTreeNodeMap.get(r).descendants.filter(d => classFilter.includes('All') ? true : classFilter.includes(fullTreeNodeMap.get(d).class)))
        )
      )].flatMap(i => fullTreeNodeMap.get(i).mappings.map(m => m.name))
        .filter(i => countType === 'record' ? fullTree.mappings.find(n => n.name === i).record_counts !== 0 : fullTree.mappings.find(n => n.name === i).person_counts !== 0)
      const allMappings = nodes.filter(n => n.mappings.length > 0).map(n => n.name)
      setMapRoot(allMappings)
      mappings = allMappings
    }
    updateConcepts(newInclusions, updateWidth, mappings)
  }
  function updateConcepts(inclusionList,updateW=false,mappings=null) {
    const inclusionSet = new Set(inclusionList)
    const nodeMap = new Map(fullTree.nodes.map(n => [n.name, n]))
    const allNodeMap = new Map(fullTree.allNodes.map(n => [n.name, n]))
    const nodeNameSet = new Set(nodes.map(n => n.name))

    let newNodes = nodes
        .map(e => ({
            ...e,
            included_descendants: [...e.descendants.filter(d => inclusionSet.has(d)),...e.descendants.map(d => nodeMap.get(d).mappings.map(m => m.name)).flat().filter(d => inclusionSet.has(d))]
        }))
        .map(e => ({
            ...e,
            descendant_counts:d3.sum(fullTree.allNodes.filter(node => e.included_descendants.includes(node.name)).map(node => node.record_counts)),
            descendant_person_counts:d3.sum(fullTree.allNodes.filter(node => e.included_descendants.includes(node.name)).map(node => node.person_counts)),
            leaf: e.included_descendants.filter(d => d !== e.name  && !e.mappings.map(m => m.name).includes(d)).length > 0 && ((e.distance === maxLevel && !links.map(d => d.source).map(d => d.name).includes(e.name)) && e.levels !== '-1') ? true : false}
        ))

    let newConnections = crossConnections
        .filter(c => inclusionList.includes(c.child) || fullTree.nodes.find(n => n.name === c.child).mappings.map(m => m.name).some(item => inclusionList.includes(item)))
        .map(d => ({...d,parents:d.parents.filter(p => nodeNameSet.has(p)).filter(p => newNodes.filter(d => d.name === p)[0]?.leaf)}))
    newConnections = newConnections.filter(d => d.parents.length > 1)
    
    newNodes = newNodes.map(e => ({
      ...e,
      connections: newConnections.filter(c => c.parents.includes(e.name)).map(d => ({...d,source:e.name}))
    }))
    
    let isPruned = false
    newNodes.filter(d => d.leaf).forEach(d => d.children.length > 0 ? isPruned = true : null)

    setPruned(isPruned)
    setInclusions(inclusionList)
    if (!updateW) setNodes(newNodes)
    else updateWidth(mappings,newNodes)
  }

  function updateWidth(openedMappings,nList=false) {
    let n = nodes
    if (nList) n = nList
    let positions = {}
    poset.forEach((pos,i) => {
        const nodeWidth = openedMappings.filter(r => pos.elements.includes(r.toString())).length > 0 ? nWidth*2 : nWidth
        linearLayout(pos,edges,nodeWidth,subspaces[i]) 
    })
    spaceSubspaces(poset,openedMappings.length > 0 ? nWidth*2 : nWidth)
    poset.forEach(pos => pos.elements.forEach(e => positions[e] = pos.featureOf(e,'x')))

    const nodeList = n.map(d => d.name)
    let nodesArray = n
        .map(d => ({...d,x:positions[d.name]}))
        .map(e => ({...e,mappings: e.mappings.map(map => ({...map,source: e}))}))
    nodesArray = nodesArray.map(d => ({...d,connections:d.connections.map(c => ({...c,x:d.x,mid:getMidX(c.parents,nodesArray)}))}))
    const linksArray = links.map(d=>({source: nodesArray[nodeList.indexOf(d.source.name)], target: nodesArray[nodeList.indexOf(d.target.name)]}))
    setNodes(nodesArray)
    setLinks(linksArray)    
  }

  function getMidX(ids,nodeList) {
      let xPositions = []
      ids.forEach(id => xPositions.push(nodeList.filter(d => d.name === id)[0].x))
      const midX = d3.sum(xPositions)/xPositions.length
      return midX
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

  function buildSearchIndex(concepts, maxPrefixLength = 4) {
    const nameIndex = new Map()
    const codeIndex = new Map()
    const idIndex = new Map()

    function addToIndex(index, value, conceptIndex) {
      if (!value) return
      const maxLength = Math.min(value.length, maxPrefixLength)
      for (let i = 1; i <= maxLength; i++) {
        const prefix = value.slice(0, i)
        let matches = index.get(prefix)
        if (!matches) {
          matches = []
          index.set(prefix, matches)
        }
        matches.push(conceptIndex)
      }
    }

    concepts.forEach((d, index) => {
      addToIndex(nameIndex, d._name, index)
      addToIndex(codeIndex, d._code, index)
      addToIndex(idIndex, d._id, index)
    })
    return {
      name: nameIndex,
      code: codeIndex,
      id: idIndex
    }
  }

  function prunePersonCounts() {
    const objects = nodes.filter(d => d.distance !== 0)
    const distances = [...new Set(objects.map(d => d.distance))].sort((a, b) => b - a)
    for (const distance of distances) {
        const filtered = objects.filter(d => d.distance < distance)
        if (filtered.length < personMax) {
          setLevelFilter(distance-1)
          setMaxPersonLevel(distance-1)
          d3.select('#open-levels').style('display', 'block')
          d3.select('#close-levels').style('display', 'none')  
          d3.select('#dropdown-levels').style('visibility','hidden') 
          d3.select('#header-levels').classed('filterActive', distance-1 < fullTreeMax ? true : false)
          return
        }
    }
  }

  function getFilterQueryString() {
    const conceptData = selectedConcepts.map(concept => ({ name: concept.name.toString(), type: concept.map ? 'M' : 'S', include: concept.leaf ? 'D' : '' }))
    const obj = { conceptIds: conceptData.map(d => `${d.name}${d.type}${d.include}`).join(','),yearsRange:yearSelection ? yearSelection[0] + ',' + yearSelection[1] : extent[0] + ',' + extent[1] }
    return Object.entries(obj)
      .filter(([key, value]) => value !== '')
      .map(([key, value]) => `${key}=${value}`)
      .join('&')
  }

  function getQueryString() {
    const conceptData = selectedConcepts.map(concept => ({name:concept.name.toString(),type: concept.map ? 'M' : 'S',include: concept.leaf ? 'D' : ''}))
    const obj = {conceptIds:conceptData.map(d => `${d.name}${d.type}${d.include}`).join(','),yearsRange:yearSelection ? yearSelection[0] + ',' + yearSelection[1] : extent[0] + ',' + extent[1],sexStratum:graphFilter.gender !== -1 ? graphFilter.gender : '',ageStratum:graphFilter.age.length > 1 ? graphFilter.age.filter(a => a !== -1).join(',') : '',visitStratum:!graphFilter.source.includes(-1) ? graphFilter.source.join(',') : ''}
    const queryString = Object.entries(obj)
      .filter(([key, value]) => value !== '')
      .map(([key, value]) => `${key}=${value}`)
      .join('&')
    console.log('query',queryString)
    return queryString
  } 

  function createInitialTree(data,filterClass,filterLevel,filteredClassList) {
    console.log('create initial tree',data)

    // filter data 
    const subsumesData = data.concept_relationships.filter(d => d.levels !== "Mapped from" && d.levels !== "Maps to")
    const mappingData = data.concept_relationships.filter(d => d.levels === "Mapped from" || d.levels === "Maps to")
    
    // keep highest level root if duplicates (concept set)
    let nodeData = Array.from(
      subsumesData
      .reduce((map, obj) => {
        const existing = map.get(obj.child_concept_id)
        if (!existing || (parseInt(obj.levels.split('-')[0]) > parseInt(existing.levels.split('-')[0]))) {
          map.set(obj.child_concept_id, obj)
        }
        return map
      }, new Map()).values()
    )

    // full poset
    let colors = {}
    let distances = {}
    let positions = {}
    let fullEdges = data.concept_relationships
      .filter(d => d.levels !== "Mapped from" && d.levels !== "Maps to")
      .map(d => d.levels === "-1" ? ({...d,parent_concept_id: d.child_concept_id,child_concept_id: d.parent_concept_id}) : d)
      .map(d => ([d.parent_concept_id.toString(),d.child_concept_id.toString()]))
    if (fullEdges.length > 1) fullEdges = fullEdges.filter(d => d[0] !== d[1])
    const {matrix,nodes} = po.domFromEdges(fullEdges)
    const fullPoset = po.createPoset(matrix,nodes)

    // coloring 
    fullPoset.enrich().setLayers().color()
    const layers = [...fullPoset.layers]
    const depthScale = d3.scaleLinear(d3.extent(layers.map((l,i)=>i)), [20,70])
    fullPoset.elements.forEach(name => {
      distances[name] = layers.findIndex(i => i.includes(name))
      colors[name] = `hsl(${fullPoset.featureOf(name,'pTheta')},${fullPoset.featureOf(name,'pAlpha')*100}%,${depthScale(distances[name])}%)` 
    })

    // subspace posets
    const posetArray = []
    const subspaces = po.findSubspaces(po.dominanceScores(fullPoset,0))
    const edgeArray = po.separateSubspaces(subspaces,fullPoset)
    edgeArray.forEach(edges => {
      const {matrix,nodes} = po.domFromEdges(edges)
      const pos = po.createPoset(matrix,nodes)
      pos.enrich()
        .setLayers()
        .feature("lower_bound",(node)=>pos.getLower(node))
        .feature("upper_bound",(node)=>pos.getUpper(node))
        .feature("node_degree",(node,f)=>f.lower_bound.length+f.upper_bound.length)
      linearLayout(pos,edges,nWidth)
      posetArray.push(pos)
    })
    spaceSubspaces(posetArray,nWidth)
    posetArray.forEach(pos => pos.elements.forEach(e => positions[e] = pos.featureOf(e,'x')))

    // create nodes 
    nodeData = nodeData.map(e => ({
      'name': e.child_concept_id, 
      'levels': e.levels,
      'relationship': e.levels,
      'class': e.concept_class_id,
      'distance': distances[e.child_concept_id], 
      'color': colors[e.child_concept_id],
      'x': positions[e.child_concept_id],
      'leaf': !subsumesData.map(d => d.parent_concept_id).includes(e.child_concept_id) ? true : false,
      'parents': fullPoset.getUpper(e.child_concept_id.toString()).map(d => parseInt(d)),
      'children': fullPoset.getLower(e.child_concept_id.toString()).map(d => parseInt(d)),
      'connections': [],
      'record_counts': data.concepts.find(d => d.concept_id === e.child_concept_id).record_counts ? data.concepts.find(d => d.concept_id === e.child_concept_id).record_counts : 0,
      'person_counts': data.concepts.find(d => d.concept_id === e.child_concept_id).person_counts ? data.concepts.find(d => d.concept_id === e.child_concept_id).person_counts : 0,
      'descendant_record_counts': data.concepts.find(d => d.concept_id === e.child_concept_id).descendant_record_counts ? data.concepts.find(d => d.concept_id === e.child_concept_id).descendant_record_counts : 0,
      'descendant_person_counts': data.concepts.find(d => d.concept_id === e.child_concept_id).descendant_person_counts ? data.concepts.find(d => d.concept_id === e.child_concept_id).descendant_person_counts : 0,
      'descendants': [...getAllDescendants(subsumesData,e.child_concept_id,[]),e.child_concept_id],
      'data': {concept: data.concepts.find(d => d.concept_id === e.child_concept_id)}
    }))

    // set cross connections 
    const allNodes = subsumesData
      .filter(d => d.parent_concept_id !== d.child_concept_id)
      .map(d => d.levels === "-1" ? ({
        ...d, 
        parent_concept_id: d.child_concept_id, 
        child_concept_id: d.parent_concept_id
      }) : d)
    const allChildren = allNodes.map(d => d.child_concept_id).filter((e,n,l) => l.indexOf(e) === n)
    let connections = []
    allChildren.forEach(child => allNodes.filter(d => d.child_concept_id === child).length > 1 ? connections.push({child:child,parents:allNodes.filter(d => d.child_concept_id === child).map(d => d.parent_concept_id)}) : null)
    connections = connections.filter(d => d.parents.length > 1)
    setCrossConnections(connections)

    const nodeMap = new Map()
    nodeData.forEach(n => nodeMap.set(n.name, n))

    // set inclusions
    const inclusionList = rootConcepts.map(r => getInclusions(rootConcepts,nodeMap,r,excludeList,descendantsFilter,nodeData.find(n => n.name === r).descendants)).flat()
      .filter(i => nodeData.find(n => n.name === i).levels !== '-1')
      .filter(i => nodeData.find(n => n.name === i).record_counts !== 0)
    setInclusions(inclusionList) 

    // MAPPINGS
    nodeData = nodeData.map(node => {
      const mappings = mappingData
          .filter(d => d.parent_concept_id === node.name)
          .map(e => ({
            'name': e.child_concept_id,
            'direction': e.levels === "Mapped from" ? -1 : 1,
            'distance': node.distance,
            'source': node,
            'color': generateColor(e.child_concept_id),
            'record_counts': data.concepts.find(c => c.concept_id === e.child_concept_id).record_counts ? data.concepts.find(c => c.concept_id === e.child_concept_id).record_counts : 0,
            'person_counts': data.concepts.find(c => c.concept_id === e.child_concept_id).person_counts ? data.concepts.find(c => c.concept_id === e.child_concept_id).person_counts : 0,
            'descendant_record_counts': data.concepts.find(c => c.concept_id === e.child_concept_id).descendant_record_counts ? data.concepts.find(c => c.concept_id === e.child_concept_id).descendant_record_counts : 0,
            'descendant_person_counts': data.concepts.find(c => c.concept_id === e.child_concept_id).descendant_person_counts ? data.concepts.find(c => c.concept_id === e.child_concept_id).descendant_person_counts : 0,
            'data': {concept: data.concepts.find(c => c.concept_id === e.child_concept_id)}
          }))
      return {
        ...node,
        'leaf': node.descendants.filter(d => d !== node.name).length > 0 && node.leaf ? true : false,
        'included_descendants': node.descendants.filter(e => inclusionList.includes(e)),
        'mappings': mappings.sort((a, b) => b.record_counts - a.record_counts)
      }
    })
    
    // add mapping colors to colorList
    nodeData.forEach(node => {node.mappings.forEach(map => colors[map.name] = map.color)})
    setColorList(colors)

    // get links, mappings
    const nodeNames = nodeData.map(d => d.name)
    const linkData = subsumesData.filter(d => d.parent_concept_id !== d.child_concept_id).map(d=>({...d, source: d.levels === "-1" ? nodeData[nodeNames.indexOf(d.child_concept_id)] : nodeData[nodeNames.indexOf(d.parent_concept_id)], target: d.levels === "-1" ? nodeData[nodeNames.indexOf(d.parent_concept_id)] : nodeData[nodeNames.indexOf(d.child_concept_id)]}))
    const mappings = nodeData.map(n => n.mappings).flat()
    // set states
    setPoset(posetArray)
    setSubspaces(posetArray)
    setPruned(false)
    setFullTree({allNodes:[...nodeData,...mappings],nodes:nodeData,mappings:mappings,links:linkData,edges:fullEdges})
    if (!filterClass && !filterLevel) {
      setNodes(nodeData)
      setLinks(linkData)
    } 
    if (filterClass) setClassFilter(filteredClassList)
    if (filterLevel) setLevelFilter(2)
    setLoading(false)
  }

  // IMPROVE THIS
  // filter tree 
  useEffect(() => {
    if (fullTree.nodes) {
      // filter nodes and links
      let filteredNodes = fullTree.nodes
        .filter(d => levelFilter === undefined || d.distance <= levelFilter)
        .filter(d => classFilter.includes('All') ? true : d.class ? classFilter.includes(d.class) : true)

      const filteredNodeNames = new Set(filteredNodes.map(d => d.name))
      let filteredLinks = fullTree.links
        .filter(d => filteredNodeNames.has(d.source.name) && filteredNodeNames.has(d.target.name))

      const nodeNames = filteredNodes.map(d => d.name)
      const stringNames = nodeNames.map(n => n.toString())

      // new posets (unchanged logic, just reusing stringNames set lookups where relevant)
      let positions = {}
      let newPosetArray = []
      subspaces.forEach(fullPos => {
        const names = fullPos.elements.filter(e => stringNames.includes(e))
        let newEdges = fullTree.edges.filter(d => names.includes(d[0]) && names.includes(d[1]))
        if (newEdges.length > 1) newEdges = newEdges.filter(d => d[0] !== d[1])
        if (newEdges.length === 0) newEdges = stringNames.map(n => [n, n])
        const includedInEdges = new Set(newEdges.flat())
      // console.log('names',names,'includedInEdges',includedInEdges)
        if (names.length > includedInEdges.size) {
          const missingNodes = names.filter(n => !includedInEdges.has(n))
          const missingEdges = missingNodes.map(n => [n, n])
          newEdges = [...newEdges, ...missingEdges]
        }
        const { matrix, nodes } = po.domFromEdges(newEdges)
        const newPos = po.createPoset(matrix, nodes)
        console.log('new edges', newEdges,'full pos',fullPos)
        newPos.enrich()
          .setLayers()
          .feature("node_degree", (node) => fullPos.featureOf(node, 'node_degree'))
          .print()
        const nodeWidth = mapRoot.filter(r => newPos.elements.includes(r.toString())).length > 0 ? nWidth * 2 : nWidth
        linearLayout(newPos, newEdges, nodeWidth, fullPos)
        newPos.elements.forEach(e => positions[e] = newPos.featureOf(e, 'x'))
        newPosetArray.push(newPos)
      })
      spaceSubspaces(newPosetArray, mapRoot.length > 0 ? nWidth * 2 : nWidth)
      newPosetArray.forEach(pos => pos.elements.forEach(e => positions[e] = pos.featureOf(e, 'x')))

      // set nodes — precompute maxDistance and link-source set ONCE, use nodeMap instead of find
      const maxFilteredDistance = d3.max(filteredNodes.map(n => n.distance))
      const linkSourceNameSet = new Set(filteredLinks.map(d => d.source.name))

      filteredNodes = filteredNodes.map(e => {
        const fullNode = fullTreeNodeMap.get(e.name)
        return {
          ...e,
          leaf: (e.distance === maxFilteredDistance && !linkSourceNameSet.has(e.name)) && e.levels !== '-1',
          parents: fullNode.parents.filter(d => classFilter.includes('All') ? true : classFilter.includes(fullTreeNodeMap.get(d).class)),
          children: fullNode.children.filter(d => classFilter.includes('All') ? true : classFilter.includes(fullTreeNodeMap.get(d).class)),
          descendants: fullNode.descendants.filter(d => classFilter.includes('All') ? true : classFilter.includes(fullTreeNodeMap.get(d).class)),
          x: positions[e.name]
        }
      })
      if (relationship.includes('mappings')) setMapRoot(filteredNodes.filter(n => n.mappings.length > 0).map(n => n.name))

      // inclusions — dedupe via Set, use maps instead of repeated find
      const filteredNodeMap = new Map(filteredNodes.map(n => [n.name, n]))
      const mappingsMap = relationship.includes('mappings') ? new Map(fullTree.mappings.map(n => [n.name, n])) : null

      const newInclusions = [...new Set(
        rootConcepts.flatMap(r => {
          const fn = filteredNodeMap.get(r)
          if (fn) return getInclusions(rootConcepts, fullTreeNodeMap, r, excludeList, descendantsFilter, fn.descendants)
          const fullNode = fullTreeNodeMap.get(r)
          const descs = fullNode.descendants.filter(d => classFilter.includes('All') ? true : classFilter.includes(fullTreeNodeMap.get(d).class))
          return getInclusions(rootConcepts, fullTreeNodeMap, r, excludeList, descendantsFilter, descs)
        })
      )]
        .filter(i => {
          const n = fullTreeNodeMap.get(i)
          return n.levels !== '-1' && n.levels
        })
        .flatMap(i => relationship.includes('mappings') ? fullTreeNodeMap.get(i).mappings.map(m => m.name) : i)
        .filter(i => relationship.includes('mappings') ? mappingsMap.get(i).record_counts !== 0 : fullTreeNodeMap.get(i).record_counts !== 0)

      const newInclusionsSet = new Set(newInclusions)

      // update nodes based on inclusions — map instead of find, Set instead of includes
      filteredNodes = filteredNodes.map(e => ({
        ...e,
        included_descendants: [
          ...e.descendants.filter(d => newInclusionsSet.has(d)),
          ...e.descendants.flatMap(d => fullTreeNodeMap.get(d).mappings.map(m => m.name)).filter(d => newInclusionsSet.has(d))
        ]
      }))

      // descendant counts — was O(n * allNodes.length), now O(n * avg descendants) via allNodesMap
      filteredNodes = filteredNodes.map(e => {
        let recordSum = 0, personSum = 0
        e.included_descendants.forEach(name => {
          const node = allNodesMap.get(name)
          if (node) {
            recordSum += node.record_counts
            personSum += node.person_counts
          }
        })
        const mappingNameSet = new Set(e.mappings.map(m => m.name))
        return {
          ...e,
          descendant_counts: recordSum,
          descendant_person_counts: personSum,
          leaf: e.included_descendants.filter(d => d !== e.name && !mappingNameSet.has(d)).length > 0 && e.leaf
        }
      })

      // update connections
      const filteredNodeMap2 = new Map(filteredNodes.map(n => [n.name, n]))
      let filteredConnections = crossConnections
        .filter(c => !filteredNodeNames.has(c.child))
        .filter(c => classFilter.includes('All') ? true : classFilter.includes(fullTreeNodeMap.get(c.child).class))
        .map(d => ({
          ...d,
          parents: d.parents.filter(p => filteredNodeMap2.get(p)?.leaf)
        }))
      filteredConnections = filteredConnections.filter(d => d.parents.length > 1)

      // update nodes and links
      filteredNodes = filteredNodes.map(d => ({
        ...d,
        connections: filteredConnections.filter(c => c.parents.includes(d.name)).map(e => ({ ...e, source: d.name, x: d.x, mid: getMidX(e.parents, filteredNodes) })),
        mappings: d.mappings.map(m => ({ ...m, source: d }))
      }))

      const finalNodeMap = new Map(filteredNodes.map(n => [n.name, n]))
      filteredLinks = filteredLinks.map(d => ({
        ...d,
        source: finalNodeMap.get(d.source.name),
        target: finalNodeMap.get(d.target.name)
      }))

      // pruned
      let isPruned = false
      filteredNodes.filter(d => d.leaf).forEach(d => { if (d.children.length > 0) isPruned = true })

      // set states
      setInclusions(newInclusions)
      setPoset(newPosetArray)
      setPruned(isPruned)
      setNodes(filteredNodes)
      setLinks(filteredLinks)
      if (initialPrune) { setTimeout(() => { setInitialPrune(false) }, 1000) }
    }
  }, [classFilter, levelFilter])

  // on page load
  useEffect(()=>{
    console.log('start app')
    // const params = new URLSearchParams(window.location.search)
    setLoaded(true)
    loadNews()
    moveSlider(0,0,'relationship')
    moveSlider(0,0,'view')
    moveSlider(0,0,'counts')
    fetch(`${API_BASE_URL}/getVisitTypeNames`)
      .then(res=> res.json())
      .then(data=>{
        setVisitTypeNames(data.map(normalizeVisitTypeName).filter(d => Number.isFinite(d.visitGroupConceptId)))
      })
    fetch(`${API_BASE_URL}/getAPIInfo`)
      .then(res=> res.json())
      .then(data=>{
        setApiInfo(data)
      })
    fetch(`${API_BASE_URL}/getListOfConcepts`)
      .then(res=> res.json())
      .then(data=>{
        const vocabList = [
          ...new Set(
            data
              .map(d => d.vocabulary_id)
              .filter(d => d !== undefined)
          )
        ]
        const indexedData = data.map((d, index) => ({
          ...d,
          _index: index,
          _name: d.concept_name.toLowerCase(),
          _id: String(d.concept_id),
          _code: String(d.concept_code)
        }))
        const index = buildSearchIndex(indexedData)
        setConceptList(indexedData)
        setSearchIndex(index)
        setAllVocabularies(vocabList)
      })
  }, [])

  // on root load
  useEffect(()=>{
    setLoading(true)
    moveSlider(0,0,'relationship')
    moveSlider(0,0,'view')
    moveSlider(0,0,'counts')
    if (!root) {
      setLoading(false)
    } else {
      fetchedRef.current = true
      const rootArray = root.split(',').map(Number)
      setRootConcepts(rootArray)
      if (expression.length > 0) {
        setDescendantsFilter(expression.filter(e => !e.descendants).map(e => e.name))
        setExcludeList(expression.filter(e => e.exclude).map(e => e.name))
      }
      // concept relationships
      Promise.all(
        rootArray.map(r =>
          fetch(`${API_BASE_URL}/getConceptRelationships?conceptId=${r}`)
            .then(res => {
              if (!res.ok) {
                setLoading(false)
                d3.select('#error-message').style('display','block')
                throw new Error(`HTTP ${res.status} for conceptId ${r}`)
              }
              return res.json()
            })
        )
      )
      .then(data => {
        console.log('tree data received',data)
        setTreeDataArray(data)
        setLoading(false)
      })
      .catch(err => {
        setLoading(false)
        setGraphLoading(false)
        console.error("Fetch failed:", err.message)
        d3.select('#error-message').style('display','block')
      })  
      // code counts
      Promise.all(
        rootArray.map(r =>
          fetch(`${API_BASE_URL}/getCodeCountsStratified?conceptId=${r}`)
            .then(res => {
              if (!res.ok) {
                setLoading(false)
                setGraphLoading(false)
                d3.select('#error-message').style('display','block')
                throw new Error(`HTTP ${res.status} for conceptId ${r}`)
              }
              return res.json()
            })
        )
      )
      .then(data => {
        console.log('counts data received',data)
        setCountsDataArray(data)
        setGraphLoading(false)
      })
      .catch(err => {
        setLoading(false)
        setGraphLoading(false)
        console.error("Fetch failed:", err.message)
        d3.select('#error-message').style('display','block')
      })  
    }
  },[root])

  useEffect(()=>{if(treeDataArray && !countsDataArray && !loading && nodes.length > 0) setGraphLoading(true)},[loading])

  // on tree data load
  useEffect(()=>{
    if (treeDataArray && treeDataArray.length > 0) {
      let mergedTreeData = treeDataArray[0]
      // concept set, merge data
      if (treeDataArray.length > 1) {
        let toHide = []
        rootConcepts.forEach((root,i) => treeDataArray.forEach((data,index) => {
          // not its own data
          if (i !== index) {
            // is included in child_concept_id not as -1 parent
            const filteredRelationships = data.concept_relationships.filter(c => c.levels !== 'Mapped from' && c.levels !== "Maps to" && c.levels !== "-1" && c.levels !== '0')
            if (filteredRelationships.map(d => d.child_concept_id).includes(root)) {
              // add its -1 parents to this array and add its root index to remove list
              const parentRelationships = treeDataArray[i].concept_relationships.filter(c => c.levels === '-1' && !rootConcepts.includes(c.child_concept_id))
              const parentConcepts = treeDataArray[i].concepts.filter(c => parentRelationships.map(d => d.child_concept_id).includes(c.concept_id))
              treeDataArray[index].concept_relationships.push(...parentRelationships)
              treeDataArray[index].concepts.push(...parentConcepts)
              toHide.push(i)
            }
          }
        }))
        let filteredData = treeDataArray
        if (toHide.length > 0) filteredData = treeDataArray.filter((data,i) => !toHide.includes(i))
        mergedTreeData.concept_relationships = filteredData.map(d => d.concept_relationships).flat()
        mergedTreeData.concepts = filteredData.map(d => d.concepts).flat().filter((e, i, a) => a.findIndex(x => deepEqual(x, e)) === i)
      }
      setTreeData(mergedTreeData)
      setRelationship('descendants')
      setCountType('record')
      setView('set')
      setOpenFilters(true)
      setHovered([])
      setNodes([])
      setLinks([])
      setVisible(false)
      setShowConfirmation(false)
      setGraphFilter({gender:-1,age:[-1],source:[-1]})
      // setLevelFilter()
      d3.select("#graph-section").style('width', "60vw")
      if (d3.select('#suggestions-container').style('visibility') === 'hidden') setRefresh(true)
      let filterClass = false
      let classList = mergedTreeData.concept_relationships.filter(d => d.levels !== "Mapped from" && d.levels !== "Maps to").map(d => d.concept_class_id).filter((e,n,l) => l.indexOf(e) === n).filter(d => d !== undefined)
      const thisClass = mergedTreeData.concepts.filter(d => rootConcepts.includes(d.concept_id)).map(d => d.concept_class_id).filter((e,n,l) => l.indexOf(e) === n).filter(d => d !== undefined)
      let filteredClassList = []
      setFullClassList(classList)
      if ((!thisClass.includes('Ingredient') && !thisClass.includes('Clinical Drug Comp')) && (classList.includes('Ingredient') || classList.includes('Clinical Drug Comp'))) {
        filteredClassList = classList.filter(d => d !== 'Ingredient' && d !== 'Clinical Drug Comp') 
        setRemovedClasses(classList.filter(d => d === "Ingredient" || d === 'Clinical Drug Comp'))
        filterClass = true
      } 
      // if (classList.length === 1) setClassFilter(classList)
      // else setClassFilter(['All'])
      let filterLevel = false
      if (mergedTreeData.concepts.length > 900) filterLevel = true
      const initialPrune = filterLevel || filterClass ? true : false
      setInitialPrune(initialPrune)
      createInitialTree(mergedTreeData,filterClass,filterLevel,filteredClassList)
    }
  },[treeDataArray])

  // on counts data load 
  useEffect(() => {
    if (countsDataArray && countsDataArray.length > 0) {
      let mergedCountsData = countsDataArray[0]
      // concept set, merge data
      if (countsDataArray.length > 1) mergedCountsData = countsDataArray.flat()
      setCountsData(mergedCountsData)
    }
  },[countsDataArray])

  // set record root line on initial data load
  useEffect(()=>{
    if (countsData && fullTree.nodes) {
      console.log('create initial graph',countsData) 

      // root line
      let rootDescendants = []
      rootConcepts.forEach(root => rootDescendants.push(...fullTree.nodes.find(n => n.name === root).descendants))
      rootDescendants = rootDescendants.filter((e,n,l) => l.indexOf(e) === n).filter(d => fullTree.nodes.find(n => n.name === d).record_counts !== 0)
      const data = countsData.filter(e => rootDescendants.includes(e.concept_id))
      const rootExtentData = d3.extent(data.map(d => d.calendar_year))
      let rootLineData = d3.flatRollup(
        data,
        v => d3.sum(v, d => d.node_record_counts),
        d => d.calendar_year
      ).sort((a, b) => a[0] - b[0])
      setRootLine(rootLineData)
      setRootExtent(rootExtentData) 
    }
  },[countsData,fullTree])

  // set selected concepts on initial data load and when nodes change
  useEffect(()=> {
    if (countsData && nodes) {
      // selected concepts 
      const selectedNodes = nodes
        .filter(d => !d.leaf ? inclusions.includes(d.name) : d)
        .map(d => ({
          name: d.name, 
          leaf: d.leaf ? d.leaf : false, 
          map: (d.leaf && relationship === 'mappings' && d.data.concept.standard_concept) || !d.data.concept.standard_concept ? true : false,
          distance: d.distance ? d.distance : d.source.distance, 
          data: {code_counts: d.leaf ? [] : countsData.filter(c => d.name === c.concept_id), descendant_code_counts: !d.leaf ? [] : relationship === 'descendants' ? countsData.filter(c => d.descendants.filter(d => inclusions.includes(d)).includes(c.concept_id)) : countsData.filter(c => d.descendants.map(name => fullTree.nodes.find(n => n.name === name).mappings.map(m => m.name)).flat().filter(d => inclusions.includes(d)).includes(c.concept_id))}
        }))
      // issue with source if you relationship is mappings but some mappings have been removed or some non mappings have been added
      const mapSelections = nodes.map(d => d.mappings).flat()
          .filter(d => inclusions.includes(d.name) && !nodes.find(n => n.name === d.source.name).leaf)
          .map(d => ({
              name: d.name, 
              leaf: false, 
              map: !d.data.concept.standard_concept ? true : false,
              distance: d.source.distance, 
              data: {code_counts:countsData.filter(c => d.name === c.concept_id),descendant_code_counts:[]}
          }))
      const selections = [...selectedNodes,...mapSelections]
      selections.sort((a,b) => d3.ascending(a.distance, b.distance))
      setSelectedConcepts(selections) 
    }
  },[countsData,nodes])
  
  // person filters
  useEffect(() => {
    if (!selectedConcepts || selectedConcepts.length > personMax || !extent || countType !== 'person') return
    const controller = new AbortController()
    const timeout = setTimeout(() => {
      const queryString = getFilterQueryString()
      fetch(`${API_BASE_URL}/getPersonCountsFilters?${queryString}`, { signal: controller.signal })
        .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status} for filter data`); return res.json() })
        .then(data => { console.log('person filters received', data); setPersonFilterData(data) })
        .catch(err => {
          if (err.name === 'AbortError') return
          console.error('Fetch failed:', err.message)
          d3.select('#error-message').style('display', 'block')
        })
    }, 300)
    return () => { clearTimeout(timeout); controller.abort() }
  }, [selectedConcepts, countType, yearSelection])

  // upset plot
  useEffect(() => {
    if (!selectedConcepts || selectedConcepts.length > personMax || !extent || countType !== 'person') return

    const controller = new AbortController()

    // Delay before starting the fetch
    const fetchTimeout = setTimeout(() => {

      // Start loading indicator if fetch takes longer than 1 second
      const loadingTimeout = setTimeout(() => {
        setGraphLoading(true)
      }, 500)

      const queryString = getQueryString()

      fetch(`${API_BASE_URL}/getPersonCountsUpset?${queryString}`, {
        signal: controller.signal
      })
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP ${res.status} for upset data`)
          }
          return res.json()
        })
        .then(data => {
          console.log('upset data received', data)
          setUpsetData(data)
          setGraphLoading(false)
          clearTimeout(loadingTimeout)
        })
        .catch(err => {
          clearTimeout(loadingTimeout)

          if (err.name === 'AbortError') return

          console.error('Fetch failed:', err.message)
          setGraphLoading(false)
          d3.select('#error-message').style('display', 'block')
        })
    }, 300)

    return () => {
      clearTimeout(fetchTimeout)
      controller.abort()
    }

  }, [selectedConcepts, graphFilter, yearSelection, countType])

  useEffect(()=>{
    if (countType === 'person') {
      if (selectedConcepts.length > personMax) prunePersonCounts()
      else setMaxPersonLevel()
    }
  },[countType])

  useEffect(()=>{
    if (yearSelection) {
      setExtent(yearSelection)
    }
  },[yearSelection])

  return ( loaded ?
    <div className = "App">
      {/* <div id = "overlayBlock"></div> */}
      <Header
        color = {color}
        root = {root}
        // getCounts = {getCounts}
        conceptList = {conceptList}
        // filteredList = {filteredList}
        searchIndex = {searchIndex}
        // setFilteredList = {setFilteredList}
        listIndexes = {listIndexes}
        apiInfo = {apiInfo}
        version = {version}
        allVocabularies = {allVocabularies}
        searchFilter = {searchFilter}
        setSearchFilter = {setSearchFilter}
        refresh = {refresh}
        setRefresh = {setRefresh}
        setExpression = {setExpression}
        setLoading = {setLoading}
        loading = {loading}
        API_BASE_URL = {API_BASE_URL}
        expandedSearch = {expandedSearch}
        setExpandedSearch = {setExpandedSearch}
        moveSlider = {moveSlider}
        relationship = {relationship}
        setRelationship = {setRelationship}
        countType = {countType}
        setCountType = {setCountType}
        updateInclusions = {updateInclusions}
        nodes = {nodes}
        upsetData = {upsetData}
      />
      {(conceptList.length > 0 && !root) && <div className = "loading"><img style = {{width:60,opacity: 0.2}} src={finngen} alt="Finngen logo"/></div>}
      {(!conceptList || loading || initialPrune) && <div className = "loading" style={{ fontSize: '20px' }}>
        <div id = "loading-animation" class="lds-grid" style = {{visibility: 'visible'}}><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
        <p id = "loading-text">{!conceptList ? 'Loading search' : 'Loading visualization'}</p>
      </div>}
      <div style = {{display: 'none',fontSize:16}} id = "error-message">Concept not found</div>
      <div id = "content" style={{ visibility: loading ? 'hidden' : 'visible'}}>
        <Routes>
          <Route path="/" element={<Navigate to="/" replace />} />
          <Route path="/:urlCode" element={
            <Visualization
              color = {color}
              generateColor = {generateColor}
              // getCounts = {getCounts}
              selectedConcepts = {selectedConcepts}
              setSelectedConcepts = {setSelectedConcepts}
              rootConcepts = {rootConcepts} 
              graphFilter = {graphFilter}
              setGraphFilter = {setGraphFilter}
              extent = {extent}
              setExtent = {setExtent}
              yearSelection = {yearSelection}
              setYearSelection = {setYearSelection}
              stackData = {stackData}
              // conceptNames = {conceptNames}
              view = {view}
              setView = {setView}
              mapRoot = {mapRoot}
              setMapRoot = {setMapRoot}
              nodes = {nodes}
              links = {links}
              setNodes = {setNodes}
              setLinks = {setLinks}
              rootLine = {rootLine}
              relationship = {relationship}
              setRelationship = {setRelationship}
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
              inclusions = {inclusions}
              setInclusions = {setInclusions}
              getAllDescendants = {getAllDescendants}
              linearLayout = {linearLayout}
              getInclusions = {getInclusions}
              edges = {edges}
              setEdges = {setEdges}
              // maxDistance = {maxDistance}
              // setMaxDistance = {setMaxDistance}
              subspaces = {subspaces}
              spaceSubspaces = {spaceSubspaces}
              visitTypeNames = {visitTypeNames}
              nWidth = {nWidth}
              countType = {countType}
              setCountType = {setCountType}
              moveSlider = {moveSlider}
              updateConcepts = {updateConcepts}
              updateWidth = {updateWidth}
              getMidX = {getMidX}
              showConfirmation = {showConfirmation}
              setShowConfirmation = {setShowConfirmation}
              setRootLine = {setRootLine}
              setRootExtent = {setRootExtent}
              getConceptInfo = {getConceptInfo}
              upsetData = {upsetData}
              maxPersonLevel = {maxPersonLevel}
              personFilterData = {personFilterData}
              allNodesMap = {allNodesMap}
              fullTreeNodeMap = {fullTreeNodeMap}
              graphLoading = {graphLoading}
            />      
          } />
        </Routes>
      </div>  
    </div> : null
  )
}

export default App;
