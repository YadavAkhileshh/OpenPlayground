// NematodeSim — Central Pattern Generator (CPG)
// The core neuromuscular oscillation system.
// Combines NeuralClock + PhaseController + WavePattern to produce
// per-segment lateral force vectors each physics frame.

import { NeuralClock } from './NeuralClock.js';
import { PhaseController } from './PhaseController.js';
import { WavePattern } from './WavePattern.js';
import Config from '../sim/Config.js';

export class CPG {
    /**
     * @param {number} segmentCount  Number of body nodes
     * @param {number} frequency     Initial frequency (Hz)
     */
    constructor(segmentCount = Config.SEGMENT_COUNT, frequency = Config.FREQUENCY_DEFAULT) {
        this.segmentCount = segmentCount;
        this.clock = new NeuralClock(frequency);
        this.phase = new PhaseController(segmentCount, Config.PHASE_SHIFT);
        this.wave = new WavePattern(Config.WAVE_AMPLITUDE, segmentCount);
        // Per-segment activation cache [-1, 1]
        this._activations = new Float32Array(segmentCount);
    }

    /**
     * Advance CPG by dt seconds and recompute all segment activations.
     * @param {number} dt  Timestep in seconds
     */
    update(dt) {
        this.clock.tick(dt);
        this.phase.update(this.clock.phase);

        const n = this.segmentCount;
        for (let i = 0; i < n; i++) {
            this._activations[i] = this.phase.signalAt(i);
        }
    }

    /**
     * Get the lateral force vector for segment i, given the body-normal direction.
     * @param {number} i   Segment index
     * @param {number} nx  Body normal unit vector X (perpendicular to body axis)
     * @param {number} ny  Body normal unit vector Y
     * @returns {{ fx: number, fy: number }}
     */
    lateralForceAt(i, nx, ny) {
        const signal = this._activations[i] ?? 0;
        return this.wave.lateralForceVector(i, signal, nx, ny);
    }

    /** Raw activation signal for segment i ∈ [-1, 1]. */
    activationAt(i) { return this._activations[i] ?? 0; }

    /** Set oscillation frequency, propagating to the neural clock. */
    setFrequency(hz) {
        this.clock.setFrequency(hz);
    }

    /** Current frequency (Hz). */
    get frequency() { return this.clock.frequency; }

    /** Wave amplitude setter. */
    setAmplitude(a) { this.wave.setAmplitude(a); }

    /** Phase shift setter (propagates to PhaseController). */
    setPhaseShift(rad) { this.phase.setPhaseShift(rad); }

    /** Pause/resume the CPG (organism stops swimming). */
    pause() { this.clock.pause(); }
    resume() { this.clock.resume(); }
    toggle() { this.clock.toggle(); }
}

export default CPG;
