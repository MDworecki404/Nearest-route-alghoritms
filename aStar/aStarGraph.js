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

const heuristic = (a, b) => {
    return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2))
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


const aStar = (start, goal, graph) => {
    const { nodes, edges } = graph
    const startKey = JSON.stringify(findNearestNode(start, nodes))
    const goalKey = JSON.stringify(findNearestNode(goal, nodes))

    let openSet = new Set([startKey])
    let cameFrom = new Map()
    let gScore = new Map(nodes.map(node => [JSON.stringify(node), Infinity]))
    let fScore = new Map(nodes.map(node => [JSON.stringify(node), Infinity]))

    gScore.set(startKey, 0)
    fScore.set(startKey, heuristic(start, goal))

    while (openSet.size > 0) {
        let current = [...openSet].reduce((a, b) => {
            const scoreA = fScore.get(a) ?? Infinity
            const scoreB = fScore.get(b) ?? Infinity
            return scoreA < scoreB ? a : b
        })

        if (current === goalKey) {
            let path = []
            while (cameFrom.has(current)) {
            path.push(JSON.parse(current))
            current = cameFrom.get(current)
            }
          path.push(start)
          return path.reverse()
        }

        openSet.delete(current)
        let neighbors = edges.get(current) || []

        for (let neighbor of neighbors) {
            let neighborKey = JSON.stringify(neighbor)
            const currentGScore = gScore.get(current) ?? Infinity
            let tentativeGScore = currentGScore + heuristic(JSON.parse(current), neighbor)
            const neighborGScore = gScore.get(neighborKey) ?? Infinity

        if (tentativeGScore < neighborGScore) {
            cameFrom.set(neighborKey, current)
            gScore.set(neighborKey, tentativeGScore)
            fScore.set(neighborKey, tentativeGScore + heuristic(neighbor, goal))
            openSet.add(neighborKey)
            }
        }
    }

  return []
}

const path = aStar([17.0634787, 51.110551], [17.0959078, 51.0987664], buildGraph("foot"))
console.log("Path found:", path)
const pathCsv = path.map(coord => coord.join(',')).join('\n');
fs.writeFileSync('./output/paths/aStarPath.txt', pathCsv);