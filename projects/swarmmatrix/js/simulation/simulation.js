/**
 * js/simulation/simulation.js
 * Root orchestrator for the simulation engine.
 */

import { AgentEngine } from './agentEngine.js';
import { PheromoneGrid } from './pheromoneGrid.js';
import { ObstacleManager } from './obstacleManager.js';
import { ResourceManager } from './resourceManager.js';
import { state } from '../core/state.js';
import { CONFIG } from '../core/config.js';

export class Simulation {
    constructor(width, height) {
        this.width = width;
        this.height = height;

        // Create environment systems
        this.pheromoneGrid = new PheromoneGrid(width, height, 4); // 4px resolution
        this.obstacleManager = new ObstacleManager();
        this.resourceManager = new ResourceManager();

        // Create agent engine passing environment dependencies
        this.agentEngine = new AgentEngine(
            width,
            height,
            this.pheromoneGrid,
            this.obstacleManager
        );
    }

    init() {
        // Build initial world
        this.resourceManager.generateDefaults(this.width, this.height);
        this.agentEngine.setResources(this.resourceManager.resources);

        // Spawn 10k agents distributed randomly
        this.spawnAgents(CONFIG.MAX_AGENTS);
    }

    spawnAgents(count) {
        for (let i = 0; i < count; i++) {
            this.agentEngine.spawnAgent(
                Math.random() * this.width,
                Math.random() * this.height
            );
        }
        state.set('agentCount', this.agentEngine.pool.activeCount);
    }

    addObstacle(x, y, radius) {
        this.obstacleManager.addObstacle(x, y, radius);
    }

    addResource(type, x, y) {
        this.resourceManager.addResource(type, x, y);
        // Refresh agent engine references
        this.agentEngine.setResources(this.resourceManager.resources);
    }

    eraseEnvironment(x, y, radius) {
        this.obstacleManager.removeAt(x, y, radius);
        this.resourceManager.removeAt(x, y, radius);
        this.agentEngine.setResources(this.resourceManager.resources);

        // Also wipe pheromones in brush area
        const boundsSq = radius * radius;
        for (let dy = -radius; dy <= radius; dy += this.pheromoneGrid.resolution) {
            for (let dx = -radius; dx <= radius; dx += this.pheromoneGrid.resolution) {
                if (dx * dx + dy * dy <= boundsSq) {
                    const px = x + dx;
                    const py = y + dy;
                    if (px >= 0 && px < this.width && py >= 0 && py < this.height) {
                        const col = Math.floor(px / this.pheromoneGrid.resolution);
                        const row = Math.floor(py / this.pheromoneGrid.resolution);
                        const idx = col + row * this.pheromoneGrid.cols;

                        this.pheromoneGrid.density[0][idx] = 0;
                        this.pheromoneGrid.density[1][idx] = 0;
                    }
                }
            }
        }
    }

    update(dt) {
        // Update components
        this.pheromoneGrid.update(dt);
        this.agentEngine.update(dt);

        // In a real scenario we'd calculate entropy across grid here
        // For visual metrics, we loosely estimate entropy as standard deviation of density
        if (state.get('currentTick') % 60 === 0) {
            this.calculateEntropy();
        }

        // If window resized, push dimension updates downwards
        if (this.width !== state.get('width') || this.height !== state.get('height')) {
            this.resize(state.get('width'), state.get('height'));
        }
    }

    calculateEntropy() {
        // Sample just a small portion of the grid to avoid performance hit
        const samples = 100;
        let sum = 0;
        const grid = this.pheromoneGrid.density[0];

        if (grid.length === 0) return;

        for (let i = 0; i < samples; i++) {
            const idx = Math.floor(Math.random() * grid.length);
            sum += grid[idx] > 10 ? 1 : 0;
        }

        // 0% = totally uniform/empty, 100% = heavily patterned
        const chaos = Math.min(100, (sum / samples) * 100);
        state.set('entropy', Math.round(chaos));
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
        this.agentEngine.width = width;
        this.agentEngine.height = height;
        // Resizing Eulerian grids precisely online is complex, we just recreate here in this simplistic sim
        // Real implementation would copy values over. For scale limits, we skip resizing logic
    }

    reset() {
        this.agentEngine.pool.clear();
        this.pheromoneGrid.clear();
        this.obstacleManager.clear();
        this.resourceManager.generateDefaults(this.width, this.height);
        this.agentEngine.setResources(this.resourceManager.resources);

        this.spawnAgents(CONFIG.MAX_AGENTS);
    }
}
