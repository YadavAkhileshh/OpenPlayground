/**
 * main.js – SDFChisel entry point.
 */
(function () {
    'use strict';
    const C = window.SDFChisel;
    let _txt = C.Config.UI.DEFAULT_TEXT, _cnt = C.Config.PARTICLE.COUNT, _spd = C.Config.PARTICLE.CONVERGENCE_SPEED, _rad = C.Config.PARTICLE.COLLISION_RADIUS, _run = false;

    function init() {
        const sc = document.getElementById('sdf-canvas'), gc = document.getElementById('gradient-canvas'), sec = document.getElementById('canvas-section');
        if (!sc || !gc || !sec) return;
        C.Renderer.init(sc, gc, sec);
        const { w, h } = C.Renderer.getCanvasSize();
        C.SDFGenerator.build(_txt, w, h);
        C.GradientEngine.init(w, h);
        C.ParticleSystem.init(w, h, _cnt, _spd, _rad);
        C.UIController.init();
        wireEvents();
        C.AnimationLoop.start();
        _run = true;
    }

    function wireEvents() {
        const E = C.EventBus, EV = E.EVENTS;
        E.on(EV.SIM_TEXT_CHANGED, ({ text }) => {
            _txt = (text || 'SDF').toUpperCase().slice(0, C.Config.UI.MAX_TEXT_LEN);
            const { w, h } = C.Renderer.getCanvasSize();
            C.SDFGenerator.build(_txt, w, h); C.GradientEngine.resize(w, h); C.ParticleSystem.reset(w, h); C.VectorField.build(w, h);
        });
        E.on(EV.PARTICLE_COUNT_CHANGE, ({ count }) => { _cnt = count; const { w, h } = C.Renderer.getCanvasSize(); C.ParticleSystem.setCount(count, w, h); });
        E.on(EV.UI_SPEED_CHANGE, ({ speed }) => { _spd = speed; C.ParticleSystem.setSpeed(speed); });
        E.on(EV.UI_RADIUS_CHANGE, ({ radius }) => { _rad = radius; C.ParticleSystem.setRadius(radius); });
        E.on(EV.UI_TOGGLE_GRADIENT, ({ on }) => { C.Renderer.setShowGradient(on); if (on) { const { w, h } = C.Renderer.getCanvasSize(); C.VectorField.build(w, h); } });
        E.on(EV.UI_TOGGLE_SDF, ({ on }) => C.Renderer.setShowSDF(on));
        E.on(EV.UI_TOGGLE_GRID, ({ on }) => C.Renderer.setShowGrid(on));
        E.on(EV.UI_TOGGLE_TRAILS, ({ on }) => C.ParticleRenderer.setShowTrails(on));
        E.on(EV.SIM_RESET, () => { const { w, h } = C.Renderer.getCanvasSize(); C.SDFGenerator.build(_txt, w, h); C.GradientEngine.resize(w, h); C.ParticleSystem.reset(w, h); });
        E.on(EV.SIM_SCATTER, () => C.ParticleSystem.scatter());
        E.on(EV.CANVAS_CLICK, ({ x, y }) => C.ParticleEmitter.injectAt(C.ParticleSystem.getParticles(), x, y, 30));

        const obs = new ResizeObserver(() => {
            if (!_run) return;
            C.Renderer.resize();
            const { w, h } = C.Renderer.getCanvasSize();
            C.SDFGenerator.rebuild(w, h); C.GradientEngine.resize(w, h); C.ParticleSystem.resize(w, h); C.VectorField.build(w, h);
            E.emit(EV.CANVAS_RESIZE, { w, h });
        });
        const s = document.getElementById('canvas-section');
        if (s) obs.observe(s);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
