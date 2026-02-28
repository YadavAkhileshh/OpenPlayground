/**
 * HashUtils.js – Integer hashing utilities for the spatial hash grid.
 */

const HashUtils = (() => {
    'use strict';

    /**
     * Hash a 2D integer grid cell key to a bucket index.
     * Uses a multiplicative Cantor-like pairing hash.
     * @param {number} cx – integer cell x
     * @param {number} cy – integer cell y
     * @param {number} tableSize – must be power of two for bit-mask
     */
    function hashCell(cx, cy, tableSize) {
        // Large primes chosen to minimize collisions in typical particle ranges
        const h = ((cx * 1640531513) ^ (cy * 2246822519)) >>> 0;
        return h & (tableSize - 1);
    }

    /**
     * Compute the integer cell coordinates for a canvas-space position.
     */
    function worldToCell(wx, wy, cellSize) {
        return {
            cx: Math.floor(wx / cellSize),
            cy: Math.floor(wy / cellSize),
        };
    }

    /**
     * Enumerate all (cx, cy) cells within radius r of a position (wx, wy).
     * @param {number} wx
     * @param {number} wy
     * @param {number} r – search radius (canvas px)
     * @param {number} cellSize
     * @param {Function} callback(cx, cy)
     */
    function eachCellInRadius(wx, wy, r, cellSize, callback) {
        const minCx = Math.floor((wx - r) / cellSize);
        const maxCx = Math.floor((wx + r) / cellSize);
        const minCy = Math.floor((wy - r) / cellSize);
        const maxCy = Math.floor((wy + r) / cellSize);
        for (let cy = minCy; cy <= maxCy; cy++) {
            for (let cx = minCx; cx <= maxCx; cx++) {
                callback(cx, cy);
            }
        }
    }

    /**
     * Next power-of-two ≥ n, minimum 16 (for small counts).
     */
    function tableSizeFor(n) {
        let s = 16;
        while (s < n) s <<= 1;
        return s;
    }

    return {
        hashCell,
        worldToCell,
        eachCellInRadius,
        tableSizeFor,
    };
})();

window.SDFChisel = window.SDFChisel || {};
window.SDFChisel.HashUtils = HashUtils;
