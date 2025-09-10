const network = require ('../data/osm_wroclaw_roads_cliped.json');
const fs = require('fs');

class halfEdge {
    constructor(V) {
        this.N = this
        this.S = null
        this.V = V
    }
}

const makeEdge = (v1, v2) => {
    const he1 = new halfEdge(v1);
    const he2 = new halfEdge(v2);
    he1.S = he2;
    he2.S = he1;
    return he1;
}

const splice =(e1, e2) => {
    let temp = e1.N;
    e1.N = e2.N;
    e2.N = temp;
}

let vertex = []

network.features.forEach((f) => {
    vertex.push(
        f.geometry.coordinates
        .flat()
        .filter(point => Array.isArray(point) && point.length === 2 && typeof point[0] === 'number')
    )
    
})

const buildHalfEdges = () => {
    const edges = [];
    const vertexMap = new Map();

    network.features.forEach((feature) => {
        const coords = feature.geometry.coordinates.flat();

        for (let i = 0; i < coords.length - 1; i++) {
            const v1 = coords[i];
            const v2 = coords[i + 1];

            const he1 = makeEdge(v1, v2);
            const he2 = he1.S;

            edges.push(he1);
            edges.push(he2);

            const key1 = v1.toString();
            const key2 = v2.toString();

            if (!vertexMap.has(key1)) vertexMap.set(key1, []);
            if (!vertexMap.has(key2)) vertexMap.set(key2, []);

            vertexMap.get(key1).push(he1);
            vertexMap.get(key2).push(he2);
        }
    });

    for (const [key, halfEdges] of vertexMap.entries()) {
        if (halfEdges.length > 1) {
            halfEdges.sort((a, b) => {
                const center = a.V;
                const angle = (p) => Math.atan2(p[1] - center[1], p[0] - center[0]);
                return angle(a.S.V) - angle(b.S.V);
            });

            for (let i = 0; i < halfEdges.length; i++) {
                const current = halfEdges[i];
                const next = halfEdges[(i + 1) % halfEdges.length];
                current.N = next;
            }
        }
    }

    return edges;
};

const halfEdges = buildHalfEdges();

const edgeIdMap = new Map();
halfEdges.forEach((he, idx) => {
    edgeIdMap.set(he, idx + 1); // ID zaczyna się od 1
});

const serialized = halfEdges.map((he) => ({
    id: edgeIdMap.get(he),
    vertex: he.V,
    next: edgeIdMap.get(he.N) || null,
    twin: edgeIdMap.get(he.S) || null
}));

fs.writeFileSync('./output/halfEdges/halfEdges.json', JSON.stringify(serialized, null, 2), 'utf8');