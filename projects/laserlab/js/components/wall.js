/**
 * Wall Component
 * Blocks light rays.
 */
import { Entity } from './entity.js';
import { Utils } from '../math/utils.js';
import { Vector } from '../math/vector.js';

export class Wall extends Entity {
    constructor(x, y, width, height, angle = 0) {
        super(x, y, angle);
        this.width = width;
        this.height = height;
        this.type = 'wall';
        this.color = '#444';
    }

    containsPoint(point) {
        // Translate point to local space
        const local = point.sub(this.position).rotate(-this.angle);
        // Check axis-aligned bounds
        return Math.abs(local.x) <= this.width / 2 && Math.abs(local.y) <= this.height / 2;
    }

    getBounds() {
        // For rotated walls, we need 4 corners.
        // Assuming centered origin.
        const hw = this.width / 2;
        const hh = this.height / 2;

        // Local corners
        const corners = [
            new Vector(-hw, -hh),
            new Vector(hw, -hh),
            new Vector(hw, hh),
            new Vector(-hw, hh)
        ];

        // Rotate and translate
        return corners.map(c => c.rotate(this.angle).add(this.position));
    }

    getIntersection(rayOrigin, rayDir) {
        const bounds = this.getBounds();
        let closest = null;
        let minDist = Infinity;

        // Check intersection with all 4 sides
        for (let i = 0; i < 4; i++) {
            const p1 = bounds[i];
            const p2 = bounds[(i + 1) % 4];

            // Ray-Line intersection
            // Helper function logic needed here or generic lineIntersect
            // lineIntersect returns T on line segment, we need ray T

            // Let's use a ray-segment intersector
            const hit = this.raySegmentIntersect(rayOrigin, rayDir, p1, p2);
            if (hit && hit.distance < minDist) {
                minDist = hit.distance;
                closest = hit;
            }
        }

        return closest;
    }

    raySegmentIntersect(origin, dir, p1, p2) {
        const v1 = origin.sub(p1);
        const v2 = p2.sub(p1);
        const v3 = new Vector(-dir.y, dir.x);

        const dot = v2.dot(v3);
        if (Math.abs(dot) < 0.000001) return null;

        const t1 = v2.cross(v1) / dot;
        const t2 = v1.dot(v3) / dot;

        if (t1 >= 0 && (t2 >= 0 && t2 <= 1)) {
            // Normal is perpendicular to segment
            // We need to determine which side? Vector(-dy, dx) is one normal.
            let normal = new Vector(-(p2.y - p1.y), p2.x - p1.x).normalize();
            // Ensure normal points against ray
            if (normal.dot(dir) > 0) normal = normal.mult(-1);

            return {
                point: origin.add(dir.mult(t1)),
                distance: t1,
                normal: normal,
                entity: this
            };
        }
        return null;
    }

    opticalResponse(incident, normal, intersection) {
        return []; // Absorbs light
    }
}
