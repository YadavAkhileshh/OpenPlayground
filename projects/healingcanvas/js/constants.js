/**
 * HealingCanvas Configuration - Expanded Architectural Parameters
 * 
 * This file contains the tuning constants for the biological simulation.
 * Adjusting these values will significantly alter the "feel" of the website.
 */

const CONFIG = {
    /**
     * Parameters governing the mouse-to-canvas trace.
     */
    DRAWING: {
        MIN_DISTANCE: 12,           // Minimum distance between points for smoothing
        SMOOTHING_FACTOR: 0.35,     // Catmull-Rom smoothing intensity
        TRACE_LIFETIME: 2500,       // Duration (ms) the red line stays on screen
        MAX_POINTS: 150,            // Safety limit for path complexity
        FLUID_WIDTH: 3.5,           // Base width of the "cut" line
        TRACE_COLOR: '#ff3e3e',     // Visceral red
        TRACE_OPACITY: 0.8          // Initial transparency
    },

    /**
     * Parameters governing the DOM splitting and physical separation.
     */
    SURGERY: {
        MIN_ELEMENT_SIZE: 60,       // Skip elements smaller than this (px)
        SPLIT_OFFSET: 25,           // Distance sections pull apart (px)
        FRAGMENT_CLASS: 'flesh-fragment',
        WOUNDED_CLASS: 'wounded',
        TRAUMA_FORCE: 1.2,          // Multiplier for separation speed
        ROTATION_JITTER: 3.0,       // Max degrees of random rotation during trauma
        BLEED_COUNT: 12,            // Number of drips per fragment
        INTERSECTION_BUFFER: 5      // Boundary padding for collision (px)
    },

    /**
     * Parameters governing the asymptotic healing curve.
     */
    RECOVERY: {
        START_DELAY: 2000,          // Time before healing begins (ms)
        HEAL_DURATION: 4000,        // Total time for reassembly (ms)
        STITCH_DENSITY: 0.08,       // Stitches per pixel of width
        STITCH_THRESHOLD: 10,       // Max gap to maintain stitch integrity
        STITCH_PULL_STRENGTH: 0.9,  // Interpolation easing factor
        REGEN_RATE: 0.05,           // Per-frame opacity restoration
        SCAR_LIFETIME: 10000        // Time until "scar" fades (ms)
    },

    /**
     * Parameters governing the visual effects and particle systems.
     */
    VFX: {
        BLOOD_DENSITY: 6,           // Particles per interaction
        STITCH_COLOR: '#ffffff',    // Pure restoration white
        WOUND_COLOR: '#ff3e3e',     // Standard arterial red
        PARTICLE_COUNT: 25,         // Burst size
        GLOW_INTENSITY: 15,         // Shadow blur radius (px)
        PULSE_FREQUENCY: 2000       // Interval for "life pulse" animation
    },

    /**
     * Parameters for the simulated "Nerve System".
     */
    NERVES: {
        SENSITIVITY: 0.85,          // Likelihood of visual feedback
        RESPONSE_TIME: 150,         // Latency for "pain" signals (ms)
        TELEMETRY_INTERVAL: 5000    // Log architectural status every N ms
    }
};

window.HealingConfig = CONFIG;

/**
 * TUNING TIPS:
 * - Increase SPLIT_OFFSET for more dramatic trauma.
 * - Decrease HEAL_DURATION for a "hyper-regenerative" feel.
 * - Increase STITCH_DENSITY for a more industrial/clinical aesthetic.
 */
