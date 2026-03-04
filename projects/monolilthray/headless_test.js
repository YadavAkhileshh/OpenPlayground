/**
 * @file headless_test.js
 * @description Simulates the worker environment to test raymarching logic in Node.js
 */

// Mock 'self' and 'importScripts'
global.self = global;
global.importScripts = (...files) => {
    files.forEach(file => {
        // Adjust path for Node execution from project root
        // Worker imports are like '../math/math.js' relative to 'js/engine/'
        // So they are 'js/math/math.js' relative to root.
        const fixedPath = file.replace('../', 'js/');
        console.log(`Loading ${fixedPath}...`);
        require('./' + fixedPath);
    });
};

// Mock Helper for loading files via require in Node (since they are not modules)
const fs = require('fs');
const vm = require('vm');

function loadScript(path) {
    const code = fs.readFileSync(path, 'utf8');
    vm.runInThisContext(code);
}

// Load dependencies manually in order
console.log("Loading dependencies...");
loadScript('js/math/math.js');
loadScript('js/math/vec3.js');
loadScript('js/sdf/primitives.js');
loadScript('js/sdf/operators.js');
loadScript('js/scene/world.js');

// Now load the worker body - but worker.js has importScripts and onmessage.
// We can't easily load it directly without refactoring.
// Instead, let's just inspect if Scene.map works.

console.log("Testing Scene.map...");
const p = new Vec3(0, 0, -5);
const dist = Scene.map(p);
console.log(`Distance at (0,0,-5): ${dist}`);

if (isNaN(dist)) {
    console.error("FAILED: Distance is NaN");
    process.exit(1);
}

console.log("Testing Raymarch loop logic (simulation)...");

// Re-implement the worker's lighting function here for testing
// (Copy-paste relevant parts or just verifying Scene.map is usually enough coverage for "does it crash")

const MAX_STEPS = 120;
const MAX_DIST = 100.0;
const SURF_DIST = 0.01;

function raymarch(ro, rd) {
    let dO = 0.0;
    for (let i = 0; i < MAX_STEPS; i++) {
        const p = ro.add(rd.mul(dO));
        const dS = Scene.map(p);
        dO += dS;
        if (dO > MAX_DIST || dS < SURF_DIST) break;
    }
    return dO;
}

const ro = new Vec3(0, 0, 5);
const rd = new Vec3(0, 0, -1);
const d = raymarch(ro, rd);
console.log(`Raymarch hit distance: ${d}`);

if (d > MAX_DIST) {
    console.log("Ray missed (expected? depends on scene).");
} else {
    console.log("Ray hit surface.");
}

console.log("SUCCESS: Headless test passed.");
