/**
 * QuadCompress Renderer
 * 
 * Handles the actual drawing of the Quadtree nodes onto the visible canvas.
 * Supports different rendering modes (Solid, Wireframe).
 * 
 * @module Renderer
 */

import { CONFIG } from '../config.js';

export class Renderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) throw new Error(`Canvas ${canvasId} not found`);
        this.ctx = this.canvas.getContext('2d', { alpha: false }); // Optimize for no transparency

        // Cache rendering state
        this.showBoundaries = CONFIG.ANIMATION.RENDER_WIREFRAME_DEFAULT;
        this.width = 0;
        this.height = 0;
    }

    /**
     * Resizes the display canvas to match the source
     * @param {number} w 
     * @param {number} h 
     */
    resize(w, h) {
        this.canvas.width = w;
        this.canvas.height = h;
        this.width = w;
        this.height = h;
        this.clear();
    }

    /**
     * Clears the canvas with the background color
     */
    clear() {
        this.ctx.fillStyle = CONFIG.CANVAS.BACKGROUND_COLOR;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    /**
     * Draws the provided list of nodes.
     * @param {Array<QuadNode>} nodes - Flat list of leaf nodes
     */
    draw(nodes) {
        // Batch drawing for performance
        // We could optimize further by sorting by color, but path switching is cheap enough here

        this.ctx.lineWidth = CONFIG.ANIMATION.WIREFRAME_WIDTH;

        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];

            // 1. Draw Solid Color
            this.ctx.fillStyle = node.colorString;
            // Overdraw slightly to prevent sub-pixel gaps
            this.ctx.fillRect(node.x, node.y, node.width, node.height);

            // 2. Draw Boundaries (optional)
            if (this.showBoundaries) {
                this.ctx.strokeStyle = CONFIG.ANIMATION.WIREFRAME_COLOR;
                this.ctx.strokeRect(node.x, node.y, node.width, node.height);
            }
        }
    }

    /**
     * Toggles the wireframe overlay
     * @param {boolean} show 
     */
    setBoundaries(show) {
        this.showBoundaries = show;
    }
}
