/**
 * DarkFluid - Cinematic Fluid Simulation
 * Preset Manager Module
 * 
 * Handles saving, loading, and managing simulation presets via LocalStorage.
 * allowing users to persist their favorite fluid setups.
 * 
 * @module Presets
 */

import { Config } from './config.js';

export class PresetManager {
    constructor() {
        this.storageKey = 'darkfluid_presets';
        this.defaultPresets = this.generateDefaults();
    }

    /**
     * Generates the built-in default presets.
     * @returns {Array<Object>}
     */
    generateDefaults() {
        return [
            {
                name: "Default Void",
                config: {
                    FLUID: {
                        DIFFUSION: 0.0001,
                        VISCOSITY: 0.00001,
                        DISSIPATION: 0.995,
                        BUOYANCY: 0.0,
                        WIND: 0.0
                    },
                    RENDER: {
                        BASE_COLOR: { r: 10, g: 10, b: 20 },
                        ACCENT_COLOR: { r: 0, g: 255, b: 200 },
                        SECONDARY_COLOR: { r: 160, g: 30, b: 255 },
                        CONTRAST: 1.2,
                        BRIGHTNESS: 1.1,
                        GLOW: 1.0
                    },
                    SIMULATION: {
                        VORTICITY_STRENGTH: 30.0,
                        ITERATIONS: 20
                    }
                }
            },
            {
                name: "Thick Oil",
                config: {
                    FLUID: {
                        DIFFUSION: 0.00001,
                        VISCOSITY: 0.0005, // High viscosity
                        DISSIPATION: 0.998, // Slow fade
                        BUOYANCY: -0.1,    // Heavy, sinking
                        WIND: 0.0
                    },
                    RENDER: {
                        BASE_COLOR: { r: 0, g: 0, b: 0 },
                        ACCENT_COLOR: { r: 50, g: 50, b: 50 },
                        SECONDARY_COLOR: { r: 100, g: 80, b: 40 },
                        CONTRAST: 1.5,
                        BRIGHTNESS: 1.0,
                        GLOW: 0.5
                    },
                    SIMULATION: {
                        VORTICITY_STRENGTH: 10.0,
                        ITERATIONS: 40 // Higher quality for thick fluid
                    }
                }
            },
            {
                name: "Cosmic Wind",
                config: {
                    FLUID: {
                        DIFFUSION: 0.001, // High spread
                        VISCOSITY: 0.0,
                        DISSIPATION: 0.99,
                        BUOYANCY: 0.05,
                        WIND: 0.2         // Strong wind
                    },
                    RENDER: {
                        BASE_COLOR: { r: 20, g: 0, b: 40 },
                        ACCENT_COLOR: { r: 255, g: 0, b: 200 },
                        SECONDARY_COLOR: { r: 0, g: 200, b: 255 },
                        CONTRAST: 1.1,
                        BRIGHTNESS: 1.3,
                        GLOW: 2.0
                    },
                    SIMULATION: {
                        VORTICITY_STRENGTH: 60.0,
                        ITERATIONS: 10 // Fast, chaotic
                    }
                }
            }
        ];
    }

    /**
     * Loads all presets (Defaults + User Saved).
     * @returns {Array<Object>}
     */
    getPresets() {
        const saved = localStorage.getItem(this.storageKey);
        const userPresets = saved ? JSON.parse(saved) : [];
        return [...this.defaultPresets, ...userPresets];
    }

    /**
     * Saves a new preset.
     * @param {string} name 
     */
    saveCurrentAs(name) {
        const newPreset = {
            name: name,
            config: {
                FLUID: { ...Config.FLUID },
                RENDER: { ...Config.RENDER },
                SIMULATION: {
                    VORTICITY_STRENGTH: Config.SIMULATION.VORTICITY_STRENGTH,
                    ITERATIONS: Config.SIMULATION.ITERATIONS
                }
            }
        };

        const saved = localStorage.getItem(this.storageKey);
        const userPresets = saved ? JSON.parse(saved) : [];

        userPresets.push(newPreset);
        localStorage.setItem(this.storageKey, JSON.stringify(userPresets));

        return newPreset;
    }

    /**
     * Applies a preset to the global Config.
     * @param {Object} preset 
     */
    apply(preset) {
        // Deep merge logic simplified for specific structure
        Object.assign(Config.FLUID, preset.config.FLUID);
        Object.assign(Config.RENDER, preset.config.RENDER);
        Config.SIMULATION.VORTICITY_STRENGTH = preset.config.SIMULATION.VORTICITY_STRENGTH;
        Config.SIMULATION.ITERATIONS = preset.config.SIMULATION.ITERATIONS;

        // Trigger UI updates if needed (could rely on main loop picking up config)
        console.log(`Applied preset: ${preset.name}`);
        this.updateUI();
    }

    /**
     * Methods to sync UI sliders with new config values.
     */
    updateUI() {
        const event = new Event('input');

        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) {
                el.value = val;
                // We don't dispatch event to avoid recursion if listeners set config
                // check main.js listeners
            }
        };

        setVal('ctrl-visc', Config.FLUID.VISCOSITY);
        setVal('ctrl-diff', Config.FLUID.DIFFUSION);
        setVal('ctrl-diss', Config.FLUID.DISSIPATION);
        setVal('ctrl-boy', Config.FLUID.BUOYANCY);
        setVal('ctrl-wind', Config.FLUID.WIND);
        setVal('ctrl-vort', Config.SIMULATION.VORTICITY_STRENGTH);
        setVal('ctrl-iter', Config.SIMULATION.ITERATIONS);

        // Note: We need to manually trigger any side-effects if listeners do more than set config.
        // For 'ctrl-iter', main.js updates solver.iter.
        // We should probably expose an update method in main.
        if (window.DarkFluid && window.DarkFluid.updateSolverParams) {
            window.DarkFluid.updateSolverParams();
        }
    }

    /**
     * Clears user presets.
     */
    clearUserPresets() {
        localStorage.removeItem(this.storageKey);
    }
}
