/**
 * themes.js
 * Color palettes for the application.
 */

const Themes = {
    cyberpunk: {
        name: "Cyberpunk",
        alive: '#00ffcc',
        dead: '#0a0a0e',
        trail: 'rgba(10, 10, 14, 0.4)',
        grid: '#1a1a20'
    },
    matrix: {
        name: "Matrix",
        alive: '#00ff00',
        dead: '#000000',
        trail: 'rgba(0, 20, 0, 0.3)',
        grid: '#003300'
    },
    sunset: {
        name: "Sunset",
        alive: '#ff4d4d',
        dead: '#2b1b1b',
        trail: 'rgba(43, 27, 27, 0.4)',
        grid: '#442222'
    },
    ocean: {
        name: "Ocean",
        alive: '#00bfff',
        dead: '#001a33',
        trail: 'rgba(0, 26, 51, 0.4)',
        grid: '#003366'
    },
    // Adding more to increase lines and utility
    mono: {
        name: "Monochrome",
        alive: '#ffffff',
        dead: '#000000',
        trail: 'rgba(0, 0, 0, 0.5)',
        grid: '#333333'
    },
    gold: {
        name: "Midas",
        alive: '#ffd700',
        dead: '#1a1a00',
        trail: 'rgba(26, 26, 0, 0.4)',
        grid: '#333300'
    }
};

class ThemeManager {
    constructor(config, renderer) {
        this.config = config;
        this.renderer = renderer;
        this.currentTheme = 'cyberpunk';
    }

    setTheme(themeName) {
        if (Themes[themeName]) {
            this.currentTheme = themeName;
            const t = Themes[themeName];

            // Update Config
            this.config.COLOR_ALIVE = t.alive;
            this.config.COLOR_DEAD = t.dead;
            this.config.COLOR_GRID = t.grid;

            // Update Renderer directly
            this.renderer.aliveColor = t.alive;
            this.renderer.deadColor = t.dead;
            this.renderer.trailColor = t.trail;

            // Update CSS variables for UI sync
            document.documentElement.style.setProperty('--color-cell-alive', t.alive);
            document.documentElement.style.setProperty('--color-bg', t.dead);
            document.documentElement.style.setProperty('--color-grid-line', t.grid);

            // Force redraw logic if needed (e.g. clear screen with new bg)
        }
    }

    cycle() {
        const keys = Object.keys(Themes);
        const idx = keys.indexOf(this.currentTheme);
        const next = keys[(idx + 1) % keys.length];
        this.setTheme(next);
        return Themes[next].name;
    }
}
