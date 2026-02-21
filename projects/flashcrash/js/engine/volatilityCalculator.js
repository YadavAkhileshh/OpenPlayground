class VolatilityCalculator {
    constructor(metrics, bus) {
        this.metrics = metrics;
        this.bus = bus;
        this.vixSimulated = 15.0; // Base calm
        this.trend = 'NEUTRAL';
    }

    tick() {
        const hist = this.metrics.priceHistory.toArray();
        if (hist.length < 10) return;

        // Calculate short term variance
        let sum = 0;
        for (let i = 0; i < hist.length; i++) sum += hist[i];
        const mean = sum / hist.length;

        let varSum = 0;
        for (let i = 0; i < hist.length; i++) {
            varSum += Math.pow(hist[i] - mean, 2);
        }

        const variance = varSum / hist.length;
        // Map variance to a pseudo VIX index (10 to 80)
        this.vixSimulated = Utils.lerp(this.vixSimulated, Math.min(80, 10 + Math.sqrt(variance) * 0.5), 0.1);

        // determine trend based on very last 50 periods
        const slice = hist.slice(-50);
        if (slice.length > 5) {
            const first = slice[0];
            const last = slice[slice.length - 1];
            if (last > first + 0.5) this.trend = 'BULLISH';
            else if (last < first - 0.5) this.trend = 'BEARISH';
            else this.trend = 'NEUTRAL';
        }
    }
}

window.VolatilityCalculator = VolatilityCalculator;
