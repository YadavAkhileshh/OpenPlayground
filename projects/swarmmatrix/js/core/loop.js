/**
 * js/core/loop.js
 * High-performance game loop using requestAnimationFrame.
 */

import { events } from './events.js';
import { state } from './state.js';

export class GameLoop {
    constructor(simulation, renderer, uiManager) {
        this.simulation = simulation;
        this.renderer = renderer;
        this.uiManager = uiManager;

        this.lastTime = performance.now();
        this.accumulator = 0;
        this.stepSize = 1000 / 60; // Target 60 FPS update rate

        // FPS calculation
        this.frameCount = 0;
        this.lastFpsTime = this.lastTime;
        this.fps = 0;

        this.autoStart = true;
        this.frameId = null;

        this.loop = this.loop.bind(this);
    }

    start() {
        if (!this.frameId) {
            this.lastTime = performance.now();
            this.frameId = requestAnimationFrame(this.loop);
            state.set('isRunning', true);
            state.set('isPaused', false);
        }
    }

    stop() {
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
            this.frameId = null;
            state.set('isRunning', false);
        }
    }

    pause() {
        state.set('isPaused', true);
    }

    resume() {
        state.set('isPaused', false);
        this.lastTime = performance.now();
    }

    step() {
        // Force a single logic step even if paused
        this.simulation.update(this.stepSize / 1000);
        this.renderer.render();
        state.set('currentTick', state.get('currentTick') + 1);
        this.uiManager.updateTelemetry();
    }

    loop(currentTime) {
        this.frameId = requestAnimationFrame(this.loop);

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // FPS tracking
        this.frameCount++;
        if (currentTime - this.lastFpsTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsTime = currentTime;
            state.set('currentFPS', this.fps);
            if (this.uiManager) this.uiManager.updateTelemetry();
        }

        // Avoid spiral of death
        if (deltaTime > 250) {
            return;
        }

        if (!state.get('isPaused')) {
            // Fixed timestep logic update (better for physics stability)
            this.accumulator += deltaTime;

            while (this.accumulator >= this.stepSize) {
                this.simulation.update(this.stepSize / 1000);
                this.accumulator -= this.stepSize;
                state.set('currentTick', state.get('currentTick') + 1);
            }

            // Render with interpolation factor (accumulator / stepSize)
            // But for simple 2D swarm, raw render is fine
            this.renderer.render();
        }
    }
}
