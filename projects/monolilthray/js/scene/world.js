/**
 * @file world.js
 * @description The "Mythological Geometry" scene definition.
 */

// Use 'self' to attach to worker scope
if (typeof self !== 'undefined') {
    self.Scene = {
        /**
         * Global Map function - The heart of the world.
         * Returns the closest distance to any object in the scene.
         * @param {Vec3} p Point in space
         * @returns {number} Signed distance
         */
        map: (p) => {
            // -- Time-based Morphing --
            const t = self.Time || 0;

            // -- The Central Monolith --
            // A twisted box structure, repeating slightly
            const centerP = p.clone();
            const twistedP = Ops.twist(centerP, 0.4 + Math.sin(t * 0.5) * 0.1);

            // Base shape: A tall box
            const boxDist = SDF.box(twistedP, new Vec3(1.0, 4.0, 1.0));

            // Morph into a Sphere slightly
            const sphereDist = SDF.sphere(p, 3.5);
            const morphFactor = Math.sin(t * 0.2) * 0.5 + 0.5; // 0 to 1

            // A smooth blend between Box and Sphere
            let d = Ops.smoothUnion(boxDist, sphereDist, 2.0 * morphFactor);

            // -- Ground --
            const groundP = p.clone();
            const displacement = Math.sin(groundP.x * 2.0) * Math.sin(groundP.z * 2.0) * 0.2;
            const planeDist = SDF.plane(groundP, -4.0) + displacement;

            d = Ops.smoothUnion(d, planeDist, 2.0);

            // -- Floating Artifacts (Fractals) --
            // Menger Sponge orbiting
            const orbitR = 6.0;
            const orbitSpeed = 0.3;
            // Simple rotation
            const ang = t * orbitSpeed;
            const s = Math.sin(ang);
            const c = Math.cos(ang);
            const floatP = p.clone();

            // Translate
            floatP.x -= s * orbitR;
            floatP.y -= 2 + Math.sin(t) * 0.5;
            floatP.z -= c * orbitR;

            const fractalDist = Fractals.crossMenger(floatP);

            return Ops.union(d, fractalDist);
        }
    };
}
