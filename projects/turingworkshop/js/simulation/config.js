/**
 * Configuration constants for the Gray-Scott simulation.
 * @module Simulation/Config
 */

export const CONFIG = {
    // Grid settings
    GRID_WIDTH: 200,
    GRID_HEIGHT: 200,
    
    // Diffusion rates
    DA: 1.0,  // Diffusion rate for chemical A
    DB: 0.5,  // Diffusion rate for chemical B
    
    // Reaction rates (default parameters for "Solitons" like behavior)
    FEED: 0.0545, 
    KILL: 0.0620,
    
    // Time step
    DT: 1.0,
    
    // Iterations per frame (speed up simulation relative to render)
    ITERATIONS: 8
};
