/**
 * Neon Brick Breaker Engine
 * Physics-based arcade game with particles and power-ups.
 */

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// --- Config ---
let PADDLE_W = 100;
const PADDLE_H = 15;
const BALL_RAD = 8;
let BRICK_ROWS = 5;
let BRICK_COLS = 8;
const BRICK_H = 25;
const BRICK_PAD = 10;
const BRICK_OFFSET_TOP = 60;

// --- State ---
let width, height;
let paddle = { x: 0, w: PADDLE_W };
let balls = []; // Support multi-ball
let bricks = [];
let particles = [];
let powerups = [];
let score = 0;
let lives = 3;
let isPlaying = false;
let brickWidth;

// --- Classes ---

class Ball {
    constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.speed = 6;
        this.active = true;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Walls
        if (this.x + this.vx > width - BALL_RAD || this.x + this.vx < BALL_RAD) {
            this.vx = -this.vx;
        }
        if (this.y + this.vy < BALL_RAD) {
            this.vy = -this.vy;
        }
        else if (this.y > height) {
            this.active = false;
        }

        // Paddle Collision
        if (this.y + BALL_RAD >= height - 40 && this.y - BALL_RAD <= height - 40 + PADDLE_H) {
            if (this.x >= paddle.x && this.x <= paddle.x + paddle.w) {
                // Angle logic: hit center = straight up, hit edges = angled
                let hitPoint = this.x - (paddle.x + paddle.w / 2);
                hitPoint = hitPoint / (paddle.w / 2); // -1 to 1

                let angle = hitPoint * (Math.PI / 3); // Max 60 degrees
                this.vx = this.speed * Math.sin(angle);
                this.vy = -this.speed * Math.cos(angle);
                
                // Speed up slightly
                this.speed = Math.min(this.speed + 0.1, 12);
            }
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, BALL_RAD, 0, Math.PI*2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        // Glow
        ctx.shadowColor = '#00f3ff';
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.closePath();
    }
}

class Brick {
    constructor(c, r, x, y) {
        this.c = c;
        this.r = r;
        this.x = x;
        this.y = y;
        this.status = 1;
        // Colors based on row
        const colors = ['#ff0055', '#ff9900', '#ffff00', '#00ff00', '#00f3ff'];
        this.color = colors[r % colors.length];
    }

    draw() {
        if (this.status === 1) {
            ctx.beginPath();
            ctx.rect(this.x, this.y, brickWidth, BRICK_H);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 10;
            ctx.stroke(); // Outline for sharpness
            ctx.shadowBlur = 0;
            ctx.closePath();
        }
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x; this.y = y;
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = (Math.random() - 0.5) * 8;
        this.life = 1.0;
        this.color = color;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 0.03;
    }
    draw() {
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, 3, 3);
        ctx.globalAlpha = 1.0;
    }
}

class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type; // 'wide', 'multi', 'life'
        this.vy = 3;
        this.active = true;
    }
    update() {
        this.y += this.vy;
        if (this.y > height) this.active = false;
        
        // Paddle Hit
        if (this.y + 10 >= height - 40 && this.y - 10 <= height - 40 + PADDLE_H) {
            if (this.x >= paddle.x && this.x <= paddle.x + paddle.w) {
                activatePowerUp(this.type);
                this.active = false;
            }
        }
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 10, 0, Math.PI*2);
        ctx.fillStyle = this.type === 'wide' ? '#00ff00' : (this.type === 'multi' ? '#00f3ff' : '#ff0055');
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.fillText(this.type[0].toUpperCase(), this.x-4, this.y+4);
        ctx.closePath();
    }
}

// --- Init ---

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Mouse Move
    canvas.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        const rootX = e.clientX - rect.left;
        paddle.x = rootX - paddle.w / 2;
        // Clamp
        if (paddle.x < 0) paddle.x = 0;
        if (paddle.x + paddle.w > width) paddle.x = width - paddle.w;
    });

    // Touch Move
    canvas.addEventListener('touchmove', e => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const rootX = e.touches[0].clientX - rect.left;
        paddle.x = rootX - paddle.w / 2;
        if (paddle.x < 0) paddle.x = 0;
        if (paddle.x + paddle.w > width) paddle.x = width - paddle.w;
    }, {passive: false});
}

function resizeCanvas() {
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
    
    // Recalculate Layout
    brickWidth = (width - (BRICK_PAD * 2)) / BRICK_COLS - BRICK_PAD;
}

function startGame() {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-over').classList.add('hidden');
    
    score = 0;
    lives = 3;
    updateUI();
    resetLevel();
    isPlaying = true;
    loop();
}

function resetLevel() {
    balls = [new Ball(width/2, height - 60, 4, -4)];
    paddle = { x: width/2 - PADDLE_W/2, w: PADDLE_W }; // Reset paddle size
    powerups = [];
    particles = [];
    
    // Build Bricks
    bricks = [];
    for(let c=0; c<BRICK_COLS; c++) {
        bricks[c] = [];
        for(let r=0; r<BRICK_ROWS; r++) {
            const brickX = (c * (brickWidth + BRICK_PAD)) + BRICK_PAD;
            const brickY = (r * (BRICK_H + BRICK_PAD)) + BRICK_OFFSET_TOP;
            bricks[c][r] = new Brick(c, r, brickX, brickY);
        }
    }
}

function activatePowerUp(type) {
    if (type === 'wide') {
        paddle.w = Math.min(width, PADDLE_W * 1.5);
        setTimeout(() => paddle.w = PADDLE_W, 5000); // 5 sec duration
    } else if (type === 'multi') {
        const b = balls[0];
        if(b) {
            balls.push(new Ball(b.x, b.y, -b.vx, b.vy)); // Split
            balls.push(new Ball(b.x, b.y, b.vx * 0.5, b.vy)); // Slow split
        }
    } else if (type === 'life') {
        lives++;
        updateUI();
    }
}

function spawnPowerUp(x, y) {
    if (Math.random() > 0.8) { // 20% chance
        const r = Math.random();
        let type = 'wide';
        if (r > 0.6) type = 'multi';
        if (r > 0.9) type = 'life';
        powerups.push(new PowerUp(x, y, type));
    }
}

// --- Game Logic ---

function collisionDetection() {
    for(let c=0; c<BRICK_COLS; c++) {
        for(let r=0; r<BRICK_ROWS; r++) {
            const b = bricks[c][r];
            if(b.status === 1) {
                // Check all balls
                for(let ball of balls) {
                    if(ball.x > b.x && ball.x < b.x + brickWidth && ball.y > b.y && ball.y < b.y + BRICK_H) {
                        ball.vy = -ball.vy;
                        b.status = 0;
                        score += 10;
                        updateUI();
                        
                        // FX
                        createExplosion(ball.x, ball.y, b.color);
                        spawnPowerUp(ball.x, ball.y);
                        
                        // Check Win
                        checkWin();
                    }
                }
            }
        }
    }
}

function checkWin() {
    let activeBricks = 0;
    for(let c=0; c<BRICK_COLS; c++) {
        for(let r=0; r<BRICK_ROWS; r++) {
            if (bricks[c][r].status === 1) activeBricks++;
        }
    }
    if (activeBricks === 0) {
        // Level Up logic could go here, for now just reset bricks
        score += 100;
        resetLevel(); // Restart but keep score
    }
}

function createExplosion(x, y, color) {
    for(let i=0; i<10; i++) {
        particles.push(new Particle(x, y, color));
    }
}

function updateUI() {
    document.getElementById('score-val').innerText = score;
    document.getElementById('lives-val').innerText = lives;
}

function gameOver() {
    isPlaying = false;
    document.getElementById('final-score').innerText = score;
    document.getElementById('game-over').classList.remove('hidden');
}

function loop() {
    if (!isPlaying) return;
    
    ctx.clearRect(0, 0, width, height);
    
    // Draw Bricks
    for(let c=0; c<BRICK_COLS; c++) {
        for(let r=0; r<BRICK_ROWS; r++) {
            bricks[c][r].draw();
        }
    }
    
    // Paddle
    ctx.beginPath();
    ctx.rect(paddle.x, height - 40, paddle.w, PADDLE_H);
    ctx.fillStyle = '#00f3ff';
    ctx.fill();
    ctx.shadowColor = '#00f3ff';
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.closePath();
    
    // Balls
    for(let i = balls.length - 1; i >= 0; i--) {
        const b = balls[i];
        b.update();
        b.draw();
        if (!b.active) {
            balls.splice(i, 1);
        }
    }
    
    // Life Check
    if (balls.length === 0) {
        lives--;
        updateUI();
        if (lives > 0) {
            balls.push(new Ball(width/2, height - 60, 4, -4));
        } else {
            gameOver();
        }
    }
    
    // Powerups
    for(let i = powerups.length - 1; i >= 0; i--) {
        powerups[i].update();
        powerups[i].draw();
        if (!powerups[i].active) powerups.splice(i, 1);
    }
    
    // Particles
    for(let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].life <= 0) particles.splice(i, 1);
    }
    
    collisionDetection();
    requestAnimationFrame(loop);
}

// Start
init();