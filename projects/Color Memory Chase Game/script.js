const boxes = document.querySelectorAll('.color-box');
const startBtn = document.getElementById('startBtn');
const levelDisplay = document.getElementById('level');
const scoreDisplay = document.getElementById('score');
const messageDisplay = document.getElementById('message');

let sequence = [];
let playerSequence = [];
let level = 1;
let score = 0;
let isPlaying = false;
let isShowingSequence = false;

const colors = ['red', 'blue', 'green', 'yellow'];

startBtn.addEventListener('click', startGame);

boxes.forEach(box => {
    box.addEventListener('click', handleBoxClick);
});

function startGame() {
    sequence = [];
    playerSequence = [];
    level = 1;
    score = 0;
    isPlaying = true;
    updateDisplay();
    startBtn.disabled = true;
    messageDisplay.innerHTML = '<span class="watching">Watch carefully!</span>';
    nextLevel();
}

function nextLevel() {
    playerSequence = [];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    sequence.push(randomColor);
    showSequence();
}

async function showSequence() {
    isShowingSequence = true;
    disableBoxes();

    for (let i = 0; i < sequence.length; i++) {
        await sleep(600);
        await flashBox(sequence[i]);
    }

    isShowingSequence = false;
    enableBoxes();
    messageDisplay.textContent = 'Your turn! Repeat the sequence.';
}

function flashBox(color) {
    return new Promise(resolve => {
        const box = document.querySelector(`[data-color="${color}"]`);
        box.classList.add('active');
        
        setTimeout(() => {
            box.classList.remove('active');
            resolve();
        }, 400);
    });
}

function handleBoxClick(e) {
    if (!isPlaying || isShowingSequence) return;

    const clickedColor = e.target.dataset.color;
    playerSequence.push(clickedColor);

    flashBox(clickedColor);

    checkSequence();
}

function checkSequence() {
    const currentIndex = playerSequence.length - 1;

    if (playerSequence[currentIndex] !== sequence[currentIndex]) {
        gameOver();
        return;
    }

    if (playerSequence.length === sequence.length) {
        score += level * 10;
        level++;
        updateDisplay();
        messageDisplay.innerHTML = '<span class="watching">Great! Next level coming...</span>';
        
        setTimeout(() => {
            nextLevel();
        }, 1500);
    }
}

function gameOver() {
    isPlaying = false;
    messageDisplay.innerHTML = '<span class="game-over">Game Over! Try Again!</span>';
    startBtn.disabled = false;
    startBtn.textContent = 'Play Again';
    disableBoxes();
}

function disableBoxes() {
    boxes.forEach(box => box.style.pointerEvents = 'none');
}

function enableBoxes() {
    boxes.forEach(box => box.style.pointerEvents = 'auto');
}

function updateDisplay() {
    levelDisplay.textContent = level;
    scoreDisplay.textContent = score;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}