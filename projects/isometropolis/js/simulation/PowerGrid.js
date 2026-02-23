import { EventEmitter } from '../engine/EventEmitter.js';

/**
 * Handles Breadth-First Search propagation of power from Plant -> Roads -> Buildings.
 */
export class PowerGrid {
    /**
     * @param {CityMap} map
     * @param {EventEmitter} events
     */
    constructor(map, events) {
        this.map = map;
        this.events = events;

        // Cache of power sources
        this.sources = [];
        this.totalOutput = 0;
        this.totalDemand = 0;
    }

    /**
     * Re-calculates and propagates power through the entire grid.
     */
    recalculate() {
        this.sources = [];
        this.totalOutput = 0;
        this.totalDemand = 0;

        // Reset all powered states
        for (let i = 0; i < this.map.grid.length; i++) {
            const t = this.map.grid[i];
            t.isPowered = false;

            // Re-detect sources
            if (t.isPowerPlant) {
                this.sources.push(t);
                t.isPowered = true;
                this.totalOutput += 500; // arbitrary MW output
            }

            // Calc demand
            if (t.type === 'building') {
                this.totalDemand += t.developmentLevel * 5;
            }
        }

        // If demand exceeds output, random brownouts occur, but for simplicity
        // in this limited simulation, we'll just propagate what we can. 
        // If totalOutput < totalDemand, we could limit the BFS queue.

        let powerAvailable = this.totalOutput;

        // BFS Propagation along PowerNodes (Roads/Plants)
        const queue = [...this.sources];
        const visited = new Set();

        for (const s of this.sources) {
            visited.add(`${s.x},${s.y}`);
        }

        while (queue.length > 0) {
            const current = queue.shift();

            // Radiate power to surrounding tiles (radius 3)
            const area = this.map.getTilesInRadius(current.x, current.y, 3);
            for (const t of area) {
                if (!t.isPowered) {
                    t.isPowered = true;
                }
            }

            // Continue BFS along adjacent conductive paths (roads/powerlines)
            const neighbors = this.map.getNeighbors(current.x, current.y);
            for (const n of neighbors) {
                const key = `${n.x},${n.y}`;
                if (!visited.has(key) && n.hasPowerNode) {
                    visited.add(key);
                    queue.push(n);
                }
            }
        }

        this.events.emit('power:updated', { output: this.totalOutput, demand: this.totalDemand });
    }

    /**
     * Places a pure power node (utility line).
     */
    placePowerLine(x, y) {
        const t = this.map.getTile(x, y);
        if (!t) return false;
        if (t.type === 'road' || t.type === 'building') return false; // Roads already bear lines, buildings can't

        t.hasPowerNode = true;
        this.recalculate();
        return true;
    }
}
