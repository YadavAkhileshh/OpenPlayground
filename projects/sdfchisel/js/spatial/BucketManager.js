/**
 * BucketManager.js – Manages the hash bucket array for the open-addressing spatial hash.
 * Provides bulk clear and resize operations without GC pressure.
 */

const BucketManager = (() => {
    'use strict';

    const { GridCell, HashUtils } = window.SDFChisel;

    let _buckets = null;
    let _tableSize = 0;

    /**
     * Initialize the bucket array for n particles.
     */
    function init(n) {
        _tableSize = HashUtils.tableSizeFor(Math.max(n * 2, 64));
        _buckets = new Array(_tableSize);
        for (let i = 0; i < _tableSize; i++) _buckets[i] = GridCell.create();
    }

    /**
     * Clear all buckets without GC.
     */
    function clearAll() {
        for (let i = 0; i < _tableSize; i++) GridCell.clear(_buckets[i]);
    }

    /**
     * Insert particle index into the bucket for cell (cx, cy).
     */
    function insert(cx, cy, particleIdx) {
        const b = HashUtils.hashCell(cx, cy, _tableSize);
        GridCell.add(_buckets[b], particleIdx);
    }

    /**
     * Get bucket for cell (cx, cy).
     */
    function getBucket(cx, cy) {
        const b = HashUtils.hashCell(cx, cy, _tableSize);
        return _buckets[b];
    }

    function getTableSize() { return _tableSize; }

    /**
     * Resize if particle count has changed significantly.
     */
    function maybeResize(n) {
        const needed = HashUtils.tableSizeFor(n * 2);
        if (needed !== _tableSize) init(n);
    }

    return {
        init, clearAll, insert, getBucket,
        getTableSize, maybeResize,
    };
})();

window.SDFChisel = window.SDFChisel || {};
window.SDFChisel.BucketManager = BucketManager;
