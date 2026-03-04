/**
 * @file settings.js
 * @description Manages application-wide configuration and user preferences.
 * Implements the Observer pattern to notify components of changes.
 */

export class Settings {
    constructor() {
        // Default Configuration
        this.config = {
            // General
            debugMode: false,

            // Rendering
            resolutionScale: 1.0,
            antialiasing: true,

            // Camera (Projection)
            cameraScale: 150.0,
            cameraWDistance: 2.0,
            cameraZOffset: 3.0,

            // Animation
            autoRotate: true,
            baseRotationSpeed: 0.005,
            rotationDamping: 0.95,
            maxRotationSpeed: 0.1,
            doubleRotation: false,

            // Visuals
            colors: {
                primary: '#00f3ff', // Cyan
                secondary: '#ff0055', // Magenta
                background: '#050508',
                vertex: '#ffffff',
                edgeAlpha: 1.0,
                trailAlpha: 0.2
            },

            // Geometry
            vertexRadius: 3,
            lineWidth: 1.5,
            showVertices: true,
            showEdges: true,
            showTrails: true,
            maxTrails: 50
        };

        this.listeners = [];
    }

    /**
     * Retrieves a setting value by key.
     * @param {string} key - The configuration key
     * @returns {*} The value
     */
    get(key) {
        return this.config[key];
    }

    /**
     * Updates a setting and notifies listeners.
     * @param {string} key - The configuration key
     * @param {*} value - The new value
     */
    set(key, value) {
        if (this.config.hasOwnProperty(key)) {
            const oldValue = this.config[key];
            this.config[key] = value;

            // Notify listeners if value changed
            if (oldValue !== value) {
                this.notify(key, value);
            }
        } else {
            console.warn(`Settings: Key '${key}' not found in configuration.`);
        }
    }

    /**
     * Subscribe to changes.
     * @param {Function} callback - Function to call on change (key, value)
     */
    subscribe(callback) {
        this.listeners.push(callback);
    }

    /**
     * Notify all listeners of a change.
     * @param {string} key 
     * @param {*} value 
     */
    notify(key, value) {
        for (const callback of this.listeners) {
            callback(key, value);
        }
    }

    /**
     * Resets all settings to defaults.
     */
    reset() {
        // Re-initialize config (simplified for now)
        // In a real app, we'd keep a copy of defaults.
        this.set('cameraScale', 150.0);
        this.set('cameraWDistance', 2.0);
        this.set('baseRotationSpeed', 0.005);
        this.set('angleXY', 0);
        // ... (expand as needed)
    }

    /**
     * Export settings to JSON.
     */
    export() {
        return JSON.stringify(this.config, null, 2);
    }
}

// Singleton Instance
export const settings = new Settings();
