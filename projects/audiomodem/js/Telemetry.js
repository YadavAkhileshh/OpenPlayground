/**
 * Telemetry.js
 * Tracks and logs signal statistics over time for scientific analysis.
 * Provides data for trend visualizations and noise floor calibration.
 * 
 * Part of the AudioModem Project.
 */

class Telemetry {
    constructor() {
        this.records = [];
        this.maxRecords = 200;
        this.startTime = Date.now();

        this.stats = {
            peakSignal: 0,
            noiseFloor: 255,
            avgStrength: 0,
            decodeSuccess: 0,
            decodeFailure: 0,
            totalBitsProcessed: 0
        };

        this.onCalibrationComplete = null;
        this.isCalibrating = false;
        this.calibrationData = [];
    }

    /**
     * Records a single signal data point.
     * @param {Object} data - { strength, frequency, timestamp }
     */
    record(data) {
        const record = {
            ...data,
            relativeTime: Date.now() - this.startTime
        };

        this.records.push(record);
        if (this.records.length > this.maxRecords) {
            this.records.shift();
        }

        // Update global stats
        if (data.strength > this.stats.peakSignal) this.stats.peakSignal = data.strength;

        // Rolling average
        this.stats.avgStrength = (this.stats.avgStrength * 0.9) + (data.strength * 0.1);

        if (this.isCalibrating) {
            this.calibrationData.push(data.strength);
        }
    }

    /**
     * Starts a noise floor calibration phase.
     * @param {number} duration - Seconds to calibrate.
     */
    startCalibration(duration = 3) {
        this.isCalibrating = true;
        this.calibrationData = [];
        console.log("Telemetry: Starting Noise Floor Calibration...");

        setTimeout(() => {
            this.isCalibrating = false;
            this.calculateNoiseFloor();
            if (this.onCalibrationComplete) {
                this.onCalibrationComplete(this.stats.noiseFloor);
            }
        }, duration * 1000);
    }

    /**
     * Calculates the noise floor based on calibration data.
     */
    calculateNoiseFloor() {
        if (this.calibrationData.length === 0) return;

        const sum = this.calibrationData.reduce((a, b) => a + b, 0);
        this.stats.noiseFloor = sum / this.calibrationData.length;
        console.log(`Telemetry: Noise Floor set to ${this.stats.noiseFloor.toFixed(2)}`);
    }

    /**
     * Logs a decode event.
     * @param {boolean} success 
     */
    logDecode(success) {
        if (success) {
            this.stats.decodeSuccess++;
        } else {
            this.stats.decodeFailure++;
        }
    }

    /**
     * Gets formatted status report for the UI.
     * @returns {string}
     */
    getStatusReport() {
        return `
            SIGNAL PEAK: ${this.stats.peakSignal.toFixed(1)}
            NOISE FLOOR: ${this.stats.noiseFloor.toFixed(1)}
            ERROR RATE: ${this.calculateErrorRate()}%
            TOTAL BITS: ${this.stats.totalBitsProcessed}
        `.trim();
    }

    /**
     * Calculates bit error rate.
     */
    calculateErrorRate() {
        const total = this.stats.decodeSuccess + this.stats.decodeFailure;
        if (total === 0) return 0;
        return ((this.stats.decodeFailure / total) * 100).toFixed(2);
    }

    /**
     * Exports telemetry data as JSON.
     */
    exportData() {
        const dataStr = JSON.stringify({
            stats: this.stats,
            history: this.records
        }, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `audiomodem_telemetry_${Date.now()}.json`;
        a.click();
    }
}

window.telemetry = new Telemetry();
