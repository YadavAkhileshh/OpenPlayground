/**
 * Scene Class
 * Manages all entities in the current level.
 */
import { Entity } from '../components/entity.js';

export class Scene {
    constructor() {
        this.entities = [];
        this.lasers = []; // Separate list might be useful for starting raycasts
        this.targets = [];
        this.width = 0;
        this.height = 0;
    }

    /**
     * Adds an entity to the scene.
     * @param {Entity} entity 
     */
    add(entity) {
        this.entities.push(entity);
        if (entity.type === 'laser') this.lasers.push(entity);
        if (entity.type === 'target') this.targets.push(entity);
    }

    /**
     * Removes an entity.
     * @param {Entity} entity 
     */
    remove(entity) {
        this.entities = this.entities.filter(e => e !== entity);
        this.lasers = this.lasers.filter(e => e !== entity);
        this.targets = this.targets.filter(e => e !== entity);
    }

    /**
     * Clears the scene.
     */
    clear() {
        this.entities = [];
        this.lasers = [];
        this.targets = [];
    }

    /**
     * Finds the closest intersection for a ray.
     * @param {Vector} origin 
     * @param {Vector} direction 
     * @param {Entity} ignoreEntity Entity to ignore (usually self)
     * @returns {Object|null}
     */
    castRay(origin, direction, ignoreEntity = null) {
        let closest = null;
        let minDist = Infinity;

        for (const entity of this.entities) {
            if (entity === ignoreEntity) continue;

            // Optimization: Bounding volume check could go here

            const hit = entity.getIntersection(origin, direction);
            if (hit && hit.distance < minDist && hit.distance > 0.001) { // Epsilon for self-intersection
                minDist = hit.distance;
                closest = hit;
            }
        }

        return closest;
    }

    /**
     * Update all entities.
     * @param {number} dt 
     */
    update(dt) {
        for (const entity of this.entities) {
            entity.update(dt);
        }
    }
}
