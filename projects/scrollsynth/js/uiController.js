// ============================================
// UI CONTROLLER
// ============================================

/**
 * UIController manages all UI interactions and updates
 */
class UIController {
    constructor(audioEngine, arpeggiator, loopRecorder, presetManager, gestureDetector) {
        this.audio = audioEngine;
        this.arp = arpeggiator;
        this.loop = loopRecorder;
        this.presets = presetManager;
        this.gesture = gestureDetector;

        // Get DOM elements
        this.elements = {
            // Controls
            waveformSelect: document.getElementById('waveformSelect'),
            volumeSlider: document.getElementById('volumeSlider'),
            volumeValue: document.getElementById('volumeValue'),
            filterTypeSelect: document.getElementById('filterTypeSelect'),
            filterQSlider: document.getElementById('filterQSlider'),
            filterQValue: document.getElementById('filterQValue'),
            distortionSlider: document.getElementById('distortionSlider'),
            distortionValue: document.getElementById('distortionValue'),

            // Feature toggles
            arpToggle: document.getElementById('arpToggle'),
            loopToggle: document.getElementById('loopToggle'),
            presetToggle: document.getElementById('presetToggle'),
            gestureToggle: document.getElementById('gestureToggle'),

            // Feature panels
            arpPanel: document.getElementById('arpPanel'),
            loopPanel: document.getElementById('loopPanel'),
            presetPanel: document.getElementById('presetPanel'),
            gesturePanel: document.getElementById('gesturePanel'),

            // Arpeggiator controls
            arpPattern: document.getElementById('arpPattern'),
            arpSpeed: document.getElementById('arpSpeed'),
            arpSpeedValue: document.getElementById('arpSpeedValue'),
            arpInterval: document.getElementById('arpInterval'),

            // Loop controls
            loopRecord: document.getElementById('loopRecord'),
            loopPlay: document.getElementById('loopPlay'),
            loopStop: document.getElementById('loopStop'),
            loopClear: document.getElementById('loopClear'),

            // Preset controls
            presetName: document.getElementById('presetName'),
            presetSave: document.getElementById('presetSave')
        };

        // Active panels
        this.activePanels = new Set();
    }

    /**
     * Initialize UI event listeners
     */
    initialize() {
        // Audio controls
        this.elements.waveformSelect.addEventListener('change', (e) => {
            this.audio.setWaveform(e.target.value);
        });

        this.elements.volumeSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.elements.volumeValue.textContent = `${value}%`;
            this.audio.setVolume(value / 100);
        });

        this.elements.filterTypeSelect.addEventListener('change', (e) => {
            this.audio.setFilterType(e.target.value);
        });

        this.elements.filterQSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.elements.filterQValue.textContent = `${value}%`;
            const q = this.audio.params.normalizedToFilterQ(value / 100);
            this.audio.setFilterQ(q);
        });

        this.elements.distortionSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.elements.distortionValue.textContent = `${value}%`;
            this.audio.setDistortion(value);
        });

        // Feature toggles
        this.elements.arpToggle.addEventListener('click', () => {
            this.togglePanel('arpeggiator', this.elements.arpPanel, this.elements.arpToggle);
        });

        this.elements.loopToggle.addEventListener('click', () => {
            this.togglePanel('loop', this.elements.loopPanel, this.elements.loopToggle);
        });

        this.elements.presetToggle.addEventListener('click', () => {
            this.togglePanel('preset', this.elements.presetPanel, this.elements.presetToggle);
        });

        this.elements.gestureToggle.addEventListener('click', () => {
            this.togglePanel('gesture', this.elements.gesturePanel, this.elements.gestureToggle);
        });

        // Arpeggiator controls
        this.elements.arpPattern.addEventListener('change', (e) => {
            this.arp.setPattern(e.target.value);
        });

        this.elements.arpSpeed.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.elements.arpSpeedValue.textContent = value;
            this.arp.setSpeed(value);
        });

        this.elements.arpInterval.addEventListener('change', (e) => {
            this.arp.setInterval(parseInt(e.target.value));
        });

        // Loop controls
        this.elements.loopRecord.addEventListener('click', () => {
            if (this.loop.isRecording) {
                this.loop.stopRecording();
                this.elements.loopRecord.classList.remove('active');
                this.elements.loopPlay.disabled = false;
                this.elements.loopClear.disabled = false;
            } else {
                this.loop.startRecording();
                this.elements.loopRecord.classList.add('active');
                this.elements.loopPlay.disabled = true;
                this.elements.loopStop.disabled = true;
            }
        });

        this.elements.loopPlay.addEventListener('click', () => {
            if (this.loop.isPlaying) return;

            this.loop.startPlayback((v, h) => {
                window.dispatchEvent(new CustomEvent('loopPlayback', {
                    detail: { vertical: v, horizontal: h }
                }));
            });

            this.elements.loopPlay.classList.add('active');
            this.elements.loopStop.disabled = false;
            this.elements.loopRecord.disabled = true;
        });

        this.elements.loopStop.addEventListener('click', () => {
            this.loop.stopPlayback();
            this.elements.loopPlay.classList.remove('active');
            this.elements.loopStop.disabled = true;
            this.elements.loopRecord.disabled = false;
        });

        this.elements.loopClear.addEventListener('click', () => {
            if (confirm('Clear recorded loop?')) {
                this.loop.clear();
                this.elements.loopPlay.disabled = true;
                this.elements.loopClear.disabled = true;
            }
        });

        // Preset controls
        this.elements.presetSave.addEventListener('click', () => {
            const name = this.elements.presetName.value;
            if (this.presets.save(name)) {
                this.elements.presetName.value = '';
                alert('Preset saved!');
            } else {
                alert('Failed to save preset');
            }
        });

        // Listen for preset loaded event
        window.addEventListener('presetLoaded', (e) => {
            this.updateControlsFromPreset(e.detail);
        });
    }

    /**
     * Toggle feature panel
     * @param {string} feature - Feature name
     * @param {HTMLElement} panel - Panel element
     * @param {HTMLElement} button - Toggle button
     */
    togglePanel(feature, panel, button) {
        if (this.activePanels.has(feature)) {
            // Deactivate
            this.activePanels.delete(feature);
            panel.classList.add('hidden');
            button.classList.remove('active');

            // Stop feature if needed
            if (feature === 'arpeggiator' && this.arp.isActive) {
                this.arp.stop();
            }
        } else {
            // Activate
            this.activePanels.add(feature);
            panel.classList.remove('hidden');
            button.classList.add('active');

            // Start feature if needed
            if (feature === 'arpeggiator') {
                this.arp.start();
            }
        }
    }

    /**
     * Update controls from preset
     * @param {Object} preset - Preset data
     */
    updateControlsFromPreset(preset) {
        // Update controls
        this.elements.waveformSelect.value = preset.waveform;
        this.elements.volumeSlider.value = preset.volume;
        this.elements.volumeValue.textContent = `${preset.volume}%`;
        this.elements.filterTypeSelect.value = preset.filterType;
        this.elements.filterQSlider.value = preset.filterQ;
        this.elements.filterQValue.textContent = `${preset.filterQ}%`;
        this.elements.distortionSlider.value = preset.distortion;
        this.elements.distortionValue.textContent = `${preset.distortion}%`;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIController;
}
