// NematodeSim — Drag Arrow Renderer
// Draws colour-coded force arrows over each organism node
// when the drag visualisation toggle is enabled.
// Arrow length is proportional to force magnitude; colour encodes direction.

import Config from '../sim/Config.js';

export class DragArrowRenderer {
    /** @param {CanvasRenderingContext2D} ctx */
    constructor(ctx) {
        this.ctx = ctx;
        this.arrowScale = 28;   // Max arrow length in pixels
        this.minMagDraw = 0.5;  // Ignore arrows below this magnitude
    }

    /**
     * Draw all drag arrows from a DragVisualizer.
     * @param {DragVisualizer} dragVis
     */
    draw(dragVis) {
        if (!dragVis.enabled) return;
        const arrows = dragVis.normalizedArrows(this.arrowScale);
        if (!arrows.length) return;

        const ctx = this.ctx;
        ctx.save();
        ctx.shadowColor = Config.DRAG_ARROW_COLOR;
        ctx.shadowBlur = 5;

        for (let i = 0; i < arrows.length; i++) {
            const a = arrows[i];
            const mag = Math.sqrt(a.dx * a.dx + a.dy * a.dy);
            if (mag < this.minMagDraw) continue;
            this._drawArrow(ctx, a.x, a.y, a.x + a.dx, a.y + a.dy, mag / this.arrowScale);
        }

        ctx.restore();
    }

    /**
     * Draw a single arrow from (x1,y1) to (x2,y2).
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} x1
     * @param {number} y1
     * @param {number} x2
     * @param {number} y2
     * @param {number} normalizedMag  0 → 1 for colour mapping
     */
    _drawArrow(ctx, x1, y1, x2, y2, normalizedMag) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const angle = Math.atan2(dy, dx);
        const len = Math.sqrt(dx * dx + dy * dy);

        // Colour: orange at low magnitude → red at high
        const r = 255;
        const g = Math.round(120 * (1 - normalizedMag));
        const b = 30;
        ctx.strokeStyle = `rgb(${r},${g},${b})`;
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.lineWidth = 1.4;
        ctx.globalAlpha = 0.75;

        // Shaft
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Arrowhead
        const headLen = Math.min(len * 0.35, 7);
        const headAng = 0.45;
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(
            x2 - headLen * Math.cos(angle - headAng),
            y2 - headLen * Math.sin(angle - headAng)
        );
        ctx.lineTo(
            x2 - headLen * Math.cos(angle + headAng),
            y2 - headLen * Math.sin(angle + headAng)
        );
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}

export default DragArrowRenderer;
