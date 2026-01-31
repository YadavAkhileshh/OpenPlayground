import Renderer from './renderer.js';
import InputHandler from './input.js';
import AIController from './ai.js';
import AudioManager from './audio.js';
import ProgressionManager from './progression.js';
import WeaponSystem from './weapons.js';
import EntityManager from './entities.js';
import GUIManager from './gui.js';

export default class Game {
    constructor() {
        this.running = false;
        this.lastTime = 0;
        this.totalTime = 0;
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        // Systems
        this.audio = new AudioManager();
        this.progression = new ProgressionManager(this);
        this.weapons = new WeaponSystem(this);
        this.entities = new EntityManager(this);
        this.renderer = new Renderer(this);
        this.gui = new GUIManager(this);
        this.input = new InputHandler(this);
        this.ai = new AIController(this); // Legacy, might need update or Entity Manager handles it

        this.state = {
            targets: [], // Array of active targets
            projectiles: [],
            particles: [],
            score: 0,
            highScore: this.progression.data.highScore || 0, // Sync with progression? Or keep separate? Progression tracks XP.
            combo: 0,
            shake: 0,
            gameOver: false,
            difficulty: 1,
            charge: 0,
            overclockActive: false,
            // Stats for current run
            stats: { hits: 0, misses: 0, keystrokes: 0, startTime: 0 }
        };

        this.updateUI();
        this.spawnWave(); // Replaces spawnTarget
    }

    init() {
        console.log("Game Initialized V5");
        const startBtn = document.getElementById('start-btn');
        const restartBtn = document.getElementById('restart-btn');
        const startFn = () => { this.audio.init(); this.start(); };
        if (startBtn) startBtn.addEventListener('click', startFn);
        if (restartBtn) restartBtn.addEventListener('click', startFn);
    }

    start() {
        if (this.running) return;
        this.running = true;
        this.state.score = 0;
        this.state.combo = 0;
        this.state.difficulty = 1;
        this.state.charge = 0;
        this.state.overclockActive = false;
        this.state.projectiles = [];
        this.state.particles = [];
        this.state.targets = [];
        this.entities.entities = []; // Reset entity manager too if it stores state separate from game loop? 
        // We will simple use state.targets as the source of truth for rendering and hits.
        // Entity Manager helper methods will operate on this list.

        this.state.stats = { hits: 0, misses: 0, keystrokes: 0, startTime: Date.now() };

        this.spawnWave();
        this.updateUI();

        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('game-over-screen').classList.add('hidden');
        document.getElementById('game-over-screen').classList.remove('active');

        this.lastTime = performance.now();
        requestAnimationFrame((ts) => this.loop(ts));
    }

    spawnWave() {
        // Simple wave logic: Maintain difficulty * 1 enemies
        const count = Math.ceil(this.state.difficulty);
        const currentCount = this.state.targets.length;

        if (currentCount < count) {
            // Determine type based on difficulty/progress
            let type = 'standard';
            const roll = Math.random();
            if (this.state.difficulty > 3 && roll > 0.7) type = 'glitch';
            if (this.state.difficulty > 5 && roll > 0.9) type = 'tank';

            const e = this.entities.spawnEnemy(type, this.state.difficulty);
            this.state.targets.push(e);
        }
    }

    activatePowerUp() {
        if (this.state.charge >= 100 && !this.state.overclockActive) {
            this.state.overclockActive = true;
            this.audio.playPowerUp();
            this.state.shake = 10;
        }
    }

    loop(timestamp) {
        if (!this.running) return;
        const dt = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;
        this.totalTime += dt;
        this.state.time = this.totalTime;

        this.update(dt);
        this.renderer.draw(this.state);
        requestAnimationFrame((ts) => this.loop(ts));
    }

    update(dt) {
        // Time Scale
        let timeScale = 1.0;
        if (this.state.overclockActive) {
            timeScale = 0.2;
            const duration = 5 + (this.progression.data.upgrades.overclockDuration || 0); // Upgrade hook
            // Charge drain rate = 100 / duration per second
            this.state.charge -= dt * (100 / duration);
            if (this.state.charge <= 0) {
                this.state.charge = 0;
                this.state.overclockActive = false;
            }
            this.updateUI();
        }

        // Apply TimeScale to enemies only
        const enemyDt = dt * timeScale;

        // Shake Decay
        if (this.state.shake > 0) this.state.shake = Math.max(0, this.state.shake - dt * 30);

        // Update Weapons
        this.weapons.update(dt);

        // Update Entities (Targets)
        // Entity Manager should define behavior, but we iterate here?
        // Let's pass the list to Entity Manager
        this.entities.entities = this.state.targets; // Sync
        this.entities.update(enemyDt);

        // Spawn more if needed
        if (Math.random() < 0.01 * this.state.difficulty) {
            this.spawnWave();
        }

        // Projectiles (Player speed unaffected by time scale)
        this.state.projectiles.forEach((p, index) => {
            const speed = p.type === 'railgun' ? 4000 : 1200;
            p.x += p.vx * dt;
            p.y += p.vy * dt;

            // Wall check
            if (p.x < 0 || p.x > this.width || p.y < 0 || p.y > this.height) {
                this.state.projectiles.splice(index, 1);
                return;
            }

            // Hit Check
            // Loop through all targets
            for (let i = this.state.targets.length - 1; i >= 0; i--) {
                const t = this.state.targets[i];
                const dist = Math.hypot(p.x - t.x, p.y - t.y);

                // Hit Logic
                if (dist < t.radius + 10) {
                    // Check if specific target needed (Seeker)
                    if (p.targetId && p.targetId !== t) continue;

                    // Valid hit
                    this.handleHit(t, i, p, index);

                    // Piercing Logic (Railgun)
                    if (p.pierce && p.pierce > 0) {
                        p.pierce--;
                    } else {
                        this.state.projectiles.splice(index, 1);
                        break; // Stop checking other targets for this projectile
                    }
                }
            }
        });

        // Particles
        for (let i = this.state.particles.length - 1; i >= 0; i--) {
            const p = this.state.particles[i];
            p.x += p.vx * dt * 60;
            p.y += p.vy * dt * 60;
            p.life -= dt * 2.5;
            if (p.life <= 0) this.state.particles.splice(i, 1);
        }
    }

    shoot(char) {
        if (!this.running) return;
        this.state.stats.keystrokes++;

        // Find matching target
        // Prioritize closest? Or first matching?
        // Let's filter targets that care about this char

        let candidates = this.state.targets.filter(t => {
            const needed = t.word ? t.word[t.matchedIndex] : t.char;
            return needed && needed.toLowerCase() === char.toLowerCase();
        });

        if (candidates.length > 0) {
            // Hit!
            this.state.stats.hits++;
            this.state.combo++;

            // Pick the closest one to player center (or just the first one)
            // Sorting by distance to center
            const cx = this.width / 2;
            const cy = this.height / 2;
            candidates.sort((a, b) => {
                const da = Math.hypot(a.x - cx, a.y - cy);
                const db = Math.hypot(b.x - cx, b.y - cy);
                return da - db;
            });

            const target = candidates[0];

            // Advance target state
            if (target.word) target.matchedIndex++;

            // Fire Weapon
            this.weapons.fire(target, char);
            this.audio.playShoot();

            // Reward
            this.state.score += 10;
            this.state.charge += 1; // Small charge
            this.updateUI();

        } else {
            // Miss
            this.state.stats.misses++;
            // Combo protection upgrade check
            // if (!upgrade) combo = 0
            if (this.progression.data.upgrades.comboKeeper == 0) {
                this.state.combo = 0;
            }
            this.audio.playTone(150, 'sawtooth', 0.1); // Error buzz
            this.updateUI();
        }
    }

    spawnProjectile(data) {
        this.state.projectiles.push(data);
    }

    handleHit(target, tIndex, projectile, pIndex) {
        // Damage Calculation
        let dmg = projectile.damage || 1;
        target.health -= dmg;

        this.audio.playHit();
        this.spawnParticles(target.x, target.y, target.color);
        this.state.shake = 2 * dmg;

        // Check Death
        if (target.health <= 0 || (target.word && target.matchedIndex >= target.word.length)) {
            // Destroyed
            this.destroyTarget(target, tIndex);
        }
    }

    destroyTarget(target, index) {
        this.audio.playExplosion();
        this.state.targets.splice(index, 1);

        // XP & Score
        const xp = 100 * this.state.difficulty;
        this.progression.addXp(xp);
        this.state.score += xp;

        this.state.charge = Math.min(100, this.state.charge + 10);
        this.state.difficulty += 0.1;
        this.state.shake = 10;

        this.spawnParticles(target.x, target.y, target.color);
        this.updateUI();
    }

    spawnParticles(x, y, color) {
        for (let i = 0; i < 8; i++) {
            this.state.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1.0,
                color,
                size: Math.random() * 3 + 1
            });
        }
    }

    updateUI() {
        const scoreEl = document.getElementById('score');
        if (scoreEl) scoreEl.innerText = Math.floor(this.state.score).toString().padStart(5, '0');
        const comboEl = document.getElementById('combo-value');
        if (comboEl) comboEl.innerText = 'x' + this.state.combo;
        const fill = document.getElementById('ai-level-fill');
        if (fill) fill.style.width = this.state.charge + "%";
    }

    gameOver() {
        this.running = false;
        // stats saving logic...
        document.getElementById('game-over-screen').classList.remove('hidden');
        document.getElementById('game-over-screen').classList.add('active');
    }
}
