/**
 * @file geometries.js
 * @description Generates vertices and edges for various higher-dimensional shapes.
 * Currently supports: Tesseract (Hypercube), 16-Cell (Orthoplex).
 */

import { Vector4 } from '../math/vector4.js';

export class GeometryGenerator {
    /**
     * Generates a Tesseract (4D Hypercube).
     * @param {number} size - Side length (from center)
     * @returns {Object} { vertices: Vector4[], edges: number[][] }
     */
    static createTesseract(size = 1) {
        const vertices = [];
        const edges = [];

        // 1. Generate 16 vertices
        for (let i = 0; i < 16; i++) {
            const x = (i & 1) ? size : -size;
            const y = (i & 2) ? size : -size;
            const z = (i & 4) ? size : -size;
            const w = (i & 8) ? size : -size;
            vertices.push(new Vector4(x, y, z, w));
        }

        // 2. Generate Edges (differ by exactly one coordinate)
        for (let i = 0; i < 16; i++) {
            for (let j = i + 1; j < 16; j++) {
                if (this.isConnected(vertices[i], vertices[j])) {
                    edges.push([i, j]);
                }
            }
        }

        return { vertices, edges };
    }

    /**
     * Generates a 16-Cell (4D Orthoplex, analog of Octahedron).
     * Vertices are permutations of (+-1, 0, 0, 0).
     * @param {number} size - Distance from center
     * @returns {Object} { vertices: Vector4[], edges: number[][] }
     */
    static create16Cell(size = 1) {
        const vertices = [];
        const edges = [];

        // 8 Vertices: (+-1, 0, 0, 0), (0, +-1, 0, 0), etc.
        // Dimension 0 (X)
        vertices.push(new Vector4(size, 0, 0, 0));
        vertices.push(new Vector4(-size, 0, 0, 0));
        // Dimension 1 (Y)
        vertices.push(new Vector4(0, size, 0, 0));
        vertices.push(new Vector4(0, -size, 0, 0));
        // Dimension 2 (Z)
        vertices.push(new Vector4(0, 0, size, 0));
        vertices.push(new Vector4(0, 0, -size, 0));
        // Dimension 3 (W)
        vertices.push(new Vector4(0, 0, 0, size));
        vertices.push(new Vector4(0, 0, 0, -size));

        // Connect every vertex to every other vertex EXCEPT its opposite
        // Opposite of vertex i (where i is even) is i+1.
        for (let i = 0; i < 8; i++) {
            for (let j = i + 1; j < 8; j++) {
                // If j is the "opposite" of i, skip
                // 0 and 1 are opposite, 2 and 3, etc.
                const isOpposite = (Math.floor(i / 2) === Math.floor(j / 2));
                if (!isOpposite) {
                    edges.push([i, j]);
                }
            }
        }

        return { vertices, edges };
    }

    /**
     * Generators a 5-Cell (Pentatope, 4D Simplex).
     * @param {number} size
     */
    static create5Cell(size = 1) {
        // Vertices based on simplex coordinates
        // Simplification for visualization:
        const r = size;
        const vertices = [
            new Vector4(r, r, r, -r / Math.sqrt(5)),
            new Vector4(r, -r, -r, -r / Math.sqrt(5)),
            new Vector4(-r, r, -r, -r / Math.sqrt(5)),
            new Vector4(-r, -r, r, -r / Math.sqrt(5)),
            new Vector4(0, 0, 0, r * (4 / Math.sqrt(5)))
        ];

        const edges = [];
        // Connect potentially all pairs (it's a simplex)
        for (let i = 0; i < 5; i++) {
            for (let j = i + 1; j < 5; j++) {
                edges.push([i, j]);
            }
        }

        return { vertices, edges };
    }

    /**
     * Generates a 24-Cell (Icositetrachoron).
     * Vertices are permutations of (+-1, +-1, 0, 0).
     * 24 Vertices, 96 Edges.
     * @param {number} size
     */
    static create24Cell(size = 1) {
        const vertices = [];
        const edges = [];
        const epsilon = 0.001;

        // 1. Generate Vertices: Permutations of (+-1, +-1, 0, 0)
        // There are 4 positions for the two 1s: 4C2 = 6 positions.
        // For each position, signs can be ++, +-, -+, -- (4 combinations).
        // Total = 6 * 4 = 24 vertices.

        const perms = [
            [0, 1], [0, 2], [0, 3],
            [1, 2], [1, 3],
            [2, 3]
        ];

        perms.forEach(([axis1, axis2]) => {
            // Iterate through all sign combinations
            for (let s1 of [-1, 1]) {
                for (let s2 of [-1, 1]) {
                    const coords = [0, 0, 0, 0];
                    coords[axis1] = s1 * size;
                    coords[axis2] = s2 * size;
                    vertices.push(new Vector4(...coords));
                }
            }
        });

        // 2. Generate Edges
        // In a 24-cell, edge length is typically size * 1 (if coords are integers).
        // Distance squared between (1,1,0,0) and (1,0,1,0) is 1^2 + 1^2 = 2? No.
        // (1,1,0,0) - (1,0,1,0) = (0, 1, -1, 0). Dist sq = 2.
        // Distance squared between (1,1,0,0) and (1, -1, 0, 0) = (0, 2, 0, 0). Dist sq = 4.
        // So we connect vertices with distance squared approx equal to 2 * size * size.

        const edgeDistSq = 2 * (size * size);

        for (let i = 0; i < vertices.length; i++) {
            for (let j = i + 1; j < vertices.length; j++) {
                const d2 = vertices[i].distanceSquared(vertices[j]);
                if (Math.abs(d2 - edgeDistSq) < epsilon) {
                    edges.push([i, j]);
                }
            }
        }

        return { vertices, edges };
    }

    /**
     * Utility to check connection logic for hypercube.
     */
    static isConnected(v1, v2) {
        let diffs = 0;
        if (v1.x !== v2.x) diffs++;
        if (v1.y !== v2.y) diffs++;
        if (v1.z !== v2.z) diffs++;
        if (v1.w !== v2.w) diffs++;
        return diffs === 1;
    }
}
