import { settings } from './settings.js';

/**
 * @file renderer.js
 * @description Handles the visualization of the 4D object on the HTML5 Canvas.
 * optimized for wireframe rendering with motion trails.
 */

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;

        // High DPI scaling
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Subscribe to settings to update local state if needed
        // (For now, we pull directly from settings in draw for dynamic updates)
    }

    /**
     * Resizes the canvas to full screen with DPI support.
     */
    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width * window.devicePixelRatio;
        this.canvas.height = this.height * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    /**
     * Clears the screen.
     * @param {boolean} trailsEnabled - If true, use fade effect instead of clear.
     */
    clear(trailsEnabled = true) {
        if (trailsEnabled) {
            // Fade out effect for trails
            const alpha = settings.get('colors').trailAlpha || 0.2;
            this.ctx.fillStyle = `rgba(5, 5, 8, ${alpha})`;
            this.ctx.fillRect(0, 0, this.width, this.height);
        } else {
            this.ctx.clearRect(0, 0, this.width, this.height);
        }
    }

    /**
     * Renders a frame.
     * @param {Array} projectedPoints - Array of {x, y, scale} objects
     * @param {Array} edges - Array of [index1, index2]
     */
    draw(projectedPoints, edges) {
        const colors = settings.get('colors');
        const lineWidth = settings.get('lineWidth');
        const showVertices = settings.get('showVertices');
        const showEdges = settings.get('showEdges');

        // Draw Edges
        if (showEdges) {
            this.ctx.strokeStyle = colors.primary;
            this.ctx.lineWidth = lineWidth;
            this.ctx.globalAlpha = colors.edgeAlpha;
            this.ctx.beginPath();

            for (const [i, j] of edges) {
                const p1 = projectedPoints[i];
                const p2 = projectedPoints[j];

                // Depth Cuing: Fade lines based on 4D depth (w) or 3D depth (z)
                // We use wDepth from the engine update.
                const avgDepth = (p1.wDepth + p2.wDepth) * 0.5;

                // Map depth to opacity. 
                // Typically W is between -2 and 2 (depending on scale/rotation).
                // Let's say front is W > 0, back is W < 0.
                // Or simply use distance.

                // Simple linear fade:
                // If W is "far" (negative), it should be dimmer.
                // Normalizing roughly -2 to 2 range to 0.1 to 1.0 alpha.
                let depthAlpha = (avgDepth + 2) / 4;

                // Safety check for NaN
                if (Number.isNaN(depthAlpha)) depthAlpha = 1.0;

                depthAlpha = Math.max(0.1, Math.min(1, depthAlpha));

                // Combine with global alpha
                this.ctx.globalAlpha = colors.edgeAlpha * depthAlpha;

                this.ctx.moveTo(p1.x, p1.y);
                this.ctx.lineTo(p2.x, p2.y);

                // Reset path for next segment to allow different alphas? 
                // No, stroking once is much faster. 
                // But to have per-line alpha we MUST stroke per line.
                // PERFORMANCE NOTE: Stroking per line is slower but needed for depth cueing.
                this.ctx.stroke();
                this.ctx.beginPath(); // Start new path
            }
            // this.ctx.stroke(); // Removed batch stroke
            this.ctx.globalAlpha = 1.0;
        }

        // Draw Vertices
        if (showVertices) {
            const radiusBase = settings.get('vertexRadius');
            this.ctx.fillStyle = colors.vertex;

            for (const p of projectedPoints) {
                const r = radiusBase * (p.scale / 100); // Scale vertex with depth
                const radius = Math.max(0.5, r);

                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
                this.ctx.fill();

                // Glow effect
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = colors.primary;
            }
            this.ctx.shadowBlur = 0; // Reset
        }
    }
}
