// integrator.js
import { Vec2 } from '../../math/vec2.js';
import { BodyType } from '../body.js';

export class Integrator {
    integrate(bodies, gravity, dt) {
        for (const body of bodies) {
            if (body.type === BodyType.STATIC || body.type === BodyType.KINEMATIC) continue;

            // Apply gravity and accumulated forces
            const translationForce = new Vec2(gravity.x * body.massData.mass, gravity.y * body.massData.mass);
            translationForce.add(body.force);

            body.velocity.x += (translationForce.x * body.massData.invMass) * dt;
            body.velocity.y += (translationForce.y * body.massData.invMass) * dt;

            body.angularVelocity += (body.torque * body.massData.invInertia) * dt;

            // Damping for stability
            body.velocity.mul(0.999);
            body.angularVelocity *= 0.995;

            // Clear forces for next frame
            body.force.set(0, 0);
            body.torque = 0;
        }
    }

    integrateForces(bodies, dt) {
        for (const body of bodies) {
            if (body.type === BodyType.STATIC) continue;

            // Allow kinematic bodies to smoothly move without forces
            if (body.type === BodyType.KINEMATIC && body.velocity.lengthSq() === 0 && body.angularVelocity === 0) continue;

            body.transform.position.x += body.velocity.x * dt;
            body.transform.position.y += body.velocity.y * dt;
            body.transform.setAngle(body.transform.angle + body.angularVelocity * dt);
        }

    }
}
