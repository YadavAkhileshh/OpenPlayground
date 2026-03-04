/**
 * SpatialHash.js – Top-level spatial hash grid facade.
 * Provides insert, clear, and query APIs for the particle collision system.
 */

const SpatialHash = (() => {
    'use strict';

    const { BucketManager, NeighborQuery, HashUtils, Config, SpatialDebugger } = window.SDFChisel;

    let _cellSize = 0;
    let _lastCount = 0;

    /**
     * Initialize the hash for n particles at the given collision radius.
     */
    function init(n, collisionRadius) {
        _cellSize = collisionRadius * Config.SPATIAL.CELL_SIZE_MULT;
        _lastCount = n;
        BucketManager.init(n);
        NeighborQuery.setCellSize(_cellSize);
        SpatialDebugger.setCellSize(_cellSize);
    }

    /**
     * Rebuild the grid for an array of particles.
     * Clears all buckets and re-inserts every active particle.
     */
    function rebuild(particles) {
        const n = particles.length;
        if (n !== _lastCount) { BucketManager.maybeResize(n); _lastCount = n; }
        BucketManager.clearAll();
        for (let i = 0; i < n; i++) {
            const p = particles[i];
            if (!p.active) continue;
            const { cx, cy } = HashUtils.worldToCell(p.x, p.y, _cellSize);
            BucketManager.insert(cx, cy, i);
        }
    }

    /**
     * Query all neighbors within radius r of (wx, wy).
     */
    function query(wx, wy, r, particles) {
        return NeighborQuery.queryRadius(wx, wy, r, particles);
    }

    /**
     * Get cell size (for debug).
     */
    function getCellSize() { return _cellSize; }

    /**
     * Debug render.
     */
    function debugRender(ctx, canvasW, canvasH) {
        SpatialDebugger.render(ctx, canvasW, canvasH);
    }

    return { init, rebuild, query, getCellSize, debugRender };
})();

window.SDFChisel = window.SDFChisel || {};
window.SDFChisel.SpatialHash = SpatialHash;
