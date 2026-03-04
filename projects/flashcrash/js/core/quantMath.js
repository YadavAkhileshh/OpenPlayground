/**
 * Helper to process moving mathematical formulas for bot signals
 */
class QuantMath {
    /**
     * Calculates Bollinger Bands array
     * @param {number[]} prices Close prices
     * @param {number} period Lookback window
     * @param {number} stdDev Multiplier
     * @returns {Object} { upper, lower, basis }
     */
    static bollingerBands(prices, period = 20, stdDev = 2) {
        if (prices.length < period) return null;

        let sum = 0;
        for (let i = prices.length - period; i < prices.length; i++) sum += prices[i];
        const basis = sum / period;

        let varSum = 0;
        for (let i = prices.length - period; i < prices.length; i++) {
            varSum += Math.pow(prices[i] - basis, 2);
        }

        const deviation = Math.sqrt(varSum / period);

        return {
            upper: basis + (deviation * stdDev),
            lower: basis - (deviation * stdDev),
            basis: basis
        };
    }

    /**
     * Fast Geometric Brownian Motion simulator for theoretical option pricing
     */
    static gbmPath(s0, mu, sigma, t, steps) {
        const dt = t / steps;
        const path = [s0];
        let S = s0;

        for (let i = 1; i <= steps; i++) {
            // phi represents standard normal sample
            let u1 = Math.random();
            let u2 = Math.random();
            let z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

            S = S * Math.exp((mu - 0.5 * Math.pow(sigma, 2)) * dt + sigma * Math.sqrt(dt) * z);
            path.push(S);
        }

        return path;
    }
}

window.QuantMath = QuantMath;
