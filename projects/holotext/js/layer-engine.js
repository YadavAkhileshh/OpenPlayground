/**
 * LayerEngine
 * Responsible for generating and managing the stacked DOM layers
 * that create the volumetric hologram effect.
 * 
 * Works by creating multiple semi-transparent copies of the text
 * and positioning them along the Z-axis using CSS3 transforms.
 */
class LayerEngine {
    /**
     * Creates a new LayerEngine instance.
     * Sets up the container reference and empty layer array.
     */
    constructor() {
        this.container = Utils.qs('#hologram-container');
        this.layers = [];
        this.isProcessing = false;
    }

    /**
     * Initializes the engine and generates the first batch of layers.
     * Sets up event listeners for configuration changes.
     */
    init() {
        if (!this.container) {
            console.error('LayerEngine: Container not found');
            return;
        }

        this.generateLayers();

        // Listen for config changes to regenerate if needed
        window.addEventListener('config-updated', (e) => {
            if (this.isProcessing) return; // Debounce if needed using flags

            if (e.detail.key === 'layerCount' || e.detail.key === 'text') {
                this.generateLayers();
            } else if (e.detail.key === 'depthIntensity') {
                this.updateDepths();
            }
        });

        console.log('LayerEngine: Initialized');
    }

    /**
     * Clears and rebuilds the DOM layers based on current valid config.
     * Applies specific CSS classes to different layers for visual effects.
     */
    generateLayers() {
        if (!this.container) return;

        this.isProcessing = true;

        // Clear existing
        this.container.innerHTML = '';
        this.layers = [];

        const count = State.config.layerCount;
        const text = State.config.text;

        // Create a document fragment for better performance on insertion
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < count; i++) {
            const layer = document.createElement('div');
            layer.classList.add('holo-layer');
            layer.textContent = text;

            // Assign specific roles based on position in stack
            if (i === 0) {
                // The very back layer, acts as a "shadow" or base anchor
                layer.classList.add('base');
            } else if (i === count - 1) {
                // The very front layer, usually the brightest and sharpest
                layer.classList.add('front', 'glow-pulse');
            } else {
                // Middle volumetric layers
                // Randomly assign bloom or scanline effects to add texture
                // We use deterministic randomness if possible, but Math.random is fine here
                if (Math.random() > 0.8) layer.classList.add('bloom');
                if (Math.random() > 0.9) layer.classList.add('scan');
            }

            // Store reference for updates
            this.layers.push(layer);
            fragment.appendChild(layer);
        }

        this.container.appendChild(fragment);

        // Immediate update of positions
        this.updateDepths();

        this.isProcessing = false;
    }

    /**
     * Updates the Z-transform of each layer based on current depth intensity.
     * Also modulated opacity to create the "fading into distance" effect.
     */
    updateDepths() {
        const count = this.layers.length;
        const depthMax = State.config.depthIntensity;

        // We use requestAnimationFrame for this update to ensure it's synced with render
        // But since this is called on config change, direct update is also okay.

        this.layers.forEach((layer, index) => {
            // Calculate Z position: 0 is back, depthMax is front
            // Normalized index from 0 to 1
            const n = index / (count - 1 || 1);

            const zPos = n * depthMax;

            // Use translate3d for hardware acceleration
            layer.style.transform = `translateZ(${zPos}px)`;

            // Adjust opacity for volumetric feel - deeper layers are more faint
            // But front layers are crisp
            // Map index 0->Max to Opacity 0.05->1
            const opacity = Utils.mapRange(index, 0, count - 1, 0.05, 1);

            // Front layer always stays at max opacity for readability
            if (!layer.classList.contains('front')) {
                layer.style.opacity = opacity;
            }
        });
    }
}
