import { Player } from './Entities/Player.js';
import { InputSystem } from './Systems/InputSystem.js';
import { AudioSystem } from './Systems/AudioSystem.js';
import { ParticleSystem } from './Systems/ParticleSystem.js';
import { WaveSystem } from './Systems/WaveSystem.js';
import { UISystem } from './Systems/UISystem.js';
import { CONFIG } from './Config/Constants.js';
import { MathUtils } from './Utils/MathUtils.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Fix for high DPI displays
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Initialize Systems
        this.input = new InputSystem();
        this.audio = new AudioSystem();
        this.particles = new ParticleSystem();
        this.ui = new UISystem();

        // Entities
        this.player = null;
        this.bullets = [];
        this.enemies = [];
        this.waveSystem = null;

        // Game State
        this.lastTime = 0;
        this.score = 0;
        this.isRunning = false;
        this.isGameOver = false;

        // Bind methods
        this.loop = this.loop.bind(this);
        this.restart = this.restart.bind(this);

        // Bind UI buttons
        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) restartBtn.addEventListener('click', this.restart);
    }

    resize() {
        // We keep the internal resolution fixed for gameplay consistency,
        // but scale via CSS. If native res is needed:
        // this.canvas.width = window.innerWidth;
        // this.canvas.height = window.innerHeight;
    }

    start() {
        this.initGame();
        this.lastTime = performance.now();
        this.isRunning = true;
        requestAnimationFrame(this.loop);
    }

    initGame() {
        this.score = 0;
        this.isGameOver = false;
        this.bullets = [];
        this.enemies = [];

        this.player = new Player(
            CONFIG.CANVAS_WIDTH / 2,
            CONFIG.CANVAS_HEIGHT / 2,
            this.input,
            this.audio,
            this.particles
        );

        this.waveSystem = new WaveSystem(this.enemies);

        this.ui.updateScore(0);
        this.ui.hideGameOver();
        this.input.swapControls();
    }

    restart() {
        this.initGame();
        if (!this.isRunning) {
            this.isRunning = true;
            this.lastTime = performance.now();
            requestAnimationFrame(this.loop);
        }
    }

    loop(timestamp) {
        if (!this.isRunning) return;

        const dt = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        this.update(dt, timestamp);
        this.draw();

        if (!this.isGameOver) {
            requestAnimationFrame(this.loop);
        }
    }

    update(dt, timestamp) {
        // Update Systems
        this.input.update(timestamp);
        this.waveSystem.update(dt, timestamp);

        // Player
        if (this.player && !this.player.isMarkedForDeletion) {
            this.player.update(dt, this.bullets);
        }

        // Bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            b.update(dt);
            if (b.isMarkedForDeletion) {
                this.bullets.splice(i, 1);
            }
        }

        // Enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const e = this.enemies[i];
            e.update(dt, this.player, this.bullets);

            // Check Collision with Player
            if (this.player && MathUtils.circleIntersect(this.player, e)) {
                this.handlePlayerHit();
            }

            // Check Collision with Bullets
            for (let j = this.bullets.length - 1; j >= 0; j--) {
                const b = this.bullets[j];
                if (MathUtils.circleIntersect(b, e)) {
                    this.handleEnemyHit(e, b);
                    this.bullets.splice(j, 1);
                    break;
                }
            }

            if (e.isMarkedForDeletion) {
                this.enemies.splice(i, 1);
            }
        }

        // Particles
        this.particles.update(dt);
    }

    handlePlayerHit() {
        if (this.isGameOver) return;

        // For now, one hit kill. Could add health later.
        this.particles.createExplosion(this.player.x, this.player.y, CONFIG.COLORS.PRIMARY, 50);
        this.audio.playExplosion();
        this.isGameOver = true;
        this.ui.showGameOver(this.score);
        this.player.destroy();
    }

    handleEnemyHit(enemy, bullet) {
        enemy.takeDamage(bullet.damage);

        // Visuals
        this.particles.createExplosion(bullet.x, bullet.y, CONFIG.COLORS.ACCENT, 5);
        this.audio.playHit();

        if (enemy.isMarkedForDeletion) {
            this.score += enemy.scoreValue;
            this.ui.updateScore(this.score);
            this.particles.createExplosion(enemy.x, enemy.y, enemy.color, 20);
            this.audio.playExplosion();
        }
    }

    draw() {
        // Clear with trail effect
        this.ctx.fillStyle = 'rgba(26, 26, 26, 0.3)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Grid background effect
        this.drawGrid();

        this.particles.draw(this.ctx);

        this.bullets.forEach(b => b.draw(this.ctx));
        this.enemies.forEach(e => e.draw(this.ctx));

        if (this.player && !this.player.isMarkedForDeletion) {
            this.player.draw(this.ctx);
        }
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(0, 255, 204, 0.1)';
        this.ctx.lineWidth = 1;
        const gridSize = 50;

        // Offset grid based on player position for parallax-like feel
        let offsetX = 0;
        let offsetY = 0;
        if (this.player) {
            offsetX = -this.player.x * 0.1;
            offsetY = -this.player.y * 0.1;
        }

        this.ctx.beginPath();
        for (let x = offsetX % gridSize; x < this.canvas.width; x += gridSize) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
        }
        for (let y = offsetY % gridSize; y < this.canvas.height; y += gridSize) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
        }
        this.ctx.stroke();
    }
}
