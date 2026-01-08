const boardElement = document.getElementById('sudoku-board');
const statusText = document.getElementById('status-text');
const speedSlider = document.getElementById('speed-slider');
const diffSelect = document.getElementById('diff-select');

// Buttons
const newBtn = document.getElementById('new-btn');
const clearBtn = document.getElementById('clear-btn');
const solveBtn = document.getElementById('solve-btn');
const checkBtn = document.getElementById('check-btn');

let initialBoard = [];
let currentBoard = [];
let isVisualizing = false;
let abortController = null;

// --- Config ---
// Speed: 1 (slow) -> 100 (fast)
// Delay: 100ms -> 1ms
const getDelay = () => {
    const val = 101 - parseInt(speedSlider.value);
    return val <= 1 ? 0 : val;
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function checkAbort() {
    if (!isVisualizing) throw new Error('Stopped');
    const d = getDelay();
    if (d > 0) await sleep(d);
}

// --- Init ---
function createGrid() {
    boardElement.innerHTML = '';
    for (let i = 0; i < 81; i++) {
        const input = document.createElement('input');
        input.type = 'number'; // Allow number pad manipulation on mobile
        input.inputMode = 'numeric'; // Better keyboard
        input.classList.add('cell');
        input.dataset.index = i;

        input.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            // Validation: only 1-9 allowed
            if (isNaN(val) || val < 1 || val > 9) {
                e.target.value = '';
                currentBoard[Math.floor(i / 9)][i % 9] = 0;
            } else {
                // Ensure single digit
                e.target.value = val;
                currentBoard[Math.floor(i / 9)][i % 9] = val;
                e.target.classList.remove('wrong', 'solved', 'solving');
            }
        });

        boardElement.appendChild(input);
    }
}

function updateGrid(board, fixed = []) {
    const cells = document.querySelectorAll('.cell');
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const idx = i * 9 + j;
            const val = board[i][j];
            cells[idx].value = val === 0 ? '' : val;

            // Reset classes
            cells[idx].className = 'cell';

            if (fixed[i] && fixed[i][j] !== 0) {
                cells[idx].classList.add('fixed');
                cells[idx].disabled = true;
            } else {
                cells[idx].disabled = false;
            }
        }
    }
}

// --- Generator ---
// We need a brute force solver to generate valid boards anyway
function generateSolvedBoard() {
    const board = Array(9).fill().map(() => Array(9).fill(0));
    solveHelper(board, true); // Randomized solve
    return board;
}

function solveHelper(board, randomized = false) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0) {
                const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
                if (randomized) nums.sort(() => Math.random() - 0.5);

                for (let num of nums) {
                    if (isValid(board, row, col, num)) {
                        board[row][col] = num;
                        if (solveHelper(board, randomized)) return true;
                        board[row][col] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

function isValid(board, row, col, num) {
    // Check Row
    for (let x = 0; x < 9; x++) if (board[row][x] === num) return false;
    // Check Col
    for (let x = 0; x < 9; x++) if (board[x][col] === num) return false;
    // Check 3x3
    const startRow = row - row % 3;
    const startCol = col - col % 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[i + startRow][j + startCol] === num) return false;
        }
    }
    return true;
}

function generatePuzzle() {
    isVisualizing = false;
    const fullBoard = generateSolvedBoard();

    // Remove numbers based on difficulty
    // Easy: ~40 removed, Medium: ~50, Hard: ~60
    let attempts = 50;
    const diff = diffSelect.value;
    if (diff === 'easy') attempts = 30;
    else if (diff === 'hard') attempts = 60;
    else attempts = 45;

    // Deep copy
    initialBoard = JSON.parse(JSON.stringify(fullBoard));

    while (attempts > 0) {
        let row = Math.floor(Math.random() * 9);
        let col = Math.floor(Math.random() * 9);
        if (initialBoard[row][col] !== 0) {
            initialBoard[row][col] = 0;
            attempts--;
        }
    }

    // Set current state
    currentBoard = JSON.parse(JSON.stringify(initialBoard));
    updateGrid(currentBoard, initialBoard);
    statusText.innerText = "New puzzle generated!";
}

// --- Visual Solving ---
async function visualizeSolve() {
    if (isVisualizing) return;
    isVisualizing = true;
    disableControls();
    statusText.innerText = "Backtracking algorithm running...";

    // Reset any user inputs that are wrong? No, let's just solve from the initial board state? 
    // Or solve from current state? Usually better to solve from scratch (initial).
    // Let's reset to initial state first so we see the full solution cleanly.

    // Actually, users might have filled some partially correct. 
    // Let's just solve what is on the screen.
    // NOTE: If user put a WRONG number, it might be unsolvable.
    // For simplicity, let's clear user input first.
    currentBoard = JSON.parse(JSON.stringify(initialBoard));
    updateGrid(currentBoard, initialBoard);

    try {
        const solved = await solveVisualizer(currentBoard);
        if (solved) {
            statusText.innerText = "Solved!";
        } else {
            statusText.innerText = "No solution found.";
        }
    } catch (e) {
        if (e.message === 'Stopped') statusText.innerText = "Stopped.";
        else console.error(e);
    }

    isVisualizing = false;
    enableControls();
}

async function solveVisualizer(board) {
    const cells = document.querySelectorAll('.cell');

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0) {
                // Try neighbors
                for (let num = 1; num <= 9; num++) {
                    if (isValid(board, row, col, num)) {
                        board[row][col] = num;

                        // DOM update
                        const idx = row * 9 + col;
                        cells[idx].value = num;
                        cells[idx].classList.add('solving');

                        await checkAbort();

                        const result = await solveVisualizer(board);
                        if (result) return true;

                        // Backtrack
                        board[row][col] = 0;
                        cells[idx].value = '';
                        cells[idx].classList.remove('solving');

                        await checkAbort(); // Also delay on backtrack to see it happen
                    }
                }
                return false;
            }
        }
    }
    return true;
}

// --- Controls ---
function disableControls() {
    newBtn.disabled = true;
    clearBtn.disabled = true;
    solveBtn.disabled = true;
    checkBtn.disabled = true; // Can't check while machine is solving
}
function enableControls() {
    newBtn.disabled = false;
    clearBtn.disabled = false;
    solveBtn.disabled = false;
    checkBtn.disabled = false;
}

function checkSolution() {
    // Validate current board against rules
    // (A real check would compare against the unique solution)
    // But since we generate valid puzzles, let's just check validity constraints

    let isCorrect = true;
    const cells = document.querySelectorAll('.cell');

    // 1. Check if full
    // 2. Check if valid

    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const idx = i * 9 + j;
            const val = currentBoard[i][j];

            if (val === 0) {
                // Empty
                cells[idx].classList.remove('correct', 'wrong');
                continue; // Can't mark empty as wrong technically, just incomplete
            }

            // Allow checking if the move is legal CURRENTLY (even if incomplete board)
            // But checking validity includes checking against ITSELF which is always true
            // We must temporarily remove it to check
            const temp = currentBoard[i][j];
            currentBoard[i][j] = 0;
            const valid = isValid(currentBoard, i, j, temp);
            currentBoard[i][j] = temp;

            if (valid) {
                if (initialBoard[i][j] === 0) { // Only mark user input
                    cells[idx].classList.add('solved');
                    cells[idx].classList.remove('wrong');
                }
            } else {
                cells[idx].classList.add('wrong');
                cells[idx].classList.remove('solved');
                isCorrect = false;
            }
        }
    }

    if (isCorrect) statusText.innerText = "So far so good!";
    else statusText.innerText = "Some errors found.";
}

// --- Listeners ---
createGrid();
generatePuzzle();

newBtn.addEventListener('click', generatePuzzle);
clearBtn.addEventListener('click', () => {
    isVisualizing = false;
    currentBoard = JSON.parse(JSON.stringify(initialBoard));
    updateGrid(currentBoard, initialBoard);
});
solveBtn.addEventListener('click', visualizeSolve);
checkBtn.addEventListener('click', checkSolution);
