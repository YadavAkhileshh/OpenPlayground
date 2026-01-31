/**
 * CHECKBOXSCREEN - MAIN APPLICATION
 * Application controller and UI integration
 */

class CheckboxScreenApp {
    constructor() {
        // Core components
        this.grid = null;
        this.patternLibrary = null;
        this.animator = null;
        
        // UI elements
        this.elements = {};
        
        // State
        this.currentPattern = 'waves';
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }
    
    /**
     * Initialize the application
     */
    async initialize() {
        // Cache DOM elements
        this.cacheElements();
        
        // Show loading
        this.showLoading();
        
        // Small delay for visual feedback
        await this.delay(500);
        
        // Initialize core components
        this.initializeGrid();
        this.initializePatternLibrary();
        this.initializeAnimator();
        
        // Setup UI
        this.setupEventListeners();
        this.setupAnimatorCallbacks();
        
        // Load initial pattern
        this.loadPattern(this.currentPattern);
        
        // Hide loading
        this.hideLoading();
        
        // Auto-start animation
        this.animator.play();
    }
    
    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.elements = {
            // Main containers
            checkboxGrid: document.getElementById('checkboxGrid'),
            loadingOverlay: document.getElementById('loadingOverlay'),
            controlPanel: document.getElementById('controlPanel'),
            panelContent: document.getElementById('panelContent'),
            
            // Stats
            gridSize: document.getElementById('gridSize'),
            currentFps: document.getElementById('currentFps'),
            currentFrame: document.getElementById('currentFrame'),
            
            // Controls
            playPauseBtn: document.getElementById('playPauseBtn'),
            playPauseIcon: document.getElementById('playPauseIcon'),
            playPauseLabel: document.getElementById('playPauseLabel'),
            resetBtn: document.getElementById('resetBtn'),
            panelToggle: document.getElementById('panelToggle'),
            
            // Sliders
            fpsSlider: document.getElementById('fpsSlider'),
            fpsValue: document.getElementById('fpsValue'),
            resolutionSlider: document.getElementById('resolutionSlider'),
            resolutionValue: document.getElementById('resolutionValue'),
            
            // Options
            smoothTransition: document.getElementById('smoothTransition'),
            showStats: document.getElementById('showStats'),
            autoLoop: document.getElementById('autoLoop'),
            
            // Pattern buttons
            patternButtons: document.querySelectorAll('.pattern-btn')
        };
    }
    
    /**
     * Initialize checkbox grid
     */
    initializeGrid() {
        this.grid = new CheckboxGrid(this.elements.checkboxGrid);
        const preset = this.grid.initialize(2); // Medium resolution
        this.updateGridStats(preset.rows, preset.cols);
    }
    
    /**
     * Initialize pattern library
     */
    initializePatternLibrary() {
        const dims = this.grid.getDimensions();
        this.patternLibrary = new PatternLibrary(dims.rows, dims.cols);
    }
    
    /**
     * Initialize animator
     */
    initializeAnimator() {
        this.animator = new Animator(this.grid, this.patternLibrary);
        this.animator.setFps(30);
        this.animator.setAutoLoop(true);
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Playback controls
        this.elements.playPauseBtn.addEventListener('click', () => {
            this.animator.togglePlayPause();
        });
        
        this.elements.resetBtn.addEventListener('click', () => {
            this.animator.reset();
        });
        
        // Panel toggle
        this.elements.panelToggle.addEventListener('click', () => {
            this.elements.controlPanel.classList.toggle('collapsed');
        });
        
        // FPS slider
        this.elements.fpsSlider.addEventListener('input', (e) => {
            const fps = parseInt(e.target.value);
            this.animator.setFps(fps);
            this.elements.fpsValue.textContent = fps;
        });
        
        // Resolution slider
        this.elements.resolutionSlider.addEventListener('input', (e) => {
            const index = parseInt(e.target.value);
            this.changeResolution(index);
        });
        
        // Pattern buttons
        this.elements.patternButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const pattern = btn.dataset.pattern;
                this.loadPattern(pattern);
                
                // Update active state
                this.elements.patternButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
        
        // Options
        this.elements.smoothTransition.addEventListener('change', (e) => {
            this.grid.setSmoothTransitions(e.target.checked);
        });
        
        this.elements.showStats.addEventListener('change', (e) => {
            const header = document.querySelector('.header');
            if (e.target.checked) {
                header.style.display = 'block';
            } else {
                header.style.display = 'none';
            }
        });
        
        this.elements.autoLoop.addEventListener('change', (e) => {
            this.animator.setAutoLoop(e.target.checked);
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.animator.togglePlayPause();
            } else if (e.code === 'KeyR') {
                this.animator.reset();
            } else if (e.code === 'ArrowRight') {
                this.animator.stepForward();
            } else if (e.code === 'ArrowLeft') {
                this.animator.stepBackward();
            }
        });
    }
    
    /**
     * Setup animator callbacks
     */
    setupAnimatorCallbacks() {
        // Frame change callback
        this.animator.onFrameChange = (frame, total) => {
            this.elements.currentFrame.textContent = `${frame + 1}/${total}`;
        };
        
        // FPS update callback
        this.animator.onFpsUpdate = (fps) => {
            this.elements.currentFps.textContent = fps;
        };
        
        // Play state change callback
        this.animator.onPlayStateChange = (isPlaying) => {
            if (isPlaying) {
                this.elements.playPauseIcon.textContent = '⏸';
                this.elements.playPauseLabel.textContent = 'PAUSE';
            } else {
                this.elements.playPauseIcon.textContent = '▶';
                this.elements.playPauseLabel.textContent = 'PLAY';
            }
        };
    }
    
    /**
     * Load a pattern
     */
    loadPattern(patternName) {
        this.currentPattern = patternName;
        this.animator.loadPattern(patternName);
        
        // Auto-play after loading
        if (!this.animator.getIsPlaying()) {
            this.animator.play();
        }
    }
    
    /**
     * Change grid resolution
     */
    changeResolution(index) {
        const resolutionNames = ['Tiny', 'Low', 'Medium', 'High', 'Ultra'];
        
        // Update grid
        const preset = this.grid.changeResolution(index);
        if (!preset) return;
        
        // Update stats
        this.updateGridStats(preset.rows, preset.cols);
        this.elements.resolutionValue.textContent = resolutionNames[index];
        
        // Reload current pattern
        this.loadPattern(this.currentPattern);
    }
    
    /**
     * Update grid statistics display
     */
    updateGridStats(rows, cols) {
        this.elements.gridSize.textContent = `${rows}×${cols}`;
    }
    
    /**
     * Show loading overlay
     */
    showLoading() {
        this.elements.loadingOverlay.classList.remove('hidden');
    }
    
    /**
     * Hide loading overlay
     */
    hideLoading() {
        this.elements.loadingOverlay.classList.add('hidden');
    }
    
    /**
     * Utility: Delay promise
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize application
const app = new CheckboxScreenApp();
