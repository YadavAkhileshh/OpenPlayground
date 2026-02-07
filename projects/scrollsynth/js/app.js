/**
 * ScrollSynth - Main Application Entry Point
 * Coordinates all modules and initializes the user experience
 */

class ScrollSynthApp {
    constructor() {
        // Core Modules
        this.audio = new AudioEngine();
        this.physics = new ScrollPhysics();
        this.mapper = new ScrollMapper(this.physics, this.audio);
        this.touch = null; // Initialized later

        // Features
        this.arp = new Arpeggiator(this.audio);
        this.loop = new LoopRecorder('loopCanvas');
        this.presets = new PresetManager(this.audio);
        this.gesture = new GestureDetector('gestureCanvas');

        // Visualizers
        this.waveform = new WaveformVisualizer('waveformCanvas', this.audio);
        this.spectrum = new SpectrumAnalyzer('spectrumCanvas', this.audio);
        this.pitch = new PitchIndicator(this.audio);

        // UI
        this.ui = new UIController(this.audio, this.arp, this.loop, this.presets, this.gesture);

        // DOM Elements
        this.loader = document.getElementById('loader');
        this.appMain = document.getElementById('app');

        // State
        this.isStarted = false;
        this.animationId = null;
    }

    /**
     * Start the application
     */
    async init() {
        console.log('ScrollSynth: Initializing...');

        // Initialize UI
        this.ui.initialize();
        this.mapper.initialize();

        // Initialize Touch support if needed
        if (CONFIG.TOUCH.ENABLED) {
            this.touch = new TouchHandler(this.mapper, this.gesture);
            this.touch.initialize();
        }

        // Global interaction listener to start audio (browser policy)
        const startApp = async () => {
            if (this.isStarted) return;

            try {
                // Initialize audio on first click/scroll
                await this.audio.initialize();
                this.audio.start();

                // Start visualizers
                this.waveform.start();
                this.spectrum.start();
                this.pitch.start();

                // Hide loader
                this.loader.classList.add('fade-out');
                this.appMain.classList.remove('hidden');

                // Start main loop
                this.isStarted = true;
                this.startLoop();

                // Show welcome message
                console.log('ScrollSynth: System Online');

                // Remove interaction listeners
                window.removeEventListener('mousedown', startApp);
                window.removeEventListener('keydown', startApp);
                window.removeEventListener('touchstart', startApp);
            } catch (err) {
                console.error('ScrollSynth: Initialization failed', err);
                // Force hide loader even if audio fails so UI is visible
                this.loader.classList.add('fade-out');
                this.appMain.classList.remove('hidden');
            }
        };

        window.addEventListener('mousedown', startApp);
        window.addEventListener('keydown', startApp);
        window.addEventListener('touchstart', startApp, { passive: false });

        // Handle Loop Playback events
        window.addEventListener('loopPlayback', (e) => {
            const { vertical, horizontal } = e.detail;
            this.physics.setTarget(vertical, horizontal);
        });

        // Handle Gesture events
        window.addEventListener('gestureDetected', (e) => {
            this.handleGesture(e.detail.type);
        });

        // Initial setup complete
        setTimeout(() => {
            const progress = document.querySelector('.loader-progress');
            if (progress) progress.style.width = '100%';
        }, 500);
    }

    /**
     * Main application loop running at 60fps
     */
    startLoop() {
        const update = () => {
            if (!this.isStarted) return;

            // 1. Update Physics
            const scrollValues = this.physics.update();

            // 2. Map to Audio (if not in Arpeggiator mode)
            if (!this.arp.isActive) {
                this.mapper.mapToAudio(scrollValues);
            } else {
                // In Arpeggiator mode, vertical scroll only sets the base frequency
                const baseFreq = MATH.exponentialScale(
                    scrollValues.vertical,
                    CONFIG.AUDIO.MIN_FREQUENCY,
                    CONFIG.AUDIO.MAX_FREQUENCY
                );
                this.arp.setBaseFrequency(baseFreq);

                // Horizontal still maps to filter
                const filterFreq = MATH.exponentialScale(
                    scrollValues.horizontal,
                    CONFIG.AUDIO.MIN_FILTER_FREQ,
                    CONFIG.AUDIO.MAX_FILTER_FREQ
                );
                this.audio.setFilterFrequency(filterFreq);
            }

            // 3. Handle Recording
            if (this.loop.isRecording) {
                this.loop.record(scrollValues.vertical, scrollValues.horizontal);
            }

            // 4. Update UI visuals that aren't canvas based
            // (Note names are handled by PitchIndicator's own timer for efficiency)

            this.animationId = requestAnimationFrame(update);
        };

        update();
    }

    /**
     * Handle detected gestures
     */
    handleGesture(type) {
        console.log(`ScrollSynth: Gesture detected - ${type}`);

        const canvas = document.getElementById('gestureCanvas');
        if (canvas) canvas.parentElement.classList.add('gesture-detected');
        setTimeout(() => {
            if (canvas) canvas.parentElement.classList.remove('gesture-detected');
        }, 500);

        switch (type) {
            case 'circle':
                // Reverb/Distortion burst
                const currentDist = this.audio.settings.distortion;
                this.audio.setDistortion(100);
                setTimeout(() => this.audio.setDistortion(currentDist), 300);
                break;
            case 'zigzag':
                // High Resonance burst
                const currentQ = this.audio.settings.filterQ;
                this.audio.setFilterQ(30);
                setTimeout(() => this.audio.setFilterQ(currentQ), 500);
                break;
            case 'diagonal':
                // Quick Filter Sweep
                const currentFreq = this.audio.settings.filterFreq;
                this.audio.setFilterFrequency(CONFIG.AUDIO.MAX_FILTER_FREQ);
                setTimeout(() => this.audio.setFilterFrequency(currentFreq), 800);
                break;
        }
    }
}

// Initialize App on DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new ScrollSynthApp();
    app.init();

    // Safety check for Web Audio context
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && app.audio.context) {
            if (app.audio.isPlaying && app.audio.context.state === 'suspended') {
                app.audio.context.resume();
            }
        }
    });
});
