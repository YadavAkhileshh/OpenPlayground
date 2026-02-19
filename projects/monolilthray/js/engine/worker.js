/**
 * @file worker.js
 * @description The Raymarching Engine running in a background thread.
 */

// Import dependencies
// Note: paths are relative to the worker file location in some browsers, or root.
// Usually relative to the script location.
importScripts(
    '../math/math.js',
    '../math/vec3.js',
    '../math/noise.js',
    '../sdf/primitives.js',
    '../sdf/operators.js',
    '../sdf/fractals.js',
    '../scene/world.js'
);

// Configuration
const MAX_STEPS = 128;
const MAX_DIST = 100.0;
const SURF_DIST = 0.01;

/**
 * Calculates the normal vector at point p.
 * Uses the gradient of the SDF.
 */
function getNormal(p) {
    const d = self.Scene.map(p);
    const e = new Vec3(0.01, 0, 0);

    const n = new Vec3(
        d - self.Scene.map(p.sub(new Vec3(e.x, 0, 0))),
        d - self.Scene.map(p.sub(new Vec3(0, e.x, 0))),
        d - self.Scene.map(p.sub(new Vec3(0, 0, e.x)))
    );

    return n.normalize();
}

/**
 * Calculates soft shadows.
 * @param {Vec3} ro Ray origin
 * @param {Vec3} rd Ray direction (to light)
 * @param {number} minT Minimum distance
 * @param {number} maxT Maximum distance
 * @param {number} k Softness factor
 */
function softShadow(ro, rd, minT, maxT, k) {
    let res = 1.0;
    let t = minT;
    for (let i = 0; i < 32; i++) { // Fewer steps for shadows for perf
        const h = self.Scene.map(ro.add(rd.mul(t)));
        if (h < 0.001) return 0.0;
        res = Math.min(res, k * h / t);
        t += h;
        if (t > maxT) break;
    }
    return res;
}

/**
 * Ambient Occlusion approximation.
 */
function calcAO(pos, nor) {
    let occ = 0.0;
    let sca = 1.0;
    for (let i = 0; i < 5; i++) {
        const h = 0.01 + 0.12 * i / 4.0;
        const d = self.Scene.map(pos.add(nor.mul(h)));
        occ += (h - d) * sca;
        sca *= 0.95;
    }
    return MathUtils.clamp(1.0 - 3.0 * occ, 0.0, 1.0);
}

/**
 * The main raymarch function for a single ray.
 * @param {Vec3} ro Ray Origin
 * @param {Vec3} rd Ray Direction
 * @returns {Vec3} Pixel Color
 */
/**
 * Get material properties at point p.
 */
function getMaterial(p, n) {
    // Noise texture for surface detail
    const noiseVal = Noise.perlin3(p.x * 2.0, p.y * 2.0, p.z * 2.0);

    // Base color mix
    let col = new Vec3(0.1, 0.1, 0.1); // Dark base

    // Golden veins
    if (noiseVal > 0.6) {
        col = new Vec3(0.8, 0.6, 0.2); // Gold
    }

    // Reflectivity based on smoothness (noise)
    const refl = noiseVal > 0.6 ? 0.8 : 0.1;

    return { col, refl };
}

/**
 * Main Raymarch with Reflection.
 */
function renderPixel(ro, rd) {
    let t = 0.0;
    let hit = false;

    // 1. Primary Ray
    for (let i = 0; i < MAX_STEPS; i++) {
        const p = ro.add(rd.mul(t));
        const d = self.Scene.map(p);
        if (d < SURF_DIST) { hit = true; break; }
        if (t > MAX_DIST) break;
        t += d;
    }

    // Atmosphere / Background (Gradient + Stars?)
    const dirY = (rd.y + 1.0) * 0.5;
    let finalCol = new Vec3(0.01, 0.01, 0.02).mix(new Vec3(0.05, 0.05, 0.1), dirY);

    if (!hit) {
        // Add fake stars?
        // simple noise threshold
        if (Noise.perlin3(rd.x * 50, rd.y * 50, rd.z * 50) > 0.7) {
            finalCol = finalCol.add(new Vec3(0.8, 0.8, 0.8).mul(Math.random() * 0.5)); // Sparkle
        }
        return finalCol;
    }

    // Hit Point
    const p = ro.add(rd.mul(t));
    const n = getNormal(p);

    // Material
    const mat = getMaterial(p, n);

    // Lighting
    const sunDir = new Vec3(0.5, 0.8, -0.5).normalize();
    const sunCol = new Vec3(1.0, 0.9, 0.8);
    const ambCol = new Vec3(0.05, 0.07, 0.1);

    // Shadows
    const sha = softShadow(p.add(n.mul(0.02)), sunDir, 0.02, 10.0, 8.0);

    // AO
    const ao = calcAO(p, n);

    // Diffuse
    const dif = MathUtils.clamp(n.dot(sunDir), 0.0, 1.0) * sha;

    // Specular / Reflection (One bounce)
    // If material is reflective
    let refCol = new Vec3(0, 0, 0);
    if (mat.refl > 0.0) {
        const rDir = rd.sub(n.mul(2.0 * rd.dot(n))).normalize(); // reflect

        // Short march for reflection
        let rT = 0.1;
        let rHit = false;
        for (let j = 0; j < 40; j++) {
            const rP = p.add(rDir.mul(rT));
            const rD = self.Scene.map(rP);
            if (rD < SURF_DIST) { rHit = true; break; }
            if (rT > MAX_DIST) break;
            rT += rD;
        }

        if (rHit) {
            const rHitP = p.add(rDir.mul(rT));
            const rAO = calcAO(rHitP, getNormal(rHitP));
            refCol = new Vec3(0.5, 0.5, 0.5).mul(rAO); // Grey mirror
        } else {
            // Hit Sky
            const rY = (rDir.y + 1.0) * 0.5;
            refCol = new Vec3(0.05, 0.05, 0.1).mix(new Vec3(0.1, 0.1, 0.2), rY);
        }
    }

    // Combine
    // lighting = (amb * ao) + (diffuse * sun * shadow)
    let lin = ambCol.mul(ao);
    lin = lin.add(sunCol.mul(dif));

    let col = mat.col.mul(lin);
    col = col.add(refCol.mul(mat.refl * 0.5)); // Add reflection

    // Fog (Exponential Height Fog)
    const fogDensity = 0.02;
    const fogAmt = 1.0 - Math.exp(-t * fogDensity);
    const fogCol = new Vec3(0.05, 0.06, 0.08); // Blueish fog

    col = col.mix(fogCol, fogAmt);

    return col;
}

function raymarch(ro, rd) {
    return renderPixel(ro, rd);
}


self.onmessage = function (e) {
    const { type, width, height, camera, time } = e.data;

    // Update Global Time for Physics/SDF
    self.Time = time;

    if (type === 'render') {
        const size = width * height * 4;
        const data = new Uint8ClampedArray(size); // RGBA buffer

        // Unpack camera
        // Note: Objects passed via postMessage lose prototypes (they are structured clones)
        // So we can't call vec3 methods on them directly unless we re-instantiate or just use raw values.
        // It's faster to just use raw values in the inner loop anyway.
        // Re-creating Vec3s for every pixel is expensive? 
        // Actually, "new Vec3" is very fast, but let's be careful.
        // Wait, imported Scripts don't share the main thread's memory.
        // We have Vec3 class here.

        const camOrg = Vec3.create(camera.origin.x, camera.origin.y, camera.origin.z);
        const camZ = Vec3.create(camera.zAxis.x, camera.zAxis.y, camera.zAxis.z);
        const camY = Vec3.create(camera.yAxis.x, camera.yAxis.y, camera.yAxis.z);
        const camX = Vec3.create(camera.xAxis.x, camera.xAxis.y, camera.xAxis.z);

        let index = 0;

        // Center offsets
        const cx = width * 0.5;
        const cy = height * 0.5;
        const fovScale = Math.tan(30 * MathUtils.DEG2RAD); // 60 deg vertical FOV
        const aspectRatio = width / height;

        // Loop pixels
        for (let y = 0; y < height; y++) {
            // Normalized Device Coordinates (NDC) -1 to 1, inverted Y
            // But we need to account for aspect ratio.
            const v = (1 - 2 * (y + 0.5) / height) * fovScale;

            for (let x = 0; x < width; x++) {
                const u = (2 * (x + 0.5) / width - 1) * aspectRatio * fovScale;

                // Ray Direction
                // rd = normalize(u * Right + v * Up + Forward)
                // Forward is Z (in our camera class Z is actually computed as LookAt - Pos, so it might be inverted depending on convention)
                // In standard convention, Forward is -Z. Camera.js computed Z as (Pos-Target), which is Backwards.
                // So Forward is -camZ.

                // Direction = (camX * u) + (camY * v) - camZ
                // All weighted.

                // Manual vector math for speed? No, standard add is file.
                // Optimize: accumulated x/y/z
                const dirX = camX.x * u + camY.x * v - camZ.x;
                const dirY = camX.y * u + camY.y * v - camZ.y;
                const dirZ = camX.z * u + camY.z * v - camZ.z;

                // Normalize manual
                const len = Math.sqrt(dirX * dirX + dirY * dirY + dirZ * dirZ);
                const rd = new Vec3(dirX / len, dirY / len, dirZ / len);

                const col = raymarch(camOrg, rd);

                // Write to buffer
                data[index++] = col.x * 255;
                data[index++] = col.y * 255;
                data[index++] = col.z * 255;
                data[index++] = 255; // Alpha
            }
        }

        self.postMessage({ type: 'frame', data: data }, [data.buffer]);
    }
};
