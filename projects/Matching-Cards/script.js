// Game state
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let timerInterval = null;
let seconds = 0;
let isProcessing = false;

// Card symbols (emojis)
const symbols = ['🎮', '🎨', '🎭', '🎪', '🎸', '🎲', '🎯', '🎺'];

// DOM elements
const gameBoard = document.getElementById('game-board');
const movesDisplay = document.getElementById('moves');
const timerDisplay = document.getElementById('timer');
const matchesDisplay = document.getElementById('matches');
const restartBtn = document.getElementById('restart-btn');
const winModal = document.getElementById('win-modal');
const playAgainBtn = document.getElementById('play-again-btn');
const finalStats = document.getElementById('final-stats');

// Initialize game
function initGame() {
    // Reset game state
    cards = [];
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    seconds = 0;
    isProcessing = false;

    // Update displays
    movesDisplay.textContent = '0';
    timerDisplay.textContent = '0:00';
    matchesDisplay.textContent = '0/8';
    winModal.classList.remove('show');

    // Clear timer
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    // Create card pairs
    const cardPairs = [...symbols, ...symbols];
    
    // Shuffle cards
    cards = shuffleArray(cardPairs);

    // Create card elements
    renderCards();
}

// Shuffle array using Fisher-Yates algorithm
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Render cards on the board
function renderCards() {
    gameBoard.innerHTML = '';
    
    cards.forEach((symbol, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.index = index;
        card.dataset.symbol = symbol;

        card.innerHTML = `
            <div class="card-front">${symbol}</div>
            <div class="card-back">?</div>
        `;

        card.addEventListener('click', handleCardClick);
        gameBoard.appendChild(card);
    });
}

// Handle card click
function handleCardClick(e) {
    if (isProcessing) return;

    const card = e.currentTarget;
    
    // Don't flip if already flipped or matched
    if (card.classList.contains('flipped') || card.classList.contains('matched')) {
        return;
    }

    // Start timer on first move
    if (moves === 0) {
        startTimer();
    }

    // Flip the card
    card.classList.add('flipped');
    flippedCards.push(card);

    // Check if two cards are flipped
    if (flippedCards.length === 2) {
        isProcessing = true;
        moves++;
        movesDisplay.textContent = moves;
        checkMatch();
    }
}

// Check if flipped cards match
function checkMatch() {
    const [card1, card2] = flippedCards;
    const symbol1 = card1.dataset.symbol;
    const symbol2 = card2.dataset.symbol;

    if (symbol1 === symbol2) {
        // Match found
        setTimeout(() => {
            card1.classList.add('matched');
            card2.classList.add('matched');
            matchedPairs++;
            matchesDisplay.textContent = `${matchedPairs}/8`;
            
            flippedCards = [];
            isProcessing = false;

            // Check if game is won
            if (matchedPairs === 8) {
                setTimeout(showWinModal, 500);
            }
        }, 600);
    } else {
        // No match
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            flippedCards = [];
            isProcessing = false;
        }, 1000);
    }
}

// Start timer
function startTimer() {
    timerInterval = setInterval(() => {
        seconds++;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        timerDisplay.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
    }, 1000);
}

// Show win modal
function showWinModal() {
    clearInterval(timerInterval);
    
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const timeString = mins > 0 
        ? `${mins} minute${mins > 1 ? 's' : ''} and ${secs} second${secs !== 1 ? 's' : ''}`
        : `${secs} second${secs !== 1 ? 's' : ''}`;
    
    finalStats.textContent = `Moves: ${moves} | Time: ${timeString}`;
    winModal.classList.add('show');
}

// Event listeners
restartBtn.addEventListener('click', initGame);
playAgainBtn.addEventListener('click', initGame);

// Start the game when page loads
initGame();