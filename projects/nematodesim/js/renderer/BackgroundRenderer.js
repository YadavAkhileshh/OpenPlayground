// NematodeSim — Background Renderer
// Draws the dark microscope-style canvas background with a subtle green grid,
// a radial vignette, and a faint scan-line texture for biological microscopy feel.

import Config from '../sim/Config.js';

export class BackgroundRenderer {
    /**
     * @param {CanvasRenderingContext2D} ctx
     */
    constructor(ctx) {
        this.ctx = ctx;
        this._gridCache = null;
        this._cacheW = 0;
        this._cacheH = 0;
    }

    /**
     * Draw the full background for one frame.
     * @param {number} w  Canvas width
     * @param {number} h  Canvas height
     */
    draw(w, h) {
        const ctx = this.ctx;

        // Base fill — very dark teal/green (microscope style)
        ctx.fillStyle = Config.BG_COLOR;
        ctx.fillRect(0, 0, w, h);

        // Grid overlay
        this._drawGrid(w, h);

        // Vignette (darkens corners)
        this._drawVignette(w, h);
    }

    /**
     * Draw the microscope grid.
     */
    _drawGrid(w, h) {
        const ctx = this.ctx;
        const cell = Config.GRID_CELL;

        ctx.save();
        ctx.strokeStyle = `rgba(0,220,160,${Config.GRID_ALPHA})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();

        // Vertical lines
        for (let x = 0; x <= w; x += cell) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
        }
        // Horizontal lines
        for (let y = 0; y <= h; y += cell) {
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
        }

        ctx.stroke();
        ctx.restore();
    }

    /**
     * Radial gradient vignette to focus attention on centre.
     */
    _drawVignette(w, h) {
        const ctx = this.ctx;
        const cx = w * 0.5;
        const cy = h * 0.5;
        const r = Math.sqrt(cx * cx + cy * cy) * 1.1;

        const grad = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, 'rgba(0,0,0,0.55)');

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
    }
}

export default BackgroundRenderer;
