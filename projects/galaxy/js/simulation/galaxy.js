/**
 * @file galaxy.js
 * @description Utilities to generate spiral galaxy initial conditions.
 * 
 * @module Simulation
 */

import { Particle } from '../physics/particle.js';
import { Vector3 } from '../math/vector.js';

/**
 * Generates a spiral galaxy.
 * @param {Vector3} center - Center position of the galaxy.
 * @param {number} numParticles - Number of particles.
 * @param {number} radius - Approximate radius of the galaxy.
 * @param {Vector3} normal - Normal vector defining the galaxy plane.
 * @param {number} initialVelocityScale - Multiplier for orbital velocity (1 = circular).
 * @param {string} colorTheme - 'blue' or 'red' for styling.
 * @returns {Array<Particle>} Array of generated particles.
 */
export function generateSpiralGalaxy(center, numParticles, radius, normal, initialVelocityScale = 1.0, colorTheme = 'blue') {
    const particles = [];
    const coreMass = 1000 * numParticles; // Supermassive black hole equivalent

    // Create central body (black hole) - Optional, or just dense cluster
    // For visual purposes, we leave the center empty-ish but assume high mass for velocity calc

    // Rotation matrix to align galaxy with normal vector
    // Standard galaxy is in X-Y plane (normal = 0,0,1)
    // We need to rotate [x,y,0] to be perpendicular to 'normal'

    // Simplification: We assume near 2D planes for now, but in 3D space.
    // We'll generate in XY and apply rotation.

    const baseNormal = new Vector3(0, 0, 1);
    const rotationAxis = baseNormal.cross(normal).normalize();
    const rotationAngle = Math.acos(baseNormal.dot(normal.normalize()));

    // Quaternion or Axis-Angle rotation logic would be better here, 
    // but we can hack it with simple axis transformations or just keep it simple.

    // Helper to rotate vector 'v' around 'axis' by 'angle'
    const rotateVector = (v, axis, angle) => {
        if (Math.abs(angle) < 0.001) return v;
        // Rodrigues' rotation formula
        // v_rot = v cos(a) + (k x v) sin(a) + k(k.v)(1-cos(a))
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const k = axis;

        const kxv = k.cross(v);
        const kdotv = k.dot(v);

        return v.multiplyScalar(c)
            .add(kxv.multiplyScalar(s))
            .add(k.multiplyScalar(kdotv * (1 - c)));
    };

    for (let i = 0; i < numParticles; i++) {
        // Distance distribution (denser in center)
        // Using a power law or exponential decay
        const dist = radius * Math.pow(Math.random(), 2); // favor center

        // Angle: Spiral arms
        // theta = offset + a * dist
        const armOffset = (Math.floor(Math.random() * 2) * Math.PI); // 2 arms
        const angle = armOffset + (0.5 * dist) + (Math.random() * 0.5); // 0.5 is spiral tightness

        // Position in local XY plane
        const localX = Math.cos(angle) * dist;
        const localY = Math.sin(angle) * dist;
        // Small z variation for thickness
        const localZ = (Math.random() - 0.5) * (radius * 0.05);

        let pos = new Vector3(localX, localY, localZ);

        // Rotate to match requested normal
        pos = rotateVector(pos, rotationAxis, rotationAngle);

        // Shift to center
        pos.add(center);

        // Calculate Velocity for circular orbit around center of galaxy
        // v = sqrt(GM/r)
        // We approximate M as the mass inside the radius 'dist'.
        // For a disk, M ~ r^2 * density, but let's approximate with point mass at center for stability
        // Better: Softened gravity + disk mass approx
        const G = 0.5; // Tweaked constant for simulation feel
        const effectiveMass = coreMass; // + (numParticles * 10 * (dist/radius)); // Simplified
        let velMag = Math.sqrt((G * effectiveMass) / Math.max(dist, 1)) * initialVelocityScale;

        // Velocity direction: tangent to position (in local plane)
        // Tangent of (cos, sin) is (-sin, cos)
        let localVelX = -Math.sin(angle) * velMag;
        let localVelY = Math.cos(angle) * velMag;
        let localVelZ = 0;

        let vel = new Vector3(localVelX, localVelY, localVelZ);
        vel = rotateVector(vel, rotationAxis, rotationAngle);

        // Add bulk velocity of the galaxy itself? (Handled by caller usually, but we can assume 0 relative)

        // Color generation
        let h, s, l;
        if (colorTheme === 'blue') {
            // Hot blue/cyan core, fading to purple/white
            h = 180 + Math.random() * 60; // 180-240
            s = 80;
            l = 70 + Math.random() * 30;
        } else {
            // Red/Orange/Gold
            h = 0 + Math.random() * 60; // 0-60
            s = 90;
            l = 60 + Math.random() * 40;
        }

        const mass = 1.0 + Math.random(); // Slight mass variation
        const size = Math.random() > 0.99 ? 3 : (Math.random() > 0.9 ? 1.5 : 0.8); // Occasional bright stars

        particles.push(new Particle(
            mass,
            pos,
            vel,
            `hsl(${h}, ${s}%, ${l}%)`,
            size
        ));
    }

    return particles;
}
