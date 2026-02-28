/**
 * Constants.js
 * 
 * Centralized configuration for NoiseTV.
 * Defines all magic numbers, tuning ranges, and hardware specifications.
 */

export const CONFIG = {
    // -------------------------------------------------------------------------
    // FREQUENCY RANGES (MHz)
    // -------------------------------------------------------------------------
    FREQ: {
        MIN: 88.0,
        MAX: 108.0,
        STEP: 0.1,
        SCAN_SPEED: 0.005,
        LOCK_THRESHOLD: 0.85,
        DETECTION_RADIUS: 0.8,
        AUDIO_RANGE_MIN: 200,
        AUDIO_RANGE_MAX: 5000
    },

    // -------------------------------------------------------------------------
    // CRT VISUAL PARAMETERS
    // -------------------------------------------------------------------------
    CRT: {
        RENDER_SCALE: 0.5,
        SCANLINE_DENSITY: 4, // pixels
        FLICKER_MIN: 0.05,
        FLICKER_MAX: 0.15,
        GHOSTING_DECAY: 0.4,
        GLITCH_CHANCE_BASE: 0.02,
        GLITCH_INTENSITY_SCALE: 100,
        WARMUP_DELAY_MS: 800,
        COOLDOWN_DELAY_MS: 500
    },

    // -------------------------------------------------------------------------
    // AUDIO ENGINE PARAMETERS
    // -------------------------------------------------------------------------
    AUDIO: {
        MASTER_GAIN_MAX: 0.6,
        STATION_GAIN_MAX: 0.4,
        NOISE_GAIN_BASE: 0.8,
        FILTER_Q_MIN: 1.0,
        FILTER_Q_MAX: 15.0,
        LFO_DRIFT_FREQ: 0.5,
        LFO_DRIFT_AMP: 100,
        TWEEN_DURATION: 0.1 // seconds
    },

    // -------------------------------------------------------------------------
    // UI CONTROL LIMITS
    // -------------------------------------------------------------------------
    UI: {
        DIAL_ROTATION_MIN: -150,
        DIAL_ROTATION_MAX: 150,
        DIAL_SENSITIVITY: 1.5,
        DIAL_TWEEN: 0.1,
        MENU_NAV_COOLDOWN: 150, // ms
        METER_UPDATE_INTERVAL: 100 // ms
    },

    // -------------------------------------------------------------------------
    // THEME TINT MULTIPLIERS
    // -------------------------------------------------------------------------
    TINTS: {
        GREEN: { r: 0.4, g: 1.0, b: 0.4 },
        AMBER: { r: 1.0, g: 0.8, b: 0.2 },
        BLUE: { r: 0.2, g: 0.7, b: 1.0 },
        BW: { r: 1.0, g: 1.0, b: 1.0 }
    }
};
