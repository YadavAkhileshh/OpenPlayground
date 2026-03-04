/**
 * @file simulation.js
 * @description Core simulation loop and state management.
 */

import { Road } from './road.js';
import { Vehicle } from './vehicle.js';
import { CONFIG } from '../utils/constants.js';

export class Simulation {
    constructor() {
        this.road = new Road();
        this.vehicles = [];
        this.time = 0;
        this.isRunning = false;

        // Global simulation parameters (controlled by UI)
        this.params = {
            targetDensity: CONFIG.NUM_VEHICLES,
            a: CONFIG.MAX_ACCELERATION,
            T: CONFIG.SAFE_TIME_HEADWAY,
            v0: CONFIG.MAX_SPEED,
            perturbation: 1.0, // Multiplier for chaos
            timeScale: CONFIG.TIME_SCALE
        };

        // This probably belongs in renderer or main, but physics needs it.
        // Let's pass the modifiers to vehicle.update via params.
        this.currentWeatherMods = { accelMod: 1, brakeMod: 1, gapMod: 1 };

        this.init();
    }

    setWeatherMods(mods) {
        this.currentWeatherMods = mods;
    }


    init() {
        this.vehicles = [];
        this.spawnVehicles(this.params.targetDensity);
    }

    spawnVehicles(count) {
        this.vehicles = [];
        const spacing = this.road.circumference / count;

        for (let i = 0; i < count; i++) {
            // Position vehicles evenly
            const pos = i * spacing;
            const vehicle = new Vehicle(i, pos, this.road);

            // Give them initial varied speed
            vehicle.velocity = CONFIG.MAX_SPEED * (0.5 + Math.random() * 0.5);

            this.vehicles.push(vehicle);
        }
    }

    update(dt) {
        if (!this.isRunning) return;

        // Apply time scale
        const scaledDt = dt * this.params.timeScale;
        this.time += scaledDt;

        // Sort vehicles by position to correctly identify lead vehicle
        // Since it's a circle, we need to handle the wrap-around case for the last vehicle.
        // But if we keep them sorted or just find the "next" one based on position
        // The list might not be sorted if they overtake (though IDM usually prevents overtaking on single lane)
        // For efficiency, let's sort.
        this.vehicles.sort((a, b) => a.position - b.position);

        const numVehicles = this.vehicles.length;

        // Calculate accelerations first (synchronous update)
        const accelerations = new Map();

        for (let i = 0; i < numVehicles; i++) {
            const vehicle = this.vehicles[i];

            // Find lead vehicle (next one in the array, or the first one if we are at the end)
            const leadIndex = (i + 1) % numVehicles;
            const leadVehicle = this.vehicles[leadIndex];

            // We pass the global params to override vehicle defaults if needed
            // Also merge weather mods into params?
            // Vehicle.update takes globalProperties.
            // Let's attach weather mods to globalParams
            const effectiveParams = {
                ...this.params,
                weather: this.currentWeatherMods
            };

            vehicle.update(dt, leadVehicle, this.road.circumference, effectiveParams);
        }
    }

    setParam(key, value) {
        if (this.params.hasOwnProperty(key)) {
            this.params[key] = value;

            // Specific handling
            if (key === 'targetDensity') {
                // If density changed significantly, respawn or add/remove
                // For simplicity, let's respawn if the difference is large or just on reset
                // But for a slider, we might want to add/remove dynamically.
                // For now, let's just re-init if the user drags it (might be jarring)
                // Better: The UI calls init() when the slider is released, or we handle dynamic add/remove here.
                // Let's implement dynamic adjustment.
                this.adjustVehicleCount(value);
            }
        }
    }

    adjustVehicleCount(target) {
        const current = this.vehicles.length;
        if (target === current) return;

        if (target > current) {
            // Add vehicles
            const diff = target - current;
            for (let i = 0; i < diff; i++) {
                // Try to find a gap? Or just spawn at random and let physics sort it out (might crash)
                // Safest: Spawn at the end of the largest gap?
                // Simple approach: Spawn at random position
                const pos = Math.random() * this.road.circumference;
                const v = new Vehicle(this.vehicles.length + i, pos, this.road);
                this.vehicles.push(v);
            }
        } else {
            // Remove vehicles
            // Remove random ones? Or from the end?
            this.vehicles.splice(target, current - target);
        }
    }

    start() {
        this.isRunning = true;
    }

    stop() {
        this.isRunning = false;
    }

    toggle() {
        this.isRunning = !this.isRunning;
    }

    reset() {
        this.init();
        this.time = 0;
    }
}
