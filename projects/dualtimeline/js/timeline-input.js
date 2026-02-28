/**
 * DualTimeline - Scrubber Controller
 * Purpose: Manage the timeline input and dispatch controls to the player.
 * Module runs exclusively in the Timeline window.
 */

import { sync, MESSAGES } from './sync.js';
import { logger, formatTimestamp } from './utils.js';

class TimelineController {
    constructor() {
        // Cache Core DOM Elements
        this.scrubber = document.getElementById('main-scrubber');
        this.progressBar = document.getElementById('progress-bar');
        this.bufferBar = document.getElementById('buffer-bar');
        this.currentTimeLabel = document.getElementById('current-time');
        this.durationLabel = document.getElementById('total-duration');
        this.playPauseBtn = document.getElementById('btn-play-pause');
        this.playIcon = document.getElementById('play-icon');
        this.pauseIcon = document.getElementById('pause-icon');
        this.prevBtn = document.getElementById('btn-prev');
        this.nextBtn = document.getElementById('btn-next');
        this.connectionStatus = document.getElementById('connection-status');
        this.syncStatusText = document.getElementById('sync-status');

        // Extended UI Elements
        this.speedSelect = document.getElementById('speed-select');
        this.volumeSlider = document.getElementById('volume-slider');
        this.muteBtn = document.getElementById('btn-mute');

        // Internal State
        this.isUserScrubbing = false;
        this.isUserHovering = false;
        this.localState = {
            currentTime: 0,
            duration: 0,
            isPlaying: false,
            isBuffering: false,
            playbackRate: 1.0,
            volume: 1.0
        };

        this.init();
    }

    /**
     * Logic Entry Point
     */
    init() {
        if (!this.scrubber) {
            logger.error('Timeline elements missing from DOM');
            return;
        }

        this.setupEventListeners();
        this.subscribeToSync();

        logger.info('Timeline Control Module initialized');
    }

    /**
     * Wiring of DOM and system events
     */
    setupEventListeners() {
        // --- Scrubber Interactions ---
        this.scrubber.addEventListener('input', (e) => this.handleScrubInput(e));
        this.scrubber.addEventListener('change', () => this.handleScrubCommit());
        this.scrubber.addEventListener('mousedown', () => { this.isUserScrubbing = true; });
        this.scrubber.addEventListener('touchstart', () => { this.isUserScrubbing = true; });
        this.scrubber.addEventListener('mouseup', () => { this.isUserScrubbing = false; });
        this.scrubber.addEventListener('touchend', () => { this.isUserScrubbing = false; });

        // --- Mouse Wheel Precision Seeking ---
        window.addEventListener('wheel', (e) => {
            if (Math.abs(e.deltaY) > 5) {
                const modifier = e.shiftKey ? 10 : 1;
                const nudge = (e.deltaY < 0 ? 1 : -1) * modifier;
                this.requestSeekRelative(nudge);
            }
        }, { passive: true });

        // --- Playback Buttons ---
        this.playPauseBtn.addEventListener('click', () => this.requestTogglePlayback());
        this.prevBtn.addEventListener('click', () => this.requestSeekRelative(-10));
        this.nextBtn.addEventListener('click', () => this.requestSeekRelative(10));

        // --- Extended Control Events ---
        if (this.speedSelect) {
            this.speedSelect.addEventListener('change', (e) => {
                sync.send('SET_RATE', { rate: parseFloat(e.target.value) });
            });
        }

        if (this.volumeSlider) {
            this.volumeSlider.addEventListener('input', (e) => {
                sync.send('SET_VOLUME', { volume: parseFloat(e.target.value) });
            });
        }

        if (this.muteBtn) {
            this.muteBtn.addEventListener('click', () => this.toggleMute());
        }

        // --- Global Keyboard Shortcuts ---
        window.addEventListener('keydown', (e) => this.handleHotkeys(e));

        // --- Focus/Blur Handling ---
        window.addEventListener('focus', () => {
            this.syncStatusText.innerText = 'Connected & Active';
        });
    }

    /**
     * Network listeners
     */
    subscribeToSync() {
        sync.on((type, payload) => {
            if (type === MESSAGES.STATE_UPDATE) {
                this.ingestPlayerState(payload);
            }
        });

        window.addEventListener('sync:connection', (e) => this.updateConnectivityUI(e.detail));
    }

    /**
     * State ingestion from Player window
     */
    ingestPlayerState(state) {
        this.localState = { ...state };
        this.reconcileUI();
    }

    /**
     * Map internal state to visual elements
     */
    reconcileUI() {
        const { currentTime, duration, isPlaying, isBuffering, buffered, playbackRate, volume } = this.localState;

        // 1. Scrubber Position
        if (!this.isUserScrubbing) {
            this.scrubber.max = duration;
            this.scrubber.value = currentTime;

            const progressRange = (currentTime / (duration || 1)) * 100;
            this.progressBar.style.width = `${progressRange}%`;

            this.currentTimeLabel.innerText = formatTimestamp(currentTime, 'AUTO');
        }

        // 2. Duration label
        this.durationLabel.innerText = formatTimestamp(duration, 'AUTO');

        // 3. Play/Pause State
        if (isPlaying) {
            this.playIcon.classList.add('hidden');
            this.pauseIcon.classList.remove('hidden');
        } else {
            this.playIcon.classList.remove('hidden');
            this.pauseIcon.classList.add('hidden');
        }

        // 4. Buffer Visualization
        if (buffered && buffered.length > 0) {
            const lastRange = buffered[buffered.length - 1];
            const bufferRange = (lastRange.end / (duration || 1)) * 100;
            this.bufferBar.style.width = `${bufferRange}%`;
        }

        // 5. Update Speed & Volume UI
        if (this.speedSelect) this.speedSelect.value = playbackRate;
        if (this.volumeSlider) this.volumeSlider.value = volume;

        if (this.muteBtn) {
            if (volume === 0 || state.muted) {
                this.muteBtn.style.color = 'var(--danger-color)';
                this.muteBtn.setAttribute('title', 'Unmute');
            } else {
                this.muteBtn.style.color = 'var(--text-secondary)';
                this.muteBtn.setAttribute('title', 'Mute');
            }
        }

        // 6. System Status
        if (isBuffering) {
            this.syncStatusText.innerText = 'Player is buffering...';
            this.syncStatusText.style.color = '#f59e0b';
        } else {
            this.syncStatusText.innerText = 'System Synchronized';
            this.syncStatusText.style.color = '#22c55e';
        }
    }

    /**
     * User Action: Dragging the scrubber
     */
    handleScrubInput(e) {
        const value = parseFloat(e.target.value);
        this.currentTimeLabel.innerText = formatTimestamp(value, 'AUTO');
        const progressRange = (value / (this.localState.duration || 1)) * 100;
        this.progressBar.style.width = `${progressRange}%`;
        sync.send(MESSAGES.CMD_SEEK, { time: value });
    }

    /**
     * User Action: Dropping the scrubber
     */
    handleScrubCommit() {
        this.isUserScrubbing = false;
        logger.info('Scrub operation committed');
        sync.send(MESSAGES.CMD_SEEK, { time: parseFloat(this.scrubber.value), final: true });
    }

    /**
     * Request a change in playback state
     */
    requestTogglePlayback() {
        if (this.localState.isPlaying) {
            sync.send(MESSAGES.CMD_PAUSE);
        } else {
            sync.send(MESSAGES.CMD_PLAY);
        }
    }

    /**
     * Request a relative jump in time
     */
    requestSeekRelative(seconds) {
        const target = Math.max(0, Math.min(this.localState.duration, this.localState.currentTime + seconds));
        sync.send(MESSAGES.CMD_SEEK, { time: target });
    }

    /**
     * Advanced Keyboard Processing
     */
    handleHotkeys(e) {
        if (['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
            e.preventDefault();
        }

        switch (e.code) {
            case 'Space':
            case 'KeyK':
                this.requestTogglePlayback();
                break;
            case 'ArrowLeft':
            case 'KeyJ':
                this.requestSeekRelative(e.shiftKey ? -30 : -5);
                break;
            case 'ArrowRight':
            case 'KeyL':
                this.requestSeekRelative(e.shiftKey ? 30 : 5);
                break;
            case 'Digit0':
            case 'Home':
                sync.send(MESSAGES.CMD_SEEK, { time: 0 });
                break;
            case 'KeyM':
                this.toggleMute();
                break;
            case 'Equal':
                this.changePlaybackRate(0.25);
                break;
            case 'Minus':
                this.changePlaybackRate(-0.25);
                break;
        }
    }

    /**
     * Mute toggle helper
     */
    toggleMute() {
        const newVolume = this.localState.volume > 0 ? 0 : 1.0;
        sync.send('SET_VOLUME', { volume: newVolume });
    }

    /**
     * Rate change helper
     */
    changePlaybackRate(delta) {
        const newRate = Math.max(0.25, Math.min(4, this.localState.playbackRate + delta));
        sync.send('SET_RATE', { rate: newRate });
        logger.info(`Requested rate change to ${newRate}x`);
    }

    /**
     * Handle connection lifecycle updates
     */
    updateConnectivityUI(isConnected) {
        if (isConnected) {
            this.connectionStatus.innerText = 'Synced';
            this.connectionStatus.classList.replace('disconnected', 'connected');
            this.scrubber.disabled = false;
            this.playPauseBtn.disabled = false;
            this.prevBtn.disabled = false;
            this.nextBtn.disabled = false;
        } else {
            this.connectionStatus.innerText = 'Offline';
            this.connectionStatus.classList.replace('connected', 'disconnected');
            this.scrubber.disabled = true;
            this.playPauseBtn.disabled = true;
            this.prevBtn.disabled = true;
            this.nextBtn.disabled = true;
            this.syncStatusText.innerText = 'Link Lost - Reconnecting...';
        }
    }
}

// Global bootstrap
window.addEventListener('load', () => {
    if (window.location.pathname.includes('timeline.html')) {
        window.timeline = new TimelineController();
    }
});
