/**
 * SingularityRay JS - Render - Raymarcher
 * The Core Engine CPU iteration loop driving gravity and collision checks.
 */

import { Vec3 } from '../math/vec3.js';
import { MAX_MARCH_STEPS, MAX_RAY_DIST, MIN_SURF_DIST } from '../math/constants.js';
import { applyGravitationalBending } from '../physics/gravity.js';
import { SpaceDistortion } from '../physics/space_distortion.js';
import { MatID } from './materials.js';

export class Raymarcher {
    /**
     * @param {Function} mapFunc Scene SDF function: (p) => {dist, id}
     * @param {import('../physics/blackhole.js').BlackHole} blackHole
     * @param {import('../physics/accretion_disk.js').AccretionDisk} disk
     * @param {import('./materials.js').MaterialSystem} materials
     * @param {import('./texture_gen.js').TextureGenerator} envMap
     */
    constructor(mapFunc, blackHole, disk, materials, envMap) {
        this.mapFunc = mapFunc;
        this.blackHole = blackHole;
        this.disk = disk;
        this.materials = materials;
        this.envMap = envMap;

        // Settings driven by UI
        this.maxSteps = MAX_MARCH_STEPS;
        this.debugRays = false;

        // Memory pools for inner loop
        this.currentPos = new Vec3();
        this.tempVec = new Vec3();
    }

    setSteps(val) { this.maxSteps = val; }
    setDebug(val) { this.debugRays = val; }

    /**
     * Executes the raymarch loop for a single ray.
     * This is the hottest function in the entire program.
     * @param {import('../physics/ray.js').Ray} ray 
     * @returns {Vec3} Final RGB Float Color
     */
    march(ray) {
        let t = 0.0;
        let finalColor = new Vec3(0, 0, 0);
        let transmittance = 1.0;

        const bhPos = this.blackHole.position;
        const mass = this.blackHole.mass;
        const rs = this.blackHole.getEventHorizon();

        for (let i = 0; i < this.maxSteps; i++) {
            ray.steps = i;

            // Advance ray via velocity
            this.currentPos.copy(ray.origin).add(
                this.tempVec.copy(ray.direction).multiplyScalar(t)
            );

            // Apply non-linear geodesic curvature
            // We bend the ray based on the distance step just taken
            applyGravitationalBending(ray, bhPos, mass, t);

            // If the ray entered the event horizon
            if (ray.isAbsorbed) {
                // Pitch black
                break;
            }

            // Ray has escaped the physics area, sample starfield
            if (t > MAX_RAY_DIST) {
                // Apply final environment mapping considering bending
                const bg = this.envMap.sampleEnvironment(ray.direction);
                finalColor.add(bg.multiplyScalar(transmittance));
                break;
            }

            // Get scene distance
            const mapRes = this.mapFunc(this.currentPos, mass);

            // Volumetric integration for the accretion disk
            // Instead of stopping at the surface, we step through it and accumulate light
            if (mapRes.id === MatID.ACCRETION_DISK) {
                // We are inside or on the bounding volume of the disk
                // Force small step sizes inside the volume to integrate density properly
                const stepSize = Math.max(0.05, Math.abs(mapRes.dist) * 0.5);
                t += stepSize;

                // Sample specific density
                const density = this.disk.sampleDensity(this.currentPos);

                if (density > 0.001) {
                    // Accumulate Light
                    const baseColor = this.materials.getEmission(MatID.ACCRETION_DISK, this.currentPos);

                    // Apply relativistic Doppler boosting (blue turning, red receding)
                    const dopplerShift = SpaceDistortion.computeDopplerShift(this.currentPos, ray.direction);
                    const dopplerFactor = Math.max(0.1, 1.0 + dopplerShift * 0.8);
                    baseColor.multiplyScalar(dopplerFactor);

                    // Apply Gravitational redshift (time dilation near BH dims the disk)
                    const distToCenter = this.currentPos.length();
                    const redshift = SpaceDistortion.computeGravitationalRedshift(distToCenter, rs);
                    baseColor.multiplyScalar(redshift);

                    // Alpha blending
                    const alpha = density * 0.15; // Optical thickness
                    const addedColor = baseColor.multiplyScalar(alpha * transmittance);
                    finalColor.add(addedColor);

                    transmittance *= (1.0 - alpha);

                    // If fully opaque, stop tracking
                    if (transmittance <= 0.01) {
                        break;
                    }
                }
            } else {
                // Empty space, step by SDF distance
                // To prevent skipping over thin disks when bent, limit max step size dynamically
                // based on distance to the black hole
                const safeStep = Math.max(MIN_SURF_DIST, mapRes.dist * 0.8);
                t += safeStep;
            }

            ray.traveled = t;
        }

        // Optional debug visualization: color by step count
        if (this.debugRays) {
            const heat = ray.steps / this.maxSteps;
            return new Vec3(heat, heat * 0.5, 1.0 - heat);
        }

        return finalColor;
    }
}
