// NematodeSim — Drag Visualizer Data Store
// Collects per-node drag force vectors each frame for the
// drag-arrow overlay rendered by DragArrowRenderer.
// When the UI toggle is ON, this data feeds the renderer.
// When OFF, collection is skipped for performance.

import Config from '../sim/Config.js';

export class DragVisualizer {
    constructor() {
        this.enabled = false;  // Toggled by UI
        this.arrows = [];     // Array of {x, y, fx, fy, mag}
    }

    /**
     * Record drag arrow data for a single node.
     * @param {number} x   Node world X
     * @param {number} y   Node world Y
     * @param {number} fx  Drag force X
     * @param {number} fy  Drag force Y
     */
    record(x, y, fx, fy) {
        if (!this.enabled) return;
        const mag = Math.sqrt(fx * fx + fy * fy);
        this.arrows.push({ x, y, fx, fy, mag });
    }

    /**
     * Record all drag forces from an AnisotropicDrag.lastDrags array.
     * @param {Array} drags  [{nx, ny, fx, fy}]
     */
    recordFromDrags(drags) {
        if (!this.enabled) return;
        const n = drags.length;
        for (let i = 0; i < n; i++) {
            const d = drags[i];
            const mag = Math.sqrt(d.fx * d.fx + d.fy * d.fy);
            this.arrows.push({ x: d.nx, y: d.ny, fx: d.fx, fy: d.fy, mag });
        }
    }

    /** Clear all recorded arrows (called at frame start). */
    clear() {
        this.arrows.length = 0;
    }

    /** Toggle collection on/off. */
    toggle() {
        this.enabled = !this.enabled;
        if (!this.enabled) this.clear();
        return this.enabled;
    }

    /** Enable explicitly. */
    enable() { this.enabled = true; }

    /** Disable and clear. */
    disable() {
        this.enabled = false;
        this.clear();
    }

    /**
     * Get maximum drag magnitude this frame (for normalisation in renderer).
     * @returns {number}
     */
    maxMagnitude() {
        let max = 0;
        const a = this.arrows;
        for (let i = 0; i < a.length; i++) {
            if (a[i].mag > max) max = a[i].mag;
        }
        return max;
    }

    /**
     * Normalize all arrows so the largest = scale 1.
     * Returns normalised copies (does not mutate stored arrows).
     * @param {number} displayScale  Desired pixel length for max arrow
     * @returns {Array}
     */
    normalizedArrows(displayScale = 30) {
        const maxMag = this.maxMagnitude();
        if (maxMag < 1e-6) return [];
        return this.arrows.map(a => ({
            x: a.x,
            y: a.y,
            dx: (a.fx / maxMag) * displayScale,
            dy: (a.fy / maxMag) * displayScale,
            mag: a.mag,
        }));
    }
}

export default DragVisualizer;
