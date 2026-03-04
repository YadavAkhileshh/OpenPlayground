/**
 * renderer.js — WaveTank Canvas Renderer
 *
 * Converts wave height values → pixel colors using color maps.
 * Renders barriers and optional depth overlay.
 * Uses ImageData for direct pixel manipulation (fastest approach on canvas 2D).
 */

import { depthToColor } from '../core/depth.js';

// ── Color Maps ────────────────────────────────────────────────────────────────
// Each map takes a normalized value t ∈ [-1, 1] and returns [r, g, b].

const COLOR_MAPS = {
    ocean: (t) => {
        // Negative: deep indigo trough → zero: near black → positive: bright cyan/white crest
        if (t < 0) {
            const s = -t; // 0..1
            return [
                Math.round(s * 20),
                Math.round(s * 60),
                Math.round(80 + s * 160),
            ];
        } else {
            return [
                Math.round(t * 200 + 20),
                Math.round(t * 240 + 60),
                Math.round(t * 255 + 120),
            ];
        }
    },

    plasma: (t) => {
        // Blue-purple trough, yellow-white crest
        const r = Math.round(clamp01((t + 1) * 120) * 255);
        const g = Math.round(clamp01(Math.abs(t) * 0.6) * 200);
        const b = Math.round(clamp01((1 - t) * 150 + 50) * 255);
        return [r, g, b];
    },

    grayscale: (t) => {
        const v = Math.round(clamp01((t + 1) / 2) * 255);
        return [v, v, v];
    },

    heatwave: (t) => {
        // Cold blue to hot red
        const r = Math.round(clamp01(t + 0.3) * 255);
        const g = Math.round(clamp01(1 - Math.abs(t) * 1.5) * 180);
        const b = Math.round(clamp01(-t + 0.3) * 255);
        return [r, g, b];
    },
};

function clamp01(v) {
    return v < 0 ? 0 : v > 1 ? 1 : v;
}

// ── Renderer Class ─────────────────────────────────────────────────────────────

export class Renderer {
    /**
     * @param {HTMLCanvasElement} canvas
     * @param {Grid} grid
     */
    constructor(canvas, grid) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.grid = grid;
        this.colorMap = 'ocean';
        this.showDepth = false;
        this._imageData = null;
        this._ensureImageData();
    }

    _ensureImageData() {
        const { width, height } = this.grid;
        if (!this._imageData || this._imageData.width !== width || this._imageData.height !== height) {
            this._imageData = this.ctx.createImageData(width, height);
        }
    }

    /** Set the active color map name. */
    setColorMap(name) {
        if (COLOR_MAPS[name]) this.colorMap = name;
    }

    /** Toggle depth overlay. */
    setShowDepth(val) {
        this.showDepth = val;
    }

    /**
     * Render one frame.
     * Scales the grid pixel-perfect to fill the canvas using imageSmoothingEnabled = false.
     */
    render() {
        this._ensureImageData();
        const { width, height, curr, barrier, depth } = this.grid;
        const data = this._imageData.data;
        const mapFn = COLOR_MAPS[this.colorMap] || COLOR_MAPS.ocean;
        const showDepth = this.showDepth;

        for (let i = 0; i < width * height; i++) {
            const px = i * 4;

            // Barrier cells: solid dark gray
            if (barrier[i]) {
                data[px] = 40;
                data[px + 1] = 45;
                data[px + 2] = 55;
                data[px + 3] = 255;
                continue;
            }

            // Wave color
            const t = clamp01(curr[i] * 1.5 + 0.5) * 2 - 1; // normalize to [-1,1]
            const [r, g, b] = mapFn(t);

            if (showDepth) {
                // Blend wave color with depth tint
                const dv = depth[i];
                const [dr, dg, db, da] = depthToColor(dv);
                const alpha = da / 255 * 0.45; // depth overlay strength
                data[px] = Math.round(r * (1 - alpha) + dr * alpha);
                data[px + 1] = Math.round(g * (1 - alpha) + dg * alpha);
                data[px + 2] = Math.round(b * (1 - alpha) + db * alpha);
            } else {
                data[px] = r;
                data[px + 1] = g;
                data[px + 2] = b;
            }
            data[px + 3] = 255;
        }

        // Draw grid imageData to an off-screen canvas at grid size, then scale up to canvas size
        if (!this._offscreen || this._offscreen.width !== width || this._offscreen.height !== height) {
            this._offscreen = document.createElement('canvas');
            this._offscreen.width = width;
            this._offscreen.height = height;
            this._offCtx = this._offscreen.getContext('2d');
        }
        this._offCtx.putImageData(this._imageData, 0, 0);

        this.ctx.imageSmoothingEnabled = false;
        this.ctx.drawImage(this._offscreen, 0, 0, this.canvas.width, this.canvas.height);
    }
}
