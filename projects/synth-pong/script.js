const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const leftScoreEl = document.getElementById('leftScore');
const rightScoreEl = document.getElementById('rightScore');
const startBtn = document.getElementById('startBtn');

canvas.width = 800;
canvas.height = 400;

let gameRunning = false;
let leftScore = 0;
let rightScore = 0;

let leftPaddle = { y: canvas.height / 2 - 40, speed: 0 };
let rightPaddle = { y: canvas.height / 2 - 40, speed: 0 };
const paddleHeight = 80;
const paddleWidth = 10;
const paddleSpeed = 8;

let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    vx: 5,
    vy: 4,
    radius: 6
};

let particles = [];
let audioCtx = null;
let gainNode = null;

let leftUpPressed = false;
let leftDownPressed = false;
let rightUpPressed = false;
let rightDownPressed = false;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        gainNode = audioCtx.createGain();
        gainNode.connect(audioCtx.destination);
        gainNode.gain.value = 0.1;
    }
}

function playSound(frequency, duration, type = 'sine') {
    if (!audioCtx || audioCtx.state === 'closed') return;
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.value = 0.1;
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.stop(audioCtx.currentTime + duration);
}

function createParticles(x, y, color) {
    for (let i = 0; i < 5; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 1,
            color: color
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function drawParticles() {
    particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.fill();
    });
    ctx.shadowBlur = 0;
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.vx = (Math.random() > 0.5 ? 5 : -5);
    ball.vy = (Math.random() * 4 - 2);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'w' || e.key === 'W') {
        leftUpPressed = true;
        e.preventDefault();
    }
    if (e.key === 's' || e.key === 'S') {
        leftDownPressed = true;
        e.preventDefault();
    }
    if (e.key === 'ArrowUp') {
        rightUpPressed = true;
        e.preventDefault();
    }
    if (e.key === 'ArrowDown') {
        rightDownPressed = true;
        e.preventDefault();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'w' || e.key === 'W') {
        leftUpPressed = false;
        e.preventDefault();
    }
    if (e.key === 's' || e.key === 'S') {
        leftDownPressed = false;
        e.preventDefault();
    }
    if (e.key === 'ArrowUp') {
        rightUpPressed = false;
        e.preventDefault();
    }
    if (e.key === 'ArrowDown') {
        rightDownPressed = false;
        e.preventDefault();
    }
});

window.addEventListener('contextmenu', (e) => e.preventDefault());

function updatePaddles() {
    if (!gameRunning) return;
    
    if (leftUpPressed) {
        leftPaddle.y -= paddleSpeed;
    }
    if (leftDownPressed) {
        leftPaddle.y += paddleSpeed;
    }
    if (rightUpPressed) {
        rightPaddle.y -= paddleSpeed;
    }
    if (rightDownPressed) {
        rightPaddle.y += paddleSpeed;
    }
    
    leftPaddle.y = Math.max(0, Math.min(canvas.height - paddleHeight, leftPaddle.y));
    rightPaddle.y = Math.max(0, Math.min(canvas.height - paddleHeight, rightPaddle.y));
}

function update() {
    if (!gameRunning) return;
    
    updatePaddles();
    
    ball.x += ball.vx;
    ball.y += ball.vy;
    
    if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.vy = Math.abs(ball.vy);
        playSound(100, 0.1, 'triangle');
        createParticles(ball.x, ball.y, '#0ff');
    }
    
    if (ball.y + ball.radius > canvas.height) {
        ball.y = canvas.height - ball.radius;
        ball.vy = -Math.abs(ball.vy);
        playSound(100, 0.1, 'triangle');
        createParticles(ball.x, ball.y, '#0ff');
    }
    
    if (ball.x - ball.radius < paddleWidth && 
        ball.x - ball.radius > 0 &&
        ball.y > leftPaddle.y && 
        ball.y < leftPaddle.y + paddleHeight) {
        
        ball.x = paddleWidth + ball.radius;
        ball.vx = Math.abs(ball.vx) * 1.05;
        
        let relativeY = (ball.y - leftPaddle.y) / paddleHeight - 0.5;
        ball.vy += relativeY * 5;
        
        ball.vy = Math.max(-8, Math.min(8, ball.vy));
        
        playSound(220 + ball.y, 0.2);
        createParticles(ball.x, ball.y, '#f0f');
    }
    
    if (ball.x + ball.radius > canvas.width - paddleWidth && 
        ball.x + ball.radius < canvas.width &&
        ball.y > rightPaddle.y && 
        ball.y < rightPaddle.y + paddleHeight) {
        
        ball.x = canvas.width - paddleWidth - ball.radius;
        ball.vx = -Math.abs(ball.vx) * 1.05;
        
        let relativeY = (ball.y - rightPaddle.y) / paddleHeight - 0.5;
        ball.vy += relativeY * 5;
        
        ball.vy = Math.max(-8, Math.min(8, ball.vy));
        
        playSound(440 + ball.y, 0.2);
        createParticles(ball.x, ball.y, '#ff0');
    }
    
    if (ball.x - ball.radius < 0) {
        rightScore++;
        rightScoreEl.textContent = rightScore;
        playSound(300, 0.3, 'sawtooth');
        resetBall();
    }
    
    if (ball.x + ball.radius > canvas.width) {
        leftScore++;
        leftScoreEl.textContent = leftScore;
        playSound(300, 0.3, 'sawtooth');
        resetBall();
    }
    
    ball.vx = Math.max(-10, Math.min(10, ball.vx));
    ball.vy = Math.max(-8, Math.min(8, ball.vy));
    
    updateParticles();
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.shadowColor = '#0ff';
    ctx.shadowBlur = 15;
    
    ctx.fillStyle = '#0ff';
    ctx.fillRect(10, leftPaddle.y, paddleWidth, paddleHeight);
    ctx.fillRect(canvas.width - 20, rightPaddle.y, paddleWidth, paddleHeight);
    
    ctx.shadowColor = '#f0f';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    
    drawParticles();
    
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#0ff';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 15]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

startBtn.addEventListener('click', () => {
    initAudio();
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    gameRunning = true;
    startBtn.style.display = 'none';
    resetBall();
    playSound(440, 0.5);
});

gameLoop();