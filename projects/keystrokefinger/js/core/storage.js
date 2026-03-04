/**
 * KeystrokeFingerprint - StorageManager
 * Manages local persistence of user biometric profiles.
 */

export class StorageManager {
    static STORAGE_KEY = 'ksf_profiles';

    constructor() {
        this.profiles = this.loadProfiles();
    }

    /**
     * Loads profiles from LocalStorage.
     * @returns {Object} Map of username -> ProfileData
     */
    loadProfiles() {
        const raw = localStorage.getItem(StorageManager.STORAGE_KEY);
        if (!raw) return {};
        try {
            return JSON.parse(raw);
        } catch (e) {
            console.error("Failed to parse profiles", e);
            return {};
        }
    }

    /**
     * Saves the current state of profiles.
     */
    saveProfiles() {
        localStorage.setItem(StorageManager.STORAGE_KEY, JSON.stringify(this.profiles));
    }

    /**
     * Saves a new enrollment for a user.
     * @param {string} username 
     * @param {string} text - The input text (passphrase)
     * @param {Object} vector - The calculated mean vector
     */
    saveProfile(username, text, vector) {
        if (!this.profiles[username]) {
            this.profiles[username] = {
                samples: [],
                masterProfile: null
            };
        }

        // We ensure we only verify against the same text
        this.profiles[username] = {
            text: text,
            vector: vector,
            updated: Date.now()
        };

        this.saveProfiles();
        return true;
    }

    /**
     * Retrieves a user's profile.
     * @param {string} username 
     * @returns {Object|null}
     */
    getProfile(username) {
        return this.profiles[username] || null;
    }

    /**
     * Checks if a user exists.
     * @param {string} username 
     */
    userExists(username) {
        return !!this.profiles[username];
    }

    /**
     * Clears all data.
     */
    clearAll() {
        this.profiles = {};
        localStorage.removeItem(StorageManager.STORAGE_KEY);
    }
}
