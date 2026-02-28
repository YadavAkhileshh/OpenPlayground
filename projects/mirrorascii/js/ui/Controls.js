/**
 * @file Controls.js
 * @description UI control management for MirrorASCII.
 * 
 * Performance Optimized: Uses direct DOM updates for feedback to minimize latency.
 */

class Controls {
    /**
     * @param {Processor} processor 
     * @param {ASCIIEngine} engine 
     * @param {UIManager} uiManager 
     * @param {VisualFX} visualFx
     * @param {DebugManager} debugManager
     */
    constructor(processor, engine, uiManager, visualFx, debugManager) {
        this.processor = processor;
        this.engine = engine;
        this.uiManager = uiManager;
        this.visualFx = visualFx;
        this.debugManager = debugManager;

        // Elements
        this.densitySlider = document.getElementById('density-range');
        this.brightnessSlider = document.getElementById('brightness-range');
        this.glitchSlider = document.getElementById('glitch-range');
        this.ghostingSlider = document.getElementById('ghosting-range');

        this.densityVal = document.getElementById('density-val');
        this.brightnessVal = document.getElementById('brightness-val');
        this.glitchVal = document.getElementById('glitch-val');
        this.ghostingVal = document.getElementById('ghosting-val');

        this.paletteBtn = document.getElementById('palette-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.charsetToggle = document.getElementById('charset-toggle');
        this.colorModeToggle = document.getElementById('color-mode-toggle');
        this.controlsPanel = document.getElementById('controls-panel');
        this.togglePanelBtn = document.getElementById('toggle-ui-btn');

        this.init();
    }

    /**
     * Attaches listeners to the DOM elements.
     */
    init() {
        console.log('[Controls] Initializing input listeners...');

        // Density Slider
        if (this.densitySlider) {
            this.densitySlider.addEventListener('input', (e) => {
                const cols = parseInt(e.target.value, 10);
                this.processor.updateGridScale(cols);
                if (this.densityVal) this.densityVal.textContent = cols;
            });
        }

        // Brightness Slider
        if (this.brightnessSlider) {
            this.brightnessSlider.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                this.processor.setBrightness(val);
                if (this.brightnessVal) this.brightnessVal.textContent = val.toFixed(1);
            });
        }

        // Glitch Slider
        if (this.glitchSlider) {
            this.glitchSlider.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                this.visualFx.setGlitch(val);
                if (this.glitchVal) this.glitchVal.textContent = val.toFixed(2);
            });
        }

        // Ghosting Slider
        if (this.ghostingSlider) {
            this.ghostingSlider.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                this.visualFx.setGhosting(val);
                if (this.ghostingVal) this.ghostingVal.textContent = val.toFixed(2);
            });
        }

        // Palette Cycle
        if (this.paletteBtn) {
            this.paletteBtn.addEventListener('click', () => {
                this.engine.nextPalette();
                // Update UI theme colors to match palette
                document.documentElement.style.setProperty('--accent-color', this.engine.monochromeColor);
                this.paletteBtn.textContent = `Style: ${this.engine.palettes[this.engine.currentPalette].name}`;
            });
        }

        // Reset Defaults
        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', () => this.resetToDefaults());
        }

        // Charset Toggle
        if (this.charsetToggle) {
            this.charsetToggle.addEventListener('change', (e) => {
                this.engine.setExtendedSet(e.target.checked);
            });
        }

        // Color Mode Toggle
        if (this.colorModeToggle) {
            this.colorModeToggle.addEventListener('change', (e) => {
                const mode = e.target.checked ? 'monochrome' : 'original';
                this.engine.setColorMode(mode);
            });
        }

        // UI Panel visibility
        if (this.togglePanelBtn && this.controlsPanel) {
            this.togglePanelBtn.addEventListener('click', () => {
                this.controlsPanel.classList.toggle('collapsed');
                this.togglePanelBtn.classList.toggle('active');
            });
        }

        // Keyboard shortcuts
        window.addEventListener('keydown', (e) => {
            if (e.key === 'h' || e.key === 'H') {
                this.controlsPanel.classList.toggle('collapsed');
                this.togglePanelBtn.classList.toggle('active');
            }
            if (e.key === 'f' || e.key === 'F') {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen();
                } else {
                    document.exitFullscreen();
                }
            }
            if (e.key === 'd' || e.key === 'D') {
                this.debugManager.toggle();
            }
            if (e.key === 'r' || e.key === 'R') {
                this.resetToDefaults();
            }
        });
    }

    /**
     * Resets all sliders and engines to their default states.
     */
    resetToDefaults() {
        // Data resets
        this.processor.updateGridScale(120);
        this.processor.setBrightness(1.0);
        this.visualFx.setGlitch(0);
        this.visualFx.setGhosting(0);
        this.engine.setPalette('matrix');
        this.engine.setExtendedSet(false);
        this.engine.setColorMode('original');

        // Update UI theme
        document.documentElement.style.setProperty('--accent-color', this.engine.monochromeColor);

        // UI Element resets
        if (this.densitySlider) this.densitySlider.value = 120;
        if (this.brightnessSlider) this.brightnessSlider.value = 1.0;
        if (this.glitchSlider) this.glitchSlider.value = 0;
        if (this.ghostingSlider) this.ghostingSlider.value = 0;

        if (this.densityVal) this.densityVal.textContent = 120;
        if (this.brightnessVal) this.brightnessVal.textContent = '1.0';
        if (this.glitchVal) this.glitchVal.textContent = '0.00';
        if (this.ghostingVal) this.ghostingVal.textContent = '0.00';

        if (this.charsetToggle) this.charsetToggle.checked = false;
        if (this.colorModeToggle) this.colorModeToggle.checked = false;
        if (this.paletteBtn) this.paletteBtn.textContent = 'Next Style';

        console.log('[Controls] All settings reset to defaults.');
    }
}

window.Controls = Controls;
