/**
 * @file UIManager.js
 * @description Central coordinator for the MirrorASCII interface.
 * 
 * The UIManager handles:
 * 1. Interaction between the UI elements (sliders, buttons) and the engines.
 * 2. Managing the application state (active, paused, settings).
 * 3. Handling window events like resize.
 * 4. Dispatching updates to the main rendering loop.
 */

class UIManager {
    /**
     * @param {CameraManager} camera 
     * @param {Processor} processor 
     * @param {ASCIIEngine} engine 
     * @param {VisualFX} visualFx
     * @param {DebugManager} debugManager
     */
    constructor(camera, processor, engine, visualFx, debugManager) {
        this.camera = camera;
        this.processor = processor;
        this.engine = engine;
        this.visualFx = visualFx;
        this.debugManager = debugManager;

        /** @type {boolean} */
        this.isRunning = false;

        /** @type {number} */
        this.lastFrameTime = 0;

        /** @type {number} */
        this.fpsLimit = 30; // Target FPS

        // Bind methods
        this.loop = this.loop.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.handleCameraError = this.handleCameraError.bind(this);
    }

    /**
     * Initializes the UI and starts the camera.
     */
    async init() {
        console.log('[UIManager] Initializing interface...');

        // Set up event listeners
        window.addEventListener('resize', this.handleResize);
        window.addEventListener('camera-error', this.handleCameraError);

        // Initial resize for engine
        this.engine.resize();

        // Start the camera
        const success = await this.camera.start();
        if (success) {
            this.isRunning = true;
            this.processor.updateGridScale(100); // Default columns
            requestAnimationFrame(this.loop);

            // Fade out loader if it exists
            this._hideLoader();
        } else {
            this._showErrorMessage('Camera access required to run MirrorASCII.');
        }
    }

    /**
     * The main application loop.
     * @param {number} timestamp 
     */
    loop(timestamp) {
        if (!this.isRunning) return;

        // FPS Control
        // Limit FPS to maintain stability
        const delta = timestamp - this.lastFrameTime;
        if (delta < (1000 / this.fpsLimit)) {
            requestAnimationFrame(this.loop);
            return;
        }
        this.lastFrameTime = timestamp;

        // Start performance tracking
        const startTime = this.debugManager.beginFrame();

        try {
            // 1. Process the raw frame
            let frameData = this.processor.processFrame();

            // 2. Apply Visual FX
            if (frameData && this.visualFx) {
                const meta = this.processor.getMetadata();
                frameData = this.visualFx.apply(frameData, meta.cols, meta.rows);
            }

            // 3. Render the ASCII result
            if (frameData) {
                const meta = this.processor.getMetadata();
                this.engine.render(frameData, meta.cols, meta.rows);
            }
        } catch (error) {
            console.error('[UIManager] Error in main loop:', error);
        }

        // End performance tracking
        this.debugManager.endFrame(startTime, this.processor.getMetadata());

        requestAnimationFrame(this.loop);
    }

    /**
     * Synchronizes engine/processor with window size.
     */
    handleResize() {
        this.engine.resize();
        // Recalculate grid based on current density setting
        this.processor.updateGridScale(this.processor.gridWidth);
    }

    /**
     * Handles camera errors by showing a modal to the user.
     * @param {CustomEvent} event 
     */
    handleCameraError(event) {
        this._showErrorMessage(event.detail.message);
    }

    /**
     * Internal helper to hide the initial loader.
     * @private
     */
    _hideLoader() {
        const loader = document.getElementById('app-loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 500);
        }
    }

    /**
     * Internal helper to show error messages.
     * @param {string} msg 
     * @private
     */
    _showErrorMessage(msg) {
        const errorEl = document.getElementById('error-overlay');
        if (errorEl) {
            const textEl = errorEl.querySelector('.error-message');
            if (textEl) textEl.textContent = msg;
            errorEl.classList.remove('hidden');
        } else {
            alert(msg);
        }
    }
}

// Exporting logic
window.UIManager = UIManager;
