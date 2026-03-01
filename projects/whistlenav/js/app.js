/**
 * MAIN APP CONTROLLER
 */

class WhistleNavApp {
    constructor() {
        this.audio = new AudioEngine();
        this.nav = new NavEngine();
        this.visuals = new VisualEngine('frequencyCanvas');

        this.isRunning = false;
        this.initEventListeners();
    }

    initEventListeners() {
        const startBtn = document.getElementById('startBtn');
        startBtn.addEventListener('click', () => this.toggleApp());

        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                this.nav.setIndex(index);
            });
        });

        this.nav.onMove = (index) => {
            this.visuals.updateNavigationUI(index);
            this.playFeedbackSound(index);
            this.triggerGlitch();
            this.triggerBurst(index);
            this.triggerRipple();
            this.updateGhostTrails(index);
        };

        this.nav.onSustain = (zone) => {
            console.log("Sustain Triggered!", zone);
            const items = document.querySelectorAll('.nav-item');
            const activeText = items[this.nav.currentIndex].querySelector('.text').textContent;
            this.triggerSustainEffect();
            this.speak(`Activating ${activeText} module`);
        };

        this.initCalibration();
        this.synth = window.speechSynthesis;
    }

    speak(text) {
        if (!this.synth) return;
        this.synth.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.pitch = 0.5; // Futuristic low robotic voice
        utter.rate = 1.2;
        this.synth.speak(utter);
    }

    triggerRipple() {
        const container = document.getElementById('rippleContainer');
        const ripple = document.createElement('div');
        ripple.className = 'sonic-ripple ripple-active';
        container.appendChild(ripple);
        setTimeout(() => ripple.remove(), 1000);
    }

    updateGhostTrails(index) {
        const items = document.querySelectorAll('.nav-item');
        const rect = items[index].getBoundingClientRect();
        const containerRect = document.querySelector('.nav-rail').getBoundingClientRect();
        const left = rect.left - containerRect.left + (rect.width / 2) - 60;

        setTimeout(() => {
            document.getElementById('navCursorGhost1').style.left = `${left}px`;
        }, 50);
        setTimeout(() => {
            document.getElementById('navCursorGhost2').style.left = `${left}px`;
        }, 100);
    }

    initCalibration() {
        this.calState = { recording: null, lowFrequencies: [], highFrequencies: [] };

        const lowBtn = document.getElementById('calLowBtn');
        const highBtn = document.getElementById('calHighBtn');
        const status = document.getElementById('calStatus');

        const toggleRec = (type) => {
            if (this.calState.recording === type) {
                this.calState.recording = null;
                lowBtn.classList.remove('recording');
                highBtn.classList.remove('recording');
                status.textContent = "CALIBRATION UPDATED";

                // Finalize ranges
                const avg = (arr) => arr.length ? arr.reduce((a, b) => a + b) / arr.length : (type === 'LOW' ? 800 : 1800);
                if (type === 'LOW') {
                    const lowVal = avg(this.calState.lowFrequencies);
                    this.nav.lowRange = [lowVal - 200, lowVal + 200];
                } else {
                    const highVal = avg(this.calState.highFrequencies);
                    this.nav.highRange = [highVal - 200, highVal + 200];
                }
            } else {
                this.calState.recording = type;
                if (type === 'LOW') {
                    lowBtn.classList.add('recording');
                    highBtn.classList.remove('recording');
                    this.calState.lowFrequencies = [];
                } else {
                    highBtn.classList.add('recording');
                    lowBtn.classList.remove('recording');
                    this.calState.highFrequencies = [];
                }
                status.textContent = `WHISTLE ${type} FREQUENCY...`;
            }
        };

        lowBtn.onclick = () => toggleRec('LOW');
        highBtn.onclick = () => toggleRec('HIGH');
    }

    triggerGlitch() {
        const app = document.getElementById('app');
        app.classList.add('glitch-flash');
        setTimeout(() => app.classList.remove('glitch-flash'), 200);
    }

    triggerBurst(index) {
        const items = document.querySelectorAll('.nav-item');
        const rect = items[index].getBoundingClientRect();
        this.visuals.createBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 'var(--primary)');
    }

    triggerSustainEffect() {
        const cursor = document.getElementById('navCursor');
        cursor.style.transform = 'translateY(-50%) scale(1.5)';
        cursor.style.borderColor = 'var(--accent)';
        setTimeout(() => {
            cursor.style.transform = 'translateY(-50%) scale(1)';
            cursor.style.borderColor = 'var(--primary)';
        }, 500);
    }

    async toggleApp() {
        if (!this.isRunning) {
            const success = await this.audio.initialize();
            if (success) {
                this.isRunning = true;
                document.getElementById('startBtn').textContent = 'TERMINATE LINK';
                document.getElementById('statusMessage').classList.add('hidden');
                this.loop();
            } else {
                alert("Microphone access is required for WhistleNav to function.");
            }
        } else {
            location.reload(); // Simple way to stop everything for this demo
        }
    }

    loop() {
        if (!this.isRunning) return;

        const freqData = this.audio.getFrequencyData();
        const pitch = this.audio.getPitch();

        // Process logic
        if (pitch > 0) {
            this.nav.processPitch(pitch);
            this.visuals.updateHue(pitch); // Feature: Real-time Hue

            // Handle calibration recording
            if (this.calState.recording === 'LOW') this.calState.lowFrequencies.push(pitch);
            if (this.calState.recording === 'HIGH') this.calState.highFrequencies.push(pitch);
        }

        // Render
        const rms = this.audio.getRMS();
        this.visuals.updateDataStream(rms);

        this.visuals.draw(freqData, pitch);
        this.visuals.updateUI(pitch, this.nav.currentIndex);

        requestAnimationFrame(() => this.loop());
    }

    playFeedbackSound(index) {
        // Subtle UI feedback using Web Audio oscillating if desired
        if (!this.audio.audioCtx) return;

        const osc = this.audio.audioCtx.createOscillator();
        const gain = this.audio.audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(440 + (index * 100), this.audio.audioCtx.currentTime);

        gain.gain.setValueAtTime(0.1, this.audio.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audio.audioCtx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(this.audio.audioCtx.destination);

        osc.start();
        osc.stop(this.audio.audioCtx.currentTime + 0.1);
    }
}

// Initialize on load
window.addEventListener('load', () => {
    window.app = new WhistleNavApp();
});
