# MSc Thesis: Pathfinding Algorithm Analysis

This project is a component of an MSc thesis focused on the implementation and comparison of pathfinding algorithms. It specifically analyzes the performance of Dijkstra's and A* algorithms on two different graph data structures: a traditional adjacency list representation and a half-edge data structure.

The algorithms are run on real-world road network data from OpenStreetMap for the city of Wrocław, Poland, to provide a practical basis for the analysis.

## Features

- **Interactive execution system** with menu-driven component selection
- Implementation of **Dijkstra's algorithm** for both graph representations
- Implementation of the **A* search algorithm** for both graph representations
- Graph creation from **OpenStreetMap (OSM)** data for real-world testing
- Support for two graph representations:
  - **Standard Graph** (Adjacency List)
  - **Half-Edge Data Structure**
- **Data structure validation** tools for half-edge graphs
- Separation of graphs based on travel type (e.g., car, bike/foot)
- **Performance timing** and result logging
- Comprehensive output generation including paths and execution metrics

## Project Structure

```
Msc-thesis-algorithms/
├── main.js             # Interactive menu to run different components of the project.
├── data/
│   ├── osm_wroclaw_roads.json        # Input data from OpenStreetMap for Wrocław.
│   └── osm_wroclaw_roads_cliped.json # Clipped version of the OSM data.
├── graph/
│   └── graphCreator.js   # Creates a standard graph structure from OSM data.
├── halfEdges/
│   ├── halfEdgeCreator.js # Creates a half-edge graph structure from OSM data.
│   └── halfEdgeChecker.js # Validates and checks half-edge data structure integrity.
├── dijkstra/
│   ├── dijkstraGraph.js  # Dijkstra's algorithm implementation for standard graph.
│   └── dijkstraHalfEdge.js # Dijkstra's algorithm implementation for half-edge graph.
├── aStar/
│   ├── aStarGraph.js     # A* algorithm implementation for standard graph.
│   └── aStarHalfEdge.js  # A* algorithm implementation for half-edge graph.
└── output/               # Directory for generated graphs and algorithm results.
    ├── graphs/           # Generated graph files (carGraph.json, bikeFootGraph.json)
    ├── halfEdges/        # Generated half-edge structures (halfEdges.json)
    └── paths/            # Algorithm execution results (aStarPath.txt, dijkstraPath.txt)
```

## How to Run

To run the project, execute the main script using Node.js. Make sure you have Node.js installed.

```bash
node main.js
```

The main script provides an interactive menu with the following options:

1. **Create a graph** - Generates standard graph structures from OSM data
2. **Create a half-edge data structure** - Generates half-edge structures from OSM data
3. **Check half-edge data structure** - Validates the integrity of half-edge structures
4. **Run the A* algorithm for the graph** - Executes A* pathfinding on standard graph
5. **Run the A* algorithm for the half-edge data structure** - Executes A* pathfinding on half-edge graph
6. **Run the Dijkstra algorithm for the graph** - Executes Dijkstra pathfinding on standard graph
7. **Run the Dijkstra algorithm for the half-edge data structure** - Executes Dijkstra pathfinding on half-edge graph

Simply enter the number corresponding to your desired operation and the system will execute the appropriate component.

## Workflow

The typical workflow for running a complete analysis would be:

1. First, create the graph structures (options 1 and 2)
2. Optionally validate the half-edge structure (option 3)
3. Run the pathfinding algorithms (options 4-7) to compare performance
4. Results will be saved in the `/output` directory with execution times and paths

## Data Source

The road network data is sourced from OpenStreetMap and includes:
- `osm_wroclaw_roads.json` - Complete road network data for Wrocław
- `osm_wroclaw_roads_cliped.json` - Clipped version for focused analysis

These files contain the necessary nodes and ways to construct the graphs for the pathfinding analysis.

## Output Files

The project generates several types of output files in the `/output` directory:

### Generated Graphs (`/output/graphs/`)
- `carGraph.json` - Graph structure optimized for car navigation
- `bikeFootGraph.json` - Graph structure for bike and pedestrian navigation

### Half-Edge Structures (`/output/halfEdges/`)
- `halfEdges.json` - Complete half-edge data structure representation

### Algorithm Results (`/output/paths/`)
- `aStarPath.txt` - Results and paths from A* algorithm execution
- `dijkstraPath.txt` - Results and paths from Dijkstra algorithm execution

Each algorithm execution includes timing information and the complete path found between specified points.
