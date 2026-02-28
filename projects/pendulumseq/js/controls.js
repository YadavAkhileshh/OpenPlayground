/**
 * controls.js - Control Panel Manager
 * Handles all UI interactions and parameter adjustments
 */

class ControlPanel {
    /**
     * Create a new control panel manager
     * @param {Object} app - Main application instance
     */
    constructor(app) {
        this.app = app;

        // DOM elements
        this.addPendulumBtn = document.getElementById('add-pendulum-btn');
        this.pendulumList = document.getElementById('pendulum-list');
        this.resetBtn = document.getElementById('reset-btn');
        this.clearBtn = document.getElementById('clear-btn');

        // Global controls
        this.masterVolumeSlider = document.getElementById('master-volume');
        this.masterVolumeValue = document.getElementById('master-volume-value');
        this.gravitySlider = document.getElementById('gravity');
        this.gravityValue = document.getElementById('gravity-value');
        this.dampingSlider = document.getElementById('damping');
        this.dampingValue = document.getElementById('damping-value');
        this.waveformSelect = document.getElementById('waveform');
        this.noteDurationSlider = document.getElementById('note-duration');
        this.noteDurationValue = document.getElementById('note-duration-value');

        // Rhythm indicators
        this.rhythmIndicators = document.getElementById('rhythm-indicators');

        // Pendulum colors
        this.colors = [
            '#ef4444', '#f59e0b', '#10b981', '#3b82f6',
            '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
        ];

        // Initialize event listeners
        this.initializeEventListeners();
    }

    /**
     * Initialize all event listeners
     */
    initializeEventListeners() {
        // Add pendulum button
        this.addPendulumBtn.addEventListener('click', () => {
            this.app.addPendulum();
        });

        // Reset button
        this.resetBtn.addEventListener('click', () => {
            this.app.resetAllPendulums();
        });

        // Clear button
        this.clearBtn.addEventListener('click', () => {
            this.app.clearAllPendulums();
        });

        // Master volume
        this.masterVolumeSlider.addEventListener('input', (e) => {
            const volume = parseFloat(e.target.value) / 100;
            this.app.setMasterVolume(volume);
            this.masterVolumeValue.textContent = `${e.target.value}%`;
        });

        // Gravity
        this.gravitySlider.addEventListener('input', (e) => {
            const gravity = parseFloat(e.target.value);
            this.app.setGravity(gravity);
            this.gravityValue.textContent = `${gravity.toFixed(1)} m/s²`;
        });

        // Damping
        this.dampingSlider.addEventListener('input', (e) => {
            const damping = parseFloat(e.target.value);
            this.app.setDamping(damping);
            this.dampingValue.textContent = damping.toFixed(3);
        });

        // Waveform
        this.waveformSelect.addEventListener('change', (e) => {
            this.app.setWaveform(e.target.value);
        });

        // Note duration
        this.noteDurationSlider.addEventListener('input', (e) => {
            const duration = parseFloat(e.target.value);
            this.app.setNoteDuration(duration);
            this.noteDurationValue.textContent = `${duration.toFixed(2)}s`;
        });
    }

    /**
     * Add a pendulum control item to the list
     * @param {Pendulum} pendulum - Pendulum instance
     */
    addPendulumControl(pendulum) {
        const item = document.createElement('div');
        item.className = 'pendulum-item';
        item.dataset.id = pendulum.id;

        // Get color for this pendulum
        const colorIndex = (parseInt(pendulum.id) - 1) % this.colors.length;
        const color = this.colors[colorIndex];
        pendulum.setColor(color);

        item.innerHTML = `
            <div class="pendulum-item-header">
                <div class="pendulum-name">
                    <span class="pendulum-color-indicator" style="background-color: ${color};"></span>
                    Pendulum ${pendulum.id}
                </div>
                <button class="pendulum-remove-btn" data-id="${pendulum.id}" title="Remove">×</button>
            </div>
            <div class="pendulum-controls">
                <div class="control-group">
                    <label class="control-label">
                        Length
                        <span class="control-value pendulum-length-value">${pendulum.getLength().toFixed(2)}m</span>
                    </label>
                    <input 
                        type="range" 
                        class="slider pendulum-length-slider" 
                        data-id="${pendulum.id}"
                        min="0.5" 
                        max="3.0" 
                        value="${pendulum.getLength()}" 
                        step="0.1"
                    >
                </div>
                <div class="pendulum-control-row">
                    <span class="pendulum-control-label">Period:</span>
                    <span class="pendulum-control-value pendulum-period">${pendulum.getPeriod().toFixed(2)}s</span>
                </div>
                <div class="pendulum-control-row">
                    <span class="pendulum-control-label">Frequency:</span>
                    <span class="pendulum-control-value pendulum-frequency">${pendulum.frequency.toFixed(1)}Hz</span>
                </div>
            </div>
        `;

        this.pendulumList.appendChild(item);

        // Add event listeners for this pendulum
        const removeBtn = item.querySelector('.pendulum-remove-btn');
        removeBtn.addEventListener('click', () => {
            this.app.removePendulum(pendulum.id);
        });

        const lengthSlider = item.querySelector('.pendulum-length-slider');
        const lengthValue = item.querySelector('.pendulum-length-value');
        const periodValue = item.querySelector('.pendulum-period');
        const frequencyValue = item.querySelector('.pendulum-frequency');

        lengthSlider.addEventListener('input', (e) => {
            const length = parseFloat(e.target.value);
            pendulum.setLength(length);
            lengthValue.textContent = `${length.toFixed(2)}m`;
            periodValue.textContent = `${pendulum.getPeriod().toFixed(2)}s`;
            frequencyValue.textContent = `${pendulum.frequency.toFixed(1)}Hz`;
        });

        // Add rhythm indicator
        this.addRhythmIndicator(pendulum.id, color);
    }

    /**
     * Remove a pendulum control item
     * @param {string} id - Pendulum ID
     */
    removePendulumControl(id) {
        const item = this.pendulumList.querySelector(`[data-id="${id}"]`);
        if (item) {
            item.remove();
        }

        // Remove rhythm indicator
        this.removeRhythmIndicator(id);
    }

    /**
     * Clear all pendulum controls
     */
    clearAllControls() {
        this.pendulumList.innerHTML = '';
        this.rhythmIndicators.innerHTML = '';
    }

    /**
     * Add a rhythm indicator
     * @param {string} id - Pendulum ID
     * @param {string} color - Indicator color
     */
    addRhythmIndicator(id, color) {
        const indicator = document.createElement('div');
        indicator.className = 'rhythm-indicator';
        indicator.dataset.id = id;
        indicator.innerHTML = `
            <div class="rhythm-indicator-dot" style="background-color: ${color};" data-id="${id}"></div>
            <span class="rhythm-indicator-label">P${id}</span>
        `;
        this.rhythmIndicators.appendChild(indicator);
    }

    /**
     * Remove a rhythm indicator
     * @param {string} id - Pendulum ID
     */
    removeRhythmIndicator(id) {
        const indicator = this.rhythmIndicators.querySelector(`[data-id="${id}"]`);
        if (indicator) {
            indicator.closest('.rhythm-indicator').remove();
        }
    }

    /**
     * Pulse a rhythm indicator
     * @param {string} id - Pendulum ID
     */
    pulseRhythmIndicator(id) {
        const dot = this.rhythmIndicators.querySelector(`.rhythm-indicator-dot[data-id="${id}"]`);
        if (dot) {
            dot.classList.add('active');
            setTimeout(() => {
                dot.classList.remove('active');
            }, 150);
        }
    }

    /**
     * Update all pendulum info displays
     * @param {Array} pendulums - Array of pendulum instances
     */
    updatePendulumInfo(pendulums) {
        pendulums.forEach(pendulum => {
            const item = this.pendulumList.querySelector(`[data-id="${pendulum.id}"]`);
            if (item) {
                const info = pendulum.getInfo();
                const periodValue = item.querySelector('.pendulum-period');
                const frequencyValue = item.querySelector('.pendulum-frequency');

                if (periodValue) periodValue.textContent = `${info.period}s`;
                if (frequencyValue) frequencyValue.textContent = `${info.frequency}Hz`;
            }
        });
    }

    /**
     * Get the next available color
     * @param {number} index - Pendulum index
     * @returns {string} - Color hex code
     */
    getColor(index) {
        return this.colors[index % this.colors.length];
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ControlPanel;
}
