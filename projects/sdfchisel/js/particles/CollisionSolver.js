/**
 * CollisionSolver.js – Particle-particle collision avoidance.
 * Uses the spatial hash to find nearby particles and apply repulsion forces.
 */

const CollisionSolver = (() => {
    'use strict';

    const { SpatialHash, MathUtils } = window.SDFChisel;

    /**
     * Resolve collisions for all particles using the spatial hash.
     * Applies spring-like repulsion between overlapping particles.
     *
     * @param {Array} particles
     * @param {number} radius – collision radius (canvas px)
     * @param {number} strength – repulsion force magnitude
     */
    function resolveAll(particles, radius, strength = 0.35) {
        const diameter = radius * 2;
        const diamSq = diameter * diameter;

        for (let i = 0; i < particles.length; i++) {
            const pi = particles[i];
            if (!pi.active) continue;

            const { buf, count } = SpatialHash.query(pi.x, pi.y, diameter, particles);
            for (let k = 0; k < count; k++) {
                const j = buf[k];
                if (j <= i) continue; // Process each pair once
                const pj = particles[j];
                if (!pj.active) continue;

                const dx = pj.x - pi.x;
                const dy = pj.y - pi.y;
                const dSq = dx * dx + dy * dy;
                if (dSq < 1e-10 || dSq >= diamSq) continue;

                const dist = Math.sqrt(dSq);
                const overlap = diameter - dist;
                const fx = (dx / dist) * overlap * strength * 0.5;
                const fy = (dy / dist) * overlap * strength * 0.5;

                pi.vx -= fx; pi.vy -= fy;
                pj.vx += fx; pj.vy += fy;
            }
        }
    }

    /**
     * Single-pass positional correction (faster, no velocity, used for very dense packing).
     */
    function positionalCorrect(particles, radius) {
        const diameter = radius * 2;
        const diamSq = diameter * diameter;

        for (let i = 0; i < particles.length; i++) {
            const pi = particles[i];
            if (!pi.active) continue;

            const { buf, count } = SpatialHash.query(pi.x, pi.y, diameter, particles);
            for (let k = 0; k < count; k++) {
                const j = buf[k];
                if (j <= i) continue;
                const pj = particles[j];
                if (!pj.active) continue;
                const dx = pj.x - pi.x, dy = pj.y - pi.y;
                const dSq = dx * dx + dy * dy;
                if (dSq < 1e-10 || dSq >= diamSq) continue;
                const dist = Math.sqrt(dSq);
                const corr = (diameter - dist) / dist * 0.4;
                pi.x -= dx * corr * 0.5; pi.y -= dy * corr * 0.5;
                pj.x += dx * corr * 0.5; pj.y += dy * corr * 0.5;
            }
        }
    }

    return { resolveAll, positionalCorrect };
})();

window.SDFChisel = window.SDFChisel || {};
window.SDFChisel.CollisionSolver = CollisionSolver;
