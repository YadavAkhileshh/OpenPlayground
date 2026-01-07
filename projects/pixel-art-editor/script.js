// PixelCanvas Pro - Advanced Pixel Art Editor
class PixelCanvas {
    constructor() {
        // Editor State
        this.state = {
            tool: 'pencil',
            color: '#ff0000',
            previousColor: '#000000',
            brushSize: 1,
            opacity: 100,
            sprayDensity: 30,
            showGrid: true,
            snapToGrid: true,
            antiAlias: false,
            zoom: 1,
            isDrawing: false,
            isShapeDrawing: false,
            isSelecting: false,
            isMoving: false,
            isResizing: false,
            startX: 0,
            startY: 0,
            lastX: 0,
            lastY: 0,
            tempPixels: null,
            previewPixels: null,
            shapeFillStyle: 'outline',
            gradientType: 'linear'
        };

        // Canvas Properties
        this.canvas = {
            width: 32,
            height: 32,
            pixelSize: 16,
            backgroundColor: '#1a1a1a'
        };

        // Layers System
        this.layers = [];
        this.currentLayer = 0;
        this.blendMode = 'normal';

        // History System
        this.history = [];
        this.historyIndex = -1;
        this.maxHistory = 50;

        // Color Management
        this.recentColors = [];
        this.maxRecentColors = 12;
        this.palette = [
            '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
            '#ffff00', '#ff00ff', '#00ffff', '#ff8000', '#8000ff',
            '#ff0080', '#404040', '#808080', '#c0c0c0', '#804000',
            '#008040', '#400080', '#804080', '#408040', '#808040'
        ];

        // Selection
        this.selection = {
            active: false,
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            pixels: null,
            layer: null,
            moving: false,
            resizing: false,
            handle: null
        };

        // Animation
        this.animation = {
            frames: [],
            currentFrame: 0,
            playing: false,
            interval: null,
            delay: 100,
            loopCount: 0,
            onionSkin: true,
            onionOpacity: 0.3
        };

        // Export Settings
        this.exportSettings = {
            format: 'png',
            scale: 2,
            background: 'transparent',
            quality: 'high',
            customBg: '#ffffff',
            gifDelay: 100,
            gifLoops: 0
        };

        // Import Settings
        this.importSettings = {
            method: 'fit',
            resizeMethod: 'nearest',
            dithering: 'none',
            colorReduction: 'auto'
        };

        // Resize Settings
        this.resizeSettings = {
            width: 32,
            height: 32,
            anchor: 'center',
            backgroundColor: '#00000000',
            method: 'scale'
        };

        // References to DOM elements
        this.elements = {};
        this.modals = {};
        this.tools = {};

        // Performance tracking
        this.fps = 60;
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.lastFpsUpdate = 0;

        // Initialize the editor
        this.init();
    }

    init() {
        this.cacheElements();
        this.initCanvas();
        this.initLayers();
        this.initColorSystem();
        this.initTools();
        this.initAnimation();
        this.setupEventListeners();
        this.updateUI();
        this.showNotification('PixelCanvas Pro v3.1 Ready! Press ? for shortcuts', 'success');
        this.updateMemoryUsage();
        this.startFpsCounter();
    }

    cacheElements() {
        // Canvas elements
        this.elements.canvas = document.getElementById('pixelCanvas');
        this.elements.canvasOverlay = document.getElementById('canvasOverlay');
        this.elements.gridOverlay = document.getElementById('gridOverlay');
        this.elements.selectionOverlay = document.getElementById('selectionOverlay');
        this.elements.previewCanvas = document.getElementById('previewCanvas');
        this.elements.previewCtx = this.elements.previewCanvas.getContext('2d');
        this.elements.hiddenCanvas = document.getElementById('hiddenCanvas');
        this.elements.hiddenCtx = this.elements.hiddenCanvas.getContext('2d');
        this.elements.importPreview = document.getElementById('importPreview');
        this.elements.importPreviewCtx = this.elements.importPreview.getContext('2d');
        this.elements.animationCanvas = document.getElementById('animationCanvas');
        this.elements.animationCtx = this.elements.animationCanvas.getContext('2d');

        // Tool elements
        this.elements.toolBtns = document.querySelectorAll('.tool-btn');
        this.elements.currentTool = document.getElementById('currentTool');
        this.elements.selectedTool = document.getElementById('selectedTool');

        // Color elements
        this.elements.colorPicker = document.getElementById('colorPicker');
        this.elements.currentColorDisplay = document.getElementById('currentColorDisplay');
        this.elements.previousColorDisplay = document.getElementById('previousColorDisplay');
        this.elements.currentColorHex = document.getElementById('currentColorHex');
        this.elements.colorPalette = document.getElementById('colorPalette');
        this.elements.recentColors = document.getElementById('recentColors');

        // Brush controls
        this.elements.brushSize = document.getElementById('brushSize');
        this.elements.brushSizeValue = document.getElementById('brushSizeValue');
        this.elements.brushSizeDisplay = document.getElementById('brushSizeDisplay');
        this.elements.opacity = document.getElementById('opacity');
        this.elements.opacityValue = document.getElementById('opacityValue');
        this.elements.sprayDensity = document.getElementById('sprayDensity');
        this.elements.sprayDensityValue = document.getElementById('sprayDensityValue');
        this.elements.sprayDensityControl = document.getElementById('sprayDensityControl');
        this.elements.shapeFillStyle = document.getElementById('shapeFillStyle');
        this.elements.shapeFillControl = document.getElementById('shapeFillControl');
        this.elements.gradientControl = document.getElementById('gradientControl');
        this.elements.gradientType = document.getElementById('gradientType');

        // Canvas controls
        this.elements.canvasWidth = document.getElementById('canvasWidth');
        this.elements.canvasHeight = document.getElementById('canvasHeight');
        this.elements.clearBtn = document.getElementById('clearBtn');
        this.elements.gridToggleBtn = document.getElementById('gridToggleBtn');
        this.elements.snapToggle = document.getElementById('snapToggle');
        this.elements.antiAliasToggle = document.getElementById('antiAliasToggle');
        this.elements.zoomInBtn = document.getElementById('zoomInBtn');
        this.elements.zoomOutBtn = document.getElementById('zoomOutBtn');
        this.elements.zoomResetBtn = document.getElementById('zoomResetBtn');
        this.elements.flipHorizontalBtn = document.getElementById('flipHorizontalBtn');
        this.elements.flipVerticalBtn = document.getElementById('flipVerticalBtn');
        this.elements.pixelSize = document.getElementById('pixelSize');
        this.elements.pixelSizeValue = document.getElementById('pixelSizeValue');
        this.elements.sidebarToggle = document.getElementById('sidebarToggle');

        // Layer elements
        this.elements.layersList = document.getElementById('layersList');
        this.elements.layerCount = document.getElementById('layerCount');
        this.elements.addLayerBtn = document.getElementById('addLayerBtn');
        this.elements.deleteLayerBtn = document.getElementById('deleteLayerBtn');
        this.elements.duplicateLayerBtn = document.getElementById('duplicateLayerBtn');
        this.elements.mergeLayerBtn = document.getElementById('mergeLayerBtn');
        this.elements.toggleVisibilityBtn = document.getElementById('toggleVisibilityBtn');
        this.elements.lockLayerBtn = document.getElementById('lockLayerBtn');
        this.elements.layerOpacity = document.getElementById('layerOpacity');
        this.elements.layerOpacityValue = document.getElementById('layerOpacityValue');
        this.elements.blendMode = document.getElementById('blendMode');
        this.elements.layerName = document.getElementById('layerName');

        // Effects elements
        this.elements.effectBtns = document.querySelectorAll('.effect-btn');

        // Export elements
        this.elements.exportBtns = document.querySelectorAll('.export-options .option-btn');
        this.elements.downloadBtn = document.getElementById('downloadBtn');
        this.elements.copyBtn = document.getElementById('copyBtn');
        this.elements.shareBtn = document.getElementById('shareBtn');
        this.elements.customBgColor = document.getElementById('customBgColor');
        this.elements.customBgContainer = document.getElementById('customBgContainer');
        this.elements.gifDelay = document.getElementById('gifDelay');
        this.elements.gifDelayValue = document.getElementById('gifDelayValue');
        this.elements.gifLoops = document.getElementById('gifLoops');
        this.elements.gifLoopsValue = document.getElementById('gifLoopsValue');

        // Import elements
        this.elements.importFile = document.getElementById('importFile');
        this.elements.importOptions = document.querySelectorAll('.import-form .option-btn');
        this.elements.resizeMethod = document.getElementById('resizeMethod');
        this.elements.ditheringMethod = document.getElementById('ditheringMethod');
        this.elements.colorReduction = document.getElementById('colorReduction');
        this.elements.confirmImportBtn = document.getElementById('confirmImportBtn');
        this.elements.cancelImportBtn = document.getElementById('cancelImportBtn');

        // Resize elements
        this.elements.resizeWidth = document.getElementById('resizeWidth');
        this.elements.resizeHeight = document.getElementById('resizeHeight');
        this.elements.anchorBtns = document.querySelectorAll('.anchor-btn');
        this.elements.resizeBg = document.getElementById('resizeBg');
        this.elements.resizeOptions = document.querySelectorAll('.resize-form .option-btn');
        this.elements.confirmResizeBtn = document.getElementById('confirmResizeBtn');
        this.elements.cancelResizeBtn = document.getElementById('cancelResizeBtn');

        // Animation elements
        this.elements.animationTimeline = document.getElementById('animationTimeline');
        this.elements.addFrameBtn = document.getElementById('addFrameBtn');
        this.elements.removeFrameBtn = document.getElementById('removeFrameBtn');
        this.elements.duplicateFrameBtn = document.getElementById('duplicateFrameBtn');
        this.elements.playAnimationBtn = document.getElementById('playAnimationBtn');
        this.elements.stopAnimationBtn = document.getElementById('stopAnimationBtn');
        this.elements.frameDelay = document.getElementById('frameDelay');
        this.elements.frameDelayValue = document.getElementById('frameDelayValue');
        this.elements.loopCount = document.getElementById('loopCount');
        this.elements.loopCountValue = document.getElementById('loopCountValue');
        this.elements.onionOpacity = document.getElementById('onionOpacity');
        this.elements.onionOpacityValue = document.getElementById('onionOpacityValue');
        this.elements.exportAnimationBtn = document.getElementById('exportAnimationBtn');
        this.elements.closeAnimationBtn = document.getElementById('closeAnimationBtn');
        this.elements.animationBtn = document.getElementById('animationBtn');

        // Text tool elements
        this.elements.textInput = document.getElementById('textInput');
        this.elements.textSize = document.getElementById('textSize');
        this.elements.textStyle = document.getElementById('textStyle');
        this.elements.textAlign = document.getElementById('textAlign');
        this.elements.textAntiAlias = document.getElementById('textAntiAlias');
        this.elements.insertTextBtn = document.getElementById('insertTextBtn');
        this.elements.cancelTextBtn = document.getElementById('cancelTextBtn');

        // Gradient elements
        this.elements.gradientPreview = document.getElementById('gradientPreview');
        this.elements.gradientStops = document.getElementById('gradientStops');
        this.elements.gradientTypeSelect = document.getElementById('gradientTypeSelect');
        this.elements.gradientAngle = document.getElementById('gradientAngle');
        this.elements.gradientAngleValue = document.getElementById('gradientAngleValue');
        this.elements.gradientRepeat = document.getElementById('gradientRepeat');
        this.elements.applyGradientBtn = document.getElementById('applyGradientBtn');
        this.elements.cancelGradientBtn = document.getElementById('cancelGradientBtn');

        // UI elements
        this.elements.canvasSizeDisplay = document.getElementById('canvasSizeDisplay');
        this.elements.canvasDimensions = document.getElementById('canvasDimensions');
        this.elements.zoomLevel = document.getElementById('zoomLevel');
        this.elements.cursorPosition = document.getElementById('cursorPosition');
        this.elements.memoryUsage = document.getElementById('memoryUsage');
        this.elements.historyCount = document.getElementById('historyCount');
        this.elements.fpsCounter = document.getElementById('fpsCounter');

        // Modal elements
        this.modals.export = document.getElementById('exportModal');
        this.modals.newProject = document.getElementById('newProjectModal');
        this.modals.help = document.getElementById('helpModal');
        this.modals.import = document.getElementById('importModal');
        this.modals.resize = document.getElementById('resizeModal');
        this.modals.animation = document.getElementById('animationModal');
        this.modals.text = document.getElementById('textModal');
        this.modals.gradient = document.getElementById('gradientModal');

        // Button elements
        this.elements.newBtn = document.getElementById('newBtn');
        this.elements.saveBtn = document.getElementById('saveBtn');
        this.elements.openBtn = document.getElementById('openBtn');
        this.elements.exportBtn = document.getElementById('exportBtn');
        this.elements.importBtn = document.getElementById('importBtn');
        this.elements.undoBtn = document.getElementById('undoBtn');
        this.elements.redoBtn = document.getElementById('redoBtn');
        this.elements.fullscreenBtn = document.getElementById('fullscreenBtn');
        this.elements.helpBtn = document.getElementById('helpBtn');
        this.elements.optimizeBtn = document.getElementById('optimizeBtn');
        this.elements.paletteBtn = document.getElementById('paletteBtn');
        this.elements.projectFileInput = document.getElementById('projectFileInput');

        // Close buttons
        this.elements.closeExportModal = document.getElementById('closeExportModal');
        this.elements.closeNewProjectModal = document.getElementById('closeNewProjectModal');
        this.elements.closeHelpModal = document.getElementById('closeHelpModal');
        this.elements.closeImportModal = document.getElementById('closeImportModal');
        this.elements.closeResizeModal = document.getElementById('closeResizeModal');
        this.elements.closeAnimationModal = document.getElementById('closeAnimationModal');
        this.elements.closeTextModal = document.getElementById('closeTextModal');
        this.elements.closeGradientModal = document.getElementById('closeGradientModal');

        // Create buttons
        this.elements.createProjectBtn = document.getElementById('createProjectBtn');
        this.elements.cancelProjectBtn = document.getElementById('cancelProjectBtn');
    }

    initCanvas() {
        this.updateCanvasSize();
        this.createCanvasGrid();
        this.updateGridOverlay();
    }

    updateCanvasSize() {
        const width = parseInt(this.elements.canvasWidth.value) || 32;
        const height = parseInt(this.elements.canvasHeight.value) || 32;
        
        this.canvas.width = width;
        this.canvas.height = height;
        
        this.elements.canvasSizeDisplay.textContent = `${width}x${height}`;
        this.elements.canvasDimensions.textContent = `${width}x${height}`;
        
        this.createCanvasGrid();
        this.saveHistory();
    }

    createCanvasGrid() {
        const { width, height, pixelSize } = this.canvas;
        const zoom = this.state.zoom;
        const scaledPixelSize = pixelSize * zoom;
        
        // Update grid template
        this.elements.canvas.style.gridTemplateColumns = `repeat(${width}, ${scaledPixelSize}px)`;
        this.elements.canvas.style.gridTemplateRows = `repeat(${height}, ${scaledPixelSize}px)`;
        this.elements.canvas.style.width = `${width * scaledPixelSize}px`;
        this.elements.canvas.style.height = `${height * scaledPixelSize}px`;
        this.elements.canvas.innerHTML = '';
        
        // Create pixel elements
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const pixel = document.createElement('div');
                pixel.className = 'pixel';
                pixel.dataset.x = x;
                pixel.dataset.y = y;
                pixel.dataset.index = y * width + x;
                
                // Set pixel size
                pixel.style.width = `${scaledPixelSize}px`;
                pixel.style.height = `${scaledPixelSize}px`;
                
                // Add event listeners
                pixel.addEventListener('mousedown', (e) => this.handlePixelMouseDown(e, pixel));
                pixel.addEventListener('mouseenter', (e) => this.handlePixelMouseEnter(e, pixel));
                pixel.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.handlePixelRightClick(e, pixel);
                });
                
                this.elements.canvas.appendChild(pixel);
            }
        }
        
        // Update pixel colors from layers
        this.updateAllPixels();
        this.updateGridOverlay();
    }

    updateGridOverlay() {
        const { pixelSize } = this.canvas;
        const zoom = this.state.zoom;
        const gridSize = pixelSize * zoom;
        
        this.elements.gridOverlay.style.setProperty('--grid-size', `${gridSize}px`);
        this.elements.gridOverlay.style.display = this.state.showGrid ? 'block' : 'none';
    }

    handlePixelMouseDown(e, pixel) {
        e.preventDefault();
        
        const x = parseInt(pixel.dataset.x);
        const y = parseInt(pixel.dataset.y);
        
        // Handle right click for color picker
        if (e.button === 2) {
            this.pickColor(x, y);
            return;
        }
        
        // Handle selection
        if (this.selection.active && this.isPointInSelection(x, y)) {
            this.startSelectionMove(x, y);
            return;
        }
        
        // Clear selection if clicking outside
        if (this.selection.active) {
            this.clearSelection();
        }
        
        // Handle different tools
        switch(this.state.tool) {
            case 'picker':
                this.pickColor(x, y);
                break;
            case 'select':
                this.startSelection(x, y);
                break;
            case 'move':
                if (this.selection.active) {
                    this.startSelectionMove(x, y);
                }
                break;
            case 'text':
                this.openTextModal(x, y);
                break;
            case 'gradient':
                this.openGradientModal(x, y);
                break;
            default:
                this.startDrawing(x, y);
        }
    }

    handlePixelMouseEnter(e, pixel) {
        if (!e.buttons) return;
        
        const x = parseInt(pixel.dataset.x);
        const y = parseInt(pixel.dataset.y);
        
        if (this.state.isDrawing) {
            this.continueDrawing(x, y);
        } else if (this.state.isSelecting) {
            this.updateSelection(x, y);
        } else if (this.selection.moving) {
            this.updateSelectionMove(x, y);
        } else if (this.selection.resizing) {
            this.updateSelectionResize(x, y);
        }
    }

    handlePixelRightClick(e, pixel) {
        e.preventDefault();
        const x = parseInt(pixel.dataset.x);
        const y = parseInt(pixel.dataset.y);
        this.pickColor(x, y);
    }

    startDrawing(x, y) {
        if (this.layers.length === 0 || !this.layers[this.currentLayer].visible || this.layers[this.currentLayer].locked) {
            return;
        }
        
        this.state.isDrawing = true;
        this.state.startX = x;
        this.state.startY = y;
        this.state.lastX = x;
        this.state.lastY = y;
        
        // For shape tools, save current state
        if (['line', 'rectangle', 'circle'].includes(this.state.tool)) {
            this.state.isShapeDrawing = true;
            const layer = this.layers[this.currentLayer];
            if (layer) {
                this.state.tempPixels = [...layer.pixels];
                this.state.previewPixels = [...layer.pixels];
            }
        }
        
        this.drawAt(x, y);
    }

    continueDrawing(x, y) {
        if (!this.state.isDrawing) return;
        
        // For shape tools, show preview
        if (this.state.isShapeDrawing) {
            const layer = this.layers[this.currentLayer];
            if (layer) {
                // Restore original pixels
                layer.pixels = [...this.state.tempPixels];
                this.state.previewPixels = [...this.state.tempPixels];
                
                // Draw preview
                this.drawShapePreview(x, y);
                
                // Update canvas with preview
                this.updateCanvasWithPixels(this.state.previewPixels);
            }
        } else {
            // For regular tools, draw continuously
            this.drawAt(x, y);
        }
        
        this.state.lastX = x;
        this.state.lastY = y;
    }

    stopDrawing() {
        if (!this.state.isDrawing) return;
        
        // For shape tools, commit the shape
        if (this.state.isShapeDrawing) {
            const layer = this.layers[this.currentLayer];
            if (layer) {
                layer.pixels = [...this.state.previewPixels];
            }
        }
        
        this.state.isDrawing = false;
        this.state.isShapeDrawing = false;
        this.state.tempPixels = null;
        this.state.previewPixels = null;
        this.updateAllPixels();
        this.saveHistory();
        this.updateUI();
    }

    drawAt(x, y) {
        const { tool, color, brushSize, opacity, sprayDensity } = this.state;
        
        if (this.layers.length === 0) return;
        
        const layer = this.layers[this.currentLayer];
        if (!layer.visible || layer.locked) return;
        
        // Handle different tools
        switch(tool) {
            case 'pencil':
                this.drawPencil(x, y, layer);
                break;
            case 'eraser':
                this.drawEraser(x, y, layer);
                break;
            case 'spray':
                this.drawSpray(x, y, layer, sprayDensity);
                break;
            case 'bucket':
                this.fillArea(x, y, layer);
                break;
            case 'line':
            case 'rectangle':
            case 'circle':
                // Handled in shape preview
                break;
            default:
                this.drawPencil(x, y, layer);
        }
        
        this.updateAllPixels();
    }

    drawShapePreview(x, y) {
        const { tool, startX, startY } = this.state;
        
        switch(tool) {
            case 'line':
                this.drawLine(this.state.previewPixels, startX, startY, x, y);
                break;
            case 'rectangle':
                this.drawRectangle(this.state.previewPixels, startX, startY, x, y);
                break;
            case 'circle':
                this.drawCircle(this.state.previewPixels, startX, startY, x, y);
                break;
        }
    }

    drawPencil(x, y, layer) {
        const { color, brushSize, opacity } = this.state;
        const radius = Math.floor(brushSize / 2);
        const rgbaColor = this.getColorWithOpacity(color, opacity / 100);
        
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                if (brushSize === 1 || Math.sqrt(dx*dx + dy*dy) <= radius) {
                    const targetX = x + dx;
                    const targetY = y + dy;
                    
                    if (this.isInBounds(targetX, targetY)) {
                        const index = targetY * this.canvas.width + targetX;
                        layer.pixels[index] = rgbaColor;
                    }
                }
            }
        }
    }

    drawEraser(x, y, layer) {
        const { brushSize } = this.state;
        const radius = Math.floor(brushSize / 2);
        
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                if (brushSize === 1 || Math.sqrt(dx*dx + dy*dy) <= radius) {
                    const targetX = x + dx;
                    const targetY = y + dy;
                    
                    if (this.isInBounds(targetX, targetY)) {
                        const index = targetY * this.canvas.width + targetX;
                        layer.pixels[index] = null;
                    }
                }
            }
        }
    }

    drawSpray(x, y, layer, density) {
        const { color, brushSize, opacity } = this.state;
        const radius = Math.floor(brushSize / 2);
        const numDots = Math.max(1, Math.floor((density / 100) * brushSize * brushSize * 0.3));
        const rgbaColor = this.getColorWithOpacity(color, opacity / 100);
        
        for (let i = 0; i < numDots; i++) {
            const angle = Math.random() * 2 * Math.PI;
            const r = Math.random() * radius;
            const dx = Math.floor(Math.cos(angle) * r);
            const dy = Math.floor(Math.sin(angle) * r);
            const targetX = x + dx;
            const targetY = y + dy;
            
            if (this.isInBounds(targetX, targetY)) {
                const index = targetY * this.canvas.width + targetX;
                layer.pixels[index] = rgbaColor;
            }
        }
    }

    fillArea(x, y, layer) {
        const { color, opacity } = this.state;
        const targetIndex = y * this.canvas.width + x;
        const targetColor = layer.pixels[targetIndex];
        const fillColor = this.getColorWithOpacity(color, opacity / 100);
        
        // If same color, return
        if (targetColor === fillColor) return;
        
        const queue = [[x, y]];
        const visited = new Set();
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        while (queue.length > 0) {
            const [cx, cy] = queue.shift();
            const key = `${cx},${cy}`;
            
            if (visited.has(key) || !this.isInBounds(cx, cy)) continue;
            
            visited.add(key);
            const index = cy * width + cx;
            
            if (layer.pixels[index] === targetColor) {
                layer.pixels[index] = fillColor;
                
                // Add neighbors
                queue.push([cx + 1, cy]);
                queue.push([cx - 1, cy]);
                queue.push([cx, cy + 1]);
                queue.push([cx, cy - 1]);
            }
        }
    }

    drawLine(pixels, x1, y1, x2, y2) {
        const { color, opacity, brushSize } = this.state;
        const rgbaColor = this.getColorWithOpacity(color, opacity / 100);
        
        // Bresenham's line algorithm
        const dx = Math.abs(x2 - x1);
        const dy = Math.abs(y2 - y1);
        const sx = (x1 < x2) ? 1 : -1;
        const sy = (y1 < y2) ? 1 : -1;
        let err = dx - dy;
        let x = x1;
        let y = y1;
        
        while (true) {
            // Draw with brush size
            const radius = Math.floor(brushSize / 2);
            for (let dy = -radius; dy <= radius; dy++) {
                for (let dx = -radius; dx <= radius; dx++) {
                    const tx = x + dx;
                    const ty = y + dy;
                    if (this.isInBounds(tx, ty) && (brushSize === 1 || Math.sqrt(dx*dx + dy*dy) <= radius)) {
                        const index = ty * this.canvas.width + tx;
                        pixels[index] = rgbaColor;
                    }
                }
            }
            
            if (x === x2 && y === y2) break;
            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x += sx;
            }
            if (e2 < dx) {
                err += dx;
                y += sy;
            }
        }
    }

    drawRectangle(pixels, x1, y1, x2, y2) {
        const { color, opacity, brushSize, shapeFillStyle } = this.state;
        const rgbaColor = this.getColorWithOpacity(color, opacity / 100);
        const startX = Math.min(x1, x2);
        const endX = Math.max(x1, x2);
        const startY = Math.min(y1, y2);
        const endY = Math.max(y1, y2);
        
        for (let y = startY; y <= endY; y++) {
            for (let x = startX; x <= endX; x++) {
                if (this.isInBounds(x, y)) {
                    const isBorder = y === startY || y === endY || x === startX || x === endX;
                    const shouldDraw = (shapeFillStyle === 'outline' && isBorder) ||
                                      (shapeFillStyle === 'filled' && !isBorder) ||
                                      (shapeFillStyle === 'both');
                    
                    if (shouldDraw) {
                        const index = y * this.canvas.width + x;
                        pixels[index] = rgbaColor;
                    }
                }
            }
        }
    }

    drawCircle(pixels, x1, y1, x2, y2) {
        const { color, opacity, brushSize, shapeFillStyle } = this.state;
        const rgbaColor = this.getColorWithOpacity(color, opacity / 100);
        const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        const centerX = x1;
        const centerY = y1;
        
        for (let y = Math.floor(centerY - radius); y <= Math.ceil(centerY + radius); y++) {
            for (let x = Math.floor(centerX - radius); x <= Math.ceil(centerX + radius); x++) {
                if (this.isInBounds(x, y)) {
                    const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
                    const isBorder = Math.abs(distance - radius) <= 0.5;
                    const shouldDraw = (shapeFillStyle === 'outline' && isBorder) ||
                                      (shapeFillStyle === 'filled' && distance <= radius) ||
                                      (shapeFillStyle === 'both' && distance <= radius);
                    
                    if (shouldDraw) {
                        const index = y * this.canvas.width + x;
                        pixels[index] = rgbaColor;
                    }
                }
            }
        }
    }

    startSelection(x, y) {
        this.state.isSelecting = true;
        this.state.startX = x;
        this.state.startY = y;
        this.selection.active = true;
        this.selection.x = x;
        this.selection.y = y;
        this.selection.width = 1;
        this.selection.height = 1;
        
        this.updateSelectionOverlay();
        this.showSelectionHandles();
    }

    updateSelection(x, y) {
        if (!this.state.isSelecting) return;
        
        const startX = Math.min(this.state.startX, x);
        const startY = Math.min(this.state.startY, y);
        const endX = Math.max(this.state.startX, x);
        const endY = Math.max(this.state.startY, y);
        
        this.selection.x = startX;
        this.selection.y = startY;
        this.selection.width = endX - startX + 1;
        this.selection.height = endY - startY + 1;
        
        this.updateSelectionOverlay();
    }

    finalizeSelection() {
        if (!this.state.isSelecting) return;
        
        this.state.isSelecting = false;
        
        // Store selected pixels
        this.saveSelectionPixels();
        this.showNotification(`Selected ${this.selection.width}x${this.selection.height} area`, 'info');
    }

    saveSelectionPixels() {
        const layer = this.layers[this.currentLayer];
        if (!layer) return;
        
        this.selection.pixels = [];
        for (let y = 0; y < this.selection.height; y++) {
            for (let x = 0; x < this.selection.width; x++) {
                const canvasX = this.selection.x + x;
                const canvasY = this.selection.y + y;
                if (this.isInBounds(canvasX, canvasY)) {
                    const index = canvasY * this.canvas.width + canvasX;
                    this.selection.pixels.push({
                        x: x,
                        y: y,
                        color: layer.pixels[index]
                    });
                }
            }
        }
    }

    isPointInSelection(x, y) {
        return x >= this.selection.x && x < this.selection.x + this.selection.width &&
               y >= this.selection.y && y < this.selection.y + this.selection.height;
    }

    startSelectionMove(x, y) {
        if (!this.selection.active || !this.selection.pixels) return;
        
        this.selection.moving = true;
        this.selection.startX = x;
        this.selection.startY = y;
        this.selection.layer = [...this.layers[this.currentLayer].pixels];
    }

    updateSelectionMove(x, y) {
        if (!this.selection.moving) return;
        
        const dx = x - this.selection.startX;
        const dy = y - this.selection.startY;
        
        // Clear original selection area
        const layer = this.layers[this.currentLayer];
        if (layer && this.selection.layer) {
            layer.pixels = [...this.selection.layer];
            
            // Draw selection at new position
            this.selection.pixels.forEach(pixel => {
                const canvasX = this.selection.x + dx + pixel.x;
                const canvasY = this.selection.y + dy + pixel.y;
                if (this.isInBounds(canvasX, canvasY)) {
                    const index = canvasY * this.canvas.width + canvasX;
                    layer.pixels[index] = pixel.color;
                }
            });
            
            this.updateAllPixels();
            
            // Update selection position
            this.selection.x += dx;
            this.selection.y += dy;
            this.selection.startX = x;
            this.selection.startY = y;
            this.updateSelectionOverlay();
        }
    }

    stopSelectionMove() {
        if (!this.selection.moving) return;
        
        this.selection.moving = false;
        this.saveSelectionPixels();
        this.saveHistory();
    }

    clearSelection() {
        this.selection.active = false;
        this.selection.moving = false;
        this.selection.resizing = false;
        this.selection.pixels = null;
        this.selection.layer = null;
        this.elements.selectionOverlay.style.display = 'none';
        this.clearSelectionHandles();
    }

    updateSelectionOverlay() {
        if (!this.selection.active) return;
        
        const { x, y, width, height } = this.selection;
        const scaledPixelSize = this.canvas.pixelSize * this.state.zoom;
        
        this.elements.selectionOverlay.style.display = 'block';
        this.elements.selectionOverlay.style.left = `${x * scaledPixelSize}px`;
        this.elements.selectionOverlay.style.top = `${y * scaledPixelSize}px`;
        this.elements.selectionOverlay.style.width = `${width * scaledPixelSize}px`;
        this.elements.selectionOverlay.style.height = `${height * scaledPixelSize}px`;
    }

    showSelectionHandles() {
        this.clearSelectionHandles();
        
        if (!this.selection.active) return;
        
        const handles = ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'];
        handles.forEach(handle => {
            const handleEl = document.createElement('div');
            handleEl.className = `selection-handle ${handle}`;
            handleEl.dataset.handle = handle;
            handleEl.addEventListener('mousedown', (e) => this.startSelectionResize(e, handle));
            this.elements.selectionOverlay.appendChild(handleEl);
        });
    }

    clearSelectionHandles() {
        const handles = this.elements.selectionOverlay.querySelectorAll('.selection-handle');
        handles.forEach(handle => handle.remove());
    }

    startSelectionResize(e, handle) {
        e.stopPropagation();
        this.selection.resizing = true;
        this.selection.handle = handle;
        this.selection.startX = e.clientX;
        this.selection.startY = e.clientY;
        this.selection.original = {
            x: this.selection.x,
            y: this.selection.y,
            width: this.selection.width,
            height: this.selection.height
        };
    }

    updateSelectionResize(x, y) {
        if (!this.selection.resizing) return;
        
        const dx = x - this.selection.startX;
        const dy = y - this.selection.startY;
        const scaledPixelSize = this.canvas.pixelSize * this.state.zoom;
        const deltaX = Math.round(dx / scaledPixelSize);
        const deltaY = Math.round(dy / scaledPixelSize);
        
        const { original, handle } = this.selection;
        
        switch(handle) {
            case 'nw':
                this.selection.x = original.x + deltaX;
                this.selection.y = original.y + deltaY;
                this.selection.width = original.width - deltaX;
                this.selection.height = original.height - deltaY;
                break;
            case 'n':
                this.selection.y = original.y + deltaY;
                this.selection.height = original.height - deltaY;
                break;
            case 'ne':
                this.selection.y = original.y + deltaY;
                this.selection.width = original.width + deltaX;
                this.selection.height = original.height - deltaY;
                break;
            case 'w':
                this.selection.x = original.x + deltaX;
                this.selection.width = original.width - deltaX;
                break;
            case 'e':
                this.selection.width = original.width + deltaX;
                break;
            case 'sw':
                this.selection.x = original.x + deltaX;
                this.selection.width = original.width - deltaX;
                this.selection.height = original.height + deltaY;
                break;
            case 's':
                this.selection.height = original.height + deltaY;
                break;
            case 'se':
                this.selection.width = original.width + deltaX;
                this.selection.height = original.height + deltaY;
                break;
        }
        
        // Ensure minimum size
        this.selection.width = Math.max(1, this.selection.width);
        this.selection.height = Math.max(1, this.selection.height);
        
        this.updateSelectionOverlay();
    }

    stopSelectionResize() {
        if (!this.selection.resizing) return;
        
        this.selection.resizing = false;
        this.selection.handle = null;
        this.saveSelectionPixels();
        this.saveHistory();
    }

    pickColor(x, y) {
        const layer = this.layers[this.currentLayer];
        if (!layer) return;
        
        const index = y * this.canvas.width + x;
        const color = layer.pixels[index];
        
        if (color) {
            // Extract hex color from rgba
            const hex = this.rgbaToHex(color);
            this.setColor(hex);
            this.showNotification(`Picked color: ${hex}`, 'success');
        } else {
            // Transparent color
            this.setColor('#00000000');
            this.showNotification('Picked transparent color', 'info');
        }
    }

    isInBounds(x, y) {
        return x >= 0 && x < this.canvas.width && y >= 0 && y < this.canvas.height;
    }

    getColorWithOpacity(color, opacity) {
        if (color === 'transparent' || color === null || color === undefined) {
            return 'transparent';
        }
        
        if (color.startsWith('#')) {
            if (color.length === 9) { // #RRGGBBAA
                const r = parseInt(color.slice(1, 3), 16);
                const g = parseInt(color.slice(3, 5), 16);
                const b = parseInt(color.slice(5, 7), 16);
                const a = parseInt(color.slice(7, 9), 16) / 255 * opacity;
                return `rgba(${r}, ${g}, ${b}, ${a})`;
            } else { // #RRGGBB
                const r = parseInt(color.slice(1, 3), 16);
                const g = parseInt(color.slice(3, 5), 16);
                const b = parseInt(color.slice(5, 7), 16);
                return `rgba(${r}, ${g}, ${b}, ${opacity})`;
            }
        } else if (color.startsWith('rgba')) {
            const match = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
            if (match) {
                const r = match[1];
                const g = match[2];
                const b = match[3];
                const a = parseFloat(match[4]) * opacity;
                return `rgba(${r}, ${g}, ${b}, ${a})`;
            }
        } else if (color.startsWith('rgb')) {
            const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
            if (match) {
                const r = match[1];
                const g = match[2];
                const b = match[3];
                return `rgba(${r}, ${g}, ${b}, ${opacity})`;
            }
        }
        return color;
    }

    rgbaToHex(rgba) {
        if (rgba === 'transparent' || !rgba) return '#00000000';
        
        const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (match) {
            const r = parseInt(match[1]).toString(16).padStart(2, '0');
            const g = parseInt(match[2]).toString(16).padStart(2, '0');
            const b = parseInt(match[3]).toString(16).padStart(2, '0');
            const a = match[4] ? Math.round(parseFloat(match[4]) * 255).toString(16).padStart(2, '0') : 'ff';
            return `#${r}${g}${b}${a}`;
        }
        return '#00000000';
    }

    updatePixel(pixel) {
        const x = parseInt(pixel.dataset.x);
        const y = parseInt(pixel.dataset.y);
        const index = y * this.canvas.width + x;
        
        let finalColor = 'transparent';
        
        // Find the topmost visible layer with color at this pixel
        for (let i = this.layers.length - 1; i >= 0; i--) {
            const layer = this.layers[i];
            if (layer.visible && layer.pixels[index]) {
                const layerColor = layer.pixels[index];
                const layerOpacity = layer.opacity / 100;
                
                if (finalColor === 'transparent') {
                    finalColor = this.applyOpacity(layerColor, layerOpacity);
                } else {
                    finalColor = this.blendColors(finalColor, layerColor, layerOpacity, layer.blendMode);
                }
            }
        }
        
        // Apply canvas background if pixel is transparent
        if (finalColor === 'transparent') {
            finalColor = this.canvas.backgroundColor;
        }
        
        pixel.style.backgroundColor = finalColor;
        
        // Show grid if enabled
        if (this.state.showGrid) {
            if (finalColor === 'transparent' || finalColor === this.canvas.backgroundColor) {
                pixel.style.border = '1px solid rgba(255, 255, 255, 0.1)';
            } else {
                pixel.style.border = '1px solid rgba(0, 0, 0, 0.2)';
            }
        } else {
            pixel.style.border = 'none';
        }
    }

    updateAllPixels() {
        const pixels = this.elements.canvas.querySelectorAll('.pixel');
        pixels.forEach(pixel => this.updatePixel(pixel));
    }

    updateCanvasWithPixels(pixels) {
        const layer = this.layers[this.currentLayer];
        if (!layer) return;
        
        const originalPixels = [...layer.pixels];
        layer.pixels = pixels;
        this.updateAllPixels();
        layer.pixels = originalPixels;
    }

    applyOpacity(color, opacity) {
        if (color === 'transparent') return 'transparent';
        
        const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (match) {
            const r = match[1];
            const g = match[2];
            const b = match[3];
            const a = match[4] ? parseFloat(match[4]) * opacity : opacity;
            return `rgba(${r}, ${g}, ${b}, ${a})`;
        }
        return color;
    }

    blendColors(bgColor, fgColor, opacity, blendMode = 'normal') {
        if (fgColor === 'transparent') return bgColor;
        if (bgColor === 'transparent') return this.applyOpacity(fgColor, opacity);
        
        const bg = this.parseColor(bgColor);
        const fg = this.parseColor(fgColor);
        
        let r, g, b;
        const a = fg.a * opacity + bg.a * (1 - opacity);
        
        switch(blendMode) {
            case 'multiply':
                r = Math.round((bg.r * fg.r) / 255);
                g = Math.round((bg.g * fg.g) / 255);
                b = Math.round((bg.b * fg.b) / 255);
                break;
            case 'screen':
                r = Math.round(255 - ((255 - bg.r) * (255 - fg.r)) / 255);
                g = Math.round(255 - ((255 - bg.g) * (255 - fg.g)) / 255);
                b = Math.round(255 - ((255 - bg.b) * (255 - fg.b)) / 255);
                break;
            case 'overlay':
                r = bg.r < 128 ? 
                    Math.round(2 * bg.r * fg.r / 255) :
                    Math.round(255 - 2 * (255 - bg.r) * (255 - fg.r) / 255);
                g = bg.g < 128 ? 
                    Math.round(2 * bg.g * fg.g / 255) :
                    Math.round(255 - 2 * (255 - bg.g) * (255 - fg.g) / 255);
                b = bg.b < 128 ? 
                    Math.round(2 * bg.b * fg.b / 255) :
                    Math.round(255 - 2 * (255 - bg.b) * (255 - fg.b) / 255);
                break;
            case 'darken':
                r = Math.min(bg.r, fg.r);
                g = Math.min(bg.g, fg.g);
                b = Math.min(bg.b, fg.b);
                break;
            case 'lighten':
                r = Math.max(bg.r, fg.r);
                g = Math.max(bg.g, fg.g);
                b = Math.max(bg.b, fg.b);
                break;
            case 'color-dodge':
                r = bg.r === 0 ? 0 : Math.min(255, (fg.r * 255) / (255 - bg.r));
                g = bg.g === 0 ? 0 : Math.min(255, (fg.g * 255) / (255 - bg.g));
                b = bg.b === 0 ? 0 : Math.min(255, (fg.b * 255) / (255 - bg.b));
                break;
            case 'color-burn':
                r = bg.r === 255 ? 255 : Math.max(0, 255 - ((255 - fg.r) * 255) / bg.r);
                g = bg.g === 255 ? 255 : Math.max(0, 255 - ((255 - fg.g) * 255) / bg.g);
                b = bg.b === 255 ? 255 : Math.max(0, 255 - ((255 - fg.b) * 255) / bg.b);
                break;
            case 'hard-light':
                r = fg.r < 128 ? 
                    Math.round(2 * bg.r * fg.r / 255) :
                    Math.round(255 - 2 * (255 - bg.r) * (255 - fg.r) / 255);
                g = fg.g < 128 ? 
                    Math.round(2 * bg.g * fg.g / 255) :
                    Math.round(255 - 2 * (255 - bg.g) * (255 - fg.g) / 255);
                b = fg.b < 128 ? 
                    Math.round(2 * bg.b * fg.b / 255) :
                    Math.round(255 - 2 * (255 - bg.b) * (255 - fg.b) / 255);
                break;
            case 'soft-light':
                r = fg.r < 128 ?
                    Math.round(bg.r - (255 - 2 * fg.r) * bg.r * (255 - bg.r) / (255 * 255)) :
                    Math.round(bg.r + (2 * fg.r - 255) * (this.gamma(bg.r) - bg.r) / 255);
                g = fg.g < 128 ?
                    Math.round(bg.g - (255 - 2 * fg.g) * bg.g * (255 - bg.g) / (255 * 255)) :
                    Math.round(bg.g + (2 * fg.g - 255) * (this.gamma(bg.g) - bg.g) / 255);
                b = fg.b < 128 ?
                    Math.round(bg.b - (255 - 2 * fg.b) * bg.b * (255 - bg.b) / (255 * 255)) :
                    Math.round(bg.b + (2 * fg.b - 255) * (this.gamma(bg.b) - bg.b) / 255);
                break;
            case 'difference':
                r = Math.abs(bg.r - fg.r);
                g = Math.abs(bg.g - fg.g);
                b = Math.abs(bg.b - fg.b);
                break;
            case 'exclusion':
                r = Math.round(bg.r + fg.r - (2 * bg.r * fg.r) / 255);
                g = Math.round(bg.g + fg.g - (2 * bg.g * fg.g) / 255);
                b = Math.round(bg.b + fg.b - (2 * bg.b * fg.b) / 255);
                break;
            case 'hue':
            case 'saturation':
            case 'color':
            case 'luminosity':
                // More complex blending modes
                const hslBg = this.rgbToHsl(bg.r, bg.g, bg.b);
                const hslFg = this.rgbToHsl(fg.r, fg.g, fg.b);
                let resultHsl;
                
                switch(blendMode) {
                    case 'hue':
                        resultHsl = [hslFg[0], hslBg[1], hslBg[2]];
                        break;
                    case 'saturation':
                        resultHsl = [hslBg[0], hslFg[1], hslBg[2]];
                        break;
                    case 'color':
                        resultHsl = [hslFg[0], hslFg[1], hslBg[2]];
                        break;
                    case 'luminosity':
                        resultHsl = [hslBg[0], hslBg[1], hslFg[2]];
                        break;
                }
                
                const rgb = this.hslToRgb(resultHsl[0], resultHsl[1], resultHsl[2]);
                r = rgb[0];
                g = rgb[1];
                b = rgb[2];
                break;
            default: // normal
                r = Math.round(fg.r * opacity + bg.r * (1 - opacity));
                g = Math.round(fg.g * opacity + bg.g * (1 - opacity));
                b = Math.round(fg.b * opacity + bg.b * (1 - opacity));
        }
        
        return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a})`;
    }

    gamma(value) {
        return value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
    }

    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch(max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        
        return [h, s, l];
    }

    hslToRgb(h, s, l) {
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    parseColor(color) {
        if (color === 'transparent') {
            return { r: 0, g: 0, b: 0, a: 0 };
        }
        
        if (color.startsWith('#')) {
            if (color.length === 9) { // #RRGGBBAA
                return {
                    r: parseInt(color.slice(1, 3), 16),
                    g: parseInt(color.slice(3, 5), 16),
                    b: parseInt(color.slice(5, 7), 16),
                    a: parseInt(color.slice(7, 9), 16) / 255
                };
            } else { // #RRGGBB
                return {
                    r: parseInt(color.slice(1, 3), 16),
                    g: parseInt(color.slice(3, 5), 16),
                    b: parseInt(color.slice(5, 7), 16),
                    a: 1
                };
            }
        } else if (color.startsWith('rgba')) {
            const match = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
            if (match) {
                return {
                    r: parseInt(match[1]),
                    g: parseInt(match[2]),
                    b: parseInt(match[3]),
                    a: parseFloat(match[4])
                };
            }
        } else if (color.startsWith('rgb')) {
            const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
            if (match) {
                return {
                    r: parseInt(match[1]),
                    g: parseInt(match[2]),
                    b: parseInt(match[3]),
                    a: 1
                };
            }
        }
        return { r: 0, g: 0, b: 0, a: 0 };
    }

    initLayers() {
        this.layers = [this.createLayer('Layer 1')];
        this.currentLayer = 0;
        this.updateLayersUI();
    }

    createLayer(name) {
        return {
            id: Date.now() + Math.random(),
            name: name,
            pixels: new Array(this.canvas.width * this.canvas.height).fill(null),
            visible: true,
            locked: false,
            opacity: 100,
            blendMode: 'normal'
        };
    }

    updateLayersUI() {
        this.elements.layersList.innerHTML = '';
        
        // Create layer items with drag and drop
        this.layers.forEach((layer, index) => {
            const layerItem = this.createLayerItem(layer, index);
            this.elements.layersList.appendChild(layerItem);
        });
        
        this.elements.layerCount.textContent = this.layers.length;
        
        // Update layer properties if current layer exists
        if (this.layers[this.currentLayer]) {
            const layer = this.layers[this.currentLayer];
            this.elements.layerOpacity.value = layer.opacity;
            this.elements.layerOpacityValue.textContent = `${layer.opacity}%`;
            this.elements.layerName.value = layer.name;
            this.elements.blendMode.value = layer.blendMode;
        }
        
        // Initialize drag and drop
        this.initLayerDragAndDrop();
    }

    createLayerItem(layer, index) {
        const layerItem = document.createElement('div');
        layerItem.className = `layer-item ${index === this.currentLayer ? 'active' : ''}`;
        layerItem.dataset.layerId = layer.id;
        layerItem.draggable = true;
        
        // Create preview canvas
        const previewCanvas = document.createElement('canvas');
        previewCanvas.width = 32;
        previewCanvas.height = 32;
        const previewCtx = previewCanvas.getContext('2d');
        this.drawLayerPreview(previewCtx, layer);
        
        layerItem.innerHTML = `
            <div class="layer-drag-handle">
                <i class="fas fa-grip-vertical"></i>
            </div>
            <div class="layer-preview">
                ${previewCanvas.outerHTML}
            </div>
            <div class="layer-info">
                <div class="layer-name">${layer.name}</div>
                <div class="layer-status">
                    <span>${layer.opacity}%</span>
                    <span>•</span>
                    <span>${layer.blendMode}</span>
                </div>
            </div>
            <div class="layer-visibility ${layer.visible ? '' : 'hidden'}" data-action="toggle-visibility">
                <i class="fas ${layer.visible ? 'fa-eye' : 'fa-eye-slash'}"></i>
            </div>
            <div class="layer-lock ${layer.locked ? 'locked' : ''}" data-action="toggle-lock">
                <i class="fas ${layer.locked ? 'fa-lock' : 'fa-unlock'}"></i>
            </div>
        `;
        
        // Add event listeners
        layerItem.addEventListener('click', (e) => {
            if (!e.target.closest('[data-action]')) {
                this.selectLayer(index);
            }
        });
        
        layerItem.addEventListener('dblclick', () => {
            this.editLayerName(index);
        });
        
        const visibilityBtn = layerItem.querySelector('[data-action="toggle-visibility"]');
        visibilityBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleLayerVisibility(index);
        });
        
        const lockBtn = layerItem.querySelector('[data-action="toggle-lock"]');
        lockBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleLayerLock(index);
        });
        
        return layerItem;
    }

    drawLayerPreview(ctx, layer) {
        // Draw checkered background
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(0, 0, 32, 32);
        ctx.fillStyle = '#3a3a3a';
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                if ((x + y) % 2 === 0) {
                    ctx.fillRect(x * 8, y * 8, 8, 8);
                }
            }
        }
        
        // Draw layer content
        const cellSize = Math.max(1, 32 / this.canvas.width);
        
        for (let y = 0; y < this.canvas.height; y++) {
            for (let x = 0; x < this.canvas.width; x++) {
                const pixelIndex = y * this.canvas.width + x;
                const color = layer.pixels[pixelIndex];
                
                if (color && color !== 'transparent') {
                    ctx.fillStyle = color;
                    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                }
            }
        }
    }

    initLayerDragAndDrop() {
        const layerItems = this.elements.layersList.querySelectorAll('.layer-item');
        
        layerItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', item.dataset.layerId);
                item.classList.add('dragging');
            });
            
            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
                layerItems.forEach(i => i.classList.remove('drag-over'));
            });
            
            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                item.classList.add('drag-over');
            });
            
            item.addEventListener('dragleave', () => {
                item.classList.remove('drag-over');
            });
            
            item.addEventListener('drop', (e) => {
                e.preventDefault();
                item.classList.remove('drag-over');
                
                const draggedId = e.dataTransfer.getData('text/plain');
                const targetId = item.dataset.layerId;
                
                if (draggedId !== targetId) {
                    this.reorderLayers(draggedId, targetId);
                }
            });
        });
    }

    reorderLayers(draggedId, targetId) {
        const draggedIndex = this.layers.findIndex(layer => layer.id.toString() === draggedId);
        const targetIndex = this.layers.findIndex(layer => layer.id.toString() === targetId);
        
        if (draggedIndex !== -1 && targetIndex !== -1) {
            // Reorder layers array
            const [draggedLayer] = this.layers.splice(draggedIndex, 1);
            this.layers.splice(targetIndex, 0, draggedLayer);
            
            // Update current layer index if needed
            if (this.currentLayer === draggedIndex) {
                this.currentLayer = targetIndex;
            } else if (this.currentLayer === targetIndex && draggedIndex > targetIndex) {
                this.currentLayer++;
            } else if (this.currentLayer === targetIndex && draggedIndex < targetIndex) {
                this.currentLayer--;
            }
            
            // Update UI
            this.updateLayersUI();
            this.updateAllPixels();
            this.saveHistory();
        }
    }

    selectLayer(index) {
        this.currentLayer = index;
        this.updateLayersUI();
        this.updateUI();
    }

    editLayerName(index) {
        const newName = prompt('Enter new layer name:', this.layers[index].name);
        if (newName && newName.trim()) {
            this.layers[index].name = newName.trim();
            this.updateLayersUI();
        }
    }

    addLayer() {
        const newLayer = this.createLayer(`Layer ${this.layers.length + 1}`);
        this.layers.push(newLayer);
        this.currentLayer = this.layers.length - 1;
        this.updateLayersUI();
        this.saveHistory();
        this.showNotification('New layer added', 'success');
    }

    deleteLayer() {
        if (this.layers.length <= 1) {
            this.showNotification('Cannot delete the last layer', 'error');
            return;
        }
        
        if (confirm('Delete this layer?')) {
            this.layers.splice(this.currentLayer, 1);
            this.currentLayer = Math.max(0, this.currentLayer - 1);
            this.updateLayersUI();
            this.updateAllPixels();
            this.saveHistory();
            this.showNotification('Layer deleted', 'info');
        }
    }

    duplicateLayer() {
        const sourceLayer = this.layers[this.currentLayer];
        const newLayer = {
            ...sourceLayer,
            id: Date.now() + Math.random(),
            name: `${sourceLayer.name} Copy`,
            pixels: [...sourceLayer.pixels]
        };
        
        this.layers.push(newLayer);
        this.currentLayer = this.layers.length - 1;
        this.updateLayersUI();
        this.saveHistory();
        this.showNotification('Layer duplicated', 'success');
    }

    mergeLayers() {
        if (this.layers.length <= 1) {
            this.showNotification('Need at least 2 layers to merge', 'error');
            return;
        }
        
        if (confirm('Merge all visible layers?')) {
            const mergedLayer = this.createLayer('Merged Layer');
            
            // Merge all visible layers
            for (let i = 0; i < this.layers.length; i++) {
                if (this.layers[i].visible) {
                    for (let j = 0; j < this.layers[i].pixels.length; j++) {
                        if (this.layers[i].pixels[j]) {
                            mergedLayer.pixels[j] = this.layers[i].pixels[j];
                        }
                    }
                }
            }
            
            // Remove all layers and add merged layer
            this.layers = [mergedLayer];
            this.currentLayer = 0;
            this.updateLayersUI();
            this.updateAllPixels();
            this.saveHistory();
            this.showNotification('Layers merged', 'success');
        }
    }

    toggleLayerVisibility(index = this.currentLayer) {
        if (this.layers[index]) {
            this.layers[index].visible = !this.layers[index].visible;
            this.updateLayersUI();
            this.updateAllPixels();
            this.showNotification(
                `Layer ${this.layers[index].visible ? 'shown' : 'hidden'}`,
                'info'
            );
        }
    }

    toggleLayerLock(index = this.currentLayer) {
        if (this.layers[index]) {
            this.layers[index].locked = !this.layers[index].locked;
            this.updateLayersUI();
            this.showNotification(
                `Layer ${this.layers[index].locked ? 'locked' : 'unlocked'}`,
                'info'
            );
        }
    }

    moveLayerUp() {
        if (this.currentLayer < this.layers.length - 1) {
            [this.layers[this.currentLayer], this.layers[this.currentLayer + 1]] = 
            [this.layers[this.currentLayer + 1], this.layers[this.currentLayer]];
            this.currentLayer++;
            this.updateLayersUI();
            this.updateAllPixels();
            this.saveHistory();
        }
    }

    moveLayerDown() {
        if (this.currentLayer > 0) {
            [this.layers[this.currentLayer], this.layers[this.currentLayer - 1]] = 
            [this.layers[this.currentLayer - 1], this.layers[this.currentLayer]];
            this.currentLayer--;
            this.updateLayersUI();
            this.updateAllPixels();
            this.saveHistory();
        }
    }

    initColorSystem() {
        // Set initial colors
        this.elements.colorPicker.value = this.state.color;
        this.elements.currentColorDisplay.style.backgroundColor = this.state.color;
        this.elements.previousColorDisplay.style.backgroundColor = this.state.previousColor;
        this.elements.currentColorHex.textContent = this.state.color.toUpperCase();
        
        // Generate color palette
        this.generateColorPalette();
        
        // Add initial recent colors
        this.addRecentColor('#ff0000');
        this.addRecentColor('#00ff00');
        this.addRecentColor('#0000ff');
        this.addRecentColor('#ffff00');
        this.addRecentColor('#ffffff');
        this.addRecentColor('#000000');
    }

    generateColorPalette() {
        this.elements.colorPalette.innerHTML = '';
        
        this.palette.forEach(color => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.style.backgroundColor = color;
            swatch.dataset.color = color;
            swatch.title = color;
            
            // Add tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'color-tooltip';
            tooltip.textContent = color;
            swatch.appendChild(tooltip);
            
            swatch.addEventListener('click', () => {
                this.setColor(color);
            });
            
            swatch.addEventListener('mouseenter', () => {
                tooltip.style.opacity = '1';
                tooltip.style.transform = 'translateY(-5px)';
            });
            
            swatch.addEventListener('mouseleave', () => {
                tooltip.style.opacity = '0';
                tooltip.style.transform = 'translateY(0)';
            });
            
            this.elements.colorPalette.appendChild(swatch);
        });
        
        this.updateActiveColorSwatch();
    }

    setColor(color) {
        this.state.previousColor = this.state.color;
        this.state.color = color;
        
        this.elements.colorPicker.value = color;
        this.elements.currentColorDisplay.style.backgroundColor = color;
        this.elements.previousColorDisplay.style.backgroundColor = this.state.previousColor;
        this.elements.currentColorHex.textContent = color.toUpperCase();
        
        this.addRecentColor(color);
        this.updateActiveColorSwatch();
    }

    addRecentColor(color) {
        // Remove if already exists
        const index = this.recentColors.indexOf(color);
        if (index > -1) {
            this.recentColors.splice(index, 1);
        }
        
        // Add to beginning
        this.recentColors.unshift(color);
        
        // Limit size
        if (this.recentColors.length > this.maxRecentColors) {
            this.recentColors.pop();
        }
        
        // Update UI
        this.updateRecentColorsUI();
    }

    updateRecentColorsUI() {
        this.elements.recentColors.innerHTML = '';
        
        this.recentColors.forEach(color => {
            const colorDiv = document.createElement('div');
            colorDiv.className = 'recent-color';
            colorDiv.style.backgroundColor = color;
            colorDiv.title = color;
            colorDiv.addEventListener('click', () => this.setColor(color));
            this.elements.recentColors.appendChild(colorDiv);
        });
    }

    updateActiveColorSwatch() {
        const swatches = this.elements.colorPalette.querySelectorAll('.color-swatch');
        swatches.forEach(swatch => {
            swatch.classList.remove('active');
            if (swatch.dataset.color === this.state.color) {
                swatch.classList.add('active');
            }
        });
    }

    saveHistory() {
        const state = {
            layers: this.layers.map(layer => ({
                ...layer,
                pixels: [...layer.pixels]
            })),
            currentLayer: this.currentLayer,
            canvas: {
                width: this.canvas.width,
                height: this.canvas.height,
                pixelSize: this.canvas.pixelSize,
                backgroundColor: this.canvas.backgroundColor
            }
        };
        
        // Remove future history if we're not at the end
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(JSON.parse(JSON.stringify(state)));
        this.historyIndex++;
        
        // Limit history size
        if (this.history.length > this.maxHistory) {
            this.history.shift();
            this.historyIndex--;
        }
        
        this.elements.historyCount.textContent = this.history.length;
        this.elements.undoBtn.disabled = this.historyIndex <= 0;
        this.elements.redoBtn.disabled = this.historyIndex >= this.history.length - 1;
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            const state = this.history[this.historyIndex];
            this.restoreState(state);
            this.showNotification('Undo', 'info');
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            const state = this.history[this.historyIndex];
            this.restoreState(state);
            this.showNotification('Redo', 'info');
        }
    }

    restoreState(state) {
        this.layers = state.layers.map(layer => ({
            ...layer,
            pixels: [...layer.pixels]
        }));
        this.currentLayer = state.currentLayer;
        
        if (state.canvas) {
            this.canvas.width = state.canvas.width;
            this.canvas.height = state.canvas.height;
            this.canvas.pixelSize = state.canvas.pixelSize || 16;
            this.canvas.backgroundColor = state.canvas.backgroundColor || '#1a1a1a';
            
            this.elements.canvasWidth.value = state.canvas.width;
            this.elements.canvasHeight.value = state.canvas.height;
            this.elements.pixelSize.value = this.canvas.pixelSize;
            this.elements.pixelSizeValue.textContent = `${this.canvas.pixelSize}px`;
            
            this.createCanvasGrid();
        }
        
        this.updateLayersUI();
        this.updateAllPixels();
        this.updateUI();
    }

    applyEffect(effect) {
        const layer = this.layers[this.currentLayer];
        if (!layer || layer.locked) return;
        
        const newPixels = [...layer.pixels];
        
        switch(effect) {
            case 'invert':
                this.invertLayer(newPixels);
                break;
            case 'grayscale':
                this.grayscaleLayer(newPixels);
                break;
            case 'sepia':
                this.sepiaLayer(newPixels);
                break;
            case 'brightness':
                this.adjustBrightness(newPixels, 1.2);
                break;
            case 'contrast':
                this.adjustContrast(newPixels, 1.2);
                break;
            case 'saturation':
                this.adjustSaturation(newPixels, 1.5);
                break;
            case 'hue':
                this.adjustHue(newPixels, 90);
                break;
            case 'blur':
                this.applyBlur(newPixels, 1);
                break;
            case 'sharpen':
                this.applySharpen(newPixels);
                break;
            case 'edge':
                this.applyEdgeDetection(newPixels);
                break;
            case 'noise':
                this.applyNoise(newPixels, 0.1);
                break;
            case 'pixelate':
                this.applyPixelate(newPixels, 2);
                break;
        }
        
        layer.pixels = newPixels;
        this.updateAllPixels();
        this.saveHistory();
        this.showNotification(`${effect} effect applied`, 'success');
    }

    invertLayer(pixels) {
        for (let i = 0; i < pixels.length; i++) {
            if (pixels[i] && pixels[i] !== 'transparent') {
                const color = this.parseColor(pixels[i]);
                pixels[i] = `rgba(${255 - color.r}, ${255 - color.g}, ${255 - color.b}, ${color.a})`;
            }
        }
    }

    grayscaleLayer(pixels) {
        for (let i = 0; i < pixels.length; i++) {
            if (pixels[i] && pixels[i] !== 'transparent') {
                const color = this.parseColor(pixels[i]);
                const gray = Math.round(0.299 * color.r + 0.587 * color.g + 0.114 * color.b);
                pixels[i] = `rgba(${gray}, ${gray}, ${gray}, ${color.a})`;
            }
        }
    }

    sepiaLayer(pixels) {
        for (let i = 0; i < pixels.length; i++) {
            if (pixels[i] && pixels[i] !== 'transparent') {
                const color = this.parseColor(pixels[i]);
                const r = Math.min(255, Math.round((color.r * 0.393) + (color.g * 0.769) + (color.b * 0.189)));
                const g = Math.min(255, Math.round((color.r * 0.349) + (color.g * 0.686) + (color.b * 0.168)));
                const b = Math.min(255, Math.round((color.r * 0.272) + (color.g * 0.534) + (color.b * 0.131)));
                pixels[i] = `rgba(${r}, ${g}, ${b}, ${color.a})`;
            }
        }
    }

    adjustBrightness(pixels, factor) {
        for (let i = 0; i < pixels.length; i++) {
            if (pixels[i] && pixels[i] !== 'transparent') {
                const color = this.parseColor(pixels[i]);
                const r = Math.min(255, Math.max(0, Math.round(color.r * factor)));
                const g = Math.min(255, Math.max(0, Math.round(color.g * factor)));
                const b = Math.min(255, Math.max(0, Math.round(color.b * factor)));
                pixels[i] = `rgba(${r}, ${g}, ${b}, ${color.a})`;
            }
        }
    }

    adjustContrast(pixels, factor) {
        const midpoint = 127.5;
        
        for (let i = 0; i < pixels.length; i++) {
            if (pixels[i] && pixels[i] !== 'transparent') {
                const color = this.parseColor(pixels[i]);
                const r = Math.min(255, Math.max(0, Math.round((color.r - midpoint) * factor + midpoint)));
                const g = Math.min(255, Math.max(0, Math.round((color.g - midpoint) * factor + midpoint)));
                const b = Math.min(255, Math.max(0, Math.round((color.b - midpoint) * factor + midpoint)));
                pixels[i] = `rgba(${r}, ${g}, ${b}, ${color.a})`;
            }
        }
    }

    adjustSaturation(pixels, factor) {
        for (let i = 0; i < pixels.length; i++) {
            if (pixels[i] && pixels[i] !== 'transparent') {
                const color = this.parseColor(pixels[i]);
                const hsl = this.rgbToHsl(color.r, color.g, color.b);
                hsl[1] = Math.min(1, Math.max(0, hsl[1] * factor));
                const rgb = this.hslToRgb(hsl[0], hsl[1], hsl[2]);
                pixels[i] = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${color.a})`;
            }
        }
    }

    adjustHue(pixels, degrees) {
        const hueShift = degrees / 360;
        
        for (let i = 0; i < pixels.length; i++) {
            if (pixels[i] && pixels[i] !== 'transparent') {
                const color = this.parseColor(pixels[i]);
                const hsl = this.rgbToHsl(color.r, color.g, color.b);
                hsl[0] = (hsl[0] + hueShift) % 1;
                const rgb = this.hslToRgb(hsl[0], hsl[1], hsl[2]);
                pixels[i] = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${color.a})`;
            }
        }
    }

    applyBlur(pixels, radius) {
        // Simple box blur for pixel art
        const width = this.canvas.width;
        const height = this.canvas.height;
        const blurred = new Array(pixels.length).fill(null);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let r = 0, g = 0, b = 0, a = 0, count = 0;
                
                for (let dy = -radius; dy <= radius; dy++) {
                    for (let dx = -radius; dx <= radius; dx++) {
                        const tx = x + dx;
                        const ty = y + dy;
                        
                        if (this.isInBounds(tx, ty)) {
                            const index = ty * width + tx;
                            const color = pixels[index];
                            
                            if (color && color !== 'transparent') {
                                const parsed = this.parseColor(color);
                                r += parsed.r;
                                g += parsed.g;
                                b += parsed.b;
                                a += parsed.a;
                                count++;
                            }
                        }
                    }
                }
                
                if (count > 0) {
                    const index = y * width + x;
                    blurred[index] = `rgba(${Math.round(r/count)}, ${Math.round(g/count)}, ${Math.round(b/count)}, ${a/count})`;
                }
            }
        }
        
        for (let i = 0; i < pixels.length; i++) {
            pixels[i] = blurred[i];
        }
    }

    applySharpen(pixels) {
        // Simple sharpen filter
        const width = this.canvas.width;
        const height = this.canvas.height;
        const original = [...pixels];
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const index = y * width + x;
                const color = original[index];
                
                if (color && color !== 'transparent') {
                    const parsed = this.parseColor(color);
                    
                    // Get surrounding colors
                    let r = parsed.r * 9;
                    let g = parsed.g * 9;
                    let b = parsed.b * 9;
                    
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            if (dx !== 0 || dy !== 0) {
                                const tx = x + dx;
                                const ty = y + dy;
                                const tIndex = ty * width + tx;
                                const tColor = original[tIndex];
                                
                                if (tColor && tColor !== 'transparent') {
                                    const tParsed = this.parseColor(tColor);
                                    r -= tParsed.r;
                                    g -= tParsed.g;
                                    b -= tParsed.b;
                                }
                            }
                        }
                    }
                    
                    r = Math.min(255, Math.max(0, r));
                    g = Math.min(255, Math.max(0, g));
                    b = Math.min(255, Math.max(0, b));
                    
                    pixels[index] = `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${parsed.a})`;
                }
            }
        }
    }

    applyEdgeDetection(pixels) {
        // Simple edge detection
        const width = this.canvas.width;
        const height = this.canvas.height;
        const edges = new Array(pixels.length).fill(null);
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const index = y * width + x;
                
                // Sobel operators
                let gx = 0, gy = 0;
                
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        const tx = x + dx;
                        const ty = y + dy;
                        const tIndex = ty * width + tx;
                        const tColor = pixels[tIndex];
                        
                        if (tColor && tColor !== 'transparent') {
                            const gray = this.parseColor(tColor).r; // Already grayscale
                            const weightX = dx * (Math.abs(dy) + 1);
                            const weightY = dy * (Math.abs(dx) + 1);
                            gx += gray * weightX;
                            gy += gray * weightY;
                        }
                    }
                }
                
                const magnitude = Math.min(255, Math.sqrt(gx*gx + gy*gy));
                edges[index] = `rgba(${magnitude}, ${magnitude}, ${magnitude}, 1)`;
            }
        }
        
        for (let i = 0; i < pixels.length; i++) {
            pixels[i] = edges[i];
        }
    }

    applyNoise(pixels, amount) {
        for (let i = 0; i < pixels.length; i++) {
            if (pixels[i] && pixels[i] !== 'transparent') {
                const color = this.parseColor(pixels[i]);
                const noise = (Math.random() - 0.5) * 2 * amount * 255;
                const r = Math.min(255, Math.max(0, color.r + noise));
                const g = Math.min(255, Math.max(0, color.g + noise));
                const b = Math.min(255, Math.max(0, color.b + noise));
                pixels[i] = `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${color.a})`;
            }
        }
    }

    applyPixelate(pixels, blockSize) {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const pixelated = new Array(pixels.length).fill(null);
        
        for (let y = 0; y < height; y += blockSize) {
            for (let x = 0; x < width; x += blockSize) {
                let r = 0, g = 0, b = 0, a = 0, count = 0;
                
                // Average colors in block
                for (let dy = 0; dy < blockSize && y + dy < height; dy++) {
                    for (let dx = 0; dx < blockSize && x + dx < width; dx++) {
                        const tx = x + dx;
                        const ty = y + dy;
                        const index = ty * width + tx;
                        const color = pixels[index];
                        
                        if (color && color !== 'transparent') {
                            const parsed = this.parseColor(color);
                            r += parsed.r;
                            g += parsed.g;
                            b += parsed.b;
                            a += parsed.a;
                            count++;
                        }
                    }
                }
                
                if (count > 0) {
                    r = Math.round(r / count);
                    g = Math.round(g / count);
                    b = Math.round(b / count);
                    a = a / count;
                    
                    // Apply averaged color to block
                    for (let dy = 0; dy < blockSize && y + dy < height; dy++) {
                        for (let dx = 0; dx < blockSize && x + dx < width; dx++) {
                            const tx = x + dx;
                            const ty = y + dy;
                            const index = ty * width + tx;
                            pixelated[index] = `rgba(${r}, ${g}, ${b}, ${a})`;
                        }
                    }
                }
            }
        }
        
        for (let i = 0; i < pixels.length; i++) {
            pixels[i] = pixelated[i];
        }
    }

    clearCanvas() {
        if (confirm('Clear the entire canvas? This cannot be undone.')) {
            this.layers.forEach(layer => {
                layer.pixels.fill(null);
            });
            this.updateAllPixels();
            this.saveHistory();
            this.showNotification('Canvas cleared', 'warning');
        }
    }

    flipHorizontal() {
        const layer = this.layers[this.currentLayer];
        if (!layer || layer.locked) return;
        
        const width = this.canvas.width;
        const height = this.canvas.height;
        const newPixels = new Array(layer.pixels.length).fill(null);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const sourceIndex = y * width + x;
                const targetIndex = y * width + (width - 1 - x);
                newPixels[targetIndex] = layer.pixels[sourceIndex];
            }
        }
        
        layer.pixels = newPixels;
        this.updateAllPixels();
        this.saveHistory();
        this.showNotification('Flipped horizontally', 'success');
    }

    flipVertical() {
        const layer = this.layers[this.currentLayer];
        if (!layer || layer.locked) return;
        
        const width = this.canvas.width;
        const height = this.canvas.height;
        const newPixels = new Array(layer.pixels.length).fill(null);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const sourceIndex = y * width + x;
                const targetIndex = (height - 1 - y) * width + x;
                newPixels[targetIndex] = layer.pixels[sourceIndex];
            }
        }
        
        layer.pixels = newPixels;
        this.updateAllPixels();
        this.saveHistory();
        this.showNotification('Flipped vertically', 'success');
    }

    zoomIn() {
        this.state.zoom = Math.min(8, this.state.zoom * 1.2);
        this.updateZoom();
    }

    zoomOut() {
        this.state.zoom = Math.max(0.1, this.state.zoom / 1.2);
        this.updateZoom();
    }

    resetZoom() {
        this.state.zoom = 1;
        this.updateZoom();
    }

    updateZoom() {
        this.elements.zoomLevel.textContent = `${Math.round(this.state.zoom * 100)}%`;
        this.createCanvasGrid();
    }

    toggleGrid() {
        this.state.showGrid = !this.state.showGrid;
        this.elements.gridToggleBtn.classList.toggle('active', this.state.showGrid);
        this.updateGridOverlay();
    }

    openExportModal() {
        this.updateExportPreview();
        this.modals.export.classList.add('active');
    }

    updateExportPreview() {
        const { width, height } = this.canvas;
        const scale = 256 / Math.max(width, height);
        const previewWidth = Math.round(width * scale);
        const previewHeight = Math.round(height * scale);
        
        this.elements.previewCanvas.width = previewWidth;
        this.elements.previewCanvas.height = previewHeight;
        
        // Clear canvas
        this.elements.previewCtx.clearRect(0, 0, previewWidth, previewHeight);
        
        // Draw background
        this.drawExportBackground(this.elements.previewCtx, previewWidth, previewHeight);
        
        // Draw pixel art
        const pixelSize = scale;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let color = 'transparent';
                
                // Get composite color from all visible layers
                for (let i = this.layers.length - 1; i >= 0; i--) {
                    if (this.layers[i].visible) {
                        const index = y * width + x;
                        if (this.layers[i].pixels[index]) {
                            color = this.layers[i].pixels[index];
                            break;
                        }
                    }
                }
                
                if (color !== 'transparent') {
                    this.elements.previewCtx.fillStyle = color;
                    this.elements.previewCtx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
                }
            }
        }
    }

    drawExportBackground(ctx, width, height) {
        const bg = this.exportSettings.background;
        
        if (bg === 'checkered') {
            const cellSize = 8;
            ctx.fillStyle = '#2a2a2a';
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = '#3a3a3a';
            
            for (let y = 0; y < height; y += cellSize) {
                for (let x = 0; x < width; x += cellSize) {
                    if ((x / cellSize + y / cellSize) % 2 === 0) {
                        ctx.fillRect(x, y, cellSize, cellSize);
                    }
                }
            }
        } else if (bg === 'white') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);
        } else if (bg === 'black') {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, width, height);
        } else if (bg === 'custom') {
            ctx.fillStyle = this.exportSettings.customBg;
            ctx.fillRect(0, 0, width, height);
        }
        // For transparent background, do nothing
    }

    exportImage() {
        const { format, scale, background, quality } = this.exportSettings;
        const { width, height } = this.canvas;
        
        const exportWidth = width * scale;
        const exportHeight = height * scale;
        
        const canvas = document.createElement('canvas');
        canvas.width = exportWidth;
        canvas.height = exportHeight;
        const ctx = canvas.getContext('2d');
        
        // Draw background
        this.drawExportBackground(ctx, exportWidth, exportHeight);
        
        // Draw pixel art
        const pixelSize = scale;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let color = 'transparent';
                
                // Get composite color from all visible layers
                for (let i = this.layers.length - 1; i >= 0; i--) {
                    if (this.layers[i].visible) {
                        const index = y * width + x;
                        if (this.layers[i].pixels[index]) {
                            color = this.layers[i].pixels[index];
                            break;
                        }
                    }
                }
                
                if (color !== 'transparent') {
                    ctx.fillStyle = color;
                    ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
                }
            }
        }
        
        return canvas;
    }

    downloadImage() {
        const canvas = this.exportImage();
        const { format, quality } = this.exportSettings;
        
        let mimeType, fileName, qualityValue;
        switch(format) {
            case 'png':
                mimeType = 'image/png';
                fileName = `pixelart-${Date.now()}.png`;
                qualityValue = 1.0;
                break;
            case 'jpg':
                mimeType = 'image/jpeg';
                fileName = `pixelart-${Date.now()}.jpg`;
                qualityValue = quality === 'low' ? 0.7 : quality === 'medium' ? 0.85 : 0.95;
                break;
            case 'webp':
                mimeType = 'image/webp';
                fileName = `pixelart-${Date.now()}.webp`;
                qualityValue = quality === 'low' ? 0.7 : quality === 'medium' ? 0.85 : 0.95;
                break;
            case 'gif':
                mimeType = 'image/gif';
                fileName = `pixelart-${Date.now()}.gif`;
                qualityValue = 1.0;
                break;
            case 'svg':
                // SVG export would be more complex
                this.exportAsSvg();
                return;
        }
        
        const link = document.createElement('a');
        link.download = fileName;
        
        if (format === 'jpg' || format === 'webp') {
            link.href = canvas.toDataURL(mimeType, qualityValue);
        } else {
            link.href = canvas.toDataURL(mimeType);
        }
        
        link.click();
        this.modals.export.classList.remove('active');
        this.showNotification('Image downloaded successfully', 'success');
    }

    exportAsSvg() {
        const { width, height } = this.canvas;
        const { scale } = this.exportSettings;
        
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width * scale}" height="${height * scale}" viewBox="0 0 ${width} ${height}">\n`;
        
        // Add background if not transparent
        if (this.exportSettings.background !== 'transparent') {
            let bgColor = '#ffffff';
            switch(this.exportSettings.background) {
                case 'black': bgColor = '#000000'; break;
                case 'white': bgColor = '#ffffff'; break;
                case 'custom': bgColor = this.exportSettings.customBg; break;
                case 'checkered':
                    // Checkered background for SVG is complex, skip for now
                    break;
            }
            if (this.exportSettings.background !== 'checkered') {
                svg += `  <rect width="${width}" height="${height}" fill="${bgColor}"/>\n`;
            }
        }
        
        // Add pixels
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let color = 'transparent';
                
                // Get composite color from all visible layers
                for (let i = this.layers.length - 1; i >= 0; i--) {
                    if (this.layers[i].visible) {
                        const index = y * width + x;
                        if (this.layers[i].pixels[index]) {
                            color = this.layers[i].pixels[index];
                            break;
                        }
                    }
                }
                
                if (color !== 'transparent') {
                    svg += `  <rect x="${x}" y="${y}" width="1" height="1" fill="${color}"/>\n`;
                }
            }
        }
        
        svg += '</svg>';
        
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `pixelart-${Date.now()}.svg`;
        link.href = url;
        link.click();
        
        URL.revokeObjectURL(url);
        this.modals.export.classList.remove('active');
        this.showNotification('SVG exported successfully', 'success');
    }

    copyToClipboard() {
        const canvas = this.exportImage();
        
        canvas.toBlob(blob => {
            const item = new ClipboardItem({ 'image/png': blob });
            navigator.clipboard.write([item])
                .then(() => this.showNotification('Image copied to clipboard', 'success'))
                .catch(() => this.showNotification('Failed to copy image', 'error'));
        });
        
        this.modals.export.classList.remove('active');
    }

    saveProject() {
        const project = {
            version: '3.1',
            date: new Date().toISOString(),
            canvas: {
                width: this.canvas.width,
                height: this.canvas.height,
                pixelSize: this.canvas.pixelSize,
                backgroundColor: this.canvas.backgroundColor
            },
            state: this.state,
            layers: this.layers.map(layer => ({
                ...layer,
                pixels: layer.pixels.map(pixel => pixel || null)
            })),
            animation: this.animation.frames.length > 0 ? {
                frames: this.animation.frames.map(frame => ({
                    layers: frame.layers.map(layer => ({
                        ...layer,
                        pixels: layer.pixels.map(pixel => pixel || null)
                    }))
                })),
                delay: this.animation.delay,
                loopCount: this.animation.loopCount
            } : null
        };
        
        const dataStr = JSON.stringify(project, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.download = `pixelcanvas-${Date.now()}.pxl`;
        link.href = url;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('Project saved successfully', 'success');
    }

    loadProject(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const project = JSON.parse(e.target.result);
                
                // Validate project
                if (!project.canvas || !project.layers) {
                    throw new Error('Invalid project file');
                }
                
                // Load project data
                this.canvas.width = project.canvas.width;
                this.canvas.height = project.canvas.height;
                this.canvas.pixelSize = project.canvas.pixelSize || 16;
                this.canvas.backgroundColor = project.canvas.backgroundColor || '#1a1a1a';
                
                this.state = project.state || this.state;
                this.layers = project.layers.map(layer => ({
                    ...layer,
                    pixels: layer.pixels.map(pixel => pixel || null)
                }));
                this.currentLayer = 0;
                
                // Load animation if exists
                if (project.animation) {
                    this.animation.frames = project.animation.frames.map(frame => ({
                        layers: frame.layers.map(layer => ({
                            ...layer,
                            pixels: layer.pixels.map(pixel => pixel || null)
                        }))
                    }));
                    this.animation.delay = project.animation.delay || 100;
                    this.animation.loopCount = project.animation.loopCount || 0;
                }
                
                // Update UI
                this.elements.canvasWidth.value = this.canvas.width;
                this.elements.canvasHeight.value = this.canvas.height;
                this.elements.pixelSize.value = this.canvas.pixelSize;
                this.elements.pixelSizeValue.textContent = `${this.canvas.pixelSize}px`;
                this.updateCanvasSize();
                this.updateLayersUI();
                this.setColor(this.state.color);
                this.selectTool(this.state.tool);
                this.updateUI();
                
                // Reset history
                this.history = [{
                    layers: this.layers.map(layer => ({
                        ...layer,
                        pixels: [...layer.pixels]
                    })),
                    currentLayer: this.currentLayer,
                    canvas: {
                        width: this.canvas.width,
                        height: this.canvas.height
                    }
                }];
                this.historyIndex = 0;
                this.elements.historyCount.textContent = this.history.length;
                
                this.showNotification('Project loaded successfully', 'success');
            } catch (error) {
                console.error('Error loading project:', error);
                this.showNotification('Failed to load project file', 'error');
            }
        };
        reader.readAsText(file);
    }

    openImportModal() {
        this.modals.import.classList.add('active');
        this.elements.importFile.value = '';
        this.elements.importPreviewCtx.clearRect(0, 0, 256, 256);
        this.elements.importPreview.classList.remove('has-image');
        this.elements.confirmImportBtn.disabled = true;
    }

    handleImageImport(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // Draw image to preview
                this.elements.importPreview.width = 256;
                this.elements.importPreview.height = 256;
                this.elements.importPreviewCtx.clearRect(0, 0, 256, 256);
                
                // Calculate scale to fit preview
                const scale = Math.min(256 / img.width, 256 / img.height);
                const width = img.width * scale;
                const height = img.height * scale;
                const x = (256 - width) / 2;
                const y = (256 - height) / 2;
                
                this.elements.importPreviewCtx.drawImage(img, x, y, width, height);
                this.elements.importPreview.classList.add('has-image');
                this.elements.confirmImportBtn.disabled = false;
                
                // Store the image for processing
                this.importedImage = img;
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    confirmImageImport() {
        if (!this.importedImage) return;
        
        const method = this.importSettings.method;
        
        switch(method) {
            case 'fit':
                this.importImageFit();
                break;
            case 'resize':
                this.importImageResize();
                break;
            case 'layer':
                this.importImageAsLayer();
                break;
        }
        
        this.modals.import.classList.remove('active');
    }

    importImageFit() {
        // Resize image to fit current canvas
        this.elements.hiddenCanvas.width = this.canvas.width;
        this.elements.hiddenCanvas.height = this.canvas.height;
        this.elements.hiddenCtx.drawImage(this.importedImage, 0, 0, this.canvas.width, this.canvas.height);
        const imageData = this.elements.hiddenCtx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        
        // Apply dithering and color reduction
        const processedData = this.processImageData(imageData);
        
        // Apply to current layer
        const layer = this.layers[this.currentLayer];
        if (layer) {
            this.applyImageDataToLayer(layer, processedData);
            this.updateAllPixels();
            this.saveHistory();
            this.showNotification('Image imported and fitted to canvas', 'success');
        }
    }

    importImageResize() {
        // Open resize modal with image dimensions
        this.elements.resizeWidth.value = this.importedImage.width;
        this.elements.resizeHeight.value = this.importedImage.height;
        this.modals.resize.classList.add('active');
        this.modals.import.classList.remove('active');
        
        // Store import for after resize
        this.pendingImport = {
            image: this.importedImage,
            method: 'resize'
        };
    }

    importImageAsLayer() {
        // Create new layer with image
        const newLayer = this.createLayer('Imported Image');
        
        // Resize image to fit canvas
        this.elements.hiddenCanvas.width = this.canvas.width;
        this.elements.hiddenCanvas.height = this.canvas.height;
        this.elements.hiddenCtx.drawImage(this.importedImage, 0, 0, this.canvas.width, this.canvas.height);
        const imageData = this.elements.hiddenCtx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        
        // Apply dithering and color reduction
        const processedData = this.processImageData(imageData);
        
        // Apply to new layer
        this.applyImageDataToLayer(newLayer, processedData);
        
        // Add layer
        this.layers.push(newLayer);
        this.currentLayer = this.layers.length - 1;
        this.updateLayersUI();
        this.updateAllPixels();
        this.saveHistory();
        this.showNotification('Image imported as new layer', 'success');
    }

    processImageData(imageData) {
        const { data, width, height } = imageData;
        const result = new ImageData(width, height);
        const resultData = result.data;
        
        // Get color reduction setting
        let colorCount = 256;
        const reduction = this.importSettings.colorReduction;
        if (reduction !== 'auto') {
            colorCount = parseInt(reduction);
        }
        
        // Apply dithering if selected
        const dithering = this.importSettings.dithering;
        
        if (dithering === 'floyd') {
            this.applyFloydSteinbergDithering(data, resultData, width, height, colorCount);
        } else if (dithering === 'ordered') {
            this.applyOrderedDithering(data, resultData, width, height, colorCount);
        } else if (dithering === 'atkinson') {
            this.applyAtkinsonDithering(data, resultData, width, height, colorCount);
        } else {
            // No dithering, just quantize
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const a = data[i + 3];
                
                // Quantize colors
                const quantized = this.quantizeColor(r, g, b, colorCount);
                
                resultData[i] = quantized.r;
                resultData[i + 1] = quantized.g;
                resultData[i + 2] = quantized.b;
                resultData[i + 3] = a;
            }
        }
        
        return result;
    }

    applyFloydSteinbergDithering(srcData, dstData, width, height, colorCount) {
        // Create a copy of the source data to work with
        const workData = new Float32Array(srcData.length);
        for (let i = 0; i < srcData.length; i++) {
            workData[i] = srcData[i];
        }
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                
                // Get original color
                const oldR = workData[idx];
                const oldG = workData[idx + 1];
                const oldB = workData[idx + 2];
                const oldA = workData[idx + 3];
                
                // Quantize color
                const newColor = this.quantizeColor(oldR, oldG, oldB, colorCount);
                
                // Set destination pixel
                dstData[idx] = newColor.r;
                dstData[idx + 1] = newColor.g;
                dstData[idx + 2] = newColor.b;
                dstData[idx + 3] = oldA;
                
                // Calculate quantization error
                const errR = oldR - newColor.r;
                const errG = oldG - newColor.g;
                const errB = oldB - newColor.b;
                
                // Distribute error to neighboring pixels (Floyd-Steinberg)
                if (x + 1 < width) {
                    const rightIdx = idx + 4;
                    workData[rightIdx] += errR * 7/16;
                    workData[rightIdx + 1] += errG * 7/16;
                    workData[rightIdx + 2] += errB * 7/16;
                }
                
                if (x - 1 >= 0 && y + 1 < height) {
                    const downLeftIdx = idx + width * 4 - 4;
                    workData[downLeftIdx] += errR * 3/16;
                    workData[downLeftIdx + 1] += errG * 3/16;
                    workData[downLeftIdx + 2] += errB * 3/16;
                }
                
                if (y + 1 < height) {
                    const downIdx = idx + width * 4;
                    workData[downIdx] += errR * 5/16;
                    workData[downIdx + 1] += errG * 5/16;
                    workData[downIdx + 2] += errB * 5/16;
                }
                
                if (x + 1 < width && y + 1 < height) {
                    const downRightIdx = idx + width * 4 + 4;
                    workData[downRightIdx] += errR * 1/16;
                    workData[downRightIdx + 1] += errG * 1/16;
                    workData[downRightIdx + 2] += errB * 1/16;
                }
            }
        }
    }

    applyOrderedDithering(srcData, dstData, width, height, colorCount) {
        // Bayer 8x8 matrix
        const bayerMatrix = [
            [ 0, 32,  8, 40,  2, 34, 10, 42],
            [48, 16, 56, 24, 50, 18, 58, 26],
            [12, 44,  4, 36, 14, 46,  6, 38],
            [60, 28, 52, 20, 62, 30, 54, 22],
            [ 3, 35, 11, 43,  1, 33,  9, 41],
            [51, 19, 59, 27, 49, 17, 57, 25],
            [15, 47,  7, 39, 13, 45,  5, 37],
            [63, 31, 55, 23, 61, 29, 53, 21]
        ];
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const r = srcData[idx];
                const g = srcData[idx + 1];
                const b = srcData[idx + 2];
                const a = srcData[idx + 3];
                
                // Apply Bayer matrix threshold
                const threshold = bayerMatrix[y % 8][x % 8] / 64 - 0.5;
                
                const newR = Math.max(0, Math.min(255, r + threshold * 255));
                const newG = Math.max(0, Math.min(255, g + threshold * 255));
                const newB = Math.max(0, Math.min(255, b + threshold * 255));
                
                // Quantize color
                const quantized = this.quantizeColor(newR, newG, newB, colorCount);
                
                dstData[idx] = quantized.r;
                dstData[idx + 1] = quantized.g;
                dstData[idx + 2] = quantized.b;
                dstData[idx + 3] = a;
            }
        }
    }

    applyAtkinsonDithering(srcData, dstData, width, height, colorCount) {
        // Create a copy of the source data to work with
        const workData = new Float32Array(srcData.length);
        for (let i = 0; i < srcData.length; i++) {
            workData[i] = srcData[i];
        }
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                
                // Get original color
                const oldR = workData[idx];
                const oldG = workData[idx + 1];
                const oldB = workData[idx + 2];
                const oldA = workData[idx + 3];
                
                // Quantize color
                const newColor = this.quantizeColor(oldR, oldG, oldB, colorCount);
                
                // Set destination pixel
                dstData[idx] = newColor.r;
                dstData[idx + 1] = newColor.g;
                dstData[idx + 2] = newColor.b;
                dstData[idx + 3] = oldA;
                
                // Calculate quantization error
                const errR = oldR - newColor.r;
                const errG = oldG - newColor.g;
                const errB = oldB - newColor.b;
                
                // Distribute error to neighboring pixels (Atkinson dithering)
                const distributeError = (dx, dy, fraction) => {
                    const nx = x + dx;
                    const ny = y + dy;
                    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                        const nIdx = (ny * width + nx) * 4;
                        workData[nIdx] += errR * fraction;
                        workData[nIdx + 1] += errG * fraction;
                        workData[nIdx + 2] += errB * fraction;
                    }
                };
                
                distributeError(1, 0, 1/8);
                distributeError(2, 0, 1/8);
                distributeError(-1, 1, 1/8);
                distributeError(0, 1, 1/8);
                distributeError(1, 1, 1/8);
                distributeError(0, 2, 1/8);
            }
        }
    }

    quantizeColor(r, g, b, colorCount) {
        if (colorCount >= 256) {
            return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
        }
        
        // Simple quantization by reducing color depth
        const levels = Math.floor(Math.sqrt(colorCount));
        const step = 255 / (levels - 1);
        
        const qr = Math.round(Math.round(r / step) * step);
        const qg = Math.round(Math.round(g / step) * step);
        const qb = Math.round(Math.round(b / step) * step);
        
        return { r: qr, g: qg, b: qb };
    }

    applyImageDataToLayer(layer, imageData) {
        const { data, width, height } = imageData;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];
                const a = data[idx + 3] / 255;
                
                const pixelIndex = y * width + x;
                if (a > 0) {
                    layer.pixels[pixelIndex] = `rgba(${r}, ${g}, ${b}, ${a})`;
                } else {
                    layer.pixels[pixelIndex] = null;
                }
            }
        }
    }

    openResizeModal() {
        this.elements.resizeWidth.value = this.canvas.width;
        this.elements.resizeHeight.value = this.canvas.height;
        this.modals.resize.classList.add('active');
    }

    confirmCanvasResize() {
        const newWidth = parseInt(this.elements.resizeWidth.value) || this.canvas.width;
        const newHeight = parseInt(this.elements.resizeHeight.value) || this.canvas.height;
        const anchor = this.resizeSettings.anchor;
        const method = this.resizeSettings.method;
        const bgColor = this.resizeSettings.backgroundColor;
        
        if (newWidth <= 0 || newHeight <= 0) {
            this.showNotification('Invalid canvas dimensions', 'error');
            return;
        }
        
        if (newWidth > 2048 || newHeight > 2048) {
            this.showNotification('Maximum canvas size is 2048x2048', 'error');
            return;
        }
        
        // Store old dimensions
        const oldWidth = this.canvas.width;
        const oldHeight = this.canvas.height;
        
        // Resize each layer
        this.layers.forEach(layer => {
            const newPixels = new Array(newWidth * newHeight).fill(null);
            
            // Calculate offset based on anchor
            let offsetX = 0;
            let offsetY = 0;
            
            if (method === 'scale' || method === 'add') {
                // Center the content
                offsetX = Math.floor((newWidth - oldWidth) / 2);
                offsetY = Math.floor((newHeight - oldHeight) / 2);
                
                if (anchor.includes('w')) offsetX = 0;
                if (anchor.includes('e')) offsetX = newWidth - oldWidth;
                if (anchor.includes('n')) offsetY = 0;
                if (anchor.includes('s')) offsetY = newHeight - oldHeight;
            }
            
            // Copy pixels from old layer to new layer
            for (let y = 0; y < oldHeight; y++) {
                for (let x = 0; x < oldWidth; x++) {
                    const oldIndex = y * oldWidth + x;
                    const newX = x + offsetX;
                    const newY = y + offsetY;
                    
                    if (newX >= 0 && newX < newWidth && newY >= 0 && newY < newHeight) {
                        const newIndex = newY * newWidth + newX;
                        newPixels[newIndex] = layer.pixels[oldIndex];
                    }
                }
            }
            
            layer.pixels = newPixels;
        });
        
        // Update canvas dimensions
        this.canvas.width = newWidth;
        this.canvas.height = newHeight;
        this.elements.canvasWidth.value = newWidth;
        this.elements.canvasHeight.value = newHeight;
        
        // Update background color if specified
        if (bgColor !== '#00000000') {
            this.canvas.backgroundColor = bgColor;
        }
        
        // Recreate canvas grid
        this.createCanvasGrid();
        this.updateUI();
        this.saveHistory();
        
        this.modals.resize.classList.remove('active');
        this.showNotification(`Canvas resized to ${newWidth}x${newHeight}`, 'success');
    }

    initAnimation() {
        // Add initial frame
        this.animation.frames = [{
            layers: this.layers.map(layer => ({
                ...layer,
                pixels: [...layer.pixels]
            }))
        }];
        this.animation.currentFrame = 0;
        
        this.updateAnimationUI();
    }

    openAnimationModal() {
        this.modals.animation.classList.add('active');
        this.updateAnimationPreview();
    }

    updateAnimationUI() {
        this.elements.animationTimeline.innerHTML = '';
        
        this.animation.frames.forEach((frame, index) => {
            const frameThumb = document.createElement('div');
            frameThumb.className = `frame-thumbnail ${index === this.animation.currentFrame ? 'active' : ''}`;
            frameThumb.dataset.frame = index;
            
            // Create thumbnail canvas
            const canvas = document.createElement('canvas');
            canvas.width = 80;
            canvas.height = 80;
            const ctx = canvas.getContext('2d');
            
            // Draw frame preview
            this.drawFramePreview(ctx, frame);
            
            frameThumb.appendChild(canvas);
            
            const frameNumber = document.createElement('div');
            frameNumber.className = 'frame-number';
            frameNumber.textContent = index + 1;
            frameThumb.appendChild(frameNumber);
            
            frameThumb.addEventListener('click', () => {
                this.selectFrame(index);
            });
            
            this.elements.animationTimeline.appendChild(frameThumb);
        });
        
        // Update animation controls
        this.elements.frameDelay.value = this.animation.delay;
        this.elements.frameDelayValue.textContent = this.animation.delay;
        this.elements.loopCount.value = this.animation.loopCount;
        this.elements.loopCountValue.textContent = this.animation.loopCount;
        this.elements.onionOpacity.value = this.animation.onionOpacity * 100;
        this.elements.onionOpacityValue.textContent = `${this.animation.onionOpacity * 100}%`;
        
        // Update button states
        this.elements.removeFrameBtn.disabled = this.animation.frames.length <= 1;
        this.elements.playAnimationBtn.disabled = this.animation.playing;
        this.elements.stopAnimationBtn.disabled = !this.animation.playing;
    }

    drawFramePreview(ctx, frame) {
        // Draw checkered background
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(0, 0, 80, 80);
        ctx.fillStyle = '#3a3a3a';
        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 10; x++) {
                if ((x + y) % 2 === 0) {
                    ctx.fillRect(x * 8, y * 8, 8, 8);
                }
            }
        }
        
        // Calculate scale
        const scale = 80 / Math.max(this.canvas.width, this.canvas.height);
        const pixelSize = Math.max(1, scale);
        
        // Draw frame content
        for (let y = 0; y < this.canvas.height; y++) {
            for (let x = 0; x < this.canvas.width; x++) {
                let color = 'transparent';
                
                // Get composite color from all visible layers
                for (let i = frame.layers.length - 1; i >= 0; i--) {
                    if (frame.layers[i].visible) {
                        const index = y * this.canvas.width + x;
                        if (frame.layers[i].pixels[index]) {
                            color = frame.layers[i].pixels[index];
                            break;
                        }
                    }
                }
                
                if (color !== 'transparent') {
                    ctx.fillStyle = color;
                    ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
                }
            }
        }
    }

    updateAnimationPreview() {
        const currentFrame = this.animation.frames[this.animation.currentFrame];
        if (!currentFrame) return;
        
        this.elements.animationCanvas.width = 256;
        this.elements.animationCanvas.height = 256;
        this.elements.animationCtx.clearRect(0, 0, 256, 256);
        
        // Calculate scale
        const scale = 256 / Math.max(this.canvas.width, this.canvas.height);
        const pixelSize = scale;
        
        // Draw onion skin if enabled
        if (this.animation.onionSkin && this.animation.playing) {
            const prevFrame = this.animation.frames[this.animation.currentFrame - 1];
            const nextFrame = this.animation.frames[this.animation.currentFrame + 1];
            
            if (prevFrame) {
                this.drawFrameToCanvas(this.elements.animationCtx, prevFrame, pixelSize, this.animation.onionOpacity * 0.5);
            }
            
            if (nextFrame) {
                this.drawFrameToCanvas(this.elements.animationCtx, nextFrame, pixelSize, this.animation.onionOpacity * 0.5);
            }
        }
        
        // Draw current frame
        this.drawFrameToCanvas(this.elements.animationCtx, currentFrame, pixelSize, 1);
    }

    drawFrameToCanvas(ctx, frame, pixelSize, opacity) {
        ctx.globalAlpha = opacity;
        
        for (let y = 0; y < this.canvas.height; y++) {
            for (let x = 0; x < this.canvas.width; x++) {
                let color = 'transparent';
                
                // Get composite color from all visible layers
                for (let i = frame.layers.length - 1; i >= 0; i--) {
                    if (frame.layers[i].visible) {
                        const index = y * this.canvas.width + x;
                        if (frame.layers[i].pixels[index]) {
                            color = frame.layers[i].pixels[index];
                            break;
                        }
                    }
                }
                
                if (color !== 'transparent') {
                    ctx.fillStyle = color;
                    ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
                }
            }
        }
        
        ctx.globalAlpha = 1;
    }

    selectFrame(index) {
        if (index >= 0 && index < this.animation.frames.length) {
            this.animation.currentFrame = index;
            
            // Load frame data into current layers
            const frame = this.animation.frames[index];
            this.layers = frame.layers.map(layer => ({
                ...layer,
                pixels: [...layer.pixels]
            }));
            this.currentLayer = 0;
            
            this.updateLayersUI();
            this.updateAllPixels();
            this.updateAnimationUI();
            this.updateAnimationPreview();
        }
    }

    addFrame() {
        // Save current frame
        this.animation.frames[this.animation.currentFrame] = {
            layers: this.layers.map(layer => ({
                ...layer,
                pixels: [...layer.pixels]
            }))
        };
        
        // Add new frame
        const newFrame = {
            layers: this.layers.map(layer => ({
                ...layer,
                pixels: new Array(this.canvas.width * this.canvas.height).fill(null)
            }))
        };
        
        this.animation.frames.splice(this.animation.currentFrame + 1, 0, newFrame);
        this.animation.currentFrame++;
        
        // Load new frame
        this.layers = newFrame.layers.map(layer => ({
            ...layer,
            pixels: [...layer.pixels]
        }));
        this.currentLayer = 0;
        
        this.updateLayersUI();
        this.updateAllPixels();
        this.updateAnimationUI();
        this.updateAnimationPreview();
        this.showNotification('New frame added', 'success');
    }

    removeFrame() {
        if (this.animation.frames.length <= 1) {
            this.showNotification('Cannot remove the last frame', 'error');
            return;
        }
        
        if (confirm('Remove this frame?')) {
            this.animation.frames.splice(this.animation.currentFrame, 1);
            
            if (this.animation.currentFrame >= this.animation.frames.length) {
                this.animation.currentFrame = this.animation.frames.length - 1;
            }
            
            // Load current frame
            const frame = this.animation.frames[this.animation.currentFrame];
            this.layers = frame.layers.map(layer => ({
                ...layer,
                pixels: [...layer.pixels]
            }));
            this.currentLayer = 0;
            
            this.updateLayersUI();
            this.updateAllPixels();
            this.updateAnimationUI();
            this.updateAnimationPreview();
            this.showNotification('Frame removed', 'info');
        }
    }

    duplicateFrame() {
        // Save current frame
        this.animation.frames[this.animation.currentFrame] = {
            layers: this.layers.map(layer => ({
                ...layer,
                pixels: [...layer.pixels]
            }))
        };
        
        // Duplicate current frame
        const duplicatedFrame = {
            layers: this.layers.map(layer => ({
                ...layer,
                pixels: [...layer.pixels]
            }))
        };
        
        this.animation.frames.splice(this.animation.currentFrame + 1, 0, duplicatedFrame);
        this.animation.currentFrame++;
        
        this.updateAnimationUI();
        this.showNotification('Frame duplicated', 'success');
    }

    playAnimation() {
        if (this.animation.playing) return;
        
        this.animation.playing = true;
        this.elements.playAnimationBtn.disabled = true;
        this.elements.stopAnimationBtn.disabled = false;
        
        let currentLoop = 0;
        let frameIndex = 0;
        
        const animate = () => {
            if (!this.animation.playing) return;
            
            this.selectFrame(frameIndex);
            frameIndex = (frameIndex + 1) % this.animation.frames.length;
            
            if (frameIndex === 0) {
                currentLoop++;
                if (this.animation.loopCount > 0 && currentLoop >= this.animation.loopCount) {
                    this.stopAnimation();
                    return;
                }
            }
            
            setTimeout(animate, this.animation.delay);
        };
        
        animate();
    }

    stopAnimation() {
        this.animation.playing = false;
        this.elements.playAnimationBtn.disabled = false;
        this.elements.stopAnimationBtn.disabled = true;
    }

    exportAnimation() {
        // This would require a more complex GIF encoder
        // For now, we'll export the first frame
        this.showNotification('Animation export coming soon!', 'info');
    }

    openTextModal(x, y) {
        this.textPosition = { x, y };
        this.modals.text.classList.add('active');
        this.elements.textInput.focus();
    }

    insertText() {
        const text = this.elements.textInput.value.trim();
        if (!text) return;
        
        const size = parseInt(this.elements.textSize.value);
        const style = this.elements.textStyle.value;
        const align = this.elements.textAlign.value;
        const antiAlias = this.elements.textAntiAlias.checked;
        const layer = this.layers[this.currentLayer];
        
        if (!layer || layer.locked) return;
        
        // Simple pixel font rendering
        // This is a basic implementation - in a real app, you'd want a proper pixel font
        const pixelFont = this.createPixelFont();
        const charWidth = size / 2;
        const charHeight = size;
        
        let startX = this.textPosition.x;
        if (align === 'center') {
            startX -= Math.floor((text.length * charWidth) / 2);
        } else if (align === 'right') {
            startX -= text.length * charWidth;
        }
        
        for (let i = 0; i < text.length; i++) {
            const char = text[i].toUpperCase();
            const charData = pixelFont[char] || pixelFont['?'];
            
            if (charData) {
                const charX = startX + (i * charWidth);
                
                for (let dy = 0; dy < charHeight && dy < charData.length; dy++) {
                    for (let dx = 0; dx < charWidth && dx < charData[dy].length; dx++) {
                        if (charData[dy][dx]) {
                            const x = Math.floor(charX + dx);
                            const y = Math.floor(this.textPosition.y + dy);
                            
                            if (this.isInBounds(x, y)) {
                                const index = y * this.canvas.width + x;
                                layer.pixels[index] = this.state.color;
                            }
                        }
                    }
                }
            }
        }
        
        this.updateAllPixels();
        this.saveHistory();
        this.modals.text.classList.remove('active');
        this.elements.textInput.value = '';
        this.showNotification('Text inserted', 'success');
    }

    createPixelFont() {
        // Basic 5x7 pixel font
        return {
            'A': [
                [0,1,1,0,0],
                [1,0,0,1,0],
                [1,0,0,1,0],
                [1,1,1,1,0],
                [1,0,0,1,0],
                [1,0,0,1,0],
                [1,0,0,1,0]
            ],
            'B': [
                [1,1,1,0,0],
                [1,0,0,1,0],
                [1,0,0,1,0],
                [1,1,1,0,0],
                [1,0,0,1,0],
                [1,0,0,1,0],
                [1,1,1,0,0]
            ],
            'C': [
                [0,1,1,1,0],
                [1,0,0,0,0],
                [1,0,0,0,0],
                [1,0,0,0,0],
                [1,0,0,0,0],
                [1,0,0,0,0],
                [0,1,1,1,0]
            ],
            '?': [
                [1,1,1,1,0],
                [0,0,0,1,0],
                [0,0,1,0,0],
                [0,1,0,0,0],
                [0,1,0,0,0],
                [0,0,0,0,0],
                [0,1,0,0,0]
            ]
            // Add more letters as needed
        };
    }

    openGradientModal(x, y) {
        this.gradientPosition = { x, y };
        this.modals.gradient.classList.add('active');
        this.initGradientEditor();
    }

    initGradientEditor() {
        // Initialize gradient stops
        this.gradientStops = [
            { position: 0, color: this.state.color },
            { position: 1, color: this.state.previousColor }
        ];
        
        this.updateGradientEditor();
    }

    updateGradientEditor() {
        // Clear gradient stops
        this.elements.gradientStops.innerHTML = '';
        
        // Create gradient preview
        const gradient = this.createGradientString();
        this.elements.gradientPreview.style.background = gradient;
        
        // Create stop elements
        this.gradientStops.forEach((stop, index) => {
            const stopEl = document.createElement('div');
            stopEl.className = 'gradient-stop';
            stopEl.dataset.index = index;
            stopEl.style.left = `${stop.position * 100}%`;
            
            const colorEl = document.createElement('div');
            colorEl.className = 'gradient-stop-color';
            colorEl.style.backgroundColor = stop.color;
            stopEl.appendChild(colorEl);
            
            stopEl.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectGradientStop(index);
            });
            
            this.elements.gradientStops.appendChild(stopEl);
        });
        
        // Select first stop by default
        this.selectGradientStop(0);
    }

    createGradientString() {
        const stops = this.gradientStops.map(stop => `${stop.color} ${stop.position * 100}%`);
        const type = this.elements.gradientTypeSelect.value;
        const angle = this.elements.gradientAngle.value;
        const repeat = this.elements.gradientRepeat.value;
        
        if (type === 'linear') {
            return `linear-gradient(${angle}deg, ${stops.join(', ')}) ${repeat}`;
        } else if (type === 'radial') {
            return `radial-gradient(circle, ${stops.join(', ')}) ${repeat}`;
        } else { // conic
            return `conic-gradient(from ${angle}deg, ${stops.join(', ')}) ${repeat}`;
        }
    }

    selectGradientStop(index) {
        // Update selected stop
        const stopElements = this.elements.gradientStops.querySelectorAll('.gradient-stop');
        stopElements.forEach(el => el.classList.remove('active'));
        stopElements[index].classList.add('active');
        
        // Update color picker
        this.elements.colorPicker.value = this.gradientStops[index].color;
    }

    applyGradient() {
        const layer = this.layers[this.currentLayer];
        if (!layer || layer.locked) return;
        
        const gradient = this.createGradientString();
        const { x, y } = this.gradientPosition;
        const { width, height } = this.canvas;
        
        // Create temporary canvas for gradient
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d');
        
        // Apply gradient to canvas
        tempCtx.fillStyle = gradient;
        tempCtx.fillRect(0, 0, width, height);
        
        // Get gradient data
        const imageData = tempCtx.getImageData(0, 0, width, height);
        const data = imageData.data;
        
        // Apply to layer
        for (let i = 0; i < data.length; i += 4) {
            const pixelIndex = i / 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3] / 255;
            
            if (a > 0) {
                layer.pixels[pixelIndex] = `rgba(${r}, ${g}, ${b}, ${a})`;
            }
        }
        
        this.updateAllPixels();
        this.saveHistory();
        this.modals.gradient.classList.remove('active');
        this.showNotification('Gradient applied', 'success');
    }

    initTools() {
        // Initialize tool configurations
        this.tools = {
            pencil: {
                name: 'Pencil',
                shortcut: 'P'
            },
            eraser: {
                name: 'Eraser',
                shortcut: 'E'
            },
            bucket: {
                name: 'Bucket Fill',
                shortcut: 'B'
            },
            picker: {
                name: 'Color Picker',
                shortcut: 'I'
            },
            line: {
                name: 'Line',
                shortcut: 'L'
            },
            rectangle: {
                name: 'Rectangle',
                shortcut: 'R'
            },
            circle: {
                name: 'Circle',
                shortcut: 'C'
            },
            spray: {
                name: 'Spray',
                shortcut: 'S'
            },
            move: {
                name: 'Move',
                shortcut: 'M'
            },
            select: {
                name: 'Selection',
                shortcut: 'V'
            },
            text: {
                name: 'Text',
                shortcut: 'T'
            },
            gradient: {
                name: 'Gradient',
                shortcut: 'G'
            }
        };
    }

    selectTool(tool) {
        if (!this.tools[tool]) return;
        
        this.state.tool = tool;
        this.elements.currentTool.textContent = this.tools[tool].name;
        this.elements.selectedTool.textContent = this.tools[tool].name;
        
        // Update active tool button
        this.elements.toolBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tool === tool) {
                btn.classList.add('active');
            }
        });
        
        // Show/hide tool-specific controls
        if (tool === 'spray') {
            this.elements.sprayDensityControl.style.display = 'flex';
        } else {
            this.elements.sprayDensityControl.style.display = 'none';
        }
        
        if (['rectangle', 'circle'].includes(tool)) {
            this.elements.shapeFillControl.style.display = 'flex';
        } else {
            this.elements.shapeFillControl.style.display = 'none';
        }
        
        if (tool === 'gradient') {
            this.elements.gradientControl.style.display = 'flex';
        } else {
            this.elements.gradientControl.style.display = 'none';
        }
        
        // Clear selection if switching from selection tool
        if (tool !== 'select' && tool !== 'move') {
            this.clearSelection();
        }
    }

    optimizeColors() {
        const layer = this.layers[this.currentLayer];
        if (!layer) return;
        
        // Count unique colors
        const colorCount = {};
        for (const color of layer.pixels) {
            if (color && color !== 'transparent') {
                const hex = this.rgbaToHex(color);
                colorCount[hex] = (colorCount[hex] || 0) + 1;
            }
        }
        
        // Reduce to 16 colors (typical palette size)
        const colors = Object.keys(colorCount).sort((a, b) => colorCount[b] - colorCount[a]);
        const reducedColors = colors.slice(0, 16);
        
        // Map old colors to new ones
        const colorMap = {};
        for (const color of colors) {
            const parsedColor = this.parseColor(color);
            // Find closest color in reduced palette
            let closestColor = reducedColors[0];
            let closestDistance = Infinity;
            
            for (const reducedColor of reducedColors) {
                const parsedReduced = this.parseColor(reducedColor);
                const distance = Math.sqrt(
                    Math.pow(parsedColor.r - parsedReduced.r, 2) +
                    Math.pow(parsedColor.g - parsedReduced.g, 2) +
                    Math.pow(parsedColor.b - parsedReduced.b, 2)
                );
                
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestColor = reducedColor;
                }
            }
            
            colorMap[color] = closestColor;
        }
        
        // Apply color reduction
        for (let i = 0; i < layer.pixels.length; i++) {
            if (layer.pixels[i] && layer.pixels[i] !== 'transparent') {
                const hex = this.rgbaToHex(layer.pixels[i]);
                if (colorMap[hex]) {
                    layer.pixels[i] = colorMap[hex];
                }
            }
        }
        
        this.updateAllPixels();
        this.saveHistory();
        this.showNotification(`Optimized colors: ${colors.length} → ${reducedColors.length}`, 'success');
    }

    generatePalette() {
        const layer = this.layers[this.currentLayer];
        if (!layer) return;
        
        // Extract unique colors
        const uniqueColors = new Set();
        for (const color of layer.pixels) {
            if (color && color !== 'transparent') {
                uniqueColors.add(this.rgbaToHex(color));
            }
        }
        
        // Convert to array and sort
        const colors = Array.from(uniqueColors).sort();
        
        // Update palette
        this.palette = [...colors];
        if (this.palette.length < 20) {
            // Add default colors if palette is small
            const defaultColors = [
                '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
                '#ffff00', '#ff00ff', '#00ffff', '#ff8000', '#8000ff'
            ];
            defaultColors.forEach(color => {
                if (!this.palette.includes(color)) {
                    this.palette.push(color);
                }
            });
            this.palette = this.palette.slice(0, 20);
        }
        
        this.generateColorPalette();
        this.showNotification(`Generated palette with ${colors.length} colors`, 'success');
    }

    updateUI() {
        // Update brush controls
        this.elements.brushSizeValue.textContent = this.state.brushSize;
        this.elements.brushSizeDisplay.textContent = `${this.state.brushSize}px`;
        this.elements.opacityValue.textContent = `${this.state.opacity}%`;
        this.elements.sprayDensityValue.textContent = `${this.state.sprayDensity}%`;
        
        // Update layer controls
        if (this.layers[this.currentLayer]) {
            this.elements.layerOpacityValue.textContent = `${this.layers[this.currentLayer].opacity}%`;
        }
        
        // Update pixel size
        this.elements.pixelSizeValue.textContent = `${this.canvas.pixelSize}px`;
        
        // Update grid toggle
        this.elements.gridToggleBtn.classList.toggle('active', this.state.showGrid);
        
        // Update snap toggle
        this.elements.snapToggle.checked = this.state.snapToGrid;
        
        // Update anti-alias toggle
        this.elements.antiAliasToggle.checked = this.state.antiAlias;
    }

    updateMemoryUsage() {
        // Calculate approximate memory usage
        let totalMemory = 0;
        
        // Layers memory
        this.layers.forEach(layer => {
            totalMemory += layer.pixels.length * 4; // 4 bytes per pixel (RGBA)
        });
        
        // History memory
        this.history.forEach(state => {
            state.layers.forEach(layer => {
                totalMemory += layer.pixels.length * 4;
            });
        });
        
        // Animation frames memory
        this.animation.frames.forEach(frame => {
            frame.layers.forEach(layer => {
                totalMemory += layer.pixels.length * 4;
            });
        });
        
        const memoryKB = Math.round(totalMemory / 1024);
        this.elements.memoryUsage.textContent = `${memoryKB} KB`;
        
        // Update periodically
        setTimeout(() => this.updateMemoryUsage(), 5000);
    }

    startFpsCounter() {
        const calculateFps = (timestamp) => {
            this.frameCount++;
            
            if (timestamp >= this.lastFpsUpdate + 1000) {
                this.fps = Math.round((this.frameCount * 1000) / (timestamp - this.lastFpsUpdate));
                this.elements.fpsCounter.textContent = `${this.fps} FPS`;
                this.frameCount = 0;
                this.lastFpsUpdate = timestamp;
            }
            
            requestAnimationFrame(calculateFps);
        };
        
        requestAnimationFrame(calculateFps);
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        const messageEl = document.getElementById('notificationMessage');
        const icon = notification.querySelector('.notification-icon');
        
        messageEl.textContent = message;
        
        // Set icon based on type
        notification.className = 'notification';
        icon.className = 'notification-icon';
        
        switch(type) {
            case 'success':
                icon.classList.add('success');
                icon.innerHTML = '<i class="fas fa-check-circle"></i>';
                notification.style.borderLeft = '4px solid var(--success)';
                break;
            case 'warning':
                icon.classList.add('warning');
                icon.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
                notification.style.borderLeft = '4px solid var(--warning)';
                break;
            case 'error':
                icon.classList.add('error');
                icon.innerHTML = '<i class="fas fa-times-circle"></i>';
                notification.style.borderLeft = '4px solid var(--danger)';
                break;
            default:
                icon.classList.add('info');
                icon.innerHTML = '<i class="fas fa-info-circle"></i>';
                notification.style.borderLeft = '4px solid var(--info)';
        }
        
        notification.classList.add('show');
        
        // Auto hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    setupEventListeners() {
        // Tool selection
        this.elements.toolBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectTool(btn.dataset.tool);
            });
        });
        
        // Color picker
        this.elements.colorPicker.addEventListener('input', (e) => {
            this.setColor(e.target.value);
        });
        
        // Swap colors on previous color click
        this.elements.previousColorDisplay.addEventListener('click', () => {
            const temp = this.state.color;
            this.setColor(this.state.previousColor);
            this.state.previousColor = temp;
            this.elements.previousColorDisplay.style.backgroundColor = this.state.previousColor;
        });
        
        // Brush controls
        this.elements.brushSize.addEventListener('input', (e) => {
            this.state.brushSize = parseInt(e.target.value);
            this.updateUI();
        });
        
        this.elements.opacity.addEventListener('input', (e) => {
            this.state.opacity = parseInt(e.target.value);
            this.updateUI();
        });
        
        this.elements.sprayDensity.addEventListener('input', (e) => {
            this.state.sprayDensity = parseInt(e.target.value);
            this.updateUI();
        });
        
        this.elements.shapeFillStyle.addEventListener('change', (e) => {
            this.state.shapeFillStyle = e.target.value;
        });
        
        this.elements.gradientType.addEventListener('change', (e) => {
            this.state.gradientType = e.target.value;
        });
        
        this.elements.pixelSize.addEventListener('input', (e) => {
            this.canvas.pixelSize = parseInt(e.target.value);
            this.createCanvasGrid();
            this.updateUI();
        });
        
        // Canvas controls
        this.elements.canvasWidth.addEventListener('change', () => this.updateCanvasSize());
        this.elements.canvasHeight.addEventListener('change', () => this.updateCanvasSize());
        
        this.elements.clearBtn.addEventListener('click', () => this.clearCanvas());
        this.elements.gridToggleBtn.addEventListener('click', () => this.toggleGrid());
        this.elements.zoomInBtn.addEventListener('click', () => this.zoomIn());
        this.elements.zoomOutBtn.addEventListener('click', () => this.zoomOut());
        this.elements.zoomResetBtn.addEventListener('click', () => this.resetZoom());
        this.elements.flipHorizontalBtn.addEventListener('click', () => this.flipHorizontal());
        this.elements.flipVerticalBtn.addEventListener('click', () => this.flipVertical());
        this.elements.sidebarToggle.addEventListener('click', () => this.toggleSidebars());
        
        this.elements.snapToggle.addEventListener('change', (e) => {
            this.state.snapToGrid = e.target.checked;
        });
        
        this.elements.antiAliasToggle.addEventListener('change', (e) => {
            this.state.antiAlias = e.target.checked;
        });
        
        // Layer controls
        this.elements.addLayerBtn.addEventListener('click', () => this.addLayer());
        this.elements.deleteLayerBtn.addEventListener('click', () => this.deleteLayer());
        this.elements.duplicateLayerBtn.addEventListener('click', () => this.duplicateLayer());
        this.elements.mergeLayerBtn.addEventListener('click', () => this.mergeLayers());
        this.elements.toggleVisibilityBtn.addEventListener('click', () => this.toggleLayerVisibility());
        this.elements.lockLayerBtn.addEventListener('click', () => this.toggleLayerLock());
        
        this.elements.layerOpacity.addEventListener('input', (e) => {
            if (this.layers[this.currentLayer]) {
                this.layers[this.currentLayer].opacity = parseInt(e.target.value);
                this.updateUI();
                this.updateLayersUI();
                this.updateAllPixels();
            }
        });
        
        this.elements.layerName.addEventListener('change', (e) => {
            if (this.layers[this.currentLayer]) {
                this.layers[this.currentLayer].name = e.target.value;
                this.updateLayersUI();
            }
        });
        
        this.elements.blendMode.addEventListener('change', (e) => {
            if (this.layers[this.currentLayer]) {
                this.layers[this.currentLayer].blendMode = e.target.value;
                this.updateLayersUI();
                this.updateAllPixels();
            }
        });
        
        // Effects
        this.elements.effectBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.applyEffect(btn.dataset.effect);
            });
        });
        
        // Export controls
        this.elements.exportBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons in the same group
                const group = btn.closest('.option-buttons');
                group.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
                
                // Add active class to clicked button
                btn.classList.add('active');
                
                // Update export settings
                if (btn.dataset.format) {
                    this.exportSettings.format = btn.dataset.format;
                    // Show/hide GIF options
                    const gifOptions = document.querySelectorAll('.export-options .option-group:nth-child(5)');
                    gifOptions.forEach(opt => {
                        opt.style.display = btn.dataset.format === 'gif' ? 'block' : 'none';
                    });
                }
                if (btn.dataset.scale) this.exportSettings.scale = parseInt(btn.dataset.scale);
                if (btn.dataset.bg) {
                    this.exportSettings.background = btn.dataset.bg;
                    if (btn.dataset.bg === 'custom') {
                        this.elements.customBgContainer.style.display = 'block';
                    } else {
                        this.elements.customBgContainer.style.display = 'none';
                    }
                }
                if (btn.dataset.quality) this.exportSettings.quality = btn.dataset.quality;
                
                this.updateExportPreview();
            });
        });
        
        this.elements.customBgColor.addEventListener('input', (e) => {
            this.exportSettings.customBg = e.target.value;
            this.updateExportPreview();
        });
        
        this.elements.gifDelay.addEventListener('input', (e) => {
            this.exportSettings.gifDelay = parseInt(e.target.value);
            this.elements.gifDelayValue.textContent = e.target.value;
        });
        
        this.elements.gifLoops.addEventListener('input', (e) => {
            this.exportSettings.gifLoops = parseInt(e.target.value);
            this.elements.gifLoopsValue.textContent = e.target.value;
        });
        
        this.elements.downloadBtn.addEventListener('click', () => this.downloadImage());
        this.elements.copyBtn.addEventListener('click', () => this.copyToClipboard());
        this.elements.shareBtn.addEventListener('click', () => {
            if (navigator.share) {
                const canvas = this.exportImage();
                canvas.toBlob(blob => {
                    const file = new File([blob], 'pixelart.png', { type: 'image/png' });
                    navigator.share({
                        files: [file],
                        title: 'Pixel Art',
                        text: 'Check out my pixel art!'
                    }).catch(() => this.showNotification('Sharing cancelled', 'info'));
                });
            } else {
                this.showNotification('Web Share API not supported', 'error');
            }
        });
        
        // Header buttons
        this.elements.newBtn.addEventListener('click', () => {
            this.modals.newProject.classList.add('active');
        });
        
        this.elements.saveBtn.addEventListener('click', () => this.saveProject());
        this.elements.openBtn.addEventListener('click', () => this.elements.projectFileInput.click());
        this.elements.exportBtn.addEventListener('click', () => this.openExportModal());
        this.elements.importBtn.addEventListener('click', () => this.openImportModal());
        this.elements.undoBtn.addEventListener('click', () => this.undo());
        this.elements.redoBtn.addEventListener('click', () => this.redo());
        this.elements.fullscreenBtn.addEventListener('click', this.toggleFullscreen);
        this.elements.helpBtn.addEventListener('click', () => {
            this.modals.help.classList.add('active');
        });
        
        this.elements.optimizeBtn.addEventListener('click', () => this.optimizeColors());
        this.elements.paletteBtn.addEventListener('click', () => this.generatePalette());
        this.elements.animationBtn.addEventListener('click', () => this.openAnimationModal());
        
        // File inputs
        this.elements.projectFileInput.addEventListener('change', (e) => {
            this.loadProject(e.target.files[0]);
            e.target.value = '';
        });
        
        this.elements.importFile.addEventListener('change', (e) => {
            this.handleImageImport(e.target.files[0]);
        });
        
        // Import options
        this.elements.importOptions.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons in the same group
                const group = btn.closest('.option-buttons');
                group.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
                
                // Add active class to clicked button
                btn.classList.add('active');
                
                // Update import settings
                this.importSettings.method = btn.dataset.import;
            });
        });
        
        this.elements.resizeMethod.addEventListener('change', (e) => {
            this.importSettings.resizeMethod = e.target.value;
        });
        
        this.elements.ditheringMethod.addEventListener('change', (e) => {
            this.importSettings.dithering = e.target.value;
        });
        
        this.elements.colorReduction.addEventListener('change', (e) => {
            this.importSettings.colorReduction = e.target.value;
        });
        
        this.elements.confirmImportBtn.addEventListener('click', () => this.confirmImageImport());
        this.elements.cancelImportBtn.addEventListener('click', () => {
            this.modals.import.classList.remove('active');
        });
        
        // Resize options
        this.elements.anchorBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.elements.anchorBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.resizeSettings.anchor = btn.dataset.anchor;
            });
        });
        
        this.elements.resizeOptions.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons in the same group
                const group = btn.closest('.option-buttons');
                group.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
                
                // Add active class to clicked button
                btn.classList.add('active');
                
                // Update resize settings
                this.resizeSettings.method = btn.dataset.resize;
            });
        });
        
        this.elements.resizeBg.addEventListener('input', (e) => {
            this.resizeSettings.backgroundColor = e.target.value;
        });
        
        this.elements.confirmResizeBtn.addEventListener('click', () => this.confirmCanvasResize());
        this.elements.cancelResizeBtn.addEventListener('click', () => {
            this.modals.resize.classList.remove('active');
        });
        
        // Animation controls
        this.elements.addFrameBtn.addEventListener('click', () => this.addFrame());
        this.elements.removeFrameBtn.addEventListener('click', () => this.removeFrame());
        this.elements.duplicateFrameBtn.addEventListener('click', () => this.duplicateFrame());
        this.elements.playAnimationBtn.addEventListener('click', () => this.playAnimation());
        this.elements.stopAnimationBtn.addEventListener('click', () => this.stopAnimation());
        this.elements.exportAnimationBtn.addEventListener('click', () => this.exportAnimation());
        this.elements.closeAnimationBtn.addEventListener('click', () => {
            this.modals.animation.classList.remove('active');
        });
        
        this.elements.frameDelay.addEventListener('input', (e) => {
            this.animation.delay = parseInt(e.target.value);
            this.elements.frameDelayValue.textContent = e.target.value;
        });
        
        this.elements.loopCount.addEventListener('input', (e) => {
            this.animation.loopCount = parseInt(e.target.value);
            this.elements.loopCountValue.textContent = e.target.value;
        });
        
        this.elements.onionOpacity.addEventListener('input', (e) => {
            this.animation.onionOpacity = parseInt(e.target.value) / 100;
            this.elements.onionOpacityValue.textContent = `${e.target.value}%`;
            this.updateAnimationPreview();
        });
        
        // Text tool
        this.elements.insertTextBtn.addEventListener('click', () => this.insertText());
        this.elements.cancelTextBtn.addEventListener('click', () => {
            this.modals.text.classList.remove('active');
            this.elements.textInput.value = '';
        });
        
        // Gradient editor
        this.elements.applyGradientBtn.addEventListener('click', () => this.applyGradient());
        this.elements.cancelGradientBtn.addEventListener('click', () => {
            this.modals.gradient.classList.remove('active');
        });
        
        // Modal close buttons
        this.elements.closeExportModal.addEventListener('click', () => {
            this.modals.export.classList.remove('active');
        });
        
        this.elements.closeNewProjectModal.addEventListener('click', () => {
            this.modals.newProject.classList.remove('active');
        });
        
        this.elements.closeHelpModal.addEventListener('click', () => {
            this.modals.help.classList.remove('active');
        });
        
        this.elements.closeImportModal.addEventListener('click', () => {
            this.modals.import.classList.remove('active');
        });
        
        this.elements.closeResizeModal.addEventListener('click', () => {
            this.modals.resize.classList.remove('active');
        });
        
        this.elements.closeAnimationModal.addEventListener('click', () => {
            this.modals.animation.classList.remove('active');
            this.stopAnimation();
        });
        
        this.elements.closeTextModal.addEventListener('click', () => {
            this.modals.text.classList.remove('active');
            this.elements.textInput.value = '';
        });
        
        this.elements.closeGradientModal.addEventListener('click', () => {
            this.modals.gradient.classList.remove('active');
        });
        
        // Close modals on background click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                    if (modal === this.modals.animation) {
                        this.stopAnimation();
                    }
                }
            });
        });
        
        // Close notification
        document.querySelector('.notification-close').addEventListener('click', () => {
            document.getElementById('notification').classList.remove('show');
        });
        
        // New project form
        this.elements.createProjectBtn.addEventListener('click', () => {
            const width = parseInt(document.getElementById('projectWidth').value);
            const height = parseInt(document.getElementById('projectHeight').value);
            const template = document.getElementById('projectTemplate').value;
            const bgColor = document.getElementById('projectBg').value;
            
            // Apply template sizes
            let templateWidth = width;
            let templateHeight = height;
            switch(template) {
                case 'pixelart':
                    templateWidth = 32;
                    templateHeight = 32;
                    break;
                case 'icon':
                    templateWidth = 64;
                    templateHeight = 64;
                    break;
                case 'sprite':
                    templateWidth = 16;
                    templateHeight = 16;
                    break;
                case 'character':
                    templateWidth = 32;
                    templateHeight = 48;
                    break;
                case 'tileset':
                    templateWidth = 128;
                    templateHeight = 128;
                    break;
                case 'avatar':
                    templateWidth = 128;
                    templateHeight = 128;
                    break;
                case 'banner':
                    templateWidth = 256;
                    templateHeight = 128;
                    break;
                case 'animation':
                    templateWidth = 64;
                    templateHeight = 64;
                    break;
            }
            
            // Update canvas size
            this.canvas.width = templateWidth;
            this.canvas.height = templateHeight;
            this.canvas.backgroundColor = bgColor;
            this.elements.canvasWidth.value = templateWidth;
            this.elements.canvasHeight.value = templateHeight;
            
            // Create new project
            this.initLayers();
            this.initAnimation();
            this.updateCanvasSize();
            this.saveHistory();
            
            this.modals.newProject.classList.remove('active');
            this.showNotification('New project created', 'success');
        });
        
        this.elements.cancelProjectBtn.addEventListener('click', () => {
            this.modals.newProject.classList.remove('active');
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Don't trigger shortcuts if user is typing in an input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
                // Allow some shortcuts even when typing
                if (!['Escape', 'Tab', 'Enter'].includes(e.key)) {
                    return;
                }
            }
            
            // Tool shortcuts
            switch(e.key.toLowerCase()) {
                case 'p': this.selectTool('pencil'); break;
                case 'e': this.selectTool('eraser'); break;
                case 'b': this.selectTool('bucket'); break;
                case 'i': this.selectTool('picker'); break;
                case 'l': this.selectTool('line'); break;
                case 'r': this.selectTool('rectangle'); break;
                case 'c': this.selectTool('circle'); break;
                case 's': this.selectTool('spray'); break;
                case 't': this.selectTool('text'); break;
                case 'v': this.selectTool('select'); break;
                case 'm': this.selectTool('move'); break;
                case 'g': this.selectTool('gradient'); break;
            }
            
            // Brush size shortcuts
            if (e.key === '[') {
                this.state.brushSize = Math.max(1, this.state.brushSize - 1);
                this.updateUI();
            } else if (e.key === ']') {
                this.state.brushSize = Math.min(20, this.state.brushSize + 1);
                this.updateUI();
            }
            
            // Opacity shortcuts
            if (e.shiftKey && e.key === '[') {
                this.state.opacity = Math.max(1, this.state.opacity - 10);
                this.updateUI();
            } else if (e.shiftKey && e.key === ']') {
                this.state.opacity = Math.min(100, this.state.opacity + 10);
                this.updateUI();
            }
            
            // Color shortcuts
            if (e.key.toLowerCase() === 'x') {
                const temp = this.state.color;
                this.setColor(this.state.previousColor);
                this.state.previousColor = temp;
                this.elements.previousColorDisplay.style.backgroundColor = this.state.previousColor;
            } else if (e.key.toLowerCase() === 'd') {
                this.setColor('#000000');
                this.state.previousColor = '#ffffff';
                this.elements.previousColorDisplay.style.backgroundColor = this.state.previousColor;
            } else if (e.key.toLowerCase() === 'f') {
                // Fill with foreground color
                const layer = this.layers[this.currentLayer];
                if (layer && !layer.locked) {
                    const fillColor = this.getColorWithOpacity(this.state.color, this.state.opacity / 100);
                    layer.pixels.fill(fillColor);
                    this.updateAllPixels();
                    this.saveHistory();
                }
            }
            
            // Alt key for temporary color picker
            if (e.key === 'Alt') {
                this.altKeyPressed = true;
                document.body.style.cursor = 'crosshair';
            }
            
            // Action shortcuts
            if (e.ctrlKey || e.metaKey) {
                switch(e.key.toLowerCase()) {
                    case 'z':
                        e.preventDefault();
                        this.undo();
                        break;
                    case 'y':
                        e.preventDefault();
                        this.redo();
                        break;
                    case 's':
                        e.preventDefault();
                        this.saveProject();
                        break;
                    case 'e':
                        e.preventDefault();
                        this.openExportModal();
                        break;
                    case 'o':
                        e.preventDefault();
                        this.elements.openBtn.click();
                        break;
                    case 'n':
                        e.preventDefault();
                        this.elements.newBtn.click();
                        break;
                    case 'i':
                        e.preventDefault();
                        this.openImportModal();
                        break;
                    case 'g':
                        e.preventDefault();
                        this.toggleGrid();
                        break;
                    case '=':
                    case '+':
                        if (!e.shiftKey) {
                            e.preventDefault();
                            this.zoomIn();
                        }
                        break;
                    case '-':
                        e.preventDefault();
                        this.zoomOut();
                        break;
                    case '0':
                        e.preventDefault();
                        this.resetZoom();
                        break;
                    case 'j':
                        e.preventDefault();
                        this.duplicateLayer();
                        break;
                }
            }
            
            // Layer shortcuts
            if (e.ctrlKey && e.shiftKey) {
                switch(e.key.toLowerCase()) {
                    case 'n':
                        e.preventDefault();
                        this.addLayer();
                        break;
                    case 'e':
                        e.preventDefault();
                        this.mergeLayers();
                        break;
                    case 'arrowup':
                        e.preventDefault();
                        this.moveLayerUp();
                        break;
                    case 'arrowdown':
                        e.preventDefault();
                        this.moveLayerDown();
                        break;
                    case 'v':
                        e.preventDefault();
                        this.toggleLayerVisibility();
                        break;
                    case 'l':
                        e.preventDefault();
                        this.toggleLayerLock();
                        break;
                }
            }
            
            // Delete selection or clear
            if (e.key === 'Delete') {
                if (this.selection.active) {
                    this.deleteSelection();
                } else {
                    this.clearCanvas();
                }
            }
            
            // Escape key
            if (e.key === 'Escape') {
                // Close all modals
                document.querySelectorAll('.modal.active').forEach(modal => {
                    modal.classList.remove('active');
                });
                
                // Stop animation
                this.stopAnimation();
                
                // Clear selection
                this.clearSelection();
            }
            
            // Fullscreen
            if (e.key === 'F11') {
                e.preventDefault();
                this.toggleFullscreen();
            }
            
            // Help
            if (e.key === '?') {
                e.preventDefault();
                this.modals.help.classList.add('active');
            }
            
            // Tab key to cycle tools
            if (e.key === 'Tab') {
                e.preventDefault();
                const tools = Object.keys(this.tools);
                const currentIndex = tools.indexOf(this.state.tool);
                const nextIndex = (currentIndex + 1) % tools.length;
                this.selectTool(tools[nextIndex]);
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (e.key === 'Alt') {
                this.altKeyPressed = false;
                document.body.style.cursor = '';
            }
        });
        
        // Mouse wheel zoom
        this.elements.canvas.addEventListener('wheel', (e) => {
            if (e.ctrlKey) {
                e.preventDefault();
                if (e.deltaY < 0) {
                    this.zoomIn();
                } else {
                    this.zoomOut();
                }
            }
        });
        
        // Update cursor position
        this.elements.canvas.addEventListener('mousemove', (e) => {
            const rect = this.elements.canvas.getBoundingClientRect();
            const scaledPixelSize = this.canvas.pixelSize * this.state.zoom;
            const x = Math.floor((e.clientX - rect.left) / scaledPixelSize);
            const y = Math.floor((e.clientY - rect.top) / scaledPixelSize);
            
            if (x >= 0 && x < this.canvas.width && y >= 0 && y < this.canvas.height) {
                this.elements.cursorPosition.textContent = `${x},${y}`;
            }
        });
        
        // Global mouse up
        document.addEventListener('mouseup', () => {
            this.stopDrawing();
            this.finalizeSelection();
            this.stopSelectionMove();
            this.stopSelectionResize();
        });
        
        // Global mouse leave
        this.elements.canvas.addEventListener('mouseleave', () => {
            this.stopDrawing();
            this.finalizeSelection();
            this.stopSelectionMove();
            this.stopSelectionResize();
        });
        
        // Context menu for canvas
        this.elements.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            // Could implement context menu for quick tools
        });
        
        // Prevent default drag behavior
        document.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('layer-item')) {
                return; // Allow layer drag and drop
            }
            e.preventDefault();
        });
        
        document.addEventListener('drop', (e) => {
            e.preventDefault();
        });
        
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
        
        // Initialize with default tool
        this.selectTool('pencil');
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    toggleSidebars() {
        document.querySelectorAll('.sidebar').forEach(sidebar => {
            sidebar.classList.toggle('collapsed');
        });
    }

    deleteSelection() {
        if (!this.selection.active || !this.selection.pixels) return;
        
        const layer = this.layers[this.currentLayer];
        if (!layer || layer.locked) return;
        
        for (let y = 0; y < this.selection.height; y++) {
            for (let x = 0; x < this.selection.width; x++) {
                const canvasX = this.selection.x + x;
                const canvasY = this.selection.y + y;
                if (this.isInBounds(canvasX, canvasY)) {
                    const index = canvasY * this.canvas.width + canvasX;
                    layer.pixels[index] = null;
                }
            }
        }
        
        this.updateAllPixels();
        this.saveHistory();
        this.showNotification('Selection deleted', 'success');
        
        // Clear selection
        this.clearSelection();
    }
}

// Initialize the editor when the page loads
window.addEventListener('DOMContentLoaded', () => {
    const editor = new PixelCanvas();
    window.pixelEditor = editor;
    
    // Add loading animation
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.3s';
        document.body.style.opacity = '1';
    }, 100);
});

// Handle page unload
window.addEventListener('beforeunload', (e) => {
    // You could add a check for unsaved changes here
    // e.preventDefault();
    // e.returnValue = '';
});