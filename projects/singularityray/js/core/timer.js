/**
 * SingularityRay JS - Core - Timer
 * High precision game loop timer tracking delta times and fixed timesteps.
 */

import { EngineConfig } from './engine_config.js';

export class Timer {
    constructor() {
        this.lastTime = performance.now();
        this.deltaTime = 0;
        this.elapsedTime = 0;

        // Fixed timestep for deterministic physics integration
        // Useful if we ever animate objects orbiting the BH
        this.fixedDelta = 1000 / 60;
        this.accumulator = 0;

        this.isPaused = false;
    }

    /**
     * Call at the exact start of every frame
     */
    tick() {
        const now = performance.now();

        if (this.isPaused) {
            this.lastTime = now;
            this.deltaTime = 0;
            return;
        }

        let delta = now - this.lastTime;

        // Prevent huge jumps if tab was inactive
        if (delta > EngineConfig.maxDeltaTime) {
            delta = EngineConfig.maxDeltaTime;
        }

        this.deltaTime = delta;
        this.elapsedTime += delta;
        this.accumulator += delta;

        this.lastTime = now;
    }

    /**
     * Checks if a fixed logic step should run, and consumes the accumulator
     * @returns {boolean}
     */
    consumeFixedStep() {
        if (this.accumulator >= this.fixedDelta) {
            this.accumulator -= this.fixedDelta;
            return true;
        }
        return false;
    }

    /**
     * Pause timer accumulation
     */
    pause() {
        this.isPaused = true;
    }

    /**
     * Resume from exactly where it left off
     */
    resume() {
        this.isPaused = false;
        this.lastTime = performance.now();
    }
}
