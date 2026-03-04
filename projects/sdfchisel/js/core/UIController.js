/**
 * UIController.js – Wires HTML controls to the EventBus.
 */
const UIController = (() => {
    'use strict';
    const { EventBus } = window.SDFChisel, EV = EventBus.EVENTS;
    const _$ = (id) => document.getElementById(id);

    function _updateFill(fId, sId) {
        const s = _$(sId), f = _$(fId);
        if (s && f) f.style.width = `${(s.value - s.min) / (s.max - s.min) * 100}%`;
    }

    function init() {
        const ti = _$('text-input'), bc = _$('btn-chisel'), cc = _$('char-count');
        if (ti && cc) { ti.addEventListener('input', () => cc.textContent = ti.value.length); ti.addEventListener('keydown', e => e.key === 'Enter' && bc && bc.click()); }
        if (bc) bc.addEventListener('click', () => {
            EventBus.emit(EV.SIM_TEXT_CHANGED, { text: ti ? ti.value.trim().toUpperCase() || 'SDF' : 'SDF' });
            const sec = _$('canvas-section'); if (sec) { sec.classList.add('chisel-active'); setTimeout(() => sec.classList.remove('chisel-active'), 800); }
        });

        const bindSlider = (sId, vId, fId, evName, parse, format, key) => {
            const s = _$(sId), v = _$(vId);
            if (s) {
                _updateFill(fId, sId);
                s.addEventListener('input', () => {
                    const val = parse(s.value);
                    if (v) v.textContent = format(val);
                    _updateFill(fId, sId);
                    EventBus.emit(evName, { [key]: val });
                });
            }
        };
        bindSlider('slider-particles', 'val-particles', 'fill-particles', EV.PARTICLE_COUNT_CHANGE, v => parseInt(v, 10), v => v >= 1000 ? `${Math.round(v / 1000)}K` : v, 'count');
        bindSlider('slider-speed', 'val-speed', 'fill-speed', EV.UI_SPEED_CHANGE, v => parseFloat(v), v => v.toFixed(2), 'speed');
        bindSlider('slider-repulsion', 'val-repulsion', 'fill-repulsion', EV.UI_RADIUS_CHANGE, v => parseFloat(v), v => v.toFixed(1), 'radius');

        const bindToggle = (id, evName) => { const t = _$(id); if (t) t.addEventListener('change', () => EventBus.emit(evName, { on: t.checked })); };
        bindToggle('toggle-gradient', EV.UI_TOGGLE_GRADIENT);
        bindToggle('toggle-sdf', EV.UI_TOGGLE_SDF);
        bindToggle('toggle-grid', EV.UI_TOGGLE_GRID);
        bindToggle('toggle-trails', EV.UI_TOGGLE_TRAILS);

        const bindBtn = (id, fn) => { const b = _$(id); if (b) b.addEventListener('click', fn); };
        bindBtn('btn-reset', () => EventBus.emit(EV.SIM_RESET));
        bindBtn('btn-scatter', () => EventBus.emit(EV.SIM_SCATTER));
        const bp = _$('btn-pause');
        if (bp) bp.addEventListener('click', () => {
            const paused = bp.dataset.paused === 'true';
            bp.dataset.paused = String(!paused); bp.textContent = !paused ? 'Resume' : 'Pause';
            EventBus.emit(paused ? EV.SIM_RESUME : EV.SIM_PAUSE);
        });

        const sc = _$('sdf-canvas');
        if (sc) sc.addEventListener('click', e => { const r = sc.getBoundingClientRect(); EventBus.emit(EV.CANVAS_CLICK, { x: e.clientX - r.left, y: e.clientY - r.top }); });
    }

    function updateStats(fps, ptcl, cvg, gRes, hCells, f, g) {
        const set = (id, v) => { const e = _$(id); if (e) e.textContent = v; };
        set('stat-fps', `FPS: ${fps}`); set('stat-particles', `Particles: ${ptcl}`); set('stat-converged', `Converged: ${cvg.toFixed(0)}%`);
        set('info-gridres', gRes); set('info-hashcells', hCells); set('info-force', f.toFixed(3)); set('info-grad', g.toFixed(3));
        const b = _$('footer-sdf-status');
        if (b) {
            if (cvg > 80) { b.textContent = '✅ Converged'; b.className = 'status-badge running'; }
            else { b.textContent = '⬛ Chiseling...'; b.className = 'status-badge converging'; }
        }
    }

    return { init, updateStats };
})();
window.SDFChisel = window.SDFChisel || {};
window.SDFChisel.UIController = UIController;
