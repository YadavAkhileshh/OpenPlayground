/**
 * LindenArboretum - Wind Module
 * Models global wind force vectors that change over time
 * using simplex-like noise to create gusting effects.
 * 
 * =========================================================================
 * FLUID DYNAMICS APPROXIMATION:
 * 
 * True fluid dynamics (Navier-Stokes equations) are computationally 
 * impossible to run in real-time in JavaScript alongside a recursive 
 * fractal rendering engine. We can't actually simulate particles of air 
 * pushing against the branches.
 * 
 * Instead, we use an Eulerian-style approximation using a Noise Field.
 * Imagine the plant existing in a 2D space. The wind isn't a constant 
 * vector [1, 0] pushing it right. It's a field of swirling turbulence.
 * 
 * By moving a sampling point through a 1D slice of 3D Perlin Noise over time 
 * (like dragging a needle across a record), we get a smoothly transitioning 
 * scalar value.
 * 
 * `gust = noise1D(time * speed)`
 * 
 * This scalar tells us how "hard" the wind is blowing right now.
 * 
 * The `globalStrength` multiplier is hooked up directly to the UI slider.
 * When it is 0, the noise still evaluates, but its influence is zeroed out.
 * When it is 2.0 (hurricane mode), the noise heavily distorts the turtle's
 * drawing angles, making the tree bend violently.
 * 
 * =========================================================================
 * FUTURE CONSIDERATIONS:
 * 
 * 1. 2D Sampling: Currently we use 1D sampling so the whole tree feels the
 *    same gust at the same time. If we sampled in 2D using the branch's raw
 *    [X,Y] coordinates, the left side of the tree could get hit by a gust 
 *    before the right side, creating a beautiful rippling wave effect.
 *    (Omitted in 1.0.0 for pure CPU rendering performance).
 * 
 * 2. Directional Bias: `baseDirection` is currently assumed to be purely 
 *    horizontal. We could use a Vec2 instead to apply vertical drafts.
 */

import { NoiseGenerator } from '../math/noise.js';

export class WindManager {
    constructor() {
        // Create a unique seeded noise instance for the wind
        // A random multiplier ensures wind patterns differ slightly on page load
        this.noiseGen = new NoiseGenerator(Math.random() * 1000);

        // The baseline multiplier for wind forces
        // 0.0 = still air
        // 1.0 = heavy storm
        this.globalStrength = 0.5;

        // Base directional angle (e.g., wind blowing to the right)
        // Not fully implemented in coordinate transforms yet, assumes horizontal.
        this.baseDirection = 0;

        // Time accumulator. Advances every frame.
        this.time = 0;
    }

    /**
     * Updates the wind field over time.
     * Called by PhysicsEngine.update() every requestAnimationFrame cycle.
     * @param {number} deltaTime - Milliseconds since last frame
     */
    update(deltaTime) {
        // We multiply by 0.001 to convert to seconds, treating time as 
        // our coordinate along the noise tensor.
        this.time += deltaTime * 0.001;
    }

    /**
     * Sets overall wind slider strength.
     * Directly called by the slider bindings in app.js
     * @param {number} strength - Float bounded by UI rules.
     */
    setStrength(strength) {
        this.globalStrength = strength;
    }

    /**
     * Gets the raw wind influence offset at a given point in time.
     * We feed the global time into the 1D noise function to get smooth natural gusts.
     * 
     * @returns {number} The strength scalar, primarily positive.
     */
    getGustFactor() {
        // Noise mapped from [-1, 1] to roughly [0, 1] for positive gusts
        // Time is scaled by 0.5 to slow down the turbulence "speed".
        // The result is multiplied by the global strength slider setting.
        const noiseVal = this.noiseGen.noise1D(this.time * 0.5);
        return (noiseVal + 1) * 0.5 * this.globalStrength;
    }
}
