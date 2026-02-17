// ============================================
// LOOP RECORDER
// ============================================

/**
 * LoopRecorder records and plays back scroll gestures
 */
class LoopRecorder {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

        // Recording state
        this.isRecording = false;
        this.isPlaying = false;
        this.recordedData = [];
        this.startTime = 0;
        this.playbackStartTime = 0;
        this.playbackIndex = 0;

        // Playback interval
        this.playbackInterval = null;

        // Set canvas resolution
        if (this.canvas) {
            this.resize();
            window.addEventListener('resize', () => this.resize());
        }
    }

    /**
     * Resize canvas
     */
    resize() {
        if (!this.canvas) return;

        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        this.width = rect.width;
        this.height = rect.height;
    }

    /**
     * Start recording
     */
    startRecording() {
        if (this.isRecording) return;

        this.isRecording = true;
        this.recordedData = [];
        this.startTime = performance.now();
    }

    /**
     * Stop recording
     */
    stopRecording() {
        if (!this.isRecording) return;

        this.isRecording = false;
        this.drawTimeline();
    }

    /**
     * Record a data point
     * @param {number} vertical - Vertical scroll value (0-1)
     * @param {number} horizontal - Horizontal scroll value (0-1)
     */
    record(vertical, horizontal) {
        if (!this.isRecording) return;

        const timestamp = performance.now() - this.startTime;

        // Check max duration
        if (timestamp > CONFIG.LOOP.MAX_DURATION * 1000) {
            this.stopRecording();
            return;
        }

        this.recordedData.push({
            timestamp,
            vertical,
            horizontal
        });
    }

    /**
     * Start playback
     * @param {Function} callback - Called with (vertical, horizontal) for each frame
     */
    startPlayback(callback) {
        if (this.isPlaying || this.recordedData.length === 0) return;

        this.isPlaying = true;
        this.playbackStartTime = performance.now();
        this.playbackIndex = 0;

        const playFrame = () => {
            if (!this.isPlaying) return;

            const elapsed = performance.now() - this.playbackStartTime;

            // Find current data point
            while (this.playbackIndex < this.recordedData.length) {
                const data = this.recordedData[this.playbackIndex];

                if (data.timestamp <= elapsed) {
                    callback(data.vertical, data.horizontal);
                    this.playbackIndex++;
                } else {
                    break;
                }
            }

            // Loop or stop
            if (this.playbackIndex >= this.recordedData.length) {
                if (CONFIG.LOOP.LOOP_ENABLED) {
                    this.playbackStartTime = performance.now();
                    this.playbackIndex = 0;
                } else {
                    this.stopPlayback();
                    return;
                }
            }

            requestAnimationFrame(playFrame);
        };

        playFrame();
    }

    /**
     * Stop playback
     */
    stopPlayback() {
        this.isPlaying = false;
        this.playbackIndex = 0;
    }

    /**
     * Clear recorded data
     */
    clear() {
        this.recordedData = [];
        this.isRecording = false;
        this.isPlaying = false;
        this.clearTimeline();
    }

    /**
     * Draw timeline visualization
     */
    drawTimeline() {
        if (!this.ctx || this.recordedData.length === 0) return;

        // Clear canvas
        this.ctx.fillStyle = '#0a0a0f';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Get duration
        const duration = this.recordedData[this.recordedData.length - 1].timestamp;

        // Draw vertical scroll
        this.ctx.strokeStyle = CONFIG.LOOP.TIMELINE_COLOR;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();

        for (let i = 0; i < this.recordedData.length; i++) {
            const data = this.recordedData[i];
            const x = (data.timestamp / duration) * this.width;
            const y = this.height - (data.vertical * this.height * 0.4);

            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }

        this.ctx.stroke();

        // Draw horizontal scroll
        this.ctx.strokeStyle = '#ff00ff';
        this.ctx.beginPath();

        for (let i = 0; i < this.recordedData.length; i++) {
            const data = this.recordedData[i];
            const x = (data.timestamp / duration) * this.width;
            const y = this.height - (data.horizontal * this.height * 0.4) - (this.height * 0.5);

            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }

        this.ctx.stroke();
    }

    /**
     * Clear timeline
     */
    clearTimeline() {
        if (!this.ctx) return;

        this.ctx.fillStyle = '#0a0a0f';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    /**
     * Get recorded data
     * @returns {Array}
     */
    getData() {
        return this.recordedData;
    }

    /**
     * Check if has data
     * @returns {boolean}
     */
    hasData() {
        return this.recordedData.length > 0;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoopRecorder;
}
