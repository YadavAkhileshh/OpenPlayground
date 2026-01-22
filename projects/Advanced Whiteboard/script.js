/**
 * ADVANCED WHITEBOARD ENGINE (Bug-Free Edition)
 */
class WhiteboardApp {
    constructor() {
        this.canvas = document.getElementById('board');
        this.ctx = this.canvas.getContext('2d');
        
        // App State
        this.timeline = [];
        this.isDrawing = false;
        this.tool = 'pen';
        this.color = '#2c3e50';
        this.size = 5;
        this.startTime = Date.now();

        // Position Tracking
        this.startPos = { x: 0, y: 0 };
        this.currentPos = { x: 0, y: 0 };

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Input Listeners
        this.canvas.addEventListener('mousedown', (e) => this.startAction(e));
        this.canvas.addEventListener('mousemove', (e) => this.moveAction(e));
        this.canvas.addEventListener('mouseup', () => this.endAction());

        // Start Render Loop
        requestAnimationFrame(() => this.drawLoop());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    // --- Tool Controls ---
    setTool(newTool) {
        this.tool = newTool;
        document.querySelectorAll('.tool').forEach(el => 
            el.classList.toggle('active', el.dataset.tool === newTool)
        );
    }

    setColor(newColor) {
        this.color = newColor;
        document.querySelectorAll('.swatch').forEach(el => 
            el.classList.toggle('active', el.style.background === newColor)
        );
    }

    setBrushSize(newSize) {
        this.size = parseInt(newSize);
    }

    // --- Drawing Actions ---
    startAction(e) {
        this.isDrawing = true;
        this.startPos = this.getMousePos(e);
        this.currentPos = this.startPos;

        if (this.tool === 'pen' || this.tool === 'eraser') {
            this.pushToTimeline('start', this.startPos.x, this.startPos.y);
        }
    }

    moveAction(e) {
        this.currentPos = this.getMousePos(e);
        if (this.isDrawing && (this.tool === 'pen' || this.tool === 'eraser')) {
            this.pushToTimeline('move', this.currentPos.x, this.currentPos.y);
        }
    }

    endAction() {
        if (!this.isDrawing) return;
        
        // Record Shapes only on release
        if (!['pen', 'eraser'].includes(this.tool)) {
            this.pushToTimeline('shape', this.startPos.x, this.startPos.y, {
                endX: this.currentPos.x,
                endY: this.currentPos.y,
                shape: this.tool
            });
        }
        
        this.isDrawing = false;
        document.getElementById('event-count').innerText = this.timeline.length;
    }

    pushToTimeline(type, x, y, options = {}) {
        this.timeline.push({
            type, x, y,
            endX: options.endX || x,
            endY: options.endY || y,
            tool: options.shape || this.tool,
            color: this.color,
            size: this.size,
            isEraser: this.tool === 'eraser',
            time: Date.now()
        });
    }

    // --- Rendering Engine ---
    drawLoop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        let lastPathPoint = null;

        this.timeline.forEach(event => {
            this.ctx.lineWidth = event.size;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';

            // Handle Eraser Transparency
            if (event.isEraser) {
                this.ctx.globalCompositeOperation = 'destination-out';
                this.ctx.strokeStyle = 'rgba(0,0,0,1)';
            } else {
                this.ctx.globalCompositeOperation = 'source-over';
                this.ctx.strokeStyle = event.color;
                this.ctx.fillStyle = event.color;
            }

            if (event.type === 'start') {
                lastPathPoint = event;
            } else if (event.type === 'move' && lastPathPoint) {
                this.ctx.beginPath();
                this.ctx.moveTo(lastPathPoint.x, lastPathPoint.y);
                this.ctx.lineTo(event.x, event.y);
                this.ctx.stroke();
                lastPathPoint = event;
            } else if (event.type === 'shape') {
                this.renderShape(event.tool, event.x, event.y, event.endX, event.endY);
            }
        });

        // Preview Shape while dragging
        if (this.isDrawing && !['pen', 'eraser'].includes(this.tool)) {
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.strokeStyle = this.color;
            this.ctx.lineWidth = this.size;
            this.renderShape(this.tool, this.startPos.x, this.startPos.y, this.currentPos.x, this.currentPos.y);
        }

        requestAnimationFrame(() => this.drawLoop());
    }

    renderShape(shape, x1, y1, x2, y2) {
        const w = x2 - x1;
        const h = y2 - y1;
        this.ctx.beginPath();
        
        switch(shape) {
            case 'rectangle': this.ctx.strokeRect(x1, y1, w, h); break;
            case 'circle':
                const r = Math.sqrt(w*w + h*h);
                this.ctx.arc(x1, y1, r, 0, Math.PI*2);
                this.ctx.stroke();
                break;
            case 'arrow':
                const angle = Math.atan2(h, w);
                this.ctx.moveTo(x1, y1); this.ctx.lineTo(x2, y2);
                this.ctx.lineTo(x2 - 15 * Math.cos(angle - Math.PI/6), y2 - 15 * Math.sin(angle - Math.PI/6));
                this.ctx.moveTo(x2, y2);
                this.ctx.lineTo(x2 - 15 * Math.cos(angle + Math.PI/6), y2 - 15 * Math.sin(angle + Math.PI/6));
                this.ctx.stroke();
                break;
            case 'triangle':
                this.ctx.moveTo(x1 + w/2, y1); this.ctx.lineTo(x1, y1+h); this.ctx.lineTo(x1+w, y1+h);
                this.ctx.closePath(); this.ctx.stroke();
                break;
        }
    }

    reset() {
        if (confirm("Clear board?")) {
            this.timeline = [];
            document.getElementById('event-count').innerText = "0";
        }
    }
}

const app = new WhiteboardApp();