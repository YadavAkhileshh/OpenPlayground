/**
 * Market State History buffer for advanced time-series analysis
 */
class MarketStateHistory {
    constructor(capacity) {
        this.capacity = capacity;
        this.states = new CircularBuffer(capacity);
        this.latestState = null;

        // Rolling statistics
        this.rollingVolSums = new CircularBuffer(60); // 1 min at 1s intervals
        this.rollingTpsSums = new CircularBuffer(60);
    }

    recordState(state) {
        this.states.push(state);
        this.latestState = state;
    }

    recordMetrics(tps, vol) {
        this.rollingVolSums.push(vol);
        this.rollingTpsSums.push(tps);
    }

    getAverageTps(periods = 10) {
        if (this.rollingTpsSums.size === 0) return 0;
        const arr = this.rollingTpsSums.toArray();
        let sum = 0;
        let count = 0;
        for (let i = Math.max(0, arr.length - periods); i < arr.length; i++) {
            sum += arr[i];
            count++;
        }
        return count > 0 ? sum / count : 0;
    }

    getAverageVol(periods = 10) {
        if (this.rollingVolSums.size === 0) return 0;
        const arr = this.rollingVolSums.toArray();
        let sum = 0;
        let count = 0;
        for (let i = Math.max(0, arr.length - periods); i < arr.length; i++) {
            sum += arr[i];
            count++;
        }
        return count > 0 ? sum / count : 0;
    }

    detectAnomaly() {
        const avgTps = this.getAverageTps(60);
        const currentTps = this.rollingTpsSums.last() || 0;

        if (avgTps > 100 && currentTps > avgTps * 3) {
            return { type: 'TPS_SPIKE', severity: 'HIGH' };
        }

        return null;
    }
}

window.MarketStateHistory = MarketStateHistory;
