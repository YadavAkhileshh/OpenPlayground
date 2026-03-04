/**
 * Entity Class
 * Base class for all game objects.
 */
import { Vector } from '../math/vector.js';

export class Entity {
    /**
     * @param {number} x
     * @param {number} y
     * @param {number} angle Limits: 0 to 2PI
     */
    constructor(x, y, angle = 0) {
        this.position = new Vector(x, y);
        this.angle = angle;
        this.scale = new Vector(1, 1);

        this.draggable = false;
        this.rotatable = false;
        this.isStatic = true; // Optimization for rendering/physics

        this.width = 50;
        this.height = 50;

        this.id = Math.random().toString(36).substr(2, 9);
        this.type = 'generic';
    }

    /**
     * Checks if a point is within the entity's bounds (AABB for simplicity, or OBB if needed).
     * @param {Vector} point 
     * @returns {boolean}
     */
    containsPoint(point) {
        // Simple circle check for interaction usually feels better for small objects
        // Or OBB if we want precision. Let's do a radius check for now as default.
        const d = this.position.dist(point);
        return d < Math.max(this.width, this.height) / 2;
    }

    /**
     * Abstract method Calculate intersection with a ray.
     * @param {Vector} rayOrigin 
     * @param {Vector} rayDir 
     * @returns {Object|null} { point, distance, normal, entity }
     */
    getIntersection(rayOrigin, rayDir) {
        return null;
    }

    /**
     * Abstract method: Calculate outgoing rays.
     * @param {Vector} incident Incident vector
     * @param {Vector} normal Surface normal
     * @param {Object} intersection Intersection point
     * @returns {Object[]} [{ origin, direction, intensity, color }]
     */
    opticalResponse(incident, normal, intersection) {
        return [];
    }

    update(dt) {
        // Base update
    }
}
