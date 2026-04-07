//TODO closure (poset operations in general) 
    //* close edges down with phi (and pass it as infima)
    //* close edges up with higher node (and pass it as suprema)

//TODO check if PO
import * as d3 from "d3";

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
            //matrix[sourceIdx][targetIdx] = 1;
            matrix[targetIdx][sourceIdx] = 1;
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
        //     console.log(nodeDict)
        

        //matrix.sort((a,b)=>a.filter(v=>v!==0).length-b.filter(v=>v!==0).length)
        
        return {matrix,nodes};
    },
    scale : (domain,range)=>{
        const extentDomain = domain[1]-domain[0]
        const extentRange = range[1]-range[0]
        const ratio = extentRange/extentDomain

        
        return (value)=> value * ratio
    },

    // rootsFromLayer : (poset,n,w) => {
    //     const roots = poset.layers[n]
    //     w = !w ? w : w === true ? [0,1] : w
    //     if(!Array.isArray(w)){

    //         const vectors = roots.map(root=>{
    //             const us = poset.getUpset(root) 
    //             const ds = poset.getDownset(root)
                
    //             const context = us.concat(ds).concat(Array.from({'length':poset.elements.length})).map(e=>poset.elements.indexOf(e)) //! isn't there one less???
                
    //             return Array.from({length: poset.dominanceMatrix.length}, (_,i)=>context.includes(i)?1:0)
    //         }) 
    //         return {
    //             vectors: vectors,
    //             ids: roots  // Mantieni l'associazione corretta
    //         };
    //     }else{
            
            

    //         const getNext = (direction,count,list) => {
                
    //             const weightScale =  po.scale([n,0],[w[1],w[0]])//direction > 0 ? [0,poset.layers.length - (n+1)] : [poset.layers.length -(poset.layers.length - (n+1)),0])
                
                
    //             const layer = poset.layers[n+(direction*count)]
    //             if(layer){
                     
    //                 //const weightedLayer = layer.map(node=>poset.getCovMatrix()[poset.elements.indexOf(node)].map(covRel=>covRel * weightScale(count)))
    //                 for(node of layer){
                        
    //                     list[poset.elements.indexOf(node)] =  weightScale(count)
    //                 }
    //                 //list.push(weightedLayer)
    //                 getNext(direction,count+1,list)
    //             }
                
    //             return list
    //         }
    //         const upVals = getNext(-1,0,Array.from({length:poset.elements.length},()=>0))
    //         const downVals = getNext(1,0,Array.from({length:poset.elements.length},()=>0)) //?? []
    //         const values = upVals.map((e,n)=>e+downVals[n])
            
            
            
    //         const vectors = roots.map(root=>{
    //             const us = poset.getUpset(root) 
    //             const ds = poset.getDownset(root)
                
    //             const context = us.concat(ds).map(e=>poset.elements.indexOf(e)) 
                
    //             return Array.from({length: poset.elements.length}, (_,i)=>context.includes(i)?values[i]:0)
    //         }) 
    //         //const us = getNext(-1,0,Array.from({length:poset.elements.length},()=>0))// ?? []
    //         //const ds = getNext(1,0,Array.from({length:poset.elements.length},()=>0)) //?? []
    //         //console.log(us,ds)
    //         //const context = ds.map((e,n)=>e+us[n])
    //             //.concat(Array.from({length: poset.layers[0]}, ()=>0))
    //             //.concat(ds)//.map(e=>poset.elements.indexOf(e))
            
    //             //console.log("ctx",context)
    //         return vectors//.map(vectorSet=>vectorSet[n])
    //     }

    // },
    
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
            
            
            
                    
                    //if(isTooCloseL || isTooCloseR) console.log("collision")
                    
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
    // visualizeEmbedding : function (cSOM,){

    //     function toRad(deg) {
    //         return deg * (Math.PI / 180);
    //     }
    //     function toDeg(rad) {
    //         return rad * (180 / Math.PI);
    //     }
    //     function jchToRgb(jch,d3) {
    //         const { J, C, h } = jch; // Expected: J, C, h are extracted from the input object. Example: { J: 50, C: 30, h: 45 }

    //         // Convert hue from degrees to radians
    //         let hueRad = (Math.PI / 180) * h; // Expected: Converts hue (e.g., 45°) to radians (e.g., 0.7854)

    //         // Convert JCh to Lab
    //         let L = J; // Expected: L is the same as J (lightness). Example: L = 50
    //         let a = C * Math.cos(hueRad); // Expected: a = C * cos(hueRad). Example: a = 30 * cos(0.7854) ≈ 21.213
    //         let b = C * Math.sin(hueRad); // Expected: b = C * sin(hueRad). Example: b = 30 * sin(0.7854) ≈ 21.213



    //         // Convert Lab to XYZ (using D65 reference white)
    //         const refX = 95.047; // Expected: D65 reference white X value
    //         const refY = 100.000; // Expected: D65 reference white Y value
    //         const refZ = 108.883; // Expected: D65 reference white Z value

    //         let var_Y = (L + 16) / 116; // Expected: Intermediate Y value. Example: var_Y = (50 + 16) / 116 ≈ 0.569
    //         let var_X = a / 500 + var_Y; // Expected: Intermediate X value. Example: var_X = 21.213 / 500 + 0.569 ≈ 0.611
    //         let var_Z = var_Y - b / 200; // Expected: Intermediate Z value. Example: var_Z = 0.569 - 21.213 / 200 ≈ 0.463

    //         let X = refX * (Math.pow(var_X, 3) > 0.008856 ? Math.pow(var_X, 3) : (var_X - 16 / 116) / 7.787); // Expected: X value in XYZ space. Example: X ≈ 95.047 * (0.611^3) ≈ 95.047 * 0.228 ≈ 21.68
    //         let Y = refY * (Math.pow(var_Y, 3) > 0.008856 ? Math.pow(var_Y, 3) : (var_Y - 16 / 116) / 7.787); // Expected: Y value in XYZ space. Example: Y ≈ 100.000 * (0.569^3) ≈ 100.000 * 0.183 ≈ 18.30
    //         let Z = refZ * (Math.pow(var_Z, 3) > 0.008856 ? Math.pow(var_Z, 3) : (var_Z - 16 / 116) / 7.787); // Expected: Z value in XYZ space. Example: Z ≈ 108.883 * (0.463^3) ≈ 108.883 * 0.099 ≈ 10.78



    //         // Normalize XYZ values relative to D65 reference white
    //         X = X / refX; // Expected: Normalized X value. Example: X ≈ 21.68 / 95.047 ≈ 0.228
    //         Y = Y / refY; // Expected: Normalized Y value. Example: Y ≈ 18.30 / 100.000 ≈ 0.183
    //         Z = Z / refZ; // Expected: Normalized Z value. Example: Z ≈ 10.78 / 108.883 ≈ 0.099



    //         // Convert XYZ to linear RGB
    //         let R = X *  3.2406 + Y * -1.5372 + Z * -0.4986; // Expected: Linear R value. Example: R ≈ 0.228 * 3.2406 + 0.183 * -1.5372 + 0.099 * -0.4986 ≈ 0.739 - 0.281 - 0.049 ≈ 0.409
    //         let G = X * -0.9689 + Y *  1.8758 + Z *  0.0415; // Expected: Linear G value. Example: G ≈ 0.228 * -0.9689 + 0.183 * 1.8758 + 0.099 * 0.0415 ≈ -0.221 + 0.343 + 0.004 ≈ 0.126
    //         let B = X *  0.0557 + Y * -0.2040 + Z *  1.0570; // Expected: Linear B value. Example: B ≈ 0.228 * 0.0557 + 0.183 * -0.2040 + 0.099 * 1.0570 ≈ 0.013 - 0.037 + 0.105 ≈ 0.081



    //         // Apply gamma correction
    //         let gammaCorrect = (c) => c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055; // Expected: Gamma correction function

    //         R = gammaCorrect(R); // Expected: Gamma-corrected R value. Example: R ≈ gammaCorrect(0.409) ≈ 0.662
    //         G = gammaCorrect(G); // Expected: Gamma-corrected G value. Example: G ≈ gammaCorrect(0.126) ≈ 0.414
    //         B = gammaCorrect(B); // Expected: Gamma-corrected B value. Example: B ≈ gammaCorrect(0.081) ≈ 0.332



    //         // Clamp values to [0, 1] range (only if necessary)
    //         R = Math.max(0, Math.min(1, R)); // Expected: Clamps R to [0, 1]. Example: R ≈ 0.662 (unchanged)
    //         G = Math.max(0, Math.min(1, G)); // Expected: Clamps G to [0, 1]. Example: G ≈ 0.414 (unchanged)
    //         B = Math.max(0, Math.min(1, B)); // Expected: Clamps B to [0, 1]. Example: B ≈ 0.332 (unchanged)

    //         // Convert to 0-255 range
    //         const out = `rgb(${Math.round(R * 255)}, ${Math.round(G * 255)}, ${Math.round(B * 255)})`; // Expected: Converts to 8-bit RGB. Example: rgb(169, 106, 85)

    //         return out;
    //     }
        

    //     const radius = 20;

    //     const assignments = cSOM.neurons
    //         .filter(n=>n.bmus.length>0)
    //         .map(n=>{
    //             if(n.bmus.length === 1) return {name:n.ref[0],embedding:cSOM.toHue(n.position),data:n}
                
    //             return n.bmus.map((_,i) => ({name:n.ref[i],embedding:cSOM.toHue(n.position),data:n}) )

    //         })
    //         .flat()
    //     const neurons = cSOM.neurons.filter(n=>n.bmus.length>0).map(n=>(n.theta = cSOM.toHue(n.position),n))
    //     // console.log(neurons.map(n=>n.theta))
    //     // console.log(cSOM,po.polarRepulsion(
    //     //     neurons,
    //     //     10
    //     // ).map(n=>n.theta))
        
        
        
    //     //takes [0–>100] outputs Θ radians
    //     const angularScale = d3.scaleLinear()
    //         .domain([0, 100])  // Same domain, for simplicity
    //         .range([0, 2 * Math.PI]);  // 360 degrees in radians
            
    //     const resolution = 150,
    //           ref = d3.range(0,100,100/resolution);
        
    //     const svg = d3.select("body")
    //         .append("svg")
    //         .attr("width",800)
    //         .attr("height",800)
    //         .attr("viewBox","0 0 100 100")
            
    //     const canvas = svg.append("g")
    //         .attr("transform","translate(50,70) scale(2)")
        
        
            
    //     const layer = canvas.append("g").classed("layer",true)
    //         .attr(
    //             "transform",
    //             `
    //             rotate(0 0 20) 
    //             translate(0 ${-2}) 
    //             skewX(0) 
    //             scale(1 0.5)
    //             `
    //         )
    //     layer.selectAll(".ref")
    //         .data(ref)
    //         .join("rect")
    //         .classed("ref",true)
    //         .attr("x", (d,i) => radius * Math.cos(angularScale(d)) -0.5)
    //         .attr("y", (d,i) => radius * Math.sin(angularScale(d)) -0.5)
    //         .attr("width", 1)
    //         .attr("height", 1)
    //         .attr("fill",d=>jchToRgb(d3.jch(70, 100, angularScale(d) * 180/Math.PI )))
    //         //.attr("fill",d=>(jchToRgb(d3.jch(70, 100, angularScale(d) * 180/Math.PI ))))
        
            
    //     //TODO something wrong here – the scale should be fed radians, or am I missing something?
    //     const assignment = canvas.select(".layer").selectAll(".assignment")
    //     .data(assignments)
    //     .join("g")
    //     .classed("assignment",true)
    //     .attr("transform",d=>(
    //     `translate(
    //         ${radius * Math.cos(toRad(d.embedding))},
    //         ${radius * Math.sin(toRad(d.embedding))}
    //     )`)).on("click",(_,d)=>console.log(d))
    //     assignment.append("circle")
    //     .attr("r",2)
    //     .attr("fill",d=>(jchToRgb(d3.jch(70, 100, d.embedding))))
        
    //     .attr("opacity","0.7")
    //     assignment.append("text")
    //     .classed("label",true)
    //     .text(d=>d.name)

    //     // assignment.selectAll(".feature")
    //     //     .data(d=>data[d.name])
    //     //     .join("rect")
    //     //     .classed("feature",true)
    //     //     .attr("width",0.2)
    //     //     .attr("height",d=>d*2)
    //     //     .attr("x",(d,i)=>i*0.2-0.5)
    //     //     .attr("y",(d,i)=>1-d*2-0.5)
    //     //     .attr("fill","darkgray")

        
    //     const neuron = layer
    //         .selectAll(".neuron")
    //         .data(cSOM.neurons)
    //         .join("g")
    //         .attr("transform",d=>`translate(
    //         ${radius * Math.cos(toRad(cSOM.toHue(d.position))) -0.5},
    //         ${radius * Math.sin(toRad(cSOM.toHue(d.position))) -0.5})`)
            
        
    //     neuron.selectAll(".weight").data(d=>d.weights)
    //         .join("rect")
    //         .classed("weight",true)
    //         .attr("width",0.2)
    //         .attr("height",d=>d*2)
    //         .attr("x",(d,i)=>i*0.2)
    //         .attr("y",(d,i)=>1-d*2)
    //         .attr("fill","none")
    //         .attr("stroke","black")
    //         .attr("stroke-width",0.05)
        

        
        
        
        
        
        

        
            
            

    //    },
       
    // circularEmbedding: function (profiles,ids = Array.from({length:profiles.length},(_,n)=>n), cells = 12, iterations = 100, learningRate = 0.1, seed=42) {
              
    //             console.log("PIDS",profiles,JSON.parse(JSON.stringify(profiles))) 
    //             //profiles = JSON.parse(JSON.stringify(profiles))
    //              //ids = ['n10', 'n12', 'n14', 'n11', 'n15', 'n13', 'n16']
    //             //  profiles = 
    //             //  [
    //             //      [1,1,1,0,1,0,0,0,0,0,0,0,0,0,0,0],
    //             //      [1,1,0,1,0,1,0,0,0,0,0,0,0,0,0,0],
    //             //      [1,1,0,1,0,1,0,0,0,0,0,0,0,0,0,0],
    //             //      [1,1,0,1,0,0,1,0,0,0,0,0,0,0,0,0],
    //             //      [1,1,0,1,0,0,1,0,0,0,0,0,0,0,0,0],
    //             //      [1,1,0,1,0,0,0,1,0,0,0,0,0,0,0,0],
    //             //      [1,1,0,1,0,0,0,0,1,0,0,0,0,0,0,0]
    //             //  ]
    //             //! profiles is reallocated
                
    //             const dotProd = (a, b) => a.map((x, i) => x * b[i]).reduce((acc, el) => acc + el);

    //             const findAllSubspaces = (profiles) => {
    //                 const checked = new Set();
    //                 const subspaces = [];

    //                 // DFS recursive search: collect all connected vectors (by dot > 0)
    //                 function dfs(idx, currSpace) {
    //                     checked.add(idx);
    //                     currSpace.push(profiles[idx]);
    //                     for (let n = 0; n < profiles.length; ++n) {
    //                         if (!checked.has(n) && dotProd(profiles[idx], profiles[n]) > 0) {
    //                             dfs(n, currSpace);
    //                         }
    //                     }
    //                 }

    //                 for (let i = 0; i < profiles.length; ++i) {
    //                     if (!checked.has(i)) {
    //                         const subspace = [];
    //                         dfs(i, subspace);
    //                         subspaces.push(subspace);
    //                     }
    //                 }

    //                 return subspaces;
    //             };
    //             const subspaces = findAllSubspaces(profiles)
                
                
                
                

    //             function createSeededRandom(seed) {
    //                 // LCG constants (commonly used values from Numerical Recipes)
    //                 // 'a' (multiplier): Large prime number
    //                 // 'c' (increment): Another prime number
    //                 // 'm' (modulus): A large power of 2 (or a large prime)
    //                 // These values are chosen to maximize the period and statistical quality of the sequence.
    //                 const a = 1103515245;
    //                 const c = 12345;
    //                 const m = Math.pow(2, 31); // Using 2^31 as modulus for a typical 32-bit PRNG
        
    //                 // Ensure the initial seed is an integer and within the valid range [0, m-1]
    //                 // Using bitwise OR 0 to convert to a 32-bit integer and ensure positivity
    //                 let currentSeed = (Math.abs(Math.floor(seed)) || 1) % m;
        
    //                 // Return a function that generates the next number in the sequence
    //                 return function() {
    //                     // Apply the LCG formula
    //                     currentSeed = (a * currentSeed + c) % m;
    //                     // Normalize the result to be between 0 (inclusive) and 1 (exclusive)
    //                     return currentSeed / m;
    //                 };
    //             }
    //             const random = createSeededRandom(seed)
    //             //get extent
                
    //             const transposed =  Array.from({length: profiles[0].length}).fill(0).map( (_,tCol) => profiles.map(row=>row[tCol]))
    //             const extent = (l) => [Math.min(...l),Math.max(...l)] 
                
    //             const extentProfiles = transposed.map(l=>extent(l))
                
                
    //             const minSpectrum = 6//180 is rather slow
    //             const maxSpectrum = 30//180 is rather slow
    //             console.log("CELLS",cells)
    //             cells = cells > maxSpectrum ? maxSpectrum : cells < minSpectrum ? minSpectrum : cells
                
    //             const epsilon = 1e-3; // Perturbation magnitude
    //             const threshold = 1e-4; // Euclidean distance threshold for detecting duplicates

    //             // Function to compute the Euclidean distance between two weight vectors
    //             const euclideanDistance = (a, b) =>
    //                 Math.sqrt(a.reduce((sum, val, idx) => sum + (val - b[idx]) ** 2, 0));

    //             // Function to apply a small perturbation to the weights
    //             function perturbVector(weights) {
    //                 return weights.map(w => w + epsilon * (random() - 0.5));
    //             }

    //             // Function to remove duplicates
    //             function removeDuplicates(neurons) {
    //                 const seen = [];

    //                 neurons.forEach(neuron => {
    //                     let isDuplicate = false;
    //                     for (let i = 0; i < seen.length; i++) {
    //                         if (euclideanDistance(neuron.weights, seen[i].weights) < threshold) {
    //                             // Perturb weights if too close to another neuron
    //                             neuron.weights = perturbVector(neuron.weights);
    //                             isDuplicate = true;
    //                             break;
    //                         }
    //                     }
    //                     if (!isDuplicate) {
    //                         seen.push(neuron); // Add to seen list if no duplicate was found
    //                     }
    //                 });
    //             }

    //             // Initialize neurons
    //             //TODO
    //             //* add subspace weighted partitioning 
    //             //* Multiply the weights (e.g. by10) and/or add 1 so that small numbers are less likely to average to 0-like values

    //             const CPRatio = cells / profiles.length 
    //             const ratioPerSubspace = subspaces.map(ssp=>ssp.length*CPRatio)
                
                
    //             const subspaceExtent = (subspace) => {
    //                 const transposed =  Array.from({length: subspace[0].length}).fill(0).map( (_,tCol) => subspace.map(row=>row[tCol]))
    //                 const extent = (l) => [Math.min(...l),Math.max(...l)] 
                
    //                 const extentProfiles = transposed.map(l=>extent(l))
    //                 return extentProfiles
    //             }

    //             const ExtentSSPs = subspaces.map(ssp=>subspaceExtent(ssp))
                
    //             let ssCount=0, 
    //                 sspThreshold = ratioPerSubspace[0] 
    //             const neurons = Array.from({ length: cells }, (_, N) => ({
    //                 position: N,
    //                 // weights: [...Array(profiles[0].length).fill(0)].map((_, n) => 
    //                 //     extentProfiles[n][0] + random() * (extentProfiles[n][1] - extentProfiles[n][0])
    //                 // ),
    //                 weights: [...Array(profiles[0].length).fill(0)].map((_, n) => {
    //                     if(N > sspThreshold ){
    //                         ssCount = ssCount + 1;
    //                         sspThreshold = sspThreshold + ratioPerSubspace[ssCount]
    //                     }
    //                     return ExtentSSPs[ssCount][n][0] + random() * (ExtentSSPs[ssCount][n][1] - ExtentSSPs[ssCount][n][0])
    //                 }),
                    
    //                 bmus: [],
    //                 bmusID: [],
    //                 ref: []
    //             }));
                
    //             // Remove duplicates
    //             removeDuplicates(neurons);

                
    //             // Helper function to calculate Euclidean distance
                

    //             // Helper function to update weights
    //             const updateWeights = (neuron, profile, rate) => {
    //                 for (let i = 0; i < neuron.weights.length; i++) {
    //                     neuron.weights[i] += rate * (profile[i] - neuron.weights[i]);
    //                 }
    //             };

    //             // Training process
    //             for (let t = 0; t < iterations; t++) {
    //                 const rate = learningRate * (1 - t / iterations); // Decaying learning rate

    //                 profiles.forEach(profile => {
    //                     // Step 1: Find the Best Matching Unit (BMU)
    //                     let bmuIndex = 0;
    //                     let minDist = Infinity;
    //                     neurons.forEach((neuron, index) => {
    //                         const dist = euclideanDistance(neuron.weights, profile);
    //                         if (dist < minDist) {
    //                             minDist = dist;
    //                             bmuIndex = index;
    //                         }
    //                     });

    //                     // Step 2: Update weights of the BMU and its neighbors
    //                     for (let i = 0; i < cells; i++) {
    //                         // Calculate neighborhood influence
    //                         const distance = Math.min(
    //                             Math.abs(bmuIndex - i),
    //                             cells - Math.abs(bmuIndex - i) // Wrap around for cylindrical grid
    //                         );
    //                         const influence = Math.exp(-distance / (2 * (1 - t / iterations)));

    //                         // Update weights
    //                         updateWeights(neurons[i], profile, rate * influence);
    //                     }
    //                 });
    //             }

    //             // Assign profiles to neurons as BMUs
    //             // profiles.forEach((profile,n) => {
    //             //     let bmuIndex = 0;
    //             //     let minDist = Infinity;

    //             //     neurons.forEach((neuron, index) => {
    //             //         const dist = euclideanDistance(neuron.weights, profile);
    //             //         if (dist < minDist) {
    //             //             minDist = dist;
    //             //             bmuIndex = index;
    //             //         }
    //             //     });

    //             //     // Ensure no two neurons share the same BMU
    //             //     neurons[bmuIndex].bmus.push(profile);
    //             //     neurons[bmuIndex].bmusID.push(n);
    //             //     neurons[bmuIndex].ref.push(ids[n]);
                    
    //             // });
    //             profiles.forEach((profile, n) => {
    //                 console.log(ids[n])
    //                 let bmuIndex = 0;
    //                 let minDist = Infinity;

    //                 neurons.forEach((neuron, index) => {
    //                     const dist = euclideanDistance(neuron.weights, profile);
    //                     if (dist < minDist) {
    //                         minDist = dist;
    //                         bmuIndex = index;
    //                     }
    //                 });
                
    //                 neurons[bmuIndex].bmus.push(profile);
    //                 neurons[bmuIndex].bmusID.push(ids[n]);  // ← Usa ids[n] invece di n
    //                 neurons[bmuIndex].ref.push(ids[n]);     // ← Questo è ridondante ora
    //             });

    //             // Return SOM object
    //             return { 
    //                 neurons , 
    //                 getNeuron : function(id){ return this.neurons.find(neuron=>neuron.bmusID.includes(id)).position} ,
    //                 toHue : d3.scaleLinear([0,cells],[0,360])
    //             };
    //     },
    circularEmbedding: function (profiles,ids = Array.from({length:profiles.length},(_,n)=>n), cells = 12, iterations = 100, learningRate = 0.1, seed=42) {
              
                
                
                
                // console.log(ids.map((id,n)=>`${id} => ${profiles[n]}`))
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
                    // console.log("INTERPOLATING",a,b)
                 return{
                    position : (a.position+b.position)/2,
                    weights: a.weights.map((w,n)=>(w+b.weights[n])/2),
                    bmus : [],
                    bmusID : [],
                    ref : [],
                    
                 } 
                    
                    
                    
                    
                    


                }

                // Training process
                // for (let t = 0; t < iterations; t++) {
                //     const rate = learningRate * (1 - t / iterations); // Decaying learning rate

                //     profiles.forEach(profile => {
                //         // Step 1: Find the Best Matching Unit (BMU)
                //         let bmuIndex = 0;
                //         let minDist = Infinity;
                //         neurons.forEach((neuron, index) => {
                //             const dist = euclideanDistance(neuron.weights, profile);
                //             if (dist < minDist) {
                //                 minDist = dist;
                //                 bmuIndex = index;
                //             }
                //         });

                //         // Step 2: Update weights of the BMU and its neighbors
                //         for (let i = 0; i < cells; i++) {
                //             // Calculate neighborhood influence
                //             const distance = Math.min(
                //                 Math.abs(bmuIndex - i),
                //                 cells - Math.abs(bmuIndex - i) // Wrap around for cylindrical grid
                //             );
                //             const influence = Math.exp(-distance / (2 * (1 - t / iterations)));

                //             // Update weights
                //             updateWeights(neurons[i], profile, rate * influence);
                //         }
                //     });
                // }
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
                            const influence = Math.exp(-distance / (2 * (1 - t / iterations)));
                            
                            // Update weights
                            updateWeights(neurons[i], profile, rate * influence);
                        }
                    });
                }

                // console.log(neurons)
                
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
                    
                    // console.log("ASSIGNED", ids[n])
                    neurons[bmuIndex].bmus.push(profile);
                    neurons[bmuIndex].bmusID.push(ids[n]);  // ← Usa ids[n] invece di n
                    neurons[bmuIndex].ref.push(ids[n]);     // ← Questo è ridondante ora
                
                    //break continuous conglomerates
                    //const [prev,next] = getAdjacetns(neurons,bmuIndex)
                    // if(next.neuron.bmus.length > 0){
                    //     const newNeuron = interpolateNeurons(neurons[bmuIndex],next.neuron)
                    //     neurons = neurons.slice(0,bmuIndex+1)
                    //     .concat(newNeuron)
                    //     .concat(neurons.slice(bmuIndex+1))
                    // }
                    // if(prev.neuron.bmus.length > 0){
                    //     const newNeuron = interpolateNeurons(prev.neuron,neurons[bmuIndex])
                    //     neurons = neurons.slice(0,bmuIndex)
                    //     .concat(newNeuron)
                    //     .concat(neurons.slice(bmuIndex))
                    // }
                });

                
                // Return SOM object
                return { 
                    neurons , 
                    getNeuron : function(id){ return this.neurons.find(neuron=>neuron.bmusID.includes(id)).position} ,
                    toHue : d3.scaleLinear([0,cells],[0,360])
                };
                

        },
    createPoset:(input, elementNames = null) => {
        let isDominanceMatrix = Array.isArray(input[0]) && typeof input[0][0] === 'number' && input[0].length === input.length;
        let elements, profiles, dominanceMatrix;

        if (isDominanceMatrix) {
            // Input is a dominance matrix
            dominanceMatrix = input;
            elements = elementNames || Array.from({length: dominanceMatrix.length}, (_, i) => `profile_${i}`);
            profiles = elements.map((_, i) => dominanceMatrix[i]);
        } else {
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
        }

        const poset = {
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
           

            getUpset: function(element,mask=false) {
                const index = this.elements.indexOf(element);
                return mask
                ? this.elements.map((_, i) => 
                    this.dominanceMatrix[index][i] === 1 ? 1 : 0
                )
                : this.elements.filter((_,i)=>this.dominanceMatrix[index][i] === 1 ? 1 : 0)
            },

            getDownset: function(element,mask=false) {
                const index = this.elements.indexOf(element);
                return mask
                ? this.elements.map((_, i) => 
                    this.dominanceMatrix[i][index] === 1 ? 1 : 0
                )
                : this.elements.filter((_,i)=>this.dominanceMatrix[i][index] === 1 ? 1 : 0)
            },

            getDomMatrix: function() {
                return this.dominanceMatrix;
            },

            // getCovMatrix: function() {
            //     if (this.covMatrix) return this.covMatrix;

            //     const n = this.dominanceMatrix.length;
            //     const coveringMatrix = this.dominanceMatrix.map(row => [...row]);

            //     // Remove transitive edges
            //     for (let i = 0; i < n; i++) {
            //         for (let j = 0; j < n; j++) {
            //             if (i !== j && coveringMatrix[i][j] === 1) {
            //                 for (let k = 0; k < n; k++) {
            //                     if (i !== k && j !== k) {
            //                         if (coveringMatrix[i][k] === 1 && coveringMatrix[k][j] === 1) {
            //                             coveringMatrix[i][j] = 0;
            //                             break;
            //                         }
            //                     }
            //                 }
            //             }
            //         }
            //     }
                
                

            //     this.covMatrix = coveringMatrix;
            //     return coveringMatrix;
            // },

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


            getCovering: function(element) {
                const row = this.elements.indexOf(element);
                return this.getCovMatrix()[row]
                    .map((e, n) => e === 1 ? n : -1)
                    .filter(e => e !== -1).map(n=>this.elements[n]);
            },

            getCovered: function(element) {
                const col = this.elements.indexOf(element);
                return this.getCovMatrix().map(row => row[col])
                    .map((e, n) => e === 1 ? n : -1)
                    .filter(e => e !== -1).map(n=>this.elements[n]);
            },



            enrich: function() {
                this.features = {};
                this.elements.forEach(e => this.features[e] = {"name": e});
                this.enrich = function(){return this}
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
            }
        };

        

        // Derive relations from dominance matrix
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
        const dominants = poset.relations.map(e => e[1]);
        poset.analytics.infima = poset.elements.filter(p => !dominants.includes(p));

        const dominated = poset.relations.map(e => e[0]);
        poset.analytics.suprema = poset.elements.filter(p => !dominated.includes(p));


        // function getCoverRelations() {
        //     if(poset.coverRelations) return poset.coverRelations

        //     const matrix = poset.getCovMatrix()
        //     const coverRelations = [];
        //     for (let i = 0; i < matrix.length; i++) {
        //         for (let j = 0; j < matrix[i].length; j++) {
        //             if (matrix[i][j] === 1) {
        //                 coverRelations.push({ source: i, target: j });
        //             }
        //         }
        //     }
        //     poset.coverRelations = coverRelations
        //     return coverRelations;
        // }
        // poset.getCoverRelations = getCoverRelations


        function drawHasse(container,poset=this) {
            container = container || document.querySelector("body")
            const dominanceMatrix = poset.getDomMatrix()
            //poset.feature
            poset.enrich()
                .feature("subScore",(node)=>poset.getUpset(node).length)
                .feature("supScore",(node)=>poset.getDownset(node).length)
                .setLayers()
                .feature("depth",d=>poset.layers.length-poset.layers.findIndex(layer=>layer.includes(d)))

                
            
            
        
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
                x: 0, // Temporary x, will be adjusted later
                y: height - (height / (Math.max(...levels) + 1) * level + 50), // Maxima at top, infima at bottom
                depth: ((Object.values(poset.features)[i].depth) * 60) || height - (height / (Math.max(...levels) + 1) * level + 50)
            }));
            
        
            const levelNodes = nodePositions.reduce((acc, pos) => {
                if (!acc[pos.y]) acc[pos.y] = [];
                acc[pos.y].push(pos);
                return acc;
            }, {});
        
            Object.keys(levelNodes).forEach(level => {
                const nodesAtLevel = levelNodes[level];
                const spacing = width / (nodesAtLevel.length + 1);
                nodesAtLevel.forEach((node, index) => {
                    node.x = spacing * (index + 1);
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
                .enter().append("line")
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
                .attr("r", 15)
                .attr("cx", d => d.x)
                .attr("cy", d => d.depth)
                //.attr("fill", d=>(Object.values(poset.features)[d.id].isLeaf?"green":"lightgray"))
                .attr("fill", d=>poset.features[poset.elements[0]]?.fill?poset.features[poset.elements[d.id]].fill:"lightgray")
                //.attr("opacity",d => scaleOpacity(d.depth))
                .call(d3.drag()
                    .on("start", function (event, d) {
                        d3.select(this).raise().attr("stroke", "black");
                    })
                    .on("drag", function (event, d) {
                        d.x = event.x;
                        d.y = event.y;
                        d3.select(this)
                            .attr("cx", d.x)
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
                .enter().append("text")
                .attr("x", d => d.x)
                .attr("y", d => d.depth)
                .text(d => poset.elements[d.id])
                .attr("dy", 5)
                .attr("text-anchor", "middle")
                .attr("font-family", "sans-serif");
        
            // Function to update edges dynamically
            function updateEdges() {
                edgeSelection
                    
                    .attr("x1", d => nodePositions[d.target].x)
                    .attr("y1", d => nodePositions[d.target].depth)
                    .attr("x2", d => nodePositions[d.source].x)
                    .attr("y2", d => nodePositions[d.source].depth);
        
                labelSelection
                    .attr("x", d => d.x)
                    .attr("y", d => d.depth);
            }
        
            // Initial edge rendering
            updateEdges();
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
                // console.log("ENTERED",substructure)
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
                    
                    const nodes = poset.elements, edges = poset.relations
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
                    }, []);
                
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
            
        }
        poset.polarRepulsion = polarRepulsion


        function climber(f=()=>null,args=[],reverse=false,startingPoint=0){
            //poset = poset || this
            poset.enrich().setLayers()
            
            if(reverse){
                
                const layer =  poset.layers[startingPoint]
                f(layer,startingPoint,startingPoint,...args)
                
                if(poset.layers.length > startingPoint+1)climber(f,args,reverse,startingPoint+1)
            }else{

                const i = poset.layers.length - 1 - startingPoint
                const layer =  poset.layers[i]
                
                f(layer,startingPoint,i,...args)
                if(poset.layers.length > startingPoint+1)climber(f,args,reverse,startingPoint+1)
                }
                
            return this
        }
        poset.climber = climber



        // function coloringLogic(layer,iNeg,i,delta,seed=12){
            
        //     if(iNeg===0){
                
        //         const rootIndexes = layer
        //             .map(node=>poset.elements.indexOf(node))
                    
        //         const rootsDimensions = poset
        //             .getCovMatrix()
        //             .map(row=>row.filter((v,i)=>rootIndexes.includes(i)))
        //         const roots = rootIndexes
        //             .map((ri,n)=>[poset.elements[ri],rootsDimensions
        //                 .map(line=>(line[n]))]
        //             )

                
                    
        //         //const categories = circularSOM(roots.map(r=>r[1]),roots.map(r=>r[0]),seed=seed)
        //         const categories = po.circularEmbedding(roots.map(r=>r[1]),roots.map(r=>r[0]),cells = 12, iterations = 100, learningRate = 0.1,seed=seed)
                
        //         const rootsCategorized =  categories.neurons.filter(neuron=>neuron.bmus.length>0)
        //             .map(neuron=>(neuron.ref
        //                 .map(ref=>{
                            
        //                     const angle=categories.toHue(neuron.position);
        //                     const theta=angle*Math.PI/180;
        //                     return {
        //                     "id":ref,
        //                     "theta":angle,
        //                     "x":Math.cos(theta),
        //                     "y":Math.sin(theta)
        //                     }})
        //             ))
        //             .flat()
        //         console.log("categories",rootsCategorized.map(r=>r.theta))
                    
        //         polarRepulsion(rootsCategorized,delta,1).forEach(pNode=>(
        //             poset.features[pNode.id]["pX"] = pNode.x,
        //             poset.features[pNode.id]["pY"] = pNode.y,
        //             poset.features[pNode.id]["pTheta"] = pNode.theta,
        //             poset.features[pNode.id]["pAlpha"] = Math.sqrt( Math.pow(pNode.x,2)+Math.pow(pNode.y,2)   ) 
        //         )) 
                
        //     }
        //     else{
                
        //         //const parents = poset.layers[i+1]
                

                
        //         const parents = poset.layers.slice(i+1).flat()
        //             .map(node=>(
        //                 {
        //                     id:node,
        //                     x:poset.features[node].pX,
        //                     y:poset.features[node].pY,
        //                     theta:poset.features[node].pTheta,
        //                 }
        //             ))
                
        //         //assign descendants to parents
        //         parents.forEach((p,n)=>parents[n].descendants=poset.getCovered(p.id))
        //         //parents.forEach((p,n)=>parents[n].descendants=poset.getCovered(p.id).map(i=>poset.elements[i]))
                
        //         const ancestorsPerPoint = {}
        //         const points = layer.map(node=>{
        //             //subset ancestor between parents 
        //             const ancestors = parents.filter(p=>p.descendants.includes(node))
        //             const id = node
        //             const x = (ancestors.map(e=>e.x).reduce((a,e)=>a+e)/ancestors.length)
        //             const y = (ancestors.map(e=>e.y).reduce((a,e)=>a+e)/ancestors.length)
                    
                    
        //             const alpha = ancestors
        //                 .map(a=>poset.features[a.id].pAlpha)
        //                 .reduce((a,b)=>a+b)
        //                 /ancestors.length
                    
        //             //TODO try backpropagation 
        //             ancestorsPerPoint[id] = ancestors.map(a=>a.id)
        //             console.log("____",ancestorsPerPoint)
        //             //*----------------*//
        //             const theta = Math.atan2(y,x) * (180 / Math.PI)
                    
        //             return { id,x,y,theta,alpha }
        //         })
                
        //         const inputPoints = JSON.parse(JSON.stringify(points))
        //         polarRepulsion(inputPoints,delta,inputPoints[0].alpha).forEach((pNode,n)=>{
                    
        //             poset.features[pNode.id]["pX"] = pNode.x;
        //             poset.features[pNode.id]["pY"] = pNode.y;
        //             poset.features[pNode.id]["pTheta"] = pNode.theta;
        //             poset.features[pNode.id]["pAlpha"] = Math.sqrt( Math.pow(pNode.x,2)+Math.pow(pNode.y,2)   ); 
        //             const bp = false
        //             if(bp){
        //             function sumAnglesDegrees(angle1, angle2) {
        //               const sum = (angle1 + angle2) % 360;
        //               return sum < 0 ? sum + 360 : sum; // Normalize to [0, 360)
        //             }
        //             //BACKPROPAGATION
        //             //!STILL VERY MESSY
        //             ancestorsPerPoint[pNode.id].forEach(a=>{
        //                     poset.features[a].pTheta = ( pNode.theta + ((poset.features[a].pTheta-pNode.theta)/100)); 
                            
        //                     //poset.features[a].pX = ( pNode.theta + ((poset.features[a].pX-pNode.x)/100)); //((poset.features[a].pNode.x)+ ((pNode.theta+poset.features[a].pNode.x)*0.1)) 
        //                     //poset.features[a].pY = ( pNode.theta + ((poset.features[a].pY-pNode.y)/100)); //((poset.features[a].pNode.x)+ ((pNode.theta+poset.features[a].pTheta)*0.1)) 

        //             })
        //                 //poset.features[pNode.id]["pTheta"] = pNode.theta + (ancestorsPerPoint[pNode.id].map(a=>poset.features[a].pTheta).reduce((acc,el)=>acc+el)/ancestorsPerPoint[pNode.id].length);
        //                 //
        //                 //poset.features[pNode.id]["pX"] = (pNode.x + (ancestorsPerPoint[pNode.id].map(a=>poset.features[a].pX).reduce((acc,el)=>acc+el)/ancestorsPerPoint[pNode.id].length)/2000);
        //                 //poset.features[pNode.id]["pY"] = (pNode.y + (ancestorsPerPoint[pNode.id].map(a=>poset.features[a].pY).reduce((acc,el)=>acc+el)/ancestorsPerPoint[pNode.id].length)/2000);
        //             }
        //             //TODO
        //             //? fixes the color but not xy Math.sqrt( Math.pow(points[n].x,2)+Math.pow(points[n].y,2)   ) 
        //     }) 
                
                
                
            
        // }
        // }
        function coloringLogic(layer,iNeg,i,delta,seed=12){
            if(iNeg===0){
                //TODO color based on layer position here
                const rootIndexes = layer.map(node => poset.elements.indexOf(node))

                //const rootsDimensions = poset
                //    .getCovMatrix()
                //    .map(row => row.filter((v, i) => rootIndexes.includes(i)))
                //const rootsDimensions = poset.elements.map()
                const roots = rootIndexes.map((ri, n) => [
                    poset.elements[ri],
                    //rootsDimensions.map(line => line[n])
                    poset.elements.map(e=>poset.getUpset(e).includes(poset.elements[ri])?1:0)
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
                
                //po.visualizeEmbedding(categories)
                const rootsCategorized = categories.neurons.filter(neuron=>neuron.bmus.length>0)
                    .map(neuron=>(neuron.ref
                        .map(ref=>{
                            // console.log(ref,neuron.weights)
                            const angle=categories.toHue(neuron.position);
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
                
                    // console.log("D",delta)
                polarRepulsion(rootsCategorized,delta,1).forEach(pNode=>(
                    poset.features[pNode.id]["pX"] = pNode.x,
                    poset.features[pNode.id]["pY"] = pNode.y,
                    poset.features[pNode.id]["pTheta"] = pNode.theta,
                    poset.features[pNode.id]["pAlpha"] = Math.sqrt( Math.pow(pNode.x,2)+Math.pow(pNode.y,2) ) 
                )) 
                
            }
            else{
                
                const parents = poset.layers.slice(i+1).flat()
                    .map(node=>(
                        {
                            id:node,
                            x:poset.features[node].pX,
                            y:poset.features[node].pY,
                            theta:poset.features[node].pTheta,
                        }
                    ))
                
                //assign descendants to parents
                parents.forEach((p,n)=>parents[n].descendants=poset.getCovered(p.id))
                
                const ancestorsPerPoint = {}
                const points = layer.map(node=>{
                    //subset ancestor between parents 
                    const ancestors = parents.filter(p=>p.descendants.includes(node))
                    const id = node
                    const x = (ancestors.map(e=>e.x).reduce((a,e)=>a+e)/ancestors.length)
                    const y = (ancestors.map(e=>e.y).reduce((a,e)=>a+e)/ancestors.length)
                    
                    
                    const alpha = ancestors
                        .map(a=>poset.features[a.id].pAlpha)
                        .reduce((a,b)=>a+b)
                        /ancestors.length
                    
                    ancestorsPerPoint[id] = ancestors.map(a=>a.id)
                    
                    
                    const theta = Math.atan2(y,x) * (180 / Math.PI)
                    
                    return { id,x,y,theta,alpha }
                })
                
                const inputPoints = JSON.parse(JSON.stringify(points))
                polarRepulsion(inputPoints,delta,inputPoints[0].alpha).forEach((pNode,n)=>{
                    
                    poset.features[pNode.id]["pX"] = pNode.x;
                    poset.features[pNode.id]["pY"] = pNode.y;
                    poset.features[pNode.id]["pTheta"] = pNode.theta;
                    poset.features[pNode.id]["pAlpha"] = Math.sqrt( Math.pow(pNode.x,2)+Math.pow(pNode.y,2) ); 
                    const bp = false
                    if(bp){
                        function sumAnglesDegrees(angle1, angle2) {
                        const sum = (angle1 + angle2) % 360;
                        return sum < 0 ? sum + 360 : sum;
                        }
                        
                        ancestorsPerPoint[pNode.id].forEach(a=>{
                            poset.features[a].pTheta = ( pNode.theta + ((poset.features[a].pTheta-pNode.theta)/100)); 
                        })
                    }
                }) 
            }
        }
        poset.coloringLogic = coloringLogic
        function color(delta=1,lThreshold=40,hThreshold=80,flip=false,seed=12){
            
            poset.setDepth()
            
            const {coloringLogic} = poset
            
            poset.climber(coloringLogic,[delta,seed])

            poset.feature("fill",(node)=>{
                const d = poset.features[node]
                
                //let l = flip ? hThreshold-(lThreshold+(d.depth/poset.layers.length)*(hThreshold-lThreshold)) :(lThreshold+(d.depth/poset.layers.length)*(hThreshold-lThreshold))
                const degree = ((hThreshold - lThreshold)/poset.layers.length)
                const remainder = (d.depth*(degree/(poset.layers.length-1)))
                let l = flip ? 100 - (lThreshold + (d.depth)*degree + remainder)
                : lThreshold + (d.depth)*degree + remainder
                
                //TODO
                //*l is used before declaration
                
                
                //TODO
                //const fill = d3?.s?null:`hsl(${d.pTheta},${d.pAlpha*100}%,${l}%)` 
                const fill = `hsl(${d.pTheta},${d.pAlpha*100}%,${l}%)` 
                return fill
            })
            return this
        } 
        poset.color = color

        return poset;
    }
    
}
export default po;
