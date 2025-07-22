const bikeFootGraph = require("../output/graphs/bikeFootGraph.json")
const carGraph = require("../output/graphs/carGraph.json")
const fs = require("fs")

// Funkcja budująca graf na podstawie danych GeoJSON
const buildGraph = (mode) => {
    let graph

    if (mode === "foot" || mode === "bike") {
        graph = bikeFootGraph
    } else if (mode === "car") {
        graph = carGraph
    } else {
        throw new Error(`Unkown mode: ${mode}`)
    }

  // Zamiana edges z obiektu na Mapę
    const edgesMap = new Map()
    for (const key in graph.edges) {
        edgesMap.set(key, graph.edges[key])
    }

  // nodes są już w postaci tablicy, więc bez zmian
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
    const { nodes, edges } = graph // Pobranie węzłów i krawędzi z grafu
    const startKey = JSON.stringify(findNearestNode(start, nodes)) // Konwersja punktu początkowego na string (dla Map)
    const goalKey = JSON.stringify(findNearestNode(goal, nodes)) // Konwersja punktu docelowego na string (dla Map)

    let S = new Set()
    let Q = new Set(nodes.map(node => JSON.stringify(node))) // Zbiór wszystkich węzłów
    
    let dist = new Map(nodes.map(node => [JSON.stringify(node), Infinity])) // Koszt dojścia do każdego węzła (Infinity na start)
    dist.set(startKey, 0) // Koszt dojścia do węzła startowego to 0
    
    let prev = new Map() // Mapa śledząca, skąd przyszliśmy do danego węzła
    nodes.forEach(node => {
        prev.set(JSON.stringify(node), null) // Na początku nie mamy żadnych poprzedników
    });

    while (Q.size > 0) {

        // Znajdź węzeł o najmniejszym koszcie dojścia
        let current = null;
        let minDist = Infinity;

        for (const nodeKey of Q) {
            if (dist.get(nodeKey) < minDist) {
                minDist = dist.get(nodeKey);
                current = nodeKey;
            }
        }

        if (current === goalKey) {
            // Jeśli dotarliśmy do celu, odbuduj ścieżkę
            const path = [];
            let step = current;
            while (step !== null) {
                path.unshift(JSON.parse(step));
                step = prev.get(step);
            }
            return path; // Zwróć znalezioną ścieżkę
        }

        Q.delete(current); // Usuń bieżący węzeł z Q
        S.add(current); // Dodaj bieżący węzeł do S
        console.log(Q.size)
        // Przeglądaj sąsiadów bieżącego węzła
        const neighbors = edges.get(current) || [];
        for (const neighbor of neighbors) {
            const neighborKey = JSON.stringify(neighbor);
            if (S.has(neighborKey)) continue; // Jeśli sąsiad jest już w S, pomiń go

            const alt = dist.get(current) + 1; // Zakładamy, że każda krawędź ma wagę 1
            if (alt < dist.get(neighborKey)) {
                dist.set(neighborKey, alt); // Aktualizuj koszt dojścia do sąsiada
                prev.set(neighborKey, current); // Ustaw poprzednika dla sąsiada
            }
        }
    }
};

const path = dijkstra([17.0634787, 51.110551], [17.0959078, 51.0987664], buildGraph("car"))

console.log(path)
const pathCsv = path.map(coord => coord.join(',')).join('\n');
fs.writeFileSync('./output/paths/dijkstraPath.txt', pathCsv);