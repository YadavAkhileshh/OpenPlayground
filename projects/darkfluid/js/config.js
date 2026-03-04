/**
 * DarkFluid - Cinematic Fluid Simulation
 * Configuration Module
 * 
 * This file contains all the tunable parameters for the simulation.
 * Adjusting these values will drastically change the behavior and
 * aesthetic of the fluid.
 * 
 * @module Config
 */

export const Config = {
    /**
     * General Simulation Settings
     */
    SIMULATION: {
        /** The resolution of the simulation grid (N x N) */
        GRID_SIZE: 128,

        /** Time step for the physics integration (delta t). Smaller = more accurate but slower. */
        DT: 0.1,

        /** Number of iterations for the Gauss-Seidel solver (diffusion & projection). Higher = more accurate incompressibility. */
        ITERATIONS: 20,

        /** Over-relaxation parameter for the SOR solver (1.0 - 2.0). 1.9 is usually a sweet spot. */
        OVER_RELAXATION: 1.9,

        /** Whether to use vorticity confinement to enhance swirls */
        VORTICITY_CONFINEMENT: true,

        /** Strength of the vorticity confinement */
        VORTICITY_STRENGTH: 30.0
    },

    /**
     * Fluid Properties
     */
    FLUID: {
        /** Diffusion rate (how fast density spreads). 0 = internal friction only. */
        DIFFUSION: 0.0001,

        /** Viscosity (resistance to flow). High = syrup, Low = water/air. */
        VISCOSITY: 0.00001,

        /** Rate at which density dissipates over time (0.0 - 1.0). */
        DISSIPATION: 0.995,

        /** Rate at which velocity dissipates over time (0.0 - 1.0). */
        VELOCITY_DISSIPATION: 0.99,

        /** Vertical force applied every step (positive = up/buoyancy, negative = gravity) */
        BUOYANCY: 0.0
    },

    /**
     * Rendering & Aesthetic Settings
     */
    RENDER: {
        /** Canvas scaling factor. Higher means larger pixels (retro look), Lower means native res. */
        SCALE: 4,

        /** Base color for the fluid (R, G, B) */
        BASE_COLOR: { r: 10, g: 10, b: 20 },

        /** Accent color for high density areas */
        ACCENT_COLOR: { r: 0, g: 255, b: 200 }, // Dark Cyan/Teal

        /** Secondary accent for variation */
        SECONDARY_COLOR: { r: 160, g: 30, b: 255 }, // Violet

        /** Contrast multiplier for rendering */
        CONTRAST: 1.2,

        /** Brightness boost */
        BRIGHTNESS: 1.1,

        /** Render mode: 'DENSITY', 'PRESSURE', 'VELOCITY' */
        VIEW_MODE: 'DENSITY',

        /** Enable velocity-based chromatic shift */
        CHROMATIC_SHIFT: false
    },

    /**
     * Interaction Settings
     */
    INPUT: {
        /** Radius of the mouse influence cursor */
        CURSOR_RADIUS: 5,

        /** Amount of density injected per frame when dragging */
        DENSITY_INJECTION: 300,

        /** Force multiplier for velocity injection */
        FORCE_MULTIPLIER: 5.0
    },

    /**
     * Debug flags
     */
    DEBUG: {
        SHOW_VELOCITY: false,
        SHOW_FPS: true
    }
};

/**
 * Validates configuration to prevent crash-inducing values.
 */
export function validateConfig() {
    if (Config.SIMULATION.GRID_SIZE < 32 || Config.SIMULATION.GRID_SIZE > 512) {
        console.warn("Grid size is outside recommended range (32-512). Perfomance or quality may suffer.");
    }
}
