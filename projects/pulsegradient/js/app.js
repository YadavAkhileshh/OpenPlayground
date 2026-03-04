/**
 * ============================================
 * PulseGradient - Main Application
 * Orchestrates all modules and initializes the application
 * ============================================
 */

// Application state
const PulseGradientApp = {
    // Module instances
    gradientEngine: null,
    animationController: null,
    uiController: null,

    // DOM elements
    gradientLayers: [],

    // Application state
    isInitialized: false,
    debugMode: false,

    /**
     * Initialize the application
     */
    init() {
        console.log('🎨 PulseGradient - Initializing...');

        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setup());
            } else {
                this.setup();
            }
        } catch (error) {
            this.handleError('Initialization failed', error);
        }
    },

    /**
     * Setup application after DOM is ready
     */
    setup() {
        try {
            // Cache gradient layer elements
            this.cacheElements();

            // Initialize modules in correct order
            this.initializeModules();

            // Connect modules
            this.connectModules();

            // Initialize UI
            this.initializeUI();

            // Start animation
            this.startAnimation();

            // Setup debug mode if needed
            this.setupDebugMode();

            // Mark as initialized
            this.isInitialized = true;

            console.log('✅ PulseGradient - Ready!');

            // Log initial state
            this.logState();

        } catch (error) {
            this.handleError('Setup failed', error);
        }
    },

    /**
     * Cache DOM element references
     */
    cacheElements() {
        // Get gradient layers
        this.gradientLayers = [
            document.getElementById('gradientLayer1'),
            document.getElementById('gradientLayer2'),
            document.getElementById('gradientLayer3')
        ];

        // Verify all layers exist
        if (this.gradientLayers.some(layer => !layer)) {
            throw new Error('Failed to find all gradient layers');
        }

        console.log('📦 Cached DOM elements');
    },

    /**
     * Initialize all modules
     */
    initializeModules() {
        // Create gradient engine
        this.gradientEngine = new GradientEngine();
        console.log('🎨 Gradient Engine initialized');

        // Create animation controller
        this.animationController = new AnimationController(this.gradientEngine);
        console.log('⏱️  Animation Controller initialized');

        // Create UI controller
        this.uiController = new UIController(this.animationController, this.gradientEngine);
        console.log('🎮 UI Controller initialized');
    },

    /**
     * Connect modules together
     */
    connectModules() {
        // Connect animation controller to gradient layers
        this.animationController.setLayers(this.gradientLayers);
        console.log('🔗 Modules connected');
    },

    /**
     * Initialize UI
     */
    initializeUI() {
        this.uiController.init();
        console.log('🖼️  UI initialized');
    },

    /**
     * Start the animation
     */
    startAnimation() {
        this.animationController.start();
        console.log('▶️  Animation started');
    },

    /**
     * Setup debug mode
     */
    setupDebugMode() {
        // Check for debug parameter in URL
        const urlParams = new URLSearchParams(window.location.search);
        this.debugMode = urlParams.has('debug');

        if (this.debugMode) {
            console.log('🐛 Debug mode enabled');
            this.enableDebugMode();
        }

        // Add global debug toggle (Ctrl+Shift+D)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.code === 'KeyD') {
                this.toggleDebugMode();
            }
        });
    },

    /**
     * Enable debug mode
     */
    enableDebugMode() {
        this.debugMode = true;

        // Add debug info overlay
        this.createDebugOverlay();

        // Start debug update loop
        this.updateDebugInfo();

        console.log('🐛 Debug mode activated');
    },

    /**
     * Disable debug mode
     */
    disableDebugMode() {
        this.debugMode = false;

        // Remove debug overlay
        const overlay = document.getElementById('debugOverlay');
        if (overlay) {
            overlay.remove();
        }

        console.log('🐛 Debug mode deactivated');
    },

    /**
     * Toggle debug mode
     */
    toggleDebugMode() {
        if (this.debugMode) {
            this.disableDebugMode();
        } else {
            this.enableDebugMode();
        }
    },

    /**
     * Create debug info overlay
     */
    createDebugOverlay() {
        // Remove existing overlay if present
        const existing = document.getElementById('debugOverlay');
        if (existing) {
            existing.remove();
        }

        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'debugOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: #0f0;
            font-family: monospace;
            font-size: 12px;
            padding: 10px;
            border-radius: 5px;
            z-index: 10000;
            pointer-events: none;
            line-height: 1.5;
        `;

        document.body.appendChild(overlay);
    },

    /**
     * Update debug info display
     */
    updateDebugInfo() {
        if (!this.debugMode) return;

        const overlay = document.getElementById('debugOverlay');
        if (!overlay) return;

        const state = this.uiController.getState();
        const fps = this.animationController.getFPS();
        const isTransitioning = this.gradientEngine.isTransitioning();

        overlay.innerHTML = `
            <strong>PulseGradient Debug</strong><br>
            FPS: ${fps}<br>
            BPM: ${state.bpm}<br>
            Intensity: ${state.intensity}%<br>
            Palette: ${state.palette}<br>
            Playing: ${state.isPlaying ? 'Yes' : 'No'}<br>
            Transitioning: ${isTransitioning ? 'Yes' : 'No'}
        `;

        // Continue updating
        requestAnimationFrame(() => this.updateDebugInfo());
    },

    /**
     * Log current application state
     */
    logState() {
        if (!this.debugMode) return;

        const state = this.uiController.getState();
        console.log('📊 Current State:', state);
    },

    /**
     * Handle errors gracefully
     * @param {string} message - Error message
     * @param {Error} error - Error object
     */
    handleError(message, error) {
        console.error(`❌ ${message}:`, error);

        // Show user-friendly error message
        this.showErrorMessage(message);
    },

    /**
     * Show error message to user
     * @param {string} message - Error message to display
     */
    showErrorMessage(message) {
        // Create error overlay
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(220, 38, 38, 0.95);
            color: white;
            padding: 20px 30px;
            border-radius: 10px;
            font-family: sans-serif;
            font-size: 16px;
            z-index: 10000;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
        `;
        errorDiv.textContent = `Error: ${message}. Please refresh the page.`;

        document.body.appendChild(errorDiv);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    },

    /**
     * Reset application to initial state
     */
    reset() {
        console.log('🔄 Resetting application...');

        try {
            this.uiController.reset();
            console.log('✅ Application reset complete');
        } catch (error) {
            this.handleError('Reset failed', error);
        }
    },

    /**
     * Pause animation
     */
    pause() {
        this.animationController.pause();
        this.uiController.updatePlayPauseButton(false);
    },

    /**
     * Resume animation
     */
    resume() {
        this.animationController.start();
        this.uiController.updatePlayPauseButton(true);
    },

    /**
     * Get application info
     * @returns {Object} Application information
     */
    getInfo() {
        return {
            name: 'PulseGradient',
            version: '1.0.0',
            initialized: this.isInitialized,
            debugMode: this.debugMode,
            state: this.isInitialized ? this.uiController.getState() : null
        };
    }
};

// Auto-initialize when script loads
PulseGradientApp.init();

// Expose to window for debugging
window.PulseGradient = PulseGradientApp;

// Add visibility change handler to pause when tab is hidden
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Optionally pause when tab is hidden to save resources
        // Uncomment if desired:
        // PulseGradientApp.pause();
    } else {
        // Resume when tab becomes visible
        // Uncomment if desired:
        // PulseGradientApp.resume();
    }
});

// Log welcome message
console.log(`
╔═══════════════════════════════════════╗
║                                       ║
║         🎨 PulseGradient 1.0         ║
║                                       ║
║   A breathing visual experience      ║
║                                       ║
╚═══════════════════════════════════════╝

Keyboard Shortcuts:
  Space       - Play/Pause
  ↑/↓         - Adjust BPM
  1-6         - Select Palette
  Ctrl+Shift+D - Toggle Debug Mode

`);
