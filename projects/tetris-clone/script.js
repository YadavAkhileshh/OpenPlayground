// Tetris Clone Game Logic

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

const COLORS = [
    '#000000', // empty
    '#FF0000', // I
    '#00FF00', // O
    '#0000FF', // T
    '#FFFF00', // S
    '#FF00FF', // Z
    '#00FFFF', // J
    '#FFA500'  // L
];

const SHAPES = [
    [], // empty
    [[1,1,1,1]], // I
    [[1,1],[1,1]], // O
    [[0,1,0],[1,1,1]], // T
    [[0,1,1],[1,1,0]], // S
    [[1,1,0],[0,1,1]], // Z
    [[1,0,0],[1,1,1]], // J
    [[0,0,1],[1,1,1]]  // L
];

let board = [];
let currentPiece = null;
let nextPiece = null;
let holdPiece = null;
let canHold = true;
let score = 0;
let level = 1;
let lines = 0;
let gameRunning = false;
let gamePaused = false;
let dropTimer = 0;
let dropInterval = 1000;

let canvas = document.getElementById('tetris-canvas');
let ctx = canvas.getContext('2d');
let nextCanvas = document.getElementById('next-canvas');
let nextCtx = nextCanvas.getContext('2d');

function initBoard() {
    board = [];
    for (let r = 0; r < ROWS; r++) {
        board[r] = [];
        for (let c = 0; c < COLS; c++) {
            board[r][c] = 0;
        }
    }
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            drawBlock(c, r, board[r][c]);
        }
    }
    if (currentPiece) {
        drawPiece(currentPiece);
    }
}

function drawBlock(x, y, colorIndex) {
    ctx.fillStyle = COLORS[colorIndex];
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    ctx.strokeStyle = '#333';
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

function drawPiece(piece) {
    for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
            if (piece.shape[r][c]) {
                drawBlock(piece.x + c, piece.y + r, piece.color);
            }
        }
    }
}

function drawNextPiece() {
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    if (nextPiece) {
        const shape = nextPiece.shape;
        const offsetX = (nextCanvas.width - shape[0].length * BLOCK_SIZE) / 2;
        const offsetY = (nextCanvas.height - shape.length * BLOCK_SIZE) / 2;
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c]) {
                    nextCtx.fillStyle = COLORS[nextPiece.color];
                    nextCtx.fillRect(offsetX + c * BLOCK_SIZE, offsetY + r * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                    nextCtx.strokeStyle = '#333';
                    nextCtx.strokeRect(offsetX + c * BLOCK_SIZE, offsetY + r * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                }
            }
        }
    }
}

function createPiece(type) {
    return {
        shape: SHAPES[type],
        color: type,
        x: Math.floor(COLS / 2) - 1,
        y: 0
    };
}

function getRandomPiece() {
    return Math.floor(Math.random() * 7) + 1;
}

function rotatePiece(piece) {
    const rotated = [];
    for (let c = 0; c < piece.shape[0].length; c++) {
        rotated[c] = [];
        for (let r = piece.shape.length - 1; r >= 0; r--) {
            rotated[c].push(piece.shape[r][c]);
        }
    }
    return rotated;
}

function isValidMove(piece, newX, newY, newShape = piece.shape) {
    for (let r = 0; r < newShape.length; r++) {
        for (let c = 0; c < newShape[r].length; c++) {
            if (newShape[r][c]) {
                const x = newX + c;
                const y = newY + r;
                if (x < 0 || x >= COLS || y >= ROWS || (y >= 0 && board[y][x])) {
                    return false;
                }
            }
        }
    }
    return true;
}

function placePiece(piece) {
    for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
            if (piece.shape[r][c]) {
                board[piece.y + r][piece.x + c] = piece.color;
            }
        }
    }
}

function clearLines() {
    let linesCleared = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r].every(cell => cell !== 0)) {
            board.splice(r, 1);
            board.unshift(new Array(COLS).fill(0));
            linesCleared++;
            r++; // check the same row again
        }
    }
    return linesCleared;
}

function updateScore(linesCleared) {
    const points = [0, 40, 100, 300, 1200];
    score += points[linesCleared] * level;
    lines += linesCleared;
    level = Math.floor(lines / 10) + 1;
    dropInterval = Math.max(50, 1000 - (level - 1) * 50);
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('lines').textContent = lines;
}

function spawnPiece() {
    currentPiece = nextPiece || createPiece(getRandomPiece());
    nextPiece = createPiece(getRandomPiece());
    drawNextPiece();
    if (!isValidMove(currentPiece, currentPiece.x, currentPiece.y)) {
        gameOver();
    }
}

function gameOver() {
    gameRunning = false;
    alert('Game Over! Score: ' + score);
    // Save high score
    const highScore = localStorage.getItem('tetrisHighScore') || 0;
    if (score > highScore) {
        localStorage.setItem('tetrisHighScore', score);
        alert('New High Score!');
    }
}

function gameLoop(timestamp) {
    if (!gameRunning || gamePaused) return;

    if (timestamp - dropTimer > dropInterval) {
        if (isValidMove(currentPiece, currentPiece.x, currentPiece.y + 1)) {
            currentPiece.y++;
        } else {
            placePiece(currentPiece);
            const linesCleared = clearLines();
            updateScore(linesCleared);
            spawnPiece();
        }
        dropTimer = timestamp;
    }

    drawBoard();
    requestAnimationFrame(gameLoop);
}

function movePiece(dx, dy) {
    if (isValidMove(currentPiece, currentPiece.x + dx, currentPiece.y + dy)) {
        currentPiece.x += dx;
        currentPiece.y += dy;
    }
}

function rotate() {
    const rotated = rotatePiece(currentPiece);
    if (isValidMove(currentPiece, currentPiece.x, currentPiece.y, rotated)) {
        currentPiece.shape = rotated;
    }
}

function hardDrop() {
    while (isValidMove(currentPiece, currentPiece.x, currentPiece.y + 1)) {
        currentPiece.y++;
        score += 2; // bonus points for hard drop
    }
    placePiece(currentPiece);
    const linesCleared = clearLines();
    updateScore(linesCleared);
    spawnPiece();
}

function hold() {
    if (!canHold) return;
    if (holdPiece) {
        [currentPiece, holdPiece] = [holdPiece, currentPiece];
        currentPiece.x = Math.floor(COLS / 2) - 1;
        currentPiece.y = 0;
    } else {
        holdPiece = currentPiece;
        spawnPiece();
    }
    canHold = false;
}

document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    switch (e.key) {
        case 'ArrowLeft':
            movePiece(-1, 0);
            break;
        case 'ArrowRight':
            movePiece(1, 0);
            break;
        case 'ArrowDown':
            movePiece(0, 1);
            break;
        case 'ArrowUp':
            rotate();
            break;
        case ' ':
            e.preventDefault();
            hardDrop();
            break;
        case 'c':
        case 'C':
            hold();
            break;
    }
});

document.getElementById('start-btn').addEventListener('click', () => {
    if (!gameRunning) {
        initBoard();
        score = 0;
        level = 1;
        lines = 0;
        gameRunning = true;
        gamePaused = false;
        spawnPiece();
        requestAnimationFrame(gameLoop);
    }
});

document.getElementById('pause-btn').addEventListener('click', () => {
    gamePaused = !gamePaused;
    if (gamePaused) {
        document.getElementById('pause-btn').textContent = 'Resume';
    } else {
        document.getElementById('pause-btn').textContent = 'Pause';
        requestAnimationFrame(gameLoop);
    }
});

document.getElementById('reset-btn').addEventListener('click', () => {
    gameRunning = false;
    gamePaused = false;
    initBoard();
    currentPiece = null;
    nextPiece = null;
    holdPiece = null;
    canHold = true;
    score = 0;
    level = 1;
    lines = 0;
    document.getElementById('score').textContent = '0';
    document.getElementById('level').textContent = '1';
    document.getElementById('lines').textContent = '0';
    drawBoard();
    drawNextPiece();
});

// Initialize
initBoard();
drawBoard();
drawNextPiece();
