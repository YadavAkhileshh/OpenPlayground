// config.js

const CONFIG = {
    // Canvas settings
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,

    // Initial population
    INITIAL_PREY: 40,
    INITIAL_PREDATORS: 6,
    INITIAL_FOOD: 30,

    // Evolution settings
    MUTATION_RATE: 0.5, // 50% chance to mutate a trait
    MUTATION_AMOUNT: 0.1, // Variation percentage (+/- 10%)

    // Prey settings (Base stats)
    PREY: {
        RADIUS: 6,
        MAX_SPEED: 3.5,
        MAX_FORCE: 0.2, // Steering force limit
        WANDER_STRENGTH: 0.1,
        FLEE_DISTANCE: 120,
        FLEE_STRENGTH: 3.5,
        SEPARATION_DISTANCE: 25,
        SEPARATION_STRENGTH: 2.0,
        FOOD_DETECTION: 100,
        FOOD_ATTRACTION: 2.5,
        MAX_ENERGY: 120,
        ENERGY_DECAY: 0.05,
        ENERGY_FROM_FOOD: 50,
        REPRODUCE_THRESHOLD: 100,
        REPRODUCE_COST: 50,
        COLOR: '#00ff9d' // Neon Green
    },

    // Predator settings (Base stats)
    PREDATOR: {
        RADIUS: 10,
        MAX_SPEED: 3.0,
        MAX_FORCE: 0.15,
        WANDER_STRENGTH: 0.1,
        CHASE_DISTANCE: 180,
        CHASE_STRENGTH: 3.0,
        SEPARATION_DISTANCE: 40,
        SEPARATION_STRENGTH: 1.5,
        CATCH_DISTANCE: 10, // Slightly easier catch
        MAX_ENERGY: 200,
        ENERGY_DECAY: 0.06,
        ENERGY_FROM_PREY: 90,
        REPRODUCE_THRESHOLD: 150,
        REPRODUCE_COST: 70,
        COLOR: '#ff0055' // Neon Red/Pink
    },

    // Food settings
    FOOD: {
        RADIUS: 3,
        SPAWN_INTERVAL: 100, // Faster spawn
        MAX_FOOD: 60,
        COLOR: '#fbbf24'
    },

    // World settings
    WORLD: {
        BOUNDARY_MARGIN: 40,
        BOUNDARY_FORCE: 1.5,
        TRAIL_OPACITY: 0.25,
        DAY_NIGHT_CYCLE_LENGTH: 60, // Seconds per full day
        NIGHT_DARKNESS: 0.85 // Max opacity of darkness overlay
    },

    // Brain settings
    BRAIN: {
        INPUTS: 4,  // [Energy, NearestFoodDist, NearestPredatorDist, NearestMateDist]
        HIDDEN: 6,
        OUTPUTS: 3  // [WanderWt, FleeWt, ChaseWt]
    }
};