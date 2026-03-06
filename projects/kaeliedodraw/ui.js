class UIController {
    constructor(kaleidoCanvas) {
        this.canvas = kaleidoCanvas;
        this.symmetryButtons = document.querySelectorAll('.symmetry-btn');
        this.mirrorModeButtons = document.querySelectorAll('[data-mode]');
        this.drawModeButtons = document.querySelectorAll('[data-drawmode]');
        this.colorPicker = document.getElementById('colorPicker');
        this.brushSizeSlider = document.getElementById('brushSize');
        this.brushSizeValue = document.getElementById('brushSizeValue');
        this.opacitySlider = document.getElementById('brushOpacity');
        this.opacityValue = document.getElementById('opacityValue');
        this.clearButton = document.getElementById('clearBtn');
        this.downloadButton = document.getElementById('downloadBtn');
        this.undoButton = document.getElementById('undoBtn');
        this.redoButton = document.getElementById('redoBtn');
        this.showGuidesToggle = document.getElementById('showGuides');
        this.autoRotateToggle = document.getElementById('autoRotate');
        this.rotationSpeedSlider = document.getElementById('rotationSpeed');
        this.speedValue = document.getElementById('speedValue');
        this.rotationSpeedGroup = document.getElementById('rotationSpeedGroup');
        this.rainbowModeToggle = document.getElementById('rainbowMode');
        this.blendModeSelect = document.getElementById('blendMode');
        this.themeSelector = document.getElementById('themeSelector');
        this.colorPreview = document.querySelector('.color-preview');
        this.colorPresets = document.querySelectorAll('.preset-color');
        
        this.setupEventListeners();
        this.updateColorPreview();
        this.updateUndoRedoButtons();
    }

    setupEventListeners() {
        this.symmetryButtons.forEach(btn => {
            btn.addEventListener('click', this.handleSymmetryChange.bind(this));
        });

        this.mirrorModeButtons.forEach(btn => {
            btn.addEventListener('click', this.handleMirrorModeChange.bind(this));
        });

        this.drawModeButtons.forEach(btn => {
            btn.addEventListener('click', this.handleDrawModeChange.bind(this));
        });

        this.colorPicker.addEventListener('input', this.handleColorChange.bind(this));
        this.brushSizeSlider.addEventListener('input', this.handleBrushSizeChange.bind(this));
        this.opacitySlider.addEventListener('input', this.handleOpacityChange.bind(this));
        this.clearButton.addEventListener('click', this.handleClear.bind(this));
        this.downloadButton.addEventListener('click', this.handleDownload.bind(this));
        this.undoButton.addEventListener('click', this.handleUndo.bind(this));
        this.redoButton.addEventListener('click', this.handleRedo.bind(this));
        this.showGuidesToggle.addEventListener('change', this.handleGuidesToggle.bind(this));
        this.autoRotateToggle.addEventListener('change', this.handleAutoRotate.bind(this));
        this.rotationSpeedSlider.addEventListener('input', this.handleRotationSpeed.bind(this));
        this.rainbowModeToggle.addEventListener('change', this.handleRainbowMode.bind(this));
        this.blendModeSelect.addEventListener('change', this.handleBlendMode.bind(this));
        this.themeSelector.addEventListener('change', this.handleThemeChange.bind(this));
        
        this.colorPresets.forEach(preset => {
            preset.addEventListener('click', this.handlePresetColor.bind(this));
        });

        document.addEventListener('keydown', this.handleKeyboard.bind(this));
        
        setInterval(() => this.updateUndoRedoButtons(), 500);
    }

    handleSymmetryChange(e) {
        const button = e.currentTarget;
        const segments = parseInt(button.dataset.segments);
        
        this.symmetryButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        this.canvas.setSegments(segments);
    }

    handleMirrorModeChange(e) {
        const button = e.currentTarget;
        const mode = button.dataset.mode;
        
        this.mirrorModeButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        this.canvas.setMirrorMode(mode);
    }

    handleDrawModeChange(e) {
        const button = e.currentTarget;
        const mode = button.dataset.drawmode;
        
        this.drawModeButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        this.canvas.setDrawMode(mode);
    }

    handleColorChange(e) {
        const color = e.target.value;
        this.canvas.setBrushColor(color);
        this.updateColorPreview();
    }

    handlePresetColor(e) {
        const color = e.currentTarget.dataset.color;
        this.colorPicker.value = color;
        this.canvas.setBrushColor(color);
        this.updateColorPreview();
    }

    handleBrushSizeChange(e) {
        const size = parseInt(e.target.value);
        this.brushSizeValue.textContent = size;
        this.canvas.setBrushSize(size);
    }

    handleOpacityChange(e) {
        const opacity = parseInt(e.target.value);
        this.opacityValue.textContent = opacity;
        this.canvas.setBrushOpacity(opacity / 100);
    }

    handleGuidesToggle(e) {
        this.canvas.setShowGuides(e.target.checked);
    }

    handleAutoRotate(e) {
        const enabled = e.target.checked;
        const speed = parseInt(this.rotationSpeedSlider.value);
        this.canvas.setAutoRotate(enabled, speed);
        this.rotationSpeedGroup.style.display = enabled ? 'flex' : 'none';
    }

    handleRotationSpeed(e) {
        const speed = parseInt(e.target.value);
        this.speedValue.textContent = speed;
        if (this.autoRotateToggle.checked) {
            this.canvas.setAutoRotate(true, speed);
        }
    }

    handleRainbowMode(e) {
        this.canvas.setRainbowMode(e.target.checked);
    }

    handleBlendMode(e) {
        this.canvas.setBlendMode(e.target.value);
    }

    handleThemeChange(e) {
        const theme = e.target.value;
        document.documentElement.setAttribute('data-theme', theme);
    }

    handleClear() {
        if (confirm('Clear the canvas? This cannot be undone.')) {
            this.canvas.clear();
        }
    }

    handleDownload() {
        this.canvas.downloadImage();
    }

    handleUndo() {
        this.canvas.undo();
        this.updateUndoRedoButtons();
    }

    handleRedo() {
        this.canvas.redo();
        this.updateUndoRedoButtons();
    }

    updateUndoRedoButtons() {
        this.undoButton.disabled = !this.canvas.canUndo();
        this.redoButton.disabled = !this.canvas.canRedo();
    }

    handleKeyboard(e) {
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                this.handleUndo();
            } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
                e.preventDefault();
                this.handleRedo();
            } else if (e.key === 's') {
                e.preventDefault();
                this.handleDownload();
            }
        } else if (e.key === ' ' && e.target.tagName !== 'INPUT') {
            e.preventDefault();
            this.handleClear();
        }
    }

    updateColorPreview() {
        this.colorPreview.style.backgroundColor = this.colorPicker.value;
    }
}
