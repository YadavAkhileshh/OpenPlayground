/**
 * @fileoverview DOM manipulation helper functions.
 * Encapsulates common DOM operations to keep main application code clean.
 */

/**
 * Selects a single element from the DOM.
 * @param {string} selector - CSS selector
 * @param {HTMLElement} [parent=document] - Parent element to search within
 * @returns {HTMLElement|null} Found element or null
 */
export function $(selector, parent = document) {
    return parent.querySelector(selector);
}

/**
 * Selects all matching elements from the DOM.
 * @param {string} selector - CSS selector
 * @param {HTMLElement} [parent=document] - Parent element to search within
 * @returns {HTMLElement[]} Array of found elements
 */
export function $$(selector, parent = document) {
    return Array.from(parent.querySelectorAll(selector));
}

/**
 * Creates an element with given tag, class, and text content.
 * @param {string} tag - HTML tag name
 * @param {string} [className] - CSS class names (space separated)
 * @param {string} [text] - Text content
 * @returns {HTMLElement} The created element
 */
export function createElement(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
}

/**
 * Removes all child nodes from an element.
 * @param {HTMLElement} element - The parent element
 */
export function clearElement(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

/**
 * Sets multiple attributes on an element.
 * @param {HTMLElement} element - Target element
 * @param {Object} attributes - Key-value pairs of attributes
 */
export function setAttributes(element, attributes) {
    for (const key in attributes) {
        element.setAttribute(key, attributes[key]);
    }
}

/**
 * Adds an event listener that triggers only once.
 * @param {HTMLElement} element - Target element
 * @param {string} event - Event name
 * @param {Function} callback - Event handler
 */
export function on(element, event, callback) {
    element.addEventListener(event, callback);
}
