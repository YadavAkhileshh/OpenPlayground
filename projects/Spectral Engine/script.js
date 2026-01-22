/**
 * SPECTRAL ENGINE - Audio Visualization Core
 * Uses Web Audio API & Canvas 2D
 */

class AudioVisualizer {
    constructor() {
        this.canvas = document.getElementById('visualizer-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.audioContext = null;
        this.audioSource = null;
        this.analyser = null;
        this.dataArray = null;
        this.isPlaying = false;
        this.animationId = null;
        
        // Configuration
        this.mode = 'circular'; // circular, bars, wave
        this.smoothing = 0.85;
        this.fftSize = 2048;
        
        // Visual Assets
        this.particles = [];
        this.hue = 0;
        
        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // UI Listeners
        document.getElementById('audio-upload').addEventListener('change', (e) => this.handleFileUpload(e));
        
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Update UI
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                // Update State
                this.mode = e.currentTarget.dataset.mode;
            });
        });

        // Controls
        document.getElementById('btn-play').addEventListener('click', () => this.resume());
        document.getElementById('btn-pause').addEventListener('click', () => this.pause());
        document.getElementById('btn-stop').addEventListener('click', () => this.stop());
        
        // Settings
        document.getElementById('smoothing').addEventListener('input', (e) => {
            if(this.analyser) this.analyser.smoothingTimeConstant = parseFloat(e.target.value);
        });
        document.getElementById('fft-size').addEventListener('change', (e) => {
            if(this.analyser) {
                this.analyser.fftSize = parseInt(e.target.value);
                this.bufferLength = this.analyser.frequencyBinCount;
                this.dataArray = new Uint8Array(this.bufferLength);
            }
        });
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        document.getElementById('track-name').innerText = file.name;

        // Init Audio Context (Must be done after user interaction)
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        
        this.playBuffer(audioBuffer);
        this.enableControls();
    }

    playBuffer(buffer) {
        if (this.audioSource) this.audioSource.stop();

        this.audioSource = this.audioContext.createBufferSource();
        this.audioSource.buffer = buffer;

        // Create Analyser
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = this.fftSize;
        this.analyser.smoothingTimeConstant = this.smoothing;

        this.bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);

        // Connect graph: Source -> Analyser -> Destination (Speakers)
        this.audioSource.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);

        this.audioSource.start(0);
        this.isPlaying = true;
        this.renderLoop();
        
        this.audioSource.onended = () => {
            this.isPlaying = false;
            cancelAnimationFrame(this.animationId);
        };
    }

    enableControls() {
        document.getElementById('btn-play').disabled = false;
        document.getElementById('btn-pause').disabled = false;
        document.getElementById('btn-stop').disabled = false;
    }

    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        this.isPlaying = true;
        this.renderLoop();
    }

    pause() {
        this.isPlaying = false;
        cancelAnimationFrame(this.animationId);
        if (this.audioContext) this.audioContext.suspend();
    }

    stop() {
        if (this.audioSource) this.audioSource.stop();
        this.isPlaying = false;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    renderLoop() {
        if (!this.isPlaying) return;

        this.animationId = requestAnimationFrame(() => this.renderLoop());

        // Get Data
        if (this.mode === 'wave') {
            this.analyser.getByteTimeDomainData(this.dataArray);
        } else {
            this.analyser.getByteFrequencyData(this.dataArray);
        }

        // Clear Canvas with fade effect for trails
        this.ctx.fillStyle = 'rgba(5, 5, 5, 0.2)'; 
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Dynamic Hue Shift
        this.hue += 0.5;
        
        // Route to renderer
        if (this.mode === 'circular') this.drawCircular();
        else if (this.mode === 'bars') this.drawBars();
        else if (this.mode === 'wave') this.drawWave();

        this.drawParticles();
    }

    /**
     * RENDERER: CIRCULAR (Radial Spectrum)
     * Complex polar coordinate math required here.
     */
    drawCircular() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) / 3;
        
        // Detect Bass for pulsing effect
        const bass = this.dataArray.slice(0, 10).reduce((a, b) => a + b, 0) / 10;
        const scale = 1 + (bass / 255) * 0.2;
        
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.scale(scale, scale);
        this.ctx.rotate(this.hue * 0.002); // Slow rotation

        const barWidth = (Math.PI * 2) / this.bufferLength;
        
        for (let i = 0; i < this.bufferLength; i++) {
            const barHeight = this.dataArray[i] * 0.8; // Scale height
            
            // Logic: Rotate canvas for each bar
            this.ctx.save();
            this.ctx.rotate(i * barWidth);
            
            const color = `hsl(${(i * 2) + this.hue}, 100%, 50%)`;
            this.ctx.fillStyle = color;
            
            // Draw mirrored bars
            this.ctx.beginPath();
            this.ctx.roundRect(0, radius, 4, barHeight, 5); // Modern RoundRect
            this.ctx.fill();
            
            this.ctx.restore();
            
            // Spawn particles on high treble
            if (i > this.bufferLength * 0.7 && this.dataArray[i] > 200) {
                this.spawnParticle(centerX, centerY, color);
            }
        }
        
        // Center Glow
        this.ctx.beginPath();
        this.ctx.arc(0, 0, radius - 10, 0, Math.PI * 2);
        this.ctx.strokeStyle = `hsl(${this.hue}, 100%, 50%)`;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        this.ctx.restore();
    }

    /**
     * RENDERER: TRADITIONAL BARS
     */
    drawBars() {
        const barWidth = (this.canvas.width / this.bufferLength) * 2.5;
        let x = 0;

        for (let i = 0; i < this.bufferLength; i++) {
            const barHeight = this.dataArray[i] * 2;
            
            const r = barHeight + (25 * (i/this.bufferLength));
            const g = 250 * (i/this.bufferLength);
            const b = 50;

            this.ctx.fillStyle = `rgb(${r},${g},${b})`;
            this.ctx.fillRect(x, this.canvas.height - barHeight, barWidth, barHeight);

            x += barWidth + 1;
        }
    }

    /**
     * RENDERER: OSCILLOSCOPE WAVE
     */
    drawWave() {
        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = `hsl(${this.hue}, 100%, 50%)`;
        this.ctx.beginPath();

        const sliceWidth = this.canvas.width * 1.0 / this.bufferLength;
        let x = 0;

        for (let i = 0; i < this.bufferLength; i++) {
            const v = this.dataArray[i] / 128.0;
            const y = v * this.canvas.height / 2;

            if (i === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);

            x += sliceWidth;
        }

        this.ctx.lineTo(this.canvas.width, this.canvas.height / 2);
        this.ctx.stroke();
    }

    // Particle System for "Complexity" points
    spawnParticle(x, y, color) {
        if (Math.random() > 0.1) return; // Limit spawn rate
        this.particles.push({
            x: (Math.random() - 0.5) * window.innerWidth, // Relative to center
            y: (Math.random() - 0.5) * window.innerHeight,
            size: Math.random() * 3,
            speedX: (Math.random() - 0.5) * 10,
            speedY: (Math.random() - 0.5) * 10,
            color: color,
            life: 1.0
        });
    }

    drawParticles() {
        this.ctx.save();
        this.ctx.translate(this.canvas.width/2, this.canvas.height/2); // Center particles
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();

            p.x += p.speedX;
            p.y += p.speedY;
            p.life -= 0.05;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
                i--;
            }
        }
        this.ctx.restore();
    }
}

// Start Engine
const app = new AudioVisualizer();