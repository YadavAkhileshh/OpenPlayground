/**
 * js/simulation/behavior.js
 * Higher level agent behaviors (Gradient following, obstacle avoidance).
 */

import { Vec2 } from '../core/vector.js';
import { MathUtils } from '../core/math.js';
import { CONFIG } from '../core/config.js';

const steerForce = new Vec2();
const lookAhead = new Vec2();

export const Behavior = {
    // Follow the gradient of a pheromone field
    followGradient: (agent, grid, type, maxSpeed, maxForce) => {
        steerForce.set(0, 0);

        // Sample at 3 points in front of the agent
        const angle = agent.vel.heading();
        const sensorDist = 15;
        const sensorAngle = Math.PI / 4; // 45 degrees

        // Front, Left, Right sensors
        const fX = agent.pos.x + Math.cos(angle) * sensorDist;
        const fY = agent.pos.y + Math.sin(angle) * sensorDist;

        const lX = agent.pos.x + Math.cos(angle - sensorAngle) * sensorDist;
        const lY = agent.pos.y + Math.sin(angle - sensorAngle) * sensorDist;

        const rX = agent.pos.x + Math.cos(angle + sensorAngle) * sensorDist;
        const rY = agent.pos.y + Math.sin(angle + sensorAngle) * sensorDist;

        const valF = grid.sample(fX, fY, type);
        const valL = grid.sample(lX, lY, type);
        const valR = grid.sample(rX, rY, type);

        // If there's pheromone to follow
        if (valF > 0 || valL > 0 || valR > 0) {
            // Steer towards strongest signal
            if (valF >= valL && valF >= valR) {
                // Continue forward (no steering needed)
            } else if (valL > valR) {
                // Steer Left
                steerForce.set(Math.cos(angle - sensorAngle), Math.sin(angle - sensorAngle)).mult(maxSpeed);
                steerForce.sub(agent.vel).limit(maxForce);
            } else {
                // Steer Right
                steerForce.set(Math.cos(angle + sensorAngle), Math.sin(angle + sensorAngle)).mult(maxSpeed);
                steerForce.sub(agent.vel).limit(maxForce);
            }
        } else {
            // Random wander if no pheromone found
            steerForce.set(Math.cos(angle + (Math.random() - 0.5)), Math.sin(angle + (Math.random() - 0.5))).mult(maxSpeed);
            steerForce.sub(agent.vel).limit(maxForce * 0.2); // Weak wander
        }

        agent.steeringVectors.gradient.copy(steerForce);
        return steerForce;
    },

    // Avoid obstacles
    avoidObstacles: (agent, obstacles, maxSpeed, maxForce) => {
        steerForce.set(0, 0);

        // Simple lookahead vector
        lookAhead.copy(agent.vel).normalize().mult(20).add(agent.pos);

        let closestObstacle = null;
        let closestDistSq = Infinity;

        // Find closest obstacle intersecting lookahead
        // Optimization: In a real scenario use spatial hash for obstacles too
        for (let i = 0; i < obstacles.length; i++) {
            const obs = obstacles[i];
            const dSq = MathUtils.distSq(lookAhead.x, lookAhead.y, obs.x, obs.y);
            if (dSq < obs.radius * obs.radius) {
                if (dSq < closestDistSq) {
                    closestDistSq = dSq;
                    closestObstacle = obs;
                }
            }
        }

        if (closestObstacle) {
            // Steer away from obstacle center
            steerForce.copy(lookAhead).sub(new Vec2(closestObstacle.x, closestObstacle.y));
            steerForce.normalize().mult(maxSpeed).sub(agent.vel).limit(maxForce);
        }

        agent.steeringVectors.avoidance.copy(steerForce);
        return steerForce;
    }
};
