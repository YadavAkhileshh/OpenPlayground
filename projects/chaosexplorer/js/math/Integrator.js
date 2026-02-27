/**
 * Integrator.js
 * Implements numerical integration methods, primarily RK4.
 * 
 * The Runge-Kutta 4th order method provides high stability and accuracy
 * for visualizing chaotic systems, which are sensitive to initial conditions
 * and integration errors.
 */

import { Vector3 } from './Vector3.js';

export class Integrator {
    constructor() { }

    /**
     * Runge-Kutta 4th Order Integration Step
     * Calculates the next position based on the current state.
     * 
     * @param {Object} attractor - The system defining the differential equations.
     * @param {Vector3} current - Current position vector.
     * @param {Number} dt - Time step delta.
     * @returns {Vector3} - The new position vector.
     */
    step(attractor, current, dt) {
        // Alias for the derivative function
        const f = (v) => attractor.getDerivative(v);

        // k1 = f(y)
        const k1 = f(current);

        // k2 = f(y + k1 * dt/2)
        const p2 = current.clone().add(k1.clone().multiplyScalar(dt * 0.5));
        const k2 = f(p2);

        // k3 = f(y + k2 * dt/2)
        const p3 = current.clone().add(k2.clone().multiplyScalar(dt * 0.5));
        const k3 = f(p3);

        // k4 = f(y + k3 * dt)
        const p4 = current.clone().add(k3.clone().multiplyScalar(dt));
        const k4 = f(p4);

        // Combine derivatives: (k1 + 2k2 + 2k3 + k4) / 6
        const combined = new Vector3(0, 0, 0);
        combined.add(k1);
        combined.add(k2.multiplyScalar(2));
        combined.add(k3.multiplyScalar(2));
        combined.add(k4);
        combined.multiplyScalar(dt / 6);

        // Result = current + combined
        const result = current.clone().add(combined);

        return result;
    }
}
