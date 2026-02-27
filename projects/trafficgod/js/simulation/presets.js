/**
 * @file presets.js
 * @description Preset scenarios for the simulation.
 */

import { CONFIG } from '../utils/constants.js';

export const PRESETS = {
    FREE_FLOW: {
        name: "Free Flow",
        description: "Low density, high speed, polite drivers.",
        params: {
            targetDensity: 40,
            a: 2.0,
            T: 1.2,
            v0: 40,
            perturbation: 0
        }
    },
    TRAFFIC_JAM: {
        name: "Traffic Jam",
        description: "High density, instability causes stop-and-go waves.",
        params: {
            targetDensity: 120,
            a: 1.0,
            T: 1.6,
            v0: 30,
            perturbation: 1.5
        }
    },
    CHAOS: {
        name: "Abrupt Chaos",
        description: "Aggressive drivers, random braking, varying speeds.",
        params: {
            targetDensity: 80,
            a: 3.0,
            T: 0.5, // Tailgating
            v0: 50,
            perturbation: 5.0
        }
    },
    HEAVY_TRUCKS: {
        name: "Heavy Cargo",
        description: "Slow trucks mixing with fast cars.",
        params: {
            targetDensity: 70,
            a: 0.8,
            T: 2.0,
            v0: 25,
            perturbation: 0.5
        }
    }
};
