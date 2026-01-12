/**
 * Sound Reaction System
 * Independent module for calibrated audio interaction
 */

// State
let audioContext;
let analyser;
let micStream;
let isCalibrating = false;
let isMonitoring = false;
let backgroundNoiseLevel = 0;
let currentDb = 0;

// Configuration
const CALIBRATION_DURATION = 3000; // 3 seconds
const METER_UPDATE_INTERVAL = 50;  // 20fps for meter
const SMOOTHING = 0.8;             // Audio smoothing

// DOM Elements
const startBtn = document.getElementById('start-btn');
const calibrationPanel = document.querySelector('.calibration-panel');
const progressEl = document.getElementById('calibration-progress');
const progressFill = document.querySelector('.progress-fill');
const monitorPanel = document.getElementById('monitor-panel');
const statusText = document.getElementById('status-text');
const statusIcon = document.querySelector('.status-indicator i');

const audioMeter = document.getElementById('audio-meter');
const dbValue = document.getElementById('db-value');
const thresholdMarker = document.getElementById('threshold-marker');
const sensitivityInput = document.getElementById('sensitivity');

const reactionTarget = document.getElementById('reaction-target');
const reactionText = document.getElementById('reaction-text');

// Initialize
startBtn.addEventListener('click', async () => {
    try {
        if (!audioContext) {
            await initAudio();
        }
        startCalibration();
    } catch (err) {
        console.error('Microphone access denied:', err);
        statusText.textContent = 'Access Denied. Please allow microphone.';
        statusText.style.color = 'var(--danger)';
    }
});

sensitivityInput.addEventListener('input', updateThresholdUI);

async function initAudio() {
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(micStream);

    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = SMOOTHING;
    source.connect(analyser);

    statusText.textContent = 'Microphone Active';
    statusText.style.color = 'var(--success)';
    statusIcon.className = 'ri-mic-line';
    statusIcon.style.color = 'var(--success)';
}

function startCalibration() {
    isCalibrating = true;
    startBtn.classList.add('hidden');
    progressEl.classList.remove('hidden');
    progressFill.style.width = '0%';

    // Trigger animation
    setTimeout(() => {
        progressFill.style.width = '100%';
    }, 100);

    let samples = [];
    const startTime = Date.now();

    const calibrationLoop = () => {
        if (Date.now() - startTime < CALIBRATION_DURATION) {
            samples.push(getVolume());
            requestAnimationFrame(calibrationLoop);
        } else {
            finishCalibration(samples);
        }
    };
    calibrationLoop();
}

function finishCalibration(samples) {
    isCalibrating = false;

    // Calculate average noise floor
    const sum = samples.reduce((a, b) => a + b, 0);
    backgroundNoiseLevel = sum / samples.length;

    // Fallback if silent
    if (backgroundNoiseLevel < 5) backgroundNoiseLevel = 5;

    // UI Updates
    progressEl.classList.add('hidden');
    monitorPanel.classList.remove('hidden');

    updateThresholdUI();
    startMonitoring();
}

function startMonitoring() {
    isMonitoring = true;

    const loop = () => {
        if (!isMonitoring) return;

        const volume = getVolume();
        currentDb = Math.round(volume);

        // Update Meter
        audioMeter.style.width = Math.min(volume, 100) + '%';
        dbValue.textContent = currentDb + ' dB';

        // Check Threshold
        const sensitivity = parseInt(sensitivityInput.value);
        // Logic: Lower sensitivity value = Higher threshold needed (harder to trigger)
        // High sensitivity (100) -> Threshold is close to noise floor
        // Low sensitivity (1) -> Threshold is far above noise floor

        // Multiplier: 100 sensitivity = 1.2x noise (very sensitive)
        // 1 sensitivity = 5.0x noise (needs loud sound)
        const multiplier = 5 - (sensitivity / 100 * 3.8);
        const threshold = backgroundNoiseLevel * multiplier;

        // Ensure threshold is at least visible on meter
        const visualThreshold = Math.min(Math.max(threshold, 0), 100);

        if (volume > threshold) {
            triggerReaction();
        } else {
            resetReaction();
        }

        requestAnimationFrame(loop);
    };
    loop();
}

// Visual updates
function updateThresholdUI() {
    const sensitivity = parseInt(sensitivityInput.value);
    const multiplier = 5 - (sensitivity / 100 * 3.8);
    const threshold = backgroundNoiseLevel * multiplier;

    // Update marker position
    thresholdMarker.style.left = Math.min(threshold, 100) + '%';
}

let reactionTimeout;
function triggerReaction() {
    if (reactionTarget.classList.contains('active')) return;

    reactionTarget.classList.add('active');
    reactionText.textContent = "Sound Detected! 🎉";

    clearTimeout(reactionTimeout);
    reactionTimeout = setTimeout(() => {
        resetReaction();
    }, 500); // Debounce visual
}

function resetReaction() {
    // Only remove if enough time passed or silence returns? 
    // Actually relying on timeout above for smoother pulsing
    // But we permit re-trigger logic here if needed
    if (Date.now() % 100 === 0) { // Check periodically to confirm silence
        // reactionTarget.classList.remove('active');
    }
}

// Timeout handler handles the reset to prevent flickering
reactionTarget.addEventListener('transitionend', () => {
    if (currentDb < (backgroundNoiseLevel)) {
        // Optional: instantaneous reset logic
    }
});

// Helper: Get volume (Root Mean Square)
function getVolume() {
    const array = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(array);

    let values = 0;
    for (let i = 0; i < array.length; i++) {
        values += array[i];
    }

    // Scale 0-255 to approx 0-100 relative range
    return (values / array.length) * (100 / 255) * 3; // *3 boosting low inputs
}
