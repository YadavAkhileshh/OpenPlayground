/**
 * @file utils.js
 * @description Common utility functions for the StegPlay application.
 * 
 * Provides centralized helper methods to avoid code duplication and 
 * improve maintainability across the steganography and UI layers.
 */

const Utils = {
    /**
     * Debounces a function call.
     * @param {Function} func - The function to debounce.
     * @param {number} wait - Wait time in ms.
     * @returns {Function}
     */
    debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    },

    /**
     * Generates a unique ID (random string).
     * @param {number} length - ID length.
     * @returns {string}
     */
    generateId(length = 8) {
        return Math.random().toString(36).substring(2, 2 + length);
    },

    /**
     * Safe DOM selector that logs warning if element is missing.
     * @param {string} selector - CSS selector.
     * @returns {Element|null}
     */
    qs(selector) {
        const el = document.querySelector(selector);
        if (!el) {
            console.warn(`Utils: Element not found for selector "${selector}"`);
        }
        return el;
    },

    /**
     * Safe multi-selector.
     * @param {string} selector - CSS selector.
     * @returns {NodeList}
     */
    qsa(selector) {
        return document.querySelectorAll(selector);
    },

    /**
     * Formats a byte count into human readable string.
     * @param {number} bytes - Byte count.
     * @returns {string}
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    /**
     * Copies text to clipboard.
     * @param {string} text - Text to copy.
     * @returns {Promise<boolean>}
     */
    async copyToClipboard(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // Fallback for non-secure contexts
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-9999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                return successful;
            }
        } catch (err) {
            console.error('Utils: Clipboard copy failed', err);
            return false;
        }
    },

    /**
     * Validates if a string is valid ASCII.
     * @param {string} str - String to check.
     * @returns {boolean}
     */
    isASCII(str) {
        return /^[\x00-\x7F]*$/.test(str);
    },

    /**
     * Escapes HTML special characters.
     * @param {string} unsafe - Raw string.
     * @returns {string}
     */
    escapeHTML(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
};

window.Utils = Utils;
