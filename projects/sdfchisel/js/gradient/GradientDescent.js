/**
 * GradientDescent.js – Per-particle gradient descent update logic.
 * Applies force field results to velocity and position using semi-implicit Euler.
 */

const GradientDescent = (() => {
    'use strict';

    const { ForceField, MathUtils, Config } = window.SDFChisel;

    /**
     * Update a single particle for one time step using gradient descent.
     * Modifies particle.x, particle.y, particle.vx, particle.vy in place.
     * @param {Particle} p
     * @param {number} dt – delta time (seconds)
     * @param {number} speed – convergence speed
     * @param {number} canvasW
     * @param {number} canvasH
     * @param {boolean} scatter – if true, apply scatter force instead
     */
    function step(p, dt, speed, canvasW, canvasH, scatter = false) {
        let fx, fy, sdfVal;

        if (scatter) {
            const sf = ForceField.scatterForce(p.x, p.y, canvasW, canvasH);
            fx = sf.fx; fy = sf.fy; sdfVal = p.sdfVal;
        } else {
            const f = ForceField.computeForce(p.x, p.y, speed, canvasW, canvasH);
            fx = f.fx; fy = f.fy; sdfVal = f.sdfVal;
        }

        p.sdfVal = sdfVal;

        // Semi-implicit Euler integration
        const mass = 1.0;
        const dtSec = Math.min(dt, 1 / 30);

        p.vx = (p.vx + (fx / mass) * dtSec) * Config.PARTICLE.DAMPING;
        p.vy = (p.vy + (fy / mass) * dtSec) * Config.PARTICLE.DAMPING;

        // Clamp velocity
        const maxV = Config.PARTICLE.MAX_VELOCITY;
        p.vx = MathUtils.clampAbs(p.vx, maxV);
        p.vy = MathUtils.clampAbs(p.vy, maxV);

        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Wall bounce
        ForceField.wallBounce(p, canvasW, canvasH);

        // Update speed stat
        p.speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    }

    /**
     * Batch update an array of particles.
     * Returns convergence statistics: { convergedCount, avgSdf }.
     */
    function stepAll(particles, dt, speed, canvasW, canvasH, scatter) {
        let convergedCount = 0;
        let sdfSum = 0;
        const threshold = Config.PARTICLE.CONVERGED_THRESH;

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            if (!p.active) continue;
            step(p, dt, speed, canvasW, canvasH, scatter);
            if (Math.abs(p.sdfVal) < threshold) {
                convergedCount++;
                p.converged = true;
            } else {
                p.converged = false;
            }
            sdfSum += p.sdfVal;
        }

        return {
            convergedCount,
            total: particles.length,
            avgSdf: particles.length ? sdfSum / particles.length : 0,
        };
    }

    /**
     * Apply a single scatter impulse to all active particles.
     */
    function scatterAll(particles, canvasW, canvasH) {
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            if (!p.active) continue;
            p.x = MathUtils.random(canvasW * 0.05, canvasW * 0.95);
            p.y = MathUtils.random(canvasH * 0.05, canvasH * 0.95);
            p.vx = MathUtils.randomGaussian(0, 1.5);
            p.vy = MathUtils.randomGaussian(0, 1.5);
            p.sdfVal = 0;
            p.converged = false;
        }
    }

    return {
        step,
        stepAll,
        scatterAll,
    };
})();

window.SDFChisel = window.SDFChisel || {};
window.SDFChisel.GradientDescent = GradientDescent;
