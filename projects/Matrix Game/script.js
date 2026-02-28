// Game state
let gameState = {
    level: 1,
    score: 0,
    bestScore: 0,
    pattern: [],
    userSelection: [],
    isPlaying: false,
    isMemorizing: false,
    gridSize: 4
};

// DOM elements
const gridContainer = document.getElementById('gridContainer');
const startBtn = document.getElementById('startBtn');
const submitBtn = document.getElementById('submitBtn');
const resetBtn = document.getElementById('resetBtn');
const gameStatus = document.getElementById('gameStatus');
const levelDisplay = document.getElementById('level');
const scoreDisplay = document.getElementById('score');
const bestDisplay = document.getElementById('best');

// Initialize game
function init() {
    loadBestScore();
    createGrid();
    attachEventListeners();
    updateDisplay();
}

// Load best score from localStorage
function loadBestScore() {
    const saved = localStorage.getItem('memoryMatrixBest');
    if (saved) {
        gameState.bestScore = parseInt(saved);
    }
}

// Save best score to localStorage
function saveBestScore() {
    localStorage.setItem('memoryMatrixBest', gameState.bestScore);
}

// Create grid
function createGrid() {
    gridContainer.innerHTML = '';
    const totalCells = gameState.gridSize * gameState.gridSize;
    
    for (let i = 0; i < totalCells; i++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.dataset.index = i;
        cell.addEventListener('click', () => handleCellClick(i));
        gridContainer.appendChild(cell);
    }
    
    gridContainer.style.gridTemplateColumns = `repeat(${gameState.gridSize}, 1fr)`;
}

// Attach event listeners
function attachEventListeners() {
    startBtn.addEventListener('click', startGame);
    submitBtn.addEventListener('click', checkAnswer);
    resetBtn.addEventListener('click', resetGame);
}

// Start new round
function startGame() {
    if (gameState.isPlaying) return;
    
    gameState.isPlaying = true;
    gameState.userSelection = [];
    gameState.pattern = generatePattern();
    
    startBtn.disabled = true;
    submitBtn.disabled = true;
    
    updateStatus('Watch carefully...', 'default');
    
    // Clear previous selections
    const cells = document.querySelectorAll('.grid-cell');
    cells.forEach(cell => {
        cell.classList.remove('selected', 'correct', 'incorrect');
        cell.classList.add('disabled');
    });
    
    // Show pattern
    setTimeout(() => {
        showPattern();
    }, 500);
}

// Generate random pattern
function generatePattern() {
    const totalCells = gameState.gridSize * gameState.gridSize;
    const patternLength = Math.min(3 + gameState.level, Math.floor(totalCells * 0.6));
    const pattern = [];
    
    while (pattern.length < patternLength) {
        const randomIndex = Math.floor(Math.random() * totalCells);
        if (!pattern.includes(randomIndex)) {
            pattern.push(randomIndex);
        }
    }
    
    return pattern;
}

// Show pattern to memorize
async function showPattern() {
    gameState.isMemorizing = true;
    const cells = document.querySelectorAll('.grid-cell');
    
    // Flash all pattern cells simultaneously
    gameState.pattern.forEach(index => {
        cells[index].classList.add('flash');
    });
    
    // Calculate display time based on level (gets shorter as level increases)
    const displayTime = Math.max(2000 - (gameState.level * 100), 1000);
    
    await sleep(displayTime);
    
    // Remove flash
    gameState.pattern.forEach(index => {
        cells[index].classList.remove('flash');
    });
    
    gameState.isMemorizing = false;
    
    // Enable grid for user input
    cells.forEach(cell => {
        cell.classList.remove('disabled');
    });
    
    updateStatus('Recreate the pattern!', 'default');
    submitBtn.disabled = false;
}

// Handle cell click
function handleCellClick(index) {
    if (!gameState.isPlaying || gameState.isMemorizing) return;
    
    const cell = document.querySelectorAll('.grid-cell')[index];
    
    if (gameState.userSelection.includes(index)) {
        // Deselect
        gameState.userSelection = gameState.userSelection.filter(i => i !== index);
        cell.classList.remove('selected');
    } else {
        // Select
        gameState.userSelection.push(index);
        cell.classList.add('selected');
    }
}

// Check user's answer
function checkAnswer() {
    if (!gameState.isPlaying) return;
    
    const cells = document.querySelectorAll('.grid-cell');
    cells.forEach(cell => cell.classList.add('disabled'));
    
    // Check if pattern matches
    const correct = arraysEqual(
        gameState.pattern.sort((a, b) => a - b),
        gameState.userSelection.sort((a, b) => a - b)
    );
    
    if (correct) {
        // Correct answer
        gameState.score += gameState.level * 10;
        
        // Show correct cells
        gameState.pattern.forEach(index => {
            cells[index].classList.add('correct');
        });
        
        updateStatus(`Perfect! +${gameState.level * 10} points`, 'success');
        
        // Level up
        gameState.level++;
        
        // Increase grid size every 5 levels
        if (gameState.level % 5 === 0 && gameState.gridSize < 6) {
            gameState.gridSize++;
            createGrid();
        }
        
        // Update best score
        if (gameState.score > gameState.bestScore) {
            gameState.bestScore = gameState.score;
            saveBestScore();
        }
        
        updateDisplay();
        
        setTimeout(() => {
            startBtn.disabled = false;
            submitBtn.disabled = true;
            gameState.isPlaying = false;
            updateStatus('Ready for next level? Click START!', 'default');
        }, 2000);
        
    } else {
        // Wrong answer - show mistakes
        gameState.pattern.forEach(index => {
            if (gameState.userSelection.includes(index)) {
                cells[index].classList.add('correct');
            } else {
                cells[index].classList.add('incorrect');
            }
        });
        
        gameState.userSelection.forEach(index => {
            if (!gameState.pattern.includes(index)) {
                cells[index].classList.add('incorrect');
            }
        });
        
        updateStatus(`Game Over! Final Score: ${gameState.score}`, 'error');
        
        setTimeout(() => {
            resetGame();
        }, 3000);
    }
}

// Reset game
function resetGame() {
    gameState.level = 1;
    gameState.score = 0;
    gameState.pattern = [];
    gameState.userSelection = [];
    gameState.isPlaying = false;
    gameState.isMemorizing = false;
    gameState.gridSize = 4;
    
    createGrid();
    updateDisplay();
    updateStatus('Click START to begin!', 'default');
    
    startBtn.disabled = false;
    submitBtn.disabled = true;
}

// Update display
function updateDisplay() {
    levelDisplay.textContent = gameState.level;
    scoreDisplay.textContent = gameState.score;
    bestDisplay.textContent = gameState.bestScore;
}

// Update status message
function updateStatus(message, type) {
    gameStatus.textContent = message;
    gameStatus.className = 'game-status';
    
    if (type === 'success') {
        gameStatus.classList.add('success');
    } else if (type === 'error') {
        gameStatus.classList.add('error');
    }
}

// Helper: Compare arrays
function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false;
    }
    return true;
}

// Helper: Sleep function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Initialize game on page load
init();
