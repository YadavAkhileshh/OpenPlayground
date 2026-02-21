/**
 * Calculates real-time order book imbalances for the micro-structure analysis
 */
class LiquidityImbalance {
    constructor() {
        this.value = 0; // -1 to 1 (-1 meaning 100% asks, 1 meaning 100% bids)
    }

    calculate(snapshot) {
        // Evaluate top 10 levels
        let bidVol = 0;
        let askVol = 0;

        for (let i = 0; i < Math.min(10, snapshot.bids.length); i++) {
            bidVol += snapshot.bids[i].volume;
        }

        for (let i = 0; i < Math.min(10, snapshot.asks.length); i++) {
            askVol += snapshot.asks[i].volume;
        }

        const total = bidVol + askVol;
        if (total === 0) {
            this.value = 0;
            return 0;
        }

        this.value = (bidVol - askVol) / total;
        return this.value;
    }
}

window.LiquidityImbalance = LiquidityImbalance;
