// NematodeSim — Viscosity Field
// Manages the global viscosity parameter and provides helper
// functions to translate normalized viscosity [0,1] into physics coefficients.

import Config from '../sim/Config.js';

export class ViscosityField {
    /** @param {number} initial  Normalized viscosity 0..1 */
    constructor(initial = Config.VISCOSITY_DEFAULT) {
        this._value = Math.max(Config.VISCOSITY_MIN, Math.min(Config.VISCOSITY_MAX, initial));
        this._listeners = [];   // Callbacks to notify when viscosity changes
    }

    /** Current normalized viscosity ∈ [0, 1]. */
    get value() { return this._value; }

    /**
     * Set new viscosity and notify all listeners.
     * @param {number} v  Normalized value [0, 1]
     */
    set(v) {
        const clamped = Math.max(Config.VISCOSITY_MIN, Math.min(Config.VISCOSITY_MAX, v));
        this._value = clamped;
        this._listeners.forEach(fn => fn(clamped));
    }

    /**
     * Map normalized viscosity to Verlet damping factor.
     * Higher viscosity = more damping (slower movement).
     * Range: [0.94, 0.9985]
     * @returns {number}
     */
    toDamping() {
        return 0.9985 - this._value * 0.059;
    }

    /**
     * Map normalized viscosity to Stokes µ (dynamic viscosity).
     * @returns {number}
     */
    toDynamicViscosity() {
        return 0.08 + this._value * this._value * 10.0;
    }

    /**
     * Map normalized viscosity to sub-step count.
     * Higher viscosity can need more sub-steps for stability.
     * @returns {number}  Integer in [3, 8]
     */
    toSubSteps() {
        return Math.round(3 + this._value * 5);
    }

    /**
     * Register a listener called whenever viscosity changes.
     * @param {function} fn  Callback receiving new value
     */
    onChange(fn) {
        this._listeners.push(fn);
    }

    /** Remove a previously registered listener. */
    removeListener(fn) {
        this._listeners = this._listeners.filter(l => l !== fn);
    }

    /**
     * Human-readable viscosity label.
     * @returns {string}
     */
    label() {
        const v = this._value;
        if (v < 0.25) return 'Water-like';
        if (v < 0.55) return 'Moderate';
        if (v < 0.80) return 'Viscous';
        return 'Glycerol-like';
    }
}

export default ViscosityField;
