/**
 * RhythmLock - Keystroke Tracker
 * ------------------------------
 * Captures 'keydown' and 'keyup' events to calculate dwell time and flight time.
 * delegates vector generation to FeatureExtractor.
 */

import { FeatureExtractor } from './feature-extractor.js';

export class KeystrokeTracker {
    constructor() {
        this.reset();
        this.extractor = new FeatureExtractor();
    }

    reset() {
        this.startTime = null;
        this.timings = []; // Array of { key, type, time }
        this.activeKeys = new Map(); // key -> startTime
        this.lastKeyUpTime = null;
        this.flightTimes = [];
        this.dwellTimes = [];
    }

    /**
     * Handles keydown event.
     * @param {KeyboardEvent} e 
     */
    handleKeyDown(e) {
        // Ignore modifiers and non-printable keys if necessary, 
        // but for rhythm, even Shift/Backspace timing matters.
        // We'll focus on the timing pattern of the password itself.

        const now = performance.now();
        if (!this.startTime) this.startTime = now;

        // If key is already pressed (repeating), ignore
        if (e.repeat) return;

        // Record flight time (time since last key UP to this key DOWN)
        if (this.lastKeyUpTime !== null) {
            const flightTime = now - this.lastKeyUpTime;
            this.flightTimes.push(flightTime);
        }

        this.activeKeys.set(e.code, now);
    }

    /**
     * Handles keyup event.
     * @param {KeyboardEvent} e 
     */
    handleKeyUp(e) {
        const now = performance.now();
        const keyDownTime = this.activeKeys.get(e.code);

        if (keyDownTime !== undefined) {
            const dwellTime = now - keyDownTime;
            this.dwellTimes.push(dwellTime);
            this.activeKeys.delete(e.code);
        }

        this.lastKeyUpTime = now;
    }

    /**
     * Returns the current biometric vector.
     * Uses FeatureExtractor for advanced features.
     * @returns {number[]}
     */
    getBiometricVector() {
        if (this.dwellTimes.length === 0) return [];
        return this.extractor.extract(this.dwellTimes, this.flightTimes);
    }

    /**
     * Returns descriptive stats for debugging.
     */
    getStats() {
        return {
            totalKeys: this.dwellTimes.length,
            avgDwell: this.dwellTimes.reduce((a, b) => a + b, 0) / (this.dwellTimes.length || 1),
            avgFlight: this.flightTimes.reduce((a, b) => a + b, 0) / (this.flightTimes.length || 1)
        };
    }
}
