/**
 * Renderer.js
 * 
 * Handles the visual output of the application.
 * Features:
 * - Trail rendering with fading opacity (accumulation buffer effect).
 * - 3D Perspective projection integration.
 * - Dynamic coloring based on velocity or depth.
 * - Glow/Bloom aesthetics.
 * - Particle System rendering.
 * - Geometry (Axes) rendering.
 */

import { Projection } from './Projection.js';
import { Geometry } from './Geometry.js';

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;

        // Performance option: pre-calculate colors or reuse objects if needed
        this.baseHue = 180; // Cyan base

        this.geometry = new Geometry();
        this.showAxes = false; // Toggle
    }

    resize(w, h) {
        this.width = w;
        this.height = h;
    }

    /**
     * Clears the canvas with a semi-transparent fill to create trails.
     */
    clear() {
        // "Fade" effect: Draw a semi-transparent black rectangle over previous frame
        // This makes old lines slowly disappear
        this.ctx.fillStyle = 'rgba(5, 5, 8, 0.08)';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    /**
     * Renders the simulation points.
     * @param {Array<Vector3>} points - Array of 3D points from the simulation.
     * @param {Camera} camera - The active camera.
     * @param {number} scaleFactor - Rendering scale for the specific attractor.
     */
    render(points, camera, scaleFactor) {
        if (this.showAxes) {
            this.geometry.drawAxes(this.ctx, camera, this.width, this.height);
        }

        if (points.length < 2) return;

        this.ctx.globalCompositeOperation = 'lighter'; // Additive blending for "glow"
        this.ctx.lineWidth = 1.5;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        let previousProjected = null;

        // Optimization: We don't render every single point if there are too many, 
        // effectively drawing segments. But for quality we draw all.
        // We'll iterate through points to draw connected segments.

        for (let i = 0; i < points.length; i++) {
            const current3D = points[i];
            const projected = Projection.project(current3D, camera, this.width, this.height, scaleFactor);

            if (!projected) {
                // If point is clipped, break the line
                previousProjected = null;
                continue;
            }

            if (previousProjected) {
                // Determine color
                const depth = projected.z; // transformed Z

                // Color mapping
                const hue = (this.baseHue + depth * 0.5) % 360;
                const light = 50 + (projected.w * 5); // Brighter when closer
                const alpha = Math.min(1.0, projected.w * 3); // Fade out when far

                this.ctx.beginPath();
                this.ctx.moveTo(previousProjected.x, previousProjected.y);
                this.ctx.lineTo(projected.x, projected.y);

                this.ctx.strokeStyle = `hsla(${hue}, 80%, ${light}%, ${alpha})`;
                this.ctx.stroke();
            }

            previousProjected = projected;
        }

        this.ctx.globalCompositeOperation = 'source-over'; // Reset
    }
}
