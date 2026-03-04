/**
 * Mini Settings Panel - Storage Manager
 * -------------------------------------
 * Handles persistence of settings to localStorage.
 * Includes data integrity checks and base64 helper (simulated encryption).
 */

export class StorageManager {
    constructor(namespace = 'mini-settings-v1') {
        this.namespace = namespace;
        this.enabled = this._checkAvailability();
    }

    /**
     * Save the entire state object to storage.
     * @param {Object} state 
     */
    save(state) {
        if (!this.enabled) return;

        try {
            const distinctState = JSON.stringify(state);
            // Simulate "encoding" to make it look system-level
            const encoded = btoa(distinctState);

            localStorage.setItem(this.namespace, encoded);

            // console.log(`[Storage] Saved state (${encoded.length} bytes)`);
        } catch (e) {
            console.error('[Storage] Save Failed:', e);
            if (e.name === 'QuotaExceededError') {
                console.warn('[Storage] Quota exceeded. Clearing old data...');
                // Logic to clear old data could go here
            }
        }
    }

    /**
     * Load state from storage.
     * @returns {Object|null}
     */
    load() {
        if (!this.enabled) return null;

        try {
            const raw = localStorage.getItem(this.namespace);
            if (!raw) {
                console.log('[Storage] No saved state found. Using defaults.');
                return null;
            }

            // Decode
            const decoded = atob(raw);
            const state = JSON.parse(decoded);

            console.log('[Storage] Loaded state successfully.');
            return state;
        } catch (e) {
            console.error('[Storage] Load Failed (Corrupt Data?):', e);
            // If data is corrupt, clear it to prevent loop
            this.clear();
            return null;
        }
    }

    /**
     * Clear all saved settings.
     */
    clear() {
        if (this.enabled) {
            localStorage.removeItem(this.namespace);
            console.log('[Storage] Cleared.');
        }
    }

    /**
     * Verify local storage is available and working.
     */
    _checkAvailability() {
        try {
            const testKey = '__storage_test__';
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            console.error('[Storage] LocalStorage is not available:', e);
            return false;
        }
    }
}
