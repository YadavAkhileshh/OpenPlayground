/**
 * Input Management Module
 * Responsible for tracking user drawing paths and firing events.
 */

class InputManager {
    constructor() {
        this.isDrawing = false;
        this.currentPath = [];
        this.lastX = 0;
        this.lastY = 0;
        this.canvas = document.getElementById('overlay-canvas');
        this.ctx = this.canvas.getContext('2d');

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());

        window.addEventListener('mousedown', (e) => this.startDrawing(e));
        window.addEventListener('mousemove', (e) => this.draw(e));
        window.addEventListener('mouseup', () => this.stopDrawing());

        // Touch support
        window.addEventListener('touchstart', (e) => this.startDrawing(e.touches[0]));
        window.addEventListener('touchmove', (e) => this.draw(e.touches[0]));
        window.addEventListener('touchend', () => this.stopDrawing());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    startDrawing(e) {
        this.isDrawing = true;
        this.currentPath = [{ x: e.clientX, y: e.clientY, time: Date.now() }];
        this.lastX = e.clientX;
        this.lastY = e.clientY;

        // Clear previous visual traces if any
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Custom event for starting surgery
        window.dispatchEvent(new CustomEvent('wound-start', { detail: this.currentPath[0] }));
    }

    draw(e) {
        if (!this.isDrawing) return;

        const x = e.clientX;
        const y = e.clientY;
        const dist = Math.hypot(x - this.lastX, y - this.lastY);

        if (dist > CONFIG.DRAWING.MIN_DISTANCE) {
            const point = { x, y, time: Date.now() };
            this.currentPath.push(point);

            // Draw visual trace
            this.renderTrace(this.lastX, this.lastY, x, y);

            this.lastX = x;
            this.lastY = y;

            window.dispatchEvent(new CustomEvent('wound-path', { detail: point }));
        }
    }

    stopDrawing() {
        if (!this.isDrawing) return;
        this.isDrawing = false;

        if (this.currentPath.length > 2) {
            window.dispatchEvent(new CustomEvent('wound-complete', {
                detail: { path: [...this.currentPath] }
            }));
        }

        // Fade out canvas trace
        this.fadeTrace();
    }

    renderTrace(x1, y1, x2, y2) {
        this.ctx.strokeStyle = CONFIG.VFX.WOUND_COLOR;
        this.ctx.lineWidth = CONFIG.DRAWING.FLUID_WIDTH;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
    }

    fadeTrace() {
        let opacity = 1;
        const fade = () => {
            opacity -= 0.05;
            if (opacity <= 0) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                return;
            }
            this.ctx.globalAlpha = opacity;
            requestAnimationFrame(fade);
        };
        // Delay fade for artistic effect
        setTimeout(fade, 500);
    }
}

window.InputManager = new InputManager();
