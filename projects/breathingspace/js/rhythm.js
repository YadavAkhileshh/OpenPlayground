/**
 * BreathingSpace - Rhythm Engine
 * 
 * CORE ARCHITECTURE:
 * This module is responsible for the temporal synchronization of the 
 * "Breathing" effect. It utilizes a high-precision animation loop 
 * (RequestAnimationFrame) to drive CSS Custom Properties (Variables) 
 * that dictate the layout's spatial behavior.
 * 
 * THE MATHEMATICS OF BREATHING:
 * 1. Accumulator: We track the total elapsed time since the session began.
 * 2. Temporal Normalization: Time is converted into a cyclical 0-1 range 
 *    based on the 'Breath Duration'.
 * 3. Oscillation: A sine-based waveform (Math.sin) creates the organic
 *    pulsing feel, moving between -1 (Exhale Peak) and 1 (Inhale Peak).
 * 4. Spatial Mapping: The wave is re-mapped to specific CSS values like 
 *    '--breath-gap' and '--breath-padding' using linear interpolation.
 * 
 * DATA FLOW:
 * [Accumulator] -> [Oscillator] -> [Progress (0.0 to 1.0)] -> [CSS Renderer]
 * 
 * PERFORMANCE CONSIDERATIONS:
 * - We minimize DOM lookups by caching selectors.
 * - We avoid layout thrashing by updating only CSS variables on the root.
 * - We use 'will-change' in CSS to prepare the browser for transforms.
 */

class RhythmEngine {

    /**
     * Initializes the engine components.
     * Sets up the render loop and establishes the initial temporal context.
     */
    constructor() {
        this.rafId = null;
        this.lastTime = 0;
        this.accumulator = 0;

        // --- Cache Reference Layer ---
        // Storing DOM references once to avoid repetitive document queries.
        this.root = document.documentElement;
        this.statusText = Utils.$('#cycle-state');
        this.heartbeat = Utils.$('.heartbeat');

        // --- Performance Guards ---
        this.isReady = false;

        this.start();

        console.log("%c Rhythm Engine: Initialized System Context ", "color: #10b981; font-weight: bold;");
    }

    /**
     * The Main Execution Loop (Engine Tick)
     * This function runs at approximately 60 or 120 FPS depending on the display.
     * 
     * @param {number} timestamp - Provided by requestAnimationFrame, high precision.
     */
    loop(timestamp) {
        // --- Tab Status Guard ---
        // We do not waste cycles if the user has paused or minimized the tab.
        if (state.get('isPaused')) {
            this.lastTime = timestamp;
            this.rafId = requestAnimationFrame((t) => this.loop(t));
            return;
        }

        // --- Delta Time Calculation ---
        // Ensuring the animation remains speed-constant regardless of framerate.
        if (!this.lastTime) this.lastTime = timestamp;
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        // --- Duration Synchronization ---
        // The breathing speed can be adjusted in real-time.
        const baseDuration = CONFIG.DEFAULT_BREATH_DURATION;
        const speedScale = state.get('speedMultiplier');

        // Protection against divide-by-zero or extremely low speeds.
        const currentDuration = baseDuration / (speedScale || 0.1);

        // --- Accumulation Logic ---
        this.accumulator += deltaTime;

        // --- Cyclical Progress Logic ---
        // Converting time to a 0.0 -> 1.0 cycle.
        const normalizedTime = (this.accumulator % currentDuration) / currentDuration;

        // Using a Sine wave for organic easing. 
        // Humans don't move linearly; we follow harmonic curves.
        const angle = normalizedTime * Math.PI * 2;
        const rawWave = Math.sin(angle);

        // Remap -1...1 to 0...1 for spatial progress.
        // 0.0 = Full Exhale (Minimum Spacing)
        // 1.0 = Full Inhale (Maximum Spacing)
        const progress = (rawWave + 1) / 2;

        // --- Reactive State Updates ---
        // Updating the shared state object so UI components can reflect the pulse.
        state.set('cycleProgress', progress);
        state.set('isInhaling', rawWave > 0);

        // --- Rendering Phase ---
        this.renderBreathEffect(progress);
        this.updateStatusIndicators(rawWave);

        // --- Queue Next Tick ---
        this.rafId = requestAnimationFrame((t) => this.loop(t));
    }

    /**
     * Render Breath Effect
     * Distributes the calculated progress into CSS variables.
     * 
     * @param {number} progress - 0.0 to 1.0
     */
    renderBreathEffect(progress) {
        // Depth multiplier from state (clamped to prevent inversion)
        const depth = Math.max(0.1, state.get('depthMultiplier'));

        // --- Interpolation Calculation ---
        // We pull min/max bounds from CONFIG.
        const gap = Utils.lerp(
            CONFIG.SPACING.MIN_GAP_REM,
            CONFIG.SPACING.MAX_GAP_REM * depth,
            progress
        );

        const padding = Utils.lerp(
            CONFIG.SPACING.MIN_PADDING_REM,
            CONFIG.SPACING.MAX_PADDING_REM * depth,
            progress
        );

        // Subtle scale effect (0.05 scalar) for a immersive experience.
        const scale = 1 + (progress * 0.03 * depth);

        // --- Global CSS Injection ---
        // updating these variables triggers a transition across all .breath-unit elements.
        Utils.setCSSVar('--breath-gap', `${gap}rem`);
        Utils.setCSSVar('--breath-padding', `${padding}rem`);
        Utils.setCSSVar('--breath-scale', scale);

        // Dynamic Vignette Shadowing
        // We map progress (0-1) to an opacity range for subtle atmospheric pulse
        const vignetteIntensity = Utils.mapRange(progress, 0, 1, 0.3, 0.6);
        Utils.setCSSVar('--vignette-opacity', vignetteIntensity);
    }

    /**
     * UI Status Feedback
     * Ensures the text and heartbeat icon match the engine's internal state.
     * 
     * @param {number} rawWave - The -1...1 sine value
     */
    updateStatusIndicators(rawWave) {
        const isInhaling = rawWave > 0;
        const currentLabel = isInhaling ? "Inhaling..." : "Exhaling...";

        // Optimization: Only update DOM if text actually changes.
        if (this.statusText.textContent !== currentLabel) {
            this.statusText.textContent = currentLabel;

            // Adjust visual intensity of text
            const textOpacity = isInhaling ? '1' : '0.6';
            this.root.style.setProperty('--text-main-opacity', textOpacity);
        }

        // Pulse the heartbeat icon proportional to the breath
        if (this.heartbeat) {
            const hScale = 1 + (Math.abs(rawWave) * 0.5);
            this.heartbeat.style.transform = `scale(${hScale})`;
        }
    }

    /**
     * Start the Engine
     */
    start() {
        if (this.rafId) return;
        this.lastTime = performance.now();
        this.rafId = requestAnimationFrame((t) => this.loop(t));
        this.isReady = true;
    }

    /**
     * Stop the Engine (Resource Management)
     */
    stop() {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
        this.isReady = false;
    }

    /**
     * Reset Temporal Context
     * Useful when speed changes drastically to prevent "jumping".
     */
    reset() {
        this.accumulator = 0;
        this.lastTime = performance.now();
    }
}

// System Singleton Instance
// This will be instantiated by main.js during the boot phase.
let engine;
