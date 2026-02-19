/**
 * Configuration Manager.
 * Saves and loads user settings from localStorage.
 * Ensures that user preferences persist across sessions.
 */
export class ConfigManager {
    constructor() {
        this.storageKey = 'geneticforger_config_v1';
        this.defaultConfig = {
            mutationRate: 50,
            vertexShift: 30,
            colorShift: 30
        };
    }

    /**
     * Loads configuration from local storage.
     * @returns {Object} The configuration object.
     */
    load() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            try {
                return { ...this.defaultConfig, ...JSON.parse(stored) };
            } catch (e) {
                console.error('Failed to parse config', e);
                return this.defaultConfig;
            }
        }
        return this.defaultConfig;
    }

    /**
     * Saves configuration to local storage.
     * @param {Object} config - The configuration to save.
     */
    save(config) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(config));
        } catch (e) {
            console.error('Failed to save config', e);
        }
    }
}
