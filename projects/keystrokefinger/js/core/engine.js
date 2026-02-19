/**
 * KeystrokeFingerprint - BiometricEngine
 * The core logic that processes raw collected data into comparable vectors.
 */

import { MathUtils } from '../utils/math.js';

export class BiometricEngine {
    constructor() {
        // Threshold for acceptance (lower is stricter)
        // This is an arbitrary starting point and would need tuning
        this.MATCH_THRESHOLD = 0.65;
    }

    /**
     * Converts raw session data into a feature vector.
     * Vector Structure: [Dwell1, Flight1, Dwell2, Flight2, ... DwellN]
     * @param {Object} sessionData - from TypingCollector
     * @returns {number[]} Feature vector
     */
    createVector(sessionData) {
        const vector = [];
        const dwells = sessionData.dwells;
        const flights = sessionData.flights;

        // We interleave dwell and flight to create a temporal rhythm signature
        // Note: flights is usually length of dwells - 1
        const len = dwells.length;

        for (let i = 0; i < len; i++) {
            vector.push(dwells[i].duration);
            if (i < flights.length) {
                vector.push(flights[i].time);
            }
        }
        return vector;
    }

    /**
     * Compares a candidate vector against a stored profile vector.
     * @param {number[]} candidateVector 
     * @param {number[]} profileVector 
     * @returns {Object} { score, match, distance }
     */
    compare(candidateVector, profileVector) {
        // 1. Structural Check
        if (candidateVector.length !== profileVector.length) {
            console.warn("Vector length mismatch. User likely typed different text.");
            return { score: 0, match: false, reason: "Text Mismatch" };
        }

        // 2. Normalization (Optional, but good for rhythmic shape vs absolute speed)
        // For this MVP, we compare normalized versions to check 'rhythm' 
        // AND absolute versions to check 'speed'.

        // Calculate Manhattan distance on raw values
        // We normalize by the length of the vector to get "Average deviation per keystroke event"
        const distance = MathUtils.manhattanDistance(candidateVector, profileVector);
        const avgDeviation = distance / candidateVector.length;

        // Scoring: 
        // We define a "good" deviation as being under 30ms (very consistent).
        // Any deviation over 100ms is "bad".

        let score = 0;
        // Map deviation to 0-1 score. 
        // 0 deviation = 1.0 match. 
        // 100ms avg deviation = 0.0 match.
        const MAX_TOLERANCE = 150;

        score = Math.max(0, 1 - (avgDeviation / MAX_TOLERANCE));

        return {
            score: score,
            match: score >= this.MATCH_THRESHOLD,
            distance: distance,
            avgDeviation: avgDeviation
        };
    }

    /**
     * Refines a set of vectors into a single profile.
     * (Not full implementation, but placeholder for averaging multiple enrollment attempts)
     * @param {number[][]} vectors 
     */
    generateMasterProfile(vectors) {
        // For MVP, we just take the last one or average them if we had multiple.
        // Let's assume we receive an array, we average them.
        if (vectors.length === 0) return null;

        const length = vectors[0].length;
        const master = new Array(length).fill(0);

        for (let v of vectors) {
            if (v.length !== length) continue; // Skip outliers
            for (let i = 0; i < length; i++) {
                master[i] += v[i];
            }
        }

        return master.map(val => val / vectors.length);
    }
}
