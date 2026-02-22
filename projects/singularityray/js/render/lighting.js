/**
 * SingularityRay JS - Render - Lighting
 * Handles normal computation and ambient shading where applicable.
 */

import { Vec3 } from '../math/vec3.js';

export class LightingSystem {
    constructor() {
        this.ambientLight = new Vec3(0.02, 0.02, 0.05); // faint galactic glow
    }

    /**
     * Compute surface normal at a point using SDF gradient approximation.
     * Often called exactly at the surface hit point.
     * @param {Function} mapFunc The SDF scene map function
     * @param {Vec3} p Hit position
     * @returns {Vec3} Normalized surface normal
     */
    estimateNormal(mapFunc, p) {
        const eps = 0.001;
        const eX = new Vec3(eps, 0, 0);
        const eY = new Vec3(0, eps, 0);
        const eZ = new Vec3(0, 0, eps);

        // N = normalize( vec3( map(p+e.xyy)-map(p-e.xyy), map(p+e.yxy)-map(p-e.yxy), map(p+e.yyx)-map(p-e.yyx) ) );
        const nx = mapFunc(Vec3.addVectors(p, eX)).dist - mapFunc(Vec3.subVectors(p, eX)).dist;
        const ny = mapFunc(Vec3.addVectors(p, eY)).dist - mapFunc(Vec3.subVectors(p, eY)).dist;
        const nz = mapFunc(Vec3.addVectors(p, eZ)).dist - mapFunc(Vec3.subVectors(p, eZ)).dist;

        return new Vec3(nx, ny, nz).normalize();
    }
}
