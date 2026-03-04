/**
 * js/app/Config.js
 * App-level global configuration logic
 */

const AppConfig = {
    VERSION: '1.0.0',
    MAX_TIMELINE_STEPS: 12,
    DEFAULT_QUBITS: 4,
    MAX_QUBITS: 6,

    // Auto-execution speed
    PLAYBACK_MS_PER_STEP: 600,

    // Feature toggles
    ENABLE_TOOLTIPS: true,
    ENABLE_DEBUG_LOGS: false
};

window.AppConfig = AppConfig;
