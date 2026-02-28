let score = 0;
let level = 1;
let highScore = 0;
let currentQuestion = {};
let timer;
let timeLeft = 100;

const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const submitBtn = document.getElementById('submitBtn');
const answerInput = document.getElementById('answerInput');
const questionEl = document.getElementById('question');
const feedbackEl = document.getElementById('feedback');
const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const highScoreEl = document.getElementById('highScore');
const timerFill = document.getElementById('timerFill');
const finalScoreEl = document.getElementById('finalScore');
const finalLevelEl = document.getElementById('finalLevel');
const newHighScoreEl = document.getElementById('newHighScore');

function init() {
    highScore = localStorage.getItem('mathGameHighScore') || 0;
    highScoreEl.textContent = highScore;
}

function startGame() {
    score = 0;
    level = 1;
    updateStats();
    startScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    generateQuestion();
}

function generateQuestion() {
    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback';
    answerInput.value = '';
    answerInput.focus();

    const operations = ['+', '-', '×', '÷'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1, num2, answer;
    const maxNum = 10 + (level * 5);

    switch(operation) {
        case '+':
            num1 = Math.floor(Math.random() * maxNum) + 1;
            num2 = Math.floor(Math.random() * maxNum) + 1;
            answer = num1 + num2;
            break;
        case '-':
            num1 = Math.floor(Math.random() * maxNum) + 1;
            num2 = Math.floor(Math.random() * num1) + 1;
            answer = num1 - num2;
            break;
        case '×':
            num1 = Math.floor(Math.random() * (5 + level)) + 1;
            num2 = Math.floor(Math.random() * (5 + level)) + 1;
            answer = num1 * num2;
            break;
        case '÷':
            num2 = Math.floor(Math.random() * 10) + 1;
            answer = Math.floor(Math.random() * 10) + 1;
            num1 = num2 * answer;
            break;
    }

    currentQuestion = {
        num1,
        num2,
        operation,
        answer
    };

    questionEl.textContent = `${num1} ${operation} ${num2} = ?`;
    
    startTimer();
}

function startTimer() {
    timeLeft = 100;
    timerFill.style.width = '100%';
    clearInterval(timer);
    
    timer = setInterval(() => {
        timeLeft -= 1;
        timerFill.style.width = timeLeft + '%';
        
        if(timeLeft <= 0) {
            clearInterval(timer);
            showFeedback(false);
            setTimeout(() => {
                endGame();
            }, 1500);
        }
    }, 100);
}

function checkAnswer() {
    const userAnswer = parseInt(answerInput.value);
    
    if(isNaN(userAnswer)) {
        return;
    }

    clearInterval(timer);

    if(userAnswer === currentQuestion.answer) {
        score += (10 * level) + Math.floor(timeLeft / 10);
        showFeedback(true);
        
        if(score % 100 === 0 && score !== 0) {
            level++;
        }
        
        updateStats();
        
        setTimeout(() => {
            generateQuestion();
        }, 1000);
    } else {
        showFeedback(false);
        setTimeout(() => {
            endGame();
        }, 1500);
    }
}

function showFeedback(isCorrect) {
    if(isCorrect) {
        feedbackEl.textContent = '✅ Correct!';
        feedbackEl.className = 'feedback correct';
    } else {
        feedbackEl.textContent = `❌ Wrong! The answer was: ${currentQuestion.answer}`;
        feedbackEl.className = 'feedback incorrect';
    }
}

function updateStats() {
    scoreEl.textContent = score;
    levelEl.textContent = level;
}

function endGame() {
    clearInterval(timer);
    gameScreen.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
    
    finalScoreEl.textContent = score;
    finalLevelEl.textContent = level;
    
    if(score > highScore) {
        highScore = score;
        localStorage.setItem('mathGameHighScore', highScore);
        highScoreEl.textContent = highScore;
        newHighScoreEl.classList.remove('hidden');
    } else {
        newHighScoreEl.classList.add('hidden');
    }
}

function restartGame() {
    gameOverScreen.classList.add('hidden');
    startGame();
}

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', restartGame);
submitBtn.addEventListener('click', checkAnswer);
answerInput.addEventListener('keypress', (e) => {
    if(e.key === 'Enter') {
        checkAnswer();
    }
});

init();
