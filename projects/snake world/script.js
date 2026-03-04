// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 900;
canvas.height = 600;

// Game Constants
const GRID_SIZE = 20;
const COLS = canvas.width / GRID_SIZE;
const ROWS = canvas.height / GRID_SIZE;
const GAME_SPEED = 10; // Lower = faster, Higher = slower (update every N frames)

// Game States
let gameRunning = false;
let gamePaused = false;
let totalCoins = 0;
let gameTime = 0;
let gameStartTime = 0;
let frameCount = 0;
let obstacleSpawnCounter = 0;
const OBSTACLE_SPAWN_INTERVAL = 180; // Spawn new obstacle every 180 frames (~3 seconds)

// Game Objects
let playerSnake = null;
let snakes = [];
let food = [];
let coins = [];
let rocks = [];
let holes = [];

// Keyboard Input
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Button Controls
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('pauseBtn').addEventListener('click', togglePause);
document.getElementById('resetBtn').addEventListener('click', resetGame);

// Snake Class
class Snake {
    constructor(x, y, isPlayer = false, color = '#e74c3c') {
        this.body = [{ x, y }];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.isPlayer = isPlayer;
        this.color = color;
        this.foodEaten = 0;
        this.coinsCollected = 0;
        this.isDead = false;
    }

    update() {
        if (this.isDead) return;

        // Update direction for player snake based on input
        if (this.isPlayer) {
            if (keys['ArrowUp'] && this.direction.y === 0) {
                this.nextDirection = { x: 0, y: -1 };
            } else if (keys['ArrowDown'] && this.direction.y === 0) {
                this.nextDirection = { x: 0, y: 1 };
            } else if (keys['ArrowLeft'] && this.direction.x === 0) {
                this.nextDirection = { x: -1, y: 0 };
            } else if (keys['ArrowRight'] && this.direction.x === 0) {
                this.nextDirection = { x: 1, y: 0 };
            }
        } else {
            // AI for enemy snakes
            this.updateAI();
        }

        this.direction = this.nextDirection;

        // Move snake
        const head = this.body[0];
        const newHead = {
            x: head.x + this.direction.x,
            y: head.y + this.direction.y
        };

        // Check boundary collision
        if (newHead.x < 0 || newHead.x >= COLS || newHead.y < 0 || newHead.y >= ROWS) {
            this.die();
            return;
        }

        // Check self collision
        if (this.body.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
            this.die();
            return;
        }

        // Check collision with other snakes
        for (let snake of snakes) {
            if (snake !== this && !snake.isDead) {
                if (snake.body.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
                    this.die();
                    return;
                }
            }
        }

        // Check obstacle collisions
        if (rocks.some(rock => rock.x === newHead.x && rock.y === newHead.y)) {
            this.die();
            return;
        }

        if (holes.some(hole => hole.x === newHead.x && hole.y === newHead.y)) {
            this.die();
            return;
        }

        this.body.unshift(newHead);

        // Check food collision
        let foodEaten = false;
        for (let i = 0; i < food.length; i++) {
            if (food[i].x === newHead.x && food[i].y === newHead.y) {
                this.foodEaten++;
                food.splice(i, 1);
                foodEaten = true;
                break;
            }
        }

        // Check coin collision
        for (let i = 0; i < coins.length; i++) {
            if (coins[i].x === newHead.x && coins[i].y === newHead.y) {
                this.coinsCollected++;
                totalCoins++;
                coins.splice(i, 1);
                break;
            }
        }

        // Remove tail if no food eaten
        if (!foodEaten) {
            this.body.pop();
        }
    }

    updateAI() {
        // Simple AI: move towards food or random
        const head = this.body[0];
        const foodTargets = food.filter(f => {
            const distance = Math.abs(f.x - head.x) + Math.abs(f.y - head.y);
            return distance < 15; // Look ahead distance
        });

        if (foodTargets.length > 0) {
            const target = foodTargets[0];
            const possibleMoves = [
                { x: 0, y: -1 },
                { x: 0, y: 1 },
                { x: -1, y: 0 },
                { x: 1, y: 0 }
            ];

            let bestMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            let bestDistance = Infinity;

            for (let move of possibleMoves) {
                const newPos = { x: head.x + move.x, y: head.y + move.y };
                const distance = Math.abs(newPos.x - target.x) + Math.abs(newPos.y - target.y);

                if (distance < bestDistance && this.isValidMove(move)) {
                    bestDistance = distance;
                    bestMove = move;
                }
            }

            this.nextDirection = bestMove;
        } else {
            // Random movement
            const moves = [
                { x: 0, y: -1 },
                { x: 0, y: 1 },
                { x: -1, y: 0 },
                { x: 1, y: 0 }
            ];
            const validMoves = moves.filter(move => this.isValidMove(move));
            if (validMoves.length > 0) {
                this.nextDirection = validMoves[Math.floor(Math.random() * validMoves.length)];
            }
        }
    }

    isValidMove(move) {
        // Check if move is opposite to current direction (can't reverse)
        if (move.x === -this.direction.x && move.y === -this.direction.y) {
            return false;
        }
        return true;
    }

    die() {
        this.isDead = true;
        // Drop coins when snake dies
        for (let i = 0; i < this.coinsCollected; i++) {
            coins.push({
                x: this.body[0].x,
                y: this.body[0].y
            });
        }
        this.coinsCollected = 0;
    }

    draw() {
        // Draw body with 3D effect
        for (let i = 0; i < this.body.length; i++) {
            const segment = this.body[i];
            const isHead = i === 0;
            const x = segment.x * GRID_SIZE;
            const y = segment.y * GRID_SIZE;

            // Create 3D gradient effect
            const gradient = ctx.createLinearGradient(x, y, x + GRID_SIZE, y + GRID_SIZE);
            const baseColor = isHead ? this.color : adjustBrightness(this.color, -15);
            const darkColor = adjustBrightness(this.color, -40);
            const lightColor = adjustBrightness(this.color, 20);

            gradient.addColorStop(0, lightColor);
            gradient.addColorStop(0.5, baseColor);
            gradient.addColorStop(1, darkColor);

            ctx.fillStyle = gradient;
            ctx.fillRect(x + 1, y + 1, GRID_SIZE - 2, GRID_SIZE - 2);

            // Add shadow for 3D depth
            ctx.fillStyle = adjustBrightness(this.color, -50);
            ctx.fillRect(x + GRID_SIZE - 3, y + GRID_SIZE - 3, 2, 2);

            // Draw head details
            if (isHead) {
                // Head outline for 3D effect
                ctx.strokeStyle = adjustBrightness(this.color, -30);
                ctx.lineWidth = 2;
                ctx.strokeRect(x + 1, y + 1, GRID_SIZE - 2, GRID_SIZE - 2);

                // Draw eyes with pupils
                let eyeOffsets = [];
                if (this.direction.x === 1) {
                    eyeOffsets = [{ x: 12, y: 6 }, { x: 12, y: 14 }];
                } else if (this.direction.x === -1) {
                    eyeOffsets = [{ x: 8, y: 6 }, { x: 8, y: 14 }];
                } else if (this.direction.y === -1) {
                    eyeOffsets = [{ x: 6, y: 8 }, { x: 14, y: 8 }];
                } else {
                    eyeOffsets = [{ x: 6, y: 12 }, { x: 14, y: 12 }];
                }

                for (let offset of eyeOffsets) {
                    // White eye
                    ctx.fillStyle = 'white';
                    ctx.beginPath();
                    ctx.arc(
                        x + offset.x + 1.5,
                        y + offset.y + 1.5,
                        2.5,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();

                    // Black pupil
                    ctx.fillStyle = '#000';
                    ctx.beginPath();
                    ctx.arc(
                        x + offset.x + 2,
                        y + offset.y + 1,
                        1.2,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();

                    // Shine on eye
                    ctx.fillStyle = 'rgba(255,255,255,0.8)';
                    ctx.beginPath();
                    ctx.arc(
                        x + offset.x + 0.5,
                        y + offset.y + 0.5,
                        0.8,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();
                }

                // Draw mouth (smile)
                ctx.strokeStyle = adjustBrightness(this.color, -50);
                ctx.lineWidth = 1;
                ctx.beginPath();
                if (this.direction.x === 1) {
                    ctx.arc(x + GRID_SIZE - 4, y + GRID_SIZE / 2, 2, -Math.PI / 2, Math.PI / 2);
                } else if (this.direction.x === -1) {
                    ctx.arc(x + 4, y + GRID_SIZE / 2, 2, Math.PI / 2, (3 * Math.PI) / 2);
                } else if (this.direction.y === -1) {
                    ctx.arc(x + GRID_SIZE / 2, y + 4, 2, 0, Math.PI);
                } else {
                    ctx.arc(x + GRID_SIZE / 2, y + GRID_SIZE - 4, 2, Math.PI, 0);
                }
                ctx.stroke();
            } else {
                // Body segments - subtle shine
                ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.fillRect(x + 2, y + 2, GRID_SIZE - 6, 3);
            }
        }
    }
}

// Food Class
function createFood() {
    let x, y, valid;
    let attempts = 0;
    const maxAttempts = 50;

    do {
        valid = true;
        x = Math.floor(Math.random() * COLS);
        y = Math.floor(Math.random() * ROWS);
        attempts++;

        // Check if position is already occupied
        if (food.some(f => f.x === x && f.y === y)) valid = false;
        if (coins.some(c => c.x === x && c.y === y)) valid = false;
        if (rocks.some(r => r.x === x && r.y === y)) valid = false;
        if (holes.some(h => h.x === x && h.y === y)) valid = false;

        for (let snake of snakes) {
            if (snake.body.some(segment => segment.x === x && segment.y === y)) {
                valid = false;
                break;
            }
        }
    } while (!valid && attempts < maxAttempts);

    if (attempts < maxAttempts) {
        food.push({ x, y });
    }
}

// Coin Class
function createCoin() {
    let x, y, valid;
    let attempts = 0;
    const maxAttempts = 50;

    do {
        valid = true;
        x = Math.floor(Math.random() * COLS);
        y = Math.floor(Math.random() * ROWS);
        attempts++;

        if (food.some(f => f.x === x && f.y === y)) valid = false;
        if (coins.some(c => c.x === x && c.y === y)) valid = false;
        if (rocks.some(r => r.x === x && r.y === y)) valid = false;
        if (holes.some(h => h.x === x && h.y === y)) valid = false;

        for (let snake of snakes) {
            if (snake.body.some(segment => segment.x === x && segment.y === y)) {
                valid = false;
                break;
            }
        }
    } while (!valid && attempts < maxAttempts);

    if (attempts < maxAttempts) {
        coins.push({ x, y });
    }
}

// Initialize obstacles - start with minimal obstacles
function initializeObstacles() {
    rocks = [];
    holes = [];
    obstacleSpawnCounter = 0;

    // Create only 2 initial rocks and 1 hole to give player time to start
    for (let i = 0; i < 2; i++) {
        let x, y, valid;
        let attempts = 0;
        do {
            valid = true;
            x = Math.floor(Math.random() * COLS);
            y = Math.floor(Math.random() * ROWS);
            attempts++;

            if (rocks.some(r => r.x === x && r.y === y)) valid = false;
            if (holes.some(h => h.x === x && h.y === y)) valid = false;

            // Don't place obstacles near starting positions
            if (x < 5 || x > COLS - 5 || y < 5 || y > ROWS - 5) valid = false;
        } while (!valid && attempts < 30);

        if (attempts < 30) {
            rocks.push({ x, y });
        }
    }

    // Create 1 initial hole
    let x, y, valid;
    let attempts = 0;
    do {
        valid = true;
        x = Math.floor(Math.random() * COLS);
        y = Math.floor(Math.random() * ROWS);
        attempts++;

        if (rocks.some(r => r.x === x && r.y === y)) valid = false;
        if (holes.some(h => h.x === x && h.y === y)) valid = false;

        if (x < 5 || x > COLS - 5 || y < 5 || y > ROWS - 5) valid = false;
    } while (!valid && attempts < 30);

    if (attempts < 30) {
        holes.push({ x, y });
    }
}

// Spawn a single obstacle gradually during gameplay
function spawnSingleObstacle() {
    if (Math.random() < 0.6 && rocks.length < 15) {
        // Spawn rock
        let x, y, valid;
        let attempts = 0;
        do {
            valid = true;
            x = Math.floor(Math.random() * COLS);
            y = Math.floor(Math.random() * ROWS);
            attempts++;

            if (rocks.some(r => r.x === x && r.y === y)) valid = false;
            if (holes.some(h => h.x === x && h.y === y)) valid = false;

            // Don't place obstacles near snakes
            for (let snake of snakes) {
                if (snake.body.some(segment => segment.x === x && segment.y === y)) {
                    valid = false;
                    break;
                }
            }

            if (x < 3 || x > COLS - 3 || y < 3 || y > ROWS - 3) valid = false;
        } while (!valid && attempts < 20);

        if (attempts < 20) {
            rocks.push({ x, y });
        }
    } else if (holes.length < 10) {
        // Spawn hole
        let x, y, valid;
        let attempts = 0;
        do {
            valid = true;
            x = Math.floor(Math.random() * COLS);
            y = Math.floor(Math.random() * ROWS);
            attempts++;

            if (rocks.some(r => r.x === x && r.y === y)) valid = false;
            if (holes.some(h => h.x === x && h.y === y)) valid = false;

            for (let snake of snakes) {
                if (snake.body.some(segment => segment.x === x && segment.y === y)) {
                    valid = false;
                    break;
                }
            }

            if (x < 3 || x > COLS - 3 || y < 3 || y > ROWS - 3) valid = false;
        } while (!valid && attempts < 20);

        if (attempts < 20) {
            holes.push({ x, y });
        }
    }
}

// Utility function
function adjustBrightness(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;

    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255))
        .toString(16).slice(1);
}

// Draw functions
function drawGame() {
    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid (optional - for debugging)
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= COLS; i++) {
        ctx.beginPath();
        ctx.moveTo(i * GRID_SIZE, 0);
        ctx.lineTo(i * GRID_SIZE, canvas.height);
        ctx.stroke();
    }
    for (let j = 0; j <= ROWS; j++) {
        ctx.beginPath();
        ctx.moveTo(0, j * GRID_SIZE);
        ctx.lineTo(canvas.width, j * GRID_SIZE);
        ctx.stroke();
    }

    // Draw rocks with 3D effect
    for (let rock of rocks) {
        const x = rock.x * GRID_SIZE;
        const y = rock.y * GRID_SIZE;

        // Main rock body with gradient
        const rockGradient = ctx.createLinearGradient(x, y, x + GRID_SIZE, y + GRID_SIZE);
        rockGradient.addColorStop(0, '#a0522d');
        rockGradient.addColorStop(0.5, '#8b4513');
        rockGradient.addColorStop(1, '#654321');

        ctx.fillStyle = rockGradient;
        ctx.fillRect(x + 1, y + 1, GRID_SIZE - 2, GRID_SIZE - 2);

        // Rock texture - cracks and bumps
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(x + 3, y + 2, 4, 3);
        ctx.fillRect(x + 10, y + 4, 3, 4);
        ctx.fillRect(x + 5, y + 11, 5, 2);

        // Highlight for 3D effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(x + 2, y + 2, GRID_SIZE - 6, 3);

        // Shadow for depth
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(x + GRID_SIZE - 4, y + GRID_SIZE - 4, 3, 3);

        // Rock outline
        ctx.strokeStyle = '#3a1f0f';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, y + 1, GRID_SIZE - 2, GRID_SIZE - 2);
    }

    // Draw holes with 3D effect
    for (let hole of holes) {
        const x = hole.x * GRID_SIZE + GRID_SIZE / 2;
        const y = hole.y * GRID_SIZE + GRID_SIZE / 2;
        const radius = GRID_SIZE / 2 - 1;

        // Create radial gradient for hole depth
        const holeGradient = ctx.createRadialGradient(x, y, radius * 0.3, x, y, radius);
        holeGradient.addColorStop(0, '#1a252f');
        holeGradient.addColorStop(0.7, '#0d1419');
        holeGradient.addColorStop(1, '#000000');

        ctx.fillStyle = holeGradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Hole rim/edge highlight
        ctx.strokeStyle = '#34495e';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Inner shadow for depth
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, radius - 2, 0, Math.PI * 2);
        ctx.stroke();

        // Small shine on hole edge
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x - 1, y - 1, radius, 0, Math.PI / 2);
        ctx.stroke();
    }

    // Draw food with 3D effect (Apple)
    for (let f of food) {
        const x = f.x * GRID_SIZE + GRID_SIZE / 2;
        const y = f.y * GRID_SIZE + GRID_SIZE / 2;
        const radius = GRID_SIZE / 2 - 2;

        // Create radial gradient for 3D sphere
        const foodGradient = ctx.createRadialGradient(x - 2, y - 2, 0, x, y, radius);
        foodGradient.addColorStop(0, '#3fd93f');
        foodGradient.addColorStop(0.5, '#27ae60');
        foodGradient.addColorStop(1, '#1a7a3a');

        ctx.fillStyle = foodGradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Shine on food
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(x - 2, y - 2, radius * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Food outline
        ctx.strokeStyle = '#1a5a2a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Stem on top
        ctx.strokeStyle = '#8b4513';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y - radius);
        ctx.lineTo(x, y - radius - 3);
        ctx.stroke();

        // Leaf
        ctx.strokeStyle = '#1a7a3a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x + 2, y - radius - 2, 2, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Draw coins with 3D effect
    for (let coin of coins) {
        const x = coin.x * GRID_SIZE + GRID_SIZE / 2;
        const y = coin.y * GRID_SIZE + GRID_SIZE / 2;
        const radius = GRID_SIZE / 2 - 3;

        // Create radial gradient for 3D coin
        const coinGradient = ctx.createRadialGradient(x - 1.5, y - 1.5, 0, x, y, radius);
        coinGradient.addColorStop(0, '#ffeb99');
        coinGradient.addColorStop(0.4, '#f1c40f');
        coinGradient.addColorStop(1, '#d4af2e');

        ctx.fillStyle = coinGradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Coin rim
        ctx.strokeStyle = '#b8860b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Shine/highlight on coin
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(x - 1.5, y - 1.5, radius * 0.35, 0, Math.PI * 2);
        ctx.fill();

        // Inner ring for coin detail
        ctx.strokeStyle = 'rgba(212, 175, 46, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.7, 0, Math.PI * 2);
        ctx.stroke();

        // Coin design (dollar sign pattern)
        ctx.fillStyle = 'rgba(184, 134, 11, 0.6)';
        ctx.font = 'bold 8px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', x, y);
    }

    // Draw snakes
    for (let snake of snakes) {
        if (!snake.isDead) {
            snake.draw();
        }
    }

    // Draw pause indicator
    if (gamePaused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 60px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
    }
}

// Update functions
function updateStats() {
    const aliveSnakes = snakes.filter(s => !s.isDead).length;
    document.getElementById('totalCoins').textContent = totalCoins;
    document.getElementById('snakesAlive').textContent = aliveSnakes;
    document.getElementById('timer').textContent = gameTime + 's';

    // Check game over - only player snake dead
    if (playerSnake && playerSnake.isDead) {
        endGame();
    }
}

function gameLoop() {
    if (!gameRunning) return;

    if (!gamePaused) {
        frameCount++;

        // Only update game logic every GAME_SPEED frames
        if (frameCount % GAME_SPEED === 0) {
            // Update snakes
            for (let snake of snakes) {
                snake.update();
            }

            // Spawn more food and coins periodically
            if (food.length < 8) {
                createFood();
            }
            if (coins.length < 5) {
                createCoin();
            }

            // Gradually spawn obstacles
            obstacleSpawnCounter++;
            if (obstacleSpawnCounter >= OBSTACLE_SPAWN_INTERVAL && rocks.length < 15) {
                spawnSingleObstacle();
                obstacleSpawnCounter = 0;
            }
        }

        // Update game time
        gameTime = Math.floor((Date.now() - gameStartTime) / 1000);
    }

    // Draw
    drawGame();
    updateStats();

    requestAnimationFrame(gameLoop);
}

// Game control functions
function startGame() {
    if (gameRunning) return;

    gameRunning = true;
    gamePaused = false;
    totalCoins = 0;
    gameTime = 0;
    gameStartTime = Date.now();

    // Initialize game state
    snakes = [];
    food = [];
    coins = [];

    // Create player snake
    playerSnake = new Snake(10, 15, true, '#3498db');
    snakes.push(playerSnake);

    // Create AI snakes
    for (let i = 0; i < 3; i++) {
        const x = Math.floor(Math.random() * (COLS - 10)) + 5;
        const y = Math.floor(Math.random() * (ROWS - 10)) + 5;
        snakes.push(new Snake(x, y, false, '#e74c3c'));
    }

    // Initialize obstacles
    initializeObstacles();

    // Create initial food and coins
    for (let i = 0; i < 5; i++) {
        createFood();
        createCoin();
    }

    // Update buttons
    document.getElementById('startBtn').disabled = true;
    document.getElementById('pauseBtn').disabled = false;

    gameLoop();
}

function togglePause() {
    if (!gameRunning) return;
    gamePaused = !gamePaused;
    const pauseBtn = document.getElementById('pauseBtn');
    pauseBtn.textContent = gamePaused ? 'Resume' : 'Pause';
}

function resetGame() {
    gameRunning = false;
    gamePaused = false;
    totalCoins = 0;
    gameTime = 0;

    snakes = [];
    food = [];
    coins = [];
    rocks = [];
    holes = [];
    playerSnake = null;

    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
    document.getElementById('pauseBtn').textContent = 'Pause';

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    document.getElementById('totalCoins').textContent = '0';
    document.getElementById('snakesAlive').textContent = '0';
    document.getElementById('timer').textContent = '0s';
}

function endGame() {
    gameRunning = false;
    const aliveSnakes = snakes.filter(s => !s.isDead).length;

    showGameOverModal({
        coins: totalCoins,
        time: gameTime,
        foodEaten: playerSnake.foodEaten,
        aliveSnakes: aliveSnakes
    });
}

function showGameOverModal(stats) {
    const modal = document.createElement('div');
    modal.className = 'game-over-modal show';
    modal.innerHTML = `
        <div class="game-over-content">
            <h2>💀 Game Over 💀</h2>
            <p>Your snake has been eliminated!</p>
            <div class="game-over-stats">
                <div><strong>Total Coins:</strong> <span>${stats.coins}</span></div>
                <div><strong>Food Eaten:</strong> <span>${stats.foodEaten}</span></div>
                <div><strong>Survival Time:</strong> <span>${stats.time}s</span></div>
                <div><strong>Snakes Still Alive:</strong> <span>${stats.aliveSnakes}</span></div>
            </div>
            <button class="btn btn-primary" onclick="location.reload()">Play Again</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// Initialize UI
updateStats();
