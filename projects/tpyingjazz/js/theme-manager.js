/**
 * typing-jazz/js/theme-manager.js
 * 
 * THEME MANAGEMENT MODULE
 * 
 * Handles switching between different visual aesthetics (Classic, Noir, Neon).
 * Manages CSS variables and persistent user preferences.
 */

export class ThemeManager {
    /**
     * Initializes themes and loads saved preference.
     */
    constructor() {
        /** @type {Object} Defined theme palettes */
        this.themes = {
            classic: {
                name: 'Classic Jazz',
                bg: '#0d0d0f',
                panel: '#1a1a1e',
                accent: '#c5a059',
                text: '#e0e0e0',
                glow: 'rgba(197, 160, 89, 0.3)'
            },
            noir: {
                name: 'Midnight Noir',
                bg: '#050505',
                panel: '#0a0a0a',
                accent: '#ffffff',
                text: '#888888',
                glow: 'rgba(255, 255, 255, 0.1)'
            },
            neon: {
                name: 'Techno Jazz',
                bg: '#000000',
                panel: '#0a001a',
                accent: '#00f2ff',
                text: '#ff00ff',
                glow: 'rgba(0, 242, 255, 0.5)'
            }
        };

        this.currentTheme = 'classic';
        this.init();
    }

    /**
     * Sets up initial styles.
     */
    init() {
        const saved = localStorage.getItem('typingjazz_theme');
        if (saved && this.themes[saved]) {
            this.setTheme(saved);
        } else {
            this.setTheme('classic');
        }
    }

    /**
     * Switches the active theme and updates CSS variables.
     * @param {string} themeKey 
     */
    setTheme(themeKey) {
        if (!this.themes[themeKey]) return;

        this.currentTheme = themeKey;
        const theme = this.themes[themeKey];

        // Update CSS Variables on ROOT
        const root = document.documentElement;
        root.style.setProperty('--bg-color', theme.bg);
        root.style.setProperty('--panel-bg', theme.panel);
        root.style.setProperty('--accent-gold', theme.accent);
        root.style.setProperty('--text-primary', theme.text);
        root.style.setProperty('--accent-gold-glow', theme.glow);

        // Persist
        localStorage.setItem('typingjazz_theme', themeKey);

        console.log(`ThemeManager: Switched to ${theme.name}`);

        /**
         * Dispatch global event for other modules (like visualizer) 
         * to update their internal colors.
         */
        window.dispatchEvent(new CustomEvent('themechanged', { detail: theme }));
    }

    /**
     * Cycles to the next available theme.
     */
    cycle() {
        const keys = Object.keys(this.themes);
        const currentIndex = keys.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % keys.length;
        this.setTheme(keys[nextIndex]);
    }
}
