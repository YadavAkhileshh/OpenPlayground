/**
 * BreathingSpace - State Management System
 * 
 * CORE RESPONSIBILITY:
 * The State module acts as the Single Source of Truth for the entire 
 * application. It follows a Redux-lite pattern where property updates 
 * trigger notifications only to registered subscribers.
 * 
 * WHY VANILLA STATE?
 * In small-to-medium interactive projects, a custom Observer pattern 
 * provides all the reactivity needed without the payload weight of 
 * Vue or React. It allows the Rhythm Engine and the UI Controller 
 * to remain decoupled while staying synchronized.
 * 
 * PERSISTENCE:
 * Certain properties (Speed, Depth) are serialized and stored in 
 * localStorage to preserve the user's "Zen" across page reloads.
 */

class AppState {

    /**
     * Initializes the data store and the listener registry.
     */
    constructor() {
        // Registry for observer patterns
        this.listeners = [];

        // --- Central State Object ---
        // We initialize with sensible defaults or loaded values.
        this.data = {
            // High-level rhythm controls
            speedMultiplier: 1.0,
            depthMultiplier: 1.0,

            // Engine status flags
            isPaused: false,
            isInhaling: true,

            // Spatial metrics (Reactive)
            cycleProgress: 0,

            // UI State
            settingsVisible: false,
            currentTheme: 'dark',

            // Diagnostics
            lastTick: Date.now()
        };

        // Self-Initialize
        this.bootFromStorage();

        console.log("%c State Module: Repository established ", "color: #3b82f6; font-weight: bold;");
    }

    /**
     * Loads persisted preferences from the browser's local storage.
     * Uses a try-catch block to handle corrupted or malformed JSON data.
     */
    bootFromStorage() {
        const STORAGE_KEY = 'breathingspace_v1_prefs';
        const rawData = localStorage.getItem(STORAGE_KEY);

        if (!rawData) {
            console.log("State: No previous preferences found. Using defaults.");
            return;
        }

        try {
            const parsed = JSON.parse(rawData);

            // Selective Hydration
            // We only restore values that the user explicitly controlled.
            if (Utils.isNum(parsed.speedMultiplier)) {
                this.data.speedMultiplier = Utils.clamp(parsed.speedMultiplier, CONFIG.MIN_SPEED, CONFIG.MAX_SPEED);
            }

            if (Utils.isNum(parsed.depthMultiplier)) {
                this.data.depthMultiplier = Utils.clamp(parsed.depthMultiplier, 0.1, 3.0);
            }

            console.log("State: Hydrated from localStorage successfully.");
        } catch (error) {
            Utils.logError("State-Storage", "Failed to deserialize preferences: " + error.message);
            // Fallback: Clear storage if it's corrupted
            localStorage.removeItem(STORAGE_KEY);
        }
    }

    /**
     * Performs a state update and broadcast.
     * Use this instead of direct property assignment to ensure reactivity.
     * 
     * @param {string} key - Property name to modify.
     * @param {any} value - The new value to store.
     * @returns {void}
     */
    set(key, value) {
        // Optimization: Do not notify if the value hasn't actually changed.
        if (this.data[key] === value) return;

        // Trace logging for debug builds (Enabled selectively)
        // console.debug(`State Change: ${key} ->`, value);

        this.data[key] = value;

        // Broadcast change to all subscribed observers.
        this.broadcast(key, value);

        // Conditional Persistence
        // We only save state when the specific rhythm controls change.
        if (key === 'speedMultiplier' || key === 'depthMultiplier') {
            this.syncToDisk();
        }
    }

    /**
     * Retrieval helper.
     * 
     * @param {string} key 
     * @returns {any}
     */
    get(key) {
        return this.data[key];
    }

    /**
     * Register an Observer (Listener).
     * 
     * @param {Function} callback - Should accept (property, value).
     */
    subscribe(callback) {
        if (typeof callback !== 'function') {
            Utils.logError("State", "Subscriber must be a function.");
            return;
        }
        this.listeners.push(callback);
    }

    /**
     * Internal broadcast mechanism.
     */
    broadcast(key, value) {
        this.listeners.forEach(handler => {
            try {
                handler(key, value);
            } catch (err) {
                Utils.logError("State-Broadcast", "Listener execution failed: " + err.message);
            }
        });
    }

    /**
     * Serialization logic for LocalStorage.
     */
    syncToDisk() {
        const STORAGE_KEY = 'breathingspace_v1_prefs';

        const payload = {
            speedMultiplier: this.data.speedMultiplier,
            depthMultiplier: this.data.depthMultiplier,
            timestamp: Date.now()
        };

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        } catch (e) {
            Utils.logError("State-Sync", "Storage limit reached or permission denied.");
        }
    }

    /**
     * Formats the current state as a human-readable diagnostic object.
     * @returns {Object}
     */
    getSnapshot() {
        return { ...this.data };
    }
}

/**
 * Global State Instance (Singleton)
 * Established early in the lifecycle so it's available to all modules.
 */
const state = new AppState();

// Seal the data structure to prevent ad-hoc property injection.
// This forces developers to use the .set() and .get() methods.
Object.seal(state.data);
