/**
 * main.js
 * Entry point. Integrates all modules including Terminal, Memory, Audio, Router.
 */

import { StorageEngine } from './engine/storage.js';
import { TimeEngine } from './engine/time.js';
import { EntropySystem } from './engine/entropy.js';
import { GameLoop } from './engine/loop.js';
import { AudioEngine } from './engine/audio.js';
import { Router } from './engine/router.js'; // New Router

import { NoiseRenderer } from './visual/noise.js';
import { ScanlineRenderer } from './visual/scanlines.js';
import { LayoutShifter } from './visual/layout-shift.js';
import { TextDistort } from './visual/text-distort.js';
import { FilterManager } from './visual/filters.js';
import { Terminal } from './visual/terminal.js';
import { MemoryMap } from './visual/memory-map.js';
import { ARTICLE_1, ARTICLE_2, PROCESS_TEXT, STATUS_TEXT } from './data/manifesto.js';

class App {
    constructor() {
        console.log("AgingWeb: Initializing...");

        // Engine Systems
        this.storage = new StorageEngine();
        this.timeEngine = new TimeEngine(this.storage);
        this.entropy = new EntropySystem();
        this.audio = new AudioEngine();
        this.router = new Router(); // Init Router

        // Visual Systems
        this.noise = new NoiseRenderer();
        this.scanlines = new ScanlineRenderer();
        this.layout = new LayoutShifter();
        this.textDistort = new TextDistort();
        this.filters = new FilterManager();
        this.terminal = new Terminal();
        this.memory = new MemoryMap();

        // UI
        this.elVisit = document.getElementById('visit-time');
        this.elElapsed = document.getElementById('elapsed-time');
        this.elIntegrity = document.getElementById('integrity-stat');
        this.elWarp = document.getElementById('time-warp');
        this.elWarpVal = document.getElementById('warp-val');
        this.btnReset = document.getElementById('reset-btn');
        this.btnStart = document.getElementById('start-btn');
        this.btnStartAudio = document.getElementById('start-audio-btn');

        // Init Content & Bindings
        this.initContent();
        this.bindEvents();

        // Start Loop
        this.loop = new GameLoop(this.update.bind(this), this.render.bind(this));

        // Init Visuals
        this.terminal.init();
        this.memory.init();

        this.loop.start();
        this.timeEngine.start();

        this.elVisit.innerText = this.timeEngine.getFormattedTime();
    }

    initContent() {
        const articles = document.querySelectorAll('#about .card');
        if (articles[0]) articles[0].innerHTML = ARTICLE_1;
        if (articles[1]) articles[1].innerHTML = ARTICLE_2;

        const processContent = document.getElementById('process-content');
        if (processContent) processContent.innerHTML = PROCESS_TEXT;

        const statusContent = document.getElementById('status-content');
        if (statusContent) statusContent.innerHTML = STATUS_TEXT;
    }

    bindEvents() {
        this.elWarp.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            this.timeEngine.setMultiplier(val);
            this.elWarpVal.innerText = val + 'x';
            this.terminal.log(`TIME WARP: ${val}x`, 'warn');
        });

        this.btnReset.addEventListener('click', (e) => {
            e.preventDefault();
            this.storage.reset();
        });

        // Handle both start buttons if they exist
        const startAudio = (e) => {
            e.preventDefault();
            this.audio.init();
            this.audio.resume();
            this.terminal.log("AUDIO SYSTEM: ENGAGED", 'info');
            e.target.style.textDecoration = 'line-through';
            e.target.style.opacity = '0.5';
        };

        if (this.btnStart) this.btnStart.addEventListener('click', startAudio);
        if (this.btnStartAudio) this.btnStartAudio.addEventListener('click', startAudio);

        document.addEventListener('click', () => {
            if (this.audio.initialized) this.audio.resume();
        });
    }

    update(dt) {
        this.timeEngine.update(dt);
        const elapsed = this.timeEngine.virtualElapsed;
        this.entropy.update(elapsed);
        const chaos = this.entropy.chaosLevel;

        // Update Stats
        this.elElapsed.innerText = this.timeEngine.getFormattedElapsed();
        const integrity = Math.max(0, (100 - (chaos * 100))).toFixed(1);
        this.elIntegrity.innerText = `${integrity}%`;

        // Update Subsystems
        this.audio.update(chaos);
        this.terminal.update(chaos);
        this.memory.update(chaos);
    }

    render() {
        const chaos = this.entropy.chaosLevel;
        const phase = this.entropy.currentPhase;

        document.body.className = `phase-${phase}`;

        this.noise.render(chaos);
        this.scanlines.update(chaos);
        this.layout.update(chaos);
        this.textDistort.update(chaos);
        this.filters.update(chaos);

        if (chaos > 0.8 && Math.random() > 0.95) {
            document.title = "A g i n g . . .";
        } else if (chaos > 0.9) {
            document.title = "N o l l";
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
