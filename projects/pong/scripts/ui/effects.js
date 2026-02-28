/**
 * @file effects.js
 * @description Specialized UI effects for the WindowPong terminal.
 * This module provides high-fidelity text animations, such as the 
 * CRT-style typing effect and holographic flickering.
 * 
 * DESIGN RATIONALE:
 * To maintain the "Terminal" immersion, status messages should not 
 * simply appear. They should be typed out character by character,
 * echoing the processing speed of an 80s computer system.
 */

const PongEffects = (function () {
    /**
     * Internal state to track active typing timers.
     */
    let activeTypeTimer = null;

    /**
     * TYPING EFFECT
     * Gradually reveals text character by character.
     * 
     * @param {HTMLElement} element - The target UI element.
     * @param {string} text - The full string to display.
     * @param {number} speed - Milliseconds per character.
     */
    function typeText(element, text, speed = 30) {
        if (activeTypeTimer) {
            clearInterval(activeTypeTimer);
        }

        element.innerText = '';
        let index = 0;

        activeTypeTimer = setInterval(() => {
            if (index < text.length) {
                element.innerText += text.charAt(index);
                index++;

                // Add a random mechanical variation to typing speed
                if (Math.random() > 0.9) {
                    clearInterval(activeTypeTimer);
                    setTimeout(() => typeTextResume(element, text, index, speed), 100);
                }
            } else {
                clearInterval(activeTypeTimer);
                activeTypeTimer = null;
            }
        }, speed);
    }

    /**
     * Resumes typing after a mechanical pause.
     */
    function typeTextResume(element, text, index, speed) {
        activeTypeTimer = setInterval(() => {
            if (index < text.length) {
                element.innerText += text.charAt(index);
                index++;
            } else {
                clearInterval(activeTypeTimer);
                activeTypeTimer = null;
            }
        }, speed);
    }

    return {
        /**
         * Public wrapper for the typing effect.
         * @param {string} id - Element ID.
         * @param {string} text - Content.
         */
        type: function (id, text) {
            const el = document.getElementById(id);
            if (el) typeText(el, text);
        },

        /**
         * HOLOGRAPHIC FLICKER
         * Makes an element momentarily transparent to simulate signal loss.
         */
        flicker: function (id, duration = 200) {
            const el = document.getElementById(id);
            if (!el) return;

            el.style.opacity = '0.3';
            setTimeout(() => {
                el.style.opacity = '1';
            }, duration);
        },

        /**
         * SCREEN SHAKE (INTERNAL)
         * Vibrates the terminal panel during impact.
         */
        shake: function (id) {
            const el = document.getElementById(id);
            if (!el) return;

            el.style.transform = `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)`;
            setTimeout(() => {
                el.style.transform = 'translate(0,0)';
            }, 50);
        }
    };
})();
