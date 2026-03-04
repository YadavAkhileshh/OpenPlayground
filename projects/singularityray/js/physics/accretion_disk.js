/**
 * SingularityRay JS - Physics - Accretion Disk
 * Modeling the relativistic ring of gas orbiting the black hole.
 * We use an SDF torus embedded with volumetric noise density mapping.
 */

import { SDFPrimitives } from './sdf_primitives.js';
import { Vec2 } from '../math/vec2.js';
import { Vec3 } from '../math/vec3.js';
import { MathUtils } from '../math/utils.js';

export class AccretionDisk {
    /**
     * @param {Vec3} center Position, typically matching the BH
     * @param {number} innerRadius Where the disk starts (usually outside ISCO)
     * @param {number} outerRadius Where the disk tapers off
     */
    constructor(center = new Vec3(0, 0, 0), innerRadius = 3.0, outerRadius = 8.0) {
        this.center = center;
        this.innerRadius = innerRadius;
        this.outerRadius = outerRadius;

        // Rendering intensity
        this.intensity = 1.0;
        // Gas turbulent density multiplier
        this.density = 1.0;

        // The cross-sectional height of the disk
        this.thickness = 0.2;
    }

    setIntensity(val) {
        this.intensity = val;
    }

    /**
     * Simple SDF envelope of the accretion disk area.
     * If a ray enters this bounded volume, we perform volumetric integration.
     * @param {Vec3} point 
     * @param {number} currentMass Scales with BH mass
     * @returns {number}
     */
    mapEnvelope(point, currentMass) {
        const localP = new Vec3(
            point.x - this.center.x,
            point.y - this.center.y,
            point.z - this.center.z
        );

        // Disk size scales with mass
        const scaledInner = this.innerRadius * currentMass;
        const scaledOuter = this.outerRadius * currentMass;

        // Calculate torus parameters
        // x = middle radius, y = cross section radius
        const midRadius = (scaledInner + scaledOuter) * 0.5;
        const width = (scaledOuter - scaledInner) * 0.5;

        // Flatten the torus drastically via the y distance factor
        localP.y *= 5.0; // Squish factor to make it a disk rather than a thick doughnut

        const torusParams = new Vec2(midRadius, this.thickness);

        return SDFPrimitives.torus(localP, torusParams);
    }

    /**
     * Provide a pseudo-density field for volumetric shading inside the disk
     * Uses analytic approximations of turbulence based on spatial position
     * @param {Vec3} point 
     * @returns {number} Density value [0.0 - 1.0]
     */
    sampleDensity(point) {
        const localP = new Vec3(
            point.x - this.center.x,
            point.y - this.center.y,
            point.z - this.center.z
        );

        const distFromCenter = localP.length();
        if (distFromCenter < this.innerRadius || distFromCenter > this.outerRadius) {
            return 0.0;
        }

        // Radial falloff: densest in the middle of the band, tapering off at edges
        const midPoint = (this.innerRadius + this.outerRadius) * 0.5;
        const width = this.outerRadius - this.innerRadius;
        const normalizedRadialDist = Math.abs(distFromCenter - midPoint) / (width * 0.5);

        // Inverse parabola falloff [1 at mid, 0 at edges]
        const radialFalloff = Math.max(0.0, 1.0 - (normalizedRadialDist * normalizedRadialDist));

        // Vertical falloff: thinner towards edges
        const verticalDist = Math.abs(localP.y);
        const verticalFalloff = Math.max(0.0, 1.0 - (verticalDist / this.thickness));

        // High frequency variation (procedural stripes simulation)
        // Angular offset
        let angle = Math.atan2(localP.z, localP.x);
        // Simple sin wave distortion representing orbiting bands
        const banding = Math.sin(distFromCenter * 10.0 - angle * 3.0) * 0.5 + 0.5;

        // Combining densities
        const finalDensity = radialFalloff * verticalFalloff * (0.5 + 0.5 * banding);

        return MathUtils.clamp(finalDensity * this.density, 0.0, 1.0);
    }
}
