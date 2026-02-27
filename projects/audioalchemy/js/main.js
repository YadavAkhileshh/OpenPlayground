import { audioCtx } from './core/AudioEngine.js';
import { PatchManager } from './core/PatchManager.js';
import { CableRenderer } from './ui/CableRenderer.js';

// Modules
import { VCO } from './modules/VCO.js';
import { VCF } from './modules/VCF.js';
import { VCA } from './modules/VCA.js';
import { LFO } from './modules/LFO.js';
import { Sequencer } from './modules/Sequencer.js';
import { Delay } from './modules/Delay.js';
import { Noise } from './modules/Noise.js';
import { Master } from './modules/Master.js';

class App {
    constructor() {
        this.patchManager = null;
        this.renderer = null;
        this.modules = [];

        this.init();
    }

    async init() {
        const startBtn = document.getElementById('start-btn');
        startBtn.addEventListener('click', async () => {
            document.getElementById('overlay').style.opacity = 0;
            setTimeout(() => document.getElementById('overlay').remove(), 500);

            try {
                await audioCtx.init();
                this.bootSystem();
            } catch (err) {
                console.error("Initialization failed:", err);
                alert("Audio Engine Failed to Start: " + err.message);
            }
        });
    }

    bootSystem() {
        // Initialize Managers
        // Passed as null first because renderer needs patchManager and vice versa?
        // Actually renderer needs PM. PM needs renderer?
        // PM just needs to know locations. Renderer queries PM.
        const pm = new PatchManager(audioCtx, null);
        const renderer = new CableRenderer('patch-canvas', pm);
        pm.renderer = renderer; // Circular dep fix

        this.patchManager = pm;
        this.renderer = renderer;

        // Instantiate Modules
        const rack = document.getElementById('module-grid');

        // Rack Configuration:
        // [SEQ] [LFO] [VCO] [VCO] [VCF] [VCA] [MASTER]
        this.createModule(Sequencer, rack);
        this.createModule(LFO, rack);
        this.createModule(VCO, rack);
        this.createModule(Noise, rack); // New
        this.createModule(VCF, rack);
        this.createModule(Delay, rack); // New
        this.createModule(VCA, rack);
        this.createModule(Master, rack);

        // Global Events
        document.getElementById('clear-cables-btn').addEventListener('click', () => {
            this.patchManager.clearAll();
        });

        console.log("AudioAlchemy System Online.");
    }

    createModule(ModuleClass, container) {
        const instance = new ModuleClass(container);
        this.patchManager.registerModule(instance);
        this.modules.push(instance);
        return instance;
    }
}

new App();
