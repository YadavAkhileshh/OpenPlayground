/**
 * Renders UI overlays on the canvas (Grid, Selection, Zoning colors, Power view)
 */
export class OverlayRenderer {
    constructor(isoMath) {
        this.isoMath = isoMath;
        this.showPower = false;
        this.showGrid = true;
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {CityMap} map
     * @param {Object} state - UI State (hovered tile, active tool, etc)
     */
    render(ctx, map, state) {
        ctx.lineWidth = 1;

        // Hover Highlight
        if (state.hoveredGrid) {
            const hx = state.hoveredGrid.x;
            const hy = state.hoveredGrid.y;
            if (map.isValid(hx, hy)) {
                this._drawCellOverlay(ctx, hx, hy, 'rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 0.8)');
            }
        }

        // Zoning overlays
        if (state.tool.startsWith('zone-')) {
            for (let x = 0; x < map.width; x++) {
                for (let y = 0; y < map.height; y++) {
                    const t = map.getTile(x, y);
                    if (t.zoning !== 'none' && t.type !== 'road') {
                        let zcolor = 'rgba(255,255,255,0.2)';
                        if (t.zoning === 'residential') zcolor = 'rgba(46, 204, 113, 0.4)';
                        if (t.zoning === 'commercial') zcolor = 'rgba(52, 152, 219, 0.4)';
                        if (t.zoning === 'industrial') zcolor = 'rgba(241, 196, 15, 0.4)';
                        this._drawCellOverlay(ctx, x, y, zcolor, null);
                    }
                }
            }
        }

        // Power overlay
        if (this.showPower) {
            for (let x = 0; x < map.width; x++) {
                for (let y = 0; y < map.height; y++) {
                    const t = map.getTile(x, y);
                    if (t.hasPowerNode || t.isPowered) {
                        const sp = this.isoMath.gridToScreen(x, y);

                        ctx.beginPath();
                        ctx.arc(sp.x, sp.y - 10, 5, 0, Math.PI * 2);
                        if (t.isPowerPlant) {
                            ctx.fillStyle = '#f39c12'; // Producer
                            ctx.shadowBlur = 10;
                            ctx.shadowColor = '#f39c12';
                            ctx.arc(sp.x, sp.y - 10, 10, 0, Math.PI * 2);
                        } else if (t.isPowered) {
                            ctx.fillStyle = '#f1c40f'; // Powered
                            ctx.shadowBlur = 5;
                            ctx.shadowColor = '#f1c40f';
                        } else {
                            ctx.fillStyle = '#7f8c8d'; // Unpowered
                            ctx.shadowBlur = 0;
                        }
                        ctx.fill();
                        ctx.shadowBlur = 0; // reset
                    }
                }
            }
        }
    }

    _drawCellOverlay(ctx, gridX, gridY, fillStyle, strokeStyle) {
        const top = this.isoMath.gridToScreen(gridX, gridY - 0.5);
        const right = this.isoMath.gridToScreen(gridX + 0.5, gridY);
        const bottom = this.isoMath.gridToScreen(gridX, gridY + 0.5);
        const left = this.isoMath.gridToScreen(gridX - 0.5, gridY);

        ctx.beginPath();
        ctx.moveTo(top.x, top.y);
        ctx.lineTo(right.x, right.y);
        ctx.lineTo(bottom.x, bottom.y);
        ctx.lineTo(left.x, left.y);
        ctx.closePath();

        if (fillStyle) {
            ctx.fillStyle = fillStyle;
            ctx.fill();
        }
        if (strokeStyle) {
            ctx.strokeStyle = strokeStyle;
            ctx.stroke();
        }
    }
}
