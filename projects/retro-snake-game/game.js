const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const gameOverElement = document.getElementById('gameOver');

const gridSize = 20;
const cellSize = canvas.width / gridSize;

let snake = [
    {x: 10, y: 10}
];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameRunning = false;
let gameLoop;

highScoreElement.textContent = highScore;

function generateFood() {
    do {
        food = {
            x: Math.floor(Math.random() * gridSize),
            y: Math.floor(Math.random() * gridSize)
        };
    } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#4CAF50';
    snake.forEach((segment, index) => {
        if (index === 0) {
            ctx.fillStyle = '#8BC34A';
        } else {
            ctx.fillStyle = '#4CAF50';
        }
        ctx.fillRect(segment.x * cellSize, segment.y * cellSize, cellSize - 2, cellSize - 2);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
    });
    
    ctx.fillStyle = '#FF5722';
    ctx.beginPath();
    ctx.arc(food.x * cellSize + cellSize/2, food.y * cellSize + cellSize/2, cellSize/2 - 2, 0, Math.PI * 2);
    ctx.fill();
}

function move() {
    direction = nextDirection;
    
    const head = {...snake[0]};
    
    switch(direction) {
        case 'right': head.x++; break;
        case 'left': head.x--; break;
        case 'up': head.y--; break;
        case 'down': head.y++; break;
    }
    
    if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
        gameOver();
        return;
    }
    
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }
    
    snake.unshift(head);
    
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        generateFood();
    } else {
        snake.pop();
    }
}

function gameOver() {
    gameRunning = false;
    clearInterval(gameLoop);
    gameOverElement.textContent = 'Game Over! Press New Game to play again';
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        highScoreElement.textContent = highScore;
    }
}

function reset() {
    snake = [{x: 10, y: 10}];
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    scoreElement.textContent = score;
    gameOverElement.textContent = '';
    generateFood();
    
    if (gameRunning) {
        clearInterval(gameLoop);
    }
    
    gameRunning = true;
    gameLoop = setInterval(() => {
        move();
        draw();
    }, 150);
}

document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    
    const key = e.key.replace('Arrow', '').toLowerCase();
    
    if ((key === 'up' && direction !== 'down') ||
        (key === 'down' && direction !== 'up') ||
        (key === 'left' && direction !== 'right') ||
        (key === 'right' && direction !== 'left')) {
        nextDirection = key;
    }
});

document.getElementById('restartBtn').addEventListener('click', reset);

generateFood();
reset();