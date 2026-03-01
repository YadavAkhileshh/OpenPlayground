/**
 * VISUAL ENGINE
 * Handles canvas rendering and UI updates.
 */

class VisualEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = 0;
        this.height = 0;

        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.primaryColor = '#00f2ff';
        this.secondaryColor = '#7000ff';
        this.accentColor = '#ff00ea';

        // Feature: Particles
        this.particles = [];
        this.maxParticles = 50;

        // Feature: Frequency Rain
        this.rainParticles = [];
        this.initRain();

        // Feature: Data Stream
        this.initDataStream();
    }

    initRain() {
        for (let i = 0; i < 30; i++) {
            this.rainParticles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                speed: 1 + Math.random() * 3,
                size: 1 + Math.random() * 2
            });
        }
    }

    updateRain(pitch) {
        const speedMult = pitch > 0 ? (pitch / 1000) : 1;
        this.rainParticles.forEach(p => {
            p.y += p.speed * speedMult;
            if (p.y > this.height) {
                p.y = -10;
                p.x = Math.random() * this.width;
            }

            this.ctx.fillStyle = `rgba(0, 242, 255, ${0.1 * speedMult})`;
            this.ctx.fillRect(p.x, p.y, p.size, p.size * 5);
        });
    }

    updateHue(pitch) {
        if (pitch <= 0) return;
        // Map 500-2500Hz to 180-320 Hue
        const hue = Utils.map(Utils.clamp(pitch, 500, 2500), 500, 2500, 180, 320);
        document.documentElement.style.setProperty('--primary', `hsl(${hue}, 100%, 50%)`);
    }

    initDataStream() {
        this.streamContainer = document.createElement('div');
        this.streamContainer.className = 'data-stream';
        document.body.appendChild(this.streamContainer);
        for (let i = 0; i < 40; i++) {
            const line = document.createElement('div');
            line.textContent = Math.random().toString(16).substring(2, 10).toUpperCase();
            this.streamContainer.appendChild(line);
        }
    }

    updateDataStream(volume) {
        if (Math.random() < 0.1 + (volume * 0.5)) {
            const line = this.streamContainer.firstChild;
            line.textContent = Math.random().toString(16).substring(2, 15).toUpperCase();
            this.streamContainer.appendChild(line);
            this.streamContainer.style.opacity = 0.1 + (volume * 0.3);
        }
    }

    resize() {
        this.width = this.canvas.clientWidth * window.devicePixelRatio;
        this.height = this.canvas.clientHeight * window.devicePixelRatio;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    draw(freqData, pitch) {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw Frequency Bars (modified with dynamic color)
        const primaryHSL = getComputedStyle(document.documentElement).getPropertyValue('--primary');
        const barWidth = (this.width / freqData.length) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < freqData.length; i++) {
            barHeight = (freqData[i] / 255) * this.height;
            this.ctx.fillStyle = primaryHSL.replace(')', ', 0.3)').replace('hsl', 'hsla');
            this.ctx.fillRect(x, this.height - barHeight, barWidth, barHeight);
            x += barWidth + 1;
        }

        // Feature: Frequency Rain
        this.updateRain(pitch);

        // Draw and Update Particles
        this.updateParticles();

        // Draw Pitch Marker
        if (pitch > 0) {
            this.drawPitchMarker(pitch);
        }
    }

    createBurst(x, y, color) {
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1.0,
                decay: 0.02 + Math.random() * 0.05,
                color: color
            });
        }
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.95;
            p.vy *= 0.95;
            p.life -= p.decay;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.life;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalAlpha = 1.0;
        }
    }

    drawPitchMarker(pitch) {
        // Map pitch to canvas X
        // min 500, max 2500
        const normalized = (pitch - 500) / 2000;
        const x = normalized * this.width;

        this.ctx.beginPath();
        this.ctx.strokeStyle = this.accentColor;
        this.ctx.lineWidth = 3;
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, this.height);
        this.ctx.stroke();

        this.ctx.fillStyle = this.accentColor;
        this.ctx.font = 'bold 20px Orbitron';
        this.ctx.fillText(`⌖`, x - 10, 30);
    }

    updateUI(pitch, currentIndex) {
        // Update pitch value text
        const pitchEl = document.getElementById('pitchValue');
        if (pitch > 0) {
            pitchEl.textContent = `${Math.round(pitch)} Hz`;
            pitchEl.style.color = this.primaryColor;
        } else {
            pitchEl.textContent = '--- Hz';
            pitchEl.style.color = 'var(--text-dim)';
        }

        // Update pitch indicator bar
        const indicator = document.getElementById('pitchIndicator');
        if (pitch > 0) {
            const normalized = Math.max(0, Math.min(1, (pitch - 500) / 2000));
            indicator.style.width = '10px';
            indicator.style.left = `${normalized * 100}%`;
            indicator.style.opacity = '1';
        } else {
            indicator.style.opacity = '0';
        }

        // Update Navigation
        this.updateNavigationUI(currentIndex);
    }

    updateNavigationUI(index) {
        const items = document.querySelectorAll('.nav-item');
        const cursor = document.getElementById('navCursor');

        items.forEach((item, i) => {
            if (i === index) {
                item.classList.add('active');
                const rect = item.getBoundingClientRect();
                const containerRect = document.querySelector('.nav-rail').getBoundingClientRect();
                cursor.style.left = `${rect.left - containerRect.left + (rect.width / 2) - 60}px`;
            } else {
                item.classList.remove('active');
            }
        });
    }
}

window.VisualEngine = VisualEngine;
