const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const levelElement = document.getElementById('level');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');

const gridSize = 20;
const gridWidth = canvas.width / gridSize;
const gridHeight = canvas.height / gridSize;

// Maze layout (1 = wall, 0 = path, 2 = dot, 3 = power pellet, 4 = empty)
const maze = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,3,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,3,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,2,1,1,1,1,1,1,1,1,1,1,2,1,2,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,1,2,2,2,2,2,1,1,2,2,2,2,2,1,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,2,1,1,1,1,2,0,1,1,0,2,1,1,1,1,2,1,1,1,1,1,1],
    [0,0,0,0,0,0,2,1,1,1,1,2,0,1,1,0,2,1,1,1,1,2,0,0,0,0,0,0],
    [1,1,1,1,1,1,2,1,1,1,1,2,0,1,1,0,2,1,1,1,1,2,1,1,1,1,1,1],
    [0,0,0,0,0,0,2,1,1,1,1,2,2,2,2,2,2,1,1,1,1,2,0,0,0,0,0,0],
    [1,1,1,1,1,1,2,1,1,1,1,1,1,0,0,1,1,1,1,1,1,2,1,1,1,1,1,1],
    [0,0,0,0,0,0,2,1,1,1,1,1,1,0,0,1,1,1,1,1,1,2,0,0,0,0,0,0],
    [1,1,1,1,1,1,2,1,1,1,1,1,1,0,0,1,1,1,1,1,1,2,1,1,1,1,1,1],
    [0,0,0,0,0,0,2,1,1,1,1,2,2,2,2,2,2,1,1,1,1,2,0,0,0,0,0,0],
    [1,1,1,1,1,1,2,1,1,1,1,2,0,1,1,0,2,1,1,1,1,2,1,1,1,1,1,1],
    [0,0,0,0,0,0,2,1,1,1,1,2,0,1,1,0,2,1,1,1,1,2,0,0,0,0,0,0],
    [1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,1,1,2,1],
    [1,3,2,2,1,1,2,2,2,2,2,2,2,0,0,2,2,2,2,2,2,2,1,1,2,2,3,1],
    [1,1,1,2,1,1,2,1,2,1,1,1,1,1,1,1,1,1,1,2,1,2,1,1,2,1,1,1],
    [1,2,2,2,2,2,2,1,2,2,2,2,2,1,1,2,2,2,2,2,1,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,1,1,1,1,1,2,0,1,1,0,2,1,1,1,1,1,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

let pacman = { x: 14, y: 23, dx: 0, dy: 0 };
let ghosts = [
    { x: 12, y: 11, dx: 0, dy: -1, color: 'red' },
    { x: 15, y: 11, dx: 0, dy: -1, color: 'pink' },
    { x: 12, y: 14, dx: 0, dy: 1, color: 'cyan' },
    { x: 15, y: 14, dx: 0, dy: 1, color: 'orange' }
];
let score = 0;
let lives = 3;
let level = 1;
let gameState = 'start'; // 'start', 'playing', 'gameOver'
let powerMode = false;
let powerModeTimer = 0;

function drawMaze() {
    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[y].length; x++) {
            if (maze[y][x] === 1) {
                ctx.fillStyle = '#0000ff';
                ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
            } else if (maze[y][x] === 2) {
                ctx.fillStyle = '#ffff00';
                ctx.beginPath();
                ctx.arc(x * gridSize + gridSize / 2, y * gridSize + gridSize / 2, 3, 0, 2 * Math.PI);
                ctx.fill();
            } else if (maze[y][x] === 3) {
                ctx.fillStyle = '#ffff00';
                ctx.beginPath();
                ctx.arc(x * gridSize + gridSize / 2, y * gridSize + gridSize / 2, 8, 0, 2 * Math.PI);
                ctx.fill();
            }
        }
    }
}

function drawPacman() {
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(pacman.x * gridSize + gridSize / 2, pacman.y * gridSize + gridSize / 2, gridSize / 2 - 2, 0, 2 * Math.PI);
    ctx.fill();
}

function drawGhosts() {
    ghosts.forEach(ghost => {
        ctx.fillStyle = ghost.color;
        ctx.fillRect(ghost.x * gridSize + 2, ghost.y * gridSize + 2, gridSize - 4, gridSize - 4);
    });
}

function movePacman() {
    const newX = pacman.x + pacman.dx;
    const newY = pacman.y + pacman.dy;

    if (maze[newY] && maze[newY][newX] !== 1) {
        pacman.x = newX;
        pacman.y = newY;

        if (maze[newY][newX] === 2) {
            maze[newY][newX] = 0;
            score += 10;
            updateUI();
        } else if (maze[newY][newX] === 3) {
            maze[newY][newX] = 0;
            score += 50;
            powerMode = true;
            powerModeTimer = 600; // 10 seconds at 60 FPS
            updateUI();
        }
    }
}

function moveGhosts() {
    ghosts.forEach(ghost => {
        const directions = [
            { dx: 0, dy: -1 },
            { dx: 0, dy: 1 },
            { dx: -1, dy: 0 },
            { dx: 1, dy: 0 }
        ];

        const validDirections = directions.filter(dir => {
            const newX = ghost.x + dir.dx;
            const newY = ghost.y + dir.dy;
            return maze[newY] && maze[newY][newX] !== 1;
        });

        if (validDirections.length > 0) {
            const randomDir = validDirections[Math.floor(Math.random() * validDirections.length)];
            ghost.dx = randomDir.dx;
            ghost.dy = randomDir.dy;
        }

        ghost.x += ghost.dx;
        ghost.y += ghost.dy;
    });
}

function checkCollisions() {
    ghosts.forEach(ghost => {
        if (pacman.x === ghost.x && pacman.y === ghost.y) {
            if (powerMode) {
                // Eat ghost
                ghost.x = 14;
                ghost.y = 11;
                score += 200;
                updateUI();
            } else {
                // Lose life
                lives--;
                updateUI();
                if (lives <= 0) {
                    gameState = 'gameOver';
                    gameOverScreen.style.display = 'block';
                } else {
                    resetPositions();
                }
            }
        }
    });
}

function resetPositions() {
    pacman.x = 14;
    pacman.y = 23;
    pacman.dx = 0;
    pacman.dy = 0;
    ghosts.forEach((ghost, index) => {
        if (index === 0) { ghost.x = 12; ghost.y = 11; }
        else if (index === 1) { ghost.x = 15; ghost.y = 11; }
        else if (index === 2) { ghost.x = 12; ghost.y = 14; }
        else { ghost.x = 15; ghost.y = 14; }
        ghost.dx = 0;
        ghost.dy = -1;
    });
}

function updateUI() {
    scoreElement.textContent = `Score: ${score}`;
    livesElement.textContent = `Lives: ${lives}`;
    levelElement.textContent = `Level: ${level}`;
}

function gameLoop() {
    if (gameState === 'playing') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawMaze();
        movePacman();
        moveGhosts();
        checkCollisions();
        drawPacman();
        drawGhosts();

        if (powerMode) {
            powerModeTimer--;
            if (powerModeTimer <= 0) {
                powerMode = false;
            }
        }
    }
    requestAnimationFrame(gameLoop);
}

function startGame() {
    gameState = 'playing';
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    resetPositions();
    updateUI();
}

function restartGame() {
    score = 0;
    lives = 3;
    level = 1;
    powerMode = false;
    powerModeTimer = 0;
    startGame();
}

document.addEventListener('keydown', (e) => {
    if (gameState === 'playing') {
        switch (e.key) {
            case 'ArrowUp':
                pacman.dx = 0;
                pacman.dy = -1;
                break;
            case 'ArrowDown':
                pacman.dx = 0;
                pacman.dy = 1;
                break;
            case 'ArrowLeft':
                pacman.dx = -1;
                pacman.dy = 0;
                break;
            case 'ArrowRight':
                pacman.dx = 1;
                pacman.dy = 0;
                break;
        }
    }
});

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', restartGame);

gameLoop();
