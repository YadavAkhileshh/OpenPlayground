/**
 * HARMONICA JS v2.0 - MAIN CONTROLLER
 * Orchestrates audio engine, UI, and user interactions
 */

class HarmonicaController {
    constructor() {
        this.audioEngine = null;
        this.harmonicaUI = null;
        this.visualizer = null;

        this.isShiftPressed = false;
        this.currentHole = null;

        this.initialize();
    }

    /**
     * Initialize all components
     */
    initialize() {
        console.log('🎵 Initializing Harmonica JS v2.0...');

        // Create components
        this.audioEngine = new AudioEngine();
        this.harmonicaUI = new HarmonicaUI('harmonica');
        this.visualizer = new Visualizer(this.audioEngine);

        // Setup event listeners
        this.setupKeyboardControls();
        this.setupUIControls();
        this.setupAudioControls();

        // Initialize audio on first interaction
        this.initializeAudioOnInteraction();

        // VALIDATION: Set default hole to 4 so it works immediately
        this.currentHole = 4;
        this.harmonicaUI.selectHole(this.currentHole);

        console.log('✅ Harmonica JS Ready!');
        this.showWelcomeMessage();
    }

    /**
     * Setup keyboard event listeners
     */
    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }

    /**
     * Handle keydown events
     */
    handleKeyDown(e) {
        // Prevent defaults for arrow keys and space
        if (['ArrowUp', 'ArrowDown', ' ', 'Escape'].includes(e.key)) {
            e.preventDefault();
        }

        // Avoid repeats
        if (e.repeat) return;

        // Track shift for pitch bend
        if (e.key === 'Shift') {
            this.isShiftPressed = true;
            if (this.audioEngine.isPlaying()) {
                this.audioEngine.applyPitchBend(-1); // Bend down
            }
            return;
        }

        // Select hole (1-9, 0 for hole 10)
        if (KEYBOARD_MAPPING[e.key]) {
            this.currentHole = KEYBOARD_MAPPING[e.key];
            this.harmonicaUI.selectHole(this.currentHole);
        }

        // Play note
        if (this.currentHole) {
            if (e.key === 'ArrowUp') {
                this.playBlow();
            } else if (e.key === 'ArrowDown') {
                this.playDraw();
            }
        }

        // Stop all (Space)
        if (e.key === ' ') {
            this.stopAll();
        }

        // Reset (Escape)
        if (e.key === 'Escape') {
            this.reset();
        }
    }

    /**
     * Handle keyup events
     */
    handleKeyUp(e) {
        if (e.key === 'Shift') {
            this.isShiftPressed = false;
            if (this.audioEngine.isPlaying()) {
                this.audioEngine.applyPitchBend(0); // Return to normal
            }
            return;
        }

        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            this.stopNote();
        }
    }

    /**
     * Play blow note
     */
    playBlow() {
        if (!this.currentHole) {
            this.currentHole = 4;
            this.harmonicaUI.selectHole(4);
        }

        const note = HARMONICA_NOTES[this.currentHole];
        this.audioEngine.playNote(note.blow, note.blowName, true);
        this.harmonicaUI.activateHole(this.currentHole, true);
        this.visualizer.start();
        this.visualizer.updateModeIndicator(true);
    }

    /**
     * Play draw note
     */
    playDraw() {
        if (!this.currentHole) {
            this.currentHole = 4;
            this.harmonicaUI.selectHole(4);
        }

        const note = HARMONICA_NOTES[this.currentHole];
        this.audioEngine.playNote(note.draw, note.drawName, false);
        this.harmonicaUI.activateHole(this.currentHole, false);
        this.visualizer.start();
        this.visualizer.updateModeIndicator(false);
    }

    /**
     * Stop current note
     */
    stopNote() {
        if (!this.currentHole) return;

        this.audioEngine.stopNote();
        this.harmonicaUI.deactivateHole(this.currentHole);
        this.visualizer.stop();
        this.visualizer.clearModeIndicators();
    }

    /**
     * Stop all sounds
     */
    stopAll() {
        this.audioEngine.stopNote();
        this.harmonicaUI.deactivateAll();
        this.visualizer.stop();
        this.visualizer.clearModeIndicators();
    }

    /**
     * Reset everything
     */
    reset() {
        this.stopAll();
        // Reset to default hole 4
        this.currentHole = 4;
        this.isShiftPressed = false;
        this.harmonicaUI.selectHole(4);
        this.visualizer.reset();
    }

    /**
     * Setup UI control event listeners
     */
    setupUIControls() {
        // Vibrato toggle
        const vibratoToggle = document.getElementById('vibratoToggle');
        vibratoToggle?.addEventListener('change', (e) => {
            this.audioEngine.updateSettings('vibratoEnabled', e.target.checked);
        });

        // Vibrato depth
        const vibratoDepth = document.getElementById('vibratoDepth');
        const vibratoValue = document.getElementById('vibratoValue');
        vibratoDepth?.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.audioEngine.updateSettings('vibratoDepth', value);
            if (vibratoValue) vibratoValue.textContent = value;
        });

        // Vibrato speed
        const vibratoSpeed = document.getElementById('vibratoSpeed');
        const speedValue = document.getElementById('speedValue');
        vibratoSpeed?.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.audioEngine.updateSettings('vibratoSpeed', value);
            if (speedValue) speedValue.textContent = value + 'Hz';
        });

        // Pitch bend toggle
        const bendToggle = document.getElementById('bendToggle');
        bendToggle?.addEventListener('change', (e) => {
            this.audioEngine.updateSettings('bendEnabled', e.target.checked);
        });

        // Bend range
        const bendRange = document.getElementById('bendRange');
        const bendValue = document.getElementById('bendValue');
        bendRange?.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.audioEngine.updateSettings('bendRange', value);
            if (bendValue) bendValue.textContent = value;
        });

        // Reverb toggle
        const reverbToggle = document.getElementById('reverbToggle');
        reverbToggle?.addEventListener('change', (e) => {
            this.audioEngine.updateSettings('reverbEnabled', e.target.checked);
        });

        // Reverb mix
        const reverbMix = document.getElementById('reverbMix');
        const reverbValue = document.getElementById('reverbValue');
        reverbMix?.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value) / 100;
            this.audioEngine.updateSettings('reverbMix', value);
            if (reverbValue) reverbValue.textContent = e.target.value + '%';
        });
    }

    /**
     * Setup audio control event listeners
     */
    setupAudioControls() {
        // Volume slider
        const volumeSlider = document.getElementById('volumeSlider');
        const volumeDisplay = document.getElementById('volumeDisplay');
        volumeSlider?.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value) / 100;
            this.audioEngine.updateSettings('volume', value);
            if (volumeDisplay) volumeDisplay.textContent = e.target.value + '%';
        });

        // Waveform selector
        const waveformSelect = document.getElementById('waveformSelect');
        waveformSelect?.addEventListener('change', (e) => {
            this.audioEngine.updateSettings('waveform', e.target.value);
        });
    }

    /**
     * Initialize audio context on first user interaction
     */
    initializeAudioOnInteraction() {
        const initAudio = () => {
            if (!this.audioEngine.initialized) {
                this.audioEngine.initialize();
                console.log('🔊 Audio initialized on user interaction');
            }
        };

        // Listen for any user interaction
        document.addEventListener('click', initAudio, { once: true });
        document.addEventListener('keydown', initAudio, { once: true });
        document.addEventListener('touchstart', initAudio, { once: true });
    }

    /**
     * Show welcome message in console
     */
    showWelcomeMessage() {
        console.log(`
╔══════════════════════════════════════╗
║     🎵 HARMONICA JS v2.0 PRO 🎵     ║
║                                      ║
║  Professional Virtual Harmonica      ║
║  Built with Web Audio API            ║
║                                      ║
║  Controls:                           ║
║  - Keys 1-9, 0: Select holes         ║
║  - Arrow Up: Blow                    ║
║  - Arrow Down: Draw                  ║
║  - Shift: Pitch bend                 ║
║  - Space: Stop all                   ║
║  - Escape: Reset                     ║
║                                      ║
║  Enjoy playing! 🎶                   ║
╚══════════════════════════════════════╝
        `);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const harmonicaApp = new HarmonicaController();
    window.harmonicaApp = harmonicaApp; // Expose for debugging
});

console.log('✓ Controller loaded');