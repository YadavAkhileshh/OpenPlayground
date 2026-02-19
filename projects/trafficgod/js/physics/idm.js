/**
 * @file idm.js
 * @description Intelligent Driver Model (IDM) physics equations.
 */

import { CONFIG } from '../utils/constants.js';

/**
 * Calculates the desired acceleration for a vehicle based on the IDM equation.
 * 
 * IDM Formula:
 * a_idm = a * [1 - (v/v0)^delta - (s* / s)^2]
 * 
 * where s* (desired gap) is:
 * s* = s0 + v*T + (v * dv) / (2 * sqrt(a * b))
 * 
 * @param {number} v - Current speed of the vehicle.
 * @param {number} v_lead - Speed of the leading vehicle.
 * @param {number} s - Current gap to the leading vehicle (net distance).
 * @param {Object} params - Vehicle parameters (a, b, T, v0, s0, delta).
 * @returns {number} The calculated acceleration.
 */
export function calculateIDMAcceleration(v, v_lead, s, params) {
    const { a, b, T, v0, s0, delta } = params;

    // 1. Free road term: 1 - (v/v0)^delta
    const freeRoadTerm = 1 - Math.pow(v / v0, delta);

    // 2. Interaction term: -(s*/s)^2
    // Calculate approach speed (delta v)
    const dv = v - v_lead;

    // Calculate desired gap s*
    // Term 3: (v * dv) / (2 * sqrt(a * b))
    const dynamicGap = (v * dv) / (2 * Math.sqrt(a * b));

    // s* = s0 + v*T + dynamicGap
    const s_star = s0 + (v * T) + dynamicGap;

    const interactionTerm = Math.pow(s_star / s, 2);

    return a * (freeRoadTerm - interactionTerm);
}
