/**
 * @file vehicle.js
 * @description Vehicle entity class managing state and history.
 */

import { CONFIG } from '../utils/constants.js';
import { calculateIDMAcceleration } from '../physics/idm.js';
import { randomRange } from '../utils/math.js';

export class Vehicle {
    constructor(id, position, road) {
        this.id = id;
        this.road = road;

        // Physics State
        this.position = position; // along the track
        this.velocity = 0;
        this.acceleration = 0;
        // Type selection
        const typeRoll = Math.random();
        let typeConfig = CONFIG.VEHICLE_TYPES.CAR;

        // Simple weighted choice (not perfect normalization but good enough)
        if (Math.random() < 0.2) typeConfig = CONFIG.VEHICLE_TYPES.TRUCK;
        else if (Math.random() < 0.1) typeConfig = CONFIG.VEHICLE_TYPES.SPORTS;

        this.length = typeConfig.length;
        this.width = typeConfig.width;

        // Parameters (Randomized slightly for realism based on type)
        this.params = {
            a: typeConfig.accel + randomRange(-0.1, 0.1),
            b: CONFIG.COMFORT_DECELERATION + randomRange(-0.1, 0.1),
            T: CONFIG.SAFE_TIME_HEADWAY + randomRange(-0.1, 0.1),
            v0: typeConfig.maxSpeed + randomRange(-2, 2),
            s0: CONFIG.MIN_GAP,
            delta: CONFIG.DELTA
        };

        // Visualization properties
        this.type = typeConfig === CONFIG.VEHICLE_TYPES.TRUCK ? 'truck' : 'car';
        this.color = CONFIG.COLOR_NORMAL;
        this.height = this.length * 3; // visual height (length)
    }

    /**
     * Update vehicle physics state.
     * @param {number} dt - Time step in seconds.
     * @param {Vehicle} leadVehicle - The vehicle directly in front.
     * @param {number} roadLength - Total length of the road (circumference).
     * @param {Object} globalParams - Global simulation overrides (sliders).
     */
    update(dt, leadVehicle, roadLength, globalParams) {
        // Apply global parameter overrides if they exist
        let accelMod = 1;

        if (globalParams) {
            this.params.a = globalParams.a !== undefined ? globalParams.a : this.params.a;
            this.params.T = globalParams.T !== undefined ? globalParams.T : this.params.T;
            this.params.v0 = globalParams.v0 !== undefined ? globalParams.v0 : this.params.v0;

            if (globalParams.weather) {
                accelMod = globalParams.weather.accelMod;
                // Modify T temporarily for weather?
                // this.params.T *= globalParams.weather.gapMod; // Don't mutate persistent param
            }
        }

        let gap = 1000; // Infinite gap if no lead (shouldn't happen on circular road with >1 cars)
        let v_lead = this.params.v0;

        if (leadVehicle) {
            // Calculate gap (taking wrap-around into account)
            let dist = leadVehicle.position - this.position;
            if (dist < 0) {
                dist += roadLength;
            }
            gap = dist - this.length; // Net gap (bumper to bumper)
            v_lead = leadVehicle.velocity;
        }

        // Safety clamp: If gap is very small, force stop or extreme braking
        if (gap < 0.1) {
            this.velocity = 0;
            this.acceleration = 0;
            // Push back slightly to resolve collision visualization
            // Not strictly physics but good for stability
        } else {
            // Calculate IDM Acceleration
            // Apply weather mods to inputs?
            // Simulating cautious drivers in rain: INCREASE T.
            const weatherT = globalParams && globalParams.weather ? this.params.T * globalParams.weather.gapMod : this.params.T;
            const weatherParams = { ...this.params, T: weatherT };

            this.acceleration = calculateIDMAcceleration(
                this.velocity,
                v_lead,
                gap,
                weatherParams
            );

            // Limit acceleration by friction
            if (this.acceleration > 0) {
                this.acceleration *= accelMod;
            } else {
                // Braking might be less effective? Or just scale it down to simulate ABS limiting?
                // Let's say max deceleration is reduced.
                const brakeMod = globalParams && globalParams.weather ? globalParams.weather.brakeMod : 1;
                // this.acceleration is negative. increasing it (closer to 0) means less braking force.
                this.acceleration *= brakeMod;
            }

            // Add perturbations (random braking)
            if (Math.random() < CONFIG.PERTURBATION_CHANCE * (globalParams ? globalParams.perturbation : 1)) {
                this.acceleration -= CONFIG.PERTURBATION_AMOUNT;
            }
        }

        // Integration (Euler)
        this.velocity += this.acceleration * dt;

        // No reverse driving
        if (this.velocity < 0) this.velocity = 0;

        this.position += this.velocity * dt;

        // Wrap around
        if (this.position > roadLength) {
            this.position -= roadLength;
        }

        // Update Color based on speed relative to max speed
        this.updateColor();
    }

    updateColor() {
        // Gradient from red (stop) to green (fast)
        // 0 km/h -> Red
        // v0 -> Green
        const ratio = this.velocity / this.params.v0;

        // Simple lerp for HSL hue: 0 (red) to 120 (green)
        // Or using our constants: Slow (Red/Pink), Fast (Cyan/Green)

        if (this.velocity < 1) {
            this.color = CONFIG.COLOR_SLOW;
        } else if (this.velocity > this.params.v0 * 0.8) {
            this.color = CONFIG.COLOR_FAST;
        } else {
            this.color = CONFIG.COLOR_NORMAL;
        }
    }
}
