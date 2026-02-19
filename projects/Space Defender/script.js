// Get DOM elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const finalScoreDisplay = document.getElementById('finalScore');

// Game state
let gameRunning = false;
let score = 0;
let lives = 3;
let animationId;

// Player object
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 80,
    width: 50,
    height: 40,
    speed: 5,
    color: '#00ff00'
};

// Controls
const keys = {};

// Bullets array
let bullets = [];
const bulletSpeed = 7;

// Aliens array
let aliens = [];
const alienRows = 3;
const alienCols = 8;
let alienDirection = 1;
let alienSpeed = 1;

// Stars background
let stars = [];

// Initialize stars for background
function createStars() {
    stars = [];
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2,
            speed: Math.random() * 0.5 + 0.1
        });
    }
}

// Draw moving stars
function drawStars() {
    ctx.fillStyle = '#fff';
    stars.forEach(star => {
        ctx.fillRect(star.x, star.y, star.size, star.size);
        star.y += star.speed;
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    });
}

// Create alien grid
function createAliens() {
    aliens = [];
    for (let row = 0; row < alienRows; row++) {
        for (let col = 0; col < alienCols; col++) {
            aliens.push({
                x: col * 80 + 60,
                y: row * 60 + 50,
                width: 40,
                height: 30,
                alive: true
            });
        }
    }
}

// Draw player spaceship
function drawPlayer() {
    // Spaceship body (triangle)
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.closePath();
    ctx.fill();

    // Spaceship wings
    ctx.fillStyle = '#00cc00';
    ctx.fillRect(player.x - 5, player.y + player.height - 10, 10, 10);
    ctx.fillRect(player.x + player.width - 5, player.y + player.height - 10, 10, 10);

    // Cockpit window
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(player.x + player.width / 2 - 5, player.y + 10, 10, 10);
}

// Draw aliens
function drawAliens() {
    aliens.forEach(alien => {
        if (alien.alive) {
            // Alien body
            ctx.fillStyle = '#ff00ff';
            ctx.fillRect(alien.x, alien.y + 10, alien.width, alien.height - 10);
            
            // Alien eyes
            ctx.fillStyle = '#ffff00';
            ctx.fillRect(alien.x + 10, alien.y + 15, 8, 8);
            ctx.fillRect(alien.x + 22, alien.y + 15, 8, 8);
            
            // Alien antennae
            ctx.strokeStyle = '#ff00ff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(alien.x + 10, alien.y + 10);
            ctx.lineTo(alien.x + 5, alien.y);
            ctx.moveTo(alien.x + 30, alien.y + 10);
            ctx.lineTo(alien.x + 35, alien.y);
            ctx.stroke();
        }
    });
}

// Draw bullets
function drawBullets() {
    ctx.fillStyle = '#ffff00';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, 4, 10);
    });
}

// Main game update loop
function update() {
    if (!gameRunning) return;

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw stars background
    drawStars();

    // Move player with arrow keys
    if (keys['ArrowLeft'] && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }

    // Update bullets position
    bullets = bullets.filter(bullet => {
        bullet.y -= bulletSpeed;
        return bullet.y > 0;
    });

    // Check bullet-alien collisions
    bullets.forEach((bullet, bIndex) => {
        aliens.forEach(alien => {
            if (alien.alive &&
                bullet.x < alien.x + alien.width &&
                bullet.x + 4 > alien.x &&
                bullet.y < alien.y + alien.height &&
                bullet.y + 10 > alien.y) {
                
                // Hit detected
                alien.alive = false;
                bullets.splice(bIndex, 1);
                score += 10;
                scoreDisplay.textContent = `Score: ${score}`;
                alienSpeed += 0.1; // Increase difficulty
            }
        });
    });

    // Move aliens
    let hitEdge = false;
    aliens.forEach(alien => {
        if (alien.alive) {
            alien.x += alienDirection * alienSpeed;
            if (alien.x <= 0 || alien.x >= canvas.width - alien.width) {
                hitEdge = true;
            }
        }
    });

    // Change direction and move down when hitting edge
    if (hitEdge) {
        alienDirection *= -1;
        aliens.forEach(alien => {
            alien.y += 20;
        });
    }

    // Check if aliens reached player (bottom)
    aliens.forEach(alien => {
        if (alien.alive && alien.y + alien.height >= player.y) {
            lives--;
            updateLives();
            alien.alive = false;
            if (lives <= 0) {
                endGame();
            }
        }
    });

    // Check if all aliens destroyed - create new wave
    if (aliens.every(alien => !alien.alive)) {
        createAliens();
        alienSpeed += 0.5; // Increase speed for next wave
    }

    // Draw everything
    drawPlayer();
    drawAliens();
    drawBullets();

    // Continue game loop
    animationId = requestAnimationFrame(update);
}

// Shoot bullet
function shoot() {
    bullets.push({
        x: player.x + player.width / 2 - 2,
        y: player.y
    });
}

// Update lives display
function updateLives() {
    const hearts = '❤️'.repeat(lives);
    livesDisplay.textContent = `Lives: ${hearts}`;
}

// Start game function
function startGame() {
    gameRunning = true;
    score = 0;
    lives = 3;
    alienSpeed = 1;
    scoreDisplay.textContent = 'Score: 0';
    updateLives();
    createStars();
    createAliens();
    bullets = [];
    player.x = canvas.width / 2 - 25;
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    update();
}

// End game function
function endGame() {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    finalScoreDisplay.textContent = `Final Score: ${score}`;
    gameOverScreen.classList.remove('hidden');
}

// Keyboard event listeners
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ' && gameRunning) {
        e.preventDefault();
        shoot();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Button event listeners
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

// Initialize stars on load
createStars();
