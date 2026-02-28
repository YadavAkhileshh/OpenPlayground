/* ============================================
   PACMAN GAME - Enhanced Game Logic
   ============================================ */

// ============================================
// GAME CONFIGURATION
// ============================================
const CONFIG = {
    CELL_SIZE: 30,
    FPS: 60,                    // Frames per second for smooth animation
    PACMAN_SPEED: 4,            // Pixels per frame
    GHOST_SPEED: 3,             // Pixels per frame
    GHOST_SCARED_SPEED: 2,      // Pixels per frame when scared
    POWER_DURATION: 8000,       // 8 seconds
    POWER_WARNING: 3000,        // Start warning 3 seconds before end
    POINTS_PELLET: 10,
    POINTS_POWER: 50,
    POINTS_GHOST: 200,
    GHOST_EATEN_PAUSE: 500,     // Pause duration when ghost is eaten
};

// ============================================
// MAZE LAYOUT (0=path, 1=wall, 2=pellet, 3=power pellet)
// ============================================
const MAZE = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
    [1,3,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,3,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,2,1],
    [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
    [1,1,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,1,1],
    [1,1,1,1,2,1,2,2,2,2,2,2,2,1,2,1,1,1,1],
    [1,1,1,1,2,1,2,1,0,0,0,1,2,1,2,1,1,1,1],
    [2,2,2,2,2,2,2,1,0,0,0,1,2,2,2,2,2,2,2],
    [1,1,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,1,1],
    [1,1,1,1,2,1,2,2,2,2,2,2,2,1,2,1,1,1,1],
    [1,1,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
    [1,3,2,1,2,2,2,2,2,2,2,2,2,2,2,1,2,3,1],
    [1,1,2,1,2,1,2,1,1,1,1,1,2,1,2,1,2,1,1],
    [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
    [1,2,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

// ============================================
// GAME STATE
// ============================================
let gameState = {
    score: 0,
    lives: 3,
    powerMode: false,
    powerModeTimer: null,
    powerWarning: false,
    gameOver: false,
    paused: true,
    level: 1,
    pelletsRemaining: 0,
    ghostMultiplier: 1,  // Multiplier for eating multiple ghosts
};

// ============================================
// PACMAN OBJECT
// ============================================
let pacman = {
    gridX: 9,           // Grid position
    gridY: 15,
    pixelX: 9 * CONFIG.CELL_SIZE,   // Actual pixel position for smooth movement
    pixelY: 15 * CONFIG.CELL_SIZE,
    direction: { x: 0, y: 0 },
    nextDirection: { x: 0, y: 0 },
    mouthOpen: true,
    mouthAnimationCounter: 0,
    targetX: 9,         // Target grid position
    targetY: 15,
    isMoving: false,
};

// ============================================
// GHOST OBJECTS
// ============================================
let ghosts = [
    { 
        gridX: 8, gridY: 8,
        pixelX: 8 * CONFIG.CELL_SIZE,
        pixelY: 8 * CONFIG.CELL_SIZE,
        targetX: 8, targetY: 8,
        color: '#ff0000', 
        name: 'blinky', 
        direction: { x: 1, y: 0 },
        personality: 'aggressive',  // Chases directly
        isEaten: false,
    },
    { 
        gridX: 9, gridY: 9,
        pixelX: 9 * CONFIG.CELL_SIZE,
        pixelY: 9 * CONFIG.CELL_SIZE,
        targetX: 9, targetY: 9,
        color: '#ffb8ff', 
        name: 'pinky', 
        direction: { x: 0, y: -1 },
        personality: 'ambush',      // Tries to get ahead
        isEaten: false,
    },
    { 
        gridX: 10, gridY: 9,
        pixelX: 10 * CONFIG.CELL_SIZE,
        pixelY: 10 * CONFIG.CELL_SIZE,
        targetX: 10, targetY: 9,
        color: '#00ffde', 
        name: 'inky', 
        direction: { x: -1, y: 0 },
        personality: 'patrol',      // Patrols areas
        isEaten: false,
    },
    { 
        gridX: 9, gridY: 10,
        pixelX: 9 * CONFIG.CELL_SIZE,
        pixelY: 10 * CONFIG.CELL_SIZE,
        targetX: 9, targetY: 10,
        color: '#ffb851', 
        name: 'clyde', 
        direction: { x: 0, y: 1 },
        personality: 'random',      // Random with occasional chasing
        isEaten: false,
    },
];

// ============================================
// CANVAS SETUP
// ============================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = MAZE[0].length * CONFIG.CELL_SIZE;
canvas.height = MAZE.length * CONFIG.CELL_SIZE;

// ============================================
// DOM ELEMENTS
// ============================================
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const gameStatusElement = document.getElementById('game-status');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const finalScoreElement = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');

// ============================================
// INITIALIZATION
// ============================================
function init() {
    // Count initial pellets
    gameState.pelletsRemaining = 0;
    for (let row of MAZE) {
        for (let cell of row) {
            if (cell === 2 || cell === 3) {
                gameState.pelletsRemaining++;
            }
        }
    }
    
    drawMaze();
    drawPacman();
    drawGhosts();
    updateUI();
    
    // Start game after short delay
    setTimeout(() => {
        gameState.paused = false;
        gameStatusElement.textContent = 'GO!';
        startGameLoop();
    }, 2000);
}

// ============================================
// DRAWING FUNCTIONS
// ============================================

function drawMaze() {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (let y = 0; y < MAZE.length; y++) {
        for (let x = 0; x < MAZE[y].length; x++) {
            const cell = MAZE[y][x];
            
            // Draw walls
            if (cell === 1) {
                ctx.fillStyle = '#2121ff';
                ctx.strokeStyle = '#4848ff';
                ctx.lineWidth = 2;
                ctx.fillRect(
                    x * CONFIG.CELL_SIZE + 2,
                    y * CONFIG.CELL_SIZE + 2,
                    CONFIG.CELL_SIZE - 4,
                    CONFIG.CELL_SIZE - 4
                );
                ctx.strokeRect(
                    x * CONFIG.CELL_SIZE + 2,
                    y * CONFIG.CELL_SIZE + 2,
                    CONFIG.CELL_SIZE - 4,
                    CONFIG.CELL_SIZE - 4
                );
            }
            // Draw pellets
            else if (cell === 2) {
                ctx.fillStyle = '#ffb897';
                ctx.beginPath();
                ctx.arc(
                    x * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2,
                    y * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2,
                    3,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
            // Draw power pellets
            else if (cell === 3) {
                ctx.fillStyle = gameState.powerMode ? '#ff00ff' : '#ffff00';
                ctx.shadowBlur = 10;
                ctx.shadowColor = gameState.powerMode ? '#ff00ff' : '#ffff00';
                ctx.beginPath();
                ctx.arc(
                    x * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2,
                    y * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2,
                    6,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }
    }
}

function drawPacman() {
    const centerX = pacman.pixelX + CONFIG.CELL_SIZE / 2;
    const centerY = pacman.pixelY + CONFIG.CELL_SIZE / 2;
    const radius = CONFIG.CELL_SIZE / 2 - 4;
    
    // Determine mouth angle based on direction
    let rotation = 0;
    if (pacman.direction.x === 1) rotation = 0;
    else if (pacman.direction.x === -1) rotation = Math.PI;
    else if (pacman.direction.y === 1) rotation = Math.PI / 2;
    else if (pacman.direction.y === -1) rotation = -Math.PI / 2;
    
    // Smooth mouth animation
    const mouthAngle = pacman.mouthOpen ? 0.2 : 0.6;
    
    ctx.fillStyle = '#ffff00';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ffff00';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, rotation + mouthAngle, rotation + (Math.PI * 2) - mouthAngle);
    ctx.lineTo(centerX, centerY);
    ctx.fill();
    ctx.shadowBlur = 0;
}

function drawGhosts() {
    ghosts.forEach(ghost => {
        if (ghost.isEaten) return; // Don't draw eaten ghosts
        
        const centerX = ghost.pixelX + CONFIG.CELL_SIZE / 2;
        const centerY = ghost.pixelY + CONFIG.CELL_SIZE / 2;
        const radius = CONFIG.CELL_SIZE / 2 - 4;
        
        // Ghost color (blue when scared, flashing when power mode ending)
        let ghostColor = ghost.color;
        if (gameState.powerMode) {
            if (gameState.powerWarning && Math.floor(Date.now() / 200) % 2 === 0) {
                ghostColor = '#ffffff'; // Flash white
            } else {
                ghostColor = '#2121de'; // Blue when scared
            }
        }
        
        ctx.fillStyle = ghostColor;
        ctx.shadowBlur = 10;
        ctx.shadowColor = ghostColor;
        
        // Ghost body (rounded top)
        ctx.beginPath();
        ctx.arc(centerX, centerY - 2, radius, Math.PI, 0, false);
        ctx.lineTo(centerX + radius, centerY + radius);
        
        // Wavy bottom with animation
        const waveWidth = radius / 2;
        const waveOffset = Math.sin(Date.now() / 200 + ghost.gridX) * 2;
        ctx.lineTo(centerX + waveWidth, centerY + radius - 4 + waveOffset);
        ctx.lineTo(centerX, centerY + radius);
        ctx.lineTo(centerX - waveWidth, centerY + radius - 4 - waveOffset);
        ctx.lineTo(centerX - radius, centerY + radius);
        
        ctx.closePath();
        ctx.fill();
        
        // Eyes
        const eyeRadius = 3;
        const eyeOffset = 5;
        
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 0;
        
        // Left eye
        ctx.beginPath();
        ctx.arc(centerX - eyeOffset, centerY - 4, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Right eye
        ctx.beginPath();
        ctx.arc(centerX + eyeOffset, centerY - 4, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupils (look in movement direction)
        ctx.fillStyle = gameState.powerMode ? '#ffff00' : '#0000ff';
        const pupilRadius = 2;
        const pupilOffsetX = ghost.direction.x * 1.5;
        const pupilOffsetY = ghost.direction.y * 1.5;
        
        ctx.beginPath();
        ctx.arc(centerX - eyeOffset + pupilOffsetX, centerY - 4 + pupilOffsetY, pupilRadius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(centerX + eyeOffset + pupilOffsetX, centerY - 4 + pupilOffsetY, pupilRadius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
    });
}

// ============================================
// GAME LOGIC
// ============================================

function canMove(gridX, gridY, direction) {
    const newX = gridX + direction.x;
    const newY = gridY + direction.y;
    
    // Check boundaries
    if (newY < 0 || newY >= MAZE.length || newX < 0 || newX >= MAZE[0].length) {
        return false;
    }
    
    // Check if it's a wall
    return MAZE[newY][newX] !== 1;
}

function movePacman() {
    // Animate mouth
    pacman.mouthAnimationCounter++;
    if (pacman.mouthAnimationCounter >= 8) {
        pacman.mouthOpen = !pacman.mouthOpen;
        pacman.mouthAnimationCounter = 0;
    }
    
    // Check if we've reached target grid position
    const reachedTargetX = Math.abs(pacman.pixelX - pacman.targetX * CONFIG.CELL_SIZE) < 1;
    const reachedTargetY = Math.abs(pacman.pixelY - pacman.targetY * CONFIG.CELL_SIZE) < 1;
    
    if (reachedTargetX && reachedTargetY) {
        // Snap to grid
        pacman.pixelX = pacman.targetX * CONFIG.CELL_SIZE;
        pacman.pixelY = pacman.targetY * CONFIG.CELL_SIZE;
        pacman.gridX = pacman.targetX;
        pacman.gridY = pacman.targetY;
        
        // Check for pellet collection
        const cell = MAZE[pacman.gridY][pacman.gridX];
        if (cell === 2) {
            MAZE[pacman.gridY][pacman.gridX] = 0;
            gameState.score += CONFIG.POINTS_PELLET;
            gameState.pelletsRemaining--;
            checkWinCondition();
        } else if (cell === 3) {
            MAZE[pacman.gridY][pacman.gridX] = 0;
            gameState.score += CONFIG.POINTS_POWER;
            gameState.pelletsRemaining--;
            activatePowerMode();
            checkWinCondition();
        }
        
        // Try to change direction if next direction is queued
        if (pacman.nextDirection.x !== 0 || pacman.nextDirection.y !== 0) {
            if (canMove(pacman.gridX, pacman.gridY, pacman.nextDirection)) {
                pacman.direction = { ...pacman.nextDirection };
            }
        }
        
        // Set new target if we can move in current direction
        if (canMove(pacman.gridX, pacman.gridY, pacman.direction)) {
            pacman.targetX = pacman.gridX + pacman.direction.x;
            pacman.targetY = pacman.gridY + pacman.direction.y;
            pacman.isMoving = true;
        } else {
            pacman.isMoving = false;
        }
    }
    
    // Move toward target if moving
    if (pacman.isMoving) {
        const dx = pacman.targetX * CONFIG.CELL_SIZE - pacman.pixelX;
        const dy = pacman.targetY * CONFIG.CELL_SIZE - pacman.pixelY;
        
        if (Math.abs(dx) > 0) {
            pacman.pixelX += Math.sign(dx) * Math.min(CONFIG.PACMAN_SPEED, Math.abs(dx));
        }
        if (Math.abs(dy) > 0) {
            pacman.pixelY += Math.sign(dy) * Math.min(CONFIG.PACMAN_SPEED, Math.abs(dy));
        }
    }
}

function moveGhosts() {
    ghosts.forEach(ghost => {
        if (ghost.isEaten) {
            // Move eaten ghost back to spawn
            const spawnX = 9 * CONFIG.CELL_SIZE;
            const spawnY = 9 * CONFIG.CELL_SIZE;
            
            const dx = spawnX - ghost.pixelX;
            const dy = spawnY - ghost.pixelY;
            
            if (Math.abs(dx) < 2 && Math.abs(dy) < 2) {
                ghost.isEaten = false;
                ghost.pixelX = spawnX;
                ghost.pixelY = spawnY;
                ghost.gridX = 9;
                ghost.gridY = 9;
                ghost.targetX = 9;
                ghost.targetY = 9;
            } else {
                ghost.pixelX += Math.sign(dx) * CONFIG.GHOST_SPEED;
                ghost.pixelY += Math.sign(dy) * CONFIG.GHOST_SPEED;
            }
            return;
        }
        
        // Check if reached target grid position
        const reachedTargetX = Math.abs(ghost.pixelX - ghost.targetX * CONFIG.CELL_SIZE) < 1;
        const reachedTargetY = Math.abs(ghost.pixelY - ghost.targetY * CONFIG.CELL_SIZE) < 1;
        
        if (reachedTargetX && reachedTargetY) {
            // Snap to grid
            ghost.pixelX = ghost.targetX * CONFIG.CELL_SIZE;
            ghost.pixelY = ghost.targetY * CONFIG.CELL_SIZE;
            ghost.gridX = ghost.targetX;
            ghost.gridY = ghost.targetY;
            
            // Choose new direction based on AI
            const newDirection = chooseGhostDirection(ghost);
            ghost.direction = newDirection;
            ghost.targetX = ghost.gridX + newDirection.x;
            ghost.targetY = ghost.gridY + newDirection.y;
        }
        
        // Move toward target
        const speed = gameState.powerMode ? CONFIG.GHOST_SCARED_SPEED : CONFIG.GHOST_SPEED;
        const dx = ghost.targetX * CONFIG.CELL_SIZE - ghost.pixelX;
        const dy = ghost.targetY * CONFIG.CELL_SIZE - ghost.pixelY;
        
        if (Math.abs(dx) > 0) {
            ghost.pixelX += Math.sign(dx) * Math.min(speed, Math.abs(dx));
        }
        if (Math.abs(dy) > 0) {
            ghost.pixelY += Math.sign(dy) * Math.min(speed, Math.abs(dy));
        }
    });
}

function chooseGhostDirection(ghost) {
    // Get possible directions
    const possibleDirections = [
        { x: 0, y: -1 }, // up
        { x: 0, y: 1 },  // down
        { x: -1, y: 0 }, // left
        { x: 1, y: 0 },  // right
    ];
    
    // Filter out walls and reverse direction
    const validDirections = possibleDirections.filter(dir => {
        const isReverse = (dir.x === -ghost.direction.x && dir.y === -ghost.direction.y);
        return canMove(ghost.gridX, ghost.gridY, dir) && !isReverse;
    });
    
    if (validDirections.length === 0) {
        // If stuck, allow reverse
        const reverseDir = { x: -ghost.direction.x, y: -ghost.direction.y };
        if (canMove(ghost.gridX, ghost.gridY, reverseDir)) {
            return reverseDir;
        }
        return { x: 0, y: 0 };
    }
    
    // AI behavior based on power mode and personality
    if (gameState.powerMode) {
        // Run away from Pacman
        const distances = validDirections.map(dir => {
            const newX = ghost.gridX + dir.x;
            const newY = ghost.gridY + dir.y;
            return {
                dir,
                dist: Math.abs(newX - pacman.gridX) + Math.abs(newY - pacman.gridY)
            };
        });
        distances.sort((a, b) => b.dist - a.dist);
        return distances[0].dir;
    }
    
    // Different AI based on personality
    switch (ghost.personality) {
        case 'aggressive': // Blinky - direct chase
            return getChaseDirection(ghost, pacman.gridX, pacman.gridY, validDirections);
            
        case 'ambush': // Pinky - target ahead of Pacman
            const targetX = pacman.gridX + pacman.direction.x * 4;
            const targetY = pacman.gridY + pacman.direction.y * 4;
            return getChaseDirection(ghost, targetX, targetY, validDirections);
            
        case 'patrol': // Inky - patrol with occasional chase
            if (Math.random() < 0.5) {
                return getChaseDirection(ghost, pacman.gridX, pacman.gridY, validDirections);
            } else {
                return validDirections[Math.floor(Math.random() * validDirections.length)];
            }
            
        case 'random': // Clyde - mostly random
            if (Math.random() < 0.3) {
                return getChaseDirection(ghost, pacman.gridX, pacman.gridY, validDirections);
            } else {
                return validDirections[Math.floor(Math.random() * validDirections.length)];
            }
            
        default:
            return validDirections[0];
    }
}

function getChaseDirection(ghost, targetX, targetY, validDirections) {
    const distances = validDirections.map(dir => {
        const newX = ghost.gridX + dir.x;
        const newY = ghost.gridY + dir.y;
        return {
            dir,
            dist: Math.abs(newX - targetX) + Math.abs(newY - targetY)
        };
    });
    distances.sort((a, b) => a.dist - b.dist);
    return distances[0].dir;
}

function checkCollisions() {
    ghosts.forEach((ghost, index) => {
        if (ghost.isEaten) return;
        
        // Check collision with more forgiving hitbox
        const dx = Math.abs(ghost.gridX - pacman.gridX);
        const dy = Math.abs(ghost.gridY - pacman.gridY);
        
        if (dx === 0 && dy === 0) {
            if (gameState.powerMode) {
                // Eat ghost
                const points = CONFIG.POINTS_GHOST * gameState.ghostMultiplier;
                gameState.score += points;
                gameState.ghostMultiplier *= 2; // 200, 400, 800, 1600
                ghost.isEaten = true;
                
                // Brief pause for effect
                gameState.paused = true;
                setTimeout(() => {
                    gameState.paused = false;
                }, CONFIG.GHOST_EATEN_PAUSE);
            } else {
                // Lose life
                loseLife();
            }
        }
    });
}

function resetGhost(index) {
    const startPositions = [
        { x: 8, y: 8 },
        { x: 9, y: 9 },
        { x: 10, y: 9 },
        { x: 9, y: 10 },
    ];
    const pos = startPositions[index];
    ghosts[index].gridX = pos.x;
    ghosts[index].gridY = pos.y;
    ghosts[index].pixelX = pos.x * CONFIG.CELL_SIZE;
    ghosts[index].pixelY = pos.y * CONFIG.CELL_SIZE;
    ghosts[index].targetX = pos.x;
    ghosts[index].targetY = pos.y;
    ghosts[index].isEaten = false;
}

function activatePowerMode() {
    gameState.powerMode = true;
    gameState.powerWarning = false;
    gameState.ghostMultiplier = 1; // Reset multiplier for new power mode
    gameStatusElement.textContent = 'POWER MODE!';
    gameStatusElement.style.color = '#ff00ff';
    
    // Clear existing timer
    if (gameState.powerModeTimer) {
        clearTimeout(gameState.powerModeTimer);
    }
    
    // Warning before power mode ends
    setTimeout(() => {
        gameState.powerWarning = true;
    }, CONFIG.POWER_DURATION - CONFIG.POWER_WARNING);
    
    // Set new timer
    gameState.powerModeTimer = setTimeout(() => {
        gameState.powerMode = false;
        gameState.powerWarning = false;
        gameStatusElement.textContent = 'GO!';
        gameStatusElement.style.color = '';
    }, CONFIG.POWER_DURATION);
}

function loseLife() {
    gameState.lives--;
    
    if (gameState.lives <= 0) {
        endGame();
    } else {
        // Reset positions
        pacman.gridX = 9;
        pacman.gridY = 15;
        pacman.pixelX = 9 * CONFIG.CELL_SIZE;
        pacman.pixelY = 15 * CONFIG.CELL_SIZE;
        pacman.targetX = 9;
        pacman.targetY = 15;
        pacman.direction = { x: 0, y: 0 };
        pacman.nextDirection = { x: 0, y: 0 };
        pacman.isMoving = false;
        
        ghosts.forEach((ghost, index) => resetGhost(index));
        
        gameState.paused = true;
        gameStatusElement.textContent = 'READY!';
        
        setTimeout(() => {
            gameState.paused = false;
            gameStatusElement.textContent = 'GO!';
        }, 1500);
    }
}

function checkWinCondition() {
    if (gameState.pelletsRemaining <= 0) {
        // Win level
        gameState.level++;
        gameStatusElement.textContent = `LEVEL ${gameState.level}!`;
        gameState.paused = true;
        
        setTimeout(() => {
            restartLevel();
        }, 2000);
    }
}

function restartLevel() {
    // Reset maze
    const newMaze = [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
        [1,3,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,3,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,2,1],
        [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
        [1,1,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,1,1],
        [1,1,1,1,2,1,2,2,2,2,2,2,2,1,2,1,1,1,1],
        [1,1,1,1,2,1,2,1,0,0,0,1,2,1,2,1,1,1,1],
        [2,2,2,2,2,2,2,1,0,0,0,1,2,2,2,2,2,2,2],
        [1,1,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,1,1],
        [1,1,1,1,2,1,2,2,2,2,2,2,2,1,2,1,1,1,1],
        [1,1,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,1,1],
        [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
        [1,3,2,1,2,2,2,2,2,2,2,2,2,2,2,1,2,3,1],
        [1,1,2,1,2,1,2,1,1,1,1,1,2,1,2,1,2,1,1],
        [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
        [1,2,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,2,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ];
    
    for (let y = 0; y < MAZE.length; y++) {
        for (let x = 0; x < MAZE[y].length; x++) {
            MAZE[y][x] = newMaze[y][x];
        }
    }
    
    // Reset positions
    pacman.gridX = 9;
    pacman.gridY = 15;
    pacman.pixelX = 9 * CONFIG.CELL_SIZE;
    pacman.pixelY = 15 * CONFIG.CELL_SIZE;
    pacman.targetX = 9;
    pacman.targetY = 15;
    pacman.direction = { x: 0, y: 0 };
    pacman.nextDirection = { x: 0, y: 0 };
    pacman.isMoving = false;
    
    ghosts.forEach((ghost, index) => resetGhost(index));
    
    // Count pellets
    gameState.pelletsRemaining = 0;
    for (let row of MAZE) {
        for (let cell of row) {
            if (cell === 2 || cell === 3) {
                gameState.pelletsRemaining++;
            }
        }
    }
    
    gameState.paused = false;
    gameStatusElement.textContent = 'GO!';
}

function endGame() {
    gameState.gameOver = true;
    gameState.paused = true;
    finalScoreElement.textContent = gameState.score;
    gameOverOverlay.classList.add('active');
}

function updateUI() {
    scoreElement.textContent = gameState.score;
    livesElement.textContent = '❤️'.repeat(gameState.lives);
}

// ============================================
// GAME LOOP
// ============================================

let lastFrameTime = 0;
let animationFrameId;

function gameLoop(currentTime) {
    animationFrameId = requestAnimationFrame(gameLoop);
    
    const deltaTime = currentTime - lastFrameTime;
    
    // Cap at 60 FPS
    if (deltaTime < 1000 / CONFIG.FPS) {
        return;
    }
    
    lastFrameTime = currentTime;
    
    if (!gameState.paused && !gameState.gameOver) {
        movePacman();
        moveGhosts();
        checkCollisions();
        updateUI();
    }
    
    render();
}

function startGameLoop() {
    lastFrameTime = performance.now();
    gameLoop(lastFrameTime);
}

function stopGameLoop() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
}

function render() {
    drawMaze();
    drawPacman();
    drawGhosts();
}

// ============================================
// INPUT HANDLING
// ============================================

document.addEventListener('keydown', (e) => {
    if (gameState.gameOver) return;
    
    switch (e.key) {
        case 'ArrowUp':
            e.preventDefault();
            pacman.nextDirection = { x: 0, y: -1 };
            break;
        case 'ArrowDown':
            e.preventDefault();
            pacman.nextDirection = { x: 0, y: 1 };
            break;
        case 'ArrowLeft':
            e.preventDefault();
            pacman.nextDirection = { x: -1, y: 0 };
            break;
        case 'ArrowRight':
            e.preventDefault();
            pacman.nextDirection = { x: 1, y: 0 };
            break;
    }
});

// ============================================
// RESTART BUTTON
// ============================================

restartBtn.addEventListener('click', () => {
    // Stop game loop
    stopGameLoop();
    
    if (gameState.powerModeTimer) {
        clearTimeout(gameState.powerModeTimer);
    }
    
    // Reset game state
    gameState = {
        score: 0,
        lives: 3,
        powerMode: false,
        powerModeTimer: null,
        powerWarning: false,
        gameOver: false,
        paused: true,
        level: 1,
        pelletsRemaining: 0,
        ghostMultiplier: 1,
    };
    
    // Reset Pacman
    pacman = {
        gridX: 9,
        gridY: 15,
        pixelX: 9 * CONFIG.CELL_SIZE,
        pixelY: 15 * CONFIG.CELL_SIZE,
        direction: { x: 0, y: 0 },
        nextDirection: { x: 0, y: 0 },
        targetX: 9,
        targetY: 15,
        mouthOpen: true,
        mouthAnimationCounter: 0,
        isMoving: false,
    };
    
    // Reset ghosts
    ghosts = [
        { 
            gridX: 8, gridY: 8,
            pixelX: 8 * CONFIG.CELL_SIZE,
            pixelY: 8 * CONFIG.CELL_SIZE,
            targetX: 8, targetY: 8,
            color: '#ff0000', 
            name: 'blinky', 
            direction: { x: 1, y: 0 },
            personality: 'aggressive',
            isEaten: false,
        },
        { 
            gridX: 9, gridY: 9,
            pixelX: 9 * CONFIG.CELL_SIZE,
            pixelY: 9 * CONFIG.CELL_SIZE,
            targetX: 9, targetY: 9,
            color: '#ffb8ff', 
            name: 'pinky', 
            direction: { x: 0, y: -1 },
            personality: 'ambush',
            isEaten: false,
        },
        { 
            gridX: 10, gridY: 9,
            pixelX: 10 * CONFIG.CELL_SIZE,
            pixelY: 10 * CONFIG.CELL_SIZE,
            targetX: 10, targetY: 9,
            color: '#00ffde', 
            name: 'inky', 
            direction: { x: -1, y: 0 },
            personality: 'patrol',
            isEaten: false,
        },
        { 
            gridX: 9, gridY: 10,
            pixelX: 9 * CONFIG.CELL_SIZE,
            pixelY: 10 * CONFIG.CELL_SIZE,
            targetX: 9, targetY: 10,
            color: '#ffb851', 
            name: 'clyde', 
            direction: { x: 0, y: 1 },
            personality: 'random',
            isEaten: false,
        },
    ];
    
    // Hide overlay
    gameOverOverlay.classList.remove('active');
    gameStatusElement.textContent = 'READY!';
    gameStatusElement.style.color = '';
    
    // Restart
    init();
});

// ============================================
// START GAME
// ============================================

init();