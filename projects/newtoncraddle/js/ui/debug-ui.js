import { stateManager } from '../core/state.js';
import { logger } from '../utils/logger.js';
import { CONFIG } from '../utils/constants.js';

/**
 * @fileoverview Optional Debugging Interface for Newton's Cradle.
 * Provides real-time telemetry and configuration tuning.
 */
export class DebugUI {
    /**
     * @param {HTMLElement} container - The container for the debug panel.
     */
    constructor(container) {
        this.container = container;
        this.visible = false;
        this.panel = null;
        this.elements = {};

        this.init();
    }

    /**
     * Build the debug panel DOM elements.
     */
    init() {
        this.panel = document.createElement('div');
        this.panel.className = 'debug-panel';
        this.panel.innerHTML = `
            <h3>Physics Telemetry</h3>
            <div class="debug-row">
                <span>Collisions:</span> <span id="debug-collisions">0</span>
            </div>
            <div class="debug-row">
                <span>Peak Velocity:</span> <span id="debug-peak">0</span>
            </div>
            <div class="debug-row">
                <span>Sub-steps:</span> <span id="debug-steps">${CONFIG.SUB_STEPS}</span>
            </div>
            <div class="debug-row">
                <span>Memory usage:</span> <span id="debug-mem">N/A</span>
            </div>
            <hr>
            <div class="debug-logs" id="debug-logs"></div>
        `;
        this.container.appendChild(this.panel);

        // Bind escape key to toggle debug
        window.addEventListener('keydown', (e) => {
            if (e.key === '`') {
                this.toggle();
            }
        });

        // Styles for debug panel
        const style = document.createElement('style');
        style.textContent = `
            .debug-panel {
                position: fixed;
                top: 10px;
                right: 10px;
                width: 250px;
                background: rgba(0, 0, 0, 0.85);
                color: #00ff00;
                font-family: 'Courier New', monospace;
                font-size: 11px;
                padding: 10px;
                border: 1px solid #333;
                border-radius: 4px;
                z-index: 1000;
                display: none;
                pointer-events: none;
            }
            .debug-panel h3 { margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; }
            .debug-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .debug-logs { height: 100px; overflow-y: auto; border-top: 1px solid #333; margin-top: 10px; padding-top: 5px; font-size: 9px; opacity: 0.7; }
            hr { border: 0; border-top: 1px solid #333; margin: 10px 0; }
        `;
        document.head.appendChild(style);
    }

    /**
     * Update the debug telemetry from current state.
     */
    update() {
        if (!this.visible) return;

        const summary = stateManager.getSessionSummary();
        document.getElementById('debug-collisions').textContent = summary.totalCollisions;
        document.getElementById('debug-peak').textContent = summary.peakVelocity;

        // Performance check
        if (window.performance && window.performance.memory) {
            const mem = (window.performance.memory.usedJSHeapSize / 1048576).toFixed(1);
            document.getElementById('debug-mem').textContent = `${mem} MB`;
        }

        // Tail follow logs
        const logDisplay = document.getElementById('debug-logs');
        if (logDisplay) {
            const logs = logger.history.slice(-5);
            logDisplay.innerHTML = logs.map(l => `<div>[${l.type}] ${l.message}</div>`).join('');
        }
    }

    /**
     * Toggle visibility of the debug panel.
     */
    toggle() {
        this.visible = !this.visible;
        this.panel.style.display = this.visible ? 'block' : 'none';
        logger.info(`Debug UI ${this.visible ? 'enabled' : 'disabled'}`);
    }
}
