import { randomInt, randomFloat, clamp } from '../utils/math.js';
import { CONFIG } from './types.js';

/**
 * Represents a single semi-transparent polygon (gene) within the genome.
 * Each polygon has a set of vertices and a color (with alpha).
 */
export class Polygon {
    /**
     * Creates a new Polygon instance.
     * Initializes with random vertices and color.
     */
    constructor() {
        /**
         * Array of normalized vertices.
         * @type {Array<{x: number, y: number}>}
         */
        this.vertices = [];

        /**
         * Color of the polygon.
         * @type {Object}
         */
        this.color = { r: 0, g: 0, b: 0, a: 0.5 };

        this.initRandom();
    }

    /**
     * Initializes the polygon with random properties.
     * Generates vertices around a random center point to create a somewhat cohesive shape.
     */
    initRandom() {
        // Initialize random vertices (normalized 0-1)
        this.vertices = [];
        // Center point for the polygon
        const centerX = Math.random();
        const centerY = Math.random();

        for (let i = 0; i < CONFIG.VERTEX_COUNT; i++) {
            // Generate vertices around the center to avoid wildly large polygons covering everything
            this.vertices.push({
                x: clamp(centerX + randomFloat(-0.2, 0.2), 0, 1),
                y: clamp(centerY + randomFloat(-0.2, 0.2), 0, 1)
            });
        }

        // Initialize random color
        this.color = {
            r: randomInt(0, 255),
            g: randomInt(0, 255),
            b: randomInt(0, 255),
            a: randomFloat(0.3, 0.6) // Start with mid-range opacity
        };
    }

    /**
     * Creates a deep copy of this polygon.
     * Essential for the hill-climbing algorithm to trial mutations without destroying the current best.
     * @returns {Polygon} A new Polygon instance with identical properties.
     */
    clone() {
        const poly = new Polygon();
        // Deep copy vertices array
        poly.vertices = this.vertices.map(v => ({ ...v }));
        // Copy color object
        poly.color = { ...this.color };
        return poly;
    }

    /**
     * Mutates the polygon's properties based on the provided rates.
     * Can mutate vertices positions, color components, or opacity.
     *
     * @param {Object} rates - Mutation rates object.
     * @param {number} rates.mutationChance - Probability of mutating a specific attribute.
     * @param {number} rates.vertexShift - Max shift for vertices.
     * @param {number} rates.colorShift - Max shift for color channels.
     * @param {number} rates.opacityShift - Max shift for alpha.
     */
    mutate(rates) {
        // Mutate vertices
        // We pick one vertex to move, rather than moving all, to keep changes granular.
        if (Math.random() < rates.mutationChance) {
            const vIndex = randomInt(0, this.vertices.length - 1);
            this.vertices[vIndex].x = clamp(this.vertices[vIndex].x + randomFloat(-rates.vertexShift, rates.vertexShift), 0, 1);
            this.vertices[vIndex].y = clamp(this.vertices[vIndex].y + randomFloat(-rates.vertexShift, rates.vertexShift), 0, 1);
        }

        // Mutate Color (RGB)
        if (Math.random() < rates.mutationChance) {
            this.color.r = clamp(this.color.r + randomInt(-rates.colorShift, rates.colorShift), 0, 255);
            this.color.g = clamp(this.color.g + randomInt(-rates.colorShift, rates.colorShift), 0, 255);
            this.color.b = clamp(this.color.b + randomInt(-rates.colorShift, rates.colorShift), 0, 255);
        }

        // Mutate Opacity (Alpha)
        if (Math.random() < rates.mutationChance) {
            this.color.a = clamp(this.color.a + randomFloat(-rates.opacityShift, rates.opacityShift), 0.1, 0.9);
        }
    }
}
