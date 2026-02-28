/**
 * ParticleRenderer.js – Draws all particles to the main simulation canvas.
 * Supports glow pass, trail rendering, and per-particle color based on SDF + speed.
 */

const ParticleRenderer = (() => {
    'use strict';

    const { Color, Config, MathUtils } = window.SDFChisel;

    let _ctx = null;
    let _canvasW = 0;
    let _canvasH = 0;
    let _showTrails = true;
    let _maxSpeed = 4;

    /** Cached compositing strings */
    const COMP_LIGHTER = 'lighter';
    const COMP_NORMAL = 'source-over';

    function init(canvas, canvasW, canvasH) {
        _ctx = canvas.getContext('2d');
        _canvasW = canvasW;
        _canvasH = canvasH;
    }

    function setShowTrails(v) { _showTrails = v; }
    function resize(w, h) { _canvasW = w; _canvasH = h; }

    /**
     * Clear the canvas with a trail effect.
     */
    function clearFrame() {
        if (!_ctx) return;
        if (_showTrails) {
            _ctx.globalCompositeOperation = COMP_NORMAL;
            _ctx.globalAlpha = 1 - Config.PARTICLE.TRAIL_STRENGTH * 0.12;
            _ctx.fillStyle = Config.CANVAS.BG_COLOR;
            _ctx.fillRect(0, 0, _canvasW, _canvasH);
            _ctx.globalAlpha = 1;
        } else {
            _ctx.fillStyle = Config.CANVAS.BG_COLOR;
            _ctx.fillRect(0, 0, _canvasW, _canvasH);
        }
    }

    /**
     * Draw all active particles.
     */
    function drawParticles(particles) {
        if (!_ctx) return;

        // Track max speed for color normalization
        let ms = 0.1;
        for (let i = 0; i < particles.length; i++) {
            if (particles[i].active && particles[i].speed > ms) ms = particles[i].speed;
        }
        _maxSpeed = MathUtils.lerp(_maxSpeed, ms, 0.05);

        _ctx.globalCompositeOperation = COMP_LIGHTER;

        const baseR = Config.CANVAS.PARTICLE_BASE_RADIUS;
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            if (!p.active) continue;

            const sdfAbs = Math.abs(p.sdfVal);
            const onEdge = sdfAbs < 3;
            const t = MathUtils.saturate(1 - sdfAbs / 30);
            const c = Color.sampleParticle(t);
            const alpha = MathUtils.lerp(0.30, 0.90, t);

            // Glow halo (larger, dimmer)
            if (onEdge) {
                const glowR = baseR * 3.5;
                const grad = _ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
                grad.addColorStop(0, Color.toCss(c.r, c.g, c.b, alpha * 0.6));
                grad.addColorStop(1, Color.toCss(c.r, c.g, c.b, 0));
                _ctx.fillStyle = grad;
                _ctx.beginPath();
                _ctx.arc(p.x, p.y, glowR, 0, MathUtils.TWO_PI);
                _ctx.fill();
            }

            // Core dot
            const r = baseR + (onEdge ? 0.5 : 0);
            _ctx.fillStyle = Color.toCss(c.r, c.g, c.b, alpha);
            _ctx.beginPath();
            _ctx.arc(p.x, p.y, r, 0, MathUtils.TWO_PI);
            _ctx.fill();
        }

        _ctx.globalCompositeOperation = COMP_NORMAL;
        _ctx.globalAlpha = 1;
    }

    /**
     * Draw spatial grid debug lines.
     */
    function drawGrid(cellSize) {
        if (!_ctx) return;
        const { SpatialHash } = window.SDFChisel;
        SpatialHash.debugRender(_ctx, _canvasW, _canvasH);
    }

    return { init, clearFrame, drawParticles, drawGrid, setShowTrails, resize };
})();

window.SDFChisel = window.SDFChisel || {};
window.SDFChisel.ParticleRenderer = ParticleRenderer;
