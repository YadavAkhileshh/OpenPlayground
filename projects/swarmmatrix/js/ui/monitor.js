/**
 * js/ui/monitor.js
 * Updates the telemetry dashboard.
 */

import { state } from '../core/state.js';
import { events } from '../core/events.js';

export class Monitor {
    constructor() {
        this.fpsDisplay = document.getElementById('fps-display');
        this.agentDisplay = document.getElementById('agent-count-display');
        this.tickDisplay = document.getElementById('tick-display');
        this.entropyDisplay = document.getElementById('entropy-display');

        this.bindEvents();
    }

    bindEvents() {
        // We could listen to events for every tick, but it's more performant to
        // just be polled by the UIManager occasionally
        events.on('state:currentFPS', (fps) => {
            this.fpsDisplay.textContent = fps.toString().padStart(2, '0');
            if (fps < 30) {
                this.fpsDisplay.classList.add('warning');
            } else {
                this.fpsDisplay.classList.remove('warning');
            }
        });

        events.on('state:agentCount', (count) => {
            this.agentDisplay.textContent = count.toLocaleString();
        });

        events.on('state:entropy', (val) => {
            this.entropyDisplay.textContent = val + '%';
        });
    }

    update() {
        // Fast UI update without layout thrashing
        this.tickDisplay.textContent = state.get('currentTick').toLocaleString();
    }
}
