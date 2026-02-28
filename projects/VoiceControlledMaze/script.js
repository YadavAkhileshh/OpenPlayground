const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');
const timerDisplay = document.getElementById('timer');
const statusText = document.getElementById('status-text');
const listeningIndicator = document.getElementById('listening-indicator');
const startOverlay = document.getElementById('start-overlay');
const winOverlay = document.getElementById('win-overlay');
const errorOverlay = document.getElementById('error-overlay');
const errorMessage = document.getElementById('error-message');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const retryBtn = document.getElementById('retry-btn');
const finalTimeDisplay = document.getElementById('final-time');
const lastCommandDisplay = document.getElementById('last-command');

// Game Config
const COLS = 15;
const ROWS = 15;
let cellSize;
let maze = [];
let stack = [];
let player = { col: 0, row: 0 };
let goal = { col: COLS - 1, row: ROWS - 1 };
let gameRunning = false;
let startTime;
let timerInterval;

// Speech Recognition Setup
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
let isListening = false;
let retryCount = 0;
const MAX_RETRIES = 5;

if (window.SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false; // Changed to false for better stability on some versions
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
        isListening = true;
        retryCount = 0; // Reset retries on successful start
        listeningIndicator.classList.add('active');
        statusText.innerText = "Listening...";
        console.log("Voice recognition started");
    };

    recognition.onend = () => {
        isListening = false;
        listeningIndicator.classList.remove('active');

        if (gameRunning) {
            // Small delay before restarting to prevent rapid loops
            setTimeout(() => {
                if (gameRunning) {
                    try {
                        recognition.start();
                    } catch (e) {
                        console.warn("Recognition start suppressed", e);
                    }
                }
            }, 100);
        } else {
            statusText.innerText = "Paused";
        }
    };

    recognition.onresult = (event) => {
        const last = event.results.length - 1;
        const command = event.results[last][0].transcript.trim().toLowerCase();

        console.log("Raw Command:", command);
        processCommand(command);
    };

    recognition.onerror = (event) => {
        if (event.error === 'no-speech') {
            // Common error when silence is detected, just ignore.
            // onend will fire and restart the listener.
            return;
        }

        console.error("Speech API Error:", event.error);

        if (event.error === 'not-allowed') {
            gameRunning = false;
            showError("Microphone access denied. Please verify permissions.");
        } else if (event.error === 'network') {
            statusText.innerText = "Network Issue";
            // onend will fire and try to restart
        } else if (event.error === 'aborted') {
            // Checking if another session is taking over
        }
    };

} else {
    showError("Your browser does not support Voice Recognition. Please use Google Chrome.");
}

// Maze Cell Class
class Cell {
    constructor(col, row) {
        this.col = col;
        this.row = row;
        this.walls = { top: true, right: true, bottom: true, left: true };
        this.visited = false;
    }

    draw() {
        let x = this.col * cellSize;
        let y = this.row * cellSize;

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.lineCap = "round";

        if (this.walls.top) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + cellSize, y);
            ctx.stroke();
        }
        if (this.walls.right) {
            ctx.beginPath();
            ctx.moveTo(x + cellSize, y);
            ctx.lineTo(x + cellSize, y + cellSize);
            ctx.stroke();
        }
        if (this.walls.bottom) {
            ctx.beginPath();
            ctx.moveTo(x + cellSize, y + cellSize);
            ctx.lineTo(x, y + cellSize);
            ctx.stroke();
        }
        if (this.walls.left) {
            ctx.beginPath();
            ctx.moveTo(x, y + cellSize);
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    }

    checkNeighbors() {
        let neighbors = [];

        let top = grid(this.col, this.row - 1);
        let right = grid(this.col + 1, this.row);
        let bottom = grid(this.col, this.row + 1);
        let left = grid(this.col - 1, this.row);

        if (top && !top.visited) neighbors.push(top);
        if (right && !right.visited) neighbors.push(right);
        if (bottom && !bottom.visited) neighbors.push(bottom);
        if (left && !left.visited) neighbors.push(left);

        if (neighbors.length > 0) {
            let r = Math.floor(Math.random() * neighbors.length);
            return neighbors[r];
        } else {
            return undefined;
        }
    }
}

function grid(col, row) {
    if (col < 0 || row < 0 || col > COLS - 1 || row > ROWS - 1) {
        return undefined;
    }
    return maze[col + row * COLS];
}

function generateMaze() {
    maze = [];
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            maze.push(new Cell(c, r));
        }
    }

    let current = maze[0];
    current.visited = true;

    // Recursive Backtracker
    // Using a loop instead of recursion to avoid stack overflow on large grids
    stack.push(current);

    while (stack.length > 0) {
        current = stack[stack.length - 1]; // Peek
        let next = current.checkNeighbors();

        if (next) {
            next.visited = true;
            stack.push(next);
            removeWalls(current, next);
            current = next; // Move to next
        } else {
            stack.pop(); // Backtrack
        }
    }
}

function removeWalls(a, b) {
    let x = a.col - b.col;
    if (x === 1) {
        a.walls.left = false;
        b.walls.right = false;
    } else if (x === -1) {
        a.walls.right = false;
        b.walls.left = false;
    }

    let y = a.row - b.row;
    if (y === 1) {
        a.walls.top = false;
        b.walls.bottom = false;
    } else if (y === -1) {
        a.walls.bottom = false;
        b.walls.top = false;
    }
}

function drawGame() {
    // Clear
    ctx.fillStyle = '#010409';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Maze
    for (let i = 0; i < maze.length; i++) {
        maze[i].draw();
    }

    // Draw Player
    let px = player.col * cellSize + cellSize / 4;
    let py = player.row * cellSize + cellSize / 4;
    ctx.fillStyle = '#2f81f7'; // Player Blue
    ctx.beginPath();
    ctx.arc(player.col * cellSize + cellSize / 2, player.row * cellSize + cellSize / 2, cellSize / 3, 0, 2 * Math.PI);
    ctx.fill();
    // Glow
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#2f81f7';
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw Goal
    ctx.fillStyle = '#238636'; // Success Green
    ctx.beginPath();
    // Draw a square for goal
    ctx.fillRect(goal.col * cellSize + 5, goal.row * cellSize + 5, cellSize - 10, cellSize - 10);
    ctx.fill();
}

function processCommand(cmd) {
    if (!gameRunning) return;

    // Normalize synonyms
    if (cmd.includes('up') || cmd.includes('top')) cmd = 'up';
    else if (cmd.includes('down') || cmd.includes('bottom')) cmd = 'down';
    else if (cmd.includes('left')) cmd = 'left';
    else if (cmd.includes('right')) cmd = 'right';
    else return; // Ignore unknown

    updateFeedback(cmd);

    let currentCell = maze[player.col + player.row * COLS];
    let moved = false;

    if (cmd === 'up' && !currentCell.walls.top) {
        player.row--;
        moved = true;
    } else if (cmd === 'right' && !currentCell.walls.right) {
        player.col++;
        moved = true;
    } else if (cmd === 'down' && !currentCell.walls.bottom) {
        player.row++;
        moved = true;
    } else if (cmd === 'left' && !currentCell.walls.left) {
        player.col--;
        moved = true;
    }

    if (moved) {
        drawGame();
        checkWin();
    } else {
        // Optional: Visual feedback for "Blocked"
        lastCommandDisplay.style.color = '#f78166'; // Red
        setTimeout(() => lastCommandDisplay.style.color = '#58a6ff', 500);
    }
}

function updateFeedback(text) {
    lastCommandDisplay.innerText = text;
    // Animation effect
    lastCommandDisplay.style.opacity = '0.5';
    setTimeout(() => lastCommandDisplay.style.opacity = '1', 100);
}

function checkWin() {
    if (player.col === goal.col && player.row === goal.row) {
        endGame(true);
    }
}

function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
        let delta = Date.now() - startTime;
        let seconds = Math.floor(delta / 1000);
        let m = Math.floor(seconds / 60).toString().padStart(2, '0');
        let s = (seconds % 60).toString().padStart(2, '0');
        timerDisplay.innerText = `${m}:${s}`;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function startGame() {
    if (recognition) {
        try {
            recognition.start();
        } catch (e) { console.log("Already started"); }
    }

    // Reset Game State
    generateMaze();
    player = { col: 0, row: 0 };
    gameRunning = true;

    // Resize canvas
    resizeCanvas();

    startOverlay.classList.add('hidden');
    winOverlay.classList.add('hidden');
    errorOverlay.classList.add('hidden');

    startTimer();
    drawGame();
    lastCommandDisplay.innerText = "Waiting...";
}

function endGame(won) {
    gameRunning = false;
    stopTimer();
    if (recognition) recognition.stop();

    if (won) {
        finalTimeDisplay.innerText = timerDisplay.innerText;
        winOverlay.classList.remove('hidden');
    }
}

function showError(msg) {
    errorMessage.innerText = msg;
    startOverlay.classList.add('hidden');
    errorOverlay.classList.remove('hidden');
}

function resizeCanvas() {
    const wrapper = document.querySelector('.canvas-wrapper');
    const size = Math.min(wrapper.clientWidth, wrapper.clientHeight);
    canvas.width = size;
    canvas.height = size;
    cellSize = Math.floor(size / COLS);

    // Redraw if game is active
    if (gameRunning) drawGame();
}

// Event Listeners
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
retryBtn.addEventListener('click', () => {
    errorOverlay.classList.add('hidden');
    startOverlay.classList.remove('hidden');
});

window.addEventListener('resize', () => {
    // Debounce resize
    clearTimeout(window.resizeTimer);
    window.resizeTimer = setTimeout(resizeCanvas, 100);
});

// Initial Setup
resizeCanvas();
