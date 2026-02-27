/**
 * SDFSampler.js – High-quality bilinear SDF sampling with canvas-space coordinate mapping.
 * Provides particle-facing query APIs used by the gradient engine.
 */

const SDFSampler = (() => {
    'use strict';

    const { DistanceField, MathUtils } = window.SDFChisel;

    // Reference to the current active SDF data (set by SDFGenerator)
    let _sdf = null;
    let _gridW = 0;
    let _gridH = 0;
    let _canvasW = 0;
    let _canvasH = 0;

    /**
     * Initialize the sampler with current SDF data.
     */
    function init(sdf, gridW, gridH, canvasW, canvasH) {
        _sdf = sdf;
        _gridW = gridW;
        _gridH = gridH;
        _canvasW = canvasW;
        _canvasH = canvasH;
    }

    /**
     * Sample SDF at canvas-space position (cx, cy).
     * Returns signed distance in canvas pixels (negative = inside glyph).
     */
    function sample(cx, cy) {
        if (!_sdf) return 0;
        // Convert canvas coords to grid coords
        const gx = (cx / _canvasW) * _gridW;
        const gy = (cy / _canvasH) * _gridH;

        // Bilinear sample
        const rawDist = DistanceField.sampleSDF(_sdf, _gridW, _gridH, gx, gy);

        // Convert from grid cells to canvas pixels
        const cellSizeX = _canvasW / _gridW;
        const cellSizeY = _canvasH / _gridH;
        const cellSize = (cellSizeX + cellSizeY) * 0.5;

        return rawDist * cellSize;
    }

    /**
     * Sample SDF in raw grid units (for gradient computation).
     */
    function sampleGrid(gx, gy) {
        if (!_sdf) return 0;
        return DistanceField.sampleSDF(_sdf, _gridW, _gridH, gx, gy);
    }

    /**
     * Return true if the canvas-space point is inside any glyph.
     */
    function isInside(cx, cy) {
        return sample(cx, cy) < 0;
    }

    /**
     * Return true if close to glyph edge (within tolerance canvas px).
     */
    function isNearEdge(cx, cy, tolerancePx = 2) {
        const d = sample(cx, cy);
        return Math.abs(d) < tolerancePx;
    }

    /**
     * Get normalized convergence value: 1 = fully converged, 0 = far from glyph.
     * @param {number} cx
     * @param {number} cy
     * @param {number} maxDist – canvas px at which convergence = 0
     */
    function convergenceValue(cx, cy, maxDist = 50) {
        const d = sample(cx, cy);
        return MathUtils.saturate(1 - Math.abs(d) / maxDist);
    }

    /**
     * Grid dimensions for external access.
     */
    function getGridInfo() {
        return {
            gridW: _gridW,
            gridH: _gridH,
            canvasW: _canvasW,
            canvasH: _canvasH,
            cellSizeX: _canvasW / (_gridW || 1),
            cellSizeY: _canvasH / (_gridH || 1),
        };
    }

    function isReady() {
        return _sdf !== null && _gridW > 0 && _gridH > 0;
    }

    return {
        init, sample, sampleGrid,
        isInside, isNearEdge, convergenceValue,
        getGridInfo, isReady,
    };
})();

window.SDFChisel = window.SDFChisel || {};
window.SDFChisel.SDFSampler = SDFSampler;
