/**
 * @file constants.js
 * @description Configuration constants for the TrafficGod simulation.
 */

export const CONFIG = {
    // Canvas & World
    CANVAS_ID: 'traffic-canvas',
    FPS: 60,

    // Road
    ROAD_RADIUS: 250,
    ROAD_WIDTH: 60,
    ROAD_COLOR: '#222',
    ROAD_BORDER_COLOR: '#444',

    // Vehicle Defaults (IDM)
    VEHICLE_LENGTH: 5,        // meters (visual scale)
    MIN_GAP: 2,               // s0: minimum gap (meters)
    SAFE_TIME_HEADWAY: 1.5,   // T: safe time headway (seconds)
    MAX_ACCELERATION: 1.0,     // a: max acceleration (m/s^2)
    COMFORT_DECELERATION: 2.0, // b: comfortable deceleration (m/s^2)
    MAX_SPEED: 30,            // v0: desired speed (m/s)
    DELTA: 4,                 // acceleration exponent

    // Vehicle Types
    VEHICLE_TYPES: {
        CAR: {
            length: 5,
            width: 12,
            maxSpeed: 35,
            accel: 1.5,
            weight: 0.8 // Probability weight
        },
        TRUCK: {
            length: 12,
            width: 14,
            maxSpeed: 20,
            accel: 0.8,
            weight: 0.2
        },
        SPORTS: {
            length: 4.5,
            width: 12,
            maxSpeed: 50,
            accel: 2.5,
            weight: 0.1
        }
    },

    // Simulation
    dt: 1 / 60,               // Timestep (seconds)
    TIME_SCALE: 1.0,          // Default time multiplier
    NUM_VEHICLES: 30,         // Initial density
    PERTURBATION_CHANCE: 0.01,// Chance to brake randomly
    PERTURBATION_AMOUNT: 2,   // Braking amount (m/s^2)

    // Colors
    COLOR_FAST: '#00ffaa',
    COLOR_SLOW: '#ff0055',
    COLOR_NORMAL: '#ffffff'
};
