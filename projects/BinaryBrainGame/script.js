// Game variables
let secretNumber;
let min = 1;
let max = 100;
let userGuesses = 0;
let binarySteps = 0;
let gameActive = true;

// DOM elements
const guessInput = document.getElementById('guess-input');
const guessBtn = document.getElementById('guess-btn');
const hintBtn = document.getElementById('hint-btn');
const newGameBtn = document.getElementById('new-game-btn');
const gameLog = document.getElementById('game-log');
const minValue = document.getElementById('min-value');
const maxValue = document.getElementById('max-value');
const rangeFill = document.getElementById('range-fill');
const currentMin = document.getElementById('current-min');
const currentMid = document.getElementById('current-mid');
const currentMax = document.getElementById('current-max');
const userGuessesElement = document.getElementById('user-guesses');
const binaryStepsElement = document.getElementById('binary-steps');
const remainingElement = document.getElementById('remaining');
const nextGuessElement = document.getElementById('next-guess');

// Initialize game
function initGame() {
    secretNumber = Math.floor(Math.random() * 100) + 1;
    min = 1;
    max = 100;
    userGuesses = 0;
    binarySteps = 0;
    gameActive = true;
    
    updateDisplay();
    updateRangeBar();
    
    // Clear log
    gameLog.innerHTML = `
        <div class="log-message system">
            <i class="fas fa-robot"></i> I'm thinking of a number between 1 and 100. Try to guess it!
        </div>
    `;
    
    addLogMessage("New game started!", "system");
}

// Update all displays
function updateDisplay() {
    minValue.textContent = min;
    maxValue.textContent = max;
    currentMin.textContent = min;
    currentMax.textContent = max;
    
    const middle = Math.floor((min + max) / 2);
    currentMid.textContent = middle;
    nextGuessElement.textContent = middle;
    
    userGuessesElement.textContent = userGuesses;
    binaryStepsElement.textContent = binarySteps;
    
    const remaining = max - min + 1;
    remainingElement.textContent = remaining;
}

// Update the visual range bar
function updateRangeBar() {
    const percentage = ((max - min + 1) / 100) * 100;
    const startPos = ((min - 1) / 100) * 100;
    
    rangeFill.style.width = `${percentage}%`;
    rangeFill.style.left = `${startPos}%`;
}

// Add message to log
function addLogMessage(text, type) {
    const message = document.createElement('div');
    message.className = `log-message ${type}`;
    
    let icon = 'fas fa-info-circle';
    if (type === 'user') icon = 'fas fa-user';
    if (type === 'computer') icon = 'fas fa-robot';
    if (type === 'system') icon = 'fas fa-gamepad';
    
    message.innerHTML = `<i class="${icon}"></i> ${text}`;
    gameLog.appendChild(message);
    
    // Scroll to bottom
    gameLog.scrollTop = gameLog.scrollHeight;
}

// Handle user guess
function handleGuess() {
    if (!gameActive) {
        addLogMessage("Game over! Start a new game.", "system");
        return;
    }
    
    const guess = parseInt(guessInput.value);
    
    // Validate input
    if (isNaN(guess) || guess < 1 || guess > 100) {
        addLogMessage("Please enter a number between 1 and 100!", "system");
        guessInput.value = '';
        guessInput.focus();
        return;
    }
    
    userGuesses++;
    updateDisplay();
    
    // Check guess
    if (guess === secretNumber) {
        addLogMessage(`🎉 Correct! You found ${secretNumber} in ${userGuesses} guesses!`, "user");
        addLogMessage(`Binary search would find it in ${binarySteps} steps.`, "computer");
        gameActive = false;
    } else if (guess < secretNumber) {
        addLogMessage(`Your guess ${guess} is too LOW`, "user");
        
        // Update binary search range
        if (guess >= min) {
            min = guess + 1;
            binarySteps++;
            updateRangeBar();
            addLogMessage(`Binary search removes numbers ${guess} and below`, "computer");
        }
    } else {
        addLogMessage(`Your guess ${guess} is too HIGH`, "user");
        
        // Update binary search range
        if (guess <= max) {
            max = guess - 1;
            binarySteps++;
            updateRangeBar();
            addLogMessage(`Binary search removes numbers ${guess} and above`, "computer");
        }
    }
    
    guessInput.value = '';
    guessInput.focus();
    updateDisplay();
}

// Give hint
function giveHint() {
    if (!gameActive) {
        addLogMessage("Start a new game first!", "system");
        return;
    }
    
    const middle = Math.floor((min + max) / 2);
    
    if (middle === secretNumber) {
        addLogMessage(`Binary search found it! The number is ${secretNumber}!`, "computer");
        gameActive = false;
    } else if (middle < secretNumber) {
        addLogMessage(`Binary search hint: ${middle} is too LOW`, "computer");
        min = middle + 1;
        binarySteps++;
    } else {
        addLogMessage(`Binary search hint: ${middle} is too HIGH`, "computer");
        max = middle - 1;
        binarySteps++;
    }
    
    updateDisplay();
    updateRangeBar();
}

// Event Listeners
guessBtn.addEventListener('click', handleGuess);
hintBtn.addEventListener('click', giveHint);
newGameBtn.addEventListener('click', initGame);

// Allow Enter key to submit guess
guessInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        handleGuess();
    }
});

// Initialize game on load
window.addEventListener('DOMContentLoaded', initGame);