// time.js
import { globalEvents } from './eventBus.js';

export class Time {
    constructor() {
        this.deltaTime = 0;
        this.timeScale = 1.0;
        this.lastTime = performance.now();
        this.fixedDeltaTime = 1 / 60; // 60 Hz physics step
        this.accumulator = 0;
        this.maxAccumulator = 0.1; // Don't allow death spirals

        globalEvents.on('toggle_slowmo', (active) => {
            this.timeScale = active ? 0.1 : 1.0;
        });
    }

    update() {
        const currentTime = performance.now();
        // Convert ms to seconds
        let dt = (currentTime - this.lastTime) / 1000;

        // Cap dt to avoid massive spikes (e.g. from switching tabs)
        if (dt > 0.1) dt = 0.1;

        this.lastTime = currentTime;

        // Scale delta time by time scale
        this.deltaTime = dt * this.timeScale;
        this.accumulator += this.deltaTime;

        // Prevent accumulator from growing infinitely
        if (this.accumulator > this.maxAccumulator) {
            this.accumulator = this.maxAccumulator;
        }
    }

    consumeFixedTime() {
        if (this.accumulator >= this.fixedDeltaTime) {
            this.accumulator -= this.fixedDeltaTime;
            return true;
        }
        return false;
    }
}
