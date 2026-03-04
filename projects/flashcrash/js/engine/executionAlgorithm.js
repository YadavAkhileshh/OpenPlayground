/**
 * Advanced Execution Algorithms (VWAP / TWAP)
 * Splits large institutional orders into smaller chunks over time
 */
class ExecutionAlgorithm {
    constructor(id, botManager, type, side, totalSize, durationTicks) {
        this.id = id;
        this.manager = botManager;
        this.type = type; // 'VWAP', 'TWAP'
        this.side = side;
        this.totalSize = totalSize;
        this.remainingSize = totalSize;

        this.durationTicks = durationTicks;
        this.ticksElapsed = 0;
        this.active = true;

        this.interval = Math.max(1, Math.floor(durationTicks / (totalSize / 0.5))); // Target chunk size 0.5
    }

    tick() {
        if (!this.active) return;
        this.ticksElapsed++;

        if (this.ticksElapsed >= this.durationTicks || this.remainingSize <= 0.0001) {
            this.active = false;
            this.manager.bus.emitAsync(CONSTANTS.EVENTS.LOG, { level: 'info', msg: `EXECUTION ${this.type} COMPLETE: ${this.id.substring(0, 6)}` });
            return;
        }

        if (this.ticksElapsed % this.interval === 0) {
            this.executeChunk();
        }
    }

    executeChunk() {
        let chunkSize = 0.5;

        if (this.type === 'TWAP') {
            // Time Weighted: Evenly size across the remaining time
            const ticksLeft = this.durationTicks - this.ticksElapsed;
            const executedSoFarRatio = this.ticksElapsed / this.durationTicks;
            const targetSizeSoFar = this.totalSize * executedSoFarRatio;
            const currentSize = this.totalSize - this.remainingSize;

            chunkSize = Math.max(0.1, targetSizeSoFar - currentSize);

        } else if (this.type === 'VWAP') {
            // Volume Weighted: Scale based on recent market volume profile
            // For sim, we'll randomize it around the historical volume curve
            const volumeProfile = Math.sin((this.ticksElapsed / this.durationTicks) * Math.PI);
            chunkSize = (this.totalSize / (this.durationTicks / this.interval)) * (0.5 + volumeProfile);
        }

        chunkSize = Math.min(chunkSize, this.remainingSize);

        // Execute chunk at market
        this.manager.submitOrder(this.id, CONSTANTS.ORDER_TYPES.MARKET, this.side, 0, chunkSize);
        this.remainingSize -= chunkSize;
    }
}

window.ExecutionAlgorithm = ExecutionAlgorithm;
