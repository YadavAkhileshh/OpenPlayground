/**
 * CLAPFLASH UTILITIES
 * Pure functional helpers and global constants.
 */

export const CONSTANTS = {
    MIN_THRESHOLD: 0.05,
    DEFAULT_THRESHOLD: 0.75,
    FFT_SIZE: 2048, // Increased for better spectral analysis
    SMOOTHING_TIME: 0.1,
    SPIKE_DELTA: 0.15, // Refined for better clap sensitivity
    COOLDOWN_MS: 1200, // Slightly faster response
    FLASH_DURATION_MS: 1000,
    STORAGE_KEY_SENSITIVITY: 'clapflash_sensitivity_v2'
};

export const Utils = {
    normalize: (val) => val / 255,

    getDelta: (curr, prev) => Math.max(0, curr - prev),

    lerp: (s, e, a) => (1 - a) * s + a * e,

    clamp: (n, min, max) => Math.min(Math.max(n, min), max),

    debounce: (fn, wait) => {
        let t;
        return (...args) => {
            clearTimeout(t);
            t = setTimeout(() => fn(...args), wait);
        };
    },

    formatPct: (v) => `${Math.round(v * 100)}%`,

    log: (msg, type = 'info') => {
        const theme = {
            info: 'color: #00d4ff',
            warn: 'color: #ff9f43',
            error: 'color: #ff3e3e',
            success: 'color: #28c76f'
        };
        console.log(`%c[CLAPFLASH] %c${msg}`, 'font-weight:bold', theme[type] || theme.info);
    }
};
