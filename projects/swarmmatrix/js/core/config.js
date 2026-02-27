/**
 * js/core/config.js
 * Global configuration and constants for the simulation.
 */

export const CONFIG = {
    // Engine limits
    MAX_AGENTS: 10000,
    FPS_TARGET: 60,

    // Grid settings
    CELL_SIZE: 10, // Size of a spatial hash cell in pixels

    // Physics
    AGENT_MAX_SPEED: 4.0,
    AGENT_MAX_FORCE: 0.1,
    AGENT_RADIUS: 1.5,
    PERCEPTION_RADIUS: 40,

    // Steering Weights
    WEIGHT_ALIGNMENT: 1.0,
    WEIGHT_COHESION: 1.0,
    WEIGHT_SEPARATION: 1.5,
    WEIGHT_GRADIENT: 2.5,
    WEIGHT_OBSTACLE_AVOIDANCE: 5.0,

    // Pheromones
    PH_EVAPORATION_RATE: 0.05,
    PH_DIFFUSION_RATE: 0.1,
    PH_DEPOSIT_AMOUNT: 200,
    PH_MAX_VALUE: 1000,

    // Colors (matches CSS variables)
    COLOR_AGENT: '#ffffff',
    COLOR_AGENT_CARRYING: '#00ffcc',
    COLOR_PHERO_HOME: [0, 255, 128], // RGB
    COLOR_PHERO_FOOD: [0, 150, 255], // RGB
    COLOR_OBSTACLE: '#1a1a24',
    COLOR_RESOURCE: '#00ff88',
    COLOR_SINK: '#0088ff',

    // Render
    RENDER_TRAILS: false,
    AGENT_RENDER_MODE: 'triangle' // 'point', 'circle', 'triangle'
};
