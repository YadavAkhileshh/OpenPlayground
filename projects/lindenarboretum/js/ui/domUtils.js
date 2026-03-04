/**
 * LindenArboretum - DOM Utilities Module
 * Safe wrappers around document.getElementById/querySelector.
 */

export const domUtils = {
    /**
     * Gets element by ID with a console warning if missing.
     * @param {string} id 
     * @returns {HTMLElement|null}
     */
    get(id) {
        const el = document.getElementById(id);
        if (!el) {
            console.warn(`[DOM] Element missing: #${id}`);
        }
        return el;
    },

    /**
     * Toggles a CSS class safely.
     * @param {HTMLElement} element 
     * @param {string} className 
     * @param {boolean} force 
     */
    toggleClass(element, className, force) {
        if (!element) return;
        element.classList.toggle(className, force);
    },

    /**
     * Hides an element.
     * @param {HTMLElement} element 
     */
    hide(element) {
        if (element) {
            element.style.display = 'none';
        }
    },

    /**
     * Shows an element.
     * @param {HTMLElement} element 
     * @param {string} displayType 
     */
    show(element, displayType = 'block') {
        if (element) {
            element.style.display = displayType;
        }
    }
};
