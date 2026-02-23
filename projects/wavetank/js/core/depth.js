/**
 * depth.js — Depth Map Utilities
 * Provides helpers for converting depth values to wave speed,
 * and a reference color map for the depth overlay visualization.
 */

/**
 * Maps a depth byte (0–255) to a wave speed coefficient (0.05–0.48).
 * Shallow (0) = slow; Deep (255) = fast.
 * @param {number} depthByte - 0 to 255
 * @param {number} maxSpeed  - maximum wave speed (default 0.48)
 * @returns {number} wave speed coefficient
 */
export function depthToSpeed(depthByte, maxSpeed = 0.48) {
    return 0.05 + (depthByte / 255) * (maxSpeed - 0.05);
}

/**
 * Returns an RGBA color array representing the depth value for overlay rendering.
 * Deep water  → dark blue (transparent)
 * Shallow     → warm sandy tan (more opaque)
 * @param {number} depthByte - 0 to 255
 * @returns {[number, number, number, number]} RGBA 0–255
 */
export function depthToColor(depthByte) {
    const t = depthByte / 255; // 0 = shallow, 1 = deep

    // Shallow: sandy #c8a96e → Deep: ocean #0a2a4a
    const r = Math.round(lerp(200, 10, t));
    const g = Math.round(lerp(169, 42, t));
    const b = Math.round(lerp(110, 74, t));
    const a = Math.round(lerp(180, 60, t)); // shallower is more visible

    return [r, g, b, a];
}

/**
 * Linear interpolation helper.
 * @param {number} a
 * @param {number} b
 * @param {number} t - 0..1
 */
function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Fills a depth map buffer with a circular shallow zone (shoal).
 * Useful for demonstrations / presets.
 * @param {Uint8Array} depthBuf - flat grid depth buffer
 * @param {number} width
 * @param {number} height
 * @param {number} cx   - center column
 * @param {number} cy   - center row
 * @param {number} r    - radius in cells
 * @param {number} val  - depth value to paint (0 = shallowest)
 */
export function paintShoal(depthBuf, width, height, cx, cy, r, val) {
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dx = x - cx;
            const dy = y - cy;
            if (dx * dx + dy * dy <= r * r) {
                depthBuf[y * width + x] = val;
            }
        }
    }
}
