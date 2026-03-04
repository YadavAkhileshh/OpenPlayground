/**
 * SpatialDebugger.js – Debug rendering for the spatial hash grid.
 * Draws grid cells and occupancy information to the main canvas.
 */

const SpatialDebugger = (() => {
    'use strict';

    const { HashUtils, BucketManager, GridCell } = window.SDFChisel;

    let _cellSize = 6;
    function setCellSize(sz) { _cellSize = sz; }

    /**
     * Draw the grid lines and cell occupancy to the given canvas context.
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} canvasW
     * @param {number} canvasH
     */
    function render(ctx, canvasW, canvasH) {
        const sz = _cellSize;
        const colW = Math.ceil(canvasW / sz);
        const colH = Math.ceil(canvasH / sz);

        ctx.save();
        ctx.strokeStyle = 'rgba(124,58,237,0.18)';
        ctx.lineWidth = 0.5;

        // Vertical lines
        for (let cx = 0; cx <= colW; cx++) {
            ctx.beginPath();
            ctx.moveTo(cx * sz, 0);
            ctx.lineTo(cx * sz, canvasH);
            ctx.stroke();
        }
        // Horizontal lines
        for (let cy = 0; cy <= colH; cy++) {
            ctx.beginPath();
            ctx.moveTo(0, cy * sz);
            ctx.lineTo(canvasW, cy * sz);
            ctx.stroke();
        }

        // Color occupied cells
        for (let cy = 0; cy < colH; cy++) {
            for (let cx = 0; cx < colW; cx++) {
                const bucket = BucketManager.getBucket(cx, cy);
                if (bucket.count > 0) {
                    const alpha = Math.min(0.4, bucket.count * 0.04);
                    ctx.fillStyle = `rgba(124,58,237,${alpha.toFixed(3)})`;
                    ctx.fillRect(cx * sz, cy * sz, sz, sz);
                }
            }
        }

        ctx.restore();
    }

    return { render, setCellSize };
})();

window.SDFChisel = window.SDFChisel || {};
window.SDFChisel.SpatialDebugger = SpatialDebugger;
