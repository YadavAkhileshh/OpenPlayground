// NematodeSim — Wave Pattern
// Encodes the traveling sinusoidal body wave shape.
// Provides the normalized lateral displacement for each body segment
// at a given point in time, based on phase controller signals.

import Config from '../sim/Config.js';

export class WavePattern {
    /**
     * @param {number} amplitude   Peak lateral force magnitude
     * @param {number} segments    Number of body segments
     */
    constructor(amplitude = Config.WAVE_AMPLITUDE, segments = Config.SEGMENT_COUNT) {
        this.amplitude = amplitude;
        this.segments = segments;
        // Envelope tapering: head and tail have reduced amplitude
        this._envelope = this._buildEnvelope(segments);
    }

    /**
     * Build a smooth amplitude envelope tapered at head and tail.
     * Peak amplitude at ~40% of body length, falls to 0.3 at ends.
     * @param {number} n
     * @returns {Float32Array}
     */
    _buildEnvelope(n) {
        const env = new Float32Array(n);
        for (let i = 0; i < n; i++) {
            const t = i / (n - 1);            // 0 (head) → 1 (tail)
            // Sin envelope: low at head, peaks in middle-posterior, low at tail
            env[i] = 0.35 + 0.65 * Math.sin(t * Math.PI);
        }
        return env;
    }

    /**
     * Compute lateral force magnitude for segment i given its CPG signal.
     * @param {number} i       Segment index
     * @param {number} signal  Normalized signal ∈ [-1, 1] from PhaseController
     * @returns {number}       Signed lateral force magnitude
     */
    lateralForce(i, signal) {
        const env = this._envelope[i] ?? 1.0;
        return signal * this.amplitude * env;
    }

    /**
     * Compute lateral force vector for segment i given body tangent and normal.
     * @param {number} i        Segment index
     * @param {number} signal   CPG signal ∈ [-1, 1]
     * @param {number} nx       Body normal X (unit vector, perpendicular to body axis)
     * @param {number} ny       Body normal Y
     * @returns {{ fx: number, fy: number }}
     */
    lateralForceVector(i, signal, nx, ny) {
        const mag = this.lateralForce(i, signal);
        return { fx: nx * mag, fy: ny * mag };
    }

    /**
     * Update amplitude from slider.
     * @param {number} a  New amplitude
     */
    setAmplitude(a) {
        this.amplitude = Math.max(10, Math.min(1000, a));
    }

    /**
     * Rebuild envelope when segment count changes.
     * @param {number} n
     */
    setSegments(n) {
        this.segments = n;
        this._envelope = this._buildEnvelope(n);
    }

    /** Get envelope value at segment i. */
    envelopeAt(i) {
        return this._envelope[i] ?? 1.0;
    }
}

export default WavePattern;
