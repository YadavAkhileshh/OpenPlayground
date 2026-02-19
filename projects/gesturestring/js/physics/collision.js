/**
 * Collision Module
 * Handles collision detection and resolution.
 */
import { Vector3 } from '../math/vector3.js';

export class Collision {

    /**
     * Checks overlap between two spheres.
     */
    static sphereSphere(p1, r1, p2, r2) {
        const distSq = p1.distanceToSq(p2);
        const radSum = r1 + r2;
        return distSq < (radSum * radSum);
    }

    /**
     * Resolves collision between particle and a sphere obstacle.
     * @param {Particle} particle 
     * @param {Vector3} spherePos 
     * @param {number} sphereRadius 
     */
    static resolveParticleSphere(particle, spherePos, sphereRadius) {
        const distSq = particle.position.distanceToSq(spherePos);
        const minDesc = sphereRadius + particle.radius;

        if (distSq < minDesc * minDesc) {
            const dist = Math.sqrt(distSq);
            // Push out
            const penetration = minDesc - dist;
            const normal = Vector3.subVectors(particle.position, spherePos).normalize();

            particle.position.add(normal.multiplyScalar(penetration));

            // Reflect velocity (bounce)
            const dot = particle.velocity.dot(normal);
            if (dot < 0) {
                // v' = v - 2(v.n)n
                const reflection = normal.multiplyScalar(2 * dot);
                particle.velocity.sub(reflection);
                particle.velocity.multiplyScalar(0.8); // Restitution
            }
        }
    }
}
