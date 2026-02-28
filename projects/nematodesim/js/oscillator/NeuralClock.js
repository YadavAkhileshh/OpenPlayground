// NematodeSim — Neural Clock (CPG Master Oscillator)
// Generates the master phase signal ω*t used by all downstream CPG modules.
// In real nematodes, the locomotion CPG is located in the ventral nerve cord.
// Here it is a simple sinusoidal clock that can be started, stopped, and tuned.

import Config from '../sim/Config.js';

export class NeuralClock {
    /**
     * @param {number} frequency  Initial frequency in Hz
     */
    constructor(frequency = Config.FREQUENCY_DEFAULT) {
        this._frequency = frequency;
        this._omega = 2 * Math.PI * frequency;   // Angular frequency (rad/s)
        this._phase = Math.random() * 2 * Math.PI; // Random start phase per organism
        this._time = 0;     // Accumulated simulation time (s)
        this._running = true;  // Pause/resume
    }

    /**
     * Advance the clock by dt seconds.
     * @param {number} dt  Timestep in seconds
     */
    tick(dt) {
        if (!this._running) return;
        this._time += dt;
        this._phase += this._omega * dt;
        // Keep phase in [0, 2π] for numerical stability
        if (this._phase > 6.2832 * 1000) {
            this._phase -= 6.2832 * 1000;
        }
    }

    /**
     * Current master phase (radians), offset by organism-specific random start.
     * @returns {number}
     */
    get phase() { return this._phase; }

    /**
     * Get the phase with an additional fixed offset (for segment propagation).
     * @param {number} offset  Angular offset in radians
     * @returns {number}
     */
    phaseAt(offset) { return this._phase + offset; }

    /**
     * Current sine value of master oscillator [-1, 1].
     * @returns {number}
     */
    signal() { return Math.sin(this._phase); }

    /**
     * Set oscillation frequency.
     * @param {number} hz  Frequency in Hz
     */
    setFrequency(hz) {
        this._frequency = Math.max(Config.FREQUENCY_MIN, Math.min(Config.FREQUENCY_MAX, hz));
        this._omega = 2 * Math.PI * this._frequency;
    }

    /** Current frequency (Hz). */
    get frequency() { return this._frequency; }

    /** Pause the clock (organism stops). */
    pause() { this._running = false; }

    /** Resume the clock. */
    resume() { this._running = true; }

    /** Toggle pause/resume. */
    toggle() { this._running = !this._running; }

    /** Hard-reset phase and time. */
    reset() {
        this._phase = Math.random() * 2 * Math.PI;
        this._time = 0;
    }
}

export default NeuralClock;
