/**
 * Handles all canvas interaction and drawing logic
 */
import { Utils } from './utils.js';

export class DrawingCanvas {
    constructor(canvasId, width = 800, height = 400) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

        // Set internal resolution
        this.canvas.width = width;
        this.canvas.height = height;

        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;

        // Brush settings
        this.brushSize = 10;
        this.brushIntensity = 100; // 0-100 opacity
        this.mode = 'brush'; // 'brush', 'eraser', 'harmonic', 'noise'

        // History for undo (simple version)
        this.history = [];
        this.maxHistory = 10;

        this.initEvents();
        this.clear();
    }

    initEvents() {
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseleave', () => this.stopDrawing());

        // Touch support
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startDrawing(e.touches[0]);
        }, { passive: false });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.draw(e.touches[0]);
        }, { passive: false });
        this.canvas.addEventListener('touchend', () => this.stopDrawing());
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

    startDrawing(e) {
        this.isDrawing = true;
        const pos = this.getMousePos(e);
        this.lastX = pos.x;
        this.lastY = pos.y;

        // Save state for undo before drawing
        this.saveState();

        // Draw a dot on click
        this.draw(e);
    }

    stopDrawing() {
        this.isDrawing = false;
    }

    clear() {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.saveState(); // Save clear state
    }

    setBrushSize(size) {
        this.brushSize = parseInt(size);
    }

    setBrushIntensity(val) {
        this.brushIntensity = parseInt(val);
    }

    setMode(mode) {
        this.mode = mode;
        if (mode === 'brush' || mode === 'harmonic' || mode === 'noise') {
            this.ctx.globalCompositeOperation = 'source-over';
        } else if (mode === 'eraser') {
            this.ctx.globalCompositeOperation = 'destination-out';
        }
    }

    saveState() {
        if (this.history.length >= this.maxHistory) {
            this.history.shift();
        }
        this.history.push(this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height));
    }

    restoreState() {
        if (this.history.length > 0) {
            const imageData = this.history.pop();
            this.ctx.putImageData(imageData, 0, 0);
        }
    }

    draw(e) {
        if (!this.isDrawing) return;

        const pos = this.getMousePos(e);

        this.ctx.lineJoin = 'round';
        this.ctx.lineCap = 'round';
        this.ctx.lineWidth = this.brushSize;

        const alpha = Utils.map(this.brushIntensity, 0, 100, 0.01, 1.0);

        if (this.mode === 'eraser') {
            this.ctx.globalCompositeOperation = 'destination-out';
            this.ctx.strokeStyle = `rgba(0,0,0,1)`;
            this.ctx.beginPath();
            this.ctx.moveTo(this.lastX, this.lastY);
            this.ctx.lineTo(pos.x, pos.y);
            this.ctx.stroke();
        } else if (this.mode === 'noise') {
            // Feature: Noise Brush
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;

            // Simple noise spray
            const density = Math.max(1, Math.floor(this.brushSize * 1.5));
            const radius = this.brushSize / 2;

            for (let i = 0; i < density; i++) {
                // Random point within circle
                const angle = Math.random() * Math.PI * 2;
                const r = Math.sqrt(Math.random()) * radius;
                const offsetX = r * Math.cos(angle);
                const offsetY = r * Math.sin(angle);

                this.ctx.fillRect(pos.x + offsetX, pos.y + offsetY, 1, 1);
            }
        } else if (this.mode === 'harmonic') {
            // Feature: Harmonic Brush
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            this.ctx.shadowBlur = this.brushSize / 2;
            this.ctx.shadowColor = `rgba(255, 255, 255, ${alpha * 0.5})`;

            // Draw fundamental
            this.ctx.beginPath();
            this.ctx.moveTo(this.lastX, this.lastY);
            this.ctx.lineTo(pos.x, pos.y);
            this.ctx.stroke();

            // Harmonic lines (visual approximation)
            // Ideally we'd map Y -> Freq -> Freq*2 -> Y. 
            // Since we don't have direct access here easily, we use linear offset approximation.
            const hOffset = 20;

            this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.6})`;
            this.ctx.lineWidth = Math.max(1, this.brushSize * 0.6);
            this.ctx.beginPath();
            this.ctx.moveTo(this.lastX, this.lastY - hOffset);
            this.ctx.lineTo(pos.x, pos.y - hOffset);
            this.ctx.stroke();

            this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.3})`;
            this.ctx.lineWidth = Math.max(1, this.brushSize * 0.4);
            this.ctx.beginPath();
            this.ctx.moveTo(this.lastX, this.lastY - hOffset * 2.0);
            this.ctx.lineTo(pos.x, pos.y - hOffset * 2.0);
            this.ctx.stroke();

        } else {
            // Normal Brush
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            this.ctx.shadowBlur = this.brushSize / 2;
            this.ctx.shadowColor = `rgba(255, 255, 255, ${alpha * 0.5})`;

            this.ctx.beginPath();
            this.ctx.moveTo(this.lastX, this.lastY);
            this.ctx.lineTo(pos.x, pos.y);
            this.ctx.stroke();
        }

        this.lastX = pos.x;
        this.lastY = pos.y;

        // Reset settings
        this.ctx.shadowBlur = 0;
        this.ctx.globalCompositeOperation = 'source-over';
    }

    /**
     * Returns the pixel data for the entire canvas
     * @returns {ImageData}
     */
    getImageData() {
        return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }
}
