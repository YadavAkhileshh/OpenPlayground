const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioContext = null;
let masterGain = null;
let isMuted = false;

function initAudio() {
    if (!audioContext) {
        audioContext = new AudioContext();
        masterGain = audioContext.createGain();
        masterGain.connect(audioContext.destination);
        masterGain.gain.value = 0.3;
    }
}

function playPerfectHitSound() {
    if (!audioContext || isMuted) return;

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.connect(gain);
    gain.connect(masterGain);

    osc.frequency.setValueAtTime(880, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1320, audioContext.currentTime + 0.1);

    gain.gain.setValueAtTime(0.4, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

    osc.type = 'sine';
    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + 0.15);
}

function playGoodHitSound() {
    if (!audioContext || isMuted) return;

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.connect(gain);
    gain.connect(masterGain);

    osc.frequency.setValueAtTime(660, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.08);

    gain.gain.setValueAtTime(0.3, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.12);

    osc.type = 'sine';
    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + 0.12);
}

function playMissSound() {
    if (!audioContext || isMuted) return;

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.connect(gain);
    gain.connect(masterGain);

    osc.frequency.setValueAtTime(220, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, audioContext.currentTime + 0.2);

    gain.gain.setValueAtTime(0.25, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    osc.type = 'sawtooth';
    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + 0.2);
}

function playComboSound(comboCount) {
    if (!audioContext || isMuted) return;

    const baseFreq = 440 + (comboCount * 20);
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.connect(gain);
    gain.connect(masterGain);

    osc.frequency.setValueAtTime(baseFreq, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, audioContext.currentTime + 0.05);

    gain.gain.setValueAtTime(0.2, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    osc.type = 'triangle';
    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + 0.1);
}

function playMilestoneSound() {
    if (!audioContext || isMuted) return;

    const frequencies = [523.25, 659.25, 783.99, 1046.50];

    frequencies.forEach((freq, index) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.connect(gain);
        gain.connect(masterGain);

        const startTime = audioContext.currentTime + (index * 0.08);

        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

        osc.type = 'sine';
        osc.start(startTime);
        osc.stop(startTime + 0.2);
    });
}

function playStreakSound() {
    if (!audioContext || isMuted) return;

    const osc1 = audioContext.createOscillator();
    const osc2 = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(masterGain);

    osc1.frequency.setValueAtTime(440, audioContext.currentTime);
    osc2.frequency.setValueAtTime(554.37, audioContext.currentTime);

    gain.gain.setValueAtTime(0.15, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    osc1.type = 'sine';
    osc2.type = 'sine';

    osc1.start(audioContext.currentTime);
    osc2.start(audioContext.currentTime);
    osc1.stop(audioContext.currentTime + 0.3);
    osc2.stop(audioContext.currentTime + 0.3);
}

function playGameStartSound() {
    if (!audioContext || isMuted) return;

    const frequencies = [261.63, 329.63, 392.00, 523.25];

    frequencies.forEach((freq, index) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.connect(gain);
        gain.connect(masterGain);

        const startTime = audioContext.currentTime + (index * 0.1);

        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);

        osc.type = 'triangle';
        osc.start(startTime);
        osc.stop(startTime + 0.15);
    });
}

function playGameOverSound() {
    if (!audioContext || isMuted) return;

    const frequencies = [392.00, 329.63, 261.63, 196.00];

    frequencies.forEach((freq, index) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.connect(gain);
        gain.connect(masterGain);

        const startTime = audioContext.currentTime + (index * 0.15);

        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

        osc.type = 'sawtooth';
        osc.start(startTime);
        osc.stop(startTime + 0.3);
    });
}

function toggleMute() {
    isMuted = !isMuted;
    return isMuted;
}

function setVolume(volume) {
    if (masterGain) {
        masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
}
