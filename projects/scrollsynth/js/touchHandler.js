// ============================================
// TOUCH HANDLER
// ============================================

/**
 * TouchHandler normalizes touch events for mobile support
 */
class TouchHandler {
    constructor(scrollMapper, gestureDetector) {
        this.scrollMapper = scrollMapper;
        this.gestureDetector = gestureDetector;

        // Touch state
        this.isTouching = false;
        this.touchStartY = 0;
        this.touchStartX = 0;
        this.lastTouchY = 0;
        this.lastTouchX = 0;

        // Bind methods
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
    }

    /**
     * Initialize touch event listeners
     */
    initialize() {
        if (!CONFIG.TOUCH.ENABLED) return;

        document.addEventListener('touchstart', this.handleTouchStart, { passive: false });
        document.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd, { passive: false });
    }

    /**
     * Handle touch start
     * @param {TouchEvent} event
     */
    handleTouchStart(event) {
        if (CONFIG.TOUCH.PREVENT_DEFAULT) {
            event.preventDefault();
        }

        const touch = event.touches[0];
        this.isTouching = true;
        this.touchStartY = touch.clientY;
        this.touchStartX = touch.clientX;
        this.lastTouchY = touch.clientY;
        this.lastTouchX = touch.clientX;
    }

    /**
     * Handle touch move
     * @param {TouchEvent} event
     */
    handleTouchMove(event) {
        if (!this.isTouching) return;

        if (CONFIG.TOUCH.PREVENT_DEFAULT) {
            event.preventDefault();
        }

        const touch = event.touches[0];

        // Calculate delta
        const deltaY = (this.lastTouchY - touch.clientY) * CONFIG.TOUCH.SENSITIVITY;
        const deltaX = (this.lastTouchX - touch.clientX) * CONFIG.TOUCH.SENSITIVITY;

        // Update scroll position
        window.scrollBy(deltaX, deltaY);

        // Update last position
        this.lastTouchY = touch.clientY;
        this.lastTouchX = touch.clientX;

        // Add to gesture path
        if (this.gestureDetector) {
            const normalizedX = touch.clientX / window.innerWidth;
            const normalizedY = touch.clientY / window.innerHeight;
            this.gestureDetector.addPoint(normalizedX, normalizedY);
        }
    }

    /**
     * Handle touch end
     * @param {TouchEvent} event
     */
    handleTouchEnd(event) {
        if (CONFIG.TOUCH.PREVENT_DEFAULT) {
            event.preventDefault();
        }

        this.isTouching = false;
    }

    /**
     * Clean up event listeners
     */
    destroy() {
        document.removeEventListener('touchstart', this.handleTouchStart);
        document.removeEventListener('touchmove', this.handleTouchMove);
        document.removeEventListener('touchend', this.handleTouchEnd);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TouchHandler;
}
