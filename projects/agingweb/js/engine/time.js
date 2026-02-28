/**
 * time.js
 * managing the flow of time and calculated elapsed duration.
 */

export class TimeEngine {
    constructor(storage) {
        this.storage = storage;
        this.startTime = this.storage.getFirstVisitTime();
        this.timeMultiplier = 1; // Debug speed control
        this.virtualElapsed = 0;
        this.subscribers = [];

        // Start the loop
        this.tick();
    }

    /**
     * Adds a callback to be called on every tick.
     * @param {Function} callback 
     */
    subscribe(callback) {
        this.subscribers.push(callback);
    }

    setMultiplier(val) {
        this.timeMultiplier = val;
    }

    start() {
        // Any init logic
    }

    update(dt) {
        // Real elapsed time logic
        // We use the difference since start, but we can also accumulate DT if we wanted to pause.
        // For this app, time is absolute based on start time.

        const realNow = Date.now();
        const realElapsed = realNow - this.startTime;
        this.virtualElapsed = realElapsed * this.timeMultiplier;
    }

    getFormattedTime() {
        return new Date(this.startTime).toLocaleTimeString();
    }

    getFormattedElapsed() {
        const seconds = Math.floor(this.virtualElapsed / 1000) % 60;
        const minutes = Math.floor(this.virtualElapsed / (1000 * 60)) % 60;
        const hours = Math.floor(this.virtualElapsed / (1000 * 60 * 60));

        const pad = (n) => n.toString().padStart(2, '0');
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
}
