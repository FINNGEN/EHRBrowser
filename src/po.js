


/**
 * @namespace po
 * @description
 * Lightweight partial order and embedding utility library for working with posets.
 * Provides helpers to build and analyze dominance matrices, derive cover relations,
 * compute upsets and downsets, manage layered poset structures, apply polar repulsion
 * layouts, and generate circular embeddings for visualization and classification.
 * Po is designed to offer both ready-made chart helpers and D3-like compositional APIs,
 * enabling quick visualization workflows as well as custom chart composition.
**/
//TODO : LAYOUTS
    //* linear layout
    //* circular trelly (without grays)
    //  Axonometric
    //* sauvage chart
    //* spinner chart (preserve grays)
    //  Morphological Embedding
    //* treemap
    //* bivariate coloring
//TODO : INTERACTIONS
    // DOI
    //* circular structure DOI (review print)
    // FCA
    //* conceptual faceting
    //* dynamic coloring (e.g. network graphs)
//TODO : EXAMPLES
    // COLORING
    // // UPSET PLOT
    //// treemap
    //* stacked barchart
    //* clustered parallel coords
    //* intersection glyphs – dimension reduction + colored glyphs (col1 + small_patch_of(col2))
    //* complex network
//TODO : OPERATIONS
    // CLOSURE 
    //* close edges down with phi (and pass it as infima)
    //* close edges up with higher node (and pass it as suprema)
    // SUM
    //* HORIZONTAL generate two subspaces
    //* VERTICAL generate a stack
    
import * as d3 from "d3";
//TODO check if PO
//TODO remove d3 dependency from radial scale

const po = {//edges need to be unique
    domFromEdges : (edges, s = null, t = null) => {  
        
        const isArray = Array.isArray(edges[0])
        const source = s || isArray ? Object.keys(edges[0])[0] : 0;
        const target = t || isArray ? Object.keys(edges[0])[1] : 1;
    
        edges = edges.map(e => [e[source], e[target]]);
        
        const nodes = [...new Set(edges.flat())];
        
        const nodeIndex = Object.fromEntries(nodes.map((node, i) => [node, i]));
        
        const n = nodes.length;
        const matrix = Array(n).fill(0).map(() => Array(n).fill(0));
        
        // Step 1: Initialize the adjacency matrix
        for (const [sourceNode, targetNode] of edges) {
            
            const sourceIdx = nodeIndex[sourceNode];
            const targetIdx = nodeIndex[targetNode];
            matrix[sourceIdx][targetIdx] = 1;
            //matrix[targetIdx][sourceIdx] = 1;
        }
    
        // Step 2: Compute the transitive closure using Floyd-Warshall algorithm
        for (let k = 0; k < n; k++) {
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n; j++) {
                    matrix[i][j] = matrix[i][j] || (matrix[i][k] && matrix[k][j]);
                }
            }
        }
        // const nodeDict = Object.entries(nodeIndex)
        //     .map((e)=>{
        //         e.row = matrix[e[1]]
        //         return e
        //     })
        
        

        //matrix.sort((a,b)=>a.filter(v=>v!==0).length-b.filter(v=>v!==0).length)
        
        return {matrix,nodes};
    },
    filter : (poset, f)=>{
        //TODO : filter by feature
    },
    profileMIS : (data,...columns)=>{
        //TODO : group data by column compound string
        //* filter every combination  "A"== 0 "B"==1 | "A"== 1 "B"==1 | "A"== 0 "B"==2 | "A"== 2 "B"==2
        //return profiles
    },
    scale : (domain,range)=>{
        const extentDomain = domain[1]-domain[0]
        const extentRange = range[1]-range[0]
        const ratio = extentRange/extentDomain

        
        return (value)=> value * ratio
    },
    validateRelations: (profiles,relations) => {
        const related = relations.flat().filter((e,n,l)=>l.indexOf(e) === n)
        const rel= [...relations.map(r=>[...r])]
        
        if(profiles.length !== related.length){ 
            profiles
                .filter(p=>!related.includes(p))
                .forEach((p,n)=>rel.push(["Θ"+p,p]))
        }
        return rel 
    } ,
    close: function (coverMatrix) {
        const n = coverMatrix.length;
        const dominanceMatrix = coverMatrix.map(row => [...row]); // deep copy

        function collect(root, current, visited) {
            for (let j = 0; j < n; j++) {
                if (coverMatrix[current][j] === 1 && !visited.has(j)) {
                    visited.add(j);
                    dominanceMatrix[root][j] = 1; // always write to the fixed root's row
                    collect(root, j, visited);    // advance traversal position, root stays fixed
                }
            }
        }

        for (let i = 0; i < n; i++) {
            collect(i, i, new Set());
        }

        return dominanceMatrix;
    },
    dotProd: (a, b) => a.map((x, i) => x * b[i]).reduce((acc, el) => acc + el),
    findSubspaces : function(profiles) {
                    const labels = profiles.map(e=>e[0])
                    const vectors = profiles.map(e=>e[1])
                    
                    const checked = new Set();
                    const subspaces = [];
                    const ids = [];
                    const {dotProd} = this
                    // DFS recursive search: collect all connected vectors (by dot > 0)
                    function dfs(idx, currSpace, currLabels) {
                        checked.add(idx);
                        currSpace.push(vectors[idx]);
                        currLabels.push(labels[idx]);
                        for (let n = 0; n < vectors.length; ++n) {
                            if (!checked.has(n) && dotProd(vectors[idx], vectors[n]) > 0) {
                                dfs(n, currSpace, currLabels);
                            }
                        }
                    }

                    for (let i = 0; i < profiles.length; ++i) {
                        if (!checked.has(i)) {
                            const subspace = [];
                            const labelSet = [];
                            dfs(i, subspace,labelSet);
                            subspaces.push(subspace);
                            ids.push(labelSet);
                            //ids.push(subspace);
                        }
                    }

                    return {subspaces,ids};
                },
    separateSubspaces : function(subspaces,poset){
            const ssps = subspaces.ids
            return ssps.map(ssp=>{
                const recursiveBound = (list,leaves)=>{
                    
                
                    if(leaves.length > 0 ){
                        const relations = leaves.flatMap(e=>poset.getLower(e).map(lowEl=>[e,lowEl]))
                        
                        if(relations.length>0 && relations[0][0] === relations[0][1])return list.concat(relations)
                        return recursiveBound(
                            list.concat(relations),
                            relations.map(r=>r[1])
                        )
                    }else{
                        
                        return list
                    }
                }
                return recursiveBound([],ssp)
            })
                
        },
    dominanceScores : (poset,layer)=>{ 
        const l = poset.setLayers().layers[layer]
        const rootIndexes = l.map(node => poset.elements.indexOf(node))

        return rootIndexes.map((ri, n) => [
            poset.elements[ri],
            poset.elements.map(e=>poset.getUpset(e).includes(poset.elements[ri])?1:0)
        ])
    },
    coneSize : (poset,layer)=>{ 
        const l = poset.setLayers().layers[layer]
        const rootIndexes = l.map(node => poset.elements.indexOf(node))

        return rootIndexes.map((ri, n) => [
            poset.elements[ri],
            poset.elements.map(e=>poset.getUpset(e).includes(poset.elements[ri]) || poset.getDownset(e).includes(poset.elements[ri])?1:0)
        ])
    },
    boundScores : (poset,layer)=>{ 
        const l = poset.setLayers().layers[layer]
        const rootIndexes = l.map(node => poset.elements.indexOf(node))

        return rootIndexes.map((ri, n) => [
            poset.elements[ri],
            poset.elements.map(e=>poset.getUpper(e).includes(poset.elements[ri]) || poset.getLower(e).includes(poset.elements[ri])?1:0)
        ])
    },
    isSubset: (a,b) => po.dotProd(a,b) === a.filter(x=>x===1).length,
    
    
    getBiggestBound: (poset) => {
       const {layers} = poset.setLayers()
       const mostDenseLayer = layers.map((l,n)=>({n:n, l:l, deg:l.length === 0 ? 0 : l.map(node=>poset.getUpper(node).length+poset.getLower(node).length).reduce((acc,el)=>acc+el)})).sort((a,b)=>b.deg-a.deg)[0]
        
        return  mostDenseLayer.n
    },
    getBarycenter: (poset) => {
       const {layers} = poset.setLayers()
       const mostDenseLayer = layers.map((l,n)=>({n:n, l:l, deg:l.length === 0 ? 0 : l.map(node=>poset.getUpper(node).length+poset.getLower(node).length).reduce((acc,el)=>acc+el)})).sort((a,b)=>b.deg-a.deg)[0]
       const midPoint = Math.trunc((layers.length-1)/2)
        
        return  mostDenseLayer.n > midPoint ? mostDenseLayer.n : midPoint
    },
    
    polarRepulsion : (points,delta=1,alpha=1,f=()=>{}) => {
            

            const diameter = alpha*2
            const tolerance = (diameter/points.length)
            
            //const repulsionStrength = 1;
            //const attractionStrength = -1;
            
            const l =  tolerance//0.05//0.35
            // //(2*Math.PI*(diameter/2))/tolerance
            //*0.0000001
            //original//const position = (r,theta)=>({x:r*Math.cos(theta*(Math.PI/180)), y:r*Math.sin(theta*(Math.PI/180)), theta:theta})
            const position = (d,theta)=>(
                {
                    id:d.id, 
                    x:Math.cos(theta*(Math.PI/180))*alpha, 
                    y:Math.sin(theta*(Math.PI/180))*alpha, 
                    theta:theta
            
                }
            )
            
            const increment = (theta, delta) => (theta + delta) % 360;
            const decrement = (theta, delta) => (theta - delta + 360) % 360;
            
            
            const arcDirection = (theta1, theta2, isDegrees = true) => {
                // Convert degrees to radians if necessary
                if (isDegrees) {
                    theta1 = theta1 * (Math.PI / 180);
                    theta2 = theta2 * (Math.PI / 180);
                }
                
                // Compute angular difference
                let deltaTheta = theta2 - theta1;
                
                // Normalize to the range [-π, π]
                if (deltaTheta > Math.PI) {
                    deltaTheta -= 2 * Math.PI;
                } else if (deltaTheta < -Math.PI) {
                    deltaTheta += 2 * Math.PI;
                }
                
                // Determine direction
                return deltaTheta > 0 ? "left" : "right";
            }
            
            //? the distance is oblivious of how gray something is– would it make sense for it to have an effect on the repulsion?
            const distance = (radius, theta1, theta2, isDegrees = true) => {
                // Convert degrees to radians if necessary
                if (isDegrees) {
                    theta1 = theta1 * (Math.PI / 180);
                    theta2 = theta2 * (Math.PI / 180);
                }
                
                // Compute absolute angular difference
                let deltaTheta = Math.abs(theta2 - theta1);
                
                // Ensure the shortest arc is taken
                deltaTheta = Math.min(deltaTheta, 2 * Math.PI - deltaTheta);
                
                // Compute arc length
                return radius * deltaTheta;
            }
            
            const click = (f,data) =>{
                
                data.forEach((p,n)=>{
                    const unrelatedNeighbors = [...data].filter((_,nn)=>n!==nn)
                    let isTooCloseL = false
                    let isTooCloseR = false
                    
                    unrelatedNeighbors
                    .forEach(un=> {
                        if(distance(diameter/2, p.theta,un.theta) < l){
                            
                            if(arcDirection(p.theta,un.theta) === "left"){
                                isTooCloseL = true
                            }else{
                                isTooCloseR = true
                            }
                        }
                    })
            
            
            
                    
                    
                    
                    if(isTooCloseL)data[n]=position(data[n],decrement(p.theta , delta))
                    if(isTooCloseR)data[n]=position(data[n],increment(p.theta , delta))
                    f()
                })
                
            }
            
            const sim = (click,data,f=()=>{})=>{
                
                let alpha = 100
                //const relaxation = setInterval (()=> {
                while (alpha > 0) {
                    alpha = alpha - 1
                    click(f,data)
                }
                    //if(alpha <= 0)clearInterval(relaxation)
                //},0)
                
            }
            
            sim(click,points)
            
            return points
            
    },
    
    circularEmbedding: function (profiles,ids=[], cells = 12, iterations = 100, learningRate = 0.1, seed=42) { 
                ids = ids.length === 0 ? Array.from({length:profiles.length},(_,n)=>n) : ids
                //FIND SUBSPACES
                const dotProd = (a, b) => a.map((x, i) => x * b[i]).reduce((acc, el) => acc + el);
                
                
                
                const findAllSubspaces = (profiles) => {
                    const checked = new Set();
                    const subspaces = [];

                    // DFS recursive search: collect all connected vectors (by dot > 0)
                    function dfs(idx, currSpace) {
                        checked.add(idx);
                        currSpace.push(profiles[idx]);
                        for (let n = 0; n < profiles.length; ++n) {
                            if (!checked.has(n) && dotProd(profiles[idx], profiles[n]) > 0) {
                                dfs(n, currSpace);
                            }
                        }
                    }

                    for (let i = 0; i < profiles.length; ++i) {
                        if (!checked.has(i)) {
                            const subspace = [];
                            dfs(i, subspace);
                            subspaces.push(subspace);
                        }
                    }

                    return subspaces;
                };
                const subspaces = findAllSubspaces(profiles)
                
                
                
                
                

                function createSeededRandom(seed) {
                    // LCG constants (commonly used values from Numerical Recipes)
                    // 'a' (multiplier): Large prime number
                    // 'c' (increment): Another prime number
                    // 'm' (modulus): A large power of 2 (or a large prime)
                    // These values are chosen to maximize the period and statistical quality of the sequence.
                    const a = 1103515245;
                    const c = 12345;
                    const m = Math.pow(2, 31); // Using 2^31 as modulus for a typical 32-bit PRNG
        
                    // Ensure the initial seed is an integer and within the valid range [0, m-1]
                    // Using bitwise OR 0 to convert to a 32-bit integer and ensure positivity
                    let currentSeed = (Math.abs(Math.floor(seed)) || 1) % m;
        
                    // Return a function that generates the next number in the sequence
                    return function() {
                        // Apply the LCG formula
                        currentSeed = (a * currentSeed + c) % m;
                        // Normalize the result to be between 0 (inclusive) and 1 (exclusive)
                        return currentSeed / m;
                    };
                }
                const random = createSeededRandom(seed)
                //get extent
                
                const transposed =  Array.from({length: profiles[0].length}).fill(0).map( (_,tCol) => profiles.map(row=>row[tCol]))
                const extent = (l) => [Math.min(...l),Math.max(...l)] 
                const extentProfiles = transposed.map(l=>extent(l))
                
                
                const minSpectrum = 6//180 is rather slow
                const maxSpectrum = 30//180 is rather slow
                
                cells = cells > maxSpectrum ? maxSpectrum : cells < minSpectrum ? minSpectrum : cells
                
                const epsilon = 1e-3; // Perturbation magnitude
                const threshold = 1e-4; // Euclidean distance threshold for detecting duplicates
                
                
                // Function to compute the Euclidean distance between two weight vectors
                const euclideanDistance = (a, b) =>
                    Math.sqrt(a.reduce((sum, val, idx) => sum + (val - b[idx]) ** 2, 0));

                // Function to apply a small perturbation to the weights
                function perturbVector(weights) {
                    return weights.map(w => w + epsilon * (random() - 0.5));
                }

                // Function to remove duplicates
                function removeDuplicates(neurons) {
                    const seen = [];

                    neurons.forEach(neuron => {
                        let isDuplicate = false;
                        for (let i = 0; i < seen.length; i++) {
                            if (euclideanDistance(neuron.weights, seen[i].weights) < threshold) {
                                // Perturb weights if too close to another neuron
                                neuron.weights = perturbVector(neuron.weights);
                                isDuplicate = true;
                                break;
                            }
                        }
                        if (!isDuplicate) {
                            seen.push(neuron); // Add to seen list if no duplicate was found
                        }
                    });
                }

                // Initialize neurons
                const CPRatio = cells / profiles.length 
                const ratioPerSubspace = subspaces.map(ssp=>ssp.length*CPRatio)
                
                
                const subspaceExtent = (subspace) => {
                    const transposed =  Array.from({length: subspace[0].length}).fill(0).map( (_,tCol) => subspace.map(row=>row[tCol]))
                    const extent = (l) => [Math.min(...l),Math.max(...l)] 
                
                    const extentProfiles = transposed.map(l=>extent(l))
                    return extentProfiles
                }

                const ExtentSSPs = subspaces.map(ssp=>subspaceExtent(ssp))
                
                let ssCount=0, 
                    sspThreshold = ratioPerSubspace[0] 
                let neurons = Array.from({ length: cells }, (_, N) => ({
                    position: N,
                    // weights: [...Array(profiles[0].length).fill(0)].map((_, n) => 
                    //     extentProfiles[n][0] + random() * (extentProfiles[n][1] - extentProfiles[n][0])
                    // ),
                    weights: [...Array(profiles[0].length).fill(0)].map((_, n) => {
                        if(N > sspThreshold ){
                            ssCount = ssCount + 1;
                            sspThreshold = sspThreshold + ratioPerSubspace[ssCount]
                        }
                        return (ExtentSSPs[ssCount][n][1] + ExtentSSPs[ssCount][n][0])/2//ExtentSSPs[ssCount][n][0] + random() * (ExtentSSPs[ssCount][n][1] - ExtentSSPs[ssCount][n][0])
                    }),
                    
                    bmus: [],
                    bmusID: [],
                    ref: []
                }));
                // Remove duplicates
                removeDuplicates(neurons);
                
                
                
                
                

                // Helper function to update weights
                
                const updateWeights = (neuron, profile, rate) => {
                    
                    for (let i = 0; i < neuron.weights.length; i++) {
                        //neuron.weights[i] += rate * (profile[i] - neuron.weights[i]);
                        const w = neuron.weights[i] + rate * (profile[i] - neuron.weights[i]);
                        if(w > 0) {
                            neuron.weights[i] = w
                        }else{
                            neuron.weights[i] = 0
                        }
                    }
                };

                // Helper function to get adjacent neurons in circular grid
                const getAdjacetns = (list,i) => {
                    const next = i === list.length-1 ? 0 : i+1;
                    const prev = i === 0 ? list.length-1: i-1;
                    return [{neuron:list[prev],position:prev},{neuron:list[next],position:next}]
                }

                // Helper function to create a new interpolated neuron
                const interpolateNeurons = (a,b) => {
                    
                 return{
                    position : (a.position+b.position)/2,
                    weights: a.weights.map((w,n)=>(w+b.weights[n])/2),
                    bmus : [],
                    bmusID : [],
                    ref : [],
                    
                 } 
                    
                    
                    
                    
                    


                }

                
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
                            const dist = euclideanDistance(neuron.weights, profile);
                            if (dist < minDist) {
                                minDist = dist;
                                bmuIndex = index;
                            }
                        });
                        

                        // Step 2: Update weights of the BMU and its neighbors
                        
                        for (let i = 0; i < cells; i++) {
                            // Calculate neighborhood influence
                            const distance = Math.min(
                                Math.abs(bmuIndex - i),
                                cells - Math.abs(bmuIndex - i) // Wrap around for cylindrical grid
                            );
                            //const influence = Math.exp(-distance / (2 * (1 - t / iterations)));
                            const minSigma = 0.5; // wider = smoother final map
                            const sigma = (1 - t / iterations) + minSigma;
                            const influence = Math.exp(-(distance ** 2) / (2 * sigma ** 2))
                            
                            // Update weights
                            updateWeights(neurons[i], profile, rate * influence);
                        }
                    });
                }

                
                
                profiles.forEach((profile, n) => {
                    
                    let bmuIndex = 0;
                    let minDist = Infinity;

                    neurons.forEach((neuron, index) => {
                        const dist = euclideanDistance(neuron.weights, profile);
                        if (dist < minDist) {
                            minDist = dist;
                            bmuIndex = index;
                        }
                    });
                    
                    
                    neurons[bmuIndex].bmus.push(profile);
                    neurons[bmuIndex].bmusID.push(ids[n]);  // ← Usa ids[n] invece di n
                    neurons[bmuIndex].ref.push(ids[n]);     // ← Questo è ridondante ora
                
                    
                });

                
                // Return SOM object
                return { 
                    neurons , 
                    getNeuron : function(id){ return this.neurons.find(neuron=>neuron.bmusID.includes(id)).position} ,
                    toHue : d3.scaleLinear([0,cells],[0,360])
                };
                

        },
    widget: function (poset,where="body",f=()=>null,...args){
        let selectedNode = "", selectedRing = null;
        const ui = d3.select(where)
      
        const w = 300
        const svg = ui.append("svg").attr("transform","scale(2.5) translate(100,100)")
            .attr("id","widget")
            .attr("width",w)
            .attr("height",w)

        const css = svg.append("style")
            .html(` 
            *{transition: opacity .2s ease-out} 
            line,image{pointer-events:none} 
            g {transform-box: fill-box; transform-origin: center; }
            #lever{transition: filter .35s ease-out}
            .utilsUI[data-state='button']{cursor:pointer !important}
            .utilsUI[data-state='knob']{cursor:drag}
            .ring{transition: .3s ease-out}
            .rotLane{transition: .5s ease-out .1s}
            .ring{fill: none;stroke: black;}
            .invisible{opacity: 0;}
            .dot{fill: black;}
            `)
        const defs = svg.append("defs")
        const saturationGrad = defs.append("linearGradient").attr("id","satGrad")
        
        const lightnessGrad = defs.append("linearGradient").attr("id","liGrad")
            
        const rotationLane = defs.append("radialGradient").attr("id","rotGrad")
            .attr("cx", "57%")   // Center X
            .attr("cy", "48.5%")   // Center Y
            .attr("r", "80%");   // Radius
            rotationLane.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", "white");
            const rlmid = rotationLane.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", "white");

            rotationLane.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", "lightgray");
        
        const rotateUI = svg.append("g")
        .attr("transform","rotate(-35) skewX(30)")
        .append("g")
        .attr("transform","translate(100,80)")


        // ── layer draw order / positioning ──────────────────────────
        // poset.layers[0] is now the infimum end (suprema on top), but we
        // want suprema drawn LAST so they occlude correctly in axonometry.
        // Position and draw order are decoupled: layerData is reversed for
        // painter's-algorithm draw order, while each datum still carries
        // its true index `i` (== depth into poset.layers) for anything
        // downstream that needs the real index (e.g. lowerBound lookups).
        const n = poset.layers.length

        const layerData = poset.layers
            .map((layer, i) => ({ layer, i }))
            .reverse()   // draw order: highest original index first, index 0 last (on top)

        const layers = svg.selectAll(".layer")
            .data(layerData, d => d.i)
            .join("g")
            .classed("layer",true)
            .attr("transform", d => `translate(100,${120-((n-1-d.i)+2)*20}) rotate(0)`)

        const rings = layers.append("g").classed("ring",true)
            .attr("transform","rotate(-35) skewX(30)")
            .append("g").classed("ring-content",true)
        const ringR = 40, radialUnits = d3.range(0,360,30), cg = d3.range(0,360,1)
        
        rings.append("circle")
            .attr("r",ringR)
            .attr("stroke","black")
            .attr("stroke-width","0.1")
            .classed("ring",true)

        const cx = w / 2;
        const cy = d3.select("#widget").node().height / 2;
        const containerSVG = svg.node()

        function getPointInLocalSpace(element, targetGroup, svgNode) {
            let pt = svgNode.createSVGPoint();
            pt.x = element.cx.baseVal.value;
            pt.y = element.cy.baseVal.value;

            const toViewport = element.getCTM();
            const viewportPt = pt.matrixTransform(toViewport);

            const toLocal = targetGroup.getCTM().inverse();
            return viewportPt.matrixTransform(toLocal);
        }

        let drag = d3.drag()
          .on('drag', function(e,d) {
            d3.select(this.parentElement).select(".ring").attr("stroke-width","0.1")
                const angle = Math.atan2(e.y, e.x);
                const x = Math.cos(angle) * r(d);
                const y = Math.sin(angle) * r(d);
                poset.featureOf(d, "pTheta", (angle * 180) / Math.PI)  
                poset.updateFill(d)
                utils.attr("opacity",0)
                //const depth = poset.featureOf(d,"depth")
                
                //d3.selectAll(".reference_"+depth).attr("opacity",1)
                d3.select(this)
                    .attr("cx", x)
                    .attr("cy", y);
                updateEdges()
                updateNodes()
                f(...args)
            })
        //     .on('end',function(){
        //     d3.select(this.parentElement).select(".ring").attr("stroke-width","0.1")
        // })

        const r = (d) => poset.featureOf(d,"pAlpha")*ringR
        const lowerBoundsG = []
        rings.each(function(d){

            

            const layer = d.layer
            const depth = d.i          // real poset.layers index, not DOM/draw order

            const l = d3.select(this)
           
            const lowerBound = layer.map(profile => poset.relations.filter(r=>r[0]===profile && poset.layers[depth+1]?.includes(r[1])))
                .filter(p=>p.length!==0)
                
            if(lowerBound.length){
                const lb = l
                .append("g").classed("edges",true)
                .selectAll("line")
                .data(lowerBound[0])
                
                lowerBoundsG.push({ edgesG: l.append("g").classed("edges", true).node(), data: lowerBound.flat(), ringNode: this })

            }
            l
            .selectAll(".cell")
            .data(radialUnits)
            .join("circle")
            .attr("cx", d => Math.cos((d * Math.PI) / 180) * (ringR+20))
            .attr("cy", d => Math.sin((d * Math.PI) / 180) * (ringR+20))
            .attr("r",5)
            .attr("opacity",0)
            // l
            // .selectAll(".reference_"+depth)
            // .data(radialUnits)
            // .join("circle")
            // .classed("reference_"+depth,true)
            // .attr("cx", d => Math.cos((d * Math.PI) / 180) * (ringR))
            // .attr("cy", d => Math.sin((d * Math.PI) / 180) * (ringR))
            // .attr("r",1)
            // .attr("stroke",d =>poset.newFill((d * Math.PI) / 180), 10 ,depth*(100/poset.layers.length)))
            // .attr("opacity",0)

            let clickCount = 0
            l
            .selectAll("profile")
            .data(layer)
            .join("circle")
            .attr("data-name",d=>d)
            .classed("profile",true)
            .attr("cx", (d) => Math.cos((poset.featureOf(d,"pTheta") * Math.PI) / 180) * r(d))
            .attr("cy", (d) => Math.sin((poset.featureOf(d,"pTheta") * Math.PI) / 180) * r(d))
            .attr("r",5)
            .attr("fill",d=>poset.featureOf(d,"fill"))
            .attr("stroke","white")
            .attr("stroke-width","0.25")
            .on("click",function(e,d) {
                clickCount = (selectedNode === d) ? clickCount+1 : 0
                
                selectedNode = d
                selectedRing = this.parentElement
                
                //TODO RESTORE STATES
                satOpen = false
                let lOpen = false
                //update knobs
                d3.select("#lightness").select("circle")
                        .attr("cx",function(){
                            if(d3.select(this).attr("data-state")==="knob"){
                                return  poset.featureOf(selectedNode,"pL")/4
                            }else{
                                return d3.select(this).attr("cx")
                            }
                        })
                d3.select("#saturation").select("circle")
                        .attr("cx",function(){
                            if(d3.select(this).attr("data-state")==="knob"){
                             
                                return  25-(poset.featureOf(selectedNode,"pAlpha")*25)
                            }else{
                                return d3.select(this).attr("cx")
                            }
                        })
                        
                //------------------
                let pt = svg.node().createSVGPoint();
                pt.x = this.cx.baseVal.value;
                pt.y = this.cy.baseVal.value;
                const screenPt = pt.matrixTransform(this.getCTM());
                // screenPt is now in SVG viewport coordinates
                utils
                .attr("transform", `translate(${screenPt.x - 15}, ${screenPt.y - 10})`)
                .attr("opacity", clickCount%2 === 1 ? 0 : 1)
                d3.select(this).transition().duration(200).attr("stroke", "black");

                //TODO : The limits of lightness
                // should change depending on the other nodes
                 const h = poset.featureOf(d,"pTheta"),l = poset.featureOf(d,"pL"),
                            s = poset.featureOf(d,"pAlpha"), 
                            s0 = 0, s1 = 1, l0=0, l1=100;
                const sGrad = d3.interpolateHsl(poset.newFill(h,s1,l), poset.newFill(h,s0,l)),
                    lGrad = d3.interpolateHsl(poset.newFill(h,s,l0),poset.newFill(h,s,l1/2) ,poset.newFill(h,s,l1))
                saturationGrad.selectAll("stop")
                    .data([sGrad(0),sGrad(1)])
                    .join("stop")
                    .attr("stop-color",d=>d)
                    .attr("offset",(_,i)=>(i*100)+"%" )
                lightnessGrad.selectAll("stop")
                    .data([lGrad(0),lGrad(0.5),lGrad(1)])
                    .join("stop")
                    .attr("stop-color",d=>d)
                    .attr("offset",(_,i)=>(i*(100/2))+"%" )
            })
            .on("mouseover",function(e,d){
                d3.select(this).transition().duration(200).attr("stroke","black")
                d3.select(this.parentElement).select(".ring").attr("stroke-width","0.2")
                
                // setTimeout(() => {
                //    !hoveringUtils && utils.attr("opacity",0)
                // }, 1000);
            })
            .on("mouseout",function(e,d){
                d3.select(this).transition().duration(200).attr("stroke","white")
                d3.select(this.parentElement).select(".ring").attr("stroke-width","0.1")
                // setTimeout(() => {
                //    !hoveringUtils && utils.attr("opacity",0)
                // }, 1000);
            })
            .call(drag);

            
        })
        function updateEdges() {
            lowerBoundsG.forEach(({ edgesG, data, ringNode }) => {
                d3.select(edgesG)
                    .selectAll("line")
                    .data(data)
                    .join("line")
                    .attr("x1", d => Math.cos((poset.featureOf(d[0], "pTheta") * Math.PI) / 180) * r(d[0]))
                    .attr("y1", d => Math.sin((poset.featureOf(d[0], "pTheta") * Math.PI) / 180) * r(d[0]))
                    .attr("x2", d => {
                        const targetEl = document.querySelector(`circle[data-name="${d[1]}"]`);
                        return getPointInLocalSpace(targetEl, ringNode, svg.node()).x;
                    })
                    .attr("y2", d => {
                        const targetEl = document.querySelector(`circle[data-name="${d[1]}"]`);
                        return getPointInLocalSpace(targetEl, ringNode, svg.node()).y;
                    })
                    .attr("stroke", "#707081")
                    .attr("stroke-width", "0.25")
                    .attr("stroke-dasharray", "1 1")
            });
        }
        updateEdges()
                    
        function updateNodes(){
            d3.selectAll(".profile")
            //.attr("fill",d=>poset.toOklab(poset.featureOf(d,"fill")))
            .attr("fill",d=>poset.featureOf(d,"fill"))
            .attr("cx", (d) => Math.cos((poset.featureOf(d,"pTheta") * Math.PI) / 180) * r(d))
            .attr("cy", (d) => Math.sin((poset.featureOf(d,"pTheta") * Math.PI) / 180) * r(d))
        }

        const defAngle = 3.17
        let dragRotateUI = d3.drag().on("start",function(){
            //TODO fix cursor
            rlmid.transition().duration(700).attr("offset", "62%")
            d3.select('body').style('cursor', 'grabbing');
        })
          .on('drag', function(e) {
                // STYLE
                rotLane.attr("opacity",1)
                d3.select(this).style("cursor","grabbing")
                d3.select("#lever")
                    .style("-webkit-filter","drop-shadow( 0.3px 0.3px 1px rgba(150, 150, 150, 0.25))")
                    .style("filter","drop-shadow( 0.3px 0.3px 1px rgba(150, 150, 150, 0.25))")
                utils.attr("opacity",0)
                // FUNC
                // Calculate the angle of the CURRENT mouse position
                const currentAngle = defAngle +Math.atan2(e.y, e.x);
                const rotation = currentAngle*(180/Math.PI)
                //if(rotation>250 || rotation < 210){
                if(rotation>250 || rotation < 90){
               
                
                rotate(rotation)
                const angle = Math.atan2(e.y, e.x);
                const x = Math.cos(angle) * (ringR+15);
                const y = Math.sin(angle) * (ringR+15);
                d3.select(this)
                    .attr("cx", x)
                    .attr("cy", y);
                d3.select(this.parentElement).select("#lever")
                    .attr("x1", x)
                    .attr("y1", y);
                d3.select(this.parentElement).select("#draggableUI")
                    .attr("cx", x)
                    .attr("cy", y)
                    
                    
           
               updateEdges()
               }
            }).on('end',function(){

                rotLane.attr("opacity",0)
                rlmid.transition().duration(700).attr("offset", "100%")
                d3.select(this).style("cursor","grab")

                d3.select("#lever")
                .style("-webkit-filter","drop-shadow( 0.0px 0.0px 0px rgba(150, 150, 150, 0))")
                .style("filter","drop-shadow( 0.0px 0.0px 0px rgba(150, 150, 150, 0))")

                d3.select('body').style('cursor', 'auto')
            });
       
        
        rotateUI.append("circle").attr("r",(ringR+30)).attr("fill","none")//.attr("stroke","black")
        const rotLane = rotateUI.append("circle").attr("r",(ringR+15)).attr("fill","url(#rotGrad)")
            .attr("style", "fill: url(#rotGrad)")
            .attr("opacity",0)
            //.attr("cx",-5)
            //.attr("cy",5)
            .attr("stroke","lightgray")
            .attr("stroke-width","0.2")
            .attr("stroke-dashoffset","325")
            .attr("stroke-dasharray","190 200")
            .classed("rotLane",true)

        rotateUI.append("line").attr("id","lever")
            .attr("x1",0)
            .attr("y1",0)
            .attr("x2", 0)
            .attr("y2", 0)
            .attr("stroke","white")
            .attr("stroke-width","4")
            .attr("stroke-linecap","round")
            .style("-webkit-filter","drop-shadow( 0.3px 0.3px 1px rgba(150, 150, 150, .0))")
            .style("filter","drop-shadow( 0.3px 0.3px 1px rgba(150, 150, 150, .0))")

        rotateUI.append("circle")
        .attr("id","draggableUI")
        .attr("r",1.5)
        .attr("cx", Math.cos(defAngle) * (ringR+15))
        .attr("cy", Math.sin(defAngle) * (ringR+15))
        .attr("fill","darkgray")
        
        rotateUI.append("circle")
        .attr("id","draggable")
        .attr("r",0)
        .attr("cx", Math.cos(defAngle) * (ringR+15))
        .attr("cy", Math.sin(defAngle) * (ringR+15))
        .style("cursor","grab")
        .attr("opacity","0")
        
        .call(dragRotateUI);

         const rotateIcon = rotateUI.append("g")
         .attr("transform","skewX(-30) rotate(30)")
         .on("click",function(){
            d3.select(this).transition()
            .attr("opacity",0)
            .style("pointer-events","none")

            rotateUI.select("#lever")
            
            .style("-webkit-filter","drop-shadow( 0.3px 0.3px 1px rgba(150, 150, 150, 0.25))")
            .style("filter","drop-shadow( 0.3px 0.3px 1px rgba(150, 150, 150, 0.25))")
            .transition()
            .attr("x1",Math.cos(defAngle) * (ringR+15))
            .attr("y1",Math.sin(defAngle) * (ringR+15))

            rotateUI.select("#draggable")
            .attr("r",9)
        })
        
        rotateIcon.append("circle")
        .attr("id","iconBG")
        .attr("r",6)
        .attr("cx", Math.cos(defAngle) * (ringR+15))
        .attr("cy", Math.sin(defAngle) * (ringR+15))
        .attr("fill","white")
        .style("-webkit-filter","drop-shadow( 0.6px 0.6px 1px rgba(150, 150, 150, .25))")
        .style("filter","drop-shadow( 0.6px 0.6px 1px rgba(150, 150, 150, .25))").style("cursor","pointer")
        rotateIcon.append("image")
        .attr("href","./icons/rotate.png")
        .attr("x", Math.cos(defAngle) * (ringR+15)-4)
        .attr("y", Math.sin(defAngle) * (ringR+15)-3)
        .attr("width",8)
        .style("pointer-events","none")
        
        

        let rotation = 0
        function rotate(rotation){
            
            //if(rotation>250 || rotation < 210){

                const layer = svg.selectAll(".ring-content"),
                rotate = `rotate(${rotation})`;
                
                layer.attr("transform", rotate)
                //rotationUI.attr("transform",rotate)
            //}
            
        }
        // document.addEventListener("keydown",e=>{
            
        //     if(e.key==="ArrowRight"){
        //        if(rotation < 180) rotation += 5
        //        rotate(rotation)
        //        updateEdges()
        //     }
        //     if(e.key==="ArrowLeft"){
        //        if(rotation > 0) rotation -= 5
        //        rotate(rotation)
        //        updateEdges()
        //     }

        // })
        
        const utils = svg.append("g").classed("utils",true).attr("opacity",0)
        
        
        const saturation = utils.append("g").attr("id","saturation")
            const saturationCursor = saturation.append("rect")
            .attr("width",0)
            .attr("height",2.5)
            .attr("y",2.9)
            .attr("rx",1.25)
            .classed("cursor",true)
            .attr("fill","url(#satGrad)")
            const margin = 1.25 +25
            // const dragKnob = d3.drag()
            //     .on("drag",function(e,d){
            //             const [mx, my] = d3.pointer(e, svg.node());
            //             d3.select(this)
            //                 .attr("cx",mx)
            //                 .attr("cy",my)
                    
            //     })
            const dragKnobSaturation = d3.drag()
            let satDragOffset = 0
            .on("start", function(e) {
                if(d3.select(this).attr("data-state") === "knob"){
                d3.select('body').style('cursor', 'grabbing');
                d3.select(this).style('cursor', 'grabbing');
                satDragOffset = e.x - +d3.select(this).attr("cx")

                d3.select(selectedRing)
                .append("line")
                .attr("id","satRadius")
                .attr("stroke-linecap","round")
                .attr("stroke-width","0.5")
                .attr("opacity","0")
                d3.select(selectedRing)
                .append("circle")
                .attr("id","satCentre")
                .attr("r","1")
                .attr("stroke","white")
                .attr("stroke-width","0.5")
                .attr("fill",poset.newFill(0,0,poset.featureOf(selectedNode,"pL")))
                }
            })
            .on("drag", function(e,d) {
                if(d3.select(this).attr("data-state") === "knob"){

                    
                    // clamp to bar range [8, 8+barWidth]
                    const raw = e.x - satDragOffset
                    const clamped = Math.max(1, Math.min(1 + barWidth, raw))
                    const value = 1-(((clamped ) / barWidth )-0.04) // 0-1
                    
                    d3.select(this).attr("cx", clamped)
                    
                    if(selectedNode) {
                        poset.featureOf(selectedNode, "pAlpha", value)
                        poset.updateFill(selectedNode)
                        updateNodes()
                        updateEdges()

                        d3.select("#satRadius")
                            .attr("y2",0)
                            .attr("x2",0)
                            .attr("y1", Math.sin((poset.featureOf(selectedNode,"pTheta") * Math.PI) / 180) * r(selectedNode))
                            .attr("x1", Math.cos((poset.featureOf(selectedNode,"pTheta") * Math.PI) / 180) * r(selectedNode))
                            .attr("stroke",poset.featureOf(selectedNode,"fill"))
                            .attr("opacity",value < 0.7 ? 1 : 0)
                    }
                }
            })
            .on('end',function(){
                d3.select('body').style('cursor', 'auto')
                d3.select(this).style('cursor', 'grab');
                d3.select("#satRadius").remove()
                d3.select("#satCentre").remove()
                
            })

            const dragKnobLightness = d3.drag()
            let liDragOffset = 0
            .on("start", function(e) {
                d3.select('body').style('cursor', 'grabbing');
                d3.select(this).style('cursor', 'grabbing');
                liDragOffset = e.x - +d3.select(this).attr("cx")
            })
            .on("drag", function(e,d) {
                if(d3.select(this).attr("data-state") === "knob"){
                    // clamp to bar range [8, 8+barWidth]
                    const raw = e.x - liDragOffset
                    const clamped = Math.max(1, Math.min(1 + barWidth, raw))
                    const value = (((clamped ) / barWidth )-0.04) // 0-1

                    
                    d3.select(this).attr("cx", clamped)


                    if(selectedNode) {
                        poset.featureOf(selectedNode, "pL", value*100)
                        poset.updateFill(selectedNode)
                        updateNodes()
                        updateEdges()
                    }
                }
            })
            .on('end',function(){
                d3.select('body').style('cursor', 'auto')
                d3.select(this).style('cursor', 'grab');
            })
            // toggle bar open/closed on icon click
            let satOpen = false
            let liOpen = false
            // ── utils panel ──────────────────────────────────────────
            const barWidth = 25
            const barY = 4       // vertical center of the bar/knob
            const iconR = 4.3
            const knobR = 2
            
            saturation.append("circle")
                .classed("utilsUI",true)
                .attr("cx",4).attr("cy",4)
                .attr("r",4.3)
                .attr("fill","white")
                .attr("data-state","button")
                .style("-webkit-filter","drop-shadow( 0.4px 0.4px 1px rgba(150, 150, 150, .2))")
                .style("filter","drop-shadow( 0.4px 0.4px 1px rgba(150, 150, 150, .2))")
                .on("click",function(e){
                    e.stopPropagation()
                    if(d3.select(this).attr("data-state") === "button"){

                        satOpen = !satOpen
                        saturationCursor.transition().attr("width", satOpen ? barWidth : 0)
                        //d3.select(this).transition().attr("opacity", satOpen ? 1 : 0)

                        d3.select(this).attr("data-state","knob")
                        saturationCursor.transition().attr("width",25)
                        d3.select(this).style("pointer-events","none").transition().attr("r",2)
                        .style("cursor","grab")
                        //set to value between 0 and barWidth (25)
                        .attr("cx",25-(poset.featureOf(selectedNode,"pAlpha")*25))
                        .style("pointer-events","all")
                        
                        
                        d3.select(this.parentElement).select("image").attr("opacity",0)
                        
                    }
                   
                    
                })
                .call(dragKnobSaturation)
            saturation.append("image")
                .attr("x",1).attr("y",1)
                .attr("height",6).attr("width",6)
                .attr("href","./icons/saturation.png")

                
        //knobs UI    
        const lightness=utils.append("g").attr("id","lightness")
        const lightnessCursor = lightness.append("rect")
            .classed("cursor",true)
            .attr("width",0)
            .attr("height",2.5)
            .attr("y",14)
            .attr("rx",1.25)
            .attr("fill","url(#liGrad)")
            lightness.append("circle")
                .classed("utilsUI",true)
                .attr("cx",4).attr("cy",15)
                .attr("r",4.3)
                .attr("fill","white")
                .attr("data-state","button")
                .style("-webkit-filter","drop-shadow( 0.2px 0.2px 3px rgba(150, 150, 150, .2))")
                .style("filter","drop-shadow( 0.2px 0.2px 3px rgba(150, 150, 150, .2))")
                .on("click",function(e,d){
                    e.stopPropagation()
                    if(d3.select(this).attr("data-state") === "button"){

                        liOpen = !liOpen
                        lightnessCursor.transition().attr("width", liOpen ? barWidth : 0)
                        
                        //d3.select(this).transition().attr("opacity", liOpen ? 1 : 0)

                        d3.select(this).attr("data-state","knob")
                        lightnessCursor.transition().attr("width",25)
                        d3.select(this).transition().attr("r",2)
                        .attr("cx",poset.featureOf(selectedNode,"pL")/4)
                        .style("cursor","grab")
                        //.call(dragKnob)
                        d3.select(this.parentElement).select("image").attr("opacity",0)
                        
                    }
                   
                    
                })
                
                .call(dragKnobLightness)
                
            lightness.append("image")
                .attr("x",1).attr("y",12)
                .attr("height",6).attr("width",6)
                .attr("href","./icons/lightness.png")
    
        

        function resetKnobs(){
            
            const knobs = d3.selectAll("circle[data-state='knob']")
                .transition()
                .attr("cx",4)
                .attr("r",4.3)
                .attr("data-state","button")
                
                
            d3.selectAll(".cursor").transition().attr("width",0)
            utils.selectAll("image").transition().duration(200).delay(200).attr("opacity",1)
            
        }
        ui.node().addEventListener("click",()=>{resetKnobs()})
        ui.node().addEventListener("keydown",(e)=>e.code === "Enter" && resetKnobs())
        },
        
    createPoset:(input, elementNames = null) => {
        const isPoset = typeof input === 'object' && input?.type === 'poset'
        
        let isDominanceMatrix = Array.isArray(input[0]) && typeof input[0][0] === 'number' && input[0].length === input.length;
        let elements, profiles, dominanceMatrix;

        if (isDominanceMatrix) {
            
            // Input is a dominance matrix
            dominanceMatrix = po.close(input);
            elements = elementNames || Array.from({length: dominanceMatrix.length}, (_, i) => `profile_${i}`);
            profiles = elements.map((_, i) => dominanceMatrix[i]);
        } else if(!isPoset) {
            // Input is a multidimensional indices matrix
            profiles = input.sort((a, b) => a.every((v, n) => v >= b[n]) ? 1 : -1);
            elements = elementNames || profiles.map((_, n) => `profile_${n}`);
            dominanceMatrix = Array.from({length: elements.length}, () => Array.from({length: elements.length}).fill(0));
            
            const isDominated = (a, b) => a.every((val, idx) => val <= b[idx]);
            for (let i = 0; i < profiles.length; i++) {
                for (let j = 0; j < profiles.length; j++) {
                    if (i !== j && isDominated(profiles[i], profiles[j])) {
                        dominanceMatrix[i][j] = 1;
                    }
                }
            }
        }else{
            elements = input.elements; 
            profiles = input.profiles; 
            dominanceMatrix = input.dominanceMatrix; 
        }
        
        
        const poset =  {
            elements,
            profiles,
            dominanceMatrix,
            globals: {},
            relationsMSI: [],
            relations: [],
            relationsP: [],
            analytics: { 
                suprema: [],
                infima: [],
            },
            
            

            getDownset: function(element,mask=false) {
                if(Array.isArray(element)) return element.map(e=>this.getDownset(e,mask))
                const index = this.elements.indexOf(element);
                return mask
                ? this.elements.map((_, i) => 
                    this.dominanceMatrix[index][i] === 1 ? 1 : 0
                )
                : this.elements.filter((_,i)=>this.dominanceMatrix[index][i] === 1 ? 1 : 0)
            },

            getUpset: function(element,mask=false) {
                if(Array.isArray(element)) return element.map(e=>this.getUpset(e,mask))
                const index = this.elements.indexOf(element);
                return mask
                ? this.elements.map((_, i) => 
                    this.dominanceMatrix[i][index] === 1 ? 1 : 0
                )
                : this.elements.filter((_,i)=>this.dominanceMatrix[i][index] === 1 ? 1 : 0)
            },
            getCSet: function(element,mask=false) {
                if(Array.isArray(element)) return element.map(e=>this.getCSet(e,mask))
                return this.getUpset(element).concat(this.getDownset(element))
            },

            getDomMatrix: function() {
                return this.dominanceMatrix;
            },

            getCovMatrix: function() {
                if (this.covMatrix) return this.covMatrix;
            
                const n = this.dominanceMatrix.length;
                // Start with a copy of the dominance matrix
                const coveringMatrix = this.dominanceMatrix.map(row => [...row]);
            
                // Iterate through all possible (i, j) pairs
                for (let i = 0; i < n; i++) {
                    for (let j = 0; j < n; j++) {
                        // If i dominates j (transitive closure)
                        if (i !== j && coveringMatrix[i][j] === 1) { // We keep i !== j as self-loops typically don't represent dominance
                            // Check for any intermediate node k
                            for (let k = 0; k < n; k++) {
                                // k must be different from i and j
                                if (k !== i && k !== j) {
                                    // If i dominates k AND k dominates j
                                    // (using the original dominanceMatrix for this check!)
                                    if (this.dominanceMatrix[i][k] === 1 && this.dominanceMatrix[k][j] === 1) {
                                        // Then i does NOT directly cover j, so remove this edge
                                        coveringMatrix[i][j] = 0;
                                        break; // No need to check other k's for this (i, j) pair
                                    }
                                }
                            }
                        }
                    }
                }
            
                this.covMatrix = coveringMatrix;
                return coveringMatrix;
            },
            getCoverRelations: function() {
                if(this.coverRelations) return this.coverRelations
                
                const matrix = this.getCovMatrix()
                const coverRelations = [];
                for (let i = 0; i < matrix.length; i++) {
                    for (let j = 0; j < matrix[i].length; j++) {
                        if (matrix[i][j] === 1) {
                                coverRelations.push({ source: this.elements[i], target: this.elements[j] });
                        }
                    }
                }
                this.coverRelations = coverRelations
                return coverRelations;
            },


           getLower: function(element) {
                if(Array.isArray(element))return element.map(e=>this.getLower(e))
                const row = this.elements.indexOf(element);
                return this.getCovMatrix()[row]
                    .map((e, n) => e === 1 ? n : -1)
                    .filter(e => e !== -1).map(n=>this.elements[n]);
            },
           

           getUpper: function(element) {
                if(Array.isArray(element))return element.map(e=>this.getUpper(e))
                const col = this.elements.indexOf(element);
                return this.getCovMatrix().map(row => row[col])
                    .map((e, n) => e === 1 ? n : -1)
                    .filter(e => e !== -1).map(n=>this.elements[n]);
            },
            getBound: function(element,upper){
                if(Array.isArray(element))return element.map(e=>this.getBound(e,upper))
                if(upper===undefined)return this.getUpper(element).concat(this.getLower(element))
                if(upper){
                    return this.getUpper(element)
                }
                return this.getLower(element)
            },



            enrich: function() {
                if(!this.features){
                    this.features = {};
                    this.elements.forEach(e => this.features[e] = {"name": e});
                }
                this.enrich = function(){return this}
                this.delete = function(feature){this.elements.forEach(profile=>delete this.features[profile][feature])}
                this.featureOf = function(node,feature,value){
                    const get = value === undefined
                    
                    if(Array.isArray(node)){
                        
                        if(get) {
                            return node.map(node=>poset.features?.[node]?.[feature])
                        }
                        else {
                            if(typeof value === 'function'){
                                node.map((node,n)=>poset.features[node][feature] = value(node,n))
                                
                            }else{
                                node.map(node=>poset.features[node][feature] = value)
                            }
                            return this
                        }
                    }
                    
                    if(get) {return this.features?.[node]?.[feature]}
                    
                    if (typeof value === 'function'){
                        this.features[node][feature] = value(node)
                        
                    }else{
                        this.features[node][feature] = value
                    }
                    
                    return this
                }
                this.feature = function(key, value) {
                    if (value === undefined) {
                        return Object.keys(this.features).map(node => this.features[node][key]);
                    } else if (typeof value === 'function') {
                        Object.keys(this.features).forEach((node,row) => 
                            this.features[node][key] = JSON.parse(JSON.stringify(value(node,this.features[node])))
                        );
                    } else {
                        Object.keys(this.features).forEach(node => 
                            this.features[node][key] = JSON.parse(JSON.stringify(value))
                        );
                    }
                    return this
                };

                this.eachFeature = function(feature, f = (node, feat) => [node, feat]) {
                    Object.keys(this.features).forEach(node => 
                        f(node, this.features[node][feature])
                    );
                    return this
                };

                this.toTable = function(){
                    return this.elements.map((e,n)=>({
                        i:n, 
                        relations:this.relations.filter(r=>r[0]===e||r[1]===e), 
                        ...this.features[e]}))
                }
                return this
            },
            print: function(...args){
                const message = args.length>0 ? args.reduce((acc,el)=>`${acc} ${el}`):""
                
                console.log(message, JSON.parse(JSON.stringify(this)))
                return this
            },
            analyze:  function(name,f,args=[]){
                poset.analytics[name] = f(...args)
                return this
            },
            exportStructure: function(){
                
                this.type = 'poset'
                const deepCopy = JSON.parse(JSON.stringify(this))
                
                return deepCopy
            }
        };

        if(isPoset){
            if(input.features)poset.features = input.features
            poset.enrich()
            if(input.layers)poset.layers = input.layers
            if(input.analytics)poset.analytics = input.analytics
        }
        
        
        // Derive relations from dominance matrix
        if(isPoset){
            poset.relationsP = input.relationsP
            poset.relations = input.relations
            poset.relationsMSI = input.relationsMSI
            
        }else{
            
            for (let i = 0; i < dominanceMatrix.length; i++) {
                for (let j = 0; j < dominanceMatrix.length; j++) {
                    if (i !== j && dominanceMatrix[i][j] === 1) {
                        poset.relationsP.push([i, j]);
                        
                        poset.relations.push([elements[i], elements[j]]);
                        poset.relationsMSI.push([dominanceMatrix[i], dominanceMatrix[j]]);
                    }
                }
            }
            
            // Find suprema and infima
            const dominants = poset.relations.map(e => e[0]);
            poset.analytics.infima = poset.elements.filter(p => !dominants.includes(p));
            
            const dominated = poset.relations.map(e => e[1]);
            poset.analytics.suprema = poset.elements.filter(p => !dominated.includes(p));
        }



        
        

        function propagate (start,f,sorted=false) {
            const {layers} = poset
            const below = layers.slice(start + 1)
            const above = layers.slice(0, start).reverse()
            
            below.forEach(l => f(l,layers.indexOf(l),true,sorted))
            above.forEach(l => f(l,layers.indexOf(l),false,sorted))
            return this
        }
        poset.propagate = propagate

        function drawHasse(container,poset=this) {
            container = container || document.querySelector("body")
            const dominanceMatrix = poset.getDomMatrix()
            //poset.feature
            poset.enrich()
                .feature("subScore",(node)=>poset.getUpset(node).length)
                .feature("supScore",(node)=>poset.getDownset(node).length)
                .setLayers()
                .feature("depth",d=>poset.layers.length+poset.layers.findIndex(layer=>layer.includes(d)))

                
            
            
        
            const subscores = poset.feature("subScore"),
                supscores = poset.feature("supScore")
        
                
            function depthSlots(numbers, range) {
                // Create a scaleBand with the unique sorted numbers as the domain
                const sortedNumbers = [...new Set(numbers)].sort((a, b) => a - b);
            
                const bandScale = d3.scaleBand()
                    .domain(sortedNumbers)
                    .range(range) // Range is typically [min, max], e.g., [0, 100]
                    .padding(0.1); // Optional: Add padding between bands
            
                // Map the original numbers to their band positions
                const scale = (x)=> bandScale(x) + bandScale.bandwidth() / 2
                return scale // Center position of the band
            }
                
                const sBScale = depthSlots(subscores,[30,370])
                //const sBScale = d3.scaleLinear(d3.extent(subscores),[30,370])
                const sPScale = d3.scaleLinear(d3.extent(supscores),[370,30])


            poset.feature("depth",(node)=>poset.features[node].depth || sBScale(poset.features[node].subScore) + ((sPScale(poset.features[node].supScore)-sBScale(poset.features[node].subScore))/20))
            const scaleOpacity = d3.scaleLinear( d3.extent(poset.feature("depth")) , [1,0.2])
            
            //poset.elements.map(e=>poset.features(e)["subScore"] = poset.getSubset(e).length)
            // Step 1: Remove transitive edges
            function removeTransitiveEdges(matrix) {
                const n = matrix.length;
                const result = matrix.map(row => [...row]); // Clone the matrix
                // fixed by changing to  modified Floyd-Warshall
                for (let k = 0; k < n; k++) {
                    for (let i = 0; i < n; i++) {
                        for (let j = 0; j < n; j++) {
                            if (i !== j && result[i][k] === 1 && result[k][j] === 1) {
                                result[i][j] = 0; // Remove transitive edge
                            }
                        }
                    }
                }
                return result;
            }
            // Step 2: Convert the matrix to edges
            
            
        
            // Step 3: Perform topological sort to calculate levels
            function topologicalSort(edges, numNodes) {
                const graph = Array.from({ length: numNodes }, () => []);
                const inDegree = Array(numNodes).fill(0);
        
                edges.forEach(edge => {
                    graph[edge.source].push(edge.target);
                    inDegree[edge.target]++;
                });
        
                const queue = [];
                const levels = Array(numNodes).fill(0);
                for (let i = 0; i < numNodes; i++) {
                    if (inDegree[i] === 0) {
                        queue.push(i);
                    }
                }
        
                let level = 0;
                while (queue.length > 0) {
                    const size = queue.length;
                    for (let i = 0; i < size; i++) {
                        const node = queue.shift();
                        levels[node] = level;
                        graph[node].forEach(neighbor => {
                            inDegree[neighbor]--;
                            if (inDegree[neighbor] === 0) {
                                queue.push(neighbor);
                            }
                        });
                    }
                    level++;
                }
        
                return levels;
            }
            
            
            // Preprocess the dominance matrix to remove transitive edges
            //const filteredMatrix = removeTransitiveEdges(dominanceMatrix);
            //const edges = matrixToEdges(filteredMatrix);
            const edges =  this.getCoverRelations().map(cr=>({
                    source: poset.elements.indexOf(cr.source),
                    target: poset.elements.indexOf(cr.target)
                })
            )
            const numNodes = dominanceMatrix.length;
            const levels = poset.elements.map(el=>poset.layers.length-poset.layers.findIndex(l=>l.includes(el)))//topologicalSort(edges, numNodes);
            
            // Step 4: Calculate node positions based on levels
            const width = 600;
            const height = 400;
            // const nodePositions = levels.map((level, i) => ({
            //     id: i,
            //     x: 0, // Temporary x, will be adjusted later
            //     y: height - (height / (Math.max(...levels) + 1) * level + 50), // Maxima at top, infima at bottom
            //     depth: DEPTH ? poset.features[poset.elements[i]]
            //         // this shuld be a method ^^
            //         .depth  : height - (height / (Math.max(...levels) + 1) * level + 50)
            // }));
            
            const nodePositions = levels.map((level, i) => ({
                id: i,
                name: poset.elements[i],
                hasseX: 0, // Temporary x, will be adjusted later
                y: height - (height / (Math.max(...levels) + 1) * level + 50), // Maxima at top, infima at bottom
                depth: 50+poset.layers.findIndex(layer=>layer.includes(poset.elements[i]))*(300/poset.layers.length)//((Object.values(poset.features)[i].depth) * 60) || height - (height / (Math.max(...levels) + 1) * level + 50)
            }));
            
        
            const levelNodes = nodePositions.reduce((acc, pos) => {
                if (!acc[pos.y]) acc[pos.y] = [];
                acc[pos.y].push(pos);
                return acc;
            }, {});
        
            const getX = (node)=>poset.features[node]?.hasseX
            Object.keys(levelNodes).forEach(level => {
                const nodesAtLevel = levelNodes[level];
                const spacing = width / (nodesAtLevel.length + 1);
                nodesAtLevel.forEach((node, index) => {
                    node.hasseX = getX(poset.elements[node.id]) ?? spacing * (index + 1);
                });
            });
        
            
            // Step 5: Render the Hasse diagram using D3.js
            const svg = d3.select(container)
                .append("svg")
                .attr("width", width)
                .attr("height", height);
        
            // Add arrow markers for the edges
            svg.append("defs")
                .append("marker")
                .attr("id", "arrowhead")
                .attr("viewBox", "0 0 10 10")
                .attr("refX", 27)
                .attr("refY", 5)
                .attr("markerWidth", 6)
                .attr("markerHeight", 6)
                .attr("orient", "auto")
                .append("path")
                .attr("d", "M 0 0 L 10 5 L 0 10 Z") // Arrowhead shape
                .attr("fill", "black");
        
            // Draw edges with arrow pointers
            const edgeSelection = svg.append("g")
                .selectAll("line")
                .data(edges)
                .join("line")
                .attr("stroke", "black")
                .attr("stroke-width", 1.5)
                .attr("opacity", 0.25)
                .attr("opacity", 0.1)
                .attr("marker-end", "url(#arrowhead)");
        
            
            // Draw nodes
            const nodeSelection = svg.append("g")
                .selectAll("circle")
                .data(nodePositions)
                .join("circle")
                .on("click",(e,d)=>console.log(poset.getDownset(poset.elements[d.id])))
                .attr("r", 15)
                .attr("cx", d => getX(poset.elements[d.id]) ??d.hasseX)
                .attr("cy", d => d.depth)
                //.attr("fill", d=>(Object.values(poset.features)[d.id].isLeaf?"green":"lightgray"))
                //.attr("fill", d=>poset.features[poset.elements[0]]?.fill?poset.features[poset.elements[d.id]].fill:"lightgray")
                .attr("fill", d=>(poset.featureOf(poset.elements[d.id],"fill")||"lightgray"))
                //.attr("opacity",d => scaleOpacity(d.depth))
                .call(d3.drag()
                    .on("start", function (event, d) {
                        d3.select(this).raise().attr("stroke", "black");
                    })
                    .on("drag", function (event, d) {
                        d.hasseX = event.x;
                        // d.y = event.y;
                        d3.select(this)
                            .attr("cx", d.hasseX)
                            .attr("cy", d.depth);
                        updateEdges();
                    })
                    .on("end", function () {
                        d3.select(this).attr("stroke", null);
                    }));
        
            // Add labels
            const labelSelection = svg.append("g")
                .selectAll("text")
                .data(nodePositions)
                .join("text")
                .attr("x", d => getX(poset.elements[d.id]) ??d.hasseX)
                .attr("y", d => d.depth)
                .text(d => poset.elements[d.id])
                .attr("dy", 5)
                .attr("text-anchor", "middle")
                .attr("font-family", "sans-serif");
        
            // Function to update edges dynamically
            function updateEdges() {
                edgeSelection
                    
                    .attr("x1", d => nodePositions[d.source].hasseX)
                    .attr("y1", d => nodePositions[d.source].depth)
                    .attr("x2", d => nodePositions[d.target].hasseX)
                    .attr("y2", d => nodePositions[d.target].depth);
        
                labelSelection
                    .attr("x", d => d.hasseX)
                    .attr("y", d => d.depth);
            }
        
            // Initial edge rendering
            updateEdges();
        return this    
        
    }
        poset.drawHasse = drawHasse
        
        function circularSOM(profiles,ids = Array.from({length:profiles.length},(_,n)=>n), cells = 12, iterations = 100, learningRate = 0.1, seed=42) {
                
                function createSeededRandom(seed) {
                    // LCG constants (commonly used values from Numerical Recipes)
                    // 'a' (multiplier): Large prime number
                    // 'c' (increment): Another prime number
                    // 'm' (modulus): A large power of 2 (or a large prime)
                    // These values are chosen to maximize the period and statistical quality of the sequence.
                    const a = 1103515245;
                    const c = 12345;
                    const m = Math.pow(2, 31); // Using 2^31 as modulus for a typical 32-bit PRNG
        
                    // Ensure the initial seed is an integer and within the valid range [0, m-1]
                    // Using bitwise OR 0 to convert to a 32-bit integer and ensure positivity
                    let currentSeed = (Math.abs(Math.floor(seed)) || 1) % m;
        
                    // Return a function that generates the next number in the sequence
                    return function() {
                        // Apply the LCG formula
                        currentSeed = (a * currentSeed + c) % m;
                        // Normalize the result to be between 0 (inclusive) and 1 (exclusive)
                        return currentSeed / m;
                    };
                }
                const random = createSeededRandom(seed)
                //get extent
                const transposed =  Array.from({length: profiles[0].length}).fill(0).map( (_,tCol) => profiles.map(row=>row[tCol]))
                const extent = (l) => [Math.min(...l),Math.max(...l)] 
                
                const extentProfiles = transposed.map(l=>extent(l))
                
                
                const minSpectrum = 6//180 is rather slow
                const maxSpectrum = 30//180 is rather slow
                
                cells = cells > maxSpectrum ? maxSpectrum : cells < minSpectrum ? minSpectrum : cells
                
                const epsilon = 1e-3; // Perturbation magnitude
                const threshold = 1e-4; // Euclidean distance threshold for detecting duplicates

                // Function to compute the Euclidean distance between two weight vectors
                const euclideanDistance = (a, b) =>
                    Math.sqrt(a.reduce((sum, val, idx) => sum + (val - b[idx]) ** 2, 0));

                // Function to apply a small perturbation to the weights
                function perturbVector(weights) {
                    return weights.map(w => w + epsilon * (random() - 0.5));
                }

                // Function to remove duplicates
                function removeDuplicates(neurons) {
                    const seen = [];

                    neurons.forEach(neuron => {
                        let isDuplicate = false;
                        for (let i = 0; i < seen.length; i++) {
                            if (euclideanDistance(neuron.weights, seen[i].weights) < threshold) {
                                // Perturb weights if too close to another neuron
                                neuron.weights = perturbVector(neuron.weights);
                                isDuplicate = true;
                                break;
                            }
                        }
                        if (!isDuplicate) {
                            seen.push(neuron); // Add to seen list if no duplicate was found
                        }
                    });
                }

                // Initialize neurons
                const neurons = Array.from({ length: cells }, (_, n) => ({
                    position: n,
                    weights: [...Array(profiles[0].length).fill(0)].map((_, n) => 
                        extentProfiles[n][0] + random() * (extentProfiles[n][1] - extentProfiles[n][0])
                    ),
                    bmus: [],
                    bmusID: [],
                    ref: []
                }));

                // Remove duplicates
                removeDuplicates(neurons);

                
                // Helper function to calculate Euclidean distance
                

                // Helper function to update weights
                const updateWeights = (neuron, profile, rate) => {
                    for (let i = 0; i < neuron.weights.length; i++) {
                        neuron.weights[i] += rate * (profile[i] - neuron.weights[i]);
                    }
                };

                // Training process
                for (let t = 0; t < iterations; t++) {
                    const rate = learningRate * (1 - t / iterations); // Decaying learning rate

                    profiles.forEach(profile => {
                        // Step 1: Find the Best Matching Unit (BMU)
                        let bmuIndex = 0;
                        let minDist = Infinity;
                        neurons.forEach((neuron, index) => {
                            const dist = euclideanDistance(neuron.weights, profile);
                            if (dist < minDist) {
                                minDist = dist;
                                bmuIndex = index;
                            }
                        });

                        // Step 2: Update weights of the BMU and its neighbors
                        for (let i = 0; i < cells; i++) {
                            // Calculate neighborhood influence
                            const distance = Math.min(
                                Math.abs(bmuIndex - i),
                                cells - Math.abs(bmuIndex - i) // Wrap around for cylindrical grid
                            );
                            const influence = Math.exp(-distance / (2 * (1 - t / iterations)));

                            // Update weights
                            updateWeights(neurons[i], profile, rate * influence);
                        }
                    });
                }

                // Assign profiles to neurons as BMUs
                profiles.forEach((profile,n) => {
                    let bmuIndex = 0;
                    let minDist = Infinity;

                    neurons.forEach((neuron, index) => {
                        const dist = euclideanDistance(neuron.weights, profile);
                        if (dist < minDist) {
                            minDist = dist;
                            bmuIndex = index;
                        }
                    });

                    // Ensure no two neurons share the same BMU
                    neurons[bmuIndex].bmus.push(profile);
                    neurons[bmuIndex].bmusID.push(n);
                    neurons[bmuIndex].ref.push(ids[n]);
                    
                });

                // Return SOM object
                return { 
                    neurons , 
                    getNeuron : function(id){ return this.neurons.find(neuron=>neuron.bmusID.includes(id)).position} ,
                    toHue : d3.scaleLinear([0,cells],[0,360])
                };
        }
        
        poset.circularSOM = circularSOM  
              
        function hSep(adjacencyMatrix) {
            const n = adjacencyMatrix.length;
            const INF = Infinity;
        
            // Step 1: Initialize shortest paths matrix (Floyd-Warshall for shortest paths)
            const shortestPaths = Array.from({ length: n }, (_, i) =>
                Array.from({ length: n }, (_, j) =>
                    i === j ? 0 : adjacencyMatrix[i][j] > 0 ? 1 : INF
                )
            );
        
            for (let k = 0; k < n; k++) {
                for (let i = 0; i < n; i++) {
                    for (let j = 0; j < n; j++) {
                        shortestPaths[i][j] = Math.min(
                            shortestPaths[i][j],
                            shortestPaths[i][k] + shortestPaths[k][j]
                        );
                    }
                }
            }
        
            // Step 2: Find longest paths (Topological sort approach for DAGs)
            const inDegree = Array(n).fill(0);
            const topoOrder = [];
            const longestPaths = Array.from({ length: n }, () => Array(n).fill(-INF));
        
            // Compute in-degrees
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n; j++) {
                    if (adjacencyMatrix[i][j] > 0) inDegree[j]++;
                }
            }
        
            // Kahn's Algorithm for topological sorting
            const queue = [];
            for (let i = 0; i < n; i++) {
                if (inDegree[i] === 0) queue.push(i);
            }
        
            while (queue.length > 0) {
                const node = queue.shift();
                topoOrder.push(node);
                for (let neighbor = 0; neighbor < n; neighbor++) {
                    if (adjacencyMatrix[node][neighbor] > 0) {
                        inDegree[neighbor]--;
                        if (inDegree[neighbor] === 0) queue.push(neighbor);
                    }
                }
            }
        
            // Initialize longest paths for self-loops
            for (let i = 0; i < n; i++) longestPaths[i][i] = 0;
        
            // Relax edges in topological order
            for (const u of topoOrder) {
                for (let v = 0; v < n; v++) {
                    if (adjacencyMatrix[u][v] > 0) {
                        for (let k = 0; k < n; k++) {
                            if (longestPaths[k][u] > -INF) {
                                longestPaths[k][v] = Math.max(
                                    longestPaths[k][v],
                                    longestPaths[k][u] + 1
                                );
                            }
                        }
                    }
                }
            }
        
            // Step 3: Compute ratios
            const ratios = Array.from({ length: n }, () => Array(n).fill(null));
        
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n; j++) {
                    const shortest = shortestPaths[i][j];
                    const longest = longestPaths[i][j];
        
                    if (shortest < INF && longest > -INF) {
                        ratios[i][j] = longest/shortest;
                    }
                }
            }
            const scores = ratios.map(row=>row.map(ratio => isNaN(ratio) ? 1 : ratio === null ? 0 : ratio ))
            
            return {
                shortestPaths,
                longestPaths,
                scores,
            };
        }
        poset.hSep = hSep
        
        function colorInterpolation(selectedHues,depth) {
                // Convert Hue to Cartesian coordinates (x, y)
            function hueToCartesian(hue) {
                const angle = (hue / 360) * (2 * Math.PI); // Convert hue from degrees to radians
                const x = Math.cos(angle); // x coordinate on the unit circle
                const y = Math.sin(angle); // y coordinate on the unit circle
                return { x, y };
            }

            // Convert Cartesian coordinates back to Hue and Saturation (HS)
            function cartesianToHS(x, y) {
                const hue = Math.atan2(y, x) * (180 / Math.PI); // Convert to degrees
                const saturation = Math.sqrt(x * x + y * y); // Calculate the distance from the center (saturation)
                return { h: (hue + 360) % 360, s: saturation }; // Ensure hue is between 0 and 360 degrees
            }

            // Function to calculate the centroid of multiple hue values
            function calculateCentroid(hues) {
                let sumX = 0;
                let sumY = 0;

                // Convert each hue to Cartesian coordinates and sum the x and y components
                hues.forEach(hue => {
                const { x, y } = hueToCartesian(hue);
                sumX += x;
                sumY += y;
                });

                // Calculate the centroid by averaging the x and y coordinates
                const centroidX = sumX / hues.length;
                const centroidY = sumY / hues.length;

                // Convert the centroid back to Hue and Saturation
                return cartesianToHS(centroidX, centroidY);
            }

            // HSL to RGB conversion function
            function hslToRgb(h, s, l) {
                let r, g, b;
                h = h / 360;
                s = s / 100;
                l = l / 100;

                if (s === 0) {
                r = g = b = l; // achromatic
                } else {
                const hue2rgb = (p, q, t) => {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1 / 6) return p + (q - p) * 6 * t;
                    if (t < 1 / 2) return q;
                    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                    return p;
                };

                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;

                r = hue2rgb(p, q, h + 1 / 3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1 / 3);
                }

                return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
            }
            const l = depth ? 100-depth : 50

            if (selectedHues.length === 0) {
                return "black";
            }
            const centroid = calculateCentroid(selectedHues);
            // Display the resulting color in the color sample
            const rgb = hslToRgb(centroid.h, centroid.s * 100, l); // Convert centroid to RGB (fixed lightness)
            return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
        }
        poset.colorInterpolation = colorInterpolation  

        function setSubstructure(name,depth){
            if(!this.analytics.substructures)this.analytics.substructures = {}
            
            if(typeof depth === "string" ){
                const substructure = []
                this.eachFeature(depth,(name,feature)=>substructure[feature] === undefined ? substructure[feature] = [name] : substructure[feature].push(name))
                this.analytics.substructures[name] = substructure
                
            }else if(typeof depth === "function"){
                const substructure = []
                this.elements.forEach(name=>substructure[depth(name)]  === undefined ? substructure[depth(name)] = [name] : substructure[depth(name)].push(name))
                this.analytics.substructures[name] = substructure
            }

            // this.flipLayers = function(){
            //     this.layers = this.layers.sort((a,b)=>this.layers.indexOf(b)-this.layers.indexOf(a))
            //     return this
            // }
            return this
        }
        poset.setSubstructure = setSubstructure
        function setLayers(impute){
            
            
            if(poset.layers?.length >0)return this
            
            
                
                function lImp(poset, impute=false) {
                    
                    const nodes = poset.elements, edges = poset.relations.map(rel=>JSON.parse(JSON.stringify(rel)).reverse())
                    const succ = new Map();
                    const predCount = new Map();
                    const layer = new Map();
                
                    // Initialize
                    for (const node of nodes) {
                        succ.set(node, []);
                        predCount.set(node, 0);
                    }
                
                    for (const [from, to] of edges) {
                        succ.get(from).push(to);
                        predCount.set(to, (predCount.get(to) || 0) + 1);
                    }
                
                    // Build reverse topological order (from leaves up)
                    const reverseTopo = [];
                    const visited = new Set();
                    function dfs(n) {
                        if (visited.has(n)) return;
                        visited.add(n);
                        for (const child of succ.get(n)) dfs(child);
                        reverseTopo.push(n);
                    }
                
                    for (const node of nodes) {
                        if (predCount.get(node) === 0) dfs(node);  // start from roots
                    }
                
                    // Assign layers from leaves up
                    for (const node of reverseTopo) {
                        const children = succ.get(node);
                        if (children.length === 0) {
                            layer.set(node, 0); // leaves
                        } else {
                            let maxChildLayer = Math.max(...children.map(c => layer.get(c)));
                            layer.set(node, maxChildLayer + 1);
                        }
                    }
                
                    // Flip layer values so that roots are at layer 0, leaves last
                    const maxLayer = Math.max(...layer.values());
                    for (const node of nodes) {
                        layer.set(node, maxLayer - layer.get(node));
                    }
                
                    // Group by layer
                    const grouped = Array.from(layer.entries()).reduce((acc, [node, depth]) => {
                        if (!acc[depth]) acc[depth] = [];
                        acc[depth].push(node);
                        return acc;
                    }, []).reverse();
                
                    if(impute){
                        grouped.forEach((layer,n)=>{
                            n>0&&layer.filter(node=>{
                                if(poset.analytics.infima.includes(node)){
                                    grouped[0].push(node)
                                    return false
                                }
                                return true
                            })
                        })
                    }
                    
                    return grouped;
                }
                
                this.layers = lImp(this,impute)
                // function cascade(poset,bot,layers=[]){
                //     console.log('L',bot)
                //     layers.push(bot)
                //     const next = bot.flatMap(e=>poset.getUpper(e))
                    
                //     return next.length ===0 ? layers.reverse() : cascade(poset,next,layers)
                // }
                
                //this.layers = cascade(this,this.analytics.infima)
                
            

            // this.flipLayers = function(){
            //     this.layers = this.layers.sort((a,b)=>this.layers.indexOf(b)-this.layers.indexOf(a))
            //     return this
            // }
            return this
        }
        poset.setLayers = setLayers

        function depthOf(id){
            return poset.layers.findIndex(l=>l.includes(id))
        }
        poset.depthOf = depthOf
        function setDepth(){
            poset.enrich().setLayers()
            poset.feature("depth",d=>depthOf(d))
        }
        poset.setDepth = setDepth
        function polarRepulsion(points,delta=1,alpha=1,f=()=>{}){
            

            const diameter = alpha*2
            const tolerance = (diameter/points.length)
            
            //const repulsionStrength = 1;
            //const attractionStrength = -1;
            const l =  0.10//0.05//0.35
            // //(2*Math.PI*(diameter/2))/tolerance
            //*0.0000001
            //original//const position = (r,theta)=>({x:r*Math.cos(theta*(Math.PI/180)), y:r*Math.sin(theta*(Math.PI/180)), theta:theta})
            const position = (d,theta)=>(
                {
                    id:d.id, 
                    x:Math.cos(theta*(Math.PI/180))*alpha, 
                    y:Math.sin(theta*(Math.PI/180))*alpha, 
                    theta:theta
            
                }
            )
            
            const increment = (theta, delta) => (theta + delta) % 360 ;
            const decrement = (theta, delta) => (theta - delta + 360) % 360;
            
            
            const arcDirection = (theta1, theta2, isDegrees = true) => {
                // Convert degrees to radians if necessary
                if (isDegrees) {
                    theta1 = theta1 * (Math.PI / 180);
                    theta2 = theta2 * (Math.PI / 180);
                }
                
                // Compute angular difference
                let deltaTheta = theta2 - theta1;
                
                // Normalize to the range [-π, π]
                if (deltaTheta > Math.PI) {
                    deltaTheta -= 2 * Math.PI;
                } else if (deltaTheta < -Math.PI) {
                    deltaTheta += 2 * Math.PI;
                }
                
                // Determine direction
                return deltaTheta > 0 ? "left" : "right";
            }
            
            
            const distance = (radius, theta1, theta2, isDegrees = true) => {
                // Convert degrees to radians if necessary
                if (isDegrees) {
                    theta1 = theta1 * (Math.PI / 180);
                    theta2 = theta2 * (Math.PI / 180);
                }
                
                // Compute absolute angular difference
                let deltaTheta = Math.abs(theta2 - theta1);
                
                // Ensure the shortest arc is taken
                deltaTheta = Math.min(deltaTheta, 2 * Math.PI - deltaTheta);
                
                // Compute arc length
                return radius * deltaTheta;
            }
            
            const click = (f,data) =>{
                
                data.forEach((p,n)=>{
                    const unrelatedNeighbors = [...data].filter((_,nn)=>n!==nn)
                    let isTooCloseL = false
                    let isTooCloseR = false
                    
                    unrelatedNeighbors
                    .forEach(un=> {
                        if(distance(diameter/2, p.theta,un.theta) < l){
                            if(arcDirection(p.theta,un.theta) === "left"){
                                isTooCloseL = true
                            }else{
                                isTooCloseR = true
                            }
                        }
                    })
            
            
            
                    
                    
                    
                    if(isTooCloseL)data[n]=position(data[n],decrement(p.theta , delta))
                    if(isTooCloseR)data[n]=position(data[n],increment(p.theta , delta))
                    f()
                })
                
            }
            
            const sim = (click,data,f=()=>{})=>{
                
                let alpha = 100
                
                while (alpha > 0) {
                    alpha = alpha - 1
                    click(f,data)
                }
                   
                
            }
            
            sim(click,points)
            
            return points
            
        }
        poset.polarRepulsion = polarRepulsion


        function climber(f=()=>null,args=[],reverse=false,startingPoint=0){
            
            poset.layers.forEach((layer,n)=>f(layer,0,n,...args))
                
            return this
        }
        poset.climber = climber



       
        function coloringLogic(delta=10,seed=12){

        //TODO : consider adjusting theta and alpha for readability and manipulability
        const adjustTheta = (theta) => {
          const normalized = ((theta % 360) + 360) % 360
          return +normalized.toFixed(5)
        }
        // const adjustTheta = (theta)=> theta < 0 ? 360 - (+theta) : theta >360? (+theta)-360 : +theta
        // const adjustTheta = (theta)=> theta 
        //const adjustAlpha = (alpha)=> +alpha.toFixed(5)
        const adjustAlpha = (alpha)=> +alpha.toFixed(5)
        
        poset.analyze("po-mcl",()=>po.getBiggestBound(poset))
        
        const supremaProfiles = poset.layers[0].map(node => poset.elements.indexOf(node)) 
            .map((ri, n) => [
                poset.elements[ri],
                poset.elements.map(e=>
                poset.getUpset(e).includes(poset.elements[ri])
                || poset.getDownset(e).includes(poset.elements[ri])
                ||  e === poset.elements[ri]
                ?1:0)
            ])
        const subspaces = po.findSubspaces(supremaProfiles)
       
        const mcls = subspaces.subspaces.length > 1 ? 
            po.separateSubspaces (subspaces,poset).map(ssp=>{
                console.log("entered")
            const {matrix,nodes} = po.domFromEdges(ssp)
            const subPoset = po.createPoset(matrix,nodes)
            const mcl = po.getBiggestBound(subPoset)
            return mcl
        }).filter((e,n,l)=>l.indexOf(e) === n)
        : [poset.analytics["po-mcl"]]
        
        
        
        
        const mcl = poset.analytics["po-mcl"]
       
        const rootIndexes = mcls.flatMap((mcl,n)=>poset.layers[mcl].map(node => poset.elements.indexOf(node)) )
        
        const roots = rootIndexes.map((ri, n) => [
            poset.elements[ri],
            poset.elements.map(e=>
            poset.getUpset(e).includes(poset.elements[ri])
            || poset.getDownset(e).includes(poset.elements[ri])
            ?1:0)
        ])


        
        
        
        // Topological sorting
        roots
            .sort((a,b)=>b[1].reduce((acc,el)=>acc+el)-a[1].reduce((acc,el)=>acc+el))
            .sort((a,b)=>(a[1].join("")<b[1].join("")?-1:1))
            
        
        
        // Estrai separatamente i vettori e gli ID nello stesso ordine
        const vectors = roots.map(r => r[1])  // I profili
        const ids = roots.map(r => r[0])      // Gli ID dei nodi
        // Usa vectors e ids invece di roots.map
        const categories = po.circularEmbedding(vectors, ids, Math.ceil(ids.length * (ids.length/2)), 1000, 0.1, seed)
        
        const rootsCategorized = categories.neurons.filter(neuron=>neuron.bmus.length>0)
            .map(neuron=>(neuron.ref
                .map(ref=>{
                    
                    const angle=(categories.toHue(neuron.position ) + seed ) % 360;
                    const theta=angle*Math.PI/180;
                    return {
                        
                        "id":ref,
                        "theta":angle,
                        "x":Math.cos(theta),
                        "y":Math.sin(theta),
                    }
                })
            ))
            .flat()
        
            
        po.polarRepulsion(rootsCategorized,delta,1).forEach(pNode=>(
            poset.features[pNode.id]["pX"] = pNode.x,
            poset.features[pNode.id]["pY"] = pNode.y,
            poset.features[pNode.id]["pTheta"] =adjustTheta(pNode.theta), 
            poset.features[pNode.id]["pAlpha"] =adjustAlpha(Math.sqrt( Math.pow(pNode.x,2)+Math.pow(pNode.y,2) ) ) 
        )) 

        poset
        .propagate(mcl, (l,n,up)=>{

            
            const startingPositions = poset
                .getBound(l,up)
                .map((bound,n)=>{
                    const node = l[n]
                    //if(bound.length>0){
                        const previous = bound.length>0 ? poset.getBound(node,up) : poset.getBound(node,!up)
                        // console.log(bound.length>0,node,previous)
                        const prevPositions = previous.map(node=>(
                            {
                                id:node,
                                x:poset.features[node].pX||0,
                                y:poset.features[node].pY||0,
                                theta:poset.features[node].pTheta,
                            }
                        ))
                    
                    // const boundPositions = bound
                    

                     
                    

                    
                        const x = (prevPositions.map(e=>e.x).reduce((a,e)=>a+e)/prevPositions.length)
                        const y = (prevPositions.map(e=>e.y).reduce((a,e)=>a+e)/prevPositions.length)
                        
                        const alpha = prevPositions
                            .map(a=>poset.features[a.id].pAlpha)
                            .reduce((a,b)=>a+b)
                            /prevPositions.length
                        const theta = Math.atan2(y,x) * (180 / Math.PI)
                        const id = node
                        return { id,x,y,theta,alpha }
                    
                // }else{
                //         console.log(poset.getBound(node,!up))
                //         return { id:node,x:0,y:0,theta:0,alpha:0 }

                //     }

                    })
                po.polarRepulsion(startingPositions,delta,startingPositions[0].alpha).forEach((pNode,n)=>{
                    
                    poset.features[pNode.id]["pX"] = pNode.x;
                    poset.features[pNode.id]["pY"] = pNode.y;
                    poset.features[pNode.id]["pTheta"] = adjustTheta (pNode.theta);
                    poset.features[pNode.id]["pAlpha"] = adjustAlpha (Math.sqrt( Math.pow(pNode.x,2)+Math.pow(pNode.y,2) )); 
                    
                }) 

            
        })


    }

    
    poset.coloringLogic = coloringLogic

    function color(delta=10,lThreshold=40,hThreshold=80,flip=false,seed=100){
            
            poset.newFill = (pTheta,pAlpha,l)=> `hsl(${pTheta},${pAlpha*100}%,${l}%)` 
            poset.toOklab = (fill)=> `oklab(from ${fill} l a b)` 
            
            
            
            poset.updateFill = (node)=> {
                const {pTheta,pAlpha,pL} = poset.features[node]
                poset.featureOf(node,"fill", poset.newFill(pTheta,pAlpha,pL))
            }

            poset.setDepth()
            
            const {coloringLogic} = poset
            
            coloringLogic(delta,seed)

            poset.feature("fill",(node)=>{
                const d = poset.features[node]
                
                //let l = flip ? hThreshold-(lThreshold+(d.depth/poset.layers.length)*(hThreshold-lThreshold)) :(lThreshold+(d.depth/poset.layers.length)*(hThreshold-lThreshold))
                const degree = ((hThreshold - lThreshold)/poset.layers.length)
                const remainder = (d.depth*(degree/(poset.layers.length-1)))
                let l = flip ? 100 - (lThreshold + (d.depth)*degree + remainder)
                : lThreshold + (d.depth)*degree + remainder
                poset.features[node]["pL"] = l
                //TODO
                //*l is used before declaration
                
                
                //TODO
                
                //const fill = d3?.s?null:`hsl(${d.pTheta},${d.pAlpha*100}%,${l}%)` 
                const fill = poset.newFill(d.pTheta,d.pAlpha,l)
                //`hsl(${d.pTheta},${d.pAlpha*100}%,${l}%)` 
                return fill
            })
            return this
        } 
       


        
        
        poset.color = color

        return poset;
    }
    
}
export default po;
