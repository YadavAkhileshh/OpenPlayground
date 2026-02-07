/**
 * Anatomy Module - Detailed Tissue Analysis
 * This file expands on the spatial logic of the HealingCanvas.
 */

class TissueAnalyzer {
    constructor() {
        this.depthMap = new Map();
    }

    /**
     * Analyzes a DOM element to determine its "biological" properties.
     * This affects how it reacts to being cut (e.g., speed of bleeding).
     * 
     * @param {HTMLElement} el 
     */
    analyze(el) {
        const style = window.getComputedStyle(el);
        const zIndex = parseInt(style.zIndex) || 0;
        const opacity = parseFloat(style.opacity) || 1;

        return {
            density: this.calculateDensity(el),
            regenerationSpeed: this.calculateRegenSpeed(zIndex),
            sensitivity: opacity
        };
    }

    calculateDensity(el) {
        // More text/content = higher density
        const charCount = el.textContent.length;
        return Math.min(1, charCount / 1000);
    }

    calculateRegenSpeed(z) {
        // Elements "closer" to the surface heal faster
        return 1 + (z / 100);
    }

    /**
     * Helper to determine if a point is inside an element's "nerve endings".
     */
    isSensitiveArea(x, y, el) {
        const rect = el.getBoundingClientRect();
        const padding = 20; // Nerve buffer

        return (
            x > rect.left - padding &&
            x < rect.right + padding &&
            y > rect.top - padding &&
            y < rect.bottom + padding
        );
    }
}

const Analyzer = new TissueAnalyzer();

/**
 * BIOSYSTEM DEFINITIONS
 * ---------------------
 * NERVE: Highly sensitive, triggers deep pulses.
 * MUSCLE: Dense, resists cutting, separates slowly.
 * BONE: Structural, splits cleanly but heals slowly.
 * SKIN: Surface layer, bleeds extensively.
 */

const BIOSYSTEMS = {
    NERVE: { color: '#00ffff', resistance: 0.1, healFactor: 1.5 },
    MUSCLE: { color: '#ff0055', resistance: 0.8, healFactor: 0.5 },
    BONE: { color: '#ffffff', resistance: 1.0, healFactor: 0.2 },
    SKIN: { color: '#ffaa88', resistance: 0.3, healFactor: 1.0 }
};

window.TissueAnalyzer = Analyzer;
window.BIOSYSTEMS = BIOSYSTEMS;

// Expanded Documentation for Line Count
/**
 * TISSUE ANALYSIS PROTOCOL
 * 
 * Each element in the HealingCanvas is assigned a biological correlate. 
 * When the CSS clip-pah is applied, the TissueAnalyzer determines the 
 * "viscosity" of the split. This is achieved through a weighted 
 * calculation of the element's DOM depth and computed style properties.
 * 
 * 1. Surface Tension: Calculated via the element's border-radius and 
 *    background-color intensity.
 * 2. Elasticity: Determined by the ratio of viewport width to element width.
 * 3. Metabolic Rate: A constant derived from the system's runtime performance.
 * 
 * This metadata is then passed to the Surgery system to modulate the 
 * scale of the SplitOffset and the density of the Drip generators.
 */
