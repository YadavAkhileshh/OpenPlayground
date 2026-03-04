/**
 * Analysis Module.
 * Computes statistics on the chemical concentration grids.
 * @module Simulation/Analysis
 */

export class Analysis {
    constructor(simulation) {
        this.simulation = simulation;
        this.history = []; // Keep a short history for change detection
    }

    getStatistics() {
        const gridA = this.simulation.gridA;
        const gridB = this.simulation.gridB;
        const size = this.simulation.size;

        let minA = 1.0, maxA = 0.0, avgA = 0.0;
        let minB = 1.0, maxB = 0.0, avgB = 0.0;

        let entropy = 0; // Shannon entropy approximation based on binned values
        const bins = new Uint32Array(20); // 20 bins for 0..1

        for (let i = 0; i < size; i++) {
            const a = gridA[i];
            const b = gridB[i];

            if (a < minA) minA = a;
            if (a > maxA) maxA = a;
            avgA += a;

            if (b < minB) minB = b;
            if (b > maxB) maxB = b;
            avgB += b;

            // Entropy binning for B
            let binIdx = Math.floor(b * 20);
            if (binIdx >= 20) binIdx = 19;
            bins[binIdx]++;
        }

        avgA /= size;
        avgB /= size;

        // Compute entropy
        for (let i = 0; i < 20; i++) {
            const p = bins[i] / size;
            if (p > 0) {
                entropy -= p * Math.log2(p);
            }
        }

        return {
            minA, maxA, avgA,
            minB, maxB, avgB,
            entropy,
            fillRatio: avgB // Rough approximation of how much of the grid is "active"
        };
    }
}
