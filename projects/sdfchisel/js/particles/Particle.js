/**
 * Particle.js – Single particle data structure used by the physics system.
 * Kept as a plain object for cache-friendly iteration.
 */

const Particle = (() => {
    'use strict';

    const { MathUtils } = window.SDFChisel;

    /**
     * Create a new particle at (x, y) with optional velocity.
     */
    function create(x, y, vx = 0, vy = 0) {
        return {
            x, y,           // position (canvas px)
            vx, vy,         // velocity (canvas px / frame)
            prevX: x,       // previous position (for trail rendering)
            prevY: y,
            sdfVal: 0,     // current SDF value at position
            speed: 0,     // |velocity| magnitude
            converged: false,
            active: true,
            age: 0,     // frame counter
            radius: 1.4,   // render radius
            colorT: Math.random(), // palette interpolation parameter
        };
    }

    /**
     * Reset a particle to a new position (reuse from pool).
     */
    function reset(p, x, y) {
        p.x = x; p.y = y;
        p.prevX = x; p.prevY = y;
        p.vx = MathUtils.randomGaussian(0, 0.8);
        p.vy = MathUtils.randomGaussian(0, 0.8);
        p.sdfVal = 0;
        p.speed = 0;
        p.converged = false;
        p.active = true;
        p.age = 0;
        p.colorT = Math.random();
    }

    /**
     * Advance particle age and record previous position.
     */
    function tick(p) {
        p.prevX = p.x;
        p.prevY = p.y;
        p.age++;
    }

    /**
     * Deactivate a particle (returns it to the pool conceptually).
     */
    function deactivate(p) {
        p.active = false;
    }

    return { create, reset, tick, deactivate };
})();

window.SDFChisel = window.SDFChisel || {};
window.SDFChisel.Particle = Particle;
