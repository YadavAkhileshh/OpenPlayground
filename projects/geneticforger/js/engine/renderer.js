import { Genome } from './genome.js';
import { Polygon } from './polygon.js';

/**
 * Handles rendering of genomes to a canvas context.
 * Responsible for visual output of the genetic algorithm.
 */
export class Renderer {
    /**
     * Creates a new Renderer.
     * @param {CanvasRenderingContext2D} ctx - The target 2D context.
     * @param {number} width - Canvas width.
     * @param {number} height - Canvas height.
     */
    constructor(ctx, width, height) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
    }

    /**
     * Clears the canvas.
     * Fills with black to provide a consistent background for semi-transparent polygons.
     */
    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        // Draw a black background. This is important because the fitness calculation
        // assumes a black void behind the polygons.
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    /**
     * Renders a complete genome to the canvas.
     * @param {Genome} genome - The genome to render.
     */
    render(genome) {
        this.clear();

        for (const poly of genome.polygons) {
            this.drawPolygon(poly);
        }
    }

    /**
     * Draws a single polygon.
     * @param {Polygon} poly - The polygon to draw.
     */
    drawPolygon(poly) {
        if (poly.vertices.length < 3) return;

        // Set color with alpha
        this.ctx.fillStyle = `rgba(${poly.color.r}, ${poly.color.g}, ${poly.color.b}, ${poly.color.a})`;
        this.ctx.beginPath();

        // Move to first vertex
        const start = poly.vertices[0];
        this.ctx.moveTo(start.x * this.width, start.y * this.height);

        // Draw lines to subsequent vertices
        for (let i = 1; i < poly.vertices.length; i++) {
            const v = poly.vertices[i];
            this.ctx.lineTo(v.x * this.width, v.y * this.height);
        }

        this.ctx.closePath();
        this.ctx.fill();
    }
}
