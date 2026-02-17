/**
 * ================================================
 * Main.js - Application Controller
 * ================================================
 * 
 * Orchestrates the entire DivPrinter application:
 * - Initializes renderer and animator
 * - Manages UI event handlers
 * - Coordinates rendering pipeline
 * - Updates statistics display
 * - Handles user interactions
 */

class DivPrinter {
    constructor() {
        // Core components
        this.renderer = null;
        this.animator = null;
        
        // UI elements
        this.elements = {};
        
        // Application state
        this.state = {
            text: 'HELLO',
            fontSize: 3,
            density: 100,
            letterSpacing: 2,
            animationMode: 'buildIn',
            colorMode: 'solid',
            primaryColor: '#00ff88',
            secondaryColor: '#ff0088',
            animationSpeed: 50,
            isRendering: false
        };
    }

    /**
     * Initialize the application
     */
    init() {
        this.cacheElements();
        this.initializeRenderer();
        this.initializeAnimator();
        this.attachEventListeners();
        this.updateAllDisplays();
        
        // Initial render
        this.renderText();
    }

    /**
     * Cache DOM elements for performance
     */
    cacheElements() {
        this.elements = {
            // Canvas
            canvas: document.getElementById('canvas'),
            
            // Input controls
            textInput: document.getElementById('textInput'),
            fontSize: document.getElementById('fontSize'),
            density: document.getElementById('density'),
            letterSpacing: document.getElementById('letterSpacing'),
            animationMode: document.getElementById('animationMode'),
            colorMode: document.getElementById('colorMode'),
            primaryColor: document.getElementById('primaryColor'),
            secondaryColor: document.getElementById('secondaryColor'),
            animationSpeed: document.getElementById('animationSpeed'),
            
            // Buttons
            renderBtn: document.getElementById('renderBtn'),
            clearBtn: document.getElementById('clearBtn'),
            randomizeBtn: document.getElementById('randomizeBtn'),
            
            // Display elements
            fontSizeValue: document.getElementById('fontSizeValue'),
            densityValue: document.getElementById('densityValue'),
            letterSpacingValue: document.getElementById('letterSpacingValue'),
            animationSpeedValue: document.getElementById('animationSpeedValue'),
            divCount: document.getElementById('divCount'),
            renderTime: document.getElementById('renderTime'),
            charCount: document.getElementById('charCount')
        };
    }

    /**
     * Initialize the text renderer
     */
    initializeRenderer() {
        this.renderer = new TextRenderer(this.elements.canvas);
    }

    /**
     * Initialize the animator
     */
    initializeAnimator() {
        this.animator = new Animator(this.renderer);
        this.animator.setSpeed(this.state.animationSpeed);
    }

    /**
     * Attach all event listeners
     */
    attachEventListeners() {
        // Text input - render on Enter key
        this.elements.textInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.renderText();
            }
        });

        this.elements.textInput.addEventListener('input', (e) => {
            this.state.text = e.target.value;
        });

        // Render button
        this.elements.renderBtn.addEventListener('click', () => {
            this.renderText();
        });

        // Clear button
        this.elements.clearBtn.addEventListener('click', () => {
            this.clearCanvas();
        });

        // Randomize button
        this.elements.randomizeBtn.addEventListener('click', () => {
            this.randomizeColors();
        });

        // Font size slider
        this.elements.fontSize.addEventListener('input', (e) => {
            this.state.fontSize = parseInt(e.target.value);
            this.updateDisplay('fontSizeValue', this.state.fontSize);
        });

        // Density slider
        this.elements.density.addEventListener('input', (e) => {
            this.state.density = parseInt(e.target.value);
            this.updateDisplay('densityValue', `${this.state.density}%`);
        });

        // Letter spacing slider
        this.elements.letterSpacing.addEventListener('input', (e) => {
            this.state.letterSpacing = parseInt(e.target.value);
            this.updateDisplay('letterSpacingValue', this.state.letterSpacing);
        });

        // Animation speed slider
        this.elements.animationSpeed.addEventListener('input', (e) => {
            this.state.animationSpeed = parseInt(e.target.value);
            this.updateDisplay('animationSpeedValue', this.state.animationSpeed);
            this.animator.setSpeed(this.state.animationSpeed);
        });

        // Animation mode select
        this.elements.animationMode.addEventListener('change', (e) => {
            this.state.animationMode = e.target.value;
        });

        // Color mode select
        this.elements.colorMode.addEventListener('change', (e) => {
            this.state.colorMode = e.target.value;
            this.updatePixelColors();
            this.handleColorModeChange(e.target.value);
        });

        // Primary color picker
        this.elements.primaryColor.addEventListener('input', (e) => {
            this.state.primaryColor = e.target.value;
            this.updatePixelColors();
        });

        // Secondary color picker
        this.elements.secondaryColor.addEventListener('input', (e) => {
            this.state.secondaryColor = e.target.value;
            this.updatePixelColors();
        });
    }

    /**
     * Main render function
     */
    async renderText() {
        if (this.state.isRendering) {
            return;
        }

        const text = this.elements.textInput.value.trim();
        
        if (text.length === 0) {
            this.showMessage('Please enter some text');
            return;
        }

        this.state.isRendering = true;
        this.state.text = text;
        this.setButtonState(this.elements.renderBtn, true);

        try {
            // Render pixels
            const settings = {
                fontSize: this.state.fontSize,
                density: this.state.density,
                letterSpacing: this.state.letterSpacing,
                primaryColor: this.state.primaryColor,
                secondaryColor: this.state.secondaryColor,
                colorMode: this.state.colorMode
            };

            const stats = this.renderer.render(text, settings);
            
            // Animate pixels
            await this.animator.animate(
                this.renderer.pixels,
                this.state.animationMode
            );

            // Update stats display
            this.updateStats(stats);

            // Handle pulse mode
            if (this.state.colorMode === 'pulse') {
                this.renderer.applyPulseAnimation();
            }

        } catch (error) {
            console.error('Rendering error:', error);
            this.showMessage('An error occurred during rendering');
        } finally {
            this.state.isRendering = false;
            this.setButtonState(this.elements.renderBtn, false);
        }
    }

    /**
     * Clear the canvas with animation
     */
    async clearCanvas() {
        if (this.renderer.pixels.length === 0) {
            return;
        }

        this.setButtonState(this.elements.clearBtn, true);

        try {
            await this.animator.fadeOut(this.renderer.pixels);
            this.renderer.clearCanvas();
            this.updateStats({ pixelCount: 0, renderTime: 0, charCount: 0 });
        } finally {
            this.setButtonState(this.elements.clearBtn, false);
        }
    }

    /**
     * Update pixel colors without re-rendering
     */
    updatePixelColors() {
        if (this.renderer.pixels.length === 0) {
            return;
        }

        const settings = {
            primaryColor: this.state.primaryColor,
            secondaryColor: this.state.secondaryColor,
            colorMode: this.state.colorMode
        };

        this.renderer.updateSettings(settings);
        this.renderer.updateColors(this.state.colorMode);
    }

    /**
     * Handle color mode changes
     * @param {string} mode - Color mode
     */
    handleColorModeChange(mode) {
        if (mode === 'pulse') {
            this.renderer.applyPulseAnimation();
        } else {
            this.renderer.removePulseAnimation();
        }
    }

    /**
     * Randomize color selection
     */
    randomizeColors() {
        const randomColor = () => {
            const hue = Math.floor(Math.random() * 360);
            return this.hslToHex(hue, 100, 50);
        };

        this.state.primaryColor = randomColor();
        this.state.secondaryColor = randomColor();

        this.elements.primaryColor.value = this.state.primaryColor;
        this.elements.secondaryColor.value = this.state.secondaryColor;

        this.updatePixelColors();
    }

    /**
     * Convert HSL to Hex color
     * @param {number} h - Hue (0-360)
     * @param {number} s - Saturation (0-100)
     * @param {number} l - Lightness (0-100)
     * @returns {string} Hex color
     */
    hslToHex(h, s, l) {
        s /= 100;
        l /= 100;

        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c / 2;
        
        let r = 0, g = 0, b = 0;

        if (0 <= h && h < 60) {
            r = c; g = x; b = 0;
        } else if (60 <= h && h < 120) {
            r = x; g = c; b = 0;
        } else if (120 <= h && h < 180) {
            r = 0; g = c; b = x;
        } else if (180 <= h && h < 240) {
            r = 0; g = x; b = c;
        } else if (240 <= h && h < 300) {
            r = x; g = 0; b = c;
        } else if (300 <= h && h < 360) {
            r = c; g = 0; b = x;
        }

        const toHex = (val) => {
            const hex = Math.round((val + m) * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };

        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    /**
     * Update statistics display
     * @param {Object} stats - Rendering statistics
     */
    updateStats(stats) {
        this.updateDisplay('divCount', stats.pixelCount.toLocaleString());
        this.updateDisplay('renderTime', `${stats.renderTime}ms`);
        this.updateDisplay('charCount', stats.charCount);
    }

    /**
     * Update a specific display element
     * @param {string} elementKey - Element key in this.elements
     * @param {string|number} value - Value to display
     */
    updateDisplay(elementKey, value) {
        if (this.elements[elementKey]) {
            this.elements[elementKey].textContent = value;
        }
    }

    /**
     * Update all value displays
     */
    updateAllDisplays() {
        this.updateDisplay('fontSizeValue', this.state.fontSize);
        this.updateDisplay('densityValue', `${this.state.density}%`);
        this.updateDisplay('letterSpacingValue', this.state.letterSpacing);
        this.updateDisplay('animationSpeedValue', this.state.animationSpeed);
    }

    /**
     * Set button disabled state
     * @param {HTMLElement} button - Button element
     * @param {boolean} disabled - Disabled state
     */
    setButtonState(button, disabled) {
        if (disabled) {
            button.classList.add('disabled');
            button.disabled = true;
        } else {
            button.classList.remove('disabled');
            button.disabled = false;
        }
    }

    /**
     * Show a temporary message (console for now)
     * @param {string} message - Message to show
     */
    showMessage(message) {
        console.log(message);
    }

    /**
     * Get current application state
     * @returns {Object} Current state
     */
    getState() {
        return { ...this.state };
    }

    /**
     * Export current rendering
     * @returns {Object} Export data
     */
    exportRendering() {
        return {
            text: this.state.text,
            settings: this.getState(),
            renderData: this.renderer.exportData(),
            timestamp: new Date().toISOString()
        };
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new DivPrinter();
    app.init();
    
    // Make app globally accessible for debugging
    window.divPrinter = app;
    
    console.log('%c DivPrinter v1.0 ', 'background: #00ff88; color: #0a0e27; font-weight: bold; padding: 5px 10px;');
    console.log('Rendering text with thousands of divs...');
    console.log('Access the app instance via: window.divPrinter');
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl+Enter or Cmd+Enter to render
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (window.divPrinter) {
            window.divPrinter.renderText();
        }
    }
    
    // Escape to clear
    if (e.key === 'Escape') {
        if (window.divPrinter) {
            window.divPrinter.clearCanvas();
        }
    }
});
