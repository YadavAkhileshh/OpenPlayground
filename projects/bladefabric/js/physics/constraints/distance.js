// distance.js
import { Vec2 } from '../../math/vec2.js';
import { Constraint } from './constraint.js';
import { BodyType } from '../body.js';

export class DistanceConstraint extends Constraint {
    constructor(bodyA, bodyB, length = -1) {
        super(bodyA, bodyB);
        this.length = length < 0 ? Vec2.distance(bodyA.position, bodyB.position) : length;
        this.stiffness = 1.0;

        // Caching
        this.normal = new Vec2();
        this.effectiveMass = 0;
        this.impulse = 0;
        this.bias = 0;
    }

    preStep(dt) {
        const dp = Vec2.sub(this.bodyB.position, this.bodyA.position);
        let dist = dp.length();
        if (dist > 1e-6) {
            this.normal = Vec2.mul(dp, 1.0 / dist);
        } else {
            this.normal.set(1, 0);
        }

        this.effectiveMass = this.bodyA.massData.invMass + this.bodyB.massData.invMass;
        if (this.effectiveMass > 0) {
            this.effectiveMass = 1.0 / this.effectiveMass;
        }

        // Baumgarte stabilization bias
        const C = dist - this.length;
        this.bias = (C / dt) * 0.2 * this.stiffness;

        // Track tearing force roughly via distance strain here
        this.currentForce = Math.abs(C) * 1000;

        // Apply accumulated impulse
        const P = Vec2.mul(this.normal, this.impulse);
        if (this.bodyA.type !== BodyType.STATIC) this.bodyA.velocity.sub(Vec2.mul(P, this.bodyA.massData.invMass));
        if (this.bodyB.type !== BodyType.STATIC) this.bodyB.velocity.add(Vec2.mul(P, this.bodyB.massData.invMass));
    }

    solveVelocity(dt) {
        const rv = Vec2.sub(this.bodyB.velocity, this.bodyA.velocity);
        const vn = Vec2.dot(rv, this.normal);

        let lambda = -this.effectiveMass * (vn + this.bias);

        this.impulse += lambda;

        const P = Vec2.mul(this.normal, lambda);
        if (this.bodyA.type !== BodyType.STATIC) this.bodyA.velocity.sub(Vec2.mul(P, this.bodyA.massData.invMass));
        if (this.bodyB.type !== BodyType.STATIC) this.bodyB.velocity.add(Vec2.mul(P, this.bodyB.massData.invMass));
    }

    solvePosition() {
        const dp = Vec2.sub(this.bodyB.position, this.bodyA.position);
        let dist = dp.length();
        if (dist === 0) return true;

        const C = dist - this.length;
        // Don't solve small errors
        if (Math.abs(C) < 0.05) return true;

        const n = Vec2.mul(dp, 1.0 / dist);
        const massSum = this.bodyA.massData.invMass + this.bodyB.massData.invMass;
        if (massSum === 0) return true;

        const impulse = C / massSum;
        const P = Vec2.mul(n, impulse);

        // Position correction scaler to avoid jitter
        const scale = 0.5 * this.stiffness;

        if (this.bodyA.type !== BodyType.STATIC) this.bodyA.position.add(Vec2.mul(P, this.bodyA.massData.invMass * scale));
        if (this.bodyB.type !== BodyType.STATIC) this.bodyB.position.sub(Vec2.mul(P, this.bodyB.massData.invMass * scale));

        return false;
    }
}
