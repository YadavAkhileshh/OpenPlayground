// Balloon Rise Game

class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(v) {
        return new Vector2(this.x + v.x, this.y + v.y);
    }

    multiply(scalar) {
        return new Vector2(this.x * scalar, this.y * scalar);
    }
}

class Balloon {
    constructor(x, y) {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2(0, 0);
        this.radius = 15;
        this.buoyancy = 50; // Natural upward force
        this.drag = 0.98; // Air resistance
        this.maxSpeed = 150;
        this.lateralSpeed = 80;
        this.isRising = false;
        this.riseForce = 120;
    }

    update(deltaTime, keys) {
        // Lateral movement
        let lateralForce = 0;
        if (keys['ArrowLeft'] || keys['KeyA']) lateralForce -= this.lateralSpeed;
        if (keys['ArrowRight'] || keys['KeyD']) lateralForce += this.lateralSpeed;

        // Apply forces
        this.velocity.x += lateralForce * deltaTime;

        // Buoyancy (always upward)
        this.velocity.y -= this.buoyancy * deltaTime;

        // Rise force when holding space
        if (this.isRising) {
            this.velocity.y -= this.riseForce * deltaTime;
        }

        // Apply drag
        this.velocity.x *= this.drag;
        this.velocity.y *= this.drag;

        // Limit speed
        const speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
        if (speed > this.maxSpeed) {
            this.velocity.x = (this.velocity.x / speed) * this.maxSpeed;
            this.velocity.y = (this.velocity.y / speed) * this.maxSpeed;
        }

        // Update position
        this.position = this.position.add(this.velocity.multiply(deltaTime));

        // Keep balloon in horizontal bounds
        this.position.x = Math.max(this.radius, Math.min(400 - this.radius, this.position.x));
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);

        // Balloon shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(2, 2, this.radius, this.radius * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Balloon body
        const gradient = ctx.createRadialGradient(0, -this.radius * 0.3, 0, 0, this.radius * 0.7, this.radius);
        gradient.addColorStop(0, '#FF6B9D');
        gradient.addColorStop(1, '#C44569');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Balloon highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(-this.radius * 0.3, -this.radius * 0.4, this.radius * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Basket
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-8, this.radius * 0.8, 16, 8);

        // Strings
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-8, this.radius * 0.8);
        ctx.lineTo(-this.radius * 0.7, this.radius * 0.3);
        ctx.moveTo(8, this.radius * 0.8);
        ctx.lineTo(this.radius * 0.7, this.radius * 0.3);
        ctx.stroke();

        ctx.restore();
    }

    setRising(rising) {
        this.isRising = rising;
    }
}

class Spike {
    constructor(x, y, width = 20, height = 40) {
        this.position = new Vector2(x, y);
        this.width = width;
        this.height = height;
        this.scrollSpeed = 0;
    }

    update(deltaTime, scrollSpeed) {
        this.position.y += scrollSpeed * deltaTime;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);

        // Spike shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-this.width/2 + 2, this.height + 2);
        ctx.lineTo(this.width/2 + 2, this.height + 2);
        ctx.closePath();
        ctx.fill();

        // Spike
        ctx.fillStyle = '#DC143C';
        ctx.strokeStyle = '#8B0000';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-this.width/2, this.height);
        ctx.lineTo(this.width/2, this.height);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }

    collidesWith(balloon) {
        const dx = Math.abs(balloon.position.x - this.position.x);
        const dy = balloon.position.y - this.position.y;

        if (dx > this.width/2 + balloon.radius) return false;
        if (dy < -balloon.radius || dy > this.height + balloon.radius) return false;

        return true;
    }
}

class WindGust {
    constructor(x, y, width = 60, height = 20) {
        this.position = new Vector2(x, y);
        this.width = width;
        this.height = height;
        this.force = -80; // Push downward
        this.scrollSpeed = 0;
    }

    update(deltaTime, scrollSpeed) {
        this.position.y += scrollSpeed * deltaTime;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.position.x, this.position.y);

        // Wind gust effect
        const alpha = 0.6 + Math.sin(Date.now() * 0.01) * 0.2;
        ctx.fillStyle = `rgba(135, 206, 235, ${alpha})`;
        ctx.strokeStyle = `rgba(70, 130, 180, ${alpha})`;
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.ellipse(0, 0, this.width/2, this.height/2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Wind arrows
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = 1;
        for (let i = -2; i <= 2; i++) {
            const x = i * 8;
            ctx.beginPath();
            ctx.moveTo(x - 5, -3);
            ctx.lineTo(x + 5, 0);
            ctx.lineTo(x - 5, 3);
            ctx.stroke();
        }

        ctx.restore();
    }

    affects(balloon) {
        const dx = Math.abs(balloon.position.x - this.position.x);
        const dy = Math.abs(balloon.position.y - this.position.y);

        return dx < this.width/2 && dy < this.height/2;
    }

    getForce() {
        return this.force;
    }
}

class Checkpoint {
    constructor(y) {
        this.y = y;
        this.passed = false;
        this.height = 50;
    }

    update(scrollY) {
        if (!this.passed && scrollY > this.y) {
            this.passed = true;
            return true; // Scored
        }
        return false;
    }

    draw(ctx, scrollY) {
        const screenY = this.y - scrollY;
        if (screenY < -this.height || screenY > 600) return;

        ctx.save();
        ctx.translate(200, screenY);

        // Checkpoint line
        ctx.strokeStyle = this.passed ? '#10B981' : '#F59E0B';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-150, 0);
        ctx.lineTo(150, 0);
        ctx.stroke();

        // Checkpoint markers
        ctx.fillStyle = this.passed ? '#10B981' : '#F59E0B';
        ctx.beginPath();
        ctx.arc(-150, 0, 8, 0, Math.PI * 2);
        ctx.arc(150, 0, 8, 0, Math.PI * 2);
        ctx.fill();

        // Height text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.floor(this.y / 10)}m`, 0, -10);

        ctx.restore();
    }
}

class BalloonRise {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 400;
        this.canvas.height = 600;

        this.balloon = new Balloon(200, 500);
        this.spikes = [];
        this.windGusts = [];
        this.checkpoints = [];

        this.scrollY = 0;
        this.scrollSpeed = 30;
        this.height = 0;
        this.score = 0;
        this.lives = 3;

        this.gameState = 'menu'; // menu, playing, paused, gameOver
        this.lastTime = 0;
        this.spawnTimer = 0;

        this.keys = {};

        this.initializeElements();
        this.bindEvents();
        this.gameLoop = this.gameLoop.bind(this);
    }

    initializeElements() {
        this.heightDisplay = document.getElementById('height');
        this.livesDisplay = document.getElementById('lives');
        this.scoreDisplay = document.getElementById('score');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.gameOverModal = document.getElementById('gameOverModal');
        this.finalHeight = document.getElementById('finalHeight');
        this.finalScore = document.getElementById('finalScore');
        this.playAgainBtn = document.getElementById('playAgainBtn');
    }

    bindEvents() {
        // Keyboard
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.gameState === 'playing') {
                    this.balloon.setRising(true);
                }
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            if (e.code === 'Space') {
                this.balloon.setRising(false);
            }
        });

        // Touch/Mouse for mobile/tap
        this.canvas.addEventListener('mousedown', () => {
            if (this.gameState === 'playing') {
                this.balloon.setRising(true);
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            this.balloon.setRising(false);
        });

        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.gameState === 'playing') {
                this.balloon.setRising(true);
            }
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.balloon.setRising(false);
        });

        // Buttons
        this.startBtn.addEventListener('click', () => this.startGame());
        this.pauseBtn.addEventListener('click', () => this.pauseGame());
        this.resetBtn.addEventListener('click', () => this.resetGame());
        this.playAgainBtn.addEventListener('click', () => this.resetGame());
    }

    startGame() {
        this.gameState = 'playing';
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        this.gameLoop(0);
    }

    pauseGame() {
        this.gameState = this.gameState === 'paused' ? 'playing' : 'paused';
        this.pauseBtn.textContent = this.gameState === 'paused' ? 'Resume' : 'Pause';
    }

    resetGame() {
        this.balloon = new Balloon(200, 500);
        this.spikes = [];
        this.windGusts = [];
        this.checkpoints = [];

        this.scrollY = 0;
        this.height = 0;
        this.score = 0;
        this.lives = 3;
        this.spawnTimer = 0;

        this.gameState = 'menu';
        this.gameOverModal.classList.remove('show');

        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.pauseBtn.textContent = 'Pause';

        this.updateUI();
    }

    gameLoop(currentTime) {
        if (this.gameState !== 'playing') return;

        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.draw();

        requestAnimationFrame(this.gameLoop);
    }

    update(deltaTime) {
        // Update balloon
        this.balloon.update(deltaTime, this.keys);

        // Update scroll and height
        const balloonTop = this.balloon.position.y - this.balloon.radius;
        if (balloonTop < 200) { // Keep balloon near top of screen
            const scrollAmount = 200 - balloonTop;
            this.scrollY += scrollAmount;
            this.height += scrollAmount;
            this.balloon.position.y = 200 + this.balloon.radius;
        }

        // Spawn obstacles
        this.spawnTimer += deltaTime;
        if (this.spawnTimer > 2) {
            this.spawnObstacles();
            this.spawnTimer = 0;
        }

        // Spawn checkpoints
        if (this.height > 0 && this.checkpoints.length === 0 ||
            this.checkpoints.length > 0 && this.height - this.checkpoints[this.checkpoints.length - 1].y > 200) {
            this.checkpoints.push(new Checkpoint(this.height + 600));
        }

        // Update obstacles
        this.spikes = this.spikes.filter(spike => {
            spike.update(deltaTime, this.scrollSpeed);
            return spike.position.y < this.scrollY + 700;
        });

        this.windGusts = this.windGusts.filter(gust => {
            gust.update(deltaTime, this.scrollSpeed);
            return gust.position.y < this.scrollY + 700;
        });

        // Update checkpoints
        this.checkpoints.forEach(checkpoint => {
            if (checkpoint.update(this.scrollY)) {
                this.score += 100;
            }
        });

        // Apply wind forces
        this.windGusts.forEach(gust => {
            if (gust.affects(this.balloon)) {
                this.balloon.velocity.y += gust.getForce() * deltaTime;
            }
        });

        // Check collisions
        this.checkCollisions();

        this.updateUI();
    }

    spawnObstacles() {
        const types = ['spike', 'wind', 'none'];
        const type = types[Math.floor(Math.random() * types.length)];

        if (type === 'spike') {
            const x = Math.random() * (400 - 40) + 20;
            this.spikes.push(new Spike(x, this.scrollY + 650));
        } else if (type === 'wind') {
            const x = Math.random() * (400 - 120) + 60;
            this.windGusts.push(new WindGust(x, this.scrollY + 650));
        }
    }

    checkCollisions() {
        // Check spike collisions
        for (const spike of this.spikes) {
            if (spike.collidesWith(this.balloon)) {
                this.lives--;
                if (this.lives <= 0) {
                    this.gameOver();
                } else {
                    // Reset balloon position
                    this.balloon.position = new Vector2(200, this.scrollY + 500);
                    this.balloon.velocity = new Vector2(0, 0);
                }
                break;
            }
        }

        // Check if balloon fell too low
        if (this.balloon.position.y > this.scrollY + 650) {
            this.lives--;
            if (this.lives <= 0) {
                this.gameOver();
            } else {
                this.balloon.position = new Vector2(200, this.scrollY + 500);
                this.balloon.velocity = new Vector2(0, 0);
            }
        }
    }

    gameOver() {
        this.gameState = 'gameOver';
        this.finalHeight.textContent = Math.floor(this.height / 10) + 'm';
        this.finalScore.textContent = this.score;
        this.gameOverModal.classList.add('show');
    }

    updateUI() {
        this.heightDisplay.textContent = Math.floor(this.height / 10) + 'm';
        this.livesDisplay.textContent = this.lives;
        this.scoreDisplay.textContent = this.score;
    }

    draw() {
        // Clear canvas with sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#E0F6FF');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw clouds (simple parallax)
        this.drawClouds();

        // Draw checkpoints
        this.checkpoints.forEach(checkpoint => checkpoint.draw(this.ctx, this.scrollY));

        // Draw obstacles
        this.spikes.forEach(spike => spike.draw(this.ctx));
        this.windGusts.forEach(gust => gust.draw(this.ctx));

        // Draw balloon
        this.balloon.draw(this.ctx);

        // Draw UI elements
        this.drawUI();
    }

    drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        // Simple cloud shapes
        const cloudY = (this.scrollY * 0.5) % 700;
        this.ctx.beginPath();
        this.ctx.arc(100, cloudY - 50, 30, 0, Math.PI * 2);
        this.ctx.arc(130, cloudY - 50, 40, 0, Math.PI * 2);
        this.ctx.arc(160, cloudY - 50, 30, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.beginPath();
        this.ctx.arc(300, cloudY + 100, 25, 0, Math.PI * 2);
        this.ctx.arc(325, cloudY + 100, 35, 0, Math.PI * 2);
        this.ctx.arc(355, cloudY + 100, 25, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawUI() {
        // Draw height indicator
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 120, 30);
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`Height: ${Math.floor(this.height / 10)}m`, 15, 30);
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BalloonRise();
});