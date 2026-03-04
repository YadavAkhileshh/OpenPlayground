/**
 * convolution-engine.js
 * Pure time-domain convolution of a dry audio buffer with an impulse response.
 * No external DSP libraries. Block-based processing for numerical stability.
 * All output values are clamped to [-1, 1] to prevent clipping or NaN propagation.
 */

'use strict';

/* ── Constants ────────────────────────────────────────────────── */
const CE_BLOCK_SIZE = 512;   // Samples per processing block
const CE_MAX_OUTPUT = 1.0;   // Hard output ceiling

/**
 * Convolve a mono dry signal with a mono impulse response.
 * Uses direct (linear) convolution in blocks with NaN guards.
 *
 * Result length = dry.length + ir.length - 1
 * Time complexity: O(dry.length * ir.length / blockSize) per block
 *
 * @param {Float32Array} dry  Input signal samples
 * @param {Float32Array} ir   Impulse response
 * @returns {Float32Array}    Wet (convolved) signal, same length as dry
 */
function convolve(dry, ir) {
    if (!dry || !ir || dry.length === 0 || ir.length === 0) {
        return new Float32Array(dry ? dry.length : 0);
    }

    const dryLen = dry.length;
    const irLen = ir.length;
    // Full convolution length; we'll trim to dryLen at the end
    const outLen = dryLen + irLen - 1;
    const out = new Float32Array(outLen);

    // Process in blocks to reduce peak memory pressure and allow NaN checks
    for (let blockStart = 0; blockStart < dryLen; blockStart += CE_BLOCK_SIZE) {
        const blockEnd = Math.min(blockStart + CE_BLOCK_SIZE, dryLen);

        for (let n = blockStart; n < blockEnd; n++) {
            const xn = dry[n];
            if (!isFinite(xn) || xn === 0) continue;  // skip silence / non-finite

            for (let k = 0; k < irLen; k++) {
                const irk = ir[k];
                if (!isFinite(irk)) continue;
                const idx = n + k;
                if (idx < outLen) {
                    out[idx] += xn * irk;
                }
            }
        }

        // Per-block NaN sweep and running clamp
        const checkEnd = Math.min(blockEnd + irLen - 1, outLen);
        for (let i = blockStart; i < checkEnd; i++) {
            if (!isFinite(out[i])) out[i] = 0;
        }
    }

    // Final clamp pass
    for (let i = 0; i < outLen; i++) {
        if (out[i] > CE_MAX_OUTPUT) out[i] = CE_MAX_OUTPUT;
        if (out[i] < -CE_MAX_OUTPUT) out[i] = -CE_MAX_OUTPUT;
    }

    // Trim/pad to dryLen so the output AudioBuffer matches the source
    return out.subarray(0, dryLen);
}

/**
 * Mix dry and wet signals at given wet ratio.
 * @param {Float32Array} dry
 * @param {Float32Array} wet
 * @param {number} wetRatio  0 = all dry, 1 = all wet
 * @returns {Float32Array}
 */
function mixDryWet(dry, wet, wetRatio) {
    const dryRatio = 1.0 - wetRatio;
    const len = Math.min(dry.length, wet.length);
    const out = new Float32Array(len);
    for (let i = 0; i < len; i++) {
        out[i] = dry[i] * dryRatio + wet[i] * wetRatio;
        // Clamp
        if (out[i] > CE_MAX_OUTPUT) out[i] = CE_MAX_OUTPUT;
        if (out[i] < -CE_MAX_OUTPUT) out[i] = -CE_MAX_OUTPUT;
    }
    return out;
}

/**
 * Normalise a Float32Array so its peak is at targetPeak.
 * Returns the same array (mutated in place).
 * @param {Float32Array} buf
 * @param {number} [targetPeak=0.9]
 * @returns {Float32Array}
 */
function normaliseBuffer(buf, targetPeak = 0.9) {
    let peak = 0;
    for (let i = 0; i < buf.length; i++) {
        const a = Math.abs(buf[i]);
        if (a > peak) peak = a;
    }
    if (peak < 1e-10) return buf;
    const scale = targetPeak / peak;
    for (let i = 0; i < buf.length; i++) buf[i] *= scale;
    return buf;
}

/**
 * Convert a Float32Array to an AudioBuffer for playback via Web Audio API.
 * @param {AudioContext} actx
 * @param {Float32Array} data  mono samples
 * @param {number} sampleRate
 * @returns {AudioBuffer}
 */
function float32ToAudioBuffer(actx, data, sampleRate) {
    const buf = actx.createBuffer(1, data.length, sampleRate);
    buf.copyToChannel(data, 0, 0);
    return buf;
}

/**
 * Extract a mono Float32Array from an AudioBuffer channel.
 * @param {AudioBuffer} abuf
 * @param {number} [channel=0]
 * @returns {Float32Array}
 */
function audioBufferToFloat32(abuf, channel = 0) {
    const out = new Float32Array(abuf.length);
    abuf.copyFromChannel(out, channel, 0);
    return out;
}

/**
 * Generate a short click/dirac impulse for testing.
 * @param {number} len  samples
 * @returns {Float32Array}
 */
function diracImpulse(len = 512) {
    const buf = new Float32Array(len);
    buf[0] = 1.0;
    return buf;
}
