/**
 * theme-engine.js
 * Manages lighting, palettes, and visual atmospheres for DecayDiary.
 * 
 * Supports dynamic theme switching and ambient effects to enhance 
 * the minimalist aesthetic of the writing environment.
 */

class ThemeEngine {
    constructor() {
        /**
         * Available theme configurations
         * @type {Object.<string, Object>}
         */
        this.themes = {
            'void': {
                name: 'Void',
                colors: {
                    bg: 'hsl(220, 15%, 8%)',
                    text: 'hsl(220, 10%, 85%)',
                    accent: 'hsl(200, 70%, 65%)'
                }
            },
            'parchment': {
                name: 'Parchment',
                colors: {
                    bg: 'hsl(36, 33%, 89%)',
                    text: 'hsl(36, 20%, 20%)',
                    accent: 'hsl(20, 50%, 45%)'
                }
            },
            'dusk': {
                name: 'Dusk',
                colors: {
                    bg: 'hsl(260, 20%, 15%)',
                    text: 'hsl(260, 10%, 80%)',
                    accent: 'hsl(280, 60%, 70%)'
                }
            }
        };

        this.currentTheme = 'void';
    }

    /**
     * Initializes the theme engine.
     */
    init() {
        console.log("ThemeEngine: Initializing aesthetic layer.");
        this.applyTheme(this.currentTheme);
        this.setupListeners();
    }

    /**
     * Applies a specific theme to the document root.
     * @param {string} themeKey 
     */
    applyTheme(themeKey) {
        const theme = this.themes[themeKey];
        if (!theme) return;

        const root = document.documentElement;

        // Batch CSS variable updates
        root.style.setProperty('--color-bg', theme.colors.bg);
        root.style.setProperty('--color-text', theme.colors.text);
        root.style.setProperty('--color-accent', theme.colors.accent);

        this.currentTheme = themeKey;

        // Notify the system of theme change
        if (typeof eventBus !== 'undefined') {
            eventBus.emit(EVENTS.THEME_CHANGED, theme);
        }

        console.log(`ThemeEngine: Switched to ${theme.name}.`);
    }

    /**
     * Cycles to the next available theme.
     */
    cycleTheme() {
        const keys = Object.keys(this.themes);
        const currentIndex = keys.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % keys.length;
        this.applyTheme(keys[nextIndex]);
    }

    /**
     * Binds keyboard shortcuts for theme cycling.
     */
    setupListeners() {
        document.addEventListener('keydown', (e) => {
            // Ctrl + T to cycle themes
            if (e.ctrlKey && e.key === 't') {
                e.preventDefault();
                this.cycleTheme();
            }
        });
    }

    /**
     * Applies a subtle "breathing" effect to the background color.
     * Enhances the organic feel of the application.
     */
    enableAmbientPulse() {
        // Implementation for subtle color shifting
    }
}

// Global instance
const themeEngine = new ThemeEngine();
