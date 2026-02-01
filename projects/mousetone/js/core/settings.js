/**
 * File: settings.js
 * MouseTone Module
 * Copyright (c) 2026
 */
/**
 * Handles user preferences and persistence.
 * Saves settings to localStorage to remember user choices between sessions.
 * Manages global flags like 'highContrast'.
 */
export class Settings {
    constructor() {
        /**
         * Default preferences.
         * @property {number} volume - Master volume (0.0 to 1.0).
         * @property {number} sensitivity - Input sensitivity scalar.
         * @property {boolean} highContrast - Accessibility mode flag.
         * @property {boolean} showOverlay - Whether to show the instructional overlay.
         */
        this.preferences = {
            volume: 0.7,
            sensitivity: 1.0,
            highContrast: false,
            showOverlay: true
        };
        this.load();
    }

    /**
     * Loads preferences from localStorage using the key 'mousetone_prefs'.
     * Merges found settings with defaults to ensure schema compatibility.
     */
    load() {
        const stored = localStorage.getItem('mousetone_prefs');
        if (stored) {
            this.preferences = { ...this.preferences, ...JSON.parse(stored) };
        }
    }

    save() {
        localStorage.setItem('mousetone_prefs', JSON.stringify(this.preferences));
        this.apply();
    }

    get(key) {
        return this.preferences[key];
    }

    set(key, value) {
        this.preferences[key] = value;
        this.save();
    }

    toggle(key) {
        this.preferences[key] = !this.preferences[key];
        this.save();
    }

    apply() {
        if (this.preferences.highContrast) {
            document.documentElement.classList.add('high-contrast');
        } else {
            document.documentElement.classList.remove('high-contrast');
        }
    }
}

export const settings = new Settings();
