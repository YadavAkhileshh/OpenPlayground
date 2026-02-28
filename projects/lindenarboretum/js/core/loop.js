/**
 * LindenArboretum - Loop Module
 * requestAnimationFrame manager.
 */

import { perfMonitor } from '../ui/fpsCounter.js';
import { camera } from '../renderer/camera.js';

export class MainLoop {
    constructor() {
        this.lastTime = 0;
        this.running = false;
        this.updateCallback = null;
        this.renderCallback = null;

        this._frame = this._frame.bind(this);
    }

    start(updateCb, renderCb) {
        this.updateCallback = updateCb;
        this.renderCallback = renderCb;
        this.running = true;
        this.lastTime = performance.now();
        requestAnimationFrame(this._frame);
    }

    stop() {
        this.running = false;
    }

    _frame(now) {
        if (!this.running) return;

        const deltaTime = now - this.lastTime;
        this.lastTime = now;

        // System ticks
        perfMonitor.tick(now);
        camera.update();

        // External callbacks
        if (this.updateCallback) this.updateCallback(deltaTime);
        if (this.renderCallback) this.renderCallback();

        requestAnimationFrame(this._frame);
    }
}
