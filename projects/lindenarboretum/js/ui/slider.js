/**
 * LindenArboretum - Slider UI Module
 * Binds HTML range inputs to span display outputs and handles their state.
 */

import { domUtils } from './domUtils.js';

export class SliderBindings {
    constructor() {
        this.sliders = new Map();
    }

    /**
     * Binds an input[type="range"] to a text display span element.
     * @param {string} inputId 
     * @param {string} displayId 
     * @param {string} suffix (e.g. '°' for degrees)
     * @param {Function} onChangeCallback
     */
    bind(inputId, displayId, suffix = '', onChangeCallback = null) {
        const inputEl = domUtils.get(inputId);
        const displayEl = domUtils.get(displayId);

        if (!inputEl) return;

        const updateDisplay = () => {
            if (displayEl) {
                displayEl.textContent = inputEl.value + suffix;
            }
        };

        // Initial setup
        updateDisplay();

        // Event listener for real-time drag
        inputEl.addEventListener('input', (e) => {
            updateDisplay();
            if (onChangeCallback) {
                // True -> tells callback it's a real-time drag
                onChangeCallback(parseFloat(inputEl.value), true);
            }
        });

        // Event listener for drop/finish
        inputEl.addEventListener('change', (e) => {
            if (onChangeCallback) {
                // False -> tells callback the drag is finished (trigger heavy regen)
                onChangeCallback(parseFloat(inputEl.value), false);
            }
        });

        this.sliders.set(inputId, { inputEl, displayEl, suffix, updateDisplay });
    }

    /**
     * Programmatically sets a slider value and triggers UI update.
     */
    setValue(inputId, value) {
        if (!this.sliders.has(inputId)) return;

        const slider = this.sliders.get(inputId);
        slider.inputEl.value = value;
        slider.updateDisplay();
    }

    getValue(inputId) {
        if (!this.sliders.has(inputId)) return 0;
        return parseFloat(this.sliders.get(inputId).inputEl.value);
    }
}

export const sliderManager = new SliderBindings();
