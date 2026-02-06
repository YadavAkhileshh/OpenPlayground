/**
 * ============================================
 * VIBRATION COMPOSER - UI CONTROLLER
 * Event Handlers & Visual Feedback
 * ============================================
 */

class UIController {
    constructor(sequencer, vibrationEngine) {
        this.sequencer = sequencer;
        this.engine = vibrationEngine;

        // DOM elements
        this.elements = {};

        // State
        this.currentIntensity = 0.8;
        this.isDragging = false;
        this.dragMode = null; // 'add' or 'remove'

        // Initialize
        this.cacheDOMElements();
        this.initializeTimeline();
        this.setupEventListeners();
        this.checkVibrationSupport();
        this.setupCallbacks();
    }

    /**
     * Cache DOM elements for performance
     */
    cacheDOMElements() {
        this.elements = {
            // Header
            supportIndicator: document.getElementById('supportIndicator'),
            indicatorDot: document.querySelector('.indicator-dot'),
            indicatorText: document.querySelector('.indicator-text'),

            // Timeline
            timelineGrid: document.getElementById('timelineGrid'),
            beatCounter: document.getElementById('beatCounter'),
            tempoDisplay: document.getElementById('tempoDisplay'),
            playhead: document.getElementById('playhead'),

            // Controls
            playBtn: document.getElementById('playBtn'),
            stopBtn: document.getElementById('stopBtn'),
            loopBtn: document.getElementById('loopBtn'),
            clearBtn: document.getElementById('clearBtn'),

            // Sliders
            tempoSlider: document.getElementById('tempoSlider'),
            tempoValue: document.getElementById('tempoValue'),
            intensitySlider: document.getElementById('intensitySlider'),
            intensityValue: document.getElementById('intensityValue'),

            // Presets
            presetsGrid: document.getElementById('presetsGrid'),

            // Feedback
            feedbackOverlay: document.getElementById('feedbackOverlay'),
            unsupportedMessage: document.getElementById('unsupportedMessage'),
            dismissUnsupported: document.getElementById('dismissUnsupported')
        };
    }

    /**
     * Initialize timeline grid with beat cells
     */
    initializeTimeline() {
        const beatRows = document.querySelectorAll('.beat-row');

        beatRows.forEach((row, trackId) => {
            // Clear existing cells
            row.innerHTML = '';

            // Create 16 beat cells
            for (let i = 0; i < 16; i++) {
                const cell = document.createElement('div');
                cell.className = 'beat-cell';
                cell.dataset.track = trackId;
                cell.dataset.position = i;
                cell.setAttribute('role', 'button');
                cell.setAttribute('aria-label', `Track ${trackId + 1}, Beat ${i + 1}`);
                row.appendChild(cell);
            }
        });
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Playback controls
        this.elements.playBtn.addEventListener('click', () => this.handlePlayPause());
        this.elements.stopBtn.addEventListener('click', () => this.handleStop());
        this.elements.loopBtn.addEventListener('click', () => this.handleLoopToggle());
        this.elements.clearBtn.addEventListener('click', () => this.handleClearAll());

        // Tempo slider
        this.elements.tempoSlider.addEventListener('input', (e) => this.handleTempoChange(e));

        // Intensity slider
        this.elements.intensitySlider.addEventListener('input', (e) => this.handleIntensityChange(e));

        // Track clear buttons
        document.querySelectorAll('.track-clear').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const trackId = parseInt(e.currentTarget.dataset.track);
                this.handleClearTrack(trackId);
            });
        });

        // Beat cell interactions
        this.setupBeatCellListeners();

        // Preset cards
        document.querySelectorAll('.preset-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const presetName = e.currentTarget.dataset.preset;
                this.handlePresetLoad(presetName);
            });
        });

        // Unsupported message dismiss
        if (this.elements.dismissUnsupported) {
            this.elements.dismissUnsupported.addEventListener('click', () => {
                this.elements.unsupportedMessage.classList.add('hidden');
            });
        }
    }

    /**
     * Setup beat cell listeners for touch and mouse
     */
    setupBeatCellListeners() {
        const beatCells = document.querySelectorAll('.beat-cell');

        beatCells.forEach(cell => {
            // Click/Tap
            cell.addEventListener('click', (e) => this.handleBeatClick(e));

            // Mouse drag
            cell.addEventListener('mousedown', (e) => this.handleDragStart(e));
            cell.addEventListener('mouseenter', (e) => this.handleDragOver(e));

            // Touch drag
            cell.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
            cell.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        });

        // Global drag end
        document.addEventListener('mouseup', () => this.handleDragEnd());
        document.addEventListener('touchend', () => this.handleDragEnd());
    }

    /**
     * Setup callbacks from sequencer and engine
     */
    setupCallbacks() {
        // Beat callback for playhead and visual feedback
        this.sequencer.onBeat((position, beats) => {
            this.updatePlayhead(position);
            this.updateBeatCounter(position);

            if (beats.length > 0) {
                this.showVisualFeedback(beats);
            }
        });

        // Play state change callback
        this.sequencer.onPlayStateChange((isPlaying) => {
            this.updatePlayButton(isPlaying);
            this.updatePlayheadVisibility(isPlaying);
        });

        // Vibration callback for visual feedback
        this.engine.onVibration((intensity) => {
            this.triggerFeedbackPulse(intensity);
        });
    }

    /**
     * Check vibration support and update UI
     */
    checkVibrationSupport() {
        const status = this.engine.getSupportStatus();

        this.elements.indicatorDot.classList.remove('supported', 'unsupported');

        if (status.supported) {
            this.elements.indicatorDot.classList.add('supported');
            this.elements.indicatorText.textContent = 'Vibration';
        } else if (status.hasAudio) {
            this.elements.indicatorDot.classList.add('supported');
            this.elements.indicatorText.textContent = 'Audio Mode';
        } else {
            this.elements.indicatorDot.classList.add('unsupported');
            this.elements.indicatorText.textContent = 'Not Supported';

            // Show warning message
            setTimeout(() => {
                this.elements.unsupportedMessage.classList.remove('hidden');
            }, 1000);
        }
    }

    /**
     * Handle play/pause button
     */
    handlePlayPause() {
        if (this.sequencer.isPlaying) {
            this.sequencer.pause();
        } else {
            this.sequencer.play();
        }
    }

    /**
     * Handle stop button
     */
    handleStop() {
        this.sequencer.stop();
    }

    /**
     * Handle loop toggle
     */
    handleLoopToggle() {
        const isLooping = this.sequencer.toggleLoop();
        this.elements.loopBtn.classList.toggle('active', isLooping);
    }

    /**
     * Handle clear all
     */
    handleClearAll() {
        if (confirm('Clear all beats?')) {
            this.sequencer.clearAll();
            this.updateTimelineUI();
        }
    }

    /**
     * Handle clear track
     */
    handleClearTrack(trackId) {
        this.sequencer.clearTrack(trackId);
        this.updateTimelineUI();
    }

    /**
     * Handle tempo change
     */
    handleTempoChange(event) {
        const tempo = parseInt(event.target.value);
        this.sequencer.setTempo(tempo);
        this.elements.tempoValue.textContent = tempo;
        this.elements.tempoDisplay.textContent = `${tempo} BPM`;
    }

    /**
     * Handle intensity change
     */
    handleIntensityChange(event) {
        const intensity = parseInt(event.target.value);
        this.currentIntensity = intensity / 100;
        this.elements.intensityValue.textContent = `${intensity}%`;
    }

    /**
     * Handle beat cell click
     */
    handleBeatClick(event) {
        const cell = event.currentTarget;
        const trackId = parseInt(cell.dataset.track);
        const position = parseInt(cell.dataset.position);

        const wasAdded = this.sequencer.toggleBeat(trackId, position, this.currentIntensity);
        this.updateBeatCell(cell, trackId, position, wasAdded);

        // Play preview
        if (wasAdded) {
            this.engine.playBeat(this.currentIntensity);
        }
    }

    /**
     * Handle drag start
     */
    handleDragStart(event) {
        event.preventDefault();
        this.isDragging = true;

        const cell = event.currentTarget;
        const trackId = parseInt(cell.dataset.track);
        const position = parseInt(cell.dataset.position);

        // Determine drag mode based on current state
        const hasBeat = this.sequencer.hasBeat(trackId, position);
        this.dragMode = hasBeat ? 'remove' : 'add';

        // Apply action
        if (this.dragMode === 'add') {
            this.sequencer.addBeat(trackId, position, this.currentIntensity);
            this.updateBeatCell(cell, trackId, position, true);
        } else {
            this.sequencer.removeBeat(trackId, position);
            this.updateBeatCell(cell, trackId, position, false);
        }
    }

    /**
     * Handle drag over
     */
    handleDragOver(event) {
        if (!this.isDragging) return;

        const cell = event.currentTarget;
        const trackId = parseInt(cell.dataset.track);
        const position = parseInt(cell.dataset.position);

        // Apply drag mode action
        if (this.dragMode === 'add') {
            if (!this.sequencer.hasBeat(trackId, position)) {
                this.sequencer.addBeat(trackId, position, this.currentIntensity);
                this.updateBeatCell(cell, trackId, position, true);
            }
        } else {
            if (this.sequencer.hasBeat(trackId, position)) {
                this.sequencer.removeBeat(trackId, position);
                this.updateBeatCell(cell, trackId, position, false);
            }
        }
    }

    /**
     * Handle touch start
     */
    handleTouchStart(event) {
        event.preventDefault();
        this.handleDragStart(event);

        // Trigger haptic feedback
        const cell = event.currentTarget;
        const trackId = parseInt(cell.dataset.track);
        const position = parseInt(cell.dataset.position);

        if (this.sequencer.hasBeat(trackId, position)) {
            const beat = this.sequencer.getBeat(trackId, position);
            this.engine.playBeat(beat.intensity);
        }
    }

    /**
     * Handle touch move
     */
    handleTouchMove(event) {
        event.preventDefault();

        if (!this.isDragging) return;

        const touch = event.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);

        if (element && element.classList.contains('beat-cell')) {
            this.handleDragOver({ currentTarget: element });
        }
    }

    /**
     * Handle drag end
     */
    handleDragEnd() {
        this.isDragging = false;
        this.dragMode = null;
    }

    /**
     * Handle preset load
     */
    handlePresetLoad(presetName) {
        const preset = PRESET_PATTERNS[presetName];

        if (preset) {
            this.sequencer.loadPreset(preset);
            this.updateTimelineUI();

            // Visual feedback
            const card = document.querySelector(`[data-preset="${presetName}"]`);
            if (card) {
                card.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    card.style.transform = '';
                }, 150);
            }
        }
    }

    /**
     * Update beat cell visual state
     */
    updateBeatCell(cell, trackId, position, isActive) {
        cell.classList.remove('active', 'intensity-low', 'intensity-medium', 'intensity-high', 'just-activated', 'just-deactivated');

        if (isActive) {
            const beat = this.sequencer.getBeat(trackId, position);
            cell.classList.add('active');

            // Add intensity class
            if (beat.intensity < 0.4) {
                cell.classList.add('intensity-low');
            } else if (beat.intensity < 0.7) {
                cell.classList.add('intensity-medium');
            } else {
                cell.classList.add('intensity-high');
            }

            // Animation
            cell.classList.add('just-activated');
            setTimeout(() => cell.classList.remove('just-activated'), 300);
        } else {
            cell.classList.add('just-deactivated');
            setTimeout(() => cell.classList.remove('just-deactivated'), 200);
        }
    }

    /**
     * Update entire timeline UI
     */
    updateTimelineUI() {
        document.querySelectorAll('.beat-cell').forEach(cell => {
            const trackId = parseInt(cell.dataset.track);
            const position = parseInt(cell.dataset.position);
            const hasBeat = this.sequencer.hasBeat(trackId, position);

            this.updateBeatCell(cell, trackId, position, hasBeat);
        });
    }

    /**
     * Update playhead position
     */
    updatePlayhead(position) {
        const beatCells = document.querySelectorAll('.beat-cell');
        const totalBeats = 16;
        const percentage = (position / totalBeats) * 100;

        this.elements.playhead.style.left = `${percentage}%`;

        // Highlight current beat cells
        beatCells.forEach(cell => {
            cell.classList.remove('current', 'playing');

            if (parseInt(cell.dataset.position) === position) {
                cell.classList.add('current');

                const trackId = parseInt(cell.dataset.track);
                if (this.sequencer.hasBeat(trackId, position)) {
                    cell.classList.add('playing');
                }
            }
        });
    }

    /**
     * Update beat counter
     */
    updateBeatCounter(position) {
        this.elements.beatCounter.textContent = `${position + 1}/16`;
    }

    /**
     * Update play button state
     */
    updatePlayButton(isPlaying) {
        const playIcon = this.elements.playBtn.querySelector('.play-icon');
        const pauseIcon = this.elements.playBtn.querySelector('.pause-icon');

        if (isPlaying) {
            playIcon.classList.add('hidden');
            pauseIcon.classList.remove('hidden');
        } else {
            playIcon.classList.remove('hidden');
            pauseIcon.classList.add('hidden');
        }
    }

    /**
     * Update playhead visibility
     */
    updatePlayheadVisibility(isPlaying) {
        if (isPlaying) {
            this.elements.playhead.classList.add('active');
        } else {
            this.elements.playhead.classList.remove('active');
        }
    }

    /**
     * Show visual feedback for beats
     */
    showVisualFeedback(beats) {
        // Calculate average intensity
        const avgIntensity = beats.reduce((sum, beat) => sum + beat.intensity, 0) / beats.length;
        this.triggerFeedbackPulse(avgIntensity);
    }

    /**
     * Trigger feedback overlay pulse
     */
    triggerFeedbackPulse(intensity) {
        const overlay = this.elements.feedbackOverlay;

        // Set opacity based on intensity
        overlay.style.opacity = intensity * 0.3;
        overlay.classList.add('active');

        setTimeout(() => {
            overlay.classList.remove('active');
        }, 300);
    }

    /**
     * Initialize with default state
     */
    initialize() {
        // Set initial loop state
        this.elements.loopBtn.classList.add('active');

        // Update tempo display
        this.elements.tempoDisplay.textContent = `${this.sequencer.getTempo()} BPM`;
    }
}

/**
 * ============================================
 * APPLICATION INITIALIZATION
 * ============================================
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Create instances
    const vibrationEngine = new VibrationEngine();
    const sequencer = new Sequencer(vibrationEngine);
    const uiController = new UIController(sequencer, vibrationEngine);

    // Initialize
    uiController.initialize();

    // Make available globally for debugging
    window.vibrationComposer = {
        engine: vibrationEngine,
        sequencer: sequencer,
        ui: uiController
    };

    console.log('Vibration Composer initialized');
    console.log('Support status:', vibrationEngine.getSupportStatus());
});
