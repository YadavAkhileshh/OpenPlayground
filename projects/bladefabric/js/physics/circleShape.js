// circleShape.js
import { Shape, ShapeType } from './shape.js';
import { MassData } from './massData.js';
import { AABB } from '../math/bounds.js';
import { Vec2 } from '../math/vec2.js';
import { PI } from '../math/mathUtils.js';

export class CircleShape extends Shape {
    constructor(radius) {
        super(ShapeType.CIRCLE);
        this.radius = radius;
    }

    computeMass(density) {
        const massData = new MassData();
        const mass = PI * this.radius * this.radius * density;
        // I = 1/2 * m * r^2
        const inertia = 0.5 * mass * this.radius * this.radius;
        massData.set(mass, inertia);
        return massData;
    }

    computeAABB(transform) {
        const p = transform.position;
        return new AABB(
            new Vec2(p.x - this.radius, p.y - this.radius),
            new Vec2(p.x + this.radius, p.y + this.radius)
        );
    }

    clone() {
        const c = new CircleShape(this.radius);
        c.density = this.density;
        c.friction = this.friction;
        c.restitution = this.restitution;
        return c;
    }
}
