/**
 * ParticleEmitter.js – Handles spawning and repositioning particles
 * when text changes or a reset/scatter event occurs.
 */

const ParticleEmitter = (() => {
    'use strict';

    const { ParticlePool, Particle, MathUtils, Config } = window.SDFChisel;

    /**
     * Emit (spawn) n particles for new text at random positions.
     * @param {number} n – particle count
     * @param {number} canvasW
     * @param {number} canvasH
     * @returns {Array} particle pool
     */
    function emit(n, canvasW, canvasH) {
        return ParticlePool.spawn(n, canvasW, canvasH);
    }

    /**
     * Scatter all active particles randomly (preserve existing objects).
     * @param {Array} particles
     * @param {number} canvasW
     * @param {number} canvasH
     */
    function scatter(particles, canvasW, canvasH) {
        const cx = canvasW / 2, cy = canvasH / 2;
        const r = Math.min(canvasW, canvasH) * Config.PARTICLE.SCATTER_RADIUS;
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            if (!p.active) continue;
            const pos = MathUtils.randomInCircle(r);
            p.x = cx + pos.x;
            p.y = cy + pos.y;
            p.prevX = p.x; p.prevY = p.y;
            p.vx = MathUtils.randomGaussian(0, 2);
            p.vy = MathUtils.randomGaussian(0, 2);
            p.sdfVal = 0;
            p.converged = false;
        }
    }

    /**
     * Spawn new particles from a point origin (for click-based injection).
     * @param {Array} particles – pool to look for inactive slots
     * @param {number} ox – origin x
     * @param {number} oy – origin y
     * @param {number} count
     */
    function injectAt(particles, ox, oy, count = 20) {
        let injected = 0;
        for (let i = 0; i < particles.length && injected < count; i++) {
            if (particles[i].active) continue;
            const p = particles[i];
            const angle = MathUtils.random(0, MathUtils.TWO_PI);
            const r = MathUtils.random(2, 20);
            Particle.reset(p, ox + Math.cos(angle) * r, oy + Math.sin(angle) * r);
            injected++;
        }
        return injected;
    }

    return { emit, scatter, injectAt };
})();

window.SDFChisel = window.SDFChisel || {};
window.SDFChisel.ParticleEmitter = ParticleEmitter;
