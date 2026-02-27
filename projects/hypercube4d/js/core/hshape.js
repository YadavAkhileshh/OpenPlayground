/**
 * @file hshape.js
 * @description Defines the geometry of a Hypercube (Tesseract).
 * Stores vertices and edges in 4D space.
 */

import { Vector4 } from '../math/vector4.js';
import { GeometryGenerator } from './geometries.js';

export class HShape {
    constructor(type = 'tesseract') {
        this.vertices = [];
        this.edges = [];
        this.type = type;
        this.init();
    }

    init() {
        let data;
        switch (this.type) {
            case '16-cell':
                data = GeometryGenerator.create16Cell(1.5);
                break;
            case '5-cell':
                data = GeometryGenerator.create5Cell(1.5);
                break;
            case '24-cell':
                data = GeometryGenerator.create24Cell(1);
                break;
            case 'tesseract':
            default:
                data = GeometryGenerator.createTesseract(1);
                break;
        }

        this.vertices = data.vertices;
        this.edges = data.edges;

        console.log(`Shape initialized: ${this.type.toUpperCase()} with ${this.vertices.length} vertices, ${this.edges.length} edges.`);
    }

    /**
     * Rotates or deforms the shape (optional advanced feature).
     */
    update() {
        // Placeholder for dynamic geometry updates
    }
}
