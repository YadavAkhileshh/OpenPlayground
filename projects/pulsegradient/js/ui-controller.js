/**
 * ============================================
 * PulseGradient - UI Controller
 * Handles all user interface interactions and updates
 * ============================================
 */

class UIController {
    constructor(animationController, gradientEngine) {
        this.animationController = animationController;
        this.gradientEngine = gradientEngine;

        // DOM elements
        this.elements = {
            bpmSlider: null,
            bpmValue: null,
            footerBpm: null,
            sliderTrackFill: null,
            intensitySlider: null,
            intensityValue: null,
            playPauseBtn: null,
            playIcon: null,
            pauseIcon: null,
            playbackText: null,
            presetButtons: [],
            paletteButtons: []
        };

        // State
        this.currentPreset = null;
        this.currentPalette = 'sunset';

        // LocalStorage key
        this.storageKey = 'pulsegradient_preferences';
    }

    /**
     * Initialize UI controller and bind all event listeners
     */
    init() {
        this.cacheElements();
        this.bindEvents();
        this.loadPreferences();
        this.updateAllUI();
    }

    /**
     * Cache all DOM element references
     */
    cacheElements() {
        // BPM controls
        this.elements.bpmSlider = document.getElementById('bpmSlider');
        this.elements.bpmValue = document.getElementById('bpmValue');
        this.elements.footerBpm = document.getElementById('footerBpm');
        this.elements.sliderTrackFill = document.getElementById('sliderTrackFill');

        // Animation controls
        this.elements.intensitySlider = document.getElementById('intensitySlider');
        this.elements.intensityValue = document.getElementById('intensityValue');

        // Playback controls
        this.elements.playPauseBtn = document.getElementById('playPauseBtn');
        this.elements.playIcon = this.elements.playPauseBtn?.querySelector('.play-icon');
        this.elements.pauseIcon = this.elements.playPauseBtn?.querySelector('.pause-icon');
        this.elements.playbackText = this.elements.playPauseBtn?.querySelector('.playback-text');

        // Preset buttons
        this.elements.presetButtons = Array.from(document.querySelectorAll('.preset-btn'));

        // Palette buttons
        this.elements.paletteButtons = Array.from(document.querySelectorAll('.palette-btn'));
    }

    /**
     * Bind all event listeners
     */
    bindEvents() {
        // BPM slider
        if (this.elements.bpmSlider) {
            this.elements.bpmSlider.addEventListener('input', (e) => this.handleBPMChange(e));
            this.elements.bpmSlider.addEventListener('change', () => this.savePreferences());
        }

        // Intensity slider
        if (this.elements.intensitySlider) {
            this.elements.intensitySlider.addEventListener('input', (e) => this.handleIntensityChange(e));
            this.elements.intensitySlider.addEventListener('change', () => this.savePreferences());
        }

        // Preset buttons
        this.elements.presetButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handlePresetClick(e));
        });

        // Palette buttons
        this.elements.paletteButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handlePaletteClick(e));
        });

        // Play/Pause button
        if (this.elements.playPauseBtn) {
            this.elements.playPauseBtn.addEventListener('click', () => this.handlePlayPauseClick());
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    /**
     * Handle BPM slider change
     * @param {Event} event - Input event
     */
    handleBPMChange(event) {
        const bpm = parseInt(event.target.value);
        this.animationController.setBPM(bpm);
        this.updateBPMDisplay(bpm);
        this.updateSliderFill();

        // Clear active preset if manually adjusted
        this.clearActivePreset();
    }

    /**
     * Handle intensity slider change
     * @param {Event} event - Input event
     */
    handleIntensityChange(event) {
        const intensity = parseInt(event.target.value);
        this.animationController.setIntensity(intensity);
        this.updateIntensityDisplay(intensity);
    }

    /**
     * Handle preset button click
     * @param {Event} event - Click event
     */
    handlePresetClick(event) {
        const btn = event.currentTarget;
        const bpm = parseInt(btn.dataset.bpm);

        if (!bpm) return;

        // Update BPM
        this.animationController.setBPM(bpm);

        // Update UI
        this.elements.bpmSlider.value = bpm;
        this.updateBPMDisplay(bpm);
        this.updateSliderFill();

        // Update active state
        this.setActivePreset(btn);

        // Save preferences
        this.savePreferences();
    }

    /**
     * Handle palette button click
     * @param {Event} event - Click event
     */
    handlePaletteClick(event) {
        const btn = event.currentTarget;
        const palette = btn.dataset.palette;

        if (!palette) return;

        // Update palette
        this.gradientEngine.setPalette(palette);
        this.currentPalette = palette;

        // Update active state
        this.setActivePalette(btn);

        // Save preferences
        this.savePreferences();
    }

    /**
     * Handle play/pause button click
     */
    handlePlayPauseClick() {
        const isPlaying = this.animationController.toggle();
        this.updatePlayPauseButton(isPlaying);
    }

    /**
     * Handle keyboard shortcuts
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyPress(event) {
        // Space bar - play/pause
        if (event.code === 'Space' && event.target.tagName !== 'INPUT') {
            event.preventDefault();
            this.handlePlayPauseClick();
        }

        // Arrow keys - adjust BPM
        if (event.code === 'ArrowUp' || event.code === 'ArrowDown') {
            if (event.target.tagName !== 'INPUT') {
                event.preventDefault();
                const currentBPM = this.animationController.getBPM();
                const delta = event.code === 'ArrowUp' ? 5 : -5;
                const newBPM = Math.max(40, Math.min(180, currentBPM + delta));

                this.animationController.setBPM(newBPM);
                this.elements.bpmSlider.value = newBPM;
                this.updateBPMDisplay(newBPM);
                this.updateSliderFill();
                this.clearActivePreset();
                this.savePreferences();
            }
        }

        // Number keys 1-6 - select palette
        if (event.code >= 'Digit1' && event.code <= 'Digit6') {
            const index = parseInt(event.code.replace('Digit', '')) - 1;
            if (this.elements.paletteButtons[index]) {
                this.elements.paletteButtons[index].click();
            }
        }
    }

    /**
     * Update BPM display
     * @param {number} bpm - BPM value to display
     */
    updateBPMDisplay(bpm) {
        if (this.elements.bpmValue) {
            this.elements.bpmValue.textContent = bpm;
        }
        if (this.elements.footerBpm) {
            this.elements.footerBpm.textContent = bpm;
        }

        // Update aria attributes
        if (this.elements.bpmSlider) {
            this.elements.bpmSlider.setAttribute('aria-valuenow', bpm);
        }
    }

    /**
     * Update intensity display
     * @param {number} intensity - Intensity value to display
     */
    updateIntensityDisplay(intensity) {
        if (this.elements.intensityValue) {
            this.elements.intensityValue.textContent = `${intensity}%`;
        }
    }

    /**
     * Update slider track fill width
     */
    updateSliderFill() {
        if (!this.elements.sliderTrackFill || !this.elements.bpmSlider) return;

        const min = parseInt(this.elements.bpmSlider.min);
        const max = parseInt(this.elements.bpmSlider.max);
        const value = parseInt(this.elements.bpmSlider.value);

        const percentage = ((value - min) / (max - min)) * 100;
        this.elements.sliderTrackFill.style.width = `${percentage}%`;
    }

    /**
     * Update play/pause button state
     * @param {boolean} isPlaying - Whether animation is playing
     */
    updatePlayPauseButton(isPlaying) {
        if (!this.elements.playIcon || !this.elements.pauseIcon) return;

        if (isPlaying) {
            this.elements.playIcon.classList.remove('hidden');
            this.elements.pauseIcon.classList.add('hidden');
            if (this.elements.playbackText) {
                this.elements.playbackText.textContent = 'Pause';
            }
            this.elements.playPauseBtn.setAttribute('aria-label', 'Pause animation');
        } else {
            this.elements.playIcon.classList.add('hidden');
            this.elements.pauseIcon.classList.remove('hidden');
            if (this.elements.playbackText) {
                this.elements.playbackText.textContent = 'Play';
            }
            this.elements.playPauseBtn.setAttribute('aria-label', 'Play animation');
        }
    }

    /**
     * Set active preset button
     * @param {HTMLElement} activeBtn - Button to set as active
     */
    setActivePreset(activeBtn) {
        this.elements.presetButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
        this.currentPreset = activeBtn.dataset.bpm;
    }

    /**
     * Clear active preset
     */
    clearActivePreset() {
        this.elements.presetButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        this.currentPreset = null;
    }

    /**
     * Set active palette button
     * @param {HTMLElement} activeBtn - Button to set as active
     */
    setActivePalette(activeBtn) {
        this.elements.paletteButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }

    /**
     * Update all UI elements to match current state
     */
    updateAllUI() {
        const bpm = this.animationController.getBPM();
        const intensity = this.animationController.getIntensity();
        const isPlaying = this.animationController.isAnimationPlaying();

        // Update displays
        this.updateBPMDisplay(bpm);
        this.updateIntensityDisplay(intensity);
        this.updateSliderFill();
        this.updatePlayPauseButton(isPlaying);

        // Update slider values
        if (this.elements.bpmSlider) {
            this.elements.bpmSlider.value = bpm;
        }
        if (this.elements.intensitySlider) {
            this.elements.intensitySlider.value = intensity;
        }

        // Set active palette
        const paletteBtn = this.elements.paletteButtons.find(
            btn => btn.dataset.palette === this.currentPalette
        );
        if (paletteBtn) {
            this.setActivePalette(paletteBtn);
        }
    }

    /**
     * Save user preferences to localStorage
     */
    savePreferences() {
        const preferences = {
            bpm: this.animationController.getBPM(),
            intensity: this.animationController.getIntensity(),
            palette: this.currentPalette,
            preset: this.currentPreset
        };

        try {
            localStorage.setItem(this.storageKey, JSON.stringify(preferences));
        } catch (error) {
            console.warn('Failed to save preferences:', error);
        }
    }

    /**
     * Load user preferences from localStorage
     */
    loadPreferences() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (!stored) return;

            const preferences = JSON.parse(stored);

            // Apply BPM
            if (preferences.bpm) {
                this.animationController.setBPM(preferences.bpm);
                if (this.elements.bpmSlider) {
                    this.elements.bpmSlider.value = preferences.bpm;
                }
            }

            // Apply intensity
            if (preferences.intensity) {
                this.animationController.setIntensity(preferences.intensity);
                if (this.elements.intensitySlider) {
                    this.elements.intensitySlider.value = preferences.intensity;
                }
            }

            // Apply palette
            if (preferences.palette) {
                this.gradientEngine.setPalette(preferences.palette);
                this.currentPalette = preferences.palette;
            }

            // Apply preset
            if (preferences.preset) {
                const presetBtn = this.elements.presetButtons.find(
                    btn => btn.dataset.bpm === preferences.preset
                );
                if (presetBtn) {
                    this.setActivePreset(presetBtn);
                }
            }
        } catch (error) {
            console.warn('Failed to load preferences:', error);
        }
    }

    /**
     * Reset UI to default state
     */
    reset() {
        this.animationController.reset();
        this.gradientEngine.reset();
        this.currentPalette = 'sunset';
        this.currentPreset = null;

        // Clear localStorage
        try {
            localStorage.removeItem(this.storageKey);
        } catch (error) {
            console.warn('Failed to clear preferences:', error);
        }

        this.updateAllUI();
    }

    /**
     * Get current UI state
     * @returns {Object} Current UI state
     */
    getState() {
        return {
            bpm: this.animationController.getBPM(),
            intensity: this.animationController.getIntensity(),
            palette: this.currentPalette,
            preset: this.currentPreset,
            isPlaying: this.animationController.isAnimationPlaying()
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIController;
}
