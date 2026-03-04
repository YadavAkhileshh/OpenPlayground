/**
 * Beat-Grid Logic
 * Handles the sequencer timing loop, UI state, and audio playback.
 */

// --- Configuration & Data ---
// Using raw GitHub content or standard CDNs for audio to ensure it works immediately
const SAMPLES = {
    kick: 'https://cdn.jsdelivr.net/gh/Tonejs/audio/drum-samples/TR-808/kick.mp3',
    snare: 'https://cdn.jsdelivr.net/gh/Tonejs/audio/drum-samples/TR-808/snare.mp3',
    hihat: 'https://cdn.jsdelivr.net/gh/Tonejs/audio/drum-samples/TR-808/closed_hat.mp3',
    clap: 'https://cdn.jsdelivr.net/gh/Tonejs/audio/drum-samples/TR-808/clap.mp3'
};

const TRACKS = ['kick', 'snare', 'hihat', 'clap'];
const STEPS = 16;

// Audio Cache
const audioBuffers = {};

// State
let state = {
    isPlaying: false,
    bpm: 120,
    currentStep: 0,
    grid: {}, // { kick: [0,0,1...], snare: [...] }
    intervalId: null
};

// --- DOM Elements ---
const gridContainer = document.getElementById('grid-container');
const btnPlay = document.getElementById('btn-play');
const btnClear = document.getElementById('btn-clear');
const sliderBpm = document.getElementById('bpm-slider');
const labelBpm = document.getElementById('bpm-val');

// --- Initialization ---

async function init() {
    // 1. Initialize Grid State
    TRACKS.forEach(track => {
        state.grid[track] = Array(STEPS).fill(false);
        // Pre-load Audio
        audioBuffers[track] = new Audio(SAMPLES[track]);
    });

    // 2. Render UI
    renderGrid();

    // 3. Event Listeners
    btnPlay.addEventListener('click', togglePlay);
    btnClear.addEventListener('click', clearGrid);
    
    sliderBpm.addEventListener('input', (e) => {
        state.bpm = parseInt(e.target.value);
        labelBpm.innerText = state.bpm;
        if (state.isPlaying) {
            stopTimer();
            startTimer();
        }
    });

    // Keyboard shortcut
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            togglePlay();
        }
    });
}

// --- Render Logic ---

function renderGrid() {
    gridContainer.innerHTML = '';

    TRACKS.forEach(inst => {
        const row = document.createElement('div');
        row.className = 'track-row';
        row.dataset.inst = inst;

        // Label
        const label = document.createElement('div');
        label.className = 'instrument-label';
        label.innerText = inst;
        row.appendChild(label);

        // Buttons Grid
        const stepsDiv = document.createElement('div');
        stepsDiv.className = 'steps-grid';

        for (let i = 0; i < STEPS; i++) {
            const btn = document.createElement('button');
            btn.className = 'step-btn';
            btn.dataset.step = i;
            btn.dataset.inst = inst;
            
            if (state.grid[inst][i]) btn.classList.add('active');

            btn.addEventListener('click', () => toggleStep(inst, i));
            stepsDiv.appendChild(btn);
        }

        row.appendChild(stepsDiv);
        gridContainer.appendChild(row);
    });
}

function toggleStep(inst, stepIndex) {
    state.grid[inst][stepIndex] = !state.grid[inst][stepIndex];
    
    // Update visual immediately
    const row = document.querySelector(`.track-row[data-inst="${inst}"]`);
    const btn = row.querySelector(`.step-btn[data-step="${stepIndex}"]`);
    btn.classList.toggle('active');
}

// --- Sequencer Engine ---

function togglePlay() {
    state.isPlaying = !state.isPlaying;
    
    const icon = btnPlay.querySelector('i');
    
    if (state.isPlaying) {
        btnPlay.classList.add('playing');
        icon.classList.remove('fa-play');
        icon.classList.add('fa-stop');
        startTimer();
    } else {
        btnPlay.classList.remove('playing');
        icon.classList.remove('fa-stop');
        icon.classList.add('fa-play');
        stopTimer();
        state.currentStep = 0;
        resetVisuals();
    }
}

function startTimer() {
    // Calculate interval: 1 minute / BPM / 4 (for 16th notes)
    // * 1000 for milliseconds
    const interval = (60 / state.bpm) * 1000 / 4;
    
    state.intervalId = setInterval(() => {
        playStep();
    }, interval);
}

function stopTimer() {
    if (state.intervalId) clearInterval(state.intervalId);
}

function playStep() {
    const step = state.currentStep;

    // 1. Visual Update (Clear Prev, Highligh Curr)
    const prevStep = step === 0 ? STEPS - 1 : step - 1;
    
    document.querySelectorAll(`.step-btn[data-step="${prevStep}"]`).forEach(b => b.classList.remove('playing'));
    document.querySelectorAll(`.step-btn[data-step="${step}"]`).forEach(b => b.classList.add('playing'));

    // 2. Audio Trigger
    TRACKS.forEach(inst => {
        if (state.grid[inst][step]) {
            playSound(inst);
        }
    });

    // 3. Advance Step
    state.currentStep = (step + 1) % STEPS;
}

function playSound(inst) {
    // Clone node to allow polyphony (playing same sound fast)
    // Basic Audio() object doesn't handle rapid retrigger well otherwise
    const sound = audioBuffers[inst].cloneNode();
    sound.volume = 0.8;
    sound.play();
}

function resetVisuals() {
    document.querySelectorAll('.step-btn.playing').forEach(b => b.classList.remove('playing'));
}

function clearGrid() {
    TRACKS.forEach(track => {
        state.grid[track] = Array(STEPS).fill(false);
    });
    renderGrid();
    // Keep playing if it was playing, just empty sound
}

// Start
init();