/**
 * @file ui.js
 * @description Manages DOM interactions, event listeners, and interactive painting.
 */

export class UIController {
    constructor() {
        // Core UI Elements
        this.elements = {
            btnPlay: document.getElementById('btn-play'),
            btnPause: document.getElementById('btn-pause'),
            btnReset: document.getElementById('btn-reset'),
            genSlider: document.getElementById('generation-slider'),
            currentGenLabel: document.getElementById('current-gen-label'),
            imageInput: document.getElementById('image-input'),
            dropzone: document.getElementById('dropzone'),
            previewBox: document.getElementById('preview-container'),
            sourcePreview: document.getElementById('source-preview'),
            btnClear: document.getElementById('btn-remove-source'),

            // Logic & Rules
            rulesetSelect: document.getElementById('param-ruleset'),

            // Painter
            brushSizeSlider: document.getElementById('param-brush-size'),
            valBrushSize: document.getElementById('val-brush-size'),
            btnDrawAlive: document.getElementById('btn-draw-alive'),
            btnDrawDead: document.getElementById('btn-draw-dead'),
            mainCanvas: document.getElementById('main-canvas'),

            // Post-Processing
            aberrationSlider: document.getElementById('param-aberration'),
            grainSlider: document.getElementById('param-grain'),
            scanlinesSlider: document.getElementById('param-scanlines'),
            vignetteSlider: document.getElementById('param-vignette'),

            // Core Params
            thresholdSlider: document.getElementById('param-threshold'),
            valThreshold: document.getElementById('val-threshold'),
            gridSizeSlider: document.getElementById('param-grid-size'),
            valGridSize: document.getElementById('val-grid-size'),
            speedSlider: document.getElementById('param-speed'),
            valSpeed: document.getElementById('val-speed'),
            colorPicker: document.getElementById('param-color-cell'),

            // Telemetry
            teleAlive: document.getElementById('tele-alive'),
            teleDead: document.getElementById('tele-dead'),
            teleEntropy: document.getElementById('tele-entropy'),
            teleLatency: document.getElementById('tele-latency'),
            fpsCounter: document.getElementById('fps-counter'),
            status: document.getElementById('status-indicator'),

            // Export
            btnExportImg: document.getElementById('btn-export-img'),
            btnExportLog: document.getElementById('btn-export-log')
        };

        this.userInteractingWithSlider = false;
    }

    /**
     * Binds application events to controller callbacks.
     */
    bindEvents(callbacks) {
        // Playback
        this.elements.btnPlay.onclick = () => callbacks.onPlay();
        this.elements.btnPause.onclick = () => callbacks.onPause();
        this.elements.btnReset.onclick = () => callbacks.onReset();

        // General scrubbing
        this.elements.genSlider.onmousedown = () => this.userInteractingWithSlider = true;
        this.elements.genSlider.onmouseup = () => this.userInteractingWithSlider = false;
        this.elements.genSlider.oninput = (e) => {
            const val = parseInt(e.target.value);
            this.elements.currentGenLabel.textContent = `GEN ${val}`;
            callbacks.onSeek(val);
        };

        // File handling
        this.elements.dropzone.onclick = () => this.elements.imageInput.click();
        this.elements.imageInput.onchange = (e) => {
            if (e.target.files.length > 0) callbacks.onImageUpload(e.target.files[0]);
        };

        // Drag & Drop
        this.elements.dropzone.ondragover = (e) => {
            e.preventDefault();
            this.elements.dropzone.classList.add('active');
        };
        this.elements.dropzone.ondragleave = () => this.elements.dropzone.classList.remove('active');
        this.elements.dropzone.ondrop = (e) => {
            e.preventDefault();
            this.elements.dropzone.classList.remove('active');
            if (e.dataTransfer.files.length > 0) callbacks.onImageUpload(e.dataTransfer.files[0]);
        };

        // Brush controls
        this.elements.brushSizeSlider.oninput = (e) => {
            this.elements.valBrushSize.textContent = `${e.target.value}px`;
        };

        this.elements.btnDrawAlive.onclick = () => {
            this.elements.btnDrawAlive.classList.add('active');
            this.elements.btnDrawDead.classList.remove('active');
            callbacks.onBrushModeChange(1);
        };

        this.elements.btnDrawDead.onclick = () => {
            this.elements.btnDrawDead.classList.add('active');
            this.elements.btnDrawAlive.classList.remove('active');
            callbacks.onBrushModeChange(0);
        };

        // Painting Interaction
        this.elements.mainCanvas.onmousedown = (e) => callbacks.onPaintStart(e);
        window.onmousemove = (e) => callbacks.onPaintMove(e);
        window.onmouseup = () => callbacks.onPaintEnd();

        // Ruleset interaction
        this.elements.rulesetSelect.onchange = (e) => callbacks.onRulesetChange(e.target.value);

        // Core and Post-processing params
        const paramSliders = [
            this.elements.thresholdSlider, this.elements.gridSizeSlider,
            this.elements.speedSlider, this.elements.colorPicker,
            this.elements.aberrationSlider, this.elements.grainSlider,
            this.elements.scanlinesSlider, this.elements.vignetteSlider
        ];

        paramSliders.forEach(slider => {
            slider.oninput = () => {
                this.updateParamLabels();
                callbacks.onParamChange();
            };
        });

        // Other actions
        this.elements.btnClear.onclick = () => callbacks.onClearSource();
        this.elements.btnExportImg.onclick = () => callbacks.onExportImg();
        this.elements.btnExportLog.onclick = () => callbacks.onExportLog();
    }

    /**
     * Updates text labels based on slider values.
     */
    updateParamLabels() {
        this.elements.valThreshold.textContent = this.elements.thresholdSlider.value;
        const gs = this.elements.gridSizeSlider.value;
        this.elements.valGridSize.textContent = `${gs}x${gs}`;
        this.elements.valSpeed.textContent = `${this.elements.speedSlider.value} TPS`;
    }

    /**
     * Updates the UI state with new telemetry.
     */
    updateTelemetry(stats, fps) {
        this.elements.teleAlive.textContent = stats.alive.toLocaleString();
        this.elements.teleDead.textContent = stats.dead.toLocaleString();
        this.elements.teleEntropy.textContent = `${stats.entropy.toFixed(2)}%`;
        this.elements.teleLatency.textContent = `${stats.latency.toFixed(1)}ms`;
        this.elements.fpsCounter.textContent = fps.toFixed(1);

        // Sync slider if user is not actively scrubbing
        if (!this.userInteractingWithSlider) {
            this.elements.genSlider.value = stats.generation;
            this.elements.currentGenLabel.textContent = `GEN ${stats.generation}`;
        }
    }

    setRunning(isRunning) {
        if (isRunning) {
            this.elements.btnPlay.classList.add('hidden');
            this.elements.btnPause.classList.remove('hidden');
            this.elements.status.textContent = 'RUNNING';
            this.elements.status.className = 'status-running';
        } else {
            this.elements.btnPlay.classList.remove('hidden');
            this.elements.btnPause.classList.add('hidden');
            this.elements.status.textContent = 'PAUSED';
            this.elements.status.className = 'status-paused';
        }
    }

    showPreview(imgSrc) {
        this.elements.sourcePreview.src = imgSrc;
        this.elements.previewBox.classList.remove('hidden');
        this.elements.dropzone.classList.add('hidden');
    }

    hidePreview() {
        this.elements.previewBox.classList.add('hidden');
        this.elements.dropzone.classList.remove('hidden');
        this.elements.sourcePreview.src = '';
    }

    /**
     * Collects all current parameters for the app state.
     */
    getParams() {
        return {
            threshold: parseInt(this.elements.thresholdSlider.value),
            gridSize: parseInt(this.elements.gridSizeSlider.value),
            speed: parseInt(this.elements.speedSlider.value),
            color: this.elements.colorPicker.value,
            ruleset: this.elements.rulesetSelect.value,
            brushSize: parseInt(this.elements.brushSizeSlider.value),
            filters: {
                aberration: parseInt(this.elements.aberrationSlider.value),
                grain: parseInt(this.elements.grainSlider.value),
                scanlines: parseFloat(this.elements.scanlinesSlider.value),
                vignette: parseFloat(this.elements.vignetteSlider.value)
            }
        };
    }
}
