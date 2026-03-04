/**
 * NeighborQuery.js – Query API for finding nearby particles in the spatial hash.
 * Returns particle indices within a given radius using the BucketManager.
 */

const NeighborQuery = (() => {
    'use strict';

    const { BucketManager, HashUtils, GridCell } = window.SDFChisel;

    let _cellSize = 6; // Collision radius * CELL_SIZE_MULT

    function setCellSize(sz) { _cellSize = sz; }

    /**
     * Find all particle indices within radius r of (wx, wy).
     * The result array is reused – do not store it between calls.
     */
    const _resultBuf = new Int32Array(1024);
    let _resultCount = 0;

    function queryRadius(wx, wy, r, particles) {
        _resultCount = 0;
        const rSq = r * r;

        HashUtils.eachCellInRadius(wx, wy, r, _cellSize, (cx, cy) => {
            const bucket = BucketManager.getBucket(cx, cy);
            GridCell.each(bucket, (idx) => {
                const p = particles[idx];
                if (!p || !p.active) return;
                const dx = p.x - wx, dy = p.y - wy;
                if (dx * dx + dy * dy < rSq) {
                    if (_resultCount < _resultBuf.length) {
                        _resultBuf[_resultCount++] = idx;
                    }
                }
            });
        });

        return { buf: _resultBuf, count: _resultCount };
    }

    /**
     * Find the single nearest particle to (wx, wy) within radius r.
     * Returns particle index or -1.
     */
    function queryNearest(wx, wy, r, particles) {
        let bestIdx = -1, bestDist = r * r;
        HashUtils.eachCellInRadius(wx, wy, r, _cellSize, (cx, cy) => {
            const bucket = BucketManager.getBucket(cx, cy);
            GridCell.each(bucket, (idx) => {
                const p = particles[idx];
                if (!p || !p.active) return;
                const dx = p.x - wx, dy = p.y - wy;
                const d = dx * dx + dy * dy;
                if (d < bestDist) { bestDist = d; bestIdx = idx; }
            });
        });
        return bestIdx;
    }

    return { setCellSize, queryRadius, queryNearest };
})();

window.SDFChisel = window.SDFChisel || {};
window.SDFChisel.NeighborQuery = NeighborQuery;
