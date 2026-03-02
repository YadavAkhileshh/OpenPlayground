/**
 * TextBeat - Audio Engine Module
 * Web Audio API synthesis and playback control
 */

const AudioEngine = (function () {
    'use strict';

    let audioContext = null;
    let masterGain = null;
    let isPlaying = false;
    let currentStep = 0;
    let schedulerTimer = null;
    let nextNoteTime = 0;
    let lookahead = 25.0; // How frequently to call scheduling function (in milliseconds)
    let scheduleAheadTime = 0.1; // How far ahead to schedule audio (in seconds)

    // Volume settings for each drum type
    let volumes = {
        kick: 0.8,
        snare: 0.7,
        tom: 0.65,
        hihat: 0.6,
        cymbal: 0.55,
        master: 0.75
    };

    /**
     * Initialize Web Audio API context
     * @returns {boolean} - Success status
     */
    function initAudioContext() {
        try {
            // Create audio context (handle browser prefixes)
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContext = new AudioContext();

            // Create master gain node
            masterGain = audioContext.createGain();
            masterGain.gain.value = volumes.master;
            masterGain.connect(audioContext.destination);

            return true;
        } catch (error) {
            console.error('Failed to initialize audio context:', error);
            return false;
        }
    }

    /**
     * Resume audio context (required for user interaction)
     */
    async function resumeAudioContext() {
        if (audioContext && audioContext.state === 'suspended') {
            await audioContext.resume();
        }
    }

    /**
     * Create kick drum sound
     * @param {number} time - When to play (in audio context time)
     * @param {number} velocity - Hit strength (0-1)
     */
    function createKick(time, velocity = 1.0) {
        if (!audioContext) return;

        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        // Frequency envelope: start high, drop quickly
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(50, time + 0.05);
        osc.frequency.exponentialRampToValueAtTime(30, time + 0.1);

        // Amplitude envelope
        const volume = velocity * volumes.kick * volumes.master;
        gain.gain.setValueAtTime(volume, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(time);
        osc.stop(time + 0.5);
    }

    /**
     * Create snare drum sound
     * @param {number} time - When to play
     * @param {number} velocity - Hit strength (0-1)
     */
    function createSnare(time, velocity = 1.0) {
        if (!audioContext) return;

        // Oscillator for tone
        const osc = audioContext.createOscillator();
        const oscGain = audioContext.createGain();

        osc.frequency.setValueAtTime(200, time);
        osc.frequency.exponentialRampToValueAtTime(100, time + 0.1);

        oscGain.gain.setValueAtTime(0.3 * velocity, time);
        oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

        osc.connect(oscGain);

        // Noise for snap
        const noise = audioContext.createBufferSource();
        const noiseBuffer = createNoiseBuffer(0.2);
        noise.buffer = noiseBuffer;

        const noiseGain = audioContext.createGain();
        const noiseFilter = audioContext.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.value = 1000;

        const volume = velocity * volumes.snare * volumes.master;
        noiseGain.gain.setValueAtTime(volume, time);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);

        // Mix oscillator and noise
        const mixer = audioContext.createGain();
        mixer.gain.value = 1.0;

        oscGain.connect(mixer);
        noiseGain.connect(mixer);
        mixer.connect(masterGain);

        osc.start(time);
        osc.stop(time + 0.2);
        noise.start(time);
        noise.stop(time + 0.2);
    }

    /**
     * Create tom drum sound
     * @param {number} time - When to play
     * @param {number} velocity - Hit strength (0-1)
     */
    function createTom(time, velocity = 1.0) {
        if (!audioContext) return;

        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        // Mid-frequency tom
        osc.frequency.setValueAtTime(120, time);
        osc.frequency.exponentialRampToValueAtTime(60, time + 0.1);

        const volume = velocity * volumes.tom * volumes.master;
        gain.gain.setValueAtTime(volume, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(time);
        osc.stop(time + 0.3);
    }

    /**
     * Create hi-hat sound
     * @param {number} time - When to play
     * @param {number} velocity - Hit strength (0-1)
     */
    function createHiHat(time, velocity = 1.0) {
        if (!audioContext) return;

        // Use filtered white noise
        const noise = audioContext.createBufferSource();
        const noiseBuffer = createNoiseBuffer(0.05);
        noise.buffer = noiseBuffer;

        const filter = audioContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 7000;
        filter.Q.value = 1.0;

        const gain = audioContext.createGain();
        const volume = velocity * volumes.hihat * volumes.master;
        gain.gain.setValueAtTime(volume, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);

        noise.start(time);
        noise.stop(time + 0.05);
    }

    /**
     * Create cymbal sound
     * @param {number} time - When to play
     * @param {number} velocity - Hit strength (0-1)
     */
    function createCymbal(time, velocity = 1.0) {
        if (!audioContext) return;

        // Longer sustained noise
        const noise = audioContext.createBufferSource();
        const noiseBuffer = createNoiseBuffer(0.5);
        noise.buffer = noiseBuffer;

        const filter = audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 8000;
        filter.Q.value = 0.5;

        const gain = audioContext.createGain();
        const volume = velocity * volumes.cymbal * volumes.master;
        gain.gain.setValueAtTime(volume, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);

        noise.start(time);
        noise.stop(time + 0.5);
    }

    /**
     * Create a buffer of white noise
     * @param {number} duration - Duration in seconds
     * @returns {AudioBuffer} - Noise buffer
     */
    function createNoiseBuffer(duration) {
        const sampleRate = audioContext.sampleRate;
        const bufferSize = sampleRate * duration;
        const buffer = audioContext.createBuffer(1, bufferSize, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        return buffer;
    }

    /**
     * Schedule a single step of the pattern
     * @param {Object} pattern - The pattern object
     * @param {number} step - Current step (0-15)
     * @param {number} time - When to play
     */
    function scheduleNote(pattern, step, time) {
        const drums = ['kick', 'snare', 'tom', 'hihat', 'cymbal'];

        drums.forEach(drum => {
            const beat = pattern.lanes[drum][step];
            if (beat && beat.active) {
                const velocity = beat.velocity || 1.0;

                switch (drum) {
                    case 'kick':
                        createKick(time, velocity);
                        break;
                    case 'snare':
                        createSnare(time, velocity);
                        break;
                    case 'tom':
                        createTom(time, velocity);
                        break;
                    case 'hihat':
                        createHiHat(time, velocity);
                        break;
                    case 'cymbal':
                        createCymbal(time, velocity);
                        break;
                }
            }
        });
    }

    /**
     * Scheduler function - called repeatedly to schedule notes
     * @param {Object} pattern - The pattern to play
     * @param {boolean} loop - Whether to loop
     * @param {Function} onStepCallback - Called on each step
     */
    function scheduler(pattern, loop, onStepCallback) {
        // Schedule all notes that need to play before next interval
        while (nextNoteTime < audioContext.currentTime + scheduleAheadTime) {
            scheduleNote(pattern, currentStep, nextNoteTime);

            // Notify UI of current step
            if (onStepCallback) {
                const scheduleTime = (nextNoteTime - audioContext.currentTime) * 1000;
                setTimeout(() => onStepCallback(currentStep), scheduleTime);
            }

            // Advance to next step
            nextNoteTime += pattern.stepDuration;
            currentStep++;

            // Handle loop or stop
            if (currentStep >= pattern.steps) {
                if (loop) {
                    currentStep = 0;
                } else {
                    stopPlayback();
                    return;
                }
            }
        }

        // Schedule next scheduler call
        if (isPlaying) {
            schedulerTimer = setTimeout(() => scheduler(pattern, loop, onStepCallback), lookahead);
        }
    }

    /**
     * Start playback of a pattern
     * @param {Object} pattern - The pattern to play
     * @param {boolean} loop - Whether to loop
     * @param {Function} onStepCallback - Called on each step
     */
    function startPlayback(pattern, loop = false, onStepCallback = null) {
        if (!audioContext) {
            initAudioContext();
        }

        resumeAudioContext();

        if (isPlaying) {
            stopPlayback();
        }

        isPlaying = true;
        currentStep = 0;
        nextNoteTime = audioContext.currentTime + 0.1; // Small delay before starting

        scheduler(pattern, loop, onStepCallback);
    }

    /**
     * Stop playback
     */
    function stopPlayback() {
        isPlaying = false;
        currentStep = 0;

        if (schedulerTimer) {
            clearTimeout(schedulerTimer);
            schedulerTimer = null;
        }
    }

    /**
     * Set volume for a specific drum or master
     * @param {string} drum - Drum type or 'master'
     * @param {number} value - Volume (0-1)
     */
    function setVolume(drum, value) {
        if (volumes.hasOwnProperty(drum)) {
            volumes[drum] = Math.max(0, Math.min(1, value));

            // Update master gain if master volume changed
            if (drum === 'master' && masterGain) {
                masterGain.gain.value = volumes.master;
            }
        }
    }

    /**
     * Get current volume for a drum
     * @param {string} drum - Drum type or 'master'
     * @returns {number} - Volume value
     */
    function getVolume(drum) {
        return volumes[drum] || 0;
    }

    /**
     * Get playback state
     * @returns {Object} - State object
     */
    function getState() {
        return {
            isPlaying: isPlaying,
            currentStep: currentStep,
            volumes: { ...volumes }
        };
    }

    // Public API
    return {
        initAudioContext,
        resumeAudioContext,
        createKick,
        createSnare,
        createTom,
        createHiHat,
        createCymbal,
        startPlayback,
        stopPlayback,
        setVolume,
        getVolume,
        getState
    };
})();
