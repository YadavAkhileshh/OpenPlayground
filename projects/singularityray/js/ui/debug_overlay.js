/**
 * SingularityRay JS - UI - Debug Overlay
 * Handles bounding box visualization toggles and progressive render switches.
 */

export class DebugController {
    /**
     * @param {import('../core/event_bus.js').CoreEventBus} uiBus 
     */
    constructor(uiBus) {
        this.uiBus = uiBus;

        this.toggles = {
            debugRays: document.getElementById('toggle-debug-rays'),
            sdfBounds: document.getElementById('toggle-sdf-bounds'),
            progressive: document.getElementById('toggle-pixel-sort')
        };

        this._bindEvents();
    }

    _bindEvents() {
        if (this.toggles.debugRays) {
            this.toggles.debugRays.addEventListener('change', (e) => {
                this.uiBus.emit('debugRaysChanged', e.target.checked);
            });
        }

        if (this.toggles.sdfBounds) {
            this.toggles.sdfBounds.addEventListener('change', (e) => {
                this.uiBus.emit('sdfBoundsChanged', e.target.checked);
            });
        }

        if (this.toggles.progressive) {
            this.toggles.progressive.addEventListener('change', (e) => {
                this.uiBus.emit('progressiveChanged', e.target.checked);
            });
        }
    }

    /**
     * Read initial states
     */
    getInitialState() {
        return {
            debugRays: this.toggles.debugRays ? this.toggles.debugRays.checked : false,
            sdfBounds: this.toggles.sdfBounds ? this.toggles.sdfBounds.checked : false,
            progressive: this.toggles.progressive ? this.toggles.progressive.checked : true
        };
    }
}
