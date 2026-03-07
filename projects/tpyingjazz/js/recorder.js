/**
 * typing-jazz/js/recorder.js
 * 
 * SESSION RECORDER MODULE
 * 
 * This module tracks and persists musical sessions. It records 
 * timestamps, character inputs, and note frequencies to allow for 
 * accurate playback and performance analysis.
 */

export class Recorder {
    /**
     * Initializes the recorder with an empty buffer.
     */
    constructor() {
        /** @type {Array} Buffer containing session events */
        this.events = [];

        /** @type {number} Start timestamp of the current recording */
        this.startTime = null;

        /** @type {boolean} Recording state flag */
        this.isRecording = false;

        /** @type {boolean} Playback state flag */
        this.isPlaying = false;

        /** @type {number} Timeout ID for scheduled playback events */
        this.playbackTimer = null;
    }

    /**
     * Starts a new recording session.
     */
    start() {
        this.events = [];
        this.startTime = performance.now();
        this.isRecording = true;
        console.log('Recorder: Started recording session.');
    }

    /**
     * Stops the current recording session.
     */
    stop() {
        this.isRecording = false;
        console.log(`Recorder: Stopped. Captured ${this.events.length} events.`);
    }

    /**
     * Logs a musical event to the buffer.
     * @param {string} type Event type ('note' | 'command')
     * @param {Object} data Associated event data
     */
    recordEvent(type, data) {
        if (!this.isRecording) return;

        const timestamp = performance.now() - this.startTime;
        this.events.push({
            timestamp,
            type,
            data
        });
    }

    /**
     * Plays back the recorded session.
     * @param {Function} callback Function to trigger on each event.
     */
    play(callback) {
        if (this.events.length === 0) return;

        this.isPlaying = true;
        this.stopPlayback(); // Ensure no overlapping playbacks

        console.log('Recorder: Starting playback...');

        this.events.forEach(event => {
            this.playbackTimer = setTimeout(() => {
                if (callback) callback(event);

                // If it's the last event, mark as stopped
                if (event === this.events[this.events.length - 1]) {
                    this.isPlaying = false;
                    console.log('Recorder: Playback complete.');
                }
            }, event.timestamp);
        });
    }

    /**
     * Cancels any active playback.
     */
    stopPlayback() {
        if (this.playbackTimer) {
            clearTimeout(this.playbackTimer);
        }
        this.isPlaying = false;
    }

    /**
     * Exports the session as a JSON string.
     * @returns {string} Serialized session data.
     */
    export() {
        const payload = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            eventCount: this.events.length,
            events: this.events
        };
        return JSON.stringify(payload, null, 2);
    }

    /**
     * Loads a session from a JSON string.
     * @param {string} jsonData 
     */
    import(jsonData) {
        try {
            const parsed = JSON.parse(jsonData);
            this.events = parsed.events || [];
            console.log(`Recorder: Imported ${this.events.length} events.`);
        } catch (e) {
            console.error('Recorder: Failed to import session.', e);
        }
    }
}
