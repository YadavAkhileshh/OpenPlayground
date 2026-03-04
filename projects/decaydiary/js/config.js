/**
 * config.js
 * Central configuration for DecayDiary.
 * 
 * Includes timing constants, performance thresholds, and 
 * visual parameters.
 */

const CONFIG = {
    /**
     * Timing constants (in milliseconds)
     */
    DECAY: {
        // Time before a character starts fading (10 seconds)
        START_DELAY: 10000,
        
        // Duration of the fade animation (10 seconds)
        // Total time until removal: START_DELAY + FADE_DURATION = 20 seconds
        FADE_DURATION: 10000,
        
        // Frequency of the decay engine tick (in ms)
        // 16.6ms ~ 60fps, but we can stick to 100ms for character aging
        TICK_RATE: 100
    },

    /**
     * DOM selectors
     */
    SELECTORS: {
        WRITING_AREA: '#writing-area',
        STATUS_INDICATOR: '#status-indicator',
        CHAR_COUNT_DISPLAY: '#char-count',
        APP_CONTAINER: '#app-container'
    },

    /**
     * Performance settings
     */
    PERFORMANCE: {
        // Max characters before we start batching DOM removals
        MAX_LOAD_THRESHOLD: 5000,
        
        // Use individual timers vs a global cleanup loop
        USE_HIGH_PRECISION: true
    },

    /**
     * Visual parameters
     */
    VISUALS: {
        // Minimum opacity before DOM removal
        MIN_OPACITY: 0.05,
        
        // Blur intensity during fade
        MAX_BLUR: 2
    }
};

// Freeze config to prevent accidental modifications
Object.freeze(CONFIG);
Object.freeze(CONFIG.DECAY);
Object.freeze(CONFIG.SELECTORS);
Object.freeze(CONFIG.PERFORMANCE);
Object.freeze(CONFIG.VISUALS);
