/**
 * State Management Module
 * 
 * Central store for application state. 
 * Uses a simple subscriber pattern to notify other modules of changes.
 */

class StateManager {
    constructor() {
        this.state = {
            mode: 'webcam', // 'webcam' | 'upload'
            imageSource: null, // HTMLImageElement | HTMLVideoElement
            settings: {
                contrast: 1.0,
                threshold: 128,
                ditherEnabled: true,
                algorithm: 'atkinson',
                scanlineIntensity: 0.1,
                noiseIntensity: 0.1
            },
            status: 'initializing', // 'initializing' | 'ready' | 'error'
            width: 640,
            height: 480
        };

        this.listeners = [];
    }

    /**
     * Updates a specific part of the state and notifies listeners.
     * @param {Object} partialState - Object containing state changes.
     */
    update(partialState) {
        this.state = { ...this.state, ...partialState };
        this.notify();
    }

    /**
     * Updates settings specifically (nested object).
     * @param {Object} partialSettings - New settings values.
     */
    updateSettings(partialSettings) {
        this.state.settings = { ...this.state.settings, ...partialSettings };
        this.notify();
    }

    /**
     * Gets the current state snapshot.
     * @returns {Object} Deep copy of state (simple).
     */
    get() {
        return this.state;
    }

    /**
     * Subscribe to state changes.
     * @param {Function} callback - Function to run on change.
     */
    subscribe(callback) {
        this.listeners.push(callback);
    }

    notify() {
        this.listeners.forEach(listener => listener(this.state));
    }
}

// Export singleton
export const state = new StateManager();
