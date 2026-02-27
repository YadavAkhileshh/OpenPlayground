/**
 * High-performance latency simulation queue for mimicking realistic network delay.
 * Wraps bot payloads in delayed callbacks.
 */
class LatencySimulator {
    constructor() {
        this.events = new PriorityQueue((a, b) => a.time < b.time); // Min-Heap based on execution time
        this.baseLatency = CONFIG.LATENCY_BASE_MS;
        this.jitter = CONFIG.LATENCY_JITTER_MS;
        this.currentLatency = this.baseLatency;
    }

    schedule(callback) {
        const delay = this.currentLatency + Math.random() * this.jitter;
        const execTime = (window.TimeClass ? window.TimeClass.now() : Date.now()) + delay;

        this.events.push({
            time: execTime,
            cb: callback
        });
    }

    tick() {
        const now = window.TimeClass ? window.TimeClass.now() : Date.now();

        while (!this.events.isEmpty() && this.events.peek().time <= now) {
            const ev = this.events.pop();
            ev.cb();
        }
    }

    // Flash Crash spikes latency
    spikeLatency() {
        this.currentLatency = 250;
    }

    recoverLatency() {
        this.currentLatency = this.baseLatency;
    }
}

window.LatencySimulator = LatencySimulator;
