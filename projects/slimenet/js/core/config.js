/**
 * SlimeNet - Configuration
 * 
 * Central store for all simulation parameters.
 * Designed to be mutated by the UI controls.
 */

const Config = {
    // Agent Settings
    agents: {
        count: 5000,
        speed: 1.2,
        sensorAngle: 45, // Degrees (converted to rads in usage)
        sensorDist: 15,
        turnSpeed: 15, // Degrees (converted to rads in usage)
        randomSpawn: true,
        clusterSize: 100, // Radius if not random spawn
        speciesCount: 2, // 1 or 2
        interSpeciesRepulsion: 0.5 // How much species avoid each other
    },

    // New Features: Predators
    predators: {
        count: 5,
        speed: 2.0,
        radius: 10,
        force: 0.5
    },

    // Environment/Grid Settings
    grid: {
        resolution: 1.0, // Multiplier for canvas size (0.5 = half resolution, faster diffusion)
        decayRate: 0.96, // Multiplier applied every frame (0-1)
        diffuseRate: 0.1, // Factor for neighbor distribution
        pheromoneStrength: 10.0, // Intensity added by one agent per frame
        foodStrength: 50.0, // Intensity of food sources
        foodConsumption: 0.1, // How fast food shrinks
        flowX: 0,
        flowY: 0
    },

    // Rendering Settings
    render: {
        showAgents: false, // If false, only shows trails (faster & better looking)
        agentColor: '#ffffff',
        trailOpacity: 1.0,
        colorMode: 'bio', // 'bio', 'fire', 'neon', 'white'
        bloomIntensity: 0.5
    },

    // System
    system: {
        maxAgents: 20000,
        targetFPS: 60,
        paused: false
    }
};

window.Config = Config;
