/**
 * @fileoverview Animation system for PetRock.
 * Manages the application and removal of CSS animation classes.
 * @module Animation
 */

/**
 * Applies a specific animation class to an element and removes it after completion.
 * @param {HTMLElement} element - The DOM element to animate.
 * @param {string} className - The CSS class defining the animation.
 * @param {number} duration - Duration in milliseconds before removing the class.
 */
export function playAnimation(element, className, duration = 600) {
    if (!element) return;

    // Remove existing if any to restart
    element.classList.remove(className);

    // Force reflow
    void element.offsetWidth;

    element.classList.add(className);

    setTimeout(() => {
        element.classList.remove(className);
    }, duration);
}

/**
 * Triggers a complex facial expression on the rock.
 * @param {HTMLElement} rockElement - The rock element.
 * @param {string} expression - 'happy', 'surprised', 'squint', etc.
 * @param {number} duration - How long to hold the expression.
 */
export function triggerFacialExpression(rockElement, expression, duration = 1500) {
    if (!rockElement) return;

    const className = `eye-${expression}`;
    rockElement.classList.add(className);

    setTimeout(() => {
        rockElement.classList.remove(className);
    }, duration);
}

/**
 * Triggers a random blink animation on the rock's eyes.
 * @param {HTMLElement} rockElement - The main rock container.
 */
export function setupBlinking(rockElement) {
    const minDelay = 2000;
    const maxDelay = 8000;

    function scheduleNextBlink() {
        const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;

        setTimeout(() => {
            playAnimation(rockElement, 'blink', 150);
            scheduleNextBlink();
        }, delay);
    }

    scheduleNextBlink();
}

/**
 * Spawns a floating status message at a specific position.
 * @param {string} text - The humorous message to display.
 * @param {number} x - X coordinate.
 * @param {number} y - Y coordinate.
 */
export function spawnFloatingText(text, x, y) {
    const el = document.createElement('div');
    el.className = 'status-float';
    el.textContent = text;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;

    document.body.appendChild(el);

    setTimeout(() => {
        el.remove();
    }, 2000);
}
