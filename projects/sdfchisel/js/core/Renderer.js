/**
 * Renderer.js – Master rendering coordinator.
 * Manages canvas sizing, DPR, and delegates to ParticleRenderer and GradientVisualizer.
 */

const Renderer = (() => {
    'use strict';

    const { ParticleRenderer, GradientVisualizer, Config } = window.SDFChisel;

    let _sdfCanvas = null;
    let _gradCanvas = null;
    let _section = null;
    let _canvasW = 0;
    let _canvasH = 0;
    let _dpr = 1;
    let _showGrid = false;
    let _showGradient = false;
    let _showSDF = false;

    /**
     * Initialize canvases and resize to fill the container.
     */
    function init(sdfCanvas, gradCanvas, sectionEl) {
        _sdfCanvas = sdfCanvas;
        _gradCanvas = gradCanvas;
        _section = sectionEl;
        _dpr = Math.min(window.devicePixelRatio || 1, 2);
        resize();
        ParticleRenderer.init(sdfCanvas, _canvasW, _canvasH);
        GradientVisualizer.init(gradCanvas, _canvasW, _canvasH);
    }

    function resize() {
        if (!_section) return;
        const rect = _section.getBoundingClientRect();
        _canvasW = rect.width;
        _canvasH = rect.height;

        // Logical size (CSS px)
        _sdfCanvas.style.width = `${_canvasW}px`;
        _sdfCanvas.style.height = `${_canvasH}px`;
        _gradCanvas.style.width = `${_canvasW}px`;
        _gradCanvas.style.height = `${_canvasH}px`;

        // Physical size (for DPR)
        _sdfCanvas.width = Math.round(_canvasW * _dpr);
        _sdfCanvas.height = Math.round(_canvasH * _dpr);
        _gradCanvas.width = Math.round(_canvasW * _dpr);
        _gradCanvas.height = Math.round(_canvasH * _dpr);

        const sdfCtx = _sdfCanvas.getContext('2d');
        const gradCtx = _gradCanvas.getContext('2d');
        sdfCtx.scale(_dpr, _dpr);
        gradCtx.scale(_dpr, _dpr);

        ParticleRenderer.resize(_canvasW, _canvasH);
        GradientVisualizer.resize(_canvasW, _canvasH);
    }

    /**
     * One full render pass.
     */
    function render(particles) {
        ParticleRenderer.clearFrame();
        ParticleRenderer.drawParticles(particles);
        if (_showGrid) ParticleRenderer.drawGrid();
        GradientVisualizer.render(_showGradient);
    }

    function setShowGrid(v) { _showGrid = v; }
    function setShowGradient(v) {
        _showGradient = v;
        _gradCanvas.classList.toggle('visible', v || _showSDF);
    }
    function setShowSDF(v) {
        _showSDF = v;
        GradientVisualizer.setShowSDF(v);
        _gradCanvas.classList.toggle('visible', v || _showGradient);
    }

    function getCanvasSize() { return { w: _canvasW, h: _canvasH }; }
    function getSdfCanvas() { return _sdfCanvas; }
    function getGradCanvas() { return _gradCanvas; }

    return {
        init, resize, render,
        setShowGrid, setShowGradient, setShowSDF,
        getCanvasSize, getSdfCanvas, getGradCanvas,
    };
})();

window.SDFChisel = window.SDFChisel || {};
window.SDFChisel.Renderer = Renderer;
