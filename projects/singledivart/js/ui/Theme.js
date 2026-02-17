/**
 * Theme - Visual Aesthetics Manager
 */

const Theme = (() => {

    const themes = {
        dark: {
            bg: '#050505',
            accent: '#00ff88',
            panel: 'rgba(15, 15, 15, 0.85)'
        },
        light: {
            bg: '#f0f0f0',
            accent: '#0088ff',
            panel: 'rgba(240, 240, 240, 0.85)'
        }
    };

    /**
     * Initialize the theme
     */
    const init = () => {
        applyTheme('dark');
        console.log("Theme Manager Initialized");
    };

    /**
     * Apply a specific theme
     */
    const applyTheme = (themeName) => {
        const t = themes[themeName] || themes.dark;
        const root = document.documentElement;

        root.style.setProperty('--bg-color', t.bg);
        root.style.setProperty('--accent-color', t.accent);
        root.style.setProperty('--panel-bg', t.panel);

        document.body.className = `${themeName}-theme`;
    };

    /**
     * Update ambient lighting based on artwork colors
     */
    const updateAmbientGlow = (pixels) => {
        if (!pixels || pixels.length === 0) return;

        // Pick a random pixel color for the glow
        const randomPixel = pixels[Math.floor(Math.random() * pixels.length)];
        const viewport = document.getElementById('viewport');

        if (viewport && randomPixel) {
            viewport.style.boxShadow = `inset 0 0 100px ${randomPixel.color}22`;
        }
    };

    return {
        init,
        applyTheme,
        updateAmbientGlow
    };

})();

window.Theme = Theme;
