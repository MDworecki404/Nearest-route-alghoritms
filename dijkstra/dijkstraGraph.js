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

    console.log(`Graph loaded: ${Object.keys(graph.nodes || {}).length || graph.nodes?.length || 0} nodes, ${Object.keys(graph.edges || {}).length} edges`)

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

    console.log(`Nearest node to [${point}]: [${nearest}], distance: ${minDist.toFixed(6)}`)
    return nearest;
};

const dijkstra = (start, goal, graph) => {
    const { nodes, edges } = graph
    const startNode = findNearestNode(start, nodes)
    const goalNode = findNearestNode(goal, nodes)
    const startKey = JSON.stringify(startNode)
    const goalKey = JSON.stringify(goalNode)

    console.log(`Start: ${startKey}`)
    console.log(`Goal: ${goalKey}`)

    // Sprawdź połączenia węzłów startowego i końcowego
    const startEdges = edges.get(startKey) || []
    const goalEdges = edges.get(goalKey) || []
    console.log(`Start node has ${startEdges.length} connections`)
    console.log(`Goal node has ${goalEdges.length} connections`)

    if (startEdges.length === 0) {
        console.log("WARNING: Start node has no connections!")
    }
    if (goalEdges.length === 0) {
        console.log("WARNING: Goal node has no connections!")
    }

    let visited = new Set()
    let unvisited = new Set(nodes.map(node => JSON.stringify(node)))

    let dist = new Map()
    let prev = new Map()

    // Inicjalizacja - wszystkie węzły mają nieskończoną odległość oprócz startowego
    nodes.forEach(node => {
        const nodeKey = JSON.stringify(node)
        dist.set(nodeKey, nodeKey === startKey ? 0 : Infinity)
        prev.set(nodeKey, null)
    })

    let iterationCount = 0
    while (unvisited.size > 0) {
        iterationCount++
        if (iterationCount % 100 === 0) {
            console.log(`Iteration: ${iterationCount}, Unvisited: ${unvisited.size}`)
        }

        // Znajdź węzeł z minimalną odległością wśród nieodwiedzonych
        let current = null
        let minDist = Infinity

        for (const nodeKey of unvisited) {
            const nodeDist = dist.get(nodeKey)
            if (nodeDist < minDist) {
                minDist = nodeDist
                current = nodeKey
            }
        }

        // Jeśli nie ma dostępnego węzła (wszystkie mają nieskończoną odległość)
        if (current === null || minDist === Infinity) {
            console.log("No path found - all remaining nodes are unreachable")
            return null
        }

        // Jeśli dotarliśmy do celu
        if (current === goalKey) {
            console.log(`Path found after ${iterationCount} iterations`)
            const path = []
            let step = current
            while (step !== null) {
                path.unshift(JSON.parse(step))
                step = prev.get(step)
            }
            return path
        }

        // Usuń current z unvisited i dodaj do visited
        unvisited.delete(current)
        visited.add(current)

        // Sprawdź wszystkich sąsiadów
        const neighbors = edges.get(current) || []
        for (const neighbor of neighbors) {
            const neighborKey = JSON.stringify(neighbor)

            // Pomiń jeśli już odwiedzony
            if (visited.has(neighborKey)) continue

            // Oblicz nową odległość (używamy prostej metryki - 1 dla każdej krawędzi)
            const currentNode = JSON.parse(current)
            const alt = dist.get(current) + Math.sqrt(
                Math.pow(neighbor[0] - currentNode[0], 2) +
                Math.pow(neighbor[1] - currentNode[1], 2)
            )

            // Jeśli znaleźliśmy krótszą ścieżkę
            if (alt < dist.get(neighborKey)) {
                dist.set(neighborKey, alt)
                prev.set(neighborKey, current)
            }
        }
    }

    console.log("No path found - goal unreachable")
    return null
}

const startTime = Date.now()
const path = dijkstra([17.0634787, 51.110551], [17.0959078, 51.0987664], buildGraph("bike"))
const endTime = Date.now()

console.log(`\nExecution time: ${((endTime - startTime) / 1000).toFixed(2)} seconds`)

if (path) {
    console.log(`Path found with ${path.length} nodes`)
    const pathCsv = path.map(coord => coord.join(',')).join('\n')
    fs.writeFileSync('./output/paths/dijkstraPathGraph.txt', pathCsv)
    console.log('Path saved to ./output/paths/dijkstraPathGraph.txt')
} else {
    console.log('No path found between the specified points')
    fs.writeFileSync('./output/paths/dijkstraPathGraph.txt', 'No path found')
}