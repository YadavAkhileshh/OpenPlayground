const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let gameState = 'start'; // start, playing, paused, gameover
let score = 0;
let lives = 3;
let level = 1;
let animationId = null;

// Player
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 60,
    width: 50,
    height: 40,
    speed: 7,
    color: '#FF9800'
};

// Bullets
const bullets = [];
const bulletSpeed = 8;
let bulletCooldown = 0;
const bulletCooldownMax = 20;

// Enemies
let enemies = [];
let enemySpeed = 1;
let enemyDirection = 1;
const enemyDropDistance = 20;

// Enemy types with vibrant colors
const enemyTypes = [
    { emoji: '😴', color: '#FF9800', points: 10 }, // Orange
    { emoji: '😵', color: '#FFEB3B', points: 15 }, // Yellow
    { emoji: '🤯', color: '#8BC34A', points: 25 }, // Green
    { emoji: '👾', color: '#FF5722', points: 50 }  // Deep Orange
];

// Power-ups
const powerUps = [];
let isRapidFire = false;
let rapidFireTimer = 0;
let isShielded = false;
let shieldTimer = 0;

// Input
const keys = {};

// Initialize game
function init() {
    createEnemies();
    setupEventListeners();
    updateUI();
    if (!animationId) {
        gameLoop();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Game control buttons
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('pauseBtn').addEventListener('click', togglePause);
    document.getElementById('restartBtn').addEventListener('click', restartGame);
    document.getElementById('playAgainBtn').addEventListener('click', restartGame);
    
    // Keyboard events
    document.addEventListener('keydown', (e) => {
        keys[e.key] = true;
        
        if (e.key === ' ' && gameState === 'playing') {
            shoot();
        }
        
        if (e.key === 'p' || e.key === 'P') {
            togglePause();
        }
        
        if (e.key === 'Enter' && gameState === 'start') {
            startGame();
        }
    });
    
    document.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });
    
    // Touch/mobile controls
    canvas.addEventListener('touchstart', handleTouch);
    canvas.addEventListener('touchmove', handleTouch);
}

function handleTouch(e) {
    e.preventDefault();
    if (e.touches[0] && gameState === 'playing') {
        const touchX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
        player.x = touchX - player.width / 2;
        
        // Keep player in bounds
        if (player.x < 0) player.x = 0;
        if (player.x > canvas.width - player.width) {
            player.x = canvas.width - player.width;
        }
    }
}

function startGame() {
    gameState = 'playing';
    score = 0;
    lives = 3;
    level = 1;
    player.x = canvas.width / 2 - 25;
    isShielded = false;
    isRapidFire = false;
    
    bullets.length = 0;
    enemies.length = 0;
    powerUps.length = 0;
    
    createEnemies();
    updateUI();
    document.getElementById('gameOverScreen').style.display = 'none';
    
    if (!animationId) {
        gameLoop();
    }
}

function togglePause() {
    if (gameState === 'playing') {
        gameState = 'paused';
    } else if (gameState === 'paused') {
        gameState = 'playing';
        if (!animationId) {
            gameLoop();
        }
    }
}

function restartGame() {
    startGame();
}

function createEnemies() {
    enemies = [];
    const rows = 4 + Math.min(level - 1, 3);
    const cols = 8 + Math.min(level - 1, 4);
    
    const enemyWidth = 40;
    const enemyHeight = 40;
    const padding = 20;
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const enemyType = enemyTypes[Math.min(row, enemyTypes.length - 1)];
            
            enemies.push({
                x: col * (enemyWidth + padding) + 50,
                y: row * (enemyHeight + padding) + 50,
                width: enemyWidth,
                height: enemyHeight,
                type: enemyType,
                speed: enemyType === enemyTypes[2] ? 1.5 : 1
            });
        }
    }
    
    enemySpeed = 1 + (level - 1) * 0.2;
}

function shoot() {
    if (bulletCooldown > 0) return;
    
    bullets.push({
        x: player.x + player.width / 2 - 3,
        y: player.y,
        width: 6,
        height: 15,
        color: '#FFEB3B',
        speed: bulletSpeed
    });
    
    if (isRapidFire) {
        bullets.push({
            x: player.x + player.width / 2 - 8,
            y: player.y,
            width: 6,
            height: 15,
            color: '#FFEB3B',
            speed: bulletSpeed
        });
        
        bullets.push({
            x: player.x + player.width / 2 + 2,
            y: player.y,
            width: 6,
            height: 15,
            color: '#FFEB3B',
            speed: bulletSpeed
        });
    }
    
    bulletCooldown = isRapidFire ? bulletCooldownMax / 2 : bulletCooldownMax;
}

function createPowerUp(x, y) {
    const powerUpTypes = [
        {
            type: 'rapid',
            color: '#FF9800',
            emoji: '⚡',
            effect: () => {
                isRapidFire = true;
                rapidFireTimer = 300; // 5 seconds at 60fps
            }
        },
        {
            type: 'shield',
            color: '#8BC34A',
            emoji: '🛡️',
            effect: () => {
                isShielded = true;
                shieldTimer = 480; // 8 seconds at 60fps
            }
        }
    ];
    
    const powerUpType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
    
    powerUps.push({
        x: x,
        y: y,
        width: 30,
        height: 30,
        type: powerUpType.type,
        color: powerUpType.color,
        emoji: powerUpType.emoji,
        effect: powerUpType.effect,
        speed: 2
    });
}

function update() {
    if (gameState !== 'playing') return;
    
    // Update cooldowns
    if (bulletCooldown > 0) bulletCooldown--;
    if (rapidFireTimer > 0) {
        rapidFireTimer--;
        if (rapidFireTimer <= 0) {
            isRapidFire = false;
        }
    }
    if (shieldTimer > 0) {
        shieldTimer--;
        if (shieldTimer <= 0) {
            isShielded = false;
        }
    }
    
    // Handle input
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        player.x -= player.speed;
    }
    if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        player.x += player.speed;
    }
    
    // Keep player in bounds
    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width - player.width) {
        player.x = canvas.width - player.width;
    }
    
    // Update bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.y -= bullet.speed;
        
        if (bullet.y < 0) {
            bullets.splice(i, 1);
        }
    }
    
    // Update enemies
    let shouldDrop = false;
    let hasEnemies = false;
    
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        hasEnemies = true;
        
        enemy.x += enemy.speed * enemyDirection * enemySpeed;
        
        if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
            shouldDrop = true;
        }
        
        if (enemy.y + enemy.height >= canvas.height) {
            lives--;
            enemies.splice(i, 1);
            updateUI();
            continue;
        }
        
        // Check bullet collisions
        for (let j = bullets.length - 1; j >= 0; j--) {
            const bullet = bullets[j];
            
            if (checkCollision(bullet, enemy)) {
                score += enemy.type.points;
                
                if (Math.random() < 0.2) {
                    createPowerUp(enemy.x, enemy.y);
                }
                
                enemies.splice(i, 1);
                bullets.splice(j, 1);
                updateUI();
                break;
            }
        }
    }
    
    if (!hasEnemies) {
        level++;
        createEnemies();
        updateUI();
    }
    
    if (shouldDrop) {
        enemyDirection *= -1;
        for (const enemy of enemies) {
            enemy.y += enemyDropDistance;
        }
    }
    
    // Update power-ups
    for (let i = powerUps.length - 1; i >= 0; i--) {
        const powerUp = powerUps[i];
        powerUp.y += powerUp.speed;
        
        if (checkCollision(powerUp, player)) {
            powerUp.effect();
            powerUps.splice(i, 1);
            continue;
        }
        
        if (powerUp.y > canvas.height) {
            powerUps.splice(i, 1);
        }
    }
    
    if (lives <= 0) {
        gameOver();
    }
}

function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw stars
    drawStars();
    
    // Draw player
    drawPlayer();
    
    // Draw bullets
    for (const bullet of bullets) {
        ctx.fillStyle = bullet.color;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        
        // Add glow
        ctx.shadowColor = bullet.color;
        ctx.shadowBlur = 10;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        ctx.shadowBlur = 0;
    }
    
    // Draw enemies
    for (const enemy of enemies) {
        drawEnemy(enemy);
    }
    
    // Draw power-ups
    for (const powerUp of powerUps) {
        drawPowerUp(powerUp);
    }
    
    // Draw shield
    if (isShielded) {
        ctx.strokeStyle = '#8BC34A';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(
            player.x + player.width / 2,
            player.y + player.height / 2,
            player.width / 2 + 10,
            0,
            Math.PI * 2
        );
        ctx.stroke();
        
        ctx.shadowColor = '#8BC34A';
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.shadowBlur = 0;
    }
}

function drawStars() {
    ctx.fillStyle = 'white';
    for (let i = 0; i < 50; i++) {
        const x = (i * 37) % canvas.width;
        const y = (i * 23) % canvas.height;
        const size = Math.random() * 2;
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawPlayer() {
    // Draw ship body
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.closePath();
    ctx.fill();
    
    // Draw ship details
    ctx.fillStyle = '#FF5722';
    ctx.fillRect(player.x + player.width / 2 - 5, player.y + 10, 10, 15);
    
    // Add glow
    ctx.shadowColor = player.color;
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.shadowBlur = 0;
}

function drawEnemy(enemy) {
    // Draw enemy background
    ctx.fillStyle = enemy.type.color;
    ctx.beginPath();
    ctx.arc(
        enemy.x + enemy.width / 2,
        enemy.y + enemy.height / 2,
        enemy.width / 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // Draw emoji
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'white';
    ctx.fillText(
        enemy.type.emoji,
        enemy.x + enemy.width / 2,
        enemy.y + enemy.height / 2
    );
    
    // Add glow
    ctx.shadowColor = enemy.type.color;
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;
}

function drawPowerUp(powerUp) {
    // Draw power-up background
    ctx.fillStyle = powerUp.color;
    ctx.beginPath();
    ctx.arc(
        powerUp.x + powerUp.width / 2,
        powerUp.y + powerUp.height / 2,
        powerUp.width / 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // Draw emoji/symbol
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'white';
    ctx.fillText(
        powerUp.emoji,
        powerUp.x + powerUp.width / 2,
        powerUp.y + powerUp.height / 2
    );
    
    // Add pulsing effect
    ctx.shadowColor = powerUp.color;
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.shadowBlur = 0;
}

function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
    document.getElementById('level').textContent = level;
}

function gameOver() {
    gameState = 'gameover';
    document.getElementById('gameOverScreen').style.display = 'block';
    document.getElementById('finalScore').textContent = score;
    
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}

function gameLoop() {
    update();
    draw();
    animationId = requestAnimationFrame(gameLoop);
}

// Start the game when page loads
window.addEventListener('load', init);