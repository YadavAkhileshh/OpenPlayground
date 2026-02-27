/**
 * Camera.js
 * Manages the viewpoint, rotation, and zoom level for the 3D scene.
 */

export class Camera {
    constructor() {
        this.rotation = { x: 0, y: 0, z: 0 };
        this.position = { x: 0, y: 0, z: 0 };
        this.zoom = 1.0;
        this.sensitivity = 0.005;
        this.zoomSpeed = 0.001;

        // Mouse interaction state
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;

        this.initControls();
    }

    initControls() {
        const canvas = document.getElementById('chaos-canvas');

        canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
            canvas.style.cursor = 'grabbing';
        });

        window.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;

            const deltaX = e.clientX - this.lastMouseX;
            const deltaY = e.clientY - this.lastMouseY;

            // Update rotation based on mouse movement
            this.rotation.y += deltaX * this.sensitivity;
            this.rotation.x += deltaY * this.sensitivity;

            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        });

        window.addEventListener('mouseup', () => {
            this.isDragging = false;
            canvas.style.cursor = 'grab';
        });

        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.zoom += e.deltaY * -this.zoomSpeed;
            // Clamp zoom
            this.zoom = Math.max(0.1, Math.min(5.0, this.zoom));
        });
    }

    /**
     * Resets camera to default angle.
     */
    reset() {
        this.rotation = { x: 0, y: 0, z: 0 };
        this.zoom = 1.0;
    }
}
