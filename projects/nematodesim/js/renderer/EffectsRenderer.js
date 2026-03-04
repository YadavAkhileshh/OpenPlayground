// NematodeSim — Effects Renderer
// Renders ambient particle effects: floating microscopic particles drifting
// in the fluid, and subtle fluid distortion trails behind fast-moving organisms.

import Config from '../sim/Config.js';

export class EffectsRenderer {
    /**
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} canvasW
     * @param {number} canvasH
     */
    constructor(ctx, canvasW, canvasH) {
        this.ctx = ctx;
        this.w = canvasW;
        this.h = canvasH;
        this._particles = this._initParticles(60);
    }

    /** Create drifting microparticles. */
    _initParticles(count) {
        const p = [];
        for (let i = 0; i < count; i++) {
            p.push({
                x: Math.random() * this.w,
                y: Math.random() * this.h,
                r: 0.5 + Math.random() * 1.5,
                vx: (Math.random() - 0.5) * 0.18,
                vy: (Math.random() - 0.5) * 0.18,
                alpha: 0.08 + Math.random() * 0.18,
            });
        }
        return p;
    }

    /**
     * Update and draw all effects.
     * @param {Population} population  Used for trail data
     */
    draw(population) {
        this._updateParticles();
        this._drawParticles();
    }

    /** Step each particle one frame, wrapping at edges. */
    _updateParticles() {
        const w = this.w;
        const h = this.h;
        for (let i = 0; i < this._particles.length; i++) {
            const p = this._particles[i];
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0) p.x += w;
            if (p.x > w) p.x -= w;
            if (p.y < 0) p.y += h;
            if (p.y > h) p.y -= h;
        }
    }

    /** Draw all microparticles as tiny glowing dots. */
    _drawParticles() {
        const ctx = this.ctx;
        ctx.save();
        ctx.shadowColor = 'rgba(0,230,180,0.4)';
        ctx.shadowBlur = 3;
        for (let i = 0; i < this._particles.length; i++) {
            const p = this._particles[i];
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0,220,190,${p.alpha})`;
            ctx.fill();
        }
        ctx.restore();
    }

    /** Resize particle field. */
    resize(w, h) {
        this.w = w;
        this.h = h;
        // Re-clamp particle positions
        for (let i = 0; i < this._particles.length; i++) {
            if (this._particles[i].x > w) this._particles[i].x = Math.random() * w;
            if (this._particles[i].y > h) this._particles[i].y = Math.random() * h;
        }
    }
}

export default EffectsRenderer;
