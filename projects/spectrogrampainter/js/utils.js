/**
 * Utility functions for SpectrogramPainter
 */

export const Utils = {
    /**
     * Clamp a value between min and max
     */
    clamp(val, min, max) {
        return Math.min(Math.max(val, min), max);
    },

    /**
     * Map a value from one range to another linearly
     */
    map(value, inMin, inMax, outMin, outMax) {
        return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    },

    /**
     * Map a value from one range to another logarithmically
     * Useful for frequency mapping to match human hearing
     */
    mapLog(value, inMin, inMax, outMin, outMax) {
        // Avoid zero issues for log
        const minv = Math.log(outMin);
        const maxv = Math.log(outMax);
        const scale = (maxv - minv) / (inMax - inMin);
        return Math.exp(minv + scale * (value - inMin));
    },

    /**
     * Format time in MM:SS.ms
     */
    formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 100);
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    },

    /**
     * Convert frequency to Y-coordinate on canvas (0 at bottom, Height at top)
     * @param {number} freq - Frequency in Hz
     * @param {number} minFreq - Min frequency
     * @param {number} maxFreq - Max frequency
     * @param {number} height - Canvas height
     * @param {boolean} isLog - Use logarithmic scale
     */
    freqToY(freq, minFreq, maxFreq, height, isLog = true) {
        let t;
        if (isLog) {
             const minv = Math.log(minFreq);
             const maxv = Math.log(maxFreq);
             t = (Math.log(freq) - minv) / (maxv - minv);
        } else {
             t = (freq - minFreq) / (maxFreq - minFreq);
        }
        // Canvas Y is inverted (0 at top), so returns (1-t) * height
        // But we want low freq at bottom, so:
        // if low freq is at bottom (height), high freq at top (0)
        // t=0 (minFreq) -> y=height
        // t=1 (maxFreq) -> y=0
        return height - (t * height);
    },

    /**
     * Convert Y-coordinate to Frequency
     */
    yToFreq(y, minFreq, maxFreq, height, isLog = true) {
        // Invert Y first
        const t = (height - y) / height;
        
        if (isLog) {
            const minv = Math.log(minFreq);
            const maxv = Math.log(maxFreq);
            return Math.exp(minv + t * (maxv - minv));
        } else {
             return minFreq + t * (maxFreq - minFreq);
        }
    },
    
    /**
     * Generate Sine Wave Table for faster lookup (optional optimization)
     */
    generateSineTable(length = 2048) {
        const table = new Float32Array(length);
        for (let i = 0; i < length; i++) {
            table[i] = Math.sin((i / length) * Math.PI * 2);
        }
        return table;
    }
};
