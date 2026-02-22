/**
 * LindenArboretum - Main Application Bootstrap
 * Ties all 44 other files together and binds UI to Logic.
 * 
 * =========================================================================
 * ARCHITECTURE BOOTSTRAP:
 * 
 * This file acts as the primary controller in our modified MVC architecture.
 * It is responsible for injecting dependencies between the rendering engine,
 * the logic generator, the physics simulation, and the DOM User Interface.
 * 
 * Flow of Execution:
 * 1. DOMContentLoaded triggers `App.init()`.
 * 2. Canvas subsystems are configured (dimensions, context, dpr).
 * 3. UI overlays (FPS counters, sliders) are hooked to internal state.
 * 4. A preset is automatically injected (alienWeed).
 * 5. String rules are parsed and converted to grammar instructions.
 * 6. The enormous fractal string is generated (requestGeneration).
 * 7. requestAnimationFrame `loop.start()` fires simultaneously.
 * 8. Each frame, Physics are incremented (`update`), and string is piped
 *    into turtle graphics logic (`render`).
 * 
 * =========================================================================
 */

import { CONFIG } from './config.js';
import { appState } from './state.js';
import { eventBus } from './events.js';
import { MainLoop } from './loop.js';

import { canvasManager } from '../renderer/canvas.js';
import { contextManager } from '../renderer/context.js';
import { camera } from '../renderer/camera.js';
import { Renderer } from '../renderer/renderer.js';
import { colorProfile } from '../renderer/colorProfile.js';
import { postProcessor } from '../renderer/postProcessing.js';

import { LSystemEngine } from '../lsystem/engine.js';
import { lsystemValidator } from '../lsystem/validator.js';
import { PRESETS_ALIEN } from '../lsystem/alienRules.js';
import { PRESETS_STANDARD } from '../lsystem/standardRules.js';

import { PhysicsEngine } from '../physics/physicsEngine.js';

import { domUtils } from '../ui/domUtils.js';
import { editorUI } from '../ui/editor.js';
import { sliderManager } from '../ui/slider.js';
import { panelManager } from '../ui/panel.js';
import { modalManager } from '../ui/modal.js';
import { notifications } from '../ui/notifications.js';
import { perfMonitor } from '../ui/fpsCounter.js';

class App {
    constructor() {
        // Subsystem instances decoupled cleanly
        this.loop = new MainLoop();
        this.renderer = new Renderer();
        this.lsEngine = new LSystemEngine();
        this.physics = new PhysicsEngine();
    }

    /**
     * Primary initialization block. Called once everything is in DOM.
     */
    async init() {
        try {
            // ----------------------------------------------------
            // 1. Setup Graphics Layers
            // ----------------------------------------------------
            canvasManager.init(CONFIG.CANVAS_ID);
            contextManager.init();
            camera.init(canvasManager.canvas);

            // ----------------------------------------------------
            // 2. Setup User Interface Callbacks
            // ----------------------------------------------------
            perfMonitor.init();
            notifications.init();
            panelManager.bindShortcuts();
            modalManager.init('help-modal', 'btn-show-help', 'btn-close-modal');

            // Bind Editor (Text Areas)
            editorUI.init((presetName) => this.loadPreset(presetName));

            // Load the initial tree visual
            this.loadPreset('alienWeed');

            // ----------------------------------------------------
            // 3. Bind Interactive Sliders
            // ----------------------------------------------------

            sliderManager.bind('depth-slider', 'depth-value', '', (val, dragging) => {
                appState.depth = val;
                // Prevent lagging the browser while dragging depth drastically
                if (!dragging) this.requestGeneration();
            });

            sliderManager.bind('angle-slider', 'angle-value', '°', (val) => {
                appState.angle = val;
                this.renderer.angleRadians = val * (Math.PI / 180);
                // We don't need to rebuild strings for angles, just render
            });

            sliderManager.bind('wind-slider', 'wind-value', '', (val) => {
                appState.windStrength = val;
                this.physics.wind.setStrength(val);
            });

            sliderManager.bind('base-hue-slider', null, '', (val) => {
                appState.baseHue = val;
                colorProfile.setBaseHue(val);
            });

            // ----------------------------------------------------
            // 4. Bind Action Buttons
            // ----------------------------------------------------

            const btnGen = domUtils.get('btn-generate');
            if (btnGen) btnGen.addEventListener('click', () => {
                this.readEditorState();
                this.requestGeneration();
            });

            const btnMutate = domUtils.get('btn-randomize');
            if (btnMutate) btnMutate.addEventListener('click', () => {
                // Slight tweak to angle randomly
                const current = sliderManager.getValue('angle-slider');
                const mutated = current + (Math.random() * 10 - 5);

                // Update visual slider
                sliderManager.setValue('angle-slider', mutated);

                // Sync internal config immediately
                appState.angle = mutated;
                this.renderer.angleRadians = mutated * (Math.PI / 180);
            });

            const btnAnim = domUtils.get('btn-toggle-animation');
            if (btnAnim) btnAnim.addEventListener('click', () => {
                appState.isAnimating = !appState.isAnimating;
                domUtils.toggleClass(btnAnim, 'active-toggle', appState.isAnimating);
            });

            // ----------------------------------------------------
            // 5. Blast-off Sequence
            // ----------------------------------------------------
            this.loop.start(this.update.bind(this), this.render.bind(this));

            console.log("[LindenArboretum] Core Systems Online. All 45 models loaded.");

        } catch (e) {
            console.error("[LindenArboretum] Critical Initialization failure:", e);
            notifications.showError("System Failure. Check console logs.");
        }
    }

    /**
     * Injects predefined rulesets into the state.
     */
    loadPreset(presetName) {
        let preset = PRESETS_ALIEN[presetName] || PRESETS_STANDARD[presetName];
        if (!preset) return;

        // Format rule array to string for textarea
        const rulesStr = preset.rules.join('\n');

        // Push to UI forms
        editorUI.setValues(preset.axiom, rulesStr);
        sliderManager.setValue('depth-slider', preset.depth);
        sliderManager.setValue('angle-slider', preset.angle);
        sliderManager.setValue('wind-slider', preset.windStrength);
        sliderManager.setValue('base-hue-slider', preset.baseHue);

        // Push to AppState Memory
        appState.axiom = preset.axiom;
        appState.rulesText = rulesStr;
        appState.depth = preset.depth;
        appState.angle = preset.angle;
        appState.windStrength = preset.windStrength;

        // Sync underlying mechanical properties
        colorProfile.setBaseHue(preset.baseHue);
        this.renderer.angleRadians = preset.angle * (Math.PI / 180);
        this.physics.wind.setStrength(preset.windStrength);

        // Rebuild the fractal string based on new memory layout
        this.requestGeneration();
    }

    /**
     * Pulls raw values safely from DOM inputs.
     */
    readEditorState() {
        const { axiom, rules } = editorUI.getValues();
        appState.axiom = axiom;
        appState.rulesText = rules;
    }

    /**
     * Initiates the heavy CPU bound task of string rewriting.
     */
    requestGeneration() {
        try {
            // 1. Verify safe depth for UI warning
            const preliminaryRules = appState.rulesText.split('\n').filter(l => l.includes('->') || l.includes('='));

            // Check exponential explosion warnings
            const depthWarn = domUtils.get('depth-warning');
            if (appState.depth > 7 && preliminaryRules.length > 0) {
                if (depthWarn) depthWarn.style.opacity = '1';
            } else {
                if (depthWarn) depthWarn.style.opacity = '0';
            }

            // 2. Configure Grammar Engine
            this.lsEngine.loadConfiguration(appState.axiom, appState.rulesText);
            this.lsEngine.setDepth(appState.depth);

            // 3. Generate Huge String (Can take 1-50 milliseconds based on depth)
            appState.commandString = this.lsEngine.generate();

            // 4. Update Diagnostics 
            const metrics = this.lsEngine.getMetrics();
            perfMonitor.updateGenMetrics(metrics.generationTimeMs, metrics.commandCount);

            // 5. Automatic Camera framing based on depth size estimations
            const zoomEst = Math.max(0.1, 1 - (appState.depth * 0.1));
            camera.targetZoom = zoomEst;
            camera.targetY = appState.depth * 10;

        } catch (err) {
            console.error("[Generator Panic]: ", err);
            notifications.showError(err.message, 5000);
        }
    }

    /**
     * Frame Delta Logic - primarily advances the simulation time.
     */
    update(deltaTime) {
        if (appState.isAnimating) {
            this.physics.update(deltaTime);
        }
    }

    /**
     * Rendering loop pipeline hook.
     */
    render() {
        // We must redraw every single frame without caching image data 
        // because the wind physics continuously bends the structural nodes.
        if (appState.commandString) {

            // Ensure the tree fits on screen by dynamically scaling initial branch
            // length down exponentially based on how deep we iterate.
            const startLength = Math.max(2, CONFIG.DEFAULT_BRANCH_LENGTH * Math.pow(0.85, appState.depth));

            this.renderer.render(
                appState.commandString,
                appState.isAnimating ? this.physics : null, // Branch passing 
                startLength
            );

            // Apply chromatic distortion overlays if applicable
            postProcessor.applyFilters();
        }
    }
}

// Native Bootstrap Launcher
window.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});
