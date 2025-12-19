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
    const reset = props.reset
    const conceptList = props.conceptList
    const filteredList = props.filteredList
    const setFilteredList = props.setFilteredList
    const apiInfo = props.apiInfo
    const searchIsLoaded = props.searchIsLoaded
    const version = props.version
    const allVocabularies = props.allVocabularies
    const searchFilter = props.searchFilter
    const setSearchFilter = props.setSearchFilter
    // const listIndexes = props.listIndexes
    const codes = conceptList.map(d => d.concept_id.toString())
    const names = conceptList.map(d => d.concept_name.toLowerCase())
    const [suggestions,setSuggestions] = useState([])
    const [refresh,setRefresh] = useState(false)
    const [prevSearch,setPrevSearch] = useState()
    const [showFilter, setShowFilter] = useState(false)
    const navigate = useNavigate()
   
    const handleClick = () => {
        d3.select('#searchConcept').style('height', '18px').style('border-radius', '20px') 
        d3.select('#suggestions-container').style('visibility','hidden')  
        setSuggestions([]) 
        if (inputRef.current) {
            setRefresh(true)
            if (inputRef.current.value === root) reset()
            else {
                if (codes.includes(inputRef.current.value)) navigate(`/${inputRef.current.value}`)
                else if (names.includes(inputRef.current.value.toLowerCase())) navigate(`/${codes[names.indexOf(inputRef.current.value.toLowerCase())].toString()}`)
                else console.warn(`Concept ${inputRef.current.value} not found.`)
            } 
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

    // close suggestions / filter
    document.addEventListener('click', (e) => {
        let input = document.getElementById('searchConcept')
        let filter = document.getElementById('search-filter-container')
        let icon = document.getElementById('filter-search')
        if (!input.contains(e.target)) {
            d3.select('#searchConcept').style('height', '18px').style('border-radius', '20px') 
            d3.select('#suggestions-container').style('visibility','hidden')  
            setFilteredList(conceptList)
        } 
        if (!filter.contains(e.target) && !icon.contains(e.target)) setShowFilter(false)    
    })

    useEffect(() => {
        if (suggestions.length > 0) {
            let count = suggestions.length  
            d3.select('#searchConcept').style('height', (count*50+28)+'px').style('border-radius', '18px') 
            d3.select('#suggestions-container').style('visibility','visible').style('height', (count*50)+'px')
        } else {
            d3.select('#searchConcept').style('height', '18px').style('border-radius', '20px') 
            d3.select('#suggestions-container').style('visibility','hidden')     
        }
        d3.select('#suggestions-container').selectAll('.suggestion').data(suggestions, d => d.concept_id)
            .join(enter => {
                const div = enter.append('div')
                    .classed('suggestion',true)
                    .attr('id', d => 'suggestion-'+d.concept_id)
                    .on('mouseover', (e,d) => d3.select('#suggestion-'+d.concept_id).style('font-weight', 700).style('background-color','#ffffff20').style('border-top','1px solid #ffffff20'))
                    .on('mouseout', (e,d) => d3.select('#suggestion-'+d.concept_id).style('font-weight', 400).style('background-color','transparent').style('border-top','none'))
                    .on('click', (e,d) => {
                        setRefresh(true)
                        if (d.concept_id === root) reset()
                        else navigate(`/${d.concept_id}`)
                    })
                const name = div.append('p')
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
                const codes = div.append('p')
                    .style('padding-top','2px')
                    .style('padding-bottom','10px')
                codes.append('span')
                        .classed('suggestion-code',true)
                        .html(d => d.concept_code + ' | ')  
                codes.append('span')
                        .classed('suggestion-id',true)
                        // .style('margin-left','5px')
                        .html(d => d.concept_id)  
            },update => {
                update.selectAll('.suggestion-name')
                    .html(d => d.concept_name)  
                update.selectAll('.suggestion-vocab')
                    .html(d => d.vocabulary_id)  
                update.selectAll('.suggestion-code')
                    .html(d => d.concept_code + ' | ')  
                update.selectAll('.suggestion-id')
                    .html(d => d.concept_id)   
            },exit => exit.remove())  
    }, [suggestions])
    
    useEffect(() => {
        if (!inputRef.current) return
        const handleKeyDown = (e) => {if (e.key === 'Enter') handleClick()}
        inputRef.current.addEventListener('keydown', handleKeyDown)
        return () => {inputRef.current.removeEventListener('keydown', handleKeyDown)}
    }, [handleClick])

    useEffect(() => {
        inputRef.current.value = ''
        setRefresh(true)
    }, [rootData])

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
                .style('color', d => searchFilter.includes(d) ? 'white' : '#ffffff60')
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
                .style('color', d => searchFilter.includes(d) ? 'white' : '#ffffff60')
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
                            border: 'none',
                            resize: 'none',
                            height: 18,
                            maxHeight: 330,
                            fontSize:'14px'
                        }}
                        type="text"
                        id="searchConcept"
                        placeholder="Search concept"
                        onClick = {() => setRefresh(false)}
                        onChange = {handleChange}
                        onKeyDown = {(e) => {if (e.key === 'Enter') e.preventDefault()}}
                    />
                    <div id = "search-root" style = {{pointerEvents: 'none',display: rootData.concepts?.length > 0 && refresh && rootData.concepts.filter(d => d.concept_id === parseInt(root))[0] ? 'flex' : 'none'}}>
                        <p>{rootData.concepts?.length > 0 ? rootData.concepts.filter(d => d.concept_id === parseInt(root))[0] ? rootData.concepts.filter(d => d.concept_id === parseInt(root))[0].concept_name.substring(0, 60) + (rootData.concepts.filter(d => d.concept_id === parseInt(root))[0].concept_name.length > 60 ? '...' : '') : null : null}
                            <span style = {{marginLeft:4,fontSize:'10px',fontWeight:700,color:'#ffffff'}}>{rootData.concepts?.length > 0 ? rootData.concepts.filter(d => d.concept_id === parseInt(root))[0] ? rootData.concepts.filter(d => d.concept_id === parseInt(root))[0].concept_code : null : null}</span>
                            <span style = {{marginLeft:4,fontSize:'10px',fontWeight:400,color:'#ffffff80'}}>{rootData.concepts?.length > 0 ? rootData.concepts.filter(d => d.concept_id === parseInt(root))[0] ? rootData.concepts.filter(d => d.concept_id === parseInt(root))[0].vocabulary_id : null : null}</span></p>
                    </div>
                    <FontAwesomeIcon onClick = {()=>handleClick()} className = "fa-lg fal fa-search" id = "searchBtn" icon={faSearch}></FontAwesomeIcon>
                    <div style = {{top:32}} className="dropdown-content" id = "suggestions-container"></div>
                    <FontAwesomeIcon onClick = {()=>setShowFilter(!showFilter)} onMouseOver={()=>d3.select('#filter-search').style('opacity',1)} onMouseOut={()=>d3.select('#filter-search').style('opacity',()=>searchFilter.length > 0 || showFilter ? 1 : 0.2)} style = {{opacity: searchFilter.length > 0 || showFilter ? 1 : 0.2, display: refresh ? 'none' : 'block'}} className = "fa-solid fa-filter" id = "filter-search" icon={faFilter}></FontAwesomeIcon>
                </div>    
            </div>  
            <div id = "search-filter-container" style = {{display:showFilter ? 'flex' : 'none', flexDirection:'column',alignItems:'flex-start',justifyContent:'center'}}>
                <div style = {{display:'flex',alignItems:'center'}}>
                    <p style = {{color:'white',marginRight:10,fontWeight:400}}>Vocabulary filter</p>
                    <FontAwesomeIcon onClick = {() => setSearchFilter([])} style = {{cursor:'pointer',color:'white',display: searchFilter.length > 0 ? 'block' : 'none'}} className = "fa-solid fa-xs" icon={faX} />    
                </div>
                <div style = {{display:'flex',flexWrap:'wrap',maxWidth:'100%'}} id = "search-filters"></div>
            </div> 
            <div id = "search-info" style = {{display: rootData.stratified_code_counts?.length > 0 ? 'flex' : 'none'}}>
                <div className = "search-info-line"></div>
                <div><span style = {{opacity:0.5,fontWeight:400,marginRight:8}}>Record Counts:</span>{rootData.stratified_code_counts?.length > 0 ? getCounts(rootData.stratified_code_counts.filter(d => d.concept_id === parseInt(root)),"node_record_counts") : null}</div>
                <div className = "search-info-line"></div>
                <div style = {{marginRight:10}}><span style = {{opacity:0.5,fontWeight:400,marginRight:8}}>Descendant Record Counts:</span>{rootData.stratified_code_counts?.length > 0 ? getCounts(rootData.stratified_code_counts.filter(d => d.concept_id === parseInt(root)),"node_descendant_record_counts") : null}</div>
            </div> 
            <div id = "header-btns">
                <div id = "feedback-btn" 
                    onClick={() => {
                        d3.select('#feedback').style('display','block')
                        d3.select('#send-feedback').style('display','block')
                        d3.select('#close-feedback').style('display','block')
                        d3.select('#popup-title').style('display','block')
                        d3.select('#feedback-sent').style('display','none')
                        d3.select('#overlay').style('display','flex')
                    }}
                >Send Feedback</div>
                <div id = "api-info"
                    onMouseOver={() => d3.select('#api-popup').style('display','block')}
                    onMouseOut={() => d3.select('#api-popup').style('display','none')}
                >i</div>    
            </div> 
            <div id = "api-popup" style = {{display:'none'}}>
                <p><span className = "api-popup-title">app version:</span>{version}</p>
                <p><span className = "api-popup-title">cdm source abbreviation:</span>{apiInfo?.cdm_source_abbreviation}</p>
                <p><span className = "api-popup-title">cdm source name:</span>{apiInfo?.cdm_source_name}</p>
                <p><span className = "api-popup-title">romop api version:</span>{apiInfo?.romop_api_version}</p>
                <p><span className = "api-popup-title">vocabulary version:</span>{apiInfo?.vocabulary_version}</p>
            </div>
        </div>
    )    
}

export default Header;