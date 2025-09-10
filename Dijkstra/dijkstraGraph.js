const bikeFootGraph = require("../output/graphs/bikeFootGraph.json")
const carGraph = require("../output/graphs/carGraph.json")
const fs = require("fs")

const buildGraph = (mode) => {
    let graph

    if (mode === "foot" || mode === "bike") {
        graph = bikeFootGraph
    } else if (mode === "car") {
        graph = carGraph
    } else {
        throw new Error(`Unkown mode: ${mode}`)
    }

    const edgesMap = new Map()
    for (const key in graph.edges) {
        edgesMap.set(key, graph.edges[key])
    }

    return {
        nodes: graph.nodes,
        edges: edgesMap
    }
}

const findNearestNode = (point, nodes) => {
    let nearest = null;
    let minDist = Infinity;

    nodes.forEach(node => {
        const dist = Math.sqrt(
            Math.pow(node[0] - point[0], 2) + Math.pow(node[1] - point[1], 2)
        );
        if (dist < minDist) {
            minDist = dist;
            nearest = node;
        }
    });

    return nearest;
};

const dijkstra = (start, goal, graph) => {
    const { nodes, edges } = graph
    const startKey = JSON.stringify(findNearestNode(start, nodes))
    const goalKey = JSON.stringify(findNearestNode(goal, nodes))

    let S = new Set()
    let Q = new Set(nodes.map(node => JSON.stringify(node)))

    let dist = new Map(nodes.map(node => [JSON.stringify(node), Infinity]))
    dist.set(startKey, 0)

    let prev = new Map()
    nodes.forEach(node => {
        prev.set(JSON.stringify(node), null)
    });

    while (Q.size > 0) {

        let current = null;
        let minDist = Infinity;

        for (const nodeKey of Q) {
            if (dist.get(nodeKey) < minDist) {
                minDist = dist.get(nodeKey);
                current = nodeKey;
            }
        }

        if (current === goalKey) {
            const path = [];
            let step = current;
            while (step !== null) {
                path.unshift(JSON.parse(step));
                step = prev.get(step);
            }
            return path;
        }

        Q.delete(current);
        S.add(current);
        console.log(Q.size)
        const neighbors = edges.get(current) || [];
        for (const neighbor of neighbors) {
            const neighborKey = JSON.stringify(neighbor);
            if (S.has(neighborKey)) continue;

            const alt = dist.get(current) + 1;
            if (alt < dist.get(neighborKey)) {
                dist.set(neighborKey, alt);
                prev.set(neighborKey, current);
            }
        }
    }
};

const path = dijkstra([17.0634787, 51.110551], [17.0959078, 51.0987664], buildGraph("car"))

console.log(path)
const pathCsv = path.map(coord => coord.join(',')).join('\n');
fs.writeFileSync('./output/paths/dijkstraPath.txt', pathCsv);