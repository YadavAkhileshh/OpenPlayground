/**
 * @file PerformanceMonitor.js
 * @description Tracks and displays detailed performance metrics.
 */

export class PerformanceMonitor {
    constructor(uiController) {
        this.ui = uiController;
        this.metrics = {
            fps: 0,
            frameTime: 0,
            renderTime: 0,
            processTime: 0,
            scanTime: 0,
            dropsActive: 0
        };

        this.history = {
            fps: new Array(60).fill(0)
        };

        this.lastTime = performance.now();
        this.frames = 0;

        // Debug overlay creation
        this.createOverlay();
    }

    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'debug-overlay hidden';
        this.overlay.innerHTML = \`
            <h3>SYSTEM DIAGNOSTICS</h3>
            <div class="metric-row"><span>FPS:</span> <span id="dbg-fps">0</span></div>
            <div class="metric-row"><span>Frame Time:</span> <span id="dbg-ft">0ms</span></div>
            <div class="metric-row"><span>Render:</span> <span id="dbg-rt">0ms</span></div>
            <div class="metric-row"><span>Processing:</span> <span id="dbg-pt">0ms</span></div>
            <div class="metric-row"><span>Entities:</span> <span id="dbg-ent">0</span></div>
            <canvas id="perf-graph" width="200" height="50"></canvas>
        \`;
        document.getElementById('ui-layer').appendChild(this.overlay);
        
        this.graphCtx = this.overlay.querySelector('#perf-graph').getContext('2d');
        
        // Toggle with key 'D'
        window.addEventListener('keydown', (e) => {
            if (e.key === 'd' || e.key === 'D') {
                this.overlay.classList.toggle('hidden');
            }
        });
    }

    startFrame() {
        this.frameStart = performance.now();
    }

    markProcessStart() {
        this.processStart = performance.now();
    }

    markProcessEnd() {
        this.processEnd = performance.now();
        this.metrics.processTime = this.processEnd - this.processStart;
    }

    markRenderStart() {
        this.renderStart = performance.now();
    }

    markRenderEnd(entityCount) {
        this.renderEnd = performance.now();
        this.metrics.renderTime = this.renderEnd - this.renderStart;
        this.metrics.frameTime = this.renderEnd - this.frameStart;
        this.metrics.dropsActive = entityCount || 0;
        
        this.update();
    }

    update() {
        this.frames++;
        const now = performance.now();
        
        if (now - this.lastTime >= 1000) {
            this.metrics.fps = this.frames;
            this.frames = 0;
            this.lastTime = now;
            
            this.updateDisplay();
            this.updateGraph();
        }
    }

    updateDisplay() {
        if (this.overlay.classList.contains('hidden')) return;

        const setText = (id, val) => {
            const el = this.overlay.querySelector(id);
            if (el) el.textContent = val;
        };

        setText('#dbg-fps', this.metrics.fps);
        setText('#dbg-ft', this.metrics.frameTime.toFixed(2) + 'ms');
        setText('#dbg-rt', this.metrics.renderTime.toFixed(2) + 'ms');
        setText('#dbg-pt', this.metrics.processTime.toFixed(2) + 'ms');
        setText('#dbg-ent', this.metrics.dropsActive);
    }

    updateGraph() {
        if (this.overlay.classList.contains('hidden')) return;
        
        // Push new value
        this.history.fps.shift();
        this.history.fps.push(this.metrics.fps);

        // Draw graph
        const ctx = this.graphCtx;
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = 'rgba(0, 50, 0, 0.5)';
        ctx.fillRect(0, 0, width, height);
        
        ctx.strokeStyle = '#0f0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        const step = width / this.history.fps.length;
        
        this.history.fps.forEach((val, i) => {
            const h = (val / 60) * height;
            const y = height - h;
            const x = i * step;
            
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        
        ctx.stroke();
    }
}
