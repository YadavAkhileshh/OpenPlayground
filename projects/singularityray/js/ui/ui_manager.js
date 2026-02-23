/**
 * SingularityRay JS - UI - UI Manager
 * Handles HTML DOM specific layout toggles and slide animations
 * keeping UI state synced with engine data.
 */

export class UIManager {
    constructor() {
        // Elements
        this.controlPanel = document.getElementById('control-panel');
        this.toggleBtn = document.getElementById('btn-toggle-panel');
        this.statusMessage = document.getElementById('status-message');
        this.resValue = document.getElementById('res-value');

        // Action Buttons
        this.btnReset = document.getElementById('btn-reset-cam');
        this.btnPause = document.getElementById('btn-pause-sim');

        // Callbacks defined by core loop
        this.onResetCamera = null;
        this.onTogglePause = null;

        this._bindEvents();
    }

    _bindEvents() {
        // Side Panel Toggle
        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', () => {
                this.controlPanel.classList.toggle('collapsed');
            });
        }

        // Action Buttons
        if (this.btnReset) {
            this.btnReset.addEventListener('click', () => {
                if (this.onResetCamera) this.onResetCamera();
                this.showStatus('Camera reset to default orbit.', 'success');
            });
        }

        if (this.btnPause) {
            this.btnPause.addEventListener('click', () => {
                const isPaused = this.btnPause.classList.toggle('danger');
                this.btnPause.textContent = isPaused ? 'Resume Render' : 'Pause Render';

                if (this.onTogglePause) this.onTogglePause(isPaused);
                this.showStatus(isPaused ? 'Simulation paused.' : 'Simulation running.', 'warning');
            });
        }
    }

    /**
     * Update Resolution metric on HUD
     * @param {number} w 
     * @param {number} h 
     */
    updateResolutionDisplay(w, h) {
        if (this.resValue) {
            this.resValue.textContent = `${w}x${h}`;
        }
    }

    /**
     * Dispatch a timed status message
     * @param {string} msg 
     * @param {string} type 'success' | 'warning' | 'error' | 'info'
     */
    showStatus(msg, type = 'info') {
        if (!this.statusMessage) return;

        this.statusMessage.textContent = msg;
        this.statusMessage.className = `status-msg ${type}`;

        clearTimeout(this._statusTimer);
        this._statusTimer = setTimeout(() => {
            this.statusMessage.className = 'status-msg';
            this.statusMessage.textContent = 'System Nominal';
        }, 3000);
    }
}
