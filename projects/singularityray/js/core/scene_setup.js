/**
 * SingularityRay JS - Core - Scene Setup
 * Constructs the scene graph equivalent for the SDF engine.
 * Binds the physical objects to the math distance functions.
 */

import { MatID } from '../render/materials.js';
import { SDFOperations } from '../physics/sdf_operations.js';

export class SceneSetup {
    /**
     * @param {import('../physics/blackhole.js').BlackHole} blackHole 
     * @param {import('../physics/accretion_disk.js').AccretionDisk} disk 
     */
    constructor(blackHole, disk) {
        this.blackHole = blackHole;
        this.disk = disk;

        // Debug bounds box
        this.debugBoxSize = { x: 10, y: 10, z: 10 };
        this.showBounds = false;

        // Return structured map to avoid object allocation in hot loop
        this.mapResult = {
            dist: 0.0,
            id: MatID.NONE
        };
    }

    setShowBounds(val) {
        this.showBounds = val;
    }

    /**
     * The master distance function for the entire universe.
     * Evaluates all objects and returns the closest hit and its material ID.
     * @param {import('../math/vec3.js').Vec3} p Point in space
     * @param {number} currentMass Used for scaling bounds
     * @returns {{dist: number, id: number}}
     */
    map(p, currentMass) {
        // 1. Black Hole Event Horizon
        const dBH = this.blackHole.mapEventHorizon(p);

        // 2. Accretion Disk Envelope
        const dDisk = this.disk.mapEnvelope(p, currentMass);

        // Find minimum distance (Union of geometries)
        if (dBH < dDisk) {
            this.mapResult.dist = dBH;
            this.mapResult.id = MatID.BLACK_HOLE;
        } else {
            this.mapResult.dist = dDisk;
            this.mapResult.id = MatID.ACCRETION_DISK;
        }

        // Optional Debug Bounds Visualization
        if (this.showBounds) {
            // Draw a wireframe or solid box representing the simulated volume
            // Box SDF
            const dx = Math.abs(p.x) - (this.debugBoxSize.x * currentMass);
            const dy = Math.abs(p.y) - (this.debugBoxSize.y * currentMass);
            const dz = Math.abs(p.z) - (this.debugBoxSize.z * currentMass);

            const maxDx = Math.max(dx, 0);
            const maxDy = Math.max(dy, 0);
            const maxDz = Math.max(dz, 0);

            const distOutside = Math.sqrt(maxDx * maxDx + maxDy * maxDy + maxDz * maxDz);
            const distInside = Math.min(Math.max(dx, Math.max(dy, dz)), 0.0);
            let dBox = distOutside + distInside;

            // Make it a hollow frame by subtracting an inner box
            dBox = Math.max(dBox, -(dBox + 0.1));

            if (dBox < this.mapResult.dist) {
                this.mapResult.dist = dBox;
                this.mapResult.id = MatID.DEBUG;
            }
        }

        return this.mapResult;
    }
}
