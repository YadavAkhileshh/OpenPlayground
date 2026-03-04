import { EventEmitter } from '../engine/EventEmitter.js';

/**
 * Creates and manages a graph of road connectivity for pathfinding.
 */
export class RoadNetwork {
    /**
     * @param {CityMap} map
     * @param {EventEmitter} events
     */
    constructor(map, events) {
        this.map = map;
        this.events = events;

        // Structure: "x,y" => [{x, y, cost}]
        this.graph = new Map();

        // Rebuild graph when map changes
        this.events.on('map:roadChanged', () => this.rebuildGraph());
    }

    /**
     * Fully rebuilds the pathfinding graph based on current roads.
     */
    rebuildGraph() {
        this.graph.clear();

        for (let x = 0; x < this.map.width; x++) {
            for (let y = 0; y < this.map.height; y++) {
                const t = this.map.getTile(x, y);
                if (t && t.type === 'road') {
                    const key = `${x},${y}`;
                    const edges = [];

                    const neighbors = this.map.getNeighbors(x, y);
                    for (const n of neighbors) {
                        if (n && n.type === 'road') {
                            edges.push({ x: n.x, y: n.y, cost: 1 });
                        }
                    }

                    this.graph.set(key, edges);
                }
            }
        }
    }

    /**
     * Retrieves neighbors for a specific node key.
     */
    getEdges(x, y) {
        const key = `${x},${y}`;
        return this.graph.get(key) || [];
    }

    /**
     * Get a random road node (useful for spawning)
     */
    getRandomNode() {
        if (this.graph.size === 0) return null;
        const keys = Array.from(this.graph.keys());
        const picked = keys[Math.floor(Math.random() * keys.length)];
        const [x, y] = picked.split(',').map(Number);
        return { x, y };
    }
}
