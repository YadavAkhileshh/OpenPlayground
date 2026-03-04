/**
 * Mini Settings Panel - State Management System
 * ---------------------------------------------
 * This module manages the global application state.
 * It implements the Observer pattern to allow UI components to subscribe
 * to state changes without direct coupling.
 */

export class SettingsStore {
    /**
     * Initialize the store with default values.
     * @param {Object} initialState - The starting state of the application.
     */
    constructor(initialState = {}) {
        // The single source of truth
        this._state = {
            // Default System Settings
            theme: 'light',
            language: 'en-US',

            // Feature Toggles (General)
            darkMode: false,
            notifications: true,
            autoUpdate: true,
            locationServices: false,

            // Display Settings
            brightness: 80,
            autoBrightness: true,
            nightShift: false,
            screenTimeout: 300, // seconds

            // Sound Settings
            volume: 60,
            silentMode: false,
            haptics: true,
            systemSounds: true,

            // Privacy
            adTracking: false,
            analyticsShare: true,
            cameraAccess: true,
            micAccess: true,

            // Connectivity
            wifi: true,
            bluetooth: true,
            airplaneMode: false,
            cellularData: true,

            // Personalization
            wallpaper: 'default', // default, ocean, sunset, forest, midnight
            accentColor: 'blue',

            // Storage (Simulated)
            storageUsed: 42.5, // GB
            storageTotal: 128, // GB

            ...initialState
        };

        // Subscriber registry: Map<key, Set<callback>>
        this._subscribers = new Map();

        // Audit log for state changes (Simulated debugging tool)
        this._history = [];

        console.log('[Store] Initialized with state:', this._state);
    }

    /**
     * Get a specific value from the state.
     * @param {string} key - The state key to retrieve.
     * @returns {*} The value of the key.
     */
    get(key) {
        if (!Object.prototype.hasOwnProperty.call(this._state, key)) {
            console.warn(`[Store] Warning: Accessing undefined key '${key}'`);
            return undefined;
        }
        return this._state[key];
    }

    /**
     * Update a state value and notify subscribers.
     * @param {string} key - The key to update.
     * @param {*} value - The new value.
     * @param {string} source - Origin of the change (e.g., 'user', 'system').
     */
    set(key, value, source = 'user') {
        const oldValue = this._state[key];

        // Strict equality check to prevent unnecessary updates
        if (oldValue === value) {
            return false;
        }

        // Validate key existence
        if (!Object.prototype.hasOwnProperty.call(this._state, key)) {
            console.error(`[Store] Error: Cannot set unknown key '${key}'`);
            return false;
        }

        // Validation logic for specific types
        if (typeof oldValue === 'boolean' && typeof value !== 'boolean') {
            console.warn(`[Store] Type Mismatch for '${key}'. Expected boolean, got ${typeof value}. Casting...`);
            value = Boolean(value);
        }

        if (typeof oldValue === 'number') {
            const num = Number(value);
            if (isNaN(num)) {
                console.error(`[Store] Invalid number for '${key}'. Update rejected.`);
                return false;
            }
            value = num;
        }

        // Commit change
        this._state[key] = value;

        // Log to history
        this._addToHistory(key, oldValue, value, source);

        // Notify Listeners
        this._notify(key, value, oldValue);

        // Special case: 'darkMode' updates 'theme' automatically
        if (key === 'darkMode') {
            this.set('theme', value ? 'dark' : 'light', 'system');
        }

        return true;
    }

    /**
     * Subscribe to changes for a specific key.
     * @param {string} key - The state key to watch.
     * @param {Function} callback - Function to call on change (newValue, oldValue).
     * @returns {Function} Unsubscribe function.
     */
    subscribe(key, callback) {
        if (!this._subscribers.has(key)) {
            this._subscribers.set(key, new Set());
        }

        this._subscribers.get(key).add(callback);

        // Return cleanup function
        return () => {
            const subs = this._subscribers.get(key);
            if (subs) {
                subs.delete(callback);
                if (subs.size === 0) {
                    this._subscribers.delete(key);
                }
            }
        };
    }

    /**
     * Subscribe to ANY change in the store.
     * @param {Function} callback 
     */
    subscribeAll(callback) {
        return this.subscribe('*', callback);
    }

    /**
     * Get the entire state object (Copy).
     * @returns {Object} Frozen state copy.
     */
    getState() {
        return Object.freeze({ ...this._state });
    }

    /**
     * Reset state to defaults.
     */
    reset() {
        // Implementation would require storing initial separate from current
        console.log('[Store] Reset requested (Not fully implemented)');
    }

    /* Private Methods */

    _notify(key, newValue, oldValue) {
        // Notify specific subscribers
        if (this._subscribers.has(key)) {
            const subs = this._subscribers.get(key);
            subs.forEach(cb => {
                try {
                    cb(newValue, oldValue);
                } catch (e) {
                    console.error(`[Store] Subscriber error for '${key}':`, e);
                }
            });
        }

        // Notify global subscribers
        if (this._subscribers.has('*')) {
            const globalSubs = this._subscribers.get('*');
            globalSubs.forEach(cb => {
                try {
                    cb(key, newValue, oldValue);
                } catch (e) {
                    console.error(`[Store] Global subscriber error:`, e);
                }
            });
        }
    }

    _addToHistory(key, from, to, source) {
        this._history.push({
            timestamp: Date.now(),
            key,
            from,
            to,
            source
        });

        // Keep history manageable
        if (this._history.length > 100) {
            this._history.shift();
        }
    }
}
