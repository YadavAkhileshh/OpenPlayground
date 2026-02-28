// polygon.js
import { Vec2 } from './vec2.js';
import { Segment } from './segment.js';
import { AABB } from './bounds.js';

export class PolygonMath {
    static computeArea(vertices) {
        let area = 0;
        for (let i = 0; i < vertices.length; i++) {
            const p1 = vertices[i];
            const p2 = vertices[(i + 1) % vertices.length];
            area += p1.x * p2.y - p2.x * p1.y;
        }
        return area * 0.5;
    }

    static computeCentroid(vertices) {
        let cx = 0;
        let cy = 0;
        let area = PolygonMath.computeArea(vertices);

        if (Math.abs(area) < 1e-6) return new Vec2();

        for (let i = 0; i < vertices.length; i++) {
            const p1 = vertices[i];
            const p2 = vertices[(i + 1) % vertices.length];
            const f = p1.x * p2.y - p2.x * p1.y;
            cx += (p1.x + p2.x) * f;
            cy += (p1.y + p2.y) * f;
        }

        cx /= (6 * area);
        cy /= (6 * area);
        return new Vec2(cx, cy);
    }

    static recenter(vertices) {
        const centroid = PolygonMath.computeCentroid(vertices);
        for (let i = 0; i < vertices.length; i++) {
            vertices[i].sub(centroid);
        }
        return centroid;
    }

    static isClockwise(vertices) {
        return PolygonMath.computeArea(vertices) < 0;
    }

    static makeCounterClockwise(vertices) {
        if (PolygonMath.isClockwise(vertices)) {
            vertices.reverse();
        }
    }

    static computeAABB(vertices, transform = null) {
        const aabb = new AABB();
        if (vertices.length === 0) return aabb;

        let v0 = vertices[0];
        if (transform) v0 = transform.mulVec2(v0);

        let minX = v0.x;
        let minY = v0.y;
        let maxX = v0.x;
        let maxY = v0.y;

        for (let i = 1; i < vertices.length; i++) {
            let v = vertices[i];
            if (transform) v = transform.mulVec2(v);

            if (v.x < minX) minX = v.x;
            if (v.y < minY) minY = v.y;
            if (v.x > maxX) maxX = v.x;
            if (v.y > maxY) maxY = v.y;
        }

        aabb.set(new Vec2(minX, minY), new Vec2(maxX, maxY));
        return aabb;
    }

    // Check if polygon contains a point (point must be in local space if vertices are)
    static containsPoint(vertices, point) {
        let c = false;
        for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
            const vi = vertices[i];
            const vj = vertices[j];
            if (((vi.y > point.y) !== (vj.y > point.y)) &&
                (point.x < (vj.x - vi.x) * (point.y - vi.y) / (vj.y - vi.y) + vi.x)) {
                c = !c;
            }
        }
        return c;
    }

    static createRegularPolygon(sides, radius) {
        const vertices = [];
        for (let i = 0; i < sides; i++) {
            const angle = (i * 2 * Math.PI) / sides;
            vertices.push(new Vec2(Math.cos(angle) * radius, Math.sin(angle) * radius));
        }
        return vertices;
    }

    static createBox(width, height) {
        const hw = width / 2;
        const hh = height / 2;
        return [
            new Vec2(-hw, -hh),
            new Vec2(hw, -hh),
            new Vec2(hw, hh),
            new Vec2(-hw, hh)
        ];
    }
}
