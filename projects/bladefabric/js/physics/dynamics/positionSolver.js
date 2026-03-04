// positionSolver.js
import { Vec2 } from '../../math/vec2.js';
import { BodyType } from '../body.js';

export class PositionSolver {
    constructor() {
        this.baumgarte = 0.2; // Penetration recovery speed
        this.slop = 0.01;     // Allowed penetration
    }

    solvePositionConstraints(contacts) {
        let minSeparation = 0;

        for (const contact of contacts) {
            const bodyA = contact.bodyA;
            const bodyB = contact.bodyB;
            const normal = contact.normal;

            for (let i = 0; i < contact.pointCount; i++) {
                const cp = contact.points[i];

                // Track max penetration for early out stability
                const penetration = contact.penetration;
                minSeparation = Math.min(minSeparation, -penetration);

                // Resolution amount: baumgarte * (penetration - slop)
                const C = Math.max(penetration - this.slop, 0.0);
                const impulse = (C * this.baumgarte) / (cp.normalMass * contact.pointCount);

                const P = Vec2.mul(normal, impulse);

                if (bodyA.type !== BodyType.STATIC) {
                    bodyA.transform.position.sub(Vec2.mul(P, bodyA.massData.invMass));
                    bodyA.transform.setAngle(bodyA.transform.angle - bodyA.massData.invInertia * Vec2.cross(cp.rA, P));
                }

                if (bodyB.type !== BodyType.STATIC) {
                    bodyB.transform.position.add(Vec2.mul(P, bodyB.massData.invMass));
                    bodyB.transform.setAngle(bodyB.transform.angle + bodyB.massData.invInertia * Vec2.cross(cp.rB, P));
                }
            }
        }

        return minSeparation >= -1.5 * this.slop;
    }
}
