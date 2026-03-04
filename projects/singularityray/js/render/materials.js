/**
 * SingularityRay JS - Render - Materials
 * Handles material properties and ID mapping for raymarching hits.
 */

import { Vec3 } from '../math/vec3.js';
import { ColorUtils } from './color_utils.js';

export const MatID = {
    NONE: 0,
    BLACK_HOLE: 1,
    ACCRETION_DISK: 2,
    BACKGROUND: 3,
    DEBUG: 99
};

export class MaterialSystem {
    /**
     * @param {import('../physics/accretion_disk.js').AccretionDisk} disk
     */
    constructor(disk) {
        this.diskRef = disk;
    }

    /**
     * Get base emission or albedo based on Hit ID
     * @param {number} id 
     * @param {Vec3} position
     * @returns {Vec3} Color RGB
     */
    getEmission(id, position) {
        if (id === MatID.BLACK_HOLE) {
            return new Vec3(0, 0, 0); // Vantablack
        }

        if (id === MatID.ACCRETION_DISK) {
            // Sample volumetric density
            const density = this.diskRef.sampleDensity(position);
            const intensityScale = this.diskRef.intensity * density;

            return ColorUtils.temperatureToRGB(intensityScale);
        }

        if (id === MatID.DEBUG) {
            return new Vec3(0.0, 1.0, 0.0); // Neon green
        }

        return new Vec3(0, 0, 0);
    }
}
