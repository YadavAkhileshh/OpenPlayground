/**
 * ============================================
 * PulseGradient - Gradient Engine
 * Handles gradient generation, color interpolation, and palette management
 * ============================================
 */

class GradientEngine {
    constructor() {
        // Color palettes with multiple stops for rich gradients
        this.palettes = {
            sunset: {
                name: 'Sunset',
                colors: [
                    { h: 355, s: 85, l: 65 },  // Coral red
                    { h: 40, s: 95, l: 65 },   // Golden yellow
                    { h: 345, s: 80, l: 60 },  // Pink red
                    { h: 25, s: 90, l: 70 }    // Orange
                ]
            },
            ocean: {
                name: 'Ocean',
                colors: [
                    { h: 220, s: 70, l: 35 },  // Deep blue
                    { h: 210, s: 80, l: 55 },  // Sky blue
                    { h: 190, s: 85, l: 50 },  // Cyan
                    { h: 200, s: 75, l: 45 }   // Ocean blue
                ]
            },
            forest: {
                name: 'Forest',
                colors: [
                    { h: 160, s: 85, l: 25 },  // Deep green
                    { h: 150, s: 75, l: 50 },  // Emerald
                    { h: 155, s: 70, l: 60 },  // Light green
                    { h: 165, s: 80, l: 40 }   // Forest green
                ]
            },
            cosmic: {
                name: 'Cosmic',
                colors: [
                    { h: 270, s: 70, l: 45 },  // Deep purple
                    { h: 280, s: 75, l: 65 },  // Violet
                    { h: 330, s: 80, l: 60 },  // Pink
                    { h: 260, s: 65, l: 50 }   // Purple
                ]
            },
            aurora: {
                name: 'Aurora',
                colors: [
                    { h: 195, s: 85, l: 55 },  // Cyan
                    { h: 270, s: 75, l: 65 },  // Purple
                    { h: 330, s: 80, l: 60 },  // Pink
                    { h: 210, s: 70, l: 50 }   // Blue
                ]
            },
            ember: {
                name: 'Ember',
                colors: [
                    { h: 0, s: 80, l: 55 },    // Red
                    { h: 25, s: 95, l: 60 },   // Orange
                    { h: 45, s: 95, l: 65 },   // Yellow
                    { h: 15, s: 85, l: 58 }    // Red-orange
                ]
            }
        };

        // Current state
        this.currentPalette = 'sunset';
        this.currentColors = [...this.palettes.sunset.colors];
        this.targetColors = [...this.palettes.sunset.colors];
        this.transitionProgress = 1; // 0 to 1, 1 means transition complete
        this.transitionDuration = 1200; // milliseconds
        this.lastTransitionTime = 0;

        // Animation state for color shifting
        this.colorShiftAmount = 0;
        this.colorShiftSpeed = 0.0002; // Very slow, subtle shift
    }

    /**
     * Set a new color palette with smooth transition
     * @param {string} paletteName - Name of the palette to transition to
     */
    setPalette(paletteName) {
        if (!this.palettes[paletteName]) {
            console.error(`Palette "${paletteName}" not found`);
            return;
        }

        if (paletteName === this.currentPalette && this.transitionProgress === 1) {
            return; // Already on this palette and transition complete
        }

        // Set current colors as starting point
        this.currentColors = this.getCurrentInterpolatedColors();
        
        // Set target colors
        this.targetColors = [...this.palettes[paletteName].colors];
        
        // Reset transition
        this.transitionProgress = 0;
        this.lastTransitionTime = performance.now();
        this.currentPalette = paletteName;
    }

    /**
     * Update transition progress based on time
     * @param {number} currentTime - Current timestamp from performance.now()
     */
    updateTransition(currentTime) {
        if (this.transitionProgress >= 1) {
            return; // Transition complete
        }

        const elapsed = currentTime - this.lastTransitionTime;
        this.transitionProgress = Math.min(1, elapsed / this.transitionDuration);
    }

    /**
     * Get current interpolated colors based on transition progress
     * @returns {Array} Array of HSL color objects
     */
    getCurrentInterpolatedColors() {
        if (this.transitionProgress >= 1) {
            return this.targetColors;
        }

        // Use easeInOutCubic for smooth transition
        const t = this.easeInOutCubic(this.transitionProgress);

        return this.currentColors.map((currentColor, index) => {
            const targetColor = this.targetColors[index];
            return this.interpolateHSL(currentColor, targetColor, t);
        });
    }

    /**
     * Interpolate between two HSL colors
     * @param {Object} color1 - Starting HSL color {h, s, l}
     * @param {Object} color2 - Ending HSL color {h, s, l}
     * @param {number} t - Interpolation factor (0 to 1)
     * @returns {Object} Interpolated HSL color
     */
    interpolateHSL(color1, color2, t) {
        // Handle hue interpolation (circular)
        let h1 = color1.h;
        let h2 = color2.h;
        let hDiff = h2 - h1;

        // Take shortest path around color wheel
        if (hDiff > 180) {
            h1 += 360;
        } else if (hDiff < -180) {
            h2 += 360;
        }

        const h = (h1 + (h2 - h1) * t) % 360;
        const s = color1.s + (color2.s - color1.s) * t;
        const l = color1.l + (color2.l - color1.l) * t;

        return { h, s, l };
    }

    /**
     * Convert HSL color object to CSS string
     * @param {Object} hsl - HSL color {h, s, l}
     * @returns {string} CSS hsl() string
     */
    hslToString(hsl) {
        return `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;
    }

    /**
     * Generate gradient CSS for a specific layer
     * @param {number} layerIndex - Index of the gradient layer (0, 1, 2)
     * @param {number} animationProgress - Animation progress (0 to 1)
     * @returns {string} CSS gradient string
     */
    generateGradient(layerIndex, animationProgress = 0) {
        const colors = this.getCurrentInterpolatedColors();
        
        // Apply subtle color shift based on animation progress
        const shiftedColors = colors.map(color => {
            const shift = Math.sin(animationProgress * Math.PI * 2 + layerIndex) * 5;
            return {
                h: (color.h + shift + 360) % 360,
                s: color.s,
                l: color.l
            };
        });

        // Different gradient patterns for each layer
        switch (layerIndex) {
            case 0:
                // Radial gradient from center
                return `radial-gradient(circle at 50% 50%, ${
                    this.hslToString(shiftedColors[0])
                }, ${
                    this.hslToString(shiftedColors[1])
                }, ${
                    this.hslToString(shiftedColors[2])
                })`;
            
            case 1:
                // Diagonal gradient
                return `linear-gradient(135deg, ${
                    this.hslToString(shiftedColors[1])
                } 0%, ${
                    this.hslToString(shiftedColors[2])
                } 50%, ${
                    this.hslToString(shiftedColors[3])
                } 100%)`;
            
            case 2:
                // Radial gradient offset
                return `radial-gradient(circle at 30% 70%, ${
                    this.hslToString(shiftedColors[2])
                }, ${
                    this.hslToString(shiftedColors[3])
                }, ${
                    this.hslToString(shiftedColors[0])
                })`;
            
            default:
                return `radial-gradient(circle, ${this.hslToString(shiftedColors[0])}, ${this.hslToString(shiftedColors[1])})`;
        }
    }

    /**
     * Easing function: ease-in-out cubic
     * @param {number} t - Input value (0 to 1)
     * @returns {number} Eased value (0 to 1)
     */
    easeInOutCubic(t) {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    /**
     * Easing function: ease-in-out sine
     * @param {number} t - Input value (0 to 1)
     * @returns {number} Eased value (0 to 1)
     */
    easeInOutSine(t) {
        return -(Math.cos(Math.PI * t) - 1) / 2;
    }

    /**
     * Get all available palette names
     * @returns {Array} Array of palette names
     */
    getPaletteNames() {
        return Object.keys(this.palettes);
    }

    /**
     * Get palette information
     * @param {string} paletteName - Name of the palette
     * @returns {Object} Palette object with name and colors
     */
    getPaletteInfo(paletteName) {
        return this.palettes[paletteName] || null;
    }

    /**
     * Check if transition is in progress
     * @returns {boolean} True if transitioning
     */
    isTransitioning() {
        return this.transitionProgress < 1;
    }

    /**
     * Get current palette name
     * @returns {string} Current palette name
     */
    getCurrentPalette() {
        return this.currentPalette;
    }

    /**
     * Create a custom palette
     * @param {string} name - Name for the custom palette
     * @param {Array} colors - Array of HSL color objects
     */
    createCustomPalette(name, colors) {
        if (colors.length < 2) {
            console.error('Custom palette must have at least 2 colors');
            return;
        }

        this.palettes[name] = {
            name: name,
            colors: colors
        };
    }

    /**
     * Generate random palette
     * @returns {string} Name of the generated palette
     */
    generateRandomPalette() {
        const baseHue = Math.random() * 360;
        const colors = [];

        for (let i = 0; i < 4; i++) {
            colors.push({
                h: (baseHue + i * 30 + Math.random() * 20) % 360,
                s: 70 + Math.random() * 20,
                l: 45 + Math.random() * 20
            });
        }

        const paletteName = `random_${Date.now()}`;
        this.createCustomPalette(paletteName, colors);
        return paletteName;
    }

    /**
     * Apply color shift for subtle animation
     * @param {number} deltaTime - Time elapsed since last frame
     */
    applyColorShift(deltaTime) {
        this.colorShiftAmount += deltaTime * this.colorShiftSpeed;
        this.colorShiftAmount %= 1; // Keep between 0 and 1
    }

    /**
     * Reset gradient engine to initial state
     */
    reset() {
        this.currentPalette = 'sunset';
        this.currentColors = [...this.palettes.sunset.colors];
        this.targetColors = [...this.palettes.sunset.colors];
        this.transitionProgress = 1;
        this.colorShiftAmount = 0;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GradientEngine;
}
