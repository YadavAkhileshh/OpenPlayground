/**
 * RhythmLock - Secure Storage
 * ---------------------------
 * Simulates a secure enclave for storing biometric templates.
 * In a real app, this would be encrypted on server or locally.
 */

import { PatternEngine } from './pattern-engine.js';
import { MathUtils } from '../utils/math-utils.js';

export class SecureStorage {
    constructor() {
        this.profile = null; // The active user profile (vector)
        this.passwordHash = null; // Simple hash to verify text correctness
        this.engine = new PatternEngine();
        this.samples = []; // Temporary samples during enrollment
    }

    /**
     * Starts enrollment process.
     */
    startEnrollment() {
        this.samples = [];
        console.log("Enrollment started.");
    }

    /**
     * Adds a sample to the enrollment set.
     * @param {string} passwordText 
     * @param {number[]} vector 
     */
    addEnrollmentSample(passwordText, vector) {
        if (this.samples.length === 0) {
            this.passwordHash = this.simpleHash(passwordText);
        } else {
            // Verify text matches previous samples
            if (this.simpleHash(passwordText) !== this.passwordHash) {
                console.error("Password text mismatch during enrollment");
                return false;
            }
        }
        this.samples.push(vector);
        return true;
    }

    /**
     * Finalizes enrollment, creating a master profile.
     * @returns {boolean} success
     */
    finalizeEnrollment() {
        if (this.samples.length < 3) {
            console.warn("Not enough samples to enroll.");
            return false;
        }

        // Create an "Average Vector" from samples
        const vectorLength = this.samples[0].length;
        const averagedVector = new Array(vectorLength).fill(0);

        for (let i = 0; i < vectorLength; i++) {
            let sum = 0;
            for (let sample of this.samples) {
                sum += sample[i];
            }
            averagedVector[i] = sum / this.samples.length;
        }

        this.profile = averagedVector;

        // Calibrate engine based on these samples
        this.engine.calibrate(this.samples);

        console.log("Enrollment complete. Profile secured.");
        return true;
    }

    /**
     * Verifies an input attempt.
     * @param {string} passwordText 
     * @param {number[]} vector 
     */
    verify(passwordText, vector) {
        if (!this.profile) return { success: false, reason: "No profile found" };

        // 1. Text Check
        if (this.simpleHash(passwordText) !== this.passwordHash) {
            return { success: false, reason: "Incorrect Password", score: 0 };
        }

        // 2. Rhythm Check
        const result = this.engine.compare(vector, this.profile);

        return {
            success: result.match,
            score: result.score,
            distance: result.distance,
            reason: result.match ? "Authenticated" : "Rhythm Mismatch"
        };
    }

    isEnrolled() {
        return this.profile !== null;
    }

    // A very simple hash just for checking text equality (not real crypto)
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }
}
