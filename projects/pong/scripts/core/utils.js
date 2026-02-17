/**
 * @file utils.js
 * @description A comprehensive utility library for WindowPong. 
 * This module provides supplementary math functions, screen geometry calculations,
 * and system-level checks to ensure a stable multi-window gaming experience.
 * 
 * UTILITY CATEGORIES:
 * 1. MATHEMATICAL HELPERS: Interpolation, random range generators, and vectors.
 * 2. SCREEN GEOMETRY: Calculations for relative positioning across monitors.
 * 3. BROWSER COMPATIBILITY: Detection for environment-specific constraints.
 */

const PongUtils = (function () {
    /**
     * Internal constants for utility operations.
     */
    const PRECISION_LIMIT = 0.0001;

    return {
        /**
         * LINEAR INTERPOLATION (LERP)
         * Smoothly transitions between two numerical values.
         * Useful for smooth window movement if we were to implement it.
         * 
         * @param {number} start - Beginning value.
         * @param {number} end - Target value.
         * @param {number} t - Interpolation factor (0 to 1).
         * @returns {number}
         */
        lerp: function (start, end, t) {
            return start * (1 - t) + end * t;
        },

        /**
         * CLAMP
         * Restricts a value within a specific range.
         * 
         * @param {number} val - The input value.
         * @param {number} min - The lower bound.
         * @param {number} max - The upper bound.
         * @returns {number}
         */
        clamp: function (val, min, max) {
            return Math.max(min, Math.min(max, val));
        },

        /**
         * RANDOM RANGE
         * Generates a floating point random number between min and max.
         * 
         * @param {number} min - Minimum value.
         * @param {number} max - Maximum value.
         * @returns {number}
         */
        random: function (min, max) {
            return Math.random() * (max - min) + min;
        },

        /**
         * RANDOM INT
         * Generates a random integer between min and max inclusive.
         */
        randomInt: function (min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },

        /**
         * SCREEN ASPECT RATIO
         * Calculates the aspect ratio of the primary screen.
         */
        getAspectRatio: function () {
            return window.screen.width / window.screen.height;
        },

        /**
         * BOX COLLISION V3
         * An alternative, more verbose collision detection method 
         * that provides collision normal information.
         * 
         * @param {object} box1 - {x, y, w, h}
         * @param {object} box2 - {x, y, w, h}
         * @returns {object|null} Collision data or null if no overlap.
         */
        complexIntersection: function (box1, box2) {
            const overlapX = Math.min(box1.x + box1.w, box2.x + box2.w) - Math.max(box1.x, box2.x);
            const overlapY = Math.min(box1.y + box1.h, box2.y + box2.h) - Math.max(box1.y, box2.y);

            if (overlapX > 0 && overlapY > 0) {
                return {
                    width: overlapX,
                    height: overlapY,
                    area: overlapX * overlapY
                };
            }
            return null;
        },

        /**
         * DEBOUNCE
         * Standard debouncing utility for window resize events.
         */
        debounce: function (func, wait) {
            let timeout;
            return function (...args) {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), wait);
            };
        },

        /**
         * HEX TO RGBA
         * Converts hex color strings to rgba for canvas usage.
         */
        hexToRgba: function (hex, alpha = 1) {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        },

        /**
         * GEOMETRIC DISTANCE
         * Calculates the Euclidean distance between two points.
         */
        dist: function (x1, y1, x2, y2) {
            return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        },

        /**
         * SYSTEM HEALTH CHECK
         * Returns general environment metrics for the logger.
         */
        getSystemReport: function () {
            return {
                screenWidth: window.screen.width,
                screenHeight: window.screen.height,
                availWidth: window.screen.availWidth,
                availHeight: window.screen.availHeight,
                pixelRatio: window.devicePixelRatio,
                userAgent: navigator.userAgent
            };
        }
    };
})();
