/**
 * PotentialMap.js – Precomputed potential field over the canvas from the SDF.
 * Used to accelerate per-particle force queries via grid-based lookup.
 */

const PotentialMap = (() => {
    'use strict';

    const { SDFSampler, MathUtils, Config } = window.SDFChisel;

    let _potX = null; // Float32Array of gradient X per cell
    let _potY = null; // Float32Array of gradient Y per cell
    let _potW = 0;
    let _potH = 0;
    let _cellW = 0;
    let _cellH = 0;
    let _canvasW = 0;
    let _canvasH = 0;

    /**
     * Build the potential map at a lower resolution than the SDF grid.
     * @param {number} canvasW
     * @param {number} canvasH
     * @param {number} resolution – cells per canvas width
     */
    function build(canvasW, canvasH, resolution = 80) {
        _canvasW = canvasW;
        _canvasH = canvasH;
        _potW = resolution;
        _potH = Math.max(1, Math.round(resolution * (canvasH / canvasW)));
        _cellW = canvasW / _potW;
        _cellH = canvasH / _potH;

        const size = _potW * _potH;
        _potX = new Float32Array(size);
        _potY = new Float32Array(size);

        const h = Config.GRADIENT.H;

        for (let py = 0; py < _potH; py++) {
            for (let px = 0; px < _potW; px++) {
                const cx = (px + 0.5) * _cellW;
                const cy = (py + 0.5) * _cellH;
                const sxp = SDFSampler.sample(cx + h, cy);
                const sxm = SDFSampler.sample(cx - h, cy);
                const syp = SDFSampler.sample(cx, cy + h);
                const sym = SDFSampler.sample(cx, cy - h);
                const gx = (sxp - sxm) / (2 * h);
                const gy = (syp - sym) / (2 * h);
                const mag = Math.sqrt(gx * gx + gy * gy);
                _potX[py * _potW + px] = mag > MathUtils.EPSILON ? gx / mag : 0;
                _potY[py * _potW + px] = mag > MathUtils.EPSILON ? gy / mag : 0;
            }
        }
    }

    /**
     * Bilinear sample of the precomputed gradient at canvas-space (cx, cy).
     * Returns { nx, ny } normalized gradient direction.
     */
    function sampleGradient(cx, cy) {
        if (!_potX) return { nx: 0, ny: 0 };
        const gx = MathUtils.clamp(cx / _cellW - 0.5, 0, _potW - 1.001);
        const gy = MathUtils.clamp(cy / _cellH - 0.5, 0, _potH - 1.001);
        const x0 = Math.floor(gx), y0 = Math.floor(gy);
        const x1 = Math.min(x0 + 1, _potW - 1);
        const y1 = Math.min(y0 + 1, _potH - 1);
        const tx = gx - x0, ty = gy - y0;
        const i00 = y0 * _potW + x0, i10 = y0 * _potW + x1;
        const i01 = y1 * _potW + x0, i11 = y1 * _potW + x1;
        const nx = MathUtils.bilinear(_potX[i00], _potX[i10], _potX[i01], _potX[i11], tx, ty);
        const ny = MathUtils.bilinear(_potY[i00], _potY[i10], _potY[i01], _potY[i11], tx, ty);
        return { nx, ny };
    }

    function isReady() { return _potX !== null; }

    function reset() {
        _potX = null; _potY = null;
        _potW = 0; _potH = 0;
    }

    function getInfo() {
        return { potW: _potW, potH: _potH, cellW: _cellW, cellH: _cellH };
    }

    return { build, sampleGradient, isReady, reset, getInfo };
})();

window.SDFChisel = window.SDFChisel || {};
window.SDFChisel.PotentialMap = PotentialMap;
