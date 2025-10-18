const network = require('../data/osm_wroclaw_roads_cliped.json');
const halfEdges = require('../output/halfEdges/halfEdges.json');

function checkNodeCompleteness() {
    // Zbierz wszystkie węzły z sieci drogowej
    const networkNodes = new Set();

    network.features.forEach(feature => {
        if (feature.geometry.type === "MultiLineString") {
            feature.geometry.coordinates.forEach(line => {
                line.forEach(point => {
                    const nodeKey = `${point[0]},${point[1]}`;
                    networkNodes.add(nodeKey);
                });
            });
        }
    });

    // Zbierz wszystkie węzły z half-edges
    const halfEdgeNodes = new Set();

    halfEdges.forEach(he => {
        const nodeKey = `${he.V[0]},${he.V[1]}`;
        halfEdgeNodes.add(nodeKey);
    });

    // Znajdź brakujące węzły
    const missingNodes = [];

    networkNodes.forEach(nodeKey => {
        if (!halfEdgeNodes.has(nodeKey)) {
            const [lon, lat] = nodeKey.split(',').map(Number);
            missingNodes.push([lon, lat]);
        }
    });

    // Wyświetl statystyki
    console.log("=== ANALIZA KOMPLETNOŚCI WĘZŁÓW ===");
    console.log(`Łączna liczba węzłów w sieci: ${networkNodes.size}`);
    console.log(`Liczba węzłów w half-edges: ${halfEdgeNodes.size}`);
    console.log(`Liczba brakujących węzłów: ${missingNodes.length}`);
    console.log(`Procent pokrycia: ${((halfEdgeNodes.size / networkNodes.size) * 100).toFixed(2)}%`);

    if (missingNodes.length > 0) {
        console.log("\n=== PRZYKŁADY BRAKUJĄCYCH WĘZŁÓW ===");
        console.log("Pierwsze 10 brakujących węzłów:");
        missingNodes.slice(0, 10).forEach((node, index) => {
            console.log(`${index + 1}. [${node[0]}, ${node[1]}]`);
        });

        if (missingNodes.length > 10) {
            console.log(`... i ${missingNodes.length - 10} więcej`);
        }
    } else {
        console.log("\n✅ Wszystkie węzły z sieci znajdują się w strukturze half-edges!");
    }

    return {
        totalNetworkNodes: networkNodes.size,
        totalHalfEdgeNodes: halfEdgeNodes.size,
        missingNodesCount: missingNodes.length,
        missingNodes: missingNodes,
        coveragePercentage: (halfEdgeNodes.size / networkNodes.size) * 100
    };
}

// Sprawdź także dodatkowe węzły (które są w half-edges, ale nie w sieci)
function checkExtraNodes() {
    const networkNodes = new Set();

    network.features.forEach(feature => {
        if (feature.geometry.type === "MultiLineString") {
            feature.geometry.coordinates.forEach(line => {
                line.forEach(point => {
                    const nodeKey = `${point[0]},${point[1]}`;
                    networkNodes.add(nodeKey);
                });
            });
        }
    });

    const halfEdgeNodes = new Set();
    const extraNodes = [];

    halfEdges.forEach(he => {
        const nodeKey = `${he.V[0]},${he.V[1]}`;
        halfEdgeNodes.add(nodeKey);

        if (!networkNodes.has(nodeKey)) {
            extraNodes.push([he.V[0], he.V[1]]);
        }
    });

    console.log("\n=== ANALIZA DODATKOWYCH WĘZŁÓW ===");
    console.log(`Liczba węzłów tylko w half-edges: ${extraNodes.length}`);

    if (extraNodes.length > 0) {
        console.log("Pierwsze 10 dodatkowych węzłów:");
        extraNodes.slice(0, 10).forEach((node, index) => {
            console.log(`${index + 1}. [${node[0]}, ${node[1]}]`);
        });

        if (extraNodes.length > 10) {
            console.log(`... i ${extraNodes.length - 10} więcej`);
        }
    } else {
        console.log("✅ Brak dodatkowych węzłów w half-edges!");
    }

    return extraNodes;
}

// Uruchom analizę
const result = checkNodeCompleteness();
const extraNodes = checkExtraNodes();

// Dodatkowe statystyki
console.log("\n=== PODSUMOWANIE ===");
console.log(`Half-edges: ${halfEdges.length}`);
console.log(`Unikalne węzły w half-edges: ${result.totalHalfEdgeNodes}`);
console.log(`Średnia liczba half-edges na węzeł: ${(halfEdges.length / result.totalHalfEdgeNodes).toFixed(2)}`);

module.exports = {
    checkNodeCompleteness,
    checkExtraNodes
};