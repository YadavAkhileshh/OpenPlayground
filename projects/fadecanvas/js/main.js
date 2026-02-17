// ============================================
// FadeCanvas - Main Application
// Coordinates all systems and manages UI
// ============================================

class FadeCanvasApp {
    constructor() {
        this.canvas = document.getElementById('fadeCanvas');
        this.controlPanel = document.getElementById('controlPanel');

        // Initialize systems
        this.drawingEngine = new DrawingEngine(this.canvas);
        this.decaySystem = new DecaySystem(this.drawingEngine);
        this.interactionTracker = new InteractionTracker(this.canvas, this.decaySystem);

        // UI elements
        this.brushSizeSlider = document.getElementById('brushSize');
        this.brushSizeValue = document.getElementById('brushSizeValue');
        this.decaySpeedSlider = document.getElementById('decaySpeed');
        this.decaySpeedValue = document.getElementById('decaySpeedValue');
        this.brushColorPicker = document.getElementById('brushColor');
        this.colorPreview = document.getElementById('colorPreview');
        this.clearButton = document.getElementById('clearCanvas');
        this.pauseButton = document.getElementById('pauseDecay');
        this.togglePanelButton = document.getElementById('togglePanel');
        this.modeButtons = document.querySelectorAll('.mode-button');
        this.strokeCountDisplay = document.getElementById('strokeCount');

        // Animation loop
        this.animationFrameId = null;
        this.isRunning = false;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateColorPreview();
        this.startAnimationLoop();

        console.log('FadeCanvas initialized');
    }

    setupEventListeners() {
        // Brush size control
        this.brushSizeSlider.addEventListener('input', (e) => {
            const size = parseFloat(e.target.value);
            this.drawingEngine.setBrushSize(size);
            this.brushSizeValue.textContent = size;
        });

        // Decay speed control
        this.decaySpeedSlider.addEventListener('input', (e) => {
            const speed = parseFloat(e.target.value);
            this.decaySystem.setDecaySpeed(speed);
            this.decaySpeedValue.textContent = `${speed.toFixed(1)}x`;
        });

        // Brush color control
        this.brushColorPicker.addEventListener('input', (e) => {
            const color = e.target.value;
            this.drawingEngine.setBrushColor(color);
            this.updateColorPreview();
        });

        // Decay mode buttons
        this.modeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const mode = e.target.dataset.mode;
                this.setDecayMode(mode);
            });
        });

        // Clear canvas button
        this.clearButton.addEventListener('click', () => {
            this.clearCanvas();
        });

        // Pause decay button
        this.pauseButton.addEventListener('click', () => {
            this.togglePause();
        });

        // Toggle panel button
        this.togglePanelButton.addEventListener('click', () => {
            this.togglePanel();
        });

        // Listen to stroke events for stats update
        this.canvas.addEventListener('strokeEnd', () => {
            this.updateStats();
        });

        this.canvas.addEventListener('canvasCleared', () => {
            this.updateStats();
        });

        // Listen for strokes being removed by decay
        this.canvas.addEventListener('strokesDecayed', () => {
            this.updateStats();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });
    }

    setDecayMode(mode) {
        this.decaySystem.setDecayMode(mode);

        // Update button states
        this.modeButtons.forEach(button => {
            if (button.dataset.mode === mode) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }

    clearCanvas() {
        this.drawingEngine.clearCanvas();
        this.interactionTracker.reset();
        this.updateStats();
    }

    togglePause() {
        const isPaused = this.decaySystem.togglePause();

        if (isPaused) {
            this.pauseButton.classList.add('active');
            this.pauseButton.innerHTML = `
                <svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                Resume Decay
            `;
        } else {
            this.pauseButton.classList.remove('active');
            this.pauseButton.innerHTML = `
                <svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="6" y="4" width="4" height="16"/>
                    <rect x="14" y="4" width="4" height="16"/>
                </svg>
                Pause Decay
            `;
        }
    }

    togglePanel() {
        this.controlPanel.classList.toggle('hidden');
    }

    updateColorPreview() {
        const color = this.brushColorPicker.value;
        this.colorPreview.style.background = color;
    }

    updateStats() {
        const strokeCount = this.drawingEngine.getStrokeCount();
        this.strokeCountDisplay.textContent = strokeCount;
    }

    handleKeyboard(e) {
        // Prevent default for shortcuts
        const shortcuts = ['c', 'p', 'h', ' '];
        if (shortcuts.includes(e.key.toLowerCase())) {
            e.preventDefault();
        }

        switch (e.key.toLowerCase()) {
            case 'c':
                this.clearCanvas();
                break;
            case 'p':
                this.togglePause();
                break;
            case 'h':
                this.togglePanel();
                break;
            case ' ':
                this.togglePause();
                break;
            case '1':
                this.setDecayMode('fade');
                break;
            case '2':
                this.setDecayMode('blur');
                break;
            case '3':
                this.setDecayMode('fragment');
                break;
            case '4':
                this.setDecayMode('distort');
                break;
        }
    }

    startAnimationLoop() {
        this.isRunning = true;
        this.animate();
    }

    stopAnimationLoop() {
        this.isRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    animate() {
        if (!this.isRunning) return;

        const currentTime = Date.now();

        // Update decay system
        this.decaySystem.update(currentTime);

        // Continue animation loop
        this.animationFrameId = requestAnimationFrame(() => this.animate());
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.fadeCanvasApp = new FadeCanvasApp();
});
