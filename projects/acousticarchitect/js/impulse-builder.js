/**
 * impulse-builder.js
 * Converts ray-engine hit records into a mono impulse response (IR) buffer.
 * The output is a Float32Array ready for the convolution engine.
 */

'use strict';

/* ── Constants ────────────────────────────────────────────────── */
const IB_SAMPLE_RATE = 44100;   // Target sample rate (Hz)
const IB_MAX_DURATION = 2.5;    // Maximum IR duration in seconds
const IB_TAIL_DECAY = 6.0;     // Exponential tail steepness (for stability)
const IB_MIN_AMP = 1e-8;    // Amplitude floor (treat as silence)

/**
 * Build a mono impulse response Float32Array from ray hits.
 *
 * Procedure:
 *  1. Allocate buffer of length = ceil(MAX_DURATION * sampleRate)
 *  2. For each hit, convert time → sample index, add amplitude
 *  3. Apply exponential decay envelope to simulate natural fadeout
 *  4. Normalise peak to ≤ 1.0
 *  5. Apply a short raised-cosine fade-out at the tail end
 *
 * @param {Array<{time:number, amplitude:number}>} hits  from castRays()
 * @param {number} [sampleRate=44100]
 * @returns {{ir: Float32Array, sampleRate: number, duration: number}}
 */
function buildImpulseResponse(hits, sampleRate = IB_SAMPLE_RATE) {
    if (!Array.isArray(hits) || hits.length === 0) {
        // Return impulse (identity) if no hits
        const empty = new Float32Array(IB_SAMPLE_RATE);
        empty[0] = 1.0;
        return { ir: empty, sampleRate, duration: 1.0 };
    }

    // Determine buffer length needed (clamped to max duration)
    const maxTime = Math.min(
        IB_MAX_DURATION,
        Math.max(...hits.map(h => (isFinite(h.time) ? h.time : 0)))
    );
    const bufLen = Math.ceil(maxTime * sampleRate) + 1;
    const ir = new Float32Array(Math.max(bufLen, 512));

    // Accumulate hits into buffer bins
    for (const hit of hits) {
        const { time, amplitude } = hit;
        // Guard against invalid values
        if (!isFinite(time) || !isFinite(amplitude)) continue;
        if (amplitude < IB_MIN_AMP || time < 0) continue;
        if (time > IB_MAX_DURATION) continue;

        const idx = Math.floor(time * sampleRate);
        if (idx < 0 || idx >= ir.length) continue;

        // Linear blend between adjacent samples for sub-sample accuracy
        const frac = (time * sampleRate) - idx;
        ir[idx] += amplitude * (1 - frac);
        if (idx + 1 < ir.length) ir[idx + 1] += amplitude * frac;
    }

    // Apply exponential decay envelope to suppress late energy
    for (let i = 0; i < ir.length; i++) {
        const t = i / sampleRate;
        ir[i] *= Math.exp(-IB_TAIL_DECAY * t);
        // Hard clamp against NaN/Infinity from accumulation
        if (!isFinite(ir[i])) ir[i] = 0;
    }

    // Find peak
    let peak = 0;
    for (let i = 0; i < ir.length; i++) {
        const abs = Math.abs(ir[i]);
        if (abs > peak) peak = abs;
    }

    // Normalise
    if (peak > 0) {
        const inv = 1.0 / peak;
        for (let i = 0; i < ir.length; i++) {
            ir[i] *= inv;
            if (!isFinite(ir[i])) ir[i] = 0;
        }
    } else {
        // Fallback: identity impulse
        ir[0] = 1.0;
    }

    // Raised-cosine fade-out over the last 10% of the buffer
    const fadeLen = Math.floor(ir.length * 0.10);
    const fadeStart = ir.length - fadeLen;
    for (let i = fadeStart; i < ir.length; i++) {
        const frac = (i - fadeStart) / fadeLen;
        const gain = 0.5 * (1 + Math.cos(Math.PI * frac));
        ir[i] *= gain;
    }

    return { ir, sampleRate, duration: ir.length / sampleRate };
}

/**
 * Compute RT60 from built IR buffer using energy decay curve.
 * Measures how many samples until energy drops 60 dB from peak.
 * @param {Float32Array} ir
 * @param {number} sampleRate
 * @returns {number} RT60 in seconds (0 if undefined)
 */
function irRT60(ir, sampleRate) {
    if (!ir || ir.length === 0) return 0;
    let peakEnergy = 0;
    for (let i = 0; i < ir.length; i++) {
        const e = ir[i] * ir[i];
        if (e > peakEnergy) peakEnergy = e;
    }
    if (peakEnergy === 0) return 0;
    const threshold = peakEnergy * 1e-6;  // −60 dB energy
    let lastAbove = 0;
    for (let i = 0; i < ir.length; i++) {
        if (ir[i] * ir[i] >= threshold) lastAbove = i;
    }
    return lastAbove / sampleRate;
}

/**
 * Generate a simple test tone IR (decaying sine) for debugging
 * when no room/hits are available.
 * @param {number} freq   Hz
 * @param {number} decayT seconds
 * @param {number} sampleRate
 * @returns {Float32Array}
 */
function testImpulse(freq = 440, decayT = 0.5, sampleRate = IB_SAMPLE_RATE) {
    const len = Math.ceil(decayT * sampleRate * 3);
    const buf = new Float32Array(len);
    for (let i = 0; i < len; i++) {
        const t = i / sampleRate;
        buf[i] = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t / decayT);
    }
    return buf;
}
