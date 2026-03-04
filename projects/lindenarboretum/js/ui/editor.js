/**
 * LindenArboretum - Editor UI Module
 * Handles the text inputs for Axiom and Rules.
 */

import { domUtils } from './domUtils.js';

export const editorUI = {
    axiomInput: null,
    rulesInput: null,
    presetSelector: null,

    init(onPresetChangeCallback) {
        this.axiomInput = domUtils.get('axiom-input');
        this.rulesInput = domUtils.get('rules-input');
        this.presetSelector = domUtils.get('preset-selector');

        if (this.presetSelector) {
            this.presetSelector.addEventListener('change', (e) => {
                onPresetChangeCallback(e.target.value);
            });
        }
    },

    /**
     * Gets current text values.
     */
    getValues() {
        return {
            axiom: this.axiomInput.value,
            rules: this.rulesInput.value
        };
    },

    /**
     * Programmatically sets the UI values (e.g., when a preset loads).
     * @param {string} axiom 
     * @param {string} rules 
     */
    setValues(axiom, rules) {
        this.axiomInput.value = axiom;
        this.rulesInput.value = rules;
        this._pulseEffect(this.axiomInput);
        this._pulseEffect(this.rulesInput);
    },

    /**
     * Brief visual flash to show data changed.
     */
    _pulseEffect(element) {
        element.style.borderColor = 'var(--color-primary-bright)';
        setTimeout(() => {
            element.style.borderColor = '';
        }, 300);
    }
};
