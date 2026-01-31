const gameContainer = document.getElementById("game");
let score = 0;
let highScore = 0;

generateSquares();

function generateSquares() {
  gameContainer.innerHTML = "";
  
  const similarHue = Math.floor(Math.random() * 360);
  
  const similarSaturation = Math.floor(Math.random() * 21) + 80;
  const similarLightness = Math.floor(Math.random() * 21) + 40;
  
  const differentSaturation = Math.floor(Math.random() * 21) + 80;
  const differentLightness = Math.floor(Math.random() * 21) + 40;
  
  const squares = [];
  for (let i = 0; i < 5; i++) {
    const square = document.createElement("div");
    square.classList.add("square");
    
    square.style.backgroundColor = `hsl(${similarHue}, ${similarSaturation}%, ${similarLightness}%)`;
    
    square.addEventListener("click", handleWrong);
    square.addEventListener("click", () => {
      differentSquare.style.outline = '5px solid hsl(0, 0%, 85%)';
    });
    squares.push(square);
  }
  
  const differentSquare = document.createElement("div");
  differentSquare.classList.add("square");
  
  differentSquare.style.backgroundColor = `hsl(${similarHue}, ${differentSaturation}%, ${differentLightness}%)`;
  
  differentSquare.addEventListener("click", handleCorrect);
  squares.push(differentSquare);
  
  shuffleArray(squares);
  
  squares.forEach((square) => {
    gameContainer.appendChild(square);
  });
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function tryAgain() {
  const tryAgainButton = document.getElementById("try-again");
  tryAgainButton.style.display = "block";
  tryAgainButton.innerHTML = `Try Again`;
  tryAgainButton.addEventListener("click", () => {
    generateSquares();
    score = 0;
    const scoreDisplay = document.getElementById("score");
    scoreDisplay.innerHTML = `Your Score: <b>${score}</b>`;
    game.style.pointerEvents = "auto";
    tryAgainButton.innerHTML = ``;
    tryAgainButton.style.display = "none";
  })
}

function handleCorrect() {
  score++;
  const scoreDisplay = document.getElementById("score");
  scoreDisplay.innerHTML = `Your Score: <b>${score}</b>`;
  generateSquares();
}


function handleWrong() {
  const game = document.getElementById("game");
  game.style.pointerEvents = "none";
  const scoreDisplay = document.getElementById("score");
  let message = `Oh no! Game over :(<br>Last Score: <b>${score}</b>`;
  
  if (score > highScore) {
    highScore = score;
    message = `Good job! New High Score: <b>${highScore}</b>`;
  } else {
    message += `<br>Highest Score: <b>${highScore}</b>`;
  }
  
  if (score > 4) {
    message += `<br><br>Don't forget to share your score with others!`;
  }
  
  scoreDisplay.innerHTML = message;
  tryAgain();
}


