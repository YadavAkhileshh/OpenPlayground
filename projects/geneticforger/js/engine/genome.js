import { Polygon } from './polygon.js';
import { CONFIG } from './types.js';

/**
 * Represents a complete solution in the genetic algorithm.
 * A genome consists of a collection of Polygons that, when rendered together,
 * form an approximation of the target image.
 */
export class Genome {
    /**
     * Creates a new Genome instance and initializes population.
     */
    constructor() {
        /** 
         * The list of polygons making up this genome.
         * @type {Polygon[]} 
         */
        this.polygons = [];
        this.init();
    }

    /**
     * Initializes the genome with random polygons.
     * Clears any existing polygons and creates a fresh set based on CONFIG.POLYGON_COUNT.
     */
    init() {
        this.polygons = [];
        for (let i = 0; i < CONFIG.POLYGON_COUNT; i++) {
            this.polygons.push(new Polygon());
        }
    }

    /**
     * Creates a deep copy of the genome.
     * This is crucial for creating a candidate (mutant) without modifying the current best genome.
     * @returns {Genome} A new Genome instance.
     */
    clone() {
        const genome = new Genome();
        // Deep clone every polygon
        genome.polygons = this.polygons.map(p => p.clone());
        return genome;
    }

    /**
     * Mutates the genome by modifying one of its polygons.
     * Also has a small chance to reorder polygons (changing z-index/drawing order).
     * 
     * @param {Object} rates - Mutation configuration.
     */
    mutate(rates) {
        // Pick a random polygon to mutate
        // Optimization: Changing one polygon at a time is often better for hill climbing
        // than changing all of them slightly.
        const index = Math.floor(Math.random() * this.polygons.length);
        this.polygons[index].mutate(rates);

        // Rare chance to swap overlapping order (Z-index mutation)
        // This allows shapes to move behind or in front of others
        if (Math.random() < 0.01) {
            const i = Math.floor(Math.random() * this.polygons.length);
            const j = Math.floor(Math.random() * this.polygons.length);
            [this.polygons[i], this.polygons[j]] = [this.polygons[j], this.polygons[i]];
        }
    }
}
