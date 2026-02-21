/**
 * js/render/renderer.js
 * Main Rendering coordinator.
 */

import { Camera } from './camera.js';
import { AgentRenderer } from './agentRenderer.js';
import { PheromoneRenderer } from './pheromoneRenderer.js';
import { HeatmapRenderer } from './heatmapRenderer.js';
import { ObstacleRenderer } from './obstacleRenderer.js';
import { ResourceRenderer } from './resourceRenderer.js';
import { DebugRenderer } from './debugRenderer.js';
import { state } from '../core/state.js';

export class Renderer {
    constructor(simulation) {
        this.sim = simulation;

        // Setup canvases
        this.canvas = document.getElementById('simulation-canvas');
        this.ctx = this.canvas.getContext('2d', { alpha: false }); // Optimize by disabling alpha on main

        this.uiCanvas = document.getElementById('ui-overlay-canvas');
        this.uiCtx = this.uiCanvas.getContext('2d');

        this.camera = new Camera();

        // Sub-renderers
        this.pheromoneRenderer = new PheromoneRenderer();
        this.heatmapRenderer = new HeatmapRenderer();
        this.obstacleRenderer = new ObstacleRenderer();
        this.resourceRenderer = new ResourceRenderer();
        this.agentRenderer = new AgentRenderer();
        this.debugRenderer = new DebugRenderer();
    }

    render() {
        // Clear screen
        // Using fillRect is often faster than clearRect on opaque canvases
        this.ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--canvas-bg').trim() || '#030305';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Clear UI Canvas
        this.uiCtx.clearRect(0, 0, this.uiCanvas.width, this.uiCanvas.height);

        // Apply Camera Transform
        this.camera.apply(this.ctx);
        this.camera.apply(this.uiCtx);

        // 1. Render Pheromones (Background)
        if (state.get('debugHeatmap')) {
            this.heatmapRenderer.render(this.ctx, this.sim.pheromoneGrid);
        } else {
            this.pheromoneRenderer.render(this.ctx, this.sim.pheromoneGrid);
        }

        // 2. Render Environment (Obstacles and Resources)
        this.obstacleRenderer.render(this.ctx, this.sim.obstacleManager);
        this.resourceRenderer.render(this.ctx, this.sim.resourceManager);

        // 3. Render Agents
        const agents = this.sim.agentEngine.pool.getActive();
        const activeCount = this.sim.agentEngine.pool.activeCount;
        this.agentRenderer.render(this.ctx, agents, activeCount);

        // 4. Render Debug Output
        if (state.get('debugVectors')) {
            this.debugRenderer.renderSteering(this.uiCtx, agents, activeCount);
        }

        if (state.get('debugSpatial')) {
            this.debugRenderer.renderSpatialHash(this.uiCtx, this.sim.agentEngine.spatialHash);
        }

        // Restore Camera Transform
        this.camera.restore(this.uiCtx);
        this.camera.restore(this.ctx);
    }
}
