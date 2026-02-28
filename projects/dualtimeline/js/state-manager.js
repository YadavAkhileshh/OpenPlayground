const STORAGE_KEY = 'dualtimeline_preferences';

class StateManager {
    constructor() {
        this.prefs = this.loadFromStorage();
    }

    getDefaults() {
        return {
            volume: 0.8,
            muted: false,
            playbackRate: 1.0,
            lastPosition: 0,
            theme: 'cinematic-dark',
            showLatency: false,
            highPerformanceMode: true,
            userMarkers: []
        };
    }

    /**
     * Load preferences from localStorage with fallback
     */
    loadFromStorage() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (!data) return this.getDefaults();

            const saved = JSON.parse(data);
            return { ...this.getDefaults(), ...saved };
        } catch (e) {
            logger.warn('Failed to load storage, using defaults');
            return this.getDefaults();
        }
    }

    /**
     * Persist current preferences to localStorage
     */
    saveToStorage() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.prefs));
            logger.debug('Preferences saved');
        } catch (e) {
            logger.error('Failed to save preferences');
        }
    }

    /**
     * Update a specific preference key
     */
    set(key, value) {
        if (this.prefs[key] === value) return;

        this.prefs[key] = value;
        this.saveToStorage();

        // Dispatch local event for internal components
        window.dispatchEvent(new CustomEvent('dt:pref_change', {
            detail: { key, value }
        }));
    }

    /**
     * Retrieve a preference value
     */
    get(key) {
        return this.prefs[key];
    }

    /**
     * Marker management logic
     */
    addMarker(time, label = 'unnamed-marker') {
        const marker = {
            id: Date.now(),
            time,
            label,
            createdAt: new Date().toISOString()
        };

        this.prefs.userMarkers.push(marker);
        this.saveToStorage();

        window.dispatchEvent(new CustomEvent('dt:marker_added', { detail: marker }));
        return marker;
    }

    /**
     * Remove a marker by ID
     */
    removeMarker(id) {
        const index = this.prefs.userMarkers.findIndex(m => m.id === id);
        if (index !== -1) {
            const removed = this.prefs.userMarkers.splice(index, 1)[0];
            this.saveToStorage();
            window.dispatchEvent(new CustomEvent('dt:marker_removed', { detail: removed }));
            return true;
        }
        return false;
    }

    /**
     * Reset all settings to factory defaults
     */
    reset() {
        this.prefs = this.getDefaults();
        this.saveToStorage();
        window.location.reload();
    }

    /**
     * Session statistics tracking
     * (Useful for measuring system stability in distributed mode)
     */
    trackSessionMetric(name, value) {
        const sessionKey = 'dualtimeline_session_stats';
        try {
            const statsStr = sessionStorage.getItem(sessionKey) || '{}';
            const stats = JSON.parse(statsStr);

            if (!stats[name]) stats[name] = [];
            stats[name].push({ t: Date.now(), v: value });

            // Keep only last 50 entries
            if (stats[name].length > 50) stats[name].shift();

            sessionStorage.setItem(sessionKey, JSON.stringify(stats));
        } catch (e) {
            // Silently ignore session storage failures
        }
    }
}

// Singleton export
export const stateManager = new StateManager();
