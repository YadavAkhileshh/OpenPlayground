/**
 * LindenArboretum - Oscillator Module
 * Adds a subtle sine-wave sway to branches on top of the chaotic wind gusts.
 * This simulates the natural resonant frequency of long slender branches.
 */

export class Oscillator {
    constructor() {
        this.frequency = 1.0;
        this.amplitude = 1.0;
        this.phase = 0;
    }

    /**
     * Set the parameters of the oscillator.
     * @param {number} freq 
     * @param {number} amp 
     * @param {number} phase 
     */
    set(freq, amp, phase = 0) {
        this.frequency = freq;
        this.amplitude = amp;
        this.phase = phase;
    }

    /**
     * Evaluates the oscillator at a given time point.
     * @param {number} timeSeconds 
     * @returns {number} Value between [-amplitude, amplitude]
     */
    evaluate(timeSeconds) {
        return Math.sin(timeSeconds * this.frequency + this.phase) * this.amplitude;
    }
}
