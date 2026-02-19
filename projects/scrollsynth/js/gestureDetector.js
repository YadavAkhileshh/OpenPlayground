// ============================================
// GESTURE DETECTOR
// ============================================

/**
 * GestureDetector recognizes scroll patterns
 */
class GestureDetector {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.statusElement = document.getElementById('gestureStatus');

        // Path tracking
        this.path = [];
        this.isTracking = false;
        this.lastPoint = null;
        this.lastTime = 0;

        // Detected gesture
        this.currentGesture = null;

        // Set canvas resolution
        if (this.canvas) {
            this.resize();
            window.addEventListener('resize', () => this.resize());
        }
    }

    /**
     * Resize canvas
     */
    resize() {
        if (!this.canvas) return;

        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        this.width = rect.width;
        this.height = rect.height;
    }

    /**
     * Add point to path
     * @param {number} x - X coordinate (0-1)
     * @param {number} y - Y coordinate (0-1)
     */
    addPoint(x, y) {
        const now = performance.now();

        // Check time gap
        if (this.lastTime > 0 && now - this.lastTime > CONFIG.GESTURE.MAX_TIME_GAP) {
            this.reset();
        }

        this.lastTime = now;
        this.path.push({ x, y, time: now });
        this.isTracking = true;

        // Draw path
        this.drawPath();

        // Detect gesture if enough points
        if (this.path.length >= CONFIG.GESTURE.MIN_POINTS) {
            this.detectGesture();
        }
    }

    /**
     * Reset path
     */
    reset() {
        this.path = [];
        this.isTracking = false;
        this.lastPoint = null;
        this.lastTime = 0;
        this.currentGesture = null;
        this.clearCanvas();
        this.updateStatus('No gesture detected');
    }

    /**
     * Detect gesture from path
     */
    detectGesture() {
        if (this.path.length < CONFIG.GESTURE.MIN_POINTS) return;

        // Simplify path
        const simplified = this.simplifyPath(this.path);

        // Detect circle
        if (this.isCircle(simplified)) {
            this.currentGesture = CONFIG.GESTURE.TYPES.CIRCLE;
            this.updateStatus('Circle detected! 🔄');
            this.triggerEffect('circle');
            return;
        }

        // Detect zigzag
        if (this.isZigzag(simplified)) {
            this.currentGesture = CONFIG.GESTURE.TYPES.ZIGZAG;
            this.updateStatus('Zigzag detected! ⚡');
            this.triggerEffect('zigzag');
            return;
        }

        // Detect diagonal
        if (this.isDiagonal(simplified)) {
            this.currentGesture = CONFIG.GESTURE.TYPES.DIAGONAL;
            this.updateStatus('Diagonal detected! 📈');
            this.triggerEffect('diagonal');
            return;
        }
    }

    /**
     * Check if path is a circle
     * @param {Array} path - Simplified path
     * @returns {boolean}
     */
    isCircle(path) {
        if (path.length < 8) return false;

        // Calculate center
        let centerX = 0, centerY = 0;
        path.forEach(p => {
            centerX += p.x;
            centerY += p.y;
        });
        centerX /= path.length;
        centerY /= path.length;

        // Calculate average radius
        let avgRadius = 0;
        path.forEach(p => {
            const dx = p.x - centerX;
            const dy = p.y - centerY;
            avgRadius += Math.sqrt(dx * dx + dy * dy);
        });
        avgRadius /= path.length;

        // Check variance in radius
        let variance = 0;
        path.forEach(p => {
            const dx = p.x - centerX;
            const dy = p.y - centerY;
            const radius = Math.sqrt(dx * dx + dy * dy);
            variance += Math.abs(radius - avgRadius);
        });
        variance /= path.length;

        // Circle if low variance
        return variance / avgRadius < CONFIG.GESTURE.CIRCLE_THRESHOLD;
    }

    /**
     * Check if path is a zigzag
     * @param {Array} path - Simplified path
     * @returns {boolean}
     */
    isZigzag(path) {
        if (path.length < 4) return false;

        // Count direction changes
        let changes = 0;
        for (let i = 2; i < path.length; i++) {
            const dx1 = path[i - 1].x - path[i - 2].x;
            const dy1 = path[i - 1].y - path[i - 2].y;
            const dx2 = path[i].x - path[i - 1].x;
            const dy2 = path[i].y - path[i - 1].y;

            // Check if direction changed
            if (dx1 * dx2 < 0 || dy1 * dy2 < 0) {
                changes++;
            }
        }

        return changes >= CONFIG.GESTURE.ZIGZAG_THRESHOLD;
    }

    /**
     * Check if path is diagonal
     * @param {Array} path - Simplified path
     * @returns {boolean}
     */
    isDiagonal(path) {
        if (path.length < 3) return false;

        const start = path[0];
        const end = path[path.length - 1];

        const dx = Math.abs(end.x - start.x);
        const dy = Math.abs(end.y - start.y);

        // Check if both x and y changed significantly
        return dx > CONFIG.GESTURE.DIAGONAL_THRESHOLD &&
            dy > CONFIG.GESTURE.DIAGONAL_THRESHOLD;
    }

    /**
     * Simplify path using Douglas-Peucker algorithm
     * @param {Array} path - Original path
     * @returns {Array} Simplified path
     */
    simplifyPath(path) {
        if (path.length < 3) return path;

        const tolerance = CONFIG.GESTURE.SIMPLIFY_TOLERANCE / 100;

        // Find point with maximum distance
        let maxDist = 0;
        let index = 0;
        const start = path[0];
        const end = path[path.length - 1];

        for (let i = 1; i < path.length - 1; i++) {
            const dist = this.perpendicularDistance(path[i], start, end);
            if (dist > maxDist) {
                maxDist = dist;
                index = i;
            }
        }

        // If max distance is greater than tolerance, recursively simplify
        if (maxDist > tolerance) {
            const left = this.simplifyPath(path.slice(0, index + 1));
            const right = this.simplifyPath(path.slice(index));
            return left.slice(0, -1).concat(right);
        } else {
            return [start, end];
        }
    }

    /**
     * Calculate perpendicular distance from point to line
     * @param {Object} point - Point
     * @param {Object} lineStart - Line start
     * @param {Object} lineEnd - Line end
     * @returns {number} Distance
     */
    perpendicularDistance(point, lineStart, lineEnd) {
        const dx = lineEnd.x - lineStart.x;
        const dy = lineEnd.y - lineStart.y;
        const mag = Math.sqrt(dx * dx + dy * dy);

        if (mag === 0) return 0;

        const u = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / (mag * mag);
        const x = lineStart.x + u * dx;
        const y = lineStart.y + u * dy;

        const pdx = point.x - x;
        const pdy = point.y - y;

        return Math.sqrt(pdx * pdx + pdy * pdy);
    }

    /**
     * Draw path on canvas
     */
    drawPath() {
        if (!this.ctx || this.path.length === 0) return;

        // Clear canvas
        this.ctx.fillStyle = '#0a0a0f';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw path
        this.ctx.strokeStyle = '#00ffcc';
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#00ffcc';

        this.ctx.beginPath();

        for (let i = 0; i < this.path.length; i++) {
            const x = this.path[i].x * this.width;
            const y = this.path[i].y * this.height;

            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }

        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
    }

    /**
     * Clear canvas
     */
    clearCanvas() {
        if (!this.ctx) return;

        this.ctx.fillStyle = '#0a0a0f';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    /**
     * Update status display
     * @param {string} message - Status message
     */
    updateStatus(message) {
        if (this.statusElement) {
            this.statusElement.textContent = message;
        }
    }

    /**
     * Trigger effect based on gesture
     * @param {string} type - Gesture type
     */
    triggerEffect(type) {
        // Dispatch custom event for other modules to handle
        window.dispatchEvent(new CustomEvent('gestureDetected', {
            detail: { type }
        }));

        // Auto-reset after a delay
        setTimeout(() => {
            this.reset();
        }, 2000);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GestureDetector;
}
