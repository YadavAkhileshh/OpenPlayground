/**
 * EventBus.js – App-wide Pub/Sub event bus.
 */
const EventBus = (() => {
    'use strict';
    const EVENTS = {
        SIM_TEXT_CHANGED: 'sim:text', SIM_PAUSE: 'sim:pause', SIM_RESUME: 'sim:resume',
        SIM_RESET: 'sim:reset', SIM_SCATTER: 'sim:scatter', SDF_READY: 'sdf:ready',
        PARTICLE_COUNT_CHANGE: 'ui:particles', UI_SPEED_CHANGE: 'ui:speed', UI_RADIUS_CHANGE: 'ui:radius',
        UI_TOGGLE_GRADIENT: 'ui:grad', UI_TOGGLE_SDF: 'ui:sdf', UI_TOGGLE_GRID: 'ui:grid', UI_TOGGLE_TRAILS: 'ui:trails',
        CANVAS_RESIZE: 'canvas:resize', CANVAS_CLICK: 'canvas:click'
    };
    const _listeners = {};

    function on(event, callback) {
        if (!_listeners[event]) _listeners[event] = [];
        _listeners[event].push(callback);
        return () => off(event, callback);
    }
    function off(event, callback) {
        if (!_listeners[event]) return;
        _listeners[event] = _listeners[event].filter(cb => cb !== callback);
    }
    function emit(event, data = null) {
        if (!_listeners[event]) return;
        for (const cb of _listeners[event]) {
            try { cb(data); } catch (e) { console.error(`[EventBus] Error in ${event}:`, e); }
        }
    }
    function clear(event) {
        if (event) delete _listeners[event];
        else for (const k in _listeners) delete _listeners[k];
    }
    return { EVENTS, on, off, emit, clear };
})();
window.SDFChisel = window.SDFChisel || {};
window.SDFChisel.EventBus = EventBus;
