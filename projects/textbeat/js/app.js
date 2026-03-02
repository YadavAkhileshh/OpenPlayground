/**
 * TextBeat - Main Application Controller
 * Coordinates UI, text parsing, rhythm generation, and audio playback
 */

(function () {
    'use strict';

    // Application state
    let currentPattern = null;
    let currentRhythmData = null;
    let isLooping = false;
    let currentBPM = 120;

    // DOM elements
    const elements = {
        textInput: null,
        generateBtn: null,
        playBtn: null,
        stopBtn: null,
        loopBtn: null,
        clearBtn: null,
        bpmSlider: null,
        bpmDisplay: null,
        syllableCount: null,
        beatCount: null,
        charCount: null,
        currentStepDisplay: null,
        volumeSliders: {},
        volumeValues: {},
        resetVolumesBtn: null,
        beatCells: {}
    };

    /**
     * Initialize the application
     */
    function init() {
        // Cache DOM elements
        cacheElements();

        // Initialize audio engine
        AudioEngine.initAudioContext();

        // Bind event listeners
        bindEventListeners();

        // Set initial UI state
        updateUI();

        console.log('TextBeat initialized successfully');
    }

    /**
     * Cache all DOM elements
     */
    function cacheElements() {
        elements.textInput = document.getElementById('text-input');
        elements.generateBtn = document.getElementById('generate-btn');
        elements.playBtn = document.getElementById('play-btn');
        elements.stopBtn = document.getElementById('stop-btn');
        elements.loopBtn = document.getElementById('loop-btn');
        elements.clearBtn = document.getElementById('clear-text-btn');
        elements.bpmSlider = document.getElementById('bpm-slider');
        elements.bpmDisplay = document.getElementById('bpm-display');
        elements.syllableCount = document.getElementById('syllable-count');
        elements.beatCount = document.getElementById('beat-count');
        elements.charCount = document.getElementById('char-count');
        elements.currentStepDisplay = document.getElementById('current-step-display');
        elements.resetVolumesBtn = document.getElementById('reset-volumes-btn');

        // Cache volume sliders
        const drums = ['kick', 'snare', 'tom', 'hihat', 'cymbal', 'master'];
        drums.forEach(drum => {
            elements.volumeSliders[drum] = document.getElementById(`${drum}-volume`);
            elements.volumeValues[drum] = document.getElementById(`${drum}-volume-value`);
        });

        // Cache all beat cells
        const lanes = ['kick', 'snare', 'tom', 'hihat', 'cymbal'];
        lanes.forEach(drum => {
            elements.beatCells[drum] = [];
            for (let i = 0; i < 16; i++) {
                const cell = document.querySelector(`.beat-cell[data-step="${i}"][data-drum="${drum}"]`);
                if (cell) {
                    elements.beatCells[drum].push(cell);
                }
            }
        });
    }

    /**
     * Bind all event listeners
     */
    function bindEventListeners() {
        // Text input events
        elements.textInput.addEventListener('input', handleTextInput);
        elements.clearBtn.addEventListener('click', handleClearText);

        // Pattern generation
        elements.generateBtn.addEventListener('click', handleGeneratePattern);

        // Playback controls
        elements.playBtn.addEventListener('click', handlePlayButton);
        elements.stopBtn.addEventListener('click', handleStopButton);
        elements.loopBtn.addEventListener('click', handleLoopButton);

        // BPM control
        elements.bpmSlider.addEventListener('input', handleBPMChange);

        // Volume controls
        Object.keys(elements.volumeSliders).forEach(drum => {
            elements.volumeSliders[drum].addEventListener('input', (e) => {
                handleVolumeChange(drum, e.target.value);
            });
        });

        elements.resetVolumesBtn.addEventListener('click', handleResetVolumes);

        // Beat cell clicks (for manual editing)
        Object.keys(elements.beatCells).forEach(drum => {
            elements.beatCells[drum].forEach((cell, index) => {
                cell.addEventListener('click', () => handleBeatCellClick(drum, index));
            });
        });
    }

    /**
     * Handle text input changes
     */
    function handleTextInput(event) {
        const text = event.target.value;
        elements.charCount.textContent = `${text.length} characters`;
    }

    /**
     * Handle clear text button
     */
    function handleClearText() {
        elements.textInput.value = '';
        elements.charCount.textContent = '0 characters';
        elements.syllableCount.textContent = '0';
        elements.beatCount.textContent = '0';

        // Clear pattern
        currentPattern = null;
        currentRhythmData = null;
        updateTimeline(null);
    }

    /**
     * Handle generate pattern button
     */
    function handleGeneratePattern() {
        const text = elements.textInput.value.trim();

        if (!text) {
            alert('Please enter some text first!');
            return;
        }

        // Parse text
        const parsedData = TextParser.parseText(text);
        currentRhythmData = TextParser.generateRhythmData(parsedData);

        // Generate pattern
        currentPattern = RhythmEngine.createPattern(currentRhythmData, currentBPM);

        // Update UI
        elements.syllableCount.textContent = parsedData.totalSyllables;
        elements.beatCount.textContent = currentRhythmData.vowelCount;

        // Update timeline visualization
        updateTimeline(currentPattern);

        // Add visual feedback
        elements.generateBtn.classList.add('fade-in');
        setTimeout(() => elements.generateBtn.classList.remove('fade-in'), 300);
    }

    /**
     * Handle play/pause button
     */
    function handlePlayButton() {
        if (!currentPattern) {
            alert('Please generate a pattern first!');
            return;
        }

        const state = AudioEngine.getState();

        if (state.isPlaying) {
            // Pause
            AudioEngine.stopPlayback();
            elements.playBtn.classList.remove('playing');
            elements.playBtn.querySelector('.play-icon').style.display = 'block';
            elements.playBtn.querySelector('.pause-icon').style.display = 'none';
            clearCurrentStepHighlight();
        } else {
            // Play
            AudioEngine.startPlayback(currentPattern, isLooping, handleStepCallback);
            elements.playBtn.classList.add('playing');
            elements.playBtn.querySelector('.play-icon').style.display = 'none';
            elements.playBtn.querySelector('.pause-icon').style.display = 'block';
        }
    }

    /**
     * Handle stop button
     */
    function handleStopButton() {
        AudioEngine.stopPlayback();
        elements.playBtn.classList.remove('playing');
        elements.playBtn.querySelector('.play-icon').style.display = 'block';
        elements.playBtn.querySelector('.pause-icon').style.display = 'none';
        clearCurrentStepHighlight();
        elements.currentStepDisplay.textContent = 'Step: 1/16';
    }

    /**
     * Handle loop button
     */
    function handleLoopButton() {
        isLooping = !isLooping;

        if (isLooping) {
            elements.loopBtn.classList.add('active');
        } else {
            elements.loopBtn.classList.remove('active');
        }
    }

    /**
     * Handle BPM slider change
     */
    function handleBPMChange(event) {
        currentBPM = parseInt(event.target.value);
        elements.bpmDisplay.textContent = `${currentBPM} BPM`;

        // Regenerate pattern with new BPM if exists
        if (currentRhythmData) {
            currentPattern = RhythmEngine.createPattern(currentRhythmData, currentBPM);
        }
    }

    /**
     * Handle volume slider change
     */
    function handleVolumeChange(drum, value) {
        const volume = parseInt(value) / 100;
        AudioEngine.setVolume(drum, volume);
        elements.volumeValues[drum].textContent = `${value}%`;
    }

    /**
     * Handle reset volumes button
     */
    function handleResetVolumes() {
        const defaults = {
            kick: 80,
            snare: 70,
            tom: 65,
            hihat: 60,
            cymbal: 55,
            master: 75
        };

        Object.keys(defaults).forEach(drum => {
            elements.volumeSliders[drum].value = defaults[drum];
            handleVolumeChange(drum, defaults[drum]);
        });
    }

    /**
     * Handle beat cell click (manual editing)
     */
    function handleBeatCellClick(drum, step) {
        if (!currentPattern) return;

        const beat = currentPattern.lanes[drum][step];

        if (beat && beat.active) {
            // Deactivate
            currentPattern.lanes[drum][step] = null;
        } else {
            // Activate
            currentPattern.lanes[drum][step] = {
                active: true,
                velocity: 0.8
            };
        }

        // Update visual
        updateTimeline(currentPattern);
    }

    /**
     * Update timeline visualization
     */
    function updateTimeline(pattern) {
        if (!pattern) {
            // Clear all cells
            Object.keys(elements.beatCells).forEach(drum => {
                elements.beatCells[drum].forEach(cell => {
                    cell.classList.remove('active');
                });
            });
            return;
        }

        // Update each drum lane
        Object.keys(pattern.lanes).forEach(drum => {
            pattern.lanes[drum].forEach((beat, index) => {
                const cell = elements.beatCells[drum][index];
                if (cell) {
                    if (beat && beat.active) {
                        cell.classList.add('active');
                    } else {
                        cell.classList.remove('active');
                    }
                }
            });
        });
    }

    /**
     * Callback for each step during playback
     */
    function handleStepCallback(step) {
        // Update current step display
        elements.currentStepDisplay.textContent = `Step: ${step + 1}/16`;

        // Highlight current step in timeline
        updatePlaybackPosition(step);
    }

    /**
     * Update playback position visualization
     */
    function updatePlaybackPosition(step) {
        // Clear previous highlights
        clearCurrentStepHighlight();

        // Highlight current step
        Object.keys(elements.beatCells).forEach(drum => {
            const cell = elements.beatCells[drum][step];
            if (cell) {
                cell.classList.add('current-step');

                // Add pulse animation if active
                if (cell.classList.contains('active')) {
                    cell.classList.add('playing');
                    setTimeout(() => cell.classList.remove('playing'), 300);
                }
            }
        });
    }

    /**
     * Clear current step highlight
     */
    function clearCurrentStepHighlight() {
        Object.keys(elements.beatCells).forEach(drum => {
            elements.beatCells[drum].forEach(cell => {
                cell.classList.remove('current-step');
            });
        });
    }

    /**
     * Update UI state
     */
    function updateUI() {
        // Set initial values
        elements.charCount.textContent = '0 characters';
        elements.syllableCount.textContent = '0';
        elements.beatCount.textContent = '0';
        elements.bpmDisplay.textContent = `${currentBPM} BPM`;
        elements.currentStepDisplay.textContent = 'Step: 1/16';
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
