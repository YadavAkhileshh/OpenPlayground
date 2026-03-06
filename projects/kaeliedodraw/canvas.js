class KaleidoCanvas {
    constructor(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d', { alpha: false, willReadFrequently: false });
        this.isDrawing = false;
        this.segments = 8;
        this.brushColor = '#00ffff';
        this.brushSize = 5;
        this.brushOpacity = 1.0;
        this.showGuides = true;
        this.mirrorMode = 'both';
        this.drawMode = 'brush';
        this.blendMode = 'source-over';
        this.rainbowMode = false;
        this.autoRotate = false;
        this.rotationAngle = 0;
        this.rotationSpeed = 0.005;
        this.hueOffset = 0;
        this.lastX = 0;
        this.lastY = 0;
        this.centerX = 0;
        this.centerY = 0;
        this.resizeTimeout = null;
        this.rotationFrame = null;
        
        this.undoStack = [];
        this.redoStack = [];
        this.maxUndoSteps = 50;
        
        this.initCanvas();
        this.setupEventListeners();
    }

    initCanvas() {
        const container = this.canvas.parentElement;
        const size = Math.min(container.clientWidth - 40, container.clientHeight - 40, 800);
        
        this.canvas.width = size;
        this.canvas.height = size;
        
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        
        this.clearCanvas();
        this.drawGuides();
        this.saveState();
    }

    clearCanvas() {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawGuides() {
        if (!this.showGuides) return;
        
        const angleStep = (Math.PI * 2) / this.segments;
        const radius = Math.min(this.centerX, this.centerY);
        
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i < this.segments; i++) {
            const angle = i * angleStep + this.rotationAngle;
            const x = this.centerX + Math.cos(angle) * radius;
            const y = this.centerY + Math.sin(angle) * radius;
            
            this.ctx.beginPath();
            this.ctx.moveTo(this.centerX, this.centerY);
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
        }
        
        this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)';
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, radius * 0.9, 0, Math.PI * 2);
        this.ctx.stroke();
        
        this.ctx.restore();
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
        this.canvas.addEventListener('mousemove', this.draw.bind(this));
        this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        this.canvas.addEventListener('mouseleave', this.stopDrawing.bind(this));
        
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.canvas.addEventListener('touchend', this.stopDrawing.bind(this));
        
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    handleResize() {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            const oldWidth = this.canvas.width;
            const oldHeight = this.canvas.height;
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = oldWidth;
            tempCanvas.height = oldHeight;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(this.canvas, 0, 0);
            
            this.initCanvas();
            
            const scale = Math.min(
                this.canvas.width / oldWidth,
                this.canvas.height / oldHeight
            );
            const offsetX = (this.canvas.width - oldWidth * scale) / 2;
            const offsetY = (this.canvas.height - oldHeight * scale) / 2;
            
            this.ctx.drawImage(tempCanvas, offsetX, offsetY, oldWidth * scale, oldHeight * scale);
            this.drawGuides();
        }, 250);
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    getTouchPos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        return {
            x: (e.touches[0].clientX - rect.left) * scaleX,
            y: (e.touches[0].clientY - rect.top) * scaleY
        };
    }

    startDrawing(e) {
        this.isDrawing = true;
        const pos = this.getMousePos(e);
        this.lastX = pos.x;
        this.lastY = pos.y;
    }

    handleTouchStart(e) {
        e.preventDefault();
        this.isDrawing = true;
        const pos = this.getTouchPos(e);
        this.lastX = pos.x;
        this.lastY = pos.y;
    }

    handleTouchMove(e) {
        e.preventDefault();
        if (!this.isDrawing) return;
        const pos = this.getTouchPos(e);
        this.drawLine(this.lastX, this.lastY, pos.x, pos.y);
        this.lastX = pos.x;
        this.lastY = pos.y;
    }

    draw(e) {
        if (!this.isDrawing) return;
        
        const pos = this.getMousePos(e);
        this.drawLine(this.lastX, this.lastY, pos.x, pos.y);
        this.lastX = pos.x;
        this.lastY = pos.y;
    }

    stopDrawing() {
        if (this.isDrawing) {
            this.isDrawing = false;
            this.saveState();
        }
    }

    getRainbowColor() {
        this.hueOffset = (this.hueOffset + 2) % 360;
        return `hsl(${this.hueOffset}, 100%, 50%)`;
    }

    drawLine(x1, y1, x2, y2) {
        const angleStep = (Math.PI * 2) / this.segments;
        const color = this.rainbowMode ? this.getRainbowColor() : this.brushColor;
        
        this.ctx.globalAlpha = this.brushOpacity;
        this.ctx.strokeStyle = color;
        this.ctx.fillStyle = color;
        this.ctx.lineWidth = this.brushSize;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.globalCompositeOperation = this.blendMode;
        
        if (this.drawMode === 'spray') {
            this.drawSpray(x1, y1, x2, y2, angleStep, color);
        } else if (this.drawMode === 'glow') {
            this.drawGlow(x1, y1, x2, y2, angleStep, color);
        } else {
            this.drawBrush(x1, y1, x2, y2, angleStep);
        }
        
        this.ctx.globalAlpha = 1.0;
    }

    drawBrush(x1, y1, x2, y2, angleStep) {
        for (let i = 0; i < this.segments; i++) {
            const angle = i * angleStep + this.rotationAngle;
            
            if (this.mirrorMode === 'both' || this.mirrorMode === 'rotate') {
                this.ctx.save();
                this.ctx.translate(this.centerX, this.centerY);
                this.ctx.rotate(angle);
                this.ctx.translate(-this.centerX, -this.centerY);
                
                this.ctx.beginPath();
                this.ctx.moveTo(x1, y1);
                this.ctx.lineTo(x2, y2);
                this.ctx.stroke();
                
                this.ctx.restore();
            }
            
            if (this.mirrorMode === 'both' || this.mirrorMode === 'reflect') {
                this.ctx.save();
                this.ctx.translate(this.centerX, this.centerY);
                this.ctx.rotate(angle);
                this.ctx.scale(-1, 1);
                this.ctx.translate(-this.centerX, -this.centerY);
                
                this.ctx.beginPath();
                this.ctx.moveTo(x1, y1);
                this.ctx.lineTo(x2, y2);
                this.ctx.stroke();
                
                this.ctx.restore();
            }
        }
    }

    drawSpray(x1, y1, x2, y2, angleStep, color) {
        const density = 15;
        const radius = this.brushSize;
        
        for (let i = 0; i < this.segments; i++) {
            const angle = i * angleStep + this.rotationAngle;
            
            const drawSprayPattern = (flip) => {
                this.ctx.save();
                this.ctx.translate(this.centerX, this.centerY);
                this.ctx.rotate(angle);
                if (flip) this.ctx.scale(-1, 1);
                this.ctx.translate(-this.centerX, -this.centerY);
                
                for (let j = 0; j < density; j++) {
                    const offsetX = (Math.random() - 0.5) * radius * 2;
                    const offsetY = (Math.random() - 0.5) * radius * 2;
                    const t = Math.random();
                    const px = x1 + (x2 - x1) * t + offsetX;
                    const py = y1 + (y2 - y1) * t + offsetY;
                    
                    this.ctx.fillRect(px, py, 1, 1);
                }
                
                this.ctx.restore();
            };
            
            if (this.mirrorMode === 'both' || this.mirrorMode === 'rotate') {
                drawSprayPattern(false);
            }
            if (this.mirrorMode === 'both' || this.mirrorMode === 'reflect') {
                drawSprayPattern(true);
            }
        }
    }

    drawGlow(x1, y1, x2, y2, angleStep, color) {
        const layers = 3;
        
        for (let layer = layers; layer > 0; layer--) {
            const layerSize = this.brushSize * (layer / layers) * 2;
            const layerOpacity = this.brushOpacity * (0.3 / layer);
            
            this.ctx.globalAlpha = layerOpacity;
            this.ctx.lineWidth = layerSize;
            this.ctx.shadowBlur = layerSize * 2;
            this.ctx.shadowColor = color;
            
            for (let i = 0; i < this.segments; i++) {
                const angle = i * angleStep + this.rotationAngle;
                
                if (this.mirrorMode === 'both' || this.mirrorMode === 'rotate') {
                    this.ctx.save();
                    this.ctx.translate(this.centerX, this.centerY);
                    this.ctx.rotate(angle);
                    this.ctx.translate(-this.centerX, -this.centerY);
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(x1, y1);
                    this.ctx.lineTo(x2, y2);
                    this.ctx.stroke();
                    
                    this.ctx.restore();
                }
                
                if (this.mirrorMode === 'both' || this.mirrorMode === 'reflect') {
                    this.ctx.save();
                    this.ctx.translate(this.centerX, this.centerY);
                    this.ctx.rotate(angle);
                    this.ctx.scale(-1, 1);
                    this.ctx.translate(-this.centerX, -this.centerY);
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(x1, y1);
                    this.ctx.lineTo(x2, y2);
                    this.ctx.stroke();
                    
                    this.ctx.restore();
                }
            }
        }
        
        this.ctx.shadowBlur = 0;
    }

    setSegments(segments) {
        this.segments = segments;
        this.redraw();
    }

    setBrushColor(color) {
        this.brushColor = color;
    }

    setBrushSize(size) {
        this.brushSize = size;
    }

    setBrushOpacity(opacity) {
        this.brushOpacity = opacity;
    }

    setShowGuides(show) {
        this.showGuides = show;
        this.redraw();
    }

    setMirrorMode(mode) {
        this.mirrorMode = mode;
    }

    setDrawMode(mode) {
        this.drawMode = mode;
    }

    setBlendMode(mode) {
        this.blendMode = mode;
    }

    setRainbowMode(enabled) {
        this.rainbowMode = enabled;
        if (enabled) {
            this.hueOffset = 0;
        }
    }

    setAutoRotate(enabled, speed = 5) {
        this.autoRotate = enabled;
        this.rotationSpeed = speed * 0.001;
        
        if (enabled) {
            this.startRotation();
        } else {
            this.stopRotation();
        }
    }

    startRotation() {
        const animate = () => {
            if (!this.autoRotate) return;
            
            this.rotationAngle += this.rotationSpeed;
            this.redraw();
            
            this.rotationFrame = requestAnimationFrame(animate);
        };
        animate();
    }

    stopRotation() {
        if (this.rotationFrame) {
            cancelAnimationFrame(this.rotationFrame);
            this.rotationFrame = null;
        }
    }

    saveState() {
        const state = this.canvas.toDataURL();
        this.undoStack.push(state);
        
        if (this.undoStack.length > this.maxUndoSteps) {
            this.undoStack.shift();
        }
        
        this.redoStack = [];
    }

    undo() {
        if (this.undoStack.length <= 1) return false;
        
        const currentState = this.undoStack.pop();
        this.redoStack.push(currentState);
        
        const previousState = this.undoStack[this.undoStack.length - 1];
        this.restoreState(previousState);
        return true;
    }

    redo() {
        if (this.redoStack.length === 0) return false;
        
        const state = this.redoStack.pop();
        this.undoStack.push(state);
        this.restoreState(state);
        return true;
    }

    restoreState(dataUrl) {
        const img = new Image();
        img.onload = () => {
            this.clearCanvas();
            this.ctx.drawImage(img, 0, 0);
            this.drawGuides();
        };
        img.src = dataUrl;
    }

    canUndo() {
        return this.undoStack.length > 1;
    }

    canRedo() {
        return this.redoStack.length > 0;
    }

    redraw() {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(this.canvas, 0, 0);
        
        this.clearCanvas();
        this.drawGuides();
        this.ctx.drawImage(tempCanvas, 0, 0);
    }

    clear() {
        this.clearCanvas();
        this.drawGuides();
        this.saveState();
    }

    downloadImage() {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.fillStyle = '#000000';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempCtx.drawImage(this.canvas, 0, 0);
        
        const link = document.createElement('a');
        link.download = `kaleidodraw-${Date.now()}.png`;
        link.href = tempCanvas.toDataURL('image/png');
        link.click();
    }
}
