/**
 * Target Component
 * Detects laser hits.
 */
import { Wall } from './wall.js';

export class Target extends Wall {
    constructor(x, y, radius = 20) {
        super(x, y, radius * 2, radius * 2, 0);
        this.type = 'target';
        this.radius = radius;
        this.isHit = false;
        this.color = '#444'; // default
        this.hitColor = '#0f0';
    }

    // Override intersection for circle shape
    getIntersection(rayOrigin, rayDir) {
        // Ray-Circle intersection
        const f = rayOrigin.sub(this.position);
        const a = rayDir.dot(rayDir);
        const b = 2 * f.dot(rayDir);
        const c = f.dot(f) - this.radius * this.radius;

        let discriminant = b * b - 4 * a * c;
        if (discriminant < 0) return null;

        discriminant = Math.sqrt(discriminant);

        // t1 is closest intersection
        const t1 = (-b - discriminant) / (2 * a);
        const t2 = (-b + discriminant) / (2 * a);

        if (t1 >= 0) {
            const hitPoint = rayOrigin.add(rayDir.mult(t1));
            return {
                point: hitPoint,
                distance: t1,
                normal: hitPoint.sub(this.position).normalize(),
                entity: this
            };
        }

        return null; // Ignore exit point if inside (or handle if needed)
    }

    onHit(intensity, color) {
        this.isHit = true;
        // Could store the color hitting it
    }

    update(dt) {
        // Reset hit status every frame before raycast?
        // Raycaster runs every frame. The Scene or Game Loop should reset Targets.
        this.isHit = false;
    }
}
