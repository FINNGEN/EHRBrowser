import React, { useRef, useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import finngen from '../img/finngen_logo.svg'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import * as d3 from "d3";

function Header (props) {
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
    // const listIndexes = props.listIndexes
    const codes = conceptList.map(d => d.concept_id.toString())
    const names = conceptList.map(d => d.concept_name.toLowerCase())
    const [suggestions,setSuggestions] = useState([])
    const [refresh,setRefresh] = useState(false)
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
                // if (filteredList.length === conceptList.length) {
                    // let searchIndex = listIndexes[input[0]]
                    newFiltered = filteredList
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
                // }
                // else newFiltered = filteredList
                //         .filter(d => d.concept_name.toLowerCase().includes(input))
                //         .sort((a, b) => {
                //             const aName = a.concept_name.toLowerCase()
                //             const bName = b.concept_name.toLowerCase()
                //             const aStarts = aName.startsWith(input)
                //             const bStarts = bName.startsWith(input)
                //             if (aStarts && !bStarts) return -1
                //             if (!aStarts && bStarts) return 1
                //             else return aName.localeCompare(bName)
                //         })
                //  || d.concept_id.toString().includes(inputRef.current.value)
                setSuggestions(newFiltered) 
                setFilteredList(newFiltered)
                d3.select('#searchConcept').style('box-shadow','0px 0px 6px rgba(0, 0, 0, 0.2)')       
            }
        } else {
            d3.select('#searchConcept').style('height', '18px').style('border-radius', '20px') 
            d3.select('#suggestions-container').style('visibility','hidden')  
            setSuggestions([])  
            setFilteredList(conceptList)
        }  
    }

    // close suggestions
    document.addEventListener('click', (e) => {
        let input = document.getElementById('searchConcept')
        if (!input.contains(e.target)) {
            d3.select('#searchConcept').style('height', '18px').style('border-radius', '20px') 
            d3.select('#suggestions-container').style('visibility','hidden')  
            setFilteredList(conceptList)
        }    
    })

    useEffect(() => {
        if (suggestions.length > 0) {
            let count = suggestions.length  
            d3.select('#searchConcept').style('height', (count*50+28)+'px').style('border-radius', '18px') 
            d3.select('#suggestions-container').style('visibility','visible').style('height', (count*50)+'px')
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
        } 
    }, [suggestions])
    
    useEffect(() => {
        if (!inputRef.current) return
        const handleKeyDown = (e) => {if (e.key === 'Enter') handleClick()}
        inputRef.current.addEventListener('keydown', handleKeyDown)
        return () => {inputRef.current.removeEventListener('keydown', handleKeyDown)}
    }, [handleClick])

    return (
        <div id = "header">
            <div id = "header-title"><img src={finngen} alt="Finngen logo"/></div>
            <div id = "search-container">
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
                        <p>{rootData.concepts?.length > 0 ? rootData.concepts.filter(d => d.concept_id === parseInt(root))[0] ? rootData.concepts.filter(d => d.concept_id === parseInt(root))[0].concept_name : null : null}
                            <span style = {{marginLeft:4,fontSize:'10px',fontWeight:700,color:'#ffffff'}}>{rootData.concepts?.length > 0 ? rootData.concepts.filter(d => d.concept_id === parseInt(root))[0] ? rootData.concepts.filter(d => d.concept_id === parseInt(root))[0].concept_code : null : null}</span>
                            <span style = {{marginLeft:4,fontSize:'10px',fontWeight:400,color:'#ffffff80'}}>{rootData.concepts?.length > 0 ? rootData.concepts.filter(d => d.concept_id === parseInt(root))[0] ? rootData.concepts.filter(d => d.concept_id === parseInt(root))[0].vocabulary_id : null : null}</span></p>
                    </div>
                    <FontAwesomeIcon onClick = {()=>handleClick()} className = "fa-lg fal fa-search" id = "searchBtn" icon={faSearch}></FontAwesomeIcon>
                    <div style = {{top:32}} className="dropdown-content" id = "suggestions-container"></div>
                </div>    
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
                <p><span className = "api-popup-title">cdm source abbreviation:</span>{apiInfo?.cdm_source_abbreviation}</p>
                <p><span className = "api-popup-title">cdm source name:</span>{apiInfo?.cdm_source_name}</p>
                <p><span className = "api-popup-title">romop api version:</span>{apiInfo?.romop_api_version}</p>
                <p><span className = "api-popup-title">vocabulary version:</span>{apiInfo?.vocabulary_version}</p>
            </div>
        </div>
    )    
}

export default Header;