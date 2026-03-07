/**
 * StorageBus - The core communication mesh
 * Handles inter-tab communication via localStorage events and mutex locking.
 */
class StorageBus {
    constructor() {
        this.tabId = Math.random().toString(36).substr(2, 9);
        this.prefix = 'localloop_';
        this.listeners = {};

        // Initialize listener
        window.addEventListener('storage', (e) => this._handleStorageEvent(e));

        // Start Heartbeat
        this._startHeartbeat();

        console.log(`[StorageBus] Initialized Tab ID: ${this.tabId}`);
    }

    /**
     * Executes a callback with an exclusive lock if available.
     * @param {Function} callback Async function to run exclusively
     */
    async runExclusive(callback) {
        if ('locks' in navigator) {
            // "localloop_write_lock" is the shared resource name
            return navigator.locks.request('localloop_write_lock', callback);
        } else {
            // Fallback: just run it (race conditions possible but unavoidable without backend)
            return callback();
        }
    }

    /**
     * Writes data to localStorage with a lock to prevent race conditions.
     */
    async emit(event, payload) {
        const key = this.prefix + 'bus';
        const data = {
            event,
            payload,
            timestamp: Date.now(),
            source: this.tabId
        };

        await this.runExclusive(async () => {
            localStorage.setItem(key, JSON.stringify(data));
            // Trigger localized event for current tab (storage event only fires on OTHER tabs)
            this._dispatchLocal(event, payload);
        });
    }

    /**
     * Register an event listener
     */
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    /**
     * Internal handler for storage events
     */
    _handleStorageEvent(e) {
        if (e.key !== this.prefix + 'bus' || !e.newValue) return;

        try {
            const data = JSON.parse(e.newValue);
            // Ignore events from self (redundant safety, mostly for old browsers)
            if (data.source === this.tabId) return;

            if (this.listeners[data.event]) {
                this.listeners[data.event].forEach(cb => cb(data.payload));
            }
        } catch (err) {
            console.error('StorageBus Error:', err);
        }
    }

    /**
     * Dispatches event to listeners in the CURRENT tab
     */
    _dispatchLocal(event, payload) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(cb => cb(payload));
        }
    }

    /**
     * Heartbeat system to track online users
     */
    _startHeartbeat() {
        const update = () => {
            const key = `${this.prefix}heartbeat_${this.tabId}`;
            localStorage.setItem(key, Date.now().toString());
            this._cleanupStalePeers();
        };

        // Initial beat
        update();
        // Beat every 5 seconds
        setInterval(update, 5000);

        // Remove self on close
        window.addEventListener('beforeunload', () => {
            localStorage.removeItem(`${this.prefix}heartbeat_${this.tabId}`);
        });
    }

    /**
     * Count active users (heartbeats within last 10s)
     */
    getActiveUsers() {
        let count = 0;
        const now = Date.now();
        // Snapshot keys to avoid mutation issues during iteration
        const keys = Object.keys(localStorage);

        for (const key of keys) {
            if (key && key.startsWith(`${this.prefix}heartbeat_`)) {
                const lastBeat = parseInt(localStorage.getItem(key));
                if (now - lastBeat < 10000) {
                    count++;
                }
            }
        }
        return count;
    }

    _cleanupStalePeers() {
        // Only the "leader" should ideally clean up, but simpler mesh: everyone tries occasionally
        // or just clean strictly stale ones.
        const now = Date.now();
        const keys = Object.keys(localStorage); // Snapshot keys

        for (const key of keys) {
            if (key && key.startsWith(`${this.prefix}heartbeat_`)) {
                const lastBeat = parseInt(localStorage.getItem(key));
                if (now - lastBeat > 60000) { // 1 minute stale
                    localStorage.removeItem(key);
                }
            }
        }
    }

    /**
     * Clear all chat data (for settings)
     */
    clearData() {
        this.runExclusive(async () => {
            const key = localStorage.getItem(`${this.prefix}encryption_key`);
            const username = localStorage.getItem(`${this.prefix}username`);

            // Filter out localloop items
            Object.keys(localStorage).forEach(k => {
                if (k.startsWith(this.prefix)) localStorage.removeItem(k);
            });

            // Restore key items
            if (key) localStorage.setItem(`${this.prefix}encryption_key`, key);
            if (username) localStorage.setItem(`${this.prefix}username`, username);

            this.emit('chat-cleared', {});
        });
    }
}

window.StorageBus = new StorageBus();
