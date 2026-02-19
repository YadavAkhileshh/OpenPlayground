
import { Vector3 } from './js/math/vector.js';
import { Particle } from './js/physics/particle.js';
import { Octree } from './js/physics/quadtree.js';
import { calculateForce } from './js/physics/barnesHut.js';
import { generateSpiralGalaxy } from './js/simulation/galaxy.js';

console.log("Starting Debug Simulation...");

try {
    const particles = [];
    const octree = new Octree(4000);

    // Gen Galaxy
    console.log("Generating Galaxy...");
    const g1 = generateSpiralGalaxy(new Vector3(0, 0, 0), 100, 300, new Vector3(0, 0, 1));
    particles.push(...g1);

    console.log(`Generated ${particles.length} particles.`);

    if (particles.length > 0) {
        console.log("Sample Particle 0 Position:", particles[0].position);
    }

    // Run 5 frames
    for (let i = 0; i < 5; i++) {
        console.log(`--- Frame ${i} ---`);

        // Build Octree
        let min = new Vector3(Infinity, Infinity, Infinity);
        let max = new Vector3(-Infinity, -Infinity, -Infinity);
        for (const p of particles) {
            if (p.position.x < min.x) min.x = p.position.x;
            if (p.position.y < min.y) min.y = p.position.y;
            if (p.position.z < min.z) min.z = p.position.z;
            if (p.position.x > max.x) max.x = p.position.x;
            if (p.position.y > max.y) max.y = p.position.y;
            if (p.position.z > max.z) max.z = p.position.z;
        }

        // Check for NaN bounds
        if (isNaN(min.x) || isNaN(max.x)) {
            console.error("BOUNDS ARE NaN!");
            break;
        }

        const size = Math.max(max.x - min.x, max.y - min.y, max.z - min.z, 100) * 1.2;
        const center = new Vector3(
            min.x + (max.x - min.x) / 2,
            min.y + (max.y - min.y) / 2,
            min.z + (max.z - min.z) / 2
        );

        octree.clear(size, center);

        for (const p of particles) {
            octree.insert(p);
        }

        if (octree.root.totalMass === 0) {
            console.error("Octree Root Mass is 0!");
        }

        // Forces
        for (const p of particles) {
            p.resetForce();
            calculateForce(p, octree.root, 0.5, 0.5, 50.0);
        }

        // Update
        for (const p of particles) {
            p.update(0.1);
            if (isNaN(p.position.x)) {
                console.error("Particle Position NaN detected!");
                break;
            }
        }

        console.log("Frame Complete. Sample P0 Pos:", particles[0].position);
    }

    console.log("Debug Complete.");

} catch (e) {
    console.error("CRASH:", e);
}
