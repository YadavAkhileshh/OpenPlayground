/**
 * LindenArboretum - State Module
 * Holds the current application state.
 */

export const appState = {
    // Current generated string
    commandString: '',

    // Core parameters
    axiom: '',
    rulesText: '',
    depth: 5,
    angle: 25,
    windStrength: 0.5,
    baseHue: 160,

    // Flags
    needsRegeneration: true,
    isAnimating: true,

    // Initial load
    initialized: false
};
