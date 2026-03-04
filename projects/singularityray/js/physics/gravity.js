/**
 * SingularityRay JS - Physics - Gravity
 * Simulates gravitational pull and applies non-linear bending
 * to the ray's direction vector towards the black hole singularity.
 */

import { Vec3 } from '../math/vec3.js';
import { LENSING_STRENGTH, MIN_SURF_DIST } from '../math/constants.js';

/**
 * Applies geodesic bending to a light ray passing near a massive object.
 * This is an approximation of Schwarzschild metric geodesics, tailored
 * for real-time CPU performance while maintaining visual authenticity.
 * 
 * @param {import('./ray.js').Ray} ray The active ray
 * @param {Vec3} singularityPos Position of the black hole
 * @param {number} mass The mass (M) multiplier shaping the curve
 * @param {number} stepDist Distance advanced in the current step
 */
export function applyGravitationalBending(ray, singularityPos, mass, stepDist) {
    if (ray.isAbsorbed) return;

    // Vector from ray position to singularity
    const toSingularity = new Vec3();
    toSingularity.copy(singularityPos).sub(ray.origin);

    // Distance squared for inverse-square falloff calculation
    const distSq = toSingularity.lengthSq();

    // Safety check to prevent division by zero or infinite forces at center
    if (distSq < MIN_SURF_DIST) {
        ray.isAbsorbed = true;
        return;
    }

    // Distance to singularity
    const dist = Math.sqrt(distSq);
    toSingularity.divideScalar(dist); // Normalize toSingularity vector

    // The force magnitude. 
    // Real curvature is complex, but an inverse square radial pull 
    // multiplied by the cross product of velocity and radius gives a beautiful orbit.
    // For pure cinematic visualization, we bend the direction vector directly.
    const forceStr = (mass * LENSING_STRENGTH) / distSq;

    // Calculate the bending vector
    // Force is applied perpendicular to velocity, towards the center
    // Bending amount is proportional to the distance stepped.
    const bendAmount = forceStr * stepDist;

    // Apply bend
    const bendVec = toSingularity.multiplyScalar(bendAmount);
    ray.direction.add(bendVec);

    // Restore length (light always travels at C=1)
    ray.direction.normalize();
}
