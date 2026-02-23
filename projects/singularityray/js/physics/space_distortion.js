/**
 * SingularityRay JS - Physics - Space Distortion
 * Advanced aggregation module that binds gravity mechanics and the ray path.
 * Applies visual relativistic effects combining redshift and intensity mapping.
 */

import { MathUtils } from '../math/utils.js';

export const SpaceDistortion = {
    /**
     * Compute Doppler redshift / blueshift proxy for accretion disk sides
     * The side of the disk rotating towards camera appears brighter and bluer,
     * the receding side appears dimmer and redder.
     * 
     * @param {import('../math/vec3.js').Vec3} point Point in disk
     * @param {import('../math/vec3.js').Vec3} viewDir Camera view ray direction
     * @returns {number} Shift multiplier (-1 to 1 proxy)
     */
    computeDopplerShift: (point, viewDir) => {
        // Disk lies primarily in XZ plane, rotating around Y axis
        // Tangent vector to the circular orbit
        const r = Math.sqrt(point.x * point.x + point.z * point.z);
        if (r < 0.001) return 0.0;

        // Counter-clockwise orbital velocity vector
        const velocity = { x: -point.z / r, y: 0.0, z: point.x / r };

        // Dot product between orbital velocity and view direction
        // If they align, gas is moving towards camera
        const shift = velocity.x * viewDir.x + velocity.y * viewDir.y + velocity.z * viewDir.z;

        // In physical systems, approaching gas gets beamed forward
        // making it significantly brighter.
        return MathUtils.clamp(shift, -1.0, 1.0);
    },

    /**
     * Calculate gravitational redshift (time dilation) effect
     * Closer to event horizon, light loses energy escaping the gravity well
     * shifting color redwards and reducing luminosity
     * 
     * @param {number} distanceFromSingularity 
     * @param {number} schwarzschildRadius 
     * @returns {number} Energy retention multiplier (0.0 to 1.0)
     */
    computeGravitationalRedshift: (distanceFromSingularity, schwarzschildRadius) => {
        // Time dilation factor approximates sqrt(1 - rs/r) for non-rotating
        if (distanceFromSingularity <= schwarzschildRadius * 1.01) {
            return 0.0; // Infinite redshift at horizon
        }

        const ratio = schwarzschildRadius / distanceFromSingularity;
        const energy = Math.sqrt(1.0 - ratio);

        return MathUtils.clamp(energy, 0.0, 1.0);
    }
}
