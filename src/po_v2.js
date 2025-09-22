// ***** EDITS add import
import * as d3 from "d3";
const po = {
    domFromEdges : (edges, s = null, t = null) => {
        const source = s || Object.keys(edges[0])[0];
        const target = t || Object.keys(edges[0])[1];
    
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
        }
    
        // Step 2: Compute the transitive closure using Floyd-Warshall algorithm
        for (let k = 0; k < n; k++) {
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n; j++) {
                    matrix[i][j] = matrix[i][j] || (matrix[i][k] && matrix[k][j]);
                }
            }
        }
        // ****** EDITS
        return {matrix:matrix, nodeIndex:nodeIndex};
    },

    // ****** EDITS ADD LIST AS PARAMETER
    createPoset:(input, list, elementNames = null) => {
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
            relationsMSI: [],
            relations: [],
            relationsP: [],
            suprema: [],
            infima: [],

            getUpset: function(element) {
                const index = this.elements.indexOf(element);
                return this.elements.map((_, i) => 
                    this.dominanceMatrix[index][i] === 1 ? 1 : 0
                );
            },

            getDownset: function(element) {
                const index = this.elements.indexOf(element);
                return this.elements.map((_, i) => 
                    this.dominanceMatrix[i][index] === 1 ? 1 : 0
                );
            },

            getDomMatrix: function() {
                return this.dominanceMatrix;
            },

            getCovMatrix: function() {
                if (this.covMatrix) return this.covMatrix;

                const n = this.dominanceMatrix.length;
                const coveringMatrix = this.dominanceMatrix.map(row => [...row]);

                // Remove transitive edges
                for (let i = 0; i < n; i++) {
                    for (let j = 0; j < n; j++) {
                        if (i !== j && coveringMatrix[i][j] === 1) {
                            for (let k = 0; k < n; k++) {
                                if (i !== k && j !== k) {
                                    if (coveringMatrix[i][k] === 1 && coveringMatrix[k][j] === 1) {
                                        coveringMatrix[i][j] = 0;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }

                this.covMatrix = coveringMatrix;
                return coveringMatrix;
            },

            getCovering: function(element) {
                const row = this.elements.indexOf(element);
                return this.getCovMatrix()[row]
                    .map((e, n) => e === 1 ? n : -1)
                    .filter(e => e !== -1);
            },

            getCovered: function(element) {
                const col = this.elements.indexOf(element);
                return this.getCovMatrix().map(row => row[col])
                    .map((e, n) => e === 1 ? n : -1)
                    .filter(e => e !== -1);
            },

            enrich: function() {
                this.features = {};
                this.elements.forEach(e => this.features[e] = {"name": e});
                this.enrich = function(){return this}
                this.feature = function(key, value) {
                    if (value === undefined) {
                        return Object.keys(this.features).map(node => this.features[node][key]);
                    } else if (typeof value === 'function') {
                        Object.keys(this.features).forEach(node => 
                            this.features[node][key] = JSON.parse(JSON.stringify(value(node)))
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
        poset.infima = poset.elements.filter(p => !dominants.includes(p));

        const dominated = poset.relations.map(e => e[0]);
        poset.suprema = poset.elements.filter(p => !dominated.includes(p));




        function drawHasse(container,poset=this) {
            const dominanceMatrix = poset.getDomMatrix()
            //poset.feature
            poset.enrich()
                .feature("subScore",(node)=>poset.getUpset(node).filter(n=>n!=0).length)
                .feature("supScore",(node)=>poset.getDownset(node).filter(n=>n!=0).length)
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
            //poset.elements.map(e=>console.log(poset.features[e]["subScore"]))
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
            function matrixToEdges(matrix) {
                const edges = [];
                for (let i = 0; i < matrix.length; i++) {
                    for (let j = 0; j < matrix[i].length; j++) {
                        if (matrix[i][j] === 1) {
                            edges.push({ source: i, target: j });
                        }
                    }
                }
                return edges;
            }
        
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
            const filteredMatrix = removeTransitiveEdges(dominanceMatrix);
            const edges = matrixToEdges(filteredMatrix);
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
                .attr("fill", "lightgray")
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
                .text(d => d.id)
                .attr("dy", 5)
                .attr("text-anchor", "middle")
                .attr("font-family", "sans-serif");
        
            // Function to update edges dynamically
            function updateEdges() {
                edgeSelection
                    //.attr("data-x1", d => console.log(nodePositions[d.target].depth,poset.elements[nodePositions[d.target].id]))
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
        
        
            function circularSOM(profiles,ids = Array.from({length:profiles.length},(_,n)=>n), cells = 12, iterations = 100, learningRate = 0.1) {
                
                
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
                    return weights.map(w => w + epsilon * (Math.random() - 0.5));
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
                        extentProfiles[n][0] + Math.random() * (extentProfiles[n][1] - extentProfiles[n][0])
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


            function color(querySelector="circle"){

                const roots = poset.suprema
                const rootPositions = roots.map(r=>poset.elements.indexOf(r))
                
                //coloring logic
                const { shortestPaths, longestPaths, scores } = poset.hSep(dominanceMatrix);
                const rootsSpace = rootPositions.map(rp=>scores[rp])
                const embeddings = poset.circularSOM(rootsSpace,poset.suprema,rootsSpace.length)
                
                
                poset.feature("color",[])
                const {toHue} = embeddings
                //set up position of the roots
                
                
                embeddings.neurons.filter(neuron=>neuron.bmus.length > 0)
                .forEach(neuron=>{
                    
                    neuron
                    .ref
                    .forEach(ref=>{
                        
                        poset.features[ref]["color"].push(toHue(neuron.position))
                        })
                    })
                    
                
                function recursiveColoring(poset,layer){
                    
                        layer.forEach(node=>{
                            
                            
                            const covered = poset.getCovered(node)
                            
                            covered.forEach(cov=>{
                                
                                const spectrum = poset.features[poset.elements[cov]]["color"]
                                poset.features[node].color.forEach(hue=>spectrum.push(hue))  
                            })
                            
                        })
                        layer.forEach(node=>{

                            const covered = poset.getCovered(node)     
                                
                            recursiveColoring(poset,covered.map(id=>poset.elements[id]))
                            
                        })
                        
                    }
                    const depthExt = d3.extent(Object.values(poset.features),d=>d.depth)
                    recursiveColoring(poset,roots)


                    const scaleDepth = d3.scaleLinear(depthExt,[60,10])
                    // d3.selectAll(querySelector).attr("fill",d=>poset.colorInterpolation(
                    //     poset.features["profile_"+d.id].color,
                    //     scaleDepth(poset.features["profile_"+d.id].depth)
                    // ))
                    // .each(d=>console.log(scaleDepth(poset.features["profile_"+d.id].depth)))
                    // ****** EDITS
                    const indexArray = Object.values(list)
                    const colorArray = Array(indexArray.length).fill(0)
                    indexArray.forEach(i => colorArray[i] = (poset.colorInterpolation(
                        poset.features["profile_"+i].color,
                        scaleDepth(poset.features["profile_"+i].depth)
                    )))
                    return colorArray

            }
            poset.color = color  

            function setLayers(impute){
                //if(poset.layers?.length >0)return this
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
                                if(poset.infima.includes(node)){
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
                return this
            }
            poset.setLayers = setLayers
        return poset;
    }
}
// ***** EDITS
export default po;
