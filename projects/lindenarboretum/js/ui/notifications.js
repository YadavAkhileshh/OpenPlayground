/**
 * LindenArboretum - Notifications Module
 * Handles displaying toast errors when rules are malformed or execution limit hit.
 */

import { domUtils } from './domUtils.js';

export const notifications = {
    areaEl: null,
    textEl: null,
    timeoutId: null,

    init() {
        this.areaEl = domUtils.get('notification-area');
        this.textEl = domUtils.get('notice-text');
    },

    /**
     * Shows an error message temporarily.
     * @param {string} message 
     * @param {number} durationMs 
     */
    showError(message, durationMs = 4000) {
        if (!this.areaEl || !this.textEl) return;

        this.textEl.textContent = message;
        this.areaEl.classList.remove('notice-hidden');
        this.textEl.classList.add('glitch-active');

        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }

        this.timeoutId = setTimeout(() => {
            this.hide();
            this.textEl.classList.remove('glitch-active');
        }, durationMs);
    },

    hide() {
        if (this.areaEl) {
            this.areaEl.classList.add('notice-hidden');
        }
    }
};
