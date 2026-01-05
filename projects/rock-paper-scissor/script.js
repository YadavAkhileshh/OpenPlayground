const choices = ["rock", "paper", "scissors"];

const clickSound = new Audio("sounds/click.mp3");
const winSound = new Audio("sounds/win.mp3");
const loseSound = new Audio("sounds/lose.mp3");
const drawSound = new Audio("sounds/draw.mp3");

let userScore = Number(localStorage.getItem("userScore")) || 0;
let botScore = Number(localStorage.getItem("botScore")) || 0;

let player1Choice = "";

const resultText = document.getElementById("result");
const userScoreText = document.getElementById("userScore");
const botScoreText = document.getElementById("botScore");
const gameBox = document.querySelector(".game-container");
const botLabel = document.getElementById("botLabel");

userScoreText.innerText = userScore;
botScoreText.innerText = botScore;

function play(choice) {
  clickSound.play();
  gameBox.classList.remove("win", "lose");

  const mode = document.getElementById("mode").value;
  botLabel.innerHTML = mode === "bot" ? "Bot: <span id='botScore'>" + botScore + "</span>" : "Player 2: <span id='botScore'>" + botScore + "</span>";

  if (mode === "bot") {
    playBot(choice);
  } else {
    playFriend(choice);
  }
}

function playBot(userChoice) {
  const botChoice = choices[Math.floor(Math.random() * choices.length)];
  decideWinner(userChoice, botChoice, true);
}

function playFriend(choice) {
  if (!player1Choice) {
    player1Choice = choice;
    resultText.innerText = "Player 2, make your choice!";
  } else {
    decideWinner(player1Choice, choice, false);
    player1Choice = "";
  }
}

function decideWinner(choice1, choice2, isBot) {
  if (choice1 === choice2) {
    resultText.innerText = `🤝 Draw! Both chose ${choice1}`;
    drawSound.play();
    return;
  }

  const userWins =
    (choice1 === "rock" && choice2 === "scissors") ||
    (choice1 === "paper" && choice2 === "rock") ||
    (choice1 === "scissors" && choice2 === "paper");

  if (userWins) {
    resultText.innerText = `✅ ${choice1} beats ${choice2}`;
    userScore++;
    winSound.play();
    gameBox.classList.add("win");
  } else {
    resultText.innerText = `❌ ${choice2} beats ${choice1}`;
    botScore++;
    loseSound.play();
    gameBox.classList.add("lose");
  }

  userScoreText.innerText = userScore;
  botScoreText.innerText = botScore;

  localStorage.setItem("userScore", userScore);
  localStorage.setItem("botScore", botScore);
}

function resetGame() {
  userScore = 0;
  botScore = 0;
  localStorage.clear();
  userScoreText.innerText = 0;
  botScoreText.innerText = 0;
  resultText.innerText = "";
  player1Choice = "";
}
