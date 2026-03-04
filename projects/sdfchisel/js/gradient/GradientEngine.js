/**
 * GradientEngine.js – Top-level gradient engine facade.
 * Ties together PotentialMap, VectorField, and NumericalGradient into a unified API.
 */

const GradientEngine = (() => {
    'use strict';

    const { PotentialMap, VectorField, NumericalGradient, EventBus, Config } = window.SDFChisel;

    let _canvasW = 0;
    let _canvasH = 0;

    /**
     * Initialize/rebuild gradient engine after SDF is ready.
     */
    function init(canvasW, canvasH) {
        _canvasW = canvasW;
        _canvasH = canvasH;
        PotentialMap.build(canvasW, canvasH);
        VectorField.build(canvasW, canvasH);
    }

    /**
     * Rebuild after resize.
     */
    function resize(canvasW, canvasH) {
        _canvasW = canvasW;
        _canvasH = canvasH;
        PotentialMap.build(canvasW, canvasH);
        VectorField.build(canvasW, canvasH);
    }

    /**
     * Query gradient direction at canvas-space position.
     * Returns { nx, ny, magnitude }.
     */
    function queryGradient(cx, cy) {
        if (PotentialMap.isReady()) {
            const { nx, ny } = PotentialMap.sampleGradient(cx, cy);
            return { nx, ny, magnitude: 1 };
        }
        return NumericalGradient.normalizedGradient(cx, cy);
    }

    /**
     * Query gradient force for a particle.
     */
    function queryForce(cx, cy, speed) {
        if (!PotentialMap.isReady()) {
            return NumericalGradient.descentForce(cx, cy, speed);
        }
        return { fx: 0, fy: 0, sdfVal: 0 };
    }

    function reset() {
        PotentialMap.reset();
        VectorField.reset();
    }

    function getInfo() {
        return {
            potMap: PotentialMap.getInfo(),
            vecField: VectorField.getSize(),
            canvasW: _canvasW,
            canvasH: _canvasH,
        };
    }

    // Listen for SDF ready to auto-init
    EventBus.on(EventBus.EVENTS.SDF_READY, () => {
        if (_canvasW > 0) init(_canvasW, _canvasH);
    });

    return { init, resize, queryGradient, queryForce, reset, getInfo };
})();

window.SDFChisel = window.SDFChisel || {};
window.SDFChisel.GradientEngine = GradientEngine;
