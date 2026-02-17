// Game Configuration
const CONFIG = {
    GRID_SIZE: 15,
    CELL_SIZE: 30,
    BASE_ECHO_DELAY: 3000,
    INITIAL_ENEMIES: 2,
    ENEMY_MOVE_INTERVAL: 1500,
    SPAWN_INTERVAL: 6000,
    POWERUP_SPAWN_INTERVAL: 10000,
    WAVE_ENEMY_COUNT: 5,
    BOSS_WAVE_INTERVAL: 5,
    FPS: 60
};

// Enemy Types
const ENEMY_TYPES = {
    NORMAL: { speed: 1, color: '#ff6b6b', health: 1, points: 10 },
    FAST: { speed: 0.7, color: '#ff9800', health: 1, points: 20 },
    TANK: { speed: 2, color: '#9c27b0', health: 2, points: 30 }
};

// Power-up Types
const POWERUP_TYPES = {
    SPEED: { 
        color: '#ffeb3b', 
        icon: '🚀', 
        duration: 8000, 
        effect: 'speed',
        name: 'Speed Boost'
    },
    SHIELD: { 
        color: '#64b5f6', 
        icon: '🛡️', 
        duration: 10000, 
        effect: 'shield',
        name: 'Shield'
    },
    UNDO: { 
        color: '#9c27b0', 
        icon: '⏮️', 
        duration: 0, 
        effect: 'undo',
        name: 'Undo Token'
    }
};

// Game State
const game = {
    canvas: null,
    ctx: null,
    player: null,
    enemies: [],
    obstacles: [],
    powerups: [],
    particles: [],
    commandQueue: [],
    activePowers: [],
    score: 0,
    wave: 1,
    combo: 1,
    undoTokens: 0,
    echoDelay: CONFIG.BASE_ECHO_DELAY,
    isRunning: false,
    isPaused: false,
    isBossWave: false,
    lastEnemyMove: 0,
    lastSpawn: 0,
    lastPowerupSpawn: 0,
    lastComboTime: 0,
    animationFrame: null,
    sprintActive: false
};

// Directions mapping
const DIRECTIONS = {
    'w': { x: 0, y: -1, name: 'UP' },
    'a': { x: -1, y: 0, name: 'LEFT' },
    's': { x: 0, y: 1, name: 'DOWN' },
    'd': { x: 1, y: 0, name: 'RIGHT' }
};

// Particle System
class Particle {
    constructor(x, y, color, size = 3) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.color = color;
        this.size = size;
        this.life = 1.0;
        this.decay = 0.02 + Math.random() * 0.02;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1; // gravity
        this.life -= this.decay;
        return this.life > 0;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.restore();
    }
}

// Create particle burst
function createParticles(x, y, color, count = 15) {
    const worldX = x * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2;
    const worldY = y * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2;
    
    for (let i = 0; i < count; i++) {
        game.particles.push(new Particle(worldX, worldY, color));
    }
}

// Initialize game
function init() {
    game.canvas = document.getElementById('game-canvas');
    game.ctx = game.canvas.getContext('2d');
    
    game.canvas.width = CONFIG.GRID_SIZE * CONFIG.CELL_SIZE;
    game.canvas.height = CONFIG.GRID_SIZE * CONFIG.CELL_SIZE;
    
    setupEventListeners();
    startNewGame();
}

// Setup event listeners
function setupEventListeners() {
    document.addEventListener('keydown', handleKeyPress);
    document.addEventListener('keyup', handleKeyUp);
    document.getElementById('restart-btn').addEventListener('click', startNewGame);
}

// Start a new game
function startNewGame() {
    // Reset game state
    game.player = {
        x: Math.floor(CONFIG.GRID_SIZE / 2),
        y: Math.floor(CONFIG.GRID_SIZE / 2)
    };
    
    game.enemies = [];
    game.obstacles = [];
    game.powerups = [];
    game.particles = [];
    game.commandQueue = [];
    game.activePowers = [];
    game.score = 0;
    game.wave = 1;
    game.combo = 1;
    game.undoTokens = 0;
    game.echoDelay = CONFIG.BASE_ECHO_DELAY;
    game.isPaused = false;
    game.isBossWave = false;
    game.lastEnemyMove = 0;
    game.lastSpawn = 0;
    game.lastPowerupSpawn = 0;
    game.lastComboTime = Date.now();
    game.sprintActive = false;
    
    // Generate obstacles
    generateObstacles();
    
    // Spawn initial enemies
    for (let i = 0; i < CONFIG.INITIAL_ENEMIES; i++) {
        spawnEnemy('NORMAL');
    }
    
    updateUI();
    document.getElementById('game-over').classList.add('hidden');
    
    if (!game.isRunning) {
        game.isRunning = true;
        gameLoop();
    }
}

// Generate random obstacles
function generateObstacles() {
    const obstacleCount = 8 + Math.floor(Math.random() * 5);
    
    for (let i = 0; i < obstacleCount; i++) {
        let x, y;
        let attempts = 0;
        
        do {
            x = Math.floor(Math.random() * CONFIG.GRID_SIZE);
            y = Math.floor(Math.random() * CONFIG.GRID_SIZE);
            attempts++;
        } while (
            ((Math.abs(x - game.player.x) < 3 && Math.abs(y - game.player.y) < 3) ||
            game.obstacles.some(obs => obs.x === x && obs.y === y)) &&
            attempts < 100
        );
        
        game.obstacles.push({ x, y });
    }
}

// Handle keyboard input
function handleKeyPress(e) {
    if (!game.isRunning) return;
    
    const key = e.key.toLowerCase();
    
    // Movement commands
    if (DIRECTIONS[key] && !game.isPaused) {
        e.preventDefault();
        queueCommand(key, DIRECTIONS[key]);
    }
    
    // Special commands
    if (key === ' ') {
        e.preventDefault();
        game.isPaused = !game.isPaused;
    }
    
    if (key === 'c' && !game.isPaused) {
        e.preventDefault();
        clearCommandQueue();
    }
    
    if (key === 'z' && !game.isPaused) {
        e.preventDefault();
        undoLastCommand();
    }
    
    if (key === 'shift') {
        game.sprintActive = true;
    }
}

function handleKeyUp(e) {
    if (e.key.toLowerCase() === 'shift') {
        game.sprintActive = false;
    }
}

// Queue a command
function queueCommand(key, direction) {
    const delay = getCurrentEchoDelay();
    
    const command = {
        id: Date.now() + Math.random(),
        key: key,
        direction: direction,
        timestamp: Date.now(),
        executeAt: Date.now() + delay,
        isSprint: game.sprintActive
    };
    
    game.commandQueue.push(command);
    updateCommandQueueUI();
}

// Get current echo delay (modified by power-ups and boss waves)
function getCurrentEchoDelay() {
    let delay = game.echoDelay;
    
    // Speed power-up reduces delay
    const speedPower = game.activePowers.find(p => p.effect === 'speed');
    if (speedPower) {
        delay = delay * 0.5;
    }
    
    // Boss wave fluctuates delay
    if (game.isBossWave) {
        delay = 1000 + Math.random() * 4000; // 1-5 seconds random
    }
    
    return delay;
}

// Execute queued commands
function executeCommands(currentTime) {
    if (game.isPaused) return;
    
    const commandsToExecute = game.commandQueue.filter(cmd => currentTime >= cmd.executeAt);
    
    commandsToExecute.forEach(cmd => {
        const moved = movePlayer(cmd.direction, cmd.isSprint);
        if (moved) {
            createParticles(game.player.x, game.player.y, '#00ff88', 5);
        }
        game.commandQueue = game.commandQueue.filter(c => c.id !== cmd.id);
    });
    
    if (commandsToExecute.length > 0) {
        updateCommandQueueUI();
    }
}

// Move player
function movePlayer(direction, isSprint = false) {
    const distance = isSprint ? 2 : 1;
    const newX = game.player.x + (direction.x * distance);
    const newY = game.player.y + (direction.y * distance);
    
    // Check bounds
    if (newX < 0 || newX >= CONFIG.GRID_SIZE || newY < 0 || newY >= CONFIG.GRID_SIZE) {
        return false;
    }
    
    // Check obstacles
    if (game.obstacles.some(obs => obs.x === newX && obs.y === newY)) {
        return false;
    }
    
    game.player.x = newX;
    game.player.y = newY;
    
    // Check collision with enemies
    if (checkEnemyCollision()) {
        handleEnemyCollision();
        return true;
    }
    
    // Check power-up collection
    checkPowerupCollection();
    
    // Update combo
    updateCombo();
    
    return true;
}

// Undo last command
function undoLastCommand() {
    if (game.undoTokens > 0 && game.commandQueue.length > 0) {
        game.commandQueue.pop();
        game.undoTokens--;
        updateCommandQueueUI();
        updateUI();
        
        createParticles(game.player.x, game.player.y, '#9c27b0', 8);
    }
}

// Spawn a new enemy
function spawnEnemy(type = 'NORMAL') {
    let x, y;
    let attempts = 0;
    
    do {
        x = Math.floor(Math.random() * CONFIG.GRID_SIZE);
        y = Math.floor(Math.random() * CONFIG.GRID_SIZE);
        attempts++;
    } while (
        ((Math.abs(x - game.player.x) < 4 && Math.abs(y - game.player.y) < 4) ||
        game.obstacles.some(obs => obs.x === x && obs.y === y)) &&
        attempts < 50
    );
    
    const enemyType = ENEMY_TYPES[type];
    game.enemies.push({ 
        x, 
        y, 
        type: type,
        speed: enemyType.speed,
        color: enemyType.color,
        health: enemyType.health,
        moveCounter: 0
    });
    
    createParticles(x, y, enemyType.color, 10);
    updateUI();
}

// Spawn power-up
function spawnPowerup() {
    let x, y;
    let attempts = 0;
    
    do {
        x = Math.floor(Math.random() * CONFIG.GRID_SIZE);
        y = Math.floor(Math.random() * CONFIG.GRID_SIZE);
        attempts++;
    } while (
        ((game.player.x === x && game.player.y === y) ||
        game.obstacles.some(obs => obs.x === x && obs.y === y) ||
        game.powerups.some(p => p.x === x && p.y === y)) &&
        attempts < 50
    );
    
    const types = Object.keys(POWERUP_TYPES);
    const type = types[Math.floor(Math.random() * types.length)];
    const powerup = POWERUP_TYPES[type];
    
    game.powerups.push({ 
        x, 
        y, 
        type: type,
        color: powerup.color,
        icon: powerup.icon
    });
}

// Check power-up collection
function checkPowerupCollection() {
    const collected = game.powerups.filter(p => p.x === game.player.x && p.y === game.player.y);
    
    collected.forEach(powerup => {
        const type = POWERUP_TYPES[powerup.type];
        
        if (type.effect === 'undo') {
            game.undoTokens += 3;
        } else {
            game.activePowers.push({
                effect: type.effect,
                name: type.name,
                endsAt: Date.now() + type.duration
            });
        }
        
        createParticles(powerup.x, powerup.y, powerup.color, 20);
        game.score += 50;
        
        game.powerups = game.powerups.filter(p => p !== powerup);
    });
    
    updateActivePowersUI();
    updateUI();
}

// Update active powers
function updateActivePowers(currentTime) {
    game.activePowers = game.activePowers.filter(p => currentTime < p.endsAt);
    updateActivePowersUI();
}

// Move enemies toward player
function moveEnemies() {
    game.enemies.forEach(enemy => {
        enemy.moveCounter++;
        
        // Different enemies move at different speeds
        if (enemy.moveCounter >= enemy.speed) {
            enemy.moveCounter = 0;
            
            const dx = game.player.x - enemy.x;
            const dy = game.player.y - enemy.y;
            
            let moved = false;
            
            // Try to move toward player
            if (Math.abs(dx) > Math.abs(dy) && dx !== 0) {
                const newX = enemy.x + Math.sign(dx);
                if (!game.obstacles.some(obs => obs.x === newX && obs.y === enemy.y)) {
                    enemy.x = newX;
                    moved = true;
                }
            } else if (dy !== 0) {
                const newY = enemy.y + Math.sign(dy);
                if (!game.obstacles.some(obs => obs.x === enemy.x && obs.y === newY)) {
                    enemy.y = newY;
                    moved = true;
                }
            }
            
            // If blocked, try alternative direction
            if (!moved) {
                if (dy !== 0) {
                    const newY = enemy.y + Math.sign(dy);
                    if (!game.obstacles.some(obs => obs.x === enemy.x && obs.y === newY)) {
                        enemy.y = newY;
                    }
                } else if (dx !== 0) {
                    const newX = enemy.x + Math.sign(dx);
                    if (!game.obstacles.some(obs => obs.x === newX && obs.y === enemy.y)) {
                        enemy.x = newX;
                    }
                }
            }
        }
    });
    
    if (checkEnemyCollision()) {
        handleEnemyCollision();
    }
}

// Check collision with enemies
function checkEnemyCollision() {
    return game.enemies.some(enemy => 
        enemy.x === game.player.x && enemy.y === game.player.y
    );
}

// Handle enemy collision
function handleEnemyCollision() {
    const shieldPower = game.activePowers.find(p => p.effect === 'shield');
    
    if (shieldPower) {
        // Shield absorbs hit
        game.activePowers = game.activePowers.filter(p => p !== shieldPower);
        
        // Remove colliding enemies
        const collidingEnemies = game.enemies.filter(e => e.x === game.player.x && e.y === game.player.y);
        collidingEnemies.forEach(enemy => {
            createParticles(enemy.x, enemy.y, '#64b5f6', 25);
            game.score += ENEMY_TYPES[enemy.type].points * game.combo;
        });
        game.enemies = game.enemies.filter(e => e.x !== game.player.x || e.y !== game.player.y);
        
        updateActivePowersUI();
        updateUI();
    } else {
        gameOver();
    }
}

// Update combo system
function updateCombo() {
    const currentTime = Date.now();
    
    if (currentTime - game.lastComboTime < 3000) {
        game.combo = Math.min(game.combo + 0.1, 5);
    } else {
        game.combo = Math.max(game.combo - 0.5, 1);
    }
    
    game.lastComboTime = currentTime;
    updateUI();
}

// Clear command queue
function clearCommandQueue() {
    game.commandQueue = [];
    updateCommandQueueUI();
}

// Check for wave completion and boss waves
function checkWaveProgress() {
    if (game.enemies.length === 0) {
        game.wave++;
        game.score += 100 * game.wave;
        
        // Check if boss wave
        if (game.wave % CONFIG.BOSS_WAVE_INTERVAL === 0) {
            startBossWave();
        } else {
            game.isBossWave = false;
            
            // Spawn new wave
            const enemyCount = CONFIG.WAVE_ENEMY_COUNT + Math.floor(game.wave / 2);
            for (let i = 0; i < enemyCount; i++) {
                const rand = Math.random();
                let type = 'NORMAL';
                
                if (rand < 0.2) type = 'FAST';
                else if (rand < 0.35) type = 'TANK';
                
                spawnEnemy(type);
            }
        }
        
        updateUI();
    }
}

// Start boss wave
function startBossWave() {
    game.isBossWave = true;
    
    // Show boss warning
    const warning = document.createElement('div');
    warning.className = 'boss-warning';
    warning.textContent = '⚠️ BOSS WAVE ⚠️';
    document.body.appendChild(warning);
    
    setTimeout(() => {
        warning.remove();
    }, 2000);
    
    // Spawn tough enemies
    for (let i = 0; i < 3; i++) {
        spawnEnemy('TANK');
    }
    for (let i = 0; i < 4; i++) {
        spawnEnemy('FAST');
    }
}

// Game over
function gameOver() {
    game.isRunning = false;
    
    // Death particles
    createParticles(game.player.x, game.player.y, '#ff0000', 40);
    
    document.getElementById('final-score').textContent = game.score;
    document.getElementById('game-over').classList.remove('hidden');
    
    if (game.animationFrame) {
        cancelAnimationFrame(game.animationFrame);
    }
}

// Update UI elements
function updateUI() {
    document.getElementById('score').textContent = Math.floor(game.score);
    document.getElementById('level').textContent = game.wave;
    document.getElementById('enemies').textContent = game.enemies.length;
    document.getElementById('delay').textContent = (game.echoDelay / 1000).toFixed(1) + 's';
    document.getElementById('combo').textContent = 'x' + game.combo.toFixed(1);
    document.getElementById('undo-count').textContent = game.undoTokens;
}

// Update active powers UI
function updateActivePowersUI() {
    const container = document.getElementById('active-powers');
    container.innerHTML = '';
    
    game.activePowers.forEach(power => {
        const item = document.createElement('div');
        item.className = `power-item ${power.effect}`;
        
        const timeLeft = Math.max(0, (power.endsAt - Date.now()) / 1000);
        item.textContent = `${power.name} (${timeLeft.toFixed(1)}s)`;
        
        container.appendChild(item);
    });
}

// Update command queue UI
function updateCommandQueueUI() {
    const queueContainer = document.getElementById('command-queue');
    queueContainer.innerHTML = '';
    
    const currentTime = Date.now();
    
    game.commandQueue.forEach(cmd => {
        const item = document.createElement('div');
        item.className = 'command-item';
        
        const timeLeft = Math.max(0, (cmd.executeAt - currentTime) / 1000);
        
        if (timeLeft < 0.5) {
            item.classList.add('executing');
        }
        
        const sprintLabel = cmd.isSprint ? ' SPRINT' : '';
        
        item.innerHTML = `
            <div class="command-key">${cmd.direction.name}${sprintLabel}</div>
            <div class="command-time">Key: ${cmd.key.toUpperCase()}</div>
            <div class="command-timer">${timeLeft.toFixed(1)}s</div>
        `;
        
        queueContainer.appendChild(item);
    });
}

// Render game
function render() {
    const ctx = game.ctx;
    
    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
    
    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= CONFIG.GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CONFIG.CELL_SIZE, 0);
        ctx.lineTo(i * CONFIG.CELL_SIZE, game.canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * CONFIG.CELL_SIZE);
        ctx.lineTo(game.canvas.width, i * CONFIG.CELL_SIZE);
        ctx.stroke();
    }
    
    // Draw obstacles
    ctx.fillStyle = '#555';
    ctx.shadowBlur = 5;
    ctx.shadowColor = '#333';
    game.obstacles.forEach(obs => {
        ctx.fillRect(
            obs.x * CONFIG.CELL_SIZE + 2,
            obs.y * CONFIG.CELL_SIZE + 2,
            CONFIG.CELL_SIZE - 4,
            CONFIG.CELL_SIZE - 4
        );
    });
    ctx.shadowBlur = 0;
    
    // Draw power-ups
    game.powerups.forEach(powerup => {
        ctx.fillStyle = powerup.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = powerup.color;
        
        const centerX = powerup.x * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2;
        const centerY = powerup.y * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2;
        const pulse = Math.sin(Date.now() / 200) * 2;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, CONFIG.CELL_SIZE / 4 + pulse, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(powerup.icon, centerX, centerY);
    });
    
    // Draw particles
    game.particles = game.particles.filter(p => {
        const alive = p.update();
        if (alive) p.draw(ctx);
        return alive;
    });
    
    // Draw player
    const shieldActive = game.activePowers.some(p => p.effect === 'shield');
    
    if (shieldActive) {
        ctx.strokeStyle = '#64b5f6';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#64b5f6';
        ctx.beginPath();
        ctx.arc(
            game.player.x * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2,
            game.player.y * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2,
            CONFIG.CELL_SIZE / 2.5,
            0,
            Math.PI * 2
        );
        ctx.stroke();
        ctx.shadowBlur = 0;
    }
    
    ctx.fillStyle = '#00ff88';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00ff88';
    ctx.beginPath();
    ctx.arc(
        game.player.x * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2,
        game.player.y * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2,
        CONFIG.CELL_SIZE / 3,
        0,
        Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Draw player direction indicator
    if (game.commandQueue.length > 0) {
        const nextCmd = game.commandQueue[0];
        const distance = nextCmd.isSprint ? 2 : 1;
        const futureX = game.player.x + (nextCmd.direction.x * distance);
        const futureY = game.player.y + (nextCmd.direction.y * distance);
        
        if (futureX >= 0 && futureX < CONFIG.GRID_SIZE && 
            futureY >= 0 && futureY < CONFIG.GRID_SIZE) {
            ctx.strokeStyle = 'rgba(0, 255, 136, 0.3)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(
                futureX * CONFIG.CELL_SIZE + 2,
                futureY * CONFIG.CELL_SIZE + 2,
                CONFIG.CELL_SIZE - 4,
                CONFIG.CELL_SIZE - 4
            );
            ctx.setLineDash([]);
        }
    }
    
    // Draw enemies
    ctx.shadowBlur = 15;
    game.enemies.forEach(enemy => {
        ctx.fillStyle = enemy.color;
        ctx.shadowColor = enemy.color;
        
        const size = enemy.type === 'TANK' ? CONFIG.CELL_SIZE - 4 : CONFIG.CELL_SIZE - 6;
        const offset = (CONFIG.CELL_SIZE - size) / 2;
        
        ctx.fillRect(
            enemy.x * CONFIG.CELL_SIZE + offset,
            enemy.y * CONFIG.CELL_SIZE + offset,
            size,
            size
        );
    });
    ctx.shadowBlur = 0;
    
    // Draw boss wave indicator
    if (game.isBossWave) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
        ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
        
        ctx.strokeStyle = '#ff0';
        ctx.lineWidth = 3;
        ctx.strokeRect(2, 2, game.canvas.width - 4, game.canvas.height - 4);
    }
    
    // Draw pause indicator
    if (game.isPaused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 40px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', game.canvas.width / 2, game.canvas.height / 2);
    }
}

// Main game loop
function gameLoop() {
    if (!game.isRunning) return;
    
    const currentTime = Date.now();
    
    if (!game.isPaused) {
        // Execute queued commands
        executeCommands(currentTime);
        
        // Update active powers
        updateActivePowers(currentTime);
        
        // Move enemies periodically
        if (currentTime - game.lastEnemyMove > CONFIG.ENEMY_MOVE_INTERVAL) {
            moveEnemies();
            game.lastEnemyMove = currentTime;
            game.score += 5 * game.combo;
            updateUI();
        }
        
        // Spawn new enemies periodically (only when not in wave-based mode)
        if (currentTime - game.lastSpawn > CONFIG.SPAWN_INTERVAL && game.enemies.length < 15) {
            const rand = Math.random();
            let type = 'NORMAL';
            
            if (rand < 0.15) type = 'FAST';
            else if (rand < 0.25) type = 'TANK';
            
            spawnEnemy(type);
            game.lastSpawn = currentTime;
        }
        
        // Spawn power-ups periodically
        if (currentTime - game.lastPowerupSpawn > CONFIG.POWERUP_SPAWN_INTERVAL) {
            spawnPowerup();
            game.lastPowerupSpawn = currentTime;
        }
        
        // Check wave progress
        checkWaveProgress();
    }
    
    // Update command queue timers
    updateCommandQueueUI();
    
    // Render
    render();
    
    // Continue loop
    game.animationFrame = requestAnimationFrame(gameLoop);
}

// Start game when page loads
window.addEventListener('load', init);
