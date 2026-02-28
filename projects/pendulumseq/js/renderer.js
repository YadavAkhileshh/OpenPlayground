/**
 * renderer.js - Canvas Renderer for Pendulum Visualization
 * Handles all drawing operations including pendulums, trails, and effects
 */

class Renderer {
    /**
     * Create a new renderer
     * @param {HTMLCanvasElement} canvas - Canvas element
     */
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Rendering settings
        this.showTrails = true;
        this.trailLength = 30;
        this.trailOpacity = 0.3;
        this.bobRadius = 12;
        this.stringWidth = 2;

        // Trail history for each pendulum
        this.trails = new Map();

        // Animation state
        this.animationId = null;
        this.isAnimating = false;

        // Setup canvas
        this.setupCanvas();

        // Handle window resize
        window.addEventListener('resize', () => this.setupCanvas());
    }

    /**
     * Setup canvas dimensions and scaling
     */
    setupCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        // Set canvas size accounting for device pixel ratio
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;

        // Scale context to match
        this.ctx.scale(dpr, dpr);

        // Store logical dimensions
        this.width = rect.width;
        this.height = rect.height;

        // Calculate origin point (top center)
        this.originX = this.width / 2;
        this.originY = 50;
    }

    /**
     * Clear the canvas
     * @param {number} alpha - Background alpha for trail effect (0-1)
     */
    clear(alpha = 1.0) {
        if (alpha >= 1.0) {
            // Full clear
            this.ctx.clearRect(0, 0, this.width, this.height);

            // Draw background
            this.ctx.fillStyle = '#151b24';
            this.ctx.fillRect(0, 0, this.width, this.height);
        } else {
            // Partial clear for trail effect
            this.ctx.fillStyle = `rgba(21, 27, 36, ${alpha})`;
            this.ctx.fillRect(0, 0, this.width, this.height);
        }
    }

    /**
     * Draw a single pendulum
     * @param {Object} pendulum - Pendulum object with physics and properties
     */
    drawPendulum(pendulum) {
        const { physics, color, id } = pendulum;

        // Get pendulum position
        const scale = 150; // Visual scale factor
        const pos = physics.getPosition(this.originX, this.originY, scale);

        // Update trail history
        this.updateTrail(id, pos);

        // Draw trail if enabled
        if (this.showTrails) {
            this.drawTrail(id, color);
        }

        // Draw string
        this.drawString(this.originX, this.originY, pos.x, pos.y, color);

        // Draw bob
        this.drawBob(pos.x, pos.y, color, physics.getNormalizedAmplitude());

        // Draw pivot point
        this.drawPivot(this.originX, this.originY);
    }

    /**
     * Draw the pendulum string
     * @param {number} x1 - Start X
     * @param {number} y1 - Start Y
     * @param {number} x2 - End X
     * @param {number} y2 - End Y
     * @param {string} color - String color
     */
    drawString(x1, y1, x2, y2, color) {
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = this.stringWidth;
        this.ctx.lineCap = 'round';
        this.ctx.stroke();
    }

    /**
     * Draw the pendulum bob
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} color - Bob color
     * @param {number} amplitude - Normalized amplitude for glow effect
     */
    drawBob(x, y, color, amplitude = 0.5) {
        // Draw glow
        const glowRadius = this.bobRadius * (1 + amplitude * 0.5);
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
        gradient.addColorStop(0, color);
        gradient.addColorStop(0.5, color + '80');
        gradient.addColorStop(1, color + '00');

        this.ctx.beginPath();
        this.ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();

        // Draw solid bob
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.bobRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.fill();

        // Draw highlight
        const highlightGradient = this.ctx.createRadialGradient(
            x - 3, y - 3, 0,
            x - 3, y - 3, this.bobRadius
        );
        highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        this.ctx.beginPath();
        this.ctx.arc(x, y, this.bobRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = highlightGradient;
        this.ctx.fill();
    }

    /**
     * Draw the pivot point
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    drawPivot(x, y) {
        // Draw pivot mount
        this.ctx.beginPath();
        this.ctx.arc(x, y, 6, 0, Math.PI * 2);
        this.ctx.fillStyle = '#9ca3af';
        this.ctx.fill();

        // Draw pivot highlight
        this.ctx.beginPath();
        this.ctx.arc(x, y, 4, 0, Math.PI * 2);
        this.ctx.fillStyle = '#e8edf4';
        this.ctx.fill();
    }

    /**
     * Update trail history for a pendulum
     * @param {string} id - Pendulum ID
     * @param {Object} position - Current position {x, y}
     */
    updateTrail(id, position) {
        if (!this.trails.has(id)) {
            this.trails.set(id, []);
        }

        const trail = this.trails.get(id);
        trail.push({ ...position });

        // Limit trail length
        if (trail.length > this.trailLength) {
            trail.shift();
        }
    }

    /**
     * Draw motion trail for a pendulum
     * @param {string} id - Pendulum ID
     * @param {string} color - Trail color
     */
    drawTrail(id, color) {
        const trail = this.trails.get(id);
        if (!trail || trail.length < 2) return;

        for (let i = 1; i < trail.length; i++) {
            const prev = trail[i - 1];
            const curr = trail[i];
            const alpha = (i / trail.length) * this.trailOpacity;

            this.ctx.beginPath();
            this.ctx.moveTo(prev.x, prev.y);
            this.ctx.lineTo(curr.x, curr.y);
            this.ctx.strokeStyle = color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            this.ctx.lineWidth = 2;
            this.ctx.lineCap = 'round';
            this.ctx.stroke();
        }
    }

    /**
     * Clear trail for a specific pendulum
     * @param {string} id - Pendulum ID
     */
    clearTrail(id) {
        this.trails.delete(id);
    }

    /**
     * Clear all trails
     */
    clearAllTrails() {
        this.trails.clear();
    }

    /**
     * Toggle trail rendering
     * @param {boolean} enabled - Enable trails
     */
    setTrailsEnabled(enabled) {
        this.showTrails = enabled;
    }

    /**
     * Set trail length
     * @param {number} length - Number of trail points
     */
    setTrailLength(length) {
        this.trailLength = Math.max(10, Math.min(100, length));
    }

    /**
     * Draw empty state message
     */
    drawEmptyState() {
        this.ctx.save();
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        // Draw icon
        this.ctx.font = '48px Arial';
        this.ctx.fillStyle = 'rgba(156, 163, 175, 0.3)';
        this.ctx.fillText('⚙', this.width / 2, this.height / 2 - 40);

        // Draw text
        this.ctx.font = '14px Inter, sans-serif';
        this.ctx.fillStyle = '#6b7280';
        this.ctx.fillText('Click "Add Pendulum" to begin', this.width / 2, this.height / 2 + 20);

        this.ctx.restore();
    }

    /**
     * Get canvas dimensions
     * @returns {Object} - Dimensions {width, height}
     */
    getDimensions() {
        return {
            width: this.width,
            height: this.height
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Renderer;
}
