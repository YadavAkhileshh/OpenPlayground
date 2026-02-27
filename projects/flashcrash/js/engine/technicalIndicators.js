/**
 * Advanced Order struct extensions mapping for FIX protocol style representation
 * Moving averages, RSI, and MACD indicators built from raw price tick streams
 */
class TechnicalIndicators {
    constructor(periodRSI = 14, periodFastMACD = 12, periodSlowMACD = 26, signalMACD = 9) {
        this.periodRSI = periodRSI;
        this.periodFastMACD = periodFastMACD;
        this.periodSlowMACD = periodSlowMACD;
        this.signalMACD = signalMACD;

        this.prices = new CircularBuffer(200);
        this.gains = 0;
        this.losses = 0;
        this.avgGain = 0;
        this.avgLoss = 0;
    }

    pushPrice(price) {
        if (this.prices.size > 0) {
            const change = price - this.prices.last();
            if (change > 0) {
                this.gains += change;
            } else {
                this.losses += Math.abs(change);
            }
        }
        this.prices.push(price);
    }

    calculateSMA(period) {
        if (this.prices.size < period) return null;
        let sum = 0;
        for (let i = this.prices.size - period; i < this.prices.size; i++) {
            sum += this.prices.get(i);
        }
        return sum / period;
    }

    calculateEMA(period, currentPrice, prevEMA) {
        if (prevEMA === null) return this.calculateSMA(period);
        const k = 2 / (period + 1);
        return currentPrice * k + prevEMA * (1 - k);
    }

    calculateRSI() {
        if (this.prices.size < this.periodRSI) return 50; // Default Neutral

        let sumGain = 0;
        let sumLoss = 0;

        // Simplified Wilders Smoothing for brevity
        for (let i = this.prices.size - this.periodRSI; i < this.prices.size; i++) {
            const diff = this.prices.get(i) - this.prices.get(i - 1);
            if (diff > 0) sumGain += diff;
            else sumLoss += Math.abs(diff);
        }

        const avgGain = sumGain / this.periodRSI;
        const avgLoss = sumLoss / this.periodRSI;

        if (avgLoss === 0) return 100;
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }
}

window.TechnicalIndicators = TechnicalIndicators;
