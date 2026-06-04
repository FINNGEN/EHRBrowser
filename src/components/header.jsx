import React, { useRef, useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import finngen from '../img/finngen_logo.svg'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { faFilter } from '@fortawesome/free-solid-svg-icons'
import { faX } from '@fortawesome/free-solid-svg-icons'
import * as d3 from "d3";

function Header (props) {
    const color = props.color
    const root = props.root 
    const rootData = props.rootData
    const getCounts = props.getCounts
    // const setRoot = props.setRoot
    const inputRef = useRef(null)
    // const reset = props.reset
    const conceptList = props.conceptList
    const filteredList = props.filteredList
    const setFilteredList = props.setFilteredList
    const apiInfo = props.apiInfo
    const searchIsLoaded = props.searchIsLoaded
    const version = props.version
    const commitSha = process.env.REACT_APP_COMMIT_SHA || 'unknown'
    const allVocabularies = props.allVocabularies
    const searchFilter = props.searchFilter
    const setSearchFilter = props.setSearchFilter
    const isConceptSet = props.isConceptSet
    const setIsConceptSet = props.setIsConceptSet
    const refresh = props.refresh
    const setRefresh = props.setRefresh
    const setExpression = props.setExpression
    const setLoading = props.setLoading
    const loading = props.loading
    const API_BASE_URL = props.API_BASE_URL
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
        d3.select('#searchConcept').style('height', '18px').style('border-radius', '20px') 
        d3.select('#suggestions-container').style('visibility','hidden')  
        setSuggestions([]) 
        if (inputRef.current) {
            setRefresh(true)
            // if (inputRef.current.value === root) reset()
            // else {
                if (codes.includes(inputRef.current.value)) {
                    setLoading(true)
                    navigate(`/${inputRef.current.value}`)
                }
                else if (names.includes(inputRef.current.value.toLowerCase())) { 
                    setLoading(true)
                    navigate(`/${codes[names.indexOf(inputRef.current.value.toLowerCase())].toString()}`)
                }
                else console.warn(`Concept ${inputRef.current.value} not found.`)
            // } 
        }
    }

    const handleChange = () => {
        if (inputRef.current.value !== '' && inputRef.current.value.length > 2) {
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
                d3.select('#searchConcept').style('box-shadow','0px 0px 6px rgba(0, 0, 0, 0.2)')       
            }
        } else {
            d3.select('#searchConcept').style('height', '18px').style('border-radius', '20px') 
            d3.select('#suggestions-container').style('visibility','hidden')  
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
        if (clickedInsideInputs) {
            d3.select('#searchConcept').style('height', '18px').style('border-radius', '20px') 
            d3.select('#suggestions-container').style('visibility','hidden')  
            setFilteredList(conceptList)
        }
        if (!input.contains(e.target) && !filter.contains(e.target)) {
            d3.select('#searchConcept').style('height', '18px').style('border-radius', '20px') 
            d3.select('#suggestions-container').style('visibility','hidden')  
            setRefresh(true)
            setShowFilter(false)
            setFilteredList(conceptList)
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

    useEffect(() => {
        if (suggestions.length > 0) {
            let vocabFiltered = filteredList.filter(d => (searchFilter === undefined || searchFilter.length === 0) || searchFilter.includes(d.vocabulary_id))
            setSuggestions(vocabFiltered)
        }
    },[searchFilter])

    useEffect(() => {
        d3.select('#suggestions-container').selectAll('.suggestion').data(suggestions, d => d.concept_id)
            .join(enter => {
                const div = enter.append('div')
                    .classed('suggestion',true)
                    .attr('id', d => 'suggestion-'+d.concept_id)
                    .on('mouseover', (e,d) => d3.select('#suggestion-'+d.concept_id).style('font-weight', 700).style('background-color','#ffffff20').style('border-top','1px solid #ffffff20'))
                    .on('mouseout', (e,d) => d3.select('#suggestion-'+d.concept_id).style('font-weight', 400).style('background-color','transparent').style('border-top','none'))
                const nameContaner = div.append('div')
                    .classed('name-container',true)
                    .style('width','80%')
                    .on('click', (e,d) => {
                        // if (isConceptSet) setIsConceptSet(false)
                        setRefresh(true)
                        setIsConceptSet(true)
                        // if (!isConceptSet && root !== d.concept_id.toString()) setIsConceptSet(true)
                        if (root && root !== d.concept_id.toString() && !root.split(',').map(Number).includes(d.concept_id)) {
                            setLoading(true)
                            navigate(`/${root+','+d.concept_id}`)
                        }
                        else {
                            setLoading(true)
                            navigate(`/${d.concept_id}`)
                        }
                        // if (d.concept_id.toString() === root) reset()
                        // else navigate(`/${d.concept_id}`)
                    })
                const name = nameContaner.append('p')
                    .style('cursor','pointer')
                    .style('padding-top','10px')
                name.append('span')
                    .classed('suggestion-name',true)
                    .style('font-size','14px')
                    .html(d => d.concept_name)
                name.append('span')
                    .classed('suggestion-vocab',true)
                    .style('margin-left','5px')
                    .style('font-size','12px')
                    .style('color', '#ffffff50')
                    .html(d => d.vocabulary_id)   
                const codes = nameContaner.append('p')
                    .style('padding-top','2px')
                    .style('padding-bottom','10px')
                codes.append('span')
                    .classed('suggestion-code',true)
                    .html(d => d.concept_code + ' | ')  
                codes.append('span')
                    .classed('suggestion-id',true)
                    // .style('margin-left','5px')
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
                    .style('border','1px solid #ffffff50')
                    .style('background-color','transparent')
                    .style('display', d => isConceptSet && root.split(',').map(Number).includes(d.concept_id) ? 'none' : 'flex')
                    .style('align-items','center')
                    .style('justify-content','center')
                    .on('mouseover',(e,d)=>{
                        d3.select('#cs-btn-container-'+d.concept_id).style('background-color','white')
                        d3.select('#cs-btn-i-'+d.concept_id).style('color',color.text)
                        d3.select('#cs-btn-label-'+d.concept_id).style('font-weight',700)
                    })
                    .on('mouseout',(e,d)=>{
                        d3.select('#cs-btn-container-'+d.concept_id).style('background-color','transparent')
                        d3.select('#cs-btn-i-'+d.concept_id).style('color','white')
                        d3.select('#cs-btn-label-'+d.concept_id).style('font-weight',400)
                    })
                    .on('click',(e,d)=>{
                        setRefresh(false)
                        setIsConceptSet(true)
                        // if (!isConceptSet && root !== d.concept_id.toString()) setIsConceptSet(true)
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
                    .classed('fa-solid fa-plus fa-xs',true)
                    .attr('id',d => 'cs-btn-i-'+d.concept_id)
                    .style('color','white')
                btnContainer.append('p')    
                    .classed('cs-btn-label',true)
                    .attr('id',d => 'cs-btn-label-'+d.concept_id)
                    .html(d => root.split(',').map(Number).includes(d.concept_id) ? 'Added' : 'Concept set')
                    .style('margin-top','2px')
                    .style('font-style', d => root.split(',').map(Number).includes(d.concept_id) ? 'italic' : 'normal')
                    .style("margin-left",'8px')
                    .style('color','white')
                    .style('padding','0')
                    .style('font-weight',400)
            },update => {
                update.selectAll('.suggestion-name')
                    .html(d => d.concept_name)  
                update.selectAll('.suggestion-vocab')
                    .html(d => d.vocabulary_id)  
                update.selectAll('.suggestion-code')
                    .html(d => d.concept_code + ' | ')  
                update.selectAll('.suggestion-id')
                    .html(d => d.concept_id)   
                update.selectAll('.name-container') 
                    .on('click', (e,d) => {
                        // if (isConceptSet) setIsConceptSet(false)
                        setRefresh(true)
                        setIsConceptSet(true)
                        // if (!isConceptSet && root !== d.concept_id.toString()) setIsConceptSet(true)
                        if (root && root !== d.concept_id.toString() && !root.split(',').map(Number).includes(d.concept_id)) {
                            setLoading(true)
                            navigate(`/${root+','+d.concept_id}`)
                        }
                        else {
                            setLoading(true)
                            navigate(`/${d.concept_id}`)
                        }
                        // if (d.concept_id.toString() === root) reset()
                        // else navigate(`/${d.concept_id}`)
                    })
                update.selectAll('.cs-btn-container')
                    .style('display', d => isConceptSet && root.split(',').map(Number).includes(d.concept_id) ? 'none' : 'flex')
                    .on('mouseover',(e,d)=>{
                        d3.select('#cs-btn-container-'+d.concept_id).style('background-color','white')
                        d3.select('#cs-btn-i-'+d.concept_id).style('color',color.text)
                        d3.select('#cs-btn-label-'+d.concept_id).style('font-weight',700)
                    })
                    .on('mouseout',(e,d)=>{
                        d3.select('#cs-btn-container-'+d.concept_id).style('background-color','transparent')
                        d3.select('#cs-btn-i-'+d.concept_id).style('color','white')
                        d3.select('#cs-btn-label-'+d.concept_id).style('font-weight',400)
                    })
                    .on('click',(e,d)=>{
                        setRefresh(false)
                        if (!isConceptSet && root !== d.concept_id.toString()) setIsConceptSet(true)
                        if (root && root !== d.concept_id.toString() && !root.split(',').map(Number).includes(d.concept_id)) {
                            setLoading(true)
                            navigate(`/${root+','+d.concept_id}`)
                        }
                        else {
                            setLoading(true)
                            navigate(`/${d.concept_id}`)
                        }
                    })
                update.selectAll('.cs-btn-label')
                    .html(d => root.split(',').map(Number).includes(d.concept_id) ? 'Added' : 'Concept set')
                    .style('font-style', d => root.split(',').map(Number).includes(d.concept_id) ? 'italic' : 'normal')
            },exit => exit.remove())  
    }, [suggestions,root])

    useEffect(()=>{
        if (suggestions.length > 0) {
            let count = suggestions.length  
            d3.select('#searchConcept').style('height', (count*50+28)+'px').style('border-radius', '18px') 
            d3.select('#suggestions-container').style('visibility','visible').style('height', (count*50)+'px')
        } 
        else {
            d3.select('#searchConcept').style('height', '18px').style('border-radius', '20px') 
            d3.select('#suggestions-container').style('visibility','hidden')     
        }
    }, [suggestions])
    
    useEffect(() => {
        if (!inputRef.current) return
        const handleKeyDown = (e) => {if (e.key === 'Enter') handleClick()}
        inputRef.current.addEventListener('keydown', handleKeyDown)
        return () => {inputRef.current.removeEventListener('keydown', handleKeyDown)}
    }, [handleClick])

    useEffect(() => {
        inputRef.current.value = ''
        // setRefresh(true)
    }, [refresh])

    useEffect(() => {
        d3.select('#search-filters').selectAll('.vocab').data(allVocabularies, d => d)
        .join(enter => {
            const container = enter.append('div')
                .classed('vocab',true) 
                .style('display','flex') 
                .style('align-items','center')
                .style('margin-right','15px')
                .style("height",'30px')
            const checkBox = container.append('div') 
                .classed('vocab-check-box',true)
                .style('cursor','pointer')
                .style('width','12px')
                .style("height",'12px')
                .style('margin-right','6px')
                .style('flex-shrink',0)
                .style('display','flex')
                .style('align-items','center')
                .style('justify-content','center')
                // .attr('id', d => 'check-box-'+d.replace(/\s+/g, ""))
                .style('background-color', d => searchFilter.includes(d) ? 'white' : 'transparent')
                .style('border', d => searchFilter.includes(d) ? '1px solid white' : '1px solid #ffffff80')
                .on('click', (e,d) => {
                    if (!searchFilter.includes(d)) setSearchFilter(prev => [...prev, d])
                    else {
                        const newFilter = searchFilter.filter(c => c !== d)  
                        setSearchFilter(newFilter)
                    } 
                })
            checkBox.append('i')
                .classed('vocab-check-mark fa-solid fa-check fa-xs',true)
                .style('color',color.darkpurple)
                .style('display', d => searchFilter.includes(d) ? 'block' : 'none')
            container.append('p')
                .classed('vocab-p',true)
                // .attr('id', d => 'vocab-'+d.replace(/\s+/g, ""))
                .style('width','100%')
                .style('font-weight', d => searchFilter.includes(d) ? 700 : 400)
                .style('color', d => searchFilter.includes(d) ? 'white' : '#ffffff80')
                .html(d => d)
        },update =>{
            update.select('.vocab-check-box')
                .style('background-color', d => searchFilter.includes(d) ? 'white' : 'transparent')
                .style('border', d => searchFilter.includes(d) ? '1px solid white' : '1px solid #ffffff80')
                .on('click', (e,d) => {
                    if (!searchFilter.includes(d)) setSearchFilter(prev => [...prev, d])
                    else {
                        const newFilter = searchFilter.filter(c => c !== d)  
                        setSearchFilter(newFilter)
                    } 
                })
            update.select('.vocab-check-mark')
                .style('display', d => searchFilter.includes(d) ? 'block' : 'none')
            update.select('.vocab-p')
                .style('font-weight', d => searchFilter.includes(d) ? 700 : 400)
                .style('color', d => searchFilter.includes(d) ? 'white' : '#ffffff80')
                .html(d => d)
        })
    },[allVocabularies,searchFilter])

    return (
        <div id = "header">
            <div id = "header-title"><img src={finngen} alt="Finngen logo"/></div>
            <div id = "search-container" style = {{opacity: searchIsLoaded || root ? 1 : 0.3, pointerEvents: searchIsLoaded || root ? 'all' : 'none', transition: '0.5s opacity'}}>
                <div id = "input-container">
                    <textarea
                        ref={inputRef}
                        style={{
                            marginRight: 6,
                            borderRadius: 20,
                            padding: 10,
                            paddingTop: 11,
                            paddingRight: 10,
                            paddingLeft: 40,
                            border:'none',
                            resize: 'none',
                            height: 18,
                            maxHeight: 330,
                            fontSize:'14px'
                        }}
                        type="text"
                        id="searchConcept"
                        placeholder= {!refresh || !root || loading ? "Search concept" : ''}
                        onClick = {() => setRefresh(false)}
                        onChange = {handleChange}
                        onKeyDown = {(e) => {if (e.key === 'Enter') e.preventDefault()}}
                    />
                    <div id = "search-root-container" style = {{display: refresh && !loading ? 'flex' : 'none'}}></div>
                    <FontAwesomeIcon onClick = {()=>handleClick()} className = "fa-lg fal fa-search" id = "searchBtn" icon={faSearch}></FontAwesomeIcon>
                    <div style = {{top:32}} className="dropdown-content" id = "suggestions-container"></div>
                    <div onClick = {()=>{navigate(``)}} id = "clear-concept-set" style = {{display:isConceptSet && !refresh ? 'block' : 'none'}}>Clear set</div>
                    <div onClick = {()=>setShowFilter(!showFilter)} onMouseOver={()=>d3.select('#filter-search').style('opacity',1)} onMouseOut={()=>d3.select('#filter-search').style('opacity',()=>searchFilter.length > 0 || showFilter ? 1 : 0.5)} style = {{opacity: searchFilter.length > 0 || showFilter ? 1 : 0.5, display: refresh ? 'none' : 'block'}} id = "filter-search">Filter</div>
                </div>    
            </div>  
            <div id = "search-filter-container" style = {{display:showFilter ? 'flex' : 'none', flexDirection:'column',alignItems:'flex-start',justifyContent:'center',zIndex:3000}}>
                <div style = {{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <p style = {{color:'white',marginRight:10,fontWeight:400}}>Vocabulary filter</p>
                    <div className = "search-filter-btn" onClick = {() => setSearchFilter([])} style = {{display: searchFilter.length > 0 ? 'block' : 'none'}}>Clear</div> 
                </div>
                <div style = {{display:'flex',flexWrap:'wrap',maxWidth:'100%'}} id = "search-filters"></div>
                <div className = "search-filter-btn" onClick = {() => setShowFilter(false)} style = {{fontWeight: searchFilter.length > 0 ? 700 : 400,backgroundColor:searchFilter.length > 0 ? 'white' : 'transparent',color:searchFilter.length > 0 ? color.darkpurple : 'white',alignSelf:'flex-end'}}>Confirm</div>
            </div> 
            <div style = {{position:'absolute',left:600}}>
                <button className = 'header-btn' id = "upload-btn" onClick={()=>d3.select('#json-overlay').style('display','flex')}>Paste Concept Set</button>
                {/* <input
                    type="file"
                    accept=".csv"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                /> */}
            </div>
            <div id = "search-info" style = {{display: root.split(',').map(Number).length === 1 && !loading ? rootData.stratified_code_counts?.length > 0 ? 'flex' : 'none' : 'none'}}>
                <div className = "search-info-line"></div>
                <div><span style = {{opacity:0.5,fontWeight:400,marginRight:8}}>Record Counts:</span>{rootData.stratified_code_counts?.length > 0 ? getCounts(rootData.stratified_code_counts.filter(d => d.concept_id === parseInt(root)),"node_record_counts") : null}</div>
                <div className = "search-info-line"></div>
                <div style = {{marginRight:10}}><span style = {{opacity:0.5,fontWeight:400,marginRight:8}}>Descendant Record Counts:</span>{rootData.stratified_code_counts?.length > 0 ? getCounts(rootData.stratified_code_counts.filter(d => d.concept_id === parseInt(root)),"node_descendant_record_counts") : null}</div>
            </div> 
            <div id = "header-btns">
                <div className = 'header-btn' id = "feedback-btn" 
                    onClick={() => {
                        d3.select('#feedback').style('display','block')
                        d3.select('#send-feedback').style('display','block')
                        d3.select('#close-feedback').style('display','block')
                        d3.select('#popup-title-feedback').style('display','block')
                        d3.select('#feedback-sent').style('display','none')
                        d3.select('#feedback-overlay').style('display','flex')
                    }}
                >Send Feedback</div>
                <div id = "api-info"
                    onMouseOver={() => d3.select('#api-popup').style('display','block')}
                    onMouseOut={() => d3.select('#api-popup').style('display','none')}
                >i</div>    
            </div> 
            <div id = "api-popup" style = {{display:'none'}}>
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