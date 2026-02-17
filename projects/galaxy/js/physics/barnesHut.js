/**
 * @file barnesHut.js
 * @description Logic for calculating forces using the Barnes-Hut algorithm with the Octree.
 * 
 * @module Physics
 */

import { Vector3 } from '../math/vector.js';

/**
 * Calculates and applies gravitational forces to a body using the octree.
 * @param {Body} body - The body to calculate forces for.
 * @param {Octant} node - The current tree node being evaluated.
 * @param {number} theta - The accuracy parameter (usually 0.5).
 * @param {number} G - Gravitational constant.
 * @param {number} epsilon - Softening parameter to avoid singularities.
 */
export function calculateForce(body, node, theta, G, epsilon) {
    // 1. If node is empty, do nothing
    if (node.totalMass === 0) return;

    // 2. Calculate vector from body to node center of mass
    const dx = node.centerOfMass.x - body.position.x;
    const dy = node.centerOfMass.y - body.position.y;
    const dz = node.centerOfMass.z - body.position.z;

    const distSq = dx * dx + dy * dy + dz * dz;
    const dist = Math.sqrt(distSq);

    // 3. If node is a leaf (contains a single body)
    if (node.isLeaf) {
        // Ensure we aren't calculating force on self
        if (node.body !== body) {
            // Direct force calculation
            // F = G * m1 * m2 / (r^2 + epsilon^2) * normalize(r)
            const strength = (G * body.mass * node.body.mass) / (distSq + epsilon * epsilon);
            const fx = strength * (dx / dist);
            const fy = strength * (dy / dist);
            const fz = strength * (dz / dist);

            body.force.x += fx;
            body.force.y += fy;
            body.force.z += fz;
        }
        return;
    }

    // 4. Internal Node: Apply Barnes-Hut approximation criterion
    // s / d < theta
    // s = width of region represented by internal node
    if ((node.size / dist) < theta) {
        // Use the node as a single super-body
        const strength = (G * body.mass * node.totalMass) / (distSq + epsilon * epsilon);
        const fx = strength * (dx / dist);
        const fy = strength * (dy / dist);
        const fz = strength * (dz / dist);

        body.force.x += fx;
        body.force.y += fy;
        body.force.z += fz;
    } else {
        // 5. Recursion: Node is too close, go deeper into children
        for (let i = 0; i < 8; i++) {
            if (node.children[i]) {
                calculateForce(body, node.children[i], theta, G, epsilon);
            }
        }
    }
}
