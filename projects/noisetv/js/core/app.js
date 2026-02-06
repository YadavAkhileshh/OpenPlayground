/**
 * App.js
 * 
 * =============================================================================
 * NoiseTV | Advanced Signal Processing & CRT Simulation
 * =============================================================================
 * 
 * CORE ARCHITECTURAL OVERVIEW:
 * This application is designed as a modular signal processing simulation.
 * It coordinates a high-performance rendering engine (CanvasRenderer) with
 * a procedural audio synthesis engine (AudioEngine). 
 * 
 * STATE MANAGEMENT:
 * The application follows a unidirectional data flow pattern where UI actions
 * update the AppState, which then triggers refinements in the rendering and
 * audio loops on the next animation frame.
 * 
 * PERFORMANCE CONSIDERATIONS:
 * To maintain a steady 60FPS on a wide range of hardware, the rendering loop
 * is decoupled from state updates where possible, and UI heavy lifting is 
 * delegated to the GPU via CSS3 transforms and filters.
 * 
 * @module NoiseTV
 * @author Antigravity
 * @version 1.1.0
 */

import { AppState } from './state.js';
import { CONFIG } from './constants.js';
import { CanvasRenderer } from '../render/canvas.js';
import { AudioEngine } from '../audio/engine.js';
import { DialControl } from '../ui/dial.js';
import { MenuController } from '../ui/menu.js';
import { Telemetry } from '../utils/performance.js';

/**
 * Main application class responsible for orchestration.
 */
class NoiseTV {
    /**
     * Initializes all core components and binds them to the DOM.
     * Sets up the baseline state and starts the main processing loop.
     */
    constructor() {
        console.log("NOISETV: Initializing Systems...");

        // 1. Performance Monitoring
        // We enable telemetry for optimization tracking.
        this.telemetry = new Telemetry(true);

        // 2. Hardware Simulation Components
        this.renderer = new CanvasRenderer('noise-canvas');
        this.audio = new AudioEngine();

        // 3. User Interface Controllers
        this.dial = new DialControl('frequency-dial', (val) => this.handleTuning(val));
        this.menu = new MenuController((setting, val) => this.handleSettingChange(setting, val));

        // 4. Peripheral DOM References
        this.dom = {
            app: document.getElementById('noiseapp'),
            osdFreq: document.getElementById('current-channel'),
            osdStatus: document.querySelector('.osd-status'),
            osdMeta: document.querySelector('.osd-meta'),
            signalMeter: document.getElementById('signal-level'),
            powerBtn: document.getElementById('power-button'),
            seekBtn: document.getElementById('seek-button'),
            ambient: document.getElementById('ambient-light')
        };

        this.lastFrameTime = 0;
        this.init();
    }

    /**
     * Final stage initialization.
     * Sets up event listeners and performs initial state sync.
     */
    init() {
        this.dom.powerBtn.addEventListener('click', () => this.togglePower());
        this.dom.seekBtn.addEventListener('click', () => this.startAutoScan());

        // Kick off the primary hardware loop
        requestAnimationFrame((t) => this.loop(t));

        // Aesthetic randomness: starts the TV at a random noise position.
        const initialTuning = 0.2 + Math.random() * 0.6;
        AppState.updateTuning(initialTuning);
        this.dial.setRotation(initialTuning);
        this.syncUI();
    }

    /**
     * Toggles the hardware power state.
     * Simulates the electrical warm-up and cool-down of a vintage CRT tube.
     * 
     * @returns {Promise<void>}
     */
    async togglePower() {
        // Prevent spamming during state transitions
        if (AppState.isWarmingUp) return;

        AppState.isWarmingUp = true;
        const newState = !AppState.isPoweredOn;
        this.dom.powerBtn.classList.toggle('active', newState);

        if (newState) {
            this.dom.osdStatus.innerText = 'TUBE WARMUP...';
            await this.audio.init();

            // Re-apply user preferences to the audio engine upon boot.
            this.audio.setNoiseType(AppState.settings.noiseType);

            // DELAY: Physical tubes take time to ignite phosphors.
            setTimeout(() => {
                AppState.setPower(true);
                AppState.isWarmingUp = false;
                this.dom.osdStatus.innerText = 'SIGNAL SEARCH';
                console.log("NOISETV: System Online.");
            }, CONFIG.CRT.WARMUP_DELAY_MS);
        } else {
            // Cool-down sequence
            AppState.setPower(false);
            this.dom.osdStatus.innerText = 'SHUTTING DOWN';
            this.dom.osdMeta.innerText = 'NO SIGNAL';

            setTimeout(() => {
                AppState.isWarmingUp = false;
                console.log("NOISETV: System Offline.");
            }, CONFIG.CRT.COOLDOWN_DELAY_MS);
        }

        this.audio.setPower(AppState.isPoweredOn);
        document.body.classList.toggle('power-off', !AppState.isPoweredOn);
    }

    /**
     * Initiates the automatic frequency seek sequence.
     * Scans through the MHz range until a signal exceeding the lock threshold is found.
     */
    startAutoScan() {
        if (!AppState.isPoweredOn || AppState.settings.isAutoScanning) return;

        AppState.settings.isAutoScanning = true;
        this.dom.osdStatus.innerText = 'AUTO-SCANNING';

        const scan = () => {
            // Exit condition if scan was interrupted
            if (!AppState.settings.isAutoScanning) return;

            let nextTuning = AppState.tuning + CONFIG.FREQ.SCAN_SPEED;
            if (nextTuning > 1.0) nextTuning = 0;

            this.handleTuning(nextTuning);
            this.dial.setRotation(nextTuning);

            // Threshold Check: stop scanning if we detect a coherent signal.
            if (AppState.signalStrength > CONFIG.FREQ.LOCK_THRESHOLD) {
                AppState.settings.isAutoScanning = false;
                this.dom.osdStatus.innerText = 'SIGNAL LOCKED';
                return;
            }

            // Recursion at specific interval to simulate mechanical seek speed.
            setTimeout(scan, 20);
        };

        scan();
    }

    /**
     * Coordinates frequency updates from user inputs.
     * Updates internal state and informs the rendering/audio engines.
     * 
     * @param {number} value - Normalized tuning value (0.0 to 1.0)
     */
    handleTuning(value) {
        AppState.updateTuning(value);
        this.syncUI();

        // HEURISTIC: If user touches the dial, we immediately cancel auto-seek.
        if (AppState.settings.isAutoScanning && this.dial.isDragging) {
            AppState.settings.isAutoScanning = false;
        }
    }

    /**
     * Dispatches settings changes to the relevant hardware components.
     * 
     * @param {string} setting - The key of the setting being changed
     * @param {any} value - The new value for the configuration
     */
    handleSettingChange(setting, value) {
        console.log(`NOISETV: Config Update [${setting}] -> ${value}`);

        switch (setting) {
            case 'theme':
                this.dom.app.setAttribute('data-theme', value);
                break;
            case 'noise':
                this.audio.setNoiseType(value);
                break;
            case 'brightness':
                this.dom.app.style.setProperty('--brightness', value);
                break;
            case 'contrast':
                this.dom.app.style.setProperty('--contrast', value);
                break;
        }
    }

    /**
     * Synchronizes the digital metrics with the view elements.
     */
    syncUI() {
        this.dom.osdFreq.innerText = AppState.getFrequencyString();

        // Signal Detection Logic for Metadata display
        if (AppState.signalStrength > 0.5) {
            const station = AppState.getNearestStation();
            this.dom.osdMeta.innerText = `${station.name} | ${station.meta}`;
        } else {
            this.dom.osdMeta.innerText = 'SEARCHING FOR SIGNAL...';
        }
    }

    /**
     * Main System Loop
     * Executed via RequestAnimationFrame for maximum visual stability.
     * 
     * @param {number} time - Current timestamp from the browser loop
     */
    loop(time) {
        // Schedule next frame immediately
        requestAnimationFrame((t) => this.loop(t));

        // Telemetry instrumentation
        this.telemetry.beginFrame();

        // If system is powered down, we skip synthesis and clear the cache.
        if (!AppState.isPoweredOn) {
            this.renderer.clear();
            this.dom.ambient.style.opacity = 0;
            this.telemetry.endFrame();
            return;
        }

        // 1. Audio Processing Phase
        // We obtain the current signal strength from the audio filter sweep.
        const signal = this.audio.update(AppState.frequency);
        AppState.signalStrength = signal;

        // 2. Hardware Feedback Phase
        this.dom.signalMeter.style.width = `${signal * 100}%`;

        // 3. Visual Synthesis Phase
        // The renderer handles complex pixel transformations based on signal clarity.
        this.renderer.render(AppState);

        // 4. Randomized Artifact Injection
        // Generates "glitches" proportional to signal weakness.
        const glitchChance = CONFIG.CRT.GLITCH_CHANCE_BASE + (1.0 - signal) * 0.12;
        if (Math.random() < glitchChance) {
            this.renderer.applyGlitch((1.0 - signal));
        }

        // 5. Environmental Lighting Effects
        // The ambient layer pulses slightly to mimic the screen glow.
        const ambientIntensity = 0.05 + (signal * 0.12) + (Math.random() * 0.03);
        this.dom.ambient.style.opacity = ambientIntensity;

        // Finalize telemetry for this frame
        this.telemetry.endFrame();
    }
}

/**
 * ENTRY POINT
 * Bootstrap the application once the DOM is fully realized.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Expose app instance to window for easier console debugging only.
    window.noiseSystem = new NoiseTV();
});

// =============================================================================
// END OF APP.JS
// =============================================================================
