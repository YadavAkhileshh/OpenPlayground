/**
 * AnimationLoop.js – RAF-based animation loop with pause/resume and time tracking.
 * Drives ParticleSystem.update() and Renderer.render() at 60fps.
 */

const AnimationLoop = (() => {
    'use strict';

    const { ParticleSystem, Renderer, UIController, GradientVisualizer,
        EventBus, Config, VectorField } = window.SDFChisel;
    const EV = EventBus.EVENTS;

    let _rafId = null;
    let _paused = false;
    let _lastTime = 0;
    let _frameCount = 0;
    let _statsTimer = 0;

    /**
     * Main loop tick.
     * @param {DOMHighResTimeStamp} now
     */
    function _tick(now) {
        if (_paused) return;
        _rafId = requestAnimationFrame(_tick);

        const dt = Math.min((now - _lastTime) / 1000, Config.LOOP.MAX_DT_MS / 1000);
        _lastTime = now;
        if (dt <= 0) return;

        // Physics step
        ParticleSystem.update(dt);

        // Render
        const particles = ParticleSystem.getParticles();
        Renderer.render(particles);

        // Stats update every N frames
        _frameCount++;
        _statsTimer++;
        if (_statsTimer >= Config.LOOP.STATS_INTERVAL) {
            _statsTimer = 0;
            _updateStats();
            // Rebuild vector field periodically for visualization
            const { w, h } = Renderer.getCanvasSize();
            VectorField.build(w, h);
        }
    }

    function _updateStats() {
        const stats = ParticleSystem.getStats();
        const sdfData = window.SDFChisel.SDFGenerator.getCurrent();
        const { w, h } = Renderer.getCanvasSize();
        UIController.updateStats(
            stats.fps,
            stats.total,
            stats.converged,
            sdfData ? `${sdfData.gridW}×${sdfData.gridH}` : '–',
            window.SDFChisel.BucketManager.getTableSize(),
            stats.avgForce,
            stats.avgGrad
        );
    }

    function start() {
        if (_rafId) return;
        _paused = false;
        _lastTime = performance.now();
        _rafId = requestAnimationFrame(_tick);
    }

    function stop() {
        if (_rafId) { cancelAnimationFrame(_rafId); _rafId = null; }
    }

    function pause() { _paused = true; stop(); }
    function resume() {
        _paused = false;
        _lastTime = performance.now();
        _rafId = requestAnimationFrame(_tick);
    }

    // Wire events
    EventBus.on(EV.SIM_PAUSE, pause);
    EventBus.on(EV.SIM_RESUME, resume);

    return { start, stop, pause, resume };
})();

window.SDFChisel = window.SDFChisel || {};
window.SDFChisel.AnimationLoop = AnimationLoop;
