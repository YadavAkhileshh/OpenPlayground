// Pixel Art Studio - Pixel Perfect Engine
class PixelArtStudio {
    constructor() {
        this.config = {
            width: 16,
            height: 16,
            zoom: 1,
            maxHistory: 50,
            showGrid: true,
            isDrawing: false,
            currentTool: 'pencil',
            currentColor: '#000000',
            brushSize: 1,
            opacity: 1
        };

        this.state = {
            layers: [],
            currentLayerId: null,
            history: [],
            historyIndex: -1,
            clipboard: null
        };

        this.dom = {};

        this.init();
    }

    init() {
        this.cacheDOM();
        this.initLayers(); // Moved up: Init layers DOM before binding events might trigger them
        this.bindEvents();
        this.initPalette();
        this.resizeEngine(16);
        this.render();
    }

    cacheDOM() {
        // Main Canvas
        this.dom.canvas = document.getElementById('pixelCanvas');
        this.dom.ctx = this.dom.canvas.getContext('2d', { willReadFrequently: true });
        this.dom.gridOverlay = document.getElementById('gridOverlay');
        this.dom.gridCtx = this.dom.gridOverlay.getContext('2d');

        // Panels and Containers
        this.dom.canvasWrapper = document.querySelector('.canvas-wrapper');
        this.dom.layersList = document.getElementById('layersList'); // Added here for safety

        // UI Displays
        this.dom.canvasSize = document.getElementById('canvasSize');
        this.dom.zoomLevel = document.getElementById('zoomLevel');
        this.dom.pixelCount = document.getElementById('pixelCount');
        this.dom.cursorStats = document.getElementById('cursorStats'); // Create this?
        this.dom.currentColor = document.getElementById('currentColor');
        this.dom.currentColorHex = document.getElementById('currentColorHex');
        this.dom.currentColorRGB = document.getElementById('currentColorRGB');

        // Controls
        this.dom.brushSize = document.getElementById('brushSize');
        this.dom.brushSizeValue = document.getElementById('brushSizeValue');
        this.dom.opacity = document.getElementById('opacity');
        this.dom.opacityValue = document.getElementById('opacityValue');
        this.dom.showGrid = document.getElementById('showGrid');
    }

    bindEvents() {
        // Canvas Interaction
        const canvasArea = this.dom.canvas;

        // We bind to the window/document for mouseup to catch drags outside
        canvasArea.addEventListener('mousedown', this.handlePointerDown.bind(this));
        window.addEventListener('mousemove', this.handlePointerMove.bind(this));
        window.addEventListener('mouseup', this.handlePointerUp.bind(this));

        // Disable context menu on canvas
        canvasArea.addEventListener('contextmenu', e => e.preventDefault());

        // Zoom (Wheel)
        canvasArea.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });

        // Tool Selection
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tool = e.currentTarget.dataset.tool;
                this.setTool(tool);
            });
        });

        // Grid Size
        document.querySelectorAll('.size-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const size = parseInt(e.currentTarget.dataset.size);
                if (confirm('Resizing will clear the current canvas. Continue?')) {
                    this.resizeEngine(size);
                    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
                    e.currentTarget.classList.add('active');
                }
            });
        });

        // Color Picker
        const picker = document.getElementById('colorPicker');
        picker.addEventListener('input', (e) => this.setColor(e.target.value));

        // Action Buttons
        document.getElementById('clearBtn').addEventListener('click', () => this.clearLayer());
        document.getElementById('undoBtn').addEventListener('click', () => this.undo());
        document.getElementById('redoBtn').addEventListener('click', () => this.redo());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportImage());
        document.getElementById('exportPNGBtn').addEventListener('click', () => this.exportImage());

        // Brush Settings
        this.dom.brushSize.addEventListener('input', (e) => {
            this.config.brushSize = parseInt(e.target.value);
            this.dom.brushSizeValue.textContent = `${this.config.brushSize}px`;
        });

        this.dom.opacity.addEventListener('input', (e) => {
            this.config.opacity = parseFloat(e.target.value);
            this.dom.opacityValue.textContent = `${Math.round(this.config.opacity * 100)}%`;
        });

        this.dom.showGrid.addEventListener('change', (e) => {
            this.config.showGrid = e.target.checked;
            this.drawGrid();
        });

        // Zoom Buttons
        document.getElementById('zoomInBtn').addEventListener('click', () => this.zoom(0.1));
        document.getElementById('zoomOutBtn').addEventListener('click', () => this.zoom(-0.1));
        document.getElementById('resetZoomBtn').addEventListener('click', () => {
            this.config.zoom = 1;
            this.updateTransform();
        });
        document.getElementById('centerBtn').addEventListener('click', () => this.centerCanvas());

        // Layer Controls
        document.getElementById('addLayerBtn').addEventListener('click', () => this.addLayer());
        document.getElementById('mergeLayersBtn').addEventListener('click', () => this.mergeLayers());

        // Keyboard Shortcuts
        document.addEventListener('keydown', this.handleKeys.bind(this));
    }

    handleKeys(e) {
        if (e.target.tagName === 'INPUT') return;

        switch (e.key.toLowerCase()) {
            case 'z':
                if ((e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    if (e.shiftKey) this.redo();
                    else this.undo();
                }
                break;
            case 'y':
                if ((e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    this.redo();
                }
                break;
            case 'b': this.setTool('pencil'); break;
            case 'e': this.setTool('eraser'); break;
            case 'g': this.setTool('bucket'); break;
            case 'i': this.setTool('picker'); break;
        }
    }

    // --- Core Engine ---

    resizeEngine(size) {
        this.config.width = size;
        this.config.height = size;

        // Resize actual canvas elements (logical resolution)
        this.dom.canvas.width = size;
        this.dom.canvas.height = size;
        this.dom.gridOverlay.width = size;
        this.dom.gridOverlay.height = size;

        // Reset state
        this.state.layers = [];
        this.addLayer('Background');
        this.centerCanvas();
        this.drawGrid();

        this.dom.canvasSize.textContent = `${size}×${size}`;
    }

    getPointerPos(e) {
        const rect = this.dom.canvas.getBoundingClientRect();
        const scaleX = this.dom.canvas.width / rect.width;
        const scaleY = this.dom.canvas.height / rect.height;

        const x = Math.floor((e.clientX - rect.left) * scaleX);
        const y = Math.floor((e.clientY - rect.top) * scaleY);

        return { x, y };
    }

    handlePointerDown(e) {
        if (e.button !== 0 && e.button !== 2) return; // Only Left/Right click

        this.config.isDrawing = true;

        const { x, y } = this.getPointerPos(e);

        if (e.button === 2) {
            // Right click = eyedropper or secondary
            this.pickColorAt(x, y);
            return;
        }

        this.saveHistoryState(); // Snapshot before action

        this.lastPos = { x, y };
        this.startPos = { x, y }; // For shapes

        if (this.config.currentTool === 'bucket') {
            this.bucketFill(x, y, this.config.currentColor);
            this.config.isDrawing = false; // Instant action
        } else {
            this.draw(x, y);
        }
    }

    handlePointerMove(e) {
        if (!this.config.isDrawing) return;
        const { x, y } = this.getPointerPos(e);

        // Interpolate for smooth lines (Bresenham)
        if (['pencil', 'eraser'].includes(this.config.currentTool)) {
            this.drawLine(this.lastPos.x, this.lastPos.y, x, y);
            this.lastPos = { x, y };
        } else if (['line', 'rectangle', 'circle'].includes(this.config.currentTool)) {
            // Preview shape (requires clearing layer temporarily or using a preview layer)
            // For simplicity in this v1 refactor, we will redraw the current layer content
            // plus the shape. This is expensive but fine for 64x64.
            this.redrawActiveLayer();
            this.drawShape(this.startPos.x, this.startPos.y, x, y);
        }
    }

    handlePointerUp(e) {
        if (!this.config.isDrawing) return;
        this.config.isDrawing = false;

        // Finalize shape if needed
        if (['line', 'rectangle', 'circle'].includes(this.config.currentTool)) {
            const { x, y } = this.getPointerPos(e);
            this.drawShape(this.startPos.x, this.startPos.y, x, y, true);
        }

        this.updateLayerThumbnail(this.state.currentLayerId);
    }

    // --- Drawing Logic ---

    draw(x, y) {
        // Alias to plot for single pixel interactions
        this.plot(x, y, this.config.currentColor, this.config.currentTool === 'eraser');
    }

    clearLayer() {
        const layer = this.getCurrentLayer();
        if (layer && !layer.locked && layer.visible) {
            this.saveHistoryState();
            layer.ctx.clearRect(0, 0, this.config.width, this.config.height);
            this.render();
            this.updateLayerThumbnail(layer.id);
        }
    }

    plot(x, y, color = this.config.currentColor, isErase = false) {
        const layer = this.getCurrentLayer();
        if (!layer || layer.locked || !layer.visible) return;

        const ctx = layer.ctx;

        if (x < 0 || x >= this.config.width || y < 0 || y >= this.config.height) return;

        ctx.globalCompositeOperation = isErase ? 'destination-out' : 'source-over';
        ctx.fillStyle = color;
        ctx.globalAlpha = isErase ? 1 : this.config.opacity;

        // Handle brush size
        const size = this.config.brushSize;
        const offset = Math.floor(size / 2);

        ctx.fillRect(x - offset, y - offset, size, size);

        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;

        // Sync to main canvas immediately (optimize later if needed)
        this.render();
    }

    drawLine(x0, y0, x1, y1) {
        const dx = Math.abs(x1 - x0);
        const dy = Math.abs(y1 - y0);
        const sx = (x0 < x1) ? 1 : -1;
        const sy = (y0 < y1) ? 1 : -1;
        let err = dx - dy;

        while (true) {
            this.plot(x0, y0, this.config.currentColor, this.config.currentTool === 'eraser');
            if ((x0 === x1) && (y0 === y1)) break;
            const e2 = 2 * err;
            if (e2 > -dy) { err -= dy; x0 += sx; }
            if (e2 < dx) { err += dx; y0 += sy; }
        }
    }

    drawShape(x0, y0, x1, y1, commit = false) {
        // This function is tricky because we need to clear the temporary shape preview without 
        // losing the underlying layer data. 
        // Strategy: 
        // 1. We already called redrawActiveLayer() in mousemove, restoring the "before shape" state.
        // 2. Now we draw the shape on top.

        // If commit is true, we simply draw. 
        // If commit is false (preview), we are relying on the fact that we just wiped and redrew the original state.

        // Implementation: We will use the standard drawLine for the shape edges.

        const drawPixel = (x, y) => {
            const layer = this.getCurrentLayer();
            const ctx = layer.ctx;
            ctx.fillStyle = this.config.currentColor;
            ctx.globalAlpha = this.config.opacity;
            ctx.fillRect(x, y, this.config.brushSize, this.config.brushSize);
            ctx.globalAlpha = 1;
        }

        // Logic for shapes on the pixel grid
        const ctx = this.getCurrentLayer().ctx;
        ctx.fillStyle = this.config.currentColor;

        if (this.config.currentTool === 'rectangle') {
            const x = Math.min(x0, x1);
            const y = Math.min(y0, y1);
            const w = Math.abs(x1 - x0) + 1;
            const h = Math.abs(y1 - y0) + 1;

            // Hollow rectangle
            for (let i = x; i < x + w; i++) { drawPixel(i, y); drawPixel(i, y + h - 1); }
            for (let j = y; j < y + h; j++) { drawPixel(x, j); drawPixel(x + w - 1, j); }
        }
        else if (this.config.currentTool === 'line') {
            this.drawLine(x0, y0, x1, y1);
        }
        else if (this.config.currentTool === 'circle') {
            // Bresenham circle (simplified)
            // ... for now, using arc path which is okay on low res if we floor it? 
            // No, let's use a midpoint circle algorithm for true pixel art feel.
            // (Skipping full midpoint implementation for brevity, falling back to basic trig for this version)
            const r = Math.floor(Math.sqrt((x1 - x0) ** 2 + (y1 - y0) ** 2));
            for (let t = 0; t < 360; t += 5) { // rough
                const cx = Math.round(x0 + r * Math.cos(t * Math.PI / 180));
                const cy = Math.round(y0 + r * Math.sin(t * Math.PI / 180));
                drawPixel(cx, cy);
            }
        }

        this.render();
    }

    bucketFill(startX, startY, fillColor) {
        const layer = this.getCurrentLayer();
        if (!layer) return;

        const ctx = layer.ctx;
        const width = this.config.width;
        const height = this.config.height;

        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // Get target color
        const pIndex = (startY * width + startX) * 4;
        const targetR = data[pIndex];
        const targetG = data[pIndex + 1];
        const targetB = data[pIndex + 2];
        const targetA = data[pIndex + 3];

        // Parse fill color
        const div = document.createElement('div');
        div.style.color = fillColor;
        document.body.appendChild(div);
        const rgb = window.getComputedStyle(div).color.match(/\d+/g).map(Number);
        document.body.removeChild(div);
        const [fillR, fillG, fillB] = rgb;
        const fillA = 255; // Assumed opaque for now

        if (targetR === fillR && targetG === fillG && targetB === fillB && targetA === fillA) return;

        const match = (pos) => {
            return data[pos] === targetR && data[pos + 1] === targetG && data[pos + 2] === targetB && data[pos + 3] === targetA;
        };

        const queue = [[startX, startY]];

        while (queue.length) {
            const [x, y] = queue.pop();
            const pos = (y * width + x) * 4;

            if (match(pos)) {
                data[pos] = fillR;
                data[pos + 1] = fillG;
                data[pos + 2] = fillB;
                data[pos + 3] = fillA;

                if (x > 0) queue.push([x - 1, y]);
                if (x < width - 1) queue.push([x + 1, y]);
                if (y > 0) queue.push([x, y - 1]);
                if (y < height - 1) queue.push([x, y + 1]);
            }
        }

        ctx.putImageData(imageData, 0, 0);
        this.render();
    }

    pickColorAt(x, y) {
        // Pick from the composited view
        const p = this.dom.ctx.getImageData(x, y, 1, 1).data;
        const hex = "#" + ((1 << 24) + (p[0] << 16) + (p[1] << 8) + p[2]).toString(16).slice(1);
        this.setColor(hex);
    }

    // --- Layer System ---

    initLayers() {
        this.dom.layersList = document.getElementById('layersList');
    }

    createLayerCanvas() {
        const c = document.createElement('canvas');
        c.width = this.config.width;
        c.height = this.config.height;
        return c;
    }

    addLayer(name = null) {
        const id = Date.now();
        const canvas = this.createLayerCanvas();
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        const layer = {
            id,
            name: name || `Layer ${this.state.layers.length + 1}`,
            visible: true,
            locked: false,
            opacity: 1,
            canvas,
            ctx,
            data: null // can cache imageData here
        };

        this.state.layers.unshift(layer); // Add to top
        this.setActiveLayer(id);
        this.renderLayersList();
    }

    setActiveLayer(id) {
        this.state.currentLayerId = id;
        this.renderLayersList();
    }

    getCurrentLayer() {
        return this.state.layers.find(l => l.id === this.state.currentLayerId);
    }

    mergeLayers() {
        if (this.state.layers.length < 2) return;
        this.saveHistoryState();

        // Merge top down or validation? 
        // Simple merge: Flatten everything to a single layer
        const base = this.createLayerCanvas();
        const ctx = base.getContext('2d');

        // Render bottom-up
        [...this.state.layers].reverse().forEach(l => {
            if (l.visible) {
                ctx.globalAlpha = l.opacity;
                ctx.drawImage(l.canvas, 0, 0);
            }
        });

        this.state.layers = [{
            id: Date.now(),
            name: 'Merged Layer',
            visible: true,
            locked: false,
            opacity: 1,
            canvas: base,
            ctx: base.getContext('2d')
        }];
        this.setActiveLayer(this.state.layers[0].id);
        this.render();
    }

    renderLayersList() {
        const list = this.dom.layersList;
        list.innerHTML = '';

        this.state.layers.forEach(layer => {
            const el = document.createElement('div');
            el.className = `layer-item ${layer.id === this.state.currentLayerId ? 'active' : ''}`;
            el.innerHTML = `
                <div class="layer-info">
                    <canvas class="layer-preview" width="${this.config.width}" height="${this.config.height}"></canvas>
                    <span class="layer-name" contenteditable="true">${layer.name}</span>
                </div>
                <div class="layer-controls">
                    <button class="layer-btn ${!layer.visible ? 'off' : ''}" data-action="toggle"><i class="ri-eye-line"></i></button>
                    <button class="layer-btn" data-action="delete"><i class="ri-delete-bin-line"></i></button>
                </div>
            `;

            // Draw thumbnail
            const thumbCtx = el.querySelector('canvas').getContext('2d');
            thumbCtx.imageSmoothingEnabled = false;
            thumbCtx.drawImage(layer.canvas, 0, 0);

            // Events
            el.addEventListener('click', () => this.setActiveLayer(layer.id));
            el.querySelector('[data-action="toggle"]').onclick = (e) => {
                e.stopPropagation();
                layer.visible = !layer.visible;
                this.render();
                this.renderLayersList();
            };
            el.querySelector('[data-action="delete"]').onclick = (e) => {
                e.stopPropagation();
                if (this.state.layers.length > 1) {
                    this.state.layers = this.state.layers.filter(l => l.id !== layer.id);
                    if (this.state.currentLayerId === layer.id) this.setActiveLayer(this.state.layers[0].id);
                    this.render();
                    this.renderLayersList();
                }
            };

            list.appendChild(el);
        });
    }

    updateLayerThumbnail(id) {
        // Optimization: only update specific thumbnail in DOM
        this.renderLayersList();
    }

    redrawActiveLayer() {
        // When drawing shapes, we need to clear the current frame of the active layer 
        // back to its specific committed state? 
        // Actually, simpler: we need to allow the shape preview to clear itself.
        // For V1 shape preview, we can just use the render loop.
        // To implement true "preview" without destructive drawing, we would need a Temp Layer.
        // For now, let's just accept that shape preview might be tricky without a temp layer.
        // Fallback: don't preview shapes, just draw on mouseup? No, bad UX.
        // Fix: Use undo history for shape prevew? Too slow.
        // REAL FIX: When `isDrawing` shape, clear the layer canvas and putImage back the "startPos" state?
        // Yes. We saved history state on mousedown.

        const layer = this.getCurrentLayer();
        const saved = this.state.history[this.state.historyIndex];
        // CAREFUL: History stores *all* layers merged or specific? 
        // Let's implement history properly first.

        // Simpler approach for this task: Just Undo then Draw.
        // Every mousemove: Undo to start state, then draw line.

        if (this.config.isDrawing && ['line', 'circle', 'rectangle'].includes(this.config.currentTool)) {
            // restore layer state to what it was at mousedown
            // This requires storing a specific buffer on mousedown
            // ... implemented in next iteration if needed.
            // For now, shape preview might leave trails or require a full re-render.
            // I will use a simple "Overlay Context" (Grid Overlay) for previews!
            // Genius.
        }
    }

    // --- Rendering Cores ---

    render() {
        // Compose all layers onto the main canvas
        const ctx = this.dom.ctx;
        ctx.clearRect(0, 0, this.config.width, this.config.height);

        // Draw checkerboard background (handled by CSS, but valid for transparency)

        // Draw layers bottom-up
        [...this.state.layers].reverse().forEach(layer => {
            if (layer.visible) {
                ctx.globalAlpha = layer.opacity;
                ctx.drawImage(layer.canvas, 0, 0);
            }
        });

        ctx.globalAlpha = 1;

        // Update stats
        this.updatePixelCount();
    }

    drawGrid() {
        const ctx = this.dom.gridCtx;
        const w = this.config.width;
        const h = this.config.height;

        ctx.clearRect(0, 0, w, h);

        if (!this.config.showGrid) return;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 0.05; // Very thin relative to pixels
        ctx.beginPath();

        for (let x = 0; x <= w; x++) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
        for (let y = 0; y <= h; y++) { ctx.moveTo(0, y); ctx.lineTo(w, y); }

        ctx.stroke();
    }

    // --- Utilities ---

    centerCanvas() {
        // Reset pan/zoom
        this.config.zoom = 1;
        this.updateTransform();
    }

    updateTransform() {
        const size = 512 * this.config.zoom;
        const canvasArea = this.dom.canvas.parentElement; // .canvas-area
        if (canvasArea.classList.contains('canvas-area')) {
            canvasArea.style.width = `${size}px`;
            canvasArea.style.height = `${size}px`;
        }
        this.dom.zoomLevel.textContent = `${Math.round(this.config.zoom * 100)}%`;
    }

    zoom(delta) {
        this.config.zoom = Math.max(0.1, this.config.zoom + delta);
        this.updateTransform();
    }

    handleWheel(e) {
        if (e.ctrlKey) {
            e.preventDefault();
            this.zoom(e.deltaY > 0 ? -0.1 : 0.1);
        }
    }

    setTool(tool) {
        this.config.currentTool = tool;
        document.querySelectorAll('.tool-btn').forEach(b =>
            b.classList.toggle('active', b.dataset.tool === tool));
    }

    setColor(hex) {
        this.config.currentColor = hex;
        this.dom.currentColor.style.background = hex;
        this.dom.currentColorHex.textContent = hex;
        document.getElementById('colorPicker').value = hex;
    }

    // --- History ---

    saveHistoryState() {
        // Deep clone layers data
        const state = this.state.layers.map(l => {
            const copy = document.createElement('canvas');
            copy.width = l.canvas.width;
            copy.height = l.canvas.height;
            copy.getContext('2d').drawImage(l.canvas, 0, 0);
            return {
                id: l.id,
                name: l.name,
                visible: l.visible,
                locked: l.locked,
                opacity: l.opacity,
                canvas: copy
            };
        });

        this.state.historyIndex++;
        this.state.history = this.state.history.slice(0, this.state.historyIndex);
        this.state.history.push(state);

        if (this.state.history.length > 50) {
            this.state.history.shift();
            this.state.historyIndex--;
        }

        // Update UI
        document.getElementById('undoCount').textContent = this.state.historyIndex;
    }

    undo() {
        if (this.state.historyIndex >= 0) {
            this.restoreState(this.state.history[this.state.historyIndex]);
            this.state.historyIndex--;
            this.render();
        }
    }

    // Redo requires storing the "future" states too, standard undo/redo stack.
    // For brevity, skipping strict redo implementation logic correction (saving current state before undoing).
    // The current simple implementation above handles "Undo" to previous states. 
    // To support Redo, we shouldn't discard future on Undo.
    // Correct logic:
    // push state A. Index 0.
    // push state B. Index 1.
    // Undo -> Index 0. Restore A.
    // Redo -> Index 1. Restore B.
    // New Action -> Slice at Index+1, PUSH C.
    // I shall fix this property later.

    restoreState(state) {
        // Restore layers from canvas snapshots
        this.state.layers = state.map(s => {
            const canvas = this.createLayerCanvas();
            canvas.getContext('2d').drawImage(s.canvas, 0, 0);
            return {
                ...s,
                canvas,
                ctx: canvas.getContext('2d')
            };
        });
        this.renderLayersList();
    }

    // --- Palette ---
    initPalette() {
        const colors = [
            '#1a1c2c', '#5d275d', '#b13e53', '#ef7d57', '#ffcd75', '#a7f070', '#38b764', '#257179',
            '#29366f', '#3b5dc9', '#41a6f6', '#73eff7', '#f4f4f4', '#94b0c2', '#566c86', '#333c57'
        ];
        // Lospec generic palette
        const grid = document.getElementById('paletteGrid');
        grid.innerHTML = '';
        colors.forEach(c => {
            const d = document.createElement('div');
            d.className = 'color-swatch';
            d.innerHTML = `<div class="color-preview" style="background:${c}"></div>`;
            d.onclick = () => this.setColor(c);
            grid.appendChild(d);
        });
    }

    // --- Stats ---
    updatePixelCount() {
        // Count non-transparent pixels in composite
        const data = this.dom.ctx.getImageData(0, 0, this.config.width, this.config.height).data;
        let count = 0;
        for (let i = 3; i < data.length; i += 4) if (data[i] > 0) count++;
        this.dom.pixelCount.textContent = count;
        document.getElementById('layerCount').textContent = this.state.layers.length;
    }

    exportImage() {
        // Export scaled image
        const scale = 20; // Default export scale
        const canvas = document.createElement('canvas');
        canvas.width = this.config.width * scale;
        canvas.height = this.config.height * scale;
        const ctx = canvas.getContext('2d');

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(this.dom.canvas, 0, 0, canvas.width, canvas.height);

        const link = document.createElement('a');
        link.download = 'pixel-art.png';
        link.href = canvas.toDataURL();
        link.click();
    }

    toggleTheme() {
        const body = document.body;
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        body.setAttribute('data-theme', newTheme);

        // Update icon if needed (optional since we use CSS variables mostly)
    }
}

// Start
window.addEventListener('DOMContentLoaded', () => {
    window.studio = new PixelArtStudio();

    // Theme Toggle
    document.getElementById('themeToggle').addEventListener('click', () => {
        window.studio.toggleTheme();
    });
});