/**
 * Specific renderer for animated vehicles on top of roads.
 */
export class VehicleRenderer {
    constructor(isoMath) {
        this.isoMath = isoMath;
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {VehicleManager} vManager
     * @param {Rect} viewBounds
     */
    render(ctx, vManager, viewBounds) {
        for (const v of vManager.vehicles) {
            // Screen position interpolated
            const sp = this.isoMath.gridToScreen(v.position.x, v.position.y);

            // Simple cull
            if (sp.x >= viewBounds.x && sp.x <= viewBounds.x + viewBounds.w &&
                sp.y >= viewBounds.y && sp.y <= viewBounds.y + viewBounds.h) {

                // Draw simple car
                ctx.save();
                ctx.translate(sp.x, sp.y - 4); // elevate slightly

                // Determine rotation from velocity roughly
                let angle = 0;
                if (v.velocity.x > 0.1) angle = Math.PI / 4; // East-ish down right
                else if (v.velocity.x < -0.1) angle = Math.PI + Math.PI / 4; // West
                else if (v.velocity.y > 0.1) angle = Math.PI - Math.PI / 4; // South-ish down left
                else if (v.velocity.y < -0.1) angle = -Math.PI / 4; // North

                // Pure isometric angles aren't pure 45deg but this is approximation for visual
                ctx.rotate(angle);

                // Draw body
                ctx.fillStyle = v.color;
                ctx.fillRect(-3, -2, 6, 4);

                // Headlights
                if (v.velocity.magnitudeSq() > 0.01) {
                    ctx.fillStyle = 'rgba(255,255,200,0.8)';
                    ctx.fillRect(3, -2, 2, 1);
                    ctx.fillRect(3, 1, 2, 1);
                }

                ctx.restore();
            }
        }
    }
}
