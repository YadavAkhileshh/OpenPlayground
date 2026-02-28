/**
 * js/simulation/agentEngine.js
 * High performance orchestrator updating all agents.
 */

import { AgentPool } from './agentPool.js';
import { SpatialHash } from './spatialHash.js';
import { Steering } from './steering.js';
import { Behavior } from './behavior.js';
import { PheromoneTypes } from './pheromoneTypes.js';
import { state } from '../core/state.js';
import { CONFIG } from '../core/config.js';

export class AgentEngine {
    constructor(width, height, pheromoneGrid, obstacleManager) {
        this.width = width;
        this.height = height;
        this.pheromoneGrid = pheromoneGrid;
        this.obstacleManager = obstacleManager;

        this.pool = new AgentPool();
        this.spatialHash = new SpatialHash(width, height, CONFIG.CELL_SIZE * 4); // 40px cells

        this.resources = []; // Goals to track
    }

    setResources(resources) {
        this.resources = resources;
    }

    spawnAgent(x, y) {
        return this.pool.spawn(x, y);
    }

    update(dt) {
        const agents = this.pool.getActive();
        const activeCount = this.pool.activeCount;

        // Get dynamically adjustable params
        const maxSpeed = state.get('agentSpeedLimit');
        const maxForce = CONFIG.AGENT_MAX_FORCE;
        const wAlign = state.get('weightAlignment');
        const wCoh = state.get('weightCohesion');
        const wSep = state.get('weightSeparation');
        const wGrad = state.get('weightGradient');

        // 1. Rebuild Spatial Hash
        this.spatialHash.clear();
        for (let i = 0; i < activeCount; i++) {
            this.spatialHash.insert(agents[i]);

            // Deposit pheromone based on state
            if (this.pheromoneGrid) {
                const type = agents[i].hasResource ? PheromoneTypes.TO_HOME : PheromoneTypes.TO_FOOD;
                this.pheromoneGrid.addDensity(agents[i].pos.x, agents[i].pos.y, type, 5); // Constant deposit
            }
        }

        // 2. Compute Behaviors and Integrate Physics
        for (let i = 0; i < activeCount; i++) {
            const agent = agents[i];

            // Check resource logic
            this.handleResources(agent);

            // Boids logic if weights > 0
            if (wAlign > 0 || wCoh > 0 || wSep > 0) {
                const neighbors = this.spatialHash.queryRadius(agent.pos.x, agent.pos.y, CONFIG.PERCEPTION_RADIUS, agent);
                const flockForces = Steering.calculateFlocking(agent, neighbors, maxSpeed, maxForce);

                agent.applyForce(flockForces.alignment.mult(wAlign));
                agent.applyForce(flockForces.cohesion.mult(wCoh));
                agent.applyForce(flockForces.separation.mult(wSep));
            }

            // Gradient Following
            if (this.pheromoneGrid && wGrad > 0) {
                // If I have a resource, I want to follow home pheromones (or look for home)
                // If I don't, I want to follow food pheromones
                const targetType = agent.hasResource ? PheromoneTypes.TO_HOME : PheromoneTypes.TO_FOOD;
                const gradForce = Behavior.followGradient(agent, this.pheromoneGrid, targetType, maxSpeed, maxForce);
                agent.applyForce(gradForce.mult(wGrad));
            }

            // Obstacle Avoidance (High priority)
            if (this.obstacleManager) {
                const avoidForce = Behavior.avoidObstacles(agent, this.obstacleManager.obstacles, maxSpeed, maxForce);
                agent.applyForce(avoidForce.mult(CONFIG.WEIGHT_OBSTACLE_AVOIDANCE));
            }

            // Update physics
            agent.maxSpeed = maxSpeed; // Dynamic update
            agent.update(dt, this.width, this.height);
        }
    }

    handleResources(agent) {
        // Very basic distance check to resource nodes
        for (const res of this.resources) {
            const dx = agent.pos.x - res.x;
            const dy = agent.pos.y - res.y;
            if (dx * dx + dy * dy < res.radius * res.radius) {
                if (res.type === 'source' && !agent.hasResource) {
                    agent.hasResource = true;
                    // reverse direction slightly to head back
                    agent.vel.mult(-1);
                } else if (res.type === 'sink' && agent.hasResource) {
                    agent.hasResource = false;
                    agent.vel.mult(-1);
                }
            }
        }
    }
}
