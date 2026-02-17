/**
 * config.js
 * Configuration constants for LivingCanvas.
 */

const Config = {
    // Grid settings
    GRID_ROWS: 100,
    GRID_COLS: 100,
    
    // Simulation settings
    DEFAULT_SPEED: 30, // FPS target
    
    // Visual settings
    CELL_SIZE: 0, // Calculated dynamically based on canvas size
    COLOR_ALIVE: document.documentElement.style.getPropertyValue('--color-cell-alive') || '#00ffcc',
    COLOR_DEAD: document.documentElement.style.getPropertyValue('--color-cell-dead') || '#0a0a0e',
    COLOR_GRID: document.documentElement.style.getPropertyValue('--color-grid-line') || '#1a1a20',
    
    // Interaction
    DRAW_MODE: 'draw', // 'draw', 'erase', 'glider', 'spaceship'
    IS_PAUSED: true
};
