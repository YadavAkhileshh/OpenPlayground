/**
 * FaviPlay - UI Controller (Enhanced)
 * Manages user interface and controls with advanced features
 */

class UIController {
    constructor(faviconEngine) {
        this.engine = faviconEngine;

        // UI Elements
        this.playPauseBtn = null;
        this.btnText = null;
        this.fpsSlider = null;
        this.fpsValue = null;
        this.sliderFill = null;
        this.sequenceSelector = null;
        this.statusIndicator = null;
        this.statusText = null;

        // New feature elements
        this.colorPicker = null;
        this.colorValue = null;
        this.colorPresets = null;
        this.speedBtns = null;
        this.frameScrubber = null;
        this.frameValue = null;
        this.scrubberGroup = null;
        this.reverseBtn = null;
        this.randomBtn = null;
        this.exportBtn = null;

        // State
        this.isInitialized = false;
        this.randomMode = false;
        this.randomInterval = null;

        this.init();
    }

    /**
     * Initialize UI controller
     */
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    /**
     * Setup UI elements and event listeners
     */
    setup() {
        // Get core UI elements
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.btnText = document.getElementById('btnText');
        this.fpsSlider = document.getElementById('fpsSlider');
        this.fpsValue = document.getElementById('fpsValue');
        this.sliderFill = document.getElementById('sliderFill');
        this.sequenceSelector = document.getElementById('sequenceSelector');
        this.statusIndicator = document.getElementById('statusIndicator');
        this.statusText = document.getElementById('statusText');

        // Get new feature elements
        this.colorPicker = document.getElementById('colorPicker');
        this.colorValue = document.getElementById('colorValue');
        this.colorPresets = document.querySelectorAll('.color-preset');
        this.speedBtns = document.querySelectorAll('.speed-btn');
        this.frameScrubber = document.getElementById('frameScrubber');
        this.frameValue = document.getElementById('frameValue');
        this.scrubberGroup = document.getElementById('scrubberGroup');
        this.reverseBtn = document.getElementById('reverseBtn');
        this.randomBtn = document.getElementById('randomBtn');
        this.exportBtn = document.getElementById('exportBtn');

        if (!this.playPauseBtn || !this.fpsSlider || !this.sequenceSelector) {
            console.error('Required UI elements not found');
            return;
        }

        this.setupEventListeners();
        this.setupEngineCallbacks();

        // Initialize UI state
        this.updatePlaybackState(this.engine.isPlaying);
        this.updateFPSDisplay(this.engine.baseFPS || this.engine.fps);
        this.updateSliderFill(this.engine.baseFPS || this.engine.fps);

        this.isInitialized = true;
        console.log('✨ UI Controller initialized with advanced features');
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Core controls
        this.playPauseBtn.addEventListener('click', () => this.handlePlayPause());
        this.fpsSlider.addEventListener('input', (e) => this.handleFPSChange(parseInt(e.target.value)));
        this.sequenceSelector.addEventListener('change', (e) => this.handleSequenceChange(e.target.value));

        // Color picker
        if (this.colorPicker) {
            this.colorPicker.addEventListener('input', (e) => this.handleColorChange(e.target.value));
        }

        // Color presets
        if (this.colorPresets) {
            this.colorPresets.forEach(btn => {
                btn.addEventListener('click', () => {
                    const color = btn.dataset.color;
                    this.colorPicker.value = color;
                    this.handleColorChange(color);
                });
            });
        }

        // Speed presets
        if (this.speedBtns) {
            this.speedBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const speed = parseFloat(btn.dataset.speed);
                    this.handleSpeedChange(speed);
                    this.updateSpeedBtnActive(btn);
                });
            });
        }

        // Frame scrubber
        if (this.frameScrubber) {
            this.frameScrubber.addEventListener('input', (e) => this.handleFrameScrub(parseInt(e.target.value)));
        }

        // Advanced options
        if (this.reverseBtn) {
            this.reverseBtn.addEventListener('click', () => this.handleReverseToggle());
        }
        if (this.randomBtn) {
            this.randomBtn.addEventListener('click', () => this.handleRandomToggle());
        }
        if (this.exportBtn) {
            this.exportBtn.addEventListener('click', () => this.handleExport());
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    /**
     * Setup engine callbacks
     */
    setupEngineCallbacks() {
        this.engine.onPlayStateChange = (isPlaying) => this.updatePlaybackState(isPlaying);
    }

    /**
     * Handle play/pause
     */
    handlePlayPause() {
        this.engine.toggle();
    }

    /**
     * Handle FPS change
     */
    handleFPSChange(fps) {
        this.engine.setFPS(fps);
        this.updateFPSDisplay(fps);
        this.updateSliderFill(fps);
    }

    /**
     * Handle sequence change
     */
    handleSequenceChange(sequenceName) {
        this.engine.loadSequence(sequenceName);
        this.showSequenceChangeEffect();
    }

    /**
     * Handle color change
     */
    handleColorChange(color) {
        this.engine.frameGenerator.setColor(color);
        this.engine.loadSequence(this.engine.currentSequence);
        this.colorValue.textContent = color.toUpperCase();
        this.updateColorPresetActive(color);
    }

    /**
     * Update active color preset
     */
    updateColorPresetActive(color) {
        this.colorPresets.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.color.toLowerCase() === color.toLowerCase());
        });
    }

    /**
     * Handle speed multiplier change
     */
    handleSpeedChange(multiplier) {
        this.engine.setSpeedMultiplier(multiplier);
    }

    /**
     * Update active speed button
     */
    updateSpeedBtnActive(activeBtn) {
        this.speedBtns.forEach(btn => btn.classList.remove('active'));
        activeBtn.classList.add('active');
    }

    /**
     * Handle frame scrubbing
     */
    handleFrameScrub(frameIndex) {
        this.engine.setFrame(frameIndex);
        this.updateFrameValue(frameIndex);
    }

    /**
     * Handle reverse toggle
     */
    handleReverseToggle() {
        const isReversed = this.engine.toggleReverse();
        this.reverseBtn.classList.toggle('active', isReversed);
    }

    /**
     * Handle random mode toggle
     */
    handleRandomToggle() {
        this.randomMode = !this.randomMode;
        this.randomBtn.classList.toggle('active', this.randomMode);

        if (this.randomMode) {
            this.startRandomMode();
        } else {
            this.stopRandomMode();
        }
    }

    /**
     * Start random mode
     */
    startRandomMode() {
        const sequences = ['spinner', 'bouncingBall', 'progressBar', 'pulse', 'wave', 'clock'];
        let currentIndex = sequences.indexOf(this.engine.currentSequence);

        this.randomInterval = setInterval(() => {
            let nextIndex;
            do {
                nextIndex = Math.floor(Math.random() * sequences.length);
            } while (nextIndex === currentIndex && sequences.length > 1);

            currentIndex = nextIndex;
            const nextSequence = sequences[nextIndex];
            this.sequenceSelector.value = nextSequence;
            this.handleSequenceChange(nextSequence);
        }, 5000);

        this.showNotification('🎲 Random mode activated!', 'info');
    }

    /**
     * Stop random mode
     */
    stopRandomMode() {
        if (this.randomInterval) {
            clearInterval(this.randomInterval);
            this.randomInterval = null;
        }
    }

    /**
     * Handle export
     */
    handleExport() {
        this.showNotification('📥 Downloading current frame...', 'info');

        const link = document.createElement('a');
        link.download = `faviplay-${this.engine.currentSequence}-frame.png`;
        link.href = this.engine.frameBuffer[this.engine.currentFrameIndex];
        link.click();

        setTimeout(() => {
            this.showNotification('✅ Frame downloaded!', 'info');
        }, 500);
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboard(e) {
        if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'SELECT') {
            e.preventDefault();
            this.handlePlayPause();
        }

        if (e.code === 'ArrowUp') {
            e.preventDefault();
            const newFPS = Math.min(60, (this.engine.baseFPS || this.engine.fps) + 1);
            this.fpsSlider.value = newFPS;
            this.handleFPSChange(newFPS);
        }

        if (e.code === 'ArrowDown') {
            e.preventDefault();
            const newFPS = Math.max(1, (this.engine.baseFPS || this.engine.fps) - 1);
            this.fpsSlider.value = newFPS;
            this.handleFPSChange(newFPS);
        }

        if (!this.engine.isPlaying) {
            if (e.code === 'ArrowLeft') {
                e.preventDefault();
                const newFrame = Math.max(0, this.engine.currentFrameIndex - 1);
                this.frameScrubber.value = newFrame;
                this.handleFrameScrub(newFrame);
            }
            if (e.code === 'ArrowRight') {
                e.preventDefault();
                const newFrame = Math.min(this.engine.totalFrames - 1, this.engine.currentFrameIndex + 1);
                this.frameScrubber.value = newFrame;
                this.handleFrameScrub(newFrame);
            }
        }

        const numberKeys = ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6'];
        const sequences = ['spinner', 'bouncingBall', 'progressBar', 'pulse', 'wave', 'clock'];
        const keyIndex = numberKeys.indexOf(e.code);
        if (keyIndex !== -1 && keyIndex < sequences.length) {
            e.preventDefault();
            this.sequenceSelector.value = sequences[keyIndex];
            this.handleSequenceChange(sequences[keyIndex]);
        }

        if (e.code === 'KeyR' && e.target.tagName !== 'INPUT') {
            e.preventDefault();
            this.handleReverseToggle();
        }
    }

    /**
     * Update playback state UI
     */
    updatePlaybackState(isPlaying) {
        if (isPlaying) {
            this.playPauseBtn.classList.remove('paused');
            this.btnText.textContent = 'Pause';
            this.statusIndicator.classList.remove('paused');
            this.statusText.textContent = 'Playing';
            if (this.scrubberGroup) this.scrubberGroup.style.display = 'none';
        } else {
            this.playPauseBtn.classList.add('paused');
            this.btnText.textContent = 'Play';
            this.statusIndicator.classList.add('paused');
            this.statusText.textContent = 'Paused';
            if (this.scrubberGroup) {
                this.scrubberGroup.style.display = 'flex';
                this.updateFrameScrubber();
            }
        }
    }

    /**
     * Update FPS display
     */
    updateFPSDisplay(fps) {
        if (this.fpsValue) {
            this.fpsValue.textContent = `${fps} FPS`;
        }
    }

    /**
     * Update slider fill
     */
    updateSliderFill(fps) {
        if (this.sliderFill) {
            const min = parseInt(this.fpsSlider.min);
            const max = parseInt(this.fpsSlider.max);
            const percentage = ((fps - min) / (max - min)) * 100;
            this.sliderFill.style.width = `${percentage}%`;
        }
    }

    /**
     * Update frame scrubber
     */
    updateFrameScrubber() {
        if (this.frameScrubber && this.engine) {
            this.frameScrubber.max = this.engine.totalFrames - 1;
            this.frameScrubber.value = this.engine.currentFrameIndex;
            this.updateFrameValue(this.engine.currentFrameIndex);
        }
    }

    /**
     * Update frame value display
     */
    updateFrameValue(frameIndex) {
        if (this.frameValue && this.engine) {
            this.frameValue.textContent = `${frameIndex + 1} / ${this.engine.totalFrames}`;
        }
    }

    /**
     * Show sequence change effect
     */
    showSequenceChangeEffect() {
        const controlPanel = document.querySelector('.control-panel');
        if (controlPanel) {
            controlPanel.style.transition = 'none';
            controlPanel.style.transform = 'scale(0.98)';
            setTimeout(() => {
                controlPanel.style.transition = 'transform 0.3s ease';
                controlPanel.style.transform = 'scale(1)';
            }, 50);
        }
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: rgba(99, 102, 241, 0.9);
            color: white;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            animation: fadeIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize application
let app = null;

function initFaviPlay() {
    const frameGenerator = new FrameGenerator();
    const faviconEngine = new FaviconEngine(frameGenerator);
    const uiController = new UIController(faviconEngine);

    app = { frameGenerator, faviconEngine, uiController };
    window.FaviPlay = app;

    console.log('🎬 FaviPlay initialized with advanced features!');
    console.log('Keyboard shortcuts:');
    console.log('  Space - Play/Pause');
    console.log('  ↑/↓ - Adjust FPS');
    console.log('  ←/→ - Scrub frames (when paused)');
    console.log('  1-6 - Select sequence');
    console.log('  R - Toggle reverse');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFaviPlay);
} else {
    initFaviPlay();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIController;
}
