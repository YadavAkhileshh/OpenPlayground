/**
 * ForceField.js – Computes and accumulates all forces acting on a particle.
 * Includes gradient descent force, boundary repulsion, and noise perturbation.
 */

const ForceField = (() => {
    'use strict';

    const { NumericalGradient, SDFSampler, PotentialMap, MathUtils, Config } = window.SDFChisel;

    // Internal noise seed
    const lcg = MathUtils.makeLCG(42);

    /**
     * Compute total force vector for a particle at (cx, cy).
     * @param {number} cx
     * @param {number} cy
     * @param {number} speed – convergence speed [0..1]
     * @param {number} canvasW
     * @param {number} canvasH
     * @returns {{ fx: number, fy: number, sdfVal: number }}
     */
    function computeForce(cx, cy, speed, canvasW, canvasH) {
        if (!SDFSampler.isReady()) return { fx: 0, fy: 0, sdfVal: 0 };

        const sdfVal = SDFSampler.sample(cx, cy);

        // ── Gradient descent force (main attraction) ─────────────────────────
        let fx = 0, fy = 0;

        if (PotentialMap.isReady()) {
            // Use precomputed potential map for performance
            const { nx, ny } = PotentialMap.sampleGradient(cx, cy);
            // Force direction: negative SDF = inside → stay; positive SDF = outside → pull in
            const scale = speed * MathUtils.clamp(Math.abs(sdfVal) * 0.12, 0.02, 3.0);
            // Move opposite to gradient to descend toward zero-crossing
            const dir = sdfVal > 0 ? -1 : (sdfVal < -0.5 ? 1 : 0);
            fx += nx * scale * dir;
            fy += ny * scale * dir;
        } else {
            // Fallback: compute gradient on the fly
            const { fx: gdx, fy: gdy, sdfVal: sv } = NumericalGradient.descentForce(cx, cy, speed);
            fx += gdx;
            fy += gdy;
        }

        // ── Boundary repulsion (keep particles inside canvas) ─────────────────
        const margin = 20;
        if (cx < margin) fx += (margin - cx) * 0.15;
        if (cx > canvasW - margin) fx -= (cx - (canvasW - margin)) * 0.15;
        if (cy < margin) fy += (margin - cy) * 0.15;
        if (cy > canvasH - margin) fy -= (cy - (canvasH - margin)) * 0.15;

        // ── Small noise perturbation for organic motion ────────────────────────
        const noise = 0.04 * speed;
        fx += (lcg() - 0.5) * noise;
        fy += (lcg() - 0.5) * noise;

        return { fx, fy, sdfVal };
    }

    /**
     * Scatter force: push a particle to a random position in the canvas.
     * Used when resetting / scattering.
     */
    function scatterForce(cx, cy, canvasW, canvasH) {
        const targetX = MathUtils.random(canvasW * 0.05, canvasW * 0.95);
        const targetY = MathUtils.random(canvasH * 0.05, canvasH * 0.95);
        const dx = targetX - cx, dy = targetY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy) + 1;
        const scale = Config.PARTICLE.SCATTER_FORCE;
        return { fx: (dx / dist) * scale, fy: (dy / dist) * scale };
    }

    /**
     * Wall bounce force (elastic reflection from canvas borders).
     */
    function wallBounce(particle, canvasW, canvasH, restitution = 0.6) {
        const p = particle;
        if (p.x < 0) { p.x = 0; p.vx = Math.abs(p.vx) * restitution; }
        if (p.x > canvasW) { p.x = canvasW; p.vx = -Math.abs(p.vx) * restitution; }
        if (p.y < 0) { p.y = 0; p.vy = Math.abs(p.vy) * restitution; }
        if (p.y > canvasH) { p.y = canvasH; p.vy = -Math.abs(p.vy) * restitution; }
    }

    return {
        computeForce,
        scatterForce,
        wallBounce,
    };
})();

window.SDFChisel = window.SDFChisel || {};
window.SDFChisel.ForceField = ForceField;
