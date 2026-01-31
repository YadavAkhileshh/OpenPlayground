export class Interaction {
    constructor(simulation) {
        this.sim = simulation;
        this.canvas = simulation.canvas;
        this.mode = 'spawn'; // spawn, grab, repel, draw, wind
        this.isMouseDown = false;
        this.mouse = { x: 0, y: 0 };
        this.grabbedEmoji = null;
        this.drawnPath = []; // For 'draw' mode

        this.setupListeners();
    }

    setupListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.handleStart(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMove(e));
        window.addEventListener('mouseup', () => this.handleEnd());

        // Touch events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleStart(e.touches[0]);
        }, { passive: false });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.handleMove(e.touches[0]);
        }, { passive: false });
        window.addEventListener('touchend', () => this.handleEnd());

        // Keyboard shortcuts
        window.addEventListener('keydown', (e) => {
            if (e.key === '1') this.setMode('spawn');
            if (e.key === '2') this.setMode('grab');
            if (e.key === '3') this.setMode('repel');
            if (e.key === '4') this.setMode('draw');
            if (e.key === '5') this.setMode('wind');
            if (e.key === '6') this.setMode('portal');
            if (e.key === ' ') this.sim.clear();
        });
    }

    setMode(mode) {
        this.mode = mode;
        // Update UI ideally
        document.querySelectorAll('.tool-btn').forEach(btn => {
            if (btn.dataset.mode === mode) btn.classList.add('active');
            else btn.classList.remove('active');
        });
    }

    updateMouse(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
    }

    handleStart(e) {
        this.isMouseDown = true;
        this.updateMouse(e);
        this.sim.audio.enable(); // Resume audio context

        if (this.mode === 'spawn') {
            this.sim.spawnEmoji(this.mouse.x, this.mouse.y);
        } else if (this.mode === 'grab') {
            // Find emoji under mouse
            this.grabbedEmoji = this.sim.findEmojiAt(this.mouse.x, this.mouse.y);
        } else if (this.mode === 'draw') {
            this.drawnPath = [{ x: this.mouse.x, y: this.mouse.y }];
        } else if (this.mode === 'portal') {
            if (!this.pendingPortal) {
                this.pendingPortal = { x: this.mouse.x, y: this.mouse.y };
            } else {
                this.sim.portals.addPair(this.pendingPortal.x, this.pendingPortal.y, this.mouse.x, this.mouse.y);
                this.pendingPortal = null;
            }
        }
    }

    handleMove(e) {
        this.updateMouse(e);

        if (!this.isMouseDown) return;

        if (this.mode === 'spawn') {
            // Rate limit spawn handled by main loop or check distance
            if (Math.random() > 0.8) this.sim.spawnEmoji(this.mouse.x, this.mouse.y);
        } else if (this.mode === 'draw') {
            const last = this.drawnPath[this.drawnPath.length - 1];
            const dist = Math.hypot(this.mouse.x - last.x, this.mouse.y - last.y);
            if (dist > 20) {
                // Add persistent wall segment
                this.sim.addWallSegment(last, { x: this.mouse.x, y: this.mouse.y });
                this.drawnPath.push({ x: this.mouse.x, y: this.mouse.y });
            }
        }
    }

    handleEnd() {
        this.isMouseDown = false;
        this.grabbedEmoji = null;
        this.drawnPath = [];
    }

    update(dt) {
        if (!this.isMouseDown) return;

        if (this.mode === 'repel') {
            // Apply force to all emojis
            const strength = 20000; // Increased from 1000
            for (const emoji of this.sim.emojis) {
                const dx = emoji.x - this.mouse.x;
                const dy = emoji.y - this.mouse.y;
                const distSq = dx * dx + dy * dy;
                if (distSq < 200 * 200 && distSq > 1) {
                    const dist = Math.sqrt(distSq);
                    const force = strength / dist; // f = k/r
                    // Push away
                    emoji.vx -= (dx / dist) * force * dt * 0.1;
                    emoji.vy -= (dy / dist) * force * dt * 0.1;
                }
            }
        } else if (this.mode === 'wind') {
            // Upward force in area
            const range = 150;
            for (const emoji of this.sim.emojis) {
                if (Math.abs(emoji.x - this.mouse.x) < range && Math.abs(emoji.y - this.mouse.y) < range) {
                    emoji.vy -= 80 * dt; // Increased from 20
                    emoji.vx += (Math.random() - 0.5) * 20 * dt; // Turbulence
                }
            }
        } else if (this.mode === 'grab' && this.grabbedEmoji) {
            // Spring force to mouse
            const k = 15; // Increased from 5
            const dx = this.mouse.x - this.grabbedEmoji.x;
            const dy = this.mouse.y - this.grabbedEmoji.y;
            this.grabbedEmoji.vx += dx * k * dt;
            this.grabbedEmoji.vy += dy * k * dt;
            this.grabbedEmoji.vx *= 0.8; // More damping to stop oscillation
            this.grabbedEmoji.vy *= 0.8;
        }
    }

    draw(ctx) {
        // Visual feedback for tools
        if (this.isMouseDown) {
            if (this.mode === 'repel' || this.mode === 'wind') {
                ctx.save();
                ctx.strokeStyle = this.mode === 'repel' ? 'rgba(255, 100, 100, 0.3)' : 'rgba(100, 100, 255, 0.3)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(this.mouse.x, this.mouse.y, this.mode === 'repel' ? 200 : 150, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }
        }
    }
}
