/**
 * LindenArboretum - Physics Engine Module
 * Ties together Wind, Oscillators, and Damping to provide a final
 * rotational offset that the renderer applies to the turtle at each step.
 * 
 * =========================================================================
 * PHYSICS OVERVIEW:
 * 
 * Standard L-Systems are static structural representations. To bring them
 * to life, we inject procedural "wind" that distorts the turtle graphic's
 * angle upon rendering. Since the tree is rendered every single frame at 60fps,
 * changing the turtle's rotation incrementally creates fluid simulation.
 * 
 * The total force applied to any given branch node is a compound function:
 * F(total) = (Gust_Force + Sway_Force) * Damp_Factor
 * 
 * 1. Gust_Force (WindManager):
 *    Driven by a 1D Perlin noise map sliding over time. Gives the chaotic
 *    "rushes" of wind that affect the entire plant simultaneously.
 * 
 * 2. Sway_Force (Oscillator):
 *    A simple trigonometric sine wave that provides a constant underlying
 *    mechanical rhythm. Represents the natural resonant frequency of long 
 *    slender branches swinging back and forth like pendulums.
 * 
 * 3. Damp_Factor (DampingManager):
 *    Crucial for realism. The base trunk (Depth 0) is thick and should barely
 *    budge, while the outermost leaves/twigs (Depth Maximum) are light and
 *    whipped around violently. We map depth to stiffness using an exponential
 *    curve (e.g. x^3) to ensure stiffness primarily drops off at the very tips.
 * 
 * =========================================================================
 */

import { WindManager } from './wind.js';
import { Oscillator } from './oscillator.js';
import { dampingManager } from './damping.js';

export class PhysicsEngine {
    constructor() {
        // Initialize sub-systems
        this.wind = new WindManager();
        this.oscillator = new Oscillator();

        // Setup default mechanical sway
        // 2.0 rad/s frequency creates a nice rapid vibration
        // 0.05 rad amplitude is tiny, but multiplies on long branches
        this.oscillator.set(2.0, 0.05);

        this.time = 0; // Accumulates delta time in seconds

        // Future Expansion:
        // Gravity scalar applying downward bias
        // this.gravity = 0.05; 
    }

    /**
     * Updates all physics subsystems. Called once per frame inside main loop.
     * @param {number} deltaTimeMs - Time since last frame in milliseconds.
     */
    update(deltaTimeMs) {
        this.wind.update(deltaTimeMs);
        this.time += deltaTimeMs * 0.001; // Convert to seconds
    }

    /**
     * Called by the renderer during tree traverse.
     * Returns an angle offset to apply to the turtle.
     * 
     * @param {number} currentDepth - Branch depth (0 is trunk).
     * @param {number} maxTreeDepth - The deepest point of the plant.
     * @returns {number} Angle offset in radians.
     */
    getWindOffset(currentDepth, maxTreeDepth) {
        // Trunk doesn't bend. Early exit optimization.
        if (currentDepth === 0 || maxTreeDepth === 0) return 0;

        // Get stiffness multiplier (0 = stiff, 1 = flexible)
        const damping = dampingManager.getDepthDamping(currentDepth, maxTreeDepth);
        if (damping === 0) return 0;

        // Retrieve coherent noise gust force
        const gust = this.wind.getGustFactor();

        // Retrieve sinusoidal mechanical sway
        const sway = this.oscillator.evaluate(this.time);

        // Combine forces.
        // We multiply gust by 0.2 to scale it appropriately alongside the sway.
        const totalForce = (gust * 0.2) + sway;

        // Multiply by structural flexibility to ground the tree.
        return totalForce * damping;
    }
}
