/**
 * Constants and Configuration
 * Centralized configuration for the game
 */

const CONFIG = {
    // Canvas & Grid
    GRID_SIZE: 40, // px per cell
    
    // Time & Delay
    DEFAULT_DELAY_MS: 1000, // 1 second lag
    FIXED_TIMESTEP: 1000 / 60, // 60 FPS update logic
    
    // Input
    BUFFER_SIZE: 1000, // Max queued inputs (safety limit)
    
    // Colors (Must match CSS or be used in Canvas)
    COLORS: {
        BG: '#050505',
        WALL: '#1a1a1a',
        WALL_STROKE: '#333333',
        PLAYER: '#00ffcc',
        PLAYER_GHOST: 'rgba(0, 255, 204, 0.2)',
        GOAL: '#cc00ff',
        GRID: '#111111',
        DANGER: '#ff0055'
    },
    
    // Player
    PLAYER_SPEED: 0.15, // Grid cells per tick? No, let's do continuous movement.
    // Actually for a maze, grid-based or smooth?
    // Let's do smooth movement but colliding with grid.
    MOVE_SPEED: 200, // px per second
    PLAYER_RADIUS: 12,
    
    // Audio
    VOLUME: 0.5
};

// Directions mapping
const DIRECTIONS = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 },
    NONE: { x: 0, y: 0 }
};

const KEY_MAP = {
    'ArrowUp': 'UP',
    'w': 'UP',
    'W': 'UP',
    'ArrowDown': 'DOWN',
    's': 'DOWN',
    'S': 'DOWN',
    'ArrowLeft': 'LEFT',
    'a': 'LEFT',
    'A': 'LEFT',
    'ArrowRight': 'RIGHT',
    'd': 'RIGHT',
    'D': 'RIGHT'
};
