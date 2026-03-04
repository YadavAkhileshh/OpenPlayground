const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Serve static files
app.use(express.static(path.join(__dirname)));

// Game configuration
const GRID_SIZE = 20;
const COLS = 45; // 900 / 20
const ROWS = 30; // 600 / 20
const GAME_SPEED = 6;

// Game state
let players = {};
let gameState = {
    snakes: [],
    food: [],
    coins: [],
    rocks: [],
    holes: [],
    gameRunning: false,
    gameTime: 0,
    totalCoins: 0
};

let frameCount = 0;
let gameStartTime = 0;

const SNAKE_COLORS = ['#3498db', '#e74c3c', '#27ae60', '#f39c12', '#9b59b6', '#1abc9c'];
let colorIndex = 0;

// Connection handling
io.on('connection', (socket) => {
    console.log('New player connected:', socket.id);

    // Assign player a snake
    if (gameState.gameRunning) {
        socket.emit('gameState', gameState);
        socket.emit('notice', 'Game already in progress');
    } else {
        socket.emit('waiting', 'Waiting for game to start...');
    }

    socket.on('startGame', () => {
        console.log('Start game requested');
        io.emit('gameStarted');
        startGame();
    });

    socket.on('playerMove', (direction) => {
        const player = players[socket.id];
        if (player && player.snake) {
            player.snake.nextDirection = direction;
        }
    });

    socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);
        if (players[socket.id]) {
            // Mark snake as dead
            if (players[socket.id].snake) {
                players[socket.id].snake.isDead = true;
            }
            delete players[socket.id];
        }
    });

    socket.on('createSnake', (playerName) => {
        if (!players[socket.id]) {
            const color = SNAKE_COLORS[colorIndex % SNAKE_COLORS.length];
            colorIndex++;

            const snake = {
                id: socket.id,
                body: [{ x: 10 + Math.random() * 10, y: 10 + Math.random() * 10 }],
                direction: { x: 1, y: 0 },
                nextDirection: { x: 1, y: 0 },
                color: color,
                foodEaten: 0,
                coinsCollected: 0,
                isDead: false,
                playerName: playerName || 'Player'
            };

            players[socket.id] = {
                socket: socket,
                snake: snake,
                name: playerName
            };

            gameState.snakes.push(snake);
            io.emit('snakeCreated', { snake, playerId: socket.id });
            socket.emit('snakeAssigned', { snake, playerId: socket.id });
        }
    });
});

function startGame() {
    gameState.gameRunning = true;
    gameState.gameTime = 0;
    gameState.totalCoins = 0;
    gameStartTime = Date.now();
    frameCount = 0;

    // Create initial food, coins, and obstacles
    for (let i = 0; i < 5; i++) {
        createFood();
        createCoin();
    }

    // Start with minimal obstacles
    for (let i = 0; i < 2; i++) {
        spawnObstacle('rock');
    }
    spawnObstacle('hole');

    gameLoop();
}

function gameLoop() {
    if (!gameState.gameRunning) return;

    frameCount++;

    if (frameCount % GAME_SPEED === 0) {
        // Update all snakes
        gameState.snakes.forEach(snake => {
            if (!snake.isDead) {
                updateSnake(snake);
            }
        });

        // Spawn food and coins
        if (gameState.food.length < 8) createFood();
        if (gameState.coins.length < 5) createCoin();

        // Gradually spawn obstacles
        if (Math.random() < 0.05 && gameState.rocks.length < 15) {
            spawnObstacle('rock');
        }
        if (Math.random() < 0.03 && gameState.holes.length < 10) {
            spawnObstacle('hole');
        }
    }

    gameState.gameTime = Math.floor((Date.now() - gameStartTime) / 1000);

    // Broadcast game state
    io.emit('gameUpdate', gameState);

    // Continue game loop
    setTimeout(gameLoop, 1000 / 60); // ~60 FPS
}

function updateSnake(snake) {
    snake.direction = snake.nextDirection;

    const head = snake.body[0];
    const newHead = {
        x: head.x + snake.direction.x,
        y: head.y + snake.direction.y
    };

    // Boundary check
    if (newHead.x < 0 || newHead.x >= COLS || newHead.y < 0 || newHead.y >= ROWS) {
        snake.isDead = true;
        dropCoins(snake);
        return;
    }

    // Self collision
    if (snake.body.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        snake.isDead = true;
        dropCoins(snake);
        return;
    }

    // Collision with other snakes
    for (let otherSnake of gameState.snakes) {
        if (otherSnake !== snake && !otherSnake.isDead) {
            if (otherSnake.body.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
                snake.isDead = true;
                dropCoins(snake);
                return;
            }
        }
    }

    // Obstacle collision
    if (gameState.rocks.some(rock => rock.x === newHead.x && rock.y === newHead.y)) {
        snake.isDead = true;
        dropCoins(snake);
        return;
    }

    if (gameState.holes.some(hole => hole.x === newHead.x && hole.y === newHead.y)) {
        snake.isDead = true;
        dropCoins(snake);
        return;
    }

    snake.body.unshift(newHead);

    // Food collision
    let foodEaten = false;
    for (let i = 0; i < gameState.food.length; i++) {
        if (gameState.food[i].x === newHead.x && gameState.food[i].y === newHead.y) {
            snake.foodEaten++;
            gameState.food.splice(i, 1);
            foodEaten = true;
            break;
        }
    }

    // Coin collision
    for (let i = 0; i < gameState.coins.length; i++) {
        if (gameState.coins[i].x === newHead.x && gameState.coins[i].y === newHead.y) {
            snake.coinsCollected++;
            gameState.totalCoins++;
            gameState.coins.splice(i, 1);
            break;
        }
    }

    // Remove tail if no food eaten
    if (!foodEaten && snake.body.length > 1) {
        snake.body.pop();
    }
}

function createFood() {
    let x, y, valid;
    let attempts = 0;

    do {
        valid = true;
        x = Math.floor(Math.random() * COLS);
        y = Math.floor(Math.random() * ROWS);
        attempts++;

        if (gameState.food.some(f => f.x === x && f.y === y)) valid = false;
        if (gameState.coins.some(c => c.x === x && c.y === y)) valid = false;
        if (gameState.rocks.some(r => r.x === x && r.y === y)) valid = false;
        if (gameState.holes.some(h => h.x === x && h.y === y)) valid = false;

        for (let snake of gameState.snakes) {
            if (snake.body.some(segment => segment.x === x && segment.y === y)) {
                valid = false;
                break;
            }
        }
    } while (!valid && attempts < 50);

    if (attempts < 50) {
        gameState.food.push({ x, y });
    }
}

function createCoin() {
    let x, y, valid;
    let attempts = 0;

    do {
        valid = true;
        x = Math.floor(Math.random() * COLS);
        y = Math.floor(Math.random() * ROWS);
        attempts++;

        if (gameState.food.some(f => f.x === x && f.y === y)) valid = false;
        if (gameState.coins.some(c => c.x === x && c.y === y)) valid = false;
        if (gameState.rocks.some(r => r.x === x && r.y === y)) valid = false;
        if (gameState.holes.some(h => h.x === x && h.y === y)) valid = false;

        for (let snake of gameState.snakes) {
            if (snake.body.some(segment => segment.x === x && segment.y === y)) {
                valid = false;
                break;
            }
        }
    } while (!valid && attempts < 50);

    if (attempts < 50) {
        gameState.coins.push({ x, y });
    }
}

function spawnObstacle(type) {
    let x, y, valid;
    let attempts = 0;

    do {
        valid = true;
        x = Math.floor(Math.random() * COLS);
        y = Math.floor(Math.random() * ROWS);
        attempts++;

        if (gameState.rocks.some(r => r.x === x && r.y === y)) valid = false;
        if (gameState.holes.some(h => h.x === x && h.y === y)) valid = false;

        for (let snake of gameState.snakes) {
            if (snake.body.some(segment => segment.x === x && segment.y === y)) {
                valid = false;
                break;
            }
        }

        if (x < 3 || x > COLS - 3 || y < 3 || y > ROWS - 3) valid = false;
    } while (!valid && attempts < 20);

    if (attempts < 20) {
        if (type === 'rock') {
            gameState.rocks.push({ x, y });
        } else {
            gameState.holes.push({ x, y });
        }
    }
}

function dropCoins(snake) {
    for (let i = 0; i < snake.coinsCollected; i++) {
        gameState.coins.push({
            x: snake.body[0].x,
            y: snake.body[0].y
        });
    }
    snake.coinsCollected = 0;
}

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Snake World Multiplayer Server running on http://localhost:${PORT}`);
});
