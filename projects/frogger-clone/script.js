const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const levelElement = document.getElementById('level');
const timeElement = document.getElementById('time');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');

const gridSize = 40;
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
const rows = canvasHeight / gridSize;
const cols = canvasWidth / gridSize;

let frog = { x: Math.floor(cols / 2), y: rows - 1 };
let score = 0;
let lives = 3;
let level = 1;
let timeLeft = 60;
let gameRunning = false;
let gameInterval;
let timeInterval;

let cars = [];
let logs = [];
let turtles = [];

function initGame() {
    frog = { x: Math.floor(cols / 2), y: rows - 1 };
    score = 0;
    lives = 3;
    level = 1;
    timeLeft = 60;
    updateUI();
    generateObstacles();
}

function generateObstacles() {
    cars = [];
    logs = [];
    turtles = [];

    // Generate cars (rows 10-13)
    for (let row = 10; row <= 13; row++) {
        for (let i = 0; i < 3; i++) {
            cars.push({
                x: i * 4 + Math.random() * 2,
                y: row,
                speed: (row % 2 === 0 ? 1 : -1) * (0.5 + level * 0.1),
                width: 2
            });
        }
    }

    // Generate logs and turtles (rows 3-6)
    for (let row = 3; row <= 6; row++) {
        for (let i = 0; i < 2; i++) {
            if (row % 2 === 0) {
                logs.push({
                    x: i * 5 + Math.random() * 3,
                    y: row,
                    speed: (row % 2 === 0 ? 1 : -1) * (0.3 + level * 0.05),
                    width: 3
                });
            } else {
                turtles.push({
                    x: i * 4 + Math.random() * 2,
                    y: row,
                    speed: (row % 2 === 0 ? 1 : -1) * (0.4 + level * 0.05),
                    width: 2,
                    submerged: false,
                    subTimer: 0
                });
            }
        }
    }
}

function updateObstacles() {
    // Update cars
    cars.forEach(car => {
        car.x += car.speed;
        if (car.x > cols) car.x = -car.width;
        if (car.x < -car.width) car.x = cols;
    });

    // Update logs
    logs.forEach(log => {
        log.x += log.speed;
        if (log.x > cols) log.x = -log.width;
        if (log.x < -log.width) log.x = cols;
    });

    // Update turtles
    turtles.forEach(turtle => {
        turtle.x += turtle.speed;
        if (turtle.x > cols) turtle.x = -turtle.width;
        if (turtle.x < -turtle.width) turtle.x = cols;

        turtle.subTimer++;
        if (turtle.subTimer > 100) {
            turtle.submerged = !turtle.submerged;
            turtle.subTimer = 0;
        }
    });
}

function checkCollisions() {
    // Check car collisions
    for (let car of cars) {
        if (frog.y === car.y && frog.x >= car.x && frog.x < car.x + car.width) {
            loseLife();
            return;
        }
    }

    // Check water collisions
    if (frog.y >= 3 && frog.y <= 6) {
        let onLogOrTurtle = false;
        for (let log of logs) {
            if (frog.y === log.y && frog.x >= log.x && frog.x < log.x + log.width) {
                frog.x += log.speed;
                onLogOrTurtle = true;
                break;
            }
        }
        for (let turtle of turtles) {
            if (!turtle.submerged && frog.y === turtle.y && frog.x >= turtle.x && frog.x < turtle.x + turtle.width) {
                frog.x += turtle.speed;
                onLogOrTurtle = true;
                break;
            }
        }
        if (!onLogOrTurtle) {
            loseLife();
            return;
        }
    }

    // Check win condition
    if (frog.y === 0) {
        score += timeLeft * 10;
        level++;
        timeLeft = 60;
        frog = { x: Math.floor(cols / 2), y: rows - 1 };
        generateObstacles();
        updateUI();
    }
}

function loseLife() {
    lives--;
    if (lives <= 0) {
        gameOver();
    } else {
        frog = { x: Math.floor(cols / 2), y: rows - 1 };
        updateUI();
    }
}

function gameOver() {
    gameRunning = false;
    clearInterval(gameInterval);
    clearInterval(timeInterval);
    alert(`Game Over! Final Score: ${score}`);
}

function updateUI() {
    scoreElement.textContent = score;
    livesElement.textContent = lives;
    levelElement.textContent = level;
    timeElement.textContent = timeLeft;
}

function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw background
    ctx.fillStyle = '#27ae60'; // Grass
    ctx.fillRect(0, 0, canvasWidth, gridSize * 3);
    ctx.fillRect(0, gridSize * 7, canvasWidth, gridSize * 3);

    ctx.fillStyle = '#3498db'; // Water
    ctx.fillRect(0, gridSize * 3, canvasWidth, gridSize * 4);

    ctx.fillStyle = '#95a5a6'; // Road
    ctx.fillRect(0, gridSize * 7, canvasWidth, gridSize * 7);

    // Draw obstacles
    ctx.fillStyle = '#e74c3c'; // Cars
    cars.forEach(car => {
        ctx.fillRect(car.x * gridSize, car.y * gridSize, car.width * gridSize, gridSize);
    });

    ctx.fillStyle = '#8b4513'; // Logs
    logs.forEach(log => {
        ctx.fillRect(log.x * gridSize, log.y * gridSize, log.width * gridSize, gridSize);
    });

    ctx.fillStyle = '#228b22'; // Turtles
    turtles.forEach(turtle => {
        if (!turtle.submerged) {
            ctx.fillRect(turtle.x * gridSize, turtle.y * gridSize, turtle.width * gridSize, gridSize);
        }
    });

    // Draw frog
    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(frog.x * gridSize, frog.y * gridSize, gridSize, gridSize);
}

function gameLoop() {
    updateObstacles();
    checkCollisions();
    draw();
}

function startGame() {
    if (!gameRunning) {
        initGame();
        gameRunning = true;
        gameInterval = setInterval(gameLoop, 1000 / 60); // 60 FPS
        timeInterval = setInterval(() => {
            timeLeft--;
            updateUI();
            if (timeLeft <= 0) {
                loseLife();
            }
        }, 1000);
    }
}

function resetGame() {
    gameRunning = false;
    clearInterval(gameInterval);
    clearInterval(timeInterval);
    initGame();
    draw();
}

// Event listeners
document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    switch (e.key) {
        case 'ArrowUp':
            if (frog.y > 0) frog.y--;
            break;
        case 'ArrowDown':
            if (frog.y < rows - 1) frog.y++;
            break;
        case 'ArrowLeft':
            if (frog.x > 0) frog.x--;
            break;
        case 'ArrowRight':
            if (frog.x < cols - 1) frog.x++;
            break;
    }
});

startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);

// Initial draw
draw();
