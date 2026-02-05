// Game variables
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let score = 0;
let timer = 0;
let timerInterval;
let gameStarted = false;
let gridSize = 4; // Default to 4x4
let totalPairs;

// Themes
const themes = {
    animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦗', '🕷️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊️', '🐇', '🦝', '🦨', '🦡', '🦦', '🦥', '🐁', '🐀', '🐿️', '🦔'],
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾']
};

// DOM elements
const gameBoard = document.getElementById('game-board');
const timerDisplay = document.getElementById('timer');
const movesDisplay = document.getElementById('moves');
const scoreDisplay = document.getElementById('score');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const levelSelect = document.getElementById('level-select');
const messageDisplay = document.getElementById('message');

// Event listeners
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', restartGame);
levelSelect.addEventListener('change', updateGridSize);

// Initialize game
function initGame() {
    gridSize = parseInt(levelSelect.value);
    totalPairs = (gridSize * gridSize) / 2;
    cards = [];
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    score = 0;
    timer = 0;
    gameStarted = false;
    updateDisplays();
    createCards();
    shuffleCards();
    renderCards();
}

// Create cards
function createCards() {
    const theme = 'animals'; // Default theme, can be changed
    const symbols = themes[theme].slice(0, totalPairs);
    const cardSymbols = [...symbols, ...symbols]; // Duplicate for pairs
    cards = cardSymbols.map(symbol => ({
        symbol,
        flipped: false,
        matched: false
    }));
}

// Shuffle cards
function shuffleCards() {
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
}

// Render cards
function renderCards() {
    gameBoard.innerHTML = '';
    gameBoard.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.dataset.index = index;
        cardElement.innerHTML = `
            <div class="card-front">?</div>
            <div class="card-back">${card.symbol}</div>
        `;
        cardElement.addEventListener('click', () => flipCard(index));
        gameBoard.appendChild(cardElement);
    });
}

// Flip card
function flipCard(index) {
    if (!gameStarted) return;
    const card = cards[index];
    if (card.flipped || card.matched || flippedCards.length >= 2) return;

    card.flipped = true;
    flippedCards.push(index);
    updateCardDisplay(index);

    if (flippedCards.length === 2) {
        moves++;
        updateDisplays();
        setTimeout(checkMatch, 1000);
    }
}

// Update card display
function updateCardDisplay(index) {
    const cardElement = gameBoard.children[index];
    if (cards[index].flipped || cards[index].matched) {
        cardElement.classList.add('flipped');
    } else {
        cardElement.classList.remove('flipped');
    }
}

// Check for match
function checkMatch() {
    const [index1, index2] = flippedCards;
    const card1 = cards[index1];
    const card2 = cards[index2];

    if (card1.symbol === card2.symbol) {
        card1.matched = true;
        card2.matched = true;
        matchedPairs++;
        score += 10;
        playSound('match');
        if (matchedPairs === totalPairs) {
            endGame(true);
        }
    } else {
        card1.flipped = false;
        card2.flipped = false;
        updateCardDisplay(index1);
        updateCardDisplay(index2);
        playSound('no-match');
    }

    flippedCards = [];
    updateDisplays();
}

// Update displays
function updateDisplays() {
    movesDisplay.textContent = moves;
    scoreDisplay.textContent = score;
    timerDisplay.textContent = formatTime(timer);
}

// Format time
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Start game
function startGame() {
    initGame();
    gameStarted = true;
    startBtn.disabled = true;
    restartBtn.disabled = false;
    levelSelect.disabled = true;
    timerInterval = setInterval(() => {
        timer++;
        updateDisplays();
    }, 1000);
    messageDisplay.textContent = '';
}

// Restart game
function restartGame() {
    clearInterval(timerInterval);
    startGame();
}

// End game
function endGame(won) {
    clearInterval(timerInterval);
    gameStarted = false;
    startBtn.disabled = false;
    restartBtn.disabled = false;
    levelSelect.disabled = false;
    if (won) {
        const finalScore = score - Math.floor(timer / 10) - moves;
        messageDisplay.textContent = `Congratulations! You won in ${formatTime(timer)} with ${moves} moves. Final score: ${Math.max(finalScore, 0)}`;
        playSound('win');
    } else {
        messageDisplay.textContent = 'Time\'s up! Try again.';
        playSound('lose');
    }
}

// Update grid size
function updateGridSize() {
    if (!gameStarted) {
        gridSize = parseInt(levelSelect.value);
        initGame();
    }
}

// Play sound (placeholder for sound effects)
function playSound(type) {
    // Placeholder for sound effects
    // You can add actual sound files and play them here
    console.log(`Playing ${type} sound`);
}

// Initialize on load
initGame();
