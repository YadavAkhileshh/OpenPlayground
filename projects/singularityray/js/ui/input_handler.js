/**
 * SingularityRay JS - UI - Input Handler
 * Global singleton managing mouse, touch and keyboard interactions
 * Translates DOM events into normalized axis commands for the core engine.
 */

export class InputHandler {
    constructor() {
        this.keys = {};

        // Mouse State
        this.isDragging = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.lastMouseX = 0;
        this.lastMouseY = 0;

        this.deltaX = 0;
        this.deltaY = 0;

        this.wheelDelta = 0;

        // Callback system isolated for decoupling
        this.onDragMove = null;
        this.onZoom = null;
        this.onInteractionStart = null;
        this.onInteractionEnd = null;

        this._bindEvents();
    }

    _bindEvents() {
        // Prevent context menu on canvas while dragging
        document.addEventListener('contextmenu', e => {
            if (e.target.tagName === 'CANVAS') e.preventDefault();
        });

        // Mouse Down
        window.addEventListener('mousedown', (e) => {
            // Ignore panel clicks
            if (e.target.closest('#control-panel')) return;

            this.isDragging = true;
            document.body.classList.add('is-dragging');
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;

            if (this.onInteractionStart) this.onInteractionStart();
        });

        // Mouse Move
        window.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;

            if (this.isDragging) {
                this.deltaX = this.mouseX - this.lastMouseX;
                this.deltaY = this.mouseY - this.lastMouseY;

                this.lastMouseX = this.mouseX;
                this.lastMouseY = this.mouseY;

                if (this.onDragMove) this.onDragMove(this.deltaX, this.deltaY);
            }
        });

        // Mouse Up
        window.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.isDragging = false;
                document.body.classList.remove('is-dragging');

                this.deltaX = 0;
                this.deltaY = 0;

                if (this.onInteractionEnd) this.onInteractionEnd();
            }
        });

        // Wheel Zoom
        window.addEventListener('wheel', (e) => {
            if (e.target.closest('#control-panel')) return; // let UI scroll natively

            this.wheelDelta = Math.sign(e.deltaY);
            if (this.onZoom) this.onZoom(this.wheelDelta);

            if (this.onInteractionStart) this.onInteractionStart();

            // Auto trigger interaction end shortly after scrolling stops
            clearTimeout(this._wheelTimeout);
            this._wheelTimeout = setTimeout(() => {
                if (this.onInteractionEnd && !this.isDragging) this.onInteractionEnd();
            }, 100);
        }, { passive: true });

        // Touch Support
        window.addEventListener('touchstart', (e) => {
            if (e.target.closest('#control-panel')) return;
            // Prevent scrolling
            if (e.target.tagName === 'CANVAS') e.preventDefault();

            this.isDragging = true;
            this.lastMouseX = e.touches[0].clientX;
            this.lastMouseY = e.touches[0].clientY;

            if (this.onInteractionStart) this.onInteractionStart();
        }, { passive: false });

        window.addEventListener('touchmove', (e) => {
            if (this.isDragging) {
                this.mouseX = e.touches[0].clientX;
                this.mouseY = e.touches[0].clientY;

                this.deltaX = this.mouseX - this.lastMouseX;
                this.deltaY = this.mouseY - this.lastMouseY;

                this.lastMouseX = this.mouseX;
                this.lastMouseY = this.mouseY;

                if (this.onDragMove) this.onDragMove(this.deltaX, this.deltaY);
            }
        }, { passive: false });

        window.addEventListener('touchend', () => {
            if (this.isDragging) {
                this.isDragging = false;
                if (this.onInteractionEnd) this.onInteractionEnd();
            }
        });
    }

    /**
     * Consume specific actions per frame if polling is desired.
     */
    update() {
        // Reset deltas if not dragging so we don't spin indefinitely
        if (!this.isDragging) {
            this.deltaX = 0;
            this.deltaY = 0;
        }

        this.wheelDelta = 0; // consumed
    }
}
