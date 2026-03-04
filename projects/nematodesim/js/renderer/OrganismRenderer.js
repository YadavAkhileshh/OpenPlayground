// NematodeSim — Organism Renderer
// Renders a single NematodeOrganism as a smooth cubic spline on the canvas.
// Uses cardinal spline interpolation for a fluid, organic body shape.
// Applies glow effects and segment-colour modulation from CPG activations.

import Config from '../sim/Config.js';

export class OrganismRenderer {
    /** @param {CanvasRenderingContext2D} ctx */
    constructor(ctx) {
        this.ctx = ctx;
    }

    /**
     * Render one organism.
     * @param {NematodeOrganism} org
     */
    draw(org) {
        const nodes = org.body.nodes;
        if (nodes.length < 2) return;

        const ctx = this.ctx;
        const color = org.color;

        ctx.save();

        // Glow effect
        ctx.shadowColor = color;
        ctx.shadowBlur = Config.GLOW_BLUR;

        this._drawBody(ctx, nodes, color, org.cpg);

        // Node dots for head emphasis
        this._drawHead(ctx, nodes[0], color);

        ctx.restore();
    }

    /**
     * Draw the body as a smooth closed-path spline.
     * @param {CanvasRenderingContext2D} ctx
     * @param {Node[]} nodes
     * @param {string} color
     * @param {CPG}    cpg
     */
    _drawBody(ctx, nodes, color, cpg) {
        const n = nodes.length;

        // Build smooth path using Catmull-Rom spline
        ctx.beginPath();
        ctx.moveTo(nodes[0].x, nodes[0].y);

        for (let i = 1; i < n - 2; i++) {
            const p0 = nodes[i - 1];
            const p1 = nodes[i];
            const p2 = nodes[i + 1];
            const p3 = nodes[Math.min(i + 2, n - 1)];

            const cp1x = p1.x + (p2.x - p0.x) / 6;
            const cp1y = p1.y + (p2.y - p0.y) / 6;
            const cp2x = p2.x - (p3.x - p1.x) / 6;
            const cp2y = p2.y - (p3.y - p1.y) / 6;

            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
        }

        // Stroke backbone
        ctx.strokeStyle = color;
        ctx.lineWidth = Config.RADIUS_MID * 1.6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = 0.85;
        ctx.stroke();

        // Bright core line (highlight)
        ctx.beginPath();
        ctx.moveTo(nodes[0].x, nodes[0].y);
        for (let i = 1; i < n - 2; i++) {
            const p0 = nodes[i - 1];
            const p1 = nodes[i];
            const p2 = nodes[i + 1];
            const p3 = nodes[Math.min(i + 2, n - 1)];
            const cp1x = p1.x + (p2.x - p0.x) / 6;
            const cp1y = p1.y + (p2.y - p0.y) / 6;
            const cp2x = p2.x - (p3.x - p1.x) / 6;
            const cp2y = p2.y - (p3.y - p1.y) / 6;
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
        }
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.6;
        ctx.stroke();
        ctx.globalAlpha = 1.0;
    }

    /** Draw a bright dot for the head node. */
    _drawHead(ctx, headNode, color) {
        ctx.beginPath();
        ctx.arc(headNode.x, headNode.y, Config.RADIUS_HEAD * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.75;
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}

export default OrganismRenderer;
