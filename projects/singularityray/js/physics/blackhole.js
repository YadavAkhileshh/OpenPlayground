/**
 * SingularityRay JS - Physics - Black Hole
 * Implementation logic that models the event horizon
 * and the surrounding metrics for pure CPU rendering.
 */

import { SDFPrimitives } from './sdf_primitives.js';
import { Schwarzschild_R } from '../math/constants.js';
import { Vec3 } from '../math/vec3.js';

export class BlackHole {
    /**
     * @param {Vec3} position 
     * @param {number} mass Multiplier for the event horizon size
     */
    constructor(position = new Vec3(0, 0, 0), mass = 1.0) {
        this.position = position;
        this.mass = mass;
    }

    /**
     * Update the mass representing the gravity well depth
     * @param {number} mass 
     */
    setMass(mass) {
        this.mass = mass;
    }

    /**
     * Return the effective radius of the event horizon.
     * Anything crossing this threshold in raymarching is considered absorbed
     * and will cease iterating, painting pitch black.
     * @returns {number}
     */
    getEventHorizon() {
        return Schwarzschild_R * this.mass;
    }

    /**
     * Calculate the SDF to the Event Horizon boundary
     * @param {Vec3} point 
     * @returns {number} Distance to the singularity shell
     */
    mapEventHorizon(point) {
        // Translate point relative to black hole position
        const localPoint = new Vec3(
            point.x - this.position.x,
            point.y - this.position.y,
            point.z - this.position.z
        );

        // Standard sphere SDF using the current event horizon radius
        return SDFPrimitives.sphere(localPoint, this.getEventHorizon());
    }

    /**
     * Maps the photon shell, the unstable radius where light orbits indefinitely.
     * Used for creating the thin bright ring right outside the shadow.
     * @param {Vec3} point 
     * @returns {number} 
     */
    mapPhotonSphere(point) {
        const localPoint = new Vec3(
            point.x - this.position.x,
            point.y - this.position.y,
            point.z - this.position.z
        );

        // Photon sphere sits roughly at 1.5 * Schwarzschild_R
        const r = this.getEventHorizon() * 1.5;

        // This is returned as a shell rather than a solid volume
        const dist = SDFPrimitives.sphere(localPoint, r);
        // Take absolute value to represent a hollow shell of 0 thickness
        return Math.abs(dist) - 0.05;
    }
}
