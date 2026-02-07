class DrawingCanvas {
    constructor() {
        this.canvas = document.getElementById('drawingCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.currentTool = 'brush';
        this.currentColor = '#000000';
        this.brushSize = 5;
        this.history = [];
        this.historyIndex = -1;
        this.maxHistory = 50;

        this.initializeCanvas();
        this.setupEventListeners();
        this.saveState();
    }

    initializeCanvas() {
        // Set canvas size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Set initial canvas background to white
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth - 40; // Account for padding
        const containerHeight = Math.min(window.innerHeight - 200, 600); // Max height

        this.canvas.width = Math.min(containerWidth, 800);
        this.canvas.height = containerHeight;

        // Redraw if there's history
        if (this.history.length > 0) {
            this.restoreState(this.history[this.historyIndex]);
        } else {
            this.ctx.fillStyle = 'white';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());

        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startDrawing(e.touches[0]);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.draw(e.touches[0]);
        });
        this.canvas.addEventListener('touchend', () => this.stopDrawing());

        // Tool selection
        document.getElementById('brush').addEventListener('click', () => this.setTool('brush'));
        document.getElementById('eraser').addEventListener('click', () => this.setTool('eraser'));
        document.getElementById('rectangle').addEventListener('click', () => this.setTool('rectangle'));
        document.getElementById('circle').addEventListener('click', () => this.setTool('circle'));
        document.getElementById('line').addEventListener('click', () => this.setTool('line'));

        // Color picker
        document.getElementById('colorPicker').addEventListener('change', (e) => {
            this.currentColor = e.target.value;
        });

        // Brush size
        const brushSizeInput = document.getElementById('brushSize');
        const sizeValue = document.getElementById('sizeValue');
        brushSizeInput.addEventListener('input', (e) => {
            this.brushSize = parseInt(e.target.value);
            sizeValue.textContent = this.brushSize;
        });

        // Action buttons
        document.getElementById('undo').addEventListener('click', () => this.undo());
        document.getElementById('redo').addEventListener('click', () => this.redo());
        document.getElementById('clear').addEventListener('click', () => this.clearCanvas());
        document.getElementById('save').addEventListener('click', () => this.saveAsPNG());

        // Update undo/redo button states
        this.updateButtonStates();
    }

    setTool(tool) {
        this.currentTool = tool;
        document.querySelectorAll('.tool').forEach(btn => btn.classList.remove('active'));
        document.getElementById(tool).classList.add('active');
    }

    startDrawing(e) {
        this.isDrawing = true;
        const rect = this.canvas.getBoundingClientRect();
        this.startX = e.clientX - rect.left;
        this.startY = e.clientY - rect.top;

        if (this.currentTool === 'brush' || this.currentTool === 'eraser') {
            this.ctx.beginPath();
            this.ctx.moveTo(this.startX, this.startY);
        }

        this.ctx.strokeStyle = this.currentTool === 'eraser' ? 'white' : this.currentColor;
        this.ctx.lineWidth = this.brushSize;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
    }

    draw(e) {
        if (!this.isDrawing) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (this.currentTool === 'brush' || this.currentTool === 'eraser') {
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
        } else if (this.currentTool === 'rectangle') {
            this.previewShape(x, y, 'rectangle');
        } else if (this.currentTool === 'circle') {
            this.previewShape(x, y, 'circle');
        } else if (this.currentTool === 'line') {
            this.previewShape(x, y, 'line');
        }
    }

    stopDrawing() {
        if (!this.isDrawing) return;
        this.isDrawing = false;

        if (this.currentTool !== 'brush' && this.currentTool !== 'eraser') {
            // For shapes, we need to draw the final shape
            const rect = this.canvas.getBoundingClientRect();
            const endX = event.clientX - rect.left;
            const endY = event.clientY - rect.top;
            this.drawShape(this.startX, this.startY, endX, endY, this.currentTool, false);
        }

        this.saveState();
    }

    drawShape(startX, startY, endX, endY, shape, preview = false) {
        const width = endX - startX;
        const height = endY - startY;

        if (!preview) {
            this.ctx.strokeStyle = this.currentColor;
            this.ctx.lineWidth = this.brushSize;
        }

        this.ctx.beginPath();

        switch (shape) {
            case 'rectangle':
                this.ctx.rect(startX, startY, width, height);
                break;
            case 'circle':
                const radius = Math.sqrt(width * width + height * height) / 2;
                const centerX = startX + width / 2;
                const centerY = startY + height / 2;
                this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                break;
            case 'line':
                this.ctx.moveTo(startX, startY);
                this.ctx.lineTo(endX, endY);
                break;
        }

        if (preview) {
            this.ctx.setLineDash([5, 5]);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        } else {
            this.ctx.stroke();
        }
    }

    previewShape(x, y, shape) {
        // Clear and redraw the canvas with current state
        this.restoreState(this.history[this.historyIndex]);

        // Draw preview shape
        this.drawShape(this.startX, this.startY, x, y, shape, true);
    }

    saveState() {
        // Save current canvas state
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

        // Remove any history after current index (for when we undo and then draw)
        this.history = this.history.slice(0, this.historyIndex + 1);

        // Add new state
        this.history.push(imageData);

        // Limit history size
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        } else {
            this.historyIndex++;
        }

        this.updateButtonStates();
    }

    restoreState(imageData) {
        this.ctx.putImageData(imageData, 0, 0);
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.restoreState(this.history[this.historyIndex]);
            this.updateButtonStates();
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.restoreState(this.history[this.historyIndex]);
            this.updateButtonStates();
        }
    }

    clearCanvas() {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.saveState();
    }

    saveAsPNG() {
        const link = document.createElement('a');
        link.download = 'drawing.png';
        link.href = this.canvas.toDataURL('image/png');
        link.click();
    }

    updateButtonStates() {
        const undoBtn = document.getElementById('undo');
        const redoBtn = document.getElementById('redo');

        undoBtn.disabled = this.historyIndex <= 0;
        redoBtn.disabled = this.historyIndex >= this.history.length - 1;
    }
}

// Initialize the drawing canvas when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new DrawingCanvas();
});
