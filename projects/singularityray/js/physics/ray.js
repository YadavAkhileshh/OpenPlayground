/**
 * SingularityRay JS - Physics - Ray
 * Defines a structural Ray holding position, direction, and payload
 * used intensively in the CPU raymarching loop.
 */

import { Vec3 } from '../math/vec3.js';

export class Ray {
    /**
     * @param {Vec3} origin
     * @param {Vec3} direction
     */
    constructor(origin = new Vec3(), direction = new Vec3(0, 0, -1)) {
        this.origin = origin.clone();
        this.direction = direction.clone();

        // Ray payload for progressive modification along path
        this.luminosity = 1.0;
        this.color = new Vec3(0, 0, 0); // Accumulated light
        this.steps = 0;
        this.traveled = 0.0;
        this.isAbsorbed = false;

        // The previous position is useful for bending calculation
        this.prevPosition = origin.clone();
    }

    /**
     * Copy data from another ray
     * @param {Ray} r
     */
    copy(r) {
        this.origin.copy(r.origin);
        this.direction.copy(r.direction);
        this.luminosity = r.luminosity;
        this.color.copy(r.color);
        this.steps = r.steps;
        this.traveled = r.traveled;
        this.isAbsorbed = r.isAbsorbed;
        this.prevPosition.copy(r.prevPosition);
        return this;
    }

    /**
     * Reset ray state for a new sample
     * @param {Vec3} o 
     * @param {Vec3} d 
     */
    reset(o, d) {
        this.origin.copy(o);
        this.direction.copy(d);
        this.prevPosition.copy(o);
        this.luminosity = 1.0;
        this.color.set(0, 0, 0);
        this.steps = 0;
        this.traveled = 0.0;
        this.isAbsorbed = false;
        return this;
    }

    /**
     * Compute the point along the ray at distance t
     * @param {number} t
     * @param {Vec3} target Optional target vector to store result
     * @returns {Vec3}
     */
    at(t, target = new Vec3()) {
        target.copy(this.origin);
        return target.add(
            new Vec3(
                this.direction.x * t,
                this.direction.y * t,
                this.direction.z * t
            )
        );
    }
}
