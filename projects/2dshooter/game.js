class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = CONSTANTS.CANVAS_WIDTH;
        this.canvas.height = CONSTANTS.CANVAS_HEIGHT;

        // UI Elements Cache
        this.ui = {
            playerHealth: document.getElementById('player-health-fill'),
            score: document.getElementById('score-value'),
            enemyHealth: document.getElementById('enemy-health-fill'),
            enemyAccuracy: document.getElementById('enemy-accuracy'),
            enemyLearning: document.getElementById('enemy-learning'),
            gameOverScreen: document.getElementById('game-over-screen'),
            finalScore: document.getElementById('final-score-val'),
            restartBtn: document.getElementById('restart-btn')
        };

        // Game objects
        this.player = new Player(CONSTANTS.CANVAS_WIDTH / 2, CONSTANTS.CANVAS_HEIGHT - 100);
        this.enemy = new Enemy(CONSTANTS.CANVAS_WIDTH / 2, 100);

        // Game state
        this.isRunning = true;
        this.lastTime = 0;
        this.score = 0;
        this.gameOver = false;

        // Input handling
        this.mouseX = 0;
        this.mouseY = 0;

        this.setupEventListeners();
        this.startGameLoop();
    }

    setupEventListeners() {
        // Keyboard input
        window.addEventListener('keydown', (e) => {
            switch (e.key.toLowerCase()) {
                case 'w': case 'arrowup': this.player.input.up = true; break;
                case 's': case 'arrowdown': this.player.input.down = true; break;
                case 'a': case 'arrowleft': this.player.input.left = true; break;
                case 'd': case 'arrowright': this.player.input.right = true; break;
                case 'r': if (this.gameOver) this.resetGame(); break;
            }
        });

        window.addEventListener('keyup', (e) => {
            switch (e.key.toLowerCase()) {
                case 'w': case 'arrowup': this.player.input.up = false; break;
                case 's': case 'arrowdown': this.player.input.down = false; break;
                case 'a': case 'arrowleft': this.player.input.left = false; break;
                case 'd': case 'arrowright': this.player.input.right = false; break;
            }
        });

        // Mouse input for shooting
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });

        this.canvas.addEventListener('click', () => {
            this.player.shoot(this.mouseX, this.mouseY);
        });

        // UI Interaction
        this.ui.restartBtn.addEventListener('click', () => {
            this.resetGame();
        });

        // Touch support for mobile
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.touches[0].clientX - rect.left;
            this.mouseY = e.touches[0].clientY - rect.top;
        }, { passive: false });

        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.player.shoot(this.mouseX, this.mouseY);
        }, { passive: false });
    }

    startGameLoop() {
        const gameLoop = (currentTime) => {
            const deltaTime = this.lastTime ? (currentTime - this.lastTime) / 1000 : 0;
            this.lastTime = currentTime;
            const cappedDeltaTime = Math.min(deltaTime, 0.1);

            this.update(cappedDeltaTime);
            this.render();

            if (this.isRunning) {
                requestAnimationFrame(gameLoop);
            }
        };
        requestAnimationFrame(gameLoop);
    }

    update(deltaTime) {
        this.player.update(deltaTime);

        this.player.bullets.forEach((bullet, bulletIndex) => {
            if (this.enemy.isAlive && Utils.circleCollision(
                bullet.x, bullet.y, bullet.radius,
                this.enemy.x, this.enemy.y, this.enemy.radius
            )) {
                this.enemy.takeDamage(1);
                this.player.bullets.splice(bulletIndex, 1);

                if (!this.enemy.isAlive) {
                    this.score += 100;
                }
            }
        });

        this.enemy.update(deltaTime, this.player);

        if (!this.player.isAlive) {
            this.gameOver = true;
            this.enemy.resetLearning();
        }
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = CONSTANTS.BACKGROUND_COLOR;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawGrid();
        this.enemy.draw(this.ctx);
        this.player.draw(this.ctx);

        // Update HTML UI (No longer drawing to canvas)
        this.updateUI();
    }

    updateUI() {
        // Update Health Bars
        const pHealthPct = (this.player.health / this.player.maxHealth) * 100;
        const eHealthPct = (this.enemy.health / this.enemy.maxHealth) * 100;

        this.ui.playerHealth.style.width = `${pHealthPct}%`;
        this.ui.enemyHealth.style.width = `${eHealthPct}%`;

        // Update Score
        this.ui.score.innerText = this.score;

        // Update Stats
        const accuracy = Math.round(this.enemy.getAccuracy() * 100);
        const learning = Math.round(this.enemy.getLearningLevel() * 100);

        this.ui.enemyAccuracy.innerText = `${accuracy}%`;
        this.ui.enemyLearning.innerText = `${learning}%`;

        // Show/Hide Game Over
        if (this.gameOver) {
            this.ui.gameOverScreen.classList.remove('hidden');
            this.ui.finalScore.innerText = this.score;
        } else {
            this.ui.gameOverScreen.classList.add('hidden');
        }
    }

    drawGrid() {
        const gridSize = 50;
        this.ctx.strokeStyle = CONSTANTS.GRID_COLOR;
        this.ctx.lineWidth = 1;

        for (let x = 0; x < this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        for (let y = 0; y < this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    resetGame() {
        this.player.respawn();
        this.enemy = new Enemy(CONSTANTS.CANVAS_WIDTH / 2, 100);
        this.score = 0;
        this.gameOver = false;

        // Force hide overlay immediately
        this.ui.gameOverScreen.classList.add('hidden');
    }
}

window.addEventListener('load', () => {
    new Game();
});