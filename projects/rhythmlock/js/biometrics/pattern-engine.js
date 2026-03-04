/**
 * RhythmLock - Pattern Engine
 * ---------------------------
 * Compares current typing pattern against stored profiles.
 */

import { MathUtils } from '../utils/math-utils.js';

export class PatternEngine {
    constructor() {
        this.threshold = 100; // calibrated threshold for acceptance
    }

    /**
     * Compares an input vector against a stored profile vector.
     * @param {number[]} inputVector 
     * @param {number[]} profileVector 
     * @returns {object} { match: boolean, score: number, distance: number }
     */
    compare(inputVector, profileVector) {
        if (!inputVector || !profileVector) {
            return { match: false, score: 0, distance: Infinity };
        }

        // Vectors must be same length effectively (same password length)
        // If lengths differ significantly, it's definitely not a match
        if (inputVector.length !== profileVector.length) {
            return { match: false, score: 0, distance: Infinity };
        }

        // 1. Calculate raw Euclidean distance
        const distance = MathUtils.euclideanDistance(inputVector, profileVector);

        // 2. Calculate Similarity Score (inverse of distance)
        // We map distance to a 0-100% score.
        // Assume logical max distance for a "bad but valid length" attempt is around 500-1000ms accumulated variance.
        const maxTolerableDistance = 300; // This needs tuning
        let score = Math.max(0, 1 - (distance / maxTolerableDistance));

        // Convert to percentage
        score = Math.round(score * 100);

        // 3. Determine Match
        // A distance of < 50-80 usually indicates a good match for short passwords
        const isMatch = distance < this.threshold;

        // Detailed Logging for Debug/verification
        console.groupCollapsed(`[PatternEngine] Compare Result: ${isMatch ? 'MATCH' : 'NO MATCH'}`);
        console.log(`Distance: ${distance.toFixed(2)} (Threshold: ${this.threshold.toFixed(2)})`);
        console.log(`Score: ${score}%`);
        console.log(`Input Vector:`, inputVector);
        console.log(`Profile Vector:`, profileVector);
        console.table(inputVector.map((val, i) => ({
            Index: i,
            Input: Math.round(val),
            Profile: Math.round(profileVector[i]),
            Diff: Math.round(val - profileVector[i]),
            SqDiff: Math.round((val - profileVector[i]) ** 2)
        })));
        console.groupEnd();

        return {
            match: isMatch,
            score: score,
            distance: distance,
            details: {
                threshold: this.threshold,
                rawDistance: distance
            }
        };
    }

    /**
     * Auto-adjusts threshold based on variance of enrollment samples.
     * @param {number[][]} samples 
     */
    calibrate(samples) {
        // Calculate pair-wise distances between all enrollment samples
        let distances = [];
        for (let i = 0; i < samples.length; i++) {
            for (let j = i + 1; j < samples.length; j++) {
                const d = MathUtils.euclideanDistance(samples[i], samples[j]);
                distances.push(d);
            }
        }

        const avgDist = MathUtils.mean(distances);
        const stdDev = MathUtils.stdDev(distances);

        // Set threshold to Average + 2 * StdDev (allowing for natural variation)
        // Plus a small buffer
        this.threshold = avgDist + (stdDev * 2) + 20;

        console.log(`[PatternEngine] Calibrated Threshold: ${this.threshold.toFixed(2)} (Avg: ${avgDist.toFixed(2)}, Std: ${stdDev.toFixed(2)})`);
    }
}
