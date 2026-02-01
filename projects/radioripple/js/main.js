/**
 * ============================================
 * RadioRipple - Main Application Coordinator
 * ============================================
 * 
 * Initializes and coordinates all modules, manages application
 * lifecycle, and provides the main entry point.
 */

class RadioRippleApp {
    constructor() {
        this.gridManager = null;
        this.rippleEngine = null;
        this.controlsManager = null;
        this.isInitialized = false;
    }

    /**
     * Initialize the application
     */
    async init() {
        if (this.isInitialized) {
            console.warn('Application already initialized');
            return;
        }

        try {
            console.log('🌊 Initializing RadioRipple...');
            
            // Initialize grid manager
            const gridContainer = document.getElementById('radioGrid');
            if (!gridContainer) {
                throw new Error('Grid container not found');
            }
            
            this.gridManager = new GridManager(gridContainer);
            
            // Initialize ripple engine
            this.rippleEngine = new RippleEngine(this.gridManager);
            
            // Initialize controls manager
            this.controlsManager = new ControlsManager(
                this.rippleEngine, 
                this.gridManager
            );
            
            // Generate initial grid
            const initialSize = 20;
            await this.gridManager.generateGrid(initialSize);
            
            // Set up grid interaction
            this._setupGridInteraction();
            
            // Set up keyboard shortcuts
            this._setupKeyboardShortcuts();
            
            // Set up global event listeners
            this._setupGlobalEventListeners();
            
            // Mark as initialized
            this.isInitialized = true;
            
            console.log('✅ RadioRipple initialized successfully');
            
            // Show welcome message
            this._showWelcomeMessage();
            
        } catch (error) {
            console.error('❌ Failed to initialize RadioRipple:', error);
            this._showErrorMessage(error.message);
        }
    }

    /**
     * Set up grid interaction (clicking cells)
     * @private
     */
    _setupGridInteraction() {
        this.gridManager.onCellClick((cell, event) => {
            // Prevent default radio behavior
            event.preventDefault();
            
            // Trigger ripple wave from clicked cell
            this.rippleEngine.triggerWave(cell);
        });
    }

    /**
     * Set up keyboard shortcuts
     * @private
     */
    _setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Ignore if typing in input
            if (event.target.tagName === 'INPUT') {
                return;
            }
            
            switch (event.key.toLowerCase()) {
                case 'r':
                    // Reset grid
                    if (event.ctrlKey || event.metaKey) {
                        event.preventDefault();
                        this._handleReset();
                    } else {
                        // Random wave
                        this.rippleEngine.triggerRandomWave();
                    }
                    break;
                
                case 'c':
                    // Clear all
                    if (!event.ctrlKey && !event.metaKey) {
                        this.gridManager.clearAllStates();
                    }
                    break;
                
                case ' ':
                    // Spacebar: Random wave
                    event.preventDefault();
                    this.rippleEngine.triggerRandomWave();
                    break;
                
                case 'escape':
                    // Stop all waves
                    this.rippleEngine.stopAllWaves();
                    break;
                
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                    // Number keys: Select algorithm
                    this._selectAlgorithmByNumber(parseInt(event.key));
                    break;
                
                case 'p':
                    // Pattern: Center
                    this.rippleEngine.createPattern('center');
                    break;
                
                case 'arrowup':
                    // Increase speed
                    this._adjustSpeed(10);
                    break;
                
                case 'arrowdown':
                    // Decrease speed
                    this._adjustSpeed(-10);
                    break;
                
                case 'arrowright':
                    // Increase radius
                    this._adjustRadius(1);
                    break;
                
                case 'arrowleft':
                    // Decrease radius
                    this._adjustRadius(-1);
                    break;
            }
        });
    }

    /**
     * Set up global event listeners
     * @private
     */
    _setupGlobalEventListeners() {
        // Listen for wave events
        document.addEventListener('waveStarted', (event) => {
            console.log('Wave started:', event.detail);
        });
        
        document.addEventListener('waveCompleted', (event) => {
            console.log('Wave completed:', event.detail);
        });
        
        // Listen for grid events
        document.addEventListener('gridReady', (event) => {
            console.log('Grid ready:', event.detail);
        });
        
        // Handle window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this._handleResize();
            }, 250);
        });
        
        // Handle visibility change (pause when tab is hidden)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this._handleTabHidden();
            } else {
                this._handleTabVisible();
            }
        });
    }

    /**
     * Handle application reset
     * @private
     */
    async _handleReset() {
        if (!this.isInitialized) return;
        
        this.rippleEngine.stopAllWaves();
        await this.gridManager.reset();
    }

    /**
     * Select algorithm by number key
     * @private
     */
    _selectAlgorithmByNumber(number) {
        const algorithms = ['circular', 'diamond', 'cross', 'random', 'spiral'];
        const index = number - 1;
        
        if (index >= 0 && index < algorithms.length) {
            const algorithm = algorithms[index];
            const radio = document.querySelector(
                `input[name="algorithm"][value="${algorithm}"]`
            );
            
            if (radio) {
                radio.checked = true;
                this.rippleEngine.updateConfig({ algorithm: algorithm });
                console.log(`Algorithm changed to: ${algorithm}`);
            }
        }
    }

    /**
     * Adjust ripple speed
     * @private
     */
    _adjustSpeed(delta) {
        const slider = document.getElementById('rippleSpeedSlider');
        if (!slider) return;
        
        const currentValue = parseInt(slider.value);
        const newValue = Math.max(
            parseInt(slider.min),
            Math.min(parseInt(slider.max), currentValue + delta)
        );
        
        slider.value = newValue;
        slider.dispatchEvent(new Event('input'));
    }

    /**
     * Adjust wave radius
     * @private
     */
    _adjustRadius(delta) {
        const slider = document.getElementById('waveRadiusSlider');
        if (!slider) return;
        
        const currentValue = parseInt(slider.value);
        const newValue = Math.max(
            parseInt(slider.min),
            Math.min(parseInt(slider.max), currentValue + delta)
        );
        
        slider.value = newValue;
        slider.dispatchEvent(new Event('input'));
    }

    /**
     * Handle window resize
     * @private
     */
    _handleResize() {
        // Could adjust grid size or layout based on viewport
        console.log('Window resized');
    }

    /**
     * Handle tab becoming hidden
     * @private
     */
    _handleTabHidden() {
        // Pause animations when tab is hidden to save resources
        console.log('Tab hidden - pausing animations');
    }

    /**
     * Handle tab becoming visible
     * @private
     */
    _handleTabVisible() {
        // Resume animations when tab is visible
        console.log('Tab visible - resuming animations');
    }

    /**
     * Show welcome message
     * @private
     */
    _showWelcomeMessage() {
        console.log(`
╔════════════════════════════════════════════╗
║         Welcome to RadioRipple! 🌊         ║
╠════════════════════════════════════════════╣
║ Click any cell to create mesmerizing waves ║
║                                            ║
║ Keyboard Shortcuts:                        ║
║  R - Random wave                           ║
║  C - Clear all                             ║
║  Space - Random wave                       ║
║  Esc - Stop all waves                      ║
║  1-5 - Select algorithm                    ║
║  P - Center pattern                        ║
║  ↑/↓ - Adjust speed                        ║
║  ←/→ - Adjust radius                       ║
╚════════════════════════════════════════════╝
        `);
    }

    /**
     * Show error message
     * @private
     */
    _showErrorMessage(message) {
        const errorHtml = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #ef4444;
                color: white;
                padding: 2rem;
                border-radius: 12px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.5);
                z-index: 9999;
                max-width: 500px;
                text-align: center;
            ">
                <h2 style="margin-bottom: 1rem;">Error</h2>
                <p>${message}</p>
                <button onclick="this.parentElement.remove()" style="
                    margin-top: 1rem;
                    padding: 0.5rem 1rem;
                    background: white;
                    color: #ef4444;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                ">Close</button>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', errorHtml);
    }

    /**
     * Get application state
     * @returns {Object} Current application state
     */
    getState() {
        if (!this.isInitialized) {
            return { initialized: false };
        }
        
        return {
            initialized: true,
            gridStats: this.gridManager.getStats(),
            rippleStats: this.rippleEngine.getStats(),
            settings: this.controlsManager.getCurrentSettings()
        };
    }

    /**
     * Export application state as JSON
     * @returns {string} JSON representation of state
     */
    exportState() {
        const state = this.getState();
        return JSON.stringify(state, null, 2);
    }

    /**
     * Import and apply application state
     * @param {string|Object} stateData - State to import
     */
    importState(stateData) {
        try {
            const state = typeof stateData === 'string' 
                ? JSON.parse(stateData) 
                : stateData;
            
            if (state.settings) {
                this.controlsManager.applySettings(state.settings);
            }
            
            console.log('State imported successfully');
        } catch (error) {
            console.error('Failed to import state:', error);
        }
    }

    /**
     * Clean up and destroy application
     */
    destroy() {
        if (!this.isInitialized) return;
        
        console.log('Destroying RadioRipple...');
        
        // Stop all waves
        if (this.rippleEngine) {
            this.rippleEngine.stopAllWaves();
            this.rippleEngine.destroy();
        }
        
        // Destroy controls
        if (this.controlsManager) {
            this.controlsManager.destroy();
        }
        
        // Destroy grid
        if (this.gridManager) {
            this.gridManager.destroy();
        }
        
        this.isInitialized = false;
        console.log('RadioRipple destroyed');
    }
}

// ============================================
// Application Entry Point
// ============================================

// Create global app instance
let radioRippleApp = null;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

/**
 * Initialize the application
 */
async function initializeApp() {
    try {
        radioRippleApp = new RadioRippleApp();
        await radioRippleApp.init();
        
        // Expose app to window for debugging
        window.radioRippleApp = radioRippleApp;
        
        // Add convenient debug functions
        window.debugRipple = {
            getState: () => radioRippleApp.getState(),
            exportState: () => radioRippleApp.exportState(),
            importState: (state) => radioRippleApp.importState(state),
            triggerPattern: (pattern) => radioRippleApp.rippleEngine.createPattern(pattern),
            reset: () => radioRippleApp._handleReset(),
            clear: () => radioRippleApp.gridManager.clearAllStates()
        };
        
        console.log('💡 Debug functions available via window.debugRipple');
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
    }
}

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (radioRippleApp) {
        radioRippleApp.destroy();
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RadioRippleApp;
}
