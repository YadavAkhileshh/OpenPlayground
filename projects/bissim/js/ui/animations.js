/**
 * @fileoverview Animation Controller.
 * Manages complex transition sequences and visual effects.
 */

import { $ } from '../utils/dom.js';

export class AnimationController {

    /**
     * Plays the "Selection Made" animation sequence.
     * @returns {Promise} Resolves when animation completes
     */
    async playRevealSequence() {
        const grid = $('#product-grid');

        // 1. Fade out grid
        grid.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
        grid.style.opacity = '0';
        grid.style.transform = 'scale(0.95)';

        // Wait for fade out
        await this.wait(500);

        // 2. Show Overlay
        const overlay = $('#reveal-overlay');
        overlay.classList.remove('hidden');

        // Force reflow
        void overlay.offsetWidth;

        overlay.classList.add('visible');

        // Wait for overlay slide-in
        await this.wait(600);

        return true;
    }

    /**
     * Triggers a "shake" effect on an element (e.g. invalid action).
     * @param {HTMLElement} element 
     */
    shake(element) {
        element.classList.add('animate-shake');
        setTimeout(() => element.classList.remove('animate-shake'), 400);
    }

    /**
     * Helper to wait ms.
     * @param {number} ms 
     */
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export const animator = new AnimationController();
