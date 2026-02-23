// polygonShape.js
import { Shape, ShapeType } from './shape.js';
import { MassData } from './massData.js';
import { AABB } from '../math/bounds.js';
import { Vec2 } from '../math/vec2.js';
import { PolygonMath } from '../math/polygon.js';

export class PolygonShape extends Shape {
    constructor(vertices) {
        super(ShapeType.POLYGON);
        // Deep copy vertices
        this.vertices = vertices.map(v => v.clone());
        this.normals = [];

        // Ensure CCW and centered
        PolygonMath.makeCounterClockwise(this.vertices);
        PolygonMath.recenter(this.vertices);

        this.computeNormals();
    }

    computeNormals() {
        this.normals = [];
        for (let i = 0; i < this.vertices.length; i++) {
            const current = this.vertices[i];
            const next = this.vertices[(i + 1) % this.vertices.length];
            const edge = Vec2.sub(next, current);
            this.normals.push(edge.perp().normalize().negate());
        }
    }

    computeMass(density) {
        const massData = new MassData();
        let area = 0.0;
        let I = 0.0;
        const k_inv3 = 1.0 / 3.0;

        for (let i = 0; i < this.vertices.length; i++) {
            const p1 = this.vertices[i];
            const p2 = this.vertices[(i + 1) % this.vertices.length];

            const D = p1.x * p2.y - p1.y * p2.x;
            const triangleArea = 0.5 * D;
            area += triangleArea;

            // Area inertia of triangle relative to origin
            const intx2 = p1.x * p1.x + p2.x * p1.x + p2.x * p2.x;
            const inty2 = p1.y * p1.y + p2.y * p1.y + p2.y * p2.y;
            I += (0.25 * k_inv3 * D) * (intx2 + inty2);
        }

        const mass = density * area;
        const inertia = I * density;
        massData.set(mass, inertia);
        return massData;
    }

    computeAABB(transform) {
        let minX = Number.MAX_VALUE;
        let minY = Number.MAX_VALUE;
        let maxX = -Number.MAX_VALUE;
        let maxY = -Number.MAX_VALUE;

        for (let i = 0; i < this.vertices.length; i++) {
            const v = transform.mulVec2(this.vertices[i]);
            if (v.x < minX) minX = v.x;
            if (v.y < minY) minY = v.y;
            if (v.x > maxX) maxX = v.x;
            if (v.y > maxY) maxY = v.y;
        }

        return new AABB(new Vec2(minX, minY), new Vec2(maxX, maxY));
    }

    clone() {
        const p = new PolygonShape(this.vertices);
        p.density = this.density;
        p.friction = this.friction;
        p.restitution = this.restitution;
        return p;
    }

    getSupport(dir) {
        let bestProjection = -Number.MAX_VALUE;
        let bestVertex = null;
        let bestIndex = -1;

        for (let i = 0; i < this.vertices.length; ++i) {
            const v = this.vertices[i];
            const projection = Vec2.dot(v, dir);
            if (projection > bestProjection) {
                bestVertex = v;
                bestProjection = projection;
                bestIndex = i;
            }
        }
        return { vertex: bestVertex, index: bestIndex };
    }
}
