/**
 * ParticleState.js – Aggregates particle system statistics and manages state flags.
 * Tracks convergence, FPS, average distances, etc.
 */

const ParticleState = (() => {
    'use strict';

    let _convergedCount = 0;
    let _totalActive = 0;
    let _avgSdf = 0;
    let _avgSpeed = 0;
    let _avgForce = 0;
    let _frameCount = 0;
    let _fps = 0;
    let _lastFpsTime = performance.now();
    let _fpsFrames = 0;
    let _isScattering = false;

    /**
     * Update statistics from a batch step result.
     * @param {{ convergedCount, total, avgSdf }} stepResult
     * @param {Array} particles
     */
    function update(stepResult, particles) {
        _convergedCount = stepResult.convergedCount;
        _totalActive = stepResult.total;
        _avgSdf = stepResult.avgSdf;
        _frameCount++;
        _fpsFrames++;

        // FPS every 30 frames
        const now = performance.now();
        if (now - _lastFpsTime >= 500) {
            _fps = Math.round(_fpsFrames / ((now - _lastFpsTime) / 1000));
            _fpsFrames = 0;
            _lastFpsTime = now;
        }

        // Average speed
        let speedSum = 0, forceSum = 0;
        let counted = 0;
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            if (!p.active) continue;
            speedSum += p.speed;
            forceSum += Math.abs(p.sdfVal);
            counted++;
        }
        if (counted > 0) {
            _avgSpeed = speedSum / counted;
            _avgForce = forceSum / counted;
        }
    }

    function getConvergedPercent() {
        return _totalActive > 0 ? (_convergedCount / _totalActive) * 100 : 0;
    }

    function getFPS() { return _fps; }
    function getConverged() { return _convergedCount; }
    function getTotal() { return _totalActive; }
    function getAvgSdf() { return _avgSdf; }
    function getAvgSpeed() { return _avgSpeed; }
    function getAvgForce() { return _avgForce; }
    function getFrameCount() { return _frameCount; }
    function isScattering() { return _isScattering; }
    function setScattering(v) { _isScattering = v; }

    function reset() {
        _convergedCount = 0; _totalActive = 0; _avgSdf = 0;
        _avgSpeed = 0; _avgForce = 0; _frameCount = 0;
        _fps = 0; _fpsFrames = 0; _isScattering = false;
    }

    return {
        update,
        getConvergedPercent, getFPS, getConverged, getTotal,
        getAvgSdf, getAvgSpeed, getAvgForce, getFrameCount,
        isScattering, setScattering, reset,
    };
})();

window.SDFChisel = window.SDFChisel || {};
window.SDFChisel.ParticleState = ParticleState;
