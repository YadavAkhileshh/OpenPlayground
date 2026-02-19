/**
 * Manages user controls and event listeners.
 * Handles button clicks, slider inputs, and file drag-and-drop interactions.
 */
export class ControlsManager {
    /**
     * Creates a new ControlsManager.
     * @param {Object} callbacks - Object containing callback functions for UI events.
     * @param {Function} callbacks.onStart - Callback for Start button.
     * @param {Function} callbacks.onPause - Callback for Pause button.
     * @param {Function} callbacks.onReset - Callback for Reset button.
     * @param {Function} callbacks.onImageLoaded - Callback when an image is loaded (passes Image object).
     * @param {Function} callbacks.onSettingsChanged - Callback when settings sliders change (passes settings object).
     * @param {Object} initialConfig - Initial configuration object.
     */
    constructor(callbacks, initialConfig = {}) {
        this.callbacks = callbacks;
        this.config = initialConfig;

        // Buttons
        this.btnStart = document.getElementById('btn-start');
        this.btnPause = document.getElementById('btn-pause');
        this.btnReset = document.getElementById('btn-reset');

        // Inputs
        this.inputImage = document.getElementById('image-upload');
        this.dropZone = document.getElementById('drop-zone');

        // Settings
        this.sliderMutation = document.getElementById('rate-mutation');
        this.sliderVertex = document.getElementById('rate-vertices');
        this.sliderColor = document.getElementById('rate-color');

        // Apply initial config
        if (this.config.mutationRate) this.sliderMutation.value = this.config.mutationRate;
        if (this.config.vertexShift) this.sliderVertex.value = this.config.vertexShift;
        if (this.config.colorShift) this.sliderColor.value = this.config.colorShift;

        this.initListeners();
    }

    /**
     * Initializes all event listeners.
     */
    initListeners() {
        // Buttons
        this.btnStart.addEventListener('click', () => {
            this.callbacks.onStart();
            this.updateButtonState(true);
        });

        this.btnPause.addEventListener('click', () => {
            this.callbacks.onPause();
            this.updateButtonState(false);
        });

        this.btnReset.addEventListener('click', () => {
            this.callbacks.onReset();
            this.updateButtonState(false);
        });

        // Image Upload
        this.dropZone.addEventListener('click', () => this.inputImage.click());
        this.inputImage.addEventListener('change', (e) => this.handleImageUpload(e.target.files[0]));

        // Drag and Drop
        this.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.dropZone.classList.add('dragover');
        });

        this.dropZone.addEventListener('dragleave', () => {
            this.dropZone.classList.remove('dragover');
        });

        this.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.dropZone.classList.remove('dragover');
            if (e.dataTransfer.files.length) {
                this.handleImageUpload(e.dataTransfer.files[0]);
            }
        });

        // Settings
        this.sliderMutation.addEventListener('input', () => this.emitSettings());
        this.sliderVertex.addEventListener('input', () => this.emitSettings());
        this.sliderColor.addEventListener('input', () => this.emitSettings());
    }

    /**
     * Handles file read logic for uploaded images.
     * @param {File} file - The uploaded file object.
     */
    handleImageUpload(file) {
        if (!file || !file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.callbacks.onImageLoaded(img);
                // Hide drop zone text/border roughly by setting opacity to 0
                this.dropZone.style.opacity = '0';
                // We keep it clickable/droppable though
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    /**
     * Reads current slider values and calls the settings callback.
     * Normalizes values to appropriate ranges.
     */
    emitSettings() {
        this.callbacks.onSettingsChanged({
            mutationRate: this.sliderMutation.value / 1000, // map 0-100 to 0-0.1
            vertexShift: this.sliderVertex.value / 100,     // map 0-100 to 0-1
            colorShift: this.sliderColor.value,             // map 0-100 direct
            opacityShift: 0.1                               // fixed for now
        });
    }

    /**
     * Updates button enable/disable states based on running status.
     * @param {boolean} isRunning - Whether the evolution loop is active.
     */
    updateButtonState(isRunning) {
        this.btnStart.disabled = isRunning;
        this.btnPause.disabled = !isRunning;

        const indicator = document.getElementById('status-indicator');
        indicator.className = `status-indicator ${isRunning ? 'active' : 'paused'}`;
        indicator.querySelector('.status-text').textContent = isRunning ? 'Evolving' : 'Paused';
    }
}
