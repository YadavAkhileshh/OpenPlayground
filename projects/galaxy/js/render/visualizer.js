/**
 * @file visualizer.js
 * @description Handles various rendering tasks using the HTML5 Canvas API.
 * 
 * @module Render
 */

export class Renderer {
    /**
     * @param {HTMLCanvasElement} canvas 
     */
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: false }); // Optimization

        this.width = canvas.width;
        this.height = canvas.height;

        this.centerX = this.width / 2;
        this.centerY = this.height / 2;

        // Camera properties
        this.scale = 0.5; // Zoom
        this.offsetX = 0;
        this.offsetY = 0;

        // Visual settings
        this.trailFalloff = 0.3; // How fast trails fade (0-1)
    }

    resize(w, h) {
        this.canvas.width = w;
        this.canvas.height = h;
        this.width = w;
        this.height = h;
        this.centerX = w / 2;
        this.centerY = h / 2;
    }

    /**
     * Clear the screen with a fade effect to create trails.
     */
    clear() {
        // "Fade" effect: Draw a semi-transparent black rectangle
        this.ctx.fillStyle = `rgba(5, 5, 8, ${this.trailFalloff})`;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    /**
     * Render a list of particles.
     * @param {Array<Particle>} particles 
     */
    render(particles) {
        // Batch rendering by color could be faster, but for 10k particles, raw draws are usually okay
        // if we avoid too many state changes. 
        // Strategy: Assume standard blending (lighter composite usually looks good for space)

        this.ctx.globalCompositeOperation = 'screen'; // or 'lighter' for additive mixing

        // Optimization: Get direct access to buffer? (Maybe too complex for vanilla constraints)
        // Let's stick to standard arc/rect calls but optimized.

        // Pre-calculate projection constants
        const cx = this.centerX + this.offsetX;
        const cy = this.centerY + this.offsetY;
        const scale = this.scale;

        for (let i = 0, len = particles.length; i < len; i++) {
            const p = particles[i];

            // Simple perspective projection?
            // x_screen = x * (focal_length / z)
            // For now, let's do Orthographic projection with Zoom for simplicity + performance
            // It feels "scientific"

            const x = p.position.x * scale + cx;
            const y = p.position.y * scale + cy;

            // Bounds check optimization
            if (x < 0 || x > this.width || y < 0 || y > this.height) continue;

            const size = p.size * scale;

            // Use small rectangles for distant/small stars (faster than arc)
            this.ctx.fillStyle = p.color;

            if (size < 2) {
                this.ctx.fillRect(x, y, size, size);
            } else {
                this.ctx.beginPath();
                this.ctx.arc(x, y, size, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }

        this.ctx.globalCompositeOperation = 'source-over';
    }

    /**
     * Draw user interactions (e.g., center of mass indicators, debug)
     */
    drawDebug(octree) {
        if (!octree || !octree.root) return;

        this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.1)';
        this.ctx.lineWidth = 1;

        const drawNode = (node) => {
            if (node.totalMass === 0) return;

            // Draw box
            const ws = node.size * this.scale;
            const wx = (node.center.x - node.size / 2) * this.scale + this.centerX + this.offsetX;
            const wy = (node.center.y - node.size / 2) * this.scale + this.centerY + this.offsetY;

            if (ws > 5) { // Don't draw tiny boxes
                this.ctx.strokeRect(wx, wy, ws, ws);
            }

            if (!node.isLeaf) {
                for (let c of node.children) {
                    if (c) drawNode(c);
                }
            }
        }

        drawNode(octree.root);
    }
}
