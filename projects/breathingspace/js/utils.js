/**
 * BreathingSpace - Utilities
 * 
 * A collection of stateless helper functions that provide 
 * the mathematical foundation for the breathing engine and 
 * streamline DOM interactions.
 * 
 * CATEGORIES:
 * 1. MATH: Linear interpolation, mapping, and clamping.
 * 2. DOM: Selection shorthands and event cleanup.
 * 3. PERFORMANCE: Throttling and debouncing.
 * 4. VALIDATION: Type checking and safety guards.
 * 
 * Why this exists:
 * In a vanilla project, having a robust utility layer prevents 
 * code duplication and ensures that complex math like lerp and 
 * range mapping is handled consistently across the engine and UI.
 */

const Utils = {

    // --- Mathematical Foundation ---

    /**
     * Linear Interpolation (lerp)
     * Calculates a value between two numbers at a specific percentage.
     * Useful for smooth movement between states.
     * 
     * Formula: (1 - amt) * start + amt * end
     * 
     * @param {number} start - The starting value.
     * @param {number} end - The ending value.
     * @param {number} amt - The interpolation amount (usually 0 to 1).
     * @returns {number} The interpolated value.
     */
    lerp: (start, end, amt) => {
        return (1 - amt) * start + amt * end;
    },

    /**
     * Range Mapping
     * Converts a number from one range [x1, y1] to another range [x2, y2].
     * Extremely useful for mapping mouse coordinates or timers to CSS values.
     * 
     * @param {number} value - The input value.
     * @param {number} x1 - Source range lower bound.
     * @param {number} y1 - Source range upper bound.
     * @param {number} x2 - Target range lower bound.
     * @param {number} y2 - Target range upper bound.
     * @returns {number} The mapped value.
     */
    mapRange: (value, x1, y1, x2, y2) => {
        return ((value - x1) * (y2 - x2)) / (y1 - x1) + x2;
    },

    /**
     * Numerical Clamping
     * Ensures a value stays within a specified range [min, max].
     * 
     * @param {number} val - The input value.
     * @param {number} min - Minimum allowed value.
     * @param {number} max - Maximum allowed value.
     * @returns {number} The clamped value.
     */
    clamp: (val, min, max) => {
        return Math.max(min, Math.min(max, val));
    },

    /**
     * Precision Rounding
     * Rounds a number to a specific decimal place to prevent floating point jitter.
     * 
     * @param {number} num - Value to round
     * @param {number} decimals - Number of decimal places
     * @returns {number} Rounded value
     */
    roundTo: (num, decimals = 2) => {
        const factor = Math.pow(10, decimals);
        return Math.round(num * factor) / factor;
    },

    // --- DOM Utilities ---

    /**
     * Query Selector Shorthand (Single)
     * Replaces document.querySelector with a shorter symbol.
     * 
     * @param {string} selector - CSS selector string.
     * @returns {Element|null}
     */
    $: (selector) => document.querySelector(selector),

    /**
     * Query Selector Shorthand (Multiple)
     * Replaces document.querySelectorAll.
     * 
     * @param {string} selector - CSS selector string.
     * @returns {NodeList}
     */
    $$: (selector) => document.querySelectorAll(selector),

    /**
     * CSS Variable Updater
     * Helper to set properties on the root element.
     * 
     * @param {string} name - Variable name (with --).
     * @param {string|number} value - The value to set.
     * @param {HTMLElement} element - Target element (default: documentElement).
     */
    setCSSVar: (name, value, element = document.documentElement) => {
        element.style.setProperty(name, value);
    },

    /**
     * Class Toggler with safety
     * 
     * @param {HTMLElement} el - Target element.
     * @param {string} className - Class to toggle.
     * @param {boolean} force - Optional force state.
     */
    toggleCls: (el, className, force) => {
        if (!el) return;
        el.classList.toggle(className, force);
    },

    // --- Performance Optimization ---

    /**
     * Debouncing Implementation
     * Limits how often a function can be called. Useful for resize events.
     * 
     * @param {Function} func - Target function.
     * @param {number} wait - Delay in ms.
     * @returns {Function}
     */
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttling Implementation
     * Ensures a function is called at most once per interval.
     * Recommended for scroll or mousemove handlers.
     * 
     * @param {Function} func - Target function.
     * @param {number} limit - Interval in ms.
     * @returns {Function}
     */
    throttle: (func, limit) => {
        let inThrottle;
        return function () {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // --- Type Safety & Debugging ---

    /**
     * Verifies if a value is a valid number.
     * 
     * @param {any} val - Value to check.
     * @returns {boolean}
     */
    isNum: (val) => typeof val === 'number' && !isNaN(val),

    /**
     * Error Logger
     * Standardized error reporting with module context.
     * 
     * @param {string} origin - Which module threw the error.
     * @param {string} msg - The error message.
     */
    logError: (origin, msg) => {
        console.error(`[BreathingSpace Error - ${origin}]:`, msg);
    }
};

/**
 * Utility Verification
 * Self-executing integrity check for critical math functions.
 */
(function verifyUtils() {
    try {
        const testVal = Utils.lerp(10, 20, 0.5);
        if (testVal !== 15) {
            throw new Error("Lerp calculation mismatch.");
        }

        const mapVal = Utils.mapRange(5, 0, 10, 0, 100);
        if (mapVal !== 50) {
            throw new Error("MapRange calculation mismatch.");
        }
    } catch (err) {
        Utils.logError("Utils", "System integrity check failed: " + err.message);
    }
})();
