/**
 * High performance math helpers for simulation probabilities
 */
const MathUtils = {
    // Standard normal via Box-Muller transform
    randomNormal: (mean = 0, stdev = 1) => {
        let u = 1 - Math.random(); // Converting [0,1) to (0,1]
        let v = Math.random();
        let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        return z * stdev + mean;
    },

    // Random walk with drift
    randomWalkUpdate: (current, drift = 0, volatility = 1) => {
        const shock = MathUtils.randomNormal(0, 1);
        return current * Math.exp(drift + volatility * shock);
    },

    poisson: (lambda) => {
        let l = Math.exp(-lambda);
        let k = 0;
        let p = 1.0;
        do {
            k++;
            p *= Math.random();
        } while (p > l);
        return k - 1;
    },

    randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,

    randomChoice: (arr) => arr[Math.floor(Math.random() * arr.length)],

    roundToTick: (price, tickSize = 0.5) => {
        return Math.round(price / tickSize) * tickSize;
    }
};

window.MathUtils = MathUtils;
