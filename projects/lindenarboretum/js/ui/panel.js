/**
 * LindenArboretum - Panel Visibility Module
 * Handles collapsing/expanding or hiding the side panels 
 * when the user wants a clean screenshot or fullscreen view.
 */

import { domUtils } from './domUtils.js';

export const panelManager = {
    panelsVisible: true,

    /**
     * Toggles visibility of all major UI panels.
     */
    togglePanels() {
        this.panelsVisible = !this.panelsVisible;

        const container = domUtils.get('ui-layer');
        if (!container) return;

        if (this.panelsVisible) {
            container.style.opacity = '1';
            container.style.pointerEvents = 'none'; // Background let clicks through
        } else {
            container.style.opacity = '0';
            container.style.pointerEvents = 'none';
        }
    },

    // Keyboard shortcut hook
    bindShortcuts() {
        window.addEventListener('keydown', (e) => {
            // H key toggles HUD
            if (e.key.toLowerCase() === 'h' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                this.togglePanels();
            }
        });
    }
};
