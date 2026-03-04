/**
 * ============================================
 * VIBRATION COMPOSER - SEQUENCER
 * Timeline Logic & Pattern Management
 * ============================================
 */

class Sequencer {
    constructor(vibrationEngine) {
        this.engine = vibrationEngine;

        // Timeline configuration
        this.beatsPerMeasure = 16;
        this.trackCount = 4;

        // Playback state
        this.isPlaying = false;
        this.isLooping = true;
        this.currentBeat = 0;
        this.tempo = 120; // BPM

        // Timeline data
        this.tracks = this.initializeTracks();

        // Timing
        this.beatDuration = this.calculateBeatDuration();
        this.playbackInterval = null;
        this.playbackStartTime = 0;
        this.nextBeatTime = 0;

        // Callbacks
        this.onBeatCallback = null;
        this.onPlayStateChangeCallback = null;
        this.onLoopCallback = null;

        // Scheduling
        this.scheduleAheadTime = 100; // ms to schedule ahead
        this.timerWorker = null;
    }

    /**
     * Initialize empty tracks
     * @returns {Array} Array of track objects
     */
    initializeTracks() {
        const tracks = [];
        for (let i = 0; i < this.trackCount; i++) {
            tracks.push({
                id: i,
                beats: new Map() // position -> {intensity}
            });
        }
        return tracks;
    }

    /**
     * Calculate beat duration in milliseconds from BPM
     * @returns {number} Beat duration in ms
     */
    calculateBeatDuration() {
        // 60000 ms per minute / BPM = ms per beat
        return 60000 / this.tempo;
    }

    /**
     * Set tempo (BPM)
     * @param {number} bpm - Beats per minute
     */
    setTempo(bpm) {
        this.tempo = Math.max(60, Math.min(180, bpm));
        this.beatDuration = this.calculateBeatDuration();

        // If playing, restart with new tempo
        if (this.isPlaying) {
            this.stop();
            this.play();
        }
    }

    /**
     * Get current tempo
     * @returns {number} Current BPM
     */
    getTempo() {
        return this.tempo;
    }

    /**
     * Toggle loop mode
     */
    toggleLoop() {
        this.isLooping = !this.isLooping;
        return this.isLooping;
    }

    /**
     * Set loop mode
     * @param {boolean} enabled - Enable looping
     */
    setLoop(enabled) {
        this.isLooping = enabled;
    }

    /**
     * Add or update a beat
     * @param {number} trackId - Track index
     * @param {number} position - Beat position (0-15)
     * @param {number} intensity - Intensity value (0-1)
     */
    addBeat(trackId, position, intensity = 0.8) {
        if (trackId < 0 || trackId >= this.trackCount) {
            console.error('Invalid track ID:', trackId);
            return;
        }

        if (position < 0 || position >= this.beatsPerMeasure) {
            console.error('Invalid beat position:', position);
            return;
        }

        this.tracks[trackId].beats.set(position, { intensity });
    }

    /**
     * Remove a beat
     * @param {number} trackId - Track index
     * @param {number} position - Beat position
     */
    removeBeat(trackId, position) {
        if (trackId < 0 || trackId >= this.trackCount) {
            return;
        }

        this.tracks[trackId].beats.delete(position);
    }

    /**
     * Toggle a beat (add if not exists, remove if exists)
     * @param {number} trackId - Track index
     * @param {number} position - Beat position
     * @param {number} intensity - Intensity value (0-1)
     * @returns {boolean} True if beat was added, false if removed
     */
    toggleBeat(trackId, position, intensity = 0.8) {
        if (this.hasBeat(trackId, position)) {
            this.removeBeat(trackId, position);
            return false;
        } else {
            this.addBeat(trackId, position, intensity);
            return true;
        }
    }

    /**
     * Check if a beat exists
     * @param {number} trackId - Track index
     * @param {number} position - Beat position
     * @returns {boolean} True if beat exists
     */
    hasBeat(trackId, position) {
        return this.tracks[trackId].beats.has(position);
    }

    /**
     * Get beat at position
     * @param {number} trackId - Track index
     * @param {number} position - Beat position
     * @returns {Object|null} Beat object or null
     */
    getBeat(trackId, position) {
        return this.tracks[trackId].beats.get(position) || null;
    }

    /**
     * Get all beats for a track
     * @param {number} trackId - Track index
     * @returns {Array} Array of beat objects with positions
     */
    getTrackBeats(trackId) {
        const beats = [];
        this.tracks[trackId].beats.forEach((beat, position) => {
            beats.push({ position, ...beat });
        });
        return beats.sort((a, b) => a.position - b.position);
    }

    /**
     * Clear a track
     * @param {number} trackId - Track index
     */
    clearTrack(trackId) {
        if (trackId >= 0 && trackId < this.trackCount) {
            this.tracks[trackId].beats.clear();
        }
    }

    /**
     * Clear all tracks
     */
    clearAll() {
        this.tracks.forEach(track => track.beats.clear());
        this.currentBeat = 0;
    }

    /**
     * Get all beats at a specific position across all tracks
     * @param {number} position - Beat position
     * @returns {Array} Array of {trackId, intensity} objects
     */
    getBeatsAtPosition(position) {
        const beats = [];
        this.tracks.forEach((track, trackId) => {
            const beat = track.beats.get(position);
            if (beat) {
                beats.push({ trackId, ...beat });
            }
        });
        return beats;
    }

    /**
     * Load a preset pattern
     * @param {Object} preset - Preset pattern object
     */
    loadPreset(preset) {
        if (!preset || !preset.tracks) {
            console.error('Invalid preset');
            return;
        }

        // Clear current pattern
        this.clearAll();

        // Load preset beats
        preset.tracks.forEach((track, trackId) => {
            if (trackId < this.trackCount && track.beats) {
                track.beats.forEach(beat => {
                    this.addBeat(trackId, beat.position, beat.intensity);
                });
            }
        });
    }

    /**
     * Export current pattern
     * @returns {Object} Pattern object
     */
    exportPattern() {
        const tracks = this.tracks.map(track => {
            const beats = [];
            track.beats.forEach((beat, position) => {
                beats.push({ position, intensity: beat.intensity });
            });
            return { beats };
        });

        return {
            name: 'Custom Pattern',
            tempo: this.tempo,
            tracks
        };
    }

    /**
     * Start playback
     */
    play() {
        if (this.isPlaying) {
            return;
        }

        this.isPlaying = true;
        this.playbackStartTime = performance.now();
        this.nextBeatTime = this.playbackStartTime;

        // Trigger callback
        if (this.onPlayStateChangeCallback) {
            this.onPlayStateChangeCallback(true);
        }

        // Start scheduling
        this.scheduleNextBeat();
    }

    /**
     * Pause playback
     */
    pause() {
        this.isPlaying = false;

        if (this.playbackInterval) {
            clearTimeout(this.playbackInterval);
            this.playbackInterval = null;
        }

        // Stop any ongoing vibrations
        this.engine.stop();

        // Trigger callback
        if (this.onPlayStateChangeCallback) {
            this.onPlayStateChangeCallback(false);
        }
    }

    /**
     * Stop playback and reset position
     */
    stop() {
        this.pause();
        this.currentBeat = 0;

        // Trigger beat callback to reset UI
        if (this.onBeatCallback) {
            this.onBeatCallback(this.currentBeat);
        }
    }

    /**
     * Schedule the next beat
     */
    scheduleNextBeat() {
        if (!this.isPlaying) {
            return;
        }

        const currentTime = performance.now();

        // Schedule beats that are due
        while (this.nextBeatTime < currentTime + this.scheduleAheadTime) {
            this.scheduleBeat(this.currentBeat, this.nextBeatTime);
            this.advanceBeat();
            this.nextBeatTime += this.beatDuration;
        }

        // Schedule next check
        const nextCheckTime = this.nextBeatTime - currentTime - this.scheduleAheadTime;
        this.playbackInterval = setTimeout(() => {
            this.scheduleNextBeat();
        }, Math.max(0, nextCheckTime));
    }

    /**
     * Schedule a specific beat to play
     * @param {number} beatPosition - Beat position
     * @param {number} time - Time to play (from performance.now())
     */
    scheduleBeat(beatPosition, time) {
        const currentTime = performance.now();
        const delay = Math.max(0, time - currentTime);

        // Get all beats at this position
        const beats = this.getBeatsAtPosition(beatPosition);

        // Schedule vibrations
        if (beats.length > 0) {
            setTimeout(() => {
                // Play all beats at this position
                beats.forEach(beat => {
                    this.engine.playBeat(beat.intensity);
                });

                // Trigger beat callback for UI update
                if (this.onBeatCallback) {
                    this.onBeatCallback(beatPosition, beats);
                }
            }, delay);
        } else {
            // No beats, but still trigger callback for playhead
            setTimeout(() => {
                if (this.onBeatCallback) {
                    this.onBeatCallback(beatPosition, []);
                }
            }, delay);
        }
    }

    /**
     * Advance to next beat
     */
    advanceBeat() {
        this.currentBeat++;

        if (this.currentBeat >= this.beatsPerMeasure) {
            this.currentBeat = 0;

            // Trigger loop callback
            if (this.onLoopCallback) {
                this.onLoopCallback();
            }

            // Stop if not looping
            if (!this.isLooping) {
                this.stop();
            }
        }
    }

    /**
     * Set beat callback
     * @param {Function} callback - Callback function (beatPosition, beats)
     */
    onBeat(callback) {
        this.onBeatCallback = callback;
    }

    /**
     * Set play state change callback
     * @param {Function} callback - Callback function (isPlaying)
     */
    onPlayStateChange(callback) {
        this.onPlayStateChangeCallback = callback;
    }

    /**
     * Set loop callback
     * @param {Function} callback - Callback function
     */
    onLoop(callback) {
        this.onLoopCallback = callback;
    }

    /**
     * Get playback state
     * @returns {Object} State object
     */
    getState() {
        return {
            isPlaying: this.isPlaying,
            isLooping: this.isLooping,
            currentBeat: this.currentBeat,
            tempo: this.tempo,
            beatDuration: this.beatDuration
        };
    }

    /**
     * Check if timeline has any beats
     * @returns {boolean} True if timeline has beats
     */
    hasBeats() {
        return this.tracks.some(track => track.beats.size > 0);
    }

    /**
     * Get total beat count
     * @returns {number} Total number of beats
     */
    getTotalBeatCount() {
        return this.tracks.reduce((total, track) => total + track.beats.size, 0);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Sequencer };
}
