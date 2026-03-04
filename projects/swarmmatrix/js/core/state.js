/**
 * js/core/state.js
 * Centralized state management for the application.
 */

import { events } from './events.js';
import { CONFIG } from './config.js';

class StateManager {
    constructor() {
        this.state = {
            // App state
            isRunning: true,
            isPaused: false,

            // Environment dimensions
            width: window.innerWidth,
            height: window.innerHeight,

            // Simulation params tunable via UI
            evaporationRate: CONFIG.PH_EVAPORATION_RATE,
            agentSpeedLimit: CONFIG.AGENT_MAX_SPEED,
            noiseFieldIntensity: 0.2, // Arbitrary initialization

            // Behavior weights tunable via UI
            weightAlignment: CONFIG.WEIGHT_ALIGNMENT,
            weightCohesion: CONFIG.WEIGHT_COHESION,
            weightSeparation: CONFIG.WEIGHT_SEPARATION,
            weightGradient: CONFIG.WEIGHT_GRADIENT,

            // Debug rendering flags
            debugVectors: false,
            debugHeatmap: true,
            debugSpatial: false,

            // Tool state
            activeTool: 'select',
            brushSize: 40,

            // Telemetry
            currentFPS: 0,
            agentCount: 0,
            currentTick: 0,
            entropy: 0
        };
    }

    get(key) {
        return this.state[key];
    }

    set(key, value) {
        if (this.state[key] !== value) {
            this.state[key] = value;
            events.emit(`state:${key}`, value);
            events.emit('state:change', { key, value });
        }
    }

    toggle(key) {
        this.set(key, !this.get(key));
    }
}

export const state = new StateManager();
