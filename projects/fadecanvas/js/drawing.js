// ============================================
// FadeCanvas - Drawing Engine
// Handles stroke capture, rendering, and brush mechanics
// ============================================

class DrawingEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { willReadFrequently: true });
        this.strokes = [];
        this.currentStroke = null;
        this.isDrawing = false;

        // Drawing settings
        this.brushSize = 8;
        this.brushColor = '#ffffff';
        this.smoothing = 0.3;

        // Performance tracking
        this.lastPoint = null;
        this.strokeIdCounter = 0;

        this.setupCanvas();
        this.bindEvents();
    }

    setupCanvas() {
        // Set canvas size to match window
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Configure context for smooth rendering
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
    }

    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        // Resize canvas
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;

        // Scale context for high DPI
        this.ctx.scale(dpr, dpr);

        // Reapply context settings
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';

        // Redraw all strokes
        this.redrawAll();
    }

    bindEvents() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseleave', () => this.stopDrawing());

        // Touch events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.startDrawing(touch);
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.draw(touch);
        }, { passive: false });

        this.canvas.addEventListener('touchend', () => this.stopDrawing());
    }

    getPosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    startDrawing(e) {
        this.isDrawing = true;
        const pos = this.getPosition(e);

        // Create new stroke
        this.currentStroke = {
            id: this.strokeIdCounter++,
            points: [pos],
            color: this.brushColor,
            size: this.brushSize,
            timestamp: Date.now(),
            opacity: 1.0,
            blur: 0,
            distortion: 0,
            fragments: []
        };

        this.lastPoint = pos;

        // Trigger interaction event
        this.dispatchStrokeEvent('strokeStart', this.currentStroke);
    }

    draw(e) {
        if (!this.isDrawing || !this.currentStroke) return;

        const pos = this.getPosition(e);

        // Add point with smoothing
        if (this.lastPoint) {
            const smoothedPoint = {
                x: this.lastPoint.x + (pos.x - this.lastPoint.x) * (1 - this.smoothing),
                y: this.lastPoint.y + (pos.y - this.lastPoint.y) * (1 - this.smoothing)
            };
            this.currentStroke.points.push(smoothedPoint);
            this.lastPoint = smoothedPoint;
        } else {
            this.currentStroke.points.push(pos);
            this.lastPoint = pos;
        }

        // Draw the new segment
        this.drawStrokeSegment(this.currentStroke, this.currentStroke.points.length - 2);

        // Trigger interaction event
        this.dispatchStrokeEvent('strokeMove', this.currentStroke);
    }

    stopDrawing() {
        if (!this.isDrawing) return;

        this.isDrawing = false;

        if (this.currentStroke && this.currentStroke.points.length > 1) {
            // Add completed stroke to collection
            this.strokes.push(this.currentStroke);
            this.dispatchStrokeEvent('strokeEnd', this.currentStroke);
        }

        this.currentStroke = null;
        this.lastPoint = null;
    }

    drawStrokeSegment(stroke, startIndex) {
        if (startIndex < 0 || startIndex >= stroke.points.length - 1) return;

        const p1 = stroke.points[startIndex];
        const p2 = stroke.points[startIndex + 1];

        this.ctx.save();

        // Apply stroke properties
        this.ctx.globalAlpha = stroke.opacity;
        this.ctx.strokeStyle = stroke.color;
        this.ctx.lineWidth = stroke.size;

        // Apply blur if present
        if (stroke.blur > 0) {
            this.ctx.filter = `blur(${stroke.blur}px)`;
        } else {
            this.ctx.filter = 'none';
        }

        // Draw line segment
        this.ctx.beginPath();
        this.ctx.moveTo(p1.x, p1.y);
        this.ctx.lineTo(p2.x, p2.y);
        this.ctx.stroke();

        this.ctx.restore();
    }

    drawStroke(stroke) {
        if (!stroke || !stroke.points || stroke.points.length < 2) return;

        this.ctx.save();

        // Apply stroke properties
        this.ctx.globalAlpha = stroke.opacity;
        this.ctx.strokeStyle = stroke.color;
        this.ctx.lineWidth = stroke.size;

        // Apply blur if present
        if (stroke.blur > 0) {
            this.ctx.filter = `blur(${stroke.blur}px)`;
        } else {
            this.ctx.filter = 'none';
        }

        // Draw complete stroke
        this.ctx.beginPath();
        this.ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

        for (let i = 1; i < stroke.points.length; i++) {
            this.ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }

        this.ctx.stroke();

        // Draw fragments if present
        if (stroke.fragments && stroke.fragments.length > 0) {
            this.drawFragments(stroke);
        }

        this.ctx.restore();
    }

    drawFragments(stroke) {
        this.ctx.save();

        stroke.fragments.forEach(fragment => {
            this.ctx.globalAlpha = fragment.opacity;
            this.ctx.fillStyle = stroke.color;

            this.ctx.beginPath();
            this.ctx.arc(fragment.x, fragment.y, fragment.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        this.ctx.restore();
    }

    redrawAll() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Redraw all strokes
        this.strokes.forEach(stroke => {
            this.drawStroke(stroke);
        });
    }

    clearCanvas() {
        this.strokes = [];
        this.currentStroke = null;
        this.isDrawing = false;
        this.lastPoint = null;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.dispatchStrokeEvent('canvasCleared');
    }

    setBrushSize(size) {
        this.brushSize = Math.max(1, Math.min(50, size));
    }

    setBrushColor(color) {
        this.brushColor = color;
    }

    getStrokes() {
        return this.strokes;
    }

    getStrokeCount() {
        return this.strokes.length;
    }

    removeStroke(strokeId) {
        const index = this.strokes.findIndex(s => s.id === strokeId);
        if (index !== -1) {
            this.strokes.splice(index, 1);
            this.redrawAll();
        }
    }

    updateStroke(strokeId, updates) {
        const stroke = this.strokes.find(s => s.id === strokeId);
        if (stroke) {
            Object.assign(stroke, updates);
        }
    }

    dispatchStrokeEvent(eventName, data = null) {
        const event = new CustomEvent(eventName, {
            detail: data
        });
        this.canvas.dispatchEvent(event);
    }
}

// Export for use in main.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DrawingEngine;
}
