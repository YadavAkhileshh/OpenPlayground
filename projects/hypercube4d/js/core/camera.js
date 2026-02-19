/**
 * @file camera.js
 * @description Manages the projection of 4D coordinates to 3D, and then 3D to 2D screen coordinates.
 * Handles perspective calculations and camera parameters.
 */

import { Vector4 } from '../math/vector4.js';

export class Camera {
    constructor() {
        // Camera distance in 4D space (distance from "flat" 3D hyperplane)
        this.wDistance = 2.0;

        // Camera distance in 3D space (standard 3D rendering perspective)
        this.zDistance = 5.0; // Not strictly used if we project directly, but useful for 3D->2D scaling

        // Field of View parameters (Scale factor)
        this.scale = 150.0;
    }

    /**
     * Projects a 4D point into 3D space.
     * Uses a perspective projection based on the W coordinate.
     * @param {Vector4} v - The 4D point
     * @returns {Object} {x, y, z} 3D coordinates
     */
    project4D(v) {
        // 4D Perspective Projection
        // The "distance" is how far the 4D camera is from the object in the W-axis.
        // As w approaches wDistance, the point moves towards infinity (vanishing point).

        const wDist = this.wDistance;

        // Avoid division by zero
        const denominator = wDist - v.w;
        const wFactor = 1 / (Math.abs(denominator) < 0.0001 ? 0.0001 : denominator);

        return {
            x: v.x * wFactor,
            y: v.y * wFactor,
            z: v.z * wFactor,
        };
    }

    /**
     * Projects a 3D point (result from project4D) into 2D screen coordinates.
     * @param {Object} v3 - {x, y, z} 3D point
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @returns {Object} {x, y, scale} 2D screen coordinates and size scale (for fake depth)
     */
    project3D(v3, width, height) {
        // 3D Perspective Projection
        // Standard perspective division by Z (simple version for this aesthetic)

        // We add a camera offset in Z so points aren't right on the lens
        const zOffset = 3.0; // Fixed offset
        const zDepth = zOffset - v3.z;

        const zFactor = this.scale / (zDepth < 0.1 ? 0.1 : zDepth);

        const x2d = v3.x * zFactor + width / 2;
        const y2d = v3.y * zFactor + height / 2;

        return { x: x2d, y: y2d, scale: zFactor };
    }

    /**
     * Updates camera settings from UI.
     * @param {number} scale 
     * @param {number} wDist 
     */
    updateSettings(scale, wDist) {
        this.scale = scale;
        this.wDistance = wDist;
    }
}
