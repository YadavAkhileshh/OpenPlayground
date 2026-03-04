/**
 * GradientVisualizer.js – Renders the gradient vector field onto the gradient canvas.
 * Draws color-coded arrows representing the SDF gradient direction and magnitude.
 */

const GradientVisualizer = (() => {
    'use strict';

    const { VectorField, Color, SDFSampler, Config, MathUtils } = window.SDFChisel;

    let _ctx = null;
    let _canvasW = 0;
    let _canvasH = 0;
    let _showSDF = false;

    function init(gradientCanvas, canvasW, canvasH) {
        _ctx = gradientCanvas.getContext('2d');
        _canvasW = canvasW;
        _canvasH = canvasH;
    }

    function setShowSDF(v) { _showSDF = v; }

    /**
     * Render the gradient vector field + optional SDF heatmap.
     */
    function render(showGradient) {
        if (!_ctx) return;
        _ctx.clearRect(0, 0, _canvasW, _canvasH);

        // ── SDF heatmap ───────────────────────────────────────────────────────
        if (_showSDF && SDFSampler.isReady()) {
            _renderSDFHeatmap();
        }

        // ── Gradient arrows ────────────────────────────────────────────────────
        if (showGradient && VectorField.isReady()) {
            _renderGradientArrows();
        }
    }

    function _renderSDFHeatmap() {
        const imageData = _ctx.createImageData(_canvasW, _canvasH);
        const data = imageData.data;
        const step = 2; // sample every N pixels for performance
        for (let py = 0; py < _canvasH; py += step) {
            for (let px = 0; px < _canvasW; px += step) {
                const sdf = SDFSampler.sample(px, py);
                const range = 40;
                const t = MathUtils.saturate((sdf + range) / (2 * range));
                const c = Color.sampleSDF(t);
                const alpha = sdf < 0 ? 130 : 70;
                for (let dy = 0; dy < step && py + dy < _canvasH; dy++) {
                    for (let dx = 0; dx < step && px + dx < _canvasW; dx++) {
                        const off = ((py + dy) * _canvasW + (px + dx)) * 4;
                        data[off] = c.r;
                        data[off + 1] = c.g;
                        data[off + 2] = c.b;
                        data[off + 3] = alpha;
                    }
                }
            }
        }
        _ctx.putImageData(imageData, 0, 0);
    }

    function _renderGradientArrows() {
        const { fW, fH, stepPx } = VectorField.getSize();
        const arrowScale = Config.GRADIENT.ARROW_SCALE;
        const minMag = Config.GRADIENT.ARROW_MIN_MAG;

        for (let fy = 0; fy < fH; fy++) {
            for (let fx = 0; fx < fW; fx++) {
                const cell = VectorField.getCell(fx, fy);
                if (cell.magnitude < minMag) continue;

                const cx = (fx + 0.5) * stepPx;
                const cy = (fy + 0.5) * stepPx;
                const len = Math.min(cell.magnitude, 1.0) * arrowScale;
                const t = MathUtils.saturate(cell.magnitude);
                const c = Color.sampleGradient(t);
                const alpha = MathUtils.lerp(0.35, 0.9, t);

                _ctx.save();
                _ctx.strokeStyle = Color.toCss(c.r, c.g, c.b, alpha);
                _ctx.fillStyle = Color.toCss(c.r, c.g, c.b, alpha);
                _ctx.lineWidth = 1.2;
                _ctx.translate(cx, cy);
                _ctx.rotate(Math.atan2(cell.ny, cell.nx));
                _ctx.beginPath();
                _ctx.moveTo(-len / 2, 0);
                _ctx.lineTo(len / 2, 0);
                _ctx.stroke();
                // Arrow head
                _ctx.beginPath();
                _ctx.moveTo(len / 2, 0);
                _ctx.lineTo(len / 2 - 4, -3);
                _ctx.lineTo(len / 2 - 4, 3);
                _ctx.closePath();
                _ctx.fill();
                _ctx.restore();
            }
        }
    }

    function resize(w, h) {
        _canvasW = w; _canvasH = h;
    }

    return { init, render, setShowSDF, resize };
})();

window.SDFChisel = window.SDFChisel || {};
window.SDFChisel.GradientVisualizer = GradientVisualizer;
