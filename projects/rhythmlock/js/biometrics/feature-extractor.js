/**
 * RhythmLock - Feature Extractor
 * ------------------------------
 * Enhances the raw keystroke data by extracting higher-order features.
 * Converts raw timings into a sophisticated feature vector.
 */

import { MathUtils } from '../utils/math-utils.js';

export class FeatureExtractor {
    constructor() {
        this.featureMap = [];
    }

    /**
     * Extracts features from raw dwell and flight times.
     * @param {number[]} dwellTimes 
     * @param {number[]} flightTimes 
     * @returns {number[]} Feature vector
     */
    extract(dwellTimes, flightTimes) {
        // 1. Basic Features: Dwell Times
        // Normalized dwell times are a strong indicator
        const dwells = MathUtils.zScoreNormalize(dwellTimes);

        // 2. Basic Features: Flight Times
        // Normalized flight times
        const flights = MathUtils.zScoreNormalize(flightTimes);

        // 3. Digraph Latencies (Key Down to Next Key Down)
        // This is Dwell[i] + Flight[i]
        const digraphs = [];
        for (let i = 0; i < flightTimes.length; i++) {
            digraphs.push(dwellTimes[i] + flightTimes[i]);
        }
        const normDigraphs = MathUtils.zScoreNormalize(digraphs);

        // 4. Tri-graph Latencies (Key i to Key i+2)
        // Not always present in short passwords, but useful
        const trigraphs = [];
        if (digraphs.length > 1) {
            for (let i = 0; i < digraphs.length - 1; i++) {
                trigraphs.push(digraphs[i] + digraphs[i + 1]);
            }
        }
        const normTrigraphs = trigraphs.length > 0 ? MathUtils.zScoreNormalize(trigraphs) : [];

        // 5. Aggregate Statistics
        // Mean Dwell, Mean Flight, Ratio of Dwell/Flight
        const meanDwell = MathUtils.mean(dwellTimes);
        const meanFlight = MathUtils.mean(flightTimes);
        const rhythmRatio = meanFlight !== 0 ? meanDwell / meanFlight : 0;

        // Construct final vector
        // We prioritize the component vectors over the aggregates for "shape" matching

        // Log feature extraction for debugging
        console.groupCollapsed("[FeatureExtractor] Extraction");
        console.log("Dwells:", dwells);
        console.log("Flights:", flights);
        console.log("Digraphs:", normDigraphs);
        console.log("Ratio:", rhythmRatio);
        console.groupEnd();

        return [
            ...dwells,
            ...flights,
            ...normDigraphs,
            // ...normTrigraphs, // Optional: exclude for now to keep vector size manageable
            rhythmRatio // Single scalar at end? Might skew Euclidean distance if not normalized similarly.
        ];
    }

    /**
     * Checks if data is sufficient for extraction.
     * @param {number[]} dwellTimes 
     * @param {number[]} flightTimes 
     */
    validate(dwellTimes, flightTimes) {
        if (!dwellTimes || !flightTimes) return false;
        if (dwellTimes.length < 3) return false; // Need at least 3 keys
        if (flightTimes.length !== dwellTimes.length - 1) return false;
        return true;
    }
}
