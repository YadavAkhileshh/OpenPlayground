/**
 * Constants.js
 * 
 * This file contains all the global configuration constants for the One-Button Economy game.
 * Centralizing these values allows for easy tweaking of gameplay mechanics, visual settings,
 * and system parameters.
 */

export const GAME_CONFIG = {
    // Canvas settings
    WIDTH: 800,
    HEIGHT: 600,
    BACKGROUND_COLOR: '#f0f2f5',

    // Game Loop settings
    FPS: 60,
    TIME_STEP: 1 / 60,

    // Debug settings
    DEBUG_MODE: false,
    SHOW_HITBOXES: false,
    SHOW_FPS: true
};

export const INPUT_CONFIG = {
    // Timing thresholds (in milliseconds)
    SHORT_PRESS_MAX: 200,    // Maximum duration for a short press (Move)
    LONG_PRESS_MIN: 201,     // Minimum duration for a long press (Attack)
    DOUBLE_PRESS_WINDOW: 300 // Maximum time between two clicks to register a double press (Dash)
};

export const PHYSICS_CONFIG = {
    GRAVITY: 0,             // Top-down game, so no gravity by default
    FRICTION: 0.9,          // Friction applied to velocity per frame
    DRAG: 0.05,             // Air drag
    MIN_VELOCITY: 0.1       // Velocity cutoff to stop movement
};

export const PLAYER_CONFIG = {
    // Base stats
    SIZE: 40,
    COLOR: '#667eea',
    SPEED: 5,
    DASH_SPEED: 15,
    DASH_DURATION: 300,    // ms
    ATTACK_DURATION: 400,  // ms
    ATTACK_COOLDOWN: 500,  // ms,
    MAX_HEALTH: 100,

    // Visuals
    IDLE_COLOR: '#667eea',
    MOVE_COLOR: '#5a67d8',
    ATTACK_COLOR: '#e53e3e',
    DASH_COLOR: '#ecc94b',
    HURT_COLOR: '#e53e3e'
};

export const ENEMY_CONFIG = {
    // Standard Enemy
    BASIC: {
        SIZE: 30,
        COLOR: '#e53e3e',
        SPEED: 2,
        HEALTH: 30,
        DAMAGE: 10,
        DETECTION_RADIUS: 200
    },
    // Fast Enemy
    SCOUT: {
        SIZE: 20,
        COLOR: '#ed8936',
        SPEED: 4,
        HEALTH: 15,
        DAMAGE: 5,
        DETECTION_RADIUS: 300
    },
    // Heavy Enemy
    TANK: {
        SIZE: 50,
        COLOR: '#2d3748',
        SPEED: 1,
        HEALTH: 80,
        DAMAGE: 20,
        DETECTION_RADIUS: 150
    }
};

export const EVENTS = {
    // System Events
    GAME_START: 'GAME_START',
    GAME_PAUSE: 'GAME_PAUSE',
    GAME_OVER: 'GAME_OVER',
    GAME_RESET: 'GAME_RESET',

    // Input Events
    INPUT_MOVE: 'INPUT_MOVE',
    INPUT_ATTACK: 'INPUT_ATTACK',
    INPUT_DASH: 'INPUT_DASH',

    // Entity Events
    ENTITY_BUILT: 'ENTITY_BUILT',
    ENTITY_DESTROYED: 'ENTITY_DESTROYED',
    ENTITY_DAMAGED: 'ENTITY_DAMAGED',
    ENTITY_HEALED: 'ENTITY_HEALED',

    // Player Events
    PLAYER_MOVED: 'PLAYER_MOVED',
    PLAYER_ATTACKED: 'PLAYER_ATTACKED',
    PLAYER_DASHED: 'PLAYER_DASHED',
    PLAYER_DIED: 'PLAYER_DIED',

    // UI Events
    SCORE_UPDATED: 'SCORE_UPDATED',
    MESSAGE_LOGGED: 'MESSAGE_LOGGED'
};

export const UI_CONFIG = {
    FONT_FAMILY: "'Inter', sans-serif",
    FONT_SIZE_SMALL: "12px",
    FONT_SIZE_MEDIUM: "16px",
    FONT_SIZE_LARGE: "24px",
    FONT_SIZE_XL: "48px",

    TEXT_COLOR_PRIMARY: "#333",
    TEXT_COLOR_SECONDARY: "#718096",
    TEXT_COLOR_HIGHLIGHT: "#667eea"
};
