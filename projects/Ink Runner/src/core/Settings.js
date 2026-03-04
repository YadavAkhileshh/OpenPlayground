/**
 * Settings.js
 * Global configuration and constants for Ink Runner.
 */

export const Settings = {
    // Canvas & Rendering
    CANVAS_WIDTH: 1920, // Internal resolution width
    CANVAS_HEIGHT: 1080, // Internal resolution height
    ASPECT_RATIO: 16 / 9,
    BACKGROUND_COLOR: '#f4f1ea',
    
    // Physics
    GRAVITY: 1500, // Pixels per second squared
    TERMINAL_VELOCITY: 1000,
    
    // Player
    PLAYER_WIDTH: 60,
    PLAYER_HEIGHT: 100,
    PLAYER_START_X: 200,
    PLAYER_JUMP_FORCE: -800,
    PLAYER_RUN_SPEED: 400, // Initial speed
    PLAYER_MAX_SPEED: 1200,
    PLAYER_ACCELERATION: 10, // Speed increase per second
    
    // World Generation
    STROKE_MIN_WIDTH: 200,
    STROKE_MAX_WIDTH: 600,
    GAP_MIN_WIDTH: 100,
    GAP_MAX_WIDTH: 300,
    PLATFORM_HEIGHT_VARIATION: 150, // Max height difference between platforms
    BUFFER_ZONE: 2000, // Lookahead distance for generation
    CLEANUP_ZONE: 1000, // Distance behind player to remove objects
    
    // Ink
    INK_COLOR: '#2c3e50',
    INK_THICKNESS: 8,
    INK_DRYING_SPEED: 0.1, // Opacity loss per second after some time
    
    // Debug
    DEBUG_MODE: false,
    SHOW_HITBOXES: false,
};

export const GameStates = {
    LOADING: 'LOADING',
    MENU: 'MENU',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    GAME_OVER: 'GAME_OVER'
};

export const Events = {
    GAME_START: 'GAME_START',
    GAME_OVER: 'GAME_OVER',
    GAME_RESET: 'GAME_RESET',
    PLAYER_JUMP: 'PLAYER_JUMP',
    PLAYER_LAND: 'PLAYER_LAND',
    PLAYER_HIT: 'PLAYER_HIT', // Hit obstacle
    SCORE_UPDATE: 'SCORE_UPDATE',
    STROKE_CREATED: 'STROKE_CREATED',
    WINDOW_RESIZE: 'WINDOW_RESIZE'
};
