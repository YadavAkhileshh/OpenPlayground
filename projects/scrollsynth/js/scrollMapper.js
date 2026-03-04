// ============================================
// SCROLL MAPPER
// ============================================

/**
 * ScrollMapper detects and normalizes scroll events
 */
class ScrollMapper {
    constructor(scrollPhysics, audioEngine) {
        this.physics = scrollPhysics;
        this.audio = audioEngine;

        // Scroll tracking
        this.maxScrollY = 0;
        this.maxScrollX = 0;
        this.lastScrollTime = 0;
        this.isThrottled = false;

        // Bind methods
        this.handleScroll = this.handleScroll.bind(this);
        this.updateMaxScroll = this.updateMaxScroll.bind(this);
    }

    /**
     * Initialize scroll event listeners
     */
    initialize() {
        // Calculate maximum scroll distances
        this.updateMaxScroll();

        // Listen for scroll events
        window.addEventListener('scroll', this.handleScroll, { passive: true });

        // Update max scroll on resize
        window.addEventListener('resize', this.updateMaxScroll);

        // Initial scroll position
        this.handleScroll();
    }

    /**
     * Update maximum scroll distances
     */
    updateMaxScroll() {
        this.maxScrollY = Math.max(
            document.documentElement.scrollHeight - window.innerHeight,
            1 // Prevent division by zero
        );

        this.maxScrollX = Math.max(
            document.documentElement.scrollWidth - window.innerWidth,
            1 // Prevent division by zero
        );
    }

    /**
     * Handle scroll events
     */
    handleScroll() {
        // Throttle scroll events
        const now = performance.now();
        if (this.isThrottled && now - this.lastScrollTime < CONFIG.SCROLL.THROTTLE_MS) {
            return;
        }

        this.lastScrollTime = now;
        this.isThrottled = true;

        // Get current scroll position
        const scrollY = window.scrollY || window.pageYOffset;
        const scrollX = window.scrollX || window.pageXOffset;

        // Normalize to 0-1 range
        const normalizedY = scrollY / this.maxScrollY;
        const normalizedX = scrollX / this.maxScrollX;

        // Update physics
        this.physics.setTarget(normalizedY, normalizedX);

        // Reset throttle
        setTimeout(() => {
            this.isThrottled = false;
        }, CONFIG.SCROLL.THROTTLE_MS);
    }

    /**
     * Map scroll values to audio parameters
     * @param {Object} scrollValues - Current scroll values from physics
     */
    mapToAudio(scrollValues) {
        if (!this.audio.isInitialized) return;

        // Map vertical scroll to frequency (exponential scaling)
        const frequency = MATH.exponentialScale(
            scrollValues.vertical,
            CONFIG.AUDIO.MIN_FREQUENCY,
            CONFIG.AUDIO.MAX_FREQUENCY
        );
        this.audio.setFrequency(frequency);

        // Map horizontal scroll to filter frequency
        const filterFreq = MATH.exponentialScale(
            scrollValues.horizontal,
            CONFIG.AUDIO.MIN_FILTER_FREQ,
            CONFIG.AUDIO.MAX_FILTER_FREQ
        );
        this.audio.setFilterFrequency(filterFreq);
    }

    /**
     * Get current scroll position (normalized)
     * @returns {Object}
     */
    getCurrentScroll() {
        const scrollY = window.scrollY || window.pageYOffset;
        const scrollX = window.scrollX || window.pageXOffset;

        return {
            vertical: scrollY / this.maxScrollY,
            horizontal: scrollX / this.maxScrollX,
            rawY: scrollY,
            rawX: scrollX
        };
    }

    /**
     * Clean up event listeners
     */
    destroy() {
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.updateMaxScroll);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScrollMapper;
}
