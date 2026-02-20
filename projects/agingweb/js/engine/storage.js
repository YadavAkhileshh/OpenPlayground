/**
 * storage.js
 * Handles persistence of the user's first visit timestamp.
 */

export class StorageEngine {
    constructor() {
        this.KEY_FIRST_VISIT = 'agingweb_first_visit';
        this.KEY_LAST_SEEN = 'agingweb_last_seen';
    }

    /**
     * Initialize or retrieve the first visit timestamp.
     * @returns {number} Timestamp in milliseconds
     */
    getFirstVisitTime() {
        const stored = localStorage.getItem(this.KEY_FIRST_VISIT);
        if (stored) {
            return parseInt(stored, 10);
        }
        const now = Date.now();
        localStorage.setItem(this.KEY_FIRST_VISIT, now.toString());
        return now;
    }

    /**
     * Resets the timeline (Rebirth).
     */
    reset() {
        localStorage.removeItem(this.KEY_FIRST_VISIT);
        location.reload();
    }

    /**
     * Updates the last seen timestamp (heartbeat).
     */
    heartbeat() {
        localStorage.setItem(this.KEY_LAST_SEEN, Date.now().toString());
    }
}
