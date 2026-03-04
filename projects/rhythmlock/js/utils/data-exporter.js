/**
 * RhythmLock - Data Exporter
 * --------------------------
 * Handles the serialization and export of user biometric profiles.
 * Allows users to "backup" their rhythm signature (simulated).
 */

export class DataExporter {
    constructor(storage) {
        this.storage = storage;
    }

    /**
     * exports the current profile to a JSON string.
     * @returns {string|null}
     */
    exportProfile() {
        if (!this.storage.isEnrolled()) {
            console.warn("No profile to export.");
            return null;
        }

        const profileData = {
            version: '1.0',
            algorithm: 'EUCLIDEAN_ZSCORE',
            timestamp: new Date().toISOString(),
            vector: this.storage.profile,
            metadata: {
                threshold: this.storage.engine.threshold,
                sampleCount: this.storage.samples.length
            }
        };

        return JSON.stringify(profileData, null, 2);
    }

    /**
     * Simulates a download of the profile.
     */
    downloadProfile() {
        const json = this.exportProfile();
        if (!json) return;

        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'rhythmlock-profile.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log("Profile downloaded.");
    }
}
