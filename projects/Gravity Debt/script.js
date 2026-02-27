/**
 * Gravity Debt - Main Game Script
 * Version: 2.0 (Scale-Up)
 * 
 * Overview:
 * This script handles the entire game logic for Gravity Debt.
 * It includes a custom physics engine, particle system, audio synthesizer,
 * and procedural generation algorithms.
 */

// ==========================================
// 1. UTILITIES & MATH LIBRARY
// ==========================================

/**
 * A handy Math utility class for Vector operations.
 */
class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(v) {
        return new Vector2(this.x + v.x, this.y + v.y);
    }

    sub(v) {
        return new Vector2(this.x - v.x, this.y - v.y);
    }

    mult(n) {
        return new Vector2(this.x * n, this.y * n);
    }

    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        const m = this.mag();
        if (m === 0) return new Vector2(0, 0);
        return new Vector2(this.x / m, this.y / m);
    }

    copy() {
        return new Vector2(this.x, this.y);
    }
}

/**
 * Random number generator utilities.
 */
const RNG = {
    range: (min, max) => Math.random() * (max - min) + min,
    rangeInt: (min, max) => Math.floor(Math.random() * (max - min + 1) + min),
    chance: (percent) => Math.random() < percent,
    pick: (arr) => arr[Math.floor(Math.random() * arr.length)]
};

// ==========================================
// 2. AUDIO SYSTEM (WEB AUDIO API)
// ==========================================

class AudioSynth {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
        this.volume = 0.5;
        this.masterGain.gain.value = this.volume;
        this.enabled = true;
    }

    setVolume(val) {
        this.volume = Math.max(0, Math.min(1, val));
        this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.1);
    }

    resume() {
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    /**
     * Play a sound based on type.
     * @param {string} type - 'jump', 'land', 'coin', 'death', 'win'
     */
    play(type) {
        if (!this.enabled) return;
        this.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.masterGain);

        const now = this.ctx.currentTime;

        switch (type) {
            case 'jump':
                osc.type = 'square';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;

            case 'land':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(50, now);
                osc.frequency.exponentialRampToValueAtTime(20, now + 0.1);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;

            case 'orb':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.linearRampToValueAtTime(1200, now + 0.1);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
                break;

            case 'gravity_up':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(100, now);
                osc.frequency.linearRampToValueAtTime(80, now + 0.2);
                gain.gain.setValueAtTime(0.05, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
                break;

            case 'death':
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(100, now);
                osc.frequency.exponentialRampToValueAtTime(10, now + 0.5);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
                osc.start(now);
                osc.stop(now + 0.5);
                break;
        }
    }
}

// ==========================================
// 3. PARTICLE SYSTEM
// ==========================================

class Particle {
    constructor(x, y, color, type = 'standard') {
        this.pos = new Vector2(x, y);
        this.vel = new Vector2(RNG.range(-2, 2), RNG.range(-2, 2));
        this.acc = new Vector2(0, 0);
        this.color = color;
        this.life = 1.0;
        this.decay = RNG.range(0.01, 0.03);
        this.size = RNG.range(2, 5);
        this.type = type; // 'standard', 'gravity', 'spark'

        if (type === 'gravity') {
            this.vel = new Vector2(0, RNG.range(1, 4));
            this.decay = 0.05;
        }
    }

    update() {
        this.vel = this.vel.add(this.acc);
        this.pos = this.pos.add(this.vel);
        this.life -= this.decay;

        if (this.type === 'standard') {
            this.size *= 0.95; // Shrink
        }
    }

    draw(ctx, cameraY) {
        if (this.life <= 0) return;

        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;

        if (this.type === 'spark') {
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
        }

        ctx.fillRect(this.pos.x, this.pos.y - cameraY, this.size, this.size);

        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    emit(x, y, count = 5, color = '#fff', type = 'standard') {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, color, type));
        }
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (this.particles[i].life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx, cameraY) {
        this.particles.forEach(p => p.draw(ctx, cameraY));
    }

    clear() {
        this.particles = [];
    }
}

// ==========================================
// 4. GAME OBJECTS
// ==========================================

class Player {
    constructor(game) {
        this.game = game;
        this.width = 32;
        this.height = 32;
        this.type = 'player';
        this.reset();
    }

    reset() {
        this.pos = new Vector2(this.game.width / 2, this.game.height - 150);
        this.vel = new Vector2(0, 0);
        this.acc = new Vector2(0, 0);

        this.speed = 0.8;
        this.maxSpeed = 8;
        this.friction = 0.85;
        this.jumpForce = 18;

        this.grounded = false;
        this.color = '#00d2ff';
        this.trailTimer = 0;
    }

    update() {
        // Input Handling
        if (this.game.keys.left) {
            this.vel.x -= this.speed;
        }
        if (this.game.keys.right) {
            this.vel.x += this.speed;
        }

        // Friction
        this.vel.x *= this.friction;

        // Gravity Appears here
        // The game state gravity is added to vertical velocity
        this.vel.y += this.game.state.gravity;

        // Apply Speed Limits
        if (this.vel.x > this.maxSpeed) this.vel.x = this.maxSpeed;
        if (this.vel.x < -this.maxSpeed) this.vel.x = -this.maxSpeed;

        // Update Position
        this.pos = this.pos.add(this.vel);

        // Bounds (Wrap or Wall) -> Wall for now
        if (this.pos.x < 0) {
            this.pos.x = 0;
            this.vel.x = 0;
        }
        if (this.pos.x + this.width > this.game.width) {
            this.pos.x = this.game.width - this.width;
            this.vel.x = 0;
        }

        // Particle Trail (if moving fast)
        if (Math.abs(this.vel.x) > 5) {
            this.trailTimer++;
            if (this.trailTimer % 5 === 0) {
                this.game.particles.emit(this.pos.x + this.width / 2, this.pos.y + this.height, 1, this.color);
            }
        }
    }

    jump() {
        if (this.grounded) {
            this.vel.y = -this.jumpForce;
            this.grounded = false;

            // Mechanic: Debt Increase
            this.game.addGravity();

            // FX
            this.game.audio.play('jump');
            this.game.particles.emit(this.pos.x + this.width / 2, this.pos.y + this.height, 10, '#fff', 'standard');
        }
    }

    draw(ctx, cameraY) {
        ctx.fillStyle = this.color;
        // Simple glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;

        // Draw body
        ctx.fillRect(this.pos.x, this.pos.y - cameraY, this.width, this.height);

        // Face / Details to see direction
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 0;

        const faceX = this.vel.x >= 0 ? this.pos.x + 20 : this.pos.x + 4;
        ctx.fillRect(faceX, this.pos.y - cameraY + 6, 8, 8);
    }
}

class Platform {
    constructor(x, y, w, type = 'normal') {
        this.pos = new Vector2(x, y);
        this.width = w;
        this.height = 16;
        this.type = type; // normal, moving, crumble, bounce

        this.baseColor = '#764ba2';
        if (type === 'moving') this.baseColor = '#ffcf00';
        if (type === 'crumble') this.baseColor = '#ff4b1f';
        if (type === 'bounce') this.baseColor = '#00ff88';

        this.vel = new Vector2(0, 0);
        if (type === 'moving') this.vel.x = 2; // Fixed speed for demo

        this.crumbling = false;
        this.remove = false;
    }

    update() {
        if (this.type === 'moving') {
            this.pos.x += this.vel.x;
            // Simple bound check for moving platforms (assuming 0 to game width)
            // Ideally should know game reference, but passing 800 is safe usually
            if (this.pos.x < 0 || this.pos.x + this.width > 1200) { // arbitrary wide boundary
                this.vel.x *= -1;
            }
        }

        if (this.crumbling) {
            this.pos.y += 2; // Fall down
            if (this.pos.y > 1000000) this.remove = true; // Cleanup
        }
    }

    draw(ctx, cameraY) {
        ctx.fillStyle = this.baseColor;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.baseColor;
        ctx.fillRect(this.pos.x, this.pos.y - cameraY, this.width, this.height);

        // Patterns or details
        if (this.type === 'bounce') {
            ctx.fillStyle = '#fff';
            ctx.fillRect(this.pos.x, this.pos.y - cameraY, this.width, 3);
        }
        ctx.shadowBlur = 0;
    }
}

class Orb {
    constructor(x, y) {
        this.pos = new Vector2(x, y);
        this.radius = 8;
        this.active = true;
        this.color = '#00ff88';
        this.bobOffset = RNG.range(0, Math.PI * 2);
    }

    update() {
        this.bobOffset += 0.1;
        // Bobbing effect purely visual via draw offset usually, but let's change Y slightly?
        // Actually keep logic simple for collision.
    }

    draw(ctx, cameraY) {
        if (!this.active) return;

        const bobY = Math.sin(this.bobOffset) * 5;

        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y + bobY - cameraY, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.closePath();
        ctx.shadowBlur = 0;
    }
}

// ==========================================
// 5. MAIN GAME CLASS
// ==========================================

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.lastTime = 0;
        this.accumulator = 0;
        this.step = 1 / 60;

        this.init();
        this.bindEvents();
    }

    init() {
        // Systems
        this.audio = new AudioSynth();
        this.particles = new ParticleSystem();
        this.player = new Player(this);

        // State
        this.state = {
            screen: 'start', // start, playing, gameover, win
            gravity: 0.60,
            initialGravity: 0.60,
            gravityStep: 0.05,
            maxGravity: 2.50,
            altitude: 0,
            cameraY: 0,
            highScore: localStorage.getItem('gravityDebt_highscore') || 0
        };

        // Entities
        this.platforms = [];
        this.orbs = [];

        // Input
        this.keys = { left: false, right: false, up: false };

        // UI References
        this.ui = {
            start: document.getElementById('start-screen'),
            gameover: document.getElementById('game-over-screen'),
            win: document.getElementById('win-screen'),
            settings: document.getElementById('settings-screen'),
            hud: document.getElementById('ui-layer'),
            alt: document.getElementById('altitude-display'),
            grav: document.getElementById('gravity-display'),
            best: document.getElementById('best-display'),
        };

        this.ui.best.innerText = `Best: ${this.state.highScore}m`;
    }

    /**
     * Resets the game session.
     */
    startSession() {
        this.state.screen = 'playing';
        this.state.gravity = this.state.initialGravity;
        this.state.altitude = 0;
        this.state.cameraY = 0;

        this.player.reset();
        this.platforms = [];
        this.orbs = [];
        this.particles.clear();

        // Initial Floor
        this.platforms.push(new Platform(0, this.height - 50, this.width, 'normal'));

        // Generate initial chunk
        this.generateChunk(this.height - 200, -2000);

        // Hide Menus
        this.ui.start.classList.add('hidden');
        this.ui.gameover.classList.add('hidden');
        this.ui.win.classList.add('hidden');

        this.audio.resume();
        this.audio.play('orb'); // Start sound
    }

    generateChunk(startY, endY) {
        let y = startY;
        while (y > endY) {
            y -= RNG.range(120, 180 - (this.state.gravity * 20)); // Closer platforms if high gravity? Actually further is harder.

            const w = RNG.range(80, 250);
            const x = RNG.range(0, this.width - w);

            // Random Type
            let type = 'normal';
            if (RNG.chance(0.15)) type = 'moving';
            else if (RNG.chance(0.1)) type = 'crumble';
            else if (RNG.chance(0.05)) type = 'bounce'; // Rare bounce pad

            this.platforms.push(new Platform(x, y, w, type));

            // Orbs
            if (RNG.chance(0.2)) {
                this.orbs.push(new Orb(x + w / 2, y - 30));
            }
        }
    }

    addGravity() {
        this.state.gravity += this.state.gravityStep;
        this.audio.play('gravity_up');

        // Visual feedback
        const gDisplay = document.querySelector('.stat-box.warning');
        gDisplay.style.transform = "scale(1.2)";
        setTimeout(() => gDisplay.style.transform = "scale(1)", 100);
    }

    update() {
        if (this.state.screen !== 'playing') return;

        // Player Logic
        this.player.update();

        // Platform Logic
        this.platforms.forEach(p => p.update());
        // Cleanup platforms
        this.platforms.filter(p => !p.remove);

        // Orb Logic
        this.orbs.forEach(o => o.update());

        // Physics / Collisions
        this.checkCollisions();

        // Camera Logic
        const targetCamY = this.player.pos.y - this.height * 0.6;
        if (targetCamY < this.state.cameraY) {
            this.state.cameraY = targetCamY;
        }

        // Death Logic
        if (this.player.pos.y > this.state.cameraY + this.height + 100) {
            this.gameOver("VOID CONSUMED YOU");
        }

        // Win Logic
        if (Math.abs(Math.floor(this.state.cameraY / 10)) > 5000) {
            this.gameWin();
        }

        // Generation
        const highestPlatform = this.platforms[this.platforms.length - 1];
        if (highestPlatform && (highestPlatform.pos.y - this.state.cameraY) > -1000) {
            this.generateChunk(highestPlatform.pos.y, highestPlatform.pos.y - 1500);
        }

        // Particles
        this.particles.update();

        // Update UI
        this.state.altitude = Math.floor(Math.abs(this.state.cameraY / 10));
        this.ui.alt.innerText = this.state.altitude + 'm';
        this.ui.grav.innerText = this.state.gravity.toFixed(2) + 'G';

        // High Score
        if (this.state.altitude > this.state.highScore) {
            this.state.highScore = this.state.altitude;
            localStorage.setItem('gravityDebt_highscore', this.state.highScore);
            this.ui.best.innerText = `Best: ${this.state.highScore}m`;
        }
    }

    checkCollisions() {
        this.player.grounded = false;

        // Platform Collisions (One-way: only when falling)
        if (this.player.vel.y >= 0) {
            for (let p of this.platforms) {
                // AABB centered check vs platform
                // Player bottom
                const pBottom = this.player.pos.y + this.player.height;
                const pRight = this.player.pos.x + this.player.width;
                const pLeft = this.player.pos.x;

                // Platform bounds
                const platTop = p.pos.y;
                const platBottom = p.pos.y + p.height;
                const platLeft = p.pos.x;
                const platRight = p.pos.x + p.width;

                // Horizontal overlap
                if (pRight > platLeft && pLeft < platRight) {
                    // Vertical intersection (feet within platform thickness)
                    if (pBottom >= platTop && pBottom <= platTop + 20) { // Tolerance
                        // Landed
                        this.player.pos.y = platTop - this.player.height;
                        this.player.vel.y = 0;
                        this.player.grounded = true;

                        // Handle special platforms
                        if (p.type === 'bounce') {
                            this.player.vel.y = -25; // Super jump
                            this.player.grounded = false;
                            this.audio.play('jump');
                            this.particles.emit(this.player.pos.x + 16, this.player.pos.y + 32, 10, '#00ff88', 'spark');
                        } else if (p.type === 'crumble') {
                            p.crumbling = true;
                            this.particles.emit(p.pos.x + p.width / 2, p.pos.y, 5, '#ff4b1f', 'standard');
                        } else {
                            if (Math.abs(this.player.vel.y) > 2) {
                                this.audio.play('land');
                                this.particles.emit(this.player.pos.x + 16, this.player.pos.y + 32, 5, '#ddd', 'standard');
                            }
                        }

                        // If running on moving platform
                        if (p.type === 'moving') {
                            this.player.pos.x += p.vel.x;
                        }
                    }
                }
            }
        }

        // Orb Collisions
        for (let o of this.orbs) {
            if (!o.active) continue;
            const dx = (this.player.pos.x + this.player.width / 2) - o.pos.x;
            const dy = (this.player.pos.y + this.player.height / 2) - o.pos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 30) { // generous hitbox
                o.active = false;
                this.state.gravity = Math.max(this.state.initialGravity, this.state.gravity - 0.5);
                this.audio.play('orb');
                this.particles.emit(o.pos.x, o.pos.y, 10, '#00ff88', 'spark');

                // Floating Text effect (mock)
                // In a fuller version, we'd add FloatingText to particle system
            }
        }
    }

    draw() {
        // Clear
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.ctx.save();
        // Camera translation? We actually just subtract cameraY from everything.
        // But let's check optimization.

        // Draw Platforms
        this.platforms.forEach(p => p.draw(this.ctx, this.state.cameraY));

        // Draw Orbs
        this.orbs.forEach(o => o.draw(this.ctx, this.state.cameraY));

        // Draw Particles
        this.particles.draw(this.ctx, this.state.cameraY);

        // Draw Player
        this.player.draw(this.ctx, this.state.cameraY);

        this.ctx.restore();
    }

    loop() {
        // time delta? Fixed step for now simplicity
        this.update();
        this.draw();
        requestAnimationFrame(() => this.loop());
    }

    gameOver(reason) {
        this.state.screen = 'gameover';
        this.audio.play('death');

        document.getElementById('final-score').innerText = this.state.altitude + 'm';
        document.getElementById('final-gravity').innerText = this.state.gravity.toFixed(2) + 'G';
        document.getElementById('death-reason').innerText = reason;

        this.ui.gameover.classList.remove('hidden');
    }

    gameWin() {
        this.state.screen = 'win';
        this.audio.play('win'); // (we don't have win sound yet, will default/fail silently)
        this.ui.win.classList.remove('hidden');
    }

    bindEvents() {
        // Keyboard
        window.addEventListener('keydown', (e) => {
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.keys.left = true;
            if (e.code === 'ArrowRight' || e.code === 'KeyD') this.keys.right = true;
            if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
                this.keys.up = true;
                if (this.state.screen === 'playing') this.player.jump();
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.keys.left = false;
            if (e.code === 'ArrowRight' || e.code === 'KeyD') this.keys.right = false;
            if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') this.keys.up = false;
        });

        // Resize
        window.addEventListener('resize', () => {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.canvas.width = this.width;
            this.canvas.height = this.height;
        });

        // UI Buttons
        document.getElementById('start-btn').addEventListener('click', () => {
            this.startSession();
        });

        document.getElementById('restart-btn').addEventListener('click', () => {
            this.startSession();
        });

        // Settings
        document.getElementById('settings-btn').addEventListener('click', () => {
            this.ui.settings.classList.remove('hidden');
            this.ui.start.classList.add('hidden'); // Close start behind
        });

        document.getElementById('close-settings-btn').addEventListener('click', () => {
            this.ui.settings.classList.add('hidden');
            if (this.state.screen === 'start') this.ui.start.classList.remove('hidden');
        });

        // Volume
        document.getElementById('vol-slider').addEventListener('input', (e) => {
            const val = e.target.value / 100;
            this.audio.setVolume(val);
            document.getElementById('vol-display').innerText = e.target.value + '%';
        });
    }
}

// ==========================================
// 7. ADVANCED VISUALS (STARFIELD & TEXT)
// ==========================================

class FloatingText {
    constructor(x, y, text, color, duration = 1.0) {
        this.pos = new Vector2(x, y);
        this.text = text;
        this.color = color;
        this.life = duration;
        this.velocity = new Vector2(0, -1); // Float up
        this.alpha = 1.0;
        this.scale = 1.0;
    }

    update() {
        this.pos = this.pos.add(this.velocity);
        this.life -= 0.02;
        this.alpha = Math.max(0, this.life);

        // Pulse effect
        this.scale = 1.0 + Math.sin(this.life * 10) * 0.1;
    }

    draw(ctx, cameraY) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.font = `bold ${16 * this.scale}px 'Courier New'`;
        ctx.textAlign = 'center';
        ctx.shadowBlur = 5;
        ctx.shadowColor = this.color;
        ctx.fillText(this.text, this.pos.x, this.pos.y - cameraY);
        ctx.restore();
    }
}

class BackgroundStar {
    constructor(gameWidth, gameHeight) {
        this.pos = new Vector2(RNG.range(0, gameWidth), RNG.range(0, gameHeight));
        this.size = RNG.range(0.5, 2);
        this.speed = RNG.range(0.1, 0.5); // Parallax factor
        this.brightness = RNG.range(0.2, 1);
        this.twinkleSpeed = RNG.range(0.01, 0.05);
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
    }

    update(cameraY) {
        // Parallax scrolling: move based on camera movement relative to speed
        // Actually, we just want them to scroll slower than the platforms
        // Since cameraY increases as we go up, stars should "move down" relative to screen if they are far away?
        // Let's just re-project them.

        // Simple twinkle
        this.brightness += Math.sin(Date.now() * this.twinkleSpeed) * 0.01;
        if (this.brightness > 1) this.brightness = 1;
        if (this.brightness < 0.2) this.brightness = 0.2;
    }

    draw(ctx, cameraY) {
        // Relative position with wrapping
        let y = this.pos.y - (cameraY * this.speed);
        // Wrap around screen
        // We know game height. If y goes below 0 or above height, wrap?
        // To make it seamless, we use modulo logic
        y = ((y % this.gameHeight) + this.gameHeight) % this.gameHeight;

        ctx.globalAlpha = this.brightness;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.pos.x, y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}

// Update Game class to include these
Game.prototype.initAdvanced = function () {
    this.floatingTexts = [];
    this.stars = [];
    for (let i = 0; i < 100; i++) {
        this.stars.push(new BackgroundStar(this.width, this.height));
    }

    // Ambient Drone
    this.audio.playAmbient = () => {
        if (!this.audio.enabled) return;
        this.audio.resume();
        // Create a buffer or loop oscillator
        const osc = this.audio.ctx.createOscillator();
        const gain = this.audio.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(50, this.audio.ctx.currentTime);
        gain.gain.setValueAtTime(0.05, this.audio.ctx.currentTime);
        osc.connect(gain);
        gain.connect(this.audio.masterGain);
        osc.start();

        // LFO for drone texture
        const lfo = this.audio.ctx.createOscillator();
        lfo.frequency.value = 0.2;
        const lfoGain = this.audio.ctx.createGain();
        lfoGain.gain.value = 20;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();

        this.audio.ambientOsc = osc;
    };
};

// Hook into Main Loop & Draw
const originalUpdate = Game.prototype.update;
Game.prototype.update = function () {
    originalUpdate.call(this);

    // Update Stars
    if (!this.stars) this.initAdvanced();
    this.stars.forEach(s => s.update(this.state.cameraY));

    // Update Texts
    if (this.floatingTexts) {
        this.floatingTexts.forEach((t, i) => {
            t.update();
            if (t.life <= 0) this.floatingTexts.splice(i, 1);
        });
    }
};

const originalDraw = Game.prototype.draw;
Game.prototype.draw = function () {
    // Draw Stars Background first
    this.ctx.fillStyle = '#0f0c29'; // Base bg
    this.ctx.fillRect(0, 0, this.width, this.height);

    if (this.stars) this.stars.forEach(s => s.draw(this.ctx, this.state.cameraY));

    originalDraw.call(this);

    // Draw Texts on top
    if (this.floatingTexts) {
        this.floatingTexts.forEach(t => t.draw(this.ctx, this.state.cameraY));
    }
}

// Add addText method
Game.prototype.addText = function (text, x, y, color) {
    if (!this.floatingTexts) this.floatingTexts = [];
    this.floatingTexts.push(new FloatingText(x, y, text, color));
}

// Override addGravity to use text
const originalAddGravity = Game.prototype.addGravity;
Game.prototype.addGravity = function () {
    originalAddGravity.call(this);
    this.addText("+GRAVITY", this.player.pos.x, this.player.pos.y - 20, "#ff4b1f");
}

// Override collision for text
const originalCheckCollisions = Game.prototype.checkCollisions;
Game.prototype.checkCollisions = function () {
    // Capture orb count before
    const orbCountBefore = this.orbs.filter(o => o.active).length;

    originalCheckCollisions.call(this);

    // Check if orb was collected
    const orbCountAfter = this.orbs.filter(o => o.active).length;
    if (orbCountAfter < orbCountBefore) {
        // We don't have exact position here easily without rewriting, 
        // but we can spawn text at player pos
        this.addText("-DEBT", this.player.pos.x, this.player.pos.y, "#00ff88");
    }
}

// Start Ambient on Interaction
document.addEventListener('click', () => {
    if (game.audio && !game.audio.ambientOsc) {
        game.initAdvanced();
        game.audio.playAmbient();
    }
}, { once: true });

