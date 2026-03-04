/**
 * DOMUtils.js
 * Helper functions for DOM manipulation and element creation.
 */

export const DOMUtils = {
    /**
     * Create an element with class and optional text
     * @param {string} tag - HTML tag name
     * @param {string} className - CSS class
     * @param {string} [text] - Text content
     * @returns {HTMLElement}
     */
    create(tag, className, text = null) {
        const el = document.createElement(tag);
        if (className) el.className = className;
        if (text) el.textContent = text;
        return el;
    },

    /**
     * Create a flex container
     * @param {string} direction - 'row' or 'column'
     * @returns {HTMLElement}
     */
    createFlex(direction = 'row') {
        const el = document.createElement('div');
        el.style.display = 'flex';
        el.style.flexDirection = direction;
        return el;
    },

    /**
     * Set multiple styles on an element
     * @param {HTMLElement} el 
     * @param {Object} styles 
     */
    setStyles(el, styles) {
        Object.assign(el.style, styles);
    }
};
