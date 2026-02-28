// --- Web Audio API Context ---
let audioCtx;
const statusLight = document.getElementById('engineStatus');

// Initialize Audio Context on first interaction
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        statusLight.innerText = "ENGINE ONLINE";
        statusLight.classList.add('online');
    }
}

// Ensure context runs on first click anywhere
document.body.addEventListener('click', initAudio, { once: true });
document.body.addEventListener('keydown', initAudio, { once: true });

// --- Drum Synthesis Functions ---

function playKick() {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    // Pitch envelope
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.5);
    // Amplitude envelope
    gain.gain.setValueAtTime(1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    osc.start(now);
    osc.stop(now + 0.5);
}

function playSnare() {
    const now = audioCtx.currentTime;
    
    // Noise burst
    const noiseBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.2, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = noiseBuffer;
    
    const noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1000;
    
    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(1, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);

    // Tonal snap
    const osc = audioCtx.createOscillator();
    const oscGain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(250, now);
    oscGain.gain.setValueAtTime(0.5, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.connect(oscGain);
    oscGain.connect(audioCtx.destination);

    noise.start(now);
    osc.start(now);
    osc.stop(now + 0.2);
}

function playHiHat(isOpen) {
    const now = audioCtx.currentTime;
    const duration = isOpen ? 0.4 : 0.1;

    // Create complex metallic noise using oscillators
    const ratios = [1, 1.3420, 1.2312, 1.6532, 1.9523, 2.1523];
    const bandpass = audioCtx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 10000;

    const highpass = audioCtx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 7000;

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(isOpen ? 0.5 : 0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    ratios.forEach(ratio => {
        const osc = audioCtx.createOscillator();
        osc.type = 'square';
        osc.frequency.value = 40 * ratio;
        osc.connect(bandpass);
        osc.start(now);
        osc.stop(now + duration);
    });

    bandpass.connect(highpass);
    highpass.connect(gain);
    gain.connect(audioCtx.destination);
}

function playTom() {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.4);
    
    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    osc.start(now);
    osc.stop(now + 0.4);
}

function playCrash() {
    const now = audioCtx.currentTime;
    const duration = 1.5;

    // Noise generation for crash
    const bufferSize = audioCtx.sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 5000;

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    noise.start(now);
}

// --- Interaction Logic ---

// Router for sounds
function triggerSound(soundType) {
    if (!audioCtx) initAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    switch(soundType) {
        case 'kick': playKick(); break;
        case 'snare': playSnare(); break;
        case 'hihat-closed': playHiHat(false); break;
        case 'hihat-open': playHiHat(true); break;
        case 'tom': playTom(); break;
        case 'crash': playCrash(); break;
    }
}

// Handle Keyboard Input
window.addEventListener('keydown', function(e) {
    const key = document.querySelector(`.key[data-key="${e.keyCode}"]`);
    if (!key) return; // Ignore keys not mapped
    
    // Prevent auto-repeat holding down key
    if (e.repeat) return;
    
    const soundType = key.getAttribute('data-sound');
    triggerSound(soundType);
    
    key.classList.add('playing');
});

// Handle Mouse/Touch Input
const pads = document.querySelectorAll('.key');
pads.forEach(pad => {
    pad.addEventListener('mousedown', function() {
        const soundType = this.getAttribute('data-sound');
        triggerSound(soundType);
        this.classList.add('playing');
    });
});

// Remove CSS animation class after it completes
function removeTransition(e) {
    if (e.propertyName !== 'transform') return; 
    this.classList.remove('playing');
}

pads.forEach(pad => pad.addEventListener('transitionend', removeTransition));