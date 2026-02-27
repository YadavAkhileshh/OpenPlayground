// NematodeSim — HUD Renderer
// Renders the heads-up display overlay: FPS counter, organism count,
// viscosity label, and drag toggle status indicator in the corner.

import Config from '../sim/Config.js';

export class HUDRenderer {
    /** @param {CanvasRenderingContext2D} ctx */
    constructor(ctx) {
        this.ctx = ctx;
    }

    /**
     * Draw HUD elements.
     * @param {number}  w          Canvas width
     * @param {number}  h          Canvas height
     * @param {number}  fps        Current smoothed FPS
     * @param {number}  orgCount   Number of organisms
     * @param {number}  viscosity  Normalized viscosity 0..1
     * @param {boolean} showDrag   Whether drag viz is on
     * @param {number}  frequency  Current frequency Hz
     */
    draw(w, h, fps, orgCount, viscosity, showDrag, frequency) {
        const ctx = this.ctx;
        ctx.save();
        ctx.font = '12px "JetBrains Mono", "Courier New", monospace';
        ctx.textBaseline = 'top';
        ctx.shadowColor = Config.HUD_COLOR;
        ctx.shadowBlur = 8;
        ctx.fillStyle = Config.HUD_COLOR;

        const pad = 16;
        let y = pad;
        const lh = 18;

        this._line(ctx, pad, y, `FPS: ${fps}`); y += lh;
        this._line(ctx, pad, y, `ORG: ${orgCount}`); y += lh;
        this._line(ctx, pad, y, `ν: ${this._viscLabel(viscosity)}`); y += lh;
        this._line(ctx, pad, y, `ƒ: ${frequency.toFixed(2)} Hz`); y += lh;
        this._line(ctx, pad, y, `DRAG: ${showDrag ? 'ON' : 'off'}`); y += lh;

        // Title — bottom right
        ctx.textAlign = 'right';
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(0,220,160,0.4)';
        ctx.shadowBlur = 0;
        this._line(ctx, w - pad, h - pad - 14, 'NematodeSim v1.0');
        ctx.textAlign = 'left';
        ctx.restore();
    }

    /** Draw a single text line. */
    _line(ctx, x, y, text) {
        ctx.fillText(text, x, y);
    }

    /** Human label for viscosity. */
    _viscLabel(v) {
        if (v < 0.25) return `${(v * 100).toFixed(0)}% (water)`;
        if (v < 0.55) return `${(v * 100).toFixed(0)}% (moderate)`;
        if (v < 0.80) return `${(v * 100).toFixed(0)}% (viscous)`;
        return `${(v * 100).toFixed(0)}% (glycerol)`;
    }
}

export default HUDRenderer;
