/**
 * @fileoverview Configuration constants for the Newton's Cradle simulation.
 * Includes physical properties, visual settings, and interaction constraints.
 */

export const CONFIG = {
    // Physical Constants
    GRAVITY: 9.81,           // Earth's gravity (m/s^2)
    DAMPING: 0.9997,         // Air resistance / friction (1.0 = none)
    RESTITUTION: 0.99,       // Elasticity of collisions (0.99 for chrome steel)
    BALL_MASS: 1.0,          // Mass of each ball (kg)
    PIXELS_PER_METER: 50.0,  // Scale factor for physics simulations

    // Core Simulation Components
    BALL_RADIUS: 24,         // Ball radius (px)
    BALL_COUNT: 5,           // Number of pendulums
    STRING_LENGTH: 320,      // Length from anchor to ball center (px)
    SUB_STEPS: 12,           // Physics steps per frame for stability

    // Layout
    ANCHOR_BASE_Y: 50,       // Vertical position of the frame top bar (px)
    SPACING_FACTOR: 1.0,     // Tightness (1.0 = balls touch at rest)

    // Visual Palette
    COLORS: {
        BALL: '#ffffff',
        STRING: '#cbd5e1',
        HIGHLIGHT: 'rgba(255, 255, 255, 0.8)',
        FRAME: 'linear-gradient(to bottom, #d1d5db, #4b5563)',
        BACKGROUND: '#0f172a'
    },

    // Audio Tuning
    SFX_VOLUME: 0.4,         // Master audio volume
    SFX_GAIN_SCALE: 1.5,     // Scalar for intensity to volume mapping

    // Interaction
    MAX_SWING: 85,           // Max drag angle (degrees)
    DRAG_FRICTION: 0.9       // Smoothing factor for interactions
};

export const DERIVED = {
    BALL_DIAMETER: CONFIG.BALL_RADIUS * 2,
    RADIUS_SQ: CONFIG.BALL_RADIUS * CONFIG.BALL_RADIUS,
    PI_RAD: Math.PI / 180,
    TWO_PI: Math.PI * 2
};
