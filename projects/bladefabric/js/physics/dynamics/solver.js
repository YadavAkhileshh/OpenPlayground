// solver.js
import { Vec2 } from '../../math/vec2.js';
import { BodyType } from '../body.js';

export class Solver {
    initVelocityConstraints(contacts, dt) {
        for (const contact of contacts) {
            const bodyA = contact.bodyA;
            const bodyB = contact.bodyB;

            const normal = contact.normal;
            const tangent = new Vec2(-normal.y, normal.x);

            for (let i = 0; i < contact.pointCount; i++) {
                const cp = contact.points[i];

                // Radii from COM to contact point
                cp.rA = Vec2.sub(cp.position, bodyA.transform.position);
                cp.rB = Vec2.sub(cp.position, bodyB.transform.position);

                // Compute relative velocity
                const vA = bodyA.velocity;
                const wA = bodyA.angularVelocity;
                const vB = bodyB.velocity;
                const wB = bodyB.angularVelocity;

                const rnA = Vec2.cross(cp.rA, normal);
                const rnB = Vec2.cross(cp.rB, normal);
                const rtA = Vec2.cross(cp.rA, tangent);
                const rtB = Vec2.cross(cp.rB, tangent);

                // Effective mass for normal axis
                let kNormal = bodyA.massData.invMass + bodyB.massData.invMass
                    + bodyA.massData.invInertia * rnA * rnA
                    + bodyB.massData.invInertia * rnB * rnB;

                cp.normalMass = kNormal > 0.0 ? 1.0 / kNormal : 0.0;

                // Effective mass for tangent axis
                let kTangent = bodyA.massData.invMass + bodyB.massData.invMass
                    + bodyA.massData.invInertia * rtA * rtA
                    + bodyB.massData.invInertia * rtB * rtB;

                cp.tangentMass = kTangent > 0.0 ? 1.0 / kTangent : 0.0;

                // Restitution bias
                cp.velocityBias = 0;

                const rv = new Vec2(
                    vB.x - wB * cp.rB.y - vA.x + wA * cp.rA.y,
                    vB.y + wB * cp.rB.x - vA.y - wA * cp.rA.x
                );

                const relVelNormal = Vec2.dot(rv, normal);

                if (relVelNormal < -1.0) {
                    cp.velocityBias = -contact.restitution * relVelNormal;
                }
            }
        }
    }

    solveVelocityConstraints(contacts) {
        for (const contact of contacts) {
            const bodyA = contact.bodyA;
            const bodyB = contact.bodyB;
            const normal = contact.normal;
            const tangent = new Vec2(-normal.y, normal.x);

            for (let i = 0; i < contact.pointCount; i++) {
                const cp = contact.points[i];

                const vA = bodyA.velocity;
                let wA = bodyA.angularVelocity;
                const vB = bodyB.velocity;
                let wB = bodyB.angularVelocity;

                // Relative velocity at contact
                const rv = new Vec2(
                    vB.x - wB * cp.rB.y - vA.x + wA * cp.rA.y,
                    vB.y + wB * cp.rB.x - vA.y - wA * cp.rA.x
                );

                // Normal Impulse
                let vn = Vec2.dot(rv, normal);
                let lambdaNormal = cp.normalMass * (-vn + cp.velocityBias);

                // Clamp accumulated impulse
                let newImpulseNormal = Math.max(cp.normalImpulse + lambdaNormal, 0.0);
                lambdaNormal = newImpulseNormal - cp.normalImpulse;
                cp.normalImpulse = newImpulseNormal;

                const impulseNormalVec = Vec2.mul(normal, lambdaNormal);

                // Apply Normal Impulse
                if (bodyA.type !== BodyType.STATIC) {
                    bodyA.velocity.sub(Vec2.mul(impulseNormalVec, bodyA.massData.invMass));
                    bodyA.angularVelocity -= bodyA.massData.invInertia * Vec2.cross(cp.rA, impulseNormalVec);
                }
                if (bodyB.type !== BodyType.STATIC) {
                    bodyB.velocity.add(Vec2.mul(impulseNormalVec, bodyB.massData.invMass));
                    bodyB.angularVelocity += bodyB.massData.invInertia * Vec2.cross(cp.rB, impulseNormalVec);
                }

                // Recalculate Relative Velocity for Tangent
                const rv2 = new Vec2(
                    bodyB.velocity.x - bodyB.angularVelocity * cp.rB.y - bodyA.velocity.x + bodyA.angularVelocity * cp.rA.y,
                    bodyB.velocity.y + bodyB.angularVelocity * cp.rB.x - bodyA.velocity.y - bodyA.angularVelocity * cp.rA.x
                );

                let lambdaTangent = cp.tangentMass * -Vec2.dot(rv2, tangent);

                // Coulomb Friction limit
                const maxFriction = contact.friction * cp.normalImpulse;
                let newImpulseTangent = Math.max(-maxFriction, Math.min(maxFriction, cp.tangentImpulse + lambdaTangent));
                lambdaTangent = newImpulseTangent - cp.tangentImpulse;
                cp.tangentImpulse = newImpulseTangent;

                const impulseTangentVec = Vec2.mul(tangent, lambdaTangent);

                // Apply Tangent Impulse
                if (bodyA.type !== BodyType.STATIC) {
                    bodyA.velocity.sub(Vec2.mul(impulseTangentVec, bodyA.massData.invMass));
                    bodyA.angularVelocity -= bodyA.massData.invInertia * Vec2.cross(cp.rA, impulseTangentVec);
                }
                if (bodyB.type !== BodyType.STATIC) {
                    bodyB.velocity.add(Vec2.mul(impulseTangentVec, bodyB.massData.invMass));
                    bodyB.angularVelocity += bodyB.massData.invInertia * Vec2.cross(cp.rB, impulseTangentVec);
                }
            }
        }
    }
}
