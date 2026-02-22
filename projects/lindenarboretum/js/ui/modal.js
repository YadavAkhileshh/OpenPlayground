/**
 * LindenArboretum - Modal Component
 * Triggers popups (like Help or About screens).
 */

import { domUtils } from './domUtils.js';

export const modalManager = {
    modalEl: null,

    init(modalId, triggerId, closeBtnId) {
        this.modalEl = domUtils.get(modalId);
        const trigger = domUtils.get(triggerId);
        const closeBtn = domUtils.get(closeBtnId);

        if (trigger) {
            trigger.addEventListener('click', () => this.show());
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hide());
        }

        // Click outside to close
        if (this.modalEl) {
            this.modalEl.addEventListener('click', (e) => {
                if (e.target === this.modalEl) {
                    this.hide();
                }
            });
        }
    },

    show() {
        if (this.modalEl) {
            this.modalEl.classList.remove('hidden');
        }
    },

    hide() {
        if (this.modalEl) {
            this.modalEl.classList.add('hidden');
        }
    }
};
