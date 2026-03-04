import { Utils, CONSTANTS } from './utils.js';

class UIManager {
    constructor() {
        this.el = {
            startBtn: document.getElementById('start-btn'),
            btnText: document.querySelector('.btn-text'),
            status: document.getElementById('status-indicator'),
            meter: document.getElementById('amplitude-fill'),
            marker: document.getElementById('threshold-marker'),
            slider: document.getElementById('sensitivity-slider'),
            val: document.getElementById('threshold-value'),
            flash: document.getElementById('flash-overlay'),
            waveformCanvas: document.getElementById('waveform-canvas'),
            lightningCanvas: document.getElementById('lightning-canvas')
        };

        this.wCtx = this.el.waveformCanvas?.getContext('2d');
        this.lCtx = this.el.lightningCanvas?.getContext('2d');

        this.setupCanvases();
    }

    setupCanvases() {
        const resize = () => {
            const dpr = window.devicePixelRatio || 1;

            // Waveform Canvas
            if (this.el.waveformCanvas) {
                const wRect = this.el.waveformCanvas.parentElement.getBoundingClientRect();
                this.el.waveformCanvas.width = wRect.width * dpr;
                this.el.waveformCanvas.height = 100 * dpr;
                this.wCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
            }

            // Lightning Canvas
            if (this.el.lightningCanvas) {
                this.el.lightningCanvas.width = window.innerWidth * dpr;
                this.el.lightningCanvas.height = window.innerHeight * dpr;
                this.lCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
            }
        };

        window.addEventListener('resize', resize);
        resize();
    }

    updateStatus(active) {
        const { status, btnText, startBtn } = this.el;
        status.textContent = active ? 'SYSTEM ACTIVE' : 'SYSTEM OFFLINE';
        status.className = `status-badge ${active ? 'active' : 'inactive'}`;
        btnText.textContent = active ? 'STOP LISTENING' : 'INITIALIZE SYSTEM';
        startBtn.classList.toggle('active-state', active);
    }

    updateMeter(amp) {
        const pct = amp * 100;
        this.el.meter.style.width = `${pct}%`;
        this.el.meter.parentElement.style.boxShadow = amp > 0.8 ? '0 0 15px rgba(255,255,255,0.2)' : 'none';
    }

    updateThreshold(v) {
        const pct = Utils.formatPct(v);
        this.el.marker.style.left = pct;
        this.el.val.textContent = pct;
    }

    drawWaveform(timeData) {
        if (!this.wCtx) return;
        const { width, height } = this.el.waveformCanvas.getBoundingClientRect();

        this.wCtx.clearRect(0, 0, width, height);
        this.wCtx.beginPath();
        this.wCtx.strokeStyle = 'rgba(0, 212, 255, 0.5)';
        this.wCtx.lineWidth = 2;

        const sliceWidth = width / timeData.length;
        let x = 0;

        for (let i = 0; i < timeData.length; i++) {
            const v = timeData[i] / 128.0;
            const y = v * height / 2;
            if (i === 0) this.wCtx.moveTo(x, y);
            else this.wCtx.lineTo(x, y);
            x += sliceWidth;
        }
        this.wCtx.stroke();
    }

    drawLightning(segments, opacity = 1) {
        if (!this.lCtx) return;
        this.lCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        this.lCtx.beginPath();
        this.lCtx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
        this.lCtx.lineWidth = 3;
        this.lCtx.lineCap = 'round';
        this.lCtx.lineJoin = 'round';

        segments.forEach((seg, i) => {
            if (i === 0) this.lCtx.moveTo(seg.x1, seg.y1);
            this.lCtx.lineTo(seg.x2, seg.y2);
        });

        this.lCtx.stroke();

        // Secondary glow layer
        this.lCtx.strokeStyle = `rgba(0, 212, 255, ${opacity * 0.5})`;
        this.lCtx.lineWidth = 8;
        this.lCtx.stroke();
    }

    clearLightning() {
        if (!this.lCtx) return;
        this.lCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }

    triggerFlash() {
        const f = this.el.flash;
        f.classList.remove('active', 'hidden');
        void f.offsetWidth;
        f.classList.add('active');

        document.body.style.backgroundColor = '#111';
        setTimeout(() => document.body.style.backgroundColor = '', 1000);
    }

    bind(handlers) {
        this.el.slider.addEventListener('input', (e) => {
            const v = e.target.value / 100;
            this.updateThreshold(v);
            handlers.onThreshold(v);
        });

        this.el.startBtn.addEventListener('click', handlers.onToggle);
        this.updateThreshold(CONSTANTS.DEFAULT_THRESHOLD);
    }
}

export const UI = new UIManager();
