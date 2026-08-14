import React, { useRef, useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import finngen from '../img/finnGen_logo_full.svg'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { faFilter } from '@fortawesome/free-solid-svg-icons'
import { faX } from '@fortawesome/free-solid-svg-icons'
import * as d3 from "d3";

function Header (props) {
    const color = props.color
    const root = props.root 
    const getCounts = props.getCounts
    // const setRoot = props.setRoot
    const inputRef = useRef(null)
    // const reset = props.reset
    const conceptList = props.conceptList
    const filteredList = props.filteredList
    const setFilteredList = props.setFilteredList
    const apiInfo = props.apiInfo
    // const searchIsLoaded = props.searchIsLoaded
    const version = props.version
    const commitSha = process.env.REACT_APP_COMMIT_SHA || 'unknown'
    const allVocabularies = props.allVocabularies
    const searchFilter = props.searchFilter
    const setSearchFilter = props.setSearchFilter
    // const isConceptSet = props.isConceptSet
    // const setIsConceptSet = props.setIsConceptSet
    const refresh = props.refresh
    const setRefresh = props.setRefresh
    const setExpression = props.setExpression
    const setLoading = props.setLoading
    const loading = props.loading
    const API_BASE_URL = props.API_BASE_URL
    const expandedSearch = props.expandedSearch
    const setExpandedSearch = props.setExpandedSearch
    const moveSlider = props.moveSlider
    const countType = props.countType
    const setCountType = props.setCountType
    const relationship = props.relationship
    const setRelationship = props.setRelationship
    const updateInclusions = props.updateInclusions
    const nodes = props.nodes
    // const listIndexes = props.listIndexes
    const codes = conceptList.map(d => d.concept_id.toString())
    const names = conceptList.map(d => d.concept_name.toLowerCase())
    const [suggestions,setSuggestions] = useState([])
    const [prevSearch,setPrevSearch] = useState()
    const [showFilter, setShowFilter] = useState(false)
    const [jsonInput, setJsonInput] = useState("")
    const [text,setText] = useState('')
    const navigate = useNavigate()
    const fileInputRef = useRef(null);

    // const handleButtonClick = () => fileInputRef.current.click()
    // const handleFileChange = (event) => {
    //     const file = event.target.files[0];
    //     if (!file) return;
    //     const reader = new FileReader();

    //     reader.onload = (e) => {
    //         const text = e.target.result;
    //         // Simple CSV parsing
    //         const rows = text.split("\n").map(row => row.split(","))
    //         rows.shift()
    //         const obj = rows.map(r => ({name:Number(r[2]),exclude:r[10] === '"TRUE"' ? true : false,descendants:r[11] === '"TRUE"'}))
    //         setExpression(obj);
    //         setLoading(true)
    //         navigate(`/${obj.map(o => o.name).join(",")}`)
    //     };
    //     reader.readAsText(file);
    // };

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

    const handleFeedbackChange = (e) => {setText(e.target.value)}

    const handlePasteJson = () => {
        try {
            const parsed = JSON.parse(jsonInput);
            const items = parsed.items
            const obj = items.map(item => ({name:item.concept.CONCEPT_ID,exclude:item.isExcluded,descendants:item.includeDescendants}))
            setExpression(obj);
            setLoading(true)
            d3.select('#json-overlay').style('display','none')
            setJsonInput('')
            navigate(`/${obj.map(o => o.name).join(",")}`)
        } catch (error) {
            d3.select('#send-json').style('border','1px solid red')
            console.error("Invalid JSON", error);
        }
    }
   
    const handleClick = () => {
        // d3.select('#searchConcept').style('height', '18px')
        d3.select('#suggestions-container').style('visibility','hidden') 
        setSuggestions([]) 
        if (inputRef.current) {
            setRefresh(true)
            if (codes.includes(inputRef.current.value)) {
                setLoading(true)
                navigate(`/${inputRef.current.value}`)
            }
            else if (names.includes(inputRef.current.value.toLowerCase())) { 
                setLoading(true)
                navigate(`/${codes[names.indexOf(inputRef.current.value.toLowerCase())].toString()}`)
            }
            else console.warn(`Concept ${inputRef.current.value} not found.`)
        }
    }

    const handleChange = () => {
        if (inputRef.current.value !== '') {
            d3.select('#searchConcept').style('border','1px solid #6a23d6')   
            if (inputRef.current.value.length > 2) {
                if (filteredList) {
                    let newFiltered = []
                    let input = inputRef.current.value.toLowerCase()
                    const base = inputRef.current.value.startsWith(prevSearch) ? filteredList : conceptList
                    newFiltered = base
                        // .slice(searchIndex)
                        .filter(d => d.concept_name.toLowerCase().includes(input) || d.concept_id.toString().toLowerCase().includes(inputRef.current.value) || d.concept_code.toString().toLowerCase().includes(inputRef.current.value))
                        .sort((a, b) => {
                            if (!isNaN(input)) {
                                // sort by id
                                const aId = a.concept_id.toString()
                                const bId = b.concept_id.toString()
                                const aStarts = aId.startsWith(input)
                                const bStarts = bId.startsWith(input)
                                if (aStarts && !bStarts) return -1
                                if (!aStarts && bStarts) return 1
                                else {return aId.localeCompare(bId) }
                            } else {
                                // sort by name
                                const aName = a.concept_name.toLowerCase()
                                const bName = b.concept_name.toLowerCase()
                                const aStarts = aName.startsWith(input)
                                const bStarts = bName.startsWith(input)
                                if (aStarts && !bStarts) return -1
                                if (!aStarts && bStarts) return 1
                                else {
                                    // sort by code
                                    const aCode = a.concept_code.toString()
                                    const bCode = b.concept_code.toString()
                                    const aStarts = aCode.startsWith(input)
                                    const bStarts = bCode.startsWith(input)
                                    if (aStarts && !bStarts) return -1
                                    if (!aStarts && bStarts) return 1
                                    else {return aName.localeCompare(bName)}
                                }  
                            }
                    })
                    let vocabFiltered = newFiltered.filter(d => (searchFilter === undefined || searchFilter.length === 0) || searchFilter.includes(d.vocabulary_id))
                    setSuggestions(vocabFiltered) 
                    setFilteredList(newFiltered)
                    // d3.select('#searchConcept').style('border','1px solid #6a23d6')       
                } 
            } 
        } else {
            d3.select('#searchConcept').style('border','none')
            d3.select('#suggestions-container').style('visibility','hidden')  
            //d3.select('#search-filter-container').style('top','55px')
            setSuggestions([])  
            setFilteredList(conceptList)
        }  
        setPrevSearch(inputRef.current.value)    
    }

    document.addEventListener('click', (e) => {
        const input = document.getElementById('input-container')
        const inputs = document.querySelectorAll('.name-container')
        const clickedInsideInputs = Array.from(inputs).some(el => el.contains(e.target))
        const filter = document.getElementById('search-filter-container')
        // if (clickedInsideInputs) {
        //     d3.select('#searchConcept').style('height', '18px')
        //     d3.select('#suggestions-container').style('visibility','hidden')  
        //     setFilteredList(conceptList)
        // }
        if ((!input.contains(e.target) && !filter.contains(e.target)) || clickedInsideInputs) {
            d3.select('#searchConcept').style('border','none')
            d3.select('#suggestions-container').style('visibility','hidden')  
            setRefresh(false)
            setShowFilter(false)
            setFilteredList(conceptList)
            if (root) setExpandedSearch(false)
        }   
        const jsonPopup = document.getElementById('json-popup')
        const openJson = document.getElementById('upload-btn')
        const feedbackPopup = document.getElementById('feedback-popup')
        const openFeedback = document.getElementById('feedback-btn')
        if (!jsonPopup.contains(e.target) && !openJson.contains(e.target)) {
            d3.select('#json-overlay').style('display','none')
            setJsonInput('')
        }
        if (!feedbackPopup.contains(e.target) && !openFeedback.contains(e.target)) {
            d3.select('#feedback-overlay').style('display','none')
            document.getElementById('feedback').value = ''
        }
    })

    // root label scrolling
    const el = document.querySelector('.scroll-container')
    let timeout
    if (el) {
        el.addEventListener('scroll', () => {
            el.classList.add('scrolling')
            clearTimeout(timeout)
            timeout = setTimeout(() => {
                el.classList.remove('scrolling')
            }, 500)
        })    
    }

    useEffect(() => {
        if (suggestions.length > 0) {
            let vocabFiltered = filteredList.filter(d => (searchFilter === undefined || searchFilter.length === 0) || searchFilter.includes(d.vocabulary_id))
            setSuggestions(vocabFiltered)
        }
    },[searchFilter])

    useEffect(() => {
        if (root && root !== '') d3.select('#searchConcept').style('padding-left','115px')
        else d3.select('#searchConcept').style('padding-left','40px')
        d3.select('#suggestions-container').selectAll('.suggestion').data(suggestions, d => d.concept_id)
            .join(enter => {
                const div = enter.append('div')
                    .classed('suggestion',true)
                    .attr('id', d => 'suggestion-'+d.concept_id)
                const nameContaner = div.append('div')
                    .classed('name-container',true)
                    .style('width','80%')
                    .style('cursor', d => !root.split(',').map(Number).includes(d.concept_id) ? 'pointer' : 'auto')
                    .on('mouseover',(e,d)=>{
                        if (!root.split(',').map(Number).includes(d.concept_id)) {
                            d3.select('#suggestion-'+d.concept_id).style('background-color','#e0e0e080')
                            d3.select('#cs-btn-container-'+d.concept_id).style('background-color','#36126d')
                            d3.select('#cs-btn-i-'+d.concept_id).style('color','white')
                            d3.select('#cs-btn-label-'+d.concept_id).style('font-weight',500).style('color','#36126d')    
                        }
                    })
                    .on('mouseout',(e,d)=>{
                        if (!root.split(',').map(Number).includes(d.concept_id)) {
                            d3.select('#suggestion-'+d.concept_id).style('background-color','transparent')
                            d3.select('#cs-btn-container-'+d.concept_id).style('background-color','#e0e0e0')
                            d3.select('#cs-btn-i-'+d.concept_id).style('color','#36126d')
                            d3.select('#cs-btn-label-'+d.concept_id).style('font-weight',400).style('color','#4c4c4c')    
                        }
                    })
                    .on('click', (e,d) => {
                        setRefresh(true)
                        // setIsConceptSet(true)
                        if (root && root !== d.concept_id.toString() && !root.split(',').map(Number).includes(d.concept_id)) {
                            setLoading(true)
                            navigate(`/${root+','+d.concept_id}`)
                        }
                        else {
                            setLoading(true)
                            navigate(`/${d.concept_id}`)
                        }
                    })
                const name = nameContaner.append('p')
                    .style('padding-top','6px')
                name.append('span')
                    .classed('suggestion-name conceptName',true)
                    .style('font-size','12px')
                    .html(d => d.concept_name)
                name.append('span')
                    .classed('suggestion-vocab conceptVocab',true)
                    .style('margin-left','6px')
                    .style('color','#36126d')
                    .style('font-size','11px')
                    .html(d => d.vocabulary_id)   
                const codes = nameContaner.append('p')
                    .classed('conceptCode',true)
                    .style('font-size','11px')
                    .style('padding-top','2px')
                    .style('padding-bottom','6px')
                    // .style('opacity','0.4')
                codes.append('span')
                    .html('Code: ')  
                    .style('font-weight',400)
                    .style('opacity',0.7)
                codes.append('span')
                    .classed('suggestion-code num',true)
                    .html(d => d.concept_code)  
                    .style('margin-right','6px')
                codes.append('span')
                    .html('Id: ')  
                    .style('font-weight',400)
                    .style('opacity',0.7)
                codes.append('span')
                    .classed('suggestion-id num',true)
                    .html(d => d.concept_id)  
                const btnContainer = div.append('div')
                    .style('display','flex')
                    .style('justify-content','flex-end')
                    .style('width','100px')
                    .style('margin-right','15px')
                const btn = btnContainer.append('div')
                    .classed('cs-btn-container',true)
                    .attr('id',d => 'cs-btn-container-'+d.concept_id)
                    .style('width', '18px')
                    .style('height', '18px')
                    .style('cursor','pointer')   
                    .style('border-radius','50%') 
                    .style('background-color','#f0f0f0')
                    .style('display', d => root.split(',').map(Number).includes(d.concept_id) ? 'none' : 'flex')
                    .style('align-items','center')
                    .style('justify-content','center')
                    .on('mouseover',(e,d)=>{
                        d3.select('#cs-btn-container-'+d.concept_id).style('background-color','#36126d')
                        d3.select('#cs-btn-i-'+d.concept_id).style('color','white')
                        d3.select('#cs-btn-label-'+d.concept_id).style('font-weight',500).style('color','#36126d')
                    })
                    .on('mouseout',(e,d)=>{
                        d3.select('#cs-btn-container-'+d.concept_id).style('background-color','#f0f0f0')
                        d3.select('#cs-btn-i-'+d.concept_id).style('color','#36126d')
                        d3.select('#cs-btn-label-'+d.concept_id).style('font-weight',400).style('color','#4c4c4c9')
                    })
                    .on('click',(e,d)=>{
                        setRefresh(false)
                        // setIsConceptSet(true)
                        if (root && root !== d.concept_id.toString() && !root.split(',').map(Number).includes(d.concept_id)) {
                            setLoading(true)
                            navigate(`/${root+','+d.concept_id}`)
                        }
                        else {
                            setLoading(true)
                            navigate(`/${d.concept_id}`)
                        }
                    })
                btn.append('i')
                    .classed('cs-btn-i',true)
                    .style('color','#36126d')
                    .classed('fa-solid fa-plus icon',true)
                    .attr('id',d => 'cs-btn-i-'+d.concept_id)
                    .style('opacity',1)
                btnContainer.append('p')    
                    .classed('cs-btn-label',true)
                    .attr('id',d => 'cs-btn-label-'+d.concept_id)
                    .html(d => root.split(',').map(Number).includes(d.concept_id) ? 'Added' : 'Concept set')
                    .style('margin-top','3px')
                    .style('font-style', d => root.split(',').map(Number).includes(d.concept_id) ? 'italic' : 'normal')
                    .style("margin-left",'6px')
                    .style('padding','0')
                    .style('font-weight', d => root.split(',').map(Number).includes(d.concept_id) ? 500 : 400)
            },update => {
                update.selectAll('.suggestion-name')
                    .html(d => d.concept_name)  
                update.selectAll('.suggestion-vocab')
                    .html(d => d.vocabulary_id)  
                update.selectAll('.suggestion-code')
                    .html(d => d.concept_code)  
                update.selectAll('.suggestion-id')
                    .html(d => d.concept_id)   
                update.selectAll('.name-container') 
                    .style('cursor',d => !root.split(',').map(Number).includes(d.concept_id) ? 'pointer' : 'auto')
                    .on('mouseover',(e,d)=>{
                        if (!root.split(',').map(Number).includes(d.concept_id)) {
                            d3.select('#suggestion-'+d.concept_id).style('background-color','#e0e0e080')
                            d3.select('#cs-btn-container-'+d.concept_id).style('background-color','#36126d')
                            d3.select('#cs-btn-i-'+d.concept_id).style('color','white')
                            d3.select('#cs-btn-label-'+d.concept_id).style('font-weight',500).style('color','#36126d')    
                        }
                    })
                    .on('mouseout',(e,d)=>{
                        if (!root.split(',').map(Number).includes(d.concept_id)) {
                            d3.select('#suggestion-'+d.concept_id).style('background-color','transparent')
                            d3.select('#cs-btn-container-'+d.concept_id).style('background-color','#e0e0e0')
                            d3.select('#cs-btn-i-'+d.concept_id).style('color','#36126d')
                            d3.select('#cs-btn-label-'+d.concept_id).style('font-weight',400).style('color','#4c4c4c9')    
                        }
                    })
                    .on('click', (e,d) => {
                        setRefresh(true)
                        // setIsConceptSet(true)
                        if (root && root !== d.concept_id.toString() && !root.split(',').map(Number).includes(d.concept_id)) {
                            setLoading(true)
                            navigate(`/${root+','+d.concept_id}`)
                        }
                        else {
                            setLoading(true)
                            navigate(`/${d.concept_id}`)
                        }
                    })
                update.selectAll('.cs-btn-container')
                    .style('background-color','#f0f0f0')
                    .style('display', d => root.split(',').map(Number).includes(d.concept_id) ? 'none' : 'flex')
                    .on('mouseover',(e,d)=>{
                        d3.select('#cs-btn-container-'+d.concept_id).style('background-color','#36126d')
                        d3.select('#cs-btn-i-'+d.concept_id).style('color','white')
                        d3.select('#cs-btn-label-'+d.concept_id).style('font-weight',500).style('color','#36126d')
                    })
                    .on('mouseout',(e,d)=>{
                        d3.select('#cs-btn-container-'+d.concept_id).style('background-color','#f0f0f0')
                        d3.select('#cs-btn-i-'+d.concept_id).style('color','#36126d')
                        d3.select('#cs-btn-label-'+d.concept_id).style('font-weight',400).style('color','#4c4c4c9')
                    })
                    .on('click',(e,d)=>{
                        setRefresh(false)
                        if (root && root !== d.concept_id.toString() && !root.split(',').map(Number).includes(d.concept_id)) {
                            setLoading(true)
                            navigate(`/${root+','+d.concept_id}`)
                        }
                        else {
                            setLoading(true)
                            navigate(`/${d.concept_id}`)
                        }
                    })
                update.selectAll('.cs-btn-i')
                    .style('color','#36126d')
                update.selectAll('.cs-btn-label')
                    .html(d => root.split(',').map(Number).includes(d.concept_id) ? 'Added' : 'Concept set')
                    .style('font-style', d => root.split(',').map(Number).includes(d.concept_id) ? 'italic' : 'normal')
                    .style('font-weight', d => root.split(',').map(Number).includes(d.concept_id) ? 500 : 400)
            },exit => exit.remove())  
    }, [suggestions,root])

    useEffect(()=>{
        if (suggestions.length > 0) {
            let count = suggestions.length  
            // d3.select('#searchConcept').style('height', (count*50+28)+'px')
            // d3.select('#search-filter-container').style('top','55px')
            d3.select('#suggestions-container').style('visibility','visible').style('height', (count*50)+'px')
        } 
        else {
            // d3.select('#searchConcept').style('height', '18px')
            //d3.select('#search-filter-container').style('top','55px')
            d3.select('#suggestions-container').style('visibility','hidden')     
        }
    }, [suggestions])

    useEffect(() => {
        inputRef.current.value = ''
        d3.select('#searchConcept').style('border','none')
        if (refresh) {
            setExpandedSearch(false)
            d3.select('#searchBtn').style('opacity',0.7)
        }
        else {
            setExpandedSearch(true)
            d3.select('#searchBtn').style('opacity',1)
        }
    }, [refresh])

    useEffect(() => {
        d3.select('#search-filters').selectAll('.vocab-filter-item').data(allVocabularies, d => d)
            .join(enter => {
                const container = enter.append('div')
                    .classed('vocab-filter-item',true) 
                    .style('display','flex') 
                    .style('align-items','center')
                    .style('margin-right','10px')
                    .style("height",'24px')
                const checkBox = container.append('div') 
                    .classed('vocab-check-box checkBox flex',true)
                    .style('background-color',d => searchFilter.includes(d) ? '#36125d' : 'transparent')
                    .style('border', d => searchFilter.includes(d) ? '1px solid #36125d' : '1px solid #cccccc')
                    .on('click', (e,d) => {
                        if (!searchFilter.includes(d)) setSearchFilter(prev => [...prev, d])
                        else {
                            const newFilter = searchFilter.filter(c => c !== d)  
                            setSearchFilter(newFilter)
                        } 
                    })
                // checkBox.append('i')
                //     .classed('vocab-check-mark fa-solid fa-check icon',true)
                //     .style('display', d => searchFilter.includes(d) ? 'block' : 'none')
                container.append('p')
                    .classed('vocab-p',true)
                    .style('width','100%')
                    .style('font-weight', d => searchFilter.includes(d) ? 500 : 400)
                    .style('color', d => searchFilter.includes(d) ? '#36126d' : '#808080')
                    .html(d => d)
            },update =>{
                update.select('.vocab-check-box')
                    .style('background-color',d => searchFilter.includes(d) ? '#36125d' : 'transparent')
                    .style('border', d => searchFilter.includes(d) ? '1px solid #36125d' : '1px solid #cccccc')
                    .on('click', (e,d) => {
                        if (!searchFilter.includes(d)) setSearchFilter(prev => [...prev, d])
                        else {
                            const newFilter = searchFilter.filter(c => c !== d)  
                            setSearchFilter(newFilter)
                        } 
                    })
                // update.select('.vocab-check-mark')
                //     .style('display', d => searchFilter.includes(d) ? 'block' : 'none')
                update.select('.vocab-p')
                    .style('font-weight', d => searchFilter.includes(d) ? 500 : 400)
                    .style('color', d => searchFilter.includes(d) ? '#36126d' : '#808080')
                    .html(d => d)
            })
    },[allVocabularies,searchFilter])

    useEffect(() => {
        if (expandedSearch && d3.select('#search-container')) {
            d3.select('#input-container').transition().style('width','550px')
            d3.select('#searchConcept').transition().style('display','block')
        }
        else {
            d3.select('#input-container').transition().style('width','42px')
            d3.select('#searchConcept').transition().style('display','none')
            d3.select('#searchBtn').style('opacity',0.7)
            inputRef.current.value = ''
        }
    },[expandedSearch])

    return (
        <div id = "header">
            <div id = 'header-title'><img id = 'finnGen-logo' src={finngen} alt="FinnGen logo"/></div>
            
            <div id = 'search-container'>
                <div id = "input-container" onClick = {() => {if(!expandedSearch) setExpandedSearch(true)}} style = {{opacity: conceptList.length > 0 || root ? 1 : 0.3, pointerEvents: conceptList.length > 0 || root ? 'all' : 'none', transition: '0.5s opacity'}}>
                    <textarea
                        ref={inputRef}
                        type="text"
                        id="searchConcept"
                        placeholder= {!refresh || !root || loading ? "Search concept" : ''}
                        onClick = {() => setRefresh(false)}
                        onChange = {handleChange}
                        onKeyDown = {(e) => {if (e.key === 'Enter') e.preventDefault()}}
                    />

                    <FontAwesomeIcon className = "fa-search btn" id = "searchBtn" icon={faSearch} onClick = {() => setExpandedSearch(!expandedSearch)}></FontAwesomeIcon>
                    
                    <div onClick = {()=>{navigate(``)}} style = {{display: !root || !expandedSearch ? 'none' : 'flex'}} className = 'btn greyBtn flex' id = "clear-concept-set">
                        <p style = {{margin:0}}>Clear Set</p>
                        <FontAwesomeIcon className = "icon" id = "clear-set-icon" icon={faX} />
                    </div>

                    {/* <div class = "scroll-container" id = "search-root-container" style = {{display: refresh && !loading ? 'flex' : 'none'}}></div> */}
                    
                    <div className="dropdown-content dropShadow" id = "suggestions-container"></div>
                    
                    <div onClick = {()=>setShowFilter(!showFilter)} onMouseOver={()=>d3.select('#filter-search').style('color','#36126d')} onMouseOut={()=>d3.select('#filter-search').style('color',()=>searchFilter.length > 0 || showFilter ? '#36126d' : '#808080')} style = {{display: !expandedSearch ? 'none' : 'block', fontWeight: searchFilter.length > 0 ? 500 : 400, color: searchFilter.length > 0 || showFilter ? '#36126d' : '#808080'}} className = "btn" id = "filter-search">Filter</div>
                </div>   
                <button className = "btn mainBtn highlight" id = "upload-btn" onClick={()=>d3.select('#json-overlay').style('display','flex')}>Paste Concept Set</button>
            </div>
            
            <div className = "dropShadow" id = "search-filter-container" style = {{display:showFilter ? 'flex' : 'none', flexDirection:'column',alignItems:'flex-start',justifyContent:'center',zIndex:3000}}>
                <div style = {{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <h1 style = {{marginRight:10,fontWeight:400,paddingBottom:5}}>Vocabulary Filter</h1>
                    <div className = "btn textBtn" onClick = {() => setSearchFilter([])} style = {{display: searchFilter.length > 0 ? 'block' : 'none'}}>Clear</div> 
                </div>
                <div style = {{display:'flex',flexWrap:'wrap',maxWidth:'100%'}} id = "search-filters"></div>
                <div className = "btn greyBtn" onClick = {() => setShowFilter(false)} style = {{backgroundColor:searchFilter.length > 0 ? '#e0e0e0' : 'transparent',color:searchFilter.length > 0 ? '#36126d' : '#4c4c4c9',alignSelf:'flex-end'}}>Confirm</div>
            </div> 

            {/* <div id = "search-info" style = {{display: root.split(',').map(Number).length === 1 && !loading ? rootData.stratified_code_counts?.length > 0 ? 'flex' : 'none' : 'none'}}>
                <div><span style = {{color:'#4c4c4c9',fontWeight:400,marginRight:4}}>Record Counts:</span>{rootData.stratified_code_counts?.length > 0 ? getCounts(rootData.stratified_code_counts.filter(d => d.concept_id === parseInt(root)),"node_record_counts") : null}</div>
                <div className = "search-info-line"></div>
                <div style = {{marginRight:10}}><span style = {{color:'#4c4c4c9',fontWeight:400,marginRight:4}}>Descendant Record Counts:</span>{rootData.stratified_code_counts?.length > 0 ? getCounts(rootData.stratified_code_counts.filter(d => d.concept_id === parseInt(root)),"node_descendant_record_counts") : null}</div>
            </div>  */}

            <div id = 'app-controls' style = {{left: expandedSearch && 800 > window.innerWidth/2 - 215 ? '810px' : '50%',transform:expandedSearch && 800 > window.innerWidth/2 - 215 ? 'translateX(0)' : 'translateX(-50%)',display: root && nodes.length > 0 ? 'flex' : 'none'}}>
                <div className = 'toggle' id = "relationship-toggle">
                    <div className = 'mainBtn slider' id='slider-relationship'>''</div>

                    <div className = 'btn toggle-itm' id = 'descendants-toggle' onClick={() => {setRelationship('descendants');moveSlider(0,100,'relationship');updateInclusions('descendants',countType,true)}} style = {{fontWeight:relationship === 'descendants' ? 500 : 400,color:relationship === 'descendants' ? '#36126d' : '#999999'}}>Descendants</div>
                    <div className = 'btn toggle-itm' id = 'mappings-toggle' onClick={() => {setRelationship('mappings');moveSlider(1,100,'relationship');updateInclusions('mappings',countType,true)}} style = {{fontWeight:relationship === 'dappings' ? 500 : 400,color:relationship === 'mappings' ? '#36126d' : '#999999'}}>Mappings</div>
                </div>
                <div className = 'toggle' id = "counts-toggle">
                    <div className = 'mainBtn slider' id='slider-counts'>''</div>

                    <div className = 'btn toggle-itm' id = 'record-toggle' onClick={() => {setCountType('record');moveSlider(0,100,'counts');updateInclusions(relationship,'record',true)}} style = {{fontWeight:countType === 'record' ? 500 : 400,color:countType === 'record' ? '#36126d' : '#999999'}}>Record Counts</div>
                    <div className = 'btn toggle-itm' id = 'person-toggle' onClick={() => {setCountType('person');moveSlider(1,100,'counts');updateInclusions(relationship,'person',true)}} style = {{fontWeight:countType === 'person' ? 500 : 400,color:countType === 'person' ? '#36126d' : '#999999'}}>Person Counts</div>
                </div>
            </div>

            <div id = "header-btns">
                <div className = "textBtn btn" id = "feedback-btn" 
                    onClick={() => {
                        d3.select('#feedback').style('display','block')
                        d3.select('#send-feedback').style('display','block')
                        d3.select('#close-feedback').style('display','block')
                        d3.select('#popup-title-feedback').style('display','block')
                        d3.select('#feedback-sent').style('display','none')
                        d3.select('#feedback-overlay').style('display','flex')
                    }}
                >Send Feedback</div>
                <div className = 'flex btn' id = "api-info"
                    onMouseOver={() => d3.select('#api-popup').style('display','block')}
                    onMouseOut={() => d3.select('#api-popup').style('display','none')}
                >i</div>    
            </div> 

            <div className = "dropShadow" id = "api-popup" style = {{display:'none'}}>
                <p><span className = "api-popup-title">app version:</span>{version}</p>
                <p><span className = "api-popup-title">commit sha:</span>{commitSha}</p>
                <p><span className = "api-popup-title">cdm source abbreviation:</span>{apiInfo?.cdm_source_abbreviation}</p>
                <p><span className = "api-popup-title">cdm source name:</span>{apiInfo?.cdm_source_name}</p>
                <p><span className = "api-popup-title">romop api version:</span>{apiInfo?.romop_api_version}</p>
                <p><span className = "api-popup-title">vocabulary version:</span>{apiInfo?.vocabulary_version}</p>
            </div>

            <div className="overlay" id = 'feedback-overlay'>
                <div className="popup" id = 'feedback-popup'>
                    <FontAwesomeIcon className = 'fa-lg close-popup' id = 'close-feedback' icon={faX} 
                        onClick={() => {
                            d3.select('#feedback-overlay').style('display','none')
                            document.getElementById('feedback').value = ''
                        }}
                    />
                    <h2 className = "popup-title" id='popup-title-feedback'>Send Feedback</h2>
                    <h2 id = "feedback-sent" style = {{display:'none'}}>Feedback sent!</h2>
                    <textarea className = 'text-area' id="feedback" placeholder="Write your feedback..." onChange={handleFeedbackChange}></textarea>
                    <button className = 'send-input' id="send-feedback" style = {{border: text.length > 0 ? '1px solid var(--textlight)' : 'none'}}
                        onClick={ async () => {
                            const text = document.getElementById('feedback').value.trim()
                            if (!text) return
                            try {
                                await sendFeedback(text)
                                d3.select('#feedback').style('display','none')
                                d3.select('#send-feedback').style('display','none')
                                d3.select('#close-feedback').style('display','none')
                                d3.select('#popup-title-feedback').style('display','none')
                                d3.select('#feedback-sent').style('display','block')
                                setTimeout(() => {
                                    d3.select('#feedback-overlay').style('display','none')
                                    document.getElementById('feedback').value = ''
                                }, 1000)
                            } catch (err) {
                                d3.select('#send-feedback').style('border','1px solid red')
                                console.error("Invalid feedback", err)
                            } 
                        }}
                    >Send</button>  
                </div>
            </div>

            <div className="overlay" id = 'json-overlay'>
                <div className="popup" id = 'json-popup' style = {{height:'60%'}}>
                    <FontAwesomeIcon className = 'fa-lg close-popup' id = 'close-json' icon={faX} 
                        onClick={() => {
                            d3.select('#json-overlay').style('display','none')
                            setJsonInput('')
                        }}
                    />
                    <h2 className = "popup-title">Paste JSON</h2>
                    <textarea
                        rows={15}
                        cols={80}
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        placeholder="Paste JSON..."
                        id="json"
                        className='text-area'
                    />
                    <button className = 'send-input' id="send-json" style = {{border: jsonInput.length > 0 ? '1px solid var(--textlight)' : 'none'}}
                        onClick={handlePasteJson}
                    >Submit</button>  
                </div>
            </div>
        </div>
    )    
}

export default Header;