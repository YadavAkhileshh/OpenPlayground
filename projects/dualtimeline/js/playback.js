/**
 * DualTimeline - Playback Controller
 * Purpose: Direct control of the video element and state reporting.
 * Module runs exclusively in the Player window.
 */

import { sync, MESSAGES } from './sync.js';
import { logger, fadeIn, fadeOut } from './utils.js';

class PlaybackController {
    constructor() {
        // High-level system settings
        window.DUAL_TIMELINE_DEBUG = true;

        // Cache DOM Elements
        this.video = document.getElementById('main-video');
        this.overlay = document.getElementById('status-overlay');
        this.statusText = document.getElementById('status-text');
        this.latencyDisplay = document.getElementById('sync-latency');
        this.bufferDisplay = document.getElementById('buffer-status');
        this.connectionBadge = document.getElementById('connection-badge');

        this.isSeeking = false;
        this.lastUpdateTime = 0;
        this.seekTimer = null;

        this.init();
    }

    /**
     * Setup video event listeners and sync subscribers
     */
    init() {
        if (!this.video) {
            logger.error('Video element not found!');
            return;
        }

        // --- Video Core Events ---
        this.video.addEventListener('timeupdate', () => this.handleTimeUpdate());
        this.video.addEventListener('durationchange', () => this.reportState());
        this.video.addEventListener('play', () => this.reportState());
        this.video.addEventListener('pause', () => this.reportState());
        this.video.addEventListener('waiting', () => this.handleBuffering(true));
        this.video.addEventListener('playing', () => this.handleBuffering(false));
        this.video.addEventListener('canplay', () => this.handleBuffering(false));
        this.video.addEventListener('progress', () => this.handleBufferProgress());
        this.video.addEventListener('ratechange', () => this.reportState());
        this.video.addEventListener('volumechange', () => this.reportState());

        // --- Sync Message Handlers ---
        sync.on((type, payload) => {
            switch (type) {
                case MESSAGES.CMD_PLAY:
                    this.play();
                    break;
                case MESSAGES.CMD_PAUSE:
                    this.pause();
                    break;
                case MESSAGES.CMD_SEEK:
                    this.seek(payload.time);
                    break;
                // Extended features
                case 'SET_RATE':
                    this.setPlaybackRate(payload.rate);
                    break;
                case 'SET_VOLUME':
                    this.setVolume(payload.volume);
                    break;
            }
        });

        // --- Local State Listeners ---
        window.addEventListener('sync:connection', (e) => this.updateConnectionStatus(e.detail));
        window.addEventListener('sync:latency', (e) => this.updateLatency(e.detail));

        logger.info('Playback Controller initialized');

        // Force an initial report to sync windows
        setTimeout(() => this.reportState(), 1000);
    }

    /**
     * Start video playback with user interaction handling
     */
    async play() {
        try {
            if (this.video.paused) {
                const playPromise = this.video.play();
                if (playPromise !== undefined) {
                    await playPromise;
                    logger.info('Playback started successfully');
                }
            }
            this.reportState();
        } catch (e) {
            logger.warn('Playback blocked by browser. User interaction needed.', e);
            this.statusText.innerText = 'Tap to Synchronize';
            fadeIn(this.overlay);

            const unlock = async () => {
                try {
                    await this.video.play();
                    fadeOut(this.overlay);
                    window.removeEventListener('click', unlock);
                    this.reportState();
                } catch (err) {
                    logger.error('Self-unlock attempt failed:', err);
                }
            };
            window.addEventListener('click', unlock);
        }
    }

    /**
     * Pause video playback
     */
    pause() {
        if (!this.video.paused) {
            this.video.pause();
            logger.info('Playback paused via remote');
        }
        this.reportState();
    }

    /**
     * Seek to a specific timestamp with debouncing
     */
    seek(time) {
        if (!this.video || isNaN(this.video.duration)) return;

        this.isSeeking = true;

        // Logical clamping
        const targetTime = Math.max(0, Math.min(time, this.video.duration));

        // Set current time directly
        this.video.currentTime = targetTime;

        // Buffer status check
        this.handleBufferProgress();

        // Release seek lock after hardware settles
        clearTimeout(this.seekTimer);
        this.seekTimer = setTimeout(() => {
            this.isSeeking = false;
            this.reportState();
        }, 150);
    }

    /**
     * Update playback speed
     */
    setPlaybackRate(rate) {
        const validRate = parseFloat(rate);
        if (!isNaN(validRate)) {
            this.video.playbackRate = validRate;
            logger.info(`Playback rate set to ${validRate}x`);
            this.reportState();
        }
    }

    /**
     * Update audio volume
     */
    setVolume(volume) {
        const validVolume = Math.max(0, Math.min(1, parseFloat(volume)));
        if (!isNaN(validVolume)) {
            this.video.volume = validVolume;
            this.video.muted = (validVolume === 0);
            this.reportState();
        }
    }

    /**
     * Reporting loop for smooth timeline updates
     */
    handleTimeUpdate() {
        const now = performance.now();
        // Report every 100ms for smoothness, or if we just finished seeking
        if (now - this.lastUpdateTime > 100 && !this.isSeeking) {
            this.reportState();
            this.lastUpdateTime = now;
        }
    }

    /**
     * Management of visual buffering states
     */
    handleBuffering(isWaiting) {
        if (isWaiting) {
            this.statusText.innerText = 'Synchronizing Media...';
            fadeIn(this.overlay, 200);
        } else {
            fadeOut(this.overlay, 300);
        }
        this.reportState();
    }

    /**
     * Calculate and report buffer progress for UX
     */
    handleBufferProgress() {
        if (this.video.buffered.length > 0) {
            const bufferedEnd = this.video.buffered.end(this.video.buffered.length - 1);
            const duration = this.video.duration;
            if (duration > 0) {
                const percent = Math.round((bufferedEnd / duration) * 100);
                this.bufferDisplay.innerText = `Buffer: ${percent}%`;
            }
        }
    }

    /**
     * Primary state report method
     * Compiles detailed metadata to synchronize with remote timeline
     */
    reportState() {
        if (!this.video) return;

        const state = {
            currentTime: this.video.currentTime,
            duration: this.video.duration || 0,
            isPlaying: !this.video.paused,
            isBuffering: this.video.readyState < 3,
            playbackRate: this.video.playbackRate,
            volume: this.video.volume,
            muted: this.video.muted,
            buffered: this.getBufferedRanges(),
            readyState: this.video.readyState,
            networkState: this.video.networkState
        };

        sync.send(MESSAGES.STATE_UPDATE, state);
    }

    /**
     * Utility to serialize TimeRanges object
     */
    getBufferedRanges() {
        const ranges = [];
        try {
            for (let i = 0; i < this.video.buffered.length; i++) {
                ranges.push({
                    start: this.video.buffered.start(i),
                    end: this.video.buffered.end(i)
                });
            }
        } catch (e) {
            logger.debug('Error reading buffer ranges');
        }
        return ranges;
    }

    /**
     * Connection health UI updates
     */
    updateConnectionStatus(isConnected) {
        if (!this.connectionBadge) return;

        if (isConnected) {
            this.connectionBadge.classList.remove('disconnected');
            this.connectionBadge.classList.add('connected');
            this.connectionBadge.querySelector('span').innerText = 'Timeline: Synced';
            this.reportState();
        } else {
            this.connectionBadge.classList.remove('connected');
            this.connectionBadge.classList.add('disconnected');
            this.connectionBadge.querySelector('span').innerText = 'Timeline: Disconnected';
        }
    }

    /**
     * Latency tracking for distributed performance
     */
    updateLatency(ms) {
        if (!this.latencyDisplay) return;

        this.latencyDisplay.innerText = `Latency: ${ms}ms`;

        if (ms > 150) {
            this.latencyDisplay.style.color = '#ef4444'; // Red
        } else if (ms > 50) {
            this.latencyDisplay.style.color = '#f59e0b'; // Amber
        } else {
            this.latencyDisplay.style.color = '#94a3b8'; // Slate
        }
    }
}

// Global bootstrap
window.addEventListener('load', () => {
    if (window.location.pathname.includes('player.html')) {
        window.playback = new PlaybackController();
    }
});
