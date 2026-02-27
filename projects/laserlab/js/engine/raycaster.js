/**
 * Raycaster Class
 * Handles the recursive ray tracing logic.
 */
import { Vector } from '../math/vector.js';

export class Raycaster {
    /**
     * @param {Scene} scene 
     */
    constructor(scene) {
        this.scene = scene;
        this.maxBounces = 100;
        this.minIntensity = 0.05;
    }

    /**
     * Traces all rays from all lasers.
     * @returns {Array} Array of ray segments for rendering
     */
    traceAll() {
        const segments = [];

        for (const laser of this.scene.lasers) {
            if (!laser.active) continue;

            // Initial ray from laser
            const r = this.trace(
                laser.getEmissionPoint(),
                laser.getEmissionDirection(),
                laser.intensity || 1.0,
                laser.color || '#ff0000',
                0
            );
            segments.push(...r);
        }

        return segments;
    }

    /**
     * Recursively traces a single ray.
     * @param {Vector} origin 
     * @param {Vector} direction 
     * @param {number} intensity 
     * @param {string} color 
     * @param {number} depth 
     * @returns {Array} List of segments
     */
    trace(origin, direction, intensity, color, depth) {
        if (depth > this.maxBounces || intensity < this.minIntensity) {
            return [];
        }

        const hit = this.scene.castRay(origin, direction);
        const segments = [];

        // If no hit, ray goes effectively to infinity (or screen bounds)
        // We'll just define a "large" distance for the infinite ray or clip to screen
        // For simplicity, let's look for a "World Boundary" or just 2000 units
        let endPoint;
        if (!hit) {
            endPoint = origin.add(direction.mult(2000));
            segments.push({
                p1: origin,
                p2: endPoint,
                intensity,
                color,
                type: 'beam'
            });
            return segments;
        }

        endPoint = hit.point;

        // Add the segment to intersection
        segments.push({
            p1: origin,
            p2: endPoint,
            intensity,
            color,
            type: 'beam'
        });

        // Calculate interaction (reflection/refraction)
        if (hit.entity) {
            const outgoingRays = hit.entity.opticalResponse(direction, hit.normal, hit);

            // Optical response might return multiple rays (e.g. splitters, or dispersion)
            for (const ray of outgoingRays) {
                const children = this.trace(
                    ray.origin,
                    ray.direction,
                    ray.intensity * intensity, // decay intensity
                    ray.color || color,
                    depth + 1
                );
                segments.push(...children);
            }

            // Handle target saturation logic if applicable
            if (hit.entity.type === 'target') {
                hit.entity.onHit(intensity, color);
            }
        }

        return segments;
    }
}
