// js/physics/Collision.js
import { Vector2D } from '../core/Vector2D.js';

export class Collision {
    /**
     * Calculates overlap and normal for AABB collision
     * @param {Body} bodyA 
     * @param {Body} bodyB 
     * @returns {Object|null} collision manifold
     */
    static checkAABB(bodyA, bodyB) {
        if (!bodyA.aabb.intersects(bodyB.aabb)) {
            return null;
        }

        const centerA = bodyA.getCenter();
        const centerB = bodyB.getCenter();

        // Calculate half extents
        const halfExtentsA = new Vector2D(bodyA.width / 2, bodyA.height / 2);
        const halfExtentsB = new Vector2D(bodyB.width / 2, bodyB.height / 2);

        // Calculate vector distance between centers
        const diff = Vector2D.sub(centerB, centerA);

        // Calculate overlap on x and y axes
        const overlapX = halfExtentsA.x + halfExtentsB.x - Math.abs(diff.x);
        const overlapY = halfExtentsA.y + halfExtentsB.y - Math.abs(diff.y);

        // Find collision normal and penetration depth
        let normal = new Vector2D();
        let penetration = 0;

        if (overlapX > 0 && overlapY > 0) {
            if (overlapX < overlapY) {
                // X axis collision
                if (diff.x < 0) {
                    normal.set(-1, 0);
                } else {
                    normal.set(1, 0);
                }
                penetration = overlapX;
            } else {
                // Y axis collision
                if (diff.y < 0) {
                    normal.set(0, -1);
                } else {
                    normal.set(0, 1);
                }
                penetration = overlapY;
            }

            return { bodyA, bodyB, normal, penetration };
        }

        return null;
    }
}
