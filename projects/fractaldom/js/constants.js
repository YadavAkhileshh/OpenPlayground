export const CONSTANTS = {
    // Zoom Physics
    ZOOM_FRICTION: 0.92,
    ZOOM_SENSITIVITY: 0.001,
    MIN_VELOCITY: 0.00001,
    MAX_VELOCITY: 0.1,
    
    // Recursion Settings
    SCALE_FACTOR: 3, // Each level is 1/3rd the size of the parent (or parent is 3x larger)
    // We use a grid of 3x3, so the center cell is exactly 1/3 scale of the container
    
    // Level Management
    MAX_LEVELS_RENDERED: 5, // How many levels deep to render DOM
    RECURSION_THRESHOLD_IN: 3, // When scale > this, generate inner level / shift
    RECURSION_THRESHOLD_OUT: 1, // When scale < this, generate outer level / shift
    
    // Visuals
    OPACITY_FADE_START: 0.5,
    OPACITY_FADE_END: 5.0,
    
    // LOD
    MIN_VISIBLE_SCALE: 0.05, // If an element is smaller than this px ratio on screen, hide it
    MAX_VISIBLE_SCALE: 5000, 
};

export const EVENTS = {
    ZOOM_UPDATE: 'zoom_update',
    LEVEL_CHANGE: 'level_change'
};
