// spring.js
import { Vec2 } from '../../math/vec2.js';
import { Constraint } from './constraint.js';
import { BodyType } from '../body.js';

export class SpringConstraint extends Constraint {
    constructor(bodyA, bodyB, restLength = -1, k = 100, damping = 10) {
        super(bodyA, bodyB);
        this.restLength = restLength < 0 ? Vec2.distance(bodyA.position, bodyB.position) : restLength;
        this.k = k;
        this.damping = damping;
    }

    preStep(dt) {
        // Hooke's Law: F = -k * (x - L) - d * v
        const posA = this.bodyA.position;
        const posB = this.bodyB.position;

        const dp = Vec2.sub(posB, posA);
        const dist = dp.length();

        if (dist === 0) return;

        const n = Vec2.mul(dp, 1.0 / dist);

        const vA = this.bodyA.velocity;
        const vB = this.bodyB.velocity;
        const rv = Vec2.sub(vB, vA);

        const relVel = Vec2.dot(rv, n);

        const forceMag = -this.k * (dist - this.restLength) - this.damping * relVel;

        this.currentForce = Math.abs(forceMag);

        const force = Vec2.mul(n, forceMag);

        // Apply equal and opposite forces directly to bodies
        if (this.bodyA.type !== BodyType.STATIC) {
            this.bodyA.applyForce(Vec2.mul(force, -1));
        }

        if (this.bodyB.type !== BodyType.STATIC) {
            this.bodyB.applyForce(force);
        }
    }
}
