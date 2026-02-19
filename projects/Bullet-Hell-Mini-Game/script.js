// ===============================
// ========= SETUP ===============
// ===============================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const scoreEl = document.getElementById("score");
const multiplierEl = document.getElementById("multiplier");
const healthFill = document.getElementById("healthFill");
const gameOverScreen = document.getElementById("gameOverScreen");
const finalScoreEl = document.getElementById("finalScore");
const restartBtn = document.getElementById("restartBtn");

let keys = {};
let bullets = [];
let bossBullets = [];
let particles = [];

let score = 0;
let multiplier = 1;
let gameOver = false;
let lastTime = 0;
let globalTimeScale = 1;

// ===============================
// ========= INPUT ===============
// ===============================

window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

// ===============================
// ========= PLAYER ==============
// ===============================

class Player {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = canvas.width / 2;
        this.y = canvas.height - 120;
        this.radius = 6;
        this.speed = 4;
        this.focusSpeed = 2;
        this.health = 100;
        this.invincible = false;
        this.invTime = 0;
        this.dashCooldown = 0;
    }

    update(delta) {

        let moveSpeed = keys[" "] ? this.focusSpeed : this.speed;

        if (keys["w"] || keys["ArrowUp"]) this.y -= moveSpeed;
        if (keys["s"] || keys["ArrowDown"]) this.y += moveSpeed;
        if (keys["a"] || keys["ArrowLeft"]) this.x -= moveSpeed;
        if (keys["d"] || keys["ArrowRight"]) this.x += moveSpeed;

        if (keys["Shift"] && this.dashCooldown <= 0) {
            this.dash();
        }

        this.x = Math.max(0, Math.min(canvas.width, this.x));
        this.y = Math.max(0, Math.min(canvas.height, this.y));

        if (this.invincible) {
            this.invTime -= delta;
            if (this.invTime <= 0) {
                this.invincible = false;
            }
        }

        this.dashCooldown -= delta;
    }

    dash() {
        this.invincible = true;
        this.invTime = 400;
        this.dashCooldown = 800;
    }

    draw() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.invincible ? "#fff" : "#0ff";
        ctx.shadowColor = "#0ff";
        ctx.shadowBlur = 20;
        ctx.fill();
        ctx.restore();
    }

    hit() {
        if (this.invincible) return;

        this.health -= 10;
        this.invincible = true;
        this.invTime = 1000;

        if (this.health <= 0) {
            triggerGameOver();
        }
    }
}

const player = new Player();

// ===============================
// ========= BULLETS =============
// ===============================

class Bullet {
    constructor(x, y, vx, vy, radius = 4) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = radius;
    }

    update(delta) {
        this.x += this.vx * delta * 0.1 * globalTimeScale;
        this.y += this.vy * delta * 0.1 * globalTimeScale;
    }

    draw() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#ff006e";
        ctx.shadowColor = "#ff006e";
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.restore();
    }
}

// ===============================
// ========= PARTICLES ===========
// ===============================

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 6;
        this.vy = (Math.random() - 0.5) * 6;
        this.life = 50;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
    }

    draw() {
        ctx.fillStyle = `rgba(255,0,110,${this.life / 50})`;
        ctx.fillRect(this.x, this.y, 3, 3);
    }
}

// ===============================
// ========= BOSS ================
// ===============================

class Boss {
    constructor() {
        this.x = canvas.width / 2;
        this.y = 120;
        this.radius = 40;
        this.phase = 1;
        this.timer = 0;
        this.health = 500;
    }

    update(delta) {
        this.timer += delta;

        if (this.phase === 1) {
            if (this.timer > 800) {
                this.radialPattern();
                this.timer = 0;
            }
            if (this.health < 300) this.phase = 2;
        }

        if (this.phase === 2) {
            if (this.timer > 400) {
                this.spiralPattern();
                this.timer = 0;
            }
        }
    }

    radialPattern() {
        for (let i = 0; i < 20; i++) {
            let angle = (Math.PI * 2 / 20) * i;
            let vx = Math.cos(angle) * 3;
            let vy = Math.sin(angle) * 3;
            bossBullets.push(new Bullet(this.x, this.y, vx, vy));
        }
    }

    spiralPattern() {
        let angle = Date.now() * 0.005;
        let vx = Math.cos(angle) * 4;
        let vy = Math.sin(angle) * 4;
        bossBullets.push(new Bullet(this.x, this.y, vx, vy));
    }

    draw() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#00f5ff";
        ctx.shadowColor = "#00f5ff";
        ctx.shadowBlur = 25;
        ctx.fill();
        ctx.restore();
    }
}

const boss = new Boss();

// ===============================
// ========= GAME LOOP ===========
// ===============================

function gameLoop(timestamp) {
    if (gameOver) return;

    let delta = timestamp - lastTime;
    lastTime = timestamp;

    if (keys[" "]) {
        globalTimeScale = 0.4;
        multiplier = 2;
    } else {
        globalTimeScale = 1;
        multiplier = 1;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    player.update(delta);
    boss.update(delta);

    player.draw();
    boss.draw();

    updateBullets(delta);
    updateParticles();

    score += 0.1 * multiplier;
    scoreEl.textContent = Math.floor(score);
    multiplierEl.textContent = multiplier;
    healthFill.style.width = player.health + "%";

    requestAnimationFrame(gameLoop);
}

// ===============================
// ========= UPDATE LOGIC ========
// ===============================

function updateBullets(delta) {
    bossBullets.forEach((b, index) => {
        b.update(delta);
        b.draw();

        let dx = b.x - player.x;
        let dy = b.y - player.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < b.radius + player.radius) {
            createExplosion(player.x, player.y);
            player.hit();
            bossBullets.splice(index, 1);
        }

        if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
            bossBullets.splice(index, 1);
        }
    });
}

function createExplosion(x, y) {
    for (let i = 0; i < 20; i++) {
        particles.push(new Particle(x, y));
    }
}

function updateParticles() {
    particles.forEach((p, index) => {
        p.update();
        p.draw();
        if (p.life <= 0) particles.splice(index, 1);
    });
}

// ===============================
// ========= GAME OVER ===========
// ===============================

function triggerGameOver() {
    gameOver = true;
    finalScoreEl.textContent = "Final Score: " + Math.floor(score);
    gameOverScreen.style.display = "flex";
}

function restartGame() {
    bullets = [];
    bossBullets = [];
    particles = [];
    score = 0;
    multiplier = 1;
    gameOver = false;
    player.reset();
    boss.health = 500;
    boss.phase = 1;
    gameOverScreen.style.display = "none";
    requestAnimationFrame(gameLoop);
}

restartBtn.addEventListener("click", restartGame);

requestAnimationFrame(gameLoop);