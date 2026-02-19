/**
 * QuadCompress - Recursive Image Partitioning Visualization
 * Configuration & Constants
 * 
 * This file contains all the global settings and tunable parameters for the 
 * application. It serves as a central source of truth for avoiding magic numbers.
 * 
 * @module Config
 */

export const CONFIG = {
    // Application Metadata
    APP_NAME: 'QuadCompress',
    VERSION: '1.0.0',
    DEBUG_MODE: true, // Set to false in production to disable verbose logging

    // Canvas Settings
    CANVAS: {
        MAX_WIDTH: 3840,  // 4K support
        MAX_HEIGHT: 2160,
        BACKGROUND_COLOR: '#0a0b10', // Matches CSS --bg-dark
        DEFAULT_WIDTH: 800,
        DEFAULT_HEIGHT: 600
    },

    // Quadtree Algorithm Parameters
    QUADTREE: {
        MIN_NODE_SIZE: 1,        // Smallest pixel block size allowed (1x1)
        MAX_DEPTH_HARD_LIMIT: 12, // Prevent stack overflow/infinite recursion
        DEFAULT_VARIANCE_THRESHOLD: 20, // 0-255 scale
        DEFAULT_MAX_DEPTH: 8
    },

    // Animation / Rendering
    ANIMATION: {
        MAX_SPLITS_PER_FRAME: 20, // How many nodes to process per RAF loop
        // Increasing this speeds up the visualization, decreasing makes it smoother/slower.
        QUEUE_BATCH_SIZE: 50,     // Lookahead for queue processing
        RENDER_WIREFRAME_DEFAULT: true,
        WIREFRAME_COLOR: 'rgba(0, 255, 213, 0.3)', // Cyan teal with low opacity
        WIREFRAME_WIDTH: 0.5
    },

    // UI Interaction
    UI: {
        DRAG_ACTIVE_CLASS: 'drag-active', // CSS class for drag-over state
        ERROR_DISPLAY_DURATION: 3000,     // ms to show error toasts
        THROTTLE_MS: 100                  // Debounce time for resize events
    },

    // Performance Limits
    SYSTEM: {
        MAX_NODES: 200000, // Safety cap to prevent browser freezing
        WARN_NODES: 150000 // Threshold to show warning UI
    }
};

/**
 * Validates configuration integrity
 */
export function validateConfig() {
    if (CONFIG.QUADTREE.MIN_NODE_SIZE < 1) {
        throw new Error('CONFIG ERROR: MIN_NODE_SIZE must be >= 1');
    }
    console.log(`[${CONFIG.APP_NAME}] System Config Loaded. v${CONFIG.VERSION}`);
}
