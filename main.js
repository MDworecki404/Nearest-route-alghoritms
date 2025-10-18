const readline = require('readline');
const { exec } = require('child_process');

const options = {
    1: { name: 'Create a graph', file: './graph/graphCreator.js' },
    2: { name: 'Create a half-edge data structure', file: './halfEdges/halfEdgeCreator.js' },
    3: { name: 'Check half-edge data structure', file: './halfEdges/halfEdgeChecker.js' },
    4: { name: 'Run the A* algorithm for the graph', file: './aStar/aStarGraph.js' },
    5: { name: 'Run the A* algorithm for the half-edge data structure', file: './aStar/aStarHalfEdge.js' },
    6: { name: 'Run the Dijkstra algorithm for the graph', file: './dijkstra/dijkstraGraph.js' },
    7: { name: 'Run the Dijkstra algorithm for the half-edge data structure', file: './dijkstra/dijkstraHalfEdge.js' },

};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('Select an option:');
for (const [key, option] of Object.entries(options)) {
    console.log(`${key}. ${option.name}`);
}

rl.question('\nEnter the option number: ', (answer) => {
    const selected = options[answer];

    if (!selected) {
        console.log('Invalid option. Terminated.');
        rl.close();
        return;
    }

    console.log(`\n▶ Starting up: ${selected.file}...\n`);
    const startTime = Date.now();
    exec(`node ${selected.file}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
        } else if (stderr) {
            console.error(`stderr: ${stderr}`);
        } else {
            console.log(`Result:\n${stdout}`);
            const endTime = Date.now();
            console.log(`\n▶ Finished in ${((endTime - startTime) / 1000).toFixed(2)} seconds.\n`);
        }
            rl.close();
        });


});