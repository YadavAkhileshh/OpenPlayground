/**
 * UI Manager
 * Handles HTML overlay updates.
 */

import { Config } from '../core/config.js';

/**
 * UI Manager
 * 
 * Handles all DOM interactions, including:
 * - Material selection palette
 * - Canvas input events (brush size, pause, clear)
 * - Statistics display (FPS, particle count)
 * - Save/Load operations via StorageManager
 */
export class UI {
    constructor(grid, input, storage, generator) {
        this.grid = grid;
        this.input = input;
        this.storage = storage;
        this.generator = generator;

        this.fpsEl = document.getElementById('fps-counter');
        this.countEl = document.getElementById('particle-counter');
        this.brushSlider = document.getElementById('brush-size');
        this.brushVal = document.getElementById('brush-size-val');
        this.paletteEl = document.getElementById('material-palette');
        this.clearBtn = document.getElementById('btn-clear');

        this.initPalette();
        this.initControls();
    }

    initPalette() {
        const materials = [
            { id: Config.MATERIALS.SAND, name: 'Sand', cls: 'mat-sand' },
            { id: Config.MATERIALS.WATER, name: 'Water', cls: 'mat-water' },
            { id: Config.MATERIALS.STONE, name: 'Stone', cls: 'mat-stone' },
            { id: Config.MATERIALS.FIRE, name: 'Fire', cls: 'mat-fire' },
            { id: Config.MATERIALS.SMOKE, name: 'Smoke', cls: 'mat-smoke' },
            { id: Config.MATERIALS.WOOD, name: 'Wood', cls: 'mat-wood' },
            { id: Config.MATERIALS.PLANT, name: 'Plant', cls: 'mat-plant' },
            { id: Config.MATERIALS.ACID, name: 'Acid', cls: 'mat-acid' },
            { id: Config.MATERIALS.OIL, name: 'Oil', cls: 'mat-oil' },
            { id: Config.MATERIALS.ICE, name: 'Ice', cls: 'mat-ice' },
            { id: Config.MATERIALS.STEAM, name: 'Steam', cls: 'mat-steam' },
            { id: Config.MATERIALS.LAVA, name: 'Lava', cls: 'mat-lava' },
            { id: Config.MATERIALS.GUNPOWDER, name: 'Gunpowder', cls: 'mat-gunpowder' },
            { id: Config.MATERIALS.SEED, name: 'Seed', cls: 'mat-seed' },
            { id: Config.MATERIALS.C4, name: 'C4', cls: 'mat-c4' },
            { id: Config.MATERIALS.VIRUS, name: 'Virus', cls: 'mat-virus' },
            { id: Config.MATERIALS.MITHRIL, name: 'Mithril', cls: 'mat-mithril' },
            { id: Config.MATERIALS.DISCO, name: 'Disco', cls: 'mat-disco' },
            { id: Config.MATERIALS.VOID, name: 'Void', cls: 'mat-void' },
            { id: Config.MATERIALS.LIFE, name: 'Life', cls: 'mat-life' },
            { id: Config.MATERIALS.CRYSTAL, name: 'Crystal', cls: 'mat-crystal' },
            { id: Config.MATERIALS.SPOUT_WATER, name: 'Water Spout', cls: 'mat-spout-water' },
            { id: Config.MATERIALS.OIL, name: 'Oil', cls: 'mat-oil' },
            { id: Config.MATERIALS.EMPTY, name: 'Eraser', cls: 'mat-empty' }, // Eraser
        ];

        materials.forEach(mat => {
            const btn = document.createElement('div');
            btn.className = `material-btn ${mat.cls}`;
            btn.title = mat.name;
            btn.onclick = () => {
                this.selectMaterial(mat.id, btn);
            };
            if (mat.id === Config.MATERIALS.SAND) btn.classList.add('active');
            this.paletteEl.appendChild(btn);
        });
    }

    selectMaterial(id, btn) {
        this.input.selectedMaterial = id;
        document.querySelectorAll('.material-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }

    initControls() {
        this.brushSlider.addEventListener('input', (e) => {
            const size = parseInt(e.target.value);
            this.input.brushSize = size;
            this.brushVal.textContent = size + 'px';
        });

        this.clearBtn.addEventListener('click', () => {
            this.grid.clear();
        });

        const saveBtn = document.getElementById('btn-save');
        const loadBtn = document.getElementById('btn-load');

        if (saveBtn) saveBtn.addEventListener('click', () => this.storage.save());
        if (loadBtn) loadBtn.addEventListener('click', () => this.storage.load());

        const genBtn = document.getElementById('btn-gen');
        if (genBtn) genBtn.addEventListener('click', () => {
            this.generator.generate('caves');
        });

        // Pause/Step can be hooked up if we exposed the loop control, 
        // passing it via main.js or finding it globally.
        // For now, let's grab it from window
        document.getElementById('btn-pause').addEventListener('click', () => {
            if (window.pixelAlchemy && window.pixelAlchemy.loop) {
                window.pixelAlchemy.loop.toggle();
            }
        });
    }

    updateStats(fps, particles) {
        this.fpsEl.textContent = `${Math.floor(fps)} FPS`;
        this.countEl.textContent = `${particles.toLocaleString()} Particles`;
    }
}