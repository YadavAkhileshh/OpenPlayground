/**
 * Central metrics accumulator for charting and global stats
 */
class Metrics {
    constructor(bus) {
        this.bus = bus;
        this.priceHistory = new CircularBuffer(CONFIG.CHART_HISTORY_POINTS);
        this.volHistory = new CircularBuffer(CONFIG.CHART_HISTORY_POINTS);

        this.tpsAccumulator = 0;
        this.currentTps = 0;
        this.tpsTimer = 0;

        this.totalVolume24h = 0;

        this.bus.on(CONSTANTS.EVENTS.MARKET_STATE_CHANGE, this.onMarketState.bind(this));
        this.bus.on(CONSTANTS.EVENTS.TRADE_EXECUTED, this.onTrade.bind(this));

        this.lastChartUpdate = 0;
    }

    onTrade(trade) {
        this.tpsAccumulator++;
        this.totalVolume24h += trade.size;
    }

    onMarketState(state) {
        // throttle history appending to ~10 times a sec for smooth charting
        const now = Date.now();
        if (now - this.lastChartUpdate > 100) {
            this.priceHistory.push(state.lastPrice);
            this.volHistory.push(state.tickVolume);
            this.lastChartUpdate = now;
        }
    }

    tick(deltaTime) {
        this.tpsTimer += deltaTime;
        if (this.tpsTimer >= 1000) {
            this.currentTps = this.tpsAccumulator;
            this.tpsAccumulator = 0;
            this.tpsTimer = 0;
        }
    }
}

window.Metrics = Metrics;
