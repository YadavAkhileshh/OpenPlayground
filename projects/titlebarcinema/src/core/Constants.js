/**
 * TitleBarCinema - Constants.js
 * 
 * ============================================================================
 * ARCHITECTURAL OVERVIEW
 * ============================================================================
 * This file serves as the Single Source of Truth (SSOT) for the TitleBarCinema
 * engine. It contains all the hardcoded configuration values, ASCII sprite
 * definitions, and state enumerations required for the game to function.
 * 
 * The design philosophy for this engine is "Title-First," meaning all logic
 * is optimized for the constraints of the browser tab title bar, specifically:
 * 1. Low framerate (document.title updates are throttled by browsers).
 * 2. Limited width (titles truncate after a certain number of characters).
 * 3. Mono-space vs Proportional spacing (we assume a generic sans-serif title font).
 * 
 * ============================================================================
 * MODULE METADATA
 * ============================================================================
 * @project TitleBarCinema
 * @module Core.Constants
 * @version 1.1.0
 * @stability Stable
 * @author Antigravity
 */

/**
 * @constant {Object} CONFIG
 * @description Centralized game balance and engine performance settings.
 * 
 * - TITLE_UPDATE_INTERVAL: Browsers like Chrome and Firefox throttle document.title
 *   updates to prevent tab flickering. An interval of 150-200ms is generally
 *   considered safe and provides a smooth "stop-motion" animation feel.
 * 
 * - WORLD_LENGTH: The number of characters that can comfortably fit in a standard
 *   tab title before the browser truncates with an ellipsis.
 */
export const CONFIG = {
    /** @type {number} Milliseconds between each frame tick */
    TITLE_UPDATE_INTERVAL: 150,

    /** @type {number} Total character width of the animation viewport */
    WORLD_LENGTH: 45,

    /** @type {number} Gravity force applied per tick (downward acceleration) */
    GRAVITY: 0.8,

    /** @type {number} Initial vertical velocity when jumping */
    JUMP_FORCE: -6,

    /** @type {number} Fixed horizontal position of the player (0 to WORLD_LENGTH) */
    PLAYER_START_X: 5,

    /** @type {number} Base speed at which the world moves (chars per tick) */
    SCROLL_SPEED: 1,

    /** @type {number} Horizontal distance threshold for obstacle spawning */
    OBSTACLE_SPAWN_RATE: 0.05,

    /** @type {string} Default font used by the engine for local rendering */
    DEFAULT_FONT: "'Inter', sans-serif"
};

/**
 * @constant {Object} SPRITES
 * @description The ASCII visual asset library.
 * These characters are chosen for their distinct silhouettes in small sizes.
 */
export const SPRITES = {
    /** @type {Array<string>} Running animation sequence */
    RUN: ["🏃", "👟"],

    /** @type {string} Sprite for upward momentum */
    JUMP: "🦘",

    /** @type {string} Sprite for downward momentum */
    FALL: "📉",

    /** @type {string} Sprite displayed upon collision */
    CRASH: "💥",

    /** @type {string} Ground-based obstacle: Cactii-like barrier */
    BARRIER: "🌵",

    /** @type {string} Aerial-based obstacle: Bird */
    BIRD: "🦅",

    /** @type {string} Ground-based obstacle: Rolling rock */
    ROCK: "🪨"
};

/**
 * @constant {Object} STATE
 * @description State Machine Enumerations.
 */
export const STATE = {
    /** The game is loaded but not yet started */
    IDLE: 'IDLE',
    /** The main game loop is active */
    PLAYING: 'PLAYING',
    /** The player has collided and the game has stopped */
    GAMEOVER: 'GAMEOVER',
    /** The game loop is suspended explicitly by the user */
    PAUSED: 'PAUSED'
};

/**
 * @constant {Object} SELECTORS
 * @description DOM Element ID and Class references.
 */
export const SELECTORS = {
    /** The preformatted text area for the in-page preview */
    PRE_CINEMA: '#pre-cinema',
    /** Primary control for starting the movie */
    BTN_PLAY: '#btn-play',
    /** Control for pausing the current session */
    BTN_PAUSE: '#btn-pause',
    /** Reset button to clear scores and state */
    BTN_RESET: '#btn-reset'
};

/**
 * @constant {Object} WORLD
 * @description Environmental character sets.
 */
export const WORLD = {
    /** Character used for the sky/empty space */
    SKY: " ",
    /** Character used for the ground/floor layer */
    GROUND: "_",
};

/**
 * @constant {Object} MESSAGES
 * @description Text strings used for title bar feedback during non-gameplay states.
 */
export const MESSAGES = {
    /** Initial tab title on load */
    WELCOME: "🎬 TitleBarCinema - Look at your Tab!",
    /** Displayed when the player dies */
    GAME_OVER: "🎬 GAME OVER! - Space to Restart",
    /** Displayed when paused */
    PAUSED: "🎬 PAUSED - Click to Resume",
    /** Short-lived countdown or start message */
    START: "🎬 STARTING MOVIE..."
};

