/**
 * AppState - Maintains global state and configuration for NoiseTV.
 * Expanded to support 10+ new features and settings.
 */
export const AppState = {
    // Basic Power/Tuning
    isPoweredOn: false,
    isWarmingUp: false,
    tuning: 0.5, // 0 to 1
    frequency: 88.0, // MHz
    signalStrength: 0, // 0 to 1

    // Core Settings
    settings: {
        theme: 'green',        // green, amber, blue, bw
        noiseType: 'white',    // white, pink, brownian
        brightness: 1.0,       // 0 to 2
        contrast: 1.2,         // 0 to 2
        hHold: 0,              // Horizontal shift/shiver
        vHold: 0,              // Vertical roll
        ghosting: 0.4,         // Screen persistence/trails
        scanlineIntensity: 0.3,
        audioDrift: 0.1,       // LFO modulation intensity
        isAutoScanning: false
    },

    // Constants
    FREQ_MIN: 88.0,
    FREQ_MAX: 108.0,

    // Stations Database
    stations: [
        { freq: 89.5, name: "ETHEREAL VOID", meta: "TRANSMISSION: ALPHA" },
        { freq: 94.2, name: "RETRO DATA", meta: "BAUD: 9600" },
        { freq: 98.1, name: "GHOST STATION", meta: "???" },
        { freq: 101.7, name: "DEEP PULSE", meta: "HEARTBEAT" },
        { freq: 105.5, name: "HIGH WHISTLE", meta: "ALTITUDE: 30k" },
        { freq: 107.9, name: "STATIC ECHO", meta: "LAST BROADCAST" }
    ],

    updateTuning(value) {
        this.tuning = Math.max(0, Math.min(1, value));
        this.frequency = this.FREQ_MIN + (this.tuning * (this.FREQ_MAX - this.FREQ_MIN));
        this.updateSignalStatus();
    },

    updateSignalStatus() {
        // Find nearest station
        const nearest = this.getNearestStation();
        const dist = Math.abs(this.frequency - nearest.freq);
        this.signalStrength = Math.max(0, 1 - (dist / 0.8));
    },

    getNearestStation() {
        return this.stations.reduce((prev, curr) => {
            const prevDist = Math.abs(this.frequency - prev.freq);
            const currDist = Math.abs(this.frequency - curr.freq);
            return (currDist < prevDist) ? curr : prev;
        });
    },

    setPower(state) {
        this.isPoweredOn = state;
        if (!state) this.settings.isAutoScanning = false;
    },

    updateSetting(key, value) {
        if (this.settings.hasOwnProperty(key)) {
            this.settings[key] = value;
            return true;
        }
        return false;
    },

    getFrequencyString() {
        return this.frequency.toFixed(1);
    }
};
