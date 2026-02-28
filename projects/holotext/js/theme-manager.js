/**
 * ThemeManager
 * Handles color palette switching and CSS variable updates.
 */
class ThemeManager {
    constructor() {
        this.themes = {
            cyan: {
                primary: '#00f3ff',
                secondary: '#bc13fe',
                accent: '#ffe600'
            },
            crimson: {
                primary: '#ff0055',
                secondary: '#ffcc00',
                accent: '#00ffff'
            },
            amber: {
                primary: '#ffaa00',
                secondary: '#ff0000',
                accent: '#ffffff'
            },
            matrix: {
                primary: '#00ff00',
                secondary: '#003300',
                accent: '#ccffcc'
            }
        };

        this.currentTheme = 'cyan';
    }

    init() {
        // Expose to global state if needed, or just listen for events
        window.addEventListener('keydown', (e) => {
            if (e.key === '1') this.setTheme('cyan');
            if (e.key === '2') this.setTheme('crimson');
            if (e.key === '3') this.setTheme('amber');
            if (e.key === '4') this.setTheme('matrix');
        });
    }

    setTheme(name) {
        if (!this.themes[name]) return;

        this.currentTheme = name;
        const theme = this.themes[name];
        const root = document.documentElement;

        root.style.setProperty('--color-primary', theme.primary);
        root.style.setProperty('--color-secondary', theme.secondary);
        root.style.setProperty('--color-accent', theme.accent);

        root.style.setProperty('--holo-color-1', theme.primary);
        root.style.setProperty('--holo-color-2', theme.secondary);

        // derived dim colors
        root.style.setProperty('--color-primary-dim', this.hexToRgba(theme.primary, 0.1));

        console.log(`Theme set to: ${name}`);
    }

    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
}
