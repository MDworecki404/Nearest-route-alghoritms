const network = require('../data/osm_wroclaw_roads.json');
const fs = require('fs');

const buildGraph = (network, mode) => {
    console.log(mode);
    let nodes = new Set();
    let edges = new Map();
    
    let allowedClasses;
    if (mode === "bikeFoot") {
        allowedClasses = [
            "footway",      
            "pedestrian",   
            "path",         
            "cycleway",     
            "steps",        
            "service",      
            "living_street",
            "track",        
            "bridleway"     
        ]
    } else if (mode === "car") {
        allowedClasses = [
            "motorway",        
            "motorway_link",   
            "trunk",           
            "primary",
            "primary_link",
            "secondary",
            "secondary_link",
            "tertiary",
            "tertiary_link",
            "residential",     
            "service",         
            "living_street",   
            "unclassified"     
        ]
    }

    network.features.forEach(feature => {
        if (!allowedClasses.includes(feature.properties.fclass)) {
            return;
        }

        if (feature.geometry.type === "MultiLineString") {
            feature.geometry.coordinates.forEach(line => {
                for (let i = 0; i < line.length; i++) {
                    const point = line[i];
                    const key = JSON.stringify(point);
                    
                    nodes.add(key);

                    if (i > 0) {
                        const prevPoint = line[i - 1];
                        addEdge(edges, prevPoint, point, feature.properties.oneway);
                    }
                }
            });
        }
    });

    console.log('Nodes amount:', nodes.size);
    console.log('Edges amount', edges.size);
    
    return { nodes: Array.from(nodes).map(JSON.parse), edges };
};

const addEdge = (edges, from, to, oneway) => {
    const fromKey = JSON.stringify(from);
    const toKey = JSON.stringify(to);

    if (!edges.has(fromKey)) edges.set(fromKey, []);
    edges.get(fromKey).push(to);

    if (oneway !== "F") {
        if (!edges.has(toKey)) edges.set(toKey, []);
        edges.get(toKey).push(from);
    }
};

const bikeFootGraph = buildGraph(network, 'bikeFoot');
const carGraph = buildGraph(network, 'car');

function mapToObject(map) {
    const obj = Object.create(null);
    for (const [k, v] of map) {
        obj[k] = v;
    }
    return obj;
}

bikeFootGraph.edges = mapToObject(bikeFootGraph.edges);
carGraph.edges = mapToObject(carGraph.edges);

fs.writeFileSync('./output/graphs/bikeFootGraph.json', JSON.stringify(bikeFootGraph, null, 2));
fs.writeFileSync('./output/graphs/carGraph.json', JSON.stringify(carGraph, null, 2));

console.log('Saved files bikeFootGraph.json and carGraph.json');