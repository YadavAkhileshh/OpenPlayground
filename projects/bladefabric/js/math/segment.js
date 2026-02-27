// segment.js
import { Vec2 } from './vec2.js';

export class Segment {
    constructor(p1 = new Vec2(), p2 = new Vec2()) {
        this.p1 = p1.clone();
        this.p2 = p2.clone();
    }

    length() {
        return Vec2.distance(this.p1, this.p2);
    }

    lengthSq() {
        return Vec2.distanceSq(this.p1, this.p2);
    }

    // Returns 0-1 if point is projected onto segment, <0 if before p1, >1 if after p2
    projectPoint(point) {
        const l2 = this.lengthSq();
        if (l2 === 0) return 0;
        const t = ((point.x - this.p1.x) * (this.p2.x - this.p1.x) + (point.y - this.p1.y) * (this.p2.y - this.p1.y)) / l2;
        return t;
    }

    closestPoint(point) {
        const t = Math.max(0, Math.min(1, this.projectPoint(point)));
        return new Vec2(
            this.p1.x + t * (this.p2.x - this.p1.x),
            this.p1.y + t * (this.p2.y - this.p1.y)
        );
    }

    distanceToPoint(point) {
        return Vec2.distance(point, this.closestPoint(point));
    }

    intersectRay(ray, returnT = false) {
        const v1 = Vec2.sub(this.p1, ray.origin);
        const v2 = Vec2.sub(this.p2, ray.origin);
        const v3 = new Vec2(-ray.dir.y, ray.dir.x);

        const d1 = Vec2.dot(v1, v3);
        const d2 = Vec2.dot(v2, v3);

        // Ray passes between p1 and p2?
        if ((d1 * d2) > 0) return null;

        const t = d1 / (d1 - d2);

        // Is intersection point in front of the ray?
        const proj1 = Vec2.dot(v1, ray.dir);
        const proj2 = Vec2.dot(v2, ray.dir);

        const intersectT = proj1 + t * (proj2 - proj1);

        if (intersectT < 0) return null;

        if (returnT) {
            return { point: ray.getPoint(intersectT), tLine: t, tRay: intersectT };
        }

        return ray.getPoint(intersectT);
    }

    intersectSegment(seg2) {
        // Line AB represented as a1x + b1y = c1
        const a1 = this.p2.y - this.p1.y;
        const b1 = this.p1.x - this.p2.x;
        const c1 = a1 * this.p1.x + b1 * this.p1.y;

        // Line CD represented as a2x + b2y = c2
        const a2 = seg2.p2.y - seg2.p1.y;
        const b2 = seg2.p1.x - seg2.p2.x;
        const c2 = a2 * seg2.p1.x + b2 * seg2.p1.y;

        const determinant = a1 * b2 - a2 * b1;

        if (Math.abs(determinant) < 1e-6) {
            // Lines are parallel
            return null;
        }

        const x = (b2 * c1 - b1 * c2) / determinant;
        const y = (a1 * c2 - a2 * c1) / determinant;

        const pt = new Vec2(x, y);

        // Verify if the intersection point is within both line segments
        const rx0 = (x - this.p1.x) / (this.p2.x - this.p1.x);
        const rx1 = (x - seg2.p1.x) / (seg2.p2.x - seg2.p1.x);

        const ry0 = (y - this.p1.y) / (this.p2.y - this.p1.y);
        const ry1 = (y - seg2.p1.y) / (seg2.p2.y - seg2.p1.y);

        let valid0 = false;
        let valid1 = false;

        if (Math.abs(this.p2.x - this.p1.x) > 1e-6) valid0 = rx0 >= 0 && rx0 <= 1;
        else valid0 = ry0 >= 0 && ry0 <= 1;

        if (Math.abs(seg2.p2.x - seg2.p1.x) > 1e-6) valid1 = rx1 >= 0 && rx1 <= 1;
        else valid1 = ry1 >= 0 && ry1 <= 1;

        if (valid0 && valid1) {
            return pt;
        }
        return null;
    }
}
