/**
 * UIController
 * Manages the HUD overlay and configuration inputs.
 * Binds DOM elements to the global State configuration.
 * Handles two-way data binding for UI controls.
 */
class UIController {
    /**
     * Creates a new UIController instance.
     * Caches all DOM elements for performance.
     */
    constructor() {
        // Range Inputs
        this.inputLayerCount = Utils.qs('#layer-count');
        this.valLayerCount = Utils.qs('#layer-count-val');

        this.inputDepth = Utils.qs('#depth-intensity');
        this.valDepth = Utils.qs('#depth-intensity-val');

        this.inputGlow = Utils.qs('#glow-opacity');
        this.valGlow = Utils.qs('#glow-opacity-val');

        // Text Input
        this.inputText = Utils.qs('#text-input');

        // Coordinate Displays
        this.coordX = Utils.qs('#coor-x');
        this.coordY = Utils.qs('#coor-y');
        this.coordZ = Utils.qs('#coor-z');
    }

    /**
     * Initializes the UI Controller.
     * Sets up event listeners for all inputs.
     */
    init() {
        this.bindEvents();
        console.log('UIController: Initialized');
    }

    /**
     * Binds input events to State updates.
     */
    bindEvents() {
        // Layer Count Control
        if (this.inputLayerCount) {
            this.inputLayerCount.addEventListener('input', (e) => {
                const val = parseInt(e.target.value);
                this.valLayerCount.textContent = val;
                State.updateConfig('layerCount', val);
            });
        }

        // Depth Intensity Control
        if (this.inputDepth) {
            this.inputDepth.addEventListener('input', (e) => {
                const val = parseInt(e.target.value);
                this.valDepth.textContent = `${val}px`;
                State.updateConfig('depthIntensity', val);
            });
        }

        // Glow Opacity Control
        if (this.inputGlow) {
            this.inputGlow.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                this.valGlow.textContent = `${Math.round(val * 100)}%`;
                State.updateConfig('glowOpacity', val);

                // Direct update to CSS variable for immediate feedback
                document.documentElement.style.setProperty('--holo-glow-intensity', val);
            });
        }

        // Text Input Control
        if (this.inputText) {
            this.inputText.addEventListener('input', (e) => {
                let val = e.target.value.toUpperCase();
                // Enforce max length to prevent DOM overload
                if (val.length > 12) val = val.substring(0, 12);
                State.updateConfig('text', val);
            });
        }
    }

    /**
     * Called every frame.
     * Updates real-time HUD displays like coordinate trackers.
     */
    update() {
        // Update coordinate display
        if (this.coordX) this.coordX.textContent = State.runtime.mouseX.toFixed(3);
        if (this.coordY) this.coordY.textContent = State.runtime.mouseY.toFixed(3);

        // Z is simulated based on interaction depth for visual effect
        // It helps visualize the "volumetric" cursor position
        const z = (State.runtime.mouseX * State.runtime.mouseY * 100).toFixed(0);
        if (this.coordZ) this.coordZ.textContent = z;
    }
}
