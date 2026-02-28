/**
 * ThemeManager.js
 * Manages application visual themes (colors, glows, fonts).
 */

export class ThemeManager {
    constructor() {
        this.themes = {
            cosmic: {
                '--bg-color': '#050508',
                '--text-color': '#e0e0e0',
                '--accent-color': '#00f3ff',
                '--accent-glow': 'rgba(0, 243, 255, 0.4)',
                '--panel-bg': 'rgba(10, 10, 15, 0.75)'
            },
            sunset: {
                '--bg-color': '#0f0505',
                '--text-color': '#ffe0e0',
                '--accent-color': '#ffaa00',
                '--accent-glow': 'rgba(255, 170, 0, 0.4)',
                '--panel-bg': 'rgba(20, 10, 10, 0.75)'
            },
            forest: {
                '--bg-color': '#050f05',
                '--text-color': '#e0ffe0',
                '--accent-color': '#00ffaa',
                '--accent-glow': 'rgba(0, 255, 170, 0.4)',
                '--panel-bg': 'rgba(10, 20, 10, 0.75)'
            },
            monochrome: {
                '--bg-color': '#000000',
                '--text-color': '#ffffff',
                '--accent-color': '#ffffff',
                '--accent-glow': 'rgba(255, 255, 255, 0.2)',
                '--panel-bg': 'rgba(20, 20, 20, 0.8)'
            }
        };

        this.currentTheme = 'cosmic';
        this.init();
    }

    init() {
        // Look for a theme selector if it exists, or create one?
        // For now, we exposes a method to switch.
        this.applyTheme(this.currentTheme);
    }

    applyTheme(name) {
        const theme = this.themes[name];
        if (!theme) return;

        const root = document.documentElement;
        for (const [key, value] of Object.entries(theme)) {
            root.style.setProperty(key, value);
        }
        this.currentTheme = name;
    }

    cycle() {
        const keys = Object.keys(this.themes);
        const index = keys.indexOf(this.currentTheme);
        const next = keys[(index + 1) % keys.length];
        this.applyTheme(next);
        return next;
    }
}
