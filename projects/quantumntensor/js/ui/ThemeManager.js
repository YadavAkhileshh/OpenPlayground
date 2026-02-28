/**
 * js/ui/ThemeManager.js
 * Toggles global css variables depending on the system state.
 * E.g. Superposition Mode (Blue/Pink glowing) vs Measured Mode (Harsh Red/White)
 */

class ThemeManager {
    static init() {
        this.root = document.documentElement;
        this.setSuperpositionMode();
    }

    static setSuperpositionMode() {
        this.root.style.setProperty('--bg-color', '#0a0d14');
        this.root.style.setProperty('--primary-glow', 'rgba(0, 221, 255, 0.4)');
        this.root.style.setProperty('--grid-line', '#1a2233');
        this.root.classList.remove('measured-state');
    }

    static setMeasuredMode() {
        this.root.style.setProperty('--bg-color', '#140a0a');
        this.root.style.setProperty('--primary-glow', 'rgba(255, 51, 102, 0.7)');
        this.root.style.setProperty('--grid-line', '#331a1a');
        this.root.classList.add('measured-state');
    }
}

window.ThemeManager = ThemeManager;
