/**
 * Projection.js
 * Handles the mathematical projection of 3D points onto a 2D plane.
 * Implements perspective projection and world-to-screen transformation.
 */

import { Vector3 } from '../math/Vector3.js';

export class Projection {

    /**
     * Projects a 3D point to 2D screen coordinates.
     * Applies rotation, scale, and perspective.
     * 
     * @param {Vector3} point - The 3D point to project.
     * @param {Camera} camera - The active camera.
     * @param {number} width - Canvas width.
     * @param {number} height - Canvas height.
     * @param {number} scaleFactor - Attractor specific scale.
     * @returns {object|null} - {x, y, scale} or null if behind camera.
     */
    static project(point, camera, width, height, scaleFactor = 1.0) {
        // Create a copy to avoid modifying the original simulation point
        let p = point.clone();

        // 1. Apply Attractor Scale
        // Different attractors have vastly different bounds, so we normalize them visually
        p.multiplyScalar(scaleFactor);

        // 2. Apply Camera Rotation (Order: Y then X)
        p.applyAxisAngleY(camera.rotation.y);
        p.applyAxisAngleX(camera.rotation.x);

        // 3. Apply Camera Zoom (as distance from camera)
        // We simulate the camera being at z = -distance
        // Increasing zoom means moving the camera closer, or strictly scaling the world
        let distance = 100; // Base distance
        let z = p.z + distance;

        // Simple perspective projection
        // x' = x * (focalLength / z)
        // y' = y * (focalLength / z)

        const focalLength = 800 * camera.zoom;

        if (z <= 0) return null; // Behind camera (simple clipping)

        const perspective = focalLength / z;

        const x2d = p.x * perspective + width / 2;
        const y2d = p.y * perspective + height / 2;

        return {
            x: x2d,
            y: y2d,
            w: perspective, // Useful for scaling point size or opacity by depth
            z: p.z // Useful for depth sorting or coloring
        };
    }
}
