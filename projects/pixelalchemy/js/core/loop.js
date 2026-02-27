/**
 * Game Loop Controller
 * Manages the frame timing and update calls.
 */

export class GameLoop {
    constructor(updateFn) {
        this.updateFn = updateFn;
        this.lastTime = 0;
        this.isRunning = false;
        this.fps = 60;
        this.frameCount = 0;
        this.lastFpsTime = 0;

        this.loop = this.loop.bind(this);
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.lastTime = performance.now();
            requestAnimationFrame(this.loop);
        }
    }

    stop() {
        this.isRunning = false;
    }

    toggle() {
        if (this.isRunning) this.stop();
        else this.start();
    }

    loop(timestamp) {
        if (!this.isRunning) return;

        const dt = timestamp - this.lastTime;
        this.lastTime = timestamp;

        // Calculate FPS
        this.frameCount++;
        if (timestamp - this.lastFpsTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsTime = timestamp;
        }

        // Run Update
        // We could limit dt here if we wanted fixed timesteps
        this.updateFn(dt);

        requestAnimationFrame(this.loop);
    }
}
