/**
 * js/simulation/steering.js
 * Core Boids steering behaviors (Alignment, Cohesion, Separation).
 */

import { Vec2 } from '../core/vector.js';
import { MathUtils } from '../core/math.js';
import { CONFIG } from '../core/config.js';

// Pre-allocate vectors to avoid GC during iteration
const sumAlign = new Vec2();
const sumCohesion = new Vec2();
const sumSeparation = new Vec2();
const diff = new Vec2();

export const Steering = {
    // Calculates Alignment, Cohesion, and Separation in one pass over neighbors
    calculateFlocking: (agent, neighbors, maxSpeed, maxForce) => {
        sumAlign.set(0, 0);
        sumCohesion.set(0, 0);
        sumSeparation.set(0, 0);

        let count = 0;
        let sepCount = 0;

        const desiredSeparationSq = 20 * 20; // 20 pixels optimal distance

        for (let i = 0; i < neighbors.length; i++) {
            const other = neighbors[i];
            const dSq = MathUtils.distSq(agent.pos.x, agent.pos.y, other.pos.x, other.pos.y);

            if (dSq > 0) {
                // Alignment
                sumAlign.add(other.vel);

                // Cohesion
                sumCohesion.add(other.pos);

                count++;

                // Separation
                if (dSq < desiredSeparationSq) {
                    diff.copy(agent.pos).sub(other.pos);
                    // Weight by distance (closer = stronger push)
                    // avoid divide by zero
                    if (dSq > 0.001) {
                        diff.normalize().div(Math.sqrt(dSq));
                        sumSeparation.add(diff);
                        sepCount++;
                    }
                }
            }
        }

        // Finalize vectors
        if (count > 0) {
            // Alignment
            sumAlign.div(count);
            sumAlign.setHeading(sumAlign.heading()); // Normalize maintain dir
            sumAlign.normalize().mult(maxSpeed);
            sumAlign.sub(agent.vel);
            sumAlign.limit(maxForce);

            // Cohesion
            sumCohesion.div(count); // Center of mass
            sumCohesion.sub(agent.pos); // Steer towards center
            sumCohesion.normalize().mult(maxSpeed);
            sumCohesion.sub(agent.vel);
            sumCohesion.limit(maxForce);
        }

        if (sepCount > 0) {
            // Separation
            sumSeparation.div(sepCount);
            if (sumSeparation.magSq() > 0) {
                sumSeparation.normalize().mult(maxSpeed);
                sumSeparation.sub(agent.vel);
                sumSeparation.limit(maxForce);
            }
        }

        // Store vectors in agent for debug rendering before returning
        agent.steeringVectors.alignment.copy(sumAlign);
        agent.steeringVectors.cohesion.copy(sumCohesion);
        agent.steeringVectors.separation.copy(sumSeparation);

        return {
            alignment: sumAlign,
            cohesion: sumCohesion,
            separation: sumSeparation
        };
    }
};
