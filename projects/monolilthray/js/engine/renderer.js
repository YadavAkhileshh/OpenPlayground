/**
 * @file renderer.js
 * @description Coordinate the worker thread and paint the canvas.
 */

class Renderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d', { alpha: false }); // Optimize for opaque

        // Resolution scaling (lower = faster)
        // 0.25 = 1/4th resolution (looks retro/cinematic)
        this.scale = 0.5;

        this.width = 0;
        this.height = 0;

        this.worker = new Worker('js/engine/worker.js');
        this.worker.onmessage = this.handleWorkerMessage.bind(this);

        this.isRendering = false;
        this.lastFrameTime = 0;

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => {
            this.resize();
        });
    }

    resize() {
        // Fullscreen
        const w = window.innerWidth;
        const h = window.innerHeight;

        // Internal resolution
        this.width = Math.floor(w * this.scale);
        this.height = Math.floor(h * this.scale);

        this.canvas.width = this.width;
        this.canvas.height = this.height;

        // Visual scaling handles the rest (CSS w/h is 100%)
    }

    /**
     * Start the render loop.
     * @param {Camera} camera 
     */
    start(camera, input) {
        this.lastMoveTime = 0;
        this.renderLoop(camera, input);
    }

    renderLoop(camera, input) {
        if (!this.isRendering) return;

        const now = performance.now();
        const time = now / 1000;

        // Update stats
        if (window.UI) window.UI.updateTime(now - this.lastFrameTime);
        this.lastFrameTime = now;

        // 1. Update Camera
        camera.update(time, input);
        const view = camera.getLookAtMatrix();

        // 2. Send Command to Worker
        // We send the current state. The worker will reply with an ImageData buffer.
        // NOTE: To get high FPS with workers, we typically use Transferables or SharedArrayBuffer.
        // For simplicity/compatibility, we'll try standard postMessage first.

        this.worker.postMessage({
            type: 'render',
            width: this.width,
            height: this.height,
            camera: {
                origin: view.origin,
                zAxis: view.zAxis, // Forward
                yAxis: view.yAxis, // Up
                xAxis: view.xAxis  // Right
            },
            time: time
        });

        // Loop continues when worker replies (see handleWorkerMessage)
        // Actually, requestAnimationFrame should drive the loop to prevent message flooding.
        // But we want to wait for the worker to finish before asking for the next frame to avoid queue buildup?
        // Let's use a "fire and forget" strategy synced with RAF, but skip if previous frame busy.
        // Actually, best pattern: RAF -> check if busy -> if not, send work.
    }

    handleWorkerMessage(e) {
        const { type, buffer, data } = e.data;

        if (type === 'frame') {
            // Draw the pixel data
            // data is a Uint8ClampedArray
            const imageData = new ImageData(data, this.width, this.height);
            this.ctx.putImageData(imageData, 0, 0);

            // Schedule next frame
            requestAnimationFrame(() => {
                if (window.game && window.game.camera) {
                    this.renderLoop(window.game.camera, window.game.input);
                }
            });

            if (window.UI) {
                window.UI.updateResolution(this.width, this.height);
                window.UI.updateRays(this.width * this.height);
            }
        }
    }
}
