/**
 * @file quadtree.js
 * @description Implements an Octree (3D equivalent of Quadtree) for spatial partitioning.
 * This is crucial for the Barnes-Hut algorithm to reduce N-body complexity from O(N^2) to O(N log N).
 * 
 * nomenclature: "Quadtree" is kept in filename as per user request, but logic is 3D Octree.
 * 
 * @module Physics
 */

import { Vector3 } from '../math/vector.js';

/**
 * Represents a node in the Octree.
 * Can be a leaf (holding a body) or an internal node (holding child octants).
 */
export class Octant {
    /**
     * Create a new Octant.
     * @param {Vector3} center - Center of this octant.
     * @param {number} size - Length of one side of the user cubic boundary.
     */
    constructor(center, size) {
        this.center = center;
        this.size = size;

        // Child nodes (0-7).
        // Standard Octree indexing:
        // 0: -x, -y, -z
        // 1: +x, -y, -z
        // 2: -x, +y, -z
        // 3: +x, +y, -z
        // 4: -x, -y, +z
        // 5: +x, -y, +z
        // 6: -x, +y, +z
        // 7: +x, +y, +z
        this.children = new Array(8).fill(null);

        // Physics properties of this node
        this.totalMass = 0;
        this.centerOfMass = new Vector3(0, 0, 0);

        // For leaf nodes: the actual body contained
        this.body = null;

        // Flag to check if it's a leaf or internal node
        this.isLeaf = true;
    }

    /**
     * Insert a body into this octant or its new/existing children.
     * @param {Body} newBody - The body to insert.
     */
    insert(newBody) {
        // If this node is empty, just put the body here
        if (this.totalMass === 0) {
            this.body = newBody;
            this.totalMass = newBody.mass;
            this.centerOfMass = newBody.position.clone();
            return;
        }

        // If this is a leaf node and already has a body, we need to subdivide
        // unless it's the exact same position (singularity check), which we ignore for stability
        if (this.isLeaf) {
            // CRITICAL FIX: Prevent infinite recursion if particles are too close
            if (this.size < 0.1) {
                // Just keep the existing body here (ignore the new one or handle list)
                // For this simulation, merging or ignoring is acceptable to prevent crash.
                // We'll effectively merge them by adding mass to this node but not storing the second body reference?
                // Or better, just return. The new body is ignored (collided/merged).
                return;
            }

            // We have an existing body 'this.body' that needs to be pushed down
            // along with the 'newBody'.
            this.isLeaf = false;

            // Push existing body down
            const existingBody = this.body;
            this.body = null; // internal nodes don't hold a single body directly
            this._pushDown(existingBody);
        }

        // Check if we are now an internal node (or became one just now)
        if (!this.isLeaf) {
            // Insert the new body into appropriate child
            this._pushDown(newBody);

            // Update center of mass and total mass
            this._updateMassProperties(newBody);
        }
    }

    /**
     * Determine which child octant a body belongs to and insert it there.
     * @param {Body} body - The body to push down.
     * @private
     */
    _pushDown(body) {
        const octantIndex = this._getOctantIndex(body.position);

        // Create child if it doesn't exist
        if (!this.children[octantIndex]) {
            const newSize = this.size / 2;
            const offset = newSize / 2;

            // Determine center of new child based on index
            const newCenter = this.center.clone();
            newCenter.x += (octantIndex & 1) ? offset : -offset;
            newCenter.y += (octantIndex & 2) ? offset : -offset;
            newCenter.z += (octantIndex & 4) ? offset : -offset;

            this.children[octantIndex] = new Octant(newCenter, newSize);
        }

        this.children[octantIndex].insert(body);
    }

    /**
     * Determine the octant index (0-7) for a position relative to this node's center.
     * @param {Vector3} pos - Position vector.
     * @returns {number} Index 0-7.
     * @private
     */
    _getOctantIndex(pos) {
        let index = 0;
        if (pos.x >= this.center.x) index |= 1; // +x
        if (pos.y >= this.center.y) index |= 2; // +y
        if (pos.z >= this.center.z) index |= 4; // +z
        return index;
    }

    /**
     * Update total mass and center of mass cumulatively.
     * R_new = (M_old * R_old + m_new * r_new) / (M_old + m_new)
     * @param {Body} body - The new body being added.
     * @private
     */
    _updateMassProperties(body) {
        const newTotalMass = this.totalMass + body.mass;

        // R * M
        const currentMoment = this.centerOfMass.multiplyScalar(this.totalMass);
        // r * m
        const bodyMoment = body.position.clone().multiplyScalar(body.mass);

        // (RM + rm) / M_new
        currentMoment.add(bodyMoment).divideScalar(newTotalMass);

        this.centerOfMass = currentMoment; // Update reference
        this.totalMass = newTotalMass;
    }
}

/**
 * The main Octree wrapper.
 * Handles bounds calculation and root creation.
 */
export class Octree {
    /**
     * Create a new Octree.
     * @param {number} size - The initial size of the root cube.
     */
    constructor(size = 100000) {
        this.root = new Octant(new Vector3(0, 0, 0), size);
    }

    /**
     * Clear the tree for rebuilding.
     * @param {number} size - New size if rebuilding with different bounds.
     * @param {Vector3} center - New center if rebuilding.
     */
    clear(size, center = new Vector3(0, 0, 0)) {
        this.root = new Octant(center, size);
    }

    /**
     * Insert a body into the tree.
     * @param {Body} body 
     */
    insert(body) {
        // Only insert if within bounds (broad phase check could go here)
        this.root.insert(body);
    }
}
