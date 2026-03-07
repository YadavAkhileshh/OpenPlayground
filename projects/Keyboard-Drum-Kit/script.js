/**
 * Keyboard Drum Kit - Interactive Drum Machine
 * Uses Web Audio API to create drum sounds triggered by keyboard input
 */

// Drum kit configuration
const drumPads = [
    { key: 'Q', name: 'Kick', frequency: 60, type: 'sine', duration: 0.3 },
    { key: 'W', name: 'Snare', frequency: 200, type: 'square', duration: 0.2 },
    { key: 'E', name: 'Hi-Hat', frequency: 8000, type: 'sawtooth', duration: 0.1 },
    { key: 'R', name: 'Tom', frequency: 150, type: 'triangle', duration: 0.25 },
    { key: 'A', name: 'Clap', frequency: 1000, type: 'square', duration: 0.15 },
    { key: 'S', name: 'Cymbal', frequency: 5000, type: 'sawtooth', duration: 0.4 },
    { key: 'D', name: 'Perc', frequency: 300, type: 'triangle', duration: 0.2 },
    { key: 'F', name: 'Bass', frequency: 40, type: 'sine', duration: 0.5 }
];

// Web Audio API setup
let audioContext;
let isAudioInitialized = false;

// Initialize Web Audio API
function initAudio() {
    if (!isAudioInitialized) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            isAudioInitialized = true;
            console.log('🎵 Audio context initialized');
        } catch (error) {
            console.error('❌ Web Audio API not supported:', error);
            alert('Your browser does not support Web Audio API. Please use a modern browser.');
        }
    }
}

// Create drum sound using Web Audio API
function playDrum(frequency, type, duration = 0.2) {
    if (!audioContext) {
        console.warn('⚠️ Audio context not initialized');
        return;
    }

    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const filterNode = audioContext.createBiquadFilter();

        // Connect nodes: oscillator -> filter -> gain -> destination
        oscillator.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Configure oscillator
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = type;

        // Configure filter for more realistic sound
        filterNode.type = 'lowpass';
        filterNode.frequency.setValueAtTime(frequency * 2, audioContext.currentTime);

        // Create envelope for natural sound decay
        const attackTime = 0.01;
        const decayTime = duration * 0.3;
        const sustainLevel = 0.3;
        const releaseTime = duration * 0.7;

        const currentTime = audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, currentTime);
        gainNode.gain.linearRampToValueAtTime(sustainLevel, currentTime + attackTime);
        gainNode.gain.setValueAtTime(sustainLevel, currentTime + attackTime + decayTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + duration);

        // Add some noise for certain drum types
        if (type === 'sawtooth' || type === 'square') {
            addNoise(gainNode, duration, currentTime);
        }

        oscillator.start(currentTime);
        oscillator.stop(currentTime + duration);

    } catch (error) {
        console.error('❌ Error playing drum sound:', error);
    }
}

// Add noise component for more realistic cymbals and hi-hats
function addNoise(gainNode, duration, startTime) {
    try {
        const bufferSize = audioContext.sampleRate * duration;
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const output = buffer.getChannelData(0);

        // Generate white noise
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const noiseSource = audioContext.createBufferSource();
        const noiseGain = audioContext.createGain();
        const noiseFilter = audioContext.createBiquadFilter();

        noiseSource.buffer = buffer;
        noiseSource.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(gainNode);

        noiseFilter.type = 'highpass';
        noiseFilter.frequency.setValueAtTime(2000, startTime);

        noiseGain.gain.setValueAtTime(0.1, startTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        noiseSource.start(startTime);
        noiseSource.stop(startTime + duration);

    } catch (error) {
        console.warn('⚠️ Could not add noise component:', error);
    }
}

// Create drum pad elements
function createDrumPads() {
    const drumKit = document.getElementById('drumKit');

    drumPads.forEach(pad => {
        const padElement = document.createElement('div');
        padElement.className = 'drum-pad';
        padElement.dataset.key = pad.key;
        padElement.setAttribute('role', 'button');
        padElement.setAttribute('tabindex', '0');
        padElement.setAttribute('aria-label', `Play ${pad.name} drum (Press ${pad.key})`);

        padElement.innerHTML = `
            <div class="key">${pad.key}</div>
            <div class="name">${pad.name}</div>
        `;

        // Add click event
        padElement.addEventListener('click', () => {
            playSound(pad);
        });

        // Add keyboard event for accessibility
        padElement.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                playSound(pad);
            }
        });

        drumKit.appendChild(padElement);
    });
}

// Play sound and animate pad
function playSound(pad) {
    // Initialize audio on first interaction
    initAudio();

    // Play the sound
    playDrum(pad.frequency, pad.type, pad.duration);

    // Animate the pad
    const padElement = document.querySelector(`[data-key="${pad.key}"]`);
    if (padElement) {
        padElement.classList.add('active', 'playing');

        // Remove active class after animation
        setTimeout(() => {
            padElement.classList.remove('active');
        }, 150);

        // Remove playing class after full animation
        setTimeout(() => {
            padElement.classList.remove('playing');
        }, 500);
    }

    // Log the action for debugging
    console.log(`🥁 Played ${pad.name} (${pad.key})`);
}

// Keyboard event handler
function handleKeyPress(event) {
    const key = event.key.toUpperCase();

    // Find the corresponding drum pad
    const pad = drumPads.find(p => p.key === key);

    if (pad) {
        event.preventDefault();
        playSound(pad);
    }
}

// Initialize the drum kit
function init() {
    console.log('🎼 Initializing Keyboard Drum Kit...');

    createDrumPads();

    // Add keyboard event listener
    document.addEventListener('keydown', handleKeyPress);

    // Initialize audio on first user interaction (required by browsers)
    const initAudioOnInteraction = () => {
        initAudio();
        document.removeEventListener('click', initAudioOnInteraction);
        document.removeEventListener('keydown', initAudioOnInteraction);
    };

    document.addEventListener('click', initAudioOnInteraction);
    document.addEventListener('keydown', initAudioOnInteraction);

    // Add visual feedback for key presses
    document.addEventListener('keydown', (event) => {
        const key = event.key.toUpperCase();
        const padElement = document.querySelector(`[data-key="${key}"]`);

        if (padElement) {
            // Add a subtle glow effect
            padElement.style.boxShadow = '0 0 30px rgba(255,255,255,0.8), inset 0 0 20px rgba(255,255,255,0.2)';

            setTimeout(() => {
                padElement.style.boxShadow = '';
            }, 300);
        }
    });

    console.log('✅ Keyboard Drum Kit ready! Press Q, W, E, R, A, S, D, F to play drums.');
}

// Performance monitoring
let lastPlayTime = 0;
const playHistory = [];

// Track performance
function trackPerformance() {
    const now = Date.now();
    const timeSinceLastPlay = now - lastPlayTime;

    if (timeSinceLastPlay < 50) {
        console.warn('⚡ Rapid drum hits detected - may cause audio clipping');
    }

    playHistory.push(now);
    // Keep only last 10 plays
    if (playHistory.length > 10) {
        playHistory.shift();
    }

    lastPlayTime = now;
}

// Enhanced play function with performance tracking
const originalPlaySound = playSound;
playSound = function(pad) {
    trackPerformance();
    return originalPlaySound.call(this, pad);
};

// Add some fun features
function addFunFeatures() {
    // Easter egg: Konami code for special effect
    let konamiCode = [];
    const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];

    document.addEventListener('keydown', (event) => {
        konamiCode.push(event.code);

        if (konamiCode.length > konamiSequence.length) {
            konamiCode.shift();
        }

        if (JSON.stringify(konamiCode) === JSON.stringify(konamiSequence)) {
            console.log('🎉 Konami Code activated! Special drum mode enabled.');
            document.body.style.animation = 'hue-rotate 2s infinite linear';
            setTimeout(() => {
                document.body.style.animation = '';
            }, 10000);
        }
    });

    // Add BPM counter for rhythm analysis
    let beatCount = 0;
    let lastBeatTime = 0;

    window.getCurrentBPM = function() {
        if (playHistory.length < 2) return 0;

        const intervals = [];
        for (let i = 1; i < playHistory.length; i++) {
            intervals.push(playHistory[i] - playHistory[i-1]);
        }

        const avgInterval = intervals.reduce((a, b) => a + b) / intervals.length;
        return Math.round(60000 / avgInterval);
    };
}

// Start the application
document.addEventListener('DOMContentLoaded', () => {
    init();
    addFunFeatures();
});

// Export for potential use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        playDrum,
        drumPads,
        initAudio
    };
}