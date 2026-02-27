/**
 * ui.js
 * DOM manipulation for controls.
 */

class UI {
    constructor(config, loop, grid, themeManager) {
        this.config = config;
        this.loop = loop;
        this.grid = grid;
        this.themeManager = themeManager;

        this.playBtn = document.getElementById('btn-play');
        this.stepBtn = document.getElementById('btn-step');
        this.clearBtn = document.getElementById('btn-clear');
        this.randomBtn = document.getElementById('btn-random');
        this.themeBtn = document.getElementById('btn-theme'); // New Button
        this.infoBtn = document.getElementById('btn-info'); // New Info logic
        this.speedGrid = document.getElementById('speed-slider');

        this.genCount = document.getElementById('gen-count');
        this.popCount = document.getElementById('pop-count');

        this.brushBtns = document.querySelectorAll('.brush-btn');
        this.aboutOverlay = document.getElementById('about-overlay');

        this.setupListeners();
        this.updateStats();
    }

    setupListeners() {
        if (this.playBtn) {
            this.playBtn.addEventListener('click', () => {
                if (this.config.IS_PAUSED) {
                    this.loop.start();
                    this.playBtn.querySelector('span').textContent = '⏸';
                    this.playBtn.classList.add('active');
                } else {
                    this.loop.stop();
                    this.playBtn.querySelector('span').textContent = '▶';
                    this.playBtn.classList.remove('active');
                }
            });
        }

        if (this.stepBtn) {
            this.stepBtn.addEventListener('click', () => {
                this.loop.step();
                this.updateStats();
            });
        }

        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', () => {
                this.grid.clear();
                this.loop.stop();
                this.config.IS_PAUSED = true;
                this.playBtn.querySelector('span').textContent = '▶';
                this.updateStats();
                this.loop.draw();
            });
        }

        if (this.randomBtn) {
            this.randomBtn.addEventListener('click', () => {
                this.grid.randomize();
                this.updateStats();
                this.loop.draw();
            });
        }

        if (this.themeBtn) {
            this.themeBtn.addEventListener('click', () => {
                if (this.themeManager) {
                    const newTheme = this.themeManager.cycle();
                    console.log(`Theme set to: ${newTheme}`);
                    // Trigger redraw
                    this.loop.draw();
                }
            });
        }

        if (this.infoBtn) {
            this.infoBtn.addEventListener('click', () => {
                this.aboutOverlay.classList.toggle('hidden');
            });
        }

        // Hide overlay on canvas click if open
        this.aboutOverlay.addEventListener('click', () => {
            this.aboutOverlay.classList.add('hidden');
        });

        this.speedGrid.addEventListener('input', (e) => {
            this.config.DEFAULT_SPEED = parseInt(e.target.value);
        });

        this.brushBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.brushBtns.forEach(b => b.classList.remove('active'));
                const target = e.target.closest('.brush-btn') || btn;
                target.classList.add('active');
                const brushType = target.getAttribute('data-brush');
                this.config.DRAW_MODE = brushType;
            });
        });
    }

    updateStats() {
        if (this.genCount) this.genCount.textContent = this.grid.generation;
        if (this.popCount) this.popCount.textContent = this.grid.population;
    }
}
