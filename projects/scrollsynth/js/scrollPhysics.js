// ============================================
// SCROLL PHYSICS
// ============================================

/**
 * ScrollPhysics handles smooth interpolation and physics-based scroll behavior
 */
class ScrollPhysics {
    constructor() {
        // Current scroll values (0-1 normalized)
        this.current = {
            vertical: 0.5,
            horizontal: 0.5
        };

        // Target scroll values (0-1 normalized)
        this.target = {
            vertical: 0.5,
            horizontal: 0.5
        };

        // Velocity tracking
        this.velocity = {
            vertical: 0,
            horizontal: 0
        };

        // Previous values for velocity calculation
        this.previous = {
            vertical: 0.5,
            horizontal: 0.5
        };

        // Timestamp for delta time calculation
        this.lastUpdate = performance.now();
    }

    /**
     * Update target scroll position
     * @param {number} vertical - Vertical scroll (0-1)
     * @param {number} horizontal - Horizontal scroll (0-1)
     */
    setTarget(vertical, horizontal) {
        this.target.vertical = MATH.clamp(vertical, 0, 1);
        this.target.horizontal = MATH.clamp(horizontal, 0, 1);
    }

    /**
     * Update physics simulation
     * @returns {Object} Current scroll values
     */
    update() {
        const now = performance.now();
        const deltaTime = (now - this.lastUpdate) / 1000; // Convert to seconds
        this.lastUpdate = now;

        // Calculate velocity
        this.velocity.vertical = (this.current.vertical - this.previous.vertical) / deltaTime;
        this.velocity.horizontal = (this.current.horizontal - this.previous.horizontal) / deltaTime;

        // Apply velocity decay
        this.velocity.vertical *= CONFIG.SCROLL.VELOCITY_DECAY;
        this.velocity.horizontal *= CONFIG.SCROLL.VELOCITY_DECAY;

        // Store previous values
        this.previous.vertical = this.current.vertical;
        this.previous.horizontal = this.current.horizontal;

        // Smooth interpolation towards target
        this.current.vertical = MATH.lerp(
            this.current.vertical,
            this.target.vertical,
            CONFIG.SCROLL.SMOOTH_FACTOR
        );

        this.current.horizontal = MATH.lerp(
            this.current.horizontal,
            this.target.horizontal,
            CONFIG.SCROLL.SMOOTH_FACTOR
        );

        // Apply dead zone
        if (Math.abs(this.current.vertical - this.target.vertical) < CONFIG.SCROLL.DEAD_ZONE) {
            this.current.vertical = this.target.vertical;
        }

        if (Math.abs(this.current.horizontal - this.target.horizontal) < CONFIG.SCROLL.DEAD_ZONE) {
            this.current.horizontal = this.target.horizontal;
        }

        return {
            vertical: this.current.vertical,
            horizontal: this.current.horizontal,
            velocityVertical: this.velocity.vertical,
            velocityHorizontal: this.velocity.horizontal
        };
    }

    /**
     * Get current scroll values
     * @returns {Object}
     */
    getCurrent() {
        return {
            vertical: this.current.vertical,
            horizontal: this.current.horizontal
        };
    }

    /**
     * Get current velocity
     * @returns {Object}
     */
    getVelocity() {
        return {
            vertical: this.velocity.vertical,
            horizontal: this.velocity.horizontal
        };
    }

    /**
     * Reset to default position
     */
    reset() {
        this.current = { vertical: 0.5, horizontal: 0.5 };
        this.target = { vertical: 0.5, horizontal: 0.5 };
        this.velocity = { vertical: 0, horizontal: 0 };
        this.previous = { vertical: 0.5, horizontal: 0.5 };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScrollPhysics;
}
