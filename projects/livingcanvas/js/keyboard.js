/**
 * keyboard.js
 * Handles keyboard shortcuts for power users.
 */

class KeyboardHandler {
    constructor(config, loop, grid, ui) {
        this.config = config;
        this.loop = loop;
        this.grid = grid;
        this.ui = ui;

        this.setupListeners();
    }

    setupListeners() {
        document.addEventListener('keydown', (e) => {
            // Ignore if focus is on an input? (We only have a slider, so fine)

            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    this.togglePlay();
                    break;
                case 'KeyR':
                    if (e.shiftKey) {
                        // Shift+R = Randomize
                        this.grid.randomize();
                        this.updateAll();
                    } else {
                        // R = Reset/Clear
                        this.grid.clear();
                        this.loop.stop();
                        this.config.IS_PAUSED = true;
                        this.updateAll();
                    }
                    break;
                case 'KeyS':
                    // S = Step
                    this.loop.step();
                    if (this.ui) this.ui.updateStats();
                    break;
                case 'Digit1':
                    this.setTool('draw');
                    break;
                case 'Digit2':
                    this.setTool('erase');
                    break;
                case 'Digit3':
                    this.setTool('glider');
                    break;
            }
        });
    }

    togglePlay() {
        // We can click the button to trigger its logic and visual update
        const btn = document.getElementById('btn-play');
        if (btn) btn.click();
    }

    setTool(mode) {
        this.config.DRAW_MODE = mode;
        // Update UI visuals
        const btns = document.querySelectorAll('.brush-btn');
        btns.forEach(b => {
            if (b.getAttribute('data-brush') === mode) b.classList.add('active');
            else b.classList.remove('active');
        });
    }

    updateAll() {
        this.loop.draw();
        if (this.ui) this.ui.updateStats();
    }
}
