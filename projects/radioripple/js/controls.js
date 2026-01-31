/**
 * ============================================
 * RadioRipple - Controls Manager Module
 * ============================================
 * 
 * Handles all user interactions with control panel,
 * manages settings, and coordinates UI updates.
 */

class ControlsManager {
    constructor(rippleEngine, gridManager) {
        this.ripple = rippleEngine;
        this.grid = gridManager;
        
        // Control elements
        this.elements = {
            // Sliders
            gridSizeSlider: document.getElementById('gridSizeSlider'),
            rippleSpeedSlider: document.getElementById('rippleSpeedSlider'),
            waveRadiusSlider: document.getElementById('waveRadiusSlider'),
            waveIntensitySlider: document.getElementById('waveIntensitySlider'),
            
            // Value displays
            gridSizeValue: document.getElementById('gridSizeValue'),
            rippleSpeedValue: document.getElementById('rippleSpeedValue'),
            waveRadiusValue: document.getElementById('waveRadiusValue'),
            waveIntensityValue: document.getElementById('waveIntensityValue'),
            
            // Buttons
            resetBtn: document.getElementById('resetBtn'),
            clearBtn: document.getElementById('clearBtn'),
            randomWaveBtn: document.getElementById('randomWaveBtn'),
            autoPlayBtn: document.getElementById('autoPlayBtn'),
            autoPlayText: document.getElementById('autoPlayText'),
            
            // Checkboxes
            showGridLines: document.getElementById('showGridLines'),
            animateChecked: document.getElementById('animateChecked'),
            enablePulse: document.getElementById('enablePulse'),
            enableTrails: document.getElementById('enableTrails'),
            
            // Stats
            gridSizeDisplay: document.getElementById('gridSizeDisplay'),
            activeCellsDisplay: document.getElementById('activeCellsDisplay'),
            waveCountDisplay: document.getElementById('waveCountDisplay'),
            
            // Radio Grid
            radioGrid: document.getElementById('radioGrid')
        };
        
        // Auto-play state
        this.autoPlayActive = false;
        this.autoPlayInterval = null;
        
        this._initializeControls();
        this._attachEventListeners();
    }

    /**
     * Initialize all controls with default values
     * @private
     */
    _initializeControls() {
        // Set initial slider values
        this._updateSliderValue(
            this.elements.gridSizeSlider, 
            this.elements.gridSizeValue
        );
        this._updateSliderValue(
            this.elements.rippleSpeedSlider, 
            this.elements.rippleSpeedValue
        );
        this._updateSliderValue(
            this.elements.waveRadiusSlider, 
            this.elements.waveRadiusValue
        );
        this._updateSliderValue(
            this.elements.waveIntensitySlider, 
            this.elements.waveIntensityValue
        );
        
        // Set initial grid lines state
        if (this.elements.showGridLines.checked) {
            this.elements.radioGrid.classList.add('show-grid-lines');
        }
    }

    /**
     * Attach all event listeners
     * @private
     */
    _attachEventListeners() {
        // Slider events
        this.elements.gridSizeSlider.addEventListener('input', (e) => {
            this._updateSliderValue(e.target, this.elements.gridSizeValue);
        });
        
        this.elements.gridSizeSlider.addEventListener('change', (e) => {
            this._handleGridSizeChange(parseInt(e.target.value));
        });
        
        this.elements.rippleSpeedSlider.addEventListener('input', (e) => {
            this._updateSliderValue(e.target, this.elements.rippleSpeedValue);
            this._handleRippleSpeedChange(parseInt(e.target.value));
        });
        
        this.elements.waveRadiusSlider.addEventListener('input', (e) => {
            this._updateSliderValue(e.target, this.elements.waveRadiusValue);
            this._handleWaveRadiusChange(parseInt(e.target.value));
        });
        
        this.elements.waveIntensitySlider.addEventListener('input', (e) => {
            this._updateSliderValue(e.target, this.elements.waveIntensityValue);
            this._handleWaveIntensityChange(parseFloat(e.target.value));
        });
        
        // Button events
        this.elements.resetBtn.addEventListener('click', () => {
            this._handleReset();
        });
        
        this.elements.clearBtn.addEventListener('click', () => {
            this._handleClear();
        });
        
        this.elements.randomWaveBtn.addEventListener('click', () => {
            this._handleRandomWave();
        });
        
        this.elements.autoPlayBtn.addEventListener('click', () => {
            this._toggleAutoPlay();
        });
        
        // Algorithm selection
        const algorithmRadios = document.querySelectorAll('input[name="algorithm"]');
        algorithmRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this._handleAlgorithmChange(e.target.value);
            });
        });
        
        // Checkbox events
        this.elements.showGridLines.addEventListener('change', (e) => {
            this._handleGridLinesToggle(e.target.checked);
        });
        
        this.elements.animateChecked.addEventListener('change', (e) => {
            this._handleAnimateCheckedToggle(e.target.checked);
        });
        
        this.elements.enablePulse.addEventListener('change', (e) => {
            this._handlePulseToggle(e.target.checked);
        });
        
        this.elements.enableTrails.addEventListener('change', (e) => {
            this._handleTrailsToggle(e.target.checked);
        });
        
        // Update stats periodically
        this._startStatsUpdate();
    }

    /**
     * Update slider display value
     * @private
     */
    _updateSliderValue(slider, display) {
        if (!slider || !display) return;
        
        const value = slider.value;
        display.textContent = value;
        
        // Update slider fill gradient
        const percentage = ((value - slider.min) / (slider.max - slider.min)) * 100;
        slider.style.setProperty('--slider-value', `${percentage}%`);
    }

    /**
     * Handle grid size change
     * @private
     */
    async _handleGridSizeChange(size) {
        // Disable controls during regeneration
        this._setControlsEnabled(false);
        
        // Stop any active waves
        this.ripple.stopAllWaves();
        
        // Regenerate grid
        await this.grid.generateGrid(size);
        
        // Re-enable controls
        this._setControlsEnabled(true);
        
        // Update stats
        this._updateStats();
    }

    /**
     * Handle ripple speed change
     * @private
     */
    _handleRippleSpeedChange(speed) {
        // Invert speed (lower slider value = faster)
        const adjustedSpeed = 210 - speed;
        this.ripple.updateConfig({ speed: adjustedSpeed });
    }

    /**
     * Handle wave radius change
     * @private
     */
    _handleWaveRadiusChange(radius) {
        this.ripple.updateConfig({ maxRadius: radius });
    }

    /**
     * Handle wave intensity change
     * @private
     */
    _handleWaveIntensityChange(intensity) {
        this.ripple.updateConfig({ intensity: intensity });
    }

    /**
     * Handle algorithm change
     * @private
     */
    _handleAlgorithmChange(algorithm) {
        this.ripple.updateConfig({ algorithm: algorithm });
        
        // Show visual feedback
        this._showNotification(`Algorithm changed to: ${algorithm}`);
    }

    /**
     * Handle reset button
     * @private
     */
    async _handleReset() {
        this._setControlsEnabled(false);
        this.ripple.stopAllWaves();
        
        const currentSize = parseInt(this.elements.gridSizeSlider.value);
        await this.grid.generateGrid(currentSize);
        
        this._setControlsEnabled(true);
        this._updateStats();
    }

    /**
     * Handle clear button
     * @private
     */
    _handleClear() {
        this.ripple.stopAllWaves();
        this.grid.clearAllStates();
        this._updateStats();
    }

    /**
     * Handle random wave button
     * @private
     */
    _handleRandomWave() {
        this.ripple.triggerRandomWave();
    }

    /**
     * Toggle auto-play mode
     * @private
     */
    _toggleAutoPlay() {
        this.autoPlayActive = !this.autoPlayActive;
        
        if (this.autoPlayActive) {
            this._startAutoPlay();
            this.elements.autoPlayBtn.classList.add('active');
            this.elements.autoPlayText.textContent = 'Stop Auto Play';
            this.elements.autoPlayBtn.querySelector('.btn-icon').textContent = '⏸';
        } else {
            this._stopAutoPlay();
            this.elements.autoPlayBtn.classList.remove('active');
            this.elements.autoPlayText.textContent = 'Auto Play';
            this.elements.autoPlayBtn.querySelector('.btn-icon').textContent = '▶';
        }
    }

    /**
     * Start auto-play mode
     * @private
     */
    _startAutoPlay() {
        const interval = 2000; // 2 seconds between waves
        
        this.autoPlayInterval = setInterval(() => {
            if (this.autoPlayActive) {
                this.ripple.triggerRandomWave();
            }
        }, interval);
        
        // Trigger first wave immediately
        this.ripple.triggerRandomWave();
    }

    /**
     * Stop auto-play mode
     * @private
     */
    _stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    /**
     * Handle grid lines toggle
     * @private
     */
    _handleGridLinesToggle(enabled) {
        this.elements.radioGrid.classList.toggle('show-grid-lines', enabled);
    }

    /**
     * Handle animate checked toggle
     * @private
     */
    _handleAnimateCheckedToggle(enabled) {
        // This would control CSS animations on checked cells
        this.elements.radioGrid.classList.toggle('animate-checked', enabled);
    }

    /**
     * Handle pulse effect toggle
     * @private
     */
    _handlePulseToggle(enabled) {
        const allRadios = this.elements.radioGrid.querySelectorAll('input[type="radio"]');
        allRadios.forEach(radio => {
            if (enabled) {
                radio.classList.add('pulse-enabled');
            } else {
                radio.classList.remove('pulse-enabled');
            }
        });
    }

    /**
     * Handle trails toggle
     * @private
     */
    _handleTrailsToggle(enabled) {
        this.ripple.updateConfig({ enableTrails: enabled });
    }

    /**
     * Enable/disable all controls
     * @private
     */
    _setControlsEnabled(enabled) {
        const controls = [
            this.elements.gridSizeSlider,
            this.elements.rippleSpeedSlider,
            this.elements.waveRadiusSlider,
            this.elements.waveIntensitySlider,
            this.elements.resetBtn,
            this.elements.clearBtn,
            this.elements.randomWaveBtn,
            this.elements.autoPlayBtn
        ];
        
        controls.forEach(control => {
            if (control) {
                control.disabled = !enabled;
            }
        });
    }

    /**
     * Start periodic stats updates
     * @private
     */
    _startStatsUpdate() {
        setInterval(() => {
            this._updateStats();
        }, 500); // Update every 500ms
    }

    /**
     * Update statistics display
     * @private
     */
    _updateStats() {
        const gridStats = this.grid.getStats();
        const rippleStats = this.ripple.getStats();
        
        // Update grid size display
        this.elements.gridSizeDisplay.textContent = 
            `${gridStats.gridSize}×${gridStats.gridSize}`;
        
        // Update active cells display
        this.elements.activeCellsDisplay.textContent = 
            gridStats.checkedCells.toString();
        
        // Update wave count display
        this.elements.waveCountDisplay.textContent = 
            rippleStats.activeWaves.toString();
    }

    /**
     * Show notification message
     * @private
     */
    _showNotification(message) {
        // Simple console notification for now
        // Could be enhanced with a toast notification system
        console.log(`Notification: ${message}`);
    }

    /**
     * Get current control values
     * @returns {Object} Current control values
     */
    getCurrentSettings() {
        return {
            gridSize: parseInt(this.elements.gridSizeSlider.value),
            rippleSpeed: parseInt(this.elements.rippleSpeedSlider.value),
            waveRadius: parseInt(this.elements.waveRadiusSlider.value),
            waveIntensity: parseFloat(this.elements.waveIntensitySlider.value),
            algorithm: document.querySelector('input[name="algorithm"]:checked')?.value || 'circular',
            showGridLines: this.elements.showGridLines.checked,
            animateChecked: this.elements.animateChecked.checked,
            enablePulse: this.elements.enablePulse.checked,
            enableTrails: this.elements.enableTrails.checked
        };
    }

    /**
     * Apply settings configuration
     * @param {Object} settings - Settings to apply
     */
    applySettings(settings) {
        if (settings.gridSize) {
            this.elements.gridSizeSlider.value = settings.gridSize;
            this._updateSliderValue(
                this.elements.gridSizeSlider, 
                this.elements.gridSizeValue
            );
        }
        
        if (settings.rippleSpeed) {
            this.elements.rippleSpeedSlider.value = settings.rippleSpeed;
            this._updateSliderValue(
                this.elements.rippleSpeedSlider, 
                this.elements.rippleSpeedValue
            );
            this._handleRippleSpeedChange(settings.rippleSpeed);
        }
        
        if (settings.waveRadius) {
            this.elements.waveRadiusSlider.value = settings.waveRadius;
            this._updateSliderValue(
                this.elements.waveRadiusSlider, 
                this.elements.waveRadiusValue
            );
            this._handleWaveRadiusChange(settings.waveRadius);
        }
        
        if (settings.algorithm) {
            const algorithmRadio = document.querySelector(
                `input[name="algorithm"][value="${settings.algorithm}"]`
            );
            if (algorithmRadio) {
                algorithmRadio.checked = true;
                this._handleAlgorithmChange(settings.algorithm);
            }
        }
    }

    /**
     * Cleanup and destroy
     */
    destroy() {
        this._stopAutoPlay();
        this.ripple = null;
        this.grid = null;
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.ControlsManager = ControlsManager;
}
