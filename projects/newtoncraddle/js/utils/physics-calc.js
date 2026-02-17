import { MathUtils } from './math.js';

/**
 * @fileoverview Advanced physics derivations and math utilities.
 * 
 * Newton's Cradle Physics Derivations:
 * 
 * 1. Pendulum Equation:
 *    The motion of a simple pendulum is described by:
 *    d^2(theta)/dt^2 + (g/L) sin(theta) = 0
 * 
 *    For small angles, sin(theta) ~ theta, which leads to simple harmonic motion.
 *    However, this simulation uses the full sin(theta) for accuracy at high swings.
 * 
 * 2. Conservation of Momentum:
 *    P_initial = P_final
 *    m1v1 + m2v2 = m1v1' + m2v2'
 * 
 * 3. Conservation of Kinetic Energy (Elastic Collision):
 *    1/2 m1v1^2 + 1/2 m2v2^2 = 1/2 m1v1'^2 + 1/2 m2v2'^2
 * 
 * 4. Resultant Velocities (for m1 = m2):
 *    v1' = v2
 *    v2' = v1
 *    (They effectively swap velocities)
 */

export const PhysicsCalculations = {
    /**
     * Calculates the period of oscillation for a pendulum of length L.
     * T = 2 * PI * sqrt(L/g)
     * 
     * @param {number} length - Length in meters.
     * @param {number} gravity - Gravity in m/s^2.
     * @returns {number} Period in seconds.
     */
    calculatePeriod: (length, gravity = 9.81) => {
        return 2 * Math.PI * Math.sqrt(length / gravity);
    },

    /**
     * Calculates the potential energy relative to the rest position.
     * U = mgh = mgL(1 - cos(theta))
     * 
     * @param {number} mass - Mass in kg.
     * @param {number} length - Length in meters.
     * @param {number} angle - Angle in radians.
     * @param {number} gravity - Gravity in m/s^2.
     * @returns {number} Potential energy in Joules.
     */
    calculatePotentialEnergy: (mass, length, angle, gravity = 9.81) => {
        return mass * gravity * length * (1 - Math.cos(angle));
    },

    /**
     * Calculates the kinetic energy.
     * K = 1/2 mv^2
     * 
     * @param {number} mass - Mass in kg.
     * @param {number} velocity - Linear velocity in m/s.
     * @returns {number} Kinetic energy in Joules.
     */
    calculateKineticEnergy: (mass, velocity) => {
        return 0.5 * mass * velocity * velocity;
    },

    /**
     * Converts angular velocity to linear velocity at the bob.
     * v = omega * r
     * 
     * @param {number} angularVelocity - In rad/s.
     * @param {number} radius - In meters.
     * @returns {number} Linear velocity.
     */
    angularToLinear: (angularVelocity, radius) => {
        return angularVelocity * radius;
    },

    /**
     * Converts linear velocity to angular velocity.
     * omega = v / r
     * 
     * @param {number} linearVelocity - In m/s.
     * @param {number} radius - In meters.
     * @returns {number} Angular velocity.
     */
    linearToAngular: (linearVelocity, radius) => {
        return linearVelocity / radius;
    },

    /**
     * Resolves a 1D elastic collision between two masses.
     * 
     * @param {number} m1 - Mass 1.
     * @param {number} v1 - Velocity 1.
     * @param {number} m2 - Mass 2.
     * @param {number} v2 - Velocity 2.
     * @param {number} e - Coefficient of restitution.
     * @returns {Array<number>} [v1_final, v2_final]
     */
    resolveElasticCollision: (m1, v1, m2, v2, e = 1.0) => {
        // v1' = (m1 - e*m2)v1 + (1+e)m2v2 / (m1 + m2)
        // v2' = (m2 - e*m1)v2 + (1+e)m1v1 / (m1 + m2)

        const totalMass = m1 + m2;
        const v1Final = ((m1 - e * m2) * v1 + (1 + e) * m2 * v2) / totalMass;
        const v2Final = ((m2 - e * m1) * v2 + (1 + e) * m1 * v1) / totalMass;

        return [v1Final, v2Final];
    },

    /**
     * Calculates the drag force (air resistance).
     * F_drag = -k * v
     * 
     * @param {number} velocity - Current velocity.
     * @param {number} dragCoefficient - Damping factor.
     * @returns {number} Drag force.
     */
    calculateDrag: (velocity, dragCoefficient) => {
        return -dragCoefficient * velocity;
    }
};

/**
 * Implementation Note:
 * For the stability of the simulation, we use a semi-implicit Euler 
 * or Verlet integration. This avoids the energy gain typical of 
 * simple Euler integration.
 */
