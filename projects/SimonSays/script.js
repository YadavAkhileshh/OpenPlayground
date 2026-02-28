const buttons = ["green", "red", "yellow", "blue"];
let sequence = [];
let userSequence = [];
let score = 0;
let highScore = localStorage.getItem("simonHighScore") || 0;
let playing = false;

document.getElementById("highScore").innerText = highScore;
const gameContainer = document.getElementById("gameContainer");
const restartBtn = document.getElementById("restartBtn");
const startBtn = document.getElementById("startBtn");

const playSound = () => {
  const audio = new Audio(`https://actions.google.com/sounds/v1/cartoon/poof.ogg`);
  audio.volume = 0.3;
  audio.play();
};

const flashButton = (color) => {
  const btn = document.getElementById(color);
  btn.classList.add("active");
  playSound();
  setTimeout(() => btn.classList.remove("active"), 300);
};

const startGame = () => {
  playing = true;
  sequence = [];
  userSequence = [];
  score = 0;
  updateScore();
  restartBtn.classList.add("hidden");
  nextRound();
};

const restartGame = () => startGame();

const nextRound = () => {
  userSequence = [];
  sequence.push(buttons[Math.floor(Math.random() * 4)]);

  sequence.forEach((c, i) => {
    setTimeout(() => flashButton(c), i * 600);
  });
};

const handleUserClick = (color) => {
  if (!playing) return;

  userSequence.push(color);
  flashButton(color);

  if (userSequence[userSequence.length - 1] !== sequence[userSequence.length - 1]) {
    gameOver();
    return;
  }

  if (userSequence.length === sequence.length) {
    score++;
    updateScore();
    setTimeout(nextRound, 800);
  }
};

const updateScore = () => {
  document.getElementById("score").innerText = score;
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("simonHighScore", highScore);
    document.getElementById("highScore").innerText = highScore;
  }
};

const gameOver = () => {
  playing = false;
  gameContainer.classList.add("blink");

  setTimeout(() => gameContainer.classList.remove("blink"), 1500);

  restartBtn.classList.remove("hidden");
};

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", restartGame);

buttons.forEach(color => {
  document.getElementById(color).addEventListener("click", () => handleUserClick(color));
});
