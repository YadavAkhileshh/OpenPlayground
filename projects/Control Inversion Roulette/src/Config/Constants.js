/**
 * Control Inversion Roulette - Configuration & Constants
 * 
 * This file contains all the global settings for the game, including
 * physics constants, colors, scoring values, and system configurations.
 * Centralizing these makes balancing and tweaking the game much easier.
 */

export const CONFIG = {
    // Screen & Display
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    FRAME_RATE: 60,

    // Game Loop
    IS_DEBUG: false,

    // Player Settings
    PLAYER: {
        SIZE: 20,
        SPEED: 300, // Pixels per second
        COLOR: '#00ffcc',
        ACCELERATION: 15,
        FRICTION: 0.90,
        MAX_HEALTH: 100,
        HIT_INVULNERABILITY_TIME: 1000, // ms
        DASH_COOLDOWN: 2000, // ms
        DASH_SPEED_MULTIPLIER: 3,
        DASH_DURATION: 150 // ms
    },

    // Enemy Settings
    ENEMY: {
        BASE_SIZE: 15,
        BASE_SPEED: 100,
        SPAWN_rate_INITIAL: 2000, // ms
        SPAWN_RATE_MIN: 500,
        COLORS: {
            CHASER: '#ff0055',
            SHOOTER: '#ffaa00',
            DASHER: '#cc00ff',
            ORBIT: '#00ccff',
            BOSS: '#ff0000'
        }
    },

    // Combat
    BULLET: {
        SPEED: 450,
        SIZE: 4,
        LIFETIME: 2000, // ms
        COLOR: '#ffff00',
        DAMAGE: 10
    },

    // Control Roulette
    CONTROLS: {
        SWAP_INTERVAL: 10000, // ms
        WARNING_TIME: 3000, // ms (Time before swap to warn player)
        ACTIONS: {
            UP: 'MOVE UP',
            DOWN: 'MOVE DOWN',
            LEFT: 'MOVE LEFT',
            RIGHT: 'MOVE RIGHT',
            SHOOT: 'SHOOT',
            DASH: 'DASH' // New action
        }
    },

    // Particles
    PARTICLES: {
        MAX_COUNT: 1000,
        COLORS: ['#ff0055', '#00ffcc', '#ffff00', '#ffffff'],
        TYPES: {
            EXPLOSION: 'explosion',
            TRAIL: 'trail',
            SPARK: 'spark'
        }
    },

    // Audio (Frequencies for synthesis)
    AUDIO: {
        ENABLED: true,
        VOLUME: 0.3
    },

    // Colors Palette (Neon Theme)
    COLORS: {
        BACKGROUND: '#1a1a1a',
        TEXT: '#ffffff',
        PRIMARY: '#00ffcc',
        SECONDARY: '#ff00ff',
        ACCENT: '#ffcc00',
        DANGER: '#ff0055',
        UI_BG: 'rgba(0, 0, 0, 0.8)'
    }
};

export const ALIASES = {
    // Key aliases for better display
    ' ': 'Space',
    'ArrowUp': 'Up',
    'ArrowDown': 'Down',
    'ArrowLeft': 'Left',
    'ArrowRight': 'Right'
};
