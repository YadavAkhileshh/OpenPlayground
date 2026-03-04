// NematodeSim — Phase Controller
// Computes per-segment phase offsets that create the traveling sine wave
// propagating from head to tail. This is the spatial component of the CPG.
// Phase offset formula: φ_i = masterPhase + i * PHASE_SHIFT
// where i is the segment index (0 = head, N-1 = tail).

import Config from '../sim/Config.js';

export class PhaseController {
    /**
     * @param {number} segmentCount  Number of body segments
     * @param {number} phaseShift    Per-segment phase lag (radians)
     */
    constructor(segmentCount = Config.SEGMENT_COUNT, phaseShift = Config.PHASE_SHIFT) {
        this.segmentCount = segmentCount;
        this.phaseShift = phaseShift;
        this._phases = new Float32Array(segmentCount);   // Pre-allocated
        this._signals = new Float32Array(segmentCount);   // sin values
    }

    /**
     * Recompute phase array from the current master phase.
     * Call once per frame with the NeuralClock's current phase.
     * @param {number} masterPhase  Current master phase (rad) from NeuralClock
     */
    update(masterPhase) {
        const n = this.segmentCount;
        const dPhi = this.phaseShift;
        for (let i = 0; i < n; i++) {
            this._phases[i] = masterPhase + i * dPhi;
            this._signals[i] = Math.sin(this._phases[i]);
        }
    }

    /**
     * Get the phase (radians) at a specific segment index.
     * @param {number} i  Segment index
     * @returns {number}
     */
    phaseAt(i) {
        return this._phases[i] ?? 0;
    }

    /**
     * Get sin(phase) at segment i — the normalized activation signal.
     * @param {number} i  Segment index
     * @returns {number}  Value in [-1, 1]
     */
    signalAt(i) {
        return this._signals[i] ?? 0;
    }

    /** Expose the full signal array (read-only reference). */
    get signals() { return this._signals; }

    /**
     * Change per-segment phase delay.
     * Larger shift = tighter body wave; smaller = slower wave propagation.
     * @param {number} rad
     */
    setPhaseShift(rad) {
        this.phaseShift = rad;
    }

    /**
     * Compute the spatial wavelength in segments for the current phase shift.
     * λ = 2π / |phaseShift|
     * @returns {number}
     */
    wavelengthInSegments() {
        return 2 * Math.PI / Math.abs(this.phaseShift || 1e-6);
    }
}

export default PhaseController;
