/**
 * Provides a high-resolution simulated epoch for backtesting / realtime hybrid
 */
class Time {
    constructor() {
        this.startTime = performance.now();
        this.simulatedTime = Date.now();
        this.timeScale = 1.0;
        this.lastFrame = this.startTime;
    }

    tick() {
        const now = performance.now();
        const deltaReal = now - this.lastFrame;
        this.lastFrame = now;

        const deltaSim = deltaReal * this.timeScale;
        this.simulatedTime += deltaSim;

        return { deltaReal, deltaSim };
    }

    now() {
        return this.simulatedTime;
    }

    setTimeScale(scale) {
        this.timeScale = scale;
    }
}

window.Time = new Time();
// Make global Time class available if instantiated locally
window.TimeClass = Time;
