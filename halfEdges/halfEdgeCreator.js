const network = require('../data/osm_wroclaw_roads_cliped.json');
const fs = require('fs');

let halfEdgeIdCounter = 0;

class halfEdge {
    constructor(V, oneway) {
        this.id = halfEdgeIdCounter++
        this.N = this
        this.S = null
        this.V = V
        this.oneway = oneway
    }
}

const makeEdge = (v1, v2, oneway) => {
    const he1 = new halfEdge(v1, oneway)
    const he2 = new halfEdge(v2, oneway)
    he1.S = he2
    he2.S = he1
    return he1
}

const splice = (e1, e2) => {
    const temp = e1.N
    e1.N = e2.N
    e2.N = temp
}

let halfEdges = []
let vertexToHalfEdges = new Map();

const halfEdgeCreator = () => {

    network.features.forEach(feature => {
        if (feature.geometry.type === "MultiLineString") {
            feature.geometry.coordinates.forEach(line => {
                for (let i = 1; i < line.length; i++) {
                    const point1 = line[i - 1];
                    const point2 = line[i];
                    const he = makeEdge(point1, point2, feature.properties.oneway)
                    halfEdges.push(he)
                    halfEdges.push(he.S)

                    const key1 = `${point1[0]},${point1[1]}`;
                    const key2 = `${point2[0]},${point2[1]}`;

                    if (!vertexToHalfEdges.has(key1)) {
                        vertexToHalfEdges.set(key1, []);
                    }
                    if (!vertexToHalfEdges.has(key2)) {
                        vertexToHalfEdges.set(key2, []);
                    }

                    vertexToHalfEdges.get(key1).push(he);
                    vertexToHalfEdges.get(key2).push(he.S);
                }
            });
        }
    })

    vertexToHalfEdges.forEach((edges, vertex) => {
        if (edges.length > 1) {
            for (let i = 0; i < edges.length; i++) {
                const current = edges[i];
                const next = edges[(i + 1) % edges.length];
                splice(current, next);
            }
        }
    });

}

halfEdgeCreator()

const serializeHalfEdges = (halfEdges) => {
    return halfEdges.map(he => {
        if (he.oneway === "F" && he.id < he.S.id) {
            return {
                id: he.id,
                V: he.V,
                siblingId: he.S ? he.S.id : null,
                distanceToSibling: he.S ? Math.sqrt(Math.pow(he.V[0] - he.S.V[0], 2) + Math.pow(he.V[1] - he.S.V[1], 2)) : null,
                from: he.id,
                to: he.S.id,
            };
        } else if (he.oneway === "F" && he.id > he.S.id) {
            return {
                id: he.id,
                V: he.V,
                siblingId: he.S ? he.S.id : null,
                distanceToSibling: he.S ? Math.sqrt(Math.pow(he.V[0] - he.S.V[0], 2) + Math.pow(he.V[1] - he.S.V[1], 2)) : null,
                from: he.S.id,
                to: he.id,
            };
        } else if (he.oneway === "B") {
            return {
                id: he.id,
                V: he.V,
                siblingId: he.S ? he.S.id : null,
                distanceToSibling: he.S ? Math.sqrt(Math.pow(he.V[0] - he.S.V[0], 2) + Math.pow(he.V[1] - he.S.V[1], 2)) : null,
                from: "two-directional",
                to: "two-directional",
            };
        }
    });
}

const serializedHalfEdges = serializeHalfEdges(halfEdges);

try {
    fs.writeFileSync('./output/halfEdges/halfEdges.json', JSON.stringify(serializedHalfEdges, null, 2));
    console.log('Half-edges successfully saved to file!');
    console.log(`Total half-edges: ${halfEdges.length}`);
} catch (error) {
    console.error('Error saving half-edges:', error);
}