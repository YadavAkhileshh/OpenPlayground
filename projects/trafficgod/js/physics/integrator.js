/**
 * @file integrator.js
 * @description Integration methods for vehicle physics.
 */

/**
 * Updates position and velocity using Euler integration.
 * @param {Object} state - { position, velocity, acceleration }
 * @param {number} dt - Time step.
 * @param {number} roadLength - Max length for wrapping.
 * @returns {Object} Updated { position, velocity }
 */
export function eulerIntegrate(state, dt, roadLength) {
    let { position, velocity, acceleration } = state;

    velocity += acceleration * dt;
    if (velocity < 0) velocity = 0;

    position += velocity * dt;

    // Wrap
    if (position > roadLength) position -= roadLength;
    if (position < 0) position += roadLength;

    return { position, velocity };
}
