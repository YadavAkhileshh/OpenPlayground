/**
 * dom.js
 * Helpers for DOM manipulation safely, especially during chaos.
 */

export function qs(selector, scope = document) {
    return scope.querySelector(selector);
}

export function qsa(selector, scope = document) {
    return Array.from(scope.querySelectorAll(selector));
}

/**
 * Wraps content of an element in a span with a class.
 * @param {HTMLElement} element 
 * @param {string} className 
 */
export function wrapContent(element, className) {
    const wrapper = document.createElement('span');
    wrapper.className = className;
    while (element.firstChild) {
        wrapper.appendChild(element.firstChild);
    }
    element.appendChild(wrapper);
}

/**
 * Injects a style rule dynamically.
 * @param {string} rule 
 */
export function injectStyle(rule) {
    const sheet = document.styleSheets[0];
    sheet.insertRule(rule, sheet.cssRules.length);
}

/**
 * Checks if element is in viewport.
 * @param {HTMLElement} el 
 * @returns {boolean}
 */
export function isInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}
