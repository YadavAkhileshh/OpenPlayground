/**
 * Verification Script.
 * Runs a headless simulation to verify stability and performance logic.
 * Intended to be run via Node.js or imported in the browser.
 */

import { SimulationEngine } from '../simulation/engine.js';
import { Analysis } from '../simulation/analysis.js';

console.log("Starting TuringWorkshop Verification...");

// 1. Setup
const width = 200;
const height = 200;
const sim = new SimulationEngine(width, height);
const analysis = new Analysis(sim);

// 2. Initial State Check
const statsInit = analysis.getStatistics();
console.log("Initial Stats:", statsInit);

if (statsInit.minA !== 1 || statsInit.maxA !== 1) {
    console.error("FAIL: Initial grid A should be all 1.0");
}
if (statsInit.minB !== 0 || statsInit.maxB !== 0) {
    console.error("FAIL: Initial grid B should be all 0.0");
}

// 3. Seed
sim.seed(100, 100, 10);
const statsSeeded = analysis.getStatistics();
console.log("Seeded Stats:", statsSeeded);

if (statsSeeded.maxB !== 1) {
    console.error("FAIL: Seeding failed to set B to 1.0");
}

// 4. Run Simulation Loop
console.log("Running 100 iterations...");
const start = performance.now();
for (let i = 0; i < 100; i++) {
    sim.update();
}
const end = performance.now();
console.log(`Time taken: ${(end - start).toFixed(2)}ms`);

// 5. Stability Check
const statsEnd = analysis.getStatistics();
console.log("End Stats:", statsEnd);

if (isNaN(statsEnd.avgA) || isNaN(statsEnd.avgB)) {
    console.error("FAIL: Simulation produced NaN values.");
} else {
    console.log("PASS: Simulation values are valid numbers.");
}

// 6. Range Check
if (statsEnd.minA < 0 || statsEnd.maxA > 1 || statsEnd.minB < 0 || statsEnd.maxB > 1) {
    console.warn("WARNING: Values outside [0,1] range (clamping logic might be failing or slightly leaky before clamp).");
} else {
    console.log("PASS: Values contained within [0,1].");
}

console.log("Verification Complete.");
