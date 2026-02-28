/**
 * VectorField.js – Samples and stores the gradient vector field for visualization.
 * Builds a 2D grid of (nx, ny, magnitude) tuples for the gradient overlay display.
 */

const VectorField = (() => {
    'use strict';

    const { SDFSampler, MathUtils, Config } = window.SDFChisel;

    let _field = null; // Float32Array: [nx, ny, mag, sdf] per cell
    let _fW = 0;
    let _fH = 0;
    let _stepPx = Config.GRADIENT.FIELD_STEP;

    /**
     * (Re)build the vector field grid at the given canvas dimensions.
     * @param {number} canvasW
     * @param {number} canvasH
     * @param {number} stepPx – spacing between field cells (canvas px)
     */
    function build(canvasW, canvasH, stepPx = _stepPx) {
        if (!SDFSampler.isReady()) return;
        _stepPx = stepPx;
        _fW = Math.ceil(canvasW / stepPx);
        _fH = Math.ceil(canvasH / stepPx);
        _field = new Float32Array(_fW * _fH * 4);

        const h = Config.GRADIENT.H;
        for (let fy = 0; fy < _fH; fy++) {
            for (let fx = 0; fx < _fW; fx++) {
                const cx = (fx + 0.5) * stepPx;
                const cy = (fy + 0.5) * stepPx;
                const sdfVal = SDFSampler.sample(cx, cy);
                const gx = (SDFSampler.sample(cx + h, cy) - SDFSampler.sample(cx - h, cy)) / (2 * h);
                const gy = (SDFSampler.sample(cx, cy + h) - SDFSampler.sample(cx, cy - h)) / (2 * h);
                const mag = Math.sqrt(gx * gx + gy * gy);
                const off = (fy * _fW + fx) * 4;
                _field[off] = mag > MathUtils.EPSILON ? gx / mag : 0;
                _field[off + 1] = mag > MathUtils.EPSILON ? gy / mag : 0;
                _field[off + 2] = mag;
                _field[off + 3] = sdfVal;
            }
        }
    }

    /** Get field cell at (fx, fy). Returns { nx, ny, magnitude, sdf }. */
    function getCell(fx, fy) {
        if (!_field || fx < 0 || fy < 0 || fx >= _fW || fy >= _fH) {
            return { nx: 0, ny: 0, magnitude: 0, sdf: 0 };
        }
        const off = (fy * _fW + fx) * 4;
        return {
            nx: _field[off],
            ny: _field[off + 1],
            magnitude: _field[off + 2],
            sdf: _field[off + 3],
        };
    }

    function isReady() { return _field !== null; }
    function getSize() { return { fW: _fW, fH: _fH, stepPx: _stepPx }; }
    function reset() { _field = null; _fW = 0; _fH = 0; }

    return { build, getCell, isReady, getSize, reset };
})();

window.SDFChisel = window.SDFChisel || {};
window.SDFChisel.VectorField = VectorField;
