export default class Viewport {
    constructor(container, canvas) {
        this.container = container;
        this.canvas = canvas;

        this.scale = 1;
        this.offset = { x: 0, y: 0 };
        this.isPanning = false;
        this.lastMouse = { x: 0, y: 0 };

        this.init();
    }

    init() {
        // Zoom
        this.container.addEventListener('wheel', (e) => this.handleZoom(e), { passive: false });

        // Pan
        this.container.addEventListener('mousedown', (e) => {
            if (e.button === 0 && e.target === this.container) {
                this.isPanning = true;
                this.lastMouse = { x: e.clientX, y: e.clientY };
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (this.isPanning) this.handlePan(e);
        });

        window.addEventListener('mouseup', () => {
            this.isPanning = false;
        });

        this.applyTransform();
    }

    handleZoom(e) {
        e.preventDefault();
        const zoomSpeed = 0.001;
        const delta = -e.deltaY;
        const factor = Math.pow(1.1, delta / 100);

        const newScale = Math.min(Math.max(this.scale * factor, 0.1), 3);

        // Pivot around mouse
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        const worldX = (mouseX - this.offset.x) / this.scale;
        const worldY = (mouseY - this.offset.y) / this.scale;

        this.scale = newScale;
        this.offset.x = mouseX - worldX * this.scale;
        this.offset.y = mouseY - worldY * this.scale;

        this.applyTransform();
        this.notifyZoom();
    }

    handlePan(e) {
        const dx = e.clientX - this.lastMouse.x;
        const dy = e.clientY - this.lastMouse.y;

        this.offset.x += dx;
        this.offset.y += dy;

        this.lastMouse = { x: e.clientX, y: e.clientY };
        this.applyTransform();
    }

    applyTransform() {
        this.canvas.style.transform = `translate(${this.offset.x}px, ${this.offset.y}px) scale(${this.scale})`;
    }

    toWorld(clientX, clientY) {
        return {
            x: (clientX - this.offset.x) / this.scale,
            y: (clientY - this.offset.y) / this.scale
        };
    }

    notifyZoom() {
        const display = document.getElementById('zoom-val');
        if (display) display.textContent = `${Math.round(this.scale * 100)}%`;
    }

    reset() {
        this.scale = 1;
        this.offset = { x: 0, y: 0 };
        this.applyTransform();
        this.notifyZoom();
    }
}
